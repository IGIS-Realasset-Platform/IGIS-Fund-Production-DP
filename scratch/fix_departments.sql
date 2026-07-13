-- [IOTA 서울 CFT] 수행부서 기획추진(DEPT_PO) 누락 및 RLS 제약 위배 해결 SQL
-- Supabase 대시보드 -> SQL Editor에서 아래 쿼리를 실행해 주세요.

-- 1. 부서 마스터 테이블에 '기획추진' 부서 등록 (외래키 제약조건 위배 해결)
INSERT INTO iota_v2.iota_departments (dept_code, dept_name)
VALUES ('DEPT_PO', '기획추진')
ON CONFLICT (dept_code) DO NOTHING;

-- 2. 부서 마스터 테이블에 대한 온더플라이(On-the-fly) 실시간 등록 지원을 위한 INSERT RLS 정책 추가 (다른 마스터 테이블들과 일관성 확보)
CREATE POLICY "Allow authenticated insert to departments" 
ON iota_v2.iota_departments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
