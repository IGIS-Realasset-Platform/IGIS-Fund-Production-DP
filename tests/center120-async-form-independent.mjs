import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';

// The browser disconnects a replaced/closed form. The old inert harness did not;
// this small DOM boundary model reproduces that lifecycle without a real user
// session, external network, API mutation or production database.
const files=['src/core.js','src/law-monitor.js'];
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pins=Object.fromEntries(files.map(file=>[file,hash(file)]));
function fixture(){
 const h=makeHarness({modules:['core']}),dialog=h.nodes.get('app-dialog')||h.document.getElementById('app-dialog'),get=h.document.getElementById,template=get('app-form');let html=dialog.innerHTML,form=null;
 Object.defineProperty(dialog,'innerHTML',{get:()=>html,set:value=>{if(form)form.isConnected=false;html=value;form=String(value).includes('id="app-form"')?{...template,isConnected:true}:null;},configurable:true});
 const close=dialog.close;dialog.close=()=>{if(form)form.isConnected=false;close.call(dialog);};
 h.document.getElementById=id=>id==='app-form'?(form?.isConnected?form:null):get(id);
 // Attaching an observer does not turn rejection into success. It prevents the
 // currently broken product's ignored Promise from aborting the whole runner.
 const realForm=h.A.form;h.A.form=(title,fields,callback,...rest)=>realForm(title,fields,(...args)=>{const result=callback(...args);result?.catch?.(()=>{});return result;},...rest);
 return h;
}
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const title=h=>h.nodes.get('app-dialog').innerHTML.match(/<h2[^>]*>([^<]+)/)?.[1]||'';
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
const open=(A,callback)=>A.form('검증 입력',A.field('query','검색어','건축'),callback,'확인',{initialValues:{query:'건축'}});
const checks=[];async function check(name,fn){try{await fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',error:error.message});}}

await check('deferred form stays open and returns an awaitable completion until callback resolves',async()=>{
 const h=fixture(),A=h.A,gate=deferred();open(A,()=>gate.promise);const result=A.formEditor.submit();try{assert.equal(typeof result?.then,'function');assert.equal(h.nodes.get('app-dialog').open,true);assert.equal(A.formEditor.snapshot()?.title,'검증 입력');}finally{gate.resolve(true);await Promise.resolve(result);}assert.equal(h.nodes.get('app-dialog').open,false);
});
await check('a second submit while pending executes the callback only once',async()=>{
 const h=fixture(),A=h.A,gate=deferred();let calls=0;open(A,()=>{calls++;return gate.promise;});const first=A.formEditor.submit(),second=A.formEditor.submit();try{assert.equal(calls,1);assert.equal(A.formEditor.snapshot()?.title,'검증 입력');assert.equal(h.nodes.get('app-dialog').open,true);}finally{gate.resolve(true);await Promise.all([first,second]);}assert.equal(calls,1);assert.equal(h.nodes.get('app-dialog').open,false);
});
await check('resolved false retains the original form and entered values without a write',async()=>{
 const h=fixture(),A=h.A,gate=deferred();open(A,()=>gate.promise);A.formEditor.setValues({query:'변경 검색어'});const before=JSON.stringify(A.state),result=A.formEditor.submit();gate.resolve(false);assert.equal(await result,false);assert.equal(h.nodes.get('app-dialog').open,true);assert.equal(title(h),'검증 입력');assert.equal(A.formEditor.values().query,'변경 검색어');assert.equal(JSON.stringify(A.state),before);
});
await check('async callback opening a child result then returning false keeps that child visible',async()=>{
 const h=fixture(),A=h.A,gate=deferred();open(A,()=>gate.promise.then(()=>{A.modal('검증 결과','<p>검색 결과</p>');return false;}));const result=A.formEditor.submit();gate.resolve();assert.equal(await result,false);assert.equal(h.nodes.get('app-dialog').open,true);assert.equal(title(h),'검증 결과');assert.equal(A.formEditor.snapshot(),null);
});
await check('async rejection keeps the form and exact input rather than silently closing it',async()=>{
 const h=fixture(),A=h.A,gate=deferred();open(A,()=>gate.promise);A.formEditor.setValues({query:'보존할 입력'});const before=JSON.stringify(A.state),result=A.formEditor.submit();gate.reject(A.inputError({query:'다시 확인해 주세요.'}));assert.equal(await result,false);assert.equal(h.nodes.get('app-dialog').open,true);assert.equal(title(h),'검증 입력');assert.equal(A.formEditor.values().query,'보존할 입력');assert.equal(JSON.stringify(A.state),before);
});
await check('cancel during pending request followed by late rejection cannot resurrect the closed form',async()=>{
 const h=fixture(),A=h.A,gate=deferred();open(A,()=>gate.promise);const result=A.formEditor.submit();A.requestModalClose();if(A.pendingDraftScope())A.resolveDraft('close');assert.equal(h.nodes.get('app-dialog').open,false);gate.reject(Error('늦게 도착한 실패'));assert.equal(await result,false);await flush();assert.equal(h.nodes.get('app-dialog').open,false);assert.equal(A.formEditor.snapshot(),null);
});
await check('late rejection cannot replace another form opened after cancellation',async()=>{
 const h=fixture(),A=h.A,gate=deferred();open(A,()=>gate.promise);const result=A.formEditor.submit();A.requestModalClose();if(A.pendingDraftScope())A.resolveDraft('close');A.form('다른 입력',A.field('name','이름','새 입력'),()=>{},'저장',{initialValues:{name:'새 입력'}});gate.reject(Error('이전 요청 실패'));assert.equal(await result,false);await flush();assert.equal(title(h),'다른 입력');assert.equal(A.formEditor.values().name,'새 입력');
});
await check('save-on-close confirmation also deduplicates pending async saves',async()=>{
 const h=fixture(),A=h.A,gate=deferred();let calls=0;open(A,()=>{calls++;return gate.promise;});A.formEditor.setValues({query:'닫기 전 저장'});A.requestModalClose();assert.equal(title(h),'저장하지 않은 변경');const first=A.resolveDraft('save'),second=A.resolveDraft('save');try{assert.equal(calls,1);}finally{gate.resolve(true);await Promise.all([first,second]);}assert.equal(h.nodes.get('app-dialog').open,false);
});
await check('choosing continue-input during save-on-close prevents a late completion from navigating away',async()=>{
 const h=fixture(),A=h.A,gate=deferred();open(A,()=>gate.promise);A.formEditor.setValues({query:'계속 입력할 검색어'});A.requestModalClose();const result=A.resolveDraft('save');A.resolveDraft('stay');assert.equal(title(h),'검증 입력');gate.resolve(true);await Promise.resolve(result);await flush();assert.equal(h.nodes.get('app-dialog').open,true);assert.equal(title(h),'검증 입력');assert.equal(A.formEditor.values().query,'계속 입력할 검색어');
});
await check('synchronous true save retains existing immediate commit and close semantics',async()=>{
 const h=fixture(),A=h.A;let calls=0;open(A,()=>{calls++;return true;});assert.equal(A.formEditor.submit(),true);assert.equal(calls,1);assert.equal(h.nodes.get('app-dialog').open,false);
});
await check('synchronous false child navigation remains unchanged',async()=>{
 const h=fixture(),A=h.A;open(A,()=>{A.modal('동기 결과','<p>결과</p>');return false;});assert.equal(A.formEditor.submit(),false);assert.equal(title(h),'동기 결과');assert.equal(h.nodes.get('app-dialog').open,true);
});

const searchBody={records:[{name:'검증 법률',target:'law',sequence:'123',effectiveAt:'2026-10-20',announcedAt:'2026-10-01',officialUrl:'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=123'}],hasMore:false};
function searchFixture(){const h=fixture(),gate=deferred();let calls=0;h.context.URLSearchParams=URLSearchParams;h.context.fetch=()=>{calls++;return gate.promise;};h.load('law-monitor');h.A.lawMonitor.searchForm('건축');h.A.formEditor.setValues({projectId:h.A.current().id,target:'law',query:'건축'});return {...h,gate,calls:()=>calls};}
await check('actual law-search callback waits for the API and shows its child result in the same dialog',async()=>{
 const h=searchFixture(),result=h.A.formEditor.submit();try{assert.equal(title(h),'법령·조례 검색');assert.equal(h.nodes.get('app-dialog').open,true);}finally{h.gate.resolve({ok:true,json:async()=>searchBody});await Promise.resolve(result);await flush();}assert.equal(title(h),'법령·조례 검색 결과');assert.equal(h.nodes.get('app-dialog').open,true);assert.equal(h.calls(),1);
});
await check('actual law search cancelled before response stays closed when that response arrives',async()=>{
 const h=searchFixture(),result=h.A.formEditor.submit();h.A.requestModalClose();if(h.A.pendingDraftScope())h.A.resolveDraft('close');assert.equal(h.nodes.get('app-dialog').open,false);h.gate.resolve({ok:true,json:async()=>searchBody});await Promise.resolve(result);await flush();assert.equal(h.nodes.get('app-dialog').open,false);assert.equal(h.A.formEditor.snapshot(),null);
});
await check('actual law search via save-on-close cannot show late results after choosing continue-input',async()=>{
 const h=searchFixture();h.A.requestModalClose();assert.equal(title(h),'저장하지 않은 변경');const result=h.A.resolveDraft('save');h.A.resolveDraft('stay');assert.equal(title(h),'법령·조례 검색');h.gate.resolve({ok:true,json:async()=>searchBody});await Promise.resolve(result);await flush();assert.equal(title(h),'법령·조례 검색');assert.equal(h.nodes.get('app-dialog').open,true);assert.equal(h.A.formEditor.values().query,'건축');assert.equal(h.calls(),1);
});

const changedDuringRun=files.filter(file=>hash(file)!==pins[file]);
console.log(JSON.stringify({suite:'center120-async-form-independent',checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,pins,changedDuringRun,realBrowser:false,externalApiCalled:false,actualDatabaseUsed:false}));
if(checks.some(x=>x.status==='failed')||changedDuringRun.length)process.exitCode=1;
