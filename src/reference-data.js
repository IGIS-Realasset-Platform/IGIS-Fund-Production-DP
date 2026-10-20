/* Authenticated, lazy reference-data reader. No records are added to workspace. */
(function(A){
 'use strict';
 const cache=new Map(),pending=new Map();let generation=0;
 const copy=value=>JSON.parse(JSON.stringify(value));
 async function load(kind,{companyKey='',force=false}={}){
  if(!['partners','laws'].includes(kind))throw Error('불러올 기준정보를 확인해 주세요.');
  const key=kind+':'+companyKey;if(!force&&cache.has(key))return copy(cache.get(key));if(pending.has(key))return pending.get(key);
  const current=generation,url='/api/reference-data?kind='+encodeURIComponent(kind)+(companyKey?'&companyKey='+encodeURIComponent(companyKey):'');
  const operation=(async()=>{let response;try{response=await fetch(url,{credentials:'same-origin',cache:'no-store',headers:{accept:'application/json'}})}catch{throw Error('기준정보를 불러오지 못했습니다. 다시 시도해 주세요.')}
   let value;try{value=await response.json()}catch{throw Error('기준정보 응답을 확인하지 못했습니다.')}
   if(!response.ok){const error=Object.assign(Error(response.status===401?'로그인이 만료되었습니다. 다시 로그인해 주세요.':response.status===403?'이 기준정보를 볼 권한이 없습니다.':'기준정보를 불러오지 못했습니다. 다시 시도해 주세요.'),{status:response.status,code:response.status===401?'SESSION_REQUIRED':'REFERENCE_UNAVAILABLE'});if(response.status===401)A.cloudSession?.sessionExpired?.(error);throw error;}
   if(!value||typeof value!=='object'||Array.isArray(value)||kind==='partners'&&(companyKey?!value.company||typeof value.company!=='object':!Array.isArray(value.groups)))throw Error('기준정보 응답 형식을 확인해 주세요.');
   if(current!==generation)throw Error('로그인 정보가 바뀌었습니다. 다시 열어 주세요.');cache.set(key,copy(value));return copy(value);
  })();pending.set(key,operation);try{return await operation}finally{if(pending.get(key)===operation)pending.delete(key)}
 }
 function reset(){generation++;cache.clear();pending.clear()}
 A.onCloudReset?.(reset);
 A.referenceData=Object.freeze({load,reset,peek:(kind,companyKey='')=>cache.has(kind+':'+companyKey)?copy(cache.get(kind+':'+companyKey)):null});
})(App);
