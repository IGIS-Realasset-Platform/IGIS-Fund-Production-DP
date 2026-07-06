import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function PmoVision() {
    const { memberInfo, signOut } = useAuth();
    const [selectedMenu, setSelectedMenu] = useState('ifpdp-purpose');
    const [copied, setCopied] = useState(false);

    // Only allow '전기영' to access this page
    const isAuthorized = memberInfo?.staff_name === '전기영';

    const getStaffTitle = (info) => {
        if (!info?.staff_name) return '로그인 필요';
        return `${info.staff_name} 부장`;
    };

    // Sidebar Menu Structure
    const navigationStructure = [
        {
            title: 'IFPDP 시스템 기획',
            items: [
                { id: 'ifpdp-purpose', label: '1. 기획 의도 및 목적' },
                { id: 'ifpdp-architecture', label: '2. SSOT 코어 아키텍처' },
                { id: 'ifpdp-modules', label: '3. 7대 핵심 DB 모듈' },
                { id: 'ifpdp-feasibility', label: '4. 시스템 설계 타당성' }
            ]
        },
        {
            title: 'IOTA CFT Phase 1 (프레임워크)',
            items: [
                { id: 'phase1-overview', label: '1. 개요 및 구축 배경' },
                { id: 'phase1-auth', label: '2. 아키텍처 및 권한' },
                { id: 'phase1-vehicle', label: '3. 핵심 비히클 시계열 관리' },
                { id: 'phase1-workspace', label: '4. 협업 워크스페이스 구축' },
                { id: 'phase1-bridge', label: '5. 실무 알림 및 연계' },
                { id: 'phase1-retrospective', label: '6. Phase 1 운영 성과' }
            ]
        },
        {
            title: 'IOTA CFT Phase 2 (실전 운영)',
            items: [
                { id: 'phase2-overview', label: '1. 실질적 운영 개요' },
                { id: 'phase2-security', label: '2. 1단계: 권한 및 보안 설계' },
                { id: 'phase2-db', label: '3. 2단계: PMO 원장 DB 스키마' },
                { id: 'phase2-grid', label: '4. 3단계: PMO 그리드 UI/UX' },
                { id: 'phase2-board', label: '5. 4단계: 실시간 회의체 연동' },
                { id: 'phase2-verification', label: '6. 검증 계획 및 시나리오' }
            ]
        }
    ];

    // Data Map for content display
    const contentMap = {
        'ifpdp-purpose': {
            title: '플랫폼 기획 의도 및 목적',
            subtitle: '부서 간 데이터 통합 및 의사결정 지원을 위한 전사 관제 체계',
            content: `자산운용 데이터의 중앙화와 의사결정 지연 최소화
현재 자산운용 및 리스크 관리 과정에서 소싱, 투자, 상품기획, 개발관리, 자산관리 등 각 센터 및 부서별로 고도로 분산되어 있는 각종 정량 데이터와 정성적인 의사결정 이력 문서를 전사 시스템으로 중앙화합니다. 이를 통해 정보 수집에 걸리는 시간 지연을 차단하고, 데이터의 정합성에 기반한 의사결정을 실시간으로 지원합니다.

3분할 하이브리드 인터페이스 도입
일반적인 텍스트 및 일방향 대시보드의 한계를 극복하기 위해 화면을 세 부분으로 격리 설계한 3분할 워크플로우를 제공합니다.
- 좌측 패널: 사용자의 목적에 부합하는 메뉴 체계 및 라우팅 컨트롤 제공
- 중앙 패널: 데이터 시계열 차트, 자산 정보 목록 및 핵심 원장 지표 노출
- 우측 패널: 거대언어모델 기반의 대화형 인공지능 비서가 배치되어 데이터 요약, 수정 명령 및 리스크 알림 수신을 즉시 수행`
        },
        'ifpdp-architecture': {
            title: 'SSOT 코어 아키텍처',
            subtitle: '단일 진실 공급원을 기반으로 하는 그룹 거시 지표 자동 산출',
            content: `개별 자산 객체 중심의 데이터 수집 모델
기능 요구사항을 각각 별도의 독립 메뉴와 단품 테이블로 구축하지 않습니다. 플랫폼의 근간이 되는 원자 단위인 개별 실물 자산 상세 객체를 단일 진실 공급원(Single Source of Truth)으로 수립합니다.

미시적 정보 취합을 통한 거시적 관제 구현
개별 자산 객체에 실무진이 입력하는 기초 데이터(자금 스택, 임대차 현황, 공사 진척도 등)의 정합성이 완벽하게 통제될 경우, 그룹 전체의 거시 지표(각 센터별 실시간 수수료 수익 현황, 전사 목표 진척률) 및 투자자 보고 지표는 시스템이 개별 자산 원장을 실시간으로 취합하여 자동으로 연산 및 산출합니다.`
        },
        'ifpdp-modules': {
            title: '7대 핵심 데이터베이스 모듈',
            subtitle: '종합 자산운용사의 전 가치사슬을 망라하는 필수 컴플라이언스 DB 체계',
            content: `1. 자산 개요, 비히클 및 조직 관리
자산/프로젝트명, 주요 용도, 대지 및 연면적 정보와 기금, 프로젝트금융투자회사 등의 비히클 설정 형태를 기재하고 담당 인력의 현업 배분 현황을 저장합니다.

2. 자본 스택 및 수익자 관리
선순위, 중순위, 후순위별 자금 조달 규모와 조달 금리, 대주단 구성원, 예상 운용 및 매각 보수 스케줄을 포함하여 수익자 배당률과 기출금 집행 일자를 모니터링합니다.

3. 10단계 가치사슬 및 시계열 트래킹
토지 매입일, PF 실행일, 착공일, 준공예정일, 대출 만기일, 펀드 설정 및 매각 종료 시기까지 자산 생애주기 전체의 시계열 타임라인을 데이터베이스화하여 역산합니다.

4. 개발 상품 기획 및 ESG 전략
부실 자산 정상화 플랜, 개발 타당성 시나리오, 하드코스트(평당 공사비), 건축 인허가 상태, 시공/설계 파트너 정보 및 LEED 등의 친환경 인증 여부를 기록합니다.

5. 실물 운영 및 임차인 네트워크
임대율, 가중평균 잔여 임대기간(WALT), 하자 보수 현황 및 국내 유수 대기업들의 산업군별 임차 조건 선호도를 수집하여 신규 자산과의 매칭 가능성을 역연산합니다.

6. 거시 지표 및 부서별 성과 관리
전사 매출 목표 달성률 및 부서별 성척도를 추적하고, 주요 앵커 테넌트의 이전 동향 및 대형 시공사의 재무 건전성 리스크를 시계열로 관찰합니다.

7. 의사결정 맥락 엔진 및 리스크 통제
중대한 딜 브레이커 요소를 색상별 심각도(레드, 옐로우, 그린)로 우선순위 시각화하고, 이사회 및 투자심의위원회에서 안건이 가결 혹은 변경될 당시의 배경 사유와 정성적 판단 근거를 아카이빙합니다.`
        },
        'ifpdp-feasibility': {
            title: '시스템 설계 타당성',
            subtitle: '프론트엔드 플랫폼의 작동 타당성 및 리소스 관리 기법',
            content: `골든 패스 시나리오 구현
방대한 7대 모듈의 데이터를 실무망에서 일시 구축하는 것은 현실적으로 불가하므로, 초기 개발 단계에서는 핵심 자산(예: 더케이트윈타워)에 대한 실질적 기능 흐름만을 하드코딩된 API 모크업 형태로 시각화하여 플랫폼의 유용성을 즉시 입증합니다.

모듈형 아키텍처와 패널 간 디커플링
시각 연산량이 높은 중앙 대시보드 렌더링 엔진과 상황 인식 연산이 필요한 대화형 AI 패널 영역을 코드 수준에서 격리(Decoupling)하여 상호 충돌이나 메모리 부하에 따른 브라우저 병목 없이 유연하게 기능을 확장합니다.`
        },
        'phase1-overview': {
            title: '개요 및 구축 배경',
            subtitle: 'IFPDP 전사 프레임워크와의 연동 및 자산 관제 기틀 수립',
            content: `이오타 CFT 협업 플랫폼은 이지스자산운용의 전사 통합 자산 관제 및 의사결정 메타데이터 시스템인 IFPDP의 설계 철학에서 출발하였습니다. 전사 데이터 통합이라는 거시적 프레임워크 아래, 실제 실무 비즈니스와 사업 관리를 유기적으로 연결하는 첫 번째 실천적 하이브리드 형태의 플랫폼으로 기능합니다.

운용사(AMC)에서 가장 핵심적인 자산 정보인 프로젝트별 비히클 정보(자금 조달 구조, 리파이낸싱 경과, 사업성 지표 등)는 그동안 이지스 내부의 표준 ERP 등 레거시 시스템에서도 추적 관리하기 어려웠던 극도로 세부적인 성격을 띠고 있습니다. 본 플랫폼은 이러한 데이터 공백을 해결하고 금융기관별 캐피탈 스택 추이와 사업 마일스톤 이력을 영구적으로 기록 보존하기 위해 기획되었습니다.`
        },
        'phase1-auth': {
            title: '아키텍처 및 권한',
            subtitle: '이지스 임직원 인증 기반의 다중 테넌트 워크스페이스 권한 통제',
            content: `인증 기반 부서별 권한 통제
이지스 내부 임직원 인증 시스템과 연동하여 초기 세션 수립 시 사용자의 이메일 및 직급 정보를 통해 본인의 전용 워크스페이스에 대한 접근 및 쓰기 권한을 확인합니다.
- 사업 PM 1 파트원: 권순일, 윤주형, 김제익, 류홍, 박만진, 박일훈, 이정원, 전무경
- 사업 PM 2 파트원: 강순용, 한찬호, 박석제, 박채현, 소현준, 이수정, 조영비, 한수정
- 플랫폼 어드민 및 임원진: 전기영, 이시정, 이관용, 이철승, 윤관식, 정조민, 우형석

다중 테넌트 워크스페이스 구조
사용자의 역할 및 소속 부서 세션에 맞춰 좌측 내비게이션 바에서 본인 소관 부서에 맞는 워크스페이스(PM1, PM2, LFC 등)로 즉시 리다이렉팅하는 하이브리드 라우팅을 적용했습니다.`
        },
        'phase1-vehicle': {
            title: '핵심 비히클 시계열 관리',
            subtitle: '이지스 사내 시스템에 존재하지 않는 실질 금융 조달 변천사 기록',
            content: `캐피탈 스택 시계열 관리
브릿지론에서 본 PF, 리파이낸싱 단계로 이어지는 자본 구조 변화를 보통주, 종류주, 주주대여금 등의 에쿼티 자본금 항목과 대주단 선/후순위 대출금(Debt) 항목별로 기록하고, 참여한 금융기관별 투자 규모와 조달 금리를 시계열 단계별로 보존합니다.

프로젝트 재무 및 사업성 지표 이력 보존
예상 총수입(GI), 연간 순영업소득(NOI), 목표 자본환원율(Cap Rate) 등 프로젝트 가치 산정의 기초 지표를 연도 및 분기별 시계열로 저장하여 최신화합니다.

마일스톤 및 히스토리 아카이브
토지 매입, 인허가 완료, 착공, 금융 종결, 준공 등 사업 추진에 수반되는 핵심 일정의 선후 관계를 일목요연한 역사적 시계열 기록물로 보존하여 자산 라이프사이클의 진행 단계를 역산할 수 있는 데이터를 제공합니다.`
        },
        'phase1-workspace': {
            title: '협업 워크스페이스 구축',
            subtitle: '부서별 업무 원장 통합 및 의사결정 맥락 아카이빙',
            content: `부서별 업무 관리 테이블 구성
iota_pm_tasks (사업 PM 파트), iota_financing_tasks (LFC 금융 파트), iota_development_tasks (개발관리 파트) 등 부서별 실무 일정과 계약 정보를 담는 독자적인 관계형 데이터베이스 스키마를 구성했습니다.

주간 스냅샷 아카이빙 시스템
매주 금요일 퇴근 시점의 실무 업무 원장 상태를 스냅샷 이미지로 저장하는 iota_weekly_snapshots 모듈을 구축했으며, 수파베이스 네트워크 장애 시 로컬 스토리지로 실시간 백업이 가동되는 복원력을 확보했습니다.

의사결정 및 회의록 이력 관리
안건 결정의 정성적 판단 근거를 영구 보존하는 의사결정 로그(DecisionLog) 및 회의 중 발생한 액션 아이템을 실무자에게 즉각 배정하는 입력 상자(LogWriteBox, MeetingWriteBox)를 구축했습니다.`
        },
        'phase1-bridge': {
            title: '실무 알림 및 연계',
            subtitle: '스마트 알림 연동 및 대외 이해관계자 데이터 베이스 구축',
            content: `스마트 알림 연동
새로운 업무나 Blocker(병목)가 등록되면 지정된 부서원 및 주요 의사결정권자에게 알림 메일 및 메시지를 비동기(Async) 백그라운드로 자동 발송하는 알림 브릿지를 가동했습니다.

이해관계자 마스터 관리
각 거래 빌딩별 LP(출자자), 시행사, 자산관리 회사 연락처 및 특이사항을 통합 조회하는 iota_stakeholder_master VVIP 인물 데이터베이스를 적재했습니다.`
        },
        'phase1-retrospective': {
            title: 'Phase 1 운영 성과 및 검증 상태',
            subtitle: '데이터 정합성 검증 완료 및 프리미엄 다크모드 화면 구성',
            content: `데이터 무결성
로컬 엑셀에 흩어져 있던 복잡한 컬럼 130여 개를 수파베이스 데이터베이스 내 4대 마스터 테이블로 완전히 매핑하여 데이터 유실 없는 전산 마이그레이션을 완수했습니다.

화면 구성 안정성
애플의 미니멀리즘 디자인 가이드를 준수하여 다크모드 대시보드를 구축했으며, 대량의 테이블 렌더링 시 브라우저 성능이 저하되지 않도록 패널 간 연산을 디커플링하여 안정성을 검증했습니다.`
        },
        'phase2-overview': {
            title: '실질적 운영 개요',
            subtitle: '기틀 구축 단계를 넘어 실제 비즈니스 가동을 위한 운영화 전환',
            content: `Phase 1에서 비히클 자산 정보의 시계열 관제 및 협업의 기초적인 기틀을 마련했다면, Phase 2는 이를 바탕으로 보안 통제, 실시간 엑셀 형태의 입력 및 수정 인터페이스, 그리고 회의체 즉시 연동 기능을 구축하여 비로소 실질적인 실무 운영을 가능하게 만드는 과정입니다.`
        },
        'phase2-security': {
            title: '1단계: 권한 및 보안 설계',
            subtitle: 'Supabase RLS 보안과 멤버 권한 정보의 유기적 결합',
            content: `멤버 정보 관리체계 개편
기존 프론트엔드의 하드코딩된 열람 제한 방식에서 탈피하여, 수파베이스 iota_members 테이블과 실시간 연동해 접근 제어를 수행합니다.
- 전체 쓰기 및 수정 권한 (PMO 통제권): 사업관리2파트 소속 임직원 전원 및 상위 임원진/어드민.
- 주관 업무 편집 권한 (제한적 수정): 각 실무 부서의 파트장 및 실무자는 본인 부서가 실무 주관부서인 행만 업데이트할 수 있도록 허용.

데이터베이스 RLS (Row Level Security) 정책 수립
네트워크 직접 호출이나 우회를 차단하기 위해 데이터베이스 레이어에서 정책을 적용합니다. iota_pmo_tasks 테이블에 RLS를 활성화하고, iota_members 테이블을 조회하여 해당 사용자의 부서가 사업관리2파트이거나 등급이 임원/어드민인 경우에만 입력, 수정, 삭제가 가능하도록 데이터베이스 정책을 적용합니다.`
        },
        'phase2-db': {
            title: '2단계: PMO 원장 DB 스키마',
            subtitle: '통합업무보드 27개 고유 필드 및 단발성 요청 대장 테이블 설계',
            content: `iota_pmo_tasks (PMO 통합 원장 테이블) DDL 정의
프로젝트 구분, 대분류, 세부섹터, 업무명, 업무목적, 필요 산출물, 최종 목표축(PF/준공), Gate 단계(G0~G4), 주관부서, 협업부서, 담당자, Blocker 여부, 의사결정 필요 여부, 기한, 상태, 중요도(PF필수/준공필수), 업무유형, 다음 액션, 우선순위 점수, 회의상정등급, 상정사유 등을 포함하는 원장 테이블 스키마 설계.

iota_pmo_popup_requests (팝업 및 단발성 요청 관리 테이블)
정규 업무의 침식을 예방하고 단발성 외부 요청을 접수, 위임, 반려하기 위한 관리 대장 설계.`
        },
        'phase2-grid': {
            title: '3단계: PMO 전용 그리드 UI/UX 개발',
            subtitle: '신속한 정보 최신화를 지원하는 스프레드시트 뷰 구현',
            content: `인라인 셀 편집 (Inline Edit)
각 업무의 상태, 기한, 다음 액션, 우선순위점수 등을 별도의 수정 창을 켜지 않고 엑셀처럼 더블클릭하여 바로 즉시 변경하여 자산 정보 최신화 편의성 극대화.

원클릭 토글 뱃지
병목(Blocker) 및 의사결정필요 필드는 상태를 클릭 한 번으로 토글하고 데이터베이스에 즉각 비동기로 자동 저장하여 정보 최신화 간소화.

부서 멀티태그 필터링
상단의 부서 뱃지를 클릭하면 주관하는 업무와 협업하는 업무만 즉시 필터링하여 업무 부하율을 화면에 표시.`
        },
        'phase2-board': {
            title: '4단계: 실시간 회의체 연동',
            subtitle: '의사결정 회의체에서 모니터에 띄우고 가부를 바로 결정하는 관제 화면',
            content: `A등급 즉시 상정 섹션
우선순위점수가 80점 이상이거나 의사결정필요 및 Blocker 상태가 참인 핵심 현안들을 상단에 카드로 자동 정렬 노출하여 즉각 판단 지원.

부서별 Blocker 카운트 차트
현재 어느 부서에서 업무 병목이 발생하고 있는지 실시간 막대 차트로 가독성 높게 표현하여 의사결정 지원.`
        },
        'phase2-verification': {
            title: '검증 계획 및 시나리오',
            subtitle: '마이그레이션 데이터 무결성 검증 및 비인가 권한 테스트',
            content: `자동화 테스트 시나리오
데이터 마이그레이션 스크립트 실행 후 수파베이스에 적재된 로우 수가 엑셀의 데이터 로우 수와 정확히 일치하는지 카운트 검증 테스트 진행. 권한이 없는 비인가 계정으로 테이블 데이터 입력 및 수정 API 호출 시 데이터베이스 수준에서 차단 및 실패 오류가 발생하는지 확인.

수동 검증 프로세스
사업관리2파트에 속하지 않는 일반 부서원으로 로그인 시, 사이드바 메뉴 및 대시보드 내 관리 기능에 접근할 수 없음을 직접 눈으로 확인. 스프레드시트 그리드에서 병목 상태 토글 클릭 시, 정상적으로 데이터베이스에 변경 상태가 저장 및 반영되는지 콘솔에서 확인.`
        }
    };

    const activeData = contentMap[selectedMenu] || contentMap['ifpdp-purpose'];

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

                    {/* Nav Sections */}
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
                            {activeData.content}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
