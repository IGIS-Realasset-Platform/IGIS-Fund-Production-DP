-- All fixtures and queued transactional webhooks are rolled back. No test alerts are delivered.
BEGIN;
DO $$
DECLARE
 writer public.iota_seoul_pilot_members%ROWTYPE;
 recipient public.iota_seoul_pilot_members%ROWTYPE;
 excluded public.iota_seoul_pilot_members%ROWTYPE;
 post_id text:='__mention_verify_'||gen_random_uuid()::text;
 result jsonb; cid text; total int;
BEGIN
 SELECT * INTO STRICT writer FROM public.iota_seoul_pilot_members WHERE staff_name='전기영' AND is_active AND auth_id IS NOT NULL LIMIT 1;
 SELECT * INTO STRICT recipient FROM public.iota_seoul_pilot_members WHERE is_active AND auth_id IS NOT NULL AND auth_id<>writer.auth_id ORDER BY CASE WHEN staff_name IN ('이철승','강순용','권순일') THEN 0 ELSE 1 END LIMIT 1;
 SELECT * INTO STRICT excluded FROM public.iota_seoul_pilot_members m WHERE is_active AND auth_id IS NOT NULL
  AND auth_id<>recipient.auth_id AND staff_name NOT IN ('이철승','강순용','권순일','양준모') AND lower(email) NOT IN (SELECT email FROM public.iota_work_feed_members) LIMIT 1;
 IF NOT public.iota_feed_has_mention('@양준모, 확인 @CM','양준모') OR NOT public.iota_feed_has_mention('@양준모, 확인 @CM','CM')
  OR public.iota_feed_has_mention('x@양준모.com @양준모님','양준모') OR public.iota_feed_has_mention('@CM팀','CM') THEN RAISE EXCEPTION 'mention boundaries failed'; END IF;
 PERFORM set_config('test.mention_post',post_id,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',writer.auth_id,'email',writer.email)::text,true);
 result:=public.mutate_iota_work_feed('committee','save',post_id,jsonb_build_object('work_date',current_date,'summary','Rollback verification','raw_text','@'||recipient.staff_name||' @'||public.iota_work_feed_org(recipient)||' @'||excluded.staff_name||' @'||writer.staff_name,'metadata',jsonb_build_object('permissions',jsonb_build_object('groups','[]'::jsonb,'individuals',jsonb_build_array(recipient.staff_name)))));
 SELECT count(*) INTO total FROM public.iota_notifications WHERE reference_id=post_id||'|FEED_COMMITTEE' AND user_id=recipient.auth_id;
 IF total<>1 THEN RAISE EXCEPTION 'core recipient/dedup failed: %',total; END IF;
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'|FEED_COMMITTEE' AND user_id=writer.auth_id)<>1 THEN RAISE EXCEPTION 'self post mention missing'; END IF;
 IF EXISTS(SELECT 1 FROM public.iota_notifications WHERE reference_id LIKE post_id||'|%' AND user_id=excluded.auth_id) THEN RAISE EXCEPTION 'denied recipient notified'; END IF;
 result:=public.mutate_iota_work_feed('committee','react',post_id,'{"reaction":"like"}');
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'|FEED_COMMITTEE' AND user_id=recipient.auth_id)<>1 THEN RAISE EXCEPTION 'reaction caused notification'; END IF;
 result:=public.mutate_iota_work_feed('committee','comment',post_id,jsonb_build_object('text','@'||recipient.staff_name||' @'||writer.staff_name||' 확인'));
 cid:=result->'metadata'->'comments'->0->>'id';
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'|FEED_COMMITTEE|'||cid AND user_id=recipient.auth_id)<>1 THEN RAISE EXCEPTION 'comment mention failed'; END IF;
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'|FEED_COMMITTEE|'||cid AND user_id=writer.auth_id)<>1 THEN RAISE EXCEPTION 'self comment mention missing'; END IF;
 result:=public.mutate_iota_work_feed('committee','edit_comment',post_id,jsonb_build_object('comment_id',cid,'text','@'||recipient.staff_name||' 내용만 수정'));
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'|FEED_COMMITTEE|'||cid AND user_id=recipient.auth_id)<>1 THEN RAISE EXCEPTION 'unchanged mention repeated'; END IF;
 result:=public.mutate_iota_work_feed('committee','comment',post_id,jsonb_build_object('text','@'||recipient.staff_name||' 다른 댓글'));
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id LIKE post_id||'|FEED_COMMITTEE|%' AND user_id=recipient.auth_id)<>2 THEN RAISE EXCEPTION 'second comment lost'; END IF;
 -- Explicitly adding a reader makes an existing mention newly deliverable.
 result:=public.mutate_iota_work_feed('committee','save',post_id,jsonb_build_object('work_date',current_date,'summary','Rollback verification','raw_text','@'||recipient.staff_name||' @'||excluded.staff_name,'metadata',jsonb_build_object('permissions',jsonb_build_object('groups','[]'::jsonb,'individuals',jsonb_build_array(excluded.staff_name)))));
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'|FEED_COMMITTEE' AND user_id=excluded.auth_id)<>1 THEN RAISE EXCEPTION 'added reader mention failed'; END IF;
 result:=public.mutate_iota_work_feed('open','save',post_id||'_open',jsonb_build_object('work_date',current_date,'summary','Rollback verification','raw_text','@'||excluded.staff_name||' @'||writer.staff_name,'metadata',jsonb_build_object('permissions',jsonb_build_object('groups','[]'::jsonb,'individuals','[]'::jsonb))));
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'_open|FEED_OPEN' AND user_id=excluded.auth_id)<>1 THEN RAISE EXCEPTION 'public feed mention failed'; END IF;
 IF (SELECT count(*) FROM public.iota_notifications WHERE reference_id=post_id||'_open|FEED_OPEN' AND user_id=writer.auth_id)<>1 THEN RAISE EXCEPTION 'public self mention missing'; END IF;
 IF EXISTS(SELECT 1 FROM public.iota_notifications WHERE reference_id LIKE post_id||'%' AND body LIKE '%Rollback verification%') THEN RAISE EXCEPTION 'private content leaked in notification'; END IF;
 -- Existing workspace post/comment destinations must also survive creation.
 INSERT INTO public.iota_seoul_logs(log_id,work_date,raw_text,summary,writer_staff_id,writer_name,input_status,source_system,metadata)
 VALUES(post_id||'_legacy',current_date,'Rollback verification','Rollback verification',writer.email,writer.staff_name,'submitted','decision_log_form',jsonb_build_object('workspace_code','WS_PMO','workspace_label','통합업무','permissions',jsonb_build_object('groups','[]'::jsonb,'individuals',jsonb_build_array(writer.staff_name))));
 IF NOT EXISTS(SELECT 1 FROM public.iota_notifications WHERE reference_id=post_id||'_legacy|WS_PMO' AND user_id=writer.auth_id) THEN RAISE EXCEPTION 'legacy post link missing'; END IF;
 UPDATE public.iota_seoul_logs SET metadata=metadata||jsonb_build_object('comments',jsonb_build_array(jsonb_build_object('id','reply','text','Rollback verification','author_email',writer.email))) WHERE log_id=post_id||'_legacy';
 IF NOT EXISTS(SELECT 1 FROM public.iota_notifications WHERE reference_id=post_id||'_legacy|WS_PMO' AND type='comment' AND user_id=writer.auth_id) THEN RAISE EXCEPTION 'legacy comment link missing'; END IF;
 IF has_function_privilege('authenticated','public.iota_feed_mention_recipients(text,text,jsonb,text,text)','EXECUTE') THEN RAISE EXCEPTION 'internal recipient resolver exposed'; END IF;
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE affected int; BEGIN
 IF EXISTS(SELECT 1 FROM public.iota_notifications WHERE reference_id LIKE current_setting('test.mention_post')||'%' AND user_id<>auth.uid()) THEN RAISE EXCEPTION 'other recipient notification readable'; END IF;
 DELETE FROM public.iota_notifications WHERE reference_id LIKE current_setting('test.mention_post')||'%' AND user_id<>auth.uid();
 GET DIAGNOSTICS affected=ROW_COUNT;
 IF affected<>0 THEN RAISE EXCEPTION 'other recipient notification deletable'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: person/department mentions, additional readers, self mentions and denied-reader exclusion, repeated comments, edit/reaction deduplication, both feeds, legacy links and recipient RLS; fixtures rolled back' AS result;
