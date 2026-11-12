// Decorate the real portfolio rows. The application's search handler replaces only
// tbody's children; observing that boundary keeps the filters and their focus intact.
const observed = new WeakMap();
const observedCharts = new WeakSet();
const chartTips = new WeakMap();
let chartGridObserver;

export function formatDisplayDates(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/(?:https?|file):\/\/[^\s<>"']+|(?<![\w./\\-])\d{4}-\d{2}-\d{2}(?=T\d{2}:\d{2}|$|[^\w./\\-]|\.(?!\w))/g, token => {
    if (token.includes('://')) return token;
    const date = new Date(token + 'T00:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === token
      ? token.replaceAll('-', '.') : token;
  });
}

function node(tag, cls, value) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (value != null) el.textContent = value;
  return el;
}

export function registerChartTooltip(owner, data) {
  chartTips.set(owner, data);
}

export function positionLocalTooltip(tip, rect, {alignStart = false} = {}) {
  const dialog = tip.closest('dialog')?.getBoundingClientRect();
  const inset = 8;
  const gap = 5;
  const leftEdge = Math.max(0, dialog?.left ?? 0) + inset;
  const rightEdge = Math.min(window.innerWidth, dialog?.right ?? window.innerWidth) - inset;
  const topEdge = Math.max(0, dialog?.top ?? 0) + inset;
  const bottomEdge = Math.min(window.innerHeight, dialog?.bottom ?? window.innerHeight) - inset;
  tip.style.maxWidth = Math.min(360, rightEdge - leftEdge) + 'px';
  const {width, height} = tip.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  const desiredLeft = alignStart ? rect.left : center - width / 2;
  const left = Math.max(leftEdge, Math.min(desiredLeft, rightEdge - width));
  const above = rect.top - height - gap;
  const below = rect.bottom + gap;
  const opensBelow = above < topEdge && (below + height <= bottomEdge || bottomEdge - below > rect.top - topEdge);
  const desiredTop = opensBelow ? below : above;
  const top = Math.max(topEdge, Math.min(desiredTop, bottomEdge - height));
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
  if (top === desiredTop) {
    tip.style.setProperty('--tooltip-pointer-x', Math.max(16, Math.min(center - left, width - 16)) - tip.clientLeft + 'px');
    tip.dataset.pointer = opensBelow ? 'top' : 'bottom';
  } else {
    delete tip.dataset.pointer;
  }
}

function updateRows(A, table) {
  const projects = new Map(A.state.projects.map(p => [p.id, p]));
  const labels = [...table.tHead.rows[0].cells].map(cell => cell.dataset.pfLabel);
  for (const tr of table.tBodies[0].rows) {
    const p = projects.get(tr.querySelector('[data-project-id]')?.dataset.projectId);
    if (!p || tr.cells.length !== labels.length) continue;
    const cells = [...tr.cells];
    for (const [index, cell] of cells.entries()) cell.dataset.pfLabel = labels[index];
    const dateCell = cells[labels.indexOf('다음 일정')];
    if (!dateCell) continue;
    // Use the schedule displayed by the product, including its legacy fallback.
    const schedule = dateCell.dataset.pfSchedule ?? dateCell.textContent.trim();
    dateCell.dataset.pfSchedule = schedule;
    const match = schedule.match(/(?:^|\s)(\d{4}(?:[-.]\d{2}){2})$/);
    if (match && !dateCell.querySelector('time')) {
      const time = node('time', 'pf-date', formatDisplayDates(match[1]));
      time.dateTime = match[1].replaceAll('.', '-');
      dateCell.replaceChildren(node('span','pf-schedule',schedule.slice(0,match.index).trim()), time);
    }
    const initial = A.total(p,'initial'), current = A.total(p);
    const missing = [initial == null && '최초', current == null && '현재'].filter(Boolean);
    const deltaCell = cells[labels.indexOf('최초 대비')];
    if (missing.length && deltaCell && !deltaCell.querySelector('.pf-missing')) {
      deltaCell.replaceChildren(node('span','pf-missing',missing.join('·') + ' 금액 미확보'));
    }
  }
}

function addChartGridlines(chart) {
  const list = chart.querySelector('.portfolio-cost-list');
  if (!list || list.querySelector('.pf-cost-gridlines')) return;
  const grid = node('div', 'pf-cost-gridlines');
  grid.setAttribute('aria-hidden', 'true');
  const track = node('div', 'pf-cost-gridline-track');
  for (const tick of chart.querySelectorAll('.portfolio-axis-ticks > span')) {
    const line = node('span', 'pf-cost-gridline');
    line.style.left = tick.style.left;
    track.append(line);
  }
  grid.append(track);
  list.append(grid);
}

function decorateChart(A, chart) {
  addChartGridlines(chart);
  const legend = chart.querySelector(':scope > .legend');
  if (legend) {
    const keys = [['initial', '최초 언더라이팅'], ['current', '현재 사업비'], ['increase', '상승'], ['decrease', '하락']];
    legend.classList.add('pf-cost-legend');
    legend.replaceChildren(...keys.map(([kind, label]) => {
      const item = node('span');
      const symbol = node('i');
      symbol.dataset.pfSymbol = kind;
      symbol.setAttribute('aria-hidden', 'true');
      item.append(symbol, label);
      return item;
    }));
    const unit = chart.querySelector('.portfolio-cost-axis > span:first-child');
    if (unit) {
      unit.classList.add('pf-cost-unit');
      unit.textContent = `(${unit.textContent})`;
      legend.lastElementChild.append(' ', unit);
    }
  }
  const projects = new Map(A.state.projects.map(project => [project.id, project]));
  for (const row of chart.querySelectorAll('.portfolio-cost-row')) {
    const track = row.querySelector('.portfolio-cost-track');
    const project = projects.get(track?.dataset.id);
    if (!project) continue;
    const segments = [...track.querySelectorAll('.portfolio-initial-base, .portfolio-cost-change')];
    if (segments.length) {
      // Use one silhouette so even a very narrow change meets the baseline flush.
      const rightEdge = Math.max(...segments.map(segment =>
        parseFloat(segment.style.left) + parseFloat(segment.style.width)));
      const fill = node('span', 'pf-cost-fill');
      fill.style.setProperty('--pf-unfilled', `${Math.max(0, 100 - rightEdge)}%`);
      fill.setAttribute('aria-hidden', 'true');
      fill.append(...segments);
      track.prepend(fill);
    }
    const [current, perPyeong] = row.querySelectorAll(':scope > .num');
    const initialValue = A.total(project, 'initial');
    const currentValue = A.total(project);
    const amounts = [
      ['최초 언더라이팅', A.money(initialValue)],
      ['현재 사업비', current.textContent],
      ['평당 총사업비', perPyeong.textContent]
    ];
    const description = [project.name, ...amounts.map(([label, value]) => `${label} ${value}`)].join('\n');
    const tooltip = {title: project.name, amounts, anchor: track};
    for (const owner of [row, track, row.querySelector('.table-link')]) {
      owner.dataset.tip = description;
      registerChartTooltip(owner, tooltip);
    }

    const difference = initialValue == null || currentValue == null ? null : currentValue - initialValue;
    const direction = difference > 0 ? 'increase' : difference < 0 ? 'decrease' : '';
    const change = node('span', 'pf-cost-delta', difference == null ? '비교 불가' : '변동 없음');
    change.title = '최초 언더라이팅 대비';
    if (direction) {
      track.querySelector('.portfolio-current-marker').dataset.pfSymbol = direction;
      change.classList.add(direction);
      change.textContent = (difference > 0 ? '+' : '−') + A.money(Math.abs(difference));
    }
    current.append(change);
  }
}

function decorateActiveTooltip(target) {
  const owner = target?.closest?.('[aria-describedby~="dp-chart-tooltip"]');
  if (!owner) return;
  const tip = document.getElementById('dp-chart-tooltip');
  if (!tip || tip.hidden) return;
  const data = chartTips.get(owner);
  if (data && !tip.querySelector('.studio-tooltip-title')) {
    tip.replaceChildren(node('div', 'studio-tooltip-title', formatDisplayDates(data.title)));
    if (data.amounts.length) {
      const details = node('dl', 'studio-chart-tip-details');
      for (const [label, value] of data.amounts) details.append(node('dt', '', label), node('dd', '', formatDisplayDates(value)));
      tip.append(details);
    }
    if (data.note) {
      const note = node('div', 'studio-chart-tip-note');
      if (data.noteLabel) note.append(node('strong', '', data.noteLabel));
      note.append(node('div', '', formatDisplayDates(data.note)));
      tip.append(note);
    }
  } else if (!data && !tip.querySelector('.studio-tooltip-title')) {
    const text = formatDisplayDates(tip.textContent);
    const [title, ...lines] = text.trim().split('\n');
    if (lines.length) {
      tip.replaceChildren(node('div', 'studio-tooltip-title', title), node('div', '', lines.join('\n').trimStart()));
    } else if (text !== tip.textContent) tip.textContent = text;
  }
  const pointerRect = data?.pointerTarget?.getBoundingClientRect();
  const pointsToBar = pointerRect?.bottom > 0 && pointerRect.top < window.innerHeight;
  const rect = pointsToBar ? pointerRect : (data?.anchor || owner).getBoundingClientRect();
  positionLocalTooltip(tip, rect, {alignStart: Boolean(data?.anchor)});
}

function alignChartGrid(table, chart) {
  const typeHeading = table.tHead.querySelector('[data-pf-label="사업유형"]');
  if (!typeHeading) return;
  chartGridObserver?.disconnect();
  const align = () => {
    if (!chart.isConnected) {
      observer.disconnect();
      return;
    }
    const axis = chart.querySelector('.portfolio-cost-axis');
    if (!axis) return;
    const headingInset = parseFloat(getComputedStyle(typeHeading).paddingInlineStart);
    const axisStyle = getComputedStyle(axis);
    const axisInset = parseFloat(axisStyle.paddingInlineStart) + parseFloat(axisStyle.columnGap);
    // Measure from the table edge so table-only scrolling leaves the chart in place.
    const headingStart = typeHeading.getBoundingClientRect().left - table.getBoundingClientRect().left + headingInset;
    chart.style.setProperty('--pf-chart-name-width', `${Math.max(0, headingStart - axisInset)}px`);
  };
  const observer = new ResizeObserver(align);
  chartGridObserver = observer;
  observer.observe(typeHeading.previousElementSibling);
  observer.observe(chart);
  align();
}

// The shared tooltip sets its text and handles pointer/keyboard dismissal first.
document.addEventListener('pointerover', event => decorateActiveTooltip(event.target));
document.addEventListener('focusin', event => decorateActiveTooltip(event.target));
document.addEventListener('scroll', () => decorateActiveTooltip(document.activeElement), true);

export function decoratePortfolio(A, content) {
  const table = content.querySelector('table.portfolio-table');
  if (!table?.tBodies[0]) return;
  const panel = table.closest('.panel');
  panel.classList.add('pf-list-card');
  panel.querySelector('.panel-title h2').textContent = '프로젝트 목록';
  panel.querySelector('[data-action="portfolio-reset"]').textContent = '검색조건 초기화';
  for (const cell of table.tHead.rows[0].cells) cell.dataset.pfLabel = cell.textContent.trim();
  updateRows(A, table);
  if (!observed.has(table)) {
    const observer = new MutationObserver(() => {
      if (table.isConnected) updateRows(A, table);
    });
    observer.observe(table.tBodies[0], {childList:true});
    observed.set(table, observer);
  }
  const chart = content.querySelector('[data-portfolio-chart] .panel-body');
  if (chart && !observedCharts.has(chart)) {
    decorateChart(A, chart);
    alignChartGrid(table, chart);
    new MutationObserver(() => {
      A.hideTooltip?.();
      decorateChart(A, chart);
    }).observe(chart, {childList:true});
    observedCharts.add(chart);
  }
}
