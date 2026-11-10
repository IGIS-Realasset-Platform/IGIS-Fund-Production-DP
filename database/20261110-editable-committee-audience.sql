BEGIN;
-- Keep current function bodies so unrelated comment, attachment and notification fixes survive.
CREATE TABLE IF NOT EXISTS iota_archive.committee_audience_functions_20261110 AS
SELECT oid::regprocedure::text AS signature,pg_get_functiondef(oid) AS definition
FROM pg_proc WHERE oid IN (
 'public.mutate_iota_work_feed(text,text,text,jsonb)'::regprocedure,
 'public.can_read_iota_work_feed_post(text,text,jsonb)'::regprocedure,
 'public.iota_feed_mention_recipients(text,text,jsonb,text,text)'::regprocedure);
ALTER TABLE iota_archive.committee_audience_functions_20261110 ENABLE ROW LEVEL SECURITY;
DO $migration$
DECLARE definition text; signature text; old_rule text; new_rule text;
BEGIN
 definition:=pg_get_functiondef('public.mutate_iota_work_feed(text,text,text,jsonb)'::regprocedure);
 old_rule:=$old$permissions := coalesce(p_payload->'metadata'->'permissions',jsonb_build_object('groups','[]'::jsonb,'individuals','[]'::jsonb));$old$;
 new_rule:=$new$permissions := coalesce(p_payload->'metadata'->'permissions',post.metadata->'permissions',CASE WHEN p_feed='committee' THEN '{"groups":[],"individuals":["이철승","강순용","권순일","양준모"]}'::jsonb ELSE '{"groups":[],"individuals":[]}'::jsonb END);$new$;
 IF position(old_rule IN definition)=0 OR position($old$'["이철승","강순용","권순일","양준모"]'::jsonb || (permissions->'individuals')$old$ IN definition)=0 THEN RAISE EXCEPTION 'Unexpected audience save definition'; END IF;
 definition:=replace(definition,old_rule,new_rule);
 definition:=replace(definition,$old$'["이철승","강순용","권순일","양준모"]'::jsonb || (permissions->'individuals')$old$,$new$(permissions->'individuals')$new$);
 definition:=replace(definition,'SELECT jsonb_agg(value ORDER BY first_seen)', $new$SELECT coalesce(jsonb_agg(value ORDER BY first_seen),'[]'::jsonb)$new$);
 definition:=replace(definition,'Keep the default four and append only explicitly selected active members.','Keep the explicitly selected audience, including an empty private audience.');
 EXECUTE definition;
 old_rule:=$old$(p_feed='committee' AND m.staff_name IN ('이철승','강순용','권순일','양준모'))$old$;
 new_rule:=$new$(p_feed='committee' AND NOT (coalesce(p_metadata->'permissions','{}'::jsonb) ? 'individuals') AND m.staff_name IN ('이철승','강순용','권순일','양준모'))$new$;
 FOREACH signature IN ARRAY ARRAY['public.can_read_iota_work_feed_post(text,text,jsonb)','public.iota_feed_mention_recipients(text,text,jsonb,text,text)'] LOOP
  definition:=pg_get_functiondef(signature::regprocedure);
  IF position(old_rule IN definition)=0 THEN RAISE EXCEPTION 'Unexpected audience read definition: %',signature; END IF;
  EXECUTE replace(definition,old_rule,new_rule);
 END LOOP;
END $migration$;
COMMIT;
SELECT 'Applied: default four only for unspecified audiences; explicit removals respected by save, read and mentions' AS result;
