# Gate 6 Supabase Schema Consolidation Cleanup Plan - 2026-05-21

## 현재 결론

테이블 수를 무조건 10개 내외로 맞추는 방식은 적용하지 않았습니다. 대신 실제 화면/Edge/API 사용처, 원본 보존 필요성, 권한/감사 기준으로 줄일 수 있는 테이블을 정리했습니다.

이번 batch에서 완료한 정리는 다음입니다.

- 시작 기준: `public.ll_*` 37개 테이블
- Phase 1 삭제 완료: `ll_worklogs`, `ll_dashboard_read_snapshots`
- Phase 2 삭제 완료: `ll_payload_snapshots`
- Phase 3 통합/삭제 완료:
  - `ll_dashboard_metric_snapshots` -> `ll_cache_entries(cache_type='dashboard_metric')`
  - `ll_external_api_cache` -> `ll_cache_entries(cache_type='external_api')`
- 현재 catalog: 34개 테이블, 618개 컬럼
- PK 누락: 0건
- FK index 누락: 0건
- RLS disabled: 0건
- cleanup candidate: 0건

## 새로 고정한 통합 구조

| 영역 | 테이블 | 판단 |
|---|---|---|
| Raw Source | `ll_source_cells`, `ll_sheet_rows`, `ll_import_runs`, `ll_source_field_registry`, `ll_source_review_logs` | 원본 Excel/Sheets 셀·행 추적 근거라 삭제 금지 |
| Core Normalized | `ll_assets`, `ll_tenants`, `ll_leases`, `ll_lease_spaces`, `ll_rent_history`, `ll_asset_managers` | 화면 KPI, 표, 차트의 기준 데이터라 유지 |
| Detail Normalized | `ll_lease_space_area_breakdowns`, `ll_lease_space_specs`, `ll_lease_special_terms` | DB_일반/DB_히스토리의 세부 항목 보존용이라 유지 |
| Fund | `ll_funds`, `ll_fund_asset_links`, `ll_fund_beneficiary_tranches`, `ll_fund_loan_tranches` | 펀드 정보 Excel 기준 구조라 유지 |
| Work Platform / Weekly | `ll_work_platform_tasks`, `ll_work_platform_board_posts`, `ll_work_platform_task_snapshots`, `ll_weekly_reports`, `ll_weekly_assets`, `ll_weekly_projects`, `ll_weekly_doc_ingest_runs`, `ll_issues` | 현재 UI 기능 테이블이라 유지 |
| Permission / Audit | `ll_user_permissions`, `ll_edit_requests`, `ll_data_change_audit_logs`, `ll_api_audit_logs`, `ll_data_quality_findings` | 권한, 승인, 감사 추적 테이블이라 삭제 금지 |
| Cache / Snapshot | `ll_cache_entries` | dashboard metric cache와 external API cache를 통합한 단일 캐시 테이블 |
| Metadata | `ll_schema_metadata` | table/column 역할, 분류, PK/FK metadata 보존 테이블 |
| Migration Safety | `ll_migration_row_backups` | 삭제/통합 전 원본 row 백업 테이블 |

## 이번 batch에서 삭제 또는 통합한 테이블

| 테이블 | 처리 | 안전장치 |
|---|---|---|
| `ll_worklogs` | DROP 완료 | 기존 기능은 `ll_work_platform_tasks`, `ll_work_platform_board_posts`로 대체됨 |
| `ll_dashboard_read_snapshots` | DROP 완료 | row 0, runtime 사용처 없음 |
| `ll_payload_snapshots` | 107행 백업 후 DROP 완료 | `ll_migration_row_backups`에 전체 row 백업 |
| `ll_dashboard_metric_snapshots` | 64행을 `ll_cache_entries`로 이관 후 DROP 완료 | dashboard metric key/value/source payload 보존 |
| `ll_external_api_cache` | 3행을 `ll_cache_entries`로 이관 후 DROP 완료 | provider/cache_key/request/response/expires/status 보존 |

## Metadata 반영

`ll_schema_metadata`를 생성해 Supabase 안에서 테이블과 컬럼의 역할을 조회할 수 있게 했습니다.

- `object_type='table'`: 36행
- `object_type='column'`: 646행
- 삭제된 legacy cache table 2개는 `is_active=false`로 남겨 이력을 보존합니다.
- 향후 다른 Supabase 테이블과 연결할 때 `domain_group`, `role_category`, `pk_columns`, `foreign_keys`를 기준으로 연결 후보를 판단할 수 있습니다.

## 외부 API 저장 전략

OpenDART, 건축물대장, Naver Geocoding의 provider 응답 cache는 더 이상 별도 테이블에 흩어져 있지 않고 `ll_cache_entries`로 통합했습니다.

- `cache_type='external_api'`
- `provider`: `opendart/company`, `building-register/summary`, `naver/geocode`
- `cache_key`: provider별 조회 key
- `request_payload`, `response_payload`, `provider_status`, `expires_at` 보존

정규화가 필요한 provider 결과는 추후 `ll_assets`, `ll_tenants` 또는 별도 normalized table에 반영하고, provider 원문/cache는 `ll_cache_entries`에 남기는 구조입니다.

## 권한/로그인 테이블

로그인 가능 사용자와 권한 판단 기준은 `public.ll_user_permissions`입니다.

- 현재 readback: 9행
- 역할: Permission / Audit
- 분류: delete_prohibited
- 프론트가 보낸 role/scope를 믿지 않고 Edge Function이 이 테이블을 다시 조회합니다.

자산 담당자 표시는 `public.ll_asset_managers`입니다.

- 현재 readback: 17행
- `manager_name`, `manager_team`, `manager_email`은 `260513_담당자별 권한 부여_수식 제거.xlsx` 기준으로 stale 조직명을 보정했습니다.

## QA 결과

- `npm run qa:supabase-catalog`: pass
- `npm run qa:logistics-primary-parity`: pass
- `npm run qa:data-quality-e2e`: pass
- `npm run qa:ai-chatbot`: pass
- `npm run qa:browser-visible-parity`: pass
- `npm run build:preview`: pass
- scoped ESLint: pass
- `git diff --check`: pass
- dropped table runtime reference grep: Edge/src runtime 0건

## 남긴 결정

- core dashboard data는 Supabase read API primary-safe 기준으로 동작합니다.
- 정적 JSON은 401/403 fallback으로 쓰지 않습니다.
- 일부 static JSON은 5xx/timeout 또는 print-safe 보조 fallback으로만 남겨두었습니다.
- gh-pages 운영 배포는 이번 batch에서 수행하지 않았습니다.
