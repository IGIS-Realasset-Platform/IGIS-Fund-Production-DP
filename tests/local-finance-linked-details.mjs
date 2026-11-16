import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';
import {milestoneRows,linkedStageDetails} from '../scripts/local-preview/finance-milestones.js';
import {renderStageTable} from '../scripts/local-preview/finance-stage-editor-ui.js';
import {createStageDraft,previewStageDraft,commitStageDraft} from '../scripts/local-preview/finance-stage-editor-model.js';
const seed=JSON.parse(readFileSync(process.env.REVIEW_STATE||'/private/tmp/idm-ui177-after.json')).state;
const copy=x=>JSON.parse(JSON.stringify(x));
const {A}=makeHarness({costTaxonomyV4:true,seed:copy(seed),modules:['core','cbs','cbs-purpose','cbs-model-v0118','cost-company-profile','cost-order','contracts','setup','recovery-views']});for(const f of A.initializers)f(A.state);
const expected={A:[[276047210000,246918580000],[276047210000,246918580000],[278006470000,249185330000]],B:[[173909740000,155558730000],[174709740000,156358730000],[174650350000,156415550000]],C:[[579699130000,518529060000],[582199130000,521029060000],[584636480000,524241150000]]};
for(const p of A.state.projects){
 A.ui.projectId=p.id;const before=copy(p),rows=milestoneRows(A,p);
 const html=renderStageTable(A,p,rows,rows.at(-1));
 for(const label of ['자산매입 비용 (매입·명도·권리보상)','직접공사비 총액','평당 도급공사비','대출 구조 (약정 총액)','본공사 착공 시점'])assert.ok(html.includes(label),'추가행 누락: '+label);
 assert.ok(!html.includes('시작월·개발기간 기준'));assert.ok(!html.includes('매각 목표'));assert.ok(!html.includes('감정가'));
 rows.forEach((r,i)=>{const d=r.linkedDetails;assert.equal(d.directConstruction,expected[p.id.at(-1)][i][0]);assert.equal(d.contractConstruction,expected[p.id.at(-1)][i][1]);assert.equal(d.acquisition,r.values.land+d.compensation);if(i<2)assert.equal(d.constructionStart,'');});
 const draft=createStageDraft(A,p,{kind:'edit',basis:rows.at(-1)}),preview=previewStageDraft(A,p,draft);assert.deepEqual(copy(preview.linkedDetails),copy(rows.at(-1).linkedDetails));
 draft.gfa=Number(draft.gfa)+100;assert.equal(previewStageDraft(A,p,draft).gfa,Number(rows.at(-1).gfa)+100);assert.deepEqual(copy(p),before);
 // Freeze without touching persisted user state; this harness is detached.
 const create=createStageDraft(A,p,{kind:'create'});create.name='검사 단계';create.reason='격리 검사';create.date='2026-11-16';const saved=commitStageDraft(A,p,create);const frozen=milestoneRows(A,p).find(r=>r.id==='snapshot:'+saved.snapshotId);assert.deepEqual(copy(frozen.linkedDetails),copy(rows.at(-1).linkedDetails));p.construction.plannedStart='2031-01-01';p.construction.actualStart='2031-02-01';assert.deepEqual(copy(milestoneRows(A,p).find(r=>r.id===frozen.id).linkedDetails),copy(frozen.linkedDetails));
 console.log(p.id,'DB추가행/과거결측/합계/미리보기/고정 PASS');
}

// Independent empty/zero checks: missing values never become fabricated zeroes.
const fake={companyCostProfile:{managementNodes:()=>['land_purchase','land_rights_compensation','direct','direct_main'].map(id=>({id,companyProfileKey:id}))},domain:{modeValue:(_p,id,s)=>s?.[id]??null}};
assert.equal(linkedStageDetails(fake,{},{}).acquisition,null);
assert.equal(linkedStageDetails(fake,{}, {land_purchase:100,land_rights_compensation:0}).acquisition,100);
assert.equal(linkedStageDetails(fake,{}, {land_purchase:100,land_rights_compensation:25}).acquisition,125);
const stub={esc:s=>String(s),num:(n,d=0)=>Number(n).toFixed(d),money:n=>n+'원'};
const r={id:'current',name:'현재',values:{cost:0},gfa:0,linkedDetails:{contractConstruction:100},capitalSources:null};
const html=renderStageTable(stub,{},[r],r);assert.ok(!html.includes('Infinity'));assert.ok(!html.includes('NaN'));assert.ok(!html.includes('(0원)'));
console.log('결측/명시적0/합계/0면적 PASS');
