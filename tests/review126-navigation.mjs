import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeHarness} from './recovery-harness.mjs';
const checks=[];
const test=(name,fn)=>{try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}};
const fixture=()=>makeHarness({seed:{projects:[],entities:[],companies:[],auditEvents:[],notifications:[],lawChanges:[],projectLawImpacts:[]},modules:['core']});
for(const collapsed of [false,true])test(`메뉴 ${collapsed?'접힘':'펼침'}: 현재 기호·명시된 조작 이름·실제 숨김`,()=>{
 const h=fixture();h.A.ui.sidebarCollapsed=collapsed;const before=JSON.stringify(h.A.state);h.A.render();
 const top=h.nodes.get(collapsed?'topbar':'sidebar').innerHTML,button=top.match(/<button[^>]*class="btn sidebar-toggle"[^>]*>[\s\S]*?<\/button>/)?.[0];assert(button);
 assert.match(button,/<svg[^>]*aria-hidden="true"[^>]*focusable="false"/);assert(button.includes(`aria-label="메뉴 ${collapsed?'펼치기':'접기'}"`));assert.doesNotMatch(button,/title=/);assert(button.includes(`data-sidebar-symbol="${collapsed?'open':'close'}"`));
 assert(button.includes(`aria-expanded="${!collapsed}"`));assert(button.includes('aria-controls="sidebar"'));assert.equal(h.nodes.get('sidebar').hidden,collapsed);assert.doesNotMatch(h.nodes.get('sidebar').innerHTML.match(/<nav[\s\S]*?<\/nav>/)?.[0]||'',/<svg|<img|nav-icon/);assert.equal(JSON.stringify(h.A.state),before);
});
test('반복 접기·열기는 탐색 문맥과 업무자료를 변경하지 않음',()=>{
 const h=fixture();h.A.ui.view='portfolio';const before=JSON.stringify(h.A.state),projectId=h.A.ui.projectId;h.A.render();
 const invoke=()=>h.listeners.click.forEach(fn=>fn({target:{closest:()=>({dataset:{action:'sidebar-toggle'}})},preventDefault(){}}));
 invoke();assert.equal(h.A.ui.sidebarCollapsed,true);assert.equal(h.nodes.get('sidebar').hidden,true);invoke();assert.equal(h.A.ui.sidebarCollapsed,false);assert.equal(h.nodes.get('sidebar').hidden,false);assert.equal(h.A.ui.view,'portfolio');assert.equal(h.A.ui.projectId,projectId);assert.equal(JSON.stringify(h.A.state),before);
});
test('CSS는 상태와 관계없는 44px 정사각 조작영역·테두리 없는 제어를 정의',()=>{
 const css=fs.readFileSync('src/recovery.css','utf8'),rule=css.match(/\.dp-app \.sidebar-toggle\s*\{([^}]+)\}/)?.[1]||'';
 for(const expected of ['width:44px','height:44px','padding:0','border:0'])assert(rule.includes(expected),expected);
 assert.match(css,/\.sidebar-toggle:focus-visible/);assert.match(css,/\.sidebar-toggle:hover/);assert.match(css,/\.dp-app\.sidebar-collapsed\s*\{\s*grid-template-columns:minmax\(0,1fr\)/);
});
const result={suite:'review126-navigation',scope:'explicit synthetic empty workspace and source CSS contract; actual browser geometry/focus separately required',checks,passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length};fs.mkdirSync('.build/review-20261026',{recursive:true});fs.writeFileSync(`.build/review-20261026/navigation-${result.failed?'red':'green'}.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(result.failed)process.exitCode=1;
