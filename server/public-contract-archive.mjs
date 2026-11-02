// Lossless completed-event storage. DB proofs are opaque PostgreSQL JSONB-text
// proofs; the local canonical fingerprint below only binds an in-memory context.
import {createHash} from 'node:crypto';
export const PUBLIC_CONTRACT_PATH='automation.publicContracts';
export const PUBLIC_CONTRACT_LIMITS=Object.freeze({references:16,lookupIds:3000,distinctIds:9000,returnedBytes:64*1024*1024,snapshotBytes:32*1024*1024});
export const PUBLIC_CONTRACT_ERRORS=Object.freeze(['REFERENCE_LIMIT','REFERENCE_INVALID','IDENTITY_INVALID','EVENT_CONFLICT','CONTEXT_REQUIRED','REFERENCE_UNVERIFIED','REFERENCE_UNAVAILABLE','SOURCE_UNVERIFIED','LOOKUP_LIMIT','READ_LIMIT','CURRENT_REQUIRED','SIZE_LIMIT','HISTORY_CHANGED'].map(s=>'PUBLIC_CONTRACT_'+s));
const contexts=new WeakSet(),object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),copy=structuredClone;
const fail=code=>{throw Object.assign(Error(code),{code});};
const canonical=v=>Array.isArray(v)?v.map(canonical):object(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const json=v=>JSON.stringify(canonical(v)),same=(a,b)=>json(a)===json(b),binding=v=>createHash('sha256').update(json(v)).digest('hex'),size=v=>Buffer.byteLength(JSON.stringify(v));
const validId=v=>typeof v==='string'&&v.length>0&&v.length<=500&&v===v.trim()&&!/[\u0000-\u001f\u007f]/.test(v);
const tail=p=>Array.isArray(p?.automation?.publicContracts)?p.automation.publicContracts:[];
function refs(p){const r=p?.automation?.publicContractArchives;if(r===undefined)return[];if(!Array.isArray(r)||r.length>16)fail('PUBLIC_CONTRACT_REFERENCE_LIMIT');const seen=new Set();for(const e of r){reference(e);if(seen.has(e.sourceReferenceVersion))fail('PUBLIC_CONTRACT_REFERENCE_INVALID');seen.add(e.sourceReferenceVersion);}return r;}
function reference(e){const keys=['version','sourceReferenceVersion','path','recordCount','bytes','sha256'];if(!object(e)||Object.keys(e).length!==6||Object.keys(e).some(k=>!keys.includes(k))||e.version!==1||!validId(e.sourceReferenceVersion)||e.path!==PUBLIC_CONTRACT_PATH||!Number.isSafeInteger(e.recordCount)||e.recordCount<1||!Number.isSafeInteger(e.bytes)||e.bytes<1||!/^[a-f0-9]{64}$/.test(e.sha256||''))fail('PUBLIC_CONTRACT_REFERENCE_INVALID');}
function events(rows,{allowRepeated=false}={}){if(!Array.isArray(rows))fail('PUBLIC_CONTRACT_IDENTITY_INVALID');const seen=new Set();for(const r of rows){if(!object(r)||!validId(r.id)||!allowRepeated&&seen.has(r.id))fail('PUBLIC_CONTRACT_IDENTITY_INVALID');seen.add(r.id);}return rows;}
function compatible(old,next){if(!old||same(old,next))return;if(old.source!==next.source||old.source!=='DART')fail('PUBLIC_CONTRACT_EVENT_CONFLICT');}
function checkContext(ctx,previous,sourceReferenceVersion){if(!contexts.has(ctx)||ctx.sourceReferenceVersion!==sourceReferenceVersion||ctx.residentBinding!==binding(tail(previous))||!same(ctx.references,refs(previous)))fail('PUBLIC_CONTRACT_CONTEXT_REQUIRED');return ctx;}
function header(row,version){if(!object(row)||row.version!==version||!Number.isSafeInteger(row.recordCount)||row.recordCount<0||!Number.isSafeInteger(row.bytes)||row.bytes<1||!/^[a-f0-9]{64}$/.test(row.sha256||''))fail('PUBLIC_CONTRACT_REFERENCE_UNVERIFIED');}

export async function loadPublicContractContext(previous,{sourceReferenceVersion=null,readArchive}={}){
 const references=copy(refs(previous)),residentEvents=tail(previous),resident=new Map();for(const r of residentEvents)if(object(r)&&validId(r.id)&&!resident.has(r.id))resident.set(r.id,r);
 if(references.length)events(residentEvents);
 const cache=new Map(),seenIds=new Set(),incoming=new Map();let returnedBytes=0,currentReference=null;
 const read=async(ref,options)=>{if(typeof readArchive!=='function')fail('PUBLIC_CONTRACT_CONTEXT_REQUIRED');let row;try{row=await readArchive(copy(ref),{...options,sourceReferenceVersion,remainingBytes:PUBLIC_CONTRACT_LIMITS.returnedBytes-returnedBytes});}catch(error){if(/^PUBLIC_CONTRACT_[A-Z0-9_]+$/.test(error?.code||error?.message||''))throw error;fail('PUBLIC_CONTRACT_REFERENCE_UNAVAILABLE');}if(!row)fail('PUBLIC_CONTRACT_REFERENCE_UNAVAILABLE');header(row,ref.sourceReferenceVersion);return row;};
 // Validate every fixed leaf header before collection. Empty requested IDs mean
 // header-only, never "all events". Total history bytes are not a read limit.
 for(const ref of references){if(!validId(sourceReferenceVersion)||ref.sourceReferenceVersion===sourceReferenceVersion)fail('PUBLIC_CONTRACT_REFERENCE_UNVERIFIED');const row=await read(ref,{purpose:'lookup',ids:[]});if(row.isPriorSnapshot!==true||row.referenceHistoryValid!==true||row.recordCount!==ref.recordCount||row.bytes!==ref.bytes||row.sha256!==ref.sha256||!Array.isArray(row.events)||row.events.length)fail('PUBLIC_CONTRACT_REFERENCE_UNVERIFIED');}
 if(residentEvents.length&&typeof readArchive==='function'&&validId(sourceReferenceVersion)){
  const row=await read({version:1,sourceReferenceVersion,path:PUBLIC_CONTRACT_PATH,recordCount:residentEvents.length},{purpose:'current',ids:[],expectedEvents:residentEvents});
  if(row.matchesExpected!==true||row.referenceHistoryValid!==true||row.recordCount!==residentEvents.length)fail('PUBLIC_CONTRACT_SOURCE_UNVERIFIED');currentReference={version:1,sourceReferenceVersion,path:PUBLIC_CONTRACT_PATH,recordCount:row.recordCount,bytes:row.bytes,sha256:row.sha256};
 }
 const ctx={sourceReferenceVersion,references,residentEvents,residentBinding:binding(residentEvents),currentReference,
  async lookup(ids){
   if(!Array.isArray(ids)||ids.length>3000||ids.some(id=>!validId(id)))fail('PUBLIC_CONTRACT_LOOKUP_LIMIT');const unique=[...new Set(ids)],fresh=unique.filter(id=>!cache.has(id));for(const id of fresh)seenIds.add(id);if(seenIds.size>9000)fail('PUBLIC_CONTRACT_LOOKUP_LIMIT');
   const found=new Map();if(fresh.length)for(const ref of references){const row=await read(ref,{purpose:'lookup',ids:fresh});if(row.isPriorSnapshot!==true||row.referenceHistoryValid!==true||row.recordCount!==ref.recordCount||row.bytes!==ref.bytes||row.sha256!==ref.sha256)fail('PUBLIC_CONTRACT_REFERENCE_UNVERIFIED');events(row.events);if(row.events.some(r=>!fresh.includes(r.id))||row.readBytes!==undefined&&(!Number.isSafeInteger(row.readBytes)||row.readBytes<0))fail('PUBLIC_CONTRACT_REFERENCE_UNVERIFIED');returnedBytes+=Math.max(row.readBytes||0,size(row.events));if(returnedBytes>PUBLIC_CONTRACT_LIMITS.returnedBytes)fail('PUBLIC_CONTRACT_READ_LIMIT');for(const r of row.events){compatible(found.get(r.id),r);found.set(r.id,r);}}
   for(const id of fresh){const current=resident.get(id);if(current){compatible(found.get(id),current);found.set(id,current);}cache.set(id,found.get(id)||null);}return unique.flatMap(id=>cache.get(id)?[copy(cache.get(id))]:[]);
  },
  async prepareIncoming(rows){events(rows,{allowRepeated:true});const prior=new Map();for(let offset=0;offset<rows.length;offset+=3000)for(const r of await this.lookup(rows.slice(offset,offset+3000).map(r=>r.id)))prior.set(r.id,r);const result=[];for(const row of rows){const old=incoming.get(row.id)||prior.get(row.id);compatible(old,row);const next=copy(row);if(old?.sourceAliases?.length)next.sourceAliases=copy(old.sourceAliases);incoming.set(row.id,next);if(!resident.has(row.id)&&old&&same(old,next))continue;result.push(next);}return result;
  },
  validateTail(rows,archivedCurrent){const map=new Map(rows.map(r=>[r.id,r]));for(const row of rows){const expected=incoming.get(row.id),old=resident.get(row.id)||cache.get(row.id);if(!expected&&!resident.has(row.id))fail('PUBLIC_CONTRACT_HISTORY_CHANGED');if(expected&&!same(expected,row))fail('PUBLIC_CONTRACT_HISTORY_CHANGED');compatible(old,row);}for(const[id,row]of incoming)if(!map.has(id)){const old=archivedCurrent?resident.get(id)||cache.get(id):cache.get(id);if(!old||!same(old,row))fail('PUBLIC_CONTRACT_HISTORY_CHANGED');}},
  assertPrevious(p,version){return checkContext(this,p,version);},
  stats(){return{returnedBytes,distinctLookupIds:seenIds.size,references:references.length};}
 };
 contexts.add(ctx);return ctx;
}

export async function preparePublicContractStorage(previous,candidate,{sourceReferenceVersion=null,context,readArchive}={}){
 const ctx=context?checkContext(context,previous,sourceReferenceVersion):await loadPublicContractContext(previous,{sourceReferenceVersion,readArchive});
 if(size(candidate)<=PUBLIC_CONTRACT_LIMITS.snapshotBytes)return candidate;
 if(!ctx.currentReference||!ctx.residentEvents.length)fail('PUBLIC_CONTRACT_CURRENT_REQUIRED');events(ctx.residentEvents);if(ctx.references.length>=16)fail('PUBLIC_CONTRACT_REFERENCE_LIMIT');if(ctx.references.some(r=>r.sourceReferenceVersion===sourceReferenceVersion))fail('PUBLIC_CONTRACT_REFERENCE_UNVERIFIED');
 const prior=new Map(ctx.residentEvents.map(r=>[r.id,r])),resident=events(tail(candidate)),next=resident.filter(r=>!prior.has(r.id)||!same(prior.get(r.id),r)),payload={...candidate,automation:{...candidate.automation,publicContractArchives:[...copy(ctx.references),copy(ctx.currentReference)],publicContracts:next}};
 if(size(payload)>PUBLIC_CONTRACT_LIMITS.snapshotBytes)fail('PUBLIC_CONTRACT_SIZE_LIMIT');return payload;
}

export function validatePublicContractStorage(payload,previous,{sourceReferenceVersion=null,context}={}){
 const old=refs(previous),next=refs(payload);if(!old.length&&!next.length)return true;
 const ctx=checkContext(context,previous,sourceReferenceVersion);if(next.length<old.length||next.length>old.length+1||old.some((r,i)=>!same(r,next[i])))fail('PUBLIC_CONTRACT_HISTORY_CHANGED');
 if(next.length>old.length){if(!ctx.currentReference||!same(next.at(-1),ctx.currentReference))fail('PUBLIC_CONTRACT_SOURCE_UNVERIFIED');}
 events(tail(payload));ctx.validateTail(tail(payload),next.length>old.length);const current=new Map(tail(payload).map(r=>[r.id,r]));for(const row of ctx.residentEvents){const newer=current.get(row.id);if(next.length===old.length&&!newer)fail('PUBLIC_CONTRACT_HISTORY_CHANGED');if(newer)compatible(row,newer);}
 return true;
}
