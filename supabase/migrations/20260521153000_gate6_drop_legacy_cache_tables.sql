-- Gate 6 schema cleanup phase 3b.
-- Drop legacy cache/metric tables after Edge Function has switched to ll_cache_entries.

begin;

do $$
declare
  metric_count integer := 0;
  external_count integer := 0;
  unified_metric_count integer := 0;
  unified_external_count integer := 0;
begin
  if to_regclass('public.ll_dashboard_metric_snapshots') is not null then
    select count(*) into metric_count from public.ll_dashboard_metric_snapshots;
  end if;

  if to_regclass('public.ll_external_api_cache') is not null then
    select count(*) into external_count from public.ll_external_api_cache;
  end if;

  select count(*) into unified_metric_count
  from public.ll_cache_entries
  where cache_type = 'dashboard_metric';

  select count(*) into unified_external_count
  from public.ll_cache_entries
  where cache_type = 'external_api';

  if metric_count > 0 and unified_metric_count < metric_count then
    raise exception 'Metric cache backfill incomplete: legacy %, unified %', metric_count, unified_metric_count;
  end if;

  if external_count > 0 and unified_external_count < external_count then
    raise exception 'External cache backfill incomplete: legacy %, unified %', external_count, unified_external_count;
  end if;

  if to_regclass('public.ll_dashboard_metric_snapshots') is not null then
    insert into public.ll_migration_row_backups (migration_id, table_name, row_key, before_payload)
    select
      '20260521153000_gate6_drop_legacy_cache_tables',
      'public.ll_dashboard_metric_snapshots',
      snapshot_key,
      to_jsonb(s)
    from public.ll_dashboard_metric_snapshots s
    on conflict (migration_id, table_name, row_key) do nothing;

    drop table public.ll_dashboard_metric_snapshots;
  end if;

  if to_regclass('public.ll_external_api_cache') is not null then
    insert into public.ll_migration_row_backups (migration_id, table_name, row_key, before_payload)
    select
      '20260521153000_gate6_drop_legacy_cache_tables',
      'public.ll_external_api_cache',
      provider || ':' || cache_key,
      to_jsonb(c)
    from public.ll_external_api_cache c
    on conflict (migration_id, table_name, row_key) do nothing;

    drop table public.ll_external_api_cache;
  end if;
end $$;

update public.ll_schema_metadata
set is_active = false,
    updated_at = now()
where table_schema = 'public'
  and table_name in ('ll_dashboard_metric_snapshots', 'll_external_api_cache');

commit;
