import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {AUTH_LIMITS,brevoCodeSender,createEmailAuth,companyEmail} from '../server/email-auth.mjs';

const dependencyCandidates=[
  {kind:'public-root',file:path.resolve('package.json')},
  {kind:'private-development-fallback',file:path.resolve('.build/deployment-20261015/auth-development/package.json')}
];
let authRequire,dependencySource;
for(const candidate of dependencyCandidates){
  if(!fs.existsSync(candidate.file))continue;
  const resolver=createRequire(pathToFileURL(candidate.file));
  try{for(const name of ['better-auth','better-auth/plugins/email-otp','better-auth/adapters/memory'])resolver.resolve(name);authRequire=resolver;dependencySource=candidate.kind;break}catch{}
}
if(!authRequire)throw Error('AUTH_TEST_PREPARATION: pinned Better Auth public entries are unavailable from the root package and approved development fallback');
async function publicImport(name){
  let entry;try{entry=authRequire.resolve(name)}catch{throw Error('AUTH_TEST_PREPARATION: public package entry is unavailable: '+name)}
  return import(pathToFileURL(entry).href);
}
const [{betterAuth},{emailOTP},{memoryAdapter}]=await Promise.all([
  publicImport('better-auth'),
  publicImport('better-auth/plugins/email-otp'),
  publicImport('better-auth/adapters/memory')
]);

const origin='https://platform.example.invalid';
const secret='isolated-synthetic-test-secret-more-than-32-characters';
const password='synthetic-regression-password';
const allowedEmails=['user','hash','expired','attempt','replay','resend','mailfail','dbfail','cookie','csrf','logout','meta','retired','delayed','concurrent','network'].map(value=>'qa.'+value+'@igisam.com');
const emptyDatabase=()=>({app_user:[],app_account:[],app_session:[],app_verification:[],app_rate_limit:[]});
const rowCounts=database=>Object.fromEntries(Object.entries(database).map(([key,value])=>[key,value.length]));
const safeBody=async response=>{try{return await response.clone().json()}catch{return null}};
const wrongCode=code=>(code[0]==='9'?'8':'9')+code.slice(1);
const sessionCookie=response=>(response.headers.get('set-cookie')||'').split(';')[0];

function fixture({sendEmail,adapterFactory}={}){
  const database=emptyDatabase(),sent=[],baseFactory=memoryAdapter(database),databaseFactory=adapterFactory?adapterFactory(baseFactory,database):baseFactory;
  const sender=sendEmail?(async item=>{sent.push(item);return sendEmail(item)}):(async item=>{sent.push(item);return{accepted:true}});
  const service=createEmailAuth({betterAuth,emailOTP,database:databaseFactory,secret,origin,allowedEmails,sendEmail:sender});
  let ipCounter=10;
  const request=(action,{method=action==='session'?'GET':'POST',body=null,cookie='',requestOrigin=origin,contentType='application/json',ip}={})=>{
    // AUTH112에서는 이 과거 OTP보호 회귀도 최초 비밀번호 설정 요청으로 실행합니다. 비밀번호 생략 차단은 auth112-server에서 별도로 검사합니다.
    if(action==='verify'&&body)body={password,...body};
    const headers=new Headers();
    if(requestOrigin!==null)headers.set('origin',requestOrigin);
    if(contentType!==null)headers.set('content-type',contentType);
    headers.set('x-forwarded-for',ip||`192.0.2.${ipCounter++}`);
    if(cookie)headers.set('cookie',cookie);
    return service.handle(new Request(origin+'/api/'+action,{method,headers,...(body===null?{}:{body:JSON.stringify(body)})}),action);
  };
  return {database,sent,service,request};
}

async function muted(run){
  const logs=[],oldError=console.error,oldWarn=console.warn;
  console.error=(...args)=>logs.push(args.map(String).join(' '));console.warn=(...args)=>logs.push(args.map(String).join(' '));
  try{return {value:await run(),logs}}finally{console.error=oldError;console.warn=oldWarn}
}

async function signIn(app,email='qa.user@igisam.com'){
  if(app.database.app_account.some(row=>row.password&&app.database.app_user.some(user=>user.id===row.userId&&user.email===email))){const verified=await app.request('login',{body:{email,password}});assert.equal(verified.status,200);return {verified,cookie:sessionCookie(verified),body:await verified.clone().json()};}
  const before=app.sent.length,sent=await app.request('code',{body:{email}});assert.equal(sent.status,202,'OTP request must be accepted');
  assert.equal(app.sent.length,before+1,'one new synthetic mail item');
  const otp=app.sent.at(-1).otp;assert(/^\d{6}$/.test(otp),'OTP must be six ASCII digits');
  const verified=await app.request('verify',{body:{email,code:otp}});assert.equal(verified.status,200,'synthetic OTP verification must succeed');
  return {verified,cookie:sessionCookie(verified),body:await verified.clone().json(),otp};
}

const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}

await check('CLOUD-AUTH-01 exact 회사도메인과 공백·대소문자 정규화',async()=>{
  assert.equal(companyEmail('  QA.User@IGISAM.COM  '),'qa.user@igisam.com');
  const app=fixture();for(const email of ['qa@eviligisam.com','qa@igisam.com.evil','qa@sub.igisam.com']){assert.throws(()=>companyEmail(email),/@igisam\.com/);const response=await app.request('code',{body:{email}}),body=await response.json();assert.equal(response.status,400);assert.equal(body.error,'INVALID_EMAIL_OR_FIELDS');assert.equal(response.headers.get('set-cookie'),null)}for(const [table,count]of Object.entries(rowCounts(app.database)))assert.equal(count,0,table);assert.equal(app.sent.length,0);
});

await check('CLOUD-AUTH-02 표준 local-part와 plus주소를 허용하고 형식오류를 거부',async()=>{
  assert.equal(companyEmail('qa.user+project@igisam.com'),'qa.user+project@igisam.com');
  for(const email of ['qa user@igisam.com','qa@@igisam.com','@igisam.com','qa@'])assert.throws(()=>companyEmail(email));
});

await check('CLOUD-AUTH-03 OTP는6자리이며 서버hash만 저장하고 확인전회원·세션0',async()=>{
  const app=fixture(),response=await app.request('code',{body:{email:'qa.hash@igisam.com'}}),body=await safeBody(response);
  assert.equal(response.status,202);assert.deepEqual(body,{sent:true});assert.equal(AUTH_LIMITS.codeLength,6);
  assert.equal(app.sent.length,1);assert(/^\d{6}$/.test(app.sent[0].otp),'OTP shape');
  assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);assert.equal(app.database.app_verification.length,1);
  assert(!String(app.database.app_verification[0].value).includes(app.sent[0].otp),'plaintext OTP must not be stored');
  assert(!JSON.stringify(body).includes(app.sent[0].otp),'OTP must not be returned');
});

await check('CLOUD-AUTH-04 만료된challenge는회원·세션없이 거부',async()=>{
  const app=fixture();await app.request('code',{body:{email:'qa.expired@igisam.com'}});app.database.app_verification[0].expiresAt=new Date(Date.now()-1000);
  const response=await app.request('verify',{body:{email:'qa.expired@igisam.com',code:app.sent[0].otp}});
  assert.notEqual(response.status,200);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);
});

await check('CLOUD-AUTH-05 허용시도초과 challenge는 뒤의정답도 거부',async()=>{
  const app=fixture();await app.request('code',{body:{email:'qa.attempt@igisam.com'}});const wrong=wrongCode(app.sent[0].otp);
  for(let index=0;index<AUTH_LIMITS.allowedAttempts;index++){const response=await app.request('verify',{body:{email:'qa.attempt@igisam.com',code:wrong}});assert.notEqual(response.status,200,'wrong attempt must fail')}
  const correct=await app.request('verify',{body:{email:'qa.attempt@igisam.com',code:app.sent[0].otp}});assert.notEqual(correct.status,200,'locked challenge must reject later correct code');
  assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);
});

await check('CLOUD-AUTH-06 성공challenge 재사용은회원·세션중복없이 거부',async()=>{
  const app=fixture(),login=await signIn(app,'qa.replay@igisam.com'),before=rowCounts(app.database);
  assert(login.cookie,'session cookie required');const replay=await app.request('verify',{body:{email:'qa.replay@igisam.com',code:app.sent[0].otp}});
  assert.notEqual(replay.status,200);assert.equal(app.database.app_user.length,before.app_user);assert.equal(app.database.app_session.length,before.app_session);
});

await check('CLOUD-AUTH-07 재전송은이전challenge를폐기하고 새challenge만허용',async()=>{
  const app=fixture();await app.request('code',{body:{email:'qa.resend@igisam.com'},ip:'192.0.2.101'});const oldCode=app.sent[0].otp,oldHash=String(app.database.app_verification[0].value);
  await app.request('code',{body:{email:'qa.resend@igisam.com'},ip:'192.0.2.102'});assert.equal(app.sent.length,2);const newCode=app.sent[1].otp,newHash=String(app.database.app_verification.at(-1).value);
  assert(oldHash!==newHash,'resend must rotate the stored verifier');const oldResult=await app.request('verify',{body:{email:'qa.resend@igisam.com',code:oldCode},ip:'192.0.2.103'});assert.notEqual(oldResult.status,200);
  const currentResult=await app.request('verify',{body:{email:'qa.resend@igisam.com',code:newCode},ip:'192.0.2.104'});assert.equal(currentResult.status,200);
});

await check('CLOUD-AUTH-08 메일실패는전송성공·challenge·회원·세션을남기지않는다',async()=>{
  const app=fixture({sendEmail:async()=>{throw Error('synthetic mail failure')}}),result=await muted(()=>app.request('code',{body:{email:'qa.mailfail@igisam.com'}})),response=result.value;
  assert.equal(response.status,503,'mail failure must be reported as unavailable');assert.equal(app.database.app_verification.length,0,'mail failure must not leave an active challenge');assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);
  const joined=result.logs.join('\n');assert(!joined.includes('qa.mailfail@igisam.com'));assert(!/\b\d{6}\b/.test(joined),'logs must not contain OTP');
});

await check('CLOUD-AUTH-09 DB회원생성실패는가입·세션·cookie0으로원복',async()=>{
  const result=await muted(async()=>{const app=fixture({adapterFactory:base=>async options=>{const adapter=await base(options);return new Proxy(adapter,{get(target,property){if(property==='create')return async input=>{if(input?.model==='user')throw Error('synthetic database failure');return target.create(input)};const value=Reflect.get(target,property,target);return typeof value==='function'?value.bind(target):value}})}});await app.request('code',{body:{email:'qa.dbfail@igisam.com'}});const response=await app.request('verify',{body:{email:'qa.dbfail@igisam.com',code:app.sent[0].otp}});return{app,response}}),{app,response}=result.value;
  assert.equal(response.status,503);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_account.length,0);assert.equal(app.database.app_session.length,0);assert.equal(response.headers.get('set-cookie'),null);
  const joined=result.logs.join('\n');assert(!joined.includes('qa.dbfail@igisam.com'));assert(!joined.includes(app.sent[0].otp));
});

await check('CLOUD-AUTH-10 session cookie와응답은HttpOnly·Secure·Strict이고token을노출하지않는다',async()=>{
  const app=fixture(),first=await signIn(app,'qa.cookie@igisam.com'),{verified,cookie,body}=first,header=verified.headers.get('set-cookie')||'';
  assert(cookie);assert(/HttpOnly/i.test(header));assert(/Secure/i.test(header));assert(/SameSite=Strict/i.test(header));assert(/Max-Age=|Expires=/i.test(header));
  assert.deepEqual(Object.keys(body).sort(),['authenticated','email','expiresAt','newAccountCreated','userId']);assert.equal(typeof body.userId,'string');assert(body.userId.length>0);assert.equal(body.newAccountCreated,true);assert(!JSON.stringify(body).toLowerCase().includes('token'));
  assert.equal(app.database.app_user.length,1);assert.equal(app.database.app_user[0].name,'');assert.equal(app.database.app_user[0].image,null);
  const second=await signIn(app,'qa.cookie@igisam.com');assert.equal(second.body.userId,body.userId);assert.equal(second.body.newAccountCreated,false);assert.equal(app.database.app_user.length,1,'subsequent login must not duplicate user');
});

await check('CLOUD-AUTH-11 same-origin만변경요청을허용하고cross-origin은무변경403',async()=>{
  const app=fixture(),before=JSON.stringify(rowCounts(app.database));const cross=await app.request('code',{body:{email:'qa.csrf@igisam.com'},requestOrigin:'https://attacker.example.invalid'});assert.equal(cross.status,403);assert.equal(JSON.stringify(rowCounts(app.database)),before);
  const missing=await app.request('code',{body:{email:'qa.csrf@igisam.com'},requestOrigin:null});assert.equal(missing.status,403);assert.equal(JSON.stringify(rowCounts(app.database)),before);
  const same=await app.request('code',{body:{email:'qa.csrf@igisam.com'}});assert.equal(same.status,202);
});

await check('CLOUD-AUTH-12 logout후기존cookie의보호session은거부',async()=>{
  const app=fixture(),{cookie}=await signIn(app,'qa.logout@igisam.com');const active=await app.request('session',{method:'GET',body:null,cookie});assert.equal((await active.json()).authenticated,true);
  const logout=await app.request('session',{method:'DELETE',body:null,cookie});assert.equal(logout.status,200);assert.equal((await logout.json()).authenticated,false);
  const replay=await app.request('session',{method:'GET',body:null,cookie});assert.equal((await replay.json()).authenticated,false);
});

await check('CLOUD-AUTH-13 role·project·admin·verified 클라이언트주장은가입권한이아니며거부',async()=>{
  const app=fixture(),response=await app.request('code',{body:{email:'qa.meta@igisam.com',role:'admin',projectIds:['OTHER-PROJECT'],isAdmin:true,verified:true}});
  assert.equal(response.status,400);assert.equal(app.sent.length,0);assert.equal(app.database.app_verification.length,0);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);
});

await check('CLOUD-AUTH-14 SupabaseAuth·공통코드는비활성·비밀번호는검증후설정·extra거부',async()=>{
  const source=fs.readFileSync('server/email-auth.mjs','utf8');assert(source.includes('emailAndPassword:{enabled:true,disableSignUp:true,requireEmailVerification:true'));assert(source.includes('socialProviders:{}'));assert(!/from\s+['"]@supabase\/|from\s+['"]supabase/.test(source));
  const app=fixture();for(const extra of [{password:'synthetic'},{commonCode:'000000'}]){const response=await app.request('code',{body:{email:'qa.retired@igisam.com',...extra}});assert.equal(response.status,400)}
  assert.equal(app.sent.length,0);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);
});

await check('CLOUD-AUTH-15 지연sender가접수되기전에는202를반환하지않고접수뒤에만성공',async()=>{
  let accept,settled=false;const app=fixture({sendEmail:()=>new Promise(resolve=>{accept=()=>resolve({accepted:true})})}),pending=app.request('code',{body:{email:'qa.delayed@igisam.com'}}).then(response=>{settled=true;return response});
  for(let index=0;index<20&&!accept;index++)await new Promise(resolve=>setImmediate(resolve));assert.equal(typeof accept,'function','sender invocation must begin');
  await new Promise(resolve=>setImmediate(resolve));assert.equal(settled,false,'request must remain pending until provider acceptance');
  accept();const response=await pending;assert.equal(response.status,202);assert.equal((await response.json()).sent,true);assert.equal(app.database.app_verification.length,1);
});

await check('CLOUD-AUTH-16 구sender실패와새challenge성공이겹쳐도새challenge를삭제하지않는다',async()=>{
  let rejectOld,calls=0;const app=fixture({sendEmail:item=>{calls++;if(calls===1)return new Promise((resolve,reject)=>{rejectOld=()=>reject(Error('synthetic old delivery failure'))});return Promise.resolve({accepted:true})}});
  const oldPending=app.request('code',{body:{email:'qa.concurrent@igisam.com'},ip:'192.0.2.151'});for(let index=0;index<20&&!rejectOld;index++)await new Promise(resolve=>setImmediate(resolve));assert.equal(typeof rejectOld,'function');
  const currentResponse=await app.request('code',{body:{email:'qa.concurrent@igisam.com'},ip:'192.0.2.152'});assert.equal(currentResponse.status,202);assert.equal(app.sent.length,2);const currentCode=app.sent[1].otp,currentRecord=app.database.app_verification.at(-1),currentId=currentRecord?.id,currentValue=currentRecord?.value;assert(currentId&&currentValue,'new challenge record required');
  rejectOld();const oldResponse=await oldPending;assert.equal(oldResponse.status,503);assert(app.database.app_verification.some(row=>row.id===currentId&&row.value===currentValue),'old failed sender must not delete new challenge');
  const verified=await app.request('verify',{body:{email:'qa.concurrent@igisam.com',code:currentCode},ip:'192.0.2.153'});assert.equal(verified.status,200,'new challenge remains usable');
});

await check('CLOUD-AUTH-17 메일네트워크예외는raw코드·key로그없이generic503',async()=>{
  const privateKeyMarker='synthetic-private-key-marker',rawNetworkMarker='synthetic-network-exception-marker',provider=brevoCodeSender({mailKey:privateKeyMarker,mailFrom:'no-reply@example.invalid'},async()=>{throw Error(rawNetworkMarker)}),app=fixture({sendEmail:provider}),result=await muted(()=>app.request('code',{body:{email:'qa.network@igisam.com'}})),response=result.value,body=await response.clone().text(),logs=result.logs.join('\n');
  assert.equal(response.status,503);assert.equal((await response.json()).error,'AUTH_UNAVAILABLE');assert(!body.includes(privateKeyMarker));assert(!body.includes(rawNetworkMarker));assert(!logs.includes(privateKeyMarker));assert(!logs.includes(rawNetworkMarker));assert(!logs.includes('qa.network@igisam.com'));assert(!/\b\d{6}\b/.test(logs));assert.equal(app.database.app_verification.length,0);
});

const failed=checks.filter(row=>row.status==='failed');
console.log(JSON.stringify({suite:'cloud-auth',frameworkVersion:'1.7.8',dependencySource,passed:checks.length-failed.length,failed:failed.length,total:checks.length,realEmailSent:false,realDatabaseUsed:false,postgresAtomicityVerified:false,apiWrapperVerified:false,checks}));
if(failed.length)process.exitCode=1;

