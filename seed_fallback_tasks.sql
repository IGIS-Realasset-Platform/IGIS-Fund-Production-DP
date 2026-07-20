-- FALLBACK_BOARD_TASKS 데이터베이스 시드 스크립트
BEGIN;

-- A) 프로젝트 데이터 추가
INSERT INTO iota_v2.iota_projects (project_code, project_name) VALUES ('IOTA_SEOUL', '공통') ON CONFLICT (project_code) DO NOTHING;
INSERT INTO iota_v2.iota_projects (project_code, project_name) VALUES ('PFV_427', '427PFV') ON CONFLICT (project_code) DO NOTHING;
INSERT INTO iota_v2.iota_projects (project_code, project_name) VALUES ('PFV_816', '816PFV') ON CONFLICT (project_code) DO NOTHING;

-- B) 세부 섹터 데이터 추가
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('업무관리 체계') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('우선순위 기준') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('브랜드') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('HMA/Franchise') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('운영전략') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('현금기부채납') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('소공원로') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('주거전환') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('변경인가') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('사용승인') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('현대건설 도급') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('삼성물산 도급') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('공사비 검증') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('공기/착공조건') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('PF 기준도면') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('면적표') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('호텔 프로그램') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('오피스 TI') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('호텔 인테리어') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('공간제안 패키지') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('광장') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('KB/금융권') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('삼성/이지스 선임차') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('임대료/NOC') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('단독 PF') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('통합 PF') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('재무모델') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('LOC/책임임차') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('PF CP') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('리츠 전환') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('Asset/Share/합병') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('421호 펀드') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('PFV 주주승인') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('내부 의사결정') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('주주사 보고') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('Action Item') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('착공 이후 KPI') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('준공 CP') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('Take-out') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('운영전환') ON CONFLICT (subsector_name) DO NOTHING;
INSERT INTO iota_v2.iota_subsectors (subsector_name) VALUES ('외부 보고 요청') ON CONFLICT (subsector_name) DO NOTHING;

-- C) 외부 관계자 데이터 추가
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('EXTERNAL', '내부 전체', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_MARRIOTT대명', 'Marriott, 대명소노', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_호텔브랜드사', '호텔 브랜드사', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_서울시중구청', '서울시/중구청', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_서울시중구청삼성물산', '서울시/중구청, 삼성물산', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_현대건설', '현대건설', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_삼성물산', '삼성물산', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_현대건설삼성물산', '현대건설, 삼성물산', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_설계사CM', '설계사/CM', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_호텔브랜드사설계사', '호텔 브랜드사, 설계사', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_잠재임차인', '잠재 임차인', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_광장KB삼성등', '광장, KB, 삼성 등', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_광장', '광장', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_KB증권등', 'KB증권 등', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_삼성물산이지스', '삼성물산, 이지스', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_대주단', '대주단', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_회계법인대주단', '회계법인/대주단', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_삼성물산대주단', '삼성물산, 대주단', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_법무법인세무법인', '법무법인, 세무법인', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_수익자신탁사', '수익자, 신탁사', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_현대건설삼성물산신한', '현대건설, 삼성물산, 신한, NH 등', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_대표본부장파트장', '대표/본부장/파트장', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_주주사', '주주사', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_시공사CM', '시공사/CM', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_관청대주단', '관청, 대주단', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_금융기관', '금융기관', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_운영사임차인', '운영사/임차인', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES ('STAKE_내부외부요청자', '내부/외부 요청자', '기타') ON CONFLICT (stakeholder_code) DO NOTHING;

-- D) 테스크 데이터 추가
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '공통 PMO', '업무관리 체계', 'IOTA 통합 업무관리 원장 운영',
        '업무과중·중복요청·공 차지 문제를 차단하고 PF/준공 중심으로 업무를 재정렬', '통합업무보드, 회의메인, Action Item 운영기준',
        '사업2파트', 'DEPT_PM2',
        '사업관리1파트;개발관리실;공간솔루션실;기업마케팅실;LFC', '미정', 'EXTERNAL',
        false, true, '2026-07-27', '진행중', '준공필수', '정규',
        70, 'A', '준공필수 / 의사결정 / 지원:부서별 담당자 입력',
        '사업2파트가 PMO', '회의체 운영원칙 확정 후 부서 배포'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '공통 PMO', '우선순위 기준', '회의상정 우선순위 산정 기준 확정',
        '종합현황이 수기 요약이 아니라 원장 기반으로 자동 정렬되어야 함', '우선순위 기준표, 회의상정 기준, 상정사유',
        '사업2파트', 'DEPT_PM2',
        'LFC;개발관리실', '미정', 'EXTERNAL',
        false, true, '2026-07-27', '진행중', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:파트장 확인',
        NULL, '회의에서 점수 기준 합의'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '호텔/운영', '브랜드', '427 호텔 브랜드 방향 확정',
        '427 PF 실행을 위해 호텔 브랜드·운영전략·대주 설득 스토리 필요', '리츠칼튼/소노/대안 브랜드 비교표, 추천안',
        '사업2파트', 'DEPT_PM2',
        '기업마케팅실;LFC;법무/세무 외부자문', '미정', 'STAKE_MARRIOTT대명',
        true, true, '2026-07-22', '지연', 'PF필수', '정규',
        105, 'A', 'PF필수 / Blocker / 의사결정 / 지원:호텔 담당/법무 검토 / 지연',
        '핵심 Blocker', '리츠칼튼 우선협상권 및 소노 협약 충돌 가능성 정리 , 소노 단독 액션플랜 정리'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '호텔/운영', 'HMA/Franchise', '호텔 운영계약 구조 검토',
        '호텔 계약 형태가 PF, 가치평가, 운영리스크에 영향', 'HMA/프랜차이즈/운영위탁 구조별 Term 비교',
        '사업2파트', 'DEPT_PM2',
        'LFC;법무/세무 외부자문;기업마케팅실', '미정', 'STAKE_MARRIOTT대명',
        false, true, '2026-08-07', '미착수', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:외부 법무 검토',
        NULL, '계약 유형별 대주단 수용성 확인'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '호텔/운영', '운영전략', '호텔 운영수지·FF&E·CAPEX 반영',
        '재무모델과 PF 상환가능성 검토에 필요', '호텔 운영수지, FF&E, Capex, 안정화 기간 가정',
        '사업2파트', 'DEPT_LFC',
        '사업2파트;기업마케팅실;공간솔루션실', '미정', 'STAKE_호텔브랜드사',
        false, false, '2026-08-22', '미착수', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:운영자료 필요',
        NULL, '브랜드 후보로부터 기준자료 수령'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '인허가', '현금기부채납', '현금기부채납 협의 조건 정리',
        '기부채납 규모·지급시기·인허가 조건이 사업비/PF 조건에 직접 영향', '관청 협의현황, 비용반영표, 쟁점 및 협상안',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;LFC', '미정', 'STAKE_서울시중구청',
        true, true, '2026-07-26', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:관청 협의 결과',
        NULL, '협약 시나리오정리/인허관청 미팅 논의'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '인허가', '소공원로', '소공원로 협의 및 공사중 사용/변경 가능성 검토',
        '도로·공공기여·공사동선 이슈가 착공 및 준공 일정에 영향', '소공원로 협의안, 일정표, 리스크표',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;공간솔루션실', '미정', 'STAKE_서울시중구청',
        true, true, '2026-08-02', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:도면·관청의견 필요',
        NULL, '소공원로 관련 도면 및 협의주체 확인'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_816', '인허가', '주거전환', '816 주거전환 가능성 및 인허가 리스크 검토',
        '통합/대안 구조에서 816의 사업성·리스크·대주단 수용성 판단 필요', '주거전환 가능성 검토서, 일정/리스크/사업성 비교',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;LFC;공간솔루션실', '미정', 'STAKE_서울시중구청삼성물산',
        false, true, '2026-08-07', '진행중', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:인허가/설계 검토',
        NULL, '주거전환 시 인허가 변경기간 및 조건 산정'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '인허가', '변경인가', '427 호텔·오피스 변경 가능성 및 PF 전 인허가 쟁점 정리',
        '호텔 브랜드/운영전략에 따라 도면·용도·면적 영향 가능', '427 변경인가 쟁점표, 필요 인허가 목록',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;공간솔루션실', '미정', 'STAKE_서울시중구청',
        false, false, '2026-08-22', '미착수', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:인허가 판단',
        NULL, '호텔 프로그램 확정 이후 필요 변경범위 확인'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '인허가', '사용승인', '준공/사용승인 역산 로드맵 수립',
        'PF 이후에도 준공·담보대출까지 장기 관리 필요', '사용승인 체크리스트, 준공 CP, 관계기관 일정표',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;LFC', '미정', 'STAKE_서울시중구청',
        false, false, '2026-10-07', '미착수', '준공필수', '정규',
        50, 'B', '준공필수 / 지원:장기 일정 입력',
        NULL, 'PF 이후 공사·준공 CP로 연결'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '시공/원가', '현대건설 도급', '427 현대건설 도급조건 및 신용공여 조건 확정',
        '427 PF 실행성은 시공조건·공사비·신용공여에 좌우', '현대건설 Term, 도급조건, 신용공여 범위',
        '사업2파트', 'DEPT_PM2',
        'LFC;개발관리실', '미정', 'STAKE_현대건설',
        false, true, '2026-08-07', '진행중', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:시공사 Term 회신',
        NULL, '현대건설과 도급/신용공여 핵심 조건 테이블화'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_816', '시공/원가', '삼성물산 도급', '816 삼성물산 도급조건·책임임차·LOC 구조 정리',
        '816 원가와 삼성 조건이 단독/통합 PF 실행성의 핵심', '삼성물산 Term, LOC, 책임임차, 공사비 비교',
        '사업2파트', 'DEPT_PM2',
        'LFC;개발관리실;기업마케팅실', '미정', 'STAKE_삼성물산',
        true, true, '2026-08-07', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:삼성 조건 회신',
        NULL, '삼성물산의 주주/시공사 이중 지위 고려해 협상안 작성'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '시공/원가', '공사비 검증', '427/816 공사비 적정성 및 VE 가능성 검토',
        '높은 원가가 PF·주주승인·임차조건의 공통 병목', '공사비 비교표, VE 목록, 공사비 민감도',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;LFC;공간솔루션실', '미정', 'STAKE_현대건설삼성물산',
        true, false, '2026-08-22', '진행중', 'PF필수', '정규',
        70, 'A', 'PF필수 / Blocker / 지원:견적 상세내역',
        NULL, '공사비 상승 근거와 절감 가능항목 분리'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '시공/원가', '공기/착공조건', '책임착공·착공조건·공기 단축 시나리오 정리',
        'PF 약정상 착공기한과 공정관리가 장기 리스크', '착공조건표, 공기 시나리오, 책임착공 리스크표',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;LFC', '미정', 'STAKE_현대건설삼성물산',
        false, false, '2026-09-22', '미착수', '준공필수', '정규',
        50, 'B', '준공필수 / 지원:시공사 공정표',
        NULL, 'PF Term과 착공 조건 연결'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '도면/설계', 'PF 기준도면', 'PF 대주단 제출용 기준도면 패키지 확정',
        '도면 기준이 없으면 공사비·임차·PF 설명자료가 모두 흔들림', 'PF 기준도면, 면적표, 변경이력표',
        '사업2파트', 'DEPT_DESIGN',
        '개발관리실;사업2파트;LFC', '미정', 'STAKE_설계사CM',
        true, true, '2026-08-02', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:도면 기준 정리',
        NULL, '427/816 공통 기준도면 양식 확정'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '도면/설계', '면적표', 'GFA/NLA/전용률/임대면적 기준 통일',
        '임차·재무모델·PF 설명자료의 숫자 불일치 방지', '면적표, 전용률, 임대가능면적, 변경 이력',
        '사업2파트', 'DEPT_DEV',
        '공간솔루션실;기업마케팅실', '미정', 'STAKE_설계사CM',
        false, false, '2026-08-07', '진행중', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:도면/면적자료',
        NULL, '임차 제안서와 모델 입력값 일치 확인'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '도면/설계', '호텔 프로그램', '호텔 객실/부대시설 프로그램 도면 반영',
        '브랜드·운영전략과 설계가 불일치하면 PF 후 변경 리스크 확대', '호텔 프로그램 도면, 면적/동선 검토표',
        '사업2파트', 'DEPT_DESIGN',
        '사업2파트;기업마케팅실', '미정', 'STAKE_호텔브랜드사설계사',
        false, false, '2026-08-22', '미착수', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:브랜드 기준자료',
        NULL, '브랜드 후보별 프로그램 요구사항 수령'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '인테리어/TI', '오피스 TI', '오피스 표준 TI 및 임차인 Fit-out 기준 설정',
        '임차조건·임대안정화비용·PF 모델에 반영 필요', '오피스 TI 기준표, 비용범위, 부담주체',
        '사업2파트', 'DEPT_DESIGN',
        '기업마케팅실;LFC;사업2파트', '미정', 'STAKE_잠재임차인',
        false, false, '2026-08-22', '진행중', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:TI 시장자료',
        NULL, '임차 제안서와 비용모델 연동'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '인테리어/TI', '호텔 인테리어', '호텔 인테리어/FF&E 범위 및 비용 정리',
        '호텔 CAPEX가 총사업비와 대주단 조건에 영향', '호텔 인테리어 Scope, FF&E, Owner 부담범위',
        '사업2파트', 'DEPT_DEV',
        '공간솔루션실;기업마케팅실', '미정', 'STAKE_호텔브랜드사',
        false, false, '2026-09-07', '미착수', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:브랜드 기준자료',
        NULL, '브랜드 결정 후 Cost Book 작성'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '인테리어/TI', '공간제안 패키지', '주요 임차인별 공간 제안 패키지 제작',
        '임차 확보가 PF 실행성과 대주단 설득의 핵심', '광장/KB/삼성 등 임차 제안 패키지',
        '사업2파트', 'DEPT_DESIGN',
        '기업마케팅실;사업2파트', '미정', 'STAKE_광장KB삼성등',
        false, false, '2026-08-07', '진행중', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:임차인 요구사항',
        NULL, '임차인별 니즈를 도면·조건에 반영'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_427', '임차/마케팅', '광장', '광장 임차 Term 및 면적·조건 확정',
        '427/통합 PF 스토리에서 핵심 임차사 역할 가능', '임차 Term Sheet, 면적, 임대료, 인센티브',
        '사업2파트', 'DEPT_MKT',
        '사업2파트;공간솔루션실;LFC', '미정', 'STAKE_광장',
        true, true, '2026-07-26', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:임차조건 회신',
        NULL, '임차 조건과 PF 반영 가능성 확인'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '임차/마케팅', 'KB/금융권', 'KB증권 등 금융권 임차 후보 협의',
        '오피스 선임차 수준이 PF 대주단 설득에 필요', '후보별 면적/조건/의사결정 단계표',
        '사업2파트', 'DEPT_MKT',
        '사업2파트;공간솔루션실;LFC', '미정', 'STAKE_KB증권등',
        false, false, '2026-08-07', '진행중', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:임차 후보 접촉',
        NULL, '금융권 임차 후보 우선순위화'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_816', '임차/마케팅', '삼성/이지스 선임차', '816 선임차·책임임차·임차이전 가능성 정리',
        '816 단독/통합 PF 구조에서 선임차와 신용공여가 핵심', '삼성/이지스 임차 조건표, LOC/책임범위',
        '사업2파트', 'DEPT_MKT',
        '사업2파트;LFC;삼성물산', '미정', 'STAKE_삼성물산이지스',
        true, true, '2026-08-07', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:내부/삼성 협의',
        NULL, '816 선임차 유지 vs 427 이전 비교'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '임차/마케팅', '임대료/NOC', '임차조건·E.NOC·인센티브 기준 통일',
        '임차 제안서와 재무모델·대주단 설명자료 일치 필요', '임대료, 관리비, RF, TI, NOC 계산 기준표',
        '사업2파트', 'DEPT_MKT',
        'LFC;공간솔루션실;사업2파트', '미정', 'STAKE_잠재임차인',
        false, false, '2026-08-22', '진행중', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:시장자료',
        NULL, '임차조건 산식 단순화 및 내부 기준화'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', 'PF/금융', '단독 PF', '427/816 단독 PF 조건 정리',
        '개별 PF 가능성 판단과 통합 PF 대비 기준점 필요', '427 단독 Term, 816 단독 Term, 민감도',
        '사업2파트', 'DEPT_PM2',
        '사업관리1파트;LFC', '미정', 'STAKE_대주단',
        true, true, '2026-08-07', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:Term Sheet 필요',
        NULL, '단독 PF 가능/불가 조건을 수치화'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', 'PF/금융', '통합 PF', '대주단 일치화 및 통합 PF 구조 검토',
        '두 PFV 동시 추진 시 대주단, 담보, 구조가 복잡하므로 의사결정 필요', '통합 PF 구조도, 대주단 전략, 담보 제공안',
        '사업2파트', 'DEPT_LFC',
        '사업2파트;법무/세무 외부자문;사업관리1파트', '미정', 'STAKE_대주단',
        true, true, '2026-08-07', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:금융/법무 검토',
        NULL, '단독 vs 통합 의사결정용 비교표 작성'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', 'PF/금융', '재무모델', '427/816/통합 재무모델 업데이트',
        '원가·임차·호텔·신용공여 조건이 PF 조달액과 주주 설득에 영향', '통합 재무모델, 사업비, 금융비용, 민감도',
        '사업2파트', 'DEPT_LFC',
        '사업2파트;기업마케팅실;개발관리실', '미정', 'STAKE_회계법인대주단',
        true, false, '2026-08-22', '진행중', 'PF필수', '정규',
        70, 'A', 'PF필수 / Blocker / 지원:업데이트 입력값',
        NULL, '각 부서 입력값 마감일 설정'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'PFV_816', 'PF/금융', 'LOC/책임임차', '삼성 LOC/책임임차 비용 및 구조 반영',
        '816 단독 PF 비용절감/대주 설득 논리와 연결', 'LOC 수수료, 책임임차 비용, 이지스 부담 비교',
        '사업2파트', 'DEPT_LFC',
        '사업2파트;기업마케팅실', '미정', 'STAKE_삼성물산대주단',
        false, true, '2026-08-22', '진행중', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:삼성 조건 확정',
        NULL, '단독 PF 시 비용절감 논리 재검증'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', 'PF/금융', 'PF CP', 'PF 실행 선결조건 체크리스트 구축',
        'PF 실행 전 모든 부서 산출물을 CP 형태로 확인 필요', 'PF CP checklist, 담당/기한/증빙자료 목록',
        '사업2파트', 'DEPT_LFC',
        '사업2파트;개발관리실;공간솔루션실;기업마케팅실', '미정', 'STAKE_대주단',
        false, true, '2026-09-07', '미착수', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:각 부서 산출물',
        NULL, '부서별 CP owner 지정'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '구조/법무/세무', '리츠 전환', '427 리츠 전환 및 816 편입 구조 검토',
        '기존 통합 기본안이었으나 방향성이 미정이라 재검토 필요', '리츠 전환 구조도, 절차, 세무/법무 쟁점',
        '사업2파트', 'DEPT_PM2',
        '법무/세무 외부자문;LFC;사업관리1파트', '미정', 'STAKE_법무법인세무법인',
        true, true, '2026-08-07', '진행중', 'PF필수', '정규',
        90, 'A', 'PF필수 / Blocker / 의사결정 / 지원:외부 자문',
        NULL, '기본안 유지/폐기/보류 판단'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '구조/법무/세무', 'Asset/Share/합병', 'Asset Deal·Share Deal·합병·현물출자 비교',
        '통합 구조별 절차·취득세·주주동의·실행가능성 판단 필요', '구조별 비교표, 장단점, 세금/승인 이슈',
        '사업2파트', 'DEPT_KAM',
        '사업2파트;LFC', '미정', 'STAKE_법무법인세무법인',
        false, true, '2026-08-07', '진행중', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:자문결과 필요',
        NULL, '구조별 의사결정 기준 명확화'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '구조/법무/세무', '421호 펀드', '421호 펀드 및 수익자 이해관계 정리',
        '펀드 투자자·주주대여·수익배분 구조가 구조전환 및 PF에 영향', '421호 투자자/수익권/배당구조 요약표',
        '사업2파트', 'DEPT_PM1',
        '사업2파트;LFC;법무/세무 외부자문', '미정', 'STAKE_수익자신탁사',
        false, false, '2026-08-22', '진행중', 'PF필수', '정규',
        45, 'B', 'PF필수 / 지원:펀드자료 확인',
        NULL, '구조전환 시 수익자 동의/통지 필요성 확인'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '구조/법무/세무', 'PFV 주주승인', 'PFV별 주주승인·기존주주 설득 포인트 정리',
        '기존 주주 동의가 구조전환·PF 실행의 실질 변수', '주주별 권리/동의필요/협상 포인트',
        '사업2파트', 'DEPT_PM1',
        '사업2파트;법무/세무 외부자문', '미정', 'STAKE_현대건설삼성물산신한',
        false, true, '2026-08-22', '진행중', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:주주 구조 확인',
        NULL, '주주별 이해관계와 설득논리 정리'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '주주/보고', '내부 의사결정', '6~7월 단독/통합/호텔/시공 방향결정 회의 준비',
        '의사결정 없이 자료요청만 반복되는 구조 차단', '의사결정 안건지, 옵션 비교표, 추천안',
        '사업2파트', 'DEPT_PM2',
        '개발관리실', '미정', 'STAKE_대표본부장파트장',
        false, true, '2026-07-27', '진행중', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:회의 일정 확정',
        NULL, '회의 전 부서별 산출물 마감 설정'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '주주/보고', '주주사 보고', '주주사 보고자료 구조 및 리스크 문안 정리',
        '외부 보고 시 사업성·PF 가능성·원가 리스크 표현 필요', '주주사 보고자료, Q&A, 리스크 대응문안',
        '사업2파트', 'DEPT_PM2',
        'LFC;사업관리1파트;법무/세무 외부자문', '미정', 'STAKE_주주사',
        false, true, '2026-09-07', '미착수', 'PF필수', '정규',
        65, 'B', 'PF필수 / 의사결정 / 지원:숫자/법무 검토',
        NULL, '보고자료와 내부 의사결정안 분리'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '주주/보고', 'Action Item', '회의록·Action Item·Due Date 관리',
        '업무가 흩어지지 않고 담당/기한/산출물 기준으로 회수되게 함', '회의록, Action Item, 미완료/지원요청 목록',
        '사업2파트', 'DEPT_PM2',
        '전 부서', '미정', 'EXTERNAL',
        false, false, '2026-07-27', '진행중', '중간', '정규',
        15, 'B', '지원:부서별 피드백',
        NULL, '주간 업데이트 루틴 확정'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '준공/담보대출', '착공 이후 KPI', 'PF 이후 착공·공정·원가·변경관리 KPI 설계',
        'PF가 끝이 아니라 준공과 Take-out까지 관리 필요', '공정률, 원가, 변경, 리스크 KPI 대시보드',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;LFC;공간솔루션실', '미정', 'STAKE_시공사CM',
        false, false, '2026-11-07', '미착수', '준공필수', '정규',
        50, 'B', '준공필수 / 지원:장기 KPI 설계',
        NULL, 'PF CP 이후 공사관리 체계로 전환'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '준공/담보대출', '준공 CP', '준공/사용승인 CP 및 증빙자료 관리체계 수립',
        'Take-out 대출 및 운영전환의 전제 조건', '준공 CP, 사용승인 증빙, 담보대출 요구자료 목록',
        '사업2파트', 'DEPT_DEV',
        '사업2파트;LFC', '미정', 'STAKE_관청대주단',
        false, false, '2027-04-07', '미착수', '준공필수', '정규',
        50, 'B', '준공필수 / 지원:장기 자료요건',
        NULL, '장기 과제로 별도 로드맵 관리'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '준공/담보대출', 'Take-out', '준공 후 담보대출/Take-out 전략 수립',
        '브릿지/PF 상환과 자산 안정화 전략의 최종 회수 단계', 'Take-out 대출 전략, 담보가치, DSCR, 임대안정화 계획',
        '사업2파트', 'DEPT_LFC',
        '사업2파트;기업마케팅실;개발관리실', '미정', 'STAKE_금융기관',
        false, false, '2027-04-07', '미착수', '준공필수', '정규',
        50, 'B', '준공필수 / 지원:장기 금융전략',
        NULL, 'PF 조건과 준공 후 담보대출 연결'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '준공/담보대출', '운영전환', '준공 후 운영·자산관리 전환계획 수립',
        '준공 이후 임대운영, 호텔운영, 담보대출 관리 필요', '운영전환 체크리스트, 임대운영/호텔운영 업무분장',
        '사업2파트', 'DEPT_PM2',
        '기업마케팅실;공간솔루션실;LFC', '미정', 'STAKE_운영사임차인',
        false, false, '2027-04-07', '미착수', '준공필수', '정규',
        50, 'B', '준공필수 / 지원:운영정책 필요',
        NULL, '장기 과제로 초기부터 관리'
    ) ON CONFLICT DO NOTHING;
INSERT INTO iota_v2.iota_pmo_tasks (
        project_code, category_main, sector_detail, task_name, task_purpose, deliverables,
        pmo_manager, lead_dept_code, coop_dept_codes, assignee, external_party_code,
        is_blocker, needs_decision, due_date, status, importance_level, task_type,
        priority_score, meeting_grade, agenda_reason, notes, next_action
    ) VALUES (
        'IOTA_SEOUL', '팝업/단발', '외부 보고 요청', '갑작스러운 외부 보고자료 요청 접수',
        '정규 업무 침식 여부 판단 필요', '요청 목적/기한/원 수행부서 확인 후 접수 또는 위임',
        '사업2파트', 'DEPT_PM2',
        '요청부서', '미정', 'STAKE_내부외부요청자',
        false, false, '2026-07-27', '미착수', '중간', '팝업',
        20, 'B', '지원:목적·기한 확인 / 팝업',
        '샘플', '팝업요청관리 시트로 이관'
    ) ON CONFLICT DO NOTHING;

COMMIT;
