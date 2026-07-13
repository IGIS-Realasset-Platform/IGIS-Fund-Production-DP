-- 1. 기존 모든 CHECK 제약 조건 동적 제거 (이름에 관계없이 테이블 내 모든 CHECK 제약조건 일괄 삭제)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'iota_v2' 
          AND t.relname = 'iota_pmo_popup_requests'
          AND c.contype = 'c' -- 'c' = check constraint
    ) LOOP
        EXECUTE 'ALTER TABLE iota_v2.iota_pmo_popup_requests DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. 새로운 공통 표준 스펙으로 CHECK 제약 조건 재생성
-- A) category_name (업무분류) 제약 조건 추가
ALTER TABLE iota_v2.iota_pmo_popup_requests ADD CONSTRAINT iota_pmo_popup_requests_category_name_check 
    CHECK (category_name IN (
        '공통 PMO', '인허가', '호텔/운영', '시공/원가', '도면/설계', '인테리어/TI',
        '임차/마케팅', 'PF/금융', '구조/법무/세무', '주주/보고', '준공/담보대출', '일반 요청', '팝업/단발'
    ));

-- B) impact_level (중요도) 제약 조건 추가
ALTER TABLE iota_v2.iota_pmo_popup_requests ADD CONSTRAINT iota_pmo_popup_requests_impact_level_check 
    CHECK (impact_level IN ('높음', '중간', '낮음', '보통'));

-- C) handling_status (상태) 제약 조건 추가
ALTER TABLE iota_v2.iota_pmo_popup_requests ADD CONSTRAINT iota_pmo_popup_requests_handling_status_check 
    CHECK (handling_status IN (
        '미착수', '진행중', '검토중', '대기', '지연', '완료', '보류', '중단', '접수', '위임', '반려'
    ));
