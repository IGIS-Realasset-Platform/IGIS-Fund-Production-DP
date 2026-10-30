# REVIEW132 정식 C94 일일수집 복구 검증

**26MB급 신규 판본의 실제 저장은 확인했습니다. 일일수집 전체 상태는 외부 원천과 미연결 입력 때문에 부분실패입니다.**

2026-10-30 12:15:10 KST에 기존 공식 CLI (crons run /api/maintenance)를 정확1회 실행했습니다. 정식 dpl_9hUe4fFiTxWzeaWBwdXFgJtpYMS2, 소스 2e1982302bca3628ac523718d4b91fd38ff86a59, 공개 HTML80c1…/6,929,932B를 다시 대조한 뒤 시작했습니다. 직접 maintenance GET·기존CRON키 원문조회·새키/스케줄/설정 변경은0건입니다.

daily ca5b9698-d1e3-42f1-9a98-3a637b5f480c: 12:15:15.011~12:16:41.956 KST,86.945초, partial_failure. partners 9a33ca32-2a09-40fd-b825-f8c6bfc02614:12:15:15.145~12:16:27.523 KST,72.378초, PARTNER_SOURCES_INCOMPLETE. 관측했던 daily/partner lease 전에 완료됐고 둘 다 정상 해제됐습니다. 정확 monotonic deadline/저장SQL 소요시간은 별도 기록돼 있지 않아 추정하지 않습니다.

## 저장·원본·오류 대조

- 구판 2ac755de-fca3-44b2-ab6d-baca12a7c781: 26,171,871B를 원문지문 그대로 보존했습니다. 신규 9a33ca32-2a09-40fd-b825-f8c6bfc02614: **26,466,252B**를 실제 DB에 저장했습니다. 판본은36→37개이며 기존판본 메타와 직전 최신본문2개 지문이 유지됐습니다.
- 신규판본 checked_at/created_at은12:16:27.523596 KST입니다. 단일 collectedAt 필드는 없으며 실제 개별 source.checkedAt 범위는12:15:17.077~12:15:59.353 KST입니다. 수집확인시각과 DB저장시각을 구별합니다.
- 실행창12:15:10~12:17:30 KST의 프로젝트 postgres_logs8건은 모두LOG/SQLSTATE00000입니다. **57014·오류/치명오류0건**이었으며 이전 저장시간초과가 이 실행에서 재발하지 않았습니다. 모든 시간대의 무오류를 뜻하지 않습니다.
- 업무원장 revision58/전체지문·직원댓글·개인알림상태·사업권한/ACL/RLS/정책은 동일합니다. 원본직원468행의 전체행/권한/정책지문과 읽기view identity도 동일합니다. 원본직원은 관리형MCP, 앱자료는실제 runtime으로 읽었으며 원본orgdb USAGE/SELECT=false를 유지했습니다.
- 구/신 판본 모두181회사·원사이트 legacy댓글14개·official댓글11개이며 회사키와 원댓글 연결지문이 같습니다. 원문 회사/댓글/직원/키값은 출력하지 않았습니다.

## 남은 원천 상태

201개 원천결과 중193완료·실패1·부분2·구성미확인5입니다. HTTP요청179회와 완료원천193개는 서로 다른 단위입니다. G2B의 두 부분상태는 같은 원인의 파생표시이므로 독립 실패2개로 중복 해석하지 않습니다.

| 원천 | 실제 상태/원인 | 판정과 필요한 입력 |
|---|---|---|
| rank:kacem | failed / SOURCE_TLS_REJECTED | 외부 TLS 연결거절 + 기존 미완성 어댑터. 현재 TLS 검증에서 거절됐습니다. 또한 현재 collector는 PDF 읽기 성공 후에도 SOURCE_KACEM_FORMAT_REVIEW_REQUIRED를 반환하도록 남아 있습니다. |
| kosis-market | configuration_missing / KOSIS_KEY_AND_SERIES_REQUIRED | 실제 키/통계계열 구성 누락. 입력 이름: DP_KOSIS_API_KEY, kosisSeries. 이번 run에서 누락된 환경키 목록은 DP_KOSIS_API_KEY 한 개입니다. 코드상 kosisSeries 배열도 필수이나 현재 maintenance의 partnerConfiguration이 이를 전달하지 않습니다. |
| g2b-contracts | partial_failure / SOURCE_PROVIDER_NOT_COMPLETE → INVALID_G2B_PARTIES | 원천 당사자 파싱/법적 식별 검증 미통과. 상위 상태는 일반 부분완료 코드지만 coverage.pendingErrorCode는 INVALID_G2B_PARTIES입니다. 계획1449건·active300건·기존300건 보존, 참조검증 true, 복구완료 false입니다. |
| g2b-recovery | partial_failure / INVALID_G2B_PARTIES | 동일 G2B 원인의 복구 상태. 두 개 원천 상태는 독립 실패 두 건이 아니라 같은 복구 작업의 일반상태와 상세 원인입니다. legacyObservationStatus=preserved_incomplete, legacyReferenceVerified/legacyObservationPreserved=true입니다. |
| dart-contracts | configuration_missing / SOURCE_IDENTITY_REQUIRED | 법적 기업식별 및 검증된 조회설정 미연결. 입력 이름: verified-dart-contract-query, dartContractQueries. 이번 오류분기는 DART키가 있으나 검증된 contract query가 없는 경우입니다. 현재 runtime configuration은 dartContractQueries를 구성하지 않습니다. |
| dart-company-identities | configuration_missing / SOURCE_LEGAL_IDENTITY_REQUIRED | 기업 원천 식별 미확정. 입력 이름: dartCorpCode, dartIdentityVerified. 현재 verifiedCompanyCount=0입니다. 문자열 회사명 일치를 실제 동일 법인으로 승격하지 않습니다. |
| credit-ratings | configuration_missing / SOURCE_LEGAL_IDENTITY_REQUIRED | 조회 후보와 확정 신용등급 연결의 분리. 입력 이름: verified-company-legal-identity. 이번에35개 회사 확인·실패0이지만 confirmedRatingUpdates=0이며 후보만 보관했습니다. 유효한 동일 법인 식별이 확정되지 않았습니다. |
| unit-costs | configuration_missing / SOURCE_CONTRACT_AMOUNT_AREA_BASIS_REQUIRED | 실제 산출 근거 미입력/미연결. 입력 이름: unitCostEvidence. evidenceCount=0입니다. 현재 runtime configuration도 unitCostEvidence를 전달하지 않습니다. |

**원천형식의 실제 잘못과 파서의 호환성 결함은 현재 안전메타만으로 확정할 수 없는 부분이 있습니다.** G2B는 실제 실패행의 독립 구조 근거 없이 검증을 완화하지 않았습니다. KACEM은 TLS 이후에도 별도형식검수가 남은 기존 미완성 어댑터입니다. KOSIS계열·DART조회/법적동일성·단가 증빙의 미연결을 API키누락 하나로 바꾸지 않았습니다. 새키 생성·유료등록·임의 회사연결은 수행하지 않았습니다.

## 검수 한계

실행기 사전검수의42501(regclass 권한조회)와57014(대용량 지문읽기 제한), 문법 준비오류는 제품의 실제 실행실패와 구분해 보존했습니다. 모두 실제 trigger 전에 발생했고 교정 뒤 공식Run은1회뿐입니다. 실행기의 절삭된 소수초 대신 실제ISO시각 차이를 위 소요시간으로 썼습니다.

이 결과는 저장시간초과 교정의 실제 검증과 원본보존 범위를 수락합니다. 모든 외부원천 완주·다음 자연예약 성공·모든 직원/화면·출력 전수검수 또는 전체 플랫폼 완료를 수락하지 않습니다. 정확한 결과·코드출처·증거지문은 같은 이름 JSON에 있습니다.
