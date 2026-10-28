import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';

const checks=[];
function check(name,run){try{run();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,message:error.message});}}
function fixture({clock='2026-10-28T00:00:00Z',dataDate='2026-10-28',changes=[],dateType='announcedAt',realMode=true}={}){
 const h=makeHarness({modules:['core','legal','law-monitor'],seed:{version:'qa130',projects:[],entities:[],companies:[],auditEvents:[],notifications:[]}});
 const RealDate=Date;h.context.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[clock]));}static now(){return +new RealDate(clock);}};
 const A=h.A;A.realMode=realMode;A.today='1900-01-01';
 A.state={projects:[{id:'P130',name:'합성사업',permits:[]}],lawCatalog:changes.map((c,index)=>({id:'L-'+c.id,name:c.id,target:'law',type:'법령',origin:'official-snapshot',officialUrl:'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq='+String(10000+index),versions:[]})),lawChanges:changes.map(c=>({...c,lawId:'L-'+c.id,lawName:c.id,origin:'official-snapshot'})),lawSourceV0110:{dataDate},lawUpdateRuns:[],projectLawImpacts:[],auditEvents:[],notifications:[]};
 A.current=()=>A.state.projects[0];A.ui.tabs.law='recent';A.ui.lawDateType=dateType;
 return h;
}
const names=html=>[...html.matchAll(/class="btn text law-change-title"[^>]*>([^<]+)<\/button>/g)].map(m=>m[1]).sort();
function rendered(options){const{A}=fixture(options),before=JSON.stringify(A.state),html=A.legal.renderLaw({compact:true});assert.equal(JSON.stringify(A.state),before,'조회는 원자료/이력을 바꾸지 않는다');return names(html);}

check('현재 KST오늘 포함30일은 오래된 수집기준일 대신 실제 달력의 9월29일~10월28일',()=>{
 assert.deepEqual(rendered({dataDate:'2026-10-25',changes:[{id:'OLD29',announcedAt:'2026-09-28'},{id:'FIRST30',announcedAt:'2026-09-29'},{id:'TODAY',announcedAt:'2026-10-28'},{id:'TOMORROW',announcedAt:'2026-10-29'}]}),['FIRST30','TODAY']);
});
check('미래 수집일은 미래공포를 최근변경으로 끌어오지 않는다',()=>{
 assert.deepEqual(rendered({dataDate:'2026-11-15',changes:[{id:'RECENT',announcedAt:'2026-10-01'},{id:'FUTURE',announcedAt:'2026-11-01'}]}),['RECENT']);
});
check('한국 자정 직전에는10월28일의 30일창을 유지한다',()=>{
 assert.deepEqual(rendered({clock:'2026-10-28T14:59:59Z',changes:[{id:'IN',announcedAt:'2026-09-29'},{id:'NEXT',announcedAt:'2026-10-29'}]}),['IN']);
});
check('UTC15시의 한국 자정에는10월29일로 넘어가며 9월29일은 제외한다',()=>{
 assert.deepEqual(rendered({clock:'2026-10-28T15:00:00Z',changes:[{id:'PREVIOUS',announcedAt:'2026-09-29'},{id:'START',announcedAt:'2026-09-30'},{id:'TODAY',announcedAt:'2026-10-29'}]}),['START','TODAY']);
});
check('날짜 없는 첫관측/과거판본 첫관측은 발견일이나 시행일을 공포일로 대신하지 않는다',()=>{
 assert.deepEqual(rendered({changes:[{id:'MISSING',discoveredAt:'2026-10-28',effectiveAt:'2026-10-28',observationKind:'first_catalog_observation'},{id:'HISTORICAL',announcedAt:'2026-09-20',effectiveAt:'2026-10-28',discoveredAt:'2026-10-28',observationKind:'first_catalog_observation'},{id:'ACTUAL_RECENT',announcedAt:'2026-10-20',effectiveAt:'2027-01-01',observationKind:'first_catalog_observation'}]}),['ACTUAL_RECENT']);
});
check('잘못된 달력일/시간문자/빈날짜와 미래공포를 배제하고 윤년2월29일은 허용한다',()=>{
 assert.deepEqual(rendered({clock:'2028-03-01T00:00:00Z',dataDate:'2028-03-01',changes:[{id:'LEAP',announcedAt:'2028-02-29'},{id:'BAD_DAY',announcedAt:'2028-02-30'},{id:'BAD_FORMAT',announcedAt:'2028-03-01T00:00:00Z'},{id:'EMPTY',announcedAt:''},{id:'FUTURE',announcedAt:'2028-03-02'}]}),['LEAP']);
});
check('해가 바뀌어도 현재1월5일의 시작12월7일과 양끝 포함을 유지한다',()=>{
 assert.deepEqual(rendered({clock:'2027-01-05T00:00:00Z',dataDate:'2026-12-31',changes:[{id:'OLD',announcedAt:'2026-12-06'},{id:'START',announcedAt:'2026-12-07'},{id:'TODAY',announcedAt:'2027-01-05'}]}),['START','TODAY']);
});
check('시행일 기준은 공포일과 분리하며 역시 현재KST오늘의30일을 사용한다',()=>{
 assert.deepEqual(rendered({dataDate:'2026-10-25',dateType:'effectiveAt',changes:[{id:'EFFECTIVE_TODAY',announcedAt:'2026-01-01',effectiveAt:'2026-10-28'},{id:'ANNOUNCED_ONLY',announcedAt:'2026-10-28',effectiveAt:'2027-01-01'}]}),['EFFECTIVE_TODAY']);
});
check('예정 조회의 끝점도 현재KST오늘이며 이미시행된10월26일을예정으로표시하지않는다',()=>{
 assert.deepEqual(rendered({dataDate:'2026-10-25',dateType:'upcoming',changes:[{id:'ALREADY_EFFECTIVE',announcedAt:'2026-10-01',effectiveAt:'2026-10-26'},{id:'SCHEDULED',announcedAt:'2026-10-01',effectiveAt:'2026-10-29'}]}),['SCHEDULED']);
});
check('샘플 모드는 현재일로 바꾸지 않고 원자료 기준일의30일창을 보존한다',()=>{
 assert.deepEqual(rendered({realMode:false,dataDate:'2026-10-25',changes:[{id:'SOURCE_WINDOW',announcedAt:'2026-09-28'},{id:'AFTER_SOURCE',announcedAt:'2026-10-28'}]}),['SOURCE_WINDOW']);
});
const result={suite:'review130-law-window',passed:checks.filter(c=>c.passed).length,failed:checks.filter(c=>!c.passed).length,checks,actualBrowser:false,network:0,database:0};console.log(JSON.stringify(result,null,2));if(result.failed)process.exitCode=1;
