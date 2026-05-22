-- Create notification records from collaboration logs, comments, and workspace tasks.
-- After applying this SQL, attach a Database Webhook to public.iota_notifications INSERT.

CREATE OR REPLACE FUNCTION public.iota_comment_count(metadata_value jsonb)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN jsonb_typeof(metadata_value -> 'comments') = 'array'
      THEN jsonb_array_length(metadata_value -> 'comments')
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.iota_text_array_from_json(value jsonb)
RETURNS text[]
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(array_agg(item), ARRAY[]::text[])
  FROM jsonb_array_elements_text(COALESCE(value, '[]'::jsonb)) AS item;
$$;

CREATE OR REPLACE FUNCTION public.iota_create_notifications_for_emails(
  p_emails text[],
  p_title text,
  p_body text,
  p_type text,
  p_reference_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.iota_notifications (user_id, title, body, type, reference_id)
  SELECT DISTINCT
    auth_users.id,
    p_title,
    p_body,
    p_type,
    p_reference_id
  FROM auth.users AS auth_users
  WHERE lower(auth_users.email) = ANY (
    SELECT lower(trim(email_value))
    FROM unnest(COALESCE(p_emails, ARRAY[]::text[])) AS email_value
    WHERE trim(email_value) <> ''
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.iota_workspace_member_emails(p_workspace_code text)
RETURNS text[]
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(array_agg(DISTINCT member_email), ARRAY[]::text[])
  FROM (
    SELECT members.email AS member_email
    FROM public.iota_seoul_pilot_members AS members
    WHERE members.email IS NOT NULL
      AND (
        upper(COALESCE(members.workspace_code, '')) = upper(COALESCE(p_workspace_code, ''))
        OR lower(COALESCE(members.role_code, '')) IN ('master', 'director')
        OR upper(COALESCE(members.workspace_code, '')) = 'WS_MASTER'
      )
  ) AS members;
$$;

CREATE OR REPLACE FUNCTION public.iota_visible_member_emails(
  p_metadata jsonb,
  p_writer_email text
)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  groups text[];
  individuals text[];
  v_workspace_code text;
  v_workspace_label text;
  has_explicit_visibility boolean;
  recipients text[];
BEGIN
  groups := public.iota_text_array_from_json(p_metadata -> 'permissions' -> 'groups');
  individuals := public.iota_text_array_from_json(p_metadata -> 'permissions' -> 'individuals');
  v_workspace_code := p_metadata ->> 'workspace_code';
  v_workspace_label := p_metadata ->> 'workspace_label';
  has_explicit_visibility := COALESCE(array_length(groups, 1), 0) > 0
    OR COALESCE(array_length(individuals, 1), 0) > 0;

  SELECT COALESCE(array_agg(DISTINCT email), ARRAY[]::text[])
  INTO recipients
  FROM (
    SELECT members.email
    FROM public.iota_seoul_pilot_members AS members
    WHERE members.email IS NOT NULL
      AND (
        lower(members.email) = lower(COALESCE(p_writer_email, ''))
        OR lower(members.staff_name) = ANY (
          SELECT lower(trim(value)) FROM unnest(individuals) AS value
        )
        OR lower(members.email) = ANY (
          SELECT lower(trim(value)) FROM unnest(individuals) AS value
        )
        OR (
          has_explicit_visibility
          AND EXISTS (
            SELECT 1
            FROM unnest(groups) AS group_value
            WHERE trim(group_value) <> ''
              AND (
                lower(group_value) = lower(COALESCE(members.role_code, ''))
                OR upper(group_value) = upper(COALESCE(members.workspace_code, ''))
                OR lower(group_value) = lower(COALESCE(members.org_name, ''))
                OR (
                  COALESCE(NULLIF(members.org_name, ''), '') <> ''
                  AND lower(COALESCE(members.org_name, '')) LIKE '%' || lower(group_value) || '%'
                )
                OR (
                  COALESCE(NULLIF(members.org_name, ''), '') <> ''
                  AND lower(group_value) LIKE '%' || lower(COALESCE(members.org_name, '')) || '%'
                )
                OR lower(group_value) = lower(COALESCE(v_workspace_label, ''))
                OR lower(group_value) = '각 워크스페이스'
                  AND upper(COALESCE(members.workspace_code, '')) = upper(COALESCE(v_workspace_code, ''))
              )
          )
        )
        OR (
          NOT has_explicit_visibility
          AND upper(COALESCE(members.workspace_code, '')) = upper(COALESCE(v_workspace_code, ''))
        )
      )
  ) AS visible_members;

  RETURN recipients;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_iota_collaboration_log_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workspace_label text;
  message_body text;
  recipient_emails text[];
BEGIN
  workspace_label := COALESCE(NULLIF(NEW.metadata ->> 'workspace_label', ''), '공통');
  message_body := COALESCE(NULLIF(NEW.summary, ''), NULLIF(NEW.raw_text, ''), '새 협업 글을 확인해보세요.');
  recipient_emails := public.iota_visible_member_emails(NEW.metadata::jsonb, NEW.writer_staff_id);

  PERFORM public.iota_create_notifications_for_emails(
    recipient_emails,
    '[협업][' || workspace_label || ']에 새 글이 등록됐습니다.',
    LEFT(message_body, 120),
    'collaboration',
    NULL
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_iota_collaboration_log_insert ON public.iota_seoul_logs;
CREATE TRIGGER trg_notify_iota_collaboration_log_insert
AFTER INSERT ON public.iota_seoul_logs
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_collaboration_log_insert();

CREATE OR REPLACE FUNCTION public.notify_iota_comment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  workspace_label text;
  old_comment_count integer;
  new_comment_count integer;
  latest_comment jsonb;
  message_body text;
  recipient_emails text[];
BEGIN
  old_comment_count := public.iota_comment_count(COALESCE(OLD.metadata::jsonb, '{}'::jsonb));
  new_comment_count := public.iota_comment_count(COALESCE(NEW.metadata::jsonb, '{}'::jsonb));

  IF new_comment_count <= old_comment_count THEN
    RETURN NEW;
  END IF;

  workspace_label := COALESCE(NULLIF(NEW.metadata ->> 'workspace_label', ''), '공통');
  latest_comment := NEW.metadata -> 'comments' -> (new_comment_count - 1);
  message_body := COALESCE(NULLIF(latest_comment ->> 'text', ''), '새 댓글을 확인해보세요.');
  recipient_emails := ARRAY[
    NEW.writer_staff_id,
    latest_comment ->> 'author_email',
    latest_comment ->> 'reply_to_author_email',
    latest_comment ->> 'parent_author_email'
  ];

  PERFORM public.iota_create_notifications_for_emails(
    recipient_emails,
    '[댓글][' || workspace_label || ']에 새 댓글이 등록됐습니다.',
    LEFT(message_body, 120),
    'comment',
    NULL
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_iota_comment_insert ON public.iota_seoul_logs;
CREATE TRIGGER trg_notify_iota_comment_insert
AFTER UPDATE OF metadata ON public.iota_seoul_logs
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_comment_insert();

CREATE OR REPLACE FUNCTION public.notify_iota_task_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_code text;
  v_workspace_label text;
  task_title text;
  recipient_emails text[];
BEGIN
  v_workspace_code := CASE TG_TABLE_NAME
    WHEN 'iota_pm_tasks' THEN 'WS_PM'
    WHEN 'iota_financing_tasks' THEN 'WS_LFC'
    WHEN 'iota_development_tasks' THEN 'WS_DSC'
    WHEN 'iota_marketing_tasks' THEN 'WS_EMC'
    WHEN 'iota_digital_tasks' THEN 'WS_SSC'
    WHEN 'iota_fund_tasks' THEN 'WS_KAM'
    WHEN 'iota_ipr_tasks' THEN 'WS_IPR'
    ELSE ''
  END;
  v_workspace_label := CASE TG_TABLE_NAME
    WHEN 'iota_pm_tasks' THEN '사업 PM'
    WHEN 'iota_financing_tasks' THEN '파이낸싱-LFC'
    WHEN 'iota_development_tasks' THEN '개발운용-DSC'
    WHEN 'iota_marketing_tasks' THEN '기업마케팅-EMC'
    WHEN 'iota_digital_tasks' THEN '공간디지털-SSC'
    WHEN 'iota_fund_tasks' THEN '투자운용-KAM'
    WHEN 'iota_ipr_tasks' THEN 'IPR'
    ELSE '공통'
  END;
  task_title := COALESCE(NULLIF(NEW.task_name, ''), '새 task를 확인해보세요.');
  recipient_emails := public.iota_workspace_member_emails(v_workspace_code);

  PERFORM public.iota_create_notifications_for_emails(
    recipient_emails,
    '[task][' || v_workspace_label || ']에 새 글이 등록됐습니다.',
    LEFT(task_title, 120),
    'task',
    NULL
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_iota_pm_task_insert ON public.iota_pm_tasks;
CREATE TRIGGER trg_notify_iota_pm_task_insert
AFTER INSERT ON public.iota_pm_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_task_insert();

DROP TRIGGER IF EXISTS trg_notify_iota_financing_task_insert ON public.iota_financing_tasks;
CREATE TRIGGER trg_notify_iota_financing_task_insert
AFTER INSERT ON public.iota_financing_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_task_insert();

DROP TRIGGER IF EXISTS trg_notify_iota_development_task_insert ON public.iota_development_tasks;
CREATE TRIGGER trg_notify_iota_development_task_insert
AFTER INSERT ON public.iota_development_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_task_insert();

DROP TRIGGER IF EXISTS trg_notify_iota_marketing_task_insert ON public.iota_marketing_tasks;
CREATE TRIGGER trg_notify_iota_marketing_task_insert
AFTER INSERT ON public.iota_marketing_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_task_insert();

DROP TRIGGER IF EXISTS trg_notify_iota_digital_task_insert ON public.iota_digital_tasks;
CREATE TRIGGER trg_notify_iota_digital_task_insert
AFTER INSERT ON public.iota_digital_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_task_insert();

DROP TRIGGER IF EXISTS trg_notify_iota_fund_task_insert ON public.iota_fund_tasks;
CREATE TRIGGER trg_notify_iota_fund_task_insert
AFTER INSERT ON public.iota_fund_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_task_insert();

DROP TRIGGER IF EXISTS trg_notify_iota_ipr_task_insert ON public.iota_ipr_tasks;
CREATE TRIGGER trg_notify_iota_ipr_task_insert
AFTER INSERT ON public.iota_ipr_tasks
FOR EACH ROW
EXECUTE FUNCTION public.notify_iota_task_insert();
