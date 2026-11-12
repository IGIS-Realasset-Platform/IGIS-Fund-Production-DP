// Local-only host for the existing QA build.
import http from 'node:http';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, mkdtempSync, copyFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {auxiliaryRead} from './aux.mjs';
import {createSharedDirectoryReader} from './feed/shared-directory.mjs';
import {openFinanceStageStore} from './finance-stage-store.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const asset=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const csp="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
const feedBuild=join(root,'.build/local-preview/work-feed');
const identity={id:'local-designer',email:'design.preview@igisam.com'};
function render(){
 const out='.build/local-preview/platform-'+process.pid+'.html';
 execFileSync(process.execPath,['scripts/build-deployment.mjs','--cloud','--local-qa','--out',out,'--icons','src/assets/nav-icons.json'],{cwd:root,stdio:'pipe'});
 const html=readFileSync(join(root,out),'utf8');
 return html.replace('<title>','<title>로컬 디자인 작업실 · ').replace('</head>','<link rel="stylesheet" href="/design.css"></head>').replace(/<\/body><\/html>$/, '<script type="module" src="/studio.js"></script></body></html>');
}

export async function startPreview({port=4178,directory=join(root,'.build/local-preview'),readStakeholders=createSharedDirectoryReader()}={}){
 if(process.env.VERCEL)throw Error('로컬 전용 서버입니다.');
 mkdirSync(directory,{recursive:true});
 const baseline=join(directory,'original-workspace.json');
 if(!existsSync(baseline))throw Error('로컬 원본 데이터가 없습니다. original-workspace.json에 원본 서비스의 workspace.state 복사본을 준비해 주세요.');
 const raw=readFileSync(baseline),state=JSON.parse(raw);
 if(!Array.isArray(state?.projects)||!state.sourceLoad)throw Error('원본 workspace.state 형식을 확인해 주세요.');
 // Keep the source read-only. Previous synthetic workspaces and edits based
 // on a different snapshot must never supersede this baseline.
 const digest=createHash('sha256').update(raw).digest('hex');
 const sampleProjectIds=new Set(state.projects.map(p=>p.id));
 const project='design-preview-'+digest; // Reject saves from tabs opened against a different baseline.
 const file=join(directory,'edits-'+digest+'.json');
 const partnerFile=join(directory,'partners-reference.json');
 const marketFile=join(directory,'market-reference.json');
 let partnerReference;
 let marketReference;
 function withMarketReference(snapshot){
  const existing=snapshot.market?.series||[];
  if(existing.some(series=>series.displayRole==='primary'))return snapshot;
  if(!marketReference&&existsSync(marketFile))marketReference=JSON.parse(readFileSync(marketFile,'utf8'));
  const official=marketReference?.series;
  if(!Array.isArray(official)||official.filter(series=>series.displayRole==='primary').length!==1){
   const series=existing.map(item=>item.id==='kosis-construction'&&!item.displayRole?{...item,displayRole:'primary'}:item);
   return series.some((item,index)=>item!==existing[index])?{...snapshot,market:{...snapshot.market,series}}:snapshot;
  }
  const officialIds=new Set(official.map(series=>series.id));
  const prior=existing.filter(series=>!officialIds.has(series.id)).map(series=>
   series.id==='kosis-construction'&&!series.displayRole?{...series,displayRole:'archive'}:series);
  const series=[...official.map(item=>({...item,checkedAt:marketReference.checkedAt})),...prior];
  return {...snapshot,market:{...snapshot.market,series}};
 }
 let record=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{revision:0,state};
 let financeStages;
 function save(next){writeFileSync(file+'.tmp',JSON.stringify(next),{mode:0o600});renameSync(file+'.tmp',file);record=next}
 const envelope=()=>({...record,workspaceId:project,user:identity,capabilities:{createProject:true,manageAccess:true,viewPlatformSpec:true},projectRoles:Object.fromEntries(record.state.projects.map(p=>[p.id,'approver']))});
 const server=http.createServer(async(req,res)=>{
  const authority='127.0.0.1:'+server.address().port,origin='http://'+authority;
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',csp);
  const send=(status,value,type='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type});res.end(type.startsWith('application/json')?JSON.stringify(value):value)};
  try {
   const landing=req.method==='GET' && req.url==='/' && req.headers['sec-fetch-mode']==='navigate';
   if(req.headers.host!==authority || (req.headers.origin&&req.headers.origin!==origin) || (req.headers['sec-fetch-site']==='cross-site'&&!landing))return send(403,{error:'LOCAL_ONLY'});
   const {pathname,searchParams}=new URL(req.url,origin);
   if(pathname==='/api/local-finance-stages'){
    const projectId=searchParams.get('projectId');
    const activeIds=new Set(record.state.projects.filter(p=>!p.deletedAt).map(p=>p.id));
    if(searchParams.size!==1||!activeIds.has(projectId))return send(404,{error:'PROJECT_NOT_FOUND'});
    if(req.method!=='GET'&&req.method!=='PUT')return send(405,{error:'METHOD_NOT_ALLOWED'});
    if(req.method==='PUT'&&(req.headers.origin!==origin||!/^application\/json\b/i.test(req.headers['content-type']||'')))return send(403,{error:'LOCAL_ONLY'});
    financeStages??=openFinanceStageStore(join(directory,'finance-stages-'+digest+'.sqlite'),sampleProjectIds);
    if(req.method==='GET')return send(200,{stages:financeStages.list(projectId)});
    const buffers=[];let bytes=0;
    for await(const chunk of req){bytes+=chunk.length;if(bytes>65536)return send(413,{error:'TOO_LARGE'});buffers.push(chunk)}
    let message;
    try{message=JSON.parse(Buffer.concat(buffers))}catch{return send(400,{error:'INVALID_JSON'})}
    if(!record.state.projects.some(p=>p.id===projectId&&!p.deletedAt))return send(404,{error:'PROJECT_NOT_FOUND'});
    const [status,result]=financeStages.change(projectId,message);
    return send(status,status<300?{...result,stages:financeStages.list(projectId)}:result);
   }
   if(req.method==='GET'){
    if(pathname==='/')return send(200,render(),'text/html; charset=utf-8');
    if(pathname==='/work-feed/'){
     res.setHeader('Content-Security-Policy',csp.replace("connect-src 'self'","connect-src 'self' blob:").replace("frame-ancestors 'none'","frame-ancestors 'self'"));
     const html=asset('feed/index.html');
     if(!existsSync(join(feedBuild,'app.js'))||!existsSync(join(feedBuild,'app.css'))){
      return send(503,html.replace('게시판을 불러오는 중입니다…','논의·협업 Feed의 로컬 빌드가 없습니다. 작업실 실행 문서에 따라 빌드해 주세요.'),'text/html; charset=utf-8');
     }
     return send(200,html,'text/html; charset=utf-8');
    }
    if(pathname==='/work-feed/app.js'||pathname==='/work-feed/app.css'){
     const bundle=join(feedBuild,pathname.split('/').at(-1));
     if(!existsSync(bundle))return send(503,{error:'LOCAL_FEED_BUILD_UNAVAILABLE'});
     return send(200,readFileSync(bundle),pathname.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8');
    }
    if(pathname==='/work-feed/theme.css')return send(200,asset('feed/theme.css'),'text/css; charset=utf-8');
    if(pathname==='/api/work-feed/stakeholders'){
     if(searchParams.size)return send(400,{error:'INVALID_DIRECTORY_QUERY'});
     try{return send(200,await readStakeholders())}
     catch{return send(503,{error:'IOTA_DIRECTORY_UNAVAILABLE'})}
    }
    if(pathname==='/work-feed/default_avatar.svg'||pathname==='/work-feed/account-avatar'){
     const photo=join(directory,'account-photo.png');
     if(pathname.endsWith('account-avatar')&&existsSync(photo))return send(200,readFileSync(photo),'image/png');
     return send(200,asset('feed/default_avatar.svg'),'image/svg+xml');
    }
    if(['/design.css','/studio.js','/portfolio.js','/portfolio.css','/cost-detail.js','/cost-detail.css','/permits.js','/permits.css','/finance-overview.js','/finance-overview.css','/finance-stage-fields.js','/finance-milestones.js','/finance-capital.js','/finance-stage-editor-model.js','/finance-stage-editor-ui.js'].includes(pathname))return send(200,asset(pathname.slice(1)),pathname.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8');
    if(pathname==='/InterVariable.woff2')return send(200,readFileSync(new URL('InterVariable.woff2',import.meta.url)),'font/woff2');
    if(pathname==='/api/workspace')return send(200,envelope());
    if(pathname==='/api/session')return send(200,{authenticated:true,email:identity.email,userId:identity.id,newAccountCreated:false});
    if(pathname==='/local-account-photo.png'){
     const photo=join(directory,'account-photo.png');
     if(!existsSync(photo))return send(404,{error:'LOCAL_PHOTO_UNAVAILABLE'});
     return send(200,readFileSync(photo),'image/png');
    }
    const isPartnerReference=pathname==='/api/reference-data'&&searchParams.get('kind')==='partners';
    if(isPartnerReference||pathname==='/api/partner-comments'){
     const keys=isPartnerReference?['kind','version','companyKey']:['mode','companyKey','limit'];
     if([...searchParams].some(([key,value])=>!keys.includes(key)||!value||searchParams.getAll(key).length!==1))return send(400,{error:'INVALID_REFERENCE_QUERY'});
     if(!partnerReference){
      if(!existsSync(partnerFile))return send(503,{error:'LOCAL_PARTNER_REFERENCE_UNAVAILABLE'});
      partnerReference=JSON.parse(readFileSync(partnerFile,'utf8'));
     }
     const {snapshot,companies}=partnerReference;
     const version=searchParams.get('version'),companyKey=searchParams.get('companyKey');
     if(!isPartnerReference){
      const count=company=>(company.officialComments?.length||0)+(company.legacyOnlineComments?.length||0);
      if(searchParams.get('mode')==='summary')return send(200,{summaries:Object.entries(companies).map(([companyKey,company])=>({companyKey,totalCount:count(company),onlineCount:0,recent31day:false}))});
      if(!companyKey||!Object.hasOwn(companies,companyKey))return send(404,{error:'COMPANY_NOT_FOUND'});
      const company=companies[companyKey];
      return send(200,{companyKey,seedComments:company.officialComments||[],legacyOnlineComments:company.legacyOnlineComments||[],onlineComments:[],totalCount:count(company),onlineCount:0,recent31day:false});
     }
     if(version&&version!==snapshot.version)return send(404,{error:'REFERENCE_VERSION_NOT_FOUND'});
     if(!companyKey)return send(200,withMarketReference(snapshot));
     if(!Object.hasOwn(companies,companyKey))return send(404,{error:'COMPANY_NOT_FOUND'});
     return send(200,{version:snapshot.version,company:companies[companyKey]});
    }
    if(pathname==='/api/local-access-preview'){
     const capture=join(directory,'access-screen-capture.json');
     if(!existsSync(capture))return send(404,{error:'LOCAL_CAPTURE_UNAVAILABLE'});
     return send(200,JSON.parse(readFileSync(capture,'utf8')));
    }
    if(pathname==='/favicon.ico')return send(204,'','image/x-icon');
    const data=auxiliaryRead(pathname,searchParams,record.state);
    if(data!==undefined)return send(200,data);
   }
   if(req.method==='PUT'&&pathname==='/api/workspace'){
    if(req.headers.origin!==origin||!/^application\/json\b/i.test(req.headers['content-type']||''))return send(403,{error:'LOCAL_ONLY'});
    const buffers=[];let bytes=0;
    for await(const chunk of req){bytes+=chunk.length;if(bytes>32*1024*1024)return send(413,{error:'TOO_LARGE'});buffers.push(chunk)}
    let msg;try{msg=JSON.parse(Buffer.concat(buffers))}catch{return send(400,{error:'INVALID_JSON'})}
    if(msg?.workspaceId!==project||typeof msg.requestId!=='string'||!Array.isArray(msg.state?.projects)||!msg.state.sourceLoad)return send(422,{error:'INVALID_WORKSPACE'});
    if(msg.baseRevision!==record.revision)return send(409,{error:'REVISION_CONFLICT'});
    save({revision:record.revision+1,state:msg.state});
    return send(200,{...record,requestId:msg.requestId,workspaceId:project});
   }
   return send(404,{error:'LOCAL_PREVIEW_ONLY',message:'외부 연동은 로컬 작업실에서 실행되지 않습니다.'});
  }catch(error){console.error(error.message);return send(500,{error:'LOCAL_PREVIEW_ERROR'})}
 });
 server.on('close',()=>financeStages?.close());
 await new Promise((ok,fail)=>server.once('error',fail).listen(port,'127.0.0.1',ok));
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const arg=process.argv.find(s=>s.startsWith('--port='));
 const directory=process.argv.includes('--temporary')?mkdtempSync(join(tmpdir(),'igis-design-')):undefined;
 if(directory)copyFileSync(join(root,'.build/local-preview/original-workspace.json'),join(directory,'original-workspace.json'));
 const server=await startPreview({port:arg?Number(arg.slice(7)):4178,directory});
 console.log('로컬 디자인 작업실: http://127.0.0.1:'+server.address().port+'/');
}
