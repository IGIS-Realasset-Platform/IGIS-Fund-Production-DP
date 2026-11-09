import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// In-memory fixture: real form components, no website/server or database writes.
const fixture = `
import React, {useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import Composer from './src/components/system/WorkFeedComposer.jsx';
import Search from './src/components/system/WorkFeedSearchField.jsx';
import Visibility from './src/components/system/WorkFeedVisibilityModal.jsx';
import {MobileFeedEngagementSummary} from './src/components/system/WorkFeedReactions.jsx';
function Fixture(){
 const [mobile,setMobile]=useState(true), [edit,setEdit]=useState(false), [expanded,setExpanded]=useState(false), [query,setQuery]=useState(''), [modal,setModal]=useState(false);
 const [permissions,setPermissions]=useState(['이철승','권순일','양준모','강순용']);
 const [fields,setFields]=useState({projectId:'IOTA_COMMON',triageType:'공유',issueStatus:'검토중',priority:'중간',workDate:'2026-11-09',title:'',content:'',companyQuery:'',contactQuery:''});
 const textRef=useRef(null), fileRef=useRef(null);
 const setters=Object.fromEntries(Object.keys(fields).map(key=>[key,value=>setFields(old=>({...old,[key]:value}))]));
 window.fixtureMobile=setMobile;window.fixtureEdit=setEdit;
 return <main className="w-full px-4 pt-3" style={{maxWidth:1200,margin:'auto'}}>
  <div className="w-full px-5 text-[11px]"><div className="flex flex-wrap items-center justify-between gap-2"><span>26.11.09</span><MobileFeedEngagementSummary log={{metadata:{reactions:{like:['a@x','b@x','c@x'],check:['a@x','d@x','e@x','f@x']},comments:[{id:'test'}]}}} pilotMembers={[]}/></div></div>
  <Search value={query} onChange={setQuery} mobileMode={mobile}/>
  <div className="mt-3 w-full rounded-[24px] border border-[#82afb9] bg-[#262626] overflow-hidden">
   <Composer mobileMode={mobile} editMode={edit} memberInfo={{staff_name:'테스트 사용자'}} expanded={expanded} setExpanded={setExpanded} onCancel={()=>setEdit(false)} fields={fields} setters={setters} textareaRef={textRef} formId="layout-check"
    onContentChange={e=>setters.content(e.target.value)} onRefreshDirectory={()=>{}} onRefreshContacts={async()=>{}} onContactSelect={setters.contactQuery} mentions={[]} showMentions={false} onMentionSelect={()=>{}} onCloseMentions={()=>{}}
    companyOptions={['테스트 회사']} contactOptions={['검증 담당자','다른 담당자']} permissions={permissions} files={[{name:'아주긴첨부파일이름'.repeat(12)+'.pdf',path:'fixture'}]} onRemoveFile={()=>{}} fileInputRef={fileRef} onFileUpload={()=>{}} onChooseFiles={()=>{window.fileAction=true;}} uploading={false}
    onVisibility={()=>setModal(true)} onSubmit={()=>{window.submitted={...fields};}} submitting={false}/>
  </div>
  {modal&&<Visibility groups={['CM','공간솔루션']} members={[...permissions.map(name=>({id:name,name,group:'CM'})),{id:'검증 사용자',name:'검증 사용자',group:'CM'}]} selectedGroups={[]} selectedIndividuals={permissions} onApply={(groups,people)=>{setPermissions(people);setModal(false);}} onClose={()=>setModal(false)}/>}
 </main>;
}
createRoot(document.getElementById('root')).render(<Fixture/>);`;
const bundle = await build({stdin:{contents:fixture,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,format:'iife',platform:'browser',define:{'import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'}});
const cssFile=(await fs.readdir('dist/assets')).find(name=>name.endsWith('.css'));
assert(cssFile,'Run npm run build before the layout check');
const css=await fs.readFile('dist/assets/'+cssFile,'utf8');
const headerBundle = await build({
 stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import Discussion from './src/components/system/WorkFeedDiscussionPage.jsx';createRoot(document.getElementById('root')).render(<Discussion mobileMode initialFeed="open"/>);`,resolveDir:process.cwd(),loader:'jsx'},
 bundle:true,write:false,format:'iife',platform:'browser',define:{'process.env.NODE_ENV':'"production"'},
 plugins:[{name:'header-fixture',setup(builder){
  builder.onResolve({filter:/supabaseClient$/},()=>({path:'database',namespace:'fixture'}));
  builder.onResolve({filter:/context\/AuthContext$/},()=>({path:'auth',namespace:'fixture'}));
  builder.onResolve({filter:/^\.\/WorkFeedPage$/},()=>({path:'feed',namespace:'fixture'}));
  builder.onLoad({filter:/.*/,namespace:'fixture'},({path})=>({loader:'jsx',resolveDir:process.cwd(),contents:path==='database' ? 'export const supabase={};' : path==='auth' ? 'export const useAuth=()=>({memberInfo:{staff_name:"테스트 사용자"}});' : `import React from 'react';export default function Feed({mobileSearchOpen}){return mobileSearchOpen ? <input aria-label="게시글 검색" autoFocus/> : null;}`}));
 }}]
});
const detailBundle = await build({stdin:{contents:`
import React from 'react';import {createRoot} from 'react-dom/client';
import Footer from './src/components/system/WorkFeedMobileFooter.jsx';
import Comments from './src/components/system/WorkFeedComments.jsx';
const reactions={like:Array.from({length:12},(_,i)=>i+'@example.com'),check:Array.from({length:12},(_,i)=>i+'@example.com')};
createRoot(document.getElementById('root')).render(<main className="px-4"><div style={{paddingLeft:21,paddingRight:21}}><p data-testid="list-text">목록 텍스트</p></div><section aria-label="상세 검증" style={{marginLeft:21,marginRight:21}} className="py-4">
<p data-testid="detail-text">모바일 상세 본문</p>
<Footer log={{writer_staff_id:'test@example.com',metadata:{reactions,comments:Array.from({length:12},(_,id)=>({id}))}}} actorEmail="test@example.com" members={[]} permissionText="이철승, 강순용, 권순일, 양준모, CM, 공간솔루션" onReact={()=>{}} onEdit={()=>window.editAction=true} onDelete={()=>window.deleteAction=true}/>
<Comments mobileMode comments={[{id:'test',author:'검증 사용자',author_email:'test@example.com',created_at:'2026-11-09',text:'댓글 본문',reactions}]} actorEmail="test@example.com" members={[]} onSave={text=>{window.savedComment=text;}} onEdit={()=>{}} onDelete={()=>{}} onReact={()=>{}} renderText={text=>text}/>
</section></main>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,format:'iife',platform:'browser',define:{'import.meta.env.BASE_URL':'"/"','process.env.NODE_ENV':'"production"'}});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.request().resourceType()==='image' ? route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"/>'}) : route.abort());
 page.setDefaultTimeout(10000);
 const checkBounds=async(label)=>{
  const overflow=await page.evaluate(()=>{
   const width=window.innerWidth;
   return [...document.querySelectorAll('input:not([type=file]),textarea,select,button')].filter(el=>{
    const r=el.getBoundingClientRect();return r.width>0&&(r.left < -1||r.right>width+1);
   }).map(el=>({text:el.getAttribute('aria-label')||el.textContent.slice(0,30),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}));
  });
  assert.deepEqual(overflow,[],label+' horizontal control overflow');
 };
 for(const width of [320,375,430,844]){
  await page.setViewportSize({width,height:900});
  await page.setContent('<html><head><style>'+css+'</style></head><body style="margin:0;background:#1f1f1e"><div id="root"></div></body></html>');
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  await page.getByLabel('게시글 검색').fill('검토');
  const search=await page.getByLabel('게시글 검색').boundingBox();
  assert(Math.abs(search.width-(width-32))<2, 'Mobile search fills the content width: '+JSON.stringify({width,search}));
  await page.getByRole('button',{name:'글쓰기',exact:true}).click();
  await page.getByLabel('제목',{exact:true}).fill('모바일 레이아웃 검증');
  await page.getByLabel('본문',{exact:true}).fill('휴대폰에서 입력하는 긴 본문 '.repeat(10));
  await page.getByLabel('활용목적',{exact:true}).selectOption('의사결정');
  await page.getByLabel('업무 기한',{exact:true}).fill('2026-11-20');
  await checkBounds('expanded '+width);
  assert.equal(await page.getByLabel('좋아요·체크 반응자 6명',{exact:true}).count(),1,'Reactions are deduplicated and labeled separately');
  assert.equal(await page.getByLabel('댓글 1개',{exact:true}).count(),1);
  const reactions=await page.getByLabel('게시글 반응 및 댓글',{exact:true}).boundingBox();
  assert(reactions.x>=0 && reactions.x+reactions.width<=width,'Reaction summary fits mobile width');
  const file=await page.getByRole('button',{name:'파일 첨부',exact:true}).boundingBox();
  const permission=await page.getByRole('button',{name:'열람권한',exact:true}).boundingBox();
  const submit=await page.getByRole('button',{name:'작성하기',exact:true}).boundingBox();
  assert(file.height>=44&&permission.height>=44&&submit.height>=44,'Actions need touch-sized targets');
  assert(Math.abs(file.y-permission.y)<1&&file.x+file.width<=permission.x+1,'Attachment and permission buttons must not overlap');
  assert(submit.y>=file.y+file.height,'Submit is below secondary actions');
  await page.getByLabel('담당자명',{exact:true}).fill('검증');
  await page.getByRole('option',{name:'검증 담당자',exact:true}).click();
  await page.getByRole('button',{name:'열람권한',exact:true}).click();
  await checkBounds('permissions '+width);
  await page.getByRole('button',{name:/검증 사용자/}).click();
  await page.getByRole('button',{name:'확인',exact:true}).click();
  // Tap the avatar side of the bar, outside the visible fold label.
  await page.getByRole('button',{name:'글쓰기 접기',exact:true}).click({position:{x:15,y:15}});
  await page.getByRole('button',{name:'글쓰기',exact:true}).click();
  assert.equal(await page.getByLabel('제목',{exact:true}).inputValue(),'모바일 레이아웃 검증','Collapse preserves the draft');
  await page.getByRole('button',{name:'작성하기',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.submitted.contactQuery),'검증 담당자');
  assert.equal(await page.evaluate(()=>window.submitted.workDate),'2026-11-20');
  await page.evaluate(()=>window.fixtureEdit(true));
  await page.getByRole('button',{name:'수정 완료',exact:true}).waitFor();
  await checkBounds('edit '+width);
  console.log('PASS mobile search, compose, permissions, draft, submit and edit at '+width+'px');
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>window.fixtureMobile(false));
 await page.waitForTimeout(100);
 await checkBounds('desktop');
 await page.getByLabel('업무 기한',{exact:true}).fill('2026-11-25');
 assert.equal(await page.getByLabel('업무 기한',{exact:true}).inputValue(),'2026-11-25');
 const deadline=await page.getByLabel('업무 기한',{exact:true}).boundingBox();
 const deadlineGroup=await page.getByLabel('업무 기한',{exact:true}).locator('..').locator('..').boundingBox();
 const priority=await page.getByLabel('중요도',{exact:true}).boundingBox();
 assert(Math.abs(deadlineGroup.x-(priority.x+priority.width)-12)<2,'Desktop deadline follows priority with the standard field gap');
 const close=await page.getByRole('button',{name:'수정 닫기',exact:true}).boundingBox();
 assert(deadline.x+deadline.width<=close.x && Math.abs(deadline.y-close.y)<2,'Desktop deadline and close/fold remain aligned');
 for (const width of [320,375,430]) {
  await page.setViewportSize({width,height:900});
  await page.setContent('<html><head><style>'+css+'</style></head><body style="margin:0"><div id="root"></div></body></html>');
  await page.evaluate(()=>{window.history.replaceState=()=>{};});
  await page.addScriptTag({content:headerBundle.outputFiles[0].text});
  assert.equal(await page.getByLabel('게시글 검색',{exact:true}).count(),0,'Search starts collapsed');
  assert.equal(await page.getByRole('heading',{name:'논의/협업',exact:true}).count(),0,'No large mobile title');
  const tabs=await page.getByRole('tablist').boundingBox();
  const panel=await page.getByRole('tabpanel').boundingBox();
  const searchButton=await page.getByRole('button',{name:'게시글 검색 열기',exact:true}).boundingBox();
  assert.equal(tabs.y,12,'Header top gap is 12px');
  assert.equal(panel.y-(tabs.y+tabs.height),12,'Header bottom gap is 12px');
  assert.equal(searchButton.y,tabs.y);assert.equal(searchButton.height,tabs.height);
  await page.getByRole('button',{name:'게시글 검색 열기',exact:true}).click();
  await page.getByLabel('게시글 검색',{exact:true}).fill('검색 테스트');
  await checkBounds('mobile tab header '+width);
  await page.getByRole('button',{name:'검색 닫기',exact:true}).click();
  assert.equal(await page.getByLabel('게시글 검색',{exact:true}).count(),0,'Search closes');
  await page.getByRole('button',{name:'게시글 검색 열기',exact:true}).click();
  await page.getByRole('tab',{name:'운영위 논의사항',exact:true}).click();
  assert.equal(await page.getByRole('tab',{name:'운영위 논의사항',exact:true}).getAttribute('aria-selected'),'true');
  assert.equal(await page.getByLabel('게시글 검색',{exact:true}).count(),0,'Switching tabs closes search');
 }
 console.log('PASS mobile button tabs, search toggle and header bounds');
 for (const width of [320,375,430]) {
  await page.setViewportSize({width,height:1200});
  await page.setContent('<html><head><style>'+css+'</style></head><body style="margin:0"><div id="root"></div></body></html>');
  await page.addScriptTag({content:detailBundle.outputFiles[0].text});
  assert.equal(await page.getByLabel('게시글 진행상태 변경').count(),0,'No duplicate status control in mobile detail');
  await page.getByRole('button',{name:'수정하기',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.editAction),true);
  await page.getByLabel('댓글 작성').fill('모바일 댓글 검증');
  await page.getByRole('button',{name:'댓글 등록',exact:true}).click();
  assert.equal(await page.evaluate(()=>window.savedComment),'모바일 댓글 검증');
  await checkBounds('detail actions '+width);
  const listText=await page.getByTestId('list-text').boundingBox();
  const detailText=await page.getByTestId('detail-text').boundingBox();
  assert.equal(detailText.x,listText.x,'Detail text left edge matches list');
  assert.equal(detailText.width,listText.width,'Detail text right edge matches list');
  const like=await page.getByRole('button',{name:'좋아요',exact:true}).first().boundingBox();
  const edit=await page.getByRole('button',{name:'수정하기',exact:true}).boundingBox();
  const remove=await page.getByRole('button',{name:'수정하기',exact:true}).locator('..').getByRole('button',{name:'삭제',exact:true}).boundingBox();
  assert.equal(like.y,edit.y);assert.equal(edit.y,remove.y);
  assert(Math.abs(edit.width-remove.width)<1,'Mobile edit/delete controls have equal widths');
  const permissions=await page.getByText(/^열람권한:/).boundingBox();
  const count=await page.getByText('댓글 12',{exact:true}).boundingBox();
  assert.equal(permissions.y,count.y,'Comment count shares permission row');
  assert(count.x>=permissions.x+permissions.width,'Comment count is right-aligned beside permissions');
  assert(like.y>=permissions.y+permissions.height,'Reactions are below permissions');
  const input=await page.getByLabel('댓글 작성').boundingBox();
  assert(input.y>=edit.y+edit.height,'Actions precede the comment input');
  const comment=await page.getByText('댓글 본문',{exact:true}).boundingBox();
  assert(comment.y>=edit.y+edit.height,'Actions precede existing comments too');
  assert.equal((await page.getByRole('button',{name:'좋아요',exact:true}).first().boundingBox()).height,28,'Compact mobile reaction height');
  const overlaps=await page.getByLabel('상세 검증',{exact:true}).evaluate(root=>{
   const controls=[...root.querySelectorAll('button,select,textarea')].map(el=>({name:el.getAttribute('aria-label')||el.textContent,box:el.getBoundingClientRect()}));
   const failures=[];const bounds=root.getBoundingClientRect();
   for(let i=0;i<controls.length;i++){
    const a=controls[i];if(a.box.left<bounds.left||a.box.right>bounds.right)failures.push(a.name+' outside detail');
    for(let j=i+1;j<controls.length;j++){const b=controls[j];if(Math.min(a.box.right,b.box.right)-Math.max(a.box.left,b.box.left)>1&&Math.min(a.box.bottom,b.box.bottom)-Math.max(a.box.top,b.box.top)>1)failures.push(a.name+' overlaps '+b.name);}
   }return failures;
  });
  assert.deepEqual(overlaps,[],'No detail control overlap at '+width);
 }
 console.log('PASS narrow mobile detail actions, reactions and comment submission without overlap');
 assert.deepEqual(errors,[],'No runtime errors');
 console.log('PASS desktop layout and runtime regression');
} finally { await browser.close(); }
