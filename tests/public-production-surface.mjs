import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

const DEFAULT_TIMEOUT_MS=15000;
const MAX_BODY_BYTES=12*1024*1024;
const APPROVED_BLOCKED_EMAIL='outside.testing@igisam.com';
const REQUIRED_PUBLIC_MARKERS=[
 'data-runtime-mode="real"',
 'id="app"',
 'auth-hidden',
 '/api/session',
 '/api/auth-login',
 '/api/auth-code',
 '/api/auth-verify',
 'loginEmail',
 'loginPassword',
 'cloud-auth-signup-open',
 '회원가입'
];
const FORBIDDEN_REQUEST_HEADERS=new Set(['authorization','cookie','x-vercel-protection-bypass','x-vercel-set-bypass-cookie']);
const sha256=value=>crypto.createHash('sha256').update(value).digest('hex');
const fail=(code,message)=>{const error=new Error(message);error.code=code;throw error;};
const assert=(condition,code,message)=>{if(!condition)fail(code,message);};
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
const same=(actual,expected)=>JSON.stringify(stable(actual))===JSON.stringify(stable(expected));

function exactOrigin(raw,label){
 let url;try{url=new URL(String(raw||''));}catch{fail('INVALID_INPUT',`${label}은 HTTPS origin이어야 합니다.`)}
 assert(url.protocol==='https:'&&url.origin===String(raw)&&!url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash,'INVALID_INPUT',`${label}은 경로·쿼리·계정정보 없는 HTTPS origin이어야 합니다.`);
 return url.origin;
}
function blockedCompanyEmail(raw){
 const email=String(raw||'').trim().toLowerCase(),parts=email.split('@'),local=parts[0]||'';
 assert(parts.length===2&&parts[1]==='igisam.com'&&local.length>0&&local.length<=64&&email.length<=254&&/^[a-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-z0-9!#$%&'*+\-/=?^_`{|}~]+)*$/.test(local),'INVALID_INPUT','합성 비허용 회사 이메일 형식을 확인해 주세요.');
 assert(email===APPROVED_BLOCKED_EMAIL,'INVALID_INPUT','승인된 합성 비허용 이메일만 사용할 수 있습니다.');
 return email;
}
function exactSha(raw){const value=String(raw||'').toLowerCase();assert(/^[0-9a-f]{64}$/.test(value),'INVALID_INPUT','승인 HTML SHA-256을 확인해 주세요.');return value;}
function responseHeader(response,name){return response.headers.get(name)||'';}
function hasSetCookie(response){return typeof response.headers.getSetCookie==='function'?response.headers.getSetCookie().length>0:response.headers.has('set-cookie');}
function jsonBody(text,label){try{return JSON.parse(text)}catch{fail('INVALID_RESPONSE',`${label} 응답이 JSON이 아닙니다.`)}}
function assertNoRedirectOrCookie(response,label){assert(!responseHeader(response,'location'),'UNEXPECTED_REDIRECT',`${label} 응답이 다른 주소로 이동했습니다.`);assert(!hasSetCookie(response),'UNEXPECTED_COOKIE',`${label} 응답이 세션 쿠키를 만들었습니다.`)}
function assertJsonResponse(response,label){assert(/^application\/json(?:;|$)/i.test(responseHeader(response,'content-type')),'INVALID_CONTENT_TYPE',`${label} 응답이 JSON 형식이 아닙니다.`);assert(/no-store/i.test(responseHeader(response,'cache-control')),'INVALID_CACHE_POLICY',`${label} 응답의 no-store 정책을 확인해 주세요.`)}

async function fetchOnce(fetchImpl,url,init,label,timeoutMs,observed){
 const headers=new Headers(init.headers||{});for(const name of FORBIDDEN_REQUEST_HEADERS)assert(!headers.has(name),'FORBIDDEN_HEADER',`${label} 요청에 금지된 인증·우회 헤더가 있습니다.`);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
 let response;try{response=await fetchImpl(url,{...init,headers,redirect:'manual',signal:controller.signal});}catch(error){fail(error?.name==='AbortError'?'HTTP_TIMEOUT':'HTTP_FAILED',`${label} 요청에 실패했습니다.`)}finally{clearTimeout(timer)}
 const body=await response.text();assert(Buffer.byteLength(body)<=MAX_BODY_BYTES,'BODY_TOO_LARGE',`${label} 응답 크기가 검수 상한을 넘었습니다.`);
 const item={label,status:response.status,contentType:responseHeader(response,'content-type'),cacheControl:responseHeader(response,'cache-control'),location:responseHeader(response,'location'),setCookie:hasSetCookie(response),bodyBytes:Buffer.byteLength(body),bodySha256:sha256(body)};observed.push(item);return{response,body,item};
}

function vercelProtection(response,body,previewOrigin){
 assert(response.status!==200,'PREVIEW_PUBLIC','보호 Preview root가 200으로 공개되었습니다.');
 if(response.status===401){
  const marker=[responseHeader(response,'server'),responseHeader(response,'x-vercel-id'),body].join('\n');
  assert(/vercel|authentication required|deployment protection/i.test(marker),'PREVIEW_NOT_VERCEL_PROTECTION','Preview 401이 Vercel 보호 응답인지 확인할 수 없습니다.');
  return{mode:'401',locationHost:'',locationPath:''};
 }
 assert([301,302,303,307,308].includes(response.status),'PREVIEW_STATUS',`Preview 보호 상태코드가 허용범위가 아닙니다: ${response.status}`);
 const raw=responseHeader(response,'location');assert(raw,'PREVIEW_LOCATION','Preview 보호 이동주소가 없습니다.');let location;try{location=new URL(raw,previewOrigin)}catch{fail('PREVIEW_LOCATION','Preview 보호 이동주소 형식이 올바르지 않습니다.')}
 assert(location.origin!==previewOrigin,'PREVIEW_SELF_REDIRECT','Preview가 자기 주소로만 이동합니다.');
 assert(location.protocol==='https:'&&(location.hostname==='vercel.com'||location.hostname.endsWith('.vercel.com')),'PREVIEW_LOCATION','Preview가 Vercel 공식 보호 주소로 이동하지 않습니다.');
 assert(/sso|login|auth/i.test(location.pathname),'PREVIEW_LOCATION','Preview 이동주소에서 Vercel 인증 경로를 확인할 수 없습니다.');
 return{mode:'redirect',locationHost:location.hostname,locationPath:location.pathname};
}

export async function runPublicProductionSurface({origin,preview,blockedEmail,expectedHtmlSha256,timeoutMs=DEFAULT_TIMEOUT_MS,fetchImpl=globalThis.fetch}={}){
 assert(typeof fetchImpl==='function','INVALID_INPUT','fetch 구현이 필요합니다.');origin=exactOrigin(origin,'공개 origin');preview=exactOrigin(preview,'Preview origin');assert(origin!==preview,'INVALID_INPUT','공개 origin과 Preview origin은 달라야 합니다.');blockedEmail=blockedCompanyEmail(blockedEmail);expectedHtmlSha256=exactSha(expectedHtmlSha256);assert(Number.isInteger(timeoutMs)&&timeoutMs>=1000&&timeoutMs<=30000,'INVALID_INPUT','timeout은 1000~30000ms 정수여야 합니다.');
 const observed=[],checks=[];const check=(name,fn)=>{fn();checks.push({name,status:'passed'})};
 const root=await fetchOnce(fetchImpl,origin+'/',{method:'GET',headers:{accept:'text/html'}},'public-root',timeoutMs,observed);
 check('PUBLIC-01 root는 redirect 없는 승인 HTML 200',()=>{assert(root.response.status===200,'PUBLIC_ROOT_STATUS',`공개 root 상태가 200이 아닙니다: ${root.response.status}`);assert(/^text\/html(?:;|$)/i.test(root.item.contentType),'INVALID_CONTENT_TYPE','공개 root가 HTML이 아닙니다.');assertNoRedirectOrCookie(root.response,'공개 root');assert(root.item.bodySha256===expectedHtmlSha256,'HTML_SHA_MISMATCH',`공개 root HTML SHA가 승인값과 다릅니다: ${root.item.bodySha256}`)});
 check('PUBLIC-02 승인 HTML은 독립 로그인·회원가입 계약을 포함',()=>{for(const marker of REQUIRED_PUBLIC_MARKERS)assert(root.body.includes(marker),'PUBLIC_LOGIN_MARKER',`공개 root에서 로그인 marker를 찾지 못했습니다: ${marker}`);assert(!/vercel\.com\/sso-api|deployment protection|authentication required/i.test(root.body),'PUBLIC_VERCEL_GATE','공개 root 본문이 Vercel 보호 화면입니다.')});
 const session=await fetchOnce(fetchImpl,origin+'/api/session',{method:'GET',headers:{accept:'application/json'}},'public-session',timeoutMs,observed);
 check('PUBLIC-03 무쿠키 session은 anonymous 200',()=>{assert(session.response.status===200,'SESSION_STATUS',`익명 session 상태가 200이 아닙니다: ${session.response.status}`);assertJsonResponse(session.response,'익명 session');assertNoRedirectOrCookie(session.response,'익명 session');assert(same(jsonBody(session.body,'익명 session'),{authenticated:false}),'SESSION_BODY','익명 session 응답 계약이 다릅니다.')});
 for(const [name,route]of [['workspace','/api/workspace'],['notion-source','/api/notion-source']]){
  const result=await fetchOnce(fetchImpl,origin+route,{method:'GET',headers:{accept:'application/json'}},`public-${name}`,timeoutMs,observed);
  check(`PUBLIC-${name==='workspace'?'04':'05'} 무쿠키 ${name}는 앱 AUTH_REQUIRED 401`,()=>{assert(result.response.status===401,'AUTH_REQUIRED_STATUS',`${name} 상태가 401이 아닙니다: ${result.response.status}`);assertJsonResponse(result.response,name);assertNoRedirectOrCookie(result.response,name);const body=jsonBody(result.body,name);assert(body.error==='AUTH_REQUIRED','AUTH_REQUIRED_BODY',`${name} 응답의 AUTH_REQUIRED가 없습니다.`)});
 }
 const blocked=await fetchOnce(fetchImpl,origin+'/api/auth-code',{method:'POST',headers:{accept:'application/json','content-type':'application/json',origin},body:JSON.stringify({email:blockedEmail})},'public-blocked-auth-code',timeoutMs,observed);
 check('PUBLIC-06 비명단 합성 회사메일은 발송성공 없이 403',()=>{assert(blocked.response.status===403,'BLOCKED_EMAIL_STATUS',`비명단 auth-code 상태가 403이 아닙니다: ${blocked.response.status}`);assertJsonResponse(blocked.response,'비명단 auth-code');assertNoRedirectOrCookie(blocked.response,'비명단 auth-code');const body=jsonBody(blocked.body,'비명단 auth-code');assert(body.error==='EMAIL_NOT_ALLOWED','BLOCKED_EMAIL_BODY','비명단 응답의 EMAIL_NOT_ALLOWED가 없습니다.');assert(body.sent!==true,'BLOCKED_EMAIL_SENT','비명단 응답이 발송 성공을 표시했습니다.');assert(!blocked.body.includes(blockedEmail),'BLOCKED_EMAIL_ECHO','비명단 이메일이 응답에 되돌아왔습니다.')});
 const protectedRoot=await fetchOnce(fetchImpl,preview+'/',{method:'GET',headers:{accept:'text/html'}},'protected-preview-root',timeoutMs,observed);let protection;
 check('PREVIEW-01 기존 Preview는 Vercel 보호 유지',()=>{protection=vercelProtection(protectedRoot.response,protectedRoot.body,preview)});
 return{schemaVersion:'public-production-surface-v1',status:'passed',runAt:new Date().toISOString(),inputs:{origin,preview,blockedEmailSha256:sha256(blockedEmail),expectedHtmlSha256,timeoutMs},requestSafety:{requestCount:observed.length,cookieJar:false,authorization:false,vercelBypass:false,redirectMode:'manual',retries:0,actualUserCredentialUsed:false},passwordContract:{newEnrollment:{min:8,max:15,boundaries:{reject:[7,16],allow:[8,15]}},login:{min:8,max:128,existingLongCredentialCompatibilityRequired:true},verifiedByThisHttpRun:false},checks,observed:observed.map(item=>({...item,location:item.label==='protected-preview-root'?(protection?.locationHost?`${protection.locationHost}${protection.locationPath}`:''):''})),mailBoundary:{actualMailboxRead:false,providerLogRead:false,successResponse:false,setCookie:false,httpBlockedBeforeAllowedFlow:true},limitations:['HTTP 본문 marker는 실제 브라우저의 시각·키보드 검수를 대신하지 않음','403과 서버 계약은 발송 성공 경로 진입 차단을 확인하지만 메일 제공자 로그를 직접 조회하지 않음','비밀번호 경계는 별도 합성/모델 검사 대상이며 이 무계정 HTTP 실행에서는 실제 계정으로 검증하지 않음']};
}

async function verifyLocalPasswordPolicy(){
 const policy=await import('../server/auth-policy.mjs?public-surface='+Date.now());
 assert(same(policy.PASSWORD_POLICY,{minLength:8,maxLength:15}),'PASSWORD_POLICY','신규 회원가입 비밀번호 정책이 8~15가 아닙니다.');
 assert(same(policy.LOGIN_PASSWORD_POLICY,{minLength:8,maxLength:128}),'PASSWORD_POLICY','로그인 비밀번호 정책이 8~128이 아닙니다.');
 for(const [length,expected]of [[7,false],[8,true],[15,true],[16,false]])assert(policy.validPassword('x'.repeat(length))===expected,'PASSWORD_POLICY',`신규 회원가입 ${length}자 경계가 다릅니다.`);
 for(const [length,expected]of [[7,false],[8,true],[15,true],[16,true],[32,true],[128,true],[129,false]])assert(policy.validLoginPassword('x'.repeat(length))===expected,'PASSWORD_POLICY',`로그인 ${length}자 경계가 다릅니다.`);
 assert(policy.validPassword(' xxxxxx ')===true&&policy.validPassword('xxxxxx')===false,'PASSWORD_POLICY','신규 회원가입 비밀번호 trim 금지 경계가 다릅니다.');
 assert(policy.validLoginPassword(' xxxxxx ')===true&&policy.validLoginPassword('xxxxxx')===false,'PASSWORD_POLICY','로그인 비밀번호 trim 금지 경계가 다릅니다.');
 return{assertions:15,newEnrollment:{min:8,max:15,reject:[7,16],allow:[8,15]},login:{min:8,max:128,reject:[7,129],allow:[8,15,16,32,128],existingLongCredentialCompatibilityRequired:true},trimmed:false};
}

function parseArgs(argv){const out={};const allowed=new Set(['origin','preview','blocked-email','expected-html-sha256','out','timeout-ms']);for(let i=0;i<argv.length;i++){const token=argv[i];if(['--execute-approved','--self-test','--password-policy-only'].includes(token)){out[token.slice(2)]=true;continue}assert(token.startsWith('--'),'INVALID_INPUT',`알 수 없는 인자입니다: ${token}`);const key=token.slice(2);assert(allowed.has(key),'INVALID_INPUT',`허용되지 않은 인자입니다: --${key}`);assert(i+1<argv.length&&!argv[i+1].startsWith('--'),'INVALID_INPUT',`--${key} 값이 없습니다.`);out[key]=argv[++i]}return out}
async function saveEvidence(file,value){const target=path.resolve(file),root=path.resolve('.build/deployment-20261019')+path.sep;assert(target.startsWith(root),'INVALID_OUTPUT','증거는 .build/deployment-20261019 아래에만 저장할 수 있습니다.');await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify(value,null,2));}
function fixtureResponse(body,{status=200,headers={}}={}){return new Response(typeof body==='string'?body:JSON.stringify(body),{status,headers});}
async function selfTest(){
 const origin='https://public.example.test',preview='https://preview.example.test',blockedEmail='outside.testing@igisam.com',html='<!doctype html><html lang="ko" data-runtime-mode="real"><body><div class="app dp-app auth-hidden" id="app"></div><script>const x=["/api/session","/api/auth-login","/api/auth-code","/api/auth-verify","loginEmail","loginPassword","cloud-auth-signup-open","회원가입"]</script></body></html>',expectedHtmlSha256=sha256(html),calls=[];
 const fetchImpl=async(url,init)=>{calls.push({url,init});if(url===origin+'/')return fixtureResponse(html,{headers:{'content-type':'text/html'}});if(url===origin+'/api/session')return fixtureResponse({authenticated:false},{headers:{'content-type':'application/json','cache-control':'private, no-store'}});if([origin+'/api/workspace',origin+'/api/notion-source'].includes(url))return fixtureResponse({error:'AUTH_REQUIRED',message:'로그인해 주세요.'},{status:401,headers:{'content-type':'application/json','cache-control':'private, no-store'}});if(url===origin+'/api/auth-code'){assert(init.headers.get('origin')===origin,'SELF_TEST','origin header');assert(JSON.parse(init.body).email===blockedEmail,'SELF_TEST','blocked email');return fixtureResponse({error:'EMAIL_NOT_ALLOWED',fieldErrors:[{field:'email',code:'EMAIL_NOT_ALLOWED'}]},{status:403,headers:{'content-type':'application/json','cache-control':'private, no-store'}})}if(url===preview+'/')return fixtureResponse('',{status:302,headers:{location:'https://vercel.com/sso-api'}});throw Error('unexpected fixture route')};
 const result=await runPublicProductionSurface({origin,preview,blockedEmail,expectedHtmlSha256,timeoutMs:1000,fetchImpl});assert(result.checks.length===7&&calls.length===6,'SELF_TEST','self-test count');return{suite:'public-production-surface-self-test',passed:7,failed:0,externalRequests:0};
}

async function main(){
 const args=parseArgs(process.argv.slice(2));if(args['self-test']){console.log(JSON.stringify(await selfTest()));return}
 if(args['password-policy-only']){const result=await verifyLocalPasswordPolicy();console.log(JSON.stringify({suite:'public-production-password-policy',passed:result.assertions,failed:0,externalRequests:0,contract:result}));return}
 assert(args['execute-approved'],'EXECUTION_NOT_APPROVED','외부 실행에는 root Ready 승인 뒤 --execute-approved가 필요합니다.');
 const out=args.out||'.build/deployment-20261019/public-production-surface.json';let evidence;
 try{const passwordPolicy=await verifyLocalPasswordPolicy();evidence=await runPublicProductionSurface({origin:args.origin,preview:args.preview,blockedEmail:args['blocked-email'],expectedHtmlSha256:args['expected-html-sha256'],timeoutMs:args['timeout-ms']===undefined?DEFAULT_TIMEOUT_MS:Number(args['timeout-ms'])});evidence.passwordContract={...passwordPolicy,verifiedByLocalSource:true,verifiedByThisHttpRun:false};await saveEvidence(out,evidence);console.log(JSON.stringify({status:evidence.status,passed:evidence.checks.length,failed:0,evidence:path.resolve(out)}))}
 catch(error){evidence={schemaVersion:'public-production-surface-v1',status:'failed',runAt:new Date().toISOString(),error:{code:String(error?.code||'UNEXPECTED_ERROR'),message:String(error?.message||'검사 실패')},externalStateChanged:false};try{await saveEvidence(out,evidence)}catch{}console.error(JSON.stringify(evidence));process.exitCode=1}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)await main();
