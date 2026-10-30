export const DEVELOPMENT_OVERVIEW_PROFILE='development-overview-v2';
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const text=(value,max)=>typeof value==='string'&&value.trim().length>0&&value.trim()===value&&value.length<=max&&value.isWellFormed()&&!/[\u0000-\u001f\u007f]/.test(value);
const area=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;

// Explicit new-form contract only. Historical projects/imports remain historical.
export function projectRegistrationProfileErrors(current,next){
 const previous=new Map((current.projects||[]).map(p=>[p.id,p])),errors=[];
 for(const project of next.projects||[]){
  const old=previous.get(project.id),wasV2=old?.registrationInput?.profile===DEVELOPMENT_OVERVIEW_PROFILE,isV2=project.registrationInput?.profile===DEVELOPMENT_OVERVIEW_PROFILE;
  if(wasV2&&!isV2){errors.push({projectId:project.id,field:'registrationInput.profile',message:'등록 양식의 기본정보 계약을 제거할 수 없습니다.'});continue;}
  if(!isV2)continue;
  for(const[path,label,max]of [['name','사업명',300],['type','사업유형',200],['location','소재지',2000],['basic.operator','사업시행 법인',500],['basic.manager','담당자',300],['basic.fundName','펀드 정식명',500],['basic.financeStructure','파이낸스 구조',10000]]){const value=path.split('.').reduce((v,key)=>v?.[key],project);if(!text(value,max))errors.push({projectId:project.id,field:path,message:label+' 항목을 확인해 주세요.'});}
  for(const[field,label]of [['gfaTotal','연면적'],['siteArea','대지면적'],['acquisitionLandArea','취득대상 토지면적']])if(!area(project.building?.[field]))errors.push({projectId:project.id,field:'building.'+field,message:label+'은 0 이상의 숫자로 입력해 주세요.'});
  if(!object(project.basic?.managerRef)||project.basic.managerRef.name!==project.basic.manager)errors.push({projectId:project.id,field:'basic.managerRef',message:'담당자 목록에서 이름과 이메일을 다시 확인해 선택해 주세요.'});
 }
 return errors;
}
