BEGIN;
CREATE OR REPLACE FUNCTION public.update_iota_work_feed_status(p_feed text, p_log_id text, p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
    post public.iota_work_feed_logs%ROWTYPE;
    actor_email text := lower(auth.jwt()->>'email');
BEGIN
    IF public.can_access_iota_work_feed(p_feed) IS NOT TRUE THEN RAISE EXCEPTION '접근 권한이 없습니다.' USING ERRCODE='42501'; END IF;
    SELECT * INTO post FROM public.iota_work_feed_logs WHERE log_id=p_log_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION '게시글을 찾을 수 없습니다.'; END IF;
    IF post.feed_kind IS DISTINCT FROM p_feed
       OR public.can_read_iota_work_feed_post(post.feed_kind,post.writer_staff_id,post.metadata) IS NOT TRUE
       OR post.writer_staff_id IS DISTINCT FROM actor_email THEN
        RAISE EXCEPTION '작성자만 진행상태를 변경할 수 있습니다.' USING ERRCODE='42501';
    END IF;
    IF p_status IS NULL OR p_status NOT IN ('신규','검토중','진행중','보류','완료') THEN RAISE EXCEPTION '진행상태를 확인해 주세요.'; END IF;
    UPDATE public.iota_work_feed_logs SET metadata=jsonb_set(metadata,'{issue_status}',to_jsonb(p_status)), updated_at=now()
      WHERE log_id=p_log_id RETURNING * INTO post;
    RETURN to_jsonb(post);
END;
$$;
REVOKE ALL ON FUNCTION public.update_iota_work_feed_status(text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_iota_work_feed_status(text,text,text) TO authenticated;
COMMIT;
