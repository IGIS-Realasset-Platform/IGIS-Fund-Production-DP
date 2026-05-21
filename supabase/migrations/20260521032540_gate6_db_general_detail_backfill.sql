-- Gate 6 DB_일반 detail backfill.
-- Additive-only data backfill for source-preserving detail tables.
-- Existing core rows are not deleted, renamed, or type-changed.

with registry as (
  select *
  from public.ll_source_field_registry
  where source_type = 'xlsx'
    and sheet_name in ('DB_일반', 'DB_?쇰컲')
),
db_general_cells as (
  select
    c.source_cell_id,
    c.source_type,
    c.source_name,
    c.sheet_name,
    c.row_number,
    c.column_number,
    c.column_letter,
    nullif(c.display_value_text, '') as display_value,
    nullif(c.raw_value_text, '') as raw_value,
    ('sheet_db_general:r' || lpad(greatest(c.row_number - 1, 0)::text, 6, '0')) as source_sheet_row_id
  from public.ll_source_cells c
  join registry r
    on r.source_type = c.source_type
   and r.source_name = c.source_name
   and r.sheet_name = c.sheet_name
   and r.column_number = c.column_number
  where c.row_number >= 12
),
numeric_cells as (
  select
    *,
    case
      when coalesce(raw_value, display_value, '') ~ '^\s*-?[\d,]+(\.\d+)?\s*$'
        then replace(coalesce(raw_value, display_value), ',', '')::numeric
      else null
    end as numeric_value
  from db_general_cells
)
insert into public.ll_lease_space_area_breakdowns (
  lease_space_id,
  lease_id,
  asset_id,
  tenant_id,
  area_type,
  area_label,
  area_sqm,
  basis,
  source_sheet_row_id,
  source_cell_id,
  source_payload,
  review_status,
  review_note
)
select
  ls.lease_space_id,
  ls.lease_id,
  ls.asset_id,
  ls.tenant_id,
  lower(regexp_replace(r.column_letter || '_' || coalesce(r.field_label, 'area'), '\s+', '_', 'g')) as area_type,
  r.field_label as area_label,
  nc.numeric_value as area_sqm,
  'DB_일반',
  ls.source_sheet_row_id,
  nc.source_cell_id,
  jsonb_build_object(
    'source_sheet', nc.sheet_name,
    'source_row_number', nc.row_number,
    'source_column', nc.column_letter,
    'field_label', r.field_label,
    'raw_value', nc.raw_value,
    'display_value', nc.display_value
  ),
  case when nc.numeric_value is null then 'source_blank_or_text' else 'source_backfilled' end,
  'Gate 6 DB_일반 세부면적 source-cell backfill'
from numeric_cells nc
join registry r
  on r.source_type = nc.source_type
 and r.source_name = nc.source_name
 and r.sheet_name = nc.sheet_name
 and r.column_number = nc.column_number
join public.ll_lease_spaces ls
  on ls.source_sheet_row_id = nc.source_sheet_row_id
where r.target_bucket = 'area_breakdown'
  and coalesce(nc.raw_value, nc.display_value, '') <> ''
on conflict (lease_space_id, area_type) do update set
  area_label = excluded.area_label,
  area_sqm = excluded.area_sqm,
  basis = excluded.basis,
  source_sheet_row_id = excluded.source_sheet_row_id,
  source_cell_id = excluded.source_cell_id,
  source_payload = excluded.source_payload,
  review_status = excluded.review_status,
  review_note = excluded.review_note,
  updated_at = now();

with registry as (
  select *
  from public.ll_source_field_registry
  where source_type = 'xlsx'
    and sheet_name in ('DB_일반', 'DB_?쇰컲')
),
db_general_cells as (
  select
    c.source_cell_id,
    c.source_type,
    c.source_name,
    c.sheet_name,
    c.row_number,
    c.column_number,
    c.column_letter,
    nullif(c.display_value_text, '') as display_value,
    nullif(c.raw_value_text, '') as raw_value,
    ('sheet_db_general:r' || lpad(greatest(c.row_number - 1, 0)::text, 6, '0')) as source_sheet_row_id
  from public.ll_source_cells c
  join registry r
    on r.source_type = c.source_type
   and r.source_name = c.source_name
   and r.sheet_name = c.sheet_name
   and r.column_number = c.column_number
  where c.row_number >= 12
),
typed_cells as (
  select
    *,
    case
      when coalesce(raw_value, display_value, '') ~ '^\s*-?[\d,]+(\.\d+)?\s*$'
        then replace(coalesce(raw_value, display_value), ',', '')::numeric
      else null
    end as numeric_value
  from db_general_cells
)
insert into public.ll_lease_space_specs (
  lease_space_id,
  lease_id,
  asset_id,
  tenant_id,
  spec_key,
  spec_label,
  spec_value,
  spec_numeric,
  unit_label,
  basis,
  source_sheet_row_id,
  source_cell_id,
  source_payload,
  review_status,
  review_note
)
select
  ls.lease_space_id,
  ls.lease_id,
  ls.asset_id,
  ls.tenant_id,
  lower(regexp_replace(r.column_letter || '_' || coalesce(r.field_label, 'spec'), '\s+', '_', 'g')) as spec_key,
  r.field_label as spec_label,
  coalesce(tc.display_value, tc.raw_value) as spec_value,
  tc.numeric_value as spec_numeric,
  r.unit_label,
  'DB_일반',
  ls.source_sheet_row_id,
  tc.source_cell_id,
  jsonb_build_object(
    'source_sheet', tc.sheet_name,
    'source_row_number', tc.row_number,
    'source_column', tc.column_letter,
    'field_label', r.field_label,
    'raw_value', tc.raw_value,
    'display_value', tc.display_value
  ),
  'source_backfilled',
  'Gate 6 DB_일반 임차인 요구 스펙 source-cell backfill'
from typed_cells tc
join registry r
  on r.source_type = tc.source_type
 and r.source_name = tc.source_name
 and r.sheet_name = tc.sheet_name
 and r.column_number = tc.column_number
join public.ll_lease_spaces ls
  on ls.source_sheet_row_id = tc.source_sheet_row_id
where r.target_bucket = 'lease_space_specs'
  and coalesce(tc.raw_value, tc.display_value, '') <> ''
on conflict (lease_space_id, spec_key) do update set
  spec_label = excluded.spec_label,
  spec_value = excluded.spec_value,
  spec_numeric = excluded.spec_numeric,
  unit_label = excluded.unit_label,
  basis = excluded.basis,
  source_sheet_row_id = excluded.source_sheet_row_id,
  source_cell_id = excluded.source_cell_id,
  source_payload = excluded.source_payload,
  review_status = excluded.review_status,
  review_note = excluded.review_note,
  updated_at = now();

with registry as (
  select *
  from public.ll_source_field_registry
  where source_type = 'xlsx'
    and sheet_name in ('DB_일반', 'DB_?쇰컲')
),
db_general_cells as (
  select
    c.source_cell_id,
    c.source_type,
    c.source_name,
    c.sheet_name,
    c.row_number,
    c.column_number,
    c.column_letter,
    nullif(c.display_value_text, '') as display_value,
    nullif(c.raw_value_text, '') as raw_value,
    ('sheet_db_general:r' || lpad(greatest(c.row_number - 1, 0)::text, 6, '0')) as source_sheet_row_id
  from public.ll_source_cells c
  join registry r
    on r.source_type = c.source_type
   and r.source_name = c.source_name
   and r.sheet_name = c.sheet_name
   and r.column_number = c.column_number
  where c.row_number >= 12
),
typed_cells as (
  select
    *,
    case
      when coalesce(raw_value, display_value, '') ~ '^\s*-?[\d,]+(\.\d+)?\s*$'
        then replace(coalesce(raw_value, display_value), ',', '')::numeric
      else null
    end as numeric_value
  from db_general_cells
)
insert into public.ll_lease_special_terms (
  lease_id,
  lease_space_id,
  asset_id,
  tenant_id,
  term_key,
  term_label,
  term_value,
  term_numeric,
  unit_label,
  basis,
  source_sheet_row_id,
  source_cell_id,
  source_payload,
  review_status,
  review_note
)
select
  ls.lease_id,
  ls.lease_space_id,
  ls.asset_id,
  ls.tenant_id,
  lower(regexp_replace(r.column_letter || '_' || coalesce(r.field_label, 'term'), '\s+', '_', 'g')) as term_key,
  r.field_label as term_label,
  coalesce(tc.display_value, tc.raw_value) as term_value,
  tc.numeric_value as term_numeric,
  r.unit_label,
  'DB_일반',
  ls.source_sheet_row_id,
  tc.source_cell_id,
  jsonb_build_object(
    'source_sheet', tc.sheet_name,
    'source_row_number', tc.row_number,
    'source_column', tc.column_letter,
    'field_label', r.field_label,
    'raw_value', tc.raw_value,
    'display_value', tc.display_value
  ),
  'source_backfilled',
  'Gate 6 DB_일반 계약/보험/특수조건 source-cell backfill'
from typed_cells tc
join registry r
  on r.source_type = tc.source_type
 and r.source_name = tc.source_name
 and r.sheet_name = tc.sheet_name
 and r.column_number = tc.column_number
join public.ll_lease_spaces ls
  on ls.source_sheet_row_id = tc.source_sheet_row_id
where r.target_bucket in ('lease_terms_and_insurance', 'special_terms_and_review')
  and coalesce(tc.raw_value, tc.display_value, '') <> ''
on conflict (lease_space_id, term_key) do update set
  term_label = excluded.term_label,
  term_value = excluded.term_value,
  term_numeric = excluded.term_numeric,
  unit_label = excluded.unit_label,
  basis = excluded.basis,
  source_sheet_row_id = excluded.source_sheet_row_id,
  source_cell_id = excluded.source_cell_id,
  source_payload = excluded.source_payload,
  review_status = excluded.review_status,
  review_note = excluded.review_note,
  updated_at = now();

with log_sources as (
  select distinct source_type, source_name, sheet_name
  from public.ll_source_cells
  where source_type = 'xlsx'
    and sheet_name = 'Log'
),
log_headers as (
  select
    c.source_type,
    c.source_name,
    c.sheet_name,
    c.column_number,
    coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, ''), 'column_' || c.column_number::text) as header_label
  from public.ll_source_cells c
  join log_sources s
    on s.source_type = c.source_type
   and s.source_name = c.source_name
   and s.sheet_name = c.sheet_name
  where c.row_number = 1
),
log_rows as (
  select
    c.source_type,
    c.source_name,
    c.sheet_name,
    c.row_number,
    jsonb_object_agg(coalesce(h.header_label, 'column_' || c.column_number::text), coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, '')) order by c.column_number) as payload,
    max(coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, ''))) filter (where c.column_number = 1) as log_date,
    max(coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, ''))) filter (where c.column_number = 2) as reviewer_name,
    max(coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, ''))) filter (where c.column_number = 3) as check_category,
    max(coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, ''))) filter (where c.column_number = 4) as check_result,
    max(coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, ''))) filter (where c.column_number = 5) as review_memo
  from public.ll_source_cells c
  join log_sources s
    on s.source_type = c.source_type
   and s.source_name = c.source_name
   and s.sheet_name = c.sheet_name
  left join log_headers h
    on h.source_type = c.source_type
   and h.source_name = c.source_name
   and h.sheet_name = c.sheet_name
   and h.column_number = c.column_number
  where c.row_number > 1
  group by c.source_type, c.source_name, c.sheet_name, c.row_number
  having bool_or(coalesce(nullif(c.display_value_text, ''), nullif(c.raw_value_text, '')) is not null)
)
insert into public.ll_source_review_logs (
  source_type,
  source_name,
  sheet_name,
  source_row_id,
  row_number,
  log_date,
  reviewer_name,
  check_category,
  check_result,
  review_memo,
  proposed_action,
  source_payload
)
select
  source_type,
  source_name,
  sheet_name,
  'sheet_log:r' || lpad(row_number::text, 6, '0'),
  row_number,
  log_date,
  reviewer_name,
  check_category,
  check_result,
  review_memo,
  null,
  payload
from log_rows
on conflict (source_type, source_name, sheet_name, row_number) do update set
  source_row_id = excluded.source_row_id,
  log_date = excluded.log_date,
  reviewer_name = excluded.reviewer_name,
  check_category = excluded.check_category,
  check_result = excluded.check_result,
  review_memo = excluded.review_memo,
  proposed_action = excluded.proposed_action,
  source_payload = excluded.source_payload,
  updated_at = now();
