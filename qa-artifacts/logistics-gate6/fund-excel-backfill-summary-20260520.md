# Fund Excel Backfill Summary - 2026-05-20

Source workbook: `C:\Users\10524\Desktop\codex_realasset\Project\03_Logi_Leasing_Dashboard\260520_물류센터 펀드 정보.xlsx`

Workbook hash: `44fad30f487bfa0dc01f5497a386dae4880b899595d5b704b9f7a87c723364a7`

## Sheet Counts

| sheet | used range | expected cells | non-empty | formulas | errors | sheet hash |
|---|---:|---:|---:|---:|---:|---|
| 펀드 정보 | B2:L20 | 209 | 195 | 0 | 0 | `5f70a9077ec1ad56d79bc5d4f392c20a63d0d86b07174abfc1a40e1faae43692` |
| 수익자 정보 | B2:H55 | 378 | 318 | 0 | 0 | `42b10f3e49feffd4489d320b6a5b6a0d8fe0ab1af7a853973b5303c5a96576ec` |
| 대주 정보 | B2:Q54 | 848 | 646 | 0 | 0 | `ed14eb41e467ba275ed1799f459b3ce54309598bffbee7cb1a536733821e3c6c` |

## Target Rows

| target | rows |
|---|---:|
| ll_source_cells | 1435 |
| ll_source_field_registry | 34 |
| ll_funds | 15 |
| ll_fund_asset_links | 17 |
| ll_fund_beneficiary_tranches | 52 |
| ll_fund_loan_tranches | 51 |

## Safety

- Additive/upsert-only migration.
- Existing tables/columns are not dropped, renamed, or type-changed.
- Rollback is source-scoped to `260520_물류센터 펀드 정보.xlsx`.
- Browser clients still write through Edge Function approval flow only.
