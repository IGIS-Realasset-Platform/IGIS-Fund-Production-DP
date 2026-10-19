import vm from 'node:vm';
import {randomUUID} from 'node:crypto';

// 생성된 실제 HTML을 실행합니다. 합성 HTTP 경계이며 실제 로그인/DB 검수가 아닙니다.
export async function verifyCloudBuild({html,version}){
 const script=html.match(/<script>([\s\S]*)<\/script>/)?.[1];if(!script)throw Error('CLOUD_BUILD_SCRIPT_MISSING');
 const results=[];
 for(const signedIn of [false,true]){
  const nodes=new Map(),reads=[],authEmailReads=[],calls=[],session=new Map(),authEmailKey='development-platform-auth-email-v1';
  const node=id=>{if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',textContent:'',hidden:true,open:false,dataset:{},style:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(){return[]},setAttribute(){},getAttribute(){return null},showModal(){this.open=true},close(){this.open=false},focus(){},append(){},appendChild(){},remove(){},getBoundingClientRect(){return{width:100,height:30,left:0,top:0,right:100,bottom:30}}});return nodes.get(id)};
  const document={getElementById:node,addEventListener(){},removeEventListener(){},querySelector(){return null},querySelectorAll(){return[]},createElement(){return node(randomUUID())},body:node('body'),head:node('head'),documentElement:node('html'),fonts:{ready:Promise.resolve()},activeElement:null};
  const state={version,storageRevision:0,currentProjectId:'',selectedProjectId:'',projects:[],entities:[],auditEvents:[],notifications:[],companies:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],migrationConflicts:[],integrityIssues:[],storageQuarantine:[],sourceLoad:{status:'unavailable',schemaVersion:'notion-development-projects-v1',expectedCount:null,actualCount:0,hasMore:null,syncedAt:''}};
  const fetch=async(url,options={})=>{
   calls.push({url:String(url),method:options.method||'GET'});
   if(url==='/api/session')return Response.json(signedIn?{authenticated:true,userId:'synthetic-build-user',email:'qa.builder@igisam.com',expiresAt:null,newAccountCreated:false}:{authenticated:false});
   if(url==='/api/workspace'&&signedIn&&(!options.method||options.method==='GET'))return Response.json({workspaceId:'platform',revision:0,state,capabilities:{createProject:false,manageAccess:false},projectRoles:{},user:{id:'synthetic-build-user',email:'qa.builder@igisam.com'}});
   throw Error('UNEXPECTED_BUILD_HTTP_BOUNDARY');
  };
  const context={console,document,crypto:{randomUUID},setTimeout(){return 1},clearTimeout(){},requestAnimationFrame(){return 1},cancelAnimationFrame(){},queueMicrotask,URL,Blob,Headers,Request,Response,Intl,Date,structuredClone,TextEncoder,TextDecoder,fetch,navigator:{clipboard:{writeText:async()=>{}}},localStorage:{getItem(key){if(key===authEmailKey)authEmailReads.push(key);else reads.push(key);return null},setItem(){throw Error('UNEXPECTED_BUSINESS_LOCAL_WRITE')},removeItem(key){if(key!==authEmailKey)throw Error('UNEXPECTED_BUSINESS_LOCAL_REMOVE')}},sessionStorage:{getItem:key=>session.get(key)||null,setItem(key,value){session.set(key,value)},removeItem(key){session.delete(key)}}};
  context.window=context;context.addEventListener=()=>{};vm.createContext(context);
  await vm.runInContext(script,context,{filename:'generated-cloud-platform.html'});
  const actual=vm.runInContext('({cloudMode:App.cloudMode,version:App.spec.meta.version,projects:App.state.projects.length,booted:App.cloudPersistence.booted(),phase:App.cloudSession.status().phase,canCreate:App.cloudSession.can("createProject"),hasAdd:App.hasAction("project-add")})',context);
  if(!actual.cloudMode||actual.version!==version||actual.projects!==0||reads.length)throw Error('CLOUD_BUILD_AUTH_STORAGE_BOUNDARY');
  if(!signedIn&&(actual.booted||actual.phase!=='login'||calls.length!==1||!nodes.get('content').innerHTML.includes('type="password"')||!nodes.get('content').innerHTML.includes('로그인')||!/<div class="app dp-app auth-hidden"/.test(html)))throw Error('CLOUD_BUILD_PREAUTH_GATE');
  if(signedIn&&(!actual.booted||actual.phase!=='ready'||actual.canCreate||!actual.hasAdd||calls.length!==2))throw Error('CLOUD_BUILD_AUTHENTICATED_BOOT');
  results.push({signedIn,phase:actual.phase,oldLocalReads:reads.length,authEmailOnlyReads:authEmailReads.length,httpCalls:calls.length,automaticServerWrites:calls.filter(call=>call.method!=='GET').length});
 }
 return {passed:results.length,actualGeneratedProductExecuted:true,syntheticHttpOnly:true,realDatabaseUsed:false,results};
}
