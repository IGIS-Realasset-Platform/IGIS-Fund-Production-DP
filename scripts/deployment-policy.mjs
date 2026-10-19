export const PREVIEW_ORIGIN='https://development-project-platform-preview-git-preview-b5dda7-igisra.vercel.app';
export const PRODUCTION_ORIGIN='https://igis-development-project-platform.vercel.app';
export const APPROVED_BRANCH='preview/core-v0.11.0';
export function resolveCloudOrigin(value,{localQa=false}={}){
 if(localQa){if(value)throw Error('LOCAL_QA_ORIGIN_CONFLICT');return '';}
 const origin=value||PREVIEW_ORIGIN;
 if(![PREVIEW_ORIGIN,PRODUCTION_ORIGIN].includes(origin))throw Error('CLOUD_ORIGIN_NOT_APPROVED');
 return origin;
}
export function resolveBuildPolicy(env,approval){
 if(env.VERCEL!=='1'||!['preview','production'].includes(env.VERCEL_ENV)||env.VERCEL_GIT_COMMIT_REF!==APPROVED_BRANCH)throw Error('DEPLOYMENT_TARGET_NOT_APPROVED');
 const origin=env.VERCEL_ENV==='production'?PRODUCTION_ORIGIN:PREVIEW_ORIGIN;
 if(approval?.origin!==origin||env.DP_AUTH_ORIGIN!==origin)throw Error('DEPLOYMENT_ORIGIN_MISMATCH');
 const expected=approval?.htmlSha256;
 if(!/^[0-9a-f]{64}$/i.test(expected||''))throw Error('ARTIFACT_APPROVAL_MISSING');
 if(env.DP_EXPECTED_HTML_SHA256&&env.DP_EXPECTED_HTML_SHA256.toLowerCase()!==expected.toLowerCase())throw Error('ARTIFACT_CONFIGURATION_MISMATCH');
 return {origin,expected,version:approval.version};
}
