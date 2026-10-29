import {createHash} from 'node:crypto';

// Independent positive provider fixture. These are synthetic law bodies and
// official-shaped identifiers, never evidence of an actual remote collection.
const copy=structuredClone;
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
export function verifiedLawResult({watchlist,previous={},day,failures=[]}){
 const failed=new Set(failures.map(f=>f.id)),records=copy(previous.records||previous.catalog||[]),byId=new Map(records.map((r,i)=>[r.id,i]));
 for(const [index,w] of watchlist.entries()){
  if(w.target!=='law')throw Error('This positive fixture defines national laws only');
  if(failed.has(w.id))continue;
  const officialId=String(w.source?.lawId||1000+index),sequence=String(2000+index),officialUrl='https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq='+sequence+'&efYd=20261001';
  const version={name:w.name,sequence,officialId,announcedAt:'2026-10-01',effectiveAt:'2026-10-01',lawNumber:sequence,officialUrl,bodyHash:createHash('sha256').update('Independent synthetic full law body: '+w.id).digest('hex'),bodyCheckedAt:day+'T00:00:00.000Z',versionStatus:'current'};
  const old=records[byId.get(w.id)]||{},oldVersions=copy(old.versions||old.availableVersions||[]),sameObservation=v=>String(v.sequence||'')===sequence&&v.announcedAt===version.announcedAt&&v.effectiveAt===version.effectiveAt&&String(v.lawNumber||'')===version.lawNumber;
  const retained=oldVersions.filter(v=>!sameObservation(v)),unidentified=v=>typeof v.officialId!=='string'||!/^\d{1,30}$/.test(v.officialId),raw=retained.filter(unidentified),known=retained.filter(v=>!unidentified(v)).map(v=>({...v,versionStatus:v.effectiveAt>day?'scheduled':'historical'})),prior=oldVersions.find(sameObservation);
  const row={...copy(old),id:w.id,target:w.target,name:w.name,officialId,region:w.jurisdiction??null,sample:false,verifiedAt:day,source:copy(w.source??null),officialUrl,versions:[...raw,...known,{...(prior||{}),...version}],preservedUnverifiedVersions:{version:1,rawHashes:raw.map(hash)}};
  if(byId.has(w.id))records[byId.get(w.id)]=row;else{byId.set(w.id,records.length);records.push(row);}
 }
 const successful=watchlist.filter(w=>!failed.has(w.id)),count=successful.length,manifest=watchlist.map(w=>({id:w.id,target:w.target,name:w.name,jurisdiction:w.jurisdiction??null,source:w.source??null})).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0);
 return{status:failures.length?(count?'partial_failure':'failed'):'success',errorCode:failures.length?'LAW_COLLECTION_PARTIAL':null,requestedCount:watchlist.length,checkedCount:count,fetchedCount:count,reusedCount:0,attemptedCount:watchlist.length,deferredCount:0,failures:copy(failures),records,changes:copy(previous.changes||[]),coverage:{law:count,admrul:0,ordin:0},collectionProgress:{version:1,day,scopeHash:hash(manifest),completed:successful.map(w=>({id:w.id,recordHash:hash(records[byId.get(w.id)])})).sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)}};
}
