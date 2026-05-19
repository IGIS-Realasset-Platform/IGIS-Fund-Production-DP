select
  'll_assets' as source_table,
  asset_id,
  asset_name,
  monthly_cost_total,
  monthly_rent_total,
  monthly_mf_total,
  average_e_noc,
  updated_at
from public.ll_assets
where asset_id = 'asset_a112127001'
   or asset_name ilike '%아레나스양지%'
union all
select
  'll_lease_spaces_sum' as source_table,
  asset_id,
  null as asset_name,
  sum(coalesce(monthly_cost_total, monthly_rent_total, 0) + case when monthly_cost_total is null then coalesce(monthly_mf_total, 0) else 0 end) as monthly_cost_total,
  sum(monthly_rent_total) as monthly_rent_total,
  sum(monthly_mf_total) as monthly_mf_total,
  null as average_e_noc,
  max(updated_at) as updated_at
from public.ll_lease_spaces
where asset_id = 'asset_a112127001'
group by asset_id;

select
  rent.asset_id,
  count(*) as rent_history_rows,
  count(*) filter (where rent.monthly_rent_total is not null or rent.monthly_mf_total is not null or rent.monthly_cost_total is not null) as rows_with_amount,
  sum(coalesce(rent.monthly_cost_total, coalesce(rent.monthly_rent_total, 0) + coalesce(rent.monthly_mf_total, 0))) as monthly_cost_sum_naive,
  max(rent.source_row_id) as max_source_row_id
from public.ll_rent_history rent
where rent.asset_id = 'asset_a112127001'
group by rent.asset_id;
