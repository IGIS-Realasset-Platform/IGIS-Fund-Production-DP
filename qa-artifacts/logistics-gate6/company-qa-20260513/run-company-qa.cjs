const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const outDir = __dirname;
  const repoRoot = path.resolve(__dirname, '../../..');
  const preview = spawn('cmd.exe', ['/d', '/c', 'npm run preview -- --host 127.0.0.1 --port 8084'], {
    cwd: repoRoot,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const previewLog = fs.createWriteStream(path.join(outDir, 'vite-preview-8084.log'), { flags: 'a' });
  preview.stdout.pipe(previewLog);
  preview.stderr.pipe(previewLog);

  const urlCompany = 'http://127.0.0.1:8084/platform/iotaseoul/workspace/logistics/dashboard/company';
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(urlCompany);
      if (response.ok) break;
    } catch {
      await wait(500);
    }
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const pageErrors = [];
  const failedRequests = [];
  let currentStep = 'init';

  page.on('pageerror', (error) => {
    pageErrors.push({ step: currentStep, message: error.message, stack: error.stack || '' });
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (/naver|map|leaflet|openapi|oapi|cdn\.jsdelivr|tile\.openstreetmap/i.test(url)) {
      failedRequests.push({ url, failure: request.failure()?.errorText || 'unknown' });
    }
  });
  await page.addInitScript(() => {
    const readerUser = {
      id: 'local-qa-reader',
      email: 'reader.qa@igis.local',
      app_metadata: { logistics_role: 'Reader' },
      user_metadata: {},
    };
    const readerMember = {
      email: 'reader.qa@igis.local',
      staff_name: 'QA Reader',
      name: 'QA Reader',
      role_code: 'reader',
    };
    const chain = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      limit: () => chain,
      single: async () => ({ data: readerMember, error: null }),
      then: (resolve) => resolve({ data: [], error: null }),
    };
    window.__SUPABASE_CLIENT__ = {
      auth: {
        getSession: async () => ({ data: { session: { user: readerUser, access_token: 'local-qa-token' } }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
        signOut: async () => ({ error: null }),
      },
      from: () => chain,
    };
  });

  currentStep = 'goto-company';
  await page.goto(urlCompany, { waitUntil: 'networkidle', timeout: 90000 });
  currentStep = 'wait-company';
  await wait(9000);
  await page.screenshot({ path: path.join(outDir, 'company-dashboard-full.png'), fullPage: true });
  const companyText = await page.locator('body').innerText();

  async function clickButton(text, screenshotName, index = 0) {
    const button = page.locator('button').filter({ hasText: text }).nth(index);
    currentStep = `open-${screenshotName}`;
    await button.scrollIntoViewIfNeeded({ timeout: 20000 });
    await wait(250);
    const box = await button.boundingBox();
    if (!box) throw new Error(`button not visible: ${text}`);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await wait(1200);
    const bodyText = await page.locator('body').innerText();
    await page.screenshot({ path: path.join(outDir, screenshotName), fullPage: true });
    currentStep = `close-${screenshotName}`;
    await page.evaluate(() => {
      const closeButton = [...document.querySelectorAll('button')].find((button) => button.textContent.includes('닫기'));
      if (closeButton) closeButton.click();
    });
    await wait(300);
    return bodyText;
  }

  const assetCountPopup = await clickButton('임차 자산 수', 'popup-company-asset-count.png', 0);
  const tablePopup = await clickButton('원본 표 보기', 'popup-company-assets-table.png', 0);
  const mapPopup = await clickButton('지도 크게 보기', 'popup-company-map.png');
  const exposurePopup = await clickButton('원본 표 보기', 'popup-company-exposure.png', 1);

  currentStep = 'toggle-exposure-area';
  await page.locator('button').filter({ hasText: '임대면적 기준' }).first().click();
  await wait(600);
  await page.screenshot({ path: path.join(outDir, 'company-exposure-area-toggle.png'), fullPage: true });
  const areaModeText = await page.locator('body').innerText();

  currentStep = 'select-company';
  const selectedBefore = await page.locator('select').first().inputValue();
  await page.locator('select').first().selectOption({ index: 1 });
  await wait(900);
  await page.screenshot({ path: path.join(outDir, 'company-selector-change.png'), fullPage: true });
  const selectedAfter = await page.locator('select').first().inputValue();
  const selectedText = await page.locator('body').innerText();

  const mapDebug = await page.evaluate(() => {
    const canvas = document.querySelector('.logistics-map-canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      rect: { width: rect.width, height: rect.height },
      imageCount: canvas.querySelectorAll('img').length,
      markerLikeCount: [...canvas.querySelectorAll('*')].filter((node) => (node.textContent || '').includes('●')).length,
      statusText: [...document.querySelectorAll('div')]
        .map((node) => node.textContent || '')
        .find((text) => text.includes('동적 지도') || text.includes('네이버 동적 지도') || text.includes('스케매틱')) || '',
    };
  });

  const result = {
    urlCompany,
    checks: {
      companyActive: companyText.includes('기업 개요') && companyText.includes('DART 상세 정보'),
      selectorAvailable: companyText.includes('(주)LG생활건강') && selectedBefore,
      kpis: ['임차 자산 수', '총 임차면적', '월 임관리비 총액', '월 임대료 총액', '월 관리비 총액'].every((text) => companyText.includes(text)),
      basisStrip: ['대상', '기준시점', '계약/금액', 'DART', '지도'].every((text) => companyText.includes(text)),
      leasedAssetTable: ['임차 자산 현황', '자산명', '층/세부구역', '월 임관리비', '현재 계약만기일'].every((text) => companyText.includes(text)),
      mapPanel: companyText.includes('회사별 임차 자산 지도') && mapDebug?.rect?.height > 300,
      exposurePanel: companyText.includes('자산별 노출도') && companyText.includes('임관리비 총합 기준') && areaModeText.includes('임대면적 기준'),
      dartPanel: ['DART corp code', '매칭 상태', '본점소재지', '최근 매출', '직원수'].every((text) => companyText.includes(text)),
      companySelectorChanges: selectedBefore !== selectedAfter && selectedText.includes('기업 개요'),
      noAdminData: !companyText.includes('Admin Data') && !companyText.includes('관리자 검토 포인트'),
    },
    popupChecks: {
      assetCount: assetCountPopup.includes('임차 자산 수') && assetCountPopup.includes('최근 만기일'),
      assetsTable: tablePopup.includes('임차 자산 현황') && tablePopup.includes('월 임관리비'),
      map: mapPopup.includes('포트폴리오 위치') && mapPopup.includes('좌표'),
      exposure: exposurePopup.includes('자산별 노출도') && exposurePopup.includes('월 임대료') && exposurePopup.includes('월 관리비'),
    },
    debug: {
      mapDebug,
      failedRequests,
      pageErrors,
    },
  };
  fs.writeFileSync(path.join(outDir, 'company-qa-result.json'), JSON.stringify(result, null, 2), 'utf8');
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
  preview.kill('SIGKILL');
  previewLog.end();
  setTimeout(() => process.exit(0), 100);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
