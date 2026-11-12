import assert from 'node:assert/strict';
import {createStageDraft,previewStageDraft,commitStageDraft} from '../scripts/local-preview/finance-stage-editor-model.js';
const copy=structuredClone;
function boot(){
 const p={id:'p',basic:{periodStart:'2024-01',periodEnd:'2030-01'},building:{gfaTotal:1000},areaVersions:[],cbs:[
 {id:'land',name:'토지',parentId:null},{id:'land1',name:'매입',parentId:'land',current:200},
 {id:'build',name:'공사',parentId:null},{id:'build1',name:'공사',parentId:'build',current:500},
 {id:'fee',name:'금융',parentId:null},{id:'fee1',name:'이자',parentId:'fee',current:100}],
 loans:[{id:'l1',institution:'같은 은행',type:'PF',rank:'선순위',commitment:400,balance:300},{id:'l2',institution:'같은 은행',type:'PF',rank:'후순위',commitment:100,balance:50}],equities:[{id:'e',company:'출자자',amount:200}],
 financeCurrentStage:{name:'기존 단계',date:'2026-01-01',reason:'기존 사유',sale:1200,notes:{cost:'기존 설명'}},costStages:[],audit:[]};
 const other={id:'other'};let next=0;const calls=[];
 const amount=(p,id)=>{const row=p.cbs.find(r=>r.id===id),kids=p.cbs.filter(r=>r.parentId===id);return kids.length?sum(kids.map(r=>amount(p,r.id))):row.current??null;};
 const sum=xs=>xs.some(x=>x==null)?null:xs.reduce((a,b)=>a+b,0);
 const A={today:'2026-11-12',state:{projects:[p,other]},ui:{projectId:'p'},current:()=>A.state.projects.find(r=>r.id===A.ui.projectId),canEditProject:()=>true,
  companyCostProfile:{managementNodes:()=>[{id:'land',companyProfileKey:'land_purchase'},{id:'build',companyProfileKey:'construction'},{id:'fee',companyProfileKey:'finance'}]},
  amount,total:q=>sum(q.cbs.filter(r=>!r.parentId).map(r=>amount(q,r.id))),
  contracts:{financeCapitalTotals:q=>({total:sum([...q.loans.map(r=>r.commitment),...q.equities.map(r=>r.amount)])})},
  areas:{current:q=>q.building,forStage:(_q,s)=>s.area,normalize:q=>q},
  domain:{activeStages:q=>q.costStages,modeValue:(q,id,s)=>s?s.values[id]:id==='total'?A.total(q):amount(q,id),baseline:q=>q.costStages[0],
   snapshot:(q,kind,label,date,area)=>({id:'s'+ ++next,kind,label,date,area:copy(area),values:Object.fromEntries(['total',...q.cbs.map(r=>r.id)].map(id=>[id,id==='total'?A.total(q):amount(q,id)]))}),
   finalizeStage:(q,s)=>{calls.push('freeze');q.costStages.push(copy(s));},
   saveCost:(q,id,value)=>{calls.push('cost');q.cbs.find(r=>r.id===id).current=value;}},
  transaction:fn=>{const before=copy(p);try{return fn();}catch(e){for(const key of Object.keys(p))delete p[key];Object.assign(p,before);throw e;}},
  commitInline:({entity,id,field,value})=>{calls.push(entity);if(entity==='loan'){const r=p.loans.find(r=>r.id===id);if(value!=null&&value<r.balance)throw Error('잔액');r[field]=value;}else if(entity==='equities')p.equities.find(r=>r.id===id)[field]=value;else if(entity==='cbsCurrent')A.domain.saveCost(p,id,value);else if(field==='building.gfaTotal')p.building.gfaTotal=value;else p.basic.periodEnd=value;},
  audit:(...event)=>p.audit.push(copy(event))};
 return {A,p,other,calls};
}
const ready=(A,p,kind='create',basis)=>{const d=createStageDraft(A,p,{kind,basis});d.name='본PF 2차';d.reason='조건 변경';return d;};
{
 const {A,p,other,calls}=boot(),before=copy(p),draft=ready(A,p),otherBefore=copy(other);
 assert.equal(draft.date,A.today);assert.equal(draft.notes.cost,'');assert.equal(draft.sources.funding.length,3);
 assert.deepEqual(draft.sources.cost.map(r=>r.id),['land1','build1','fee1']);
 assert.deepEqual(draft.sources.cost.find(r=>r.id==='land1').keys,['cost','land']);
 draft.sources.cost.find(r=>r.id==='fee1').value='140';draft.sources.funding.find(r=>r.id==='loan:l1').value='450';draft.values.sale='1500';draft.gfa='1100';draft.periodEnd='2031-01';
 const preview=previewStageDraft(A,p,draft);assert.deepEqual(preview.values,{funding:750,sale:1500,duration:84,cost:840,land:200,construction:500,interest:140});assert.equal(preview.gfa,1100);assert.deepEqual(p,before,'preview must not write native state');
 const result=commitStageDraft(A,p,draft);assert.equal(result.basisId,'current');assert.equal(calls[0],'freeze');
 const frozen=p.costStages[0];assert.equal(frozen.label,'기존 단계');assert.equal(frozen.financeContext.captureVersion,1);assert.equal(frozen.financeContext.linkedValues.cost,800);assert.equal(frozen.financeContext.linkedValues.funding,700);assert.equal(frozen.financeContext.gfa,1000);assert.equal(frozen.financeContext.periodEnd,'2030-01');assert.equal(frozen.financeContext.capitalSources.find(r=>r.id==='loan:l1').amount,400);
 assert.equal(p.financeCurrentStage.name,'본PF 2차');assert.equal(A.total(p),840);assert.equal(p.loans[0].commitment,450);assert.equal(p.loans[0].balance,300);assert.deepEqual(other,otherBefore);
 const historical=copy(frozen),edit=ready(A,p,'edit',{id:'snapshot:'+frozen.id,snapshot:frozen});edit.name='기존 단계 명칭 수정';commitStageDraft(A,p,edit);
 assert.deepEqual(p.costStages[0].values,historical.values);assert.deepEqual(p.costStages[0].financeContext.linkedValues,historical.financeContext.linkedValues);assert.equal(p.costStages[0].label,'기존 단계 명칭 수정');assert.equal(p.costStages.length,1);
 const reject=ready(A,p,'edit',{id:'snapshot:'+frozen.id,snapshot:p.costStages[0]});reject.values.sale=999;assert.throws(()=>commitStageDraft(A,p,reject),/과거/);
}
for(const bad of ['1.1','-1','1e3','9007199254740992','abc']){const {A,p}=boot(),d=ready(A,p);d.sources.cost[0].value=bad;assert.throws(()=>previewStageDraft(A,p,d));}
{
 const{A,p}=boot(),d=ready(A,p);d.sources.cost[0].value='';d.sources.funding[0].value='0';const v=previewStageDraft(A,p,d);assert.equal(v.values.cost,null);assert.equal(v.capitalSources[0].amount,0);
}
for(const mutate of [p=>p.loans[0].institution='변경',p=>p.audit.push('다른 변경'),p=>p.costStages.push({id:'else'}),p=>p.deletedAt='now']){const{A,p}=boot(),d=ready(A,p);mutate(p);const before=copy(p);assert.throws(()=>commitStageDraft(A,p,d));assert.deepEqual(p,before);}
{
 const{A,p}=boot(),d=ready(A,p),before=copy(p);d.sources.cost[0].value=300;d.sources.funding.find(r=>r.id==='loan:l1').value=200;assert.throws(()=>commitStageDraft(A,p,d),/잔액/);assert.deepEqual(p,before,'freeze, costs and audit roll back together');
}
{
 const{A,p}=boot(),d=ready(A,p);d.sources.cost.push({id:'fake',name:'잔액',value:1});assert.throws(()=>commitStageDraft(A,p,d));
 const fresh=ready(A,p);A.ui.projectId='other';assert.throws(()=>commitStageDraft(A,p,fresh),/사업/);
}
console.log('LOCAL-UI-167 stage model: native source edits, frozen history, preview isolation, metadata-only history, conflict and rollback passed');

// Real native CBS/contract/area APIs, with a read-only file copied into an isolated VM.
const {readFileSync}=await import('node:fs');
const {makeHarness}=await import('./recovery-harness.mjs');
const bytes=readFileSync(new URL('../.build/local-preview/original-workspace.json',import.meta.url),'utf8');
const harness=makeHarness({costTaxonomyV4:true,seed:JSON.parse(bytes),modules:['core','cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','contracts','setup','recovery-views']});
const native=harness.A;
for(const initialize of native.initializers)initialize(native.state);
const project=native.state.projects.find(row=>row.id==='TEST-20261016-A');
native.ui.projectId=project.id;
const originalHistory=JSON.stringify(project.costStages),untouchedProjects=JSON.stringify(native.state.projects.filter(row=>row.id!==project.id));
const nativeDraft=createStageDraft(native,project,{kind:'create'});
nativeDraft.name='독립 본PF 2차';nativeDraft.reason='독립 테스트 원가와 약정 변경';
const interest=nativeDraft.sources.interest.find(row=>!row.readOnly&&row.value>0);
assert(interest,'금융비의 실제 수정 원장행이 있어야 합니다');
const startAmount=interest.value;interest.value=String(startAmount+100000000);
const lending=nativeDraft.sources.funding.find(row=>row.kind==='debt');lending.value=String(lending.value+200000000);
const nativeBefore=JSON.stringify(native.state);
const nativePreview=previewStageDraft(native,project,nativeDraft);
assert.equal(nativePreview.values.cost,513180000000);
assert.equal(nativePreview.values.funding,305200000000);
assert.equal(JSON.stringify(native.state),nativeBefore);
const currentInterest=native.domain.modeValue(project,native.companyCostProfile.managementNodes(project).find(row=>row.companyProfileKey==='finance').id,null,'amount');
assert.equal(nativePreview.values.interest,currentInterest+100000000);
const out=commitStageDraft(native,project,nativeDraft);
assert.equal(native.total(project),513180000000);
assert.equal(native.contracts.financeCapitalTotals(project).total,305200000000);
assert.equal(project.costStages.at(-1).financeContext.linkedValues.cost,513080000000);
assert.equal(project.costStages.at(-1).id,out.snapshotId);
assert.equal(JSON.stringify(project.costStages.slice(0,-1)),originalHistory);
assert.equal(JSON.stringify(native.state.projects.filter(row=>row.id!==project.id)),untouchedProjects);
assert.equal(readFileSync(new URL('../.build/local-preview/original-workspace.json',import.meta.url),'utf8'),bytes);
console.log('LOCAL-UI-167 real native APIs: independent 5130.8→5131.8억 / 3050→3052억, prior snapshot and other projects preserved');
const captured=JSON.stringify(project.costStages),currentEdit=createStageDraft(native,project,{kind:'edit'});
currentEdit.name='동일 단계 정정';currentEdit.reason='실제 원장 개별 금액 변경';currentEdit.values.sale='700000000000';currentEdit.periodEnd='2031-06';currentEdit.gfa='64500';
const breakdown=currentEdit.sources.cost.find(row=>project.cbs.find(record=>record.id===row.id)?.breakdownParentId&&!row.readOnly&&row.value!==null);
assert(breakdown,'원본에 존재하는 분해 하위행은 원래 수정 API로 연결합니다');
const originalBreakdown=breakdown.value;breakdown.value=String(originalBreakdown+1000000);
const equity=currentEdit.sources.funding.find(row=>row.kind==='equity');const equityBefore=equity.value;equity.value=String(equityBefore+1000000);
commitStageDraft(native,project,currentEdit);
assert.equal(native.amount(project,breakdown.id),originalBreakdown+1000000);
assert.equal(project.cbs.find(row=>row.id===breakdown.id).reason,'실제 원장 개별 금액 변경');
assert.equal(native.areas.current(project).gfaTotal,64500);assert.equal(project.building.gfaTotal,64500);assert.equal(project.basic.periodEnd,'2031-06');assert.equal(project.financeCurrentStage.sale,700000000000);
assert.equal(project.equities.find(row=>'equity:'+row.id===equity.id).amount,equityBefore+1000000);
assert.equal(JSON.stringify(project.costStages),captured,'current edit never rewrites frozen area or amount history');
const bad=createStageDraft(native,project,{kind:'create'});bad.name='실패 단계';bad.reason='원자성 검사';bad.sources.cost.find(row=>!row.readOnly&&row.value>0).value='99999999999';
const liveLoan=project.loans.find(row=>row.balance>0);assert(liveLoan);bad.sources.funding.find(row=>row.id==='loan:'+liveLoan.id).value=String(liveLoan.balance-1);
const beforeFailure=JSON.stringify(native.state);assert.throws(()=>commitStageDraft(native,project,bad));assert.equal(JSON.stringify(native.state),beforeFailure,'native transaction rolls back frozen stage and all previous writes');
assert.equal(readFileSync(new URL('../.build/local-preview/original-workspace.json',import.meta.url),'utf8'),bytes);
console.log('LOCAL-UI-167 real native breakdown/equity/area/period/sale edits and whole-state failure rollback passed');
