import assert from 'node:assert/strict';
import {WorkspaceError,createBlankWorkspaceState,validateWorkspaceState,mergeWorkspaceState,filterWorkspaceState,workspaceStateHash} from '../server/cloud-storage.mjs';

// 사용자 승인 SDD/독립 원본 지문으로 정한 기대값이며 구현의 허용 배열에서 복사하지 않습니다.
const sourceSha='0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a';
const fixture=(letter='A',flag=false)=>({id:'TEST-20261016-'+letter,name:letter,...(flag?{isExample:true}:{}),testData:{kind:'user-approved-html-fixture',batchId:'20261016-abc',sourceProjectId:{A:'YD427',B:'YD816',C:'IOTA'}[letter],sourceHtmlSha256:sourceSha},cbs:[],costStages:[],reportSnapshots:[]});
const normal=()=>({id:'REAL-ONLY',name:'일반사업',cbs:[],costStages:[],reportSnapshots:[]});
const stateWith=(...projects)=>({...createBlankWorkspaceState(),projects});
const admin={isAdmin:true},user={email:'synthetic.admin@igisam.com'};
const invalid=error=>error instanceof WorkspaceError&&error.status===400;
const denied=error=>error instanceof WorkspaceError&&error.status===403;
const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error instanceof WorkspaceError?error.code:'기대 동작과 현재 구현 불일치'});console.error('FAIL '+name)}}

await check('HTML-FIXTURE-01 정확한3사업marker는원본예시flag와함께명시허용',()=>{for(const letter of ['A','B','C']){const state=stateWith(fixture(letter,true));assert.equal(validateWorkspaceState(state),state)}});
await check('HTML-FIXTURE-02 일반예시와reserved-ID의미표시·다른ID는거부',()=>{
 for(const p of [{id:'YD427',name:'원본예시'}, {id:'OTHER',name:'원본예시',sample:true}, {id:'TEST-20261016-A',name:'미표시'}, {...fixture(),id:'TEST-20261016-D'}, {...fixture(),id:'REAL-ONLY'}])assert.throws(()=>validateWorkspaceState(stateWith(p)),invalid);
});
await check('HTML-FIXTURE-03 불완전·위조·확장marker와비정규sourceSHA는거부',()=>{
 for(const mutate of [p=>{delete p.testData.batchId},p=>{p.testData.kind='other'},p=>{p.testData.batchId='other'},p=>{p.testData.sourceProjectId='YD816'},p=>{p.testData.sourceHtmlSha256='f'.repeat(64)},p=>{p.testData.sourceHtmlSha256=sourceSha.toUpperCase()},p=>{p.testData.extra=true},p=>{p.testData=null}]){const p=fixture();mutate(p);assert.throws(()=>validateWorkspaceState(stateWith(p)),invalid)}
});
await check('HTML-FIXTURE-04 저장후이름변경은허용하지만marker는불변',()=>{
 const current=stateWith(fixture()),renamed=structuredClone(current);renamed.projects[0].name='사용자가 변경한 이름';assert.equal(mergeWorkspaceState(current,renamed,admin,user).state.projects[0].name,'사용자가 변경한 이름');
 for(const mutate of [p=>{delete p.testData},p=>{p.testData.batchId='other'},p=>{p.testData.sourceProjectId='IOTA'}]){const changed=structuredClone(current);mutate(changed.projects[0]);assert.throws(()=>mergeWorkspaceState(current,changed,admin,user),invalid)}
});
await check('HTML-FIXTURE-05 관리자만정확한기존테스트사업을projects에서제거',()=>{
 const current=stateWith(fixture(),normal()),next=structuredClone(current);next.projects=next.projects.filter(p=>p.id!=='TEST-20261016-A');const merged=mergeWorkspaceState(current,next,admin,user);assert.deepEqual(merged.state.projects.map(p=>p.id),['REAL-ONLY']);assert.deepEqual(merged.changedProjectIds,['TEST-20261016-A']);
});
await check('HTML-FIXTURE-06 일반사업삭제는관리자에게도계속거부',()=>{const current=stateWith(normal()),next=stateWith();assert.throws(()=>mergeWorkspaceState(current,next,admin,user),error=>invalid(error)&&error.code==='PROJECT_REMOVAL_NOT_ALLOWED')});
await check('HTML-FIXTURE-07 비관리자에게보이는테스트사업의삭제는거부',()=>{
 const current=stateWith(fixture()),next=stateWith();assert.throws(()=>mergeWorkspaceState(current,next,{projects:{'TEST-20261016-A':'editor'}},user),denied);
});
await check('HTML-FIXTURE-08 비관리자의scope밖누락은삭제가아니며원형보존',()=>{
 const current=stateWith(fixture(),normal()),access={projects:{'REAL-ONLY':'editor'}},incoming=filterWorkspaceState(current,access);incoming.projects[0].name='일반사업 정상수정';const merged=mergeWorkspaceState(current,incoming,access,user);assert(merged.state.projects.some(p=>p.id==='TEST-20261016-A'));assert.equal(merged.state.projects.find(p=>p.id==='REAL-ONLY').name,'일반사업 정상수정');
});
await check('HTML-FIXTURE-09 테스트삭제시공유법인·업체·기존감사는자동삭제하지않음',()=>{
 const p=fixture(),r=normal();p.entityId='SHARED';r.entityId='SHARED';const current=stateWith(p,r);current.entities=[{id:'SHARED',name:'공유법인'}];current.companies=[{id:'SHARED-COMPANY',name:'공유업체'}];current.auditEvents=[{id:'OLD-AUDIT',projectId:p.id,actor:'기존',action:'CREATE'}];
 const incoming=structuredClone(current);incoming.projects=incoming.projects.filter(p=>p.id==='REAL-ONLY');const merged=mergeWorkspaceState(current,incoming,admin,user);assert.deepEqual(merged.state.entities,current.entities);assert.deepEqual(merged.state.companies,current.companies);assert.deepEqual(merged.state.auditEvents,current.auditEvents);
});
await check('HTML-FIXTURE-10 삭제예외와일반사업삭제를섞으면전체거부·입력원본불변',()=>{
 const current=stateWith(fixture(),normal()),before=workspaceStateHash(current);assert.throws(()=>mergeWorkspaceState(current,stateWith(),admin,user),invalid);assert.equal(workspaceStateHash(current),before);
});
await check('HTML-FIXTURE-11 테스트marker가ID·원단위정수·등록코드검사를우회하지못함',()=>{
 for(const mutate of [p=>{p.cbs=[{id:'X',current:1.5}]},p=>{p.cbs=[{id:'X',current:1},{id:'X',current:2}]},p=>{p.cbs=[{current:1}]},p=>{p.costCoding={version:1,masterVersion:'company-cbs-v4',currentByRecordId:{X:{recordId:'X',costTypeId:'unknown',costTypeCode:'unknown',masterVersion:'company-cbs-v4',costTypeMappingStatus:'confirmed',reason:'검사',method:'selected'}},historicalByStageId:{}}}]){const p=fixture();mutate(p);assert.throws(()=>validateWorkspaceState(stateWith(p)),invalid)}
});
await check('HTML-FIXTURE-12 비관리자의신규테스트사업추가는거부',()=>{assert.throws(()=>mergeWorkspaceState(stateWith(),stateWith(fixture()),{projects:{}},user),denied)});

const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'cloud-html-fixtures',passed:checks.length-failed.length,failed:failed.length,total:checks.length,actualDatabaseUsed:false,actualApiUsed:false,rawSourceValuesChanged:false,initialFinancialImportCompatibility:'separate original-export pin validation required',checks}));if(failed.length)process.exitCode=1;
