const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const BASE_PATH = '/logistics-gate6-preview/';
const DEFAULT_PORT = 4177;
const DEFAULT_EMAIL = 'kylee@igisam.com';
const OUT_DIR = path.join(ROOT, 'qa-artifacts', 'logistics-gate6', 'browser-visible-parity-20260521');
const OUT_JSON = path.join(OUT_DIR, 'browser-visible-parity-20260521.json');
const OUT_MD = path.join(OUT_DIR, 'browser-visible-parity-20260521.md');

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/u);
  return Object.fromEntries(lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const index = line.indexOf('=');
      const key = line.slice(0, index).trim();
      const raw = line.slice(index + 1).trim();
      return [key, raw.replace(/^['"]|['"]$/gu, '')];
    }));
}

const fileEnv = {
  ...readEnvFile(path.join(ROOT, '.env')),
  ...readEnvFile(path.join(ROOT, '.env.local')),
};

function envValue(...keys) {
  for (const key of keys) {
    if (process.env[key]) return process.env[key];
    if (fileEnv[key]) return fileEnv[key];
  }
  return '';
}

function argsValue(name, fallback = '') {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  return process.argv[index + 1] || fallback;
}

function requestUrl(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode }));
    });
    req.on('error', (error) => resolve({ ok: false, status: 0, error: error.message }));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve({ ok: false, status: 0, error: 'timeout' });
    });
  });
}

async function waitForServer(url, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await requestUrl(url);
    if (result.ok) return result;
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  throw new Error(`Preview server did not become ready: ${url}`);
}

function startPreviewServer(port) {
  const child = process.platform === 'win32'
    ? spawn('cmd.exe', ['/d', '/s', '/c', `npx vite preview --host 127.0.0.1 --port ${port} --strictPort`], {
      cwd: ROOT,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    : spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: ROOT,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
    });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });
  return { child, output: () => output };
}

function stopPreviewServer(preview) {
  if (!preview?.child?.pid) return;
  if (process.platform === 'win32') {
    spawnSync('taskkill.exe', ['/pid', String(preview.child.pid), '/t', '/f'], { stdio: 'ignore' });
    return;
  }
  preview.child.kill();
}

function chromeExecutablePath() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || undefined;
}

function markdownTable(headers, rows) {
  const escapeCell = (value) => String(value ?? '').replace(/\|/gu, '\\|').replace(/\r?\n/gu, '<br>');
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeCell).join(' | ')} |`),
  ].join('\n');
}

function normalizeActionFromPostData(postData) {
  if (!postData) return '';
  try {
    const body = JSON.parse(postData);
    return String(body?.action || '');
  } catch {
    return '';
  }
}

async function signInSession() {
  const supabaseUrl = envValue('LOGISTICS_SUPABASE_URL', 'VITE_SUPABASE_URL');
  const anonKey = envValue('LOGISTICS_SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
  const accessToken = envValue('LOGISTICS_SUPABASE_ACCESS_TOKEN');
  if (supabaseUrl && anonKey && accessToken) {
    const response = await fetch(`${supabaseUrl.replace(/\/$/u, '')}/auth/v1/user`, {
      headers: {
        apikey: anonKey,
        authorization: `Bearer ${accessToken}`,
      },
    });
    const user = await response.json().catch(() => null);
    if (!response.ok || !user?.id) {
      throw new Error(`Browser parity Supabase access token validation failed (${response.status}).`);
    }
    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.round(Date.now() / 1000) + 3600,
      refresh_token: '',
      user,
    };
  }
  const email = argsValue('email', envValue('LOGISTICS_SUPABASE_EMAIL', 'LOGISTICS_SUPABASE_AUTH_EMAIL'));
  const password = argsValue('password', envValue('LOGISTICS_SUPABASE_PASSWORD', 'LOGISTICS_SUPABASE_AUTH_PASSWORD'));
  if (!supabaseUrl || !anonKey || !email || !password) return null;
  const response = await fetch(`${supabaseUrl.replace(/\/$/u, '')}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.access_token) {
    throw new Error(`Browser parity Supabase login failed (${response.status}).`);
  }
  if (!body.expires_at && body.expires_in) body.expires_at = Math.round(Date.now() / 1000) + Number(body.expires_in);
  return body;
}

function contentTypeForAsset(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

async function runPageCheck(page, baseUrl, check) {
  const requests = [];
  const responses = [];
  const responseBodyPromises = [];
  const requestHandler = (request) => {
    if (!request.url().includes('/functions/v1/ll-dashboard-api')) return;
    requests.push({
      method: request.method(),
      url: request.url(),
      action: normalizeActionFromPostData(request.postData()),
    });
  };
  const responseHandler = (response) => {
    if (!response.url().includes('/functions/v1/ll-dashboard-api')) return;
    const row = {
      status: response.status(),
      url: response.url(),
      body_ok: undefined,
      body_message: '',
    };
    responses.push(row);
    responseBodyPromises.push(response.text()
      .then((text) => {
        const parsed = text ? JSON.parse(text) : null;
        row.body_ok = parsed?.ok;
        row.body_message = String(parsed?.message || parsed?.error || '').slice(0, 300);
      })
      .catch(() => {}));
  };
  page.on('request', requestHandler);
  page.on('response', responseHandler);
  const url = `${baseUrl}${check.route}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1200);
  let bodyText = await page.locator('body').innerText({ timeout: 15000 }).catch(() => '');
  if (bodyText.includes('@igisam.com 도메인의 회사 이메일 계정을 입력해주세요') || bodyText.includes('최초 접속 코드')) {
    await page.evaluate((email) => {
      sessionStorage.setItem('logistics_preview_auth', JSON.stringify({ email }));
      window.dispatchEvent(new Event('logistics-local-auth-changed'));
    }, DEFAULT_EMAIL);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('networkidle', { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(1200);
    bodyText = await page.locator('body').innerText({ timeout: 15000 }).catch(() => '');
  }
  const screenshotPath = path.join(OUT_DIR, `${check.id}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await Promise.allSettled(responseBodyPromises);
  const shadowDiffs = await page.evaluate(() => (
    Array.isArray(window.__logisticsDashboardShadowDiffs)
      ? window.__logisticsDashboardShadowDiffs.slice(-8)
      : []
  )).catch(() => []);
  page.off('request', requestHandler);
  page.off('response', responseHandler);

  const seenActions = [...new Set(requests.map((request) => request.action).filter(Boolean))];
  const missingText = check.requiredText.filter((text) => !bodyText.includes(text));
  const forbiddenText = check.forbiddenText.filter((text) => bodyText.includes(text));
  const missingActions = check.requiredActions.filter((action) => !seenActions.includes(action));
  const failedResponses = responses.filter((response) => response.status >= 400 || response.body_ok === false);
  const status = missingText.length || forbiddenText.length || missingActions.length || failedResponses.length ? 'fail' : 'pass';

  return {
    id: check.id,
    route: check.route,
    url,
    status,
    required_text: check.requiredText,
    missing_text: missingText,
    forbidden_text: forbiddenText,
    required_actions: check.requiredActions,
    seen_actions: seenActions,
    failed_edge_responses: failedResponses,
    shadow_diffs: shadowDiffs,
    screenshot: path.relative(ROOT, screenshotPath).replace(/\\/gu, '/'),
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const port = Number(argsValue('port', DEFAULT_PORT));
  const baseUrl = `http://127.0.0.1:${port}${BASE_PATH}`;
  const preview = startPreviewServer(port);
  let browser;
  try {
    const realSession = await signInSession();
    await waitForServer(baseUrl);
    browser = await chromium.launch({
      headless: true,
      executablePath: chromeExecutablePath(),
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      deviceScaleFactor: 1,
      serviceWorkers: 'block',
    });
    await context.route('**/logistics-gate6-preview/assets/**', async (route) => {
      const url = new URL(route.request().url());
      const assetName = path.basename(url.pathname);
      const assetPath = path.join(ROOT, 'dist', 'assets', assetName);
      if (!fs.existsSync(assetPath)) {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: contentTypeForAsset(assetPath),
        body: fs.readFileSync(assetPath),
      });
    });
    await context.addInitScript(({ email, session }) => {
      if (session) {
        sessionStorage.setItem('sb-iota-auth-token', JSON.stringify(session));
      } else {
        sessionStorage.setItem('logistics_preview_auth', JSON.stringify({ email }));
      }
      localStorage.setItem('logisticsDashboardReadMode', 'primary-safe');
    }, { email: DEFAULT_EMAIL, session: realSession });
    const page = await context.newPage();
    const commonForbidden = [
      'Supabase read loading',
      'Supabase 자산현황 readback을 불러오지 못해',
      '임시 seed를 표시',
      'Dashboard read blocked',
      '@igisam.com 도메인의 회사 이메일 계정을 입력해주세요',
      '최초 접속 코드',
      'tenant_brn_',
    ];
    const checks = [
      {
        id: 'home',
        route: 'home',
        requiredText: ['Home', '운영 자산 수', '월 임관리비 총액', '포트폴리오 위치'],
        requiredActions: ['dashboard/home/read'],
        forbiddenText: commonForbidden,
      },
      {
        id: 'asset',
        route: 'asset',
        requiredText: ['Asset', '임차인 현황', '층별 배치', '자산개요'],
        requiredActions: ['dashboard/home/read', 'dashboard/asset/read'],
        forbiddenText: commonForbidden,
      },
      {
        id: 'company',
        route: 'company',
        requiredText: ['Company', '기업 개요', '임차 자산 현황', '자산별 노출도'],
        requiredActions: ['dashboard/home/read', 'dashboard/company/read'],
        forbiddenText: commonForbidden,
      },
      {
        id: 'pdf-report',
        route: 'pdf-report',
        requiredText: ['PDF Report', 'PDF 저장', '자산개요', '펀드개요'],
        requiredActions: ['dashboard/home/read'],
        forbiddenText: commonForbidden,
      },
      {
        id: 'analysis-tools',
        route: 'analysis-tools',
        requiredText: ['Analysis Tools', '자산 비교', '기업 비교'],
        requiredActions: ['dashboard/home/read'],
        forbiddenText: commonForbidden,
      },
      {
        id: 'pivot-table',
        route: 'pivot-table',
        requiredText: ['Pivot Table', '피벗 결과 테이블', '피벗 결과 차트'],
        requiredActions: ['dashboard/home/read'],
        forbiddenText: commonForbidden,
      },
    ];
    const results = [];
    for (const check of checks) {
      results.push(await runPageCheck(page, baseUrl, check));
    }
    await context.close();

    const report = {
      ok: results.every((result) => result.status === 'pass'),
      checked_at: new Date().toISOString(),
      branch_only: true,
      base_url: baseUrl,
      auth_mode: realSession
        ? 'real Supabase Auth session injected into sb-iota-auth-token for browser-visible parity.'
        : 'sessionStorage logistics_preview_auth fallback; logged-in JWT API smoke is covered by qa:logistics-jwt-smoke.',
      results,
      decision: results.every((result) => result.status === 'pass')
        ? 'browser-visible parity smoke passed for Home/Asset/Company/PDF/Analysis/Pivot on local preview.'
        : 'browser-visible parity is not closed; see failed page rows.',
    };
    fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    const md = [
      '# Browser Visible Parity - 2026-05-21',
      '',
      `- Base URL: \`${baseUrl}\``,
      `- Status: **${report.ok ? 'pass' : 'fail'}**`,
      `- Auth mode: ${report.auth_mode}`,
      '',
      markdownTable(
        ['Page', 'Status', 'Required actions', 'Seen actions', 'Missing text', 'Forbidden text', 'Failed Edge responses', 'Screenshot'],
        results.map((result) => [
          result.id,
          result.status,
          result.required_actions.join(', '),
          result.seen_actions.join(', '),
          result.missing_text.join(', '),
          result.forbidden_text.join(', '),
          result.failed_edge_responses.map((row) => row.status).join(', '),
          result.screenshot,
        ]),
      ),
      '',
    ].join('\n');
    fs.writeFileSync(OUT_MD, md, 'utf8');
    console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    stopPreviewServer(preview);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
