import React from 'react';

const COLUMNS = [
    { key: 'm06', labelTop: '~2026', labelBottom: '06' },
    { key: 'm07', labelTop: '2026', labelBottom: '07' },
    { key: 'm08', labelTop: '2026', labelBottom: '08' },
    { key: 'm09', labelTop: '2026', labelBottom: '09' },
    { key: 'm10', labelTop: '2026', labelBottom: '10' },
    { key: 'm11', labelTop: '2026.11', labelBottom: 'PF 1차', highlight: true, isPfBox: true },
    { key: 'm03', labelTop: '2027.03', labelBottom: 'PF 2차', highlight: true, isPfBox: true },
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
  'PF/금융', '인허가', '호텔/운영', '시공/원가', '도면/설계',
  '인테리어/TI', '임차/마케팅', '구조/법무/세무', '주주/보고', '준공/담보대출'
];

export default function PmoScheduleGate() {
    const [filterCategory, setFilterCategory] = React.useState('All'); // All, Gate, Task
    const [selectedRrCategory, setSelectedRrCategory] = React.useState('PF/금융');
    const scrollContainerRef = React.useRef(null);

    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            // Scroll vertically with mouse wheel -> translate to horizontal scroll
            if (e.deltaY !== 0 && e.deltaX === 0) {
                e.preventDefault();
                container.scrollLeft += e.deltaY * 0.8; // Smooth factor 0.8
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, []);

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
        <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto font-sans text-white">
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
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none mb-[8px]">타임라인 및 R&R</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">Gate별 통제 마일스톤 및 03_카테고리맵 표준 조직 R&R 통제 보드</p>
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
                <span className="text-[13px] text-[#86868B] font-medium">💡 일정의 최종 목표는 준공 및 Take-out/운영 전환이며, 각 업무는 Gate에서 멈춤/전환/상향보고 여부를 결정합니다.</span>
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
                <div ref={scrollContainerRef} className="w-full overflow-x-auto pr-0 timeline-scrollbar">
                    <div className="flex items-center min-w-[2260px]">
                        <table className="text-left table-fixed min-w-[1460px] flex-1">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-12">
                                    <th className="px-2 w-[100px] text-center sticky left-0 bg-[#272726] z-30">구분</th>
                                    <th className="pl-4 w-[250px] sticky left-[100px] bg-[#272726] z-30">세부업무</th>
                                    <th className="px-2 w-[110px] text-center sticky left-[350px] bg-[#272726] z-30">주관</th>
                                    <th className="px-2 w-[100px] text-center sticky left-[460px] bg-[#272726] z-30 border-r border-[#3c3c3c] shadow-[4px_0_8px_-4px_rgba(0,0,0,0.5)]">협업</th>
                                    {COLUMNS.map((col, cIdx) => {
                                        const isSeparatorStart = col.key === 'm10';
                                        const isSeparatorEnd = col.key === 'm03';
                                        return (
                                            <th key={col.key} className={`text-center font-mono text-[11px] leading-tight px-1 font-bold w-[90px] ${
                                                col.isPfBox 
                                                    ? 'bg-[#2997ff]/10 text-white' 
                                                    : col.highlight 
                                                        ? 'bg-white/[0.03] text-[#60a5fa]' 
                                                        : 'text-[#86868B]'
                                            } ${
                                                isSeparatorStart || isSeparatorEnd
                                                    ? 'border-r-4 border-[#2997ff]' 
                                                    : 'border-r border-[#4c4c4c]/50'
                                            }`}>
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
                                                const isSeparatorStart = col.key === 'm10';
                                                const isSeparatorEnd = col.key === 'm03';
                                                return (
                                                    <td key={col.key} className={`text-center ${
                                                        col.isPfBox 
                                                            ? 'bg-[#2997ff]/[0.04] group-hover:bg-[#2997ff]/[0.09]' 
                                                            : col.highlight 
                                                                ? 'bg-white/[0.015] group-hover:bg-white/[0.04]' 
                                                                : ''
                                                    } ${
                                                        isSeparatorStart || isSeparatorEnd
                                                            ? 'border-r-4 border-[#2997ff]/70' 
                                                            : 'border-r border-[#4c4c4c]/40'
                                                    }`}>
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
            <div className="w-full flex flex-col gap-2 mt-[64px] border-t border-[#3c3c3c] pt-[48px] mb-[24px]">
                <h2 className="text-[26px] font-bold text-white tracking-tight leading-none text-left">표준 R&R 및 카테고리 통제 맵</h2>
                <p className="text-[14.5px] text-[#86868B] leading-[22px] text-left">03_카테고리맵 기준 대분류별 세부섹터 주관/협업 R&R 및 통제 요건</p>
            </div>

            {/* Category Selector Tabs */}
            <div className="flex flex-wrap gap-[8px] mb-[28px]">
                {R_R_CATEGORIES.map(cat => {
                    const count = CATEGORY_MAP_DATA.filter(item => item.category === cat).length;
                    const isActive = selectedRrCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedRrCategory(cat)}
                            className={`px-[16px] py-[7px] rounded-full text-[13px] font-bold whitespace-nowrap cursor-pointer transition-all duration-200 border ${
                                isActive
                                    ? 'bg-[#2997ff]/10 border-[#2997ff]/40 text-[#60a5fa] scale-[1.02]'
                                    : 'bg-transparent border-[#3a3a3c] text-[#86868B] hover:text-white hover:border-[#555]'
                            }`}
                        >
                            {cat} <span className={`text-[11px] ml-1.5 font-semibold ${isActive ? 'text-[#60a5fa]' : 'text-[#86868B]'}`}>({count})</span>
                        </button>
                    );
                })}
            </div>

            {/* R&R Grid Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-[40px]">
                {CATEGORY_MAP_DATA.filter(item => item.category === selectedRrCategory).map((item, idx) => (
                    <div 
                        key={idx} 
                        className="bg-[#272726] border border-[#3c3c3c] hover:border-[#4c4c4c] rounded-[22px] p-6 flex flex-col justify-between transition-all duration-200 shadow-sm relative group"
                    >
                        <div>
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-4 mb-3.5">
                                <h4 className="text-[18px] font-bold text-white tracking-tight leading-snug text-left">
                                    {item.subsector}
                                </h4>
                                <div className="flex gap-1.5 flex-wrap shrink-0">
                                    {item.pf && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 whitespace-nowrap">PF 전 필요</span>
                                    )}
                                    {item.const && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">착공 전 필요</span>
                                    )}
                                    {item.op && (
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">준공 전 필요</span>
                                    )}
                                </div>
                            </div>

                            {/* Representative Task Description */}
                            <p className="text-[14px] text-[#E5E5E5] font-medium leading-relaxed mb-5 text-left">
                                {item.task}
                            </p>

                            {/* Standard R&R Roles */}
                            <div className="space-y-2.5 border-t border-[#3c3c3c] pt-4 text-[12px]">
                                <div className="flex items-center gap-3">
                                    <span className="w-12 text-[#86868B] font-bold text-left shrink-0">주관 부서</span>
                                    <span className="px-2.5 py-0.5 rounded font-bold bg-[#2997ff]/10 text-white border border-[#2997ff]/20">
                                        {item.lead}
                                    </span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-12 text-[#86868B] font-bold text-left shrink-0 mt-0.5">협업 부서</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.coop.map((c, cIdx) => (
                                            c && (
                                                <span key={cIdx} className="px-2.5 py-0.5 rounded font-bold bg-[#1F1F1E] text-[#A1A1AA] border border-[#3c3c3c]">
                                                    {c}
                                                </span>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Standard Counterparties & Support requirements */}
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#3c3c3c] text-[12px] text-left">
                                <div>
                                    <span className="text-[#86868B] font-bold block mb-1">외부 상대방</span>
                                    <span className="text-[#E5E5E5] font-semibold">{item.partner || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[#86868B] font-bold block mb-1">지원 필요 요건</span>
                                    <span className="text-[#E5E5E5] font-semibold">{item.need || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Control Point Bottom Bar */}
                        <div className="mt-5 bg-amber-500/[0.04] border-l-3 border-amber-500/50 text-[#F59E0B] text-[12px] font-semibold px-4 py-2.5 rounded-r text-left">
                            <span className="text-[#86868B] font-bold mr-1.5">관리 포인트:</span>
                            {item.point}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
