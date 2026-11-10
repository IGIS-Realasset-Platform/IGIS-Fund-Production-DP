import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import {COMMITTEE_READERS,getWorkFeedPermissions} from '../src/utils/workFeedPermissions.js';
assert.deepEqual(getWorkFeedPermissions('committee').individuals,COMMITTEE_READERS);
assert.deepEqual(getWorkFeedPermissions('committee',{individuals:['양준모']}).individuals,['양준모']);
assert.deepEqual(getWorkFeedPermissions('committee',{individuals:[]}).individuals,[]);
assert.deepEqual(getWorkFeedPermissions('open').individuals,[]);
const fixture = `
import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
import LogWriteBox from './src/components/system/LogWriteBox.jsx';
window.fixtureDB={rows:window.initialDirectoryFixture||[],inserts:[],saves:[],failInsert:false,refreshes:[]};
function Fixture(){
 const [members,setMembers]=useState(window.initialDirectoryFixture||[]);
 window.refreshDirectory=()=>setMembers([...window.fixtureDB.rows]);
 return <main style={{width:'100%',maxWidth:1100,margin:'auto',padding:16}}><LogWriteBox editMode={Boolean(window.initialEditFixture)} initialData={window.initialEditFixture || null} defaultExpanded mobileMode={window.mobileFixture} feedKind={window.feedFixture} workspaceCode="FEED_TEST" workspaceLabel="검증 게시판" memberInfo={{email:'tester@example.com',staff_name:'테스트 사용자',org_name:'기획추진'}} masterStakeholders={members} pilotMembers={['이철승','강순용','권순일','양준모','추가 인원'].map(staff_name=>({staff_name,org_name:'CM',is_active:true}))} fetchLogs={()=>{}} fetchMasterStakeholders={async(force)=>{window.fixtureDB.refreshes.push(Boolean(force));if(window.failDirectoryRefresh)throw Error("Directory unavailable");setMembers([...window.fixtureDB.rows]);}} /></main>;
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
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>r.request().resourceType()==='image'?r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}):r.abort());
 const mount=async(mobile,initialData)=>{
  await page.goto('about:blank');await page.setViewportSize({width:mobile?375:1440,height:900});
  await page.setContent('<html><head><style>'+css+'</style></head><body><div id="root"></div></body></html>');
  await page.evaluate(({mobile,initialData})=>{window.mobileFixture=mobile;window.feedFixture='committee';window.initialEditFixture=initialData;},{mobile,initialData});
  await page.addScriptTag({content:bundle.outputFiles[0].text});
 };
 const open=()=>page.getByRole('button',{name:'열람권한',exact:true}).click();
 for(const mobile of [false,true]){
  await mount(mobile,null);await open();
  for(const name of COMMITTEE_READERS)assert(await page.getByRole('button',{name:name+' 열람 인원에서 제외',exact:true}).isEnabled());
  await page.getByRole('button',{name:'확인',exact:true}).click();
  await page.getByLabel('제목',{exact:true}).fill('권한 검증');await page.getByLabel('본문',{exact:true}).fill('검증용 본문');
  await page.getByRole('button',{name:'작성하기',exact:true}).click();
  await page.waitForFunction(()=>window.fixtureDB.saves.length===1);
  let saved=await page.evaluate(()=>window.fixtureDB.saves[0].payload);
  assert.deepEqual(saved.metadata.permissions.individuals,COMMITTEE_READERS);
  await mount(mobile,{...saved,log_id:'edit'});await open();
  for(const name of COMMITTEE_READERS)await page.getByRole('button',{name:name+' 열람 인원에서 제외',exact:true}).click();
  await page.getByText('설정하지 않으면 전체 공개로 게시됩니다.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'확인',exact:true}).click();
  await page.getByRole('button',{name:'수정 완료',exact:true}).click();await page.waitForFunction(()=>window.fixtureDB.saves.length===1);
  saved=await page.evaluate(()=>window.fixtureDB.saves[0].payload);
  assert.deepEqual(saved.metadata.permissions,{groups:[],individuals:[]});
  await mount(mobile,{...saved,log_id:'edit'});await open();
  assert.equal(await page.getByRole('button',{name:/열람 인원에서 제외/}).count(),0);
  await page.getByRole('button',{name:'양준모 CM',exact:true}).click();
  await page.getByRole('button',{name:'추가 인원 CM',exact:true}).click();
  await page.getByRole('button',{name:'확인',exact:true}).click();
  await open();await page.getByRole('button',{name:'양준모 열람 인원에서 제외',exact:true}).click();
  await page.getByRole('button',{name:'취소',exact:true}).last().click();await open();
  assert.equal(await page.getByRole('button',{name:'양준모 열람 인원에서 제외',exact:true}).count(),1);
  await page.getByRole('button',{name:'확인',exact:true}).click();
  await page.getByRole('button',{name:'수정 완료',exact:true}).click();await page.waitForFunction(()=>window.fixtureDB.saves.length===1);
  saved=await page.evaluate(()=>window.fixtureDB.saves[0].payload);
  assert.deepEqual(saved.metadata.permissions.individuals,['양준모','추가 인원']);
  await mount(mobile,{...saved,log_id:'edit'});await open();
  assert.equal(await page.getByRole('button',{name:/열람 인원에서 제외/}).count(),2);
  await page.getByRole('button',{name:'CM',exact:true}).click();
  await page.getByRole('button',{name:'확인',exact:true}).click();
  await page.getByRole('button',{name:'수정 완료',exact:true}).click();await page.waitForFunction(()=>window.fixtureDB.saves.length===1);
  saved=await page.evaluate(()=>window.fixtureDB.saves[0].payload);
  assert.deepEqual(saved.metadata.permissions.groups,['CM']);
  await mount(mobile,{...saved,log_id:'edit'});await open();
  assert.equal(await page.getByRole('button',{name:'CM',exact:true}).count(),1);
  console.log('PASS '+(mobile?'mobile':'desktop')+': four defaults, individually removable, empty public save/reopen, re-add, additional reader, cancellation, saved subset and group remain');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
