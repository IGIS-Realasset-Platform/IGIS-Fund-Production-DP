import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AuthUnavailableError} from '../server/email-auth.mjs';
import {databaseConnectionOptions,parsePgInteger} from '../server/email-auth-runtime.mjs';

const sql=fs.readFileSync('database/application-schema.sql','utf8');
const checks=[];
function check(name,run){try{run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}}
const occurrence=(pattern,text=sql)=>(text.match(pattern)||[]).length;

check('CLOUD-STORAGE-SCHEMA-01 private schema의BetterAuth5표와platform5표만생성',()=>{
  const expected=['app_user','app_session','app_account','app_verification','app_rate_limit','platform_workspace','platform_admins','project_members','workspace_requests','workspace_audit'];
  for(const table of expected)assert(new RegExp(`create table development_project_platform\\.${table}\\s*\\(`,'i').test(sql),table);
  assert.equal(occurrence(/create table development_project_platform\./gi),10);assert(!/create table\s+(?:public|auth)\./i.test(sql));assert(!/drop\s+(?:table|schema|role)/i.test(sql));
});

check('CLOUD-STORAGE-SCHEMA-02 BetterAuth camelCase열·text ID·FK cascade를정확히보존',()=>{
  for(const column of ['emailVerified','createdAt','updatedAt','expiresAt','ipAddress','userAgent','userId','accountId','providerId','accessToken','refreshToken','idToken','accessTokenExpiresAt','refreshTokenExpiresAt','lastRequest'])assert(sql.includes(`"${column}"`),column+' must stay quoted');
  assert.equal(occurrence(/\bid text primary key\b/gi),5);assert.equal(occurrence(/"userId" text not null references development_project_platform\.app_user\(id\) on delete cascade/gi),2);
});

check('CLOUD-STORAGE-SCHEMA-03 SDK필수6인덱스의정확이름·열·유일성을사용',()=>{
  const expected=[
    /create unique index app_user_email_uidx on development_project_platform\.app_user\(email\)/i,
    /create unique index app_session_token_uidx on development_project_platform\.app_session\(token\)/i,
    /create index "app_session_userId_idx" on development_project_platform\.app_session\("userId"\)/i,
    /create index "app_account_userId_idx" on development_project_platform\.app_account\("userId"\)/i,
    /create index app_verification_identifier_idx on development_project_platform\.app_verification\(identifier\)/i,
    /create unique index app_rate_limit_key_uidx on development_project_platform\.app_rate_limit\(key\)/i
  ];for(const pattern of expected)assert(pattern.test(sql),String(pattern));
});

check('CLOUD-STORAGE-SCHEMA-04 lastRequestBIGINT와pool-scopedINT8 safe-number변환',()=>{
  assert(/"lastRequest" bigint not null/i.test(sql));const now=Date.now(),parsed=parsePgInteger(String(now));assert.equal(parsed,now);assert(Number.isSafeInteger(parsed));assert(now>2147483647);
  assert.equal(parsePgInteger(String(Number.MAX_SAFE_INTEGER)),Number.MAX_SAFE_INTEGER);for(const value of ['9007199254740992','1.5','not-a-number'])assert.throws(()=>parsePgInteger(value),AuthUnavailableError);
  const options=databaseConnectionOptions('postgresql://development_project_platform_runtime:synthetic-password@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres');assert.equal(options.max,1);assert.equal(options.ssl.rejectUnauthorized,true);
  const runtime=fs.readFileSync('server/email-auth-runtime.mjs','utf8');assert(runtime.includes("Number(oid)===20"));assert(runtime.includes('parsePgInteger'));
});

check('CLOUD-STORAGE-SCHEMA-05 workspace revisionBIGINT는JS safe범위check를갖고storage코드정규화대상',()=>{
  for(const column of ['revision','result_revision','base_revision','next_revision'])assert(new RegExp(`\\b${column} bigint not null`,'i').test(sql),column);
  assert(/revision bigint not null check\(revision>=0 and revision<=9007199254740991\)/i.test(sql));
});

check('CLOUD-STORAGE-SCHEMA-06 role은무자격준비단계이며SQL에password·기존role변경이없음',()=>{
  assert(/create role development_project_platform_runtime nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls connection limit 6/i.test(sql));
  assert(!/create role[^;]*\bpassword\b/i.test(sql));assert(!/alter role/i.test(sql));assert(!/grant\s+development_project_platform_runtime\s+to/i.test(sql));
});

check('CLOUD-STORAGE-SCHEMA-07 private runtime role만RLS·DML을받고public앱역할권한은추가하지않음',()=>{
  assert(/enable row level security/i.test(sql));assert(/create policy runtime_only[\s\S]*to development_project_platform_runtime/i.test(sql));assert(/grant usage on schema development_project_platform to development_project_platform_runtime/i.test(sql));
  assert(!/grant[\s\S]{0,180}\b(?:public|anon|authenticated|service_role)\b/i.test(sql));
});

check('CLOUD-STORAGE-SCHEMA-08 session token은SDKplain lookup key이며hash완료로오인하지않음',()=>{
  assert(/token text not null/i.test(sql));assert(/app_session_token_uidx/i.test(sql));const authSource=fs.readFileSync('server/email-auth.mjs','utf8');assert(!/session\s*:\s*\{[^}]*hash/i.test(authSource));
  const sdk=fs.readFileSync('node_modules/better-auth/dist/db/internal-adapter.mjs','utf8');assert(/token:\s*generateId\(32\)/.test(sdk));
});

const failed=checks.filter(row=>row.status==='failed');
console.log(JSON.stringify({suite:'cloud-storage-schema',passed:checks.length-failed.length,failed:failed.length,total:checks.length,actualDatabaseUsed:false,runtimeLoginActivated:false,sessionTokenHashedAtRest:false,checks}));
if(failed.length)process.exitCode=1;

