-- ============================================================================
-- IOTA Seoul Tenant & SI Collaboration MVP Database Schema
-- ============================================================================

-- 1. 기본 기업 및 계약 정보 테이블 (iota_tenants)
CREATE TABLE IF NOT EXISTS public.iota_tenants (
    id VARCHAR PRIMARY KEY,
    company_name VARCHAR NOT NULL,
    company_name_en VARCHAR,
    industry_category VARCHAR,
    employee_count INTEGER,
    major_services TEXT,
    current_building VARCHAR,
    rented_area NUMERIC, -- 전용 면적 (평)
    rented_floor VARCHAR,
    lease_start_date DATE,
    lease_end_date DATE,
    annual_rent NUMERIC, -- 연간 임대료 총액 (억원)
    tr_manager VARCHAR,
    pain_points TEXT,
    space_prospect VARCHAR, -- '증평' / '축소' / '유지'
    other_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 의사결정자 및 고객 인맥 관리 테이블 (iota_tenant_contacts)
CREATE TABLE IF NOT EXISTS public.iota_tenant_contacts (
    id VARCHAR PRIMARY KEY,
    tenant_id VARCHAR NOT NULL REFERENCES public.iota_tenants(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    position VARCHAR,
    role_category VARCHAR, -- '결정권자', 'CFO', '총무/시설', 'HR', '기타'
    phone VARCHAR,
    engagement_score INTEGER DEFAULT 3, -- 1 ~ 5점
    last_contact_date DATE,
    memo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 기초 공간 니즈 정보 테이블 (iota_tenant_space_needs)
CREATE TABLE IF NOT EXISTS public.iota_tenant_space_needs (
    id VARCHAR PRIMARY KEY,
    tenant_id VARCHAR NOT NULL UNIQUE REFERENCES public.iota_tenants(id) ON DELETE CASCADE,
    fixed_desks INTEGER DEFAULT 0,
    hot_desks INTEGER DEFAULT 0,
    meeting_rooms INTEGER DEFAULT 0,
    lounge_yn VARCHAR(1) DEFAULT 'N', -- 'Y' / 'N'
    storage_count INTEGER DEFAULT 0,
    parking_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SI 및 협업 기회 관리 테이블 (iota_tenant_si_opportunities)
CREATE TABLE IF NOT EXISTS public.iota_tenant_si_opportunities (
    id VARCHAR PRIMARY KEY,
    tenant_id VARCHAR REFERENCES public.iota_tenants(id) ON DELETE CASCADE,
    collab_type VARCHAR, -- '공동 펀드', '시설 연계 투자', 'ESG 금융', '기타'
    summary TEXT,
    collab_plan TEXT,
    status VARCHAR DEFAULT '대기', -- '대기', '제안중', '완료'
    pm_manager VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security (RLS) Policies (Enable Public Access for MVP)
-- ============================================================================

-- iota_tenants RLS
ALTER TABLE public.iota_tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_tenants FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.iota_tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.iota_tenants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.iota_tenants FOR DELETE USING (true);

-- iota_tenant_contacts RLS
ALTER TABLE public.iota_tenant_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_tenant_contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.iota_tenant_contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.iota_tenant_contacts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.iota_tenant_contacts FOR DELETE USING (true);

-- iota_tenant_space_needs RLS
ALTER TABLE public.iota_tenant_space_needs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_tenant_space_needs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.iota_tenant_space_needs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.iota_tenant_space_needs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.iota_tenant_space_needs FOR DELETE USING (true);

-- iota_tenant_si_opportunities RLS
ALTER TABLE public.iota_tenant_si_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_tenant_si_opportunities FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.iota_tenant_si_opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.iota_tenant_si_opportunities FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.iota_tenant_si_opportunities FOR DELETE USING (true);
