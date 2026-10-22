import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';
const h=makeHarness({seed:{projects:[]},modules:['core']}),checks=[];
const test=(name,fn)=>{try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}};
test('삭제 확인은 일반 상세표와 구별되는 짧은 확인 컴포넌트',()=>{h.A.confirmDelete('가상 출자자',()=>{});assert(h.nodes.get('app-dialog').innerHTML.includes('dp-confirm-delete'));assert(h.nodes.get('app-dialog').innerHTML.includes('정말 삭제하시겠습니까?'));assert(h.nodes.get('app-dialog').innerHTML.includes('type="submit">삭제'));});
test('짧은 확인창 폭만 제한하며 일반 표·중첩 팝업의 너비는 변경하지 않음',()=>{const css=fs.readFileSync('src/recovery.css','utf8');assert.match(css,/#app-dialog:has\(\.dp-confirm-delete\)\s*\{[^}]*width:\s*min\(480px,\s*calc\(100vw\s*-\s*48px\)\)/);assert.match(css,/\.dp-dialog\s*\{[^}]*width:min\(1180px,calc\(100vw - 48px\)\)/);});
console.log(JSON.stringify({suite:'followup121-confirmation-size',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,checks}));if(checks.some(x=>!x.passed))process.exitCode=1;
