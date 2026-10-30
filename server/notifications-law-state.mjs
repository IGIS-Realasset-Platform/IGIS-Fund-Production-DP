import{createHash}from'node:crypto';
import{normalizeLawNumber}from'./law-change-identity.mjs';
const validId=value=>typeof value==='string'&&value.length>0&&value.length<=2000&&value.trim()===value&&!/[\u0000-\u001f\u007f]/.test(value);
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
export const lawNotificationId=(project,id)=>'law-review:'+createHash('sha256').update(JSON.stringify([project,id])).digest('hex').slice(0,40);
function eventKey(row){
 const number=normalizeLawNumber(row?.lawNumber);if(!validId(row?.id)||!validId(row?.lawId)||!['law','admrul','ordin'].includes(row?.target)||!/^\d{1,30}$/.test(row?.sequence||'')||number===null||!validDate(row?.announcedAt)||!validDate(row?.effectiveAt)||typeof row.sample!=='boolean')return null;
 const dates=[row.effectiveAt];if(row.effectiveDates!==undefined){if(!Array.isArray(row.effectiveDates))return null;dates.push(...row.effectiveDates);}if(row.versions!==undefined){if(!Array.isArray(row.versions)||row.versions.some(v=>!v||v.sequence!==row.sequence))return null;dates.push(...row.versions.map(v=>v.effectiveAt));}if(!dates.every(validDate))return null;
 let body='publication';if(row.bodyChanged===true){if(!/^[a-f0-9]{64}$/.test(row.beforeBodyHash||'')||!/^[a-f0-9]{64}$/.test(row.afterBodyHash||''))return null;body=row.beforeBodyHash+'>'+row.afterBodyHash;}else if(row.bodyChanged!==undefined&&row.bodyChanged!==false)return null;
 return JSON.stringify([row.lawId,row.target,row.sequence,number,row.announcedAt,row.effectiveAt,[...new Set(dates)].sort(),row.sample,body]);
}
// This index never consumes a supplied aliasIds claim. Ambiguous duplicate raw
// IDs cannot prove membership, even when one of them is chosen for display.
export function lawNotificationMemberIndex(changes){
 const byId=new Map(),byKey=new Map();for(const row of Array.isArray(changes)?changes:[]){if(!validId(row?.id))continue;if(byId.has(row.id)){byId.set(row.id,null);continue;}byId.set(row.id,row);}for(const row of byId.values()){const key=row&&eventKey(row);if(!key)continue;const members=byKey.get(key)||[];members.push(row);byKey.set(key,members);}return{byId,byKey};
}
export function lawNotificationMembers(change,index){const original=index.byId.get(change?.id),key=original&&eventKey(original);return key?index.byKey.get(key)||[]:[];}
function firstStamp(rows,key){let value=null;for(const row of rows){const next=row[key];if(next!=null&&(value===null||Date.parse(next)<Date.parse(value)))value=next;}return value;}
export function lawNotificationState(id,rows){return{notificationId:id,readAt:firstStamp(rows,'read_at'),deletedAt:firstStamp(rows,'deleted_at')};}
export function projectLawNotificationStates(rows,groups){
 const aliases=new Set([...groups.values()].flat()),byId=new Map(rows.map(row=>[row.notification_id,row])),result=rows.filter(row=>!aliases.has(row.notification_id)).map(row=>lawNotificationState(row.notification_id,[row]));
 for(const[id,members]of groups){const matching=members.map(member=>byId.get(member)).filter(Boolean);if(matching.length)result.push(lawNotificationState(id,matching));}return result;
}
