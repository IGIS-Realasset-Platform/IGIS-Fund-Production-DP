-- 1. iota_pmo_tasks (통합 원장) 테이블에 단발성 업무를 위한 누락된 컬럼 추가
ALTER TABLE iota_v2.iota_pmo_tasks 
ADD COLUMN IF NOT EXISTS requester VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS request_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(100) DEFAULT NULL;

-- 2. 기존 단발성 업무 데이터(iota_pmo_popup_requests)를 iota_pmo_tasks로 백업 및 이전
INSERT INTO iota_v2.iota_pmo_tasks (
    project_code,
    category_main,
    task_name,
    task_purpose,
    deliverables,
    due_date,
    lead_dept_code,
    coop_dept_codes,
    importance_level,
    status,
    notes,
    task_type,
    requester,
    request_date,
    created_by_email
)
SELECT 
    project_code,
    CASE 
        WHEN category_name = '일반 요청' THEN '공통 PMO'
        ELSE COALESCE(category_name, '공통 PMO')
    END,
    request_detail,
    purpose,
    deliverables,
    due_date,
    assigned_dept_code,
    coop_dept_codes,
    CASE 
        WHEN impact_level = '중간' THEN '중간'
        WHEN impact_level = '보통' THEN '중간'
        ELSE COALESCE(impact_level, '중간')
    END,
    CASE 
        WHEN handling_status = '접수' THEN '미착수'
        WHEN handling_status = '위임' THEN '진행중'
        WHEN handling_status = '보류' THEN '보류'
        WHEN handling_status = '반려' THEN '중단'
        ELSE COALESCE(handling_status, '미착수')
    END,
    memo,
    '팝업', -- 단발성 업무 구분값
    requester,
    request_date,
    created_by_email
FROM iota_v2.iota_pmo_popup_requests
ON CONFLICT DO NOTHING;

-- 3. RLS(Row Level Security) 정책 갱신 및 추가
-- A) 누구나 본인 email을 지정하여 신규 단발성 업무 등록(INSERT)이 가능하도록 허용하는 정책 추가
DROP POLICY IF EXISTS "Allow authenticated insert to pmo_tasks" ON iota_v2.iota_pmo_tasks;
CREATE POLICY "Allow authenticated insert to pmo_tasks" ON iota_v2.iota_pmo_tasks
    FOR INSERT TO authenticated
    WITH CHECK (auth.jwt() ->> 'email' = created_by_email);

-- B) 본인이 생성한 단발성 업무에 한해 수정(UPDATE) 및 삭제(DELETE) 권한 부여 정책 추가
DROP POLICY IF EXISTS "Allow owner update and delete on pmo_tasks" ON iota_v2.iota_pmo_tasks;
CREATE POLICY "Allow owner update and delete on pmo_tasks" ON iota_v2.iota_pmo_tasks
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = created_by_email)
    WITH CHECK (auth.jwt() ->> 'email' = created_by_email);

-- 4. Supabase API 서버(PostgREST)의 스키마 캐시 즉시 갱신 강제
NOTIFY pgrst, 'reload schema';
