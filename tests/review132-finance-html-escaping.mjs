import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {createBlankWorkspaceState,createWorkspaceHandlers,WorkspaceError,filterWorkspaceState} from '../server/cloud-storage.mjs';
import {createWorkspaceRuntime} from '../server/workspace-runtime.mjs';
import {makeHarness} from './recovery-harness.mjs';

const root=new URL('../',import.meta.url),clone=structuredClone,origin='https://security132-render.example.invalid',checks=[],outputs=[];
const outArg=process.argv.indexOf('--output'),artifactArg=process.argv.indexOf('--artifact-dir'),artifactDir=artifactArg<0?null:process.argv[artifactArg+1];
const files=['src/contracts.js','src/core.js','server/cloud-storage.mjs','server/workspace-runtime.mjs','tests/cloud-storage.mjs'];
const hash=file=>createHash('sha256').update(fs.readFileSync(new URL(file,root))).digest('hex'),pins=Object.fromEntries(files.map(file=>[file,hash(file)]));
function initial(){
 const state=createBlankWorkspaceState();
 const loan={id:'L1',institution:'합성 대주 & 기관',rank:'선순위',type:'본PF',commitment:1000001,executed:0,balance:0,interestRate:5.6,allIn:5.6,allInAdvisoryBasis:'excluded',start:'2026-01-01',maturity:'2027-01-01',finalMaturity:'2027-01-01'};
 const contract={id:'K1',name:'합성 계약',counterparty:'합성 상대방',companyId:'',status:'체결',period:'2026',proposalNumber:'',revisions:[{id:'R1',revision:1,date:'2026-10-01',total:1000001,net:900001,vat:100000,costAmount:1000001,allocations:[],note:'원문 & 메모'}],payments:[{id:'PAY1',date:'2026-10-02',amount:0,costAmount:0,obligationId:'',allocations:[],proposalNumber:'합성'}],certifications:[{id:'CERT1',date:'2026-10-03',amount:0,note:'기성 원문'}],obligations:[]};
 state.projects=[{id:'P1',entityId:'E1',name:'합성 자기 사업',basic:{},building:{},contracts:[contract],loans:[loan],cbs:[],costStages:[],permits:[],documents:[],reportSnapshots:[],loanQuarterlyRecords:[{id:'Q1',loanId:'L1',asOf:'2026-09-30',commitment:1000001,executed:0,balance:0,allIn:5.6,loan:clone(loan)}]},{id:'P2',entityId:'E2',name:'합성 타사업',contracts:[],loans:[],cbs:[],costStages:[],permits:[],documents:[]}];
 state.entities=[{id:'E1',name:'합성 법인1'},{id:'E2',name:'합성 법인2'}];
 return state;
}
function runtimeFixture(){
 const text=fs.readFileSync(new URL('tests/cloud-storage.mjs',root),'utf8'),start=text.indexOf('function fakeTransaction('),end=text.indexOf('\nasync function invoke(',start);
 assert(start>=0&&end>start,'existing strict SQL fixture must be present');
 const access={U1:{isAdmin:false,canCreateProject:false,projects:{P1:'editor'}}},session={U1:{userId:'U1',email:'synthetic.render132@igisam.com'}};
 const code=text.slice(start,end).replace('return{db,withTransaction,accessPolicy};','return{db,withTransaction,accessPolicy,client,snapshot,restore};');
 const make=new Function('clone','baseState','access','session','WorkspaceError',code+';return fakeTransaction;')(clone,initial,access,session,WorkspaceError),store=make({state:initial(),user:'U1'});let transactionSnapshot=null,active=false;
 const client={release(){},query:async(sql,args=[])=>{const q=String(sql).replace(/\s+/g,' ').trim();if(q==='BEGIN'){transactionSnapshot=store.snapshot();active=true;store.db.open++;return{rows:[]};}if(q==='COMMIT'){transactionSnapshot=null;active=false;store.db.open--;store.db.commits++;return{rows:[]};}if(q==='ROLLBACK'){if(transactionSnapshot)store.restore(transactionSnapshot);if(active)store.db.open--;transactionSnapshot=null;active=false;store.db.rollbacks++;return{rows:[]};}if(q==='SET LOCAL search_path = pg_catalog, development_project_platform'||q==="SET LOCAL statement_timeout = '10s'")return{rows:[]};return store.client.query(sql,args);}};
 // Generated values are disposable format placeholders, never credentials; every service and driver is replaced.
 const placeholder=randomUUID().replaceAll('-',''),environment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:placeholder+placeholder,DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:'+placeholder+'@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic.render132@gmail.com',DP_GMAIL_APP_PASSWORD:placeholder.slice(0,16),DP_ALLOWED_EMAILS:JSON.stringify([session.U1.email])});
 const runtime=createWorkspaceRuntime({environment,loadDrivers:async()=>({pool:{connect:async()=>client}}),createService:async()=>({handle:async()=>Response.json({authenticated:true,...session.U1})}),createHandlers:({withTransaction,origin})=>createWorkspaceHandlers({withTransaction,origin,accessPolicy:store.accessPolicy})});
 return{store,access,session,input:()=>filterWorkspaceState(store.db.workspace.state,access.U1),get:()=>runtime(new Request(origin+'/api/workspace'),'workspace'),put:state=>runtime(new Request(origin+'/api/workspace',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify({workspaceId:'platform',baseRevision:0,requestId:'render132_request_00000001',state})}),'workspace')};
}
function render(state){
 const h=makeHarness({modules:['core','cbs'],costTaxonomyV4:true,seed:state}),A=h.A,actions=new Map(),on=A.on;
 A.on=(key,fn)=>{actions.set(key,fn);return on(key,fn);};h.load('contracts');for(const fn of A.initializers)fn(A.state);A.ui.projectId='P1';A.ui.view='finance';let html='';
 A.modal=(_title,body)=>{html=body;};const before=JSON.stringify(A.state),views={};
 actions.get('finance-quarter-list')({dataset:{action:'finance-quarter-list'}});views.quarter=html;
 A.ui.contractDetailTab='payment';actions.get('contract-detail')({dataset:{id:'K1',action:'contract-detail'}});views.payment=html;
 A.ui.contractDetailTab='changes';actions.get('contract-detail-tab')({dataset:{id:'K1',tab:'changes',action:'contract-detail-tab'}});views.changes=html;
 assert.equal(JSON.stringify(A.state),before,'reading actual handlers must not rewrite stored source values');
 return{h,A,views};
}
const marker=id=>'<img src="data:invalid" onerror="document.documentElement.setAttribute(\'data-security132-fired\',\''+id+'\')">';
const active=html=>/<(?:img|svg)\b[^>]*\bon(?:error|load)\s*=/i.test(html);
const text=html=>html.replace(/<[^>]*>/g,'').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&');
async function test(name,run){try{await run();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}}
let stored,view,apiResult,db;
await test('HTML132-API own editor actual runtime PUT/GET accepts exact synthetic legacy fields and preserves other project',async()=>{
 const f=runtimeFixture(),input=f.input(),p=input.projects[0],c=p.contracts[0];
 p.loanQuarterlyRecords[0].asOf=marker('QUARTER');c.payments[0].date=marker('PAYMENT');c.certifications[0].date=marker('CERTIFICATION');c.revisions[0].revision=marker('REVISION');c.revisions[0].date=marker('REVISIONDATE');
 const payloadCopy=clone(input),otherBefore=clone(f.store.db.workspace.state.projects[1]),put=await f.put(input);assert.equal(put.status,200,await put.clone().text());apiResult=await put.json();assert.equal(apiResult.revision,1);
 const get=await f.get();assert.equal(get.status,200);const body=await get.json();stored=body.state;db=f.store.db;assert.equal(stored.projects.length,1);assert.equal(stored.projects[0].id,'P1');assert.deepEqual(f.store.db.workspace.state.projects[1],otherBefore);
 const next=stored.projects[0],expected=payloadCopy.projects[0];for(const [actual,value]of [[next.loanQuarterlyRecords[0].asOf,expected.loanQuarterlyRecords[0].asOf],[next.contracts[0].payments[0].date,expected.contracts[0].payments[0].date],[next.contracts[0].certifications[0].date,expected.contracts[0].certifications[0].date],[next.contracts[0].revisions[0].revision,expected.contracts[0].revisions[0].revision],[next.contracts[0].revisions[0].date,expected.contracts[0].revisions[0].date]])assert.equal(actual,value);
 assert.equal(db.updates,1);assert.equal(db.open,0);view=render(stored);
 if(artifactDir){fs.mkdirSync(artifactDir,{recursive:true});for(const[key,html]of Object.entries(view.views)){const file=path.join(artifactDir,key+'.html'),bytes='<!doctype html><html lang="ko"><meta charset="utf-8"><title>격리 합성 '+key+'</title><body><h1>격리 합성 '+key+'</h1>'+html+'</body></html>';fs.writeFileSync(file,bytes);outputs.push({kind:key,file,sha256:createHash('sha256').update(bytes).digest('hex')});}}
});
for(const [kind,id]of [['quarter','QUARTER'],['payment','PAYMENT'],['payment','CERTIFICATION'],['changes','REVISION'],['changes','REVISIONDATE']])await test('HTML132-ESC actual registered '+kind+' handler renders '+id+' as literal text',()=>{assert(view,'runtime preparation must complete');const html=view.views[kind];assert(!active(html),'active HTML event element reached the actual modal table');assert(html.includes('&lt;img '));assert(html.includes(id));assert(text(html).includes(marker(id)),'literal source string should remain visible');});
await test('HTML132-ALT alternate SVG/onload text cannot create an active element',()=>{const state=initial(),p=state.projects[0],value='<svg onload="document.documentElement.setAttribute(\'data-security132-fired\',\'SVG\')"></svg>';p.loanQuarterlyRecords[0].asOf=value;const output=render(state).views.quarter;assert(!active(output));assert(text(output).includes(value));});
await test('HTML132-CONTROL Korean legacy text, ampersands, quotes, entities and brackets remain literal',()=>{for(const value of ['2026-10-29','2026년 10월 예정','원문 & "기호" <일정>','&lt;기존 원문&gt;']){const state=initial(),p=state.projects[0],c=p.contracts[0];p.loanQuarterlyRecords[0].asOf=value;c.payments[0].date=value;c.certifications[0].date=value;c.revisions[0].date=value;c.revisions[0].revision=value;const output=render(state);for(const key of ['quarter','payment','changes'])assert(text(output.views[key]).includes(value),key+': '+value);assert(text(output.views.changes).includes(value+'차'));}});
await test('HTML132-CONTROL zero/null and original monetary amounts preserve the existing representation',()=>{for(const value of [0,null]){const state=initial(),p=state.projects[0],c=p.contracts[0];p.loanQuarterlyRecords[0].asOf=value;c.payments[0].date=value;c.certifications[0].date=value;c.revisions[0].date=value;c.revisions[0].revision=value;const output=render(state),quarter=output.views.quarter,payment=output.views.payment,changes=output.views.changes;assert(quarter.includes('<td'+(value===0?'':'') ));if(value===0){assert(/<td[^>]*>0<\/td>/.test(quarter));assert(/<td[^>]*>0<\/td>/.test(payment));}assert(text(changes).includes(String(value)+'차'));assert(text(changes).includes('미입력'),'existing revision date || fallback remains unchanged');assert(quarter.includes(output.A.money(1000001)));assert(changes.includes(output.A.money(1000001)));assert.equal(output.A.current().contracts[0].revisions[0].total,1000001);assert.equal(output.A.current().contracts[0].payments[0].amount,0);}});
function firstCells(html,heading){const at=html.indexOf('>'+heading+'<');assert(at>=0,'actual table heading '+heading);const tbody=html.slice(at).match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1],row=tbody?.match(/<tr[^>]*>([\s\S]*?)<\/tr>/)?.[1];assert(row,'actual table row '+heading);return [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(match=>text(match[1]));}
await test('HTML132-LEGACY null/undefined retain em dash, explicit empty stays empty, numeric date zero stays zero',()=>{for(const value of [null,undefined,'',0]){const state=initial(),p=state.projects[0];p.loanQuarterlyRecords[0].asOf=value;p.contracts[0].payments[0].date=value;p.contracts[0].certifications[0].date=value;const output=render(state),expected=value==null?'—':String(value);assert.equal(firstCells(output.views.quarter,'기준일')[1],expected,'quarter '+String(value));assert.equal(firstCells(output.views.payment,'지급일')[0],expected,'payment '+String(value));assert.equal(firstCells(output.views.payment,'기준일')[0],expected,'certification '+String(value));}});
await test('HTML132-PRESERVE rendering does not encode, normalize, or rewrite original stored values',()=>{assert(stored);const before=JSON.stringify(stored);render(stored);assert.equal(JSON.stringify(stored),before);assert.equal(stored.projects[0].contracts[0].revisions[0].total,1000001);assert.equal(stored.projects[0].loanQuarterlyRecords[0].executed,0);});
const sourceChanged=files.filter(file=>hash(file)!==pins[file]),result={suite:'review132-finance-html-escaping',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,checks,sourcePins:pins,sourceChanged,outputs,scope:'Actual workspace runtime PUT/GET with strict synthetic SQL transaction → actual registered frontend renderer handlers. Active-element structure checked here; browser DOM marker execution/blocked proof is separate. No credentials, real service or live DB.',syntheticWorkspaceWrites:db?.updates??0,externalNetworkCalls:0,productionDatabaseCalls:0,browserRuns:0};
if(outArg>=0)fs.writeFileSync(process.argv[outArg+1],JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(result.failed||sourceChanged.length)process.exitCode=1;

