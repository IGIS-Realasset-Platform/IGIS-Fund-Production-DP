// Read-only event projection. Original records, IDs and review state are never rewritten.
const validId=value=>typeof value==='string'&&value.trim()===value&&value.length>0&&value.length<=2000&&!/[\u0000-\u001f\u007f]/.test(value);
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export function normalizeLawNumber(value){
 if(typeof value!=='string'&&typeof value!=='number')return null;
 const text=String(value).replace(/\s/g,''),match=text.match(/^(?:(?:[가-힣·ㆍ]*(?:법률|령|고시|훈령|예규|규칙|조례|공고))?제)?(\d+(?:-\d+)*)(?:호)?$/);
 return match?match[1].split('-').map(part=>part.replace(/^0+(?=\d)/,'')).join('-'):null;
}
function identity(row){
 const number=normalizeLawNumber(row?.lawNumber);if(!validId(row?.id)||!validId(row?.lawId)||number===null||!validDate(row?.announcedAt)||!validDate(row?.effectiveAt))return null;
 const dates=row.bodyChanged?[row.effectiveAt]:[row.effectiveAt,...(row.effectiveDates||[]),...(row.versions||[]).map(v=>v.effectiveAt)];
 if(!dates.every(validDate))return null;
 let body='publication';if(row.bodyChanged){if(!/^[a-f0-9]{64}$/.test(row.beforeBodyHash||'')||!/^[a-f0-9]{64}$/.test(row.afterBodyHash||''))return null;body=row.beforeBodyHash+'>'+row.afterBodyHash;}
 return {key:JSON.stringify([row.lawId,number,row.announcedAt,row.sample===true,body]),dates:[...new Set(dates)].sort()};
}
const discovery=row=>{const value=row.discoveredAtTime||row.discoveredAt;return typeof value==='string'&&Number.isFinite(Date.parse(value))?Date.parse(value):Infinity;};
export function canonicalLawChanges(changes){
 if(!Array.isArray(changes))return [];
 const indexed=changes.map((row,index)=>({row,index,identity:identity(row)})),groups=[];
 const processing=[...indexed].sort((a,b)=>(b.identity?.dates.length||0)-(a.identity?.dates.length||0)||Number(!!b.row?.amendmentText)-Number(!!a.row?.amendmentText)||a.index-b.index);
 for(const item of processing){const match=item.identity&&groups.find(group=>group.identity?.key===item.identity.key&&item.identity.dates.every(date=>group.identity.dates.includes(date)));if(match)match.items.push(item);else groups.push({identity:item.identity,items:[item]});}
 return groups.sort((a,b)=>Math.min(...a.items.map(i=>i.index))-Math.min(...b.items.map(i=>i.index))).map(group=>{
  const members=[...group.items].sort((a,b)=>Number(!!b.row?.amendmentText)-Number(!!a.row?.amendmentText)||Number(String(a.row?.id||'').startsWith('law-api-'))-Number(String(b.row?.id||'').startsWith('law-api-'))||a.index-b.index),primary=members[0].row,out={...primary};
  out.aliasIds=[...new Set(members.flatMap(({row})=>[row.id,...(row.aliasIds||[])]).filter(validId))];
  if(group.identity&&!primary.bodyChanged)out.effectiveDates=[...group.identity.dates];
  const earliest=[...members].sort((a,b)=>discovery(a.row)-discovery(b.row)||a.index-b.index)[0]?.row;
  if(earliest&&discovery(earliest)!==Infinity){out.discoveredAt=earliest.discoveredAt;if(earliest.discoveredAtTime)out.discoveredAtTime=earliest.discoveredAtTime;else delete out.discoveredAtTime;}
  const versions=[],seen=new Set();for(const {row}of members)for(const version of row.versions||[]){const key=version.sequence&&version.effectiveAt?version.sequence+'|'+version.effectiveAt:null;if(key&&seen.has(key))continue;if(key)seen.add(key);versions.push({...version});}if(versions.length)out.versions=versions;
  return out;
 });
}
