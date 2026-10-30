# OPS132 운영 권한·로그·공개 의존성 점검

## 2026-10-30 재개 검증

현재 서버·인증·알림·보고서·등록/담당자·원가 그래프30개 시험파일을 재실행해30통과·0실패·실행 중 담당 소스변경0을 확인했습니다. 정확 실행과 소스핀은 `.build/review132-backend/focused-final.json` 및 같은 이름 JSON의 `resumed20261030`에 연결했습니다. 기존 모든 검사 수를 이번 실제 화면·운영 완료로 승계하지 않습니다.

추가 읽기에서 DB서버17.6, 직원 원천468명/이메일 공란140명/이름 공란0/중복이름그룹0, runtime 원본orgdb USAGE/SELECT=false를 확인했습니다. 앱의 활성 CBS671개는 최대깊이4·순환false·101단계 도달false였습니다. 이름·이메일 대량 목록이나 업무금액을 반환하지 않았고 운영쓰기는0건입니다. 신규 직원 projection의 SQL은 [담당자 계약](review132-employee-directory.md)에 준비했으며 적용·후속 지문은 루트의 통합 검증과 별개입니다.

이후 루트가 앱 전용 직원 view를 실제 적용했습니다. [적용 영수증](review132-directory-live-receipt.json)의 원천468행·전체행 지문·ACL/RLS/정책지문 전후동일과 앱 view 정확3열·runtime SELECT만 허용을 대조했습니다. runtime 원본orgdb USAGE/SELECT와 공개3역할 view SELECT는 여전히false입니다. 실제 인증HTTP는 preview 게시 후 별도 검수입니다.

현재 공개 의존성 재감사는 공식 npm registry로 공개 패키지 이름·버전을 전송하는 단계에서 **자동 승인검토가 프로세스 실행 전에 거절**했습니다. 목적지별 명시적 사용자 승인 근거 부족이 이유이며, 실제 npm 실행/전송·설치/fix는0건입니다. 우회 실행하지 않았습니다. 아래10/29 audit0은 당시 결과로 보존하며 현재 결과로 승계하지 않습니다. `.build/review132-backend/npm-audit-blocked.json`에 차단과 필요한 승인 근거를 기록했습니다.

2026-10-29 · 현재 정식 C93(제품1166cab/main5a0dc9f)의 운영 메타를 읽기 전용으로 확인했습니다. 동결 소스에 대한 관리형 보안 검사와 별도입니다. 확인된 문제에 한해 승인된 Nodemailer 최소 버전 수정과 파트너 최종 저장 예산만 교정했습니다. UI/UX·운영 DB·권한·환경·다른 서비스는 변경하지 않았습니다. 새 코드는 아직 운영 복구 결과와 구별하며 상세 지문은 같은 이름의 JSON에 기록했습니다.

| 영역 | 실제 확인 | 한계/남은 판단 |
|---|---|---|
| DB 실행 역할 | super/createdb/createrole/bypassrls/replication=false, NOINHERIT, 상속 역할0, 연결상한6 | LOGIN=true는 이 역할로 직접 접속하는 현재 서버 설계와 일치합니다. 비밀번호·접속문자열은 읽지 않았습니다. |
| 전용 스키마 | 사용 허용·CREATE 불가, 테이블22개 모두 RLS, runtime 소유 테이블0 | 신뢰하는 앱 서버의 RLS 정책입니다. 사람/사업별 권한은 서버가 검사하며 직원별 DB행 정책이라고 표현하지 않습니다. |
| 공개 역할 | 전용22테이블에 anon/authenticated/service_role SELECT0 | 다른 스키마의 본문/전체 권한 감사를 수행한 것은 아닙니다. |
| 고정 보고서 | 본문 전체 UPDATE/DELETE 권한 없이 상태6열만 UPDATE | status/submitted/receipt/status_version/updated_by/updated_at이며 실제 본문을 읽거나 바꾸지 않았습니다. |
| 핵심 조회 | 총49인덱스·세션token/user, 개인알림 user+ID, 사업구성원, 법령구독, 기준자료 최신, 보고서목록 인덱스 존재 | 실제 부하·실행계획·지연시간의 최적성은 별도입니다. |
| Supabase 검사기 | 전용 스키마 보안 항목0, 성능 INFO12(미색인 외래키8·미사용4) | 다른 서비스 결과는 채택하지 않았습니다. 실제 병목 증거 없이 인덱스를 일괄 추가/삭제하지 않습니다. |
| Vercel | 지정 C93 배포 최근30분: 요청1개/200, runtime0개, 반환5xx/오류0·잘림0 | 한정 창의 반환 결과이며 전 기간·모든 동작 무오류가 아닙니다. |
| 공개 패키지 | 공개45개·개발용 제외, 수정 전moderate1패키지/3공지→수정 후0 | 정확10.1.4 설치·메일10파일119보고검사·실제 파서3조건 통과. 새 정식 배포 수락과 별도입니다. |

## 운영 수집 상태

법령은 기존 R7 공식 수동 실행의376개 신규 확인·실패0이 마지막 성공입니다. 이번 읽기로 새 자연 예약 실행까지 성공했다고 확대하지 않습니다. 분기 예약은 성공입니다.

협력사 예약은 **PARTNER_COLLECTION_FAILED**, daily는 partial_failure였습니다. 해당 회차는2026-10-29 08:06:29~08:07:55 KST, 약85.8초이며 C93의15:08 정식 전환 전 발생입니다. 이 실패는 현재도 복구되지 않은 실제 운영 상태입니다. 남은 checkpoint를 초기화하지 않았습니다.

Vercel의 해당 과거 runtime 로그는 Hobby 보존기간 밖이어서 조회할 수 없었습니다. 대신 Supabase 로그를 정확한 앱 실행역할·08:05~08:09 KST로 제한해,08:07:51 `reference_snapshots` INSERT의SQLSTATE57014 오류1건을 확인했습니다. 원문·SQL본문·IP를 반환하지 않고 서버 안에서 사유를 분류해 **statement timeout1/사용자 취소0**을 확인했습니다. 실제 스냅샷은약26.2MB이고 당시 최종 저장 거래에10초 제한이 적용됐습니다. 현재 확인한 원인은 외부 원천 인증이나 임의 시간 추측이 아니라 이 최종 저장 취소입니다.

승인된 교정은 파트너의 최종 스냅샷 저장 거래에만 최대30초와 현재 남은 전체시간의 작은 값을 적용하고, 매 후속 상태문·COMMIT 앞에서도 다시 검사합니다. 수집에는 저장용40초를 남깁니다. 전체270초·함수300초·다른 거래10초·잠금2초·권한·살아있는lease와원자 rollback은 유지합니다. 데이터 축소·댓글 삭제·가짜 전체성공 처리는 하지 않습니다.

현재12개 모형은 수정 전9통과/3실패에서12통과로 교정됐으며, 기존 포함13파일252보고검사/그룹·실행 중 소스변경0입니다.26MiB 원문/15초 저장 모형,남은 기한 감소,기한 부족 시 저장 금지,저장 후 기한 소진/상태 저장 실패 원복,다른 실행 소유자,참조판본 충돌,댓글/회사연결/32MiB 가드 등을 검사했습니다. 기존2개 시험은20→40초 저장여유에 맞춘 가상시각2곳·정규식1곳만 갱신했습니다. **수정 배포 후 공식 daily1회와 실제 DB·로그 대조는 아직 미수행**이며 모형 통과를 운영 복구 완료로 표시하지 않습니다.

## 의존성 실제 경로와 최소 조치

공식 npm registry에 공개 패키지 이름·버전만 보내는 `npm audit --omit=dev --ignore-scripts --json`을 실행했습니다. 강제 registry, 빈 사용자/전역 설정, 토큰이 없는 제한 환경과 별도 작업 복사본을 사용했습니다. audit 단계 자체는 설치·fix·스크립트 없이 전후 package/lock 지문이 같았습니다. 첫 격리 네트워크 실패는 결과 없음으로 보존했고 승인된 동일 읽기 재시도에서 advisory를 받았습니다. 수정 전audit exit1은 취약점 보고 때문이며 조회 실패와 다릅니다. [npm 공식 안내](https://docs.npmjs.com/cli/v11/commands/npm-audit/)

실제 서버는 better-auth/kysely/pg를 인증·DB에, nodemailer를 Gmail 인증메일에, pdf2json/read-excel-file을 제한된 협력사 원문 파서 작업에 사용합니다. 현재 nodemailer10.1.1은 주소 주석·그룹·따옴표 해석 관련3개 공지의 영향 버전입니다. 공식 최소 수정판은10.1.4입니다. [유지관리자 공지1](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-8c8m-p3m8-cjg8), [공지2](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-m943-m63m-w62w), [공지3](https://github.com/nodemailer/nodemailer/security/advisories/GHSA-85x2-q946-cp5h), [수정판](https://github.com/nodemailer/nodemailer/releases/tag/v10.1.4)

현재 앱의 `companyEmail`은 정확한 단일 회사주소만 허용하며 인증 경로는 지정 주소목록도 검사합니다. 공개 공격 입력3개는 실제 발신 함수의 가짜 전송기 모형에서 전송 호출 전 거절했고, 정상 대조 주소는 모형 전송1회로 확인했습니다. 실제 메일은0건입니다. 따라서 해당3개 입력의 현재 경로 차단과 의존성 자체가 취약버전이라는 사실을 구별합니다. 모든 라이브러리 경로가 안전하거나 수정됐다고 주장하지 않습니다.

이후 승인받아 **nodemailer만10.1.4로 정확 고정**했습니다. lifecycle scripts·audit fix 없이 정상 npm으로 현재 프로젝트에서만 설치했고 다른 직접 의존성 값과 lock 노드는 그대로입니다. package.json의 키순서도 원문대로 보존해 버전값1곳만 바뀝니다. frozen5a0 검사 복사본은 건드리지 않았습니다.

실제 설치10.1.4·공식 audit0,기존 Gmail/OTP/API/제출 모형10파일119보고검사·실제 수정 파서의 공개 입력3개를 확인했습니다. TLS·첨부 파일/URL 접근차단·발신/수신 검증 소스는 바꾸지 않았고 실제 메일은0건입니다. 회귀 뒤 manifest 순서만 복원한 차이는 JSON값·lock 바이트·실제 설치버전이 같은 범위 증명으로 분리했습니다. 이 로컬 수정의 새 정식 배포는 아직 별도입니다.

## 인덱스 경고의 해석과 범위

미색인 외래키는 cost_snapshots.corrects_id, law_project_watches.created_by, quarterly_tasks.completed_by/snapshot_id, report_snapshots.created_by/updated_by, workspace_audit.user_id, workspace_requests.user_id입니다. 현재 중요한 조회키의 인덱스는 따로 존재합니다. 경고만으로 실제 느린 요청이나 보안 취약점으로 확정하지 않습니다. [Supabase 외래키 검사 기준](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)

미사용4개도 사용량/통계 기간과 향후 분기·보고 이력을 고려하지 않고 삭제하지 않았습니다. 원래 설정의 RLS·테이블 접근·역할 메타를 확인한 것이며 다른 스키마의 데이터·회사 서비스 설정은 다루지 않았습니다. [Supabase 역할 안내](https://supabase.com/docs/guides/database/postgres/roles), [RLS 안내](https://supabase.com/docs/guides/database/postgres/row-level-security)

추가 제품·설정 패치는 상위 담당자의 판단 후 별도 명세로 진행해야 합니다. 이 점검을 전체 플랫폼 보안·성능 완료로 표시하지 않습니다.
