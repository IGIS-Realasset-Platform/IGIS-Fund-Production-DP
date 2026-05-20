# Gate 6 Dashboard Read Shadow Baseline - 2026-05-20

## Scope

- Repo: `C:\tmp\IGIS-Fund-Production-DP`
- Branch: `codex/logistics-gate6-post-deploy-updates`
- Supabase project ref: `qvegpozwrcmspdvjokiz`
- Live URL: `https://kylee94.github.io/logistics-gate6-preview/`
- Mutation at baseline step: `false`

## Live URL Baseline

| Check | Result |
|---|---|
| GitHub Pages root | HTTP 200 |
| Page title | `IGIS Logistics Work Platform` |
| JS asset in index | `/logistics-gate6-preview/assets/index-C5VJn_JZ.js` |
| CSS asset in index | `/logistics-gate6-preview/assets/index-CXQqVP0d.css` |

## Supabase Row Count Baseline

| Table | Expected row count | Readback row count |
|---|---:|---:|
| `ll_source_cells` | 13,752 | 13,752 |
| `ll_assets` | 17 | 17 |
| `ll_tenants` | 36 | 36 |
| `ll_leases` | 45 | 45 |
| `ll_lease_spaces` | 80 | 80 |
| `ll_rent_history` | 163 | 163 |
| `ll_weekly_assets` | 20 | 20 |

## Additive Migration Readback

Applied:

- `supabase/migrations/20260520083000_gate6_dashboard_read_shadow_schema.sql`
- `supabase/migrations/20260520084500_fix_db_history_field_registry.sql`

Readback after apply:

| Check | Expected | Readback |
|---|---:|---:|
| `ll_source_cells` | 13,752 | 13,752 |
| `ll_assets` | 17 | 17 |
| `ll_tenants` | 36 | 36 |
| `ll_leases` | 45 | 45 |
| `ll_lease_spaces` | 80 | 80 |
| `ll_rent_history` | 163 | 163 |
| `ll_weekly_assets` | 20 | 20 |
| `ll_source_field_registry` / `DB_일반` | 82 | 82 |
| `ll_source_field_registry` / `DB_히스토리 누적` | 18 | 18 |

Note: `DB_히스토리 누적` header row is row 10 (`B:S`). Row 14 is unit/source context and must not be treated as the field header.

## Stop Rule

If any baseline table row count decreases after the additive migration, stop the rollout and do not deploy frontend primary mode.
