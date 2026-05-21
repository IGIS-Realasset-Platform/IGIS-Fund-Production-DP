# Gate 6 Progress Tracker - Logistics Work Platform

- Updated at: 2026-05-21T18:40:00.000+09:00
- Overall: 212 / 317 (66.9%)
- Active work branch: `codex/logistics-gate6-post-deploy-updates`
- gh-pages deployment: not executed in this batch. Production deployment remains gated by user confirmation.

| Stage | Area | Done/Total | Rate |
| ---: | --- | ---: | ---: |
| 2 | 공통 데이터 기준 | 15 / 23 | 65.2% |
| 3 | 업무 로그 메인 페이지 | 32 / 42 | 76.2% |
| 4 | Dashboard 공통 | 8 / 16 | 50.0% |
| 5 | Weekly source data after tab removal | 3 / 4 | 75.0% |
| 6 | Home 탭 | 33 / 41 | 80.5% |
| 7 | Asset 탭 | 18 / 28 | 64.3% |
| 8 | Company 탭 | 10 / 15 | 66.7% |
| 9 | Pivot Table | 12 / 13 | 92.3% |
| 10 | Data Quality | 16 / 21 | 76.2% |
| 11 | Analysis Tools | 6 / 9 | 66.7% |
| 12 | DB / Edge / 배포 승인대기 | 22 / 30 | 73.3% |
| 13 | 외부권한대기 | 5 / 11 | 45.5% |
| 14 | QA 계획 | 29 / 49 | 59.2% |
| 15 | 최종 완료 기준 | 3 / 15 | 20.0% |

## Latest Priority Update

`Supabase 마이그레이션 및 연결 완료` parent item 기준으로 이번 batch를 갱신했습니다.

- `public.ll_*` catalog는 현재 34개 테이블입니다.
- 기존 legacy cleanup 완료:
  - `ll_worklogs`
  - `ll_dashboard_read_snapshots`
  - `ll_payload_snapshots`
- 추가 통합 cleanup 완료:
  - `ll_dashboard_metric_snapshots` 64행을 `ll_cache_entries(cache_type='dashboard_metric')`로 이관 후 DROP
  - `ll_external_api_cache` 3행을 `ll_cache_entries(cache_type='external_api')`로 이관 후 DROP
- 최신 catalog: 34 tables, 618 columns, missing PK 0, missing FK index 0, RLS disabled 0, cleanup candidates 0
- `ll_schema_metadata` 682행 생성 완료:
  - table metadata 36행
  - column metadata 646행
  - 삭제된 legacy cache table 2개는 inactive metadata로 보존
- `ll_asset_managers` 17행은 `260513_담당자별 권한 부여_수식 제거.xlsx` 기준으로 stale 조직명을 보정했습니다.
- 로그인/권한 기준 테이블 `ll_user_permissions`는 Supabase에 9행으로 존재하며, Edge Function이 런타임 권한 판단에 사용합니다.

## QA Evidence

- `npm run qa:supabase-catalog`: pass
- `npm run qa:logistics-primary-parity`: pass
- `npm run qa:data-quality-e2e`: pass
- `npm run qa:ai-chatbot`: pass
- `npm run qa:browser-visible-parity`: pass
- `npm run build:preview`: pass
- scoped ESLint on logistics files/scripts: pass
- `git diff --check`: pass
- dropped table runtime reference grep: Edge/src runtime 0건

## Current Completion Notes

- Home/Asset/Company/PDF/Analysis/Pivot은 실제 브라우저 화면 smoke 기준 Supabase primary-safe read path로 pass했습니다.
- Data Quality submit/approve/write/readback/audit end-to-end는 pass했습니다.
- AI 챗봇은 자산 수, 특정 자산 조회, 맥락 기반 E.NOC 후속 질문, production demo fallback 차단 QA를 통과했습니다.
- 정적 JSON은 401/403 fallback으로 쓰이지 않습니다. 일부 파일은 5xx/timeout 또는 print-safe 보조 fallback 용도로만 남아 있습니다.
- gh-pages 운영 배포는 이번 batch에서 수행하지 않았습니다.

## Remaining Risks

- 전체 repo `npm run lint`는 물류 작업과 무관한 루트 임시 파일과 기존 IOTA 컴포넌트 오류 때문에 실패합니다. 이번 변경 범위 scoped lint는 통과했습니다.
- `ll_schema_metadata`는 현재 table/column metadata를 자동 분류한 1차 버전입니다. 추후 다른 Supabase 테이블과 연결할 때 사람이 보는 설명 문구는 더 다듬을 수 있습니다.
- static JSON 파일의 물리적 삭제는 운영 화면 수동 확인 후 별도 처리하는 편이 안전합니다. 현재 핵심 데이터 경로는 Supabase primary-safe입니다.
