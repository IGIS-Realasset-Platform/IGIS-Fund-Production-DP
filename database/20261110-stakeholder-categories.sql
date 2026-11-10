BEGIN;
-- Preserve the original values without changing application access policies.
CREATE TABLE IF NOT EXISTS iota_archive.stakeholder_categories_20261110 AS
SELECT 'master'::text AS source, id::text AS row_id, to_jsonb(m) AS previous
FROM public.iota_stakeholder_master m WHERE role_category IN ('투자자','SI')
UNION ALL
SELECT 'log', sh_id::text, to_jsonb(s)
FROM public.iota_seoul_log_stakeholders s WHERE role_category IN ('투자자','SI')
UNION ALL
SELECT 'feed', log_id::text, to_jsonb(f)
FROM public.iota_work_feed_logs f
WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(f.iota_seoul_log_stakeholders) s WHERE s->>'role_category' IN ('투자자','SI'));

ALTER TABLE iota_archive.stakeholder_categories_20261110 ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.normalize_iota_stakeholder_category(value text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
SELECT CASE value WHEN '투자자' THEN 'LP' WHEN 'SI' THEN 'SI(기업)' ELSE value END;
$$;
CREATE OR REPLACE FUNCTION public.normalize_iota_stakeholder_row()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 NEW.role_category := public.normalize_iota_stakeholder_category(NEW.role_category);
 RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER normalize_stakeholder_category
BEFORE INSERT OR UPDATE OF role_category ON public.iota_stakeholder_master
FOR EACH ROW EXECUTE FUNCTION public.normalize_iota_stakeholder_row();
CREATE OR REPLACE TRIGGER normalize_stakeholder_category
BEFORE INSERT OR UPDATE OF role_category ON public.iota_seoul_log_stakeholders
FOR EACH ROW EXECUTE FUNCTION public.normalize_iota_stakeholder_row();

CREATE OR REPLACE FUNCTION public.normalize_iota_feed_stakeholders()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 SELECT coalesce(jsonb_agg(CASE WHEN item->>'role_category' IN ('투자자','SI')
 THEN jsonb_set(item,'{role_category}',to_jsonb(public.normalize_iota_stakeholder_category(item->>'role_category')))
 ELSE item END ORDER BY ord),'[]'::jsonb)
 INTO NEW.iota_seoul_log_stakeholders
 FROM jsonb_array_elements(NEW.iota_seoul_log_stakeholders) WITH ORDINALITY AS items(item,ord);
 RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER normalize_feed_stakeholder_category
BEFORE INSERT OR UPDATE OF iota_seoul_log_stakeholders ON public.iota_work_feed_logs
FOR EACH ROW EXECUTE FUNCTION public.normalize_iota_feed_stakeholders();

UPDATE public.iota_stakeholder_master SET role_category=public.normalize_iota_stakeholder_category(role_category) WHERE role_category IN ('투자자','SI');
UPDATE public.iota_seoul_log_stakeholders SET role_category=public.normalize_iota_stakeholder_category(role_category) WHERE role_category IN ('투자자','SI');
UPDATE public.iota_work_feed_logs SET iota_seoul_log_stakeholders=iota_seoul_log_stakeholders
WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(iota_seoul_log_stakeholders) s WHERE s->>'role_category' IN ('투자자','SI'));
COMMIT;
SELECT role_category,count(*) AS records FROM public.iota_stakeholder_master
WHERE role_category IN ('LP','대주','SI(기업)','투자자','SI') GROUP BY role_category ORDER BY role_category;
