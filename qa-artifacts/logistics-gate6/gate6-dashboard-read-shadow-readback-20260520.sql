-- Gate 6 dashboard read shadow readback.
-- Expected unchanged baseline:
-- ll_source_cells=13752, ll_assets=17, ll_tenants=36, ll_leases=45,
-- ll_lease_spaces=80, ll_rent_history=163, ll_weekly_assets=20.

select 'll_source_cells' as table_name, count(*)::bigint as row_count from public.ll_source_cells
union all select 'll_assets', count(*)::bigint from public.ll_assets
union all select 'll_tenants', count(*)::bigint from public.ll_tenants
union all select 'll_leases', count(*)::bigint from public.ll_leases
union all select 'll_lease_spaces', count(*)::bigint from public.ll_lease_spaces
union all select 'll_rent_history', count(*)::bigint from public.ll_rent_history
union all select 'll_weekly_assets', count(*)::bigint from public.ll_weekly_assets
order by table_name;

select
  sheet_name,
  count(*)::bigint as registered_fields
from public.ll_source_field_registry
where source_type = 'xlsx'
  and source_name = '★ 260414_물류센터 임대차계약 DB_취합본.xlsx'
  and sheet_name in ('DB_일반', 'DB_히스토리 누적')
group by sheet_name
order by sheet_name;

select
  'll_lease_space_area_breakdowns' as table_name,
  count(*)::bigint as row_count
from public.ll_lease_space_area_breakdowns
union all select 'll_lease_space_specs', count(*)::bigint from public.ll_lease_space_specs
union all select 'll_lease_special_terms', count(*)::bigint from public.ll_lease_special_terms
union all select 'll_source_review_logs', count(*)::bigint from public.ll_source_review_logs
union all select 'll_dashboard_read_snapshots', count(*)::bigint from public.ll_dashboard_read_snapshots
order by table_name;

select
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'll_source_cells'
  and column_name in ('effective_type', 'is_formula', 'is_error', 'source_run_id', 'sheet_hash', 'workbook_hash')
order by column_name;
