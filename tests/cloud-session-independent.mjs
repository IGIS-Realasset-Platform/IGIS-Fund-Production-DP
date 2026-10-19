import assert from 'node:assert/strict';
import vm from 'node:vm';
import {makeHarness} from './recovery-harness.mjs';

const oldKey='development-platform-real-v0110';
const blank={version:'0.11.1',storageRevision:0,currentProjectId:'P1',selectedProjectId:'P1',projects:[{id:'P1',name:'서버 사업',type:'',location:'',basic:{},building:{},cbs:[],costStages:[],contracts:[],documents:[],permits:[],milestones:[],loans:[],equities:[],guarantees:[],sales:[],reports:[],reportSnapshots:[],reportDraftOverrides:[],areaVersions:[],landParcels:[],landContracts:[],landPaymentSchedule:[],vatRecords:[],fundForecasts:[],fundPayments:[]}],entities:[],auditEvents:[],notifications:[],companies:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],migrationConflicts:[],integrityIssues:[],storageQuarantine:[],sourceLoad:{status:'unavailable',schemaVersion:'notion-development-projects-v1',expectedCount:null,actualCount:0,hasMore:null,syncedAt:''}};
const response=(status,body)=>({status,ok:status>=200&&status<300,json:async()=>structuredClone(body)});
function harness({queue=[]}={}){
  const local=new Map([[oldKey,JSON.stringify({...blank,projects:[{...blank.projects[0],name:'읽지 않을 로컬 사업'}]})]]),h=makeHarness({modules:[],seed:{...blank,projects:[]},storageMap:local});h.context.APP_RUNTIME={mode:'real',version:'0.11.1',storageKey:oldKey,persistence:'cloud'};h.context.fetch=async()=>{const next=queue.shift();if(!next)throw Error('unexpected fetch');return next};h.load('core');h.load('cloud-session');const A=vm.runInContext('App',h.context);A.register('portfolio',()=>'<p>프로젝트 현황</p>');return{...h,A,local};
}
const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}

await check('CLOUD-SESSION-INDEPENDENT-01 두번연속저장은서버revision·state·actor를다음요청기준으로사용',async()=>{
  const h=harness(),requests=[];h.A.installCloudPersistence({workspaceId:'platform',revision:2,scope:'cloud-user-1-platform',capabilities:{createProject:true},projectRoles:{P1:'editor'},commit:async request=>{requests.push(structuredClone(request));const state=structuredClone(request.state);state.auditEvents[0].actor='server-user@igisam.com';state.projects[0].serverConfirmedRevision=request.baseRevision+1;return{workspaceId:'platform',revision:request.baseRevision+1,requestId:request.requestId,state}}});h.A.hydrateCloudWorkspace({workspaceId:'platform',revision:2,state:blank,scope:'cloud-user-1-platform'});await h.A.boot();
  h.A.transaction(()=>{const p=h.A.current(),before=p.name;p.name='첫 변경';h.A.audit('UPDATE','project',p.id,before,p.name)});await h.A.cloudPersistence.wait();assert.equal(h.A.cloudPersistence.revision(),3);assert.equal(h.A.state.auditEvents[0].actor,'server-user@igisam.com');assert.equal(h.A.current().serverConfirmedRevision,3);
  h.A.transaction(()=>{const p=h.A.current(),before=p.name;p.name='둘째 변경';h.A.audit('UPDATE','project',p.id,before,p.name)});await h.A.cloudPersistence.wait();assert.equal(h.A.cloudPersistence.revision(),4);assert.equal(h.A.state.auditEvents[0].actor,'server-user@igisam.com');assert.equal(h.A.current().serverConfirmedRevision,4);assert.deepEqual(requests.map(row=>row.baseRevision),[2,3]);assert.notEqual(requests[0].requestId,requests[1].requestId);assert.equal(requests[1].state.auditEvents[1].actor,'server-user@igisam.com','second request must carry first authoritative actor');
});

await check('CLOUD-SESSION-INDEPENDENT-02 저장중401은원장메모리만비우고사용자별초안·UIcache·oldlocal을보존',async()=>{
  const h=harness({queue:[response(200,{workspaceId:'platform',revision:1,state:blank,capabilities:{createProject:true,manageAccess:false},projectRoles:{P1:'editor'},user:{id:'user-1',email:'qa.user@igisam.com'}}),response(401,{error:'SESSION_REQUIRED'})]});await h.A.cloudSession.start();h.A.form('합성 초안',h.A.field('name','사업명','서버 사업'),()=>{},'저장',{draftKey:'cloud-independent-draft',initialValues:{name:'서버 사업'}});h.A.formEditor.setValues({name:'보존할 초안'});h.A.persistUI();const beforeKeys=[...h.session.keys()],draftKey=beforeKeys.find(key=>String(h.session.get(key)).includes('보존할 초안')),uiKey=beforeKeys.find(key=>String(key).endsWith('-ui'));assert(draftKey);assert(uiKey);
  h.A.transaction(()=>{const p=h.A.current(),before=p.name;p.name='만료 저장';h.A.audit('UPDATE','project',p.id,before,p.name)});await assert.rejects(()=>h.A.cloudPersistence.wait());await new Promise(resolve=>setImmediate(resolve));assert.equal(h.A.cloudSession.status().phase,'login');assert.equal(h.A.state.projects.length,0);assert.equal(h.A.cloudPersistence.booted(),false);assert(String(h.session.get(draftKey)).includes('보존할 초안'));assert(h.session.has(uiKey));assert(String(h.local.get(oldKey)).includes('읽지 않을 로컬 사업'));
});

const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'cloud-session-independent',passed:checks.length-failed.length,failed:failed.length,total:checks.length,realNetwork:false,realUserData:false,checks}));if(failed.length)process.exitCode=1;

