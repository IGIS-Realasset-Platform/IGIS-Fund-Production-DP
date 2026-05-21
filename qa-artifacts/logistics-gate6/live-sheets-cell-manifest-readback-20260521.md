# live Google Sheets 17탭 cell-level manifest readback

- Checked at: 2026-05-21
- Supabase project: qvegpozwrcmspdvjokiz
- Import id: `live_google_sheets_20260512_cell_manifest`
- Source type/name: `live_google_sheets` / `IGIS_Logistics_Leasing_Data`
- Source CSV: `C:\Users\10524\Desktop\codex_realasset\Project\03_Logi_Leasing_Dashboard\qa-artifacts\source-diff\live-google-sheets-export\parsed-20260512\xlsx-cells.csv`
- Generator: `qa-artifacts/logistics-gate6/live-sheets-cell-manifest-generate-20260521.cjs`

## Workbook readback

| Metric | Expected | Supabase readback | Status |
|---|---:|---:|---|
| Sheets | 17 | 17 | pass |
| Cells, including blank cells | 181,470 | 181,470 | pass |
| Non-empty cells | 21,276 | 21,276 | pass |
| Formula cells | 9,994 | 9,994 | pass |
| Error cells | 13 | 13 | pass |
| Workbook hash | `bbda1d15013623a28aed301a82162dbb2b6f42ed3c29fa81080b775dfb30ab03` | `bbda1d15013623a28aed301a82162dbb2b6f42ed3c29fa81080b775dfb30ab03` | pass |

## Sheet-level readback

| Sheet | Cells | Non-empty | Formula | Error |
|---|---:|---:|---:|---:|
| `AUDIT_데이터이상` | 680 | 633 | 0 | 0 |
| `AuditLog` | 32 | 28 | 0 | 0 |
| `DB_계산` | 1,024 | 955 | 0 | 0 |
| `DB_기업` | 620 | 498 | 0 | 0 |
| `DB_일반` | 80,838 | 10,327 | 6,013 | 0 |
| `DB_자산` | 23,000 | 397 | 1 | 0 |
| `DB_히스토리 누적` | 22,816 | 5,230 | 1,982 | 13 |
| `LOG_API` | 49 | 43 | 0 | 0 |
| `LOG_검증` | 7 | 7 | 0 | 0 |
| `LOG_계산` | 6 | 6 | 0 | 0 |
| `meta_DB_일반` | 1,200 | 261 | 0 | 0 |
| `SYS_기업명정규화` | 8,000 | 1,168 | 999 | 0 |
| `SYS_설정` | 18 | 18 | 0 | 0 |
| `SYS_자산조회키` | 16,000 | 1,219 | 999 | 0 |
| `SYS_코드` | 36 | 36 | 0 | 0 |
| `이슈 리스트` | 27,000 | 307 | 0 | 0 |
| `펀드-자산-담당자 연결` | 144 | 143 | 0 | 0 |

## Source group readback

| Source type | Source name | Cells | Sheets |
|---|---|---:|---:|
| `live_google_sheets` | `IGIS_Logistics_Leasing_Data` | 181,470 | 17 |
| `xlsx` | `★ 260414_물류센터 임대차계약 DB_취합본.xlsx` | 13,752 | 5 |
| `xlsx` | `260520_물류센터 펀드 정보.xlsx` | 1,435 | 3 |

## Notes

- The first generated SQL used a CSV parser path that did not preserve formula cells correctly. The generator was corrected to preserve formula text and to upsert by `(import_id, sheet_name, row_number, column_number)` without changing existing `source_cell_id` values.
- The final readback confirms that the live Sheets 17-tab manifest is preserved at cell level, including blank cells, formulas, errors, sheet hashes, and workbook hash.
