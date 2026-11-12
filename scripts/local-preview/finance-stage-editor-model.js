import {milestoneRows,projectDuration} from './finance-milestones.js';
import {stageFields} from './finance-stage-fields.js';
import {currentCapitalSources,capitalSourceTotal} from './finance-capital.js';

const copy=value=>structuredClone(value);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const categories={land:'land_purchase',construction:'construction',interest:'finance'};
const fingerprint=project=>JSON.stringify(project);
function money(value,label='금액'){
 if(value==null||typeof value==='string'&&!value.trim())return null;
 if(typeof value!=='number'&&(typeof value!=='string'||!/^\d+$/.test(value.trim())))throw Error(label+'은 0 이상의 원 단위 정수로 입력해 주세요.');
 const amount=Number(value);
 if(!Number.isSafeInteger(amount)||amount<0)throw Error(label+'은 0 이상의 원 단위 정수로 입력해 주세요.');
 return amount;
}
function area(value){
 if(value==null||typeof value==='string'&&!value.trim())return null;
 if(typeof value!=='number'&&(typeof value!=='string'||!/^\d+(?:\.\d+)?$/.test(value.trim())))throw Error('연면적은 0 이상의 숫자로 입력해 주세요.');
 const n=Number(value);if(!Number.isFinite(n)||n<0)throw Error('연면적을 확인해 주세요.');return n;
}
function meta(draft){
 const name=String(draft.name||'').trim(),date=String(draft.date||''),reason=String(draft.reason||'').trim();
 if(!name||name.length>80)throw Error('단계명을 80자 이내로 입력해 주세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('기준일을 확인해 주세요.');
 if(!reason||reason.length>1000)throw Error('변경 사유·관련 이슈를 1,000자 이내로 입력해 주세요.');
 const notes=Object.fromEntries(stageFields.map(({key})=>[key,String(draft.notes?.[key]||'').trim()]));
 if(Object.values(notes).some(text=>text.length>500))throw Error('지표별 설명은 500자 이내로 입력해 주세요.');
 return {name,date,reason,notes};
}
function owner(A,p,draft){
 if(A.current()!==p||p.id!==draft.projectId||p.deletedAt||p.active===false||!A.canEditProject(p.id))throw Error('사업이나 수정 권한이 변경되어 저장하지 않았습니다.');
 if(draft.version!==1||!['create','edit'].includes(draft.kind))throw Error('단계 입력을 다시 열어 주세요.');
 if(fingerprint(p)!==draft.fingerprint)throw Error('연결된 자료가 변경되었습니다. 입력 내용을 보관한 뒤 다시 열어 주세요.');
}
function selected(A,p,id){
 const row=milestoneRows(A,p).find(item=>item.id===id);
 if(!row)throw Error('수정할 단계가 삭제되었거나 변경되었습니다.');return row;
}
function costSources(A,p){
 const nodes=(p.cbs||[]).filter(row=>!row.deletedAt),byId=new Map(nodes.map(row=>[row.id,row]));
 const participants=A.domain.costExcelContributionTrace?.(p)?.participants;
 const active=row=>row.budgetState!=='template';
 const suppressed=row=>{const seen=new Set();let parent=byId.get(row.parentId);while(parent&&!seen.has(parent.id)){seen.add(parent.id);if(parent.companyManagedTotal&&!parent.costBreakdown)return true;parent=byId.get(parent.parentId);}return false;};
 const postings=nodes.filter(row=>participants?participants.has(row.id):active(row)&&!suppressed(row)&&(!nodes.some(child=>child.parentId===row.id&&active(child))||row.companyManagedTotal&&!row.costBreakdown));
 const profile=A.companyCostProfile.managementNodes(p),full=A.companyCostProfile.fullNodes?.(p)||profile;
 const display=new Map([...nodes,...full].map(row=>[row.id,row]));
 const descends=(row,id)=>{const seen=new Set();while(row&&!seen.has(row.id)){if(row.id===id)return true;seen.add(row.id);row=display.get(row.parentId);}return false;};
 const members=Object.fromEntries(Object.entries(categories).map(([key,profileKey])=>{
  const root=profile.find(row=>row.companyProfileKey===profileKey),ids=new Set();
  if(root){ids.add(root.id);for(const row of full.filter(row=>descends(row,root.id)))for(const id of [row.id,...row.sourceIds||[],...row.managementIds||[]])ids.add(id);}
  return [key,ids];
 }));
 return postings.map(row=>{
  const binding=A.costCoding?.resolve?.(p,row.id),value=A.amount(p,row.id);
  const readOnly=!!(row.signedAdjustment||row.breakdownParentId&&!A.costBreakdown||A.costCoding&&!binding);
  const keys=['cost',...Object.keys(categories).filter(key=>[...members[key]].some(id=>descends(row,id)))];
  return {id:row.id,name:row.name||row.id,value,keys,readOnly,readOnlyReason:readOnly?'세부 사업비에서 근거와 함께 수정해 주세요.':''};
 });
}
function sources(A,p,basis){
 if(basis.id!=='current')return {cost:[],funding:(basis.capitalSources||[]).map(row=>({id:row.id,kind:row.kind,name:row.party,value:row.amount,readOnly:true})),land:[],construction:[],interest:[]};
 const cost=costSources(A,p),funding=currentCapitalSources(p).map(row=>({id:row.id,kind:row.kind,name:row.party,value:row.amount,readOnly:false}));
 return {cost,funding,...Object.fromEntries(Object.keys(categories).map(key=>[key,cost.filter(row=>row.keys.includes(key))]))};
}
export function createStageDraft(A,p,{kind='create',basis}={}){
 if(A.current()!==p||p.deletedAt||p.active===false||!A.canEditProject(p.id))throw Error('사업이나 수정 권한을 확인해 주세요.');
 if(!['create','edit'].includes(kind))throw Error('단계 입력 종류를 확인해 주세요.');
 const basisId=kind==='create'?'current':basis?.id||'current',row=selected(A,p,basisId);
 return {version:1,kind,projectId:p.id,basisId,fingerprint:fingerprint(p),readOnly:basisId!=='current',
  name:kind==='create'?'':row.name,date:kind==='create'?A.today:row.date||A.today,reason:kind==='create'?'':row.reason||'',
  notes:Object.fromEntries(stageFields.map(({key})=>[key,kind==='create'&&key!=='sale'?'':row.notes?.[key]||''])),
  values:copy(row.values),gfa:row.gfa??null,periodEnd:row.periodEnd||'',sources:sources(A,p,row)};
}
function normalizedSources(input,expected,label){
 if(!Array.isArray(input)||input.length!==expected.length||new Set(input.map(row=>row.id)).size!==input.length)throw Error(label+' 구성 항목이 변경되었습니다. 다시 열어 주세요.');
 const incoming=new Map(input.map(row=>[row.id,row]));
 return expected.map(row=>{
  const raw=incoming.get(row.id);if(!raw||raw.kind!==row.kind)throw Error(label+' 구성 항목을 확인해 주세요.');
  // Signed system adjustments and protected records are never sent to a plain amount API.
  const value=row.readOnly&&same(raw.value,row.value)?row.value:money(raw.value,row.name);
  if(row.readOnly&&value!==row.value)throw Error(row.readOnlyReason||'과거 단계의 금액은 변경할 수 없습니다.');
  return {...row,value};
 });
}
function inputs(A,p,draft){
 const basis=selected(A,p,draft.basisId),expected=sources(A,p,basis);
 const cost=normalizedSources(draft.sources?.cost,expected.cost,'원가'),funding=normalizedSources(draft.sources?.funding,expected.funding,'조달');
 const sale=money(draft.values?.sale,'매각 목표'),gfa=area(draft.gfa),periodEnd=String(draft.periodEnd||'');
 if(periodEnd&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodEnd))throw Error('사업 종료 예정 연월을 확인해 주세요.');
 if(basis.id==='current'&&periodEnd&&p.basic?.periodStart&&periodEnd<p.basic.periodStart.slice(0,7))throw Error('사업 종료 예정은 시작월보다 빠를 수 없습니다.');
 if(basis.id!=='current'){
  if(!same(draft.values,basis.values)||gfa!==(basis.gfa??null)||periodEnd!==(basis.periodEnd||'')||!same(cost,expected.cost)||!same(funding,expected.funding))throw Error('과거 단계는 이름·기준일·설명만 수정할 수 있습니다.');
 }else if(gfa!==(basis.gfa??null))A.areas.normalize?.({...A.areas.current(p),gfaTotal:gfa});
 return {basis,cost,funding,sale,gfa,periodEnd};
}
export function previewStageDraft(A,p,draft){
 owner(A,p,draft);
 const clean=inputs(A,p,draft);if(clean.basis.id!=='current')return copy(clean.basis);
 // Only this detached projection receives raw field assignments; persisted writes below
 // always use the native editing APIs, including their validation and audit history.
 const projected=copy(p);
 for(const row of clean.cost){const target=projected.cbs.find(item=>item.id===row.id);if(row.value===A.amount(p,row.id))continue;if(target.companyManagedTotal&&target.currentAmountMode==='reported-total')target.reportedCurrentTotal=row.value;else target.current=row.value;target.currentEvidenceResolved=true;target.budgetState='active';target.applicability='적용';if(target.companyManagedTotal){target.companyManagedKnownSum=row.value??0;target.companyManagedUnknownCount=row.value==null?1:0;target.companyManagedReconciliationRequired=false;}}
 const capitalSources=currentCapitalSources(p).map(row=>({...row,amount:clean.funding.find(item=>item.id===row.id).value}));
 const ids=new Map(A.companyCostProfile.managementNodes(projected).map(row=>[row.companyProfileKey,row.id]));
 const values={funding:capitalSourceTotal(capitalSources),sale:clean.sale,duration:projectDuration({...p.basic,periodEnd:clean.periodEnd}),cost:A.total(projected),
  ...Object.fromEntries(Object.entries(categories).map(([key,profileKey])=>[key,ids.has(profileKey)?A.domain.modeValue(projected,ids.get(profileKey),null,'amount'):null]))};
 for(const value of Object.values(values))if(value!=null&&!Number.isSafeInteger(value))throw Error('합계가 원 단위 정수 지원 범위를 벗어났습니다.');
 return {...copy(clean.basis),values,gfa:clean.gfa,periodEnd:clean.periodEnd,capitalSources};
}
function freezeCurrent(A,p,linked){
 const snapshot=A.domain.snapshot(p,'custom',linked.name,linked.date||A.today,copy(A.areas.current(p)),'');
 snapshot.captureMode='current';snapshot.detailLevel='detail';
 snapshot.financeContext={captureVersion:1,capturedAt:new Date().toISOString(),linkedValues:copy(linked.values),gfa:linked.gfa??null,periodEnd:linked.periodEnd||'',funding:linked.values.funding,sale:linked.values.sale,duration:linked.values.duration,capitalSources:copy(linked.capitalSources||[]),reason:linked.reason||'',notes:copy(linked.notes||{})};
 A.domain.finalizeStage(p,snapshot,A.domain.baseline(p));return snapshot.id;
}
export function commitStageDraft(A,p,draft){
 owner(A,p,draft);const info=meta(draft),clean=inputs(A,p,draft);previewStageDraft(A,p,draft);
 if(draft.kind==='create'&&draft.basisId!=='current')throw Error('현재 단계에서 새 단계를 추가해 주세요.');
 if(clean.basis.id==='current'){
  const dates=A.domain.activeStages(p).map(row=>row.date).filter(Boolean);
  if(draft.kind==='create')dates.push(clean.basis.date||A.today);
  if(dates.some(date=>info.date<date))throw Error('최근 단계 기준일은 이전 단계보다 빠를 수 없습니다.');
 }
 return A.transaction(()=>{
  owner(A,p,draft);
  if(clean.basis.id!=='current'){
   const target=p.costStages.find(row=>row.id===clean.basis.snapshot.id),before=copy(target);
   target.label=info.name;target.businessStageType=info.name;target.date=info.date;
   target.financeContext={...(A.financeMilestones?.context(p,target)||target.financeContext||{}),reason:info.reason,notes:info.notes};
   A.audit('UPDATE','costStageInfo',target.id,before,copy(target),'단계 정보 수정',{projectId:p.id,view:'finance'});
   return {basisId:'snapshot:'+target.id};
  }
  const before=copy(p.financeCurrentStage||{}),snapshotId=draft.kind==='create'?freezeCurrent(A,p,clean.basis):undefined;
  for(const row of clean.cost)if(row.value!==A.amount(p,row.id)){
   const target=p.cbs.find(item=>item.id===row.id),detail=!!target.breakdownParentId;
   const value=detail?{amount:row.value,reason:info.reason,sourcePath:target.sourcePath||'',basis:A.costBreakdown.basis(p,row.id)}:row.value;
   A.commitInline({entity:detail?'cbsBreakdownCurrent':'cbsCurrent',id:row.id,field:'current',value,projectId:p.id});
  }
  const existing=new Map(currentCapitalSources(p).map(row=>[row.id,row.amount]));
  for(const row of clean.funding)if(row.value!==existing.get(row.id)){const equity=row.kind==='equity';A.commitInline({entity:equity?'equities':'loan',id:row.id.slice(row.id.indexOf(':')+1),field:equity?'amount':'commitment',value:row.value,projectId:p.id});}
  if(clean.gfa!==(clean.basis.gfa??null))A.commitInline({entity:'projectBasic',id:p.id,field:'building.gfaTotal',value:clean.gfa,projectId:p.id});
  if(clean.periodEnd!==(clean.basis.periodEnd||''))A.commitInline({entity:'projectBasic',id:p.id,field:'basic.periodEnd',value:clean.periodEnd,projectId:p.id});
  p.financeCurrentStage={...before,...info,sale:clean.sale};
  A.audit('UPDATE','financeCurrentStage',p.id,before,copy(p.financeCurrentStage),'단계 정보 수정',{projectId:p.id,view:'finance'});
  return {basisId:'current',...(snapshotId?{snapshotId}:{})};
 });
}
