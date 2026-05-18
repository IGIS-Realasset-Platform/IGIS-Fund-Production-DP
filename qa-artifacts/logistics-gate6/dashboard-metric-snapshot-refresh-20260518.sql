with base as (
  select
    date '2026-04-30' as basis_date,
    a.asset_id,
    a.asset_name,
    ls.tenant_id,
    coalesce(t.tenant_master_name, ls.tenant_id) as tenant_name,
    nullif(ls.leased_area_sqm, 0) * 0.3025 as leased_area_py,
    ls.current_monthly_cost_total,
    ls.e_noc
  from public.ll_lease_spaces ls
  join public.ll_assets a on a.asset_id = ls.asset_id
  left join public.ll_tenants t on t.tenant_id = ls.tenant_id
  where coalesce(ls.contract_status, 'current') <> 'deleted'
),
asset_metric_rows as (
  select
    'asset' as metric_scope,
    'average_e_noc' as metric_key,
    asset_id,
    asset_name,
    null::text as tenant_id,
    null::text as tenant_name,
    basis_date,
    case
      when sum(leased_area_py) filter (where coalesce(e_noc, current_monthly_cost_total / nullif(leased_area_py, 0)) is not null and leased_area_py > 0) > 0
        then sum(coalesce(e_noc, current_monthly_cost_total / nullif(leased_area_py, 0)) * leased_area_py)
          filter (where coalesce(e_noc, current_monthly_cost_total / nullif(leased_area_py, 0)) is not null and leased_area_py > 0)
          / sum(leased_area_py) filter (where coalesce(e_noc, current_monthly_cost_total / nullif(leased_area_py, 0)) is not null and leased_area_py > 0)
      else null
    end as numeric_value,
    null::text as text_value,
    'KRW/py/month' as unit,
    'public.ll_lease_spaces' as source_table,
    count(*)::int as source_row_count,
    jsonb_build_object(
      'formula', 'weighted_average(coalesce(e_noc, current_monthly_cost_total / leased_area_py), leased_area_sqm * 0.3025)',
      'basis', '2026-04 current lease spaces'
    ) as source_payload
  from base
  group by basis_date, asset_id, asset_name
  union all
  select
    'asset',
    'monthly_combined_total',
    asset_id,
    asset_name,
    null::text,
    null::text,
    basis_date,
    sum(current_monthly_cost_total),
    null::text,
    'KRW/month',
    'public.ll_lease_spaces',
    count(*)::int,
    jsonb_build_object('formula', 'sum(current_monthly_cost_total)')
  from base
  group by basis_date, asset_id, asset_name
  union all
  select
    'asset',
    'leased_area_py',
    asset_id,
    asset_name,
    null::text,
    null::text,
    basis_date,
    sum(leased_area_py),
    null::text,
    'py',
    'public.ll_lease_spaces',
    count(*)::int,
    jsonb_build_object('formula', 'sum(leased_area_sqm) * 0.3025')
  from base
  group by basis_date, asset_id, asset_name
),
tenant_rank as (
  select
    basis_date,
    asset_id,
    asset_name,
    tenant_id,
    tenant_name,
    sum(leased_area_py) as leased_area_py,
    count(*)::int as source_row_count,
    row_number() over (partition by asset_id order by sum(leased_area_py) desc nulls last, tenant_name) as rn
  from base
  group by basis_date, asset_id, asset_name, tenant_id, tenant_name
),
all_metric_rows as (
  select * from asset_metric_rows
  union all
  select
    'asset',
    'top_tenant_by_leased_area',
    asset_id,
    asset_name,
    tenant_id,
    tenant_name,
    basis_date,
    leased_area_py,
    tenant_name,
    'py',
    'public.ll_lease_spaces',
    source_row_count,
    jsonb_build_object('formula', 'rank tenants by sum(leased_area_sqm * 0.3025)', 'rank', 1)
  from tenant_rank
  where rn = 1
)
insert into public.ll_dashboard_metric_snapshots (
  snapshot_key,
  metric_scope,
  metric_key,
  asset_id,
  asset_name,
  tenant_id,
  tenant_name,
  basis_date,
  numeric_value,
  text_value,
  unit,
  source_table,
  source_row_count,
  source_payload,
  computed_at,
  updated_at
)
select
  lower(regexp_replace(metric_scope || ':' || metric_key || ':' || coalesce(asset_id, '-') || ':' || coalesce(tenant_id, '-') || ':' || basis_date::text, '\s+', '', 'g')),
  metric_scope,
  metric_key,
  asset_id,
  asset_name,
  tenant_id,
  tenant_name,
  basis_date,
  numeric_value,
  text_value,
  unit,
  source_table,
  source_row_count,
  source_payload,
  now(),
  now()
from all_metric_rows
where numeric_value is not null or text_value is not null
on conflict (snapshot_key) do update set
  numeric_value = excluded.numeric_value,
  text_value = excluded.text_value,
  unit = excluded.unit,
  source_table = excluded.source_table,
  source_row_count = excluded.source_row_count,
  source_payload = excluded.source_payload,
  computed_at = excluded.computed_at,
  updated_at = excluded.updated_at;
