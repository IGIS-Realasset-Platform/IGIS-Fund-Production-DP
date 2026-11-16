const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
 await context.route('**/*',route=>{const r=route.request();if(!['GET','HEAD'].includes(r.method()))return route.abort();return route.continue();});
 await page.goto('http://127.0.0.1:4178/?screen=portfolio');await page.locator('.pf-sort-button').first().waitFor();assert.equal(await page.locator('.pf-sort-button').count(),3);
 const ids=()=>page.locator('.portfolio-table tbody tr td:first-child [data-project-id]').evaluateAll(es=>es.map(e=>e.dataset.projectId));
 for(const key of ['initial','unit','delta']){const button=page.locator('.pf-sort-button[data-key='+key+']');await button.click();assert.equal(await button.locator('..').getAttribute('aria-sort'),'descending');
 const values=await page.evaluate(key=>App.state.projects.filter(p=>!p.isExample).map(p=>({id:p.id,v:key==='initial'?App.total(p,'initial'):key==='unit'?App.total(p)/p.building.gfaTotal:App.total(p)-App.total(p,'initial')})),key);
 assert.deepEqual(await ids(),values.sort((a,b)=>b.v-a.v).map(x=>x.id));
 await button.press('Enter');assert.equal(await button.locator('..').getAttribute('aria-sort'),'ascending');assert.deepEqual(await ids(),values.sort((a,b)=>a.v-b.v).map(x=>x.id));
 }
 await page.locator('#portfolioCity').selectOption('서울특별시');assert.equal((await ids()).length,2);
 await page.locator('[data-action=portfolio-reset]').click();assert.equal((await ids()).length,3);assert.equal(await page.locator('.portfolio-table th[aria-sort=none]').count(),3);
 await page.locator('.pf-sort-button').first().hover();await page.screenshot({path:'/private/tmp/idm-sort.png'});
 console.log('PASS: three actual header buttons, six sort directions, keyboard, city filter, reset');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
