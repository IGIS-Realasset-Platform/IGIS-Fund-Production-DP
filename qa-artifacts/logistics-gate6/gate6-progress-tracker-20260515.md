# Gate 6 progress tracker

- Updated: 2026-05-20
- Source of truth: `gate6-progress-tracker-20260515.json`
- Overall: 189 / 291 (64.9%)
- Active work branch: `codex/logistics-gate6-post-deploy-updates` on `preview` remote.
- Active branch is being audited for Supabase data-source coverage, dashboard data connection, and PDF Report map output before the next deploy batch.

| Stage | Area | Done/Total | Rate |
|---:|---|---:|---:|
| 2 | 공통 데이터 기준 | 12 / 21 | 57.1% |
| 3 | 업무 로그 메인 페이지 | 31 / 41 | 75.6% |
| 4 | Dashboard 공통 | 8 / 15 | 53.3% |
| 5 | Weekly source data after tab removal | 3 / 4 | 75.0% |
| 6 | Home 탭 | 33 / 41 | 80.5% |
| 7 | Asset 탭 | 15 / 24 | 62.5% |
| 8 | Company 탭 | 10 / 15 | 66.7% |
| 9 | Pivot Table | 12 / 13 | 92.3% |
| 10 | Data Quality | 15 / 20 | 75.0% |
| 11 | Analysis Tools | 6 / 9 | 66.7% |
| 12 | 승인대기 대상 | 17 / 23 | 73.9% |
| 13 | 외부권한대기 대상 | 5 / 11 | 45.5% |
| 14 | QA 계획 | 21 / 39 | 53.8% |
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
