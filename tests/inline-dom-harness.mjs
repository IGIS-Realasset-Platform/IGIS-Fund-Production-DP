import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {makeHarness} from './recovery-harness.mjs';
export function inlineDOMHarness({cloud=false}={}){
 const x=makeHarness({modules:[],seed:{projects:[{id:"QA-P",name:"격리 업무",cbs:[],contracts:[],permits:[],costStages:[]}]}}),doc=x.document,decode=s=>String(s).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&'),camel=s=>s.replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
 function matches(el,selector){return selector.split(',').some(raw=>{const s=raw.trim();if(s.startsWith('.'))return el.className.split(/\s+/).includes(s.slice(1));if(s.startsWith('#'))return el.id===s.slice(1);const a=s.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);if(a){const val=el.getAttribute(a[1]);return val!==null&&(a[2]===undefined||val===a[2]);}return el.tagName===s.toUpperCase();});}
 class Element{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.dataset={};this.style={};this.attrs={};this.children=[];this.parentElement=null;this.listeners={};this.className='';this.id='';this.name='';this.value='';this.hidden=false;this.open=false;this._html='';this.classList={add:(...c)=>this.className=[...new Set(this.className.split(/\s+/).filter(Boolean).concat(c))].join(' '),remove:(...c)=>this.className=this.className.split(/\s+/).filter(v=>!c.includes(v)).join(' '),contains:c=>this.className.split(/\s+/).includes(c),toggle:(c,on)=>{if(on===undefined)on=!this.classList.contains(c);on?this.classList.add(c):this.classList.remove(c);}};}
  get isConnected(){return this===doc.body||!!this.parentElement?.isConnected;}
  setAttribute(k,v){v=String(v);this.attrs[k]=v;if(k.startsWith('data-'))this.dataset[camel(k.slice(5))]=v;else if(['id','class','name','value','type'].includes(k))this[k==='class'?'className':k]=v;}
  getAttribute(k){if(k.startsWith('data-'))return this.dataset[camel(k.slice(5))]??null;if(['id','class','name','value','type'].includes(k))return this[k==='class'?'className':k]||null;return this.attrs[k]??null;}
  removeAttribute(k){delete this.attrs[k];}
  append(...elements){for(const child of elements){child.remove();child.parentElement=this;this.children.push(child);}}
  appendChild(child){this.append(child);return child;}
  remove(){if(this.parentElement){this.parentElement.children=this.parentElement.children.filter(c=>c!==this);this.parentElement=null;}}
  get innerHTML(){const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');return esc(this.textContent||'')+this.children.map(c=>{const attrs={...c.attrs,...Object.fromEntries(Object.entries(c.dataset).map(([k,v])=>['data-'+k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),v]))};for(const [key,val]of Object.entries({id:c.id,class:c.className,name:c.name,type:c.type}))if(val)attrs[key]=val;return '<'+c.tagName.toLowerCase()+Object.entries(attrs).map(([k,v])=>' '+k+'="'+esc(v)+'"').join('')+'>'+(['INPUT','BR','HR'].includes(c.tagName)?'':c.innerHTML+'</'+c.tagName.toLowerCase()+'>');}).join('');}
  set innerHTML(value){for(const c of this.children)c.parentElement=null;this.children=[];this.textContent='';this._html=String(value);const stack=[this],re=/<\/?([a-z][a-z0-9-]*)([^>]*)>/gi;let m,cursor=0;while((m=re.exec(this._html))){stack.at(-1).textContent=(stack.at(-1).textContent||'')+decode(this._html.slice(cursor,m.index));cursor=re.lastIndex;const closing=m[0].startsWith('</'),tag=m[1].toLowerCase();if(closing){if(stack.length>1)stack.pop();continue;}const child=new Element(tag),attrs=m[2],ar=/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;let a;while((a=ar.exec(attrs)))child.setAttribute(a[1],decode(a[2]??a[3]??a[4]??''));stack.at(-1).append(child);if(!['input','br','hr','img','meta','link'].includes(tag)&&!m[0].endsWith('/>'))stack.push(child);}stack.at(-1).textContent=(stack.at(-1).textContent||'')+decode(this._html.slice(cursor));}
  querySelectorAll(s){return this.children.flatMap(c=>[...(matches(c,s)?[c]:[]),...c.querySelectorAll(s)]);}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  closest(s){return matches(this,s)?this:this.parentElement?.closest(s)||null;}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  focus(){doc.activeElement=this;}
  select(){this.selected=true;}
  click(){emit(this,'click');}
  requestSubmit(){emit(this,'submit');}
  showModal(){this.open=true;}
  close(){if(this.open){this.open=false;for(const fn of this.listeners.close||[])fn({target:this});}}
  getBoundingClientRect(){return {width:180,height:30,left:250,top:200,right:430,bottom:230};}
 }
 doc.body=new Element('body');doc.documentElement=new Element('html');doc.createElement=t=>new Element(t);doc.querySelectorAll=s=>doc.body.querySelectorAll(s);doc.querySelector=s=>doc.body.querySelector(s);doc.getElementById=id=>doc.querySelectorAll('[id]').find(n=>n.id===id)||null;
 for(const id of ['app','sidebar','topbar','content','toast','app-dialog']){const el=new Element(id==='app-dialog'?'dialog':'div');el.id=id;doc.body.append(el);x.nodes.set(id,el);}
 function emit(target,type,extra={}){const e={target,type,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;},...extra};for(const fn of target.listeners?.[type]||[])fn(e);if(!e.stopped)for(const fn of x.listeners[type]||[])fn(e);return e;}
 doc.dispatchEvent=e=>{for(const fn of x.listeners[e.type]||[])fn(e);};x.context.CustomEvent=class{constructor(type,args){this.type=type;this.detail=args?.detail;}};x.context.FormData=class{constructor(form){this.values=form.querySelectorAll('input,select,textarea').filter(el=>el.name).map(el=>[el.name,el.value]);}[Symbol.iterator](){return this.values[Symbol.iterator]();}};
 if(cloud)x.context.APP_RUNTIME={mode:'real',version:'0.12.0',storageKey:'inline-command-qa',persistence:'cloud'};x.load('core');const app=vm.runInContext('App',x.context);return {...x,A:app,emit};
}
