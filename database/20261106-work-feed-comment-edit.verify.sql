BEGIN;
SELECT set_config('test.owner',jsonb_build_object('sub',auth_id,'email',email)::text,true) FROM public.iota_seoul_pilot_members WHERE is_active AND auth_id IS NOT NULL ORDER BY email LIMIT 1;
SELECT set_config('test.other',jsonb_build_object('sub',auth_id,'email',email)::text,true) FROM public.iota_seoul_pilot_members WHERE is_active AND auth_id IS NOT NULL AND email<>current_setting('test.owner')::jsonb->>'email' ORDER BY email LIMIT 1;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims',current_setting('test.owner'),true);
DO $$ DECLARE p jsonb; c jsonb; edited jsonb; BEGIN
 p:=public.mutate_iota_work_feed('open','save','__comment_edit_verify__','{"work_date":"2026-11-06","summary":"rollback test","raw_text":"test","metadata":{"permissions":{"groups":[],"individuals":[]}}}');
 p:=public.mutate_iota_work_feed('open','comment','__comment_edit_verify__','{"text":"original"}');
 c:=p->'metadata'->'comments'->0;
 PERFORM set_config('test.comment_id',c->>'id',true);
 p:=public.mutate_iota_work_feed('open','react','__comment_edit_verify__',jsonb_build_object('comment_id',c->>'id','reaction','like'));
 c:=p->'metadata'->'comments'->0;
 p:=public.mutate_iota_work_feed('open','edit_comment','__comment_edit_verify__',jsonb_build_object('comment_id',c->>'id','text','edited','author_email','forged@example.com'));
 edited:=p->'metadata'->'comments'->0;
 IF edited->>'text'<>'edited' OR edited->>'updated_at' IS NULL THEN RAISE EXCEPTION 'edit failed'; END IF;
 IF (edited-'text'-'updated_at') IS DISTINCT FROM (c-'text'-'updated_at') THEN RAISE EXCEPTION 'identity, creation or reactions changed'; END IF;
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','edit_comment','__comment_edit_verify__',jsonb_build_object('comment_id',c->>'id','text','  '));
  RAISE EXCEPTION 'blank edit allowed';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='blank edit allowed' THEN RAISE; END IF; END;
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','edit_comment','__comment_edit_verify__','{"comment_id":"missing","text":"test"}');
  RAISE EXCEPTION 'missing target allowed';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM='missing target allowed' THEN RAISE; END IF; END;
END $$;
SELECT set_config('request.jwt.claims',current_setting('test.other'),true);
DO $$ BEGIN
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','edit_comment','__comment_edit_verify__',jsonb_build_object('comment_id',current_setting('test.comment_id'),'text','tamper'));
  RAISE EXCEPTION 'non-author allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claims','{}',true);
DO $$ BEGIN
 BEGIN
  PERFORM public.mutate_iota_work_feed('open','edit_comment','__comment_edit_verify__',jsonb_build_object('comment_id',current_setting('test.comment_id'),'text','tamper'));
  RAISE EXCEPTION 'anonymous allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
SELECT 'PASS: own comment edit, preserved author/date/reactions, blank and missing target rejection, non-author and anonymous denial; rolled back' AS result;
