import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const sourceMark={label:'UPDATE',description:'원문에 있던 수주자료 갱신'},detectedAt='2026-10-20T10:00:00.000Z';
function render(mark){const h=makeHarness({seed:{projects:[]}}),A=h.A;A.partnerSeed={groups:[{key:'cak-rows',source:'cak',meta:{latest_year:2026,title:'독립 원문'},rows:[{companyKey:'exact:one',company:'독립 원문 업체',rank:1,sourceRowId:'exact-row',registration_no:'test-only',online_update_mark:sourceMark,...mark,related_articles:[{published:'2026-10-01',title:'원래 기사'}]}]}]};h.load('partners');A.partners.initialize(A.state);const before=JSON.stringify(A.state),html=A.partners.rankingTable('cak-rows');assert.equal(JSON.stringify(A.state),before);return{A,html,row:A.partnerSeed.groups[0].rows[0]};}
const original=render({});assert.match(original.html,/원문에 있던 수주자료 갱신/);
const updated=render({collection_update_mark:{label:'UPDATE',description:'새 기사 2건 · 내용 정정 1건',detectedAt,sourceCounts:{news:{added:2,corrected:1},disclosures:{added:0,corrected:0}},eventFingerprint:'stable-event'}});
assert.match(updated.html,/새 기사 2건 · 내용 정정 1건/);assert.equal((updated.html.match(/class="dp-partner-update"/g)||[]).length,1);assert.deepEqual(updated.row.online_update_mark,sourceMark);assert.doesNotMatch(updated.html,new RegExp(detectedAt.replace(/[.]/g,'\\.')));assert.equal(updated.row.related_articles[0].published,'2026-10-01');assert.doesNotMatch(updated.html,/dp-partner-new/);
const before=JSON.stringify(updated.A.state),again=updated.A.partners.rankingTable('cak-rows');assert.equal(again,updated.html);assert.equal(JSON.stringify(updated.A.state),before);
const empty=render({online_update_mark:null});assert.doesNotMatch(empty.html,/dp-partner-update/);
console.log('PASS partner UPDATE: original source preserved, collector label preferred once, no timestamp-to-publication conversion, no read/write mutations, no fabricated empty mark, comment New independent');
