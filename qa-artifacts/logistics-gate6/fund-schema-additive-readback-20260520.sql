-- Gate 6 fund schema additive readback.
-- Expected after applying the additive preview:
--   source field registry rows for 260520 workbook = 34
--   sheet split = 펀드 정보 11, 수익자 정보 7, 대주 정보 16
--   existing fund/asset link counts must not decrease.

select
  'll_source_field_registry:260520 fund workbook' as check_name,
  count(*) as actual_count,
  34 as expected_count
from public.ll_source_field_registry
where source_name = '260520_물류센터 펀드 정보.xlsx'
  and source_field_id like 'xlsx:fund_%';

select
  sheet_name,
  count(*) as actual_field_count,
  case
    when sheet_name = '펀드 정보' then 11
    when sheet_name = '수익자 정보' then 7
    when sheet_name = '대주 정보' then 16
    else null
  end as expected_field_count
from public.ll_source_field_registry
where source_name = '260520_물류센터 펀드 정보.xlsx'
  and source_field_id like 'xlsx:fund_%'
group by sheet_name
order by sheet_name;

select
  'll_fund_loan_tranches additive columns populated rows' as check_name,
  count(*) filter (where nullif(loan_type, '') is not null) as loan_type_rows,
  count(*) filter (where nullif(interest_type, '') is not null) as interest_type_rows,
  count(*) filter (where nullif(base_rate, '') is not null) as base_rate_rows,
  count(*) filter (where nullif(spread_rate, '') is not null) as spread_rate_rows,
  count(*) filter (where nullif(loan_rate, '') is not null) as loan_rate_rows,
  count(*) filter (where nullif(fee_rate, '') is not null) as fee_rate_rows,
  count(*) filter (where nullif(all_in_rate, '') is not null) as all_in_rate_rows
from public.ll_fund_loan_tranches
where is_active = true;

select 'll_funds' as table_name, count(*) as row_count from public.ll_funds
union all
select 'll_fund_asset_links' as table_name, count(*) as row_count from public.ll_fund_asset_links
union all
select 'll_fund_beneficiary_tranches_active' as table_name, count(*) as row_count from public.ll_fund_beneficiary_tranches where is_active = true
union all
select 'll_fund_loan_tranches_active' as table_name, count(*) as row_count from public.ll_fund_loan_tranches where is_active = true
order by table_name;

select
  a.asset_name,
  l.fund_id,
  f.fund_name,
  l.link_type,
  l.is_active
from public.ll_fund_asset_links l
join public.ll_assets a on a.asset_id = l.asset_id
left join public.ll_funds f on f.fund_id = l.fund_id
where l.is_active = true
order by a.asset_name;
