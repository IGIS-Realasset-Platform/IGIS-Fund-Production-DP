# Dashboard Read Primary-Safe Bridge QA - 2026-05-21

## Scope

- Parent item: `Supabase 마이그레이션 및 연결 완료`
- Files changed:
  - `src/components/system/workspace/WorkspaceLogistics.jsx`
  - `supabase/functions/ll-dashboard-api/index.ts`

## Implemented

- Added `useDashboardReadBridge` with `shadow`, `api-preview`, and `primary-safe` modes.
- Added Home/Asset/Company adapters from `dashboard/*/read` Supabase raw response to existing screen payload shape.
- Kept frontend default mode as `shadow` to protect current branch/live users until valid JWT browser smoke passes.
- Blocked static JSON fallback for:
  - 401/403 auth or permission failure
  - API shape mismatch
  - basis date mismatch
  - missing evidence tables
- Allowed static JSON fallback only for constrained server/network failure cases:
  - 5xx
  - timeout
  - network/fetch failure
- Fixed Home blocked state so `homeData`, `staticGeneralRows`, and `assetOptionsData` do not leak into visible calculations.
- Hardened Edge API:
  - `dashboard/asset/read` no longer substitutes an unauthorized requested asset with the first readable asset.
  - `dashboard/company/read` only queries tenants exposed through readable asset lease spaces.
  - `dashboard/home/read`, `dashboard/asset/read`, and `dashboard/company/read` now include scoped `ll_leases` and `ll_tenants` rows so the screen can prefer Supabase contract dates, tenant names, and business registration numbers instead of static JSON enrichment.
  - `dashboard/*/read` success audit is awaited.
  - `dashboard/*/read/denied` audit is written for direct denied paths.

## Verification

- `git diff --check`: pass
- `npx eslint src/components/system/workspace/WorkspaceLogistics.jsx --max-warnings=0`: pass
- `npm run build:preview`: pass
- dist secret scan for service role/API key patterns: 0 hits
- Edge deploy: `ll-dashboard-api` deployed to `qvegpozwrcmspdvjokiz`
- Edge response enrichment: `ll_leases` and `ll_tenants` are included in dashboard read payload evidence and adapter mapping.
- Edge CORS smoke:
  - URL: `https://qvegpozwrcmspdvjokiz.supabase.co/functions/v1/ll-dashboard-api`
  - Origin: `https://kylee94.github.io`
  - Result: OPTIONS 200, `access-control-allow-origin=https://kylee94.github.io`
- Edge unauth smoke:
  - Action: `dashboard/home/read`, `dashboard/asset/read`
  - Result: 401, `Missing authorization header`

## Reviewer Follow-Up

- Security/API reviewer: Asset/Company server-side scope hardening is acceptable, but Home static leak had to be fixed.
- Data reviewer: API raw payload needed richer fields before pure API-only parity. This batch added `ll_leases` and `ll_tenants`; remaining static-mixed areas are Home derived chart series and PDF scope alignment.
- Frontend/QA reviewer: Keep default in `shadow` until valid logged-in JWT 200 smoke and browser parity evidence exist.

## Remaining

- Valid logged-in JWT 200 smoke for:
  - `dashboard/home/read`
  - `dashboard/asset/read`
  - `dashboard/company/read`
- Browser console capture of `window.__logisticsDashboardShadowDiffs`.
- Home/Asset/Company section-by-section classification:
  - API-derived
  - static-derived
  - mixed
- PDF Report and Company selector still need Supabase scope alignment before final primary-safe completion.

## 2026-05-21 Update

- Frontend default mode is now `primary-safe`, not `shadow`.
- The bridge still blocks static JSON fallback on 401/403, shape mismatch, basis-date mismatch, and missing evidence.
- Static JSON remains only as constrained fallback for 5xx, timeout, and network/fetch failure.
- `ll-dashboard-api` was redeployed to qveg as version 44 after dashboard detail payload enrichment.
- Live CORS smoke from `https://kylee94.github.io` passed:
  - OPTIONS 200
  - `access-control-allow-origin=https://kylee94.github.io`
- Unauthenticated/anon dashboard read smoke passed as a fail-closed check:
  - `dashboard/home/read` returned 401
  - response preview: `Invalid Authorization token`
- Dist/source secret scan for concrete key patterns returned 0 hits:
  - `sb_secret_*`
  - `AIza*`
  - `gsk_*`
  - `sk-*`
- `npm run build:preview`, scoped ESLint, and `git diff --check` passed.

## 2026-05-21 Detail Payload Enrichment

- `dashboard/home/read`, `dashboard/asset/read`, and `dashboard/company/read` now include additive DB detail rows:
  - `lease_space_area_breakdowns`
  - `lease_space_specs`
  - `lease_special_terms`
- API evidence includes the new detail tables:
  - `public.ll_lease_space_area_breakdowns`
  - `public.ll_lease_space_specs`
  - `public.ll_lease_special_terms`
- Asset adapter now maps `lease_space_area_breakdowns` into Asset/PDF area composition fields.
- Readback after additive backfill:
  - `ll_lease_space_area_breakdowns`: 387 rows, 387 source-linked
  - `ll_lease_space_specs`: 513 rows, 513 source-linked
  - `ll_lease_special_terms`: 1,758 rows, 1,758 source-linked
  - `ll_source_review_logs`: 35 rows, 35 source-linked
- Core row-count guard after backfill:
  - `ll_source_cells`: 196,657
  - `ll_assets`: 17
  - `ll_tenants`: 36
  - `ll_leases`: 45
  - `ll_lease_spaces`: 80
  - `ll_rent_history`: 163
  - `ll_weekly_assets`: 20

## Still Not Closed

- Valid logged-in JWT 200 smoke still needs an actual logged-in access token or a test account password.
- Home derived chart series, PDF scope alignment, Analysis Tools, and Pivot Table still need section-level proof that no static-primary value remains.
- Therefore the parent item remains `in_progress`, not `complete`.
