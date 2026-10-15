import assert from 'node:assert/strict';
import {AuthUnavailableError,readAuthConfiguration} from '../server/email-auth.mjs';
import {createAuthRuntime} from '../server/email-auth-runtime.mjs';

const origin='https://platform.example.invalid';
const databaseUrl='postgresql://development_project_platform_runtime:synthetic-password@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres';
const secret='isolated-synthetic-test-secret-more-than-32-characters';
const gmailUser='qa.sender@gmail.com';
const spacedAppPassword='abcd efgh ijkl mnop';
const baseEnvironment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:secret,DP_AUTH_DATABASE_URL:databaseUrl});
const request=new Request(origin+'/api/auth/session',{method:'GET'});

function fakeRuntime({responseStatus=200,handlerError=null,driverError=null,senderError=null}={}){
  const state={loadConfig:null,senderConfig:null,serviceConfig:null,queries:[],released:0,handlerCalls:0};
  class FakeDialect{constructor(options){this.options=options}}
  const client={query:async sql=>{state.queries.push(String(sql));return{rows:[]}},release:()=>{state.released++}};
  const drivers={betterAuth:{synthetic:true},emailOTP:{synthetic:true},PostgresDialect:FakeDialect,pool:{connect:async()=>client},createTransport:()=>{throw Error('production transport must be injected by senderFactory')}};
  const loadDrivers=async config=>{state.loadConfig=config;if(driverError)throw driverError;return drivers};
  const senderFactory=async config=>{state.senderConfig=config;if(senderError)throw senderError;return async()=>({accepted:true})};
  const createService=config=>{state.serviceConfig=config;return{handle:async()=>{state.handlerCalls++;if(handlerError)throw handlerError;return Response.json(responseStatus>=500?{error:'SYNTHETIC_FAILURE'}:{authenticated:false},{status:responseStatus})}}};
  const environment=()=>({...baseEnvironment(),DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:gmailUser,DP_GMAIL_APP_PASSWORD:spacedAppPassword});
  return{state,run:createAuthRuntime({environment,loadDrivers,createService,senderFactory})};
}

async function muted(run){const logs=[],prior={log:console.log,warn:console.warn,error:console.error,debug:console.debug};for(const key of Object.keys(prior))console[key]=(...args)=>logs.push(args.map(String).join(' '));try{return{value:await run(),logs}}finally{Object.assign(console,prior)}}

const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}

await check('CLOUD-AUTH-RUNTIME-01 Gmail구성은provider명시·합성gmail·공백제거16자리만허용',async()=>{
  const config=readAuthConfiguration({...baseEnvironment(),DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'  QA.Sender+Test@GMAIL.COM ',DP_GMAIL_APP_PASSWORD:spacedAppPassword});
  assert.equal(config.mailProvider,'gmail');assert.equal(config.gmailUser,'qa.sender+test@gmail.com');assert.equal(config.appPassword,'abcdefghijklmnop');
  assert(!('mailKey'in config));assert(!('mailFrom'in config));
});

await check('CLOUD-AUTH-RUNTIME-02 Gmail누락·일반비밀번호는Brevo로fallback하지않는다',async()=>{
  const brevoExtras={DP_BREVO_API_KEY:'synthetic-brevo-key',DP_MAIL_FROM:'sender@example.invalid'};
  for(const patch of [
    {DP_GMAIL_USER:'',DP_GMAIL_APP_PASSWORD:spacedAppPassword},
    {DP_GMAIL_USER:gmailUser,DP_GMAIL_APP_PASSWORD:''},
    {DP_GMAIL_USER:gmailUser,DP_GMAIL_APP_PASSWORD:'ordinary-password'}
  ])assert.throws(()=>readAuthConfiguration({...baseEnvironment(),DP_MAIL_PROVIDER:'gmail',...brevoExtras,...patch}),AuthUnavailableError);
});

await check('CLOUD-AUTH-RUNTIME-03 Brevo는명시provider일때만기존구성을반환',async()=>{
  const config=readAuthConfiguration({...baseEnvironment(),DP_MAIL_PROVIDER:'brevo',DP_BREVO_API_KEY:'synthetic-brevo-key',DP_MAIL_FROM:'sender@example.invalid'});
  assert.equal(config.mailProvider,'brevo');assert.equal(config.mailKey,'synthetic-brevo-key');assert.equal(config.mailFrom,'sender@example.invalid');assert(!('gmailUser'in config));assert(!('appPassword'in config));
  assert.throws(()=>readAuthConfiguration({...baseEnvironment(),DP_MAIL_PROVIDER:'unknown',DP_BREVO_API_KEY:'synthetic-brevo-key',DP_MAIL_FROM:'sender@example.invalid'}),AuthUnavailableError);
});

await check('CLOUD-AUTH-RUNTIME-04 Gmail driver분기와서비스는한transaction에서COMMIT',async()=>{
  const app=fakeRuntime(),response=await app.run(request,'session');assert.equal(response.status,200);assert.equal(app.state.handlerCalls,1);assert.equal(app.state.released,1);
  assert.equal(app.state.loadConfig.mailProvider,'gmail');assert.equal(app.state.senderConfig.gmailUser,gmailUser);assert.equal(app.state.senderConfig.appPassword,'abcdefghijklmnop');
  assert.equal(app.state.serviceConfig.origin,origin);assert.equal(app.state.serviceConfig.secret,secret);assert.equal(app.state.serviceConfig.database.schemaName,'development_project_platform');assert.equal(app.state.serviceConfig.database.transaction,false);assert.equal(typeof app.state.serviceConfig.sendEmail,'function');
  assert.deepEqual(app.state.queries,['BEGIN','SET LOCAL search_path = pg_catalog, development_project_platform',"SET LOCAL statement_timeout = '10s'",'COMMIT']);
});

await check('CLOUD-AUTH-RUNTIME-05 서비스5xx는COMMIT없이ROLLBACK하고generic503',async()=>{
  const app=fakeRuntime({responseStatus:503}),response=await app.run(request,'session'),body=await response.json();assert.equal(response.status,503);assert.equal(body.error,'AUTH_UNAVAILABLE');assert.equal(app.state.released,1);assert(app.state.queries.includes('ROLLBACK'));assert(!app.state.queries.includes('COMMIT'));
});

await check('CLOUD-AUTH-RUNTIME-06 driver·sender·handler예외는raw원인없이503·ROLLBACK가능범위정리',async()=>{
  for(const scenario of [
    {driverError:new Error('synthetic-driver-secret'),expectsBegin:false},
    {senderError:new Error('synthetic-sender-secret'),expectsBegin:true},
    {handlerError:new Error('synthetic-handler-secret'),expectsBegin:true}
  ]){
    const app=fakeRuntime(scenario),result=await muted(()=>app.run(request,'session')),response=result.value,text=await response.text();assert.equal(response.status,503);assert(!text.includes('synthetic-'));assert(!result.logs.join('\n').includes('synthetic-'));assert.equal(app.state.released,scenario.expectsBegin?1:0);if(scenario.expectsBegin)assert(app.state.queries.includes('ROLLBACK'));assert(!app.state.queries.includes('COMMIT'));
  }
});

await check('CLOUD-AUTH-RUNTIME-07 환경값은응답·로그로직렬화되지않는다',async()=>{
  const app=fakeRuntime(),result=await muted(()=>app.run(request,'session')),text=await result.value.text(),serialized=text+'\n'+result.logs.join('\n');for(const marker of [secret,'synthetic-password','abcdefghijklmnop',gmailUser])assert(!serialized.includes(marker),'private configuration marker must not be exposed');
});

await check('CLOUD-AUTH-RUNTIME-08 메일접수와수신함도착·실제PG원자성은서로대신하지않는다',async()=>{
  const app=fakeRuntime(),response=await app.run(request,'session');assert.equal(response.status,200);assert.equal(app.state.senderConfig.mailProvider,'gmail');
  const boundaries={smtpAcceptedOnly:true,inboxDeliveryVerified:false,realEmailSent:false,realDatabaseUsed:false,postgresAtomicityVerified:false};assert.equal(boundaries.smtpAcceptedOnly,true);for(const key of ['inboxDeliveryVerified','realEmailSent','realDatabaseUsed','postgresAtomicityVerified'])assert.equal(boundaries[key],false,key);
});

const failed=checks.filter(row=>row.status==='failed');
console.log(JSON.stringify({suite:'cloud-auth-runtime',passed:checks.length-failed.length,failed:failed.length,total:checks.length,realEmailSent:false,realCredentialRead:false,realDatabaseUsed:false,postgresAtomicityVerified:false,checks}));
if(failed.length)process.exitCode=1;

