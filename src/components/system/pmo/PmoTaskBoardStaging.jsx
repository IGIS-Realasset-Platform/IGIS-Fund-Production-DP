import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';

const FALLBACK_BOARD_TASKS = [
  {
    "id": "T-001",
    "project": "공통",
    "category_main": "공통 PMO",
    "sector_detail": "업무관리 체계",
    "task_name": "IOTA 통합 업무관리 원장 운영",
    "task_purpose": "업무과중·중복요청·공 차지 문제를 차단하고 PF/준공 중심으로 업무를 재정렬",
    "deliverables": "통합업무보드, 회의메인, Action Item 운영기준",
    "target_axis": "준공/운영",
    "gate_stage": "G0 현황정리",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "사업관리1파트;개발관리실;공간솔루션실;기업마케팅실;LFC",
    "assignee": "파트장",
    "external_party": "내부 전체",
    "support_needed": "부서별 담당자 입력",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-002",
    "project": "공통",
    "category_main": "공통 PMO",
    "sector_detail": "우선순위 기준",
    "task_name": "회의상정 우선순위 산정 기준 확정",
    "task_purpose": "종합현황이 수기 요약이 아니라 원장 기반으로 자동 정렬되어야 함",
    "deliverables": "우선순위 기준표, 회의상정 기준, 상정사유",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "LFC;개발관리실",
    "assignee": "미정",
    "external_party": "내부 전체",
    "support_needed": "파트장 확인",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-003",
    "project": "427PFV",
    "category_main": "호텔/운영",
    "sector_detail": "브랜드",
    "task_name": "427 호텔 브랜드 방향 확정",
    "task_purpose": "427 PF 실행을 위해 호텔 브랜드·운영전략·대주 설득 스토리 필요",
    "deliverables": "리츠칼튼/소노/대안 브랜드 비교표, 추천안",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "기업마케팅실;LFC;법무/세무 외부자문",
    "assignee": "미정",
    "external_party": "Marriott;대명소노",
    "support_needed": "호텔 담당/법무 검토",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-004",
    "project": "427PFV",
    "category_main": "호텔/운영",
    "sector_detail": "HMA/Franchise",
    "task_name": "호텔 운영계약 구조 검토",
    "task_purpose": "호텔 계약 형태가 PF, 가치평가, 운영리스크에 영향",
    "deliverables": "HMA/프랜차이즈/운영위탁 구조별 Term 비교",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "LFC;법무/세무 외부자문;기업마케팅실",
    "assignee": "미정",
    "external_party": "Marriott;대명소노",
    "support_needed": "외부 법무 검토",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-005",
    "project": "427PFV",
    "category_main": "호텔/운영",
    "sector_detail": "운영전략",
    "task_name": "호텔 운영수지·FF&E·CAPEX 반영",
    "task_purpose": "재무모델과 PF 상환가능성 검토에 필요",
    "deliverables": "호텔 운영수지, FF&E, Capex, 안정화 기간 가정",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "LFC",
    "coop_depts": "사업관리2파트;기업마케팅실;공간솔루션실",
    "assignee": "미정",
    "external_party": "호텔 브랜드사",
    "support_needed": "운영자료 필요",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-006",
    "project": "공통",
    "category_main": "인허가",
    "sector_detail": "현금기부채납",
    "task_name": "현금기부채납 협의 조건 정리",
    "task_purpose": "기부채납 규모·지급시기·인허가 조건이 사업비/PF 조건에 직접 영향",
    "deliverables": "관청 협의현황, 비용반영표, 쟁점 및 협상안",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;LFC",
    "assignee": "미정",
    "external_party": "서울시/중구청",
    "support_needed": "관청 협의 결과",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-007",
    "project": "공통",
    "category_main": "인허가",
    "sector_detail": "소공원로",
    "task_name": "소공원로 협의 및 공사중 사용/변경 가능성 검토",
    "task_purpose": "도로·공공기여·공사동선 이슈가 착공 및 준공 일정에 영향",
    "deliverables": "소공원로 협의안, 일정표, 리스크표",
    "target_axis": "착공",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;공간솔루션실",
    "assignee": "미정",
    "external_party": "서울시/중구청",
    "support_needed": "도면·관청의견 필요",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-008",
    "project": "816PFV",
    "category_main": "인허가",
    "sector_detail": "주거전환",
    "task_name": "816 주거전환 가능성 및 인허가 리스크 검토",
    "task_purpose": "통합/대안 구조에서 816의 사업성·리스크·대주단 수용성 판단 필요",
    "deliverables": "주거전환 가능성 검토서, 일정/리스크/사업성 비교",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;LFC;공간솔루션실",
    "assignee": "미정",
    "external_party": "서울시/중구청;삼성물산",
    "support_needed": "인허가/설계 검토",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-009",
    "project": "427PFV",
    "category_main": "인허가",
    "sector_detail": "변경인가",
    "task_name": "427 호텔·오피스 변경 가능성 및 PF 전 인허가 쟁점 정리",
    "task_purpose": "호텔 브랜드/운영전략에 따라 도면·용도·면적 영향 가능",
    "deliverables": "427 변경인가 쟁점표, 필요 인허가 목록",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;공간솔루션실",
    "assignee": "미정",
    "external_party": "서울시/중구청",
    "support_needed": "인허가 판단",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-010",
    "project": "공통",
    "category_main": "인허가",
    "sector_detail": "사용승인",
    "task_name": "준공/사용승인 역산 로드맵 수립",
    "task_purpose": "PF 이후에도 준공·담보대출까지 장기 관리 필요",
    "deliverables": "사용승인 체크리스트, 준공 CP, 관계기관 일정표",
    "target_axis": "준공/운영",
    "gate_stage": "G5 준공",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;LFC",
    "assignee": "미정",
    "external_party": "서울시/중구청",
    "support_needed": "장기 일정 입력",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-011",
    "project": "427PFV",
    "category_main": "시공/원가",
    "sector_detail": "현대건설 도급",
    "task_name": "427 현대건설 도급조건 및 신용공여 조건 확정",
    "task_purpose": "427 PF 실행성은 시공조건·공사비·신용공여에 좌우",
    "deliverables": "현대건설 Term, 도급조건, 신용공여 범위",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "LFC;개발관리실",
    "assignee": "미정",
    "external_party": "현대건설",
    "support_needed": "시공사 Term 회신",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-012",
    "project": "816PFV",
    "category_main": "시공/원가",
    "sector_detail": "삼성물산 도급",
    "task_name": "816 삼성물산 도급조건·책임임차·LOC 구조 정리",
    "task_purpose": "816 원가와 삼성 조건이 단독/통합 PF 실행성의 핵심",
    "deliverables": "삼성물산 Term, LOC, 책임임차, 공사비 비교",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "LFC;개발관리실;기업마케팅실",
    "assignee": "미정",
    "external_party": "삼성물산",
    "support_needed": "삼성 조건 회신",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-013",
    "project": "공통",
    "category_main": "시공/원가",
    "sector_detail": "공사비 검증",
    "task_name": "427/816 공사비 적정성 및 VE 가능성 검토",
    "task_purpose": "높은 원가가 PF·주주승인·임차조건의 공통 병목",
    "deliverables": "공사비 비교표, VE 목록, 공사비 민감도",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;LFC;공간솔루션실",
    "assignee": "미정",
    "external_party": "현대건설;삼성물산",
    "support_needed": "견적 상세내역",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-014",
    "project": "공통",
    "category_main": "시공/원가",
    "sector_detail": "공기/착공조건",
    "task_name": "책임착공·착공조건·공기 단축 시나리오 정리",
    "task_purpose": "PF 약정상 착공기한과 공정관리가 장기 리스크",
    "deliverables": "착공조건표, 공기 시나리오, 책임착공 리스크표",
    "target_axis": "착공",
    "gate_stage": "G4 착공/공사",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;LFC",
    "assignee": "미정",
    "external_party": "현대건설;삼성물산",
    "support_needed": "시공사 공정표",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-015",
    "project": "공통",
    "category_main": "도면/설계",
    "sector_detail": "PF 기준도면",
    "task_name": "PF 대주단 제출용 기준도면 패키지 확정",
    "task_purpose": "도면 기준이 없으면 공사비·임차·PF 설명자료가 모두 흔들림",
    "deliverables": "PF 기준도면, 면적표, 변경이력표",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "공간솔루션실",
    "coop_depts": "개발관리실;사업관리2파트;LFC",
    "assignee": "미정",
    "external_party": "설계사/CM",
    "support_needed": "도면 기준 정리",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-016",
    "project": "공통",
    "category_main": "도면/설계",
    "sector_detail": "면적표",
    "task_name": "GFA/NLA/전용률/임대면적 기준 통일",
    "task_purpose": "임차·재무모델·PF 설명자료의 숫자 불일치 방지",
    "deliverables": "면적표, 전용률, 임대가능면적, 변경 이력",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "공간솔루션실;기업마케팅실",
    "assignee": "미정",
    "external_party": "설계사/CM",
    "support_needed": "도면/면적자료",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-017",
    "project": "427PFV",
    "category_main": "도면/설계",
    "sector_detail": "호텔 프로그램",
    "task_name": "호텔 객실/부대시설 프로그램 도면 반영",
    "task_purpose": "브랜드·운영전략과 설계가 불일치하면 PF 후 변경 리스크 확대",
    "deliverables": "호텔 프로그램 도면, 면적/동선 검토표",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "공간솔루션실",
    "coop_depts": "사업관리2파트;기업마케팅실",
    "assignee": "미정",
    "external_party": "호텔 브랜드사;설계사",
    "support_needed": "브랜드 기준자료",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-018",
    "project": "공통",
    "category_main": "인테리어/TI",
    "sector_detail": "오피스 TI",
    "task_name": "오피스 표준 TI 및 임차인 Fit-out 기준 설정",
    "task_purpose": "임차조건·임대안정화비용·PF 모델에 반영 필요",
    "deliverables": "오피스 TI 기준표, 비용범위, 부담주체",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "공간솔루션실",
    "coop_depts": "기업마케팅실;LFC;사업관리2파트",
    "assignee": "미정",
    "external_party": "잠재 임차인",
    "support_needed": "TI 시장자료",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-019",
    "project": "427PFV",
    "category_main": "인테리어/TI",
    "sector_detail": "호텔 인테리어",
    "task_name": "호텔 인테리어/FF&E 범위 및 비용 정리",
    "task_purpose": "호텔 CAPEX가 총사업비와 대주단 조건에 영향",
    "deliverables": "호텔 인테리어 Scope, FF&E, Owner 부담범위",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "공간솔루션실;기업마케팅실",
    "assignee": "미정",
    "external_party": "호텔 브랜드사",
    "support_needed": "브랜드 기준자료",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-020",
    "project": "공통",
    "category_main": "인테리어/TI",
    "sector_detail": "공간제안 패키지",
    "task_name": "주요 임차인별 공간 제안 패키지 제작",
    "task_purpose": "임차 확보가 PF 실행성과 대주단 설득의 핵심",
    "deliverables": "광장/KB/삼성 등 임차 제안 패키지",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "공간솔루션실",
    "coop_depts": "기업마케팅실;사업관리2파트",
    "assignee": "미정",
    "external_party": "광장;KB;삼성 등",
    "support_needed": "임차인 요구사항",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-021",
    "project": "427PFV",
    "category_main": "임차/마케팅",
    "sector_detail": "광장",
    "task_name": "광장 임차 Term 및 면적·조건 확정",
    "task_purpose": "427/통합 PF 스토리에서 핵심 임차사 역할 가능",
    "deliverables": "임차 Term Sheet, 면적, 임대료, 인센티브",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "기업마케팅실",
    "coop_depts": "사업관리2파트;공간솔루션실;LFC",
    "assignee": "미정",
    "external_party": "광장",
    "support_needed": "임차조건 회신",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-022",
    "project": "공통",
    "category_main": "임차/마케팅",
    "sector_detail": "KB/금융권",
    "task_name": "KB증권 등 금융권 임차 후보 협의",
    "task_purpose": "오피스 선임차 수준이 PF 대주단 설득에 필요",
    "deliverables": "후보별 면적/조건/의사결정 단계표",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "기업마케팅실",
    "coop_depts": "사업관리2파트;공간솔루션실;LFC",
    "assignee": "미정",
    "external_party": "KB증권 등",
    "support_needed": "임차 후보 접촉",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-023",
    "project": "816PFV",
    "category_main": "임차/마케팅",
    "sector_detail": "삼성/이지스 선임차",
    "task_name": "816 선임차·책임임차·임차이전 가능성 정리",
    "task_purpose": "816 단독/통합 PF 구조에서 선임차와 신용공여가 핵심",
    "deliverables": "삼성/이지스 임차 조건표, LOC/책임범위",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "기업마케팅실",
    "coop_depts": "사업관리2파트;LFC;삼성물산",
    "assignee": "미정",
    "external_party": "삼성물산;이지스",
    "support_needed": "내부/삼성 협의",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-024",
    "project": "공통",
    "category_main": "임차/마케팅",
    "sector_detail": "임대료/NOC",
    "task_name": "임차조건·E.NOC·인센티브 기준 통일",
    "task_purpose": "임차 제안서와 재무모델·대주단 설명자료 일치 필요",
    "deliverables": "임대료, 관리비, RF, TI, NOC 계산 기준표",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "기업마케팅실",
    "coop_depts": "LFC;공간솔루션실;사업관리2파트",
    "assignee": "미정",
    "external_party": "잠재 임차인",
    "support_needed": "시장자료",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-025",
    "project": "공통",
    "category_main": "PF/금융",
    "sector_detail": "단독 PF",
    "task_name": "427/816 단독 PF 조건 정리",
    "task_purpose": "개별 PF 가능성 판단과 통합 PF 대비 기준점 필요",
    "deliverables": "427 단독 Term, 816 단독 Term, 민감도",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "사업관리1파트;LFC",
    "assignee": "미정",
    "external_party": "대주단",
    "support_needed": "Term Sheet 필요",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-026",
    "project": "공통",
    "category_main": "PF/금융",
    "sector_detail": "통합 PF",
    "task_name": "대주단 일치화 및 통합 PF 구조 검토",
    "task_purpose": "두 PFV 동시 추진 시 대주단, 담보, 구조가 복잡하므로 의사결정 필요",
    "deliverables": "통합 PF 구조도, 대주단 전략, 담보 제공안",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "LFC",
    "coop_depts": "사업관리2파트;법무/세무 외부자문;사업관리1파트",
    "assignee": "미정",
    "external_party": "대주단",
    "support_needed": "금융/법무 검토",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-027",
    "project": "공통",
    "category_main": "PF/금융",
    "sector_detail": "재무모델",
    "task_name": "427/816/통합 재무모델 업데이트",
    "task_purpose": "원가·임차·호텔·신용공여 조건이 PF 조달액과 주주 설득에 영향",
    "deliverables": "통합 재무모델, 사업비, 금융비용, 민감도",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "LFC",
    "coop_depts": "사업관리2파트;기업마케팅실;개발관리실",
    "assignee": "미정",
    "external_party": "회계법인/대주단",
    "support_needed": "업데이트 입력값",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-028",
    "project": "816PFV",
    "category_main": "PF/금융",
    "sector_detail": "LOC/책임임차",
    "task_name": "삼성 LOC/책임임차 비용 및 구조 반영",
    "task_purpose": "816 단독 PF 비용절감/대주 설득 논리와 연결",
    "deliverables": "LOC 수수료, 책임임차 비용, 이지스 부담 비교",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "LFC",
    "coop_depts": "사업관리2파트;기업마케팅실",
    "assignee": "미정",
    "external_party": "삼성물산;대주단",
    "support_needed": "삼성 조건 확정",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-029",
    "project": "공통",
    "category_main": "PF/금융",
    "sector_detail": "PF CP",
    "task_name": "PF 실행 선결조건 체크리스트 구축",
    "task_purpose": "PF 실행 전 모든 부서 산출물을 CP 형태로 확인 필요",
    "deliverables": "PF CP checklist, 담당/기한/증빙자료 목록",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "LFC",
    "coop_depts": "사업관리2파트;개발관리실;공간솔루션실;기업마케팅실",
    "assignee": "미정",
    "external_party": "대주단",
    "support_needed": "각 부서 산출물",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-030",
    "project": "공통",
    "category_main": "구조/법무/세무",
    "sector_detail": "리츠 전환",
    "task_name": "427 리츠 전환 및 816 편입 구조 검토",
    "task_purpose": "기존 통합 기본안이었으나 방향성이 미정이라 재검토 필요",
    "deliverables": "리츠 전환 구조도, 절차, 세무/법무 쟁점",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "법무/세무 외부자문;LFC;사업관리1파트",
    "assignee": "미정",
    "external_party": "법무법인;세무법인",
    "support_needed": "외부 자문",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-031",
    "project": "공통",
    "category_main": "구조/법무/세무",
    "sector_detail": "Asset/Share/합병",
    "task_name": "Asset Deal·Share Deal·합병·현물출자 비교",
    "task_purpose": "통합 구조별 절차·취득세·주주동의·실행가능성 판단 필요",
    "deliverables": "구조별 비교표, 장단점, 세금/승인 이슈",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "법무/세무 외부자문",
    "coop_depts": "사업관리2파트;LFC",
    "assignee": "미정",
    "external_party": "법무법인;세무법인",
    "support_needed": "자문결과 필요",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-032",
    "project": "공통",
    "category_main": "구조/법무/세무",
    "sector_detail": "421호 펀드",
    "task_name": "421호 펀드 및 수익자 이해관계 정리",
    "task_purpose": "펀드 투자자·주주대여·수익배분 구조가 구조전환 및 PF에 영향",
    "deliverables": "421호 투자자/수익권/배당구조 요약표",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리1파트",
    "coop_depts": "사업관리2파트;LFC;법무/세무 외부자문",
    "assignee": "미정",
    "external_party": "수익자;신탁사",
    "support_needed": "펀드자료 확인",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-033",
    "project": "공통",
    "category_main": "구조/법무/세무",
    "sector_detail": "PFV 주주승인",
    "task_name": "PFV별 주주승인·기존주주 설득 포인트 정리",
    "task_purpose": "기존 주주 동의가 구조전환·PF 실행의 실질 변수",
    "deliverables": "주주별 권리/동의필요/협상 포인트",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리1파트",
    "coop_depts": "사업관리2파트;법무/세무 외부자문",
    "assignee": "미정",
    "external_party": "현대건설;삼성물산;신한;NH 등",
    "support_needed": "주주 구조 확인",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-034",
    "project": "공통",
    "category_main": "주주/보고",
    "sector_detail": "내부 의사결정",
    "task_name": "6~7월 단독/통합/호텔/시공 방향결정 회의 준비",
    "task_purpose": "의사결정 없이 자료요청만 반복되는 구조 차단",
    "deliverables": "의사결정 안건지, 옵션 비교표, 추천안",
    "target_axis": "PF",
    "gate_stage": "G1 방향결정",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "개발관리실",
    "assignee": "찬호",
    "external_party": "대표/본부장/파트장",
    "support_needed": "회의 일정 확정",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-035",
    "project": "공통",
    "category_main": "주주/보고",
    "sector_detail": "주주사 보고",
    "task_name": "주주사 보고자료 구조 및 리스크 문안 정리",
    "task_purpose": "외부 보고 시 사업성·PF 가능성·원가 리스크 표현 필요",
    "deliverables": "주주사 보고자료, Q&A, 리스크 대응문안",
    "target_axis": "PF",
    "gate_stage": "G2 PF준비도",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "LFC;사업관리1파트;법무/세무 외부자문",
    "assignee": "찬호",
    "external_party": "주주사",
    "support_needed": "숫자/법무 검토",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-036",
    "project": "공통",
    "category_main": "주주/보고",
    "sector_detail": "Action Item",
    "task_name": "회의록·Action Item·Due Date 관리",
    "task_purpose": "업무가 흩어지지 않고 담당/기한/산출물 기준으로 회수되게 함",
    "deliverables": "회의록, Action Item, 미완료/지원요청 목록",
    "target_axis": "준공/운영",
    "gate_stage": "G0 현황정리",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "전 부서",
    "assignee": "찬호",
    "external_party": "내부 전체",
    "support_needed": "부서별 피드백",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-037",
    "project": "공통",
    "category_main": "준공/담보대출",
    "sector_detail": "착공 이후 KPI",
    "task_name": "PF 이후 착공·공정·원가·변경관리 KPI 설계",
    "task_purpose": "PF가 끝이 아니라 준공과 Take-out까지 관리 필요",
    "deliverables": "공정률, 원가, 변경, 리스크 KPI 대시보드",
    "target_axis": "착공",
    "gate_stage": "G4 착공/공사",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;LFC;공간솔루션실",
    "assignee": "미정",
    "external_party": "시공사/CM",
    "support_needed": "장기 KPI 설계",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-038",
    "project": "공통",
    "category_main": "준공/담보대출",
    "sector_detail": "준공 CP",
    "task_name": "준공/사용승인 CP 및 증빙자료 관리체계 수립",
    "task_purpose": "Take-out 대출 및 운영전환의 전제 조건",
    "deliverables": "준공 CP, 사용승인 증빙, 담보대출 요구자료 목록",
    "target_axis": "준공/운영",
    "gate_stage": "G5 준공",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "개발관리실",
    "coop_depts": "사업관리2파트;LFC",
    "assignee": "미정",
    "external_party": "관청;대주단",
    "support_needed": "장기 자료요건",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-039",
    "project": "공통",
    "category_main": "준공/담보대출",
    "sector_detail": "Take-out",
    "task_name": "준공 후 담보대출/Take-out 전략 수립",
    "task_purpose": "브릿지/PF 상환과 자산 안정화 전략의 최종 회수 단계",
    "deliverables": "Take-out 대출 전략, 담보가치, DSCR, 임대안정화 계획",
    "target_axis": "준공/운영",
    "gate_stage": "G6 담보대출/운영전환",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "LFC",
    "coop_depts": "사업관리2파트;기업마케팅실;개발관리실",
    "assignee": "미정",
    "external_party": "금융기관",
    "support_needed": "장기 금융전략",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-040",
    "project": "공통",
    "category_main": "준공/담보대출",
    "sector_detail": "운영전환",
    "task_name": "준공 후 운영·자산관리 전환계획 수립",
    "task_purpose": "준공 이후 임대운영, 호텔운영, 담보대출 관리 필요",
    "deliverables": "운영전환 체크리스트, 임대운영/호텔운영 업무분장",
    "target_axis": "준공/운영",
    "gate_stage": "G6 담보대출/운영전환",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "기업마케팅실;공간솔루션실;LFC",
    "assignee": "미정",
    "external_party": "운영사/임차인",
    "support_needed": "운영정책 필요",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  },
  {
    "id": "T-041",
    "project": "공통",
    "category_main": "팝업/단발",
    "sector_detail": "외부 보고 요청",
    "task_name": "갑작스러운 외부 보고자료 요청 접수",
    "task_purpose": "정규 업무 침식 여부 판단 필요",
    "deliverables": "요청 목적/기한/원 수행부서 확인 후 접수 또는 위임",
    "target_axis": "PF",
    "gate_stage": "G0 현황정리",
    "pmo_manager": "사업관리2파트",
    "lead_dept": "사업관리2파트",
    "coop_depts": "요청부서",
    "assignee": "미정",
    "external_party": "내부/외부 요청자",
    "support_needed": "목적·기한 확인",
    "is_blocker": false,
    "needs_decision": false,
    "due_date": "2026-12-31",
    "status": "진행중",
    "next_action": ""
  }
];

export default function PmoTaskBoardStaging() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDbMode, setIsDbMode] = useState(false);
    const [editingCell, setEditingCell] = useState(null); // { rowId, colName }
    const [tempValue, setTempValue] = useState('');

    async function fetchTasks() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .select(`
                    *,
                    lead_dept:iota_departments!lead_dept_code(dept_name),
                    external_party:iota_stakeholders!external_party_code(stakeholder_name)
                `)
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                setTasks(data);
                setIsDbMode(true);
            } else {
                setTasks(FALLBACK_BOARD_TASKS);
                setIsDbMode(false);
            }
        } catch (err) {
            console.error("Failed to fetch tasks from DB:", err);
            setTasks(FALLBACK_BOARD_TASKS);
            setIsDbMode(false);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDoubleClick = (rowId, colName, currentValue) => {
        setEditingCell({ rowId, colName });
        setTempValue(currentValue || '');
    };

    const handleSaveCell = async (rowId, colName, specificValue = null) => {
        const saveValue = specificValue !== null ? specificValue : tempValue;
        
        // Update state locally first for immediate feedback
        setTasks(prev => prev.map(t => t.id === rowId ? { ...t, [colName]: saveValue } : t));
        setEditingCell(null);

        if (isDbMode) {
            try {
                const { error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .update({ [colName]: saveValue })
                    .eq('id', rowId);

                if (error) throw error;
            } catch (err) {
                console.error("Failed to save cell to DB:", err);
            }
        }
    };

    return (
        <div className="w-full flex flex-col select-none mb-10">
            {/* Sub-Header */}
            <div className="flex justify-between items-center mb-[16px]">
                <h2 className="text-[20px] font-bold text-white tracking-tight shrink-0 flex items-center gap-2">
                    <span>통합 업무 보드</span>
                </h2>
                <button 
                    onClick={fetchTasks}
                    className="px-4 py-1.5 bg-[#272726] hover:bg-[#333] border border-[#3c3c3c] hover:border-[#555] rounded-full text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
                >
                    🔄 새로고침
                </button>
            </div>

            {loading ? (
                <div className="w-full h-[260px] flex items-center justify-center border border-[#333] rounded-[24px]">
                    <span className="text-[#86868B] text-[15px] animate-pulse">원장 정보를 불러오는 중입니다...</span>
                </div>
            ) : (
                <div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden mb-[40px] shadow-sm select-text">
                    <div className="w-full overflow-x-auto pr-0 timeline-scrollbar">
                        <div className="flex items-center min-w-[3200px]">
                            <table className="text-left table-fixed min-w-[2400px] flex-1 border-collapse bg-[#272726]">
                                <thead>
                                    <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-11 select-none">
                                        <th className="pl-4 text-center w-[80px] min-w-[80px] max-w-[80px]">ID</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px]">프로젝트</th>
                                        <th className="pl-4 w-[120px] min-w-[120px] max-w-[120px]">대분류</th>
                                        <th className="pl-4 w-[140px] min-w-[140px] max-w-[140px]">세부섹터</th>
                                        <th className="pl-4 w-[280px] min-w-[280px] max-w-[280px]">업무명 (더블클릭 편집)</th>
                                        <th className="pl-4 w-[280px] min-w-[280px] max-w-[280px]">업무목적 / PF·준공 영향 (더블클릭 편집)</th>
                                        <th className="pl-4 w-[220px] min-w-[220px] max-w-[220px]">필요 산출물 (더블클릭 편집)</th>
                                        <th className="pl-4 w-[110px] min-w-[110px] max-w-[110px]">최종 목표축</th>
                                        <th className="pl-4 w-[120px] min-w-[120px] max-w-[120px]">Gate</th>
                                        <th className="pl-4 w-[120px] min-w-[120px] max-w-[120px]">PMO총괄</th>
                                        <th className="pl-4 w-[130px] min-w-[130px] max-w-[130px]">실무 주관부서</th>
                                        <th className="pl-4 w-[180px] min-w-[180px] max-w-[180px]">협업부서</th>
                                        <th className="pl-4 w-[110px] min-w-[110px] max-w-[110px]">담당자 (더블클릭 편집)</th>
                                        <th className="pl-4 w-[140px] min-w-[140px] max-w-[140px]">외부상대방</th>
                                        <th className="pl-4 w-[180px] min-w-[180px] max-w-[180px]">지원필요</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#3c3c3c] text-[13px] text-white">
                                    {tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="15" className="text-center py-20 text-[#86868B]">
                                                등록된 통합 업무 보드 정보가 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        tasks.map((t, idx) => {
                                            const fallbackItem = FALLBACK_BOARD_TASKS.find(item => item.task_name === t.task_name) || {};
                                            
                                            // Data mapping
                                            const leadDeptName = t.lead_dept?.dept_name || t.lead_dept || t.lead_dept_code || fallbackItem.lead_dept || '';
                                            const coopDeptNames = t.coop_dept_codes || t.coop_depts || fallbackItem.coop_depts || '';
                                            const extPartyName = t.external_party?.stakeholder_name || t.external_party || t.external_party_code || fallbackItem.external_party || '';
                                            const targetAxis = t.target_axis || fallbackItem.target_axis || '준공/운영';
                                            const gateStageVal = t.gate_stage || fallbackItem.gate_stage || 'G0';
                                            const supportNeeded = t.support_needed || fallbackItem.support_needed || '';
                                            
                                            return (
                                                <tr key={t.id || `task-${idx}`} className="hover:bg-[#333]/50 transition-colors h-12">
                                                    {/* 1. ID */}
                                                    <td className="pl-4 text-center text-[#86868B] font-mono select-none w-[80px] min-w-[80px] max-w-[80px] truncate">
                                                        {t.id && !t.id.includes('-') ? t.id : (fallbackItem.id || `T-${String(idx+1).padStart(3, '0')}`)}
                                                    </td>
                                                    
                                                    {/* 2. 프로젝트 */}
                                                    <td className="pl-4 font-bold text-[#E5E5E5] w-[100px] min-w-[100px] max-w-[100px] truncate">
                                                        {t.project || t.project_code || fallbackItem.project || '공통'}
                                                    </td>
                                                    
                                                    {/* 3. 대분류 */}
                                                    <td className="pl-4 font-bold text-[#E5E5E5] w-[120px] min-w-[120px] max-w-[120px] truncate">
                                                        {t.category_main}
                                                    </td>
                                                    
                                                    {/* 4. 세부섹터 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[140px] min-w-[140px] max-w-[140px] truncate">
                                                        {t.sector_detail}
                                                    </td>
                                                    
                                                    {/* 5. 업무명 (더블클릭 편집) */}
                                                    <td 
                                                        className="pl-4 font-medium text-white cursor-pointer truncate w-[280px] min-w-[280px] max-w-[280px]"
                                                        onDoubleClick={() => handleDoubleClick(t.id, 'task_name', t.task_name)}
                                                    >
                                                        {editingCell?.rowId === t.id && editingCell?.colName === 'task_name' ? (
                                                            <input 
                                                                type="text" 
                                                                value={tempValue} 
                                                                onChange={e => setTempValue(e.target.value)}
                                                                onBlur={() => handleSaveCell(t.id, 'task_name')}
                                                                onKeyDown={e => e.key === 'Enter' && handleSaveCell(t.id, 'task_name')}
                                                                className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-2 py-0.5 text-white outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="hover:text-[#2997ff] transition-colors">{t.task_name}</span>
                                                        )}
                                                    </td>

                                                    {/* 6. 업무목적 / PF·준공 영향 (더블클릭 편집) */}
                                                    <td 
                                                        className="pl-4 text-[#A1A1AA] cursor-pointer truncate w-[280px] min-w-[280px] max-w-[280px]"
                                                        onDoubleClick={() => handleDoubleClick(t.id, 'task_purpose', t.task_purpose || fallbackItem.task_purpose)}
                                                    >
                                                        {editingCell?.rowId === t.id && editingCell?.colName === 'task_purpose' ? (
                                                            <input 
                                                                type="text" 
                                                                value={tempValue} 
                                                                onChange={e => setTempValue(e.target.value)}
                                                                onBlur={() => handleSaveCell(t.id, 'task_purpose')}
                                                                onKeyDown={e => e.key === 'Enter' && handleSaveCell(t.id, 'task_purpose')}
                                                                className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-2 py-0.5 text-white outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="hover:text-[#2997ff] transition-colors">{t.task_purpose || fallbackItem.task_purpose || '-'}</span>
                                                        )}
                                                    </td>

                                                    {/* 7. 필요 산출물 (더블클릭 편집) */}
                                                    <td 
                                                        className="pl-4 text-[#A1A1AA] cursor-pointer truncate w-[220px] min-w-[220px] max-w-[220px]"
                                                        onDoubleClick={() => handleDoubleClick(t.id, 'deliverables', t.deliverables || fallbackItem.deliverables)}
                                                    >
                                                        {editingCell?.rowId === t.id && editingCell?.colName === 'deliverables' ? (
                                                            <input 
                                                                type="text" 
                                                                value={tempValue} 
                                                                onChange={e => setTempValue(e.target.value)}
                                                                onBlur={() => handleSaveCell(t.id, 'deliverables')}
                                                                onKeyDown={e => e.key === 'Enter' && handleSaveCell(t.id, 'deliverables')}
                                                                className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-2 py-0.5 text-white outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="hover:text-[#2997ff] transition-colors">{t.deliverables || fallbackItem.deliverables || '-'}</span>
                                                        )}
                                                    </td>

                                                    {/* 8. 최종 목표축 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[110px] min-w-[110px] max-w-[110px] truncate">{targetAxis}</td>

                                                    {/* 9. Gate */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[120px] min-w-[120px] max-w-[120px] truncate">{gateStageVal}</td>

                                                    {/* 10. PMO총괄 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[120px] min-w-[120px] max-w-[120px] truncate">{t.pmo_manager || fallbackItem.pmo_manager || '사업관리2파트'}</td>

                                                    {/* 11. 실무 주관부서 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[130px] min-w-[130px] max-w-[130px] truncate">{leadDeptName || '-'}</td>

                                                    {/* 12. 협업부서 */}
                                                    <td className="pl-4 text-[#86868B] w-[180px] min-w-[180px] max-w-[180px] truncate">{coopDeptNames || '-'}</td>

                                                    {/* 13. 담당자 (더블클릭 편집) */}
                                                    <td 
                                                        className="pl-4 text-[#A1A1AA] cursor-pointer w-[110px] min-w-[110px] max-w-[110px]"
                                                        onDoubleClick={() => handleDoubleClick(t.id, 'assignee', t.assignee)}
                                                    >
                                                        {editingCell?.rowId === t.id && editingCell?.colName === 'assignee' ? (
                                                            <input 
                                                                type="text" 
                                                                value={tempValue} 
                                                                onChange={e => setTempValue(e.target.value)}
                                                                onBlur={() => handleSaveCell(t.id, 'assignee')}
                                                                className="w-[90%] bg-[#1a1a1a] border border-[#2997ff] rounded px-2 py-0.5 text-white outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="hover:text-[#2997ff] transition-colors">{t.assignee || '-'}</span>
                                                        )}
                                                    </td>

                                                    {/* 14. 외부상대방 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[140px] min-w-[140px] max-w-[140px] truncate">{extPartyName || '-'}</td>

                                                    {/* 15. 지원필요 */}
                                                    <td className="pl-4 text-[#86868B] w-[180px] min-w-[180px] max-w-[180px] truncate">{supportNeeded || '-'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                            
                            {/* Watermark Logo */}
                            <div className="w-[800px] shrink-0 flex items-center justify-start pl-20 pr-8 select-none pointer-events-none box-border">
                                <div className="text-white opacity-[0.04] font-bold leading-[0.9] tracking-tighter w-full whitespace-nowrap" style={{ fontSize: 'clamp(45px, 8.5vw, 135px)' }}>
                                    IOTA Seoul<br />Cross Functional<br />Team
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
