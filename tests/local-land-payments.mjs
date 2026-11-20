import assert from 'node:assert/strict';
import {landPaymentGroups} from '../scripts/local-preview/permits.js';
const today='2026-11-20';
const p={landContracts:[{id:'c1',name:'계약1',amount:100},{id:'c2',name:'계약2',amount:20}],landPaymentSchedule:[
 {id:'future',contractId:'c1',category:'2차 중도금',amount:40,plannedDate:'2026-12-01',paid:false},
 {id:'paid',contractId:'c1',category:'계약금',amount:10,plannedDate:'2026-01-01',actualDate:'2026-01-01',paid:true},
 {id:'late',contractId:'c1',category:'1차 중도금',amount:50,plannedDate:'2026-11-01',paid:false},
 {id:'zero',contractId:'c2',category:'조정금',amount:0,plannedDate:'2026-11-21',paid:false},
 {id:'unknown',contractId:'c2',category:'잔금',amount:null,paid:false},
 {id:'removed',contractId:'c1',deletedAt:'x'},
 {id:'orphan',contractId:'missing',category:'별도 회차',paid:false}
]};
const original=JSON.stringify(p),groups=landPaymentGroups(p,today);
assert.equal(groups.length,3);assert.deepEqual(groups[0].rows.map(x=>x.record.id),['paid','late','future']);
assert.equal(groups[0].rows.find(x=>x.current).record.id,'late');
assert.equal(groups[0].rows[0].status,'지급 완료');assert.equal(groups[0].rows[1].status,'19일 경과');
assert.equal(groups[1].rows[0].record.amount,0);assert.equal(groups[1].rows[1].status,'예정일 미입력');
assert.equal(groups[2].name,'계약 연결 확인');assert.equal(JSON.stringify(p),original);
assert.equal(landPaymentGroups({landContracts:[],landPaymentSchedule:[]},today).length,0);
console.log('payment groups: multiple contracts, arbitrary stages, overdue, missing, zero, deleted, orphan, unchanged PASS');
