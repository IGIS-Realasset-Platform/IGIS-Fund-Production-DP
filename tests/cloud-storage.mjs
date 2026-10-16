import assert from 'node:assert/strict';
import {
  WorkspaceError,
  createBlankWorkspaceState,
  createWorkspaceHandlers,
  filterWorkspaceState,
  mergeWorkspaceState,
  normalizeWorkspaceAccess,
  validateProjectCostChange,
  validateWorkspaceState,
  workspaceErrorResponse
} from '../server/cloud-storage.mjs';

const origin='https://platform.example.invalid';
const clone=value=>structuredClone(value);
const project=(id,entityId,name)=>({id,entityId,name,costStages:[],reportSnapshots:[],contracts:[],permits:[]});
function baseState(){
  const state=createBlankWorkspaceState();state.sourceLoad={status:'ready',schemaVersion:'synthetic',expectedCount:2,actualCount:2,hasMore:false,syncedAt:'2026-10-15'};
  state.projects=[project('P1','E1','합성 사업1'),project('P2','E2','합성 사업2')];state.entities=[{id:'E1',name:'합성 법인1'},{id:'E2',name:'합성 법인2'}];
  state.auditEvents=[{id:'A1',projectId:'P1',action:'CREATE',actor:'server'},{id:'A2',projectId:'P2',action:'CREATE',actor:'server'}];state.notifications=[{id:'N1',projectId:'P1',title:'합성 알림1'},{id:'N2',projectId:'P2',title:'합성 알림2'}];return state;
}
const access={U1:{isAdmin:false,canCreateProject:false,projects:{P1:'editor'}},U2:{isAdmin:false,canCreateProject:false,projects:{P2:'viewer'}},ADMIN:{isAdmin:true,canCreateProject:true,projects:{}}};
const session={U1:{userId:'U1',email:'user1@igisam.com'},U2:{userId:'U2',email:'user2@igisam.com'},ADMIN:{userId:'ADMIN',email:'admin@igisam.com'}};

function fakeTransaction({state=baseState(),revision=0,user='U1',casFail=false,failAt=''}={}){
  const db={workspace:{workspace_id:'platform',revision,state:clone(state)},requests:new Map(),audits:[],members:[],users:[{id:'U1',email:'user1@igisam.com',emailVerified:true},{id:'U2',email:'user2@igisam.com',emailVerified:true},{id:'PENDING',email:'pending@igisam.com',emailVerified:false}],updates:0,requestInserts:0,commits:0,rollbacks:0,open:0};
  const snapshot=()=>({workspace:clone(db.workspace),requests:new Map([...db.requests].map(([key,value])=>[key,clone(value)])),audits:clone(db.audits),members:clone(db.members),users:clone(db.users),updates:db.updates,requestInserts:db.requestInserts});
  const restore=value=>{db.workspace=value.workspace;db.requests=value.requests;db.audits=value.audits;db.members=value.members;db.users=value.users;db.updates=value.updates;db.requestInserts=value.requestInserts};
  const client={query:async(sql,params=[])=>{
    const text=String(sql).replace(/\s+/g,' ').trim();
    if(text.startsWith('SELECT workspace_id, revision, state FROM development_project_platform.platform_workspace'))return{rows:[clone(db.workspace)]};
    if(text.startsWith('SELECT body_hash, response FROM development_project_platform.workspace_requests')){const row=db.requests.get(params.slice(0,3).join('|'));return{rows:row?[clone(row)]:[]}}
    if(text.startsWith('UPDATE development_project_platform.platform_workspace')){if(failAt==='workspace')throw Error('synthetic workspace failure');if(casFail||db.workspace.revision!==params[3])return{rowCount:0,rows:[]};db.workspace={workspace_id:params[2],revision:params[1],state:JSON.parse(params[0])};db.updates++;return{rowCount:1,rows:[{revision:params[1]}]}}
    if(text.startsWith('INSERT INTO development_project_platform.workspace_audit')){if(failAt==='audit')throw Error('synthetic audit failure');db.audits.push({requestId:params[3],baseRevision:params[4],nextRevision:params[5],before:JSON.parse(params[9])});return{rowCount:1,rows:[]}}
    if(text.startsWith('INSERT INTO development_project_platform.workspace_requests')){if(failAt==='request')throw Error('synthetic request failure');db.requests.set(params.slice(0,3).join('|'),{body_hash:params[3],response:JSON.parse(params[5])});db.requestInserts++;return{rowCount:1,rows:[]}}
    if(text.startsWith('SELECT m.project_id,m.user_id,m.role,u.email FROM development_project_platform.project_members'))return{rows:db.members.filter(row=>row.project_id===params[0]).map(row=>({...row,email:db.users.find(user=>user.id===row.user_id)?.email}))};
    if(text.startsWith('SELECT id,email FROM development_project_platform.app_user'))return{rows:db.users.filter(row=>row.email.toLowerCase()===params[0]&&row.emailVerified).map(row=>({id:row.id,email:row.email}))};
    if(text.startsWith('SELECT role FROM development_project_platform.project_members'))return{rows:db.members.filter(row=>row.project_id===params[0]&&row.user_id===params[1]).map(row=>({role:row.role}))};
    if(text.startsWith('INSERT INTO development_project_platform.project_members')){const existing=db.members.find(row=>row.project_id===params[0]&&row.user_id===params[1]);if(existing)existing.role=params[2];else db.members.push({project_id:params[0],user_id:params[1],role:params[2]});return{rowCount:1,rows:[]}}
    if(text.startsWith('DELETE FROM development_project_platform.project_members')){db.members=db.members.filter(row=>!(row.project_id===params[0]&&row.user_id===params[1]));return{rowCount:1,rows:[]}}
    throw Error('Unexpected synthetic SQL: '+text.slice(0,90));
  }};
  const withTransaction=async(request,operation)=>{const before=snapshot();db.open++;try{const response=await operation(client,session[user]);db.commits++;return response}catch(error){restore(before);db.rollbacks++;throw error}finally{db.open--}};
  const accessPolicy=async(client,current)=>access[current.userId]||{isAdmin:false,canCreateProject:false,projects:{}};
  return{db,withTransaction,accessPolicy};
}
async function invoke(handler,request){try{return await handler(request)}catch(error){if(error instanceof WorkspaceError)return workspaceErrorResponse(error);throw error}}
const getRequest=()=>new Request(origin+'/api/workspace',{method:'GET'});
const putRequest=body=>new Request(origin+'/api/workspace',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
const envelope=(state,baseRevision=0,requestId='request_000000000001')=>({workspaceId:'platform',baseRevision,requestId,state});
const costLink=(recordId,{costTypeId='land_purchase',costTypeCode='IGIS-COST:land_purchase',masterVersion='company-cbs-v4',costTypeMappingStatus='confirmed',reason='합성 독립 기대값',method='selected'}={})=>({recordId,costTypeId,costTypeCode,masterVersion,costTypeMappingStatus,reason,method});
const costProject=(row,link,{historicalByStageId={}}={})=>({id:'P-COST',entityId:'E-COST',name:'합성 비용사업',cbs:[row],costCoding:{version:1,masterVersion:link.masterVersion,currentByRecordId:{[row.id]:link},historicalByStageId}});

const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}

await check('CLOUD-STORAGE-01 blank·실제상태 검증은중복ID·unsafe숫자·크기초과를거부',async()=>{
  assert.equal(validateWorkspaceState(createBlankWorkspaceState()).projects.length,0);assert.equal(validateWorkspaceState(baseState()).projects.length,2);
  const duplicate=baseState();duplicate.projects.push(clone(duplicate.projects[0]));assert.throws(()=>validateWorkspaceState(duplicate),WorkspaceError);
  const unsafe=baseState();unsafe.projects[0].unsafe=Number.MAX_SAFE_INTEGER+1;assert.throws(()=>validateWorkspaceState(unsafe),WorkspaceError);
  const huge=baseState();huge.projects[0].huge='x'.repeat(4_000_001);assert.throws(()=>validateWorkspaceState(huge),error=>error instanceof WorkspaceError&&error.status===413);
});

await check('CLOUD-STORAGE-02 두사용자의 프로젝트·법인·알림·감사조회가교차노출0',async()=>{
  const state=baseState(),u1=filterWorkspaceState(state,access.U1),u2=filterWorkspaceState(state,access.U2);assert.deepEqual(u1.projects.map(row=>row.id),['P1']);assert.deepEqual(u2.projects.map(row=>row.id),['P2']);assert.deepEqual(u1.entities.map(row=>row.id),['E1']);assert.deepEqual(u2.entities.map(row=>row.id),['E2']);assert.deepEqual(u1.auditEvents.map(row=>row.projectId),['P1']);assert.deepEqual(u2.notifications.map(row=>row.projectId),['P2']);assert.equal(u1.sourceLoad.status,'unavailable');assert.equal(u2.sourceLoad.status,'unavailable');
});

await check('CLOUD-STORAGE-03 viewer수정·타사업변경·일반사용자신규생성은차단하고editor자기사업만병합',async()=>{
  const current=baseState(),viewer=filterWorkspaceState(current,{projects:{P1:'viewer'}});viewer.projects[0].name='허용되지 않은 변경';assert.throws(()=>mergeWorkspaceState(current,viewer,{projects:{P1:'viewer'}},session.U1),error=>error.status===403);
  const editor=filterWorkspaceState(current,access.U1);editor.projects[0].name='합성 사업1 수정';const merged=mergeWorkspaceState(current,editor,access.U1,session.U1);assert.equal(merged.state.projects.find(row=>row.id==='P1').name,'합성 사업1 수정');assert.equal(merged.state.projects.find(row=>row.id==='P2').name,'합성 사업2');
  const injected=filterWorkspaceState(current,access.U1);injected.projects.push({...clone(current.projects[1]),name:'타사업 탈취'});assert.throws(()=>mergeWorkspaceState(current,injected,access.U1,session.U1),error=>error.status===403);
  const create=filterWorkspaceState(current,access.U1);create.projects.push(project('P3','E3','신규'));assert.throws(()=>mergeWorkspaceState(current,create,access.U1,session.U1),error=>error.status===403);
});

await check('CLOUD-STORAGE-04 admin만신규사업생성·전체조회가가능하고권한정규화는미지정0',async()=>{
  const current=baseState(),incoming=clone(current);incoming.projects.push(project('P3','E3','합성 신규'));const merged=mergeWorkspaceState(current,incoming,access.ADMIN,session.ADMIN);assert.equal(merged.state.projects.length,3);assert(merged.changedProjectIds.includes('P3'));
  assert.deepEqual(normalizeWorkspaceAccess({projects:{P1:'editor',P2:'owner',bad:'unknown'},canCreateProject:true}),{isAdmin:false,canCreateProject:false,projects:{P1:'editor'}});assert.equal(filterWorkspaceState(current,access.ADMIN).projects.length,2);
});

await check('CLOUD-STORAGE-05 GET은현재사용자범위·capability·role만반환',async()=>{
  const tx=fakeTransaction({user:'U1'}),handlers=createWorkspaceHandlers({withTransaction:tx.withTransaction,origin,accessPolicy:tx.accessPolicy}),response=await handlers.workspace(getRequest()),body=await response.json();assert.equal(response.status,200);assert.deepEqual(body.state.projects.map(row=>row.id),['P1']);assert.deepEqual(body.projectRoles,{P1:'editor'});assert.equal(body.capabilities.createProject,false);assert.equal(body.capabilities.manageAccess,false);assert.equal(body.user.id,'U1');assert.equal(tx.db.open,0);assert.equal(tx.db.commits,1);
});

await check('CLOUD-STORAGE-06 PUT성공은타사업보존·actor서버교정·audit/request원자저장·동일재시도멱등',async()=>{
  const tx=fakeTransaction({user:'U1'}),handlers=createWorkspaceHandlers({withTransaction:tx.withTransaction,origin,accessPolicy:tx.accessPolicy}),incoming=filterWorkspaceState(tx.db.workspace.state,access.U1);incoming.projects[0].name='합성 저장 수정';incoming.auditEvents.unshift({id:'A-NEW',projectId:'P1',action:'UPDATE',actor:'client-claim'});const body=envelope(incoming),first=await handlers.workspace(putRequest(body)),saved=await first.json();assert.equal(first.status,200);assert.equal(saved.revision,1);assert.equal(tx.db.workspace.state.projects.find(row=>row.id==='P2').name,'합성 사업2');assert.equal(tx.db.workspace.state.auditEvents[0].actor,'user1@igisam.com');assert.equal(tx.db.audits.length,1);assert.equal(tx.db.requestInserts,1);assert.equal(tx.db.open,0);
  assert.deepEqual(saved.state.projects.map(row=>row.id),['P1']);assert.equal(saved.state.projects[0].name,'합성 저장 수정');assert.equal(saved.state.auditEvents[0].actor,'user1@igisam.com');assert.equal(Object.prototype.hasOwnProperty.call(saved,'authorization'),false);
  let replay=await handlers.workspace(putRequest(body)),again=await replay.json();assert.equal(replay.status,200);assert.equal(again.revision,1);assert.deepEqual(again.state,saved.state);assert.equal(tx.db.updates,1);assert.equal(tx.db.audits.length,1);assert.equal(tx.db.requestInserts,1);
  const secondState=clone(saved.state);secondState.projects[0].name='합성 저장 수정2';secondState.auditEvents.unshift({id:'A-NEW2',projectId:'P1',action:'UPDATE',actor:'second-client-claim'});const secondBody=envelope(secondState,1,'request_000000000005'),second=await handlers.workspace(putRequest(secondBody)),secondSaved=await second.json();assert.equal(second.status,200);assert.equal(secondSaved.revision,2);assert.equal(secondSaved.state.projects[0].name,'합성 저장 수정2');assert.equal(secondSaved.state.auditEvents[0].actor,'user1@igisam.com');assert.equal(tx.db.workspace.state.projects.find(row=>row.id==='P2').name,'합성 사업2');assert.equal(tx.db.updates,2);assert.equal(tx.db.audits.length,2);assert.equal(tx.db.requestInserts,2);
  replay=await handlers.workspace(putRequest(secondBody));again=await replay.json();assert.equal(replay.status,200);assert.equal(again.revision,2);assert.deepEqual(again.state,secondSaved.state);assert.equal(tx.db.updates,2);assert.equal(tx.db.audits.length,2);assert.equal(tx.db.requestInserts,2);
});

await check('CLOUD-STORAGE-07 revision불일치·CAS실패는409후ROLLBACK·열린transaction0',async()=>{
  for(const setup of [{revision:1,casFail:false},{revision:0,casFail:true}]){const tx=fakeTransaction({...setup,user:'U1'}),handlers=createWorkspaceHandlers({withTransaction:tx.withTransaction,origin,accessPolicy:tx.accessPolicy}),incoming=filterWorkspaceState(tx.db.workspace.state,access.U1);incoming.projects[0].name='충돌 변경';const response=await invoke(handlers.workspace,putRequest(envelope(incoming,0,'request_000000000002'))),body=await response.json();assert.equal(response.status,409);assert.equal(body.error,'REVISION_CONFLICT');assert.equal(tx.db.workspace.revision,setup.revision);assert.equal(tx.db.rollbacks,1);assert.equal(tx.db.open,0);assert.equal(tx.db.audits.length,0)}
});

await check('CLOUD-STORAGE-08 audit·request저장실패는workspace수정까지전량ROLLBACK',async()=>{
  for(const failAt of ['audit','request']){const tx=fakeTransaction({user:'U1',failAt}),handlers=createWorkspaceHandlers({withTransaction:tx.withTransaction,origin,accessPolicy:tx.accessPolicy}),incoming=filterWorkspaceState(tx.db.workspace.state,access.U1);incoming.projects[0].name='실패 변경';await assert.rejects(()=>handlers.workspace(putRequest(envelope(incoming,0,'request_000000000003'))),/synthetic/);assert.equal(tx.db.workspace.revision,0);assert.equal(tx.db.workspace.state.projects[0].name,'합성 사업1');assert.equal(tx.db.audits.length,0);assert.equal(tx.db.requests.size,0);assert.equal(tx.db.rollbacks,1);assert.equal(tx.db.open,0)}
});

await check('CLOUD-STORAGE-09 같은requestId다른본문·권한회수후replay는차단',async()=>{
  const tx=fakeTransaction({user:'U1'}),handlers=createWorkspaceHandlers({withTransaction:tx.withTransaction,origin,accessPolicy:tx.accessPolicy}),incoming=filterWorkspaceState(tx.db.workspace.state,access.U1);incoming.projects[0].name='최초 변경';const id='request_000000000004';assert.equal((await handlers.workspace(putRequest(envelope(incoming,0,id)))).status,200);
  const changed=clone(incoming);changed.projects[0].name='다른 본문';let response=await invoke(handlers.workspace,putRequest(envelope(changed,1,id)));assert.equal(response.status,409);assert.equal((await response.json()).error,'REQUEST_ID_REUSED');
  access.U1.projects={};response=await invoke(handlers.workspace,putRequest(envelope(incoming,0,id)));assert.equal(response.status,403);assert.equal(tx.db.open,0);access.U1.projects={P1:'editor'};
});

await check('CLOUD-STORAGE-10 origin·인증·envelope검증실패는저장부수효과0',async()=>{
  const tx=fakeTransaction({user:'U1'}),handlers=createWorkspaceHandlers({withTransaction:tx.withTransaction,origin,accessPolicy:tx.accessPolicy}),incoming=filterWorkspaceState(tx.db.workspace.state,access.U1);
  let response=await invoke(handlers.workspace,new Request(origin+'/api/workspace',{method:'PUT',headers:{origin:'https://attacker.example.invalid','content-type':'application/json'},body:JSON.stringify(envelope(incoming))}));assert.equal(response.status,403);
  response=await invoke(handlers.workspace,putRequest({...envelope(incoming),extra:true}));assert.equal(response.status,400);assert.equal(tx.db.workspace.revision,0);assert.equal(tx.db.audits.length,0);assert.equal(tx.db.requests.size,0);assert.equal(tx.db.open,0);
});

await check('CLOUD-STORAGE-11 admin은확인가입자권한을부여·조회·회수하고workspace감사와함께저장',async()=>{
  const tx=fakeTransaction({user:'ADMIN'}),handlers=createWorkspaceHandlers({withTransaction:tx.withTransaction,origin,accessPolicy:tx.accessPolicy}),grantBody={workspaceId:'platform',baseRevision:0,requestId:'request_access_00000001',projectId:'P1',email:'user2@igisam.com',role:'viewer'};
  let response=await handlers.projectAccess(new Request(origin+'/api/project-access',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify(grantBody)})),body=await response.json();assert.equal(response.status,200);assert.equal(body.revision,1);assert.equal(body.role,'viewer');assert.deepEqual(tx.db.members,[{project_id:'P1',user_id:'U2',role:'viewer'}]);assert.equal(tx.db.workspace.state.auditEvents[0].action,'ACCESS_GRANT');assert.equal(tx.db.audits.length,1);
  response=await handlers.projectAccess(new Request(origin+'/api/project-access?projectId=P1',{method:'GET'}));body=await response.json();assert.equal(response.status,200);assert.deepEqual(body.members,[{userId:'U2',email:'user2@igisam.com',role:'viewer'}]);
  const revokeBody={workspaceId:'platform',baseRevision:1,requestId:'request_access_00000002',projectId:'P1',email:'user2@igisam.com'};response=await handlers.projectAccess(new Request(origin+'/api/project-access',{method:'DELETE',headers:{origin,'content-type':'application/json'},body:JSON.stringify(revokeBody)}));body=await response.json();assert.equal(response.status,200);assert.equal(body.revision,2);assert.equal(body.role,null);assert.equal(tx.db.members.length,0);assert.equal(tx.db.workspace.state.auditEvents[0].action,'ACCESS_REVOKE');assert.equal(tx.db.audits.length,2);assert.equal(tx.db.open,0);
});

await check('CLOUD-STORAGE-12 비관리자권한관리·미확인이메일부여는차단하고전량ROLLBACK',async()=>{
  const nonAdmin=fakeTransaction({user:'U1'}),nonAdminHandlers=createWorkspaceHandlers({withTransaction:nonAdmin.withTransaction,origin,accessPolicy:nonAdmin.accessPolicy});let response=await invoke(nonAdminHandlers.projectAccess,new Request(origin+'/api/project-access?projectId=P1',{method:'GET'}));assert.equal(response.status,403);assert.equal(nonAdmin.db.members.length,0);assert.equal(nonAdmin.db.open,0);
  const admin=fakeTransaction({user:'ADMIN'}),adminHandlers=createWorkspaceHandlers({withTransaction:admin.withTransaction,origin,accessPolicy:admin.accessPolicy}),body={workspaceId:'platform',baseRevision:0,requestId:'request_access_00000003',projectId:'P1',email:'pending@igisam.com',role:'viewer'};response=await invoke(adminHandlers.projectAccess,new Request(origin+'/api/project-access',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)}));assert.equal(response.status,404);assert.equal((await response.json()).error,'MEMBER_NOT_FOUND');assert.equal(admin.db.workspace.revision,0);assert.equal(admin.db.members.length,0);assert.equal(admin.db.audits.length,0);assert.equal(admin.db.requests.size,0);assert.equal(admin.db.rollbacks,1);assert.equal(admin.db.open,0);
});

await check('CLOUD-STORAGE-13 여러사업공유entity는일부사업editor만으로수정할수없음',async()=>{
  const current=baseState();current.projects[0].entityId='ESHARED';current.projects[1].entityId='ESHARED';current.entities=[{id:'ESHARED',name:'공유 법인'}];const incoming=filterWorkspaceState(current,access.U1);assert.equal(incoming.entities.length,1);incoming.entities[0].name='부분 권한 변경';assert.throws(()=>mergeWorkspaceState(current,incoming,access.U1,session.U1),error=>error instanceof WorkspaceError&&error.status===403);assert.equal(current.entities[0].name,'공유 법인');
});

await check('CLOUD-STORAGE-14 costStage·reportSnapshot본문은불변이고허용상태필드만변경',async()=>{
  const current=baseState(),p=current.projects[0];p.costStages=[{id:'CS1',amount:100,kind:'snapshot'}];p.reportSnapshots=[{id:'RS1',body:'원본문',status:'초안',submitted:false,receipt:''}];
  let incoming=filterWorkspaceState(current,access.U1);incoming.projects[0].costStages[0].amount=101;assert.throws(()=>mergeWorkspaceState(current,incoming,access.U1,session.U1),error=>error instanceof WorkspaceError&&error.code==='IMMUTABLE_HISTORY');
  incoming=filterWorkspaceState(current,access.U1);incoming.projects[0].reportSnapshots[0].body='덮어쓴 본문';assert.throws(()=>mergeWorkspaceState(current,incoming,access.U1,session.U1),error=>error instanceof WorkspaceError&&error.code==='IMMUTABLE_HISTORY');
  incoming=filterWorkspaceState(current,access.U1);incoming.projects[0].reportSnapshots[0].status='검토';const merged=mergeWorkspaceState(current,incoming,access.U1,session.U1);assert.equal(merged.state.projects[0].reportSnapshots[0].body,'원본문');assert.equal(merged.state.projects[0].reportSnapshots[0].status,'검토');
});

await check('CLOUD-STORAGE-15 editor는확정보고서를초안으로강등할수없음',async()=>{
  const current=baseState();current.projects[0].reportSnapshots=[{id:'RS-CONFIRMED',body:'확정본문',status:'확정',submitted:true,receipt:'R1'}];const incoming=filterWorkspaceState(current,access.U1);incoming.projects[0].reportSnapshots[0].status='초안';incoming.projects[0].reportSnapshots[0].submitted=false;assert.throws(()=>mergeWorkspaceState(current,incoming,access.U1,session.U1),error=>error instanceof WorkspaceError&&error.status===403);assert.equal(current.projects[0].reportSnapshots[0].status,'확정');
});

await check('CLOUD-STORAGE-16 ID없는격리자료여러건을빈키로합치지않고원문·개수보존',async()=>{
  const current=baseState();current.integrityIssues=[{projectId:'P1',kind:'첫째',raw:{value:1}},{projectId:'P1',kind:'둘째',raw:{value:2}}];current.storageQuarantine=[{projectId:'P1',kind:'격리A'},{projectId:'P1',kind:'격리B'}];const incoming=filterWorkspaceState(current,access.U1);incoming.integrityIssues.push({projectId:'P1',kind:'셋째',raw:{value:3}});const merged=mergeWorkspaceState(current,incoming,access.U1,session.U1);assert.deepEqual(merged.state.integrityIssues.map(row=>row.kind),['첫째','둘째','셋째']);assert.deepEqual(merged.state.storageQuarantine.map(row=>row.kind),['격리A','격리B']);
});

await check('CLOUD-STORAGE-17 현재업무 기본배열·중첩배열은ID를요구하고 원문참조배열은별도키를보존',async()=>{
  const cases=[
    state=>{state.projects[0].loanEvents=[{amount:1}]},
    state=>{state.projects[0].loanQuarterlyRecords=[{amount:1}]},
    state=>{state.projects[0].executionOpeningBalances=[{amount:1}]},
    state=>{state.projects[0].vatApplications=[{amount:1}]},
    state=>{state.projects[0].vatReconciliations=[{amount:1}]},
    state=>{state.projects[0].fundItemReviews=[{amount:1}]},
    state=>{state.projects[0].reserveTransfers=[{amount:1}]},
    state=>{state.projects[0].classificationEvents=[{value:'x'}]},
    state=>{state.projects[0].benchmarks=[{value:1}]},
    state=>{state.projects[0].issues=[{text:'x'}]},
    state=>{state.projects[0].inputDataReviews=[{text:'x'}]},
    state=>{state.projects[0].inputDataReviewHistory=[{text:'x'}]},
    state=>{state.projects[0].reportLandPlan=[{text:'x'}]},
    state=>{state.projects[0].reportBuildingPlans=[{text:'x'}]},
    state=>{state.projects[0].contracts=[{id:'C1',revisions:[{text:'x'}]}]},
    state=>{state.projects[0].contracts=[{id:'C1',certifications:[{text:'x'}]}]},
    state=>{state.projects[0].contracts=[{id:'C1',obligations:[{text:'x'}]}]},
    state=>{state.projects[0].contracts=[{id:'C1',payments:[{amount:1}]}]},
    state=>{state.projects[0].contracts=[{id:'C1',paymentReviews:[{text:'x'}]}]},
    state=>{state.projects[0].permits=[{id:'P1',actionItems:[{text:'x'}]}]},
    state=>{state.projects[0].permits=[{id:'P1',actionItems:[{id:'A1',plans:[{text:'x'}]}]}]},
    state=>{state.projects[0].reportParticipants={contractors:[{name:'x'}],trustees:[],guarantors:[]}},
    state=>{state.projects[0].reportProgress={preparation:[{text:'x'}],permit:[],start:[],construction:[]}},
    state=>{state.entities[0].professionalRecords=[{name:'x'}]},
    state=>{state.entities[0].notices=[{text:'x'}]},
    state=>{state.companies=[{id:'CO1',localNotes:[{text:'x'}]}]},
    state=>{state.marketSeries=[{id:'M1',points:[{value:1}]}]}
  ];
  for(const mutate of cases){const state=baseState();mutate(state);assert.throws(()=>validateWorkspaceState(state),error=>error instanceof WorkspaceError&&error.status===400)}
  const preserved=baseState();preserved.projects[0].areaHistory=[{versionId:'AREA-V1',value:10}];preserved.projects[0].reportSourceVersions=[{path:'합성/원문.pdf',asOf:'2026-10-15'}];preserved.integrityIssues=[{projectId:'P1',kind:'합성',values:{source:'원문'}}];assert.equal(validateWorkspaceState(preserved),preserved);
});

await check('CLOUD-STORAGE-18 정상v4 posting만빈행첫0·1원저장을허용하고프로젝트번호·group·unknown·review는차단',async()=>{
  const template={id:'COST-1',parentId:'ROOT',budgetState:'template',current:null,initial:null,reportedCurrentTotal:null};
  for(const amount of [0,1]){const old=costProject(clone(template),costLink('COST-1')),next=clone(old);next.cbs[0].current=amount;assert.equal(validateProjectCostChange(old,next),next)}
  const missingOld=costProject(clone(template),costLink('COST-1')),missing=clone(missingOld);missing.cbs[0].current=1;delete missing.costCoding.currentByRecordId['COST-1'];assert.throws(()=>validateProjectCostChange(missingOld,missing),error=>error instanceof WorkspaceError&&error.status===400);
  const localCodeOld=costProject(clone(template),costLink('COST-1')),localCode=clone(localCodeOld);localCode.cbs[0].current=1;delete localCode.costCoding.currentByRecordId['COST-1'];localCode.cbs[0].code='1000.01';assert.throws(()=>validateProjectCostChange(localCodeOld,localCode),error=>error instanceof WorkspaceError&&error.status===400);
  const groupLink=costLink('COST-1',{costTypeId:'grp_v4_land',costTypeCode:'IGIS-GROUP:land'}),groupOld=costProject(clone(template),groupLink),group=clone(groupOld);group.cbs[0].current=1;assert.throws(()=>validateProjectCostChange(groupOld,group),error=>error instanceof WorkspaceError&&error.status===400);
  const unknownOld=costProject(clone(template),costLink('COST-1')),unknown=clone(unknownOld);unknown.cbs[0].current=1;unknown.costCoding.currentByRecordId['COST-1'].costTypeCode='IGIS-COST:not-the-id';assert.throws(()=>validateProjectCostChange(unknownOld,unknown),error=>error instanceof WorkspaceError&&error.status===400);
  const reviewLink=costLink('COST-1',{costTypeId:'sys_review_unknown',costTypeCode:'SYS-REV-001',masterVersion:'company-cbs-v1',costTypeMappingStatus:'review',method:'legacy-review'}),reviewOld=costProject(clone(template),reviewLink),review=clone(reviewOld);review.cbs[0].current=1;assert.throws(()=>validateProjectCostChange(reviewOld,review),error=>error instanceof WorkspaceError&&error.status===400);
});

await check('CLOUD-STORAGE-19 기존review금액은원연결로만수정하고자동승격·과거coding변경은차단',async()=>{
  const link=costLink('REVIEW-1',{costTypeId:'sys_review_composite',costTypeCode:'SYS-REV-002',masterVersion:'company-cbs-v1',costTypeMappingStatus:'review',method:'legacy-review'}),row={id:'REVIEW-1',budgetState:'active',current:100},history={'STAGE-1':{'REVIEW-1':clone(link)}},old=costProject(row,link,{historicalByStageId:history}),next=clone(old);next.cbs[0].current=101;assert.equal(validateProjectCostChange(old,next),next);assert.deepEqual(next.costCoding.currentByRecordId['REVIEW-1'],link);
  const promoted=clone(next);promoted.costCoding.currentByRecordId['REVIEW-1']=costLink('REVIEW-1');assert.throws(()=>validateProjectCostChange(old,promoted),error=>error instanceof WorkspaceError&&error.code==='COST_REVIEW_PRESERVED');
  const promotedWithoutAmount=clone(old);promotedWithoutAmount.costCoding.currentByRecordId['REVIEW-1']=costLink('REVIEW-1');assert.throws(()=>validateProjectCostChange(old,promotedWithoutAmount),error=>error instanceof WorkspaceError&&error.code==='COST_REVIEW_PRESERVED');
  const reviewSwap=clone(old);reviewSwap.costCoding.currentByRecordId['REVIEW-1']=costLink('REVIEW-1',{costTypeId:'sys_review_unknown',costTypeCode:'SYS-REV-001',masterVersion:'company-cbs-v1',costTypeMappingStatus:'review',method:'legacy-review'});assert.throws(()=>validateProjectCostChange(old,reviewSwap),error=>error instanceof WorkspaceError&&error.code==='COST_REVIEW_PRESERVED');
  const removedLink=clone(old);delete removedLink.costCoding.currentByRecordId['REVIEW-1'];assert.throws(()=>validateProjectCostChange(old,removedLink),error=>error instanceof WorkspaceError&&error.code==='COST_REVIEW_PRESERVED');
  const removedRow=clone(old);removedRow.cbs=[];assert.throws(()=>validateProjectCostChange(old,removedRow),error=>error instanceof WorkspaceError&&error.code==='COST_REVIEW_PRESERVED');
  const confirmedReview=clone(old);confirmedReview.costCoding.currentByRecordId['REVIEW-1'].costTypeMappingStatus='confirmed';assert.throws(()=>validateProjectCostChange(old,confirmedReview),error=>error instanceof WorkspaceError&&error.code==='COST_REVIEW_PRESERVED');
  const softDeleted=clone(old);softDeleted.cbs[0].deletedAt='2026-10-15T00:00:00.000Z';assert.equal(validateProjectCostChange(old,softDeleted),softDeleted);
  const current=baseState(),stored=clone(old);stored.id='P1';stored.entityId='E1';stored.name='합성 사업1';current.projects[0]=stored;const incoming=filterWorkspaceState(current,access.U1);incoming.projects[0].costCoding.historicalByStageId['STAGE-1']['REVIEW-1'].reason='과거변조';assert.throws(()=>mergeWorkspaceState(current,incoming,access.U1,session.U1),error=>error instanceof WorkspaceError&&error.code==='IMMUTABLE_HISTORY');
});

await check('CLOUD-STORAGE-20 reportDraftOverrides편집은허용하되 snapshot본문·과거코딩은불변',async()=>{
  const current=baseState(),p=current.projects[0];p.reportDraftOverrides=[{id:'DRAFT-1',cells:{summary:'초안'}}];p.reportSnapshots=[{id:'SNAP-1',body:'동결본문',status:'작성본',submitted:false,receipt:''}];
  let incoming=filterWorkspaceState(current,access.U1);incoming.projects[0].reportDraftOverrides[0].cells.summary='수정 초안';let merged=mergeWorkspaceState(current,incoming,access.U1,session.U1);assert.equal(merged.state.projects[0].reportDraftOverrides[0].cells.summary,'수정 초안');assert.equal(merged.state.projects[0].reportSnapshots[0].body,'동결본문');
  incoming=filterWorkspaceState(current,access.U1);incoming.projects[0].reportSnapshots[0].body='본문변조';assert.throws(()=>mergeWorkspaceState(current,incoming,access.U1,session.U1),error=>error instanceof WorkspaceError&&error.code==='IMMUTABLE_HISTORY');
});

await check('CLOUD-STORAGE-21 격리원문내동일ID는현재원장으로승격·병합하지않고원문개수보존',async()=>{
  const current=baseState();current.storageQuarantine=[{projectId:'P1',kind:'원문격리',record:{cbs:[{id:'RAW-DUP',name:'원문1'},{id:'RAW-DUP',name:'원문2'}]}}];assert.equal(validateWorkspaceState(current),current);
  const incoming=filterWorkspaceState(current,access.U1),merged=mergeWorkspaceState(current,incoming,access.U1,session.U1),raw=merged.state.storageQuarantine[0].record.cbs;assert.equal(raw.length,2);assert.deepEqual(raw.map(row=>row.name),['원문1','원문2']);assert.equal(merged.state.projects[0].cbs?.length||0,0);
});

await check('CLOUD-STORAGE-22 명시확인총액전환·실제부모동일코드분할만예외로허용',async()=>{
  const reviewLink=costLink('REVIEW-2',{costTypeId:'sys_review_composite',costTypeCode:'SYS-REV-002',masterVersion:'company-cbs-v1',costTypeMappingStatus:'review',method:'legacy-review'}),old=costProject({id:'REVIEW-2',budgetState:'active',current:null},reviewLink),reported=clone(old);reported.cbs[0].currentAmountMode='reported-total';reported.cbs[0].reportedCurrentTotal=300;reported.costCoding.currentByRecordId['REVIEW-2']=costLink('REVIEW-2',{costTypeId:'sys_review_reported',costTypeCode:'SYS-REV-003',masterVersion:'company-cbs-v1',costTypeMappingStatus:'review',method:'reported-total'});assert.equal(validateProjectCostChange(old,reported),reported);
  const parentLink=costLink('PARENT-1'),parent=costProject({id:'PARENT-1',budgetState:'active',current:100},parentLink),split=clone(parent);split.cbs.push({id:'CHILD-1',parentId:'PARENT-1',budgetState:'active',current:40});split.costCoding.currentByRecordId['CHILD-1']=costLink('CHILD-1',{method:'split-inherit'});assert.equal(validateProjectCostChange(parent,split),split);
  const wrongParent=clone(split);wrongParent.cbs[1].parentId='MISSING-PARENT';assert.throws(()=>validateProjectCostChange(parent,wrongParent),error=>error instanceof WorkspaceError&&error.status===400);
});

const failed=checks.filter(row=>row.status==='failed');
console.log(JSON.stringify({suite:'cloud-storage',passed:checks.length-failed.length,failed:failed.length,total:checks.length,actualDatabaseUsed:false,actualAuthenticationUsed:false,checks}));
if(failed.length)process.exitCode=1;

