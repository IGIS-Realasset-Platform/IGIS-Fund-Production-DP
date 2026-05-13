# Gate 6 Company module QA - 2026-05-13

## Scope
- Module: Logistics leasing dashboard / Company
- Source baseline: Apps Script `renderCompany()` and `buildCompanyPayload_()`
- Data source used in this unit: static company snapshots copied from `docs/data/company`
- Company snapshot count: 31

## Implemented parity items
- Company selector
- Company KPI strip from actual `renderCompany()` source:
  - 임차 자산 수
  - 총 임차면적
  - 월 임관리비 총액
  - 월 임대료 총액
  - 월 관리비 총액
- Company basis strip:
  - 대상
  - 기준시점
  - 계약/금액
  - DART
  - 지도
- 임차 자산 현황 table
- 회사별 임차 자산 지도
- 지도 크게 보기 modal title: `포트폴리오 위치`
- 자산별 노출도 chart and cost/area toggle
- DART 상세 정보 table
- No Admin/Admin Data tab exposure

## Local QA result
- URL: `http://127.0.0.1:8084/platform/iotaseoul/workspace/logistics/dashboard/company`
- Result JSON: `qa-artifacts/logistics-gate6/company-qa-20260513/company-qa-result.json`
- Full screenshot: `qa-artifacts/logistics-gate6/company-qa-20260513/company-dashboard-full.png`

## Popup screenshots
- `popup-company-asset-count.png`
- `popup-company-assets-table.png`
- `popup-company-map.png`
- `popup-company-exposure.png`

## QA checks
- Company screen active: PASS
- Selector renders and changes company: PASS
- KPI strip: PASS
- Basis strip: PASS
- Leased asset table: PASS
- Map panel: PASS
- Exposure panel and toggle: PASS
- DART table: PASS
- Popup checks: PASS
- Page errors: 0
- Secret scan: PASS

## Map note
Naver Maps authentication was not treated as a local blocker because local preview ports are temporary and are not stable Web service URLs for the Naver console. The component still falls back to OpenStreetMap/backup map rendering when Naver auth fails locally. Naver live-domain behavior remains a live QA item.
