# Dashboard data-source impact matrix - 2026-05-20

이 문서는 사용자용 설명 자료가 아니라, 현재 화면이 어떤 데이터 경로에 묶여 있는지 제가 바로 판단하기 위한 작업용 매트릭스입니다.

## 전환 원칙

- 현재 배포 화면을 깨지 않기 위해 정적 JSON fallback은 유지합니다.
- 정상 목표 경로는 `Supabase ll_* -> ll-dashboard-api -> React 화면`입니다.
- 401/403은 fallback으로 우회하지 않습니다. 권한 없는 데이터가 정적 JSON으로 보이면 안 됩니다.
- 5xx, timeout, shape mismatch만 임시 fallback 허용 대상입니다.

## Component matrix

| Area | Component | Current primary source | Supabase/API target | Current status | Risk | Next action |
|---|---|---|---|---|---|---|
| Work Platform | 관리 Project 현황 | `ll_weekly_assets` via Edge, fallback seed remains | `weekly-assets/latest` | partially Supabase | fallback notice/seed can mask DB issue | keep DB read primary, remove user-facing fallback notices only after Edge stable |
| Work Platform | 주요 TASK 관리 | `ll_work_platform_tasks` via Edge | same | Supabase connected | write/delete depends on Edge deploy | no schema change in this batch |
| Work Platform | 협업게시판 | `ll_work_platform_board_posts` via Edge | same | Supabase connected | stakeholder source still separate backlog | no schema change in this batch |
| Home | KPI cards | static logistics payload + shadow read | `dashboard/home/read` | shadow needed | static number can drift from DB | compare static summary vs API summary before primary |
| Home | 용도별 비율 | static asset rows | `dashboard/home/read` lease spaces | shadow needed | area category mapping differences | keep JSON fallback until category parity passes |
| Home | 월 임관리비 비중 | static lease/rent payload | `dashboard/home/read` rent/spaces | shadow needed | rent history basis-date mismatch | basis_date must remain `2026-04-30` |
| Home | 계약 이력 기준 임대료 추이 | static rent history snapshot | `dashboard/home/read` rent history | shadow needed | series and total area need exact parity | do not remove existing chart payload |
| Home | 만기/권역 | static derived rows | `dashboard/home/read` assets/spaces | shadow needed | region mapping and expiry aggregation | API must return evidence/warnings before primary |
| Asset | KPI cards | static asset payload + server detail | `dashboard/asset/read` | shadow/read exists | asset-specific fallback can hide missing rows | inspect 17 assets before primary |
| Asset | 자산개요·투자개요 | `ll_weekly_assets` detail via Edge | `weekly-projects/get-asset-detail` | Supabase connected | edit/save still direct approved path for these fields | keep as-is in this batch |
| Asset | 펀드개요 | `ll_funds` family via Edge + fallback empty rows | `funds/read-by-asset`, `funds/save-by-asset` staging | code prepared | schema missing Excel-native lender columns until migration | additive preview/readback required before deploy |
| Asset | 임차인 현황 | static asset rows | `dashboard/asset/read` lease spaces | shadow needed | 아레나스양지/부산송정/화성 edge cases | use existing readback evidence, do not rerun blindly |
| Asset | 층별 배치 | static asset rows | `dashboard/asset/read` lease spaces | shadow needed | floor/zone split can differ from UI | adapter must preserve current display shape |
| Asset | 만기 스냅샷 | static asset rows | `dashboard/asset/read` lease spaces | shadow needed | basis date and empty tenant rows | keep fallback until 17-asset visual QA |
| Company | KPI cards | static company payload | `dashboard/company/read` | shadow/read exists | company selection propagation | no primary until per-company diff passes |
| Company | 임차 자산 현황 | static company rows | `dashboard/company/read` spaces/assets | shadow needed | table width/UI separate from data | adapter first, UI second |
| Company | 지도/노출도 | static company rows + asset map payload | `dashboard/company/read` spaces/assets | shadow needed | coordinates remain asset-level | no schema migration needed |
| Company | DART 영역 | Edge external API/cache | `opendart/company` | external API path | provider/key/rate risks | outside this batch |
| PDF Report | Asset components | React-selected current payload + fund read | same source as screen | partial | PDF can differ from Asset if fallback differs | keep same helper functions as Asset |
| Analysis Tools | comparison/benchmark | static derived rows | future `dashboard/read` or dedicated API | not primary | broad feature surface | defer until Home/Asset/Company stable |
| Pivot Table | pivot rows | static/current in-browser rows | future normalized read | not primary | user-selected arbitrary fields | defer until core read primary |
| Data Quality | edit requests | `ll_edit_requests` via Edge | same + future fund-specific approval writer | partial | fund overview request currently staging only | add fund-specific approval writer in later batch |

## Immediate consequence

이번 배치에서 할 수 있는 안전한 일은 아래 3가지입니다.

1. 펀드 엑셀 컬럼을 손실 없이 받을 수 있게 additive preview를 만든다.
2. 펀드 저장은 실제 write가 아니라 승인 요청으로만 접수되게 한다.
3. 화면 fallback 정책에서 401/403 우회를 막는다.

이번 배치에서 하지 않는 일은 아래입니다.

1. 정적 JSON fallback 삭제.
2. 기존 테이블/컬럼 drop 또는 merge.
3. Home/Asset/Company primary 전환.
4. gh-pages 또는 Edge Function 배포.
