-- 사업2파트 v21 통합업무보드 붉은 글씨 반영
-- 원본: IOTA_업무정리_관리시스템_v21_graph_linked_refined_사업관리2파트.xlsx
-- 원칙:
-- 1) 엑셀의 T-ID, 우선순위점수, 회의상정등급, 상정사유, 정렬키는 가져오지 않는다.
-- 2) 기존 업무는 현재 DB UUID를 유지한다.
-- 3) 신규 업무는 현재 40개 정규 업무 뒤에 생성되어 T-041~T-044로 표시된다.
-- 4) 조직명은 현행 코드로만 저장하고 외부기관은 조직 필드에서 제외한다.
-- 5) 기준 데이터 이관이므로 점수 변경 시스템 댓글은 남기지 않는다.

BEGIN;

SELECT set_config('iota_v2.suppress_priority_change_log', 'on', TRUE);

INSERT INTO iota_v2.iota_subsectors (subsector_name)
VALUES
    ('421호 펀드'),
    ('Action Item'),
    ('Asset/Share/합병'),
    ('KB증권'),
    ('LG전자'),
    ('LOC/책임임차'),
    ('PF CP'),
    ('PFV 주주승인'),
    ('Take-out'),
    ('공간제안 패키지'),
    ('광장'),
    ('내부 의사결정'),
    ('단독 PF'),
    ('대외마케팅'),
    ('렌트롤 관리'),
    ('리츠 전환'),
    ('리테일 프로그램'),
    ('오피스 TI'),
    ('운영전환'),
    ('이지스 선임차'),
    ('임대료/NOC'),
    ('재무모델'),
    ('주주사 보고'),
    ('준공 CP'),
    ('착공 이후 KPI'),
    ('통합 PF'),
    ('호텔 인테리어')
ON CONFLICT (subsector_name) DO NOTHING;

INSERT INTO iota_v2.iota_support_options (option_name)
VALUES
    ('IR·대외마케팅 자료'),
    ('TI 시장자료'),
    ('Term Sheet 필요'),
    ('각 부서 산출물'),
    ('금융/법무 검토'),
    ('내부/삼성 협의'),
    ('도면/면적/기준 자료'),
    ('부서별 피드백'),
    ('브랜드 기준자료'),
    ('삼성 조건 확정'),
    ('숫자/법무 검토'),
    ('시장자료'),
    ('업데이트 입력값'),
    ('외부 자문'),
    ('운영정책 필요'),
    ('임차 후보 접촉'),
    ('임차인 요구사항'),
    ('임차조건 회신'),
    ('자문결과 필요'),
    ('장기 KPI 설계'),
    ('장기 금융전략'),
    ('장기 자료요건'),
    ('주주 구조 확인'),
    ('펀드자료 확인'),
    ('회의 일정 확정')
ON CONFLICT (option_name) DO NOTHING;

INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category)
VALUES ('STAKE_LG전자', 'LG전자', '임차인')
ON CONFLICT (stakeholder_code) DO UPDATE
SET stakeholder_name = EXCLUDED.stakeholder_name,
    category = EXCLUDED.category;

WITH source_updates(id, patch) AS (
    SELECT
        substring(raw.line FROM '''([0-9a-f-]{36})''::uuid')::uuid,
        substring(raw.line FROM '''(\{.*\})''::jsonb')::jsonb
    FROM regexp_split_to_table($updates$
        ('ba8c4321-6730-43e8-b943-499e73080103'::uuid, '{"project_code":"IOTA_SEOUL","sector_detail":"오피스 TI","task_name":"오피스 표준 TI 및 임차인 Fit-out 기준 설정","task_purpose":"임차조건·임대안정화비용·PF 모델에 반영 필요","deliverables":"오피스 TI 기준표, 비용범위, 부담주체","lead_dept_code":"DEPT_DESIGN","coop_dept_codes":"기업마케팅;LFC;사업2파트","external_party_code":"STAKE_잠재임차인","support_needed":"TI 시장자료","due_date":"2026-08-15","status":"진행중","next_action":"임차 제안서와 비용모델 연동"}'::jsonb) -- T-031 ← 엑셀 T-019,
        ('0f861cd2-1200-42b2-884d-055dad5136c6'::uuid, '{"project_code":"PFV_427","sector_detail":"호텔 인테리어","task_name":"호텔 인테리어/FF&E 범위 및 비용 정리","task_purpose":"호텔 CAPEX가 총사업비와 대주단 조건에 영향","deliverables":"호텔 인테리어 Scope, FF&E, Owner 부담범위","gate_stage":"G2","lead_dept_code":"DEPT_DEV","coop_dept_codes":"공간솔루션;기업마케팅","external_party_code":"STAKE_호텔브랜드사","support_needed":"브랜드 기준자료","due_date":"2026-08-31","status":"미착수","next_action":"브랜드 결정 후 Cost Book 작성"}'::jsonb) -- T-002 ← 엑셀 T-020,
        ('4d39b518-0acd-4e1f-8f59-b2f4c235da50'::uuid, '{"project_code":"IOTA_SEOUL","category_main":"임차/마케팅","sector_detail":"공간제안 패키지","task_name":"주요 임차인별 공간 제안 패키지 제작","task_purpose":"임차 확보가 PF 실행성과 대주단 설득의 핵심","deliverables":"광장/KB/삼성 등 임차 제안 패키지","target_axis":"PF","gate_stage":"G1","pmo_manager":"사업2파트","lead_dept_code":"DEPT_PM2","coop_dept_codes":"기업마케팅;공간솔루션","assignee":"미정","external_party_code":"STAKE_광장KB삼성등","support_needed":"임차인 요구사항","is_blocker":false,"needs_decision":false,"due_date":"2026-07-31","status":"진행중","importance_level":"PF필수","task_type":"정규","next_action":"임차인별 니즈를 도면·조건에 반영"}'::jsonb) -- T-012 ← 엑셀 T-023,
        ('60728020-3562-43d8-b3d7-62b28354e64d'::uuid, '{"project_code":"PFV_427","category_main":"임차/마케팅","sector_detail":"광장","task_name":"광장 임차 Term 및 면적·조건 확정","task_purpose":"427/통합 PF 스토리에서 핵심 임차사 역할 가능","deliverables":"임차 Term Sheet, 면적, 임대료, 인센티브","target_axis":"PF","gate_stage":"G1","pmo_manager":"사업2파트","lead_dept_code":"DEPT_MKT","coop_dept_codes":"사업2파트;공간솔루션;LFC","assignee":"미정","external_party_code":"STAKE_광장","support_needed":"임차조건 회신","is_blocker":true,"needs_decision":true,"due_date":"2026-07-19","status":"진행중","importance_level":"PF필수","task_type":"정규","next_action":"임차 조건과 PF 반영 가능성 확인"}'::jsonb) -- T-016 ← 엑셀 T-024,
        ('295a4e16-a0c4-40df-b50c-9941f7281d8c'::uuid, '{"project_code":"PFV_816","category_main":"임차/마케팅","sector_detail":"KB증권","task_name":"KB증권 임차 Term 및 면적·조건 확정","task_purpose":"오피스 선임차 수준이 PF 대주단 설득에 필요","deliverables":"후보별 면적/조건/의사결정 단계표","target_axis":"PF","gate_stage":"G1","pmo_manager":"사업2파트","lead_dept_code":"DEPT_MKT","coop_dept_codes":"사업2파트;공간솔루션;LFC","assignee":"미정","external_party_code":"STAKE_KB증권등","support_needed":"임차 후보 접촉","is_blocker":false,"needs_decision":false,"due_date":"2026-07-31","status":"진행중","importance_level":"PF필수","task_type":"정규","next_action":"금융권 임차 후보 우선순위화"}'::jsonb) -- T-007 ← 엑셀 T-026,
        ('7da53e7d-a3f8-4209-9018-f6633623d17d'::uuid, '{"project_code":"PFV_816","category_main":"임차/마케팅","sector_detail":"이지스 선임차","task_name":"816 선임차·책임임차·임차이전 가능성 정리","task_purpose":"816 단독/통합 PF 구조에서 선임차와 신용공여가 핵심","deliverables":"삼성/이지스 임차 조건표, LOC/책임범위","target_axis":"PF","gate_stage":"G1","pmo_manager":"사업2파트","lead_dept_code":"DEPT_PM2","coop_dept_codes":"LFC","assignee":"미정","external_party_code":"STAKE_삼성물산이지스","support_needed":"내부/삼성 협의","is_blocker":true,"needs_decision":true,"due_date":"2026-07-31","status":"진행중","importance_level":"PF필수","task_type":"정규","next_action":"816 선임차 유지 vs 427 이전 비교"}'::jsonb) -- T-022 ← 엑셀 T-027,
        ('9b7684ff-5ec3-47ed-a128-2f81d7815c80'::uuid, '{"category_main":"임차/마케팅","sector_detail":"임대료/NOC","task_name":"임차조건·E.NOC·인센티브 기준 통일","task_purpose":"임차 제안서와 재무모델·대주단 설명자료 일치 필요","deliverables":"임대료, 관리비, RF, TI, NOC 계산 기준표","lead_dept_code":"DEPT_MKT","coop_dept_codes":"LFC;공간솔루션;사업2파트","external_party_code":"STAKE_잠재임차인","support_needed":"시장자료","needs_decision":false,"due_date":"2026-08-15","status":"진행중","next_action":"임차조건 산식 단순화 및 내부 기준화"}'::jsonb) -- T-026 ← 엑셀 T-028,
        ('22897c33-96ba-4db7-a6cf-758848a57823'::uuid, '{"category_main":"PF/금융","sector_detail":"단독 PF","task_name":"427/816 단독 PF 조건 정리","task_purpose":"개별 PF 가능성 판단과 통합 PF 대비 기준점 필요","deliverables":"427 단독 Term, 816 단독 Term, 민감도","coop_dept_codes":"사업1파트;LFC","external_party_code":"STAKE_대주단","support_needed":"Term Sheet 필요","next_action":"단독 PF 가능/불가 조건을 수치화"}'::jsonb) -- T-006 ← 엑셀 T-029,
        ('185c6f9d-f5f5-479d-a69d-11807004460d'::uuid, '{"category_main":"PF/금융","sector_detail":"통합 PF","task_name":"대주단 일치화 및 통합 PF 구조 검토","task_purpose":"두 PFV 동시 추진 시 대주단, 담보, 구조가 복잡하므로 의사결정 필요","deliverables":"통합 PF 구조도, 대주단 전략, 담보 제공안","lead_dept_code":"DEPT_LFC","coop_dept_codes":"사업2파트;사업1파트","external_party_code":"STAKE_대주단","support_needed":"금융/법무 검토","is_blocker":true,"next_action":"단독 vs 통합 의사결정용 비교표 작성"}'::jsonb) -- T-004 ← 엑셀 T-030,
        ('3ff551cd-4b7d-45e2-869b-2c85c3f97302'::uuid, '{"category_main":"PF/금융","sector_detail":"재무모델","task_name":"427/816/통합 재무모델 업데이트","task_purpose":"원가·임차·호텔·신용공여 조건이 PF 조달액과 주주 설득에 영향","deliverables":"통합 재무모델, 사업비, 금융비용, 민감도","gate_stage":"G2","lead_dept_code":"DEPT_LFC","coop_dept_codes":"사업2파트;기업마케팅;개발솔루션","external_party_code":"STAKE_회계법인대주단","support_needed":"업데이트 입력값","is_blocker":true,"next_action":"각 부서 입력값 마감일 설정"}'::jsonb) -- T-011 ← 엑셀 T-031,
        ('5bdbd000-43e2-45c7-b8de-bcc6014eac18'::uuid, '{"project_code":"PFV_816","category_main":"PF/금융","sector_detail":"LOC/책임임차","task_name":"삼성 LOC/책임임차 비용 및 구조 반영","task_purpose":"816 단독 PF 비용절감/대주 설득 논리와 연결","deliverables":"LOC 수수료, 책임임차 비용, 이지스 부담 비교","lead_dept_code":"DEPT_LFC","coop_dept_codes":"사업2파트;기업마케팅","external_party_code":"STAKE_삼성물산대주단","support_needed":"삼성 조건 확정","next_action":"단독 PF 시 비용절감 논리 재검증"}'::jsonb) -- T-015 ← 엑셀 T-032,
        ('14dcdfaa-4af6-4fb1-a306-b0e3b90aedc7'::uuid, '{"category_main":"PF/금융","sector_detail":"PF CP","task_name":"PF 실행 선결조건 체크리스트 구축","task_purpose":"PF 실행 전 모든 부서 산출물을 CP 형태로 확인 필요","deliverables":"PF CP checklist, 담당/기한/증빙자료 목록","gate_stage":"G2","lead_dept_code":"DEPT_LFC","coop_dept_codes":"사업2파트;개발솔루션;공간솔루션;기업마케팅","assignee":"미정","external_party_code":"STAKE_대주단","support_needed":"각 부서 산출물","due_date":"2026-08-31","status":"미착수","next_action":"부서별 CP owner 지정"}'::jsonb) -- T-003 ← 엑셀 T-033,
        ('5746487d-2b2d-4ae2-a77a-687fbed95cb4'::uuid, '{"category_main":"구조/법무/세무","sector_detail":"리츠 전환","task_name":"427 리츠 전환 및 816 편입 구조 검토","task_purpose":"기존 통합 기본안이었으나 방향성이 미정이라 재검토 필요","deliverables":"리츠 전환 구조도, 절차, 세무/법무 쟁점","gate_stage":"G1","coop_dept_codes":"LFC;사업1파트","assignee":"미정","external_party_code":"STAKE_법무법인세무법인","support_needed":"외부 자문","is_blocker":true,"due_date":"2026-07-31","status":"진행중","next_action":"기본안 유지/폐기/보류 판단"}'::jsonb) -- T-014 ← 엑셀 T-034,
        ('cb74d9d6-13ac-401b-8eae-6d428f5780f4'::uuid, '{"category_main":"구조/법무/세무","sector_detail":"Asset/Share/합병","task_name":"Asset Deal·Share Deal·합병·현물출자 비교","task_purpose":"통합 구조별 절차·취득세·주주동의·실행가능성 판단 필요","deliverables":"구조별 비교표, 장단점, 세금/승인 이슈","target_axis":"PF","gate_stage":"G1","lead_dept_code":"DEPT_PM2","coop_dept_codes":"사업2파트;LFC","assignee":"미정","external_party_code":"STAKE_법무법인세무법인","support_needed":"자문결과 필요","needs_decision":true,"due_date":"2026-07-31","importance_level":"PF필수","next_action":"구조별 의사결정 기준 명확화"}'::jsonb) -- T-035 ← 엑셀 T-035,
        ('8613d21b-6f58-4512-9ef8-c42d0dcbc86d'::uuid, '{"category_main":"구조/법무/세무","sector_detail":"421호 펀드","task_name":"421호 펀드 및 수익자 이해관계 정리","task_purpose":"펀드 투자자·주주대여·수익배분 구조가 구조전환 및 PF에 영향","deliverables":"421호 투자자/수익권/배당구조 요약표","target_axis":"PF","gate_stage":"G1","lead_dept_code":"DEPT_PM1","coop_dept_codes":"사업2파트;LFC","external_party_code":"STAKE_수익자신탁사","support_needed":"펀드자료 확인","due_date":"2026-08-15","status":"진행중","importance_level":"PF필수","next_action":"구조전환 시 수익자 동의/통지 필요성 확인"}'::jsonb) -- T-024 ← 엑셀 T-036,
        ('6a35d1a3-4256-4eb4-82e2-b277c184b23b'::uuid, '{"category_main":"구조/법무/세무","sector_detail":"PFV 주주승인","task_name":"PFV별 주주승인·기존주주 설득 포인트 정리","task_purpose":"기존 주주 동의가 구조전환·PF 실행의 실질 변수","deliverables":"주주별 권리/동의필요/협상 포인트","target_axis":"PF","gate_stage":"G2","lead_dept_code":"DEPT_PM1","coop_dept_codes":"사업2파트","external_party_code":"STAKE_현대건설삼성물산신한","support_needed":"주주 구조 확인","needs_decision":true,"due_date":"2026-08-15","status":"진행중","importance_level":"PF필수","next_action":"주주별 이해관계와 설득논리 정리"}'::jsonb) -- T-017 ← 엑셀 T-037,
        ('7d8030f0-b296-4cab-a447-e07582c61fa0'::uuid, '{"category_main":"주주/보고","sector_detail":"내부 의사결정","task_name":"6~7월 단독/통합/호텔/시공 방향결정 회의 준비","task_purpose":"의사결정 없이 자료요청만 반복되는 구조 차단","deliverables":"의사결정 안건지, 옵션 비교표, 추천안","target_axis":"PF","gate_stage":"G1","lead_dept_code":"DEPT_PM2","coop_dept_codes":"개발솔루션","assignee":"한찬호","external_party_code":"STAKE_대표본부장파트장","support_needed":"회의 일정 확정","needs_decision":true,"due_date":"2026-07-12","status":"진행중","importance_level":"PF필수","next_action":"회의 전 부서별 산출물 마감 설정"}'::jsonb) -- T-021 ← 엑셀 T-038,
        ('ef5bebbf-5d2d-4359-a2a2-40e4d45e8b8e'::uuid, '{"category_main":"주주/보고","sector_detail":"주주사 보고","task_name":"주주사 보고자료 구조 및 리스크 문안 정리","task_purpose":"외부 보고 시 사업성·PF 가능성·원가 리스크 표현 필요","deliverables":"주주사 보고자료, Q&A, 리스크 대응문안","target_axis":"PF","gate_stage":"G2","coop_dept_codes":"LFC;사업1파트","assignee":"한찬호","external_party_code":"STAKE_주주사","support_needed":"숫자/법무 검토","needs_decision":true,"due_date":"2026-08-31","importance_level":"PF필수","next_action":"보고자료와 내부 의사결정안 분리"}'::jsonb) -- T-040 ← 엑셀 T-039,
        ('523fb42f-5ec9-4710-b2d3-2ea6635fae6d'::uuid, '{"category_main":"주주/보고","sector_detail":"Action Item","task_name":"회의록·Action Item·Due Date 관리","task_purpose":"업무가 흩어지지 않고 담당/기한/산출물 기준으로 회수되게 함","deliverables":"회의록, Action Item, 미완료/지원요청 목록","target_axis":"운영전환","coop_dept_codes":"전부서","assignee":"한찬호","external_party_code":"EXTERNAL","support_needed":"부서별 피드백","status":"진행중","task_type":"정규","next_action":"주간 업데이트 루틴 확정"}'::jsonb) -- T-013 ← 엑셀 T-040,
        ('ab79464a-cd4b-4c6b-a2b5-4ec57b1e2550'::uuid, '{"project_code":"IOTA_SEOUL","category_main":"준공/담보대출","sector_detail":"착공 이후 KPI","task_name":"PF 이후 착공·공정·원가·변경관리 KPI 설계","task_purpose":"PF가 끝이 아니라 준공과 Take-out까지 관리 필요","deliverables":"공정률, 원가, 변경, 리스크 KPI 대시보드","target_axis":"착공","gate_stage":"G4","lead_dept_code":"DEPT_DEV","coop_dept_codes":"사업2파트;LFC;공간솔루션","assignee":"미정","external_party_code":"STAKE_시공사CM","support_needed":"장기 KPI 설계","is_blocker":false,"needs_decision":false,"due_date":"2026-10-31","status":"미착수","importance_level":"준공필수","task_type":"정규","next_action":"PF CP 이후 공사관리 체계로 전환"}'::jsonb) -- T-027 ← 엑셀 T-041,
        ('bf2ed27b-5f4a-4f4e-84e3-a35f2d428dbe'::uuid, '{"project_code":"IOTA_SEOUL","category_main":"준공/담보대출","sector_detail":"준공 CP","task_name":"준공/사용승인 CP 및 증빙자료 관리체계 수립","task_purpose":"Take-out 대출 및 운영전환의 전제 조건","deliverables":"준공 CP, 사용승인 증빙, 담보대출 요구자료 목록","target_axis":"준공/사용승인","gate_stage":"G5","lead_dept_code":"DEPT_DEV","coop_dept_codes":"사업2파트;LFC","assignee":"미정","external_party_code":"STAKE_관청대주단","support_needed":"장기 자료요건","is_blocker":false,"needs_decision":false,"due_date":"2027-03-31","status":"미착수","importance_level":"준공필수","task_type":"정규","next_action":"장기 과제로 별도 로드맵 관리"}'::jsonb) -- T-033 ← 엑셀 T-042,
        ('29feb3eb-d57b-4b9f-8b22-345103b3182a'::uuid, '{"project_code":"IOTA_SEOUL","category_main":"준공/담보대출","sector_detail":"Take-out","task_name":"준공 후 담보대출/Take-out 전략 수립","task_purpose":"브릿지/PF 상환과 자산 안정화 전략의 최종 회수 단계","deliverables":"Take-out 대출 전략, 담보가치, DSCR, 임대안정화 계획","target_axis":"담보대출/Take-out","gate_stage":"G6","lead_dept_code":"DEPT_LFC","coop_dept_codes":"사업2파트;기업마케팅;개발솔루션","assignee":"미정","external_party_code":"STAKE_금융기관","support_needed":"장기 금융전략","is_blocker":false,"needs_decision":false,"due_date":"2027-03-31","status":"미착수","importance_level":"준공필수","task_type":"정규","next_action":"PF 조건과 준공 후 담보대출 연결"}'::jsonb) -- T-008 ← 엑셀 T-043,
        ('ee00e54d-535b-498b-ae7c-fccc75a71bcd'::uuid, '{"project_code":"IOTA_SEOUL","category_main":"준공/담보대출","sector_detail":"운영전환","task_name":"준공 후 운영·자산관리 전환계획 수립","task_purpose":"준공 이후 임대운영, 호텔운영, 담보대출 관리 필요","deliverables":"운영전환 체크리스트, 임대운영/호텔운영 업무분장","target_axis":"운영전환","gate_stage":"G6","lead_dept_code":"DEPT_PM2","coop_dept_codes":"기업마케팅;공간솔루션;LFC","assignee":"미정","external_party_code":"STAKE_운영사임차인","support_needed":"운영정책 필요","is_blocker":false,"needs_decision":false,"due_date":"2027-03-31","status":"미착수","importance_level":"준공필수","task_type":"정규","next_action":"장기 과제로 초기부터 관리"}'::jsonb) -- T-039 ← 엑셀 T-044
$updates$, E'\n') AS raw(line)
    WHERE raw.line LIKE '%::jsonb%'
)
UPDATE iota_v2.iota_pmo_tasks AS task
SET
    project_code = CASE WHEN patch ? 'project_code' THEN patch->>'project_code' ELSE task.project_code END,
    category_main = CASE WHEN patch ? 'category_main' THEN patch->>'category_main' ELSE task.category_main END,
    sector_detail = CASE WHEN patch ? 'sector_detail' THEN patch->>'sector_detail' ELSE task.sector_detail END,
    task_name = CASE WHEN patch ? 'task_name' THEN patch->>'task_name' ELSE task.task_name END,
    task_purpose = CASE WHEN patch ? 'task_purpose' THEN patch->>'task_purpose' ELSE task.task_purpose END,
    deliverables = CASE WHEN patch ? 'deliverables' THEN patch->>'deliverables' ELSE task.deliverables END,
    target_axis = CASE WHEN patch ? 'target_axis' THEN patch->>'target_axis' ELSE task.target_axis END,
    gate_stage = CASE WHEN patch ? 'gate_stage' THEN patch->>'gate_stage' ELSE task.gate_stage END,
    pmo_manager = CASE WHEN patch ? 'pmo_manager' THEN patch->>'pmo_manager' ELSE task.pmo_manager END,
    lead_dept_code = CASE WHEN patch ? 'lead_dept_code' THEN patch->>'lead_dept_code' ELSE task.lead_dept_code END,
    coop_dept_codes = CASE WHEN patch ? 'coop_dept_codes' THEN patch->>'coop_dept_codes' ELSE task.coop_dept_codes END,
    assignee = CASE WHEN patch ? 'assignee' THEN patch->>'assignee' ELSE task.assignee END,
    external_party_code = CASE WHEN patch ? 'external_party_code' THEN patch->>'external_party_code' ELSE task.external_party_code END,
    support_needed = CASE WHEN patch ? 'support_needed' THEN patch->>'support_needed' ELSE task.support_needed END,
    is_blocker = CASE WHEN patch ? 'is_blocker' THEN (patch->>'is_blocker')::boolean ELSE task.is_blocker END,
    needs_decision = CASE WHEN patch ? 'needs_decision' THEN (patch->>'needs_decision')::boolean ELSE task.needs_decision END,
    due_date = CASE WHEN patch ? 'due_date' THEN (patch->>'due_date')::date ELSE task.due_date END,
    status = CASE WHEN patch ? 'status' THEN patch->>'status' ELSE task.status END,
    importance_level = CASE WHEN patch ? 'importance_level' THEN patch->>'importance_level' ELSE task.importance_level END,
    task_type = CASE WHEN patch ? 'task_type' THEN patch->>'task_type' ELSE task.task_type END,
    next_action = CASE WHEN patch ? 'next_action' THEN patch->>'next_action' ELSE task.next_action END,
    notes = CASE WHEN patch ? 'notes' THEN patch->>'notes' ELSE task.notes END
FROM source_updates
WHERE task.id = source_updates.id;

WITH source_inserts(source_order, payload) AS (
    SELECT
        substring(raw.line FROM '^[[:space:]]*\(([0-9]+),')::integer,
        substring(raw.line FROM '''(\{.*\})''::jsonb')::jsonb
    FROM regexp_split_to_table($inserts$
        (1, '{"project_code":"PFV_427","category_main":"도면/설계","sector_detail":"리테일 프로그램","task_name":"리테일 조닝, 프로그램 도면 반영","task_purpose":"F&B 설비 설계가 불일치하면 PF 후 변경 리스크 확대","deliverables":"리테일 프로그램 도면, 면적/동선 검토표","target_axis":"PF","gate_stage":"G2","pmo_manager":"사업2파트","lead_dept_code":"DEPT_DESIGN","coop_dept_codes":"사업2파트;개발솔루션","assignee":"미정","external_party_code":"STAKE_설계사CM","support_needed":"도면/면적/기준 자료","is_blocker":false,"needs_decision":false,"due_date":"2026-08-15","status":"미착수","importance_level":"PF필수","task_type":"정규","next_action":"리테일 프로그램 요구사항과 F&B 설비 기준을 도면에 반영"}'::jsonb) -- T-041 ← 엑셀 T-018,
        (2, '{"project_code":"IOTA_SEOUL","category_main":"임차/마케팅","sector_detail":"대외마케팅","task_name":"IR추진 등 대외마케팅","task_purpose":"대외 홍보가 되는 장기적 마케팅 활동","deliverables":"기사화, 외부 협의체 구성 등","target_axis":"PF","gate_stage":"G1","pmo_manager":"사업2파트","lead_dept_code":"DEPT_PM2","coop_dept_codes":"기업마케팅;공간솔루션","assignee":"미정","external_party_code":"STAKE_서울시중구청","support_needed":"IR·대외마케팅 자료","is_blocker":false,"needs_decision":true,"due_date":"2026-07-31","status":"미착수","importance_level":"PF필수","task_type":"정규","next_action":"IR 추진안과 대외 협의체 구성계획 정리"}'::jsonb) -- T-042 ← 엑셀 T-021,
        (3, '{"project_code":"IOTA_SEOUL","category_main":"임차/마케팅","sector_detail":"렌트롤 관리","task_name":"전체 임차면적, 임관리비, 주차면수 정리","task_purpose":"임차 확보가 PF 실행성과 대주단 설득의 핵심","deliverables":"임차사 - 조건 - 운영수익 관리 연동","target_axis":"PF","gate_stage":"G1","pmo_manager":"사업2파트","lead_dept_code":"DEPT_PM2","coop_dept_codes":"기업마케팅;공간솔루션","assignee":"미정","external_party_code":"STAKE_광장KB삼성등","support_needed":"임차인 요구사항","is_blocker":false,"needs_decision":false,"due_date":"2026-09-15","status":"진행중","importance_level":"PF필수","task_type":"정규","next_action":"임차인별 니즈를 도면·조건에 반영"}'::jsonb) -- T-043 ← 엑셀 T-022,
        (4, '{"project_code":"IOTA_SEOUL","category_main":"임차/마케팅","sector_detail":"LG전자","task_name":"LG전자 임차 Term 및 면적·조건 확정","task_purpose":"오피스 선임차 수준이 PF 대주단 설득에 필요","deliverables":"LG전자 임차 Term Sheet, 면적, 임대료, 인센티브","target_axis":"PF","gate_stage":"G1","pmo_manager":"사업2파트","lead_dept_code":"DEPT_MKT","coop_dept_codes":"사업2파트;공간솔루션;LFC","assignee":"미정","external_party_code":"STAKE_LG전자","support_needed":"임차 후보 접촉","is_blocker":false,"needs_decision":false,"due_date":"2026-07-31","status":"진행중","importance_level":"PF필수","task_type":"정규","next_action":"LG전자 임차 조건과 의사결정 단계 확인"}'::jsonb) -- T-044 ← 엑셀 T-025
$inserts$, E'\n') AS raw(line)
    WHERE raw.line LIKE '%::jsonb%'
)
INSERT INTO iota_v2.iota_pmo_tasks (
    project_code,
    category_main,
    sector_detail,
    task_name,
    task_purpose,
    deliverables,
    target_axis,
    gate_stage,
    pmo_manager,
    lead_dept_code,
    coop_dept_codes,
    assignee,
    external_party_code,
    support_needed,
    is_blocker,
    needs_decision,
    due_date,
    status,
    importance_level,
    task_type,
    next_action,
    created_at
)
SELECT
    payload->>'project_code',
    payload->>'category_main',
    payload->>'sector_detail',
    payload->>'task_name',
    payload->>'task_purpose',
    payload->>'deliverables',
    payload->>'target_axis',
    payload->>'gate_stage',
    payload->>'pmo_manager',
    payload->>'lead_dept_code',
    payload->>'coop_dept_codes',
    payload->>'assignee',
    payload->>'external_party_code',
    payload->>'support_needed',
    (payload->>'is_blocker')::boolean,
    (payload->>'needs_decision')::boolean,
    (payload->>'due_date')::date,
    payload->>'status',
    payload->>'importance_level',
    payload->>'task_type',
    payload->>'next_action',
    CURRENT_TIMESTAMP + (source_order * INTERVAL '1 microsecond')
FROM source_inserts
WHERE NOT EXISTS (
    SELECT 1
    FROM iota_v2.iota_pmo_tasks AS existing
    WHERE existing.project_code = payload->>'project_code'
      AND existing.task_name = payload->>'task_name'
      AND existing.task_type <> '팝업'
);

SELECT iota_v2.sync_pmo_priority_scores();

-- 엑셀의 파생 상정사유·정렬키는 사용하지 않는다.
-- 영향받은 업무만 현재 앱의 기준으로 상정사유를 다시 만들고,
-- 정렬은 priority_score 및 현행 동률 규칙이 담당하도록 sort_key를 비운다.
WITH affected_tasks AS (
    SELECT task.id
    FROM iota_v2.iota_pmo_tasks AS task
    WHERE task.id IN (
        'ba8c4321-6730-43e8-b943-499e73080103'::uuid,
        '0f861cd2-1200-42b2-884d-055dad5136c6'::uuid,
        '4d39b518-0acd-4e1f-8f59-b2f4c235da50'::uuid,
        '60728020-3562-43d8-b3d7-62b28354e64d'::uuid,
        '295a4e16-a0c4-40df-b50c-9941f7281d8c'::uuid,
        '7da53e7d-a3f8-4209-9018-f6633623d17d'::uuid,
        '9b7684ff-5ec3-47ed-a128-2f81d7815c80'::uuid,
        '22897c33-96ba-4db7-a6cf-758848a57823'::uuid,
        '185c6f9d-f5f5-479d-a69d-11807004460d'::uuid,
        '3ff551cd-4b7d-45e2-869b-2c85c3f97302'::uuid,
        '5bdbd000-43e2-45c7-b8de-bcc6014eac18'::uuid,
        '14dcdfaa-4af6-4fb1-a306-b0e3b90aedc7'::uuid,
        '5746487d-2b2d-4ae2-a77a-687fbed95cb4'::uuid,
        'cb74d9d6-13ac-401b-8eae-6d428f5780f4'::uuid,
        '8613d21b-6f58-4512-9ef8-c42d0dcbc86d'::uuid,
        '6a35d1a3-4256-4eb4-82e2-b277c184b23b'::uuid,
        '7d8030f0-b296-4cab-a447-e07582c61fa0'::uuid,
        'ef5bebbf-5d2d-4359-a2a2-40e4d45e8b8e'::uuid,
        '523fb42f-5ec9-4710-b2d3-2ea6635fae6d'::uuid,
        'ab79464a-cd4b-4c6b-a2b5-4ec57b1e2550'::uuid,
        'bf2ed27b-5f4a-4f4e-84e3-a35f2d428dbe'::uuid,
        '29feb3eb-d57b-4b9f-8b22-345103b3182a'::uuid,
        'ee00e54d-535b-498b-ae7c-fccc75a71bcd'::uuid
    )
       OR task.task_name IN (
            '리테일 조닝, 프로그램 도면 반영',
            'IR추진 등 대외마케팅',
            '전체 임차면적, 임관리비, 주차면수 정리',
            'LG전자 임차 Term 및 면적·조건 확정'
       )
)
UPDATE iota_v2.iota_pmo_tasks AS task
SET
    agenda_reason = NULLIF(
        concat_ws(
            ' / ',
            CASE
                WHEN task.importance_level IN ('PF필수', '준공필수')
                    THEN task.importance_level
            END,
            CASE WHEN task.is_blocker THEN 'Blocker' END,
            CASE WHEN task.needs_decision THEN '의사결정' END,
            CASE
                WHEN lower(trim(COALESCE(task.support_needed, ''))) NOT IN (
                    '', '없음', 'n/a', 'na', '해당사항 없음', '해당사항없음', '-', 'none'
                )
                    THEN '지원:' || trim(task.support_needed)
            END,
            CASE
                WHEN task.status = '지연'
                     OR (
                        task.due_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date
                        AND task.status <> '완료'
                     )
                    THEN CASE
                        WHEN task.due_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date
                            THEN '지연(기한지남)'
                        ELSE '지연'
                    END
            END,
            CASE WHEN task.task_type = '팝업' THEN '팝업' END
        ),
        ''
    ),
    sort_key = NULL
FROM affected_tasks
WHERE task.id = affected_tasks.id;

COMMIT;

-- 적용 후 확인: 정규 업무는 44건이어야 한다.
SELECT
    COUNT(*) FILTER (WHERE task_type <> '팝업') AS regular_task_count,
    COUNT(*) FILTER (
        WHERE task_name IN (
            '리테일 조닝, 프로그램 도면 반영',
            'IR추진 등 대외마케팅',
            '전체 임차면적, 임관리비, 주차면수 정리',
            'LG전자 임차 Term 및 면적·조건 확정'
        )
    ) AS new_task_count
FROM iota_v2.iota_pmo_tasks;
