import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';
// LOCAL-UI-260: isolated in-memory fixtures only; no browser or production writes.
const seed=JSON.parse(fs.readFileSync('deployment/review-data/workspace.json','utf8'));
const h=makeHarness({seed,modules:['core','cbs','vat','contracts','legal','permit-map','report-form','report']}),A=h.A;
for(const init of A.initializers)init(A.state);
A.boot();A.render=()=>{};const p=A.state.projects[0];A.ui.projectId=p.id;
assert.equal(typeof A.report.reasonField,'function');assert.equal(typeof A.report.progressPanel,'function');
const untouched=JSON.stringify([p.reportHistory,p.reportSnapshots,p.reportDrafts]);
p.construction={...p.construction,startDelayReason:'이전 원문 사유'};
const reasonReq={entity:'reportReason',projectId:p.id,id:p.id,field:'construction.startDelayReason',value:['이전 원문 사유','자금조달 등 금융문제'],capabilityBasis:{before:'이전 원문 사유'}};
const html=A.report.reasonField(p,'construction','startDelayReason');assert(html.includes('data-inline-command="edit"'));assert(html.includes('이전 원문 사유'));
A.commitInline(reasonReq);assert.equal(JSON.stringify(p.construction.startDelayReason),JSON.stringify(reasonReq.value));assert.equal(p.reportFieldHistory.at(-1).before,'이전 원문 사유');
assert.throws(()=>A.commitInline(reasonReq),/변경되었습니다/);
assert.throws(()=>A.commitInline({...reasonReq,value:['임의 사유'],capabilityBasis:{before:reasonReq.value}}),/공식 사유/);
assert.throws(()=>A.parseInlineValue('report-reasons','["중복","중복"]'),/선택/);
assert.equal(JSON.stringify([p.reportHistory,p.reportSnapshots,p.reportDrafts]),untouched);
let form;A.form=(title,fields,save,label,options)=>{form={title,fields,save,options}};A.confirmDelete=(title,save)=>{form={save}};
const click=(action,data={})=>h.listeners.click[0]({target:{closest:()=>({dataset:{action,...data}})},preventDefault(){}});
for(const kind of ['permit','start','construction']){
 p.reportForm={...p.reportForm,[kind==='permit'?'permitProgress':kind==='start'?'startProgress':'constructionProgress']:'보존할 원문'};
 const panel=A.report.progressPanel(p,kind,undefined,{includeLegacy:true});assert(panel.includes('보존할 원문'));assert(panel.includes('report-progress-legacy-edit'));assert(panel.includes('report-progress-add'));
 click('report-progress-add',{kind});form.save({date:'2026-11-23',title:'검토',content:'격리 검사'});
 let row=p.reportProgress[kind].at(-1);assert(A.report.progressPanel(p,kind).includes('report-progress-edit'));
 click('report-progress-edit',{kind,id:row.id});form.save({date:'2026-11-23',title:'수정 검토',content:'격리 검사 수정'});assert.equal(row.title,'수정 검토');
 click('report-progress-legacy-edit',{kind});form.save({value:'원문 보존 수정'});assert.equal(p.reportForm[kind==='permit'?'permitProgress':kind==='start'?'startProgress':'constructionProgress'],'원문 보존 수정');
 click('report-progress-edit',{kind,id:row.id});row.deletedAt='2026-11-23';const count=p.reportProgress[kind].length;assert.throws(()=>form.save({date:'2026-11-23',title:'삭제된 항목',content:'추가 금지'}));assert.equal(p.reportProgress[kind].length,count);
}
assert.equal(JSON.stringify([p.reportHistory,p.reportSnapshots,p.reportDrafts]),untouched);
const project={id:p.id,permitMapStart:'2026-01',permits:[{id:'timeline',name:'타임라인',plannedApplication:'2026-01-01',expected:'2026-03-01',application:'2026-01-02',approval:'2026-02-01',rounds:[{id:'r1',kind:'application',date:'2026-01-02'},{id:'r2',kind:'supplement',date:'2026-01-15'},{id:'r3',kind:'resubmission',date:'2026-01-30'},{id:'r4',kind:'approval',date:'2026-02-01'},{id:'r5',kind:'review',date:'2026-02',note:'월 정밀도'},{id:'deleted',kind:'review',date:'2026-02-03',deletedAt:'2026-02-04'}]}]};
A.ui.permitMapWindows={};let map=A.permitMap.mapProjection(project);assert.equal(map.axis.dayCount,365);assert.equal(map.axis.zoom,'week');assert.equal(map.rows[0].events.filter(x=>x.date==='2026-01-02').length,1);assert(!map.rows[0].events.some(x=>x.sourceId==='deleted'));assert.equal(map.rows[0].events.find(x=>x.sourceId==='r5').precision,'month');assert.equal(A.permitMap.isoWeek('2021-01-01').year,2020);assert.equal(A.permitMap.isoWeek('2021-01-01').week,53);
A.ui.permitMapWindows[p.id]={startMonth:'2024-01',zoom:'month'};map=A.permitMap.mapProjection(project);assert.equal(map.axis.dayCount,366);assert.equal(map.axis.zoom,'month');
A.ui.permitMapWindows[p.id]={startMonth:'2026-01',zoom:'week'};const rendered=A.permitMap.render(project);assert(rendered.includes('data-permit-event-id="r3"'));assert(rendered.includes('data-permit-time-axis'));assert(rendered.includes('2026.02 (월)'));assert(!rendered.includes('data-permit-event-id="r5"'));project.permits.push({id:'empty',name:'빈 일정'});assert(A.permitMap.render(project).includes('날짜 미입력'));
console.log('PASS report multiple reasons, stale reason guard, archived data preservation, progress add/edit/legacy/stale-delete boundaries, timeline actual rounds/dedup/month precision/ISO week/leap year/render');

// Display formatting must never alter stored ISO dates or event navigation keys.
const dateProject={id:'date-format-test',permits:[{id:'date-permit',name:'일정',plannedApplication:'2025-08-01',expected:'2025-10-01',rounds:[{id:'month-only',kind:'review',date:'2025-09'}]}]};
const beforeDates=JSON.stringify(dateProject);
for(const zoom of ['week','month']){
 A.ui.permitMapWindows[dateProject.id]={zoom};
 const output=A.permitMap.render(dateProject);
 assert(output.includes('2025.08 ~ 2026.07'));
 assert(output.includes('2025.08.01 ~ 2025.10.01'));
 assert(output.includes('title="계획 신청 2025.08.01"'));
 assert(output.includes('2025.09 (월)'));
 assert(output.includes('data-permit-event-date="2025-08-01"'));
 assert(output.includes('data-permit-month="2025-08"'));
 for(const attrs of output.matchAll(/(?:title|aria-label)="([^"]*)"/g))assert(!/\d{4}-\d{2}/.test(attrs[1]),attrs[1]);
 assert(!/\d{4}-\d{2}/.test(output.replace(/<[^>]*>/g,'')));
 assert.equal(A.permitMap.mapProjection(dateProject).months[0],'2025-08');
 assert.equal(JSON.stringify(dateProject),beforeDates);
}
console.log('PASS month/week displayed dates and tooltips use dots; source dates, navigation attributes and projection remain ISO');
