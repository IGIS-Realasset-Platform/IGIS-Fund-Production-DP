(function(A){
 if(!A)return;
 // 표시 순서 전용입니다. CBS 목적/부모/명칭/원금액/포함 여부는 바꾸지 않습니다.
 const version='cbs-v26',table=new Map(),unconfirmed=new Set([
  'source_1002','source_1006','source_7001','source_7002','source_7005','source_7006','source_7007','source_7008','source_7009',
  'tax_legal','tax_insurance','tax_guarantee','sales_developer','sales_amc_fee','optional_1','optional_18','optional_19','unresolved_sales_facility_acquisition_service'
 ]);
 const define=(value,keys,overrides={})=>keys.forEach(key=>{if(table.has(key))throw Error('CBS 순서키 중복: '+key);table.set(key,Object.freeze({rank:value,overrides:Object.freeze({...overrides})}));});
 define(1100,['land_purchase','acquisition_purchase_price','source_1001']);
 define(1200,['land_broker','acquisition_brokerage_fee']);
 define(1210,['land_purchase_fees']);
 define(1220,['land_amc_acquisition_fee']);
 define(1300,['land_due','acquisition_due_diligence','land_acquisition_advice']);
 define(1400,['land_rights']);define(1401,['source_1003']);define(1402,['source_1005']);
 define(1500,['optional_0','source_1008']);
 define(1600,['land_acquisition_tax','tax_land','acquisition_tax']);
 define(1700,['land_registration','acquisition_registration']);
 define(1800,['land_vat_noncreditable']);define(1990,['source_adjustment_land']);

 define(21100,['direct_main','construction_main']);
 for(let code=2001;code<=2018;code++)define(21100+(code-2000)/1000,['source_'+code]);
 define(21200,['direct_demolition','construction_demolition_site','source_1004']);
 define(21210,['direct_soil_remediation']);define(21220,['optional_2','direct_obstruction_relocation','source_1007']);
 define(21300,['direct_site','construction_civil_landscape_utilities']);
 define(21400,['interior_works','optional_3','source_2019']);define(21410,['optional_4','source_2020','ct_direct_special','D005','cost-type:ct_direct_special','cost_type_ct_direct_special','current-type:ct_direct_special']);
 define(21500,['indirect_site','indirect_contractor_site_overhead'],{indirect:32100});
 define(21510,['indirect_contractor_general_overhead'],{indirect:32110});
 define(21520,['optional_5'],{indirect:32120});
 define(21600,['indirect_test'],{indirect:32200});
 define(21700,['indirect_handover'],{indirect:32300});
 define(21800,['construction_insurance'],{indirect:32400});
 define(21810,['construction_liability_insurance'],{indirect:32410});
 define(21820,['construction_guarantee_fee'],{indirect:32420});
 define(21830,['finance_contract_delay_interest']);
 define(21900,['reserve_construction','contingency_construction','source_A001']);
 define(21990,['source_adjustment_direct_cash']);
 const siteSlots={3001:21501,3002:21502,3003:21503,3004:21504,3005:21601,3006:21800,3007:21820,3008:21610,3009:21701,3010:21950};
 for(const[code,value]of Object.entries(siteSlots))define(value,['source_'+code],{indirect:code==='3010'?32950:32000+(value-21000)});

 define(31100,['design_main','professional_design']);
 for(let code=4001;code<=4006;code++)define(31100+(code-4000)/1000,['source_'+code]);
 define(31110,['interior_design','optional_6','source_4007']);define(31120,['optional_7','source_4018']);
 define(31130,['design_preconstruction']);
 define(31200,['design_supervision']);for(let code=4008;code<=4011;code++)define(31200+(code-4007)/1000,['source_'+code]);
 define(31300,['design_cm','source_4012']);define(31400,['design_pm','professional_development_pm','source_4013']);
 define(31410,['design_pcs']);define(31420,['design_cost','source_4014']);
 define(31500,['design_survey','professional_survey']);for(let code=4015;code<=4017;code++)define(31500+(code-4014)/1000,['source_'+code]);
 define(31600,['permit_services','professional_permit_service','permit_response']);
 define(31610,['permit_fee']);define(31620,['permit_assessment']);define(31630,['permit_certification']);
 const permitCodes={5001:31601,5002:31602,5003:31603,5004:31604,5005:31605,5006:31606,5007:31607,5008:31608,5009:31609,5010:31610,5011:31611,5020:31800,5021:31690};
 for(let code=5012;code<=5019;code++)permitCodes[code]=31630+(code-5011)/1000;
 for(const[code,value]of Object.entries(permitCodes))define(value,['source_'+code]);
 define(31601,['optional_8']);define(31607,['optional_9']);define(31608,['optional_10']);define(31611,['optional_11']);
 define(31700,['soil_remediation']);define(31800,['artwork','optional_12']);define(31900,['utility_works']);
 define(32000,['levies','levy_development','statutory_development_levy']);
 const levySlots={6001:32000,6002:32010,6003:32020,6004:32030,6006:32040,6007:32041,6008:32050,6009:32051,6010:32060,6011:32070,6012:32080,6013:32090};
 for(const[code,value]of Object.entries(levySlots))define(value,['source_'+code]);
 // 원자료 6005는 부담금 종류/부담기간을 확정하지 않고 기존 소속에서 안정순서로 보존합니다.
 unconfirmed.add('source_6005');
 define(32010,['optional_13']);define(32020,['optional_14']);define(32030,['optional_15']);
 define(32040,['levy_water','statutory_utilities_levy']);define(32050,['levy_utility']);
 define(32055,['levy_district_heating']);define(32060,['levy_infrastructure']);
 define(32070,['optional_16']);define(32080,['optional_17']);
 define(32900,['reserve_design']);define(32990,['source_adjustment_indirect_cash']);

 define(41100,['tax_building','statutory_building_acquisition']);define(41110,['building_registration']);
 define(41200,['tax_holding_land','source_7003']);define(41210,['tax_comprehensive','source_7004']);
 define(41220,['tax_holding','statutory_holding_tax']);
 define(41300,['holding_property_insurance']);define(41400,['holding_traffic_levy']);define(41900,['source_7010']);

 define(51100,['entity_setup','business_entity_setup','sales_entity_setup']);
 define(51200,['entity_operations','business_management_fee']);define(51201,['entity_amc','corporate_amc_operating_fee']);
 define(51202,['entity_fmc','sales_fmc_fee']);define(51203,['entity_admin','sales_office_admin_fee']);
 define(51300,['entity_closing','business_accounting_tax_audit','sales_accounting']);
 define(51400,['sales_legal']);define(51410,['development_advice']);define(51420,['corporate_development_fee']);
 define(51500,['complaints']);define(51600,['marketing','commercial_marketing','sales_marketing','source_9003']);
 define(51610,['sales_lease','commercial_lease_tenant','source_9001','ct_corp_lease','O020','cost-type:ct_corp_lease','cost_type_ct_corp_lease','current-type:ct_corp_lease']);define(51620,['sales_sale','source_9002','ct_corp_sales_agency','O024','cost-type:ct_corp_sales_agency','cost_type_ct_corp_sales_agency','current-type:ct_corp_sales_agency']);
 define(51630,['disposal_fees','commercial_disposal_fee','sales_amc_disposal_fee']);
 define(51640,['sales_tenant_incentive']);define(51650,['optional_25','source_9008']);
 define(51660,['sales_interest_support','ct_corp_sales_interest','O026','cost-type:ct_corp_sales_interest','cost_type_ct_corp_sales_interest','current-type:ct_corp_sales_interest']);define(51670,['sales_guarantee_fee','ct_corp_sales_guarantee','O027','cost-type:ct_corp_sales_guarantee','cost_type_ct_corp_sales_guarantee','current-type:ct_corp_sales_guarantee']);define(51680,['optional_22','source_9004','ct_corp_showroom','O025','cost-type:ct_corp_showroom','cost_type_ct_corp_showroom','current-type:ct_corp_showroom']);
 define(51690,['optional_26']);define(51700,['optional_23','source_9005','ct_corp_preopening','O030','cost-type:ct_corp_preopening','cost_type_ct_corp_preopening','current-type:ct_corp_preopening']);define(51710,['optional_24','source_9006']);
 define(51720,['source_9007']);define(51730,['operation_property_insurance']);
 define(51900,['entity_overhead','business_general','sales_project','source_9009']);
 define(51990,['source_adjustment_entity_cash']);define(51991,['source_adjustment_entity_vat']);

 define(61100,['finance_bridge_interest','finance_bridge','source_8001']);define(61110,['finance_bridge_upfront']);define(61120,['finance_bridge_advice']);
 define(61200,['finance_pre_pf']);define(61300,['finance_pf_interest','finance_pf','source_8002']);
 define(61310,['finance_pf_upfront']);define(61320,['finance_pf_advice']);
 define(61400,['finance_fees','finance_loan_fee_advisory','source_8003','source_8004']);
 define(61410,['finance_commitment','source_8005','source_8006']);define(61420,['finance_advice','source_8007']);
 define(61500,['finance_trust','source_8008','source_8009']);
 define(61600,['finance_security','finance_collateral','finance_security_registration']);
 define(61700,['optional_20','source_8010']);define(61710,['optional_21']);define(61720,['finance_guarantee_fee']);define(61900,['source_8011']);
 define(71100,['reserve_general','reserve_other','contingency_other','source_A002']);
 define(71200,['optional_27','source_A003']);define(71300,['optional_28','source_A004']);

 const normalize=value=>String(value||'').replace(/^(?:cbs-option:|cbs:|company:)/,'');
 const parentAliases={land:'land',acquisition:'land',direct:'direct',construction:'direct',indirect:'indirect',design:'indirect',professional:'indirect',permit:'indirect',levy:'indirect',tax:'tax',corporate:'corporate',sales:'corporate',finance:'finance',contingency:'contingency'};
 function parentFor(item,context){
  if(context.parentKey)return parentAliases[context.parentKey]||context.parentKey;
  const path={'토지비':'land','공사비 / 직접공사비':'direct','공사비 / 간접공사비':'indirect','제세공과금':'tax','부대비':'corporate','금융비용':'finance','예비비':'contingency'}[item.categoryName];if(path)return path;
  const match=String(item.parentId||context.parentId||'').match(/^company:(?:root|branch):(.+)$/);if(match)return match[1];
  const project=context.project;let raw=project?.cbs?.find(row=>row.id===item.id||row.id===item.groupId),seen=new Set();
  while(raw?.parentId&&!seen.has(raw.id)){seen.add(raw.id);raw=project.cbs.find(row=>row.id===raw.parentId);}
  const rootKey=raw?.dictionaryKey||A.cbsDictionary?.find(def=>def.code===raw?.code)?.key;
  return parentAliases[rootKey]||parentAliases[item.category]||null;
 }
 function explain(item={},context={}){
  if(item.companyProfileRoot||item.companyConstructionBranch)return{rank:null,key:null,status:'stable-unmatched',reason:'상위 구분은 현행 순서 유지'};
  const taxonomyTarget=A.costTaxonomy?.target?.(item.companyTaxonomyTargetId||item.companyProfileKey||item.profileKey);if(taxonomyTarget?.role==='budget-cost'&&Number.isFinite(taxonomyTarget.order))return{rank:taxonomyTarget.order,key:taxonomyTarget.finalId,status:'ranked',reason:'승인된 회사 관리target 표시순서'};
  const parent=parentFor(item,context),project=context.project,queue=[item],seen=new Set();
  while(queue.length){
   const row=queue.shift();if(!row||seen.has(row))continue;seen.add(row);
   const detail=!!row.companyActualRow||row.sourceRecord===true,originalCode=row.sourceRecord===true&&row.code?'source_'+String(row.code):null;
   // 상세행의 companyProfileKey는 부모 표시묶음에서 상속됩니다. 원자료의 키가 아닙니다.
   const binding=project?.cbs?.some(candidate=>candidate.id===row.id)?A.costCoding?.resolve?.(project,row.id):null;
   const typeEntry=A.costTypeMaster?.entry?.(row.costTypeId||row.costTypeCode||binding?.costTypeId||binding?.costTypeCode),typeKeys=typeEntry?.newSelectable?[row.costTypeId,row.costTypeCode,binding?.costTypeId,binding?.costTypeCode,...(typeEntry.displayGroupKeys||[]),...(typeEntry.legacyKeys||[])]:[];
   const ownKeys=[row.modelCatalogKey,row.v0118CommonKey,row.templateKey,row.key],keys=(detail?[originalCode,...ownKeys]:[row.companyProfileKey,row.profileKey,...ownKeys]).map(normalize).filter(Boolean);
   for(const key of keys){
    if(unconfirmed.has(key))return{rank:null,key,status:'stable-unconfirmed',reason:'원래 목적/범위 미확정. 원명·부모·동률순서 유지'};
    const entry=table.get(key);if(entry)return{rank:entry.overrides[parent]??entry.rank,key,status:'ranked',reason:'승인된 정확 CBS 의미키/원코드의 표시순서'};
   }
   if(detail){for(const key of typeKeys.map(normalize).filter(Boolean)){if(unconfirmed.has(key))return{rank:null,key,status:'stable-unconfirmed',reason:'원래 목적/범위 미확정. 원명·부모·동률순서 유지'};const entry=table.get(key);if(entry)return{rank:entry.overrides[parent]??entry.rank,key,status:'ranked',reason:'승인된 정확 표준유형·CBS 의미키의 표시순서'};}continue}
   // 원행이 아닌 회사 표시그룹/팝업은 정확한 owner ID만 참조합니다. 이름·금액은 읽지 않습니다.
   const existingOwner=String(row.profileKey||row.companyProfileKey||'').startsWith('existing:')?String(row.profileKey||row.companyProfileKey).slice('existing:'.length):null;
   const existingGroup=String(row.groupId||'').startsWith('company:group:existing:')?String(row.groupId).slice('company:group:existing:'.length):null;
   const companyNode=row.groupId&&String(row.groupId).startsWith('company:')?A.companyCostProfile?.resolve?.(project,row.groupId):null,ids=[...(row.sourceIds||[]),...(row.managementIds||[]),...(row.groupIds||[]),...(companyNode?.sourceIds||[]),...(companyNode?.managementIds||[]),row.groupId,existingOwner,existingGroup],linked=[];for(const id of ids){const owner=project?.cbs?.find(candidate=>candidate.id===id);if(owner&&!linked.includes(owner))linked.push(owner);}if(linked.length){queue.unshift(...linked);continue}
   for(const key of typeKeys.map(normalize).filter(Boolean)){if(unconfirmed.has(key))return{rank:null,key,status:'stable-unconfirmed',reason:'원래 목적/범위 미확정. 원명·부모·동률순서 유지'};const entry=table.get(key);if(entry)return{rank:entry.overrides[parent]??entry.rank,key,status:'ranked',reason:'승인된 정확 표준유형·CBS 의미키의 표시순서'};}
  }
  return{rank:null,key:null,status:'stable-unmatched',reason:'정확 대응키 없음. 임의 의미를 만들지 않고 안정순서 유지'};
 }
 const rank=(item,context={})=>explain(item,context).rank;
 function compare(a,b,context={}){
  const fallback=()=>{const value=typeof context.fallbackCompare==='function'?Number(context.fallbackCompare(a,b)):0;return Number.isFinite(value)?value:0;};
  // 상위 구분에는 CBS rank를 적용하지 않습니다. 기존 사용자의 순서 callback은 보존합니다.
  if(a.companyProfileRoot||a.companyConstructionBranch||b.companyProfileRoot||b.companyConstructionBranch)return fallback();
  const ar=rank(a,context),br=rank(b,context);
  if(ar!==br&&(ar!==null||br!==null))return(ar??Number.POSITIVE_INFINITY)-(br??Number.POSITIVE_INFINITY);
  return fallback();
 }
 function stableSort(items,context={}){
  const result=Array.from(items||[]),buckets=new Map();
  result.forEach((item,index)=>{const parent=context.parentId??item.parentId??item.categoryName??'';if(!buckets.has(parent))buckets.set(parent,[]);buckets.get(parent).push({item,index});});
  for(const entries of buckets.values()){
   const positions=entries.map(entry=>entry.index),sorted=entries.slice().sort((a,b)=>compare(a.item,b.item,context)||a.index-b.index);
   sorted.forEach((entry,index)=>{result[positions[index]]=entry.item;});
  }
  return result;
 }
 A.costCbsOrder=Object.freeze({version,rank,compare,stableSort,explain,entries:()=>Array.from(table,([key,value])=>({key,rank:value.rank,overrides:{...value.overrides}})),unconfirmedKeys:()=>Array.from(unconfirmed)});
})(App);
