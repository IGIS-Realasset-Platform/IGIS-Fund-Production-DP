import assert from 'node:assert/strict';
import {createWorkspaceRuntime} from '../server/workspace-runtime.mjs';
import {createBlankWorkspaceState} from '../server/cloud-storage.mjs';

// PERF115-01/02: expected public outcomes come from the approved bootstrap contract.
// Real workspace handlers run; only the external DB and authentication boundary are synthetic.
// CENTER120-14 adds an independent owner-only specification capability. This
// synthetic non-owner keeps false even when it has the generic admin role;
// all existing identity, project filtering and atomic response checks remain.
const origin='https://perf115.example.invalid',email='synthetic.perf115@igisam.com',marker='SYNTHETIC-PRIVATE-MUST-NOT-REFLECT';
const environment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:'synthetic-perf115-secret-more-than-thirty-two-characters',DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop',DP_ALLOWED_EMAILS:JSON.stringify([email])});
const request=({cookie=true,requestOrigin=origin}={})=>new Request(origin+'/api/workspace',{headers:{...(requestOrigin?{origin:requestOrigin}:{}),...(cookie?{cookie:'__Secure-dpp.session_token=synthetic-cookie'}:{})}});
function fixture({sessionStatus=200,sessionBody={authenticated:true,userId:'USER-1',email},rawBody,sessionError=false,admin=false,roleRows=[],commitFailure=false,holdCommit=false}={}){
 const stored=createBlankWorkspaceState();stored.projects=[{id:'PROJECT-1',name:'Visible to assigned members'},{id:'PROJECT-2',name:marker}];stored.entities=[];
 const state={queries:[],workspaceReads:0,authCalls:0,connects:0,releases:0,cookieForwarded:null,commitEntered:false,releaseCommit:null};
 const client={query:async sql=>{const text=String(sql);state.queries.push(text);if(text==='COMMIT'){state.commitEntered=true;if(holdCommit)await new Promise(resolve=>{state.releaseCommit=resolve});if(commitFailure)throw Error(marker);return{rows:[]};}if(text.includes('platform_workspace')){state.workspaceReads++;return{rows:[{workspace_id:'platform',revision:'20',state:stored}]};}if(text.includes('platform_admins'))return{rows:admin?[{user_id:'USER-1'}]:[]};if(text.includes('project_members'))return{rows:roleRows};return{rows:[]};},release(){state.releases++;}};
 const run=createWorkspaceRuntime({environment,loadDrivers:async()=>({pool:{connect:async()=>{state.connects++;return client;}}}),createService:async()=>({handle:async(source,action)=>{state.authCalls++;assert.equal(action,'session');state.cookieForwarded=source.headers.has('cookie');if(sessionError)throw Error(marker);return new Response(rawBody===undefined?JSON.stringify(sessionBody):rawBody,{status:sessionStatus,headers:{'content-type':'application/json','set-cookie':'__Secure-dpp.session_token=synthetic-cookie; HttpOnly; Secure; SameSite=Strict'}});}})});
 return{state,stored,run};
}
const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name);}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message);}}
async function denied(app,{status,error,cookie=true}){
 const response=await app.run(request({cookie}),'workspace'),text=await response.text(),body=JSON.parse(text);
 assert.equal(response.status,status);assert.equal(body.error,error);assert.equal(body.state,undefined);assert.equal(body.user,undefined);assert.equal(response.headers.get('set-cookie'),null);assert(!text.includes(marker));assert.equal(app.state.workspaceReads,0);assert.equal(app.state.authCalls,1);assert(!app.state.queries.includes('COMMIT'));assert(app.state.queries.includes('ROLLBACK'));assert.equal(app.state.releases,1);return body;
}

await check('PERF115-SERVER-01 exact allowlist403는안전한enum403·원문/쿠키/자료0',async()=>{
 const app=fixture({sessionStatus:403,sessionBody:{error:'EMAIL_NOT_ALLOWED',message:marker,email:marker,token:marker,state:{secret:marker}}}),body=await denied(app,{status:403,error:'EMAIL_NOT_ALLOWED'});assert.deepEqual(Object.keys(body).sort(),['error','message']);assert.equal(typeof body.message,'string');assert.notEqual(body.message,marker);
});
await check('PERF115-SERVER-02 다른403·잘못된JSON·비정확enum은기존401유지',async()=>{
 for(const setup of [{sessionBody:{error:'ORIGIN_NOT_ALLOWED',message:marker}},{sessionBody:{error:'EMAIL_NOT_ALLOWED '+marker}},{sessionBody:{error:['EMAIL_NOT_ALLOWED']}},{sessionBody:{message:'EMAIL_NOT_ALLOWED',private:marker}},{rawBody:'not-json '+marker}])await denied(fixture({sessionStatus:403,...setup}),{status:401,error:'AUTH_REQUIRED'});
});
await check('PERF115-SERVER-03 status401의allowlist문자열은403으로승격하지않음',async()=>{
 await denied(fixture({sessionStatus:401,sessionBody:{error:'EMAIL_NOT_ALLOWED',message:marker}}),{status:401,error:'AUTH_REQUIRED'});
});
await check('PERF115-SERVER-04 무쿠키와만료세션은401·자료조회0',async()=>{
 for(const cookie of [false,true]){const app=fixture({sessionBody:{authenticated:false}});await denied(app,{status:401,error:'AUTH_REQUIRED',cookie});assert.equal(app.state.cookieForwarded,cookie);}
});
await check('PERF115-SERVER-05 인증의존실패는503·민감원인/자료/쿠키0',async()=>{
 for(const setup of [{sessionStatus:503,sessionBody:{error:'EMAIL_NOT_ALLOWED',message:marker}},{sessionStatus:500,rawBody:marker},{sessionError:true}])await denied(fixture(setup),{status:503,error:'AUTH_UNAVAILABLE'});
});
await check('PERF115-SERVER-06 유효세션권한0은200빈사업·identity/capabilities유지',async()=>{
 const app=fixture(),response=await app.run(request(),'workspace'),body=await response.json();assert.equal(response.status,200);assert.deepEqual(body.user,{id:'USER-1',email});assert.equal(body.workspaceId,'platform');assert.equal(body.revision,20);assert.deepEqual(body.state.projects,[]);assert.deepEqual(body.projectRoles,{});assert.deepEqual(body.capabilities,{createProject:false,manageAccess:false,viewPlatformSpec:false});assert(!JSON.stringify(body).includes(marker));assert.equal(app.state.connects,1);assert.equal(app.state.authCalls,1);assert.equal(app.state.workspaceReads,1);assert.equal(app.state.releases,1);assert(app.state.queries.includes('COMMIT'));
});
await check('PERF115-SERVER-07 editor는배정사업만·admin은기존전체조회',async()=>{
 const member=fixture({roleRows:[{project_id:'PROJECT-1',role:'editor'}]}),response=await member.run(request(),'workspace'),body=await response.json();assert.equal(response.status,200);assert.deepEqual(body.state.projects.map(p=>p.id),['PROJECT-1']);assert.deepEqual(body.projectRoles,{'PROJECT-1':'editor'});assert.deepEqual(body.capabilities,{createProject:false,manageAccess:false,viewPlatformSpec:false});assert(!JSON.stringify(body).includes(marker));
 const admin=fixture({admin:true}),adminResponse=await admin.run(request(),'workspace'),adminBody=await adminResponse.json();assert.equal(adminResponse.status,200);assert.deepEqual(adminBody.state.projects.map(p=>p.id),['PROJECT-1','PROJECT-2']);assert.deepEqual(adminBody.capabilities,{createProject:true,manageAccess:true,viewPlatformSpec:false});
});
await check('PERF115-SERVER-08 COMMIT실패는503·cookie/작업공간응답0',async()=>{
 const app=fixture({commitFailure:true}),response=await app.run(request(),'workspace'),text=await response.text();assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null);assert(!text.includes(marker));assert.equal(JSON.parse(text).state,undefined);assert(app.state.queries.includes('ROLLBACK'));assert.equal(app.state.releases,1);
});
await check('PERF115-SERVER-09 COMMIT전에는작업공간·cookie응답을확정하지않음',async()=>{
 const app=fixture({holdCommit:true});let settled=false;const pending=app.run(request(),'workspace').then(response=>{settled=true;return response;});for(let i=0;i<30&&!app.state.commitEntered;i++)await new Promise(resolve=>setImmediate(resolve));assert.equal(app.state.commitEntered,true);assert.equal(settled,false);app.state.releaseCommit();const response=await pending;assert.equal(response.status,200);assert.match(response.headers.get('set-cookie')||'',/HttpOnly/);assert.equal(app.state.releases,1);
});
await check('PERF115-SERVER-10 다른Origin은인증·연결·자료조회전403',async()=>{
 const app=fixture(),response=await app.run(request({requestOrigin:'https://other.example.invalid'}),'workspace'),body=await response.json();assert.equal(response.status,403);assert.equal(body.error,'ORIGIN_NOT_ALLOWED');assert.equal(app.state.connects,0);assert.equal(app.state.authCalls,0);assert.equal(app.state.workspaceReads,0);
});

const failed=checks.filter(item=>item.status==='failed');console.log(JSON.stringify({suite:'perf115-workspace-runtime',passed:checks.length-failed.length,failed:failed.length,total:checks.length,realDatabaseUsed:false,realEmailSent:false,realCredentialRead:false,checks}));if(failed.length)process.exitCode=1;
