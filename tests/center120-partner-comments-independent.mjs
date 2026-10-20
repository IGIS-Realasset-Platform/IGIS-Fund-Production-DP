import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createPartnerCommentsHandler} from '../server/partner-comments.mjs';
import {createReferenceRouter} from '../server/reference-router.mjs';

const files=['server/partner-comments.mjs','server/reference-router.mjs','server/workspace-runtime.mjs','database/center-partner-comments-20261020.sql'];
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),before=Object.fromEntries(files.map(p=>[p,hash(p)]));
const origin='https://comments-independent.example.invalid',key='qa:microseconds',viewer={userId:'QA_MICRO',email:'kylee@igisam.com'},rows=[23,22,21].map(n=>({id:'c1200020-0000-4000-8000-'+String(n).padStart(12,'0'),company_key:key,source_comment_key:null,author_email:viewer.email,text:'격리된 페이지 행',cooperative:false,project_text:'',created_at:`2026-10-20T00:00:00.002${n-20}+00:00`}));
// Actual PostgreSQL JSONB timestamps retain microseconds. JavaScript Date does not.
// This comparison independently models the server's exact timestamp/UUID keyset.
const exactTime=s=>{const m=s.match(/^(.*T\d{2}:\d{2}:\d{2})\.(\d+)(?:Z|\+00:00)$/);assert(m,s);return m[1]+'.'+m[2].padEnd(6,'0')+'Z';};
const checks=[];async function check(name,fn){try{await fn();checks.push({name,status:'passed'});console.log('PASS',name);}catch(error){checks.push({name,status:'failed',error:error.message});console.log('FAIL',name,error.message);}}

await check('동일 밀리초의 실제 PG microsecond3행은 페이지간 누락 없이 표시',async()=>{
 const query=async(sql,p)=>{
  if(sql.includes('FROM development_project_platform.app_user'))return{rows:[{id:viewer.userId,email:viewer.email,email_verified:true}]};
  if(sql.includes('FROM development_project_platform.reference_snapshots'))return{rows:[{version:'qa-reference',companies:{[key]:{companyKey:key}}}]};
  assert(sql.startsWith('WITH visible AS MATERIALIZED'),sql);const after=p[2],id=p[3],list=rows.filter(row=>!after||exactTime(row.created_at)<exactTime(after)||exactTime(row.created_at)===exactTime(after)&&row.id<id).slice(0,p[4]);return{rows:[{comments:list,online_count:'3',recent_31day:true}]};
 };
 const handler=createPartnerCommentsHandler({origin,clock:()=>new Date('2026-10-20T01:00:00Z'),withTransaction:async(request,operation)=>operation({query},viewer)}),all=[];let next=null;
 do{const u=new URL(origin+'/api/partner-comments');u.searchParams.set('companyKey',key);u.searchParams.set('limit','1');if(next)u.searchParams.set('cursor',next);const response=await handler(new Request(u)),body=await response.json();assert.equal(response.status,200);assert.equal(body.onlineCount,3);all.push(...body.onlineComments.map(x=>x.id));next=body.nextCursor;}while(next);
 assert.deepEqual(all,rows.map(r=>r.id));
});

await check('용량 초과 요청의 cancel 무응답도 즉시413·인증/DB 접근0',async()=>{
 let authenticated=0;const handler=createPartnerCommentsHandler({origin,withTransaction:async()=>{authenticated++;throw Error('DB must not be called');}}),stream=new ReadableStream({start(c){c.enqueue(new Uint8Array(20481));},cancel(){return new Promise(()=>{});}}),request=new Request(origin+'/api/partner-comments',{method:'POST',headers:{origin,'content-type':'application/json'},body:stream,duplex:'half'}),result=await Promise.race([handler(request).then(r=>r.status,e=>e.status||e.code||e.message),new Promise(resolve=>setTimeout(()=>resolve('pending-after-250ms'),250))]);assert.equal(result,413);assert.equal(authenticated,0);
});

await check('끝나지 않는 본문도 유한 읽기시간 후408·무응답cancel·DB 접근0',async()=>{
 let authenticated=0,cancelled=false;const handler=createPartnerCommentsHandler({origin,readTimeoutMs:20,withTransaction:async()=>{authenticated++;throw Error('DB must not be called');}}),stream=new ReadableStream({pull(){return new Promise(()=>{});},cancel(){cancelled=true;return new Promise(()=>{});}}),request=new Request(origin+'/api/partner-comments',{method:'POST',headers:{origin,'content-type':'application/json'},body:stream,duplex:'half'}),result=await Promise.race([handler(request).then(r=>r.status,e=>e.status||e.code||e.message),new Promise(resolve=>setTimeout(()=>resolve('pending-after-250ms'),250))]);assert.equal(result,408);assert.equal(authenticated,0);assert.equal(cancelled,true);
});

await check('커서는6자리와원래타임존 유지·잘못된달력/시차/정밀도·다른회사 차단',async()=>{
 let listCalls=0;const query=async(sql)=>{if(sql.includes('FROM development_project_platform.app_user'))return{rows:[{id:viewer.userId,email:viewer.email,email_verified:true}]};if(sql.includes('FROM development_project_platform.reference_snapshots'))return{rows:[{version:'qa-reference',companies:{[key]:{companyKey:key}}}]};assert(sql.startsWith('WITH visible AS MATERIALIZED'));listCalls++;return{rows:[{comments:rows.slice(0,2).map(r=>({...r,created_at:r.created_at.replace('T00:','T09:').replace('+00:00','+09:00')})),online_count:'3',recent_31day:true}]};};
 const handler=createPartnerCommentsHandler({origin,withTransaction:async(r,op)=>op({query},viewer)}),first=await(await handler(new Request(origin+'/api/partner-comments?companyKey='+key+'&limit=1'))).json(),raw=JSON.parse(Buffer.from(first.nextCursor,'base64url').toString());assert.equal(raw.createdAt,'2026-10-20T09:00:00.002300+09:00');assert.equal(first.onlineComments[0].createdAt,'2026-10-20T00:00:00.002Z');
 for(const patch of [{createdAt:'2026-02-30T00:00:00.000000Z'},{createdAt:'2026-10-20T00:00:00.000000+14:01'},{createdAt:'2026-10-20T00:00:00.0000001Z'},{createdAt:'2026-10-20T00:00:00.002Z'},{companyKey:'other-company'},{sourceCommentKey:'other-scope'}]){const cursor=Buffer.from(JSON.stringify({...raw,...patch})).toString('base64url');await assert.rejects(()=>handler(new Request(origin+'/api/partner-comments?companyKey='+key+'&cursor='+cursor)),e=>e.status===422&&e.code==='INVALID_COMMENT_CURSOR');}assert.equal(listCalls,1);
});

await check('요청중단 시 읽기타이머 정리·본문취소·DB 접근0',async()=>{
 let authenticated=0,cancelled=false;const controller=new AbortController(),handler=createPartnerCommentsHandler({origin,readTimeoutMs:1000,withTransaction:async()=>{authenticated++;throw Error('DB must not be called');}}),stream=new ReadableStream({pull(){return new Promise(()=>{});},cancel(){cancelled=true;return Promise.reject(Error('cancel rejected'));}}),request=new Request(origin+'/api/partner-comments',{method:'POST',headers:{origin,'content-type':'application/json'},signal:controller.signal,body:stream,duplex:'half'}),promise=handler(request);controller.abort();await assert.rejects(()=>promise,e=>e.status===408);assert.equal(authenticated,0);assert.equal(cancelled,true);
});

await check('공식 rewrite와 직접 댓글주소 모두 동일 action·query·body 유지',async()=>{
 const calls=[],router=createReferenceRouter(async(request,action)=>{calls.push({action,url:new URL(request.url),body:request.method==='POST'?await request.json():null});return new Response('ok');}),body={companyKey:key,requestId:'qa-independent-request',text:'원문',cooperative:false,projectText:''};
 for(const path of ['/api/partner-comments','/api/reference-data?__reference_route=comments'])await router(new Request(origin+path,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}));assert.equal(calls.length,2);assert(calls.every(c=>c.action==='partnerComments'&&!c.url.searchParams.has('__reference_route')));assert.deepEqual(calls.map(c=>c.body),[body,body]);
 const response=await router(new Request(origin+'/api/reference-data?__reference_route=comments&__reference_route=reference'));assert.equal(response.status,400);assert.equal(calls.length,2);
});

const pins=Object.fromEntries(files.map(p=>[p,hash(p)])),changedDuringRun=files.filter(p=>before[p]!==pins[p]);console.log(JSON.stringify({suite:'center120-partner-comments-independent',checks,passed:checks.filter(c=>c.status==='passed').length,failed:checks.filter(c=>c.status==='failed').length,pins,changedDuringRun,realDatabase:false,privateData:false}));if(checks.some(c=>c.status==='failed')||changedDuringRun.length)process.exitCode=1;
