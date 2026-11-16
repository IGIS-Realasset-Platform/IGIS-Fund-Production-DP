const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),writes=[];
 await context.route('**/api/**',route=>{if(!['GET','HEAD'].includes(route.request().method())){writes.push(route.request().url());return route.abort();}return route.continue();});
 const page=await context.newPage();await page.goto('http://127.0.0.1:4178/?screen=overview');
 await page.locator('#sidebar [data-view="spec"]').click();
 const snapshot=()=>page.evaluate(()=>({spec:JSON.stringify(App.spec),audit:JSON.stringify(App.state.auditEvents)}));
 const before=await snapshot();
 assert.equal(await page.locator('[data-action="studio-spec-section"]').count(),4,'handoff specification must have four sections');
 const chooseSection=id=>page.locator(`[data-action="studio-spec-section"][data-id="${id}"]`).click();
 assert.equal(await page.locator('.review-spec-card').count(),4);
 assert.match(await page.locator('.review-spec').innerText(),/1,280px/);
 await chooseSection('menus');
 const menuButtons=page.locator('[data-action="studio-spec-menu"]');
 const menuIds=await menuButtons.evaluateAll(es=>es.map(e=>e.dataset.id));
 assert.deepEqual(menuIds,['navigation','portfolio','overview','cost','finance','permit','documents','reports','partners','laws','feed','access','spec']);
 let entries=0;
 for(const id of menuIds){
  await page.locator(`[data-action="studio-spec-menu"][data-id="${id}"]`).click();
  assert.equal(await page.locator(`.review-spec-card[data-spec-section="${id}"]`).count(),1);
  entries+=await page.locator('.review-spec-item').count();
  assert.equal(await page.locator('[data-action="studio-spec-menu"][aria-pressed="true"]').count(),1);
  const overflow=await page.locator('.review-spec-content').evaluate(e=>e.scrollWidth>e.clientWidth+1);
  assert.equal(overflow,false,`${id} should not overflow`);
 }
 assert(entries>=80,'detailed menu handoff coverage');
 await page.locator('[data-action="studio-spec-menu"][data-id="finance"]').click();
 assert.match(await page.locator('.review-spec-content').innerText(),/과거 단계.*동결/s);
 await page.screenshot({path:'/private/tmp/idm-spec243-finance.png',fullPage:true});
 await chooseSection('handoff');
 assert.match(await page.locator('.review-spec').innerText(),/서로.*다릅니다/s);
 assert.equal(await page.locator('[data-action="studio-spec-print"],.review-spec-print-frame').count(),0,'no print feature');
 await chooseSection('design');await page.screenshot({path:'/private/tmp/idm-spec243-design.png',fullPage:true});
 await chooseSection('history');
 assert.equal(await page.locator('#content [data-action="spec-copy"],#content [data-action="export-spec"],#content [data-action="export-data"]').count(),0,'original spec exports must not be displayed');
 assert.equal(await page.locator('#content .spec-json').count(),0);
 const ownIds=await page.evaluate(()=>App.state.auditEvents.filter(x=>['design.preview@igisam.com','jk.jeon@igisam.com'].includes(String(x.actor||'').toLowerCase())).map(x=>x.id));
 assert(ownIds.length>0);
 assert.deepEqual(await page.locator('#content [data-action="audit-detail"]').evaluateAll(es=>es.map(e=>e.dataset.id)),ownIds);
 await page.locator('#content [data-action="audit-detail"]').first().click();await page.locator('#app-dialog[open]').waitFor();await page.keyboard.press('Escape');
 assert.deepEqual(await snapshot(),before,'spec data and original audit records must remain intact');
 for(const tab of ['overview','functions','sdd','tests','data','history','feedback','json']){
  await page.evaluate(tab=>{App.ui.tabs.spec=tab;App.render();},tab);
  assert.equal(await page.locator('#content .spec-json,#content [data-action="export-spec"]').count(),0);
  assert.equal(await page.locator('#content [data-action="audit-detail"]').count(),ownIds.length);
 }
 assert.deepEqual(await snapshot(),before);assert.deepEqual(writes,[]);
 console.log('PASS: 4 sections, 13 menu specifications, no print feature, no overflow; original spec hidden; local audit retained; detail/return works; all old tabs safe; original spec/audit unchanged; no writes');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
