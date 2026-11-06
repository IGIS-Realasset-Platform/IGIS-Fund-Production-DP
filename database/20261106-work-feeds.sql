BEGIN;

-- Preserve the old meeting data outside the client API. The original table is unchanged.
CREATE SCHEMA IF NOT EXISTS iota_archive;
REVOKE ALL ON SCHEMA iota_archive FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS iota_archive.meeting_logs_20261106 AS TABLE public.iota_meeting_logs;
ALTER TABLE iota_archive.meeting_logs_20261106 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON iota_archive.meeting_logs_20261106 FROM PUBLIC, anon, authenticated;

-- Server-managed access list: clients cannot grant themselves committee membership.
CREATE TABLE IF NOT EXISTS public.iota_work_feed_members (
    email text PRIMARY KEY,
    staff_name text NOT NULL
);
ALTER TABLE public.iota_work_feed_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iota_work_feed_members FROM PUBLIC, anon, authenticated;
INSERT INTO public.iota_work_feed_members (email, staff_name)
SELECT lower(email), staff_name FROM public.iota_seoul_pilot_members
WHERE is_active AND (staff_name IN ('이철승','권순일','강순용','양준모') OR org_name IN ('기획추진','기획추진실','기획추진센터'))
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.can_access_iota_work_feed(p_feed text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT auth.uid() IS NOT NULL AND p_feed IN ('committee','open')
      AND EXISTS (SELECT 1 FROM public.iota_seoul_pilot_members m
                  WHERE lower(m.email) = lower(auth.jwt()->>'email') AND m.is_active)
      AND (p_feed = 'open' OR EXISTS (
          SELECT 1 FROM public.iota_work_feed_members a WHERE a.email = lower(auth.jwt()->>'email')
      ));
$$;
REVOKE ALL ON FUNCTION public.can_access_iota_work_feed(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_access_iota_work_feed(text) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.iota_work_feed_logs (
    log_id text PRIMARY KEY,
    feed_kind text NOT NULL CHECK (feed_kind IN ('committee','open')),
    work_date date NOT NULL DEFAULT current_date,
    raw_text text NOT NULL,
    summary text NOT NULL,
    writer_staff_id text NOT NULL,
    writer_name text NOT NULL,
    input_status text NOT NULL DEFAULT 'submitted',
    source_system text NOT NULL DEFAULT 'work_feed',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    iota_seoul_log_stakeholders jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS iota_work_feed_logs_board_date ON public.iota_work_feed_logs(feed_kind, work_date DESC, created_at DESC);
ALTER TABLE public.iota_work_feed_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iota_work_feed_logs FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.iota_work_feed_logs TO authenticated;
DROP POLICY IF EXISTS work_feed_read ON public.iota_work_feed_logs;
CREATE POLICY work_feed_read ON public.iota_work_feed_logs FOR SELECT TO authenticated
USING (public.can_access_iota_work_feed(feed_kind));

-- All mutations are serialized per post. Identity, board, and comment ownership are server enforced.
CREATE OR REPLACE FUNCTION public.mutate_iota_work_feed(p_feed text, p_action text, p_log_id text, p_payload jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    actor_email text := lower(auth.jwt()->>'email');
    actor_name text;
    post public.iota_work_feed_logs%ROWTYPE;
    meta jsonb;
    items jsonb;
    item jsonb;
    next_items jsonb := '[]'::jsonb;
    target_id text := p_payload->>'comment_id';
    reaction text := p_payload->>'reaction';
    reactions jsonb;
    selected jsonb;
    found_target boolean := false;
BEGIN
    IF public.can_access_iota_work_feed(p_feed) IS NOT TRUE THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE = '42501'; END IF;
    SELECT staff_name INTO STRICT actor_name FROM public.iota_seoul_pilot_members WHERE lower(email) = actor_email AND is_active;
    SELECT * INTO post FROM public.iota_work_feed_logs WHERE log_id = p_log_id FOR UPDATE;
    IF FOUND AND post.feed_kind <> p_feed THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE = '42501'; END IF;

    IF p_action = 'save' THEN
        IF post.log_id IS NOT NULL AND post.writer_staff_id <> actor_email THEN RAISE EXCEPTION '작성자만 수정할 수 있습니다.' USING ERRCODE = '42501'; END IF;
        IF coalesce(btrim(p_payload->>'raw_text'),'') = '' OR coalesce(btrim(p_payload->>'summary'),'') = '' THEN RAISE EXCEPTION '제목과 내용을 입력해 주세요.'; END IF;
        meta := coalesce(p_payload->'metadata','{}'::jsonb) - ARRAY['comments','reactions','permissions','linked_pmo_task_ids','task_id','is_task_board'];
        meta := meta || jsonb_build_object('workspace_code', CASE WHEN p_feed='committee' THEN 'FEED_COMMITTEE' ELSE 'FEED_OPEN' END,
            'workspace_label', CASE WHEN p_feed='committee' THEN '운영위 논의사항' ELSE '자유 업무피드' END,
            'content_updated_at',now(),
            'comments',coalesce(post.metadata->'comments','[]'::jsonb),'reactions',coalesce(post.metadata->'reactions','{}'::jsonb));
        FOR item IN SELECT value FROM jsonb_array_elements(coalesce(meta->'attachedFiles','[]'::jsonb)) LOOP
            IF item->>'path' IS NULL OR split_part(item->>'path','/',1) <> p_feed OR (item->>'path') LIKE '%..%' THEN RAISE EXCEPTION '잘못된 첨부파일 경로입니다.'; END IF;
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
REVOKE ALL ON FUNCTION public.mutate_iota_work_feed(text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mutate_iota_work_feed(text,text,text,jsonb) TO authenticated;

INSERT INTO storage.buckets(id,name,public,file_size_limit) VALUES('iota-work-feed-attachments','iota-work-feed-attachments',false,52428800)
ON CONFLICT(id) DO UPDATE SET public=false;
-- Restrictive policy also fences off this bucket from legacy broad storage policies.
DROP POLICY IF EXISTS work_feed_storage_boundary ON storage.objects;
CREATE POLICY work_feed_storage_boundary ON storage.objects AS RESTRICTIVE FOR ALL TO anon, authenticated
USING (bucket_id <> 'iota-work-feed-attachments' OR public.can_access_iota_work_feed(split_part(name,'/',1)))
WITH CHECK (bucket_id <> 'iota-work-feed-attachments' OR (public.can_access_iota_work_feed(split_part(name,'/',1)) AND split_part(name,'/',2)=auth.uid()::text));
DROP POLICY IF EXISTS work_feed_file_read ON storage.objects;
CREATE POLICY work_feed_file_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='iota-work-feed-attachments' AND public.can_access_iota_work_feed(split_part(name,'/',1)));
DROP POLICY IF EXISTS work_feed_file_insert ON storage.objects;
CREATE POLICY work_feed_file_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='iota-work-feed-attachments' AND public.can_access_iota_work_feed(split_part(name,'/',1)) AND split_part(name,'/',2)=auth.uid()::text);
DROP POLICY IF EXISTS work_feed_file_owner_update ON storage.objects;
CREATE POLICY work_feed_file_owner_update ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
USING (bucket_id <> 'iota-work-feed-attachments' OR split_part(name,'/',2)=auth.uid()::text);
DROP POLICY IF EXISTS work_feed_file_owner_delete ON storage.objects;
CREATE POLICY work_feed_file_owner_delete ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
USING (bucket_id <> 'iota-work-feed-attachments' OR split_part(name,'/',2)=auth.uid()::text);
COMMIT;
