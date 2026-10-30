# REVIEW132 담당자 원천·신규 등록 서버 계약

2026-10-30. 사용자 승인 범위는 orgdb의 이름·이메일 기준 직접 담당자 연결과 기본 개발개요 등록입니다. 원본 조직·직원자료·기존 로그인 허용목록은 변경하지 않습니다.

## 실제 원천 확인

`baqybhtfvuttcyyzspyi`의 `orgdb.employee_profiles`를 메타와 집계로만 확인했습니다. 원천 키는 UUID가 아닌 `employee_number` text입니다. 468명·이메일 공란140명·이름 공란0명·중복 이름그룹0개였습니다. 현재 중복이 없다는 관측과 앞으로 중복이 불가능하다는 주장은 구별합니다. 실행 역할 `development_project_platform_runtime`의 orgdb USAGE와 원테이블 SELECT는 모두 false였습니다. 직원명·이메일 대량 목록은 검수 출력에 남기지 않았습니다.

## 동일 API 계약

- `GET /api/employee-directory`: 신규 등록 관리자만 조회합니다.
- `GET /api/employee-directory?projectId=...`: 실제 생존사업의 편집자·승인자 또는 관리자가 조회합니다. 조회 전용 사용자는 받지 않습니다.
- 성공은 `{source:'orgdb.employee_profiles',employees:[{employeeId,name,email}],count}`이며 `employeeId`는 원천 `employee_number`, 이메일 공란은 null입니다. 메일은 앞뒤 공백 제거와 소문자 정규화만 합니다. 이름으로 직원 둘을 병합하거나 빈 이메일을 추정하지 않습니다.
- `private, no-store`로 응답합니다. 출처·중복/미지원 조회인자·메서드·로그인·권한·생존사업을 검증하며 실패를 정상0건으로 바꾸지 않습니다. 원천 ID 중복/누락·형식 오류도 조회실패입니다.
- 기존 reference-data 함수를 재사용합니다. 정식 rewrite는 `/api/employee-directory` → `/api/reference-data?__reference_route=employees`입니다. 새 Vercel 함수를 추가하지 않습니다.

## 저장 경계

새 참조는 `basic.managerRef {employeeId,name,email}`입니다. 기존 `basic.manager`는 임의 변환하지 않습니다. 참조가 새로 추가·변경되면 중앙 원장과 같은 거래 안에서 직원ID·현재 이름·현재 정규화 이메일을 다시 대조합니다. 사라진 직원·조회실패·변경된 메일·허위ID는 원장·감사·재시도 결과를 일부도 저장하지 않습니다. 입력값 보존은 기존 클라이언트 저장실패 흐름을 사용합니다.

변경하지 않은 과거 참조는 과거 확인값으로 보존합니다. 원천의 이후 조직/메일 변경이나 직원 삭제가 관련 없는 다른 업무 저장을 차단하지 않습니다. 이를 새로운 매핑을 추정하는 허용으로 쓰지 않습니다.

명시적 `registrationInput.profile='development-overview-v2'`는 사업명·유형·소재지·법인·펀드 정식명·조달구조 설명·담당자표시/원천·면적3개를 서버에서도 확인합니다. 면적은 명시적0을 허용하고 공란/null/문자/음수와 구분합니다. 담당자 표시는 원천 선택 이름과 일치해야 합니다. 이미 v2인 사업의 프로필 제거와 필수값 지우기도 차단합니다. 레거시 입력/승인된 과거 이관은 v2로 추정 승격하지 않습니다. 조달구조 설명에서 대출·출자·금액을 생성하지 않습니다.

## 좁은 DB 연결과 적용 전후 검증

`database/review132-employee-directory.sql`을 **루트 담당자가 실제 적용하고 비어 있지 않은 DB 응답으로 대조했습니다.** 근거는 [실제 적용 영수증](review132-directory-live-receipt.json)입니다. 원천468행·전체 행 지문·ACL지문·RLS설정·정책지문이 전후 같고, 앱 view 정확3열·runtime SELECT=true, anon/authenticated/service_role SELECT=false, runtime orgdb USAGE/원본SELECT=false를 확인했습니다. 준비 SQL을 중복 실행하지 않습니다.

앱 전용 스키마에 직원번호·이름·이메일3열의 읽기 view만 만듭니다. `security_invoker=false`는 현재 postgres 소유자의 원천 읽기권한으로 view의 고정3열만 읽는 명시적 경계입니다. 원본 orgdb의 RLS를 runtime 역할로 실행하는 방식은 아닙니다. 원본 RLS/소유자/권한은 변경하지 않고, 사용자별 공개 범위는 기존 세션과 위 서버 권한에서 검사합니다. `security_barrier=true`, PUBLIC/anon/authenticated/service_role 권한 회수, 앱 runtime SELECT만 허용합니다. runtime에 원본 스키마 USAGE·SELECT를 새로 부여하지 않습니다.

적용 전후 아래 쿼리의 원천 지문을 비교하고, 앱 view 열·owner·옵션·권한을 확인합니다. 집계는 원본을 변경하지 않습니다.

```sql
select jsonb_build_object(
 'rows',(select count(*) from orgdb.employee_profiles),
 'source_identity_digest',(select md5(string_agg(md5(jsonb_build_array(employee_number,full_name,email)::text),'' order by employee_number)) from orgdb.employee_profiles),
 'source_owner',(select pg_get_userbyid(relowner) from pg_class where oid='orgdb.employee_profiles'::regclass),
 'source_acl',(select relacl::text from pg_class where oid='orgdb.employee_profiles'::regclass),
 'source_rls',(select jsonb_build_array(relrowsecurity,relforcerowsecurity) from pg_class where oid='orgdb.employee_profiles'::regclass),
 'source_policies',(select md5(coalesce(string_agg(row_to_json(p)::text,'' order by policyname),'')) from pg_policies p where schemaname='orgdb' and tablename='employee_profiles'),
 'runtime_orgdb_usage',has_schema_privilege('development_project_platform_runtime','orgdb','USAGE'),
 'runtime_source_select',has_table_privilege('development_project_platform_runtime','orgdb.employee_profiles','SELECT')
);

select c.relname,pg_get_userbyid(c.relowner) as owner,c.reloptions,c.relacl,
 pg_get_viewdef(c.oid,true) as definition,
 (select array_agg(a.attname order by a.attnum) from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped) as columns,
 has_table_privilege('development_project_platform_runtime',c.oid,'SELECT') as runtime_select,
 has_table_privilege('development_project_platform_runtime',c.oid,'INSERT,UPDATE,DELETE') as runtime_write,
 has_table_privilege('anon',c.oid,'SELECT') as anon_select,
 has_table_privilege('authenticated',c.oid,'SELECT') as authenticated_select,
 has_table_privilege('service_role',c.oid,'SELECT') as service_select
from pg_class c where c.oid='development_project_platform.employee_directory'::regclass;
```

## 이번 실행과 남은 검수

현재 실행한 신규검사는 초기13개에서1통과/12실패(API404·허위원천200)를 확인한 뒤13개 통과, v2 추가4개에서는14통과/3실패(필수누락200)를 확인한 뒤 총17개 통과입니다. 실제 현재 runtime·라우터·저장 handler를 독립 합성직원/사업과 격리 거래에 주입한 검사이며 운영DB쓰기나 실제직원 메시지는0건입니다. 상세 결과는 `.build/review132-backend/`의 red/green JSON입니다.

저장 클라이언트가 서버422 입력검증 실패를 접속장애로 안내하던 연결 결함도 교정했습니다. `review132-workspace-errors`는 현재 cloud-session이 설치한 실제 commit에 응답을 주입해 입력오류 분류·담당자 재선택/개발개요 고정문구·기존401/403/409/503 경계를3개 검사합니다. 유효한 실패는1통과/2실패였고 교정 후3통과입니다. 초기 App 연결·빈 seed 준비 오류와 Node vm 배열의 다른 실행영역 비교 오류는 제품 RED와 구별해 기록했습니다. 서버 임의본문·SQL/개인정보를 사용자 오류문구로 통과시키지 않습니다. 기존 UI 배치와 로그인 문구는 유지합니다.

실제 DB view 적용/권한 대조는 위 영수증 범위에서 확인했습니다. 실제 인증 HTTP 조회·브라우저 직접선택/초안/등록/재접속·정식 배포는 루트의 통합검수와 구별하며 아직 이 문서로 수락하지 않습니다. 기존 알림/보안/승인자료 호환/파트너 예산6파일107개 현재 재통과는 이 새API의 실제 운영 검수를 대신하지 않습니다.
