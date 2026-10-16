(function(root){
 'use strict';
 const sourceHtmlSha256='0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a';
 const kind='user-approved-html-fixture',batchId='20261016-abc';
 const sources=Object.freeze({'TEST-20261016-A':'YD427','TEST-20261016-B':'YD816','TEST-20261016-C':'IOTA'});
 // 초기 수입은 최종 추출본의 전체 프로젝트 지문까지 일치해야 합니다. 이후 이름/금액 수정은 일반 저장 규칙을 따릅니다.
 const initialDigests=Object.freeze({
  'TEST-20261016-A':'e051d06cb0eab11716b8e1aa981f83331910c333411435790f06ab5db2acd366',
  'TEST-20261016-B':'fe97deeb2766f4a4b3abe6c330d524803004fa983704381302d5c9539bd8d1f9',
  'TEST-20261016-C':'d79573abc9d9072f244f907fe39f94a64ebe56f8647141411a9f3ac43a234fe0'
 });
 const own=(value,key)=>value!==null&&typeof value==='object'&&Object.prototype.hasOwnProperty.call(value,key);
 const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
 function isClaimedProject(project){return object(project)&&(own(project,'testData')||typeof project.id==='string'&&project.id.startsWith('TEST-20261016-'));}
 function isApprovedProject(project){
  if(!object(project)||!own(sources,project.id)||!own(project,'testData')||!object(project.testData))return false;
  const marker=project.testData;
  return Object.keys(marker).length===4&&['kind','batchId','sourceProjectId','sourceHtmlSha256'].every(key=>own(marker,key))&&marker.kind===kind&&marker.batchId===batchId&&marker.sourceProjectId===sources[project.id]&&marker.sourceHtmlSha256===sourceHtmlSha256;
 }
 root.DppHtmlFixturePolicy=Object.freeze({kind,batchId,sourceHtmlSha256,projectIds:Object.freeze(Object.keys(sources)),isClaimedProject,isApprovedProject,initialProjectSha256:projectId=>own(initialDigests,projectId)?initialDigests[projectId]:''});
})(globalThis);
