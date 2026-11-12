import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';
import {completeReviewFinancing} from '../scripts/local-preview/complete-review-financing.mjs';
import {milestoneRows} from '../scripts/local-preview/finance-milestones.js';
import {capitalSourceTotal} from '../scripts/local-preview/finance-capital.js';
const copy=x=>JSON.parse(JSON.stringify(x));
const input=JSON.parse(readFileSync(process.env.REVIEW_STATE||new URL('../.build/local-preview/edits-87f107978a5ae9b76dc9f698d456163b02982fdb95a43b12d0a647b18cf8534c.json',import.meta.url))).state;
for(let i=0;i<input.projects.length;i++)if(input.projects[i].localReviewFinancing175)input.projects[i]=copy(input.projects[i].localReviewFinancing175.original);
const {A}=makeHarness({costTaxonomyV4:true,seed:copy(input),modules:['core','cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','contracts','setup','recovery-views']});for(const f of A.initializers)f(A.state);
const seoul=JSON.stringify(A.state.projects[0]);
const expected={B:{funding:[1400,1700,1921.5],duration:[48,60,78],land:58880770000,cost:[322749000000,324049000000,324479990000]},C:{funding:[4400,5600,6405],duration:[84,90,96],land:196269230000,cost:[1075830000000,1079830000000,1085703290000]}};
for(const p of A.state.projects.slice(1)){
 A.ui.projectId=p.id;const old=copy(p);
 if(process.env.RED){assert.equal(milestoneRows(A,p).length,3,'누락: 중간 단계와 단계별 조달 자료');continue;}
 const outcome=completeReviewFinancing(A,p);assert.ok(outcome.changed);const rows=milestoneRows(A,p),e=expected[p.id.at(-1)];
 assert.deepEqual(copy(rows.map(r=>r.name)),['최초 언더라이팅','1차 리파이낸싱','본PF 1차']);
 assert.deepEqual(copy(rows.map(r=>r.values.funding/1e8)),e.funding);assert.deepEqual(copy(rows.map(r=>r.values.duration)),e.duration);
 assert.ok(rows.every(r=>r.values.land===e.land&&r.gfa>0&&r.periodEnd&&r.date));
 assert.deepEqual(copy(rows.map(r=>r.values.cost)),e.cost);
 for(const r of rows)assert.equal(capitalSourceTotal(r.capitalSources),r.values.funding);
 assert.deepEqual(copy(p.costStages.slice(0,old.costStages.length)),old.costStages,'원본 단계 보존');
 assert.deepEqual(copy(p.contracts),old.contracts,'계약 보존');assert.deepEqual(copy(p.localReviewFinancing175.original),old,'정정 전 전체 사업 보관');
 assert.deepEqual(copy(p.equities),old.equities);assert.equal(p.loans.reduce((s,x)=>s+x.commitment,0),old.loans.reduce((s,x)=>s+x.commitment,0));
 assert.ok(p.loans.every(x=>x.type==='본PF'));const frozen=copy(rows.slice(0,2));p.loans[0].commitment+=1;assert.deepEqual(copy(milestoneRows(A,p).slice(0,2)),frozen);p.loans[0].commitment-=1;
 const done=JSON.stringify(p);assert.equal(completeReviewFinancing(A,p).changed,false);assert.equal(JSON.stringify(p),done);
 console.log(p.id,JSON.stringify(rows.map(r=>({name:r.name,cost:r.values.cost/1e8,funding:r.values.funding/1e8,interest:r.values.interest/1e8,duration:r.values.duration}))));
}
assert.equal(JSON.stringify(A.state.projects[0]),seoul);console.log('LOCAL-UI-175 PASS');
