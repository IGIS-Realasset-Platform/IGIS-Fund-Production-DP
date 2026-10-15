import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {makeHarness} from './recovery-harness.mjs';

const deployment=JSON.parse(fs.readFileSync('src/data/deployment-status-v0111.json','utf8'));
const blankSeed={version:'0.11.0',storageRevision:0,currentProjectId:'',selectedProjectId:'',projects:[],entities:[],auditEvents:[],notifications:[],companies:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],migrationConflicts:[],integrityIssues:[],storageQuarantine:[],sourceLoad:{status:'unavailable',schemaVersion:'notion-development-projects-v1',expectedCount:null,actualCount:0,hasMore:null,syncedAt:''}};
const modules=['core','chart-utils','cost-type-master','cost-taxonomy','cbs','vat','contracts','legal','permit-views','partners','setup','report-form','report','cbs-purpose','cbs-model-v0118','cost-cbs-order','cost-catalog-identity','cost-company-profile','cost-order','cost-coding','cost-asset-presets','xlsx-export','audit-view','recovery-views','spec'];
function boot(){const h=makeHarness({modules:[],costTaxonomyV4:true,seed:blankSeed});h.context.APP_RUNTIME={mode:'real',version:'0.11.0',storageKey:'development-platform-real-v0110'};h.context.DEPLOYMENT_STATUS_V0111=structuredClone(deployment);for(const module of modules){h.load(module);if(module==='core'){const A=vm.runInContext('App',h.context);A.partnerSeed={groups:[]};A.marketSeed={series:[]}}}const A=vm.runInContext('App',h.context);A.boot();return{...h,A}}
const checks=[],check=(name,fn)=>{try{fn();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+error.message)}};

check('PROD111-01 deployment 상태파일은 현재 보호미리보기와 미검수·미연동을 구별한다',()=>{
 assert.equal(deployment.schemaVersion,'deployment-status-v0111');assert.equal(deployment.version,'0.11.0');
 assert.equal(deployment.current.providerStatus,'success');assert.equal(deployment.current.browserVerification.home,'확인');assert.equal(deployment.current.browserVerification.spec,'확인');
 for(const key of ['crud','pdf','xlsx'])assert.equal(deployment.current.browserVerification[key],'미검수');
 assert.equal(deployment.current.connections.centralStorage,'미연동');assert.equal(deployment.current.connections.appAuthentication,'미구현');assert.match(deployment.current.connections.notion,/선택/);
});

check('PROD111-02 현재 인증정책은 @igisam.com 이메일 6자리 확인이며 공통코드·강제비밀번호·SupabaseAuth가 아니다',()=>{
 const{A}=boot(),auth=A.spec.productionContracts.authentication,next=A.spec.functionalRequirements.find(item=>item.id==='NEXT-01');
 assert.equal(A.state.projects.length,0);assert.equal(A.state.sourceLoad.status,'unavailable');
 assert.equal(auth.allowedEmailDomain,'igisam.com');assert.equal(auth.codeLength,6);assert.equal(auth.commonInitialCode,false);assert.equal(auth.passwordRequired,false);assert.equal(auth.supabaseAuth,'사용하지 않음');assert.equal(auth.emailDeliveryProvider,'Gmail SMTP 연결 준비');assert.equal(auth.profile.name,'보류');assert.equal(auth.profile.photo,'보류');assert.equal(auth.publicSignup,false);assert.equal(auth.companyDomainEnrollment,true);assert.match(auth.publicSignupPolicy,/비회사|무제한 공개 가입/);
 assert(next);assert.match(next.behavior,/@igisam\.com/);assert.match(next.behavior,/6자리/);assert(!/공통 첫 이용 코드|개인 비밀번호/.test(next.behavior));assert.match(next.status,/미구현|구현 대기/);
 assert.equal(A.spec.dataContracts.authentication.allowedEmailDomain,'igisam.com');
});

check('PROD111-03 현행 투영은 보호배포·확인범위만 표시하고 과거 인증계약은 역사로 보존한다',()=>{
 const{A,nodes}=boot();assert.equal(A.spec.meta.version,'0.11.0');assert.equal(A.spec.deploymentStatus.version,'0.11.0');
 assert(A.spec.legacyReferences.authenticationPolicies.some(item=>JSON.stringify(item).includes('공통 첫 이용 코드')));
 A.go('spec','overview');let html=nodes.get('content').innerHTML;for(const text of ['보호된 검증 미리보기','검증 배포 1건','홈·명세 진입 확인','CRUD·PDF·Excel 미검수','중앙 저장 미연동','앱 로그인 미구현'])assert(html.includes(text),text);assert(!html.includes('운영 범위</td><td>로컬 HTML'));
 A.go('spec','functions');html=nodes.get('content').innerHTML;assert(html.includes('@igisam.com'));assert(html.includes('6자리'));assert(!html.includes('전 직원 공통 첫 이용 코드'));
 A.go('spec','json');html=nodes.get('content').innerHTML;assert(html.includes('deployment-status-v0111'));assert(html.includes('회사 운영 전환 미완료'));
});

check('PROD111-04 현재 IA·CBS·핵심업무 투영은 실제 메뉴와 95·37·58 계약을 쓰고 이전 계약은 역사로 보존한다',()=>{
 const{A,nodes}=boot(),expected=[['portfolio','프로젝트 현황'],['overview','개요'],['cost','원가 관리'],['finance','파이낸싱'],['permit','인허가·사업관리'],['document','계약·문서'],['report','국토부 보고서'],['company','시공사·협력사'],['law','법령 변경'],['spec','플랫폼 명세']];
 assert.deepEqual(JSON.parse(JSON.stringify(A.spec.informationArchitecture)),expected.map(([view,name])=>({view,name})));
 assert(A.spec.legacyReferences.originalInformationArchitecture.some(item=>item.view==='setup'));
 const cbs=A.spec.currentFeatureContracts.CBS;assert.equal(cbs.managementTargets,95);assert.equal(cbs.defaultManagementItems,37);assert.equal(cbs.optionalManagementItems,58);assert.match(cbs.budgetUnit,/같은 사건/);assert.match(cbs.adjustmentPolicy,/자동.*금지|생성하지 않음/);assert(!/8대분류|30초기|미배분 조정액/.test(JSON.stringify(cbs)));
 const current=JSON.stringify(A.spec.currentFeatureContracts);for(const text of ['전체 셀','검토의견','조치계획','전문인력','계약·문서'])assert(current.includes(text),text);
 const historical=JSON.stringify(A.spec.legacyReferences.originalFeatureContracts);assert(/8대분류|미배분 조정액/.test(historical));
 const currentData=JSON.stringify(A.spec.currentDataContracts);for(const text of ['원기록 ID','null과0 구별','현재 작성본 전체 셀','의견별 복수 조치계획','개인명단'])assert(currentData.includes(text),text);
 const historicalProduction=JSON.stringify(A.spec.legacyReferences.originalProductionContracts);assert(/Supabase Auth|sameParentOnly|CROSS_PARENT_REORDER/.test(historicalProduction));assert(!/Supabase Auth|sameParentOnly|CROSS_PARENT_REORDER/.test(JSON.stringify(A.spec.productionContracts)));
 A.go('spec','functions');let html=nodes.get('content').innerHTML;assert(html.includes('플랫폼 명세'));assert(!html.includes('초기값 검토'));assert(!html.includes('8대분류30'));
 A.go('spec','sdd');html=nodes.get('content').innerHTML;assert(html.includes('managementTargets'));assert(html.includes('95'));assert(!html.includes('미배분 조정액'));
 A.go('spec','data');html=nodes.get('content').innerHTML;assert(html.includes('defaultManagementItems'));assert(!html.includes('modelCostCatalog'));
});

const failed=checks.filter(item=>item.status==='failed');
console.log(JSON.stringify({suite:'deployment-spec-current',passed:checks.length-failed.length,failed:failed.length,total:checks.length,checks}));
if(failed.length)process.exitCode=1;
