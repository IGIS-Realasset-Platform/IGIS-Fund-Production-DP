/* Optional Notion snapshot addon. The core platform does not depend on it. */
((A,api)=>{
 'use strict';
 const clone=value=>JSON.parse(JSON.stringify(value)),endpoint=String(A.runtime?.notionSourceUrl||'/api/notion-source'),runtimeStatus={status:A.state.sourceLoad?.status==='ready'?'ready':'unavailable',endpoint,error:'',updatedAt:''};let generation=0;
 function result(){return clone(runtimeStatus)}
 function setStatus(status,error=''){Object.assign(runtimeStatus,{status,error:String(error||''),updatedAt:new Date().toISOString()});return result()}
 function applyPayload(payload,request={token:generation,workspaceId:A.cloudPersistence?.workspaceId?.()||''}){
  if(!A.realMode)return setStatus('unavailable');
  if(A.cloudMode&&(!A.cloudPersistence?.booted?.()||A.cloudPersistence?.capabilities?.().manageAccess!==true))return setStatus('unavailable');
  if(A.cloudMode&&(request.token!==generation||request.workspaceId!==A.cloudPersistence?.workspaceId?.()))return setStatus('unavailable');
  if(!payload||payload.available===false)return setStatus('unavailable');
  try{
   if(!api)throw Error('Notion 선택자료 변환 모듈을 불러오지 못했습니다.');
   setStatus('loading');
   const source=payload.source??payload,sourceIds=new Set((source?.projects||[]).map(project=>String(project?.pageId||'')));
   for(const project of A.state.projects||[])if(sourceIds.has(project.id)&&project.sourceFacts?.origin!=='notion')throw Error('수기 사업과 Notion 선택자료의 프로젝트 ID가 충돌합니다.');
   const synced=api.sync(A.state,source),before={projects:A.state.projects.length,notion:(A.state.projects||[]).filter(project=>project.sourceFacts?.origin==='notion').length,sourceStatus:A.state.sourceLoad?.status||'unavailable'},currentId=A.ui.projectId;
   A.transaction(()=>{A.state.projects=synced.state.projects;A.state.entities=synced.state.entities;A.state.sourceLoad=synced.state.sourceLoad;for(const initialize of A.initializers)initialize(A.state);const after={projects:A.state.projects.length,notion:A.state.projects.filter(project=>project.sourceFacts?.origin==='notion').length,sourceStatus:A.state.sourceLoad.status,conflicts:synced.conflicts.length};A.audit('SYNC','notionSource',source.schemaVersion,before,after,'',{projectId:currentId||A.state.projects[0]?.id||''});});
   const finish=()=>{if(A.cloudMode&&(request.token!==generation||request.workspaceId!==A.cloudPersistence?.workspaceId?.()||!A.cloudPersistence?.booted?.()))return setStatus('unavailable');if(currentId&&A.state.projects.some(project=>project.id===currentId))A.ui.projectId=currentId;else if(!A.ui.projectId&&A.state.projects[0])A.ui.projectId=A.state.projects[0].id;A.persistUI?.();const dirty=A.pendingDraftScope?.()||A.formEditor?.snapshot?.()?.dirty||A.inlineEditor?.snapshot?.()?.dirty;if(!dirty)A.render?.();return setStatus(A.state.sourceLoad.status)},persistence=A.cloudMode&&A.cloudPersistence?.pending?.()?A.cloudPersistence.wait():null;return persistence?persistence.then(finish).catch(error=>setStatus('error',error?.message||error)):finish();
  }catch(error){return setStatus('error',error?.message||error)}
 }
 async function refresh(url=endpoint){
  if(!A.realMode||typeof fetch!=='function')return setStatus('unavailable');
  const request={token:++generation,workspaceId:A.cloudPersistence?.workspaceId?.()||''};setStatus('loading');
  try{const response=await fetch(url,{method:'GET',credentials:'same-origin',headers:{Accept:'application/json'}});if(!response.ok)throw Error('Notion 선택자료를 불러오지 못했습니다.');const payload=await response.json();if(A.cloudMode&&(request.token!==generation||request.workspaceId!==A.cloudPersistence?.workspaceId?.()||!A.cloudPersistence?.booted?.()))return setStatus('unavailable');return applyPayload(payload,request)}catch(error){if(A.cloudMode&&request.token!==generation)return setStatus('unavailable');return setStatus('error',error?.message||error)}
 }
 function start(){if(A.cloudMode&&(!A.cloudPersistence?.booted?.()||A.cloudPersistence?.capabilities?.().manageAccess!==true))return Promise.resolve(setStatus('unavailable'));return refresh(endpoint)}
 A.onCloudReset?.(()=>{generation++;setStatus('unavailable')});
 A.notionProjects=api;A.notionAddon=Object.freeze({endpoint,status:result,applyPayload,refresh,start});
})(App,typeof NotionProjects==='undefined'?null:NotionProjects);
