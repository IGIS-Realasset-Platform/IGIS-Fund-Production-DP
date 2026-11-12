// Read projections only: commitments are not balances, and future facilities
// are not inferred to replace bridge facilities. Snapshot callers own copying.
const text=value=>typeof value==='string'?value.trim():'';
const validAmount=value=>Number.isSafeInteger(value)&&value>=0;
function ledgerAmount(value){
 if(typeof value!=='number'&&(typeof value!=='string'||!value.trim()))return null;
 const amount=Number(value);
 return validAmount(amount)?amount:null;
}
const sourceId=(kind,id)=>typeof id==='string'&&id.trim()?kind+':'+id:'';

export function currentCapitalSources(project){
 const sources=[];
 for(const equity of project.equities||[]){
  if(!equity||equity.deletedAt)continue;
  sources.push({id:sourceId('equity',equity.id),kind:'equity',tranche:'자기자본',
   party:text(equity.company),amount:ledgerAmount(equity.amount),role:text(equity.purpose)});
 }
 for(const loan of project.loans||[]){
  if(!loan||loan.deletedAt)continue;
  sources.push({id:sourceId('loan',loan.id),kind:'debt',
   tranche:text(loan.trancheName)||text(loan.tranche)||[text(loan.type),text(loan.rank)].filter(Boolean).join(' · '),
   party:text(loan.institution),amount:ledgerAmount(loan.commitment),role:text(loan.rank)});
 }
 return sources;
}

export function capitalSourceTotal(sources){
 if(!Array.isArray(sources)||!sources.length)return null;
 let total=0;
 for(const source of sources){
  if(!validAmount(source?.amount))return null;
  total+=source.amount;
  if(!Number.isSafeInteger(total))return null;
 }
 return total;
}

export function capitalSourceGroups(sources){
 const groups=new Map();
 for(const source of sources){
  const key=JSON.stringify([source.kind,source.tranche]);
  if(!groups.has(key))groups.set(key,{name:source.tranche,people:[]});
  groups.get(key).people.push({name:source.party,amount:validAmount(source.amount)?source.amount:null,role:source.role||''});
 }
 return [...groups.values()].map(group=>({...group,total:capitalSourceTotal(group.people)}));
}

// Return a fresh canonical value for storage; invalid input never partially
// mutates the caller. Duplicate names are valid; duplicate record IDs are not.
export function validateCapitalSources(sources){
 if(!Array.isArray(sources)||sources.length>100)throw Error('조달 구성은 100개 이하의 내역으로 입력해 주세요.');
 const ids=new Set();
 const result=sources.map(source=>{
  if(!source||typeof source!=='object'||Array.isArray(source))throw Error('조달 내역을 확인해 주세요.');
  const id=text(source.id),party=text(source.party),tranche=text(source.tranche);
  if(!id||id!==source.id||ids.has(id))throw Error('조달 내역의 식별값이 없거나 중복되었습니다.');
  ids.add(id);
  if(!['equity','debt'].includes(source.kind))throw Error('출자 또는 차입 구분을 확인해 주세요.');
  if(!party||party.length>100)throw Error('투자자·대주명을 100자 이내로 입력해 주세요.');
  if(!tranche||tranche.length>80)throw Error('트랜치명을 80자 이내로 입력해 주세요.');
  if(!validAmount(source.amount))throw Error('조달금액은 0 이상의 원 단위 정수로 입력해 주세요.');
  if(source.role!=null&&typeof source.role!=='string')throw Error('조달 역할을 확인해 주세요.');
  return {id,kind:source.kind,tranche,party,amount:source.amount,role:text(source.role)};
 });
 if(result.length&&capitalSourceTotal(result)===null)throw Error('조달 합계가 정확하게 저장할 수 있는 금액 범위를 초과했습니다.');
 return result;
}
