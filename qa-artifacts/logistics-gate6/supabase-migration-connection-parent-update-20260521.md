# Supabase Migration / Connection Parent Update - 2026-05-21

## Parent Item

- Checklist parent item: `Supabase 마이그레이션 및 연결 완료`
- Status: `in_progress`
- Tracking rule: DB/API/frontend/QA steps are evidence under one parent item, not separate checklist denominator increases.

## Completed Evidence

### Source Preservation

- Live Google Sheets 17-tab cell-level manifest/readback is complete.
  - `cell_count=181,470`
  - `sheet_count=17`
  - `non_empty_cells=21,276`
  - `formula_cells=9,994`
  - `error_cells=13`
  - workbook hash `bbda1d15013623a28aed301a82162dbb2b6f42ed3c29fa81080b775dfb30ab03`
- Source cell groups now preserved:
  - live Google Sheets: 181,470 cells / 17 sheets
  - original Excel: 13,752 cells / 5 sheets
  - fund Excel: 1,435 cells / 3 sheets

### Fund Migration

- Fund Excel migration/readback is complete.
  - `ll_funds=15`
  - `ll_fund_asset_links=17`
  - `ll_fund_beneficiary_tranches=52`
  - `ll_fund_loan_tranches=51`

### DB_일반 Detail Backfill

- Applied additive-only migration:
  - `supabase/migrations/20260521032540_gate6_db_general_detail_backfill.sql`
- Rollback/readback files:
  - `qa-artifacts/logistics-gate6/db-general-detail-backfill-rollback-20260521.sql`
  - `qa-artifacts/logistics-gate6/db-general-detail-backfill-summary-readback-20260521.sql`
- Readback:
  - `ll_lease_space_area_breakdowns=387`, source-linked 387
  - `ll_lease_space_specs=513`, source-linked 513
  - `ll_lease_special_terms=1,758`, source-linked 1,758
  - `ll_source_review_logs=35`, source-linked 35
- Core row-count guard:
  - `ll_source_cells=196,657`
  - `ll_assets=17`
  - `ll_tenants=36`
  - `ll_leases=45`
  - `ll_lease_spaces=80`
  - `ll_rent_history=163`
  - `ll_weekly_assets=20`

### Edge/API

- `ll-dashboard-api` redeployed to qveg.
  - function version: 44
  - updated at: `2026-05-21 03:34:16 UTC`
- `dashboard/home/read`, `dashboard/asset/read`, and `dashboard/company/read` now include:
  - `lease_space_area_breakdowns`
  - `lease_space_specs`
  - `lease_special_terms`
- API evidence now includes:
  - `public.ll_lease_space_area_breakdowns`
  - `public.ll_lease_space_specs`
  - `public.ll_lease_special_terms`

### Frontend/Build/Security

- `npm run build:preview`: pass
- scoped ESLint for `WorkspaceLogistics.jsx`: pass
- `git diff --check`: pass
- concrete secret scan: 0 hits for:
  - `sb_secret_*`
  - `AIza*`
  - `gsk_*`
  - `sk-*`

### Live Edge Smoke

- CORS OPTIONS from `https://kylee94.github.io`: 200
- `access-control-allow-origin`: `https://kylee94.github.io`
- Unauthenticated/anon `dashboard/home/read`: 401
- Response preview: `Invalid Authorization token`

## Current Gaps

- Valid logged-in JWT 200 smoke still needs an actual logged-in access token or a test account password.
- Home/Asset/Company/PDF/Analysis/Pivot are not yet fully proven as Supabase-primary for every component.
- Static JSON remains only as constrained fallback in code, but section-level proof is still required before final completion.
- Actual browser visual QA remains user-side, per the user's instruction.

## Reviewer Risk Resolution

- Data reviewer risk `detail tables 0 rows`: resolved by DB_일반 detail backfill.
- Security/API reviewer risk `401/403 fallback leak`: partially resolved by code path and unauth 401 smoke; logged-in scope smoke still pending.
- Frontend/QA reviewer risk `static/API mixed payload`: still open for section-level parity proof.

## Completion Decision

This parent item is not complete yet. It is substantially advanced on migration/readback/API deployment, but cannot be closed until logged-in JWT 200 smoke and component-level Supabase-primary parity are verified.
