import assert from 'node:assert/strict';import {makeHarness} from './recovery-harness.mjs';const checks=[];
function test(name,fn){try{fn();checks.push({name,passed:true})}catch(e){checks.push({name,passed:false,error:e.message})}}
const fixture=()=>makeHarness({seed:{projects:[]},modules:['core']});
test('선택목록 재표시값과 최초 변경비교값을 별도로 유지',()=>{const {A}=fixture();A.form('항목 선택','',()=>false,'추가',{initialValues:{note:'사용자가 작성한 내용'},baselineValues:{note:''}});const x=A.formEditor.snapshot();assert.equal(x.values.note,'사용자가 작성한 내용');assert.equal(x.baseline.note,'');assert.equal(x.dirty,true);});
test('명시적 빈 기준값은 현재값으로 자동 교체하지 않음',()=>{const {A}=fixture();A.form('선택','',()=>false,'추가',{initialValues:{selected:'yes'},baselineValues:{}});assert.deepEqual(JSON.parse(JSON.stringify(A.formEditor.snapshot().baseline)),{});assert.equal(A.formEditor.dirty(),true);});
test('새 옵션 미지정의 기존 폼 변경판정은 그대로 유지',()=>{const {A}=fixture();A.form('기존','',()=>false,'저장',{initialValues:{name:'기존'}});assert.equal(A.formEditor.dirty(),false);A.formEditor.setValues({name:'변경'});assert.equal(A.formEditor.dirty(),true);});
test('새 기준 객체는 호출자 원본과 공유하지 않음',()=>{const {A}=fixture(),baseline={note:'처음'};A.form('선택','',()=>false,'추가',{initialValues:{note:'다름'},baselineValues:baseline});baseline.note='외부 변경';assert.equal(A.formEditor.snapshot().baseline.note,'처음');});
test('잘못된 기준 형식은 조용히 현재값으로 대체하지 않고 차단',()=>{for(const baselineValues of [null,[],false,'']){const {A}=fixture();assert.throws(()=>A.form('선택','',()=>false,'추가',{baselineValues}));}});
console.log(JSON.stringify({suite:'followup121-form-baseline',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,checks,actualBrowser:false}));if(checks.some(x=>!x.passed))process.exitCode=1;
