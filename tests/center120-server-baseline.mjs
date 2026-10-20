import assert from 'node:assert/strict';
import {createAuthRuntime} from '../server/email-auth-runtime.mjs';
import {createBlankWorkspaceState,mergeWorkspaceState} from '../server/cloud-storage.mjs';

const origin='https://platform.example.invalid',queries=[];
const projects=['A','B','C'].map((letter,i)=>({project:{id:'TEST-20261016-'+letter,testData:{kind:'user-approved-html-fixture',batchId:'20261016-abc',sourceProjectId:['YD427','YD816','IOTA'][i],sourceHtmlSha256:'0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a'}}}));
const client={query:async(sql,args)=>{queries.push({sql,args});return {rows:sql.startsWith('SELECT jsonb_build_object')?projects:[],rowCount:1};},release(){}};
class Dialect{constructor(){}}
const run=createAuthRuntime({environment:()=>({DP_AUTH_ORIGIN:origin,DP_AUTH_SECRET:'isolated-test-secret-more-than-32-characters',DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic-password@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_ALLOWED_EMAILS:'["test.member@igisam.com"]',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'test.sender@gmail.com',DP_GMAIL_APP_PASSWORD:'abcd efgh ijkl mnop'}),loadDrivers:async()=>({pool:{connect:async()=>client},PostgresDialect:Dialect}),createService:()=>({handle:async()=>Response.json({authenticated:true,userId:'verified-user',email:'test.member@igisam.com'})}),senderFactory:async()=>async()=>{}});
const checks=[];
try{assert.equal((await run(new Request(origin+'/api/auth-verify',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify({email:'test.member@igisam.com'})}),'verify')).status,200);assert(queries.some(row=>/project_members/.test(row.sql)),'verified signup must assign approved sample access inside transaction');checks.push({id:'CENTER120-01',passed:true});}catch(error){checks.push({id:'CENTER120-01',passed:false,error:error.message});}
const prior=createBlankWorkspaceState();prior.projects=[{id:'P1',name:'Protected'}];prior.notifications=[{id:'N1',title:'Task',target:{projectId:'P1'},dismissed:false}];
try{const next=structuredClone(prior);next.notifications[0].dismissed=true;assert.throws(()=>mergeWorkspaceState(prior,next,{projects:{P1:'viewer'}},{email:'test.member@igisam.com'}),error=>error.code==='PERSONAL_NOTIFICATION_REQUIRED','legacy whole-workspace writes must not modify shared dismissal');checks.push({id:'CENTER120-04',passed:true});}catch(error){checks.push({id:'CENTER120-04',passed:false,error:error.message});}
console.log(JSON.stringify({suite:'center120-server-baseline',checks}));if(checks.some(row=>!row.passed))process.exitCode=1;
