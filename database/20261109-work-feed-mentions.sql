BEGIN;
-- Literal token matching: avoid partial-name matches and email-address false positives.
CREATE OR REPLACE FUNCTION public.iota_feed_has_mention(p_text text,p_label text)
RETURNS boolean LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE cursor_at int:=1; hit int; before_char text; after_char text;
BEGIN
 IF coalesce(p_label,'')='' OR coalesce(p_text,'')='' THEN RETURN false; END IF;
 LOOP
  hit:=strpos(substr(p_text,cursor_at),'@'||p_label);
  IF hit=0 THEN RETURN false; END IF;
  hit:=hit+cursor_at-1;
  before_char:=CASE WHEN hit=1 THEN '' ELSE substr(p_text,hit-1,1) END;
  after_char:=substr(p_text,hit+length(p_label)+1,1);
  IF (before_char='' OR before_char ~ '[[:space:]]' OR strpos('([{',before_char)>0)
   AND (after_char='' OR after_char ~ '[[:space:]]' OR strpos('.,!?;:()[]{}',after_char)>0) THEN RETURN true; END IF;
  cursor_at:=hit+1;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.iota_feed_has_mention(text,text) FROM PUBLIC,anon,authenticated;

-- Internal-only recipient resolver. No JWT impersonation and no ACL expansion.
CREATE OR REPLACE FUNCTION public.iota_feed_mention_recipients(p_feed text,p_writer text,p_metadata jsonb,p_text text,p_actor text)
RETURNS TABLE(user_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT DISTINCT m.auth_id FROM public.iota_seoul_pilot_members m
 WHERE m.is_active AND m.auth_id IS NOT NULL AND lower(m.email)<>lower(p_actor)
 AND (public.iota_feed_has_mention(p_text,m.staff_name) OR public.iota_feed_has_mention(p_text,public.iota_work_feed_org(m)))
 AND p_feed IN ('committee','open') AND (
  lower(m.email)=lower(p_writer)
  OR EXISTS(SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(m.email) AND a.is_planning)
  OR (p_feed='committee' AND m.staff_name IN ('이철승','강순용','권순일','양준모'))
  OR coalesce(p_metadata->'permissions'->'individuals','[]'::jsonb) ? m.staff_name
  OR (p_feed='open' AND (
    (coalesce(p_metadata->'permissions'->'groups','[]'::jsonb)='[]'::jsonb AND coalesce(p_metadata->'permissions'->'individuals','[]'::jsonb)='[]'::jsonb)
    OR coalesce(p_metadata->'permissions'->'groups','[]'::jsonb) ? public.iota_work_feed_org(m)
  ))
 );
$$;
REVOKE ALL ON FUNCTION public.iota_feed_mention_recipients(text,text,jsonb,text,text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.notify_iota_work_feed_mentions()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 old_meta jsonb:=CASE WHEN TG_OP='UPDATE' THEN OLD.metadata ELSE '{}'::jsonb END;
 old_text text:=CASE WHEN TG_OP='UPDATE' THEN OLD.raw_text ELSE '' END;
 item jsonb; old_item jsonb; board_label text; board_code text;
BEGIN
 board_label:=CASE WHEN NEW.feed_kind='committee' THEN '운영위 논의사항' ELSE '자유 업무피드' END;
 board_code:=CASE WHEN NEW.feed_kind='committee' THEN 'FEED_COMMITTEE' ELSE 'FEED_OPEN' END;
 IF TG_OP='INSERT' OR NEW.raw_text IS DISTINCT FROM old_text OR NEW.metadata->'permissions' IS DISTINCT FROM old_meta->'permissions' THEN
  INSERT INTO public.iota_notifications(user_id,title,body,type,reference_id,is_read)
  SELECT recipient.user_id,'[@언급]['||board_label||'] 게시글에서 언급되었습니다.',
   '게시판에서 내용을 확인해 주세요.','log',NEW.log_id||'|'||board_code,false
  FROM (
   SELECT * FROM public.iota_feed_mention_recipients(NEW.feed_kind,NEW.writer_staff_id,NEW.metadata,NEW.raw_text,NEW.writer_staff_id)
   EXCEPT SELECT * FROM public.iota_feed_mention_recipients(NEW.feed_kind,NEW.writer_staff_id,old_meta,old_text,NEW.writer_staff_id)
  ) recipient;
 END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(coalesce(NEW.metadata->'comments','[]'::jsonb)) LOOP
  SELECT value INTO old_item FROM jsonb_array_elements(coalesce(old_meta->'comments','[]'::jsonb)) WHERE value->>'id'=item->>'id';
  IF old_item IS NULL OR item->>'text' IS DISTINCT FROM old_item->>'text' THEN
   INSERT INTO public.iota_notifications(user_id,title,body,type,reference_id,is_read)
   SELECT recipient.user_id,'[@언급]['||board_label||'] 댓글에서 언급되었습니다.',
    '게시판에서 댓글을 확인해 주세요.','log',NEW.log_id||'|'||board_code||'|'||(item->>'id'),false
   FROM (
    SELECT * FROM public.iota_feed_mention_recipients(NEW.feed_kind,NEW.writer_staff_id,NEW.metadata,item->>'text',item->>'author_email')
    EXCEPT SELECT * FROM public.iota_feed_mention_recipients(NEW.feed_kind,NEW.writer_staff_id,old_meta,coalesce(old_item->>'text',''),item->>'author_email')
   ) recipient;
  END IF;
 END LOOP;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_iota_work_feed_mentions() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE TRIGGER iota_work_feed_mention_notifications
 AFTER INSERT OR UPDATE ON public.iota_work_feed_logs
 FOR EACH ROW EXECUTE FUNCTION public.notify_iota_work_feed_mentions();
-- Realtime still enforces the existing per-user SELECT policy.
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='iota_notifications') THEN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.iota_notifications;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='iota_notifications' AND policyname='notification_delete_owner_guard') THEN
  CREATE POLICY notification_delete_owner_guard ON public.iota_notifications AS RESTRICTIVE FOR DELETE TO PUBLIC USING(auth.uid()=user_id);
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='iota_notifications' AND policyname='notification_insert_authenticated_guard') THEN
  CREATE POLICY notification_insert_authenticated_guard ON public.iota_notifications AS RESTRICTIVE FOR INSERT TO PUBLIC WITH CHECK(auth.uid() IS NOT NULL);
 END IF;
END $$;
COMMIT;
