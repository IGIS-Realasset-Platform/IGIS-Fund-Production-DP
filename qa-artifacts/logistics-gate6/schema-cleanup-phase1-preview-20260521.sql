-- Gate 6 schema cleanup phase 1 preview
-- Scope: remove only row-zero / retired tables after code references are closed.
-- Apply order:
--   1. Deploy ll-dashboard-api with legacy worklogs/* returning 410.
--   2. Run readback guards below.
--   3. Apply guarded DROP.

-- Readback guard
select 'll_worklogs' as table_name, count(*) as row_count from public.ll_worklogs
union all
select 'll_dashboard_read_snapshots' as table_name, count(*) as row_count from public.ll_dashboard_read_snapshots;

-- Apply SQL
do $$
declare
  worklog_count bigint;
  read_snapshot_count bigint;
begin
  select count(*) into worklog_count from public.ll_worklogs;
  if worklog_count <> 0 then
    raise exception 'll_worklogs is not empty: % rows', worklog_count;
  end if;

  select count(*) into read_snapshot_count from public.ll_dashboard_read_snapshots;
  if read_snapshot_count <> 0 then
    raise exception 'll_dashboard_read_snapshots is not empty: % rows', read_snapshot_count;
  end if;
end $$;

drop table if exists public.ll_worklogs;
drop table if exists public.ll_dashboard_read_snapshots;

-- Post-apply readback
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('ll_worklogs', 'll_dashboard_read_snapshots')
order by table_name;

-- Rollback SQL, only if a backward compatibility emergency requires the table names again.
-- This restores empty shell tables only. Data rollback is not needed because phase 1 guards require zero rows.
/*
create table if not exists public.ll_worklogs (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'personal',
  title text,
  body text,
  related_asset_id text,
  related_tenant_id text,
  priority text,
  status text not null default 'new',
  created_by uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ll_dashboard_read_snapshots (
  id uuid primary key default gen_random_uuid(),
  read_action text not null,
  basis_date date,
  user_id uuid,
  scope_hash text,
  payload_hash text,
  payload jsonb not null default '{}'::jsonb,
  source_tables jsonb not null default '[]'::jsonb,
  warning_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

alter table public.ll_worklogs enable row level security;
alter table public.ll_dashboard_read_snapshots enable row level security;
*/
