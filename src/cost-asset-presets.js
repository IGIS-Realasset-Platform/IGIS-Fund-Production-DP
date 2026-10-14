((A,source)=>{
 'use strict';
 const clone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
 const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 if(!source||typeof source!=='object')throw Error('사업비 프리셋 정의를 불러오지 못했습니다.');
 if(![1,2].includes(source.schemaVersion)||!['cost-use-presets-v1','cost-use-presets-v2'].includes(source.version))throw Error('사업비 프리셋 정의 버전을 확인해 주세요.');
 if(!A.costTypeMaster||source.masterVersion!==A.costTypeMaster.version)throw Error('사업비 프리셋과 비용유형 기준표 버전이 다릅니다.');

 const commonGroupKeys=Object.freeze([...(source.commonGroupKeys||[])]),presets=Object.freeze((source.presets||[]).map(item=>Object.freeze(clone(item)))),byId=new Map(presets.map(item=>[item.id,item]));
 const masterGroupKeys=new Set((A.costTypeMaster.definition?.companyDefaultGroups||[]).map(item=>item.key));
 if(commonGroupKeys.length!==37||new Set(commonGroupKeys).size!==commonGroupKeys.length||commonGroupKeys.some(key=>!masterGroupKeys.has(key)))throw Error('사업비 프리셋의 공통 관리항목을 확인해 주세요.');
 if(presets.length!==9||byId.size!==9||new Set(presets.map(item=>item.label)).size!==9)throw Error('사업비 프리셋 9종 정의를 확인해 주세요.');
 for(const item of presets){
  if(!item.id||!item.label||!Array.isArray(item.projectTypes)||item.projectTypes.length!==1||item.projectTypes[0]!==item.label)throw Error('사업비 프리셋 용도 연결을 확인해 주세요: '+(item.id||'미확인'));
  if(!Array.isArray(item.itemTypeIds)||!item.itemTypeIds.length||new Set(item.itemTypeIds).size!==item.itemTypeIds.length)throw Error('사업비 프리셋 비용유형을 확인해 주세요: '+item.id);
  for(const typeId of item.itemTypeIds){const entry=A.costTypeMaster.entry(typeId);if(!entry?.newSelectable)throw Error('선택할 수 없는 사업비 유형입니다: '+typeId);}
 }

 const definitions=()=>presets.map(clone);
 const get=id=>byId.has(String(id||''))?clone(byId.get(String(id))):null;
 const forProjectType=type=>{const value=String(type||'');const found=presets.find(item=>item.projectTypes.includes(value));return found?clone(found):null;};
 const liveRows=p=>(p?.cbs||[]).filter(row=>!row.deletedAt);
 function targetRecordIds(p){
  const result=new Map();
  for(const row of liveRows(p)){let binding;try{binding=A.costCoding?.resolve?.(p,row.id)}catch{binding=null}if(!binding?.costTypeId)continue;const targetId=A.costTaxonomy?.targetForType?.(binding)?.finalId||binding.costTypeId;if(!result.has(targetId))result.set(targetId,[]);result.get(targetId).push(row.id);}
  return result;
 }
 function currentGroups(p){return new Set((A.companyCostProfile?.managementNodes?.(p)||[]).filter(node=>node.companyManagementRow||node.companySingleActual||node.companyManagementGroup).map(node=>node.companyProfileKey).filter(Boolean));}
 function visibleTargets(p){const ids=new Set();for(const node of A.companyCostProfile?.visibleManagementNodes?.(p)||[]){if(node.companyTaxonomyTargetId)ids.add(node.companyTaxonomyTargetId);for(const recordId of [...(node.managementIds||[]),...(node.sourceIds||[]),node.id].filter(Boolean)){let binding;try{binding=A.costCoding?.resolve?.(p,recordId)}catch{binding=null}const targetId=binding&&A.costTaxonomy?.targetForType?.(binding)?.finalId;if(targetId)ids.add(targetId);}}return ids;}
 function catalogActions(p){const map=new Map();for(const row of A.companyCostProfile?.catalogRows?.(p)||[]){const targetId=row.companyTaxonomyTargetId||A.costTaxonomy?.targetForType?.(row.costTypeId)?.finalId;if(!targetId)continue;if(!map.has(targetId))map.set(targetId,new Set());map.get(targetId).add(row.action);}return map;}
 function preview(p,presetId){
  if(!p?.id)throw Error('사업비 프리셋을 적용할 프로젝트를 찾을 수 없습니다.');
  const definition=byId.get(String(presetId||''));if(!definition)throw Error('사업비 프리셋을 선택해 주세요.');
  const groups=currentGroups(p),records=targetRecordIds(p),visible=visibleTargets(p),actions=catalogActions(p),targetIds=[...definition.itemTypeIds],addGroupKeys=commonGroupKeys.filter(key=>!groups.has(key)),alreadyIncludedGroupKeys=commonGroupKeys.filter(key=>groups.has(key)),addTargetIds=targetIds.filter(targetId=>!records.has(targetId)),alreadyIncludedTargetIds=targetIds.filter(targetId=>records.has(targetId)),ensureTargetIds=targetIds.filter(targetId=>!records.has(targetId)||!visible.has(targetId)&&(actions.get(targetId)?.has('add')||actions.get(targetId)?.has('display')));
  return{presetId:definition.id,label:definition.label,scope:definition.scope,groupKeys:[...commonGroupKeys],targetIds,itemTypeIds:targetIds,addGroupKeys,alreadyIncludedGroupKeys,addTargetIds,alreadyIncludedTargetIds,ensureTargetIds,addTypeIds:[...addTargetIds],alreadyIncludedTypeIds:[...alreadyIncludedTargetIds],ensureTypeIds:[...ensureTargetIds],recordIdsByTarget:Object.fromEntries(targetIds.map(targetId=>[targetId,[...(records.get(targetId)||[])]])),recordIdsByType:Object.fromEntries(targetIds.map(targetId=>[targetId,[...(records.get(targetId)||[])]])),applied:p.costUsePreset?.version===source.version&&p.costUsePreset?.presetId===definition.id};
 }
 const resultRecord=result=>result?.row||result?.record||result;
 function apply(p,presetId,options={}){
  const definition=byId.get(String(presetId||''));if(!definition)throw Error('사업비 프리셋을 선택해 주세요.');
  const adapter=A.costPresetAdapter;if(!adapter||['ensureGroup','ensureType','commitAtomic'].some(name=>typeof adapter[name]!=='function'))throw Error('사업비 프리셋 저장 연결을 확인해 주세요.');
  const mode=options.mode==='registration'||options.source==='project-registration'?'registration':'explicit',initial=preview(p,definition.id),same=p.costUsePreset?.version===source.version&&p.costUsePreset?.presetId===definition.id&&p.costUsePreset?.mode===mode;
  if(same&&!initial.addGroupKeys.length&&!initial.ensureTargetIds.length)return{...initial,changed:false,createdRecordIds:[]};
  return adapter.commitAtomic(p,()=>{
   const fresh=preview(p,definition.id),groupResults=commonGroupKeys.map(key=>adapter.ensureGroup(p,key,{presetId:definition.id,mode})),ensure=A.costTaxonomy&&source.version==='cost-use-presets-v2'?adapter.ensureTarget:adapter.ensureType,targetResults=definition.itemTypeIds.map(targetId=>ensure.call(adapter,p,targetId,{presetId:definition.id,mode})),createdRecordIds=targetResults.filter(result=>result?.created===true).map(result=>resultRecord(result)?.id||result?.recordId||'').filter(Boolean),recordIds=[...new Set(targetResults.map(result=>resultRecord(result)?.id||result?.recordId||'').filter(Boolean))],before=clone(p.costUsePreset??null),targetIds=[...definition.itemTypeIds],after={version:source.version,masterVersion:source.masterVersion,presetId:definition.id,label:definition.label,mode,groupKeys:[...commonGroupKeys],targetIds,typeIds:[...targetIds],recordIds,createdRecordIds,appliedAt:new Date().toISOString()};
   p.costUsePreset=after;
   A.audit?.('COST_USE_PRESET_APPLY','costUsePreset',p.id,before,clone(after),p.id+' '+definition.label+' 사업비 프리셋 적용',{projectId:p.id,view:'cost',tab:'detail',id:p.id});
   return{...fresh,changed:true,groupResults,targetResults,typeResults:targetResults,targetIds,recordIds,createdRecordIds,sidecar:clone(after)};
  },{expectedRevision:options.expectedRevision,mode,presetId:definition.id});
 }

 function typeLabel(typeId){const target=A.costTaxonomy?.target?.(typeId);if(target)return target.name;const entry=A.costTypeMaster.entry(typeId);return entry?A.costTypeMaster.currentDisplayName(entry):typeId;}
 function projectFor(button){const projectId=String(button?.dataset?.projectId||''),p=A.state.projects.find(project=>project.id===projectId);if(!p||A.current()?.id!==projectId)throw Error('프로젝트가 변경되었습니다. 현재 프로젝트에서 다시 열어 주세요.');return p;}
 function openList(p){const rows=presets.map(item=>[esc(item.label),A.btn('미리보기','cbs-preset-preview',{id:item.id,projectId:p.id})]);A.modal('용도별 사업비 프리셋',A.table(['사업 유형','미리보기'],rows));}
 function openPreview(p,presetId,error=''){const plan=preview(p,presetId),items=plan.itemTypeIds.map(typeId=>[esc(typeLabel(typeId)),esc(plan.ensureTypeIds.includes(typeId)?'사업비표에 추가':'현재 항목 유지')]),body=(error?'<p class="field-error" role="alert">'+esc(error)+'</p>':'')+A.table(['원가항목','적용 결과'],items),context={projectId:p.id},footer=A.btn('목록으로','cbs-preset-cancel',context)+A.btn('프리셋 적용','cbs-preset-apply',{...context,id:plan.presetId},'primary');A.modal(plan.label+' 사업비 프리셋',body,footer);}
 A.on?.('cbs-preset-open',()=>openList(A.current()));
 A.on?.('cbs-use-preset-open',()=>openList(A.current()));
 A.on?.('cbs-preset-preview',button=>{try{openPreview(projectFor(button),button.dataset.id)}catch(error){A.closeModal();A.toast(error.message)}});
 A.on?.('cbs-preset-cancel',button=>{try{openList(projectFor(button))}catch(error){A.closeModal();A.toast(error.message)}});
 A.on?.('cbs-preset-apply',button=>{const projectId=String(button.dataset.projectId||''),id=button.dataset.id;try{const p=projectFor(button),result=apply(p,id,{mode:'explicit'});A.closeModal();A.render();A.toast(result.changed?'사업비 프리셋을 적용했습니다.':'이미 같은 사업비 프리셋이 적용되어 있습니다.');}catch(error){const fresh=A.state.projects.find(project=>project.id===projectId);if(fresh&&A.current()?.id===projectId)openPreview(fresh,id,error.message||'사업비 프리셋을 적용하지 못했습니다.');else{A.closeModal();A.toast(error.message||'사업비 프리셋을 적용하지 못했습니다.')}}});

 A.costUsePresets=Object.freeze({version:source.version,definitions,get,preview,apply,forProjectType});
})(App,typeof COST_USE_PRESETS==='undefined'?null:COST_USE_PRESETS);
