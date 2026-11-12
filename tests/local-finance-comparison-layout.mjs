import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {copyFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {startPreview} from '../scripts/local-preview/server.mjs';
const {chromium}=createRequire(import.meta.url)('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const dir=await mkdtemp(join(tmpdir(),'igis-comparison-'));
let server,browser;
try{
 await copyFile(new URL('../.build/local-preview/original-workspace.json',import.meta.url),join(dir,'original-workspace.json'));
 server=await startPreview({port:0,directory:dir});
 const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[],writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(['POST','PUT','DELETE','PATCH'].includes(r.method()))writes.push(r.url())});
 await page.goto(origin+'/?screen=finance');await page.locator('[data-milestone-add]').waitFor();
 const before=await(await page.request.get(origin+'/api/workspace')).json();
 const panel=page.locator('.studio-stage-comparison');
 for(const width of [1366,1440,1920]){
  await page.setViewportSize({width,height:1100});
  for(const id of await page.locator('[data-cost-basis]').evaluateAll(es=>es.map(e=>e.dataset.costBasis))){
   await page.locator('[data-cost-basis]').evaluateAll((es,id)=>es.find(e=>e.dataset.costBasis===id).click(),id);
   const data=await panel.evaluate(el=>{
    const box=e=>e.getBoundingClientRect(),root=box(el);
    return {height:root.height,cards:[...el.querySelectorAll('.studio-stage-pair')].map(e=>{
     const r=box(e),h=box(e.querySelector('h4')),v=[...e.querySelectorAll('.studio-stage-values > div')].map(d=>({label:box(d.querySelector('span')).toJSON(),amount:box(d.querySelector('b')).toJSON(),text:d.querySelector('b').textContent})),delta=e.querySelector(':scope > small');
     return {key:e.dataset.stageField,rect:r.toJSON(),title:h.toJSON(),values:v,delta:delta?box(delta).toJSON():null};
    })};
   });
   assert.equal(data.height,274,'IOTA source sets comparison height274px');
   for(const c of data.cards){
    assert.equal(c.values.length,2,'최초/선택 단계 두 칸 유지');
    assert.ok(Math.abs(c.title.top-c.rect.top-20)<=1,'제목 상단20px');
    assert.ok(c.delta&&c.delta.bottom<=c.rect.bottom-7,'증감 하단 간격');
    for(const v of c.values){
     assert.ok(v.amount.left>=c.rect.left&&v.amount.right<=c.rect.right,'금액 카드 밖 넘침 없음');
     assert.ok(c.delta.top>=v.amount.bottom,'금액과 증감 겹침 없음');
     assert.ok(c.key==='duration'?v.label.top>=v.amount.bottom:v.label.bottom<=v.amount.top,'개발기간만 단계명을 숫자 아래 배치');
     if(c.key==='construction')assert.match(v.text,/^\d[\d,]*\.\d억원$|^—$/,'공사비 억원 한 자리');
    }
    assert.ok(c.values[0].amount.right<c.values[1].amount.left,'이전/선택 금액 겹침 없음');
   }
  }
 }
 await page.setViewportSize({width:1440,height:1100});
 await page.locator('[data-cost-basis=current]').click();
 // 3126.0487 must round directly to3126.0, not round the previous two-digit display again.
 assert.equal(await page.locator('[data-stage-field=construction] .studio-stage-values b').last().innerText(),'3,126.0억원');
 await panel.screenshot({path:'/private/tmp/idm-ui168-layout.png'});
 await page.locator('[data-stage-action=details]').click();await page.locator('.studio-cost-bases').waitFor();
 await page.locator('[data-milestone-add]').click();await page.locator('[data-stage-input=name]').fill('취소할 단계');
 await page.locator('[data-stage-cancel]').click();
 assert.deepEqual(await(await page.request.get(origin+'/api/workspace')).json(),before);
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
 console.log('LOCAL-UI-168 PASS: desktop1366/1440/1920, stage layouts, rounding, details/add/cancel, zero data writes');
}finally{await browser?.close();await new Promise(r=>server?server.close(r):r());await rm(dir,{recursive:true,force:true})}
