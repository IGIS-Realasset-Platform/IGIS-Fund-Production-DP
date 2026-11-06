-- Per-post committee audiences; public listing returns only safe placeholders for denied posts.
BEGIN;
CREATE OR REPLACE FUNCTION public.can_read_iota_work_feed_post(p_feed text,p_writer text,p_metadata jsonb)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(p_feed IN ('committee','open') AND public.can_access_iota_work_feed('open') AND EXISTS (
  SELECT 1 FROM public.iota_seoul_pilot_members m WHERE lower(m.email)=lower(auth.jwt()->>'email') AND m.is_active AND (
   lower(p_writer)=lower(m.email)
   OR EXISTS (SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email) AND a.is_planning)
   OR (p_feed='committee' AND m.staff_name IN ('이철승','강순용','권순일','양준모'))
   OR (p_feed='open' AND coalesce(p_metadata->'permissions'->'groups','[]'::jsonb)='[]'::jsonb AND coalesce(p_metadata->'permissions'->'individuals','[]'::jsonb)='[]'::jsonb)
   OR coalesce(p_metadata->'permissions'->'individuals','[]'::jsonb) ? m.staff_name
   OR (p_feed='open' AND coalesce(p_metadata->'permissions'->'groups','[]'::jsonb) ? public.iota_work_feed_org(m))
  )
 ),false);
$$;
REVOKE ALL ON FUNCTION public.can_read_iota_work_feed_post(text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_iota_work_feed_post(text,text,jsonb) TO authenticated;

-- Existing table RLS still returns only readable posts; it is never relaxed for listing.
CREATE OR REPLACE FUNCTION public.list_iota_committee_feed()
RETURNS SETOF jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF public.can_access_iota_work_feed('open') IS NOT TRUE THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE='42501'; END IF;
 RETURN QUERY SELECT CASE
   WHEN public.can_read_iota_work_feed_post(l.feed_kind,l.writer_staff_id,l.metadata)
     THEN to_jsonb(l) || jsonb_build_object('can_read',true)
   ELSE jsonb_build_object(
     'log_id',l.log_id,'feed_kind',l.feed_kind,'can_read',false,
     'work_date',l.work_date,'created_at',l.created_at,'writer_name',l.writer_name,
     'summary',null,'raw_text',null,'writer_staff_id',null,
     'iota_seoul_log_stakeholders','[]'::jsonb,
     'metadata',jsonb_strip_nulls(jsonb_build_object(
       'project_name',l.metadata->'project_name','workspace_code','FEED_COMMITTEE',
       'workspace_label','운영위 논의사항','triage_type',l.metadata->'triage_type',
       'issue_status',l.metadata->'issue_status','priority',l.metadata->'priority'
     ))
   ) END
 FROM public.iota_work_feed_logs l WHERE l.feed_kind='committee'
 ORDER BY l.work_date DESC,l.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.list_iota_committee_feed() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.list_iota_committee_feed() TO authenticated;

CREATE OR REPLACE FUNCTION public.mutate_iota_work_feed(p_feed text, p_action text, p_log_id text, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    actor_email text := lower(auth.jwt()->>'email');
    actor_name text;
    post public.iota_work_feed_logs%ROWTYPE;
    meta jsonb;
    permissions jsonb;
    items jsonb;
    item jsonb;
    next_items jsonb := '[]'::jsonb;
    target_id text := p_payload->>'comment_id';
    reaction text := p_payload->>'reaction';
    reactions jsonb;
    selected jsonb;
    found_target boolean := false;
BEGIN
    IF p_feed IS NULL OR p_feed NOT IN ('committee','open') OR public.can_access_iota_work_feed('open') IS NOT TRUE THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE = '42501'; END IF;
    SELECT staff_name INTO STRICT actor_name FROM public.iota_seoul_pilot_members WHERE lower(email) = actor_email AND is_active;
    SELECT * INTO post FROM public.iota_work_feed_logs WHERE log_id = p_log_id FOR UPDATE;
    IF FOUND AND post.feed_kind <> p_feed THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE = '42501'; END IF;

    IF post.log_id IS NOT NULL AND public.can_read_iota_work_feed_post(post.feed_kind,post.writer_staff_id,post.metadata) IS NOT TRUE THEN
      RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE='42501';
    END IF;
    IF p_action = 'save' THEN
        IF post.log_id IS NULL AND public.can_access_iota_work_feed(p_feed) IS NOT TRUE THEN RAISE EXCEPTION '글 작성 권한이 없습니다.' USING ERRCODE='42501'; END IF;
        IF post.log_id IS NOT NULL AND post.writer_staff_id <> actor_email THEN RAISE EXCEPTION '작성자만 수정할 수 있습니다.' USING ERRCODE = '42501'; END IF;
        IF coalesce(btrim(p_payload->>'raw_text'),'') = '' OR coalesce(btrim(p_payload->>'summary'),'') = '' THEN RAISE EXCEPTION '제목과 내용을 입력해 주세요.'; END IF;
        meta := coalesce(p_payload->'metadata','{}'::jsonb) - ARRAY['comments','reactions','permissions','linked_pmo_task_ids','task_id','is_task_board'];
        permissions := coalesce(p_payload->'metadata'->'permissions',jsonb_build_object('groups','[]'::jsonb,'individuals','[]'::jsonb));
        IF jsonb_typeof(permissions) IS DISTINCT FROM 'object' OR jsonb_typeof(permissions->'groups') IS DISTINCT FROM 'array' OR jsonb_typeof(permissions->'individuals') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION '열람권한 형식이 올바르지 않습니다.'; END IF;
        IF p_feed='committee' THEN
            -- Keep the default four and append only explicitly selected active members.
            IF permissions->'groups' <> '[]'::jsonb THEN RAISE EXCEPTION '운영위 열람 대상은 인원으로 선택해 주세요.'; END IF;
            permissions := jsonb_set(permissions,'{individuals}', (
                SELECT jsonb_agg(value ORDER BY first_seen) FROM (
                    SELECT value,min(ordinality) AS first_seen FROM jsonb_array_elements(
                        '["이철승","강순용","권순일","양준모"]'::jsonb || (permissions->'individuals')
                    ) WITH ORDINALITY GROUP BY value
                ) distinct_readers
            ));
        END IF;
        FOR item IN SELECT value FROM jsonb_array_elements(permissions->'groups') LOOP
            IF jsonb_typeof(item)<>'string' OR NOT EXISTS (SELECT 1 FROM public.iota_seoul_pilot_members m WHERE m.is_active AND public.iota_work_feed_org(m)=item#>>'{}') THEN RAISE EXCEPTION '열람권한 그룹을 확인해 주세요.'; END IF;
        END LOOP;
        FOR item IN SELECT value FROM jsonb_array_elements(permissions->'individuals') LOOP
            IF jsonb_typeof(item)<>'string' OR NOT EXISTS (SELECT 1 FROM public.iota_seoul_pilot_members m WHERE m.is_active AND m.staff_name=item#>>'{}') THEN RAISE EXCEPTION '열람 대상 인원을 확인해 주세요.'; END IF;
        END LOOP;
        meta := meta || jsonb_build_object('permissions',permissions);
        meta := meta || jsonb_build_object('workspace_code', CASE WHEN p_feed='committee' THEN 'FEED_COMMITTEE' ELSE 'FEED_OPEN' END,
            'workspace_label', CASE WHEN p_feed='committee' THEN '운영위 논의사항' ELSE '자유 업무피드' END,
            'content_updated_at',now(),
            'comments',coalesce(post.metadata->'comments','[]'::jsonb),'reactions',coalesce(post.metadata->'reactions','{}'::jsonb));
        FOR item IN SELECT value FROM jsonb_array_elements(coalesce(meta->'attachedFiles','[]'::jsonb)) LOOP
            IF item->>'path' IS NULL OR split_part(item->>'path','/',1) <> p_feed OR (item->>'path') LIKE '%..%' OR split_part(item->>'path','/',2)<>auth.uid()::text THEN RAISE EXCEPTION '잘못된 첨부파일 경로입니다.'; END IF;
        END LOOP;
        IF post.log_id IS NULL THEN
            INSERT INTO public.iota_work_feed_logs(log_id,feed_kind,work_date,raw_text,summary,writer_staff_id,writer_name,metadata,iota_seoul_log_stakeholders)
            VALUES(p_log_id,p_feed,(p_payload->>'work_date')::date,p_payload->>'raw_text',p_payload->>'summary',actor_email,actor_name,meta,coalesce(p_payload->'stakeholders','[]'::jsonb)) RETURNING * INTO post;
        ELSE
            UPDATE public.iota_work_feed_logs SET work_date=(p_payload->>'work_date')::date,raw_text=p_payload->>'raw_text',summary=p_payload->>'summary',metadata=meta,
                iota_seoul_log_stakeholders=coalesce(p_payload->'stakeholders','[]'::jsonb),updated_at=now() WHERE log_id=p_log_id RETURNING * INTO post;
        END IF;
        RETURN to_jsonb(post);
    END IF;
    IF post.log_id IS NULL THEN RAISE EXCEPTION '게시글을 찾을 수 없습니다.'; END IF;
    IF p_action = 'delete' THEN
        IF post.writer_staff_id <> actor_email THEN RAISE EXCEPTION '작성자만 삭제할 수 있습니다.' USING ERRCODE = '42501'; END IF;
        DELETE FROM public.iota_work_feed_logs WHERE log_id=p_log_id;
        RETURN jsonb_build_object('deleted',true);
    END IF;
    meta := post.metadata;
    items := coalesce(meta->'comments','[]'::jsonb);
    IF p_action = 'comment' THEN
        IF coalesce(btrim(p_payload->>'text'),'') = '' THEN RAISE EXCEPTION '댓글 내용을 입력해 주세요.'; END IF;
        meta := jsonb_set(meta,'{comments}',items || jsonb_build_array(jsonb_build_object('id',gen_random_uuid()::text,'author',actor_name,'author_email',actor_email,'text',p_payload->>'text','created_at',now())));
    ELSIF p_action = 'edit_comment' THEN
        IF coalesce(btrim(p_payload->>'text'),'') = '' THEN RAISE EXCEPTION '댓글 내용을 입력해 주세요.'; END IF;
        FOR item IN SELECT value FROM jsonb_array_elements(items) LOOP
            IF item->>'id' = target_id THEN
                IF item->>'author_email' IS DISTINCT FROM actor_email THEN RAISE EXCEPTION '작성자만 댓글을 수정할 수 있습니다.' USING ERRCODE = '42501'; END IF;
                found_target := true;
                item := item || jsonb_build_object('text',p_payload->>'text','updated_at',now());
            END IF;
            next_items := next_items || jsonb_build_array(item);
        END LOOP;
        IF NOT found_target THEN RAISE EXCEPTION '댓글을 찾을 수 없습니다.'; END IF;
        meta := jsonb_set(meta,'{comments}',next_items);
    ELSIF p_action = 'delete_comment' THEN
        FOR item IN SELECT value FROM jsonb_array_elements(items) LOOP
            IF item->>'id' = target_id THEN
                IF item->>'author_email' <> actor_email THEN RAISE EXCEPTION '작성자만 댓글을 삭제할 수 있습니다.' USING ERRCODE = '42501'; END IF;
                found_target := true;
            ELSE next_items := next_items || jsonb_build_array(item); END IF;
        END LOOP;
        IF NOT found_target THEN RAISE EXCEPTION '댓글을 찾을 수 없습니다.'; END IF;
        meta := jsonb_set(meta,'{comments}',next_items);
    ELSIF p_action = 'react' THEN
        IF reaction NOT IN ('like','check') OR reaction IS NULL THEN RAISE EXCEPTION '잘못된 반응입니다.'; END IF;
        IF target_id IS NOT NULL THEN
            FOR item IN SELECT value FROM jsonb_array_elements(items) LOOP
                IF item->>'id' = target_id THEN
                    found_target := true;
                    reactions := coalesce(item->'reactions','{}'::jsonb);
                    selected := coalesce(reactions->reaction,'[]'::jsonb);
                    selected := CASE WHEN selected ? actor_email THEN selected - actor_email ELSE selected || jsonb_build_array(actor_email) END;
                    item := item || jsonb_build_object('reactions',reactions || jsonb_build_object(reaction,selected));
                END IF;
                next_items := next_items || jsonb_build_array(item);
            END LOOP;
            IF NOT found_target THEN RAISE EXCEPTION '댓글을 찾을 수 없습니다.'; END IF;
            meta := jsonb_set(meta,'{comments}',next_items);
        ELSE
            reactions := coalesce(meta->'reactions','{}'::jsonb);
            selected := coalesce(reactions->reaction,'[]'::jsonb);
            selected := CASE WHEN selected ? actor_email THEN selected - actor_email ELSE selected || jsonb_build_array(actor_email) END;
            meta := meta || jsonb_build_object('reactions',reactions || jsonb_build_object(reaction,selected));
        END IF;
    ELSE RAISE EXCEPTION '지원하지 않는 작업입니다.';
    END IF;
    UPDATE public.iota_work_feed_logs SET metadata=meta,updated_at=now() WHERE log_id=p_log_id RETURNING * INTO post;
    RETURN to_jsonb(post);
END;
$$;
REVOKE ALL ON FUNCTION public.mutate_iota_work_feed(text,text,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.mutate_iota_work_feed(text,text,text,jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.can_read_iota_work_feed_file(p_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(split_part(p_path,'/',1) IN ('committee','open') AND public.can_access_iota_work_feed('open') AND (
  split_part(p_path,'/',2)=auth.uid()::text OR EXISTS (
   SELECT 1 FROM public.iota_work_feed_logs l
   WHERE l.feed_kind=split_part(p_path,'/',1)
    AND l.metadata->'attachedFiles' @> jsonb_build_array(jsonb_build_object('path',p_path))
    AND public.can_read_iota_work_feed_post(l.feed_kind,l.writer_staff_id,l.metadata)
  )
 ),false);
$$;
REVOKE ALL ON FUNCTION public.can_read_iota_work_feed_file(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_iota_work_feed_file(text) TO anon,authenticated;
DROP POLICY IF EXISTS work_feed_storage_boundary ON storage.objects;
CREATE POLICY work_feed_storage_boundary ON storage.objects AS RESTRICTIVE FOR ALL TO anon,authenticated
 USING(bucket_id <> 'iota-work-feed-attachments' OR (split_part(name,'/',1) IN ('committee','open') AND public.can_access_iota_work_feed('open')))
 WITH CHECK(bucket_id <> 'iota-work-feed-attachments' OR (public.can_access_iota_work_feed(split_part(name,'/',1)) AND split_part(name,'/',2)=auth.uid()::text));
DROP POLICY IF EXISTS work_feed_file_read ON storage.objects;
CREATE POLICY work_feed_file_read ON storage.objects FOR SELECT TO authenticated
 USING(bucket_id='iota-work-feed-attachments' AND public.can_read_iota_work_feed_file(name));
-- The per-post restrictive SELECT policy and owner-only mutation policies remain in effect.
COMMIT;
