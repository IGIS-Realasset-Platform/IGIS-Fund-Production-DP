-- Gate 6 schema cleanup phase 2.
-- Retire legacy payload snapshots after Supabase primary read path and browser-visible parity passed.
-- Safety: every row is copied to ll_migration_row_backups before the table is dropped.

begin;

do $$
declare
  payload_snapshot_count integer;
begin
  if to_regclass('public.ll_payload_snapshots') is null then
    raise notice 'public.ll_payload_snapshots already absent. Skipping phase 2 cleanup.';
    return;
  end if;

  select count(*) into payload_snapshot_count
  from public.ll_payload_snapshots;

  if payload_snapshot_count <> 107 then
    raise exception 'Unexpected ll_payload_snapshots row count: %, expected 107. Cleanup aborted.', payload_snapshot_count;
  end if;

  insert into public.ll_migration_row_backups (migration_id, table_name, row_key, before_payload)
  select
    '20260521143000_gate6_schema_cleanup_phase2_payload_snapshots',
    'public.ll_payload_snapshots',
    snapshot_key,
    to_jsonb(s)
  from public.ll_payload_snapshots s
  on conflict (migration_id, table_name, row_key) do nothing;

  drop table public.ll_payload_snapshots;
end $$;

commit;
