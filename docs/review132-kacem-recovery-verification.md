# REC132-05 KACEM 공식 Q3 연결 검증

2026-11-02. 승인 명세는 `review132-kacem-recovery-spec.md`입니다. KACEM 범위의 서버2파일과 실행 가능한 검사1파일을 수정했으며 UI·실제 DB·ENV·계정·Git·배포·cron은 변경하지 않았습니다.

현재 Q3 원문은 이미 제공된30행의 공식 출처였습니다. 기존 portal `sourceLinks[0].url`과 legacy group `meta.source_url`에 있는 정확한 HTTP PDF를 다시 읽었습니다. Node 기본 TLS와 Windows Schannel은 www/non-www HTTPS 모두 인증서 만료를 확인했습니다. 이 인증서 문제를 해결했다고 보고하지 않습니다.

| 검증 경계 | 확인한 결과 |
|---|---|
| 공식 원문 | `http://www.ekacem.or.kr/storehouse/stat-member/20260930-3.pdf`, 3,941,482바이트/27쪽, SHA256 `216cebafe0ca74bfd3bf4f548d1df1da9109ffb1a1b7dfcfb0ff4ae8886b1ed3`. 무인증·무쿠키·redirect금지·시간/크기 제한으로 확보 |
| 독립 기대값 | 제품 pdf2json과 다른 pdfplumber로27쪽을 읽음. 전체부문 page2~8의100행을 추출하고 기존 제공 상위30의 회사30개·12열×30=360개 숫자와 전량 대조해 차이0. page1/2 렌더로 기간·단위·열도 확인 |
| 원표/현재 목록 | 원표100행을 완전성 검증한 뒤 승인된 상위30개만 DTO·group·profile로 전달. 원표100을 현재 회사100개로 승격하지 않음. 원문 총액을 상세 합계로 재계산하지 않고0도 보존 |
| 파서 | 전체/토목/건축 구역과 총건수·총금액·공공 설계등/CM·민간 공동주택/다중이용/CM을 구별. 기존 기본 Worker256MB는 정상27쪽에서 OOM이었음. KACEM 명시 profile만512MB/maxPages30/10초 허용, 다른 PDF 기본256MB 유지 |
| HTTP 예외 | 원래 정확 URL 한 개와 SHA 하나만 허용. 요청 전 원주소, 반환/파싱 전 본문 지문을 확인. 다른 호스트·경로·query·명시 port·userinfo·fragment·다른 분기·인증헤더·redirect·8MB/시간 초과 거절. 일반 HTTP 허용이나 TLS 실패 fallback은 추가하지 않음 |
| 사용 조건 | 현재 예상 발표가2026Q3이고 기존 group의 source_url이 원래 검수 HTTP URL과 정확히 같을 때만 그 한 문서를 사용. 새 분기 또는 catalog 누락에는 기존 HTTPS만 사용. 같은 주소 내용이 바뀌어도 새 SHA를 임의 승인하지 않음 |
| 동일 관측/법인 | 같은 공식 발표·같은 source row·회사 표기 의미 일치 범위에서만 기존 key/전년순위/참고 필드/댓글 보존. 다른 발표의 이름·순위·빈 법적ID를 동일 법인으로 합치지 않음. PDF에 없는 법적 ID를 만들지 않음 |
| 실제 소비자 | 현재 collector → merge → 실제 reference adapter → 현재 순위표30·억원 환산 → 상세 profile의12개 열·동일 출처 링크를 검사. 운영의 `validatePartnerResult`도 통과. 출처가 automation에서 조용히 null로 바뀌지 않음 |

수정 전 현재 collector는 KACEM 성공 결과를 만들지 못했고 정상 PDF도 기본 Worker에서 종료됐습니다. 최초 검사에는 새 parser 미구현으로 인한 준비/기능부재가 섞여 있으므로 그 전체 숫자를 의미 오류 재현 건수로 세지 않습니다. 실제 소비자 실패·정상 원문 OOM·정확 HTTP URL 거절을 별도로 확인했습니다. 이후 동일 원문행의 별도 등급/참고 메타 보존 반례도 실패 후 교정했습니다.

최종 집중검사는 공식 fixture 포함20/20 통과입니다. 기본 합성검사는17개이며 공식 fixture3개와 구분합니다. 공식 모드는 검수한 PDF, 독립 추출 기대값, 원래 제공된 legacy JSON을 필요로 합니다. 이 로컬 원문은 공개 소스에 대신 싣거나 sample을 실제 운영 데이터로 승격하지 않습니다. 실행은 `KACEM_OFFICIAL_FIXTURES=1` 환경에서 `node tests/review132-kacem-rankings.mjs`입니다.

기존 수집기28·순위13·보존범위19·현재갱신7·이전발표UI11로 관련5개 suite의78개 검사가 통과했습니다. 새 전체 플랫폼 회귀는 루트의 별도 동결 실행이며 이 집중 통과에 합쳐 계산하지 않습니다.

## 회사 수와 다음 수집 커서

실제 `partnerCompanies`는 전역 profile 전체가 아니라 현재 순위 group 행만 선택합니다. 기존 제공150개와 명시적으로 만든 합성 과거 profile31개의 격리 모형에서, KACEM30/원표100을 분리한 결과 활성150·전체 profile181이 유지됐습니다. 실제 `collectPartnerSnapshot`·`collectPartnerEnrichment`·`validatePartnerResult`로60/60/30개를3회 처리해 잔여90/30/0, 마지막 커서null을 확인했습니다. 200상한은 그대로이고201개 입력은 거절됩니다. 과거 profile31개를 삭제하지 않았습니다. 이181은 경계검사 모형이며 현재 DB 총수의 실측값이라는 주장이 아닙니다.

## 실제 공개 원문 읽기와 동결

현재 중첩 수집기(외부 snapshot → 내부 rankings → 단일 pinned HTTP GET → 격리 Worker → merge → 운영 결과검증)의 실제 공개 읽기1회도 KACEM success/complete로 통과했습니다. 그 실행의 다른 제공자는 의도적으로 격리했으므로 바깥 전체 상태는 partial_failure이며 전체 외부자료 완료로 보고하지 않습니다. 실제 DB 저장·정식 배포 검수는 루트 담당입니다. 새 브라우저/화면 배치 검수도 이 실행에 포함하지 않습니다.

| 파일 | 최종 SHA-256 |
|---|---|
| server/partner-rankings.mjs | `f763947a2467dc1e446baef19d944272d002d432845c5a7c9f482b13c4dbfef2` |
| server/partner-collector.mjs | `c309ea96d2469dae57b1922cba211fc81a97e276c821ec6f8d86ce693f37f0cd` |
| tests/review132-kacem-rankings.mjs | `c3c0b288dfda5e973d3e90da78ee1249c9ba47dee7fb48cb85b13c65d7d25f83` |

동결 시각 UTC2026-11-02T06:27:48.745Z. 이후 제품·검사 소스 수정0입니다. 증거는 `.build/review132-kacem/`의 `https-access-20261102.json`, `http-pdf-receipt-20261102.json`, `independent-legacy-comparison.json`, `final-focused.json`, `adjacent-regressions.json`, `scope-and-continuation.json`, `live-consumer-receipt.json`, `live-full-collector-receipt.json`, `final-freeze.json`으로 연결합니다.
