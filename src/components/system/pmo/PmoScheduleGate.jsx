import React from 'react';

const COLUMNS = [
    { key: 'm06', labelTop: '~2026', labelBottom: '06' },
    { key: 'm07', labelTop: '2026', labelBottom: '07' },
    { key: 'm08', labelTop: '2026', labelBottom: '08' },
    { key: 'm09', labelTop: '2026', labelBottom: '09' },
    { key: 'm10', labelTop: '2026', labelBottom: '10' },
    { key: 'm11', labelTop: '2026.11', labelBottom: 'PF 1차', highlight: true },
    { key: 'm03', labelTop: '2027.03', labelBottom: 'PF 2차', highlight: true },
    { key: 'const_start', labelTop: '2027~', labelBottom: '착공' },
    { key: 'const_mid', labelTop: '공사~준공', labelBottom: '', highlight: true },
    { key: 'take_out', labelTop: 'Take-out', labelBottom: '운영', highlight: true }
];

const TIMELINE_DATA = [
    // Gates
    { category: 'Gate', name: 'G0 현황정리', desc: '업무원장·카테고리·우선순위 기준 확정', lead: '사업관리2파트', coop: '전 부서', schedule: { m06: '●', m07: '●' } },
    { category: 'Gate', name: 'G1 방향결정', desc: '단독/통합 PF 방향, 호텔 브랜드, 시공사 조건', lead: '사업관리2파트', coop: 'LFC;기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●' } },
    { category: 'Gate', name: 'G2 PF준비도', desc: '인허가·도면·임차·금융·법무 CP 준비', lead: '사업관리2파트', coop: '전 부서', schedule: { m07: '●', m08: '●', m09: '●', m10: '●' } },
    { category: 'Gate', name: 'G3 PF실행', desc: '427/816 단독 또는 통합 PF 실행', lead: 'LFC', coop: '사업관리2파트;전 부서', schedule: { m09: '●', m10: '●', m11: '◆', m03: '◆' } },
    { category: 'Gate', name: 'G4 착공/공사', desc: '착공조건, 책임착공, 공정관리 체계 전환', lead: '개발관리실', coop: '사업관리2파트;LFC', schedule: { m03: '●', const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G5 준공/사용승인', desc: '준공 CP, 사용승인, 리스크 증빙자료 관리', lead: '개발관리실', coop: '사업관리2파트;LFC', schedule: { const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G6 담보대출/운영', desc: 'Take-out, 운영전환, 임대 안정화, 자산관리', lead: '사업관리2파트', coop: '공간솔루션실;기업마케팅실', schedule: { const_mid: '●', take_out: '◆' } },
    // Functions
    { category: 'Task', name: '인허가', desc: '현금기부채납·소공원로·변경인가·사용승인', lead: '개발관리실', coop: '사업관리2파트;', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '호텔', desc: '브랜드·운영계약·운영수지·FF&E', lead: '사업관리2파트', coop: '기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', const_mid: '●' } },
    { category: 'Task', name: '시공/원가', desc: '현대/삼성 도급조건·공사비·신용공여', lead: '사업관리2파트', coop: '개발관리실;LFC', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '도면/설계', desc: 'PF 기준도면·면적표·실사자료', lead: '개발관리실', coop: '기업마케팅실;공간솔루션실', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '임차/마케팅', desc: '광장·KB·삼성/이지스·선임차', lead: '사업관리2파트', coop: '기업마케팅실; 공간솔루션실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: 'PF/금융', desc: 'Term Sheet·대주단·재무모델·CP', lead: 'LFC', coop: '사업관리2파트;전 부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', take_out: '◆' } },
    { category: 'Task', name: '법무/세무/구조', desc: '리츠·Asset/Share·합병·주주승인', lead: '법무/세무 외부자문', coop: '사업관리2파트;LFC', schedule: { m06: '●', m07: '●', m08: '●', m09: '●' } },
    { category: 'Task', name: '팝업업무', desc: '단발 요청 접수/위임/보류/반려', lead: '사업관리2파트', coop: '요청부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '●', m03: '●', const_start: '●', const_mid: '●', take_out: '●' } }
];

const CATEGORY_MAP_DATA = [
  {
    category: "인허가",
    subsector: "현금기부채납",
    task: "현금기부채납 규모·시기·조건 협의",
    pf: true,
    const: false,
    op: false,
    lead: "개발관리실",
    coop: ["사업관리2파트", "사업관리1파트"],
    need: "관청 협의결과",
    partner: "서울시/중구청",
    point: "사업비 및 PF 조건에 직접 반영"
  },
  {
    category: "인허가",
    subsector: "소공원로",
    task: "소공원로 지하화/통합개발 인허가",
    pf: true,
    const: false,
    op: false,
    lead: "개발관리실",
    coop: ["공간솔루션실", "사업관리2파트"],
    need: "인허가 지원",
    partner: "서울시/중구청",
    point: "인허가 마감 및 대주 조건"
  },
  {
    category: "인허가",
    subsector: "변경인가",
    task: "사업계획/건축 변경인가 완료",
    pf: false,
    const: true,
    op: false,
    lead: "개발관리실",
    coop: ["공간솔루션실", "사업관리2파트"],
    need: "설계 변경",
    partner: "중구청/서울시",
    point: "착공 일정의 선결 요건"
  },
  {
    category: "인허가",
    subsector: "사용승인",
    task: "준공 후 사용승인 및 등기/보존",
    pf: false,
    const: false,
    op: true,
    lead: "개발관리실",
    coop: ["사업관리2파트", "사업관리1파트"],
    need: "행정 지원",
    partner: "중구청",
    point: "운영전환 및 담보대출 전제"
  },
  {
    category: "호텔/운영",
    subsector: "브랜드",
    task: "호텔 브랜드 협의 및 HMA 체결",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["기업마케팅실", "LFC", "법무/세무 외부자문"],
    need: "자문 의견",
    partner: "Marriott/소노 등",
    point: "PF 실행의 필수 전제조건"
  },
  {
    category: "호텔/운영",
    subsector: "계약구조",
    task: "HMA / 위탁 / 임대차 구조 확정",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["LFC", "법무/세무 외부자문"],
    need: "계약 리스크",
    partner: "브랜드사",
    point: "Owner control과 termination"
  },
  {
    category: "호텔/운영",
    subsector: "운영수지/FF&E",
    task: "운영수지·FF&E·CAPEX 모델 반영",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["LFC", "사업관리1파트"],
    need: "운영자료",
    partner: "브랜드사",
    point: "사업비와 상환가능성 영향"
  },
  {
    category: "시공/원가",
    subsector: "현대건설",
    task: "427 도급조건·신용공여",
    pf: true,
    const: true,
    op: false,
    lead: "사업관리2파트",
    coop: ["사업관리1파트", "개발관리실"],
    need: "현대 Term",
    partner: "현대건설",
    point: "427 PF 실행조건"
  },
  {
    category: "시공/원가",
    subsector: "삼성물산",
    task: "816 도급조건·책임임차·LOC",
    pf: true,
    const: true,
    op: false,
    lead: "사업관리2파트",
    coop: ["사업관리1파트", "개발관리실"],
    need: "삼성 Term",
    partner: "삼성물산",
    point: "816 단독/통합 PF 핵심"
  },
  {
    category: "시공/원가",
    subsector: "공사비/VE",
    task: "공사비 검증·VE·공기단축",
    pf: true,
    const: true,
    op: true,
    lead: "개발관리실",
    coop: ["사업관리2파트"],
    need: "공사비 상세",
    partner: "시공사/CM",
    point: "원가 부담 완화"
  },
  {
    category: "도면/설계",
    subsector: "PF 기준도면",
    task: "대주단 제출용 기준도면",
    pf: true,
    const: false,
    op: false,
    lead: "개발관리실",
    coop: ["공간솔루션실", "사업관리2파트"],
    need: "도면기준",
    partner: "설계사/CM",
    point: "모든 자료의 기준"
  },
  {
    category: "도면/설계",
    subsector: "면적표",
    task: "GFA/NLA/전용률/임대면적 기준",
    pf: true,
    const: false,
    op: false,
    lead: "공간솔루션실",
    coop: ["기업마케팅실", "LFC", "개발관리실"],
    need: "면적자료",
    partner: "설계사/CM",
    point: "임차/모델 불일치 방지"
  },
  {
    category: "인테리어/TI",
    subsector: "오피스 TI",
    task: "표준 TI·Fit-out 비용 기준",
    pf: true,
    const: false,
    op: false,
    lead: "공간솔루션실",
    coop: ["기업마케팅실", "LFC"],
    need: "시장자료",
    partner: "임차인",
    point: "임차조건 및 모델 반영"
  },
  {
    category: "인테리어/TI",
    subsector: "호텔 인테리어",
    task: "호텔 인테리어·FF&E 범위",
    pf: false,
    const: true,
    op: true,
    lead: "공간솔루션실",
    coop: ["사업관리2파트", "LFC"],
    need: "브랜드 기준",
    partner: "브랜드사",
    point: "CAPEX 리스크"
  },
  {
    category: "임차/마케팅",
    subsector: "광장",
    task: "광장 임차 조건·면적·Term",
    pf: true,
    const: false,
    op: false,
    lead: "기업마케팅실",
    coop: ["사업관리2파트", "공간솔루션실", "LFC"],
    need: "임차조건",
    partner: "광장",
    point: "PF 스토리 핵심"
  },
  {
    category: "임차/마케팅",
    subsector: "KB/금융권",
    task: "금융권 임차 후보 협의",
    pf: true,
    const: false,
    op: false,
    lead: "기업마케팅실",
    coop: ["사업관리2파트", "공간솔루션실", "LFC"],
    need: "후보 접촉",
    partner: "KB 등",
    point: "선임차 확보"
  },
  {
    category: "임차/마케팅",
    subsector: "삼성/이지스",
    task: "816 선임차·책임임차·이전 가능성",
    pf: true,
    const: false,
    op: false,
    lead: "기업마케팅실",
    coop: ["사업관리2파트", "LFC"],
    need: "내부/삼성 협의",
    partner: "삼성물산;이지스",
    point: "단독/통합 구조와 연결"
  },
  {
    category: "PF/금융",
    subsector: "단독 PF",
    task: "427/816 단독 PF Term",
    pf: true,
    const: false,
    op: false,
    lead: "LFC",
    coop: ["사업관리2파트", "사업관리1파트"],
    need: "대주단 Term",
    partner: "대주단",
    point: "단독 가능성 기준"
  },
  {
    category: "PF/금융",
    subsector: "통합 PF",
    task: "대주단 일치화·통합담보 구조",
    pf: true,
    const: false,
    op: false,
    lead: "LFC",
    coop: ["사업관리2파트", "법무/세무 외부자문"],
    need: "금융/법무 검토",
    partner: "대주단",
    point: "구조 전환 의사결정"
  },
  {
    category: "PF/금융",
    subsector: "재무모델",
    task: "원가·임차·호텔·신용공여 모델 반영",
    pf: true,
    const: false,
    op: false,
    lead: "LFC",
    coop: ["전 부서"],
    need: "입력값 취합",
    partner: "회계법인",
    point: "모든 조건의 숫자화"
  },
  {
    category: "구조/법무/세무",
    subsector: "리츠 전환",
    task: "427 리츠 전환+816 편입 검토",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["LFC", "법무/세무 외부자문", "사업관리1파트"],
    need: "자문결과",
    partner: "법무/세무법인",
    point: "기본 구조 재정의"
  },
  {
    category: "구조/법무/세무",
    subsector: "Asset/Share/합병",
    task: "구조별 절차·세금·주주동의 비교",
    pf: true,
    const: false,
    op: false,
    lead: "법무/세무 외부자문",
    coop: ["사업관리2파트", "LFC"],
    need: "자문결과",
    partner: "법무/세무법인",
    point: "실행가능성 중심"
  },
  {
    category: "주주/보고",
    subsector: "의사결정",
    task: "6~7월 내부 의사결정 회의",
    pf: true,
    const: false,
    op: false,
    lead: "사업관리2파트",
    coop: ["전 부서"],
    need: "부서별 산출물",
    partner: "대표/본부장",
    point: "자료작업 반복 차단"
  },
  {
    category: "준공/담보대출",
    subsector: "Take-out",
    task: "준공 후 담보대출/운영전환 전략",
    pf: false,
    const: false,
    op: true,
    lead: "LFC",
    coop: ["사업관리2파트", "기업마케팅실", "개발관리실"],
    need: "장기 금융전략",
    partner: "금융기관",
    point: "PF 조건과 연결"
  }
];

const R_R_CATEGORIES = [
  '전체보기', 'PF/금융', '인허가', '호텔/운영', '시공/원가', '도면/설계',
  '인테리어/TI', '임차/마케팅', '구조/법무/세무', '주주/보고', '준공/담보대출'
];

export default function PmoScheduleGate() {
    const [filterCategory, setFilterCategory] = React.useState('All'); // All, Gate, Task
    const [selectedRrCategory, setSelectedRrCategory] = React.useState('전체보기');

    const filteredData = TIMELINE_DATA.filter(item => {
        if (filterCategory === 'All') return true;
        return item.category === filterCategory;
    });

    const renderCategoryName = (name) => {
        if (name.startsWith('G') && name.includes(' ')) {
            const parts = name.split(' ');
            return (
                <div className="leading-[1.2] text-center">
                    <div className="text-[11px] font-bold">{parts[0]}</div>
                    <div className="text-[11px] font-bold mt-0.5 opacity-90">{parts[1]}</div>
                </div>
            );
        }
        return <div className="text-center text-[11px] font-bold">{name}</div>;
    };

    return (
        <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] pl-[100px] pr-[100px] font-sans text-white text-left">
            <style>{`
                .timeline-scrollbar::-webkit-scrollbar {
                    height: 8px;
                }
                .timeline-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .timeline-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .timeline-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                    border: 2px solid transparent;
                    background-clip: padding-box;
                }
                .timeline-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.12) rgba(255, 255, 255, 0.02);
                }
            `}</style>
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[32px]">
                <div>
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">타임라인</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">Gate별 통제 마일스톤 및 주요 R&R 기능의 일정 트래커</p>
                </div>
                
                {/* Segmented Filter */}
                <div className="flex items-center bg-[#222] border border-[#333] rounded-[8px] p-[4px]">
                    <button
                        onClick={() => setFilterCategory('All')}
                        className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'All' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                    >
                        전체보기
                    </button>
                    <button
                        onClick={() => setFilterCategory('Gate')}
                        className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'Gate' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                    >
                        의사결정 Gate
                    </button>
                    <button
                        onClick={() => setFilterCategory('Task')}
                        className={`px-[16px] py-[6px] text-[13px] font-bold rounded-[6px] transition-colors cursor-pointer ${filterCategory === 'Task' ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'}`}
                    >
                        기능별 업무
                    </button>
                </div>
            </div>

            {/* Legend info panel */}
            <div className="w-full bg-[#272726]/60 border border-[#3c3c3c] rounded-[16px] px-6 py-4 flex items-center justify-between mb-[18px]">
                <span className="text-[13px] text-[#86868B] font-medium">일정의 최종 목표는 준공 및 Take-out/운영 전환입니다.</span>
                <div className="flex items-center gap-4 shrink-0 text-[12px] font-bold">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                        <span className="text-[#E5E5E5]">수행 진행 기간</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#F59E0B] font-mono text-[16px] leading-none">◆</span>
                        <span className="text-[#E5E5E5]">의사결정 / 마일스톤 달성</span>
                    </div>
                </div>
            </div>

            {/* Timeline Matrix Grid */}
            <div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden">
                <div className="w-full overflow-x-auto pr-0 timeline-scrollbar">
                    <div className="flex items-center min-w-[2260px]">
                        <table className="text-left table-fixed min-w-[1460px] flex-1">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-12">
                                    <th className="px-2 w-[100px] text-center sticky left-0 bg-[#272726] z-30">구분</th>
                                    <th className="pl-4 w-[250px] sticky left-[100px] bg-[#272726] z-30">세부업무</th>
                                    <th className="px-2 w-[110px] text-center sticky left-[350px] bg-[#272726] z-30">주관</th>
                                    <th className="px-2 w-[100px] text-center sticky left-[460px] bg-[#272726] z-30 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">협업</th>
                                    {COLUMNS.map((col, cIdx) => {
                                        return (
                                            <th key={col.key} className={`text-center font-mono text-[11px] leading-tight px-1 font-bold w-[90px] ${
                                                col.highlight ? 'bg-white/[0.03] text-[#60a5fa]' : 'text-[#86868B]'
                                            } border-r border-[#4c4c4c]/50`}>
                                                <div>{col.labelTop}</div>
                                                {col.labelBottom && <div className="text-[11px] opacity-75 mt-0.5">{col.labelBottom}</div>}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c] text-[13px]">
                                {filteredData.map((item, idx) => {
                                    const isGate = item.category === 'Gate';
                                    return (
                                        <tr key={idx} className="hover:bg-[#333] transition-colors h-14 group">
                                            {/* 구분 */}
                                            <td className="px-2 sticky left-0 bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center">
                                                <span className={`px-1.5 py-1 rounded-md font-bold block ${
                                                    isGate 
                                                        ? 'bg-[#2997ff]/10 text-[#60a5fa] border border-[#2997ff]/20' 
                                                        : 'bg-[#a1a1aa]/10 text-[#e4e4e7] border border-[#a1a1aa]/20'
                                                }`}>
                                                    {renderCategoryName(item.name)}
                                                </span>
                                            </td>
                                            
                                            {/* 세부업무 */}
                                            <td className="pl-4 font-medium text-[#E5E5E5] leading-snug text-left pr-2 whitespace-normal break-all sticky left-[100px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20">
                                                {item.desc}
                                            </td>
                                            
                                            {/* 주관 */}
                                            <td className="px-2 text-[#E5E5E5] font-semibold text-center sticky left-[350px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-[13px] leading-tight whitespace-normal break-all">
                                                {item.lead.includes(' ') ? (
                                                    item.lead.split(' ').map((part, pIdx) => (
                                                        <div key={pIdx}>{part}</div>
                                                    ))
                                                ) : (
                                                    item.lead
                                                )}
                                            </td>
                                            
                                            {/* 협업 */}
                                            <td className="px-2 text-[#86868B] leading-tight text-center pr-2 whitespace-normal break-all sticky left-[460px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">
                                                {item.coop.split(';').map((c, cIdx) => (
                                                    c && <div key={cIdx} className="text-[11px]">{c}</div>
                                                ))}
                                            </td>

                                            {/* Grid Columns */}
                                            {COLUMNS.map((col, cIdx) => {
                                                const mark = item.schedule[col.key];
                                                return (
                                                    <td key={col.key} className={`text-center ${
                                                        col.highlight ? 'bg-white/[0.015] group-hover:bg-white/[0.04]' : ''
                                                    } border-r border-[#4c4c4c]/40`}>
                                                        {mark === '●' && (
                                                            <span className="w-3.5 h-3.5 rounded-full bg-[#2997ff] inline-block shadow-sm shadow-[#2997ff]/20"></span>
                                                        )}
                                                        {mark === '◆' && (
                                                            <span className="text-[#F59E0B] font-mono text-[28px] font-extrabold block translate-y-[-1px] animate-pulse">◆</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* 우측 워터마크 영역 */}
                        <div className="w-[800px] shrink-0 flex items-center justify-start pl-20 pr-8 select-none pointer-events-none box-border">
                            <div className="text-white opacity-[0.04] font-bold leading-[0.9] tracking-tighter w-full whitespace-nowrap" style={{ fontSize: 'clamp(45px, 8.5vw, 135px)' }}>
                                IOTA Seoul<br />Cross Functional<br />Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Map & R&R Section */}
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-[48px] mb-[20px]">
                <h2 className="text-[26px] font-bold text-white tracking-tight leading-none text-left">R&R</h2>
                
                {/* Category Selector Tabs */}
                <div className="flex flex-wrap items-center bg-[#222] border border-[#333] rounded-[8px] p-[4px] shrink-0 max-w-full overflow-x-auto">
                    {R_R_CATEGORIES.map(cat => {
                        const isActive = selectedRrCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedRrCategory(cat)}
                                className={`px-[12px] py-[5px] text-[12px] font-bold rounded-[6px] transition-colors cursor-pointer whitespace-nowrap ${
                                    isActive ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* R&R Matrix Table */}
            <div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden mb-[40px] shadow-sm min-h-[1110px]">
                <div className="w-full overflow-x-auto pr-0 timeline-scrollbar">
                    <div className="flex items-center min-w-[2260px]">
                        <table className="text-left table-fixed min-w-[1460px] flex-1 border-collapse">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[12px] h-12">
                                    <th className="px-3 w-[110px] min-w-[110px] max-w-[110px] text-center sticky left-0 bg-[#272726] z-30">대분류</th>
                                    <th className="px-3 w-[130px] min-w-[130px] max-w-[130px] text-center sticky left-[110px] bg-[#272726] z-30">세부섹터</th>
                                    <th className="pl-3 w-[230px] min-w-[230px] max-w-[230px] sticky left-[240px] bg-[#272726] z-30 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">대표 업무</th>
                                    <th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight">PF 전<br />필요</th>
                                    <th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight">착공 전<br />필요</th>
                                    <th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">준공 전<br />필요</th>
                                    <th className="pl-3 w-[110px] min-w-[110px] max-w-[110px] text-left bg-[#272726]">주관 부서</th>
                                    <th className="pl-3 w-[140px] min-w-[140px] max-w-[140px] text-left bg-[#272726]">협업 부서</th>
                                    <th className="px-3 w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">외부 상대방</th>
                                    <th className="px-3 w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">지원 필요 요건</th>
                                    <th className="px-3 w-[275px] min-w-[275px] max-w-[275px] text-left bg-[#272726] border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">관리 포인트</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c]/60 text-[12px]">
                                {CATEGORY_MAP_DATA.filter(item => selectedRrCategory === '전체보기' || item.category === selectedRrCategory).map((item, idx) => {
                                    return (
                                        <tr key={idx} className="hover:bg-[#333] transition-colors h-11 group">
                                            {/* 대분류 */}
                                            <td className="px-3 sticky left-0 bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center font-bold text-white text-[12px] w-[110px] min-w-[110px] max-w-[110px]">
                                                {item.category}
                                            </td>
                                            
                                            {/* 세부섹터 */}
                                            <td className="px-3 sticky left-[110px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 text-center font-bold text-[#E5E5E5] text-[12px] whitespace-normal break-all w-[130px] min-w-[130px] max-w-[130px]">
                                                {item.subsector}
                                            </td>
                                            
                                            {/* 대표 업무 */}
                                            <td className="pl-3 font-medium text-[#E5E5E5] leading-snug text-left pr-2 whitespace-normal break-all sticky left-[240px] bg-[#272726] group-hover:bg-[#333] transition-colors z-20 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)] text-[12px] w-[230px] min-w-[230px] max-w-[230px]">
                                                {item.task}
                                            </td>
                                            
                                            {/* PF 전 필요 */}
                                            <td className="px-2 text-center w-[75px] min-w-[75px] max-w-[75px]">
                                                {item.pf ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 착공 전 필요 */}
                                            <td className="px-2 text-center w-[75px] min-w-[75px] max-w-[75px]">
                                                {item.const ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 준공 전 필요 */}
                                            <td className="px-2 text-center border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)] w-[75px] min-w-[75px] max-w-[75px]">
                                                {item.op ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 주관 부서 */}
                                            <td className="pl-3 text-left w-[110px] min-w-[110px] max-w-[110px]">
                                                <span className="px-2.5 py-0.5 rounded font-bold bg-[#2997ff]/10 text-white border border-[#2997ff]/20 text-[11px] whitespace-nowrap">
                                                    {item.lead}
                                                </span>
                                            </td>
                                            
                                            {/* 협업 부서 */}
                                            <td className="pl-3 text-left w-[140px] min-w-[140px] max-w-[140px]">
                                                <div className="flex flex-row gap-1.5 justify-start items-center whitespace-nowrap">
                                                    {item.coop.map((c, cIdx) => (
                                                        c && <span key={cIdx} className="px-2 py-0.5 rounded bg-[#1F1F1E] text-[#A1A1AA] border border-[#3c3c3c] text-[11px] whitespace-nowrap">{c}</span>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* 외부 상대방 */}
                                            <td className="px-3 text-center text-[#A1A1AA] font-semibold whitespace-normal break-all w-[120px] min-w-[120px] max-w-[120px]">
                                                {item.partner || '-'}
                                            </td>

                                            {/* 지원 필요 요건 */}
                                            <td className="px-3 text-center text-[#A1A1AA] font-semibold whitespace-normal break-all w-[120px] min-w-[120px] max-w-[120px]">
                                                {item.need || '-'}
                                            </td>

                                            {/* 관리 포인트 */}
                                            <td className="px-3 text-left text-[#F59E0B] font-semibold whitespace-normal break-all w-[275px] min-w-[275px] max-w-[275px] border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">
                                                {item.point}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* 우측 워터마크 영역 */}
                        <div className="w-[800px] shrink-0 flex items-center justify-start pl-20 pr-8 select-none pointer-events-none box-border">
                            <div className="text-white opacity-[0.04] font-bold leading-[0.9] tracking-tighter w-full whitespace-nowrap" style={{ fontSize: 'clamp(45px, 8.5vw, 135px)' }}>
                                IOTA Seoul<br />Cross Functional<br />Team
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
