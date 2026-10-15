// 배포 서버 안에서만 SMTP 연결을 확인합니다. 메일 전송·인증 활성화는 하지 않습니다.
export async function verifyMailConfiguration(env={},options={}){
 const skipped={configured:false,connection:'not-run'};
 const {approvedHtmlSha256,actualHtmlSha256,timeoutMs=12000}=options;
 if(!/^[a-f0-9]{64}$/i.test(approvedHtmlSha256||'')||approvedHtmlSha256.toLowerCase()!==String(actualHtmlSha256).toLowerCase())return skipped;
 if(env.VERCEL!=='1'||env.VERCEL_ENV!=='preview'||env.VERCEL_GIT_COMMIT_REF!=='preview/core-v0.11.0'||env.DP_MAIL_PROVIDER!=='gmail')return skipped;
 const user=String(env.DP_GMAIL_USER||'').trim().toLowerCase(),pass=String(env.DP_GMAIL_APP_PASSWORD||'').replace(/\s/g,'');
 if(!/^[a-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-z0-9!#$%&'*+\-/=?^_`{|}~]+)*@gmail\.com$/.test(user)||user.length>254||!/^[a-z0-9]{16}$/i.test(pass))return skipped;
 let transport,timer;
 try{
  const createTransport=options.createTransport||(await import('nodemailer')).default.createTransport;
  transport=createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user,pass},tls:{rejectUnauthorized:true,minVersion:'TLSv1.2'},logger:false,debug:false,connectionTimeout:10000,greetingTimeout:10000,socketTimeout:10000,disableFileAccess:true,disableUrlAccess:true});
  if(typeof transport?.verify!=='function')throw Error('unavailable');
  const limit=Number.isFinite(timeoutMs)&&timeoutMs>0?Math.min(timeoutMs,12000):12000;
  const verified=await Promise.race([Promise.resolve().then(()=>transport.verify()),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('unavailable')),limit)})]);
  return {configured:true,connection:verified===true?'verified':'unavailable'};
 }catch{
  return {configured:true,connection:'unavailable'};
 }finally{
  clearTimeout(timer);
  try{transport?.close?.()}catch{/* SMTP 오류나 서버 응답을 로그에 남기지 않습니다. */}
 }
}
