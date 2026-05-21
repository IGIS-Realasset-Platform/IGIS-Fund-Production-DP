# Fund Excel source inventory - 2026-05-20

## Workbook

- File: `C:\Users\10524\Desktop\codex_realasset\Project\03_Logi_Leasing_Dashboard\260520_물류센터 펀드 정보.xlsx`
- Workbook hash: `67cbea2ba4476eafb8870ae09009dfee44b766d123e3735481fc6fc4a0ac4570`
- Sheet count: 3
- This inventory is source inspection only. It does not write to Supabase.

## Sheet summary

| Sheet | Used range | Used rows | Used cols | Data rows | Used cells | Non-empty cells | Sheet hash |
|---|---|---:|---:|---:|---:|---:|---|
| `펀드 정보` | `B2:L20` | 19 | 11 | 17 | 209 | 191 | `ccd535861b644eeeda6b55ed7b55d156f4316eea06482f5703c9cb0015fb7847` |
| `수익자 정보` | `B2:H55` | 54 | 7 | 52 | 378 | 318 | `5bcd5b589ef746bda982bb531c680de35f32ae10ecd29df8d93598c77b8e0efa` |
| `대주 정보` | `B2:Q54` | 53 | 16 | 51 | 848 | 646 | `a8a1022a1347cf3faad12c4a1c0b50b4d84c404973489b499715f8f9fd6e8933` |

## Column mapping

### `펀드 정보`

| Excel column | Target |
|---|---|
| 자산코드 | `ll_fund_asset_links.asset_code`, join to `ll_assets.asset_code` |
| 자산명 | `ll_fund_asset_links.asset_name`, join fallback |
| 펀드코드 | `ll_funds.fund_code`, fund id seed |
| 펀드명 | `ll_funds.fund_name` |
| 약칭 | `ll_funds.short_name` |
| 법적형태 | `ll_funds.legal_form` |
| 투자섹터 | `ll_funds.investment_sector` |
| 펀드유형 | `ll_funds.fund_type` |
| 투자전략 | `ll_funds.investment_strategy` |
| 최초설정일 | `ll_funds.initial_setup_date` |
| 만기일 | `ll_funds.maturity_date` |

### `수익자 정보`

| Excel column | Target |
|---|---|
| 자산코드 | join/evidence |
| 자산명 | join/evidence |
| 펀드코드 | join to `ll_funds.fund_code` |
| 펀드명 | evidence |
| Tranche | `ll_fund_beneficiary_tranches.tranche` |
| 수익자 | `ll_fund_beneficiary_tranches.beneficiary_name` |
| 투입금액(원) | `ll_fund_beneficiary_tranches.committed_amount_krw` |

### `대주 정보`

| Excel column | Target |
|---|---|
| 자산코드 | join/evidence |
| 자산명 | join/evidence |
| 펀드코드 | join to `ll_funds.fund_code` |
| 펀드명 | evidence |
| 대출유형 | new additive `ll_fund_loan_tranches.loan_type` |
| Tranche | `ll_fund_loan_tranches.tranche` |
| 대주 | `ll_fund_loan_tranches.lender_name` |
| 인출금액(원) | `ll_fund_loan_tranches.committed_amount_krw` |
| 인출시점 | `ll_fund_loan_tranches.drawdown_date` |
| 만기시점 | `ll_fund_loan_tranches.maturity_date` |
| 이자유형 | new additive `ll_fund_loan_tranches.interest_type` |
| 기준금리(%) | new additive `ll_fund_loan_tranches.base_rate` |
| 가산금리(%) | new additive `ll_fund_loan_tranches.spread_rate` |
| 대출금리(%) | new additive `ll_fund_loan_tranches.loan_rate` |
| 수수료율(%) | new additive `ll_fund_loan_tranches.fee_rate` |
| All-In(%) | new additive `ll_fund_loan_tranches.all_in_rate` |

## Required before Supabase write

- Preserve this workbook as a distinct source identity: `260520_물류센터 펀드 정보.xlsx`.
- Preserve all three sheet names and their sheet hashes.
- Register field mappings in `ll_source_field_registry`.
- Backfill preview must show 17 fund-info rows, 52 beneficiary rows, and 51 lender rows before any insert/upsert.
