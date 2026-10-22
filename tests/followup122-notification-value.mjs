import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';

// UX122-05: approved user-visible behavior, not an implementation-derived list.
// Actual module/core are used; only DOM, network and navigation boundaries are inert.
const checks=[],copy=value=>structuredClone(value);
const seed=()=>({projects:[{id:'NOTIFY_A',name:'합성 사업 A',basic:{},cbs:[]},{id:'NOTIFY_B',name:'합성 사업 B',basic:{},cbs:[]}],entities:[],notifications:[],auditEvents:[]});
const base=()=>({id:'legacy',title:'원가 변경 확인',at:'2026-10-20T01:02:03.000Z',target:{projectId:'NOTIFY_A',view:'cost',tab:'detail'}});
function boot({notices=[base()],tasks=[],alerts=[],failDelete=false}={}){
 const h=makeHarness({modules:['core'],seed:seed()}),A=h.A,handlers=new Map(),originalOn=A.on,body={innerHTML:''},dialog=h.nodes.get('app-dialog'),requests=[],go=[];
 A.ui.projectId='NOTIFY_A';A.state.notifications=copy(notices);A.cloudMode=true;
 A.on=(name,fn)=>{handlers.set(name,fn);originalOn(name,fn);};
 dialog.querySelector=selector=>selector==='.dialog-body'?body:null;
 A.render=()=>{throw Error('알림 조회에서 전체 업무 렌더 금지');};A.audit=()=>{throw Error('알림 조회에서 공유 업무 감사 금지');};
 A.go=(view,tab,projectId)=>go.push({view,tab,projectId});
 h.context.fetch=async(url,options={})=>{
  assert.equal(url,'/api/notifications','API 경로 확장 금지');const payload=options.body?JSON.parse(options.body):null;
  requests.push({url,method:options.method,credentials:options.credentials,cache:options.cache,payload});
  const failed=failDelete&&payload?.action==='delete';
  return {ok:!failed,status:failed?503:200,json:async()=>payload?{state:{notificationId:payload.notificationId,readAt:'2026-10-20T01:03:00.000Z',deletedAt:payload.action==='delete'?'2026-10-20T01:04:00.000Z':null}}:{states:[],tasks:copy(tasks),alerts:copy(alerts)}};
 };
 h.load('notifications');
 return {...h,A,body,dialog,requests,go,async open(){A.notifications.open();await A.notifications.load();},async detail(id='legacy'){A.notifications.detail(id);await this.idle();return body.innerHTML;},async idle(){for(let i=0;i<24&&A.notifications.status().pending;i++)await Promise.resolve();assert.equal(A.notifications.status().pending,0);},click(action,data={}){assert(handlers.has(action),action+' 실제 등록');return handlers.get(action)({dataset:data});}};
}
async function test(name,fn){try{await fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',message:error.message});}}
const emptyCopy=html=>{
 assert(!html.includes('상세 내용이 제공되지 않았습니다.'));
 assert(!html.includes('에서 알림과 관련된 내용을 확인해 주세요.'));
 assert(!html.includes('<h4>알림 내용</h4>'));
 assert(!html.includes('<h4>확인할 내용</h4>'));
 assert(!html.includes('notice-explanation'),'빈 설명 구획 생성 금지');
};
for(const value of [undefined,null,'',' \n\t '])await test('detail 미제공/빈값은 반복 안내 없이 기본 업무정보만 보존 '+String(value),async()=>{
 const notice=base();if(value!==undefined)notice.detail=value;
 const h=boot({notices:[notice]});await h.open();const before=JSON.stringify(h.A.state),html=await h.detail();
 emptyCopy(html);for(const text of ['원가 변경 확인','합성 사업 A','세부 사업비','사업비 확인하기','목록으로','삭제','2026-10-20'])assert(html.includes(text),text+' 보존');
 assert(html.includes('data-action="notice-target-open" data-id="legacy"'));assert.equal(JSON.stringify(h.A.state),before);
 assert(!html.includes('0원'));assert(!html.includes('관리자가 변경'));
});
await test('일반 실제 detail은 원문/이스케이프/기존 대상 안내를 보존',async()=>{
 const detail='원 계약 추가비 1원 <검토> & 반영\n원문 두 번째 줄',h=boot({notices:[{...base(),detail}]});await h.open();const before=JSON.stringify(h.A.state),html=await h.detail();
 assert(html.includes('원 계약 추가비 1원 &lt;검토&gt; &amp; 반영\n원문 두 번째 줄'));assert(html.includes('<h4>알림 내용</h4>'));assert(html.includes('세부 사업비에서 알림과 관련된 내용을 확인해 주세요.'));assert.equal(JSON.stringify(h.A.state),before);
});
await test('실제 detail의 제목과 같은 텍스트도 임의 중복판정으로 삭제하지 않음',async()=>{
 const h=boot({notices:[{...base(),detail:'원가 변경 확인'}]});await h.open();const html=await h.detail();assert(html.includes('<p class="notice-content">원가 변경 확인</p>'));
});
await test('보완/조건부 인허가 바로가기의 실제 업무명과 탭을 보존',async()=>{
 const h=boot({notices:[{...base(),target:{projectId:'NOTIFY_B',view:'permit',tab:'construction'}}]});await h.open();const html=await h.detail();emptyCopy(html);assert(html.includes('합성 사업 B · 착공·공사·준공'));assert(html.includes('착공·공사·준공 확인하기'));h.click('notice-target-open',{id:'legacy'});assert.deepEqual(h.go,[{view:'permit',tab:'construction',projectId:'NOTIFY_B'}]);assert.equal(h.dialog.open,false);
});
await test('분기 확인은 실제 분기·기한·담당자 저장 안내를 그대로 보존',async()=>{
 const task={id:'quarter-pending',projectId:'NOTIFY_A',quarterKey:'2026-Q4',dueDate:'2026-12-31',status:'pending',createdAt:'2026-10-20T01:00:00Z'},h=boot({notices:[],tasks:[task]});await h.open();const html=await h.detail(task.id);
 for(const text of ['2026-Q4 사업비를 확인할 차례입니다.','확인 기한은 2026-12-31입니다.','현재 사업비를 확인한 뒤 분기·주요시점 기록에서 분기 기록을 저장해 주세요.','사업비 확인하기'])assert(html.includes(text),text);
 assert.deepEqual(copy(h.A.notifications.status().tasks),[task]);assert(!html.includes('상세 내용이 제공되지 않았습니다.'));
});
await test('완료 분기와 명시 detail은 미완료 요청으로 바뀌지 않음',async()=>{
 const task={id:'quarter-complete',projectId:'NOTIFY_A',quarterKey:'2026-Q3',status:'completed',completedAt:'2026-10-01T01:00:00Z',detail:'담당자가 남긴 완료 근거'},h=boot({notices:[],tasks:[task]});await h.open();const html=await h.detail(task.id);
 for(const text of ['담당자가 남긴 완료 근거','저장된 분기 기록을 확인해 주세요.','사업비 기록 확인하기'])assert(html.includes(text));assert(!html.includes('분기 기록을 저장해 주세요.'));
});
for(const detail of ['법령 원문에서 확인한 변경 사실 <원문>',undefined])await test('법령 검토 실제 조치 문구 보존 '+(detail?'원문 있음':'원문 없음'),async()=>{
 const h=boot({notices:[],alerts:[{id:'law-review-1',type:'law-review',title:'건축법 검토',at:'2026-10-20T01:00:00Z',...(detail?{summary:detail}:{}),target:{projectId:'NOTIFY_A',view:'law',tab:'recent',id:'EXACT_CHANGE'}}]});await h.open();const html=await h.detail('law-review-1');assert(html.includes('법령 변경 원문을 확인하고 이 프로젝트의 적용 여부와 조치 내용을 검토해 주세요.'));assert(html.includes('법령 변경 확인하기'));assert(!html.includes('상세 내용이 제공되지 않았습니다.'));if(detail)assert(html.includes('법령 원문에서 확인한 변경 사실 &lt;원문&gt;'));h.click('notice-target-open',{id:'law-review-1'});assert.equal(h.A.ui.focusId,'EXACT_CHANGE');assert.deepEqual(h.go,[{view:'law',tab:'recent',projectId:'NOTIFY_A'}]);
});
await test('읽음은 같은 API/PATCH shape로 한 번만 저장하고 공유 원문은 불변',async()=>{
 const h=boot();await h.open();const before=JSON.stringify(h.A.state);await h.detail();await h.detail();
 assert.deepEqual(h.requests.map(x=>[x.method,x.payload]),[['GET',null],['PATCH',{notificationId:'legacy',action:'read'}]]);assert(h.requests.every(x=>x.credentials==='same-origin'&&x.cache==='no-store'));assert.equal(JSON.stringify(h.A.state),before);assert.equal(h.A.notifications.unread(),0);
});
await test('기존 목록 복귀는 추가 읽음/원장 요청 없이 남음',async()=>{
 const h=boot();await h.open();const before=JSON.stringify(h.A.state);await h.detail();const count=h.requests.length;h.click('notice-list');assert(h.body.innerHTML.includes('notice-list-open'));assert(h.body.innerHTML.includes('원가 변경 확인'));assert(!h.body.innerHTML.includes('notice-detail-top'));assert.equal(h.requests.length,count);assert.equal(JSON.stringify(h.A.state),before);
});
await test('개인 삭제 성공은 원문/업무/다른 사업을 삭제하지 않음',async()=>{
 const h=boot();await h.open();const before=JSON.stringify(h.A.state);await h.detail();assert.equal(await h.click('notice-dismiss',{id:'legacy'}),true);assert.equal(h.A.notifications.visible().length,0);assert.equal(JSON.stringify(h.A.state),before);assert.deepEqual(h.requests.at(-1).payload,{notificationId:'legacy',action:'delete'});
});
await test('개인 삭제 실패는 상세 선택/오류/원문을 원복하고 빈 설명을 재생성하지 않음',async()=>{
 const h=boot({failDelete:true});await h.open();const before=JSON.stringify(h.A.state);await h.detail();assert.equal(await h.click('notice-dismiss',{id:'legacy'}),false);assert.equal(h.A.notifications.visible().length,1);assert.equal(h.A.notifications.status().selectedId,'legacy');assert(h.body.innerHTML.includes('알림 상태를 저장하지 못했습니다.'));emptyCopy(h.body.innerHTML);assert.equal(JSON.stringify(h.A.state),before);
});
await test('삭제 중 중복 명령은 하나의 개인 API 요청만 사용',async()=>{
 const h=boot();await h.open();await h.detail();const first=h.click('notice-dismiss',{id:'legacy'}),second=h.click('notice-dismiss',{id:'legacy'});await first;assert.equal(second,false);assert.equal(h.requests.filter(x=>x.payload?.action==='delete').length,1);
});
await test('접근할 수 없는 사업의 알림은 빈 대상의 새 안내로 꾸미지 않음',async()=>{
 const h=boot({notices:[{...base(),target:{projectId:'NOT_IN_WORKSPACE',view:'cost',tab:'detail'}}]});await h.open();assert.equal(h.A.notifications.visible().length,0);assert(h.body.innerHTML.includes('새 알림이 없습니다.'));assert.equal(h.requests.filter(x=>x.method==='PATCH').length,0);
});
const files=['src/notifications.js','tests/followup122-notification-value.mjs'],pins=Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
console.log(JSON.stringify({suite:'followup122-notification-value',requirement:'UX122-05',pins,checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,actualModule:true,browser:false,actualDatabaseAccess:false,remoteRequests:0},null,2));
if(checks.some(x=>x.status==='failed'))process.exitCode=1;
