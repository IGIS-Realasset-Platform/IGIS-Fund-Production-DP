import assert from 'node:assert/strict';
import {milestoneRows,installMilestoneCapture,projectDuration} from '../scripts/local-preview/finance-milestones.js';

const original={id:'uw',label:'최초 언더라이팅',date:'2024-01-01',amounts:{total:100,land:20,build:60,fee:5},area:{gfaTotal:1200}};
const intermediate={id:'refi',label:'1차 리파이낸싱',date:'2025-06-30',amounts:{total:125,land:25,build:70,fee:8},area:{gfaTotal:1300},
 financeContext:{funding:110,sale:0,duration:60,periodEnd:'2030-06',reason:'설계 변경',notes:{construction:'지하층 보강'}}};
const p={id:'project-a',costStages:[original,intermediate],amounts:{total:150,land:30,build:90,fee:10},funding:140,basic:{periodStart:'2024-06',periodEnd:'2030-06'},area:{gfaTotal:1500},financeCurrentStage:{name:'본PF 1차',date:'2026-11-12',reason:'본PF 조건 확정'}};
const A={
 companyCostProfile:{managementNodes:()=>[{id:'land',companyProfileKey:'land_purchase'},{id:'build',companyProfileKey:'construction'},{id:'fee',companyProfileKey:'finance'}]},
 domain:{activeStages:project=>project.costStages,modeValue:(project,id,snapshot)=>(snapshot||project).amounts[id]},
 total:project=>project.amounts.total,contracts:{financeCapitalTotals:project=>({total:project.funding})},
 areas:{current:project=>project.area,forStage:(_project,snapshot)=>snapshot.area},
};
const before=structuredClone(p),rows=milestoneRows(A,p);
assert.deepEqual(rows.map(row=>row.name),['최초 언더라이팅','1차 리파이낸싱','본PF 1차']);
assert.deepEqual(rows.map(row=>row.values.cost),[100,125,150]);
assert.deepEqual(rows.map(row=>row.values.funding),[null,110,140]);
assert.deepEqual(rows.map(row=>row.values.sale),[null,0,null]);
assert.deepEqual(rows.map(row=>row.gfa),[1200,1300,1500]);
assert.deepEqual(rows.map(row=>row.values.duration),[null,60,72]);
assert.equal(rows[1].notes.construction,'지하층 보강');
assert.equal(rows[2].reason,'본PF 조건 확정');
assert.deepEqual(p,before);
p.amounts.total=160;p.funding=155;p.area.gfaTotal=1600;
const after=milestoneRows(A,p);
assert.deepEqual(after.slice(0,2),rows.slice(0,2));
assert.equal(after[2].values.cost,160);assert.equal(after[2].values.funding,155);assert.equal(after[2].gfa,1600);
assert.equal(projectDuration({periodStart:'2025-01',periodEnd:'2024-01'}),null);
installMilestoneCapture(A);
const read=A.financeMilestones.read;
assert.deepEqual(read({}),{funding:null,sale:null,duration:null,periodEnd:'',reason:'',notes:{cost:'',funding:'',construction:'',interest:''}});
assert.equal(read({financeFunding:'0'}).funding,0);
for(const raw of ['-1','0.5','oops','9007199254740992'])assert.throws(()=>read({financeFunding:raw}));
assert.throws(()=>read({financeDuration:'1201'}));
assert.throws(()=>read({financePeriodEnd:'2026-13'}));
assert.throws(()=>read({financeReason:'x'.repeat(1001)}));
assert.throws(()=>read({financeNote_cost:'x'.repeat(501)}));
console.log('LOCAL-UI-155 milestone history/live separation, historical gaps, explicit zero, facts and validation passed');

// Existing, explicitly identified local UW record supplements only missing financial context.
installMilestoneCapture(A);
A.financeMilestones.setUnderwritingReference(p.id,{id:'example-1',sample:true,date:'2024-06-01',values:{funding:90,sale:180,duration:72,cost:999,interest:999},reason:'기존 최초 검토'});
original.kind='underwriting';
const linked=milestoneRows(A,p)[0];
assert.equal(linked.values.funding,90);
assert.equal(linked.values.sale,180);
assert.equal(linked.values.duration,72);
assert.equal(linked.values.cost,100);
assert.equal(linked.values.interest,5);
assert.equal(linked.gfa,1200);
assert.equal(milestoneRows(A,{...p,id:'another'})[0].values.funding,null);
original.financeContext={funding:0,sale:null,duration:null};
assert.equal(milestoneRows(A,p)[0].values.funding,0);
assert.equal(milestoneRows(A,p)[0].values.sale,null);
delete original.financeContext;
console.log('LOCAL-UI-156 existing UW supplement / native amount priority / explicit zero and null / project isolation passed');
// Shared source facts are explicitly references, never a replacement for a dated area snapshot.
const referenceProject=structuredClone(p);
referenceProject.financeReferenceFacts={gfaTotal:63500,periodStart:'2024-06',source:'원본 사업개요',asOf:'2026-08-31'};
referenceProject.costStages[0].area.gfaTotal=null;
referenceProject.costStages[0].financeContext={duration:72};
referenceProject.costStages[1].area.gfaTotal=null;
const referenceBefore=structuredClone(referenceProject);
const referenceRows=milestoneRows(A,referenceProject);
assert.equal(referenceRows[0].gfa,63500);
assert.equal(referenceRows[0].gfaReference,true);
assert.equal(referenceRows[0].periodEnd,'2030-06');
assert.equal(referenceRows[0].periodEndReference,true);
assert.equal(referenceRows[1].gfa,63500);
assert.equal(referenceRows[1].periodEnd,'2030-06'); // explicit stage end always wins
assert.equal(referenceRows[1].periodEndReference,false);
referenceProject.area.gfaTotal=99999;
assert.equal(milestoneRows(A,referenceProject)[0].gfa,63500);
referenceProject.costStages[0].area.gfaTotal=62000;
assert.equal(milestoneRows(A,referenceProject)[0].gfa,62000);
assert.equal(milestoneRows(A,referenceProject)[0].gfaReference,false);
assert.deepEqual(referenceBefore.costStages[0].area,{gfaTotal:null});
console.log('LOCAL-UI-157 reference facts, derived end month, historical priority and isolation passed');
const fundingInput={financeFunding:'100',financeCapitalCount:'1',capitalId_0:'equity:one',capitalKind_0:'equity',capitalTranche_0:'자기자본',capitalParty_0:'출자자',capitalRole_0:'재무출자자',capitalAmount_0:'100'};
assert.equal(read(fundingInput).capitalSources[0].role,'재무출자자');
assert.throws(()=>read({...fundingInput,financeFunding:'101'}),/합계/);
assert.throws(()=>read({...fundingInput,capitalAmount_0:''}));
console.log('LOCAL-UI-158 stage form source role and total mismatch guards passed');
