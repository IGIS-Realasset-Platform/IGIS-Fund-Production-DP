-- Gate 6 fund schema additive preview.
-- Purpose: support 260520_물류센터 펀드 정보.xlsx without dropping or renaming existing objects.
-- Do not apply without live baseline/readback approval.

begin;

alter table public.ll_fund_loan_tranches
  add column if not exists loan_type text,
  add column if not exists interest_type text,
  add column if not exists base_rate text,
  add column if not exists spread_rate text,
  add column if not exists loan_rate text,
  add column if not exists fee_rate text,
  add column if not exists all_in_rate text;

create index if not exists ll_fund_loan_tranches_loan_type_idx
  on public.ll_fund_loan_tranches(fund_id, loan_type)
  where is_active = true;

insert into public.ll_source_field_registry (
  source_field_id,
  source_type,
  source_name,
  sheet_name,
  column_number,
  column_letter,
  header_row_number,
  field_label,
  target_bucket,
  target_table,
  target_field,
  edit_policy,
  is_user_editable,
  is_formula_or_check,
  notes
)
values
  ('xlsx:fund_info:b', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 2, 'B', 3, '자산코드', 'fund', 'public.ll_fund_asset_links', 'asset_code', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:c', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 3, 'C', 3, '자산명', 'fund', 'public.ll_fund_asset_links', 'asset_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:d', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 4, 'D', 3, '펀드코드', 'fund', 'public.ll_funds', 'fund_code', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:e', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 5, 'E', 3, '펀드명', 'fund', 'public.ll_funds', 'fund_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:f', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 6, 'F', 3, '약칭', 'fund', 'public.ll_funds', 'short_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:g', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 7, 'G', 3, '법적형태', 'fund', 'public.ll_funds', 'legal_form', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:h', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 8, 'H', 3, '투자섹터', 'fund', 'public.ll_funds', 'investment_sector', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:i', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 9, 'I', 3, '펀드유형', 'fund', 'public.ll_funds', 'fund_type', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:j', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 10, 'J', 3, '투자전략', 'fund', 'public.ll_funds', 'investment_strategy', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:k', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 11, 'K', 3, '최초설정일', 'fund', 'public.ll_funds', 'initial_setup_date', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_info:l', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '펀드 정보', 12, 'L', 3, '만기일', 'fund', 'public.ll_funds', 'maturity_date', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_beneficiary:b', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '수익자 정보', 2, 'B', 3, '자산코드', 'fund_evidence', 'public.ll_fund_asset_links', 'asset_code', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_beneficiary:c', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '수익자 정보', 3, 'C', 3, '자산명', 'fund_evidence', 'public.ll_fund_asset_links', 'asset_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_beneficiary:d', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '수익자 정보', 4, 'D', 3, '펀드코드', 'fund_evidence', 'public.ll_funds', 'fund_code', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_beneficiary:e', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '수익자 정보', 5, 'E', 3, '펀드명', 'fund_evidence', 'public.ll_funds', 'fund_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_beneficiary:f', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '수익자 정보', 6, 'F', 3, 'Tranche', 'fund', 'public.ll_fund_beneficiary_tranches', 'tranche', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_beneficiary:g', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '수익자 정보', 7, 'G', 3, '수익자', 'fund', 'public.ll_fund_beneficiary_tranches', 'beneficiary_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_beneficiary:h', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '수익자 정보', 8, 'H', 3, '투입금액(원)', 'fund', 'public.ll_fund_beneficiary_tranches', 'committed_amount_krw', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:b', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 2, 'B', 3, '자산코드', 'fund_evidence', 'public.ll_fund_asset_links', 'asset_code', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:c', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 3, 'C', 3, '자산명', 'fund_evidence', 'public.ll_fund_asset_links', 'asset_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:d', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 4, 'D', 3, '펀드코드', 'fund_evidence', 'public.ll_funds', 'fund_code', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:e', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 5, 'E', 3, '펀드명', 'fund_evidence', 'public.ll_funds', 'fund_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:f', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 6, 'F', 3, '대출유형', 'fund', 'public.ll_fund_loan_tranches', 'loan_type', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:g', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 7, 'G', 3, 'Tranche', 'fund', 'public.ll_fund_loan_tranches', 'tranche', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:h', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 8, 'H', 3, '대주', 'fund', 'public.ll_fund_loan_tranches', 'lender_name', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:i', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 9, 'I', 3, '인출금액(원)', 'fund', 'public.ll_fund_loan_tranches', 'committed_amount_krw', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:j', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 10, 'J', 3, '인출시점', 'fund', 'public.ll_fund_loan_tranches', 'drawdown_date', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:k', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 11, 'K', 3, '만기시점', 'fund', 'public.ll_fund_loan_tranches', 'maturity_date', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:l', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 12, 'L', 3, '이자유형', 'fund', 'public.ll_fund_loan_tranches', 'interest_type', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:m', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 13, 'M', 3, '기준금리(%)', 'fund', 'public.ll_fund_loan_tranches', 'base_rate', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:n', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 14, 'N', 3, '가산금리(%)', 'fund', 'public.ll_fund_loan_tranches', 'spread_rate', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:o', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 15, 'O', 3, '대출금리(%)', 'fund', 'public.ll_fund_loan_tranches', 'loan_rate', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:p', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 16, 'P', 3, '수수료율(%)', 'fund', 'public.ll_fund_loan_tranches', 'fee_rate', 'data_quality_request', true, false, 'Fund workbook field registry preview'),
  ('xlsx:fund_loan:q', 'xlsx', '260520_물류센터 펀드 정보.xlsx', '대주 정보', 17, 'Q', 3, 'All-In(%)', 'fund', 'public.ll_fund_loan_tranches', 'all_in_rate', 'data_quality_request', true, false, 'Fund workbook field registry preview')
on conflict (source_field_id) do update set
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  sheet_name = excluded.sheet_name,
  column_number = excluded.column_number,
  column_letter = excluded.column_letter,
  header_row_number = excluded.header_row_number,
  field_label = excluded.field_label,
  target_bucket = excluded.target_bucket,
  target_table = excluded.target_table,
  target_field = excluded.target_field,
  edit_policy = excluded.edit_policy,
  is_user_editable = excluded.is_user_editable,
  is_formula_or_check = excluded.is_formula_or_check,
  notes = excluded.notes,
  updated_at = now();

-- Backfill of actual row data from 260520 workbook is intentionally not included here.
-- It must be generated from a preserved source-cell import run and read back before applying.

rollback;
