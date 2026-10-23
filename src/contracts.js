(function (A) {
  'use strict';
  const clone = x => JSON.parse(JSON.stringify(x));
  const sum = (xs, key) => xs.reduce((n, x) => n + Number(x[key] || 0), 0);
  const completeSum = (xs,key) => xs.some(x=>x[key]==null)?null:sum(xs,key);
  const live = xs => (xs || []).filter(x => !x.deletedAt);
  const required = (x, label) => { if (!String(x || '').trim()) throw Error(label + ' 항목을 입력해 주세요.'); return String(x).trim(); };
  function amount(x, label, optional) {
    if (optional && (x === '' || x == null)) return null;
    if(x===''||x==null)throw Error((label||'금액')+'을 입력해 주세요.');
    const n = Number(String(x).replace(/,/g, ''));
    if (!Number.isSafeInteger(n) || n < 0) throw Error((label || '금액') + '에 0원 이상의 금액을 1원 단위로 입력해 주세요.');
    return n;
  }
  function date(x, label, optional) {
    if (optional && !x) return '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(x || '') || !Number.isFinite(Date.parse(x)) || new Date(x + 'T00:00:00Z').toISOString().slice(0, 10) !== x) throw Error((label || '일자') + '을 정확히 입력해 주세요.');
    return x;
  }
  const latest = c => (c.revisions || []).filter(r => !r.deletedAt).slice(-1)[0];
  const revisionAt = (c, asOf) => !asOf ? latest(c) : (c.revisions || []).filter(r => !r.deletedAt && r.date && r.date <= asOf).slice().sort((a, b) => a.date.localeCompare(b.date) || Number(a.revision) - Number(b.revision)).at(-1);
  const currentContracts = p => live(p.contracts);
  const cbsName = (p, id) => (p.cbs || []).find(x => x.id === id)?.name || '연결되지 않은 항목';
  function allocationTargets(p){
    const rows=live(p.cbs),byId=new Map(rows.map(row=>[row.id,row])),counts=new Map(),checked=new Map();for(const row of rows)counts.set(row.id,(counts.get(row.id)||0)+1);
    const identifier=value=>typeof value==='string'&&value.length>0&&value.length<=200&&value.trim()===value&&!/[\u0000-\u001f\u007f]/.test(value);
    const validAncestry=row=>{const seen=new Set([row.id]);let id=row.parentId;while(id!=null&&id!==''){if(!identifier(id)||seen.has(id)||counts.get(id)!==1)return false;seen.add(id);const parent=byId.get(id);if(!parent)return false;id=parent.parentId;}return true;};
    const validParent=row=>{if(!row||!identifier(row.id)||counts.get(row.id)!==1||!row.parentId||!byId.has(row.parentId))return false;if(checked.has(row.id))return checked.get(row.id)===true;checked.set(row.id,false);if(!validAncestry(row))return false;const meta=row.costBreakdown;if(!meta||Array.isArray(meta)||meta.version!==1||!Array.isArray(meta.childIds)||!meta.childIds.length||new Set(meta.childIds).size!==meta.childIds.length||!meta.childIds.every(identifier)||!(meta.activatedFromAmount===null||Number.isSafeInteger(meta.activatedFromAmount))||typeof meta.reason!=='string'||!meta.reason.trim()||typeof meta.sourcePath!=='string'||typeof meta.activatedAt!=='string'||!Number.isFinite(Date.parse(meta.activatedAt)))return false;const valid=meta.childIds.every(id=>{const child=byId.get(id);return child&&counts.get(id)===1&&child.parentId===row.id&&child.breakdownParentId===row.id&&(!child.costBreakdown||validParent(child));});checked.set(row.id,valid);return valid;};
    const seen=new Set();return[...A.leaves(p),...(A.managementRows?.(p)||[]),...rows.filter(row=>row.costBreakdown&&validParent(row))].filter(row=>{if(seen.has(row.id)||row.costBreakdown&&!validParent(row))return false;seen.add(row.id);return true;});
  }
  const cbso = (p,{excludeIds=[],keepIds=[]}={}) => {const excluded=new Set(excludeIds.filter(Boolean)),keep=new Set(keepIds.filter(Boolean)),eligible=new Set(allocationTargets(p).map(row=>row.id)),seen=new Set(),rows=[...(A.managementRows?.(p)||[]).map(x=>({value:x.id,label:x.name})),...live(p.cbs).filter(row=>row.costBreakdown).map(row=>({value:row.id,label:row.name})),...A.cbsOptions(p)],options=[];for(const row of rows){if(!row.value||!eligible.has(row.value)||seen.has(row.value)||excluded.has(row.value)&&!keep.has(row.value))continue;seen.add(row.value);options.push(row)}return[{value:'',label:'사업비 항목 선택'},...options]};
  const companyOptions = () => [{ value: '', label: '직접 입력 / 미연결' }, ...live(A.state.companies).map(x => ({ value: x.id, label: x.name || x.company }))];
  function allocationsTotal(rows) { return sum(rows || [], 'amount'); }
  function validateAllocations(rows, total, p, requireComplete) {
    const ids = new Set(), eligible = p && rows?.length ? new Set(allocationTargets(p).map(row => row.id)) : null;
    (rows || []).forEach(r => {
      if (ids.has(r.cbsId)) throw Error('같은 CBS 항목을 두 번 배부할 수 없습니다.');
      ids.add(r.cbsId);
      if (!r.cbsId || (p && !eligible.has(r.cbsId))) throw Error('현재 사용 중인 사업비 항목을 선택해 주세요.');
      amount(r.amount, '배부금액');
    });
    const allocated = allocationsTotal(rows);
    if (total != null && allocated > total) throw Error('배부금액이 기준금액보다 큽니다.');
    if (requireComplete && (total == null || allocated !== total)) throw Error('배부금액 합계를 기준금액과 맞춰 주세요.');
    return { allocated, unallocated: total == null ? null : total - allocated, complete: total != null && allocated === total };
  }
  function paymentTotal(c, obligationId, asOf) {
    return live(c.payments).filter(x => (!obligationId || x.obligationId === obligationId) && (!asOf || x.date <= asOf)).reduce((n, x) => n + x.amount, 0);
  }
  function paymentStatus(c) {
    const payments=live(c.payments),recordedPaid=paymentTotal(c),review=c.paymentCoverage||{};
    const coverage=review.status==='confirmed'&&(!review.asOf||!payments.some(x=>x.date>review.asOf))?'confirmed':payments.length||review.status==='partial'?'partial':'unknown';
    return {coverage,paid:coverage==='confirmed'?recordedPaid:recordedPaid>0?recordedPaid:null,recordedPaid,recordCount:payments.length,unlinkedCount:payments.filter(x=>!x.obligationId).length,asOf:review.asOf||'',sourcePath:review.sourcePath||''};
  }
  const confirmedObligations=c=>live(c.obligations).filter(o=>o.confirmedAmount!=null);
  function obligationStatus(c,o,asOf){
    const paid=paymentTotal(c,o.id,asOf),base=o.confirmedAmount,coverage=paymentStatus(c).coverage;
    if(base==null)return {paid,remaining:null,confirmedUnpaid:null,state:'보관 원자료'};
    return {paid,remaining:base-paid,confirmedUnpaid:coverage==='confirmed'?base-paid:null,state:coverage!=='confirmed'?'지급 누계 미확인':paid===0?'미지급':paid<base?'부분 지급':paid===base?'지급 완료':'초과 지급'};
  }
  function contractTotals(c){
    const r=latest(c)||{},obligations=confirmedObligations(c),coverage=paymentStatus(c),paid=coverage.paid,confirmed=sum(obligations,'confirmedAmount'),paidAgainstConfirmed=obligations.reduce((n,o)=>n+paymentTotal(c,o.id),0),arithmeticConfirmed=r.net!=null&&r.vat!=null&&Number(r.net)+Number(r.vat)===r.total;
    return {total:r.total??null,costAmount:r.costAmount,certified:sum(live(c.certifications),'amount'),confirmed:obligations.length?confirmed:null,paid,recordedPaid:coverage.recordedPaid,coverage:coverage.coverage,taxConfirmed:arithmeticConfirmed,arithmeticConfirmed,balanceState:!arithmeticConfirmed?'금액 구분 미확인':coverage.coverage!=='confirmed'?'지급 누계 미확인':'확인',confirmedUnpaid:obligations.length&&coverage.coverage==='confirmed'?confirmed-paidAgainstConfirmed:null,contractBalance:r.total==null||paid==null||!arithmeticConfirmed||coverage.coverage!=='confirmed'?null:r.total-paid,advancePaid:obligations.filter(o=>o.kind==='선급금').reduce((n,o)=>n+paymentTotal(c,o.id),0),allocation:validateAllocations(r.allocations||[],r.costAmount)};
  }
  function retiredPlanning(){throw Error('지급계획 기능은 종료되었습니다. 이전 기록은 보관 원자료로만 제공합니다.');}
  const upsertForecast=retiredPlanning,replaceForecast=retiredPlanning;
  function planningArchive(p){return clone({fundForecasts:p.fundForecasts||[],contractPlans:(p.contracts||[]).map(c=>({contractId:c.id,name:c.name,obligations:c.obligations||[]})),cashflows:p.cashflows||[]});}
  function paymentLinkOptions(c,record){const options=[{value:'',label:'계약 직접 연결'},...confirmedObligations(c).map(o=>({value:o.id,label:o.label}))];if(record?.obligationId&&!options.some(x=>x.value===record.obligationId)){const old=(c.obligations||[]).find(x=>x.id===record.obligationId);options.push({value:record.obligationId,label:'보관된 원문 연결 · '+(old?.label||record.obligationId)});}return options;}

  function reviewPayments(p,contractId,values) {
    const c=currentContracts(p).find(x=>x.id===contractId);if(!c)throw Error('계약을 찾을 수 없습니다.');
    const before=clone(c),review={status:'confirmed',asOf:date(values.asOf,'확인 기준일'),sourcePath:required(values.sourcePath,'대사 근거'),reviewedAt:A.today,paid:paymentTotal(c),paymentIds:live(c.payments).map(x=>x.id)};
    c.paymentCoverage=review;c.paymentReviews=c.paymentReviews||[];c.paymentReviews.push({...clone(review),id:A.uid('payment-review')});mutate(p,'paymentCoverage',c.id,before,c,c.name+' 지급내역 확인이 완료되었습니다.','document','contracts');return review;
  }
  function upsertPayment(p,contractId,values,paymentId='') {
    const c=currentContracts(p).find(x=>x.id===contractId);if(!c)throw Error('계약을 찾을 수 없습니다.');
    const old=paymentId?live(c.payments).find(x=>x.id===paymentId):null;if(paymentId&&!old)throw Error('지급기록을 찾을 수 없습니다.');
    const gross=amount(values.amount,'지급액');if(gross<=0)throw Error('지급액은 0보다 커야 합니다.');
    const costAmount=amount(values.costAmount,'사업비 반영액',true),allocations=values.allocations||[];
    if(costAmount!=null&&costAmount>gross)throw Error('사업비 반영액이 지급액을 초과합니다.');
    if(costAmount==null&&allocations.length)throw Error('CBS 배부액의 사업비 반영액을 입력해 주세요.');
    validateAllocations(allocations,costAmount,p,costAmount!=null&&allocations.length>0);
    const obligationId=values.obligationId||'';if(obligationId!==old?.obligationId&&obligationId&&!confirmedObligations(c).some(o=>o.id===obligationId))throw Error('확정 지급조건을 선택해 주세요.');
    const record={...(old||{}),id:old?.id||A.uid('payment'),date:date(values.date,'지급일'),amount:gross,costAmount,allocations:clone(allocations),obligationId,proposalNumber:values.proposalNumber||'',sourcePath:required(values.sourcePath,'지급 근거'),note:values.note||''},before=clone(c);
    if(old)Object.assign(old,record);else(c.payments=c.payments||[]).push(record);
    c.paymentCoverage={...(c.paymentCoverage||{}),status:'partial',changedAt:A.today};mutate(p,'payment',record.id,before,c,c.name+' '+A.money(gross)+' 지급이 기록되었습니다.','document','contracts');return record;
  }
  function linkPayment(p,contractId,paymentId,obligationId) {
    const c=currentContracts(p).find(x=>x.id===contractId),record=live(c?.payments).find(x=>x.id===paymentId);if(!record)throw Error('지급기록을 찾을 수 없습니다.');
    if(obligationId&&!live(c.obligations).some(o=>o.id===obligationId))throw Error('연결할 회차를 찾을 수 없습니다.');if(record.obligationId===(obligationId||''))return record;
    const before=clone(record);record.obligationId=obligationId||'';record.linkedAt=A.today;mutate(p,'paymentLink',record.id,before,record,c.name+' 지급회차 연결이 변경되었습니다.','document','contracts');return record;
  }
  function allocatedAt(c, cbsId, key, asOf) {
    if (key === 'contract') return (revisionAt(c, asOf)?.allocations || []).filter(x => x.cbsId === cbsId).reduce((n, x) => n + x.amount, 0);
    const items = key === 'paid' ? live(c.payments) : live(c.certifications);
    return items.filter(x => !asOf || x.date <= asOf).reduce((n, x) => n + (x.allocations || []).filter(a => a.cbsId === cbsId).reduce((t, a) => t + a.amount, 0), 0);
  }
  function reconcileOpening(opening, contracts, independentPayments=[]) {
    const actual = { contract: 0, certified: 0, paid: 0 };
    const ids=[...new Set(opening.cbsIds||[opening.cbsId])];
    contracts.forEach(c => Object.keys(actual).forEach(k => { actual[k] += ids.reduce((n,id)=>n+allocatedAt(c,id,k,opening.asOf),0); }));
    for(const payment of independentPayments){if(payment.deletedAt||payment.movedToContractId||payment.date>opening.asOf||!ids.includes(payment.cbsId))continue;if(payment.costAmount==null)return{actual,differences:{contract:actual.contract-opening.contract,certified:actual.certified-opening.certified,paid:null},matches:false,pending:true};actual.paid+=payment.costAmount;}
    const differences = Object.fromEntries(Object.keys(actual).map(k => [k, actual[k] - Number(opening[k] || 0)]));
    return { actual, differences, matches: Object.values(differences).every(x => x === 0) };
  }
  const initialLoanNumber=value=>(typeof value==='number'||typeof value==='string')&&String(value).trim()!==''&&Number.isFinite(Number(value))?Number(value):null;
  function initialize(state) {
    (state.projects || []).forEach(p => {
      p.contracts = p.contracts || [];
      p.fundForecasts=p.fundForecasts||[];p.fundPayments=p.fundPayments||[];p.fundItemReviews=p.fundItemReviews||[];
      (p.contracts || []).forEach(c => {
        if (!c.originalSource && !c.revisions?.length) c.originalSource = clone(c);
        c.companyId = c.companyId || '';
        c.status = c.status || '체결';
        c.proposalNumber = c.proposalNumber || '';
        if (!c.revisions?.length) c.revisions = [{ id: 'rev-initial-' + c.id, revision: 1, date: c.date || '', total: c.amount == null ? null : Number(c.amount), net: null, vat: null, costAmount: null, taxStatus: '원자료 기준 미확인', allocations: [], file: c.file || '', note: '기존 계약 원자료 이관' }];
        c.revisions.forEach(r => { r.allocations = r.allocations || []; });
        c.obligations = c.obligations || []; c.certifications = c.certifications || []; c.payments = c.payments || [];c.paymentReviews=c.paymentReviews||[];c.paymentCoverage=c.paymentCoverage||{status:c.payments.length?'partial':'unknown'}; c.schemaVersion = 3;
      });
      p.executionOpeningBalances = p.executionOpeningBalances || [];
      (p.costs || []).filter(x => x.parent && !x.deletedAt && (x.contract || x.progress || x.paid)).forEach(x => {
        if (p.executionOpeningBalances.some(o => o.sourceCostId === x.id || o.id === 'opening-' + x.id)) return;
        const linked = (p.cbs || []).find(r => r.id === x.id || (r.sourceIds || []).includes(x.id));
        p.executionOpeningBalances.push({ id: 'opening-' + x.id, sourceCostId: x.id, sourceName: x.name, cbsId: linked?.id || '', asOf: p.asOf || '', contract: Number(x.contract || 0), certified: Number(x.progress || 0), paid: Number(x.paid || 0), source: x.source || 'v0.9.4 원가표', replacedAt: '', contractIds: [] });
      });
      p.loanQuarterlyRecords = p.loanQuarterlyRecords || []; p.loanEvents = p.loanEvents || [];
      (p.loans || []).filter(l => !p.loanQuarterlyRecords.some(q => q.loanId === l.id) && !p.loanEvents.some(e => e.loanId === l.id || e.toLoanId === l.id)).forEach(l => p.loanQuarterlyRecords.push({ id: 'loan-initial-' + l.id, loanId: l.id, asOf: p.asOf || '', commitment: initialLoanNumber(l.commitment), executed: initialLoanNumber(l.executed), balance: initialLoanNumber(l.balance), allIn: initialLoanNumber(l.allIn), maturity: l.finalMaturity || l.maturity || '', source: 'v0.9.4 기준일 원자료', loan: clone(l) }));
      p.contractsV010Migrated = true; p.contractSchemaVersion = 2;
    });
  }
  A.initializers.push(initialize);
  const mutate = (p, entity, id, before, after, title, view = 'document', tab = 'contracts') => A.audit(before == null ? 'create' : 'update', entity, id, before, after, title, { view, tab, projectId: p.id, id });
  const getContract = id => { const p = A.current(); const c = currentContracts(p).find(x => x.id === id); if (!c) throw Error('계약을 찾을 수 없습니다.'); return [p, c]; };
  const createButton=(label,action,data={})=>A.createButton?A.createButton(label,action,data):A.btn(label,action,data,'create');
  const button=(label,action,id,more)=>/추가$/.test(label)?createButton(label,action,{id,...(more||{})}):A.btn(label,action,{id,...(more||{})});
  const moneyOrDash = x => x == null ? '<span class="muted">미확인</span>' : A.money(x);
  const signed = x => '<span class="' + (x < 0 ? 'rise' : '') + '">' + A.money(x) + '</span>';
  const inlineLabels={contract:{name:'계약명',type:'계약 유형',counterparty:'계약 상대방',period:'계약기간',status:'계약 상태',proposalNumber:'기안번호',companyId:'연결 업체',date:'계약일',file:'원본 경로',net:'공급가액',vat:'부가세',total:'계약총액',costAmount:'사업비 반영액'},document:{title:'문서명',category:'분류',number:'문서번호',date:'작성일',issuer:'발신자',recipient:'수신자',location:'원본 경로',related:'관련 내용',status:'상태',revision:'개정차수'},loan:{institution:'금융기관',rank:'상환순위',type:'대출 유형',commitment:'약정액',executed:'누적 실행액',balance:'대출 잔액',allIn:'All-in 금리',start:'약정 시작일',maturity:'최종 만기일',collateral:'담보·신용보강',sourcePath:'근거 경로'},equities:{company:'출자자',registration:'사업자·법인 등록번호',amount:'출자금액',purpose:'출자 목적'},guarantees:{category:'담보·신용보강 구분',provider:'제공자',amount:'담보·보증금액',detail:'조건·범위',expiry:'만료일'},guarantors:{name:'보증기관',type:'보증 유형',amount:'보증금액',scope:'보증 범위'}};
  Object.assign(inlineLabels.loan,{interestRate:'금리 (연 %)',upfrontFeeRate:'선취·취급 수수료 (%)',advisoryFeeRate:'금융자문 수수료 (%)',allIn:'ALL-IN (연 %)',allInAdvisoryBasis:'ALL-IN 기준',interestTerms:'금리·이자지급 조건',otherFees:'그 밖의 수수료',repaymentTerms:'상환 조건'});
  const inline = (p, entity, id, field, value, type = 'text', options = [], label = inlineLabels[entity]?.[field]||field) => A.editable({ projectId: p.id, entity, id, field, value, type:type==='percent'?'number':type, options:entity==='loan'&&['rank','type'].includes(field)?loanChoices(value,options):options, display: value==null||value===''||entity==='loan'&&(loanPricingFields.includes(field)&&!loanKnownPercent(value)||type==='money'&&initialLoanNumber(value)==null)?'—':type==='money'?A.esc(A.money(value)):type==='percent'?A.esc(A.num(value,2)+'%'):type==='select'?A.esc(options.find(x=>typeof x==='object'&&String(x.value)===String(value))?.label||value):A.esc(value), label });
  const panelTable = (title, headers, rows, actions = '', toolbar = '') => '<section class="table-panel"><div class="table-toolbar"><div class="table-toolbar-left">' + (toolbar || '<strong>' + A.esc(title) + '</strong>') + '</div><div class="table-toolbar-right">' + actions + '</div></div>' + A.table(headers, rows) + '</section>';
  const tableLink = (label, action, id, data = {}) => '<button type="button" class="table-link" data-action="' + action + '" data-id="' + A.esc(id) + '" '+(action==='document-select'?'aria-controls="document-detail-panel" ':'') + Object.entries(data).map(([k, v]) => 'data-' + k + '="' + A.esc(v) + '"').join(' ') + '>' + A.esc(label) + '</button>';
  const summaryStrip = items => '<section class="execution-summary recovery-summary">' + items.map(([k, v]) => '<div><span>' + A.esc(k) + '</span><b>' + v + '</b></div>').join('') + '</section>';
  function formContract(c) {
    const r = c ? latest(c) : {};
    if(!c)return A.field('name','계약명')+A.field('counterparty','상대방')+A.field('date','계약일',A.today,'date')+A.field('total','계약금액 (원)','','number')+A.field('file','계약 근거 경로');
    return A.field('name', '계약명', c?.name || '') + A.field('counterparty', '계약 상대방', c?.counterparty || '') + A.field('companyId', '시공사·협력사 연결', c?.companyId || '', 'select', companyOptions()) + A.field('type', '계약 유형', c?.type || '') + A.field('date', '계약일', r?.date || A.today, 'date') + A.field('period', '계약기간', c?.period || '') + A.field('file', '계약 원본·공용폴더 경로', r?.file || c?.file || '') + A.field('proposalNumber', '기안번호 (선택)', c?.proposalNumber || '') + A.field('status', '계약 상태', c?.status || '체결', 'select', ['체결', '협의 중', '종료', '해지']) + A.field('total', '계약 총액 (원)', r?.total || 0, 'number') + A.field('net', '공급가액 (원, 확인 시 입력)', r?.net ?? '', 'number') + A.field('vat', '부가세 (원, 면세는 0)', r?.vat ?? '', 'number') + A.field('costAmount', '사업비 반영액 (원)', r?.costAmount ?? '', 'number') + A.field('note', '변경 내용·메모', '', 'textarea');
  }
  function revisionValues(v, old) {
    const total = amount(v.total, '계약 총액'), net = amount(v.net, '공급가액', true), vat = amount(v.vat, '부가세', true), costAmount = amount(v.costAmount, '사업비 반영액', true);
    if ((net == null) !== (vat == null)) throw Error('공급가액과 부가세를 함께 입력해 주세요.');
    if (net != null && net + vat !== total) throw Error('공급가액과 부가세 합계를 계약 총액과 맞춰 주세요.');
    if (costAmount != null && costAmount > total) throw Error('사업비 반영액은 계약 총액보다 클 수 없습니다.');
    const allocations = clone(old?.allocations || []);
    validateAllocations(allocations, costAmount);
    return { id: A.uid('revision'), revision: (old?.revision || 0) + 1, date: date(v.date, '계약일'), total, net, vat, costAmount, taxStatus: net == null ? '미확인' : '확인', allocations, file: required(v.file, '계약 원본 경로'), note: v.note || '' };
  }
  const contractParentOptions=(id,formKey='edit')=>{const projectId=A.current()?.id,returnTo=()=>{const p=A.current();if(!p||p.id!==projectId||!currentContracts(p).some(c=>c.id===id)){A.closeModal({userInitiated:true});return;}showContract(id);};return{...A.formParentOptions?.(returnTo),draftContext:'contract:'+id+':'+formKey};};
  A.on('contract-add', b => A.form(b?.dataset?.cbsId?cbsName(A.current(),b.dataset.cbsId)+' · 계약 추가':'계약 추가', formContract(), v => {
    const p = A.current(), revision = revisionValues(v), c = { id: A.uid('contract'), name: required(v.name, '계약명'), counterparty: required(v.counterparty, '계약 상대방'), companyId: v.companyId||'', type: v.type||'', date: v.date, period: v.period||'', file: v.file, proposalNumber: v.proposalNumber||'', status: v.status||'체결', revisions: [revision], obligations: [], payments: [], certifications: [],paymentCoverage:{status:'unknown'},paymentReviews:[] };
    if(b?.dataset?.cbsId)c.cbsId=b.dataset.cbsId;
    p.contracts.push(c); mutate(p, 'contract', c.id, null, c, c.name + ' 계약이 추가되었습니다.');
  },'저장',{draftContext:'contract-new:'+String(b?.dataset?.cbsId||'library')}));
  A.on('contract-edit', b => {
    const [p, c] = getContract(b.dataset.id);
    A.form('계약 수정·변경계약', formContract(c), v => {
      if(currentContracts(p).find(row=>row.id===c.id)!==c)throw Error('수정할 계약을 찾을 수 없습니다.');
      const before = clone(c), r = revisionValues(v, latest(c));
      Object.assign(c, { name: required(v.name, '계약명'), counterparty: required(v.counterparty, '계약 상대방'), companyId: v.companyId, type: v.type, period: v.period, file: v.file, proposalNumber: v.proposalNumber, status: v.status });
      c.revisions.push(r); mutate(p, 'contract', c.id, before, c, c.name + ' 계약 ' + r.revision + '차 변경이 기록되었습니다.');
    },'저장',contractParentOptions(c.id));
  });
  A.on('contract-delete', b => { const [p, c] = getContract(b.dataset.id); if(live(c.payments).length||live(p.fundForecasts).some(x=>x.replacedBy?.contractId===c.id))return A.toast('지급·예측이 연결된 계약은 삭제할 수 없습니다. 계약 상태를 변경해 주세요.'); A.confirmDelete(c.name, () => { const before = clone(c); c.deletedAt = A.today; A.audit('delete', 'contract', c.id, before, c, c.name + ' 계약이 삭제되었습니다.', { view: 'document', tab: 'contracts', projectId: p.id }); A.toast('계약을 삭제했습니다.', () => { const gone = clone(c); c.deletedAt = null; A.audit('restore', 'contract', c.id, gone, c, c.name + ' 계약이 복구되었습니다.'); A.render(); }); }); });
  A.on('contract-detail', b => {cancelDocumentSearch();showContract(b.dataset.id);});
  A.on('contract-detail-tab', b => { A.ui.contractDetailTab = b.dataset.tab; showContract(b.dataset.id); });
  A.on('contract-vat',b=>{const [p,c]=getContract(b.dataset.id);if(!A.vat?.openEditor)return A.toast('부가세 편집기를 불러오지 못했습니다.');A.vat.openEditor(p,{kind:'contract',id:c.id},contractParentOptions(c.id,'vat'));});
  function showContract(id) {
    const [p, c] = getContract(id), r = latest(c), t = contractTotals(c);
    A.ui.contractModalId=id;
    const allocations = (r.allocations || []).map(x => [A.esc(cbsName(p, x.cbsId)), A.money(x.amount), button('배부 삭제', 'contract-allocation-delete', c.id, { cbs: x.cbsId })]);
    const obs=confirmedObligations(c).map(o=>{const s=obligationStatus(c,o);return[A.esc(o.label),moneyOrDash(o.confirmedAmount),moneyOrDash(s.paid),moneyOrDash(s.confirmedUnpaid),A.esc(s.state),button('실제 지급 기록','payment-add',c.id,{record:o.id})];});
    const payments = live(c.payments).map(x => [x.date, A.esc(live(c.obligations).find(o => o.id === x.obligationId)?.label || '회차 미연결'), A.money(x.amount), A.money(x.costAmount), A.esc(x.proposalNumber || '—'), button('수정', 'payment-edit', c.id, { record: x.id }) + button('삭제', 'contract-record-delete', c.id, { record: x.id, kind: 'payments' })]);
    const certs = live(c.certifications).map(x => [x.date, A.money(x.amount), A.esc(x.note), button('수정', 'certification-edit', c.id, { record: x.id }) + button('삭제', 'contract-record-delete', c.id, { record: x.id, kind: 'certifications' })]);
    const revisions = c.revisions.map(x => [x.revision + '차', x.date || '미입력', A.money(x.total), moneyOrDash(x.net), moneyOrDash(x.vat), moneyOrDash(x.costAmount), A.esc(x.note)]);
    const s = c.summary || {}, tab = A.ui.contractDetailTab || 'core', tabs = [['core','핵심조건'],['payment','대금·지급'],['scope','업무범위'],['responsibility','책임·보증'],['changes','변경이력'],['sources','원문근거']];
    const vat=tab==='core'?A.vat?.summaryFor?.(p,{kind:'contract',id:c.id}):null,vatRows=vat?[['부가세 검토상태',A.esc(vat.status||'미확인')+' '+button('금액·부가세','contract-vat',c.id)],['공제세액',moneyOrDash(vat.sourceDrift?null:vat.deductible)],['불공제세액',moneyOrDash(vat.sourceDrift?null:vat.nonDeductible)],['검토 사업비 반영액',moneyOrDash(vat.sourceDrift?null:vat.costAmount)]]:[];
    const summary = rows => '<div class="summary-table">' + rows.map(([key, value, source]) => '<div class="summary-table-row"><div>' + A.esc(key) + '</div><div class="recovery-wrap">' + A.esc(value ?? '') + '</div><div>' + A.esc(source || '') + '</div></div>').join('') + '</div>';
    let content;
    if (tab === 'core') content = A.table(['항목','내용'], [['계약목적', A.esc(s.purpose || '')], ['계약기간', inline(p,'contract',c.id,'period',c.period)], ['계약일', inline(p,'contract',c.id,'date',r.date,'date')], ['공급가액', inline(p,'contract',c.id,'net',r.net,'money')], ['부가세', inline(p,'contract',c.id,'vat',r.vat,'money')], ['계약총액', inline(p,'contract',c.id,'total',r.total,'money')], ['사업비 반영액', inline(p,'contract',c.id,'costAmount',r.costAmount,'money')], ...vatRows, ['기안번호', inline(p,'contract',c.id,'proposalNumber',c.proposalNumber)], ['업체 연결', inline(p,'contract',c.id,'companyId',c.companyId,'select',companyOptions())]]) + panelTable('CBS 사업비 배부',['CBS 항목','사업비 반영액',''],allocations,button('배부 추가','contract-allocation-add',c.id));
    else if (tab === 'payment') content = summary((s.payment || []).map((v,i) => ['조건 '+(i+1),v,s.sources?.[i]?.clause])) + panelTable('확정 지급조건',['조건','확정 지급총액','실제 지급','확정 미지급','상태',''],obs) + panelTable('실제 지급',['지급일','회차','지급총액','사업비 반영액','기안번호',''],payments,button('지급 기록 추가','payment-add',c.id)+button('지급 누계 확인','payment-review',c.id)) + panelTable('기성 인정',['기준일','기성금액','메모',''],certs,button('기성 추가','certification-add',c.id));
    else if (tab === 'scope') content = summary([...(s.includes || []).map(v => ['포함',v,'과업내용서']),...(s.excludes || []).map(v => ['제외',v,'제외범위'])]);
    else if (tab === 'responsibility') content = summary([...(s.responsibilities || []).map(v => ['책임',v,'특수조건']),...(s.guarantees || []).map(v => ['보증',v,'보증조건']),...(s.termination || []).map(v => ['해지',v,'해지조항'])]);
    else if (tab === 'changes') content = panelTable('계약 변경이력',['차수','계약일','총액','공급가액','부가세','사업비 반영액','변경 내용'],revisions,button('변경계약','contract-edit',c.id)) + summary((s.changes || []).map(v => [v.date,v.title,v.detail]));
    else content = summary((s.sources || []).map(v => [v.clause,v.text,'']));
    A.modal('계약조건 요약', '<div class="dp-contract-modal"><div class="contract-summary-line"><span>계약 <b>' + A.esc(c.name) + '</b></span><span>상대방 <b>' + A.esc(c.counterparty) + '</b></span><span>계약금액 <b>' + A.money(r.total) + '</b></span><span>계약기간 <b>' + A.esc(c.period) + '</b></span></div><div class="contract-origin-path"><span>원본 경로</span>'+inline(p,'contract',c.id,'file',r.file||c.file||'')+button('복사','contract-copy-path',c.id)+'</div><div class="contract-tabs">' + tabs.map(([key,label]) => '<button type="button" class="contract-tab ' + (tab===key?'active':'') + '" data-action="contract-detail-tab" data-id="' + A.esc(c.id) + '" data-tab="' + key + '">' + label + '</button>').join('') + '</div><div class="contract-content">' + content + '</div></div>');
  }
  A.on('contract-copy-path', b => { const [, c] = getContract(b.dataset.id); A.copy(latest(c).file || c.file || ''); });
  A.on('contract-allocation-add', b => {
    const [p, c] = getContract(b.dataset.id), r = latest(c);
    A.form('CBS 배부 추가', A.field('cbsId', 'CBS 항목', '', 'select', cbso(p,{excludeIds:[c.cbsId,...(r.allocations||[]).map(row=>row.cbsId)]})) + A.field('amount', '배부액 (원)', '', 'number') + '<p class="hint">사업비 반영액 ' + moneyOrDash(r.costAmount) + ' · 현재 배부 ' + A.money(allocationsTotal(r.allocations)) + '</p>', v => {
      if (r.costAmount == null) throw Error('계약 수정에서 사업비 반영액을 먼저 입력해 주세요.');
      const rows = [...r.allocations, { cbsId: v.cbsId, amount: amount(v.amount, '배부액') }]; validateAllocations(rows, r.costAmount, p);
      const before = clone(c); r.allocations = rows; mutate(p, 'contract-allocation', c.id, before, c, c.name + ' CBS 배부가 변경되었습니다.');
    },'저장',contractParentOptions(c.id));
  });
  A.on('contract-allocation-delete', b => { const [p, c] = getContract(b.dataset.id); A.confirmDelete('선택한 CBS 배부', () => { const before = clone(c); latest(c).allocations = latest(c).allocations.filter(x => x.cbsId !== b.dataset.cbs); mutate(p, 'contract-allocation', c.id, before, c, c.name + ' CBS 배부가 삭제되었습니다.'); A.render(); },contractParentOptions(c.id,'allocation-delete:'+b.dataset.cbs)); });
  function allocationFields(p, existing, prefix) {
    const rows = existing || [];
    const count = Math.max(3, rows.length);
    const used=rows.map(row=>row.cbsId).filter(Boolean);
    return '<div class="full form-grid" data-allocation-prefix="' + prefix + '" data-count="' + count + '">' + Array.from({ length: count }, (_, i) => A.field(prefix + 'cbs' + i, 'CBS 배부 ' + (i + 1), rows[i]?.cbsId || '', 'select', cbso(p,{excludeIds:used,keepIds:[rows[i]?.cbsId]})) + A.field(prefix + 'amount' + i, '배부 ' + (i + 1) + ' 금액 (원)', rows[i]?.amount ?? '', 'number')).join('') + '</div><div class="full">' + A.btn('배부행 추가', 'allocation-row-add', { prefix }) + '</div>';
  }
  function appendAllocationRow(p,prefix,container,values={}){
    const i=Number(container.dataset.count);if(!Number.isSafeInteger(i)||i<0)return false;
    const used=[...(container.querySelectorAll?.('select')||[])].filter(node=>String(node.name||'').startsWith(prefix+'cbs')).map(node=>node.value).filter(Boolean),cbsId=values[prefix+'cbs'+i]??'';
    container.insertAdjacentHTML('beforeend',A.field(prefix+'cbs'+i,'CBS 배부 '+(i+1),cbsId,'select',cbso(p,{excludeIds:used,keepIds:[cbsId]}))+A.field(prefix+'amount'+i,'배부 '+(i+1)+' 금액 (원)',values[prefix+'amount'+i]??'','number'));
    container.dataset.count=i+1;return true;
  }
  function restoreAllocationRows(p,prefix,values={}){
    if(!['pay','cert','due'].includes(prefix)||A.current()?.id!==p.id)return;
    const project=A.state.projects.find(row=>row.id===p.id&&!row.deletedAt),container=document.querySelector('#app-form [data-allocation-prefix="'+prefix+'"]');if(!project||!container)return;
    let i=Number(container.dataset.count);while(Object.hasOwn(values,prefix+'cbs'+i)||Object.hasOwn(values,prefix+'amount'+i)){if(!appendAllocationRow(project,prefix,container,values))break;i=Number(container.dataset.count);}
    for(const control of container.querySelectorAll?.('input,select,textarea')||[])if(control.name&&Object.hasOwn(values,control.name))control.value=values[control.name]??'';
  }
  function allocationForm(p,prefix,title,fields,callback,submitLabel,options){
    const prior=options?.draftAdapter;let paymentMoreOpen=null,mountedPaymentMore=null,mountedPaymentForm=null,paymentPosition=null,paymentRestoreToken=0,paymentRestoring=false;
    const paymentDetails=()=>document.getElementById('app-form')?.querySelector?.('details.dp-payment-more');
    const ownsPaymentForm=form=>A.current()?.id===p.id&&form?.isConnected!==false&&document.getElementById('app-form')===form;
    const capturePaymentPosition=(form,body)=>{if(prefix!=='pay'||paymentRestoring||!body||!ownsPaymentForm(form))return;const active=document.activeElement,inside=active&&form.contains?.(active),focus=inside&&active.name?{name:active.name}:inside&&active.type==='submit'?{submit:true}:paymentPosition?.focus||null;paymentPosition={top:body.scrollTop||0,left:body.scrollLeft||0,focus};};
    const restorePaymentDetails=error=>{
      if(prefix!=='pay'||A.current()?.id!==p.id)return;const form=document.getElementById('app-form'),details=paymentDetails(),body=document.getElementById('app-dialog')?.querySelector?.('.dialog-body'),token=++paymentRestoreToken;if(!details)return;
      if(paymentMoreOpen!==null)details.open=paymentMoreOpen;if(mountedPaymentMore!==details){mountedPaymentMore=details;details.addEventListener('toggle',()=>{if(details.isConnected!==false&&ownsPaymentForm(form))paymentMoreOpen=details.open;});}
      if(mountedPaymentForm!==form){mountedPaymentForm=form;const capture=()=>capturePaymentPosition(form,body);body?.addEventListener?.('scroll',capture,{passive:true});form?.addEventListener?.('focusin',capture);form?.addEventListener?.('keydown',event=>{if(event.key==='Escape')capture();},true);}
      const position=paymentPosition&&{...paymentPosition};if(!position||error?.fieldErrors)return;paymentRestoring=true;
      // The common editor queues its initial focus after invoking resume. Apply
      // this payment session's saved viewport after that focus, not before it.
      queueMicrotask(()=>queueMicrotask(()=>{if(token!==paymentRestoreToken)return;if(!ownsPaymentForm(form)||body?.isConnected===false){paymentRestoring=false;return;}if(!form.querySelector?.('[aria-invalid="true"]')){const target=position.focus?.submit?form.querySelector?.('button[type="submit"]'):[...(form.querySelectorAll?.('input,select,textarea')||[])].find(control=>control.name===position.focus?.name);target?.focus?.({preventScroll:true});if(body){body.scrollTop=position.top;body.scrollLeft=position.left;}}paymentRestoring=false;}));
    };
    const session=A.form(title,fields,(values,operation)=>{if(prefix==='pay'){const details=paymentDetails();if(details)paymentMoreOpen=details.open;capturePaymentPosition(document.getElementById('app-form'),document.getElementById('app-dialog')?.querySelector?.('.dialog-body'));}return callback(values,operation);},submitLabel,{...options,draftAdapter:{...prior,resume:(values,error)=>{restoreAllocationRows(p,prefix,values);restorePaymentDetails(error);prior?.resume?.(values,error);}}});
    return session;
  }
  A.on('allocation-row-add', b => {
    const prefix = b.dataset.prefix;
    if (!['pay', 'cert','due'].includes(prefix)) return;
    const container = document.querySelector('#app-form [data-allocation-prefix="' + prefix + '"]');
    if (!container) return;
    appendAllocationRow(A.current(),prefix,container);
  });
  function readAllocations(v, prefix) {
    return Object.keys(v).filter(k => k.startsWith(prefix + 'cbs')).map(k => ({ cbsId: v[k], raw: v[prefix + 'amount' + k.slice((prefix + 'cbs').length)] })).filter(x => x.cbsId || x.raw !== '').map(x => ({ cbsId: x.cbsId, amount: amount(x.raw, '배부금액') }));
  }
  function editPayment(b) {
    const [p, c] = getContract(b.dataset.id), isEdit = b.dataset.action === 'payment-edit', row = isEdit ? live(c.payments).find(x => x.id === b.dataset.record) : null;
    if(isEdit&&!row)return A.toast('수정할 지급기록을 찾을 수 없습니다.');
    const option=paymentLinkOptions(c,row);
    allocationForm(p,'pay',row?'지급 기록 수정':'지급 기록',A.field('date','지급일',row?.date||A.today,'date')+A.field('amount','지급액 (원)',row?.amount??'','number')+A.field('sourcePath','지급 근거 경로',row?.sourcePath||'')+'<details class="full dp-payment-more"><summary>추가 정보</summary><div class="form-grid">'+A.field('obligationId','연결 확정조건',row?.obligationId||(!isEdit?b.dataset.record:'')||'','select',option)+A.field('proposalNumber','기안번호',row?.proposalNumber||'')+A.field('costAmount','사업비 반영액 (원)',row?.costAmount??'','number')+allocationFields(p,row?.allocations||[],'pay')+A.field('note','메모',row?.note||'','textarea')+'</div></details>',v=>upsertPayment(p,c.id,{...v,allocations:readAllocations(v,'pay')},row?.id),'저장',contractParentOptions(c.id,'payment:'+(row?.id||('new:'+String(b.dataset.record||'unlinked')))));
  }
  A.on('payment-add', editPayment); A.on('payment-edit', editPayment);
  A.on('payment-link',b=>{const [p,c]=getContract(b.dataset.id),record=live(c.payments).find(x=>x.id===b.dataset.record);if(!record)return;A.form('확정 지급조건 연결',A.field('obligationId','확정 지급조건',record.obligationId||'','select',paymentLinkOptions(c,record)),v=>linkPayment(p,c.id,record.id,v.obligationId),'저장',contractParentOptions(c.id,'payment-link:'+record.id));});
  A.on('payment-review',b=>{const [p,c]=getContract(b.dataset.id);A.form('지급내역 확인',A.field('asOf','확인 기준일',A.today,'date')+A.field('sourcePath','대사 근거 경로')+'<div class="full dp-payment-review-value">누적 지급 '+A.money(paymentTotal(c))+'</div>',v=>reviewPayments(p,c.id,v),'저장',contractParentOptions(c.id,'payment-review'));});
  function editCertification(b) {
    const [p, c] = getContract(b.dataset.id), isEdit=b.dataset.action==='certification-edit',row = live(c.certifications).find(x => x.id === b.dataset.record);if(isEdit&&!row)return A.toast('수정할 기성 기록을 찾을 수 없습니다.');
    allocationForm(p,'cert',row ? '기성 수정' : '기성 인정금액 추가', A.field('date', '기성 인정일', row?.date || A.today, 'date') + A.field('amount', '기성 인정액 (사업비 기준, 원)', row?.amount ?? '', 'number') + A.field('sourcePath', '기성 근거 경로', row?.sourcePath || '') + allocationFields(p, row?.allocations || (latest(c).allocations || []).map(x => ({ cbsId: x.cbsId, amount: '' })), 'cert') + A.field('note', '메모', row?.note || '', 'textarea'), v => {
      if(row&&live(c.certifications).find(item=>item.id===row.id)!==row)throw Error('수정할 기성 기록을 찾을 수 없습니다.');
      const value = amount(v.amount, '기성금액'), allocations = readAllocations(v, 'cert'); validateAllocations(allocations, value, p, true);
      const before = row ? clone(row) : null, x = { id: row?.id || A.uid('cert'), date: date(v.date), amount: value, allocations, sourcePath: required(v.sourcePath, '근거자료 경로'), note: v.note };
      if (row) Object.assign(row, x); else c.certifications.push(x); mutate(p, 'certification', x.id, before, x, c.name + ' 기성이 기록되었습니다.', 'document', 'contracts');
    },'저장',contractParentOptions(c.id,'certification:'+(row?.id||'new')));
  }
  A.on('certification-add', editCertification); A.on('certification-edit', editCertification);
  A.on('contract-record-delete', b => {
    const [p, c] = getContract(b.dataset.id), kind = b.dataset.kind;
    if (!['obligations', 'payments', 'certifications'].includes(kind)) return;
    const row = live(c[kind]).find(x => x.id === b.dataset.record); if (!row) return;if(kind==='obligations'&&row.confirmedAmount==null)return retiredPlanning();
    if (kind === 'obligations' && live(c.payments).some(x => x.obligationId === row.id)) return A.toast('지급 기록이 연결된 회차는 삭제할 수 없습니다. 지급 기록을 먼저 정리해 주세요.');
    A.confirmDelete(row.label || '선택한 기록', () => { const before = clone(row),coverage=clone(c.paymentCoverage||{}); row.deletedAt = A.today;if(kind==='payments')c.paymentCoverage={...coverage,status:'partial',changedAt:A.today}; A.audit('delete', kind, row.id, {record:before,paymentCoverage:coverage}, {record:row,paymentCoverage:c.paymentCoverage}, c.name + ' ' + (kind === 'payments' ? '지급' : kind === 'certifications' ? '기성' : '지급 회차') + ' 기록이 삭제되었습니다.', { view: 'document', tab: 'contracts', projectId: p.id }); A.toast('기록을 삭제했습니다.', () => { const deleted={record:clone(row),paymentCoverage:clone(c.paymentCoverage)}; row.deletedAt = null;if(kind==='payments')c.paymentCoverage=coverage; A.audit('restore', kind, row.id, deleted, {record:row,paymentCoverage:c.paymentCoverage}, '삭제한 기록이 복구되었습니다.'); A.render(); }); },contractParentOptions(c.id,'delete:'+kind+':'+row.id));
  });
  
  
  function cbsFunds(p, id) {
    const kids=A.children(p,id);
    if(kids.length){const parts=kids.map(x=>cbsFunds(p,x.id)),direct={contract:0,certified:0,paid:0};currentContracts(p).forEach(c=>Object.keys(direct).forEach(k=>direct[k]+=allocatedAt(c,id,k,fundsAsOf(p))));const primary=itemFunds(p,id);return {contract:primary.contractAmount,certified:sum(parts,'certified')+direct.certified,paid:primary.paidCost,unpaid:completeSum(parts,'unpaid'),legacy:parts.some(x=>x.legacy),ledger:{contract:parts.reduce((n,x)=>n+x.ledger.contract,0)+direct.contract,certified:parts.reduce((n,x)=>n+x.ledger.certified,0)+direct.certified,paid:parts.reduce((n,x)=>n+x.ledger.paid,0)+direct.paid},initial:A.amount(p,id,'initial'),current:A.amount(p,id,'current')};}
    const descendants = itemId => { const kids = A.children(p, itemId); return kids.length ? kids.flatMap(x => descendants(x.id)) : [itemId]; };
    const ids = descendants(id), result = { contract: 0, certified: 0, paid: 0 };
    currentContracts(p).forEach(c => ids.forEach(cbsId => Object.keys(result).forEach(key => { result[key] += allocatedAt(c, cbsId, key); })));
    const opening=(p.executionOpeningBalances||[]).filter(x=>ids.includes(x.cbsId)&&!x.replacedAt),legacy=opening.length>0;
    const shown=legacy?{contract:sum(opening,'contract'),certified:sum(opening,'certified'),paid:sum(opening,'paid')}:result;
    let unpaid=legacy?shown.certified-shown.paid:0;
    if(!legacy)currentContracts(p).forEach(c=>{const relevant=(latest(c)?.allocations||[]).some(x=>ids.includes(x.cbsId));if(!relevant)return;for(const o of live(c.obligations).filter(x=>x.confirmedAmount!=null)){if(o.costAmount==null||allocationsTotal(o.allocations)!==o.costAmount){unpaid=null;break;}if(unpaid!=null){unpaid+=(o.allocations||[]).filter(x=>ids.includes(x.cbsId)).reduce((n,x)=>n+x.amount,0);unpaid-=live(c.payments).filter(x=>x.obligationId===o.id).reduce((n,x)=>n+(x.allocations||[]).filter(a=>ids.includes(a.cbsId)).reduce((a,b)=>a+b.amount,0),0);}}});
    const independent=live(p.fundPayments).filter(x=>!x.movedToContractId&&x.cbsId===id&&x.date<=fundsAsOf(p)&&(!opening.length||x.date>opening.map(o=>o.asOf||'9999').sort().at(-1)));
    const primary=itemFunds(p,id);
    return { ...shown,contract:primary.contractAmount,paid:primary.paidCost, ledger:result, legacy, unpaid, initial: A.amount(p, id, 'initial'), current: A.amount(p, id, 'current') };
  }
  const fundsAsOf=p=>p.asOf||A.today;
  // Amounts below are never apportioned using an inferred VAT or CBS ratio.
  const managed=p=>A.managementRows?.(p)||A.cbsRows(p).filter(x=>x.parentId&&!A.children(p,x.id).length);
  function itemSourceIds(p,id){const old=(p.cbs||[]).find(x=>x.id===id),resolved=old?.mergedIntoId?A.managementOwner?.(p,id)?.id||id:id,result=new Set([id,...(A.managementSourceIds?.(p,resolved)||[resolved])]);const visit=x=>{result.add(x);A.children(p,x).forEach(n=>visit(n.id));};visit(resolved);return result;}
  function itemRef(p,id){const currentId=A.managementOwner?.(p,id)?.id||id,row=managed(p).find(x=>x.id===currentId);if(!row)throw Error('사업비 관리항목을 선택해 주세요.');return row;}
  function upsertItemPayment(p,v,id=''){
    itemRef(p,v.cbsId);const old=id?live(p.fundPayments).find(x=>x.id===id&&!x.movedToContractId):null;if(id&&!old)throw Error('독립 지급기록을 찾을 수 없습니다.');
    const value=amount(v.amount,'실제 출금액'),costAmount=amount(v.costAmount,'사업비 반영액',true);if(value<=0||costAmount!=null&&costAmount>value)throw Error('출금액과 사업비 반영액을 확인해 주세요.');
    if(v.forecastId!==undefined&&v.forecastId!==(old?.forecastId||''))retiredPlanning();
    const row={...old,id:old?.id||A.uid('item-payment'),cbsId:v.cbsId,date:date(v.date,'실제 지급일'),amount:value,costAmount,sourcePath:required(v.sourcePath,'지급 근거'),proposalNumber:v.proposalNumber||'',note:v.note||''};
    return A.transaction(()=>{const before=old?clone(old):null;if(old)Object.assign(old,row);else(p.fundPayments=p.fundPayments||[]).push(row);mutate(p,'fundPayment',row.id,before,row,cbsName(p,row.cbsId)+' 실제 지급이 기록되었습니다.','document','contracts');return row;});
  }
  function sourcePayments(p,asOf=fundsAsOf(p)){
    const rows=[],seen=new Set();
    for(const c of currentContracts(p))for(const r of live(c.payments)){if(r.date>asOf||seen.has(r.id))continue;seen.add(r.id);rows.push({...r,contract:c,contractId:c.id});}
    for(const r of live(p.fundPayments)){if(r.movedToContractId||r.date>asOf||seen.has(r.id))continue;seen.add(r.id);rows.push({...r,independent:true});}
    return rows;
  }
  function contractIds(c){const allocations=latest(c)?.allocations||[];return [...new Set((allocations.length?allocations.map(x=>x.cbsId):[c.cbsId]).filter(Boolean))];}
  function recordIds(r){const ids=r.allocations?.length?r.allocations.map(x=>x.cbsId):r.cbsId?[r.cbsId]:r.contract?contractIds(r.contract):[];return [...new Set(ids.filter(Boolean))];}
  function recordCost(r,ids){
    const allocated=(r.allocations||[]).filter(x=>ids.has(x.cbsId));if(allocated.length)return sum(allocated,'amount');
    if(r.cbsId&&ids.has(r.cbsId))return r.costAmount??null;
    const related=r.contract&&contractIds(r.contract);return related?.length===1&&ids.has(related[0])?r.costAmount??null:null;
  }
  function reviewFingerprint(p,id,asOf){const ids=itemSourceIds(p,id);return JSON.stringify({payments:sourcePayments(p,asOf).filter(x=>recordIds(x).some(key=>ids.has(key))).map(x=>({id:x.id,date:x.date,amount:x.amount,costAmount:x.costAmount,allocations:x.allocations})).sort((a,b)=>a.id.localeCompare(b.id)),openings:(p.executionOpeningBalances||[]).filter(x=>ids.has(x.cbsId))});}
  function reviewItemFunds(p,id,v){
    itemRef(p,id);const review={id:A.uid('fund-review'),cbsId:id,asOf:date(v.asOf,'대사 기준일'),sourcePath:required(v.sourcePath,'대사 근거'),fingerprint:reviewFingerprint(p,id,v.asOf),reviewedAt:A.today};
    return A.transaction(()=>{(p.fundItemReviews=p.fundItemReviews||[]).push(review);mutate(p,'fundItemReview',review.id,null,review,cbsName(p,id)+' 지급 누계가 확인되었습니다.','document','contracts');return review;});
  }
  function itemFunds(p,id,asOf=fundsAsOf(p)){
    const ids=itemSourceIds(p,id),contracts=currentContracts(p).filter(c=>contractIds(c).some(key=>ids.has(key))),payments=sourcePayments(p,asOf).filter(r=>recordIds(r).some(key=>ids.has(key))),openings=(p.executionOpeningBalances||[]).filter(o=>ids.has(o.cbsId)&&!o.replacedAt&&(!o.asOf||o.asOf<=asOf));
    const cutoff=key=>{const exact=openings.filter(o=>o.cbsId===key);if(exact.length)return exact.map(o=>o.asOf||'9999').sort().at(-1)||'';const node=(p.cbs||[]).find(x=>x.id===key),directManagement=node?.managementAccount||managed(p).some(x=>x.id===key);if(!directManagement)return'';const scope=itemSourceIds(p,key);return openings.filter(o=>scope.has(o.cbsId)).map(o=>o.asOf||'9999').sort().at(-1)||'';};
    let paidKnown=sum(openings,'paid'),paidUnknown=0,contractKnown=sum(openings,'contract'),contractUnknown=0,sourceConflict=false;
    for(const r of payments){const relevant=recordIds(r).filter(key=>ids.has(key)),allocs=(r.allocations||[]).filter(x=>ids.has(x.cbsId));if(allocs.length){for(const x of allocs){if(cutoff(x.cbsId)&&r.date<=cutoff(x.cbsId)){sourceConflict=true;continue;}paidKnown+=Number(x.amount);}continue;}const key=r.cbsId||relevant[0];if(cutoff(key)&&r.date<=cutoff(key)){sourceConflict=true;continue;}const cost=recordCost(r,ids);if(cost==null)paidUnknown++;else paidKnown+=cost;}
    for(const c of contracts){const r=revisionAt(c,asOf);if(!r){contractUnknown++;continue;}const tax=A.vat?.summaryFor(p,{kind:'contract',id:c.id,asOf}),allocs=(r.allocations||[]).filter(x=>ids.has(x.cbsId));if(tax?.record&&(tax.sourceDrift||tax.costAmount==null||r.allocations?.length&&allocationsTotal(r.allocations)!==tax.costAmount)){contractUnknown++;continue;}if(allocs.length){for(const x of allocs){if(cutoff(x.cbsId)){sourceConflict=true;continue;}contractKnown+=Number(x.amount);}continue;}const key=c.cbsId||contractIds(c)[0];if(cutoff(key)){sourceConflict=true;continue;}const cost=tax?.record?tax.costAmount:r.costAmount;if(cost==null)contractUnknown++;else contractKnown+=cost;}
    const reviews=(p.fundItemReviews||[]).filter(x=>x.cbsId===id&&x.asOf===asOf),review=reviews.at(-1),confirmed=!!review&&review.fingerprint===reviewFingerprint(p,id,asOf)||!openings.length&&!payments.some(x=>x.independent)&&contracts.length>0&&contracts.every(c=>paymentStatus(c).coverage==='confirmed'&&c.paymentCoverage?.asOf===asOf),coverage=confirmed?'confirmed':payments.length||openings.length?'partial':'unknown';
    const paidCost=paidUnknown?null:paidKnown||coverage==='confirmed'||openings.length?paidKnown:null,current=A.amount(p,id),cashRows=payments.filter(r=>{const keys=recordIds(r).filter(key=>ids.has(key));return !keys.some(key=>cutoff(key)&&r.date<=cutoff(key))}),cashUnknown=openings.length||cashRows.some(r=>!r.cbsId&&recordIds(r).some(key=>!ids.has(key)));
    return {id,current,contractAmount:contractUnknown?null:contractKnown,paidCost,paidKnown,cashPaid:cashUnknown?null:cashRows.length?sum(cashRows,'amount'):coverage==='confirmed'?0:null,remaining:current==null||paidCost==null||coverage!=='confirmed'||sourceConflict?null:current-paidCost,coverage,sourceConflict,openings,contracts,payments};
  }
  function moveItemPayment(p,payment,c,o){
    if(live(c.payments).some(x=>x.id===payment.id))throw Error('이미 연결된 지급 ID입니다.');
    const record={...clone(payment),obligationId:o?.id||'',allocations:payment.costAmount==null?[]:[{cbsId:payment.cbsId,amount:payment.costAmount}],origin:'item-payment'};
    delete record.movedToContractId;(c.payments=c.payments||[]).push(record);payment.movedToContractId=c.id;payment.linkedAt=A.today;c.paymentCoverage={...(c.paymentCoverage||{}),status:'partial'};return record;
  }
  function linkItemPayment(p,id,v){
    const payment=live(p.fundPayments).find(x=>x.id===id&&!x.movedToContractId),c=currentContracts(p).find(x=>x.id===v.contractId),o=c&&confirmedObligations(c).find(x=>x.id===v.obligationId);if(!payment||!c||v.obligationId&&!o)throw Error('지급과 연결할 계약·회차를 확인해 주세요.');if(!contractIds(c).some(key=>itemSourceIds(p,payment.cbsId).has(key)))throw Error('같은 사업비 항목의 계약을 선택해 주세요.');
    return A.transaction(()=>{const before={payment:clone(payment),contract:clone(c)},r=moveItemPayment(p,payment,c,o);mutate(p,'fundPaymentLink',id,before,{payment,contract:c},c.name+'에 기존 지급이 연결되었습니다.','document','contracts');return r;});
  }
  function libraryPath(kind,id,path){return '<span class="library-path-actions"><span class="library-origin-path" tabindex="0" title="'+A.esc(path||'미입력')+'">'+A.esc(path||'미입력')+'</span>'+(path?button('복사',kind==='contract'?'contract-copy-path':'document-copy',id):'')+'</span>';}
  function libraryRows(p){const query=String(A.ui.librarySearch??(A.ui.tabs.document==='documents'?A.ui.documentSearch:A.ui.contractSearch)??'').toLowerCase(),kind=A.ui.libraryKind||'all',rows=[...currentContracts(p).map(c=>({kind:'contract',id:c.id,record:c,date:latest(c).date||'',title:c.name,party:c.counterparty||'',path:latest(c).file||c.file||'',category:c.type||''})),...live(p.documents).map(d=>({kind:'document',id:d.id,record:d,date:d.date||'',title:d.title,party:[d.issuer,d.recipient].filter(Boolean).join(' / '),path:d.location||'',category:d.category||''}))];return rows.filter(x=>(kind==='all'||kind===x.kind)&&(!query||[x.title,x.party,x.path,x.category,x.record.number].join(' ').toLowerCase().includes(query))).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.title||'').localeCompare(String(b.title||''),'ko'));}
  function renderDocuments(p){
    const records=libraryRows(p),query=A.ui.librarySearch??(A.ui.tabs.document==='documents'?A.ui.documentSearch:A.ui.contractSearch)??'',kind=A.ui.libraryKind||'all',docs=records.filter(x=>x.kind==='document').map(x=>x.record),selected=(A.ui.documentSelectedFromVersion?live(p.documents):docs).find(d=>d.id===A.ui.selectedDocumentId)||docs[0];
    const controls='<div class="table-toolbar"><div class="table-toolbar-left"><input class="control" id="librarySearch" aria-label="계약·문서 검색" placeholder="계약·문서 검색" value="'+A.esc(query)+'"><label class="library-kind-label">구분 <select id="libraryKind" class="control" aria-label="계약·문서 구분">'+[['all','전체'],['contract','계약'],['document','문서']].map(([value,label])=>'<option value="'+value+'" '+(kind===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>'+A.btn('입력자료 확인','setup-records')+'</div><div class="table-toolbar-right">'+createButton('계약 추가','contract-add')+createButton('문서 추가','document-add')+'</div></div>';
    const rows=records.map(item=>{const x=item.record,contract=item.kind==='contract',r=contract?latest(x):null;return ['<span class="library-kind-text" title="'+A.esc(item.category)+'">'+(contract?'계약':'문서')+(item.category?' · '+A.esc(item.category):'')+'</span>','<span class="library-title-text" title="'+A.esc(item.title||'')+'">'+tableLink(item.title,contract?'contract-detail':'document-select',x.id)+'</span>','<span class="library-party-text" title="'+A.esc(item.party||'—')+'">'+(contract?inline(p,'contract',x.id,'counterparty',x.counterparty):A.esc(item.party||'—'))+'</span>',contract?inline(p,'contract',x.id,'date',r.date,'date'):A.esc(x.date||'—'),contract?inline(p,'contract',x.id,'total',r.total,'money'):'—',libraryPath(item.kind,x.id,item.path),'<span class="library-row-actions">'+button('수정',contract?'contract-edit':'document-edit',x.id)+button('삭제',contract?'contract-delete':'document-delete',x.id)+'</span>'];});
    const listing='<section class="document-list document-library"><h2 class="library-title">계약·문서</h2>'+controls+A.table(['구분','제목','상대방·발신/수신','일자','계약금액','원본 경로',''],rows,'dp-document-table library-table',{rowAttrs:index=>({'data-library-kind':records[index].kind,'data-library-id':records[index].id,'class':records[index].kind==='document'&&records[index].id===selected?.id&&A.ui.documentDetailOpen?'selected-row':'',...(records[index].kind==='document'?{'data-action':'document-select','data-id':records[index].id}:{}),'aria-selected':String(records[index].kind==='document'&&records[index].id===selected?.id&&!!A.ui.documentDetailOpen)})})+'</section>';
    let preview='<section id="document-detail-panel" class="document-preview" hidden aria-labelledby="document-detail-title"><h3 id="document-detail-title" tabindex="-1">문서 상세</h3></section>';
    if(A.ui.documentDetailOpen&&selected){const versions=live(p.documents).filter(d=>d.id===selected.id||(selected.versionGroup&&d.versionGroup===selected.versionGroup)).sort((a,b)=>String(b.revision).localeCompare(String(a.revision),undefined,{numeric:true}));const detail='<h3 id="document-detail-title" tabindex="-1">'+inline(p,'document',selected.id,'title',selected.title)+'</h3>'+A.table(['항목','내용'],[['문서번호',inline(p,'document',selected.id,'number',selected.number)],['구분',inline(p,'document',selected.id,'category',selected.category)],['발행일',inline(p,'document',selected.id,'date',selected.date,'date')],['발신',inline(p,'document',selected.id,'issuer',selected.issuer)],['수신',inline(p,'document',selected.id,'recipient',selected.recipient)],['원본 경로',inline(p,'document',selected.id,'location',selected.location)],['관련 업무',inline(p,'document',selected.id,'related',selected.related)]])+'<div class="document-version-box"><h3>버전 이력</h3><div class="document-version-list">'+versions.map(v=>'<div class="document-version-row">'+tableLink('v'+v.revision,'document-select',v.id,{version:true})+'<span>'+A.esc(v.date)+'</span><span>'+A.esc(v.status)+' '+(v.isCurrent?'· 최신본':'')+'</span></div>').join('')+'</div></div><div class="recovery-detail-actions">'+button('원본 경로 복사','document-copy',selected.id)+button('문서 수정','document-edit',selected.id)+button('새 버전','document-new-version',selected.id)+button('삭제','document-delete',selected.id)+'</div>';
      preview='<section id="document-detail-panel" class="document-preview" aria-labelledby="document-detail-title"><div class="dp-document-preview-head"><strong>문서 상세</strong>'+A.btn('닫기','document-detail-close',{},'text')+'</div><div class="recovery-document-detail">'+detail+'</div></section>';
    }
    return '<div data-document-library="unified" class="document-layout document-library-layout '+(A.ui.documentDetailOpen&&selected?'is-detail-open':'')+'">'+listing+preview+'</div>';
  }
  A.register('document',p=>'<div class="dp-documents">'+renderDocuments(p)+'</div>');
  function preserveDocumentScroll(){const wrap=document.querySelector('.document-list>.table-wrap');return {top:wrap?.scrollTop||0,left:wrap?.scrollLeft||0};}
  function restoreDocumentScroll(position){requestAnimationFrame(()=>{const wrap=document.querySelector('.document-list>.table-wrap');if(wrap){wrap.scrollTop=position.top;wrap.scrollLeft=position.left;}});}
  A.on('document-select',b=>{cancelDocumentSearch();const next=()=>{const pos=preserveDocumentScroll(),projectId=A.ui.projectId,id=b.dataset.id;A.ui.selectedDocumentId=id;A.ui.documentSelectedFromVersion=b.dataset.version==='true';if(!A.ui.documentSelectedFromVersion)A.ui.documentReturnId=id;A.ui.documentDetailOpen=true;A.render();restoreDocumentScroll(pos);requestAnimationFrame(()=>{if(A.ui.view==='document'&&A.ui.projectId===projectId&&A.ui.selectedDocumentId===id){const title=document.getElementById('document-detail-title');title?.scrollIntoView?.({block:'nearest',inline:'nearest'});title?.focus({preventScroll:true});}});};if(A.leaveDraft)A.leaveDraft(next);else next();});
  function closeDocument(){cancelDocumentSearch();const next=()=>{const pos=preserveDocumentScroll(),projectId=A.ui.projectId;A.ui.documentDetailOpen=false;A.ui.documentSelectedFromVersion=false;if(A.ui.documentReturnId)A.ui.selectedDocumentId=A.ui.documentReturnId;A.render();restoreDocumentScroll(pos);requestAnimationFrame(()=>{if(A.ui.view==='document'&&A.ui.projectId===projectId){const rows=[...document.querySelectorAll('[data-action="document-select"]')].filter(x=>x.tagName==='BUTTON'&&x.dataset.version!=='true'),target=rows.find(x=>x.dataset.id===A.ui.documentReturnId)||rows[0]||document.getElementById('librarySearch');target?.focus({preventScroll:true});}});};if(A.leaveDraft)A.leaveDraft(next);else next();}
  A.on('document-detail-close',closeDocument);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.defaultPrevented&&A.ui.view==='document'&&A.ui.documentDetailOpen&&!document.getElementById('app-dialog')?.open&&!e.target.closest?.('input,textarea,select'))closeDocument();});
  A.on('document-new-version',b=>{const p=A.current(),d=live(p.documents).find(x=>x.id===b.dataset.id);if(!d)return;A.form('문서 새 버전',A.field('revision','버전',String(Number(d.revision||0)+1))+A.field('date','발행일',A.today,'date')+A.field('location','원본 경로',d.location),v=>{const group=d.versionGroup||('document-group-'+d.id),rows=live(p.documents).filter(x=>x.versionGroup===group||x.id===d.id);if(rows.some(x=>String(x.revision)===String(v.revision)))throw Error('이미 사용하는 버전입니다.');const before=clone(p.documents);const x={...clone(d),id:A.uid('document'),revision:required(v.revision,'버전'),date:date(v.date),location:required(v.location,'원본 경로'),versionGroup:group,isCurrent:true};rows.forEach(y=>{y.versionGroup=group;y.isCurrent=false;});p.documents.push(x);mutate(p,'document-version',x.id,before,p.documents,x.title+' 새 버전이 등록되었습니다.','document','documents');A.ui.selectedDocumentId=x.id;},'저장',{draftContext:'document-version:'+d.id});});
  let searchTimer,documentSearchToken=0;
  function cancelDocumentSearch(){clearTimeout(searchTimer);searchTimer=null;documentSearchToken++;}
  function documentSearchContext(){return JSON.stringify({view:A.ui.view,project:A.ui.projectId,tab:A.ui.tabs.document,generation:A.renderGeneration||0,contractSearch:A.ui.contractSearch||'',documentSearch:A.ui.documentSearch||'',librarySearch:A.ui.librarySearch??'',libraryKind:A.ui.libraryKind||'all',selected:A.ui.selectedDocumentId||'',detail:!!A.ui.documentDetailOpen,dialog:!!document.getElementById('app-dialog')?.open});}
  function queueDocumentSearch(el){const fields={contractSearch:'contractSearch',documentSearch:'documentSearch',librarySearch:'librarySearch'};if(A.ui.view!=='document'||!fields[el.id])return;cancelDocumentSearch();const id=el.id,value=el.value,start=el.selectionStart,token=documentSearchToken,context=documentSearchContext();searchTimer=setTimeout(()=>{if(token!==documentSearchToken||context!==documentSearchContext()||!document.getElementById(id))return;cancelDocumentSearch();A.ui[fields[id]]=value;if(id==='librarySearch'){A.ui.contractSearch=value;A.ui.documentSearch=value;}if(id!=='contractSearch')A.ui.documentSelectedFromVersion=false;A.render();const next=document.getElementById(id);if(next){next.focus();next.setSelectionRange?.(start,start);}},140);}
  document.addEventListener('change',e=>{if(e.target.id!=='libraryKind')return;const value=e.target.value,previous=A.ui.libraryKind||'all';cancelDocumentSearch();const applied=A.leaveDraft(()=>{A.ui.libraryKind=['all','contract','document'].includes(value)?value:'all';if(value==='contract')A.ui.documentDetailOpen=false;A.persistUI?.();A.render();});if(!applied)e.target.value=previous;});
  document.addEventListener('input',e=>{if(!e.isComposing)queueDocumentSearch(e.target);});
  document.addEventListener('compositionend',e=>queueDocumentSearch(e.target));
  function documentForm(b) {
    const p = A.current(), isEdit=b.dataset.action==='document-edit',d = live(p.documents).find(x => x.id === b.dataset.id);if(isEdit&&!d)return A.toast('수정할 문서를 찾을 수 없습니다.');
    A.form(d ? '문서 수정' : '문서 추가', A.field('title', '문서명', d?.title || '') + A.field('category', '분류', d?.category || '일반문서', 'select', ['계약서', '공문', '인허가', '보고서', '일반문서']) + A.field('number', '문서번호', d?.number || '') + A.field('revision', '개정차수', d?.revision || '1') + A.field('date', '작성일', d?.date || A.today, 'date') + A.field('status', '상태', d?.status || '작성', 'select', ['작성', '확정', '체결', '대체', '종료']) + A.field('location', '공용폴더·원본 경로', d?.location || '') + A.field('related', '관련 내용', d?.related || '') + A.field('issuer', '발신자', d?.issuer || '') + A.field('recipient', '수신자', d?.recipient || ''), v => {
      if(d&&live(p.documents).find(row=>row.id===d.id)!==d)throw Error('수정할 문서를 찾을 수 없습니다.');
      const before = d ? clone(d) : null, x = { ...v, id: d?.id || A.uid('document'), title: required(v.title, '문서명'), date: date(v.date), location: required(v.location, '원본 경로') };
      if (d) Object.assign(d, x); else p.documents.push(x); mutate(p, 'document', x.id, before, x, x.title + ' 문서가 저장되었습니다.', 'document', 'documents');
    },'저장',{draftContext:'document:'+(d?.id||'new')});
  }
  A.on('document-add', documentForm); A.on('document-edit', documentForm);
  A.on('document-copy', b => { const d = A.current().documents.find(x => x.id === b.dataset.id); if (d) A.copy(d.location); });
  A.on('document-delete', b => { const p = A.current(), d = p.documents.find(x => x.id === b.dataset.id); if (d) A.confirmDelete(d.title, () => { const before = clone(d); d.deletedAt = A.today; A.audit('delete', 'document', d.id, before, d, d.title + ' 문서가 삭제되었습니다.', { view: 'document', tab: 'documents', projectId: p.id }); A.toast('문서를 삭제했습니다.', () => { const deleted = clone(d); d.deletedAt = null; A.audit('restore', 'document', d.id, deleted, d, d.title + ' 문서가 복구되었습니다.'); A.render(); }); }); });
  function loanChoices(value,options){return [{value:'',label:'—'},...options.map(value=>({value,label:value})),...(value!=null&&value!==''&&!options.includes(value)?[{value,label:String(value)}]:[])];}
  function loanForm(l) {
    return A.field('institution','금융기관',l?.institution||'')+A.field('type','금융 유형',l?l.type??'':'본PF','select',loanChoices(l?.type,['브릿지론','본PF','기타 대출']))+A.field('rank','상환순위',l?l.rank??'':'선순위','select',loanChoices(l?.rank,['선순위','중순위','후순위']))+A.field('commitment','약정액 (원)',loanEditorNumber(l?.commitment,amount),'number')+A.field('executed','누적 실행액 (원)',loanEditorNumber(l?.executed,amount),'number')+A.field('balance','대출잔액 (원)',loanEditorNumber(l?.balance,amount),'number')+A.field('interestRate','금리 (연 %)',loanEditorNumber(l?.interestRate,loanPercent),'number')+A.field('upfrontFeeRate','선취·취급 수수료 (%)',loanEditorNumber(l?.upfrontFeeRate,loanPercent),'number')+A.field('advisoryFeeRate','금융자문 수수료 (%)',loanEditorNumber(l?.advisoryFeeRate,loanPercent),'number')+A.field('allIn','ALL-IN (연 %)',loanEditorNumber(l?.allIn,loanPercent),'number')+A.field('allInAdvisoryBasis','ALL-IN 기준',l?.allInAdvisoryBasis||'','select',[{value:'',label:'선택'},{value:'included',label:'금융자문수수료 포함'},{value:'excluded',label:'금융자문수수료 제외'}])+A.field('ltv','LTV (%)',loanEditorNumber(l?.ltv,loanRatio),'number')+A.field('ltc','LTC (%)',loanEditorNumber(l?.ltc,loanRatio),'number')+A.field('interestTerms','금리·이자지급 조건',l?.interestTerms||'','textarea')+A.field('otherFees','그 밖의 수수료',l?.otherFees||'','textarea')+A.field('start','약정 시작일',l?.start||'','date')+A.field('maturity','최종 만기일',l?.finalMaturity||l?.maturity||'','date')+A.field('repaymentTerms','상환 조건',l?.repaymentTerms||'','textarea')+A.field('collateral','담보·신용보강',l?.collateral||'','textarea')+A.field('note','변경 사유','','textarea');
  }
  const loanPricingFields=['interestRate','upfrontFeeRate','advisoryFeeRate','allIn'];
  const loanRatioFields=['ltv','ltc'];
  const financeMoney=value=>initialLoanNumber(value)==null?'—':A.money(value);
  const financeTotal=(rows,key)=>!rows.length||rows.some(row=>initialLoanNumber(row[key])==null||Number(row[key])<0)?null:sum(rows,key);
  const loanPricingLabels={interestRate:'금리',upfrontFeeRate:'선취·취급 수수료',advisoryFeeRate:'금융자문 수수료',allIn:'ALL-IN'};
  const loanBasisLabel=value=>value==='included'?'금융자문수수료 포함':value==='excluded'?'금융자문수수료 제외':'—';
  const loanKnownPercent=value=>initialLoanNumber(value)!=null&&Number(value)>=0&&Number(value)<=100;
  const loanRateText=(value,isRatio=false)=>(isRatio?initialLoanNumber(value)!=null&&Number(value)>=0:loanKnownPercent(value))?A.num(Number(value),2)+'%':'—';
  const loanUnchangedInput=(value,old)=>value==null||String(value).trim()===''?true:String(value)===String(old)||typeof old==='number'&&Number.isFinite(old)&&Number(value)===old;
  function loanSignature(value){const encode=v=>v===null?['null']:Array.isArray(v)?['array',v.map(encode)]:v&&typeof v==='object'?['object',Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>[k,encode(v[k])])]:[typeof v,typeof v==='number'?String(v):v];return JSON.stringify(encode(value));}
  function loanTarget(project,id){if(typeof id!=='string'||!id||id.trim()!==id)return null;const found=live(project?.loans).filter(row=>row.id===id);return found.length===1?found[0]:null;}
  function loanPercent(value,label){if(value==null||String(value).trim()==='')return null;const n=initialLoanNumber(value);if(n==null||n<0||n>100)throw Error(label+'는 0~100%로 입력해 주세요.');return n;}
  function loanRatio(value,label){if(value==null||String(value).trim()==='')return null;const n=initialLoanNumber(value);if(n==null||n<0)throw Error(label+'는 0 이상의 비율로 입력해 주세요.');return n;}
  function loanInput(value,key,label,existing,parse){if(!existing)return parse(value,label);const old=existing[key],blank=value==null||String(value).trim()==='';if(blank){if(old==null||old===''||!['number','string'].includes(typeof old))return old;try{parse(old,label);}catch{return old;}return parse(value,label);}if(String(value)===String(old))return old;try{const next=parse(value,label);if(next===parse(old,label))return old;return next;}catch{return parse(value,label);}}
  function loanEditorNumber(value,parse){if(initialLoanNumber(value)==null)return '';try{return parse(value,'입력값');}catch{return '';}}
  function comparableLoan(row){const next=clone(row);for(const key of ['commitment','executed','balance',...loanPricingFields,...loanRatioFields,'allInAdvisoryBasis'])next[key]=next[key]??null;for(const key of ['interestTerms','otherFees','repaymentTerms'])next[key]=next[key]||'';return loanSignature(next);}
  function loanValues(v,existing=null) {
    const commitment=loanInput(v.commitment,'commitment','약정액',existing,amount),executed=loanInput(v.executed,'executed','누적 실행액',existing,amount),balance=loanInput(v.balance,'balance','잔액',existing,amount),pricing=Object.fromEntries(loanPricingFields.map(key=>[key,loanInput(v[key],key,loanPricingLabels[key],existing,loanPercent)]));let basis=v.allInAdvisoryBasis||null;
    if(existing&&!['included','excluded'].includes(existing.allInAdvisoryBasis)&&loanUnchangedInput(v.allInAdvisoryBasis,existing.allInAdvisoryBasis))basis=existing.allInAdvisoryBasis??null;
    if((!existing||commitment!==existing.commitment||balance!==existing.balance)&&typeof commitment==='number'&&typeof balance==='number'&&balance>commitment)throw Error('잔액이 약정액보다 큽니다. 약정액 또는 잔액을 확인해 주세요.');
    if(basis&&!['included','excluded'].includes(basis)&&basis!==existing?.allInAdvisoryBasis)throw Error('ALL-IN 기준을 선택해 주세요.');
    if(pricing.allIn!=null&&!['included','excluded'].includes(basis)&&(!existing||existing.allIn!==pricing.allIn))throw A.inputError({allInAdvisoryBasis:'ALL-IN 기준을 선택해 주세요.'});
    const oldMaturity=existing&&(existing.finalMaturity||existing.maturity),start=loanInput(v.start,'start','약정 시작일',existing,date),maturity=loanInput(v.maturity,'maturity','최종 만기일',existing?{maturity:oldMaturity}:null,date);if((!existing||start!==existing.start||maturity!==oldMaturity)&&/^\d{4}-\d{2}-\d{2}$/.test(start||'')&&/^\d{4}-\d{2}-\d{2}$/.test(maturity||'')&&maturity<start)throw Error('최종 만기일은 약정 시작일보다 빠를 수 없습니다.');
    const sameMaturity=existing&&maturity===oldMaturity,choice=key=>existing&&String(v[key]??'')===String(existing[key]??'')?existing[key]:v[key];return {institution:required(v.institution,'금융기관'),type:choice('type'),rank:choice('rank'),commitment,executed,balance,...pricing,ltv:loanInput(v.ltv,'ltv','LTV',existing,loanRatio),ltc:loanInput(v.ltc,'ltc','LTC',existing,loanRatio),allInAdvisoryBasis:basis,start,maturity:sameMaturity?existing.maturity:maturity,finalMaturity:sameMaturity?existing.finalMaturity:maturity,collateral:String(v.collateral||''),interestTerms:String(v.interestTerms||''),otherFees:String(v.otherFees||''),repaymentTerms:String(v.repaymentTerms||''),...(Object.hasOwn(v,'sourcePath')?{sourcePath:v.sourcePath}: {})};
  }
  function editLoan(b) {
    const p=A.current(),isEdit=b.dataset.action==='loan-edit',l=isEdit?loanTarget(p,b.dataset.id):null,projectId=p.id,loanId=l?.id,opened=l?loanSignature(l):null;if(isEdit&&!l)return A.toast('수정할 대출을 찾을 수 없습니다.');
    A.form(l ? '대출 정보 수정' : '대출 추가', loanForm(l), v => {
      const current=A.state.projects.find(row=>row.id===projectId&&!row.deletedAt),target=loanId?loanTarget(current,loanId):null;
      if(A.current()?.id!==projectId||!current||loanId&&(!target||loanSignature(target)!==opened))throw A.inputError({institution:'사업 또는 대출 정보가 변경되었습니다. 입력값을 확인한 후 다시 열어 주세요.'});
      const before=target?clone(target):null,x={...(target||{}),id:loanId||A.uid('loan'),...loanValues(v,target)};if(target&&comparableLoan(target)===comparableLoan(x))return target;
      if(target)Object.assign(target,x);else current.loans.push(x);
      current.loanEvents.push({id:A.uid('loan-event'),loanId:x.id,date:A.today,kind:target?'약정 변경':'약정 추가',before,after:clone(x),note:v.note||''});mutate(current,'loan',x.id,before,x,x.institution+' 대주 약정이 저장되었습니다.','finance','loans');return x;
    },'저장',{...A.formParentOptions(()=>{if(A.current()?.id!==projectId)return A.closeModal();showLoanDetail(projectId,loanId,{closeMissing:true});}),draftContext:'loan:'+projectId+':'+(loanId||'new')});
  }
  A.on('loan-add', editLoan); A.on('loan-edit', editLoan);
  function validateSellDown(donor, commitment, executed, balance) {
    [commitment, executed, balance].forEach(x => amount(x, '이전 금액'));
    if (!commitment || commitment > donor.commitment || executed > donor.executed || balance > donor.balance || balance > commitment) throw Error('이전 금액이 원 대주의 약정·실행·잔액 범위를 벗어났습니다.');
    if (donor.balance - balance > donor.commitment - commitment) throw Error('이전 후 원 대주 잔액이 약정액보다 큽니다. 이전 잔액을 확인해 주세요.');
    return { commitment: donor.commitment - commitment, executed: donor.executed - executed, balance: donor.balance - balance };
  }
  A.on('loan-selldown', b => {
    const p = A.current(), l = loanTarget(p,b.dataset.id); if (!l) return;
    const projectId=p.id,loanId=l.id,openedLoan=loanSignature(l);
    const parentScroll=document.getElementById('app-dialog')?.querySelector?.('.dialog-body')?.scrollTop||0,options=A.formParentOptions(()=>{if(A.current()?.id!==p.id)return A.closeModal();showLoanDetail(p.id,l.id,{closeMissing:true});queueMicrotask(()=>{const body=document.getElementById('app-dialog')?.querySelector?.('.dialog-body');if(body)body.scrollTop=parentScroll;});});
    A.form('대주 셀다운 기록', A.field('institution', '양수 금융기관', '') + A.field('date', '양도 기준일', '', 'date') + A.field('commitment', '이전 약정액 (원)', '', 'number') + A.field('executed', '이전 누적 실행액 (원)', '', 'number') + A.field('balance', '이전 대출잔액 (원)', '', 'number') + A.field('note', '비고', '', 'textarea'), v => {
      const p=A.state.projects.find(x=>x.id===projectId&&!x.deletedAt),l=loanTarget(p,loanId);
      if(!l||A.current()?.id!==projectId||loanSignature(l)!==openedLoan)throw A.inputError({institution:'대출 정보가 변경되었거나 삭제되어 저장하지 않았습니다. 입력값을 확인한 후 다시 열어 주세요.'});
      const commitment = amount(v.commitment), executed = amount(v.executed), balance = amount(v.balance), remains = validateSellDown(l, commitment, executed, balance), before = clone(l), institution = required(v.institution, '양수 금융기관'), sourcePath = String(v.sourcePath||''); date(v.date);
      if (institution === l.institution) throw Error('양도 대주와 다른 금융기관을 입력해 주세요.');
      const receiver = { ...clone(l), id: A.uid('loan'), institution, commitment, executed, balance, sourcePath, transferredFrom: l.id };
      Object.assign(l, remains); p.loans.push(receiver);
      const event = { id: A.uid('loan-event'), loanId: l.id, toLoanId: receiver.id, date: v.date, kind: '셀다운', before, after: clone(l), receiver: clone(receiver), commitment, executed, balance, sourcePath, note: v.note }; p.loanEvents.push(event); A.audit('transfer', 'loan', event.id, before, { donor: l, receiver }, l.institution + '에서 ' + institution + '으로 대주 지분이 이전되었습니다.', { view: 'finance', tab: 'history', projectId: p.id });
    },'저장',{...options,draftContext:'loan-selldown:'+p.id+':'+l.id});
  });
  A.on('loan-quarter', b => {
    const p = A.current(), l = loanTarget(p,b.dataset.id); if (!l) return;
    const openedLoan = loanSignature(l);
    A.form('대주별 분기 기준값 기록', A.field('asOf', '분기 기준일', '', 'date') + A.field('commitment', '약정액 (원)', l.commitment, 'number') + A.field('executed', '누적 실행액 (원)', l.executed, 'number') + A.field('balance', '잔액 (원)', l.balance, 'number'), v => {
      const current = A.state.projects.find(row => row.id === p.id && !row.deletedAt), loan = loanTarget(current,l.id);
      if (A.current()?.id!==p.id||!loan || loanSignature(loan) !== openedLoan) throw A.inputError({asOf:'대출 정보가 변경되었거나 삭제되어 저장하지 않았습니다. 입력값을 확인한 후 다시 열어 주세요.'});
      const asOf = date(v.asOf); if (!['03-31', '06-30', '09-30', '12-31'].includes(asOf.slice(5))) throw Error('분기 말일(3/31, 6/30, 9/30, 12/31)을 선택해 주세요.');
      const x = { id: A.uid('loan-quarter'), loanId: loan.id, asOf, commitment: amount(v.commitment), executed: amount(v.executed), balance: amount(v.balance), allIn: loan.allIn, maturity: loan.finalMaturity || loan.maturity, source: String(v.source||''),loan:clone(loan) };
      if (x.balance > x.commitment) throw Error('잔액이 약정액보다 큽니다.');
      const old = current.loanQuarterlyRecords.find(q => q.loanId === loan.id && q.asOf === asOf && !q.supersededAt), before = old ? clone(old) : null; if (old) old.supersededAt = A.today;
      current.loanQuarterlyRecords.push(x); mutate(current, 'loan-quarter', x.id, before, x, loan.institution + ' ' + asOf + ' 분기값이 기록되었습니다.', 'finance', 'quarters');
    },'저장',{...A.formParentOptions(()=>showLoanDetail(p.id,l.id,{closeMissing:true})),draftContext:'loan-quarter:'+p.id+':'+l.id});
  });
  const loanClosed=l=>['commitment','balance'].every(key=>l[key]!=null&&String(l[key]).trim()!==''&&Number.isSafeInteger(Number(l[key]))&&Number(l[key])===0);
  A.on('loan-delete',b=>{
    const p=A.current(),l=loanTarget(p,b.dataset.id);if(!l)return;
    if(!loanClosed(l))return A.toast('약정액과 대출잔액이 모두 0원으로 확인된 대출만 삭제할 수 있습니다.');
    const projectId=p.id,loanId=l.id,opened=loanSignature(l);
    A.confirmDelete(l.institution,()=>{
      const current=A.state.projects.find(row=>row.id===projectId&&!row.deletedAt&&row.active!==false),target=loanTarget(current,loanId);
      if(A.current()?.id!==projectId||!target||loanSignature(target)!==opened||!loanClosed(target))throw Error('사업 또는 대출 정보가 변경되어 삭제하지 않았습니다. 대출을 다시 확인해 주세요.');
      const before=clone(target);target.deletedAt=A.today;const deleted=loanSignature(target);
      current.loanEvents.push({id:A.uid('loan-event'),loanId,date:A.today,kind:'대주 삭제',before,after:clone(target),note:'약정·잔액 종료 후 삭제'});
      A.audit('delete','loan',loanId,before,target,target.institution+' 대주가 삭제되었습니다.',{view:'finance',tab:'loans',projectId});
      A.toast('대주를 삭제했습니다.',()=>A.transaction(()=>{
        const project=A.state.projects.find(row=>row.id===projectId&&!row.deletedAt&&row.active!==false),matches=(project?.loans||[]).filter(row=>row.id===loanId),row=matches.length===1?matches[0]:null;
        if(A.current()?.id!==projectId||!row?.deletedAt||loanSignature(row)!==deleted)throw Error('사업 또는 대출 정보가 변경되어 복구하지 않았습니다. 대출을 다시 확인해 주세요.');
        const gone=clone(row);row.deletedAt=null;project.loanEvents.push({id:A.uid('loan-event'),loanId,date:A.today,kind:'대주 복구',before:gone,after:clone(row),note:'삭제 실행취소'});
        A.audit('restore','loan',loanId,gone,row,row.institution+' 대주가 복구되었습니다.',{view:'finance',tab:'loans',projectId});A.render();
      }));
    },A.formParentOptions(()=>{if(A.current()?.id!==projectId||!loanTarget(A.state.projects.find(row=>row.id===projectId&&!row.deletedAt&&row.active!==false),loanId))return A.closeModal();showLoanDetail(projectId,loanId,{closeMissing:true});}));
  });
  function financeLoansAsOf(p, asOf) {
    date(asOf, '보고 기준일');
    const candidates = [];
    (p.loanQuarterlyRecords || []).filter(q => q.asOf && q.asOf <= asOf && !q.supersededAt).forEach((q, i) => {
      const original = q.loan || (p.loanEvents || []).find(e => e.loanId === q.loanId && e.before)?.before || (p.loans || []).find(l => l.id === q.loanId);
      if (original) candidates.push({ id: q.loanId, date: q.asOf, order: i, priority: 2, loan: { ...clone(original),...(!q.loan?Object.fromEntries([...loanPricingFields.filter(key=>key!=='allIn'),...loanRatioFields,'allInAdvisoryBasis','interestTerms','otherFees','repaymentTerms'].map(key=>[key,Object.hasOwn(q,key)?q[key]:null])):{}), commitment: q.commitment, executed: q.executed, balance: q.balance, allIn: q.allIn, maturity: q.maturity, finalMaturity: q.maturity, financialAsOf: q.asOf, financialSource: q.source } });
    });
    (p.loanQuarterSnapshots || []).filter(q => q.asOf && q.asOf <= asOf && !q.supersededAt).forEach((q, i) => (q.loans || []).forEach(l => candidates.push({ id: l.id, date: q.asOf, order: i, priority: 2, loan: { ...clone(l), financialAsOf: q.asOf } })));
    (p.loanEvents || []).filter(e => e.date && e.date <= asOf).forEach((e, i) => {
      if (e.after) candidates.push({ id: e.loanId, date: e.date, order: i, priority: 1, loan: { ...clone(e.after), financialAsOf: e.date, financialSource: e.sourcePath || e.after.sourcePath || e.kind } });
      if (e.receiver) candidates.push({ id: e.toLoanId || e.receiver.id, date: e.date, order: i, priority: 1, loan: { ...clone(e.receiver), financialAsOf: e.date, financialSource: e.sourcePath || e.kind } });
    });
    if (!p.loanQuarterlyRecords?.length && !p.loanQuarterSnapshots?.length && p.asOf && p.asOf <= asOf) (p.loans || []).forEach(l => {
      const born = (p.loanEvents || []).find(e => (e.loanId === l.id && !e.before) || e.toLoanId === l.id);
      if (born && born.date > asOf) return;
      const original = (p.loanEvents || []).find(e => e.loanId === l.id && e.before)?.before || l;
      candidates.push({ id: l.id, date: p.asOf, order: 0, priority: 0, loan: { ...clone(original), financialAsOf: p.asOf } });
    });
    candidates.sort((a, b) => a.date.localeCompare(b.date) || a.priority - b.priority || a.order - b.order);
    const byId = new Map(); candidates.forEach(x => byId.set(x.id, x.loan));
    return [...byId.values()].filter(l => (!l.endedAt || l.endedAt > asOf) && (!l.deletedAt || l.deletedAt > asOf));
  }
  function hasCbsReferences(p, ids) {
    const wanted = new Set(ids), contains = rows => (rows || []).some(x => wanted.has(x.cbsId));
    return currentContracts(p).some(c => wanted.has(c.cbsId)||(c.revisions || []).some(r => contains(r.allocations)) || live(c.certifications).some(x => contains(x.allocations)) || live(c.payments).some(x => wanted.has(x.cbsId)||contains(x.allocations))||live(c.obligations).some(x=>wanted.has(x.cbsId)||contains(x.allocations))) || (p.executionOpeningBalances || []).some(x => wanted.has(x.cbsId))||[...live(p.fundForecasts),...live(p.fundPayments)].some(x=>wanted.has(x.cbsId));
  }
  function seedDemo(p) {
    if (p.id !== 'SAMPLE01') throw Error('가상 계약은 독립 SAMPLE01 프로젝트에만 생성할 수 있습니다.');
    const id = 'demo-contract-SAMPLE01';
    const existing = (p.contracts || []).find(c => c.id === id); if (existing) return existing;
    const leaves = A.leaves(p), direct = leaves.filter(x => String(x.code || '').startsWith('2'));
    const selected = (direct.length >= 2 ? direct : leaves).slice(0, 2);
    if (selected.length < 2) throw Error('가상 계약 배부를 위한 CBS 최하위 항목 2개가 필요합니다.');
    const registry = A.state.companyRegistry || A.state.companies || [];
    let company = registry.find(x => x.id === 'company-demo-construction' && !x.deletedAt) || registry.find(x => (x.sample === true || /가상|샘플/.test(x.name || '')) && !x.deletedAt);
    if (!company) {
      company = { id: 'company-demo-construction', name: '가상 샘플건설', aliases: [], category: '시공사', region: '샘플', sourceMappings: [], manual: true, sample: true, createdAt: A.today, deletedAt: null };
      registry.push(company); A.state.companyRegistry = registry; A.state.companies = registry;
    }
    const cbs = [selected[0].id, selected[1].id], path = '샘플공용폴더/계약/SAMPLE01_가상공사계약.pdf';
    const c = { id, name: '가상 공사계약 · 집행 예시', counterparty: company.name, companyId: company.id, type: '도급공사', date: '2026-09-01', period: '2026.09–2027.03', file: path, proposalNumber: '', status: '체결', sample: true,
      revisions: [{ id: 'demo-contract-rev-1', revision: 1, date: '2026-09-01', total: 1100000000, net: 1000000000, vat: 100000000, costAmount: 1000000000, taxStatus: '확인', allocations: [{ cbsId: cbs[0], amount: 600000000 }, { cbsId: cbs[1], amount: 400000000 }], file: path, note: '기능 확인용 가상 계약. 기존 프로젝트 금액과 무관합니다.' }],
      certifications: [],
      obligations: [
        { id: 'demo-obligation-advance', label: '선급금', kind: '선급금', dueDate: '2026-09-15', plannedAmount: 400000000, confirmedAmount: 400000000, costAmount:363636364,allocations:[{cbsId:cbs[0],amount:218181818},{cbsId:cbs[1],amount:145454546}], ownAmount: 100000000, debtAmount: 300000000, sourcePath: path, note: '기성이 없어도 선급금을 지급한 예시' },
        { id: 'demo-obligation-progress', label: '1차 기성금', kind: '기성금', dueDate: '2026-10-05', plannedAmount: 400000000, confirmedAmount: null, ownAmount: null, debtAmount: null, sourcePath: path, note: '기성 확인 후 지급의무 확정' },
        { id: 'demo-obligation-final', label: '잔금', kind: '잔금', dueDate: '2026-11-20', plannedAmount: 300000000, confirmedAmount: null, ownAmount: null, debtAmount: null, sourcePath: path, note: '공사 완료 후 지급 예정' }
      ],
      payments: [{ id: 'demo-payment-1', obligationId: 'demo-obligation-advance', date: '2026-09-08', amount: 200000000, costAmount: 181818182, allocations: [{ cbsId: cbs[0], amount: 109090909 }, { cbsId: cbs[1], amount: 72727273 }], proposalNumber: '', sourcePath: '샘플공용폴더/지급/SAMPLE01_선급금1차.pdf', note: '선급금 4억원 중 2억원 부분지급 · VAT 포함 출금액' }]
    };
    p.contracts = p.contracts || []; p.contracts.push(c);
    return c;
  }
  A.initializers.push(state => (state.projects || []).forEach(p => {
    p.equities = p.equities || []; p.guarantees = p.guarantees || []; p.reportParticipants = p.reportParticipants || {}; p.reportParticipants.guarantors = p.reportParticipants.guarantors || [];
    p.reportParticipants.guarantors.forEach((x, i) => { if (!x.id) x.id = p.id + '-guarantor-' + i; });
  }));
  A.financeEquities = p => {
    const rows = live(p.equities), total = sum(rows, 'amount');
    return rows.map(x => ({ ...clone(x), ratio: total ? x.amount / total * 100 : 0 }));
  };
  function otherList(p, kind) { return kind === 'guarantors' ? p.reportParticipants.guarantors : p[kind]; }
  function captureFinancialSource(p,kind,beforeRows){const path=kind==='equities'?'equities':kind==='guarantors'?'reportParticipants.guarantors':null;if(path)A.report?.captureSource?.(p,path,beforeRows);}
  function editFinancialOther(b) {
    const p = A.current(), kind = b.dataset.kind;
    if (!['equities', 'guarantees', 'guarantors'].includes(kind)) return;
    const rows = otherList(p, kind), old = live(rows).find(x => x.id === b.dataset.id), isEdit=b.dataset.action==='financial-other-edit',isEquity = kind === 'equities', isReport = kind === 'guarantors',targetLabel=isEquity?'출자자':isReport?'보증기관':'담보·보증';if(isEdit&&!old)return A.toast('수정할 '+targetLabel+' 정보를 찾을 수 없습니다.');
    const fields = isEquity ? A.field('company', '출자자', old?.company || '') + A.field('registration', '사업자·법인 등록번호', old?.registration || '') + A.field('amount', '출자금액 (원)', old?.amount ?? '', 'number') + A.field('purpose', '출자 목적·역할', old?.purpose || '') + A.field('sourcePath', '근거자료 경로', old?.sourcePath || '') : isReport ? A.field('name', '보고 대상 보증기관', old?.name || '') + A.field('type', '보증 유형', old?.type || 'PF보증', 'select', ['PF보증', '분양보증', '기타']) + A.field('amount', '보증금액 (원)', old?.amount ?? '', 'number') + A.field('scope', '보증 범위', old?.scope || '') + A.field('otherType', '기타 유형 상세', old?.otherType || '') + A.field('sourcePath', '근거자료 경로', old?.sourcePath || '') : A.field('category', '담보·신용보강 구분', old?.category || '') + A.field('provider', '제공자', old?.provider || '') + A.field('amount', '담보·보증금액 (원)', old?.amount ?? '', 'number') + A.field('detail', '조건·범위', old?.detail || '', 'textarea') + A.field('expiry', '만료일', old?.expiry || '', 'date') + A.field('sourcePath', '근거자료 경로', old?.sourcePath || '');
    A.form((isEquity ? '출자자' : isReport ? '보증기관' : '담보·보증') + (old ? ' 수정' : ' 추가'), fields, v => {
      if(old&&live(rows).find(row=>row.id===old.id)!==old)throw Error('수정할 '+targetLabel+' 정보를 찾을 수 없습니다.');
      const beforeRows=clone(rows),before = old ? clone(old) : null, row = { ...v, id: old?.id || A.uid(kind), amount: amount(v.amount, '금액') };
      if (isEquity) row.company = required(v.company, '출자자'); else if (isReport) row.name = required(v.name, '보증기관'); else { row.provider = required(v.provider, '제공자'); row.category = required(v.category, '구분'); row.expiry = date(v.expiry, '만료일', true); }
      if (old) Object.assign(old, row); else rows.push(row);
      captureFinancialSource(p,kind,beforeRows);
      mutate(p, kind, row.id, before, row, (row.company || row.name || row.provider) + ' ' + (isEquity ? '출자' : '보증') + ' 정보가 저장되었습니다.', 'finance', 'equity-guarantees');
    });
  }
  A.on('financial-other-add', editFinancialOther); A.on('financial-other-edit', editFinancialOther);
  A.on('financial-other-delete', b => {
    const p = A.current(), kind = b.dataset.kind; if (!['equities', 'guarantees', 'guarantors'].includes(kind)) return;
    const row = live(otherList(p, kind)).find(x => x.id === b.dataset.id); if (!row) return;
    const title = row.company || row.name || row.provider;
    A.confirmDelete(title, () => { const beforeRows=clone(otherList(p,kind)),before = clone(row); row.deletedAt = A.today;captureFinancialSource(p,kind,beforeRows); A.audit('delete', kind, row.id, before, row, title + ' 정보가 삭제되었습니다.', { view: 'finance', tab: 'equity-guarantees', projectId: p.id }); A.toast('정보를 삭제했습니다.', () => {A.transaction(()=>{const beforeRows=clone(otherList(p,kind)),gone = clone(row); row.deletedAt = null;captureFinancialSource(p,kind,beforeRows); A.audit('restore', kind, row.id, gone, row, title + ' 정보가 복구되었습니다.');}); A.render(); }); });
  });
  function renderEquityGuarantees(p) {
    const tools = (kind, id) => button('수정', 'financial-other-edit', id, { kind }) + button('삭제', 'financial-other-delete', id, { kind });
    return panelTable('출자자',['회사명','사업자등록번호','출자금액','지분율','참여목적',''],A.financeEquities(p).map(x=>[inline(p,'equities',x.id,'company',x.company),inline(p,'equities',x.id,'registration',x.registration),inline(p,'equities',x.id,'amount',x.amount,'money'),A.num(x.ratio,2)+'%',inline(p,'equities',x.id,'purpose',x.purpose),A.btn('삭제','financial-other-delete',{id:x.id,kind:'equities'},'text')]),createButton('출자자 추가','financial-other-add',{kind:'equities'},'primary'))+panelTable('담보·신용보강·보증',['구분','제공자','금액','내용','기한',''],live(p.guarantees).map(x=>[inline(p,'guarantees',x.id,'category',x.category),inline(p,'guarantees',x.id,'provider',x.provider),inline(p,'guarantees',x.id,'amount',x.amount,'money'),inline(p,'guarantees',x.id,'detail',x.detail),inline(p,'guarantees',x.id,'expiry',x.expiry,'date'),A.btn('삭제','financial-other-delete',{id:x.id,kind:'guarantees'},'text')]),createButton('항목 추가','financial-other-add',{kind:'guarantees'},'primary'))+'<details class="recovery-report-guarantors"><summary>보고 보증기관 '+live(p.reportParticipants.guarantors).length+'건</summary>'+panelTable('보고 보증기관',['보증기관','유형','금액','범위',''],live(p.reportParticipants.guarantors).map(x=>[inline(p,'guarantors',x.id,'name',x.name),inline(p,'guarantors',x.id,'type',x.type),inline(p,'guarantors',x.id,'amount',x.amount,'money'),inline(p,'guarantors',x.id,'scope',x.scope),A.btn('삭제','financial-other-delete',{id:x.id,kind:'guarantors'},'text')]),createButton('보증기관 추가','financial-other-add',{kind:'guarantors'}))+'</details>';
  }
  function financeView(p) {
    const loans = live(p.loans), commitment = financeTotal(loans, 'commitment'), priced=loans.filter(l=>l.commitment>0),weighted=commitment&&priced.every(l=>loanKnownPercent(l.allIn)&&['included','excluded'].includes(l.allInAdvisoryBasis))&&new Set(priced.map(l=>l.allInAdvisoryBasis)).size===1?priced.reduce((n,l)=>n+l.commitment*Number(l.allIn),0)/commitment:null;
    const equity=financeTotal(live(p.equities),'amount'),total=equity==null||commitment==null?null:equity+commitment,eqWidth=total?equity/total*100:0;
    const capital='<section class="panel"><div class="panel-header"><div class="panel-title"><h3>조달 구조</h3></div>'+A.btn('조달 내역 보기','finance-capital-detail',{},'small')+'</div><div class="panel-body"><button type="button" class="chart-interactive recovery-capital" data-action="finance-capital-detail"><div class="finance-mix"><div class="finance-mix-bar"><span style="width:'+eqWidth+'%;background:#10243E" data-tooltip="자기자본 '+A.esc(financeMoney(equity))+'"></span><span style="width:'+(total?100-eqWidth:0)+'%;background:#6F91B8" data-tooltip="대출 약정 '+A.esc(financeMoney(commitment))+'"></span></div><div class="finance-mix-value"><span>자기자본 <b>'+financeMoney(equity)+'</b></span><span>대출 약정 <b>'+financeMoney(commitment)+'</b></span></div></div></button></div></section>';
    return summaryStrip([['총 조달규모',financeMoney(total)],['자기자본',financeMoney(equity)],['대출 잔액',financeMoney(financeTotal(loans,'balance'))],['가중평균 ALL-IN',weighted==null?'—':A.num(weighted,2)+'%']])+capital+panelTable('대출현황',['금융기관','순위','유형','약정액','실행액','잔액','금리(연%)','선취·취급(%)','금융자문(%)','ALL-IN(연%)','ALL-IN 기준','약정일','만기일'],loans.map(l=>[tableLink(l.institution,'loan-detail',l.id),inline(p,'loan',l.id,'rank',l.rank,'select',['선순위','중순위','후순위']),inline(p,'loan',l.id,'type',l.type,'select',['브릿지론','본PF','기타 대출']),inline(p,'loan',l.id,'commitment',l.commitment,'money'),inline(p,'loan',l.id,'executed',l.executed,'money'),inline(p,'loan',l.id,'balance',l.balance,'money'),inline(p,'loan',l.id,'interestRate',l.interestRate,'percent'),inline(p,'loan',l.id,'upfrontFeeRate',l.upfrontFeeRate,'percent'),inline(p,'loan',l.id,'advisoryFeeRate',l.advisoryFeeRate,'percent'),inline(p,'loan',l.id,'allIn',l.allIn,'percent'),inline(p,'loan',l.id,'allInAdvisoryBasis',l.allInAdvisoryBasis||'','select',[{value:'',label:'—'},{value:'included',label:'금융자문수수료 포함'},{value:'excluded',label:'금융자문수수료 제외'}]),inline(p,'loan',l.id,'start',l.start,'date'),inline(p,'loan',l.id,'maturity',l.finalMaturity||l.maturity,'date')]),A.btn('대주별 분기 기준값','finance-quarter-list')+A.btn('금융 변경이력','finance-history-list')+createButton('대출 추가','loan-add',{},'primary'))+renderEquityGuarantees(p);
  }
  A.register('finance',p=>'<div class="dp-finance">'+financeView(p)+'</div>');
  A.on('finance-capital-detail',()=>{const p=A.current();A.modal('자금구성',A.table(['구분','약정·출자','실행·납입','잔액'],[['자기자본',financeMoney(financeTotal(live(p.equities),'amount')),financeMoney(financeTotal(live(p.equities),'amount')),financeMoney(financeTotal(live(p.equities),'amount'))],...live(p.loans).map(l=>[A.esc(l.institution+' · '+l.type),financeMoney(l.commitment),financeMoney(l.executed),financeMoney(l.balance)])]));});
  A.on('finance-quarter-list',()=>{const p=A.current();A.modal('대주별 분기 기준값',A.table(['금융기관','기준일','약정액','누적 실행','잔액','금리(연%)','선취·취급(%)','금융자문(%)','ALL-IN(연%)','ALL-IN 기준','구분'],(p.loanQuarterlyRecords||[]).map(q=>[A.esc(q.loan?.institution||p.loans.find(l=>l.id===q.loanId)?.institution||'—'),q.asOf,financeMoney(q.commitment),financeMoney(q.executed),financeMoney(q.balance),loanRateText(q.loan?.interestRate),loanRateText(q.loan?.upfrontFeeRate),loanRateText(q.loan?.advisoryFeeRate),loanRateText(q.allIn),loanBasisLabel(q.loan?.allInAdvisoryBasis),q.supersededAt?'이전 기록':'현재 기준'])));});
  function loanHistoryTable(p,loanId=null){
    const fields=['institution','rank','type','commitment','executed','balance',...loanPricingFields,'allInAdvisoryBasis','ltv','ltc','start','finalMaturity','interestTerms','otherFees','repaymentTerms','collateral'];
    const label=key=>({finalMaturity:'최종 만기일',ltv:'LTV',ltc:'LTC',...inlineLabels.loan}[key]||key),value=(row,key)=>{const v=row?.[key];if(v==null||v==='')return '—';if(['commitment','executed','balance'].includes(key))return financeMoney(v);if([...loanPricingFields,...loanRatioFields].includes(key))return A.esc(loanRateText(v,loanRatioFields.includes(key)));if(key==='allInAdvisoryBasis')return loanBasisLabel(v);return A.esc(v);};
    return A.table(['일자','금융기관','변경','변경 전','변경 후','사유'],(p.loanEvents||[]).filter(e=>!loanId||e.loanId===loanId||e.toLoanId===loanId).slice().reverse().map(e=>{const recipient=loanId&&e.toLoanId===loanId,before=recipient?null:e.before,after=recipient?e.receiver:e.after,changed=fields.filter(key=>(before?.[key]??null)!==(after?.[key]??null)),cell=row=>changed.length?changed.map(key=>'<span>'+A.esc(label(key))+': '+value(row,key)+'</span>').join('<br>'):'—',party=recipient?e.receiver?.institution:(p.loans||[]).find(l=>l.id===e.loanId)?.institution||after?.institution||before?.institution;return[A.esc(e.date||'—'),A.esc(party||'—'),A.esc(e.kind||'—'),cell(before),cell(after),A.esc(e.note||'—')];}),'loan-history-table');
  }
  A.on('finance-history-list',()=>{const p=A.current();A.modal('금융 변경이력','<div class="loan-history-content">'+loanHistoryTable(p)+'</div>');});
  function showLoanDetail(projectId,loanId,{closeMissing=false}={}){const p=A.state.projects.find(row=>row.id===projectId&&!row.deletedAt),l=loanTarget(p,loanId);if(!l){if(closeMissing)A.closeModal();return A.toast('대출을 찾을 수 없습니다.');}const rate=key=>loanRateText(l[key],loanRatioFields.includes(key)),rows=[['금융기관',A.esc(l.institution)],['금융 유형',A.esc(l.type||'—')],['상환순위',A.esc(l.rank||'—')],['약정액',financeMoney(l.commitment)],['누적 실행액',financeMoney(l.executed)],['대출잔액',financeMoney(l.balance)],['금리 (연 %)',rate('interestRate')],['선취·취급 수수료 (%)',rate('upfrontFeeRate')],['금융자문 수수료 (%)',rate('advisoryFeeRate')],['ALL-IN (연 %)',rate('allIn')],['ALL-IN 기준',loanBasisLabel(l.allInAdvisoryBasis)],['금리·이자지급 조건',A.esc(l.interestTerms||'—')],['그 밖의 수수료',A.esc(l.otherFees||'—')],['약정 시작일',A.esc(l.start||'—')],['최종 만기일',A.esc(l.finalMaturity||l.maturity||'—')],['LTV (%)',rate('ltv')],['LTC (%)',rate('ltc')],['상환 조건',A.esc(l.repaymentTerms||'—')],['담보·신용보강',A.esc(l.collateral||'—')]];A.modal(l.institution+' · 대출 상세','<div class="loan-detail-content">'+A.table(['항목','내용'],rows,'loan-detail-table')+((p.loanEvents||[]).some(e=>e.loanId===l.id||e.toLoanId===l.id)?'<h3>변경이력</h3>'+loanHistoryTable(p,l.id):'')+'</div>',button('대출 정보 수정','loan-edit',l.id)+button('분기 기준값 기록','loan-quarter',l.id)+button('셀다운','loan-selldown',l.id)+button('삭제','loan-delete',l.id));}
  A.on('loan-detail',b=>showLoanDetail(A.current().id,b.dataset.id));
  function inlineContract({project:p,id,field,value}) {
    const c=currentContracts(p).find(x=>x.id===id);if(!c)throw Error('계약을 찾을 수 없습니다.');
    const allowed=['name','type','counterparty','period','status','proposalNumber','companyId','date','file','net','vat','total','costAmount'];if(!allowed.includes(field))throw Error('편집할 수 없는 계약 항목입니다.');
    const before=clone(c),r=latest(c),moneyFields=['net','vat','total','costAmount'];
    const v=moneyFields.includes(field)?amount(value,inlineLabels.contract[field]||field,true):field==='date'?date(value):String(value??'').trim();
    const previous=['date','file',...moneyFields].includes(field)?r[field]:c[field];if(previous===v)return;
    if(['date','file',...moneyFields].includes(field)){
      const next={...clone(r),id:A.uid('revision'),revision:Number(r.revision)+1,[field]:v,note:'계약 '+({total:'총액',net:'공급가액',vat:'부가세',costAmount:'사업비 반영액',date:'계약일',file:'원본 경로'}[field])+' 변경'};
      if(field==='total'&&next.net!=null&&next.vat!=null&&next.net+next.vat!==v){next.net=null;next.vat=null;next.taxStatus='금액 구분 미확인';}
      if(['net','vat'].includes(field)&&next.net!=null&&next.vat!=null){next.total=next.net+next.vat;next.taxStatus='확인';}
      if(next.costAmount!=null&&(next.total==null||next.costAmount>next.total))throw Error('사업비 반영액이 계약총액을 초과합니다.');
      if(next.costAmount==null&&next.allocations.length)throw Error('CBS 배부가 있어 사업비 반영액을 비울 수 없습니다.');
      validateAllocations(next.allocations,next.costAmount,p);c.revisions.push(next);
    }else{if(['name','counterparty'].includes(field)&&!v)throw Error('빈 값으로 저장할 수 없습니다.');if(field==='companyId'&&v&&!live(A.state.companies).some(x=>x.id===v))throw Error('업체를 찾을 수 없습니다.');c[field]=v;}
    mutate(p,'contract',id,before,c,c.name+' 계약값이 변경되었습니다.');
  }
  function inlineFinancial({project:p,id,field,value},kind) {
    const rows=kind==='loan'?p.loans:otherList(p,kind),row=kind==='loan'?loanTarget(p,id):live(rows).find(x=>x.id===id);if(!row)throw Error('기록을 찾을 수 없습니다.');
    if(kind==='loan'&&A.current()?.id!==p.id)throw Error('사업이 변경되어 저장하지 않았습니다.');
    const allowed=kind==='loan'?['institution','rank','type','commitment','executed','balance',...loanPricingFields,'allInAdvisoryBasis','interestTerms','otherFees','repaymentTerms','start','maturity','collateral','sourcePath']:kind==='equities'?['company','registration','amount','purpose']:kind==='guarantees'?['category','provider','amount','detail','expiry','sourcePath']:['name','type','amount','scope','otherType','sourcePath'];
    if(!allowed.includes(field))throw Error('편집할 수 없는 항목입니다.');
    const beforeRows=clone(rows),before=clone(row),next=clone(row);
    if(['amount','commitment','executed','balance'].includes(field))next[field]=kind==='loan'?loanInput(value,field,'금액',row,amount):amount(value,'금액');
    else if(kind==='loan'&&loanPricingFields.includes(field)){next[field]=loanInput(value,field,loanPricingLabels[field],row,loanPercent);if(field==='allIn'&&next.allIn!=null&&next.allIn!==row.allIn&&!['included','excluded'].includes(row.allInAdvisoryBasis))throw Error('ALL-IN 기준을 먼저 선택해 주세요.');}
    else if(kind==='loan'&&field==='allInAdvisoryBasis'){if(!['included','excluded'].includes(row[field])&&loanUnchangedInput(value,row[field]))next[field]=row[field];else{if(value&&!['included','excluded'].includes(value))throw Error('ALL-IN 기준을 선택해 주세요.');next[field]=value||null;}}
    else if(kind==='loan'&&['rank','type'].includes(field))next[field]=String(value??'')===String(row[field]??'')?row[field]:String(value??'');
    else if(['start','maturity','expiry'].includes(field)){next[field]=date(value,'일자',field==='expiry');if(field==='maturity')next.finalMaturity=next.maturity;}
    else next[field]=String(value??'').trim();
    if(['company','provider','institution','name'].includes(field)&&!next[field])throw Error('명칭을 입력해 주세요.');
    if(kind==='loan'&&['start','maturity'].includes(field)){const end=next.finalMaturity||next.maturity;if(/^\d{4}-\d{2}-\d{2}$/.test(next.start||'')&&/^\d{4}-\d{2}-\d{2}$/.test(end||'')&&end<next.start)throw Error('최종 만기일은 약정 시작일보다 빠를 수 없습니다.');}
    if(kind==='loan'&&['balance','commitment'].includes(field)&&typeof next.balance==='number'&&typeof next.commitment==='number'&&next.balance>next.commitment)throw Error('잔액이 약정액보다 큽니다.');
    if(kind==='loan'?comparableLoan(before)===comparableLoan(next):JSON.stringify(before)===JSON.stringify(next))return;
    Object.assign(row,next);
    captureFinancialSource(p,kind,beforeRows);
    if(kind==='loan')p.loanEvents.push({id:A.uid('loan-event'),loanId:id,date:A.today,kind:'약정 변경',before,after:clone(row),note:(inlineLabels.loan[field]||field)+' 변경'});
    mutate(p,kind,id,before,row,(row.institution||row.company||row.provider||row.name)+' 정보가 변경되었습니다.','finance','loans');
  }
  function inlineDocument({project:p,id,field,value}) {
    const d=live(p.documents).find(x=>x.id===id);if(!d)throw Error('문서를 찾을 수 없습니다.');
    if(!['title','category','number','date','issuer','recipient','location','related','status','revision'].includes(field))throw Error('편집할 수 없는 항목입니다.');
    const next=field==='date'?date(value):String(value??'').trim();if(['title','location'].includes(field)&&!next)throw Error('문서명과 원본 경로를 입력해 주세요.');if(d[field]===next)return;
    const before=clone(d);d[field]=next;mutate(p,'document',id,before,d,d.title+' 문서 정보가 변경되었습니다.','document','documents');
  }
  A.onInline('contract',inlineContract);A.onInline('document',inlineDocument);A.onInline('loan',args=>inlineFinancial(args,'loan'));['equities','guarantees','guarantors'].forEach(kind=>A.onInline(kind,args=>inlineFinancial(args,kind)));
  document.addEventListener('inline-committed',e=>{if(e.detail?.entity==='contract'&&document.getElementById('app-dialog')?.open&&A.ui.contractModalId===e.detail.id)showContract(e.detail.id);});
  if(A.tabContracts)A.tabContracts.finance=['loans'];
  A.financeLoansAsOf = financeLoansAsOf;
  A.contracts={initialize,latest,revisionAt,allocationsTotal,validateAllocations,contractTotals,obligationStatus,paymentTotal,paymentStatus,upsertPayment,linkPayment,reviewPayments,fundsAsOf,formContract,reconcileOpening,validateSellDown,revisionValues,cbsFunds,hasCbsReferences,...(A.realMode?{}:{seedDemo}),financeLoansAsOf,inlineContract,inlineDocument,renderDocuments,showContract,itemFunds,upsertForecast,upsertItemPayment,reviewItemFunds,replaceForecast,linkItemPayment,sourcePayments,planningArchive};
  A.spec.featureContracts = A.spec.featureContracts || {};
  A.spec.featureContracts.contracts = { source: 'project.contracts 문서 계약 원장 단일 원천. CBS 예산은 별도이며 계약 저장으로 덮어쓰지 않는다.', revision: '같은 계약의 개정차수에서 최신 유효금액만 사용한다. 최초 이관 원자료는 originalSource로 보존한다.', money: '원 단위 정수. 공급가액+부가세=총액. 사업비 반영액은 별도 입력. 원자료 부가세가 없으면 미확인으로 보존한다.', allocation: '계약-CBS 다대다 배부. 지급/기성 각 기록에 당시 사업비 기준 배부를 보존하며 계약 배부 변경으로 과거 배부를 바꾸지 않는다.', payment: '예정회차에 확정 지급의무와 복수 부분지급을 연결한다. 미지급=확정 지급의무-연결 지급. 기성과 지급은 동일시하지 않으며 음수 잔액을 숨기지 않는다.', migration: '기존 원가표의 계약/기성/지급 누계를 기초잔액으로 보존하며 신규 원장에 중복 합산하지 않는다. 실제 상세 금액과 CBS 배부가 기준일 누계에 일치해야 대체한다.', financing: '대주별 분기기준값은 정정 전후를 보존한다. 셀다운은 양도·양수 약정/실행/잔액 총합을 보존하며 새 대주 연결과 변경이력을 함께 저장한다.', fields: ['companyId', 'proposalNumber 선택', 'file/sourcePath', 'revisions', 'allocations', 'certifications', 'obligations', 'payments'], prototype: '로컬 저장과 감사이력만 구현. 실제 AI/파일업로드/DB/API 연결 없음.' };
  A.spec.featureContracts.contracts.financingAsOf = '보고 기준일 이전 최신 대주별 분기값·변경·셀다운 기록만 선택한다. 기준일 이전 근거가 없는 경우 미래 현재값으로 대체하지 않는다.';
  A.spec.featureContracts.contracts.equityGuarantees = '기존 출자자·출자액·담보/신용보강·보고 보증기관을 유지하며 수기 CRUD와 복구를 지원한다. 출자비율은 현재 출자액 합계로 계산한다. 담보/신용보강 원장과 보고 보증기관은 별도 원자료로 유지한다.';
  A.spec.featureContracts.contracts.tableInteractions = '세부사업비와 CBS집행은 같은 CBS 행·sortOrder·접힘상태·최좌측 드래그핸들을 공유한다. 계약/기성/지급/이관원자료 참조가 있는 CBS는 삭제·합치기를 제한한다.';
  A.spec.featureContracts.contracts.demo = 'SAMPLE01 독립 가상 프로젝트에만 10억원 공급가+1억원 VAT, 두 CBS 60/40 배부, 4억원 선급금 중 2억원 부분지급을 생성한다. 원본 프로젝트에 데모 거래를 주입하지 않는다.';
  A.spec.featureContracts.contracts.recovery='v0.9.4 한화면 파이낸싱·검색·계약6조건탭·문서선택상세/버전·CBS집행열 및 원자료누계를 보존. 단순값은 셀에서 편집하고 복합 계약변경/배부/지급회차는 해당 원장의 상세에서 저장한다.';
  A.spec.featureContracts.contracts.migration='레코드별 보강 이관: 이미 존재하는 revisions/obligations/payments/certifications/분기값/대주이력/기초잔액은 덮어쓰지 않는다. 새 유입 구계약·구대주만 별도 이관하며 원자료는 보존한다. 대사는 기준일에 유효한 계약 개정차수를 사용한다.';
  A.spec.featureContracts.contracts.moneyEditing='계약총액 직접 변경으로 기존 공급가/VAT 합계가 달라지면 새 차수의 구분을 미확인으로 표시하고 이전 차수에 원값을 보존한다. 공급가/VAT 직접 수정 시 두 값이 확인되어 있으면 총액을 합산한다. CBS 현재 예산은 변경하지 않는다.';
  A.spec.featureContracts.contracts.cbsExecution='미연결 이관항목은 원자료 계약/기성/지급 누계를 표시하고 상세 원장과 중복 합산하지 않는다. 새 확정지급의 CBS 미지급은 회차의 사업비 반영액·배부와 실제지급 배부로 계산하며 미배부 금액을 비율로 추정하지 않는다.';
  A.spec.featureContracts.contracts.v0102Funds={primary:'계약명/상대방/계약금액/누적지급/계약잔액/다음지급일/다음지급액/상태 8열. 행 펼침으로 원지급·회차·기성·CBS 연결',minimumContract:['계약명','상대방','계약일','계약금액','근거경로'],minimumPayment:['실제지급일','금액','근거경로'],deferred:['VAT','사업비반영액','CBS배부','지급회차'],coverage:'unknown/partial/confirmed. 명시적 대사 확인 전의 빈 지급내역을0으로 확정하지 않음. 변경시partial 복귀 및 확인이력 보존',balance:'VAT 구분과 지급coverage 확인 완료일 때만 계약잔액 산출',nextDue:'화면 자료 기준일(p.asOf, 없으면A.today)로 경과/30일 판정. 동일한 가장 빠른 예정일의 모든 미결 회차잔액을 합산',sourceIntegrity:'회차 없는 실제지급을 독립ID로 보존하며 후속 연결시 같은ID를 갱신. 이관원자료와 새원장을 합산하지 않음'};
  A.spec.featureContracts.contracts.v0102Funds.supersededBy='v0103Funds';
  A.spec.featureContracts.contracts.v0103Funds={primary:'사업비 관리항목별 현재사업비/계약 반영액/지급 반영액/잔여 사업비/다음 지급일/다음 지급액. 980px 기본표, 36px/14px, 월별 12개월과 일정미정은 같은 표의 추가 열',storage:['project.fundForecasts','project.fundPayments','project.fundItemReviews','contract.cbsId','obligation.precision/dueDate/dueMonth/cbsId'],forecast:'계약 전 지급예측은 별도 원장. 일자·월·미정 정밀도를 보존하고 월을 임의 일자로 바꾸지 않음. 30일 필터는 일자확정만, 월경과는 달 종료 후 판정',replacement:'예측총액=대체회차총액과 같은 항목을 검증. 원예측 금액/ID 보존+replacedBy 연결, 실제지급이 있으면 같은 지급ID로 계약 회차에 이관. 기존 독립원장에는 이동참조를 남겨 중복집계 차단',payment:'독립 지급은 실제일/실제출금액/근거 필수, 사업비반영액·예측연결은 선택. 총출금과 사업비 반영액을 구분. 공제예정VAT·환급·상계는 실제출금에서 자동상계하지 않음',reconciliation:'기초누계 기준일 이전 상세는 다시 합산하지 않고 이후 지급만 추가. 상세 대사 완료 전 계약원금 변동 차이는 미확인 보존. 독립지급도 기초지급누계 대사 가능. 누계확인 기준일과 원장fingerprint 일치시만 잔여 산출',tax:'A.vat summaryFor/openEditor를 계약 또는 비용 원천에서만 사용. VAT 변경으로 지급복제·환급일정 자동생성하지 않음. VAT 금액과 CBS 배부 불일치는 미확인 표시',ux:'계약우선/CBS보조/원자료별도화면 폐지. 관리항목 행 펼침 안 하나의 내역표에 계약·예측·회차·실제지급·기초누계 배치. 문서는 공통table builder와 행선택·출처·버전 유지'};
  A.spec.retiredFeatures=A.spec.retiredFeatures||{};
  A.spec.retiredFeatures.cashflow={retiredIn:'0.10.4',status:'사용자 요청으로 탭 전체 제거. 다른 이름의 대체 화면 없음',previous:{v0102:A.spec.featureContracts.contracts.v0102Funds,v0103:A.spec.featureContracts.contracts.v0103Funds},preservation:'기존 fundForecasts/회차 계획 원문/지급/기성/알림·감사이력은 보존. 계획자료는 복구·내보내기 원자료로만 유지하며 신규 입력·수정·대체는 거부'};
  delete A.spec.featureContracts.contracts.v0102Funds;delete A.spec.featureContracts.contracts.v0103Funds;
  Object.assign(A.spec.featureContracts.contracts,{payment:'문서 계약 원장의 기성·실제 지급과 확정 지급조건을 유지한다. 미확정 계획으로 미지급을 계산하지 않는다. 지급계획·월별 자금계획·계약집행 별도 탭은 제공하지 않는다.',recovery:'문서 계약 6개 조건 탭·원문·기성·실제 지급·버전과 금융/보고 연결은 유지한다. 계약·집행 현황 탭 및 진입 동작은 삭제하며 대체 탭을 만들지 않는다.',tableInteractions:'원가항목에 연결된 계약·기성·지급·기존 계획 원자료의 참조 보호를 유지한다. 집행용 별도 표는 노출하지 않는다.',cbsExecution:'기초 누계·계약·기성·지급의 계산 원천은 원가/보고 연계용으로 유지한다. 계약·집행 탭 렌더러는 제거한다.',fields:['companyId','proposalNumber 선택','file/sourcePath','revisions','allocations','certifications','obligations 보관 원문','payments']});
  A.spec.requirements = A.spec.requirements || [];
  A.spec.featureContracts.contracts.documentsV0105='문서 목록 공통 표/선택/버전 이력 유지. 입력자료 조회는 초기등록을 재개하지 않는다. 검색조건을 지우지 않고 다른 제목의 과거버전을 조회하며 닫기 후 선택·스크롤·포커스를 복원한다. 추가는 공통 outline 버튼, 미저장 전환은 공통 draft guard를 사용한다. 폐지한 자금/계약집행 탭을 복원하지 않는다.';
  A.spec.requirements.push({ id: 'CON-010', name: '계약·CBS·기성·지급 원장', criteria: ['동일 계약 변경차수 중복 합산 금지', '다중 CBS 배부와 금액 대사', '문서 계약의 실제 부분지급·선급금 원문 보존', '계약 추가 시 CBS 예산 불변', '기초잔액 상세대체 대사', '공급가/세금/총액/사업비 기준 구분', '대주 셀다운 총액 보존', '모든 데이터 변동 감사이력'] });
})(App);
