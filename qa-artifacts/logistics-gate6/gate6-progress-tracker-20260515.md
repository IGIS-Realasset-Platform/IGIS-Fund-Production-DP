# Gate 6 progress tracker

- Updated: 2026-05-19
- Overall: 149 / 232 (64.2%)
- Note: 최신 기준은 `gate6-progress-tracker-20260515.json`입니다. 이번 갱신은 Supabase weekly seed/readback, 지난 Task 관리 logistics archive, Home 월 임관리비 아레나스양지 stale 값 보정, Home 연면적 series, Asset 자산개요·투자개요 패널, ll_* 스키마 정리 감사 항목을 반영했습니다.

| 단계 | 영역 | 완료/전체 |
|---:|---|---:|
| 2 | 공통 데이터 기준 | 7 / 16 |
| 3 | 업무 로그 메인 페이지 | 22 / 27 |
| 4 | Dashboard 공통 | 6 / 11 |
| 5 | Weekly 탭 | 12 / 16 |
| 6 | Home 탭 | 28 / 34 |
| 7 | Asset 탭 | 11 / 14 |
| 8 | Company 탭 | 10 / 14 |
| 9 | Data Playground | 10 / 11 |
| 10 | Data Quality | 15 / 19 |
| 11 | Analysis Tools | 4 / 6 |
| 12 | 승인대기 대상 | 9 / 16 |
| 13 | 외부권한대기 대상 | 5 / 11 |
| 14 | QA 계획 | 10 / 23 |
| 15 | 최종 완료 기준 | 0 / 14 |

## 이번 완료/부분 반영

| 단계 | ID | 상태 | 항목 |
|---:|---|---|---|
| 2 | 2.15 | partial | 워크플랫폼/대시보드 데이터는 Supabase ll_* 기준으로 전환 중이며, 이번 세션에서 RA부문_사업그룹4파트_주간업무자료 260427의 자산현황 20건과 관리 Projects 5건을 ll_weekly_*에 적재하고 readback했다. |
| 2 | 2.16 | partial | ll_* 스키마 정리 요청을 편입했다. information_schema와 pg_stat_user_tables read-only 조회로 테이블·컬럼·jsonb/payload 계열 현황을 확인했으며 실제 삭제/정규화는 별도 승인대기다. |
| 3 | 3.29 | done | 물류센터 주요 TASK 관리의 지난 Task 관리 화면을 logistics archive로 재구성했다. ll_work_platform_tasks를 주차별로 묶고 Edge include_archived 옵션을 배포했다. Evidence: current-request-data-task-static-qa-20260519 pass, ll-dashboard-api version 29. |
| 6 | 6.33 | partial | Home 월 임관리비 비중의 아레나스양지 stale 값 552,212,356원을 Asset 탭 상세 payload 기준 2,468,703,091원으로 보정했다. 현재 로컬 static QA 기준 17개 자산 합계는 13,050,719,577원(130.5억)이며, Supabase CLI readback은 pooler ECIRCUITBREAKER로 재시도 필요하다. |
| 6 | 6.34 | done | Home 계약 이력 기준 임대료 추이 차트에 시점별 보유 연면적 series를 추가했다. Evidence: current-request-data-task-static-qa-20260519 pass, build pass. |
| 7 | 7.14 | partial | Asset 탭 KPI 위에 관리 Projects 기반 자산개요/투자개요 2단 토글 표를 추가했다. Supabase seed/readback은 완료됐고 UI의 Supabase live fetch 전환은 남아 있다. |
| 12 | 12.18 | done | ll-dashboard-api work-platform/tasks/list include_archived/include_deleted 옵션을 qveg Edge Function에 배포했다. |
| 14 | 14.23 | done | 이번 요청 범위 정적 QA를 추가하고 통과했다. Evidence: current-request-data-task-static-qa-20260519 qa_status=pass. |
| 3 | 3.17 | done | 원본 데이터 수정 Excel 다운로드/업로드 컴포넌트는 메인 하단에서 제거하고 대시보드 우측 상단 원본 데이터 수정 버튼+팝업 구조로 이동했다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 3 | 3.18 | done | 메인 페이지 상단 사용자 이름 옆 프로필 영역은 사진이 연동된 사용자는 사진을 표시하고 사진이 없을 때만 이니셜로 fallback한다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 3 | 3.19 | done | 메인 페이지 상단 통합 검색 제목과 질문 입력란 사이 여백을 재조정했다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 3 | 3.20 | done | 담당 자산 블럭 내부 자산명은 좌측 정렬로 바꾸고, 고정 카드 크기 안에서 말줄임표 대신 띄어쓰기/어절 단위 자동 줄바꿈을 적용했다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 8 | 8.14 | done | Company 탭 자산별 노출도 컴포넌트의 우측 금액/임대면적 값 옆에 전체 대비 비율을 괄호로 표시하고, 비율은 소수점 첫째 자리 00.0% 형식으로 표기한다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 9 | 9.11 | done | Data Playground 탭은 피벗 결과 테이블을 선택 컨트롤 바로 아래로 올리고 바 차트는 그 아래로 내리며, 값 필드에 평당 월임대료와 평당 월관리비를 추가했다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 10 | 10.15 | done | Excel 한 시트 수정 파일 컴포넌트는 원본 데이터 수정으로 정리하고 대시보드 우측 상단 팝업으로 이동했다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 10 | 10.16 | done | 원본 데이터 수정은 대시보드 우측 상단 물류센터 워크 플랫폼 버튼 왼쪽의 버튼으로 제공하고, 버튼 색은 담당 및 권한 버튼 색과 맞추며, 클릭 시 팝업으로 Excel 다운로드/수정 Excel 업로드를 제공한다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 10 | 10.17 | done | 원본 데이터 수정 Excel은 사용자가 알아볼 수 있도록 원본 Excel DB_일반/DB_히스토리누적 수준의 한글 컬럼 제목과 순서를 제공하고, 시스템이 Supabase row/field를 인식할 수 있는 관계키는 숨김 컬럼으로 유지한다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 10 | 10.18 | done | 사용자가 수정 Excel을 업로드하면 즉시 DB에 쓰지 않고 edits/submit 승인 요청으로 접수하며, Data Quality 최상단 알림에 업로드 사용자, 자산 범위, 업로드 시각, 변경 건수, 파일명, 상태를 표시한다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 11 | 11.06 | done | Analysis Tools 선택 자산·기업 비교에서 기업 선택의 하이픈(-) 옵션은 제거하고, 비교 값 선택 UI를 잘 보이는 위치로 옮겼으며 평당 월임대료와 평당 월관리비를 추가했다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 6 | 6.30 | done | Home 계약 이력 기준 임대료 추이의 오른쪽 Y축 축 서식과 축 제목 색상을 자산 수 series 색상과 같은 보라색으로 맞춘다. Evidence: home-chart-axis-mixed-static-qa-20260515 allPass=true. |
| 6 | 6.31 | done | Home 만기 집중도는 만기 임대면적을 막대, 만기 임차인 수를 꺾은선으로 분리하고 색상과 좌우 축 서식을 구분한다. Evidence: home-chart-axis-mixed-static-qa-20260515 allPass=true. |
| 6 | 6.32 | done | Home 계약 이력 기준 임대료 추이 차트는 hover tooltip과 원본 표 보기 모두에서 해당 시점에 신규 편입된 자산명을 표시한다. Evidence: current-request-ui-static-qa-20260515 allPass=true. |
| 10 | 10.19 | pending | 원본 데이터 수정 Excel 파일은 현재 구현 상태를 최종으로 보지 않고, 배포 완료 후 마지막 수정배포 단계에서 사용자 확인 기준으로 다시 전면 정리한다. |
| 5 | 5.16 | done | 주간업무보고자료 업로드와 Weekly 탭의 주차 알고리즘은 목요일이 속한 월을 기준으로 월요일~일요일 주간 구간을 귀속시켜, 2026년 4월 5주차(2026-04-27~2026-05-03)와 2026년 5월 1주차(2026-05-04~2026-05-10)가 겹치지 않게 했다. Evidence: weekly-week-mece-static-qa-20260515 allPass=true. |
| 2 | 2.10 | partial | 부국 물류센터는 임차 행과 최신 금액이 있어 월 임관리비/임대면적 기준 E.NOC 27,450원 수준으로 파생 가능하고 저온창고 비율은 0.0%로 계산된다. 아레나스 안성은 임차 행과 저온/상온 구분은 있으나 DB_히스토리누적 최신 금액 연결이 history_unmatched라 E.NOC를 계산할 수 없다. Supabase/live readback은 남아 있다. Evidence: home-enoc-coldratio-static-qa-20260515 allPass=true. |
