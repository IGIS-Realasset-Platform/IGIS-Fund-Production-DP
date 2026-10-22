import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {LawCollectionError} from '../server/law-collector.mjs';

// Independent timing contract: the reason for a reserved overall-budget timer
// must survive a wall-clock observation one millisecond before its deadline.
const file='server/law-regional.mjs',source=await readFile(file,'utf8'),sha=x=>createHash('sha256').update(x).digest('hex'),pin=sha(source),from=source.indexOf('function requester(fetcher,deadline)'),to=source.indexOf('\nfunction jurisdictionStatus',from);
assert(from>=0&&to>from,'PREPARATION: extract the actual current requester');
async function timedCase({name,start,deadline,firedAt,expected,expectedDelay}){
 let now=start,timer,delay,aborted=false,cancelled=0,released=0,cleared=0,readerReached=false;
 const context={Date:{now:()=>now},AbortController,LawCollectionError,Buffer,Promise,Math,fail:code=>{throw new LawCollectionError(code);},setTimeout:(fn,ms)=>{timer=fn;delay=ms;return 1;},clearTimeout:()=>{cleared++;}};
 vm.runInNewContext(source.slice(from,to)+';globalThis.qaRequester=requester;',context);
 const fetcher=async(_url,options)=>{options.signal.addEventListener('abort',()=>{aborted=true;});return{ok:true,headers:{get:()=>null},body:{getReader:()=>({read:()=>{readerReached=true;return new Promise(()=>{});},cancel:()=>{cancelled++;return new Promise(()=>{});},releaseLock:()=>{released++;}})}};};
 const observed=context.qaRequester(fetcher,deadline).request('https://example.invalid/isolated-no-network').then(()=>({unexpectedSuccess:true}),e=>({code:e.code}));
 for(let i=0;i<8;i++)await Promise.resolve();assert(readerReached,'PREPARATION: reach actual nonresponsive reader');assert.equal(delay,expectedDelay,'reserved timer duration is not expanded');now=firedAt;timer();const result=await observed;
 assert.equal(result.code,expected,name);assert(aborted);assert.equal(cancelled,1);assert.equal(released,1);assert.equal(cleared,1);return{name,actual:result.code,delay,passed:true};
}
const cases=[];
for(const input of [
 {name:'overall1ms timer retains budget cause at deadline-1ms',start:1000,deadline:1001,firedAt:1000,expected:'REGIONAL_TIME_BUDGET',expectedDelay:1},
 {name:'independent6s request cap remains network failure',start:0,deadline:30000,firedAt:6000,expected:'REGIONAL_NETWORK_FAILED',expectedDelay:6000},
 {name:'actual overall deadline overrides delayed request cap',start:0,deadline:7000,firedAt:7000,expected:'REGIONAL_TIME_BUDGET',expectedDelay:6000},
 {name:'equal overall and request caps retain budget cause',start:0,deadline:6000,firedAt:5999,expected:'REGIONAL_TIME_BUDGET',expectedDelay:6000}
])cases.push(await timedCase(input));
// A real fetch failure before either timer fires must not become a budget error.
{
 let aborted=false,cleared=false;
 const context={Date:{now:()=>1000},AbortController,LawCollectionError,Buffer,Promise,Math,fail:code=>{throw new LawCollectionError(code);},setTimeout:()=>1,clearTimeout:()=>{cleared=true;}};
 vm.runInNewContext(source.slice(from,to)+';globalThis.qaRequester=requester;',context);
 await assert.rejects(context.qaRequester(async(_url,{signal})=>{signal.addEventListener('abort',()=>{aborted=true;});throw Error('synthetic network failure');},1001).request('https://example.invalid/isolated-no-network'),e=>e.code==='REGIONAL_NETWORK_FAILED');
 assert(aborted&&cleared);cases.push({name:'early real fetch failure is not relabelled budget',actual:'REGIONAL_NETWORK_FAILED',passed:true});
}
assert.equal(sha(await readFile(file)),pin,'source unchanged during test');
console.log(JSON.stringify({suite:'followup121-law-regional-deadline',passed:cases.length,failed:0,cases,source:{file,sha256:pin},realExternalNetwork:false,realDatabase:false,syntheticClockOnly:true}));
