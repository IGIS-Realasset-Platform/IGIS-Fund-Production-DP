-- Gate 6 dashboard read shadow rollback preview.
-- Use only if the additive migration must be removed before dependent code relies on it.
-- This rollback does not touch existing pre-Gate-6 tables or rows.

drop table if exists public.ll_dashboard_read_snapshots;
drop table if exists public.ll_source_review_logs;
drop table if exists public.ll_lease_special_terms;
drop table if exists public.ll_lease_space_specs;
drop table if exists public.ll_lease_space_area_breakdowns;
drop table if exists public.ll_source_field_registry;

alter table public.ll_source_cells
  drop column if exists workbook_hash,
  drop column if exists sheet_hash,
  drop column if exists source_run_id,
  drop column if exists is_error,
  drop column if exists is_formula,
  drop column if exists effective_type;
