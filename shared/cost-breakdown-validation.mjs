// Persistence boundary only. The frontend owns presentation and explicit conversion.
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const identifier=v=>typeof v==='string'&&v.length>0&&v.length<=200&&v.trim()===v&&!/[\u0000-\u001f\u007f]/.test(v);
const money=v=>v===null||Number.isSafeInteger(v);
const missing=v=>v===null||v===undefined||v==='';
function integer(value){if(missing(value))return null;const amount=Number(value);if(!Number.isSafeInteger(amount))throw Error('금액은 원 단위 정수로 입력해 주세요.');return amount;}
function total(values){if(values.some(v=>v===null))return null;const value=values.reduce((sum,v)=>sum+BigInt(v),0n),limit=BigInt(Number.MAX_SAFE_INTEGER);if(value>limit||value<-limit)throw Error('하위 사업비 합계가 지원 범위를 초과했습니다.');return Number(value);}
// Used only at a newly activated breakdown boundary, never to reset later edits.
// The supplied resolver checks canonical/legacy code identity against the server master.
export function costBreakdownAmount(project,id,{confirmedTarget=()=>null}={}){
 const rows=(project?.cbs||[]).filter(r=>!r.deletedAt),map=new Map(rows.map(r=>[r.id,r]));
 const known=value=>({value,knownSum:value??0,unknownCount:value===null?1:0,detailUnknownCount:0,reconciliationRequired:false});
 const combine=infos=>{const sum=total(infos.map(info=>info.knownSum)),unknownCount=infos.reduce((n,info)=>n+info.unknownCount,0);return{value:unknownCount?null:sum,knownSum:sum,unknownCount,detailUnknownCount:infos.reduce((n,info)=>n+(info.detailUnknownCount||0),0),reconciliationRequired:infos.some(info=>info.reconciliationRequired)};};
 function tree(key,seen=new Set()){
  const row=map.get(key);if(!row)return known(null);if(seen.has(key))throw Error('하위 사업비 연결이 순환합니다.');const next=new Set(seen);next.add(key);
  if(row.costBreakdown)return combine(row.costBreakdown.childIds.map(child=>tree(child,next)));
  const children=rows.filter(r=>r.parentId===key&&(r.budgetState!=='template'||r.costBreakdown));
  if(children.length&&row.companyManagedTotal){const value=integer(row.currentAmountMode==='reported-total'?row.reportedCurrentTotal:row.current),info=known(value);info.reconciliationRequired=!!row.companyManagedReconciliationRequired;if(value===null&&Number.isSafeInteger(row.companyManagedKnownSum)&&Number.isSafeInteger(row.companyManagedUnknownCount)){info.knownSum=row.companyManagedKnownSum;info.unknownCount=row.companyManagedUnknownCount;}return info;}
  if(children.length){const detail=combine(children.map(r=>tree(r.id,next)));if(row.currentAmountMode==='reported-total'&&!missing(row.reportedCurrentTotal)){const value=integer(row.reportedCurrentTotal),missingCount=detail.unknownCount+detail.detailUnknownCount;return{...known(value),detailUnknownCount:missingCount,reconciliationRequired:detail.reconciliationRequired||detail.knownSum>value||!missingCount&&detail.knownSum!==value};}return detail;}
  const info=known(integer(row.current));if(info.value===null&&!row.currentEvidenceResolved&&row.legacyCurrentEvidence){info.knownSum=row.legacyCurrentEvidence.knownSum;info.unknownCount=row.legacyCurrentEvidence.unknownCount||1;}return info;
 }
 const row=map.get(id),info=tree(id);
 if(!row?.companyManagedTotal||row.costBreakdown||row.currentAmountMode==='reported-total'||!missing(row.current))return info.value;
 const sources=[...new Set(row.companyManagedSourceIds||[])];if(!sources.length)return info.value;
 const targets=sources.map(key=>map.has(key)?confirmedTarget(project,key):null);if(targets.some(target=>!target)||new Set(targets).size!==1)return info.value;
 const detail=combine(sources.map(key=>tree(key)));return detail.unknownCount||detail.detailUnknownCount||detail.reconciliationRequired?null:detail.knownSum;
}
export function validateCostBreakdownTransitions(before,after,options={}){
 const errors=[],prior=new Map((before?.cbs||[]).filter(r=>!r.deletedAt).map(r=>[r.id,r]));
 for(const row of after?.cbs||[]){const previous=prior.get(row.id);if(previous?.costBreakdown){
   const immutable=['version','activatedFromAmount','activatedAt','reason','sourcePath'];
   if(!row.costBreakdown||immutable.some(key=>row.costBreakdown[key]!==previous.costBreakdown[key])||['current','initial','reportedCurrentTotal'].some(key=>row[key]!==previous[key]))errors.push({id:row.id,message:'최초 세부 전환 기록과 상위 원금액은 그대로 보존해 주세요. 변경 금액은 하위 항목에서 입력해 주세요.'});
   continue;
  }if(row.deletedAt||!row.costBreakdown)continue;
  try{const original=prior.has(row.id)?costBreakdownAmount(before,row.id,options):null,entered=costBreakdownAmount(after,row.id,options);
   if(row.costBreakdown.activatedFromAmount!==original)errors.push({id:row.id,message:'세부 항목으로 바꾸기 전 금액이 변경되었습니다. 현재 금액을 다시 확인해 주세요.'});
   else if(original!==null&&entered!==original)errors.push({id:row.id,message:'입력한 하위 합계가 기존 금액과 일치해야 합니다. 미입력 항목과 금액을 확인해 주세요.'});
  }catch(error){errors.push({id:row.id,message:error.message});}
 }
 return{valid:errors.length===0,errors};
}
export function validateCostBreakdownProject(project){
 const errors=[],rows=project?.cbs||[],map=new Map(rows.map(r=>[r.id,r]));
 const fail=(id,message)=>errors.push({id,message});
 for(const parent of rows){
  if(parent.deletedAt||parent.costBreakdown===undefined)continue;
  const meta=parent.costBreakdown;
  if(!object(meta)||meta.version!==1||!Array.isArray(meta.childIds)||!meta.childIds.length||new Set(meta.childIds).size!==meta.childIds.length||meta.childIds.some(id=>!identifier(id))){fail(parent.id,'하위 사업비 항목의 연결을 확인해 주세요.');continue;}
  if(!money(meta.activatedFromAmount)||typeof meta.reason!=='string'||!meta.reason.trim()||typeof meta.sourcePath!=='string'||typeof meta.activatedAt!=='string'||!Number.isFinite(Date.parse(meta.activatedAt))){fail(parent.id,'세부 사업비 전환 금액·일시·사유를 확인해 주세요.');continue;}
  for(const id of meta.childIds){const child=map.get(id);if(!child||child.deletedAt||id===parent.id||child.parentId!==parent.id||child.breakdownParentId!==parent.id||!['catalog','direct'].includes(child.breakdownInputMode))fail(parent.id,'삭제되거나 다른 비용에 속한 하위 사업비가 연결되어 있습니다.');}
 }
 for(const child of rows){
  if(child.deletedAt||child.breakdownParentId===undefined)continue;
  const parent=map.get(child.breakdownParentId);
  if(!parent||parent.deletedAt||!parent.costBreakdown?.childIds?.includes(child.id)||child.parentId!==parent.id)fail(child.id,'하위 사업비와 상위 항목이 서로 일치하지 않습니다.');
 }
 // Detect cycles without recursion depth or dependence on display order.
 for(const row of rows){if(row.deletedAt||!row.breakdownParentId)continue;const seen=new Set([row.id]);let p=row;while(p?.breakdownParentId){if(seen.has(p.breakdownParentId)){fail(row.id,'하위 사업비 연결이 순환합니다.');break;}seen.add(p.breakdownParentId);p=map.get(p.breakdownParentId);}}
 return{valid:errors.length===0,errors};
}
