import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {makeHarness} from './recovery-harness.mjs';

// Independent source contract: official form2 labels x310.08/x478.92pt,
// document body origin x56.69pt. Actual PDF coordinates remain a separate gate.
const {A}=makeHarness({modules:['core','report-form'],seed:{projects:[]}});
const css=await fs.readFile('src/report.css','utf8'),source=await fs.readFile('src/report-form.js','utf8'),tests=[];
const test=(name,fn)=>tests.push([name,fn]);
const q={id:'PDFQA',basic:{operator:'PDFQA 회사'},reportForm:{reportSigner:'PDFQA 회사'},asOf:'2026-10-20'};
const rendered=type=>{const model=A.reportForm.createEditorModel(q,type,q.asOf);return {model,html:A.reportForm.renderEditorPages(model)};};

test('제2호의 보고인·회사명·서명은 독립 영역이고 제1호는 기존 구조를 보존한다',()=>{
 for(const type of ['cancel','complete']){const {html}=rendered(type);for(const cl of ['form2-signature','form2-reporter-label','form2-signer','form2-signature-label'])assert(html.includes(cl),`${type}: ${cl}`);assert(!html.includes('padding-right:68.9pt'));}
 assert(!rendered('plan').html.includes('form2-signature'));
});
test('모든 서명 셀의 실제 편집 renderer와 긴 원문·이스케이프를 보존한다',()=>{
 const {model}=rendered('cancel'),declaration=model.blocks.find(b=>b.id==='declaration'),roles=['reporter-label','signer','signature-label'],ids=roles.map(role=>declaration.editableCells.find(c=>c.role===role).cellId),long='긴회사명<&>_'.repeat(120),seen=[];
 declaration.editableCells.find(c=>c.role==='signer').text=long;
 const html=A.reportForm.renderEditorPages(model,{specialRenderer(cell){if(roles.includes(cell.role)){seen.push({role:cell.role,id:cell.cellId,text:cell.text});return `<span data-test-cell="${A.esc(cell.cellId)}">${A.esc(cell.text)}</span>`;}}});
 assert.deepEqual(seen.map(c=>c.id),ids);assert.equal(seen.find(c=>c.role==='signer').text,long);assert(html.includes(A.esc(long)));assert(!html.includes(long));assert(!html.includes('text-overflow:ellipsis'));
});
test('고정 좌표는 공식 상대 위치이며 영역은 자연 높이·첫 줄 기준선을 사용한다',()=>{
 const rule=css.match(/\.form-signature\.form2-signature\{([^}]+)\}/)?.[1];assert(rule,'제2호 전용 서명 규칙');
 const cols=rule.match(/grid-template-columns:([\d.]+)pt ([\d.]+)pt ([\d.]+)pt minmax\(0,1fr\)/);assert(cols,'양식 전용 고정 열');
 assert(Math.abs(Number(cols[1])+56.69-310.08)<.01);assert(Math.abs(Number(cols[1])+Number(cols[2])+Number(cols[3])+56.69-478.92)<.01);assert.match(rule,/align-items:baseline/);assert.doesNotMatch(rule,/(?:height:|overflow:hidden|position:absolute)/);
 assert.match(css,/\.form-signature\.form2-signature>\.form2-signer\{[^}]*white-space:pre-wrap[^}]*overflow-wrap:anywhere/);
 assert.match(css,/\.official-form-table \.form-atomic\{font-variant-numeric:normal\}/);
});
test('인쇄 전 크기 측정에서도 같은 제2호 서명 구조를 사용한다',()=>{
 assert.match(source,/blockHTML\(\{block:b,rows:b\.rows\|\|\[\]\},\{form:model\.form,blank:!!model\.blank,basePage:b\.basePage\}\)/);
});
test('제2호 장문 서명부의 바깥 여백도 페이지 남은 공간에 포함한다',()=>{
 assert(source.includes("if(model.form==='form2'&&b.kind==='declaration')"),'서명부 바깥 여백을 포함한 측정이 필요합니다.');
 assert(source.includes('parseFloat(style.marginTop)')&&source.includes('parseFloat(style.marginBottom)'));
});
let failed=0;for(const[name,fn]of tests){try{fn();console.log('PASS '+name);}catch(e){failed++;console.log('FAIL '+name+' :: '+e.message);}}console.log(JSON.stringify({passed:tests.length-failed,failed,scope:'source/render contract; actual PDF/whole-page visual checks separate'}));if(failed)process.exitCode=1;
