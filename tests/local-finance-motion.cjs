const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1050}});
  const writes=[];
  await context.route('**/api/**',route=>{if(!['GET','HEAD'].includes(route.request().method())){writes.push(route.request().url());return route.abort();}return route.continue();});
  await context.addInitScript(()=>{window.metricMotions=[];const original=Element.prototype.animate;Element.prototype.animate=function(frames,options){const result=original.call(this,frames,options);if(options?.id==='studio-stage-metric')window.metricMotions.push({field:this.closest('[data-stage-field]')?.dataset.stageField,text:this.textContent,frames,options});return result;};});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4178/?screen=finance');
  await page.locator('[data-cost-basis]').last().waitFor();
  const entry=await page.evaluate(()=>window.metricMotions);
  assert(entry.some(x=>x.field==='cost'&&x.frames[0].transform&&x.frames[0].transform!=='translate(0px, 0px)'),'entry must move the UW value from the single-value position');
  const finalState=()=>page.evaluate(()=>({height:document.querySelector('.studio-stage-comparison').offsetHeight,values:[...document.querySelectorAll('.studio-stage-comparison-grid b')].map(e=>e.textContent),funding:document.querySelector('[data-stage-field="funding"] .studio-stage-values>div:last-child b').textContent,capital:[...document.querySelectorAll('.studio-capital .recovery-summary b')].map(e=>e.textContent)}));
  await page.waitForTimeout(800);
  const current=await finalState();assert.equal(current.funding,current.capital[0]);
  await page.locator('[data-cost-basis]').first().click();
  assert.equal(await page.locator('[data-stage-field="cost"] .studio-stage-values>div').count(),1);
  assert.equal(await page.locator('[data-stage-field="cost"] .studio-stage-values>span').count(),0);
  await page.locator('[data-cost-basis]').nth(1).click();
  await page.locator('[data-cost-basis]').last().click();
  await page.waitForTimeout(800);
  assert.deepEqual(await finalState(),current,'rapid changes must settle at the selected stage without changing layout/data');
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.id==='studio-stage-metric').length),0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>window.metricMotions=[]);
  await page.locator('[data-cost-basis]').first().click();await page.locator('[data-cost-basis]').last().click();
  assert.equal(await page.evaluate(()=>window.metricMotions.length),0);
  assert.deepEqual(await finalState(),current);
  assert.deepEqual(writes,[]);
  console.log('PASS: entry slide, UW-only state, rapid stage changes, stable metrics/layout/funding, reduced motion, no writes');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
