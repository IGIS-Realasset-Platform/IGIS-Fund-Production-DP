import assert from'node:assert/strict';import fs from'node:fs';
const read=p=>fs.readFileSync(p,'utf8'),ledger=JSON.parse(read('docs/continuation-20261023-ledger.json'));
assert.equal(ledger.version,'0.12.4');assert.deepEqual(ledger.items.map(r=>r.id),['COL124-01','COL124-02','COL124-03','UX124-04','QA124-05']);
for(const p of['package.json','package-lock.json','src/data/deployment-status-cloud-v0111.json'])assert.equal(JSON.parse(read(p)).version,'0.12.4',p);
assert.match(read('scripts/build-deployment.mjs'),/cloud\?'0\.12\.4'/);assert.match(read('scripts/build-deployment.mjs'),/CONTINUATION124_FIX_LEDGER/);assert.match(read('src/spec.js'),/A\.spec\.continuation124/);
assert.match(read('scripts/verify-center120.mjs'),/continuation124-/);assert.equal(ledger.items.find(r=>r.id==='QA124-05').allFunctionsVerified,false);
assert.match(read('AGENTS.md'),/수집 성공\/실패.*백엔드 기록/);
console.log(JSON.stringify({suite:'continuation124-spec',passed:11,scope:'새 버전·명세·검사 연결. 실제 기능 검수와 구별'}));
