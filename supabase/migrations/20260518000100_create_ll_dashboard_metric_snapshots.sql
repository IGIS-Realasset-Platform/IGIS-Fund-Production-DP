-- Store precomputed logistics dashboard metrics used by UI, chatbot, and QA.
-- Mutation scope: public.ll_* only.

create table if not exists public.ll_dashboard_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_key text not null unique,
  metric_scope text not null check (metric_scope in ('portfolio', 'asset', 'tenant', 'asset_tenant')),
  metric_key text not null,
  asset_id text,
  asset_name text,
  tenant_id text,
  tenant_name text,
  basis_date date not null,
  numeric_value numeric,
  text_value text,
  unit text not null,
  source_table text not null check (source_table like 'public.ll_%'),
  source_row_count integer not null default 0,
  source_payload jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ll_dashboard_metric_snapshots enable row level security;

drop policy if exists "ll_dashboard_metric_snapshots_read_by_asset_permission" on public.ll_dashboard_metric_snapshots;
create policy "ll_dashboard_metric_snapshots_read_by_asset_permission"
on public.ll_dashboard_metric_snapshots
for select
to authenticated
using (
  exists (
    select 1
    from public.ll_user_permissions p
    where p.user_id = auth.uid()
      and (
        p.logistics_role in ('Manager', 'Admin', 'System Admin')
        or coalesce((p.other_asset_permissions ->> 'read')::boolean, false)
        or coalesce(ll_dashboard_metric_snapshots.asset_id, '') = any(p.managed_asset_codes)
        or coalesce(ll_dashboard_metric_snapshots.asset_name, '') = any(p.managed_asset_codes)
      )
  )
);

create index if not exists idx_ll_dashboard_metric_snapshots_lookup
on public.ll_dashboard_metric_snapshots(metric_scope, metric_key, asset_id, tenant_id, basis_date);

create index if not exists idx_ll_dashboard_metric_snapshots_asset_name
on public.ll_dashboard_metric_snapshots(asset_name);

-- Browser clients receive no INSERT/UPDATE/DELETE policies.
-- Writes are performed by ll-dashboard-api with service role after server-side permission checks.
