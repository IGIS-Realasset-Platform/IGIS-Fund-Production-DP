# Fund safe transition batch checklist - 2026-05-20

## Batch scope

사용자가 승인한 5개 업무만 처리합니다.  
DB migration apply, Edge deploy, gh-pages deploy, commit/push는 이번 배치에서 하지 않습니다.

## Checklist

| # | Task | Status | Evidence |
|---:|---|---|---|
| 1 | 현재 live/DB baseline 고정 | 완료 | `deployment-protection-baseline-20260520.md` |
| 2 | `260520_물류센터 펀드 정보.xlsx` source inventory | 완료 | `fund-excel-source-inventory-20260520.md` |
| 3 | 펀드 스키마 additive migration preview/rollback/readback 작성 | 완료 | `fund-schema-additive-preview-20260520.sql`, `fund-schema-additive-rollback-20260520.sql`, `fund-schema-additive-readback-20260520.sql` |
| 4 | Edge/API 저장 흐름 위험 제거 코드 준비 | 부분 완료 | `funds/save-by-asset` direct write를 staging edit request로 변경. 배포/실서버 smoke는 미실행 |
| 5 | 화면 데이터 소스 영향 matrix 정리 | 완료 | `dashboard-data-source-impact-matrix-20260520.md` |

## Key decisions

- 펀드 정보는 기존 구두 항목보다 `260520_물류센터 펀드 정보.xlsx` 3개 시트의 실제 컬럼을 우선합니다.
- `ll_fund_beneficiary_tranches`와 `ll_fund_loan_tranches`는 지금 합치지 않습니다.
- 대주 정보의 `대출유형`, `이자유형`, `기준금리`, `가산금리`, `대출금리`, `수수료율`, `All-In`은 additive column으로만 보강합니다.
- 펀드개요 저장은 live table 직접 수정이 아니라 `ll_edit_requests`에 승인 요청으로만 접수합니다.
- Home/Asset/Company/PDF의 Supabase primary 전환은 이번 배치가 아니라 shadow diff 통과 후 별도 배치입니다.

## Remaining before live impact

1. additive migration SQL을 실제 Supabase에 적용하려면 사용자 재승인과 readback 실행이 필요합니다.
2. `ll-dashboard-api` 변경사항은 아직 live Edge Function에 배포하지 않았습니다.
3. `fund_overview` 승인 요청을 실제 펀드 테이블에 반영하는 관리자 승인 writer는 별도 후속 작업입니다.
4. 현재 배포 페이지는 이 배치로 변경되지 않았습니다.
