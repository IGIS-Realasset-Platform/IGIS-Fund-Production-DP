import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';

const sha=value=>createHash('sha256').update(value).digest('hex');
const files=['src/audit-view.js','src/cbs.js','src/cost-breakdown.js','src/recovery-views.js','src/cost-snapshots.js','scripts/complete-approved-samples.mjs'];
const sourcePins=Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(file))]));
const marker={
 projectId:'TEST-20261016-A',kind:'user-approved-html-fixture',batchId:'20261016-abc',
 source:'QA/사용자요청-가상A-분해예시',
 changed:'정식 배포 검수: 가상 A 하위 비용 1원 저장 후 원금액 복원 예정',
 restored:'정식 배포 검수 완료: 1원 저장·재접속 확인 후 원금액 복원',
 setup:'사용자 요청 가상 A사업 하위분해 예시. 실제 계약/제공 Cost Tracker 금액을 이관한 것이 아닙니다.'
};
const clean=value=>String(value).replace(/<[^>]*>/g,' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#39;',"'").replace(/\s+/g,' ').trim();
const tableRows=html=>[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(match=>[...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(cell=>clean(cell[1])));
function fixture(options={}){
 const p={id:options.projectId||marker.projectId,name:'독립 합성 사업',testData:{kind:marker.kind,batchId:marker.batchId},basic:{},building:{gfaTotal:100},cbs:[{id:'history-root',name:'도급공사비',code:'2',parentId:null,current:null,initial:null},{id:'history-parent',name:'철거·잔존물 처리',code:'2.1',parentId:'history-root',current:6253850000,initial:6253850000,costBreakdown:{version:1,childIds:['history-child-a','history-child-b']}},{id:'history-child-a',name:'가상 예시 · 원계약 범위',code:'2.1.B1',parentId:'history-parent',breakdownParentId:'history-parent',current:6000000000,initial:null},{id:'history-child-b',name:'가상 예시 · 추가 범위',code:'2.1.B2',parentId:'history-parent',breakdownParentId:'history-parent',current:253850000,initial:null}],costStages:[],contracts:[{id:'preserved-contract',amount:10}],vatRecords:[{id:'preserved-vat',amount:0}],reportSnapshots:[{id:'preserved-report',canonical:{reportTotals:{total:6253850000}}}]};
 if(options.testData===null)delete p.testData;else if(options.testData)p.testData=options.testData;
 const base={projectId:p.id,entity:'cbs',actor:'isolated-review@example.invalid',at:'2026-10-22T02:11:00Z'};
 const change=(id,reason,beforeAmount,afterAmount)=>({...base,id,idRef:'history-child-b',action:'COST_BREAKDOWN_UPDATE',before:{id:'history-child-b',name:'가상 예시 · 추가 범위',current:beforeAmount,parentAmount:6000000000+beforeAmount},after:{id:'history-child-b',name:'가상 예시 · 추가 범위',current:afterAmount,parentAmount:6000000000+afterAmount,reason,sourcePath:marker.source}});
 const restore=change('synthetic-internal-restoration',marker.restored,253850001,253850000),changed=change('synthetic-internal-change',marker.changed,253850000,253850001);
 const activate={...base,id:'synthetic-setup-activation',idRef:'history-parent',action:'COST_BREAKDOWN_ACTIVATE',before:{id:'history-parent',name:'철거·잔존물 처리',amount:6253850000},after:{id:'history-parent',name:'철거·잔존물 처리',amount:6253850000,reason:marker.setup,sourcePath:marker.source}};
 const children=[['history-child-a','가상 예시 · 원계약 범위',6000000000],['history-child-b','가상 예시 · 추가 범위',253850000]].map(([id,name,current],index)=>({...base,id:'synthetic-setup-'+index,idRef:id,action:'COST_BREAKDOWN_CREATE',before:null,after:{id,name,current,parentId:'history-parent',parentAmount:6253850000,reason:marker.setup,sourcePath:marker.source}}));
 const ordinary=change('synthetic-user-change','계약범위 추가에 따른 변경',253850000,253850010);ordinary.after.sourcePath='업무근거/변경계약.pdf';
 const h=makeHarness({modules:['core','cbs','audit-view','recovery-views','cost-snapshots'],seed:{version:'0.12.4',projects:[p],currentProjectId:p.id,auditEvents:options.events||[restore,changed,activate,...children,ordinary],notifications:[],entities:[]}});
 const result={...h,p:h.A.current(),restore,changed,activate,children,ordinary,change};
 result.action=(name,data={})=>h.listeners.click[0]({target:{closest:()=>({dataset:{action:name,...data}})},preventDefault(){}});
 result.html=()=>h.nodes.get('app-dialog').innerHTML;
 result.render=events=>h.A.auditPresentation.renderCostHistory(events||h.A.state.auditEvents,{project:result.p});
 return result;
}
const checks=[];
function check(id,name,fn){try{fn();checks.push({id,name,status:'passed'});}catch(error){checks.push({id,name,status:'failed',errorType:error?.name||'Error',expectedBehavior:name});}}

check('CH125-01','ordinary history does not expose exact internal restoration event',()=>{const h=fixture(),html=h.render([h.restore]);assert(!html.includes(marker.restored));assert(!html.includes('가상 예시 · 추가 범위'));assert.equal(tableRows(html).slice(1).filter(row=>row.length===7).length,0,'standard colspan empty-state is not an event data row');});
check('CH125-02','ordinary history does not expose exact internal one-won test event',()=>{const h=fixture(),html=h.render([h.changed]);assert(!html.includes(marker.changed));assert(!html.includes('가상 예시 · 추가 범위'));assert.equal(tableRows(html).slice(1).filter(row=>row.length===7).length,0,'standard colspan empty-state is not an event data row');});
check('CH125-03','initial breakdown events remain with original exact amounts but no internal setup prose or QA evidence path',()=>{const h=fixture(),html=h.render([h.activate,...h.children]),rows=tableRows(html);assert(!html.includes(marker.setup));assert(!html.includes(marker.source));assert.equal(rows.length,4);assert(rows.some(row=>row[1]==='—'&&row[2].includes('60억원')));assert(rows.some(row=>row[1]==='—'&&row[2].includes('253,850,000원')));});
check('CH125-04','real business QA reason and real one-won delta remain visible',()=>{const h=fixture(),event=h.change('user-qa','설계 QA 검토 후 정산 오차 1원 조정',253850000,253850001);event.after.sourcePath='QA/정산서.pdf';const html=h.render([event]);assert(html.includes(event.after.reason));assert(html.includes(event.after.sourcePath));assert(clean(html).includes('증가 1원'));assert(html.includes('253,850,001원'));});
check('CH125-05','almost matching evidence path is not classified as the internal operation',()=>{const h=fixture(),event=structuredClone(h.restore);event.after.sourcePath=marker.source+'-사용자추가';assert(h.render([event]).includes(marker.restored));});
check('CH125-06','same words in a real project without approved fixture identity remain user data',()=>{const h=fixture({projectId:'REAL-SYNTHETIC-PROJECT',testData:null});assert(h.render([h.restore]).includes(marker.restored));});
check('CH125-07','approved project id alone without fixture provenance is insufficient to hide an event',()=>{const h=fixture({testData:null});assert(h.render([h.restore]).includes(marker.restored));});
check('CH125-08','mismatching fixture batch cannot suppress a reason',()=>{const h=fixture({testData:{kind:marker.kind,batchId:'another-batch'}});assert(h.render([h.restore]).includes(marker.restored));});
check('CH125-09','same marker text on a non-breakdown action is not silently discarded',()=>{const h=fixture(),event={...h.restore,action:'UPDATE'};assert(h.render([event]).includes(marker.restored));});
check('CH125-10','owner original audit detail preserves complete original reason and evidence',()=>{const h=fixture(),html=h.A.auditPresentation.renderDetail(h.restore);assert(html.includes(marker.restored));assert(html.includes(marker.source));});
check('CH125-11','view and close preserve raw audit, amounts, fixed report, contracts, VAT and all local storage',()=>{const h=fixture(),before=JSON.stringify(h.A.state),storage=JSON.stringify([...h.storage]);h.action('cbs-history',{id:'history-parent'});h.A.requestModalClose();assert.equal(JSON.stringify(h.A.state),before);assert.equal(JSON.stringify([...h.storage]),storage);assert.equal(h.A.domain.costHistory(h.p,'__total__').length,h.A.state.auditEvents.length);});
check('CH125-12','first project history popup shares the exact internal-event exclusion',()=>{const h=fixture();h.action('project-history');assert(!h.html().includes(marker.restored));assert(!h.html().includes(marker.changed));assert(h.html().includes('계약범위 추가에 따른 변경'));});
check('CH125-13','legacy user reason mentioning QA remains intact and historical label is retained',()=>{const h=fixture(),event={id:'legacy-synthetic',projectId:h.p.id,entity:'cbs',action:'LEGACY_UPDATE',idRef:'history-child-b',field:'budget',label:'당시 원가명',type:'money',before:10,after:11,reason:'QA 검토 1원 차이 사유',source:'QA/실제정산.pdf',at:'2026-08-01T00:00:00Z'};const html=h.render([event]);for(const expected of [event.reason,event.source,event.label,'증가 1원'])assert(clean(html).includes(expected));});
check('CH125-14','mixed project input is rejected instead of hidden as an internal event',()=>{const h=fixture(),event={...h.restore,projectId:'OTHER-PROJECT'};assert.throws(()=>h.render([event]),/다른 프로젝트/);});
check('CH125-15','comparison and comparison workbook do not repeat internal test prose while preserving independent current/saved amounts',()=>{const h=fixture();
 // Only the unrelated monetary projection and binary ZIP writer are boundary stubs.
 // Actual comparisonEvents/comparison/exportComparison code consumes current raw events.
 h.A.domain.costExcelProjection=p=>({rows:[{id:'history-child-b',kind:'cost',name:'합성 단일 입력행',parentId:'history-parent',level:1,values:[{columnId:'current',rawWon:p.cbs.find(row=>row.id==='history-child-b').current}]}]});
 h.A.companyCostProfile=undefined;h.A.costReadScope=undefined;h.A.costExcel={mime:'application/octet-stream',buildXlsx:()=>new Uint8Array()};
 const prior=structuredClone(h.p);prior.cbs.find(row=>row.id==='history-child-b').current=253850000;
 h.p.cbs.find(row=>row.id==='history-child-b').current=253850010;
 const snapshot={metadata:{capturedAt:'2026-10-21T00:00:00Z',label:'독립 합성 기준',asOfDate:'2026-10-21'},payload:{project:prior}},before=JSON.stringify(h.A.state),result=h.A.costSnapshots.comparison(snapshot,h.p),exported=h.A.costSnapshots.exportComparison(snapshot,h.p,{download:false});
 assert.equal(result.length,1);assert.equal(result[0].before,253850000);assert.equal(result[0].after,253850010);assert.equal(result[0].delta,10);assert(result[0].reason.includes('계약범위 추가에 따른 변경'));assert(!result[0].reason.includes(marker.restored));assert(!result[0].reason.includes(marker.changed));assert(!result[0].reason.includes(marker.setup));assert(!JSON.stringify(exported.model).includes(marker.restored));assert.equal(JSON.stringify(h.A.state),before);
});
check('CH125-16','overview recent five are chosen after internal-event exclusion so the next real reason remains visible',()=>{const h=fixture(),source=fs.readFileSync('src/recovery-views.js','utf8'),matched=source.match(/ function history\(p,limit,inDialog=false\)\{[^\n]+\}/);assert(matched,'existing exact private history function must be found');const history=vm.runInContext('(function(A){'+matched[0]+';return history})(App)',h.context);assert(history(h.p,5).includes('계약범위 추가에 따른 변경'));});
check('CH125-17','missing event project identity cannot be treated as the approved internal record',()=>{const h=fixture(),event=structuredClone(h.restore);delete event.projectId;assert(h.render([event]).includes(marker.restored));});
check('CH125-18','missing target identity cannot be treated as the approved internal record',()=>{const h=fixture(),event=structuredClone(h.restore);delete event.idRef;delete event.before.id;delete event.after.id;assert(h.render([event]).includes(marker.restored));});
check('CH125-19','a conflicting explicit user reason has precedence over an old internal after.reason',()=>{const h=fixture(),event={...h.restore,reason:'사용자가 보완한 실제 변경사유',source:'업무근거/사용자확인.pdf'};const html=h.render([event]);assert(html.includes(event.reason));assert(html.includes(event.source));});
check('CH125-20','another approved sample project is not silently included in the exact A-only rule',()=>{const h=fixture({projectId:'TEST-20261016-B'});assert(h.render([h.restore]).includes(marker.restored));});
check('CH125-21','first-breakdown reason is not rewritten when the exact source marker is absent',()=>{const h=fixture(),event=structuredClone(h.activate);event.after.sourcePath='업무근거/설계분해표.xlsx';assert(h.render([event]).includes(marker.setup));assert(h.render([event]).includes(event.after.sourcePath));});
check('CH125-22','spacing-similar setup prose is user data, not the exact prepared-factory text',()=>{const h=fixture(),event=structuredClone(h.activate);event.after.reason=marker.setup.replace('A사업','A 사업');assert(h.render([event]).includes(event.after.reason));});
check('CH125-23','business-cost detail uses the same exclusion while owner raw detail remains unchanged',()=>{const h=fixture(),before=JSON.stringify(h.A.state),business=h.A.auditPresentation.renderDetail(h.restore,{project:h.p,costHistory:true}),raw=h.A.auditPresentation.renderDetail(h.restore);assert(!business.includes(marker.restored));assert(!business.includes(marker.source));assert(raw.includes(marker.restored));assert(raw.includes(marker.source));assert.equal(JSON.stringify(h.A.state),before);});
check('CH125-24','business-cost detail retains real setup amounts and only simplifies exact factory prose',()=>{const h=fixture(),html=h.A.auditPresentation.renderDetail(h.children[1],{project:h.p,costHistory:true});assert(html.includes('253,850,000원'));assert(html.includes('하위 항목 구성'));assert(!html.includes(marker.setup));assert(!html.includes(marker.source));});
check('CH125-25','conflicting before/after target identity cannot suppress a record',()=>{const h=fixture(),event=structuredClone(h.restore);event.before.id='different-target';assert(h.render([event]).includes(marker.restored));});
check('CH125-26','a known reason with a two-won change is not an identified one-won verification event',()=>{const h=fixture(),event=structuredClone(h.changed);event.after.current+=1;assert(h.render([event]).includes(marker.changed));});
check('CH125-27','duplicate raw target ids fail open for preservation rather than guessing which internal record it is',()=>{const h=fixture();h.p.cbs.push({...h.p.cbs.find(row=>row.id==='history-child-b'),name:'다른 연결'});assert(h.render([h.restore]).includes(marker.restored));});
check('CH125-28','business detail public entry point and actual project-history route pass the presentation option',()=>{const h=fixture();h.A.auditPresentation.openDetail(h.restore.id,{projectId:h.p.id,costHistory:true});assert(!h.html().includes(marker.restored));h.action('project-audit-detail',{id:h.restore.id,projectId:h.p.id});assert(!h.html().includes(marker.restored));h.action('audit-detail',{id:h.restore.id});assert(h.html().includes(marker.restored));});
check('CH125-29','same marker in a normal note fallback is not lost just because the reason projection is shared',()=>{const h=fixture(),event=structuredClone(h.ordinary);delete event.after.reason;event.after.note='QA 검토에 따른 실제 변경메모';const view=h.A.auditPresentation.costHistoryView(event,{project:h.p});assert.equal(view.hidden,false);assert.equal(event.after.note,'QA 검토에 따른 실제 변경메모');});
check('CH125-30','one remaining normal event is not hidden behind five exact internal events in recent-history source selection',()=>{const h=fixture();h.A.state.auditEvents=[h.restore,h.changed,{...h.restore,id:'synthetic-test-3'},{...h.changed,id:'synthetic-test-4'},{...h.restore,id:'synthetic-test-5'},h.ordinary];const html=h.A.auditPresentation.renderCostHistory(h.A.state.auditEvents,{project:h.p,limit:1});assert(html.includes('계약범위 추가에 따른 변경'));assert(!html.includes(marker.restored));assert(!html.includes(marker.changed));});
check('CH125-31','an audit record without its own stable identity is preserved instead of guessed to be an internal test',()=>{const h=fixture(),event=structuredClone(h.restore);delete event.id;assert(h.render([event]).includes(marker.restored));});

const afterPins=Object.fromEntries(files.map(file=>[file,sha(fs.readFileSync(file))]));
const changed=files.filter(file=>sourcePins[file]!==afterPins[file]);
assert.deepEqual(changed,[],'제품 소스는 조사 중 변경하지 않습니다.');
const output='.build/continuation-20261023/ops-cost-history125-regression-'+Date.now()+'.json';
const evidence={at:new Date().toISOString(),suite:'continuation125-cost-history',phase:'independent-current-source-regression',requirements:'root-approved-cost-history125-closed-presentation-only',sourcePins,sourceChanged:changed,scope:{syntheticFixture:true,currentProductFunctions:true,realDatabaseRead:false,databaseWrite:false,remoteRequest:false,browser:false,productEdit:false,actualExcelFile:false,comparisonWorkbookModelOnly:true},checks,passed:checks.filter(row=>row.status==='passed').length,failed:checks.filter(row=>row.status==='failed').length,limits:['root 승인 표시정책의 독립 기대값','실제 화면 및 실제 파일 검수 아님','소유자 원감사 원문은 보존하는 기대값']};
fs.writeFileSync(output,JSON.stringify(evidence,null,2),{flag:'wx'});
console.log(JSON.stringify({output,sha256:sha(fs.readFileSync(output)),passed:evidence.passed,failed:evidence.failed,failedIds:checks.filter(row=>row.status==='failed').map(row=>row.id),sourceChanged:changed}));
if(evidence.failed)process.exitCode=1;
