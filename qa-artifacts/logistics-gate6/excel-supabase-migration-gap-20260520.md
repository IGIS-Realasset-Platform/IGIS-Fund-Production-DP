# Excel to Supabase Migration Gap - 2026-05-20

- Source workbook: `C:\Users\10524\Desktop\codex_realasset\Project\03_Logi_Leasing_Dashboard\★ 260414_물류센터 임대차계약 DB_취합본.xlsx`
- Project ref: `qvegpozwrcmspdvjokiz`
- Mutation performed: `false`
- Query mode: Supabase read-only via `npx supabase@2.90.0 db query --linked`

## Judgment

현재 상태를 “Supabase migration이 전부 잘 끝났다”라고 판단하면 안 됩니다.

정확한 판정은 아래와 같습니다.

| 영역 | 판정 | 근거 |
|---|---|---|
| 원본 Excel xlsx cell-level 보존 | pass | `ll_source_cells`에 xlsx 5개 sheet, 13,752 cells가 현재 readback됨 |
| live Google Sheets 17탭 cell-level 보존 | not proven | 현재 `ll_sheet_rows`는 live Google Sheets 5개 sheet, 347 rows만 확인됨. live cell-level rows는 이번 readback 범위에서 확인되지 않음 |
| DB_히스토리 누적 계약-history linkage | partial pass | `ll_rent_history` 163 rows, source row id 163 rows, contract-space link 162 rows. source-only/누락성 row와 null/review rows는 남음 |
| DB_일반 전체 항목 정규화 | not complete | DB_일반 82개 field-like columns 중 핵심 master/계약/면적은 일부 정규화됐지만 세부면적, 임차인 요구 스펙, 보험/특수조건, 확인/검토 항목은 전용 정규 테이블 또는 Data Quality edit model이 부족함 |
| 화면 데이터 연결 | partial | Work Platform 관리 Project 현황은 Supabase 우선이나, Home/Asset/Company 핵심 dashboard payload는 아직 정적 JSON 의존이 남아 있음 |

## Source Workbook Inventory

| Sheet | Rows | Columns | Used cells | Non-empty | Formula cells | Supabase cell coverage |
|---|---:|---:|---:|---:|---:|---|
| Meta_데이터 항목 설명 | 79 | 44 | 3,476 | 385 | 6 | 3,476 cells readback |
| DB_일반 | 74 | 84 | 6,216 | 4,909 | 763 | 6,216 cells readback |
| DB_히스토리 누적 | 178 | 19 | 3,382 | 2,885 | 172 | 3,382 cells readback |
| Log | 37 | 14 | 518 | 321 | 0 | 518 cells readback |
| 자산_담당자 연결 | 20 | 8 | 160 | 127 | 0 | 160 cells readback |
| **Total** | 388 | - | **13,752** | **8,627** | **941** | **13,752 cells readback** |

## Current Supabase Readback

| Table | Rows |
|---|---:|
| ll_asset_managers | 17 |
| ll_assets | 17 |
| ll_dashboard_metric_snapshots | 64 |
| ll_lease_spaces | 80 |
| ll_leases | 45 |
| ll_payload_snapshots | 107 |
| ll_rent_history | 163 |
| ll_sheet_rows | 347 |
| ll_source_cells | 13,752 |
| ll_tenants | 36 |

## Source Coverage

### xlsx cell-level

원본 Excel 5개 시트는 `ll_source_cells`에 used range 기준으로 전부 보존된 것으로 보입니다.

중요한 의미:
- “원본 값을 나중에 추적할 수 있는 cell 보존”은 통과 근거가 있습니다.
- 그러나 이것은 “대시보드와 Data Quality가 모든 컬럼을 구조화해서 쓴다”는 뜻은 아닙니다.

### live Google Sheets row-level

현재 확인된 live Google Sheets row-level 보존은 5개 sheet입니다.

| Sheet | Rows |
|---|---:|
| DB_기업 | 30 |
| DB_일반 | 94 |
| DB_자산 | 17 |
| DB_히스토리 누적 | 164 |
| 이슈 리스트 | 42 |

중요한 gap:
- 사용자가 요구한 live Google Sheets 17탭 used-range cell-level manifest는 아직 완료 증거가 없습니다.
- row-level JSON은 cell-level 보존을 대체하지 못합니다.

## DB_일반 Schema Gap

`DB_일반`은 row 9가 실제 field label이고, row 8은 일부 group label입니다. 자동 header guess만으로는 부족합니다.

이번 inventory 기준 `DB_일반`의 field-like columns는 82개입니다.

| Column range | Excel meaning | Current target | Gap |
|---|---|---|---|
| B:O | 펀드/자산/임차인/온도/층/구역/임차 성격 | `ll_assets`, `ll_tenants`, `ll_leases`, `ll_lease_spaces` | 핵심 정규화는 되어 있으나 field별 source_cell과 Data Quality edit target이 더 명확해야 함 |
| P:Z | 전체 연면적, 임대면적, 전용면적, 전용률, 수식/체크 | `ll_assets`, `ll_lease_spaces`, `ll_data_quality_findings` | check/formula 컬럼은 원본/감사 항목으로 분리해야 함 |
| AA:AJ | 세부면적: 창고, 하역장, 사무실, 기타 전용, 통로, 램프, 기계전기실, 주차장, 코어, 기타 공용 | 일부 `ll_lease_spaces` 또는 payload | 전용 세부면적 테이블 또는 구조화 JSONB가 필요함 |
| AK:BQ | 사무실 사용, 전차, 계약일/개시/만기, 보증금, RF/FO/TI, 인상률, 보험 한도, 구상권/대위권 | 일부 `ll_leases`, 일부 payload | 보험/비용/특수조건까지 수정 가능한 구조가 불명확함 |
| BR:CB | 임차인 요구 스펙: 바닥하중, 평활도, 마모도, 도크, 층고, 전력, 램프, 통로, 조명, 외벽자재 | 전용 정규 테이블 미확인 | `ll_lease_space_specs` 또는 Data Quality editable JSONB 필요 |
| CC:CF | 계약 상태, 연체/미납, 보험 특수조건, 기타 특수조건 | 전용 정규 테이블 미확인 | Dashboard에는 요약, Data Quality에는 수정 가능한 원문 필드 필요 |

## DB_히스토리 누적 Schema Gap

`DB_히스토리 누적` field-like columns는 18개입니다.

| Column range | Excel meaning | Current target | Gap |
|---|---|---|---|
| B:M | 펀드/자산/임차인/온도/층/구역/임대면적/전용면적 | `ll_rent_history` plus `ll_lease_spaces` relation | 162행은 linkage 근거가 있으나 source-only 2행은 Data Quality 보완 대상으로 남음 |
| N:S | 기준일자, 변동 원인, 월임대료, 월관리비, 평당 월임대료, 평당 월관리비 | `ll_rent_history` | 현재 `monthly_rent_total` null 1건, `monthly_mf_total` null 34건이 남아 있어 전부 정상 계산이라고 볼 수 없음 |

## Missing Schema Plan

원본 Excel 전체를 사용자 수정 가능하게 만들려면 현재 스키마에 최소한 아래 구조가 필요합니다.

| Need | Suggested structure | Reason |
|---|---|---|
| DB_일반 모든 field별 edit target | `ll_source_field_registry` 또는 기존 field register 확장 | Excel column과 Supabase target table/column을 1:1로 관리해야 함 |
| 세부면적 breakdown | `ll_lease_space_area_breakdowns` 또는 `ll_lease_spaces.area_breakdown_json` | 창고/하역장/사무실/공용부 등 세부면적을 구조화해야 함 |
| 임차인 요구 스펙 | `ll_lease_space_specs` 또는 `ll_leases.tenant_spec_json` | 바닥하중/평활도/도크/층고/램프 등 비정형 텍스트+숫자 혼합 데이터 수정 필요 |
| 보험/특수조건 | `ll_lease_terms` 확장 또는 `ll_lease_special_terms` | 보험 한도, 구상권/대위권, 특수 계약 조건이 원본 Excel에 존재함 |
| Log sheet | `ll_source_review_logs` 또는 Data Quality finding/audit 확장 | 담당자 확인/검토 요청/데이터 이상을 원본과 연결해야 함 |
| Meta sheet | field registry seed | 항목 설명, type, 단위, 시계열 여부를 UI와 Data Quality에 써야 함 |
| live 17탭 cell-level | `ll_source_cells` append for `live_google_sheets` | row-level JSON만으로는 cell-level 보존 기준 불충족 |

## Next Required Work

1. `DB_일반` 82개 field-like columns를 field registry에 고정합니다.
2. 각 field를 `source only`, `normalized table`, `history table`, `editable special term`, `derived formula/check`, `audit log`로 분류합니다.
3. 현재 `source_payload`에만 들어간 값을 정규 테이블/JSONB/editable field로 승격할지 결정합니다.
4. `DB_히스토리 누적`의 null/review rows와 source-only 2행을 Data Quality 보완 대상으로 노출합니다.
5. 실제 migration은 preview, rollback, readback query 작성 후 별도 승인으로 진행합니다.

## Files Generated

- `qa-artifacts/logistics-gate6/excel-full-source-inventory-20260520/summary.json`
- `qa-artifacts/logistics-gate6/excel-full-source-inventory-20260520/first15rows.json`
- `qa-artifacts/logistics-gate6/excel-full-source-inventory-20260520/header_like_cells.csv`
- `qa-artifacts/logistics-gate6/excel-full-source-inventory-20260520/field_gap_map.json`
- `qa-artifacts/logistics-gate6/excel-full-source-inventory-20260520/db_general_field_gap_map.csv`
- `qa-artifacts/logistics-gate6/excel-full-source-inventory-20260520/db_history_field_gap_map.csv`
- `qa-artifacts/logistics-gate6/excel-supabase-current-readonly-20260520.sql`
