-- Gate 6 logistics fund overview schema.
-- Additive-only: creates public.ll_* fund tables and seeds asset-fund links from the original Excel source cells.
-- No existing table/column is dropped, renamed, or type-changed in this migration.

create table if not exists public.ll_funds (
  fund_id text primary key,
  fund_code text,
  fund_name text not null,
  short_name text,
  legal_form text,
  investment_sector text,
  fund_type text,
  investment_strategy text,
  initial_setup_date date,
  maturity_date date,
  notes text,
  source_type text not null default 'xlsx',
  source_name text,
  source_sheet_name text,
  source_row_number integer,
  source_cell_ids text[] not null default '{}'::text[],
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ll_funds_fund_code_uidx
  on public.ll_funds(fund_code)
  where fund_code is not null and fund_code <> '';

create index if not exists ll_funds_name_idx
  on public.ll_funds(fund_name);

create table if not exists public.ll_fund_asset_links (
  id uuid primary key default gen_random_uuid(),
  fund_id text not null references public.ll_funds(fund_id),
  asset_id text not null references public.ll_assets(asset_id),
  asset_code text,
  asset_name text,
  link_type text not null default 'primary',
  source_type text not null default 'xlsx',
  source_name text,
  source_sheet_name text,
  source_row_number integer,
  source_cell_ids text[] not null default '{}'::text[],
  source_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (asset_id, fund_id),
  unique (asset_id, link_type)
);

create index if not exists ll_fund_asset_links_fund_idx
  on public.ll_fund_asset_links(fund_id, asset_id);

create table if not exists public.ll_fund_beneficiary_tranches (
  id uuid primary key default gen_random_uuid(),
  fund_id text not null references public.ll_funds(fund_id),
  row_key text not null,
  tranche text,
  beneficiary_name text,
  committed_amount_krw numeric,
  display_order integer not null default 0,
  is_active boolean not null default true,
  deleted_at timestamptz,
  source_type text,
  source_name text,
  source_sheet_name text,
  source_row_number integer,
  source_cell_ids text[] not null default '{}'::text[],
  source_payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fund_id, row_key)
);

create index if not exists ll_fund_beneficiary_tranches_lookup_idx
  on public.ll_fund_beneficiary_tranches(fund_id, is_active, display_order);

create table if not exists public.ll_fund_loan_tranches (
  id uuid primary key default gen_random_uuid(),
  fund_id text not null references public.ll_funds(fund_id),
  row_key text not null,
  tranche text,
  lender_name text,
  committed_amount_krw numeric,
  drawdown_date date,
  maturity_date date,
  loan_period text,
  interest_rate text,
  fee text,
  all_in text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  deleted_at timestamptz,
  source_type text,
  source_name text,
  source_sheet_name text,
  source_row_number integer,
  source_cell_ids text[] not null default '{}'::text[],
  source_payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fund_id, row_key)
);

create index if not exists ll_fund_loan_tranches_lookup_idx
  on public.ll_fund_loan_tranches(fund_id, is_active, display_order);

alter table public.ll_funds enable row level security;
alter table public.ll_fund_asset_links enable row level security;
alter table public.ll_fund_beneficiary_tranches enable row level security;
alter table public.ll_fund_loan_tranches enable row level security;

with source_rows as (
  select
    row_number,
    max(display_value_text) filter (where column_number = 2) as source_asset_code,
    max(display_value_text) filter (where column_number = 3) as source_asset_name,
    max(display_value_text) filter (where column_number = 4) as source_fund_code,
    max(display_value_text) filter (where column_number = 5) as source_fund_name,
    array_agg(source_cell_id order by column_number) as source_cell_ids,
    jsonb_object_agg(column_letter, display_value_text order by column_number) as source_payload
  from public.ll_source_cells
  where source_type = 'xlsx'
    and source_name = '★ 260414_물류센터 임대차계약 DB_취합본.xlsx'
    and sheet_name = '자산_담당자 연결'
    and row_number >= 4
  group by row_number
),
matched_assets as (
  select
    a.asset_id,
    a.asset_code,
    a.asset_name,
    coalesce(nullif(sr.source_fund_code, ''), nullif(a.fund_code, '')) as fund_code,
    coalesce(nullif(sr.source_fund_name, ''), nullif(a.fund_name, ''), '미분류 펀드') as fund_name,
    sr.row_number as source_row_number,
    sr.source_cell_ids,
    sr.source_payload
  from public.ll_assets a
  left join source_rows sr
    on lower(coalesce(sr.source_asset_code, '')) = lower(coalesce(a.asset_code, ''))
    or replace(lower(coalesce(sr.source_asset_name, '')), ' ', '') = replace(lower(coalesce(a.asset_name, '')), ' ', '')
  where coalesce(nullif(sr.source_fund_name, ''), nullif(a.fund_name, '')) is not null
),
fund_seed as (
  select
    fund_id,
    max(fund_code) as fund_code,
    max(fund_name) as fund_name,
    min(source_row_number) as source_row_number,
    array_agg(distinct source_cell_id order by source_cell_id) filter (where source_cell_id is not null) as source_cell_ids,
    jsonb_build_object(
      'source_rows',
      jsonb_agg(
        jsonb_build_object(
          'asset_id', asset_id,
          'asset_code', asset_code,
          'asset_name', asset_name,
          'source_row_number', source_row_number,
          'source_payload', source_payload
        )
        order by asset_name
      )
    ) as source_payload
  from (
    select
      'fund_' || lower(regexp_replace(coalesce(fund_code, regexp_replace(fund_name, '\s+', '', 'g')), '[^a-zA-Z0-9가-힣]+', '_', 'g')) as fund_id,
      matched_assets.*,
      unnest(coalesce(source_cell_ids, '{}'::text[])) as source_cell_id
    from matched_assets
  ) seeded
  group by fund_id
)
insert into public.ll_funds (
  fund_id,
  fund_code,
  fund_name,
  investment_sector,
  source_type,
  source_name,
  source_sheet_name,
  source_row_number,
  source_cell_ids,
  source_payload,
  updated_at
)
select
  fund_id,
  fund_code,
  fund_name,
  '물류',
  'xlsx',
  '★ 260414_물류센터 임대차계약 DB_취합본.xlsx',
  '자산_담당자 연결',
  source_row_number,
  source_cell_ids,
  source_payload,
  now()
from fund_seed
on conflict (fund_id) do update set
  fund_code = coalesce(excluded.fund_code, public.ll_funds.fund_code),
  fund_name = excluded.fund_name,
  investment_sector = coalesce(public.ll_funds.investment_sector, excluded.investment_sector),
  source_name = excluded.source_name,
  source_sheet_name = excluded.source_sheet_name,
  source_row_number = excluded.source_row_number,
  source_cell_ids = excluded.source_cell_ids,
  source_payload = excluded.source_payload,
  updated_at = now();

with source_rows as (
  select
    row_number,
    max(display_value_text) filter (where column_number = 2) as source_asset_code,
    max(display_value_text) filter (where column_number = 3) as source_asset_name,
    max(display_value_text) filter (where column_number = 4) as source_fund_code,
    max(display_value_text) filter (where column_number = 5) as source_fund_name,
    array_agg(source_cell_id order by column_number) as source_cell_ids,
    jsonb_object_agg(column_letter, display_value_text order by column_number) as source_payload
  from public.ll_source_cells
  where source_type = 'xlsx'
    and source_name = '★ 260414_물류센터 임대차계약 DB_취합본.xlsx'
    and sheet_name = '자산_담당자 연결'
    and row_number >= 4
  group by row_number
),
matched_assets as (
  select
    a.asset_id,
    a.asset_code,
    a.asset_name,
    coalesce(nullif(sr.source_fund_code, ''), nullif(a.fund_code, '')) as fund_code,
    coalesce(nullif(sr.source_fund_name, ''), nullif(a.fund_name, ''), '미분류 펀드') as fund_name,
    sr.row_number as source_row_number,
    sr.source_cell_ids,
    sr.source_payload
  from public.ll_assets a
  left join source_rows sr
    on lower(coalesce(sr.source_asset_code, '')) = lower(coalesce(a.asset_code, ''))
    or replace(lower(coalesce(sr.source_asset_name, '')), ' ', '') = replace(lower(coalesce(a.asset_name, '')), ' ', '')
  where coalesce(nullif(sr.source_fund_name, ''), nullif(a.fund_name, '')) is not null
)
insert into public.ll_fund_asset_links (
  fund_id,
  asset_id,
  asset_code,
  asset_name,
  link_type,
  source_type,
  source_name,
  source_sheet_name,
  source_row_number,
  source_cell_ids,
  source_payload,
  updated_at
)
select
  'fund_' || lower(regexp_replace(coalesce(fund_code, regexp_replace(fund_name, '\s+', '', 'g')), '[^a-zA-Z0-9가-힣]+', '_', 'g')) as fund_id,
  asset_id,
  asset_code,
  asset_name,
  'primary',
  'xlsx',
  '★ 260414_물류센터 임대차계약 DB_취합본.xlsx',
  '자산_담당자 연결',
  source_row_number,
  source_cell_ids,
  source_payload,
  now()
from matched_assets
on conflict (asset_id, link_type) do update set
  fund_id = excluded.fund_id,
  asset_code = excluded.asset_code,
  asset_name = excluded.asset_name,
  source_name = excluded.source_name,
  source_sheet_name = excluded.source_sheet_name,
  source_row_number = excluded.source_row_number,
  source_cell_ids = excluded.source_cell_ids,
  source_payload = excluded.source_payload,
  updated_at = now();

insert into public.ll_api_audit_logs (action, status_code, requested_by, request_payload)
values (
  'migration/add-logistics-fund-overview',
  200,
  null,
  jsonb_build_object(
    'migration', '20260520081005_add_logistics_fund_overview',
    'mode', 'additive',
    'tables', jsonb_build_array('ll_funds', 'll_fund_asset_links', 'll_fund_beneficiary_tranches', 'll_fund_loan_tranches')
  )
);
