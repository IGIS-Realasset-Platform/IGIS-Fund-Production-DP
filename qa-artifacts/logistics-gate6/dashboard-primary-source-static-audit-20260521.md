# Dashboard Primary Source Static Audit - 2026-05-21

## Scope

- Parent checklist item: `Supabase 마이그레이션 및 연결 완료`
- Work mode: branch-only
- Purpose: confirm the current branch wiring before any live deployment or DB/Edge mutation.

## Static Audit Result

### Dashboard read API boundaries

Relevant Edge Function entry points:

| Action | Function line | Current role in primary migration |
|---|---:|---|
| `dashboard/home/read` | `supabase/functions/ll-dashboard-api/index.ts:906` | Home, Analysis Tools, Pivot Table, PDF shared dataset |
| `dashboard/asset/read` | `supabase/functions/ll-dashboard-api/index.ts:990` | Asset tab and PDF asset blocks |
| `dashboard/company/read` | `supabase/functions/ll-dashboard-api/index.ts:1087` | Company tab |
| `work-platform/tasks/snapshots/upsert-current` | `supabase/functions/ll-dashboard-api/index.ts:2200` | Work Platform task archive only |
| `work-platform/tasks/snapshots/list` | `supabase/functions/ll-dashboard-api/index.ts:2274` | Past Task archive only |

### Snapshot table isolation

`ll_work_platform_task_snapshots` appears only in the Work Platform task snapshot functions in the Edge Function file:

- `supabase/functions/ll-dashboard-api/index.ts:2253`
- `supabase/functions/ll-dashboard-api/index.ts:2261`
- `supabase/functions/ll-dashboard-api/index.ts:2278`

No direct reference to `ll_work_platform_task_snapshots` was found in the Home/Asset/Company dashboard read functions.

Frontend occurrence:

- `src/components/system/workspace/WorkspaceLogistics.jsx:3977` calls `work-platform/tasks/snapshots/upsert-current`.
- `src/components/system/workspace/WorkspaceArchive.jsx:120` calls `work-platform/tasks/snapshots/list`.

Conclusion:

- The snapshot table is currently isolated to Work Platform / archive behavior.
- It is not a dashboard KPI, chart, map, PDF, Analysis Tools, or Pivot Table source.
- This satisfies the static isolation check, but logged-in smoke is still required to prove the runtime API behavior.

## Current Frontend Read Paths

| Screen / feature | Branch read path | Static fallback still exists? | Status |
|---|---|---:|---|
| Home | `useDashboardReadBridge('dashboard/home/read')` at `WorkspaceLogistics.jsx:5580` | Yes | Needs runtime parity |
| Shared Home dataset | `useDashboardHomeReadDataset` at `WorkspaceLogistics.jsx:572` | Yes | Used by downstream tools |
| Company | `useDashboardReadBridge('dashboard/company/read')` at `WorkspaceLogistics.jsx:7270` | Yes | Needs tenant scope smoke |
| Analysis Tools | `useDashboardHomeReadDataset` at `WorkspaceLogistics.jsx:7513` | Yes | Needs derived metric parity |
| Pivot Table | `useDashboardHomeReadDataset` at `WorkspaceLogistics.jsx:7777` | Yes | Needs source row-count parity |
| Asset | `useDashboardReadBridge('dashboard/asset/read')` at `WorkspaceLogistics.jsx:9123` | Yes | Needs selected asset smoke |
| PDF Report | `useDashboardHomeReadDataset` at `WorkspaceLogistics.jsx:9477`; `dashboard/asset/read` at `WorkspaceLogistics.jsx:9524` | Yes | Needs block-by-block parity |

Static JSON imports still exist:

- `src/components/system/workspace/WorkspaceLogistics.jsx:9` imports `logisticsHomeData.json`.
- `src/components/system/workspace/WorkspaceLogistics.jsx:17` imports `logisticsAssetData/*.json`.
- `src/components/system/workspace/WorkspaceLogistics.jsx:34` imports `logisticsCompanyData/*.json`.

This is expected during `primary-safe` rollout. The remaining verification is to prove that static JSON is only fallback for network/5xx/timeout cases, and never visible after 401/403.

## Required Next Evidence

This static audit is not enough to close the parent item. The next evidence must be runtime evidence:

1. Valid logged-in JWT smoke:
   - `dashboard/home/read` 200
   - `dashboard/asset/read` 200
   - `dashboard/company/read` 200
   - `work-platform/tasks/snapshots/upsert-current` 200
   - `work-platform/tasks/snapshots/list` 200
2. Negative auth smoke:
   - no token 401
   - unauthorized asset/company 403 or 404
   - no static fallback values after 401/403
3. Component parity:
   - Home
   - Asset
   - Company
   - PDF Report
   - Analysis Tools
   - Pivot Table

## Branch QA Helper Added

- Script: `scripts/qa/logistics-dashboard-jwt-smoke.cjs`
- Package command: `npm run qa:logistics-jwt-smoke`
- Required input: `LOGISTICS_SUPABASE_ACCESS_TOKEN`
- It calls:
  - `dashboard/home/read`
  - `dashboard/asset/read`
  - `dashboard/company/read`
  - `work-platform/tasks/snapshots/upsert-current`
  - `work-platform/tasks/snapshots/list`
  - unauthenticated `dashboard/home/read` as a negative 401 check
- It redacts the project hostname in output and does not print the token.
- It does not perform deployment or schema changes.

## Decision

`Supabase 마이그레이션 및 연결 완료` remains `in_progress`.

Static source isolation for `ll_work_platform_task_snapshots` is passing, but primary completion cannot be claimed until JWT smoke and component parity pass.
