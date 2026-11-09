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
function Fixture(){
 const [mobile,setMobile]=useState(true), [edit,setEdit]=useState(false), [expanded,setExpanded]=useState(false), [query,setQuery]=useState(''), [modal,setModal]=useState(false);
 const [permissions,setPermissions]=useState(['이철승','권순일','양준모','강순용']);
 const [fields,setFields]=useState({projectId:'IOTA_COMMON',triageType:'공유',issueStatus:'검토중',priority:'중간',workDate:'2026-11-09',title:'',content:'',companyQuery:'',contactQuery:''});
 const textRef=useRef(null), fileRef=useRef(null);
 const setters=Object.fromEntries(Object.keys(fields).map(key=>[key,value=>setFields(old=>({...old,[key]:value}))]));
 window.fixtureMobile=setMobile;window.fixtureEdit=setEdit;
 return <main className="w-full px-4 pt-3" style={{maxWidth:1200,margin:'auto'}}>
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
  await page.getByRole('button',{name:/업무 이슈를 공유하세요/}).click();
  await page.getByLabel('제목',{exact:true}).fill('모바일 레이아웃 검증');
  await page.getByLabel('본문',{exact:true}).fill('휴대폰에서 입력하는 긴 본문 '.repeat(10));
  await page.getByLabel('활용목적',{exact:true}).selectOption('의사결정');
  await page.getByLabel('업무 기한',{exact:true}).fill('2026-11-20');
  await checkBounds('expanded '+width);
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
  await page.getByRole('button',{name:/업무 이슈를 공유하세요/}).click();
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
 const close=await page.getByRole('button',{name:'수정 닫기',exact:true}).boundingBox();
 assert(deadline.x+deadline.width<=close.x && Math.abs(deadline.y-close.y)<2,'Desktop deadline stays immediately left of close/fold');
 assert.deepEqual(errors,[],'No runtime errors');
 console.log('PASS desktop layout and runtime regression');
} finally { await browser.close(); }
