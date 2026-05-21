# Schema And Asset Expiry Snapshot Review - 2026-05-21

## Schema Status

- The planned safe restructuring is applied at the current operating boundary.
- The live catalog is still 34 active `ll_*` tables because raw source evidence, normalized leasing core, detail records, fund records, work-platform records, permission/audit, cache, and metadata have separate responsibilities.
- Further physical reduction is not recommended until source-cell evidence, edit/audit trail, and dashboard read API contracts can be preserved without loss.
- Current catalog QA: 34 active `ll_*` tables, missing primary key 0, missing FK index 0, RLS disabled 0, cleanup candidates 0.

## Asset Maturity Snapshot Rule

- Asset maturity snapshot completeness is based on normalized `ll_lease_spaces` plus linked `ll_leases.current_end_date`.
- Prebuilt `expirySnapshot` or `contractExpiry` rows are enrichment/fallback only and cannot drop derived lease-space rows.
- The chart no longer truncates Asset maturity snapshot rows to 10 items.
- Rows with the same remaining months sort by normalized floor value descending, then date, then tenant/space key.

## QA Evidence

- `npm run qa:supabase-catalog`: pass.
- `npm run qa:logistics-primary-parity`: pass with Asset expiry checks and `expiry_candidate_rows`.
- `npm run qa:browser-visible-parity`: pass.
- `npm run build:preview`: pass.
- Scoped ESLint and `git diff --check`: pass.
