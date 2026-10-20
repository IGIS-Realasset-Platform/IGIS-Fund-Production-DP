import assert from 'node:assert/strict';
import {makeHarness} from './recovery-harness.mjs';
const h=makeHarness({modules:['core']}),A=h.A,viewport={scrollTop:260},query=h.document.querySelector.bind(h.document);h.document.querySelector=selector=>selector==='.main-scroll'?viewport:query(selector);
const render=A.render;let observedAtRender=null;A.render=()=>{observedAtRender=viewport.scrollTop;return render();};
A.register('overview',()=>'<section>독립 이동 경계</section>');
const before=JSON.stringify(A.state);A.go('overview');assert.equal(observedAtRender,0,'명시 화면 이동은 실제 스크롤 소유자를 표 높이 측정 전에 초기화해야 합니다.');assert.equal(viewport.scrollTop,0);assert.equal(JSON.stringify(A.state),before);
viewport.scrollTop=170;A.render();assert.equal(viewport.scrollTop,170,'저장·필터·프로젝트 변경 등의 일반 재렌더를 화면 재진입으로 취급하지 않습니다.');
console.log(JSON.stringify({passed:2,actualBrowser:false,businessMutation:false}));
