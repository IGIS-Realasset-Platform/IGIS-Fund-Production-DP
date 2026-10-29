// Pure application rule shared by browser forms, report reverse writes and server CAS.
export const permitDomainVersion='2026-10-20.2';
const text=v=>String(v??'').trim();
const live=xs=>(Array.isArray(xs)?xs:[]).filter(x=>!x.deletedAt);
// Recommendation inputs are project facts, not an automatic legal decision.
// Explicit unknown/empty/zero values remain authoritative once saved.
export const permitRecommendationAssets=Object.freeze(['','오피스·복합','주거·공동주택','물류','데이터센터','호텔·숙박','리테일','시니어리빙']);
export const permitRecommendationMethods=Object.freeze(['','일반 건축','정비사업','도시개발','주택사업']);
export const permitRecommendationNumericFields=Object.freeze(['siteArea','singleBuildingArea','height','floors','excavationDepth','powerMw']);
export const permitRecommendationFlagLabels=Object.freeze({landformChange:'토지 형질변경',existingBuilding:'기존 건물 해체',farmland:'농지 전용',forest:'산지 전용',heritage:'국가유산 관련 지역·발굴',soilPollution:'토양오염 확인',militaryArea:'군사기지·군사시설 보호구역 해당',trafficZone:'도시교통정비지역 또는 교통권역 해당',trafficScope:'교통영향평가 대상사업·용도·규모 해당',specialStructure:'특수구조 건축물 해당',airDefenseArea:'대공방어협조구역 해당',airDefenseHeight:'대공방어 협의대상 높이 해당'});
export const permitRecommendationFlagFields=Object.freeze(Object.keys(permitRecommendationFlagLabels));
export const permitRecommendationTypeOverrides=Object.freeze({
 'company-permit:permit-catalog-3-2':{verifiedAt:'2026-10-29',name:'교통영향평가',law:'도시교통정비 촉진법 / 도시교통정비 촉진법 시행령',article:'법 제15조 / 시행령 제13조의2·별표1',condition:'도시교통정비지역 또는 교통권역 해당 여부와 대상사업·용도·규모를 함께 확인합니다. 지역 조례의 범위와 법정 예외를 별도로 검토합니다.',url:'https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1011819121'},
 'structural-review':{verifiedAt:'2026-10-29',name:'구조 안전에 관한 지방건축위원회 심의',legacyNames:['구조안전 심의'],searchAliases:['구조안전 심의','특수구조 심의'],law:'건축법 / 건축법 시행령',article:'시행령 제5조의5제1항제4호·제6항제2호나목 / 제6조의3',condition:'다중이용·특수구조 건축물의 구조안전 심의입니다. 일반 구조안전 확인과 구별하며, 공동심의·안전영향평가 결과 확정 및 구조확인 특례에 따른 예외를 확인합니다.',timing:'착공신고 전. 법정 예외·대체절차 확인',url:'https://law.go.kr/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000777791'},
 'military-consultation':{verifiedAt:'2026-10-29',name:'행정기관의 처분에 관한 협의(군사기지 및 군사시설 보호법)',legacyNames:['군사기지·군사시설 보호구역 협의'],searchAliases:['군사기지·군사시설 보호구역 협의','군보심의','군 협의','대공방어 협의'],law:'군사기지 및 군사시설 보호법 / 군사기지 및 군사시설 보호법 시행령',article:'법 제13조제1항·제2항 / 시행령 제13조',condition:'보호구역의 법정 행위, 비행안전구역 저촉 우려, 대공방어협조구역의 법정 높이 해당 여부는 별도 경로입니다. 대공방어는 구역과 해당 높이를 함께 확인하며 부대별 기준·예외·협의업무 위탁을 검토합니다.',timing:'관계 행정기관의 허가등 처분 전 협의',url:'https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1029623069'}
});
export function permitCriteriaDefaults(project={}){
 const type=text(project.type),method=text(project.basic?.method),building=project.building||{};let asset='',route='';
 if(/주거|공동주택|주택/.test(type))asset='주거·공동주택';else if(/물류/.test(type))asset='물류';else if(/데이터/.test(type))asset='데이터센터';else if(/호텔|숙박/.test(type))asset='호텔·숙박';else if(/오피스|업무|복합/.test(type))asset='오피스·복합';else if(/리테일|상가/.test(type))asset='리테일';else if(/시니어/.test(type))asset='시니어리빙';
 if(/정비/.test(method))route='정비사업';else if(/도시개발/.test(method))route='도시개발';else if(/민간개발|일반 건축|일반건축/.test(method))route='일반 건축';else if(/주택/.test(method))route='주택사업';
 return {asset,method:route,region:project.location||'',zoning:building.zone||'',siteArea:building.siteArea??null,height:building.height??null,floors:building.floorsAbove??null};
}
export function effectivePermitCriteria(project={},override={}){
 const saved=project.permitConditions&&typeof project.permitConditions==='object'&&!Array.isArray(project.permitConditions)?project.permitConditions:{};
 return {...permitCriteriaDefaults(project),...saved,...override};
}
export function normalizePermitCriteria(input={}){
 const criteria={...input},errors={};for(const key of permitRecommendationNumericFields){if(!Object.hasOwn(input,key))continue;const value=input[key];if(value===null||value===undefined||typeof value==='string'&&!value.trim()){criteria[key]=null;continue;}const number=(typeof value==='number'||typeof value==='string')?Number(value):NaN;criteria[key]=number;if(!Number.isFinite(number)||number<0)errors[key]='0 이상의 숫자를 입력해 주세요.';}
 if(criteria.floors!==null&&criteria.floors!==undefined&&Number.isFinite(criteria.floors)&&!Number.isInteger(criteria.floors))errors.floors='층수는 0 이상의 정수로 입력해 주세요.';
 for(const [key,values]of [['asset',permitRecommendationAssets],['method',permitRecommendationMethods],['buildingRoute',['','미확인','허가','신고','사업승인·의제']]])if(Object.hasOwn(input,key)&&!values.includes(input[key]??''))errors[key]='목록에서 선택해 주세요.';
 for(const key of permitRecommendationFlagFields)if(Object.hasOwn(input,key)&&!['','미확인','예','아니오',null,undefined].includes(input[key]))errors[key]='목록에서 선택해 주세요.';
 return {valid:!Object.keys(errors).length,criteria,errors};
}
const recommendationNumber=value=>value===null||value===undefined||typeof value==='string'&&!value.trim()?null:(typeof value==='number'||typeof value==='string')&&Number.isFinite(Number(value))?Number(value):null;
const pairedRecommendation=(a,b)=>a==='예'&&b==='예'?'matched':a==='아니오'||b==='아니오'?'not-matched':'incomplete';
function militaryRecommendation(f){const air=pairedRecommendation(f.airDefenseArea,f.airDefenseHeight);return f.militaryArea==='예'||air==='matched'?'matched':f.militaryArea==='아니오'&&air==='not-matched'?'not-matched':'incomplete';}
export function permitRecommendationState(row,f={}){
 const name=row?.name||'';
 // Traffic Act15 combines designated geography and the statutory/project
 // scope (including local ordinance). Neither fact alone is a final decision.
 if(row?.typeId==='company-permit:permit-catalog-3-2'||row?.id==='permit-catalog-3-2')return pairedRecommendation(f.trafficZone,f.trafficScope)==='matched'?'candidate':'review';
 if(row?.typeId==='military-consultation')return militaryRecommendation(f)==='matched'?'candidate':'review';
 // Building Decree5-5(1)4 and6-3: reuse the existing structural-review type.
 // Ordinary structural confirmation and excavation review remain separate.
 if(row?.typeId==='structural-review'&&f.specialStructure==='예')return 'candidate';
 if(name==='건축신고')return f.buildingRoute==='신고'?'basic':'review';
 if(name==='건축허가')return f.buildingRoute==='신고'||f.buildingRoute==='사업승인·의제'?'review':'basic';
 if(row?.core)return 'basic';
 if(/정비계획|사업시행계획 인가|관리처분|통합심의/.test(name)&&f.method==='정비사업')return 'candidate';
 if(/도시개발/.test(name)&&f.method==='도시개발')return 'candidate';
 if(/주택사업계획|입주자모집/.test(name)&&f.method==='주택사업')return 'candidate';
 if(/관광숙박/.test(name)&&/호텔|숙박/.test(f.asset||''))return 'candidate';
 if(/물류/.test(name)&&f.asset==='물류')return 'candidate';
 if(f.asset==='데이터센터'&&['전력·가스 인입 협의','기계설비 사용 전 검사'].includes(name))return 'candidate';
 if(f.asset==='주거·공동주택'&&['교육환경평가','주택사업계획 승인','입주자모집 승인'].includes(name))return 'candidate';
 if(f.method==='일반 건축'&&name==='건축심의')return 'candidate';
 if(f.method==='도시개발'&&name==='환경영향평가')return 'candidate';
 if(/해체|석면/.test(name)&&f.existingBuilding==='예')return 'candidate';
 if(name==='개발행위허가'&&f.landformChange==='예')return 'candidate';
 if(/농지전용/.test(name)&&f.farmland==='예'||/산지전용/.test(name)&&f.forest==='예'||/국가유산|문화유산|매장유산/.test(name)&&f.heritage==='예'||/오염토/.test(name)&&f.soilPollution==='예'||/군사/.test(name)&&f.militaryArea==='예')return 'candidate';
 const depth=recommendationNumber(f.excavationDepth),height=recommendationNumber(f.height),floors=recommendationNumber(f.floors),area=recommendationNumber(f.singleBuildingArea),power=recommendationNumber(f.powerMw);
 if(row?.typeId==='small-underground'&&depth>=10&&depth<20)return 'candidate';
 if(name==='지하안전평가'&&depth>=20)return 'candidate';
 if(row?.typeId==='building-safety-impact'&&(height>=200||floors>=50||area>=100000&&floors>=16))return 'candidate';
 if(row?.typeId==='seoul-lid'&&/^서울/.test(f.region||''))return 'candidate';
 if(row?.typeId==='power-grid-impact'&&power>=10)return 'candidate';
 return 'review';
}
export function permitRecommendationDecision(row,f={}){
 const state=permitRecommendationState(row,f);let conditionStatus=state==='review'?'manual':'matched',fields=[];
 if(row?.typeId==='company-permit:permit-catalog-3-2'||row?.id==='permit-catalog-3-2'){fields=['trafficZone','trafficScope'];conditionStatus=pairedRecommendation(f.trafficZone,f.trafficScope);}
 if(row?.typeId==='structural-review'){fields=['specialStructure'];conditionStatus=f.specialStructure==='예'?'matched':f.specialStructure==='아니오'?'not-matched':'incomplete';}
 if(row?.typeId==='military-consultation'){fields=['militaryArea','airDefenseArea','airDefenseHeight'];conditionStatus=militaryRecommendation(f);}
 return {state,conditionStatus,matchedFields:fields.filter(key=>f[key]==='예'),unconfirmedFields:fields.filter(key=>!['예','아니오'].includes(f[key]))};
}
export function isPermitDate(v){return /^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;}
export function requiredPermitDates(row){
 const excluded=row.stage==='해당 없음'||row.handling==='해당 없음';
 const required=excluded?[]:['plannedApplication','expected'];
 if(!excluded&&['신청','심의 중','보완 중','조건부 승인','완료'].includes(row.stage))required.push('application');
 if(!excluded&&row.stage==='보완 중')required.push('supplement');
 if(!excluded&&['조건부 승인','완료'].includes(row.stage))required.push('approval');
 return required;
}
export function permitPredecessors(row){return [...new Set([row.predecessorId,...(Array.isArray(row.predecessorIds)?row.predecessorIds:[])].filter(x=>typeof x==='string'&&x))];}
export function validatePermitRecord(row,rows=[],options={}){
 const errors={},partial=!!options.partial,labels={plannedApplication:'계획 신청일',expected:'목표 완료일',application:'실제 신청일',supplement:'보완 요청일',approval:'승인일'};
 const required=[['name','인허가명'],['group','관리 분야'],['reportCategory','국토부 보고 분류'],['agency','담당기관'],['stage','상태'],['reportTrigger','국토부 보고 기한 기준'],['handling','처리 방식'],['requestType','최초 / 변경'],['sourcePath','인허가 신청·진행자료 경로']];
 if(!partial)for(const[key,label]of required)if(!text(key==='name'?row.name||row.detail:row[key]))errors[key]=label+'을 입력해 주세요.';
 if(!partial)for(const key of requiredPermitDates(row))if(!text(row[key]))errors[key]=labels[key]+'을 입력해 주세요.';
 if(!partial)for(const[key,label]of Object.entries(labels))if(text(row[key])&&!isPermitDate(row[key]))errors[key]=label+'을 올바른 날짜로 입력해 주세요.';
 if(!partial&&row.approval&&row.application&&row.approval<row.application)errors.approval='승인일은 신청일보다 빠를 수 없습니다.';
 if(!partial&&row.supplement&&row.application&&row.supplement<row.application&&!live(row.rounds).length)errors.supplement='보완 요청일은 신청일보다 빠를 수 없습니다.';
 if(!partial&&row.expected&&row.plannedApplication&&row.expected<row.plannedApplication)errors.expected='목표 완료일은 계획 신청일보다 빠를 수 없습니다.';
 const enums={stage:['미신청','신청','심의 중','보완 중','조건부 승인','완료','해당 없음'],handling:['별도 진행','의제 포함','해당 없음'],requestType:['최초','변경허가'],reportTrigger:['아님','인가·허가','시행자 지정'],reportCategory:['구역(지구) 지정','사업시행자 결정','사업시행계획','공사시행','준공 및 사용승인']};
 if(!partial)for(const[key,values]of Object.entries(enums))if(text(row[key])&&!values.includes(row[key]))errors[key]='목록에서 선택해 주세요.';
 const targets=new Map(live(rows).map(x=>[x.id,x]));if(row.id)targets.set(row.id,row);
 const relationships=[...permitPredecessors(row).map(id=>({key:'predecessorIds',id})),...['deemedBy','amendsId'].filter(key=>row[key]).map(key=>({key,id:row[key]})),...live(row.integratedWith).map(id=>({key:'integratedWith',id}))];
 for(const {key,id}of relationships){if(id===row.id)errors[key]='자기 자신을 연결할 수 없습니다.';else if(!targets.has(id))errors[key]='같은 프로젝트의 연결 대상을 다시 선택해 주세요.';}
 if(row.deemedBy&&row.handling!=='의제 포함')errors.deemedBy='함께 처리하는 상위 인허가를 연결하려면 의제 포함을 선택해 주세요.';
 if(row.amendsId&&row.requestType!=='변경허가')errors.amendsId='변경 전 인허가를 연결하려면 변경허가를 선택해 주세요.';
 const visiting=new Set(),visited=new Set();function cyclic(id){if(visiting.has(id))return true;if(visited.has(id))return false;visiting.add(id);for(const parent of permitPredecessors(targets.get(id)||{}))if(cyclic(parent))return true;visiting.delete(id);visited.add(id);return false;}
 if(row.id&&cyclic(row.id))errors.predecessorIds='선행 인허가가 순환합니다. 연결 방향을 확인해 주세요.';
 // Deemed, integrated and amendment links are not chronological prerequisites.
 const roundIds=new Set();let last='';for(const round of partial||options.skipRounds?[]:live(row.rounds)){
  if(!text(round.id)||roundIds.has(round.id)){errors.rounds='진행 기록의 식별값이 중복되거나 없습니다.';break;}roundIds.add(round.id);
  if(!['application','resubmission','supplement','review','approval','withdrawal'].includes(round.kind)||!isPermitDate(round.date)||!text(round.sourcePath)){errors.rounds='진행 종류·발생일·근거자료 경로를 입력해 주세요.';break;}
  if(last&&round.date<last){errors.rounds='진행 기록은 발생일 순서로 추가해 주세요.';break;}last=round.date;
 }
 for(const item of partial?[]:live(row.actionItems))if('resultCategory'in item||item.plansVersion===1){
  if(!text(item.title)||!isPermitDate(item.date)||!text(item.sourcePath)){errors.actionItems='검토의견 내용·통보일·문서 경로를 입력해 주세요.';break;}
  const plans=live(item.plans);if(!plans.length){errors.actionItems='검토의견별 조치계획을 추가해 주세요.';break;}
  if(plans.some(plan=>!text(plan.actionPlan)||!isPermitDate(plan.deadline)||!text(plan.backDataPath)||!['초안','진행 중','확정','완료'].includes(plan.status))){errors.actionItems='조치계획 내용·기한·진행상태·자료 경로를 입력해 주세요.';break;}
 }
 return {valid:!Object.keys(errors).length,errors};
}
const actualSummaryKeys=['stage','application','supplement','approval'];
const roundChangeKeys=new Set(['rounds',...actualSummaryKeys]);
function sameValue(a,b){if(a===b)return true;if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>sameValue(v,b[i]));if(a&&b&&typeof a==='object'&&typeof b==='object'){const keys=Object.keys(a),other=Object.keys(b);return keys.length===other.length&&keys.every(k=>Object.hasOwn(b,k)&&sameValue(a[k],b[k]));}return false;}
function legacyBaseline(previous){return [['application',previous.application],['supplement',previous.supplement],['approval',previous.approval]].filter(([,date])=>isPermitDate(date)).sort((a,b)=>a[1].localeCompare(b[1])).map(([kind,date])=>({id:'legacy-round:'+previous.id+':'+kind,kind,date,sourcePath:previous.sourcePath||'',legacy:true}));}
export function validatePermitRoundChange(previous,row,rows=[]){
 const errors={},hasPrevious=previous&&previous.id===row.id,oldRounds=Array.isArray(previous?.rounds)?previous.rounds:[],nextRounds=Array.isArray(row.rounds)?row.rounds:[],roundsChanged=!sameValue(oldRounds,nextRounds),metadataUnchanged=hasPrevious&&[...new Set([...Object.keys(previous),...Object.keys(row)])].filter(k=>!roundChangeKeys.has(k)).every(k=>sameValue(previous[k],row[k])),roundOnly=roundsChanged&&metadataUnchanged;
 Object.assign(errors,validatePermitRecord(row,rows,{partial:!!roundOnly,skipRounds:true}).errors);
 if(row.rounds!==undefined&&!Array.isArray(row.rounds))errors.rounds='진행 기록의 형식을 확인해 주세요.';
 if(oldRounds.length>nextRounds.length||oldRounds.some((round,i)=>!sameValue(round,nextRounds[i])))errors.rounds='이전 진행 기록은 유지하고 새 회차를 추가해 주세요.';
 const ids=new Set();for(const round of nextRounds){if(!round||typeof round.id!=='string'||!text(round.id)||round.id.trim()!==round.id||/[\u0000-\u001f\u007f]/.test(round.id)||ids.has(round.id)){errors.rounds='진행 기록의 식별값이 중복되거나 없습니다.';break;}ids.add(round.id);}
 const added=nextRounds.slice(oldRounds.length),baseline=hasPrevious&&!oldRounds.length?legacyBaseline(previous):[],baselineRows=added.filter(r=>r?.legacy===true);
 if(baselineRows.length&&(!hasPrevious||oldRounds.length||baselineRows.length!==baseline.length||baselineRows.some((r,i)=>!sameValue(r,baseline[i]))))errors.rounds='기존 신청·보완·승인일과 동일한 과거 기록만 옮길 수 있습니다.';
 if(hasPrevious&&roundsChanged&&!oldRounds.length&&baseline.length&&(baselineRows.length!==baseline.length||baselineRows.some((r,i)=>!sameValue(nextRounds[i],baseline[i]))))errors.rounds='기존 신청·보완·승인일을 과거 기록으로 함께 보존해 주세요.';
 let last=oldRounds.map(r=>r?.date).filter(isPermitDate).sort().at(-1)||'';
 for(const round of added){
  if(round?.legacy===true){if(isPermitDate(round.date)&&round.date>last)last=round.date;continue;}
  if(!round||round.deletedAt){errors.rounds='새 진행 기록을 삭제 상태로 저장할 수 없습니다.';continue;}
  if(!['application','resubmission','supplement','review','approval','withdrawal'].includes(round.kind))errors.kind='진행 종류를 선택해 주세요.';
  if(!isPermitDate(round.date))errors.date='발생일을 올바른 날짜로 입력해 주세요.';
  if(!text(round.sourcePath))errors.sourcePath='새 진행 기록의 근거자료 경로를 입력해 주세요.';
  if(isPermitDate(round.date)){if(last&&round.date<last)errors.date='진행 기록은 발생일 순서로 추가해 주세요.';last=round.date;}
 }
 if(roundOnly){
  const expected={};for(const key of actualSummaryKeys)expected[key]=previous[key];
  for(const round of added.filter(r=>!r?.legacy)){
   if(round.kind==='application'||round.kind==='resubmission'){expected.application=round.date;expected.stage='신청';if(round.kind==='resubmission'){expected.approval='';expected.supplement='';}}
   if(round.kind==='supplement'){expected.supplement=round.date;expected.stage='보완 중';}
   if(round.kind==='approval'){expected.approval=round.date;expected.stage='완료';}
   if(round.kind==='review')expected.stage='심의 중';
  }
  // 회차만 추가하는 기존 경로도 허용합니다. 요약값을 바꾸는 경우에만 해당 회차와 대조합니다.
  for(const key of actualSummaryKeys)if(!sameValue(previous[key],row[key])&&!sameValue(expected[key],row[key]))errors[key]='추가한 진행 기록과 현재 상태·실제 날짜가 일치하지 않습니다.';
  const labels={application:'실제 신청일',supplement:'보완 요청일',approval:'승인일'};for(const key of requiredPermitDates(row).filter(k=>k in labels))if(!isPermitDate(row[key]))errors[key]=labels[key]+'을 올바른 날짜로 입력해 주세요.';
  if(['조건부 승인','완료'].includes(row.stage)&&row.approval&&row.application&&row.approval<row.application)errors.approval='승인일은 신청일보다 빠를 수 없습니다.';
 }
 return {valid:!Object.keys(errors).length,errors};
}
export function validatePermitChanges(previous,next){
 const errors=[],oldProjects=new Map((previous?.projects||[]).map(p=>[p.id,p]));
 // Soft deletion is not permission to erase historical rounds or their evidence.
 const nextProjects=new Map((next?.projects||[]).map(p=>[p.id,p]));for(const prior of previous?.projects||[]){const project=nextProjects.get(prior.id),afterRows=new Map((project?.permits||[]).map(r=>[r.id,r]));for(const old of prior.permits||[]){if(!old.rounds?.length)continue;const after=afterRows.get(old.id)?.rounds||[];if(old.rounds.length>after.length||old.rounds.some((round,i)=>!sameValue(after[i],round)))errors.push({projectId:prior.id,permitId:old.id,field:'rounds',message:'이전 진행 기록은 유지하고 새 회차를 추가해 주세요.'});}}
 for(const project of next?.projects||[]){if(project.deletedAt)continue;const prior=oldProjects.get(project.id),oldRows=new Map((prior?.permits||[]).map(row=>[row.id,row])),rows=live(project.permits),changed=new Set(rows.filter(row=>JSON.stringify(oldRows.get(row.id))!==JSON.stringify(row)).map(row=>row.id)),gone=new Set(live(prior?.permits).filter(row=>!rows.some(x=>x.id===row.id)).map(row=>row.id));
  if(!sameValue(prior?.permitConditions,project.permitConditions)&&project.permitConditions!==undefined){
   const facts=project.permitConditions;if(facts===null||typeof facts!=='object'||Array.isArray(facts))errors.push({projectId:project.id,field:'permitConditions',message:'인허가 추천 조건의 형식을 확인해 주세요.'});
   else{const old=prior?.permitConditions||{},known=['asset','method','buildingRoute',...permitRecommendationNumericFields,...permitRecommendationFlagFields],updated=Object.fromEntries(known.filter(key=>Object.hasOwn(facts,key)&&!sameValue(old[key],facts[key])).map(key=>[key,facts[key]]));for(const[field,message]of Object.entries(normalizePermitCriteria(updated).errors))errors.push({projectId:project.id,field:'permitConditions.'+field,message});}
  }
  for(const row of rows){const links=[...permitPredecessors(row),row.deemedBy,row.amendsId,...(row.integratedWith||[])].filter(Boolean),affected=changed.has(row.id)||links.some(id=>gone.has(id)||changed.has(id));if(!affected)continue;
   const result=changed.has(row.id)?validatePermitRoundChange(oldRows.get(row.id),row,rows):validatePermitRecord(row,rows,{partial:true});for(const[field,message]of Object.entries(result.errors))errors.push({projectId:project.id,permitId:row.id,field,message});
  }
 }
 return {valid:!errors.length,errors};
}
