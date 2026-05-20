-- Gate 6 DB_히스토리 누적 source registry correction.
-- The sheet header is row 10 (B:S); row 14 contains units/examples.
-- This migration is additive/upsert-only and does not delete existing registry rows.

insert into public.ll_source_field_registry (
  source_field_id,
  source_type,
  source_name,
  sheet_name,
  column_number,
  column_letter,
  header_row_number,
  field_label,
  unit_label,
  target_bucket,
  target_table,
  edit_policy,
  is_user_editable,
  is_formula_or_check,
  source_cell_id,
  notes
)
select
  'xlsx:db_history:' || lower(header_cell.column_letter) as source_field_id,
  header_cell.source_type,
  header_cell.source_name,
  header_cell.sheet_name,
  header_cell.column_number,
  header_cell.column_letter,
  header_cell.row_number as header_row_number,
  header_cell.display_value_text as field_label,
  nullif(unit_cell.display_value_text, '') as unit_label,
  case
    when header_cell.column_number between 2 and 8 then 'history_identity'
    when header_cell.column_number between 9 and 11 then 'history_space_attributes'
    when header_cell.column_number between 12 and 13 then 'history_area'
    when header_cell.column_number between 14 and 19 then 'time_series_rent_fee'
    else 'unknown'
  end as target_bucket,
  case
    when header_cell.column_number between 2 and 8 then 'public.ll_rent_history/public.ll_lease_spaces/public.ll_tenants'
    when header_cell.column_number between 9 and 13 then 'public.ll_lease_spaces/public.ll_rent_history'
    when header_cell.column_number between 14 and 19 then 'public.ll_rent_history'
    else null
  end as target_table,
  'data_quality_request' as edit_policy,
  true as is_user_editable,
  false as is_formula_or_check,
  header_cell.source_cell_id,
  'Corrected from DB_히스토리 누적 row 10 header and row 14 unit/source context for Gate 6 rent-history mapping'
from public.ll_source_cells header_cell
left join public.ll_source_cells unit_cell
  on unit_cell.source_type = header_cell.source_type
 and unit_cell.source_name = header_cell.source_name
 and unit_cell.sheet_name = header_cell.sheet_name
 and unit_cell.row_number = 14
 and unit_cell.column_number = header_cell.column_number
where header_cell.source_type = 'xlsx'
  and header_cell.source_name = '★ 260414_물류센터 임대차계약 DB_취합본.xlsx'
  and header_cell.sheet_name = 'DB_히스토리 누적'
  and header_cell.row_number = 10
  and header_cell.column_number between 2 and 19
  and nullif(header_cell.display_value_text, '') is not null
on conflict (source_field_id) do update set
  header_row_number = excluded.header_row_number,
  field_label = excluded.field_label,
  unit_label = excluded.unit_label,
  target_bucket = excluded.target_bucket,
  target_table = excluded.target_table,
  edit_policy = excluded.edit_policy,
  is_user_editable = excluded.is_user_editable,
  is_formula_or_check = excluded.is_formula_or_check,
  source_cell_id = excluded.source_cell_id,
  notes = excluded.notes,
  updated_at = now();
