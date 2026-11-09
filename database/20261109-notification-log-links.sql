BEGIN;
-- Existing trigger alerts passed NULL for the destination. Keep their audience and
-- message format, but write the text log/workspace reference used by both clients.
CREATE OR REPLACE FUNCTION public.notify_iota_collaboration_log_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE recipient_emails text[];
BEGIN
 recipient_emails:=public.iota_visible_member_emails(NEW.metadata::jsonb,NEW.writer_staff_id);
 INSERT INTO public.iota_notifications(user_id,title,body,type,reference_id)
 SELECT DISTINCT u.id,'[협업]['||coalesce(nullif(NEW.metadata->>'workspace_label',''),'공통')||']에 새 글이 등록됐습니다.',
 left(coalesce(nullif(NEW.summary,''),nullif(NEW.raw_text,''),'새 협업 글을 확인해보세요.'),120),'collaboration',
 NEW.log_id::text||'|'||coalesce(nullif(NEW.metadata->>'workspace_code',''),'WS_PMO')
 FROM auth.users u WHERE lower(u.email) IN (SELECT lower(trim(e)) FROM unnest(coalesce(recipient_emails,ARRAY[]::text[])) e WHERE trim(e)<>'');
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.notify_iota_comment_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE old_count int; new_count int; latest_comment jsonb; recipient_emails text[];
BEGIN
 old_count:=public.iota_comment_count(coalesce(OLD.metadata::jsonb,'{}'::jsonb));
 new_count:=public.iota_comment_count(coalesce(NEW.metadata::jsonb,'{}'::jsonb));
 IF new_count<=old_count THEN RETURN NEW; END IF;
 latest_comment:=NEW.metadata->'comments'->(new_count-1);
 recipient_emails:=ARRAY[NEW.writer_staff_id,latest_comment->>'author_email',latest_comment->>'reply_to_author_email',latest_comment->>'parent_author_email'];
 INSERT INTO public.iota_notifications(user_id,title,body,type,reference_id)
 SELECT DISTINCT u.id,'[댓글]['||coalesce(nullif(NEW.metadata->>'workspace_label',''),'공통')||']에 새 댓글이 등록됐습니다.',
 left(coalesce(nullif(latest_comment->>'text',''),'새 댓글을 확인해보세요.'),120),'comment',
 NEW.log_id::text||'|'||coalesce(nullif(NEW.metadata->>'workspace_code',''),'WS_PMO')
 FROM auth.users u WHERE lower(u.email) IN (SELECT lower(trim(e)) FROM unnest(coalesce(recipient_emails,ARRAY[]::text[])) e WHERE trim(e)<>'');
 RETURN NEW;
END $$;
COMMIT;
