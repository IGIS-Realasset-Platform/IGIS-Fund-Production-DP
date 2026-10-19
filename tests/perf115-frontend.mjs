import assert from 'node:assert/strict';
import vm from 'node:vm';
import {makeHarness} from './recovery-harness.mjs';

const REMEMBER_KEY='development-platform-auth-email-v1';
const blankSeed={version:'0.11.5',storageRevision:0,currentProjectId:'',selectedProjectId:'',projects:[],entities:[],auditEvents:[],notifications:[],companies:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],migrationConflicts:[],integrityIssues:[],storageQuarantine:[],sourceLoad:{status:'unavailable',schemaVersion:'notion-development-projects-v1',expectedCount:null,actualCount:0,hasMore:null,syncedAt:''}};
const workspace={workspaceId:'platform',revision:20,state:structuredClone(blankSeed),capabilities:{createProject:true,manageAccess:true},projectRoles:{},user:{id:'user-perf115',email:'qa.perf115@igisam.com'}};
const response=(status,body)=>({status,ok:status>=200&&status<300,json:async()=>structuredClone(body)});
const remembered=()=>JSON.stringify({version:1,email:'qa.perf115@igisam.com',rememberedAt:Date.now()-1000,expiresAt:Date.now()+60_000});

function sessionFixture({queue=[],rememberedEmail=false}={}){
 const local=new Map(),calls=[],h=makeHarness({modules:[],seed:blankSeed,storageMap:local});
 h.context.localStorage.removeItem=key=>local.delete(key);
 if(rememberedEmail)local.set(REMEMBER_KEY,remembered());
 h.context.APP_RUNTIME={mode:'real',version:'0.11.5',storageKey:'perf115-business',persistence:'cloud'};
 h.context.fetch=async(url,options={})=>{calls.push({url:String(url),method:options.method||'GET',body:options.body||''});const next=queue.shift();if(!next)throw Error('unexpected fetch '+url);return typeof next==='function'?next(url,options):next};
 h.load('core');h.load('cloud-session');const A=vm.runInContext('App',h.context);A.register('portfolio',()=>'<p>프로젝트 현황</p>');
 return{...h,A,calls,local,queue};
}

const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+(error.stack||error.message))}}

await check('PERF115-FE-01 재접속은 workspace GET1회로 엄격 부트하고 session GET을 호출하지 않음',async()=>{
 const h=sessionFixture({queue:[response(200,workspace)]});let renders=0,render=h.A.render;h.A.render=(...args)=>{renders++;return render(...args)};
 await h.A.cloudSession.start();
 assert.equal(h.A.cloudSession.status().phase,'ready');
 assert.deepEqual(h.calls.map(call=>[call.method,call.url]),[['GET','/api/workspace']]);
 assert.equal(renders,1,'최초 업무화면 render1회');
 assert.equal(h.A.cloudSession.status().userId,workspace.user.id);
 assert.deepEqual(JSON.parse(JSON.stringify(h.A.cloudSession.status().capabilities)),workspace.capabilities);
});

await check('PERF115-FE-02 pending은 중립문구·폼과 shell0, strict workspace shape 실패는 자료를 열지 않음',async()=>{
 let release;const pending=new Promise(resolve=>{release=resolve}),h=sessionFixture({queue:[()=>pending]});const started=h.A.cloudSession.start();
 await Promise.resolve();
 const html=h.nodes.get('content').innerHTML;
 assert(html.includes('업무 화면을 준비하고 있습니다'));
 assert(!html.includes('<h2>로그인</h2>'));
 assert(!html.includes('name="loginEmail"'));
 assert.equal(h.nodes.get('sidebar').innerHTML,'');
 assert.equal(h.nodes.get('topbar').innerHTML,'');
 release(response(200,{...workspace,user:{id:'',email:'qa.perf115@igisam.com'}}));
 await started;
 assert.equal(h.A.cloudSession.status().phase,'retry');
 assert.equal(h.A.state.projects.length,0);
});

await check('PERF115-FE-03 workspace 401·정확 EMAIL_NOT_ALLOWED403·503를 login/기억삭제/retry로 구분',async()=>{
 const expired=sessionFixture({queue:[response(401,{error:'SESSION_REQUIRED'})]});await expired.A.cloudSession.start();assert.equal(expired.A.cloudSession.status().phase,'login');
 const denied=sessionFixture({rememberedEmail:true,queue:[response(403,{error:'EMAIL_NOT_ALLOWED',message:'이용이 허용된 이메일을 확인해 주세요.'})]});await denied.A.cloudSession.start();assert.equal(denied.A.cloudSession.status().phase,'login');assert.equal(denied.local.has(REMEMBER_KEY),false);
 const forbidden=sessionFixture({rememberedEmail:true,queue:[response(403,{error:'FORBIDDEN'})]});await forbidden.A.cloudSession.start();assert.equal(forbidden.A.cloudSession.status().phase,'retry');assert.equal(forbidden.local.has(REMEMBER_KEY),true);
 const unavailable=sessionFixture({queue:[response(503,{error:'STORAGE_UNAVAILABLE'})]});await unavailable.A.cloudSession.start();assert.equal(unavailable.A.cloudSession.status().phase,'retry');
});

await check('PERF115-FE-04 로그인·가입 성공은 새 세션 확인을 위해 각각 workspace GET을 유지',async()=>{
 const loginIdentity={authenticated:true,email:'qa.perf115@igisam.com',userId:'user-perf115',expiresAt:null,newAccountCreated:false};
 const login=sessionFixture({queue:[response(200,loginIdentity),response(200,workspace)]});await login.A.cloudSession.login('qa.perf115@igisam.com','ExistingPasswordLength32-Compat',false);assert.deepEqual(login.calls.map(call=>[call.method,call.url]),[['POST','/api/auth-login'],['GET','/api/workspace']]);
 const signup=sessionFixture({queue:[response(202,{sent:true}),response(200,{...loginIdentity,newAccountCreated:true}),response(200,workspace)]});signup.A.cloudSession.openSignup();await signup.A.cloudSession.beginSignup('qa.perf115@igisam.com','Passw0rd-123','Passw0rd-123');await signup.A.cloudSession.verifySignup('123456');assert.deepEqual(signup.calls.map(call=>[call.method,call.url]),[['POST','/api/auth-code'],['POST','/api/auth-verify'],['GET','/api/workspace']]);
});

function costFixture(){
 const project={id:'SAME-ID',name:'첫 사업',cbs:[{id:'root',parentId:null,name:'공사비',code:'R',current:null,initial:null,sortOrder:0},{id:'a',parentId:'root',name:'A',code:'A',current:100,initial:80,sortOrder:1},{id:'b',parentId:'root',name:'B',code:'B',current:50,initial:40,sortOrder:2}],costStages:[],building:{},basic:{}};
 const seed={...structuredClone(blankSeed),projects:[project],currentProjectId:project.id,selectedProjectId:project.id};
 const h=makeHarness({modules:[],seed});h.load('core');h.load('cbs');const A=vm.runInContext('App',h.context),p=A.state.projects[0];return{...h,A,p};
}

await check('PERF115-FE-05 동기 render read scope는 rows를1회 읽고 결과·원자료를 바꾸지 않음',()=>{
 const{A,p}=costFixture(),before=JSON.stringify({cbs:p.cbs,total:A.totalInfo(p)});let filters=0;const filter=p.cbs.filter.bind(p.cbs);p.cbs.filter=(...args)=>{filters++;return filter(...args)};
 A.register('portfolio',()=>{const one=A.totalInfo(p),two=A.totalInfo(p),three=A.total(p);assert.deepEqual(one,two);assert.equal(three,one.value);return'<p>'+three+'</p>'});
 A.render();
 assert.equal(filters,1,'한 render에서 동일 project live rows1회');
 assert.equal(JSON.stringify({cbs:p.cbs.filter(row=>typeof row!=='function'),total:A.totalInfo(p)}),before);
});

await check('PERF115-FE-06 scope는 중첩·예외에 안전하고 같은ID 다른객체 및 다음수정값을 격리',()=>{
 const{A,p}=costFixture(),other=structuredClone(p);other.name='둘째 사업';other.cbs.find(row=>row.id==='a').current=700;
 assert.equal(typeof A.costReadScope,'function');
 A.costReadScope(()=>{assert.equal(A.total(p),150);assert.equal(A.costReadScope(()=>A.total(other)),750);const rows=A.cbsRows(p);rows.pop();assert.equal(rows.length,2)});
 assert.equal(A.cbsRows(p).length,3,'scope 배열변경이 원자료/다음scope에 남지 않음');
 assert.throws(()=>A.costReadScope(()=>{A.cbsRows(p).pop();throw Error('scope failure')}),/scope failure/);
 assert.equal(A.cbsRows(p).length,3,'예외 finally cache 폐기');
 p.cbs.find(row=>row.id==='a').current=101;
 assert.equal(A.costReadScope(()=>A.total(p)),151,'다음 scope는 수정값 재계산');
 assert.equal(A.costReadScope(()=>A.total(other)),750,'같은 project ID 다른 객체 격리');
});

await check('PERF115-FE-07 오래된 bootstrap·login workspace 응답은 부트·기억저장을 하지 않음',async()=>{
 let release;const deferred=new Promise(resolve=>{release=resolve}),h=sessionFixture({queue:[()=>deferred]});const waiting=h.A.cloudSession.start();h.A.cloudSession.openSignup();release(response(200,workspace));await waiting;assert.equal(h.A.cloudSession.status().phase,'signup');assert.equal(h.A.cloudPersistence.configured(),false);assert.equal(h.A.state.projects.length,0);
 let releaseLogin;const pending=new Promise(resolve=>{releaseLogin=resolve}),identity={authenticated:true,email:'qa.perf115@igisam.com',userId:'user-perf115',newAccountCreated:false},login=sessionFixture({queue:[response(200,identity),()=>pending]});const signing=login.A.cloudSession.login(identity.email,'Passw0rd-123',true);await new Promise(resolve=>setImmediate(resolve));login.A.cloudSession.openSignup();releaseLogin(response(200,workspace));await signing;assert.equal(login.A.cloudSession.status().phase,'signup');assert.equal(login.local.has(REMEMBER_KEY),false,'취소한 login의 늦은 응답은 email 기억0');assert.equal(login.A.cloudPersistence.configured(),false);
});

await check('PERF115-FE-08 user·권한·state 형식 오류는 닫힌 gate, 권한0 빈작업공간은 정상',async()=>{
 const malformed=[{...workspace,user:null},{...workspace,user:{id:' ',email:'qa.perf115@igisam.com'}},{...workspace,user:{id:'user-perf115',email:'outside@example.com'}},{...workspace,revision:-1},{...workspace,state:[]},{...workspace,capabilities:{createProject:'true',manageAccess:false}},{...workspace,projectRoles:{P:'owner'}},{...workspace,state:{...blankSeed,projects:null}}];
 for(const payload of malformed){const h=sessionFixture({queue:[response(200,payload)]});await h.A.cloudSession.start();assert.equal(h.A.cloudSession.status().phase,'retry');assert.equal(h.A.cloudSession.status().authenticated,false);assert.equal(h.nodes.get('sidebar').innerHTML,'');assert.equal(h.calls.length,1)}
 const valid=sessionFixture({queue:[response(200,{...workspace,capabilities:{createProject:false,manageAccess:false}})]});await valid.A.cloudSession.start();assert.equal(valid.A.cloudSession.status().phase,'ready');assert.equal(valid.A.cloudSession.can('createProject'),false);
});

await check('PERF115-FE-09 저장 403은 정확 allowlist만 logout 경계, 일반권한·검증·충돌은 rollback 후 초안유지',async()=>{
 for(const[status,body,phase]of[[403,{error:'EMAIL_NOT_ALLOWED'},'login'],[403,{error:'FORBIDDEN'},'ready'],[400,{error:'IMMUTABLE_HISTORY'},'ready'],[409,{error:'REVISION_CONFLICT'},'ready']]){const h=sessionFixture({rememberedEmail:true,queue:[response(200,workspace),response(status,body)]});await h.A.cloudSession.start();h.session.set('per-user-draft','입력한 초안');h.A.transaction(()=>{h.A.state.entities.push({id:'new-entity'});h.A.audit('UPDATE','entity','new-entity',null,{id:'new-entity'})});await assert.rejects(h.A.cloudPersistence.wait());await new Promise(resolve=>setImmediate(resolve));assert.equal(h.A.cloudSession.status().phase,phase);assert.equal(h.A.state.entities.length,0);assert.equal(h.session.get('per-user-draft'),'입력한 초안');assert.equal(h.local.has(REMEMBER_KEY),phase==='ready');assert.equal(h.calls.filter(call=>call.method==='PUT').length,1)}
});

await check('PERF115-FE-10 scope가 끝나면 edit/add/delete·0/null을 다시 계산하고 반환값변형이 계산을 오염하지 않음',()=>{
 const{A,p}=costFixture();p.contracts=[{id:'contract',cbsId:'a',amount:100}];p.vatRecords=[{id:'vat',cbsId:'a',amount:10}];p.costStages=[{id:'stage',kind:'custom',nodes:structuredClone(p.cbs),values:{root:150,a:100,b:50},date:'2026-10-01'}];const preserved=JSON.stringify({contracts:p.contracts,vat:p.vatRecords,stages:p.costStages});
 A.costReadScope(()=>{const info=A.amountInfo(p,'root');info.value=999;assert.equal(A.amount(p,'root'),150);const rows=A.cbsRows(p);rows.reverse();assert.deepEqual(Array.from(A.cbsRows(p),row=>row.id),['root','a','b'])});
 p.cbs.find(row=>row.id==='a').current=0;assert.equal(A.costReadScope(()=>A.total(p)),50);p.cbs.push({id:'c',parentId:'root',current:null,sortOrder:3});assert.equal(A.costReadScope(()=>A.total(p)),null);p.cbs.find(row=>row.id==='c').current=0;assert.equal(A.costReadScope(()=>A.total(p)),50);p.cbs.find(row=>row.id==='b').deletedAt='2026-10-19';assert.equal(A.costReadScope(()=>A.total(p)),0);assert.equal(JSON.stringify({contracts:p.contracts,vat:p.vatRecords,stages:p.costStages}),preserved);
 const noId=structuredClone(p),otherNoId=structuredClone(p);delete noId.id;delete otherNoId.id;otherNoId.cbs.find(row=>row.id==='a').current=800;A.costReadScope(()=>{assert.equal(A.total(noId),0);assert.equal(A.total(otherNoId),800)});
});

await check('PERF115-FE-11 비cloud boot는 기존 render1회, cloud initializer실패는 업무화면을 렌더하지 않음',async()=>{
 const local=makeHarness({seed:blankSeed});let renders=0;local.A.render=()=>{renders++};local.A.boot({deferCloudRender:true});assert.equal(renders,1);
 const cloud=sessionFixture({queue:[response(200,workspace)]});let cloudRenders=0;cloud.A.render=()=>{cloudRenders++};cloud.A.initializers.push(()=>{throw Error('initializer failed')});await cloud.A.cloudSession.start();assert.equal(cloud.A.cloudSession.status().phase,'retry');assert.equal(cloudRenders,0);assert.equal(cloud.nodes.get('sidebar').innerHTML,'');
});

const failed=checks.filter(row=>row.status==='failed');
console.log(JSON.stringify({suite:'perf115-frontend',passed:checks.length-failed.length,failed:failed.length,total:checks.length,realNetwork:false,realUserData:false,checks}));
if(failed.length)process.exitCode=1;
