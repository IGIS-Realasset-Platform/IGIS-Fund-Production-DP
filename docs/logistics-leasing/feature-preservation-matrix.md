# Logistics Leasing Feature Preservation Matrix

이 문서는 기존 Apps Script 물류 임대차 대시보드를 React/Vite로 이식할 때 사용하는 실행 통제표입니다. 최종 계획안의 4대 기준표인 기능 보존 매트릭스, 데이터 매핑표, 권한 매트릭스, QA 체크표를 하나의 기준으로 연결합니다.

상태 표기는 `구현+검증`, `부분 구현`, `누락`, `검증 필요`를 사용합니다. 화면에 카드나 표가 보여도 원본처럼 클릭 상세, select/filter/search, chart, map, drawer/modal, 권한 동작이 이어지지 않으면 `부분 구현` 또는 `누락`입니다.

최근 QA 증거:
- `qa-artifacts/logistics-leasing/2026-05-11T05-50-42-644Z/summary.json`
- Playwright 확장 QA 81개 체크, 실패 0건
- 공개 payload scan: `public/logistics-leasing/data/dashboard.json` 위험 필드 0건, assets 17 / tenants 31 / leases 63 / rentHistory 164 / issues 18

## 기준표 연결

| 계획 항목 ID | 기준표 | 통제 목적 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- | --- |
| PLAN-STD-01 | 기능 보존 매트릭스 | Apps Script 탭별 컴포넌트와 클릭 이벤트 보존 | 부분 구현 | 현재 matrix가 실제 구현 상태를 계속 추적해야 함 | PM/기능 보존 담당 | 필요 |
| PLAN-STD-02 | 데이터 매핑표 | xlsx/Google Sheets fallback에서 `ll_*`/snapshot 전환 기준 관리 | 부분 구현 | weekly/admin/audit/savedViews snapshot 구조 부족 | 데이터 엔지니어 | 필요 |
| PLAN-STD-03 | 권한 매트릭스 | 읽기/쓰기/수정/삭제/종합 관리 권한별 UI 노출 통제 | 부분 구현 | 원본 Admin 인증 gate와 실행 버튼이 없음 | 보안/권한 담당 | 필요 |
| PLAN-STD-04 | QA 체크표 | 사용자가 직접 클릭 단위로 누락을 확인 | 부분 구현 | 탭별 클릭 대상이 실제 브라우저 증거로 분리되어야 함 | QA 담당 | 필요 |

## 공통 통제 항목

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| COMMON-P0-01 | Weekly, Home, Asset, Company, Sector, Tools, Playground, Quality, Admin 탭 전환 | 구현+검증 | 모든 탭 진입과 Admin 제목 QA 통과 | 프론트엔드 담당 | 확보 |
| COMMON-P0-02 | 탭/자산/기업 전역 검색 추천, Enter 이동, 추천 클릭 이동 | 구현+검증 | 검색 추천 클릭과 Asset 이동 QA 통과 | 프론트엔드 담당 | 확보 |
| COMMON-P0-03 | KPI 근거 modal, Asset/Tenant/detail drawer, backdrop/close | 부분 구현 | 상세 타입 축약, ESC/focus/surface close 검증 필요 | 프론트엔드 담당 | 필요 |
| COMMON-P0-04 | 주요 표 행 클릭 또는 키보드로 상세 열기 | 부분 구현 | 일부 표는 drawer가 아니라 단순 KeyGrid modal | 프론트엔드 담당 | 필요 |
| COMMON-P0-05 | chart 클릭 시 원본 표/근거 modal | 부분 구현 | Home/Company/Playground chart 클릭은 검증, Sector/Asset 전용 chart는 추가 필요 | 프론트엔드 담당 | 필요 |
| COMMON-P0-06 | 지도 크게 보기, 좌표 표, marker click, Naver/static/OSM/schematic fallback | 부분 구현 | 크게 보기/좌표 표/marker click 검증, 외부 지도 fallback은 추후 필요 | 프론트엔드 담당/인프라 담당 | 필요 |
| COMMON-P0-07 | 관리자 비밀번호 gate, 인증 전 데이터 차단, 권한별 버튼 노출 | 누락 | 권한 표만 있고 Admin 인증/실행 제어 없음 | 보안/권한 담당 | 필요 |
| COMMON-P1-01 | 표 헤더, 버튼, 상태 문구 한글 중심 | 검증 필요 | 탭 제목과 일부 상태 문구가 영어/축약 표현 | PM/QA 담당 | 필요 |

## Weekly

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| WEEKLY-P0-01 | 신규 투자 Projects 표와 행 상세 | 부분 구현 | `openIssues` fallback으로 대체되어 원본 weekly 신규 투자 payload가 아님 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| WEEKLY-P0-02 | 관리 Projects 표와 행 상세 | 부분 구현 | 자산 규모 순 목록으로 대체됨 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| WEEKLY-P0-03 | 자산현황 핵심/원문 보기 전환과 행 상세 | 부분 구현 | 원가, 현재시점대비, 준공, 저온비율, Fund/Loan 만기, Main Issue 컬럼 부족 | 프론트엔드 담당 | 필요 |
| WEEKLY-P0-04 | 총 자산/총 연면적/만기/이슈 KPI 상세 | 부분 구현 | 원본 만기 KPI와 만기 상세 범위 부족 | 프론트엔드 담당 | 필요 |
| WEEKLY-P1-01 | 기준 및 기타사항 notes 표시 | 부분 구현 | 원본 notes 대신 source 상태 중심 | 데이터 엔지니어 | 필요 |

## Home

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| HOME-P0-01 | 포트폴리오 KPI 클릭 근거 modal | 부분 구현 | 총 공실면적, 표시 임차인 수, 좌표 보유 자산 KPI 부족 | 프론트엔드 담당 | 필요 |
| HOME-P0-02 | 임대료 추이, 저온/상온, 섹터 구성 chart 클릭 상세 | 구현+검증 | 임대료/저온·상온/섹터/만기 chart 클릭 QA 통과 | 프론트엔드 담당 | 확보 |
| HOME-P0-03 | 포트폴리오 지도, marker click, 지도 크게 보기, 좌표 표 | 구현+검증 | marker drawer, 지도 크게 보기 modal, 좌표 표 modal QA 통과 | 프론트엔드 담당/인프라 담당 | 확보 |
| HOME-P0-04 | 공실/계약/임차인 표 행 클릭 상세 | 부분 구현 | Top Contracts 표, 만기 버킷 상세, tenant sort 전환 부족 | 프론트엔드 담당 | 필요 |

## Asset

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| ASSET-P0-01 | 자산 select 변경 시 전체 패널 갱신 | 검증 필요 | 검색형 선택과 원본 옵션 정렬/추천 부족 | 프론트엔드 담당 | 필요 |
| ASSET-P0-02 | 자산 KPI 클릭 근거 modal | 부분 구현 | E.NOC placeholder, 임차인별 월 임관리비, 만기 snapshot QA 통과. 실제 E.NOC 원본 필드는 snapshot 보강 필요 | 프론트엔드 담당/데이터 엔지니어 | 필요 |
| ASSET-P0-03 | 임차인 현황 행 클릭 시 Tenant drawer | 검증 필요 | roster 컬럼과 상세 필드 축약 | 프론트엔드 담당 | 필요 |
| ASSET-P0-04 | 층 고정/면적 비례 스태킹 플랜 | 부분 구현 | 표 형태만 있고 원본 시각형 stacking plan 없음 | 프론트엔드 담당 | 필요 |
| ASSET-P0-05 | 자산 위치 보기와 지도 fallback | 부분 구현 | 자산 위치 크게 보기/좌표 표는 검증, 외부 지도 fallback은 추후 필요 | 프론트엔드 담당/인프라 담당 | 필요 |
| ASSET-P1-01 | Area Breakdown | 구현+검증 | 면적 구성 chart를 Asset 탭에 추가 | 프론트엔드 담당 | 확보 |

## Company

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| COMPANY-P0-01 | 기업 select 변경 시 전체 패널 갱신 | 검증 필요 | 검색형 선택과 원본 옵션 동작 부족 | 프론트엔드 담당 | 필요 |
| COMPANY-P0-02 | Company KPI와 클릭 근거 modal | 구현+검증 | KPI 4종과 근거 modal QA 통과 | 프론트엔드 담당 | 확보 |
| COMPANY-P0-03 | 임차 자산 목록 행 클릭 시 Asset drawer | 검증 필요 | 원본 노출도 상세 부족 | 프론트엔드 담당 | 필요 |
| COMPANY-P0-04 | 계약 목록 행 클릭 시 계약 상세 | 부분 구현 | 단순 KeyGrid modal로 축약 | 프론트엔드 담당 | 필요 |
| COMPANY-P0-05 | 재무/운영/OpenDART snapshot 표시 | 부분 구현 | Edge Function 전환 대기 문구만 있고 실제 snapshot 없음 | 데이터 엔지니어/인프라 담당 | 필요 |
| COMPANY-P0-06 | 자산별 노출도 chart, mode 전환, 원본 표 보기 | 부분 구현 | 노출도 chart와 클릭 drawer QA 통과, mode 전환은 추가 필요 | 프론트엔드 담당 | 필요 |
| COMPANY-P1-01 | 기업 임차 자산 지도 | 구현+검증 | 임차 자산 지도와 크게 보기 modal QA 통과 | 프론트엔드 담당 | 확보 |

## Sector

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| SECTOR-P0-01 | 권역별 노출 chart/표와 권역 자산 상세 | 구현+검증 | 권역 chart와 chart click modal QA 통과 | 프론트엔드 담당 | 확보 |
| SECTOR-P0-02 | 만기 버킷 클릭 시 계약 modal | 부분 구현 | 실제 버킷이 아니라 계약 row 목록 | 프론트엔드 담당/데이터 엔지니어 | 필요 |
| SECTOR-P0-03 | 자산/임차인 랭킹 행 클릭 drawer | 검증 필요 | summary button과 상세 modal 범위 부족 | 프론트엔드 담당 | 필요 |
| SECTOR-P0-04 | 월 임관리비 추이 chart 클릭 원본 modal | 구현+검증 | Sector rent trend chart 클릭 modal QA 통과 | 프론트엔드 담당 | 확보 |
| SECTOR-P1-01 | 관리자 review/suspected error 상세 | 누락 | Admin lens의 검토 필요 자산 상세 없음 | 프론트엔드 담당/보안 담당 | 필요 |

## Analysis Tools

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| TOOLS-P0-01 | 자산/기업 체크박스 필터, 목록 내 검색, 적용 버튼 | 부분 구현 | 체크박스 필터와 적용 modal QA 통과, 목록 내 검색은 추가 필요 | 프론트엔드 담당 | 필요 |
| TOOLS-P0-02 | 비교 벤치마크 chart/표와 행 상세 | 부분 구현 | 표는 있으나 benchmark chart와 원본 표 보기 modal 없음 | 프론트엔드 담당 | 필요 |
| TOOLS-P0-03 | 계약 원장 행 클릭 시 계약/Tenant 상세 | 부분 구현 | 계약 원장은 단순 modal이며 Tenant drawer 연결 없음 | 프론트엔드 담당 | 필요 |
| TOOLS-P0-04 | 선택 자산/기업 summary 버튼 클릭 상세 | 누락 | 선택 summary 버튼과 Asset/Tenant 상세 연결 없음 | 프론트엔드 담당 | 필요 |

## Data Playground

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| PLAYGROUND-P0-01 | mode, row/column/filter, metric, Top N 쿼리 조건 | 부분 구현 | mode/filter/metric/Top N QA 통과, column dimension은 추가 필요 | 프론트엔드 담당 | 필요 |
| PLAYGROUND-P0-02 | 저장 view 클릭 시 조건 반영 | 구현+검증 | saved view 3종 버튼 클릭 QA 통과 | 프론트엔드 담당/데이터 엔지니어 | 확보 |
| PLAYGROUND-P0-03 | 결과 표/차트와 행/차트 클릭 원본 modal | 구현+검증 | 결과 표와 chart 클릭 modal QA 통과 | 프론트엔드 담당 | 확보 |

## Data Quality

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| QUALITY-P0-01 | 이슈 목록 행 클릭 상세 modal | 검증 필요 | 행 상세는 있으나 원본 Critical/Warning/Info severity와 suggested fix 구조가 아님 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| QUALITY-P0-02 | severity, sheet, field 그룹 필터 | 부분 구현 | status/sheet 필터와 sheet group chart QA 통과, field 그룹은 추가 필요 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| QUALITY-P0-03 | audit 실행 결과, 정적 스냅샷 오류, review backlog 연결 | 누락 | Admin audit 결과와 연결되지 않음 | 데이터 엔지니어/Admin 담당 | 필요 |
| QUALITY-P1-01 | 필드 사전과 품질 이슈 도움말 연결 | 검증 필요 | 필드 사전은 있으나 이슈 연결 도움말 없음 | 데이터 엔지니어 | 필요 |

## Admin/Permissions

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| ADMIN-P0-01 | Admin Console 탭 | 구현+검증 | Admin 탭, 실행 콘솔, 권한 구조가 QA 통과 | Admin 담당/프론트엔드 담당 | 확보 |
| ADMIN-P0-02 | 관리자 비밀번호 gate와 인증 전 데이터 차단 | 누락 | 인증 UI와 세션 차단 없음 | 보안/권한 담당 | 필요 |
| ADMIN-P0-03 | 계산 갱신, OpenDART, 건축물대장, 감사, 정합성, 스냅샷, 트리거 실행 버튼 | 부분 구현 | read-only 실행 버튼과 확인 modal QA 통과, 실제 서버 실행은 추후 Edge Function 필요 | Admin 담당/인프라 담당 | 필요 |
| ADMIN-P0-04 | 관리자 검토 타일과 상세 modal | 구현+검증 | 검토 타일과 상세 modal QA 통과 | Admin 담당/프론트엔드 담당 | 확보 |
| ADMIN-P0-05 | 감사 로그와 UI-DB 정합성 상세 | 부분 구현 | 감사 로그 row 상세는 구현, UI-DB 정합성 상세는 추가 필요 | Admin 담당/데이터 엔지니어 | 필요 |

## 주요 리스크와 대응

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| RISK-P0-01 | 기능 100% 보존 | 부분 구현 | 보이는 표만으로 기능 보존으로 오판할 위험 | PM/기능 보존 담당 | 필요 |
| RISK-P0-02 | 데이터 계약 보존 | 부분 구현 | fallback JSON에 weekly/admin/audit/savedViews가 부족해 UI 복구가 막힐 위험 | 데이터 엔지니어 | 필요 |
| RISK-P0-03 | 관리자 실행 보안 | 누락 | 프론트에서 secret을 다루거나 실행 버튼을 잘못 노출할 위험 | 보안/권한 담당 | 필요 |
| RISK-P0-04 | 지도 외부 API | 부분 구현 | Naver/static/OSM fallback 없이 지도 기능이 축소될 위험 | 인프라 담당 | 필요 |
| RISK-P1-01 | 한글 업무 문구 | 검증 필요 | 영어 탭/상태/축약 문구가 원본 사용성을 해칠 위험 | PM/QA 담당 | 필요 |

## 완료 조건

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| EXIT-P0-01 | 8개 탭과 권한 기반 Admin의 P0 항목 | 부분 구현 | P0가 하나라도 `누락`이면 출하 기준 미달 | PM/기능 보존 담당 | 필요 |
| EXIT-P0-02 | 모든 KPI/표 행/지도/차트/select/filter/search 클릭 증거 | 검증 필요 | 코드 구현만 있고 브라우저 증거가 없으면 판단 불가 | QA 담당 | 필요 |
| EXIT-P0-03 | 4대 기준표 간 일치 | 부분 구현 | 기능표, 데이터표, 권한표, QA표가 서로 다른 상태를 말할 위험 | PM/기능 보존 담당 | 필요 |
| EXIT-P0-04 | 보안 키 미노출과 non-`ll_*` mutation 0건 | 검증 필요 | Supabase/OpenDART/건축물대장 키 노출 위험 | 보안/권한 담당 | 필요 |
