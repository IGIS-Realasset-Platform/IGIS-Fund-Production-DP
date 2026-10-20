import assert from 'node:assert/strict';
import {collectKisRatings,collectPartnerEnrichment} from '../server/partner-enrichment.mjs';
import {validatePartnerEnrichmentState} from '../server/maintenance-runtime.mjs';
const examples=[['삼성물산 주식회사','삼성물산'],['주식회사 삼성물산','삼성물산'],['현대건설(주)','현대건설'],['(주)현대건설','현대건설'],['㈜ 포스코이앤씨','포스코이앤씨'],['포스코이앤씨㈜','포스코이앤씨'],['유한회사 이지스','이지스'],['이지스 유한책임회사','이지스'],['(유) 이지스','이지스'],['이지스(유)','이지스'],['  삼성물산  ','삼성물산'],['한국주식회사연구소','한국주식회사연구소'],['주식회사랑','주식회사랑'],['주식회사 주식회사연구','주식회사연구']];
let passed=0;
for(const[input,expected]of examples){
 const requests=[],snapshot=structuredClone(input);
 const result=await collectKisRatings({query:input,get:async raw=>{const url=new URL(raw);requests.push(url);return {json:async()=>({message:'success',dataList1:[]})};}});
 assert.equal(requests.length,1);assert.equal(requests[0].hostname,'www.kisrating.com');
 for(const key of ['keyword','searchKeyword'])assert.equal(requests[0].searchParams.get(key),expected,input+' '+key);
 assert.equal(result.status,'success');assert.equal(result.coverage.entityVerified,false);assert.equal(input,snapshot);passed++;console.log('PASS public-search-only '+JSON.stringify(input));
}
let requests=0;await assert.rejects(()=>collectKisRatings({query:'주식회사',get:async()=>{requests++;return{json:async()=>({message:'success',dataList1:[]})};}}));assert.equal(requests,0);passed++;
const direct=await collectKisRatings({issuerCode:'000001',query:'삼성물산 주식회사',get:async raw=>{assert.match(raw,/corp_overview[.]do[?]kiscd=000001$/);throw Object.assign(Error('SOURCE_UNAVAILABLE'),{code:'SOURCE_UNAVAILABLE'});}});assert.equal(direct.candidates[0].issuerCode,'000001');assert.equal(direct.candidates[0].entityVerified,false);assert.equal(direct.status,'partial_failure');passed++;
const companies=[{companyKey:'a',name:'FIRST'},{companyKey:'b',name:'SECOND'}],previous={companies:Object.fromEntries(companies.map(x=>[x.companyKey,{companyKey:x.companyKey}]))},legacy={version:1,creditAfterCompanyKey:'a',g2b:{query:{from:'202610200000',to:'202610202359'},checkpoint:{kindIndex:1,page:3},records:[]},dart:{index:1,checkpoint:{page:2,offset:4},records:[]}},legacyCopy=structuredClone(legacy),queries=[];
const options={companies,previous,get:async()=>{throw Error('NO_REAL_NETWORK');},configuration:{includeNice:false},clock:()=>new Date('2026-10-20T10:00:00.000Z'),providers:{g2b:async({checkpoint})=>({status:'partial_failure',checkpoint,records:[]}),kis:async({query})=>{queries.push(query);return{status:'success',observed:[],coverage:{candidateCount:0}};}}};
const migrated=await collectPartnerEnrichment({...options,checkpoint:legacy});assert.deepEqual(queries,['FIRST','SECOND'],'old raw-name search cursor must not skip the now-fixed first company');assert.equal(migrated.state.creditSearchRevision,1);assert.deepEqual(migrated.state.g2b,legacy.g2b);assert.deepEqual(migrated.state.dart,legacy.dart);assert.deepEqual(legacy,legacyCopy);validatePartnerEnrichmentState(migrated.state,previous,{});passed++;
queries.length=0;const resumed=await collectPartnerEnrichment({...options,checkpoint:{...migrated.state,creditAfterCompanyKey:'a'}});assert.deepEqual(queries,['SECOND'],'the current search cursor resumes without restarting every run');assert.equal(resumed.state.creditAfterCompanyKey,undefined);passed++;
for(const revision of [0,2,'1',null,true]){assert.throws(()=>validatePartnerEnrichmentState({version:1,creditSearchRevision:revision},previous,{}),/CHECKPOINT/);}assert.doesNotThrow(()=>validatePartnerEnrichmentState({version:1},previous,{}));passed++;
queries.length=0;await assert.rejects(()=>collectPartnerEnrichment({...options,checkpoint:{version:1,creditSearchRevision:2}}),/CHECKPOINT/);assert.equal(queries.length,0);passed++;
console.log(JSON.stringify({suite:'center120-credit-search-name',passed,scope:'synthetic official transport and closed checkpoint migration; no keys or DB writes; names/identities are not merged'}));
