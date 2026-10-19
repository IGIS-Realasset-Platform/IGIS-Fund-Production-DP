import assert from 'node:assert/strict';
import {betterAuth} from 'better-auth';
import {emailOTP} from 'better-auth/plugins/email-otp';
import {memoryAdapter} from 'better-auth/adapters/memory';
import {createEmailAuth} from '../server/email-auth.mjs';

// 동일 밀리초 생성은 정상적인 저장 조건입니다. 날짜를 기다리거나 기대값을 완화하지 않고 조회의 동률을 고정합니다.
const origin='https://resend.example.invalid',email='synthetic.resend@igisam.com',otherEmail='synthetic.other@igisam.com',password='valid-pass-123';
function fixture({pendingFirst=false,database={app_user:[],app_account:[],app_session:[],app_verification:[],app_rate_limit:[]},counterStart=0,failedVerificationCreates=0}={}){
 const sent=[],fixedCreatedAt=new Date(),base=memoryAdapter(database);let counter=counterStart,rejectFirst,sendCalls=0;
 const adapter=options=>{const target=base(options);return new Proxy(target,{get(owner,property){if(property==='create')return async input=>{if(input.model==='verification'&&failedVerificationCreates-->0)throw Error('synthetic verification create failure');return owner.create(input.model==='verification'?{...input,data:{...input.data,createdAt:fixedCreatedAt}}:input)};const value=Reflect.get(owner,property,owner);return typeof value==='function'?value.bind(owner):value}})};
 const service=createEmailAuth({betterAuth,emailOTP:options=>emailOTP({...options,generateOTP:()=>String(700000+(++counter))}),database:adapter,secret:'synthetic-resend-secret-thirty-two-plus-characters',origin,allowedEmails:[email,otherEmail],sendEmail:item=>{sent.push(item);sendCalls++;if(pendingFirst&&sendCalls===1)return new Promise((resolve,reject)=>{rejectFirst=()=>reject(Error('synthetic first sender failure'))});return Promise.resolve({accepted:true})}});let ip=50;
 const request=(action,body)=>service.handle(new Request(origin+'/api/auth-'+action,{method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':`192.0.2.${ip++}`},body:JSON.stringify(body)}),action);
 const waitFirst=async()=>{for(let i=0;i<100&&!rejectFirst;i++)await new Promise(resolve=>setImmediate(resolve));assert.equal(typeof rejectFirst,'function')};
 return{database,sent,request,waitFirst,rejectFirst:()=>rejectFirst?.(),sendCalls:()=>sendCalls};
}
const checks=[];async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:'동일시각 발급의 독립 기대값과 현재 동작 불일치'});console.error('FAIL '+name)}}

await check('AUTH112-RESEND-01 동일createdAt의순차재발급도두번째202·새OTP만유효',async()=>{
 const app=fixture();assert.equal((await app.request('code',{email})).status,202);const old=app.sent[0].otp;assert.equal((await app.request('code',{email})).status,202);assert.equal(app.sendCalls(),2);assert.notEqual(app.sent[1].otp,old);assert.notEqual((await app.request('verify',{email,code:old,password})).status,200);assert.equal((await app.request('verify',{email,code:app.sent[1].otp,password})).status,200);
});
await check('AUTH112-RESEND-02 구sender대기·동일시각새발급·구실패에도새검증성공',async()=>{
 const app=fixture({pendingFirst:true}),pending=app.request('code',{email});await app.waitFirst();const current=await app.request('code',{email});app.rejectFirst();const old=await pending;assert.equal(current.status,202);assert.equal(old.status,503);assert.equal(app.sendCalls(),2);assert.equal((await app.request('verify',{email,code:app.sent[1].otp,password})).status,200);
});
await check('AUTH112-RESEND-03 구sender실패는연속두번재발급한최종challenge를삭제하지않음',async()=>{
 const app=fixture({pendingFirst:true}),pending=app.request('code',{email});await app.waitFirst();const second=await app.request('code',{email}),third=await app.request('code',{email});app.rejectFirst();const first=await pending;assert.equal(second.status,202);assert.equal(third.status,202);assert.equal(first.status,503);assert.equal(app.sendCalls(),3);assert.notEqual((await app.request('verify',{email,code:app.sent[1].otp,password})).status,200);assert.equal((await app.request('verify',{email,code:app.sent[2].otp,password})).status,200);
});
await check('AUTH112-RESEND-04 회전·실패정리는다른이메일challenge를보존',async()=>{
 const app=fixture({pendingFirst:true}),pending=app.request('code',{email});await app.waitFirst();assert.equal((await app.request('code',{email:otherEmail})).status,202);const other=app.sent.find(item=>item.email===otherEmail).otp;assert.equal((await app.request('code',{email})).status,202);app.rejectFirst();assert.equal((await pending).status,503);assert.equal((await app.request('verify',{email:otherEmail,code:other,password})).status,200);assert.equal((await app.request('verify',{email,code:app.sent.findLast(item=>item.email===email).otp,password})).status,200);
});
await check('AUTH112-RESEND-05 같은시각세동시발급도구메일실패후최종번호만유효',async()=>{
 const app=fixture({pendingFirst:true}),pending=[app.request('code',{email}),app.request('code',{email}),app.request('code',{email})];await app.waitFirst();let second,third;try{second=await pending[1];third=await pending[2]}finally{app.rejectFirst()}const first=await pending[0];assert.equal(first.status,503);assert.equal(second.status,202);assert.equal(third.status,202);assert.equal(app.sendCalls(),3);assert.equal(app.database.app_verification.length,1);assert.notEqual((await app.request('verify',{email,code:app.sent[1].otp,password})).status,200);assert.equal((await app.request('verify',{email,code:app.sent[2].otp,password})).status,200);
});
await check('AUTH112-RESEND-06 생성실패후에도발급잠금이풀려다음요청성공',async()=>{
 const app=fixture({failedVerificationCreates:2});assert.equal((await app.request('code',{email})).status,503);assert.equal(app.sendCalls(),0);let timer;const response=await Promise.race([app.request('code',{email}),new Promise((resolve,reject)=>{timer=setTimeout(()=>reject(Error('issuance queue was not released')),1500)})]).finally(()=>clearTimeout(timer));assert.equal(response.status,202);assert.equal((await app.request('verify',{email,code:app.sent.at(-1).otp,password})).status,200);
});
await check('AUTH112-RESEND-07 같은저장소의별도서비스인스턴스도구정리로새번호를지우지않음',async()=>{
 const first=fixture({pendingFirst:true}),second=fixture({database:first.database,counterStart:10}),pending=first.request('code',{email});await first.waitFirst();const current=await second.request('code',{email});first.rejectFirst();assert.equal((await pending).status,503);assert.equal(current.status,202);assert.equal(first.database.app_verification.length,1);assert.equal((await second.request('verify',{email,code:second.sent[0].otp,password})).status,200);
});
const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'auth112-resend-race',passed:checks.length-failed.length,failed:failed.length,total:checks.length,condition:'all verification rows have the exact same millisecond createdAt; actual installed BetterAuth/memory adapter; distinct deterministic test OTPs; no time waiting',realEmailSent:false,realDatabaseUsed:false,externalRequests:0,rawCodeOrHashRecorded:false,checks}));if(failed.length)process.exitCode=1;
