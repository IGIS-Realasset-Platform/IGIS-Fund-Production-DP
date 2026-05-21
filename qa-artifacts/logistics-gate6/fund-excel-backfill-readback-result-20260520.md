# 260520 펀드 정보 Backfill Readback Result - 2026-05-20

## 적용 대상

- Source workbook: `260520_물류센터 펀드 정보.xlsx`
- Source path: `C:\Users\10524\Desktop\codex_realasset\Project\03_Logi_Leasing_Dashboard`
- Migration SQL: `supabase/migrations/20260520092911_logistics_fund_excel_backfill.sql`
- 적용 방식: 기존 테이블/컬럼 삭제 없이 additive/upsert-only

## Migration 전 기준 Row Count

| table | before |
|---|---:|
| ll_source_cells | 13,752 |
| ll_assets | 17 |
| ll_tenants | 36 |
| ll_leases | 45 |
| ll_lease_spaces | 80 |
| ll_rent_history | 163 |
| ll_weekly_assets | 20 |
| ll_funds | 15 |
| ll_fund_asset_links | 17 |
| ll_fund_beneficiary_tranches | 0 |
| ll_fund_loan_tranches | 0 |

## Backfill Readback

| check | actual | expected | status |
|---|---:|---:|---|
| ll_import_runs_260520 | 1 | 1 | pass |
| ll_source_cells_260520 | 1,435 | 1,435 | pass |
| ll_source_field_registry_260520 | 34 | 34 | pass |
| ll_funds_260520 | 15 | 15 | pass |
| ll_fund_asset_links_260520 | 17 | 17 | pass |
| ll_fund_beneficiary_tranches_260520 | 52 | 52 | pass |
| ll_fund_loan_tranches_260520 | 51 | 51 | pass |

## Migration 후 기준 Row Count

| table | after | result |
|---|---:|---|
| ll_source_cells | 15,187 | increased by 1,435 |
| ll_assets | 17 | unchanged |
| ll_tenants | 36 | unchanged |
| ll_leases | 45 | unchanged |
| ll_lease_spaces | 80 | unchanged |
| ll_rent_history | 163 | unchanged |
| ll_weekly_assets | 20 | unchanged |
| ll_funds | 15 | unchanged |
| ll_fund_asset_links | 17 | unchanged |
| ll_fund_beneficiary_tranches | 52 | increased by 52 |
| ll_fund_loan_tranches | 51 | increased by 51 |

## Key Link Readback

| asset | fund_id | fund_name | beneficiary rows | loan rows |
|---|---|---|---:|---:|
| 동산물류센터 | fund_112527 | 이지스전문투자형사모부동산투자신탁제404호 | 6 | 3 |
| 부국물류센터 | fund_112527 | 이지스전문투자형사모부동산투자신탁제404호 | 6 | 3 |
| 에이블로지스물류센터 | fund_112527 | 이지스전문투자형사모부동산투자신탁제404호 | 6 | 3 |
| 아레나스양지물류센터 | fund_112127 | 이지스일반사모부동산모투자신탁116호 | 4 | 5 |
| 화성 석포리 물류센터 | fund_112642 | 이지스일반사모부동산투자신탁제451호(운용) | 9 | 4 |

## Integrity Readback

| check | result |
|---|---:|
| orphan source_cell_ids | 0 |
| orphan fund_asset_links | 0 |
| orphan beneficiary rows | 0 |
| orphan loan rows | 0 |
| drawdown date parse nulls | 0 |
| maturity date parse nulls | 0 |
| beneficiary committed amount sum | 1,699,938,614,680 |
| loan committed amount sum | 1,524,702,000,000 |

## Notes

- `ll_source_cells.import_id` FK 때문에 `ll_import_runs` row를 먼저 생성하도록 migration을 보정했습니다.
- 기존 핵심 normalized table row count 감소는 없습니다.
- 수익자/대주 정보는 펀드 기준으로 저장되고, 동일 펀드를 공유하는 자산은 같은 fund row를 참조합니다.
- Remote migration history는 `20260520092911`을 `applied`로 repair해 중복 backfill 실행 위험을 낮췄습니다.
