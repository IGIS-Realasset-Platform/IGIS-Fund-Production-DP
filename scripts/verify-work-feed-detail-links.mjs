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
 directory: `export const fetchWorkspaceDirectoryData=async()=>({stakeholders:[],pilotMembers:[]});`,
 feed: `import React from 'react';import Log from './src/components/system/workspace/WorkspaceActivityLog.jsx';export default function Feed({feedKind,mobileMode}){const logs=Array.from({length:25},(_,i)=>({log_id:feedKind+'-'+i,summary:'제목 '+i,raw_text:'고유 본문 '+i,writer_name:'테스터',writer_staff_id:'test@example.com',work_date:'2026-11-09',created_at:'2026-11-09T00:00:00Z',can_read:i!==24,metadata:{comments:[],reactions:{likes:[]},issue_status:'검토중'}}));return <Log feedKind={feedKind} mobileMode={mobileMode} workspaceCode={feedKind} initialFeedResult={{logs}} canCreate={false}/>}`,
};
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './src/components/mobile/MobileIotaApp.jsx';import Discussion from './src/components/system/WorkFeedDiscussionPage.jsx';createRoot(document.getElementById('root')).render(window.innerWidth<768?<App navigateTo={()=>{}}/>:<Discussion/>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'browser',format:'iife',define:{'import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'},plugins:[{name:'offline',setup(b){
 const paths=[[/PmoTaskBoardStaging\.jsx$/,'empty'],[/workspaceDirectoryCache(\.js)?$/,'directory'],[/\/LogWriteBox$/,'empty'],[/AuthContext$/,'auth'],[/supabaseClient$/,'db'],[/utils\/firebase$/,'firebase'],[/\/MobileHome$/,'home'],[/\/MobileNotifications$/,'notifications'],[/\/MobileCollaborationContainer$/,'cells'],[/\/MobileMyTasks$/,'my'],[/\/MobileComposerSheet$/,'empty'],[/\/MobilePmoTaskList$/,'empty'],[/\/MobileWorkflowLogs$/,'empty'],[/\/WorkFeedPage$/,'feed']];
 for(const [filter,path] of paths)b.onResolve({filter},()=>({path,namespace:'stub'}));
 b.onLoad({filter:/.*/,namespace:'stub'},({path})=>({contents:stubs[path],loader:'jsx',resolveDir:process.cwd()}));
}}]});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 for(const width of [375,1440]) {
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}):route.fulfill({contentType:'text/html',body:`<html><body><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body></html>`}));
  const base='http://feed-fixture.test/'+(width<768?'mobile/':'platform/iotaseoul/discussion');
  for(const feed of ['open','committee']) {
   await page.goto(base+'?feed='+feed);
   await page.locator('[id="'+feed+'-0"]').getByText('제목 0',{exact:true}).click();
   assert.equal(new URL(page.url()).searchParams.get('logId'),feed+'-0');
   await page.getByText('고유 본문 0',{exact:true}).waitFor();
   await page.reload();await page.getByText('고유 본문 0',{exact:true}).waitFor();
   await page.locator('[id="'+feed+'-1"]').getByText('제목 1',{exact:true}).click();
   assert.equal(new URL(page.url()).searchParams.get('logId'),feed+'-1');
   await page.goBack();await page.getByText('고유 본문 0',{exact:true}).waitFor();
   await page.getByText('고유 본문 1',{exact:true}).waitFor({state:'detached'});
   await page.goForward();await page.getByText('고유 본문 1',{exact:true}).waitFor();
   await page.locator('[id="'+feed+'-1"]').getByText('제목 1',{exact:true}).first().click();
   assert.equal(new URL(page.url()).searchParams.has('logId'),false);
   await page.reload();await page.getByText('고유 본문 1',{exact:true}).waitFor({state:'detached'});
   // Direct links select the correct feed/page, regardless of remembered navigation.
   await page.goto(base+'?feed='+feed+'&logId='+feed+'-22');
   await page.getByText('고유 본문 22',{exact:true}).waitFor();
   assert.equal(new URL(page.url()).searchParams.get('logId'),feed+'-22');
   await page.goto(base+'?feed='+feed+'&logId='+feed+'-24');
   await page.getByRole('tab',{name:feed==='open'?'실무 업무피드':'운영위 논의사항'}).waitFor();
   assert.equal(await page.getByText('고유 본문 24',{exact:true}).count(),0);
  }
  assert.deepEqual(errors,[]);
  await page.close();
 }
 console.log('PASS: PC/mobile post URLs, reload, back/forward, collapse, direct page-two links, denied readership');
}finally{await browser.close()}
