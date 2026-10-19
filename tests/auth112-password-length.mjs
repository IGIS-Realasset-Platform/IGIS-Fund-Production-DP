import assert from 'node:assert/strict';
import {betterAuth} from 'better-auth';
import {emailOTP} from 'better-auth/plugins/email-otp';
import {memoryAdapter} from 'better-auth/adapters/memory';
import {hashPassword} from 'better-auth/crypto';
import {createEmailAuth} from '../server/email-auth.mjs';
import {PASSWORD_POLICY} from '../server/auth-policy.mjs';

// 2026-10-19 승인: 새 설정은 8..15, 과거 credential 로그인은 8..128. 구현 상수를 기대값으로 복사하지 않습니다.
const origin='https://password-length.example.invalid',email='synthetic.length@igisam.com',secret='synthetic-password-length-secret-more-than-32-characters';
const empty=()=>({app_user:[],app_account:[],app_session:[],app_verification:[],app_rate_limit:[]});
function fixture(database=empty()){
 const sent=[],service=createEmailAuth({betterAuth,emailOTP,database:memoryAdapter(database),origin,secret,allowedEmails:[email],sendEmail:async value=>{sent.push(value);return{accepted:true}}});let sequence=10;
 const request=(action,body)=>service.handle(new Request(origin+'/api/'+action,{method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':`192.0.2.${sequence++}`},body:JSON.stringify(body)}),action);
 return{database,sent,request};
}
async function code(app){assert.equal((await app.request('code',{email})).status,202);return app.sent.at(-1).otp}
async function legacy(password){const database=empty(),now=new Date();database.app_user.push({id:'LEGACY-USER',name:'',email,emailVerified:true,image:null,createdAt:now,updatedAt:now});database.app_account.push({id:'LEGACY-ACCOUNT',accountId:'LEGACY-USER',providerId:'credential',userId:'LEGACY-USER',password:await hashPassword(password),createdAt:now,updatedAt:now});database.app_session.push({id:'LEGACY-SESSION',userId:'LEGACY-USER',token:'synthetic-prior-session-token',expiresAt:new Date(Date.now()+60000),createdAt:now,updatedAt:now});return fixture(database)}
const checks=[];async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch{checks.push({name,status:'failed',error:'승인된 길이 경계·기존 계정 보존 기대값과 현재 동작 불일치'});console.error('FAIL '+name)}}

for(const [length,expected]of [[7,400],[8,200],[15,200],[16,400]])await check('PASSWORD-LENGTH-SIGNUP-'+length+' 신규설정경계',async()=>{
 const app=fixture(),otp=await code(app),value='a'.repeat(length),response=await app.request('verify',{email,code:otp,password:value}),body=await response.json();assert.equal(response.status,expected);if(expected===400){assert.equal(body.error,'INVALID_PASSWORD');assert.deepEqual(body.fieldErrors,[{field:'password',code:'PASSWORD_LENGTH'}]);assert.equal(app.database.app_user.length,0);assert.equal(app.database.app_account.length,0);assert.equal(app.database.app_session.length,0)}else{assert.equal(body.authenticated,true);assert.equal(app.database.app_account.length,1);assert.notEqual(app.database.app_account[0].password,value);assert.equal((await app.request('login',{email,password:value})).status,200)}
});
for(const length of [16,32,128])await check('PASSWORD-LENGTH-LEGACY-'+length+' 기존긴암호로그인·메일0·동일계정',async()=>{
 const password='L'.repeat(length),app=await legacy(password),accountBefore=structuredClone(app.database.app_account),priorSession=structuredClone(app.database.app_session[0]),response=await app.request('login',{email,password}),body=await response.json();assert.equal(response.status,200);assert.equal(body.userId,'LEGACY-USER');assert.equal(body.newAccountCreated,false);assert.equal(app.sent.length,0);assert.equal(app.database.app_user.length,1);assert.deepEqual(app.database.app_account,accountBefore);assert.deepEqual(app.database.app_session.find(x=>x.id==='LEGACY-SESSION'),priorSession);
});
await check('PASSWORD-LENGTH-08 로그인7·129자는입력차단·메일0',async()=>{
 const app=await legacy('legacy-password');for(const length of [7,129]){const response=await app.request('login',{email,password:'x'.repeat(length)});assert.equal(response.status,400);assert.equal((await response.json()).error,'INVALID_PASSWORD')}assert.equal(app.sent.length,0);assert.equal(app.database.app_session.length,1);
});
await check('PASSWORD-LENGTH-09 공백trim·조합강제추가없음',async()=>{
 const app=fixture(),otp=await code(app),password=' aaaaaaaa ';assert.equal((await app.request('verify',{email,code:otp,password})).status,200);assert.equal((await app.request('login',{email,password})).status,200);assert.equal((await app.request('login',{email,password:password.trim()})).status,401);
});
await check('PASSWORD-LENGTH-10 잘못된길이는OTP를소모하지않음',async()=>{
 const app=fixture(),otp=await code(app);for(const length of [7,16])assert.equal((await app.request('verify',{email,code:otp,password:'x'.repeat(length)})).status,400);assert.equal((await app.request('verify',{email,code:otp,password:'x'.repeat(8)})).status,200);
});
await check('PASSWORD-LENGTH-11 공개가입정책은8..15',()=>{assert.deepEqual(PASSWORD_POLICY,{minLength:8,maxLength:15})});
await check('PASSWORD-LENGTH-12 기존OTP전용계정은8자로최초설정·동일ID',async()=>{
 const database=empty(),now=new Date();database.app_user.push({id:'EXISTING-OTP-USER',email,name:'',image:null,emailVerified:true,createdAt:now,updatedAt:now});const app=fixture(database),otp=await code(app),response=await app.request('verify',{email,code:otp,password:'x'.repeat(8)}),body=await response.json();assert.equal(response.status,200);assert.equal(body.userId,'EXISTING-OTP-USER');assert.equal(body.newAccountCreated,false);assert.equal(database.app_user.length,1);assert.equal(database.app_account[0].userId,'EXISTING-OTP-USER');
});
const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'auth112-password-length',passed:checks.length-failed.length,failed:failed.length,total:checks.length,actualDatabaseUsed:false,actualEmailSent:false,secretFilesRead:false,legacyPasswordCurrentBehavior:'normal preservation check, not misreported as a pre-existing failure',checks}));if(failed.length)process.exitCode=1;
