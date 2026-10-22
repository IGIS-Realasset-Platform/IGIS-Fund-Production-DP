import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';
import {createBlankWorkspaceState,filterWorkspaceState,mergeWorkspaceState,WorkspaceError} from '../server/cloud-storage.mjs';

const source=JSON.parse(fs.readFileSync('src/data/law-source-v0110.json','utf8')),copy=value=>JSON.parse(JSON.stringify(value));
const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x!==null&&typeof x==='object'?'{'+Object.keys(x).sort().map(key=>JSON.stringify(key)+':'+stable(x[key])).join(',')+'}':JSON.stringify(x),hash=x=>createHash('sha256').update(stable(x)).digest('hex');
const lawKeys=['lawCatalog','lawChanges','lawUpdateRuns','projectLawImpacts','lawSourceV0110'];
const laws=state=>Object.fromEntries(lawKeys.filter(key=>Object.hasOwn(state,key)).map(key=>[key,state[key]]));
const project=(id,entityId)=>({id,name:'합성 사업',type:'오피스',location:'서울',stage:'설계',entityId,basic:{operator:entityId,method:'일반 건축'},building:{gfaTotal:10000,siteArea:1000},land:{},cbs:[{id:'COST-'+id,name:'토지매입비',current:100,initial:90}],costCoding:{version:1,masterVersion:'company-cbs-v4',currentByRecordId:{['COST-'+id]:{recordId:'COST-'+id,costTypeId:'land_purchase',costTypeCode:'IGIS-COST:land_purchase',masterVersion:'company-cbs-v4',costTypeMappingStatus:'confirmed',reason:'합성 검사',method:'selected'}},historicalByStageId:{}},costStages:[],reportSnapshots:[],reports:[],contracts:[],documents:[],permits:[],landParcels:[],landContracts:[],landPaymentSchedule:[],sales:[]});
function baseline(mode='empty'){
 const state=createBlankWorkspaceState();state.version='0.11.2';state.projects=[project('P1','E1'),project('P2','E2')];state.currentProjectId='P1';state.selectedProjectId='P1';state.entities=[{id:'E1',name:'E1'},{id:'E2',name:'E2'}];
 if(mode!=='empty'){
  const version=mode==='newer'?'2026-10-16':'2026-09-01',catalog={...copy(source.catalog[0]),name:mode==='newer'?'서버의 더 새로운 법령명':'서버의 기존 법령명',sourceVersion:version,origin:'official-snapshot',sample:false},change={...copy(source.changes[0]),lawId:catalog.id,title:mode==='newer'?'서버의 더 새로운 변경 내용':'서버의 기존 변경 내용',asset:'',region:'',minArea:null,sourceVersion:version,origin:'official-snapshot',sample:false,status:'검토 완료',reviewer:'기존 검토자',note:'사용자 검토 유지',reviewedAt:'2026-10-15',reviewHistory:[{status:'검토 중',note:'이전 기록 보존'}]};state.lawCatalog=[catalog];state.lawChanges=[change];state.lawSourceV0110={version,dataDate:version,checkedAt:version+'T00:00:00Z',sources:[],coverage:{scope:'서버 확인 범위'}};state.lawUpdateRuns=[{id:'SERVER-RUN',origin:'official-snapshot',sourceVersion:version,status:'공식 확인 완료',sample:false,dataDate:version}];
  state.projectLawImpacts=state.projects.map(p=>{const facts={type:p.type,location:p.location,gfaTotal:p.building.gfaTotal,method:p.basic.method,stage:p.stage};return{id:'IMPACT-'+p.id,changeId:change.id,projectId:p.id,status:'검토 완료',reviewer:'기존 검토자',note:'검토 메모 보존',reviewedAt:'2026-10-15',active:true,matchState:'관련 가능',ruleVersion:'server-triage-v1',factsFingerprint:JSON.stringify(facts),matchedFacts:facts,reviewHistory:[{status:'검토 중',note:'기존 영향 이력'}]}});
 }
 return state;
}
function harness({state=baseline(),admin=false,cloud=true}={}){
 const current=copy(state),access=admin?{isAdmin:true}:{projects:{P1:'editor'}},visible=cloud?filterWorkspaceState(current,access):copy(current),h=makeHarness({modules:[],seed:visible});Object.assign(h.context,{APP_RUNTIME:{mode:'real',version:'0.11.2',storageKey:'auth112-law-isolated',...(cloud?{persistence:'cloud'}:{})},LAW_SOURCE_V0110:copy(source)});h.load('html-test-fixture-policy');h.load('core');h.load('legal');const A=vm.runInContext('App',h.context);A.register('portfolio',()=>'<p></p>');A.render=()=>{};A.cloudSession={status:()=>({authenticated:false}),can:()=>false};const requests=[];let stored=current,lastServerError;
 if(cloud){A.installCloudPersistence({workspaceId:'platform',revision:1,scope:'synthetic-user-platform',capabilities:{createProject:admin,manageAccess:admin},projectRoles:access.projects||{},commit:async request=>{const payload=copy(request.state);requests.push(payload);try{const result=mergeWorkspaceState(stored,payload,access,{email:'synthetic.diagnostic@igisam.com'});stored=result.state;stored.storageRevision=request.baseRevision+1;return{workspaceId:'platform',revision:request.baseRevision+1,requestId:request.requestId,state:filterWorkspaceState(stored,access)}}catch(error){lastServerError={status:error.status,code:error.code};throw Object.assign(Error('합성 저장 거부'),{code:error.status===403?'FORBIDDEN':error.code})}}});A.hydrateCloudWorkspace({workspaceId:'platform',revision:1,scope:'synthetic-user-platform',state:visible});}
 A.boot();return{A,requests,current,visible,get stored(){return stored},get lastServerError(){return lastServerError}};
}
async function saveOneWon(app){app.A.transaction(()=>{app.A.state.projects[0].cbs[0].current+=1});try{await app.A.cloudPersistence.wait();return'accepted'}catch(error){return error.code}}
const checks=[];async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:'승인된 부트·저장 기대값과 현재 동작 불일치',...(error.observed?{observed:error.observed}:{})});console.error('FAIL '+name)}}

for(const mode of ['empty','older','newer'])for(const admin of [false,true])await check('CLOUD-LAW-'+mode+'-'+(admin?'ADMIN':'EDITOR')+' 부트서버자료보존후1원저장',async()=>{
 const app=harness({state:baseline(mode),admin}),bootLaws=hash(laws(app.A.state));assert.equal(app.requests.length,0);const result=await saveOneWon(app);if(result!=='accepted'){const error=Error('실제 merge 저장 거부');error.observed=app.lastServerError;throw error}assert.equal(bootLaws,hash(laws(app.visible)));assert.equal(hash(laws(app.stored)),hash(laws(app.current)));assert.equal(app.stored.projects[0].cbs[0].current,101);assert.equal(app.stored.projects[1].cbs[0].current,100);assert.equal(app.requests.length,1);
});
await check('CLOUD-LAW-07 최초부트는stale영향의사용자검토·이력도재판정하지않음',()=>{
 const state=baseline('newer');state.projectLawImpacts[0].factsFingerprint='이전 사실 지문';const app=harness({state,admin:true});assert.equal(hash(laws(app.A.state)),hash(laws(state)));assert.equal(app.A.cloudSession.status().authenticated,false);assert.equal(app.A.cloudPersistence.capabilities().manageAccess,true);assert.equal(app.A.cloudPersistence.booted(),true);
});
// LCR-08 supersedes automatic official-review manufacture/reset. Existing
// source/permission/one-won persistence assertions above remain unchanged.
await check('CLOUD-LAW-08 사업조건변경뒤공식후보조회는수기검토·이력을자동초기화하지않음',()=>{
 const app=harness({state:baseline('older'),admin:true});app.A.state.projects[0].building.gfaTotal+=1;const before=hash(app.A.state.projectLawImpacts),result=app.A.legal.refreshProjectImpacts(app.A.state);assert.equal(result.added,0);assert.equal(result.updated,0);assert.equal(hash(app.A.state.projectLawImpacts),before);const row=app.A.state.projectLawImpacts.find(x=>x.projectId==='P1');assert.equal(row.note,'검토 메모 보존');assert.equal(row.reviewHistory[0].note,'기존 영향 이력');
});
await check('CLOUD-LAW-09 신규사업initialize는공식자료와기존검토보존·자동수기기록0',()=>{
 const app=harness({state:baseline('older'),admin:true}),before=hash({catalog:app.A.state.lawCatalog,changes:app.A.state.lawChanges,runs:app.A.state.lawUpdateRuns,source:app.A.state.lawSourceV0110}),reviews=hash(app.A.state.projectLawImpacts);app.A.state.projects.push(project('P3','E3'));app.A.legal.initialize(app.A.state);assert(!app.A.state.projectLawImpacts.some(x=>x.projectId==='P3'));assert.equal(hash(app.A.state.projectLawImpacts),reviews);assert.equal(hash({catalog:app.A.state.lawCatalog,changes:app.A.state.lawChanges,runs:app.A.state.lawUpdateRuns,source:app.A.state.lawSourceV0110}),before);
});
await check('CLOUD-LAW-10 관리자명시import·collectionhelper는보존',()=>{
 const app=harness({admin:true}),result=app.A.legal.importLawSource(app.A.state);assert.equal(result.skipped,false);assert.equal(app.A.state.lawCatalog.length,182);assert.equal(app.A.state.lawChanges.length,158);assert.equal(app.A.state.lawSourceV0110.version,source.version);const collected=app.A.legal.applyLawCollectionResult(app.A.state,{status:'success',sample:false,dataDate:'2026-10-16',changes:[{id:'EXPLICIT-COLLECTION',lawId:source.catalog[0].id,title:'명시적 합성 확인',sample:false}]});assert.equal(collected.added,1);assert(app.A.state.lawChanges.some(x=>x.id==='EXPLICIT-COLLECTION'));
});
await check('CLOUD-LAW-11 비cloud기존HTML의공식snapshot부트유지',()=>{
 const app=harness({cloud:false});assert.equal(app.A.state.lawCatalog.length,182);assert.equal(app.A.state.lawChanges.length,158);assert.equal(app.A.state.lawSourceV0110.version,source.version);assert.equal(app.A.legal.lawSourceInfo().dataDate,source.dataDate);
});
await check('CLOUD-LAW-12 서버의비관리자global변경차단은계속403',()=>{
 const state=baseline('older'),access={projects:{P1:'editor'}},input=filterWorkspaceState(state,access);input.lawCatalog[0].name='허용되지 않은 전역 변경';assert.throws(()=>mergeWorkspaceState(state,input,access,{email:'synthetic.diagnostic@igisam.com'}),error=>error instanceof WorkspaceError&&error.status===403);assert.equal(state.lawCatalog[0].name,'서버의 기존 법령명');
});
const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'auth112-legal-hydration',passed:checks.length-failed.length,failed:failed.length,total:checks.length,scope:'actual core/legal cloud boot and actual server merge with synthetic workspaces; no actor model authorization inference',sourceSnapshotVersion:source.version,actualDatabaseUsed:false,actualApiUsed:false,realUserDataUsed:false,externalRequests:0,checks}));if(failed.length)process.exitCode=1;
