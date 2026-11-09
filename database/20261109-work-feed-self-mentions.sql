-- Include the author in explicit person/department mentions; readership is unchanged.
BEGIN;
CREATE OR REPLACE FUNCTION public.iota_feed_mention_recipients(p_feed text,p_writer text,p_metadata jsonb,p_text text,p_actor text)
RETURNS TABLE(user_id uuid) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT DISTINCT m.auth_id FROM public.iota_seoul_pilot_members m
 WHERE m.is_active AND m.auth_id IS NOT NULL
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

COMMIT;
