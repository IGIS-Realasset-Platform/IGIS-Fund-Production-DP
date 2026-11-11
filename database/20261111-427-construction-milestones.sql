-- 427PFV: 2026-09-08 estimate, 2026-10-29 demolition completion, 2026-10-30 main construction start.
-- Keep existing task identities, linked work, progress, and the remainder of each work period.
BEGIN;
DO $$ BEGIN
 IF (SELECT count(*) FROM iota_v2.iota_schedule_items WHERE source_key BETWEEN 'S-069' AND 'S-078' AND is_active AND lv1 IN ('[YD427]설계 및 시공','427 설계/시공'))<>10 THEN RAISE EXCEPTION 'Expected ten original 427 rows'; END IF;
 IF NOT EXISTS(SELECT 1 FROM iota_v2.iota_schedule_items WHERE source_key='S-069' AND parent_source_key='S-067' AND task_name='견적 및 공사비 산출' AND source_order=69) OR NOT EXISTS(SELECT 1 FROM iota_v2.iota_schedule_items WHERE source_key='S-076' AND item_type='lv2' AND lv2='시공' AND source_order=76) THEN RAISE EXCEPTION 'Schedule hierarchy changed; review before applying'; END IF;
END $$;
CREATE TABLE IF NOT EXISTS iota_archive.schedule_427_before_20261111 AS
SELECT * FROM iota_v2.iota_schedule_items WHERE source_key BETWEEN 'S-069' AND 'S-078';
ALTER TABLE iota_archive.schedule_427_before_20261111 ENABLE ROW LEVEL SECURITY;
SELECT set_config('request.jwt.claims','{"email":"jk.jeon@igisam.com"}',true);
UPDATE iota_v2.iota_schedule_items SET source_order=CASE WHEN source_key='S-069' THEN 76 ELSE source_order-1 END
WHERE source_key BETWEEN 'S-069' AND 'S-076';
UPDATE iota_v2.iota_schedule_items SET
 parent_source_key='S-076',lv2='시공',display_name='견적 및 공사비 산출 (9/8)',
 end_period='2026-09-W2',milestone_period='2026-09-W2',
 management_note=concat_ws(E'\n',management_note,'427PFV 견적 및 공사비 산출: 2026-09-08')
WHERE source_key='S-069';
UPDATE iota_v2.iota_schedule_items SET display_name='해체공사 완료 (10/29)',
 end_period='2026-10-W4',milestone_period='2026-10-W4',
 management_note=concat_ws(E'\n',management_note,'427PFV 해체공사 완료: 2026-10-29')
WHERE source_key='S-077';
UPDATE iota_v2.iota_schedule_items SET display_name='본공사 착수 (10/30)',
 start_period='2026-10-W4',milestone_period='2026-10-W4',
 management_note=concat_ws(E'\n',management_note,'427PFV 본공사 착수: 2026-10-30')
WHERE source_key='S-078';
DO $$ BEGIN
 IF (SELECT count(*) FROM iota_v2.iota_schedule_items s JOIN (VALUES
 ('S-069','견적 및 공사비 산출 (9/8)','2026-09-W2'),
 ('S-077','해체공사 완료 (10/29)','2026-10-W4'),
 ('S-078','본공사 착수 (10/30)','2026-10-W4')
 ) v(k,label,period) ON s.source_key=v.k WHERE s.parent_source_key='S-076' AND s.display_name=v.label AND s.milestone_period=v.period)<>3 THEN RAISE EXCEPTION 'Milestone verification failed'; END IF;
 IF EXISTS(SELECT 1 FROM iota_v2.iota_schedule_items s JOIN iota_archive.schedule_427_before_20261111 b USING(source_key)
 WHERE (to_jsonb(s)-ARRAY['source_order','parent_source_key','lv2','display_name','start_period','end_period','milestone_period','management_note','updated_at','updated_by_email','updated_by_name'])
 IS DISTINCT FROM (to_jsonb(b)-ARRAY['source_order','parent_source_key','lv2','display_name','start_period','end_period','milestone_period','management_note','updated_at','updated_by_email','updated_by_name'])) THEN RAISE EXCEPTION 'Unrelated task data changed'; END IF;
END $$;
COMMIT;
SELECT source_key,display_name,parent_source_key,start_period,end_period,milestone_period,management_note FROM iota_v2.iota_schedule_items WHERE source_key IN ('S-069','S-077','S-078') ORDER BY source_order;
