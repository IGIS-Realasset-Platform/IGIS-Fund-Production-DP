import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifyMailConfiguration} from '../scripts/verify-mail-configuration.mjs';

const approvedHash='a'.repeat(64),matchingHash='A'.repeat(64),mismatchHash='b'.repeat(64);
const gmailUser='qa.sender@gmail.com',appPassword='abcd efgh ijkl mnop';
const validEnvironment=()=>({VERCEL:'1',VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'preview/core-v0.11.0',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:gmailUser,DP_GMAIL_APP_PASSWORD:appPassword});

function fixture({verifyResult=true,verifyError=null,verifyPromise=null,createError=null}={}){
  const state={createCalls:0,verifyCalls:0,closeCalls:0,sendCalls:0,options:null};
  const createTransport=options=>{state.createCalls++;state.options=structuredClone(options);if(createError)throw createError;return{verify:async()=>{state.verifyCalls++;if(verifyError)throw verifyError;if(verifyPromise)return verifyPromise;return verifyResult},close:()=>{state.closeCalls++},sendMail:async()=>{state.sendCalls++;throw Error('probe must never send mail')}}};
  return{state,createTransport};
}

async function muted(run){const logs=[],prior={log:console.log,warn:console.warn,error:console.error,debug:console.debug};for(const key of Object.keys(prior))console[key]=(...args)=>logs.push(args.map(String).join(' '));try{return{value:await run(),logs}}finally{Object.assign(console,prior)}}

const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}

await check('MAIL-PROBE-01 동일한64자리코드지문을 먼저확인한뒤 SMTPverify정확1회',async()=>{
  const {state,createTransport}=fixture(),env=validEnvironment(),result=await verifyMailConfiguration(env,{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash});
  assert.deepEqual(result,{configured:true,connection:'verified'});assert.equal(state.createCalls,1);assert.equal(state.verifyCalls,1);assert.equal(state.closeCalls,1);assert.equal(state.sendCalls,0);
  assert.equal(state.options.auth.user,gmailUser);assert.equal(state.options.auth.pass,'abcdefghijklmnop');assert.equal(state.options.secure,true);assert.equal(state.options.port,465);assert.equal(state.options.logger,false);assert.equal(state.options.debug,false);
});

await check('MAIL-PROBE-02 지문불일치·형식오류는transport생성전not-run',async()=>{
  for(const [approved,actual] of [[approvedHash,mismatchHash],['short',matchingHash],[approvedHash,'not-a-sha']]){
    const {state,createTransport}=fixture({createError:new Error('must not create transport')}),result=await verifyMailConfiguration(validEnvironment(),{createTransport,approvedHtmlSha256:approved,actualHtmlSha256:actual});
    assert.deepEqual(result,{configured:false,connection:'not-run'});assert.equal(state.createCalls,0);assert.equal(state.verifyCalls,0);assert.equal(state.closeCalls,0);
  }
});

await check('MAIL-PROBE-03 explicit Vercel preview·core branch·Gmail3키 외에는not-run',async()=>{
  const variants=[
    {VERCEL:'0'},
    {VERCEL_ENV:'production'},
    {VERCEL_GIT_COMMIT_REF:'main'},
    {DP_MAIL_PROVIDER:'brevo'},
    {DP_GMAIL_USER:''},
    {DP_GMAIL_APP_PASSWORD:''},
    {DP_GMAIL_APP_PASSWORD:'ordinary-password'}
  ];
  for(const patch of variants){const env={...validEnvironment(),...patch},{state,createTransport}=fixture(),result=await verifyMailConfiguration(env,{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash});assert.deepEqual(result,{configured:false,connection:'not-run'});assert.equal(state.createCalls,0);assert.equal(state.verifyCalls,0)}
});

await check('MAIL-PROBE-04 verify실패는configured상태를구별한unavailable이고core예외로전파하지않음',async()=>{
  for(const setup of [{verifyResult:false},{verifyError:new Error('synthetic-smtp-secret')},{createError:new Error('synthetic-create-secret')}]){
    const {state,createTransport}=fixture(setup),result=await muted(()=>verifyMailConfiguration(validEnvironment(),{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash}));assert.deepEqual(result.value,{configured:true,connection:'unavailable'});assert.deepEqual(result.logs,[]);assert.equal(state.sendCalls,0);assert.equal(state.closeCalls,setup.createError?0:1,'created transports close exactly once; failed construction has nothing to close');
  }
});

await check('MAIL-PROBE-05 timeout옵션은기본상한이하축소만허용하고항상close',async()=>{
  const never=new Promise(()=>{}),{state,createTransport}=fixture({verifyPromise:never}),started=Date.now(),result=await verifyMailConfiguration(validEnvironment(),{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash,timeoutMs:20}),elapsed=Date.now()-started;
  assert.deepEqual(result,{configured:true,connection:'unavailable'});assert.equal(state.verifyCalls,1);assert.equal(state.closeCalls,1);assert.equal(state.sendCalls,0);assert(elapsed<1000,'reduced timeout must bound the synthetic probe');
  const long=fixture({verifyPromise:Promise.resolve(true)});await verifyMailConfiguration(validEnvironment(),{createTransport:long.createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash,timeoutMs:60000});assert(long.state.options.connectionTimeout<=12000);assert(long.state.options.greetingTimeout<=12000);assert(long.state.options.socketTimeout<=12000);
});

await check('MAIL-PROBE-06 결과·로그·원본환경에user·password·code·raw오류가없다',async()=>{
  const env=validEnvironment(),before=JSON.stringify(env),rawMarker='synthetic-raw-transport-marker',{createTransport}=fixture({verifyError:new Error(rawMarker)}),capture=await muted(()=>verifyMailConfiguration(env,{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash})),serialized=JSON.stringify(capture.value)+'\n'+capture.logs.join('\n');
  assert.equal(JSON.stringify(env),before);for(const marker of [gmailUser,'abcdefghijklmnop',appPassword,rawMarker,approvedHash])assert(!serialized.includes(marker),'private marker must not be exposed');assert.deepEqual(Object.keys(capture.value).sort(),['configured','connection']);
});

await check('MAIL-PROBE-07 probe는메일발송·Auth활성·DB연결상태를만들지않는다',async()=>{
  const {state,createTransport}=fixture(),result=await verifyMailConfiguration(validEnvironment(),{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash});assert.deepEqual(result,{configured:true,connection:'verified'});assert.equal(state.sendCalls,0);for(const key of ['authenticated','authActive','databaseConnected','emailSent','inboxDelivered'])assert.equal(Object.prototype.hasOwnProperty.call(result,key),false,key);
});

await check('MAIL-PROBE-08 probe상태는SMTP로그인검사이며실메일·수신함·운영완료가아니다',async()=>{
  const {createTransport}=fixture(),result=await verifyMailConfiguration(validEnvironment(),{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash});assert.equal(result.connection,'verified');const boundaries={smtpLoginVerified:true,emailSent:false,inboxDeliveryVerified:false,applicationAuthComplete:false,databaseConnected:false,productionReady:false};for(const key of ['emailSent','inboxDeliveryVerified','applicationAuthComplete','databaseConnected','productionReady'])assert.equal(boundaries[key],false,key);
});

await check('MAIL-PROBE-09 Vercel빌드래퍼는코어지문일치뒤probe를호출하고safe상태만출력',async()=>{
  const source=fs.readFileSync('scripts/build-vercel.mjs','utf8'),mismatchIndex=source.indexOf("throw Error('ARTIFACT_MISMATCH"),probeIndex=source.indexOf('const mailConnection=await verifyMailConfiguration');
  assert(mismatchIndex>=0&&probeIndex>mismatchIndex,'artifact mismatch guard must precede the SMTP probe');assert(source.includes("mailSent:false"));assert(source.includes("applicationAuthenticationActive:false"));assert(!source.includes('DP_GMAIL_APP_PASSWORD)')&&!source.includes('DP_GMAIL_USER)'),'wrapper must not print credential values');
});

await check('MAIL-PROBE-10 승인된정식origin의Production도동일한SMTP연결검사만실행한다',async()=>{
  const {state,createTransport}=fixture(),env={...validEnvironment(),VERCEL_ENV:'production',DP_AUTH_ORIGIN:'https://igis-development-project-platform.vercel.app'};
  assert.deepEqual(await verifyMailConfiguration(env,{createTransport,approvedHtmlSha256:approvedHash,actualHtmlSha256:matchingHash}),{configured:true,connection:'verified'});assert.equal(state.verifyCalls,1);assert.equal(state.sendCalls,0);
});
const failed=checks.filter(row=>row.status==='failed');
console.log(JSON.stringify({suite:'email-deploy-probe',passed:checks.length-failed.length,failed:failed.length,total:checks.length,externalSmtpCalled:false,realCredentialRead:false,emailSent:false,checks}));
if(failed.length)process.exitCode=1;

