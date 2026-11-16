import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin='http://127.0.0.1:4178',browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),report={projects:[],errors:[],writes:[]};
await context.route('**/*',route=>{const r=route.request();if(!['GET','HEAD'].includes(r.method())){report.writes.push(r.url());return route.abort();}if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))return route.abort();return route.continue();});page.on('pageerror',e=>report.errors.push(e.message));page.setDefaultTimeout(8000);
const before=await(await context.request.get(origin+'/api/workspace')).json();
try{
 await page.goto(origin+'/?screen=finance');await page.locator('[data-cost-basis=current]').waitFor();
 for(const suffix of ['A','B','C']){
  await page.locator('#sidebar-project-select').selectOption('TEST-20261016-'+suffix);await page.locator('[data-cost-basis=current]').waitFor();
  const ids=await page.locator('[data-cost-basis]').evaluateAll(es=>es.map(e=>e.dataset.costBasis));
  for(const id of ids){
   await page.locator('[data-cost-basis]').evaluateAll((es,id)=>es.find(e=>e.dataset.costBasis===id).click(),id);await page.locator('[data-stage-action=details]').click();
   const table=page.locator('.studio-cost-bases');await table.waitFor();assert.equal(await table.locator('[data-linked-metric]').count(),5);
   const text=await table.innerText();assert.ok(!text.includes('시작월·개발기간 기준'));assert.ok(!text.includes('감정가'));assert.ok(!text.includes('매각 목표'));
   const deltas=await table.locator('.studio-stage-inline-delta').allTextContents();assert.ok(deltas.every(s=>!s.trim()||/^\([+−].+\)$/.test(s.trim())));assert.ok(deltas.every(s=>!/^\([+−]?0(?:억원|개월)\)$/.test(s.trim())));
   const expected=suffix==='A'?['2,760.47억원','2,760.47억원','2,780.06억원']:suffix==='B'?['1,739.1억원','1,747.1억원','1,746.5억원']:['5,796.99억원','5,821.99억원','5,846.36억원'];
   assert.deepEqual(await table.locator('[data-linked-metric=directConstruction] td strong').allTextContents(),expected);
   assert.deepEqual((await table.locator('[data-linked-metric=constructionStart] td strong').allTextContents()).slice(0,2),['—','—']);
   const spacing=await table.locator('tbody small').first().evaluate(e=>getComputedStyle(e).marginTop);assert.equal(spacing,'-1px');
   if(id==='current'){
    await page.locator('[data-stage-inline-edit=current]').click();const area=page.locator('[data-stage-input=gfa]'),old=await area.inputValue();
    const original=await page.locator('[data-draft-linked=contractUnit]').innerText();await area.fill(String(Number(old)*2));await page.waitForTimeout(80);assert.notEqual(await page.locator('[data-draft-linked=contractUnit]').innerText(),original);
    await page.locator('[data-stage-cancel]').click();assert.equal(await table.locator('[data-linked-metric=contractUnit] td').last().innerText(),original);
    if(suffix==='A'){await table.scrollIntoViewIfNeeded();await table.screenshot({path:'/private/tmp/idm-ui182.png'});}
   }
   report.projects.push({project:suffix,stage:id,direct:expected,deltas,spacing});await page.locator('[data-stage-action=details]').click();
  }
 }
 assert.deepEqual(await(await context.request.get(origin+'/api/workspace')).json(),before);assert.deepEqual(report.writes,[]);assert.deepEqual(report.errors,[]);console.log('PASS 3사업9단계/추가5행/증감괄호/0증감숨김/간격/면적미리보기/취소/DB불변');
}finally{await writeFile('/private/tmp/idm-ui182-browser.json',JSON.stringify(report,null,2));await browser.close();}
