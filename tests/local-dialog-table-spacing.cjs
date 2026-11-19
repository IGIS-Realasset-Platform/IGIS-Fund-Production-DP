const assert=require('node:assert/strict');
const {chromium}=require('/Users/jkjeon2025/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const origin='http://127.0.0.1:4178';
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage(),writes=[];
 await context.route('**/*',r=>{const q=r.request();if(!['GET','HEAD'].includes(q.method())){writes.push(q.url());return r.abort();}return q.url().startsWith(origin)||q.url().startsWith('data:')?r.continue():r.abort();});
 try{
  await page.goto(origin+'/?screen=finance');await page.locator('[data-stage-action=details]').waitFor();
  const results=await page.evaluate(()=>{
   const table='<div class="table-wrap"><table class="dense-table"><thead><tr><th>항목</th></tr></thead><tbody><tr><td>조회값</td></tr></tbody></table></div>';
   const cases=[['단독표',table,true],['안내와표','<p>안내</p>'+table,true],['중첩표','<div class="loan-history-content">'+table+'</div>',true],['복수표',table+table,true],['조회버튼',table+'<button>내역 보기</button>',true],['조달내역','<div class="studio-capital-details">'+table+'</div>',true],['입력폼','<form id="app-form">'+table+'<input></form>',false],['선택목록','<div class="cbs-catalog-shell">'+table+'</div>',false],['고정탭','<div class="permit-detail-tabs"></div>'+table,false]];
   return cases.map(([name,body,match])=>{App.modal(name,body);const e=document.querySelector('#app-dialog > .dialog-body'),s=getComputedStyle(e);return{name,match,top:s.paddingTop,bottom:s.paddingBottom,left:s.paddingLeft,right:s.paddingRight};});
  });
  for(const r of results){assert.equal(r.top,r.match?r.left:'12px',r.name);assert.equal(r.bottom,r.match?r.right:'12px',r.name);}
  await page.keyboard.press('Escape');assert.equal(await page.locator('#app-dialog').evaluate(e=>e.open),false);
  for(const action of ['finance-quarter-list','finance-history-list']){
   await page.locator('[data-action="'+action+'"]').click();
   const p=await page.locator('#app-dialog > .dialog-body').evaluate(e=>{const s=getComputedStyle(e);return[s.paddingTop,s.paddingBottom,s.paddingLeft,s.paddingRight]});
   assert.deepEqual(p,['18px','18px','18px','18px'],action);
   await page.locator('#app-dialog [data-action="modal-close"]').click();
  }
  assert.deepEqual(writes,[]);console.log('PASS 조회표6구조/제외3구조/실제 금융팝업2종/닫기/Escape/쓰기0',JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
