# C98 제공 DART 공시의 표시 합성

2026-11-02. 변경 범위는 `src/partners.js`의 동일 공시 표시 합성뿐입니다. receipt는 DART 공시 접수번호를 뜻합니다. 서버/API·KACEM·UI 배치/열/버튼/모달/스타일은 변경하지 않습니다.

실제 API ZIP parser → `companyEntries` → `mergePartnerResults` → 현재/이전발표 reference reader → 현재 renderer로 실패를 재현했습니다. 같은 공식 receipt인데 legacy recent_awards에는 eventType이 없고 새 source_contracts에는 amendment가 있어 기본 contract와 다르다는 이유로2행이 됐습니다. 승인된 nullable 보존 반례까지 수정 전12통과/5실패, 수정 후20/20 통과했습니다.

| 경계 | 구현·검사 |
|---|---|
| 관측 식별 | 엄격한 공식 HTTPS DART main URL·유일한14자리 receipt·유효한 달력일이 같고 legacy의 eventType이 없을 때만 typed 공시와 같은 표시 관측으로 합성합니다. 자격/port/fragment/추가·중복 query/다른 host·receipt는 제외합니다. receipt를 원계약 ID로 만들지 않습니다. |
| 이벤트/날짜 | 명시적으로 다른 type은 별도 행입니다. 정정·취소를 새 계약으로 바꾸지 않습니다. API contractDate를 쓰는 기존 date 의미를 유지하고, 제공 sourceDisclosureDate와 legacyDateClaim·원래 date는 원객체 그대로 보존합니다. |
| 검토 상태 | 실제 XML parser는 금액/계약일이 유일하면 needsReview=false이지만 companyEntries에서는 VAT미확정 때문에 needsReview=true일 수 있습니다. entityVerified는 별도 법인 연결 상태입니다. 이번 수정에서 검토·단가확정 정책을 바꾸지 않습니다. |
| typed null 금액 | 원객체의 typed null을 채우지 않습니다. 같은 공시의 독립 legacy 제공 금액이 하나이면 표시에서 그 원객체만 읽고 기존 금액 셀 하위 상태에 ‘기존 제공값 · 확인 필요’를 표시합니다. 공식 ‘공시 계약금액’으로 승격하지 않습니다. |
| 0/미입력/후보 | typed의 명시0을 유지합니다. 양쪽 미입력은 자료 없음이며0을 만들지 않습니다. typed 후보(entityVerified=false)는 기존 후보 표시로 남고 legacy 값을 대체하지 않습니다. legacy0도 명시0으로 보존합니다. |
| 충돌/원문 | legacy 금액 주장이 여러 개라 하나를 고를 근거가 없으면 기존 표시행을 남깁니다. 서로 다른 값을 임의 선택·합산·보완하지 않습니다. 원배열, actual API 반환객체, 단가5개, High 주장, 원금액/날짜/원계약ID null은 불변 검사로 보존합니다. |

검사는 독립 합성 API 입력만 사용하며 실제 회사·개인·키·금액이나 운영 DB를 사용하지 않습니다. `tests/review132-provided-dart-view.mjs`20/20, 기존 수주자료20·샘플권한23·시장28·입력보존4로 관련75개 검사가 통과했습니다. 전체 회귀와 실제 최종 HTML 화면 검수는 별도 상태이며 과거8회 실행을 현재 결과로 승계하지 않습니다.

현재 소스/검사는 UTC2026-11-02T08:10:17.750Z에 동결했습니다. 증거는 `.build/review132-kacem/dart-view-approved-red.json`, `dart-view-final-green.json`, `dart-view-adjacent.json`, `dart-view-freeze.json`입니다.

- src/partners.js: `16f5d9816bb76e2fdfb033865a739e6f49c1be52f123b17d34697d54bea1c1bd`
- tests/review132-provided-dart-view.mjs: `d16dc7e6ec63484802047be14347642acfc399beb6c90154ea8c7a967acda8ee`

최종 게시용 HTML `.build/github-release-review132/.build/review133/c98-production.html`, SHA256 `e6708189018c1cdc3fc98fff400ad1343a10f49cbe6eba4d05ebe27f7189c2e2`(6,938,519바이트)에서 현재 검수5회를 모두 통과했습니다. 회사 상세1280/390×정상/null 두 자료의4회에서 한 공시 표시행·정정/계약일·금액/미확정 제공값 상태·금액 셀의 실제 화면 도달·닫기/재열기·원객체값을 확인했습니다. 같은 HTML에서 샘플 권한 핵심1회(1280, 전역자료 요청0·3샘플 조회·일반 계정 복귀)도 통과했습니다. 페이지 오류0이며 소스/정규 검사는 위 동결 지문에서 변경되지 않았습니다.

브라우저 자료는 실제 API ZIP parser의 독립 합성 입력 결과이며 모든 HTTP를 가로채는 새 격리 Edge 프로필을 사용했습니다. 실제 사용자 cookie·계정·로그인·업무쓰기는 하지 않았습니다. 현재5회는 과거 C96/C97의8회를 승계한 결과가 아닙니다. 증거는 `.build/review132-client/c98-dart-native/evidence.json`과 `c98-sample-native/evidence.json`입니다. 화면 캡처도 합성 회사/금액만 포함합니다. 실제 제공 관측5개/법인2개 입력의 운영 연결과 정식 배포·DB 검수는 루트의 별도 범위입니다.
