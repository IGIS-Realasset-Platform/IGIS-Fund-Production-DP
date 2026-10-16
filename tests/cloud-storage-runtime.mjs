import assert from 'node:assert/strict';
import {WorkspaceError} from '../server/cloud-storage.mjs';
import {createWorkspaceRuntime} from '../server/workspace-runtime.mjs';

const origin='https://platform.example.invalid';
const environment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:'synthetic-secret-more-than-thirty-two-characters',DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic-password@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'qa.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop'});
const request=(method='GET')=>new Request(origin+'/api/workspace',{method,headers:{origin,cookie:'dpp.session_token=synthetic-cookie'}});

function fixture({sessionStatus=200,authenticated=true,operationStatus=200,operationError=null,connectError=null,driverError=null}={}){
  const state={queries:[],released:0,connects:0,serviceCalls:0,handlerCalls:0,loadCalls:0};
  const client={query:async sql=>{state.queries.push(String(sql));return{rows:[]}},release:()=>{state.released++}};
  const loadDrivers=async()=>{state.loadCalls++;if(driverError)throw driverError;return{pool:{connect:async()=>{state.connects++;if(connectError)throw connectError;return client}}}};
  const createService=async()=>({handle:async()=>{state.serviceCalls++;return Response.json(authenticated?{authenticated:true,userId:'U1',email:'user1@igisam.com'}:{authenticated:false},{status:sessionStatus,headers:{'set-cookie':'dpp.session_token=refreshed; Path=/; HttpOnly; Secure; SameSite=Strict'}})}});
  const createHandlers=({withTransaction})=>{const handler=source=>{state.handlerCalls++;return withTransaction(source,async(client,identity)=>{assert.deepEqual(identity,{userId:'U1',email:'user1@igisam.com'});if(operationError)throw operationError;return Response.json({ok:operationStatus<400},{status:operationStatus})})};return{workspace:handler,projectAccess:handler}};
  return{state,run:createWorkspaceRuntime({environment,loadDrivers,createService,createHandlers})};
}

const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}

await check('CLOUD-STORAGE-RUNTIME-01 성공은한연결BEGIN·격리search_path·timeout·COMMIT후cookie전달·release1',async()=>{
  const app=fixture(),response=await app.run(request(),'workspace');assert.equal(response.status,200);assert.equal(app.state.connects,1);assert.equal(app.state.released,1);assert.equal(app.state.handlerCalls,1);assert.equal(app.state.serviceCalls,1);assert.deepEqual(app.state.queries,['BEGIN','SET LOCAL search_path = pg_catalog, development_project_platform',"SET LOCAL statement_timeout = '10s'",'COMMIT']);assert.match(response.headers.get('set-cookie')||'',/HttpOnly/);
});

await check('CLOUD-STORAGE-RUNTIME-02 WorkspaceError409는COMMIT없이ROLLBACK·409safe응답·release',async()=>{
  const app=fixture({operationError:new WorkspaceError(409,'REVISION_CONFLICT','합성 충돌')}),response=await app.run(request('PUT'),'workspace'),body=await response.json();assert.equal(response.status,409);assert.equal(body.error,'REVISION_CONFLICT');assert(app.state.queries.includes('ROLLBACK'));assert(!app.state.queries.includes('COMMIT'));assert.equal(app.state.released,1);
});

await check('CLOUD-STORAGE-RUNTIME-03 handler4xx응답은ROLLBACK하고그응답을유지',async()=>{
  const app=fixture({operationStatus:400}),response=await app.run(request('PUT'),'workspace');assert.equal(response.status,400);assert.equal(app.state.queries.filter(row=>row==='ROLLBACK').length,1);assert(!app.state.queries.includes('COMMIT'));assert.equal(app.state.released,1);
});

await check('CLOUD-STORAGE-RUNTIME-04 미인증session은401·ROLLBACK·workspaceoperation0',async()=>{
  const app=fixture({sessionStatus:200,authenticated:false}),response=await app.run(request(),'workspace'),body=await response.json();assert.equal(response.status,401);assert.equal(body.error,'AUTH_REQUIRED');assert.equal(body.state,undefined);assert.equal(response.headers.get('set-cookie'),null);assert.equal(app.state.handlerCalls,1);assert.equal(app.state.serviceCalls,1);assert(app.state.queries.includes('ROLLBACK'));assert(!app.state.queries.includes('COMMIT'));assert.equal(app.state.released,1);
});

await check('CLOUD-STORAGE-RUNTIME-05 driver·connect·generic operation오류는raw원인없는503과정리가능범위',async()=>{
  for(const setup of [{driverError:new Error('synthetic-driver-secret')},{connectError:new Error('synthetic-connect-secret')},{operationError:new Error('synthetic-operation-secret')}]){const app=fixture(setup),response=await app.run(request(),'workspace'),text=await response.text();assert.equal(response.status,503);assert(!text.includes('synthetic-'));assert(!app.state.queries.includes('COMMIT'));if(app.state.connects&&app.state.released===0&&setup.operationError)assert.fail('connected operation failures must release');if(setup.operationError)assert(app.state.queries.includes('ROLLBACK'));}
});

await check('CLOUD-STORAGE-RUNTIME-06 알수없는action은DB연결없이404',async()=>{
  const app=fixture(),response=await app.run(request(),'unknown');assert.equal(response.status,404);assert.equal(app.state.loadCalls,0);assert.equal(app.state.connects,0);assert.equal(app.state.released,0);
});

await check('CLOUD-STORAGE-RUNTIME-07 cookie없는request도session서비스가판정하며client주장을직접신뢰하지않음',async()=>{
  const app=fixture({authenticated:false}),response=await app.run(new Request(origin+'/api/workspace'),'workspace'),body=await response.json();assert.equal(response.status,401);assert.equal(body.error,'AUTH_REQUIRED');assert.equal(body.state,undefined);assert.equal(response.headers.get('set-cookie'),null);assert.equal(app.state.serviceCalls,1);assert.equal(app.state.handlerCalls,1);assert.equal(app.state.released,1);
});

const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'cloud-storage-runtime',passed:checks.length-failed.length,failed:failed.length,total:checks.length,actualDatabaseUsed:false,actualAuthenticationUsed:false,checks}));if(failed.length)process.exitCode=1;

