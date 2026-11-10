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

stubs.animations = `export const useAnimations=()=>{};`;
stubs.language = `export const useLanguage=()=>({lang:'kr'});`;
stubs.auth = `import {useState,useEffect} from 'react';const memberInfo={auth_id:'reader',staff_name:'권순일'};const user={id:'reader'};export const useAuth=()=>{const [loggedOut,setLoggedOut]=useState(!!window.fixtureLoggedOut);useEffect(()=>{const sync=()=>setLoggedOut(!!window.fixtureLoggedOut);window.addEventListener('fixture-login',sync);return()=>window.removeEventListener('fixture-login',sync)},[]);return {user:loggedOut?null:user,memberInfo,loading:false,signOut:async()=>{}}};`;
stubs.login = `import React from 'react';export default ({onLogin})=><button onClick={()=>{window.fixtureLoggedOut=false;window.dispatchEvent(new Event('fixture-login'));onLogin()}}>테스트 로그인</button>;`;
stubs.platform = `import React from 'react';import Center from './src/components/system/PlatformCenter.jsx';export default ({currentPath})=><div data-testid="desktop"><Center currentPath={currentPath}/></div>;`;
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import App from './src/App.jsx';createRoot(document.getElementById('root')).render(<App/>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'browser',format:'iife',define:{'import.meta.env.MODE':'"staging"','import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'},plugins:[{name:'offline',setup(b){
 b.onResolve({filter:/.*/},args=>{
  if(args.importer.endsWith('/PlatformCenter.jsx') && args.path.startsWith('./') && args.path!=='./WorkFeedDiscussionPage') return {path:'empty',namespace:'stub'};
  if(args.importer.endsWith('/App.jsx') && args.path.startsWith('./components/') && !['./components/system/PlatformCore','./components/mobile/MobileIotaApp','./components/system/AuthSetup'].includes(args.path))return {path:'empty',namespace:'stub'};
 });
 const paths=[[/useAnimations$/,'animations'],[/LanguageContext$/,'language'],[/AuthSetup$/,'login'],[/PlatformCore$/,'platform'],[/PmoTaskBoardStaging\.jsx$/,'empty'],[/workspaceDirectoryCache(\.js)?$/,'directory'],[/\/LogWriteBox$/,'empty'],[/AuthContext$/,'auth'],[/supabaseClient$/,'db'],[/utils\/firebase$/,'firebase'],[/\/MobileHome$/,'home'],[/\/MobileNotifications$/,'notifications'],[/\/MobileCollaborationContainer$/,'cells'],[/\/MobileMyTasks$/,'my'],[/\/MobileComposerSheet$/,'empty'],[/\/MobilePmoTaskList$/,'empty'],[/\/MobileWorkflowLogs$/,'empty'],[/\/WorkFeedPage$/,'feed']];
 for(const [filter,path] of paths)b.onResolve({filter},()=>({path,namespace:'stub'}));
 b.onLoad({filter:/.*/,namespace:'stub'},({path})=>({contents:stubs[path],loader:'jsx',resolveDir:process.cwd()}));
}}]});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 for(const width of [375,1440]) {
  const page=await browser.newPage({viewport:{width,height:900}});page.setDefaultTimeout(8000);
  const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
  await page.route('**/*',route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}):route.fulfill({contentType:'text/html',body:`<html><body><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body></html>`}));
  for(const [feed,slug,legacy] of [['committee','committee','meeting-logs'],['open','work','open-feed']]) {
   const paths=[`/platform/iotaseoul/discussion/${slug}`,`/platform/iotaseoul/discussion?feed=${feed}`,`/platform/iotaseoul/${legacy}`,`/mobile/?feed=${feed}`];
   for(const path of paths) {
    console.log('Checking',width,path);
    // The old mobile URL is supported as a mobile entry point, regardless of viewport.
    await page.goto('http://app-fixture.test'+path+(path.includes('?')?'&':'?')+`logId=${feed}-0&commentId=comment-1`);
    await page.getByText('고유 본문 0',{exact:true}).waitFor();
    const url=new URL(page.url());
    assert.equal(url.pathname,`/platform/iotaseoul/discussion/${slug}`);
    assert.equal(url.searchParams.get('feed'),null);
    assert.equal(url.searchParams.get('logId'),`${feed}-0`);
    assert.equal(url.searchParams.get('commentId'),'comment-1');
    await page.reload();await page.getByText('고유 본문 0',{exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'MY',exact:true}).count(),width<768?1:0);
   }
  }
  // A signed-out shared link must retain the selected feed and post after login.
  await page.addInitScript(()=>{window.fixtureLoggedOut=true});
  await page.goto('http://app-fixture.test/platform/iotaseoul/discussion/work?logId=open-0&commentId=c');
  await page.getByRole('button',{name:'테스트 로그인'}).click();
  await page.getByText('고유 본문 0',{exact:true}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/platform/iotaseoul/discussion/work');
  assert.equal(new URL(page.url()).searchParams.get('commentId'),'c');
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: actual App and desktop/mobile routing; canonical and legacy links; shared post/comment links; refresh; login continuation.');
}finally{await browser.close()}
