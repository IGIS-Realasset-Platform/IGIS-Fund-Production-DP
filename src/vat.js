(function(A){
  'use strict';
  const E=A.esc,F=A.field,copy=A.clone,blank=v=>v===null||v===undefined||String(v).trim()==='',text=v=>String(v??'').trim();
  const types=[['unknown','미확인'],['taxable','과세'],['exempt','면세'],['outOfScope','과세 대상 외']];
  const assets=[['unknown','미확인'],['building','건물'],['land','토지'],['common','건물·토지 공통'],['other','기타']];
  const deductions=[['unknown','미확정'],['deductible','공제'],['nondeductible','불공제'],['common','안분 검토'],['none','세액 없음']];
  const presets=[['building','공제 · 건물분',{transactionType:'taxable',attribution:'building',deduction:'deductible'}],['other','공제 · 기타',{transactionType:'taxable',attribution:'other',deduction:'deductible'}],['land','불공제 · 토지분',{transactionType:'taxable',attribution:'land',deduction:'nondeductible'}],['non','불공제 · 기타',{transactionType:'taxable',attribution:'other',deduction:'nondeductible'}],['common','공통 · 건물+토지',{transactionType:'taxable',attribution:'common',deduction:'common'}],['none','세액 없음',{transactionType:'unknown',deduction:'none',vat:0}],['unknown','미확정',{transactionType:'unknown',attribution:'unknown',deduction:'unknown'}]];
  const selectOptions=rows=>rows.map(([value,label])=>({value,label}));
  const sources={law26:'https://www.law.go.kr/LSW//lsSideInfoP.do?docCls=jo&joBrNo=00&joNo=0026&lsiSeq=276117&urlMode=lsScJoRltInfoR',law39:'https://www.law.go.kr/법령/부가가치세법/제39조',law40:'https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1031657199',decree81:'https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1032154831',decree82:'https://law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lsJoLnkSeq=1032157565',decree80:{url:'https://law.go.kr/lsLinkCommonInfo.do?lspttninfSeq=112601',verification:'2026-09-21 공식 제80조 제목·본문 열람',effectiveDate:'2026-04-01',enabled:true}};
  const dates=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')&&Number.isFinite(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
  function calculate(record={}){
    const errors=[],numeric=(v,label)=>{if(blank(v))return null;const n=Number(v);if(!Number.isSafeInteger(n)||n<0){errors.push(label+'은 0 이상의 원 단위 정수로 입력해 주세요.');return null;}return n;};
    const net=numeric(record.net,'공급가액'),vat=numeric(record.vat,'부가세'),enteredGross=numeric(record.gross,'거래총액');
    const gross=enteredGross??(net!==null&&vat!==null?net+vat:null),mode=record.mode||'budget',transactionType=record.transactionType||'unknown',attribution=record.attribution||'unknown',deduction=record.deduction||'unknown',reviewStatus=record.reviewStatus||'draft';
    if(!['budget','evidence'].includes(mode))errors.push('예산 가정 또는 증빙·정산을 선택해 주세요.');
    if(!types.some(x=>x[0]===transactionType)||!assets.some(x=>x[0]===attribution)||!deductions.some(x=>x[0]===deduction))errors.push('부가세 검토 항목을 확인해 주세요.');
    if(!['draft','reviewed','settled'].includes(reviewStatus))errors.push('검토 상태를 확인해 주세요.');
    if(mode==='budget'&&reviewStatus==='settled')errors.push('예산 가정을 신고정산 완료로 저장할 수 없습니다.');
    if(net!==null&&vat!==null&&gross!==null&&net+vat!==gross)errors.push('공급가액과 부가세 합계를 거래총액과 맞춰 주세요.');
    if(gross!==null&&!Number.isSafeInteger(gross))errors.push('거래총액이 안전하게 처리할 수 있는 원 단위 범위를 초과합니다.');
    if(vat!==null&&gross!==null&&vat>gross)errors.push('부가세가 거래총액을 초과합니다.');
    if(['exempt','outOfScope'].includes(transactionType)&&vat!==null&&vat!==0)errors.push('면세·대상 외 거래에는 부가세를 함께 확정할 수 없습니다.');
    if(deduction==='none'&&vat!==null&&vat!==0)errors.push('세액 없음은 부가세 0원을 확인한 경우에만 선택해 주세요.');
    const a=record.apportionment||{},hasRatio=!blank(a.numerator)||!blank(a.denominator),num=blank(a.numerator)?null:Number(a.numerator),den=blank(a.denominator)?null:Number(a.denominator);
    if(hasRatio&&(!Number.isFinite(num)||!Number.isFinite(den)||num<0||den<=0||num>den))errors.push('안분 분자·분모는 0 ≤ 분자 ≤ 분모, 분모 > 0이어야 합니다.');
    const baseKnown=!!text(a.basis)&&!!text(a.sourcePath)&&num!==null&&den!==null&&den>0&&num>=0&&num<=den;
    const metadata=!!text(record.sourcePath)&&!!text(record.reviewer)&&!!text(record.taxpayer)&&!!text(record.period);
    if(reviewStatus!=='draft'){
      if(!metadata)errors.push('검토 완료에는 근거 경로·담당자·증빙 수취 주체·과세기간을 입력해 주세요.');
      if(transactionType==='unknown'||deduction==='unknown'||vat===null||net===null||gross===null)errors.push('거래유형과 금액·공제 구분을 확인해 주세요.');
      if(deduction==='common'&&!baseKnown)errors.push('안분 기준·분자·분모·근거 경로를 입력해 주세요.');
      if(record.mode==='evidence'&&record.asOf>A.today)errors.push('미래 날짜의 세무검토를 완료할 수 없습니다.');
    }
    const canClassify=mode==='budget'?metadata:reviewStatus!=='draft'&&metadata;
    let deductible=null,nonDeductible=null,pending=vat,ratio=null;
    if(vat===0){deductible=0;nonDeductible=0;pending=0;}
    else if(vat!==null&&canClassify){
      if(deduction==='deductible'){deductible=vat;nonDeductible=0;pending=0;}
      if(deduction==='nondeductible'){deductible=0;nonDeductible=vat;pending=0;}
      if(deduction==='common'&&baseKnown){ratio=num/den;nonDeductible=Math.round(vat*ratio);deductible=vat-nonDeductible;pending=0;}
    }
    const taxConfirmed=mode==='evidence'&&reviewStatus!=='draft'&&pending===0&&!errors.length;
    const costAmount=net!==null&&nonDeductible!==null&&!errors.length?net+nonDeductible:null;
    return {net,vat,gross,deductible,nonDeductible,pending,costAmount,ratio,errors,valid:!errors.length,isEstimate:mode==='budget',taxConfirmed,arithmeticConfirmed:net!==null&&vat!==null&&gross!==null&&Number.isSafeInteger(gross)&&net+vat===gross,status:errors.length?'입력 오류':taxConfirmed?(reviewStatus==='settled'?'신고정산 완료':'세무검토 완료'):mode==='budget'&&costAmount!==null?'예산 가정':vat===0?'세액 없음':'세무 미확정'};
  }
  function sourceOf(p,kind,id){
    if(kind==='cost'){const n=(p.cbs||[]).find(x=>x.id===id);return n?{name:n.name,value:typeof A.amount==='function'?A.amount(p,id):n.current??null,record:n}:null;}
    if(kind==='contract'){const c=(p.contracts||[]).find(x=>x.id===id&&!x.deletedAt);if(!c)return null;const r=c.revisions?.at(-1)||c;return {name:c.name,value:r.total??c.amount??null,record:r,contract:c};}
    return null;
  }
  function sourceArg(source,id){return typeof source==='string'?{kind:source,id}:source;}
  function records(p,source){return (p.vatRecords||[]).filter(x=>x.kind===source.kind&&x.sourceId===source.id&&x.mode===(source.mode||(source.kind==='cost'?'budget':'evidence'))&&(!source.asOf||x.asOf<=source.asOf));}
  function latest(p,source){return records(p,source).slice().sort((a,b)=>a.asOf.localeCompare(b.asOf)||a.version-b.version).at(-1)||null;}
  function summaryFor(p,arg,id){
    const s=sourceArg(arg,id),original=sourceOf(p,s.kind,s.id),record=latest(p,s),legacy=original?.record||{};
    const input=record||{mode:s.mode||(s.kind==='cost'?'budget':'evidence'),net:s.kind==='contract'?legacy.net??null:null,vat:s.kind==='contract'?legacy.vat??null:null,gross:s.kind==='contract'?original?.value??null:null};
    const application=record?(p.vatApplications||[]).filter(x=>x.vatRecordId===record.id).at(-1):null;
    const result=calculate(input),sourceDrift=!!record&&(application?.value??record.sourceSnapshot?.value)!==original?.value;
    return {...result,record,source:original?{name:original.name,value:original.value}:null,sourceDrift,amountBasis:record?.amountBasis||'unknown',confirmedCostAmount:result.taxConfirmed?result.costAmount:null,estimatedCostAmount:result.isEstimate?result.costAmount:null,status:sourceDrift?'원천 금액 변경':result.status};
  }
  function sourceOnly(p,rows){return rows.filter(row=>!rows.some(child=>{if(child.id===row.id)return false;let n=child,seen=new Set();while(n?.parentId){if(n.parentId===row.id)return true;if(seen.has(n.id))return false;seen.add(n.id);n=(p.cbs||[]).find(x=>x.id===n.parentId);}return false;}));}
  function initialize(state){for(const p of state.projects){p.vatRecords=p.vatRecords||[];p.vatReconciliations=p.vatReconciliations||[];if(!p.vatLegacyAggregate){const rows=sourceOnly(p,(p.cbs||[]).filter(x=>!x.deletedAt&&!x.managementAdjustment&&(x.code==='7005'||/불공제.*(VAT|부가)/i.test(x.name||''))));if(rows.length)p.vatLegacyAggregate={amount:rows.some(x=>A.amount?.(p,x.id)==null)?null:rows.reduce((n,x)=>n+(A.amount?.(p,x.id)??0),0),sourceIds:rows.map(x=>x.id),label:'기존 불공제 VAT',capturedAt:A.today,sourcePath:'기존 원자료',captureVersion:2,original:copy(rows)};}else{const found=(p.cbs||[]).filter(x=>p.vatLegacyAggregate.sourceIds?.includes(x.id));if(sourceOnly(p,found).length<found.length)p.vatLegacyAggregate.captureNeedsReview=true;}}}
  A.initializers.push(initialize);
  function save(p,source,input){return A.transaction(()=>{
    const s=sourceArg(source),origin=sourceOf(p,s.kind,s.id);if(!origin)throw Error('부가세를 기록할 원가항목·계약을 찾을 수 없습니다.');
    const mode=input.mode||(s.kind==='cost'?'budget':'evidence'),asOf=input.asOf||A.today;if(!dates(asOf))throw Error('기준일을 정확히 입력해 주세요.');
    const prior=latest(p,{...s,mode}),candidate={...copy(input),mode,asOf,transactionType:input.transactionType||'unknown',attribution:input.attribution||'unknown',deduction:input.deduction||'unknown',reviewStatus:input.reviewStatus||'draft',amountBasis:input.amountBasis||'unknown'};
    const result=calculate(candidate);if(result.errors.length)throw Error(result.errors.join(' '));
    const version=(p.vatRecords||[]).filter(x=>x.kind===s.kind&&x.sourceId===s.id&&x.mode===mode).reduce((n,x)=>Math.max(n,x.version||0),0)+1;
    const row={...candidate,net:result.net,vat:result.vat,gross:result.gross,id:A.uid('vat'),kind:s.kind,sourceId:s.id,version,supersedesId:prior?.id||null,sourceSnapshot:{name:origin.name,value:origin.value},createdAt:new Date().toISOString(),calculation:copy(result)};
    p.vatRecords=p.vatRecords||[];p.vatRecords.push(row);
    if(input.applyToCost===true||input.applyToCost==='yes')applyStored(p,s,row);
    A.audit('CREATE','vatRecord',row.id,prior,row,`${p.id} ${origin.name} 부가세 ${mode==='budget'?'예산 가정':'검토 기록'}이 저장되었습니다`,{view:s.kind==='cost'?'cost':'document',tab:s.kind==='cost'?'detail':'contracts',projectId:p.id,id:s.id});
    return row;
  });}
  function applyStored(p,source,row){
    if(source.kind!=='cost'||row.mode!=='budget')throw Error('현재 원가 반영은 원가항목의 예산 기록에서만 가능합니다.');
    if(!['net','gross','cost'].includes(row.amountBasis))throw Error('원천 금액의 부가세 포함 기준을 먼저 확인해 주세요.');
    const c=calculate(row);if(c.errors.length||c.costAmount===null)throw Error('금액·근거·안분을 확인한 뒤 원가에 반영해 주세요.');
    const reconciliationInfo=reconciliation(p);
    if(reconciliationInfo.blocked)throw Error('기존 불공제 VAT를 먼저 연결·대사해 주세요. 부가세만 저장한 뒤 기존 기록을 반영할 수 있습니다.');
    if(typeof A.domain?.saveCost!=='function')throw Error('원가 저장 기능을 사용할 수 없습니다.');
    const prior=(p.vatApplications||[]).filter(x=>x.sourceId===source.id).at(-1),legacyReclassified=(reconciliationInfo.record?.allocations||[]).filter(x=>x.vatRecordId===row.id).reduce((n,x)=>n+x.amount,0),legacyMovement=legacyReclassified-(prior?.legacyReclassified||0);
    const expectedSource=prior?.vatRecordId===row.id?prior.value:row.sourceSnapshot?.value;
    if(A.amount(p,source.id)!==expectedSource)throw Error('부가세 기록 이후 원가가 변경되었습니다. 현재 금액으로 부가세 기록을 정정한 뒤 반영해 주세요.');
    let poolOwnerId=prior?.poolOwnerId||null,previousPoolValue=null,poolValue=null;
    if(legacyMovement!==0){
      const owners=[...new Set((p.vatLegacyAggregate?.sourceIds||[]).map(id=>A.managementOwner?.(p,id)?.id).filter(Boolean))];
      if(owners.length!==1)throw Error('기존 불공제액의 관리항목이 하나로 확인되지 않습니다. 배부 원천을 먼저 정리해 주세요.');
      poolOwnerId=owners[0];if(poolOwnerId===source.id)throw Error('기존 불공제액 관리항목 자체에는 부가세를 다시 반영할 수 없습니다.');
      previousPoolValue=A.amount(p,poolOwnerId);if(previousPoolValue==null||previousPoolValue-legacyMovement<0)throw Error('기존 불공제액 관리잔액이 부족하거나 미확정입니다.');
      poolValue=previousPoolValue-legacyMovement;
      if(typeof A.domain.saveCostReclassificationTotal!=='function')throw Error('부가세 귀속 이동 기능을 사용할 수 없습니다.');
      const sourceIds=(p.vatLegacyAggregate?.sourceIds||[]).filter(id=>A.managementOwner?.(p,id)?.id===poolOwnerId);
      A.domain.saveCostReclassificationTotal(p,poolOwnerId,poolValue,{key:'vat-pool',name:'불공제 VAT 재분류 조정',sourceIds});
    }
    const previousValue=A.amount(p,source.id);
    if(prior?.vatRecordId===row.id&&previousValue===c.costAmount&&legacyMovement===0)return prior;
    A.domain.saveCost(p,source.id,c.costAmount);
    const application={id:A.uid('vat-application'),vatRecordId:row.id,sourceId:source.id,previousValue,value:c.costAmount,poolOwnerId,previousPoolValue,poolValue,legacyReclassified,legacyMovement,at:new Date().toISOString()};p.vatApplications=p.vatApplications||[];p.vatApplications.push(application);
    A.audit('CREATE','vatCostApplication',application.id,null,application,`${p.id} 부가세 검토금액이 현재 사업비에 반영되었습니다`,{view:'cost',tab:'detail',projectId:p.id,id:source.id});return application;
  }
  function applyToCost(p,source,recordId){return A.transaction(()=>{const row=(p.vatRecords||[]).find(x=>x.id===recordId&&x.kind===source.kind&&x.sourceId===source.id&&x.mode==='budget');if(!row)throw Error('반영할 부가세 예산 기록을 찾을 수 없습니다.');if(latest(p,{...source,mode:'budget'})?.id!==row.id)throw Error('최신 부가세 예산 기록을 선택해 주세요.');return applyStored(p,source,row);});}
  function reconciliation(p){
    const legacy=p.vatLegacyAggregate,items=[];for(const id of new Set((p.vatRecords||[]).filter(x=>x.kind==='cost'&&x.mode==='budget').map(x=>x.sourceId))){if(legacy?.sourceIds?.includes(id))continue;const r=latest(p,{kind:'cost',id,mode:'budget'}),v=calculate(r);if(v.nonDeductible!==null)items.push({vatRecordId:r.id,sourceId:id,name:r.sourceSnapshot?.name,amount:v.nonDeductible});}
    const itemTotal=items.reduce((n,x)=>n+x.amount,0),prior=p.vatReconciliations?.at(-1),currentIds=new Set(items.map(x=>x.vatRecordId)),stale=!!prior&&((prior.allocations||[]).some(x=>!currentIds.has(x.vatRecordId))||prior.legacyAmount!==legacy?.amount);
    const linked=!stale&&prior?prior.allocations.reduce((n,x)=>n+x.amount,0):0,hasLegacy=!!legacy&&(legacy.amount===null||legacy.amount>0),blocked=!!legacy?.captureNeedsReview||hasLegacy&&(!prior||stale);
    return {legacyAmount:legacy?.amount??(legacy?null:0),items,itemTotal,allocated:blocked?null:linked,remainingUnmatched:legacy?.amount==null?null:legacy.amount-linked,additionalToLegacy:blocked?null:Math.max(0,itemTotal-linked),totalNonDeductible:blocked?null:(legacy?.amount||0)+Math.max(0,itemTotal-linked),blocked,stale,status:blocked?(stale?'대사 원천 변경':'기존 불공제액 대사 필요'):'대사 확인',record:prior||null};
  }
  function saveReconciliation(p,input){return A.transaction(()=>{
    const info=reconciliation(p);if(info.legacyAmount===null)throw Error('기존 불공제 VAT 총액을 먼저 확인해 주세요.');if(!text(input.sourcePath)||!text(input.reviewer))throw Error('대사 근거와 담당자를 입력해 주세요.');
    const seen=new Set(),allocations=(input.allocations||[]).map(x=>{const item=info.items.find(y=>y.vatRecordId===x.vatRecordId),amount=Number(x.amount);if(!item||seen.has(x.vatRecordId)||!Number.isSafeInteger(amount)||amount<0||amount>item.amount)throw Error('연결할 항목별 부가세와 배부금액을 확인해 주세요.');seen.add(x.vatRecordId);return {vatRecordId:x.vatRecordId,sourceId:item.sourceId,amount};});
    if(allocations.reduce((n,x)=>n+x.amount,0)>info.legacyAmount)throw Error('연결한 불공제액이 기존 총액을 초과합니다.');
    const row={id:A.uid('vat-reconciliation'),legacyAmount:info.legacyAmount,allocations,reviewer:text(input.reviewer),sourcePath:text(input.sourcePath),note:text(input.note),at:new Date().toISOString()};p.vatReconciliations=p.vatReconciliations||[];p.vatReconciliations.push(row);A.audit('CREATE','vatReconciliation',row.id,info.record,row,`${p.id} 기존 불공제 VAT 연결이 저장되었습니다`,{view:'cost',tab:'detail',projectId:p.id});return row;
  });}
  const money=v=>v==null?'—':A.money(v),label=(list,key)=>list.find(x=>x[0]===key)?.[1]||'미확인';
  function preview(r){const c=calculate(r);return `<div class="vat-preview" aria-live="polite"><span>거래총액 <b>${E(money(c.gross))}</b></span><span>사업비 반영${c.isEstimate?' 예상':''} <b>${E(money(c.costAmount))}</b></span><span>공제${c.isEstimate?' 예상':''} <b>${E(money(c.deductible))}</b></span><span>불공제${c.isEstimate?' 예상':''} <b>${E(money(c.nonDeductible))}</b></span><span>미확정 세액 <b>${E(money(c.pending))}</b></span><span>${E(c.status)}</span></div>`;}
  function formInput(v){return {...v,apportionment:{basis:v.basis||'',numerator:v.numerator,denominator:v.denominator,unit:v.basisUnit||'',sourcePath:v.basisSourcePath||''}};}
  function editorBasis(p,source,mode){const origin=sourceOf(p,source.kind,source.id);return !origin||origin.record?.deletedAt?null:JSON.stringify({name:origin.name,value:origin.value,record:origin.record,prior:latest(p,{...source,mode})});}
  function reconciliationBasis(p){const r=reconciliation(p);return JSON.stringify({legacy:p.vatLegacyAggregate||null,items:r.items,record:r.record});}
  let activeEditor=null;
  function openEditor(p,source,options={},basis=null){
    const origin=sourceOf(p,source.kind,source.id);if(!origin)throw Error('원천을 찾을 수 없습니다.');const mode=source.mode||(source.kind==='cost'?'budget':'evidence'),summary=summaryFor(p,{...source,mode}),r=summary.record||{mode,asOf:A.today,net:summary.net,vat:summary.vat,gross:summary.gross,transactionType:'unknown',attribution:'unknown',deduction:'unknown',reviewStatus:'draft'},a=r.apportionment||{};
    const openedBasis=basis||{budget:editorBasis(p,source,'budget'),evidence:editorBasis(p,source,'evidence'),reconciliation:reconciliationBasis(p)};
    const fields=`<div class="full vat-editor" data-vat-editor="true"><div class="vat-source-line">${E(origin.name)} · 원천 금액 ${E(money(origin.value))}</div><div class="vat-presets" aria-label="부가세 빠른 선택">${presets.map(([key,title])=>A.btn(title,'vat-preset',{preset:key},'small')).join('')}</div></div>`+
      F('mode','기록 구분',mode,'select',selectOptions([['budget','예산 가정'],['evidence','증빙·정산']]))+F('asOf','기준일',r.asOf||A.today,'date')+
      F('net','공급가액 (원)',r.net??'','number')+F('vat','부가세 (원)',r.vat??'','number')+F('gross','거래총액 (원)',r.gross??'','number')+F('amountBasis','기존 원가 금액 기준',r.amountBasis||'unknown','select',selectOptions([['unknown','미확인'],['net','부가세 제외'],['gross','부가세 포함'],['cost','불공제 부가세 포함']]))+
      F('transactionType','거래 부가세 유형',r.transactionType||'unknown','select',selectOptions(types))+F('attribution','원가 귀속',r.attribution||'unknown','select',selectOptions(assets))+F('deduction','공제 검토',r.deduction||'unknown','select',selectOptions(deductions))+F('reviewStatus','검토 상태',r.reviewStatus||'draft','select',selectOptions([['draft','작성 중'],['reviewed',mode==='budget'?'가정 검토 완료':'세무검토 완료'],['settled','신고정산 완료']]))+
      `<div class="full vat-apportionment" ${r.deduction==='common'?'':'hidden'}><h3>안분 기준</h3><div class="form-grid">`+F('basis','담당자가 확인한 안분 기준',a.basis)+F('numerator','면세·불공제 대상 분자',a.numerator??'','number')+F('denominator','전체 대상 분모',a.denominator??'','number')+F('basisUnit','기준 단위',a.unit)+F('basisSourcePath','안분 근거 경로',a.sourcePath)+`</div></div>`+
      F('taxpayer','증빙 수취 주체',r.taxpayer)+F('period','해당 과세기간',r.period)+F('reviewer','검토 담당자',r.reviewer)+F('sourcePath','계약·증빙 또는 가정 근거',r.sourcePath)+F('reason','불공제·안분 사유',r.reason||'','textarea')+
      `<div class="full" data-vat-preview>${preview(r)}</div>`+(source.kind==='cost'?F('applyToCost','원가표 금액 반영','no','select',selectOptions([['no','부가세 기록만 저장'],['yes','불공제액을 포함한 사업비로 반영']]))+`<div class="full vat-links">${A.btn('기존 불공제액 연결','vat-reconcile',{},'text')}${summary.record?A.btn('저장된 기록 원가반영','vat-apply',{kind:source.kind,id:source.id,record:summary.record.id},'text'):''}</div>`:'')+`<div class="full vat-source-links">${[['법 제26조',sources.law26],['법 제39조',sources.law39],['법 제40조',sources.law40],['시행령 제80조',sources.decree80.url],['시행령 제81조',sources.decree81],['시행령 제82조',sources.decree82]].map(([title,url])=>`<a href="${E(url)}" target="_blank" rel="noopener noreferrer">${E(title)}</a>`).join('')}</div>`;
    const session=A.form(origin.name+' · 금액·부가세',fields,v=>{const owner=A.state.projects.find(x=>x.id===p.id&&!x.deletedAt),mode=v.mode||source.mode||(source.kind==='cost'?'budget':'evidence');if(!owner||A.current()?.id!==p.id||!openedBasis[mode]||editorBasis(owner,source,mode)!==openedBasis[mode]||(v.applyToCost==='yes'||v.applyToCost===true)&&reconciliationBasis(owner)!==openedBasis.reconciliation)throw A.inputError({sourcePath:'원천 또는 부가세 검토 기준이 변경되었거나 삭제되어 저장하지 않았습니다. 입력값을 확인한 후 다시 열어 주세요.'});return save(owner,source,formInput(v));},'금액·부가세 저장',options);
    activeEditor={projectId:p.id,source:{...source},options,session,basis:openedBasis,title:origin.name+' · 금액·부가세'};
  }
  function livePreview(){const f=document.getElementById('app-form');if(!f?.querySelector('[data-vat-editor]'))return;const v=formInput(Object.fromEntries(new FormData(f))),box=f.querySelector('[data-vat-preview]'),area=f.querySelector('.vat-apportionment');if(box)box.innerHTML=preview(v);if(area)area.hidden=v.deduction!=='common';}
  A.on('vat-preset',b=>{const preset=presets.find(x=>x[0]===b.dataset.preset);const f=document.getElementById('app-form');if(!preset||!f?.querySelector('[data-vat-editor]'))return;for(const [key,value]of Object.entries(preset[2])){const node=f.querySelector(`[name="${key}"]`);if(node)node.value=value;}const state=f.querySelector('[name="reviewStatus"]');if(state)state.value='draft';livePreview();});
  document.addEventListener('input',e=>{if(e.target.closest?.('#app-form'))livePreview();});document.addEventListener('change',e=>{const f=e.target.closest?.('#app-form');if(!f)return;if(e.target.name==='mode'&&f.querySelector('[data-vat-editor]')){const state=f.querySelector('[name="reviewStatus"]');if(state){state.value='draft';const option=state.querySelector('option[value="reviewed"]');if(option)option.textContent=e.target.value==='budget'?'가정 검토 완료':'세무검토 완료';}}livePreview();});
  A.on('vat-open',b=>{const p=A.current(),source={kind:b.dataset.kind||'cost',id:b.dataset.id,mode:b.dataset.mode},scroll=document.getElementById('app-dialog')?.querySelector?.('.dialog-body')?.scrollTop||0,options=b.dataset.historyParent==='config'&&(!b.dataset.projectId||b.dataset.projectId===p.id)?A.formParentOptions(()=>{const owner=A.state.projects.find(x=>x.id===p.id&&!x.deletedAt);if(!owner||A.current()?.id!==owner.id||!owner.cbs.some(x=>x.id===source.id&&!x.deletedAt))return A.closeModal();A.openCostItemInfo(source.id,p.id);queueMicrotask(()=>{const body=document.getElementById('app-dialog')?.querySelector?.('.dialog-body');if(body)body.scrollTop=scroll;});}):{};openEditor(p,source,options);});
  A.on('vat-apply',b=>{const p=A.current(),source={kind:b.dataset.kind||'cost',id:b.dataset.id},r=(p.vatRecords||[]).find(x=>x.id===b.dataset.record);if(!r)return;const value=calculate(r).costAmount;A.form('저장된 부가세 기록 원가반영',`<div class="full">${E(r.sourceSnapshot?.name)} · 현재 ${E(money(A.amount(p,source.id)))} → 반영 ${E(money(value))}</div>`,()=>applyToCost(p,source,r.id),'원가 반영');});
  A.on('vat-history',b=>{const p=A.current(),s={kind:b.dataset.kind||'cost',id:b.dataset.id},origin=sourceOf(p,s.kind,s.id),rows=(p.vatRecords||[]).filter(x=>x.kind===s.kind&&x.sourceId===s.id).slice().reverse();A.modal((origin?.name||'항목')+' · 부가세 이력',A.table(['구분','기준일','버전','거래총액','불공제액','상태','담당자','근거'],rows.map(r=>{const c=calculate(r);return[r.mode==='budget'?'예산 가정':'증빙·정산',E(r.asOf),String(r.version),money(c.gross),money(c.nonDeductible),E(c.status),E(r.reviewer||'—'),r.sourcePath?A.btn('경로 복사','path-copy',{path:r.sourcePath},'text'):'—'];})));});
  A.on('vat-reconcile',()=>{let ownedSave=null;const p=A.current(),r=reconciliation(p),openedBasis=reconciliationBasis(p),snapshot=A.formEditor?.snapshot?.(),parent=document.getElementById('app-dialog')?.open&&activeEditor?.projectId===p.id&&snapshot?.title===activeEditor.title?activeEditor:null,scroll=document.getElementById('app-dialog')?.querySelector?.('.dialog-body')?.scrollTop||0,options=parent?{returnTo:()=>{const owner=A.state.projects.find(x=>x.id===parent.projectId&&!x.deletedAt),origin=owner&&sourceOf(owner,parent.source.kind,parent.source.id);if(!owner||A.current()?.id!==owner.id||!origin||origin.record?.deletedAt)return A.closeModal();const basis=ownedSave&&owner.vatReconciliations?.at(-1)?.id===ownedSave.id&&reconciliationBasis(owner)===ownedSave.basis?{...parent.basis,reconciliation:ownedSave.basis}:parent.basis;openEditor(owner,parent.source,parent.options,basis);activeEditor.session.returnFocusIdentity=copy(parent.session.returnFocusIdentity);A.formEditor.markSaved(snapshot.baseline);A.formEditor.setValues(snapshot.values);queueMicrotask(()=>{const body=document.getElementById('app-dialog')?.querySelector?.('.dialog-body');if(body)body.scrollTop=scroll;});}}:{};A.form('기존 불공제 VAT 연결',`<div class="full">기존 총액 ${E(money(r.legacyAmount))} · 항목별 확인액 ${E(money(r.itemTotal))}</div>`+r.items.map((x,i)=>F('allocation'+i,x.name+' · 기존 총액에 포함된 금액 (원)',r.record?.allocations?.find(a=>a.vatRecordId===x.vatRecordId)?.amount??'','number')).join('')+F('reviewer','대사 담당자')+F('sourcePath','대사 근거 경로')+F('note','대사 내용','','textarea'),v=>{const owner=A.state.projects.find(x=>x.id===p.id&&!x.deletedAt);if(!owner||A.current()?.id!==p.id||reconciliationBasis(owner)!==openedBasis)throw A.inputError({sourcePath:'대사 기준 또는 사업 정보가 변경되었거나 삭제되어 저장하지 않았습니다. 입력값을 확인한 후 다시 열어 주세요.'});const saved=saveReconciliation(owner,{...v,allocations:r.items.flatMap((x,i)=>blank(v['allocation'+i])?[]:[{vatRecordId:x.vatRecordId,amount:Number(v['allocation'+i])}])});ownedSave={id:saved.id,basis:reconciliationBasis(owner)};return saved;},'연결 저장',{...options,draftContext:'vat-reconcile:'+p.id+':'+(parent?parent.source.kind+':'+parent.source.id:'direct')});});
  A.vat={calculate,summaryFor,openEditor,save,applyToCost,initialize,reconciliation,saveReconciliation,latest,sources,presets,sourceOf};
  A.spec.featureContracts.vat={version:'0.10.3',source:'p.vatRecords append-only, kind/sourceId/mode/version',axes:'거래 VAT유형 / 원가귀속 / 공제판단 독립. 5개 빠른선택+세액없음+미확정.',states:'금액대사와 세무검토 별도. budget가정은 evidence확정으로 자동승격 불가.',apportionment:'담당자·증빙주체·과세기간·근거와 확인한 분자/분모만 사용. 토지귀속비율/GFA 자동안분 금지.',cash:'지급·회차·환급·상계는 별도 원천이며 VAT편집으로 생성/차감하지 않음.',legacy:'기존7005 총액은 원형보존. p.vatReconciliations에서 항목별포함분 연결후 단일VAT합계. 대사전 추가합산 차단.',sources,verification:'순수계산·저장회귀와 실제화면/세무원문링크/신고검증 분리'};
  A.spec.requirements.push({id:'VAT-0103',name:'거래별 부가세 검토·가정·정산 분리',criteria:['면세거래와 불공제매입세액 구별','건물/토지귀속과 과세/면세안분 구별','예산과 증빙 별도버전','미확정 null','환급입금자동생성금지','기존7005 중복합산차단','저장실패rollback','과거원천보존']});
  A.spec.featureContracts.vat.costApplication='명시적 applyToCost 선택만 VAT버전+현재말단원가+감사 원자저장. 원천VAT금액기준 unknown/계산미확정/7005대사전 차단. legacy대사후 기존버전 applyToCost 가능. 기존VAT는 전용 saveCostReclassificationTotal의 명시 귀속이동 leaf로 원본7005를 보존하며 일반 부모편집·자동조정과 분리. 다중pool·부족잔액·미확정 차단. p.vatApplications 연결·중복실행방지. 지급/환급 불변.';
})(App);
