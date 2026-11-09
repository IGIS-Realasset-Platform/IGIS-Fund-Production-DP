-- Check trigger delivery without leaving posts or delivering test alerts.
BEGIN;
DO $$
DECLARE m public.iota_seoul_pilot_members%ROWTYPE; f text; pid text; r jsonb; cid text; n int;
BEGIN
 SELECT * INTO STRICT m FROM public.iota_seoul_pilot_members WHERE staff_name='전기영' AND is_active AND auth_id IS NOT NULL LIMIT 1;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',m.auth_id,'email',m.email)::text,true);
 FOREACH f IN ARRAY ARRAY['committee','open'] LOOP
  pid:='__self_mention_verify_'||gen_random_uuid()::text;
  r:=public.mutate_iota_work_feed(f,'save',pid,jsonb_build_object('work_date',current_date,'summary','Rollback verification','raw_text','@'||m.staff_name||' @'||public.iota_work_feed_org(m),'metadata',jsonb_build_object('permissions',jsonb_build_object('groups','[]'::jsonb,'individuals','[]'::jsonb))));
  SELECT count(*) INTO n FROM public.iota_notifications WHERE reference_id=pid||'|FEED_'||upper(f) AND user_id=m.auth_id;
  IF n<>1 THEN RAISE EXCEPTION 'self post failed %: %',f,n; END IF;
  r:=public.mutate_iota_work_feed(f,'react',pid,'{"reaction":"like"}');
  SELECT count(*) INTO n FROM public.iota_notifications WHERE reference_id=pid||'|FEED_'||upper(f) AND user_id=m.auth_id;
  IF n<>1 THEN RAISE EXCEPTION 'reaction duplicated self alert'; END IF;
  r:=public.mutate_iota_work_feed(f,'comment',pid,jsonb_build_object('text','@'||m.staff_name||' 확인'));
  cid:=r->'metadata'->'comments'->0->>'id';
  SELECT count(*) INTO n FROM public.iota_notifications WHERE reference_id=pid||'|FEED_'||upper(f)||'|'||cid AND user_id=m.auth_id;
  IF n<>1 THEN RAISE EXCEPTION 'self comment failed %: %',f,n; END IF;
  r:=public.mutate_iota_work_feed(f,'edit_comment',pid,jsonb_build_object('comment_id',cid,'text','@'||m.staff_name||' 내용만 수정'));
  SELECT count(*) INTO n FROM public.iota_notifications WHERE reference_id=pid||'|FEED_'||upper(f)||'|'||cid AND user_id=m.auth_id;
  IF n<>1 THEN RAISE EXCEPTION 'edit duplicated self alert'; END IF;
 END LOOP;
 IF has_function_privilege('authenticated','public.iota_feed_mention_recipients(text,text,jsonb,text,text)','EXECUTE') THEN RAISE EXCEPTION 'resolver access changed'; END IF;
END $$;
ROLLBACK;
SELECT 'PASS: self post/comment alerts in both feeds; person/department deduplication; no duplicate on reactions/edits; fixtures rolled back' AS result;
