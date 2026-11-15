import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';
import {completeReviewAreas} from '../scripts/local-preview/complete-review-areas.mjs';
import {milestoneRows} from '../scripts/local-preview/finance-milestones.js';
const copy=x=>JSON.parse(JSON.stringify(x));
const raw=JSON.parse(readFileSync(process.env.REVIEW_STATE||'/private/tmp/idm-ui175-after.json')).state;
const {A}=makeHarness({costTaxonomyV4:true,seed:copy(raw),modules:['core','cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','contracts','setup','recovery-views']});for(const f of A.initializers)f(A.state);
for(const p of A.state.projects){
 const old=copy(p),before=copy(milestoneRows(A,p)),expected={A:[63500,12400],B:[40005,7812],C:[133350,26040]}[p.id.at(-1)];
 if(!process.env.RED)completeReviewAreas(A,p);
 const rows=milestoneRows(A,p);assert.equal(rows.length,3);
 for(const r of rows){
  const a=r.snapshot?A.areas.forStage(p,r.snapshot):A.areas.current(p);
  assert.equal(a.gfaTotal,expected[0],'과거 세부사업비 연면적 누락');assert.equal(a.acquisitionLandArea,expected[1]);assert.ok(r.date);
  assert.equal(r.gfa,a.gfaTotal);
  const unit=A.domain.modeValue(p,'total',r.snapshot||null,'unit');
  assert.ok(Math.abs(unit-r.values.cost/expected[0]*3.305785/10000)<1e-6);
 }
 assert.deepEqual(copy(rows.map(r=>r.values)),before.map(r=>r.values));assert.deepEqual(copy(rows.map(r=>r.capitalSources)),before.map(r=>r.capitalSources));
 for(const k of ['cbs','contracts','loans','equities'])assert.deepEqual(copy(p[k]),old[k]);
 for(const s of old.costStages){const next=p.costStages.find(n=>n.id===s.id);assert.deepEqual(copy(next.values),s.values);assert.deepEqual(copy(next.nodes),s.nodes);if(!before.some(r=>r.snapshot?.id===s.id))assert.deepEqual(copy(next),s);}
 const fixed=copy(p);assert.equal(completeReviewAreas(A,p),false);assert.deepEqual(copy(p),fixed);
 const past=copy(rows.slice(0,2));A.areas.current(p).gfaTotal+=100;assert.deepEqual(copy(milestoneRows(A,p).slice(0,2)),past);
 console.log(p.id,'면적/평단가/기준일/금액보존/과거불변 PASS');
}
