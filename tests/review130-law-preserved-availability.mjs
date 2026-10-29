import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';
const file='src/law-monitor.js',sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),beforePin=sha(file),checks=[];
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const rawHash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
function fixture(freshAttachmentOnly,{order='old-first',omitMetadata=false}={}){
 const h=makeHarness({modules:['core','legal'],seed:{projects:[],entities:[],companies:[],auditEvents:[],notifications:[]}}),A=h.A;
 const before={sequence:'101',officialId:'100',announcedAt:'2026-01-01',effectiveAt:'2026-01-01',lawNumber:'1',bodyAvailability:'text',bodyHash:'1'.repeat(64),bodyCheckedAt:'2026-10-29T00:00:00.000Z',versionStatus:'current'};
 const fresh={sequence:'102',officialId:'100',announcedAt:'2026-10-01',effectiveAt:'2027-01-01',lawNumber:'2',bodyAvailability:freshAttachmentOnly?'attachment-only':'text',bodyHash:'2'.repeat(64),bodyCheckedAt:'2026-10-29T00:00:00.000Z',versionStatus:'scheduled',...(freshAttachmentOnly?{attachments:[{title:'선택한 공식 판본 첨부',officialUrl:'https://www.law.go.kr/LSW/flDownload.do?flSeq=222'}]}:{})};
 if(omitMetadata){delete fresh.bodyAvailability;delete fresh.attachments;}
 const raw={sequence:'102',announcedAt:'2026-10-01',effectiveAt:'2027-01-01',lawNumber:'0002',bodyAvailability:freshAttachmentOnly?'text':'attachment-only',versionStatus:'scheduled',attachments:[{title:'보존 미확정 원문 첨부',officialUrl:'https://www.law.go.kr/LSW/flDownload.do?flSeq=111'}]};
 const record={id:'QA-LAW',target:'law',name:'독립 비교 법령',officialId:'100',source:{lawId:'100'},versions:order==='old-first'?[before,raw,fresh]:[before,fresh,raw],preservedUnverifiedVersions:{version:1,rawHashes:[rawHash(raw)]}};
 const change={id:'QA-CHANGE',lawId:record.id,target:'law',lawName:record.name,sequence:'102',lawNumber:'2',announcedAt:fresh.announcedAt,effectiveAt:fresh.effectiveAt};
 A.realMode=true;A.businessDate=()=> '2026-10-29';A.state={projects:[{id:'QA-P',permits:[]}],lawCatalog:[record],lawChanges:[change],lawSourceV0110:{dataDate:'2026-10-29'},lawUpdateRuns:[],projectLawImpacts:[],auditEvents:[],notifications:[]};A.current=()=>A.state.projects[0];A.ui.tabs.law='recent';h.context.URLSearchParams=URLSearchParams;const requests=[];h.context.fetch=async url=>{requests.push(url);const prior={target:'law',lawId:'100',sequence:'101',announcedAt:'2026-01-01',effectiveAt:'2026-01-01',lawNumber:'1'},after={target:'law',lawId:'100',sequence:'102',announcedAt:'2026-10-01',effectiveAt:'2027-01-01',lawNumber:'2'};return{ok:true,status:200,json:async()=>({record:after,comparison:{version:1,status:'verified',before:prior,after,changes:[]}})};};h.load('law-monitor');return{A,change,fresh,record,requests,calls:()=>requests.length};
}
for(const order of ['old-first','fresh-first'])for(const omitMetadata of [false,true])for(const freshAttachmentOnly of [false,true]){
 const attachmentOnly=omitMetadata?false:freshAttachmentOnly;
 const name=order+' / '+(omitMetadata?'fresh has no metadata keys':'fresh metadata present')+' / '+(freshAttachmentOnly?'old text versus fresh attachment-only':'old attachment-only versus fresh text');
 try{
  const h=fixture(freshAttachmentOnly,{order,omitMetadata}),original=JSON.stringify(h.A.state),context=h.A.lawMonitor.comparisonContext(h.change);
  assert.deepEqual(JSON.parse(JSON.stringify(context)),{target:'law',sequence:'102',effectiveAt:'2027-01-01',beforeSequence:'101',beforeEffectiveAt:'2026-01-01',lawId:'QA-LAW'});
  const availability=h.A.lawMonitor.comparisonAvailability(h.change);
  assert.equal(availability.attachmentOnly,attachmentOnly,'availability must follow the exact identified family/version chosen by context');
  assert.deepEqual(Array.from(availability.attachments,a=>[a.title,a.officialUrl]),(h.fresh.attachments||[]).map(a=>[a.title,a.officialUrl]),'missing official attachments must not inherit raw unknown attachments');
  assert.equal(h.A.lawMonitor.canCompareVersions(h.change),!attachmentOnly);assert.equal(JSON.stringify(h.A.state),original);assert.equal(h.calls(),0);
  if(!attachmentOnly){await h.A.lawMonitor.loadChangeComparison(h.change);assert.equal(h.calls(),1);const url=new URL(h.requests[0],'https://isolated.invalid');assert.equal(url.pathname,'/api/law-detail');assert.deepEqual(Object.fromEntries(url.searchParams),{projectId:'QA-P',target:'law',sequence:'102',effectiveAt:'2027-01-01',beforeSequence:'101',beforeEffectiveAt:'2026-01-01',comparison:'1'});assert.equal(h.A.lawMonitor.comparisonFor(h.change).status,'success');assert.equal(JSON.stringify(h.A.state),original);}
  checks.push({name,status:'passed'});
 }catch(e){checks.push({name,status:'failed',message:e.message});}
}
const result={suite:'review130-law-preserved-availability',scope:'Eight independent mixed-identity readonly UI model cases; actual public comparison context/availability consumers; no actual law API/browser/DB',sourcePinBefore:beforePin,sourcePinAfter:sha(file),checks,passed:checks.filter(c=>c.status==='passed').length,failed:checks.filter(c=>c.status==='failed').length,actualExternalCalls:0,actualDatabase:0};
const output=process.argv.indexOf('--output');if(output>=0)writeFileSync(process.argv[output+1],JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));if(result.failed||result.sourcePinBefore!==result.sourcePinAfter)process.exitCode=1;
