import {koreaDate} from './date-time.mjs';
import {normalizeDartApiKey,normalizeG2bServiceKey,providerCredentialFormat} from './provider-credential-format.mjs';

const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const uint=(v,min=0)=>(typeof v==='number'||typeof v==='string'&&/^\d+$/.test(v))&&Number.isSafeInteger(Number(v))&&Number(v)>=min;
const limits=Object.freeze({maxRequests:2,budgetMs:30000,requestTimeoutMs:15000,maxResponseBytes:128*1024,maxTotalBytes:256*1024});
const outcome=(status,authenticated=null,officialCode=null)=>({status,authenticated,officialCode});
const stop=code=>{throw Object.assign(Error(code),{code});};

// Only typed statuses leave this module. Provider messages and request URLs may
// contain credentials and are never returned, logged, or attached to errors.
function dartResult(raw){
 if(!object(raw)||typeof raw.status!=='string'||!/^\d{3}$/.test(raw.status))return outcome('invalid_response');
 const code=raw.status;
 if(code==='013')return outcome('no_data',true,code);
 if(code==='000'){
  if(!uint(raw.page_no,1)||Number(raw.page_no)!==1||!uint(raw.page_count,1)||Number(raw.page_count)!==1||!uint(raw.total_count,1)||!uint(raw.total_page,1)||Number(raw.total_page)!==Number(raw.total_count)||!Array.isArray(raw.list)||raw.list.length!==1||!object(raw.list[0]))return outcome('invalid_response',null,code);
  return outcome('success',true,code);
 }
 const statuses={'010':'authentication_failed','011':'authentication_failed','012':'access_denied','020':'rate_limited','021':'invalid_request','100':'invalid_request','101':'access_denied','800':'service_unavailable','900':'provider_error','901':'authentication_failed'};
 const status=statuses[code]||'provider_error';return outcome(status,status==='authentication_failed'?false:null,code);
}
function g2bCode(code,message=''){
 if(typeof code!=='string'||!/^\d{2}$/.test(code))return outcome('invalid_response');
 const statuses={'01':'provider_error','04':'invalid_request','05':'network_error','10':'invalid_request','12':'service_unavailable','20':'access_denied','22':'rate_limited','23':'rate_limited','29':'access_denied','30':'authentication_failed','31':'authentication_failed','32':'access_denied','99':'provider_error'};
 const status=code==='20'&&message==='SERVICE_KEY_IS_NULL'?'authentication_failed':statuses[code]||'provider_error';return outcome(status,status==='authentication_failed'?false:null,code);
}
function g2bResult(raw){
 if(!object(raw)||raw.response&&raw.header)return outcome('invalid_response');const root=raw.response||raw,header=root.header;
 if(!object(header)||typeof header.resultCode!=='string')return outcome('invalid_response');
 if(header.resultCode!=='00')return g2bCode(header.resultCode,header.resultMsg);
 const body=root.body;if(!object(body)||!uint(body.pageNo,1)||Number(body.pageNo)!==1||!uint(body.numOfRows,1)||Number(body.numOfRows)!==1||!uint(body.totalCount))return outcome('invalid_response',null,'00');
 const total=Number(body.totalCount),items=body.items;let rows;
 if(Array.isArray(items))rows=items;else if(object(items)){if(Array.isArray(items.item))rows=items.item;else if(object(items.item))rows=[items.item];else if(items.item===undefined&&total===0)rows=[];}else if(total===0&&(items===null||items===undefined||items===''))rows=[];
 if(!rows||rows.length!==Math.min(1,total)||rows.some(row=>!object(row)))return outcome('invalid_response',null,'00');
 return outcome(total===0?'no_data':'success',true,'00');
}
function parseResult(provider,body){
 if(typeof body!=='string'||!body.isWellFormed())return outcome('invalid_response');
 try{return provider==='dart'?dartResult(JSON.parse(body)):g2bResult(JSON.parse(body));}catch{}
 if(provider!=='g2b'||/<!DOCTYPE|<!ENTITY/i.test(body))return outcome('invalid_response');
 const match=body.match(/^\s*(?:<\?xml[^?]*\?>\s*)?<OpenAPI_ServiceResponse>\s*<cmmMsgHeader>\s*(?:<errMsg>[^<]{0,256}<\/errMsg>\s*)?<returnAuthMsg>([A-Z_ ]{1,100})<\/returnAuthMsg>\s*<returnReasonCode>(\d{2})<\/returnReasonCode>\s*<\/cmmMsgHeader>\s*<\/OpenAPI_ServiceResponse>\s*$/);
 return match&&match[2]!=='00'?g2bCode(match[2],match[1]):outcome('invalid_response');
}
function errorResult(error){return outcome(error?.code==='CHECK_TIMEOUT'?'timeout':['CHECK_BODY_LIMIT','CHECK_REDIRECT','CHECK_INVALID_RESPONSE'].includes(error?.code)?'invalid_response':'network_error');}

/** Fixed, bounded, read-only authentication probes. Has no database dependency. */
export async function verifyProviderConnections({env={},fetcher=fetch,clock=()=>new Date(),signal}={}){
 const start=performance.now(),day=koreaDate(clock()).replaceAll('-','');let requests=0,totalBytes=0;
 async function probe(provider,url){
  let timer,reader,controller,response;const remaining=limits.budgetMs-(performance.now()-start);if(remaining<=0)return outcome('timeout');
  try{
   if(requests>=limits.maxRequests)stop('CHECK_REQUEST_LIMIT');controller=new AbortController();
   const effectiveSignal=signal?AbortSignal.any([signal,controller.signal]):controller.signal;
   const timedOut=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Object.assign(Error('CHECK_TIMEOUT'),{code:'CHECK_TIMEOUT'}));},Math.max(1,Math.min(limits.requestTimeoutMs,remaining)));});
   requests++;response=await Promise.race([fetcher(url.href,{method:'GET',redirect:'manual',signal:effectiveSignal,headers:{accept:'application/json, application/xml'}}),timedOut]);
   if(response.status>=300&&response.status<400)stop('CHECK_REDIRECT');if(response.status===429)return outcome('rate_limited');
   const declared=response.headers.get('content-length');if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>limits.maxResponseBytes))stop('CHECK_BODY_LIMIT');
   if(!response.body?.getReader)return outcome('invalid_response');reader=response.body.getReader();const chunks=[];let length=0;
   while(true){const part=await Promise.race([reader.read(),timedOut]);if(part.done)break;length+=part.value.byteLength;totalBytes+=part.value.byteLength;if(length>limits.maxResponseBytes||totalBytes>limits.maxTotalBytes)stop('CHECK_BODY_LIMIT');chunks.push(Buffer.from(part.value));}
   let body;try{body=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks,length));}catch{stop('CHECK_INVALID_RESPONSE');}const result=parseResult(provider,body);
   if(response.ok)return result;
   // Official errors may arrive as HTTP errors. Never accept an HTTP error as
   // authenticated even when its body happens to resemble a success response.
   if(result.officialCode&&!['success','no_data','invalid_response'].includes(result.status))return result;
   return outcome(response.status===401?'authentication_failed':response.status===403?'access_denied':response.status>=500?'service_unavailable':'invalid_response',response.status===401?false:null);
  }catch(error){return errorResult(error);}finally{clearTimeout(timer);controller?.abort();if(reader){try{void reader.cancel().catch(()=>{});}catch{}try{reader.releaseLock();}catch{}}else if(response?.body){try{void response.body.cancel().catch(()=>{});}catch{}}}
 }
 async function dart(){
  const key=env.DP_DART_API_KEY;if(key===undefined||key===null||key==='')return outcome('configuration_missing');let normalized;try{normalized=normalizeDartApiKey(key);}catch{return{...outcome('invalid_configuration'),format:providerCredentialFormat(key,'dart')};}
  const url=new URL('https://opendart.fss.or.kr/api/list.json');for(const[k,v]of Object.entries({crtfc_key:normalized,bgn_de:day,end_de:day,page_no:'1',page_count:'1',sort:'date',sort_mth:'desc'}))url.searchParams.set(k,v);return probe('dart',url);
 }
 async function g2b(){
  const key=env.DP_G2B_SERVICE_KEY;if(key===undefined||key===null||key==='')return outcome('configuration_missing');let normalized;try{normalized=normalizeG2bServiceKey(key);}catch{return{...outcome('invalid_configuration'),format:providerCredentialFormat(key,'g2b')};}
  const url=new URL('https://apis.data.go.kr/1230000/ao/CntrctInfoService/getCntrctInfoListCnstwk');for(const[k,v]of Object.entries({serviceKey:normalized,pageNo:'1',numOfRows:'1',inqryDiv:'1',type:'json',inqryBgnDt:day+'0000',inqryEndDt:day+'2359'}))url.searchParams.set(k,v);return probe('g2b',url);
 }
 const providers={dart:await dart(),g2b:await g2b()};return{mode:'verify-provider-connections',checkedAt:clock().toISOString(),readOnly:true,providers,requests,bytes:totalBytes,limits,databaseWrites:0};
}
