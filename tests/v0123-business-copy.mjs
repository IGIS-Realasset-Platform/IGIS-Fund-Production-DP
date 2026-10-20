import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';

const cbs=fs.readFileSync('src/cbs.js','utf8');
const contracts=fs.readFileSync('src/contracts.js','utf8');
const permit=fs.readFileSync('src/permit-views.js','utf8');
const recovery=fs.readFileSync('src/recovery-views.js','utf8');
const checks=[];
const check=(name,run)=>{try{run();checks.push({name,pass:true});console.log('PASS '+name)}catch(error){checks.push({name,pass:false,error:error.message});console.error('FAIL '+name+' :: '+error.message)}};

check('BIZ123-09·14 원가 버튼은 실제 수정·증감요인 범위를 말한다',()=>{
 assert(cbs.includes("A.btn('항목 정보 수정','cbs-rename'"));
 assert(cbs.includes("A.btn('증감요인 전체 보기','cbs-drivers'"));
 assert(!cbs.includes("A.btn('명칭·적용 정보','cbs-rename'"));
 assert(!cbs.includes("A.btn('전체 이력 보기','cbs-drivers'"));
});

check('BIZ123-06 계약·문서·금융 inline은 한국어 label만 추가하고 기존 인자를 유지한다',()=>{
 for(const token of ["contract:{name:'계약명'","document:{title:'문서명'","loan:{institution:'금융기관'","equities:{company:'출자자'","guarantees:{category:'담보·신용보강 구분'","guarantors:{name:'보증기관'",'label'])assert(contracts.includes(token),token);
 assert(/const inline\s*=\s*\(p, entity, id, field, value, type = 'text', options = \[\], label =/.test(contracts));
 assert(/A\.editable\(\{[^\n]*projectId: p\.id[^\n]*entity[^\n]*field[^\n]*value[^\n]*type:[^\n]*options[^\n]*display:[^\n]*label/.test(contracts));
});

check('BIZ123-06 계약 금액 검증오류는 조사 없이 한국어 label과 기존 0원 경계를 말한다',()=>{
 const labels={net:'공급가액',vat:'부가세',total:'계약총액',costAmount:'사업비 반영액'};for(const[field,label]of Object.entries(labels)){const h=makeHarness({modules:['core','contracts']}),A=h.A;A.initializers.forEach(fn=>fn(A.state));const p=A.current(),contract=p.contracts[0],before=JSON.stringify(A.state);assert.throws(()=>A.commitInline({entity:'contract',id:contract.id,field,value:-1,projectId:p.id}),new RegExp(label+'에 0원 이상의 금액을 1원 단위로 입력해 주세요\\.'));assert.equal(JSON.stringify(A.state),before)}
});

check('BIZ123-07·12·13 대출 문구는 실제 삭제조건·폼·분기기준값과 일치한다',()=>{
 for(const text of ['약정액 또는 대출 잔액이 남아 있어 삭제할 수 없습니다.','대출 정보 수정','대출 추가','분기 기준값 기록'])assert(contracts.includes(text),text);
 assert(!contracts.includes('약정 종료를 먼저 기록해 주세요.'));
 assert(!contracts.includes("l ? '대주 약정 변경' : '대주 추가'"));
 assert(!contracts.includes("button('분기값 기록','loan-quarter'"));
});

check('계약 모듈의 출자·보증·문서 필수오류는 조사 없이 label 항목을 안내한다',()=>{
 const cases=[
  {action:'financial-other-add',data:{kind:'equities'},values:{company:'',registration:'',amount:'1',purpose:'',sourcePath:''},message:'출자자 항목을 입력해 주세요.'},
  {action:'financial-other-add',data:{kind:'guarantees'},values:{category:'담보',provider:'',amount:'1',detail:'',expiry:'',sourcePath:''},message:'제공자 항목을 입력해 주세요.'},
  {action:'document-add',data:{},values:{title:'',category:'일반문서',number:'',revision:'1',date:'2026-10-07',status:'작성',location:'문서/경로',related:'',issuer:'',recipient:''},message:'문서명 항목을 입력해 주세요.'}
 ];
 for(const item of cases){const h=makeHarness({modules:['core','contracts']}),A=h.A;A.initializers.forEach(fn=>fn(A.state));const p=A.current(),before=JSON.stringify(A.state),original=A.form;let callback;A.form=(title,fields,fn)=>{callback=fn};const button={dataset:{action:item.action,...item.data}},event={target:{closest:selector=>selector==='[data-action]'?button:null},preventDefault(){}};for(const listener of h.listeners.click||[])listener(event);A.form=original;assert.equal(typeof callback,'function',item.action);assert.throws(()=>callback(item.values),new RegExp(item.message.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal(JSON.stringify(A.state),before,item.action)}
});

check('BIZ123-03·04 공정·분양 편집 이름은 현재 한국어 표제와 맞는다',()=>{
 assert(permit.includes("A.btn('공정률 기록','progress-record-add')"));
 for(const token of ["category:'구분'","unit:'단위'","total:'전체'","planned:'계획'","completed:'완료'","start:'개시일'","amount:'매각금액'"])assert(permit.includes(token),token);
 assert(/cell\(p,'sale',x,k,labels\[k\]/.test(permit));
});

check('BIZ123-05·08 개요 현안 label과 등록영역 제목은 제공 기능과 맞는다',()=>{
 for(const token of ["date:'발생일'","title:'현안'","current:'진행내용'","costImpact:'원가 영향'","scheduleImpact:'일정 영향'"])assert(recovery.includes(token),token);
 assert(/entity:'issue'[^\n]*label:labels\[k\]/.test(recovery));
 assert(recovery.includes("A.details('registration','개발업 등록'"));
 assert(!recovery.includes("A.details('registration','개발업 등록·법정 신고'"));
});

check('사업개요 직접 편집도 표제와 같은 사업기간·층수 label을 사용한다',()=>{
 assert(/field:'period'[^\n]*label:'사업기간'/.test(recovery));
 assert(/field:'floors'[^\n]*label:'층수'/.test(recovery));
});

check('원가 이력의 좁은 동작 문구는 실제 대상 범위를 말한다',()=>{
 // CENTER120 부모복귀 승인으로 내부 action 이름은 바뀔 수 있습니다.
 // 옛 audit-detail 리터럴 대신, 독립 합성 원자료의 문구·대상·읽기 동작을 검사합니다.
 const makeHistoryFixture=()=>{
  const costRows=[
   {id:'cost-root',name:'직접공사비',code:'2',dictionaryKey:'direct',parentId:null,current:null,initial:null},
   {id:'managed-main',name:'검수 도급공사비',code:'2.M01',parentId:'cost-root',templateKey:'direct_main',managementAccount:true,budgetState:'active',sourceIds:['source-known','source-zero','source-missing'],current:null,initial:null},
   {id:'managed-template',name:'검수 미입력 관리항목',code:'2.M02',parentId:'cost-root',templateKey:'direct_main',managementAccount:true,budgetState:'template',sourceIds:[],current:null,initial:null},
   {id:'source-known',name:'확인된 계약 원자료',code:'2.1',parentId:'managed-main',sourceRecord:true,current:3000000,initial:2000000,sourceIds:[]},
   {id:'source-zero',name:'명시 0원 원자료',code:'2.2',parentId:'managed-main',sourceRecord:true,current:0,initial:0,sourceIds:[]},
   {id:'source-missing',name:'금액 미확보 원자료',code:'2.3',parentId:'managed-main',sourceRecord:true,current:null,initial:null,sourceIds:[]},
   {id:'managed-other',name:'다른 관리범위',code:'2.M03',parentId:'cost-root',templateKey:'direct_demolition',managementAccount:true,budgetState:'active',sourceIds:[],current:9000000,initial:8000000}
  ];
  const p={id:'QA-HISTORY-P',name:'이력 범위 검사',type:'오피스',asOf:'2026-10-20',basic:{manager:'격리 검수'},building:{gfaTotal:100,acquisitionLandArea:100},cbs:costRows,areaVersions:[],reserveTransfers:[],classificationEvents:[],cbsManagementVersion:3,cbsCatalogVersion:4,contracts:[{id:'keep-contract',costId:'source-known',amount:3000000}],vatRecords:[{id:'keep-vat',targetRecordId:'source-known',amount:300000}],costStages:[{id:'keep-frozen',kind:'underwriting',label:'기존 확정본',date:'2026-09-30',source:'QA/기존근거.pdf',nodes:structuredClone(costRows),values:Object.fromEntries(costRows.map(r=>[r.id,r.initial])),area:{gfaTotal:100,acquisitionLandArea:100},reasons:{'source-known':'기존 금액 근거'}}]};
  const q={id:'QA-HISTORY-Q',name:'다른 사업',basic:{},building:{},cbs:[],costStages:[]};
  const audit=(id,projectId,idRef,reason)=>({id,projectId,idRef,entity:'cbs',action:'UPDATE',before:{current:2000000},after:{current:3000000},reason,actor:'격리 검수',at:'2026-10-20T00:00:00Z'});
  const selected=audit('audit-selected',p.id,'source-known','선택한 원자료의 변경 근거'),others=[audit('audit-sibling',p.id,'source-zero','다른 원자료의 변경 근거'),audit('audit-other-scope',p.id,'managed-other','다른 관리범위의 변경 근거'),audit('audit-other-project',q.id,'source-known','다른 사업의 변경 근거')];
  const h=makeHarness({modules:['core','cbs','audit-view'],seed:{projects:[p,q],currentProjectId:p.id,selectedProjectId:p.id,auditEvents:[selected,...others],notifications:[]}}),A=h.A,dialog=h.nodes.get('app-dialog');
  let html=dialog.innerHTML,buttons=[];const decode=s=>String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'),text=s=>decode(String(s).replace(/<[^>]*>/g,'')).trim();
  const parse=markup=>[...String(markup).matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m=>{const attrs=Object.fromEntries([...m[1].matchAll(/([\w-]+)="([^"]*)"/g)].map(a=>[a[1],decode(a[2])])),dataset=Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase()),v]));return{dataset,text:text(m[2]),closest:()=>null,focus(){h.document.activeElement=this}};});
  Object.defineProperty(dialog,'innerHTML',{configurable:true,get:()=>html,set:value=>{html=value;buttons=parse(value);}});h.document.querySelectorAll=()=>buttons;
  const action=(name,data={})=>{const button={dataset:{action:name,...data}};for(const listener of h.listeners.click||[])listener({target:{closest:selector=>selector==='[data-action]'?button:null},preventDefault(){}});},click=button=>{assert(button,'실제 렌더된 버튼이 있어야 합니다.');button.focus();action(button.dataset.action,button.dataset);};
  return{h,A,p:A.current(),dialog,action,click,buttons:()=>buttons,title:()=>text(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]||''),text,html:()=>html};
 };
 const f=makeHistoryFixture(),before=JSON.stringify(f.A.state),storedBefore=JSON.stringify([...f.h.storage]);
 const groups=f.A.costDisplayGroups(f.p,{includeUnused:true}),group=groups.find(g=>g.managementIds.includes('managed-main'));
 assert(group,'독립 합성 원자료에 대응하는 관리범위가 있어야 합니다.');
 assert.deepEqual([...group.managementIds].sort(),['managed-main','managed-template']);
 f.action('cbs-model-sources',{id:group.id});const sourceTitle=f.title();
 const rows=[...f.html().matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(m=>[...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c=>f.text(c[1])));
 assert.equal(rows.find(r=>r[0]==='검수 미입력 관리항목')?.[1],'미입력');
 // 공통 금액표시의 명시 0원은 '0억원'이며 미입력·미확보와 다릅니다.
 assert.equal(rows.find(r=>r[0].includes('명시 0원 원자료'))?.[1],'0억원');
 assert.equal(rows.find(r=>r[0].includes('확인된 계약 원자료'))?.[1],'300만원');
 assert.equal(rows.find(r=>r[0].includes('금액 미확보 원자료'))?.[1],'자료 미확보');
 assert(!f.html().includes('다른 관리범위'));
 const sourceButtons=f.buttons().filter(b=>b.dataset.id&&b.dataset.id!=='modal-close');
 assert.deepEqual(sourceButtons.map(b=>b.text),['이력','이력','이력','이력','이력']);
 assert.deepEqual(sourceButtons.map(b=>b.dataset.id).sort(),['managed-main','managed-template','source-known','source-missing','source-zero']);
 assert(sourceButtons.every(b=>b.dataset.projectId===f.p.id));
 f.click(sourceButtons.find(b=>b.dataset.id==='source-known'));
 assert.equal(f.title(),'확인된 계약 원자료 이력');
 const changes=f.buttons().filter(b=>b.text==='변경 전후');assert.equal(changes.length,1);assert.equal(changes[0].dataset.id,'audit-selected');assert.equal(changes[0].dataset.projectId,f.p.id);
 assert(!f.html().includes('audit-sibling'));assert(!f.html().includes('audit-other-scope'));assert(!f.html().includes('audit-other-project'));
 f.click(changes[0]);assert.equal(f.title(),'사업비 변경');
 for(const expected of ['변경 항목','변경 전','변경 후','증감','현재 사업비','선택한 원자료의 변경 근거'])assert(f.html().includes(expected),expected);
 const detailRows=[...f.html().matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(m=>[...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/g)].map(c=>f.text(c[1])));
 assert.deepEqual(detailRows.find(r=>r[0]==='현재 사업비'),['현재 사업비','200만원','300만원','증가 100만원 · 50%']);
 assert(!f.html().includes('다른 원자료의 변경 근거'));assert(!f.html().includes('다른 사업의 변경 근거'));
 f.A.requestModalClose();assert.equal(f.title(),'확인된 계약 원자료 이력');assert.equal(f.dialog.open,true);
 f.A.requestModalClose();assert.equal(f.title(),sourceTitle);assert.equal(f.dialog.open,true);
 f.A.requestModalClose();assert.equal(f.dialog.open,false);
 assert.equal(JSON.stringify(f.A.state),before,'이력 조회·복귀가 금액·원자료·확정본·계약·부가세·감사기록을 바꾸면 안 됩니다.');assert.equal(JSON.stringify([...f.h.storage]),storedBefore);
 const stale=makeHistoryFixture(),staleGroup=stale.A.costDisplayGroups(stale.p,{includeUnused:true}).find(g=>g.managementIds.includes('managed-main'));stale.action('cbs-model-sources',{id:staleGroup.id});stale.click(stale.buttons().find(b=>b.dataset.id==='source-known'));const staleButton=stale.buttons().find(b=>b.text==='변경 전후');stale.A.state.auditEvents=stale.A.state.auditEvents.filter(e=>e.id!=='audit-selected');const afterRemoval=JSON.stringify(stale.A.state),historyTitle=stale.title();stale.click(staleButton);assert.equal(stale.title(),historyTitle);assert.equal(JSON.stringify(stale.A.state),afterRemoval,'소실된 감사 대상을 다른 내역·신규 기록으로 대체하지 않습니다.');
});

check('BIZ123 삭제 버튼은 원래 scope·guard·공통확인·soft-delete 경로를 사용한다',()=>{
 assert(/A\.btn\('삭제','cbs-input-delete',\{id:row\.id,scope:/.test(cbs));
 const handler=cbs.match(/A\.on\('cbs-input-delete'[\s\S]*?\n A\.on\('cbs-delete'/)?.[0]||'';
 for(const token of ['deletionBlock','confirmDelete','formParentOptions','removeCost'])assert(handler.includes(token),token);
});

const summary={suite:'v0123-business-copy',passed:checks.filter(item=>item.pass).length,failed:checks.filter(item=>!item.pass).length,total:checks.length};console.log(JSON.stringify(summary));if(summary.failed)process.exitCode=1;
