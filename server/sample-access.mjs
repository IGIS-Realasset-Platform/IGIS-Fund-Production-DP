import '../src/html-test-fixture-policy.js';
import {isSampleViewerEmail} from './auth-policy.mjs';

export const approvedSampleIds=globalThis.DppHtmlFixturePolicy.projectIds;
export const isApprovedSampleProject=project=>globalThis.DppHtmlFixturePolicy.isApprovedProject(project);
export async function readApprovedSampleProjects(client){
 const found=await client.query(`SELECT jsonb_build_object('id',p->'id','testData',p->'testData') AS project FROM development_project_platform.platform_workspace w CROSS JOIN LATERAL jsonb_array_elements(w.state->'projects') p WHERE w.workspace_id='platform' AND p->>'id'=ANY($1::text[]) AND COALESCE(p->>'deletedAt','')='' AND COALESCE(p->>'active','true')<>'false' FOR SHARE OF w`,[approvedSampleIds]),projects=found.rows.map(r=>r.project);
 if(projects.length!==3||new Set(projects.map(p=>p?.id)).size!==3||!projects.every(isApprovedSampleProject))throw Error('APPROVED_SAMPLES_UNAVAILABLE');return projects;
}
// A/B/C라는 이름이나 isExample만으로 실제 사업에 권한을 부여하지 않습니다.
export async function grantApprovedSamples(client,{userId,email,allowedEmails,sampleViewerEmails=[]}){
 if(!userId||!Array.isArray(allowedEmails)||!allowedEmails.includes(String(email||'').toLowerCase()))return;
 if(isSampleViewerEmail(email,sampleViewerEmails)){
  await readApprovedSampleProjects(client);
  await client.query(`INSERT INTO development_project_platform.project_members(project_id,user_id,role,updated_at)
 SELECT p->>'id',u.id,'viewer',now()
 FROM development_project_platform.platform_workspace w
 CROSS JOIN LATERAL jsonb_array_elements(w.state->'projects') p
 JOIN development_project_platform.app_user u ON u.id=$1 AND u.email=$2 AND u."emailVerified"=true
 WHERE w.workspace_id='platform' AND p->>'id'=ANY($3::text[])
 AND COALESCE(p->>'deletedAt','')='' AND COALESCE(p->>'active','true')<>'false'
 AND p->'testData'=jsonb_build_object('kind','user-approved-html-fixture','batchId','20261016-abc','sourceProjectId',CASE p->>'id' WHEN 'TEST-20261016-A' THEN 'YD427' WHEN 'TEST-20261016-B' THEN 'YD816' WHEN 'TEST-20261016-C' THEN 'IOTA' END,'sourceHtmlSha256','0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a')
 ON CONFLICT(project_id,user_id) DO UPDATE SET role='viewer',updated_at=now()
 WHERE development_project_platform.project_members.role<>'viewer'`,[userId,email,approvedSampleIds]);return;
 }
 const found=await client.query(`SELECT jsonb_build_object('id',p->'id','testData',p->'testData') AS project FROM development_project_platform.platform_workspace w CROSS JOIN LATERAL jsonb_array_elements(w.state->'projects') p WHERE w.workspace_id='platform' AND p->>'id'=ANY($1::text[]) FOR SHARE OF w`,[approvedSampleIds]),projects=found.rows.map(r=>r.project);
 if(projects.length!==3||new Set(projects.map(p=>p?.id)).size!==3||!projects.every(p=>globalThis.DppHtmlFixturePolicy.isApprovedProject(p)))throw Error('APPROVED_SAMPLES_UNAVAILABLE');
 await client.query(`INSERT INTO development_project_platform.project_members(project_id,user_id,role,updated_at)
 SELECT p->>'id',u.id,'editor',now()
 FROM development_project_platform.platform_workspace w
 CROSS JOIN LATERAL jsonb_array_elements(w.state->'projects') p
 JOIN development_project_platform.app_user u ON u.id=$1 AND u.email=$2 AND u."emailVerified"=true
 WHERE w.workspace_id='platform' AND p->>'id'=ANY($3::text[])
 AND p->'testData'=jsonb_build_object('kind','user-approved-html-fixture','batchId','20261016-abc','sourceProjectId',CASE p->>'id' WHEN 'TEST-20261016-A' THEN 'YD427' WHEN 'TEST-20261016-B' THEN 'YD816' WHEN 'TEST-20261016-C' THEN 'IOTA' END,'sourceHtmlSha256','0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a')
 ON CONFLICT(project_id,user_id) DO UPDATE SET role='editor',updated_at=now()
 WHERE development_project_platform.project_members.role='viewer'`,[userId,email,approvedSampleIds]);
}
