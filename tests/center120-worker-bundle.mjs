import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const config=JSON.parse(await fs.readFile('vercel.json','utf8'));
test('순위 문서 처리기는 실제 예약 함수에만 의존성과 함께 포함한다',async()=>{
 const options=config.functions?.['api/maintenance.js'];
 assert.equal(options?.maxDuration,300);
 assert.equal(typeof options?.includeFiles,'string');
 assert.ok(options.includeFiles.length<=256);
 assert.equal(options.includeFiles,'{server/partner-{ranking-parser-worker,enrichment}.mjs,node_modules/{pdf2json,read-excel-file,fflate,saxen,unzipper-esm,worker-f,graceful-fs,node-int64}/**}');
 for(const name of ['pdf2json','read-excel-file','fflate','saxen','unzipper-esm','worker-f','graceful-fs','node-int64'])assert.ok((await fs.stat('node_modules/'+name+'/package.json')).isFile(),name);
 assert.ok((await fs.stat('server/partner-ranking-parser-worker.mjs')).isFile());
 assert.ok((await fs.stat('server/partner-enrichment.mjs')).isFile());
 // COL124-03: four explicit law-only recovery schedules reuse the same
 // maintenance Function. Dependency bundling and all12 Function boundaries stay unchanged.
 assert.equal(config.crons.length,5);
 assert.equal(config.crons[0].path,'/api/maintenance');
 assert.deepEqual(config.crons.slice(1),[{path:'/api/maintenance?job=law&slot=morning',schedule:'0 0 * * *'},{path:'/api/maintenance?job=law&slot=noon',schedule:'0 3 * * *'},{path:'/api/maintenance?job=law&slot=afternoon',schedule:'0 7 * * *'},{path:'/api/maintenance?job=law&slot=evening',schedule:'0 11 * * *'}]);
 assert.equal((await fs.readdir('api')).filter(x=>x.endsWith('.js')).length,12);
 assert.equal(Object.keys(config.functions).length,1);
});
