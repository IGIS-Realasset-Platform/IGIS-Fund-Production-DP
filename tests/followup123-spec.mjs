import assert from'node:assert/strict';import fs from'node:fs';
const read=p=>fs.readFileSync(p,'utf8'),ledger=JSON.parse(read('docs/recheck-20261022-ledger.json'));
assert.deepEqual(ledger.items.map(x=>x.id),['AUTO123-01','AUTO123-02','AUTO123-03']);assert.equal(ledger.version,'0.12.3');
for(const file of['package.json','package-lock.json','src/data/deployment-status-cloud-v0111.json'])assert.equal(JSON.parse(read(file)).version,'0.12.3',file);
assert.match(read('scripts/build-deployment.mjs'),/cloud\?'0\.12\.3'/);assert.match(read('scripts/build-deployment.mjs'),/AUTO123_FIX_LEDGER/);assert.match(read('src/spec.js'),/A\.spec\.auto123/);assert.match(read('scripts/verify-center120.mjs'),/followup12\[123\]-/);
assert.equal(ledger.items.find(x=>x.id==='AUTO123-03').allRolesAndConditionsVerified,false);
console.log(JSON.stringify({suite:'followup123-spec',passed:10,scope:'새 요구·버전·현행 계약 연결, 과거 스냅샷/전체 검수와 구분'}));
