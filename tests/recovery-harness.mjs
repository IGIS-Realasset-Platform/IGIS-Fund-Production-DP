import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {permitDomainBundle} from '../scripts/permit-domain-bundle.mjs';

// Pure JS integration harness. It does not open a browser, load a local URL or
// claim layout verification. DOM methods are inert external-boundary stubs.
export function makeHarness({stored={},storageMap=null,sessionMap=null,failWrites=false,modules=['core'],costTaxonomyV4=false,seed=undefined}={}) {
  const nodes=new Map(),listeners={};
  const node=id=>{if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',hidden:true,open:false,dataset:{},style:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},addEventListener(){},querySelector(){return null},querySelectorAll(){return []},setAttribute(){},getAttribute(){return null},showModal(){this.open=true},close(){this.open=false},focus(){},append(){},appendChild(){},remove(){},getBoundingClientRect(){return {width:100,height:30,left:0,top:0,right:100,bottom:30}}});return nodes.get(id)};
  const document={getElementById:node,addEventListener(k,fn){(listeners[k]??=[]).push(fn)},querySelector(){return null},querySelectorAll(){return []},createElement(){return node(randomUUID())},body:node('body'),documentElement:node('html'),fonts:{ready:Promise.resolve()},activeElement:null};
  const storage=storageMap||new Map(Object.entries(stored)),session=sessionMap||new Map();
  const initialSeed=seed===undefined?JSON.parse(fs.readFileSync('src/data/legacy-seed.json','utf8')):structuredClone(seed);
  const context={console,document,crypto:{randomUUID},setTimeout(){return 1},clearTimeout(){},requestAnimationFrame(fn){return 1},cancelAnimationFrame(){},queueMicrotask,URL,Blob,Intl,Date,structuredClone,TextEncoder,TextDecoder,navigator:{clipboard:{writeText:async()=>{}}},localStorage:{getItem:k=>storage.get(k)||null,setItem(k,v){if(failWrites)throw Error('quota');storage.set(k,v)}},sessionStorage:{getItem:k=>session.get(k)||null,setItem(k,v){session.set(k,v)},removeItem(k){session.delete(k)}},SEED:initialSeed,SPEC:JSON.parse(fs.readFileSync('src/data/base-spec.json')),RECOVERY_LEDGER:JSON.parse(fs.readFileSync('docs/recovery-ledger.json')),...(fs.existsSync('src/data/cost-type-master-v1.json')?{COST_TYPE_MASTER:JSON.parse(fs.readFileSync('src/data/cost-type-master-v1.json','utf8'))}:{}),...(fs.existsSync('src/data/cost-presets-v1.json')?{COST_USE_PRESETS:JSON.parse(fs.readFileSync('src/data/cost-presets-v1.json','utf8'))}:{})};
  if(fs.existsSync('src/data/cost-type-master-v2.json')){
    context.COST_TYPE_MASTER_ARCHIVE={'company-cbs-v1':context.COST_TYPE_MASTER};
    context.COST_TYPE_MASTER=JSON.parse(fs.readFileSync('src/data/cost-type-master-v2.json','utf8'));
  }
  if(fs.existsSync('src/data/cost-type-master-v3.json')){
    context.COST_TYPE_MASTER_ARCHIVE={...(context.COST_TYPE_MASTER_ARCHIVE||{}),'company-cbs-v2':context.COST_TYPE_MASTER};
    context.COST_TYPE_MASTER=JSON.parse(fs.readFileSync('src/data/cost-type-master-v3.json','utf8'));
  }
  if(costTaxonomyV4){
    if(!fs.existsSync('src/data/cost-taxonomy-v4.json')||!fs.existsSync('src/data/cost-type-master-v4.json')||!fs.existsSync('src/data/cost-presets-v2.json'))throw Error('v0.10.32 taxonomy fixture files are missing');
    context.COST_TYPE_MASTER_ARCHIVE={...(context.COST_TYPE_MASTER_ARCHIVE||{}),'company-cbs-v3':context.COST_TYPE_MASTER};
    context.COST_TAXONOMY=JSON.parse(fs.readFileSync('src/data/cost-taxonomy-v4.json','utf8'));
    context.COST_TYPE_MASTER_V4=JSON.parse(fs.readFileSync('src/data/cost-type-master-v4.json','utf8'));
    context.COST_TYPE_MASTER=context.COST_TYPE_MASTER_V4;
    context.COST_USE_PRESETS=JSON.parse(fs.readFileSync('src/data/cost-presets-v2.json','utf8'));
  }
  context.window=context;context.addEventListener=()=>{};
  if(fs.existsSync('docs/permit-catalog-20261020-review.json')){const reference=JSON.parse(fs.readFileSync('docs/permit-catalog-20261020-review.json','utf8'));context.PERMIT_REFERENCE={asOf:reference.asOf,sources:reference.sources,rows:reference.rows};}
  vm.createContext(context);
  const loaded=new Set(),presetCompatible=()=>context.COST_USE_PRESETS&&vm.runInContext('App.costTypeMaster?.version',context)===context.COST_USE_PRESETS.masterVersion,runModule=name=>{if(name==='cbs'&&fs.existsSync('src/cost-type-master.js')&&!loaded.has('cost-type-master'))runModule('cost-type-master');if(name==='cost-company-profile'){if(fs.existsSync('src/cost-cbs-order.js')&&!loaded.has('cost-cbs-order'))runModule('cost-cbs-order');if(fs.existsSync('src/cost-catalog-identity.js')&&!loaded.has('cost-catalog-identity'))runModule('cost-catalog-identity');}if(loaded.has(name))return;vm.runInContext(fs.readFileSync(`src/${name}.js`,'utf8'),context,{filename:`src/${name}.js`});loaded.add(name);if(name==='core'&&!modules.includes('chart-utils')&&!loaded.has('chart-utils'))runModule('chart-utils');if(name==='cost-type-master'&&costTaxonomyV4&&fs.existsSync('src/cost-taxonomy.js')&&!loaded.has('cost-taxonomy'))runModule('cost-taxonomy');if(name==='cost-order'&&fs.existsSync('src/cost-coding.js')&&!loaded.has('cost-coding'))runModule('cost-coding');if(fs.existsSync('src/cost-asset-presets.js')&&loaded.has('cbs')&&loaded.has('cost-company-profile')&&loaded.has('cost-coding')&&!loaded.has('cost-asset-presets')&&presetCompatible())runModule('cost-asset-presets');};
  for(const name of modules){if(name==='legal'&&!loaded.has('permit-domain')){vm.runInContext(permitDomainBundle(),context,{filename:'shared/permit-domain.mjs'});loaded.add('permit-domain');}runModule(name);}
  const A=modules.includes('core')?vm.runInContext('App',context):undefined;
  return {A,context,document,nodes,storage,session,listeners,setWriteFailure(value){failWrites=value},load:runModule};
}
