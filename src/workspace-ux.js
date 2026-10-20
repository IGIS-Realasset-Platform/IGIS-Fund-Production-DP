/* Scroll ownership only: no records, business actions, colors or typography. */
(function(A){
 'use strict';
 const tableRules=[
  {view:'cost',tab:'detail',selector:'.cost-detail-simple>.table-wrap',container:'.cost-detail-simple'},
  {view:'document',selector:'.document-list>.table-wrap',container:'.document-list'},
  {view:'company',group:'directory',selector:'.dp-partners>.panel .table-wrap',container:'.dp-partners>.panel'},
  {view:'company',selector:'.dp-ranking-wrap',container:'.dp-partners>.panel'},
  {view:'law',tab:'catalog',selector:'.law-workspace>.panel .table-wrap',container:'.law-workspace>.panel'},
  {view:'law',tab:'history',selector:'.law-workspace>.panel .table-wrap',container:'.law-workspace>.panel'},
  {view:'law',tab:'recent',selector:'.law-workspace>.panel .table-wrap',container:'.law-workspace>.panel'},
  {view:'spec',selector:'.spec-json',container:'.panel',bounded:true}
 ];
 const innerDialogs=[{name:'cost-catalog',selector:'.cbs-catalog-list',shell:'.cbs-catalog-shell'},{name:'notification-list',selector:'.notice-list-scroll'}];
 let scheduled=false,previewContext=null,observed=false,last={mode:'page',reason:'not-refreshed'};
 const visible=el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).display!=='none';};
 const px=value=>Number.parseFloat(value)||0;
 function owner(el,label){if(!el)return;el.dataset.uxScrollOwner='true';if(!el.hasAttribute('tabindex')){el.tabIndex=0;el.dataset.uxAddedTabindex='true';}if(!el.hasAttribute('aria-label')){el.setAttribute('aria-label',label);el.dataset.uxAddedLabel='true';}}
 function clearOwners(root){for(const el of [root,...root.querySelectorAll('[data-ux-scroll-owner]')]){if(!el.hasAttribute('data-ux-scroll-owner'))continue;delete el.dataset.uxScrollOwner;if(el.dataset.uxAddedTabindex){el.removeAttribute('tabindex');delete el.dataset.uxAddedTabindex;}if(el.dataset.uxAddedLabel){el.removeAttribute('aria-label');delete el.dataset.uxAddedLabel;}}}
 function naturalize(root,except=null,overlay=null){for(const el of root.querySelectorAll('div,section,pre,ul,ol')){if(el===except||except?.contains(el)||el===overlay||el.matches('.spec-json'))continue;const style=getComputedStyle(el);if(['auto','scroll'].includes(style.overflowY)&&style.maxHeight!=='none'&&px(style.maxHeight)>0)el.dataset.uxNaturalY='true';}}
 function chooseRule(view,tab,group){return tableRules.find(rule=>rule.view===view&&(!rule.tab||rule.tab===tab)&&(!rule.group||rule.group===group))||null;}
 function fitPage(){const main=document.querySelector('.main-scroll'),content=document.getElementById('content');if(!main||!content)return;clearOwners(main);for(const el of content.querySelectorAll('[data-ux-primary-table],[data-ux-natural-y]')){delete el.dataset.uxPrimaryTable;delete el.dataset.uxNaturalY;el.style.removeProperty('--ux-table-height');}main.dataset.uxScrollMode='page';content.dataset.uxScrollMode='page';
  const view=A.ui.view,tab=A.ui.tabs?.[view]||'',group=tab==='companies'?'directory':tab||A.ui.partnerGroup||'cak-rows',rule=chooseRule(view,tab,group),wrap=rule?content.querySelector(rule.selector):null;
  // An expanded document preview is a second component, not part of its table.
  const preview=content.querySelector('.document-preview:not([hidden])'),previewOverlay=preview&&getComputedStyle(preview).position==='absolute';
  const identity=A.ui.projectId+':'+view+':'+tab+':'+group,restorePageScroll=!previewOverlay&&previewContext?.identity===identity?previewContext.scroll:null;
  if(previewOverlay&&previewContext?.identity!==identity)previewContext={identity,scroll:main.scrollTop};if(!previewOverlay)previewContext=null;
  const finishPage=()=>{if(restorePageScroll!==null)main.scrollTop=restorePageScroll;};
  if(view==='document'&&preview&&!previewOverlay){naturalize(content);owner(main,'페이지 내용');last={mode:'page',reason:'document-preview'};finishPage();return;}
  if(!rule||!visible(wrap)||view==='company'&&group==='market'){naturalize(content);owner(main,'페이지 내용');last={mode:'page',reason:rule?'no-visible-primary':'multiple-components'};finishPage();return;}
  // Measure the table's logical top at page-scroll zero. A previous page offset
  // must not inflate its available height or remain hidden behind table mode.
  const container=wrap.closest(rule.container)||wrap.parentElement,mainRect=main.getBoundingClientRect(),rect=wrap.getBoundingClientRect(),containerRect=container.getBoundingClientRect(),style=getComputedStyle(content),tail=Math.max(0,containerRect.bottom-rect.bottom)+px(getComputedStyle(container).marginBottom),logicalTop=rect.top+main.scrollTop,budget=Math.floor(Math.min(mainRect.bottom,window.innerHeight)-logicalTop-px(style.paddingBottom)-tail-2);
  // At short/zoomed viewports, keep the page scrollable rather than clipping the
  // toolbar or making the last rows unreachable with an arbitrary min height.
  if(budget<(rule.bounded||previewOverlay?48:150)){naturalize(content,null,previewOverlay?preview:null);owner(main,'페이지 내용');last={mode:'page',reason:'insufficient-table-space',availableHeight:budget};finishPage();return;}
  const fitHeight=rule.bounded?Math.min(budget,Math.floor(window.innerHeight*.7)):budget;
  naturalize(content,wrap,previewOverlay?preview:null);main.dataset.uxScrollMode='table';content.dataset.uxScrollMode='table';wrap.dataset.uxPrimaryTable='true';wrap.style.setProperty('--ux-table-height',fitHeight+'px');owner(wrap,rule.bounded?'명세 JSON 내용':'표 내용');
  main.scrollTop=0;if(restorePageScroll>0)wrap.scrollTop=restorePageScroll;
  if(previewOverlay){preview.dataset.uxPreviewScroll='true';owner(preview,'문서 상세');}
  last={mode:'table',view,tab,group,selector:rule.selector,availableHeight:budget};
 }
 function fitDialog(){const dialog=document.getElementById('app-dialog');if(!dialog?.open)return;clearOwners(dialog);for(const el of dialog.querySelectorAll('[data-ux-natural-y]'))delete el.dataset.uxNaturalY;const body=dialog.querySelector(':scope>.dialog-body');if(!body)return;const head=dialog.querySelector(':scope>.dialog-head'),foot=dialog.querySelector(':scope>.dialog-foot'),limit=Math.min(window.innerHeight-24,window.innerHeight*(dialog.classList.contains('dp-notification-dialog')?.8:.92)),style=getComputedStyle(body),budget=Math.max(72,Math.floor(limit-(head?.getBoundingClientRect().height||0)-(foot?.getBoundingClientRect().height||0)-px(style.paddingTop)-px(style.paddingBottom)-4));dialog.style.setProperty('--ux-dialog-body-budget',budget+'px');
  const formFoot=body.querySelector('#app-form>.dialog-foot');body.style.setProperty('--ux-form-footer-space',formFoot?Math.ceil(formFoot.getBoundingClientRect().height+16)+'px':'0px');
  const inner=innerDialogs.find(item=>visible(body.querySelector(item.selector)));
  if(inner){dialog.dataset.uxDialogScroll='inner';const target=body.querySelector(inner.selector);naturalize(body,target);target.style.setProperty('--ux-inner-height',budget+'px');if(inner.shell){const shell=body.querySelector(inner.shell);shell.style.setProperty('--ux-shell-height',budget+'px');}owner(target,inner.name==='cost-catalog'?'사업비 항목 목록':'알림 목록');}
  else{dialog.dataset.uxDialogScroll='body';naturalize(body);owner(body,'팝업 내용');}
 }
 function refresh(){if(!document.querySelector||typeof getComputedStyle!=='function')return last;fitPage();fitDialog();if(!observed&&typeof MutationObserver==='function'){observed=true;const observer=new MutationObserver(schedule);const content=document.getElementById('content'),dialog=document.getElementById('app-dialog');if(content)observer.observe(content,{childList:true,subtree:true,attributes:true,attributeFilter:['open','class','hidden']});if(dialog)observer.observe(dialog,{childList:true,subtree:true,attributes:true,attributeFilter:['open','class','hidden']});if(typeof ResizeObserver==='function'){const resize=new ResizeObserver(schedule),main=document.querySelector('.main-scroll');if(main)resize.observe(main);if(dialog)resize.observe(dialog);}}return {...last};}
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refresh();});}
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);document.addEventListener('toggle',schedule,true);document.fonts?.ready?.then(schedule);
 A.workspaceUX=Object.freeze({refresh,status:()=>({...last}),rules:tableRules.map(rule=>({...rule})),chooseRule});
})(App);
