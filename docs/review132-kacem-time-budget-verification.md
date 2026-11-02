# C98 KACEM 시간 경계 검증

2026-11-02. 명세는 `review132-kacem-time-budget-spec.md`입니다. C97의 실제 원천 URL 선택은 맞았지만 `SOURCE_DOCUMENT_TIMEOUT`이 남았습니다. 당시 `min(10000,remaining)`의 실제 선택값은 기록되지 않았으므로10초 자체 상한과 더 짧은 source 기한 중 무엇이 원인이었는지는 미확정입니다. 특정 클라우드 CPU/메모리 원인으로 단정하지 않습니다.

이번 제품 수정은 `server/partner-rankings.mjs` 한 파일입니다. KACEM profile의 최대 파서 기한만30초로 정하고, 실제 파서 기한은 시작 시점 source.remainingMs와30초 중 작은 값을 사용합니다. 다른 PDF는 기본·최대10초/256MB를 유지하고 KACEM512MB/30쪽, 파일8MB, HTTP 문서1개·SHA 고정, 원표100/현재30, 원값·키·댓글 보존도 유지합니다. `partner-collector.mjs`, `maintenance-runtime.mjs`와 전역 요청/partners70초/저장40초 여유 정책은 변경하지 않았습니다.

현재 반환 메타는 `rank:kacem.coverage.kacemParser`입니다.

| 필드/상태 | 의미 |
|---|---|
| configuredCapMs | KACEM의 독립 최대값30,000ms |
| sourceRemainingAtStartMs | 파서 시작 직전에 남은 source 절대기한 |
| selectedTimeoutMs | 위 두 값 중 작은 실제 Worker 타이머 |
| limitBound=parser-cap | source remaining이30초 이상이어서30초 cap이 선택됨 |
| limitBound=source-deadline | 남은 source 기한이30초보다 짧아 그 기한이 선택됨 |
| elapsedMs/outcome | 실제 경과시간과 success/timeout/failed/not-started 구분 |
| originalBytes/originalSha256 | 본문이나 회사·금액 대신 검수된 공개 PDF 자체를 식별 |

`SOURCE_DOCUMENT_TIMEOUT`은 Worker 타이머이고 위 bound로 어떤 기한이 선택됐는지 구별할 수 있습니다. `SOURCE_TIME_LIMIT`과 not-started는 파서를 시작할 여유가 없었음을 뜻합니다. fetch/body의 `SOURCE_TIMEOUT`, 전체 수집의 `MAINTENANCE_TIME_BUDGET`은 기존 오류로 구별합니다. 이 메타만으로 CPU·메모리·공급자 장애의 세부 원인을 확정하지 않습니다.

수정 전 기존20개는 통과했고 새2개는 실패했습니다. 정확 원 PDF를 넣은30초 허용 호출은 `INVALID_RANKING_LIMIT`이었고, 같은 PDF를 source250ms로 실행한 실제 Worker timeout은 진단 coverage가 없었습니다. 수정 후22/22 통과했습니다. 실제27쪽 PDF의 SHA를 확인하고30000ms로 파싱한 뒤 독립 상위30/360개 숫자를 다시 대조했으며 표준10001ms와 KACEM30001ms는 거절했습니다. 실제 원 PDF와250ms source 기한에서는 timeout·source-deadline·작은 선택값·이전 자료 불변을 확인했습니다. 성공 collector에서도 선택30000ms/parser-cap·유한 elapsed·원 SHA·현재30 조회 연결을 확인했습니다. 원문을 넣지 않은 가짜 파서 성공은 사용하지 않았습니다.

관련 회귀는 기존 순위13·collector28·저장 예산12로53개 통과했습니다. 집중 결과는 `.build/review132-kacem/c98-final-green.json`, 수정 전은 `c98-red.json`, 인접 회귀는 `c98-adjacent.json`입니다. 합성 기본17개와 공식 fixture5개의 실행 범위를 구별합니다. C98의 실제 클라우드 성공은 아직 이 집중검사에 포함하지 않으며 루트의 배포 후 정상 공식 실행1회 결과로 확인합니다.

동결: UTC2026-11-02T07:34:43.792Z, `.build/review132-kacem/c98-freeze.json`.

| 파일 | SHA-256 |
|---|---|
| server/partner-rankings.mjs | `a21e4074c5b1395d62ac8a0968fa2b368d6f13da5213ead3f4153d992316d7a9` |
| tests/review132-kacem-rankings.mjs | `be5951e56646bdb117e7f5f083f9026e0fa6b404e44fd5157c78b0a9f28fbd64` |
| server/partner-collector.mjs (불변) | `c309ea96d2469dae57b1922cba211fc81a97e276c821ec6f8d86ce693f37f0cd` |
| server/maintenance-runtime.mjs (불변) | `2ec945bf6b7f00c5d645349f42988b35789f1581602363340d16cadbf0b2c588` |

UI·실제 DB·ENV·계정·Git·배포·cron은 본 담당자가 변경하지 않았습니다.
