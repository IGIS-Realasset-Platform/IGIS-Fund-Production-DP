# C95 — 담당자 입력 오류와 세션 경계

이 문서는 [C95 명세](review132-c95-spec.md)의두요구에대한세부검수기록입니다. 현재 C94의 정확 게시용 HTML80c1c7ec에서 독립 확인한 두 경계를 보완합니다. 실제 운영 계정/쿠키/DB는 사용하지 않으며 제품 UI·CSS·원금액·저장자료·기존 7개 등록 API·v2 등록15입력·후속 원자료9항목은 보존합니다. 검사내부의EMP95-01/02는각각아래공통요구번호에대응합니다.

| 요구 | 기대 | 실패/검사 경계 |
|---|---|---|
| EDIT132-10/C95-01 | 담당자 조회 성공은 조회 자체 오류만 해제. 공통 필수오류가 남으면 aria-invalid와 해당 설명 연결 유지. 두 오류 공존 후 조회 복구도 공통 오류를 복원 | C94 실제 DOM에서 빈 선택·오류문구·설명은 남지만 invalid만 제거됨. 독립 임시 native 및 현재 helper 모형으로 고정 |
| STAFF132-09/C95-02 | 기존 cloud reset 때 직원 cache/data/error/projectId를 비우고 generation을 증가. 이전 응답이 새 세션의 cache/오류를 되살리거나 새 폼을 바꾸지 않음 | C94 실제 logout은 페이지 reload 없이 reset, cache는 남음. 실제 저권한 UI 노출은 미입증이며 새 공격으로 단정하지 않음 |
| 보존 반증(신규 요구 아님) | 기존 조회자의 프로젝트 추가 클릭은 폼·담당자 조회 전에 거절. 정상 관리자 등록·local legacy는 유지 | C94 실제 click guard가 이미 차단함을 확인했으므로 새로운 guard/버튼 배치 변경은 하지 않음 |

명확한 변경 대상은 `src/setup.js`의 조회 오류 동기화와 reset hook뿐입니다. 명시 승인된 요구 외 사업비·계약·보고서·원자료·다른 사용자 자료를 바꾸지 않습니다. 회귀는 실제 helper에서 오류 조합·재조회·reset·늦은 응답·정상 새 조회를 실행하고, 필요하면 정확 후속 HTML의 격리 브라우저 결과와 연결합니다. 모형/실제 격리 UI/운영 서버·DB 상태는 분리합니다.

## 구현과 집중 검수

변경은setup 한 파일입니다. 기존cloud reset hook에 직원data/error/projectId비움과generation증가를연결했고,조회응답을적용하기전에같은generation·같은현재form·연결된select인지확인합니다. 조회오류동기화는자기directory오류만해제하고공통오류·기존help설명연결을보존하며,두오류가공존한뒤조회복구시공통오류의invalid/설명연결을복원합니다. core/recovery/portfolio/CSS·등록payload·실제원자료·금액은변경하지않았습니다.

`tests/review132-employee-field-boundaries.mjs`는현재실제core/setup helper에서등록/개요양쪽필드의필수오류·공통/조회오류공존/복구·별도help보존·정상직원선택·이메일null·reset·과거성공/실패·새조회보존·교체폼·숨은이전폼연결상태를검사합니다. 최초11개중2통과9실패를확인한뒤수정했고,부모의추가hidden-oldform2개를포함한최종13개가모두통과했습니다. 외부DOM만무동작모형이며실제브라우저와구분합니다.

기존v2등록/후속원자료10·직원서버경계17·legacy등록13·등록문맥60·로그인기억/로그아웃auth11410도각기존검사로통과했습니다. 기존검사의원값·null/0·다른사업·금액/계약/원자료보존단언은변경하지않았습니다.

정확C94게시본80c1c7ec의임시native기준실패는 `.build/review132-client/c95-boundaries-native-red/evidence.json`입니다. 새raw HTML **737d674fd758ee8c7092e7bb3b6d9bc20311512f6af02ff6041d337da7469743·6,930,719B**에서같은native기대4개가통과했습니다(`c95-boundaries-native-green/evidence.json`). 필수invalid/설명·이름보존,로그아웃cache비움,새조회자cache없음,기존조회자실제추가click차단(폼0·직원신규조회0)을확인했습니다. 캐시잔존을새공격확정으로확대하지않습니다.

현재setup 지문은 `6668f8c5d10a6d85367b5c1b697dc46c481a2e21586ecc70e1b201070406f635`입니다. 이기록은집중모형/격리native이며최종Git게시파일·전체QA·실제운영화면/DB·배포의수락을대신하지않습니다. 실제사용자쿠키·운영data쓰기·메일발송은0입니다.

## 정확 게시용 C95 최종 실제 검수

원본737d674f·6,930,719B와 **게시용 `611d6e1fc82cfdb13c699ca6e9a707d66563887fa36c7385709bcd3977998a2a`·6,930,683B**를대조했습니다. 기존비활성예시참조4곳을각1회치환한뒤바이트전체가일치하며그외제품차이는없었습니다.

게시할 `.build/github-release-review132/.build/review132/c95-production.html`그파일자체로다음검수를재실행했습니다. 모든pageerror는0입니다.

| 구분 | 현재 결과 | 정확 근거(.build/review132-client 아래) |
|---|---|---|
| 기존등록4폭 | 4/4 | c95-published-registration-four-widths/evidence.json |
| 인허가/부지4폭·2역할 | 8/8 | c95-published-permit-four-widths/evidence.json |
| 후속자료2키·1280/390 | 실제노출진입·후보저장·재접속후실제basic원값불변 | c95-published-source-two-widths/evidence.json |
| 새경계4기대 | 필수invalid/설명유지·logoutcache비움·새조회자cache없음·기존clickguard차단모두true | c95-published-boundary/evidence.json |

현재canonical등록검사기의설명연결검사는공백으로구분된ARIA ID각각의노드/문구와공통필수ID포함을확인합니다. 기존invalid·정확입력이름·미선택값·펀드명단언을유지했습니다. SHA는 `ed0ea1dd87aa6f915935ab8a77516d3da97ade94ee650fcd8e4bf8b5da9e6fa4`, 마지막쓰기03:59:53.7820421 UTC이며이후수정하지않았습니다. 최종13모형검사SHA는 `071688a3cee1fa8b029e188b68b9b9b02b6d578ddf73be25f46dccb294361511`입니다.

### 과거 임시 증거 설명의 정정

기존 `c95-boundaries-native-green/evidence.json`의scope문자열에는이전‘Exact 80c product’문구가남아설명불일치가있었습니다. 원본값은수정하지않았습니다. 해당실행의html.path·SHA와명령은실제737d674f의C95raw를가리키고파일지문사전검사도그값으로수행됐습니다. 이문구오류는제품실패나C94fallback실행으로바꾸어세지않습니다. 최종판정은scope도입력SHA에서동적으로만든정확게시용611d6e1f의재실행근거로연결합니다.

기존12흐름,후속자료관측을위한등록반복,새4개기대는서로다른분모이며고유플랫폼기능18개로합산하지않습니다. 전부합성HTTP/신규격리프로필입니다. 운영Cua차단·실제운영화면/DB미검증을위격리통과로대체하지않고,전체회귀·실제게시전환은루트의현재최종근거를따릅니다. 구조화메타는동일이름JSON에기록했습니다.
