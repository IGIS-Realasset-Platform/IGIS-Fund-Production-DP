-- ============================================================================
-- IOTA CFT Phase 2: Staging Database Schema Specification (DDL)
-- Isolated under the schema 'iota_v2' to prevent conflicts with Phase 1.
-- ============================================================================

-- 1. 신규 독립 스키마 생성 및 설정
CREATE SCHEMA IF NOT EXISTS iota_v2;

-- 2. 기성 기준값 마스터 테이블 생성 (99_기준값 대응 그릇 설계)

-- A) 프로젝트 기준 정보 테이블
CREATE TABLE iota_v2.iota_projects (
    project_code VARCHAR(50) PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B) 부서 기준 정보 테이블
CREATE TABLE iota_v2.iota_departments (
    dept_code VARCHAR(50) PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C) 외부상대방(이해관계자) 기준 정보 테이블
CREATE TABLE iota_v2.iota_stakeholders (
    stakeholder_code VARCHAR(50) PRIMARY KEY,
    stakeholder_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- LP, 시행사, 시공사, 대주단, 기타 등
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. 기준값 데이터 적재 (Seed Data - 99_기준값 연동)

-- A) 프로젝트 마스터 데이터 적재
INSERT INTO iota_v2.iota_projects (project_code, project_name) VALUES
('IOTA_SEOUL', 'IOTA 공통'),
('PFV_427', '427 PFV'),
('PFV_816', '816 PFV'),
('FUND_421', '421Fund'),
('EXTERNAL', '외부')
ON CONFLICT (project_code) DO UPDATE SET project_name = EXCLUDED.project_name;

-- B) 부서 마스터 데이터 적재
INSERT INTO iota_v2.iota_departments (dept_code, dept_name) VALUES
('DEPT_PM2', '사업관리2파트'),
('DEPT_LFC', 'LFC(금융)'),
('DEPT_DEV', '개발관리실'),
('DEPT_DESIGN', '설계실'),
('DEPT_MKT', '마케팅팀')
ON CONFLICT (dept_code) DO NOTHING;

-- C) 외부상대방 마스터 데이터 적재
INSERT INTO iota_v2.iota_stakeholders (stakeholder_code, stakeholder_name, category) VALUES
('SH_LP_01', '이지스자산운용', 'LP'),
('SH_DEV_01', '이오타시행사', '시행사'),
('SH_CON_01', '이지스건설', '시공사'),
('SH_FIN_01', '한국대주은행', '대주단')
ON CONFLICT (stakeholder_code) DO NOTHING;


-- 4. 메인 실행 테이블 스펙 정의 및 생성 (외래키 제약조건 포함)

-- A) iota_pmo_tasks (PMO 통합 원장 테이블)
CREATE TABLE iota_v2.iota_pmo_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(50) REFERENCES iota_v2.iota_projects(project_code),
    category_main VARCHAR(100) NOT NULL,                                     -- 대분류 (PMO, 호텔, 인허가 등)
    sector_detail VARCHAR(100),                                              -- 세부섹터
    task_name VARCHAR(255) NOT NULL,                                         -- 업무명
    task_purpose TEXT,                                                       -- 업무목적 및 PF/준공 영향
    deliverables TEXT,                                                       -- 필요 산출물
    gate_stage VARCHAR(10) CHECK (gate_stage IN ('G0', 'G1', 'G2', 'G3', 'G4')), -- G0~G4 마일스톤 단계
    pmo_manager VARCHAR(100) DEFAULT '사업관리2파트',                         -- PMO 총괄 담당
    lead_dept_code VARCHAR(50) REFERENCES iota_v2.iota_departments(dept_code), -- 주관부서 외래키
    coop_dept_codes VARCHAR(255),                                            -- 협업부서 (세미콜론 구분)
    assignee VARCHAR(100),                                                   -- 담당자
    external_party_code VARCHAR(50) REFERENCES iota_v2.iota_stakeholders(stakeholder_code), -- 외부상대방 외래키
    is_blocker BOOLEAN DEFAULT false,                                        -- Blocker 지연 리스크 여부
    needs_decision BOOLEAN DEFAULT false,                                    -- 의사결정 필요 여부
    due_date DATE,                                                           -- 기한
    status VARCHAR(50) DEFAULT '미착수' CHECK (status IN ('미착수', '진행중', '완료', '지연')), -- 진행 상태
    priority_score INTEGER DEFAULT 0,                                        -- 우선순위 가중치 점수
    meeting_grade VARCHAR(10) DEFAULT 'B' CHECK (meeting_grade IN ('A', 'B')), -- 회의상정등급 (A_즉시상정, B_회의점검)
    next_action TEXT,                                                        -- 다음 액션
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B) iota_pmo_popup_requests (팝업 및 단발성 요청 관리 테이블)
CREATE TABLE iota_v2.iota_pmo_popup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_date DATE DEFAULT CURRENT_DATE,                                   -- 접수일
    requester VARCHAR(100) NOT NULL,                                         -- 요청자 및 소속 부서
    project_code VARCHAR(50) REFERENCES iota_v2.iota_projects(project_code), -- 프로젝트 구분 외래키
    category_name VARCHAR(100),                                              -- 카테고리
    request_detail TEXT NOT NULL,                                            -- 요청 업무 상세
    purpose TEXT,                                                            -- 요청 목적
    deliverables TEXT,                                                       -- 필요 산출물
    due_date DATE,                                                           -- 요청 기한
    assigned_dept_code VARCHAR(50) REFERENCES iota_v2.iota_departments(dept_code), -- 원 수행 부서 외래키
    coop_dept_codes VARCHAR(255),                                            -- 협업 부서
    impact_level VARCHAR(20) CHECK (impact_level IN ('높음', '보통', '낮음')),  -- 정규업무 영향도
    handling_status VARCHAR(20) DEFAULT '접수' CHECK (handling_status IN ('접수', '위임', '보류', '반려')), -- 처리 상태
    memo TEXT,                                                               -- 메모
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. Row Level Security (RLS) 보안 정책 가동

-- RLS 활성화
ALTER TABLE iota_v2.iota_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE iota_v2.iota_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE iota_v2.iota_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE iota_v2.iota_pmo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE iota_v2.iota_pmo_popup_requests ENABLE ROW LEVEL SECURITY;

-- A) 인증된 모든 임직원 대상 읽기 허용 정책
CREATE POLICY "Allow authenticated read to projects" ON iota_v2.iota_projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read to departments" ON iota_v2.iota_departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read to stakeholders" ON iota_v2.iota_stakeholders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read to pmo_tasks" ON iota_v2.iota_pmo_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read to popup_requests" ON iota_v2.iota_pmo_popup_requests FOR SELECT TO authenticated USING (true);

-- B) 사업관리2파트 및 임원진/어드민 대상 전체 편집 권한 부여 정책 (useAuth 연동)
-- iota_seoul_pilot_members 테이블(기성)을 조회하여 소속 및 직무 검증 수행
CREATE POLICY "Allow PM2 and admin full access to pmo_tasks" ON iota_v2.iota_pmo_tasks
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM public.iota_seoul_pilot_members 
            WHERE workspace_code = 'WS_PM' OR role_code IN ('master', 'director')
        )
    );

CREATE POLICY "Allow PM2 and admin full access to popup_requests" ON iota_v2.iota_pmo_popup_requests
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'email' IN (
            SELECT email FROM public.iota_seoul_pilot_members 
            WHERE workspace_code = 'WS_PM' OR role_code IN ('master', 'director')
        )
    );
