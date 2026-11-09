import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { normalizeStakeholder, findRegisteredStakeholder, registerStakeholder } from '../src/utils/stakeholderRegistration.js';

assert.deepEqual(normalizeStakeholder('  회사  ', ' 담당자 ', '운영 파트너'), {company_name:'회사',contact_name:'담당자',role_category:'운영 파트너'});
assert.equal(findRegisteredStakeholder([{company_name:'회사',contact_name:'기존'}],normalizeStakeholder('회사','신규')),undefined);
await assert.rejects(registerStakeholder({},normalizeStakeholder('','담당자','운영 파트너')),/회사/);

const fixture = `
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import LogWriteBox from './src/components/system/LogWriteBox.jsx';
window.fixtureDB={rows:window.initialDirectoryFixture||[],inserts:[],saves:[],failInsert:false,refreshes:[]};
function Fixture(){
 const [members,setMembers]=useState(window.initialDirectoryFixture||[]);
 window.refreshDirectory=()=>setMembers([...window.fixtureDB.rows]);
 return <main style={{width:'100%',maxWidth:1100,margin:'auto',padding:16}}><LogWriteBox editMode={Boolean(window.initialEditFixture)} initialData={window.initialEditFixture || null} defaultExpanded mobileMode={window.mobileFixture} feedKind={window.feedFixture} workspaceCode="FEED_TEST" workspaceLabel="검증 게시판" memberInfo={{email:'tester@example.com',staff_name:'테스트 사용자',org_name:'기획추진'}} masterStakeholders={members} pilotMembers={[{staff_name:'양준모',org_name:'CM',auth_id:'yang',is_active:true}]} fetchLogs={()=>{}} fetchMasterStakeholders={async(force)=>{window.fixtureDB.refreshes.push(Boolean(force));if(window.failDirectoryRefresh)throw Error("Directory unavailable");setMembers([...window.fixtureDB.rows]);}} /></main>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);`;
const client = `export const supabase={from(table){
 let kind='read',input=null,filters=[];const q={select(){return q},eq(key,value){filters.push([key,value]);return q},limit(){return q},single(){return q},insert(row){kind='insert';input=row;return q},then(resolve,reject){return Promise.resolve().then(()=>{
  const db=window.fixtureDB;
  if(table!=='iota_stakeholder_master')throw Error('Unexpected DB write/read: '+table);
  if(kind==='insert'){
   if(db.failInsert)return {data:null,error:{code:'42501',message:'등록 권한 검증 오류'}};
   const row={id:'fixture-'+db.rows.length,...input};db.inserts.push(row);db.rows.push(row);return {data:row,error:null};
  }
  return {data:db.rows.filter(row=>filters.every(([key,value])=>row[key]===value)),error:null};
 }).then(resolve,reject)}};return q;}};`;
const bundle=await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'browser',format:'iife',define:{'import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'},plugins:[{name:'offline-backend',setup(b){
 b.onResolve({filter:/supabaseClient$/},()=>({path:'db',namespace:'fixture'}));
 b.onResolve({filter:/context\/AuthContext$/},()=>({path:'auth',namespace:'fixture'}));
 b.onResolve({filter:/utils\/workFeeds$/},()=>({path:'feeds',namespace:'fixture'}));
 b.onResolve({filter:/notificationHelpers$/},()=>({path:'notify',namespace:'fixture'}));
 b.onResolve({filter:/pmoTaskLinks\.js$/},()=>({path:'pmo',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},({path})=>({loader:'js',contents:({db:client,auth:'export const useAuth=()=>({user:{id:"fixture-user"}});',feeds:'export async function mutateWorkFeed(feed,action,id,payload){window.fixtureDB.saves.push({feed,action,id,payload});return {log_id:id};}',notify:'export const notifyMembersOnLogCreation=async()=>{};',pmo:'export const fetchLogTaskIds=async()=>[];export const fetchPmoTaskOptions=async()=>[];export const replaceLogTaskLinks=async()=>{};export const PMO_PROJECT_LABELS={};'})[path]}));
}}]});
const cssName=(await fs.readdir('dist/assets')).find(name=>name.endsWith('.css'));
const css=await fs.readFile('dist/assets/'+cssName,'utf8');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage({hasTouch:true});page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/*',r=>r.request().resourceType()==='image'?r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}):r.abort());
 for(const mobile of [false,true])for(const feed of ['committee','open']){
  await page.setViewportSize({width:mobile?375:1440,height:1000});
  await page.goto('about:blank');
  await page.setContent('<html><head><style>'+css+'</style></head><body style="margin:0"><div id="root"></div></body></html>');
  await page.evaluate(({mobile,feed})=>{window.mobileFixture=mobile;window.feedFixture=feed;},{mobile,feed});
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.getByLabel('제목',{exact:true}).fill('신규 이해관계자 등록 검증');
  await page.getByLabel('본문',{exact:true}).fill('@양');
  if(mobile){await page.setViewportSize({width:375,height:400});await page.waitForFunction(()=>{const r=document.querySelector('[aria-label="태그할 사람과 부서"]')?.getBoundingClientRect();return r&&r.top>=0&&r.bottom<=400;});await page.getByRole('option',{name:/@양준모/}).tap();await page.setViewportSize({width:375,height:1000});}else{await page.getByRole('option',{name:/@양준모/}).click();}
  assert.equal(await page.getByLabel('본문',{exact:true}).inputValue(),'@양준모 ');
  await page.getByLabel('본문',{exact:true}).fill('@');
  assert.match(await page.getByRole('listbox',{name:'태그할 사람과 부서'}).getByRole('option').first().innerText(), /양준모/);
  await page.getByLabel('본문',{exact:true}).press('Enter');
  assert.equal(await page.getByLabel('본문',{exact:true}).inputValue(),'@양준모 ');
  await page.getByLabel('본문',{exact:true}).fill('@CM');
  await page.getByRole('option',{name:/부서.*@CM/}).click();
  assert.equal(await page.getByLabel('본문',{exact:true}).inputValue(),'@CM ');
  await page.getByLabel('본문',{exact:true}).fill('등록 후 글 저장까지 검증하는 본문');
  await page.getByPlaceholder('회사·기관명').fill(' 신규회사 ');
  await page.getByLabel('담당자명',{exact:true}).fill(' 신규담당자 ');
  assert.equal(await page.getByRole('status').filter({hasText:'신규 등록할 수 있습니다.'}).count(),1,'New company-contact pair shows the registration bubble');
  const hint=await page.getByRole('status').filter({hasText:'신규 등록할 수 있습니다.'}).boundingBox();
  assert(hint.x>=0 && hint.x+hint.width<=(mobile?375:1440),'Registration hint fits the viewport');
  await page.getByRole('button',{name:'작성하기',exact:true}).click();
  const modal=page.getByRole('dialog',{name:'신규 이해관계자 등록'});
  await modal.waitFor();
  assert.equal(await page.evaluate(()=>window.fixtureDB.saves.length),0,'Do not bypass registration');
  await modal.getByLabel('신규 이해관계자 분류').selectOption('운영 파트너');
  await page.evaluate(()=>window.fixtureDB.failInsert=true);
  await modal.getByRole('button',{name:'등록 후 저장'}).click();
  await modal.getByRole('alert').waitFor();
  assert.match(await modal.getByRole('alert').innerText(),/등록 권한 검증 오류/);
  assert.equal(await page.evaluate(()=>window.fixtureDB.saves.length),0,'Registration failure must block post save');
  assert.equal(await page.getByLabel('제목',{exact:true}).inputValue(),'신규 이해관계자 등록 검증');
  await page.evaluate(()=>window.fixtureDB.failInsert=false);
  // A concurrent registration must be reused rather than inserted twice.
  if(feed==='committee')await page.evaluate(()=>window.fixtureDB.rows.push({id:'concurrent',company_name:'신규회사',contact_name:'신규담당자',role_category:'운영 파트너'}));
  await modal.getByRole('button',{name:'등록 후 저장'}).click();
  await modal.waitFor({state:'hidden'});
  await page.waitForFunction(()=>window.fixtureDB.saves.length===1);
  const db=await page.evaluate(()=>window.fixtureDB);
  assert.equal(db.rows.length,1);assert.equal(db.inserts.length,feed==='committee'?0:1);
  assert.equal(db.saves.length,1,'One click registers and saves exactly one post');
  assert.equal(db.saves[0].feed,feed);
  assert.deepEqual(db.saves[0].payload.stakeholders,[{sh_name:'신규회사 - 신규담당자',role_category:'운영 파트너'}]);
  assert.equal(await page.getByLabel('본문',{exact:true}).count()>0 ? await page.getByLabel('본문',{exact:true}).inputValue() : '', '');
  await page.getByRole('button',{name:mobile?'글쓰기':/글작성하기/}).click();
  await page.getByPlaceholder('회사·기관명').fill('신규회사');
  await page.getByLabel('담당자명',{exact:true}).fill('신');
  await page.getByRole('option',{name:'신규담당자',exact:true}).click();
  assert.equal(await page.getByRole('status').filter({hasText:'신규 등록할 수 있습니다.'}).count(),0,'Existing company-contact pair has no registration bubble');
  await page.getByLabel('제목',{exact:true}).fill('기존 이해관계자 재사용');
  await page.getByLabel('본문',{exact:true}).fill('등록된 회사 담당자를 재사용합니다.');
  await page.getByRole('button',{name:'작성하기',exact:true}).click();
  await page.waitForFunction(()=>window.fixtureDB.saves.length===2);
  assert.equal(await modal.count(),0);
  assert.equal(await page.evaluate(()=>window.fixtureDB.rows.length),1,'Autocomplete reuses the registered record');
  assert.equal(await page.evaluate(()=>window.fixtureDB.saves[1].payload.stakeholders[0].role_category),'운영 파트너');
  console.log('PASS '+feed+' '+(mobile?'mobile':'desktop')+': registration, failure/retry, duplicate reuse, normalized company-contact association, post save');
 }
 await page.goto('about:blank');
 await page.setContent('<html><head><style>'+css+'</style></head><body><div id="root"></div></body></html>');
 await page.evaluate(()=>{
  window.mobileFixture=true;window.feedFixture='open';
  window.initialEditFixture={log_id:'edit-fixture',summary:'기존 제목',raw_text:'기존 본문',metadata:{permissions:{groups:[],individuals:[]}}};
 });
 await page.addScriptTag({content:bundle.outputFiles[0].text});
 await page.getByLabel('제목',{exact:true}).fill('수정 중인 제목');
 await page.getByLabel('본문',{exact:true}).fill('수정 중인 본문');
 await page.getByPlaceholder('회사·기관명').fill('수정한 회사');
 await page.evaluate(()=>window.refreshDirectory());
 assert.equal(await page.getByLabel('제목',{exact:true}).inputValue(),'수정 중인 제목');
 assert.equal(await page.getByLabel('본문',{exact:true}).inputValue(),'수정 중인 본문');
 assert.equal(await page.getByPlaceholder('회사·기관명').inputValue(),'수정한 회사');
 console.log('PASS directory refresh preserves an in-progress edit');
 for(const feed of ['committee','open']) {
  await page.goto('about:blank');
  await page.setViewportSize({width:375,height:812});
  await page.setContent('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style></head><body style="margin:0"><div id="root"></div></body></html>');
  await page.evaluate(feed=>{
   window.mobileFixture=true;window.feedFixture=feed;
   window.initialDirectoryFixture=Array.from({length:5000},(_,i)=>({id:'person-'+i,company_name:'회사 '+i,contact_name:'담당 '+i,role_category:'운영 파트너'}));
  },feed);
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  const company=page.getByLabel('회사·기관명',{exact:true});
  const contact=page.getByLabel('담당자명',{exact:true});
  await company.tap();
  assert.equal(await page.locator('input[list],datalist').count(),0,'Mobile must not invoke the native iPhone datalist picker');
  assert.equal(await page.getByRole('listbox').getByRole('option').count(),20,'A 5,000-row directory renders only 20 candidates');
  await company.fill('회사 4999');
  await page.getByRole('option',{name:'회사 4999',exact:true}).tap();
  assert.equal(await company.inputValue(),'회사 4999','Touch selects a company without blur losing the selection');
  await contact.tap();
  assert.equal(await page.getByRole('listbox').getByRole('option').count(),1,'Contacts remain scoped to the selected company');
  await page.getByRole('option',{name:'담당 4999',exact:true}).tap();
  assert.equal(await contact.inputValue(),'담당 4999');
  for(let i=0;i<8;i++){await company.tap();await contact.tap()}
  assert((await page.evaluate(()=>window.fixtureDB.refreshes)).every(force=>!force),'Repeated focus uses the cached directory instead of forced DB reloads');
  // Keyboard-sized viewport: switching input and tapping a result must remain responsive.
  await page.setViewportSize({width:375,height:400});
  await company.fill('');await contact.fill('담당 4998');
  await page.getByRole('option',{name:'담당 4998',exact:true}).tap();
  assert.equal(await company.inputValue(),'회사 4998','Selecting a contact alone restores its company');
  await company.fill('신규 터치 회사');await contact.fill('신규 터치 담당자');
  await page.getByLabel('제목',{exact:true}).tap();
  assert.equal(await page.getByRole('listbox').count(),0,'Outside touch dismisses suggestions');
  await page.getByRole('status').filter({hasText:'신규 등록할 수 있습니다.'}).waitFor();
  await page.evaluate(()=>window.failDirectoryRefresh=true);
  await company.tap();
  await page.getByRole('status').filter({hasText:'목록을 불러오지 못했습니다.'}).waitFor();
  await company.fill('오류 후에도 입력 가능');
  await page.getByRole('button',{name:'글쓰기 접기',exact:true}).tap();
  await page.getByRole('button',{name:'글쓰기',exact:true}).tap();
  assert.equal(await company.inputValue(),'오류 후에도 입력 가능');
  console.log('PASS '+feed+' mobile touch: 5,000 records, bounded options, linked selection, repeated focus, keyboard viewport, failed refresh, draft preservation');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close()}
