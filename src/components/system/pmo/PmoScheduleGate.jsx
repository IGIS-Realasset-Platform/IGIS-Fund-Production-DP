import React from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

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
    { category: 'Gate', name: 'G0 현황정리', desc: '업무원장·카테고리·우선순위 기준 확정', lead: '사업2파트', coop: '전 부서', schedule: { m06: '●', m07: '●' } },
    { category: 'Gate', name: 'G1 방향결정', desc: '단독/통합 PF 방향, 호텔 브랜드, 시공사 조건', lead: '사업2파트', coop: 'LFC;기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●' } },
    { category: 'Gate', name: 'G2 PF준비도', desc: '인허가·도면·임차·금융·법무 CP 준비', lead: '사업2파트', coop: '전 부서', schedule: { m07: '●', m08: '●', m09: '●', m10: '●' } },
    { category: 'Gate', name: 'G3 PF실행', desc: '427/816 단독 또는 통합 PF 실행', lead: 'LFC', coop: '사업2파트;전 부서', schedule: { m09: '●', m10: '●', m11: '◆', m03: '◆' } },
    { category: 'Gate', name: 'G4 착공/공사', desc: '착공조건, 책임착공, 공정관리 체계 전환', lead: '개발관리실', coop: '사업2파트;LFC', schedule: { m03: '●', const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G5 준공/사용승인', desc: '준공 CP, 사용승인, 리스크 증빙자료 관리', lead: '개발관리실', coop: '사업2파트;LFC', schedule: { const_start: '●', const_mid: '●' } },
    { category: 'Gate', name: 'G6 담보대출/운영', desc: 'Take-out, 운영전환, 임대 안정화, 자산관리', lead: '사업2파트', coop: '공간솔루션실;기업마케팅실', schedule: { const_mid: '●', take_out: '◆' } },
    // Functions
    { category: 'Task', name: '인허가', desc: '현금기부채납·소공원로·변경인가·사용승인', lead: '개발관리실', coop: '사업2파트;', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '호텔', desc: '브랜드·운영계약·운영수지·FF&E', lead: '사업2파트', coop: '기업마케팅실;개발관리실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', const_mid: '●' } },
    { category: 'Task', name: '시공/원가', desc: '현대/삼성 도급조건·공사비·신용공여', lead: '사업2파트', coop: '개발관리실;LFC', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '도면/설계', desc: 'PF 기준도면·면적표·실사자료', lead: '개발관리실', coop: '기업마케팅실;공간솔루션실', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: '임차/마케팅', desc: '광장·KB·삼성/이지스·선임차', lead: '사업2파트', coop: '기업마케팅실; 공간솔루션실', schedule: { m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', const_start: '●', const_mid: '●' } },
    { category: 'Task', name: 'PF/금융', desc: 'Term Sheet·대주단·재무모델·CP', lead: 'LFC', coop: '사업2파트;전 부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '◆', m03: '◆', take_out: '◆' } },
    { category: 'Task', name: '법무/세무/구조', desc: '리츠·Asset/Share·합병·주주승인', lead: '법무/세무자문', coop: '사업2파트;LFC', schedule: { m06: '●', m07: '●', m08: '●', m09: '●' } },
    { category: 'Task', name: '팝업업무', desc: '단발 요청 접수/위임/보류/반려', lead: '사업2파트', coop: '요청부서', schedule: { m06: '●', m07: '●', m08: '●', m09: '●', m10: '●', m11: '●', m03: '●', const_start: '●', const_mid: '●', take_out: '●' } }
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
    coop: ["사업2파트", "사업관리1파트"],
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
    coop: ["공간솔루션실", "사업2파트"],
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
    coop: ["공간솔루션실", "사업2파트"],
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
    coop: ["사업2파트", "사업관리1파트"],
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
    lead: "사업2파트",
    coop: ["기업마케팅실", "LFC", "법무/세무자문"],
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
    lead: "사업2파트",
    coop: ["LFC", "법무/세무자문"],
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
    lead: "사업2파트",
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
    lead: "사업2파트",
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
    lead: "사업2파트",
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
    coop: ["사업2파트"],
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
    coop: ["공간솔루션실", "사업2파트"],
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
    coop: ["사업2파트", "LFC"],
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
    coop: ["사업2파트", "공간솔루션실", "LFC"],
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
    coop: ["사업2파트", "공간솔루션실", "LFC"],
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
    coop: ["사업2파트", "LFC"],
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
    coop: ["사업2파트", "사업관리1파트"],
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
    coop: ["사업2파트", "법무/세무자문"],
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
    category: "법무/세무",
    subsector: "리츠 전환",
    task: "427 리츠 전환+816 편입 검토",
    pf: true,
    const: false,
    op: false,
    lead: "사업2파트",
    coop: ["LFC", "법무/세무자문", "사업관리1파트"],
    need: "자문결과",
    partner: "법무/세무법인",
    point: "기본 구조 재정의"
  },
  {
    category: "법무/세무",
    subsector: "Asset/Share",
    task: "구조별 절차·세금·주주동의 비교",
    pf: true,
    const: false,
    op: false,
    lead: "법무/세무자문",
    coop: ["사업2파트", "LFC"],
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
    lead: "사업2파트",
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
    coop: ["사업2파트", "기업마케팅실", "개발관리실"],
    need: "장기 금융전략",
    partner: "금융기관",
    point: "PF 조건과 연결"
  }
];

const R_R_CATEGORIES = [
  '전체보기', 'PF/금융', '인허가', '호텔/운영', '시공/원가', '도면/설계',
  '인테리어/TI', '임차/마케팅', '법무/세무', '주주/보고', '준공/담보대출', '팝업/단발'
];

export default function PmoScheduleGate() {
    const [filterCategory, setFilterCategory] = React.useState('All'); // All, Gate, Task
    const [selectedRrCategory, setSelectedRrCategory] = React.useState('전체보기');
    const [selectedRrLead, setSelectedRrLead] = React.useState('전체보기');
    const [selectedRrCoop, setSelectedRrCoop] = React.useState('전체보기');

    const rrData = React.useMemo(() => CATEGORY_MAP_DATA.map((item, idx) => ({ ...item, id: `mock-${idx}` })), []);
    const [scrollLeft, setScrollLeft] = React.useState(0);

    // Timeline Drag-to-Scroll Logic
    const sliderRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [dragScrollLeft, setDragScrollLeft] = React.useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setDragScrollLeft(sliderRef.current.scrollLeft);
    };
    const handleMouseLeave = () => { setIsDragging(false); };
    const handleMouseUp = () => { setIsDragging(false); };
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        sliderRef.current.scrollLeft = dragScrollLeft - walk;
    };

    const getSelectWidth = (value, defaultLabel) => {
        const text = value === '전체보기' ? defaultLabel : value;
        let len = 0;
        for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code >= 0 && code <= 128) len += 6.5;
            else len += 12.0;
        }
        return `${Math.max(len - 4, 16)}px`;
    };

    const R_R_LEADS = React.useMemo(() => {
        const leads = rrData.map(item => item.lead).filter(Boolean);
        return ['전체보기', ...Array.from(new Set(leads))];
    }, [rrData]);

    const R_R_COOPS = React.useMemo(() => {
        const coops = rrData.flatMap(item => item.coop).filter(Boolean);
        return ['전체보기', ...Array.from(new Set(coops))];
    }, [rrData]);

    const deptOptions = React.useMemo(() => {
        const set = new Set([
            '사업2파트', 
            '기획추진', 
            '개발관리실', 
            '공간솔루션실', 
            '사업관리1파트', 
            'LFC', 
            '법무/세무자문', 
            '기업마케팅실'
        ]);
        return Array.from(set);
    }, []);

    const uniqueStakeholderNames = React.useMemo(() => {
        return [];
    }, []);

    const uniqueSubsectors = React.useMemo(() => {
        const defaultSubs = [
            '현금기부채납', '소공원로', '변경인가', '사용승인', '브랜드', '계약구조',
            '운영수지/FF&E', '현대건설', '삼성물산', '공사비/VE', 'PF 기준도면', '면적표',
            '오피스 TI', '호텔 인테리어', '광장', 'KB/금융권', '삼성/이지스', '단독 PF',
            '통합 PF', '재무모델', '리츠 전환', 'Asset/Share', '의사결정', 'Take-out'
        ];
        const subs = [
            ...defaultSubs,
            ...rrData.map(item => item.subsector).filter(Boolean)
        ];
        return Array.from(new Set(subs));
    }, [rrData]);

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
        <div className="w-[1290px] mx-auto flex-1 flex flex-col pt-[28px] pb-[200px] box-border select-text text-white bg-transparent text-left">
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
            <div className="w-full flex items-end justify-between mb-[20px]">
                <div className="flex items-baseline gap-[16px]">
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none">마일스톤</h1>
                    <p className="text-[15px] text-[#86868B] leading-none">마일스톤의 최종 목표는 준공 및 Take-out/운영 전환입니다.</p>
                </div>
                {/* Legend info */}
                <div className="flex items-center gap-4 text-[12px] font-bold pr-[10px]">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                        <span className="text-[#E5E5E5]">수행 진행 기간</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#F59E0B] font-mono text-[16px] leading-none flex items-center h-[12px] mb-0.5">◆</span>
                        <span className="text-[#E5E5E5]">마일스톤 달성</span>
                    </div>
                </div>
            </div>

            {/* Timeline Matrix Grid */}
            <div className="w-[1290px] border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-visible relative">
                
                {/* Speech Bubbles Overlay */}
                <div className="absolute top-[-64px] left-0 w-full h-[36px] pointer-events-none z-50 overflow-visible">
                    {/* PF 1차 */}
                    {(() => {
                        const x = 952.5;
                        return (
                            <div 
                                style={{ left: `${x}px`, opacity: 1 }} 
                                className="absolute -translate-x-1/2 top-[10px] bg-[#ff9f0a] text-[#1c1c1e] rounded-[6px] text-[11px] font-bold shadow-lg text-center leading-tight w-[58px] h-[44px] flex flex-col justify-center items-center pointer-events-auto"
                            >
                                <div>PF 달성</div>
                                <div>1차목표</div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#ff9f0a]"></div>
                            </div>
                        );
                    })()}
                    
                    {/* PF 2차 */}
                    {(() => {
                        const x = 1027.5;
                        return (
                            <div 
                                style={{ left: `${x}px`, opacity: 1 }} 
                                className="absolute -translate-x-1/2 top-0 bg-[#2c2c2e] text-white border border-[#3c3c3c] rounded-[6px] text-[11px] font-bold shadow-lg text-center leading-tight w-[70px] h-[54px] flex flex-col justify-center items-center pointer-events-auto"
                            >
                                <div>1차목표</div>
                                <div>미달성시</div>
                                <div>2차목표</div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#2c2c2e]"></div>
                                <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[6px] border-t-[#3c3c3c] z-[-1]"></div>
                            </div>
                        );
                    })()}
                </div>

                <div className="w-full rounded-[32px] select-text">
                    <div className="flex items-center w-full overflow-visible pointer-events-none">
                        <table className="text-left table-fixed w-[1290px] min-w-[1290px] max-w-[1290px] pointer-events-auto">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-12">
                                    <th className="pl-[10px] pr-1 w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726] rounded-tl-[31px]">구분</th>
                                    <th className="pl-3 w-[258px] min-w-[258px] max-w-[258px] bg-[#272726]">세부업무</th>
                                    <th className="px-1 w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726]">주관</th>
                                    <th className="px-1 w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726] border-r border-[#3c3c3c]">협업</th>
                                    {COLUMNS.map((col, cIdx) => {
                                        const isLast = cIdx === COLUMNS.length - 1;
                                        const borderClass = col.highlight
                                            ? `bg-white/[0.03] text-[#60a5fa] ${isLast ? '' : 'border-r border-[#4c4c4c]/50'}`
                                            : `text-[#86868B] ${isLast ? '' : 'border-r border-[#4c4c4c]/50'}`;
                                        return (
                                            <th key={col.key} className={`text-center font-['Inter'] text-[11px] leading-tight px-1 font-bold w-[75px] min-w-[75px] max-w-[75px] ${borderClass} ${isLast ? 'rounded-tr-[31px]' : ''}`}>
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
                                    const isLastRow = idx === filteredData.length - 1;
                                    return (
                                        <tr key={idx} className="hover:bg-[#333] transition-colors h-[50px] group">
                                            {/* 구분 */}
                                            <td className={`pl-[10px] pr-1 bg-[#272726] group-hover:bg-[#333] transition-colors text-center w-[110px] min-w-[110px] max-w-[110px] ${
                                                isLastRow ? 'rounded-bl-[31px]' : ''
                                            }`}>
                                                <span className={`px-1.5 py-1 rounded-md font-bold block ${
                                                    isGate 
                                                        ? 'bg-[#2997ff]/10 text-[#60a5fa] border border-[#2997ff]/20' 
                                                        : 'bg-[#a1a1aa]/10 text-[#e4e4e7] border border-[#a1a1aa]/20'
                                                }`}>
                                                    {renderCategoryName(item.name)}
                                                </span>
                                            </td>
                                            
                                            {/* 세부업무 */}
                                            <td className="pl-3 font-medium text-[#bdbba7] leading-snug text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors text-[13px] tracking-tight w-[258px] min-w-[258px] max-w-[258px]">
                                                {item.desc}
                                            </td>
                                            
                                            {/* 주관 */}
                                            <td className="px-1 text-[#E5E5E5] font-semibold text-center bg-[#272726] group-hover:bg-[#333] transition-colors text-[12px] leading-tight tracking-tight whitespace-normal break-words w-[110px] min-w-[110px] max-w-[110px]">
                                                {item.lead.includes(' ') ? (
                                                    item.lead.split(' ').map((part, pIdx) => (
                                                        <div key={pIdx}>{part}</div>
                                                    ))
                                                ) : (
                                                    item.lead
                                                )}
                                            </td>
                                            
                                            {/* 협업 */}
                                            <td className="px-1 text-[#c2c2c6] leading-tight text-center whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors border-r border-[#3c3c3c]  w-[110px] min-w-[110px] max-w-[110px]">
                                                {item.coop.split(';').map((c, cIdx) => (
                                                    c && <div key={cIdx} className="text-[11px]">{c}</div>
                                                ))}
                                            </td>

                                            {/* Grid Columns */}
                                            {COLUMNS.map((col, cIdx) => {
                                                const isLastCol = cIdx === COLUMNS.length - 1;
                                                const mark = item.schedule[col.key];
                                                const borderClass = isLastCol ? '' : 'border-r border-[#4c4c4c]/40';
                                                return (
                                                    <td key={col.key} className={`text-center ${
                                                        col.highlight ? 'bg-white/[0.015] group-hover:bg-white/[0.04]' : ''
                                                    } ${borderClass} w-[75px] min-w-[75px] max-w-[75px] ${isLastRow && isLastCol ? 'rounded-br-[31px]' : ''}`}>
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
                    </div>
                </div>
            </div>

            {/* Divider Line */}
            <div className="w-full h-[1px] bg-[#2C2C2E] mt-[50px] mb-[38px]" />

            {/* Category Map & R&R Section */}
            <div className="w-full flex items-center justify-start gap-4 mb-[18px]">
                <h2 className="text-[32px] font-bold text-white tracking-tight leading-none text-left">R&R 및 필요산출물</h2>
            </div>

            {/* R&R Matrix Table */}
            <div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-hidden relative mb-[40px] shadow-sm min-h-[1110px]">
                <div className="w-full rounded-[32px] select-text">
                    <div className="flex items-center w-full overflow-visible pointer-events-none">
                        <table className="text-left table-fixed w-[1290px] min-w-[1290px] max-w-[1290px] pointer-events-auto border-collapse border-b border-[#3c3c3c] bg-[#272726]">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] bg-[#272726] text-[#86868B] font-bold text-[12px] h-[56px]">
                                    <th className="px-1 w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726] rounded-tl-[31px] z-30">
                                        <div className="relative inline-flex items-center justify-center bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b]">
                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrCategory === '전체보기' ? 'text-[#86868B]' : 'text-[#2997ff]'}`}>
                                                {selectedRrCategory === '전체보기' ? '대분류' : selectedRrCategory}
                                            </span>
                                            <span className="text-[8px] text-[#86868B]/70 pointer-events-none select-none translate-y-[0.5px] ml-1">▼</span>
                                            <select
                                                value={selectedRrCategory}
                                                onChange={(e) => setSelectedRrCategory(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            >
                                                <option disabled value="" className="bg-[#222] text-[#86868B] font-bold">[ 대분류 ]</option>
                                                <option value="전체보기" className="bg-[#222] text-[#86868B]">전체보기</option>
                                                {R_R_CATEGORIES.slice(1).map(cat => {
                                                    const isAdHoc = cat === '팝업/단발';
                                                    return (
                                                        <option 
                                                            key={cat} 
                                                            value={cat} 
                                                            disabled={isAdHoc} 
                                                            className={isAdHoc ? 'text-[#555] bg-[#222]' : 'bg-[#222] text-white'}
                                                        >
                                                            {cat} {isAdHoc && ' (본 페이지 대상 아님)'}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </th>
                                    <th className="px-1 w-[80px] min-w-[80px] max-w-[80px] text-center bg-[#272726] z-30 whitespace-nowrap">세부섹터</th>
                                    <th className="pl-3 w-[230px] min-w-[230px] max-w-[230px] bg-[#272726] border-r border-[#3c3c3c] ">대표 업무</th>
                                    <th className="px-2 w-[65px] min-w-[65px] max-w-[65px] text-center bg-[#272726] text-[11px] leading-tight">PF 전<br />필요</th>
                                    <th className="px-2 w-[65px] min-w-[65px] max-w-[65px] text-center bg-[#272726] text-[11px] leading-tight">착공 전<br />필요</th>
                                    <th className="px-2 w-[65px] min-w-[65px] max-w-[65px] text-center bg-[#272726] text-[11px] leading-tight border-r border-[#3c3c3c]">준공 전<br />필요</th>
                                    <th className="w-[90px] min-w-[90px] max-w-[90px] text-center bg-[#272726]">
                                        <div className="relative inline-flex items-center justify-center bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b] translate-x-[6px]">
                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrLead === '전체보기' ? 'text-[#86868B]' : 'text-[#2997ff]'}`}>
                                                {selectedRrLead === '전체보기' ? '주관 부서' : selectedRrLead}' : selectedRrLead}
                                            </span>
                                            <span className="text-[8px] text-[#86868B]/70 pointer-events-none select-none translate-y-[0.5px] ml-1">▼</span>
                                            <select
                                                value={selectedRrLead}
                                                onChange={(e) => setSelectedRrLead(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            >
                                                <option disabled value="" className="bg-[#222] text-[#86868B] font-bold">[ 주관 부서 ]</option>
                                                <option value="전체보기" className="bg-[#222] text-[#86868B]">전체보기</option>
                                                {R_R_LEADS.slice(1).map(lead => (
                                                    <option key={lead} value={lead} className="bg-[#222] text-white">{lead}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </th>
                                    <th className="pl-3 w-[245px] min-w-[245px] max-w-[245px] text-left bg-[#272726] border-r border-[#3c3c3c]">
                                        <div className="relative inline-flex items-center justify-start bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2.5 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b]">
                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrCoop === '전체보기' ? 'text-[#86868B]' : 'text-[#2997ff]'}`}>
                                                {selectedRrCoop === '전체보기' ? '협업 부서' : selectedRrCoop}' : selectedRrCoop}
                                            </span>
                                            <span className="text-[8px] text-[#86868B]/70 pointer-events-none select-none translate-y-[0.5px] ml-1">▼</span>
                                            <select
                                                value={selectedRrCoop}
                                                onChange={(e) => setSelectedRrCoop(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            >
                                                <option disabled value="" className="bg-[#222] text-[#86868B] font-bold">[ 협업 부서 ]</option>
                                                <option value="전체보기" className="bg-[#222] text-[#86868B]">전체보기</option>
                                                {R_R_COOPS.slice(1).map(coop => (
                                                    <option key={coop} value={coop} className="bg-[#222] text-white">{coop}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </th>
                                    <th className="px-1 tracking-tighter whitespace-nowrap w-[95px] min-w-[95px] max-w-[95px] text-center bg-[#272726]">외부 상대방</th>
                                    <th className="px-1 tracking-tighter whitespace-nowrap w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726]">필요산출물</th>
                                    <th className="px-3 w-[170px] min-w-[170px] max-w-[170px] text-left bg-[#272726] border-r border-[#3c3c3c] rounded-tr-[31px] whitespace-nowrap">관리 포인트</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c]/60 text-[12px]">
                                {rrData.filter(item => {
                                    const matchCat = selectedRrCategory === '전체보기' || item.category === selectedRrCategory;
                                    const matchLead = selectedRrLead === '전체보기' || item.lead === selectedRrLead;
                                    const matchCoop = selectedRrCoop === '전체보기' || item.coop.includes(selectedRrCoop);
                                    return matchCat && matchLead && matchCoop;
                                }).map((item, index, array) => {
                                    const isLastItem = index === array.length - 1;
                                    return (
                                        <tr key={item.id} className="bg-[#272726] hover:bg-[#333] transition-colors h-12 group">
                                            {/* 대분류 */}
                                            <td className={`px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-white text-[12px] w-[110px] min-w-[110px] max-w-[110px] ${isLastItem ? 'rounded-bl-[31px]' : ''}`}>
                                                {item.category}
                                            </td>
                                            
                                            {/* 세부섹터 */}
                                            <td className="px-1 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-[#E5E5E5] text-[12px] whitespace-nowrap overflow-hidden text-ellipsis w-[80px] min-w-[80px] max-w-[80px]">
                                                {item.subsector}
                                            </td>
                                            
                                            {/* 대표 업무 */}
                                            <td className="pl-3 font-bold text-[#bdbba7] leading-snug text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors border-r border-[#3c3c3c] text-[13px] w-[230px] min-w-[230px] max-w-[230px]">
                                                {item.task}
                                            </td>
                                            
                                            {/* PF 전 필요 */}
                                            <td className="px-2 text-center w-[65px] min-w-[65px] max-w-[65px]">
                                                {item.pf ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 착공 전 필요 */}
                                            <td className="px-2 text-center w-[65px] min-w-[65px] max-w-[65px]">
                                                {item.const ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 준공 전 필요 */}
                                            <td className="px-2 text-center border-r border-[#3c3c3c] w-[65px] min-w-[65px] max-w-[65px]">
                                                {item.op ? (
                                                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">필수</span>
                                                ) : (
                                                    <span className="text-[#555] font-bold">-</span>
                                                )}
                                            </td>

                                            {/* 주관 부서 */}
                                            <td className="text-center w-[90px] min-w-[90px] max-w-[90px] bg-[#272726] group-hover:bg-[#333] transition-colors">
                                                <span className="px-2.5 py-0.5 rounded font-bold bg-[#2997ff]/10 text-white border border-[#2997ff]/20 text-[11px] whitespace-nowrap inline-block translate-x-[6px]">
                                                    {item.lead}
                                                </span>
                                            </td>
                                            
                                            {/* 협업 부서 */}
                                            <td className="pl-3 text-left w-[245px] min-w-[245px] max-w-[245px] border-r border-[#3c3c3c] whitespace-normal break-words leading-tight pr-2 text-[#E5E5E5] bg-[#272726] group-hover:bg-[#333] transition-colors">
                                                <div className="flex flex-row gap-1.5 justify-start items-center whitespace-nowrap">
                                                    {item.coop.map((c, cIdx) => (
                                                        c && <span key={cIdx} className="px-2 py-0.5 rounded bg-[#1F1F1E] text-[#C2C2C6] border border-[#3c3c3c] text-[11px] whitespace-nowrap">{c}</span>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* 외부 상대방 */}
                                            <td className="px-1 text-center text-[#A1A1AA] font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-[95px] min-w-[95px] max-w-[95px] bg-[#272726] group-hover:bg-[#333] transition-colors">
                                                {item.partner || '-'}
                                            </td>

                                            {/* 필요산출물 */}
                                            <td className="px-1 text-center text-[#F59E0B] font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-[75px] min-w-[75px] max-w-[75px] bg-[#272726] group-hover:bg-[#333] transition-colors">
                                                {item.need || '-'}
                                            </td>

                                            {/* 관리 포인트 */}
                                            <td className={`px-2 text-left text-[#A1A1AA] font-normal whitespace-nowrap overflow-hidden text-ellipsis w-[170px] min-w-[170px] max-w-[170px] border-r border-[#3c3c3c] bg-[#272726] group-hover:bg-[#333] transition-colors ${isLastItem ? 'rounded-br-[31px]' : ''}`}>
                                                {item.point}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            

        </div>
    );
}
