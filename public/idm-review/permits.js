// Local presentation only. The original list, filter buttons and event targets stay mounted.
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Keep the original resize handles, column order and table-width storage key.
function renameColumn(th, title) {
  if (!th) return;
  const label = [...th.childNodes].find(n => n.nodeType === 3);
  if (label) label.textContent = title;
  th.querySelector('[role="separator"]')?.setAttribute('aria-label', title + ' 열 너비 조절');
}

function pair(cell, firstLabel, firstDate, secondLabel, secondDate) {
  if (!cell || cell.querySelector('.lp-dates')) return;
  const list = element('dl', 'lp-dates');
  for (const [label, value, original] of [[firstLabel, firstDate, false], [secondLabel, secondDate, true]]) {
    const group = element('div'), dt = element('dt', '', label), dd = element('dd');
    if (original) dd.append(...cell.childNodes);
    else dd.textContent = value || '—';
    if (!value) {
      dd.className = 'lp-date-empty';
      dd.setAttribute('aria-label', label + ' 기록 없음');
    }
    group.append(dt, dd); list.append(group);
  }
  cell.append(list);
}

export function decoratePermits(A, content, p) {
  const workspace = content.querySelector('[data-permit-workspace]');
  if (!workspace || !p || workspace.dataset.localPermitDecorated) return;
  workspace.dataset.localPermitDecorated = 'true';
  const heading = workspace.querySelector('.permit-workspace-heading');
  if (!heading) return;
  const title = heading.querySelector('h2');
  if (title) title.textContent = '등록 인허가';
  const records = (p.permits || []).filter(r => !r.deletedAt);
  const table = workspace.querySelector('.permit-core-table');
  if (!table) return;
  const heads = [...table.tHead.rows[0].cells];
  const at = label => heads.findIndex(th => th.firstChild?.textContent.trim() === label);
  const plan = at('목표 완료일'), actual = at('승인일'), stage = at('상태');
  const visible = [], byId = new Map(records.map(r => [r.id,r]));
  for (const row of table.tBodies[0].rows) {
    const button = row.querySelector('[data-action="permit-record-detail"]');
    if (!button) continue;
    const record = byId.get(button.dataset.id);
    if (!record) continue;
    visible.push(record);
    if (row.cells[stage]) row.cells[stage].dataset.lpPermitStatus = A.permitViews.permitBucket(record);
    pair(row.cells[plan], '계획 신청', record.plannedApplication, '목표 완료', record.expected);
    pair(row.cells[actual], '실제 신청', record.application, '승인', record.approval);
  }
  renameColumn(heads[plan],'계획 일정');
  renameColumn(heads[actual],'실제 일정');
  if (!visible.length && records.length) {
    const empty = table.querySelector('.empty');
    if (empty) empty.textContent = '선택한 상태의 인허가가 없습니다.';
  }
}
