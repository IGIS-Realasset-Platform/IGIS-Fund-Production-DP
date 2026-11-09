import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { maskCommitteePostForPreview, canPreviewWorkFeed } from '../src/utils/workFeedPreview.js';
const fixturePost={log_id:'secret-post',feed_kind:'committee',can_read:true,summary:'SECRET_TITLE',raw_text:'SECRET_BODY',writer_name:'전기영',writer_staff_id:'admin@example.test',work_date:'2026-11-09',created_at:'2026-11-09T01:00:00Z',metadata:{project_name:'IOTA 공통',issue_status:'검토중',triage_type:'공유',priority:'중간',permissions:{individuals:['이철승'],groups:[]},comments:[{id:'c',text:'SECRET_COMMENT'}],attachedFiles:[{name:'SECRET_FILE',path:'secret'}],reactions:{likes:['secret@example.test']}},iota_seoul_log_stakeholders:[{sh_name:'SECRET_COMPANY'}]};
assert(!JSON.stringify(maskCommitteePostForPreview(fixturePost)).includes('SECRET'));
assert.equal(maskCommitteePostForPreview(fixturePost).can_read,false);
assert.equal(fixturePost.summary,'SECRET_TITLE','mask must not mutate source');
assert(canPreviewWorkFeed({staff_name:'전기영'}));assert(!canPreviewWorkFeed({staff_name:'권순일'}));
const stubs={
 auth:`export const useAuth=()=>({user:{id:'fixture'},memberInfo:{staff_name:window.fixtureReader?'일반 사용자':'전기영',email:'admin@example.test',is_active:true},loading:false});`,
 db:`import {maskCommitteePostForPreview} from './src/utils/workFeedPreview.js';export const supabase={rpc:async(name)=>{if(name==='can_access_iota_work_feed')return {data:true};if(name==='list_iota_committee_feed')return {data:[window.fixtureReader?maskCommitteePostForPreview(window.fixturePost):window.fixturePost]};throw Error('Unexpected mutation '+name)},from(){throw Error('Unexpected table access')}};`,
 directory:`export const fetchWorkspaceDirectoryData=async()=>({stakeholders:[],pilotMembers:[]});`,
 composer:`import React from 'react';export default ()=> <button>작성 폼</button>;`,
 empty:`export default ()=>null;`,
 pmo:`export const fetchLinkedTasksByLogIds=async()=>({});export const PMO_PROJECT_LABELS={};`,
};
const bundle=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import Feed from './src/components/system/WorkFeedPage.jsx';createRoot(document.getElementById('root')).render(<Feed mobileMode={window.innerWidth<768} embedded/>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',define:{'import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'},plugins:[{name:'offline',setup(b){
 for(const [filter,path] of [[/AuthContext$/,'auth'],[/supabaseClient$/,'db'],[/workspaceDirectoryCache(\.js)?$/,'directory'],[/pmoTaskLinks\.js$/,'pmo'],[/\/LogWriteBox$/,'composer'],[/PmoTaskBoardStaging\.jsx$/,'empty']])b.onResolve({filter},()=>({path,namespace:'stub'}));
 b.onLoad({filter:/.*/,namespace:'stub'},({path})=>({contents:stubs[path],loader:'jsx',resolveDir:process.cwd()}));
}}]});
const css=(await fs.readdir('dist/assets')).find(n=>n.endsWith('.css'));
const styles=await fs.readFile('dist/assets/'+css,'utf8');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 for(const mobile of [false,true]){
  const page=await browser.newPage({viewport:{width:mobile?390:1440,height:900}});page.setDefaultTimeout(8000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(post=>{window.fixturePost=post},fixturePost);
  await page.route('**/*',route=>route.request().resourceType()==='image'?route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'}):route.fulfill({contentType:'text/html',body:`<html><head><style>${styles}</style></head><body style="background:#1f1f1e;padding:20px"><div id="root"></div><script>${bundle.outputFiles[0].text}</script></body></html>`}));
  await page.goto('http://preview-fixture.test/?feed=committee');
  await page.getByText('SECRET_TITLE',{exact:true}).waitFor();
  await page.getByRole('button',{name:'권한 없는 화면 보기',exact:true}).click();
  await page.getByText('열람 권한이 없는 글입니다.',{exact:true}).waitFor();
  assert(!await page.locator('#root').innerHTML().then(html=>html.includes('SECRET')),'No secret in DOM or tooltips');
  assert.equal(await page.getByRole('button',{name:'작성 폼'}).count(),0);
  await page.getByRole('searchbox',{name:'게시글 검색'}).fill('SECRET_TITLE');
  assert.equal(await page.locator('#secret-post').count(),0,'masked titles cannot be found through search');
  await page.getByRole('searchbox',{name:'게시글 검색'}).fill('');
  await page.getByText('열람 권한이 없는 글입니다.',{exact:true}).waitFor();
  await page.locator('#secret-post [aria-disabled="true"]').click({force:true});
  assert.equal(new URL(page.url()).searchParams.get('logId'),null);
  await page.evaluate(()=>{history.pushState(null,'','?feed=committee&logId=secret-post');window.dispatchEvent(new Event('popstate'));window.dispatchEvent(new CustomEvent('iota_log_updated',{detail:{taskId:null}}))});
  await page.getByText('열람 권한이 없는 글입니다.',{exact:true}).waitFor();
  assert.equal(await page.getByText('SECRET_BODY',{exact:true}).count(),0,'deep link and refetch cannot open preview content');
  await page.getByRole('button',{name:'미리보기 종료'}).click();
  await page.getByText('SECRET_BODY',{exact:true}).waitFor();
  await page.addInitScript(()=>{window.fixtureReader=true});await page.goto('http://preview-fixture.test/?feed=committee&logId=secret-post');
  await page.getByText('열람 권한이 없는 글입니다.',{exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'권한 없는 화면 보기'}).count(),0);
  assert(!await page.locator('#root').innerHTML().then(html=>html.includes('SECRET')));
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS: PC/mobile admin preview, safe metadata, click/deep-link/refetch denial, exit restores view, non-admin preview hidden');
}finally{await browser.close()}
