(function(A){
 'use strict';
 if(!A)return;
 const currentPayload=typeof COST_TYPE_MASTER==='undefined'?null:COST_TYPE_MASTER;
 const archive=typeof COST_TYPE_MASTER_ARCHIVE==='undefined'?{}:COST_TYPE_MASTER_ARCHIVE;
 if(!currentPayload||!['company-cbs-v1','company-cbs-v2','company-cbs-v3','company-cbs-v4'].includes(currentPayload.version)||!Array.isArray(currentPayload.entries))throw Error('회사 공통 비용유형 마스터를 불러오지 못했습니다.');
 const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;};
 const ownValue=(map,key)=>map&&Object.hasOwn(map,key)?map[key]:undefined,cache=new Map();
 function register(raw){
  if(!raw||!raw.version||!Array.isArray(raw.entries))throw Error('비용 항목 목록의 버전 정의를 확인해 주세요.');
  const definition=deepFreeze(JSON.parse(JSON.stringify(raw))),byId=new Map(),byCode=new Map();
  for(const e of definition.entries){
   if(!e.id||!e.code||byId.has(e.id)||byCode.has(e.code))throw Error('표준 비용유형 ID·코드가 중복되거나 비어 있습니다.');
   if(!['group','posting'].includes(e.entryRole)||!['expense','other','reserve','system-review','system-adjustment','system-control'].includes(e.kind))throw Error('표준 비용유형 역할을 확인해 주세요.');
   if(e.newSelectable&&(e.entryRole!=='posting'||e.kind.startsWith('system-')))throw Error('시스템·합계 항목을 신규 비용으로 선택할 수 없습니다.');
   for(const key of ['includes','excludes','displayGroupKeys','legacyKeys','sourceRefs'])if(!Array.isArray(e[key]))throw Error('표준 비용유형 정의가 완전하지 않습니다.');
   byId.set(e.id,e);byCode.set(e.code,e);
  }
  for(const e of definition.entries){const seen=new Set();let cursor=e;while(cursor?.parentId){if(seen.has(cursor.id)||!byId.has(cursor.parentId))throw Error('표준 비용유형 상위 연결을 확인해 주세요.');seen.add(cursor.id);cursor=byId.get(cursor.parentId);if(cursor.entryRole!=='group')throw Error('비용유형의 상위 항목은 집계용 분류여야 합니다.');}}
  cache.set(definition.version,{definition,byId,byCode});
 }
 for(const raw of Object.values(archive))register(raw);register(currentPayload);
 const version=currentPayload.version,definition=cache.get(version).definition;
 const versions=()=>[...cache.keys()],hasVersion=value=>cache.has(value);
 function selected(context={}){const requested=typeof context==='string'?context:context.masterVersion||version;const found=cache.get(requested);if(!found)throw Error('비용 항목 목록의 버전이 맞지 않습니다.');return found;}
 const entry=(value,context={})=>{const chosen=selected(context);return typeof value==='string'?(chosen.byId.get(value)||chosen.byCode.get(value)||null):null;};
 const displayOverrides=Object.freeze({design_survey:'지반조사·측량비',entity_closing:'회계·세무·감사비',permit_services:'인허가 용역비'}),currentGroups=new Map([...(definition.companyDefaultGroups||[]),...(definition.companyDisplayGroups||[])].map(group=>[group.key,group]));
 function groupDisplayName(value){const key=typeof value==='string'?value:value?.key||'',target=A.costTaxonomy?.target?.(key);return target?.role==='budget-cost'?target.name:displayOverrides[key]||currentGroups.get(key)?.currentDisplayName||currentGroups.get(key)?.label||String(value?.label||key);}
 function currentDisplayName(value,context={}){const direct=typeof value==='string'&&currentGroups.has(value)?value:value?.displayGroupKey;if(direct)return groupDisplayName(direct);const candidate=typeof value==='string'?value:value?.id||value?.code||'',found=entry(candidate,context);if(!found)return String(value?.name||candidate);const target=A.costTaxonomy?.targetForType?.(found);if(target?.role==='budget-cost')return target.name;const anchors={I005:'design_survey',O003:'entity_closing',I040:'permit_services'};return anchors[found.code]?groupDisplayName(anchors[found.code]):found.name;}
 const categoryAliases={acquisition:['land'],land:['land'],direct:['direct'],construction:['direct','indirect'],indirect:['direct'],design:['indirect'],professional:['indirect'],permit:['indirect'],tax:['tax'],holding:['tax'],levy:['indirect','tax'],corporate:['corporate'],sales:['corporate'],finance:['finance'],financing:['finance'],contingency:['contingency'],unresolved:[]};
 function rowsFor(context={}){return context.stage?.nodes||context.project?.cbs||[];}
 function allowedCategories(context={}){
  if(context.primaryCategory)return[context.primaryCategory];if(Array.isArray(context.primaryCategories))return context.primaryCategories.slice();
  if(context.category&&Object.hasOwn(categoryAliases,context.category))return categoryAliases[context.category];
  if(context.parentId&&context.project){let cursor=rowsFor(context).find(row=>row.id===context.parentId&&!row.deletedAt),seen=new Set();while(cursor?.parentId){if(seen.has(cursor.id))throw Error('원가 상위 연결이 순환합니다.');seen.add(cursor.id);cursor=rowsFor(context).find(row=>row.id===cursor.parentId&&!row.deletedAt);}if(cursor){const key=cursor.dictionaryKey;return Object.hasOwn(categoryAliases,key)?categoryAliases[key]:null;}}
  return null;
 }
 const entries=(context={})=>selected(context).definition.entries.slice();
 const groupEntries=(context={})=>selected(context).definition.entries.filter(e=>e.entryRole==='group');
 function selectableEntries(context={}){const allowed=allowedCategories(context);return selected(context).definition.entries.filter(e=>e.entryRole==='posting'&&e.newSelectable&&!e.kind.startsWith('system-')&&(!allowed||allowed.includes(e.primaryCategory)));}
 function validateNew(idOrCode,context={}){
  if(context.masterVersion&&context.masterVersion!==version)throw Error('비용 항목 목록의 버전이 맞지 않습니다.');
  const e=entry(idOrCode);if(!e)throw Error('비용 항목을 선택해 주세요.');
  if(e.entryRole!=='posting'||!e.newSelectable||e.kind.startsWith('system-'))throw Error('새 비용으로 선택할 수 없는 비용 항목입니다.');
  const allowed=allowedCategories(context);if(allowed&&!allowed.includes(e.primaryCategory))throw Error('선택한 대분류에 맞는 비용 항목을 선택해 주세요.');return e;
 }
 function assignment(record,e,method,reason,extra={},masterVersion=version){
  if(!e)throw Error('기존 비용에 연결할 표준 유형을 찾을 수 없습니다.');
  const status=e.kind==='system-review'?'review':e.kind==='system-control'?'control':e.kind==='system-adjustment'?'system':e.entryRole==='group'?'group':'confirmed';
  return{recordId:record.id||'',costTypeId:e.id,costTypeCode:e.code,masterVersion,costTypeMappingStatus:status,reason:String(reason||'기존 정확 범위 연결'),method,entryRole:e.entryRole,kind:e.kind,...extra};
 }
 const normalizeKey=value=>typeof value==='string'?value.replace(/^(?:cbs-option:|cbs:)/,''):'';
 function keysFor(record){return[...new Set([record.templateKey,record.modelCatalogKey,record.v0118CommonKey,record.v0118DisplayKey,record.key].map(normalizeKey).filter(Boolean))];}
 function frozenMetadata(record,coded){
  const safeFields=['costTypeMappingReason','costTypeMappingMethod','costTypeEntryRole','costTypeKind','costTypeTargetRecordId','costTypeTargetCostTypeId'],modern=safeFields.some(key=>Object.hasOwn(record,key));
  const legacyTyped=!modern&&record.recordId===record.id&&record.entryRole===coded.entryRole&&record.kind===coded.kind&&typeof record.costTypeMappingStatus==='string';
  const read=(safe,old)=>Object.hasOwn(record,safe)?record[safe]:legacyTyped?record[old]:undefined;
  const reason=read('costTypeMappingReason','reason'),method=read('costTypeMappingMethod','method'),targetRecordId=read('costTypeTargetRecordId','targetRecordId'),targetCostTypeId=read('costTypeTargetCostTypeId','targetCostTypeId');
  return{reason:typeof reason==='string'?reason:'당시 동결된 표준 비용유형',method:typeof method==='string'&&method?method:'frozen-standard-code',extra:{...(targetRecordId?{targetRecordId}:{}),...(targetCostTypeId?{targetCostTypeId}:{})}};
 }
 function resolveLegacy(raw,context={}){
  const record=raw&&typeof raw==='object'?raw:{id:'',templateKey:typeof raw==='string'?raw:''};
  const masterVersion=record.masterVersion||context.masterVersion||(context.recordRole==='new'?version:hasVersion('company-cbs-v1')?'company-cbs-v1':version),chosen=selected({masterVersion}),maps=chosen.definition.legacyMappings||{};
  const get=value=>entry(value,{masterVersion}),result=(e,method,reason,extra)=>assignment(record,e,method,reason,extra,masterVersion),system=(id,method,reason,extra)=>result(get(id),method,reason,extra);
  const keys=keysFor(record);
  if(context.recordRole==='new'){
   const sourceCodes=[...keys.filter(key=>key.startsWith('source_')).map(key=>key.slice(7)),...(record.sourceRecord===true?[String(record.sourceCode||record.code||'')]:[])];
   if(sourceCodes.some(code=>(definition.publicSuppressedSourceCodes||[]).includes(code)))throw Error('개별 공종·전문분야 하위항목은 추가하지 않습니다. 회사 관리항목으로 입력해 주세요.');
  }
  function resolveSource(code){
   const conditional=maps.conditionalInsurance||{};
   if((conditional.sourceCodes||[]).includes(code)){
    if(record.costPurposeOverride||record.reviewRequired===true||!(conditional.exactNames||[]).includes(String(record.name||'')))return system(conditional.reviewId||'sys_review_unknown','conditional-source-review','보험 정확 범위·override 검토 필요');
    return result(get(conditional.costTypeId),'conditional-source','기존 공사보험 원코드+정확명 조건');
   }
   const review=ownValue(maps.reviewSourceCodes,code);if(review)return system('sys_review_unknown','exact-source-review',review);
   const id=ownValue(maps.exactSourceCodes,code);return id?result(get(id),'exact-source','현행 원코드의 명시 과업·관리 수준 연결'):null;
  }
  if(record.costTypeId&&record.masterVersion){const coded=get(record.costTypeId);if(coded&&(!record.costTypeCode||record.costTypeCode===coded.code)){const meta=frozenMetadata(record,coded);return result(coded,meta.method,meta.reason,meta.extra);}return system('sys_review_unknown','invalid-frozen-code','동결 비용유형 연결 검토 필요');}
  if(record.reportedTotalRemainder)return system('sys_review_remainder','system-remainder','확인총액의 미분해 잔액 · 자동 배분 금지',{targetRecordId:record.parentId||''});
  if(record.nonCreditCostAdjustment||record.reclassificationKey==='vat-pool')return system('sys_adjust_vat','system-vat-adjustment','명시 VAT 비용조정 역할',{targetRecordId:record.reclassificationOwnerId||record.parentId||''});
  if(record.costReclassification)return system('sys_adjust_reclassification','system-reclassification','명시 원자료 재분류 signed 조정',{targetRecordId:record.reclassificationOwnerId||record.parentId||''});
  if(record.signedAdjustment)return system('sys_adjust_cash','system-signed-adjustment','원자료 signed 잔액·효과 조정',{targetRecordId:record.parentId||''});
  if(context.recordRole==='control'||record.id==='SAMPLE02:root:corporate'||record.id==='SAMPLE02:root:unresolved')return system('sys_control_financial','trace-root-control','금융 trace의 실제 제어 참여행 known/unknown 보존');
  if(record.currentAmountMode==='reported-total')return system('sys_review_reported','reported-scope-review','기존 확인총액의 범위 검토 · 상세 자동분해 금지');
  const exact=ownValue(maps.exactRecords,record.id);if(exact&&(!exact.projectId||context.project?.id===exact.projectId)){if(exact.conditionalInsurance)return resolveSource(exact.verifiedSourceCode);return result(get(exact.costTypeId),'exact-record',exact.reason);}
  const kids=rowsFor(context).filter(row=>row.parentId===record.id&&!row.deletedAt);
  if(kids.length&&context.recordRole!=='new'){if(!record.parentId){const root=get(ownValue(maps.rootCodes,record.code));if(root)return result(root,'structural-root','비참여 원자료 상위 분류');}return system('sys_control_reference','nonposting-parent','하위 원자료의 비합산 집계·대사 참고행');}
  if(record.sourceRecord===true){const found=resolveSource(String(record.sourceCode||record.code||''));if(found)return found;}
  for(const key of keys.filter(value=>value.startsWith('source_'))){const found=resolveSource(key.slice(7));if(found)return found;}
  for(const key of keys){if((maps.reviewKeys||[]).includes(key))return system('sys_review_unknown','exact-key-review','기존 목적·종류·복합범위 검토: '+key);const id=ownValue(maps.exactKeys,key)||ownValue(maps.explicitCompositeKeys,key);if(id)return result(get(id),'exact-key','현행 정확 비용유형 키: '+key);}
  if(!record.parentId&&ownValue(maps.rootCodes,record.code))return result(get(ownValue(maps.rootCodes,record.code)),'structural-root','원자료 비참여 상위 분류');
  const companyKey=normalizeKey(record.companyProfileKey||record.profileKey),displayId=ownValue(maps.displayGroupTypes,companyKey);if(displayId)return result(get(displayId),'company-exact-scope','명시 회사 관리범위 · 실제 상세 코드가 우선');
  return system('sys_review_unknown','unmatched-review','표준 유형이 확인되지 않은 기존 자료 · 이름/순번/rank 추정 금지');
 }
 A.costTypeMaster=Object.freeze({version,definition,versions,hasVersion,entries,entry,selectableEntries,groupEntries,resolveLegacy,validateNew,groupDisplayName,currentDisplayName});
})(App);
