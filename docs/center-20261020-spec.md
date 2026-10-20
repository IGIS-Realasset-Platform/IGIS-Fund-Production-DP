# 개발솔루션센터 반영 구현 명세 — 2026-10-20

상태: 구현 진행. 기준 제품 v0.11.5, 다음 제품 v0.12.0. 사용자의 IMPLEMENT 승인이 과거 계획문서의 ‘이번에는 계획만’ 문구를 대체합니다. 구현·자동검사·실제 화면/출력·원격 배포는 별도로 판정합니다.

## 보존 경계

- 기존 회사 서비스·공유 Auth·다른 스키마·원사이트·원본 Excel은 변경하지 않습니다. 기존 Supabase 프로젝트 `baqybhtfvuttcyyzspyi`의 `development_project_platform`만 호환 확장합니다.
- 12메일 제한, 최초 메일 인증/비밀번호 가입, 이후 비밀번호 로그인, 기본8시간/선택7일 고정만료를 유지합니다. 비밀값을 기록/출력하거나 클라이언트에 넣지 않습니다.
- 현재 회사 공통 사업비 37개·유형코드·원단위 금액·계약/VAT·과거 확정본을 보존합니다. 회사 틀 확정 전 분류를 재설계하지 않습니다.
- 미입력은 0이 아니며, 실제 사업·날짜·금액을 샘플에 추측 생성하지 않습니다. 사용자 자료를 QA 편의로 지우지 않습니다.

## 요구별 성공/실패 기준

| ID | 승인 범위 | 핵심 성공/실패·소비자 |
|---|---|---|
| CENTER120-01 | 정확한 승인 샘플3개 권한 | 기존 인증 회원 일회 보완·신규 인증 가입 트랜잭션에서 editor 배정. viewer만 상향, approver/admin 보존. 이름 A/B/C만으로 권한 생성 금지. 일반 로그인은 회수된 권한을 복구하지 않음. 조회→수정→CAS저장→재접속·동시수정409 검사 |
| CENTER120-02 | 회의·원본 대응 | 마스터플랜21시트의 절차/시간축, Cost Tracker 비교/사유를 활용. 정비사업 사례·부분 예산을 공통 필수 절차/전체TIC로 승격하지 않음 |
| CENTER120-03 | 업체 기준정보 | 2026-10-20 raportal 원문 읽기 전용 대조. 5×30/지표/상세를 출처별 ID로 보관·지연조회. 공용 원문과 내부 메모 분리. 조회만으로 회사원장·감사·workspace 저장 발생 금지. 미확인≠0 |
| CENTER120-04 | 개인 알림 | sidebar 위치 유지. 알림 전용 최대720px/80vh 목록↔상세. 삭제/읽음은 사용자별 소형 API, 중복 클릭 방지·실패 복원. 원업무/다른회원/분기과제 상태 불변. 작업공간 전체PUT/전체렌더 금지 |
| CENTER120-05 | 사업비 이력·시점 | 묶음 전체 구성원 조회·사건중복 제거·KST 통일. 최초UW/최근 승인예산/현재추정 구분. 달력분기말 확인과제만 자동 생성, 사람 확인 후 별도 immutable snapshot. 주요시점 별도. 자료기준일/확인시각/분기/버전 구별, 정정 append·권한·충돌·4MB 경계 |
| CENTER120-06 | 프리셋 | 9용도 entry 유지, 기존 유형 후보를 계약·부담 범위별 미리보기 선택. 동일 재적용 no-op(저장/감사0), 기존ID/금액/계약/VAT 보존. 선택·취소·실패·다른사업 격리 |
| CENTER120-07 | 인허가 | 공통 골격+방법/조건별 후보. 가로절차·세로월/분기 맵과 목록 동일원장. 상세 법령/조건/일정/검토의견·조치/자료/이력 유지. 여러 선행·회차 보존, 관계종류 구별. 실제일은 단계 발생시 필수. 신규/수정/관계 영향범위 공통 서버검증, 무관한 legacy는 차단하지 않음 |
| CENTER120-08 | 법령 | 공식API 서버수집·일일예약, 성공/부분실패/최종성공/커서·중복·회복 구별. 빈응답/키오류≠변경0. 법령 원문버전과 프로젝트판단 분리. ‘확인 범위’ 설명블록만 제거. 키·정상호출·예약 실제 검증 전 완료 금지 |
| CENTER120-09 | 현행 명세·전수검수 | 현행/대체요구/당시검수/향후 구별. 등록동작+동적 폼/셀/드래그/키보드/자식팝업 분모 확정. 실행/통과/실패/차단/미검증 분리. 3desktop+mobile, Excel/PDF, 실제배포소스지문·로그 연결 |

## 서버·브라우저 공통 계약

기존 workspace/project-access API와4MB/CAS 계약 유지. 아래 자료는 서버 소유 별도 테이블이며 구형 workspace PUT가 덮지 않습니다. 모든 사용자 API는 기존 세션·allowlist·동일Origin 검사를 재사용하고 `Cache-Control: no-store`를 적용합니다. 오류는 `{error,message}`/401·403·409·422·503이며 민감한 내부 원인을 응답에 넣지 않습니다.

### 개인 알림 `/api/notifications`

- GET: `{states:[{notificationId,readAt,deletedAt}],tasks:[...quarterlyTaskMetadata]}`. 상태는 현재 회원 것만 반환. 알림 본문은 기존 안전한 프로젝트 원장에서 생성합니다.
- PATCH JSON `{notificationId,action:'read'|'delete'|'restore'}` → `{state:{notificationId,readAt,deletedAt}}`. 원업무 삭제나 완료 아님. 읽을 수 있는 사업에서 실제 생성 가능한 알림/서버과제만 허용. viewer도 개인상태 수정 가능.
- 브라우저는 popup 처음 열기 때 상태를 읽고 patch만 수행합니다. 낙관 갱신 실패시 행·선택·scroll 복원. legacy dismissed는 그대로 보존하고 개인 귀속을 추정하지 않습니다.

### 기준정보 `/api/reference-data`

- GET `?kind=partners` → `{version,checkedAt,source,groups,market}` (표에 필요한 공개 범위만). `?kind=partners&companyKey=...` → `{company}` 상세. GET `?kind=laws` → `{status,checkedAt,lastSuccessAt,records,changes}`.
- 인증 후 읽기전용. source snapshot 내부 데이터는 로그인 HTML/Git에 넣지 않으며 앱 전용 DB의 reference_snapshots에 보관합니다. 내부 companyRegistry·메모와 합치지 않습니다. 업체 탭/상세에서만 로드합니다.

### 사업비 시점 `/api/cost-snapshots`

- GET `?projectId=...` → `{snapshots:[metadata],tasks:[...]}`. `&id=...` → `{snapshot:{metadata,payload}}`. payload는 해당 버전 원단위 금액·코드·계약·비교기준이고 메타에 본문을 누적하지 않습니다.
- POST `{projectId,requestId,expectedRevision,kind:'quarterly'|'event'|'approvedBudget',quarterKey?,asOfDate,label,reason,correctsId?}`. 서버 현재 workspace에서 payload 구성. editor는 quarterly/event, approver/admin만 approvedBudget. quarterly는 존재하는 해당 확인과제 필요. captureAt은 서버시각, asOfDate는 담당자 확인일 기준 입력이며 과거 분기말 당시금액이라고 표시하지 않음.
- 동일 requestId는 동일결과, 다른내용 재사용409. 낡은 expectedRevision409. 정정 새 버전, 기존본문 UPDATE/DELETE 금지. quarterly는 해당과제만 완료, event는 정기과제를 완료하지 않음. snapshot이 최근승인예산을 임의 교체하지 않음.

### 유지관리 `/api/maintenance`

- GET, `Authorization: Bearer CRON_SECRET` 필수. Vercel 하루1회. quarterly/law 작업을 별도 성공/실패로 기록합니다.
- 분기는 도입 이후 도래 분기만 생성. 자동금액캡처 금지. 법령은 공식API 설정 없으면 configuration_missing이며 성공0건으로 위장하지 않습니다.
- 수집 성공커서는 모든 페이지 검증 후 이동. lease·요청중복·부분실패·누락구간 회복. 수집이 기존 인허가 판정·진행일·승인상태를 변경하지 않습니다.

### 법령 조회·사업별 확인목록 (추가 확정)

- 법제처 공동활용 신청은 사용자 본인이 완료하고 승인 상태를 확인했습니다. `DP_LAW_OC`는 사용자가 Vercel의 Production·Preview Secret에 직접 저장했으며 값은 대화·로컬·Git에 기록하지 않습니다.
- `/api/law-search`는 인증된 사업의 법령·행정규칙·지역 조례/규칙 검색, `/api/law-detail`은 공식 판본의 조문·부칙·별표 조회입니다. 서버가 공식 원문을 읽으며 OC가 포함된 API 링크를 브라우저로 돌려주지 않습니다. 현재/시행예정/과거를 구별하고 별표와 참고 인용을 법적 의제·위임 관계로 자동 승격하지 않습니다.
- `/api/law-watch` GET은 사업별 확인목록, POST는 사업편집권한 재확인과 공식본문 대조 후 이름/판본을 등록합니다. 자유입력 법령명으로 수집범위를 확정하지 않으며 동일 요청은 기존 ID를 재사용합니다. 지역 적용은 확인 전 `unverified`이고 조례를 구독하는 것만으로 법적 적용을 확정하지 않습니다.
- 인허가 법률·영·규칙, 행정규칙, 사업지 광역·기초자치단체 조례·규칙을 조회·추가할 수 있게 합니다. 관할·규모를 모르면 해당없음으로 처리하지 않습니다. 현재 예시 A/B/C의 주소로 실사업 관할을 자동 확정하지 않습니다.
- Hobby 함수 제한을 고려하여 세 법령 주소는 단일 `api/law.js`에 명시적으로 연결합니다. 기존 주소·메서드·인증/Origin·요청 본문은 유지하며 다른 API로 우회하지 못합니다. API 함수 파일은12개입니다.
- 하루1회 예약은 `0 23 * * *`(UTC), 한국시간08시대입니다. Hobby의 시간대 내 실행 변동을 정시08:00 보장으로 설명하지 않습니다. CRON_SECRET 검증·lease·중복 방지·누락구간 회복을 사용합니다.
- 신규 DB 파일 `database/center-law-watches-20261020.sql`은 이 앱의 `law_project_watches`와 기존 앱법령목록의 INSERT 권한만 추가합니다. 다른 스키마·공유 Auth는 변경하지 않습니다.

### 인허가 공통 검증

`shared/permit-domain.mjs`를 서버와 빌더가 같은 순수 규칙으로 사용합니다. 브라우저는 `App.permitDomain`으로 주입합니다. 신규·실제 바뀐 인허가와 관계 영향범위만 검사하고 원장 전체의 과거 빈값을 이유로 비용 저장을 막지 않습니다. 날짜 형식·계획신청/목표완료·단계발생 실제일·자기참조·선행순환·삭제/타사업 참조·회차 순서를 검증합니다. 의제/변경관계를 선행순환과 혼동하지 않습니다.

## 실행 순서와 검증 기록

1. 본 명세·독립기대값 테스트 → 의도한 RED 확인(모듈 부재는 준비오류로 구별).
2. 서버/권한·알림/업체·사업비 병렬 최소구현. 인허가/법령은 원본/현행법 대조 후 공통규칙 연결.
3. 집중→기존회귀→격리 Edge실제화면/출력→정확 파일지문→Preview→Production→실제로그.
4. 누적 MD/Excel·수정대장·README/Git기록을 같은 요구ID/실제상태로 동기화합니다. 네이티브 Excel/PDF와 전수 경로의 미실행을 숨기지 않습니다.

외부API 키/실제 로그인 검수가 막혀도 다른 구현·검사를 계속하며, 사용자 조작이 꼭 필요한 부분만 구체적으로 요청합니다. API의 존재·배포 Ready를 전체 기능완료로 세지 않습니다.
