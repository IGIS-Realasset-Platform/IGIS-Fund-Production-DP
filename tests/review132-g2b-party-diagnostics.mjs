import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {parseG2bParties,collectG2bContracts,collectPartnerEnrichment} from '../server/partner-enrichment.mjs';
import {mergePartnerResults} from '../server/partner-collector.mjs';
import {validatePartnerEnrichmentState,validatePartnerResult} from '../server/maintenance-runtime.mjs';

// Independent input contract: the official corpList has ten fields. All values
// below are synthetic. No production credential, provider call or database.
const checks=[],key='isolated-g2b-diagnostic-key',clock=()=>new Date('2026-10-21T00:00:00.000Z'),query={from:'202610200000',to:'202610202359'};
const fields=['1','대표','단독','SYNTHETIC_PRIVATE_COMPANY','SYNTHETIC_PERSON','대한민국','100','SYNTHETIC_CREDITOR','SYNTHETIC_CONTACT','1234567890'];
const parties=p=>'['+p.join('^')+']',row=corpList=>({untyCntrctNo:'SYNTHETIC-CONTRACT',cnstwkNm:'SYNTHETIC_PRIVATE_PROJECT',totCntrctAmt:'100000001',rgstDt:'2026-10-20 01:00:00',corpList});
const frame=(items,{pageNo=1,numOfRows=100,totalCount=items.length}={})=>({response:{header:{resultCode:'00'},body:{pageNo,numOfRows,totalCount,items}}});
const shape=(inputType,groups=[],patch={})=>({version:1,inputType,inputTooLong:false,framingValid:groups.length>0,groupCount:groups.length,groupsTruncated:false,groups,duplicateRegistrationCount:0,duplicatesTruncated:false,...patch});
const group=(patch={})=>({fieldCount:10,fieldsTruncated:false,emptyPositions:[],sequenceValid:true,registrationValid:true,...patch});
const read=async corpList=>collectG2bContracts({serviceKey:key,query,kinds:['contract'],get:async()=>Response.json(frame([row(corpList)]))});
const stable=v=>JSON.stringify(v),record=(n)=>({id:'g2b:'+createHash('sha256').update('diagnostic-fixture-'+n).digest('hex').slice(0,40),source:'G2B',contractNumber:'SYNTHETIC-'+n,eventType:'contract',sourceTime:'2026-10-20T01:00:00+09:00',title:'격리 공사',totalAmountKrw:100000001,sourceUrl:'https://www.data.go.kr/data/15129427/openapi.do'});
function safe(value){const s=JSON.stringify(value);for(const forbidden of ['SYNTHETIC','1234567890','100000001',key,'http','hash','companyName','businessRegistrationNo','corpList'])assert(!s.includes(forbidden),forbidden);assert(Buffer.byteLength(s)<=4096);}
async function check(name,fn){try{await fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',kind:error.name,message:error.message});}}

await check('G2BD132-01 nine-field failure keeps original status/checkpoint and records only finite shape',async()=>{
 const r=await read(parties(fields.slice(0,9)));assert.equal(r.status,'partial_failure');assert.equal(r.errorCode,'INVALID_G2B_PARTIES');assert.deepEqual(r.records,[]);assert.deepEqual(r.checkpoint,{kindIndex:0,page:1});assert.deepEqual(r.partyShape,shape('string',[group({fieldCount:9,registrationValid:false})]));safe(r.partyShape);
});
await check('G2BD132-02 wrong input types produce type only and no object content',async()=>{
 for(const [input,type]of [[{private:fields},'object'],[[fields],'array'],[true,'boolean'],[1234567890,'number']]){const r=await read(input);assert.equal(r.errorCode,'INVALID_G2B_PARTIES');assert.deepEqual(r.partyShape,shape(type));safe(r.partyShape);}
});
await check('G2BD132-03 empty slots and invalid numbers are booleans rather than copied identifiers',async()=>{
 const p=[...fields];p[0]='';p[4]='';p[6]='';p[9]='0000000000';const r=await read(parties(p));assert.deepEqual(r.partyShape,shape('string',[group({emptyPositions:[0,4,6],sequenceValid:false,registrationValid:false})]));safe(r.partyShape);
});
await check('G2BD132-04 duplicate parties stay rejected with counts and capped group details',async()=>{
 const r=await read(Array.from({length:40},()=>parties(fields)).join(','));assert.equal(r.errorCode,'INVALID_G2B_PARTIES');assert.equal(r.partyShape.groupCount,16);assert.equal(r.partyShape.groups.length,16);assert.equal(r.partyShape.groupsTruncated,true);assert.equal(r.partyShape.duplicateRegistrationCount,16);assert.equal(r.partyShape.duplicatesTruncated,true);safe(r.partyShape);
});
await check('G2BD132-05 oversized/framing/extra-field inputs stay bounded without raw prefixes',async()=>{
 const big=await read('SYNTHETIC'.repeat(1300));assert.deepEqual(big.partyShape,shape('string',[],{inputTooLong:true}));safe(big.partyShape);
 const wrong=await read(parties(fields)+'SYNTHETIC');assert.equal(wrong.partyShape.framingValid,false);assert.equal(wrong.partyShape.groupCount,1);safe(wrong.partyShape);
 const extra=await read(parties([...fields,...Array(100).fill('')]));assert.equal(extra.partyShape.groups[0].fieldCount,11);assert.equal(extra.partyShape.groups[0].fieldsTruncated,true);assert(extra.partyShape.groups[0].emptyPositions.every(i=>Number.isInteger(i)&&i>=0&&i<10));safe(extra.partyShape);
});
await check('G2BD132-06 successful/empty/cancelled parties preserve old output and receive no diagnostic',async()=>{
 const r=await read(parties(fields));assert.equal(r.status,'success');assert.equal(r.records[0].parties[0].businessRegistrationNo,fields[9]);assert.equal(r.records[0].parties[0].sharePercent,100);assert(!Object.hasOwn(r,'partyShape'));for(const v of [null,undefined,''])assert.deepEqual(parseG2bParties(v),[]);
 const cancel=await collectG2bContracts({serviceKey:key,query,kinds:['cancellation'],get:async()=>Response.json(frame([{untyCntrctNo:'SYNTHETIC-CANCEL',dltDt:'2026-10-20 01:00:00',corpList:{private:fields}}]))});assert.equal(cancel.status,'success');assert.deepEqual(cancel.records[0].parties,[]);assert(!Object.hasOwn(cancel,'partyShape'));
});
await check('G2BD132-07 share/text failures retain errors and never leak source strings',async()=>{
 const p=[...fields];p[6]='101';const bad=await read(parties(p));assert.equal(bad.errorCode,'INVALID_G2B_SHARE');assert.deepEqual(bad.partyShape,shape('string',[group()]));safe(bad.partyShape);
 p[6]='100';p[3]='';const empty=await read(parties(p));assert.equal(empty.errorCode,'INVALID_PROVIDER_TEXT');assert.deepEqual(empty.partyShape,shape('string',[group({emptyPositions:[3]})]));safe(empty.partyShape);
});
await check('G2BD132-08 unrelated provider/JSON failures cannot gain party diagnostics',async()=>{
 const r=await collectG2bContracts({serviceKey:key,query,get:async()=>{throw Error(key);}});assert.equal(r.errorCode,'SOURCE_PROVIDER_FAILED');assert(!Object.hasOwn(r,'partyShape'));assert(!stable(r).includes(key));
 const rejected=await collectG2bContracts({serviceKey:key,query,get:async()=>Response.json({response:{header:{resultCode:'99'},body:{corpList:fields}}})});assert.equal(rejected.errorCode,'G2B_API_REJECTED');assert(!Object.hasOwn(rejected,'partyShape'));
 const forged=await collectG2bContracts({serviceKey:key,query,get:async()=>{throw Object.assign(Error('INVALID_G2B_PARTIES'),{code:'INVALID_G2B_PARTIES',partyShape:{private:fields}});}});assert.equal(forged.errorCode,'INVALID_G2B_PARTIES');assert(!Object.hasOwn(forged,'partyShape'));
});
await check('G2BD132-12 a failing later page retains its exact successful prefix and retry position',async()=>{
 const first=Array.from({length:100},(_,i)=>({...row(parties(fields)),untyCntrctNo:'SYNTHETIC-PREFIX-'+i})),get=async raw=>{const page=Number(new URL(raw).searchParams.get('pageNo'));return Response.json(frame(page===1?first:[row(parties(fields.slice(0,9)))],{pageNo:page,totalCount:101}));},r=await collectG2bContracts({serviceKey:key,query,kinds:['contract'],get});assert.equal(r.status,'partial_failure');assert.equal(r.errorCode,'INVALID_G2B_PARTIES');assert.equal(r.records.length,100);assert.deepEqual(r.records.map(r=>r.contractNumber),first.map(r=>r.untyCntrctNo));assert.deepEqual(r.coverage,[{kind:'contract',page:1,total:101,count:100}]);assert.deepEqual(r.checkpoint,{kindIndex:0,page:2});assert.deepEqual(r.partyShape,shape('string',[group({fieldCount:9,registrationValid:false})]));safe(r.partyShape);
});

async function recovery({phase,legacy=false,volume=false}={}){
 const old=legacy?Array.from({length:300},(_,i)=>record(i)):[],published=volume?Array.from({length:20831},(_,i)=>record(10000+i)):[],previous={companies:{KEEP:{companyKey:'KEEP',officialComments:[{body:'기존 합성 의견'}],row:{unit_cost_records:[{amount_krw:100000001}],sourceLegalIdentity:[{namespace:'kr-business-registration',value:fields[9],verified:true,sourceUrl:'https://www.data.go.kr/data/15129427/openapi.do'}]}}},groups:[],market:{series:[]},automation:{sources:{},publicContracts:published}},checkpoint=legacy?{version:1,creditSearchRevision:1,g2b:{query:{from:'202610210000',to:'202610212359'},checkpoint:{kindIndex:0,page:4},records:old}}:null,before=stable(previous),beforeCheckpoint=stable(checkpoint),calls=[];
 const get=async raw=>{const u=new URL(raw),count=Number(u.searchParams.get('numOfRows'))===1,kind=u.pathname.endsWith('ChgHstry')?'amendment':u.pathname.endsWith('DltHstry')?'cancellation':'contract';calls.push({count,kind});const invalid=phase==='planning'||!count;return Response.json(frame(kind==='contract'?[row(parties(invalid?fields.slice(0,9):fields))]:[],{numOfRows:count?1:100}));};get.stats=()=>({remainingMs:70000,requestedCount:calls.length});
 const r=await collectPartnerEnrichment({previous,companies:[],checkpoint,configuration:{includeNice:false,g2bServiceKey:key,g2bRecoveryStart:'2026-10-20'},get,clock}),sources=r.sourceResults.filter(s=>s.sourceId==='g2b-contracts'||s.sourceId==='g2b-recovery'),payload=mergePartnerResults(previous,r.sourceResults,{checkedAt:clock().toISOString()});payload.automation.enrichmentState=r.state;validatePartnerEnrichmentState(r.state,previous,{}, {now:clock()});const successful=r.sourceResults.filter(s=>s.complete&&['success','not_modified'].includes(s.status)).length;validatePartnerResult({status:successful?'partial_failure':'failed',sourceResults:r.sourceResults,payload,requestedCount:calls.length,checkedCount:successful},previous,{}, {now:clock()});assert.equal(stable(previous),before);assert.equal(stable(checkpoint),beforeCheckpoint);assert.deepEqual(payload.companies,previous.companies);assert.deepEqual(payload.automation.publicContracts,published);for(const s of sources){assert.equal(s.complete,false);assert(!s.patch);assert.deepEqual(s.coverage.partyShape,shape('string',[group({fieldCount:9,registrationValid:false})]));assert.deepEqual(payload.automation.sources[s.sourceId].coverage.partyShape,s.coverage.partyShape);safe(s.coverage.partyShape);}assert.equal(sources.find(s=>s.sourceId==='g2b-recovery').errorCode,'INVALID_G2B_PARTIES');return{r,calls,old};
}
await check('G2BD132-09 count-planning failure reaches existing source coverage and preserves isolated 300/20831 observations',async()=>{const {r,calls,old}=await recovery({phase:'planning',legacy:true,volume:true});assert.equal(calls.length,1);assert.equal(calls[0].count,true);assert.deepEqual(r.state.g2bLegacy.inline.records,old);assert.equal(r.state.g2bProgress.completedThrough,null);assert.equal(r.state.g2b.records.length,0);});
await check('G2BD132-10 body failure after successful planning reaches both source coverages without completing the window',async()=>{const {r,calls}=await recovery({phase:'body'});assert.equal(calls.length,4);assert.equal(calls[3].count,false);assert.equal(r.state.g2bProgress.completedThrough,null);assert.deepEqual(r.state.g2b.records,[]);assert.deepEqual(r.state.g2b.checkpoint,{kindIndex:0,page:1});});
await check('G2BD132-11 non-recovery collector preserves failure shape in its existing source coverage',async()=>{const get=async()=>Response.json(frame([row(parties(fields.slice(0,9)))]));get.stats=()=>({remainingMs:70000,requestedCount:0});const r=await collectPartnerEnrichment({previous:{companies:{}},companies:[],configuration:{includeNice:false,g2bServiceKey:key,g2bQuery:query},get,clock}),source=r.sourceResults.find(s=>s.sourceId==='g2b-contracts');assert.equal(source.status,'partial_failure');assert.equal(source.complete,false);assert.deepEqual(source.coverage.partyShape,shape('string',[group({fieldCount:9,registrationValid:false})]));safe(source.coverage.partyShape);});

const result={suite:'review132-g2b-party-diagnostics',scope:'Actual parser/collector/recovery/merge/runtime-validation with synthetic bounded shape and isolated 300/20831 fixtures; not current production counts.',checks,passed:checks.filter(c=>c.status==='passed').length,failed:checks.filter(c=>c.status==='failed').length,realProviderRequests:0,credentialReads:0,productionWrites:0};const index=process.argv.indexOf('--output');if(index>=0)fs.writeFileSync(process.argv[index+1],JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(result.failed)process.exitCode=1;
