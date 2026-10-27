# NAV128-01 · NTF128-03 명세와 재현

대상은 v0.12.7의 좌측 메뉴 제어와 개인 알림 건수입니다. 다른 화면·업무자료·개인 알림 저장 API는 유지합니다.

## 승인된 동작

- 펼친 메뉴의 접기 제어는 메뉴 상단에 하나만 둡니다. 접으면 메뉴 전체를 숨기고 본문 상단의 별도 펼치기 제어를 제공합니다.
- 메뉴 항목은 글자로 유지합니다. 44px 제어·기호·동작명 도움말·aria-expanded/controls·Enter/Space·상태 전환 후 포커스를 보존합니다.
- 로그인한 업무 화면에 처음 진입하면 알림 개인 상태를 별도 GET으로 불러옵니다. 사용자가 알림 버튼을 누르지 않아도 읽지 않은 건수가 표시돼야 합니다.
- 개인 상태를 읽기 전 전체 알림 수를 임의의 미읽음 건수로 표시하지 않습니다. 읽음·삭제·복원은 기존 개인 PATCH만 사용하며 사업 원장 PUT·감사 쓰기를 하지 않습니다.
- 실패한 첫 조회는 빈 0건으로 바꾸지 않습니다. 버튼을 열어 재조회할 수 있고, 다시 화면이 활성화되면 조회를 재시도합니다. 로그아웃/다른 계정으로 바뀐 뒤 과거 응답을 적용하지 않습니다.

## 현재 원인

`src/core.js`는 상태와 무관하게 topbar에 제어를 넣습니다. `src/notifications.js`의 개인 상태 load는 open에서만 시작되고, sidebar는 loaded 전 건수를 생략합니다. 따라서 알림 버튼을 먼저 누른 사용자만 건수를 받습니다.

## 근거

- 사용자 2026-10-27 직접 요청: 펼침에는 사이드바 안, 접힘에는 별도 토글.
- [Fluent 2 Nav](https://fluent2.microsoft.design/components/web/react/core/nav/usage): 예측 가능한 접기·펼치기 제어와 동작별 도움말, 메뉴 항목의 간결함.
- [W3C Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): Enter/Space, aria-expanded, aria-controls.
- 이 원칙이 모든 제품의 단일 정답이라는 뜻은 아닙니다. 본 제품의 위치 선택은 최신 사용자 지시에 따릅니다.

## 검증 상태

RED: `tests/review128-navigation-notifications.mjs` 신규5조건이 현행 코드에서 모두 실패했습니다(위치1·최초개인GET/알림4). 최소 교정 뒤 같은5조건은 모두 통과했습니다.

인접검사: `search127-navigation`4/4, `review126-navigation`4/4, `followup121-sidebar-text`7/7, `followup122-notification-value`17/17, `center120-notification-explanations`5/5, `center120-interface-runtime` 정상종료. 구식 위치기대만 최신 사용자 요구로 대체했으며, 메뉴 항목의 그림 금지·전체 숨김·금액/업무자료 보존·개인 API 경계를 약화하지 않았습니다.

## C62 격리 실제 브라우저 검수

정확한 통합 HTML `.build/review-20261027/integration-candidate-62.html`(SHA256 `28aef00018ab673542a3a56287bb2fa48a439d6247d16eec3134dff72ba01117`, 6,734,669B, v0.12.8)을 `tests/review128-navigation-browser.mjs`로 실행했습니다. 1280×800·1440×900·1600×1000·390×844의4조건 모두 통과했고 pageerror는0입니다.

- 알림 팝업을 한 번도 열기 전에 개인GET1회로 미읽음1건 표시.
- 펼침brand 안 제어1개·topbar 중복0개, 접힘에는 sidebar 완전숨김·topbar 재열기1개.
- 두 상태 모두44px, 동작별기호/도움말/접근성 이름·Enter/Space·상태전환 후 포커스 유지.
- 개인 읽음/삭제 각각PATCH1회, 미읽음0·팝업 닫기·새로고침 후 개인상태/접힘설정 보존.
- 공유업무JSON 전후 동일, `/api/workspace`는GET만 허용, 실제DB접근0.

증거: `.build/review-20261027/navigation-notifications-1793087689814/evidence.json`, SHA256 `bd674b4492cfbb084cdb054e9955b54906728467defd8b8b8771b9897eb42f18`. `expanded-1280.png`(SHA256 `c620995cf09c00289c9caf4a7b7d313914fad37e75a5bf0414628bba646ecbad`)와 `expanded-390.png`(`f4d86466c3823902ea8b6df704ae82bceb1003d34582a968abb279d20b70becf`)를 직접 열어 확인했습니다.

기본 실행권한에서는 Edge가 임시프로필/pipe 접근 오류로 시작되지 않았습니다(`navigation-notifications-1793087670415/evidence.json`). 같은 명령을 승인된 격리 검수 권한에서 실행했고 Chromium sandbox를 유지했습니다. 기존 브라우저·쿠키·설정은 읽거나 변경하지 않았습니다. 실패/세션초기화/403/offline은 논리·기존API회귀에서 확인했으며 이번native4를 그 실패조건의 실제 서버 검수로 확대하지 않습니다. 운영DB·실회원 상태 변경·배포는 이 담당자가 수행하지 않았습니다.

## 최종 C64 새 검수

이전 C62의 실제 검수를 승계하지 않고, 현재 `.build/review-20261027/integration-candidate-64.html`(SHA256 `28941ecfc0920eecf4aa72fe89258c22651884873fdb23448349d52bc5acbbdb`, 6,736,973B)을 같은 실행기와 독립 합성자료로 다시 검수했습니다. 4크기4/4 통과·pageerror0·실제DB0·원장PUT0입니다. badge 최초클릭 전 개인GET1→미읽음1, 개인읽음/삭제PATCH 각1→미읽음0, 재접속0건·접힘상태·키보드/포커스·제어위치/44px을 재확인했습니다.

증거: `.build/review-20261027/navigation-notifications-1793089464355/evidence.json`(6,653B), SHA256 `5e4bdd34bda094e6ad2d6c2c0785f0259e9578c6f65e14dc10180a3076fcbeba`. 새 `expanded-1440.png`(SHA256 `4a1611eef2ef053809f845011a491465c42b166ffe70e55db46f411d536ea6bd`)와 `expanded-390.png`(`f4d86466c3823902ea8b6df704ae82bceb1003d34582a968abb279d20b70becf`)를 직접 열었습니다. 별도 임시프로필·전체요청intercept 조건이며 사용자 쿠키 조회/쓰기·실서버 자료저장·운영 로그 조회는 이 실행에서0입니다. 기록된 requests는 합성 API의 메서드·경로뿐입니다.

최종 C64 전체 순차 논리회귀는 `.build/center-20261020/logic-2026-10-27T08-17-54.693Z.json`(503,143B), SHA256 `f53f57cb026c099cac577bd87d302a6c41b2119be53c0377169461842a27a849`입니다. 단일207/207·실행중 소스변경0·정상종료이며 실제 화면/운영서버/PDF산출물 검수와 구별합니다. 이전 C63 205/207과 구식 날짜/허용DTO 확장기대2건의 집중교정은 당시 기록으로 보존했습니다. C64 이후 서버 전용 URL의 시행일 보존 교정은 이 보고의 새로운 서버 수락으로 승계하지 않습니다.
