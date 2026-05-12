const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:8081/workspace/fund', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.log('Navigation Error:', e.message);
  }
  
  await browser.close();
})();
