import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const checks=[];
for(const permitDetail of [true,false])for(const top of [240,0]){
 try{
  let scrollTop=top,scrollLeft=31;const attributes=new Map([['data-ux-scroll-owner','true']]),styles=new Map();
  const body={dataset:{uxScrollOwner:'true',uxAddedTabindex:'true',uxAddedLabel:'true'},get scrollTop(){return scrollTop},set scrollTop(v){scrollTop=v},get scrollLeft(){return scrollLeft},set scrollLeft(v){scrollLeft=v},hasAttribute:key=>attributes.has(key),setAttribute(key,value){attributes.set(key,value)},removeAttribute(key){attributes.delete(key);scrollTop=0;scrollLeft=0},querySelector:selector=>selector==='[data-permit-detail-id]'&&permitDetail?{dataset:{permitDetailId:'SYNTHETIC-126'}}:null,querySelectorAll:()=>[],style:{setProperty:(key,value)=>styles.set(key,value)},getBoundingClientRect:()=>({height:500,width:800})};
  const dialog={open:true,dataset:{},style:{setProperty:(key,value)=>styles.set(key,value)},classList:{contains:()=>false},hasAttribute:()=>false,querySelector(selector){return selector===':scope>.dialog-body'?body:selector.includes('head')||selector.includes('foot')?{getBoundingClientRect:()=>({height:40})}:null},querySelectorAll:selector=>selector==='[data-ux-scroll-owner]'?[body]:[]};
  const A={ui:{view:'permit',tabs:{permit:'permits'}}},document={querySelector:()=>null,getElementById:id=>id==='app-dialog'?dialog:null,addEventListener(){},fonts:{}},context={App:A,document,window:{innerHeight:800,addEventListener(){}},getComputedStyle:()=>({display:'block',paddingTop:'12px',paddingBottom:'12px'}),requestAnimationFrame(){throw Error('동기 갱신 검사는 새 프레임을 만들지 않습니다.')}};
  vm.runInNewContext(fs.readFileSync('src/workspace-ux.js','utf8'),context);
  A.workspaceUX.refresh();assert.equal(body.scrollTop,permitDetail?top:0);assert.equal(body.scrollLeft,permitDetail?31:0);assert.equal(dialog.dataset.uxDialogScroll,'body');assert.equal(attributes.has('tabindex'),false);assert.equal(body.dataset.uxScrollOwner,'true');
  if(permitDetail){A.workspaceUX.refresh();assert.equal(body.scrollTop,top,'반복 배치에서도 원래 위치를 보존');assert.equal(body.scrollLeft,31);}
  checks.push({permitDetail,top,passed:true});
 }catch(error){checks.push({permitDetail,top,passed:false,error:error.message});}
}
console.log(JSON.stringify({suite:'review126-dialog-scroll',scope:'whole product module with explicit DOM clamp model; actual Edge geometry is separate',passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length,checks}));if(checks.some(x=>!x.passed))process.exitCode=1;
