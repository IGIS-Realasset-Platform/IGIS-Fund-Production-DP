// Exercise the local overlay without opening the browser or a workspace.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const routes={spec:()=>'<h1>플랫폼 명세</h1>'};
const originalSpec=routes.spec;
const actions={},requests=[],moves=[];
const state={projects:[{id:'A'}]};
const spec={backendBlueprint:{apis:{'/api/project-access':{purpose:'관리자의 프로젝트 권한 조회·설정·회수'}},roles:{project:['viewer','editor','approver'],platform:['platform_admin']}}};
const before=JSON.stringify({state,spec});
let entries=[];
const nav={querySelector:()=>entries[0],insertAdjacentHTML:(_,markup)=>entries.push(markup)};
const brand={textContent:'개발사업관리'};
const root={querySelector:()=>null};
const photo={hidden:true,addEventListener(){}},profile={hidden:true,setAttribute(){},querySelector:()=>photo};
const context={
 URL,location:{href:'http://127.0.0.1:4178/'},
 history:{state:{untouched:true},replaceState(next){this.state=next}},
 fetch:async url=>{requests.push(url);return {ok:true,json:async()=>({people:[['테스트 이름','example@example.test','테스트 조직','사용',['관리자','A · 수정·확정'],['A']]],projects:['A']})}},
 MutationObserver:class{observe(){}},
 document:{getElementById:id=>id==='sidebar-profile'?profile:id==='project-select'?null:root,querySelector:selector=>selector==='#sidebar .nav'?nav:selector==='#sidebar .brand-name'?brand:null,querySelectorAll:()=>[],addEventListener(){}},
 decoratePortfolio(){},decorateCostDetail(){},decoratePermits(){},
 App:{state,spec,ui:{view:'portfolio',tabs:{}},tabContracts:{},topbarContext:()=>({}),render(){},register:(key,fn)=>{routes[key]=fn},on:(key,fn)=>{actions[key]=fn},go:(...args)=>{moves.push(args);return true},esc:String,tabs:(_,tabs)=>tabs.map(([,label])=>label).join(' '),panel:(title,body,tools='')=>title+body+tools,table:(headers,rows)=>JSON.stringify([headers,rows]),empty:s=>s},
};
const source=readFileSync(new URL('../scripts/local-preview/studio.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
vm.runInNewContext(source,context);

const portfolioSource=readFileSync(new URL('../scripts/local-preview/portfolio.js',import.meta.url),'utf8').replace(/^export /gm,'');
const portfolioContext={document:{addEventListener(){}}};
vm.runInNewContext(portfolioSource,portfolioContext);
const {formatDisplayDates,formatDisplayLabels}=portfolioContext;
assert.equal(formatDisplayLabels('최초 언더라이팅 · 최초 언더라이팅 대비'), '최초UW · 최초UW 대비');
assert.equal(formatDisplayLabels('최초UW · 현재 사업비'), '최초UW · 현재 사업비');
assert.equal(formatDisplayLabels(null), null);
assert.equal(formatDisplayDates('일정 2026-01-03 ~ 2026-11-09'), '일정 2026.01.03 ~ 2026.11.09');
assert.equal(formatDisplayDates('2024-02-29 09:20 · 2026-11-09T02:01:00Z'), '2024.02.29 09:20 · 2026.11.09T02:01:00Z');
assert.equal(formatDisplayDates('2026-11 · 2026-02-30 · 2026.11.09'), '2026-11 · 2026-02-30 · 2026.11.09');
assert.equal(formatDisplayDates('DOC-2026-11-09 · 경로/2026-11-09/자료.pdf · 2026-11-09.pdf · https://example.test/?date=2026-11-09'), 'DOC-2026-11-09 · 경로/2026-11-09/자료.pdf · 2026-11-09.pdf · https://example.test/?date=2026-11-09');

assert.deepEqual({...context.App.topbarContext()},{prefix:'',date:'',label:'Last Update 2026.11.10'});
assert.equal(routes.spec,originalSpec,'the overlay leaves the original specification route intact');
assert.equal(brand.textContent,'IDM 개발사업관리');
assert.equal(profile.hidden,false);
assert.match(profile.innerHTML,/studio-account-avatar.*전기영 매니저.*jk\.jeon@igisam\.com/s);
assert.equal(photo.src,'/local-account-photo.png');
assert.doesNotMatch(profile.innerHTML,/<button|data-action|<a\b/);
assert.equal(entries.length,1);
assert.match(entries[0],/data-action="go" data-view="settings"/);
assert.match(entries[0],/권한 관리/);
context.App.render();
assert.equal(entries.length,1,'decorating the same sidebar leaves one access entry');
entries=[];
brand.textContent='개발사업관리';
context.App.render();
assert.equal(entries.length,1,'a rebuilt sidebar gets an access entry synchronously');
assert.equal(brand.textContent,'IDM 개발사업관리','a rebuilt sidebar receives the local title');
assert.equal(requests.length,0,'opening other screens does not read member data');
assert.match(routes.settings(),/회원별 조직별 프로젝트 담당/);
await new Promise(resolve=>setImmediate(resolve));
assert.deepEqual(requests,['/api/local-access-preview']);
const people=routes.settings();
assert.match(people,/회원별 권한.*이름.*이메일.*소속 조직.*사용.*현재 권한.*알림 프로젝트/);
assert.match(people,/테스트 이름.*관리자.*수정·확정/);
assert.match(people,/<button[^>]*disabled[^>]*>\+ 회원 추가/);
context.App.ui.tabs.settings='organizations';
assert.match(routes.settings(),/조직별 공통 권한.*조직장.*구성원.*공통 프로젝트 권한.*알림 범위.*테스트 조직/);
context.App.ui.tabs.settings='projects';
assert.match(routes.settings(),/프로젝트 담당.*담당자.*책임자.*개발솔루션센터.*기획추진센터/);
assert.deepEqual(Object.keys(actions),['studio-contract-amounts','studio-payment-list','studio-payment-contract'],'the preview adds contract and payment navigation without access-management writes');
assert.equal(JSON.stringify({state,spec}),before);
Object.assign(context.App.ui,{view:'cost',projectId:'A'});
context.App.ui.tabs.cost='detail';
context.App.tabContracts.cost=['overview','detail'];
context.document.querySelectorAll=()=>[{dataset:{view:'cost'}}];
context.rememberPage();
const saved=context.history.state;
assert.equal(saved.untouched,true);
assert.deepEqual({...saved.studioPage},{view:'cost',tab:'detail',projectId:'A'});
context.rememberPage();
assert.equal(context.history.state,saved,'an unchanged page does not replace the history entry');
assert.equal(context.restorePage(saved.studioPage),true);
assert.equal(context.restorePage({view:'cost',tab:'retired',projectId:'deleted'}),true);
assert.equal(context.restorePage({view:'unavailable'}),false);
assert.deepEqual(moves.map(move=>move.slice(0,3)),[['cost','detail','A'],['cost','','']]);
console.log('PASS: original spec preserved; C106 access tabs, capture rows and read-only controls verified');
console.log('PASS: reload context, unchanged entry, removed tab/project and unavailable page');
