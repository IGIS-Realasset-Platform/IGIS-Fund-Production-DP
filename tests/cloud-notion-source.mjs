import assert from 'node:assert/strict';
import {createWorkspaceRuntime} from '../server/workspace-runtime.mjs';
import {readOptionalSource} from '../server/notion-source.mjs';

const origin='https://platform.example.invalid';
const validSource={schemaVersion:'notion-development-projects-v1',source:{databaseId:'synthetic-db',dataSourceUrl:'https://notion.example.invalid/data',viewUrl:'https://notion.example.invalid/view',referenceUrl:'https://notion.example.invalid/reference',queriedAt:'2026-10-15T00:00:00Z',expectedCount:1,hasMore:false,privateCredential:'must-not-appear'},nonPersonValues:['상태A','상태B','기관A','기관B','메모A','메모B','공석','-'],projects:[{pageId:'00000000-0000-4000-8000-000000000001',sourceUrl:'https://notion.example.invalid/project',name:'합성 사업',vehicle:'합성 비히클',classification:'',sourceStatus:'진행 중',manager:'합성 담당',teamLead:'합성 팀장',professionals:[{slot:1,raw:'합성 이름'}],privateField:'must-not-appear'}]};
const environment=()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:'synthetic-secret-more-than-thirty-two-characters',DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic-password@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'qa.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop',DP_ALLOWED_EMAILS:JSON.stringify(['user1@igisam.com'])});

function runtime({authenticated=true,admin=false,raw=null,missingConfig=false}={}){
  const state={queries:[],released:0,connects:0,optionalCalls:0};const client={query:async(sql,params)=>{state.queries.push(String(sql));if(String(sql).startsWith('SELECT 1 FROM development_project_platform.platform_admins'))return{rows:admin?[{ok:1}]:[]};return{rows:[]}},release:()=>{state.released++}};
  const loadDrivers=async()=>({pool:{connect:async()=>{state.connects++;return client}}}),createService=async()=>({handle:async()=>Response.json(authenticated?{authenticated:true,userId:'U1',email:'user1@igisam.com'}:{authenticated:false},{status:200})}),optionalSource=request=>{state.optionalCalls++;return readOptionalSource(request,raw)};
  const env=missingConfig?()=>({}):environment;return{state,run:createWorkspaceRuntime({environment:env,loadDrivers,createService,optionalSource})};
}
const request=(requestOrigin=null)=>new Request(origin+'/api/notion-source',{method:'GET',headers:requestOrigin?{origin:requestOrigin}:{}});
const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}

await check('CLOUD-NOTION-01 pure helper는미설정이면available:false이고메일·DB상태를요구하지않음',async()=>{
  const response=readOptionalSource(new Request(origin,{method:'GET'}),null);assert.equal(response.status,200);assert.deepEqual(await response.json(),{available:false});assert.equal(response.headers.get('cache-control'),'private, no-store');
});

await check('CLOUD-NOTION-02 유효snapshot은허용필드만반환하고private추가필드제거',async()=>{
  const response=readOptionalSource(new Request(origin,{method:'GET'}),JSON.stringify(validSource)),body=await response.json();assert.equal(response.status,200);assert.equal(body.available,true);assert.equal(body.source.projects.length,1);assert.equal(body.source.projects[0].name,'합성 사업');assert(!JSON.stringify(body).includes('must-not-appear'));
});

await check('CLOUD-NOTION-03 partial·count불일치·과대·잘못된JSON은raw원인없이422',async()=>{
  const invalid=[JSON.stringify({...validSource,source:{...validSource.source,hasMore:true}}),JSON.stringify({...validSource,source:{...validSource.source,expectedCount:2}}),'{broken',JSON.stringify({...validSource,padding:'x'.repeat(1_000_001)})];
  for(const raw of invalid){const response=readOptionalSource(new Request(origin,{method:'GET'}),raw),text=await response.text();assert.equal(response.status,422);assert(!text.includes('broken'));assert(!text.includes('must-not-appear'));assert.equal(JSON.parse(text).error,'OPTIONAL_SOURCE_INVALID')}
});

await check('CLOUD-NOTION-04 helper의GET외메서드는405이고변환실행없음',async()=>{
  const response=readOptionalSource(new Request(origin,{method:'POST'}),JSON.stringify(validSource));assert.equal(response.status,405);assert.equal((await response.json()).available,false);
});

await check('CLOUD-NOTION-05 미인증session은401·optional호출0·ROLLBACK',async()=>{
  const app=runtime({authenticated:false,admin:true,raw:JSON.stringify(validSource)}),response=await app.run(request(),'notionSource'),body=await response.json();assert.equal(response.status,401);assert.equal(body.error,'AUTH_REQUIRED');assert.equal(body.source,undefined);assert.equal(body.available,undefined);assert.equal(response.headers.get('set-cookie'),null);assert.equal(app.state.optionalCalls,0);assert(app.state.queries.includes('ROLLBACK'));assert(!app.state.queries.includes('COMMIT'));assert.equal(app.state.released,1);
});

await check('CLOUD-NOTION-06 일반직원은403·optional호출0·ROLLBACK',async()=>{
  const app=runtime({authenticated:true,admin:false,raw:JSON.stringify(validSource)}),response=await app.run(request(),'notionSource');assert.equal(response.status,403);assert.equal(app.state.optionalCalls,0);assert(app.state.queries.includes('ROLLBACK'));assert(!app.state.queries.includes('COMMIT'));assert.equal(app.state.released,1);
});

await check('CLOUD-NOTION-07 관리자+미설정snapshot은available:false·COMMIT',async()=>{
  const app=runtime({authenticated:true,admin:true,raw:null}),response=await app.run(request(),'notionSource'),body=await response.json();assert.equal(response.status,200);assert.deepEqual(body,{available:false});assert.equal(app.state.optionalCalls,1);assert(app.state.queries.includes('COMMIT'));assert.equal(app.state.released,1);
});

await check('CLOUD-NOTION-08 관리자+유효snapshot만sanitizedavailable true',async()=>{
  const app=runtime({authenticated:true,admin:true,raw:JSON.stringify(validSource)}),response=await app.run(request(origin),'notionSource'),body=await response.json();assert.equal(response.status,200);assert.equal(body.available,true);assert.equal(body.source.projects.length,1);assert(!JSON.stringify(body).includes('must-not-appear'));assert.equal(app.state.optionalCalls,1);assert(app.state.queries.includes('COMMIT'));
});

await check('CLOUD-NOTION-09 교차origin은DB연결전403',async()=>{
  const app=runtime({authenticated:true,admin:true,raw:JSON.stringify(validSource)}),response=await app.run(request('https://attacker.example.invalid'),'notionSource');assert.equal(response.status,403);assert.equal(app.state.connects,0);assert.equal(app.state.optionalCalls,0);
});

await check('CLOUD-NOTION-10 서버인증설정자체없음은cookie없는generic503',async()=>{
  const app=runtime({missingConfig:true,admin:true,raw:JSON.stringify(validSource)}),response=await app.run(request(),'notionSource'),body=await response.json();assert.equal(response.status,503);assert.equal(body.error,'AUTH_UNAVAILABLE');assert.equal(response.headers.get('set-cookie'),null);assert.equal(app.state.connects,0);assert.equal(app.state.optionalCalls,0);
});

const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'cloud-notion-source',passed:checks.length-failed.length,failed:failed.length,total:checks.length,realNotionApiUsed:false,realDatabaseUsed:false,automaticSyncVerified:false,checks}));if(failed.length)process.exitCode=1;

