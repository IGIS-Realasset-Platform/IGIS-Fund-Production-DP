BEGIN;
DO $$ DECLARE writer public.iota_seoul_pilot_members; reader public.iota_seoul_pilot_members; BEGIN
 SELECT p.* INTO STRICT writer FROM public.iota_seoul_pilot_members p JOIN public.iota_work_feed_members a ON a.email=lower(p.email) WHERE a.is_planning AND p.is_active AND p.auth_id IS NOT NULL LIMIT 1;
 SELECT p.* INTO STRICT reader FROM public.iota_seoul_pilot_members p WHERE p.is_active AND p.auth_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.iota_work_feed_members a WHERE a.email=lower(p.email)) LIMIT 1;
 PERFORM set_config('test.writer',jsonb_build_object('sub',writer.auth_id,'email',writer.email)::text,true);
 PERFORM set_config('test.reader',jsonb_build_object('sub',reader.auth_id,'email',reader.email)::text,true);
 PERFORM set_config('test.name',reader.staff_name,true);
 PERFORM set_config('test.group',public.iota_work_feed_org(reader),true);
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE feed text; audience jsonb; saved jsonb; expected boolean; BEGIN
 FOR feed IN SELECT unnest(ARRAY['committee','open']) LOOP
  PERFORM set_config('request.jwt.claims',current_setting('test.writer'),true);
  saved:=public.mutate_iota_work_feed(feed,'save','__visibility_parity_'||feed,jsonb_build_object('work_date','2026-11-10','summary','TEST_SECRET','raw_text','TEST_BODY'));
  IF feed='committee' AND NOT (saved#>'{metadata,permissions,individuals}') ?& ARRAY['이철승','강순용','권순일','양준모'] THEN RAISE EXCEPTION 'Committee defaults lost'; END IF;
  IF feed='open' AND saved#>'{metadata,permissions}' <> '{"groups":[],"individuals":[]}'::jsonb THEN RAISE EXCEPTION 'Open default not public'; END IF;
  FOR audience IN SELECT value FROM jsonb_array_elements(jsonb_build_array(
   '{"groups":[],"individuals":["권순일"]}'::jsonb,
   jsonb_build_object('groups','[]'::jsonb,'individuals',jsonb_build_array(current_setting('test.name'))),
   jsonb_build_object('groups',jsonb_build_array(current_setting('test.group')),'individuals','[]'::jsonb),
   '{"groups":[],"individuals":[]}'::jsonb
  )) LOOP
   PERFORM set_config('request.jwt.claims',current_setting('test.writer'),true);
   saved:=public.mutate_iota_work_feed(feed,'save','__visibility_parity_'||feed,jsonb_build_object('work_date','2026-11-10','summary','TEST_SECRET','raw_text','TEST_BODY','metadata',jsonb_build_object('permissions',audience)));
   IF saved#>'{metadata,permissions}' <> audience THEN RAISE EXCEPTION 'Audience not saved exactly'; END IF;
   expected:=audience<>'{"groups":[],"individuals":["권순일"]}'::jsonb;
   PERFORM set_config('request.jwt.claims',current_setting('test.reader'),true);
   IF public.can_read_iota_work_feed_post(feed,current_setting('test.writer')::jsonb->>'email',saved->'metadata') IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Read mismatch for % %',feed,audience; END IF;
   IF EXISTS(SELECT 1 FROM public.iota_work_feed_logs WHERE log_id='__visibility_parity_'||feed) IS DISTINCT FROM expected THEN RAISE EXCEPTION 'RLS mismatch'; END IF;
   IF feed='committee' THEN
    IF NOT EXISTS(SELECT 1 FROM public.list_iota_committee_feed() v WHERE v->>'log_id'='__visibility_parity_'||feed AND (v->>'can_read')::boolean=expected AND (CASE WHEN expected THEN v->>'summary'='TEST_SECRET' ELSE v->>'summary' IS NULL AND v->>'raw_text' IS NULL END)) THEN RAISE EXCEPTION 'List masking mismatch'; END IF;
   END IF;
  END LOOP;
 END LOOP;
END $$;
RESET ROLE;
DO $$ DECLARE feed text; audience jsonb; expected boolean; BEGIN
 FOR feed IN SELECT unnest(ARRAY['committee','open']) LOOP
  FOR audience IN SELECT value FROM jsonb_array_elements(jsonb_build_array('{"groups":[],"individuals":["권순일"]}'::jsonb,jsonb_build_object('groups','[]'::jsonb,'individuals',jsonb_build_array(current_setting('test.name'))),jsonb_build_object('groups',jsonb_build_array(current_setting('test.group')),'individuals','[]'::jsonb),'{"groups":[],"individuals":[]}'::jsonb)) LOOP
   expected:=audience<>'{"groups":[],"individuals":["권순일"]}'::jsonb;
   IF EXISTS(SELECT 1 FROM public.iota_feed_mention_recipients(feed,current_setting('test.writer')::jsonb->>'email',jsonb_build_object('permissions',audience),'@'||current_setting('test.name'),current_setting('test.writer')::jsonb->>'email') r WHERE r.user_id=(current_setting('test.reader')::jsonb->>'sub')::uuid) IS DISTINCT FROM expected THEN RAISE EXCEPTION 'Mention audience mismatch'; END IF;
  END LOOP;
 END LOOP;
END $$;
ROLLBACK;
SELECT 'PASS: different defaults; identical individual/group/public save, RLS, list masking and mention rules for committee and open; rolled back' AS result;
