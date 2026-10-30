# SAMPLE132 샘플 조회 전용 client 검수

승인 명세: `docs/review132-sample-viewer-spec.md`. 신규 대상6명의 실제 식별정보는 소스·검사·문서에 넣지 않았습니다. 서버의 top-level `permissions:{sampleOnly:true}`만 화면 범위의 명시적 신호로 읽고, 권한의 신뢰 판단과 API 차단은 서버가 수행합니다. 일반 사용자의 payload에 이 키가 없으면 기존 화면을 유지합니다. 로컬에서 모든 capability가 허용되는 함수를 샘플 판정에 사용하지 않습니다.

| 경계 | 구현과 실제 검사 |
|---|---|
| 로그인/회원가입 → workspace → boot | `model.permissions`에 부팅 전 적용하고 status는 복사본을 반환합니다. metadata/newAccountCreated만으로 쓰기 화면을 열지 않습니다. |
| 메뉴/직접이동/저장된 화면 | 새 샘플 모드만 company/law/spec을 메뉴와 route에서 제외합니다. 프로젝트현황/개요/원가/파이낸싱/인허가/계약문서/보고서의 기존 viewer 조회는 보존합니다. |
| 버튼/직접 action | 실제 등록된 조회·탐색·내려받기·팝업 닫기·개인 알림 action을 명시적으로 허용합니다. 그 외 전역자료/업무쓰기 action은 표시와 실행을 함께 막습니다. 일반/로컬 모드의 기존 버튼과 callback은 보존합니다. |
| 원가 benchmark | 프로젝트 비교표·근거 조회를 보존하고 전역 시장자료 패널/미리조회는 제공하지 않습니다. 비교 포함 체크박스는 샘플 모드만 비활성화하고 변조 change도 차단합니다. |
| 글로벌 reference | 캐시/force/history/detail 요청보다 먼저 권한을 확인하며 peek도 자료를 반환하지 않습니다. |
| 초기화/로그아웃/계정 전환/재조회 | permissions를 병합하지 않고 교체·초기화합니다. 이전 workspace 성공·늦은 boot·기준자료 성공이 새 계정에 적용되지 않습니다. |
| 이전401 | 이전 기준자료·업체댓글의401이 새 계정을 만료시킨 실제 실패를 독립 재현했습니다. 오류의 로그인 초기화 부작용 전에 기존 요청 세대를 확인합니다. 현재 세대401의 정상 만료는 보존합니다. |

`tests/review132-sample-viewer-client.mjs`는 실제 core/cloud-session/reference-data/partners/CBS를 격리된 합성 입력으로 실행해 최종23/23 통과했습니다. 첫 marker 누락과 조회 action 수 오기는 검사 준비 오류로 분리했으며 제품 실패로 세지 않습니다. 의미 있는 실패 근거는 권한 미전달/실제 글로벌 메뉴·action/자동조회와 마지막401 경합입니다. 마지막 독립 반례는 `.build/review132-client/sample-client-late401-red.json`의18통과/1실패, `sample-client-comment401-red.json`의20통과/2실패로 보존합니다. 실제 CBS 원문을 대조한 마지막1개는 ‘상세합계 적용’이 읽기가 아닌 입력 폼이라는 경계를 고정했습니다. `sample-client-write-action-red.json`의22통과/1실패 후 정확히 두 입력 action만 허용목록에서 제거했습니다. 기존 module canEdit와 서버 차단은 있었으므로 이 문제는 UI 진입 오분류이며 쓰기 권한 우회로 분류하지 않습니다. 최종23/23은 `sample-client-final-green.json`입니다.

관련 기존 cloud-session/auth112/auth114/충돌 재조회40/시장선택34의5개 suite가 통과했습니다. 마지막401 교정 뒤 업체댓글 독립/일반·개인알림 interface·시장28·시장선택34의 관련5개 suite도 통과했습니다. 이 결과는 실제 계정 생성·메일·OTP·운영 DB 검수를 대신하지 않습니다.

소스와 정규 검사는 UTC 2026-10-30T06:15:23.706Z에 재동결했습니다. 정확 지문은 `.build/review132-client/sample-client-final-freeze.json`입니다. 이번 동결 뒤 추가 기능·범위 감사나 소스/검사 변경은 수행하지 않습니다.

| 파일 | SHA-256 |
|---|---|
| src/core.js | `33c74aa1ea4ee29d3970815058ff2a617e50af15020a1185ae63a94c4be59e70` |
| src/cloud-session.js | `66be75d96d1c652f136976e478d2791d752555b7cfa9256adc2019e719639a64` |
| src/reference-data.js | `305e083f95d58a113201d288f594813a12313ab861f38d5202922fad6b7bc5cc` |
| src/partners.js | `2ca82cf3e6ac747bc8a912fdff84af913c0bc11dc70d470d1a045861bfdbc501` |
| tests/review132-sample-viewer-client.mjs | `d4d2c3cebdf59fb67131612e01506912908bc64065ffd7ae51cef4c443cc704f` |

실제 native 검사는 기존 격리 Edge·승인된 과거 합성 샘플 fixture·HTTP 전량 가로채기 패턴을 재사용한 `.build/review132-client/sample-native.mjs`로 수행합니다. 운영 쿠키·실제 회원·DB를 사용하지 않습니다. 마지막401 보완 전 정확 Git HTML636a9386…에서 1280/390 각7조회화면·3프로젝트·전역요청0·일반→샘플→일반 재진입2/2를 확인했으며 이 증거는 중간본으로 보존합니다. 마지막401 보완이 포함된 최종 Git HTML의 새 native 결과는 별도로 연결합니다.

최종 게시용 Git HTML `63e4b0a093e28a5eafd3dcf37b1f899f6f580e22436d26aa96d7429d4e422ea1`(6,936,956바이트)에서 위 샘플2흐름을 다시 실행해2/2 통과했습니다. 실제 부팅·조회·로그아웃/다른 합성 계정 로그인으로 1280/390 각각7조회화면·3샘플사업·benchmark 전역패널0·전역 API 요청0·일반계정 메뉴 복귀를 확인했습니다. 페이지 오류와 업무쓰기0입니다. 증거는 `.build/review132-client/c96-release-sample/evidence.json`이며 이전636a/59c 중간본 증거는 별도로 보존합니다. 현재 실제6명 계정·메일·OTP·운영 화면/DB의 검수는 이 격리 결과에 포함하지 않습니다.
