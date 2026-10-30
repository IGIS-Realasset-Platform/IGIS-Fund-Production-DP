import {createHash,randomUUID} from 'node:crypto';
import {companyEmail} from './email-auth.mjs';
import '../src/html-test-fixture-policy.js';
import masterV1 from '../src/data/cost-type-master-v1.json' with {type:'json'};
import masterV2 from '../src/data/cost-type-master-v2.json' with {type:'json'};
import masterV3 from '../src/data/cost-type-master-v3.json' with {type:'json'};
import masterV4 from '../src/data/cost-type-master-v4.json' with {type:'json'};
import costTaxonomy from '../src/data/cost-taxonomy-v4.json' with {type:'json'};
import {validatePermitChanges} from '../shared/permit-domain.mjs';
import {validateCostBreakdownProject,validateCostBreakdownTransitions} from '../shared/cost-breakdown-validation.mjs';
import {validateProjectManagerReferences} from './employee-directory.mjs';
import {projectRegistrationProfileErrors} from '../shared/project-registration-profile.mjs';
import {costGraphTransitionErrors} from '../shared/cost-graph-safety.mjs';
import {approvedSampleIds,readApprovedSampleProjects} from './sample-access.mjs';

export const WORKSPACE_SCHEMA='development_project_platform';
export const DEFAULT_WORKSPACE_ID='platform';
export const MAX_WORKSPACE_BYTES=4_000_000;
const table=name=>WORKSPACE_SCHEMA+'.'+name;
const clone=value=>JSON.parse(JSON.stringify(value));
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const roles=new Set(['viewer','editor','approver']);
const editRoles=new Set(['editor','approver']);
const idPattern=/^[^\u0000-\u001f\u007f]{1,200}$/;
const metaKeys=new Set(['version','currentProjectId','selectedProjectId','storageRevision','v010LegacyAuditImported','v0101AlertsImported']);
const publicKeys=new Set(['lawCatalog','lawChanges','lawUpdateRuns','lawSourceV0110','marketSeries']);
const scopedKeys=new Set(['projectLawImpacts','migrationConflicts','integrityIssues','storageQuarantine','costIncreaseEvents','projectAlerts','companyParticipations','companyIdentityConflicts']);
const reportMutableKeys=new Set(['status','submitted','receipt']);
const controlKinds=new Set(['underwriting','bridge','pf','bridge_refi','pf_refi','completion']);
const stageKinds=new Set(['custom','report',...controlKinds]);
const projectRecordLists=['costs','cbs','costStages','contracts','documents','permits','milestones','loans','equities','guarantees','sales','reports','reportSnapshots','reportDraftOverrides','areaVersions','landParcels','landContracts','landPaymentSchedule','landPayments','vatRecords','vatApplications','vatReconciliations','fundForecasts','fundPayments','fundItemReviews','loanEvents','loanQuarterlyRecords','executionOpeningBalances','reserveTransfers','classificationEvents','benchmarks','issues','inputDataReviews','inputDataReviewHistory','reportLandPlan','reportBuildingPlans'];
const stateRecordLists=['projects','entities','auditEvents','notifications','companies','lawCatalog','lawChanges','lawUpdateRuns','projectLawImpacts','companyParticipations','companySalesLines','companyIdentityConflicts','marketSeries','projectRegistrationDrafts'];
const costMasters=new Map([masterV1,masterV2,masterV3,masterV4].map(master=>[master.version,new Map(master.entries.map(entry=>[entry.id,entry]))]));
const htmlFixturePolicy=globalThis.DppHtmlFixturePolicy;

export class WorkspaceError extends Error{
 constructor(status,code,message){super(message);this.name='WorkspaceError';this.status=status;this.code=code;}
}
const invalid=(message='저장할 자료 형식을 확인해 주세요.')=>new WorkspaceError(400,'INVALID_WORKSPACE',message);
const forbidden=()=>new WorkspaceError(403,'WORKSPACE_FORBIDDEN','이 자료를 조회하거나 수정할 권한이 없습니다.');
const conflict=()=>new WorkspaceError(409,'REVISION_CONFLICT','다른 사용자가 자료를 변경했습니다. 입력값을 유지하고 최신 자료를 다시 불러와 주세요.');
const json=(body,status=200,extra={})=>Response.json(body,{status,headers:{'cache-control':'private, no-store','x-content-type-options':'nosniff',...extra}});
export const workspaceErrorResponse=error=>json({error:error.code,message:error.message},error.status);
function stable(value){
 if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
 if(object(value))return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stable(value[key])).join(',')+'}';
 return JSON.stringify(value);
}
export const workspaceStateHash=state=>createHash('sha256').update(stable(state)).digest('hex');
const same=(a,b)=>stable(a)===stable(b);
function recordMap(rows){return new Map((rows||[]).map(row=>[row.id,row]));}
function validId(value){return typeof value==='string'&&idPattern.test(value)&&value.trim()===value;}
function validateWon(value){if(value===null||value===undefined||value==='')return;if(typeof value==='number'&&Number.isSafeInteger(value))return;if(typeof value==='string'&&/^-?\d+$/.test(value))return;throw invalid('사업비 금액은 원 단위 정수로 입력해 주세요.');}
function validateRecordList(owner,key){if(!own(owner,key))return;if(!Array.isArray(owner[key]))throw invalid();const seen=new Set();for(const row of owner[key]){if(!object(row)||!validId(row.id)||seen.has(row.id))throw invalid('중복되거나 올바르지 않은 기록 식별값이 있습니다.');seen.add(row.id);}}
function costBinding(recordId,value){
 if(!object(value)||value.recordId!==recordId||!validId(recordId)||!costMasters.has(value.masterVersion))throw invalid('비용 항목과 표준 비용코드의 연결을 확인해 주세요.');
 for(const key of ['costTypeId','costTypeCode','costTypeMappingStatus','reason','method'])if(typeof value[key]!=='string')throw invalid('비용 항목과 표준 비용코드의 연결을 확인해 주세요.');
 const entry=costMasters.get(value.masterVersion).get(value.costTypeId);if(!entry||entry.code!==value.costTypeCode||own(value,'entryRole')&&value.entryRole!==entry.entryRole||own(value,'kind')&&value.kind!==entry.kind)throw invalid('등록된 비용 항목과 비용코드가 일치하지 않습니다.');
 return entry;
}
function validateProjectCoding(project){
 const coding=project.costCoding;if(coding!==undefined){if(!object(coding)||coding.version!==1||!costMasters.has(coding.masterVersion)||!object(coding.currentByRecordId)||!object(coding.historicalByStageId))throw invalid('비용코드 원장의 형식을 확인해 주세요.');for(const [recordId,value]of Object.entries(coding.currentByRecordId))costBinding(recordId,value);for(const [stageId,map]of Object.entries(coding.historicalByStageId)){if(!validId(stageId)||!object(map))throw invalid();for(const [recordId,value]of Object.entries(map))costBinding(recordId,value);}}
 for(const stage of project.costStages||[])for(const row of stage.nodes||[])if(own(row,'costTypeId')||own(row,'costTypeCode')||own(row,'masterVersion'))costBinding(row.id,{recordId:row.id,costTypeId:row.costTypeId,costTypeCode:row.costTypeCode,masterVersion:row.masterVersion,costTypeMappingStatus:row.costTypeMappingStatus,reason:row.costTypeMappingReason??row.reason,method:row.costTypeMappingMethod??row.method});
}
function validateTree(value,depth=0){
 if(depth>100)throw invalid('저장 자료의 중첩 구조가 너무 깊습니다.');
 if(value===null||typeof value==='string'||typeof value==='boolean')return;
 if(typeof value==='number'){if(!Number.isFinite(value)||Number.isInteger(value)&&!Number.isSafeInteger(value))throw invalid('숫자 정확도를 확인해 주세요.');return;}
 // 원문/값/격리 배열을 실제 원장 목록으로 추측하지 않습니다. ID 규칙은 명시한 업무 목록에서만 적용합니다.
 if(Array.isArray(value)){for(const row of value)validateTree(row,depth+1);return;}
 if(!object(value)||![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw invalid();
 for(const[key,item]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(key))throw invalid();validateTree(item,depth+1);}
}
export function createBlankWorkspaceState(){
 return {version:'0.11.0',storageRevision:0,currentProjectId:'',selectedProjectId:'',projects:[],entities:[],auditEvents:[],notifications:[],companies:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],migrationConflicts:[],integrityIssues:[],storageQuarantine:[],sourceLoad:{status:'unavailable',schemaVersion:'notion-development-projects-v1',expectedCount:null,actualCount:0,hasMore:null,syncedAt:''}};
}
export function validateWorkspaceState(state){
 if(!object(state)||!Array.isArray(state.projects))throw invalid();validateTree(state);
 for(const key of ['currentProjectId','selectedProjectId'])if(own(state,key)&&(typeof state[key]!=='string'||state[key]!==''&&!validId(state[key])))throw invalid('선택한 사업 식별값을 확인해 주세요.');
 if(own(state,'version')&&(typeof state.version!=='string'||state.version.length>64))throw invalid();
 if(own(state,'storageRevision')&&(!Number.isSafeInteger(state.storageRevision)||state.storageRevision<0))throw invalid('저장본 번호를 확인해 주세요.');
 for(const key of stateRecordLists)validateRecordList(state,key);
 for(const project of state.projects){
  if(!object(project)||!validId(project.id))throw invalid('사업 식별값을 확인해 주세요.');
  const approvedFixture=htmlFixturePolicy.isApprovedProject(project);
  if(htmlFixturePolicy.isClaimedProject(project)&&!approvedFixture)throw invalid('승인된 테스트사업의 식별값과 원본 정보를 확인해 주세요.');
  if(!approvedFixture&&(project.isExample===true||project.sample===true||['YD427','YD816','IOTA','DC01','SAMPLE02'].includes(project.id)))throw invalid('예시 사업을 실제 중앙 저장소에 저장할 수 없습니다.');
  for(const key of projectRecordLists)validateRecordList(project,key);
  for(const row of project.cbs||[])for(const key of ['current','initial','reportedCurrentTotal'])if(own(row,key))validateWon(row[key]);
  for(const row of project.costStages||[]){validateRecordList(row,'nodes');if(own(row,'reportedTotal'))validateWon(row.reportedTotal);if(own(row,'values')&&!object(row.values))throw invalid();for(const value of Object.values(row.values||{}))validateWon(value);}
  for(const row of project.contracts||[])for(const key of ['revisions','certifications','obligations','payments','paymentReviews'])validateRecordList(row,key);
  for(const permit of project.permits||[]){validateRecordList(permit,'actionItems');for(const opinion of permit.actionItems||[])validateRecordList(opinion,'plans');}
  for(const key of ['contractors','trustees','guarantors'])if(object(project.reportParticipants))validateRecordList(project.reportParticipants,key);
  for(const key of ['preparation','permit','start','construction'])if(object(project.reportProgress))validateRecordList(project.reportProgress,key);
  validateProjectCoding(project);
  const breakdownValidation=validateCostBreakdownProject(project);if(!breakdownValidation.valid)throw new WorkspaceError(422,'INVALID_COST_BREAKDOWN',breakdownValidation.errors[0].message);
 }
 for(const entity of state.entities||[])for(const key of ['professionalRecords','notices'])validateRecordList(entity,key);
 for(const company of state.companies||[])validateRecordList(company,'localNotes');
 for(const series of state.marketSeries||[])validateRecordList(series,'points');
 if(Buffer.byteLength(JSON.stringify(state))>MAX_WORKSPACE_BYTES)throw new WorkspaceError(413,'WORKSPACE_TOO_LARGE','저장할 자료가 한 번에 처리할 수 있는 크기를 넘었습니다.');
 return state;
}
export function normalizeWorkspaceAccess(access={}){
 const sampleViewerOnly=access.sampleViewerOnly===true,projects={};if(object(access.projects))for(const[id,role]of Object.entries(access.projects))if(validId(id)&&roles.has(role)&&(!sampleViewerOnly||approvedSampleIds.includes(id)))projects[id]=sampleViewerOnly?'viewer':role;
 return {isAdmin:!sampleViewerOnly&&access.isAdmin===true,canCreateProject:!sampleViewerOnly&&access.isAdmin===true&&access.canCreateProject!==false,projects,...(sampleViewerOnly?{sampleViewerOnly:true}:{})};
}
const readable=(access,id)=>access.isAdmin||roles.has(access.projects[id]);
const editable=(access,id)=>access.isAdmin||editRoles.has(access.projects[id]);
function rowProjectId(row){return typeof row?.projectId==='string'?row.projectId:typeof row?.target?.projectId==='string'?row.target.projectId:'';}
function references(value,key,found=new Set()){
 if(Array.isArray(value)){for(const row of value)references(row,key,found);return found;}
 if(!object(value))return found;
 for(const[name,item]of Object.entries(value)){if(name===key&&validId(item))found.add(item);else if(name===key+'s'&&Array.isArray(item)){for(const id of item)if(validId(id))found.add(id);}else if(item&&typeof item==='object')references(item,key,found);}
 return found;
}
function visibleCompanyIds(state,projectIds){
 const result=new Set();for(const p of state.projects||[])if(projectIds.has(p.id))references(p,'companyId',result);
 for(const row of state.companyParticipations||[])if(projectIds.has(rowProjectId(row))&&validId(row.companyId))result.add(row.companyId);
 return result;
}
function neutralSourceLoad(){return createBlankWorkspaceState().sourceLoad;}
export function filterWorkspaceState(state,rawAccess){
 validateWorkspaceState(state);const access=normalizeWorkspaceAccess(rawAccess);if(access.isAdmin)return clone(state);
 const projects=state.projects.filter(p=>readable(access,p.id)&&(!access.sampleViewerOnly||htmlFixturePolicy.isApprovedProject(p)&&!p.deletedAt&&p.active!==false)),ids=new Set(projects.map(p=>p.id)),entityIds=new Set(projects.map(p=>p.entityId).filter(validId)),companyIds=visibleCompanyIds(state,ids),out=createBlankWorkspaceState();
 for(const key of metaKeys)if(own(state,key))out[key]=clone(state[key]);
 for(const key of publicKeys)if(own(state,key)&&!access.sampleViewerOnly)out[key]=clone(state[key]);
 const withinScope=row=>ids.has(rowProjectId(row))&&(!access.sampleViewerOnly||!row.target?.projectId||row.target.projectId===rowProjectId(row));
 out.projects=clone(projects);out.entities=clone((state.entities||[]).filter(row=>entityIds.has(row.id)&&(!access.sampleViewerOnly||[...associatedProjects(state,'entity',row.id)].every(id=>ids.has(id)))));out.companies=clone((state.companies||[]).filter(row=>companyIds.has(row.id)));
 out.auditEvents=clone((state.auditEvents||[]).filter(withinScope));out.notifications=clone((state.notifications||[]).filter(withinScope));
 for(const key of scopedKeys)if(Array.isArray(state[key]))out[key]=clone(state[key].filter(withinScope));
 // 개인/영업 연락처 등 사업에 귀속되지 않은 공용 원장은 관리자에게만 제공합니다.
 out.companySalesLines=[];out.sourceLoad=neutralSourceLoad();
 if(access.sampleViewerOnly){out.auditEvents=[];out.companies=out.companies.map(row=>({id:row.id,name:row.name||''}));}
 for(const key of ['currentProjectId','selectedProjectId'])if(!ids.has(out[key]))out[key]=projects[0]?.id||'';
 return out;
}
function appendOnly(before,after,{mutableKeys=new Set(),code='IMMUTABLE_HISTORY'}={}){
 const next=recordMap(after);for(const row of before||[]){const candidate=next.get(row.id);if(!candidate)throw new WorkspaceError(400,code,'과거 저장자료는 삭제할 수 없습니다. 새 정정본으로 저장해 주세요.');const a={...row},b={...candidate};for(const key of mutableKeys){delete a[key];delete b[key];}if(!same(a,b))throw new WorkspaceError(400,code,'과거 저장자료의 본문은 변경할 수 없습니다. 새 정정본으로 저장해 주세요.');}
}
function assertProjectHistory(old,next,access){
 // 이 배열은 화면의 미저장 초안이 아니라 저장 시 동결한 시점/보고서입니다.
 // 시점 정정은 새 ID+supersedesId, 작성 중 보고서 편집은 reportDraftOverrides를 사용합니다.
 appendOnly(old?.costStages||[],next.costStages||[]);appendOnly(old?.areaVersions||[],next.areaVersions||[]);
 for(const key of ['reportSnapshots','reports'])appendOnly(old?.[key]||[],next[key]||[],{mutableKeys:reportMutableKeys});
 for(const[stageId,map]of Object.entries(old?.costCoding?.historicalByStageId||{}))if(!same(map,next.costCoding?.historicalByStageId?.[stageId]))throw new WorkspaceError(400,'IMMUTABLE_HISTORY','과거 사업비의 비용코드는 변경할 수 없습니다.');
 const oldStages=recordMap(old?.costStages);
 const replaced=new Set((old?.costStages||[]).map(row=>row.supersedesId).filter(Boolean)),correctionTargets=new Set();
 const controlKind=row=>controlKinds.has(row.controlEventType!==undefined?row.controlEventType:row.kind)?(row.controlEventType!==undefined?row.controlEventType:row.kind):null;
 for(const row of next.costStages||[]){
  if(oldStages.has(row.id))continue;
  if(!stageKinds.has(row.kind)||own(row,'controlEventType')&&(controlKinds.has(row.kind)?row.controlEventType!==row.kind:row.controlEventType!==null))throw invalid('시점 종류와 통제사건 종류를 확인해 주세요.');
  if(row.supersedesId!==undefined&&row.supersedesId!==null){
   const original=oldStages.get(row.supersedesId);
   if(!validId(row.supersedesId)||!original||replaced.has(original.id)||correctionTargets.has(original.id)||own(original,'controlEventType')&&controlKinds.has(original.kind)&&original.controlEventType!==original.kind||controlKind(original)!==controlKind(row))throw invalid('같은 사업의 최신 저장본에서 같은 통제사건 종류로 정정해 주세요.');
   correctionTargets.add(original.id);
  }
 }
 if(!access.isAdmin&&access.projects[next.id]!=='approver'){
  if((next.costStages||[]).some(row=>!oldStages.has(row.id)&&controlKinds.has(row.controlEventType??row.kind)))throw forbidden();
  for(const key of ['reportSnapshots','reports']){const oldReports=recordMap(old?.[key]);if((next[key]||[]).some(row=>{const previous=oldReports.get(row.id);return (['확정','제출'].includes(row.status)||['확정','제출'].includes(previous?.status))&&['status','submitted','receipt'].some(key=>!same(row[key],previous?.[key]));}))throw forbidden();}
 }
}
function preservedManagementMergeCopies(old,next,priorRows,nextRows,priorLinks,links){
 const oldEventIds=new Set((old?.classificationEvents||[]).map(e=>e.id)),events=(next.classificationEvents||[]).filter(e=>e?.kind==='management-merge'&&!oldEventIds.has(e.id));
 const eventReferencedIds=new Set();for(const e of events)for(const id of [...(Array.isArray(e.fromIds)?e.fromIds:[]),...(Array.isArray(e.toIds)?e.toIds:[])]){const ids=nextRows.get(id)?.mergedSourceIds;if(Array.isArray(ids))for(const sourceId of ids)eventReferencedIds.add(sourceId);}
 const otherSourcePaths=new Set(['detail-source-copy','split-inherit','breakdown-inherit']);
 const copies=(next.cbs||[]).filter(r=>!priorRows.has(r.id)&&(links[r.id]?.method==='merge-source-copy'||eventReferencedIds.has(r.id)||own(r,'originCbsId')&&!otherSourcePaths.has(links[r.id]?.method)));
 if(!copies.length)return new Set();
 const fail=reason=>{const e=new WorkspaceError(400,'COST_MERGE_SOURCE_INVALID','합치기 원자료의 원항목·금액·비용유형 연결을 확인해 주세요.');e.reason=reason;throw e;};
 if(!old||old.id!==next.id||priorRows.size!==(old.cbs||[]).length||nextRows.size!==(next.cbs||[]).length)fail('PROJECT_OR_RECORD_IDENTITY');
 const byOrigin=new Map();for(const r of copies){if(!validId(r.id)||!validId(r.originCbsId)||r.sourceRecord!==true||r.managementAccount!==false||r.templateDefault!==false||r.deletedAt||links[r.id]?.method!=='merge-source-copy')fail('COPY_STRUCTURE');if(byOrigin.has(r.originCbsId))fail('DUPLICATE_ORIGIN_COPY');byOrigin.set(r.originCbsId,r);}
 const children=(rows,id)=>[...rows.values()].filter(r=>!r.deletedAt&&r.parentId===id).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)||a.id.localeCompare(b.id));
 const posting=(id,map)=>{const b=map[id];if(!b||b.costTypeMappingStatus!=='confirmed')return null;const e=costBinding(id,b);return e.entryRole==='posting'&&!e.kind.startsWith('system-')?{binding:b,entry:e}:null;};
 const unstructured=(r,ignored)=>Object.fromEntries(Object.entries(r).filter(([k])=>!ignored.has(k)));
 const copyStructure=new Set(['id','parentId','code','originCbsId','sourceRecord','managementAccount','templateDefault','mergedBudgetScopeRef']);
 const effectiveScope=(rows,row)=>{let current=row;const seen=new Set();while(current){if(seen.has(current.id))fail('SCOPE_CYCLE');seen.add(current.id);if(current.budgetScopeRef)return String(current.budgetScopeRef);if(own(current,'mergedBudgetScopeRef'))return String(current.mergedBudgetScopeRef||'');const parent=rows.get(current.parentId);current=parent&&!parent.deletedAt?parent:null;}return'';};
 const nextSourceCode=origin=>{if(typeof origin.code!=='string'||!origin.code)fail('SOURCE_CODE');const prefix=origin.code+'.',used=new Set((old.cbs||[]).map(r=>r.code));let index=old.cbsCodeCounters?.[origin.id]||0;if(!Number.isSafeInteger(index)||index<0)fail('SOURCE_CODE_COUNTER');for(const r of old.cbs||[])if(typeof r.code==='string'&&r.code.startsWith(prefix)){const n=Number(r.code.slice(prefix.length));if(Number.isSafeInteger(n))index=Math.max(index,n);}let code;do{code=prefix+String(++index).padStart(2,'0');}while(used.has(code));return code;};
 const allChildren=(rows,id)=>[...rows.values()].filter(r=>r.parentId===id);
 const sameIds=(a,b)=>a.length===b.length&&same([...a].sort(),[...b].sort());
 function preserveExistingBranch(parent,toId,moved){
  const direct=allChildren(priorRows,parent.id),moving=new Set(direct.filter(r=>!r.deletedAt).map(r=>r.id)),queue=[...direct],seen=new Set();
  while(queue.length){const before=queue.shift();if(seen.has(before.id))fail('EXISTING_SOURCE_CYCLE');seen.add(before.id);if(before.costBreakdown)fail('EXPLICIT_BREAKDOWN_SCOPE');const after=nextRows.get(before.id),isMoved=moved&&moving.has(before.id),ignored=isMoved?new Set(['parentId','mergedBudgetScopeRef']):new Set();
   if(!after||!same(unstructured(before,ignored),unstructured(after,ignored))||!same(priorLinks[before.id],links[before.id]))fail('EXISTING_SOURCE_CHANGED');
   if(isMoved&&(!own(after,'mergedBudgetScopeRef')||typeof after.mergedBudgetScopeRef!=='string'||after.parentId!==toId||after.mergedBudgetScopeRef!==effectiveScope(priorRows,before)))fail('EXISTING_SOURCE_MOVE');
   if(!before.deletedAt&&effectiveScope(priorRows,before)!==effectiveScope(nextRows,after))fail('EXISTING_SOURCE_SCOPE');
   const oldChildren=allChildren(priorRows,before.id),nextChildren=allChildren(nextRows,before.id);if(!sameIds(oldChildren.map(r=>r.id),nextChildren.map(r=>r.id)))fail('EXISTING_CHILD_SET');queue.push(...oldChildren);
  }
  return direct;
 }
 const checkedEvents=new Set();
 function checkEvent(event){
  if(checkedEvents.has(event.id))return;checkedEvents.add(event.id);
  if(!validId(event.id)||events.filter(e=>e.id===event.id).length!==1||!Array.isArray(event.fromIds)||event.fromIds.length!==1||!Array.isArray(event.toIds)||event.toIds.length!==1)fail('MERGE_EVENT');
  const fromId=event.fromIds[0],toId=event.toIds[0],from=priorRows.get(fromId),to=priorRows.get(toId),afterFrom=nextRows.get(fromId),afterTo=nextRows.get(toId);
  if(!from||!to||fromId===toId||from.deletedAt||to.deletedAt||from.managementAccount!==true||to.managementAccount!==true||!same(from.parentId,to.parentId)||from.companyManagedTotal||to.companyManagedTotal||from.currentAmountMode==='reported-total'||to.currentAmountMode==='reported-total'||from.costBreakdown||to.costBreakdown)fail('MERGE_PARTICIPANTS');
  if(!afterFrom||!afterTo||afterTo.deletedAt||afterTo.managementAccount!==true||typeof afterFrom.deletedAt!=='string'||!Number.isFinite(Date.parse(afterFrom.deletedAt))||afterFrom.mergedIntoId!==toId)fail('MERGE_ALIAS');
  if(!posting(fromId,priorLinks)||!posting(toId,priorLinks)||!same(priorLinks[fromId],links[fromId])||!same(priorLinks[toId],links[toId]))fail('ORIGINAL_BINDING');
  if(!same(unstructured(from,new Set(['deletedAt','mergedIntoId','mergedSourceIds'])),unstructured(afterFrom,new Set(['deletedAt','mergedIntoId','mergedSourceIds']))))fail('FROM_ORIGINAL_CHANGED');
  if(!same(unstructured(to,new Set(['mergedSourceIds','sourceIds','budgetState'])),unstructured(afterTo,new Set(['mergedSourceIds','sourceIds','budgetState']))))fail('TARGET_ORIGINAL_CHANGED');
  if([from,to].some(r=>r.sourceIds!==undefined&&r.sourceIds!==null&&!Array.isArray(r.sourceIds)))fail('SOURCE_IDS');
  if(!same(afterTo.sourceIds,[...new Set([...(to.sourceIds||[]),...(from.sourceIds||[])])]))fail('TARGET_SOURCE_IDS');
  for(const origin of [from,to]){
   const priorChildren=children(priorRows,origin.id),created=byOrigin.get(origin.id),current=nextRows.get(origin.id);let expected;
   if(!priorChildren.length&&origin.budgetState!=='template'){
    if(!created)fail('MISSING_ORIGINAL_COPY');expected=[created.id];
   }else{
    if(created)fail('UNEXPECTED_ORIGINAL_COPY');
    if(!priorChildren.length&&origin.budgetState==='template'&&['current','initial','reportedCurrentTotal'].some(k=>origin[k]!==null&&origin[k]!==undefined&&origin[k]!==''))fail('TEMPLATE_HAS_ENTERED_AMOUNT');
    expected=Array.isArray(origin.mergedSourceIds)?origin.mergedSourceIds:priorChildren.map(r=>r.id);
   }
   if(!Array.isArray(current.mergedSourceIds)||!same(current.mergedSourceIds,expected))fail('SOURCE_MAPPING');
  }
  const fromChildren=preserveExistingBranch(from,toId,true),toChildren=preserveExistingBranch(to,toId,false),expectedFrom=fromChildren.filter(r=>r.deletedAt).map(r=>r.id),expectedTo=[...toChildren.map(r=>r.id),...fromChildren.filter(r=>!r.deletedAt).map(r=>r.id),...[from,to].map(r=>byOrigin.get(r.id)?.id).filter(Boolean)];
  if(!sameIds(allChildren(nextRows,fromId).map(r=>r.id),expectedFrom)||!sameIds(allChildren(nextRows,toId).map(r=>r.id),expectedTo))fail('MERGE_CHILD_SET');
  if(afterTo.budgetState!==(children(nextRows,toId).length?'active':to.budgetState))fail('TARGET_BUDGET_STATE');
 }
 const allowed=new Set();
 for(const row of copies){
  const origin=priorRows.get(row.originCbsId);if(!origin||origin.deletedAt||origin.managementAccount!==true||origin.sourceRecord===true||origin.budgetState==='template'||children(priorRows,origin.id).length)fail('ORIGINAL_SOURCE');
  const matches=events.filter(e=>Array.isArray(e.fromIds)&&Array.isArray(e.toIds)&&e.toIds.includes(row.parentId)&&(e.fromIds.includes(origin.id)||e.toIds.includes(origin.id)));if(matches.length!==1)fail('MERGE_EVENT_RELATION');const event=matches[0];checkEvent(event);
  if(row.parentId!==event.toIds[0]||row.code!==nextSourceCode(origin)||(next.cbs||[]).filter(r=>r.code===row.code).length!==1)fail('COPY_POSITION_OR_CODE');
  if(!same(unstructured(origin,copyStructure),unstructured(row,copyStructure)))fail('COPY_ORIGINAL_CHANGED');
  const original=posting(origin.id,priorLinks),created=posting(row.id,links);if(!original||!created||original.binding.costTypeId!==created.binding.costTypeId||original.binding.costTypeCode!==created.binding.costTypeCode||original.binding.masterVersion!==created.binding.masterVersion||created.binding.reason!=='관리항목 합치기 원자료 보존')fail('COPY_BINDING');
  const oldBinding={...original.binding,entryRole:original.entry.entryRole,kind:original.entry.kind},newBinding={...created.binding,entryRole:created.entry.entryRole,kind:created.entry.kind};for(const k of ['recordId','method','reason']){delete oldBinding[k];delete newBinding[k];}if(!same(oldBinding,newBinding))fail('COPY_BINDING_ORIGINAL_CHANGED');
  const scope=effectiveScope(priorRows,origin);if(event.fromIds[0]===origin.id&&!own(row,'mergedBudgetScopeRef')||own(row,'mergedBudgetScopeRef')&&(typeof row.mergedBudgetScopeRef!=='string'||row.mergedBudgetScopeRef!==scope)||effectiveScope(nextRows,row)!==scope)fail('COPY_SCOPE');
  allowed.add(row.id);
 }
 return allowed;
}
export function validateProjectCostChange(old,next){
 const confirmedTarget=(project,id)=>{const binding=project.costCoding?.currentByRecordId?.[id],entry=binding&&costMasters.get(binding.masterVersion)?.get(binding.costTypeId);if(!binding||binding.costTypeMappingStatus!=='confirmed'||!entry||entry.code!==binding.costTypeCode||entry.entryRole!=='posting'||entry.kind.startsWith('system-'))return null;const target=costTaxonomy.finalItems.find(t=>t.primaryTypeId===binding.costTypeId)||costTaxonomy.finalItems.find(t=>t.finalId===costTaxonomy.old152Map.find(m=>m.oldTypeId===binding.costTypeId)?.targetKey);return target?.role==='budget-cost'?target.finalId:null;};
 const transition=validateCostBreakdownTransitions(old,next,{confirmedTarget});if(!transition.valid)throw new WorkspaceError(422,'INVALID_COST_BREAKDOWN',transition.errors[0].message);
 const priorRows=recordMap(old?.cbs),priorLinks=old?.costCoding?.currentByRecordId||{},links=next.costCoding?.currentByRecordId||{};
 const sameType=(a,b)=>a&&b&&a.costTypeId===b.costTypeId&&a.costTypeCode===b.costTypeCode&&a.masterVersion===b.masterVersion;
 // 기존 검토 원가는 금액 변경 없이 먼저 코드만 바꾸거나 삭제한 뒤 재등록하는 우회도 허용하지 않습니다.
 // 같은 검토 유형의 금액 수정·soft delete·명시적 확인총액 전환은 그대로 보존합니다.
 const nextRows=recordMap(next.cbs);
 for(const row of old?.cbs||[]){const previous=priorLinks[row.id];if(!previous||costBinding(row.id,previous).kind!=='system-review')continue;const linked=links[row.id],target=nextRows.get(row.id),explicitReported=linked?.costTypeId==='sys_review_reported'&&linked.method==='reported-total'&&target?.currentAmountMode==='reported-total';if(!target||!linked||costBinding(row.id,linked).kind!=='system-review'||linked.costTypeMappingStatus!=='review'||!sameType(previous,linked)&&!explicitReported)throw new WorkspaceError(400,'COST_REVIEW_PRESERVED','기존 검토 비용의 원래 코드 연결을 유지해 주세요. 원래 코드로 금액을 수정할 수 있습니다.');}
 const mergeCopies=preservedManagementMergeCopies(old,next,priorRows,nextRows,priorLinks,links);
 for(const row of next.cbs||[]){
  if(row.deletedAt)continue;const previous=priorRows.get(row.id),entered=['current','initial','reportedCurrentTotal'].some(key=>row[key]!==undefined&&row[key]!==null&&row[key]!==''&&!same(row[key],previous?.[key]));if(!entered)continue;
  const children=(next.cbs||[]).filter(child=>child.parentId===row.id&&!child.deletedAt&&child.budgetState!=='template');if(children.length&&!row.companyManagedTotal&&row.currentAmountMode!=='reported-total')continue;
  const link=links[row.id];if(!link)throw invalid('금액을 입력하기 전에 등록된 비용 항목을 선택해 주세요.');const entry=costBinding(row.id,link),priorLink=priorLinks[row.id];
  if(mergeCopies.has(row.id))continue;
  const firstTemplateAmount=previous?.budgetState==='template'&&['current','initial','reportedCurrentTotal'].every(key=>previous[key]===null||previous[key]===undefined||previous[key]==='');
  if(!previous&&link.method==='split-inherit'){if(priorRows.has(row.parentId)&&!priorRows.get(row.parentId).deletedAt&&sameType(priorLinks[row.parentId],link))continue;throw invalid('분해할 기존 비용과 같은 비용코드를 연결해 주세요.');}
  if(!previous&&link.method==='breakdown-inherit'){const parent=priorRows.get(row.breakdownParentId);if(parent&&!parent.deletedAt&&parent.id===row.parentId&&sameType(priorLinks[parent.id],link)&&link.costTypeMappingStatus==='confirmed'&&entry.entryRole==='posting'&&!entry.kind.startsWith('system-'))continue;throw invalid('직접 입력한 하위 내역은 기존 상위의 확인된 비용코드를 유지해 주세요.');}
  if(previous&&entry.entryRole==='posting'&&sameType(priorLink,link)&&(!firstTemplateAmount||entry.newSelectable&&!entry.kind.startsWith('system-')))continue;
  if(link.masterVersion===masterV4.version&&entry.entryRole==='posting'&&entry.newSelectable===true&&!entry.kind.startsWith('system-')&&link.costTypeMappingStatus==='confirmed')continue;
  // 기존 범위의 분해와 명시적 부가세/재분류/확인총액 경로는 정상 신규유형과 구별합니다.
  if(entry.id==='sys_adjust_vat'&&row.costReclassification===true&&row.reclassificationKey==='vat-pool')continue;
  if(entry.id==='sys_adjust_reclassification'&&row.costReclassification===true&&row.reclassificationKey!=='vat-pool')continue;
  if(entry.id==='sys_review_reported'&&row.currentAmountMode==='reported-total'&&previous)continue;
  if(entry.id==='sys_review_remainder'&&row.reportedTotalRemainder===true&&priorRows.has(row.parentId))continue;
  throw invalid('새 금액은 선택 가능한 회사 공통 비용 항목으로 저장해 주세요.');
 }
 return next;
}
function mergeRows(current,incoming,canChange,{preserveMissing=true}={}){
 const oldMap=recordMap((current||[]).filter(row=>validId(row?.id))),newMap=recordMap((incoming||[]).filter(row=>validId(row?.id))),result=[],opaqueCounts=new Map();
 // 식별값이 없는 이전 격리/진단 기록은 같은 빈 ID로 합치지 않습니다. 원문·개수를 그대로 보존합니다.
 for(const row of current||[]){if(!validId(row?.id)){result.push(clone(row));const key=stable(row);opaqueCounts.set(key,(opaqueCounts.get(key)||0)+1);continue;}const next=newMap.get(row.id);if(next&&!same(row,next)){if(!canChange(row,next))throw forbidden();result.push(clone(next));}else result.push(clone(row));newMap.delete(row.id);}
 for(const row of newMap.values()){if(oldMap.has(row.id)||!canChange(null,row))throw forbidden();result.push(clone(row));}
 for(const row of incoming||[])if(!validId(row?.id)){const key=stable(row),count=opaqueCounts.get(key)||0;if(count){opaqueCounts.set(key,count-1);continue;}if(!canChange(null,row))throw forbidden();result.push(clone(row));}
 if(!preserveMissing)throw Error('Unsupported merge policy');return result;
}
function normalizeNewAudit(current,incoming,access,user){
 const old=recordMap(current),next=recordMap(incoming);for(const row of current||[]){const candidate=next.get(row.id);if(candidate&&!same(row,candidate))throw new WorkspaceError(400,'IMMUTABLE_AUDIT','기존 변경 이력은 수정할 수 없습니다.');}
 const fresh=[];for(const row of incoming||[]){if(old.has(row.id))continue;const id=rowProjectId(row);if(!access.isAdmin&&(!id||!editable(access,id)))throw forbidden();fresh.push({...clone(row),actor:user.email});}
 return [...fresh,...clone(current||[])];
}
function associatedProjects(state,kind,id){
 const ids=new Set();for(const p of state.projects||[]){if(kind==='entity'&&p.entityId===id||kind==='company'&&references(p,'companyId').has(id))ids.add(p.id);}
 if(kind==='company')for(const row of state.companyParticipations||[])if(row.companyId===id&&validId(rowProjectId(row)))ids.add(rowProjectId(row));return ids;
}
function validateSharedReferenceChanges(current,next,visible,access){
 if(access.isAdmin)return;
 const existingEntities=recordMap(current.entities),nextEntities=recordMap(next.entities),visibleEntities=new Set((visible.entities||[]).map(row=>row.id)),previousProjects=recordMap(current.projects);
 const editableIds=new Set(next.projects.filter(p=>editable(access,p.id)).map(p=>p.id));
 for(const p of next.projects){
  if(!editableIds.has(p.id)||same(p.entityId,previousProjects.get(p.id)?.entityId)||p.entityId===undefined||p.entityId===null||p.entityId==='')continue;
  if(!validId(p.entityId)||!nextEntities.has(p.entityId)||existingEntities.has(p.entityId)&&!visibleEntities.has(p.entityId))throw forbidden();
 }
 // Public partner publications are separate from private workspace company records.
 const existingCompanies=recordMap(current.companies),visibleCompanies=new Set((visible.companies||[]).map(row=>row.id));
 for(const id of visibleCompanyIds(next,editableIds))if(existingCompanies.has(id)&&!visibleCompanies.has(id))throw forbidden();
}
function validateProfessionalDateChanges(current,next){
 const previousEntities=recordMap(current.entities),dateFields=['preEducationDate','recentTrainingDate','trainingDueDate','employmentStartDate','employmentEndDate'];
 for(const entity of next.entities||[]){const previousRows=recordMap(previousEntities.get(entity.id)?.professionalRecords);for(const row of entity.professionalRecords||[]){const previous=previousRows.get(row.id);for(const key of dateFields){if(!own(row,key)||previous&&same(previous[key],row[key]))continue;const value=row[key];if(value===''||value===null)continue;const valid=typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;if(!valid)throw new WorkspaceError(422,'INVALID_PROFESSIONAL_DATE','전문인력의 교육일·이수기한·재직일을 올바른 날짜로 입력해 주세요.');}}}
}
function validateLoanPricingChanges(current,next){
 const previousProjects=recordMap(current.projects),rates=['interestRate','upfrontFeeRate','advisoryFeeRate','allIn'],ratios=['ltv','ltc'],amounts=['commitment','executed','balance'],terms=['interestTerms','otherFees','repaymentTerms'],dates=['start','maturity','finalMaturity'],knownAmount=value=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0,knownDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
 for(const project of next.projects||[]){const previousLoans=recordMap(previousProjects.get(project.id)?.loans);for(const row of project.loans||[]){const previous=previousLoans.get(row.id);for(const key of [...rates,...ratios,...amounts,'allInAdvisoryBasis',...terms,...dates]){if(!own(row,key)||previous&&same(previous[key],row[key]))continue;const value=row[key];let valid;if(amounts.includes(key))valid=value===null||value===''||knownAmount(value);else if(dates.includes(key))valid=value===null||value===''||knownDate(value);else if(rates.includes(key)||ratios.includes(key))valid=value===null||value===''||typeof value==='number'&&Number.isFinite(value)&&value>=0&&(!rates.includes(key)||value<=100);else if(key==='allInAdvisoryBasis')valid=value===null||value===''||value==='included'||value==='excluded';else valid=typeof value==='string';if(!valid)throw new WorkspaceError(422,'INVALID_FINANCING_TERMS',dates.includes(key)?'약정 시작일·만기일을 올바른 날짜로 입력해 주세요.':'대출 금액·금리·수수료율·비율·상환조건의 입력값을 확인해 주세요.');}
  if((!previous||!same(previous.commitment,row.commitment)||!same(previous.balance,row.balance))&&knownAmount(row.commitment)&&knownAmount(row.balance)&&row.balance>row.commitment)throw new WorkspaceError(422,'INVALID_FINANCING_TERMS','대출 잔액은 약정액 이하여야 합니다.');
  if(previous&&!previous.deletedAt&&row.deletedAt&&(!knownAmount(row.commitment)||row.commitment!==0||!knownAmount(row.balance)||row.balance!==0))throw new WorkspaceError(422,'INVALID_FINANCING_TERMS','약정액과 대출 잔액이 모두 0원으로 확인된 대출만 삭제할 수 있습니다.');
  const finalMaturity=row.finalMaturity||row.maturity,previousFinalMaturity=previous&&(previous.finalMaturity||previous.maturity);if((!previous||!same(previous.start,row.start)||!same(previousFinalMaturity,finalMaturity))&&knownDate(row.start)&&knownDate(finalMaturity)&&finalMaturity<row.start)throw new WorkspaceError(422,'INVALID_FINANCING_TERMS','최종 만기일은 약정 시작일보다 빠를 수 없습니다.');
 }}
}
export function mergeWorkspaceState(current,incoming,rawAccess,user={email:''}){
 validateWorkspaceState(current);validateWorkspaceState(incoming);const access=normalizeWorkspaceAccess(rawAccess),visible=filterWorkspaceState(current,access),next=clone(current),oldProjects=recordMap(current.projects),incomingProjects=recordMap(incoming.projects),changed=new Set(),importedInitialProjects=[];
 for(const old of current.projects){const p=incomingProjects.get(old.id);if(!readable(access,old.id)){if(p)throw forbidden();continue;}if(!p){if(htmlFixturePolicy.isApprovedProject(old)){if(!access.isAdmin)throw forbidden();changed.add(old.id);continue;}throw new WorkspaceError(400,'PROJECT_REMOVAL_NOT_ALLOWED','기존 사업은 이 저장 요청으로 삭제할 수 없습니다.');}if(!same(old,p)){if(!editable(access,old.id))throw forbidden();if(htmlFixturePolicy.isApprovedProject(old)&&!same(old.testData,p.testData))throw invalid('테스트사업의 원본 정보는 변경할 수 없습니다.');assertProjectHistory(old,p,access);validateProjectCostChange(old,p);changed.add(old.id);}}
 for(const p of incoming.projects)if(!oldProjects.has(p.id)){
  if(!access.canCreateProject)throw forbidden();assertProjectHistory(null,p,access);
  if(htmlFixturePolicy.isApprovedProject(p)){
   if(!access.isAdmin)throw forbidden();const digest=htmlFixturePolicy.initialProjectSha256(p.id);
   if(!digest||workspaceStateHash(p)!==digest)throw invalid('승인된 원본 테스트사업과 입력한 자료가 일치하지 않습니다.');
   // 원본의 과거 코드·검토 상태는 새 입력으로 승격하지 않습니다. 정확한 최초 원본만 기존 기준자료로 검사합니다.
   validateProjectCostChange(p,p);importedInitialProjects.push(p);
  }else validateProjectCostChange(null,p);
  changed.add(p.id);
 }
 const order=access.isAdmin?incoming.projects.map(p=>p.id):current.projects.map(p=>p.id).concat(incoming.projects.filter(p=>!oldProjects.has(p.id)).map(p=>p.id));
 next.projects=order.map(id=>clone(incomingProjects.get(id)||oldProjects.get(id)));
 for(const[key,kind]of [['entities','entity'],['companies','company']]){
  next[key]=mergeRows(current[key]||[],incoming[key]||[],(old,row)=>{if(access.isAdmin)return true;const linked=new Set([...associatedProjects(current,kind,row.id),...associatedProjects(next,kind,row.id)]);if(!linked.size||[...linked].some(id=>!editable(access,id)))return false;for(const id of linked)changed.add(id);return true;});
 }
 next.auditEvents=normalizeNewAudit(current.auditEvents||[],incoming.auditEvents||[],access,user);for(const row of incoming.auditEvents||[])if(!(current.auditEvents||[]).some(old=>old.id===row.id)&&rowProjectId(row))changed.add(rowProjectId(row));
 next.notifications=mergeRows(current.notifications||[],incoming.notifications||[],(old,row)=>{if(old&&!same(old.dismissed,row.dismissed))throw new WorkspaceError(409,'PERSONAL_NOTIFICATION_REQUIRED','알림 목록을 다시 열어 개인 알림 상태를 변경해 주세요.');if(access.isAdmin)return true;const id=rowProjectId(row);if(!id||!readable(access,id)||old&&rowProjectId(old)!==id)return false;if(!editable(access,id))return false;changed.add(id);return true;});
 for(const key of scopedKeys)if(own(incoming,key)){if(!Array.isArray(incoming[key]))throw invalid();next[key]=mergeRows(current[key]||[],incoming[key],(old,row)=>{const id=rowProjectId(row);if(access.isAdmin){if(id)changed.add(id);return true;}if(!id||!editable(access,id)||old&&rowProjectId(old)!==id)return false;changed.add(id);return true;});}
 for(const[key,value]of Object.entries(incoming)){
  if(['projects','entities','companies','auditEvents','notifications'].includes(key)||scopedKeys.has(key)||key==='storageRevision')continue;
  if(metaKeys.has(key)){if(['currentProjectId','selectedProjectId'].includes(key)&&value&&!readable(access,value))throw forbidden();next[key]=clone(value);continue;}
  if(access.isAdmin){next[key]=clone(value);continue;}
  if(!same(value,visible[key]))throw forbidden();
 }
 validateSharedReferenceChanges(current,next,visible,access);validateWorkspaceState(next);validateProfessionalDateChanges(current,next);validateLoanPricingChanges(current,next);const permitBasis=importedInitialProjects.length?{...current,projects:[...current.projects,...importedInitialProjects]}:current,permitValidation=validatePermitChanges(permitBasis,next);if(!permitValidation.valid)throw new WorkspaceError(422,'INVALID_PERMIT',permitValidation.errors[0]?.message||'인허가 입력값을 확인해 주세요.');return {state:next,changedProjectIds:[...changed],requiresAdmin:access.isAdmin};
}
export async function readWorkspaceAccess(client,session){
 if(session.sampleViewerOnly===true){let projects;try{projects=await readApprovedSampleProjects(client);}catch{throw new WorkspaceError(503,'APPROVED_SAMPLES_UNAVAILABLE','샘플 자료를 확인하지 못했습니다.');}return normalizeWorkspaceAccess({sampleViewerOnly:true,projects:Object.fromEntries(projects.map(p=>[p.id,'viewer']))});}
 const admin=await client.query(`SELECT user_id FROM ${table('platform_admins')} WHERE user_id = $1`,[session.userId]);
 const result=await client.query(`SELECT project_id, role FROM ${table('project_members')} WHERE user_id = $1`,[session.userId]);
 return normalizeWorkspaceAccess({isAdmin:admin.rows.length>0,canCreateProject:admin.rows.length>0,projects:Object.fromEntries(result.rows.map(row=>[row.project_id,row.role]))});
}
async function bodyJson(request,allowed){
 if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw new WorkspaceError(415,'INVALID_CONTENT_TYPE','JSON 형식으로 요청해 주세요.');
 if(Number(request.headers.get('content-length'))>MAX_WORKSPACE_BYTES+1024)throw new WorkspaceError(413,'WORKSPACE_TOO_LARGE','저장할 자료의 크기를 확인해 주세요.');
 let value;try{const text=await request.text();if(Buffer.byteLength(text)>MAX_WORKSPACE_BYTES+1024)throw new WorkspaceError(413,'WORKSPACE_TOO_LARGE','저장할 자료의 크기를 확인해 주세요.');value=JSON.parse(text);}catch(error){if(error instanceof WorkspaceError)throw error;throw invalid();}
 if(!object(value)||Object.keys(value).some(key=>!allowed.includes(key)))throw invalid();validateTree(value);return value;
}
function requestId(value){if(typeof value!=='string'||!/^[a-zA-Z0-9_-]{16,100}$/.test(value))throw invalid('저장 요청 식별값을 확인해 주세요.');return value;}
function revision(value){const n=typeof value==='string'&&/^\d+$/.test(value)?Number(value):value;if(!Number.isSafeInteger(n)||n<0)throw invalid('저장본 번호를 확인해 주세요.');return n;}
async function readWorkspace(client,id){const result=await client.query(`SELECT workspace_id, revision, state FROM ${table('platform_workspace')} WHERE workspace_id = $1`,[id]);if(result.rows.length!==1)throw new WorkspaceError(503,'WORKSPACE_UNAVAILABLE','중앙 저장소를 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');const row=result.rows[0];validateWorkspaceState(row.state);return {...row,revision:revision(row.revision)};}
async function lockedWorkspace(client,id){const result=await client.query(`SELECT workspace_id, revision, state FROM ${table('platform_workspace')} WHERE workspace_id = $1 FOR UPDATE`,[id]);if(result.rows.length!==1)throw new WorkspaceError(503,'WORKSPACE_UNAVAILABLE','중앙 저장소를 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');const row=result.rows[0];validateWorkspaceState(row.state);return {...row,revision:revision(row.revision)};}
function responsePayload(saved,access){const {authorization,...payload}=saved;if(own(payload,'state'))payload.state=filterWorkspaceState(payload.state,access);return payload;}
async function replay(client,workspaceId,session,id,hash,access){
 const result=await client.query(`SELECT body_hash, response FROM ${table('workspace_requests')} WHERE workspace_id = $1 AND user_id = $2 AND request_id = $3`,[workspaceId,session.userId,id]);if(!result.rows.length)return null;const saved=result.rows[0];if(saved.body_hash!==hash)throw new WorkspaceError(409,'REQUEST_ID_REUSED','같은 저장 요청에 다른 내용이 포함되어 있습니다.');const permission=saved.response.authorization||{};if(permission.admin&&!access.isAdmin||(permission.projectIds||[]).some(id=>!editable(access,id)))throw forbidden();if(!own(saved.response,'state'))throw new WorkspaceError(503,'WORKSPACE_UNAVAILABLE','저장 결과를 확인할 수 없습니다. 최신 자료를 다시 불러와 주세요.');return responsePayload(saved.response,access);
}
async function commitState(client,{workspaceId,current,state,session,id,hash,changedProjectIds,requiresAdmin=false,responseExtra={},access}){
 const nextRevision=current.revision+1;if(!Number.isSafeInteger(nextRevision))throw new Error('Workspace revision exhausted');state.storageRevision=nextRevision;
 const result=await client.query(`UPDATE ${table('platform_workspace')} SET state = $1::jsonb, revision = $2, updated_at = now() WHERE workspace_id = $3 AND revision = $4 RETURNING revision`,[JSON.stringify(state),nextRevision,workspaceId,current.revision]);if(result.rowCount!==1)throw conflict();
 const saved={workspaceId,revision:nextRevision,requestId:id,...responseExtra,state:filterWorkspaceState(state,access),authorization:{admin:requiresAdmin,projectIds:changedProjectIds}};
 await client.query(`INSERT INTO ${table('workspace_audit')} (id, workspace_id, user_id, request_id, base_revision, next_revision, changed_project_ids, state_before_hash, state_after_hash, state_before, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10::jsonb,now())`,[randomUUID(),workspaceId,session.userId,id,current.revision,nextRevision,JSON.stringify(changedProjectIds),workspaceStateHash(current.state),workspaceStateHash(state),JSON.stringify(current.state)]);
 await client.query(`INSERT INTO ${table('workspace_requests')} (workspace_id,user_id,request_id,body_hash,result_revision,response,created_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,now())`,[workspaceId,session.userId,id,hash,nextRevision,JSON.stringify(saved)]);
 return responsePayload(saved,access);
}
export function createWorkspaceHandlers({withTransaction,origin,workspaceId=DEFAULT_WORKSPACE_ID,accessPolicy=readWorkspaceAccess}={}){
 if(typeof withTransaction!=='function'||typeof origin!=='string'||!validId(workspaceId))throw Error('Workspace runtime required');
 // 처리 중 발생한 오류는 트랜잭션 바깥으로 전달해야 저장을 확실히 되돌린 뒤 응답할 수 있습니다.
 const guarded=fn=>async request=>{if(request.method!=='GET'&&request.headers.get('origin')!==origin||request.headers.has('origin')&&request.headers.get('origin')!==origin)throw new WorkspaceError(403,'ORIGIN_NOT_ALLOWED','허용된 화면에서 다시 요청해 주세요.');return fn(request);};
 const workspace=guarded(async request=>{
  if(!['GET','PUT'].includes(request.method))return json({error:'METHOD_NOT_ALLOWED'},405,{allow:'GET, PUT'});
  let input,hash;if(request.method==='PUT'){input=await bodyJson(request,['workspaceId','baseRevision','requestId','state']);if(input.workspaceId!==workspaceId)throw forbidden();revision(input.baseRevision);requestId(input.requestId);validateWorkspaceState(input.state);hash=workspaceStateHash({action:'workspace',...input});}
  return withTransaction(request,async(client,session)=>{
   if(!session?.userId)throw new WorkspaceError(401,'AUTH_REQUIRED','로그인해 주세요.');if(session.sampleViewerOnly===true&&request.method!=='GET')throw new WorkspaceError(403,'SAMPLE_VIEWER_ONLY','샘플 자료는 조회만 할 수 있습니다.');const user={userId:session.userId,email:companyEmail(session.email),...(session.sampleViewerOnly===true?{sampleViewerOnly:true}:{})},current=await(request.method==='GET'?readWorkspace(client,workspaceId):lockedWorkspace(client,workspaceId)),access=normalizeWorkspaceAccess(await accessPolicy(client,user));
   if(request.method==='GET')return json({workspaceId,revision:current.revision,state:filterWorkspaceState(current.state,access),capabilities:{createProject:access.canCreateProject,manageAccess:access.isAdmin,viewPlatformSpec:!access.sampleViewerOnly&&user.email==='kylee@igisam.com'},projectRoles:access.projects,user:{id:user.userId,email:user.email},...(access.sampleViewerOnly?{permissions:{sampleOnly:true}}:{})});
   const previous=await replay(client,workspaceId,user,input.requestId,hash,access);if(previous)return json(previous);
   for(const p of input.state.projects)if(current.state.projects.some(old=>old.id===p.id)?!readable(access,p.id):!access.canCreateProject)throw forbidden();
   if(revision(input.baseRevision)!==current.revision)throw conflict();const graphErrors=costGraphTransitionErrors(current.state,input.state);if(graphErrors.length)throw new WorkspaceError(422,'INVALID_COST_GRAPH',graphErrors[0].message);const merged=mergeWorkspaceState(current.state,input.state,access,user);
   const registrationErrors=projectRegistrationProfileErrors(current.state,merged.state);if(registrationErrors.length)throw new WorkspaceError(422,'INVALID_PROJECT_REGISTRATION',registrationErrors[0].message);
   await validateProjectManagerReferences(client,current.state,merged.state);
   const response=await commitState(client,{workspaceId,current,...merged,session:user,id:input.requestId,hash,access});return json(response);
  });
 });
 const projectAccess=guarded(async request=>{
  if(!['GET','PUT','DELETE'].includes(request.method))return json({error:'METHOD_NOT_ALLOWED'},405,{allow:'GET, PUT, DELETE'});
  let input,hash;if(request.method!=='GET'){input=await bodyJson(request,['workspaceId','baseRevision','requestId','projectId','email','role']);if(input.workspaceId!==workspaceId||!validId(input.projectId))throw invalid();revision(input.baseRevision);requestId(input.requestId);try{input.email=companyEmail(input.email)}catch{throw invalid('회사 이메일을 확인해 주세요.');}if(request.method==='PUT'&&!roles.has(input.role))throw invalid('조회·수정·확정 권한 중에서 선택해 주세요.');if(request.method==='DELETE'&&own(input,'role'))throw invalid();hash=workspaceStateHash({action:'projectAccess',method:request.method,...input});}
  return withTransaction(request,async(client,session)=>{
   if(!session?.userId)throw new WorkspaceError(401,'AUTH_REQUIRED','로그인해 주세요.');if(session.sampleViewerOnly===true)throw forbidden();const user={userId:session.userId,email:companyEmail(session.email)},current=await(request.method==='GET'?readWorkspace(client,workspaceId):lockedWorkspace(client,workspaceId)),access=normalizeWorkspaceAccess(await accessPolicy(client,user));if(!access.isAdmin)throw forbidden();
   const projectId=input?.projectId||new URL(request.url).searchParams.get('projectId');if(!current.state.projects.some(p=>p.id===projectId))throw new WorkspaceError(404,'PROJECT_NOT_FOUND','사업을 찾을 수 없습니다.');
   if(request.method==='GET'){const result=await client.query(`SELECT m.project_id,m.user_id,m.role,u.email FROM ${table('project_members')} m JOIN ${table('app_user')} u ON u.id=m.user_id WHERE m.project_id = $1 ORDER BY u.email`,[projectId]);return json({workspaceId,revision:current.revision,projectId,members:result.rows.map(row=>({userId:row.user_id,email:row.email,role:row.role}))});}
   const previous=await replay(client,workspaceId,user,input.requestId,hash,access);if(previous)return json(previous);if(revision(input.baseRevision)!==current.revision)throw conflict();
   const target=await client.query(`SELECT id,email FROM ${table('app_user')} WHERE lower(email) = $1 AND "emailVerified" = true`,[input.email]);if(target.rows.length!==1)throw new WorkspaceError(404,'MEMBER_NOT_FOUND','이메일 확인을 마친 가입자를 찾을 수 없습니다.');const targetId=target.rows[0].id;
   const previousRole=await client.query(`SELECT role FROM ${table('project_members')} WHERE project_id = $1 AND user_id = $2`,[projectId,targetId]),beforeRole=previousRole.rows[0]?.role||null,afterRole=request.method==='PUT'?input.role:null;
   if(request.method==='PUT')await client.query(`INSERT INTO ${table('project_members')} (project_id,user_id,role,updated_at) VALUES ($1,$2,$3,now()) ON CONFLICT (project_id,user_id) DO UPDATE SET role=EXCLUDED.role,updated_at=now()`,[projectId,targetId,input.role]);
   else await client.query(`DELETE FROM ${table('project_members')} WHERE project_id = $1 AND user_id = $2`,[projectId,targetId]);
   const state=clone(current.state);state.auditEvents.unshift({id:randomUUID(),projectId,action:afterRole?'ACCESS_GRANT':'ACCESS_REVOKE',entity:'projectAccess',idRef:targetId,before:{role:beforeRole},after:{role:afterRole,email:input.email},actor:user.email,at:new Date().toISOString()});
   const response=await commitState(client,{workspaceId,current,state,session:user,id:input.requestId,hash,changedProjectIds:[projectId],requiresAdmin:true,responseExtra:{projectId,email:input.email,role:afterRole},access});return json(response);
  });
 });
 return {workspace,projectAccess};
}
