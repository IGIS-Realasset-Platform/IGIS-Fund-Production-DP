-- Gate 6 dashboard read shadow schema.
-- Additive-only: public.ll_* objects only. No drop/delete/rename/type changes.

alter table public.ll_source_cells
  add column if not exists effective_type text,
  add column if not exists is_formula boolean,
  add column if not exists is_error boolean,
  add column if not exists source_run_id text,
  add column if not exists sheet_hash text,
  add column if not exists workbook_hash text;

create table if not exists public.ll_source_field_registry (
  source_field_id text primary key,
  source_type text not null,
  source_name text not null,
  sheet_name text not null,
  column_number integer not null,
  column_letter text not null,
  header_row_number integer,
  group_label text,
  field_label text not null,
  unit_label text,
  target_bucket text not null default 'unknown',
  target_table text,
  target_field text,
  target_json_path text,
  edit_policy text not null default 'source_review',
  is_user_editable boolean not null default true,
  is_formula_or_check boolean not null default false,
  source_cell_id text references public.ll_source_cells(source_cell_id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_name, sheet_name, column_number, header_row_number)
);

create index if not exists ll_source_field_registry_sheet_idx
  on public.ll_source_field_registry(source_type, source_name, sheet_name, column_number);

create table if not exists public.ll_lease_space_area_breakdowns (
  id uuid primary key default gen_random_uuid(),
  lease_space_id text references public.ll_lease_spaces(lease_space_id),
  lease_id text,
  asset_id text references public.ll_assets(asset_id),
  tenant_id text references public.ll_tenants(tenant_id),
  area_type text not null,
  area_label text,
  area_sqm numeric,
  area_py numeric generated always as (case when area_sqm is null then null else area_sqm * 0.3025 end) stored,
  basis text not null default 'DB_일반',
  source_sheet_row_id text,
  source_cell_id text references public.ll_source_cells(source_cell_id),
  source_payload jsonb not null default '{}'::jsonb,
  review_status text,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lease_space_id, area_type)
);

create index if not exists ll_lease_space_area_breakdowns_asset_idx
  on public.ll_lease_space_area_breakdowns(asset_id, area_type);

create table if not exists public.ll_lease_space_specs (
  id uuid primary key default gen_random_uuid(),
  lease_space_id text references public.ll_lease_spaces(lease_space_id),
  lease_id text,
  asset_id text references public.ll_assets(asset_id),
  tenant_id text references public.ll_tenants(tenant_id),
  spec_key text not null,
  spec_label text not null,
  spec_value text,
  spec_numeric numeric,
  unit_label text,
  basis text not null default 'DB_일반',
  source_sheet_row_id text,
  source_cell_id text references public.ll_source_cells(source_cell_id),
  source_payload jsonb not null default '{}'::jsonb,
  review_status text,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lease_space_id, spec_key)
);

create index if not exists ll_lease_space_specs_asset_idx
  on public.ll_lease_space_specs(asset_id, spec_key);

create table if not exists public.ll_lease_special_terms (
  id uuid primary key default gen_random_uuid(),
  lease_id text,
  lease_space_id text references public.ll_lease_spaces(lease_space_id),
  asset_id text references public.ll_assets(asset_id),
  tenant_id text references public.ll_tenants(tenant_id),
  term_key text not null,
  term_label text not null,
  term_value text,
  term_numeric numeric,
  unit_label text,
  basis text not null default 'DB_일반',
  source_sheet_row_id text,
  source_cell_id text references public.ll_source_cells(source_cell_id),
  source_payload jsonb not null default '{}'::jsonb,
  review_status text,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lease_space_id, term_key)
);

create index if not exists ll_lease_special_terms_asset_idx
  on public.ll_lease_special_terms(asset_id, term_key);

create table if not exists public.ll_source_review_logs (
  id uuid primary key default gen_random_uuid(),
  source_type text not null default 'xlsx',
  source_name text not null,
  sheet_name text not null default 'Log',
  source_row_id text,
  row_number integer,
  log_date text,
  reviewer_name text,
  check_category text,
  check_result text,
  review_memo text,
  proposed_action text,
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_name, sheet_name, row_number)
);

create index if not exists ll_source_review_logs_source_idx
  on public.ll_source_review_logs(source_type, source_name, sheet_name, row_number);

create table if not exists public.ll_dashboard_read_snapshots (
  id uuid primary key default gen_random_uuid(),
  read_action text not null,
  basis_date date not null,
  user_id uuid references auth.users(id),
  scope_hash text not null,
  payload_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  source_tables text[] not null default '{}'::text[],
  warning_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  unique (read_action, basis_date, user_id, scope_hash, payload_hash)
);

create index if not exists ll_dashboard_read_snapshots_lookup_idx
  on public.ll_dashboard_read_snapshots(read_action, basis_date, user_id, scope_hash, created_at desc);

alter table public.ll_source_field_registry enable row level security;
alter table public.ll_lease_space_area_breakdowns enable row level security;
alter table public.ll_lease_space_specs enable row level security;
alter table public.ll_lease_special_terms enable row level security;
alter table public.ll_source_review_logs enable row level security;
alter table public.ll_dashboard_read_snapshots enable row level security;

insert into public.ll_source_field_registry (
  source_field_id,
  source_type,
  source_name,
  sheet_name,
  column_number,
  column_letter,
  header_row_number,
  group_label,
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
  'xlsx:db_general:' || lower(header_cell.column_letter) as source_field_id,
  header_cell.source_type,
  header_cell.source_name,
  header_cell.sheet_name,
  header_cell.column_number,
  header_cell.column_letter,
  header_cell.row_number as header_row_number,
  nullif(group_cell.display_value_text, '') as group_label,
  header_cell.display_value_text as field_label,
  nullif(unit_cell.display_value_text, '') as unit_label,
  case
    when header_cell.column_number between 2 and 15 then 'normalized_core_master'
    when header_cell.column_number between 16 and 26 then 'normalized_area_metrics_and_checks'
    when header_cell.column_number between 27 and 36 then 'area_breakdown'
    when header_cell.column_number between 37 and 69 then 'lease_terms_and_insurance'
    when header_cell.column_number between 70 and 80 then 'lease_space_specs'
    when header_cell.column_number between 81 and 84 then 'special_terms_and_review'
    else 'unknown'
  end as target_bucket,
  case
    when header_cell.column_number between 2 and 15 then 'public.ll_assets/public.ll_tenants/public.ll_leases/public.ll_lease_spaces'
    when header_cell.column_number between 16 and 26 then 'public.ll_assets/public.ll_lease_spaces/public.ll_data_quality_findings'
    when header_cell.column_number between 27 and 36 then 'public.ll_lease_space_area_breakdowns'
    when header_cell.column_number between 37 and 69 then 'public.ll_leases/public.ll_lease_special_terms'
    when header_cell.column_number between 70 and 80 then 'public.ll_lease_space_specs'
    when header_cell.column_number between 81 and 84 then 'public.ll_lease_special_terms'
    else null
  end as target_table,
  case
    when header_cell.column_number between 16 and 26 then 'formula_or_check_review'
    else 'data_quality_request'
  end as edit_policy,
  header_cell.column_number not between 16 and 26 as is_user_editable,
  header_cell.column_number between 16 and 26 as is_formula_or_check,
  header_cell.source_cell_id,
  'Seeded from DB_일반 header row for Gate 6 Data Quality source mapping'
from public.ll_source_cells header_cell
left join public.ll_source_cells group_cell
  on group_cell.source_type = header_cell.source_type
 and group_cell.source_name = header_cell.source_name
 and group_cell.sheet_name = header_cell.sheet_name
 and group_cell.row_number = 8
 and group_cell.column_number = header_cell.column_number
left join public.ll_source_cells unit_cell
  on unit_cell.source_type = header_cell.source_type
 and unit_cell.source_name = header_cell.source_name
 and unit_cell.sheet_name = header_cell.sheet_name
 and unit_cell.row_number = 10
 and unit_cell.column_number = header_cell.column_number
where header_cell.source_type = 'xlsx'
  and header_cell.source_name = '★ 260414_물류센터 임대차계약 DB_취합본.xlsx'
  and header_cell.sheet_name = 'DB_일반'
  and header_cell.row_number = 9
  and header_cell.column_number between 2 and 84
  and nullif(header_cell.display_value_text, '') is not null
on conflict (source_field_id) do update set
  field_label = excluded.field_label,
  group_label = excluded.group_label,
  unit_label = excluded.unit_label,
  target_bucket = excluded.target_bucket,
  target_table = excluded.target_table,
  edit_policy = excluded.edit_policy,
  is_user_editable = excluded.is_user_editable,
  is_formula_or_check = excluded.is_formula_or_check,
  source_cell_id = excluded.source_cell_id,
  notes = excluded.notes,
  updated_at = now();

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
    when header_cell.column_number between 2 and 13 then 'history_identity_and_area'
    when header_cell.column_number between 14 and 19 then 'time_series_rent_fee'
    else 'unknown'
  end as target_bucket,
  case
    when header_cell.column_number between 2 and 13 then 'public.ll_rent_history/public.ll_lease_spaces'
    when header_cell.column_number between 14 and 19 then 'public.ll_rent_history'
    else null
  end as target_table,
  'data_quality_request' as edit_policy,
  true as is_user_editable,
  false as is_formula_or_check,
  header_cell.source_cell_id,
  'Seeded from DB_히스토리 누적 header row for Gate 6 rent-history source mapping'
from public.ll_source_cells header_cell
left join public.ll_source_cells unit_cell
  on unit_cell.source_type = header_cell.source_type
 and unit_cell.source_name = header_cell.source_name
 and unit_cell.sheet_name = header_cell.sheet_name
 and unit_cell.row_number = 13
 and unit_cell.column_number = header_cell.column_number
where header_cell.source_type = 'xlsx'
  and header_cell.source_name = '★ 260414_물류센터 임대차계약 DB_취합본.xlsx'
  and header_cell.sheet_name = 'DB_히스토리 누적'
  and header_cell.row_number = 14
  and header_cell.column_number between 2 and 19
  and nullif(header_cell.display_value_text, '') is not null
on conflict (source_field_id) do update set
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
