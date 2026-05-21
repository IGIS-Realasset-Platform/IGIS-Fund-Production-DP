# Gate 6 progress tracker

- Updated: 2026-05-20
- Source of truth: `gate6-progress-tracker-20260515.json`
- Overall: 205 / 311 (65.9%)
- Active work branch: `codex/logistics-gate6-post-deploy-updates` on `preview` remote.
- Active branch is being audited for Supabase data-source coverage, dashboard data connection, and PDF Report map output before the next deploy batch.

| Stage | Area | Done/Total | Rate |
|---:|---|---:|---:|
| 2 | 공통 데이터 기준 | 14 / 23 | 60.9% |
| 3 | 업무 로그 메인 페이지 | 31 / 41 | 75.6% |
| 4 | Dashboard 공통 | 8 / 15 | 53.3% |
| 5 | Weekly source data after tab removal | 3 / 4 | 75.0% |
| 6 | Home 탭 | 33 / 41 | 80.5% |
| 7 | Asset 탭 | 18 / 28 | 64.3% |
| 8 | Company 탭 | 10 / 15 | 66.7% |
| 9 | Pivot Table | 12 / 13 | 92.3% |
| 10 | Data Quality | 15 / 21 | 71.4% |
| 11 | Analysis Tools | 6 / 9 | 66.7% |
| 12 | 승인대기 대상 | 22 / 29 | 75.9% |
| 13 | 외부권한대기 대상 | 5 / 11 | 45.5% |
| 14 | QA 계획 | 27 / 46 | 58.7% |
| 15 | 최종 완료 기준 | 1 / 15 | 6.7% |

## Latest Deployment Update

- Supabase-page source audit was added for the current branch. `weekly-assets/latest-preview` live Edge readback returns 20 latest management-project asset rows, including 아레나스양지.
- Home/Asset/PDF weekly asset helper data now prefers live `ll_weekly_assets` rows and only falls back to `logisticsWeeklyReportData.json` if the Edge readback returns no rows.
- Core Home/Asset/Company dashboard KPI/chart/table payloads still use static generated JSON snapshots and need a direct Supabase snapshot/data API connection in a later data-source task.
- Current batch 1-4 status: `ll_weekly_assets` live Edge readback remains 20 rows; Home monthly-cost/Arena Yangji static QA passes; Asset area/expiry QA script was updated for current object-shaped KPI payloads and passes 11/11.
- PDF Report map output now defaults into selected components, uses Asset overview coordinates as fallback, renders OpenStreetMap tile images for print/PDF, and waits for map images before opening print. Browser print-preview visual QA remains user-side.
- 메인 워크 플랫폼 상단 프로필은 사진 파일/URL이 없거나 로딩 실패 시 이니셜 대신 `default_avatar.svg` 기본 이미지로 표시됩니다.
- 관리 Project 현황은 이제 JSX seed가 아니라 Supabase `ll_weekly_assets` 최신 report 20행을 읽습니다.
- 별도 권한 row 추가 없이, 로그인한 회사 이메일 사용자는 preview/local 경로에서도 `weekly-assets/latest-preview`로 같은 20행을 받습니다.
- 내부 `Supabase readback` / `임시 seed` 경고 문구는 화면 번들에서 제거됐습니다.
- Evidence: `weekly-assets/latest-preview` live smoke `ok=true`, rows `20`, report `00000000-0000-0000-0000-000000260427`; live bundle `assets/index-C_752woL.js` has preview action and `has_seed_warning=false`.

## Current Data-Source Batch

- 기존 readback QA는 반복하지 않았습니다. 완료 근거로 재사용한 항목은 아레나스양지 월 임관리비 `2,468,703,091원`, 전체 월 임관리비 `13,050,719,577원`, DB_히스토리 누적 `162행` linkage, `ll_weekly_assets` `20행`, 경산 전용면적 `3건` 보정입니다.
- Home 핵심 payload 전환 범위는 KPI, 월 임관리비 비중, 용도별 비율, 계약 이력 기준 임대료 추이, 권역/만기 핵심값입니다. 현재 화면은 아직 `logisticsHomeData.json`과 Asset payload를 주로 사용하므로 Supabase read API 우선 전환이 남아 있습니다.
- Asset 핵심 payload 전환 범위는 자산 KPI, 임차인 현황, 면적 구성, 층별 배치, 만기 스냅샷, 자산개요·투자개요입니다. 아레나스양지/화성/부산송정 보정 흔적은 완료 근거로 쓰고, 남은 일은 정적 fallback 축소입니다.
- Company 핵심 payload 전환 범위는 기업 KPI, 임차 자산 현황, 회사별 임차 자산 지도, 자산별 노출도, DART 표시 영역입니다. 현재 `COMPANY_PAYLOADS` 정적 의존이 남아 있습니다.
- 스키마 정리 후보는 삭제 실행 없이 사용처·위험·rollback/readback 필요 여부만 심화했습니다. 실제 DB 삭제, migration, Edge 배포, gh-pages 배포는 이번 배치에서 수행하지 않았습니다.

## Current Excel Migration Gap Batch

- 원본 Excel `★ 260414_물류센터 임대차계약 DB_취합본.xlsx`를 현재 파일 기준으로 재 inventory했습니다. 결과는 5개 시트, 388행, used range `13,752`셀, non-empty `8,627`셀, formula `941`셀입니다.
- Supabase qveg read-only 조회로 `ll_source_cells`가 xlsx 5개 시트 `13,752`셀을 현재도 보존하고 있음을 확인했습니다. 따라서 원본 Excel cell-level 추적 근거는 있습니다.
- 하지만 이 결과는 “원본 Excel의 모든 항목이 정규화 테이블과 화면에 연결됐다”는 뜻이 아닙니다. DB_일반 82개 field-like columns 중 세부면적, 임차인 요구 스펙, 보험/특수조건, 계약 상태/특수조건은 전용 정규 테이블 또는 editable JSONB/field registry 보강이 필요합니다.
- `DB_히스토리 누적`은 `ll_rent_history` 163행, source row id 163행, contract-space link 162행으로 읽히지만 `monthly_rent_total` null 1건, `monthly_mf_total` null 34건이 남아 있어 전부 정상 정규화 완료로 볼 수 없습니다.
- live Google Sheets는 현재 `ll_sheet_rows` 기준 5개 시트 347행만 확인됐고, 사용자가 요구한 17탭 cell-level manifest 완료 증거는 아직 없습니다.
- Evidence: `excel-full-source-inventory-20260520`, `excel-supabase-current-readonly-20260520.sql`, `excel-supabase-migration-gap-20260520.md`.

## Current Shadow Migration / API Rollout Batch

- Additive-only migration applied to qveg: `ll_source_field_registry`, `ll_lease_space_area_breakdowns`, `ll_lease_space_specs`, `ll_lease_special_terms`, `ll_source_review_logs`, `ll_dashboard_read_snapshots`, plus nullable source-cell manifest support columns.
- Existing baseline row counts stayed unchanged after migration: `ll_source_cells=13,752`, `ll_assets=17`, `ll_tenants=36`, `ll_leases=45`, `ll_lease_spaces=80`, `ll_rent_history=163`, `ll_weekly_assets=20`.
- Source field registry readback: `DB_일반=82`, `DB_히스토리 누적=18`. `DB_히스토리 누적` field header is row 10 `B:S`; row 14 is unit/source context.
- Edge Function `ll-dashboard-api` was deployed with shadow read actions: `dashboard/home/read`, `dashboard/asset/read`, `dashboard/company/read`, `dashboard/read`.
- Frontend is still static-primary and Supabase-shadow. Static JSON fallback remains in place; 401/403 read failures are recorded as `fallback_allowed=false`.
- QA: `git diff --check` pass, scoped `WorkspaceLogistics.jsx` eslint pass, `npm run build:preview` pass, Edge OPTIONS 200, unauth dashboard read 401, weekly assets preview 20 rows, live `gh-pages` asset 200 with `index-Dl7ZzjiC.js`, live JS secret-pattern scan 0 hits.
- Remaining before primary: valid logged-in JWT smoke for `dashboard/*/read`, shadow diff review in the browser console, live Sheets 17-tab cell manifest append/readback, and user manual browser QA.

## Current Fund Overview / Additive Migration Batch

- Additive-only fund migration was dry-run with rollback, then applied to qveg: `ll_funds`, `ll_fund_asset_links`, `ll_fund_beneficiary_tranches`, `ll_fund_loan_tranches`.
- Existing baseline row counts stayed unchanged after migration: `ll_source_cells=13,752`, `ll_assets=17`, `ll_tenants=36`, `ll_leases=45`, `ll_lease_spaces=80`, `ll_rent_history=163`, `ll_weekly_assets=20`.
- Fund readback: `ll_funds=15`, `ll_fund_asset_links=17`; ??????, ??????, ?????????? share fund code `112527` / `??????????????????404?`.
- Asset tab now expands `???? ? ????` into `???? ? ???? ? ????`. Fund overview is collapsed by default and includes fund information, beneficiary tranche rows, and lender tranche rows.
- Edge Function `ll-dashboard-api` was deployed with `funds/read-by-asset`, `funds/save-by-asset`, and `dashboard/asset/read` fund_overview extension. Unauthenticated fund read smoke returns 401.
- PDF Report Asset overview now includes fund overview rows. Browser visual QA for actual logged-in fund save and PDF display remains user-side.
- QA: scoped ESLint pass, `npm run build:preview` pass, `git diff --check` pass, dist secret-pattern scan 0 hits, weekly-assets preview live smoke `ok=true`, rows `20`.

## Current Schema Restructure / Cleanup Planning Batch

- Cleanup 후보표만으로는 부족했던 부분을 보강해 `supabase-schema-restructure-plan-20260520.md`를 추가했습니다.
- 목표 구조를 `Raw Source`, `Core Normalized`, `Detail Normalized`, `Weekly / Work Platform`, `Permission / Audit`, `Cache / Snapshot`, `Legacy Candidate`로 분리했습니다.
- 삭제/정리 대상은 즉시 실행하지 않고, detail normalized table populate preview → dashboard primary 전환 → 캐시/legacy 사용처 제거 → SQL preview/rollback/readback/승인 순서로 정리합니다.

## Current Fund Safe Transition Batch

- 이번 배치는 `gh-pages` 배포본은 건드리지 않고, qveg Supabase DB와 live Edge Function만 안전 전환 범위로 적용했습니다.
- Baseline 보호 기준은 `deployment-protection-baseline-20260520.md`에 고정했습니다. 주요 보존 기준은 `ll_source_cells=13,752`, `ll_assets=17`, `ll_tenants=36`, `ll_leases=45`, `ll_lease_spaces=80`, `ll_rent_history=163`, `ll_weekly_assets=20`, `ll_funds=15`, `ll_fund_asset_links=17`입니다.
- `260520_물류센터 펀드 정보.xlsx`는 3개 시트, workbook hash `44fad30f487bfa0dc01f5497a386dae4880b899595d5b704b9f7a87c723364a7`로 inventory했습니다. 시트별 used range는 `펀드 정보=B2:L20`, `수익자 정보=B2:H55`, `대주 정보=B2:Q54`입니다.
- 펀드 엑셀 backfill SQL을 qveg Supabase에 적용했고 readback 기준 `ll_source_cells=1,435`, `ll_source_field_registry=34`, `ll_funds=15`, `ll_fund_asset_links=17`, `ll_fund_beneficiary_tranches=52`, `ll_fund_loan_tranches=51`, `ll_import_runs=1` 모두 expected와 일치했습니다.
- 기존 핵심 row count 감소는 없습니다. 적용 후 `ll_source_cells=15,187`, `ll_assets=17`, `ll_tenants=36`, `ll_leases=45`, `ll_lease_spaces=80`, `ll_rent_history=163`, `ll_weekly_assets=20`입니다.
- 직접 적용한 `20260520092911` SQL은 remote migration history에 `applied`로 repair해 이후 `db push` 중복 실행 위험을 낮췄습니다.
- 추가 무결성 readback 결과 orphan source cell/link/tranche는 0건이고, 대주 `인출시점`/`만기시점` 날짜 파싱 null도 0건입니다.
- `funds/save-by-asset`는 live table 직접 write가 아니라 `ll_edit_requests` 승인 요청으로 접수하고, `edits/approve`에서 `fund_overview` 요청을 자산별 write 권한 재검증, 동시 승인 claim, readback/stale 차단, audit 포함 writer로 처리하도록 live Edge Function `ll-dashboard-api`에 배포했습니다.
- Asset/PDF 펀드개요는 조회 결과가 오기 전에는 정적 fallback을 먼저 보여주지 않고, 401/403 권한 실패 시에도 정적 JSON fallback으로 우회하지 않도록 branch 프론트 코드를 보강했습니다.
- 화면 데이터 소스 영향은 `dashboard-data-source-impact-matrix-20260520.md`로 정리했습니다. Home/Asset/Company/PDF/Analysis/Pivot/Data Quality는 아직 정적 JSON fallback을 제거하지 않습니다.
- Batch status: `Supabase 마이그레이션 및 연결 완료` parent item은 진행중입니다. 완료된 증거는 펀드 엑셀 DB backfill/readback, live Edge deploy, CORS OPTIONS 200, unauth 401 smoke, scoped WorkspaceLogistics eslint pass, `npm run build:preview` pass입니다. Reviewer 재검토로 발견된 fallback 선노출, 승인자 자산별 권한, 동시 승인, 빈 배열 clear 위험은 즉시 보강했습니다. 남은 것은 Home/Asset/Company 핵심 payload의 Supabase primary 전환과 로그인 JWT 기반 화면 smoke입니다.
- 기존 주의사항은 보고용이 아니라 처리 대기 작업으로 재분류했습니다: 전역 lint cleanup, valid JWT read smoke, Home/Asset/Company primary 전환, live Sheets 17탭 cell-level 보존.

## Branch-Only Supabase Primary Continuation - 2026-05-21

- 현재 이후 작업은 사용자 지시에 따라 브랜치 전용입니다. `gh-pages` 배포, Edge Function 배포, Supabase write/migration/RLS/policy 변경은 명시 승인 전 실행하지 않습니다.
- `Supabase 마이그레이션 및 연결 완료`는 하나의 parent 업무로 계속 관리합니다. 내부 증거는 산출물로 남기되 체크리스트 분모를 불필요하게 늘리지 않습니다.
- live Google Sheets 17탭 `181,470`셀은 used range 안의 빈 셀까지 포함한 cell-level 보존 숫자입니다. 이는 원본 증거 보존 통과를 의미하지만, 화면이 Supabase primary 값을 쓴다는 의미는 아닙니다.
- 새로 생긴 `ll_work_platform_task_snapshots`는 Work Platform / 지난 Task 관리 아카이브 전용 테이블입니다. Home/Asset/Company/PDF/Analysis/Pivot 숫자 source로 쓰면 안 됩니다.
- 정적 검사 결과 `ll_work_platform_task_snapshots`는 Edge Function의 task snapshot 함수와 Work Platform archive 호출부에서만 확인됐고, dashboard read 함수의 직접 source로는 확인되지 않았습니다.
- 추가 산출물:
  - `qa-artifacts/logistics-gate6/supabase-primary-branch-only-plan-20260521.md`
  - `qa-artifacts/logistics-gate6/dashboard-primary-source-static-audit-20260521.md`
- 남은 완료 조건은 valid logged-in JWT smoke와 Home/Asset/Company/PDF/Analysis/Pivot 컴포넌트별 Supabase primary parity입니다.

## Branch-Only JWT / Primary Parity Execution - 2026-05-21

- `scripts/qa/logistics-dashboard-jwt-smoke.cjs`를 보강했습니다. 이제 `LOGISTICS_SUPABASE_ACCESS_TOKEN`뿐 아니라 `LOGISTICS_SUPABASE_EMAIL` + `LOGISTICS_SUPABASE_PASSWORD`로도 실제 로그인 JWT를 받아 smoke를 실행할 수 있습니다.
- JWT smoke는 더 이상 HTTP 200만 보지 않습니다. `ok=true`, `source=supabase`, `version=ll-dashboard-payload-v1`, `basis_date=2026-04-30`, `scope_hash`, `evidence.tables`, snapshot upsert/list readback까지 확인합니다.
- `scripts/qa/logistics-dashboard-primary-parity.cjs`와 `npm run qa:logistics-primary-parity`를 추가했습니다. Home/Asset/Company/PDF/Analysis/Pivot별 Supabase read path, fallback policy, residual static dependency를 산출물로 남깁니다.
- 실행 결과: static wiring과 401/403 fallback 차단 구조는 pass입니다. 다만 현재 로컬 작업환경에 `LOGISTICS_SUPABASE_ACCESS_TOKEN` 또는 `LOGISTICS_SUPABASE_EMAIL`/`LOGISTICS_SUPABASE_PASSWORD`가 없어 valid logged-in runtime 200 smoke는 실행하지 못했습니다.
- 산출물:
  - `qa-artifacts/logistics-gate6/dashboard-primary-parity-20260521.json`
  - `qa-artifacts/logistics-gate6/dashboard-primary-parity-20260521.md`
- 검증:
  - `npm run qa:logistics-primary-parity`: 실행 완료, runtime은 `blocked_missing_credentials`
  - `npm run qa:logistics-jwt-smoke`: credentials 없음으로 정상 차단
  - `npx eslint scripts/qa/logistics-dashboard-jwt-smoke.cjs scripts/qa/logistics-dashboard-primary-parity.cjs`: pass
  - `npm run build:preview`: pass
  - `git diff --check`: pass, line-ending warning only
- 판정: `Supabase 마이그레이션 및 연결 완료`는 계속 `in_progress`입니다. 코드 연결과 fallback 방어는 확인했지만, 실제 로그인 JWT 200 smoke와 runtime component parity가 없으므로 완료로 표시하지 않습니다.

## Logged-In JWT Smoke Completed - 2026-05-21

- `.env.local`에 들어온 로그인 정보를 사용해 password grant 방식으로 실제 로그인 JWT smoke를 실행했습니다. 비밀번호와 토큰은 출력하지 않았습니다.
- `npm run qa:logistics-jwt-smoke`: pass
  - `dashboard/home/read`: 200, readable assets 17, `ll_lease_spaces` 80, `ll_rent_history` 163
  - `dashboard/asset/read`: 200, selected asset evidence includes `ll_funds` 1, `ll_fund_asset_links` 1, `ll_lease_spaces` 14
  - `dashboard/company/read`: 200, selected tenant evidence includes `ll_assets` 1, `ll_lease_spaces` 1, `ll_rent_history` 10
  - `work-platform/tasks/snapshots/upsert-current`: 200, `week_key=2026-04-27`, `task_count=0`
  - `work-platform/tasks/snapshots/list`: 200
  - unauthenticated `dashboard/home/read`: 401
- `npm run qa:logistics-primary-parity`: pass
  - Home/Asset/Company API runtime parity smoke가 pass로 갱신됐습니다.
  - PDF/Analysis/Pivot은 Supabase read path wiring과 fallback policy가 pass입니다.
  - 단, PDF/Analysis/Pivot은 브라우저에서 실제 렌더링 컴포넌트 값까지 본 것은 아니므로 manual/browser-visible parity는 별도 남습니다.
- 산출물 갱신:
  - `qa-artifacts/logistics-gate6/jwt-smoke-result-20260521.json`
  - `qa-artifacts/logistics-gate6/dashboard-primary-parity-20260521.json`
  - `qa-artifacts/logistics-gate6/dashboard-primary-parity-20260521.md`
- 판정: 반복적으로 밀리던 실제 로그인 JWT smoke와 Home/Asset/Company API runtime parity는 완료했습니다. `Supabase 마이그레이션 및 연결 완료` parent는 residual static dependency cleanup 및 브라우저 visible parity가 남아 계속 `in_progress`입니다.

## Current Dashboard Read API / Primary-Safe Bridge Batch

- `dashboard/asset/read`는 요청한 자산이 읽기 권한 밖이면 첫 번째 readable asset으로 대체하지 않고 403으로 차단하도록 보강했습니다.
- `dashboard/company/read`는 readable asset의 lease space에서 파생된 tenant만 조회하도록 바꿔 권한 밖 tenant 존재 여부가 새지 않게 했습니다.
- `dashboard/home/read`, `dashboard/asset/read`, `dashboard/company/read`의 성공 audit은 더 이상 실패를 무시하지 않습니다. 권한 거부 path도 `dashboard/*/read/denied` audit을 남기도록 보강했습니다.
- Branch frontend에는 `useDashboardReadBridge`와 Home/Asset/Company adapter를 추가했습니다. `shadow`, `api-preview`, `primary-safe` 모드를 지원하되, live 기본값은 보호를 위해 `shadow`로 유지했습니다.
- 401/403 및 shape/basis/evidence mismatch에서는 정적 JSON fallback을 차단합니다. 5xx/timeout/network 계열만 제한적으로 fallback 허용합니다.
- Home blocked 상태에서 `homeData`, `staticGeneralRows`, `assetOptionsData`가 섞여 보이는 경로를 막았습니다.
- `dashboard/*/read` 응답에 scoped `ll_leases`, `ll_tenants`를 포함해 계약일, 임차인명, 사업자번호를 정적 JSON 보정보다 Supabase 응답에서 먼저 쓰도록 보강했습니다.
- QA: `git diff --check` pass, scoped `WorkspaceLogistics.jsx` eslint pass, `npm run build:preview` pass, dist secret-pattern scan 0 hits, live Edge deploy pass, Edge OPTIONS 200, unauth dashboard/home/read and dashboard/asset/read 401.
- Reviewer 판정: Security/API와 Data/Frontend reviewer 기준으로 방향은 맞으나, Home derived chart series/PDF scope/Company selector 일부는 아직 static-mixed입니다. `Supabase 마이그레이션 및 연결 완료` parent item은 계속 진행중이며, valid logged-in JWT 200 smoke와 화면별 Supabase primary parity가 남아 있습니다.
