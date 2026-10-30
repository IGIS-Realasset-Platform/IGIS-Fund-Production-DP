import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {createBlankWorkspaceState,createWorkspaceHandlers,WorkspaceError,filterWorkspaceState} from '../server/cloud-storage.mjs';
import {createWorkspaceRuntime} from '../server/workspace-runtime.mjs';

const clone=structuredClone,root=new URL('../',import.meta.url),origin='https://security132.example.invalid';
const files=['server/cloud-storage.mjs','server/workspace-runtime.mjs','tests/cloud-storage.mjs', 'tests/review132-workspace-security-boundaries.mjs'];
const sha=file=>createHash('sha256').update(fs.readFileSync(new URL(file,root))).digest('hex'),pins=Object.fromEntries(files.map(file=>[file,sha(file)])),checks=[];
function initial(){
 const state=createBlankWorkspaceState();
 state.projects=[{id:'P1',entityId:'E1',name:'합성 자기 사업',contracts:[{id:'K1',companyId:'C1',amount:1000001}],cbs:[],permits:[],costStages:[{id:'UW1',kind:'underwriting',controlEventType:'underwriting',date:'2026-01-01',values:{COST1:1000001}},{id:'PF1',kind:'pf',controlEventType:'pf',date:'2026-02-01',values:{COST1:2000000}}],reportSnapshots:[{id:'R1',body:'합성 보관 본문',status:'작성본'}],vatRecords:[{id:'V1',net:0,vat:null}]},{id:'P2',entityId:'E2',name:'합성 비공개 사업',contracts:[{id:'K2',companyId:'C2'}],costStages:[{id:'P2-PF',kind:'pf',controlEventType:'pf'}],permits:[]}];
 state.entities=[{id:'E1',name:'합성 법인1',professionalRecords:[]},{id:'E2',name:'합성 법인2',professionalRecords:[{id:'PRIVATE-PROFESSIONAL',name:'합성 비공개 인력'}]}];
 state.companies=[{id:'C1',name:'합성 업체1',localNotes:[]},{id:'C2',name:'합성 업체2',localNotes:[{id:'PRIVATE-NOTE',content:'합성 비공개 업무메모'}]}];
 return state;
}
function fixture({state=initial(),role='editor',admin=false,casFail=false,failAt='',grants}={}){
 const text=fs.readFileSync(new URL('tests/cloud-storage.mjs',root),'utf8'),start=text.indexOf('function fakeTransaction('),end=text.indexOf('\nasync function invoke(',start);
 assert(start>=0&&end>start,'strict existing transaction fixture required');
 const access={U1:{isAdmin:admin,canCreateProject:admin,projects:grants||{P1:role}}},session={U1:{userId:'U1',email:'synthetic132@igisam.com'}};
 const code=text.slice(start,end).replace('return{db,withTransaction,accessPolicy};','return{db,withTransaction,accessPolicy,client,snapshot,restore};');
 const make=new Function('clone','baseState','access','session','WorkspaceError',code+';return fakeTransaction;')(clone,initial,access,session,WorkspaceError),store=make({state,user:'U1',casFail,failAt});let snapshot=null,active=false;
 const client={release(){},query:async(sql,args=[])=>{const q=String(sql).replace(/\s+/g,' ').trim();if(q==='BEGIN'){snapshot=store.snapshot();active=true;store.db.open++;return{rows:[]};}if(q==='COMMIT'){snapshot=null;active=false;store.db.open--;store.db.commits++;return{rows:[]};}if(q==='ROLLBACK'){if(snapshot)store.restore(snapshot);if(active)store.db.open--;snapshot=null;active=false;store.db.rollbacks++;return{rows:[]};}if(q==='SET LOCAL search_path = pg_catalog, development_project_platform'||q==="SET LOCAL statement_timeout = '10s'")return{rows:[]};return store.client.query(sql,args);}};
 // Every driver/service is replaced before use; generated placeholders are not credentials.
 const placeholder=randomUUID().replaceAll('-',''),environment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:placeholder+placeholder,DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:'+placeholder+'@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic132@gmail.com',DP_GMAIL_APP_PASSWORD:placeholder.slice(0,16),DP_ALLOWED_EMAILS:JSON.stringify([session.U1.email])});
 const runtime=createWorkspaceRuntime({environment,loadDrivers:async()=>({pool:{connect:async()=>client}}),createService:async()=>({handle:async()=>Response.json({authenticated:true,...session.U1})}),createHandlers:({withTransaction,origin})=>createWorkspaceHandlers({withTransaction,origin,accessPolicy:store.accessPolicy})});
 return{db:store.db,access,before:clone(state),input:()=>filterWorkspaceState(state,access.U1),get:()=>runtime(new Request(origin+'/api/workspace'),'workspace'),put:(state,{baseRevision=0,requestId='security132_request_00000001'}={})=>runtime(new Request(origin+'/api/workspace',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify({workspaceId:'platform',baseRevision,requestId,state})}),'workspace')};
}
function untouched(f){assert.deepEqual(f.db.workspace.state,f.before);assert.equal(f.db.workspace.revision,0);assert.equal(f.db.updates,0);assert.equal(f.db.audits.length,0);assert.equal(f.db.requests.size,0);assert.equal(f.db.open,0);}
function preserved(f,{relinked=false}={}){const after=f.db.workspace.state;assert.deepEqual(after.projects[1],f.before.projects[1]);for(const key of ['contracts','cbs','vatRecords','reportSnapshots']){const expected=clone(f.before.projects[0][key]);if(key==='contracts'&&relinked)expected[0].companyId='C2';assert.deepEqual(after.projects[0][key],expected);}assert.deepEqual(after.entities.filter(x=>x.id==='E2'),f.before.entities.filter(x=>x.id==='E2'));assert.deepEqual(after.companies.filter(x=>x.id==='C2'),f.before.companies.filter(x=>x.id==='C2'));}
async function check(name,fn){try{await fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',message:error.message});}}
async function denied(change,{status=403,...options}={}){const f=fixture(options),input=f.input();change(input,f);const response=await f.put(input);assert.equal(response.status,status);untouched(f);return f;}
for(const [name,change]of [
 ['entity reference without changing entity body',x=>x.projects[0].entityId='E2'],
 ['entity reference with spoofed foreign entity body',x=>{x.projects[0].entityId='E2';x.entities.push({id:'E2',professionalRecords:[]});}],
 ['nested companyId',x=>x.projects[0].contracts[0].companyId='C2'],
 ['nested plural companyIds',x=>x.projects[0].extra={companyIds:['C2']}],
 ['scoped company participation',x=>x.companyParticipations=[{id:'PART1',projectId:'P1',companyId:'C2'}]],
 ['scoped target.projectId company participation',x=>x.companyParticipations=[{id:'PART1',target:{projectId:'P1'},companyId:'C2'}]]
])await check('403/atomic: foreign '+name,()=>denied(change));
await check('GET never includes foreign professional records or local notes',async()=>{const f=fixture(),r=await f.get(),b=await r.json();assert.equal(r.status,200);assert.deepEqual(b.state.entities.map(x=>x.id),['E1']);assert.deepEqual(b.state.companies.map(x=>x.id),['C1']);untouched(f);});
await check('editor may relink an entity and company already readable before the request',async()=>{const f=fixture({grants:{P1:'editor',P2:'viewer'}}),x=f.input();x.projects[0].entityId='E2';x.projects[0].contracts[0].companyId='C2';assert.equal((await f.put(x)).status,200);const body=await(await f.get()).json();assert(body.state.entities.some(x=>x.id==='E2'));preserved(f,{relinked:true});});
await check('editor may create fresh entity and company records linked to own project',async()=>{const f=fixture(),x=f.input();x.projects[0].entityId='NEW-E';x.projects[0].contracts[0].companyId='NEW-C';x.entities.push({id:'NEW-E',professionalRecords:[]});x.companies.push({id:'NEW-C',localNotes:[]});assert.equal((await f.put(x)).status,200);const body=await(await f.get()).json();assert(body.state.entities.some(x=>x.id==='NEW-E'));assert(body.state.companies.some(x=>x.id==='NEW-C'));assert.deepEqual(f.db.workspace.state.projects[1],f.before.projects[1]);});
await check('admin may relink existing records without changing private bodies',async()=>{const f=fixture({admin:true}),x=f.input();x.projects[0].entityId='E2';x.projects[0].contracts[0].companyId='C2';assert.equal((await f.put(x)).status,200);preserved(f,{relinked:true});});
await check('new dangling entity reference cannot preclaim a future private entity ID',()=>denied(x=>x.projects[0].entityId='FUTURE-PRIVATE-E'));
await check('unchanged legacy dangling entity reference does not block unrelated save',async()=>{const s=initial();s.projects[0].entityId='LEGACY-MISSING';const f=fixture({state:s}),x=f.input();x.projects[0].name='정상 이름 수정';assert.equal((await f.put(x)).status,200);preserved(f);});
await check('public/reference-only company key remains linkable without inventing private company data',async()=>{const f=fixture(),x=f.input();x.projects[0].contracts[0].companyId='PUBLIC-REFERENCE-ONLY';assert.equal((await f.put(x)).status,200);assert.equal(f.db.workspace.state.projects[0].contracts[0].amount,1000001);assert.equal(f.db.workspace.state.companies.length,2);assert.equal(f.db.workspace.state.projects[0].contracts[0].companyId,'PUBLIC-REFERENCE-ONLY');});
await check('shared entity body edit still requires every linked project edit permission',()=>denied(x=>x.entities.find(x=>x.id==='E2').name='금지 수정',{state:(()=>{const s=initial();s.projects[0].entityId='E2';return s;})()}));
const stage=(kind='custom',extra={})=>({id:'NEW-STAGE',kind,controlEventType:['custom','report'].includes(kind)?null:kind,date:'2026-03-01',values:{COST1:3000001},...extra});
for(const [name,value,status]of [
 ['custom cannot hide PF',stage('custom',{supersedesId:'PF1'}),400],
 ['report cannot hide underwriting',stage('report',{supersedesId:'UW1'}),400],
 ['control kind cannot mask approval with custom controlEventType',stage('underwriting',{controlEventType:'custom'}),400],
 ['control kind cannot mask approval with null',stage('pf',{controlEventType:null}),400],
 ['control kind cannot mask approval with empty text',stage('pf',{controlEventType:''}),400],
 ['custom kind cannot claim control PF',stage('custom',{controlEventType:'pf'}),400],
 ['unknown new kind rejected',stage('not-a-kind'),400],
 ['new PF requires approver',stage('pf'),403],
 ['new PF without explicit control field still requires approver',(()=>{const x=stage('pf');delete x.controlEventType;return x;})(),403],
 ['PF correction requires approver',stage('pf',{supersedesId:'PF1'}),403],
 ['correction cannot target other project',stage('pf',{supersedesId:'P2-PF'}),400],
 ['correction cannot target missing stage',stage('custom',{supersedesId:'MISSING'}),400],
 ['correction cannot target same request new stage',stage('custom',{supersedesId:'NEW-STAGE'}),400]
])await check('stage boundary: '+name,()=>denied(x=>x.projects[0].costStages.push(value),{status}));
await check('inactive correction target rejected while old snapshots remain exact',async()=>{const s=initial();s.projects[0].costStages.push(stage('pf',{id:'PF2',supersedesId:'PF1'}));await denied(x=>x.projects[0].costStages.push(stage('pf',{supersedesId:'PF1'})),{state:s,role:'approver',status:400});});
await check('two new corrections cannot supersede the same old stage',()=>denied(x=>x.projects[0].costStages.push(stage('pf',{id:'N1',supersedesId:'PF1'}),stage('pf',{id:'N2',supersedesId:'PF1'})),{role:'approver',status:400}));
await check('editor normal custom append, GET and idempotent replay preserve protected records',async()=>{const f=fixture(),x=f.input();x.projects[0].costStages.push(stage());const r=await f.put(x);assert.equal(r.status,200);assert.equal((await f.put(x)).status,200);assert.equal(f.db.updates,1);assert.equal(f.db.audits.length,1);assert.equal(f.db.requests.size,1);const b=await(await f.get()).json();assert.deepEqual(b.state.projects[0].costStages.at(-1),stage());preserved(f);});
await check('approver normal same-type active PF correction succeeds and preserves old body',async()=>{const f=fixture({role:'approver'}),x=f.input();x.projects[0].costStages.push(stage('pf',{supersedesId:'PF1'}));assert.equal((await f.put(x)).status,200);assert.deepEqual(f.db.workspace.state.projects[0].costStages.slice(0,2),f.before.projects[0].costStages);preserved(f);});
await check('admin normal PF correction succeeds',async()=>{const f=fixture({admin:true}),x=f.input();x.projects[0].costStages.push(stage('pf',{supersedesId:'PF1'}));assert.equal((await f.put(x)).status,200);preserved(f);});
await check('unchanged ambiguous legacy stages do not block unrelated own project save',async()=>{const s=initial();s.projects[0].costStages.push({id:'OLD-AMBIGUOUS',kind:'snapshot',controlEventType:'custom',supersedesId:'OLD-MISSING'});const f=fixture({state:s}),x=f.input();x.projects[0].name='정상 이름 수정';assert.equal((await f.put(x)).status,200);assert.deepEqual(f.db.workspace.state.projects[0].costStages,s.projects[0].costStages);preserved(f);});
for(const role of ['editor','approver'])await check('ambiguous old control target cannot be reinterpreted as a custom correction: '+role,async()=>{const s=initial();s.projects[0].costStages[1].controlEventType=null;await denied(x=>x.projects[0].costStages.push(stage('custom',{supersedesId:'PF1'})),{state:s,role,status:400});});
await check('same request replay after project edit access revoked is forbidden and adds no writes',async()=>{const f=fixture(),x=f.input();x.projects[0].costStages.push(stage());assert.equal((await f.put(x)).status,200);const saved=clone(f.db.workspace);f.access.U1.projects={};assert.equal((await f.put(x)).status,403);assert.deepEqual(f.db.workspace,saved);assert.equal(f.db.updates,1);assert.equal(f.db.requests.size,1);});
await check('approved PF replay after demotion remains a read-only cached response; new approval still403',async()=>{const f=fixture({role:'approver'}),x=f.input();x.projects[0].costStages.push(stage('pf'));assert.equal((await f.put(x)).status,200);const saved=clone(f.db.workspace);f.access.U1.projects.P1='editor';const replay=await f.put(x);assert.equal(replay.status,200);const b=await replay.json();assert.deepEqual(b.state.projects.map(x=>x.id),['P1']);assert.deepEqual(f.db.workspace,saved);const fresh=clone(b.state);fresh.projects[0].costStages.push(stage('pf',{id:'SECOND-PF'}));assert.equal((await f.put(fresh,{baseRevision:1,requestId:'security132_second_approval'})).status,403);assert.deepEqual(f.db.workspace,saved);assert.equal(f.db.updates,1);assert.equal(f.db.requests.size,1);});
for(const failAt of ['workspace','audit','request'])await check('503 full rollback for otherwise authorized custom save: '+failAt,async()=>{const f=fixture({failAt}),x=f.input();x.projects[0].costStages.push(stage());assert.equal((await f.put(x)).status,503);untouched(f);});
await check('409 stale/CAS causes no partial stage, audit, request, or other-project change',async()=>{for(const opts of [{casFail:true},{ }]){const f=fixture(opts),x=f.input();x.projects[0].costStages.push(stage());assert.equal((await f.put(x,opts.casFail?{}:{baseRevision:99})).status,409);untouched(f);}});
await check('same request ID with changed body remains409',async()=>{const f=fixture(),x=f.input();x.projects[0].costStages.push(stage());assert.equal((await f.put(x)).status,200);x.projects[0].name='다른 입력';assert.equal((await f.put(x)).status,409);assert.equal(f.db.updates,1);});
const sourceChanged=files.filter(file=>sha(file)!==pins[file]),result={suite:'review132-workspace-security-boundaries',sourcePins:pins,sourceChanged,checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,scope:'Actual workspace runtime/session/PUT/GET and handlers with strict SQL-compatible memory transaction; synthetic only',externalNetworkCalls:0,productionDatabaseCalls:0,browserRuns:0};
console.log(JSON.stringify(result,null,2));if(result.failed||sourceChanged.length)process.exitCode=1;
