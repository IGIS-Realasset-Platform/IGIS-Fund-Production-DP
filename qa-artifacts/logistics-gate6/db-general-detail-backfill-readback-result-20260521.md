# DB_일반 detail backfill readback - 2026-05-21

## Scope

- Parent item: `Supabase 마이그레이션 및 연결 완료`
- Supabase project: `qvegpozwrcmspdvjokiz`
- Applied SQL: `supabase/migrations/20260521032540_gate6_db_general_detail_backfill.sql`
- Rollback SQL: `qa-artifacts/logistics-gate6/db-general-detail-backfill-rollback-20260521.sql`
- Readback SQL: `qa-artifacts/logistics-gate6/db-general-detail-backfill-summary-readback-20260521.sql`

## Result

The backfill was applied as additive-only rows. No core normalized row count decreased.

| Table | Rows | Rows with source evidence |
|---|---:|---:|
| `ll_lease_space_area_breakdowns` | 387 | 387 |
| `ll_lease_space_specs` | 513 | 513 |
| `ll_lease_special_terms` | 1,758 | 1,758 |
| `ll_source_review_logs` | 35 | 35 |

## Core Row Count Guard

| Table | Readback |
|---|---:|
| `ll_source_cells` | 196,657 |
| `ll_assets` | 17 |
| `ll_tenants` | 36 |
| `ll_leases` | 45 |
| `ll_lease_spaces` | 80 |
| `ll_rent_history` | 163 |
| `ll_weekly_assets` | 20 |

## Notes

- `ll_source_cells` increased because the live Google Sheets 17-tab cell manifest and fund Excel cell manifest are now preserved alongside the original Excel source cells.
- Detail rows are linked to `source_cell_id` or `source_row_id`, so Data Quality can trace user-visible editable detail values back to source.
- This does not drop, rename, or type-change any existing table/column.
- Remaining migration gap is no longer empty detail tables; the remaining gap is frontend/API primary parity and logged-in JWT smoke.
