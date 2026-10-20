import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createLawRouter} from '../server/law-router.mjs';
const seen=[],router=createLawRouter(async(req,action)=>{seen.push({url:req.url,method:req.method,action,cookie:req.headers.get('cookie'),body:req.method==='POST'?await req.json():null});return Response.json({action});});
for(const key of ['search','detail','watch']){const r=await router(new Request('https://qa.invalid/api/law?__law_route='+key+'&projectId=A',{headers:{cookie:'synthetic'}}));assert.equal(r.status,200);assert.equal(seen.at(-1).action,{search:'lawSearch',detail:'lawDetail',watch:'lawWatch'}[key]);assert(!seen.at(-1).url.includes('__law_route'));assert.equal(seen.at(-1).cookie,'synthetic');}
const post=await router(new Request('https://qa.invalid/api/law-watch',{method:'POST',headers:{origin:'https://qa.invalid','content-type':'application/json'},body:JSON.stringify({projectId:'A',sequence:'1'})}));assert.equal(post.status,200);assert.deepEqual(seen.at(-1).body,{projectId:'A',sequence:'1'});assert.equal(seen.at(-1).method,'POST');
assert.equal((await router(new Request('https://qa.invalid/api/law?__law_route=workspace'))).status,404);
assert.equal((await router(new Request('https://qa.invalid/api/law-watch?__law_route=search'))).status,400);
assert(fs.readdirSync('api').filter(x=>/\.(js|mjs|ts)$/.test(x)).length<=12);
const config=JSON.parse(fs.readFileSync('vercel.json'));assert.deepEqual(config.crons,[{path:'/api/maintenance',schedule:'0 23 * * *'}]);assert.equal(config.rewrites.length,3);
console.log('center120 law aliases, methods, body, auth headers, whitelist, 12-function limit and daily schedule: 8 passed');
