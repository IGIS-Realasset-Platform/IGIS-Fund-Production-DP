BEGIN;
ALTER TABLE public.iota_work_feed_members ADD COLUMN IF NOT EXISTS is_planning boolean NOT NULL DEFAULT false;
UPDATE public.iota_work_feed_members a SET is_planning=true FROM public.iota_seoul_pilot_members m
 WHERE lower(m.email)=a.email AND m.org_name IN ('기획추진','기획추진실','기획추진센터');

CREATE OR REPLACE FUNCTION public.iota_work_feed_org(m public.iota_seoul_pilot_members)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path='' AS $$
 WITH normalized AS (SELECT coalesce('{",":",","))RETURN":")) return",";IF([":";\n    if ([","].INCLUDES(COMPACTNAME))RETURN":"].includes(compactName)) return",";IF(COMPACTNAME.INCLUDES(":";\n    if (compactName.includes(",")||COMPACTNAME.INCLUDES(":") || compactName.includes("}'::jsonb->>upper(regexp_replace(m.org_name,'[[:space:]·/_-]+','','g')),m.org_name,'') AS value)
 SELECT CASE WHEN value IN ('사업1파트','사업2파트','LFC','개발솔루션','기업마케팅','공간솔루션','KAM','IPR','CM','기획추진','CFT 총괄','공통') THEN value
 WHEN value LIKE '%기획추진%' THEN '기획추진'
 ELSE coalesce('{"WS_PM1":"사업1파트","WS_PM2":"사업2파트","WS_LFC":"LFC","WS_FINANCING":"LFC","WS_DSC":"개발솔루션","WS_DEVELOPMENT":"개발솔루션","WS_EMC":"기업마케팅","WS_MARKETING":"기업마케팅","WS_SSC":"공간솔루션","WS_DIGITAL":"공간솔루션","WS_KAM":"KAM","WS_FUND":"KAM","WS_IPR":"IPR","WS_CM":"CM"}'::jsonb->>upper(m.workspace_code),'{"권순일":"사업1파트","윤주형":"사업1파트","김제익":"사업1파트","류홍":"사업1파트","박만진":"사업1파트","박일훈":"사업1파트","이정원":"사업1파트","전무경":"사업1파트","강순용":"사업2파트","한찬호":"사업2파트","박채현":"사업2파트","소현준":"사업2파트","이수정":"사업2파트","조영비":"사업2파트","한수정":"사업2파트","박준호":"LFC","강석민":"LFC","정리훈":"LFC","손유정":"LFC","김지우":"LFC","박현승":"LFC","이성민A":"LFC","한승환":"LFC","홍장군":"개발솔루션","채원":"개발솔루션","김보성":"개발솔루션","전승희":"개발솔루션","김대익":"개발솔루션","장성진":"개발솔루션","이정훈":"개발솔루션","박봉서":"개발솔루션","김형주":"개발솔루션","김현진":"개발솔루션","남민호":"개발솔루션","김민지":"기업마케팅","고아라":"기업마케팅","김현수":"공간솔루션","현철호":"공간솔루션","신민호":"공간솔루션","이가현":"공간솔루션","정수명":"공간솔루션","임수빈":"공간솔루션","김행단":"KAM","윤용택":"IPR","양준모":"CM","이철승":"CFT 총괄","윤관식":"CFT 총괄","정조민":"CFT 총괄","우형석":"CFT 총괄","전기영":"기획추진","이시정":"기획추진","이관용":"기획추진"}'::jsonb->>m.staff_name,nullif(value,''),'') END FROM normalized;
$$;
REVOKE ALL ON FUNCTION public.iota_work_feed_org(public.iota_seoul_pilot_members) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.can_read_iota_work_feed_post(p_feed text,p_writer text,p_metadata jsonb)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(public.can_access_iota_work_feed(p_feed) AND EXISTS (
  SELECT 1 FROM public.iota_seoul_pilot_members m WHERE lower(m.email)=lower(auth.jwt()->>'email') AND m.is_active AND (
   p_feed='committee'
   OR lower(p_writer)=lower(m.email)
   OR EXISTS (SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email) AND a.is_planning)
   OR (coalesce(p_metadata->'permissions'->'groups','[]'::jsonb)='[]'::jsonb AND coalesce(p_metadata->'permissions'->'individuals','[]'::jsonb)='[]'::jsonb)
   OR coalesce(p_metadata->'permissions'->'individuals','[]'::jsonb) ? m.staff_name
   OR coalesce(p_metadata->'permissions'->'groups','[]'::jsonb) ? public.iota_work_feed_org(m)
  )
 ),false);
$$;
REVOKE ALL ON FUNCTION public.can_read_iota_work_feed_post(text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_iota_work_feed_post(text,text,jsonb) TO authenticated;
DROP POLICY IF EXISTS work_feed_read ON public.iota_work_feed_logs;
CREATE POLICY work_feed_read ON public.iota_work_feed_logs FOR SELECT TO authenticated
 USING (public.can_read_iota_work_feed_post(feed_kind,writer_staff_id,metadata));
UPDATE public.iota_work_feed_logs SET metadata=jsonb_set(metadata,'{permissions}','{"groups":[],"individuals":["이철승","강순용","권순일","양준모"]}'::jsonb) WHERE feed_kind='committee';

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
    IF public.can_access_iota_work_feed(p_feed) IS NOT TRUE THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE = '42501'; END IF;
    SELECT staff_name INTO STRICT actor_name FROM public.iota_seoul_pilot_members WHERE lower(email) = actor_email AND is_active;
    SELECT * INTO post FROM public.iota_work_feed_logs WHERE log_id = p_log_id FOR UPDATE;
    IF FOUND AND post.feed_kind <> p_feed THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE = '42501'; END IF;

    IF post.log_id IS NOT NULL AND public.can_read_iota_work_feed_post(post.feed_kind,post.writer_staff_id,post.metadata) IS NOT TRUE THEN
      RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE='42501';
    END IF;
    IF p_action = 'save' THEN
        IF post.log_id IS NOT NULL AND post.writer_staff_id <> actor_email THEN RAISE EXCEPTION '작성자만 수정할 수 있습니다.' USING ERRCODE = '42501'; END IF;
        IF coalesce(btrim(p_payload->>'raw_text'),'') = '' OR coalesce(btrim(p_payload->>'summary'),'') = '' THEN RAISE EXCEPTION '제목과 내용을 입력해 주세요.'; END IF;
        meta := coalesce(p_payload->'metadata','{}'::jsonb) - ARRAY['comments','reactions','permissions','linked_pmo_task_ids','task_id','is_task_board'];
        permissions := CASE WHEN p_feed='committee' THEN '{"groups":[],"individuals":["이철승","강순용","권순일","양준모"]}'::jsonb ELSE coalesce(p_payload->'metadata'->'permissions',jsonb_build_object('groups','[]'::jsonb,'individuals','[]'::jsonb)) END;
        IF jsonb_typeof(permissions) IS DISTINCT FROM 'object' OR jsonb_typeof(permissions->'groups') IS DISTINCT FROM 'array' OR jsonb_typeof(permissions->'individuals') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION '열람권한 형식이 올바르지 않습니다.'; END IF;
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


CREATE OR REPLACE FUNCTION public.can_read_iota_work_feed_file(p_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(public.can_access_iota_work_feed(split_part(p_path,'/',1)) AND (
  split_part(p_path,'/',2)=auth.uid()::text OR EXISTS (
   SELECT 1 FROM public.iota_work_feed_logs l
   WHERE l.metadata->'attachedFiles' @> jsonb_build_array(jsonb_build_object('path',p_path))
    AND public.can_read_iota_work_feed_post(l.feed_kind,l.writer_staff_id,l.metadata)
  )
 ),false);
$$;
REVOKE ALL ON FUNCTION public.can_read_iota_work_feed_file(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_read_iota_work_feed_file(text) TO anon, authenticated;
DROP POLICY IF EXISTS work_feed_file_visibility ON storage.objects;
CREATE POLICY work_feed_file_visibility ON storage.objects AS RESTRICTIVE FOR SELECT TO anon,authenticated
 USING (bucket_id <> 'iota-work-feed-attachments' OR public.can_read_iota_work_feed_file(name));
COMMIT;
