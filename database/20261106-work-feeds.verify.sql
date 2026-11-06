BEGIN;
-- Run against real policies as authenticated/anon, then roll back every test row.
SELECT set_config('test.allowed',jsonb_build_object('sub',auth_id,'email',email)::text,true) FROM public.iota_seoul_pilot_members WHERE staff_name='전기영' AND auth_id IS NOT NULL LIMIT 1;
SELECT set_config('test.other',jsonb_build_object('sub',auth_id,'email',email)::text,true) FROM public.iota_seoul_pilot_members WHERE is_active AND auth_id IS NOT NULL AND lower(email) NOT IN (SELECT email FROM public.iota_work_feed_members) LIMIT 1;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',current_setting('test.allowed'),true);
DO $$
DECLARE result jsonb; cid text;
BEGIN
 IF NOT public.can_access_iota_work_feed('committee') OR NOT public.can_access_iota_work_feed('open') THEN RAISE EXCEPTION 'allowed member rejected'; END IF;
 result := public.mutate_iota_work_feed('committee','save','__feed_security_committee__','{"work_date":"2026-11-06","summary":"Security test","raw_text":"Rollback only","metadata":{"comments":[{"text":"spoof"}],"permissions":{"groups":["all"]}}}');
 IF jsonb_array_length(result->'metadata'->'comments') <> 0 OR result->'metadata'->'permissions'->'individuals' <> '["이철승","강순용","권순일","양준모"]'::jsonb THEN RAISE EXCEPTION 'metadata spoof accepted'; END IF;
 result := public.mutate_iota_work_feed('open','save','__feed_security_open__','{"work_date":"2026-11-06","summary":"Open test","raw_text":"Rollback only"}');
 result := public.mutate_iota_work_feed('committee','comment','__feed_security_committee__','{"text":"Reply","author_email":"spoof@example.com"}');
 cid := result->'metadata'->'comments'->0->>'id';
 IF result->'metadata'->'comments'->0->>'author_email' <> lower(auth.jwt()->>'email') THEN RAISE EXCEPTION 'comment identity spoof accepted'; END IF;
 result := public.mutate_iota_work_feed('committee','react','__feed_security_committee__','{"reaction":"like"}');
 IF jsonb_array_length(result->'metadata'->'reactions'->'like')<>1 THEN RAISE EXCEPTION 'like failed'; END IF;
 result := public.mutate_iota_work_feed('committee','react','__feed_security_committee__','{"reaction":"like"}');
 IF jsonb_array_length(result->'metadata'->'reactions'->'like')<>0 THEN RAISE EXCEPTION 'like toggle failed'; END IF;
 result := public.mutate_iota_work_feed('committee','react','__feed_security_committee__',jsonb_build_object('reaction','check','comment_id',cid));
 IF jsonb_array_length(result->'metadata'->'comments'->0->'reactions'->'check')<>1 THEN RAISE EXCEPTION 'comment check failed'; END IF;
 result := public.mutate_iota_work_feed('committee','save','__feed_security_committee__','{"work_date":"2026-11-06","summary":"Edited","raw_text":"Edited","metadata":{}}');
 IF jsonb_array_length(result->'metadata'->'comments') <> 1 THEN RAISE EXCEPTION 'edit lost comment'; END IF;
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','comment','__feed_security_committee__','{"text":"Wrong board"}');
  RAISE EXCEPTION 'cross-board write allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.other'),true);
DO $$
DECLARE result jsonb;
BEGIN
 IF public.can_access_iota_work_feed('committee') OR NOT public.can_access_iota_work_feed('open') THEN RAISE EXCEPTION 'noncommittee ACL failed'; END IF;
 BEGIN
  PERFORM public.mutate_iota_work_feed(NULL,'comment','__feed_security_committee__','{"text":"null board bypass"}');
  RAISE EXCEPTION 'null board allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.mutate_iota_work_feed('invalid','comment','__feed_security_committee__','{"text":"invalid board bypass"}');
  RAISE EXCEPTION 'invalid board allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 IF EXISTS (SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__feed_security_committee__') THEN RAISE EXCEPTION 'private post leaked through SELECT'; END IF;
 BEGIN
  PERFORM public.mutate_iota_work_feed('committee','comment','__feed_security_committee__','{"text":"denied"}');
  RAISE EXCEPTION 'private mutation allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','save','__feed_security_open__','{"work_date":"2026-11-06","summary":"Hijack","raw_text":"Hijack"}');
  RAISE EXCEPTION 'other author edit allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN
  UPDATE public.iota_work_feed_logs SET raw_text='direct' WHERE log_id='__feed_security_open__';
  RAISE EXCEPTION 'direct write allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 result := public.mutate_iota_work_feed('open','comment','__feed_security_open__','{"text":"Any member can reply"}');
 IF jsonb_array_length(result->'metadata'->'comments')<>1 THEN RAISE EXCEPTION 'open reply failed'; END IF;
END $$;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims','{}',true);
DO $$ BEGIN
 IF public.can_access_iota_work_feed('open') THEN RAISE EXCEPTION 'anonymous allowed'; END IF;
 BEGIN
  PERFORM * FROM public.iota_work_feed_logs;
  RAISE EXCEPTION 'anonymous SELECT allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
SELECT 'PASS: ACL, read isolation, author ownership, comments, reaction toggle, comment reaction, edit preservation, anonymous denial' AS result;
ROLLBACK;
