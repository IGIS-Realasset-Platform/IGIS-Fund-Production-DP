import assert from 'node:assert/strict';
import {betterAuth} from 'better-auth';
import {emailOTP} from 'better-auth/plugins/email-otp';
import {memoryAdapter} from 'better-auth/adapters/memory';
import {createEmailAuth} from '../server/email-auth.mjs';
import {createAuthRuntime} from '../server/email-auth-runtime.mjs';

const origin='https://auth112-runtime.example.invalid',email='synthetic.member@igisam.com',password='synthetic-password-112';
const environment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:'synthetic-runtime-secret-thirty-two-characters-plus',DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop',DP_ALLOWED_EMAILS:JSON.stringify([email]),DP_INITIAL_ADMIN_EMAIL:email});
const cookie=response=>response.headers.getSetCookie().map(value=>value.split(';',1)[0]).join('; '),clone=value=>structuredClone(value);
function fixture(){
 const database={app_user:[],app_account:[],app_session:[],app_verification:[],app_rate_limit:[],admins:[]},sent=[],state={failAt:'',failureMarker:'',queries:[],commits:0,rollbacks:0,releases:0,holdCommit:false,releaseCommit:null,mismatchedIdentity:false},restore=value=>{for(const key of Object.keys(database))database[key]=clone(value[key])};let before;
 const client={query:async(sql,params=[])=>{
  const text=String(sql);state.queries.push(text);
  if(text==='BEGIN'){before=clone(database);return{rows:[]}}
  if(text==='COMMIT'){if(state.holdCommit)await new Promise(resolve=>{state.releaseCommit=resolve});if(state.failAt==='commit')throw Error('synthetic commit failure');state.commits++;return{rows:[]}}
  if(text==='ROLLBACK'){if(before)restore(before);state.rollbacks++;return{rows:[]}}
  if(text.startsWith('SELECT EXISTS('))return{rows:[{throttled:false}]};
  if(text.startsWith('INSERT INTO development_project_platform.platform_admins')){if(state.failAt==='admin')throw Error('synthetic admin failure');if(!database.admins.includes(params[0]))database.admins.push(params[0]);return{rows:[],rowCount:1}}
  if(text.startsWith('SET LOCAL')||text.startsWith('SELECT pg_advisory_xact_lock'))return{rows:[]};
  throw Error('Unexpected synthetic SQL');
 },release(){state.releases++}};
 class FakeDialect{constructor(options){this.options=options}}
 const loadDrivers=async()=>({betterAuth,emailOTP,PostgresDialect:FakeDialect,pool:{connect:async()=>client}});
 const createService=options=>{
  const base=memoryAdapter(database),adapter=async config=>{const wrapped=await base(config);return new Proxy(wrapped,{get(target,property){if(property==='create')return async input=>{if(state.failAt===input.model)throw Error(state.failureMarker||'synthetic model failure');return target.create(input)};const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value}})};
  const service=createEmailAuth({...options,database:adapter}),original=service.auth.handler;
  service.auth.handler=async request=>state.mismatchedIdentity&&new URL(request.url).pathname.endsWith('/get-session')?Response.json({user:{id:'WRONG-USER',email,emailVerified:true},session:{expiresAt:new Date(Date.now()+10000)}}):original(request);
  return service;
 };
 const run=createAuthRuntime({environment,loadDrivers,createService,senderFactory:async()=>async item=>{sent.push(item);return{accepted:true}}});let sequence=20;
 const request=(action,body=null,{method=action==='session'?'GET':'POST',cookies='',ip}={})=>{const headers=new Headers({origin,'x-forwarded-for':ip||`192.0.2.${sequence++}`});if(body!==null)headers.set('content-type','application/json');if(cookies)headers.set('cookie',cookies);return run(new Request(origin+'/api/auth-'+action,{method,headers,...(body!==null?{body:JSON.stringify(body)}:{})}),action)};
 return{database,sent,state,request};
}
async function start(app){assert.equal((await app.request('code',{email})).status,202);return app.sent.at(-1).otp}
async function enroll(app){const code=await start(app),response=await app.request('verify',{email,code,password});assert.equal(response.status,200);return response}
const checks=[];async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:'독립 기대값과 현재 동작 불일치'});console.error('FAIL '+name)}}

await check('AUTH112-RUNTIME-01 새가입성공은OTP·credential·session·초기관리자한번COMMIT',async()=>{
 const app=fixture(),response=await enroll(app),identity=await response.json();assert.equal(identity.authenticated,true);assert.equal(app.database.app_user.length,1);assert.equal(app.database.app_account.length,1);assert.equal(app.database.app_session.length,1);assert.deepEqual(app.database.admins,[identity.userId]);assert.equal(app.state.commits,2);assert.equal(app.state.rollbacks,0);assert.equal(app.state.releases,2);assert(cookie(response));
});
await check('AUTH112-RUNTIME-02 비밀번호저장실패면OTP·회원·세션·관리자모두원복',async()=>{
 const app=fixture(),code=await start(app),before=clone(app.database);app.state.failAt='account';const response=await app.request('verify',{email,code,password});assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual(app.database,before);assert.equal(app.state.rollbacks,1);assert.equal(app.state.commits,1);
});
await check('AUTH112-RUNTIME-03 세션생성실패도등록중간값없이원복',async()=>{
 const app=fixture(),code=await start(app),before=clone(app.database);app.state.failAt='session';const response=await app.request('verify',{email,code,password});assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual(app.database,before);assert.equal(app.state.rollbacks,1);
});
await check('AUTH112-RUNTIME-04 관리자bootstrap쓰기실패도인증전체원복',async()=>{
 const app=fixture(),code=await start(app),before=clone(app.database);app.state.failAt='admin';const response=await app.request('verify',{email,code,password});assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual(app.database,before);assert.equal(app.state.rollbacks,1);
});
await check('AUTH112-RUNTIME-05 COMMIT실패면성공쿠키·부분계정없이원복',async()=>{
 const app=fixture(),code=await start(app),before=clone(app.database);app.state.failAt='commit';const response=await app.request('verify',{email,code,password});assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual(app.database,before);assert.equal(app.state.rollbacks,1);
});
await check('AUTH112-RUNTIME-06 최종session신원불일치는credential·OTP·session원복',async()=>{
 const app=fixture(),code=await start(app),before=clone(app.database);app.state.mismatchedIdentity=true;const response=await app.request('verify',{email,code,password});assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual(app.database,before);
});
await check('AUTH112-RUNTIME-07 COMMIT완료전에성공응답을외부에반환하지않음',async()=>{
 const app=fixture(),code=await start(app);app.state.holdCommit=true;let settled=false;const pending=app.request('verify',{email,code,password}).then(value=>{settled=true;return value});for(let i=0;i<100&&!app.state.releaseCommit;i++)await new Promise(resolve=>setTimeout(resolve,10));assert.equal(typeof app.state.releaseCommit,'function');assert.equal(settled,false);app.state.releaseCommit();const response=await pending;assert.equal(response.status,200);assert(cookie(response));
});
await check('AUTH112-RUNTIME-08 재로그인은메일·계정복제0·동일관리자세션',async()=>{
 const app=fixture(),first=await enroll(app),identity=await first.json(),count=app.sent.length,response=await app.request('login',{email,password}),body=await response.json();assert.equal(response.status,200);assert.equal(body.userId,identity.userId);assert.equal(app.sent.length,count);assert.equal(app.database.app_account.length,1);assert.equal(app.database.app_user.length,1);assert.deepEqual(app.database.admins,[identity.userId]);
});
await check('AUTH112-RUNTIME-09 비밀번호실패시도는COMMIT·제한초과429와RetryAfter',async()=>{
 const app=fixture();await enroll(app);const count=app.sent.length,commits=app.state.commits;for(let i=0;i<5;i++)assert.equal((await app.request('login',{email,password:'wrong-password-112'},{ip:'192.0.2.200'})).status,401);const response=await app.request('login',{email,password},{ip:'192.0.2.200'});assert.equal(response.status,429);assert.equal((await response.json()).error,'TRY_LATER');assert.match(response.headers.get('retry-after')||'',/^\d+$/);assert.equal(app.state.commits,commits+6);assert.equal(app.sent.length,count);
});
await check('AUTH112-RUNTIME-10 DB오류가입력값을포함해도평문·OTP·메일로그0',async()=>{
 const app=fixture(),code=await start(app),logs=[],prior={error:console.error,warn:console.warn,log:console.log};app.state.failAt='session';app.state.failureMarker=password;for(const key of Object.keys(prior))console[key]=(...args)=>logs.push(args.map(String).join(' '));let response;try{response=await app.request('verify',{email,code,password})}finally{Object.assign(console,prior)}assert.equal(response.status,503);const serialized=logs.join('\n')+'\n'+await response.text();for(const value of [password,email,code])assert(!serialized.includes(value));assert.equal(response.headers.get('set-cookie'),null);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);
});
const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'auth112-runtime',passed:checks.length-failed.length,failed:failed.length,total:checks.length,nativeBetterAuthVersion:'1.7.8',outerTransactionStorage:'synthetic snapshot controlled by actual runtime BEGIN/COMMIT/ROLLBACK',realEmailSent:false,realDatabaseUsed:false,postgresAtomicityVerified:false,externalRequests:0,checks}));if(failed.length)process.exitCode=1;
