-- Preview / rollback notes for Gate 6 schema cleanup phase 2.
-- Target: public.ll_payload_snapshots
-- Reason: legacy Apps Script/static payload archive; no current runtime reference in Edge, frontend, or QA scripts.
-- Expected rows before cleanup: 107
-- Backup table: public.ll_migration_row_backups

-- Pre-check:
select count(*) as payload_snapshot_count
from public.ll_payload_snapshots;

select count(*) as local_usage_count
from (
  select 'runtime usage removed; see rg excluding qa-artifacts and migrations' as evidence
) x;

-- Apply:
-- \i supabase/migrations/20260521143000_gate6_schema_cleanup_phase2_payload_snapshots.sql

-- Readback after apply:
select to_regclass('public.ll_payload_snapshots') as payload_snapshots_table;

select count(*) as backup_row_count
from public.ll_migration_row_backups
where migration_id = '20260521143000_gate6_schema_cleanup_phase2_payload_snapshots'
  and table_name = 'public.ll_payload_snapshots';

-- Rollback, if needed:
/*
begin;

create table if not exists public.ll_payload_snapshots (
  snapshot_key text primary key,
  page text not null,
  entity_id text not null,
  payload jsonb not null,
  user_safe boolean not null default true,
  generated_at timestamptz,
  schema_version text,
  source text not null,
  source_system text not null default 'gate6_restore',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ll_payload_snapshots enable row level security;

insert into public.ll_payload_snapshots (
  snapshot_key,
  page,
  entity_id,
  payload,
  user_safe,
  generated_at,
  schema_version,
  source,
  source_system,
  created_at,
  updated_at
)
select
  before_payload ->> 'snapshot_key',
  before_payload ->> 'page',
  before_payload ->> 'entity_id',
  before_payload -> 'payload',
  coalesce((before_payload ->> 'user_safe')::boolean, true),
  nullif(before_payload ->> 'generated_at', '')::timestamptz,
  before_payload ->> 'schema_version',
  before_payload ->> 'source',
  coalesce(before_payload ->> 'source_system', 'gate6_restore'),
  coalesce(nullif(before_payload ->> 'created_at', '')::timestamptz, now()),
  coalesce(nullif(before_payload ->> 'updated_at', '')::timestamptz, now())
from public.ll_migration_row_backups
where migration_id = '20260521143000_gate6_schema_cleanup_phase2_payload_snapshots'
  and table_name = 'public.ll_payload_snapshots'
on conflict (snapshot_key) do update
set page = excluded.page,
    entity_id = excluded.entity_id,
    payload = excluded.payload,
    user_safe = excluded.user_safe,
    generated_at = excluded.generated_at,
    schema_version = excluded.schema_version,
    source = excluded.source,
    source_system = excluded.source_system,
    updated_at = now();

commit;
*/
