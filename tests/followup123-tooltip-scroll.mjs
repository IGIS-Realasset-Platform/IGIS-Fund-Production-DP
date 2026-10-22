import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';
// Independent expectations follow the actual mobile focusin -> automatic scroll
// trace and the approved keyboard/pointer/closed-owner boundaries, not the patch.
const files=['src/recovery-views.js','src/recovery.css','src/core.js','tests/recovery-harness.mjs'];
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const pins=Object.fromEntries(files.map(p=>[p,sha(p)])),checks=[];
function fixture(){
 const h=makeHarness({modules:['core','recovery-views'],seed:{projects:[],entities:[],companies:[],auditEvents:[],notifications:[]}}),{document,context}=h;
 context.innerWidth=390;context.innerHeight=844;
 let tip=null;
 document.createElement=()=>tip={style:{},hidden:true,parentElement:null,textContent:'',setAttribute(k,v){this[k]=v;},getBoundingClientRect(){const left=Number.parseFloat(this.style.left)||0,top=Number.parseFloat(this.style.top)||0;return{left,top,right:left+220,bottom:top+70,width:220,height:70};}};
 document.body.append=el=>{el.parentElement=document.body;};
 document.activeElement=document.body;
 const owner=(id='QA-A')=>({id,isConnected:true,dataset:{tooltip:id+' synthetic chart observation'},attrs:{},rect:{left:50,top:450,right:54,bottom:454,width:4,height:4},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},getBoundingClientRect(){return{...this.rect};},closest(selector){return selector==='[data-tip],[data-tooltip]'?this:null;},contains(other){return other===this;}});
 const emit=(name,event={})=>{const fn=h.listeners[name]?.at(-1);assert.equal(typeof fn,'function','actual recovery tooltip '+name+' handler exists');fn(event);};
 const focus=el=>{document.activeElement=el;emit('focusin',{target:el});};
 return{...h,owner,emit,focus,get tip(){return tip;},scroll(){emit('scroll',{target:document.body});}};
}
function check(name,fn){try{fn();checks.push({name,status:'passed'});}catch(error){checks.push({name,status:'failed',error:error.message.slice(0,350)});}}
check('keyboard focus keeps tooltip and aria link after browser automatic scroll',()=>{const h=fixture(),a=h.owner();h.focus(a);assert.equal(h.tip.hidden,false);h.scroll();assert.equal(h.tip.hidden,false);assert.equal(a.attrs['aria-describedby'],'dp-chart-tooltip');assert.equal(h.document.activeElement,a);});
check('connected in-viewport focused owner repositions after actual rectangle moves',()=>{const h=fixture(),a=h.owner();h.focus(a);const oldTop=h.tip.style.top;a.rect={left:100,top:130,right:104,bottom:134,width:4,height:4};h.scroll();assert.equal(h.tip.hidden,false);assert.equal(h.tip.style.top,'142px');assert.equal(h.tip.style.left,'100px');assert.notEqual(h.tip.style.top,oldTop);});
check('ordinary pointer-owned tooltip hides and releases aria on scroll',()=>{const h=fixture(),a=h.owner();h.emit('pointerover',{target:a});assert.equal(h.tip.hidden,false);h.scroll();assert.equal(h.tip.hidden,true);assert.equal(a.attrs['aria-describedby'],undefined);});
check('pointer entry alone is not a keyboard-focus owner even if activeElement matches',()=>{const h=fixture(),a=h.owner();h.document.activeElement=a;h.emit('pointerover',{target:a});h.scroll();assert.equal(h.tip.hidden,true);});
for(const position of ['above','below','left','right'])check('offscreen focused owner hides: '+position,()=>{const h=fixture(),a=h.owner();h.focus(a);a.rect=position==='above'?{left:50,right:54,top:-20,bottom:-16,width:4,height:4}:position==='below'?{left:50,right:54,top:900,bottom:904,width:4,height:4}:position==='left'?{left:-20,right:-16,top:450,bottom:454,width:4,height:4}:{left:420,right:424,top:450,bottom:454,width:4,height:4};h.scroll();assert.equal(h.tip.hidden,true);assert.equal(a.attrs['aria-describedby'],undefined);});
check('detached owner cannot be redisplayed by a later scroll',()=>{const h=fixture(),a=h.owner();h.focus(a);a.isConnected=false;h.scroll();assert.equal(h.tip.hidden,true);assert.equal(a.attrs['aria-describedby'],undefined);});
check('another active control prevents old tooltip revival',()=>{const h=fixture(),a=h.owner(),b=h.owner('QA-B');h.focus(a);h.document.activeElement=b;h.scroll();assert.equal(h.tip.hidden,true);assert.equal(a.attrs['aria-describedby'],undefined);});
check('Escape then scroll does not revive same active chart point',()=>{const h=fixture(),a=h.owner();h.focus(a);h.emit('keydown',{key:'Escape'});assert.equal(h.tip.hidden,true);h.scroll();assert.equal(h.tip.hidden,true);assert.equal(a.attrs['aria-describedby'],undefined);});
check('focusout then scroll does not revive old owner',()=>{const h=fixture(),a=h.owner();h.focus(a);h.emit('focusout',{target:a});h.scroll();assert.equal(h.tip.hidden,true);assert.equal(a.attrs['aria-describedby'],undefined);});
check('pointerout then scroll does not revive pointer tooltip',()=>{const h=fixture(),a=h.owner();h.emit('pointerover',{target:a});h.emit('pointerout',{target:a,relatedTarget:null});h.scroll();assert.equal(h.tip.hidden,true);});
check('changing tooltip owner removes previous stale aria description',()=>{const h=fixture(),a=h.owner(),b=h.owner('QA-B');h.focus(a);h.focus(b);assert.equal(a.attrs['aria-describedby'],undefined);assert.equal(b.attrs['aria-describedby'],'dp-chart-tooltip');assert.equal(h.tip.textContent,b.dataset.tooltip);});
const result={suite:'followup123-tooltip-scroll',at:new Date().toISOString(),sourcePins:pins,sourceUnchanged:files.every(p=>sha(p)===pins[p]),checks,passed:checks.filter(x=>x.status==='passed').length,failed:checks.filter(x=>x.status==='failed').length,scope:'Actual common module and installed event handlers; synthetic DOM/viewport rectangles only. No native layout or CSS geometry claim.',actualBrowser:false,providerRequests:0,databaseCalls:0,productEdits:0};
if(process.argv.includes('--evidence')){const path='.build/followup-20261022/followup123-tooltip-scroll-'+Date.now()+'.json';writeFileSync(path,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({path,...result}));}else console.log(JSON.stringify(result));
if(result.failed||!result.sourceUnchanged)process.exitCode=1;
