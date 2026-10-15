import {createHmac} from 'node:crypto';
import {AsyncLocalStorage} from 'node:async_hooks';

export const AUTH_SCHEMA='development_project_platform';
export const AUTH_LIMITS=Object.freeze({codeLength:6,expiresIn:300,allowedAttempts:5,sessionExpiresIn:28800});
export class AuthUnavailableError extends Error { constructor(){super('인증 서비스를 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.');this.code='AUTH_UNAVAILABLE';} }
export function companyEmail(raw){
 if(typeof raw!=='string')throw Error('회사 이메일을 입력해 주세요.');
 const email=raw.trim().toLowerCase(),parts=email.split('@');
 if(parts.length!==2||parts[1]!=='igisam.com'||parts[0].length<1||parts[0].length>64||email.length>254||!/^[a-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-z0-9!#$%&'*+\-/=?^_`{|}~]+)*$/.test(parts[0]))throw Error('@igisam.com 회사 이메일을 입력해 주세요.');
 return email;
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
 const base={origin,secret,databaseUrl:env.DP_AUTH_DATABASE_URL};
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

export function createEmailAuth({betterAuth,emailOTP,database,secret,origin,sendEmail}){
 origin=authOrigin(origin);if(typeof secret!=='string'||secret.length<32||typeof sendEmail!=='function'||!database)throw new AuthUnavailableError();
 const deliveryContext=new AsyncLocalStorage(),hashOTP=otp=>createHmac('sha256',secret).update(otp).digest('base64url');
 const sendTracked=async (payload,ctx)=>{
  const delivery=deliveryContext.getStore();if(!delivery)throw new AuthUnavailableError();
  delivery.started=true;delivery.identifier='sign-in-otp-'+companyEmail(payload.email);delivery.hash=hashOTP(payload.otp);
  delivery.promise=(async()=>{try{const record=await ctx.context.internalAdapter.findVerificationValue(delivery.identifier);if(!record||!String(record.value).startsWith(delivery.hash+':'))throw new AuthUnavailableError();delivery.recordId=record.id;await sendEmail(payload);delivery.accepted=true;}catch{delivery.failed=true;}})();
  await delivery.promise;
 };
 const auth=betterAuth({appName:'개발사업관리플랫폼',baseURL:origin,basePath:'/api/auth',secret,database,
  emailAndPassword:{enabled:false},socialProviders:{},trustedOrigins:[origin],logger:{disabled:true},
  user:{modelName:'app_user',changeEmail:{enabled:false},deleteUser:{enabled:false}},account:{modelName:'app_account',accountLinking:{enabled:false}},verification:{modelName:'app_verification'},
  session:{modelName:'app_session',expiresIn:AUTH_LIMITS.sessionExpiresIn,updateAge:1800,cookieCache:{enabled:false}},
  advanced:{cookiePrefix:'dpp',useSecureCookies:true,defaultCookieAttributes:{httpOnly:true,secure:true,sameSite:'strict',path:'/'}},
  rateLimit:{enabled:true,storage:'database',modelName:'app_rate_limit',window:60,max:10,customRules:{'/email-otp/send-verification-otp':{window:60,max:1},'/sign-in/email-otp':{window:60,max:5}}},
  plugins:[emailOTP({otpLength:AUTH_LIMITS.codeLength,expiresIn:AUTH_LIMITS.expiresIn,allowedAttempts:AUTH_LIMITS.allowedAttempts,resendStrategy:'rotate',disableSignUp:false,storeOTP:{hash:async otp=>hashOTP(otp)},sendVerificationOTP:sendTracked})]
 });
 async function handle(request,action){
  if(!['session','code','verify'].includes(action))return json({error:'NOT_FOUND'},404);
  const method=request.method,allowed=action==='session'?['GET','DELETE']:['POST'];
  if(!allowed.includes(method))return json({error:'METHOD_NOT_ALLOWED'},405,{allow:allowed.join(', ')});
  if((method!=='GET'||request.headers.has('origin'))&&request.headers.get('origin')!==origin)return json({error:'ORIGIN_NOT_ALLOWED'},403);
  let body,email;
  if(method==='POST'){
   if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return json({error:'INVALID_CONTENT_TYPE'},415);
   if(Number(request.headers.get('content-length'))>4096)return json({error:'BODY_TOO_LARGE'},413);
   try{const text=await request.text();if(Buffer.byteLength(text)>4096)return json({error:'BODY_TOO_LARGE'},413);body=JSON.parse(text);if(!body||typeof body!=='object'||Array.isArray(body))throw Error();email=companyEmail(body.email);const keys=action==='code'?['email']:['email','code'];if(Object.keys(body).some(key=>!keys.includes(key)))throw Error();}catch{return json({error:'INVALID_EMAIL_OR_FIELDS',message:'회사 이메일과 입력 항목을 확인해 주세요.'},400)}
   if(action==='verify'&&(typeof body.code!=='string'||!/^\d{6}$/.test(body.code)))return json({error:'INVALID_CODE',message:'6자리 확인번호를 입력해 주세요.'},400);
  }
  const path=action==='code'?'/email-otp/send-verification-otp':action==='verify'?'/sign-in/email-otp':method==='GET'?'/get-session':'/sign-out';
  const forwarded=new Headers(request.headers);forwarded.delete('content-length');
  const payload=action==='code'?{email,type:'sign-in'}:action==='verify'?{email,otp:body.code}:method==='DELETE'?{}:null;
  if(payload)forwarded.set('content-type','application/json');
  const delivery={started:false,accepted:false,failed:false};
  let response;try{response=await deliveryContext.run(delivery,()=>auth.handler(new Request(origin+'/api/auth'+path,{method:method==='DELETE'?'POST':method,headers:forwarded,...(payload?{body:JSON.stringify(payload)}:{})})));if(delivery.promise)await delivery.promise;}catch{return unavailableResponse()}
  if(action==='code'&&response.ok&&(!delivery.started||!delivery.accepted||delivery.failed)){
   try{if(delivery.recordId){const context=await auth.$context;await context.adapter.deleteMany({model:'verification',where:[{field:'id',value:delivery.recordId},{field:'identifier',value:delivery.identifier},{field:'value',operator:'in',value:Array.from({length:AUTH_LIMITS.allowedAttempts+1},(_,attempt)=>delivery.hash+':'+attempt)}]});}}catch{return unavailableResponse()}
   return unavailableResponse();
  }
  const headers=new Headers({'cache-control':'private, no-store','x-content-type-options':'nosniff'});
  for(const cookie of response.headers.getSetCookie())headers.append('set-cookie',cookie);
  if(!response.ok){if(response.status>=500)return unavailableResponse();return json({error:response.status===429?'TRY_LATER':'VERIFICATION_FAILED',message:response.status===429?'잠시 후 다시 시도해 주세요.':'확인번호가 일치하지 않거나 만료됐습니다.'},response.status,headers)}
  if(action==='code')return json({sent:true},202,headers);
  if(method==='DELETE')return json({authenticated:false},200,headers);
  let result;try{result=await response.json()}catch{return unavailableResponse()}
  if(!result?.user)return json({authenticated:false},200,headers);
  const checkedEmail=companyEmail(result.user.email);
  if(result.user.emailVerified!==true)return json({error:'EMAIL_NOT_VERIFIED'},401,headers);
  return json({authenticated:true,email:checkedEmail,expiresAt:result.session?.expiresAt||null},200,headers);
 }
 return {handle,auth};
}
