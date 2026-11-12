// Exercise the shipped local motion controller against a minimal DOM/WAAPI seam.
// No browser, user storage or original workspace writes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../scripts/local-preview/studio.js',import.meta.url),'utf8');
const controller=source.split('// LOCAL-SIDEBAR-MOTION:START')[1]?.split('// LOCAL-SIDEBAR-MOTION:END')[0];
assert.ok(controller,'shipped motion controller must exist');
function harness({mobile=false,reduced=false,closed=false}={}){
 const animations=[],events={},media={matches:reduced,addEventListener:(name,fn)=>{events.media=fn}};
 const mobileMedia={matches:mobile,addEventListener:(name,fn)=>{events.mobile=fn}};
 const make=(attrs={},children=[])=>{
  const classes=new Set(),node={attrs:{...attrs},children,style:{},hidden:false,inert:false,removed:false};
  node.classList={contains:x=>classes.has(x),add:x=>classes.add(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)};
  node.setAttribute=(name,value)=>{node.attrs[name]=value};node.removeAttribute=name=>{delete node.attrs[name]};
  node.querySelectorAll=()=>node.children.flatMap(c=>[c,...c.querySelectorAll('*')]);
  node.cloneNode=()=>make(node.attrs,node.children.map(c=>c.cloneNode(true)));
  node.remove=()=>{node.removed=true;if(node.parent)node.parent.children=node.parent.children.filter(c=>c!==node)};
  node.append=child=>{child.parent=node;node.children.push(child)};
  node.prepend=child=>{
   if(child.parentElement)child.parentElement.children=child.parentElement.children.filter(c=>c!==child);
   child.parentElement=node;node.children.unshift(child);
  };
  node.contains=child=>node.children.includes(child);
  node.animate=(frames,options)=>{const a={node,frames,options,cancelled:false,cancel(){this.cancelled=true;this.oncancel?.()},finish(){this.onfinish?.()}};animations.push(a);return a};
  return node;
 };
 const button=make({id:'original-menu',name:'nav','data-action':'go',tabindex:'0'});
 const brand=make(),topbar=make(),toggle=make();
 const sidebar=make({id:'sidebar'},[brand,button]),app=make();
 sidebar.querySelector=()=>brand;
 topbar.prepend(toggle);
 sidebar.hidden=closed;app.classList.toggle('sidebar-collapsed',closed);
 sidebar.getBoundingClientRect=()=>({left:0,top:mobile?56:0,width:190,height:mobile?788:844});
 let calls=0,focus='original-focus',deferred=false;
 const A={ui:{sidebarCollapsed:closed},state:{projects:[{id:'A',amount:93807690000}],revision:59},render(...args){
  calls++;if(!deferred){app.classList.toggle('sidebar-collapsed',this.ui.sidebarCollapsed);sidebar.hidden=this.ui.sidebarCollapsed;topbar.prepend(toggle);focus=this.ui.sidebarCollapsed?'reopen-control':'collapse-control'}return args[0];
 }};
 const doc={getElementById:id=>id==='app'?app:sidebar,querySelector:s=>s.startsWith('#topbar')?topbar:toggle,defaultView:{matchMedia:q=>q.includes('max-width')?mobileMedia:media,addEventListener:(name,fn)=>{events[name]=fn}}};
 vm.runInNewContext(controller+'\ninstallSidebarMotion(App, document);',{App:A,document:doc});
 return {A,app,sidebar,button,brand,topbar,toggle,animations,media,mobileMedia,events,doc,controller,get calls(){return calls},get focus(){return focus},defer:on=>{deferred=on}};
}
const h=harness(),before=JSON.stringify(h.A.state);
assert.equal(h.A.render('ordinary'),'ordinary');assert.equal(h.animations.length,0,'ordinary render has no motion');
h.A.ui.sidebarCollapsed=true;assert.equal(h.A.render('closed'),'closed');
assert.equal(h.sidebar.hidden,false,'desktop retains the real sidebar');
assert.ok(h.app.classList.contains('studio-icon-rail'));
assert.equal(h.toggle.parentElement,h.brand);
assert.equal(h.focus,'reopen-control','core focus remains authoritative');
assert.equal(h.animations.length,0,'desktop uses grid transition and no ghost');
assert.equal(h.button.attrs.id,'original-menu','real menu ID retained');
assert.equal(h.button.attrs['data-action'],'go','real event destination retained');
h.mobileMedia.matches=true;h.events.mobile();assert.equal(h.sidebar.hidden,true);assert.equal(h.toggle.parentElement,h.topbar);
h.mobileMedia.matches=false;h.events.mobile();assert.equal(h.sidebar.hidden,false);assert.equal(h.toggle.parentElement,h.brand);
assert.equal(JSON.stringify(h.A.state),before,'workspace untouched');
const calls=h.calls;vm.runInNewContext(controller+'\ninstallSidebarMotion(App, document);',{App:h.A,document:h.doc});h.A.render();assert.equal(h.calls,calls+1,'reinstall does not stack wrappers');

const mob=harness({mobile:true});mob.A.ui.sidebarCollapsed=true;mob.A.render();
assert.equal(mob.animations.length,1,'mobile auto-close animates only the overlay');
assert.equal(mob.sidebar.hidden,true);assert.equal(mob.focus,'reopen-control');
const ghost=mob.app.children[0];assert.ok(ghost.inert);assert.equal(ghost.attrs['aria-hidden'],'true');assert.equal(ghost.style.pointerEvents,'none');
for(const el of [ghost,...ghost.querySelectorAll('*')]){
 assert.equal(el.attrs.id,undefined);assert.equal(el.attrs['data-action'],undefined);assert.equal(el.attrs.name,undefined);
}
assert.ok(mob.animations.every(a=>a.options.duration>0&&a.options.duration<=220));
mob.A.ui.sidebarCollapsed=false;mob.A.render();
assert.ok(mob.animations[0].cancelled,'rapid reversal cancels old motion');assert.ok(ghost.removed);
assert.equal(mob.app.children.length,0,'opening uses the real sidebar, no duplicate menu');assert.equal(mob.sidebar.hidden,false);assert.equal(mob.focus,'collapse-control');
mob.events.resize();assert.ok(mob.animations[1].cancelled,'resize cancels transient geometry');
mob.A.ui.sidebarCollapsed=true;mob.A.render();const closing=mob.app.children[0];mob.animations.at(-1).finish();assert.ok(closing.removed,'finished closing ghost removed');
const rm=harness({mobile:true,reduced:true});rm.A.ui.sidebarCollapsed=true;rm.A.render();assert.equal(rm.animations.length,0);assert.equal(rm.sidebar.hidden,true);
const dynamic=harness({mobile:true});dynamic.A.ui.sidebarCollapsed=true;dynamic.A.render();dynamic.media.matches=true;dynamic.events.media();assert.equal(dynamic.app.children.length,0);assert.ok(dynamic.animations.every(a=>a.cancelled));
const def=harness({mobile:true});def.defer(true);def.A.ui.sidebarCollapsed=true;def.A.render();assert.equal(def.animations.length,0,'deferred render does not animate unchanged layout');assert.equal(def.app.children.length,0);def.defer(false);def.A.render();assert.equal(def.animations.length,1);
const unavailable=harness({mobile:true});unavailable.sidebar.animate=undefined;unavailable.A.ui.sidebarCollapsed=true;unavailable.A.render();assert.equal(unavailable.sidebar.hidden,true);assert.equal(unavailable.animations.length,0,'missing animation API preserves normal behavior');
console.log('PASS: desktop rail and viewport switching; mobile overlay, inert ghost, focus, rapid cancellation, reduced motion and missing API');
