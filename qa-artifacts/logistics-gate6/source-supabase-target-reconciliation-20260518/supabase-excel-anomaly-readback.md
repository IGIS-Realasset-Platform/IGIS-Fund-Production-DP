# Supabase/Excel anomaly readback - 2026-05-18

- Scope: user-reported anomaly assets only.
- Source workbook: `C:\Users\10524\Desktop\codex_realasset\Project\03_Logi_Leasing_Dashboard\★ 260414_물류센터 임대차계약 DB_취합본.xlsx`
- Supabase project: `qvegpozwrcmspdvjokiz`
- Mutation performed: false
- Readback method: `npx supabase@2.90.0 db query --linked`, read-only SQL.

## Summary

| Asset | Excel source | Supabase readback | Status | Proposed action |
|---|---:|---:|---|---|
| 부산송정물류센터 (`A112109001`) | `DB_일반` 1 row, tenant `-`, leased/exclusive `23,729.34㎡` | `ll_lease_spaces` 1 row, tenant `-`, leased/exclusive `23,729.34㎡`, no rent/cost | Source match. UI must not count `-` as a real tenant. | Treat `-`/blank tenant as vacancy or unknown placeholder in UI and Data Quality. |
| 아레나스양지물류센터 (`A112127001`) | `DB_일반` 8 rows, `DB_히스토리 누적` 70 rows | `ll_lease_spaces` 8 rows, latest `ll_rent_history` only 3 linked rows | General rows match. Rent-history linkage is incomplete for CJ대한통운 rows. | Keep 1~10 and B2~B1 sector aggregate display. Add DQ finding for unmatched CJ rent history rows. |
| 경산 쿠팡물류센터 (`A120085001`) | `DB_일반` 16 rows, source still has 3 wrong exclusive-area cells | `ll_rent_history` corrected 3 rows, but `ll_lease_spaces` has 14 rows due floor-only collision | Partial DB correction. `ll_lease_spaces` still loses 1F N and B2 N rows. | Rebuild lease_space_id to include temperature/space discriminator, then re-upsert 16 lease rows and refresh snapshots. |

## Key readback evidence

### 부산송정물류센터
- Excel `DB_일반` row 46: tenant `-`, leased area `23,729.34㎡`, exclusive area `23,729.34㎡`.
- Supabase `ll_assets`: `gross_floor_area_sqm=24,387.915`, `review_status=ok`.
- Supabase `ll_lease_spaces`: 1 row, tenant `-`, leased/exclusive `23,729.34㎡`, `current_monthly_* = null`, `e_noc = null`, `review_status=suspected_error`.
- Conclusion: this is not a valid tenant row. The dashboard should not display it as an occupied tenant.

### 아레나스양지물류센터
- Excel `DB_일반` rows:
  - row 11: CJ대한통운, `1~10`, leased `217,453.10㎡`, exclusive `176,761.80㎡`.
  - row 12-15: CJ대한통운, `B2~B1`, `1~5섹터`, `6섹터`, `7섹터`, `8~10섹터`.
  - row 16-18: 용마로지스, `B2`, `11섹터`, `12섹터`, `13~14섹터`.
- Supabase `ll_lease_spaces`: 8 rows and area sums match Excel: leased `272,218.30㎡`, exclusive `221,052.29㎡`.
- Supabase latest `ll_rent_history`: only 3 latest rows linked, all 용마로지스; CJ대한통운 rows remain mostly `review_required`/unmatched.
- Conclusion: user-visible “missing 1~10/B1/B2 7 sector” is not a source-row absence. It is either UI grouping/display or rent-history linkage incompleteness.

### 경산 쿠팡물류센터
- Excel `DB_일반` rows still show wrong source cells:
  - row 37: 1F N exclusive `8,970.67㎡`; user-corrected target `852.09㎡`.
  - row 38: 1F Y exclusive `8,970.67㎡`; user-corrected target `8,055.63㎡`.
  - row 40: B2 N exclusive `10,219.43㎡`; user-corrected target `1,444.85㎡`.
- Supabase `ll_rent_history` readback confirms corrected latest rows:
  - 1F N: `exclusive_area_sqm=852.09`, `review_status=corrected`.
  - 1F Y: `exclusive_area_sqm=8055.63`, `review_status=corrected`.
  - B2 N: `exclusive_area_sqm=1444.85`, `review_status=corrected`.
- Supabase `ll_lease_spaces` readback still has only 14 rows for a 16-row Excel asset because the current `lease_space_id` collapses N/Y rows on the same floor:
  - 1F row stores Y only.
  - B2 row stores Y only.
  - 1F N and B2 N are not separate lease-space rows.
- Snapshot `average_e_noc=48,215.98`, but lease-space aggregate `weighted_enoc=46,220.57` because of the collision.
- Conclusion: dashboard-level E.NOC can use snapshot/rent-history value, but Asset tenant table and Data Quality edit mapping need the lease-space key rebuild.

## Approval/mutation preview

No DB write was executed in this pass.

Required DB-side follow-up before final parity:
1. Add or rebuild a collision-proof key for `ll_lease_spaces`, at minimum including asset, tenant, contract period, floor, detail area, and temperature type.
2. Upsert 경산 16 lease-space rows so 1F N/Y and B2 N/Y are all preserved.
3. Refresh `ll_dashboard_metric_snapshots`.
4. Readback `ll_lease_spaces` row count and E.NOC aggregates for 경산.
5. Add Data Quality findings for 아레나스양지 CJ rent-history unmatched rows.
