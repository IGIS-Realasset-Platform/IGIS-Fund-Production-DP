import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const h=makeHarness({modules:['core','cbs','contracts','legal','permit-views','report-form','report','demo']}),{A}=h;
for(const init of A.initializers)init(A.state);
const row={id:'center-test',name:'건축허가',group:'건축·심의',reportCategory:'공사시행',agency:'서울시',stage:'미신청',plannedApplication:'2026-11-02',expected:'2027-01-20',application:'',supplement:'',approval:'',reportTrigger:'아님',handling:'별도 진행',requestType:'최초',sourcePath:'공용/인허가',actionItems:[]};
const cases=[
 ['미발생 실제 신청·보완·승인은 공란 허용',()=>assert.doesNotThrow(()=>A.legal.validatePermit(structuredClone(row),[row]))],
 ['신청 단계는 실제 신청일 필수',()=>assert.throws(()=>A.legal.validatePermit({...row,stage:'신청'},[row]),e=>!!e.fieldErrors?.application)],
 ['신청만 발생하면 보완·승인일은 필수가 아님',()=>assert.doesNotThrow(()=>A.legal.validatePermit({...row,stage:'신청',application:'2026-11-02'},[row]))],
 ['잘못된 윤일은 거절',()=>assert.throws(()=>A.legal.validatePermit({...row,plannedApplication:'2026-02-29'},[row]))],
 ['법령 확인범위 설명 블록 제거',()=>{A.go('law','recent');assert(!h.nodes.get('content').innerHTML.includes('law-coverage'));}],
];
let failures=0;for(const[name,run]of cases){try{run();console.log('PASS '+name)}catch(e){failures++;console.log('FAIL '+name+': '+e.message)}}
if(failures)process.exitCode=1;
