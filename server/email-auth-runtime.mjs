import {AUTH_SCHEMA,AuthUnavailableError,readAuthConfiguration,normalizeDatabaseCa,brevoCodeSender,createEmailAuth,unavailableResponse} from './email-auth.mjs';

const projectRef='baqybhtfvuttcyyzspyi',runtimeRole='development_project_platform_runtime';
export function parsePgInteger(value){const parsed=Number(value);if(!/^-?\d+$/.test(String(value))||!Number.isSafeInteger(parsed))throw new AuthUnavailableError();return parsed;}
export function databaseConnectionOptions(url,ca){
 const parsed=new URL(url),user=decodeURIComponent(parsed.username),direct=parsed.hostname==='db.'+projectRef+'.supabase.co',pooled=/^[a-z0-9.-]+\.pooler\.supabase\.com$/.test(parsed.hostname);
 if(!['postgres:','postgresql:'].includes(parsed.protocol)||!parsed.password||parsed.pathname!=='/postgres'||!['5432','6543'].includes(parsed.port||'5432')||!(direct&&user===runtimeRole||pooled&&user===runtimeRole+'.'+projectRef))throw new AuthUnavailableError();
 const databaseCa=normalizeDatabaseCa(ca);
 return {host:parsed.hostname,port:Number(parsed.port||5432),user,password:decodeURIComponent(parsed.password),database:'postgres',ssl:{rejectUnauthorized:true,...(databaseCa!==undefined?{ca:databaseCa}:{})},max:1,connectionTimeoutMillis:10000,idleTimeoutMillis:30000};
}
let productionDrivers;
export async function loadProductionDrivers(config){
 const [{betterAuth},{emailOTP},{Pool,types},{PostgresDialect}]=await Promise.all([import('better-auth'),import('better-auth/plugins/email-otp'),import('pg'),import('kysely')]);
 const databaseCa=normalizeDatabaseCa(config.databaseCa);
 if(!productionDrivers||productionDrivers.url!==config.databaseUrl||productionDrivers.ca!==databaseCa){const previous=productionDrivers?.pool;productionDrivers={url:config.databaseUrl,ca:databaseCa,pool:new Pool({...databaseConnectionOptions(config.databaseUrl,databaseCa),types:{getTypeParser:(oid,format)=>Number(oid)===20&&(!format||format==='text')?parsePgInteger:types.getTypeParser(oid,format)}})};if(previous&&!previous.ending&&!previous.ended)previous.end().catch(()=>{});}
 const createTransport=config.mailProvider==='gmail'?(await import('nodemailer')).default.createTransport:null;
 return {betterAuth,emailOTP,PostgresDialect,pool:productionDrivers.pool,createTransport};
}
export async function productionSender(config,drivers){if(config.mailProvider==='brevo')return brevoCodeSender(config);const {createGmailCodeSender}=await import('./gmail-code-sender.mjs');return createGmailCodeSender(config,drivers.createTransport);}
export async function boundAuthenticationService(config,drivers,client,{createService=createEmailAuth,senderFactory=productionSender}={}){
 const boundClient={query:(...args)=>client.query(...args),release(){}},boundPool={connect:async()=>boundClient,end:async()=>{}};
 const database={dialect:new drivers.PostgresDialect({pool:boundPool}),type:'postgres',schemaName:AUTH_SCHEMA,transaction:false};
 return createService({betterAuth:drivers.betterAuth,emailOTP:drivers.emailOTP,database,secret:config.secret,origin:config.origin,allowedEmails:config.allowedEmails,sendEmail:await senderFactory(config,drivers)});
}
export function createAuthRuntime({environment=()=>process.env,loadDrivers=loadProductionDrivers,createService=createEmailAuth,senderFactory=productionSender}={}){
 return async function runEmailAuth(request,action){
  let client;
  try{
   const config=readAuthConfiguration(environment());databaseConnectionOptions(config.databaseUrl,config.databaseCa);
   const drivers=await loadDrivers(config);client=await drivers.pool.connect();
   await client.query('BEGIN');
   await client.query("SET LOCAL search_path = pg_catalog, development_project_platform");
   await client.query("SET LOCAL statement_timeout = '10s'");
   if(['code','verify'].includes(action)&&request.method==='POST'){
    let email;try{email=(await request.clone().json()).email;email=String(email||'').trim().toLowerCase()}catch{}
    if(email&&email.length<=254){
     await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",['development-project-platform:otp:'+email]);
     if(action==='code'){
      const throttle=await client.query("SELECT EXISTS(SELECT 1 FROM development_project_platform.app_verification WHERE identifier=$1 AND \"createdAt\">now()-interval '60 seconds') AS throttled",['sign-in-otp-'+email]);
      if(throttle.rows[0]?.throttled===true){await client.query('COMMIT');return Response.json({error:'TRY_LATER',message:'잠시 후 인증번호를 다시 요청해 주세요.'},{status:429,headers:{'cache-control':'private, no-store','retry-after':'60'}});}
     }
    }
   }
   // 모든 인증 쿼리는 한 연결에서 실행하고 성공 응답 전에 일괄 저장을 확인합니다.
   const service=await boundAuthenticationService(config,drivers,client,{createService,senderFactory});
   const response=await service.handle(request,action);
   if(response.status>=500){await client.query('ROLLBACK');return unavailableResponse();}
   // 인증 실패의 시도 횟수·만료 처리는 저장하여 재시도로 제한을 우회하지 못하게 합니다.
   if(action==='verify'&&response.ok&&config.initialAdminEmail){const identity=await response.clone().json();if(identity.authenticated===true&&identity.email===config.initialAdminEmail&&identity.userId)await client.query('INSERT INTO development_project_platform.platform_admins(user_id) VALUES ($1) ON CONFLICT(user_id) DO NOTHING',[identity.userId]);}
   await client.query('COMMIT');return response;
  }catch{if(client)try{await client.query('ROLLBACK')}catch{}return unavailableResponse();}
  finally{if(client)client.release();}
 };
}
export const runEmailAuth=createAuthRuntime();
