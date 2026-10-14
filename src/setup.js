(function(A){
 'use strict';
 const fields=[['name','사업명','text'],['location','소재지','text'],['operator','사업시행 법인','text'],['manager','담당자','text'],['gfaTotal','연면적 ㎡','number'],['siteArea','대지면적 ㎡','number'],['acquisitionLandArea','취득대상 토지면적 ㎡','number']];
 const paths={name:'name',location:'location',operator:'basic.operator',manager:'basic.manager',gfaTotal:'building.gfaTotal',siteArea:'building.siteArea',acquisitionLandArea:'building.acquisitionLandArea'};
 const read=(p,key)=>key.split('.').reduce((o,k)=>o?.[k],p),copy=x=>A.clone(x),text=x=>String(x??'').trim(),live=xs=>(xs||[]).filter(x=>!x.deletedAt),stamp=()=>new Date().toISOString();
 const fail=errors=>{throw A.inputError?A.inputError(errors):Object.assign(Error(Object.values(errors)[0]),{fieldErrors:errors});};
 const create=(label,action,data={})=>A.createButton?A.createButton(label,action,data):A.btn(label,action,data,'create');
 const evidenceKeys=[['evidenceSource','자료명'],['evidenceLocation','자료 위치 · 시트/페이지'],['evidenceAsOf','자료 기준일'],['evidencePath','공통 근거 경로']];
 function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
 function evidence(values){return {source:text(values.evidenceSource??values.source),location:text(values.evidenceLocation??values.sourceLocation),asOf:text(values.evidenceAsOf??values.asOf),path:text(values.evidencePath??values.path)};}
 function evidenceErrors(e){const errors={};if(!e.source)errors.evidenceSource='자료명을 입력해 주세요.';if(!e.location)errors.evidenceLocation='자료 위치를 입력해 주세요.';if(!validDate(e.asOf))errors.evidenceAsOf='자료 기준일을 정확히 입력해 주세요.';if(!e.path)errors.evidencePath='공통 근거 경로를 입력해 주세요.';return errors;}
 function legalValues(v){return {...v,source:v.evidenceSource,sourceLocation:v.evidenceLocation,asOf:v.evidenceAsOf,path:v.evidencePath};}
 function validateBasic(values,{partial=false}={}){
   const normalized={...values},errors={};
   for(const [key,label,type]of fields){const inputKey=Object.prototype.hasOwnProperty.call(values,key)?key:Object.prototype.hasOwnProperty.call(values,paths[key])?paths[key]:key;if(partial&&!Object.prototype.hasOwnProperty.call(values,inputKey))continue;const raw=values[inputKey];if(raw==null||text(raw)===''){errors[inputKey]=label+' 항목을 입력해 주세요.';continue;}if(type==='number'){const n=Number(raw);if(!Number.isFinite(n)||n<0)errors[inputKey]='0 이상의 숫자를 입력해 주세요.';else normalized[inputKey]=n;}else normalized[inputKey]=text(raw);}
   return {valid:Object.keys(errors).length===0,errors,normalized};
 }
 function validate(values,{checkId=true}={}){
   const basic=validateBasic(values),normalized={...basic.normalized,id:text(values.id),type:text(values.type)},errors={...basic.errors};
   if(!normalized.id)errors.id='프로젝트 코드를 입력해 주세요.';else if(checkId&&A.state.projects.some(p=>p.id===normalized.id))errors.id='이미 사용하는 프로젝트 코드입니다.';
   if(!normalized.type)errors.type='사업유형을 선택해 주세요.';
   Object.assign(errors,evidenceErrors(evidence(values)),A.legal?.projectRegistrationErrors?.(legalValues(values))||{});
   return {valid:Object.keys(errors).length===0,errors,normalized,evidence:evidence(values)};
 }
 function existingCandidates(p){return fields.map(([key,label,type])=>({id:A.uid('candidate'),key:paths[key],label,type,value:read(p,paths[key])??'',source:'기존 저장자료',location:'기본정보',asOf:p.asOf||'',path:'',status:'unreviewed',choices:[]}));}
 function initialize(state){
   state.projectRegistrationDrafts=state.projectRegistrationDrafts||[];
   for(const p of state.projects||[]){if(!p.initialization)p.initialization={status:'legacy-preserved',candidates:existingCandidates(p)};if(!p.registrationInput)p.registrationInput={status:'legacy-preserved',missingKeys:fields.filter(([key])=>read(p,paths[key])==null||text(read(p,paths[key]))==='').map(([key])=>key)};p.inputDataReviews=p.inputDataReviews||[];p.inputDataReviewHistory=p.inputDataReviewHistory||[];
     // CBS may have created an empty initialization placeholder. Preserve that
     // object and any old decisions; add a separate, immutable baseline instead.
     p.preservedInputCandidates=p.preservedInputCandidates||[];
     const known=new Set([...(p.initialization.candidates||[]),...p.preservedInputCandidates].map(c=>c.key));
     for(const candidate of existingCandidates(p))if(!known.has(candidate.key)){p.preservedInputCandidates.push({...candidate,provenance:'v0.10.6 기존 기본정보 보존',preservedAt:stamp()});known.add(candidate.key);}
   }
 }
 function newCode(){let n=A.state.projects.length+1,value;do{value='PRJ'+String(n++).padStart(3,'0');}while(A.state.projects.some(p=>p.id===value));return value;}
 function buildProject(v,e){
  const p={id:v.id,name:v.name,type:v.type,location:v.location,asOf:e.asOf,stage:A.realMode?'':'검토',companyCostTaxonomyVersion:'company-cost-taxonomy-v4',basic:{operator:v.operator,manager:v.manager,method:A.realMode?'':'민간개발',periodStart:'',periodEnd:'',established:''},building:{gfaTotal:v.gfaTotal,siteArea:v.siteArea,acquisitionLandArea:v.acquisitionLandArea,buildingArea:null,floorsAbove:A.realMode?null:0,floorsBelow:A.realMode?null:0,zone:'',mainUse:'',far:null,bcr:null},costs:[],cbs:[],costStages:[],areaHistory:[],contracts:[],loans:[],equities:[],documents:[],permits:[],milestones:[],land:{},landPayments:[],construction:{},sales:[],reports:[],reportParticipants:{contractors:[],trustees:[],guarantors:[]},reportForm:{},inputDataReviews:[],inputDataReviewHistory:[]};
   p.cbs=(A.cbsDictionary||[]).filter(d=>!d.legacy&&!d.exception).map((d,i)=>({id:A.uid('cbs'),code:d.code,name:d.name,dictionaryKey:d.key,parentId:null,current:null,initial:null,sortOrder:i,sourceIds:[],deletedAt:null}));
   const at=stamp();p.registrationInput={status:'confirmed',confirmedAt:at,confirmedBy:v.manager,evidence:copy(e),missingKeys:[]};
   p.initialization={status:'complete',completedAt:at,commonEvidence:copy(e),candidates:fields.map(([key,label,type])=>({id:A.uid('candidate'),key:paths[key],label,type,value:v[key],source:e.source,location:e.location,asOf:e.asOf,path:e.path,status:'confirmed',reviewedAt:at,reviewedBy:v.manager,choices:[],confirmationScope:'project-registration'}))};
   return p;
 }
 function finishRegistration(p){if(!p||!A.state.projects.includes(p))return false;A.ui.projectId=p.id;A.ui.view='overview';A.ui.registrationDraftId='';A.persistUI?.();return true;}
 function registerProject(values,draftId='',options={}){
   const result=validate(values);if(!result.valid)fail(result.errors);
   const draft=draftId?live(A.state.projectRegistrationDrafts).find(d=>d.id===draftId):null;if(draftId&&!draft)fail({id:'등록 초안을 찾을 수 없습니다.'});
   const p=buildProject(result.normalized,result.evidence);
   A.transaction(()=>{A.state.projects.push(p);A.legal?.applyProjectRegistration?.(p,legalValues(result.normalized));for(const init of A.initializers)init(A.state);const preset=A.costUsePresets?.forProjectType?.(p.type);if(preset)A.costUsePresets.apply(p,preset.id,{mode:'registration',source:'project-registration'});if(draft){draft.registeredProjectId=p.id;draft.registeredAt=stamp();}A.audit('CREATE','project',p.id,null,p,p.id+' 프로젝트가 등록되었습니다.',{view:'overview',projectId:p.id});});
   if(options.navigate!==false)finishRegistration(p);return p;
 }
 function saveDraft(values,id=''){
   const old=id?live(A.state.projectRegistrationDrafts).find(x=>x.id===id&&!x.registeredProjectId):null;if(id&&!old)fail({id:'등록 초안을 찾을 수 없습니다.'});
   return A.transaction(()=>{const row={id:old?.id||A.uid('registration-draft'),values:copy(values),savedAt:stamp(),status:'draft'},before=old?copy(old):null;if(old)Object.assign(old,row);else A.state.projectRegistrationDrafts.push(row);A.audit(before?'UPDATE':'CREATE','projectRegistrationDraft',row.id,before,row,'등록 초안이 저장되었습니다.',{view:'portfolio',projectId:''});return row;});
 }
 function evidenceFields(e={}){
   return '<fieldset class="full dp-registration-evidence"><legend>공통 입력자료</legend><div class="form-grid">'+A.field('evidenceSource','자료명',e.source||'')+A.field('evidenceLocation','자료 위치 · 시트/페이지',e.location||'')+A.field('evidenceAsOf','자료 기준일',e.asOf||A.today,'date')+A.field('evidencePath','공통 근거 경로',e.path||'')+'</div></fieldset>';
 }
 function formFields(values={}){
   const v={id:newCode(),type:A.realMode?'':'오피스',...values};
   const projectTypes=['복합개발사업','오피스','리테일','호텔','물류','데이터센터','시니어리빙','임대주택','분양주택'];if(v.type&&!projectTypes.includes(v.type))projectTypes.push(v.type);
   return '<div class="full dp-registration-fields">'+A.field('id','프로젝트 코드',v.id)+A.field('type','사업유형',v.type,'select',projectTypes)+fields.map(([key,label,type])=>A.field(key,label,v[key]??'',type)).join('')+'</div>'+evidenceFields(evidence(v))+'<div class="full dp-registration-draft-action">'+A.btn('등록 초안 저장','registration-draft-save')+'</div>';
 }
 function draftAdapter(id=''){
   let currentId=id;return {scope:'project-registration',label:'프로젝트 등록',saveDraft(values){const committedId=currentId&&live(A.state.projectRegistrationDrafts).some(x=>x.id===currentId&&!x.registeredProjectId)?currentId:id;const row=saveDraft(values,committedId);currentId=row.id;return row;},resume(){/* The shared form editor restores its DOM, values, errors and guard. */}};
 }
 function openRegistration(id='',resumeValues){
   const draft=id?live(A.state.projectRegistrationDrafts).find(x=>x.id===id&&!x.registeredProjectId):null;if(id&&!draft)return A.toast('등록 초안을 찾을 수 없습니다.');
   A.ui.registrationDraftId=id;A.form(draft?'등록 초안':'프로젝트 등록',formFields(resumeValues||draft?.values||{}),v=>{const p=registerProject(v,A.ui.registrationDraftId||id,{navigate:false});setTimeout(()=>{if(finishRegistration(p))A.render();},0);return p;},'등록 확정',{draftAdapter:draftAdapter(id)});
 }
 function renderDrafts(){const rows=live(A.state.projectRegistrationDrafts).filter(x=>!x.registeredProjectId);if(!rows.length)return'';return A.panel('등록 초안',A.table(['프로젝트','저장일',''],rows.map(d=>[A.esc(d.values.name||'사업명 미입력'),A.esc(d.savedAt.slice(0,16).replace('T',' ')),A.btn('등록 이어하기','registration-draft-open',{id:d.id})+A.btn('삭제','registration-draft-delete',{id:d.id},'text')])));}
 function combinedSources(p){
   const original=(p.initialization?.candidates||[]).map(x=>({...x,origin:'legacy'})).concat((p.preservedInputCandidates||[]).map(x=>({...x,origin:'preserved'})));
   return original.map(x=>{const overlay=live(p.inputDataReviews).filter(y=>y.originCandidateId===x.id).at(-1);return overlay?{...x,...overlay,id:x.id,reviewId:overlay.id}:x}).concat(live(p.inputDataReviews).filter(x=>!x.originCandidateId));
 }
 function sourceTable(p){
   const rows=combinedSources(p);return A.table(['항목','자료값','원자료','위치','기준일','검토자','상태','근거'],rows.map(c=>[A.esc(c.label),A.esc(c.value),A.esc(c.source),A.esc(c.location),A.esc(c.asOf),A.esc(c.reviewedBy||'—'),c.status==='confirmed'||c.status==='reviewed'?'확인 완료':c.status==='deferred'?'보류':c.status==='conflict'?'후보 선택 필요':'미확인',c.path?A.btn('경로 복사','path-copy',{path:c.path},'small'):'—']),'dp-input-source-table');
 }
 function addCandidate(p,v){
   const field=fields.find(([key])=>paths[key]===v.key||key===v.key);if(!field)fail({key:'대상 항목을 선택해 주세요.'});
   const [name,label,type]=field,errors={};if(v.value==null||text(v.value)==='')errors.value='자료값을 입력해 주세요.';if(!text(v.source))errors.evidenceSource='자료명을 입력해 주세요.';if(Object.keys(errors).length)fail(errors);
   const current=read(p,paths[name]),conflict=current!=null&&String(current)!==String(v.value),row={id:A.uid('input-candidate'),key:paths[name],label,type,value:v.value,source:text(v.source),location:text(v.location),asOf:text(v.asOf),path:text(v.path),status:conflict?'conflict':'pending',choices:conflict?[{value:current,source:'현재 입력값'},{value:v.value,source:text(v.source)}]:[],createdAt:stamp()};
   return A.transaction(()=>{p.inputDataReviews.push(row);A.audit('CREATE','inputDataCandidate',row.id,null,row,p.id+' 입력자료 후보가 추가되었습니다.',{view:'document',tab:'documents',projectId:p.id});return row;});
 }
 function reviewCandidates(p,decisions,e){
   const errors={},sources=combinedSources(p),updates=[];
   for(const [id,decision]of Object.entries(decisions)){const c=sources.find(x=>x.id===id);if(!c){errors['candidate_'+id]='후보를 찾을 수 없습니다.';continue;}const action=decision.action||'confirm';if(action==='defer'){updates.push({c,value:c.value,status:'deferred'});continue;}if(action!=='confirm'){errors['review_action_'+id]='확인 또는 보류를 선택해 주세요.';continue;}let chosen=decision.value,selected=null,linkedCandidateId=null;
     if(decision.linkedCandidateId){selected=sources.find(x=>x.id===decision.linkedCandidateId&&x.id!==id&&x.key===c.key);if(!selected){errors['basis_'+id]='같은 항목의 자료를 선택해 주세요.';continue;}linkedCandidateId=selected.id;chosen=selected.value;}
     else if(decision.choice!==undefined){selected=c.choices?.[Number(decision.choice)];if(decision.choice===''||!selected){errors['basis_'+id]='확인할 후보를 선택해 주세요.';continue;}chosen=selected.value;}
     if(chosen==null||text(chosen)===''){errors['candidate_'+id]='자료값을 확인해 주세요.';continue;}if(c.type==='number'){chosen=Number(chosen);if(!Number.isFinite(chosen)||chosen<0){errors['candidate_'+id]='0 이상의 숫자를 입력해 주세요.';continue;}}updates.push({c,value:chosen,selected,linkedCandidateId,status:'reviewed'});
   }
   if(updates.some(x=>x.status==='reviewed'&&!x.linkedCandidateId))Object.assign(errors,evidenceErrors(e||{}));
   if(!updates.length&&!Object.keys(errors).length)errors.evidenceSource='확인할 자료가 없습니다.';
   if(Object.keys(errors).length)fail(errors);
   return A.transaction(()=>{for(const {c,value,selected,linkedCandidateId,status}of updates){const target=live(p.inputDataReviews).find(x=>x.id===(c.reviewId||c.id)),before=target?copy(target):copy(c),row={...c,id:target?.id||A.uid('input-review'),originCandidateId:['legacy','preserved'].includes(c.origin)?c.id:c.originCandidateId,value,status,reviewedAt:stamp(),reviewedBy:p.basic?.manager||'담당자',reviewScope:'source-only'};
     if(status==='reviewed'){const linked=!!linkedCandidateId;Object.assign(row,{source:linked?selected.source:selected?.source&&selected.source!=='현재 입력값'?selected.source:e.source,location:linked?selected.location:e.location,asOf:linked?selected.asOf:e.asOf,path:linked?selected.path:e.path,linkedCandidateId:linkedCandidateId||null});}delete row.reviewId;
     if(target)Object.assign(target,row);else p.inputDataReviews.push(row);p.inputDataReviewHistory.push({id:A.uid('source-review-history'),candidateId:row.id,before,after:copy(row),at:row.reviewedAt});A.audit(status==='deferred'?'DEFER':'REVIEW','inputDataCandidate',row.id,before,row,'',{view:'document',tab:'documents',projectId:p.id});}return updates.length;});
 }
 function openReview(){
   const p=A.current(),pending=combinedSources(p).filter(x=>!['confirmed','reviewed'].includes(x.status));if(!pending.length)return A.toast('미확인 입력자료가 없습니다.');
   const common=p.registrationInput?.evidence||p.initialization?.commonEvidence||{};
   const all=combinedSources(p),inputs=pending.map(c=>{const defer=c.status==='deferred'||text(c.value)===''||c.choices?.length,options=[{value:'value',label:'자료값 직접 확인·보완'},...(c.choices||[]).map((x,i)=>({value:'choice:'+i,label:String(x.value)+' · '+x.source})),...all.filter(x=>x.id!==c.id&&x.key===c.key&&text(x.value)!=='').map(x=>({value:'candidate:'+x.id,label:String(x.value)+' · '+x.source}))];return '<fieldset class="full dp-source-review-row"><legend>'+A.esc(c.label)+'</legend>'+A.field('review_action_'+c.id,'검토 결과',defer?'defer':'confirm','select',[{value:'confirm',label:'확인'},{value:'defer',label:'보류'}])+'<div class="dp-source-review-values" data-review-values="'+A.esc(c.id)+'" '+(defer?'hidden':'')+'>'+A.field('basis_'+c.id,'확인할 자료','value','select',options)+A.field('candidate_'+c.id,'확인할 값',c.value??'',c.type==='number'?'number':'text')+'</div></fieldset>';}).join('');
   A.form('입력자료 함께 검토',inputs+evidenceFields(common),v=>{const decisions={};for(const c of pending){const basis=v['basis_'+c.id]||'value';decisions[c.id]={action:v['review_action_'+c.id]||'defer',...(basis.startsWith('candidate:')?{linkedCandidateId:basis.slice(10)}:basis.startsWith('choice:')?{choice:basis.slice(7)}:{value:v['candidate_'+c.id]})};}return reviewCandidates(p,decisions,evidence(v));},'검토 결과 저장');
 }
 function openCandidate(){
   const p=A.current();A.form('입력자료 추가',A.field('key','대상 항목','name','select',fields.map(([key,label])=>({value:paths[key],label})))+A.field('value','자료값')+evidenceFields(p.registrationInput?.evidence||{}),v=>addCandidate(p,{key:v.key,value:v.value,...evidence(v)}),'자료 추가');
 }
 function renderSources(p){return '<div class="dp-input-sources">'+A.panel('입력자료',sourceTable(p),A.btn('미확인 자료 검토','setup-review-all')+create('입력자료 추가','setup-add'))+'</div>';}
 A.initializers.push(initialize);A.initializationSources=sourceTable;
 A.register('setup',renderSources);
 A.on('project-add',()=>openRegistration());A.on('registration-draft-open',b=>openRegistration(b.dataset.id));
 A.on('registration-draft-save',()=>{const form=document.getElementById('app-form');if(!form)return;const v=A.formEditor?.values?.()||Object.fromEntries(new FormData(form)),row=saveDraft(v,A.ui.registrationDraftId||'');A.ui.registrationDraftId=row.id;A.formEditor?.markSaved?.(row.values);if(A.requestModalClose)A.requestModalClose();else A.closeModal();A.go('portfolio');});
 A.on('registration-draft-delete',b=>{const d=live(A.state.projectRegistrationDrafts).find(x=>x.id===b.dataset.id&&!x.registeredProjectId);if(!d)return;A.confirmDelete('등록 초안',()=>{const before=copy(d);d.deletedAt=stamp();A.audit('DELETE','projectRegistrationDraft',d.id,before,d,'',{view:'portfolio',projectId:''});});});
 A.on('setup-records',()=>A.modal('입력자료',sourceTable(A.current()),A.btn('미확인 자료 검토','setup-review-all')+create('입력자료 추가','setup-add')));
 A.on('setup-review-all',openReview);A.on('setup-review',openReview);A.on('setup-add',openCandidate);
 A.on('project-edit',()=>{const p=A.current();A.form('사업 기본정보',A.field('name','사업명',p.name)+A.field('type','사업유형',p.type)+A.field('location','소재지',p.location)+A.field('manager','담당자',p.basic.manager)+A.field('operator','시행 법인',p.basic.operator)+A.field('method','사업방식',p.basic.method)+A.field('above','지상층수',p.building.floorsAbove,'number')+A.field('below','지하층수',p.building.floorsBelow,'number'),v=>{const result=validateBasic(v,{partial:true});if(!result.valid)fail(result.errors);v=result.normalized;const before={name:p.name,type:p.type,location:p.location,basic:copy(p.basic),building:copy(p.building)};Object.assign(p,{name:text(v.name),type:v.type,location:v.location});if(p.entityId&&A.renameEntity&&v.operator!==p.basic.operator)A.renameEntity(p,v.operator);Object.assign(p.basic,{manager:v.manager,operator:v.operator,method:v.method});Object.assign(p.building,{floorsAbove:Number(v.above),floorsBelow:Number(v.below)});const impacts=A.legal?.refreshProjectImpacts?.(A.state);for(const change of impacts?.changes||[])A.audit('RECLASSIFY','projectLawImpact',change.id,change.before,change.after,'',{view:'law',tab:'recent',projectId:p.id});A.audit('UPDATE','project',p.id,before,{name:p.name,type:p.type,location:p.location,basic:p.basic,building:p.building},p.id+' 사업개요 변경',{view:'overview'});});});
 document.addEventListener('change',e=>{const name=e.target.name||'';if(name.startsWith('review_action_')){const id=name.slice(14),row=[...document.querySelectorAll('[data-review-values]')].find(x=>x.dataset.reviewValues===id);if(row)row.hidden=e.target.value!=='confirm';}});
 A.projectRegistration={fields,validate,validateBasic,draftAdapter,register:registerProject,finishRegistration,saveDraft,renderDrafts,formFields,initialize,addCandidate,reviewCandidates,combinedSources,sourceTable};
 A.spec.featureContracts.initialization={flow:['프로젝트 등록 단일폼','7개 기본값·공통 자료근거 확인','등록 확정','개요에서 일반 업무'],required:fields.map(([key])=>key),draft:'projectRegistrationDrafts 별도 보관. 초안을 운영 프로젝트 목록·보고값에 합산하지 않음',legacy:'기존 초기후보·상태·근거를 임의확정하지 않음. 누락 필드 상태만 분리',sourceReview:'입력자료의 후속 후보 검토는 inputDataReviews/inputDataReviewHistory에 저장. 완료상태 재개나 현재값 자동덮어쓰기 없음',legal:'개발업 등록대상 최종판정은 별도 업무. 프로젝트 최초등록에 법정서류 전체확정 강제하지 않음',actualAi:false};
 A.spec.dataContracts=A.spec.dataContracts||{};A.spec.dataContracts.projectRegistration={draft:'state.projectRegistrationDrafts: id,values,savedAt,status,registeredProjectId,registeredAt,deletedAt. 프로젝트와 분리하며 삭제는 감사이력 있는 soft delete',confirmed:'project.registrationInput: status,confirmedAt,confirmedBy,evidence{source,location,asOf,path},missingKeys. 프로젝트 주소와 자료 위치를 별도 필드로 보관',sourceReview:'project.inputDataReviews/inputDataReviewHistory. 기존 initialization.candidates 원문은 수정하지 않고 확인결과 overlay를 보관. 후보 확인은 실제 사업정보 수정과 별개',failure:'필드별 오류는 A.inputError 계약. 등록+법인연결+초안완료+감사이력을 같은 트랜잭션으로 저장. 외부 폼 트랜잭션 성공 확인 전에는 개요로 이동하지 않음'};
 A.spec.requirements=A.spec.requirements||[];A.spec.requirements.push({id:'INIT-105',decision:'단일 프로젝트 등록과 독립 입력자료 검토. 공통근거 1회, 필드별 오류, 실패초안 보존, 기존 사용자 업무강제 gate 없음'},{id:'INIT-106',decision:'초기화 모듈 순서와 무관하게 기존 기본정보를 preservedInputCandidates에 미확인 원문으로 보존. 항목별 확인/보류/직접보완/동일항목 후보연결은 별도 overlay와 이력에 저장. 실제 기본정보 자동 변경 금지. 등록 초안 adapter는 공통 폼의 미저장 보호를 사용'});
 A.spec.dataContracts.projectRegistration.preserved='preservedInputCandidates: 초기자료 후보에 없는 7개 기본값의 최초 보존본. initialization 원문·상태 불변, 반복 초기화 시 중복 없음';
 A.spec.dataContracts.projectRegistration.reviewDecision='inputDataReviews: status reviewed/deferred, linkedCandidateId, originCandidateId. 확인만 값·공통근거 검증하며 보류는 빈값을 그대로 보존. 확인도 실제 프로젝트값 자동변경 없음';
})(App);
