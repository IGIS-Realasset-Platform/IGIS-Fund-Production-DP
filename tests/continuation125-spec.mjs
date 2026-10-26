import fs from 'node:fs';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8'),ledger=JSON.parse(read('docs/purpose-20261023-ledger.json')),ids=['UX125-01','UX125-02','FIN125-03','QA125-04','GOV125-05'];
assert.equal(ledger.version,'0.12.5');assert.deepEqual(ledger.items.map(x=>x.id),ids);assert.equal(ledger.boundaries.allPlatformFunctionsVerified,false);
// PUR125 remains a historical requirement ledger; the current runtime advances independently.
for(const p of['package.json','package-lock.json','src/data/deployment-status-cloud-v0111.json'])assert.equal(JSON.parse(read(p)).version,'0.12.6',p);
assert.equal(JSON.parse(read('package-lock.json')).packages[''].version,'0.12.6');assert.match(read('scripts/build-deployment.mjs'),/cloud\?'0\.12\.6'/);assert.match(read('scripts/build-deployment.mjs'),/PURPOSE125_FIX_LEDGER/);assert.match(read('src/spec.js'),/A\.spec\.purpose125/);
assert(read('AGENTS.md').includes('docs/component-review-matrix.md'));assert.match(read('scripts/verify-center120.mjs'),/continuation12\[45\]-/);for(const id of ids)assert(read('docs/purpose-20261023-spec.md').includes(id));
const m=JSON.parse(read('docs/component-review-matrix.json'));assert.equal(m.allPlatformComponentsAccepted,false);assert(m.components.length>0);assert.equal(new Set(m.components.map(x=>x.componentID)).size,m.components.length);assert(m.denominator.mainMenus===10);assert(m.components.every(x=>x.policyBasis&&x.verification&&x.purpose));
console.log(JSON.stringify({suite:'continuation125-spec',status:'passed',scope:'Version, requirements and matrix preservation; not functionality or all-component acceptance'}));
