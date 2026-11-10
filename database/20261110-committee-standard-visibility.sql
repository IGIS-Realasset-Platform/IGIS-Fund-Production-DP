-- Committee audiences use the same individual/group/public rules as the open feed.
-- Missing legacy audiences keep the four defaults; an explicit empty audience is public to active platform members.
BEGIN;
CREATE TABLE IF NOT EXISTS iota_archive.committee_standard_visibility_functions_20261110 AS
SELECT oid::regprocedure::text AS signature, pg_get_functiondef(oid) AS definition FROM pg_proc
WHERE oid IN ('public.mutate_iota_work_feed(text,text,text,jsonb)'::regprocedure,
 'public.can_read_iota_work_feed_post(text,text,jsonb)'::regprocedure,
 'public.iota_feed_mention_recipients(text,text,jsonb,text,text)'::regprocedure);
ALTER TABLE iota_archive.committee_standard_visibility_functions_20261110 ENABLE ROW LEVEL SECURITY;
DO $migration$
DECLARE definition text; signature text; old_rule text;
BEGIN
 definition:=pg_get_functiondef('public.mutate_iota_work_feed(text,text,text,jsonb)'::regprocedure);
 old_rule:=$old$IF permissions->'groups' <> '[]'::jsonb THEN RAISE EXCEPTION '운영위 열람 대상은 인원으로 선택해 주세요.'; END IF;$old$;
 IF position(old_rule IN definition)=0 THEN RAISE EXCEPTION 'Unexpected group validation definition'; END IF;
 definition:=replace(definition,old_rule,'-- Groups are validated against the active member directory below.');
 definition:=replace(definition,'including an empty private audience','including an empty public audience');
 EXECUTE definition;
 FOREACH signature IN ARRAY ARRAY['public.can_read_iota_work_feed_post(text,text,jsonb)','public.iota_feed_mention_recipients(text,text,jsonb,text,text)'] LOOP
  definition:=pg_get_functiondef(signature::regprocedure);
  IF position($old$p_feed='open' AND$old$ IN definition)=0 OR position($old$NOT (coalesce(p_metadata->'permissions','{}'::jsonb) ? 'individuals')$old$ IN definition)=0 THEN RAISE EXCEPTION 'Unexpected audience definition: %',signature; END IF;
  definition:=replace(definition,$old$p_feed='open' AND$old$,$new$(p_feed='open' OR coalesce(p_metadata->'permissions','{}'::jsonb) ? 'individuals') AND$new$);
  EXECUTE definition;
 END LOOP;
END $migration$;
COMMIT;
SELECT 'Applied: committee defaults remain four; explicit audiences support groups and individuals; empty audiences are public to active platform members' AS result;
