import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {grantApprovedSamples} from '../server/sample-access.mjs';
import {collectLawSnapshot,collectWatch} from '../server/law-collector.mjs';
import {createMaintenanceRuntime} from '../server/maintenance-runtime.mjs';
import {validatePermitChanges} from '../shared/permit-domain.mjs';

// Independent expectations derive from CENTER120 and explicit user decisions,
// not from the implementation's option arrays or its prior tests.
const checks=[];
async function check(name,run){try{await run();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',error:error.message});}}
const sourcePins=Object.fromEntries(['server/sample-access.mjs','server/law-collector.mjs','server/maintenance-runtime.mjs','shared/permit-domain.mjs','database/center-20261020.sql'].map(path=>[path,createHash('sha256').update(fs.readFileSync(path)).digest('hex')]));
const clock=()=>new Date('2026-10-20T01:00:00.000Z');
const watch={id:'national-building',target:'law',name:'건축법',source:{url:'https://www.law.go.kr'}};
const version=(sequence,at)=>({'법령ID':'100','법령일련번호':sequence,'법령명한글':'건축법','공포일자':at,'시행일자':at,'공포번호':sequence});
const nationalResponse=rows=>Response.json({LawSearch:{totalCnt:String(rows.length),page:'1',law:rows}});
const detailLoader=async({sequence,clock})=>({record:{name:'건축법',lawId:'100',bodyHash:'new-body-'+sequence},checkedAt:clock().toISOString()});

await check('I01 신규가입 샘플 부여는 정확한 승인 3개 중 하나라도 없으면 성공하지 않는다',async()=>{
 const existing=['TEST-20261016-A','TEST-20261016-B'];
 const client={query:async(sql)=>String(sql).trim().startsWith('SELECT')?{rows:existing.map(id=>({id,project_id:id,count:2,approved:2,claimed:2,distinct_ids:2})),rowCount:2}:{rows:[],rowCount:2}};
 await assert.rejects(()=>grantApprovedSamples(client,{userId:'new-verified',email:'member@igisam.com',allowedEmails:['member@igisam.com']}));
});

await check('I02 일일 수집은 현재가 된 새 버전 때문에 이전 원문 해시를 지우지 않는다',async()=>{
 const previous={dataDate:'2026-10-19',records:[{id:watch.id,name:watch.name,versions:[{sequence:'10001',lawNumber:'10001',announcedAt:'2026-09-01',effectiveAt:'2026-09-01',bodyHash:'preserved-old-body',bodyCheckedAt:'2026-10-19T01:00:00Z'}]}],changes:[]};
 const result=await collectLawSnapshot({watchlist:[watch],previous,oc:'synthetic-independent',clock,detailLoader,fetcher:async()=>nationalResponse([version('10001','20260901'),version('10002','20261020')])});
 assert.equal(result.status,'success');
 const old=result.records.find(row=>row.id===watch.id).versions.find(row=>row.sequence==='10001');
 assert.equal(old.bodyHash,'preserved-old-body');assert.equal(old.bodyCheckedAt,'2026-10-19T01:00:00Z');
});

await check('I03 행정규칙·조례 공백기간 회복은 현행 목록만 조회하지 않는다',async()=>{
 for(const target of ['admrul','ordin']){
  const urls=[];
  const row=target==='admrul'?{'행정규칙ID':'300','행정규칙일련번호':'30001','행정규칙명':'독립 행정규칙','발령일자':'20261019','시행일자':'20261020','발령번호':'30001'}:{'자치법규ID':'400','자치법규일련번호':'40001','자치법규명':'독립 조례','공포일자':'20261019','시행일자':'20261020','공포번호':'40001'};
  const name=target==='admrul'?'독립 행정규칙':'독립 조례';
  await collectWatch({id:'independent-'+target,target,name,source:{}},{oc:'synthetic-independent',clock,fetcher:async url=>{urls.push(new URL(url));return Response.json({[target==='admrul'?'AdmRulSearch':'OrdinSearch']:{totalCnt:'1',page:'1',[target==='admrul'?'admrul':'law']:[row]}});},detailLoader:async({clock})=>({record:{name,lawId:target==='admrul'?'300':'400',bodyHash:'body'},checkedAt:clock().toISOString()})});
  assert(urls.some(url=>String(url.searchParams.get('nw')||'').split(',').includes('2')),target+' historical list must be requested explicitly');
 }
});

await check('I04 모든 법령 출처가 실패한 실행은 부분 성공으로 표시하지 않는다',async()=>{
 const result=await collectLawSnapshot({watchlist:[watch],oc:'synthetic-independent',clock,fetcher:async()=>Response.json({error:'unauthorized'},{status:403})});
 assert.equal(result.checkedCount,0);assert.equal(result.status,'failed');
});

const permit=(id,patch={})=>({id,name:'인허가 '+id,group:'건축·심의',reportCategory:'사업시행계획',agency:'검사 기관',stage:'미신청',handling:'별도 진행',requestType:'최초',reportTrigger:'아님',sourcePath:'synthetic/source',plannedApplication:'2026-10-20',expected:'2026-11-20',application:'',supplement:'',approval:'',actionItems:[],...patch});
const state=rows=>({projects:[{id:'P1',permits:rows}]});

await check('I05 인허가를 삭제 표시해도 기존 진행 회차를 함께 제거할 수 없다',()=>{
 const old=permit('A',{rounds:[{id:'round-1',kind:'application',date:'2026-10-20',sourcePath:'synthetic/application'}]});
 const next={...structuredClone(old),deletedAt:'2026-10-20T02:00:00Z',rounds:[]};
 assert.equal(validatePermitChanges(state([old]),state([next])).valid,false);
});

await check('I06 선행 항목 이름 수정이 변경 없는 후속 항목의 옛 미완성 조치를 새 오류로 만들지 않는다',()=>{
 const a=permit('A'),b=permit('B',{predecessorId:'A',actionItems:[{id:'opinion-legacy',plansVersion:1,resultCategory:'심의 의견',title:'이전 미완성 의견',date:'',sourcePath:'',plans:[]}]});
 const nextA={...a,name:'같은 인허가의 이름 수정'};
 const result=validatePermitChanges(state([a,b]),state([nextA,structuredClone(b)]));
 assert.equal(result.valid,true,JSON.stringify(result.errors));
});

await check('I07 무관한 사업비 수정은 기존 미완성 인허가를 새로 검증하지 않는다',()=>{
 const old=state([permit('A',{application:'',plannedApplication:'',expected:'',agency:''})]);old.projects[0].cbs=[{id:'cost',current:1}];
 const next=structuredClone(old);next.projects[0].cbs[0].current=2;
 assert.equal(validatePermitChanges(old,next).valid,true);
});

await check('I08 새 인허가의 존재하지 않는 관계 대상은 서버 규칙에서 거부한다',()=>{
 const p=permit('A',{predecessorIds:['not-in-this-project']});
 assert.equal(validatePermitChanges(state([]),state([p])).valid,false);
});

await check('I09 새 migration은 기존 다른 스키마·공유 역할을 광역 수정하지 않는다',()=>{
 const sql=fs.readFileSync('database/center-20261020.sql','utf8');
 assert.doesNotMatch(sql,/\b(?:create|alter|drop)\s+(?:schema|role)\b/i);
 assert.doesNotMatch(sql,/\bon\s+all\s+tables\s+in\s+schema\b/i);
 for(const line of sql.split('\n').filter(line=>/^\s*(?:grant|revoke)\b/i.test(line)))assert.match(line,/development_project_platform\./);
 assert.match(sql,/grant select,insert on development_project_platform\.reference_snapshots,development_project_platform\.cost_snapshots/);
});

await check('I10 승인 샘플 검사와 권한 부여 사이에 샘플 삭제가 끼어들지 않는다',async()=>{
 const source={A:'YD427',B:'YD816',C:'IOTA'},projects=Object.keys(source).map(letter=>({id:'TEST-20261016-'+letter,testData:{kind:'user-approved-html-fixture',batchId:'20261016-abc',sourceProjectId:source[letter],sourceHtmlSha256:'0271502c802e8f98ffc927b5c06c9da45b39ea7d76de74a03b7accea17cace7a'}}));
 const memberships=new Map([['TEST-20261016-A','approver'],['TEST-20261016-B','viewer']]);let available=structuredClone(projects);
 const client={query:async(sql)=>{
  if(String(sql).trim().startsWith('SELECT')){const rows=available.map(project=>({project:structuredClone(project)}));if(!/\bFOR\s+(?:KEY\s+SHARE|SHARE|UPDATE)\b/i.test(sql))available=available.filter(p=>p.id!=='TEST-20261016-C');return {rows,rowCount:rows.length};}
  for(const p of available)if(!memberships.has(p.id)||memberships.get(p.id)==='viewer')memberships.set(p.id,'editor');return {rows:[],rowCount:available.length};
 }};
 await grantApprovedSamples(client,{userId:'new-verified',email:'member@igisam.com',allowedEmails:['member@igisam.com']});
 assert.equal(memberships.get('TEST-20261016-A'),'approver');assert.equal(memberships.get('TEST-20261016-B'),'editor');assert.equal(memberships.get('TEST-20261016-C'),'editor');
});

await check('I11 첫 전체성공 전의 부분실패 후에도 실패 출처의 누락 개정을 복구한다',async()=>{
 let at=new Date('2026-10-20T01:00:00Z'),attempt=1;
 const watched=[{id:'watch-A',name:'독립법A',target:'law',source:{}},{id:'watch-B',name:'독립법B',target:'law',source:{}}];
 const db={statuses:new Map(),runs:new Map(),snapshots:[{dataDate:'2026-09-29',records:[],changes:[]}]};
 const client={release(){},query:async(sql,args=[])=>{
  const q=String(sql).replace(/\s+/g,' ').trim();
  if(['BEGIN','COMMIT','ROLLBACK'].includes(q)||q.startsWith('SET LOCAL')||q.startsWith('SELECT pg_advisory'))return {rows:[],rowCount:0};
  if(q.startsWith('SELECT * FROM development_project_platform.maintenance_status'))return {rows:db.statuses.has(args[0])?[structuredClone(db.statuses.get(args[0]))]:[]};
  if(q.startsWith('INSERT INTO development_project_platform.maintenance_status')){const old=db.statuses.get(args[0])||{};db.statuses.set(args[0],{...old,status:'running',last_attempt_at:at.toISOString(),active_run_id:args[1],lease_until:new Date(+at+240000).toISOString()});return {rows:[],rowCount:1};}
  if(q.startsWith('INSERT INTO development_project_platform.maintenance_runs')){db.runs.set(args[0],{job:args[1],status:'running'});return {rows:[],rowCount:1};}
  if(q.startsWith('UPDATE development_project_platform.maintenance_runs')){Object.assign(db.runs.get(args[3]),{status:args[0]});return {rows:[],rowCount:1};}
  if(q.startsWith('UPDATE development_project_platform.maintenance_status')){const row=db.statuses.get(args[4]);if(row.active_run_id!==args[5])return {rows:[],rowCount:0};Object.assign(row,{status:args[0],lease_until:null,active_run_id:null,details:JSON.parse(args[2])});if(args[0]==='success'){row.last_success_at=at.toISOString();row.cursor=args[3];}return {rows:[],rowCount:1};}
  if(q.startsWith('SELECT value FROM development_project_platform.maintenance_configuration'))return {rows:[{value:{introducedAt:'2026-10-20T00:00:00Z'}}]};
  if(q.startsWith('SELECT state FROM development_project_platform.platform_workspace'))return {rows:[{state:{projects:[{id:'P1'}]}}]};
  if(q.startsWith('SELECT id,target,name,jurisdiction,source'))return {rows:structuredClone(watched)};
  if(q.startsWith('SELECT payload FROM development_project_platform.reference_snapshots'))return {rows:[{payload:structuredClone(db.snapshots.at(-1))}]};
  if(q.startsWith('SELECT active_run_id FROM development_project_platform.maintenance_status'))return {rows:[{active_run_id:db.statuses.get('law')?.active_run_id}]};
  if(q.startsWith('INSERT INTO development_project_platform.reference_snapshots')){db.snapshots.push(JSON.parse(args[2]));return {rows:[],rowCount:1};}
  throw Error('Independent harness does not implement SQL: '+q);
 }};
 const env={CRON_SECRET:'independent-maintenance-secret-thirty-two-plus',DP_AUTH_ORIGIN:'https://independent.example.invalid',DP_AUTH_SECRET:'independent-auth-secret-thirty-two-plus',DP_AUTH_DATABASE_URL:'postgresql://development_project_platform_runtime:synthetic@db.baqybhtfvuttcyyzspyi.supabase.co:5432/postgres',DP_ALLOWED_EMAILS:'["member@igisam.com"]',DP_MAIL_PROVIDER:'gmail',DP_GMAIL_USER:'synthetic@gmail.com',DP_GMAIL_APP_PASSWORD:'abcdefghijklmnop',DP_LAW_OC:'synthetic-independent'};
 const run=createMaintenanceRuntime({environment:()=>env,clock:()=>at,loadDrivers:async()=>({pool:{connect:async()=>client}}),fetcher:async url=>{
  const name=new URL(url).searchParams.get('query');if(attempt===1&&name==='독립법B')return Response.json({error:'unavailable'},{status:503});
  const b=name==='독립법B',row={...version(b?'20002':'20001',b?'20261002':'20261001'),'법령명한글':name,'법령ID':b?'202':'201'};return nationalResponse([row]);
 },collector:options=>collectLawSnapshot({...options,detailLoader:async({sequence,clock})=>({record:{name:sequence==='20002'?'독립법B':'독립법A',lawId:sequence==='20002'?'202':'201',bodyHash:'hash-'+sequence},checkedAt:clock().toISOString()})})});
 const request=()=>new Request(env.DP_AUTH_ORIGIN+'/api/maintenance',{headers:{authorization:'Bearer '+env.CRON_SECRET}});
 const first=await (await run(request())).json();assert.equal(first.jobs.law.status,'partial_failure');assert.equal(db.statuses.get('law').cursor,undefined);
 at=new Date('2026-10-21T01:00:00Z');attempt=2;
 const second=await (await run(request())).json();assert.equal(second.jobs.law.status,'success');
 assert(db.snapshots.at(-1).changes.some(change=>change.lawId==='watch-B'),'2026-10-02 B amendment was missed during partial failure and must be recovered');
});

console.log(JSON.stringify({suite:'center120-independent-boundaries',sourcePins,checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,actualDatabaseUsed:false,actualOfficialApiCalled:false,actualCredentialsUsed:false}));
if(checks.some(x=>x.status==='failed'))process.exitCode=1;
