import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

const MODULES = [
  { id: 'weekly', label: 'Weekly', source: '주간 업무' },
  { id: 'home', label: 'Home', source: 'Home' },
  { id: 'asset', label: 'Asset', source: 'Asset' },
  { id: 'company', label: 'Company', source: 'Company' },
  { id: 'sector', label: 'Sector', source: 'Sector' },
  { id: 'tools', label: 'Analysis Tools', source: 'Analysis Tools' },
  { id: 'playground', label: 'Data Playground', source: 'Data Playground' },
  { id: 'quality', label: 'Data Quality', source: 'Data Quality' },
];

const WORKLOGS = [
  { id: 'wl-001', title: '주간 임대차 변동사항 확인', scope: '개인', owner: '물류 AM', status: '진행', priority: '높음', due: '이번 주', asset: 'DB_일반', note: '만기, 공실, 임대료 변동 항목 우선 확인' },
  { id: 'wl-002', title: '자산별 임차인 상세 검토', scope: '팀', owner: '리싱 담당', status: '검토', priority: '보통', due: 'D+3', asset: 'Asset', note: '원본 Asset 탭 상세 화면 기준 유지' },
  { id: 'wl-003', title: '기업 노출 및 OpenDART 연결 준비', scope: '팀', owner: '데이터 담당', status: '보류', priority: '보통', due: 'API 모듈', asset: 'Company', note: '서버 연결 전 외부 API 기능 비노출' },
  { id: 'wl-004', title: '섹터 전체 공실/만기 리스크 점검', scope: '섹터', owner: '섹터 PM', status: '진행', priority: '높음', due: '이번 주', asset: 'Sector', note: 'Home/Sector 숫자 불일치 금지' },
  { id: 'wl-005', title: '데이터 품질 null 사유 분류', scope: '섹터', owner: '데이터 QA', status: '보류', priority: '높음', due: 'Data QA 모듈', asset: 'Data Quality', note: '품질 점검 모듈에서 사유별로 분류' },
];

const WEEKLY_ITEMS = [
  { label: '자산', value: '17', tone: 'text-[#B5E48C]' },
  { label: '임차인', value: '36', tone: 'text-[#9AD7FF]' },
  { label: '계약', value: '45', tone: 'text-[#FFD166]' },
  { label: '이슈', value: '42', tone: 'text-[#FF9F9F]' },
];

const DATA_STATUS = [
  { label: '정규화 데이터', value: '확인', detail: '검증 기준 통과' },
  { label: '원본 연결', value: '미연결 0건', detail: '원본 행 연결 확인' },
  { label: 'API 미인증 차단', value: '차단 확인', detail: '미인증 요청 차단' },
  { label: '외부 API 연결', value: '준비', detail: '서버 연결 후 노출' },
];

const STATUS_STYLES = {
  진행: 'bg-[#173522] text-[#B5E48C] border-[#2E6B45]',
  검토: 'bg-[#2B2613] text-[#FFD166] border-[#7A6425]',
  보류: 'bg-[#331F1F] text-[#FF9F9F] border-[#6F3434]',
};

function pathFor(suffix = '') {
  const base = 'platform/iotaseoul/workspace/logistics';
  return suffix ? `${base}/${suffix}` : base;
}

function navigateTo(path) {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
  window.location.href = `${base}/${path}`;
}

function SectionHeader({ eyebrow, title, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <div className="text-[12px] font-semibold text-[#86868B] tracking-[0.02em]">{eyebrow}</div>
        <h2 className="text-[22px] font-semibold text-white tracking-tight mt-1">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function StatusPill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center h-7 px-3 rounded-[8px] border text-[12px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

function WorklogRow({ item }) {
  return (
    <tr className="border-b border-[#333333] hover:bg-white/[0.035] transition-colors">
      <td className="py-3 pl-4 pr-3 text-[13px] text-[#A1A1AA]">{item.scope}</td>
      <td className="py-3 px-3">
        <div className="text-[14px] text-white font-medium">{item.title}</div>
        <div className="text-[12px] text-[#86868B] mt-1">{item.note}</div>
      </td>
      <td className="py-3 px-3 text-[13px] text-[#E5E5E5]">{item.owner}</td>
      <td className="py-3 px-3">
        <StatusPill className={STATUS_STYLES[item.status] || 'bg-[#262626] text-[#E5E5E5] border-[#3A3A3C]'}>
          {item.status}
        </StatusPill>
      </td>
      <td className="py-3 px-3 text-[13px] text-[#E5E5E5]">{item.priority}</td>
      <td className="py-3 px-3 text-[13px] text-[#A1A1AA]">{item.due}</td>
      <td className="py-3 pr-4 pl-3 text-[13px] text-[#86868B]">{item.asset}</td>
    </tr>
  );
}

function DashboardShell({ activeModule }) {
  const selected = MODULES.find((item) => item.id === activeModule) || MODULES[0];

  return (
    <div className="w-full max-w-[1480px] mx-auto px-8 pt-8 pb-14">
      <SectionHeader
        eyebrow="INTERNAL MODULE"
        title="임대차 Dashboard"
        right={<StatusPill className="bg-[#222] text-[#A1A1AA] border-[#3A3A3C]">원본 기준</StatusPill>}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {MODULES.map((module) => {
          const active = module.id === selected.id;
          return (
            <button
              key={module.id}
              type="button"
              onClick={() => navigateTo(pathFor(`dashboard/${module.id}`))}
              className={`h-9 px-3 rounded-[8px] border text-[13px] font-semibold transition-colors ${active ? 'bg-white text-[#1F1F1E] border-white' : 'bg-[#252524] text-[#C7C7CC] border-[#3A3A3C] hover:bg-[#30302F]'}`}
            >
              {module.label}
            </button>
          );
        })}
      </div>

      <section className="border border-[#333333] rounded-[20px] bg-[#252524] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#333333] flex items-center justify-between gap-4">
          <div>
            <div className="text-[12px] text-[#86868B] font-semibold">SOURCE TAB</div>
            <h3 className="text-[24px] text-white font-semibold tracking-tight mt-1">{selected.source}</h3>
          </div>
          <StatusPill className="bg-[#1F1F1E] text-[#FFD166] border-[#4C4329]">검증 대기</StatusPill>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#333333]">
            <div className="text-[14px] text-[#C7C7CC] leading-7">
              기준 탭의 숫자, 표, 차트, 지도, 상세 화면을 순서대로 배치합니다.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {['KPI', 'Table', 'Chart/Map', 'Popup'].map((item) => (
                <div key={item} className="rounded-[12px] bg-[#1F1F1E] border border-[#333333] px-4 py-4">
                  <div className="text-[12px] text-[#86868B] font-semibold">{item}</div>
                  <div className="text-[18px] text-white font-semibold mt-2">대기</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="text-[13px] text-[#86868B] font-semibold mb-3">PARITY ORDER</div>
            <ol className="space-y-3">
              {MODULES.map((module, index) => (
                <li key={module.id} className="flex items-center justify-between gap-4 text-[13px]">
                  <span className="text-[#E5E5E5]">{index + 1}. {module.source}</span>
                  <span className="text-[#86868B]">{module.id === selected.id ? '선택' : '대기'}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function WorkspaceLogistics({ currentPath = '' }) {
  const { memberInfo } = useAuth();
  const [query, setQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('전체');
  const [dataCounts, setDataCounts] = useState(null);

  const isDashboard = currentPath.startsWith(pathFor('dashboard'));
  const activeModule = currentPath.split('/').pop() || 'weekly';

  useEffect(() => {
    let mounted = true;
    async function fetchCounts() {
      try {
        const tables = ['ll_assets', 'll_tenants', 'll_leases', 'll_issues'];
        const results = await Promise.all(
          tables.map((table) => supabase.from(table).select('*', { count: 'exact', head: true }))
        );
        if (!mounted) return;
        setDataCounts({
          assets: results[0].count,
          tenants: results[1].count,
          leases: results[2].count,
          issues: results[3].count,
        });
      } catch {
        if (mounted) setDataCounts(null);
      }
    }
    fetchCounts();
    return () => { mounted = false; };
  }, []);

  const visibleLogs = useMemo(() => {
    const text = query.trim().toLowerCase();
    return WORKLOGS.filter((item) => {
      const matchesScope = scopeFilter === '전체' || item.scope === scopeFilter;
      if (!matchesScope) return false;
      if (!text) return true;
      return [item.title, item.owner, item.status, item.priority, item.asset, item.note].join(' ').toLowerCase().includes(text);
    });
  }, [query, scopeFilter]);

  if (isDashboard) {
    return <DashboardShell activeModule={MODULES.some((item) => item.id === activeModule) ? activeModule : 'weekly'} />;
  }

  const weekly = dataCounts
    ? [
      { label: '자산', value: String(dataCounts.assets ?? 17), tone: 'text-[#B5E48C]' },
      { label: '임차인', value: String(dataCounts.tenants ?? 36), tone: 'text-[#9AD7FF]' },
      { label: '계약', value: String(dataCounts.leases ?? 45), tone: 'text-[#FFD166]' },
      { label: '이슈', value: String(dataCounts.issues ?? 42), tone: 'text-[#FF9F9F]' },
    ]
    : WEEKLY_ITEMS;

  return (
    <div className="w-full max-w-[1480px] mx-auto px-8 pt-8 pb-14">
      <header className="mb-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div>
            <div className="text-[13px] font-semibold text-[#86868B] tracking-[0.03em]">LOGISTICS SECTOR WORKSPACE</div>
            <h1 className="text-[34px] font-semibold tracking-tight text-white mt-2">물류센터 섹터 워크 플랫폼</h1>
            <div className="text-[15px] text-[#A1A1AA] mt-3">
              업무 기록, Weekly 현황, 검색, 개인/팀/섹터 업무를 한 화면에서 관리합니다.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill className="bg-[#173522] text-[#B5E48C] border-[#2E6B45]">조회 모드</StatusPill>
            <StatusPill className="bg-[#222] text-[#C7C7CC] border-[#3A3A3C]">{memberInfo?.staff_name || '로그인 사용자'}</StatusPill>
            <StatusPill className="bg-[#1F1F1E] text-[#FFD166] border-[#4C4329]">관리 메뉴 비노출</StatusPill>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5 mb-6">
        <div className="rounded-[20px] border border-[#333333] bg-[#252524] p-5">
          <SectionHeader eyebrow="WORK LOG" title="업무 기록" />
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 flex-1 rounded-[8px] border border-[#3A3A3C] bg-[#1F1F1E] px-3 text-[14px] text-white placeholder:text-[#6E6E73] outline-none focus:border-[#2997ff]"
              placeholder="자산, 임차인, 회사, 업무 검색"
            />
            <div className="flex rounded-[8px] border border-[#3A3A3C] bg-[#1F1F1E] p-1">
              {['전체', '개인', '팀', '섹터'].map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => setScopeFilter(scope)}
                  className={`h-8 px-3 rounded-[6px] text-[13px] font-semibold transition-colors ${scopeFilter === scope ? 'bg-white text-[#1F1F1E]' : 'text-[#A1A1AA] hover:text-white'}`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[14px] border border-[#333333]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#1F1F1E] text-[#86868B] text-[12px]">
                <tr>
                  <th className="py-3 pl-4 pr-3 font-semibold">구분</th>
                  <th className="py-3 px-3 font-semibold">업무</th>
                  <th className="py-3 px-3 font-semibold">담당</th>
                  <th className="py-3 px-3 font-semibold">상태</th>
                  <th className="py-3 px-3 font-semibold">우선순위</th>
                  <th className="py-3 px-3 font-semibold">기한</th>
                  <th className="py-3 pr-4 pl-3 font-semibold">연결</th>
                </tr>
              </thead>
              <tbody>
                {visibleLogs.map((item) => <WorklogRow key={item.id} item={item} />)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#333333] bg-[#252524] p-5">
          <SectionHeader
            eyebrow="WEEKLY"
            title="Weekly 업무현황"
            right={<button type="button" onClick={() => navigateTo(pathFor('dashboard/weekly'))} className="h-9 px-3 rounded-[8px] bg-[#30302F] text-white text-[13px] font-semibold hover:bg-[#3A3A3A]">Dashboard</button>}
          />
          <div className="grid grid-cols-2 gap-3 mb-5">
            {weekly.map((item) => (
              <div key={item.label} className="rounded-[14px] border border-[#333333] bg-[#1F1F1E] px-4 py-4">
                <div className="text-[12px] text-[#86868B] font-semibold">{item.label}</div>
                <div className={`text-[28px] font-semibold mt-2 tracking-tight ${item.tone}`}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-[14px] border border-[#333333] overflow-hidden">
            {DATA_STATUS.map((item) => (
              <div key={item.label} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-b border-[#333333] last:border-b-0 bg-[#1F1F1E]">
                <div>
                  <div className="text-[13px] text-white font-semibold">{item.label}</div>
                  <div className="text-[12px] text-[#86868B] mt-1">{item.detail}</div>
                </div>
                <div className="text-[13px] text-[#C7C7CC] font-semibold">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {['개인 업무 리스트', '팀 업무 리스트', '섹터 업무 리스트'].map((title, index) => {
          const scopes = ['개인', '팀', '섹터'];
          const rows = WORKLOGS.filter((item) => item.scope === scopes[index]);
          return (
            <div key={title} className="rounded-[20px] border border-[#333333] bg-[#252524] p-5">
              <SectionHeader eyebrow={scopes[index].toUpperCase()} title={title} />
              <div className="space-y-3">
                {rows.map((item) => (
                  <div key={item.id} className="rounded-[12px] border border-[#333333] bg-[#1F1F1E] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[14px] text-white font-semibold">{item.title}</div>
                      <StatusPill className={STATUS_STYLES[item.status] || 'bg-[#262626] text-[#E5E5E5] border-[#3A3A3C]'}>
                        {item.status}
                      </StatusPill>
                    </div>
                    <div className="text-[12px] text-[#86868B] mt-2">{item.asset} · {item.due}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
