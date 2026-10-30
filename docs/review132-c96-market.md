# REVIEW132 C96 시장자료 소비자 검수

2026-10-30. 승인 명세는 `docs/review132-c96-spec.md`입니다. 최초 시장자료 연결 수정은 `src/partners.js` 한 파일입니다. 아래 최초 단계 지문과 검수는 후속 샘플 권한·이전401 보완 전의 범위를 나타내며, 마지막 절에 현재 지문과 정확 게시본 검수를 별도로 연결합니다. 서버 수집·법인 식별·신용·계약·기존 단가 원문은 변경하지 않았습니다.

## 소비자별 변경과 보존

| 번호 | 실제 진입/소비자 | 수정 및 보존 경계 |
|---|---|---|
| OPS132-05/C96-01 | 시공사·협력사 → 공사비 지표, 원가 관리의 기존 시장동향 → 자료·계열 선택기/그래프/월·버전 비교/관측값·출처 | 유일한 의미상 primary를 기본으로 선택합니다. 유효한 명시 선택은 legacy/detail/archive를 그대로 보존합니다. 선택된 archive 한 개만 기존 선택기에 포함합니다. 중복 primary, 여러 legacy, 없는 저장 ID, 중복 선택 ID는 기존 선택기와 빈 상태로 재선택할 수 있으며 임의 지표로 바꾸지 않습니다. primary가 없는 기존 로컬 자료의 명확한 첨부 main 또는 단일 무역할 legacy는 하위 호환합니다. |
| OPS132-05/C96-02 | 공사비 지표의 독립 세부지수표4 → 지표명/실제월/지수/전년동월/기준/출처 | 공식 sourceSeriesKey·detail 역할·2020 기준을 함께 확인해 실제 관측월을 읽기 전용으로 투영합니다. 같은 이름이어도 다른 key/base/role 또는 중복 원천은 기존 행을 대체하지 않습니다. 그래프의 legacy/detail/archive 선택이 독립 표의 범위를 바꾸지 않습니다. 부분 자료는 해당하는 행만 대체하며 원래 배열·행은 덮어쓰지 않습니다. |
| DATA132-03/C96-03 | 비클라우드 초기화 및 클라우드 reference API → marketSeries → 기준 메타데이터/표 | baseYear와 sourceSeriesKey를 그대로 전달합니다. 지수값·기간·0/null을 변환하거나 재기준화하지 않습니다. 전년동월 값이 없으면 기존 다른 행의 값을 섞지 않습니다. |

자료의 현재성·대표성은 배열 순서나 이름으로 추정하지 않습니다. 기존 배치·열·색·글꼴·탭·버튼 흐름, 기존 회사별 단가5건과 과거 발표 접근은 변경 범위가 아닙니다. 선택/조회는 기존 API `GET /api/reference-data?kind=partners`를 사용하며 새 요청 인자·저장 API는 추가하지 않았습니다.

## 실패 재현과 자동검사

- 수정 전 실제 모듈·API adapter·공식 workbook normalizer에 독립 합성 관측을 주입한 최초21검사는 11통과/10실패였습니다. 실패는 기본 legacy 선택, archive 선택기 불일치, 모호한 기본값, 상세표의 옛월 유지와 구조화 기준 누락입니다. 검사 준비 실패는 없었습니다.
- 수정 전 정확한 C95 게시 HTML `611d6e1fc82cfdb13c699ca6e9a707d66563887fa36c7385709bcd3977998a2a`의 격리 Edge 1280 진입은 기대한 primary ‘건설’ 대신 첫 legacy가 선택되어 실패했습니다. 페이지 실행 오류는0입니다. 증거: `.build/review132-client/c96-market-native-red/evidence.json`.
- 수정 후 집중검사 `tests/review132-market-consumers.mjs`는 28/28 통과했습니다. 최초21개 기대를 유지하고 단일 detail/빈 관측/중복 ID/기준 누락·충돌/최신 null/로컬 초기화 반례7개를 추가했습니다. 독립 원천 형식은 KICT 공식 계층 경로와2020 기준·실제 월이며, 숫자는 명시한 합성 관측입니다. 현재 DB의 실제 숫자 일치 검사로 승격하지 않습니다. 증거: `.build/review132-client/c96-market-focused-green.json`.
- 영향받는 기존 회귀는 followup122 10, followup123 34, review129 input-retention 4, center120 current-refresh 7로 총55개 통과했습니다. 구문검사도 통과했습니다.

## 실제 브라우저 준비와 현재 수행 상태

`tests/review132-market-consumers-browser.mjs`는 전체 HTTP를 가로채는 새 격리 Edge 프로필만 사용합니다. 실제 사용자 쿠키·DB·계약·금액은 읽거나 수정하지 않습니다. 현재 제품의 세 모듈이 지정 HTML에 정확히 포함되는지 확인하며, Git 게시본은 기존 비활성 예시 경로4치환만 정확히 허용합니다.

새 raw HTML `0b52068508a977397b4945d3fdbeddf7a5442f9c92d965c0d41a47cde1b9f808`(6,933,411바이트)에서 1280 사전검수1흐름이 통과했습니다. 기본 primary, 명시 legacy/detail, 독립 상세표4, 격리 프로필의 저장 archive 복구, 관측값 팝업과 Escape, 없는 ID의 빈 상태와 사용자 재선택을 실행했습니다. 원자료 변형·HTTP 쓰기·페이지 실행 오류는0입니다. 합성 화면의 표·선택·그래프 배치도 확인했습니다. 증거: `.build/review132-client/c96-market-native-preflight/evidence.json`.

최종 게시 Git HTML의 정상4폭(1280/1440/1600/390) 및 모호한 기본값2흐름, 전체 QA, 운영 API/실제 로그인 화면 확인은 아직 이 문서의 통과 범위가 아닙니다. 최종 Git HTML 전달 후 같은 고정 runner로 확인하고 별도 결과를 연결합니다. 운영 CUA 접근의 기존 실행환경 차단과 현재 DB 민감 숫자 동일성의 자동검토 차단은 미검증으로 유지하며 우회하지 않습니다.

## 고정 지문

| 파일 | SHA-256 | 수정시각 UTC |
|---|---|---|
| src/partners.js | `0df2c6d581b5754be78c1d4c807b55adb06e45d35127270bd1141acbf05339dc` | 2026-10-30T05:28:39.8897233Z |
| src/reference-data.js (변경0) | `59e3347867878dcf6901918b18978b1ba51bf80cbae1f1628baef8cd2669b9ac` | 2026-10-20T09:39:58.0934652Z |
| tests/review132-market-consumers.mjs | `d0fc07503dc7da9379c3c0379980277c26d54ba785330c8295567b4e94eb8f20` | 2026-10-30T05:32:22.6480284Z |
| tests/review132-market-consumers-browser.mjs | `c37025c80276727d76be6dd0ffa186284bf50da6d81eace5fcf2aa78784c4028` | 2026-10-30T05:26:19.5829579Z |
| src/chart-utils.js (변경0) | `42bbf109f72f482ecb3a1468e0092992c90276ac09d84124d0d838f9b6ece3e5` | 2026-09-21T05:50:43.9255182Z |

제품/검사 소스는 이 지문에서 추가 수정하지 않고 최종 전체 QA와 게시본 검수로 넘깁니다. 이후 추가 발견은 우선 `.build`의 독립 증거로 남깁니다.

## 후속 승인 범위와 현재 최종본

신규 샘플 조회 전용 계정의 승인 범위에 따라 core/cloud-session/reference-data에 선택적 서버 권한 전달·표시/직접 실행 제한·계정 전환 초기화를 추가했습니다. partners에는 그 권한일 때만 전역 시장 패널/요청을 생략하고 프로젝트 benchmark 비교는 보존하는 guard, 비교 체크박스의 표시·변경 guard를 추가했습니다. 이후 독립 검토에서 이전 기준자료/댓글401이 새 로그인까지 만료시키는 경합을 재현하여 오류 부작용 전에 원래 요청 세대를 확인했습니다. 기존 시장 선택·계산·투영 함수와 원값은 이 후속 작업에서 변경하지 않았습니다.

- 현재 source/test 핀: `.build/review132-client/sample-client-final-freeze.json` (UTC 2026-10-30T06:15:23.706Z). 마지막 core 변화는 샘플 조회 허용목록에서 확인된 입력 action 두 이름을 제외한 한 줄이며 시장 계산/투영 변경은0입니다.
- partners SHA `2ca82cf3e6ac747bc8a912fdff84af913c0bc11dc70d470d1a045861bfdbc501`, reference-data SHA `305e083f95d58a113201d288f594813a12313ab861f38d5202922fad6b7bc5cc`.
- 시장 집중검사28/28·기존 버전선택34/34는 후속 guard와 이전401 보완 뒤 다시 통과했습니다. 새 샘플 client23/23은 별도 범위입니다.
- 이전401 보완 전 Git HTML `636a9386509671eeadb9d6783fffb7c13defff3f159c7335d88c7c0aaf573f61`(6,936,734바이트)에서 시장 정상4폭+모호성2의6/6, 샘플2폭의 조회/계정복귀2/2가 통과했습니다. 이는 현재 마지막401 교정 전 중간본입니다. 증거 `.build/review132-client/c96-published-market/evidence.json`, `c96-published-sample/evidence.json`을 보존하며 다음 최종본 검수를 대신하지 않습니다.
- 최종401 교정 포함 Git HTML을 받은 뒤 같은 고정 시장 runner6흐름과 샘플2흐름을 새 증거 경로에서 확인합니다. 현재 실제 운영 로그인/DB 원값 동등성의 미검증 범위는 그대로 유지합니다.
