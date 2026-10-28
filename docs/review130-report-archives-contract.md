# REVIEW130 보고서 고정본 분리 계약

기존 저장 함수의 실제 격리 측정에서 정상 작업공간2908186바이트가 보고서1건 뒤4397350바이트로 늘어 기존4MB 한도를 넘었습니다. canonical753408바이트와 project payload734623바이트가 작업공간 JSON에 누적됩니다. 원문을 줄이거나 과거 자료를 삭제하지 않고 앱 전용 스키마에 별도 저장합니다.

## 보존 경계

- 기존 서비스·다른DB스키마·공유 Supabase Auth·앱 로그인/DB접속설정은 변경하지 않습니다.
- platform_workspace는 사업의 존재/삭제·활성과 costStages ID만 작은 SQL 투영으로 읽습니다. workspace JSON 전송·수정·잠금·revision 증가0입니다.
- 새 본문/목록 캐시는 App.state 밖에 둡니다. 기존 p.reports·p.reportSnapshots는 호환 조회하며 자동 이동·삭제·정규화하지 않습니다.
- record 전체는 최대4000000 UTF-8바이트, 전송 포장에는16384바이트의 여유를 둡니다. 값을 자르거나 0으로 바꾸지 않습니다.
- 생성·상태 감사와 재시도는 새2개 테이블 안에 남기며 workspace 감사배열을 수정하지 않습니다.

## API

공개 주소는 /api/report-archives입니다. 실제 함수는 기존 api/reference-data.js와 예약 selector __reference_route=archives를 재사용합니다. 기존 댓글/기준정보·법령5개 rewrite와 다른 Vercel 설정은 유지하며 물리 함수12개 한도를 넘지 않습니다. 새 PATCH는 보고서 경로에서만 허용합니다.

| 요청 | 입력 | 응답 |
|---|---|---|
| GET 목록 | projectId | {snapshots:[metadata]}, 본문 없음 |
| GET 본문 | projectId, 서버UUID id | {snapshot:{metadata,record}}, 열 때만 본문 조회 |
| POST 생성 | {projectId,requestId,sourceId,record} | {snapshot:{metadata},replayed:boolean}, 최초201/재시도200 |
| PATCH 상태 | {projectId,id,requestId,expectedVersion,status,submitted,receipt} | {snapshot:{metadata},replayed:boolean} |

sourceId는 기존 record.id, 서버 id는 별도UUID입니다. record는 id/type/date/stageId/status/submitted/receipt/createdAt/canonical/payload/cellOverrides/planRowOverrides/templateVersion/layoutVersion만 허용합니다. id=sourceId, canonical.id=payload.id=projectId가 필수입니다. type은 plan/progress/cancel/complete, 날짜는 실제 달력의 YYYY-MM-DD, stageId는 current 또는 해당 사업의 실제 costStages ID입니다.

생성은 작성본과 submitted/receipt 빈 문자열입니다. 전체 record본문을 동결하고 PATCH는 상태/제출일/접수번호만 바꿉니다. 제출 상태에는 유효한 제출일이 필수이며 접수번호를 trim·숫자변환하지 않습니다. 상태 요청의 receipt 한도는20000문자입니다.

metadata는 id/projectId/sourceId/kind(archive)/type/date/stageId/status/submitted/receipt/createdAt/updatedAt/version/templateVersion/layoutVersion입니다. version은 초기1의 상태 잠금버전이며 본문의 새버전 번호가 아닙니다.

## 권한·재시도

- viewer/editor/approver/관리자는 해당 사업을 조회합니다. 생성·상태 요청은 editor/approver/관리자만 가능합니다.
- 기존 report-history 정책대로 전/후 중 확정·제출이 있으면 실제 변경은 approver/관리자만 가능합니다.
- 같은 사용자/requestId의 다른 입력은409 REQUEST_ID_REUSED, 같은 사업/sourceId의 다른 record는409 REPORT_SOURCE_CONFLICT, 오래된 expectedVersion은409 REPORT_VERSION_CONFLICT입니다.
- 같은 sourceId/동일본문은 기존1건을 재사용합니다. 통신불명/503 재시도 동안 requestId/sourceId/record를 고정합니다.
- 요청별·사업-source별 advisory transaction lock과 unique 제약을 함께 두며 PATCH는 자기 archive행만 잠급니다.
- 재시도는 현재 metadata를 반환하여 후속 확정을 옛 응답으로 되돌리지 않습니다. 본문 뒤 감사 저장이 실패하면 같은 transaction 전체가 원복됩니다.
- 에러는 기존 {error,message}입니다. 공통503 AUTH_UNAVAILABLE 경로는 변경하지 않습니다.

## SQL·역할

[적용 SQL](../database/review130-report-archives.sql)은 root만 실행합니다. 새 report_snapshots/report_snapshot_events가 모두 없고 기존 앱 테이블·런타임 역할이 있을 때만 생성합니다. 이미 있는 테이블을 교체하지 않습니다.

두 테이블은 RLS를 켜고 기존 development_project_platform_runtime 전용 policy를 사용합니다. public/anon/authenticated/service_role의 테이블 권한은 없습니다. runtime은 두 테이블 SELECT/INSERT, archive의 status/submitted/receipt/status_version/updated_by/updated_at 여섯 열만 UPDATE합니다. 본문·ID·사업·유형·날짜·템플릿·최초작성자의 UPDATE와 DELETE는 허용하지 않습니다. 기존 앱 세션·사업 ACL을 재사용하며 Supabase 사용자/JWT를 추가하지 않습니다.

공식 [RLS 안내](https://supabase.com/docs/guides/database/postgres/row-level-security)에서 grant와 RLS를 함께 제한하는 원칙을 대조했습니다. [현재 변경기록](https://supabase.com/changelog)의 HTTP TLS 변경은 직접 Postgres/풀러 연결 대상이 아닙니다. 이 작업은 새SDK·Auth전환을 하지 않습니다.

적용 전 읽기 전용 확인:

    select to_regclass('development_project_platform.report_snapshots') as archive_table,
           to_regclass('development_project_platform.report_snapshot_events') as event_table;
    select rolname,rolsuper,rolbypassrls from pg_roles
     where rolname='development_project_platform_runtime';
    select revision,md5(state::text) as workspace_md5
     from development_project_platform.platform_workspace where workspace_id='platform';

적용 후 읽기 전용 확인:

    select c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='development_project_platform'
     and c.relname in('report_snapshots','report_snapshot_events');
    select tablename,policyname,roles,cmd from pg_policies
     where schemaname='development_project_platform'
     and tablename in('report_snapshots','report_snapshot_events') order by tablename,cmd;
    select has_table_privilege('development_project_platform_runtime',
     'development_project_platform.report_snapshots','SELECT') as read_allowed,
     has_table_privilege('development_project_platform_runtime',
     'development_project_platform.report_snapshots','INSERT') as create_allowed,
     has_column_privilege('development_project_platform_runtime',
     'development_project_platform.report_snapshots','status','UPDATE') as status_update_allowed,
     has_column_privilege('development_project_platform_runtime',
     'development_project_platform.report_snapshots','record','UPDATE') as body_update_denied,
     has_column_privilege('development_project_platform_runtime',
     'development_project_platform.report_snapshots','project_id','UPDATE') as owner_update_denied,
     has_table_privilege('development_project_platform_runtime',
     'development_project_platform.report_snapshots','DELETE') as delete_denied;
    select count(*) as archives from development_project_platform.report_snapshots;
    select count(*) as requests from development_project_platform.report_snapshot_events;
    select revision,md5(state::text) as workspace_md5
     from development_project_platform.platform_workspace where workspace_id='platform';

기대값은 read/create/status=true, body/owner/delete=false, 새2개 테이블0행, workspace revision/MD5 적용 전후 동일입니다. 실제 API 저장 후에는 archive/event만 늘고 workspace는 그대로여야 합니다.

## 현재 검사

기존 실제 크기 실패는 report-snapshot-size-probe.json으로, 새 서버는 초기26개 계약 RED→GREEN에서 시작했습니다. PostgreSQL이 허용하지 않는0년을 생성/제출일에서 거절하는 반례1개, COMMIT은 성공했으나 응답을 잃는 POST/PATCH2개, 비상세 흐름의 본문 미조회1개를 추가했습니다.

실제 SQL과 입력 직렬화 대조에서는 최초 감사의 JSONB null과 SQL NULL을 메모리 어댑터가 구별하지 못한 누락을 발견했습니다. [PostgreSQL 공식 정의](https://www.postgresql.org/docs/current/datatype-json.html)에 맞춰 원시파라미터 RED를 고정하고 최초값을 SQL NULL로 보내도록 교정했습니다. 어댑터도 적용한 CHECK와 같은 구분을 사용합니다. 서버31개·router13개·runtime/SQL8개가 통과했고, client·기존 인증/비용/댓글/법령을 포함한15묶음231개도 소스/검사파일 지문 불변으로 통과했습니다. 이 단계는 명시적 메모리 DB이며 실제 저장 성공으로 확대하지 않습니다.

서버·클라이언트가 처음 같은 테스트 파일명을 사용한 충돌은 분리했습니다. client는 review130-report-archives.mjs, 서버는 review130-report-archive-server.mjs이며 초기26개와0년의27기대를 누락 없이 유지합니다. 과거14묶음188 receipt의 해당 파일은 이미 client28개가 실행된 결과이므로 backend27개의 파일 증거로 사용하지 않습니다. 새 회귀는 테스트파일의 실행 전후 SHA도 고정합니다.

root가 동일 SQL SHA b518912d8699b9590adc7f60331e4a1e86bbaaf191a101d0325e0944275d179a를 적용하고 독립 후검사를 마쳤습니다. 새2개 테이블0행·RLS·효과적인 역할권한·workspace revision37/MD5·사업금액/고정시점·계약/대출/VAT·기존보고 metadata 보존은 [DB 검증 기록](review130-report-archive-db-verification.json)을 따릅니다. 기존 보고3행은 metadata만 있었고 동결본문0행이므로, 존재하지 않던 과거본문을 보존했다고 주장하지 않습니다. 표준 migration 도구의 이력 기록은 업무스키마 변경과 구별합니다.

기존4MB 실패와 새API 부재의 계약 RED를 기존제품 오류26건으로 혼동하지 않습니다. 인증된 실제 API 생성/상태·현재자료 클라이언트 시나리오·게시 수락은 아직 root/QA의 후속 검수입니다. 업무자료·인증값·본문은 이 공개 문서에 포함하지 않습니다.
