(() => {
 const assetFetch=window.fetch.bind(window);
 const base=new URL('.',document.currentScript.src);
 const storageKey='idm-pages-review-v2:'+base.pathname;
 const stageKey=storageKey+':financing';
 const workspaceId='idm-pages-review-v2';
 const user={id:'team-reviewer',email:'reviewer@example.invalid'};
 const loadData=name=>assetFetch(new URL('review-data/'+name+'.json',base)).then(response=>{
  if(!response.ok)throw Error('검토용 사업을 불러오지 못했습니다.');
  return response.json();
 });
 const initial=loadData('workspace');
 const financing=loadData('finance-stages');
 let partnerReference,marketReference;
 const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8'}});
 async function readWorkspace(){
  const saved=localStorage.getItem(storageKey);
  return saved?JSON.parse(saved):{revision:0,state:await initial};
 }
 function envelope(record){
  return {...record,workspaceId,user,capabilities:{createProject:true,manageAccess:true,viewPlatformSpec:true},
   projectRoles:Object.fromEntries(record.state.projects.map(project=>[project.id,'approver']))};
 }
 async function saveWorkspace(input){
  if(input?.workspaceId!==workspaceId||typeof input.requestId!=='string'||!Array.isArray(input.state?.projects)||!input.state.sourceLoad)return json({error:'INVALID_WORKSPACE'},422);
  const current=await readWorkspace();
  if(current.revision!==input.baseRevision)return json({error:'REVISION_CONFLICT'},409);
  const record={revision:current.revision+1,state:input.state};
  localStorage.setItem(storageKey,JSON.stringify(record));
  return json({...record,requestId:input.requestId,workspaceId});
 }
 async function stageRequest(url,request,input){
  const projectId=url.searchParams.get('projectId');
  const {state}=await readWorkspace();
  if(!state.projects.some(project=>project.id===projectId&&!project.deletedAt))return json({error:'PROJECT_NOT_FOUND'},404);
  const saved=JSON.parse(localStorage.getItem(stageKey)||'{}');
  let stages=Object.hasOwn(saved,projectId)?saved[projectId]:(await financing)[projectId]||[];
  if(request.method==='GET')return json({stages});
  const {operation,id,revision,record}=input||{};
  if(!['create','update','delete'].includes(operation))return json({error:'INVALID_OPERATION'},422);
  const previous=stages.find(row=>row.id===id);
  if(operation!=='create'&&!previous)return json({error:'STAGE_NOT_FOUND'},404);
  if(operation!=='create'&&previous.revision!==revision)return json({error:'REVISION_CONFLICT'},409);
  let stage;
  if(operation==='delete')stages=stages.filter(row=>row.id!==id);
  else {
   if(!record?.name?.trim()||!record?.reason?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(record.date)||
     !Object.values(record.values||{}).every(value=>value===null||Number.isSafeInteger(value)&&value>=0))return json({error:'INVALID_STAGE'},422);
   stage={...record,id:previous?.id||crypto.randomUUID(),revision:(previous?.revision||0)+1,sample:previous?.sample||false};
   stages=previous?stages.map(row=>row.id===id?stage:row):[...stages,stage];
   stages.sort((a,b)=>a.date.localeCompare(b.date));
  }
  localStorage.setItem(stageKey,JSON.stringify({...saved,[projectId]:stages}));
  return json({stages,...(stage?{stage}:{deleted:true})},operation==='create'?201:200);
 }
 async function readReference(url){
  const {snapshot,companies}=await (partnerReference??=loadData('partners-reference'));
  const key=url.searchParams.get('companyKey');
  if(url.pathname==='/api/partner-comments'){
   if(url.searchParams.get('mode')==='summary')return json({summaries:Object.entries(companies).map(([companyKey,company])=>({
    companyKey,totalCount:(company.officialComments?.length||0)+(company.legacyOnlineComments?.length||0),onlineCount:0,recent31day:false,
   }))});
   if(!key||!Object.hasOwn(companies,key))return json({error:'COMPANY_NOT_FOUND'},404);
   const company=companies[key];
   return json({companyKey:key,seedComments:company.officialComments||[],legacyOnlineComments:company.legacyOnlineComments||[],onlineComments:[],totalCount:(company.officialComments?.length||0)+(company.legacyOnlineComments?.length||0),onlineCount:0,recent31day:false});
  }
  const version=url.searchParams.get('version');
  if(version&&version!==snapshot.version)return json({error:'REFERENCE_VERSION_NOT_FOUND'},404);
  if(key)return Object.hasOwn(companies,key)?json({version:snapshot.version,company:companies[key]}):json({error:'COMPANY_NOT_FOUND'},404);
  const existing=snapshot.market?.series||[];
  if(existing.some(series=>series.displayRole==='primary'))return json(snapshot);
  const market=await (marketReference??=loadData('market-reference'));
  const ids=new Set(market.series.map(series=>series.id));
  const prior=existing.filter(series=>!ids.has(series.id)).map(series=>series.id==='kosis-construction'&&!series.displayRole?{...series,displayRole:'archive'}:series);
  return json({...snapshot,market:{...snapshot.market,series:[...market.series.map(series=>({...series,checkedAt:market.checkedAt})),...prior]}});
 }
 const locked=(key,fn)=>navigator.locks?navigator.locks.request(key,fn):fn();
 window.fetch=async (input,options)=>{
  const request=new Request(input,options);
  const url=new URL(request.url);
  if(url.origin!==location.origin)return json({error:'REVIEW_ONLY'},403);
  if(!url.pathname.startsWith('/api/')){
   return url.pathname.startsWith(base.pathname)?assetFetch(request):json({error:'REVIEW_ONLY'},403);
  }
  try {
   if(request.method==='PUT'){
    const data=await request.json();
    if(url.pathname==='/api/workspace')return await locked(storageKey,()=>saveWorkspace(data));
    if(url.pathname==='/api/local-finance-stages')return await locked(stageKey,()=>stageRequest(url,request,data));
   }
   if(request.method!=='GET')return json({error:'REVIEW_ONLY'},405);
   switch(url.pathname){
    case '/api/workspace': return json(envelope(await readWorkspace()));
    case '/api/session': return json({authenticated:true,userId:user.id,email:user.email,newAccountCreated:false});
    case '/api/local-finance-stages': return await stageRequest(url,request);
    case '/api/notion-source': return json({available:false});
    case '/api/notifications': return json({states:[],tasks:[],alerts:[]});
    case '/api/report-archives': if(!url.searchParams.has('id'))return json({snapshots:[]}); break;
    case '/api/cost-snapshots': if(!url.searchParams.has('id'))return json({snapshots:[],tasks:[]}); break;
    case '/api/local-access-preview': return json({
     people:[['샘플 검토자',user.email,'샘플 조직','사용',[],[]]],
     projects:(await readWorkspace()).state.projects.map(project=>project.name),
    });
    case '/api/partner-comments': return await readReference(url);
    case '/api/reference-data': if(url.searchParams.get('kind')==='partners')return await readReference(url); break;
   }
   return json({error:'REVIEW_ONLY'},404);
  }catch{return json({error:'REVIEW_STORAGE_UNAVAILABLE'},503)}
 };
})();
