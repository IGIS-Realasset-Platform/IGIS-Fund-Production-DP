# Fund Overview Baseline / Readback

- Date: 2026-05-20
- Project: `qvegpozwrcmspdvjokiz`
- Mode: additive migration, no existing table/column drop or type change.

## Pre/Post Preserved Counts

| Table | Baseline | After migration |
|---|---:|---:|
| `ll_source_cells` | 13,752 | 13,752 |
| `ll_assets` | 17 | 17 |
| `ll_tenants` | 36 | 36 |
| `ll_leases` | 45 | 45 |
| `ll_lease_spaces` | 80 | 80 |
| `ll_rent_history` | 163 | 163 |
| `ll_weekly_assets` | 20 | 20 |

## New Fund Tables

| Table | Rows |
|---|---:|
| `ll_funds` | 15 |
| `ll_fund_asset_links` | 17 |
| `ll_fund_beneficiary_tranches` | 0 |
| `ll_fund_loan_tranches` | 0 |

## Key Readback

- 부산송정물류센터 is linked from original Excel `자산_담당자 연결` row 11 to fund code `112109`, fund name `이지스제114호전문투자형사모부동산투자유한회사`.
- 동산물류센터, 부국물류센터, 에이블로지스물류센터 share fund code `112527`, fund name `이지스전문투자형사모부동산투자신탁제404호`.
- Fund overview detail rows are intentionally blank until a user/admin inputs fund information, beneficiary tranches, and lender tranches.

## QA Evidence

- Remote rollback dry-run passed for `20260520081005_add_logistics_fund_overview.sql`.
- Remote migration apply passed.
- Edge Function `ll-dashboard-api` deploy passed.
- `weekly-assets/latest-preview` live smoke returned `ok=true`, rows `20`.
- Unauthenticated `funds/read-by-asset` call returned `401 Unauthorized`, so fund data is not exposed without auth.
- `npx eslint src\components\system\workspace\WorkspaceLogistics.jsx` passed.
- `npm run build:preview` passed.
- `git diff --check` passed.
- `dist` secret-pattern scan returned 0 hits for service/API secret strings.
