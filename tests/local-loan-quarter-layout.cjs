const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),writes=[];
 await context.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){writes.push(r.request().url());return r.abort();}return r.continue()});
 try{
  await page.goto('http://127.0.0.1:4178/?screen=finance');const table=page.locator('.studio-loan-table');await table.waitFor();
  assert.ok((await table.innerText()).includes('엔에이치농협캐피탈'));
  assert.ok((await table.innerText()).includes('한국스탠다드차타드은행'));
  await page.locator('[data-action="finance-quarter-list"]').click();
  const quarter=page.locator('.studio-loan-quarter-table');await quarter.waitFor();
  assert.equal(await quarter.locator('thead th').count(),11);
  const content=await quarter.innerText();
  for(const name of ['엔에이치농협캐피탈','한국스탠다드차타드은행'])assert.ok(content.includes(name));
  const geometry=await quarter.locator('tbody tr').first().evaluate(r=>{const a=r.cells[0],z=r.cells[r.cells.length-1];return {first:a.offsetWidth,left:getComputedStyle(a).paddingLeft,right:getComputedStyle(z).paddingRight,wrap:getComputedStyle(a).whiteSpace}});
  assert.ok(geometry.first>=160);assert.equal(geometry.left,'16px');assert.equal(geometry.right,'16px');assert.notEqual(geometry.wrap,'nowrap');
  await page.keyboard.press('Escape');
  assert.deepEqual(writes,[]);console.log('PASS quarterly 11 columns, both lender names, width, padding, close, no writes',geometry);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
