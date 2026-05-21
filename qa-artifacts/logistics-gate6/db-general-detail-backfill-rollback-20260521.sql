-- Gate 6 DB_일반 detail backfill rollback.
-- This removes only rows created by the Gate 6 DB_일반 backfill basis/review note.

delete from public.ll_lease_space_area_breakdowns
where basis = 'DB_일반'
  and review_note = 'Gate 6 DB_일반 세부면적 source-cell backfill';

delete from public.ll_lease_space_specs
where basis = 'DB_일반'
  and review_note = 'Gate 6 DB_일반 임차인 요구 스펙 source-cell backfill';

delete from public.ll_lease_special_terms
where basis = 'DB_일반'
  and review_note = 'Gate 6 DB_일반 계약/보험/특수조건 source-cell backfill';

delete from public.ll_source_review_logs
where source_type = 'xlsx'
  and sheet_name = 'Log'
  and source_row_id like 'sheet_log:r%';
