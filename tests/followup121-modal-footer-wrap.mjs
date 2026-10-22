import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const css=fs.readFileSync('src/workspace-ux.css','utf8'),rule='@media(max-width:760px){.dp-dialog[data-ux-dialog-scroll]>.dialog-foot{flex-wrap:wrap}}',checks=[],sha=x=>crypto.createHash('sha256').update(x).digest('hex');
function check(name,fn){try{fn();checks.push({name,pass:true});}catch(error){checks.push({name,pass:false,error:error.message});}}
check('좁은 화면의 일반 상세 직계 footer는 내용에 따라 줄바꿈',()=>{assert(css.includes(rule),'390px에서 첫 버튼이 음수x로 밀리는 실제 반례를 방지하는 좁은화면 규칙');assert.equal(css.split(rule).length,2,'동일 규칙 중복0');});
check('기존 폼 footer와 오류 안내의 줄바꿈 규칙은 유지',()=>{assert(css.includes('.dp-dialog[data-ux-dialog-scroll] #app-form>.dialog-foot{flex-wrap:wrap}'));assert(css.includes('#form-error:empty{display:none}'));});
check('추가한 좁은화면 한 규칙 외 기존 CSS 전체 바이트 불변',()=>{const prior=css.replace(rule+'\r\n','').replace(rule+'\n','');assert.equal(sha(prior),'9cad9fee1da0e45f1fe02f8312a14fc2f10394fdf2c2d6f444832a3a0d1e7983','기존 desktop/폼/스크롤/글자·색/출력 CSS 변경0');});
const result={suite:'followup121-modal-footer-wrap',passed:checks.filter(x=>x.pass).length,failed:checks.filter(x=>!x.pass).length,total:checks.length,checks,sourceSha256:sha(css),actualBrowser:false,geometryVerified:false,actualRemoteCalls:0,actualDatabaseCalls:0};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(result.failed)process.exitCode=1;
