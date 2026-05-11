const fs = require('fs');
const path = require('path');

function requirePlaywright() {
  const candidates = [
    'playwright',
    'C:/Users/10524/Desktop/codex_realasset/Project/03_Logi_Leasing_Dashboard/node_modules/playwright',
  ];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (_) {
      // try next
    }
  }
  throw new Error('Playwright module not found.');
}

const { chromium } = requirePlaywright();

const baseUrl = process.env.QA_URL || 'http://127.0.0.1:5174/platform/logistics-leasing';
const outDir = path.join(process.cwd(), 'qa-artifacts', 'logistics-leasing', new Date().toISOString().replace(/[:.]/g, '-'));

const checks = [];
const failures = [];
const consoleErrors = [];
const httpErrors = [];
const requestFailures = [];

function record(name, ok, detail = '') {
  checks.push({ name, ok, detail });
  if (!ok) failures.push({ name, detail });
}

async function clickAndCheck(page, selector, expectedLayer, name) {
  const count = await page.locator(selector).count();
  record(`${name} trigger exists`, count > 0, `count=${count}`);
  if (!count) return;
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.locator(selector).first().click();
  const layer = page.locator(expectedLayer);
  await layer.waitFor({ state: 'visible', timeout: 5000 });
  record(`${name} opens layer`, await layer.count() > 0, expectedLayer);
  await page.locator('.ll-close').first().click();
  await layer.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function selectSecondOption(page, selector, name) {
  const select = page.locator(selector);
  const count = await select.locator('option').count();
  record(`${name} select has second option`, count > 1, `count=${count}`);
  if (count <= 1) return;
  await select.selectOption({ index: 1 });
  await page.waitForTimeout(250);
  const value = await select.inputValue();
  record(`${name} selected value changed`, !!value, value || '');
}

async function clickAndStay(page, selector, name) {
  const target = page.locator(selector);
  const count = await target.count();
  record(`${name} trigger exists`, count > 0, `count=${count}`);
  if (!count) return;
  await target.first().scrollIntoViewIfNeeded();
  await target.first().click();
  await page.waitForTimeout(300);
  record(`${name} click completed`, true);
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.addInitScript(() => {
    window.__SUPABASE_CLIENT__ = {
      auth: {
        async getSession() {
          return {
            data: { session: { user: { email: 'qa-logistics@example.test' } } },
            error: null,
          };
        },
        onAuthStateChange() {
          return { data: { subscription: { unsubscribe() {} } } };
        },
        async signOut() {
          return { error: null };
        },
        async updateUser() {
          return { data: null, error: null };
        },
      },
      from(tableName) {
        return {
          select() {
            return this;
          },
          eq() {
            return this;
          },
          async single() {
            if (tableName === 'iota_seoul_pilot_members') {
              return {
                data: {
                  email: 'qa-logistics@example.test',
                  staff_name: 'QA 검증',
                  role_code: 'master',
                },
                error: null,
              };
            }
            return { data: null, error: null };
          },
        };
      },
    };
  });
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    if (url.includes('fonts.googleapis.com')) {
      await route.fulfill({ status: 200, contentType: 'text/css', body: '' });
      return;
    }
    if (url.includes('fonts.gstatic.com')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    if (url.includes('googletagmanager.com')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.continue();
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() });
  });
  page.on('requestfailed', (request) => {
    requestFailures.push({ url: request.url(), failure: request.failure()?.errorText || '' });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45000 });
  await page.screenshot({ path: path.join(outDir, '00-initial.png'), fullPage: true });

  const searchInput = page.getByTestId('logistics-search');
  await searchInput.fill('아레나스');
  await page.waitForTimeout(300);
  const suggestionCount = await page.locator('[data-qa-search-suggestion]').count();
  record('search suggestions appear', suggestionCount > 0, `count=${suggestionCount}`);
  if (suggestionCount > 0) {
    await page.locator('[data-qa-search-suggestion]').first().click();
    await page.waitForTimeout(300);
    record('search suggestion navigates', await page.getByRole('heading', { name: 'Asset' }).isVisible().catch(() => false));
  }

  const tabTitles = ['Weekly', 'Home', 'Asset', 'Company', 'Sector', 'Analysis Tools', 'Data Playground', 'Data Quality', 'Admin'];
  for (const title of tabTitles) {
    await page.getByRole('button', { name: title }).click();
    await page.waitForTimeout(250);
    const visible = await page.getByRole('heading', { name: title }).isVisible().catch(() => false);
    record(`tab ${title}`, visible);
    await page.screenshot({ path: path.join(outDir, `tab-${title.replace(/\s+/g, '-').toLowerCase()}.png`), fullPage: true });
  }

  await page.getByRole('button', { name: 'Home' }).click();
  await clickAndCheck(page, '[data-qa-click="metric"]', '[data-qa-layer="modal"]', 'Home KPI');
  await clickAndCheck(page, '[data-qa-click="table-row"]', '[data-qa-layer="drawer"]', 'table row');
  await clickAndCheck(page, '[data-qa-click="map-marker"]', '[data-qa-layer="drawer"]', 'map marker');
  await clickAndCheck(page, '[data-qa-click="chart"]', '[data-qa-layer="modal"]', 'chart');
  await clickAndCheck(page, '[data-qa-home-map-detail]', '[data-qa-layer="modal"]', 'Home map detail');
  await clickAndCheck(page, '[data-qa-home-map-list]', '[data-qa-layer="modal"]', 'Home coordinate list');
  await clickAndCheck(page, '[data-qa-chart="home-cold"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Home cold chart');
  await clickAndCheck(page, '[data-qa-chart="home-sector"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Home sector chart');
  await clickAndCheck(page, '[data-qa-chart="home-expiry"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Home expiry chart');

  await page.getByRole('button', { name: 'Asset' }).click();
  const assetSelect = page.locator('[data-qa-select="asset"]');
  record('asset select exists', await assetSelect.count() > 0);
  if (await assetSelect.count()) {
    const options = await assetSelect.locator('option').count();
    record('asset select has options', options > 1, `count=${options}`);
    await selectSecondOption(page, '[data-qa-select="asset"]', 'asset');
  }
  await clickAndCheck(page, '[data-qa-asset-map-detail]', '[data-qa-layer="modal"]', 'Asset map detail');
  await clickAndCheck(page, '[data-qa-asset-enoc]', '[data-qa-layer="modal"]', 'Asset E.NOC');
  await clickAndCheck(page, '[data-qa-chart="asset-rent"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Asset rent chart');
  await clickAndCheck(page, '[data-qa-chart="asset-expiry"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Asset expiry chart');

  await page.getByRole('button', { name: 'Company' }).click();
  const companySelect = page.locator('[data-qa-select="company"]');
  record('company select exists', await companySelect.count() > 0);
  if (await companySelect.count()) {
    const options = await companySelect.locator('option').count();
    record('company select has options', options > 1, `count=${options}`);
    await selectSecondOption(page, '[data-qa-select="company"]', 'company');
  }
  await clickAndCheck(page, '[data-qa-company-kpi]', '[data-qa-layer="modal"]', 'Company KPI');
  await clickAndCheck(page, '[data-qa-company-map-detail]', '[data-qa-layer="modal"]', 'Company map detail');
  await clickAndCheck(page, '[data-qa-chart="company-exposure"] [data-qa-click="chart"]', '[data-qa-layer="drawer"]', 'Company exposure chart');

  await page.getByRole('button', { name: 'Sector' }).click();
  await clickAndCheck(page, '[data-qa-chart="sector-region"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Sector region chart');
  await clickAndCheck(page, '[data-qa-chart="sector-rent"]', '[data-qa-layer="modal"]', 'Sector rent chart');

  await page.getByRole('button', { name: 'Analysis Tools' }).click();
  record('tools asset filter exists', await page.locator('[data-qa-tools-asset-filter] input[type="checkbox"]').count() > 0);
  record('tools company filter exists', await page.locator('[data-qa-tools-company-filter] input[type="checkbox"]').count() > 0);
  const firstAssetCheckbox = page.locator('[data-qa-tools-asset-filter] input[type="checkbox"]').first();
  if (await firstAssetCheckbox.count()) {
    await firstAssetCheckbox.setChecked(false);
  }
  await clickAndCheck(page, '[data-qa-tools-apply]', '[data-qa-layer="modal"]', 'Tools apply');

  await page.getByRole('button', { name: 'Data Playground' }).click();
  record('playground mode exists', await page.locator('[data-qa-playground-mode]').count() > 0);
  record('playground filter exists', await page.locator('[data-qa-playground-filter]').count() > 0);
  const topInput = page.locator('[data-qa-playground-topn]');
  record('playground topN input exists', await topInput.count() > 0);
  if (await topInput.count()) {
    await topInput.fill('5');
    await page.waitForTimeout(250);
    const rowCount = await page.locator('[data-testid="logistics-panel-playground"] [data-testid="logistics-table-row"]').count();
    record('playground topN limits visible rows', rowCount <= 5 && rowCount > 0, `count=${rowCount}`);
  }
  await clickAndStay(page, '[data-qa-playground-view]', 'Playground saved view');
  await clickAndCheck(page, '[data-qa-chart="playground"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Playground chart');

  await page.getByRole('button', { name: 'Data Quality' }).click();
  const qualitySheet = page.locator('[data-qa-quality-sheet]');
  record('quality sheet filter exists', await qualitySheet.count() > 0);
  if (await qualitySheet.count()) {
    const qualityOptions = await qualitySheet.locator('option').count();
    record('quality sheet filter has options', qualityOptions > 1, `count=${qualityOptions}`);
    if (qualityOptions > 1) await qualitySheet.selectOption({ index: 1 });
  }
  await clickAndCheck(page, '[data-qa-chart="quality-sheet"] [data-qa-click="chart"]', '[data-qa-layer="modal"]', 'Quality sheet chart');

  await page.getByRole('button', { name: 'Admin' }).click();
  await clickAndCheck(page, '[data-qa-admin-action]', '[data-qa-layer="modal"]', 'Admin action');
  await clickAndCheck(page, '[data-qa-admin-review]', '[data-qa-layer="modal"]', 'Admin review tile');

  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 45000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  record('mobile page has no global horizontal overflow', !overflow, `scrollWidth=${await page.evaluate(() => document.documentElement.scrollWidth)}, innerWidth=${await page.evaluate(() => window.innerWidth)}`);
  await page.screenshot({ path: path.join(outDir, 'mobile.png'), fullPage: true });

  const visibleText = await page.locator('body').innerText();
  const secretPatterns = [/service\s*role/i, /supabase_service/i, /api[_\s-]?key\s*[:=]/i, /apikey\s*[:=]/i, /password\s*[:=]/i, /token\s*[:=]/i, /secret\s*[:=]/i];
  const secretHits = secretPatterns.map((pattern) => pattern.source).filter((_, index) => secretPatterns[index].test(visibleText));
  record('visible secret markers', secretHits.length === 0, secretHits.join(', '));
  record('visible mojibake replacement char', !visibleText.includes('�'));
  record('visible object object marker', !visibleText.includes('[object Object]'));

  record('console errors', consoleErrors.length === 0, consoleErrors.join('\n'));
  record('http 4xx/5xx', httpErrors.length === 0, JSON.stringify(httpErrors.slice(0, 10)));
  record('request failures', requestFailures.length === 0, JSON.stringify(requestFailures.slice(0, 10)));

  await browser.close();

  const summary = {
    baseUrl,
    outDir,
    checks,
    failures,
    consoleErrors,
    httpErrors,
    requestFailures,
  };
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify({ outDir, failureCount: failures.length, checkCount: checks.length }, null, 2));
  if (failures.length) process.exit(1);
})().catch((error) => {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'fatal-error.txt'), error.stack || String(error), 'utf8');
  console.error(error);
  process.exit(1);
});
