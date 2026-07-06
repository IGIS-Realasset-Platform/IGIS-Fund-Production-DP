-- ============================================================================
-- Supabase RLS (Row Level Security) Patch for Unrestricted Tables
-- Run this in the Supabase Dashboard SQL Editor to secure the database.
-- ============================================================================

-- 1. funds 테이블 RLS 설정
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read to funds" ON public.funds;
CREATE POLICY "Allow authenticated read to funds" ON public.funds FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow pilot managers write to funds" ON public.funds;
CREATE POLICY "Allow pilot managers write to funds" ON public.funds FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.iota_seoul_pilot_members WHERE role_code IN ('master', 'director'))
);

-- 2. beneficiary_exposures 테이블 RLS 설정
ALTER TABLE public.beneficiary_exposures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read to beneficiary_exposures" ON public.beneficiary_exposures;
CREATE POLICY "Allow authenticated read to beneficiary_exposures" ON public.beneficiary_exposures FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow pilot managers write to beneficiary_exposures" ON public.beneficiary_exposures;
CREATE POLICY "Allow pilot managers write to beneficiary_exposures" ON public.beneficiary_exposures FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.iota_seoul_pilot_members WHERE role_code IN ('master', 'director'))
);

-- 3. counterparties 테이블 RLS 설정
ALTER TABLE public.counterparties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read to counterparties" ON public.counterparties;
CREATE POLICY "Allow authenticated read to counterparties" ON public.counterparties FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow pilot managers write to counterparties" ON public.counterparties;
CREATE POLICY "Allow pilot managers write to counterparties" ON public.counterparties FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.iota_seoul_pilot_members WHERE role_code IN ('master', 'director'))
);

-- 4. counterparty_contacts 테이블 RLS 설정
ALTER TABLE public.counterparty_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read to counterparty_contacts" ON public.counterparty_contacts;
CREATE POLICY "Allow authenticated read to counterparty_contacts" ON public.counterparty_contacts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow pilot managers write to counterparty_contacts" ON public.counterparty_contacts;
CREATE POLICY "Allow pilot managers write to counterparty_contacts" ON public.counterparty_contacts FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.iota_seoul_pilot_members WHERE role_code IN ('master', 'director'))
);

-- 5. iota_digital_tasks 테이블 RLS 설정
ALTER TABLE public.iota_digital_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read to iota_digital_tasks" ON public.iota_digital_tasks;
CREATE POLICY "Allow authenticated read to iota_digital_tasks" ON public.iota_digital_tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow digital team write to iota_digital_tasks" ON public.iota_digital_tasks;
CREATE POLICY "Allow digital team write to iota_digital_tasks" ON public.iota_digital_tasks FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.iota_seoul_pilot_members WHERE workspace_code = 'WS_DIGITAL' OR role_code IN ('master', 'director'))
);

-- 6. iota_marketing_pipelines 테이블 RLS 설정
ALTER TABLE public.iota_marketing_pipelines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read to iota_marketing_pipelines" ON public.iota_marketing_pipelines;
CREATE POLICY "Allow authenticated read to iota_marketing_pipelines" ON public.iota_marketing_pipelines FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow marketing team write to iota_marketing_pipelines" ON public.iota_marketing_pipelines;
CREATE POLICY "Allow marketing team write to iota_marketing_pipelines" ON public.iota_marketing_pipelines FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.iota_seoul_pilot_members WHERE workspace_code = 'WS_MARKETING' OR role_code IN ('master', 'director'))
);

-- 7. iota_marketing_pipeline_logs 테이블 RLS 설정
ALTER TABLE public.iota_marketing_pipeline_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read to iota_marketing_pipeline_logs" ON public.iota_marketing_pipeline_logs;
CREATE POLICY "Allow authenticated read to iota_marketing_pipeline_logs" ON public.iota_marketing_pipeline_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow marketing team write to iota_marketing_pipeline_logs" ON public.iota_marketing_pipeline_logs;
CREATE POLICY "Allow marketing team write to iota_marketing_pipeline_logs" ON public.iota_marketing_pipeline_logs FOR ALL TO authenticated USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM public.iota_seoul_pilot_members WHERE workspace_code = 'WS_MARKETING' OR role_code IN ('master', 'director'))
);
