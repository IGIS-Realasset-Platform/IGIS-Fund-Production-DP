-- A not-yet-linked member uses a synthetic JWT sub for policy tests only; no auth/member record is modified.
-- Run after 20261110-editable-committee-audience.sql. No test rows survive.
BEGIN;
DO $$ DECLARE writer record; saved jsonb; m record; recipients uuid[]; BEGIN
 SELECT p.* INTO STRICT writer FROM public.iota_seoul_pilot_members p JOIN public.iota_work_feed_members a ON a.email=lower(p.email) WHERE a.is_planning AND p.is_active AND p.auth_id IS NOT NULL ORDER BY p.email LIMIT 1;
 PERFORM set_config('test.writer',jsonb_build_object('sub',writer.auth_id,'email',writer.email)::text,true);
 PERFORM set_config('test.file','committee/'||writer.auth_id||'/editable-audience-test.txt',true);
 PERFORM set_config('request.jwt.claims',current_setting('test.writer'),true);
 saved:=public.mutate_iota_work_feed('committee','save','__editable_audience_test__','{"work_date":"2026-11-10","summary":"AUDIENCE_SECRET","raw_text":"AUDIENCE_SECRET_BODY"}');
 IF NOT (saved#>'{metadata,permissions,individuals}') ?& ARRAY['이철승','강순용','권순일','양준모'] OR jsonb_array_length(saved#>'{metadata,permissions,individuals}')<>4 THEN RAISE EXCEPTION 'New post lacks four defaults'; END IF;
 INSERT INTO storage.objects(bucket_id,name) VALUES('iota-work-feed-attachments',current_setting('test.file'));
 saved:=public.mutate_iota_work_feed('committee','save','__editable_audience_test__',jsonb_build_object('work_date','2026-11-10','summary','AUDIENCE_SECRET','raw_text','AUDIENCE_SECRET_BODY','metadata',jsonb_build_object('permissions','{"groups":[],"individuals":["권순일"]}'::jsonb,'attachedFiles',jsonb_build_array(jsonb_build_object('path',current_setting('test.file'),'name','AUDIENCE_SECRET_FILE')))));
 IF saved#>'{metadata,permissions,individuals}' <> '["권순일"]'::jsonb THEN RAISE EXCEPTION 'Removed defaults returned'; END IF;
 SELECT array_agg(user_id) INTO recipients FROM public.iota_feed_mention_recipients('committee',writer.email,saved->'metadata','@이철승 @강순용 @권순일 @양준모',writer.email);
 FOR m IN SELECT * FROM public.iota_seoul_pilot_members WHERE is_active AND staff_name IN ('이철승','강순용','권순일','양준모') LOOP
  IF m.auth_id IS NOT NULL AND coalesce(m.auth_id=ANY(recipients),false) IS DISTINCT FROM (m.staff_name='권순일') THEN RAISE EXCEPTION 'Mention recipient mismatch for %',m.staff_name; END IF;
 END LOOP;
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE m record; masked jsonb; expected boolean; tested integer:=0; BEGIN
 FOR m IN SELECT * FROM public.iota_seoul_pilot_members WHERE is_active AND staff_name IN ('이철승','강순용','권순일','양준모') LOOP
  tested:=tested+1;expected:=m.staff_name='권순일';
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',coalesce(m.auth_id,'00000000-0000-4000-8000-000000000001'::uuid),'email',m.email)::text,true);
  SELECT value INTO STRICT masked FROM public.list_iota_committee_feed() value WHERE value->>'log_id'='__editable_audience_test__';
  IF (masked->>'can_read')::boolean IS DISTINCT FROM expected THEN RAISE EXCEPTION 'List access mismatch for %',m.staff_name; END IF;
  IF NOT expected AND (masked::text LIKE '%AUDIENCE_SECRET%' OR masked->'metadata' ?| ARRAY['permissions','comments','attachedFiles','reactions']) THEN RAISE EXCEPTION 'Masked payload leak'; END IF;
  IF EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__editable_audience_test__') IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Direct read mismatch'; END IF;
  IF public.can_read_iota_work_feed_file(current_setting('test.file')) IS DISTINCT FROM expected THEN RAISE EXCEPTION 'File access mismatch'; END IF;
  IF NOT public.can_read_iota_work_feed_post('committee',current_setting('test.writer')::jsonb->>'email','{}') THEN RAISE EXCEPTION 'Legacy default lost'; END IF;
  IF NOT expected THEN
   BEGIN PERFORM public.mutate_iota_work_feed('committee','comment','__editable_audience_test__','{"text":"denied"}');RAISE EXCEPTION 'Removed director can comment';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
   BEGIN PERFORM public.mutate_iota_work_feed('committee','react','__editable_audience_test__','{"reaction":"like"}');RAISE EXCEPTION 'Removed director can react';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
  END IF;
 END LOOP;
 IF tested<>4 THEN RAISE EXCEPTION 'Expected four active directors, got %',tested; END IF;
END $$;
DO $$ DECLARE saved jsonb;m record; BEGIN
 PERFORM set_config('request.jwt.claims',current_setting('test.writer'),true);
 saved:=public.mutate_iota_work_feed('committee','save','__editable_audience_test__','{"work_date":"2026-11-10","summary":"AUDIENCE_SECRET","raw_text":"AUDIENCE_SECRET_BODY","metadata":{"permissions":{"groups":[],"individuals":[]}}}');
 IF saved#>'{metadata,permissions,individuals}' <> '[]'::jsonb THEN RAISE EXCEPTION 'Empty selection was not preserved'; END IF;
 saved:=public.mutate_iota_work_feed('committee','save','__editable_audience_test__','{"work_date":"2026-11-10","summary":"AUDIENCE_SECRET","raw_text":"AUDIENCE_SECRET_BODY"}');
 IF saved#>'{metadata,permissions,individuals}' <> '[]'::jsonb THEN RAISE EXCEPTION 'Omitted permissions reset the audience'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__editable_audience_test__') THEN RAISE EXCEPTION 'Author access lost'; END IF;
 FOR m IN SELECT * FROM public.iota_seoul_pilot_members WHERE is_active AND staff_name IN ('이철승','강순용','권순일','양준모') LOOP
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',coalesce(m.auth_id,'00000000-0000-4000-8000-000000000001'::uuid),'email',m.email)::text,true);
  IF EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__editable_audience_test__') OR EXISTS(SELECT 1 FROM public.list_iota_committee_feed() v WHERE v->>'log_id'='__editable_audience_test__' AND v->>'can_read'='true') THEN RAISE EXCEPTION 'Empty audience grants director access'; END IF;
  IF NOT public.can_read_iota_work_feed_post('open',current_setting('test.writer')::jsonb->>'email','{"permissions":{"groups":[],"individuals":[]}}') THEN RAISE EXCEPTION 'Open public feed changed'; END IF;
 END LOOP;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.iota_feed_mention_recipients('committee',current_setting('test.writer')::jsonb->>'email','{"permissions":{"groups":[],"individuals":[]}}','@이철승 @강순용 @권순일 @양준모',current_setting('test.writer')::jsonb->>'email')) THEN RAISE EXCEPTION 'Empty audience leaks notifications'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: four defaults, director removal, saved empty audience, masked list, direct read, attachments, comment/reaction denial, mention recipients, legacy defaults and open feed; tests rolled back' AS result;
