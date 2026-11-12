import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';

const costId='design';
const contract={
 id:'design-contract',name:'설계 계약',cbsId:costId,
 revisions:[{id:'r1',revision:1,date:'2026-08-01',total:1100,costAmount:1000,allocations:[{cbsId:costId,amount:1000}]}],
 certifications:[{date:'2026-08-20',allocations:[{cbsId:costId,amount:100}]}],
 obligations:[
  {id:'old',confirmedAt:'2026-08-20',confirmedAmount:110,costAmount:100,allocations:[{cbsId:costId,amount:100}]},
  {id:'new',confirmedAt:'2026-09-03',confirmedAmount:220,costAmount:200,allocations:[{cbsId:costId,amount:200}]},
 ],
 payments:[
  {id:'prior',date:'2026-08-20',amount:110,costAmount:100,obligationId:'old',allocations:[{cbsId:costId,amount:100}]},
  {id:'current',date:'2026-09-05',amount:110,costAmount:100,obligationId:'new',allocations:[{cbsId:costId,amount:100}]},
  {id:'future',date:'2026-10-01',amount:55,costAmount:50,obligationId:'new',allocations:[{cbsId:costId,amount:50}]},
 ],
};
const project={
 id:'local-payment-test',name:'로컬 지급 검수',asOf:'2026-08-31',
 cbs:[{id:'root',name:'설계비',current:null},{id:costId,parentId:'root',name:'건축설계',current:1200}],
 executionOpeningBalances:[{cbsId:costId,asOf:'2026-08-31',contract:1000,certified:300,paid:250}],
 contracts:[contract],
};
const seed={projects:[project],companies:[],entities:[],auditEvents:[],notifications:[]};
const {A}=makeHarness({modules:['core','cbs','contracts','xlsx-export'],seed});
A.costPaymentOverview=()=> '2026-09-30';
const totals=()=>({...A.domain.executionTotals(project)});
assert.deepEqual(totals(),{contract:1000,certified:300,paid:350,unpaid:150});
const contractSource=A.contracts.contractAmountSources(project,'2026-09-30');
assert.equal(contractSource.amount,1000);
assert.deepEqual(Array.from(contractSource.records,row=>[row.cbsId,row.amount,row.asOf]),[[costId,1000,'2026-08-31']]);
contract.payments[1].amount=165;
contract.payments[1].costAmount=150;
contract.payments[1].allocations[0].amount=150;
assert.deepEqual(totals(),{contract:1000,certified:300,paid:400,unpaid:100});
A.costPaymentOverview=()=> '2026-10-01';
assert.deepEqual(totals(),{contract:1000,certified:300,paid:450,unpaid:50});
delete contract.obligations[1].costAmount;
assert.equal(totals().unpaid,null);
const contractRows=[
 {id:'not-contracted',parentId:'root',name:'계약 없음',current:1200},
 {id:'no-source',parentId:'root',name:'자료 없음',current:1200},
];
project.cbs.push(...contractRows);
project.costs=[{id:'not-contracted',contract:0}];
const projection=A.domain.costExcelProjection(project,{mode:'amount'});
const index=projection.columns.findIndex(column=>column.id==='contract-amount');
const entry=id=>projection.rows.find(row=>row.id===id).values[index];
assert.deepEqual([entry(costId).valueStatus,entry(costId).rawWon],['known',1000]);
assert.deepEqual([entry('not-contracted').valueStatus,entry('not-contracted').rawWon],['empty',0]);
assert.deepEqual([entry('no-source').valueStatus,entry('no-source').rawWon],['unknown',null]);
A.ui.cbsRowsExpanded={[project.id]:{root:true}};
const costTable=A.renderCostDetail(project);
assert.match(costTable,/data-contract-amount="unknown" title="계약 자료 미확인">—<\/td>/);
assert.match(costTable,/data-contract-amount="empty" title="0원"><\/td>/);
const book=A.costExcel.projectWorkbookModel(project,{mode:'amount'});
const rows=book.sheets[0].rows;
const excelIndex=rows[0].cells.findIndex(cell=>cell.value==='계약금액 금액(백만원)');
const exported=name=>rows.find(row=>row.cells[1].value===name).cells[excelIndex];
assert.equal(exported('건축설계').value,1000);
assert.equal(exported('계약 없음').value,0);
assert.match(exported('계약 없음').numberFormat,/;""$/);
assert.equal(exported('자료 없음').value,'미확인');
assert(A.costExcel.buildXlsx(book).length>0);
const noEvidence={...project,contracts:[],executionOpeningBalances:[],costs:[]};
assert.equal(A.contracts.contractAmountSources(noEvidence).amount,null);
assert.equal(A.domain.executionTotals(noEvidence).contract,null);
console.log('PASS: opening cutoff, payment edit, future exclusion, contract evidence, and Excel');
