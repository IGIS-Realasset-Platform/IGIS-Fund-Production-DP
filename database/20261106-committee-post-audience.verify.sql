BEGIN;
SELECT set_config('test.writer',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true) FROM public.iota_seoul_pilot_members m JOIN public.iota_work_feed_members a ON a.email=lower(m.email) WHERE a.is_planning AND m.is_active AND m.auth_id IS NOT NULL ORDER BY m.email LIMIT 1;
SELECT set_config('test.invited',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true),set_config('test.invited_name',m.staff_name,true) FROM public.iota_seoul_pilot_members m WHERE m.is_active AND m.auth_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email)) ORDER BY m.email LIMIT 1;
SELECT set_config('test.excluded',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true) FROM public.iota_seoul_pilot_members m WHERE m.is_active AND m.auth_id IS NOT NULL AND m.email<>current_setting('test.invited')::jsonb->>'email' AND NOT EXISTS(SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email)) ORDER BY m.email LIMIT 1;
SELECT set_config('test.executive',jsonb_build_object('sub',auth_id,'email',email)::text,true) FROM public.iota_seoul_pilot_members WHERE is_active AND auth_id IS NOT NULL AND staff_name IN ('이철승','강순용','권순일','양준모') ORDER BY email LIMIT 1;
SELECT set_config('test.file','committee/'||(current_setting('test.writer')::jsonb->>'sub')||'/audience-verification.txt',true);
INSERT INTO storage.objects(bucket_id,name) VALUES('iota-work-feed-attachments',current_setting('test.file'));
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',current_setting('test.writer'),true);
SELECT public.mutate_iota_work_feed('committee','save','__committee_audience_verify__',jsonb_build_object('work_date','2026-11-06','summary','TOP_SECRET_TITLE','raw_text','TOP_SECRET_BODY','metadata',jsonb_build_object('attachedFiles',jsonb_build_array(jsonb_build_object('path',current_setting('test.file'),'name','TOP_SECRET_FILE')))));
SELECT public.mutate_iota_work_feed('committee','comment','__committee_audience_verify__','{"text":"TOP_SECRET_COMMENT"}');
SELECT set_config('request.jwt.claims',current_setting('test.excluded'),true);
DO $$ DECLARE masked jsonb; BEGIN
 SELECT value INTO STRICT masked FROM public.list_iota_committee_feed() value WHERE value->>'log_id'='__committee_audience_verify__';
 IF masked->>'can_read'<>'false' OR masked->>'summary' IS NOT NULL OR masked->>'raw_text' IS NOT NULL OR masked::text LIKE '%TOP_SECRET%' THEN RAISE EXCEPTION 'masked listing leaks content'; END IF;
 IF masked->'metadata' ?| ARRAY['comments','reactions','attachedFiles','permissions'] THEN RAISE EXCEPTION 'masked metadata leaked'; END IF;
 IF EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__committee_audience_verify__') THEN RAISE EXCEPTION 'direct read bypass'; END IF;
 IF public.can_read_iota_work_feed_file(current_setting('test.file')) OR EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='iota-work-feed-attachments' AND name=current_setting('test.file')) THEN RAISE EXCEPTION 'file read bypass'; END IF;
 BEGIN
  PERFORM public.mutate_iota_work_feed('committee','comment','__committee_audience_verify__','{"text":"denied"}');
  RAISE EXCEPTION 'excluded reply allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.mutate_iota_work_feed('committee','react','__committee_audience_verify__','{"reaction":"like"}');
  RAISE EXCEPTION 'excluded reaction allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.writer'),true);
DO $$ DECLARE saved jsonb; BEGIN
 saved:=public.mutate_iota_work_feed('committee','save','__committee_audience_verify__',jsonb_build_object('work_date','2026-11-06','summary','TOP_SECRET_TITLE','raw_text','TOP_SECRET_BODY','metadata',jsonb_build_object('permissions',jsonb_build_object('groups','[]'::jsonb,'individuals',jsonb_build_array('이철승','강순용','권순일','양준모',current_setting('test.invited_name'))),'attachedFiles',jsonb_build_array(jsonb_build_object('path',current_setting('test.file'),'name','TOP_SECRET_FILE')))));
 IF NOT (saved#>'{metadata,permissions,individuals}') ?& ARRAY['이철승','강순용','권순일','양준모',current_setting('test.invited_name')] THEN RAISE EXCEPTION 'default readers or addition lost'; END IF;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.invited'),true);
DO $$ DECLARE saved jsonb; c jsonb; BEGIN
 IF public.can_access_iota_work_feed('committee') THEN RAISE EXCEPTION 'invited reader became board author'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__committee_audience_verify__' AND summary='TOP_SECRET_TITLE') THEN RAISE EXCEPTION 'invited direct read denied'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.list_iota_committee_feed() value WHERE value->>'log_id'='__committee_audience_verify__' AND value->>'summary'='TOP_SECRET_TITLE' AND value->>'can_read'='true') THEN RAISE EXCEPTION 'invited title masked'; END IF;
 IF NOT public.can_read_iota_work_feed_file(current_setting('test.file')) OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='iota-work-feed-attachments' AND name=current_setting('test.file')) THEN RAISE EXCEPTION 'invited file read denied'; END IF;
 saved:=public.mutate_iota_work_feed('committee','comment','__committee_audience_verify__','{"text":"invited reply"}');
 c:=saved#>'{metadata,comments,1}';
 PERFORM public.mutate_iota_work_feed('committee','edit_comment','__committee_audience_verify__',jsonb_build_object('comment_id',c->>'id','text','edited reply'));
 PERFORM public.mutate_iota_work_feed('committee','react','__committee_audience_verify__','{"reaction":"like"}');
 BEGIN
  PERFORM public.mutate_iota_work_feed('committee','save','__committee_new_denied__','{"work_date":"2026-11-06","summary":"denied","raw_text":"denied"}');
  RAISE EXCEPTION 'invited new post allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.mutate_iota_work_feed('committee','save','__committee_audience_verify__','{"work_date":"2026-11-06","summary":"denied","raw_text":"denied"}');
  RAISE EXCEPTION 'invited edit allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.executive'),true);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__committee_audience_verify__') THEN RAISE EXCEPTION 'default executive read denied'; END IF;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.writer'),true);
SELECT public.mutate_iota_work_feed('committee','save','__committee_audience_verify__',jsonb_build_object('work_date','2026-11-06','summary','TOP_SECRET_TITLE','raw_text','TOP_SECRET_BODY','metadata',jsonb_build_object('permissions',jsonb_build_object('groups','[]'::jsonb,'individuals','[]'::jsonb),'attachedFiles',jsonb_build_array(jsonb_build_object('path',current_setting('test.file'),'name','TOP_SECRET_FILE')))));
SELECT set_config('request.jwt.claims',current_setting('test.invited'),true);
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__committee_audience_verify__') THEN RAISE EXCEPTION 'removed reader still reads'; END IF;
 IF EXISTS(SELECT 1 FROM public.list_iota_committee_feed() value WHERE value->>'log_id'='__committee_audience_verify__' AND value->>'can_read'='true') THEN RAISE EXCEPTION 'removed reader sees title'; END IF;
 IF EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='iota-work-feed-attachments' AND name=current_setting('test.file')) THEN RAISE EXCEPTION 'removed reader sees file'; END IF;
END $$;
SELECT set_config('request.jwt.claims','{}',true);
DO $$ BEGIN
 BEGIN
  PERFORM public.list_iota_committee_feed();
  RAISE EXCEPTION 'anonymous listing allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
SELECT 'PASS: defaults, added reader, masked title/payload, direct read and storage isolation, comments/reactions, author-only creation/edit, removal and anonymous denial; rolled back' AS result;
