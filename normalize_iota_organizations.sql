BEGIN;

SELECT set_config('iota_v2.suppress_priority_change_log', 'on', TRUE);

INSERT INTO iota_v2.iota_departments (dept_code, dept_name)
VALUES
    ('DEPT_ALL', '전부서'),
    ('DEPT_DESIGN', '공간솔루션'),
    ('DEPT_DEV', '개발솔루션'),
    ('DEPT_KAM', 'KAM'),
    ('DEPT_LFC', 'LFC'),
    ('DEPT_MKT', '기업마케팅'),
    ('DEPT_PM1', '사업1파트'),
    ('DEPT_PM2', '사업2파트'),
    ('DEPT_PO', '기획추진')
ON CONFLICT (dept_code) DO UPDATE
SET dept_name = EXCLUDED.dept_name;

CREATE UNIQUE INDEX IF NOT EXISTS iota_departments_dept_name_uidx
ON iota_v2.iota_departments (dept_name);

CREATE OR REPLACE FUNCTION iota_v2.normalize_department_name(source_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    trimmed_name TEXT := btrim(source_name);
    compact_name TEXT := upper(regexp_replace(btrim(source_name), '[[:space:]·/_-]+', '', 'g'));
BEGIN
    IF trimmed_name IS NULL OR trimmed_name = '' THEN
        RETURN trimmed_name;
    END IF;

    IF compact_name IN (
        '사업그룹1파트', '사업관리1파트', '사업파트1', '사업PM1',
        'PM1', 'DEPTPM1', 'WSPM1'
    ) THEN
        RETURN '사업1파트';
    END IF;

    IF compact_name IN (
        '사업그룹2파트', '사업관리2파트', '사업파트2', '사업PM2',
        'PM2', 'DEPTPM2', 'WSPM2'
    ) THEN
        RETURN '사업2파트';
    END IF;

    IF compact_name IN (
        '개발관리', '개발관리실', '개발솔루션센터', '개발솔루션DSC',
        'DEPTDEV', 'WSDEVELOPMENT', 'WSDSC'
    ) THEN
        RETURN '개발솔루션';
    END IF;

    IF compact_name IN (
        '상품디지털', '설계실', '공간솔루션실', '공간솔루션센터',
        '공간솔루션SSC', 'DEPTDESIGN', 'WSDIGITAL', 'WSSSC'
    ) THEN
        RETURN '공간솔루션';
    END IF;

    IF compact_name IN (
        '마케팅팀', '기업마케팅실', '기업마케팅센터', '기업마케팅EMC',
        'DEPTMKT', 'WSMARKETING', 'WSEMC'
    ) THEN
        RETURN '기업마케팅';
    END IF;

    IF compact_name IN ('파이낸싱', '파이낸싱LFC', 'LFC금융', 'DEPTLFC', 'WSFINANCING', 'WSLFC') THEN
        RETURN 'LFC';
    END IF;

    IF compact_name IN ('펀드운용', '펀드운용KAM', 'DEPTKAM', 'WSFUND', 'WSKAM') THEN
        RETURN 'KAM';
    END IF;

    IF compact_name IN ('IPRWG', 'DEPTIPR', 'WSIPR') THEN
        RETURN 'IPR';
    END IF;

    IF compact_name IN ('전부서', 'DEPTALL') THEN
        RETURN '전부서';
    END IF;

    RETURN trimmed_name;
END;
$$;

CREATE OR REPLACE FUNCTION iota_v2.normalize_department_list(source_names TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE
        WHEN btrim(source_names) = '' THEN ''
        ELSE (
            SELECT string_agg(normalized_name, ';' ORDER BY first_position)
            FROM (
                SELECT
                    iota_v2.normalize_department_name(btrim(part)) AS normalized_name,
                    min(position) AS first_position
                FROM regexp_split_to_table(source_names, '[;,]+') WITH ORDINALITY AS values_with_order(part, position)
                WHERE btrim(part) <> ''
                GROUP BY iota_v2.normalize_department_name(btrim(part))
            ) AS normalized_values
        )
    END;
$$;

UPDATE public.iota_seoul_pilot_members
SET
    org_name = CASE
        WHEN staff_name IN ('권순일', '윤주형', '김제익', '류홍', '박만진', '박일훈', '이정원', '전무경') THEN '사업1파트'
        WHEN staff_name IN ('강순용', '한찬호', '박석제', '박채현', '소현준', '이수정', '조영비', '한수정') THEN '사업2파트'
        WHEN staff_name IN ('김현수', '현철호', '신민호', '이가현', '정수명') THEN '공간솔루션'
        WHEN staff_name = '전기영' THEN '기획추진'
        ELSE iota_v2.normalize_department_name(org_name)
    END,
    workspace_code = CASE
        WHEN staff_name IN ('권순일', '윤주형', '김제익', '류홍', '박만진', '박일훈', '이정원', '전무경') THEN 'WS_PM1'
        WHEN staff_name IN ('강순용', '한찬호', '박석제', '박채현', '소현준', '이수정', '조영비', '한수정') THEN 'WS_PM2'
        WHEN staff_name IN ('김현수', '현철호', '신민호', '이가현', '정수명') THEN 'WS_SSC'
        WHEN staff_name = '전기영' THEN 'WS_MASTER'
        WHEN org_name IN ('개발관리', '개발관리실', '개발솔루션', '개발솔루션센터')
          OR workspace_code IN ('WS_DEVELOPMENT', 'WS_DSC') THEN 'WS_DSC'
        WHEN org_name IN ('기업마케팅', '기업마케팅실', '기업마케팅센터')
          OR workspace_code IN ('WS_MARKETING', 'WS_EMC') THEN 'WS_EMC'
        WHEN org_name IN ('상품·디지털', '상품/디지털', '설계실', '공간솔루션', '공간솔루션실', '공간솔루션센터')
          OR workspace_code IN ('WS_DIGITAL', 'WS_SSC') THEN 'WS_SSC'
        WHEN org_name IN ('파이낸싱', 'LFC')
          OR workspace_code IN ('WS_FINANCING', 'WS_LFC') THEN 'WS_LFC'
        WHEN org_name IN ('펀드운용', 'KAM')
          OR workspace_code IN ('WS_FUND', 'WS_KAM') THEN 'WS_KAM'
        ELSE workspace_code
    END
WHERE org_name IS NOT NULL OR workspace_code IS NOT NULL;

UPDATE iota_v2.iota_pmo_tasks
SET
    pmo_manager = iota_v2.normalize_department_name(pmo_manager),
    coop_dept_codes = iota_v2.normalize_department_list(coop_dept_codes)
WHERE pmo_manager IS DISTINCT FROM iota_v2.normalize_department_name(pmo_manager)
   OR coop_dept_codes IS DISTINCT FROM iota_v2.normalize_department_list(coop_dept_codes);

UPDATE iota_v2.iota_pmo_popup_requests
SET coop_dept_codes = iota_v2.normalize_department_list(coop_dept_codes)
WHERE coop_dept_codes IS DISTINCT FROM iota_v2.normalize_department_list(coop_dept_codes);

CREATE OR REPLACE FUNCTION iota_v2.normalize_pmo_department_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_TABLE_NAME = 'iota_pmo_tasks' THEN
        NEW.pmo_manager := iota_v2.normalize_department_name(NEW.pmo_manager);
    END IF;
    NEW.coop_dept_codes := iota_v2.normalize_department_list(NEW.coop_dept_codes);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_pmo_department_fields_trigger ON iota_v2.iota_pmo_tasks;
CREATE TRIGGER normalize_pmo_department_fields_trigger
BEFORE INSERT OR UPDATE OF pmo_manager, coop_dept_codes
ON iota_v2.iota_pmo_tasks
FOR EACH ROW
EXECUTE FUNCTION iota_v2.normalize_pmo_department_fields();

DROP TRIGGER IF EXISTS normalize_popup_department_fields_trigger ON iota_v2.iota_pmo_popup_requests;
CREATE TRIGGER normalize_popup_department_fields_trigger
BEFORE INSERT OR UPDATE OF coop_dept_codes
ON iota_v2.iota_pmo_popup_requests
FOR EACH ROW
EXECUTE FUNCTION iota_v2.normalize_pmo_department_fields();

CREATE OR REPLACE FUNCTION public.normalize_iota_member_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.staff_name IN ('권순일', '윤주형', '김제익', '류홍', '박만진', '박일훈', '이정원', '전무경') THEN
        NEW.org_name := '사업1파트';
        NEW.workspace_code := 'WS_PM1';
    ELSIF NEW.staff_name IN ('강순용', '한찬호', '박석제', '박채현', '소현준', '이수정', '조영비', '한수정') THEN
        NEW.org_name := '사업2파트';
        NEW.workspace_code := 'WS_PM2';
    ELSIF NEW.staff_name IN ('김현수', '현철호', '신민호', '이가현', '정수명') THEN
        NEW.org_name := '공간솔루션';
        NEW.workspace_code := 'WS_SSC';
    ELSIF NEW.staff_name = '전기영' THEN
        NEW.org_name := '기획추진';
        NEW.workspace_code := 'WS_MASTER';
    ELSE
        NEW.org_name := iota_v2.normalize_department_name(NEW.org_name);
        NEW.workspace_code := CASE
            WHEN NEW.org_name = '개발솔루션' THEN 'WS_DSC'
            WHEN NEW.org_name = '기업마케팅' THEN 'WS_EMC'
            WHEN NEW.org_name = '공간솔루션' THEN 'WS_SSC'
            WHEN NEW.org_name = 'LFC' THEN 'WS_LFC'
            WHEN NEW.org_name = 'KAM' THEN 'WS_KAM'
            WHEN NEW.org_name = '사업1파트' THEN 'WS_PM1'
            WHEN NEW.org_name = '사업2파트' THEN 'WS_PM2'
            ELSE NEW.workspace_code
        END;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_iota_member_organization_trigger ON public.iota_seoul_pilot_members;
CREATE TRIGGER normalize_iota_member_organization_trigger
BEFORE INSERT OR UPDATE OF staff_name, org_name, workspace_code
ON public.iota_seoul_pilot_members
FOR EACH ROW
EXECUTE FUNCTION public.normalize_iota_member_organization();

CREATE OR REPLACE FUNCTION public.normalize_iota_log_workspace_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    normalized_code TEXT := upper(coalesce(NEW.metadata ->> 'workspace_code', ''));
    normalized_label TEXT := coalesce(NEW.metadata ->> 'workspace_label', '');
    normalized_org TEXT;
    writer_org TEXT;
BEGIN
    IF NEW.metadata IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.source_system = 'task_board'
       OR lower(coalesce(NEW.metadata ->> 'is_task_board', 'false')) = 'true' THEN
        NEW.metadata := jsonb_set(NEW.metadata, '{workspace_code}', to_jsonb('WS_PMO'::TEXT), TRUE);
        NEW.metadata := jsonb_set(NEW.metadata, '{workspace_label}', to_jsonb('통합업무보드'::TEXT), TRUE);
        RETURN NEW;
    END IF;

    SELECT org_name
    INTO writer_org
    FROM public.iota_seoul_pilot_members
    WHERE staff_name = NEW.writer_name
       OR email = NEW.writer_staff_id::TEXT
    ORDER BY CASE WHEN email = NEW.writer_staff_id::TEXT THEN 0 ELSE 1 END
    LIMIT 1;

    normalized_org := iota_v2.normalize_department_name(split_part(normalized_label, '-', 1));
    normalized_code := CASE
        WHEN normalized_code = 'WS_PM' THEN
            CASE
                WHEN upper(regexp_replace(normalized_label, '[[:space:]·/_-]+', '', 'g')) LIKE '%PM2%'
                  OR writer_org = '사업2파트' THEN 'WS_PM2'
                ELSE 'WS_PM1'
            END
        WHEN normalized_code = 'WS_DEVELOPMENT' THEN 'WS_DSC'
        WHEN normalized_code = 'WS_MARKETING' THEN 'WS_EMC'
        WHEN normalized_code = 'WS_DIGITAL' THEN 'WS_SSC'
        WHEN normalized_code = 'WS_FINANCING' THEN 'WS_LFC'
        WHEN normalized_code = 'WS_FUND' THEN 'WS_KAM'
        WHEN normalized_code = '' AND normalized_org = '사업1파트' THEN 'WS_PM1'
        WHEN normalized_code = '' AND normalized_org = '사업2파트' THEN 'WS_PM2'
        WHEN normalized_code = '' AND normalized_org = '개발솔루션' THEN 'WS_DSC'
        WHEN normalized_code = '' AND normalized_org = '기업마케팅' THEN 'WS_EMC'
        WHEN normalized_code = '' AND normalized_org = '공간솔루션' THEN 'WS_SSC'
        WHEN normalized_code = '' AND normalized_org = 'LFC' THEN 'WS_LFC'
        WHEN normalized_code = '' AND normalized_org = 'KAM' THEN 'WS_KAM'
        WHEN normalized_code = '' AND normalized_org = 'IPR' THEN 'WS_IPR'
        ELSE normalized_code
    END;

    normalized_label := CASE normalized_code
        WHEN 'WS_PM1' THEN '사업1파트'
        WHEN 'WS_PM2' THEN '사업2파트'
        WHEN 'WS_DSC' THEN '개발솔루션'
        WHEN 'WS_EMC' THEN '기업마케팅'
        WHEN 'WS_SSC' THEN '공간솔루션'
        WHEN 'WS_LFC' THEN 'LFC'
        WHEN 'WS_KAM' THEN 'KAM'
        WHEN 'WS_IPR' THEN 'IPR'
        ELSE normalized_label
    END;

    IF normalized_code <> '' THEN
        NEW.metadata := jsonb_set(NEW.metadata, '{workspace_code}', to_jsonb(normalized_code), TRUE);
    END IF;
    IF normalized_label <> '' THEN
        NEW.metadata := jsonb_set(NEW.metadata, '{workspace_label}', to_jsonb(normalized_label), TRUE);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_iota_log_workspace_metadata_trigger
ON public.iota_seoul_logs;
CREATE TRIGGER normalize_iota_log_workspace_metadata_trigger
BEFORE INSERT OR UPDATE OF metadata, source_system
ON public.iota_seoul_logs
FOR EACH ROW
EXECUTE FUNCTION public.normalize_iota_log_workspace_metadata();

UPDATE public.iota_seoul_logs
SET metadata = metadata
WHERE source_system = 'task_board'
   OR coalesce(metadata ->> 'workspace_code', '') IN (
       'WS_PM', 'WS_DEVELOPMENT', 'WS_MARKETING', 'WS_DIGITAL', 'WS_FINANCING', 'WS_FUND'
   )
   OR coalesce(metadata ->> 'workspace_label', '') ~
      '(개발관리실|공간솔루션실|기업마케팅실|사업 PM|사업PM|사업관리[12]파트)';

DROP POLICY IF EXISTS "Allow PM2 and admin full access to popup_requests"
ON iota_v2.iota_pmo_popup_requests;
CREATE POLICY "Allow PM2 and admin full access to popup_requests"
ON iota_v2.iota_pmo_popup_requests
FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code IN ('WS_PM2', 'WS_PM')
           OR role_code IN ('master', 'director')
    )
)
WITH CHECK (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code IN ('WS_PM2', 'WS_PM')
           OR role_code IN ('master', 'director')
    )
);

DROP POLICY IF EXISTS "Allow PM2 planning and admin full access to pmo_tasks"
ON iota_v2.iota_pmo_tasks;
CREATE POLICY "Allow PM2 planning and admin full access to pmo_tasks"
ON iota_v2.iota_pmo_tasks
FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code IN ('WS_PM2', 'WS_PM')
           OR role_code IN ('master', 'director')
           OR role_code ILIKE '%PO%'
           OR org_name IN ('사업2파트', '기획추진')
           OR org_name ILIKE '%시스템 관리자%'
    )
)
WITH CHECK (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code IN ('WS_PM2', 'WS_PM')
           OR role_code IN ('master', 'director')
           OR role_code ILIKE '%PO%'
           OR org_name IN ('사업2파트', '기획추진')
           OR org_name ILIKE '%시스템 관리자%'
    )
);

DROP POLICY IF EXISTS "Allow digital team write to iota_digital_tasks"
ON public.iota_digital_tasks;
CREATE POLICY "Allow spatial solution write to iota_digital_tasks"
ON public.iota_digital_tasks
FOR ALL
TO authenticated
USING (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code IN ('WS_SSC', 'WS_DIGITAL')
           OR role_code IN ('master', 'director')
    )
)
WITH CHECK (
    auth.jwt() ->> 'email' IN (
        SELECT email
        FROM public.iota_seoul_pilot_members
        WHERE workspace_code IN ('WS_SSC', 'WS_DIGITAL')
           OR role_code IN ('master', 'director')
    )
);

SELECT set_config('iota_v2.suppress_priority_change_log', 'off', TRUE);

COMMIT;

SELECT jsonb_build_object(
    'departments', (
        SELECT jsonb_agg(jsonb_build_object('code', dept_code, 'name', dept_name) ORDER BY dept_code)
        FROM iota_v2.iota_departments
    ),
    'members', (
        SELECT jsonb_object_agg(org_name, member_count)
        FROM (
            SELECT coalesce(org_name, '(없음)') AS org_name, count(*) AS member_count
            FROM public.iota_seoul_pilot_members
            GROUP BY coalesce(org_name, '(없음)')
        ) AS member_counts
    ),
    'legacy_member_rows', (
        SELECT count(*)
        FROM public.iota_seoul_pilot_members
        WHERE coalesce(org_name, '') ~ '(개발관리|상품·디지털|상품/디지털|센터|실$|사업PM|사업관리[12]파트)'
           OR workspace_code IN ('WS_PM', 'WS_DEVELOPMENT', 'WS_MARKETING', 'WS_DIGITAL', 'WS_FINANCING', 'WS_FUND')
    ),
    'legacy_pmo_rows', (
        SELECT count(*)
        FROM iota_v2.iota_pmo_tasks
        WHERE coalesce(pmo_manager, '') ~ '(개발관리|상품·디지털|상품/디지털|센터|실$|사업관리[12]파트)'
           OR coalesce(coop_dept_codes, '') ~ '(개발관리|상품·디지털|상품/디지털|센터|실|사업관리[12]파트)'
    ),
    'legacy_log_rows', (
        SELECT count(*)
        FROM public.iota_seoul_logs
        WHERE coalesce(metadata ->> 'workspace_code', '') IN (
                  'WS_PM', 'WS_DEVELOPMENT', 'WS_MARKETING', 'WS_DIGITAL', 'WS_FINANCING', 'WS_FUND'
              )
           OR coalesce(metadata ->> 'workspace_label', '') ~
              '(개발관리실|공간솔루션실|기업마케팅실|사업 PM|사업PM|사업관리[12]파트)'
    )
) AS organization_normalization_result;
