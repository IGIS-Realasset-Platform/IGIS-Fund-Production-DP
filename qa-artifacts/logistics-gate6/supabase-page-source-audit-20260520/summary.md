# Supabase Page Source Audit - 2026-05-20

- mutationPerformed: false
- projectRef: qvegpozwrcmspdvjokiz
- generatedAt: 2026-05-21T03:38:27.336Z

## Source Map

| Area | Status | Supabase tables | Readback | Remaining risk |
|---|---|---|---|---|
| Work Platform 관리 Project 현황 | partial | ll_weekly_reports, ll_weekly_assets | {"ok":false,"status":0,"rows":0,"reportId":null,"hasArenaYangji":false} | Edge readback 실패 시 빈 표가 될 수 있음 |
| Asset 자산개요·투자개요 | partial | ll_weekly_projects, ll_weekly_reports | {"managementProjectsInStaticSource":5,"liveEndpointExists":true} | 인증 Edge readback 성공 시 Supabase row 우선, 실패/빈 row일 때 static weeklyReportData fallback이 남아 있음 |
| DB_히스토리 누적 migration/linkage | done | ll_sheet_rows, ll_source_cells, ll_rent_history | {"dbHistoryRowsInReadback":true,"rentHistoryLinked162":true,"arenaYangjiPayloadRows":21,"arenaYangjiRowsWithExpiry":21} | Data Quality에서 source-only 2행을 원본 보완 대상으로 노출하는 UI는 남아 있음 |
| Home/Asset/Company 핵심 Dashboard 데이터 | partial | ll_assets, ll_lease_spaces, ll_rent_history, ll_tenants, ll_dashboard_metric_snapshots, ll_payload_snapshots | {"localAssetOptions":17,"homeKpiCount":7,"assetPayloadImport":true,"companyPayloadImport":true,"dashboardMetricRefreshEndpoint":true,"dashboardMetricSnapshotRowsFromInventory":"64"} | 화면 계산은 아직 빌드 시점 JSON payload를 주로 사용함. Supabase snapshot/readback을 화면 데이터 소스로 직접 읽는 API/프론트 연결은 추가 작업 필요 |
| PDF Report 데이터 소스 | partial | ll_assets, ll_weekly_projects, ll_weekly_assets, ll_dashboard_metric_snapshots | {"usesAssetOptions":false,"usesAssetPayloads":0,"usesWeeklyStaticRows":false} | PDF Report는 권한 필터는 적용하지만 지도/자산개요/투자개요 포함 데이터가 정적 payload와 일부 weekly static fallback을 사용함. 지도 렌더링 문제는 Stage 4에서 별도 수정 필요 |
| Supabase schema cleanup/optimization | partial | ll_worklogs, ll_payload_snapshots, ll_dashboard_metric_snapshots, source_payload/review columns | {"inventoryExists":true,"rowCountTableFound":true,"cleanupCandidatesFound":true} | 삭제/정리는 아직 preview 단계. 사용처 0건, rollback SQL, readback query를 만든 뒤 별도 승인 배치로 처리해야 함 |

## Static JSON Imports Still Used

- weeklyReportData: true
- homeData: true
- assetPayloads: true
- companyPayloads: true
- sectorData: true

## Completed Enough To Count Done

- DB_히스토리 누적 migration/linkage
- 월 임관리비 핵심 불일치 정리: 전체 13,050,719,577원, 아레나스양지 2,468,703,091원

## Partial Needs Work

- Work Platform 관리 Project 현황
- Asset 자산개요·투자개요
- Home/Asset/Company 핵심 Dashboard 데이터
- PDF Report 데이터 소스
- Supabase schema cleanup/optimization

## Read API Scope

이번 배치에서는 이미 끝난 readback을 다시 돌리지 않고, 정적 JSON 의존을 Supabase 우선으로 바꿀 범위만 확정했습니다.

| Page | Supabase-first target | Current static dependency | API/read model needed |
|---|---|---|---|
| home | KPI, 월 임관리비 비중, 용도별 비율, 계약 이력 기준 임대료 추이, 권역별 노출도, 만기 집중도 | logisticsHomeData.json, logisticsAssetOptionsData.json, logisticsAssetData/*.json | dashboard/home/read or ll_dashboard_metric_snapshots aggregate read; basis_date=2026-04, asset permission scope, source row/cell evidence |
| asset | 자산 KPI, 임차인 현황, 면적 구성, 층별 배치, 만기 스냅샷, 자산개요·투자개요 | ASSET_PAYLOADS, weeklyReportData.managementProjects fallback | dashboard/asset/read plus weekly-projects/get-asset-detail; assetId 기준, DB_일반/DB_히스토리 linkage, latest rent history |
| company | 기업 KPI, 임차 자산 현황, 회사별 임차 자산 지도, 자산별 노출도, DART 표시 영역 | COMPANY_PAYLOADS, companyOptionsData, Asset payload join | dashboard/company/read; tenantId/companyName 기준, permission asset join, DART cache/read status |

## Existing Readback Evidence Reused

- 월 임관리비 총액: 13,050,719,577원
- 아레나스양지 월 임관리비: 2,468,703,091원
- DB_히스토리 누적 linkage: 162행
- ll_weekly_assets latest rows: 20행
- 경산 전용면적 보정: 3건

## Next Recommended Implementation

- Home/Asset/Company/PDF가 ll_dashboard_metric_snapshots 또는 신규 dashboard-data read API를 직접 읽도록 연결
- Asset 자산개요·투자개요의 static fallback을 readback 상태 표시 없이도 Supabase row 우선으로 안정화
- Data Quality에 DB_히스토리 source-only 2행 노출
- PDF Report 지도 렌더링을 정적 이미지/지도 캡처 또는 print-safe map renderer로 교체
