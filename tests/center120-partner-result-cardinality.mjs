import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
// Load only the current pure validator without creating a pool or invoking jobs.
const runtime=await import('../server/maintenance-runtime.mjs');
assert.equal(typeof runtime.validatePartnerResult,'function','운영 결과 검증 함수를 독립 검사할 수 있어야 합니다.');
const validate=runtime.validatePartnerResult;
const fixed=['rank:cak','rank:cm','rank:etis-all','rank:etis-con','rank:kacem','dart-public','kict-construction-index','kosis-market','g2b-contracts','credit-ratings','credit-nice','unit-costs','molit-unit-standard','dart-contracts','dart-company-identities'];
const companyKeys=Array.from({length:200},(_,i)=>'company-'+i),previous={groups:[],market:{series:[]},companies:Object.fromEntries(companyKeys.map(companyKey=>[companyKey,{companyKey}]))};
const sourceIds=[...fixed,...Array.from({length:8},(_,i)=>'kosis:table-'+i),...companyKeys.flatMap(key=>['news:','dart:company:','credit-kis:'].map(prefix=>prefix+key))];
const full=()=>({status:'success',requestedCount:200,checkedCount:sourceIds.length,payload:structuredClone(previous),sourceResults:sourceIds.map(sourceId=>({sourceId,status:'success',complete:true})),continuation:null,limits:{bytes:32*1024*1024}});
let n=0;function check(name,fn){fn();n++;console.log('PASS '+name);}
check('회사200개×독립출처3개와고정15·통계8의623결과를한정수용',()=>{const r=validate(full(),previous,{});assert.equal(r.sources.length,623);assert.equal(r.status,'success');});
function rejected(change){const r=full();change(r);r.checkedCount=r.sourceResults.filter(s=>s.complete).length;assert.throws(()=>validate(r,previous,{}),/PARTNER_RESULT_INVALID/);}
check('같은 ID 중복은 전체 저장전 차단',()=>rejected(r=>r.sourceResults[1].sourceId=r.sourceResults[0].sourceId));
check('회사별 source 접미사 공란·미등록회사·201번째는 차단',()=>{for(const prefix of ['news:','dart:company:','credit-kis:']){for(const suffix of ['', 'unknown-company'])rejected(r=>{r.sourceResults=r.sourceResults.filter(x=>!x.sourceId.startsWith('kosis:'));r.sourceResults.push({sourceId:prefix+suffix,status:'success',complete:true});});rejected(r=>{r.sourceResults=r.sourceResults.filter(x=>!x.sourceId.startsWith('kosis:'));r.payload.companies['company-201']={companyKey:'company-201'};r.sourceResults.push({sourceId:prefix+'company-201',status:'success',complete:true});});}});
check('미정의 고정출처·9번째통계출처·6번째순위출처는 차단',()=>{for(const extra of ['unknown-provider','kosis:ninth','rank:unknown'])rejected(r=>{r.sourceResults=r.sourceResults.filter(x=>!x.sourceId.startsWith('news:'));r.sourceResults.push({sourceId:extra,status:'success',complete:true});});});
check('결과수상한과별개로 외부요청200·수신32MiB상한유지',()=>{rejected(r=>r.requestedCount=201);rejected(r=>r.limits.bytes=32*1024*1024+1);});
check('623개분모보다큰반환은접수하지않음',()=>rejected(r=>r.sourceResults.push({...r.sourceResults[0]})));
check('완료수·상태가거짓인결과는거부',()=>{const r=full();r.checkedCount--;assert.throws(()=>validate(r,previous,{}),/PARTNER_RESULT_INVALID/);rejected(r=>r.sourceResults[0].complete=false);});
const code=await fs.readFile('server/maintenance-runtime.mjs','utf8');assert.match(code,/Math\.min\(70000,\s*remaining\(\)\s*-\s*20000\)/);assert.match(code,/requestLimit:200/);
console.log(JSON.stringify({passed:n,realNetwork:false,realDatabase:false,resourceLimitsNotIncreased:true}));
