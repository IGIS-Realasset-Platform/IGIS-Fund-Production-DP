import {LawCollectionError,officialLawUrl,parseOfficialPage} from './law-collector.mjs';

const DIRECTORY='https://www.law.go.kr/ordinSc.do?menuId=3&subMenuId=27&tabMenuId=139';
const GUIDE='https://open.law.go.kr/LSO/openApi/guideResult.do?htmlName=ordinListGuide';
const DETAIL_GUIDE='https://open.law.go.kr/LSO/openApi/guideResult.do?htmlName=ordinInfoGuide';
const code=value=>typeof value==='string'&&/^\d{7}$/.test(value);
const list=value=>Array.isArray(value)?value:value===undefined||value===null?[]:[value];
const normalize=value=>String(value||'').replace(/[\sㆍ·]/g,'');
const scopeOrder=(a,b)=>Number(a.scope!=='metro')-Number(b.scope!=='metro');
const date=value=>{const raw=String(value||'');if(!/^\d{8}$/.test(raw))return null;const s=raw.replace(/^(\d{4})(\d{2})(\d{2})$/,'$1-$2-$3'),d=new Date(s+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===s?s:null;};
const fail=code=>{throw new LawCollectionError(code);};
const decode=value=>String(value).replace(/&#(x[0-9a-f]+|\d+);|&(amp|lt|gt|quot|apos|nbsp);/ig,(match,named,entity)=>{if(named){const n=named[0].toLowerCase()==='x'?parseInt(named.slice(1),16):Number(named);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'';}return {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[entity.toLowerCase()];}).replace(/<[^>]*>/g,'').trim();

// Evidence: docs/center-20261020-regional-law-review.{md,json}, R04-R08.
// These are review prompts, never application decisions or automatic permits.
export const REGIONAL_FAMILIES=[
 {id:'building',name:'건축·구조·굴토',queries:['건축'],accept:name=>/건축\s*조례|건축위원회|건축.*심의|굴토/.test(name),legalTracks:['건축·구조·굴토 심의 대상·예외 확인'],upperLawSources:[{title:'건축법 시행령 제5조의5',url:'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?lsJoLnkSeq=1028913615'}],projectFactsToCheck:['건축물 용도','층수·높이·연면적','다중이용·특수구조 여부','굴착깊이·주변 시설'],originalSectionsToCheck:['심의 대상·예외','광역·기초 위원회 업무 배분','관련 별표','변경·재심의','부칙·경과조치'],authoritiesToConfirm:['조례 제정기관','허가권자','광역 또는 기초 위원회']},
 {id:'planning-development',name:'도시계획·개발행위',queries:['계획','개발행위'],accept:name=>/(?:도시(?:[ㆍ·]?군)?계획|군계획)\s*(?:조례|시행규칙|위원회)|개발행위|성장관리|지구단위계획/.test(name),legalTracks:['개발행위허가 기준·필지별 계획 제한 확인'],upperLawSources:[{title:'국토의 계획 및 이용에 관한 법률 제58조',url:'https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1032697693'}],projectFactsToCheck:['필지·용도지역·지구·구역','토지 형질변경·사업 규모','높이·경사·수목·배수','기반시설 확보'],originalSectionsToCheck:['허가기준 및 별표','지구단위계획·성장관리계획의 공식 결정자료','예외','부칙·경과조치'],authoritiesToConfirm:['계획 결정기관','개발행위 허가권자','심의위원회']},
 {id:'landscape',name:'경관',queries:['경관'],accept:name=>/경관\s*(?:조례|시행규칙)|경관위원회|경관심의|경관계획/.test(name),legalTracks:['경관법 제27조 개발사업 경관심의','경관법 제28조 건축물 경관심의'],upperLawSources:[{title:'경관법 제28조',url:'https://law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsJoLnkSeq=1000307055'},{title:'법제처 해석 21-0351: 제27조·제28조 구별',url:'https://law.go.kr/expcInfoP.do?expcSeq=327203'}],projectFactsToCheck:['경관지구·중점경관관리구역','공공건축 여부','용도·규모','변경 행위'],originalSectionsToCheck:['개발사업·건축물 각각의 심의 대상·제외','지역 규모 기준','변경 심의·위원회 배분','부칙'],authoritiesToConfirm:['조례 제정기관','사업 승인기관','경관·건축위원회']},
 {id:'environmental-assessment',name:'환경영향평가',queries:['환경영향평가'],accept:name=>/환경영향평가/.test(name),legalTracks:['환경영향평가법 제42조 지역 평가 범위 검토'],upperLawSources:[{title:'환경영향평가법 제42조',url:'https://www.law.go.kr/lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1028855407'}],projectFactsToCheck:['사업 종류·규모·입지·시행주체','국가 평가 해당 여부','관할 도의 평가 조례 존재 여부','변경 규모·사업 기준일'],originalSectionsToCheck:['대상사업 범위·별표','인구 50만 이상 시와 관할 도 조례의 관계','제출·협의·의견수렴 시기','변경·재협의','부칙'],authoritiesToConfirm:['조례 제정권자','협의기관','승인기관','의견수렴 수행기관'],procedurePolicy:'광역·기초 후보를 이중 평가 절차로 자동 생성하지 않습니다.'}
];

export function parseRegionalMetros(html){
 const selected=String(html).match(/<select\b[^>]*\bid=["']ordinAreaCd["'][^>]*>([\s\S]*?)<\/select>/i)?.[1];if(!selected)fail('REGIONAL_DIRECTORY_INVALID');
 const rows=[...selected.matchAll(/<option\b[^>]*\bvalue=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi)].filter(m=>code(m[1])).map(m=>({code:m[1],name:decode(m[2]),sourceUrl:DIRECTORY,...(/^\(구\)/.test(decode(m[2]))?{historical:true}:{})}));
 if(!rows.length||rows.length>100||rows.some(r=>!r.name||r.name.length>80)||new Set(rows.map(r=>r.code)).size!==rows.length)fail('REGIONAL_DIRECTORY_INVALID');return rows;
}
function unselectableOptionGroups(html){const selected=String(html).match(/<select\b[^>]*\bid=["']ordinAreaCd["'][^>]*>([\s\S]*?)<\/select>/i)?.[1]||'';return [...selected.matchAll(/<option\b[^>]*\bvalue=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi)].filter(m=>m[1].includes(',')).map(m=>({name:decode(m[2]),codes:m[1].split(','),sourceUrl:DIRECTORY,selectable:false,reason:'multiple-organization-code-group'}));}
export function parseRegionalDistricts(xml,org){
 if(!code(org)||/<!DOCTYPE|<!ENTITY/i.test(xml)||!/^\s*(?:<\?xml[^>]*>\s*)?<areaList>[\s\S]*<\/areaList>\s*$/.test(xml))fail('REGIONAL_DIRECTORY_INVALID');
 const sourceUrl='https://www.law.go.kr/AreaListR.do?keyCd='+org,raw=[...xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)],rows=raw.map(m=>({code:m[1].match(/<orgCd>(\d{7})<\/orgCd>/)?.[1]||'',name:decode(m[1].match(/<orgNm>([\s\S]*?)<\/orgNm>/)?.[1]||''),sourceUrl}));
 if(!rows.length||rows.length>500||rows.some(r=>!code(r.code)||!r.name||r.name.length>80)||new Set(rows.map(r=>r.code)).size!==rows.length||!rows.some(r=>r.code===org))fail('REGIONAL_DIRECTORY_INVALID');return {head:rows.find(r=>r.code===org),districts:rows.filter(r=>r.code!==org)};
}
function requester(fetcher,deadline){let count=0;const request=async url=>{
 if(++count>24)fail('REGIONAL_REQUEST_LIMIT');if(Date.now()>=deadline)fail('REGIONAL_TIME_BUDGET');let response;try{response=await fetcher(url,{signal:AbortSignal.timeout(Math.max(1,Math.min(6000,deadline-Date.now()))),headers:{accept:'application/json, application/xml, text/html'},redirect:'error'});}catch{fail(Date.now()>=deadline?'REGIONAL_TIME_BUDGET':'REGIONAL_NETWORK_FAILED');}
 if(!response.ok)fail(response.status===401||response.status===403?'API_AUTH_FAILED':'REGIONAL_HTTP_FAILED');const max=2*1024*1024,declared=Number(response.headers?.get('content-length'));if(declared>max){await response.body?.cancel?.();fail('REGIONAL_RESPONSE_TOO_LARGE');}if(!response.body?.getReader)fail('REGIONAL_RESPONSE_INVALID');const reader=response.body.getReader(),parts=[];let size=0;try{while(true){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>max){await reader.cancel();fail('REGIONAL_RESPONSE_TOO_LARGE');}parts.push(Buffer.from(r.value));}}finally{reader.releaseLock();}return Buffer.concat(parts,size).toString('utf8');
 };return {request,get count(){return count;}};
}
function jurisdictionStatus(authority,metro,local,regions,districts){
 const a=normalize(authority),m=normalize(metro.name.replace(/^\(구\)/,'')),l=local?normalize(local.name):'';
 if(regions.some(r=>r.code!==metro.code&&!r.historical&&a.startsWith(normalize(r.name))))return'mismatch';
 if(!local&&districts.some(r=>a.endsWith(normalize(r.name))))return'mismatch';
 if(l&&!a.endsWith(l))return'mismatch';if(a.startsWith(m))return'matched-directory-label';
 // The official directory abbreviates some provinces. Do not invent a full-name
 // mapping or silently certify the returned authority from the selected code.
 return'code-filtered-name-unverified';
}
const metadata=family=>Object.fromEntries(Object.entries(family).filter(([key])=>!['queries','accept'].includes(key)));
export async function getRegionalLaws({mode='review',org,sborg,regionText='',projectRegion='',projectAddress='',oc,fetcher=fetch,clock=()=>new Date(),budgetMs=30000}={}){
 if(!['regions','districts','review'].includes(mode)||mode!=='regions'&&!code(org)||sborg!==undefined&&sborg!==''&&!code(sborg))fail('INVALID_REGIONAL_INPUT');
 const network=requester(fetcher,Date.now()+Math.min(30000,Math.max(1,budgetMs))),directoryHtml=await network.request(DIRECTORY),regions=parseRegionalMetros(directoryHtml);
 if(mode==='regions')return {mode,status:'success',regions,unselectableGroups:unselectableOptionGroups(directoryHtml),sourceUrl:DIRECTORY,checkedAt:clock().toISOString(),appliesToProject:false};
 const metro=regions.find(r=>r.code===org);if(!metro)fail('REGIONAL_ORGANIZATION_UNKNOWN');const directory=parseRegionalDistricts(await network.request('https://www.law.go.kr/AreaListR.do?keyCd='+org),org);
 if(mode==='districts')return {mode,status:'success',metro,districts:directory.districts,sourceUrl:directory.head.sourceUrl,checkedAt:clock().toISOString(),appliesToProject:false};
 if(!oc)fail('CONFIGURATION_MISSING');const local=sborg?directory.districts.find(r=>r.code===sborg):null;if(sborg&&!local)fail('REGIONAL_ORGANIZATION_MISMATCH');
 const scopes=[{scope:'metro',selection:directory.head},...(local?[{scope:'local',selection:local}]:[])],failures=[],results=new Map(REGIONAL_FAMILIES.map(f=>[f.id,{...metadata(f),candidates:[],searches:[],upperLawLinkStatus:'review_basis_only',notApplicable:false}]));
 const tasks=REGIONAL_FAMILIES.flatMap(family=>scopes.flatMap(scope=>family.queries.map(query=>({family,...scope,query})))),queue=[...tasks];
 async function worker(){while(queue.length){const task=queue.shift(),out=results.get(task.family.id),search={scope:task.scope,query:task.query,total:null,returned:0,pages:0,hasMore:false,status:'success'};out.searches.push(search);try{let total,received=0;const seen=new Set();for(let page=1;page<=2;page++){
  const url=new URL('https://www.law.go.kr/DRF/lawSearch.do');for(const[k,v]of Object.entries({OC:oc,target:'ordin',type:'JSON',query:task.query,search:1,org,sborg:task.selection.code,nw:1,display:100,page,sort:'lasc'}))url.searchParams.set(k,String(v));let body;try{body=JSON.parse(await network.request(url));}catch(error){if(error instanceof LawCollectionError)throw error;fail('REGIONAL_RESPONSE_INVALID');}if(String(body.OrdinSearch?.resultCode)!=='00')fail('REGIONAL_API_ERROR');const parsed=parseOfficialPage(body,'ordin',page,{allowEmpty:true});if(total===undefined)total=parsed.total;if(total!==parsed.total)fail('PAGINATION_CHANGED');search.total=total;
  for(const row of parsed.records){const sequence=String(row['자치법규일련번호']||''),name=String(row['자치법규명']||''),effectiveAt=date(row['시행일자']),announcedAt=date(row['공포일자']),authority=String(row['지자체기관명']||''),kind=String(row['자치법규종류']||''),lawId=String(row['자치법규ID']||'');if(!/^\d{1,30}$/.test(sequence)||!name||name.length>300||!effectiveAt||!announcedAt||!authority||authority.length>120||!/^\d{1,30}$/.test(lawId)||String(row['공포번호']||'').length>100)fail('INCOMPLETE_VERSION');if(seen.has(sequence))fail('DUPLICATE_PAGE_RECORD');seen.add(sequence);if(!task.family.accept(name)||!['조례','규칙','훈령','예규','고시','기타'].includes(kind))continue;const comparison=jurisdictionStatus(authority,metro,task.scope==='local'?local:null,regions,directory.districts);if(comparison==='mismatch')fail('REGIONAL_AUTHORITY_MISMATCH');let candidate=out.candidates.find(r=>r.sequence===sequence);if(!candidate){candidate={id:'ordin:'+sequence,name,target:'ordin',sequence,lawId,effectiveAt,announcedAt,number:String(row['공포번호']||''),kind,authority,scope:task.scope,scopes:[task.scope],officialUrl:officialLawUrl('ordin',sequence,effectiveAt),jurisdictionStatus:comparison,appendixStatus:'not_checked',isRequired:false};out.candidates.push(candidate);}else {if(candidate.name!==name||candidate.authority!==authority||candidate.lawId!==lawId||candidate.effectiveAt!==effectiveAt||candidate.announcedAt!==announcedAt||candidate.kind!==kind||candidate.number!==String(row['공포번호']||''))fail('REGIONAL_CANDIDATE_CONFLICT');if(!candidate.scopes.includes(task.scope))candidate.scopes.push(task.scope);}}
  received+=parsed.records.length;search.returned=received;search.pages=page;if(received===total)break;if(received>total||parsed.records.length!==100)fail('PAGE_COUNT_MISMATCH');if(page===2){search.hasMore=true;search.status='partial_failure';failures.push({scope:task.scope,query:task.query,code:'REGIONAL_PAGE_LIMIT',message:'조회한 앞 200건 이외의 결과가 있어 원문에서 추가 확인해 주세요.'});}
 }}catch(error){search.status='failed';failures.push({scope:task.scope,query:task.query,code:error.code||'REGIONAL_LOOKUP_FAILED',message:'이 범위의 공식 조례 후보를 확인하지 못했습니다. 비대상으로 판단하지 마세요.'});}}
 }
 await Promise.all([worker(),worker(),worker()]);const families=[...results.values()].map(f=>({...f,candidates:f.candidates.sort((a,b)=>scopeOrder(a,b)||a.name.localeCompare(b.name,'ko')||a.sequence.localeCompare(b.sequence)),searches:f.searches.sort((a,b)=>scopeOrder(a,b)||a.query.localeCompare(b.query,'ko')),status:f.searches.every(s=>s.status==='success')?'success':f.searches.every(s=>s.status==='failed')?'failed':'partial_failure'})),status=families.every(f=>f.status==='success')?'success':families.every(f=>f.status==='failed')?'failed':'partial_failure';
 return {mode,status,jurisdiction:{input:regionText,projectRegion,projectAddress,metro,local,status:'selected-official-codes',projectMatch:'unverified',localReview:local?'selected':'not_selected'},families,failures,coverage:{scopes:scopes.map(s=>s.scope),maxPagesPerSearch:2,pageSize:100,completeLegalReview:false,appendicesChecked:false,sourceGuide:GUIDE,appendixGuide:DETAIL_GUIDE},requestCount:network.count,checkedAt:clock().toISOString(),appliesToProject:false};
}
