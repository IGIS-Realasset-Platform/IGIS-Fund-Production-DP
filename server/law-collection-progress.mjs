import {createHash} from 'node:crypto';
import {koreaDate} from './date-time.mjs';
export const LAW_WATCH_SCOPE_LOCK='development-project-platform:law-watch-scope';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),key=v=>typeof v==='string'&&v.trim()===v&&v.length>0&&v.length<=500&&!/[\u0000-\u001f\u007f]/.test(v),digest=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const stable=v=>Array.isArray(v)?v.map(stable):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
export const lawProgressHash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const officialId=v=>typeof v==='string'&&/^\d{1,30}$/.test(v)?v.replace(/^0+(?=\d)/,''):null;
const exactKeys=(v,keys)=>object(v)&&Object.keys(v).length===keys.length&&Object.keys(v).every(k=>keys.includes(k));
const failure=code=>{throw Object.assign(Error(code),{code});};
export const lawVersionObservationKey=v=>[String(v.lawNumber||'').replace(/\D/g,''),v.announcedAt,v.effectiveAt].join('|');
export const unidentifiedLawVersion=v=>object(v)&&!officialId(v.officialId);
function preservedRoles(record){
 const sidecar=record?.preservedUnverifiedVersions;if(sidecar===undefined)return{valid:true,hashes:new Set()};
 if(!exactKeys(sidecar,['version','rawHashes'])||sidecar.version!==1||!Array.isArray(sidecar.rawHashes)||!Array.isArray(record.versions)||sidecar.rawHashes.length>record.versions.length)return{valid:false};const hashes=new Set();
 for(const rawHash of sidecar.rawHashes){if(!digest(rawHash)||hashes.has(rawHash))return{valid:false};const rows=record.versions.filter(v=>object(v)&&lawProgressHash(v)===rawHash);if(rows.length!==1||!unidentifiedLawVersion(rows[0]))return{valid:false};hashes.add(rawHash);}
 return{valid:true,hashes};
}
export function validateLawPreservedVersions(record,previousRecord){
 const roles=preservedRoles(record);if(!roles.valid)return false;const versions=record?.versions||record?.availableVersions||[],previous=previousRecord?.versions||previousRecord?.availableVersions||[];
 if(!Array.isArray(versions)||!Array.isArray(previous))return false;
 if(record?.preservedUnverifiedVersions===undefined&&previousRecord&&lawProgressHash(record)===lawProgressHash(previousRecord))return true;
 if(roles.hashes.size&&(!previousRecord||record.id!==previousRecord.id))return false;
 for(const rawHash of roles.hashes)if(!previous.some(v=>unidentifiedLawVersion(v)&&lawProgressHash(v)===rawHash))return false;
 for(const old of previous.filter(unidentifiedLawVersion)){
  const rawHash=lawProgressHash(old);if(roles.hashes.has(rawHash)&&versions.some(v=>object(v)&&lawProgressHash(v)===rawHash))continue;
  // A fresh identified observation for the existing merge key retains its own
  // normal proof requirements. It is never excused by an old sidecar.
  const identified=versions.find(v=>object(v)&&officialId(v.officialId)&&officialId(v.officialId)===officialId(record.officialId)&&lawVersionObservationKey(v)===lawVersionObservationKey(old));
  if(!identified||Object.hasOwn(old,'rawPayload')&&(!Object.hasOwn(identified,'rawPayload')||lawProgressHash(old.rawPayload)!==lawProgressHash(identified.rawPayload)))return false;
 }
 return true;
}
export function lawWatchScope(watchlist){
 if(!Array.isArray(watchlist)||!watchlist.length||watchlist.length>10000)failure('LAW_PROGRESS_SCOPE_INVALID');const ids=new Set();
 const manifest=watchlist.map(w=>{if(!object(w)||!key(w.id)||ids.has(w.id)||!['law','admrul','ordin'].includes(w.target)||!key(w.name)||w.jurisdiction!==undefined&&w.jurisdiction!==null&&typeof w.jurisdiction!=='string')failure('LAW_PROGRESS_SCOPE_INVALID');ids.add(w.id);return{id:w.id,target:w.target,name:w.name,jurisdiction:w.jurisdiction??null,source:w.source??null};}).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 return lawProgressHash(manifest);
}
function checkedOnDay(value,day){if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))return false;const d=new Date(value);return d.toISOString()===value&&koreaDate(d)===day;}
function officialVersionLink(v,target){
 let u;try{u=new URL(v.officialUrl);}catch{return false;}const path=target==='law'?'lsInfoP.do':target==='ordin'?'ordinInfoP.do':'admRulLsInfoP.do',param=target==='law'?'lsiSeq':target==='ordin'?'ordinSeq':'admRulSeq',keys=target==='law'?[param,'efYd']:[param];
 return u.protocol==='https:'&&['law.go.kr','www.law.go.kr'].includes(u.hostname)&&!u.port&&!u.username&&!u.password&&!u.hash&&u.pathname==='/LSW/'+path&&u.searchParams.get(param)===v.sequence&&[...u.searchParams.keys()].length===keys.length&&[...u.searchParams.keys()].every(k=>keys.includes(k))&&(target!=='law'||u.searchParams.get('efYd')===v.effectiveAt.replaceAll('-',''));
}
export function verifiedLawProgressRecord(w,r,day,{allowPreserved=true}={}){
 if(!object(r)||r.id!==w.id||r.target!==w.target||r.name!==w.name||r.sample!==false||r.verifiedAt!==day||(r.region??null)!==(w.jurisdiction??null)||lawProgressHash(r.source??null)!==lawProgressHash(w.source??null))return false;
 const family=officialId(r.officialId),sourceId=w.source?.lawId;if(!family||sourceId!==undefined&&sourceId!==null&&sourceId!==''&&officialId(String(sourceId))!==family||!Array.isArray(r.versions))return false;
 const roles=preservedRoles(r);if(!roles.valid)return false;
 const required=r.versions.filter(v=>(v?.versionStatus==='current'||v?.versionStatus==='scheduled')&&!(allowPreserved&&roles.hashes.has(lawProgressHash(v))));if(!required.length||required.filter(v=>v.versionStatus==='current').length>1)return false;const seen=new Set();
 for(const v of required){const id=v?.sequence+'|'+v?.effectiveAt;if(!object(v)||typeof v.sequence!=='string'||!/^\d{1,30}$/.test(v.sequence)||seen.has(id)||officialId(v.officialId)!==family||!date(v.announcedAt)||!date(v.effectiveAt)||!key(String(v.lawNumber??''))||!digest(v.bodyHash)||!checkedOnDay(v.bodyCheckedAt,day)||!officialVersionLink(v,w.target)||v.versionStatus==='current'&&(v.effectiveAt>day||v.announcedAt>day)||v.versionStatus==='scheduled'&&v.effectiveAt<=day)return false;seen.add(id);}
 return required.some(v=>v.officialUrl===r.officialUrl);
}
function previousRecords(previous){const rows=previous.records||previous.catalog||[];if(!Array.isArray(rows))return null;const out=new Map();for(const r of rows){if(!object(r)||!key(r.id)||out.has(r.id))return null;out.set(r.id,r);}return out;}
const empty=(reason,scopeHash)=>({ids:new Set(),mode:'fresh',reason,scopeHash});
export function resumeLawProgress({watchlist,previous={},previousFailures=[],day}){
 const scopeHash=lawWatchScope(watchlist),rows=previousRecords(previous),byId=new Map(watchlist.map(w=>[w.id,w]));if(!date(day)||!rows)return empty('PREVIOUS_RECORDS_UNPROVEN',scopeHash);
 if(previous.collectionProgress!==undefined){
  const p=previous.collectionProgress;if(!exactKeys(p,['version','day','scopeHash','completed'])||p.version!==1||!date(p.day)||!digest(p.scopeHash)||!Array.isArray(p.completed)||p.completed.length>watchlist.length)return empty('CHECKPOINT_INVALID',scopeHash);
  if(p.day!==day)return empty('COLLECTION_DAY_CHANGED',scopeHash);if(p.scopeHash!==scopeHash)return empty('WATCH_SCOPE_CHANGED',scopeHash);const ids=new Set();
  for(const item of p.completed){if(!exactKeys(item,['id','recordHash'])||!byId.has(item.id)||ids.has(item.id)||!digest(item.recordHash))return empty('CHECKPOINT_INVALID',scopeHash);const record=rows.get(item.id);if(!record||lawProgressHash(record)!==item.recordHash||!verifiedLawProgressRecord(byId.get(item.id),record,day))return empty('CHECKPOINT_RECORD_UNPROVEN',scopeHash);ids.add(item.id);}
  return{ids,mode:'checkpoint',reason:null,scopeHash};
 }
 // Compatibility transition for snapshots produced before checkpoints existed.
 // Every current-day success must be the exact complement of a typed prior
 // failure list; old catalog dates or missing IDs are never completion proof.
 if(previous.attemptedDate!==day||!Array.isArray(previousFailures)||!previousFailures.length||previousFailures.length>watchlist.length)return empty('LEGACY_PROGRESS_UNPROVEN',scopeHash);
 const failed=new Set(),allowed=new Set(['id','name','code','reasonCode','httpStatus','attemptCount','attachmentSequence','retryNotBefore','retryHold']);
 for(const f of previousFailures){if(!object(f)||!byId.has(f.id)||failed.has(f.id)||f.name!==byId.get(f.id).name||typeof f.code!=='string'||!/^[A-Z][A-Z0-9_]{1,80}$/.test(f.code)||Object.keys(f).some(k=>!allowed.has(k)))return empty('LEGACY_FAILURES_UNPROVEN',scopeHash);failed.add(f.id);}
 const ids=new Set();for(const w of watchlist){const r=rows.get(w.id);if(failed.has(w.id)){if(r?.verifiedAt===day)return empty('LEGACY_FAILURE_RECORD_CONFLICT',scopeHash);continue;}if(!verifiedLawProgressRecord(w,r,day))return empty('LEGACY_SUCCESS_UNPROVEN',scopeHash);ids.add(w.id);}
 if(ids.size+failed.size!==watchlist.length)return empty('LEGACY_COMPLEMENT_UNPROVEN',scopeHash);return{ids,mode:'legacy-transition',reason:null,scopeHash};
}
export function buildLawProgress({watchlist,records,day,completedIds}){
 const scopeHash=lawWatchScope(watchlist),byId=new Map(watchlist.map(w=>[w.id,w])),rows=new Map(records.map(r=>[r.id,r])),completed=[];
 for(const id of [...new Set(completedIds)].sort()){const w=byId.get(id),r=rows.get(id);if(w&&r&&verifiedLawProgressRecord(w,r,day))completed.push({id,recordHash:lawProgressHash(r)});}
 return{version:1,day,scopeHash,completed};
}
