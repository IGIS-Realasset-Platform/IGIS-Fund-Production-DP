import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';

const modules=['core','reference-data','legal','permit-views','permit-map','law-monitor'];
const syntheticPermit={id:'QA-PERMIT-126',name:'합성 개발행위허가',detail:'합성 개발행위허가',group:'건축·심의',reportCategory:'공사시행',reportCategorySource:'user',reportTrigger:'인가·허가',stage:'신청',handling:'별도 진행',requestType:'최초',agency:'합성 허가기관',owner:'합성 담당자',plannedApplication:'2026-10-20',expected:'2026-12-20',application:'2026-10-21',supplement:'',approval:'',law:'합성 법률 제1조',sourcePath:'qa://permit/source',rounds:[],actionItems:[],predecessorIds:[],integratedWith:[],deemedBy:'',amendsId:'',completionState:'입력 완료'};
const syntheticProject={id:'QA-PROJECT-126',name:'합성 검수사업',type:'합성 업무시설',stage:'인허가',location:'합성 지역',asOf:'2026-10-26',basic:{method:'일반 건축'},building:{},land:{},construction:{},projectDates:{},reportingRules:{},permits:[syntheticPermit],landParcels:[],landContracts:[],landPaymentSchedule:[],sales:[],progressHistory:[],cbs:[],costStages:[],contracts:[],documents:[],milestones:[],loans:[],equities:[],guarantees:[],reports:[],reportSnapshots:[],reportDraftOverrides:[],areaVersions:[],vatRecords:[],fundForecasts:[],fundPayments:[]};
const syntheticSeed={version:'review126-synthetic',storageRevision:0,currentProjectId:syntheticProject.id,selectedProjectId:syntheticProject.id,projects:[syntheticProject],entities:[],auditEvents:[],notifications:[],companies:[],lawCatalog:[],lawChanges:[],lawUpdateRuns:[],projectLawImpacts:[],migrationConflicts:[],integrityIssues:[],storageQuarantine:[],sourceLoad:{status:'unavailable',schemaVersion:'notion-development-projects-v1',expectedCount:null,actualCount:0,hasMore:null,syncedAt:''}};
const copy=value=>JSON.parse(JSON.stringify(value)),checks=[];
function fixture(){const h=makeHarness({modules,seed:copy(syntheticSeed)});h.context.requestAnimationFrame=fn=>{fn();return 1};const A=h.A;for(const init of A.initializers)init(A.state);const p=A.state.projects[0],permit=p.permits[0];permit.catalogId=A.legal.permitCatalog[0]?.id||'';A.ui.projectId=p.id;A.ui.view='permit';A.ui.tabs.permit='permits';A.boot();return{...h,A,p,permit}}
const click=(h,action,data={})=>h.listeners.click[0]({target:{closest:selector=>selector==='[data-action]'?{dataset:{action,...data},closest:()=>null}:null},preventDefault(){}});
const tick=()=>Promise.resolve().then(()=>Promise.resolve());
function scrollFixture(tab){const h=fixture(),{A,permit,nodes}=h,dialog=nodes.get('app-dialog'),body={scrollTop:0,scrollLeft:0},marker={dataset:{permitDetailId:permit.id},isConnected:true};let detailVisible=false;const original=A.modal;A.modal=(title,content,...args)=>{detailVisible=String(content).includes('data-permit-detail-id=');return original(title,content,...args)};dialog.querySelector=selector=>selector==='.dialog-body'?body:selector==='[data-permit-detail-id]'&&detailVisible?marker:null;A.permitViews.openPermitDetail(permit.id,{tab});return{...h,body,dialog,setDetailVisible:value=>{detailVisible=value}};}
function pendingFocusFixture(){const h=fixture(),{A,permit,nodes}=h,dialog=nodes.get('app-dialog'),body={scrollTop:0,scrollLeft:0},newTab={dataset:{tab:'law'},isConnected:true,focusCalls:0,focus(){this.focusCalls++;h.document.activeElement=this}};let oldTab,resolve;const mounted={dataset:{permitDetailId:permit.id},isConnected:true,_html:'',contains:node=>node===oldTab||node===newTab,querySelector:selector=>selector.includes('data-tab="law"')?newTab:null},pending=new Promise(done=>{resolve=done});Object.defineProperty(mounted,'innerHTML',{get(){return this._html},set(value){this._html=value;if(oldTab)oldTab.isConnected=false}});oldTab={dataset:{tab:'law'},isConnected:true,getAttribute:name=>name==='aria-selected'?'true':null,closest:selector=>selector==='[data-permit-detail-tab]'?oldTab:null};dialog.open=true;dialog.contains=node=>node===mounted||node===oldTab||node===newTab;dialog.querySelector=selector=>selector==='.dialog-body'?body:selector==='[data-permit-detail-id]'?mounted:null;A.modal=(_title,content)=>{mounted.innerHTML=content};A.cloudPersistence={...A.cloudPersistence,pending:()=>true,wait:()=>pending};A.permitViews.openPermitDetail(permit.id,{tab:'law'});oldTab.isConnected=true;h.document.activeElement=oldTab;return{...h,dialog,mounted,oldTab,newTab,resolve};}
function deferredScrollFixture(){const h=fixture(),{A,permit,nodes}=h,dialog=nodes.get('app-dialog'),handlers=new Map(),body={scrollTop:0,scrollLeft:0,isConnected:true,addEventListener(type,fn){handlers.set(type,fn)},removeEventListener(type,fn){if(handlers.get(type)===fn)handlers.delete(type)}},mounted={dataset:{permitDetailId:permit.id},isConnected:true},rafs=[];h.context.requestAnimationFrame=fn=>{rafs.push(fn);return rafs.length};dialog.open=true;dialog.querySelector=selector=>selector==='.dialog-body'?body:selector==='[data-permit-detail-id]'?mounted:null;A.modal=()=>{};return{...h,body,rafs,intent:type=>handlers.get(type)?.({type,isTrusted:true})};}
async function check(name,run){try{await run();checks.push({name,status:'passed'});console.log('PASS '+name)}catch(error){checks.push({name,status:'failed',error:error.message});console.error('FAIL '+name+' :: '+(error.stack||error.message))}}

await check('UI126-PERMIT-01 상세는 4개 읽기탭·개요 reportTrigger·명시적 footer를 제공하고 원장을 바꾸지 않음',()=>{
 const h=fixture(),{A,p,permit,nodes}=h,before=JSON.stringify({permit,audit:A.state.auditEvents});A.permitViews.openPermitDetail(permit.id,{tab:'overview'});const html=nodes.get('app-dialog').innerHTML;
 assert.match(html,/role="tablist"[^>]*aria-label="인허가 상세 항목"/);for(const [tab,label]of [['overview','개요'],['rounds','신청·심의 기록'],['results','검토의견·조치'],['law','법령·조건']])assert.match(html,new RegExp(`role="tab"[^>]*data-tab="${tab}"[^>]*>${label}<`));
 assert.match(html,/role="tabpanel"[^>]*data-permit-detail-panel="overview"/);assert(html.includes('국토부 보고 기한 기준'));assert(html.includes('인가·허가'));assert(!html.includes('data-inline-entity="legalRecord"'),'읽기탭 묵시적 편집0');
 for(const label of ['인허가 정보 수정','변경 인허가 추가','삭제'])assert(html.includes('>'+label+'</button>'),label);for(const old of ['>관련 법령 조회</button>','>신청·보완·심의 기록</button>','>조치계획</button>','>인허가 수정</button>'])assert(!html.includes(old),old);
 assert.equal(JSON.stringify({permit,audit:A.state.auditEvents}),before);
});

await check('UI126-PERMIT-02 목록 조치계획은 읽기pane으로 열고 명시적 수정만 combined editor로 진입·복귀',()=>{
 const h=fixture(),{A,p,permit,nodes}=h;permit.actionItems=[{id:'result-126',resultCategory:'보완 요청',title:'진출입 검토의견',date:'2026-10-24',sourcePath:'qa://opinion',plansVersion:1,plans:[{id:'plan-126',resultItemId:'result-126',actionPlan:'동선도 보완',owner:'담당자',deadline:'2026-10-30',status:'진행 중',backDataPath:'qa://plan'}]}];const before=JSON.stringify({permit,audit:A.state.auditEvents}),list=A.permitViews.permits(p);assert.match(list,/data-action="legal-results"[^>]*>조치계획 보기</);
 click(h,'legal-results',{id:permit.id});let html=nodes.get('app-dialog').innerHTML;assert.match(html,/data-permit-detail-panel="results"/);for(const value of ['진출입 검토의견','동선도 보완','2026-10-30','qa://plan'])assert(html.includes(value),value);assert(!html.includes('id="app-form"'));assert(html.includes('>검토의견·조치 수정</button>'));assert.equal(JSON.stringify({permit,audit:A.state.auditEvents}),before);
 click(h,'permit-detail-results-edit',{id:permit.id});html=nodes.get('app-dialog').innerHTML;assert(html.includes('<h2 id="dialog-title">인허가 수정</h2>'));assert(html.includes('permit-combined-results'));assert.equal(A.formEditor.snapshot().dirty,false);A.requestModalClose();html=nodes.get('app-dialog').innerHTML;assert.match(html,/data-permit-detail-panel="results"/);assert.equal(JSON.stringify({permit,audit:A.state.auditEvents}),before);
});

await check('UI126-PERMIT-03 회차pane은 기존 조회body를 공유하고 추가폼 취소 뒤 같은pane, direct rounds 호환 유지',()=>{
 const h=fixture(),{A,permit,nodes}=h;permit.rounds=[{id:'round-126',kind:'review',date:'2026-10-23',note:'통합심의',sourcePath:'qa://round'}];A.permitViews.openPermitDetail(permit.id,{tab:'rounds'});let html=nodes.get('app-dialog').innerHTML;assert.match(html,/data-permit-detail-panel="rounds"/);for(const value of ['재심의·협의','2026-10-23','통합심의','qa://round'])assert(html.includes(value),value);assert.match(html,/data-action="permit-detail-round-add"[^>]*>\+ 진행 기록 추가<\/button>/);
 click(h,'permit-detail-round-add',{id:permit.id});assert(nodes.get('app-dialog').innerHTML.includes('<h2 id="dialog-title">진행 기록 추가</h2>'));A.requestModalClose();assert.match(nodes.get('app-dialog').innerHTML,/data-permit-detail-panel="rounds"/);
 click(h,'permit-rounds',{id:permit.id});assert(nodes.get('app-dialog').innerHTML.includes('<h2 id="dialog-title">신청·보완·심의 기록</h2>'));
});

await check('UI126-PERMIT-04 법령pane은 사업입력과 기준자료를 분리하고 unsafe URL·운영메타·generic 확인문구를 노출하지 않음',()=>{
 const h=fixture(),{A,permit,nodes}=h,type=A.permitMap.typeFor(permit)||A.legal.permitCatalog[0];permit.catalogId=type.id;permit.law='<사업 입력 법령>';permit.agency='사업 입력기관 & 담당';type.condition='실제 적용 조건';type.timing='실제 법적 시기';type.statutoryPeriod='30일';type.url='javascript:alert(1)';type.verifiedAt='2099-01-01';type.referenceReview={unverified:['프로젝트 적용 여부 확인']};A.permitViews.openPermitDetail(permit.id,{tab:'law'});let html=nodes.get('app-dialog').innerHTML;
 assert.match(html,/data-permit-detail-panel="law"/);for(const value of ['사업 기록','기준 자료','사업 입력 법령','사업 입력기관 &amp; 담당','실제 적용 조건','실제 법적 시기','30일'])assert(html.includes(value),value);for(const omitted of ['javascript:','2099-01-01','프로젝트 적용 여부 확인','근거 대조일','추가 확인'])assert(!html.includes(omitted),omitted);assert(html.includes('>다른 법령·조례 검색</button>'));
 type.url='https://www.law.go.kr/법령/가상';A.permitViews.openPermitDetail(permit.id,{tab:'law'});html=nodes.get('app-dialog').innerHTML;assert(html.includes('target="_blank" rel="noopener noreferrer"'));assert(html.includes('등록된 공식 원문 열기'));
 Object.assign(type,{condition:'사업방식·규모·지역 및 현행 법령의 적용 요건 확인',agency:'해당 법령의 허가·협의기관',timing:'',statutoryPeriod:'처리기간·보완 제외기간·연장 근거 확인 필요'});A.permitViews.openPermitDetail(permit.id,{tab:'law'});html=nodes.get('app-dialog').innerHTML;for(const generic of ['사업방식·규모·지역 및 현행 법령의 적용 요건 확인','해당 법령의 허가·협의기관','처리기간·보완 제외기간·연장 근거 확인 필요'])assert(!html.includes(generic),generic);
});

await check('UI126-PERMIT-05 viewer는 읽기탭만 보고 실제 permission값이 true일 때만 쓰기제어가 나타남',()=>{
 const h=fixture(),{A,p,permit,nodes}=h;A.cloudPersistence={...A.cloudPersistence,enabled:()=>true,capabilities:()=>({manageAccess:false}),projectRoles:()=>({[p.id]:'viewer'})};A.permitViews.openPermitDetail(permit.id,{tab:'overview'});let html=nodes.get('app-dialog').innerHTML;for(const action of ['legal-edit','legal-permit-amend','legal-delete','permit-detail-round-add','permit-detail-results-edit'])assert(!html.includes(`data-action="${action}"`),action);assert.equal(A.permitViews.canEdit(p),false);
 A.cloudPersistence.projectRoles=()=>({[p.id]:'editor'});A.permitViews.openPermitDetail(permit.id,{tab:'overview'});html=nodes.get('app-dialog').innerHTML;assert(html.includes('data-action="legal-edit"'));assert.equal(A.permitViews.canEdit(p),true);
});

await check('UI126-PERMIT-06 삭제·사업변경 후 tab action은 새기록을 만들지 않고 안전하게 닫음',()=>{
 const h=fixture(),{A,p,permit,nodes}=h,count=p.permits.length,before=JSON.stringify(p.permits);A.permitViews.openPermitDetail(permit.id,{tab:'overview'});permit.deletedAt='2026-10-26T00:00:00.000Z';click(h,'permit-detail-tab',{id:permit.id,tab:'rounds'});assert.equal(p.permits.length,count);assert.equal(JSON.stringify(p.permits),JSON.stringify(JSON.parse(before).map(row=>row.id===permit.id?{...row,deletedAt:permit.deletedAt}:row)));assert.equal(nodes.get('app-dialog').open,false);
});

await check('UI126-PERMIT-07 편집 중 권한이 viewer로 바뀌면 원장0변경·입력폼 유지',()=>{
 const h=fixture(),{A,p,permit,nodes}=h;permit.actionItems=[{id:'result-permission',resultCategory:'승인 조건',title:'권한 보존 의견',date:'2026-10-24',sourcePath:'qa://opinion',plansVersion:1,plans:[{id:'plan-permission',resultItemId:'result-permission',actionPlan:'권한 보존 조치',owner:'담당자',deadline:'2026-10-30',status:'진행 중',backDataPath:'qa://plan'}]}];A.permitViews.openPermitDetail(permit.id,{tab:'results'});click(h,'permit-detail-results-edit',{id:permit.id});const before=JSON.stringify({permit,audit:A.state.auditEvents});A.cloudPersistence={...A.cloudPersistence,enabled:()=>true,capabilities:()=>({manageAccess:false}),projectRoles:()=>({[p.id]:'viewer'})};assert.equal(A.formEditor.submit(),false);assert.equal(JSON.stringify({permit,audit:A.state.auditEvents}),before);assert(nodes.get('app-dialog').innerHTML.includes('id="app-form"'));assert.equal(A.formEditor.snapshot().dirty,false);
});

await check('UI126-PERMIT-08 회차 입력 중 권한이 viewer로 바뀌면 회차0추가·입력폼 유지',()=>{
 const h=fixture(),{A,p,permit,nodes}=h;A.permitViews.openPermitDetail(permit.id,{tab:'rounds'});click(h,'permit-detail-round-add',{id:permit.id});const before=JSON.stringify({permit,audit:A.state.auditEvents});A.formEditor.setValues({kind:'review',date:'2026-10-25',note:'권한 변경 반례',sourcePath:'qa://round-permission'});A.cloudPersistence={...A.cloudPersistence,enabled:()=>true,capabilities:()=>({manageAccess:false}),projectRoles:()=>({[p.id]:'viewer'})};assert.equal(A.formEditor.submit(),false);assert.equal(JSON.stringify({permit,audit:A.state.auditEvents}),before);assert(nodes.get('app-dialog').innerHTML.includes('id="app-form"'));assert.equal(A.formEditor.values().note,'권한 변경 반례');
});

await check('UI126-PERMIT-09 탭 markup·키보드·모바일 CSS 계약이 W3C 구조와 맞음',()=>{
 const js=fs.readFileSync('src/permit-views.js','utf8'),css=fs.readFileSync('src/permit-detail.css','utf8');for(const token of ['ArrowLeft','ArrowRight','Home','End','aria-selected','aria-controls','aria-labelledby','role="tabpanel"'])assert(js.includes(token),token);assert.match(css,/\.permit-detail-tabs\{position:sticky;top:0;z-index:12/);assert.match(css,/overflow-x\s*:\s*auto/);assert.match(css,/--permit-detail-tab-height:40px/);assert.match(css,/top:calc\(var\(--permit-detail-tab-height\) \+ 1px\);z-index:11/);assert.match(css,/@media\s*\(max-width:\s*760px\)/);assert.match(css,/--permit-detail-tab-height:44px/);assert.match(css,/\.permit-detail-footer/);
});

await check('UI126-PERMIT-10 상세 top0은 이전 저장 scroll240으로 바꾸지 않음',async()=>{
 const h=scrollFixture('overview');await tick();h.body.scrollTop=240;h.A.permitViews.openPermitDetail(h.permit.id,{tab:'law'});await tick();h.body.scrollTop=120;h.A.permitViews.openPermitDetail(h.permit.id,{tab:'overview'});await tick();assert.equal(h.body.scrollTop,240);h.body.scrollTop=0;assert.equal(h.A.permitViews.detailContext().scrollTop,0);
});

await check('UI126-PERMIT-11 law240에서 검색 취소는 law240·원장불변',async()=>{
 const h=scrollFixture('law'),before=JSON.stringify(h.A.state);await tick();h.body.scrollTop=240;click(h,'law-search-open',{id:h.permit.id,returnTab:'law'});h.setDetailVisible(false);h.body.scrollTop=0;h.A.requestModalClose();await tick();assert.match(h.nodes.get('app-dialog').innerHTML,/data-permit-detail-panel="law"/);assert.equal(h.body.scrollTop,240);assert.equal(JSON.stringify(h.A.state),before);
});

await check('UI126-PERMIT-12 rounds240에서 회차추가 취소는 rounds240·원장불변',async()=>{
 const h=scrollFixture('rounds'),before=JSON.stringify(h.A.state);await tick();h.body.scrollTop=240;click(h,'permit-detail-round-add',{id:h.permit.id});h.setDetailVisible(false);h.body.scrollTop=0;h.A.requestModalClose();await tick();assert.match(h.nodes.get('app-dialog').innerHTML,/data-permit-detail-panel="rounds"/);assert.equal(h.body.scrollTop,240);assert.equal(JSON.stringify(h.A.state),before);
});

await check('UI126-PERMIT-13 pending 상세 갱신은 현재 선택tab만 focus복원하고 다른문맥은0',async()=>{
 const same=pendingFocusFixture();same.resolve();await tick();assert.equal(same.newTab.focusCalls,1);
 for(const boundary of ['closed','different-active','detached']){const h=pendingFocusFixture();if(boundary==='closed')h.dialog.open=false;if(boundary==='different-active')h.document.activeElement={isConnected:true};if(boundary==='detached')h.mounted.isConnected=false;h.resolve();await tick();assert.equal(h.newTab.focusCalls,0,boundary);}
});

await check('UI126-PERMIT-14 같은body라도 detail session/tab 변경 뒤 옛 RAF복원0',async()=>{
 const h=deferredScrollFixture();h.A.permitViews.openPermitDetail(h.permit.id,{tab:'overview',scrollTop:240});await tick();assert.equal(h.rafs.length,1);const old=h.rafs.shift();h.A.permitViews.openPermitDetail(h.permit.id,{tab:'law',scrollTop:0});await tick();h.body.scrollTop=77;old();assert.equal(h.body.scrollTop,77);
});

await check('UI126-PERMIT-15 복원예약 뒤 사용자 wheel/key 의도는 늦은 RAF복원으로 덮지 않음',async()=>{
 for(const intent of ['wheel','keydown']){const h=deferredScrollFixture();h.A.permitViews.openPermitDetail(h.permit.id,{tab:'overview',scrollTop:240});await tick();assert.equal(h.rafs.length,1);h.body.scrollTop=88;h.intent(intent);h.rafs.shift()();assert.equal(h.body.scrollTop,88,intent);}
});

const failed=checks.filter(row=>row.status==='failed');console.log(JSON.stringify({suite:'review126-permit-detail',passed:checks.length-failed.length,failed:failed.length,total:checks.length,actualBrowser:false,realData:false,checks}));if(failed.length)process.exitCode=1;
