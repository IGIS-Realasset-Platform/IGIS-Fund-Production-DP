import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const h=makeHarness({modules:['core','contracts','partners'],costTaxonomyV4:true}),A=h.A;A.register('cost',()=>'<p>기존 원가 비교 경계</p>');
A.go('company','market');assert.equal(A.ui.view,'company','현재 공개된 시공사 공사비 지표 탭을 과거 원가 화면 호환주소로 바꾸면 안 됩니다.');assert.equal(A.ui.tabs.company,'market');
A.go('company');assert.equal(A.ui.tabs.company,'cak-rows');
console.log(JSON.stringify({passed:2,realBrowser:false,businessWrites:0}));
