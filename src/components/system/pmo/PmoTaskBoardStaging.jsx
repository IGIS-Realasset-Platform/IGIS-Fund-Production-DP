import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../context/AuthContext';

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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-07-03",
    "status": "진행중",
    "importance_level": "준공필수",
    "task_type": "정규",
    "next_action": "회의체 운영원칙 확정 후 부서 배포",
    "priority_score": 70,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "준공필수 / 의사결정 / 지원:부서별 담당자 입력",
    "sort_key": 70.0997,
    "notes": "사업관리2파트가 PMO"
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-07-03",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "회의에서 점수 기준 합의",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:파트장 확인",
    "sort_key": 65.0996,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-15",
    "status": "지연",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "리츠칼튼 우선협상권 및 소노 협약 충돌 가능성 정리 , 소노 단독 액션플랜 정리",
    "priority_score": 105,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:호텔 담당/법무 검토 / 지연",
    "sort_key": 105.0995,
    "notes": "핵심 Blocker"
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "미착수",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "계약 유형별 대주단 수용성 확인",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:외부 법무 검토",
    "sort_key": 65.0994,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "미착수",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "브랜드 후보로부터 기준자료 수령",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:운영자료 필요",
    "sort_key": 45.0993,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-19",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "협약 시나리오정리/인허관청 미팅 논의",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:관청 협의 결과",
    "sort_key": 90.0992,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-26",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "소공원로 관련 도면 및 협의주체 확인",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:도면·관청의견 필요",
    "sort_key": 90.0991,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "주거전환 시 인허가 변경기간 및 조건 산정",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:인허가/설계 검토",
    "sort_key": 65.099,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "미착수",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "호텔 프로그램 확정 이후 필요 변경범위 확인",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:인허가 판단",
    "sort_key": 45.0989,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-09-30",
    "status": "미착수",
    "importance_level": "준공필수",
    "task_type": "정규",
    "next_action": "PF 이후 공사·준공 CP로 연결",
    "priority_score": 50,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "준공필수 / 지원:장기 일정 입력",
    "sort_key": 50.0988,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "현대건설과 도급/신용공여 핵심 조건 테이블화",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:시공사 Term 회신",
    "sort_key": 65.0987,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "삼성물산의 주주/시공사 이중 지위 고려해 협상안 작성",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:삼성 조건 회신",
    "sort_key": 90.0986,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "공사비 상승 근거와 절감 가능항목 분리",
    "priority_score": 70,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 지원:견적 상세내역",
    "sort_key": 70.0985,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-09-15",
    "status": "미착수",
    "importance_level": "준공필수",
    "task_type": "정규",
    "next_action": "PF Term과 착공 조건 연결",
    "priority_score": 50,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "준공필수 / 지원:시공사 공정표",
    "sort_key": 50.0984,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-26",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "427/816 공통 기준도면 양식 확정",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:도면 기준 정리",
    "sort_key": 90.0983,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "임차 제안서와 모델 입력값 일치 확인",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:도면/면적자료",
    "sort_key": 45.0982,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "미착수",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "브랜드 후보별 프로그램 요구사항 수령",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:브랜드 기준자료",
    "sort_key": 45.0981,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "임차 제안서와 비용모델 연동",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:TI 시장자료",
    "sort_key": 45.098,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-08-31",
    "status": "미착수",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "브랜드 결정 후 Cost Book 작성",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:브랜드 기준자료",
    "sort_key": 45.0979,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "임차인별 니즈를 도면·조건에 반영",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:임차인 요구사항",
    "sort_key": 45.0978,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-19",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "임차 조건과 PF 반영 가능성 확인",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:임차조건 회신",
    "sort_key": 90.0977,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "금융권 임차 후보 우선순위화",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:임차 후보 접촉",
    "sort_key": 45.0976,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "816 선임차 유지 vs 427 이전 비교",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:내부/삼성 협의",
    "sort_key": 90.0975,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "임차조건 산식 단순화 및 내부 기준화",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:시장자료",
    "sort_key": 45.0974,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "단독 PF 가능/불가 조건을 수치화",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:Term Sheet 필요",
    "sort_key": 90.0973,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "단독 vs 통합 의사결정용 비교표 작성",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:금융/법무 검토",
    "sort_key": 90.0972,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "각 부서 입력값 마감일 설정",
    "priority_score": 70,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 지원:업데이트 입력값",
    "sort_key": 70.0971,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-08-15",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "단독 PF 시 비용절감 논리 재검증",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:삼성 조건 확정",
    "sort_key": 65.097,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-08-31",
    "status": "미착수",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "부서별 CP owner 지정",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:각 부서 산출물",
    "sort_key": 65.0969,
    "notes": null
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
    "is_blocker": "Y",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "기본안 유지/폐기/보류 판단",
    "priority_score": 90,
    "meeting_grade": "A_즉시상정",
    "agenda_reason": "PF필수 / Blocker / 의사결정 / 지원:외부 자문",
    "sort_key": 90.0968,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-07-31",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "구조별 의사결정 기준 명확화",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:자문결과 필요",
    "sort_key": 65.0967,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-08-15",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "구조전환 시 수익자 동의/통지 필요성 확인",
    "priority_score": 45,
    "meeting_grade": "C_주간관리",
    "agenda_reason": "PF필수 / 지원:펀드자료 확인",
    "sort_key": 45.0966,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-08-15",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "주주별 이해관계와 설득논리 정리",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:주주 구조 확인",
    "sort_key": 65.0965,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-07-12",
    "status": "진행중",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "회의 전 부서별 산출물 마감 설정",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:회의 일정 확정",
    "sort_key": 65.0964,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "Y",
    "due_date": "2026-08-31",
    "status": "미착수",
    "importance_level": "PF필수",
    "task_type": "정규",
    "next_action": "보고자료와 내부 의사결정안 분리",
    "priority_score": 65,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "PF필수 / 의사결정 / 지원:숫자/법무 검토",
    "sort_key": 65.0963,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-07-05",
    "status": "진행중",
    "importance_level": "중요",
    "task_type": "정규",
    "next_action": "주간 업데이트 루틴 확정",
    "priority_score": 15,
    "meeting_grade": "D_대기",
    "agenda_reason": "지원:부서별 피드백",
    "sort_key": 15.0962,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-10-31",
    "status": "미착수",
    "importance_level": "준공필수",
    "task_type": "정규",
    "next_action": "PF CP 이후 공사관리 체계로 전환",
    "priority_score": 50,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "준공필수 / 지원:장기 KPI 설계",
    "sort_key": 50.0961,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2027-03-31",
    "status": "미착수",
    "importance_level": "준공필수",
    "task_type": "정규",
    "next_action": "장기 과제로 별도 로드맵 관리",
    "priority_score": 50,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "준공필수 / 지원:장기 자료요건",
    "sort_key": 50.096,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2027-03-31",
    "status": "미착수",
    "importance_level": "준공필수",
    "task_type": "정규",
    "next_action": "PF 조건과 준공 후 담보대출 연결",
    "priority_score": 50,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "준공필수 / 지원:장기 금융전략",
    "sort_key": 50.0959,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2027-03-31",
    "status": "미착수",
    "importance_level": "준공필수",
    "task_type": "정규",
    "next_action": "장기 과제로 초기부터 관리",
    "priority_score": 50,
    "meeting_grade": "B_회의점검",
    "agenda_reason": "준공필수 / 지원:운영정책 필요",
    "sort_key": 50.0958,
    "notes": null
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
    "is_blocker": "N",
    "needs_decision": "N",
    "due_date": "2026-07-05",
    "status": "미착수",
    "importance_level": "중요",
    "task_type": "팝업",
    "next_action": "팝업요청관리 시트로 이관",
    "priority_score": 20,
    "meeting_grade": "D_대기",
    "agenda_reason": "지원:목적·기한 확인 / 팝업",
    "sort_key": 20.0957,
    "notes": "샘플"
  }
];

export default function PmoTaskBoardStaging() {
    const { memberInfo } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDbMode, setIsDbMode] = useState(false);

    // Masters loaded from DB
    const [projects, setProjects] = useState([
        { project_code: 'IOTA_SEOUL', project_name: '이오타 서울' },
        { project_code: 'PFV_427', project_name: '427 PFV' },
        { project_code: 'FUND_421', project_name: '421 펀드' }
    ]);
    const [departments, setDepartments] = useState([
        { dept_code: 'DEPT_PM2', dept_name: '사업관리2파트' },
        { dept_code: 'DEPT_LFC', dept_name: 'LFC(금융)' },
        { dept_code: 'DEPT_DEV', dept_name: '개발관리실' },
        { dept_code: 'DEPT_DESIGN', dept_name: '설계실' },
        { dept_code: 'DEPT_MKT', dept_name: '마케팅팀' }
    ]);
    const [stakeholders, setStakeholders] = useState([
        { stakeholder_code: 'SH_LP_01', stakeholder_name: '이지스자산운용' },
        { stakeholder_code: 'SH_DEV_01', stakeholder_name: '이오타시행사' },
        { stakeholder_code: 'SH_CON_01', stakeholder_name: '이지스건설' },
        { stakeholder_code: 'SH_FIN_01', stakeholder_name: '한국대주은행' }
    ]);
    const [masterStakeholders, setMasterStakeholders] = useState([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAuthInfoModal, setShowAuthInfoModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Suggestions panels
    const [showSubsectorSuggestions, setShowSubsectorSuggestions] = useState(false);
    const [showStakeholderSuggestions, setShowStakeholderSuggestions] = useState(false);

    // Form states
    const [formProject, setFormProject] = useState('IOTA_SEOUL');
    const [formCategoryMain, setFormCategoryMain] = useState('');
    const [formSectorDetail, setFormSectorDetail] = useState('');
    const [formTaskName, setFormTaskName] = useState('');
    const [formTaskPurpose, setFormTaskPurpose] = useState('');
    const [formDeliverables, setFormDeliverables] = useState('');
    const [formTargetAxis, setFormTargetAxis] = useState('준공/운영');
    const [formGateStage, setFormGateStage] = useState('G0');
    const [formPmoManager, setFormPmoManager] = useState('사업관리2파트');
    const [formLeadDept, setFormLeadDept] = useState('사업관리2파트');
    const [formCoopDepts, setFormCoopDepts] = useState('');
    const [formAssignee, setFormAssignee] = useState('');
    const [formExternalParty, setFormExternalParty] = useState('');
    const [formSupportNeeded, setFormSupportNeeded] = useState('');
    const [formIsBlocker, setFormIsBlocker] = useState(false);
    const [formNeedsDecision, setFormNeedsDecision] = useState(false);
    const [formDueDate, setFormDueDate] = useState('');
    const [formStatus, setFormStatus] = useState('진행중');
    const [formImportanceLevel, setFormImportanceLevel] = useState('일반');
    const [formTaskType, setFormTaskType] = useState('정규');
    const [formNextAction, setFormNextAction] = useState('');
    const [formPriorityScore, setFormPriorityScore] = useState(0);
    const [formMeetingGrade, setFormMeetingGrade] = useState('B');
    const [formAgendaReason, setFormAgendaReason] = useState('');
    const [formSortKey, setFormSortKey] = useState('');
    const [formNotes, setFormNotes] = useState('');

    // Authority memo
    const isAuthorized = useMemo(() => {
        if (!memberInfo) return false;
        const org = memberInfo.org_name || '';
        const workspace = memberInfo.workspace_code || '';
        const role = memberInfo.role_code || '';
        return (
            org.includes('사업관리2파트') || 
            org.includes('기획추진') ||
            org.includes('시스템 관리자(기획추진)') ||
            role.toUpperCase().includes('PO') ||
            workspace === 'WS_PM' ||
            role === 'master' ||
            role === 'director'
        );
    }, [memberInfo]);

    // Unique arrays for Autocomplete Suggestions
    const uniqueSubsectors = useMemo(() => {
        const defaultSubs = [
            '업무관리 체계', '현금기부채납', '소공원로', '변경인가', '사용승인', '브랜드', '계약구조',
            '운영수지/FF&E', '현대건설', '삼성물산', '공사비/VE', 'PF 기준도면', '면적표',
            '오피스 TI', '호텔 인테리어', '광장', 'KB/금융권', '삼성/이지스', '단독 PF',
            '통합 PF', '재무모델', '리츠 전환', 'Asset/Share/합병', '의사결정', 'Take-out'
        ];
        const subs = [
            ...defaultSubs,
            ...tasks.map(item => item.sector_detail).filter(Boolean)
        ];
        return Array.from(new Set(subs));
    }, [tasks]);

    const uniqueStakeholderNames = useMemo(() => {
        const names = [
            ...stakeholders.map(s => s.stakeholder_name),
            ...masterStakeholders.map(s => s.company_name)
        ];
        return Array.from(new Set(names.filter(Boolean)));
    }, [stakeholders, masterStakeholders]);

    async function fetchTasks() {
        try {
            setLoading(true);
            
            // Load base projects
            try {
                const { data: projData } = await supabase
                    .schema('iota_v2')
                    .from('iota_projects')
                    .select('*');
                if (projData && projData.length > 0) setProjects(projData);
            } catch (e) {
                console.warn("Projects load failed, using defaults:", e);
            }

            // Load departments
            try {
                const { data: deptData } = await supabase
                    .schema('iota_v2')
                    .from('iota_departments')
                    .select('*');
                if (deptData && deptData.length > 0) setDepartments(deptData);
            } catch (e) {
                console.warn("Departments load failed, using defaults:", e);
            }

            // Load iota_v2 stakeholders
            try {
                const { data: stakeData } = await supabase
                    .schema('iota_v2')
                    .from('iota_stakeholders')
                    .select('*');
                if (stakeData && stakeData.length > 0) setStakeholders(stakeData);
            } catch (e) {
                console.warn("iota_v2 stakeholders load failed, using defaults:", e);
            }

            // Load master public stakeholders
            try {
                const { data: shData } = await supabase
                    .from('iota_stakeholder_master')
                    .select('*');
                if (shData) setMasterStakeholders(shData);
            } catch (e) {
                console.warn("master stakeholders load failed:", e);
            }

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

    // Department code resolver & on-the-fly register
    async function resolveDeptCode(deptName) {
        if (!deptName) return null;
        let dept = departments.find(d => d.dept_name === deptName);
        if (!dept) {
            const code = `DEPT_${Date.now()}`;
            if (isDbMode) {
                try {
                    const { data, error } = await supabase
                        .schema('iota_v2')
                        .from('iota_departments')
                        .insert({ dept_code: code, dept_name: deptName })
                        .select()
                        .single();
                    if (!error && data) {
                        setDepartments(prev => [...prev, data]);
                        return code;
                    }
                } catch (err) {
                    console.error("Failed to insert department on-the-fly:", err);
                }
            }
            return null;
        }
        return dept.dept_code;
    }

    // Stakeholder code resolver & on-the-fly register
    async function resolveStakeholderCode(stakeholderName) {
        if (!stakeholderName) return null;
        let stake = stakeholders.find(s => s.stakeholder_name === stakeholderName);
        if (!stake) {
            const code = `SH_AUTO_${Date.now()}`;
            if (isDbMode) {
                try {
                    // Register in iota_v2.iota_stakeholders
                    const { data, error } = await supabase
                        .schema('iota_v2')
                        .from('iota_stakeholders')
                        .insert({ stakeholder_code: code, stakeholder_name: stakeholderName, category: '기타' })
                        .select()
                        .single();
                    
                    // Register in public.iota_stakeholder_master
                    await supabase
                        .from('iota_stakeholder_master')
                        .insert({ company_name: stakeholderName, role_category: '기타' });
                        
                    if (!error && data) {
                        setStakeholders(prev => [...prev, data]);
                        return code;
                    }
                } catch (err) {
                    console.error("Failed to insert stakeholder on-the-fly:", err);
                }
            }
            return null;
        }
        return stake.stakeholder_code;
    }

    const handleAddNewClick = () => {
        setEditingItem(null);
        setFormProject(projects[0]?.project_code || 'IOTA_SEOUL');
        setFormCategoryMain('');
        setFormSectorDetail('');
        setFormTaskName('');
        setFormTaskPurpose('');
        setFormDeliverables('');
        setFormTargetAxis('준공/운영');
        setFormGateStage('G0');
        setFormPmoManager('사업관리2파트');
        setFormLeadDept(departments[0]?.dept_name || '사업관리2파트');
        setFormCoopDepts('');
        setFormAssignee('');
        setFormExternalParty('');
        setFormSupportNeeded('');
        setFormIsBlocker(false);
        setFormNeedsDecision(false);
        setFormDueDate('');
        setFormStatus('진행중');
        setFormImportanceLevel('일반');
        setFormTaskType('정규');
        setFormNextAction('');
        setFormPriorityScore(0);
        setFormMeetingGrade('B');
        setFormAgendaReason('');
        setFormSortKey('');
        setFormNotes('');
        setIsModalOpen(true);
    };

    const handleEditClick = (item) => {
        const fallbackItem = FALLBACK_BOARD_TASKS.find(fallback => fallback.task_name === item.task_name) || {};
        
        setEditingItem(item);
        setFormProject(item.project_code || item.project || fallbackItem.project || 'IOTA_SEOUL');
        setFormCategoryMain(item.category_main || '');
        setFormSectorDetail(item.sector_detail || '');
        setFormTaskName(item.task_name || '');
        setFormTaskPurpose(item.task_purpose || fallbackItem.task_purpose || '');
        setFormDeliverables(item.deliverables || fallbackItem.deliverables || '');
        setFormTargetAxis(item.target_axis || fallbackItem.target_axis || '준공/운영');
        setFormGateStage(item.gate_stage || fallbackItem.gate_stage || 'G0');
        setFormPmoManager(item.pmo_manager || fallbackItem.pmo_manager || '사업관리2파트');
        setFormLeadDept(item.lead_dept?.dept_name || item.lead_dept || item.lead_dept_code || fallbackItem.lead_dept || '사업관리2파트');
        setFormCoopDepts(item.coop_dept_codes || item.coop_depts || fallbackItem.coop_depts || '');
        setFormAssignee(item.assignee || '');
        setFormExternalParty(item.external_party?.stakeholder_name || item.external_party || item.external_party_code || fallbackItem.external_party || '');
        setFormSupportNeeded(item.support_needed || fallbackItem.support_needed || '');
        setFormIsBlocker(item.is_blocker !== undefined ? item.is_blocker : fallbackItem.is_blocker);
        setFormNeedsDecision(item.needs_decision !== undefined ? item.needs_decision : fallbackItem.needs_decision);
        setFormDueDate(item.due_date || fallbackItem.due_date || '');
        setFormStatus(item.status || fallbackItem.status || '진행중');
        setFormImportanceLevel(item.importance_level || fallbackItem.importance_level || '일반');
        setFormTaskType(item.task_type || fallbackItem.task_type || '정규');
        setFormNextAction(item.next_action || fallbackItem.next_action || '');
        setFormPriorityScore(item.priority_score !== undefined ? item.priority_score : (fallbackItem.priority_score || 0));
        setFormMeetingGrade(item.meeting_grade || fallbackItem.meeting_grade || 'B');
        setFormAgendaReason(item.agenda_reason || fallbackItem.agenda_reason || '');
        setFormSortKey(item.sort_key || fallbackItem.sort_key || '');
        setFormNotes(item.notes || fallbackItem.notes || '');
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (rowId) => {
        if (!window.confirm("정말로 이 업무를 삭제하시겠습니까?")) return;

        setTasks(prev => prev.filter(t => t.id !== rowId));

        if (isDbMode) {
            try {
                const { error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .delete()
                    .eq('id', rowId);

                if (error) throw error;
            } catch (err) {
                console.error("Failed to delete task from DB:", err);
                alert("DB 삭제에 실패했습니다.");
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Resolve FK codes
        const resolvedLeadDeptCode = await resolveDeptCode(formLeadDept);
        const resolvedExtPartyCode = await resolveStakeholderCode(formExternalParty);

        const updatedData = {
            project_code: formProject,
            category_main: formCategoryMain,
            sector_detail: formSectorDetail,
            task_name: formTaskName,
            task_purpose: formTaskPurpose,
            deliverables: formDeliverables,
            gate_stage: formGateStage,
            pmo_manager: formPmoManager,
            lead_dept_code: resolvedLeadDeptCode,
            coop_dept_codes: formCoopDepts,
            assignee: formAssignee,
            external_party_code: resolvedExtPartyCode,
            is_blocker: formIsBlocker,
            needs_decision: formNeedsDecision,
            due_date: formDueDate || null,
            status: formStatus,
            priority_score: formPriorityScore,
            meeting_grade: formMeetingGrade,
            next_action: formNextAction
        };

        const localMapping = {
            ...updatedData,
            project: projects.find(p => p.project_code === formProject)?.project_name || formProject,
            lead_dept: { dept_name: formLeadDept },
            external_party: { stakeholder_name: formExternalParty },
            target_axis: formTargetAxis,
            support_needed: formSupportNeeded,
            importance_level: formImportanceLevel,
            task_type: formTaskType,
            agenda_reason: formAgendaReason,
            sort_key: formSortKey,
            notes: formNotes
        };

        if (editingItem) {
            // EDITING
            setTasks(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...localMapping } : t));

            if (isDbMode) {
                try {
                    const { error } = await supabase
                        .schema('iota_v2')
                        .from('iota_pmo_tasks')
                        .update(updatedData)
                        .eq('id', editingItem.id);

                    if (error) throw error;
                } catch (err) {
                    console.error("Failed to update task in DB:", err);
                }
            }
        } else {
            // ADDING
            const newId = `mock-${Date.now()}`;
            const newItem = { id: newId, ...localMapping };

            setTasks(prev => [...prev, newItem]);

            if (isDbMode) {
                try {
                    const { error } = await supabase
                        .schema('iota_v2')
                        .from('iota_pmo_tasks')
                        .insert([updatedData]);

                    if (error) throw error;
                    fetchTasks(); // Reload to fetch correct DB rows
                } catch (err) {
                    console.error("Failed to insert task in DB:", err);
                }
            }
        }

        setIsModalOpen(false);
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
                        <div className="flex items-center min-w-[4725px]">
                            <table className="text-left table-fixed min-w-[3925px] flex-1 border-collapse bg-[#272726]">
                                <thead>
                                    <tr className="border-b border-[#3c3c3c] bg-transparent text-[#86868B] font-bold text-[13px] h-11 select-none">
                                        <th className="pl-4 text-center w-[80px] min-w-[80px] max-w-[80px]">ID</th>
                                        <th className="pl-4 w-[90px] min-w-[90px] max-w-[90px]">프로젝트</th>
                                        <th className="pl-4 w-[110px] min-w-[110px] max-w-[110px]">대분류</th>
                                        <th className="pl-4 w-[120px] min-w-[120px] max-w-[120px]">세부섹터</th>
                                        <th className="pl-4 w-[280px] min-w-[280px] max-w-[280px]">업무명</th>
                                        <th className="pl-4 w-[280px] min-w-[280px] max-w-[280px]">업무목적 / PF·준공 영향</th>
                                        <th className="pl-4 w-[220px] min-w-[220px] max-w-[220px]">필요 산출물</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px]">최종 목표축</th>
                                        <th className="pl-4 w-[110px] min-w-[110px] max-w-[110px]">Gate</th>
                                        <th className="pl-4 w-[110px] min-w-[110px] max-w-[110px]">PMO총괄</th>
                                        <th className="pl-4 w-[120px] min-w-[120px] max-w-[120px]">실무 주관부서</th>
                                        <th className="pl-4 w-[180px] min-w-[180px] max-w-[180px]">협업부서</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px]">담당자</th>
                                        <th className="pl-4 w-[120px] min-w-[120px] max-w-[120px]">외부상대방</th>
                                        <th className="pl-4 w-[180px] min-w-[180px] max-w-[180px]">지원필요</th>
                                        <th className="pl-4 w-[85px] min-w-[85px] max-w-[85px] text-center">Blocker</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px] text-center">의사결정필요</th>
                                        <th className="pl-4 w-[120px] min-w-[120px] max-w-[120px]">기한</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px] text-center">상태</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px] text-center">중요도</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px] text-center">업무유형</th>
                                        <th className="pl-4 w-[200px] min-w-[200px] max-w-[200px]">다음 액션</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px] text-center">우선순위점수</th>
                                        <th className="pl-4 w-[110px] min-w-[110px] max-w-[110px] text-center">회의상정등급</th>
                                        <th className="pl-4 w-[180px] min-w-[180px] max-w-[180px]">상정사유</th>
                                        <th className="pl-4 w-[100px] min-w-[100px] max-w-[100px] text-center">정렬키</th>
                                        <th className="pl-4 w-[180px] min-w-[180px] max-w-[180px]">비고</th>
                                        <th className="px-2 text-center w-[85px] min-w-[85px] max-w-[85px] border-r border-[#3c3c3c]">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#3c3c3c] text-[13px] text-white">
                                    {tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="28" className="text-center py-20 text-[#86868B]">
                                                등록된 통합 업무 보드 정보가 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        tasks.map((t, idx) => {
                                            const fallbackItem = FALLBACK_BOARD_TASKS.find(item => item.task_name === t.task_name) || {};
                                            
                                            // Project mapping
                                            const projObj = projects.find(p => p.project_code === t.project_code);
                                            const projectVal = projObj ? projObj.project_name : (t.project || fallbackItem.project || '공통');

                                            // Data mapping
                                            const leadDeptName = t.lead_dept?.dept_name || t.lead_dept || t.lead_dept_code || fallbackItem.lead_dept || '';
                                            const coopDeptNames = t.coop_dept_codes || t.coop_depts || fallbackItem.coop_depts || '';
                                            const extPartyName = t.external_party?.stakeholder_name || t.external_party || t.external_party_code || fallbackItem.external_party || '';
                                            const targetAxis = t.target_axis || fallbackItem.target_axis || '준공/운영';
                                            const gateStageVal = t.gate_stage || fallbackItem.gate_stage || 'G0';
                                            const supportNeeded = t.support_needed || fallbackItem.support_needed || '';
                                            const isBlockerVal = t.is_blocker !== undefined ? t.is_blocker : fallbackItem.is_blocker;
                                            const needsDecisionVal = t.needs_decision !== undefined ? t.needs_decision : fallbackItem.needs_decision;
                                            const dueDateVal = t.due_date || fallbackItem.due_date || '';
                                            const statusVal = t.status || fallbackItem.status || '진행중';
                                            const importanceLevel = t.importance_level || fallbackItem.importance_level || '일반';
                                            const taskType = t.task_type || fallbackItem.task_type || '정규';
                                            const nextActionVal = t.next_action || fallbackItem.next_action || '';
                                            const priorityScore = t.priority_score !== undefined ? t.priority_score : (fallbackItem.priority_score || 0);
                                            const meetingGrade = t.meeting_grade || fallbackItem.meeting_grade || 'B';
                                            const agendaReason = t.agenda_reason || fallbackItem.agenda_reason || '';
                                            const sortKeyVal = t.sort_key || fallbackItem.sort_key || '';
                                            const notesVal = t.notes || fallbackItem.notes || '';
                                            
                                            return (
                                                <tr key={t.id || `task-${idx}`} className="hover:bg-[#333]/50 transition-colors h-12">
                                                    {/* 1. ID */}
                                                    <td className="pl-4 text-center text-[#86868B] font-mono select-none w-[80px] min-w-[80px] max-w-[80px] truncate">
                                                        {t.id && !t.id.includes('-') ? t.id : (fallbackItem.id || `T-${String(idx+1).padStart(3, '0')}`)}
                                                    </td>
                                                    
                                                    {/* 2. 프로젝트 */}
                                                    <td className="pl-4 font-bold text-[#E5E5E5] w-[90px] min-w-[90px] max-w-[90px] truncate">
                                                        {projectVal}
                                                    </td>
                                                    
                                                    {/* 3. 대분류 */}
                                                    <td className="pl-4 font-bold text-[#E5E5E5] w-[110px] min-w-[110px] max-w-[110px] truncate">
                                                        {t.category_main}
                                                    </td>
                                                    
                                                    {/* 4. 세부섹터 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[120px] min-w-[120px] max-w-[120px] truncate">
                                                        {t.sector_detail}
                                                    </td>
                                                    
                                                    {/* 5. 업무명 */}
                                                    <td className="pl-4 font-medium text-white truncate w-[280px] min-w-[280px] max-w-[280px]">
                                                        {t.task_name}
                                                    </td>

                                                    {/* 6. 업무목적 / PF·준공 영향 */}
                                                    <td className="pl-4 text-[#A1A1AA] truncate w-[280px] min-w-[280px] max-w-[280px]">
                                                        {t.task_purpose || fallbackItem.task_purpose || '-'}
                                                    </td>

                                                    {/* 7. 필요 산출물 */}
                                                    <td className="pl-4 text-[#A1A1AA] truncate w-[220px] min-w-[220px] max-w-[220px]">
                                                        {t.deliverables || fallbackItem.deliverables || '-'}
                                                    </td>

                                                    {/* 8. 최종 목표축 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[100px] min-w-[100px] max-w-[100px] truncate">{targetAxis}</td>

                                                    {/* 9. Gate */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[110px] min-w-[110px] max-w-[110px] truncate">{gateStageVal}</td>

                                                    {/* 10. PMO총괄 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[110px] min-w-[110px] max-w-[110px] truncate">{t.pmo_manager || fallbackItem.pmo_manager || '사업관리2파트'}</td>

                                                    {/* 11. 실무 주관부서 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[120px] min-w-[120px] max-w-[120px] truncate">{leadDeptName || '-'}</td>

                                                    {/* 12. 협업부서 */}
                                                    <td className="pl-4 text-[#86868B] w-[180px] min-w-[180px] max-w-[180px] truncate">{coopDeptNames || '-'}</td>

                                                    {/* 13. 담당자 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[100px] min-w-[100px] max-w-[100px] truncate">{t.assignee || '-'}</td>

                                                    {/* 14. 외부상대방 */}
                                                    <td className="pl-4 text-[#A1A1AA] w-[120px] min-w-[120px] max-w-[120px] truncate">{extPartyName || '-'}</td>

                                                    {/* 15. 지원필요 */}
                                                    <td className="pl-4 text-[#86868B] w-[180px] min-w-[180px] max-w-[180px] truncate">{supportNeeded || '-'}</td>

                                                    {/* 16. Blocker */}
                                                    <td className="pl-4 text-center w-[85px] min-w-[85px] max-w-[85px]">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                            isBlockerVal ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-gray-500'
                                                        }`}>
                                                            {isBlockerVal ? 'Y' : 'N'}
                                                        </span>
                                                    </td>

                                                    {/* 17. 의사결정필요 */}
                                                    <td className="pl-4 text-center w-[100px] min-w-[100px] max-w-[100px]">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                            needsDecisionVal ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-gray-500'
                                                        }`}>
                                                            {needsDecisionVal ? 'Y' : 'N'}
                                                        </span>
                                                    </td>

                                                    {/* 18. 기한 */}
                                                    <td className="pl-4 text-[#A1A1AA] font-mono w-[120px] min-w-[120px] max-w-[120px] truncate">{dueDateVal || '-'}</td>

                                                    {/* 19. 상태 */}
                                                    <td className="pl-4 text-center w-[100px] min-w-[100px] max-w-[100px]">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                            statusVal === '완료' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                            statusVal === '진행중' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                            statusVal === '지연' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                        }`}>
                                                            {statusVal}
                                                        </span>
                                                    </td>

                                                    {/* 20. 중요도 */}
                                                    <td className="pl-4 text-center w-[100px] min-w-[100px] max-w-[100px] truncate">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                            importanceLevel === 'PF필수' 
                                                                ? 'bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/25' 
                                                                : importanceLevel === '준공필수'
                                                                    ? 'bg-[#ff9f0a]/15 text-[#ff9f0a] border border-[#ff9f0a]/25'
                                                                    : 'bg-[#86868B]/15 text-[#86868B] border border-[#86868B]/25'
                                                        }`}>
                                                            {importanceLevel}
                                                        </span>
                                                    </td>

                                                    {/* 21. 업무유형 */}
                                                    <td className="pl-4 text-center w-[100px] min-w-[100px] max-w-[100px] truncate">
                                                        <span className="text-[#86868B] font-medium">{taskType}</span>
                                                    </td>

                                                    {/* 22. 다음 액션 */}
                                                    <td className="pl-4 text-[#A1A1AA] truncate w-[200px] min-w-[200px] max-w-[200px]">{nextActionVal || '-'}</td>

                                                    {/* 23. 우선순위점수 */}
                                                    <td className="pl-4 text-center font-mono w-[100px] min-w-[100px] max-w-[100px] font-bold text-[#E5E5E5]">{priorityScore}</td>

                                                    {/* 24. 회의상정등급 */}
                                                    <td className="pl-4 text-center w-[110px] min-w-[110px] max-w-[110px] truncate">
                                                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                                            meetingGrade === 'A' ? 'bg-[#ff453a]/15 text-[#ff453a] border border-[#ff453a]/25' : 'bg-gray-500/10 text-gray-400'
                                                        }`}>
                                                            {meetingGrade === 'A' ? 'A_즉시상정' : 'B_회의점검'}
                                                        </span>
                                                    </td>

                                                    {/* 25. 상정사유 */}
                                                    <td className="pl-4 text-[#A1A1AA] truncate w-[180px] min-w-[180px] max-w-[180px]">{agendaReason || '-'}</td>

                                                    {/* 26. 정렬키 */}
                                                    <td className="pl-4 text-center w-[100px] min-w-[100px] max-w-[100px] font-mono text-[#86868B] truncate">{sortKeyVal || '-'}</td>

                                                    {/* 27. 비고 */}
                                                    <td className="pl-4 text-[#86868B] truncate w-[180px] min-w-[180px] max-w-[180px]">{notesVal || '-'}</td>
                                                    
                                                    {/* 관리 */}
                                                    <td className="px-2 text-center w-[85px] min-w-[85px] max-w-[85px] border-r border-[#3c3c3c]">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button 
                                                                onClick={isAuthorized ? () => handleEditClick(t) : () => setShowAuthInfoModal(true)}
                                                                className="text-blue-400 hover:text-blue-300 font-bold text-[11px] cursor-pointer"
                                                            >
                                                                수정
                                                            </button>
                                                            <span className="text-[#555] select-none">|</span>
                                                            <button 
                                                                onClick={isAuthorized ? () => handleDeleteClick(t.id) : () => setShowAuthInfoModal(true)}
                                                                className="text-red-400 hover:text-red-300 font-bold text-[11px] cursor-pointer"
                                                            >
                                                                삭제
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    <tr className="bg-[#272726] hover:bg-[#333]/30 transition-colors h-11 border-t border-[#3c3c3c]/50">
                                        <td colSpan="28" className="text-center py-2 bg-[#2c2c2b]/30">
                                            <button 
                                                onClick={isAuthorized ? handleAddNewClick : () => setShowAuthInfoModal(true)}
                                                className="px-6 py-2 border border-[#444] rounded-[8px] text-[13px] font-bold text-[#A1A1AA] hover:text-white hover:border-[#666] transition-colors cursor-pointer"
                                            >
                                                + 새 업무 추가
                                            </button>
                                        </td>
                                    </tr>
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

            {/* R&R 관리 권한 안내 모달 */}
            {showAuthInfoModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[11000] p-4">
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[16px] w-full max-w-[400px] shadow-2xl p-6 relative">
                        <h3 className="text-[17px] font-bold text-white mb-5 text-left">
                            R&R 및 필요산출물 관리 권한
                        </h3>
                        
                        <div className="bg-[#2C2C2E]/40 border border-[#2C2C2E] rounded-[8px] p-4 space-y-3 mb-6 text-left">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#2997ff]/10 text-[#2997ff] border border-[#2997ff]/20 shrink-0">조직</span>
                                <div className="text-[13px] text-[#E5E5E5] font-medium space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-[3px] h-[3px] rounded-full bg-[#86868B] shrink-0" />
                                        <span>사업관리2파트</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-[3px] h-[3px] rounded-full bg-[#86868B] shrink-0" />
                                        <span>시스템 관리자(기획추진)</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[1px] bg-[#2C2C2E]" />
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#6366F1]/10 text-[#A5B4FC] border border-[#6366F1]/20 shrink-0">역할</span>
                                <div className="text-[13px] text-[#E5E5E5] font-medium space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-[3px] h-[3px] rounded-full bg-[#86868B] shrink-0" />
                                        <span>PO (Project Owner)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-[3px] h-[3px] rounded-full bg-[#86868B] shrink-0" />
                                        <span>프로젝트 디렉터 및 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={() => setShowAuthInfoModal(false)}
                                className="px-5 py-2 rounded-[8px] bg-[#2997ff] hover:bg-[#147ce5] text-[13px] font-bold text-white transition-colors cursor-pointer w-full"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-[16px] w-full max-w-[800px] shadow-2xl p-6 relative">
                        <h3 className="text-[18px] font-bold text-white mb-4 text-left">
                            {editingItem ? '통합 업무 보드 수정' : '통합 업무 보드 추가'}
                        </h3>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 text-left">
                                {/* Col 1 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">프로젝트</label>
                                        <select 
                                            value={formProject} 
                                            onChange={e => setFormProject(e.target.value)} 
                                            className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer"
                                        >
                                            {projects.map(p => (
                                                <option key={p.project_code} value={p.project_code}>{p.project_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">대분류</label>
                                        <input type="text" value={formCategoryMain} onChange={e => setFormCategoryMain(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff]" required />
                                    </div>
                                    
                                    {/* 세부섹터 (Autocomplete Suggestions) */}
                                    <div className="relative flex flex-col">
                                        <label className="text-[12px] font-bold text-[#86868B] mb-1">세부섹터</label>
                                        <input 
                                            type="text" 
                                            value={formSectorDetail} 
                                            onChange={e => {
                                                setFormSectorDetail(e.target.value);
                                                setShowSubsectorSuggestions(true);
                                            }}
                                            onFocus={() => setShowSubsectorSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowSubsectorSuggestions(false), 200)}
                                            className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff]" 
                                            placeholder="검색 또는 입력"
                                        />
                                        {showSubsectorSuggestions && formSectorDetail && (
                                            <div className="absolute top-[58px] left-0 w-full bg-[#222] border border-[#3c3c3c] rounded-[8px] py-1 max-h-[160px] overflow-y-auto z-[10005] shadow-xl">
                                                {uniqueSubsectors
                                                    .filter(name => name.toLowerCase().includes(formSectorDetail.toLowerCase()))
                                                    .map((name, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="px-3 py-2 text-[13px] text-[#E5E5E5] hover:bg-[#333] cursor-pointer truncate"
                                                            onClick={() => {
                                                                setFormSectorDetail(name);
                                                                setShowSubsectorSuggestions(false);
                                                            }}
                                                        >
                                                            {name}
                                                        </div>
                                                    ))}
                                                {!uniqueSubsectors.some(name => name.toLowerCase() === formSectorDetail.toLowerCase()) && (
                                                    <div 
                                                        className="px-3 py-2 text-[13px] text-[#2997ff] hover:bg-[#333] cursor-pointer font-bold border-t border-[#3c3c3c]/50"
                                                        onClick={() => setShowSubsectorSuggestions(false)}
                                                    >
                                                        ➕ 새 세부섹터 추가: "{formSectorDetail}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">업무명</label>
                                        <textarea value={formTaskName} onChange={e => setFormTaskName(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] h-16 resize-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">업무목적 / PF·준공 영향</label>
                                        <textarea value={formTaskPurpose} onChange={e => setFormTaskPurpose(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] h-16 resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">필요 산출물</label>
                                        <textarea value={formDeliverables} onChange={e => setFormDeliverables(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] h-16 resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">최종 목표축</label>
                                        <select 
                                            value={formTargetAxis} 
                                            onChange={e => setFormTargetAxis(e.target.value)} 
                                            className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer"
                                        >
                                            <option value="PF">PF</option>
                                            <option value="착공">착공</option>
                                            <option value="준공/운영">준공/운영</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">Gate</label>
                                        <select 
                                            value={formGateStage} 
                                            onChange={e => setFormGateStage(e.target.value)} 
                                            className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer"
                                        >
                                            <option value="G0">G0 현황정리</option>
                                            <option value="G1">G1 방향결정</option>
                                            <option value="G2">G2 PF준비도</option>
                                            <option value="G3">G3 계약/동의</option>
                                            <option value="G4">G4 착공/공사</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">PMO총괄</label>
                                        <select 
                                            value={formPmoManager} 
                                            onChange={e => setFormPmoManager(e.target.value)} 
                                            className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer"
                                        >
                                            <option value="사업관리2파트">사업관리2파트</option>
                                            <option value="기획추진">기획추진</option>
                                            <option value="시스템 관리자(기획추진)">시스템 관리자(기획추진)</option>
                                            <option value="LFC">LFC</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">실무 주관부서</label>
                                        <select 
                                            value={formLeadDept} 
                                            onChange={e => setFormLeadDept(e.target.value)} 
                                            className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer"
                                        >
                                            {departments.map(d => (
                                                <option key={d.dept_code} value={d.dept_name}>{d.dept_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">협업부서</label>
                                        <input type="text" value={formCoopDepts} onChange={e => setFormCoopDepts(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff]" placeholder="부서 구분은 세미콜론(;) 사용" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">담당자</label>
                                        <input type="text" value={formAssignee} onChange={e => setFormAssignee(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff]" />
                                    </div>
                                    
                                    {/* 외부상대방 (Autocomplete Suggestions) */}
                                    <div className="relative flex flex-col">
                                        <label className="text-[12px] font-bold text-[#86868B] mb-1">외부상대방</label>
                                        <input 
                                            type="text" 
                                            value={formExternalParty} 
                                            onChange={e => {
                                                setFormExternalParty(e.target.value);
                                                setShowStakeholderSuggestions(true);
                                            }}
                                            onFocus={() => setShowStakeholderSuggestions(true)}
                                            onBlur={() => setTimeout(() => setShowStakeholderSuggestions(false), 200)}
                                            className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff]" 
                                            placeholder="검색 또는 입력"
                                        />
                                        {showStakeholderSuggestions && formExternalParty && (
                                            <div className="absolute top-[58px] left-0 w-full bg-[#222] border border-[#3c3c3c] rounded-[8px] py-1 max-h-[160px] overflow-y-auto z-[10005] shadow-xl">
                                                {uniqueStakeholderNames
                                                    .filter(name => name.toLowerCase().includes(formExternalParty.toLowerCase()))
                                                    .map((name, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="px-3 py-2 text-[13px] text-[#E5E5E5] hover:bg-[#333] cursor-pointer truncate"
                                                            onClick={() => {
                                                                setFormExternalParty(name);
                                                                setShowStakeholderSuggestions(false);
                                                            }}
                                                        >
                                                            {name}
                                                        </div>
                                                    ))}
                                                {!uniqueStakeholderNames.some(name => name.toLowerCase() === formExternalParty.toLowerCase()) && (
                                                    <div 
                                                        className="px-3 py-2 text-[13px] text-[#2997ff] hover:bg-[#333] cursor-pointer font-bold border-t border-[#3c3c3c]/50"
                                                        onClick={async () => {
                                                            const nameToRegister = formExternalParty;
                                                            if (window.confirm(`'${nameToRegister}'을(를) 이해관계자 마스터에 새로 등록하시겠습니까?`)) {
                                                                await resolveStakeholderCode(nameToRegister);
                                                                alert('이해관계자가 등록되었습니다.');
                                                            }
                                                            setShowStakeholderSuggestions(false);
                                                        }}
                                                    >
                                                        ➕ 새 상대방 등록: "{formExternalParty}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Col 2 */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">지원필요</label>
                                        <textarea value={formSupportNeeded} onChange={e => setFormSupportNeeded(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] h-16 resize-none" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-bold text-[#86868B] mb-1">Blocker</label>
                                            <select value={formIsBlocker ? 'Y' : 'N'} onChange={e => setFormIsBlocker(e.target.value === 'Y')} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer">
                                                <option value="N">N (아니오)</option>
                                                <option value="Y">Y (예)</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-bold text-[#86868B] mb-1">의사결정필요</label>
                                            <select value={formNeedsDecision ? 'Y' : 'N'} onChange={e => setFormNeedsDecision(e.target.value === 'Y')} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer">
                                                <option value="N">N (아니오)</option>
                                                <option value="Y">Y (예)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">기한</label>
                                        <input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-bold text-[#86868B] mb-1">진행 상태</label>
                                            <select value={formStatus} onChange={e => setFormStatus(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer">
                                                <option value="미착수">미착수</option>
                                                <option value="진행중">진행중</option>
                                                <option value="완료">완료</option>
                                                <option value="지연">지연</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-bold text-[#86868B] mb-1">중요도</label>
                                            <select value={formImportanceLevel} onChange={e => setFormImportanceLevel(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer">
                                                <option value="일반">일반</option>
                                                <option value="PF필수">PF필수</option>
                                                <option value="준공필수">준공필수</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">업무유형</label>
                                        <select value={formTaskType} onChange={e => setFormTaskType(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer">
                                            <option value="정규">정규</option>
                                            <option value="팝업">팝업</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">다음 액션</label>
                                        <textarea value={formNextAction} onChange={e => setFormNextAction(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] h-16 resize-none" />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-bold text-[#86868B] mb-1">우선순위점수</label>
                                            <input type="number" value={formPriorityScore} onChange={e => setFormPriorityScore(parseInt(e.target.value) || 0)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff]" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[12px] font-bold text-[#86868B] mb-1">회의상정등급</label>
                                            <select value={formMeetingGrade} onChange={e => setFormMeetingGrade(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] cursor-pointer">
                                                <option value="B">B_회의점검</option>
                                                <option value="A">A_즉시상정</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">상정사유</label>
                                        <textarea value={formAgendaReason} onChange={e => setFormAgendaReason(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] h-16 resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">정렬키</label>
                                        <input type="text" value={formSortKey} onChange={e => setFormSortKey(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff]" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-[#86868B] mb-1">비고</label>
                                        <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} className="w-full bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#2997ff] h-16 resize-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#3c3c3c] flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-[8px] bg-[#333] hover:bg-[#444] text-[13px] font-bold text-white transition-colors cursor-pointer">
                                    취소
                                </button>
                                <button type="submit" className="px-5 py-2 rounded-[8px] bg-[#2997ff] hover:bg-[#147ce5] text-[13px] font-bold text-white transition-colors cursor-pointer">
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
