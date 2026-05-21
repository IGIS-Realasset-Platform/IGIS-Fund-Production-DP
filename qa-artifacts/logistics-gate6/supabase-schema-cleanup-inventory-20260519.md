# Supabase ll_* Schema Cleanup Inventory

- 기준 프로젝트: `qvegpozwrcmspdvjokiz`
- 작성일: 2026-05-19
- 최신 재구조화 계획: `qa-artifacts/logistics-gate6/supabase-schema-restructure-plan-20260520.md`
- 범위: `public.ll_*` 테이블 read-only inventory
- 금지: 이 문서는 삭제 실행 문서가 아닙니다. `ALTER/DROP/DELETE`는 사용처 0건 확인, rollback SQL, readback query, 사용자 승인 후 별도 실행합니다.

## Row Count Readback

| 테이블 | 추정 row |
|---|---:|
| ll_api_audit_logs | 93 |
| ll_asset_managers | 17 |
| ll_assets | 17 |
| ll_dashboard_metric_snapshots | 64 |
| ll_data_change_audit_logs | 0 |
| ll_data_quality_findings | 51 |
| ll_edit_requests | 0 |
| ll_external_api_cache | 3 |
| ll_import_runs | 2 |
| ll_issues | 42 |
| ll_lease_spaces | 80 |
| ll_leases | 45 |
| ll_payload_snapshots | 107 |
| ll_rent_history | 163 |
| ll_sheet_rows | 347 |
| ll_source_cells | 13,752 |
| ll_tenants | 36 |
| ll_user_permissions | 6 |
| ll_weekly_assets | 20 |
| ll_weekly_doc_ingest_runs | 0 |
| ll_weekly_projects | 5 |
| ll_weekly_reports | 1 |
| ll_work_platform_board_posts | 1 |
| ll_work_platform_tasks | 1 |
| ll_worklogs | 0 |

## 1차 분류

| 분류 | 테이블/컬럼 | 판정 |
|---|---|---|
| 필수 원본 보존 | `ll_source_cells`, `ll_sheet_rows` | 삭제 금지. Excel/Sheets cell-level 보존 근거입니다. |
| 필수 정규화 | `ll_assets`, `ll_tenants`, `ll_lease_spaces`, `ll_leases`, `ll_rent_history`, `ll_asset_managers` | 유지. 다만 `source_payload`, `review_status`, `review_note`는 사용처 확인 후 정리 후보입니다. |
| 파생 캐시 | `ll_dashboard_metric_snapshots`, `ll_payload_snapshots`, `ll_external_api_cache` | 캐시/스냅샷 목적. 원본 대체 금지, TTL/재생성 기준을 명확히 해야 합니다. |
| 운영 감사 | `ll_api_audit_logs`, `ll_data_change_audit_logs`, `ll_import_runs`, `ll_weekly_doc_ingest_runs` | 유지. row가 0이어도 감사 흐름이 활성화되면 필요합니다. |
| Data Quality | `ll_data_quality_findings`, `ll_edit_requests` | 유지. 수정 요청/승인/readback/audit 흐름에 필요합니다. |
| 업무 기능 | `ll_work_platform_tasks`, `ll_work_platform_board_posts`, `ll_worklogs` | `ll_worklogs`는 현재 row 0이고 기능 중복 가능성이 있어 삭제 후보입니다. `tasks/board_posts`는 현재 기능 테이블입니다. |
| Weekly | `ll_weekly_reports`, `ll_weekly_assets`, `ll_weekly_projects` | 유지. 이번 세션에 260427 주간업무자료를 적재했습니다. |
| 권한 | `ll_user_permissions` | 삭제 금지. 런타임 권한 기준입니다. |

## 정리 후보

| 후보 | 현재 판정 | 유지 이유 | 삭제 위험 | 사용처 확인 | rollback | readback query 필요 |
|---|---|---|---|---|---|---|
| `ll_worklogs` 테이블 | 삭제 보류 | 과거 업무 로그 API 계약과 `ll-dashboard-api` worklog action이 아직 남아 있습니다. | 즉시 삭제하면 남아 있는 worklog API, QA script, 예전 개인/팀/섹터 업무 흐름이 깨질 수 있습니다. | `supabase/functions/ll-dashboard-api/index.ts`에서 insert/list/update/delete 및 AI evidence select 사용. QA artifact에도 계약 근거가 남아 있음. | `create table public.ll_worklogs (...)` 원복 SQL과 RLS/policy 재생성 SQL 필요. | `select count(*) from public.ll_worklogs;`, action별 Edge smoke 필요. |
| `source_payload` 계열 컬럼 | 정규화 후보 | 원본 cell/row가 별도 보존되지만, migration/linkage 재현과 외부 API cache 근거가 아직 필요합니다. | DB_히스토리 linkage, metric snapshot refresh, Data Quality 추적 근거가 사라질 수 있습니다. | migration SQL, `dashboard-metric-snapshot-refresh-20260518.sql`, `ll-dashboard-api` metric refresh에서 사용. | 삭제 전 `source_payload`를 archive table 또는 JSON export로 백업하는 rollback path 필요. | 테이블별 null/non-null count, payload key 분포, source row/cell 대체 가능 여부 query 필요. |
| `review_status`, `review_note` 계열 컬럼 | 삭제 보류 | 경산 보정, 아레나스양지 DB_히스토리 split, source-only row 보완 필요 상태를 표시하는 운영 감사 필드로 쓰입니다. | 삭제하면 Data Quality에서 “검토 필요/보정 완료/누락” 상태를 설명할 근거가 줄어듭니다. | `ll_lease_spaces`, `ll_leases`, `ll_rent_history`, `ll_assets`, static asset JSON의 `reviewStatus`, `reviewStatusLabel()`에서 표시. | 컬럼 삭제 전 상태값을 `ll_data_quality_findings` 또는 audit log로 이전하는 migration 필요. | status별 count, unresolved review rows, Data Quality 노출 여부 query 필요. |
| `ll_payload_snapshots.payload` | TTL/축소 후보 | 초기 Apps Script parity와 page/entity payload 재현에 쓰인 cache입니다. Home/Company snapshot 근거가 일부 남아 있습니다. | Home/Asset/Company read API 전환 전 삭제하면 fallback 또는 parity 비교가 불가능해질 수 있습니다. | 과거 parity QA, `supabase-detail-readback-20260513.cjs`, `supabase-snapshot-parity-20260513.cjs`, component matrix에서 사용. 현재 화면 직접 import는 정적 JSON이 우선. | payload를 파일 export 또는 slim snapshot table로 백업 후 삭제해야 합니다. | page/entity별 count, 최신 generated_at, 현재 dashboard read API가 참조하는지 query 필요. |
| `ll_dashboard_metric_snapshots.source_payload` | 최소화 후보 | 챗봇/대시보드 숫자 답변의 evidence payload로 활용 가능합니다. | 너무 일찍 줄이면 “어떤 row/cell에서 나온 숫자인지” 설명이 약해질 수 있습니다. | `ll-dashboard-api`의 metric refresh/upsert, AI/search evidence policy, `dashboard-metric-snapshot-refresh-20260518.sql`에서 사용. | metric_key별 source_payload 백업 후 필요한 evidence key만 남기는 migration 필요. | metric_scope/key별 payload size, evidence key coverage, AI 답변 hit rate query 필요. |

### 이번 사용처 확인 결과

- `rg` 기준 `ll_worklogs`는 row count가 0이어도 Edge Function의 과거 worklog CRUD와 AI evidence select에 아직 연결되어 있어 즉시 DROP 후보가 아닙니다.
- `source_payload`와 `review_status/review_note`는 원본 Excel 값 자체는 아니지만, DB_히스토리 누적 linkage, 보정 사유, Data Quality 검토 상태를 설명하는 운영 감사 필드로 남아 있습니다.
- `ll_payload_snapshots.payload`와 `ll_dashboard_metric_snapshots.source_payload`는 Home/Asset/Company 핵심 payload가 Supabase read API로 완전히 전환된 뒤에야 축소/삭제 판단이 가능합니다.
- 따라서 이번 배치에서는 삭제 SQL을 만들지 않고, “삭제 보류/정규화 후보/TTL 축소 후보/최소화 후보”로만 분류합니다.

## 다음 작업

1. `rg` 사용처를 테이블/컬럼 단위로 매핑합니다.
2. 원본 Excel `DB_일반`, `DB_히스토리 누적`, live Sheets 보존 필드와 비교해 원본 필수 컬럼을 고정합니다.
3. 업무 기능/감사/권한/캐시 컬럼은 원본과 분리하되, 필요한 이유와 보존 기간을 문서화합니다.
4. 삭제 후보마다 `SQL preview`, `impact`, `rollback SQL`, `readback query`를 만듭니다.
5. 사용자 승인 후에만 실제 `ALTER/DROP/DELETE`를 실행합니다.

## 2026-05-20 보강

- 단순 cleanup 후보표만으로는 부족하므로 별도 재구조화 실행 계획을 추가했습니다.
- 핵심 방향은 `Raw Source`, `Core Normalized`, `Detail Normalized`, `Weekly / Work Platform`, `Permission / Audit`, `Cache / Snapshot`, `Legacy Candidate`로 분리하는 것입니다.
- `DB_일반=82`, `DB_히스토리 누적=18` field registry readback은 완료됐지만, 세부면적/스펙/특수조건/검토 로그 테이블은 아직 구조만 있고 값 적재 preview가 남아 있습니다.
- `ll_worklogs`, `source_payload`, `review_status/review_note`, `ll_payload_snapshots.payload`, `ll_dashboard_metric_snapshots.source_payload`는 즉시 삭제가 아니라 primary 전환과 사용처 제거 뒤에만 정리할 수 있습니다.
- 다음 실제 작업은 삭제가 아니라 detail normalized table populate preview와 valid JWT dashboard read smoke입니다.
