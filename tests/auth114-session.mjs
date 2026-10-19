import assert from 'node:assert/strict';
import {betterAuth} from 'better-auth';
import {emailOTP} from 'better-auth/plugins/email-otp';
import {memoryAdapter} from 'better-auth/adapters/memory';
import {hashPassword} from 'better-auth/crypto';
import {createEmailAuth} from '../server/email-auth.mjs';
import {createAuthRuntime} from '../server/email-auth-runtime.mjs';

// AUTH114 independent expected seconds: optional/false 28800, true 604800. No implementation policy imports.
const origin='https://remember.example.invalid',email='synthetic.remember@igisam.com',other='synthetic.other@igisam.com',password='valid-pass-123',secret='synthetic-remember-secret-thirty-two-characters-plus',credentialHash=await hashPassword(password);
const empty=()=>({app_user:[],app_account:[],app_session:[],app_verification:[],app_rate_limit:[]});
function databaseWithCredential(){const db=empty(),now=new Date();db.app_user.push({id:'EXISTING-USER',name:'',email,emailVerified:true,image:null,createdAt:now,updatedAt:now});db.app_account.push({id:'EXISTING-CREDENTIAL',accountId:'EXISTING-USER',providerId:'credential',userId:'EXISTING-USER',password:credentialHash,createdAt:now,updatedAt:now});return db}
const tokenCookie=response=>response.headers.getSetCookie().find(value=>value.startsWith('__Secure-dpp.session_token='))||'',cookie=response=>tokenCookie(response).split(';',1)[0],maxAge=response=>Number(tokenCookie(response).match(/(?:^|;)\s*max-age=(\d+)/i)?.[1]);
function fixture({database=databaseWithCredential(),allowedEmails=[email,other]}={}){
 const sent=[],service=createEmailAuth({betterAuth,emailOTP,database:memoryAdapter(database),secret,origin,allowedEmails,sendEmail:async item=>{sent.push(item);return{accepted:true}}});let sequence=10;
 const request=(action,body=null,{method=action==='session'?'GET':'POST',cookies='',ip,requestOrigin=origin}={})=>service.handle(new Request(origin+'/api/'+action,{method,headers:{origin:requestOrigin,'content-type':'application/json','x-forwarded-for':ip||`192.0.2.${sequence++}`,...(cookies?{cookie:cookies}:{})},...(body!==null?{body:JSON.stringify(body)}:{})}),action);
 return{database,sent,request};
}
async function login(app,rememberMe){const body={email,password};if(rememberMe!==undefined)body.rememberMe=rememberMe;const response=await app.request('login',body);assert.equal(response.status,200);return response}
function duration(row){return(new Date(row.expiresAt)-new Date(row.createdAt))/1000}
function ttl(row,seconds){assert(Math.abs(duration(row)-seconds)<1,'DB session lifetime must equal approved seconds')}
const checks=[];async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch{checks.push({name,status:'failed',error:'승인된 선택형 세션 경계와 현재 동작 불일치'});console.error('FAIL '+name)}}

for(const [label,value,seconds]of [['omitted',undefined,28800],['false',false,28800],['true',true,604800]])await check('AUTH114-TTL-'+label+' DB·cookie고정기간',async()=>{
 const app=fixture(),response=await login(app,value),body=await response.json();ttl(app.database.app_session.at(-1),seconds);assert.equal(maxAge(response),seconds);assert.equal(body.userId,'EXISTING-USER');assert.equal(app.sent.length,0);assert.equal(app.database.app_user.length,1);assert.equal(app.database.app_account.length,1);assert.match(tokenCookie(response),/HttpOnly/i);assert.match(tokenCookie(response),/Secure/i);assert.match(tokenCookie(response),/SameSite=Strict/i);assert.doesNotMatch(tokenCookie(response),/(?:^|;)\s*Domain=/i);assert(!Object.keys(body).some(key=>/token|password/i.test(key)));
});
await check('AUTH114-04 malformedboolean은400·세션0',async()=>{
 const app=fixture();for(const rememberMe of ['true','false','',0,1,null,[],{},604800]){const response=await app.request('login',{email,password,rememberMe});assert.equal(response.status,400);assert.equal((await response.json()).error,'INVALID_REMEMBER_ME');assert.equal(response.headers.get('set-cookie'),null)}assert.equal(app.database.app_session.length,0);assert.equal(app.sent.length,0);
});
await check('AUTH114-05 임의기간·TTLfield위조는거부·서버상한7일',async()=>{
 const app=fixture();for(const extra of [{expiresIn:999999999},{days:365},{sessionExpiresIn:999999999},{rememberDays:365}]){const response=await app.request('login',{email,password,rememberMe:true,...extra});assert.equal(response.status,400);assert.equal(app.database.app_session.length,0)}const response=await login(app,true);ttl(app.database.app_session[0],604800);assert.equal(maxAge(response),604800);
});
await check('AUTH114-06 signup·verify에는rememberMe미허용·기본8시간',async()=>{
 const app=fixture({database:empty()});assert.equal((await app.request('code',{email,rememberMe:true})).status,400);assert.equal(app.sent.length,0);assert.equal((await app.request('code',{email})).status,202);const otp=app.sent[0].otp;assert.equal((await app.request('verify',{email,password,code:otp,rememberMe:true})).status,400);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);const response=await app.request('verify',{email,password,code:otp});assert.equal(response.status,200);ttl(app.database.app_session[0],28800);assert.equal(maxAge(response),28800);
});
await check('AUTH114-07 기존8h세션조회는저장expiry·cookie를연장하지않음',async()=>{
 const app=fixture(),response=await login(app),row=app.database.app_session[0];row.createdAt=new Date(Date.now()-7*3600000);row.expiresAt=new Date(Date.now()+3600000);const before=structuredClone(row),session=await app.request('session',null,{cookies:cookie(response)});assert.equal(session.status,200);assert.equal((await session.json()).authenticated,true);assert.deepEqual(app.database.app_session[0],before);assert.equal(tokenCookie(session),'');
});
await check('AUTH114-08 7d세션near-expiry조회도단축·연장0',async()=>{
 const app=fixture(),response=await login(app,true),row=app.database.app_session[0];row.createdAt=new Date(Date.now()-(7*24-1)*3600000);row.expiresAt=new Date(Date.now()+3600000);const before=structuredClone(row),session=await app.request('session',null,{cookies:cookie(response)});assert.equal((await session.json()).authenticated,true);assert.deepEqual(app.database.app_session[0],before);assert.equal(tokenCookie(session),'');
});
await check('AUTH114-09 만료7d세션은cookie있어도인증되지않음',async()=>{
 const app=fixture(),response=await login(app,true);app.database.app_session[0].expiresAt=new Date(Date.now()-1);const session=await app.request('session',null,{cookies:cookie(response)});assert.equal(session.status,200);assert.equal((await session.json()).authenticated,false);assert.equal(app.database.app_account[0].password,credentialHash);
});
await check('AUTH114-10 다음로그인선택만적용·기존세션expiry그대로',async()=>{
 const app=fixture();await login(app);const original=structuredClone(app.database.app_session[0]);await login(app,true);assert.deepEqual(app.database.app_session[0],original);ttl(app.database.app_session[1],604800);await login(app,false);assert.deepEqual(app.database.app_session[0],original);ttl(app.database.app_session[2],28800);
});
await check('AUTH114-11 유지세션logout은서버에서현재token회수',async()=>{
 const app=fixture(),response=await login(app,true),sessionCookie=cookie(response),logout=await app.request('session',null,{method:'DELETE',cookies:sessionCookie});assert.equal(logout.status,200);assert.equal((await logout.json()).authenticated,false);assert.equal(app.database.app_session.length,0);assert.equal((await(await app.request('session',null,{cookies:sessionCookie})).json()).authenticated,false);assert.equal(app.database.app_user.length,1);assert.equal(app.database.app_account.length,1);
});
await check('AUTH114-12 7d유지중에도allowlist회수즉시거부·logout허용',async()=>{
 const app=fixture(),response=await login(app,true),restricted=fixture({database:app.database,allowedEmails:[other]}),sessionCookie=cookie(response),denied=await restricted.request('session',null,{cookies:sessionCookie});assert.equal(denied.status,403);assert.equal((await denied.json()).error,'EMAIL_NOT_ALLOWED');assert.equal(denied.headers.get('set-cookie'),null);assert.equal((await restricted.request('session',null,{method:'DELETE',cookies:sessionCookie})).status,200);assert.equal(app.database.app_session.length,0);
});
await check('AUTH114-13 선택토글로로그인시도제한을우회하지못함',async()=>{
 const app=fixture();for(let index=0;index<5;index++){const response=await app.request('login',{email,password:'wrong-pass-123',rememberMe:index%2===0},{ip:'192.0.2.200'});assert.equal(response.status,401)}const limited=await app.request('login',{email,password,rememberMe:true},{ip:'192.0.2.200'});assert.equal(limited.status,429);assert.equal((await limited.json()).error,'TRY_LATER');assert.equal(app.database.app_session.length,0);assert.equal(app.sent.length,0);
});
await check('AUTH114-14 유지선택도CSRF·명단외로그인차단유지',async()=>{
 const app=fixture();assert.equal((await app.request('login',{email,password,rememberMe:true},{requestOrigin:'https://attacker.example.invalid'})).status,403);assert.equal((await app.request('login',{email:'unknown@igisam.com',password,rememberMe:true})).status,403);assert.equal(app.database.app_session.length,0);assert.equal(app.sent.length,0);
});

function runtimeFixture(){
 const database=databaseWithCredential(),state={failCommit:false,holdCommit:false,releaseCommit:null,commits:0,rollbacks:0},sent=[];let snapshot;
 const client={query:async sql=>{const text=String(sql);if(text==='BEGIN'){snapshot=structuredClone(database);return{rows:[]}}if(text==='COMMIT'){if(state.holdCommit)await new Promise(resolve=>{state.releaseCommit=resolve});if(state.failCommit)throw Error('synthetic commit failure');state.commits++;return{rows:[]}}if(text==='ROLLBACK'){for(const key of Object.keys(database))database[key]=structuredClone(snapshot[key]);state.rollbacks++;return{rows:[]}}if(text.startsWith('SET LOCAL'))return{rows:[]};throw Error('unexpected synthetic SQL')},release(){}};
 class FakeDialect{constructor(options){this.options=options}}
 const run=createAuthRuntime({environment:()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:secret,DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop',DP_ALLOWED_EMAILS:JSON.stringify([email])}),loadDrivers:async()=>({betterAuth,emailOTP,PostgresDialect:FakeDialect,pool:{connect:async()=>client}}),createService:options=>createEmailAuth({...options,database:memoryAdapter(database)}),senderFactory:async()=>async item=>{sent.push(item);return{accepted:true}}});
 const login=()=>run(new Request(origin+'/api/auth-login',{method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':'192.0.2.201'},body:JSON.stringify({email,password,rememberMe:true})}),'login');return{database,state,sent,login};
}
await check('AUTH114-15 7d로그인COMMIT실패는세션·쿠키없이원복',async()=>{
 const app=runtimeFixture(),before=structuredClone(app.database);app.state.failCommit=true;const response=await app.login();assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert.deepEqual(app.database,before);assert.equal(app.state.rollbacks,1);assert.equal(app.sent.length,0);
});
await check('AUTH114-16 7d성공cookie는COMMIT완료이후에만반환',async()=>{
 const app=runtimeFixture();app.state.holdCommit=true;let settled=false;const pending=app.login().then(response=>{settled=true;return response});for(let index=0;index<100&&!app.state.releaseCommit;index++)await new Promise(resolve=>setTimeout(resolve,10));assert.equal(typeof app.state.releaseCommit,'function');assert.equal(settled,false);app.state.releaseCommit();const response=await pending;assert.equal(response.status,200);ttl(app.database.app_session[0],604800);assert.equal(maxAge(response),604800);assert.equal(app.sent.length,0);
});
const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'auth114-session',passed:checks.length-failed.length,failed:failed.length,total:checks.length,nativeBetterAuthVersion:'1.7.8',actualDatabaseUsed:false,actualEmailSent:false,actualApiUsed:false,secretFilesRead:false,postgresAtomicityVerified:false,checks}));if(failed.length)process.exitCode=1;
