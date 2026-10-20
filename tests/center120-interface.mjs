import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {makeHarness} from './recovery-harness.mjs';

const failures=[];
async function test(name,fn){try{await fn();console.log('PASS '+name)}catch(error){failures.push(name);console.error('FAIL '+name+': '+error.message)}}
const load=(h,name)=>vm.runInContext(fs.readFileSync('src/'+name+'.js','utf8'),h.context,{filename:'src/'+name+'.js'});
const click=(h,action,id)=>{const button={dataset:{action,id}};for(const fn of h.listeners.click||[])fn({target:{closest:()=>button},preventDefault(){}})};
const source={groups:[{key:'cak-rows',source:'cak',meta:{latest_year:2026,title:'시공능력',basis_date:'2026-08-01'},rows:[{rank:1,company:'독립 기준업체',registration_no:'source-only-1',amount_million_krw:123}]}]};

await test('CENTER120-03 cloud reference lookup never creates workspace companies',()=>{
 const h=makeHarness(),A=h.A;A.cloudMode=true;A.realMode=true;A.partnerSeed=source;h.load('partners');
 const state={companies:[],companyParticipations:[],companySalesLines:[],projects:[],marketSeries:[]};
 A.partners.initialize(state);
 assert.equal(state.companies.length,0,'기준정보를 조회하려고 회사원장을 자동 생성하면 안 됩니다.');
});

await test('CENTER120-04 personal deletion never mutates canonical notification or workspace audit',async()=>{
 const h=makeHarness(),A=h.A;let audits=0,renders=0;A.state.notifications=[{id:'n1',title:'기존 알림',at:'2026-10-20T00:00:00Z',target:{projectId:A.state.projects[0].id,view:'cost'}}];
 A.audit=()=>audits++;A.render=()=>renders++;
 if(fs.existsSync('src/notifications.js')){load(h,'notifications');await A.notifications.change('n1','delete')}
 else click(h,'notice-dismiss','n1');
 assert.equal(A.state.notifications[0].dismissed,undefined,'개인 삭제가 공용 원문을 변경했습니다.');
 assert.equal(audits,0,'개인 알림 상태 때문에 사업 감사이력·작업공간 저장을 만들면 안 됩니다.');
 assert.equal(renders,0,'개인 알림 동작에 전체 화면 재생성을 호출하면 안 됩니다.');
});

if(failures.length)process.exitCode=1;
