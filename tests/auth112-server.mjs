import assert from 'node:assert/strict';
import {betterAuth} from 'better-auth';
import {emailOTP} from 'better-auth/plugins/email-otp';
import {memoryAdapter} from 'better-auth/adapters/memory';
import {createEmailAuth,readAuthConfiguration,AuthUnavailableError} from '../server/email-auth.mjs';

const origin='https://auth112.example.invalid',secret='synthetic-auth112-secret-more-than-thirty-two-characters';
const allowedEmails=Array.from({length:12},(_,i)=>`approved${i+1}@igisam.com`),email=allowedEmails[0],password='synthetic-password-112';
const environment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:secret,DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop',DP_ALLOWED_EMAILS:JSON.stringify(allowedEmails)});
const emptyDatabase=()=>({app_user:[],app_account:[],app_session:[],app_verification:[],app_rate_limit:[]});
const cookie=response=>response.headers.getSetCookie().map(value=>value.split(';',1)[0]).join('; ');
function fixture({database=emptyDatabase(),allowlist=allowedEmails,sender,adapterFactory}={}){
 const sent=[],base=memoryAdapter(database),adapter=adapterFactory?adapterFactory(base,database):base;
 const service=createEmailAuth({betterAuth,emailOTP,database:adapter,secret,origin,allowedEmails:allowlist,sendEmail:async item=>{sent.push(item);if(sender)return sender(item);return{accepted:true}}});let sequence=1;
 const request=(action,body=null,{method=action==='session'?'GET':'POST',cookies='',requestOrigin=origin,ip}={})=>{const headers=new Headers({'x-forwarded-for':ip||`192.0.2.${sequence++}`});if(requestOrigin!==null)headers.set('origin',requestOrigin);if(body!==null)headers.set('content-type','application/json');if(cookies)headers.set('cookie',cookies);return service.handle(new Request(origin+'/api/auth-'+action,{method,headers,...(body!==null?{body:JSON.stringify(body)}:{})}),action)};
 return{database,sent,service,request};
}
async function enroll(app,{address=email,value=password}={}){assert.equal((await app.request('code',{email:address})).status,202);const response=await app.request('verify',{email:address,code:app.sent.at(-1).otp,password:value});assert.equal(response.status,200);return{response,body:await response.clone().json(),cookie:cookie(response)}}
const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:'독립 기대값과 현재 동작 불일치'});console.error('FAIL '+name)}}

await check('AUTH112-01 미설정·빈값·중복·외부주소allowlist는failclosed',()=>{
 for(const value of [undefined,'','[]','approved1@igisam.com,',JSON.stringify([email,email.toUpperCase()]),JSON.stringify([email,'x@other.invalid']),'{"email":"x"}']){const env=environment();if(value===undefined)delete env.DP_ALLOWED_EMAILS;else env.DP_ALLOWED_EMAILS=value;assert.throws(()=>readAuthConfiguration(env),AuthUnavailableError)}
});
await check('AUTH112-02 JSON·콤마명단정규화와서버전용DI',()=>{
 const config=readAuthConfiguration(environment());assert.deepEqual(config.allowedEmails,allowedEmails);assert.deepEqual(readAuthConfiguration({...environment(),DP_ALLOWED_EMAILS:allowedEmails.map(v=>' '+v.toUpperCase()+' ').join(',')}).allowedEmails,allowedEmails);
});
await check('AUTH112-03 목록밖회사주소는직접API403·메일·가입·세션0',async()=>{
 const app=fixture();for(const action of ['code','verify','login']){const body={email:'not-approved@igisam.com',...(action==='verify'?{code:'123456',password}:action==='login'?{password}:{})},response=await app.request(action,body);assert.equal(response.status,403);assert.equal((await response.json()).error,'EMAIL_NOT_ALLOWED');assert.equal(response.headers.get('set-cookie'),null)}assert.equal(app.sent.length,0);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_account.length,0);assert.equal(app.database.app_session.length,0);assert.equal(app.database.app_verification.length,0);
});
await check('AUTH112-04 이메일요청만으로회원·비밀번호·세션을만들지않음',async()=>{
 const app=fixture(),response=await app.request('code',{email});assert.equal(response.status,202);assert.deepEqual(await response.json(),{sent:true});assert.equal(app.sent.length,1);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_account.length,0);assert.equal(app.database.app_session.length,0);assert.equal(app.database.app_verification.length,1);assert(!app.database.app_verification[0].value.includes(app.sent[0].otp));
});
await check('AUTH112-05 OTP만으로로그인하거나비밀번호없이가입할수없음',async()=>{
 const app=fixture();await app.request('code',{email});const response=await app.request('verify',{email,code:app.sent[0].otp});assert.equal(response.status,400);assert.equal((await response.json()).error,'INVALID_PASSWORD');assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_account.length,0);assert.equal(app.database.app_session.length,0);
});
await check('AUTH112-06 11·129자거부는OTP미소모·평문없는필드오류',async()=>{
 const app=fixture();await app.request('code',{email});const code=app.sent[0].otp;for(const value of ['x'.repeat(11),'x'.repeat(129)]){const response=await app.request('verify',{email,code,password:value}),body=await response.json();assert.equal(response.status,400);assert.equal(body.error,'INVALID_PASSWORD');assert.deepEqual(body.fieldErrors,[{field:'password',code:'PASSWORD_LENGTH'}]);assert(!JSON.stringify(body).includes(value));assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0)}assert.equal((await app.request('verify',{email,code,password:'x'.repeat(12)})).status,200);
});
await check('AUTH112-07 올바른OTP와비밀번호로만최초가입·해시·보안쿠키',async()=>{
 const app=fixture(),result=await enroll(app);assert.equal(result.body.authenticated,true);assert.equal(result.body.newAccountCreated,true);assert.equal(result.body.email,email);assert.equal(app.database.app_user.length,1);assert.equal(app.database.app_user[0].emailVerified,true);assert.equal(app.database.app_user[0].name,'');assert.equal(app.database.app_user[0].image,null);assert.equal(app.database.app_account.length,1);const credential=app.database.app_account[0];assert.equal(credential.providerId,'credential');assert.equal(credential.userId,result.body.userId);assert.equal(credential.accountId,result.body.userId);assert(credential.password&&credential.password!==password);assert(!JSON.stringify(result.body).includes(password));assert(!Object.keys(result.body).some(k=>/token|password/i.test(k)));assert.match(result.response.headers.get('set-cookie'),/HttpOnly/);assert.match(result.response.headers.get('set-cookie'),/Secure/);assert.match(result.response.headers.get('set-cookie'),/SameSite=Strict/);
});
await check('AUTH112-08 이후비밀번호로그인만으로동일user·SMTP0',async()=>{
 const app=fixture(),first=await enroll(app),count=app.sent.length,response=await app.request('login',{email,password}),body=await response.json();assert.equal(response.status,200);assert.equal(body.authenticated,true);assert.equal(body.userId,first.body.userId);assert.equal(body.newAccountCreated,false);assert(cookie(response));assert.equal(app.sent.length,count);assert.equal(app.database.app_user.length,1);assert.equal(app.database.app_account.length,1);
});
await check('AUTH112-09 틀린비밀번호와미가입은동일401·메일0',async()=>{
 const app=fixture();await enroll(app);const count=app.sent.length;for(const body of [{email,password:'wrong-password-112'},{email:allowedEmails[1],password}]){const response=await app.request('login',body);assert.equal(response.status,401);assert.equal((await response.json()).error,'INVALID_CREDENTIALS');assert.equal(response.headers.get('set-cookie'),null)}assert.equal(app.sent.length,count);
});
await check('AUTH112-10 기존비밀번호계정의OTP재설정·우회로그인은409',async()=>{
 const app=fixture();await enroll(app);const before=structuredClone(app.database),count=app.sent.length;for(const [action,body]of [['code',{email}],['verify',{email,code:'123456',password:'replacement-password-112'}]]){const response=await app.request(action,body);assert.equal(response.status,409);assert.equal((await response.json()).error,'PASSWORD_ALREADY_SET');assert.equal(response.headers.get('set-cookie'),null)}assert.equal(app.sent.length,count);assert.deepEqual(app.database.app_account,before.app_account);assert.deepEqual(app.database.app_session,before.app_session);assert.equal((await app.request('login',{email,password})).status,200);
});
await check('AUTH112-11 기존OTP회원의ID·기존세션·프로필보존후최초설정',async()=>{
 const database=emptyDatabase(),now=new Date();database.app_user.push({id:'LEGACY-USER',email,name:'',image:null,emailVerified:true,createdAt:now,updatedAt:now});database.app_session.push({id:'LEGACY-SESSION',userId:'LEGACY-USER',token:'synthetic-prior-token',expiresAt:new Date(Date.now()+100000),createdAt:now,updatedAt:now});const prior=structuredClone(database.app_session),app=fixture({database}),result=await enroll(app);assert.equal(result.body.userId,'LEGACY-USER');assert.equal(result.body.newAccountCreated,false);assert.equal(database.app_user.length,1);assert.deepEqual(database.app_session.find(row=>row.id==='LEGACY-SESSION'),prior[0]);assert.equal(database.app_account[0].userId,'LEGACY-USER');
});
await check('AUTH112-12 기존빈credential행은그ID로설정하고계정을복제하지않음',async()=>{
 const database=emptyDatabase(),now=new Date();database.app_user.push({id:'LEGACY-USER',email,name:'',image:null,emailVerified:true,createdAt:now,updatedAt:now});database.app_account.push({id:'LEGACY-CREDENTIAL',accountId:'LEGACY-USER',providerId:'credential',userId:'LEGACY-USER',password:null,createdAt:now,updatedAt:now});const app=fixture({database});await enroll(app);assert.equal(database.app_account.length,1);assert.equal(database.app_account[0].id,'LEGACY-CREDENTIAL');assert(database.app_account[0].password);assert.equal((await app.request('login',{email,password})).status,200);
});
await check('AUTH112-13 현allowlist에서제외한기존세션은403·로그아웃은허용',async()=>{
 const app=fixture(),first=await enroll(app),restricted=fixture({database:app.database,allowlist:allowedEmails.slice(1)}),denied=await restricted.request('session',null,{cookies:first.cookie});assert.equal(denied.status,403);assert.equal((await denied.json()).error,'EMAIL_NOT_ALLOWED');assert.equal(denied.headers.get('set-cookie'),null);const logout=await restricted.request('session',null,{method:'DELETE',cookies:first.cookie});assert.equal(logout.status,200);assert.equal((await logout.json()).authenticated,false);assert.equal((await (await app.request('session',null,{cookies:first.cookie})).json()).authenticated,false);
});
await check('AUTH112-14 비밀번호공백을trim하지않고128자·조합없는암호허용',async()=>{
 for(const value of ['x'.repeat(128),'  twelve spaces value  ','가'.repeat(12)]){const app=fixture();await enroll(app,{value});assert.equal((await app.request('login',{email,password:value})).status,200);if(value!==value.trim())assert.equal((await app.request('login',{email,password:value.trim()})).status,401)}
});
await check('AUTH112-15 잘못된OTP·만료·재사용은비밀번호·새세션0',async()=>{
 const app=fixture();await app.request('code',{email});const code=app.sent[0].otp,wrong=(code[0]==='9'?'8':'9')+code.slice(1),bad=await app.request('verify',{email,code:wrong,password});assert.notEqual(bad.status,200);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_account.length,0);assert.equal(app.database.app_session.length,0);app.database.app_verification[0].expiresAt=new Date(Date.now()-1000);assert.notEqual((await app.request('verify',{email,code,password})).status,200);assert.equal(app.database.app_account.length,0);
});
await check('AUTH112-16 CSRF·권한위조·과도한본문은가입이나메일전무변경거부',async()=>{
 const app=fixture();for(const action of ['code','verify','login']){const body={email,...(action==='verify'?{code:'123456',password}:action==='login'?{password}:{})};assert.equal((await app.request(action,body,{requestOrigin:'https://attacker.invalid'})).status,403);assert.equal((await app.request(action,{...body,isAdmin:true})).status,400)}assert.equal((await app.request('verify',{email,code:'123456',password:'x'.repeat(5000)})).status,413);assert.equal(app.sent.length,0);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_session.length,0);
});
const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'auth112-server',passed:checks.length-failed.length,failed:failed.length,total:checks.length,realEmailSent:false,realDatabaseUsed:false,externalRequests:0,postgresAtomicityVerified:false,checks}));if(failed.length)process.exitCode=1;
