import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function PmoVision() {
    const { memberInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('phase1');
    const [copied, setCopied] = useState(false);

    // Only allow '전기영' to access this page
    const isAuthorized = memberInfo?.staff_name === '전기영';

    const phase1Text = `# 이오타 CFT 플랫폼 Phase 1 기획 및 구축 완료 보고서

본 문서는 이오타 CFT 협업 플랫폼의 초기 기틀을 마련하고 안정적인 운영 환경을 수립한 Phase 1의 설계 사양과 마이그레이션 이력을 역사적 기록으로 보존하고 관리하기 위해 작성되었습니다. 본 플랫폼은 단순한 협업 툴의 차원을 넘어 이지스자산운용의 전사 메타데이터망인 IFPDP 프로젝트의 일환으로서 핵심 비히클 정보를 시계열로 영구 추적하는 자산 관제 플랫폼을 지향합니다.

이오타 CFT 플랫폼의 여정에서 Phase 1은 자산 정보 관제 및 협업 체계의 기술적 기틀을 완벽하게 다진 프레임워크 구축 단계이며, 향후 Phase 2는 이를 토대로 실질적인 비즈니스 관리와 통제 운영을 개시하는 실전 운영화 단계로 구분됩니다.

---

## 1. Phase 1 구축 배경 및 목적

* IFPDP 전사 프레임워크와의 연동: 이오타(IOTA) CFT 협업 플랫폼은 이지스자산운용의 전사 통합 자산 관제 및 의사결정 메타데이터 시스템인 IFPDP의 설계 철학에서 출발하였습니다. 전사 데이터 통합이라는 거시적 프레임워크 아래, 실제 실무 비즈니스(Deal)와 사업 관리를 유기적으로 연결하는 첫 번째 실천적 하이브리드 형태의 플랫폼으로 기능합니다.
* 비히클 정보의 시계열 관리 당위성: 운용사(AMC)에서 가장 핵심적인 자산 정보인 프로젝트별 비히클 정보(자금 조달 구조, 리파이낸싱 경과, 사업성 지표 등)는 그동안 이지스 내부의 표준 ERP 등 레거시 시스템에서도 추적 관리하기 어려웠던 극도로 세부적인 성격을 띠고 있습니다. 본 플랫폼은 이러한 데이터 공백을 해결하고 금융기관별 캐피탈 스택 추이와 사업 마일스톤 이력을 영구적으로 기록 보존하기 위해 기획되었습니다.
* 전통적인 한계: 이오타 사업단 내의 각 전문 부서(사업관리, LFC, 개발관리, 마케팅, 설계 등)가 담당하는 대형 프로젝트(예: 427 PFV 등)는 복잡도가 높고 산출물이 얽혀 있어, 부서 간 정보 비대칭성과 업무 과중, 업무 누수 현상이 반복되었습니다.
* Phase 1의 핵심 목표 (기틀 마련):
  1. 부서별로 흩어져 있던 업무 원장(할일 및 마일스톤)을 단일 수파베이스 데이터베이스 및 웹 플랫폼으로 통합하여 업무 협업툴의 기반 수립.
  2. 비히클 통합 관리, 이오타 원 427, 421 펀드 등 자산 데이터를 구축하여 이지스 사내 시스템에 없던 시계열 자금 스택 및 사업성 지표를 체계화.
  3. 부서별 주관 업무와 산출물의 상태를 가독성 높은 인터페이스로 공유하여 실시간으로 진척도를 모니터링.
  4. 실무진의 수작업 보고 체계를 전산화하고, 의결 사항 및 지연 요소의 기록 역사를 투명하게 아카이빙.

---

## 2. 플랫폼 시스템 아키텍처 및 권한 체계

Phase 1은 전사 통합망(IFPDP)과 연동하여 이지스 임직원 인증 기반의 부서별 권한 통제를 최초로 확립했습니다.

### 1) 사용자 권한 매핑 규칙
초기 플랫폼 진입 시 각 사용자의 이메일 및 직급 정보를 통해 본인의 전용 워크스페이스에 대한 접근 및 쓰기 권한을 확인합니다.
* 사업 PM 1 파트원: 권순일, 윤주형, 김제익, 류홍, 박만진, 박일훈, 이정원, 전무경
* 사업 PM 2 파트원: 강순용, 한찬호, 박석제, 박채현, 소현준, 이수정, 조영비, 한수정
* 플랫폼 어드민 및 임원진: 전기영, 이시정, 이관용, 이철승, 윤관식, 정조민, 우형석

### 2) 다중 테넌트 워크스페이스 구조
인증 세션에 따라 좌측 내비게이션 바에서 본인 소관 부서에 맞는 워크스페이스로 즉시 리다이렉팅하는 하이브리드 라우팅을 적용했습니다.

---

## 3. 핵심 비히클 정보의 시계열 자산 관리 체계

이지스 내부 레거시 시스템에 부재한 상세 비히클 금융 조달 구조 및 사업성 지표를 통합 수집하여 시간 흐름에 따라 누적 추적하는 이오타 자산 관리의 핵심 중추입니다. 본 데이터베이스는 IFPDP 전사 7대 핵심 데이터베이스 모듈의 뼈대를 실제 비즈니스에 최초로 투영한 사례입니다.

### 1) 자산 개요, 비히클 및 조직 연계 (IFPDP 모듈 1 연동)
* 프로젝트 구분 및 설정 형태인 기금(Fund), 프로젝트금융투자회사(PFV) 등의 비히클 기본 속성과 리얼에셋 그룹 내 담당 인력 배분 내역을 단일 객체 기반으로 통합 관리합니다.

### 2) 자본 스택 및 수익자 관리 (IFPDP 모듈 2 연동)
* 캐피탈 스택 (Capital Stack) 시계열 관리: 브릿지론에서 본 PF, 리파이낸싱 단계로 이어지는 자본 구조 변화를 보통주, 종류주, 주주대여금 등의 자본금(Equity) 항목과 대주단 선/후순위 대출금(Debt) 항목별로 기록하고, 참여한 금융기관별 투자 규모와 조달 금리를 추적합니다.
* 프로젝트 재무 및 사업성 지표 (Project Metrics) 이력 보존: 예상 총수입(GI), 연간 순영업소득(NOI), 목표 자본환원율(Cap Rate) 등 프로젝트 가치 산정의 기초 지표를 연도 및 분기별 시계열로 저장하여 최신화합니다.
* 기금 인출(Drawdown) 스케줄 및 집행 경과를 일자별로 추적할 수 있도록 하여 재무 위험을 예방합니다.

### 3) 10단계 가치사슬 및 시계열 트래킹 (IFPDP 모듈 3 연동)
* 마일스톤 및 히스토리 아카이브 (Project History): 토지 매입, 인허가 완료, 착공, 금융 종결, 준공 등 사업 추진에 수반되는 핵심 일정의 선후 관계를 일목요연한 역사적 시계열 기록물로 보존하여 자산 라이프사이클의 진행 단계를 역산할 수 있는 데이터를 제공합니다.

### 4) 의사결정 맥락 및 리스크 통제 (IFPDP 모듈 7 연동)
* 의사결정 로그 (DecisionLog): 론 조건 변경, 수익률 조정, 매각 시기 연기 등 재단/투자위에서 중대한 결정이 내려질 당시의 배경 사유와 정성적 판단 근거를 투명하게 기록하여 내부 통제 및 의사결정 맥락을 보존합니다.

---

## 4. 협업 워크스페이스 및 이종 데이터베이스 구축

Phase 1은 업무 특성별로 고유 스키마를 구성하여 총 6대 테이블과 이력 관리 모듈을 신설 및 주입했습니다.

### 1) 부서별 업무 관리 테이블
* iota_pm_tasks: 사업 PM 1, 2 파트의 주관 일정, 소싱 타겟, 계약 정보 관리.
* iota_financing_tasks: LFC(금융) 부서의 PF 조달, 금리 구조, 금융비, 대주단 연동 상태 관리.
* iota_development_tasks: 개발관리실의 건축인허가, 시공사 도급 계약, 준공 일정 관리.
* iota_fund_tasks 및 iota_marketing_tasks: 펀드 설정 및 임차 마케팅 원장 관리.

### 2) 주간 스냅샷 아카이빙 시스템 (iota_weekly_snapshots)
* 목적: 매주 금요일 퇴근 시점의 실무 업무 원장 상태를 스냅샷 이미지로 아카이빙하여 시계열 변천사 추적.
* 백업 정책: 수파베이스 네트워크 장애 대비를 위해 로컬 스토리지로 실시간 백업 기동.

### 3) 로그 및 회의록 입력 창 (LogWriteBox, MeetingWriteBox)
* 회의 중 실시간으로 발생한 액션 아이템을 주관 부서원에게 바로 등록 및 배정하는 에디터 인터페이스를 구축하여 협업 툴의 기틀을 완성했습니다.

---

## 5. 실무 알림 연동 및 데이터 연계

* 스마트 알림 연동: 새로운 태스크나 지연 요소가 등록되면 지정된 부서원 및 주요 의사결정권자에게 알림 메일 및 메시지를 백그라운드로 자동 발송.
* 이해관계자 마스터 관리 (iota_stakeholder_master): 각 거래 빌딩별 LP(출자자), 시행사, 자산관리 회사 연락처 및 특이사항을 통합 조회하는 VVIP 인물 데이터베이스 적재.

---

## 6. Phase 1 운영 성과 및 검증 상태

* 데이터 무결성: 로컬 엑셀의 복잡한 컬럼 130여 개를 수파베이스 데이터베이스 내 4대 마스터 테이블로 완전히 매핑하여 데이터 유실 없는 전산 마이그레이션 완수.
* 화면 구성 안정성: 모던하고 심플한 디자인 가이드를 준수하여 다크모드 대시보드를 구축했으며, 대량의 테이블 렌더링 시 브라우저 성능이 저하되지 않도록 코드 수준에서 분리 적용 완료.`;

    const phase2Text = `# 이오타 CFT 플랫폼 Phase 2: 실질적 운영화를 위한 PMO 종합 시스템 구축 계획서

본 계획서는 사업관리2파트 한찬호 PM의 업무정리 및 관리시스템 원장 자료를 바탕으로, 이오타 CFT 플랫폼을 Phase 2로 고도화하여 실제 비즈니스 운영이 가능한 환경을 구현하기 위한 상세 설계도입니다.

Phase 1에서 비히클 자산 정보의 시계열 관제 및 협업의 기초적인 기틀을 마련했다면, Phase 2는 이를 바탕으로 보안 통제, 실시간 엑셀 형태의 입력 및 수정 인터페이스, 그리고 회의체 즉시 연동 기능을 구축하여 비로소 실질적인 실무 운영을 가능하게 만드는 과정입니다.

---

## 1단계: 권한 및 보안 설계 (Dynamic Access Control)

Phase 1의 단순 조회 기능을 넘어 실질적 운영을 위해 데이터 쓰기 및 수정 권한을 직무 등급에 맞추어 격격히 통제합니다.

### 1) 멤버 정보 관리체계 개편
기존 프론트엔드의 하드코딩된 열람 제한 방식에서 탈피하여, 수파베이스 iota_members 테이블과 실시간 연동해 접근 제어를 수행합니다.
* 인증 컨텍스트 연동 (useAuth): 로그인 세션의 부서(memberInfo.department)와 직무 등급(memberInfo.role_grade)을 판독합니다.
* 접근 제어 조건:
  * 전체 쓰기 및 수정 권한 (PMO 통제권): 사업관리2파트 소속 임직원 전원 및 상위 임원진/어드민.
  * 주관 업무 편집 권한 (제한적 수정): 각 실무 부서의 파트장 및 실무자는 본인 부서가 실무 주관부서인 행만 업데이트할 수 있도록 허용.
  * 단순 읽기 권한: 일반 이오타 멤버 전체.

### 2) 데이터베이스 RLS (Row Level Security) 정책 수립
네트워크 직접 호출이나 우회를 차단하기 위해 데이터베이스 레이어에서 정책을 적용합니다.
* iota_pmo_tasks 테이블 RLS 활성화.
* 일반 읽기 정책: 인증된 모든 사용자는 읽기가 가능하도록 허용.
* PMO 편집 권한 정책: iota_members 테이블을 조회하여 해당 사용자의 부서가 사업관리2파트이거나 등급이 임원/어드민인 경우에만 입력, 수정, 삭제가 가능하도록 데이터베이스 정책 설정.

---

## 2단계: DB 스키마 구조 개편 (Database Schema Design)

실질적 운영 중 발생하는 실시간 업무 업데이트와 외부 팝업 요청을 수집, 위임, 추적하기 위해 별도의 신규 테이블 2종을 신설합니다.

### 1) iota_pmo_tasks (PMO 통합 원장 테이블)
* id: 고유 식별자 (UUID 기본값 적용)
* project_type: 프로젝트 구분 (공통, 427PFV 등)
* category_main: 대분류 (공통 PMO, 호텔/운영, 인허가 등)
* sector_detail: 세부섹터
* task_name: 업무명
* task_purpose: 업무목적 및 PF와 준공 영향
* deliverables: 필요 산출물
* target_axis: 최종 목표축 (PF, 준공/운영 등)
* gate_stage: Gate 구분 (G0 현황정리부터 G4까지)
* pmo_manager: PMO총괄 담당 (기본값 사업관리2파트)
* lead_department: 실무 주관부서
* coop_departments: 협업부서 (세미콜론으로 구분하여 저장)
* assignee: 담당자
* external_party: 외부 상대방
* support_needed: 지원 필요 사항 상세
* is_blocker: Blocker 여부 (참/거짓 구분)
* needs_decision: 의사결정 필요 여부 (참/거짓 구분)
* due_date: 기한 (날짜 형태)
* status: 상태 (미착수, 진행중, 완료, 지연)
* importance_level: 중요도 (PF필수, 준공필수, 일반)
* task_type: 업무유형 (정규, 팝업)
* next_action: 다음 액션
* priority_score: 우선순위 점수 (정수형)
* meeting_grade: 회의상정등급 (A_즉시상정, B_회의점검)
* agenda_reason: 상정사유
* sort_key: 정렬키
* notes: 비고

### 2) iota_pmo_popup_requests (팝업 및 단발성 요청 관리 테이블)
정규 업무의 침식을 예방하고 단발성 외부 요청을 접수, 위임, 반려하기 위한 관리 대장입니다.
* id: 고유 식별자 (UUID)
* request_date: 접수일 (현재 날짜)
* requester: 요청자 및 소속 부서
* project_type: 프로젝트 구분
* category_name: 카테고리
* request_detail: 요청 업무 상세
* purpose: 요청 목적
* deliverables: 필요 산출물
* due_date: 요청 기한
* assigned_department: 원 수행 부서
* coop_departments: 협업 부서
* impact_level: 정규업무 영향도 (높음, 보통, 낮음)
* handling_status: 처리 방향 (접수, 위임, 보류, 반려)
* memo: memo

---

## 3단계: PMO 전용 그리드 UI/UX 개발 (Grid Dashboard)

운영 편의성을 최우선으로 고려하여, 정보의 신속한 최신화와 시계열적 관리가 가능한 엑셀 인터페이스를 도입합니다.
* 인라인 셀 편집 (Inline Edit): 각 업무의 상태, 기한, 다음 액션, 우선순위점수 등을 별도의 수정 창을 켜지 않고 엑셀처럼 더블클릭하여 바로 즉시 변경.
* 원클릭 토글 뱃지: 병목(Blocker) 및 의사결정필요 필드는 상태를 클릭 한 번으로 토글하고 데이터베이스에 즉각 비동기로 자동 저장하여 정보 최신화 간소화.
* 부서 멀티태그 필터링: 상단의 부서 뱃지를 클릭하면 주관하는 업무와 협업하는 업무만 즉시 필터링하여 업무 부하율을 화면에 표시.

---

## 4단계: 실시간 회의 상정용 대시보드 연동 (Executive Board)

의사결정 회의체에서 모니터에 띄워놓고 바로 논의를 진행할 수 있도록 현 상황을 집계하여 대시보드로 전달합니다.
* A등급 즉시 상정 섹션: 우선순위점수가 80점 이상이거나 의사결정필요 및 Blocker 상태가 참인 핵심 현안들을 상단에 카드로 자동 정렬 노출하여 즉각 판단 지원.
* 부서별 Blocker 카운트 차트: 현재 어느 부서에서 업무 병목이 발생하고 있는지 실시간 막대 차트로 가독성 높게 표시하여 의사결정 지원.

---

## 검증 계획 (Verification Plan)

### 1) 자동화 테스트 시나리오
* 데이터 마이그레이션 스크립트 실행 후 수파베이스에 적재된 로우 수가 엑셀의 데이터 로우 수와 정확히 일치하는지 카운트 검증 테스트 진행.
* 권한이 없는 비인가 계정으로 테이블 데이터 입력 및 수정 API 호출 시 데이터베이스 수준에서 차단 및 실패 오류가 발생하는지 확인.

### 2) 수동 검증 프로세스
* 사업관리2파트에 속하지 않는 일반 부서원으로 로그인 시, 사이드바 메뉴 및 대시보드 내 관리 기능에 접근할 수 없음을 직접 눈으로 확인.
* 스프레드시트 그리드에서 병목 상태 토글 클릭 시, 정상적으로 데이터베이스에 변경 상태가 저장 및 반영되는지 콘솔에서 확인.`;

    const handleCopy = () => {
        const text = activeTab === 'phase1' ? phase1Text : phase2Text;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isAuthorized) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0B0C] min-h-[600px] text-center">
                <div className="w-16 h-16 mb-6 text-red-500 opacity-80">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">접근 권한 제한</h2>
                <p className="text-sm text-[#86868B]">
                    본 페이지는 리얼에셋그룹 전기영 부장 전용 관제 센터입니다. 승인되지 않은 계정은 접근이 불가합니다.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full flex-1 flex flex-col pt-[48px] pb-[100px] max-w-[1000px] mx-auto px-6 bg-[#0B0B0C] text-[#E5E5E5] font-sans">
            {/* Header */}
            <div className="border-b border-[#222] pb-6 mb-8 flex justify-between items-end">
                <div>
                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Executive Space</span>
                    <h1 className="text-[32px] font-bold text-white tracking-tight mt-1">IFPDP x IOTA CFT 마스터 플랜</h1>
                    <p className="text-sm text-[#86868B] mt-2">
                        이지스자산운용 전사 통합 자산 관제망 연계 이오타 CFT 기획 명세서
                    </p>
                </div>
                <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-[#222] border border-[#333] hover:bg-[#333] hover:text-white rounded-[10px] text-[13px] font-semibold transition-colors flex items-center gap-2 cursor-pointer text-[#E5E5E5]"
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            복사 완료!
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            전체 텍스트 복사
                        </>
                    )}
                </button>
            </div>

            {/* Tab Controls */}
            <div className="flex gap-4 mb-6 border-b border-[#222]">
                <button
                    onClick={() => setActiveTab('phase1')}
                    className={`pb-4 px-2 text-[15px] font-bold transition-all relative cursor-pointer ${
                        activeTab === 'phase1' ? 'text-white' : 'text-[#86868B] hover:text-white'
                    }`}
                >
                    Phase 1: 기틀 마련 및 프레임워크
                    {activeTab === 'phase1' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('phase2')}
                    className={`pb-4 px-2 text-[15px] font-bold transition-all relative cursor-pointer ${
                        activeTab === 'phase2' ? 'text-white' : 'text-[#86868B] hover:text-white'
                    }`}
                >
                    Phase 2: 실질적 운영 및 통제화
                    {activeTab === 'phase2' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full"></div>
                    )}
                </button>
            </div>

            {/* Document Content Display */}
            <div className="bg-[#141416] border border-[#222] rounded-[16px] p-8 overflow-y-auto max-h-[700px] shadow-2xl leading-relaxed whitespace-pre-wrap font-mono text-[14px] text-[#D4D4D8]">
                {activeTab === 'phase1' ? phase1Text : phase2Text}
            </div>
        </div>
    );
}
