# Gate 6 deployment protection baseline - 2026-05-20

## Scope

- Branch: `codex/logistics-gate6-post-deploy-updates`
- Live URL: `https://kylee94.github.io/logistics-gate6-preview/`
- Live URL smoke: `HTTP 200 OK`
- GitHub Pages last-modified header observed: `Wed, 20 May 2026 07:05:19 GMT`
- This artifact is read-only baseline evidence. It does not apply DB migration, deploy Edge Functions, or deploy gh-pages.

## Current worktree note

The branch already had pending Gate 6 edits before this batch. This batch works on top of those changes and does not revert unrelated files.

## Baseline row counts to preserve before any future migration

These counts are the current Gate 6 protection baseline from existing readback artifacts and must not decrease in any additive migration batch.

| Table | Baseline |
|---|---:|
| `ll_source_cells` | 13,752 |
| `ll_assets` | 17 |
| `ll_tenants` | 36 |
| `ll_leases` | 45 |
| `ll_lease_spaces` | 80 |
| `ll_rent_history` | 163 |
| `ll_weekly_assets` | 20 |
| `ll_funds` | 15 |
| `ll_fund_asset_links` | 17 |

## Deployment guardrails

- Do not overwrite `gh-pages` during this batch.
- Do not deploy `ll-dashboard-api` during this batch.
- Do not apply migration SQL during this batch.
- Do not drop, rename, type-change, or delete existing `public.ll_*` tables, columns, or rows.
- Keep static JSON fallback in the deployed app until Home/Asset/Company primary Supabase read parity passes.

## Blockers converted to next actions

- Current fund Excel source is not yet cell-level preserved in Supabase.
- Fund lender schema is missing Excel-native fields such as loan type, interest type, base rate, spread rate, and loan rate.
- Fund save must not directly write live tables; it must submit an approval request first.
- 401/403 read failures must never fall back to static JSON as if data was authorized.
