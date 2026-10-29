import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';
import {validateWorkspaceState,validateProjectCostChange,mergeWorkspaceState} from '../server/cloud-storage.mjs';
import masterV3 from '../src/data/cost-type-master-v3.json' with {type:'json'};

const checks=[],copy=value=>JSON.parse(JSON.stringify(value)),sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function boot(options={}){
 const h=makeHarness({modules:[],seed:{projects:[],entities:[],companies:[],auditEvents:[],notifications:[]},costTaxonomyV4:true});
 h.load('core');const A=vm.runInContext('App',h.context),handlers=new Map(),on=A.on;A.on=(name,callback)=>{handlers.set(name,callback);on(name,callback);};
 for(const name of ['cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','setup','contracts','vat']){const sourceAt=process.argv.indexOf('--cbs-source');if(name==='cbs'&&sourceAt>=0){const path=process.argv[sourceAt+1],expected=process.argv[process.argv.indexOf('--cbs-sha')+1];assert.match(expected||'',/^[a-f0-9]{64}$/);assert.equal(sha(path),expected,'explicit baseline override source pin required');const read=fs.readFileSync;fs.readFileSync=(file,...rest)=>String(file).replaceAll('\\','/')==='src/cbs.js'?read(path,...rest):read(file,...rest);try{h.load(name)}finally{fs.readFileSync=read;}}else h.load(name);}
 A.realMode=true;for(const init of A.initializers)init(A.state);
 const register=id=>A.projectRegistration.register({id,name:'가상 '+id,type:'오피스',location:'격리 위치',operator:'격리 법인',manager:'QA',gfaTotal:'1000',siteArea:'500',acquisitionLandArea:'500',evidenceSource:'독립 합성',evidenceLocation:'합치기 범위 보존',evidenceAsOf:'2026-10-20',evidencePath:'QA/merge'},'',{navigate:false});
 const p=register('MERGE_SCOPE_A'),other=register('MERGE_SCOPE_B'),from=p.cbs.find(row=>row.templateKey==='land_purchase');
 const fromAmount=options.fromAmount??1000001,toAmount=options.toAmount??2000000;
 A.ui.projectId=p.id;A.ui.view='cost';A.ui.tabs.cost='detail';A.domain.saveCost(p,from.id,fromAmount);
 const to=A.domain.addCost(p,from.parentId,'독립 매입 계약',toAmount,{managementAccount:true,budgetState:'active',costTypeId:'land_purchase'});
 if(options.fromScope!==undefined)from.budgetScopeRef=options.fromScope;
 if(options.toScope!==undefined)to.budgetScopeRef=options.toScope;
 if(options.ancestorScope)p.cbs.find(row=>row.id===from.parentId).budgetScopeRef=options.ancestorScope;
 p.contracts.push({id:'LINKED_CONTRACT',name:'연결 보존 계약',counterparty:'격리 상대',type:'기타',period:'2026',date:'2026-01-01',status:'체결',file:'격리/계약.pdf',cbsId:from.id,cbsIds:[from.id],revisions:[{id:'LINKED_REVISION',revision:1,date:'2026-01-01',total:fromAmount,net:fromAmount,vat:0,costAmount:fromAmount,allocations:[{cbsId:from.id,amount:fromAmount}],file:'격리/계약.pdf',note:'명시 독립 원계약'}],obligations:[],payments:[],certifications:[],paymentCoverage:{status:'unknown'}});
 A.contracts.validateAllocations(p.contracts[0].revisions[0].allocations,fromAmount,p,true);
 const vat=A.vat.save(p,{kind:'cost',id:from.id},{mode:'budget',asOf:'2026-01-01',transactionType:'exempt',attribution:'land',deduction:'none',net:fromAmount,vat:0,gross:fromAmount,reviewStatus:'draft',amountBasis:'net',sourcePath:'격리/부가세',applyToCost:false});assert(vat.calculation.valid);
 if(!options.duplicate)p.costStages.push(A.domain.snapshot(p,'custom','합치기 전','2026-10-20',A.areas.current(p),'격리/과거'));
 return{...h,A,p,other,from,to,vat,handlers};
}
const protectedParts=h=>JSON.stringify({contracts:h.p.contracts,vat:[h.p.vatRecords,h.p.vatApplications,h.p.vatReconciliations],stages:h.p.costStages,other:h.other});
const liveSource=(h,id)=>h.p.cbs.find(row=>!row.deletedAt&&row.originCbsId===id);
const test=(name,run)=>{const at=process.argv.indexOf('--filter');if(at>=0&&!name.includes(process.argv[at+1]))return;try{run();checks.push({name,pass:true});}catch(error){checks.push({name,pass:false,message:error.message});}};

for(const config of [{label:'원래 범위 부재',fromScope:undefined,toScope:'EXPLICIT_TO'},{label:'서로 다른 명시 범위',fromScope:'EXPLICIT_FROM',toScope:'EXPLICIT_TO'},{label:'상위에서 상속한 범위',ancestorScope:'ANCESTOR_FROM',toScope:'EXPLICIT_TO'},{label:'원래 빈 문자열도 상속은 기존대로',fromScope:'',ancestorScope:'ANCESTOR_FROM',toScope:'EXPLICIT_TO'}])test(config.label+'의 정상 독립 합치기는 총액과 참조를 보존한다',()=>{
 const h=boot(config),before=protectedParts(h),from=copy(h.from),to=copy(h.to),events=new Set(h.A.state.auditEvents.map(row=>row.id)),originalBindings=copy([h.A.costCoding.resolve(h.p,h.from.id),h.A.costCoding.resolve(h.p,h.to.id)]);
 assert.equal(h.A.total(h.p),3000001);assert.equal(h.A.domain.costExcelContributionTrace(h.p).unresolvedBudgetConflicts.length,0);
 h.A.domain.mergeInto(h.p,from.id,to.id);
 assert.equal(h.A.total(h.p),3000001);assert.equal(h.A.amount(h.p,to.id),3000001);assert.equal(h.from.current,1000001);assert.equal(h.to.current,2000000);
 for(const key of ['id','code','name','initial','budgetScopeRef']){assert.deepEqual(h.from[key],from[key]);assert.deepEqual(h.to[key],to[key]);}
 assert(h.from.deletedAt);assert.equal(h.from.mergedIntoId,to.id);assert.equal(h.A.managementOwner(h.p,from.id).id,to.id);assert.equal(h.A.domain.costExcelContributionTrace(h.p).unresolvedBudgetConflicts.length,0);
 assert.equal(protectedParts(h),before);assert.equal(h.A.contracts.itemFunds(h.p,to.id).contractAmount,1000001);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:from.id}).source.value,1000001);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:from.id}).sourceDrift,false);
 assert.deepEqual(copy([h.A.costCoding.resolve(h.p,from.id),h.A.costCoding.resolve(h.p,to.id)]),originalBindings);for(const id of [from.id,to.id])assert.equal(h.A.costCoding.resolve(h.p,liveSource(h,id).id).method,'merge-source-copy');
 const created=h.A.state.auditEvents.filter(row=>!events.has(row.id));assert.equal(created.filter(row=>row.action==='MERGE').length,1);assert.equal(created[0].action,'MERGE');assert(!created.some(row=>row.entity==='vatRecord'));
});

test('명시적으로 같은 예산의 중복은 합치기로 숨기지 않고 부분 기록도 쓰지 않는다',()=>{
 const h=boot({fromScope:'SAME_BUDGET',toScope:'SAME_BUDGET',duplicate:true});assert.equal(h.A.total(h.p),null);assert(h.A.domain.costExcelContributionTrace(h.p).unresolvedBudgetConflicts.length>0);
 const before=JSON.stringify(h.A.state);assert.throws(()=>h.A.domain.mergeInto(h.p,h.from.id,h.to.id),/같은 예산|중복|합치기 전후/);assert.equal(JSON.stringify(h.A.state),before);
});

test('합친 원자료를 수정해도 새 상위 범위를 부당하게 상속하지 않는다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'}),before=protectedParts(h);h.A.domain.mergeInto(h.p,h.from.id,h.to.id);const source=liveSource(h,h.from.id);assert(source);h.A.domain.saveCost(h.p,source.id,1100001);assert.equal(h.A.total(h.p),3100001);assert.equal(h.A.amount(h.p,h.to.id),3100001);assert.equal(protectedParts(h),before);
});

test('합친 원자료의 후속 하위 분해도 같은 범위 정의를 사용한다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'}),before=protectedParts(h);h.A.domain.mergeInto(h.p,h.from.id,h.to.id);const source=liveSource(h,h.from.id);
 h.A.costBreakdown.activate(h.p,source.id,[{inputMode:'direct',name:'독립 계약 전반',amount:400000},{inputMode:'direct',name:'독립 계약 후반',amount:600001}],{confirmed:true,reason:'명시 분해'});
 assert.equal(h.A.total(h.p),3000001);assert.equal(protectedParts(h),before);assert.equal(h.A.domain.costExcelContributionTrace(h.p).unresolvedBudgetConflicts.length,0);
});

test('반복 합치기에서도 기존 범위 부재와 명시 범위를 유지한다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'}),before=protectedParts(h);h.A.domain.mergeInto(h.p,h.from.id,h.to.id);const third=h.A.domain.addCost(h.p,h.to.parentId,'별도 세 번째 계약',5000000,{managementAccount:true,budgetState:'active',costTypeId:'land_purchase',budgetScopeRef:'THIRD'});
 h.A.domain.mergeInto(h.p,h.to.id,third.id);assert.equal(h.A.total(h.p),8000001);assert.equal(h.A.amount(h.p,third.id),8000001);assert.equal(h.A.managementOwner(h.p,h.from.id).id,third.id);assert.equal(h.A.managementOwner(h.p,h.to.id).id,third.id);assert.equal(h.A.domain.costExcelContributionTrace(h.p).unresolvedBudgetConflicts.length,0);assert.equal(protectedParts(h),before);
});

test('저장 실패 시 원금액·별명·범위·계약·VAT·확정본·감사를 전부 원복한다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'}),before=JSON.stringify(h.A.state);h.setWriteFailure(true);assert.throws(()=>h.A.domain.mergeInto(h.p,h.from.id,h.to.id),/quota|저장/);assert.equal(JSON.stringify(h.A.state),before);
});

test('서로 다른 명시 범위의 후속 같은 범위 중복 저장 차단은 유지한다',()=>{
 const h=boot({fromScope:'EXPLICIT_FROM',toScope:'EXPLICIT_TO'});h.A.domain.mergeInto(h.p,h.from.id,h.to.id);const source=liveSource(h,h.from.id);assert(source);
 const duplicate=h.A.domain.addCost(h.p,h.to.parentId,'같은 범위 중복 후보',null,{managementAccount:true,budgetState:'template',costTypeId:'land_purchase',budgetScopeRef:'EXPLICIT_FROM'}),before=JSON.stringify(h.A.state);
 assert.throws(()=>h.A.domain.saveCost(h.p,duplicate.id,100),/같은 예산범위/);assert.equal(JSON.stringify(h.A.state),before);
});

for(const fromAmount of [2000000,0])test('양쪽 기존 VAT는 각각 원래 범위를 읽고 진짜 변경만 추적한다 '+fromAmount,()=>{
 const h=boot({fromAmount,toAmount:1000001,toScope:'EXPLICIT_TO'});h.A.vat.save(h.p,{kind:'cost',id:h.to.id},{mode:'budget',asOf:'2026-01-01',transactionType:'exempt',attribution:'land',deduction:'none',net:1000001,vat:0,gross:1000001,reviewStatus:'draft',amountBasis:'net',sourcePath:'격리/다른쪽 부가세',applyToCost:false});
 const frozen=protectedParts(h);h.A.domain.mergeInto(h.p,h.from.id,h.to.id);
 for(const[id,amount]of [[h.from.id,fromAmount],[h.to.id,1000001]]){const summary=h.A.vat.summaryFor(h.p,{kind:'cost',id});assert.equal(summary.source.value,amount);assert.equal(summary.sourceDrift,false);}
 assert.equal(h.A.amount(h.p,h.to.id),fromAmount+1000001);assert.equal(protectedParts(h),frozen);
 const fromSource=liveSource(h,h.from.id),toSource=liveSource(h,h.to.id);h.A.domain.saveCost(h.p,fromSource.id,fromAmount+7);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:h.from.id}).source.value,fromAmount+7);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:h.from.id}).sourceDrift,true);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:h.to.id}).source.value,1000001);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:h.to.id}).sourceDrift,false);
 h.A.domain.saveCost(h.p,toSource.id,1000008);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:h.to.id}).source.value,1000008);assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:h.to.id}).sourceDrift,true);assert.equal(protectedParts(h),frozen);
});

test('미입력 대상의 기존 VAT는 합쳐 들어온 다른 범위 금액으로 채워지지 않는다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'});h.A.domain.saveCost(h.p,h.to.id,null);h.to.budgetState='template';h.A.vat.save(h.p,{kind:'cost',id:h.to.id},{mode:'budget',asOf:'2026-01-01',transactionType:'unknown',attribution:'unknown',deduction:'unknown',net:null,vat:null,gross:null,reviewStatus:'draft',amountBasis:'unknown',sourcePath:'격리/미입력 검토',applyToCost:false});const before=protectedParts(h);
 assert.equal(h.A.vat.summaryFor(h.p,{kind:'cost',id:h.to.id}).source.value,null);h.A.domain.mergeInto(h.p,h.from.id,h.to.id);assert.equal(h.A.amount(h.p,h.to.id),1000001);const summary=h.A.vat.summaryFor(h.p,{kind:'cost',id:h.to.id});assert.equal(summary.source.value,null);assert.equal(summary.sourceDrift,false);assert.equal(protectedParts(h),before);
});

test('원자료 집합 키가 없는 일반 항목은 기존 현재금액 정의를 유지한다',()=>{
 const h=boot();assert(!Object.hasOwn(h.from,'mergedSourceIds'));assert.equal(h.A.domain.mergedCostSourceInfo(h.p,h.from.id).value,1000001);assert.equal(h.A.vat.sourceOf(h.p,'cost',h.from.id).value,1000001);h.A.domain.saveCost(h.p,h.from.id,0);assert.equal(h.A.domain.mergedCostSourceInfo(h.p,h.from.id).value,0);assert.equal(h.A.vat.sourceOf(h.p,'cost',h.from.id).value,0);
});

test('합친 원자료 집합의 일부 미입력과 확인된 상세합계를 구별한다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'}),contracts=h.p.contracts;h.p.contracts=[];const children=h.A.domain.split(h.p,h.from.id,'확인된 상세',400000);h.p.contracts=contracts;children[1].current=null;const before=protectedParts(h);assert.equal(h.A.amount(h.p,h.from.id),null);h.A.domain.mergeInto(h.p,h.from.id,h.to.id);const source=h.A.domain.mergedCostSourceInfo(h.p,h.from.id);assert.equal(source.value,null);assert.equal(source.knownSum,400000);assert.equal(source.unknownCount,1);assert.equal(h.A.vat.sourceOf(h.p,'cost',h.from.id).value,null);assert.equal(h.A.domain.mergedCostSourceInfo(h.p,h.to.id).value,2000000);assert.equal(protectedParts(h),before);
});

test('이동할 기존 하위의 상속 범위와 별도 명시 범위가 모두 보존된다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'});h.p.contracts=[];h.p.vatRecords=[];const split=h.A.domain.split(h.p,h.from.id,'독립 첫 내역',400000);
 split[0].budgetScopeRef='EXPLICIT_CHILD';h.from.budgetScopeRef='ORIGINAL_PARENT';assert.equal(h.A.total(h.p),3000001);const stages=JSON.stringify(h.p.costStages),codes=copy(split.map(row=>[row.id,row.code,row.current]));h.A.domain.mergeInto(h.p,h.from.id,h.to.id);
 assert.equal(h.A.total(h.p),3000001);assert.equal(h.A.domain.effectiveBudgetScopeRef(h.p,split[0]),'EXPLICIT_CHILD');assert.equal(h.A.domain.effectiveBudgetScopeRef(h.p,split[1]),'ORIGINAL_PARENT');assert.deepEqual(copy(split.map(row=>[row.id,row.code,row.current])),codes);assert.equal(JSON.stringify(h.p.costStages),stages);
});

test('현재 하위 분해는 기존 유효 범위와 별도 원가를 합산에서 보존한다',()=>{
 const h=boot({fromScope:'EXPLICIT_FROM',toScope:'EXPLICIT_TO'}),before=protectedParts(h);h.A.costBreakdown.activate(h.p,h.from.id,[{inputMode:'direct',name:'원계약 첫 내역',amount:400000},{inputMode:'direct',name:'원계약 두 번째 내역',amount:600001}],{confirmed:true,reason:'현재 하위 구성 경로'});
 assert.equal(h.A.total(h.p),3000001);assert.equal(h.A.domain.costExcelContributionTrace(h.p).unresolvedBudgetConflicts.length,0);for(const id of h.from.costBreakdown.childIds)assert.equal(h.A.domain.effectiveBudgetScopeRef(h.p,h.p.cbs.find(row=>row.id===id)),'EXPLICIT_FROM');assert.equal(protectedParts(h),before);
});

test('인접 드래그의 새 상위 범위 상속이 중복을 만들면 계획에서 원장 쓰기 없이 차단한다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'});h.p.contracts=[];h.p.vatRecords=[];h.from.managementAccount=false;
 const child={...copy(h.to),id:'TO_INDEPENDENT_SOURCE',parentId:h.to.id,code:h.to.code+'.01',managementAccount:false,sourceRecord:true,sourceIds:[]};delete child.budgetScopeRef;h.p.cbs.push(child);h.A.costCoding.bindCurrent(h.p,child.id,h.A.costCoding.resolve(h.p,h.to.id),{allowSystem:true,reason:'명시 독립 원자료'});
 h.A.costTableNodes=()=>h.p.cbs.filter(row=>!row.deletedAt).map(copy);assert.equal(h.A.total(h.p),3000001);const before=JSON.stringify(h.A.state);
 assert.throws(()=>h.A.costOrder.prepareMove(h.p,{sourceOrderId:'cost:'+h.from.id,targetOrderId:'cost:'+h.to.id,zone:'inside'}),/기존 총액·미확보 범위가 달라집니다/);assert.equal(JSON.stringify(h.A.state),before);
});

test('합친 뒤 본표·분석·엑셀 투영과 과거 원범위 금액은 같은 독립 금액을 보존한다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'}),stage=h.p.costStages.at(-1),beforeStage=JSON.stringify(stage);h.A.domain.mergeInto(h.p,h.from.id,h.to.id);const before=JSON.stringify(h.A.state),projection=h.A.domain.costExcelProjection(h.p,{mode:'amount',detail:'all'}),totals=projection.rows.find(row=>row.kind==='total'),rollup=h.A.costCoding.rollup(h.p);
 assert.equal(h.A.domain.stageInfo(stage).value,3000001);assert.equal(h.A.domain.stageInfo(stage,h.from.id).value,1000001);assert.equal(h.A.domain.stageInfo(stage,h.to.id).value,2000000);assert.equal(totals.values.find(value=>value.columnId==='current').rawWon,3000001);assert.equal(totals.values.find(value=>value.columnId===stage.id).rawWon,3000001);assert.equal(rollup.byType.land_purchase.knownSum,3000001);assert.equal(rollup.reconciliation.postingKnownSum,3000001);assert.equal(rollup.reconciliation.matches,true);assert.equal(JSON.stringify(stage),beforeStage);assert.equal(JSON.stringify(h.A.state),before);
});

for(const side of ['source','target','source-child','target-child'])test('명시 하위 분해 '+side+' 합치기는 원장·감사 쓰기 전에 같은 이유로 차단한다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'}),owner=side.startsWith('source')?h.from:h.to,amount=owner.current,meta=h.A.costBreakdown.activate(h.p,owner.id,[{inputMode:'direct',name:'확인된 전반',amount:amount-1},{inputMode:'direct',name:'확인된 후반',amount:1}],{confirmed:true,reason:'기존 하위 내역 보존'}),fromId=side==='source-child'?meta.childIds[0]:h.from.id,toId=side==='target-child'?meta.childIds[0]:h.to.id,before=JSON.stringify(h.A.state);let writes=0;const audit=h.A.audit;h.A.audit=(...args)=>{writes++;return audit(...args)};
 assert.throws(()=>h.A.domain.mergeInto(h.p,fromId,toId),/하위 내역을 구성한 항목은 합칠 수 없습니다/);assert.equal(writes,0);assert.equal(JSON.stringify(h.A.state),before);assert.doesNotThrow(()=>validateWorkspaceState(copy(h.A.state)));
});

test('명시 하위 분해 원가의 관리 메뉴·직접 진입·목적지 선택은 같은 지원 범위를 쓴다',()=>{
 const h=boot({toScope:'EXPLICIT_TO'});h.A.costBreakdown.activate(h.p,h.from.id,[{inputMode:'direct',name:'확인된 전반',amount:1000000},{inputMode:'direct',name:'확인된 후반',amount:1}],{confirmed:true,reason:'기존 하위 내역 보존'});const before=JSON.stringify(h.A.state),html=h.A.renderCostDetail(h.p);assert(!html.includes('data-action="cbs-merge-into" data-id="'+h.from.id+'"'));let form;h.A.form=(title,fields,submit)=>{form={title,fields,submit}};
 assert.throws(()=>h.handlers.get('cbs-merge-into')({dataset:{id:h.from.id,projectId:h.p.id}}),/하위 내역을 구성한 항목은 합칠 수 없습니다/);assert.equal(form,undefined);h.handlers.get('cbs-merge-into')({dataset:{id:h.to.id,projectId:h.p.id}});assert(form);assert(!form.fields.includes('value="'+h.from.id+'"'));assert.equal(JSON.stringify(h.A.state),before);
});

for(const legacy of [false,true])test('실제 중앙 저장 계약은 합치기 새 원자료와 범위 메타를 허용한다 '+(legacy?'기존 v3':'현재 v4'),()=>{
 const h=boot({toScope:'EXPLICIT_TO'});
 if(legacy){const entry=masterV3.entries.find(row=>row.id==='ct_land_purchase');assert(entry);for(const row of [h.from,h.to])h.A.costCoding.bindCurrent(h.p,row.id,{costTypeId:entry.id,masterVersion:masterV3.version},{allowSystem:true,method:'selected',reason:'기존 확인된 원가 유지'});}
 const before=copy(h.A.state);assert.doesNotThrow(()=>validateWorkspaceState(before));h.A.domain.mergeInto(h.p,h.from.id,h.to.id);const after=copy(h.A.state);
 const packetAt=process.argv.indexOf('--server-packet');if(legacy&&packetAt>=0)fs.writeFileSync(process.argv[packetAt+1],JSON.stringify({scope:'explicit synthetic fixtures only; no remote data',projectId:h.p.id,fromId:h.from.id,toId:h.to.id,before,after,access:{isAdmin:true,canCreateProject:true,projects:{}},user:{email:'qa@igisam.com'},expected:{totalWon:3000001,fromWon:1000001,toWon:2000000,vatSourceWon:1000001,originalCostType:'ct_land_purchase',originalMasterVersion:masterV3.version}},null,2));
 assert.doesNotThrow(()=>validateWorkspaceState(after));assert.doesNotThrow(()=>validateProjectCostChange(before.projects.find(row=>row.id===h.p.id),after.projects.find(row=>row.id===h.p.id)));
 const merged=mergeWorkspaceState(before,after,{isAdmin:true,canCreateProject:true,projects:{}},{email:'qa@igisam.com'});assert.deepEqual(copy(merged.state.projects),after.projects);assert.equal(h.A.total(h.p),3000001);
});

const overrideAt=process.argv.indexOf('--cbs-source'),result={scope:'current domain integration and actual server validation/merge functions; independent integer amounts and explicit budget scope fixtures; zero browser/actual DB writes',explicitCbsBaseline:overrideAt>=0?{path:process.argv[overrideAt+1],sha256:sha(process.argv[overrideAt+1]),currentProductAcceptance:false}:null,checks,passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,pins:Object.fromEntries(['src/cbs.js','src/cost-breakdown.js','src/cost-taxonomy.js','src/cost-coding.js','src/vat.js','server/cloud-storage.mjs'].map(file=>[file,sha(file)]))};
const probeAt=process.argv.indexOf('--adjacent-probe-output');if(probeAt>=0){const h=boot({toScope:'EXPLICIT_TO'});h.A.costBreakdown.activate(h.p,h.from.id,[{inputMode:'direct',name:'기존 분해 첫 내역',amount:400000},{inputMode:'direct',name:'기존 분해 두 번째',amount:600001}],{confirmed:true,reason:'기존 분해 원장'});const before=copy(h.A.state),out={scope:'adjacent diagnostic only, not added to passing checks; current actual APIs; no browser/DB',beforeTotalWon:h.A.total(h.p)};try{h.A.domain.mergeInto(h.p,h.from.id,h.to.id);out.domainMerged=true;out.afterTotalWon=h.A.total(h.p)}catch(error){out.domainError=error.message}try{validateWorkspaceState(copy(h.A.state));out.serverStateValid=true;validateProjectCostChange(before.projects.find(row=>row.id===h.p.id),copy(h.p));out.serverChangeValid=true;}catch(error){out.serverError={code:error.code,status:error.status,message:error.message}}out.childLinks=h.p.cbs.filter(row=>row.breakdownParentId).map(row=>({id:row.id,parentId:row.parentId,breakdownParentId:row.breakdownParentId}));fs.writeFileSync(process.argv[probeAt+1],JSON.stringify(out,null,2));}
const outputAt=process.argv.indexOf('--output');if(outputAt>=0)fs.writeFileSync(process.argv[outputAt+1],JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(result.failed)process.exitCode=1;
