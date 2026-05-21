# Gate 6 Supabase Schema Restructure Plan - 2026-05-20

## 목적

현재 `public.ll_*` 스키마는 기능을 붙여가며 만든 흔적이 남아 있어 원본 데이터, 정규화 데이터, 운영 감사 데이터, 캐시 데이터가 섞여 있습니다. 이 문서는 실제 삭제를 실행하는 문서가 아니라, 어떤 값을 어디로 정리해야 하는지와 어떤 순서로 안전하게 정리할지를 고정하는 실행 계획입니다.

## 원칙

- 기존 배포 화면을 깨지 않기 위해 `DROP`, `ALTER TYPE`, 기존 컬럼 rename은 primary 전환 전 금지합니다.
- 원본 Excel 또는 live Sheets에서 온 값은 삭제하지 않고 `ll_source_cells`, `ll_sheet_rows`, `ll_source_field_registry`로 추적합니다.
- 정규화 테이블은 화면/AI/Data Quality가 읽는 기준값이어야 하며, `source_payload`는 최종 기준값이 아니라 이행기 보조 evidence로만 둡니다.
- 캐시/스냅샷 테이블은 성능과 parity 확인용이지 원본 대체물이 아닙니다.
- 실제 삭제/축소는 사용처 0건, export/rollback, readback query, 사용자 승인 후 별도 배치로만 실행합니다.

## 목표 구조

| 영역 | 역할 | 유지/정리 대상 |
|---|---|---|
| Raw Source | 원본 Excel/live Sheets cell/row 보존 | `ll_source_cells`, `ll_sheet_rows`, `ll_import_runs`, `ll_source_field_registry`, `ll_source_review_logs` |
| Core Normalized | 대시보드와 AI가 읽는 기준 데이터 | `ll_assets`, `ll_tenants`, `ll_leases`, `ll_lease_spaces`, `ll_rent_history`, `ll_asset_managers` |
| Detail Normalized | 원본 Excel 세부항목 구조화 | `ll_lease_space_area_breakdowns`, `ll_lease_space_specs`, `ll_lease_special_terms` |
| Weekly / Work Platform | 사용자 업무 기능 데이터 | `ll_weekly_reports`, `ll_weekly_assets`, `ll_weekly_projects`, `ll_work_platform_tasks`, `ll_work_platform_board_posts` |
| Permission / Audit | 권한, 수정요청, 로그, 감사 | `ll_user_permissions`, `ll_edit_requests`, `ll_data_change_audit_logs`, `ll_api_audit_logs`, `ll_data_quality_findings` |
| Cache / Snapshot | 재계산 가능 캐시와 shadow read evidence | `ll_dashboard_metric_snapshots`, `ll_dashboard_read_snapshots`, `ll_payload_snapshots`, `ll_external_api_cache` |
| Legacy Candidate | 기능 중복 또는 과거 화면용 잔재 | `ll_worklogs`, 중복 `source_payload`, 일부 `review_status/review_note`, 오래된 `ll_payload_snapshots.payload` |

## 현재 확인된 문제

| 문제 | 현재 상태 | 즉시 조치 |
|---|---|---|
| 원본 필드와 정규화 필드 연결 부족 | `DB_일반=82`, `DB_히스토리 누적=18` registry는 생성됐지만 세부 테이블 값 적재는 아직 빈 상태 | 신규 detail 테이블 populate preview 작성 |
| `source_payload` 의존 과다 | 여러 core/detail 테이블에 JSON evidence가 남아 있음 | source cell/field registry로 대체 가능한 항목과 보존이 필요한 항목 분리 |
| `review_status/review_note` 산재 | 보정/누락 상태 표시가 여러 테이블에 흩어짐 | Data Quality finding 또는 source review log로 통합하는 preview 작성 |
| `ll_payload_snapshots` 중복 | static JSON/과거 parity/snapshot 근거로 남아 있음 | Home/Asset/Company primary 전환 후 TTL/축소 후보로 격하 |
| `ll_worklogs` legacy | row 0이지만 Edge API와 AI evidence에 아직 연결 | API 사용처 제거 후 삭제 후보로 전환 |
| live Sheets 17탭 cell-level 미완료 | xlsx `13,752` cell 보존은 pass, live 17탭 cell manifest는 미완료 | live source run append preview/readback 작성 |

## 재구조화 실행 순서

### Phase 1. 원본-정규화 연결 확정

- `ll_source_field_registry`를 기준으로 Excel `DB_일반`, `DB_히스토리 누적`의 모든 수정 가능 필드를 target table/field에 연결합니다.
- 완료 근거:
  - `DB_일반=82`
  - `DB_히스토리 누적=18`
- 남은 일:
  - `target_table`, `target_column`, `target_json_path`, `edit_policy`를 Data Quality UI에서 실제 사용 가능한 수준으로 채웁니다.

### Phase 2. 세부 원본값 구조화

- `source_payload`나 원본 cell에만 있는 값을 아래 테이블로 승격합니다.

| 원본 범위 | 목표 테이블 | 예시 |
|---|---|---|
| 세부 면적 | `ll_lease_space_area_breakdowns` | 창고, 하역장, 사무실, 통로, 램프, 코어, 기타 공용 |
| 시설/스펙 | `ll_lease_space_specs` | 바닥하중, 평활도, 도크 수, 층고, 전력, 램프 타입, 조명 |
| 보험/특수조건 | `ll_lease_special_terms` | 보험 한도, 구상권/대위권, 연체/미납, 특수조건 |
| Log/검토 메모 | `ll_source_review_logs` | Check Log, 담당자 확인, 검토 메모 |

- 방식:
  - 먼저 `INSERT ... SELECT` preview를 만듭니다.
  - readback으로 row count/source_cell_id coverage를 확인합니다.
  - 화면/Data Quality read API가 새 테이블을 읽도록 바꾼 뒤에만 기존 JSON 의존을 줄입니다.

### Phase 3. Dashboard read primary 전환

- 현재 상태: Home/Asset/Company는 static primary, Supabase shadow입니다.
- 다음 순서:
  1. valid JWT로 `dashboard/home/read`, `dashboard/asset/read`, `dashboard/company/read` 200 smoke
  2. shadow diff 확인
  3. Home primary
  4. Asset primary
  5. Company primary
  6. PDF/AI도 같은 read API 또는 `ll_dashboard_metric_snapshots`를 기준으로 통일

### Phase 4. 캐시/스냅샷 정리

| 후보 | 정리 전 조건 | 정리 방향 |
|---|---|---|
| `ll_payload_snapshots.payload` | Home/Asset/Company/PDF가 더 이상 static/snapshot을 primary로 안 씀 | TTL 적용 또는 slim archive로 축소 |
| `ll_dashboard_metric_snapshots.source_payload` | AI/대시보드 evidence가 source cells/registry로 충분히 연결됨 | 필요한 evidence key만 남김 |
| `ll_dashboard_read_snapshots.payload` | read API 캐시 정책 확정 | basis_date/scope_hash 기준 TTL 운영 |
| `ll_external_api_cache` | OpenDART/건축물대장/Naver cache TTL 확정 | provider별 TTL/재시도/장애 fallback 문서화 |

### Phase 5. Legacy 제거 후보

| 후보 | 현재 판정 | 제거 전 선행조건 |
|---|---|---|
| `ll_worklogs` | legacy 삭제 후보 | Edge worklog CRUD 제거, AI evidence select 제거, QA artifact 계약 갱신, row 0 readback |
| `source_payload` columns | 단계적 축소 후보 | source_cell_id/source_row_id/registry/detail table로 대체 완료 |
| `review_status/review_note` columns | 통합 후보 | `ll_data_quality_findings` 또는 `ll_source_review_logs`로 상태 이전 완료 |

## 주의사항 해소 계획

| 기존 주의사항 | 제가 처리할 방식 | 상태 |
|---|---|---|
| 전체 `npm run lint` 실패 | 이번 변경 파일 scoped lint는 pass. 전역 lint는 별도 cleanup batch로 원인 파일별 분리 처리 | 진행 필요 |
| valid JWT read API smoke 미완료 | 실제 로그인 세션 또는 테스트 JWT 확보 후 `dashboard/*/read` 200/403 negative test 수행 | 진행 필요 |
| Supabase primary 미전환 | shadow diff 확인 후 Home → Asset → Company 순서로 전환 | 진행 필요 |
| live Sheets 17탭 cell-level 미완료 | append preview, rollback, readback query 작성 후 source_run 단위로 보존 | 진행 필요 |

## 삭제/정리 실행 전 필수 산출물

- SQL preview
- 영향 범위
- rollback SQL 또는 비파괴 복구 방식
- readback query
- 사용처 grep 0건 증거
- live URL smoke 기준
- 사용자 승인

