with row_counts as (
  select 'll_source_cells' as table_name, count(*)::bigint as rows from public.ll_source_cells
  union all select 'll_sheet_rows', count(*)::bigint from public.ll_sheet_rows
  union all select 'll_assets', count(*)::bigint from public.ll_assets
  union all select 'll_tenants', count(*)::bigint from public.ll_tenants
  union all select 'll_leases', count(*)::bigint from public.ll_leases
  union all select 'll_lease_spaces', count(*)::bigint from public.ll_lease_spaces
  union all select 'll_rent_history', count(*)::bigint from public.ll_rent_history
  union all select 'll_asset_managers', count(*)::bigint from public.ll_asset_managers
  union all select 'll_payload_snapshots', count(*)::bigint from public.ll_payload_snapshots
  union all select 'll_dashboard_metric_snapshots', count(*)::bigint from public.ll_dashboard_metric_snapshots
),
source_cell_coverage as (
  select
    source_type,
    source_name,
    sheet_name,
    count(*)::bigint as cells,
    count(*) filter (where coalesce(raw_value_text, display_value_text, formula_text, '') <> '')::bigint as non_empty_cells,
    count(*) filter (where coalesce(formula_text, '') <> '')::bigint as formula_cells,
    min(row_number) as min_row,
    max(row_number) as max_row,
    min(column_number) as min_col,
    max(column_number) as max_col
  from public.ll_source_cells
  where source_name like '%260414%'
  group by source_type, source_name, sheet_name
),
sheet_row_coverage as (
  select
    source_type,
    source_name,
    sheet_name,
    count(*)::bigint as rows
  from public.ll_sheet_rows
  group by source_type, source_name, sheet_name
),
rent_history_summary as (
  select
    count(*)::bigint as rent_history_rows,
    count(*) filter (where source_sheet_row_id is not null)::bigint as rows_with_source_sheet_row_id,
    count(*) filter (where source_contract_lease_space_id is not null)::bigint as rows_with_contract_space_link,
    count(*) filter (where monthly_rent_total is null)::bigint as monthly_rent_nulls,
    count(*) filter (where monthly_mf_total is null)::bigint as monthly_mf_nulls
  from public.ll_rent_history
)
select
  jsonb_build_object(
    'row_counts', (select jsonb_agg(to_jsonb(row_counts) order by table_name) from row_counts),
    'source_cell_coverage', (select jsonb_agg(to_jsonb(source_cell_coverage) order by sheet_name) from source_cell_coverage),
    'sheet_row_coverage', (select jsonb_agg(to_jsonb(sheet_row_coverage) order by source_type, sheet_name) from sheet_row_coverage),
    'rent_history_summary', (select to_jsonb(rent_history_summary) from rent_history_summary)
  ) as readback;
