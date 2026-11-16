const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),writes=[];
 await context.route('**/api/**',route=>{if(!['GET','HEAD'].includes(route.request().method())){writes.push(route.request().url());return route.abort();}return route.continue();});
 const page=await context.newPage();await page.goto('http://127.0.0.1:4178/?screen=overview');
 await page.locator('#sidebar [data-view="spec"]').click();
 const snapshot=()=>page.evaluate(()=>({spec:JSON.stringify(App.spec),audit:JSON.stringify(App.state.auditEvents)}));
 const before=await snapshot();
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
 console.log('PASS: original spec hidden; local audit retained; detail/return works; all old tabs safe; original spec/audit unchanged; no writes');
}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
