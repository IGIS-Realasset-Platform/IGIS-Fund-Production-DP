import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const projects=[
 {id:'a',name:'A',initial:100,current:150,area:10},
 {id:'b',name:'B',initial:300,current:250,area:100},
 {id:'c',name:'C',initial:200,current:300,area:10},
 {id:'d',name:'D',initial:null,current:null,area:10},
 {id:'e',name:'E',initial:0,current:0,area:0}
].map(p=>({...p,type:'오피스',stage:'공사',location:'서울특별시 중구',basic:{},building:{gfaTotal:p.area},cbs:[],milestones:[]}));
const h=makeHarness({modules:['core','cbs','recovery-views'],seed:{projects,entities:[],notifications:[],auditEvents:[]}}),A=h.A;
A.total=(p,mode)=>mode==='initial'?p.initial:p.current;
const before=JSON.stringify(A.state),ids=()=>Array.from(A.recoveryViews.projectRows(),p=>p.id);
A.ui.portfolioSort='initial';A.ui.portfolioSortDirection='desc';assert.deepEqual(ids(),['b','c','a','e','d']);
A.ui.portfolioSortDirection='asc';assert.deepEqual(ids(),['e','a','c','b','d']);
A.ui.portfolioSort='unit';assert.deepEqual(ids(),['b','a','c','d','e']);
A.ui.portfolioSortDirection='desc';assert.deepEqual(ids(),['c','a','b','d','e']);
A.ui.portfolioSort='delta';assert.deepEqual(ids(),['c','a','e','b','d']);
A.ui.portfolioSortDirection='asc';assert.deepEqual(ids(),['b','e','a','c','d']);
A.ui.portfolioSearch='A';assert.deepEqual(ids(),['a']);A.ui.portfolioSearch='';
A.render=()=>{};A.persistUI=()=>{};
const click=key=>h.listeners.click[0]({target:{closest:()=>({dataset:{action:'portfolio-sort',key}})},preventDefault(){}});
click('initial');assert.equal(A.ui.portfolioSortDirection,'desc');click('initial');assert.equal(A.ui.portfolioSortDirection,'asc');
click('invalid');assert.equal(A.ui.portfolioSort,'initial');
assert.equal(JSON.stringify(A.state),before);
console.log('numeric sort, signed delta, per-area order, missing/zero, filter and toggle passed');
