import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';

// Independent expectations come from the approved stale-edit and real-parent
// rules, not the current implementation. This is a memory-only integration
// harness: no browser, API, credentials, production state, or database is used.
const modules=['core','cbs','contracts','legal','permit-views','report-form','report','demo','setup'];
const files=['src/core.js','src/legal.js','src/report.js','src/setup.js','src/permit-views.js'];
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pins=Object.fromEntries(files.map(file=>[file,hash(file)]));
const fixture=()=>{const h=makeHarness({modules});for(const init of h.A.initializers)init(h.A.state);return h;};
const action=(h,name,data={})=>h.listeners.click[0]({target:{closest:()=>({dataset:{action:name,...data}})},preventDefault(){}});
const snapshot=A=>JSON.stringify(A.state);
const checks=[];
async function check(name,fn){try{await fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',error:error.message});}}
function alter(rows,row,mode){const i=rows.indexOf(row);if(mode==='removed')rows.splice(i,1);else if(mode==='deleted')row.deletedAt='2026-10-20T00:00:00.000Z';else rows[i]={...row,...('actual'in row?{actual:45}:'name'in row?{name:'다른 담당자가 수정한 이름'}:'status'in row?{status:'date'in row?'확정':'검토 중'}:{}),marker:'replacement'};}
async function rejectWithoutWrite(A,values){A.formEditor.setValues(values);const before=snapshot(A);assert.equal(await A.formEditor.submit(),false,'stale edit must be rejected, not acknowledged as saved');assert.equal(snapshot(A),before,'business rows, audit and notifications must all remain unchanged');assert.deepEqual(JSON.parse(JSON.stringify(A.formEditor.values())),JSON.parse(JSON.stringify(values)),'rejected input must remain available');}
async function acceptLiveEdit(A,values){A.formEditor.setValues(values);const count=A.state.auditEvents.length;assert.equal(await A.formEditor.submit(),true,'a valid live edit must continue to save');assert.equal(A.state.auditEvents.length,count+1);}

await check('live progress edit still saves exactly one record and audit',async()=>{const h=fixture(),A=h.A,p=A.current();p.progressHistory=[{id:'ind-live',date:'2026-08-31',planned:10,actual:8}];action(h,'progress-record-edit',{id:'ind-live'});await acceptLiveEdit(A,{date:'2026-08-31',planned:'12',actual:'9'});assert.equal(A.current().progressHistory.length,1);assert.equal(A.current().progressHistory[0].actual,9);});
await check('equal-content progress clone is not treated as a conflict merely for object identity',async()=>{const h=fixture(),A=h.A,p=A.current();p.progressHistory=[{id:'ind-live',date:'2026-08-31',planned:10,actual:8}];action(h,'progress-record-edit',{id:'ind-live'});p.progressHistory=p.progressHistory.map(row=>({...row}));await acceptLiveEdit(A,{date:'2026-08-31',planned:'12',actual:'9'});assert.equal(A.current().progressHistory[0].actual,9);});

for(const mode of ['removed','deleted','replaced'])await check('progress edit '+mode+' target cannot create, resurrect or overwrite a record',async()=>{
 const h=fixture(),A=h.A,p=A.current(),row={id:'ind-progress',date:'2026-08-31',planned:10,actual:8};p.progressHistory=[row];action(h,'progress-record-edit',{id:row.id});alter(p.progressHistory,row,mode);await rejectWithoutWrite(A,{date:'2026-08-31',planned:'12',actual:'9'});
});
await check('explicit missing progress edit ID does not open an add form',()=>{const h=fixture();action(h,'progress-record-edit',{id:'missing-progress'});assert.equal(h.A.formEditor.snapshot(),null);assert.equal(h.nodes.get('app-dialog').open,false);});
await check('intentional first edit of the projected progress baseline is still supported',async()=>{
 const h=fixture(),A=h.A,p=A.current();p.progressHistory=[];p.progressAsOf='2026-08-31';p.construction.plannedProgress=10;p.construction.actualProgress=8;const id='progress-baseline-'+p.id;action(h,'progress-record-edit',{id});A.formEditor.setValues({date:'2026-08-31',planned:'11',actual:'9'});assert.equal(await A.formEditor.submit(),true);assert.equal(A.current().progressHistory.filter(row=>!row.deletedAt).length,1);assert.equal(A.current().progressHistory[0].id,id);assert.equal(A.current().progressHistory[0].actual,9);
});

for(const kind of ['legacy','snapshot'])for(const mode of ['removed','deleted','replaced'])await check('report status '+kind+' '+mode+' target has no ghost audit or overwrite',async()=>{
 const h=fixture(),A=h.A,p=A.current(),key=kind==='legacy'?'reports':'reportSnapshots',row={id:'ind-report',date:'2026-08-31',type:'quarter',status:'작성본'};p[key]=[row];action(h,'report-history-edit',{id:row.id,kind});alter(p[key],row,mode);await rejectWithoutWrite(A,{status:'검토 중',submitted:'',receipt:''});
});
await check('live report status edit still saves its row and one audit',async()=>{const h=fixture(),A=h.A,p=A.current();p.reports=[{id:'ind-live',date:'2026-08-31',type:'quarter',status:'작성본'}];action(h,'report-history-edit',{id:'ind-live',kind:'legacy'});await acceptLiveEdit(A,{status:'검토 중',submitted:'',receipt:''});assert.equal(A.current().reports[0].status,'검토 중');});
await check('equal-content report clone remains editable',async()=>{const h=fixture(),A=h.A,p=A.current();p.reports=[{id:'ind-live',date:'2026-08-31',type:'quarter',status:'작성본'}];action(h,'report-history-edit',{id:'ind-live',kind:'legacy'});p.reports=p.reports.map(row=>({...row}));await acceptLiveEdit(A,{status:'검토 중',submitted:'',receipt:''});assert.equal(A.current().reports[0].status,'검토 중');});

function lawFixture(){const h=fixture(),A=h.A,c={id:'ind-change',lawId:'ind-law',title:'독립 검토',announcedAt:'2026-10-01',effectiveAt:'2026-10-20',summary:'검토'},i={id:'ind-impact',changeId:c.id,projectId:A.current().id,status:'미검토',active:true};A.state.lawChanges.push(c);A.state.projectLawImpacts.push(i);return {...h,c,i};}
await check('live law review still saves one audit on the same impact',async()=>{const h=lawFixture(),A=h.A;A.legal.lawDetail(h.c);action(h,'legal-law-review',{id:h.i.id});await acceptLiveEdit(A,{status:'검토 완료',reviewer:'독립 검토자',note:'현재 대상 검토'});assert.equal(A.state.projectLawImpacts.find(i=>i.id===h.i.id).status,'검토 완료');});
await check('equal-content law impact clone remains editable',async()=>{const h=lawFixture(),A=h.A;A.legal.lawDetail(h.c);action(h,'legal-law-review',{id:h.i.id});A.state.projectLawImpacts=A.state.projectLawImpacts.map(row=>({...row}));await acceptLiveEdit(A,{status:'검토 완료',reviewer:'독립 검토자',note:'동등 복제 대상 검토'});assert.equal(A.state.projectLawImpacts.find(i=>i.id===h.i.id).status,'검토 완료');});
for(const mode of ['removed','deleted','replaced','inactive'])await check('law review '+mode+' impact is not silently updated',async()=>{
 const h=lawFixture(),A=h.A;A.legal.lawDetail(h.c);action(h,'legal-law-review',{id:h.i.id});if(mode==='inactive')h.i.active=false;else alter(A.state.projectLawImpacts,h.i,mode);await rejectWithoutWrite(A,{status:'검토 완료',reviewer:'독립 검토자',note:'변경되지 않은 대상만 저장'});
});

const validPermit=()=>({id:'ind-permit',name:'독립검증 건축허가',group:'건축·심의',reportCategory:'건축허가',agency:'검증기관',stage:'미신청',handling:'별도 진행',requestType:'최초',reportTrigger:'아님',plannedApplication:'2026-10-21',expected:'2026-11-20',sourcePath:'공유폴더/검증',actionItems:[]});
await check('live permit edit remains a single permit with no extra created row',async()=>{const h=fixture(),A=h.A,p=A.current(),row=validPermit();row.reportCategory=A.legal.reportCategories[0];p.permits=[row];action(h,'legal-edit',{type:'permit',id:row.id});await acceptLiveEdit(A,{...row,name:'현재 대상 수정'});assert.equal(A.current().permits.length,1);assert.equal(A.current().permits[0].name,'현재 대상 수정');});
await check('equal-content permit clone remains editable without mutating a detached row',async()=>{const h=fixture(),A=h.A,p=A.current(),row=validPermit();row.reportCategory=A.legal.reportCategories[0];p.permits=[row];action(h,'legal-edit',{type:'permit',id:row.id});p.permits=p.permits.map(item=>A.clone(item));await acceptLiveEdit(A,{...row,name:'동등 복제 대상 수정'});assert.equal(A.current().permits[0].name,'동등 복제 대상 수정');});
for(const mode of ['removed','deleted','replaced'])await check('permit edit '+mode+' target cannot write a detached or replacement record',async()=>{
 const h=fixture(),A=h.A,p=A.current(),row=validPermit();row.reportCategory=A.legal.reportCategories[0];A.legal.validatePermit(row,[row]);p.permits=[row];action(h,'legal-edit',{type:'permit',id:row.id});const values={...row,name:'수정한 인허가'};alter(p.permits,row,mode);await rejectWithoutWrite(A,values);
});
await check('explicit missing amendment ID never turns into a new permit form',()=>{const h=fixture();action(h,'legal-permit-amend',{id:'missing-permit'});assert.equal(h.A.formEditor.snapshot(),null);assert.equal(h.nodes.get('app-dialog').open,false);});

for(const [type,key,values]of [
 ['parcel','landParcels',{name:'검증 필지',area:'100',owner:'검증 소유자',right:'검토 중',sourcePath:'공유폴더/필지'}],
 ['landContract','landContracts',{name:'검증 계약',seller:'매도자',amount:'1000',contractDate:'2026-08-01',balanceDate:'2026-09-01',sourcePath:'공유폴더/계약'}],
 ['landPayment','landPaymentSchedule',{contractId:'ind-contract',category:'계약금',amount:'1000',fundingState:'미확정',equityAmount:'',debtAmount:'',plannedDate:'2026-08-01',actualDate:'',paid:'미지급',sourcePath:'공유폴더/지급'}],
 ['sale','sales',{category:'검증매각',unit:'호',total:'10',planned:'10',completed:'0',start:'',amount:'0',sourcePath:'공유폴더/매각'}]
])await check(type+' edit removed target cannot acknowledge a ghost save',async()=>{
 const h=fixture(),A=h.A,p=A.current(),row={id:'ind-'+type,...values};p[key]=[row];action(h,'legal-edit',{type,id:row.id});p[key]=[];await rejectWithoutWrite(A,values);
});

await check('input review candidate replaced with another field is not reviewed using stale displayed values',async()=>{
 const h=fixture(),A=h.A,p=A.current(),row={id:'ind-candidate',key:'building.gfaTotal',label:'연면적',type:'number',value:100,status:'pending',source:'검증',choices:[]};p.inputDataReviews=[row];p.initialization={...(p.initialization||{}),candidates:[]};p.preservedInputCandidates=[];action(h,'setup-review-all');p.inputDataReviews[0]={...row,key:'building.siteArea',label:'대지면적',value:200};await rejectWithoutWrite(A,{'review_action_ind-candidate':'defer'});
});
await check('selected already-confirmed input source changed after opening is not silently substituted',async()=>{
 const h=fixture(),A=h.A,p=A.current(),target={id:'ind-target',key:'building.gfaTotal',label:'연면적',type:'number',value:100,status:'pending',source:'검토 대상',choices:[]},source={id:'ind-source',key:'building.gfaTotal',label:'연면적',type:'number',value:300,status:'confirmed',source:'선택할 근거',choices:[]};p.inputDataReviews=[target,source];p.initialization={...(p.initialization||{}),candidates:[]};p.preservedInputCandidates=[];action(h,'setup-review-all');source.value=999;await rejectWithoutWrite(A,{'review_action_ind-target':'confirm','basis_ind-target':'candidate:ind-source'});
});
await check('input add cannot save an orphaned candidate after its owning project was removed',async()=>{
 const h=fixture(),A=h.A,p=A.current();action(h,'setup-add');A.state.projects=A.state.projects.filter(row=>row.id!==p.id);await rejectWithoutWrite(A,{key:'name',value:'검증 입력값',evidenceSource:'검증 자료',evidenceLocation:'검증 위치',evidenceAsOf:'2026-10-20',evidencePath:'공유폴더/검증'});
});

const changedDuringRun=files.filter(file=>hash(file)!==pins[file]);
console.log(JSON.stringify({suite:'center120-parent-independent',checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,pins,changedDuringRun,actualBrowser:false,actualDatabaseUsed:false}));
if(checks.some(x=>x.status==='failed')||changedDuringRun.length)process.exitCode=1;
