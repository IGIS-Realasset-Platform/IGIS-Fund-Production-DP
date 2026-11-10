BEGIN;
DO $$
DECLARE category text;
BEGIN
 IF EXISTS(SELECT 1 FROM public.iota_stakeholder_master WHERE role_category IN ('투자자','SI')) THEN RAISE EXCEPTION 'Legacy category remains'; END IF;
 IF EXISTS(SELECT 1 FROM iota_archive.stakeholder_categories_20261110 b LEFT JOIN public.iota_stakeholder_master m ON m.id::text=b.row_id WHERE b.source='master' AND (m.id IS NULL OR (to_jsonb(m)-'role_category') IS DISTINCT FROM (b.previous-'role_category'))) THEN RAISE EXCEPTION 'Master data changed beyond category'; END IF;
 IF EXISTS(SELECT 1 FROM iota_archive.stakeholder_categories_20261110 b LEFT JOIN public.iota_work_feed_logs f ON f.log_id::text=b.row_id WHERE b.source='feed' AND (f.log_id IS NULL OR (to_jsonb(f)-'iota_seoul_log_stakeholders') IS DISTINCT FROM (b.previous-'iota_seoul_log_stakeholders'))) THEN RAISE EXCEPTION 'Feed content or permissions changed'; END IF;
 INSERT INTO public.iota_stakeholder_master(company_name,contact_name,role_category) VALUES('__category_test_20261110__','LP','투자자') RETURNING role_category INTO category;
 IF category<>'LP' THEN RAISE EXCEPTION 'LP write failed'; END IF;
 INSERT INTO public.iota_stakeholder_master(company_name,contact_name,role_category) VALUES('__category_test_20261110__','SI','SI') RETURNING role_category INTO category;
 IF category<>'SI(기업)' THEN RAISE EXCEPTION 'SI write failed'; END IF;
 INSERT INTO public.iota_stakeholder_master(company_name,contact_name,role_category) VALUES('__category_test_20261110__','대주','대주') RETURNING role_category INTO category;
 IF category<>'대주' THEN RAISE EXCEPTION 'Lender write failed'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: independent LP, lender and SI categories; legacy writes normalized; existing contacts, posts and permissions preserved; test rows rolled back' AS verification;
