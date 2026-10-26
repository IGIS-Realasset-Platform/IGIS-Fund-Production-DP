import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';

const tests=[];const test=(name,fn)=>tests.push([name,fn]);
const fixture=()=>{const h=makeHarness({modules:['core','cbs','contracts','legal','permit-views','demo']}),A=h.A;for(const init of A.initializers)init(A.state);const p=A.state.projects[0];A.ui.projectId=p.id;return{...h,A,p};};
const click=(h,action,data={})=>h.listeners.click[0]({target:{closest:()=>({dataset:{action,...data}})},preventDefault(){}});
const captureForms=A=>{const forms=[];A.form=(title,fields,callback,submitLabel='저장',options={})=>{const row={title,fields,callback,submitLabel,options};forms.push(row);return row;};return forms;};

test('P0 저장된 주거·복합/정비사업을 프리셋 기본값으로 사용한다',()=>{
  const{A}=fixture();assert.equal(typeof A.legal.permitPresetDefaults,'function');
  assert.equal(JSON.stringify(A.legal.permitPresetDefaults({type:'주거·복합',basic:{method:'정비사업'}})),JSON.stringify({asset:'주거·공동주택',method:'정비사업',supported:true}));
  assert.equal(JSON.stringify(A.legal.permitPresetDefaults({type:'미지원 유형',basic:{method:'미지원 방식'}})),JSON.stringify({asset:'',method:'',supported:false}));
});

test('P0 주거·정비 추천은 후보를 보여주고 일반폼 저장 전 원장을 바꾸지 않는다',()=>{
  const h=fixture(),{A,p}=h,forms=captureForms(A);p.type='주거·복합';p.basic.method='정비사업';click(h,'legal-preset');
  const first=forms.at(-1);assert.equal(first.title,'사업 조건으로 인허가 추천');assert(first.fields.includes('주거·공동주택'));assert(first.fields.includes('정비사업'));
  first.callback({asset:'주거·공동주택',method:'정비사업'});const second=forms.at(-1),required=['정비구역·사업시행계획 인가','주택사업계획 승인','교육환경평가','국가유산영향진단','해체허가·신고','입주자모집 승인'];
  for(const name of required)assert(second.fields.includes(name),name);const before=p.permits.length,selection=Object.fromEntries([...second.fields.matchAll(/name="(pick-[^"]+)"/g)].slice(0,1).map(match=>[match[1],'yes']));second.callback(selection);assert.equal(p.permits.length,before);assert(forms.at(-1).title.startsWith('추천 인허가 입력'));
});

test('P0 미지원 사업유형·방식은 임의 기본값 없이 선택을 요청한다',()=>{
  const h=fixture(),{A,p}=h,forms=captureForms(A);p.type='미지원 유형';p.basic.method='미지원 방식';click(h,'legal-preset');const form=forms.at(-1);
  assert.equal(form.title,'사업 조건으로 인허가 추천');assert(form.fields.includes('선택해 주세요'));assert(!/value="오피스·복합" selected/.test(form.fields));assert(!/value="일반 건축" selected/.test(form.fields));
});

test('P0 인허가 합동폼은 본문 출발과 실제 부모 팝업 출발을 구분한다',()=>{
  const h=fixture(),{A,p}=h,forms=captureForms(A),permit=p.permits[0],action={id:'v0109-action',title:'보완조건',status:'초안'};permit.actionItems=[...(permit.actionItems||[]),action];
  click(h,'legal-edit',{type:'permit',id:permit.id});assert.equal(typeof forms.at(-1).options.returnTo,'undefined','본문 인허가 수정');A.requestModalClose();
  A.permitViews.openPermitDetail(permit.id);click(h,'legal-edit',{type:'permit',id:permit.id});assert.equal(typeof forms.at(-1).options.returnTo,'function','상세에서 인허가 수정');A.requestModalClose();
  click(h,'legal-action-add',{permitId:permit.id});assert(forms.at(-1).fields.includes('permit-combined-results'),'결과·계획 합동폼');A.requestModalClose();
  click(h,'legal-action-edit',{permitId:permit.id,id:action.id});assert(forms.at(-1).fields.includes('permit-combined-results'),'결과·계획 수정 합동폼');A.requestModalClose();
  click(h,'legal-identity-edit');assert.equal(typeof forms.at(-1).options.returnTo,'function','법인정보 수정');
  click(h,'legal-review-edit');assert.equal(typeof forms.at(-1).options.returnTo,'function','등록대상 검토 수정');
});

test('P1 인허가 추가·수정 폼은 업무그룹별 세로 2열과 상태별 필수표시를 제공한다',()=>{
  const h=fixture(),{A}=h,forms=captureForms(A);click(h,'legal-add',{type:'permit'});const form=forms.at(-1);
  assert.match(form.fields,/class="[^"]*permit-form-vertical[^"]*"/);for(const key of ['basic','schedule','links','evidence'])assert(form.fields.includes(`data-permit-section="${key}"`),key);assert(!form.fields.includes('data-permit-section="action"'));
  assert.match(form.fields,/data-field="name"[\s\S]*?permit-required[^>]*>\*/);assert(form.fields.includes('인허가 신청·진행자료 경로'));assert(!form.fields.includes('조치계획·이행자료 공용폴더 경로'));
  assert.equal(form.submitLabel,'인허가 추가');
});

test('P1 조치계획을 입력하면 요청 공문과 이행자료 두 경로를 각각 요구한다',()=>{
  const{A}=fixture();for(const missing of ['sourcePath','backDataPath']){const row={title:'보완조건',actionPlan:'진출입 계획 보완',deadlineState:'미정',status:'초안',sourcePath:'요청/공문.pdf',backDataPath:'조치/자료'};row[missing]='';try{A.legal.validateActionItem(row);assert.fail(missing+' 누락을 차단해야 합니다.');}catch(error){assert(error.fieldErrors?.[missing],missing);}}
  assert.throws(()=>A.legal.validateActionItem({title:'보완조건',deadlineState:'미정',status:'초안',actionPlan:'',sourcePath:'',backDataPath:''}),error=>!!error.fieldErrors?.actionPlan&&!!error.fieldErrors?.sourcePath&&!!error.fieldErrors?.backDataPath);
});

test('P1 결과와 계획은 같은 2열 합동폼에서 각각의 증빙을 입력한다',()=>{
  const h=fixture(),{A,p}=h,forms=captureForms(A),permit=p.permits[0],result={id:'result-v0109',resultCategory:'보완 요청',title:'교통 보완',date:'2026-03-01',sourcePath:'공용/결과',plans:[],plansVersion:1};permit.actionItems.push(result);click(h,'legal-result-add',{permitId:permit.id});let form=forms.at(-1);assert(form.fields.includes('permit-combined-results'));assert(form.fields.includes('검토의견 문서 경로'));click(h,'permit-draft-plan-add',{resultId:result.id});form=forms.at(-1);assert(form.fields.includes('permit-plan-draft'));assert(form.fields.includes('조치계획·이행자료 경로'));assert(form.fields.includes('검토의견 문서 경로'));assert.equal(form.submitLabel,'변경사항 저장');
});

test('P1 개발업 등록은 상태와 등록정보를 같은 화면에서 조회한다',()=>{
  const{A,p}=fixture(),html=A.legal.ui.registration(p);assert.equal((html.match(/data-registration-task=/g)||[]).length,0);for(const text of ['개발업 등록','등록 상태','등록정보 수정'])assert(html.includes(text),text);for(const removed of ['등록 대상 여부 검토','등록·신고 이력','전자신고가 실행되지 않습니다'])assert(!html.includes(removed),removed);
});

test('P1 인허가 화면은 읽기탭과 명시적 전체편집 행동을 구분한다',()=>{
  const{A,p,nodes}=fixture(),html=A.permitViews.permits(p);for(const text of ['추천 인허가 추가','+ 인허가 직접 추가','>조치계획 보기<'])assert(html.includes(text),text);assert(!html.includes('>프리셋 선택<'));assert(!html.includes('>+ 직접 추가<'));A.permitViews.openPermitDetail(p.permits[0].id);const detail=nodes.get('app-dialog').innerHTML;for(const text of ['>개요<','>신청·심의 기록<','>검토의견·조치<','>법령·조건<','>인허가 정보 수정<','>변경 인허가 추가<','>삭제<'])assert(detail.includes(text),text);assert(!detail.includes('>조치계획<'));assert(!detail.includes('>인허가 수정<'));assert(!detail.includes('>연결·기타 설정<'));
});

let failures=0;for(const[name,fn]of tests){try{fn();console.log('PASS '+name)}catch(error){failures++;console.log('FAIL '+name+' :: '+error.message)}}
console.log(JSON.stringify({passed:tests.length-failures,failed:failures,verification:'pure-vm-markup-workflow',browser:false}));if(failures)process.exitCode=1;
