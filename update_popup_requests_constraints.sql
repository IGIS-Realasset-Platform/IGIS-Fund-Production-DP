-- 단발성 업무 요청 테이블(iota_pmo_popup_requests)의 CHECK 제약 조건을 새로운 공통 표준 스펙에 맞춰 수정하는 마이그레이션 SQL

-- 1. category_name (업무분류) 제약 조건 업데이트
-- 기존 제약 조건(있다면) 삭제 후 '일반 요청' 및 기존 '팝업/단발'을 허용하도록 재생성
ALTER TABLE iota_v2.iota_pmo_popup_requests DROP CONSTRAINT IF EXISTS iota_pmo_popup_requests_category_name_check;
ALTER TABLE iota_v2.iota_pmo_popup_requests ADD CONSTRAINT iota_pmo_popup_requests_category_name_check 
    CHECK (category_name IN (
        '공통 PMO', '인허가', '호텔/운영', '시공/원가', '도면/설계', '인테리어/TI',
        '임차/마케팅', 'PF/금융', '구조/법무/세무', '주주/보고', '준공/담보대출', '일반 요청', '팝업/단발'
    ));

-- 2. impact_level (중요도) 제약 조건 업데이트
-- 기존 제약 조건 삭제 후 '중간' 및 기존 '보통'을 허용하도록 재생성
ALTER TABLE iota_v2.iota_pmo_popup_requests DROP CONSTRAINT IF EXISTS iota_pmo_popup_requests_impact_level_check;
ALTER TABLE iota_v2.iota_pmo_popup_requests ADD CONSTRAINT iota_pmo_popup_requests_impact_level_check 
    CHECK (impact_level IN ('높음', '중간', '낮음', '보통'));

-- 3. handling_status (상태) 제약 조건 업데이트
-- 기존 제약 조건 삭제 후 통합 보드와 동일한 상태(미착수, 진행중, 완료 등) 및 레거시 상태를 모두 허용하도록 재생성
ALTER TABLE iota_v2.iota_pmo_popup_requests DROP CONSTRAINT IF EXISTS iota_pmo_popup_requests_handling_status_check;
ALTER TABLE iota_v2.iota_pmo_popup_requests ADD CONSTRAINT iota_pmo_popup_requests_handling_status_check 
    CHECK (handling_status IN (
        '미착수', '진행중', '검토중', '대기', '지연', '완료', '보류', '중단', '접수', '위임', '반려'
    ));
