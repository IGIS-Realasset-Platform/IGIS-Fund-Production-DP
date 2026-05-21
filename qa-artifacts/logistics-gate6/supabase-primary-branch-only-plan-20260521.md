# Supabase Primary Branch-Only Continuation Plan - 2026-05-21

## Scope

- Parent checklist item: `Supabase 마이그레이션 및 연결 완료`
- Current work mode: branch-only until explicit user approval.
- Do not deploy `gh-pages`, do not deploy Edge Functions, do not run Supabase write/migration/RLS/policy changes in this batch.
- Current implementation branch: `codex/logistics-gate6-post-deploy-updates`
- Deployment target remains `KYLee94/logistics-gate6-preview`, but this plan does not deploy it.
- `tmp/` is an untracked temporary workspace folder and must stay uncommitted.

## 181,470 Cell Manifest Explanation

`181,470` is the used-range cell count from the live Google Sheets workbook `IGIS_Logistics_Leasing_Data`.

It is calculated by summing every cell inside each of the 17 live-sheet used ranges. Blank cells inside the used range are included because they are part of the source workbook shape and are needed for cell-level audit parity.

| Sheet | Cells |
|---|---:|
| `AUDIT_데이터이상` | 680 |
| `AuditLog` | 32 |
| `DB_계산` | 1,024 |
| `DB_기업` | 620 |
| `DB_일반` | 80,838 |
| `DB_자산` | 23,000 |
| `DB_히스토리 누적` | 22,816 |
| `LOG_API` | 49 |
| `LOG_검증` | 7 |
| `LOG_계산` | 6 |
| `meta_DB_일반` | 1,200 |
| `SYS_기업명정규화` | 8,000 |
| `SYS_설정` | 18 |
| `SYS_자산조회키` | 16,000 |
| `SYS_코드` | 36 |
| `이슈 리스트` | 27,000 |
| `펀드-자산-담당자 연결` | 144 |
| **Total** | **181,470** |

Readback evidence:

- Source type/name: `live_google_sheets` / `IGIS_Logistics_Leasing_Data`
- Import id: `live_google_sheets_20260512_cell_manifest`
- Supabase readback: 17 sheets, 181,470 cells, 21,276 non-empty cells, 9,994 formula cells, 13 error cells
- Workbook hash: `bbda1d15013623a28aed301a82162dbb2b6f42ed3c29fa81080b775dfb30ab03`
- Evidence file: `qa-artifacts/logistics-gate6/live-sheets-cell-manifest-readback-20260521.md`

Meaning:

- This proves source preservation at cell level.
- It does not prove that every preserved source value is normalized into operational tables.
- It does not prove that every dashboard component is using Supabase primary data.
- Therefore source preservation, normalized migration, and UI primary parity remain separate gates under the same parent checklist item.

## Current Supabase Row-Count Guard

Latest read-only guard after the previous work-platform snapshot task:

| Table | Row count |
|---|---:|
| `ll_source_cells` | 196,657 |
| `ll_work_platform_task_snapshots` | 1 |
| `ll_assets` | 17 |
| `ll_tenants` | 36 |
| `ll_leases` | 45 |
| `ll_lease_spaces` | 80 |
| `ll_rent_history` | 163 |
| `ll_weekly_assets` | 20 |

Interpretation:

- `ll_source_cells=196,657` includes original Excel, fund Excel, and live Google Sheets cell manifests.
- `ll_work_platform_task_snapshots=1` means the new past-task weekly snapshot table has already received one snapshot row after the Work Platform page loaded.
- `ll_work_platform_task_snapshots` is Work Platform / archive data only.
- It must not be used as a source for Home, Asset, Company, PDF Report, Analysis Tools, or Pivot Table dashboard numbers.
- The snapshot table is not a cleanup candidate in this batch; it is an operational history table. Later optimization may add retention/index policy, but not during the primary migration proof batch.

## Subagent Review Decisions Incorporated

### PM / Control Review

- Keep this as one parent checklist item instead of inflating the denominator with many internal sub-steps.
- Separate previous hotfix deployment history from the current branch-only migration proof work.
- Do not mark the parent complete until valid JWT smoke and component-level Supabase primary parity are proven.

### Data / Backend Review

- `181,470` proves live-source preservation, not dashboard primary completion.
- `ll_source_cells` and source evidence tables must not be deleted just because they are not directly visible on the dashboard.
- `ll_work_platform_task_snapshots` should be added to row-count guards and schema inventory, but kept out of dashboard read evidence.
- Valid JWT smoke must include both dashboard reads and task snapshot actions.

### Frontend / QA Review

- The branch default read mode is already `primary-safe`.
- The remaining job is not to "turn primary on"; it is to prove section by section that primary-safe actually renders Supabase-derived values.
- Home, Analysis Tools, and Pivot Table share `useDashboardHomeReadDataset`; Analysis/Pivot still need their own proof because their calculations can silently use fallback rows.
- PDF Report is composed from multiple reads and must be checked block by block.
- Network/CORS fallback must be distinguished from auth/permission fallback. 401/403 must never display static JSON values.

## Next Execution Plan

### 1. Valid Logged-In JWT Smoke

Goal: prove server-side read APIs work for a real logged-in user and fail closed when unauthorized.

Run only when a valid session token is available:

- `dashboard/home/read` with `basis_date=2026-04-30`: expect 200
- `dashboard/asset/read` with a readable asset id: expect 200
- `dashboard/company/read` with a readable tenant id: expect 200
- `work-platform/tasks/snapshots/upsert-current`: expect 200 and task_count equals visible non-deleted tasks
- `work-platform/tasks/snapshots/list`: expect 200 and no deleted tasks in `snapshot_data`

Negative checks:

- No token: expect 401
- Unauthorized asset/company: expect 403 or 404
- 401/403 must not show static JSON fallback values.

Current status:

- Unauthenticated 401 and CORS OPTIONS 200 have been proven.
- Valid logged-in 200 smoke is still pending.
- Branch helper added: `npm run qa:logistics-jwt-smoke`.
- The helper requires `LOGISTICS_SUPABASE_ACCESS_TOKEN` and does not print the token.

### 2. Component Source Matrix

Each section must be classified as one of:

- `API-derived`: rendered from Supabase read API payload.
- `mixed`: Supabase payload plus static fallback/enrichment still used.
- `static fallback`: static JSON is visible because API failed or was not wired.
- `blocked`: primary-safe correctly blocks because permission/API shape/basis evidence is invalid.

Branch static inspection result:

| Area | Current primary path | Current risk | Required proof |
|---|---|---|---|
| Home KPI | `useDashboardHomeReadDataset` -> `dashboard/home/read` | static summary still exists for shape comparison/fallback | API evidence, basis date, KPI diff |
| Home charts | Home read adapter + derived rows | derived series can still use static rows if API fallback opens | chart value diff by component |
| Home map/table | Home read adapter + asset rows | coordinates/addresses may still rely on static enrichment | marker/table source proof |
| Asset KPI | `dashboard/asset/read` via asset adapter | static asset payload remains fallback | selected asset API 200 and KPI diff |
| Asset tenant table | asset adapter rows | fallback payload is still available | row count/header/value diff |
| Asset area/floor/expiry | asset read plus detail tables | component-specific mapping may be mixed | table/chart source proof |
| Asset fund overview | `funds/read-by-asset` + `dashboard/asset/read` extension | fund read and asset read can diverge if fallback opens | fund_id/link/tranche proof |
| Company KPI/table/map | `dashboard/company/read` | selector/company scope mismatch risk | selected tenant API 200 and row diff |
| Analysis Tools | `useDashboardHomeReadDataset` reused | no separate analysis API; calculations may use fallback rows | input row source proof and metric diff |
| Pivot Table | `useDashboardHomeReadDataset` reused | pivot can silently compute from fallback rows | pivot source row count and table diff |
| PDF Report | Home/Asset/fund reads composed | PDF blocks can mix static/fallback sources | per selected PDF component source proof |
| Work Platform archive | `ll_work_platform_task_snapshots` | must stay separate from dashboard | deleted task exclusion and author format proof |

### 3. Branch-Only Static QA

Allowed without deployment or DB mutation:

- Static audit that dashboard paths do not import or use `ll_work_platform_task_snapshots`.
- Static audit of static JSON fallback branches.
- Runtime QA helper draft for `window.__logisticsDashboardShadowDiffs`.
- JWT smoke helper script that can be run once a logged-in access token is supplied.
- Component source matrix update.
- `git diff --check`.
- Scoped ESLint/build only if code changes are made.

### 4. Approval-Bound Execution

Requires explicit approval before running:

- gh-pages deployment.
- Edge Function deployment.
- Supabase migration/write/RLS/policy changes.
- applying cleanup/drop/rename/type changes.

The next DB/Edge batch should not start until valid JWT smoke and component source matrix are ready in the branch.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Source preservation confused with UI parity | Parent item may be incorrectly marked complete | Keep source/read/API/UI gates separate |
| 401/403 falls back to static JSON | Unauthorized data exposure | Primary-safe must block fallback on auth/permission failure |
| CORS/network failure appears as fallback-eligible error | Static values may hide live API failure | QA must distinguish 401/403/CORS/network/5xx |
| Analysis/Pivot reuse Home dataset | Hidden static rows may drive derived analytics | Record source row counts feeding calculations |
| PDF mixes datasets | PDF can diverge from visible tabs | Verify every selected PDF block separately |
| `ll_work_platform_task_snapshots` grows over time | Archive table can become noisy | Later retention/index policy; no cleanup in this batch |
| New snapshot table mistaken for dashboard source | Wrong table in component evidence | Static QA should fail if dashboard read evidence includes snapshot table |
| User-specific task snapshot logic differs from common weekly snapshot logic | Past Task archive may vary by creator | Keep as known risk; decide later whether snapshot should be user-level or workspace-level |

## Improvements And Optimization

- Keep the source matrix as evidence under one parent checklist item instead of creating many new checklist rows.
- Add a small browser QA helper that exports component source status from runtime state:
  - component id
  - read action
  - basis date
  - source status
  - evidence tables
  - fallback reason
- Keep static JSON in the bundle only as constrained 5xx/network fallback until live parity is complete.
- For `ll_work_platform_task_snapshots`, later consider retention/index policy or archive export, but do not delete during primary migration work.
- For schema cleanup, never classify source evidence, permission, or audit tables as removable until Data Quality readback no longer depends on them.

## Current Completion Decision

`Supabase 마이그레이션 및 연결 완료` remains `in_progress`.

Completed inside this parent:

- Original Excel cell-level preservation.
- Fund Excel migration/readback.
- Live Google Sheets 17-tab cell-level preservation/readback.
- DB_일반 detail additive backfill/readback.
- Dashboard read API primary-safe bridge code exists.
- Work Platform weekly task snapshot table/API/UI path exists.

Still open:

- Valid logged-in JWT 200 smoke for Home/Asset/Company.
- Valid logged-in JWT smoke for Work Platform snapshot upsert/list.
- Component-level Supabase primary parity for Home/Asset/Company/PDF/Analysis/Pivot.
- Branch-only source matrix proof.
- User/browser visual QA list after code/API proof.
- Any future gh-pages/Edge/DB writes require explicit approval.
