import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';
import {permitDomainBundle} from '../scripts/permit-domain-bundle.mjs';
import {buildActionInventory} from '../scripts/center120-action-inventory.mjs';

const h=makeHarness({modules:[],costTaxonomyV4:true}),deployment=JSON.parse(fs.readFileSync('src/data/deployment-status-cloud-v0111.json','utf8'));
h.context.APP_RUNTIME={mode:'real',persistence:'cloud',version:deployment.version,storageKey:'isolated-spec-qa'};h.context.DEPLOYMENT_STATUS_V0111=deployment;h.context.LAW_SOURCE_V0110=JSON.parse(fs.readFileSync('src/data/law-source-v0110.json','utf8'));
h.context.CENTER120_FIX_LEDGER=JSON.parse(fs.readFileSync('docs/center-20261020-fix-ledger.json','utf8'));
for(let value=106;value<=133;value++)h.context['V'+String(value).padStart(4,'0')+'_FIX_LEDGER']=JSON.parse(fs.readFileSync('docs/v'+String(value).padStart(4,'0')+'-fix-ledger.json','utf8'));
const builder=fs.readFileSync('scripts/build-deployment.mjs','utf8'),match=builder.match(/const modules=(\[[^\n;]+\])/);assert(match,'현재 빌더의 모듈 목록이 필요합니다.');const modules=JSON.parse(match[1].replaceAll("'",'"'));
for(const name of modules){h.load(name);if(name==='core')vm.runInContext(permitDomainBundle(),h.context)}
const A=vm.runInContext('App',h.context),checks=[];function check(name,fn){try{fn();checks.push({name,status:'passed'})}catch(error){checks.push({name,status:'failed',error:error.message})}}
// CENTER120-14 supersedes the former everybody-can-open-spec fixture. Supply
// the server-granted owner capability for these renderer checks; the separate
// owner-spec suite verifies every non-owner (including another admin) is denied.
A.installCloudPersistence({workspaceId:'platform',revision:1,scope:'isolated-spec-owner',capabilities:{createProject:false,manageAccess:false,viewPlatformSpec:true},projectRoles:{},commit:async()=>{throw Error('명세 조회 검사는 사업자료를 저장하면 안 됩니다.');}});
check('CENTER120-09 current specification separates current, superseded, historical verification, and future work',()=>{
 assert.equal(A.spec.specificationSections?.current?.classification,'현행 계약');
 assert.equal(A.spec.specificationSections?.superseded?.classification,'대체된 요구');
 assert.equal(A.spec.specificationSections?.historicalVerification?.classification,'당시 검수');
 assert.equal(A.spec.specificationSections?.future?.classification,'향후 계획');
});
check('CENTER120-09 auth, schema and API contracts match current implementation rather than shared Auth blueprint',()=>{
 const auth=A.spec.productionContracts.authentication;assert.equal(auth.allowedEmailCount,12);assert.equal(auth.allowlistRequired,true);assert.equal(auth.passwordPolicy.signupMin,8);assert.equal(auth.passwordPolicy.signupMax,15);assert.equal(auth.rememberLogin.defaultHours,8);assert.equal(auth.rememberLogin.maxDays,7);assert.equal(auth.rememberLogin.absoluteExpiry,true);assert.equal(auth.supabaseAuth,'사용하지 않음');assert.equal(A.spec.backendBlueprint.sharedSupabaseAuthUsed,false);assert.equal(A.spec.backendBlueprint.database.schema,'development_project_platform');assert.deepEqual(Array.from(A.spec.backendBlueprint.roles.project),['viewer','editor','approver']);assert.deepEqual(Array.from(A.spec.backendBlueprint.roles.platform),['platform_admin']);
 for(const endpoint of ['/api/workspace','/api/notifications','/api/reference-data','/api/cost-snapshots','/api/maintenance','/api/law-search','/api/law-detail'])assert.ok(A.spec.currentFeatureContracts.serverApis[endpoint],endpoint);
 assert.match(A.spec.productionContracts.authorization.samplePolicy,/샘플ID3개.*editor/);assert.match(A.spec.delivery.runtimeConnections,/중앙 DB 연결/);assert.equal(A.spec.delivery.sampleDataDate,null);assert.equal(A.spec.prototypeBoundary.centralStorageImplemented,true);
});
check('CENTER120-09 cost37 and changed-stage permit validation are explicit, former 5-date policy is historical',()=>{
 assert.equal(A.spec.currentFeatureContracts.CBS.defaultManagementItems,37);assert.equal(A.spec.currentFeatureContracts.CBS.optionalManagementItems,58);assert.equal(A.spec.costRules.taxonomyChangedByCenter120,false);assert.match(A.spec.interactionRules.join(' '),/정수 백만원/);assert.doesNotMatch(A.spec.interactionRules.join(' '),/억원 단위/);assert.match(A.spec.currentFeatureContracts.permit.validation,/해당 단계 발생 시 필수/);assert.ok(A.spec.currentDataContracts.permit.fields.includes('application'));assert.ok(!A.spec.currentDataContracts.permit.fields.includes('applicationDate'));assert.match(JSON.stringify(A.spec.legacyReferences),/날짜 모두 필수|5날짜|5날짜와/);assert.equal(A.spec.lawMonitoring.verificationComplete,false);assert.equal(A.spec.delivery.newFeatureDeploymentVerified,false);assert.equal(A.spec.verification.baselineIsNewFeatureAcceptance,false);
});
check('CENTER120-09 compatibility routes and current tabs are separate',()=>{
 assert.deepEqual(Array.from(A.spec.currentNavigation.tabs.document),['contracts']);assert.deepEqual(Array.from(A.spec.currentNavigation.tabs.report),['generate']);assert.deepEqual(Array.from(A.spec.currentNavigation.tabs.finance),['loans']);assert.ok(A.spec.currentNavigation.compatibilityRoutes.document.includes('documents'));assert.ok(A.spec.currentNavigation.compatibilityRoutes.report.includes('history'));assert.equal(A.spec.currentNavigation.compatibilityRoutesAreCurrentScreens,false);
});
check('CENTER120-09 all eight specification views render current or explicitly historical sections',()=>{
 assert.equal(A.canViewSpec(),true,'approved owner rendering fixture must have the actual specification capability');
 for(const tab of ['overview','functions','sdd','tests','data','history','feedback','json']){A.go('spec',tab);const html=h.nodes.get('content').innerHTML;assert.match(html,/플랫폼 명세/);assert.doesNotMatch(html,/undefined/);if(['overview','functions','sdd','tests','data'].includes(tab)){assert.doesNotMatch(html,/서버\/DB연결없음|서버·DB 연결 없음|5날짜와 조치기한 직접 필수/)}if(tab==='functions')assert.match(html,/CENTER120-09/);if(tab==='overview')assert.match(html,/미검증|별도 검수|검수 중/);}
 for(const version of ['v0.11.1','v0.11.2','v0.11.3','v0.11.4','v0.11.5'])assert.ok(A.spec.history.some(row=>row.version===version),version);
});
const inventory=await buildActionInventory();
check('CENTER120-09 action inventory observes current cloud registrations but never treats registration as executed QA',()=>{
 assert.equal(inventory.registeredHandlerCountIsExecutedCount,false);assert.equal(inventory.discoveryComplete,false);assert.ok(inventory.runtimeRegistration.loadedModules.includes('cloud-session'));assert.equal(inventory.runtimeRegistration.callbacksExecuted,false);assert.ok(inventory.runtimeRegistration.registrations.some(row=>row.name==='cloud-auth-login'));assert.ok(inventory.runtimeRegistration.registrations.some(row=>row.name==='notice-dismiss'));assert.ok(inventory.runtimeRegistration.registrations.some(row=>row.name==='cost-snapshot-save'));assert.equal(inventory.counts.execution.passed,0);assert.equal(inventory.counts.execution.unverified,inventory.records.length);for(const record of inventory.records){assert.ok(record.path.source);assert.ok(record.parent);assert.ok(record.view);assert.ok(record.conditions);assert.equal(record.executionStatus,'unverified');}
});
await assert.rejects(()=>buildActionInventory({files:['src/notifications.js'],executions:{sourceFingerprint:'old-source',records:[{id:'runtime:notice-dismiss',executionStatus:'passed',evidence:['old.png']}]}}),/소스 지문/);
const report={suite:'center120-spec',mode:'actual-current-cloud-modules VM and rendered markup; not actual browser',checks,inventory:{sourceFingerprint:inventory.sourceFingerprint,counts:inventory.counts,callbacksExecuted:false},sourceHashes:Object.fromEntries(['src/spec.js','src/data/deployment-status-cloud-v0111.json','docs/center-20261020-fix-ledger.json','scripts/center120-action-inventory.mjs','tests/center120-spec.mjs'].map(file=>[file,createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))};fs.mkdirSync('.build/center120-spec',{recursive:true});const output='.build/center120-spec/verification-'+new Date().toISOString().replaceAll(':','-').replaceAll('.','-')+'.json';fs.writeFileSync(output,JSON.stringify(report,null,2));console.log(JSON.stringify({...report,output},null,2));if(checks.some(c=>c.status==='failed'))process.exitCode=1;
