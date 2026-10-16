import assert from 'node:assert/strict';
import fs from 'node:fs';
import {rootCertificates} from 'node:tls';
import {AuthUnavailableError,readAuthConfiguration} from '../server/email-auth.mjs';
import {databaseConnectionOptions,loadProductionDrivers,createAuthRuntime} from '../server/email-auth-runtime.mjs';
import {createWorkspaceRuntime} from '../server/workspace-runtime.mjs';

// Node에 포함된 공개 CA만 격리 합성 fixture로 사용합니다. 실제 프로젝트 CA/비밀파일은 읽지 않습니다.
const ca1=rootCertificates[0].replace(/\r\n/g,'\n').trim()+'\n',ca2=rootCertificates[1].replace(/\r\n/g,'\n').trim()+'\n';
const databaseUrl='postgresql://development_project_platform_runtime:synthetic-password@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres';
const origin='https://platform.example.invalid';
const environment=ca=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:'synthetic-secret-more-than-thirty-two-characters',DP_AUTH_DATABASE_URL:databaseUrl,DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop',...(ca!==undefined?{DP_AUTH_DATABASE_CA:ca}:{})});
const request=()=>new Request(origin+'/api/session');
const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch{checks.push({name,status:'failed',error:'CA 계약 기대와 현재 구현이 다릅니다. 비밀값·PEM 원문은 기록하지 않았습니다.'});console.error('FAIL '+name)}}
function fakeRuntime(kind,ca){
 const state={loads:0,connects:0,config:null,queries:[],released:0};
 class Dialect{constructor(options){this.options=options}}
 const client={query:async sql=>{state.queries.push(String(sql));return{rows:[]}},release(){state.released++}};
 const loadDrivers=async config=>{state.loads++;state.config=config;return{pool:{connect:async()=>{state.connects++;return client}},PostgresDialect:Dialect}};
 if(kind==='auth')return{state,run:createAuthRuntime({environment:()=>environment(ca),loadDrivers,createService:()=>({handle:async()=>Response.json({authenticated:false})}),senderFactory:async()=>async()=>({accepted:true})})};
 return{state,run:createWorkspaceRuntime({environment:()=>environment(ca),loadDrivers,createService:async()=>({handle:async()=>Response.json({authenticated:true,userId:'SYNTHETIC-USER',email:'synthetic.user@igisam.com'})}),createHandlers:({withTransaction})=>({workspace:source=>withTransaction(source,async()=>Response.json({ok:true}))})})};
}

await check('DATABASE-CA-01 서버환경의공개PEM을databaseCa로정규화전달',async()=>{
 const config=readAuthConfiguration(environment(' \n'+ca1.replace(/\n/g,'\r\n')+' \n'));assert(config.databaseCa===ca1,'환경 CA가 정규화되어 전달되어야 합니다.');
});
await check('DATABASE-CA-02 CA미설정은기존시스템trust를유지하고명시한빈CA는실패닫힘',async()=>{
 const config=readAuthConfiguration(environment());assert(config.databaseCa===undefined);assert.throws(()=>readAuthConfiguration(environment('')),AuthUnavailableError);assert.throws(()=>readAuthConfiguration(environment('   ')),AuthUnavailableError);
});
await check('DATABASE-CA-03 깨진PEM과인증서외문자·과대입력은거부',async()=>{
 for(const ca of ['not a certificate','-----BEGIN CERTIFICATE-----\ninvalid\n-----END CERTIFICATE-----',ca1+'not-certificate',ca1.repeat(200),ca1.replace('-----BEGIN CERTIFICATE-----\n','-----BEGIN CERTIFICATE-----'),ca1.replace('\n-----END CERTIFICATE-----','-----END CERTIFICATE-----')])assert.throws(()=>readAuthConfiguration(environment(ca)),AuthUnavailableError);
});
await check('DATABASE-CA-04 개인키또는개인키와인증서혼합은거부',async()=>{
 for(const marker of ['PRIVATE KEY','RSA PRIVATE KEY','EC PRIVATE KEY','ENCRYPTED PRIVATE KEY','OPENSSH PRIVATE KEY'])assert.throws(()=>readAuthConfiguration(environment(ca1+'-----BEGIN '+marker+'-----\nsynthetic-not-a-key\n-----END '+marker+'-----')),AuthUnavailableError);
});
await check('DATABASE-CA-05 options는CA를전달하고TLStrue·호스트검증기본·pool1을유지',async()=>{
 const options=databaseConnectionOptions(databaseUrl,ca1);assert(options.ssl.ca===ca1,'ssl.ca 전달이 필요합니다.');assert(options.ssl.rejectUnauthorized===true);assert(options.max===1);assert(options.ssl.checkServerIdentity===undefined);assert(options.ssl.servername===undefined);
 const driver=fs.readFileSync('node_modules/pg/lib/connection.js','utf8');assert(driver.includes('options.servername = host'),'설치된 pg 드라이버의 DNS 호스트 검증 경로가 필요합니다.');
});
await check('DATABASE-CA-06 helper직접호출도깨진CA·개인키·잘못된대상을거부',async()=>{
 for(const ca of ['',false,{},'broken CA','-----BEGIN PRIVATE KEY-----\nsynthetic\n-----END PRIVATE KEY-----'])assert.throws(()=>databaseConnectionOptions(databaseUrl,ca),AuthUnavailableError);
 assert.throws(()=>databaseConnectionOptions(databaseUrl.replace('development_project_platform_runtime','postgres'),ca1),AuthUnavailableError);
 assert.throws(()=>databaseConnectionOptions(databaseUrl.replace('baqybhtfvuttcyyzspyi','wrongprojectref'),ca1),AuthUnavailableError);
});
await check('DATABASE-CA-07 공개CAchain만허용하며URL옵션으로TLS를끄지못함',async()=>{
 const config=readAuthConfiguration(environment(ca1+ca2)),options=databaseConnectionOptions(databaseUrl+'?sslmode=disable',config.databaseCa);assert(config.databaseCa===ca1+ca2);assert(options.ssl.ca===ca1+ca2);assert(options.ssl.rejectUnauthorized===true);
});
await check('DATABASE-CA-08 pool은URL뿐아니라CA회전을캐시식별자에포함',async()=>{
 const pools=new Set();try{
  const a=await loadProductionDrivers(readAuthConfiguration(environment(ca1)));pools.add(a.pool);
  const same=await loadProductionDrivers(readAuthConfiguration(environment(ca1.replace(/\n/g,'\r\n'))));pools.add(same.pool);assert(a.pool===same.pool,'같은 정규화 CA는 같은 pool을 재사용해야 합니다.');assert(a.pool.options.ssl.ca===ca1);
  const b=await loadProductionDrivers(readAuthConfiguration(environment(ca2)));pools.add(b.pool);assert(a.pool!==b.pool,'CA가 바뀌면 다른 pool을 사용해야 합니다.');assert(b.pool.options.ssl.ca===ca2);assert(b.pool.options.ssl.rejectUnauthorized===true);assert(b.pool.options.max===1);
 }finally{for(const pool of pools)if(!pool.ended&&!pool.ending)await pool.end();}
});
await check('DATABASE-CA-09 인증runtime이검증된CA를driver로전달',async()=>{
 const app=fakeRuntime('auth',ca1),response=await app.run(request(),'session');assert(response.status===200);assert(app.state.config.databaseCa===ca1,'인증 runtime에 CA가 전달되어야 합니다.');assert(app.state.loads===1);assert(app.state.released===1);assert(app.state.queries.includes('COMMIT'));
});
await check('DATABASE-CA-10 업무runtime도같은CA를전달하고COMMIT이후응답',async()=>{
 const app=fakeRuntime('workspace',ca1),response=await app.run(new Request(origin+'/api/workspace'),'workspace');assert(response.status===200);assert(app.state.config.databaseCa===ca1,'업무 runtime에 CA가 전달되어야 합니다.');assert(app.state.loads===1);assert(app.state.released===1);assert(app.state.queries.includes('COMMIT'));
});
await check('DATABASE-CA-11 양runtime의잘못된CA는driver연결·세션cookie없이503',async()=>{
 for(const kind of ['auth','workspace']){const app=fakeRuntime(kind,'malformed synthetic CA'),response=await app.run(request(),kind==='auth'?'session':'workspace');assert(response.status===503);assert(app.state.loads===0);assert(app.state.connects===0);assert(response.headers.get('set-cookie')===null);}
});
await check('DATABASE-CA-12 CA입력이나실패원인을응답·로그로노출하지않음',async()=>{
 const output=[],saved={log:console.log,warn:console.warn,error:console.error};for(const key of Object.keys(saved))console[key]=()=>output.push('unexpected runtime log');
 let responseText='';try{const app=fakeRuntime('auth',ca1+'synthetic-invalid-tail'),response=await app.run(request(),'session');responseText=await response.text();}finally{Object.assign(console,saved)}
 assert(!responseText.includes('BEGIN CERTIFICATE'));assert(!responseText.includes('synthetic-invalid-tail'));assert(output.length===0);
});

const failed=checks.filter(check=>check.status==='failed');console.log(JSON.stringify({suite:'cloud-database-ca',passed:checks.length-failed.length,failed:failed.length,total:checks.length,actualDatabaseUsed:false,actualCertificateChainVerified:false,realCredentialRead:false,realEmailSent:false,fixtureSource:'Node built-in public root certificate bundle only',checks}));if(failed.length)process.exitCode=1;
