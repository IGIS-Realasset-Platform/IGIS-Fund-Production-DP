import assert from 'node:assert/strict';
import vm from 'node:vm';
import {makeHarness} from './recovery-harness.mjs';
import {permitDomainBundle} from '../scripts/permit-domain-bundle.mjs';

// Isolated business records only. This test never reads or writes workspace.state.
const seed={projects:[{id:'REVIEW-P',name:'검사 전용 사업',asOf:'2026-10-01',basic:{},building:{},land:{purchaseRate:0},landParcels:[],landContracts:[],landPaymentSchedule:[],contracts:[],loans:[],cbs:[],sales:[{id:'SALE',category:'상가',unit:'호',total:10,planned:8,completed:0,start:'2026-11-01',amount:0}],construction:{plannedStart:'2026-10-01',actualStart:'2026-10-03',plannedCompletion:'2027-10-01',actualCompletion:'',plannedProgress:10,actualProgress:0},projectDates:{responsibleSourcePath:'검사자료/약정.pdf'},progressAsOf:'2026-11-01',progressHistory:[],permits:[{id:'PERMIT',name:'검사 전용 건축허가',group:'건축',stage:'보완 중',actionItems:[{id:'OPINION',title:'동선 검토',resultCategory:'보완 요청',date:'2026-10-01',sourcePath:'검사자료/의견.pdf',plansVersion:1,plans:[{id:'PLAN',actionPlan:'동선도 보완',owner:'검사 담당',deadline:'2026-12-01',status:'진행 중',backDataPath:'검사자료/조치.pdf',authorityReported:false,drawingReflected:true,actionParty:{type:'기타',name:'검사 주체'}}]}]}]}],entities:[],companies:[],auditEvents:[],notifications:[],lawChanges:[],projectLawImpacts:[]};
function fixture(){const h=makeHarness({modules:['core','legal','permit-views','report-form','report'],seed});h.A.ui.projectId='REVIEW-P';h.A.ui.view='permit';h.A.ui.tabs.permit='permits';return {...h,p:h.A.current()};}
const checks=[];
function test(name,fn){try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}}
test('새 조치계획 보기는 실제 의견·계획·추적값을 읽으며 조회로 원장을 바꾸지 않음',()=>{
 const {A,p}=fixture(),before=JSON.stringify(A.state);A.ui.permitLayout='actions';const html=A.permitViews.permits(p);
 for(const text of ['검토의견 및 조치계획','인허가청 보고 완료','도면 반영 완료','준공 반영 완료','행위 주체','비용 부담 주체','동선 검토','동선도 보완','검사 주체','미확인','미완료','완료'])assert(html.includes(text),text+' 누락');
 assert.match(html,/<section class="panel permit-workspace"/);assert.match(html,/class="panel-body permit-workspace-body"/);
 assert.match(html,/data-permit-review-table/);assert.match(html,/data-inline-command="edit"/);assert.equal(JSON.stringify(A.state),before);
});
test('인허가·분양·부지의 명시적 수정 진입과 기존 값 보존',()=>{
 const {A,p}=fixture(),before=JSON.stringify(A.state);A.ui.permitLayout='list';
 assert.match(A.permitViews.permits(p),/data-action="legal-edit"[^>]*data-type="permit"/);
 const sales=A.permitViews.sales(p);assert.match(sales,/data-action="legal-edit"[^>]*data-type="sale"/);assert(sales.includes('상가'));assert(sales.includes('10'));assert(sales.includes('2026-11-01'));
 const land=A.permitViews.land(p);assert.match(land,/data-action="land-input-open"/);assert.doesNotMatch(land,/data-inline-field="land\./);assert.equal(JSON.stringify(A.state),before);
});
test('공정 현황을 먼저 보여주고 모든 구역 수정·일정·0%·약정을 보존',()=>{
 const {A,p}=fixture(),before=JSON.stringify(A.state),html=A.permitViews.construction(p);
 assert(html.includes('공정 현황'));assert(html.indexOf('공정 현황')<html.indexOf('착공·준공 일정'));assert.match(html,/data-action="construction-input-open"/);
 for(const section of ['start','completion','progress','pf','work','agreements'])assert(new RegExp('data-action="construction-section-edit"[^>]*data-section="'+section+'"').test(html),section+' 수정 누락');
 for(const value of ['2026-10-01','2026-10-03','2027-10-01','0%','검사자료/약정.pdf'])assert(html.includes(value),value+' 누락');assert.equal(JSON.stringify(A.state),before);
});
test('공정 전체 수정도 복수 사유를 입력하며 무수정·다른 필드 저장에 기존 배열 보존',()=>{
 const {A,p}=fixture();p.construction.startDelayReason=['인가·허가 등 행정적·법적문제','자금조달 등 금융문제'];let form;A.form=(title,fields,callback,label,options)=>{form={fields,callback,options};};A.permitViews.openConstructionEditor(p);
 assert.match(form.fields,/data-construction-reasons="construction__startDelayReason"/);
 const before=JSON.stringify(A.state);form.callback({...form.options.initialValues});assert.equal(JSON.stringify(A.state),before);
 form.callback({...form.options.initialValues,construction__startDelayDetail:'추가 확인'});
 assert.deepEqual(JSON.parse(JSON.stringify(p.construction.startDelayReason)),['인가·허가 등 행정적·법적문제','자금조달 등 금융문제']);
});
test('복수 사유 변경은 선택값만 저장하고 무효 후보·중복은 다른 필드까지 쓰지 않음',()=>{
 const {A,p}=fixture();let form;A.form=(title,fields,callback,label,options)=>{form={callback,options};};A.permitViews.openConstructionEditor(p);const before=JSON.stringify(A.state);
 for(const value of ['["허용하지 않은 사유"]','["자금조달 등 금융문제","자금조달 등 금융문제"]','잘못된 형식']){
  const packet={...form.options.initialValues,construction__startDelayDetail:'부분쓰기 금지',construction__startDelayReason:value};assert.throws(()=>form.callback(packet));assert.equal(JSON.stringify(A.state),before);
 }
 form.callback({...form.options.initialValues,construction__startDelayReason:'["자금조달 등 금융문제","사업비(공사비) 문제"]'});
 assert.deepEqual(JSON.parse(JSON.stringify(p.construction.startDelayReason)),['자금조달 등 금융문제','사업비(공사비) 문제']);
});
function reviewEditor(A,p,field){let found;const original=A.editable;A.editable=options=>{if(options.entity==='permitReviewField'&&options.field===field)found=options;return original(options);};try{A.permitViews.reviewActions(p);}finally{A.editable=original;}assert(found,field+' 편집 연결 누락');return found;}
test('실제 화면의 추적필드 연결로 완료값을 저장하고 오래된 셀은 일부쓰기 없이 차단',()=>{
 const {A,p}=fixture(),editor=reviewEditor(A,p,'authorityReported'),preserved=JSON.stringify({sales:p.sales,land:p.land}),stale=reviewEditor(A,p,'drawingReflected');
 A.commitInline({...editor,value:'true'});assert.equal(A.current().permits[0].actionItems[0].plans[0].authorityReported,true);
 const before=JSON.stringify(A.state);assert.throws(()=>A.commitInline({...stale,value:'false'}),/변경/);assert.equal(JSON.stringify(A.state),before);
 const party=reviewEditor(A,A.current(),'costParty');A.commitInline({...party,value:A.parseInlineValue(party.type,'{"type":"기타","name":"검사 비용 주체"}')});
 assert.equal(A.current().permits[0].actionItems[0].plans[0].costParty.name,'검사 비용 주체');assert.equal(JSON.stringify({sales:A.current().sales,land:A.current().land}),preserved);
});
try{
 const h=makeHarness({modules:[],seed:{projects:[]}});h.context.APP_RUNTIME={mode:'real',persistence:'cloud',version:'0.13.0',storageKey:'isolated-permit-view-cloud'};h.load('core');vm.runInContext(permitDomainBundle(),h.context);h.load('legal');h.load('permit-views');h.load('report-form');h.load('report');const A=vm.runInContext('App',h.context);let revision=1,submitted;
 A.installCloudPersistence({workspaceId:'ISOLATED',revision,scope:'permit-view-cloud',capabilities:{manageAccess:false},projectRoles:{'REVIEW-P':'editor'},commit:async request=>{submitted=JSON.parse(JSON.stringify(request.state));return {workspaceId:request.workspaceId,requestId:request.requestId,revision:++revision,state:request.state};}});
 A.hydrateCloudWorkspace({workspaceId:'ISOLATED',revision,scope:'permit-view-cloud',state:{...JSON.parse(JSON.stringify(A.state)),...structuredClone(seed)}});A.ui.projectId='REVIEW-P';
 const editor=reviewEditor(A,A.current(),'authorityReported');await A.commitInline({...editor,value:'true'});if(A.cloudPersistence.pending())await A.cloudPersistence.wait();
 assert.equal(submitted.projects[0].permits[0].actionItems[0].plans[0].authorityReported,true);assert.equal(A.current().permits[0].actionItems[0].plans[0].authorityReported,true);assert.equal(submitted.projects[0].sales[0].completed,0);
 checks.push({name:'격리 cloud adapter에서 화면 추적값이 기존 state 저장 경로로 전달됨',passed:true});
}catch(error){checks.push({name:'격리 cloud adapter에서 화면 추적값이 기존 state 저장 경로로 전달됨',passed:false,error:error.message});}
console.log(JSON.stringify({checks,passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length},null,2));
if(checks.some(x=>!x.passed))process.exitCode=1;
