# Gate 6 progress tracker

- Updated: 2026-05-19
- Source of truth: `gate6-progress-tracker-20260515.json`
- Overall: 164 / 285 (57.5%)

| Stage | Area | Done/Total | Rate |
|---:|---|---:|---:|
| 2 | 공통 데이터 기준 | 8 / 17 | 47.1% |
| 3 | 업무 로그 메인 페이지 | 24 / 36 | 66.7% |
| 4 | Dashboard 공통 | 6 / 15 | 40.0% |
| 5 | Weekly 탭 | 12 / 16 | 75.0% |
| 6 | Home 탭 | 30 / 40 | 75.0% |
| 7 | Asset 탭 | 14 / 24 | 58.3% |
| 8 | Company 탭 | 10 / 15 | 66.7% |
| 9 | Pivot Table | 12 / 13 | 92.3% |
| 10 | Data Quality | 15 / 20 | 75.0% |
| 11 | Analysis Tools | 6 / 9 | 66.7% |
| 12 | 승인대기 대상 | 11 / 20 | 55.0% |
| 13 | 외부권한대기 대상 | 5 / 11 | 45.5% |
| 14 | QA 계획 | 11 / 32 | 34.4% |
| 15 | 최종 완료 기준 | 0 / 17 | 0.0% |

## Latest Session Updates

| Stage | ID | Status | Item |
|---:|---|---|---|
| 14 | 14.32 | partial | PDF Report 다중 페이지 A4 세로 출력, Asset 자산개요·투자개요 전체 행 연결, PDF 저장용 위치 지도 포함 변경에 대해 정적 QA와 preview build를 통과했다. 실제 브라우저 print preview에서 전체 페이지 수와 지도 표시 확인은 사용자 화면 QA로 남겨둔다. |
| 15 | 15.26 | partial | PDF Report가 선택 컴포넌트를 A4 세로로 끝까지 출력하도록 인쇄 CSS를 보정하고, Asset 탭 기준 자산개요·투자개요 전체 행 및 PDF 저장용 자산 위치 지도를 포함하도록 구현했다. 브라우저 PDF 저장 결과의 페이지 분할 최종 확인은 남아 있다. |
| 3 | 3.37 | partial | 지난 Task 관리 버튼으로 들어가는 archive 화면의 좌측 워크스페이스 탭을 물류센터 워크 플랫폼 하나만 남기도록 제한했다. 다른 IOTA/워크스페이스 탭은 archive 좌측에서 노출하지 않는다. |
| 14 | 14.33 | partial | PDF Report 및 지난 Task 관리 archive 좌측 탭 변경에 대해 ESLint와 preview build를 다시 통과했다. 실제 브라우저 PDF 저장 페이지 수와 archive 화면 시각 확인은 사용자 화면 QA로 남겨둔다. |

## Latest Verification

- ESLint target files: `npx eslint src/components/system/workspace/WorkspaceLogistics.jsx src/components/system/workspace/WorkspaceArchive.jsx` => pass.
- Preview build: `npm run build:preview` => success, bundle `assets/index-Bkkug4s1.js`.
- Static bundle/source readback: `pdf-static-map-print`, `자산 위치 지도`, `A4 portrait` strings present; archive sidebar maps `ARCHIVE_WORKSPACES` filtered to logistics.
