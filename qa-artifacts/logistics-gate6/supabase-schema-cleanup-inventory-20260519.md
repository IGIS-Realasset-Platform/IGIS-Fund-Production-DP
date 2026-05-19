# Supabase ll_* Schema Cleanup Inventory

- 기준 프로젝트: `qvegpozwrcmspdvjokiz`
- 작성일: 2026-05-19
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

| 후보 | 이유 | 다음 확인 |
|---|---|---|
| `ll_worklogs` 테이블 | 현재 row 0, `ll_work_platform_tasks`와 기능 중복 가능성 | UI/Edge/QA/export 사용처 0건이면 migration preview 작성 |
| `source_payload` 계열 컬럼 | 원본 보존 중복 가능성. 원본 cell/row가 이미 별도 보존됨 | 원본 Excel에 없는 개발 편의 payload인지 테이블별 확인 |
| `review_status`, `review_note` 계열 컬럼 | Excel 원본값이 아닌 관리용 상태일 가능성 | Data Quality 화면/QA/script 사용처 확인 |
| `ll_payload_snapshots.payload` | 107건으로 큼. 대시보드 static snapshot 대체 과정에서 쌓인 캐시일 수 있음 | 현재 대시보드가 이 테이블을 live 근거로 쓰는지 확인 후 축소/TTL/재생성 정책 결정 |
| `ll_dashboard_metric_snapshots.source_payload` | metric 캐시의 근거 payload | 챗봇/대시보드 숫자 답변용으로 필요한 최소 필드만 남기는 방향 검토 |

## 다음 작업

1. `rg` 사용처를 테이블/컬럼 단위로 매핑합니다.
2. 원본 Excel `DB_일반`, `DB_히스토리 누적`, live Sheets 보존 필드와 비교해 원본 필수 컬럼을 고정합니다.
3. 업무 기능/감사/권한/캐시 컬럼은 원본과 분리하되, 필요한 이유와 보존 기간을 문서화합니다.
4. 삭제 후보마다 `SQL preview`, `impact`, `rollback SQL`, `readback query`를 만듭니다.
5. 사용자 승인 후에만 실제 `ALTER/DROP/DELETE`를 실행합니다.
