const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),writes=[];
 await context.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){writes.push(r.request().url());return r.abort();}return r.continue()});
 try{
  await page.goto('http://127.0.0.1:4178/?screen=finance');const table=page.locator('.studio-loan-table');await table.waitFor();
  const heads=await table.locator('thead th').allTextContents();
  assert.deepEqual(heads,['금융기관','순위','유형','약정액','실행액','잔액','금리(연%)','선취·취급(%)','금융자문(%)','ALL-IN(연%)','약정일','만기일','']);
  const row=table.locator('tbody tr').first();assert.equal(await row.locator('td').count(),13);
  const geometry=await row.evaluate(r=>{const a=r.cells[0],z=r.cells[r.cells.length-1];return {first:a.offsetWidth,left:getComputedStyle(a).paddingLeft,right:getComputedStyle(z).paddingRight}});
  assert.ok(geometry.first>=160);assert.equal(geometry.left,'16px');assert.equal(geometry.right,'16px');
  // Long-label fixture changes only isolated browser DOM, never the loan data.
  const long=await row.locator('td').first().evaluate(c=>{const b=c.querySelector('.cell-value-trigger'),old=b.textContent;b.textContent='신호상홍금융저축은행';const s=getComputedStyle(c),fits=b.scrollWidth<=b.clientWidth+1;b.textContent=old;return{fits,nowrap:s.whiteSpace}});
  assert.equal(long.fits,true);assert.notEqual(long.nowrap,'nowrap');
  await row.locator('[data-action="loan-detail"]').click();
  const dialog=page.locator('#app-dialog');assert.ok((await dialog.innerText()).includes('ALL-IN 기준'));
  await dialog.locator('[data-action="loan-edit"]').click();
  assert.equal(await dialog.locator('select[name="allInAdvisoryBasis"]').count(),1);
  await page.keyboard.press('Escape');
  assert.deepEqual(writes,[]);console.log('PASS 13열/기관160px이상/좌우16px/긴기관명/상세 ALL-IN 보존/수정선택/취소/쓰기0',geometry,long);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
