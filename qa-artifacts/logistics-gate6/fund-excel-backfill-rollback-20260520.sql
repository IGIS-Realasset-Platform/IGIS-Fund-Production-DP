-- Guarded rollback for 260520_물류센터 펀드 정보.xlsx fund backfill.
-- This removes rows sourced from 260520_물류센터 펀드 정보.xlsx, then restores rows captured in public.ll_migration_row_backups.
begin;

delete from public.ll_fund_loan_tranches
where source_name = '260520_물류센터 펀드 정보.xlsx';

delete from public.ll_fund_beneficiary_tranches
where source_name = '260520_물류센터 펀드 정보.xlsx';

delete from public.ll_fund_asset_links
where source_name = '260520_물류센터 펀드 정보.xlsx';

delete from public.ll_source_field_registry
where source_name = '260520_물류센터 펀드 정보.xlsx';

delete from public.ll_source_cells
where source_name = '260520_물류센터 펀드 정보.xlsx';

delete from public.ll_import_runs
where import_id = 'fund_excel_20260520'
  and source_name = '260520_물류센터 펀드 정보.xlsx';

insert into public.ll_funds (
  fund_id, fund_code, fund_name, short_name, legal_form, investment_sector, fund_type, investment_strategy,
  initial_setup_date, maturity_date, notes, source_type, source_name, source_sheet_name, source_row_number,
  source_cell_ids, source_payload, created_at, updated_at
)
select
  before_payload->>'fund_id',
  before_payload->>'fund_code',
  before_payload->>'fund_name',
  before_payload->>'short_name',
  before_payload->>'legal_form',
  before_payload->>'investment_sector',
  before_payload->>'fund_type',
  before_payload->>'investment_strategy',
  nullif(before_payload->>'initial_setup_date', '')::date,
  nullif(before_payload->>'maturity_date', '')::date,
  before_payload->>'notes',
  coalesce(before_payload->>'source_type', 'xlsx'),
  before_payload->>'source_name',
  before_payload->>'source_sheet_name',
  nullif(before_payload->>'source_row_number', '')::integer,
  coalesce(array(select jsonb_array_elements_text(before_payload->'source_cell_ids')), '{}'::text[]),
  coalesce(before_payload->'source_payload', '{}'::jsonb),
  coalesce(nullif(before_payload->>'created_at', '')::timestamptz, now()),
  coalesce(nullif(before_payload->>'updated_at', '')::timestamptz, now())
from public.ll_migration_row_backups
where migration_id = '20260520092911_logistics_fund_excel_backfill'
  and table_name = 'public.ll_funds'
on conflict (fund_id) do update set
  fund_code = excluded.fund_code,
  fund_name = excluded.fund_name,
  short_name = excluded.short_name,
  legal_form = excluded.legal_form,
  investment_sector = excluded.investment_sector,
  fund_type = excluded.fund_type,
  investment_strategy = excluded.investment_strategy,
  initial_setup_date = excluded.initial_setup_date,
  maturity_date = excluded.maturity_date,
  notes = excluded.notes,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_sheet_name = excluded.source_sheet_name,
  source_row_number = excluded.source_row_number,
  source_cell_ids = excluded.source_cell_ids,
  source_payload = excluded.source_payload,
  updated_at = excluded.updated_at;

insert into public.ll_fund_asset_links (
  id, fund_id, asset_id, asset_code, asset_name, link_type, source_type, source_name, source_sheet_name,
  source_row_number, source_cell_ids, source_payload, created_at, updated_at
)
select
  (before_payload->>'id')::uuid,
  before_payload->>'fund_id',
  before_payload->>'asset_id',
  before_payload->>'asset_code',
  before_payload->>'asset_name',
  coalesce(before_payload->>'link_type', 'primary'),
  coalesce(before_payload->>'source_type', 'xlsx'),
  before_payload->>'source_name',
  before_payload->>'source_sheet_name',
  nullif(before_payload->>'source_row_number', '')::integer,
  coalesce(array(select jsonb_array_elements_text(before_payload->'source_cell_ids')), '{}'::text[]),
  coalesce(before_payload->'source_payload', '{}'::jsonb),
  coalesce(nullif(before_payload->>'created_at', '')::timestamptz, now()),
  coalesce(nullif(before_payload->>'updated_at', '')::timestamptz, now())
from public.ll_migration_row_backups
where migration_id = '20260520092911_logistics_fund_excel_backfill'
  and table_name = 'public.ll_fund_asset_links'
on conflict (id) do update set
  fund_id = excluded.fund_id,
  asset_id = excluded.asset_id,
  asset_code = excluded.asset_code,
  asset_name = excluded.asset_name,
  link_type = excluded.link_type,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  source_sheet_name = excluded.source_sheet_name,
  source_row_number = excluded.source_row_number,
  source_cell_ids = excluded.source_cell_ids,
  source_payload = excluded.source_payload,
  updated_at = excluded.updated_at;

delete from public.ll_funds
where source_name = '260520_물류센터 펀드 정보.xlsx'
  and fund_id not in (
    select before_payload->>'fund_id'
    from public.ll_migration_row_backups
    where migration_id = '20260520092911_logistics_fund_excel_backfill'
      and table_name = 'public.ll_funds'
  )
  and not exists (
    select 1 from public.ll_fund_asset_links l where l.fund_id = public.ll_funds.fund_id
  );

insert into public.ll_api_audit_logs (action, status_code, requested_by, request_payload)
values (
  'rollback/fund-excel-backfill-20260520',
  200,
  null,
  jsonb_build_object('source_name', '260520_물류센터 펀드 정보.xlsx', 'mode', 'source-scoped-delete')
);

commit;
