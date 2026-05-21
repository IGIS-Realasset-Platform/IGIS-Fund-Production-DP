# Dashboard Primary Parity Runtime Gate - 2026-05-21

## Scope

- Parent item: `Supabase 마이그레이션 및 연결 완료`
- Mode: branch-only
- Target: Home / Asset / Company / PDF Report / Analysis Tools / Pivot Table

## What Was Checked

Static wiring and fallback policy were checked by:

- `npm run qa:logistics-primary-parity`
- Result JSON: `qa-artifacts/logistics-gate6/dashboard-primary-parity-20260521.json`

Build and syntax guard:

- `npm run build:preview`: pass
- `git diff --check`: pass, only line-ending warnings
- `npx eslint scripts/qa/logistics-dashboard-jwt-smoke.cjs scripts/qa/logistics-dashboard-primary-parity.cjs`: pass
- Syntax guard for both QA scripts: pass

## Static Wiring Result

| Area | Read path | Wiring status | Primary readiness |
|---|---|---|---|
| Home | `dashboard/home/read` | pass | partial primary-safe |
| Asset | `dashboard/asset/read` | pass | partial primary-safe |
| Company | `dashboard/company/read` | pass | partial primary-safe |
| PDF Report | `dashboard/home/read` + `dashboard/asset/read` | pass | partial primary-safe |
| Analysis Tools | shared `dashboard/home/read` dataset | pass | partial primary-safe |
| Pivot Table | shared `dashboard/home/read` dataset | pass | partial primary-safe |

`primary-safe` means:

- Supabase read API is attempted first.
- 401/403 auth or permission failure is blocked.
- Static JSON is not allowed to appear after auth/permission failure.
- Static JSON can still be used only for fallback-eligible 5xx/network/timeout situations.

## Runtime Gate Status

Runtime JWT smoke is now closed for the current branch QA scope.

Executed commands:

- `npm run qa:logistics-jwt-smoke`
- `npm run qa:logistics-primary-parity`

Auth source:

- `password_grant`
- User is redacted in script output.

Runtime result:

- `dashboard/home/read`: 200
- `dashboard/asset/read`: 200
- `dashboard/company/read`: 200
- `work-platform/tasks/snapshots/upsert-current`: 200
- `work-platform/tasks/snapshots/list`: 200
- unauthenticated `dashboard/home/read`: 401

Runtime evidence:

| Action | Status | Key evidence |
|---|---:|---|
| `dashboard/home/read` | 200 | 17 readable assets, 80 lease spaces, 163 rent history rows |
| `dashboard/asset/read` | 200 | 1 asset, 1 fund, 14 lease spaces, 16 rent history rows |
| `dashboard/company/read` | 200 | 1 tenant, 1 asset, 1 lease space, 10 rent history rows |
| `work-platform/tasks/snapshots/upsert-current` | 200 | week key `2026-04-27`; task count `0` |
| `work-platform/tasks/snapshots/list` | 200 | snapshot list reachable |
| unauth `dashboard/home/read` | 401 | unauthenticated request blocked |

Note:

- The snapshot smoke permits an empty current-user task snapshot. The Edge API filters empty snapshot rows from list results, so list readback is only week-key strict when the upserted `task_count` is greater than 0.

## Residual Static Dependencies

These are not treated as failures yet, but they prevent claiming "fully Supabase primary" without runtime proof:

- Home still has `sectorData` and `weeklyReportData` fallback/enrichment paths.
- Asset still has `ASSET_PAYLOADS` and weekly management project fallback paths.
- Company still has `COMPANY_PAYLOADS` and company option fallback paths.
- PDF Report still composes Home/Asset reads with selected asset and weekly fallback paths.
- Analysis Tools and Pivot Table inherit the shared Home dataset, so if Home falls back they can silently compute from fallback rows.

## Decision

`Supabase 마이그레이션 및 연결 완료` remains `in_progress`, but the repeated JWT smoke blocker is now resolved.

Current status is:

- Code wiring: pass
- Fallback auth safety: pass by static check
- Build/script QA: pass
- Runtime valid JWT smoke: pass
- Home/Asset/Company API runtime parity smoke: pass
- PDF/Analysis/Pivot source wiring: pass by static/component source check
- Remaining: browser-visible component parity and residual static dependency cleanup if full primary-only operation is required
