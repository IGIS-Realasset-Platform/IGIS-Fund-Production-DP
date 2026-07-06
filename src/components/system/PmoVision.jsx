import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function PmoVision() {
    const { memberInfo, loading } = useAuth();
    const [selectedMenu, setSelectedMenu] = useState('ifpdp-proposal');
    const [copied, setCopied] = useState(false);

    // Debugging print to help trace if auth fails or is empty
    console.log("PmoVision Auth Info:", { loading, memberInfo });

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#08080A] flex flex-col items-center justify-center text-[#E5E5E5] font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[13px] text-gray-500">인증 세션 확인 중...</span>
                </div>
            </div>
        );
    }

    // Only allow '전기영' to access this page
    const isAuthorized = memberInfo?.staff_name === '전기영';

    const getStaffTitle = (info) => {
        if (!info?.staff_name) return '로그인 필요';
        return `${info.staff_name} 부장`;
    };

    // Restructured Sidebar Menu following the 3-submenus pattern for each major menu
    const navigationStructure = [
        {
            title: 'IFPDP',
            items: [
                { id: 'ifpdp-proposal', label: '시스템 기획안' },
                { id: 'ifpdp-requirements', label: '기능요구사항' },
                { id: 'ifpdp-schema', label: 'DB Schema' }
            ]
        },
        {
            title: 'IOTA CFT Phase 1',
            items: [
                { id: 'phase1-proposal', label: '시스템 기획안' },
                { id: 'phase1-requirements', label: '기능요구사항' },
                { id: 'phase1-schema', label: 'DB Schema' }
            ]
        },
        {
            title: 'IOTA CFT Phase 2',
            items: [
                { id: 'phase2-proposal', label: '시스템 기획안' },
                { id: 'phase2-requirements', label: '기능요구사항' },
                { id: 'phase2-schema', label: 'DB Schema' }
            ]
        }
    ];

    // Restructured Data Map
    const contentMap = {
        // --- 1. IFPDP ---
        'ifpdp-proposal': {
            title: 'IFPDP 시스템 기획안',
            subtitle: '부서 간 데이터 통합 및 의사결정 지원을 위한 전사 자산 관제 시스템 설계안',
            content: `1. 플랫폼 기획 의도 및 목적
현재 자산운용 및 리스크 관리 과정에서 소싱, 투자, 상품기획, 개발관리, 자산관리 등 각 센터 및 부서별로 분산된 정량 데이터와 정성적 의사결정 이력(Context Graph)을 통합하는 것을 목적으로 합니다. 정보 취합에 따른 시간 지연을 차단하고 실시간으로 정합성이 확보된 데이터를 바탕으로 임원진과 부서 간 신속한 의사결정을 지원합니다.

2. SSOT (Single Source of Truth) 코어 아키텍처
플랫폼의 기능 요구사항을 개별적인 단품 테이블로 파편화하여 분산 개발하지 않습니다. 플랫폼의 근간이 되는 '개별 자산 상세 객체'를 단일 진실 공급원(SSOT)으로 둡니다.
개별 자산 객체에 입력되는 기초 데이터(AUM, 일정, 수익률, 담당자 등)가 정밀하게 통제되면, '그룹 거시 지표' 및 '수익자(LP) 종합 뷰'는 시스템이 개별 자산들을 실시간으로 자동 취합(Aggregation)하여 일관되게 연산 및 표출하는 구조를 취합니다.

3. 7대 핵심 DB 모듈 개요
자산운용사의 필수 가치사슬을 포괄하여 구조화된 7개 데이터 모듈(자산 개요/비히클, 자본 스택/LP 관리, 10단계 가치사슬 일정, 개발 상품/ESG 전략, 실물 운영/임대차 네트워크, 거시 OKR/시장 지표, 의사결정 맥락/컴플라이언스)을 유기적으로 연계합니다.

4. 시스템 설계 구현 타당성
방대한 전사 데이터를 일시적으로 구축하는 것은 비현실적이므로, 초기에는 핵심 자산(예: 더케이트윈타워 등)에 대한 실질적 시나리오 흐름을 모크업(Mock-up) 형태로 구현하여 타당성을 입증합니다. 시각 리소스를 많이 요구하는 메인 대시보드와 상황 인식 연산이 필요한 대화형 AI 패널 영역을 코드 레벨에서 격리(Decoupling)하여 충돌이나 병목을 방지합니다.`
        },
        'ifpdp-requirements': {
            title: 'IFPDP 기능요구사항',
            subtitle: '전사 자산 관제 및 의사결정 지원 플랫폼의 핵심 기능 명세',
            content: `1. 3-Pane 하이브리드 UI/UX 구현
- 좌측 내비게이션 패널: 사용자의 목적에 부합하는 메뉴 체계 및 라우팅 컨트롤 제공.
- 중앙 대시보드 패널: 데이터 시계열 차트, 자산 정보 목록 및 핵심 원장 지표 실시간 렌더링.
- 우측 AI 비서 패널: 거대언어모델(LLM) 기반 대화형 인터페이스를 배치하여 데이터 요약 및 조작 명령 즉시 수행.

2. 시계열 데이터 가동성 보장
- 각 자산의 생애주기별 자본 구조 변화(브릿지론, 본PF, 리파이낸싱)를 연도별/분기별 타임라인 스케줄에 맞춰 시각화.
- 주요 재무 지표(총수입, NOI, Cap Rate)의 입력 및 변천 기록을 시계열로 조회 및 역산하는 연산 로직 구현.`
        },
        'ifpdp-schema': {
            title: 'IFPDP DB Schema',
            subtitle: 'IFPDP 전사 7대 핵심 데이터베이스 테이블 및 컬럼 모델 설계서',
            content: `-- 1. IFPDP 핵심 자산 마스터 테이블 (Core Asset Master)
CREATE TABLE public.ifpdp_assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_name VARCHAR NOT NULL,             -- 자산/프로젝트명
    main_use VARCHAR,                       -- 주요 용도 (오피스, 리테일, 복합 등)
    gfa_pyung NUMERIC,                      -- 연면적 (평)
    vehicle_type VARCHAR,                   -- 설정 형태 (Fund, PFV, REITs, SPC)
    vehicle_name VARCHAR,                   -- 펀드 호수/법인명 (예: 468-2호)
    director_name VARCHAR,                  -- 의사결정권자 (Director)
    pd_name VARCHAR,                        -- 책임 (PD)
    pm_name VARCHAR,                        -- 실무 담당 (PM)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. IFPDP 자본 스택 시계열 테이블 (Capital Stack Time-Series)
CREATE TABLE public.ifpdp_capital_stacks (
    stack_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.ifpdp_assets(asset_id),
    phase VARCHAR NOT NULL,                 -- 단계 (Bridge, PF, Refinance 등)
    tranche_name VARCHAR NOT NULL,          -- 트랜치명 (Equity 보통주, Debt 선순위 등)
    institution_name VARCHAR NOT NULL,      -- 참여 금융기관명
    amount_krw_100m NUMERIC,                -- 조달 규모 (억원)
    interest_rate NUMERIC,                  -- 조달 금리 (%)
    maturity_date DATE,                     -- 만기일
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
        },

        // --- 2. IOTA CFT Phase 1 ---
        'phase1-proposal': {
            title: 'IOTA CFT Phase 1 시스템 기획안',
            subtitle: '이오타 사업단 업무 통합 및 핵심 비히클 시계열 관제 프레임워크 구축 완료 보고',
            content: `1. 구축 배경 및 목적
이오타 사업단 내부 전문 부서(사업관리, LFC, 개발관리, 마케팅, 설계 등) 간의 정보 비대칭성 및 비정형적 의사결정을 해결하기 위해 수파베이스 단일 데이터베이스 기반의 협업 환경을 구축했습니다.
특히 운용사(AMC)에서 가장 핵심적이지만 표준 레거시 시스템에 부재했던 상세 비히클 정보(자금 조달 구조, 드로잉 이력, 캐피탈 콜 변천 등)를 시계열로 영구 추적하는 자산 관제 플랫폼의 기술적 기틀을 확립했습니다.

2. 시스템 아키텍처 및 권한 체계
이지스 임직원 인증과 연동하여 소속 부서 및 직급 정보를 판독하고, 이에 맞게 다중 테넌트 워크스페이스(PM1, PM2, LFC 등)로 즉시 다이렉팅하는 하이브리드 라우팅 및 6대 업무 원장 테이블 기반의 데이터 아키텍처를 구현했습니다.

3. 핵심 비히클 자산 시계열 관제
브릿지론부터 PF, 리파이낸싱으로 이어지는 에쿼티(보통주/종류주/대여금) 및 대출금(Debt)의 캐피탈 스택 변화, 예상 총수입(GI)/순영업소득(NOI)/목표 캡레이트(Cap Rate) 등 프로젝트 재무 지표를 실시간 보존 및 추적합니다.`
        },
        'phase1-requirements': {
            title: 'IOTA CFT Phase 1 기능요구사항',
            subtitle: 'Phase 1에서 기틀을 다진 핵심 협업 및 자산 관리 기능 명세',
            content: `1. 부서별 워크스페이스 제공 및 진척도 모니터링
- 사업 PM, LFC 금융, DSC 개발관리, EMC 마케팅 등 부서별 소관 업무 및 마일스톤 관리.
- 주관 부서 및 협업 부서의 선후 관계를 시각화하여 실시간 진척 상황 체크.

2. 주간 스냅샷 아카이빙 (iota_weekly_snapshots)
- 매주 금요일 퇴근 시점의 실무 업무 원장을 스냅샷 이미지 형태로 보관하여 시간 흐름에 따른 변천사 자동 역추적.
- 네트워크 장애 대비 로컬 스토리지 실시간 백업 기동.

3. 의사결정 맥락 기록 및 알림 연동
- 중요 의사결정 안건을 기록하고 변경이 제한되는 의사결정 로그(DecisionLog) 및 실시간 액션 아이템 배정 에디터 탑재.
- 신규 태스크 및 병목(Blocker) 발생 시 메일/메시지 자동 백그라운드 발송.`
        },
        'phase1-schema': {
            title: 'IOTA CFT Phase 1 DB Schema',
            subtitle: 'Phase 1 협업 및 비히클 시계열 관리를 위한 핵심 테이블 설계서',
            content: `-- 1. 이오타 파트별 태스크 테이블 (PM, LFC, DSC 공통)
CREATE TABLE public.iota_pm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    related_asset VARCHAR NOT NULL,          -- 관련 자산 (427 PFV, 816 PFV, 421 Fund 등)
    task_name VARCHAR NOT NULL,             -- 업무명
    status VARCHAR DEFAULT '신규',          -- 상태 (신규, 진행중, 보류, 완료)
    priority VARCHAR DEFAULT '중간',        -- 우선순위
    due_date DATE,                          -- 마감일
    next_action TEXT,                       -- 다음 액션
    notes TEXT,                             -- 비고
    assignee VARCHAR,                       -- 담당자
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 의사결정 로그 테이블 (Decision Log)
CREATE TABLE public.iota_decision_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,                 -- 안건명
    decision_detail TEXT NOT NULL,          -- 결정사항 상세
    reason TEXT,                            -- 정성적 판단 근거 및 배경 사유
    decision_date DATE DEFAULT CURRENT_DATE,
    created_by VARCHAR,                     -- 등록자
    is_locked BOOLEAN DEFAULT false,        -- 히스토리 변경 방지 잠금
    created_at TIMESTAMPTZ DEFAULT NOW()
);`
        },

        // --- 3. IOTA CFT Phase 2 ---
        'phase2-proposal': {
            title: 'IOTA CFT Phase 2 시스템 기획안',
            subtitle: '실질적 운영 및 PMO 통제 체계 가동을 위한 고도화 설계안',
            content: `1. 실질적 운영화 전환의 당위성
Phase 1에서 기술적 기틀과 데이터 모델을 정비했다면, Phase 2는 이를 토대로 실무진이 매일 활용할 수 있도록 보안 등급 제어, 엑셀식 고속 셀 수정 인터페이스, 그리고 주간 회의체 즉시 연계 기능을 구축하여 실무 비즈니스를 실제로 구동 및 통제하는 것이 핵심 사명입니다.

2. 권한 및 보안 설계
Supabase 데이터베이스 레이어에 RLS(Row Level Security)를 활성화하여 iota_members 정보에 등록된 사용자의 소속 부서와 직무 등급에 맞추어 쓰기/수정 권한을 격리 통제합니다.

3. 실시간 PMO 그리드 및 회의 연동
업무 현황 최신화를 신속히 수행할 수 있도록 스프레드시트 방식의 인라인 편집 및 Blocker 원클릭 토글을 지원하고, 우선순위가 높거나 Blocker가 켜진 안건을 회의실 화면에 즉시 A등급으로 상단 노출시키는 실시간 대시보드 연동을 설계했습니다.`
        },
        'phase2-requirements': {
            title: 'IOTA CFT Phase 2 기능요구사항',
            subtitle: '비즈니스 실전 가동을 위한 PMO 핵심 기능 및 인터페이스 명세',
            content: `1. 스프레드시트 뷰 기반 인라인 편집 (Inline Edit)
- 태스크 테이블의 상태, 마감일, 다음 액션을 상세 팝업 창을 켜지 않고 그리드 내부에서 더블클릭하여 즉각 수정 및 비동기 저장.
- 병목(Blocker) 여부 및 의사결정 필요 여부 필드는 마우스 클릭 한 번으로 참/거짓 값을 토글 및 데이터베이스 즉시 반영.

2. 단발성 외부 팝업 요청 통제 (iota_pmo_popup_requests)
- 정규 마일스톤 외부에 발생하는 수작업 업무 요청을 공식 접수, 위임, 반려, 보류할 수 있는 수집 채널 및 승인 워크플로우 지원.

3. 실시간 회의체 상정용 임원 대시보드
- 우선순위 점수가 80점 이상이거나 의사결정필요가 참인 항목들을 'A등급 즉시 상정' 카드로 최상단 자동 정렬.
- 현재 병목이 집중된 부서와 담당자를 막대 그래프 형태로 실시간 차트 시각화.`
        },
        'phase2-schema': {
            title: 'IOTA CFT Phase 2 DB Schema',
            subtitle: '실전 PMO 통제 및 팝업 요청 관리를 위한 신규 테이블 DDL 명세',
            content: `-- 1. PMO 통합 원장 테이블 (PMO Control Ledger)
CREATE TABLE public.iota_pmo_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_type VARCHAR NOT NULL,          -- 프로젝트 구분 (공통, 427PFV 등)
    category_main VARCHAR,                  -- 대분류 (PMO, 호텔, 인허가 등)
    task_name VARCHAR NOT NULL,             -- 업무명
    task_purpose TEXT,                      -- 업무목적 및 영향도
    lead_department VARCHAR,                -- 실무 주관부서
    assignee VARCHAR,                       -- 담당자
    is_blocker BOOLEAN DEFAULT false,       -- Blocker 여부
    needs_decision BOOLEAN DEFAULT false,    -- 의사결정 필요 여부
    due_date DATE,                          -- 기한
    status VARCHAR DEFAULT '미착수',        -- 상태 (미착수, 진행중, 완료, 지연)
    priority_score INTEGER DEFAULT 0,       -- 우선순위 점수
    meeting_grade VARCHAR DEFAULT 'B',      -- 회의상정등급 (A_즉시상정, B_회의점검)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Supabase RLS (Row Level Security) 설정 예시
ALTER TABLE public.iota_pmo_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PM2 파트 및 어드민만 편집 가능" ON public.iota_pmo_tasks
    FOR ALL
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM public.iota_members 
            WHERE department = '사업관리2파트' OR role_grade IN ('임원', '어드민')
        )
    );`
        }
    };

    const activeData = contentMap[selectedMenu] || contentMap['ifpdp-proposal'];

    const handleCopy = () => {
        const text = activeData.title + '\n' + activeData.subtitle + '\n\n' + activeData.content;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isAuthorized) {
        return (
            <div className="w-full h-screen bg-[#08080A] flex flex-col items-center justify-center p-8 text-center text-[#E5E5E5] font-sans select-none">
                <div className="w-16 h-16 mb-6 text-red-500 opacity-80">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">접근 권한 제한 (Access Denied)</h2>
                <p className="text-sm text-[#86868B] max-w-[400px]">
                    본 페이지는 리얼에셋그룹 전기영 부장 전용 관제 센터입니다. 승인되지 않은 계정은 접근이 제한됩니다.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#08080A] text-[#E5E5E5] font-sans flex overflow-hidden">
            {/* Sidebar Navigator */}
            <aside className="w-[300px] border-r border-[#1C1C1E] bg-[#000000] flex flex-col justify-between shrink-0 select-none">
                <div className="flex flex-col flex-1 overflow-y-auto hide-scrollbar p-6">
                    {/* Header Anchor */}
                    <div className="mb-8">
                        <span className="text-[11px] font-bold text-blue-500 tracking-widest uppercase">Executive View</span>
                        <h2 className="text-[20px] font-bold text-white tracking-tight mt-1 leading-tight">IFPDP x IOTA PMO</h2>
                        <div className="h-[1px] bg-[#1C1C1E] w-full mt-4"></div>
                    </div>

                    {/* Nav Sections - Standardized 3 submenus pattern */}
                    <nav className="flex flex-col gap-6">
                        {navigationStructure.map((section, sIdx) => (
                            <div key={sIdx} className="flex flex-col">
                                <h3 className="text-[12px] font-bold text-[#86868B] mb-2 px-2 uppercase tracking-wider">
                                    {section.title}
                                </h3>
                                <div className="flex flex-col gap-0.5">
                                    {section.items.map((item) => {
                                        const isSelected = selectedMenu === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => setSelectedMenu(item.id)}
                                                className={`text-left px-3 py-2 rounded-xl text-[13.5px] transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-[#1C1C1E] text-white font-medium' 
                                                        : 'text-[#86868B] hover:text-white hover:bg-white/5 font-light'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Bottom User profile */}
                <div className="p-6 border-t border-[#1C1C1E] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center font-bold text-[14px]">
                            {memberInfo?.staff_name ? memberInfo.staff_name.substring(0,2) : 'U'}
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[13px] font-bold text-white leading-tight">
                                {getStaffTitle(memberInfo)}
                            </span>
                            <span className="text-[#86868B] text-[11px] leading-none mt-0.5 truncate max-w-[150px]">
                                {memberInfo?.email || 'authenticated'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Panel */}
            <main className="flex-1 flex flex-col overflow-hidden bg-[#08080A]">
                {/* Top bar control */}
                <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000]">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-blue-400">마스터 플랜 기획고문</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-[13px] text-gray-400">{activeData.title}</span>
                    </div>

                    <button
                        onClick={handleCopy}
                        className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] hover:text-white rounded-[8px] text-[12.5px] font-semibold transition-colors flex items-center gap-2 cursor-pointer text-[#E5E5E5]"
                    >
                        {copied ? (
                            <>
                                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                                복사 완료
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                본문 복사
                            </>
                        )}
                    </button>
                </header>

                {/* Main Text Area */}
                <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                    <div className="max-w-[800px]">
                        {/* Title group */}
                        <div className="mb-10">
                            <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight">
                                {activeData.title}
                            </h1>
                            <p className="text-[16px] text-blue-400 font-light mt-2 tracking-wide">
                                {activeData.subtitle}
                            </p>
                            <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                        </div>

                        {/* Content text */}
                        <div className="text-[15px] text-[#A1A1AA] leading-[28px] font-light whitespace-pre-wrap font-sans space-y-6">
                            {activeData.id.endsWith('schema') ? (
                                <pre className="bg-[#141416] p-6 rounded-2xl border border-[#1C1C1E] text-[13px] font-mono text-blue-300 overflow-x-auto whitespace-pre leading-relaxed select-text">
                                    <code>{activeData.content}</code>
                                </pre>
                            ) : (
                                activeData.content
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
