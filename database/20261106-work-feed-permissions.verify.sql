BEGIN;
SELECT set_config('test.planning',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true) FROM public.iota_seoul_pilot_members m JOIN public.iota_work_feed_members a ON a.email=lower(m.email) WHERE a.is_planning AND m.auth_id IS NOT NULL AND m.is_active LIMIT 1;
SELECT set_config('test.owner',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true) FROM public.iota_seoul_pilot_members m WHERE m.is_active AND m.auth_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email) AND a.is_planning) ORDER BY m.email LIMIT 1;
SELECT set_config('test.reader',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true),set_config('test.reader_name',m.staff_name,true),set_config('test.reader_group',public.iota_work_feed_org(m),true) FROM public.iota_seoul_pilot_members m WHERE m.is_active AND m.auth_id IS NOT NULL AND m.email<>current_setting('test.owner')::jsonb->>'email' AND NOT EXISTS(SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email) AND a.is_planning) ORDER BY m.email LIMIT 1;
SELECT set_config('test.excluded',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true) FROM public.iota_seoul_pilot_members m WHERE m.is_active AND m.auth_id IS NOT NULL AND m.email NOT IN (current_setting('test.owner')::jsonb->>'email',current_setting('test.reader')::jsonb->>'email') AND NOT EXISTS(SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email) AND a.is_planning) ORDER BY m.email LIMIT 1;
SELECT set_config('test.path','open/'||(current_setting('test.owner')::jsonb->>'sub')||'/permission-test.txt',true);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',current_setting('test.owner'),true);
SELECT public.mutate_iota_work_feed('open','save','__feed_permission_test__',jsonb_build_object('work_date','2026-11-06','summary','permission test','raw_text','rollback only','metadata',jsonb_build_object('permissions',jsonb_build_object('groups','[]'::jsonb,'individuals',jsonb_build_array(current_setting('test.reader_name'))),'attachedFiles',jsonb_build_array(jsonb_build_object('path',current_setting('test.path'))))));
SELECT set_config('request.jwt.claims',current_setting('test.reader'),true);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__feed_permission_test__') THEN RAISE EXCEPTION 'selected reader denied'; END IF;
 IF NOT public.can_read_iota_work_feed_file(current_setting('test.path')) THEN RAISE EXCEPTION 'selected reader file denied'; END IF;
 PERFORM public.mutate_iota_work_feed('open','comment','__feed_permission_test__','{"text":"reader reply"}');
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.excluded'),true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__feed_permission_test__') THEN RAISE EXCEPTION 'excluded reader sees post'; END IF;
 IF public.can_read_iota_work_feed_file(current_setting('test.path')) THEN RAISE EXCEPTION 'excluded reader sees file'; END IF;
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','react','__feed_permission_test__','{"reaction":"like"}');
  RAISE EXCEPTION 'excluded reader can react';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','comment','__feed_permission_test__','{"text":"denied reply"}');
  RAISE EXCEPTION 'excluded reader can reply';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.planning'),true);
DO $$ DECLARE p jsonb; BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__feed_permission_test__') THEN RAISE EXCEPTION 'planning reader denied'; END IF;
 IF NOT public.can_read_iota_work_feed_file(current_setting('test.path')) THEN RAISE EXCEPTION 'planning file denied'; END IF;
 p:=public.mutate_iota_work_feed('committee','save','__feed_permission_committee__','{"work_date":"2026-11-06","summary":"test","raw_text":"rollback","metadata":{"permissions":{"groups":[],"individuals":[]}}}');
 IF p->'metadata'->'permissions' <> '{"groups":[],"individuals":["이철승","강순용","권순일","양준모"]}'::jsonb THEN RAISE EXCEPTION 'committee defaults or hidden audience invalid'; END IF;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.owner'),true);
SELECT public.mutate_iota_work_feed('open','save','__feed_permission_test__',jsonb_build_object('work_date','2026-11-06','summary','group test','raw_text','rollback','metadata',jsonb_build_object('permissions',jsonb_build_object('groups',jsonb_build_array(current_setting('test.reader_group')),'individuals','[]'::jsonb))));
SELECT set_config('request.jwt.claims',current_setting('test.reader'),true);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__feed_permission_test__') THEN RAISE EXCEPTION 'selected group denied'; END IF;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.owner'),true);
SELECT public.mutate_iota_work_feed('open','save','__feed_permission_test__','{"work_date":"2026-11-06","summary":"public test","raw_text":"rollback","metadata":{"permissions":{"groups":[],"individuals":[]}}}');
SELECT set_config('request.jwt.claims',current_setting('test.excluded'),true);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__feed_permission_test__') THEN RAISE EXCEPTION 'default public read denied'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: individual/group restrictions, planning access, fixed committee audience, file denial, mutation denial, public defaults; test data rolled back' AS result;
