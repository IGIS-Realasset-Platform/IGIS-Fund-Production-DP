import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const h=makeHarness({seed:{projects:[]},modules:['core']}),checks=[];
const test=(name,fn)=>{try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}};
test('항목/내용 조회표는 금액 하나 때문에 계약명·주소·경로 전체를 우측 정렬하지 않음',()=>{const html=h.A.table(['항목','내용'],[['계약명','가상 설계 용역'],['공급가액',1200000],['원본 경로','샘플자료/A/계약.pdf']]);assert(!html.includes('class="num"'));assert(html.includes('가상 설계 용역'));});
test('항목/현재 값 조회표도 원 단위 입력 대상·경로의 원문을 바꾸지 않음',()=>{const value='<span data-inline-type="money" data-inline-id="cost-id">1,200,000</span>',html=h.A.table(['항목','현재 값'],[['현재 사업비',value],['담당자','가상 담당자']]);assert(!html.includes('class="num"'));assert(html.includes(value));});
test('독립적인 금액 열은 기존 숫자 정렬을 유지',()=>{const html=h.A.table(['원가항목','금액'],[['설계비',1200000]]);assert(html.includes('<th scope="col" class="num">금액'));assert(html.includes('<td class="num">1200000</td>'));});
test('단위나 빈 값이 없는 일반 텍스트 열에 숫자값을 만들지 않음',()=>{const html=h.A.table(['항목','내용'],[['대표자',null],['주소','서울특별시 중구']]);assert(html.includes('<td>—</td>'));assert(!html.includes('class="num"'));});
console.log(JSON.stringify({suite:'followup121-fact-table-alignment',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,checks}));if(checks.some(x=>!x.passed))process.exitCode=1;
