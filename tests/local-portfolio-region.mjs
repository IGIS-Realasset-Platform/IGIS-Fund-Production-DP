import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const projects=[
 {id:'seoul-jung',name:'중구',location:'서울특별시 중구',type:'오피스',stage:'인허가'},
 {id:'seoul-yongsan',name:'용산',location:'서울특별시 용산구',type:'복합개발',stage:'공사'},
 {id:'yongin',name:'용인',location:'경기도 용인시',type:'물류',stage:'검토'},
 {id:'missing',name:'미입력',location:'',type:'오피스',stage:'검토'}
].map(p=>({...p,basic:{},building:{},cbs:[],milestones:[]}));
const h=makeHarness({modules:['core','cbs','recovery-views'],seed:{projects,entities:[],notifications:[],auditEvents:[]}}),A=h.A;
const snapshot=JSON.stringify(A.state),ids=()=>Array.from(A.recoveryViews.projectRows(),p=>p.id);
A.ui.portfolioCity='서울특별시';assert.deepEqual(ids(),['seoul-jung','seoul-yongsan']);
A.ui.portfolioDistrict='중구';assert.deepEqual(ids(),['seoul-jung']);
A.ui.portfolioType='물류';assert.deepEqual(ids(),[]);
A.ui.portfolioType='';A.ui.portfolioDistrict='';A.ui.portfolioCity='경기도 용인시';assert.deepEqual(ids(),['yongin']);
assert.deepEqual(JSON.parse(JSON.stringify(A.recoveryViews.projectRegion({location:'경기도 용인시'}))),{city:'경기도 용인시',district:''});
assert.deepEqual(JSON.parse(JSON.stringify(A.recoveryViews.projectRegion({location:'서울특별시 중구'}))),{city:'서울특별시',district:'중구'});
A.render=()=>{};A.persistUI=()=>{};
const change=(id,value)=>h.listeners.change.forEach(fn=>fn({target:{id,value}}));
A.ui.portfolioDistrict='중구';change('portfolioCity','경기도 용인시');assert.equal(A.ui.portfolioDistrict,'');
A.ui.portfolioCity='서울특별시';A.ui.portfolioDistrict='용산구';A.ui.portfolioSearch='용산';assert.deepEqual(ids(),['seoul-yongsan']);
const button={dataset:{action:'portfolio-reset'}};h.listeners.click[0]({target:{closest:()=>button},preventDefault(){}});
assert.equal(A.ui.portfolioCity,'');assert.equal(A.ui.portfolioDistrict,'');assert.equal(A.ui.portfolioSearch,'');assert.equal(ids().length,4);
assert.equal(JSON.stringify(A.state),snapshot);
console.log('region filters, combination, city reset and data preservation passed');
