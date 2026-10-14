(function(A){
 if(!A)return;
 // 후보 중복 판정 전용 명시표입니다. 이름·정렬 rank·금액으로 같은 비용을 추정하지 않습니다.
 const definitions=[
  {canonical:'compensation',parentKey:'land',keys:['source_1008','optional_0']},
  {canonical:'special-equipment',parentKey:'direct',keys:['source_2020','optional_4']},
  {canonical:'city-plan',parentKey:'indirect',keys:['source_5001','optional_8']},
  {canonical:'education-environment',parentKey:'indirect',keys:['source_5008','optional_10']},
  {canonical:'regional-transport-levy',parentKey:'tax',keys:['source_6003','optional_14']},
  {canonical:'school-site-levy',parentKey:'tax',keys:['source_6004','optional_15']},
  {canonical:'public-contribution',parentKey:'tax',keys:['source_6011','optional_16']},
  {canonical:'tenant-improvement',parentKey:'corporate',keys:['source_9008','optional_25']},
  {canonical:'preopening',parentKey:'corporate',keys:['source_9005','optional_23']},
  {canonical:'operator-technical-support',parentKey:'corporate',keys:['source_9006','optional_24']},
  {canonical:'interest-hedge',parentKey:'finance',keys:['source_8010','optional_20']},
  {canonical:'inflation-reserve',parentKey:'contingency',keys:['source_A004','optional_28']},
  {canonical:'construction-insurance',parentKey:'direct',keys:['construction_insurance'],sameParent:false,condition:'costPurpose.definition=construction_insurance'}
 ].map(item=>Object.freeze({sameParent:true,...item,keys:Object.freeze(item.keys.slice())}));
 const familyDefinitions=[
  {canonical:'public-contribution-donation-budget',profileKey:'public_contribution_donation_budget',label:'공공기여·기부채납',parentKey:'tax',order:148,recordKeys:['source_6011','source_6012','example_public_contribution'],candidateKeys:['optional_16','optional_17','ct_levy_public_contribution','ct_levy_donation','I108','I109','levy_public_contribution','levy_donation','IGIS-COST:levy_public_contribution','IGIS-COST:levy_donation']}
 ].map(item=>Object.freeze({...item,recordKeys:Object.freeze(item.recordKeys.slice()),candidateKeys:Object.freeze(item.candidateKeys.slice()),keys:Object.freeze([...item.recordKeys,...item.candidateKeys])}));
 const byKey=new Map();for(const def of definitions)for(const key of def.keys){if(byKey.has(key))throw Error('원가 후보 별명키가 중복됩니다: '+key);byKey.set(key,def);}
 const familyByKey=new Map();for(const def of familyDefinitions)for(const key of def.keys){if(familyByKey.has(key))throw Error('원가 화면 관리예산 가족키가 중복됩니다: '+key);familyByKey.set(key,def);}
 const normalize=value=>String(value||'').replace(/^(?:cbs-option:|cbs:)/,'');
 function objectKeys(value){const keys=[value.companyProfileKey,value.profileKey,value.modelCatalogKey,value.v0118CommonKey,value.templateKey,value.key].map(normalize).filter(Boolean);if(value.sourceRecord===true){const code=String(value.sourceCode||value.code||'');if(code)keys.unshift('source_'+code);}return[...new Set(keys)];}
 function identify(value,context={}){
  if(value&&typeof value==='object'&&value.canonical){const def=definitions.find(item=>item.canonical===value.canonical&&(item.sameParent===false||item.parentKey===value.parentKey));if(def)return{canonical:def.canonical,parentKey:value.parentKey||def.parentKey,key:value.key||null,sameParent:def.sameParent};}
  if(typeof value==='string'&&value.startsWith('catalog-alias:')){const parts=value.split(':');if(parts.length===3){const def=definitions.find(item=>(item.sameParent?item.parentKey:'any')===parts[1]&&item.canonical===parts[2]);if(def)return{canonical:def.canonical,parentKey:def.parentKey,key:null,sameParent:def.sameParent};}}
  const actualOwner=value&&typeof value==='object'&&value.managementAccount===true,purpose=(context.allowPurposeDefinition===true||actualOwner)?A.costPurpose?.definition?.(value):null;if(purpose?.reviewRequired===true)return null;if(purpose?.key==='construction_insurance'){const def=definitions.find(item=>item.canonical==='construction-insurance');return{canonical:def.canonical,parentKey:context.parentKey||def.parentKey,key:'construction_insurance',sameParent:false};}
  if(actualOwner&&(value.costPurposeOverride||purpose?.reviewRequired===true)&&objectKeys(value).includes('construction_insurance'))return null;
  const keys=value&&typeof value==='object'?objectKeys(value):[normalize(value)],found=[];for(const key of keys){const def=byKey.get(key);if(def&&!found.includes(def))found.push(def);}if(found.length!==1)return null;const def=found[0],key=keys.find(item=>byKey.get(item)===def)||null;return{canonical:def.canonical,parentKey:def.parentKey,key,sameParent:def.sameParent};
 }
 const token=(value,context={})=>{const item=identify(value,context);return item?(item.sameParent===false?'any':item.parentKey)+'|'+item.canonical:'';};
 const selector=(value,context={})=>{const item=identify(value,context);return item?'catalog-alias:'+(item.sameParent===false?'any':item.parentKey)+':'+item.canonical:'';};
 const same=(a,b,context={})=>{const left=token(a,context),right=token(b,context);return!!left&&left===right;};
 const aliases=()=>definitions.map(item=>({canonical:item.canonical,parentKey:item.parentKey,keys:item.keys.slice(),sameParent:item.sameParent,condition:item.condition||null}));
 function familyIdentify(value,context={}){
  if(value&&typeof value==='object'&&value.familyCanonical){const def=familyDefinitions.find(item=>item.canonical===value.familyCanonical);if(def)return{canonical:def.canonical,profileKey:def.profileKey,label:def.label,parentKey:def.parentKey,key:value.key||null};}
  if(typeof value==='string'&&value.startsWith('catalog-family:')){const parts=value.split(':');if(parts.length===3){const def=familyDefinitions.find(item=>item.parentKey===parts[1]&&item.canonical===parts[2]);if(def)return{canonical:def.canonical,profileKey:def.profileKey,label:def.label,parentKey:def.parentKey,key:null};}}
  const keys=value&&typeof value==='object'?[...objectKeys(value),value.costTypeId,value.costTypeCode].map(normalize).filter(Boolean):[normalize(value)],found=[];for(const key of keys){const def=familyByKey.get(key);if(def&&!found.includes(def))found.push(def);}if(found.length!==1)return null;const def=found[0],key=keys.find(item=>familyByKey.get(item)===def)||null;if(context.parentKey&&context.parentKey!==def.parentKey&&context.requireParent===true)return null;return{canonical:def.canonical,profileKey:def.profileKey,label:def.label,parentKey:def.parentKey,key,recordKey:def.recordKeys.includes(key)};
 }
 const familyToken=(value,context={})=>{const item=familyIdentify(value,context);return item?item.parentKey+'|'+item.canonical:'';};
 const familySelector=(value,context={})=>{const item=familyIdentify(value,context);return item?'catalog-family:'+item.parentKey+':'+item.canonical:'';};
 const families=()=>familyDefinitions.map(item=>({canonical:item.canonical,profileKey:item.profileKey,label:item.label,parentKey:item.parentKey,order:item.order,recordKeys:item.recordKeys.slice(),candidateKeys:item.candidateKeys.slice(),keys:item.keys.slice()}));
 A.costCatalogIdentity=Object.freeze({version:'catalog-identity-v27',identify,token,selector,same,aliases,familyIdentify,familyToken,familySelector,families});
})(App);
