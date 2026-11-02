# C98 KACEM 실제 실행 시간 경계

2026-11-02. C97 정식 공식 실행에서 KACEM은 기존 TLS 거절 대신 `SOURCE_DOCUMENT_TIMEOUT`으로 실패했습니다. 현재 DB 원천 URL은 검수된 고정 HTTP 주소와 동일하다고 루트가 확인했습니다. 원문 성공을 재현한 로컬 결과와 실제 클라우드 결과를 구별합니다.

현재 `SOURCE_DOCUMENT_TIMEOUT`은 Worker 타이머에서 발생하지만 설정값은 `min(10000, source.remainingMs)`이므로 C97의 기존 오류 코드만으로10초 제한과 남은 source 기한 부족을 구별할 수 없습니다. fetch/body는 `SOURCE_TIMEOUT`, 상위 전체 기한은 `MAINTENANCE_TIME_BUDGET`으로 구별됩니다. 특정 CPU/메모리 사유는 계측 없이 단정하지 않습니다.

| 요구 | 성공 기준·보존 경계 |
|---|---|
| KACEM132-06 | KACEM profile만 최대30,000ms와 파서 시작 시점의 남은 source 절대기한 중 작은 값을 사용. 다른 PDF의 기본·최대10,000ms 유지. KACEM512MB/30쪽·다른 PDF256MB·파일8MB·원문 SHA 검증 유지 |
| KACEM132-07 | KACEM 성공/실패 coverage에 파서 stage, cap, 선택된 timeout, 시작 remaining, 실제 elapsed, 제한을 정한 경계와 원문 SHA를 보존. Worker 자체 cap과 더 짧은 source 기한을 반환 메타로 구별. 본문·회사·키는 진단에 추가하지 않음 |
| KACEM132-08 | 원 PDF를 실제 주입한30초 허용 검사, 표준 PDF10초 초과 거절, 실제 PDF와 짧은 source 기한의 timeout/이전 자료 보존을 실행. 합성 파서 성공이나 원문 미주입을 실표본 통과로 세지 않음 |

유지되는 상위 경계: partners 수집은 `min(70000, maintenance.remaining()-40000)`이고 내부 rankings는 최대60,000ms로 제한됩니다. 이번 수정에서 이 수집/저장 여유·전역 요청 상한·HTTP 예외·UI·DB/ENV/Git/cron은 바꾸지 않습니다. 전체100행 검증을 생략하는 선택 파싱도 도입하지 않습니다. 실제 클라우드 성공 판정은 C98 배포 뒤 루트의 공식 실행1회 결과로 확인합니다.
