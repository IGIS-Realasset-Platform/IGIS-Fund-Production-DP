import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {makeHarness} from './recovery-harness.mjs';

const statusPath='src/data/deployment-status-v0111.json';
const status=JSON.parse(fs.readFileSync(statusPath,'utf8'));
const ledger133=JSON.parse(fs.readFileSync('docs/v0133-fix-ledger.json','utf8'));
const blankSeed={version:'0.11.0',storageRevision:0,currentProjectId:'',selectedProjectId:'',projects:[],entities:[],auditEvents:[],notifications:[],companies:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],migrationConflicts:[],integrityIssues:[],storageQuarantine:[],sourceLoad:{status:'unavailable',schemaVersion:'notion-development-projects-v1',expectedCount:null,actualCount:0,hasMore:null,syncedAt:''}};
const checks=[];
const check=(name,run)=>{try{run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}};

function specWithCurrentStatus(){
  const h=makeHarness({modules:['core','cbs','contracts','legal','permit-views','report-form','report'],seed:blankSeed});
  h.context.V0133_FIX_LEDGER=structuredClone(ledger133);
  h.context.DEPLOYMENT_STATUS_V0111=structuredClone(status);
  vm.runInContext(fs.readFileSync('src/spec.js','utf8'),h.context,{filename:'src/spec.js'});
  return JSON.parse(vm.runInContext('JSON.stringify(App.spec)',h.context));
}

check('DEPLOY-SPEC-01 현재 인증정책은 exact 회사도메인·6자리 이메일확인이고 구 공통코드·비밀번호를 강제하지 않는다',()=>{
  assert.equal(status.schemaVersion,'deployment-status-v0111');
  assert.equal(status.version,'0.11.0');
  assert.equal(status.authentication.appBoundary,'플랫폼 전용 별도 로그인');
  assert.equal(status.authentication.allowedEmailDomain,'igisam.com');
  assert.equal(status.authentication.codeLength,6);
  assert.match(status.authentication.verification,/이메일.*6자리.*확인코드/);
  assert.equal(status.authentication.commonInitialCode,false);
  assert.equal(status.authentication.passwordRequired,false);
  assert.equal(status.authentication.supabaseAuth,'사용하지 않음');
  assert.equal(status.authentication.publicSignup,false);
});

check('DEPLOY-SPEC-02 대체된 인증안은 history로만 보존되고 현재 계약에 재노출되지 않는다',()=>{
  const superseded=new Set(status.superseded);
  for(const value of ['관리자 초대 후 개인 비밀번호 설정','전 직원 공통 첫 이용 코드','Supabase Auth를 플랫폼 로그인으로 사용'])assert(superseded.has(value),value);
  const spec=specWithCurrentStatus(),auth=spec.productionContracts.authentication;
  assert.equal(auth.allowedEmailDomain,'igisam.com');
  assert.equal(auth.codeLength,6);
  assert.equal(auth.commonInitialCode,false);
  assert.equal(auth.passwordRequired,false);
  assert.equal(auth.supabaseAuth,'사용하지 않음');
  assert.equal(auth.implemented,false);
  assert(Array.isArray(spec.legacyReferences.authenticationPolicies));
  assert(spec.legacyReferences.authenticationPolicies.some(row=>JSON.stringify(row).includes('공통 첫 이용 코드')),'구 정책은 명시적 과거 이력으로만 보존');
});

check('DEPLOY-SPEC-03 Vercel 보호성공과 앱Auth·중앙저장·Notion연결을 분리한다',()=>{
  const current=status.current;
  assert.equal(current.providerStatus,'success');
  assert.match(current.protection,/무인증.*302/);
  assert.equal(current.connections.appAuthentication,'미구현');
  assert.equal(current.connections.centralStorage,'미연동');
  assert.match(current.connections.notion,/미완료/);
  assert.equal(current.connections.runtimeNotionApi,'미연동');
  const spec=specWithCurrentStatus();
  assert.equal(spec.delivery.authenticationImplemented,false);
  assert.equal(spec.delivery.centralStorageImplemented,false);
  assert.equal(spec.verification.appAuthentication,'미구현');
  assert.equal(spec.verification.centralStorage,'미연동');
});

check('DEPLOY-SPEC-04 root readonly 홈·명세확인과 CRUD·PDF·Excel 미검수를 구별한다',()=>{
  const browser=status.current.browserVerification;
  assert.equal(browser.home,'확인');
  assert.equal(browser.spec,'확인');
  for(const key of ['crud','pdf','xlsx'])assert.equal(browser[key],'미검수',key);
  const spec=specWithCurrentStatus();
  assert.equal(spec.verification.browser.home,'확인');
  assert.equal(spec.verification.browser.spec,'확인');
  assert.equal(spec.verification.interactionVerification,'CRUD·PDF·Excel 미검수');
});

check('DEPLOY-SPEC-05 현재배포와 v33 과거승인행렬을 같은완료상태로 합치지 않는다',()=>{
  const spec=specWithCurrentStatus();
  assert.equal(spec.meta.version,'0.11.0');
  assert.equal(spec.delivery.deployment.commit,'94fdd25e93a8455945f898373f745108b9962aa4');
  assert.equal(spec.deploymentStatus.current.providerStatus,'success');
  assert.equal(spec.featureContracts.v0133.deployment.previewDeployed,false,'v33 당시 행렬은 역사 상태 그대로 보존');
  assert.equal(spec.featureContracts.v0133.deployment.productionDeployed,false);
  assert(spec.history.some(row=>row.version==='v0.10.33'));
  assert(spec.history.some(row=>row.version==='v0.11.0'&&row.summary.includes('CRUD·PDF·Excel')));
});

check('DEPLOY-SPEC-06 NEXT-01 현재문구와 requirement status는 최신결정·미구현을 함께 표시한다',()=>{
  const spec=specWithCurrentStatus();
  const next=spec.functionalRequirements.find(row=>row.id==='NEXT-01');
  assert(next);
  assert.match(next.behavior,/@igisam\.com/);
  assert.match(next.behavior,/6자리/);
  assert.match(next.behavior,/초기 코드는 사용하지 않고/);
  assert.match(next.behavior,/비밀번호를 강제하지 않/);
  assert.equal(next.status,'정책 확정 · 구현 대기');
  assert.equal(next.implemented,false);
  assert.equal(next.verified,false);
});

check('DEPLOY-SPEC-07 실제 배포빌드는 현재 deployment status 전역을 spec보다 먼저 포함한다',()=>{
  fs.mkdirSync(path.resolve('.build'),{recursive:true});
  const temp=fs.mkdtempSync(path.resolve('.build/deployment-spec-independent-'));
  const out=path.join(temp,'core.html');
  try{
    const run=spawnSync(process.execPath,['scripts/build-deployment.mjs','--out',out,'--icons','src/assets/nav-icons.json'],{cwd:process.cwd(),encoding:'utf8'});
    assert.equal(run.status,0,run.stderr||run.stdout);
    const html=fs.readFileSync(out,'utf8'),globalIndex=html.indexOf('DEPLOYMENT_STATUS_V0111'),specIndex=html.indexOf('const deploymentStatus=typeof DEPLOYMENT_STATUS_V0111');
    assert(globalIndex>=0,'빌드 HTML에 DEPLOYMENT_STATUS_V0111 전역 주입 필요');
    assert(specIndex>=0,'빌드 HTML에 current spec 소비자 필요');
    assert(globalIndex<specIndex,'상태 전역은 spec 소비자보다 먼저 정의되어야 함');
    assert(html.includes('"schemaVersion":"deployment-status-v0111"')||html.includes('"schemaVersion": "deployment-status-v0111"'),'승인 상태 JSON payload 포함');
  }finally{fs.rmSync(temp,{recursive:true,force:true})}
});

const failed=checks.filter(row=>row.status==='failed');
console.log(JSON.stringify({suite:'deployment-spec-independent',passed:checks.length-failed.length,failed:failed.length,total:checks.length,browserExecuted:false,cloudExecuted:false,checks}));
if(failed.length)process.exitCode=1;

