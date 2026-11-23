import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const plain=v=>JSON.parse(JSON.stringify(v));
const {A}=makeHarness({modules:['core','legal'],seed:{projects:[]}});
const p={id:'P260',name:'격리 검수 사업',entityId:'E260',permits:[{id:'PERMIT260',name:'검수 인허가',stage:'미신청',actionItems:[]}],basic:{},land:{delay:'아니오'},reportSnapshots:[{id:'FROZEN',value:123}],sales:[]};
A.state.projects=[p];A.ui.projectId=p.id;A.state.entities=[{id:'E260',name:'검수 법인',status:'검토 중',professionalRecords:[]}];
assert.equal(typeof A.legal.addPermitReviewAction,'function','새 검토의견/조치계획 저장 API');
assert.equal(typeof A.legal.updatePermitReviewField,'function','완료/주체 수정 API');
const preserved=plain({land:p.land,reportSnapshots:p.reportSnapshots});
const ids=A.legal.addPermitReviewAction(p.id,'PERMIT260',{title:'진입 동선 보완',actionPlan:'도면 수정 후 재협의'});
const result=p.permits[0].actionItems[0],plan=result.plans[0];
assert.equal(result.title,'진입 동선 보완');assert.equal(plan.actionPlan,'도면 수정 후 재협의');
assert.equal(result.plansVersion,2);assert.equal(plan.reviewTrackingVersion,1);
A.legal.updatePermitReviewField(p.id,'PERMIT260',ids.resultId,ids.planId,'authorityReported',false);
assert.equal(p.permits[0].actionItems[0].plans[0].authorityReported,false);
A.legal.updatePermitReviewField(p.id,'PERMIT260',ids.resultId,ids.planId,'drawingReflected',true);
A.legal.updatePermitReviewField(p.id,'PERMIT260',ids.resultId,ids.planId,'completionReflected',undefined);
const after=p.permits[0].actionItems[0].plans[0];
assert.equal(after.drawingReflected,true);assert(!Object.hasOwn(after,'completionReflected'));
const before=plain(p);
assert.throws(()=>A.legal.updatePermitReviewField(p.id,'PERMIT260',ids.resultId,ids.planId,'authorityReported','예'));
assert.deepEqual(plain(p),before);
assert.throws(()=>A.legal.addPermitReviewAction(p.id,'missing',{title:'잘못된 대상',actionPlan:'추가 금지'}));
A.ui.projectId='OTHER';assert.throws(()=>A.legal.updatePermitReviewField(p.id,'PERMIT260',ids.resultId,ids.planId,'title','잘못된 변경'));A.ui.projectId=p.id;
assert.deepEqual(plain({land:p.land,reportSnapshots:p.reportSnapshots}),preserved);
assert.equal(typeof A.legal.openLandPaymentEditor,'function','259 토지대금 수정 진입 보존');
const html=A.legal.ui.registration(p);assert(html.includes('소속'));assert(!html.includes('첨부서류 준비 현황'));
console.log('LOCAL-UI-260: 의견/계획 추가·추적필드·무효값·문맥/원자료·토지대금 보존 통과');

// LOCAL-UI-260 follow-up: quick-add and full-edit share the same optional fields.
const combinedChecks=[];
const checkCombined=(name,fn)=>{try{fn();combinedChecks.push({name,pass:true});}catch(error){combinedChecks.push({name,pass:false,error:error.message});}};
function combinedFixture({legacy=false,tracking=true}={}){
 const h=makeHarness({modules:['core','legal'],seed:{projects:[]}}),A=h.A;
 const permit={id:'combined-permit',name:'격리 허가',group:'건축·심의',reportCategory:'공사시행',agency:'검수기관',stage:'미신청',plannedApplication:'2026-11-01',expected:'2027-01-20',application:'',supplement:'',approval:'',reportTrigger:'아님',handling:'별도 진행',requestType:'최초',sourcePath:'검수/인허가',actionItems:[]};
 const project={id:'combined-project',name:'전체 수정 검수',permits:[permit],land:{delay:'아니오'},reportSnapshots:[{id:'unchanged',amount:123456789}]};A.state.projects=[project];A.ui.projectId=project.id;
 A.legal.addPermitReviewAction(project.id,permit.id,{title:'진입로 보완',actionPlan:'도면 정정'});
 const opinion=permit.actionItems[0],plan=opinion.plans[0];plan.authorityReported=false;plan.drawingReflected=true;plan.actionParty={type:'기타',name:'협력 설계사'};
 if(!tracking)delete plan.reviewTrackingVersion;
 if(legacy){opinion.plansVersion=1;Object.assign(opinion,{resultCategory:'보완 요청',date:'2026-11-01',sourcePath:'검수/의견'});delete plan.reviewTrackingVersion;Object.assign(plan,{deadline:'2026-12-01',status:'진행 중',backDataPath:'검수/조치'});}
 A.save();let form;A.form=(title,fields,submit,label,options)=>{form={title,fields,submit,label,options};};A.legal.permitForm(project,permit);
 const values=Object.fromEntries(['name','group','reportCategory','agency','stage','plannedApplication','expected','application','supplement','approval','reportTrigger','handling','requestType','sourcePath'].map(key=>[key,permit[key]??'']));for(const key of ['resultCategory','title','date','sourcePath'])values[`result__${opinion.id}__${key}`]=opinion[key]??'';for(const key of ['actionPlan','owner','deadline','status','backDataPath'])values[`plan__${opinion.id}__${plan.id}__${key}`]=plan[key]??'';
 const name=(kind,key)=>kind==='result'?`result__${opinion.id}__${key}`:`plan__${opinion.id}__${plan.id}__${key}`;
 const marker=(kind,key)=>{const fragment=form.fields.split(`data-field="${name(kind,key)}"`)[1]?.split('</label>')[0];assert(fragment,`${key} 입력 요소`);return fragment.includes('data-required-when="always"')||fragment.includes('aria-required="true"');};
 return{A,project,permit,opinion,plan,form,values,name,marker};
}
checkCombined('간단 추가의 선택 6항목은 전체 수정에서도 선택, 의견·계획 내용은 필수',()=>{const f=combinedFixture();for(const key of ['resultCategory','date','sourcePath'])assert.equal(f.marker('result',key),false,key);for(const key of ['deadline','status','backDataPath'])assert.equal(f.marker('plan',key),false,key);assert(f.marker('result','title'));assert(f.marker('plan','actionPlan'));});
for(const tracking of [true,false])checkCombined(`새 형식 전체 수정 실제 저장·추적필드/원자료 보존 (tracking ${tracking})`,()=>{const f=combinedFixture({tracking}),preserved=plain({land:f.project.land,reportSnapshots:f.project.reportSnapshots}),original=f.permit.id;f.values[f.name('result','title')]='진입로 의견 정정';f.values[f.name('plan','actionPlan')]='도면 정정 후 재검토';assert.doesNotThrow(()=>f.form.submit(f.values));const r=f.permit.actionItems[0],plan=r.plans[0];assert.equal(f.permit.id,original);assert.equal(r.plansVersion,2);assert.equal(r.title,'진입로 의견 정정');assert.equal(plan.actionPlan,'도면 정정 후 재검토');assert.equal(plan.authorityReported,false);assert.equal(plan.drawingReflected,true);assert.deepEqual(plain(plan.actionParty),{type:'기타',name:'협력 설계사'});assert.equal(plan.reviewTrackingVersion,tracking?1:undefined);for(const key of ['deadline','status','backDataPath'])assert.equal(plan[key]??'','');assert.deepEqual(plain({land:f.project.land,reportSnapshots:f.project.reportSnapshots}),preserved);});
checkCombined('기존 형식 6항목은 필수 유지하고 누락 저장은 자료 변경 없이 차단',()=>{const f=combinedFixture({legacy:true});for(const key of ['resultCategory','date','sourcePath'])assert(f.marker('result',key),key);for(const key of ['deadline','status','backDataPath'])assert(f.marker('plan',key),key);const previous=plain(f.project);f.values[f.name('result','date')]='';f.values[f.name('plan','deadline')]='';assert.throws(()=>f.form.submit(f.values));assert.deepEqual(plain(f.project),previous);});
checkCombined('새 v2 보고 투영은 선택정보 누락을 오류로 만들지 않고 추적값·과거 저장본을 보존',()=>{const f=combinedFixture({tracking:false});f.opinion.createdAt='2026-11-01T00:00:00Z';f.plan.createdAt='2026-11-01T00:00:00Z';f.project.reportSnapshots.push({id:'prior-report',asOf:'2026-11-02',permits:plain(f.project.permits)});const previous=plain(f.project),out=f.A.legal.reportProjection(f.project,'2026-11-23');assert(!out.issues.some(message=>message.startsWith('격리 허가 / 진입로 보완:')),out.issues.join(' / '));const rows=out.project.permits[0].reportResultPlans;assert.equal(rows.length,1);assert.equal(rows[0].actionPlan,'도면 정정');assert.equal(rows[0].authorityReported,false);assert.equal(rows[0].drawingReflected,true);assert.deepEqual(plain(f.project),previous);rows[0].actionPlan='출력본에서만 변경';assert.deepEqual(plain(f.project),previous);});
checkCombined('내부 이행증빙은 보고 계획과 검증 대상에서 함께 제외하고 원문 보존',()=>{const f=combinedFixture({legacy:true});f.opinion.createdAt='2026-11-01T00:00:00Z';f.plan.createdAt='2026-11-01T00:00:00Z';f.permit.actionItems.push({id:'evidence-only',plansVersion:1,usageScope:'implementation-evidence',title:'내부 이행증빙',resultCategory:'기타 결과',date:'',sourcePath:'',plans:[]});const previous=plain(f.project),out=f.A.legal.reportProjection(f.project,'2026-11-23');assert(!out.issues.some(message=>message.includes('내부 이행증빙')),out.issues.join(' / '));assert.equal(out.project.permits[0].reportResultPlans.length,1);assert(!out.project.permits[0].reportResultPlans.some(row=>row.resultId==='evidence-only'));assert.deepEqual(plain(f.project),previous);});
checkCombined('기존 형식 보고 투영의 필수정보 누락은 계속 검출하고 과거 저장본은 불변',()=>{const f=combinedFixture({legacy:true});f.opinion.createdAt='2026-11-01T00:00:00Z';f.plan.createdAt='2026-11-01T00:00:00Z';f.project.reportSnapshots.push({id:'legacy-frozen',permits:plain(f.project.permits)});f.plan.deadline='';const previous=plain(f.project),out=f.A.legal.reportProjection(f.project,'2026-11-23');assert(out.issues.some(message=>message.startsWith('격리 허가 / 진입로 보완:')&&message.includes('조치기한')));assert.deepEqual(plain(f.project),previous);assert.equal(f.project.reportSnapshots.at(-1).permits[0].actionItems[0].plans[0].deadline,'2026-12-01');});
console.log(JSON.stringify({suite:'LOCAL-UI-260 combined edit',checks:combinedChecks}));if(combinedChecks.some(x=>!x.pass))process.exitCode=1;
