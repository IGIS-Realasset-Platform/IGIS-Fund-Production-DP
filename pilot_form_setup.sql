-- ============================================================================
-- IOTA Seoul Pilot Form Database Schema
-- Team Leader's workform-advanced.html data integration
-- ============================================================================

-- 1. 핵심 업무 로그 테이블 (iota_seoul_logs)
CREATE TABLE IF NOT EXISTS public.iota_seoul_logs (
    log_id VARCHAR PRIMARY KEY,
    writer_staff_id VARCHAR,
    writer_name VARCHAR,
    work_date DATE,
    raw_text TEXT,
    summary VARCHAR(255),
    input_status VARCHAR DEFAULT 'submitted',
    source_system VARCHAR DEFAULT 'pilot_direct_form',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 프로젝트 연결 정보 테이블 (iota_seoul_log_links)
CREATE TABLE IF NOT EXISTS public.iota_seoul_log_links (
    link_id VARCHAR PRIMARY KEY,
    log_id VARCHAR NOT NULL REFERENCES public.iota_seoul_logs(log_id) ON DELETE CASCADE,
    proj_id VARCHAR,
    relation_type VARCHAR DEFAULT 'direct_input',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 이해관계자 테이블 (iota_seoul_log_stakeholders)
CREATE TABLE IF NOT EXISTS public.iota_seoul_log_stakeholders (
    sh_id VARCHAR PRIMARY KEY,
    log_id VARCHAR NOT NULL REFERENCES public.iota_seoul_logs(log_id) ON DELETE CASCADE,
    sh_name VARCHAR,
    role_category VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- iota_seoul_logs RLS
ALTER TABLE public.iota_seoul_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_seoul_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.iota_seoul_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.iota_seoul_logs FOR UPDATE USING (true);

-- iota_seoul_log_links RLS
ALTER TABLE public.iota_seoul_log_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_seoul_log_links FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.iota_seoul_log_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.iota_seoul_log_links FOR UPDATE USING (true);

-- iota_seoul_log_stakeholders RLS
ALTER TABLE public.iota_seoul_log_stakeholders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.iota_seoul_log_stakeholders FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.iota_seoul_log_stakeholders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.iota_seoul_log_stakeholders FOR UPDATE USING (true);
