const fs = require('fs');
const path = require('path');
const Module = require('module');

const bundledModules = process.env.CODEX_NODE_MODULES
  || 'C:\\Users\\10524\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules';
const bundledPnpmModules = path.join(bundledModules, '.pnpm', 'node_modules');
const bundledPlaywrightModules = path.join(bundledModules, '.pnpm', 'playwright@1.59.1', 'node_modules');
process.env.NODE_PATH = [bundledModules, bundledPnpmModules, bundledPlaywrightModules, process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
Module._initPaths();

const { chromium } = require('playwright');

const previewUrl = process.env.LOGISTICS_PREVIEW_URL
  || `https://kylee94.github.io/logistics-gate6-preview/?qa=${Date.now()}`;
const outDir = path.join(process.cwd(), 'qa-artifacts', 'logistics-gate6', 'chatbot-sidebar-browser-qa-20260518');
fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const result = {
    generated_at: new Date().toISOString(),
    previewUrl,
    screenshots: {},
    responses: [],
    checks: {},
    consoleErrors: [],
    pageErrors: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  page.on('console', (message) => {
    if (message.type() === 'error') result.consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => result.pageErrors.push(error.message));
  page.on('response', async (response) => {
    if (!response.url().includes('/functions/v1/ll-dashboard-api')) return;
    let action = null;
    let responsePreview = null;
    let parsedBody = null;
    try {
      const body = response.request().postDataJSON();
      action = body?.action || null;
    } catch {
      action = null;
    }
    if (action?.startsWith('ai/')) {
      try {
        responsePreview = await response.text();
        parsedBody = JSON.parse(responsePreview);
        responsePreview = responsePreview.slice(0, 1200);
      } catch {
        responsePreview = null;
      }
    }
    result.responses.push({
      action,
      status: response.status(),
      ok: response.ok(),
      cors: response.headers()['access-control-allow-origin'] || null,
      responsePreview,
      scope: parsedBody?.scope || null,
      evidence: Array.isArray(parsedBody?.evidence) ? parsedBody.evidence.slice(0, 4) : [],
    });
  });

  await page.goto(previewUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await page.locator('body').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1500);

  result.screenshots.initial = path.join(outDir, 'initial.png');
  await page.screenshot({ path: result.screenshots.initial, fullPage: true });

  const bodyBefore = await page.locator('body').innerText();
  result.checks.mainSearchStillExists = bodyBefore.includes('통합 검색');
  result.checks.mainSearchNoAiAnswerButton = !bodyBefore.includes('AI 답변');
  result.checks.mainSearchNoPersistentGeminiPanel = !bodyBefore.includes('Gemini OK');

  await page.locator('[data-testid="logistics-main-search-input"]').fill('인천 석남 쿠팡 물류센터');
  await page.waitForTimeout(500);
  const searchBody = await page.locator('body').innerText();
  result.checks.mainSearchFindsIncheonSeoknamCoupang = searchBody.includes('인천석남물류센터');

  await page.locator('[data-testid="logistics-ai-dock-open"]').click();
  await page.waitForFunction(() => {
    const dock = document.querySelector('[data-testid="logistics-ai-dock"]');
    if (!dock) return false;
    return dock.getBoundingClientRect().left < window.innerWidth;
  }, null, { timeout: 10000 });

  result.screenshots.chatbot_open = path.join(outDir, 'chatbot-open.png');
  await page.screenshot({ path: result.screenshots.chatbot_open, fullPage: true });

  const dockText = await page.locator('[data-testid="logistics-ai-dock"]').innerText();
  result.checks.chatbotDockOpens = dockText.includes('물류센터 AI 챗봇') && dockText.includes('읽기 권한 범위 내 데이터 기준');

  await page.locator('[data-testid="logistics-ai-diagnostics"]').click();
  const toast = page.locator('[data-testid="logistics-ai-toast"]');
  await toast.waitFor({ state: 'visible', timeout: 15000 });
  const toastText = await toast.innerText();
  result.diagnosticsToastText = toastText;
  result.checks.diagnosticsToastAppears = toastText.includes('연결') && !toastText.includes('GOOGLE_AI_KEY') && !toastText.includes('quota exceeded');
  await page.waitForTimeout(2800);
  result.checks.diagnosticsToastDisappears = !(await page.locator('[data-testid="logistics-ai-toast"]').isVisible().catch(() => false));

  await page.locator('[data-testid="logistics-ai-input"]').fill('인천 석남 쿠팡 물류센터 알려줘');
  await page.locator('[data-testid="logistics-ai-submit"]').click();
  await page.waitForTimeout(12000);

  const bodyAfter = await page.locator('body').innerText();
  result.screenshots.chatbot_answer = path.join(outDir, 'chatbot-answer.png');
  await page.screenshot({ path: result.screenshots.chatbot_answer, fullPage: true });

  result.checks.userBubbleRendered = bodyAfter.includes('인천 석남 쿠팡 물류센터 알려줘');
  result.checks.assistantAnswerRendered = bodyAfter.includes('인천석남물류센터') || bodyAfter.includes('읽기 가능 자산 수');
  result.checks.supabaseAssetScopeCount17 = result.responses.some((item) => Number(item.scope?.readable_asset_count) === 17);
  result.checks.incheonSeoknamEvidenceRendered = bodyAfter.includes('인천석남물류센터');
  result.checks.noGreenInlineAnswerPanel = !bodyAfter.includes('Gemini 연결이 확인되었습니다') && !bodyAfter.includes('Gemini OK');
  result.checks.diagnosticsEdgeCalled = result.responses.some((item) => item.action === 'ai/provider-diagnostics' && item.status === 200)
    || result.responses.some((item) => item.action === 'ai/gemini-diagnostics' && item.status === 200);
  result.checks.chatEdgeCalled = result.responses.some((item) => item.action === 'ai/search-chat-demo' && item.status === 200)
    || result.responses.some((item) => item.action === 'ai/search-chat' && item.status === 200);
  result.checks.noDbEvidencePillsInChat = !bodyAfter.includes('ll_assets ·') && !bodyAfter.includes('ll_leasing_contracts ·');
  result.checks.noProviderDetailsInChat = !bodyAfter.includes('demo_provider_fallback') && !bodyAfter.includes('gemini-2.0-flash') && !bodyAfter.includes('llama-3.3-70b-versatile');
  result.checks.primaryNoLoginMay401 = result.responses.some((item) => item.action === 'ai/search-chat' && item.status === 401)
    || result.responses.some((item) => item.action === 'ai/search-chat' && item.status === 200)
    || result.responses.every((item) => item.action !== 'ai/search-chat');
  result.checks.noPageErrors = result.pageErrors.length === 0;
  result.checks.noBlockingConsoleErrors = result.consoleErrors.filter((text) => !text.includes('Failed to load resource')).length === 0;

  result.allPass = Object.values(result.checks).every(Boolean);
  fs.writeFileSync(path.join(outDir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(outDir, 'summary.md'), [
    '# Chatbot sidebar browser QA - 2026-05-18',
    '',
    `- previewUrl: ${previewUrl}`,
    `- allPass: ${result.allPass}`,
    '',
    '| check | status |',
    '|---|---|',
    ...Object.entries(result.checks).map(([key, value]) => `| ${key} | ${value ? 'pass' : 'fail'} |`),
    '',
    '## Edge responses',
    '',
    ...result.responses.map((item) => `- ${item.action || 'unknown'}: ${item.status}, cors=${item.cors || '-'}`),
    '',
    `- initial screenshot: ${result.screenshots.initial}`,
    `- chatbot open screenshot: ${result.screenshots.chatbot_open}`,
    `- chatbot answer screenshot: ${result.screenshots.chatbot_answer}`,
    '',
  ].join('\n'));

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  if (!result.allPass) process.exit(1);
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
