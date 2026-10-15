import {AuthUnavailableError,companyEmail} from './email-auth.mjs';

export const GMAIL_SMTP_HOST='smtp.gmail.com';
export const GMAIL_SMTP_PORT=465;

function configuredGmailUser(raw){
 if(typeof raw!=='string')throw new AuthUnavailableError();
 const email=raw.trim().toLowerCase(),parts=email.split('@'),local=parts[0]||'';
 if(parts.length!==2||parts[1]!=='gmail.com'||local.length>64||email.length>254||!/^[a-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-z0-9!#$%&'*+\-/=?^_`{|}~]+)*$/.test(local))throw new AuthUnavailableError();
 return email;
}
function configuredAppPassword(raw){
 if(typeof raw!=='string')throw new AuthUnavailableError();
 const password=raw.replace(/\s/g,'');
 if(!/^[a-z0-9]{16}$/i.test(password))throw new AuthUnavailableError();
 return password;
}

export function createGmailCodeSender({gmailUser,appPassword}={},createTransport){
 const user=configuredGmailUser(gmailUser),pass=configuredAppPassword(appPassword);
 if(typeof createTransport!=='function')throw new AuthUnavailableError();
 let transport;
 try{
  transport=createTransport({host:GMAIL_SMTP_HOST,port:GMAIL_SMTP_PORT,secure:true,auth:{user,pass},tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},logger:false,debug:false,connectionTimeout:10000,greetingTimeout:10000,socketTimeout:10000,disableFileAccess:true,disableUrlAccess:true});
 }catch{throw new AuthUnavailableError()}
 if(!transport||typeof transport.sendMail!=='function')throw new AuthUnavailableError();
 return async ({email,otp,type}={})=>{
  email=companyEmail(email);
  if(type!=='sign-in'||typeof otp!=='string'||!/^\d{6}$/.test(otp))throw new AuthUnavailableError();
  let delivery;
  try{
   delivery=await transport.sendMail({from:user,to:email,subject:'개발사업관리플랫폼 이메일 확인번호',text:`확인번호: ${otp}\n\n5분 안에 입력해 주세요. 요청하지 않은 메일이면 무시해 주세요.`});
  }catch{throw new AuthUnavailableError()}
  if(!Array.isArray(delivery?.accepted)||delivery.accepted.length!==1||delivery.accepted[0]!==email||!Array.isArray(delivery.rejected)||delivery.rejected.length!==0)throw new AuthUnavailableError();
  return {accepted:true};
 };
}
