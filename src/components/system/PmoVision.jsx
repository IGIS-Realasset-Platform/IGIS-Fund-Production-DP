import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function PmoVision() {
    const { memberInfo, loading } = useAuth();
    const [selectedMenu, setSelectedMenu] = useState('ifpdp-proposal');
    const [copied, setCopied] = useState(false);
    
    // Filtering/Search state for Requirements grid
    const [reqSearchQuery, setReqSearchQuery] = useState('');
    const [reqFilterScope, setReqFilterScope] = useState('all');

    // Only allow '전기영' to access this page
    const isAuthorized = memberInfo?.staff_name === '전기영';

    const getStaffTitle = (info) => {
        if (!info?.staff_name) return '로그인 필요';
        return `${info.staff_name} 부장`;
    };

    // Static structures parsed and compiled
    const requirementsData = [
    {
        "scope": "내부",
        "category": "그룹 정보",
        "subcategory": "사업 매출",
        "actor": "Tier 3는",
        "detail": "리얼에셋 그룹 및 조직의 매출 목표와 현재 달성 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "그룹 정보",
        "subcategory": "센터 OKR",
        "actor": "Tier 3는",
        "detail": "각 센터의 OKR 계획과 진척도 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "All 센터",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "그룹 정보",
        "subcategory": "인력 배분 정보",
        "actor": "Tier 3는",
        "detail": "각 프로젝트에 할당 된 인력 배분 정보를 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "ALL",
        "note": "-"
    },
    {
        "scope": "내부",
        "category": "소싱 정보",
        "subcategory": "입찰 접수현황",
        "actor": "Tier 2는",
        "detail": "티저로 접수되는 입찰 접수건의 정보와 수량를 파악할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "소싱 정보",
        "subcategory": "CA 검토 현황",
        "actor": "Tier 3는",
        "detail": "CA 검토되는 프로젝트의 히스토리와 현황을 파악할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "소싱 정보",
        "subcategory": "실사 현황",
        "actor": "Tier 3는",
        "detail": "프로젝트의 실사 히스토리와 현재 실사 현황을 파악할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "소싱 정보",
        "subcategory": "우협 선정",
        "actor": "Tier 3는",
        "detail": "각 부서의 프로젝트 소싱 및 우협선정 히스토리를 파악할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "투자자 정보",
        "subcategory": "투자자 통합정보",
        "actor": "Tier 3는",
        "detail": "이지스에 투자된 투자사 통합 현황 대시보드를 편리하게 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "투자자 정보",
        "subcategory": "투자자 통합정보",
        "actor": "Tier 3는",
        "detail": "개별 투자사에 대한 투자사 현황을 편리하게 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "투자자 정보",
        "subcategory": "투자자 담당자",
        "actor": "Tier 3는",
        "detail": "각 투자사의 담당자 및 키맨 정보, 및 커뮤니케이션 히스토리, 특이사항 등을 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    },
    {
        "scope": "내부",
        "category": "자산통합정보",
        "subcategory": "10단계 가치사슬",
        "actor": "Tier 3는",
        "detail": "모든 프로젝트의 10단계 가치사슬 단계 및 특이사항 현황을 한 화면의 대시보드로 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "ALL",
        "note": "-"
    },
    {
        "scope": "내부",
        "category": "자산통합정보",
        "subcategory": "프로젝트 개수",
        "actor": "Tier 3는",
        "detail": "현재 진행중인 프로젝트의 갯수를 다양한 분류방법을 통해 편리하게 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "ALL",
        "note": "-"
    },
    {
        "scope": "내부",
        "category": "자산통합정보",
        "subcategory": "설계/시공사 정보",
        "actor": "Tier 2는",
        "detail": "프로젝트별 담당 설계사, 시공사, 담당자 연락처 및 담당자별 특징을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자, 사업",
        "note": "All 센터"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "자산 통합 정보",
        "actor": "Tier 3는",
        "detail": "모든 개별 자산의 10단계 가치사슬 전체 상황 및 특이사항 현황을 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "ALL",
        "note": "-"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "소싱",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 소싱 히스토리와 현재 현황을 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자",
        "note": "CM"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "투자",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 투자(심의) 히스토리와 현재 현황을 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자",
        "note": "CM"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "브랜드",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 브랜드(컨셉,포지셔닝) 히스토리와 현재 현황을 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "공간솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "CF",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 CF 히스토리와 현재 현황을 확인할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "투자"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "Finanacing",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 Financing 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "LFC"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "PFV/펀드 운영",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 PFV/Fund 운영 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "준법,리스크.."
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "개발 공정",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 공정/인허가 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "개발솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "상품기획",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 [공간UX/Tech] 상품 기획 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "공간솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "호텔 상품 개발",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 [호텔/레지던스] 상품 개발 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "공간솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "리테일",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 [리테일] 상품 개발 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "리테일솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "마케팅",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 마케팅 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "기업마케팅"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "마케팅",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 플레이스메이킹 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "공간솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "자산 스팩",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 스팩 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "공간솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "자산 스팩",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 전력공급 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "개발솔루션"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "자산 스팩",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 관리/운영 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "관리운영",
        "note": "All 센터"
    },
    {
        "scope": "내부",
        "category": "복합/개별 자산",
        "subcategory": "세일즈",
        "actor": "Tier 2는",
        "detail": "모든 개별 자산의 세일즈(리징) 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "사업",
        "note": "기업마케팅"
    },
    {
        "scope": "내부",
        "category": "기업통합정보",
        "subcategory": "세일즈",
        "actor": "Tier 2는",
        "detail": "기업 관점에서 이지스 자산에 임차된 기업의 통합 현황을 편리하게 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "기업마케팅",
        "note": "ALL"
    },
    {
        "scope": "외부",
        "category": "시공/설계사",
        "subcategory": "도급순위 및 이슈",
        "actor": "Tier 2는",
        "detail": "시공사별 도급순위와 현재 시점에서의 시공사별 이슈, 담당자 연락처 및 담당자별 특징을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자, 사업",
        "note": "All 센터"
    },
    {
        "scope": "외부",
        "category": "기업통합정보",
        "subcategory": "기업 임차정보",
        "actor": "Tier 2는",
        "detail": "다양한 조건을 통해 기업의 오피스/데이터센터/물류 임차 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "기업마케팅",
        "note": "ALL"
    },
    {
        "scope": "외부",
        "category": "기업통합정보",
        "subcategory": "기업 임차정보",
        "actor": "Tier 2는",
        "detail": "특정 기업이 임차한 자산의 세부정보를 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "기업마케팅",
        "note": "ALL"
    },
    {
        "scope": "외부",
        "category": "기업통합정보",
        "subcategory": "유형별 기업 형태",
        "actor": "Tier 2는",
        "detail": "특정 기업유형에 따른 자산 환경 니즈를 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "기업마케팅",
        "note": "ALL"
    },
    {
        "scope": "외부",
        "category": "기업통합정보",
        "subcategory": "기업 별 니즈",
        "actor": "Tier 2는",
        "detail": "국내 Top 100 기업에 대해, 각 기업이 처한 고유한 환경과 임차 니즈를 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "기업마케팅",
        "note": "ALL"
    },
    {
        "scope": "외부",
        "category": "기업통합정보",
        "subcategory": "기업 담장자 정보",
        "actor": "Tier 2는",
        "detail": "주요 기업들의 메인컨텍포인트, 연락처, 해당 인물에 대한 현재 이슈, 특이사항 등을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "기업마케팅",
        "note": "ALL"
    },
    {
        "scope": "외부",
        "category": "복합/개별 자산",
        "subcategory": "매입/매각정보",
        "actor": "Tier 2는",
        "detail": "3대권역 주요 자산의 매입/매각 히스토리와 현재 현황을 확인 할 수 있다.",
        "main_dept": "",
        "sub_dept": "투자/사업",
        "note": "All"
    }
];
    const schemaFieldsData = [
    {
        "ui_layer": "Section 1 (최상단)",
        "attr": "① Static 프로필 (불변)",
        "field": "missionId / assetName",
        "structure": "단일 구조",
        "datatype": "String",
        "desc": "더케이트윈타워 매입 프로젝트"
    },
    {
        "ui_layer": "Section 1",
        "attr": "① Static 프로필 (불변)",
        "field": "assetClass / address",
        "structure": "단일 구조",
        "datatype": "Enum/String",
        "desc": "오피스/리테일"
    },
    {
        "ui_layer": "Section 1",
        "attr": "② Dynamic 지표 (변동)",
        "field": "aum (총 사업규모)",
        "structure": "Time-Series (시계열 배열)",
        "datatype": "Array of Objects",
        "desc": "UW, BP, 실제 연도별 사업비 변동 추이 누적"
    },
    {
        "ui_layer": "Section 1",
        "attr": "① Static 프로필 (불변)",
        "field": "director / pm",
        "structure": "단일 구조",
        "datatype": "String",
        "desc": "정영진 / 장민호"
    },
    {
        "ui_layer": "Section 1",
        "attr": "③ Context 텍스트 (RAG)",
        "field": "redFlagsStatus",
        "structure": "Log Series (로그 누적 배열)",
        "datatype": "Array of Objects",
        "desc": "시점별 리스크 발생 및 해소 내역 누적 로깅"
    },
    {
        "ui_layer": "Section 2 (상단)",
        "attr": "③ Context 텍스트 (RAG)",
        "field": "valueChainStatus",
        "structure": "단일 컨텍스트 구조",
        "datatype": "Text",
        "desc": "진척률 프로그레스 바 밑에 한 줄 설명"
    },
    {
        "ui_layer": "Section 1",
        "attr": "② Dynamic 지표 (변동)",
        "field": "irr (수익률)",
        "structure": "Time-Series (시계열 배열)",
        "datatype": "Array of Objects",
        "desc": "목표(UW), 분기별 추정 IRR, 엑시트 확정 IRR 등 궤적"
    },
    {
        "ui_layer": "Section 1",
        "attr": "② Dynamic 지표 (변동)",
        "field": "completionDate (준공일)",
        "structure": "Date Series (마일스톤 배열)",
        "datatype": "Array of Objects",
        "desc": "최초 계획일, 변경 승인일, 실제 완료일 누적"
    },
    {
        "ui_layer": "Section 1",
        "attr": "③ Context 텍스트 (RAG)",
        "field": "decisionContextLog",
        "structure": "Log Series (로그 누적 배열)",
        "datatype": "Array of Objects",
        "desc": "월간/분기별 의사결정 맥락(금리, 전략 수정) 타임라인"
    },
    {
        "ui_layer": "Section 3 (중단)",
        "attr": "② Dynamic 지표 (변동)",
        "field": "equity_loan_ratio (LTV)",
        "structure": "Time-Series (시계열 배열)",
        "datatype": "Array of Objects",
        "desc": "기표 시점 LTV, 리파이낸싱 후 LTV 추이"
    },
    {
        "ui_layer": "Section 1",
        "attr": "② Dynamic 지표 (변동)",
        "field": "occupancy (전체 임대율)",
        "structure": "Time-Series (시계열 배열)",
        "datatype": "Array of Objects",
        "desc": "분기별 전체 임대율 꺾은선 차트용 시계열"
    },
    {
        "ui_layer": "Section 1",
        "attr": "② Dynamic 지표 (변동)",
        "field": "walt (잔여 임대기간)",
        "structure": "Time-Series (시계열 배열)",
        "datatype": "Array of Objects",
        "desc": "분기/반기별 잔여 임대기간 평균 변동 폭"
    },
    {
        "ui_layer": "Section 1",
        "attr": "② Dynamic 지표 (변동)",
        "field": "closingDate (딜 클로징)",
        "structure": "Date Series (마일스톤 배열)",
        "datatype": "Array of Objects",
        "desc": "지연 히스토리 및 최종 완료 노드 관리"
    },
    {
        "ui_layer": "Section 1",
        "attr": "② Dynamic 지표 (변동)",
        "field": "pfDrawdown (기표일)",
        "structure": "Date Series (마일스톤 배열)",
        "datatype": "Array of Objects",
        "desc": "트랜치(Tranche)별 기표 내역 및 일정 관리"
    },
    {
        "ui_layer": "Section 1",
        "attr": "③ Context 텍스트 (RAG)",
        "field": "productStrategy",
        "structure": "단일 컨텍스트 구조",
        "datatype": "Text",
        "desc": "상품/브랜드 전략"
    },
    {
        "ui_layer": "Section 1",
        "attr": "③ Context 텍스트 (RAG)",
        "field": "retailTenantStrategy",
        "structure": "단일 컨텍스트 구조",
        "datatype": "Text",
        "desc": "저층 F&B 60% 우선유치 타겟팅 등"
    },
    {
        "ui_layer": "Section 4 (하단)",
        "attr": "① Static 프로필 (불변)",
        "field": "vehicle_type / name",
        "structure": "단일 구조",
        "datatype": "Enum/String",
        "desc": "이지스전문투자형 389호"
    },
    {
        "ui_layer": "Section 1",
        "attr": "① Static 프로필 (불변)",
        "field": "partners",
        "structure": "단일 구조 (혹은 Array)",
        "datatype": "Array of Strings",
        "desc": "시공/설계/파트너 연락망 배열"
    }
];
    const schemaNotesData = [
    "1. 데이터 속성 (Data Attribute)",
    "비즈니스 관점에서 이 데이터가 \"어떤 성격과 주기를 띠는가?\"를 정의",
    "데이터가 시간에 따라 변하는지, 아니면 고유한 이름으로 존재하는지를 비즈니스 로직 기준으로 세 가지로 분류.",
    "① Static 프로필 (불변): 자산의 이름, 건축 목적, 펀드명, 담당자 이름 등.",
    "② Dynamic 지표 (변동): 임대율, 수익률(IRR), 사업비(AUM), 매각가 등 운영 효율이나 시장 상황에 따라 실시간 혹은 주기적으로 숫자가 변하는 핵심 성과 지표. (대표님 C레벨 트래킹)",
    "③ Context Text (RAG): 리스크 로그, 의사결정 맥락 등 단순 숫자가 아니라 왜 그렇게 되었는지 이야기가 필요한 정성적 데이터\" 이 시스템의 핵심 고도화 요소인 RAG(검색 증강 생성) AI가 사용자 질문에 대답하기 위해 긁어가는 핵심 지식 창고 역할.",
    "2. 데이터 구조 (Data Structure)",
    "정보 설계 관점에서 이 데이터를 \"어떻게 담아둘 것인가?\"를 정의.",
    "이 데이터가 단순히 하나의 칸에만 입력되는지, 아니면 차트를 그리기 위해 층층이 쌓여야 하는지를 정의하는 '설계도(Architecture)' 개념.",
    "- 단일 구조 / 단일 컨텍스트 구조: 현재 시점의 \"딱 하나의 값\"만 가지는 1차원적 구조. (예: assetName = \"더케이트윈타워\")",
    "- Time-Series (시계열 배열): 하나의 지표(예: 평당 임대료)에 대해 \"목표는 얼마였는데, 1분기엔 얼마였고, 2분기엔 얼마였다\"를 선(Line)처럼 누적해서 그려내는 구조.",
    "- Date Series (마일스톤 배열): \"사전임대 시작 노드\"처럼 날짜 자체의 궤적(예시: 원래 8월 예정이었으나 우천 지연으로 9월 승인, 최종 10월 완료결재)을 쌓아두는 구조.",
    "- Log Series (로그 누적 배열): 카카오톡 대화방이나 회의록처럼, 특정 일자마다 발생한 리스크 메모나 의사결정 코멘트들을 차곡차곡 쌓아가는 구조.",
    "3. 데이터 타입 (Data Type)",
    "프로그래밍 관점에서 이 데이터에 \"어떤 형태의 값을 입력할 수 있는가?\"를 정의한다.",
    "프로그래머들이 실제 데이터베이스 제약 조건(Validation)을 걸 때 사용하는 원시적인(Primitive) 프로그래밍 단위.",
    "- String / Text: 평범한 글자(문자열). (예: \"정영진\", \"하층부 F&B 전략\")",
    "- Enum (선택형): 정해진 드롭다운 목록에서 선택 (예: \"커머셜, 입찰단계, 오피스\")",
    "- Number / Float: 연산(더하기, 빼기 등)이 가능한 순수 숫자나 소수점. 단위 글자인 '원', '%' 등은 숫자 뒤에 UI에서 따로 붙인다.",
    "- Date: 날짜 연산(목표일-현재일=D-day)이 가능한 표준 시각 규격만. (예: 2025-08-30)",
    "- Array (배열) / Array of Objects: 위에 설명한 Time-Series나 Log Series를 실제로 구현하기 위해, 괄호 [ ] 안에 여러 개의 덩어리(Object)들을 콤마로 무한정 집어넣을 수 있는 데이터 타입."
];
    const schemaDraftsData = [
    "보여줘야할 화면의 정리(Draft-개발자산상세) (최상위부터, DB 테이블 구성을 위함)",
    "- 이 프로젝트의 이름은 : \"이오타서울(816)\" - Static / 단일구조 / String",
    "- 비히클 : PFV (Fund/PFV)",
    "- 이 프로젝트의 리스크 우선순위는 : \"High\" - Static / 단일구조 / Enum",
    "ㄴ 다른 High 프로젝트 보기",
    "- 이 프로젝트의 섹터/주용도/사업형태는 : \"커머셜, 오피스, 개발\" - Static / 단일구조 / Enum",
    "ㄴ 각 텍스트는 클릭할 수 있으며, 클릭하면 해당 프로젝트가 리스트된 화면으로 이동한다.",
    "- 이 프로젝트의 입찰/수의 분류는 : \"입찰\" - Static / 단일구조 / Enum",
    "- 지금까지 이러이러한 이슈가 있었고, 이렇게 처리했다 : \"2026년 3월 클로징 목표로 리파이낸싱을 추진했으나 KB증권 안이 부결되어 현재는 선순위 일부는 메리츠증권, 잔여분은 NH증권이 참여하는 구조를 협의 중임\" - Context Text / Log Series / Text",
    "ㄴ 최근 주요 2~3건을 보여주고 더보기를 통해 창이 확대되며 모든 내용을 확인할 수 있다.",
    "- 이 프로젝트는 현재 10단계 가치 사슬 중 어디에 있다 : \"개발중\" - Static / 단일구조 / Enum",
    "ㄴ 클릭하면 창이 넓어지면서 프로젝트 일정 상세를 확인할 수 있다.",
    "- 예정공급년도 : 2032년",
    "- 권역 : CBD (CBD/GBD/YBD/PBD/기타)",
    "- 오피스등급 : Prime",
    "- 이 프로젝트의 연멱적은 : \"36,537평\"",
    "- 이 사업의 담당자는 이렇다 : \"조직장 000, PO 000, 담당 000\" - Static / 단일구조 / String, Text, Enum",
    "ㄴ 클릭하면 각 담당자 상세페이지로 이동한다 (담당자가 진행중인 모든 프로젝트 및 관련 내용을 망라한 담당자 상세페이지)",
    "- 이 사업의 원가는 : \"8000억(2025.03) -> 9500억(2026.04)\" - Dynamic / Date Series / Number",
    "ㄴ 클릭하면 창이 넓어지면서 원가 변화 히스토리를 확인할 수 있다.(토지비, 공사비, 금융비 및 기타)",
    "- CF",
    "- Financing",
    "- 공정/인허가",
    "- 투자구조 : \"\"",
    "- 고유 투자금은 : \"\"",
    "- 투자자 담당자는 : \"\"",
    "- 수익자 정보 :",
    "- 대주정보 :",
    "- 에쿼티 : \"780억\"",
    "- 론 : \"\"",
    "- 예상 수익률은 : \"\"",
    "- 예상 매각시점 & 매각가",
    "- 개발기간은 :",
    "- 예상 NOC (준공년 기준)",
    "- 자산 개요 : \"사진, 자산명, 소재지, 연면적, 대지면적, 규모(층), 준공일, 기준층전용면적\" - Static / 단일구조 / String, Text, Enum",
    "ㄴ 위 주요 정보만 노출하고 나머지는 더보기를 통해 창이 확대되며 모든 내용을 확인할 수 있다.",
    "- 설계사",
    "- 시공사",
    "- 공간UX 상품기획",
    "- 브랜드 : IOTA (컨셉, 포지셔닝, 계획 등)",
    "- 마케팅(+플레이스메이킹)",
    "- 기업파트너십(SI)",
    "- 리징",
    "- 자료실 : 티저, IM, 심의보고서, 실사보고서, 등",
    "- 리테일",
    "- 전력공급",
    "- 상세스팩",
    "- 이 프로젝트의 자금조달 계획은 : \"PFV는 브릿지론 후순위 대여 700억원(All-in 10.0%)에 대해 소노인터내셔널 확약을 확보했고, 힐튼 재개발사업과 통합 프로젝트 리츠를 설립한 후 통합 PF를 조달해 전반적인 사업구조를 안정화하는 방안도 함께 검토 중임\" - Context Text / Log Series / String, Text",
    "- 이 프로젝트의 펀딩 현황 : \"ㅇㅇㅇㅇ\" - Context Text / Log Series / String, Text",
    "ㄴ 클릭하면 입찰중 프로젝트 리스트로 이동한다.",
    "- 매입 보수는 : \"40억\"",
    "- 펀드 설정일/만기일 :",
    "- 관리 후보자는 : \"사업 : 000 / 관리 : 000\"",
    "- 이 프로젝트의 소싱 컨텍포인트는 : \"CBRE, CW\" - Static / 단일구조 / String, Text, Enum",
    "ㄴ 각 텍스트를 클릭하면 해당 컨텍포인트사(매각자문사)의 상세페이지로 이동한다."
];

    // Sidebar structure
    const navigationStructure = [
        {
            title: 'IFPDP 시스템 기획',
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

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Filter requirements
    const filteredReqs = requirementsData.filter(r => {
        const matchesSearch = r.detail.toLowerCase().includes(reqSearchQuery.toLowerCase()) || 
                              r.category.toLowerCase().includes(reqSearchQuery.toLowerCase()) || 
                              r.subcategory.toLowerCase().includes(reqSearchQuery.toLowerCase()) ||
                              r.actor.toLowerCase().includes(reqSearchQuery.toLowerCase());
        const matchesScope = reqFilterScope === 'all' || r.scope === reqFilterScope;
        return matchesSearch && matchesScope;
    });

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
                {/* 1. IFPDP - 시스템 기획안 */}
                {selectedMenu === 'ifpdp-proposal' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IFPDP</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">시스템 기획안 (원본 반영)</span>
                            </div>
                            <button onClick={() => handleCopyText(`
 | IFPDP 시스템 기획안


1. 플랫폼 기획 의도 및 목적

부서 간 데이터 통합 및 의사결정 지원 
현재 자산운용 과정에서 부서별(소싱, 투자, 개발, 운영 등)로 분산된 데이터와 문서(엑셀, PDF 등)를 중앙화한다. 
IFPDP는 각 부서의 정량적 데이터와 정성적인 의사결정 이력(Context Graph)을 통합하여 정보 취합에 소요되는 지연 시간을 없애고 정확한 의사결정을 지원하는 전사(Enterprise) 통합 시스템을 지향한다.

3-Pane 하이브리드 UX 도입
단순 텍스트 챗봇의 시각적 한계를 극복하기 위해, '고정형 데이터 대시보드'와 '대화형 AI 보조 패널'을 결합한 3분할(3-Pane) 인터페이스를 도입했다. 
좌측 내비게이션으로 시스템을 탐색하고, 중앙 대시보드에서 주요 정보(데이터 차트, 문서 등)를 확인하며, 우측 패널의 AI를 통해 즉각적인 데이터 요약 및 조작을 지시하는 직관적인 워크플로우를 제공한다.



2. SSOT (Single Source of Truth) 코어 시스템 아키텍처

자산 객체 기반의 그룹 데이터 통합 (SSOT의 확장)
플랫폼의 기능 요구사항을 각각 별도의 메뉴와 테이블로 파편화하여 개발하지 않는다. 플랫폼의 근간 원자(Atom) 단위인 [개별 자산 상세 객체]를 단일 진실 공급원(SSOT)으로 둔다.

개별 자산 객체에 입력되는 기초 데이터(AUM, 일정, 수익률, 담당자 등)가 완벽하게 통제될 경우, "그룹 거시 지표(센터별 매출, OKR 등)" 및 "투자자(LP) 종합 뷰"는 시스템이 개별 자산들을 취합(Aggregation)하여 자동 산출하는 구조다. 
즉, 자산의 10대 가치사슬, 기업 임차 정보, 파이낸싱 등 미시적 정보들이 모여 전사 관점의 거시적 대시보드를 렌더링하는 완벽한 정합성을 보장한다.



3. IFPDP 통합 플랫폼 7대 핵심 데이터베이스(DB) 모듈
파이프라인 실무 시트, 기능 요구사항 명세서 및 종합 자산운용사의 필수 컴플라이언스(Compliance) 요건을 모두 망라하여 구조화한 7대 데이터 모듈

① 자산 개요, 비히클 및 조직 (Core Identity & Vehicle)
자산 기본 구조: 자산/프로젝트명, 주요 용도(상업용, 물류, 주거, 코리빙, 복합 등), 대지/연면적 정보.
비히클(Vehicle) 통제: 설정 형태(Fund, PFV, REITs, SPC), 펀드 호수명(Ex. 468-2호).
조직 및 인력 배분: 의사결정권자(Director), 책임(PD), 실무 담당(PM) 지정 내역 및 리얼에셋 그룹 내 인력 배분 현황.

② 자본 스택 및 수익자(LP) 관리 (Capital & LP Reporting)
파이낸싱 구조(LFC): 에쿼티/론 총액, 조달 트랜치별 금리(선순위/중순위/후순위), LTV, 리파이낸싱 스케줄.
현금흐름(CF) 및 펀드 분배: 누적 배당 현황, 예상 vs 실제 매입가/평가액 비교, 캐피탈 콜(Capital Call) 일정, 수익자 워터폴(Waterfall) 결산.
투자자(LP) 통합 연계: 기관 유형 및 투자 성향별 LP 분류, 매각/매입 주관사(SI, PB 등) 컨택 이력, 이지스 예상 수취 보수(매입/운용/매각 보수).

③ 10단계 가치사슬 및 시계열 트래킹 (Value Chain & Time-Series)
소싱 파이프라인: 딜 티저 접수 이력, CA 검토, 실사, 우선협상자 선정에 이르는 모든 소싱 히스토리.
전체 생애주기 일정 (시계열 캘린더링): 매입(투자)일, PF 인출일, 착공일, 준공일, 대출 만기(연장)일, 펀드 만기일 및 예상 엑시트(매각) 완료 일정 등 타임라인 데이터베이스화.

④ 개발 상품 기획 및 ESG 전략 (Product, Construction & ESG)
투자/개발 전략: Core, Value-added, Opportunistic 등 전략 분류. 부실 자산(NPL) 정상화 플랜 유무. 단일 건축안 vs 인접 부지 통합 개발안 등 복수 시나리오 타당성 비교 데이터.
하드 코스트 및 인허가: 증축, 리모델링, 철거, 관할청 사업 인허가 상황, 전력 공급 및 주요 설비(건축, 구조, 공조, 통신) 스펙.
설계 및 시공 파트너: 시공사 도급 순위, 설계사 기본 정보 및 사업 이력 현황.
공간 기획 및 ESG: 프롭테크(Space UX/Tech) 도입 현황, 친환경 설계(LEED, GRESB 등 인증), 에너지 효율화 지표.

⑤ 실물 운영 및 임차인 네트워크 (Asset Ops & Corporate Leasing)
임대차 및 수익률 방어: 오피스 및 리테일 MD 앵커 테넌트 입점 이력, 임대율(Occupancy), 가중평균 잔여 임대기간(WALT) 방어율, 자본적 지출(CAPEX) 내역.
FM/PM 관리: 주요 하자 보수 이력 플랫폼 연동.
임차 기업 니즈(Needs) 타겟팅: 국내 Top 100 기업별 특수 임차 조건(산업 유형별 선호 면적 및 위치) 트래킹 및 당사 보유/신규 자산과의 매칭 가능성 분석 데이터.

⑥ 거시 지표 및 부서별 성과 관리 (Macro OKR & Market)
그룹 전사 목표(OKR): 펀드 수익 및 수수료 기반의 전사 매출 달성률 현황, 하부 부서별(본부 센터) 진척도 자동 추적.
외부 마켓 인텔리전스: 주요 대형 임차인의 이탈/이동 시장 동향, 대형 시공사의 외부 재무 리스크 이슈 타임라인 모니터링.

⑦ 의사결정 맥락 엔진 및 리스크 통제 (Context Graph & Compliance)
레드 플래그(Red Flags) 우선순위: 준공 지연, 대규모 공실 우려, 재융자 불가 등 딜 브레이커 요소를 심각도(Red/Yellow/Green) 기준으로 시각화 및 알림 표출.
의사결정 이력 (Context Graph): 론 조건 변경, 수익률 하향 조정, 매각 시기 연기 등 재단/투자위에서 중대한 결정이 내려질 당시의 배경 사유와 정성적 판단 근거 기록.
내부 통제(Compliance): 자산운용사 필수 법적 준수 요건, 이해상충 방지, 특정 문서 제출 기한 및 위원회 결재 로그 아카이빙.



4. 시스템 설계 구현 타당성

초기 프론트엔드 플랫폼 개발 관점에서의 작동 타당성 및 구현 전략은 아래와 같다.

1. 상세 자산 단위의 시나리오 구현: 7대 DB 모듈에 담길 수많은 전사 데이터를 후방에서 일시 구축하는 것은 현실적으로 불가능하다. 
따라서 프론트엔드 단계에서는 1~2개 핵심 자산(예: 더케이트윈타워)에 대한 기능적 흐름(Golden Path)만을 하드코딩된 API 모크업(Mock-up) 단위로 시각화하여 플랫폼의 거대 커버리지를 입증한다.

2. 모듈형 아키텍처 (패널 간 분리 기능): 시각 리소스를 압도적으로 요구하는 중앙 메인 대시보드(시스템 데이터 화면)와 상황 인식 연산이 필요한 대화형 AI 패널 영역을 코드 레벨에서 상호 격리(Decoupling)한다. 
이를 통해 각 모듈(1~7번)의 데이터 패시징 및 기능 확장을 상호 충돌이나 성능 저하 없이 구현할 수 있다.



`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 텍스트 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[900px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-widest uppercase">Planning Document</span>
                                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-tight mt-1">IFPDP 시스템 기획안</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">전사 통합 자산 관제 및 의사결정 지원 메타데이터 시스템</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                {/* Section 1 */}
                                <div className="bg-[#141416] border border-[#1C1C1E] rounded-2xl p-8 shadow-xl flex flex-col gap-6">
                                    <h2 className="text-[20px] font-bold text-white flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                        1. 플랫폼 기획 의도 및 목적
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl p-6 flex flex-col gap-3">
                                            <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                                                <span>📊</span> 부서 간 데이터 통합 및 의사결정 지원
                                            </h3>
                                            <p className="text-[14px] text-[#A1A1AA] leading-relaxed">
                                                소싱, 투자, 개발, 운영 등 부서별로 분산된 자산운용 과정의 정량 데이터와 의사결정 이력(Context Graph)을 중앙화하여 실시간 정합성을 확보하고 정보 지연을 차단합니다.
                                            </p>
                                        </div>
                                        <div className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl p-6 flex flex-col gap-3">
                                            <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                                                <span>📱</span> 3-Pane 하이브리드 UX 도입
                                            </h3>
                                            <p className="text-[14px] text-[#A1A1AA] leading-relaxed">
                                                텍스트 챗봇의 단점을 극복하는 [좌측 탐색, 중앙 대시보드 관제, 우측 AI 패널 데이터 조작]의 3분할 인터페이스로 최상의 사용성과 직관적 워크플로우를 제공합니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2 */}
                                <div className="bg-[#141416] border border-[#1C1C1E] rounded-2xl p-8 shadow-xl flex flex-col gap-6">
                                    <h2 className="text-[20px] font-bold text-white flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                        2. SSOT 코어 시스템 아키텍처
                                    </h2>
                                    <div className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl p-6 flex flex-col gap-4">
                                        <h3 className="text-[16px] font-bold text-white">자산 객체 기반의 그룹 데이터 통합 (SSOT의 확장)</h3>
                                        <p className="text-[14px] text-[#A1A1AA] leading-relaxed">
                                            플랫폼의 기능 요구사항을 각각 별도의 메뉴와 테이블로 파편화하여 개발하지 않고, 근간 원자 단위인 <b>[개별 자산 상세 객체]</b>를 단일 진실 공급원(SSOT)으로 둡니다.<br/>
                                            기초 데이터가 완벽하게 통제될 경우, 그룹 거시 지표(센터별 매출, OKR 등) 및 투자자(LP) 종합 뷰는 시스템이 실시간으로 개별 자산들을 취합(Aggregation)하여 자동 산출 및 렌더링을 보장합니다.
                                        </p>
                                    </div>
                                </div>

                                {/* Section 3 */}
                                <div className="bg-[#141416] border border-[#1C1C1E] rounded-2xl p-8 shadow-xl flex flex-col gap-6">
                                    <h2 className="text-[20px] font-bold text-white flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                        3. IFPDP 통합 플랫폼 7대 핵심 데이터베이스 모듈
                                    </h2>
                                    <p className="text-[14px] text-[#86868B] -mt-2">실무 파이프라인 시트 및 운용사 필수 컴플라이언스를 망라해 설계된 7대 원자 데이터 뼈대</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { icon: '🏢', title: '① 자산 개요, 비히클 및 조직', desc: '자산명, 주요 용도, 대지/연면적 정보 및 REITs/Fund/PFV 비히클 설정 형태, 리얼에셋 그룹 내 인력 배분 현황.' },
                                            { icon: '💳', title: '② 자본 스택 및 수익자(LP) 관리', desc: '선/중/후순위 트랜치별 조달 금리, 캐피탈 콜 일정, 예상 운용 및 매각 보수, 수익자 워터폴 결산 연계.' },
                                            { icon: '📅', title: '③ 10단계 가치사슬 및 시계열 트래킹', desc: 'CA 검토, 실사, 매입일, 준공일, 펀드 설정 및 만기일 등 전 주기 일정을 시계열 타임라인 데이터베이스화.' },
                                            { icon: '🏗️', title: '④ 개발 상품 기획 및 ESG 전략', desc: 'NPL 정상화 전략, 증축/리모델링, 관할청 사업 인허가, 평당 하드코스트, 설계/시공 파트너 및 LEED/GRESB 인증.' },
                                            { icon: '🔑', title: '⑤ 실물 운영 및 임차인 네트워크', desc: '임대율, WALT 방어율, CAPEX 내역 및 국내 Top 100 기업별 임차 니즈 트래킹을 통한 당사 자산 매칭 가능성 분석.' },
                                            { icon: '📊', title: '⑥ 거시 지표 및 부서별 성과 OKR', desc: '수수료 기반 전사 매출 달성률 추적 및 앵커 임차인 이전 등 외부 마켓 인텔리전스 재무 리스크 타임라인.' },
                                            { icon: '🛡️', title: '⑦ 의사결정 맥락 엔진 및 리스크 통제', desc: '준공 지연 및 공실 리스크 등의 레드 플래그 시각화, 투자위 의사결정 사유 기록, 자산운용 컴플라이언스 이력.' }
                                        ].map((mod, mIdx) => (
                                            <div key={mIdx} className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl p-5 flex gap-4">
                                                <span className="text-[24px] select-none">{mod.icon}</span>
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-[14px] font-bold text-white">{mod.title}</h4>
                                                    <p className="text-[12px] text-[#A1A1AA] leading-relaxed">{mod.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 4 */}
                                <div className="bg-[#141416] border border-[#1C1C1E] rounded-2xl p-8 shadow-xl flex flex-col gap-6">
                                    <h2 className="text-[20px] font-bold text-white flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                        4. 시스템 설계 구현 타당성
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl p-5 flex flex-col gap-2">
                                            <span className="text-[12px] font-bold text-blue-400">구현 전략 01</span>
                                            <h4 className="text-[14.5px] font-bold text-white">상세 자산 단위의 시나리오 구현</h4>
                                            <p className="text-[12.5px] text-[#A1A1AA] leading-relaxed">
                                                수많은 데이터를 일괄 구축하는 대신, 핵심 자산(예: 더케이트윈타워)의 소싱부터 준공까지의 흐름을 API 모크업 형태로 시범 구현하여 활용성을 선 증명합니다.
                                            </p>
                                        </div>
                                        <div className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl p-5 flex flex-col gap-2">
                                            <span className="text-[12px] font-bold text-blue-400">구현 전략 02</span>
                                            <h4 className="text-[14.5px] font-bold text-white">모듈형 아키텍처 및 패널 디커플링</h4>
                                            <p className="text-[12.5px] text-[#A1A1AA] leading-relaxed">
                                                중앙 메인 대시보드(데이터 렌더링)와 상황 인식 연산이 수반되는 우측 대화형 AI 패널 영역의 결합도를 낮추어 충돌 및 부하 없이 유연한 기능 확장을 보장합니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. IFPDP - 기능요구사항 (Interactive Searchable Table) */}
                {selectedMenu === 'ifpdp-requirements' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IFPDP</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">기능요구사항 명세</span>
                            </div>
                            <button onClick={() => handleCopyText(requirementsData.map(r => `${r.scope} | ${r.category} | ${r.subcategory} | ${r.actor} | ${r.detail}`).join('\n'))} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '명세서 텍스트 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 flex flex-col overflow-hidden p-8 gap-6">
                            {/* Filter Bar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#141416] border border-[#1C1C1E] p-4 rounded-2xl shrink-0 shadow-lg">
                                <div className="flex gap-2">
                                    {['all', '내부', '외부'].map(sc => (
                                        <button
                                            key={sc}
                                            onClick={() => setReqFilterScope(sc)}
                                            className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer border ${
                                                reqFilterScope === sc 
                                                    ? 'bg-blue-500/10 border-blue-500 text-blue-400' 
                                                    : 'bg-[#1A1A1C] border-[#2C2C2E] text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {sc === 'all' ? '전체 보기' : sc}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-full md:w-[350px] relative">
                                    <input 
                                        type="text" 
                                        placeholder="요구사항 키워드 검색..." 
                                        value={reqSearchQuery}
                                        onChange={(e) => setReqSearchQuery(e.target.value)}
                                        className="w-full bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl px-4 py-2 text-white text-[13px] outline-none focus:border-blue-500 transition-all placeholder-gray-600"
                                    />
                                    {reqSearchQuery && (
                                        <button onClick={() => setReqSearchQuery('')} className="absolute right-3 top-2.5 text-gray-500 hover:text-white cursor-pointer text-[12px]">✕</button>
                                    )}
                                </div>
                            </div>

                            {/* Requirements Grid Table */}
                            <div className="flex-1 border border-[#1C1C1E] bg-[#0A0A0C] rounded-2xl overflow-hidden flex flex-col shadow-2xl min-h-0">
                                <div className="w-full overflow-x-auto overflow-y-auto flex-1 hide-scrollbar">
                                    <table className="w-full border-collapse text-[13px]">
                                        <thead className="bg-[#141416] text-[#86868B] font-semibold sticky top-0 z-10 border-b border-[#1C1C1E] select-none text-left">
                                            <tr>
                                                <th className="px-5 py-4 w-[80px]">구분</th>
                                                <th className="px-5 py-4 w-[120px]">대분류</th>
                                                <th className="px-5 py-4 w-[120px]">세부분류</th>
                                                <th className="px-5 py-4 w-[90px]">엑터</th>
                                                <th className="px-5 py-4">기능상세</th>
                                                <th className="px-5 py-4 w-[100px]">주관부서</th>
                                                <th className="px-5 py-4 w-[150px]">비고</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#1C1C1E] text-gray-300">
                                            {filteredReqs.length > 0 ? (
                                                filteredReqs.map((req, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-5 py-3.5">
                                                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                                req.scope === '내부' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                            }`}>{req.scope}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 font-medium text-white">{req.category}</td>
                                                        <td className="px-5 py-3.5 text-gray-400">{req.subcategory}</td>
                                                        <td className="px-5 py-3.5 text-gray-400">{req.actor}</td>
                                                        <td className="px-5 py-3.5 text-gray-300 whitespace-normal leading-relaxed">{req.detail}</td>
                                                        <td className="px-5 py-3.5 text-blue-400 font-medium">{req.main_dept}</td>
                                                        <td className="px-5 py-3.5 text-[11.5px] text-gray-500 whitespace-normal">{req.note || '-'}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-20 text-[#86868B]">검색 결과에 부합하는 요구사항이 없습니다.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-[#141416] px-5 py-3 border-t border-[#1C1C1E] text-[12px] text-[#86868B] font-medium flex justify-between select-none">
                                    <span>총 요구사항 개수: {requirementsData.length}개</span>
                                    <span>필터링 및 검색된 요구사항: {filteredReqs.length}개</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. IFPDP - DB Schema (Beautiful mapping and code view) */}
                {selectedMenu === 'ifpdp-schema' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IFPDP</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">Asset Data Schema v2.0 (원본)</span>
                            </div>
                            <button onClick={() => handleCopyText(` | IFPDP Asset Data Schema v2.0 (다중 필드/시계열 반영)
 | 화면영역 (UI 계층) | 데이터 속성  | DB 필드명 | 데이터 구조  | 데이터 타입 | 설명 및 화면 맵핑 예제
 | Section 1 (최상단) | ① Static 프로필 (불변) | missionId / assetName | 단일 구조 | String | 더케이트윈타워 매입 프로젝트
 |  | ① Static 프로필 (불변) | assetClass / address | 단일 구조 | Enum/String | 오피스/리테일
 |  | ② Dynamic 지표 (변동) | aum (총 사업규모) | Time-Series (시계열 배열) | Array of Objects | UW, BP, 실제 연도별 사업비 변동 추이 누적
 |  | ① Static 프로필 (불변) | director / pm | 단일 구조 | String | 정영진 / 장민호
 |  | ③ Context 텍스트 (RAG) | redFlagsStatus | Log Series (로그 누적 배열) | Array of Objects | 시점별 리스크 발생 및 해소 내역 누적 로깅
 | Section 2 (상단) | ③ Context 텍스트 (RAG) | valueChainStatus | 단일 컨텍스트 구조 | Text | 진척률 프로그레스 바 밑에 한 줄 설명
 |  | ② Dynamic 지표 (변동) | irr (수익률) | Time-Series (시계열 배열) | Array of Objects | 목표(UW), 분기별 추정 IRR, 엑시트 확정 IRR 등 궤적
 |  | ② Dynamic 지표 (변동) | completionDate (준공일) | Date Series (마일스톤 배열) | Array of Objects | 최초 계획일, 변경 승인일, 실제 완료일 누적
 |  | ③ Context 텍스트 (RAG) | decisionContextLog | Log Series (로그 누적 배열) | Array of Objects | 월간/분기별 의사결정 맥락(금리, 전략 수정) 타임라인
 | Section 3 (중단) | ② Dynamic 지표 (변동) | equity_loan_ratio (LTV) | Time-Series (시계열 배열) | Array of Objects | 기표 시점 LTV, 리파이낸싱 후 LTV 추이
 |  | ② Dynamic 지표 (변동) | occupancy (전체 임대율) | Time-Series (시계열 배열) | Array of Objects | 분기별 전체 임대율 꺾은선 차트용 시계열
 |  | ② Dynamic 지표 (변동) | walt (잔여 임대기간) | Time-Series (시계열 배열) | Array of Objects | 분기/반기별 잔여 임대기간 평균 변동 폭
 |  | ② Dynamic 지표 (변동) | closingDate (딜 클로징) | Date Series (마일스톤 배열) | Array of Objects | 지연 히스토리 및 최종 완료 노드 관리
 |  | ② Dynamic 지표 (변동) | pfDrawdown (기표일) | Date Series (마일스톤 배열) | Array of Objects | 트랜치(Tranche)별 기표 내역 및 일정 관리
 |  | ③ Context 텍스트 (RAG) | productStrategy | 단일 컨텍스트 구조 | Text | 상품/브랜드 전략
 |  | ③ Context 텍스트 (RAG) | retailTenantStrategy | 단일 컨텍스트 구조 | Text | 저층 F&B 60% 우선유치 타겟팅 등
 | Section 4 (하단) | ① Static 프로필 (불변) | vehicle_type / name | 단일 구조 | Enum/String | 이지스전문투자형 389호
 |  | ① Static 프로필 (불변) | partners | 단일 구조 (혹은 Array) | Array of Strings | 시공/설계/파트너 연락망 배열

 | 1. 데이터 속성 (Data Attribute)
비즈니스 관점에서 이 데이터가 "어떤 성격과 주기를 띠는가?"를 정의
데이터가 시간에 따라 변하는지, 아니면 고유한 이름으로 존재하는지를 비즈니스 로직 기준으로 세 가지로 분류.

① Static 프로필 (불변): 자산의 이름, 건축 목적, 펀드명, 담당자 이름 등.
② Dynamic 지표 (변동): 임대율, 수익률(IRR), 사업비(AUM), 매각가 등 운영 효율이나 시장 상황에 따라 실시간 혹은 주기적으로 숫자가 변하는 핵심 성과 지표. (대표님 C레벨 트래킹)
③ Context Text (RAG): 리스크 로그, 의사결정 맥락 등 단순 숫자가 아니라 왜 그렇게 되었는지 이야기가 필요한 정성적 데이터" 이 시스템의 핵심 고도화 요소인 RAG(검색 증강 생성) AI가 사용자 질문에 대답하기 위해 긁어가는 핵심 지식 창고 역할.


2. 데이터 구조 (Data Structure)
정보 설계 관점에서 이 데이터를 "어떻게 담아둘 것인가?"를 정의.
이 데이터가 단순히 하나의 칸에만 입력되는지, 아니면 차트를 그리기 위해 층층이 쌓여야 하는지를 정의하는 '설계도(Architecture)' 개념.

- 단일 구조 / 단일 컨텍스트 구조: 현재 시점의 "딱 하나의 값"만 가지는 1차원적 구조. (예: assetName = "더케이트윈타워")
- Time-Series (시계열 배열): 하나의 지표(예: 평당 임대료)에 대해 "목표는 얼마였는데, 1분기엔 얼마였고, 2분기엔 얼마였다"를 선(Line)처럼 누적해서 그려내는 구조.
- Date Series (마일스톤 배열): "사전임대 시작 노드"처럼 날짜 자체의 궤적(예시: 원래 8월 예정이었으나 우천 지연으로 9월 승인, 최종 10월 완료결재)을 쌓아두는 구조.
- Log Series (로그 누적 배열): 카카오톡 대화방이나 회의록처럼, 특정 일자마다 발생한 리스크 메모나 의사결정 코멘트들을 차곡차곡 쌓아가는 구조.


3. 데이터 타입 (Data Type)
프로그래밍 관점에서 이 데이터에 "어떤 형태의 값을 입력할 수 있는가?"를 정의한다.
프로그래머들이 실제 데이터베이스 제약 조건(Validation)을 걸 때 사용하는 원시적인(Primitive) 프로그래밍 단위.

- String / Text: 평범한 글자(문자열). (예: "정영진", "하층부 F&B 전략")
- Enum (선택형): 정해진 드롭다운 목록에서 선택 (예: "커머셜, 입찰단계, 오피스")
- Number / Float: 연산(더하기, 빼기 등)이 가능한 순수 숫자나 소수점. 단위 글자인 '원', '%' 등은 숫자 뒤에 UI에서 따로 붙인다.
- Date: 날짜 연산(목표일-현재일=D-day)이 가능한 표준 시각 규격만. (예: 2025-08-30)
- Array (배열) / Array of Objects: 위에 설명한 Time-Series나 Log Series를 실제로 구현하기 위해, 괄호 [ ] 안에 여러 개의 덩어리(Object)들을 콤마로 무한정 집어넣을 수 있는 데이터 타입.

 | 보여줘야할 화면의 정리(Draft-개발자산상세) (최상위부터, DB 테이블 구성을 위함)
- 이 프로젝트의 이름은 : "이오타서울(816)" - Static / 단일구조 / String
- 비히클 : PFV (Fund/PFV)
- 이 프로젝트의 리스크 우선순위는 : "High" - Static / 단일구조 / Enum
  ㄴ 다른 High 프로젝트 보기
- 이 프로젝트의 섹터/주용도/사업형태는 : "커머셜, 오피스, 개발" - Static / 단일구조 / Enum
  ㄴ 각 텍스트는 클릭할 수 있으며, 클릭하면 해당 프로젝트가 리스트된 화면으로 이동한다. 
- 이 프로젝트의 입찰/수의 분류는 : "입찰" - Static / 단일구조 / Enum
- 지금까지 이러이러한 이슈가 있었고, 이렇게 처리했다 : "2026년 3월 클로징 목표로 리파이낸싱을 추진했으나 KB증권 안이 부결되어 현재는 선순위 일부는 메리츠증권, 잔여분은 NH증권이 참여하는 구조를 협의 중임" - Context Text / Log Series / Text
  ㄴ 최근 주요 2~3건을 보여주고 더보기를 통해 창이 확대되며 모든 내용을 확인할 수 있다. 
- 이 프로젝트는 현재 10단계 가치 사슬 중 어디에 있다 : "개발중" - Static / 단일구조 / Enum
  ㄴ 클릭하면 창이 넓어지면서 프로젝트 일정 상세를 확인할 수 있다.
- 예정공급년도 : 2032년
- 권역 : CBD (CBD/GBD/YBD/PBD/기타)
- 오피스등급 : Prime
- 이 프로젝트의 연멱적은 : "36,537평"
- 이 사업의 담당자는 이렇다 : "조직장 000, PO 000, 담당 000" - Static / 단일구조 / String, Text, Enum
  ㄴ 클릭하면 각 담당자 상세페이지로 이동한다 (담당자가 진행중인 모든 프로젝트 및 관련 내용을 망라한 담당자 상세페이지)
- 이 사업의 원가는 : "8000억(2025.03) -> 9500억(2026.04)" - Dynamic / Date Series / Number
  ㄴ 클릭하면 창이 넓어지면서 원가 변화 히스토리를 확인할 수 있다.(토지비, 공사비, 금융비 및 기타) 
- CF
- Financing
- 공정/인허가
- 투자구조 : ""
- 고유 투자금은 : ""
- 투자자 담당자는 : ""
- 수익자 정보 : 
- 대주정보 : 
- 에쿼티 : "780억"
- 론 : ""
- 예상 수익률은 : ""
- 예상 매각시점 & 매각가
- 개발기간은 : 
- 예상 NOC (준공년 기준) 
- 자산 개요 : "사진, 자산명, 소재지, 연면적, 대지면적, 규모(층), 준공일, 기준층전용면적" - Static / 단일구조 / String, Text, Enum
  ㄴ 위 주요 정보만 노출하고 나머지는 더보기를 통해 창이 확대되며 모든 내용을 확인할 수 있다. 
- 설계사
- 시공사
- 공간UX 상품기획
- 브랜드 : IOTA (컨셉, 포지셔닝, 계획 등)
- 마케팅(+플레이스메이킹)
- 기업파트너십(SI)
- 리징 

- 자료실 : 티저, IM, 심의보고서, 실사보고서, 등
- 리테일
- 전력공급
- 상세스팩


- 이 프로젝트의 자금조달 계획은 : "PFV는 브릿지론 후순위 대여 700억원(All-in 10.0%)에 대해 소노인터내셔널 확약을 확보했고, 힐튼 재개발사업과 통합 프로젝트 리츠를 설립한 후 통합 PF를 조달해 전반적인 사업구조를 안정화하는 방안도 함께 검토 중임" - Context Text / Log Series / String, Text
- 이 프로젝트의 펀딩 현황 : "ㅇㅇㅇㅇ" - Context Text / Log Series / String, Text
  ㄴ 클릭하면 입찰중 프로젝트 리스트로 이동한다. 
- 매입 보수는 : "40억"
- 펀드 설정일/만기일 : 
- 관리 후보자는 : "사업 : 000 / 관리 : 000"
- 이 프로젝트의 소싱 컨텍포인트는 : "CBRE, CW" - Static / 단일구조 / String, Text, Enum
  ㄴ 각 텍스트를 클릭하면 해당 컨텍포인트사(매각자문사)의 상세페이지로 이동한다. 
`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 스키마 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[900px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Database Schema</span>
                                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-1">IFPDP Asset Data Schema</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">화면 영역 및 UI 계층별 메타데이터 속성 맵핑 구조 정의</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                {/* Interactive Schema Fields Grid */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-[18px] font-bold text-white">1. UI 계층별 DB 필드 정의 및 맵핑</h3>
                                    <div className="border border-[#1C1C1E] rounded-2xl overflow-hidden bg-[#0A0A0C] shadow-lg">
                                        <table className="w-full border-collapse text-[13px] text-left">
                                            <thead className="bg-[#141416] text-[#86868B] font-semibold border-b border-[#1C1C1E]">
                                                <tr>
                                                    <th className="px-5 py-3 w-[150px]">화면 영역</th>
                                                    <th className="px-5 py-3 w-[140px]">데이터 속성</th>
                                                    <th className="px-5 py-3 w-[180px] font-mono">DB 필드명</th>
                                                    <th className="px-5 py-3 w-[110px]">데이터 구조</th>
                                                    <th className="px-5 py-3 w-[110px] font-mono">데이터 타입</th>
                                                    <th className="px-5 py-3">설명 및 화면 맵핑 예제</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#1C1C1E] text-gray-300">
                                                {schemaFieldsData.map((f, idx) => (
                                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-5 py-3 font-medium text-white text-[12.5px]">{f.ui_layer}</td>
                                                        <td className="px-5 py-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1C1C1E] border border-[#2C2C2E] text-gray-400">{f.attr}</span></td>
                                                        <td className="px-5 py-3 font-mono text-blue-400 font-medium">{f.field}</td>
                                                        <td className="px-5 py-3 text-[#A1A1AA] text-[12.5px]">{f.structure}</td>
                                                        <td className="px-5 py-3 font-mono text-[12px] text-purple-400 font-semibold">{f.datatype}</td>
                                                        <td className="px-5 py-3 text-[12.5px] text-gray-300 whitespace-normal leading-relaxed">{f.desc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mapping Draft section */}
                                <div className="bg-[#141416] border border-[#1C1C1E] rounded-2xl p-8 shadow-xl flex flex-col gap-6">
                                    <h3 className="text-[18px] font-bold text-white flex items-center gap-3">
                                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                                        2. 보여줘야할 화면의 정리 (Draft - 개발자산상세 예시)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {schemaDraftsData.map((draft, idx) => {
                                            const cleanText = draft.replace(/^-/, '').trim();
                                            const parts = cleanText.split(":");
                                            const label = parts[0]?.trim() || "";
                                            const rest = parts[1]?.trim() || "";
                                            
                                            return (
                                                <div key={idx} className="bg-[#1A1A1C] border border-[#2C2C2E] rounded-xl p-4 flex flex-col gap-1.5">
                                                    <span className="text-[12px] font-bold text-blue-400">{label}</span>
                                                    <p className="text-[14px] text-white font-medium">{rest}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. IOTA CFT Phase 1 - 시스템 기획안 */}
                {selectedMenu === 'phase1-proposal' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IOTA Phase 1</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">시스템 기획안 (원본 반영)</span>
                            </div>
                            <button onClick={() => handleCopyText(`
 | 이오타 CFT 플랫폼 Phase 1 기획안
본 문서는 이오타 CFT 협업 플랫폼의 초기 기틀을 마련하고 안정적인 운영 환경을 수립한 Phase 1의 설계 사양과 마이그레이션 이력을 기록으로 보존하고 관리하기 위해 작성됨.


1. Phase 1 구축 배경 및 목적

   1) IFPDP 전사 프레임워크와의 연동
    이오타(IOTA) CFT 협업 플랫폼은 이지스자산운용의 전사 통합 자산 관제 및 의사결정 메타데이터 시스템인 IFPDP(Aegis Fund Production Data Platform)의 맥락과 설계 철학에서 출발했음. 
    전사 데이터 통합이라는 거시적 프레임워크 아래, 실제 실무 비즈니스(Deal)와 사업 관리를 유기적으로 연결하는 첫 번째 실천적 하이브리드 형태의 플랫폼으로 기능하는것을 목표로 함.

   2) 대형 프로젝트에 대한 전통적 업무 방식의 한계
    이오타 사업단 내의 각 전문 부서(사업관리, LFC, 개발관리, 마케팅, 설계 등)가 담당하는 대형 프로젝트(예: 427 PFV 등)는 복잡도가 높고 산출물이 얽혀 있어, 
    부서 간 정보 비대칭성과 업무 과중, 업무 누수 현상이 반복됨.

   3) Phase 1의 핵심 목표
    a) 부서별로 흩어져 있던 업무 Task(할일 및 마일스톤)을 단일 데이터베이스 및 웹 플랫폼으로 통합.
    b) 부서별 주관 업무와 산출물의 상태를 가독성 높은 인터페이스로 공유하여 실시간으로 진척도를 모니터링.
    c) 실무진의 수작업 보고 체계를 자동화+데이터화하고, 의결 사항 및 지연 요소의 기록 역사를 투명하게 아카이빙.



2. 플랫폼 시스템 아키텍처 및 권한 체계
Phase 1은 전사 통합망(IFPDP)과 연동을 목표로, 이지스 임직원 인증 기반의 부서별 권한 통제를 최초로 확립했음.

   1) 사용자 권한 매핑 규칙
    초기 플랫폼 진입 시 각 사용자의 이메일 및 직급 정보를 통해 본인의 전용 워크스페이스에 대한 접근 및 쓰기 권한을 확인함.
    *e.g. 사업 PM 1 파트원: 권순일, 윤주형, 김제익, 류홍, 박만진, 박일훈, 이정원, 전무경
    *e.g. 사업 PM 2 파트원: 강순용, 한찬호, 박석제, 박채현, 소현준, 이수정, 조영비, 한수정
    *e.g. 플랫폼 어드민 및 Director: 전기영, 이시정, 이관용, 이철승, 윤관식, 정조민, 우형석

   2) 다중 테넌트 워크스페이스 구조
    인증 세션에 따라 좌측 내비게이션 바에서 본인 소관 부서에 맞는 워크스페이스로 즉시 리다이렉팅하는 하이브리드 라우팅을 적용했다.



3. 핵심 데이터베이스 및 기능 모듈
Phase 1은 업무 특성별로 고유 스키마를 구성하여 총 6대 테이블과 이력 관리 모듈을 신설 구축했음.

① 자산 개요, 비히클 및 조직 (Core Identity & Vehicle)
자산 기본 구조: 자산/프로젝트명, 주요 용도(상업용, 물류, 주거, 코리빙, 복합 등), 대지/연면적 정보.
비히클(Vehicle) 통제: 설정 형태(Fund, PFV, REITs, SPC), 펀드 호수명(Ex. 468-2호).
조직 및 인력 배분: 의사결정권자(Director), 책임(PD), 실무 담당(PM) 지정 내역 및 리얼에셋 그룹 내 인력 배분 현황.

② 자본 스택 및 수익자(LP) 관리 (Capital & LP Reporting)
파이낸싱 구조(LFC): 에쿼티/론 총액, 조달 트랜치별 금리(선순위/중순위/후순위), LTV, 리파이낸싱 스케줄.
현금흐름(CF) 및 펀드 분배: 누적 배당 현황, 예상 vs 실제 매입가/평가액 비교, 캐피탈 콜(Capital Call) 일정, 수익자 워터폴(Waterfall) 결산.
투자자(LP) 통합 연계: 기관 유형 및 투자 성향별 LP 분류, 매각/매입 주관사(SI, PB 등) 컨택 이력, 이지스 예상 수취 보수(매입/운용/매각 보수).

③ 10단계 가치사슬 및 시계열 트래킹 (Value Chain & Time-Series)
소싱 파이프라인: 딜 티저 접수 이력, CA 검토, 실사, 우선협상자 선정에 이르는 모든 소싱 히스토리.
전체 생애주기 일정 (시계열 캘린더링): 매입(투자)일, PF 인출일, 착공일, 준공일, 대출 만기(연장)일, 펀드 만기일 및 예상 엑시트(매각) 완료 일정 등 타임라인 데이터베이스화.

④ 개발 상품 기획 및 ESG 전략 (Product, Construction & ESG)
투자/개발 전략: Core, Value-added, Opportunistic 등 전략 분류. 부실 자산(NPL) 정상화 플랜 유무. 단일 건축안 vs 인접 부지 통합 개발안 등 복수 시나리오 타당성 비교 데이터.
하드 코스트 및 인허가: 증축, 리모델링, 철거, 관할청 사업 인허가 상황, 전력 공급 및 주요 설비(건축, 구조, 공조, 통신) 스펙.
설계 및 시공 파트너: 시공사 도급 순위, 설계사 기본 정보 및 사업 이력 현황.
공간 기획 및 ESG: 프롭테크(Space UX/Tech) 도입 현황, 친환경 설계(LEED, GRESB 등 인증), 에너지 효율화 지표.

⑤ 실물 운영 및 임차인 네트워크 (Asset Ops & Corporate Leasing)
임대차 및 수익률 방어: 오피스 및 리테일 MD 앵커 테넌트 입점 이력, 임대율(Occupancy), 가중평균 잔여 임대기간(WALT) 방어율, 자본적 지출(CAPEX) 내역.
FM/PM 관리: 주요 하자 보수 이력 플랫폼 연동.
임차 기업 니즈(Needs) 타겟팅: 국내 Top 100 기업별 특수 임차 조건(산업 유형별 선호 면적 및 위치) 트래킹 및 당사 보유/신규 자산과의 매칭 가능성 분석 데이터.

⑥ 거시 지표 및 부서별 성과 관리 (Macro OKR & Market)
그룹 전사 목표(OKR): 펀드 수익 및 수수료 기반의 전사 매출 달성률 현황, 하부 부서별(본부 센터) 진척도 자동 추적.
외부 마켓 인텔리전스: 주요 대형 임차인의 이탈/이동 시장 동향, 대형 시공사의 외부 재무 리스크 이슈 타임라인 모니터링.

⑦ 의사결정 맥락 엔진 및 리스크 통제 (Context Graph & Compliance)
레드 플래그(Red Flags) 우선순위: 준공 지연, 대규모 공실 우려, 재융자 불가 등 딜 브레이커 요소를 심각도(Red/Yellow/Green) 기준으로 시각화 및 알림 표출.
의사결정 이력 (Context Graph): 론 조건 변경, 수익률 하향 조정, 매각 시기 연기 등 재단/투자위에서 중대한 결정이 내려질 당시의 배경 사유와 정성적 판단 근거 기록.
내부 통제(Compliance): 자산운용사 필수 법적 준수 요건, 이해상충 방지, 특정 문서 제출 기한 및 위원회 결재 로그 아카이빙.



4. 시스템 설계 구현 타당성

초기 프론트엔드 플랫폼 개발 관점에서의 작동 타당성 및 구현 전략은 아래와 같다.

1. 상세 자산 단위의 시나리오 구현: 7대 DB 모듈에 담길 수많은 전사 데이터를 후방에서 일시 구축하는 것은 현실적으로 불가능하다. 
따라서 프론트엔드 단계에서는 1~2개 핵심 자산(예: 더케이트윈타워)에 대한 기능적 흐름(Golden Path)만을 하드코딩된 API 모크업(Mock-up) 단위로 시각화하여 플랫폼의 거대 커버리지를 입증한다.

2. 모듈형 아키텍처 (패널 간 분리 기능): 시각 리소스를 압도적으로 요구하는 중앙 메인 대시보드(시스템 데이터 화면)와 상황 인식 연산이 필요한 대화형 AI 패널 영역을 코드 레벨에서 상호 격리(Decoupling)한다. 
이를 통해 각 모듈(1~7번)의 데이터 패시징 및 기능 확장을 상호 충돌이나 성능 저하 없이 구현할 수 있다.




`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 텍스트 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[800px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Framework Retrospective</span>
                                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-1">IOTA CFT 플랫폼 Phase 1 기획안</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">이오타 CFT 협업 플랫폼의 초기 기틀 및 비히클 시계열 관제 기틀 수립 사양</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                <div className="text-[15px] text-[#A1A1AA] leading-[28px] font-light whitespace-pre-wrap font-sans space-y-6">
                                    
 | 이오타 CFT 플랫폼 Phase 1 기획안
본 문서는 이오타 CFT 협업 플랫폼의 초기 기틀을 마련하고 안정적인 운영 환경을 수립한 Phase 1의 설계 사양과 마이그레이션 이력을 기록으로 보존하고 관리하기 위해 작성됨.


1. Phase 1 구축 배경 및 목적

   1) IFPDP 전사 프레임워크와의 연동
    이오타(IOTA) CFT 협업 플랫폼은 이지스자산운용의 전사 통합 자산 관제 및 의사결정 메타데이터 시스템인 IFPDP(Aegis Fund Production Data Platform)의 맥락과 설계 철학에서 출발했음. 
    전사 데이터 통합이라는 거시적 프레임워크 아래, 실제 실무 비즈니스(Deal)와 사업 관리를 유기적으로 연결하는 첫 번째 실천적 하이브리드 형태의 플랫폼으로 기능하는것을 목표로 함.

   2) 대형 프로젝트에 대한 전통적 업무 방식의 한계
    이오타 사업단 내의 각 전문 부서(사업관리, LFC, 개발관리, 마케팅, 설계 등)가 담당하는 대형 프로젝트(예: 427 PFV 등)는 복잡도가 높고 산출물이 얽혀 있어, 
    부서 간 정보 비대칭성과 업무 과중, 업무 누수 현상이 반복됨.

   3) Phase 1의 핵심 목표
    a) 부서별로 흩어져 있던 업무 Task(할일 및 마일스톤)을 단일 데이터베이스 및 웹 플랫폼으로 통합.
    b) 부서별 주관 업무와 산출물의 상태를 가독성 높은 인터페이스로 공유하여 실시간으로 진척도를 모니터링.
    c) 실무진의 수작업 보고 체계를 자동화+데이터화하고, 의결 사항 및 지연 요소의 기록 역사를 투명하게 아카이빙.



2. 플랫폼 시스템 아키텍처 및 권한 체계
Phase 1은 전사 통합망(IFPDP)과 연동을 목표로, 이지스 임직원 인증 기반의 부서별 권한 통제를 최초로 확립했음.

   1) 사용자 권한 매핑 규칙
    초기 플랫폼 진입 시 각 사용자의 이메일 및 직급 정보를 통해 본인의 전용 워크스페이스에 대한 접근 및 쓰기 권한을 확인함.
    *e.g. 사업 PM 1 파트원: 권순일, 윤주형, 김제익, 류홍, 박만진, 박일훈, 이정원, 전무경
    *e.g. 사업 PM 2 파트원: 강순용, 한찬호, 박석제, 박채현, 소현준, 이수정, 조영비, 한수정
    *e.g. 플랫폼 어드민 및 Director: 전기영, 이시정, 이관용, 이철승, 윤관식, 정조민, 우형석

   2) 다중 테넌트 워크스페이스 구조
    인증 세션에 따라 좌측 내비게이션 바에서 본인 소관 부서에 맞는 워크스페이스로 즉시 리다이렉팅하는 하이브리드 라우팅을 적용했다.



3. 핵심 데이터베이스 및 기능 모듈
Phase 1은 업무 특성별로 고유 스키마를 구성하여 총 6대 테이블과 이력 관리 모듈을 신설 구축했음.

① 자산 개요, 비히클 및 조직 (Core Identity & Vehicle)
자산 기본 구조: 자산/프로젝트명, 주요 용도(상업용, 물류, 주거, 코리빙, 복합 등), 대지/연면적 정보.
비히클(Vehicle) 통제: 설정 형태(Fund, PFV, REITs, SPC), 펀드 호수명(Ex. 468-2호).
조직 및 인력 배분: 의사결정권자(Director), 책임(PD), 실무 담당(PM) 지정 내역 및 리얼에셋 그룹 내 인력 배분 현황.

② 자본 스택 및 수익자(LP) 관리 (Capital & LP Reporting)
파이낸싱 구조(LFC): 에쿼티/론 총액, 조달 트랜치별 금리(선순위/중순위/후순위), LTV, 리파이낸싱 스케줄.
현금흐름(CF) 및 펀드 분배: 누적 배당 현황, 예상 vs 실제 매입가/평가액 비교, 캐피탈 콜(Capital Call) 일정, 수익자 워터폴(Waterfall) 결산.
투자자(LP) 통합 연계: 기관 유형 및 투자 성향별 LP 분류, 매각/매입 주관사(SI, PB 등) 컨택 이력, 이지스 예상 수취 보수(매입/운용/매각 보수).

③ 10단계 가치사슬 및 시계열 트래킹 (Value Chain & Time-Series)
소싱 파이프라인: 딜 티저 접수 이력, CA 검토, 실사, 우선협상자 선정에 이르는 모든 소싱 히스토리.
전체 생애주기 일정 (시계열 캘린더링): 매입(투자)일, PF 인출일, 착공일, 준공일, 대출 만기(연장)일, 펀드 만기일 및 예상 엑시트(매각) 완료 일정 등 타임라인 데이터베이스화.

④ 개발 상품 기획 및 ESG 전략 (Product, Construction & ESG)
투자/개발 전략: Core, Value-added, Opportunistic 등 전략 분류. 부실 자산(NPL) 정상화 플랜 유무. 단일 건축안 vs 인접 부지 통합 개발안 등 복수 시나리오 타당성 비교 데이터.
하드 코스트 및 인허가: 증축, 리모델링, 철거, 관할청 사업 인허가 상황, 전력 공급 및 주요 설비(건축, 구조, 공조, 통신) 스펙.
설계 및 시공 파트너: 시공사 도급 순위, 설계사 기본 정보 및 사업 이력 현황.
공간 기획 및 ESG: 프롭테크(Space UX/Tech) 도입 현황, 친환경 설계(LEED, GRESB 등 인증), 에너지 효율화 지표.

⑤ 실물 운영 및 임차인 네트워크 (Asset Ops & Corporate Leasing)
임대차 및 수익률 방어: 오피스 및 리테일 MD 앵커 테넌트 입점 이력, 임대율(Occupancy), 가중평균 잔여 임대기간(WALT) 방어율, 자본적 지출(CAPEX) 내역.
FM/PM 관리: 주요 하자 보수 이력 플랫폼 연동.
임차 기업 니즈(Needs) 타겟팅: 국내 Top 100 기업별 특수 임차 조건(산업 유형별 선호 면적 및 위치) 트래킹 및 당사 보유/신규 자산과의 매칭 가능성 분석 데이터.

⑥ 거시 지표 및 부서별 성과 관리 (Macro OKR & Market)
그룹 전사 목표(OKR): 펀드 수익 및 수수료 기반의 전사 매출 달성률 현황, 하부 부서별(본부 센터) 진척도 자동 추적.
외부 마켓 인텔리전스: 주요 대형 임차인의 이탈/이동 시장 동향, 대형 시공사의 외부 재무 리스크 이슈 타임라인 모니터링.

⑦ 의사결정 맥락 엔진 및 리스크 통제 (Context Graph & Compliance)
레드 플래그(Red Flags) 우선순위: 준공 지연, 대규모 공실 우려, 재융자 불가 등 딜 브레이커 요소를 심각도(Red/Yellow/Green) 기준으로 시각화 및 알림 표출.
의사결정 이력 (Context Graph): 론 조건 변경, 수익률 하향 조정, 매각 시기 연기 등 재단/투자위에서 중대한 결정이 내려질 당시의 배경 사유와 정성적 판단 근거 기록.
내부 통제(Compliance): 자산운용사 필수 법적 준수 요건, 이해상충 방지, 특정 문서 제출 기한 및 위원회 결재 로그 아카이빙.



4. 시스템 설계 구현 타당성

초기 프론트엔드 플랫폼 개발 관점에서의 작동 타당성 및 구현 전략은 아래와 같다.

1. 상세 자산 단위의 시나리오 구현: 7대 DB 모듈에 담길 수많은 전사 데이터를 후방에서 일시 구축하는 것은 현실적으로 불가능하다. 
따라서 프론트엔드 단계에서는 1~2개 핵심 자산(예: 더케이트윈타워)에 대한 기능적 흐름(Golden Path)만을 하드코딩된 API 모크업(Mock-up) 단위로 시각화하여 플랫폼의 거대 커버리지를 입증한다.

2. 모듈형 아키텍처 (패널 간 분리 기능): 시각 리소스를 압도적으로 요구하는 중앙 메인 대시보드(시스템 데이터 화면)와 상황 인식 연산이 필요한 대화형 AI 패널 영역을 코드 레벨에서 상호 격리(Decoupling)한다. 
이를 통해 각 모듈(1~7번)의 데이터 패시징 및 기능 확장을 상호 충돌이나 성능 저하 없이 구현할 수 있다.





                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. IOTA CFT Phase 1 - 기능요구사항 */}
                {selectedMenu === 'phase1-requirements' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IOTA Phase 1</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">기능요구사항 명세</span>
                            </div>
                            <button onClick={() => handleCopyText(`IOTA CFT Phase 1 기능요구사항 명세

1. 부서별 주관 업무 및 Task 관리
- 각 전문 부서(사업관리, LFC, 개발관리, 마케팅, 설계 등)별 일정 및 업무 관리.
- 주관 부서와 협업 부서 매핑, 산출물 상태 모니터링.

2. 주간 스냅샷 아카이빙 (iota_weekly_snapshots)
- 매주 금요일 퇴근 시점의 업무 원장 스냅샷 저장 및 시계열 백업.
- Supabase 장애 시 로컬 스토리지 자동 백업 기동.

3. 실무 알림 연동 및 대외 데이터 연계
- 태스크 및 Blocker 등록 시 메일/메시지 백그라운드 발송.
- 거래 빌딩별 LP, 시행사, 자산관리 회사 연락처 마스터 관리 (iota_stakeholder_master).

4. 의사결정 맥락 기록
- 중요 의사결정 사항의 배경 사유와 정성적 판단 근거를 기록하는 의사결정 로그(DecisionLog) 및 히스토리 잠금.`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 텍스트 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[800px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Functional Requirements</span>
                                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-1">IOTA CFT Phase 1 기능요구사항 명세</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">부서별 협업 원장 통합 및 핵심 마일스톤 관제 요구조건</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {[
                                        { title: '1. 부서별 주관 업무 및 Task 관리', desc: '사업 PM 파트, LFC 금융 파트, DSC 개발관리 파트 등 각 부서별 고유 스키마를 구성하고, 선후공정 마일스톤 및 산출물 상태를 대시보드 형태로 공유.' },
                                        { title: '2. 주간 스냅샷 아카이빙 (iota_weekly_snapshots)', desc: '매주 금요일 퇴근 기준 업무 상태를 스냅샷 이미지로 저장. Supabase DB와 로컬 스토리지 간 이중 동시 동기화 백업 시스템 구축.' },
                                        { title: '3. 실무 알림 연동 및 대외 데이터 브릿지', desc: 'Blocker 병목 발생 시 담당자에게 메일/메시지 백그라운드 자동 발송. 거래 빌딩별 LP, 자산관리 회사 VVIP 인물 데이터베이스 적재.' },
                                        { title: '4. 의사결정 맥락 기록', desc: '중요 판단 건(PF 트랜치 조달 금리 변천사, NPL 전략 수립 등)에 대한 정성적 판단 근거와 배경 사유를 기록하고 이력을 보존하는 의사결정 로그(DecisionLog).' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-[#141416] border border-[#1C1C1E] rounded-2xl p-6 shadow-xl flex flex-col gap-2">
                                            <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                                                <span className="w-1.5 h-4.5 bg-blue-500 rounded-full"></span>
                                                {item.title}
                                            </h3>
                                            <p className="text-[13.5px] text-[#A1A1AA] leading-relaxed pl-3">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. IOTA CFT Phase 1 - DB Schema */}
                {selectedMenu === 'phase1-schema' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IOTA Phase 1</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">DB Schema DDL</span>
                            </div>
                            <button onClick={() => handleCopyText(`-- 1. 이오타 파트별 태스크 테이블
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
);`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 스키마 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[800px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Database Schema</span>
                                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-1">IOTA CFT Phase 1 DB Schema</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">부서 태스크 원장 및 의사결정 로그 테이블 DDL 명세서</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                <pre className="bg-[#141416] p-6 rounded-2xl border border-[#1C1C1E] text-[13px] font-mono text-blue-300 overflow-x-auto whitespace-pre leading-relaxed select-text shadow-lg">
                                    <code>{`-- 1. 이오타 파트별 태스크 테이블
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
);`}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. IOTA CFT Phase 2 - 시스템 기획안 */}
                {selectedMenu === 'phase2-proposal' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IOTA Phase 2</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">시스템 기획안 (원본 반영)</span>
                            </div>
                            <button onClick={() => handleCopyText(`IOTA CFT Phase 2 시스템 기획안

1. 실질적 운영화 전환의 당위성
Phase 1에서 기술적 기틀과 데이터 모델을 정비했다면, Phase 2는 이를 토대로 실무진이 매일 활용할 수 있도록 보안 등급 제어, 엑셀식 고속 셀 수정 인터페이스, 그리고 주간 회의체 즉시 연계 기능을 구축하여 실무 비즈니스를 실제로 구동 및 통제하는 것이 핵심 사명입니다.

2. 권한 및 보안 설계
Supabase 데이터베이스 레이어에 RLS(Row Level Security)를 활성화하여 iota_members 정보에 등록된 사용자의 소속 부서와 직무 등급에 맞추어 쓰기/수정 권한을 격리 통제합니다.

3. 실시간 PMO 그리드 및 회의 연동
업무 현황 최신화를 신속히 수행할 수 있도록 스프레드시트 방식의 인라인 편집 및 Blocker 원클릭 토글을 지원하고, 우선순위가 높거나 Blocker가 켜진 안건을 회의실 화면에 즉시 A등급으로 상단 노출시키는 실시간 대시보드 연동을 설계했습니다.`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 텍스트 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[800px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Operational Roadmap</span>
                                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-1">IOTA CFT Phase 2 시스템 기획안</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">보안 권한 제어, 스프레드시트 인라인 편집 및 실전 PMO 운영화 로드맵</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                <div className="text-[15px] text-[#A1A1AA] leading-[28px] font-light whitespace-pre-wrap font-sans space-y-6">
                                    IOTA CFT Phase 2 시스템 기획안

1. 실질적 운영화 전환의 당위성
Phase 1에서 기술적 기틀과 데이터 모델을 정비했다면, Phase 2는 이를 토대로 실무진이 매일 활용할 수 있도록 보안 등급 제어, 엑셀식 고속 셀 수정 인터페이스, 그리고 주간 회의체 즉시 연계 기능을 구축하여 실무 비즈니스를 실제로 구동 및 통제하는 것이 핵심 사명입니다.

2. 권한 및 보안 설계
Supabase 데이터베이스 레이어에 RLS(Row Level Security)를 활성화하여 iota_members 정보에 등록된 사용자의 소속 부서와 직무 등급에 맞추어 쓰기/수정 권한을 격리 통제합니다.

3. 실시간 PMO 그리드 및 회의 연동
업무 현황 최신화를 신속히 수행할 수 있도록 스프레드시트 방식의 인라인 편집 및 Blocker 원클릭 토글을 지원하고, 우선순위가 높거나 Blocker가 켜진 안건을 회의실 화면에 즉시 A등급으로 상단 노출시키는 실시간 대시보드 연동을 설계했습니다.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 8. IOTA CFT Phase 2 - 기능요구사항 */}
                {selectedMenu === 'phase2-requirements' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IOTA Phase 2</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">기능요구사항 명세</span>
                            </div>
                            <button onClick={() => handleCopyText(`IOTA CFT Phase 2 기능요구사항 명세

1. 스프레드시트 뷰 기반 인라인 편집 (Inline Edit)
- 태스크 테이블의 상태, 마감일, 다음 액션을 상세 팝업 창을 켜지 않고 그리드 내부에서 더블클릭하여 즉각 수정 및 비동기 저장.
- 병목(Blocker) 여부 및 의사결정 필요 여부 필드는 마우스 클릭 한 번으로 참/거짓 값을 토글 및 데이터베이스 즉시 반영.

2. 단발성 외부 팝업 요청 통제 (iota_pmo_popup_requests)
- 정규 마일스톤 외부에 발생하는 수작업 업무 요청을 공식 접수, 위임, 반려, 보류할 수 있는 수집 채널 및 승인 워크플로우 지원.

3. 실시간 회의체 상정용 임원 대시보드
- 우선순위 점수가 80점 이상이거나 의사결정필요가 참인 항목들을 'A등급 즉시 상정' 카드로 최상단 자동 정렬.
- 현재 병목이 집중된 부서와 담당자를 막대 그래프 형태로 실시간 차트 시각화.`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 텍스트 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[800px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Operational Specifications</span>
                                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-1">IOTA CFT Phase 2 기능요구사항 명세</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">비즈니스 실전 가동을 위한 PMO 핵심 기능 명세 및 세부 사양</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {[
                                        { title: '1. 스프레드시트 뷰 기반 인라인 편집 (Inline Edit)', desc: '태스크 테이블의 상태, 마감일, 다음 액션을 상세 수정 팝업창 없이 그리드 내부에서 더블클릭하여 바로 변경 및 비동기(Async) 저장. Blocker 및 의사결정 필요 여부 필드는 원클릭 마우스 토글로 즉시 데이터베이스에 반영하여 정보 최신화 고속화.' },
                                        { title: '2. 단발성 외부 팝업 요청 통제 (iota_pmo_popup_requests)', desc: '정규 마일스톤 외부에 불시 발생하는 수작업 업무 요청(자산 실사 준비, 분석 등)을 수집하고, 승인/위임/반려/보류 프로세스를 타이트하게 제공하여 정규 업무 영향도를 모니터링.' },
                                        { title: '3. 실시간 회의체 상정용 임원 대시보드', desc: '우선순위 점수가 80점 이상이거나 의사결정필요가 참인 Blocker 업무를 A등급 즉시 상정 카드로 최상단 자동 정렬 노출. 현재 업무 병목이 발생하고 있는 부서와 실무 담당자를 실시간 막대 차트로 집계 표현.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-[#141416] border border-[#1C1C1E] rounded-2xl p-6 shadow-xl flex flex-col gap-2">
                                            <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                                                <span className="w-1.5 h-4.5 bg-blue-500 rounded-full"></span>
                                                {item.title}
                                            </h3>
                                            <p className="text-[13.5px] text-[#A1A1AA] leading-relaxed pl-3">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. IOTA CFT Phase 2 - DB Schema */}
                {selectedMenu === 'phase2-schema' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-[72px] border-b border-[#1C1C1E] px-8 flex items-center justify-between bg-[#000000] shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-blue-400">IOTA Phase 2</span>
                                <span className="text-gray-600">/</span>
                                <span className="text-[13px] text-gray-400">DB Schema DDL</span>
                            </div>
                            <button onClick={() => handleCopyText(`-- 1. PMO 통합 원장 테이블 (PMO Control Ledger)
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
    );`)} className="px-4 py-1.5 bg-[#1C1C1E] border border-[#2C2C2E] hover:bg-[#2C2C2E] rounded-[8px] text-[12.5px] font-semibold text-[#E5E5E5] transition-all cursor-pointer">
                                {copied ? '복사 완료' : '원본 스키마 복사'}
                            </button>
                        </header>
                        
                        <div className="flex-1 overflow-y-auto p-12 hide-scrollbar">
                            <div className="max-w-[800px] flex flex-col gap-10">
                                <div>
                                    <span className="text-[12px] font-bold text-blue-500 tracking-wider uppercase">Database Schema</span>
                                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-1">IOTA CFT Phase 2 DB Schema</h1>
                                    <p className="text-[15px] text-[#86868B] mt-2">PMO 통합 제어 테이블 및 Supabase RLS 정책 DDL 명세서</p>
                                    <div className="h-[1px] bg-[#1C1C1E] w-full mt-6"></div>
                                </div>

                                <pre className="bg-[#141416] p-6 rounded-2xl border border-[#1C1C1E] text-[13px] font-mono text-blue-300 overflow-x-auto whitespace-pre leading-relaxed select-text shadow-lg">
                                    <code>{`-- 1. PMO 통합 원장 테이블 (PMO Control Ledger)
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
    );`}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
