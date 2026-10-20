# 시공사·협력사 공용 댓글 서버 계약

기준: 2026-10-20 · 연결 요구: CENTER120-17 / PMIG-19~30 · 상태: 주입형 서비스 구현·로컬 계약검사24건 통과. API/runtime 연결·운영 DB 적용·실제 화면 검수는 root의 별도 단계이며 이 문서만으로 완료 처리하지 않습니다.

## 1. 범위와 보존

- 확인된 원사이트 기능인 **목록 조회·댓글 추가**만 구현합니다. 수정·삭제 API를 만들지 않습니다.
- 기존 앱의 지정 12메일·이메일 확인 완료 세션을 `withTransaction(request, operation)`으로 재사용합니다. 원사이트 Auth·계정·키·DB를 재사용하거나 연결하지 않습니다.
- 새 테이블은 `development_project_platform.partner_comments`뿐입니다. workspace JSON·revision·감사목록·기존 내부 메모·공식 코멘트를 쓰지 않습니다. 추가 기록 자체의 작성자·작성시각은 불변입니다.
- 공식 seed는 **선택한 출처 회사의 기존 `officialComments` 그대로** 반환합니다. 같은 공통 온라인 키라도 공식 글을 합치거나, body/작성자 유사도로 삭제·중복 제거하지 않습니다.
- DTO의 명시 `sourceCommentKey`가 같을 때만 온라인 댓글을 공유합니다. 회사명을 비교해 공유키를 만들지 않습니다. 값이 없는 과거 DTO는 `source_comment_key IS NULL AND company_key = 정확한 회사키`의 회사별 범위입니다. null 두 개가 같다는 이유로 묶지 않습니다.
- 이후 공통키가 생겨도 기존 회사별 댓글을 재작성하지 않습니다. 해당 회사는 공통키의 댓글과 자기 회사별 과거 댓글을 함께 읽고, 다른 출처 회사의 회사별 댓글까지 가져오지 않습니다.
- 원사이트 온라인 기록은 `company.legacyOnlineComments`의 선택 출처 배열 그대로 별도 반환합니다. `sourceId:null/createdAt:null/createdAtText/authorLabel/body/cooperative/projectText`를 보존하고 새 댓글 테이블로 재등록하거나 수입시각·현재 작성자로 바꾸지 않습니다. 같은 글로 보이는 원문도 유사도로 병합하지 않습니다.

## 2. 주입형 서비스

`createPartnerCommentsHandler({withTransaction, origin, clock, idGenerator})`가 `Request → Promise<Response>` 핸들러를 반환합니다. 실제 라우터·runtime·Vercel 연결은 root 담당이며 이 모듈은 외부 네트워크 요청을 하지 않습니다.

- `withTransaction`은 기존 서버가 세션·이메일 허용목록·만료를 검증한 뒤 `{userId,email}`을 전달하고, 정상 응답의 COMMIT 완료 후 응답/쿠키를 확정하는 기존 계약입니다.
- 서비스는 전용 `app_user`의 같은 ID·검증 이메일·`emailVerified`를 다시 확인합니다. 작성자 표시는 검증된 이메일 자체이며, 클라이언트가 작성자·작성일을 지정할 수 없습니다. 실명을 추측하지 않습니다.
- GET은 Origin이 있으면 정확히 일치해야 하고, POST는 정확한 Origin이 필수입니다. 오류는 기존 `WorkspaceError`를 사용해 runtime이 안전한 응답·ROLLBACK으로 처리합니다.
- 모든 응답은 `private, no-store` JSON과 `nosniff`입니다. 댓글은 HTML이 아닌 일반 문자열이며 프런트는 `textContent`/공통 escape로 표시해야 합니다. 서버의 JSON 반환만으로 프런트 XSS 검수 완료라고 하지 않습니다.

## 3. 조회

### 전체 목록 배지 요약 — GET `?mode=summary`

회사 150개를 개별 호출하지 않고 최신 공식 reference의 회사별 요약을 한 번에 반환합니다.

```json
{"summaries":[{"companyKey":"출처별 회사키","totalCount":3,"onlineCount":2,"recent31day":true}],"viewer":{"email":"검증된 로그인 이메일"}}
```

### 회사별 목록 — GET `?companyKey=...&limit=50&cursor=...`

```json
{"companyKey":"출처별 회사키","seedComments":[],"legacyOnlineComments":[],"onlineComments":[{"id":"UUID","authorName":"검증된 작성자 이메일","createdAt":"원래 서버 작성시각","text":"일반 문자열","cooperative":false,"projectText":"관련 프로젝트 문자열"}],"totalCount":1,"onlineCount":1,"recent31day":true,"nextCursor":null,"viewer":{"email":"현재 로그인 이메일"}}
```

- `limit` 기본50·허용1~100입니다. 온라인 기록만 `(created_at DESC,id DESC)`로 조회하고 같은 정렬키를 포함하는 cursor를 사용합니다. cursor는 회사키와 현재 공통키에 결합하며 다른 회사·달라진 범위에 재사용하면 오류입니다.
- `totalCount = 선택 출처의 공식 seed 수 + 선택 출처 legacyOnlineComments 수 + 보이는 앱 온라인 전체 수`입니다. `onlineCount`는 새 앱 온라인 전체 수이며, 한 페이지 행 수를 전체 수로 오인하지 않습니다. seed·legacy는 매 응답 같은 원문 배열이고, 프런트는 더보기 때 다시 붙이지 않습니다.
- `recent31day`는 앱 온라인 전체의 서버 `created_at`이 `현재시각-31일 ≤ 작성시각 ≤ 현재시각`인 기록이 있는지입니다. 미래 기록·시각 미확인 seed·분 단위 원문만 있는 legacy·reference 수입일은 New 근거가 아닙니다.
- 데이터·요약·New는 같은 회사키/명시 공통키 정의를 사용합니다. 기준정보에 회사가 없으면404이며 자료 연결 실패를 댓글0개로 위장하지 않습니다.

## 4. 추가

POST 입력은 다음 키만 허용합니다. `projectId`, 작성자, 작성일, 수정·삭제 동작 등 다른 키는 거부합니다.

```json
{"companyKey":"출처별 회사키","requestId":"클라이언트 UUID 등 16~100자 식별값","text":"댓글 본문","cooperative":false,"projectText":"자유입력 프로젝트명"}
```

- `text`: 공백만 허용하지 않음·최대5000자. `cooperative`: boolean 필수. `projectText`: 선택·최대300자·기본 빈 문자열. 원문과 구조화값을 보존하고 HTML로 실행하지 않습니다.
- 자유 프로젝트 문자열은 공용 댓글입니다. 실제 프로젝트ID를 추측 연결하거나 프로젝트 권한과 임의 결합하지 않습니다.
- JSON 요청은 최대20KiB이며 읽는 도중에도 상한을 적용합니다. 문자열의 NUL·부적절한 제어문자·잘못된 유니코드는 거부합니다. 본문의 줄바꿈·탭은 허용합니다.
- 최신 공식 reference의 정확 회사키·공통 댓글키를 서버가 확인하고 reference version을 새 기록에 남깁니다.
- `(created_by,request_id)` 고유 제약과 동일 트랜잭션 잠금으로 동시 요청을 직렬화합니다. 같은 입력 재시도는 기존 ID/작성자/작성시각 그대로200, 같은 요청ID의 다른 입력은409, 최초 추가는201입니다. requestId는 회사가 바뀌어도 작성자 안에서 재사용하지 않습니다.
- 성공은 `{comment,summary}`를 반환합니다. summary는 요청 회사 기준이며 목록과 상세의 건수/New를 같은 정의로 갱신합니다. source의 공식 글이나 내부 메모를 새 사용자 댓글로 변환하지 않습니다.

## 5. 저장소·최소 권한

새 테이블은 원 회사키·선택적 공통키·reference version·작성자ID/이메일·requestId/hash·본문·협업 여부·프로젝트 문자열·서버 작성시각을 보관합니다. 작성자ID는 기존 전용 `app_user`를 참조합니다.

- RLS를 켜고 전용 runtime의 SELECT/INSERT 정책·권한만 만듭니다. PUBLIC/anon/authenticated/service_role에는 새 테이블 권한이 없습니다. UPDATE/DELETE는 runtime에도 주지 않습니다.
- 같은 전용 DB runtime이 검증한 앱 세션을 사용하므로 공유 Supabase Auth의 `auth.uid()`를 권한 근거로 쓰지 않습니다.
- 원사이트 DB/다른 스키마·기존 테이블의 정책·권한·계정·default privileges를 바꾸지 않습니다. SQL의 원격 적용과 실제 역할별 쿼리 검증은 root 담당입니다.

## 6. 필수 검사와 완료 구분

정상 추가/조회/전체 요약, 세션 없음·만료·비검증, Origin·메서드·JSON·길이 경계, 작성자/작성일 위조 거부, 정확 회사키/공통키 공유·과거 null 격리, seed 원문 불변, requestId 재시도/충돌/동시 요청, COMMIT 실패 원복, 정렬·cursor·전체 건수, 정확31일/미래 제외, workspace 무쓰기·전용 스키마/최소 권한을 검사합니다.

신규 모듈 부재는 검사 준비 실패로 구분하고 실제 제품 결함 재현으로 세지 않습니다. 로컬 주입형 서비스·SQL 정적 검증, 실제 PostgreSQL 역할 쿼리, 인증된 실제 브라우저 저장·재접속은 각각 별도 상태입니다. 요구17의 다른 기사·신용·단가·갱신 자동화를 이 댓글 하위 구현 완료로 대신하지 않습니다.

### 현재 수행 근거

- `tests/center120-partner-comments.mjs`: 로컬24/24 통과·실행 중 서비스/SQL 지문 변경0. 모의 트랜잭션과 SQL 호출 계약을 사용하며 실제 DB·외부 네트워크는 사용하지 않았습니다.
- 모듈 부재와 테스트 fixture의 `structuredClone` 인자 오류는 준비 문제로 구분했습니다. 별도로 잘못된 UTF-8 바이트가 대체문자로 바뀌어 저장되던 서비스 반례(201)를 고정하고 엄격한 디코딩으로400·쓰기0을 확인했습니다.
- 이후 실제 PostgreSQL 격리 검사17개에서 역할·제약·미세초 커서·범위를 확인하고 전체 시험행을 되돌렸습니다. 운영 역할은 SELECT/INSERT만 있고 UPDATE/DELETE는 없으며 직접 클라이언트 읽기는 RLS로 차단합니다. MCP의 두 병렬 요청은 실제로 순차 실행돼 잠금 경합이 검증됐다고 세지 않습니다. 실제 배포 API의 새 댓글 저장·UI의 escape·저장·재조회는 별도 미검증입니다. SQL에는 새 테이블의 예상치 못한 기본 권한이 발견되면 적용 전체를 실패시키는 후조건을 넣었으며 다른 객체 권한을 자동 수정하지 않습니다.
- 독립 반례6개와 라우터8개를 추가했습니다. 같은 밀리초 안의 PG 소수초6자리 기록을 누락하지 않는 커서, 응답하지 않는 본문 읽기·취소의 유한 기한을 확인했습니다. 시간 표시를 저장 정밀도로 대신하지 않으며 중단된 읽기의 취소 완료를 무기한 기다리지 않습니다.
- 사용자가 기존 직원 댓글 이관을 명시적으로 승인한 뒤 `raportal-dom-20261020-v3`에14개 표시분을 보존했습니다. 기존 작성자/표시시각과 원문만 보관하고 새 앱 댓글로 재등록하지 않았으며 실제 고유 글14개라고 단정하지 않습니다. 원본 ID·정밀 시각이 없는 부분은 없는 상태로 유지합니다. GitHub·HTML에는 원문을 게시하지 않습니다.
