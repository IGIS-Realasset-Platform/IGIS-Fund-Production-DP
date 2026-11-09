import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const stubs = {
 auth: `export const useAuth=()=>({user:{id:window.fixtureUser||'reader'},memberInfo:{auth_id:window.fixtureUser||'reader',staff_name:window.fixtureName||'일반 사용자'},signOut:async()=>{}});`,
 db: `const q={select(){return q},eq(){return q},then(fn){return Promise.resolve({count:0,data:[]}).then(fn)}}; const channel={on(){return channel},subscribe(){return channel}}; export const supabase={from(){return q},channel(){return channel},removeChannel(){}};`,
 firebase: `export const requestFirebaseNotificationPermission=()=>{};`,
 home: `import React from 'react';export default function Home({onNavigateToTab}){return <button onClick={()=>onNavigateToTab(1,null,{viewMode:'director'})}>보고 더보기</button>}`,
 notifications: `import React from 'react';export default function Notifications({onNotificationClick}){return <button onClick={()=>onNotificationClick({reference_id:'post-1|FEED_COMMITTEE|comment-1'})}>운영위 알림</button>}`,
 cells: `import React from 'react';export default ()=> <p>기능셀 내용</p>;`,
 my: `import React from 'react';export default ()=> <p>MY 내용</p>;`,
 empty: `export default ()=>null;`,
 feed: `import React from 'react';export default ({feedKind})=><p>본문 {feedKind}</p>;`,
};

const fixture = `
import React,{useState,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Mobile from './src/components/mobile/MobileIotaApp.jsx';
import Sidebar from './src/components/system/IotaLeftNav.jsx';
import Discussion from './src/components/system/WorkFeedDiscussionPage.jsx';
function Desktop(){
 const [path,setPath]=useState(window.location.pathname.slice(1));
 useEffect(()=>{const sync=()=>setPath(window.location.pathname.slice(1));window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[]);
 return <><Sidebar currentPath={path}/>{path==='platform/iotaseoul/discussion'?<Discussion/>:<p>다른 메뉴 내용</p>}</>;
}
createRoot(document.getElementById('root')).render(window.innerWidth<768?<Mobile navigateTo={()=>{}}/>:<Desktop/>);`;
const bundle=await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',define:{'import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'},plugins:[{name:'offline',setup(b){
 const paths=[[/AuthContext$/,'auth'],[/supabaseClient$/,'db'],[/utils\/firebase$/,'firebase'],[/\/MobileHome$/,'home'],[/\/MobileNotifications$/,'notifications'],[/\/MobileCollaborationContainer$/,'cells'],[/\/MobileMyTasks$/,'my'],[/\/MobileComposerSheet$/,'empty'],[/\/MobilePmoTaskList$/,'empty'],[/\/MobileWorkflowLogs$/,'empty'],[/\/WorkFeedPage$/,'feed']];
 for(const [filter,path] of paths)b.onResolve({filter},()=>({path,namespace:'stub'}));
 b.onLoad({filter:/.*/,namespace:'stub'},({path})=>({contents:stubs[path],loader:'jsx',resolveDir:process.cwd()}));
}}]});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 for(const mobile of [false,true])for(const name of ['이철승','권순일','강순용','양준모']){
  const page=await browser.newPage({viewport:{width:mobile?375:1440,height:900}});page.setDefaultTimeout(8000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({name})=>{window.fixtureUser=name;window.fixtureName=name;},{name});
  await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:`<html><body><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body></html>`}));
  const base='http://director-fixture.test'+(mobile?'/mobile/':'/platform/iotaseoul/workflow');
  const menu=()=>mobile?page.getByRole('button',{name:'논의/협업',exact:true}):page.getByText('논의/협업',{exact:true}).first();
  const selected=async label=>assert.equal(await page.getByRole('tab',{name:label,exact:true}).getAttribute('aria-selected'),'true',`${name} ${mobile?'mobile':'PC'} ${label}`);
  await page.goto(base);
  await page.evaluate(name=>sessionStorage.setItem(`iota:mobile-tabs:v1:${name}:discussion`,'"open"'),name);
  await menu().click();await selected('운영위 논의사항');
  await page.getByRole('tab',{name:'실무 업무피드',exact:true}).click();await selected('실무 업무피드');
  await page.reload();await selected('실무 업무피드');
  if(mobile)await page.getByRole('button',{name:'MY',exact:true}).click();
  else await page.getByText('통합업무',{exact:true}).first().click();
  await menu().click();await selected('운영위 논의사항');
  const direct='http://director-fixture.test'+(mobile?'/mobile/':'/platform/iotaseoul/discussion')+'?feed=open&logId=post-1';
  await page.goto(direct);await selected('실무 업무피드');assert.equal(new URL(page.url()).searchParams.get('logId'),'post-1');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: all four directors on PC/mobile; stale open tab ignored on menu entry; refresh and explicit links preserved');
}finally{await browser.close()}
