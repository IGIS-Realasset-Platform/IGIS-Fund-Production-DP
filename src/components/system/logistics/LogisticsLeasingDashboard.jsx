import React from 'react';
import './LogisticsLeasingDashboard.css';

const TABS = [
  { id: 'weekly', title: 'Weekly', group: 'Workspace' },
  { id: 'home', title: 'Home', group: 'Workspace' },
  { id: 'asset', title: 'Asset', group: 'Portfolio' },
  { id: 'company', title: 'Company', group: 'Portfolio' },
  { id: 'sector', title: 'Sector', group: 'Analysis' },
  { id: 'tools', title: 'Analysis Tools', group: 'Analysis' },
  { id: 'playground', title: 'Data Playground', group: 'Analysis' },
  { id: 'quality', title: 'Data Quality', group: 'Control' },
  { id: 'permissions', title: 'Admin', group: 'Control' },
];

const ROLE_LEVELS = ['읽기', '쓰기', '수정', '삭제', '종합 관리'];

function toNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function fmtNumber(value, digits = 0) {
  return toNumber(value).toLocaleString('ko-KR', { maximumFractionDigits: digits });
}

function fmtArea(value) {
  return `${fmtNumber(value, 1)}㎡`;
}

function fmtCurrency(value) {
  const number = toNumber(value);
  if (Math.abs(number) >= 100000000) return `${fmtNumber(number / 100000000, 1)}억`;
  if (Math.abs(number) >= 10000) return `${fmtNumber(number / 10000, 1)}만`;
  return fmtNumber(number);
}

function fmtPercent(value) {
  return `${fmtNumber(toNumber(value) * 100, 1)}%`;
}

function getRegion(asset) {
  const address = asset?.map?.address || '';
  return String(address).split(' ')[0] || '미기재';
}

function normalizeDate(value) {
  if (!value) return '';
  if (typeof value === 'number') return '';
  return String(value).slice(0, 10);
}

function monthsTo(dateValue) {
  const dateText = normalizeDate(dateValue);
  if (!dateText) return null;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  return (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
}

function groupRows(rows, getKey, getValue) {
  return rows.reduce((acc, row) => {
    const key = getKey(row) || '미기재';
    acc[key] = (acc[key] || 0) + toNumber(getValue(row));
    return acc;
  }, {});
}

function useDashboardData() {
  const [state, setState] = React.useState({ loading: true, error: null, data: null });

  React.useEffect(() => {
    let alive = true;
    fetch(`${import.meta.env.BASE_URL}logistics-leasing/data/dashboard.json`, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`데이터를 불러오지 못했습니다. (${response.status})`);
        return response.json();
      })
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((error) => alive && setState({ loading: false, error, data: null }));
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

function Section({ title, meta, children, actions }) {
  return (
    <section className="ll-section" data-qa-section={title} data-section-title={title} data-testid="logistics-section">
      <div className="ll-section-head">
        <div>
          <div className="ll-section-title">{title}</div>
          {meta ? <div className="ll-section-meta">{meta}</div> : null}
        </div>
        {actions ? <div className="ll-toolbar">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function MetricTile({ label, value, note, onClick, qa }) {
  return (
    <button
      className="ll-metric"
      type="button"
      onClick={onClick}
      data-qa-click="metric"
      data-qa-metric={qa || label}
      data-qa-company-kpi={qa?.startsWith('company-kpi') ? qa : undefined}
      data-qa-admin-review={qa?.startsWith('admin-review') ? qa : undefined}
      data-testid="logistics-metric"
    >
      <div className="ll-metric-label">{label}</div>
      <div className="ll-metric-value">{value}</div>
      {note ? <div className="ll-metric-note">{note}</div> : null}
    </button>
  );
}

function CompactTable({ columns, rows, onRowClick, limit = 100 }) {
  const visibleRows = rows.slice(0, limit);
  if (!visibleRows.length) return <div className="ll-empty">표시할 데이터가 없습니다.</div>;
  const handleRowKeyDown = (event, row) => {
    if (!onRowClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick(row);
    }
  };
  return (
    <div className="ll-table-wrap" data-testid="logistics-table">
      <table className="ll-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row, index) => (
            <tr
              key={row.id || row.leaseId || row.issueId || row.tenantId || row.assetId || index}
              className={onRowClick ? 'll-clickable-row' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={(event) => handleRowKeyDown(event, row)}
              data-testid={onRowClick ? 'logistics-table-row' : undefined}
            >
              {columns.map((column, columnIndex) => {
                const content = column.render ? column.render(row) : row[column.key];
                return (
                  <td key={column.key}>
                    {columnIndex === 0 && onRowClick ? <span className="ll-row-primary" data-qa-click="table-row">{content ?? '-'}</span> : content ?? '-'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyGrid({ items }) {
  const formatValue = (value, depth = 0) => {
    if (value === null || value === undefined || value === '') return '-';
    if (React.isValidElement(value)) return '';
    if (Array.isArray(value)) return value.length ? value.map((item) => formatValue(item, depth + 1)).join(', ') : '-';
    if (typeof value === 'object') {
      if (depth >= 3) return JSON.stringify(value);
      return Object.entries(value)
        .map(([key, entryValue]) => `${key}: ${formatValue(entryValue, depth + 1)}`)
        .join(' / ');
    }
    return String(value);
  };
  const renderValue = (value) => {
    if (React.isValidElement(value)) return value;
    return formatValue(value);
  };
  return (
    <div className="ll-key-grid" data-testid="logistics-key-grid">
      {items.map(([label, value]) => (
        <div className="ll-key-item" key={label}>
          <div className="ll-key-label">{label}</div>
          <div className="ll-key-value">{renderValue(value)}</div>
        </div>
      ))}
    </div>
  );
}

function BarList({ rows, valueFormatter = fmtNumber, onRowClick, qa }) {
  const max = Math.max(...rows.map((row) => toNumber(row.value)), 1);
  if (!rows.length) return <div className="ll-empty">표시할 데이터가 없습니다.</div>;
  return (
    <div className="ll-bar-list" data-qa-chart={qa} data-testid="logistics-bar-list">
      {rows.map((row) => (
        <button
          className="ll-bar-row"
          key={row.id || row.label}
          type="button"
          onClick={() => onRowClick?.(row)}
          data-qa-click="chart"
        >
          <span className="ll-bar-label">{row.label}</span>
          <span className="ll-bar-track" aria-hidden="true">
            <span className="ll-bar-fill" style={{ width: `${Math.max(4, (toNumber(row.value) / max) * 100)}%` }} />
          </span>
          <span className="ll-bar-value">{valueFormatter(row.value)}</span>
        </button>
      ))}
    </div>
  );
}

function LineChart({ rows, onClick, qa }) {
  const points = rows.slice(-18);
  if (!points.length) return <div className="ll-empty">차트 데이터가 없습니다.</div>;
  const max = Math.max(...points.map((row) => toNumber(row.monthlyCostTotal)), 1);
  const width = 720;
  const height = 210;
  const coords = points.map((row, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * (width - 40) + 20;
    const y = height - 24 - (toNumber(row.monthlyCostTotal) / max) * (height - 54);
    return { x, y, row };
  });
  const d = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  return (
    <button className="ll-row-button ll-chart" type="button" onClick={onClick} data-qa-click="chart" data-qa-chart={qa} data-testid="logistics-chart">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="230" role="img" aria-label="월 임관리비 추이">
        <line x1="20" y1={height - 24} x2={width - 20} y2={height - 24} stroke="#444" />
        <path d={d} fill="none" stroke="#82afb9" strokeWidth="3" />
        {coords.map((point) => (
          <g key={point.row.month}>
            <circle cx={point.x} cy={point.y} r="4" fill="#fbf167" />
            <text x={point.x} y={height - 6} textAnchor="middle" fill="#86868b" fontSize="10">
              {point.row.month}
            </text>
          </g>
        ))}
      </svg>
    </button>
  );
}

function MapPanel({ assets, onAssetClick }) {
  const mapped = assets.filter((asset) => asset.map?.latitude && asset.map?.longitude);
  if (!mapped.length) return <div className="ll-empty">좌표가 있는 자산이 없습니다.</div>;
  const lats = mapped.map((asset) => toNumber(asset.map.latitude));
  const lngs = mapped.map((asset) => toNumber(asset.map.longitude));
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return (
    <div className="ll-map" data-qa-map="portfolio" data-testid="logistics-map">
      {mapped.map((asset) => {
        const left = 8 + ((toNumber(asset.map.longitude) - minLng) / Math.max(maxLng - minLng, 0.001)) * 84;
        const top = 88 - ((toNumber(asset.map.latitude) - minLat) / Math.max(maxLat - minLat, 0.001)) * 76;
        return (
          <button
            key={asset.assetId}
            className="ll-map-pin"
            type="button"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={asset.assetName}
            aria-label={`${asset.assetName} 자산 상세 열기`}
            onClick={() => onAssetClick(asset)}
            data-qa-click="map-marker"
          />
        );
      })}
    </div>
  );
}

function Modal({ modal, onClose }) {
  const closeButtonRef = React.useRef(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!modal) return undefined;
    const previousActiveElement = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [modal, onClose]);

  if (!modal) return null;
  return (
    <>
      <div className="ll-modal-backdrop" onClick={onClose} />
      <div className="ll-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} data-qa-layer="modal" data-testid="logistics-modal">
        <div className="ll-layer-head">
          <div>
            <div className="ll-layer-title" id={titleId}>{modal.title}</div>
            {modal.note ? <div className="ll-section-meta">{modal.note}</div> : null}
          </div>
          <button className="ll-close" type="button" onClick={onClose} ref={closeButtonRef}>닫기</button>
        </div>
        {modal.body}
      </div>
    </>
  );
}

function Drawer({ drawer, onClose }) {
  const closeButtonRef = React.useRef(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!drawer) return undefined;
    const previousActiveElement = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [drawer, onClose]);

  if (!drawer) return null;
  return (
    <>
      <div className="ll-drawer-backdrop" onClick={onClose} />
      <aside className="ll-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} data-qa-layer="drawer" data-testid="logistics-drawer">
        <div className="ll-layer-head">
          <div>
            <div className="ll-layer-title" id={titleId}>{drawer.title}</div>
            {drawer.note ? <div className="ll-section-meta">{drawer.note}</div> : null}
          </div>
          <button className="ll-close" type="button" onClick={onClose} ref={closeButtonRef}>닫기</button>
        </div>
        {drawer.body}
      </aside>
    </>
  );
}

function assetColumns() {
  return [
    { key: 'assetName', label: '자산명' },
    { key: 'fundName', label: '펀드명' },
    { key: 'grossFloorAreaSqm', label: '연면적', render: (row) => fmtArea(row.grossFloorAreaSqm) },
    { key: 'leasedAreaSqm', label: '임대면적', render: (row) => fmtArea(row.leasedAreaSqm) },
    { key: 'vacancyRate', label: '공실률', render: (row) => fmtPercent(row.vacancyRate) },
    { key: 'monthlyCostTotal', label: '월 임관리비', render: (row) => fmtCurrency(row.monthlyCostTotal) },
  ];
}

function leaseColumns() {
  return [
    { key: 'tenantName', label: '임차인명' },
    { key: 'assetName', label: '자산명' },
    { key: 'floor', label: '임차 층' },
    { key: 'space', label: '임차 구역' },
    { key: 'leasedAreaSqm', label: '임대면적', render: (row) => fmtArea(row.leasedAreaSqm) },
    { key: 'endDate', label: '계약만기일', render: (row) => normalizeDate(row.endDate) || '-' },
  ];
}

function tenantColumns() {
  return [
    { key: 'tenantName', label: '임차인명' },
    { key: 'businessNumber', label: '사업자번호' },
    { key: 'assetCount', label: '임차 자산 수', render: (row) => fmtNumber(row.assetCount) },
    { key: 'leasedAreaSqm', label: '임대면적', render: (row) => fmtArea(row.leasedAreaSqm) },
    { key: 'monthlyCostTotal', label: '월 임관리비', render: (row) => fmtCurrency(row.monthlyCostTotal) },
  ];
}

function coordinateColumns() {
  return [
    { key: 'assetName', label: '자산명' },
    { key: 'fundName', label: '펀드명' },
    { key: 'address', label: '주소', render: (row) => row.map?.address || '-' },
    { key: 'latitude', label: '위도', render: (row) => row.map?.latitude || '-' },
    { key: 'longitude', label: '경도', render: (row) => row.map?.longitude || '-' },
  ];
}

export default function LogisticsLeasingDashboard() {
  const { loading, error, data } = useDashboardData();
  const [activeTab, setActiveTab] = React.useState('weekly');
  const [query, setQuery] = React.useState('');
  const [weeklyView, setWeeklyView] = React.useState('core');
  const [selectedAssetId, setSelectedAssetId] = React.useState('');
  const [selectedTenantId, setSelectedTenantId] = React.useState('');
  const [modal, setModal] = React.useState(null);
  const [drawer, setDrawer] = React.useState(null);
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [regionFilter, setRegionFilter] = React.useState('전체');
  const [playgroundDimension, setPlaygroundDimension] = React.useState('asset');
  const [playgroundMetric, setPlaygroundMetric] = React.useState('monthlyCostTotal');
  const [playgroundTopN, setPlaygroundTopN] = React.useState(20);
  const [playgroundFilter, setPlaygroundFilter] = React.useState('전체');
  const [qualityFilter, setQualityFilter] = React.useState('전체');
  const [qualitySheetFilter, setQualitySheetFilter] = React.useState('전체');
  const [toolFiltersReady, setToolFiltersReady] = React.useState(false);
  const [toolAssetIds, setToolAssetIds] = React.useState([]);
  const [toolTenantIds, setToolTenantIds] = React.useState([]);

  React.useEffect(() => {
    if (data?.assets?.length && !selectedAssetId) setSelectedAssetId(data.assets[0].assetId);
    if (data?.tenants?.length && !selectedTenantId) setSelectedTenantId(data.tenants[0].tenantId);
    if (data?.assets?.length && data?.tenants?.length && !toolFiltersReady) {
      setToolAssetIds(data.assets.map((asset) => asset.assetId));
      setToolTenantIds(data.tenants.map((tenant) => tenant.tenantId));
      setToolFiltersReady(true);
    }
  }, [data, selectedAssetId, selectedTenantId, toolFiltersReady]);

  const assets = data?.assets || [];
  const tenants = data?.tenants || [];
  const leases = data?.leases || [];
  const issues = data?.issues || [];
  const monthlyTrend = data?.monthlyTrend || [];
  const selectedAsset = assets.find((asset) => asset.assetId === selectedAssetId) || assets[0];
  const selectedTenant = tenants.find((tenant) => tenant.tenantId === selectedTenantId) || tenants[0];
  const regions = ['전체', ...Array.from(new Set(assets.map(getRegion))).sort()];
  const qualitySheets = ['전체', ...Array.from(new Set(issues.map((issue) => issue.sheet || '미기재'))).filter((sheet) => sheet !== '전체').sort()];
  const searchSuggestions = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (keyword.length < 2) return [];
    const tabMatches = TABS
      .filter((tab) => `${tab.title} ${tab.group}`.toLowerCase().includes(keyword))
      .slice(0, 3)
      .map((tab) => ({ id: `tab-${tab.id}`, type: '탭', label: tab.title, detail: tab.group, action: () => setActiveTab(tab.id) }));
    const assetMatches = assets
      .filter((asset) => `${asset.assetName} ${asset.fundName} ${asset.assetCode}`.toLowerCase().includes(keyword))
      .slice(0, 5)
      .map((asset) => ({ id: `asset-${asset.assetId}`, type: '자산', label: asset.assetName, detail: asset.fundName, action: () => { setSelectedAssetId(asset.assetId); setActiveTab('asset'); } }));
    const tenantMatches = tenants
      .filter((tenant) => `${tenant.tenantName} ${tenant.businessNumber}`.toLowerCase().includes(keyword))
      .slice(0, 5)
      .map((tenant) => ({ id: `tenant-${tenant.tenantId}`, type: '기업', label: tenant.tenantName, detail: tenant.businessNumber, action: () => { setSelectedTenantId(tenant.tenantId); setActiveTab('company'); } }));
    return [...tabMatches, ...assetMatches, ...tenantMatches].slice(0, 9);
  }, [assets, query, tenants]);

  const applySearchSuggestion = React.useCallback((suggestion) => {
    suggestion.action();
    setQuery('');
    setSearchFocused(false);
  }, []);

  const openMetric = React.useCallback((title, rows, columns, note) => {
    setModal({
      title,
      note,
      body: <CompactTable columns={columns} rows={rows} limit={300} />,
    });
  }, []);

  const openAssetDrawer = React.useCallback((asset) => {
    const assetLeases = leases.filter((lease) => lease.assetId === asset.assetId);
    const manager = (data?.managers || []).find((item) => item.assetId === asset.assetId);
    setDrawer({
      title: asset.assetName,
      note: '자산 상세',
      body: (
        <div className="ll-stack">
          <KeyGrid items={[
            ['자산코드', asset.assetCode],
            ['펀드명', asset.fundName],
            ['연면적', fmtArea(asset.grossFloorAreaSqm)],
            ['임대면적', fmtArea(asset.leasedAreaSqm)],
            ['공실률', fmtPercent(asset.vacancyRate)],
            ['담당자', manager ? `${manager.manager} / ${manager.team}` : '-'],
            ['주소', asset.map?.address || '-'],
            ['월 임관리비', fmtCurrency(asset.monthlyCostTotal)],
          ]} />
          <Section title="임차인 현황" meta="행 클릭 시 임차인 상세">
            <CompactTable columns={leaseColumns()} rows={assetLeases} onRowClick={(lease) => {
              const tenant = tenants.find((item) => item.tenantId === lease.tenantId);
              if (tenant) openTenantDrawer(tenant);
            }} />
          </Section>
        </div>
      ),
    });
  }, [data?.managers, leases, tenants]);

  const openTenantDrawer = React.useCallback((tenant) => {
    const tenantLeases = leases.filter((lease) => lease.tenantId === tenant.tenantId);
    setDrawer({
      title: tenant.tenantName,
      note: '임차인 상세',
      body: (
        <div className="ll-stack">
          <KeyGrid items={[
            ['사업자번호', tenant.businessNumber],
            ['임차 자산 수', fmtNumber(tenant.assetCount)],
            ['계약/공간 수', fmtNumber(tenant.leaseCount)],
            ['임대면적', fmtArea(tenant.leasedAreaSqm)],
            ['월 임관리비', fmtCurrency(tenant.monthlyCostTotal)],
          ]} />
          <Section title="계약 목록" meta="행 클릭 시 계약 상세">
            <CompactTable columns={leaseColumns()} rows={tenantLeases} onRowClick={(lease) => {
              setDrawer({
                title: `${lease.tenantName} 계약 상세`,
                note: lease.assetName,
                body: <KeyGrid items={[
                  ['자산명', lease.assetName],
                  ['임차 층', lease.floor],
                  ['임차 구역', lease.space],
                  ['취급 상품', lease.goodsType],
                  ['저온창고 여부', lease.coldStorage],
                  ['임대면적', fmtArea(lease.leasedAreaSqm)],
                  ['계약개시일', normalizeDate(lease.startDate)],
                  ['계약만기일', normalizeDate(lease.endDate)],
                  ['RF', lease.rf],
                  ['FO', lease.fo],
                  ['TI', lease.ti],
                  ['계약 상태', lease.status],
                ]} />,
              });
            }} />
          </Section>
        </div>
      ),
    });
  }, [leases]);

  const openCoordinateModal = React.useCallback((title, rows) => {
    setModal({
      title,
      note: '좌표 보유 자산 목록입니다. 행을 누르면 자산 상세가 열립니다.',
      body: <CompactTable columns={coordinateColumns()} rows={rows.filter((asset) => asset.map?.latitude && asset.map?.longitude)} onRowClick={openAssetDrawer} limit={300} />,
    });
  }, [openAssetDrawer]);

  const openMapModal = React.useCallback((title, rows) => {
    const mappedRows = rows.filter((asset) => asset.map?.latitude && asset.map?.longitude);
    setModal({
      title,
      note: '마커 또는 하단 표 행을 누르면 자산 상세가 열립니다.',
      body: (
        <div className="ll-modal-map">
          <MapPanel assets={mappedRows} onAssetClick={openAssetDrawer} />
          <CompactTable columns={coordinateColumns()} rows={mappedRows} onRowClick={openAssetDrawer} limit={300} />
        </div>
      ),
    });
  }, [openAssetDrawer]);

  const filteredAssets = React.useMemo(() => {
    return assets.filter((asset) => {
      const matchesRegion = regionFilter === '전체' || getRegion(asset) === regionFilter;
      const text = `${asset.assetName} ${asset.fundName} ${asset.assetCode}`.toLowerCase();
      return matchesRegion && text.includes(query.toLowerCase());
    });
  }, [assets, query, regionFilter]);

  const groupedTabs = TABS.reduce((acc, tab) => {
    acc[tab.group] = acc[tab.group] || [];
    acc[tab.group].push(tab);
    return acc;
  }, {});
  const closeModal = React.useCallback(() => setModal(null), []);
  const closeDrawer = React.useCallback(() => setDrawer(null), []);

  if (loading) {
    return <div className="ll-shell" data-testid="logistics-dashboard"><main className="ll-main"><div className="ll-page"><div className="ll-empty">데이터를 불러오는 중입니다.</div></div></main></div>;
  }

  if (error || !data) {
    return <div className="ll-shell" data-testid="logistics-dashboard"><main className="ll-main"><div className="ll-page"><div className="ll-empty">{error?.message || '데이터가 없습니다.'}</div></div></main></div>;
  }

  const renderWeekly = () => {
    const openIssues = issues.filter((issue) => !issue.checked);
    const topAssets = assets.slice().sort((a, b) => b.grossFloorAreaSqm - a.grossFloorAreaSqm);
    return (
      <div className="ll-stack">
        <div className="ll-grid-4">
          <MetricTile label="총 자산 수" value={fmtNumber(data.summary.assetCount)} note="클릭 시 자산 목록" onClick={() => openMetric('총 자산 수 상세', assets, assetColumns(), '원본 자산 목록')} />
          <MetricTile label="총 연면적" value={fmtArea(data.summary.grossFloorAreaSqm)} note="클릭 시 면적 근거" onClick={() => openMetric('총 연면적 상세', assets, assetColumns(), '자산별 연면적 합산')} />
          <MetricTile label="확인 필요 이슈" value={fmtNumber(data.summary.issueCount)} note="클릭 시 이슈 목록" onClick={() => openMetric('확인 필요 이슈', openIssues, [
            { key: 'sheet', label: '시트' },
            { key: 'asset', label: '자산' },
            { key: 'content', label: '내용' },
          ], 'Log sheet 기준')} />
          <MetricTile label="월 임관리비" value={fmtCurrency(data.summary.monthlyCostTotal)} note="클릭 시 임대료 히스토리" onClick={() => openMetric('월 임관리비 히스토리', data.rentHistory || [], [
            { key: 'assetName', label: '자산명' },
            { key: 'tenantName', label: '임차인명' },
            { key: 'baseDate', label: '기준일자', render: (row) => normalizeDate(row.baseDate) },
            { key: 'monthlyRentTotal', label: '월임대료', render: (row) => fmtCurrency(row.monthlyRentTotal) },
            { key: 'monthlyMfTotal', label: '월관리비', render: (row) => fmtCurrency(row.monthlyMfTotal) },
          ], 'DB_히스토리 누적 기준')} />
        </div>
        <Section title="신규 투자 Projects" meta="확인 필요 항목을 우선 표시합니다.">
          <CompactTable columns={[
            { key: 'date', label: '일자', render: (row) => normalizeDate(row.date) },
            { key: 'sheet', label: '시트' },
            { key: 'asset', label: '자산' },
            { key: 'content', label: '내용' },
          ]} rows={openIssues.slice(0, 8)} onRowClick={(row) => setModal({ title: '이슈 상세', body: <KeyGrid items={Object.entries(row)} /> })} />
        </Section>
        <Section title="관리 Projects" meta="자산 규모 순 관리 현황">
          <CompactTable columns={assetColumns()} rows={topAssets.slice(0, 12)} onRowClick={openAssetDrawer} />
        </Section>
        <Section
          title="자산현황"
          meta="운영 핵심 보기 / 원문 전체 보기"
          actions={<>
            <button className={`ll-segment ${weeklyView === 'core' ? 'active' : ''}`} type="button" onClick={() => setWeeklyView('core')}>운영 핵심 보기</button>
            <button className={`ll-segment ${weeklyView === 'full' ? 'active' : ''}`} type="button" onClick={() => setWeeklyView('full')}>원문 전체 보기</button>
          </>}
        >
          <CompactTable columns={weeklyView === 'core' ? assetColumns() : [
            ...assetColumns(),
            { key: 'tenantCount', label: '임차인 수', render: (row) => fmtNumber(row.tenantCount) },
            { key: 'leaseCount', label: '계약/공간 수', render: (row) => fmtNumber(row.leaseCount) },
            { key: 'assetCode', label: '자산코드' },
          ]} rows={assets} onRowClick={openAssetDrawer} />
        </Section>
        <Section title="기준 및 기타사항" meta="원본 보존 및 Supabase 전환 상태">
          <KeyGrid items={[
            ['현재 source', data.source.type],
            ['기준 파일', data.source.fileName],
            ['데이터 전환', '승인된 snapshot 기준으로 순차 반영'],
            ['보안 처리', '서버 전용'],
          ]} />
        </Section>
      </div>
    );
  };

  const renderHome = () => (
    (() => {
      const coldGroups = groupRows(leases, (lease) => lease.coldStorage === 'Y' ? '저온' : lease.coldStorage === 'N' ? '상온' : '미기재', (lease) => lease.leasedAreaSqm);
      const coldRows = Object.entries(coldGroups).map(([label, value]) => ({ id: label, label, value, rows: leases.filter((lease) => (lease.coldStorage === 'Y' ? '저온' : lease.coldStorage === 'N' ? '상온' : '미기재') === label) }));
      const sectorGroups = groupRows(assets, (asset) => asset.sector || getRegion(asset), (asset) => asset.monthlyCostTotal);
      const sectorRows = Object.entries(sectorGroups).map(([label, value]) => ({ id: label, label, value, rows: assets.filter((asset) => (asset.sector || getRegion(asset)) === label) }));
      const expiryGroups = [
        { id: 'm12', label: '12개월 이내', rows: leases.filter((lease) => monthsTo(lease.endDate) !== null && monthsTo(lease.endDate) <= 12) },
        { id: 'm24', label: '12~24개월', rows: leases.filter((lease) => monthsTo(lease.endDate) !== null && monthsTo(lease.endDate) > 12 && monthsTo(lease.endDate) <= 24) },
        { id: 'm25', label: '24개월 초과', rows: leases.filter((lease) => monthsTo(lease.endDate) !== null && monthsTo(lease.endDate) > 24) },
      ].map((item) => ({ ...item, value: item.rows.length }));
      return (
    <div className="ll-stack">
      <div className="ll-grid-4">
        <MetricTile label="운영 자산" value={fmtNumber(data.summary.assetCount)} note="자산 목록" onClick={() => openMetric('운영 자산 목록', assets, assetColumns())} />
        <MetricTile label="임대면적" value={fmtArea(data.summary.leasedAreaSqm)} note="임대면적 근거" onClick={() => openMetric('임대면적 근거', assets, assetColumns())} />
        <MetricTile label="공실률" value={fmtPercent(data.summary.vacancyRate)} note="공실률 계산" onClick={() => openMetric('공실률 계산 근거', assets, assetColumns())} />
        <MetricTile label="월 임관리비" value={fmtCurrency(data.summary.monthlyCostTotal)} note="월별 히스토리" onClick={() => openMetric('월 임관리비 근거', data.rentHistory || [], [
          { key: 'assetName', label: '자산명' },
          { key: 'tenantName', label: '임차인명' },
          { key: 'monthlyRentTotal', label: '월임대료', render: (row) => fmtCurrency(row.monthlyRentTotal) },
          { key: 'monthlyMfTotal', label: '월관리비', render: (row) => fmtCurrency(row.monthlyMfTotal) },
        ])} />
      </div>
      <Section title="임대료 추이" meta="차트 클릭 시 원본 표">
        <LineChart rows={monthlyTrend} qa="home-rent" onClick={() => openMetric('임대료 추이 원본', monthlyTrend, [
          { key: 'month', label: '월' },
          { key: 'monthlyRentTotal', label: '월임대료', render: (row) => fmtCurrency(row.monthlyRentTotal) },
          { key: 'monthlyMfTotal', label: '월관리비', render: (row) => fmtCurrency(row.monthlyMfTotal) },
          { key: 'monthlyCostTotal', label: '월 임관리비', render: (row) => fmtCurrency(row.monthlyCostTotal) },
        ])} />
      </Section>
      <div className="ll-grid-3">
        <Section title="저온/상온 구성" meta="막대 클릭 시 원본 계약">
          <BarList rows={coldRows} valueFormatter={fmtArea} qa="home-cold" onRowClick={(row) => openMetric(`${row.label} 구성 상세`, row.rows, leaseColumns())} />
        </Section>
        <Section title="섹터 구성" meta="막대 클릭 시 원본 자산">
          <BarList rows={sectorRows} valueFormatter={fmtCurrency} qa="home-sector" onRowClick={(row) => openMetric(`${row.label} 자산 상세`, row.rows, assetColumns())} />
        </Section>
        <Section title="만기 집중도" meta="막대 클릭 시 계약 상세">
          <BarList rows={expiryGroups} valueFormatter={fmtNumber} qa="home-expiry" onRowClick={(row) => openMetric(`${row.label} 계약`, row.rows, leaseColumns())} />
        </Section>
      </div>
      <Section title="포트폴리오 지도" meta="마커 클릭 시 자산 상세" actions={<>
        <button className="ll-button" type="button" onClick={() => openMapModal('포트폴리오 지도 상세', assets)} data-qa-home-map-detail="true">지도 크게 보기</button>
        <button className="ll-button" type="button" onClick={() => openCoordinateModal('포트폴리오 좌표 표', assets)} data-qa-home-map-list="true">좌표 표</button>
      </>}>
        <MapPanel assets={assets} onAssetClick={openAssetDrawer} />
      </Section>
      <Section title="공실 현황" meta="행 클릭 시 자산 상세">
        <CompactTable columns={assetColumns()} rows={assets.slice().sort((a, b) => b.vacancyRate - a.vacancyRate)} onRowClick={openAssetDrawer} />
      </Section>
      <Section title="주요 임차인" meta="행 클릭 시 임차인 상세">
        <CompactTable columns={tenantColumns()} rows={tenants.slice().sort((a, b) => b.monthlyCostTotal - a.monthlyCostTotal)} onRowClick={openTenantDrawer} />
      </Section>
    </div>
      );
    })()
  );

  const renderAsset = () => {
    if (!selectedAsset) return <div className="ll-empty">자산 데이터가 없습니다.</div>;
    const assetLeases = leases.filter((lease) => lease.assetId === selectedAsset.assetId);
    const assetRentRows = (data.rentHistory || [])
      .filter((row) => row.assetId === selectedAsset.assetId)
      .reduce((acc, row) => {
        const key = row.tenantName || '미기재';
        acc[key] = acc[key] || { id: key, label: key, value: 0, rows: [] };
        acc[key].value += toNumber(row.monthlyRentTotal) + toNumber(row.monthlyMfTotal);
        acc[key].rows.push(row);
        return acc;
      }, {});
    const assetExpiryRows = assetLeases
      .map((lease) => ({ id: lease.leaseId, label: `${lease.tenantName} / ${normalizeDate(lease.endDate) || '-'}`, value: toNumber(lease.leasedAreaSqm), rows: [lease] }))
      .sort((a, b) => b.value - a.value);
    const stackRows = assetLeases.map((lease) => ({
      ...lease,
      id: lease.leaseId,
      stackLabel: `${lease.floor || '-'} / ${lease.space || '-'}`,
    }));
    return (
      <div className="ll-stack">
        <Section title="자산 선택" actions={<select className="ll-select" value={selectedAsset.assetId} onChange={(event) => setSelectedAssetId(event.target.value)} data-qa-select="asset">
          {assets.map((asset) => <option key={asset.assetId} value={asset.assetId}>{asset.assetName}</option>)}
        </select>}>
          <KeyGrid items={[
            ['자산명', selectedAsset.assetName],
            ['펀드명', selectedAsset.fundName],
            ['주소', selectedAsset.map?.address],
            ['자산코드', selectedAsset.assetCode],
          ]} />
        </Section>
        <div className="ll-grid-4">
          <MetricTile label="연면적" value={fmtArea(selectedAsset.grossFloorAreaSqm)} onClick={() => setModal({ title: '연면적 근거', body: <KeyGrid items={Object.entries(selectedAsset)} /> })} />
          <MetricTile label="임대면적" value={fmtArea(selectedAsset.leasedAreaSqm)} onClick={() => openMetric('임차인 현황', assetLeases, leaseColumns())} />
          <MetricTile label="공실률" value={fmtPercent(selectedAsset.vacancyRate)} onClick={() => setModal({ title: '공실률 계산', body: <KeyGrid items={[
            ['연면적', fmtArea(selectedAsset.grossFloorAreaSqm)],
            ['임대면적', fmtArea(selectedAsset.leasedAreaSqm)],
            ['공실면적', fmtArea(selectedAsset.vacancyAreaSqm)],
            ['공실률', fmtPercent(selectedAsset.vacancyRate)],
          ]} /> })} />
          <MetricTile label="월 임관리비" value={fmtCurrency(selectedAsset.monthlyCostTotal)} onClick={() => openMetric('자산 임대료 히스토리', (data.rentHistory || []).filter((row) => row.assetId === selectedAsset.assetId), [
            { key: 'tenantName', label: '임차인명' },
            { key: 'baseDate', label: '기준일자', render: (row) => normalizeDate(row.baseDate) },
            { key: 'monthlyRentTotal', label: '월임대료', render: (row) => fmtCurrency(row.monthlyRentTotal) },
            { key: 'monthlyMfTotal', label: '월관리비', render: (row) => fmtCurrency(row.monthlyMfTotal) },
          ])} />
        </div>
        <Section title="E.NOC 검산" meta="원본 검산 필드가 snapshot에 있을 때 같은 위치에 표시합니다.">
          <button className="ll-action-button" type="button" data-qa-asset-enoc="true" onClick={() => setModal({
            title: 'E.NOC 검산 결과',
            note: '현재 공개 snapshot에는 검산 전용 필드가 없어 원본 값 표시 전 대기 상태입니다.',
            body: <KeyGrid items={[
              ['자산명', selectedAsset.assetName],
              ['상태', '검산 전용 필드 미연동'],
              ['표시 기준', '원본 snapshot 값만 표시'],
            ]} />,
          })}>E.NOC 검산 결과 보기</button>
        </Section>
        <div className="ll-grid-3">
          <Section title="임차인별 월 임관리비" meta="막대 클릭 시 히스토리 원본">
            <BarList rows={Object.values(assetRentRows)} valueFormatter={fmtCurrency} qa="asset-rent" onRowClick={(row) => openMetric(`${row.label} 임관리비 히스토리`, row.rows, [
              { key: 'baseDate', label: '기준일자', render: (item) => normalizeDate(item.baseDate) },
              { key: 'tenantName', label: '임차인명' },
              { key: 'monthlyRentTotal', label: '월임대료', render: (item) => fmtCurrency(item.monthlyRentTotal) },
              { key: 'monthlyMfTotal', label: '월관리비', render: (item) => fmtCurrency(item.monthlyMfTotal) },
            ])} />
          </Section>
          <Section title="만기 스냅샷" meta="막대 클릭 시 계약 상세">
            <BarList rows={assetExpiryRows} valueFormatter={fmtArea} qa="asset-expiry" onRowClick={(row) => openMetric(row.label, row.rows, leaseColumns())} />
          </Section>
          <Section title="면적 구성" meta="원본 자산 면적 필드">
            <BarList rows={[
              { id: 'gross', label: '연면적', value: selectedAsset.grossFloorAreaSqm },
              { id: 'leased', label: '임대면적', value: selectedAsset.leasedAreaSqm },
              { id: 'vacancy', label: '공실면적', value: selectedAsset.vacancyAreaSqm },
            ]} valueFormatter={fmtArea} qa="asset-area" onRowClick={(row) => setModal({ title: `${row.label} 상세`, body: <KeyGrid items={[[row.label, fmtArea(row.value)], ['자산명', selectedAsset.assetName]]} /> })} />
          </Section>
        </div>
        <Section title="임차인 현황" meta="행 클릭 시 임차인 상세">
          <CompactTable columns={leaseColumns()} rows={assetLeases} onRowClick={(lease) => {
            const tenant = tenants.find((item) => item.tenantId === lease.tenantId);
            if (tenant) openTenantDrawer(tenant);
          }} />
        </Section>
        <Section title="스태킹 플랜" meta="층/구역별 임차 현황">
          <CompactTable columns={[
            { key: 'stackLabel', label: '층 / 구역' },
            { key: 'tenantName', label: '임차인명' },
            { key: 'leasedAreaSqm', label: '임대면적', render: (row) => fmtArea(row.leasedAreaSqm) },
            { key: 'endDate', label: '계약만기일', render: (row) => normalizeDate(row.endDate) || '-' },
          ]} rows={stackRows} onRowClick={(lease) => setModal({ title: '스태킹 상세', body: <KeyGrid items={Object.entries(lease)} /> })} />
        </Section>
        <Section title="자산 위치" actions={<>
          <button className="ll-button" type="button" onClick={() => openMapModal(`${selectedAsset.assetName} 위치 상세`, [selectedAsset])} data-qa-asset-map-detail="true">지도 크게 보기</button>
          <button className="ll-button" type="button" onClick={() => openCoordinateModal(`${selectedAsset.assetName} 좌표`, [selectedAsset])}>좌표 표</button>
        </>}>
          <MapPanel assets={[selectedAsset]} onAssetClick={openAssetDrawer} />
        </Section>
      </div>
    );
  };

  const renderCompany = () => {
    if (!selectedTenant) return <div className="ll-empty">기업 데이터가 없습니다.</div>;
    const tenantLeases = leases.filter((lease) => lease.tenantId === selectedTenant.tenantId);
    const tenantAssets = assets.filter((asset) => selectedTenant.assetIds?.includes(asset.assetId));
    const exposureRows = tenantAssets
      .map((asset) => ({ id: asset.assetId, label: asset.assetName, value: asset.leasedAreaSqm, raw: asset }))
      .sort((a, b) => b.value - a.value);
    return (
      <div className="ll-stack">
        <Section title="기업 선택" actions={<select className="ll-select" value={selectedTenant.tenantId} onChange={(event) => setSelectedTenantId(event.target.value)} data-qa-select="company">
          {tenants.map((tenant) => <option key={tenant.tenantId} value={tenant.tenantId}>{tenant.tenantName}</option>)}
        </select>}>
          <KeyGrid items={[
            ['임차인명', selectedTenant.tenantName],
            ['사업자번호', selectedTenant.businessNumber],
            ['임차 자산 수', fmtNumber(selectedTenant.assetCount)],
            ['월 임관리비', fmtCurrency(selectedTenant.monthlyCostTotal)],
          ]} />
        </Section>
        <div className="ll-grid-4">
          <MetricTile label="임차 자산 수" value={fmtNumber(selectedTenant.assetCount)} qa="company-kpi-assets" onClick={() => openMetric('임차 자산 목록', tenantAssets, assetColumns())} />
          <MetricTile label="계약/공간 수" value={fmtNumber(selectedTenant.leaseCount)} qa="company-kpi-leases" onClick={() => openMetric('계약 목록', tenantLeases, leaseColumns())} />
          <MetricTile label="임대면적" value={fmtArea(selectedTenant.leasedAreaSqm)} qa="company-kpi-area" onClick={() => openMetric('임대면적 근거', tenantLeases, leaseColumns())} />
          <MetricTile label="월 임관리비" value={fmtCurrency(selectedTenant.monthlyCostTotal)} qa="company-kpi-cost" onClick={() => openMetric('월 임관리비 근거', tenantLeases, leaseColumns())} />
        </div>
        <Section title="임차 자산 지도" meta="마커 클릭 시 자산 상세" actions={<>
          <button className="ll-button" type="button" onClick={() => openMapModal(`${selectedTenant.tenantName} 임차 자산 지도`, tenantAssets)} data-qa-company-map-detail="true">지도 크게 보기</button>
          <button className="ll-button" type="button" onClick={() => openCoordinateModal(`${selectedTenant.tenantName} 좌표 표`, tenantAssets)}>좌표 표</button>
        </>}>
          <MapPanel assets={tenantAssets} onAssetClick={openAssetDrawer} />
        </Section>
        <Section title="자산별 노출도" meta="막대 클릭 시 자산 상세">
          <BarList rows={exposureRows} valueFormatter={fmtArea} onRowClick={(row) => openAssetDrawer(row.raw)} qa="company-exposure" />
        </Section>
        <Section title="임차 자산 목록" meta="행 클릭 시 자산 상세">
          <CompactTable columns={assetColumns()} rows={tenantAssets} onRowClick={openAssetDrawer} />
        </Section>
        <Section title="계약 목록" meta="행 클릭 시 계약 상세">
          <CompactTable columns={leaseColumns()} rows={tenantLeases} onRowClick={(lease) => setModal({ title: '계약 상세', body: <KeyGrid items={Object.entries(lease)} /> })} />
        </Section>
        <Section title="재무/운영/OpenDART" meta="외부 API 인증이 필요한 호출은 서버에서만 실행">
          <KeyGrid items={[
            ['OpenDART 상태', '서버 측 보안 호출 준비'],
            ['건축물대장 상태', '서버 측 보안 호출 준비'],
            ['브라우저 인증값', '미노출'],
            ['표시 정책', '결과 snapshot만 조회'],
          ]} />
        </Section>
      </div>
    );
  };

  const renderSector = () => {
    const regionRows = regions.filter((region) => region !== '전체').map((region) => {
      const rowAssets = assets.filter((asset) => getRegion(asset) === region);
      return {
        id: region,
        region,
        assetCount: rowAssets.length,
        leasedAreaSqm: rowAssets.reduce((sum, asset) => sum + asset.leasedAreaSqm, 0),
        monthlyCostTotal: rowAssets.reduce((sum, asset) => sum + asset.monthlyCostTotal, 0),
        vacancyRate: rowAssets.reduce((sum, asset) => sum + asset.vacancyAreaSqm, 0) / Math.max(rowAssets.reduce((sum, asset) => sum + asset.grossFloorAreaSqm, 0), 1),
      };
    });
    const expiryRows = leases.map((lease) => ({ ...lease, monthsToExpiry: monthsTo(lease.endDate) })).filter((lease) => lease.monthsToExpiry !== null).sort((a, b) => a.monthsToExpiry - b.monthsToExpiry);
    return (
      <div className="ll-stack">
        <div className="ll-grid-2">
          <Section title="권역별 노출 차트" meta="막대 클릭 시 권역 자산 목록">
            <BarList rows={regionRows.map((row) => ({ id: row.region, label: row.region, value: row.monthlyCostTotal, raw: row }))} valueFormatter={fmtCurrency} qa="sector-region" onRowClick={(row) => openMetric(`${row.label} 자산 목록`, assets.filter((asset) => getRegion(asset) === row.label), assetColumns())} />
          </Section>
          <Section title="월 임관리비 추이" meta="차트 클릭 시 원본 표">
            <LineChart rows={monthlyTrend} qa="sector-rent" onClick={() => openMetric('월 임관리비 추이 원본', monthlyTrend, [
              { key: 'month', label: '월' },
              { key: 'monthlyCostTotal', label: '월 임관리비', render: (row) => fmtCurrency(row.monthlyCostTotal) },
              { key: 'monthlyRentTotal', label: '월임대료', render: (row) => fmtCurrency(row.monthlyRentTotal) },
              { key: 'monthlyMfTotal', label: '월관리비', render: (row) => fmtCurrency(row.monthlyMfTotal) },
            ])} />
          </Section>
        </div>
        <Section title="권역별 노출" meta="행 클릭 시 권역 자산 목록">
          <CompactTable columns={[
            { key: 'region', label: '권역' },
            { key: 'assetCount', label: '자산 수', render: (row) => fmtNumber(row.assetCount) },
            { key: 'leasedAreaSqm', label: '임대면적', render: (row) => fmtArea(row.leasedAreaSqm) },
            { key: 'monthlyCostTotal', label: '월 임관리비', render: (row) => fmtCurrency(row.monthlyCostTotal) },
            { key: 'vacancyRate', label: '공실률', render: (row) => fmtPercent(row.vacancyRate) },
          ]} rows={regionRows} onRowClick={(row) => openMetric(`${row.region} 자산 목록`, assets.filter((asset) => getRegion(asset) === row.region), assetColumns())} />
        </Section>
        <Section title="만기 버킷" meta="행 클릭 시 계약 상세">
          <CompactTable columns={[
            { key: 'tenantName', label: '임차인명' },
            { key: 'assetName', label: '자산명' },
            { key: 'endDate', label: '계약만기일', render: (row) => normalizeDate(row.endDate) },
            { key: 'monthsToExpiry', label: '잔여 개월', render: (row) => fmtNumber(row.monthsToExpiry) },
          ]} rows={expiryRows.slice(0, 80)} onRowClick={(row) => setModal({ title: '만기 상세', body: <KeyGrid items={Object.entries(row)} /> })} />
        </Section>
        <Section title="자산 랭킹">
          <CompactTable columns={assetColumns()} rows={assets.slice().sort((a, b) => b.monthlyCostTotal - a.monthlyCostTotal)} onRowClick={openAssetDrawer} />
        </Section>
        <Section title="임차인 랭킹">
          <CompactTable columns={tenantColumns()} rows={tenants.slice().sort((a, b) => b.monthlyCostTotal - a.monthlyCostTotal)} onRowClick={openTenantDrawer} />
        </Section>
      </div>
    );
  };

  const renderTools = () => {
    const selectedAssetSet = new Set(toolAssetIds);
    const selectedTenantSet = new Set(toolTenantIds);
    const toolAssets = filteredAssets.filter((asset) => selectedAssetSet.has(asset.assetId));
    const toolLeases = leases.filter((lease) => selectedAssetSet.has(lease.assetId) && selectedTenantSet.has(lease.tenantId));
    const toolTenants = tenants.filter((tenant) => selectedTenantSet.has(tenant.tenantId));
    const toggleAsset = (assetId) => setToolAssetIds((current) => current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]);
    const toggleTenant = (tenantId) => setToolTenantIds((current) => current.includes(tenantId) ? current.filter((id) => id !== tenantId) : [...current, tenantId]);
    return (
      <div className="ll-stack">
        <Section title="선택 조건" actions={<>
          <select className="ll-select" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} data-qa-select="region">
            {regions.map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
          <button className="ll-button" type="button" data-qa-tools-apply="true" onClick={() => setModal({
            title: '분석 조건 적용 결과',
            body: <KeyGrid items={[
              ['선택 자산', fmtNumber(toolAssets.length)],
              ['선택 임차인', fmtNumber(toolTenants.length)],
              ['대상 계약', fmtNumber(toolLeases.length)],
              ['권역 필터', regionFilter],
            ]} />,
          })}>적용</button>
        </>}>
          <KeyGrid items={[
            ['권역 필터', regionFilter],
            ['검색어', query || '전체'],
            ['선택 자산', fmtNumber(toolAssets.length)],
            ['선택 임차인', fmtNumber(toolTenants.length)],
          ]} />
        </Section>
        <Section title="자산/기업 필터" meta="체크박스 변경 후 적용을 누르면 현재 분석 조건을 확인합니다.">
          <div className="ll-filter-grid">
            <div>
              <div className="ll-filter-head">
                <span>자산</span>
                <button className="ll-mini-button" type="button" onClick={() => setToolAssetIds(assets.map((asset) => asset.assetId))}>전체 선택</button>
                <button className="ll-mini-button" type="button" onClick={() => setToolAssetIds([])}>해제</button>
              </div>
              <div className="ll-check-grid" data-qa-tools-asset-filter="true">
                {assets.map((asset) => (
                  <label className="ll-check-item" key={asset.assetId}>
                    <input type="checkbox" checked={toolAssetIds.includes(asset.assetId)} onChange={() => toggleAsset(asset.assetId)} />
                    <span>{asset.assetName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="ll-filter-head">
                <span>기업</span>
                <button className="ll-mini-button" type="button" onClick={() => setToolTenantIds(tenants.map((tenant) => tenant.tenantId))}>전체 선택</button>
                <button className="ll-mini-button" type="button" onClick={() => setToolTenantIds([])}>해제</button>
              </div>
              <div className="ll-check-grid" data-qa-tools-company-filter="true">
                {tenants.map((tenant) => (
                  <label className="ll-check-item" key={tenant.tenantId}>
                    <input type="checkbox" checked={toolTenantIds.includes(tenant.tenantId)} onChange={() => toggleTenant(tenant.tenantId)} />
                    <span>{tenant.tenantName}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Section>
        <Section title="비교 벤치마크" meta="행 클릭 시 자산 상세">
          <CompactTable columns={assetColumns()} rows={toolAssets} onRowClick={openAssetDrawer} />
        </Section>
        <Section title="계약 원장" meta="행 클릭 시 계약 상세">
          <CompactTable columns={leaseColumns()} rows={toolLeases} onRowClick={(lease) => setModal({ title: '계약 원장 상세', body: <KeyGrid items={Object.entries(lease)} /> })} />
        </Section>
      </div>
    );
  };

  const renderPlayground = () => {
    const source = playgroundDimension === 'asset' ? assets : tenants;
    const labelKey = playgroundDimension === 'asset' ? 'assetName' : 'tenantName';
    const topN = Math.max(1, Math.min(100, Number(playgroundTopN) || 20));
    const filteredSource = source.filter((item) => {
      if (playgroundFilter === '전체') return true;
      if (playgroundFilter === '계약 2건 이상') return toNumber(item.leaseCount || item.assetCount) >= 2;
      if (playgroundFilter === '공실 있음') return playgroundDimension === 'asset' && toNumber(item.vacancyAreaSqm) > 0;
      if (playgroundDimension === 'asset') return getRegion(item) === playgroundFilter;
      return true;
    });
    const rows = filteredSource.map((item) => ({
      id: item.assetId || item.tenantId,
      dimension: item[labelKey],
      value: toNumber(item[playgroundMetric]),
      recordCount: item.leaseCount || item.assetCount || 0,
      raw: item,
    })).sort((a, b) => b.value - a.value).slice(0, topN);
    const runSavedView = (view) => {
      if (view === 'cost') {
        setPlaygroundDimension('asset');
        setPlaygroundMetric('monthlyCostTotal');
        setPlaygroundFilter('전체');
        setPlaygroundTopN(20);
      }
      if (view === 'tenant') {
        setPlaygroundDimension('tenant');
        setPlaygroundMetric('leasedAreaSqm');
        setPlaygroundFilter('계약 2건 이상');
        setPlaygroundTopN(20);
      }
      if (view === 'vacancy') {
        setPlaygroundDimension('asset');
        setPlaygroundMetric('leasedAreaSqm');
        setPlaygroundFilter('공실 있음');
        setPlaygroundTopN(20);
      }
    };
    return (
      <div className="ll-stack">
        <Section title="쿼리 조건" actions={<>
          <select className="ll-select" value={playgroundDimension} onChange={(event) => setPlaygroundDimension(event.target.value)} data-qa-playground-mode="true">
            <option value="asset">자산</option>
            <option value="tenant">임차인</option>
          </select>
          <select className="ll-select" value={playgroundMetric} onChange={(event) => setPlaygroundMetric(event.target.value)}>
            <option value="monthlyCostTotal">월 임관리비</option>
            <option value="leasedAreaSqm">임대면적</option>
            <option value="leaseCount">계약/공간 수</option>
          </select>
          <select className="ll-select" value={playgroundFilter} onChange={(event) => setPlaygroundFilter(event.target.value)} data-qa-playground-filter="true">
            <option value="전체">전체</option>
            <option value="계약 2건 이상">계약 2건 이상</option>
            <option value="공실 있음">공실 있음</option>
            {regions.filter((region) => region !== '전체').map((region) => <option key={region} value={region}>{region}</option>)}
          </select>
          <label className="ll-inline-control">Top N
            <input className="ll-number-input" type="number" min="1" max="100" value={playgroundTopN} onChange={(event) => setPlaygroundTopN(event.target.value)} data-qa-playground-topn />
          </label>
        </>}>
          <KeyGrid items={[
            ['행 차원', playgroundDimension === 'asset' ? '자산' : '임차인'],
            ['지표', playgroundMetric === 'monthlyCostTotal' ? '월 임관리비' : playgroundMetric === 'leasedAreaSqm' ? '임대면적' : '계약/공간 수'],
            ['필터', playgroundFilter],
            ['Top N', fmtNumber(topN)],
          ]} />
        </Section>
        <Section title="저장 View" meta="기존 Playground의 빠른 분석 진입점입니다.">
          <div className="ll-action-grid">
            <button className="ll-action-button" type="button" onClick={() => runSavedView('cost')} data-qa-playground-view="cost">월 임관리비 비교</button>
            <button className="ll-action-button" type="button" onClick={() => runSavedView('tenant')} data-qa-playground-view="tenant">주요 임차인 면적</button>
            <button className="ll-action-button" type="button" onClick={() => runSavedView('vacancy')} data-qa-playground-view="vacancy">공실 보유 자산</button>
          </div>
        </Section>
        <Section title="결과 차트" meta="막대 클릭 시 원본 상세">
          <BarList rows={rows.map((row) => ({ id: row.id, label: row.dimension, value: row.value, raw: row.raw }))} valueFormatter={(value) => playgroundMetric === 'monthlyCostTotal' ? fmtCurrency(value) : fmtNumber(value, 1)} onRowClick={(row) => setModal({ title: `${row.label} 상세`, body: <KeyGrid items={Object.entries(row.raw)} /> })} qa="playground" />
        </Section>
        <Section title="결과 표" meta="행 클릭 시 원본 상세">
          <CompactTable columns={[
            { key: 'dimension', label: '분석 기준' },
            { key: 'value', label: '집계값', render: (row) => playgroundMetric === 'monthlyCostTotal' ? fmtCurrency(row.value) : fmtNumber(row.value, 1) },
            { key: 'recordCount', label: '건수', render: (row) => fmtNumber(row.recordCount) },
          ]} rows={rows} onRowClick={(row) => setModal({ title: `${row.dimension} 상세`, body: <KeyGrid items={Object.entries(row.raw)} /> })} />
        </Section>
      </div>
    );
  };

  const renderQuality = () => {
    const filtered = issues.filter((issue) => {
      if (qualityFilter === '전체') return true;
      if (qualityFilter === '확인 필요') return !issue.checked;
      if (qualityFilter === '확인 완료') return issue.checked;
      return true;
    }).filter((issue) => qualitySheetFilter === '전체' || (issue.sheet || '미기재') === qualitySheetFilter);
    const issueGroups = Object.entries(groupRows(filtered, (issue) => issue.sheet || '미기재', () => 1))
      .map(([label, value]) => ({ id: label, label, value, rows: filtered.filter((issue) => (issue.sheet || '미기재') === label) }));
    return (
      <div className="ll-stack" data-testid="logistics-quality-panel">
        <Section title="품질 필터" actions={<>
          <select className="ll-select" value={qualityFilter} onChange={(event) => setQualityFilter(event.target.value)} data-qa-quality-status="true">
          <option value="전체">전체</option>
          <option value="확인 필요">확인 필요</option>
          <option value="확인 완료">확인 완료</option>
          </select>
          <select className="ll-select" value={qualitySheetFilter} onChange={(event) => setQualitySheetFilter(event.target.value)} data-qa-quality-sheet="true">
            {qualitySheets.map((sheet) => <option key={sheet} value={sheet}>{sheet}</option>)}
          </select>
        </>}>
          <KeyGrid items={[
            ['전체 이슈', fmtNumber(issues.length)],
            ['확인 필요', fmtNumber(issues.filter((issue) => !issue.checked).length)],
            ['확인 완료', fmtNumber(issues.filter((issue) => issue.checked).length)],
            ['선택 시트', qualitySheetFilter],
          ]} />
        </Section>
        <Section title="시트별 이슈 그룹" meta="막대 클릭 시 그룹 상세">
          <BarList rows={issueGroups} valueFormatter={fmtNumber} qa="quality-sheet" onRowClick={(row) => openMetric(`${row.label} 이슈`, row.rows, [
            { key: 'severity', label: '상태' },
            { key: 'sheet', label: '시트' },
            { key: 'asset', label: '자산' },
            { key: 'content', label: '내용' },
          ])} />
        </Section>
        <Section title="데이터 이상 목록" meta="행 클릭 시 상세">
          <CompactTable columns={[
            { key: 'severity', label: '상태' },
            { key: 'sheet', label: '시트' },
            { key: 'asset', label: '자산' },
            { key: 'content', label: '내용' },
          ]} rows={filtered} onRowClick={(row) => setModal({ title: '데이터 품질 상세', body: <KeyGrid items={Object.entries(row)} /> })} />
        </Section>
        <Section title="필드 사전" meta="원본 데이터 항목 설명">
          <CompactTable columns={[
            { key: '항목', label: '항목' },
            { key: 'Data Type', label: '데이터 타입' },
            { key: '샘플 데이터', label: '샘플 데이터' },
            { key: '항목별 설명 및 고려사항 (특이사항 빨간색으로 표기)', label: '설명' },
          ]} rows={data.fieldDictionary || []} limit={80} />
        </Section>
      </div>
    );
  };

  const renderPermissions = () => {
    const adminActions = [
      { id: 'refresh-calculation', label: '계산 갱신', target: '계산 시트 최신화', policy: '서버 함수 승인 후 실행' },
      { id: 'sync-opendart', label: 'OpenDART 동기화', target: '법인 공시 데이터 갱신', policy: '외부 인증은 서버에서 처리' },
      { id: 'sync-building', label: '건축물대장 동기화', target: '건축물대장 데이터 갱신', policy: '외부 인증은 서버에서 처리' },
      { id: 'run-audit', label: '데이터 감사 실행', target: '데이터 이상 목록 재검사', policy: '읽기 전용 화면에서는 미실행' },
      { id: 'reconcile-ui-db', label: 'UI-DB 정합성 검증', target: '화면 snapshot과 DB 비교', policy: '결과만 snapshot으로 조회' },
      { id: 'refresh-snapshot', label: '스냅샷 갱신', target: '대시보드 payload 갱신', policy: '종합 관리 권한만' },
      { id: 'cache-clear', label: '캐시 정리', target: '클라이언트/서버 캐시 무효화', policy: '종합 관리 권한만' },
    ];
    const reviewTiles = [
      { id: 'opendart-missing', label: 'OpenDART 미연결', count: tenants.filter((tenant) => !tenant.businessNumber).length, rows: tenants.filter((tenant) => !tenant.businessNumber), columns: tenantColumns() },
      { id: 'building-missing', label: '건축물대장 미연결', count: assets.filter((asset) => !asset.map?.address).length, rows: assets.filter((asset) => !asset.map?.address), columns: assetColumns() },
      { id: 'issue-backlog', label: '이슈 백로그', count: issues.filter((issue) => !issue.checked).length, rows: issues.filter((issue) => !issue.checked), columns: [
        { key: 'severity', label: '상태' },
        { key: 'sheet', label: '시트' },
        { key: 'asset', label: '자산' },
        { key: 'content', label: '내용' },
      ] },
      { id: 'snapshot-status', label: '스냅샷 상태', count: assets.length + tenants.length + leases.length, rows: [{ id: 'source', source: data.source.type, fileName: data.source.fileName, assets: assets.length, tenants: tenants.length, leases: leases.length }], columns: [
        { key: 'source', label: 'source' },
        { key: 'fileName', label: '기준 파일' },
        { key: 'assets', label: '자산' },
        { key: 'tenants', label: '임차인' },
        { key: 'leases', label: '계약' },
      ] },
    ];
    return (
      <div className="ll-stack">
        <Section title="관리 실행 콘솔" meta="현재 화면에서는 서버 작업을 직접 실행하지 않고, 권한 구조와 클릭 흐름만 복구합니다.">
          <div className="ll-action-grid">
            {adminActions.map((action) => (
              <button
                className="ll-action-button"
                type="button"
                key={action.id}
                data-qa-admin-action={action.id}
                onClick={() => setModal({
                  title: `${action.label} 확인`,
                  note: '외부 인증이 필요한 작업은 브라우저에서 실행하지 않습니다.',
                  body: <KeyGrid items={[
                    ['작업명', action.label],
                    ['대상', action.target],
                    ['실행 정책', action.policy],
                    ['현재 상태', '서버 함수 연결 전 읽기 전용'],
                  ]} />,
                })}
              >
                {action.label}
              </button>
            ))}
          </div>
        </Section>
        <Section title="관리 검토 타일" meta="타일 클릭 시 기존 Admin 상세 패널에 해당하는 목록을 엽니다.">
          <div className="ll-grid-4">
            {reviewTiles.map((tile) => (
              <MetricTile
                key={tile.id}
                label={tile.label}
                value={fmtNumber(tile.count)}
                qa={`admin-review-${tile.id}`}
                onClick={() => openMetric(tile.label, tile.rows, tile.columns, '관리 검토 상세')}
              />
            ))}
          </div>
        </Section>
      <Section title="권한 구조" meta="사용자 리스트 수령 전 구조만 준비">
        <CompactTable columns={[
          { key: 'role', label: '권한' },
          { key: 'read', label: '조회' },
          { key: 'write', label: '쓰기' },
          { key: 'edit', label: '수정' },
          { key: 'delete', label: '삭제' },
          { key: 'admin', label: '관리' },
        ]} rows={ROLE_LEVELS.map((role, index) => ({
          id: role,
          role,
          read: '허용',
          write: index >= 1 ? '허용' : '숨김',
          edit: index >= 2 ? '허용' : '숨김',
          delete: index >= 3 ? '허용' : '숨김',
          admin: index >= 4 ? '허용' : '숨김',
        }))} />
      </Section>
        <Section title="감사 로그" meta="행 클릭 시 감사 상세">
          <CompactTable columns={[
            { key: 'severity', label: '상태' },
            { key: 'sheet', label: '시트' },
            { key: 'asset', label: '자산' },
            { key: 'content', label: '내용' },
          ]} rows={issues} onRowClick={(row) => setModal({ title: '감사 로그 상세', body: <KeyGrid items={Object.entries(row)} /> })} />
        </Section>
        <Section title="관리성 API" meta="외부 조회와 갱신 작업은 서버에서만 실행">
        <KeyGrid items={[
          ['OpenDART 조회', '서버 보안 처리 준비'],
          ['건축물대장 조회', '서버 보안 처리 준비'],
          ['snapshot refresh', '종합 관리 권한만'],
          ['cache clear', '종합 관리 권한만'],
          ['서버 전용 권한', '브라우저 미노출'],
          ['현재 상태', '읽기 전용 화면'],
        ]} />
      </Section>
    </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'weekly': return renderWeekly();
      case 'home': return renderHome();
      case 'asset': return renderAsset();
      case 'company': return renderCompany();
      case 'sector': return renderSector();
      case 'tools': return renderTools();
      case 'playground': return renderPlayground();
      case 'quality': return renderQuality();
      case 'permissions': return renderPermissions();
      default: return renderWeekly();
    }
  };

  const activeTitle = TABS.find((tab) => tab.id === activeTab)?.title || 'Weekly';

  return (
    <div className="ll-shell" data-testid="logistics-dashboard">
      <main className="ll-main">
        <div className="ll-page">
          <header className="ll-topbar" data-testid="logistics-header">
            <div>
              <div className="ll-kicker">Logistics Leasing</div>
              <h1 className="ll-title">{activeTitle}</h1>
              <div className="ll-subtitle">기존 임대차 운영 탭과 클릭 상세 동작을 유지한 IFPDP 플랫폼 화면입니다.</div>
            </div>
            <div className="ll-status-row">
              <span className="ll-chip warn">읽기 전용</span>
              <span className="ll-chip">원본 데이터 기준</span>
              <span className="ll-chip">보안 호출 서버 처리</span>
            </div>
          </header>
          <div className="ll-tabbar" data-testid="logistics-tabbar">
            <div className="ll-search-wrap">
              <input
                className="ll-search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setSearchFocused(true); }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && searchSuggestions[0]) {
                    event.preventDefault();
                    applySearchSuggestion(searchSuggestions[0]);
                  }
                }}
                placeholder="자산명, 펀드명, 기업명 검색"
                data-testid="logistics-search"
              />
              {searchFocused && searchSuggestions.length ? (
                <div className="ll-search-suggestions" data-qa-search-suggestions="true">
                  {searchSuggestions.map((suggestion) => (
                    <button
                      className="ll-search-suggestion"
                      type="button"
                      key={suggestion.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applySearchSuggestion(suggestion)}
                      data-qa-search-suggestion={suggestion.type}
                    >
                      <span>{suggestion.type}</span>
                      <strong>{suggestion.label}</strong>
                      <small>{suggestion.detail || '-'}</small>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <nav className="ll-tab-groups" aria-label="Logistics Leasing tabs">
              {Object.entries(groupedTabs).map(([group, tabs]) => (
                <div className="ll-tab-group" key={group}>
                  <div className="ll-nav-group-label">{group}</div>
                  <div className="ll-tab-row">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        className={`ll-tab ${activeTab === tab.id ? 'active' : ''}`}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                        data-testid={`logistics-tab-${tab.id}`}
                      >
                        {tab.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
          <div className="ll-layout">
            <div className="ll-stack" data-testid={`logistics-panel-${activeTab}`}>{renderActiveTab()}</div>
            <aside className="ll-rail" data-testid="logistics-sticky-rail">
              <div className="ll-section">
                <div className="ll-section-title">상세 동작</div>
                <div className="ll-section-meta">현재 탭에서 유지되는 클릭 레이어</div>
                <div className="ll-stack" style={{ marginTop: 10 }}>
                  <span className="ll-chip">KPI 상세</span>
                  <span className="ll-chip">행 상세 drawer</span>
                  <span className="ll-chip">지도/차트 상세</span>
                  <span className="ll-chip">브라우저 실행 제한</span>
                </div>
              </div>
              <div className="ll-section">
                <div className="ll-section-title">원본 기준</div>
                <div className="ll-section-meta">{data.source.fileName}</div>
                <div className="ll-section-meta">assets: {fmtNumber(data.summary.assetCount)} / leases: {fmtNumber(data.summary.leaseCount)}</div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Modal modal={modal} onClose={closeModal} />
      <Drawer drawer={drawer} onClose={closeDrawer} />
    </div>
  );
}
