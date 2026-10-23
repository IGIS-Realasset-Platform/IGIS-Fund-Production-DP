import assert from'node:assert/strict';import fs from'node:fs';
const read=p=>fs.readFileSync(p,'utf8'),ledger=JSON.parse(read('docs/continuation-20261023-ledger.json'));
assert.equal(ledger.version,'0.12.4');assert.deepEqual(ledger.items.map(r=>r.id),['COL124-01','COL124-02','COL124-03','UX124-04','QA124-05']);
// CONT124's immutable ledger stays v124; later approved work has its own exact-version gate.
const currentVersion=JSON.parse(read('package.json')).version;assert.match(currentVersion,/^0\.12\.\d+$/);for(const p of['package-lock.json','src/data/deployment-status-cloud-v0111.json'])assert.equal(JSON.parse(read(p)).version,currentVersion,p);
assert(read('scripts/build-deployment.mjs').includes("cloud?'"+currentVersion+"'"));assert.match(read('scripts/build-deployment.mjs'),/CONTINUATION124_FIX_LEDGER/);assert.match(read('src/spec.js'),/A\.spec\.continuation124/);
assert.match(read('scripts/verify-center120.mjs'),/continuation12\[45\]-/);assert.equal(ledger.items.find(r=>r.id==='QA124-05').allFunctionsVerified,false);
assert.match(read('AGENTS.md'),/수집 성공\/실패.*백엔드 기록/);
console.log(JSON.stringify({suite:'continuation124-spec',passed:11,scope:'새 버전·명세·검사 연결. 실제 기능 검수와 구별'}));
