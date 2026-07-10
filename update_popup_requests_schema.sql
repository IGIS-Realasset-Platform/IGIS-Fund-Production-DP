-- 1. iota_pmo_popup_requests 테이블에 생성자 이메일(created_by_email) 컬럼 추가
ALTER TABLE iota_v2.iota_pmo_popup_requests 
ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(100) DEFAULT NULL;

-- 2. 기존 소유자 관련 RLS 정책이 존재할 경우 삭제 (중복 생성 방지)
DROP POLICY IF EXISTS "Allow owner update and delete on popup_requests" ON iota_v2.iota_pmo_popup_requests;
DROP POLICY IF EXISTS "Allow authenticated insert to popup_requests" ON iota_v2.iota_pmo_popup_requests;

-- 3. 인증된 사용자(누구나) 본인 이메일을 지정하여 신규 요청 등록(INSERT)이 가능하도록 정책 추가
CREATE POLICY "Allow authenticated insert to popup_requests" ON iota_v2.iota_pmo_popup_requests
    FOR INSERT TO authenticated
    WITH CHECK (auth.jwt() ->> 'email' = created_by_email);

-- 4. 본인이 생성한 요청글에 한해 수정(UPDATE) 및 삭제(DELETE)가 가능하도록 정책 추가
CREATE POLICY "Allow owner update and delete on popup_requests" ON iota_v2.iota_pmo_popup_requests
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = created_by_email)
    WITH CHECK (auth.jwt() ->> 'email' = created_by_email);
