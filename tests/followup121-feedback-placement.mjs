import assert from 'node:assert/strict';import fs from 'node:fs';
const css=fs.readFileSync('src/recovery.css','utf8'),checks=[];function test(name,fn){try{fn();checks.push({name,passed:true})}catch(e){checks.push({name,passed:false,error:e.message.split('\n')[0]})}}
test('하위금액 사유 편집 중 오류토스트는 하단 저장/취소 위에 겹치지 않는 위치를 사용',()=>{assert.match(css,/\.dp-app:has\(\.cell-editable\[data-inline-type="money-reason"\]\.is-editing\)\s*~\s*#toast\s*\{[^}]*top:calc\(var\(--topbar\)\s*\+\s*12px\)[^}]*bottom:auto/);});
test('일반 토스트와 실행취소 동작은 삭제하거나 pointer-events로 막지 않음',()=>{assert.match(css,/#toast\s*\{[^}]*bottom:24px/);assert.doesNotMatch(css,/#toast[^{}]*\{[^}]*pointer-events:none/);assert.match(fs.readFileSync('src/core.js','utf8'),/undoFn\?A\.btn\('실행취소','undo'\)/);});
test('본문 일정 입력 중의 저장 실패 안내도 하단 저장/취소를 덮지 않음',()=>{assert.match(css,/\.dp-app:has\(#milestone-detail-form\)\s*~\s*#toast\s*\{[^}]*top:calc\(var\(--topbar\)\s*\+\s*12px\)[^}]*bottom:auto/);});
console.log(JSON.stringify({suite:'followup121-feedback-placement',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,checks,browserGeometryVerified:false}));if(checks.some(x=>!x.passed))process.exitCode=1;
