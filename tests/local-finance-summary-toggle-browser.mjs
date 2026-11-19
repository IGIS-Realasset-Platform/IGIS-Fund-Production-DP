import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const origin='http://127.0.0.1:4178',browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage(),report={errors:[],writes:[]};page.setDefaultTimeout(6000);
await context.route('**/*',r=>{const q=r.request();if(!['GET','HEAD'].includes(q.method())){report.writes.push(q.url());return r.abort();}if(!q.url().startsWith(origin)&&!q.url().startsWith('data:'))return r.abort();return r.continue();});page.on('pageerror',e=>report.errors.push(e.message));
const before=await(await context.request.get(origin+'/api/workspace')).json();
try{
 await page.goto(origin+'/?screen=finance');await page.locator('[data-cost-basis=current]').waitFor();
 const b=page.locator('[data-stage-action=details]'),table=page.locator('.studio-stage-table');
 assert.equal(await b.innerText(),'단계별 핵심 이슈 요약');assert.equal(await page.locator('.studio-stage-comparison [data-stage-action]').count(),0);
 const boxes=await page.locator('[data-cost-basis=current], [data-stage-action=details]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));assert.ok(boxes[1].x>=boxes[0].x+boxes[0].w);assert.ok(Math.abs(boxes[1].y+boxes[1].h/2-boxes[0].y-boxes[0].h/2)<2);
 await b.hover();await page.waitForTimeout(350);assert.equal(await b.getAttribute('data-tip'),null);assert.equal(await page.locator('#dp-chart-tooltip:visible').count(),0);
 report.button=await b.evaluate(e=>({border:getComputedStyle(e).borderWidth,color:getComputedStyle(e).borderColor,accent:getComputedStyle(e).getPropertyValue('--studio-accent').trim()}));assert.equal(report.button.border,'3px');assert.equal(report.button.color,'rgb(37, 57, 133)');

 await b.focus();assert.equal(await page.locator('#dp-chart-tooltip:visible').count(),0);await page.keyboard.press('Enter');assert.equal(await b.getAttribute('aria-expanded'),'true');assert.ok(await table.evaluate(e=>e.getAnimations().length>0));await page.waitForTimeout(350);assert.ok(await table.isVisible());
 await b.click();assert.ok(await table.evaluate(e=>e.getAnimations().length>0));await page.waitForTimeout(350);assert.equal(await table.isVisible(),false);
 // Immediate reversal must cancel the prior animation without hiding the new state.
 await b.evaluate(e=>{e.click();e.click();e.click()});await page.waitForTimeout(350);assert.equal(await b.getAttribute('aria-expanded'),'true');assert.ok(await table.isVisible());
 await page.locator('[data-stage-inline-edit=current]').click();await b.click();assert.equal(await b.getAttribute('aria-expanded'),'true');assert.ok(await page.locator('[data-stage-input=name]').isVisible());await page.locator('[data-stage-cancel]').click();
 await b.click();await page.waitForTimeout(350);await page.locator('[data-milestone-add]').click();assert.ok(await page.locator('[data-stage-input=name]').isVisible());await page.locator('[data-stage-cancel]').click();
 await b.click();await page.waitForTimeout(350);await page.screenshot({path:'/private/tmp/idm-ui184.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await b.click();assert.ok(await table.isVisible());assert.equal(await table.evaluate(e=>e.getAnimations().length),0);await b.click();assert.equal(await table.isVisible(),false);
 assert.deepEqual(await(await context.request.get(origin+'/api/workspace')).json(),before);assert.deepEqual(report.writes,[]);assert.deepEqual(report.errors,[]);console.log('PASS 위치/남색3px/말풍선제거/개폐애니/빠른반복/키보드/편집보호/추가취소/동작줄이기/DB불변');
}finally{await writeFile('/private/tmp/idm-ui184-browser.json',JSON.stringify(report,null,2));await browser.close();}
