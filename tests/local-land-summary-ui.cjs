const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),writes=[];
 await context.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){writes.push(r.request().url());return r.abort()}return r.continue()});
 try{
 await page.goto('http://127.0.0.1:4178/?screen=land');await page.locator('.lp-land-summary').waitFor();
 assert.equal(await page.locator('.lp-land-summary thead').count(),0);
 assert.equal(await page.locator('.lp-land-summary tr').count(),5);
 assert.equal(await page.locator('.lp-land-summary tr').first().locator('th,td').count(),4);
 assert.match(await page.locator('.lp-land-next').innerText(),/토지대금 지급 완료/);
 const before=await page.evaluate(()=>JSON.stringify(App.current()));
 await page.locator('[data-action="land-input-open"]').click();
 assert.equal(await page.locator('#app-form [name="delayReason"]').count(),1);
 await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>JSON.stringify(App.current())),before);
 await page.evaluate(()=>{App.current().land.delay='예';App.render()});await page.waitForFunction(()=>document.querySelectorAll('.lp-land-summary tr').length===7);
 await page.evaluate(()=>{const p=App.current();p.landPaymentSchedule[2].paid=false;p.landPaymentSchedule[2].plannedDate='2020-01-01';App.render()});
 await page.waitForFunction(()=>document.querySelector('.lp-land-next').dataset.status==='overdue');
 assert.match(await page.locator('.lp-land-next').innerText(),/잔금/);
 await page.evaluate(s=>{const saved=JSON.parse(s);Object.assign(App.current(),saved);App.render()},before);
 await page.screenshot({path:'/private/tmp/idm-land-256.png',fullPage:true});
 const dims=await page.locator('.lp-land-panel').evaluate(p=>({height:p.offsetHeight,width:p.offsetWidth,overflow:p.scrollWidth>p.clientWidth}));
 assert.equal(dims.overflow,false);assert.ok(dims.height<470);assert.deepEqual(writes,[]);
 console.log(JSON.stringify({dims,serverWrites:writes.length,checks:'4 columns, delay, next payment, edit, Escape, data preserved'}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
