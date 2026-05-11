# Logistics Leasing QA Checklist

이 체크리스트는 기능 보존 매트릭스의 계획 항목 ID를 실제 브라우저 증거로 확인하기 위한 표입니다. 각 항목은 `계획 항목 ID, 기존 기능 기준, 현재 React 반영 상태, 누락/위험, 담당 에이전트, QA 증거 필요 여부` 형식을 유지합니다.

## QA 증거 기준

최근 자동 QA 증거:
- `qa-artifacts/logistics-leasing/2026-05-11T05-50-42-644Z/summary.json`
- 81개 체크, 실패 0건
- 확인 범위: 검색 추천 이동, 전체 탭 진입, Home KPI/표/지도/임대료·저온·섹터·만기 차트, Home 지도 상세/좌표 표, Asset select/E.NOC/임차인별 비용/만기/지도 상세, Company select/KPI/지도/노출도, Sector 권역·임관리비 차트, Tools 체크 필터/적용, Playground Top N/저장 View/차트, Quality sheet 필터/chart, Admin 실행/검토, 모바일 overflow, visible secret marker, 한글 replacement char, console/http/request failure

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| QA-STD-01 | 클릭 동작 증거 | 검증 필요 | screenshot만으로는 클릭 후 상세 동작 확인 불가 | QA 담당 | 필요 |
| QA-STD-02 | select/filter/search 증거 | 검증 필요 | 값 변경 전후 결과 비교가 없으면 판단 불가 | QA 담당 | 필요 |
| QA-STD-03 | modal/drawer 닫기 증거 | 검증 필요 | 닫기 버튼, backdrop, ESC 동작 누락 위험 | QA 담당 | 필요 |
| QA-STD-04 | 권한/Admin 증거 | 검증 필요 | 권한 없는 버튼 노출 또는 실행성 기능 누락 위험 | 보안/권한 담당 | 필요 |

## 공통 기능 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| COMMON-P0-01 | Weekly, Home, Asset, Company, Sector, Tools, Playground, Quality, Admin 탭 전환 | 구현+검증 | 전체 탭 heading QA 통과 | 프론트엔드 담당 | 확보 |
| COMMON-P0-02 | 탭/자산/기업 전역 검색 추천, Enter 이동, 추천 클릭 이동 | 구현+검증 | 검색 추천 표시와 Asset 이동 QA 통과 | 프론트엔드 담당 | 확보 |
| COMMON-P0-03 | KPI modal, drawer, backdrop, close | 부분 구현 | ESC/focus/surface close 검증 필요 | 프론트엔드 담당 | 필요 |
| COMMON-P0-04 | 표 행 클릭 또는 키보드 상세 열기 | 부분 구현 | 일부 표가 단순 modal로 축약됨 | 프론트엔드 담당 | 필요 |
| COMMON-P0-05 | chart 클릭 원본 modal | 부분 구현 | Home/Company/Playground chart QA 통과, Asset/Sector 전용 chart는 추가 필요 | 프론트엔드 담당 | 필요 |
| COMMON-P0-06 | 지도 marker, 크게 보기, 좌표 표, fallback | 부분 구현 | marker/크게 보기/좌표 표 QA 통과, 외부 지도 fallback은 추가 필요 | 프론트엔드 담당/인프라 담당 | 필요 |
| COMMON-P1-01 | 한글 표기와 모바일 overflow | 검증 필요 | 영어/축약 문구, 긴 텍스트 overflow 위험 | PM/QA 담당 | 필요 |

## Weekly 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| WEEKLY-P0-01 | 신규 투자 Projects 행 클릭 상세 | 부분 구현 | fallback 이슈 목록으로 대체됨 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| WEEKLY-P0-02 | 관리 Projects 행 클릭 상세 | 부분 구현 | 자산 규모 순 목록으로 대체됨 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| WEEKLY-P0-03 | 자산현황 core/full 전환과 원문 컬럼 | 부분 구현 | 원문 컬럼 축약 | 프론트엔드 담당 | 필요 |
| WEEKLY-P0-04 | 총 자산/총 연면적/만기/이슈 KPI 상세 | 부분 구현 | 만기 KPI와 만기 상세 부족 | 프론트엔드 담당 | 필요 |
| WEEKLY-P1-01 | 기준 및 기타사항 notes | 부분 구현 | source 상태 중심 표시 | 데이터 엔지니어 | 필요 |

## Home 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| HOME-P0-01 | 포트폴리오 KPI 클릭 근거 modal | 부분 구현 | 일부 KPI 부족 | 프론트엔드 담당 | 필요 |
| HOME-P0-02 | 임대료/저온/섹터 chart 클릭 상세 | 구현+검증 | 임대료/저온·상온/섹터/만기 chart QA 통과 | 프론트엔드 담당 | 확보 |
| HOME-P0-03 | 지도 marker, 크게 보기, 좌표 표 | 구현+검증 | marker drawer, 크게 보기 modal, 좌표 표 modal QA 통과 | 프론트엔드 담당/인프라 담당 | 확보 |
| HOME-P0-04 | 공실/계약/임차인/만기 행 클릭 상세 | 부분 구현 | Top Contracts, 만기 버킷, sort 전환 부족 | 프론트엔드 담당 | 필요 |

## Asset 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| ASSET-P0-01 | 자산 select 변경 후 패널 갱신 | 부분 구현 | select 변경 QA 통과, 검색형 선택은 추가 필요 | 프론트엔드 담당 | 필요 |
| ASSET-P0-02 | 자산 KPI, E.NOC, 만기, 임차인별 비용 상세 | 부분 구현 | E.NOC placeholder와 임차인별 비용/만기 chart QA 통과, 실제 E.NOC 원본 필드는 snapshot 보강 필요 | 프론트엔드 담당/데이터 엔지니어 | 필요 |
| ASSET-P0-03 | 임차인 현황 행 클릭 Tenant drawer | 검증 필요 | 컬럼 축약 | 프론트엔드 담당 | 필요 |
| ASSET-P0-04 | 시각형 스태킹 플랜 | 부분 구현 | 표 형태로 축약 | 프론트엔드 담당 | 필요 |
| ASSET-P0-05 | 자산 위치 상세와 지도 fallback | 부분 구현 | 자산 지도 크게 보기 QA 통과, 외부 지도 fallback은 추가 필요 | 프론트엔드 담당/인프라 담당 | 필요 |
| ASSET-P1-01 | Area Breakdown | 구현+검증 | 면적 구성 chart 추가 | 프론트엔드 담당 | 확보 |

## Company 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| COMPANY-P0-01 | 기업 select 변경 후 패널 갱신 | 부분 구현 | select 변경 QA 통과, 검색형 선택은 추가 필요 | 프론트엔드 담당 | 필요 |
| COMPANY-P0-02 | Company KPI 클릭 근거 modal | 구현+검증 | KPI 4종과 modal QA 통과 | 프론트엔드 담당 | 확보 |
| COMPANY-P0-03 | 임차 자산 행 클릭 Asset drawer | 검증 필요 | 노출도 상세 부족 | 프론트엔드 담당 | 필요 |
| COMPANY-P0-04 | 계약 목록 행 클릭 상세 | 부분 구현 | 단순 KeyGrid modal | 프론트엔드 담당 | 필요 |
| COMPANY-P0-05 | 재무/운영/OpenDART snapshot | 부분 구현 | 전환 대기 문구만 있음 | 데이터 엔지니어/인프라 담당 | 필요 |
| COMPANY-P0-06 | 자산별 노출도 chart/mode/detail | 부분 구현 | 노출도 chart와 drawer QA 통과, mode 전환은 추가 필요 | 프론트엔드 담당 | 필요 |
| COMPANY-P1-01 | 기업 임차 자산 지도 | 구현+검증 | 기업 지도 크게 보기 QA 통과 | 프론트엔드 담당 | 확보 |

## Sector 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| SECTOR-P0-01 | 권역별 노출 chart/표와 권역 자산 상세 | 구현+검증 | 권역 chart click modal QA 통과 | 프론트엔드 담당 | 확보 |
| SECTOR-P0-02 | 만기 버킷 클릭 계약 modal | 부분 구현 | 버킷이 아닌 계약 row 목록 | 프론트엔드 담당/데이터 엔지니어 | 필요 |
| SECTOR-P0-03 | 자산/임차인 랭킹 행 클릭 drawer | 검증 필요 | summary button 부족 | 프론트엔드 담당 | 필요 |
| SECTOR-P0-04 | 월 임관리비 추이 chart 클릭 원본 modal | 구현+검증 | Sector trend chart click modal QA 통과 | 프론트엔드 담당 | 확보 |
| SECTOR-P1-01 | 관리자 review/suspected error 상세 | 누락 | Admin lens 없음 | 프론트엔드 담당/보안 담당 | 필요 |

## Analysis Tools 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| TOOLS-P0-01 | 자산/기업 체크박스 필터, 목록 검색, 적용 버튼 | 부분 구현 | 체크박스 필터와 적용 QA 통과, 목록 내 검색은 추가 필요 | 프론트엔드 담당 | 필요 |
| TOOLS-P0-02 | 비교 벤치마크 chart/표와 원본 modal | 부분 구현 | chart와 원본 표 보기 부족 | 프론트엔드 담당 | 필요 |
| TOOLS-P0-03 | 계약 원장 행 클릭 Tenant/계약 상세 | 부분 구현 | Tenant drawer 연결 없음 | 프론트엔드 담당 | 필요 |
| TOOLS-P0-04 | 선택 자산/기업 summary 버튼 상세 | 누락 | summary 버튼 없음 | 프론트엔드 담당 | 필요 |

## Data Playground 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| PLAYGROUND-P0-01 | mode, row/column/filter, metric, Top N 조건 | 부분 구현 | mode/filter/metric/Top N QA 통과, column dimension은 추가 필요 | 프론트엔드 담당 | 필요 |
| PLAYGROUND-P0-02 | saved view 클릭 조건 반영 | 구현+검증 | saved view 클릭 QA 통과 | 프론트엔드 담당/데이터 엔지니어 | 확보 |
| PLAYGROUND-P0-03 | 결과 표/차트와 클릭 원본 modal | 구현+검증 | 결과 chart 클릭 modal QA 통과 | 프론트엔드 담당 | 확보 |

## Data Quality 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| QUALITY-P0-01 | 이슈 목록 행 클릭 상세 modal | 검증 필요 | 원본 severity/suggested fix 구조 아님 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| QUALITY-P0-02 | severity, sheet, field 그룹 필터 | 부분 구현 | status/sheet 필터와 sheet chart QA 통과, field 그룹은 추가 필요 | 데이터 엔지니어/프론트엔드 담당 | 필요 |
| QUALITY-P0-03 | audit 결과, 스냅샷 오류, review backlog 연결 | 누락 | Admin audit와 분리됨 | 데이터 엔지니어/Admin 담당 | 필요 |
| QUALITY-P1-01 | 필드 사전과 품질 이슈 도움말 연결 | 검증 필요 | 연결 도움말 없음 | 데이터 엔지니어 | 필요 |

## Admin/Permissions 탭 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| ADMIN-P0-01 | Admin Console 탭 | 구현+검증 | Admin 실행 콘솔 탭 QA 통과 | Admin 담당/프론트엔드 담당 | 확보 |
| ADMIN-P0-02 | 관리자 비밀번호 gate와 인증 전 차단 | 누락 | 인증 UI 없음 | 보안/권한 담당 | 필요 |
| ADMIN-P0-03 | 관리자 실행 버튼 7종 | 부분 구현 | read-only 실행 버튼과 확인 modal QA 통과, 실제 서버 실행은 추후 필요 | Admin 담당/인프라 담당 | 필요 |
| ADMIN-P0-04 | 관리자 검토 타일 상세 | 구현+검증 | 검토 타일 modal QA 통과 | Admin 담당/프론트엔드 담당 | 확보 |
| ADMIN-P0-05 | 감사 로그와 UI-DB 정합성 상세 | 부분 구현 | 감사 로그는 구현, UI-DB 정합성 상세는 추가 필요 | Admin 담당/데이터 엔지니어 | 필요 |

## 데이터 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| DATA-P0-01 | 예비 JSON source가 xlsx/Google Sheets 계열로 표시 | 검증 필요 | source 표시와 실제 payload 근거 비교 필요 | 데이터 엔지니어/QA 담당 | 필요 |
| DATA-P0-02 | Supabase 전환 전 DB write 없음 | 검증 필요 | 네트워크/API 호출 증거 필요 | 데이터 엔지니어/보안 담당 | 필요 |
| DATA-P0-03 | weekly/admin/audit/reconciliation/savedViews snapshot | 부분 구현 | 현재 JSON 구조 부족 | 데이터 엔지니어 | 필요 |
| DATA-P0-04 | `ll_payload_snapshots` 전환 기준 | 부분 구현 | readback 기준과 source 전환 증거 필요 | 데이터 엔지니어 | 필요 |

## 보안 QA

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| SEC-P0-01 | 서버 전용 권한 키 프론트 미노출 | 부분 구현 | 물류 신규 파일/공개 JSON/visible text scan 통과, 기존 IFPDP 전체 auth bundle은 별도 범위 | 보안/권한 담당 | 필요 |
| SEC-P0-02 | OpenDART key 프론트 미노출 | 검증 필요 | Edge Function 전환 전 노출 위험 | 보안/권한 담당 | 필요 |
| SEC-P0-03 | 건축물대장 key 프론트 미노출 | 검증 필요 | Edge Function 전환 전 노출 위험 | 보안/권한 담당 | 필요 |
| SEC-P0-04 | 관리자 비밀번호 미저장 | 검증 필요 | Admin gate 구현 시 저장 위치 확인 필요 | 보안/권한 담당 | 필요 |
| SEC-P0-05 | non-`ll_*` mutation 0건 | 검증 필요 | Supabase 정책/로그 확인 필요 | 보안/데이터 담당 | 필요 |

## 출하 전 조건

| 계획 항목 ID | 기존 기능 기준 | 현재 React 반영 상태 | 누락/위험 | 담당 에이전트 | QA 증거 필요 여부 |
| --- | --- | --- | --- | --- | --- |
| EXIT-P0-01 | 기능 보존 매트릭스 P0 항목 | 부분 구현 | P0 `누락`이 남으면 사용자 기능 보존 실패 | PM/기능 보존 담당 | 필요 |
| EXIT-P0-02 | 데이터 매핑표와 실제 payload | 부분 구현 | 화면은 있어도 원본 데이터 계약이 없으면 재현 불가 | 데이터 엔지니어 | 필요 |
| EXIT-P0-03 | 권한 매트릭스와 Admin UI | 누락 | 권한 기반 Admin이 없으면 운영 기능 복구 불가 | 보안/Admin 담당 | 필요 |
| EXIT-P0-04 | QA 체크표의 브라우저 증거 | 검증 필요 | 문서 체크만 있고 화면 증거가 없으면 판단 불가 | QA 담당 | 필요 |
