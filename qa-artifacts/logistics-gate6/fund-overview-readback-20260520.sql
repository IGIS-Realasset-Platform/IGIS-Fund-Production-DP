-- Gate 6 fund overview readback.
-- Purpose: verify additive fund migration without mutating existing data.

select 'll_source_cells' as table_name, count(*)::bigint as row_count from public.ll_source_cells
union all select 'll_assets', count(*) from public.ll_assets
union all select 'll_tenants', count(*) from public.ll_tenants
union all select 'll_leases', count(*) from public.ll_leases
union all select 'll_lease_spaces', count(*) from public.ll_lease_spaces
union all select 'll_rent_history', count(*) from public.ll_rent_history
union all select 'll_weekly_assets', count(*) from public.ll_weekly_assets
union all select 'll_funds', count(*) from public.ll_funds
union all select 'll_fund_asset_links', count(*) from public.ll_fund_asset_links
union all select 'll_fund_beneficiary_tranches', count(*) from public.ll_fund_beneficiary_tranches
union all select 'll_fund_loan_tranches', count(*) from public.ll_fund_loan_tranches
order by table_name;

select
  f.fund_code,
  f.fund_name,
  count(l.asset_id)::int as linked_assets,
  string_agg(l.asset_name, ', ' order by l.asset_name) as assets
from public.ll_funds f
left join public.ll_fund_asset_links l on l.fund_id = f.fund_id
group by f.fund_code, f.fund_name
order by linked_assets desc, f.fund_code;

select
  l.asset_id,
  l.asset_code,
  l.asset_name,
  f.fund_code,
  f.fund_name,
  l.source_sheet_name,
  l.source_row_number
from public.ll_fund_asset_links l
join public.ll_funds f on f.fund_id = l.fund_id
order by l.asset_name;
