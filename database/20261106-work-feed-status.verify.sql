BEGIN;
SELECT set_config('test.owner',jsonb_build_object('sub',auth_id,'email',email)::text,true) FROM public.iota_seoul_pilot_members WHERE is_active AND auth_id IS NOT NULL ORDER BY email LIMIT 1;
SELECT set_config('test.other',jsonb_build_object('sub',auth_id,'email',email)::text,true) FROM public.iota_seoul_pilot_members WHERE is_active AND auth_id IS NOT NULL AND email<>current_setting('test.owner')::jsonb->>'email' ORDER BY email LIMIT 1;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',current_setting('test.owner'),true);
DO $$ DECLARE before_post jsonb; after_post jsonb; BEGIN
 PERFORM public.mutate_iota_work_feed('open','save','__status_verify__','{"work_date":"2026-11-06","summary":"rollback","raw_text":"preserve body","metadata":{"issue_status":"검토중","permissions":{"groups":[],"individuals":[]}}}');
 PERFORM public.mutate_iota_work_feed('open','comment','__status_verify__','{"text":"preserve comment"}');
 before_post:=public.mutate_iota_work_feed('open','react','__status_verify__','{"reaction":"like"}');
 after_post:=public.update_iota_work_feed_status('open','__status_verify__','완료');
 IF after_post#>>'{metadata,issue_status}' <> '완료' THEN RAISE EXCEPTION 'status not saved'; END IF;
 IF (before_post-'metadata'-'updated_at') IS DISTINCT FROM (after_post-'metadata'-'updated_at') OR
    ((before_post->'metadata')-'issue_status') IS DISTINCT FROM ((after_post->'metadata')-'issue_status') THEN RAISE EXCEPTION 'unrelated content changed'; END IF;
 BEGIN
  PERFORM public.update_iota_work_feed_status('open','__status_verify__','invalid');
  RAISE EXCEPTION 'invalid status accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='invalid status accepted' THEN RAISE; END IF; END;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.other'),true);
DO $$ BEGIN
 BEGIN
  PERFORM public.update_iota_work_feed_status('open','__status_verify__','진행중');
  RAISE EXCEPTION 'non-author accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claims','{}',true);
DO $$ BEGIN
 BEGIN
  PERFORM public.update_iota_work_feed_status('open','__status_verify__','진행중');
  RAISE EXCEPTION 'anonymous accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
SELECT 'PASS: status saved; text, comments, reactions and permissions preserved; invalid status, non-author and anonymous rejected; rolled back' AS result;
