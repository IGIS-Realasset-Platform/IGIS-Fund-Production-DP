import {createHmac,X509Certificate,randomUUID} from 'node:crypto';
import {AsyncLocalStorage} from 'node:async_hooks';
import {companyEmail,parseAllowedEmails,normalizeAllowedEmails,PASSWORD_POLICY,validPassword} from './auth-policy.mjs';
export {companyEmail} from './auth-policy.mjs';

export const AUTH_SCHEMA='development_project_platform';
export const AUTH_LIMITS=Object.freeze({codeLength:6,expiresIn:300,allowedAttempts:5,sessionExpiresIn:28800});
const otpIssueQueues=new Map();
async function acquireOtpIssue(key){
 const previous=otpIssueQueues.get(key)||Promise.resolve();let resolve;const gate=new Promise(done=>{resolve=done}),tail=previous.then(()=>gate);otpIssueQueues.set(key,tail);await previous;
 let released=false;return()=>{if(released)return;released=true;resolve();if(otpIssueQueues.get(key)===tail)otpIssueQueues.delete(key);};
}
export class AuthUnavailableError extends Error { constructor(){super('인증 서비스를 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');this.code='AUTH_UNAVAILABLE';} }
export function normalizeDatabaseCa(raw){
 if(raw===undefined)return undefined;
 if(typeof raw!=='string'||!raw.trim()||Buffer.byteLength(raw)>65536||raw.includes('\0')||/-----BEGIN [^-]*PRIVATE KEY-----/.test(raw))throw new AuthUnavailableError();
 const text=raw.replace(/\r\n/g,'\n').trim(),pattern=/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g,blocks=text.match(pattern);
 if(!blocks?.length||blocks.length>16||text.replace(pattern,'').trim())throw new AuthUnavailableError();
 try{return blocks.map(block=>{
  if(!block.startsWith('-----BEGIN CERTIFICATE-----\n')||!block.endsWith('\n-----END CERTIFICATE-----'))throw Error();
  const encoded=block.replace('-----BEGIN CERTIFICATE-----','').replace('-----END CERTIFICATE-----','').replace(/[ \t\r\n]/g,'');
  if(!/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)||encoded.length%4!==0)throw Error();
  const der=Buffer.from(encoded,'base64'),certificate=new X509Certificate(block);
  if(der.toString('base64')!==encoded||!certificate.raw.equals(der)||!certificate.ca)throw Error();
  return block.trim()+'\n';
 }).join('');}catch{throw new AuthUnavailableError();}
}
export function authOrigin(raw){
 let url;try{url=new URL(raw)}catch{throw new AuthUnavailableError()}
 if(url.protocol!=='https:'||url.origin!==raw||url.username||url.password)throw new AuthUnavailableError();
 return url.origin;
}
export function readAuthConfiguration(env){
 const origin=authOrigin(env.DP_AUTH_ORIGIN),secret=env.DP_AUTH_SECRET;
 if(typeof secret!=='string'||secret.length<32||!env.DP_AUTH_DATABASE_URL)throw new AuthUnavailableError();
 let database;try{database=new URL(env.DP_AUTH_DATABASE_URL)}catch{throw new AuthUnavailableError()}
 if(!['postgres:','postgresql:'].includes(database.protocol)||!/^development_project_platform_runtime(?:\.|$)/.test(decodeURIComponent(database.username))||!database.password)throw new AuthUnavailableError();
 let initialAdminEmail='';try{if(env.DP_INITIAL_ADMIN_EMAIL)initialAdminEmail=companyEmail(env.DP_INITIAL_ADMIN_EMAIL)}catch{throw new AuthUnavailableError()}
 let allowedEmails;try{allowedEmails=parseAllowedEmails(env.DP_ALLOWED_EMAILS)}catch{throw new AuthUnavailableError()}
 const base={origin,secret,databaseUrl:env.DP_AUTH_DATABASE_URL,initialAdminEmail,allowedEmails,databaseCa:normalizeDatabaseCa(env.DP_AUTH_DATABASE_CA)};
 if(env.DP_MAIL_PROVIDER==='gmail'){
  const gmailUser=String(env.DP_GMAIL_USER||'').trim().toLowerCase(),appPassword=String(env.DP_GMAIL_APP_PASSWORD||'').replace(/\s/g,'');
  if(!/^[a-z0-9](?:[a-z0-9._+\-]*[a-z0-9])?@gmail\.com$/.test(gmailUser)||!/^[a-z0-9]{16}$/i.test(appPassword))throw new AuthUnavailableError();
  return {...base,mailProvider:'gmail',gmailUser,appPassword};
 }
 if(env.DP_MAIL_PROVIDER==='brevo'&&env.DP_BREVO_API_KEY&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(env.DP_MAIL_FROM))return {...base,mailProvider:'brevo',mailKey:env.DP_BREVO_API_KEY,mailFrom:env.DP_MAIL_FROM};
 throw new AuthUnavailableError();
}
export function brevoCodeSender({mailKey,mailFrom},fetchImpl=fetch){
 if(!mailKey||!mailFrom)throw new AuthUnavailableError();
 return async ({email,otp,type})=>{
  email=companyEmail(email);if(type!=='sign-in'||!/^\d{6}$/.test(otp))throw new AuthUnavailableError();
  let response;try{response=await fetchImpl('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','content-type':'application/json','api-key':mailKey},body:JSON.stringify({sender:{name:'개발사업관리플랫폼',email:mailFrom},to:[{email}],subject:'개발사업관리플랫폼 이메일 확인번호',textContent:`확인번호: ${otp}\n\n5분 안에 입력해 주세요. 요청하지 않은 메일이면 무시해 주세요.`}),signal:AbortSignal.timeout(10000)});}catch{throw new AuthUnavailableError()}
  if(!response.ok)throw new AuthUnavailableError();
  return {accepted:true}; // 발송 서비스 접수이며 수신함 도착 확인은 별도입니다.
 };
}
const json=(body,status=200,extra={})=>{const headers=new Headers(extra);headers.set('cache-control','private, no-store');headers.set('x-content-type-options','nosniff');return Response.json(body,{status,headers})};
export function unavailableResponse(){return json({error:'AUTH_UNAVAILABLE',message:new AuthUnavailableError().message},503)}

export function createEmailAuth({betterAuth,emailOTP,database,secret,origin,sendEmail,allowedEmails}){
 origin=authOrigin(origin);if(typeof secret!=='string'||secret.length<32||typeof sendEmail!=='function'||!database)throw new AuthUnavailableError();
 let allowed;try{allowed=new Set(normalizeAllowedEmails(allowedEmails))}catch{throw new AuthUnavailableError()}
 const deliveryContext=new AsyncLocalStorage(),hashOTP=otp=>createHmac('sha256',secret).update(otp).digest('base64url');
 const sendTracked=async (payload,ctx)=>{
  const delivery=deliveryContext.getStore();if(!delivery)throw new AuthUnavailableError();
  delivery.started=true;delivery.identifier='sign-in-otp-'+companyEmail(payload.email);delivery.hash=hashOTP(payload.otp);
  delivery.promise=(async()=>{try{const record=delivery.recordId?await ctx.context.adapter.findOne({model:'verification',where:[{field:'id',value:delivery.recordId},{field:'identifier',value:delivery.identifier}]}):null;if(!record||!String(record.value).startsWith(delivery.hash+':'))throw new AuthUnavailableError();delivery.releaseIssue?.();await sendEmail(payload);delivery.accepted=true;}catch{delivery.failed=true;}})();
  await delivery.promise;
 };
 const auth=betterAuth({appName:'개발사업관리플랫폼',baseURL:origin,basePath:'/api/auth',secret,database,
  emailAndPassword:{enabled:true,disableSignUp:true,requireEmailVerification:true,minPasswordLength:PASSWORD_POLICY.minLength,maxPasswordLength:PASSWORD_POLICY.maxLength},socialProviders:{},trustedOrigins:[origin],logger:{disabled:true},onAPIError:{throw:true},
  user:{modelName:'app_user',changeEmail:{enabled:false},deleteUser:{enabled:false}},account:{modelName:'app_account',accountLinking:{enabled:false}},verification:{modelName:'app_verification'},
  databaseHooks:{user:{create:{before:async user=>({data:{...user,name:'',image:null}}),after:async()=>{const flow=deliveryContext.getStore();if(flow)flow.newAccountCreated=true;}}},verification:{create:{before:async(value,ctx)=>{
   const flow=deliveryContext.getStore();if(flow?.action!=='code'||value.identifier!=='sign-in-otp-'+flow.email)return{data:value};
   // 생성시각 동률로 이전 번호가 선택되지 않게 발급 교체만 직렬화합니다. SMTP 대기까지 잠그지는 않습니다.
   if(!flow.releaseIssue)flow.releaseIssue=await acquireOtpIssue(origin+'\0'+value.identifier);
   flow.recordId=randomUUID();await ctx.context.adapter.deleteMany({model:'verification',where:[{field:'identifier',value:value.identifier}]});
   return{data:{...value,id:flow.recordId}};
  }}}},
  session:{modelName:'app_session',expiresIn:AUTH_LIMITS.sessionExpiresIn,updateAge:1800,cookieCache:{enabled:false}},
  advanced:{cookiePrefix:'dpp',useSecureCookies:true,defaultCookieAttributes:{httpOnly:true,secure:true,sameSite:'strict',path:'/'}},
  rateLimit:{enabled:true,storage:'database',modelName:'app_rate_limit',window:60,max:10,customRules:{'/email-otp/send-verification-otp':{window:60,max:10},'/sign-in/email-otp':{window:60,max:5},'/sign-in/email':{window:60,max:5},'/get-session':{window:60,max:240}}},
  plugins:[emailOTP({otpLength:AUTH_LIMITS.codeLength,expiresIn:AUTH_LIMITS.expiresIn,allowedAttempts:AUTH_LIMITS.allowedAttempts,resendStrategy:'rotate',disableSignUp:false,storeOTP:{hash:async otp=>hashOTP(otp)},sendVerificationOTP:sendTracked})]
 });
 async function handle(request,action){
  if(!['session','code','verify','login'].includes(action))return json({error:'NOT_FOUND'},404);
  const method=request.method,allowedMethods=action==='session'?['GET','DELETE']:['POST'];
  if(!allowedMethods.includes(method))return json({error:'METHOD_NOT_ALLOWED'},405,{allow:allowedMethods.join(', ')});
  if((method!=='GET'||request.headers.has('origin'))&&request.headers.get('origin')!==origin)return json({error:'ORIGIN_NOT_ALLOWED'},403);
  let body,email;
  if(method==='POST'){
   if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return json({error:'INVALID_CONTENT_TYPE'},415);
   if(Number(request.headers.get('content-length'))>4096)return json({error:'BODY_TOO_LARGE'},413);
   try{const text=await request.text();if(Buffer.byteLength(text)>4096)return json({error:'BODY_TOO_LARGE'},413);body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();email=companyEmail(body.email);const keys=action==='code'?['email']:action==='verify'?['email','code','password']:['email','password'];if(Object.keys(body).some(key=>!keys.includes(key)))throw Error();}catch{return json({error:'INVALID_EMAIL_OR_FIELDS',message:'회사 이메일과 입력 항목을 확인해 주세요.'},400)}
   if(!allowed.has(email))return json({error:'EMAIL_NOT_ALLOWED',message:'이용이 허용된 이메일을 확인해 주세요.',fieldErrors:[{field:'email',code:'EMAIL_NOT_ALLOWED'}]},403);
   if(action==='verify'&&(typeof body.code!=='string'||!/^\d{6}$/.test(body.code)))return json({error:'INVALID_CODE',message:'6자리 확인번호를 입력해 주세요.'},400);
   if(['verify','login'].includes(action)&&!validPassword(body.password))return json({error:'INVALID_PASSWORD',message:'비밀번호는 12~128자로 입력해 주세요.',fieldErrors:[{field:'password',code:'PASSWORD_LENGTH'}]},400);
   if(['code','verify'].includes(action)){
    try{const context=await auth.$context,record=await context.internalAdapter.findUserByEmail(email,{includeAccounts:true});if(record?.accounts.some(account=>account.providerId==='credential'&&account.password))return json({error:'PASSWORD_ALREADY_SET',message:'이미 비밀번호가 설정되어 있습니다. 비밀번호로 로그인해 주세요.'},409);}catch{return unavailableResponse()}
   }
  }
  const path=action==='code'?'/email-otp/send-verification-otp':action==='verify'?'/sign-in/email-otp':action==='login'?'/sign-in/email':method==='GET'?'/get-session':'/sign-out';
  const forwarded=new Headers(request.headers);forwarded.delete('content-length');
  const payload=action==='code'?{email,type:'sign-in'}:action==='verify'?{email,otp:body.code}:action==='login'?{email,password:body.password,rememberMe:true}:method==='DELETE'?{}:null;
  if(payload)forwarded.set('content-type','application/json');
  const delivery={action,email,started:false,accepted:false,failed:false};
  let response;try{response=await deliveryContext.run(delivery,()=>auth.handler(new Request(origin+'/api/auth'+path,{method:method==='DELETE'?'POST':method,headers:forwarded,...(payload?{body:JSON.stringify(payload)}:{})})));if(delivery.promise)await delivery.promise;}catch{return unavailableResponse()}finally{delivery.releaseIssue?.()}
  if(action==='code'&&response.ok&&(!delivery.started||!delivery.accepted||delivery.failed)){
   try{if(delivery.recordId){const context=await auth.$context;await context.adapter.deleteMany({model:'verification',where:[{field:'id',value:delivery.recordId},{field:'identifier',value:delivery.identifier},{field:'value',operator:'in',value:Array.from({length:AUTH_LIMITS.allowedAttempts+1},(_,attempt)=>delivery.hash+':'+attempt)}]});}}catch{return unavailableResponse()}
   return unavailableResponse();
  }
  if(action==='verify'&&response.ok){
   try{
    const identity=await response.clone().json();if(identity?.user?.emailVerified!==true||companyEmail(identity.user.email)!==email||!identity.user.id)throw new AuthUnavailableError();
    const freshCookies=response.headers.getSetCookie().map(value=>value.split(';',1)[0]).join('; ');if(!freshCookies)throw new AuthUnavailableError();
    const setupHeaders=new Headers({'origin':origin,'cookie':freshCookies});
    const setup=await auth.api.setPassword({body:{newPassword:body.password},headers:setupHeaders,asResponse:true});
    if(!setup.ok)throw new AuthUnavailableError();const setupBody=await setup.json();if(setupBody.status!==true)throw new AuthUnavailableError();
    const confirmed=await auth.handler(new Request(origin+'/api/auth/get-session',{headers:setupHeaders}));if(!confirmed.ok)throw new AuthUnavailableError();
    const finalIdentity=await confirmed.clone().json();if(finalIdentity?.user?.id!==identity.user.id||finalIdentity.user.emailVerified!==true||companyEmail(finalIdentity.user.email)!==email)throw new AuthUnavailableError();
    const combined=new Headers(confirmed.headers);for(const value of response.headers.getSetCookie())combined.append('set-cookie',value);response=new Response(JSON.stringify(finalIdentity),{status:200,headers:combined});
   }catch{return unavailableResponse()}
  }
  const headers=new Headers({'cache-control':'private, no-store','x-content-type-options':'nosniff'});
  for(const cookie of response.headers.getSetCookie())headers.append('set-cookie',cookie);
  if(response.status===429){const retry=response.headers.get('retry-after')||response.headers.get('x-retry-after');headers.set('retry-after',/^\d{1,6}$/.test(retry||'')?retry:'60');}
  if(!response.ok){if(response.status>=500)return unavailableResponse();return json({error:response.status===429?'TRY_LATER':action==='login'?'INVALID_CREDENTIALS':'VERIFICATION_FAILED',message:response.status===429?'잠시 후 다시 시도해 주세요.':action==='login'?'이메일 또는 비밀번호를 확인해 주세요.':'확인번호가 일치하지 않거나 만료됐습니다.'},response.status,headers)}
  if(action==='code')return json({sent:true},202,headers);
  if(method==='DELETE')return json({authenticated:false},200,headers);
  let result;try{result=await response.json()}catch{return unavailableResponse()}
  if(!result?.user)return json({authenticated:false},200,headers);
  const checkedEmail=companyEmail(result.user.email);
  if(!allowed.has(checkedEmail))return json({error:'EMAIL_NOT_ALLOWED',message:'이용이 허용된 이메일을 확인해 주세요.'},403);
  if(result.user.emailVerified!==true)return json({error:'EMAIL_NOT_VERIFIED'},401,headers);
  return json({authenticated:true,email:checkedEmail,userId:result.user.id,newAccountCreated:action==='verify'&&delivery.newAccountCreated===true,expiresAt:result.session?.expiresAt||null},200,headers);
 }
 return {handle,auth};
}
