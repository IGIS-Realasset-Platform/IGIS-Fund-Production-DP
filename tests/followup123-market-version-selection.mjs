import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';

// FUP123 independent acceptance. Existing UI actions/rendering are tested first;
// the approved {startVersion,endVersion} range extension is separately labelled.
// Fixed values/IDs below are synthetic source facts, not copied from geometry.
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sourceBefore=hash('src/partners.js'),checks=[];
const copy=x=>structuredClone(x);
const point=(id,period,value,publicationVersion,status='확정')=>({id,period,value,publicationVersion,status});
function boot(){
 const sources=[{id:'SOURCE_A',family:'attached-pdf',label:'독립 합성 지수 A',frequency:'월',unit:'검수 지수',sourceName:'합성 원문 A',sourceUrl:'https://example.invalid/source-a',cacheAt:'2026-10-22',points:[
  point('JAN_OLD','2026-01',100,'2026-01-01','잠정'),point('JAN_NEW','2026-01',9000,'2026-01-02','정정'),
  point('FEB_OLD','2026-02',105,'2026-02-01','잠정'),point('FEB_NEW','2026-02',110,'2026-02-02'),
  point('MAR_OLD','2026-03',120,'2026-03-01','잠정'),point('MAR_NEW','2026-03',8000,'2026-03-02','정정'),
  point('APR','2026-04',130,'2026-04-01'),point('JUN','2026-06',140,'2026-06-01'),
  point('ZERO','2026-07',0,'2026-07-01'),point('ZERO_NEW','2026-07',30,'2026-07-02'),
  point('NULL','2026-08',null,'2026-08-01'),point('NULL_NEW','2026-08',90,'2026-08-02'),
  point('SAME_OLD','2026-09',110,'2026-09-01','잠정'),point('SAME_NEW','2026-09',110,'2026-09-02','정정'),
  point('OCT','2026-10',200,'2026-10-01')
 ]},{id:'SOURCE_B',family:'public-cache',label:'독립 다른 계열',frequency:'월',unit:'다른 지수',points:[point('FOREIGN','2026-03',999,'2026-03-01')]}];
 const project=id=>({id,name:'가상 '+id,basic:{},cbs:[{id:id+'_ROOT',code:'1000',name:'합성 원가',parentId:null,current:1000,initial:900},{id:id+'_INPUT',code:'1100',name:'합성 입력',parentId:id+'_ROOT',current:1000,initial:900}],contracts:[{id:id+'_CONTRACT',cbsId:id+'_INPUT',amount:1000}],vatRecords:[{id:id+'_VAT',sourceId:id+'_INPUT',supplyAmount:1000,vat:100}],costStages:[{id:id+'_PAST',values:{[id+'_INPUT']:900}}],reports:[]});
 const h=makeHarness({modules:['core','chart-utils'],seed:{projects:[project('PROJECT_A'),project('PROJECT_B')],entities:[],auditEvents:[],notifications:[],marketSeries:copy(sources)}}),A=h.A,actions=new Map(),on=A.on;
 A.on=(name,fn)=>{actions.set(name,fn);on(name,fn);};h.load('partners');A.realMode=true;A.ui.view='company';A.ui.tabs.company='market';A.ui.marketSeriesId='SOURCE_A';A.ui.projectId='PROJECT_A';
 let rendered='';A.render=()=>{rendered=A.partners.sourceMarketPanel();};
 const s=A.state.marketSeries.find(x=>x.id==='SOURCE_A');
 return {...h,A,s,actions,sourceSnapshot:JSON.stringify(sources),stateBefore:JSON.stringify(A.state),render(){A.render();return rendered;},select(range,series='SOURCE_A'){
  for(const [id,value]of Object.entries({'market-series-select':series,'market-start':range.start||'','market-end':range.end||'','market-start-version':range.startVersion||'','market-end-version':range.endVersion||''}))h.document.getElementById(id).value=value;
  actions.get('market-compare')();return rendered;
 },unchanged(){assert.equal(JSON.stringify(A.state),this.stateBefore,'지수/판본/두 사업 원장·계약/VAT/과거값/감사/알림 불변');}};
}
const ids=g=>copy(g.points.map(p=>p.id)),values=g=>copy(g.points.map(p=>p.value));
const svg=html=>html.match(/<svg\b[^>]*class="dp-market-series-chart"[\s\S]*?<\/svg>/)?.[0]||'';
const tips=html=>[...svg(html).matchAll(/<circle\b[^>]*data-tooltip="([^"]*)"/g)].map(m=>m[1]);
const pairs=g=>copy(g.segments.map(s=>[s.from.id,s.to.id]));
const invalid=g=>{assert.equal(g.valid,false,'명시한 선택을 확인할 수 없으면 조용한 최신판 대체 금지');assert.equal(g.points.length,0);assert.equal(g.segments.length,0);};
function test(name,kind,fn){try{const h=boot();fn(h);h.unchanged();checks.push({name,kind,status:'passed'});}catch(error){checks.push({name,kind,status:'failed',message:error.message});}}
async function testAsync(name,kind,fn){try{const h=boot();await fn(h);h.unchanged();checks.push({name,kind,status:'passed'});}catch(error){checks.push({name,kind,status:'failed',message:error.message});}}
async function remoteSource(h,points){
 h.A.cloudMode=true;h.A.ui.view='portfolio';let response={version:'REMOTE_V1',checkedAt:'2026-10-22T01:00:00Z',groups:[],market:{series:[{id:'REMOTE_SOURCE',label:'독립 원문 관측',frequency:'월',points:copy(points)}]}};
 h.A.referenceData={load:async()=>copy(response)};await h.A.partners.ensureReference(true);
 return {read:()=>h.A.partners.marketSeries().find(s=>s.id==='reference:REMOTE_SOURCE'),async update(change={}){response={...response,...change,market:change.points?{series:[{...response.market.series[0],points:copy(change.points)}]}:response.market};delete response.points;const before=JSON.stringify(response);await h.A.partners.ensureReference(true);assert.equal(JSON.stringify(response),before,'공식 형태 원응답 불변');}};
}

test('실제 선택명령→UI렌더: 두 끝점·툴팁·축이 선택판본이고 중간월은 최신', 'existing-ui-integration',h=>{
 const html=h.select({start:'2026-01',end:'2026-03',startVersion:'JAN_OLD',endVersion:'MAR_OLD'}),plot=svg(html),labels=tips(html);
 assert(html.includes('2026-01 100 → 2026-03 120'),'독립 원문100→120 비교요약');assert(plot,'실제 market renderer의 그래프');
 assert.deepEqual(labels.map(x=>x.split(' · ')[1]),['100','110','120'],'UI선택이 그래프까지 전달');assert(labels[0].includes('2026-01-01'));assert(labels[2].includes('2026-03-01'));assert(!plot.includes('9000')&&!plot.includes('8000'),'미선택 최신판을 축/툴팁/점으로 대체하지 않음');
});
test('실제 UI: 같은 월 다른 판본은 두 관측·두 툴팁/연결선0', 'existing-ui-integration',h=>{
 const html=h.select({start:'2026-01',end:'2026-01',startVersion:'JAN_OLD',endVersion:'JAN_NEW'}),plot=svg(html),labels=tips(html);
 assert(html.includes('2026-01 100 → 2026-01 9,000'));assert.equal(labels.length,2);assert(labels.some(x=>x.includes(' · 100 · ')));assert(labels.some(x=>x.includes(' · 9,000 · ')));assert.equal((plot.match(/<path\b/g)||[]).length,0,'같은 월 판본 차이를 시간 진행선으로 그리지 않음');
});
test('실제 UI: 동일값·다른 판본ID를 한 관측으로 병합하지 않음', 'existing-ui-integration',h=>{
 const html=h.select({start:'2026-09',end:'2026-09',startVersion:'SAME_OLD',endVersion:'SAME_NEW'}),labels=tips(html);assert.equal(labels.length,2);assert(labels.some(x=>x.includes('2026-09-01')));assert(labels.some(x=>x.includes('2026-09-02')));
});
test('실제 UI: 명시 선택ID 소실 후 최신판 그래프를 몰래 그리지 않음', 'existing-ui-integration',h=>{
 Object.assign(h.A.ui,{marketStart:'2026-01',marketEnd:'2026-03',marketStartVersion:'JAN_OLD',marketEndVersion:'REMOVED'});const html=h.render();assert(html.includes('선택한 기준월의 자료가 없습니다.'));assert.equal(tips(html).length,0);
});

test('range: 선택 두 끝점만 적용하고 원범위/중간월 최신을 보존', 'approved-range-contract',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-01',end:'2026-03',startVersion:'JAN_OLD',endVersion:'MAR_OLD'});assert.equal(g.valid,true);assert.deepEqual(ids(g),['JAN_OLD','FEB_NEW','MAR_OLD']);assert.deepEqual(values(g),[100,110,120]);assert.deepEqual(pairs(g),[['JAN_OLD','FEB_NEW'],['FEB_NEW','MAR_OLD']]);assert(g.yMin<=100&&g.yMax>=120&&g.yMax<500,'축도 선택값 범위로 산출');
});
test('range: 한쪽만 명시하면 다른 끝점은 기존 최신판', 'approved-range-contract',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-01',end:'2026-03',startVersion:'JAN_OLD'});assert.deepEqual(ids(g),['JAN_OLD','FEB_NEW','MAR_NEW']);assert.deepEqual(values(g),[100,110,8000]);
});
test('range: ID 미지정의 기존 최신판·일반 range 계약은 유지', 'legacy-regression',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-01',end:'2026-03'});assert.deepEqual(ids(g),['JAN_NEW','FEB_NEW','MAR_NEW']);assert.deepEqual(values(g),[9000,110,8000]);
});
test('기존 range 양성: 관측범위 바깥 날짜는 안쪽 실제 관측만 포함', 'legacy-regression',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2025-12',end:'2026-11'});assert.equal(g.valid,true);assert.deepEqual(ids(g),['JAN_NEW','FEB_NEW','MAR_NEW','APR','JUN','ZERO_NEW','NULL_NEW','SAME_NEW','OCT']);assert.equal(g.points[0].period,'2026-01');assert.equal(g.points.at(-1).period,'2026-10');assert(!g.points.some(p=>['2025-12','2026-11'].includes(p.period)),'임의의 범위 끝 관측을 생성하지 않음');
});
test('기존 range 양성: 한쪽 범위만 지정한 조회 유지', 'legacy-regression',h=>{
 const after=h.A.partners.marketGeometry(h.s,{start:'2026-09'}),before=h.A.partners.marketGeometry(h.s,{end:'2026-02'});assert.equal(after.valid,true);assert.deepEqual(ids(after),['SAME_NEW','OCT']);assert.equal(before.valid,true);assert.deepEqual(ids(before),['JAN_NEW','FEB_NEW']);
});
test('기존 range 양성: 시작월 결측/기간 안 실제 한 점은 가짜 보간 없이 유효', 'legacy-regression',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-05',end:'2026-06'});assert.equal(g.valid,true);assert.deepEqual(ids(g),['JUN']);assert.equal(g.segments.length,0);assert(Math.abs(g.points[0].x-.5)<.01);
});
test('range: 기간 밖 관측은 제외하고 누락월 사이 연결/보간 금지', 'approved-range-contract',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-01',end:'2026-06',startVersion:'JAN_OLD',endVersion:'JUN'});assert.deepEqual(ids(g),['JAN_OLD','FEB_NEW','MAR_NEW','APR','JUN']);assert.deepEqual(pairs(g),[['JAN_OLD','FEB_NEW'],['FEB_NEW','MAR_NEW'],['MAR_NEW','APR']]);assert(!g.points.some(p=>p.period==='2026-05'));
});
test('range: 같은 월 다른 두 ID는 두 점/같은 실제 날짜좌표/연결선0', 'approved-range-contract',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-01',end:'2026-01',startVersion:'JAN_OLD',endVersion:'JAN_NEW'});assert.equal(g.valid,true);assert.deepEqual(ids(g),['JAN_OLD','JAN_NEW']);assert.deepEqual(values(g),[100,9000]);assert.equal(g.points[0].x,g.points[1].x);assert(Math.abs(g.points[0].x-.5)<.01);assert.equal(g.segments.length,0);assert(g.yMin<=100&&g.yMax>=9000);
});
test('range: 같은 월·같은 명시 ID는 정확 한 점', 'approved-range-contract',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-01',end:'2026-01',startVersion:'JAN_OLD',endVersion:'JAN_OLD'});assert.deepEqual(ids(g),['JAN_OLD']);assert.deepEqual(values(g),[100]);assert.equal(g.segments.length,0);assert(Math.abs(g.points[0].x-.5)<.01);
});
test('range: 같은 값 다른 ID·다른 원판본은 모두 보존', 'approved-range-contract',h=>{
 const g=h.A.partners.marketGeometry(h.s,{start:'2026-09',end:'2026-09',startVersion:'SAME_OLD',endVersion:'SAME_NEW'});assert.deepEqual(ids(g),['SAME_OLD','SAME_NEW']);assert.deepEqual(values(g),[110,110]);assert.equal(g.segments.length,0);assert.equal(g.points[0].y,g.points[1].y);
});
for(const [label,range]of [
 ['소실된 시작ID',{start:'2026-01',end:'2026-03',startVersion:'MISSING',endVersion:'MAR_OLD'}],
 ['소실된 비교ID',{start:'2026-01',end:'2026-03',startVersion:'JAN_OLD',endVersion:'MISSING'}],
 ['다른 계열ID',{start:'2026-01',end:'2026-03',startVersion:'JAN_OLD',endVersion:'FOREIGN'}],
 ['기간 밖 시작ID',{start:'2026-02',end:'2026-03',startVersion:'JAN_OLD',endVersion:'MAR_OLD'}],
 ['다른 끝점 월의 ID',{start:'2026-01',end:'2026-03',startVersion:'MAR_OLD',endVersion:'JAN_OLD'}],
 ['명시 null 관측',{start:'2026-01',end:'2026-08',startVersion:'JAN_OLD',endVersion:'NULL'}]
])test('range invalid: '+label+'은 최신판 대체 없음','approved-range-contract',h=>invalid(h.A.partners.marketGeometry(h.s,range)));
test('range invalid: 반대 기간은 조용히 뒤집지 않음', 'legacy-regression',h=>invalid(h.A.partners.marketGeometry(h.s,{start:'2026-03',end:'2026-01',startVersion:'MAR_OLD',endVersion:'JAN_OLD'})));
test('0 관측은 그래프에 유효·비교 끝점0은 -100%·기준0 비율 차단', 'approved-range-contract',h=>{
 const range={start:'2026-01',end:'2026-07',startVersion:'JAN_OLD',endVersion:'ZERO'},g=h.A.partners.marketGeometry(h.s,range);assert.equal(g.valid,true);assert.equal(g.points.at(-1).id,'ZERO');assert.equal(g.points.at(-1).value,0);assert(g.yMin<=0);const endZero=h.A.partners.compareIndex('SOURCE_A','2026-01','2026-07','JAN_OLD','ZERO');assert.equal(endZero.ok,true);assert.equal(endZero.change,-100);const baseZero=h.A.partners.compareIndex('SOURCE_A','2026-07','2026-07','ZERO','ZERO');assert.equal(baseZero.ok,false);assert.match(baseZero.message,/0보다 커/);
});
test('직접 chart API 툴팁도 선택판본값/발표판본을 표시', 'approved-range-contract',h=>{
 const chart=h.A.partners.marketChart(h.s,{start:'2026-01',end:'2026-03',startVersion:'JAN_OLD',endVersion:'MAR_OLD'}),labels=tips(chart);assert.deepEqual(labels.map(x=>x.split(' · ')[1]),['100','110','120']);assert(labels[0].includes('잠정'));assert(labels[0].includes('2026-01-01'));
});
test('읽기·선택·차트·내려받기용 원형 projection은 원본 값/ID/원장을 바꾸지 않음', 'preservation',h=>{
 const raw=JSON.stringify(h.A.partners.marketSeries());h.select({start:'2026-01',end:'2026-03',startVersion:'JAN_OLD',endVersion:'MAR_OLD'});h.A.partners.marketChart(h.s,{start:'2026-01',end:'2026-03',startVersion:'JAN_OLD',endVersion:'MAR_OLD'});assert.equal(JSON.stringify(h.A.partners.marketSeries()),raw);assert.equal(h.A.state.projects[0].cbs[1].current,1000);assert.equal(h.A.state.projects[1].cbs[1].current,1000);assert.equal(h.A.state.auditEvents.length,0);assert.equal(h.A.state.notifications.length,0);
});
for(const nativeId of [true,false])await testAsync('cloud 실제 참고자료 projection: 삭제한 구판ID를 같은월 정정판이 재사용하지 않음 '+(nativeId?'원ID 있음':'원ID 없음'),'reference-adapter-integration',async h=>{
 h.A.cloudMode=true;h.A.ui.view='portfolio';
 const rows=[{...(nativeId?{id:'RAW_BASE'}:{}),period:'2026-01',value:100,updated_at:'판본1'},{...(nativeId?{id:'RAW_OLD'}:{}),period:'2026-03',value:120,updated_at:'판본1'},{...(nativeId?{id:'RAW_NEW'}:{}),period:'2026-03',value:8000,updated_at:'판본2'}];
 let response={version:'REFERENCE_ONE',checkedAt:'2026-10-22',groups:[],market:{series:[{id:'REMOTE_SOURCE',label:'독립 원문 관측',frequency:'월',points:copy(rows)}]}};
 h.A.referenceData={load:async()=>copy(response)};await h.A.partners.ensureReference(true);
 const original=h.A.partners.marketSeries().find(s=>s.id==='reference:REMOTE_SOURCE'),selected=original.points.find(p=>p.value===120),base=original.points.find(p=>p.value===100);assert(selected&&base);
 response={...response,version:'REFERENCE_TWO',market:{series:[{...response.market.series[0],points:[copy(rows[0]),copy(rows[2])]}]}};
 const raw=JSON.stringify(response);await h.A.partners.ensureReference(true);const fresh=h.A.partners.marketSeries().find(s=>s.id==='reference:REMOTE_SOURCE');assert.equal(JSON.stringify(response),raw,'서버 원참고자료를 읽으면서 수정하지 않음');
 assert(!fresh.points.some(p=>p.id===selected.id),'삭제한120의 선택ID로 다른8000관측을 식별하지 않음');
 const comparison=h.A.partners.compareIndex(fresh.id,'2026-01','2026-03',base.id,selected.id);assert.equal(comparison.ok,false,'옛 선택은 미확보이며 최신으로 조용히 대체하지 않음');
});
const remotePoints=()=>[{id:'RAW_BASE',period:'2026-01',value:100,updated_at:'판본1'},{id:'RAW_OLD',period:'2026-03',value:120,updated_at:'판본1',evidence:{pages:[1,2],source:'합성 원문'}},{id:'RAW_NEW',period:'2026-03',value:8000,updated_at:'판본2'}];
await testAsync('cloud 양성: 같은 원관측 재조회와 snapshot 버전만 변경해도 선택 유지','reference-adapter-integration',async h=>{
 const points=remotePoints(),r=await remoteSource(h,points),before=r.read().points.map(p=>[p.value,p.id]);await r.update({version:'REMOTE_V2',points:copy(points)});assert.deepEqual(copy(r.read().points.map(p=>[p.value,p.id])),copy(before));const original=before.find(([value])=>value===120)[1];assert.equal(h.A.partners.compareIndex(r.read().id,'2026-03','2026-03',original,original).end.value,120);
});
await testAsync('cloud 양성: raw JSON 키 순서와 nested 객체 키 순서는 의미가 같음','reference-adapter-integration',async h=>{
 const points=remotePoints(),r=await remoteSource(h,points),before=r.read().points.map(p=>[p.value,p.id]),reordered=points.map(p=>Object.fromEntries(Object.entries(p).reverse()));reordered[1].evidence={source:'합성 원문',pages:[1,2]};await r.update({version:'REMOTE_V2',points:reordered});assert.deepEqual(copy(r.read().points.map(p=>[p.value,p.id])),copy(before));
});
await testAsync('cloud 양성: 원관측 배열 순서 변경만으로 기존 선택을 잃지 않음','reference-adapter-integration',async h=>{
 const points=remotePoints(),r=await remoteSource(h,points),before=copy(r.read().points.map(p=>[p.value,p.id])),old=before.find(([value])=>value===120)[1],base=before.find(([value])=>value===100)[1];await r.update({version:'REMOTE_V2',points:points.slice().reverse()});assert.deepEqual(copy(r.read().points.map(p=>[p.value,p.id]).sort((a,b)=>a[0]-b[0])),before.slice().sort((a,b)=>a[0]-b[0]));const c=h.A.partners.compareIndex(r.read().id,'2026-01','2026-03',base,old);assert.equal(c.ok,true);assert.equal(c.end.value,120);
});
await testAsync('cloud 양성: checkedAt만 변경하면 원관측 ID와 선택 유지','reference-adapter-integration',async h=>{
 const r=await remoteSource(h,remotePoints()),before=copy(r.read().points.map(p=>[p.value,p.id]));await r.update({checkedAt:'2026-10-23T01:00:00Z'});assert.deepEqual(copy(r.read().points.map(p=>[p.value,p.id])),before);
});
for(const mutation of ['value','version'])await testAsync('cloud 음성: 원ID 같아도 실제 '+mutation+' 변경은 같은 관측으로 오인하지 않음','reference-adapter-integration',async h=>{
 const points=remotePoints(),r=await remoteSource(h,points),old=r.read().points.find(p=>p.value===120).id,changed=copy(points);if(mutation==='value')changed[1].value=121;else changed[1].updated_at='판본3';await r.update({version:'REMOTE_V2',points:changed});assert(!r.read().points.some(p=>p.id===old));const c=h.A.partners.compareIndex(r.read().id,'2026-03','2026-03',old,old);assert.equal(c.ok,false);
});
await testAsync('cloud 음성: 같은값·같은기간·같은판본이어도 다른 원ID는 두 관측 보존','reference-adapter-integration',async h=>{
 const r=await remoteSource(h,[{id:'RAW_A',period:'2026-03',value:120,updated_at:'판본1'},{id:'RAW_B',period:'2026-03',value:120,updated_at:'판본1'}]),s=r.read();assert.equal(s.points.length,2);assert.notEqual(s.points[0].id,s.points[1].id);const g=h.A.partners.marketGeometry(s,{start:'2026-03',end:'2026-03',startVersion:s.points[0].id,endVersion:s.points[1].id});assert.equal(g.points.length,2);assert.equal(g.segments.length,0);
});
await testAsync('cloud 음성: 한 원관측 안의 의미있는 배열순서를 임의 정렬해 합치지 않음','reference-adapter-integration',async h=>{
 const points=remotePoints(),r=await remoteSource(h,points),old=r.read().points.find(p=>p.value===120).id,changed=copy(points);changed[1].evidence.pages=[2,1];await r.update({version:'REMOTE_V2',points:changed});assert(!r.read().points.some(p=>p.id===old));assert.deepEqual(changed[1].evidence.pages,[2,1]);
});
const sourceAfter=hash('src/partners.js'),result={suite:'followup123-market-version-selection',sourceBefore,sourceAfter,sourceUnchanged:sourceBefore===sourceAfter,checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,existingUiFailures:checks.filter(x=>x.kind==='existing-ui-integration'&&x.status==='failed').length,actualModule:true,actualBrowser:false,actualDatabaseAccess:false,remoteRequests:0};
console.log(JSON.stringify(result,null,2));if(result.failed||!result.sourceUnchanged)process.exitCode=1;
