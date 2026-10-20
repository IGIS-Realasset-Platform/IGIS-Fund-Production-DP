import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';

// Independent acceptance probes: source modules run unchanged; only browser/HTTP
// boundaries use in-memory doubles. No real service, account, filesystem store,
// business database, or generated workbook is used by this suite.
const sourcePaths=['src/cbs.js','src/cost-asset-presets.js','src/cost-snapshots.js','src/core.js','src/data/cost-type-master-v4.json','src/data/cost-presets-v2.json'];
const hash=path=>createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const sourcePins=Object.fromEntries(sourcePaths.map(path=>[path,hash(path)]));
const checks=[];
const check=async(name,run)=>{try{await run();checks.push({name,status:'passed'});console.log('PASS '+name);}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message);}};
const stable=value=>JSON.stringify(value);
const protectedProject=p=>stable({cbs:p.cbs,coding:p.costCoding,stages:p.costStages,contracts:p.contracts,vat:[p.vatRecords,p.vatApplications,p.vatReconciliations]});
const drain=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
const dialog=h=>h.nodes.get('app-dialog')?.innerHTML||'';
const click=async(h,action,data={})=>{const button={dataset:{action,...data},disabled:false};for(const listener of h.listeners.click||[])listener({target:{closest:selector=>selector==='[data-action]'?button:null},preventDefault(){}});await drain();return button;};

function boot(){
 const seed={projects:[],companies:[],entities:[],auditEvents:[],notifications:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],sourceLoad:{status:'unavailable'}};
 const h=makeHarness({modules:[],costTaxonomyV4:true,seed});
 h.context.APP_RUNTIME={mode:'real',version:'0.12.0',storageKey:'CENTER120_INDEPENDENT_MEMORY_ONLY'};
 for(const name of ['core','cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','xlsx-export','setup','audit-view'])h.load(name);
 const A=vm.runInContext('App',h.context);h.A=A;A.today='2026-10-20';A.initializers.forEach(init=>init(A.state));
 const register=id=>A.projectRegistration.register({id,name:id,type:'오피스',location:'합성 위치',operator:'합성 법인',manager:'QA',gfaTotal:'1000',siteArea:'500',acquisitionLandArea:'500',evidenceSource:'독립 합성자료',evidenceLocation:'메모리',evidenceAsOf:'2026-10-20',evidencePath:'합성/확인'},'',{navigate:false});
 const p=register('INDEPENDENT_A'),other=register('INDEPENDENT_B');A.ui.projectId=p.id;
 const row=key=>p.cbs.find(item=>item.templateKey===key&&!item.deletedAt);
 assert.equal(A.costTypeMaster.version,'company-cbs-v4','current master must be injected');
 assert.equal(A.costUsePresets.version,'cost-use-presets-v2','current presets must be injected');
 assert.equal(p.cbs.filter(item=>item.managementAccount).length,37,'approved company defaults');
 return{...h,A,p,other,row};
}

function snapshots(h,{role='editor'}={}){
 const requests=[],queue=[];let holdWorkspace=false,releaseWorkspace;
 h.context.fetch=async(url,options={})=>{requests.push({url,options});const item=queue.shift();if(!item)throw Error('UNEXPECTED_SYNTHETIC_REQUEST');if(item.deferred)return item.deferred;if(item.error)throw Error(item.error);return{ok:item.status>=200&&item.status<300,status:item.status,json:async()=>item.body};};
 h.A.cloudPersistence={enabled:()=>true,capabilities:()=>({manageAccess:false}),projectRoles:()=>({[h.p.id]:role,[h.other.id]:'viewer'}),revision:()=>41,pending:()=>holdWorkspace,wait:()=>new Promise(resolve=>{releaseWorkspace=resolve;})};
 h.load('cost-snapshots');
 const original=h.document.querySelector.bind(h.document);
 h.document.querySelector=selector=>selector.includes('[data-cost-snapshot-view]')?dialog(h).includes('data-cost-snapshot-view')?{}:null:original(selector);
 return{api:h.A.costSnapshots,requests,queue,hold(){holdWorkspace=true;},release(){holdWorkspace=false;releaseWorkspace?.();},response:body=>({ok:true,status:200,json:async()=>body})};
}
const metadata=(h,overrides={})=>({id:'snapshot-independent',projectId:h.p.id,kind:'event',label:'독립 확인',asOfDate:'2026-10-20',capturedAt:'2026-10-20T01:00:00.000Z',version:1,reason:'독립 시험',...overrides});
const frozen=(h,overrides={})=>({metadata:metadata(h,overrides),payload:{project:structuredClone(h.p)}});

await check('IND-COST-01 묶음의 두 번째 구성원·중복 ID·다른 사업을 실제 버튼 범위로 구별',async()=>{
 const h=boot(),{A,p,row}=h;A.domain.saveCost(p,row('land_purchase').id,1000001);A.domain.saveCost(p,row('land_acquisition_tax').id,2000002);
 const group=A.companyCostProfile.visibleManagementNodes(p).find(item=>item.companyProfileRoot&&item.name==='토지비');assert(group);
 const first=row('land_purchase').id,second=row('land_acquisition_tax').id;
 const own=[{id:'ind-first',projectId:p.id,idRef:first,entity:'cbs',action:'UPDATE',at:'2026-10-20T00:10:00Z'},{id:'ind-second',projectId:p.id,idRef:second,entity:'cbs',action:'UPDATE',at:'2026-10-20T00:11:00Z'}];
 A.state.auditEvents.unshift(...own,{...own[1]},{...own[1],id:'ind-outside',projectId:h.other.id});
 const table=A.renderCostDetail(p),start=table.indexOf('data-cbs-row="'+group.id+'"');assert(start>=0);const markup=table.slice(start,table.indexOf('</tr>',start));assert(markup.includes('data-action="cbs-history"'));assert(markup.includes('data-id="'+group.id+'"'));
 const events=A.domain.costHistory(p,group.id);assert(events.some(e=>e.id==='ind-first'));assert.equal(events.filter(e=>e.id==='ind-second').length,1);assert(!events.some(e=>e.id==='ind-outside'));
 await click(h,'cbs-history',{id:group.id});assert(dialog(h).includes('토지비 이력'));
});

await check('IND-COST-02 이력 목록·상세의 한국시간 자정 경계 일치',async()=>{
 const h=boot(),r=h.row('land_purchase'),event={id:'kst-boundary',projectId:h.p.id,idRef:r.id,entity:'cbs',action:'UPDATE',at:'2026-10-19T15:10:00.000Z',before:{current:0},after:{current:1},actor:'독립검사'};
 h.A.state.auditEvents.unshift(event);await click(h,'cbs-history',{id:r.id});assert(dialog(h).includes('2026-10-20 00:10'));assert(!dialog(h).includes('2026-10-19 15:10'));assert(h.A.auditPresentation.renderDetail(event).includes('2026-10-20 00:10'));
});

await check('IND-COST-03 묶음 당시 금액은 두 독립 입력의 합계이고 현재 수정이 동결본을 바꾸지 않음',()=>{
 const h=boot(),{A,p,row}=h;A.domain.saveCost(p,row('land_purchase').id,1000001);A.domain.saveCost(p,row('land_acquisition_tax').id,2000002);
 const stage=A.domain.snapshot(p,'custom','독립 기준','2026-10-20',A.areas.current(p),'합성/기준');p.costStages.push(stage);const before=stable(stage);
 A.domain.saveCost(p,row('land_acquisition_tax').id,2000005);const group=A.companyCostProfile.visibleManagementNodes(p).find(item=>item.companyProfileRoot&&item.name==='토지비'),history=A.domain.costStageHistory(p,group.id).find(item=>item.stage.id===stage.id);
 assert.equal(history.value,3000003,'independent entered amounts, not first component');assert.equal(A.companyCostProfile.resolve(p,group.id).current,3000006);assert.equal(stable(stage),before);
});

await check('IND-COST-04 이전 등록 출처의 동일 선택 재적용은 원금액·모드·저장·감사 무변이',()=>{
 const h=boot(),{A,p}=h;A.costUsePresets.apply(p,'office',{mode:'registration',selectedTargetIds:['corp_lease'],businessMode:'lease'});const before=stable(A.state);let writes=0;const old=h.context.localStorage.setItem;h.context.localStorage.setItem=(...args)=>{writes++;return old(...args);};
 const result=A.costUsePresets.apply(p,'office',{mode:'explicit',selectedTargetIds:['corp_lease'],businessMode:'lease'});assert.equal(result.changed,false);assert.equal(writes,0);assert.equal(stable(A.state),before);assert.equal(p.costUsePreset.mode,'registration');
});

await check('IND-COST-05 숨긴 선택항목 재추가는 기존 ID·금액을 보존하고 후보에서 사라짐',()=>{
 const h=boot(),{A,p}=h;A.costUsePresets.apply(p,'office',{selectedTargetIds:['corp_lease'],businessMode:'lease'});const original=p.cbs.find(item=>A.costCoding.resolve(p,item.id)?.costTypeId==='corp_lease');assert(original);A.domain.saveCost(p,original.id,1234567);A.companyCostProfile.setVisible(p,'corp_lease',false);
 const before=protectedProject(p),preview=A.costUsePresets.preview(p,'office',{businessMode:'lease'});assert(preview.candidates.some(item=>item.targetId==='corp_lease'),stable({phase:'hidden-candidate',preferences:p.companyCostDisplayPrefs,matchingNodes:A.companyCostProfile.managementNodes(p).filter(item=>item.companyTaxonomyTargetId==='corp_lease').map(item=>({id:item.id,key:item.companyProfileKey,tier:item.tier,managementIds:item.managementIds,sourceIds:item.sourceIds})),visible:A.companyCostProfile.visibleManagementNodes(p).filter(item=>item.companyTaxonomyTargetId==='corp_lease').map(item=>item.id),preview}));const result=A.costUsePresets.apply(p,'office',{selectedTargetIds:['corp_lease'],businessMode:'lease'});assert.equal(result.createdRecordIds.length,0);assert.equal(p.cbs.find(item=>item.id===original.id).current,1234567);assert.equal(protectedProject(p),before);assert(!A.costUsePresets.preview(p,'office',{businessMode:'lease'}).candidates.some(item=>item.targetId==='corp_lease'));
});

await check('IND-COST-06 미선택·타사업 오래된 버튼은 항목·원금액·감사·확정본 무변이',async()=>{
 const h=boot(),{A,p}=h,before=stable(A.state);assert.equal(A.costUsePresets.apply(p,'hotel',{selectedTargetIds:[],businessMode:'operation'}).changed,false);assert.equal(stable(A.state),before);
 await click(h,'cbs-preset-open');A.ui.projectId=h.other.id;await click(h,'cbs-preset-preview',{projectId:p.id,id:'hotel'});assert.equal(stable(A.state),before);assert.equal(A.ui.projectId,h.other.id);
});

await check('IND-COST-07 프리셋 저장 실패는 원장·원금액·계약VAT·다른 사업·감사를 일괄 원복',()=>{
 const h=boot(),{A,p}=h;A.save();const before=stable(A.state);h.setWriteFailure(true);assert.throws(()=>A.costUsePresets.apply(p,'for_sale_housing',{businessMode:'sale',selectedTargetIds:['corp_sales_agency']}),/저장|quota/);h.setWriteFailure(false);assert.equal(stable(A.state),before);
});

await check('IND-COST-08 프리셋 부모 복귀는 한 번이며 위탁을 배제하지 않는 운영형 문구',async()=>{
 const h=boot();await click(h,'cbs-preset-open');await click(h,'cbs-preset-preview',{projectId:h.p.id,id:'hotel'});assert(dialog(h).includes('운영형'),'operating business can use a third-party operator');assert(!dialog(h).includes('직접 운영'));
 h.A.requestModalClose();assert(dialog(h).includes('용도별 사업비 프리셋'));h.A.requestModalClose();assert.equal(h.nodes.get('app-dialog').open,false);
});

await check('IND-COST-09 모든 신규사업은 공통37개·빈 금액이며 용도 후보는 의무비용이 아님',()=>{
 const h=boot(),{A,p}=h;assert.equal(p.cbs.filter(item=>item.managementAccount).length,37);assert(p.cbs.every(item=>item.current===null&&item.initial===null));assert.equal(A.total(p),null);assert(!p.cbs.some(item=>A.costCoding.resolve(p,item.id)?.costTypeId==='corp_lease'));
 const before=stable(A.state);for(const definition of A.costUsePresets.definitions()){const preview=A.costUsePresets.preview(p,definition.id);assert(preview.candidates.every(item=>item.selected===false));for(const item of preview.candidates)assert(A.costTypeMaster.entry(item.targetId)?.newSelectable);}assert.equal(stable(A.state),before);
});

await check('IND-COST-10 뒤늦은 과거예산 정정은 이후 승인예산을 자동 철회하지 않음',()=>{
 const h=boot(),{api}=snapshots(h),records=[{id:'budget-may',kind:'approvedBudget',asOfDate:'2026-05-05',capturedAt:'2026-05-05T01:00:00Z',version:1},{id:'budget-oct',kind:'approvedBudget',asOfDate:'2026-10-01',capturedAt:'2026-10-01T01:00:00Z',version:2},{id:'budget-may-correction',kind:'approvedBudget',asOfDate:'2026-05-05',capturedAt:'2026-10-20T01:00:00Z',version:3,correctsId:'budget-may'},{id:'later-quarter',kind:'quarterly',asOfDate:'2026-12-31',capturedAt:'2027-01-02T01:00:00Z',version:4},{id:'later-event',kind:'event',asOfDate:'2027-01-05',capturedAt:'2027-01-05T01:00:00Z',version:5}];assert.equal(api.latestApproved(records)?.id,'budget-oct');
});

await check('IND-COST-11 승인예산 정정사슬·날짜 미확보·정기/주요시점 분리',()=>{
 const h=boot(),{api}=snapshots(h),chain=[{id:'a',kind:'approvedBudget',capturedAt:'2026-01-01T01:00:00Z',version:1},{id:'b',kind:'approvedBudget',correctsId:'a',capturedAt:'2026-01-02T01:00:00Z',version:2},{id:'c',kind:'approvedBudget',correctsId:'b',capturedAt:'2026-01-03T01:00:00Z',version:3}];assert.equal(api.latestApproved(chain)?.id,'c');assert.equal(api.latestApproved([...chain,{id:'separate',kind:'approvedBudget',asOfDate:'2026-10-01',capturedAt:'2026-10-01T00:00:00Z'}]),null,'unknown date is not an older actual approval date');assert.equal(api.latestApproved([{id:'q',kind:'quarterly',asOfDate:'2026-12-31'},{id:'e',kind:'event',asOfDate:'2027-01-01'}]),null);
});

await check('IND-COST-12 비교는 독립 원단위 합계·증감·계약범위와 동결 불변을 보존',()=>{
 const h=boot(),{A,p,row}=h;A.domain.saveCost(p,row('land_purchase').id,1000001);A.domain.saveCost(p,row('land_acquisition_tax').id,2000002);const {api}=snapshots(h),snapshot=frozen(h),original=stable(snapshot),untouched=protectedProject(h.other);
 A.domain.saveCost(p,row('land_acquisition_tax').id,2000005);const change=A.state.auditEvents.find(item=>item.idRef===row('land_acquisition_tax').id&&item.action==='UPDATE');change.at='2026-10-20T02:00:00Z';change.reason='취득 사건 정정';p.contracts.push({id:'contract-independent',name:'취득 실행 계약',revisions:[{allocations:[{cbsId:row('land_acquisition_tax').id,amount:2000005}]}]});
 const rows=api.comparison(snapshot,p),total=rows.find(item=>item.id==='__total__'),land=rows.find(item=>item.name==='토지비');assert.equal(total.before,3000003);assert.equal(total.after,3000006);assert.equal(total.delta,3);assert.equal(land.before,3000003);assert.equal(land.after,3000006);assert(land.reason.includes('취득 사건 정정'));assert(land.contracts.includes('취득 실행 계약'));assert.equal(stable(snapshot),original);assert.equal(protectedProject(h.other),untouched);
});

await check('IND-COST-13 빈 금액과 확인된0을 비교·단일 Excel에서 구별하고 내부코드는 출력하지 않음',()=>{
 const h=boot(),{A,p,row}=h,{api}=snapshots(h),snapshot=frozen(h);A.domain.saveCost(p,row('land_acquisition_tax').id,0);const match=api.comparison(snapshot,p).find(item=>item.name==='취득세·이전등기비');assert(match);assert.equal(match.before,null);assert.equal(match.after,0);assert.equal(match.delta,null);
 const result=api.exportComparison(snapshot,p,{download:false});assert.equal(result.model.sheets.length,1);const sheet=result.model.sheets[0];assert.deepEqual(Array.from(sheet.rows[2].cells,item=>item.value),['대분류','원가항목','저장 당시','현재 준공추정원가','증감','변경','사유','관련 계약']);const values=sheet.rows.flatMap(row=>row.cells.map(cell=>cell.value));assert(!values.some(value=>typeof value==='string'&&/IGIS-COST:|management:v4:|ct_/.test(value)));assert(result.bytes.length>100);const exported=sheet.rows.find(row=>row.cells[1]?.value==='취득세·이전등기비');assert.equal(exported.cells[2].value,null);assert.equal(exported.cells[3].value,0);assert.equal(exported.cells[4].value,null);
});

await check('IND-COST-14 분기·주요시점 저장은 프로젝트·원본 revision만 전송하고 현재자료를 직접 쓰지 않음',async()=>{
 const h=boot(),{api,queue,requests}=snapshots(h),input={...api.newDraft(h.p,{kind:'quarterly',quarterKey:'2026-Q4'}),label:'4분기 확인',asOfDate:'2026-10-20',reason:'담당 확인'},before=stable(h.A.state);queue.push({status:201,body:{snapshot:{metadata:metadata(h,{kind:'quarterly',quarterKey:'2026-Q4'})}}});await api.save(input);const body=JSON.parse(requests[0].options.body);assert.equal(body.expectedRevision,41);assert.equal(body.quarterKey,'2026-Q4');assert.equal(body.asOfDate,'2026-10-20');assert(!('state' in body));assert(!('payload' in body));assert.equal(stable(h.A.state),before);
});

await check('IND-COST-15 저장409·통신실패는 requestId·입력·원금액·과거·다른사업을 유지',async()=>{
 const h=boot(),{api,queue}=snapshots(h),input={...api.newDraft(h.p),label:'확인',asOfDate:'2026-10-20',reason:'실패 보존'},before=stable(input),state=stable(h.A.state);queue.push({status:409,body:{error:'REVISION_CONFLICT'}});await assert.rejects(api.save(input),/다른 사용자/);assert.equal(stable(input),before);assert.equal(stable(h.A.state),state);assert.equal(api.pending(h.p.id),false);queue.push({error:'synthetic-offline'});await assert.rejects(api.save(input),/연결 상태/);assert.equal(stable(input),before);assert.equal(stable(h.A.state),state);assert.equal(api.pending(h.p.id),false);
});

await check('IND-COST-16 중복 클릭은 한 요청이고 기다리는 동안 프로젝트가 바뀌면 전송하지 않음',async()=>{
 const h=boot(),s=snapshots(h),input={...s.api.newDraft(h.p),label:'확인',asOfDate:'2026-10-20',reason:'대기'};let release;s.queue.push({deferred:new Promise(resolve=>{release=resolve;})});const first=s.api.save(input);await drain();await assert.rejects(s.api.save(input),/저장하고 있습니다/);assert.equal(s.requests.length,1);release(s.response({snapshot:{metadata:metadata(h)}}));await first;
 s.hold();const waiting=s.api.save({...input,requestId:'independent-new-request'});const rejected=assert.rejects(waiting,/프로젝트가 변경/);h.A.ui.projectId=h.other.id;s.release();await rejected;assert.equal(s.requests.length,1);assert.equal(s.api.pending(h.p.id),false);
});

await check('IND-COST-17 viewer는 기록추가 불가·editor의 승인예산 별도차단·다른사업 응답거부',async()=>{
 const h=boot(),s=snapshots(h);assert.throws(()=>s.api.newDraft(h.p,{kind:'approvedBudget'}),/권한/);s.queue.push({status:200,body:{snapshot:{metadata:metadata(h,{projectId:h.other.id}),payload:{project:h.other}}}});await assert.rejects(s.api.detail(h.p.id,'snapshot-independent'),/다른 사업/);s.queue.push({status:200,body:{snapshots:[metadata(h,{projectId:h.other.id})],tasks:[]}});await assert.rejects(s.api.list(h.p.id),/목록/);const viewer=boot(),v=snapshots(viewer,{role:'viewer'});assert.throws(()=>v.api.newDraft(viewer.p),/권한/);assert.equal(v.requests.length,0);
});

await check('IND-COST-18 시점 상세·입력은 실제 부모 목록으로 한 번 복귀하고 최종 닫힘',async()=>{
 const h=boot(),s=snapshots(h),meta=metadata(h);s.queue.push({status:200,body:{snapshots:[meta],tasks:[]}});await s.api.open(h.p.id);s.queue.push({status:200,body:{snapshot:{metadata:meta,payload:{project:structuredClone(h.p)}}}});await click(h,'cost-snapshot-detail',{projectId:h.p.id,id:meta.id});assert(dialog(h).includes('현재 사업비 비교'));h.A.requestModalClose();assert(dialog(h).includes('사업비 시점 기록'));h.A.requestModalClose();assert.equal(h.nodes.get('app-dialog').open,false);
 s.queue.push({status:200,body:{snapshots:[meta],tasks:[]}});await s.api.open(h.p.id);await click(h,'cost-snapshot-new',{projectId:h.p.id,kind:'event'});assert(dialog(h).includes('snapshot-label'));h.A.requestModalClose();assert(dialog(h).includes('사업비 시점 기록'));h.A.requestModalClose();assert.equal(h.nodes.get('app-dialog').open,false);
});

const changedDuringRun=sourcePaths.filter(path=>hash(path)!==sourcePins[path]);
const summary={suite:'center120-cost-independent',scope:'current-source-memory-only; no production API, database, account, or browser layout verification',sourcePins,changedDuringRun,passed:checks.filter(check=>check.status==='passed').length,failed:checks.filter(check=>check.status==='failed').length,total:checks.length,checks};
console.log(JSON.stringify(summary));if(summary.failed||changedDuringRun.length)process.exitCode=1;
