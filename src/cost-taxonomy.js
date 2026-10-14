(function(A){
 'use strict';
 if(!A)return;
 const raw=typeof COST_TAXONOMY==='undefined'?null:COST_TAXONOMY;
 const master=typeof COST_TYPE_MASTER_V4==='undefined'?null:COST_TYPE_MASTER_V4;
 const VERSION='company-cost-taxonomy-v4',MASTER_VERSION='company-cbs-v4';
 if(!raw||raw.version!==VERSION||!Array.isArray(raw.finalItems)||!Array.isArray(raw.old152Map))throw Error('회사 비용분류 기준을 불러오지 못했습니다.');
 if(!master||master.version!==MASTER_VERSION||!Array.isArray(master.entries))throw Error('회사 비용분류 canonical 마스터를 불러오지 못했습니다.');
 const copy=value=>value==null?value:JSON.parse(JSON.stringify(value));
 const deepFreeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;};
 const definition=deepFreeze(copy(raw)),masterDefinition=deepFreeze(copy(master));
 const targetById=new Map(),targetByPrimaryId=new Map(),targetByPrimaryCode=new Map();
 const oldByTypeId=new Map(),oldByCode=new Map(),masterById=new Map(),masterByCode=new Map();
 for(const entry of masterDefinition.entries){
  if(!entry.id||!entry.code||masterById.has(entry.id)||masterByCode.has(entry.code))throw Error('회사 비용분류 canonical ID·코드가 중복되거나 비어 있습니다.');
  masterById.set(entry.id,entry);masterByCode.set(entry.code,entry);
 }
 for(const target of definition.finalItems){
  if(!target.finalId||targetById.has(target.finalId))throw Error('회사 비용 관리대상 ID가 중복되거나 비어 있습니다.');
  if(!Array.isArray(target.oldTypeIds)||!Array.isArray(target.oldCodes)||target.oldTypeIds.length!==target.oldCodes.length)throw Error('회사 비용 관리대상의 기존 코드 연결을 확인해 주세요.');
  if(target.role==='budget-cost'){
   if(target.primaryTypeId!==target.finalId||target.primaryTypeCode!=='IGIS-COST:'+target.finalId||!target.canonicalPosting)throw Error('회사 비용 관리대상의 canonical 유형을 확인해 주세요.');
   if(targetByPrimaryId.has(target.primaryTypeId)||targetByPrimaryCode.has(target.primaryTypeCode))throw Error('회사 비용 canonical 유형이 중복됩니다.');
   const canonical=masterById.get(target.primaryTypeId);
   if(!canonical||canonical.code!==target.primaryTypeCode||canonical.entryRole!=='posting'||canonical.newSelectable!==true||canonical.noAutoMigration!==true)throw Error('회사 비용 canonical 마스터 연결을 확인해 주세요.');
   targetByPrimaryId.set(target.primaryTypeId,target);targetByPrimaryCode.set(target.primaryTypeCode,target);
  }else if(target.primaryTypeId!==null||target.primaryTypeCode!==null||target.canonicalPosting!==false)throw Error('비용이 아닌 역할은 canonical posting 유형을 가질 수 없습니다.');
  targetById.set(target.finalId,target);
 }
 for(const item of definition.old152Map){
  if(!item.oldTypeId||!item.oldCode||oldByTypeId.has(item.oldTypeId)||oldByCode.has(item.oldCode)||!targetById.has(item.targetKey))throw Error('기존 비용유형의 회사 관리대상 연결을 확인해 주세요.');
  oldByTypeId.set(item.oldTypeId,item);oldByCode.set(item.oldCode,item);
 }
 const budgetTargets=definition.finalItems.filter(item=>item.role==='budget-cost'),nonCostTargets=definition.finalItems.filter(item=>item.role!=='budget-cost');
 if(budgetTargets.length!==95||nonCostTargets.length!==10||oldByTypeId.size!==152||targetById.size!==105)throw Error('회사 비용분류 항목 수를 확인해 주세요.');
 if(masterDefinition.entries.filter(item=>item.entryRole==='posting'&&item.newSelectable).length!==95)throw Error('회사 비용 canonical posting 유형 수를 확인해 주세요.');
  function explicitMasterEntry(value){
   if(!value||typeof value!=='object'||value.entryRole!=='posting'||typeof value.id!=='string'||typeof value.code!=='string')return null;
   const canonicalById=targetByPrimaryId.get(value.id),canonicalByCode=targetByPrimaryCode.get(value.code);
   if(canonicalById&&canonicalById===canonicalByCode)return{kind:'canonical',target:canonicalById};
   const oldById=oldByTypeId.get(value.id),oldByExactCode=oldByCode.get(value.code);
   if(oldById&&oldById===oldByExactCode)return{kind:'old',mapping:oldById};
   return null;
  }
 function oldMapping(value){
  if(typeof value==='string')return oldByTypeId.get(value)||oldByCode.get(value)||null;
  if(!value||typeof value!=='object')return null;
   const explicit=explicitMasterEntry(value);if(explicit?.kind==='old')return explicit.mapping;
  const id=value.oldTypeId||value.costTypeId||value.typeId||'',code=value.oldCode||value.costTypeCode||value.typeCode||'';
  return oldByTypeId.get(id)||oldByCode.get(code)||oldByCode.get(id)||oldByTypeId.get(code)||null;
 }
 function canonicalTarget(value){
  if(typeof value==='string')return targetByPrimaryId.get(value)||targetByPrimaryCode.get(value)||null;
  if(!value||typeof value!=='object')return null;
   const explicit=explicitMasterEntry(value);if(explicit?.kind==='canonical')return explicit.target;
  const id=value.primaryTypeId||value.costTypeId||value.typeId||'',code=value.primaryTypeCode||value.costTypeCode||value.typeCode||'';
  return targetByPrimaryId.get(id)||targetByPrimaryCode.get(code)||targetByPrimaryCode.get(id)||targetByPrimaryId.get(code)||null;
 }
 function targetRecord(value){
  if(typeof value==='string')return targetById.get(value)||canonicalTarget(value)||(oldMapping(value)&&targetById.get(oldMapping(value).targetKey))||null;
  if(!value||typeof value!=='object')return null;
  const key=value.finalId||value.targetKey||value.managementTargetId;
  return key&&targetById.get(key)||canonicalTarget(value)||(oldMapping(value)&&targetById.get(oldMapping(value).targetKey))||null;
 }
 function targets(options={}){
  const role=options.role||'',category=options.category||'',targetKind=options.targetKind||'',selectable=options.selectable;
  return definition.finalItems.filter(item=>(!role||item.role===role)&&(!category||item.category===category)&&(!targetKind||item.targetKind===targetKind)&&(selectable===undefined||canSelectTargetRecord(item)===selectable)).map(copy);
 }
 const target=value=>copy(targetRecord(value));
 function resolveOld(value){const found=oldMapping(value);return found?{...copy(found),target:copy(targetById.get(found.targetKey))}:null;}
 const targetForType=value=>copy(canonicalTarget(value)||(oldMapping(value)&&targetById.get(oldMapping(value).targetKey))||null);
 function canSelectTargetRecord(item){return!!item&&item.role==='budget-cost'&&item.targetKind==='selected-family'&&item.normalSelectable===true&&!!item.primaryTypeId&&!!item.primaryTypeCode;}
 const canSelectTarget=value=>canSelectTargetRecord(targetRecord(value));
 const canSelectOld=value=>false;
 function selectionTargets(options={}){return targets({role:'budget-cost',targetKind:'selected-family',selectable:true,...(options.category?{category:options.category}:{})});}
 function canonicalTypeForTarget(value){
  const item=targetRecord(value);if(!item||item.role!=='budget-cost')return null;
  return{costTypeId:item.primaryTypeId,costTypeCode:item.primaryTypeCode,masterVersion:MASTER_VERSION,targetKey:item.finalId};
 }
 function ref(value){const item=targetRecord(value),mapping=oldMapping(value);return{item,mapping,codes:mapping?[mapping.oldCode]:item?.oldCodes||[]};}
 function relation(left,right){
  const a=ref(left),b=ref(right);if(!a.item||!b.item)return{related:false,symmetric:true,reason:'unknown-target',leftTarget:a.item?.finalId||null,rightTarget:b.item?.finalId||null,forward:false,reverse:false};
  const forward=a.codes.some(code=>{const map=oldByCode.get(code);return(map?.sameBudgetConflicts||[]).some(other=>b.codes.includes(other));});
  const reverse=b.codes.some(code=>{const map=oldByCode.get(code);return(map?.sameBudgetConflicts||[]).some(other=>a.codes.includes(other));});
  const sameTarget=a.item.finalId===b.item.finalId,related=sameTarget||forward||reverse;
  return{related,sameBudgetConflict:related,symmetric:true,reason:sameTarget?'same-target':related?'same-budget-conflict-union':'no-defined-conflict',leftTarget:a.item.finalId,rightTarget:b.item.finalId,forward,reverse};
 }
 function amountState(value){
  if(value===null||value===undefined)return'missing';
  if(typeof value!=='number'||!Number.isFinite(value))return'invalid';
  if(value===0)return'zero';
  return'value';
 }
 const amountDetail=value=>({state:amountState(value),value:typeof value==='number'&&Number.isFinite(value)?value:null});
 function operand(value){
  const object=value&&typeof value==='object'?value:{costTypeId:value};
  const item=targetRecord(object),hasAmount=Object.hasOwn(object,'amount')||Object.hasOwn(object,'current')||Object.hasOwn(object,'value');
  const amount=Object.hasOwn(object,'amount')?object.amount:Object.hasOwn(object,'current')?object.current:Object.hasOwn(object,'value')?object.value:undefined;
  return{item,projectId:String(object.projectId||''),budgetScopeRef:String(object.budgetScopeRef||object.sameBudgetKey||''),amount:hasAmount?amountDetail(amount):amountDetail(undefined)};
 }
 function evaluateBoundary(left,right){
   if(arguments.length!==2)throw Error('비용범위 경계는 왼쪽과 오른쪽 두 항목을 모두 전달해야 합니다.');
  const a=operand(left),b=operand(right),link=relation(left,right),sameProject=!!a.projectId&&a.projectId===b.projectId,sameScope=!!a.budgetScopeRef&&a.budgetScopeRef===b.budgetScopeRef;
  const base={relation:link,leftAmount:a.amount,rightAmount:b.amount,mutation:false,distribution:false,amountAction:'none'};
  if(!a.item||!b.item)return{...base,status:'unknown-target',sameBudgetScope:false,coexistenceAllowed:null};
  if(!a.projectId||!b.projectId||!a.budgetScopeRef||!b.budgetScopeRef)return{...base,status:'unconfirmed',sameBudgetScope:false,coexistenceAllowed:null};
  if(!sameProject||!sameScope)return{...base,status:'independent-scope',sameBudgetScope:false,coexistenceAllowed:true};
  if(link.related)return{...base,status:'same-budget-conflict',sameBudgetScope:true,coexistenceAllowed:false,postingPathLimit:1};
  return{...base,status:'same-budget-no-defined-conflict',sameBudgetScope:true,coexistenceAllowed:true};
 }
 const priorityOrder=()=>copy(definition.priorityOrder||[]),caseRules=()=>copy(definition.caseRules||[]),conflictEvaluation=()=>copy(definition.conflictEvaluation||{}),oldMappings=()=>definition.old152Map.map(copy);
 const api={version:VERSION,masterVersion:MASTER_VERSION,definition,masterDefinition,targets,target,resolveOld,targetForType,selectionTargets,canSelectTarget,canSelectOld,canonicalTypeForTarget,relation,evaluateBoundary,amountState,priorityOrder,caseRules,conflictEvaluation,oldMappings};
 A.costTaxonomy=Object.freeze(api);
})(App);
