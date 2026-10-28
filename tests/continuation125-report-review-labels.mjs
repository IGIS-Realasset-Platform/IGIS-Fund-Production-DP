import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';
const sha=value=>createHash('sha256').update(value).digest('hex'),files=['src/report.js','src/report-form.js','src/contracts.js','src/core.js'],pins=Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(file))])),checks=[],copy=structuredClone;
const check=(name,fn)=>{try{fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',error:error.message});}};
const ctx={type:'plan',date:'2030-01-01',stageId:'current'};
function fixture(){
 const h=makeHarness({modules:['core','cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','setup','contracts','report-form','report'],seed:{version:'0.12.5',projects:[],companies:[],entities:[],auditEvents:[],notifications:[]},costTaxonomyV4:true}),A=h.A;A.realMode=true;for(const init of A.initializers)init(A.state);
 const register=id=>A.projectRegistration.register({id,name:id,type:'오피스',location:'독립 합성 위치',operator:'합성 법인',manager:'합성 담당',gfaTotal:'1000',siteArea:'500',acquisitionLandArea:'500',evidenceSource:'독립 합성',evidenceLocation:'저장 검토표',evidenceAsOf:'2026-10-23',evidencePath:'QA/report-review-labels'},'',{navigate:false}),p=register('REVIEW-A');register('REVIEW-B');A.ui.projectId=p.id;
 p.loans=[{id:'LOAN-A',institution:'A은행',rank:'선순위',type:'본PF',commitment:1000000000,executed:700000000,balance:600000000,allIn:6.5,allInAdvisoryBasis:'included',start:'2026-01-01',maturity:'2028-12-31',collateral:'담보 원문'}];p.loanEvents=[];p.loanQuarterlyRecords=[];p.loanQuarterSnapshots=[];
 p.equities=[{id:'EQUITY-A',company:'A출자사',registration:'합성 등록',amount:200000000,purpose:'운영출자자'}];
 p.reportParticipants={contractors:[{id:'CONTRACTOR-A',name:'A시공사',registration:'합성 등록',contractDate:'2026-01-01',amount:300000000,period:'24개월',otherCreditEnhancement:'원문 보강'}],trustees:[{id:'TRUSTEE-A',name:'A신탁사',code:'합성 코드',otherType:'개발 신탁',period:'36개월',fee:10000000,creditEnhancement:'원문 보강'}],guarantors:[{id:'GUARANTOR-A',name:'A보증기관',amount:400000000,scope:'원문 범위'}]};
 p.permits=[{id:'PERMIT-A',name:'건축허가',category:'공사시행',reportCategory:'공사시행',application:'2026-01-01',approval:'2026-02-01'}];
 p.sales=[{id:'SALE-A',category:'오피스 분양',unit:'호',total:100,planned:80,completed:40,start:'2026-01-01',amount:500000000}];
 p.reportLandPlan=[{id:'LAND-PLAN-A',asOf:'2026-10-23',category:'상업용지',area:500,lots:2}];
 p.reportBuildingPlans=[{id:'BUILDING-A',asOf:'2026-10-23',representativeLot:'합성동 1-1',zone:'상업지역',siteArea:500,buildingArea:250,mainUse:'업무시설',auxUse:'판매시설',gfaAbove:800,gfaBelow:200,gfaTotal:1000,floorsAbove:8,floorsBelow:2,far:160,bcr:50,units:100}];
 p.reportProgress=Object.fromEntries(['preparation','permit','start','construction'].map(kind=>[kind,[{id:'PROGRESS-'+kind,date:'2026-01-01',title:'합성 '+kind,content:'독립 원문'}]]));
 p.landContracts=[{id:'LAND-CONTRACT-A',name:'합성 토지매매',seller:'민간 매도자',amount:500000000,contractDate:'2026-01-01'}];p.landPaymentSchedule=[{id:'LAND-PAYMENT-A',contractId:'LAND-CONTRACT-A',category:'계약금',amount:100000000,paid:false}];
 p.contracts=[{id:'PROTECTED-CONTRACT',amount:100000000}];p.vatRecords=[{id:'PROTECTED-VAT',amount:0}];
 const saved=A.report.saveSnapshot(p,{type:'plan',date:'2029-01-01',stageId:'current'}),fixed=A.domain.snapshot(p,'custom','독립 고정본','2026-10-23',A.areas.current(p),'QA/fixed');p.costStages.push(fixed);
 return{...h,A,p,saved,fixed,owner:()=>A.state.projects.find(row=>row.id===p.id)};
}
const entries=model=>model.blocks.flatMap(block=>[...(block.editableCells||[]).map(cell=>({block,row:null,cell,cellIndex:-1})),...(block.headers||[]).flatMap(row=>row.cells.map((cell,cellIndex)=>({block,row,cell,cellIndex}))),...(block.rows||[]).flatMap(row=>row.cells.map((cell,cellIndex)=>({block,row,cell,cellIndex})))]);
function all(h,context=ctx){return entries(h.A.reportForm.createEditorModel(h.A.report.reportData(h.owner(),context.date,context.stageId,{draftContext:context}),context.type,context.date));}
function put(h,find,value='変更',context=ctx){const target=all(h,context).find(find);assert(target?.cell.cellId,'actual visible model cell required');h.A.report.bufferCell(h.owner(),context,target.cell.cellId,value,{baseValue:target.cell.text});return target;}
const by=(source,index)=>entry=>entry.row?.sourceKey===source&&entry.cellIndex===index;
const binding=(kind,field)=>entry=>entry.cell.sourceBinding?.kind===kind&&entry.cell.sourceBinding.field===field;
const item=(h,mode='platform',context=ctx)=>h.A.report.reviewBufferedSave(h.owner(),context,mode).all[0];
// Independent expected labels are taken from the visible source row and the
// official report headings/units, not from adapter maps or implementation output.
const examples=[
 ['equity company',by('equities:EQUITY-A',1),'A출자사 · 회사명'],
 ['equity registration',by('equities:EQUITY-A',2),'A출자사 · 사업자등록번호'],
 ['equity amount',by('equities:EQUITY-A',3),'A출자사 · 출자금액(억원)'],
 ['equity purpose',by('equities:EQUITY-A',6),'A출자사 · 참여목적'],
 ['loan institution',by('loans-terms:LOAN-A',2),'A은행 선순위 본PF · 금융기관명'],
 ['loan commitment',by('loans-terms:LOAN-A',7),'A은행 선순위 본PF · 약정액(억원)'],
 ['loan ALL-IN',by('loans-terms:LOAN-A',8),'A은행 선순위 본PF · ALL-IN(연%)'],
 ['loan collateral',by('loans-terms:LOAN-A',13),'A은행 선순위 본PF · 담보 세부내용'],
 ['loan balance institution',by('loans-balances:LOAN-A',1),'A은행 선순위 본PF · 금융기관명'],
 ['loan balance',by('loans-balances:LOAN-A',4),'A은행 선순위 본PF · 잔액(억원)'],
 ['guarantor name',by('guarantors:GUARANTOR-A',1),'A보증기관 · 보증기관명'],
 ['guarantor amount',by('guarantors:GUARANTOR-A',4),'A보증기관 · 보증금액(억원)'],
 ['guarantor scope',by('guarantors:GUARANTOR-A',5),'A보증기관 · 보증범위'],
 ['permit report category',by('permits:PERMIT-A',0),'건축허가 · 보고 분류'],
 ['permit name',by('permits:PERMIT-A',2),'건축허가 · 인허가명'],
 ['permit application',by('permits:PERMIT-A',3),'건축허가 · 신청일'],
 ['permit approval',by('permits:PERMIT-A',5),'건축허가 · 승인일'],
 ['sale category',by('sales:SALE-A',0),'오피스 분양 · 구분'],
 ['sale total',by('sales:SALE-A',2),'오피스 분양 · 전체수량(호)'],
 ['sale planned',by('sales:SALE-A',4),'오피스 분양 · 계획수량(호)'],
 ['sale start',by('sales:SALE-A',5),'오피스 분양 · 분양·매각 개시일'],
 ['sale completed',by('sales:SALE-A',7),'오피스 분양 · 완료수량(호)'],
 ['sale amount',by('sales:SALE-A',8),'오피스 분양 · 분양·매각금액(억원)'],
 ['contractor name',by('contractors:CONTRACTOR-A',1),'A시공사 · 시공사명'],
 ['contractor registration',by('contractors:CONTRACTOR-A',2),'A시공사 · 사업자등록번호'],
 ['contractor date',by('contractors:CONTRACTOR-A',3),'A시공사 · 도급계약일'],
 ['contractor amount',by('contractors:CONTRACTOR-A',4),'A시공사 · 도급금액(억원)'],
 ['contractor period',by('contractors:CONTRACTOR-A',5),'A시공사 · 공사기간'],
 ['contractor credit',by('contractors:CONTRACTOR-A',10),'A시공사 · 그 밖의 신용보강'],
 ['trustee name',by('trustees:TRUSTEE-A',1),'A신탁사 · 신탁사명'],
 ['trustee code',by('trustees:TRUSTEE-A',2),'A신탁사 · 금융기관코드'],
 ['trustee type',by('trustees:TRUSTEE-A',4),'A신탁사 · 기타 신탁유형'],
 ['trustee period',by('trustees:TRUSTEE-A',5),'A신탁사 · 계약기간'],
 ['trustee fee',by('trustees:TRUSTEE-A',6),'A신탁사 · 신탁보수(억원)'],
 ['trustee credit',by('trustees:TRUSTEE-A',8),'A신탁사 · 신용보강 내용'],
 ['land-plan category',by('land-plan:LAND-PLAN-A',0),'상업용지 · 용지 구분'],
 ['land-plan area',by('land-plan:LAND-PLAN-A',1),'상업용지 · 면적(㎡)'],
 ['land-plan lots',by('land-plan:LAND-PLAN-A',3),'상업용지 · 필지수(개)'],
 ['building representative lot',binding('building-plans','representativeLot'),'합성동 1-1 · 대표 지번'],
 ['building total GFA',binding('building-plans','gfaTotal'),'합성동 1-1 · 연면적 합계(㎡)'],
 ['land payment amount',by('land-payments:LAND-PAYMENT-A',4),'합성 토지매매 계약금 · 지급회차 금액(억원)'],
 ['land payment paid',by('land-payments:LAND-PAYMENT-A',7),'합성 토지매매 계약금 · 지급 여부']
];
for(const kind of ['preparation','permit','start','construction'])for(const [index,label]of [[0,'날짜'],[1,'제목'],[2,'내용']])examples.push(['progress '+kind+' '+label,by('progress-'+kind+':PROGRESS-'+kind,index),'합성 '+kind+' · '+label]);
for(const[field,label]of [['zone','용도지역'],['siteArea','대지면적(㎡)'],['buildingArea','건축면적(㎡)'],['mainUse','주용도'],['auxUse','부속용도'],['gfaAbove','지상 연면적(㎡)'],['gfaBelow','지하 연면적(㎡)'],['floorsAbove','지상층수'],['floorsBelow','지하층수'],['far','용적률(%)'],['bcr','건폐율(%)'],['units','세대수(호수)']])examples.push(['building '+field,binding('building-plans',field),'합성동 1-1 · '+label]);
for(const[name,find,label]of examples)check('review target and Korean field: '+name,()=>{const h=fixture();put(h,find);const state=JSON.stringify(h.A.state),buffer=JSON.stringify(h.A.report.bufferedChanges(h.p,ctx));assert.equal(item(h).label,label);assert.equal(item(h,'report-only').label,label);assert.equal(JSON.stringify(h.A.state),state);assert.equal(JSON.stringify(h.A.report.bufferedChanges(h.p,ctx)),buffer);});
check('project building binding keeps actual project name and Korean unit without raw field',()=>{const h=fixture();h.p.reportBuildingPlans=[];put(h,binding('project-building','buildingArea'),'300');assert.equal(item(h).label,'REVIEW-A · 건축면적(㎡)');});
check('numeric loan classifications become known Korean names, not raw codes',()=>{const h=fixture();h.p.loans[0].rank=2;h.p.loans[0].type='2';put(h,by('loans-terms:LOAN-A',8),'7');assert.equal(item(h).label,'A은행 중순위 본PF · ALL-IN(연%)');});
check('same name different ID uses exact linked row rank, and original value is intact',()=>{const h=fixture();h.p.loans.push({...copy(h.p.loans[0]),id:'LOAN-B',rank:'후순위',allIn:8});put(h,by('loans-terms:LOAN-B',8),'9');const r=item(h);assert.equal(r.label,'A은행 후순위 본PF · ALL-IN(연%)');assert.equal(r.sourceBefore,8);assert.equal(h.p.loans[0].allIn,6.5);});
check('report-only blank leaves original6.5, saved report, frozen source, other projects unchanged',()=>{const h=fixture(),loan=JSON.stringify(h.p.loans),protectedBefore=JSON.stringify({fixed:h.fixed,saved:h.saved,cbs:h.p.cbs,contracts:h.p.contracts,vat:h.p.vatRecords,others:h.A.state.projects.filter(p=>p.id!=='REVIEW-A')});const e=put(h,by('loans-terms:LOAN-A',8),'');const r=h.A.report.saveBufferedChanges(h.p,ctx,{mode:'report-only',requestId:'only'});assert.equal(r.reportOnly[0].label,'A은행 선순위 본PF · ALL-IN(연%)');assert.equal(JSON.stringify(h.p.loans),loan);assert.equal(h.A.report.draftRecord(h.p,ctx).cellOverrides[e.cell.cellId],'');assert.equal(h.A.report.bufferedChanges(h.p,ctx).count,0);assert.equal(JSON.stringify({fixed:h.fixed,saved:h.saved,cbs:h.p.cbs,contracts:h.p.contracts,vat:h.p.vatRecords,others:h.A.state.projects.filter(p=>p.id!=='REVIEW-A')}),protectedBefore);});
for(const [raw,expected]of [['',null],['0',0],['7.25',7.25]])check('platform save keeps numeric/null semantics: '+JSON.stringify(raw),()=>{const h=fixture(),old=JSON.stringify({saved:h.saved,fixed:h.fixed,cbs:h.p.cbs,contracts:h.p.contracts,vat:h.p.vatRecords});put(h,by('loans-terms:LOAN-A',8),raw);h.A.report.saveBufferedChanges(h.p,ctx,{mode:'platform',requestId:'number-'+raw});assert.equal(h.owner().loans[0].allIn,expected);assert.equal(h.A.report.bufferedChanges(h.owner(),ctx).count,0);assert.equal(JSON.stringify({saved:h.saved,fixed:h.fixed,cbs:h.owner().cbs,contracts:h.owner().contracts,vat:h.owner().vatRecords}),old);assert.equal(h.saved.canonical.loans[0].allIn,6.5);});
check('commitment still uses1e8 scale, not label units for conversion',()=>{const h=fixture();put(h,by('loans-terms:LOAN-A',7),'12');const r=item(h);assert.equal(r.adapter.validate(r.after),1200000000);h.A.report.saveBufferedChanges(h.p,ctx,{mode:'platform',requestId:'amount'});assert.equal(h.owner().loans[0].commitment,1200000000);});
check('required principal invalid still rejects atomically and retains buffer',()=>{const h=fixture();put(h,by('loans-terms:LOAN-A',7),'');const before=JSON.stringify(h.A.state);assert.throws(()=>h.A.report.saveBufferedChanges(h.p,ctx,{mode:'platform',requestId:'invalid'}),/금액을 입력/);assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.A.report.bufferedChanges(h.owner(),ctx).count,1);});
check('good scalar Korean heading remains unchanged',()=>{const h=fixture(),e=all(h).find(e=>e.cell.editorFields?.length===1&&e.cell.editorFields[0].key==='project.name');assert(e);put(h,x=>x.cell.cellId===e.cell.cellId,'새 사업명');assert.equal(item(h).label,e.cell.editorFields[0].label);});
check('new nominal-rate binding identifies the exact source and Korean field',()=>{const h=fixture();put(h,by('loans-terms:LOAN-A',9),'10');const r=item(h);assert.equal(r.adapter.kind,'loan');assert.equal(r.target,'금융 원장');assert.equal(r.label,'A은행 선순위 본PF · 금리(연%)');assert.equal(h.p.loans[0].allIn,6.5);});
check('unmapped repeated composite fee field stays report-only with known section purpose, not guessed platform owner',()=>{const h=fixture(),e=put(h,by('loans-terms:LOAN-A',10),'10');const r=item(h);assert.equal(r.adapter,null);assert.equal(r.target,'보고서 작성본');assert.equal(r.label,e.block.title);assert.equal(h.p.loans[0].allIn,6.5);});
check('frozen building cell does not reverse-map to current building owner',()=>{const h=fixture(),context={...ctx,stageId:h.fixed.id};h.fixed.reportBuildingPlans=copy(h.p.reportBuildingPlans);const e=put(h,binding('building-plans','gfaTotal'),'1200',context),r=item(h,'platform',context);assert.equal(r.adapter,null);assert.equal(r.target,'보고서 작성본');assert.equal(h.p.reportBuildingPlans[0].gfaTotal,1000);assert(r.label===e.cell.editorFields?.[0]?.label||r.label===e.block.title);});
for(const [unit,index,label]of [['㎡',1,'전체수량(㎡)'],['동',3,'계획수량(동)'],['필지',7,'완료수량(필지)']])check('sale quantity uses actual source unit: '+unit,()=>{const h=fixture();h.p.sales[0].unit=unit;put(h,by('sales:SALE-A',index),'50');assert.equal(item(h).label,'오피스 분양 · '+label);});
check('missing names never leak source ID or fabricate a different target',()=>{const h=fixture();delete h.p.loans[0].institution;h.p.loans[0].rank=99;h.p.loans[0].type=88;put(h,by('loans-terms:LOAN-A',8),'7');assert.equal(item(h).label,'ALL-IN(연%)');assert.equal(item(h).sourceBefore,6.5);});
for(const rank of ['constructor','toString','__proto__'])check('classification retains literal input rather than inherited object property: '+rank,()=>{const h=fixture();h.p.loans[0].rank=rank;const before=JSON.stringify(h.A.state);put(h,by('loans-terms:LOAN-A',8),'7');assert.equal(item(h).label,'A은행 '+rank+' 본PF · ALL-IN(연%)');assert.equal(h.p.loans[0].rank,rank);assert.equal(h.p.loans[0].allIn,6.5);assert.equal(JSON.stringify(h.A.state),before);});
export {fixture,examples,ctx,put,item};
const changed=files.filter(file=>sha(fs.readFileSync(file))!==pins[file]);assert.deepEqual(changed,[]);const result={suite:'continuation125-report-review-labels',pins,sourceChanged:changed,passed:checks.filter(c=>c.status==='passed').length,failed:checks.filter(c=>c.status==='failed').length,checks,privateFixtureRequired:false,actualDatabase:false,actualNetwork:false,actualBrowser:false,publicReportBufferReviewSave:true};console.log(JSON.stringify(result));if(result.failed)process.exitCode=1;
