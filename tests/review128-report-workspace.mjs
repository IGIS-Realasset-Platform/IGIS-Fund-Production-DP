import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';

const tests=[];const test=(name,fn)=>tests.push([name,fn]);
const modules=['core','cbs','vat','contracts','legal','permit-views','report-form','report','report-example','demo'];
function fixture(){const h=makeHarness({modules}),A=h.A;for(const init of A.initializers)init(A.state);const p=structuredClone(A.state.projects.find(row=>row.id==='SAMPLE02')||A.state.projects[0]);A.state.projects=[p];A.ui.projectId=p.id;A.boot();return{...h,A,p};}
const click=(h,action,data={})=>h.listeners.click[0]({target:{closest:()=>({dataset:{action,...data}})},preventDefault(){}});

test('조건·주작업·보조 조회를 하나의 작성패널 안에 모으고 빈 두번째 패널을 만들지 않는다',()=>{
 const{A,p,nodes}=fixture();A.go('report','generate',p.id);const html=nodes.get('content').innerHTML;
 assert.match(html,/data-report-workspace="unified"/);assert.match(html,/data-report-controls="compact"/);
 assert(!html.includes('<section class="panel report-management"'));
 assert.match(html,/class="report-management-actions" role="group" aria-label="보고자료 확인 및 관리"/);
 const head=html.slice(html.indexOf('report-workspace-main'),html.indexOf('report-selectors'));
 for(const action of ['report-source-open','report-history-open'])assert(head.includes(`data-action="${action}"`),action+' must be beside the work title');
 for(const name of ['reportType','reportDate','reportStage'])assert.equal((html.match(new RegExp(`name="${name}"`,'g'))||[]).length,1,name);
 for(const action of ['report-editor-toggle','report-open','report-save'])assert.equal((html.match(new RegExp(`data-action="${action}"`,'g'))||[]).length,1,action);
 assert.equal((html.match(/class="btn primary"/g)||[]).length,1);
});
test('배치는 전용 작업영역에만 제한하고 인쇄·A4 크기를 덮어쓰지 않는다',()=>{
 const css=fs.readFileSync('src/report-editor.css','utf8');
 assert.match(css,/\.report-workspace-main \.form-grid\.report-selectors\s*\{[^}]*grid-template-columns:/);
 assert.match(css,/@media\(max-width:700px\)[\s\S]*\.report-workspace-main \.form-grid\.report-selectors\s*\{[^}]*grid-template-columns:1fr/);
 assert.match(css,/@container report-controls \(max-width:700px\)[\s\S]*\.report-workspace-main \.form-grid\.report-selectors\s*\{[^}]*grid-template-columns:1fr/,'sidebar-open narrow content must respond to its own width');
 const owned=css.slice(css.indexOf('/* REPORT128 compact workspace controls.'));
 assert(owned&&!owned.includes('.report-edit-page')&&!owned.includes('@page')&&!owned.includes('.official-form-table'));
});
test('보조 조회는 원래 자료·저장본을 열며 원장·보고본을 수정하지 않는다',()=>{
 const h=fixture(),{A,p}=h;A.go('report','generate',p.id);const before=JSON.stringify(A.state);let modal;
 A.modal=(title,body)=>{modal={title,body};};click(h,'report-source-open');assert.equal(modal.title,'기재자료 확인');assert(modal.body.includes('사업개요 수정'));
 click(h,'report-history-open');assert.equal(modal.title,'저장한 보고서 보기');assert.equal(JSON.stringify(A.state),before);
});
test('수정 열기/닫기는 같은 작성조건과 미저장값을 유지한다',()=>{
 const h=fixture(),{A,p,nodes}=h,context={type:'plan',date:p.asOf,stageId:'current'};A.ui.reportDraftSettings={[p.id]:context};A.go('report','generate',p.id);
 const model=A.reportForm.createEditorModel(A.report.reportData(p,p.asOf,'current',{draftContext:context}),'plan',p.asOf),cell=model.blocks.flatMap(block=>block.editableCells||[]).find(row=>row.role==='title');
 click(h,'report-editor-toggle');assert(nodes.get('content').innerHTML.includes('data-report-editor-visible="true"'));
 A.report.bufferCell(p,context,cell.cellId,'보고서 수정 유지',{baseValue:cell.text});click(h,'report-editor-close');
 assert(nodes.get('content').innerHTML.includes('data-report-editor-visible="false"'));assert.equal(A.report.bufferedChanges(p,context).values[cell.cellId],'보고서 수정 유지');
 assert.equal(JSON.stringify(A.ui.reportDraftSettings[p.id]),JSON.stringify(context));
});
let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS '+name);}catch(error){failed++;console.log('FAIL '+name+' :: '+error.message);}}
console.log(JSON.stringify({scope:'REPORT128 layout/logical only',passed:tests.length-failed,failed,browser:false}));if(failed)process.exitCode=1;
