import assert from 'node:assert/strict';
import {currentCapitalSources,capitalSourceTotal,capitalSourceGroups,validateCapitalSources} from '../scripts/local-preview/finance-capital.js';

const project={equities:[
 {id:'e1',company:'공동 투자자',amount:0,purpose:'재무출자'},
 {id:'e2',company:'제외 출자자',amount:100,deletedAt:'2026-01-01'},
],loans:[
 {id:'l1',institution:'공동 투자자',trancheName:'Tr.A',type:'브릿지론',rank:'선순위',commitment:'900',executed:320,balance:220},
 {id:'l2',institution:'공동 투자자',tranche:'Tr.A',type:'본PF',rank:'선순위',commitment:1050,executed:0,balance:0,start:'2030-01-01'},
 {id:'l3',institution:'미입력 대주',type:'본PF',rank:'후순위',commitment:''},
 {id:'l4',institution:'제외 대주',commitment:500,deletedAt:'2026-01-01'},
]};
const before=structuredClone(project),sources=currentCapitalSources(project);
assert.deepEqual(sources,[
 {id:'equity:e1',kind:'equity',tranche:'자기자본',party:'공동 투자자',amount:0,role:'재무출자'},
 {id:'loan:l1',kind:'debt',tranche:'Tr.A',party:'공동 투자자',amount:900,role:'선순위'},
 {id:'loan:l2',kind:'debt',tranche:'Tr.A',party:'공동 투자자',amount:1050,role:'선순위'},
 {id:'loan:l3',kind:'debt',tranche:'본PF · 후순위',party:'미입력 대주',amount:null,role:'후순위'},
]);
assert.deepEqual(project,before);
assert.equal(capitalSourceTotal(sources),null);
assert.equal(capitalSourceTotal([]),null);
assert.equal(capitalSourceTotal([{amount:0}]),0);
assert.equal(capitalSourceTotal([{amount:900},{amount:1050}]),1950);
for(const amount of [undefined,'1',NaN,Infinity,-1,0.1])assert.equal(capitalSourceTotal([{amount}]),null);
assert.equal(capitalSourceTotal([{amount:Number.MAX_SAFE_INTEGER},{amount:1}]),null);
assert.deepEqual(capitalSourceGroups(sources),[
 {name:'자기자본',people:[{name:'공동 투자자',amount:0,role:'재무출자'}],total:0},
 {name:'Tr.A',people:[{name:'공동 투자자',amount:900,role:'선순위'},{name:'공동 투자자',amount:1050,role:'선순위'}],total:1950},
 {name:'본PF · 후순위',people:[{name:'미입력 대주',amount:null,role:'후순위'}],total:null},
]);
assert.equal(capitalSourceGroups([{...sources[0],tranche:'Tr.A'},sources[1]]).length,2,'동일 이름의 자본/차입은 별도 그룹');
const valid=sources.slice(0,3),historical=structuredClone(validateCapitalSources(valid));
assert.notEqual(historical,valid);
project.loans[0].commitment=1200;project.loans[0].institution='새 대주';
assert.equal(capitalSourceTotal(currentCapitalSources(project).slice(0,3)),2250);
assert.equal(capitalSourceTotal(historical),1950);
assert.equal(historical[1].party,'공동 투자자');
assert.deepEqual(validateCapitalSources([]),[]);
for(const bad of [null,{},[null],Array.from({length:101},(_,i)=>({...valid[0],id:String(i)})),
 [...valid,{...valid[0]}],[{...valid[0],id:''}],[{...valid[0],kind:'other'}],
 [{...valid[0],party:' '}],[{...valid[0],party:'가'.repeat(101)}],
 [{...valid[0],tranche:''}],[{...valid[0],tranche:'가'.repeat(81)}],
 ...[null,'0',-1,0.5,Infinity,Number.MAX_SAFE_INTEGER+1].map(amount=>[{...valid[0],amount}]),
 [{...valid[0],amount:Number.MAX_SAFE_INTEGER},{...valid[1],amount:1}],
])assert.throws(()=>validateCapitalSources(bad));
const sameNames=validateCapitalSources(valid);
assert.equal(sameNames.length,3,'동일 투자자 이름은 병합/중복거절하지 않음');
sameNames[0].party='편집';
assert.equal(valid[0].party,'공동 투자자','검증 반환값은 입력 객체를 공유하지 않음');
assert.deepEqual(currentCapitalSources({}),[]);
assert.equal(currentCapitalSources({loans:[{id:'unknown',commitment:true}]})[0].amount,null);
console.log('LOCAL-UI-158 조달 원금액·기록ID·누락/0·합계 안전범위·과거 보존 검사 통과');
