import assert from 'node:assert/strict';
import {createCenterHandlers} from '../server/center-services.mjs';
const origin='https://platform.example.invalid';
const payload={record:{name:'대형 시행규칙',sequence:'123'},articles:[{number:'1',text:'한글 조문·별표 '.repeat(400000)}],appendices:[],addenda:[]};
let externalCalls=0,inside=false;
const client={query:async sql=>sql.startsWith('SELECT revision,state')?{rows:[{revision:1,state:{projects:[{id:'P1'}]}}]}:sql.startsWith('INSERT INTO development_project_platform.app_rate_limit')?{rows:[{count:1}]}:Promise.reject(Error('Unexpected SQL'))};
const handlers=createCenterHandlers({origin,withTransaction:async(request,fn)=>{inside=true;try{const response=await fn(client,{userId:'U1'});response.headers.append('set-cookie','synthetic-refreshed-session=1; HttpOnly');return response;}finally{inside=false;}},accessPolicy:async()=>({isAdmin:false,projects:{P1:'viewer'}}),lawConfiguration:()=>({oc:'synthetic-nonprivate'}),lawDetailService:async()=>{assert.equal(inside,false);externalCalls++;return payload;}});
const response=await handlers.lawDetail(new Request(origin+'/api/law-detail?projectId=P1&target=law&sequence=123&effectiveAt=2026-10-20',{headers:{origin}}));
assert.equal(response.status,200);assert.equal(externalCalls,1);assert.equal(response.headers.get('cache-control'),'private, no-store');assert.match(response.headers.get('content-type'),/^application\/json/);assert.equal(response.headers.get('content-length'),null);assert.equal(response.headers.getSetCookie().length,1);
const reader=response.body.getReader(),chunks=[];let count=0;
while(true){const{done,value}=await reader.read();if(done)break;assert(value.byteLength<=65536,'Each law detail response chunk must be at most 64KiB');chunks.push(value);count++;}
assert(count>2);const text=Buffer.concat(chunks).toString('utf8');assert(Buffer.byteLength(text)>4.5e6);assert.deepEqual(JSON.parse(text),{...payload,projectId:'P1',jurisdiction:{input:'',status:'unverified',message:'사업지의 공식 시·군·구 범위는 아직 확인되지 않았습니다.'},appliesToProject:false});
const again=await handlers.lawDetail(new Request(origin+'/api/law-detail?projectId=P1&target=law&sequence=123&effectiveAt=2026-10-20',{headers:{origin}})),cancelled=again.body.getReader();assert((await cancelled.read()).value.byteLength<=65536);await cancelled.cancel();assert.equal((await cancelled.read()).done,true);
payload.articles[0].text='x'.repeat(25*1024*1024);const excessive=await handlers.lawDetail(new Request(origin+'/api/law-detail?projectId=P1&target=law&sequence=123&effectiveAt=2026-10-20',{headers:{origin}}));assert.equal(excessive.status,503);assert.equal((await excessive.json()).error,'LAW_SEARCH_UNAVAILABLE');
console.log(JSON.stringify({suite:'center120-law-stream',passed:3,bytes:Buffer.byteLength(text),chunks:count,realDatabaseUsed:false,remoteVercelStreamVerified:false}));
