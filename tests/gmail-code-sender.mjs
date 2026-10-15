import assert from 'node:assert/strict';
import {AuthUnavailableError} from '../server/email-auth.mjs';
import {GMAIL_SMTP_HOST,GMAIL_SMTP_PORT,createGmailCodeSender} from '../server/gmail-code-sender.mjs';

const checks=[];
async function check(name,run){
 try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}
 catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}
}
function fixture({delivery,transportError,createError}={}){
 const state={options:null,messages:[],createCalls:0};
 const createTransport=options=>{
  state.createCalls++;state.options=structuredClone(options);
  if(createError)throw createError;
  return {sendMail:async message=>{
   state.messages.push(structuredClone(message));
   if(transportError)throw transportError;
   return delivery||{accepted:[message.to],rejected:[]};
  }};
 };
 return {state,createTransport};
}
const validPassword='abcd efgh ijkl mnop';
const validConfiguration={gmailUser:'qa.sender@gmail.com',appPassword:validPassword};

await check('GMAIL-01 고정발신·TLS·시간제한·외부첨부차단 설정',async()=>{
 const {state,createTransport}=fixture(),send=createGmailCodeSender(validConfiguration,createTransport);
 assert.equal(GMAIL_SMTP_HOST,'smtp.gmail.com');assert.equal(GMAIL_SMTP_PORT,465);assert.equal(state.createCalls,1);
 assert.deepEqual(state.options,{host:GMAIL_SMTP_HOST,port:GMAIL_SMTP_PORT,secure:true,auth:{user:'qa.sender@gmail.com',pass:'abcdefghijklmnop'},tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},logger:false,debug:false,connectionTimeout:10000,greetingTimeout:10000,socketTimeout:10000,disableFileAccess:true,disableUrlAccess:true});
 assert.equal(typeof send,'function');
});

await check('GMAIL-02 회사메일 한명·숫자6자리·plain text만 접수',async()=>{
 const {state,createTransport}=fixture(),send=createGmailCodeSender(validConfiguration,createTransport),result=await send({email:'  QA.User@IGISAM.COM  ',otp:'123456',type:'sign-in',from:'attacker@example.com',attachments:[{path:'file:///private'}]});
 assert.deepEqual(result,{accepted:true});assert.equal(state.messages.length,1);
 const message=state.messages[0];assert.equal(message.from,'qa.sender@gmail.com');assert.equal(message.to,'qa.user@igisam.com');assert.match(message.subject,/개발사업관리플랫폼|확인번호/);assert.match(message.text,/123456/);
 assert.equal(message.html,undefined);assert.equal(message.attachments,undefined);assert.equal(Array.isArray(message.to),false);
});

await check('GMAIL-03 잘못된도메인·코드·용도·헤더삽입은 전송전 차단',async()=>{
 const {state,createTransport}=fixture(),send=createGmailCodeSender(validConfiguration,createTransport);
 for(const payload of [
  {email:'qa@example.com',otp:'123456',type:'sign-in'},
  {email:'qa@igisam.com',otp:'12345',type:'sign-in'},
  {email:'qa@igisam.com',otp:'123456',type:'sign-up'},
  {email:'qa@igisam.com\r\nBcc: attacker@example.com',otp:'123456',type:'sign-in'},
  {email:'qa@igisam.com',otp:'123456\r\nBcc: attacker@example.com',type:'sign-in'}
 ])await assert.rejects(()=>send(payload));
 assert.equal(state.messages.length,0);
});

await check('GMAIL-04 앱비밀번호16자만 허용하고 일반비밀번호 fallback을 만들지 않는다',async()=>{
 for(const appPassword of ['',null,'ordinary-password','abcdefghijklmnopq']){
  const {state,createTransport}=fixture();assert.throws(()=>createGmailCodeSender({gmailUser:'qa.sender@gmail.com',appPassword},createTransport),AuthUnavailableError);assert.equal(state.createCalls,0);
 }
 for(const gmailUser of ['',null,'qa.sender@example.com','qa sender@gmail.com','qa.sender@gmail.com\r\nBcc: attacker@example.com']){
  const {state,createTransport}=fixture();assert.throws(()=>createGmailCodeSender({gmailUser,appPassword:validPassword},createTransport),AuthUnavailableError);assert.equal(state.createCalls,0);
 }
});

await check('GMAIL-05 exact수신자1·거절0이 아니면 성공으로 처리하지 않는다',async()=>{
 for(const delivery of [
  {accepted:[],rejected:[]},
  {accepted:['other@igisam.com'],rejected:[]},
  {accepted:['qa.user@igisam.com','other@igisam.com'],rejected:[]},
  {accepted:['qa.user@igisam.com'],rejected:['rejected@example.com']}
 ]){
  const {createTransport}=fixture({delivery}),send=createGmailCodeSender(validConfiguration,createTransport);
  await assert.rejects(()=>send({email:'qa.user@igisam.com',otp:'123456',type:'sign-in'}),AuthUnavailableError);
 }
});

await check('GMAIL-06 SMTP·timeout·transport생성 예외는 raw원인을 노출하지 않는다',async()=>{
 const markers=['synthetic-smtp-secret','synthetic-timeout-secret'];
 for(const marker of markers){
  const {createTransport}=fixture({transportError:Object.assign(new Error(marker),{code:marker.includes('timeout')?'ETIMEDOUT':'EAUTH'})}),send=createGmailCodeSender(validConfiguration,createTransport);
  await assert.rejects(()=>send({email:'qa.user@igisam.com',otp:'123456',type:'sign-in'}),error=>error instanceof AuthUnavailableError&&!error.message.includes(marker)&&!String(error.stack).includes(marker));
 }
 const {createTransport}=fixture({createError:new Error('synthetic-create-secret')});assert.throws(()=>createGmailCodeSender(validConfiguration,createTransport),error=>error instanceof AuthUnavailableError&&!error.message.includes('synthetic-create-secret'));
});

await check('GMAIL-07 발송경로는 console·debug·credential logger를 사용하지 않는다',async()=>{
 const logs=[],original={log:console.log,warn:console.warn,error:console.error,debug:console.debug};
 console.log=(...args)=>logs.push(args);console.warn=(...args)=>logs.push(args);console.error=(...args)=>logs.push(args);console.debug=(...args)=>logs.push(args);
 try{const {createTransport}=fixture(),send=createGmailCodeSender(validConfiguration,createTransport);await send({email:'qa.user@igisam.com',otp:'123456',type:'sign-in'});}finally{Object.assign(console,original)}
 assert.deepEqual(logs,[]);
});

const failed=checks.filter(item=>item.status==='failed');
console.log(JSON.stringify({suite:'gmail-code-sender',passed:checks.length-failed.length,failed:failed.length,total:checks.length,realEmailSent:false,realCredentialRead:false,checks}));
if(failed.length)process.exitCode=1;
