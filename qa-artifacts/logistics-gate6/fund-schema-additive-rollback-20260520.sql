-- Gate 6 fund schema additive rollback preview.
-- This rollback is guarded. It must not remove real user-entered lender values.
-- Do not run unless the corresponding additive preview was applied and readback failed.

begin;

delete from public.ll_source_field_registry
where source_name = '260520_물류센터 펀드 정보.xlsx'
  and source_field_id like 'xlsx:fund_%';

do $$
declare
  populated_rows integer;
begin
  select count(*)
  into populated_rows
  from public.ll_fund_loan_tranches
  where coalesce(
    nullif(loan_type, ''),
    nullif(interest_type, ''),
    nullif(base_rate, ''),
    nullif(spread_rate, ''),
    nullif(loan_rate, ''),
    nullif(fee_rate, ''),
    nullif(all_in_rate, '')
  ) is not null;

  if populated_rows > 0 then
    raise exception 'Rollback stopped: % ll_fund_loan_tranches rows already contain additive Excel lender fields.', populated_rows;
  end if;
end $$;

drop index if exists public.ll_fund_loan_tranches_loan_type_idx;

alter table public.ll_fund_loan_tranches
  drop column if exists loan_type,
  drop column if exists interest_type,
  drop column if exists base_rate,
  drop column if exists spread_rate,
  drop column if exists loan_rate,
  drop column if exists fee_rate,
  drop column if exists all_in_rate;

rollback;
