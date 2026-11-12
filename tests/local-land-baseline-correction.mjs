import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {makeHarness} from './recovery-harness.mjs';
import {correctReviewLandBaseline} from '../scripts/local-preview/correct-land-baseline.mjs';
import {milestoneRows} from '../scripts/local-preview/finance-milestones.js';
const copy=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
const state=process.env.LAND_REVIEW_STATE?JSON.parse(readFileSync(process.env.LAND_REVIEW_STATE,'utf8')).state:JSON.parse(readFileSync(new URL('../.build/local-preview/original-workspace.json',import.meta.url),'utf8'));
const {A}=makeHarness({costTaxonomyV4:true,seed:copy(state),modules:['core','cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','contracts','setup','recovery-views']});
for(const initialize of A.initializers)initialize(A.state);
const p=A.state.projects.find(p=>p.id==='TEST-20261016-A');A.ui.projectId=p.id;
if(!process.env.LAND_REVIEW_STATE){
 const uw=A.domain.underwriting(p),refi=copy(uw);refi.id=A.uid('stage');refi.kind='custom';refi.controlEventType=null;refi.label='1차 리파이낸싱';refi.date='2025-06-30';refi.values['c-1-xu5ckpud']=95661540000;refi.financeContext={notes:{land:'토지매입비 증가'}};A.domain.finalizeStage(p,refi,uw);
 A.domain.saveCost(p,'c-1-xu5ckpud',97107690000);A.domain.saveCost(p,'c-102-ewjyqyz4',15720930000);p.financeCurrentStage={name:'본PF 1차',notes:{cost:'토지매입비와 공사·금융비 변경 반영'}};
}
const before=copy(p),others=copy(A.state.projects.filter(q=>q!==p)),rows=milestoneRows(A,p);
assert.deepEqual(copy(rows.map(r=>r.values.land)),[93461540000,95661540000,97107690000],'RED: 최초매입액에 임의증가 포함');
const result=correctReviewLandBaseline(A,p);assert.equal(result.target,93461540000);
assert.deepEqual(copy(milestoneRows(A,p).map(r=>r.values.land)),[93461540000,93461540000,93461540000]);
assert.deepEqual(copy(milestoneRows(A,p).map(r=>r.values.cost)),[512300000000,512300000000,516733850000]);
assert.deepEqual(copy(p.costStages.slice(0,-1)),before.costStages,'기존단계 기록 불변');
for(const key of ['contracts','loans','equities','financeReferenceFacts'])assert.deepEqual(copy(p[key]),before[key],key);
for(const node of before.cbs.filter(n=>n.id!=='c-1-xu5ckpud'))assert.deepEqual(copy(p.cbs.find(n=>n.id===node.id)),node,'다른비용 불변');
assert.deepEqual(copy(A.state.projects.filter(q=>q!==p)),others);
const done=JSON.stringify(p);assert.equal(correctReviewLandBaseline(A,p).changed,false);assert.equal(JSON.stringify(p),done,'중복 실행시 추가정정없음');
console.log('LOCAL-UI-170 PASS: baseline land, native total/correction, old records/contracts/others preserved, idempotent');
