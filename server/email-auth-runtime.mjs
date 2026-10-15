import {AUTH_SCHEMA,AuthUnavailableError,readAuthConfiguration,brevoCodeSender,createEmailAuth,unavailableResponse} from './email-auth.mjs';

const projectRef='baqybhtfvuttcyyzspyi',runtimeRole='development_project_platform_runtime';
export function databaseConnectionOptions(url){
 const parsed=new URL(url),user=decodeURIComponent(parsed.username),direct=parsed.hostname==='db.'+projectRef+'.supabase.co',pooled=/^[a-z0-9.-]+\.pooler\.supabase\.com$/.test(parsed.hostname);
 if(!['postgres:','postgresql:'].includes(parsed.protocol)||!parsed.password||parsed.pathname!=='/postgres'||!['5432','6543'].includes(parsed.port||'5432')||!(direct&&user===runtimeRole||pooled&&user===runtimeRole+'.'+projectRef))throw new AuthUnavailableError();
 return {host:parsed.hostname,port:Number(parsed.port||5432),user,password:decodeURIComponent(parsed.password),database:'postgres',ssl:{rejectUnauthorized:true},max:3,connectionTimeoutMillis:10000,idleTimeoutMillis:30000};
}
let productionDrivers;
async function loadProductionDrivers(config){
 const [{betterAuth},{emailOTP},{Pool},{PostgresDialect}]=await Promise.all([import('better-auth'),import('better-auth/plugins/email-otp'),import('pg'),import('kysely')]);
 if(!productionDrivers||productionDrivers.url!==config.databaseUrl)productionDrivers={url:config.databaseUrl,pool:new Pool(databaseConnectionOptions(config.databaseUrl))};
 const createTransport=config.mailProvider==='gmail'?(await import('nodemailer')).default.createTransport:null;
 return {betterAuth,emailOTP,PostgresDialect,pool:productionDrivers.pool,createTransport};
}
async function productionSender(config,drivers){if(config.mailProvider==='brevo')return brevoCodeSender(config);const {createGmailCodeSender}=await import('./gmail-code-sender.mjs');return createGmailCodeSender(config,drivers.createTransport);}
export function createAuthRuntime({environment=()=>process.env,loadDrivers=loadProductionDrivers,createService=createEmailAuth,senderFactory=productionSender}={}){
 return async function runEmailAuth(request,action){
  let client;
  try{
   const config=readAuthConfiguration(environment());databaseConnectionOptions(config.databaseUrl);
   const drivers=await loadDrivers(config);client=await drivers.pool.connect();
   await client.query('BEGIN');
   await client.query("SET LOCAL search_path = pg_catalog, development_project_platform");
   await client.query("SET LOCAL statement_timeout = '10s'");
   // 모든 인증 쿼리는 한 연결에서 실행하고 성공 응답 전에 일괄 저장을 확인합니다.
   const boundClient={query:(...args)=>client.query(...args),release(){}},boundPool={connect:async()=>boundClient,end:async()=>{}};
   const database={dialect:new drivers.PostgresDialect({pool:boundPool}),type:'postgres',schemaName:AUTH_SCHEMA,transaction:false};
   const service=createService({betterAuth:drivers.betterAuth,emailOTP:drivers.emailOTP,database,secret:config.secret,origin:config.origin,sendEmail:await senderFactory(config,drivers)});
   const response=await service.handle(request,action);
   if(response.status>=500){await client.query('ROLLBACK');return unavailableResponse();}
   // 인증 실패의 시도 횟수·만료 처리는 저장하여 재시도로 제한을 우회하지 못하게 합니다.
   await client.query('COMMIT');return response;
  }catch{if(client)try{await client.query('ROLLBACK')}catch{}return unavailableResponse();}
  finally{if(client)client.release();}
 };
}
export const runEmailAuth=createAuthRuntime();
