// The existing CBS table owns its amounts, units, editor and history controls.
// Add context to its rendered cells; never derive a total from visible rows.
const mountedTables = new WeakSet();

function totalContext(info, status) {
  if (['missing-area', 'zero-area', 'invalid-area'].includes(status)) {
    return {label: {'missing-area':'면적 미입력', 'zero-area':'면적 0', 'invalid-area':'면적 확인'}[status]};
  }
  if (info.value === null) {
    if (info.reconciliationRequired) return {label:'총액 미확정', note:'금액 대사 필요'};
    if (info.empty) return {label:'산정 전', note:'집계할 사업비 없음'};
    return {label:'총액 미확정', note:info.unknownCount > 0 ? '미확보 항목 있음' : ''};
  }
  const difference = info.reconciliationDifference;
  if (info.reconciliationRequired || (difference != null && difference !== 0)) return {note:'상세 금액 대사 필요'};
  if (info.detailUnknownCount > 0 || (info.totalSource === 'reported' && info.unknownCount > 0))
    return {note:'상세 금액 일부 미확보'};
  return {};
}

function decorateRows(A, table, project) {
  const total = table.querySelector('tr[data-testid="cost-total"]');
  if (!total) return;
  const heads = table.tHead.rows[0].cells;
  let column = 0;
  for (const head of heads) {
    const cell = total.cells[column];
    column += head.colSpan;
    const id = head.dataset.column;
    const field = cell?.querySelector('.cost-current-value');
    if (!id || !field) continue; // Collapsed periods carry no displayed value.
    const stage = id === 'current' ? null : project.costStages?.find(s => s.id === id);
    if (id !== 'current' && !stage) continue;
    const info = stage ? A.domain.stageInfo(stage) : A.totalInfo(project);
    const {label, note} = totalContext(info, field.dataset.valueState);
    // A display-suppressed value is not necessarily absent. Replace only
    // when the domain knows the reason or explicitly has no total.
    if (label && (field.textContent.trim() === '—' || field.dataset.valueState && field.dataset.valueState !== 'ready'))
      field.textContent = label;
    if (label || note) field.classList.add('ld-cost-status');
    if (note && !field.parentElement.querySelector('.ld-cost-note')) {
      const detail = document.createElement('small');
      detail.className = 'ld-cost-note';
      detail.textContent = note;
      field.parentElement.append(detail);
    }
  }
  const prompt = table.closest('.cost-detail-simple')?.querySelector('.ld-cost-search-empty');
  if (prompt) prompt.hidden = !(A.ui.costSearch && !table.tBodies[0].querySelector('[data-cbs-row]'));
}

export function decorateCostDetail(A, content, project) {
  const table = content.querySelector('table[data-testid="cost-detail-table"]');
  if (!project || !table || mountedTables.has(table)) return;
  mountedTables.add(table);
  const panel = table.closest('.cost-detail-simple');
  const toolbar = panel.querySelector('.table-toolbar');
  panel.querySelector('#costSearch')?.setAttribute('aria-label', '사업비 항목 검색');
  table.setAttribute('aria-label', '세부 사업비 비교표');
  for (const button of toolbar.querySelectorAll('[data-action="cbs-view-mode"]'))
    button.setAttribute('aria-pressed', String(button.dataset.mode === table.dataset.viewMode));
  toolbar.addEventListener('click', event => {
    const button = event.target.closest('[data-action="cbs-view-mode"]:focus-visible');
    if (!button) return;
    requestAnimationFrame(() => {
      if (button.isConnected || document.activeElement !== document.body) return;
      content.querySelector(`.cbs-view-switch [data-mode="${button.dataset.mode}"]`)?.focus({preventScroll:true});
    });
  }, true);
  for (const head of table.querySelectorAll('thead th[data-column]')) {
    if (head.classList.contains('cbs-col-collapsed')) continue;
    const role = head.classList.contains('cbs-role-current') ? '현재' :
      head.classList.contains('cbs-role-basis') ? '비교 기준' : '';
    if (!role) continue;
    const marker = document.createElement('span');
    marker.className = 'ld-cost-role';
    marker.textContent = role;
    head.prepend(marker);
  }
  const message = document.createElement('p');
  message.className = 'ld-cost-search-empty';
  message.setAttribute('role', 'status');
  message.hidden = true;
  message.textContent = '검색한 원가항목이 없습니다.';
  toolbar.after(message);
  decorateRows(A, table, project);
  // Searching refreshes just tbody; observing its direct children keeps the
  // input focused and avoids touching editors, popovers or App's render cycle.
  new MutationObserver(() => {
    if (table.isConnected && content.dataset.localScreen === 'cost-detail') decorateRows(A, table, project);
  }).observe(table.tBodies[0], {childList:true});
}
