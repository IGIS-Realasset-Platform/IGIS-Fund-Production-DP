-- Readback for 260520_물류센터 펀드 정보.xlsx fund backfill.
select 'll_source_cells_260520' as check_name, count(*)::text as actual, '1435' as expected
from public.ll_source_cells
where source_name = '260520_물류센터 펀드 정보.xlsx'
union all
select 'll_source_field_registry_260520', count(*)::text, '34'
from public.ll_source_field_registry
where source_name = '260520_물류센터 펀드 정보.xlsx'
union all
select 'll_funds_260520', count(*)::text, '15'
from public.ll_funds
where source_name = '260520_물류센터 펀드 정보.xlsx'
union all
select 'll_fund_asset_links_260520', count(*)::text, '17'
from public.ll_fund_asset_links
where source_name = '260520_물류센터 펀드 정보.xlsx'
union all
select 'll_fund_beneficiary_tranches_260520', count(*)::text, '52'
from public.ll_fund_beneficiary_tranches
where source_name = '260520_물류센터 펀드 정보.xlsx' and is_active = true
union all
select 'll_fund_loan_tranches_260520', count(*)::text, '51'
from public.ll_fund_loan_tranches
where source_name = '260520_물류센터 펀드 정보.xlsx' and is_active = true;

select fund_id, fund_code, fund_name, short_name, initial_setup_date, maturity_date
from public.ll_funds
where source_name = '260520_물류센터 펀드 정보.xlsx'
order by fund_code nulls last, fund_name;

select l.asset_name, l.fund_id, f.fund_name
from public.ll_fund_asset_links l
join public.ll_funds f on f.fund_id = l.fund_id
where l.source_name = '260520_물류센터 펀드 정보.xlsx'
order by l.asset_name;

select fund_id, count(*) as beneficiary_rows, sum(committed_amount_krw) as beneficiary_amount_krw
from public.ll_fund_beneficiary_tranches
where source_name = '260520_물류센터 펀드 정보.xlsx' and is_active = true
group by fund_id
order by fund_id;

select fund_id, loan_type, count(*) as loan_rows, sum(committed_amount_krw) as loan_amount_krw
from public.ll_fund_loan_tranches
where source_name = '260520_물류센터 펀드 정보.xlsx' and is_active = true
group by fund_id, loan_type
order by fund_id, loan_type;
