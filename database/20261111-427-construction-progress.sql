-- Correct the execution status accompanying the confirmed 427PFV milestones.
BEGIN;
SELECT set_config('request.jwt.claims','{"email":"jk.jeon@igisam.com"}',true);
DO $$ BEGIN
 IF (SELECT count(*) FROM iota_v2.iota_schedule_items WHERE source_key IN ('S-069','S-077','S-078') AND parent_source_key='S-076' AND lv1 IN ('427 설계/시공','[YD427]설계 및 시공'))<>3 THEN RAISE EXCEPTION 'Expected three 427 construction tasks'; END IF;
END $$;
UPDATE iota_v2.iota_schedule_items SET
 display_name=CASE source_key WHEN 'S-069' THEN '견적 및 공사비 산출 (9/8)' WHEN 'S-077' THEN '해체공사 완료 (10/29)' ELSE '본공사 착수 (10/30)' END,
 progress_status=CASE WHEN source_key='S-078' THEN 'in_progress' ELSE 'completed' END,
 actual_completed_date=CASE source_key WHEN 'S-069' THEN DATE '2026-09-08' WHEN 'S-077' THEN DATE '2026-10-29' ELSE NULL END
WHERE source_key IN ('S-069','S-077','S-078');
DO $$ BEGIN
 IF (SELECT count(*) FROM iota_v2.iota_schedule_items s JOIN (VALUES ('S-069','completed',DATE '2026-09-08'),('S-077','completed',DATE '2026-10-29'),('S-078','in_progress',NULL::date)) v(k,status,completed_date) ON s.source_key=v.k WHERE s.progress_status=v.status AND s.actual_completed_date IS NOT DISTINCT FROM v.completed_date)<>3 THEN RAISE EXCEPTION 'Progress verification failed'; END IF;
END $$;
COMMIT;
SELECT source_key,display_name,progress_status,actual_completed_date FROM iota_v2.iota_schedule_items WHERE source_key IN ('S-069','S-077','S-078') ORDER BY source_order;
