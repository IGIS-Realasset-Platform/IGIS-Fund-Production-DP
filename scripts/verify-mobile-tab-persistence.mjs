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
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './src/components/mobile/MobileIotaApp.jsx';createRoot(document.getElementById('root')).render(<App navigateTo={()=>{}}/>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'browser',format:'iife',define:{'import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'},plugins:[{name:'offline',setup(b){
 const paths=[[/AuthContext$/,'auth'],[/supabaseClient$/,'db'],[/utils\/firebase$/,'firebase'],[/\/MobileHome$/,'home'],[/\/MobileNotifications$/,'notifications'],[/\/MobileCollaborationContainer$/,'cells'],[/\/MobileMyTasks$/,'my'],[/\/MobileComposerSheet$/,'empty'],[/\/MobilePmoTaskList$/,'empty'],[/\/MobileWorkflowLogs$/,'empty'],[/\/WorkFeedPage$/,'feed']];
 for(const [filter,path] of paths)b.onResolve({filter},()=>({path,namespace:'stub'}));
 b.onLoad({filter:/.*/,namespace:'stub'},({path})=>({contents:stubs[path],loader:'jsx',resolveDir:process.cwd()}));
}}]});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage({viewport:{width:375,height:812}});page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.fulfill({contentType:'text/html',body:`<html><body><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body></html>`}));
 await page.goto('http://mobile-fixture.test/');
 await page.getByRole('button',{name:'논의/협업',exact:true}).click();
 assert.equal(await page.getByRole('tab',{name:'실무 업무피드'}).getAttribute('aria-selected'),'true');
 for(const name of ['운영위 논의사항','실무 업무피드']){
  await page.getByRole('tab',{name}).click();await page.reload();
  assert.equal(await page.getByRole('tab',{name}).getAttribute('aria-selected'),'true');
 }
 for(const [name,text] of [['기능셀','기능셀 내용'],['MY','MY 내용'],['통합업무','보고 더보기']]){
  await page.getByRole('button',{name,exact:true}).click();await page.reload();await page.getByText(text,{exact:true}).waitFor();
 }
 await page.getByRole('button',{name:'보고 더보기'}).click();await page.reload();
 assert(await page.getByRole('button',{name:'디렉터 보고',exact:true}).getAttribute('class').then(c=>c.includes('text-white')));
 // Enter notifications using the remembered main-menu state, then exercise the real notification handler.
 await page.evaluate(()=>sessionStorage.setItem('iota:mobile-tabs:v1:reader:menu','4'));await page.reload();
 await page.getByRole('button',{name:'운영위 알림'}).click();
 assert.equal(await page.getByRole('tab',{name:'운영위 논의사항'}).getAttribute('aria-selected'),'true');
 await page.reload();assert.equal(await page.getByRole('tab',{name:'운영위 논의사항'}).getAttribute('aria-selected'),'true');
 assert(page.url().includes('logId=post-1') && page.url().includes('commentId=comment-1'));
 // A different signed-in account must not inherit the former account's menu/feed.
 await page.addInitScript(()=>{window.fixtureUser='director';window.fixtureName='권순일'});await page.goto('http://mobile-fixture.test/');
 await page.getByRole('button',{name:'보고 더보기'}).waitFor();
 await page.getByRole('button',{name:'논의/협업',exact:true}).click();
 assert.equal(await page.getByRole('tab',{name:'운영위 논의사항'}).getAttribute('aria-selected'),'true');
 await page.evaluate(()=>{sessionStorage.setItem('iota:mobile-tabs:v1:director:menu','bad json');sessionStorage.setItem('iota:mobile-tabs:v1:director:discussion','"invalid-feed"')});await page.goto('http://mobile-fixture.test/');
 await page.getByRole('button',{name:'보고 더보기'}).waitFor();
 await page.getByRole('button',{name:'논의/협업',exact:true}).click();
 assert.equal(await page.getByRole('tab',{name:'운영위 논의사항'}).getAttribute('aria-selected'),'true');
 await page.addInitScript(()=>{Object.defineProperty(window,'sessionStorage',{get(){throw new Error('Storage blocked')}})});await page.reload();
 await page.getByRole('button',{name:'MY',exact:true}).click();await page.getByText('MY 내용',{exact:true}).waitFor();
 assert.deepEqual(errors,[]);
 console.log('PASS: menu/feed/report reload persistence, notification priority, account isolation, corrupt/blocked storage');
}finally{await browser.close()}
