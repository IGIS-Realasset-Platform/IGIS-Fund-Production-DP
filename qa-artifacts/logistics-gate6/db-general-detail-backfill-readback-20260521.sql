-- Gate 6 DB_일반 detail backfill readback.

select 'll_lease_space_area_breakdowns' as table_name, count(*)::bigint as row_count
from public.ll_lease_space_area_breakdowns
union all
select 'll_lease_space_specs', count(*)::bigint
from public.ll_lease_space_specs
union all
select 'll_lease_special_terms', count(*)::bigint
from public.ll_lease_special_terms
union all
select 'll_source_review_logs', count(*)::bigint
from public.ll_source_review_logs
order by table_name;

select
  basis,
  area_type,
  count(*)::bigint as rows,
  count(*) filter (where source_cell_id is not null)::bigint as rows_with_source_cell,
  count(*) filter (where area_sqm is not null)::bigint as rows_with_area_sqm
from public.ll_lease_space_area_breakdowns
group by basis, area_type
order by basis, area_type;

select
  basis,
  spec_key,
  count(*)::bigint as rows,
  count(*) filter (where source_cell_id is not null)::bigint as rows_with_source_cell,
  count(*) filter (where spec_value is not null)::bigint as rows_with_value
from public.ll_lease_space_specs
group by basis, spec_key
order by basis, spec_key;

select
  basis,
  term_key,
  count(*)::bigint as rows,
  count(*) filter (where source_cell_id is not null)::bigint as rows_with_source_cell,
  count(*) filter (where term_value is not null)::bigint as rows_with_value
from public.ll_lease_special_terms
group by basis, term_key
order by basis, term_key;

select
  count(*) filter (where source_payload is not null)::bigint as logs_with_payload,
  count(*) filter (where source_row_id is not null)::bigint as logs_with_source_row,
  min(row_number) as min_row_number,
  max(row_number) as max_row_number
from public.ll_source_review_logs;
