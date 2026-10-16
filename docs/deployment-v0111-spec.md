# v0.11.1 후속 배포 명세: 기존 기능 유지·앱 인증·중앙 저장·실제 검수

## 2026-10-16 연결 복구 후 실제 실행 기준

사용자 후속 승인: 30분 임시 검수 요청에 대해 이 플랫폼의 상시 검수 접근을 허용했습니다. 만료 없는 검수 접근은 승인된 Preview 브랜치 주소에만 발급하고 Vercel 전체 보호, 앱의 회사메일 인증·세션·사업 권한, 다른 서비스 설정은 유지합니다. 접근값은 Git에서 제외된 비공개 작업파일에만 보관하며 대화·문서·URL·로그에 출력하지 않습니다. 이 승인을 전 직원의 앱 인증 생략이나 프로젝트 전체 공개로 확대하지 않습니다. 실제 OTP는 사용자 본인이 화면에 입력하며 메일함/OTP를 대신 수집하지 않습니다.

- 사용자 연결 완료 이후 현재 도구가 제공하는 Supabase 연결을 명시하여 기존 회사 프로젝트를 직접 조회했습니다. Vercel은 정확한 기존 프로젝트 ID만 지정한 조회의 반환 accountId가 승인 팀과 일치했습니다. 명시적 teamId 호출의403과 기본 목록0을 전체 연결 실패로 해석하지 않습니다. 이전 차단 기록은 당시 호출의 이력입니다.
- 승인된 Preview 브랜치에 새 앱 전용 인증·DB 설정4개를 Secret으로 저장했습니다. 기존 Gmail Secret3개는 값 열람·변경 없이 유지합니다. 기존 runtime 역할의LOGIN만 활성화했으며 기존 서비스 자격정보·Auth·업무행은 사용하거나 변경하지 않습니다.
- 실제 runtime 접속 첫 검사는 인증서 체인 검증에서 실패했습니다(SELF_SIGNED_CERT_IN_CHAIN). SQL/OTP/회원가입 실패로 확대하지 않습니다. PROD111-03/05/11의 연결 수용조건으로 공식 Supabase CA를 검증한 뒤 해당 앱 연결에만 지정합니다. rejectUnauthorized:true·호스트 검증·최대 연결1은 유지하고 인증서 검증 해제·공유 DB 보안 설정 변경은 금지합니다.
- 인증서 설정 없음/잘못된 형식과 인증·업무 저장 양쪽 소비자의 전달을 독립 검사로 고정한 뒤 실제 runtime 원복검사·최종 배포 검수를 재개합니다. 실제 메일·가입·로그인·중앙저장·브라우저 통과는 각각 실행 증거가 생기기 전까지 미완료입니다.

실행 후속: TLS 회귀12건·기존94건·Gmail 별도7건·게시HTML 합성2건을 통과했습니다. 실제 runtime PG의 격리 저장/원복10건과 합성 발송기로 실제 Better Auth PG 어댑터를 실행한 가입/세션/로그아웃/재로그인8건도 통과했으며 시험행은 남지 않았습니다. 소유자 원본/전후 지문c13ac4be971e1d34199828c161b82f8f 및 runtime 전후 지문762a02af77e4691e709840af6d54f30c를 각 동일 역할·조건으로 대조했습니다. 역할 간 지문은 regprocedure의 search_path별 표현 차이 때문에 서로 같다고 판정하지 않습니다. 앱→pooler TLS1.3/인증서·호스트 검증은 확인했지만 별도로 관측된 pooler→PostgreSQL backend ssl=false를 전체 경로 암호화 통과로 바꾸지 않습니다. 기존 공유 SSL 설정은 변경하지 않았습니다.

현재 커밋5357606c0f12175da77e33cf3c97c54972abbe6c의 검증배포dpl_32S6ZGkbaAVEo4DsDgkVVwUvxiZ9가Ready·icn1입니다. 실제 수신·본인6자리·배포API 지속저장·원격HTML지문/실제화면·공개직원진입은 미검증이며 보호된 배포의30분 임시 검수 접근은 자동보안검토 거부 후 사용자 승인을 요청한 상태입니다. 승인 없이 같은 접근을 다른 도구로 우회하지 않습니다. 현재 근거는 outputs/deployment/cloud-v0111-20261016/connection-restored.json입니다. 아래 절의 미게시·차단 기록은 각 당시 이력으로 보존합니다.


최초 작성: 2026-10-15 · 승인 갱신: 2026-10-16. 후속 v0.11.1은 서버/프런트 계약·DB stage1·격리 합성검수 단계이고 실제 메일/runtime DB/새배포 수용은 아직 미완료입니다. 10절은 수행 근거, 11절은 오늘 직접 승인과 직원 진입장벽 전환 기준입니다. 이전 미응답3건은 답변을 받았지만 실행/검수 완료가 아닙니다. 원문/과거 proof는 보존합니다. PM은 소유3문서 외 제품·DB·계정·비밀값을 변경/열람하지 않습니다.

최신 직접 답변이 이전 인증 정책을 대체했습니다. **Supabase Auth는 사용하지 않고 앱 전용 비공개 schema에서 별도 로그인 기능을 구성합니다. 직원 누구나 Vercel 계정 없이 `@igisam.com` 메일6자리 숫자 확인으로 가입/로그인할 수 있는 것이 확정 목표이며 초기 전 직원 공통 코드는 폐기합니다.** 비밀번호·이름/사진 수집을 강제하지 않습니다. 수신/최초관리자 대상과 전용 Secret 저장 승인은11절, 실제 발송·세션·권한·전환 실행/검수는 별도 근거로 확인합니다.

메일 발송의 최신 개발 방향은 **사용자가 승인한 발신용 Gmail 계정의 SMTP**입니다. 별도 메일 서비스 가입은 플랫폼 개발의 필수조건이 아니며 Brevo 가입은 보류합니다. 사용자가 `DP_GMAIL_APP_PASSWORD` 저장 완료를 알렸고, 루트가 Vercel 공식 UI에서 관련 변수3개의 이름·각 변수의 Preview 브랜치 적용 범위·저장 대화상자 닫힘을 확인했습니다. 비밀값은 열람하지 않았습니다. 이후 검증 배포가 Ready가 됐고 2026-10-15 11:44:48.351 KST의 공식 빌드 로그에서 SMTP `configured:true`, `connection:verified`, `mailSent:false`, `applicationAuthenticationActive:false`를 루트가 확인했습니다. 이는 SMTP 연결 확인만이며 실제 메일 발송0·DB/앱 인증 미연동은 유지합니다. 일반 Gmail 비밀번호를 앱의 SMTP 자격정보로 저장하거나 문서/대화로 수집하지 않으며 계정 주소·비밀번호·발급 비밀값은 이 문서와 공개용 문서에 적지 않습니다.

준비 이력: 앞 단계에는 Google 비밀번호 직접 입력 화면 인계 후 2단계 인증/앱 비밀번호 가용성 미확인·Secret 저장0으로 기록했고, 그다음 사용자 저장 완료 알림/UI 메타데이터만 확인한 뒤 SMTP verify를 예정했습니다. 이후 첫 커밋은 Vercel 작성자 미매칭으로 차단됐지만 동일 제품 코드의 README1줄 후속 커밋 `66c51648f47e4fb6659dcd7c4ff2241abefdb42a`는 Ready18초와 위 SMTP 연결 결과를 확인했습니다. 차단/예정은 당시 이력이며 현재와 구별합니다. 다음은 승인된 범위의 실제 메일 발송·수신과 6자리 가입/로그인·프로젝트 권한·DB 저장 검수입니다. SMTP verify 통과를 이들 기능 완료로 확대하지 않습니다.

## 1. 최신 요청과 변경하지 않을 범위

기존 개발사업관리플랫폼의 후속 배포를 이어갑니다. 기존 전문가가 인증·저장·프런트엔드 연결·독립 검수를 나눠 수행하며 기존 웹 기능과 입력 서식을 유지합니다. Notion은 선택 보충자료이지 새 플랫폼의 중심이나 필수 배포 입력이 아닙니다.

- 기존 프로젝트 현황, 사업 개요, 사업비, 금융, 인허가, 계약·문서, 개발업 등록, 국토부 보고서, 법령·명세 및 출력 기능을 보존합니다. 이번 연결을 이유로 탭·항목·색·분류·입력방식을 임의 재설계하지 않습니다.
- 회사 비용유형 95개, 기본37/선택58, 9종 프리셋, 원 단위 저장·정수 백만원 표시, 미입력/0, 계약·부가세·확정시점·과거 보고본의 의미를 유지합니다.
- 보충자료가 없어도 빈 실제 플랫폼의 수기 사업 등록과 기존 기능을 사용할 수 있어야 합니다. 잘못된 보충자료는 적용만 막고 기존 수기 자료를 보존합니다. 가상 예시4사업은 실제 원장에 복원하지 않습니다.
- Supabase의 앱 전용 `development_project_platform` 영역만 사용합니다. 기존 조직 서비스의 테이블·자료·외래키·뷰·함수·권한·공유 운영원장은 연결하거나 수정하지 않습니다.
- 직원 이름·사진 수집은 보류입니다. 기존 선택 Notion의 이름 배치를 직원 계정·재직·법적 전문인력 확정으로 승격하지 않습니다.
- 개인 제작·검증용 기준과 기존 보호는 전환 검증 전까지 보존합니다. 최신 목표는 Vercel 계정 없이 직원 누구나 회사메일6자리로 가입/로그인하는 진입입니다. 앱 인증 배포 검증 후 이 앱의 보호장벽 전환 범위·과거 URL 영향을 설명하고 루트가 액션 시점 승인을 확인합니다. 사업별 서버권한은 유지하며 다른 서비스 보호·DB/Auth·운영승격·유료전환·실자료 이관으로 확대하지 않습니다.

## 2. 선행 결정과 현재 근거

| 구분 | 현재 결정·확인 | 이번에 완료로 간주하지 않는 것 |
|---|---|---|
| 코드 기준선 | 전용 비공개 저장소의 `preview/core-v0.11.0`, 코어 커밋 `94fdd25e93a8455945f898373f745108b9962aa4`; 기존 main 보존 | 새 인증·중앙 저장 구현 |
| 최신 문서 게시 | 문서 커밋 `1685da4e3b495d6d198a3d1b29794b44bdc0db1c` | 문서 게시만으로 기능·운영 완료 |
| 검증 배포 | Vercel Git 공급자 success, 개인 보호 검증 배포1건 | 회사 운영·로그인 후 실제 업무 검수 |
| 파일 동일성 | Git 인덱스85개 격리 빌드 A6D1C214E63CA823441E49FBAFD801741D0AF567ED64DD25A3C4D529068E15E4, 8,105,186바이트 | 원격 HTML 지문 읽기 대사 |
| 접근 보호 | 첫 경로와 선택 API의 무인증 요청은302→Vercel 로그인, 화면·자료 노출 없음 | 앱 직원 인증, 모든 API/정적 자산/권한 경계 검수 |
| 실제 브라우저 | 정확 HTML e6938e5d9e05132fa025106392077c7dbc2ea42257834a0c699cd3582a84e735(8,120,178바이트)의 홈·명세8개 세부탭·리로드홈을 CUA에서 확인. 후속 실제 URL의 읽기 검수는 루트 진행 중 | 업무CRUD·PDF·XLSX·실제 가입/로그인/DB 미검수. 이전 MXC 차단과 제한된 현재 확인을 전체 통과로 변경하지 않음 |
| DB 영역 | 앱 전용 stage1 migration20261015035338·10테이블/RLS·새 runtime 역할NOLOGIN 적용. 기존49관계/40함수·이력 불변 | 실제 runtime PG LOGIN·앱 자격정보·메일/가입/중앙저장 통합은 미검증. 소유자 합성SQL7을 runtime 통과로 확대하지 않음 |
| 최신 인증 정책 | `@igisam.com` 이메일·회원가입 메일6자리 숫자 검증·별도 앱 로그인/private schema; Supabase Auth와 초기 공통 코드 폐기 | 비밀번호/M365 강제·비회사 가입·정적 HTML의 가짜 권한·기존 Auth/SMTP/키 재사용 |
| 메일 개발 방향 | 사용자 저장 알림/UI 변수3개 범위 확인·값 미열람. 후속 검증 배포Ready 및 공식 로그의 SMTP connection:verified 확인 | 메일전송0·가입/로그인/프로젝트 권한/DB 미완료. SMTP 성공은 연결만. Brevo 가입 보류·다른 제공자 가입 강제 없음 |
| 선택 자료 | Notion 시점 snapshot은 선택 보충; 서버 자료 Secret은 미설정 | 실시간 Notion API 자동 동기화 |

근거는 `outputs/deployment/real-projects-20261014/core-preview-deployment.json`, `documentation-publication.json`, `.build/optional-deployment-20261014/git-stage-evidence.json`, `outputs/deployment/shared-db-20261014/진행현황.md` 및 `reuse-evidence.json`입니다. 이전 `outputs/v0133/운영전환_준비현황_20261014.md`의 신규 프로젝트 생성 차단·배포0은 당시 이력입니다. 같은 문서의 Supabase 로그인·공통 첫 이용 코드·개인 비밀번호 방향과 앞서 검토하던 공유 Supabase Auth 경로는 최신 직접 답변으로 대체됐습니다. 해당 정책을 되살리지 않으며 회사 이메일 확인·서버권한·중앙 저장·실패 원복·복구·실제 검수의 목적은 계승합니다. 회사 이메일을 검증한 가입을 제공하되 가입 성공 자체를 모든 프로젝트 접근권한으로 바꾸지 않습니다.

## 3. 후속 요구사항과 수용기준

최초에는 명세만 작성한 상태에서 시작했으나 현재 계약 구현·DB stage1·합성검사/브라우저 진척은10절과 수정대장 currentVerification에 구분합니다. 아래12개 전체 수용기준은 아직 미완료입니다. TPROD111 식별자는 요구 추적용이며, 그 이름이 있다는 사실을 현재94개 합성검사 또는 실제 메일/DB 검수의 성공으로 바꾸지 않습니다.

| 요구 ID | 업무와 수용기준 | 핵심 실패·보존 경계 | 검사 ID |
|---|---|---|---|
| PROD111-01 | 기존 전 기능을 인증·저장 연결 뒤에도 같은 화면·항목·행동으로 사용할 수 있음 | 탭 제거·임의 재설계·예시 혼입·동기화 때문에 수기값 덮기 금지 | TPROD111-01 |
| PROD111-02 | Vercel 계정 없이 직원 누구나 @igisam.com 회사메일6자리 숫자 확인으로 한 화면에서 가입/로그인. 첫 성공은 계정생성, 이후는 로그인이며 서버 검증 | 비회사·미인증·오류/만료/과다시도·이미 사용/재전송 전 코드 차단; 발송/검증 실패 회원생성0. Vercel 계정·초대전용·공통코드·비밀번호 강제 없음·이름/사진 보류 | TPROD111-02 |
| PROD111-03 | Supabase Auth 없이 앱 전용 계정·OTP·세션을 private schema에서 관리하고 서버가 별도 앱 인증을 검증 | 기존 auth 계정/세션·공유 SMTP/키·설정·타 서비스 계정 연결/변경0. OTP 단기 만료·시도 제한·1회 사용·해시 검증값 저장·재전송 무효화를 적용 | TPROD111-03 |
| PROD111-04 | 직원의 회사메일 가입/로그인 허용과 별도로 서버가 프로젝트별 조회·수정·확정·내려받기 권한을 매 요청에서 검사. 최초 관리자는 사용자 본인 회사이메일로 승인 | 진입장벽 제거는 전원 사업자료 공개가 아님. 미부여/다른사업/변경된 권한·만료 세션은 거부. 첫 가입자 자동admin·개인주소 공개설정 하드코딩 금지 | TPROD111-04 |
| PROD111-05 | 앱 전용 schema에만 중앙 저장 경로를 구성하고 실제 역할별 최소 접근을 검증 | 기존 조직 객체 접근/연결0. 서버 비밀키 클라이언트 노출0. API 노출·권한·RLS 또는 서버 전용 경로는 아래 결정 게이트 후 구현 | TPROD111-05 |
| PROD111-06 | 모든 업무 소비자가 동일한 실제 기록과 의미를 읽고 저장함 | ID·원 단위 정수·미입력/0·표준코드/당시 정의·법인 공유관계·계약/VAT·의견/조치·확정본·보고서 전용 수정값/플랫폼 반영 경계를 보존 | TPROD111-06 |
| PROD111-07 | 업무 변경과 감사이력을 함께 저장/취소하고 충돌·중복 요청·저장 실패를 처리 | 일부만 저장, 오래된 창의 조용한 덮기, 재시도 중복 원장/이력 금지. 실패 시 입력값·초안·실제 부모·포커스 보존 | TPROD111-07 |
| PROD111-08 | 로컬 저장에서 중앙 저장으로 전환하는 대상·시점·재로드·복구 범위를 명시하고 격리 자료로 먼저 검증 | 사용자 로컬 자료 자동 업로드/삭제·legacy 예시 복원 금지. 로그인 계정/프로젝트 간 초안·캐시 혼입 금지. 동기화 실패를 저장 성공으로 표시하지 않음 | TPROD111-08 |
| PROD111-09 | 앱 영역의 백업·분리 복구 절차와 승인자를 정하고 실제 복구를 확인 | 공유 프로젝트 전체 복구로 기존 서비스를 덮지 않음. 앱 이전 배포만으로 DB 변경이 복구된다고 가정하지 않음. 자료·권한·확정본을 함께 대조 | TPROD111-09 |
| PROD111-10 | Notion 선택 보충을 인증/중앙 저장 이후에도 선택적으로 적용하고 수기 자료를 보존 | 자료 없음은 코어 실패 아님. invalid source 적용만 차단. snapshot을 실시간 API로 표시하지 않음. 원문·실명·ID·Secret을 Git/로그에 게시하지 않음 | TPROD111-10 |
| PROD111-11 | 같은 최종 커밋/빌드/URL에서 앱 인증·서버권한·저장/출력을 검증하고, 과거 URL 영향을 확인해 액션 시점 승인 후 이 앱의 Vercel 계정 장벽을 전환. Vercel 없는 새 브라우저에서 회사메일6자리 진입 확인 | 전환 전 보호유지는 임시 보존조건. 이전302/SMTP/합성/과거 검수를 전환 수용으로 승격하지 않음. 무인증 원장/API·과거 URL의 자료/비밀 노출0, 다른 서비스 보호/DB/Auth 변경0 | TPROD111-11 |
| PROD111-12 | 명세·수정대장·누적 MD·Excel·Git 이력·배포 증거를 같은 요구번호/최종 지문으로 연결 | 기존347/369 기록·v33 HTML/Excel·실패 이력 보존. 구현·자동·실제·보호 검증 배포·회사 운영 상태를 각각 기록 | TPROD111-12 |

## 4. 구현 전 결정 게이트

다음 세부 계약은 **미결**입니다. Supabase Auth 미사용·별도 앱 인증/private schema·회사 이메일6자리 검증·공통 코드 폐기와 승인된 Gmail SMTP 준비 방향은 이미 정해졌습니다. PM이 그 방향을 되돌리거나 미확인 메일 자격정보·세션/DB 구조·권한·제한 수치를 임의 확정하지 않습니다. 담당자가 필요한 읽기 전용 근거와 영향·대안을 제출하고 루트가 승인 범위를 확인합니다. 기존 서비스의 직원/업무행·인증 계정·비밀값을 조사 편의로 읽지 않습니다.

| 게이트 | 확인할 내용 | 확정 전 허용되는 일 | 확정 전 하지 않을 일 |
|---|---|---|---|
| G111-AUTH | Supabase Auth 없이 앱 전용 계정/세션을 검증하는 서버 계약·세션 만료/회수·로그아웃·쿠키/요청 보호와 least-privilege DB 경로 | 별도 인증/세션·실패검사·기존 서비스 무변경 설계 | Supabase Auth 호출/설정변경·기존 계정/세션 수집·기존 인증 비밀값 재사용·새 OAuth/M365 강제 |
| G111-ACCESS | 최초 관리자 대상은 사용자 본인 회사이메일로 승인됨. 프로젝트 역할·회수 세부는 서버 계약/실제 검수와 구별 | 승인 대상을 서버 전용으로 설정하고 회사메일 확인 후 관리자 부여를 검증할 준비 | 개인주소를 소스/public config/Git에 하드코딩, 첫가입자/전직원 자동admin·전체사업 권한 부여, 기존 서비스 역할 사용 |
| G111-MAIL | 보호된 Git 검증 배포Ready·공식 빌드 로그에서 메일전송 없는 SMTP verify의 연결 확인. 비밀값 미열람 | 다음 실제 발송/수신·6자리 인증을 SMTP 연결과 분리하고 실패/지연·회원 미생성·재전송·메일 adapter 합성검사와 기존 플랫폼 개발 계속 | 비밀값 열람·일반 Gmail 비밀번호 저장/수집·기존 앱 SMTP/key 재사용·SMTP 통과를 발송/가입 완료로 표시·계정/메일함/그룹웨어 자료 조회·별도 서비스/요금제 가입 강제 |
| G111-ENTRY | OTP의 단기 만료·시도/발송/재전송 제한 수치·1회 사용·동시검증·검증값 저장과 가입/로그인 상태 전이 | 서버 비밀키 결합을 포함한 암호학적 검증값 계약·실패검사 작성 | 폐기된 공통 코드 복구·임의 비밀번호 필드·OTP 원문 DB/지속 저장/로그 노출·미설정 제한으로 발송 허용 |
| G111-DATA | 새 schema의 테이블/저장 계약·API 노출/서버 경로·최소 역할·동시 수정/중복 요청 방식 | 기존 상태/소비자 구조 읽기 대조와 합성자료 계약검사 | 기존 조직 테이블·FK·함수·권한 연결, schema 전체 무조건 공개, 실제 사용자 자료 이관 |
| G111-RECOVERY | 앱 영역 백업 범위·보존기간·허용 손실·복구 시간·승인자·분리 복구 환경 | 앱 범위 복구 계획·실행 전 영향 검토 | 기존 공유 DB 전체 덮기/복구·기존 서비스 중지/삭제·유료 구독 변경 |

최신 답변은 전 직원 공통 코드 정책을 폐기했으므로 그 코드나 직원별1회 초대 코드로 되돌리지 않습니다. OTP는 매 인증 요청의 짧게 유효한 메일 확인 코드이며 과거 공통 첫 이용 코드와 다른 기능입니다. G111-AUTH는 Supabase Auth 도입을 다시 묻는 것이 아니라 **별도 앱 인증·세션을 다른 기존 서비스에 영향 없이 구현하는 계약을 확인하는 것**입니다. 이름/사진 보류와 기존 서비스 미연결은 그대로 유지합니다.

### 최초가입·프로젝트 권한: 확정된 정책과 미결 결정

이번 후속 요청은 회사메일6자리 발송 확인→가입/로그인→앱 전용 중앙 저장까지 이어서 구현·검증하는 것입니다. 이 요청은 기존 모든 사업에 대한 접근이나 최초 가입자의 관리자 자동 승격을 승인한 것이 아닙니다. 계정의 본인확인, 앱 세션, 프로젝트 멤버십, 관리자 권한은 각각 다른 단계로 구분합니다.

| 구분 | 현재 확정·승인된 내용 | 미결·금지 경계 | 연결 요구 |
|---|---|---|---|
| 최초가입 | 정확한 회사 도메인의 메일6자리 확인 성공 후 별도 앱 계정 생성·로그인 흐름 제공 | 과거 초대 전용/공통 코드/비밀번호 강제로 회귀하지 않음. 메일 발송·검증 실패 시 회원/세션 생성0 | PROD111-02/03 |
| 기존 가입자 로그인 | 같은 확인된 앱 계정의 세션을 만들고 재로그인·로그아웃·만료를 구별 | 같은 이메일의 중복 회원 생성, 다른 이메일/용도 코드 재사용, 권한 재생성 금지 | PROD111-02/03/07 |
| 프로젝트 접근 | 서버가 현재 사용자·프로젝트별 유효한 멤버십/역할을 매 요청에서 확인 | 회사메일 확인·Vercel 로그인 성공만으로 모든 사업의 조회·수정·확정·내려받기 허용 금지 | PROD111-04/05 |
| 최초 관리자 | 2026-10-16 사용자 본인 회사이메일을 수신/최초관리자 대상으로 명시 승인 | 승인과 실제 설정/인증 후 부여를 분리. 개인주소 미기재·서버전용 설정. 첫가입자·발신Gmail·배포계정으로 추측하지 않음 | G111-ACCESS·PROD111-04 |
| 새 가입자의 기본 권한 | 미승인 권한을 추가하지 않고 가입 사실과 사업 접근을 분리 | 기본 역할·처음 부여할 프로젝트 membership은 미결. 미부여 상태를 임의 전체사업 권한으로 채우지 않음 | G111-ACCESS·PROD111-04 |
| 신규 프로젝트 생성 | 기존 수기 프로젝트 생성 기능은 보존 대상 | 생성할 수 있는 역할, 생성자의 최초 프로젝트 권한은 미결. 생성자를 자동 전체관리자로 정하지 않음 | PROD111-01/04/08 |
| 권한 부여·회수 | 승인된 주체가 서버에서 대상/범위를 검증하고 변경과 이력을 함께 처리 | 부여 승인자·구체 역할표·회수/퇴직자 처리 세부는 미결. 클라이언트가 보낸 역할/회원ID를 그대로 신뢰하지 않음 | PROD111-04/07 |
| 조직·이름/사진 | 앱 전용 schema만 사용하고 이름/사진 수집 보류 유지 | 기존 조직 DB/Auth/계정/관계를 자동 연결하지 않음. Notion의 담당/전문인력 이름을 앱 계정/권한으로 변환하지 않음 | PROD111-03/05/10 |

**안전한 준비 경계:** 유효한 프로젝트 권한이 없는 사용자는 가입/인증 사실만으로 기존 사업 자료를 읽거나 변경할 수 없습니다. 최초 관리자 대상은 오늘 명시 승인됐으며 그 외 미승인 membership/admin을 자동 생성하지 않습니다. 직원 누구나 회사메일 확인으로 가입/로그인할 수 있다는 승인을 최종 기본 역할표·전체사업 공개·새사업 생성 권한으로 확대하지 않습니다. 실제 서버 설정/부여와 권한 반례는 따로 검증합니다.

API 계약 대조는 요청한 이메일/인증 용도→발송/검증 성공·실패→계정 생성/재사용→세션→프로젝트 membership 조회/검사→업무 저장/감사의 순서로 합니다. 구체 경로·요청/응답 필드·제한 수치는 루트/구현 담당의 계약을 받은 뒤 명세에 연결합니다. 현재 이 절은 정책/실패 경계를 정한 것이며 실제 메일·가입·권한·DB 검수 통과가 아닙니다. TPROD111-02/03/04/05/07/11에는 비회사 주소·틀린/만료/재전송전 코드·미부여 membership·다른 사업/역할·중복 가입/재시도·권한 회수·부분 저장 실패 반례를 포함합니다.

### OTP 저장·발송·검증의 필수 경계

- OTP는 정확히6자리 숫자 문자열로 취급하여 선행0을 잃지 않습니다. 생성은 추측 가능한 순번/시간 기반이 아닌 암호학적 난수 경로를 사용합니다.
- 메일 전달과 사용자 입력에는 코드가 필요하지만 DB에는 원문 대신 서버에서 검증할 암호학적 해시값만 보관합니다. 짧은 숫자 공간의 단순 해시만으로 안전하다고 단정하지 않고 서버 비밀키 결합·최소 역할 접근을 계약에 포함합니다. 코드·검증값·세션 비밀은 Git/로그/응답·브라우저 지속 저장에 노출하지 않습니다.
- 단기 만료·검증 시도 제한·발송/재전송 제한은 서버에서 검사합니다. 정확한 제한 수치는 미확인이며 미설정 상태를 무제한 허용으로 처리하지 않습니다.
- 새 코드 발급 후 이전 코드로는 성공할 수 없습니다. 같은 코드의 동시 검증도1회만 성공하며 만료·실패횟수 초과·이미 사용된 코드는 세션/회원/권한을 만들지 않습니다.
- 메일 발송 실패·지연·제공자 미설정은 확인 성공으로 표시하지 않습니다. 실패 시 회원생성0이며 미전달 코드는 유효한 인증 경로가 될 수 없습니다. 가입 확인과 회원생성·코드 사용 처리에는 부분 성공이 없어야 합니다.
- 메일 주소의 정확한 회사 도메인을 서버에서 확인합니다. 도메인 위장·다른 주소에 발급한 코드·가입용/로그인용 요청의 문맥 바꾸기를 차단합니다. 회사 메일 확인만으로 모든 프로젝트 권한을 부여하지 않습니다.
- 발신용 Gmail 계정과 수신/가입을 허용한 회사 이메일은 별도 역할입니다. Gmail을 발신자로 사용한다는 이유로 Gmail 주소의 플랫폼 가입을 허용하지 않습니다. 앱 비밀번호·발송 자격정보가 준비되지 않으면 발송/인증 성공을 막고 회원은 만들지 않되, 합성 검사와 기존 플랫폼 개발을 중단하는 조건으로 삼지 않습니다.

## 5. 소비자와 저장 연결

저장 설계는 구현 편의로 사용자 관리단위를 세분화하지 않습니다. 실제 DB 정규화·상태 문서 저장 등 내부 구조는 담당 설계에서 제안하되 다음 소비자들이 동일 정의를 사용하도록 독립 대조합니다.

| 데이터/행동 | 영향을 받는 소비자 | 반드시 연결할 반례 |
|---|---|---|
| 계정·세션·프로젝트 권한 | 최초 진입, 메뉴, 직접 API, 저장/확정, 로그아웃/재진입 | 허용 외 이메일, 만료, 권한 회수, 다른 프로젝트, 브라우저 조작 |
| 프로젝트·법인·사업비·조달 | 조회, 선택 팝업, 같은셀 입력, 합계/분석, 계약/VAT, 확정/이력, Excel | null/0, 큰 원금액, 빈 저장, 상세/소계, 동일/독립 범위, 공유 법인 |
| 인허가·등록·전문인력 | 목록, 팝업, 조건부 입력, 검토의견/조치, 필수 경로/날짜, 저장/취소/초안 | 무수정 닫기, 숨긴 수정값, 경고 후 초안 복원, 부모1회 복귀, 전문인력 원문/미확인 보존 |
| 보고서 작성본·확정본 | 전체셀 편집, 두 저장 선택, 미리보기, 저장 이력, 인쇄/PDF | 보고서만 저장, 명확한 플랫폼 반영, 다른 작성본/과거 동결본 불변, 실패 일괄 원복 |
| 선택 Notion 자료 | 추가 보충 API, 수기 사업, 프로젝트 문맥/초안, 새로고침/재동기화 | 없음/오류/정상, 동명 수기 사업, 수정 중 적용, 저장 실패, 원본 상태와 자산용도 구별 |

## 6. 검증 순서와 종료 조건

1. 각 결정 게이트의 사실·승인·미결을 분리합니다. Supabase의 변경 가능한 API·Auth·권한 동작은 구현 담당자가 현재 공식 문서와 실제 지원을 확인합니다. 명세 단계에서 제품/계정/DB를 변경하지 않습니다.
2. 승인된 요구·독립 원본/합성 입력으로 실패검사를 먼저 작성합니다. 모듈 부재·도구 실패와 현재 제품의 의미 오류를 구별합니다.
3. 최소 구현 후 실제 제품 모듈/래퍼/로딩 순서를 포함한 집중·회귀검사를 실행합니다. UI 존재 검사는 실제 저장·실패·권한 차단 검사를 대신하지 않습니다.
4. 격리 계정/자료에서 로그인→조회→수정→저장→다른 허용 사용자 확인→거부 사용자 직접 요청→출력을 검증합니다. 실제 사용자 자료·쿠키를 검사 편의로 변경하거나 지우지 않습니다.
5. 최종 배포 URL의 1280×800·1440×900·1600×1000에서 주 메뉴/세부탭·팝업·더블클릭·Enter/Escape·스크롤·초안·저장 오류를 확인합니다. 보고서 전체셀/두 저장 선택/과거본, 사업비 한 시트 Excel, 필요한 제1·2호 PDF 전 페이지도 같은 최종본에서 확인합니다. native Excel 열람은 파일 재읽기 검사와 별도입니다.
6. 코드·Git 커밋·로컬 빌드·원격 배포파일 지문·검수 대상·DB 계약/검증 범위를 연결합니다. 앱 범위 백업/분리 복구 결과도 남깁니다.
7. 성공·실패·차단·미검증 상태를 요구별로 기록한 뒤 루트가 누적 MD/Excel·Git 문서·최종 배포 증거를 동기화합니다. 실제 UI/권한/저장/출력·복구가 남아 있으면 운영 완료로 표시하지 않습니다.

이번 후속 단계의 목표는 보호된 **검증 배포와 실제 인증/저장 흐름의 확인**입니다. 회사 운영 공개·실자료 자동 이관·기존 서비스 변경은 이 목표에서 자동 승인되지 않습니다.

## 7. 역할과 파일 소유

| 역할 | 담당 | 현재 범위 제한 |
|---|---|---|
| PM | 이 명세와 PROD111 요구/검수 경계 | 현재 작성 파일은 `docs/deployment-v0111-spec.md` 하나. 제품·누적/Excel·계정/DB 변경 없음 |
| 백엔드·인프라 담당 | Auth/DB 영향 조사, 결정 게이트, 승인 후 서버권한·저장·감사·복구 계약 | 기존 조직 서비스/인증/공유 원장에 임의 변경 없음 |
| 프런트엔드 담당 | 기존 UI/전 기능을 유지한 인증·저장 연결, 초안/실패/복귀·선택 보충 연결 | 관계없는 UI 재설계·가상 원장 복원 없음 |
| 독립 QA | 원요구/독립 입력/실제 동작, 최종 버전·지문 대조 | 구현자의 기대값 복사·과거 검수 승격 없음 |
| 루트 | 승인 확인, 전문가 재사용, 외부 게시/배포/계정·DB 작업, 누적/Excel 최종 동기화 | 담당자 보고만으로 실제 완료 확대 없음 |

## 8. 적용한 프로젝트 원칙

G-02/03/04/05의 최신 정정·권한·기존 전문가·미결 경계, UX-01/07/09/10/11/12/16/17/18의 전 흐름·미입력·같은셀·초안/부모·홈·보고서·최소 변경·실제 검수, D-07/08의 원금액·소유/확정 연결, Q-01~05/07의 실패검사·보존·자동/실제 구분·도구 오류·최종 지문·동일 요구번호를 적용합니다. 지침 추가만으로 재발이 불가능하다고 보장하지 않습니다.

## 9. 플랫폼 내 명세 원문 전체 검토와 연결 매트릭스

### 9.1 검토 범위·지문·개수

최신 추가 지시인 “플랫폼 명세에 적혀있는 내용 자세히 다 보면서 일 해”를 이 후속 인증/중앙저장 작업에 적용했습니다. 기본 명세 원문과 그것을 변경·추가·표시하는 연결 코드를 **처음부터 마지막 줄까지** 읽고, 기능·배열 필드·저장·권한·보고·미구현·배포의 경계를 대조했습니다. 원문 모델·다른 서비스·실제 업무행·인증 계정·비밀값은 조사하지 않았습니다.

| 원문 | 읽은 범위 | 바이트/행 | 조사 지문 SHA-256 |
|---|---|---:|---|
| `src/data/base-spec.json` | 1~1,377행 전체·19개 최상위 구역·모든 하위 값/배열 | 52,898/1,377 | `04E2532749B7869DECF7BA33E84AF54615ED8E39BE403EBE65B341BB56255CC3` |
| 보존된 `src/spec.js` 원문 | 1~706행 전체. 보존 Git 코어 후보의 파일과 원래 작업 파일의 동일 범위를 대조 | 154,433/706 | `D019D9190A926CD7CDE9C8ADA5D88DCF422112C7EE6742B7C6406562DBF5CE3A` |
| 2026-10-15 현재 명세 투영 후보 | 기존 원문과 추가/수정된 인증·배포·표시 부분을 대조. **조사 중인 후보이지 최종 배포 증거가 아님** | 159,144/724 | `18F0AEA8DF897AC255BA2E2B97C0ED1718C4E6577FA6BDAB2BBB20404FE18EFF` |
| `src/data/deployment-status-v0111.json` | 현재/과거·인증·검수·미연동 필드 전체 | 1,762/53 | `A4E92932F180F10DD2C4505098F0D01AA79DCD55E53014838C1F279555CDC65E` |
| `docs/v0133-spec.md` | 승인·보존·4요구·기존129검사·미완료 운영 경계 전체 | 6,695/32 | `4DE4543BBF8F0B754CDC5CD23D5E03A84F5C8CBAE8EE6C7230D7410A0B084486` |
| `docs/real-deployment-v0110-spec.md` | 최신6요구·대체된16요구·canonical 필드·빈자료 소비자·검수/배포 이력 전체 | 28,528/197 | `CBFF8541EB6BDBBEF5EAC1E98A3739152C927EB05D51AB9B47CC4737F87F0384` |

현재 파일은 다른 담당자의 교정이 진행 중입니다. 위 지문은 **읽은 조사본을 특정**하며 이후 파일의 최종 지문이나 실행 완료를 대신하지 않습니다. 부모가 검토한 최종 UI/JSON·새 검사·배포 파일은 별도 근거로 연결해야 합니다.

기본 JSON 전수 구조 계수는 최상위19구역, 객체 키433개, 원시 말단값907개, 배열145개, 배열 항목708개입니다. 문자열·숫자·boolean·null과 각 배열의 모든 요소를 포함한 구조 개수입니다. 독립 기능/법정 요구가145개 또는708개라는 뜻이 아닙니다. 빠진 최상위 구역0, 아래 배열 목록에 빠진 원문 배열0으로 계수했습니다.

연결은 `scripts/build-deployment.mjs`가 base-spec·기본 요구대장·28개 v0106~v0133 수정대장·정의 JSON을 주입하고 `src/spec.js`가 최종 `App.spec`와8개 명세 세부탭을 만드는 구조입니다. 전체 데이터가 실자료라는 뜻은 아니며 명세 대장/과거 요구와 실제 원장을 구별합니다.

읽기 전용 구성 진단에서는 실제 모드의 **빈 합성 상태**에 현재25개 선언 모듈과 기본134요구·28개 수정대장을 주입했습니다. boot/네트워크/DB/파일 쓰기/실제 저장·출력은 실행하지 않았습니다. 그 조사본의 구성 개수는 최상위64구역, 기능정의212개, 결정219개, 개발이력53개, 수용 시나리오193개, dataContracts65개, 대체 요구38개이며 실제 모드의 reportExample 계약은 제거됐습니다. 최소 모듈 진단과 전체 모듈 진단의 필드 개수는 다르므로 앞선 단독 진단 개수를 최종 구성으로 혼용하지 않습니다. 이 계수는 **누락 점검용이며 제품 검수 통과가 아닙니다**.

### 9.2 원문19구역 전체의 현행/과거/보류 판단

분류는 “승인된 목적”, “현재 로컬 연결”, “후속 요구로 대체된 과거 기준”, “서버/운영 미구현 또는 보류”, “실제 검수 필요”를 별도로 적습니다. 한 구역 안에 이 상태가 함께 있을 수 있습니다. 원문 배열을 삭제하거나 코드에 있다는 이유로 현재 모두 구현됐다고 판정하지 않습니다.

| 원문 구역 | 전체 내용·주요 배열 | 현행 승인/현재 연결 | 과거·보류·미검증 경계 |
|---|---|---|---|
| meta | 이름/버전/목적/사용자5/프로토타입 접근 가정 | 프로젝트 데이터·원가·보고 관리 목적 보존 | 원문0.9.4와 대표 전체권한 가정은 역사. 현재 직원 인증/권한 완료가 아님 |
| informationArchitecture | 원문9개 주 메뉴와 목적 | 실제 사이드바10메뉴·홈/첫탭·명시 연결·프로젝트 문맥을 기준 | 합성 명세 IA10개에 setup이 있고 spec은 빠짐. 개수 일치만으로 실제 메뉴 동일이라고 할 수 없음; 교정 담당에 전달 |
| designSystem | 글꼴3단계·색·간격·표 규칙 | 기존 토큰·계층 의미·34px 조회행/편집·오류 확장 보존 | 원문 전역 동일 높이·예전 배경/글자 규칙을 새로운 UI 변경 권한으로 사용하지 않음 |
| interactionRules | 더블클릭/키보드/단위/이력/삭제/차트/사유/이동/보고12개 | 같은셀·Enter/Escape·원 단위 저장·원복·보고 실제자료 경계 | 억원 기본조회·같은 대분류만 이동은 후속 백만원/확인 후 교차이동으로 대체. 키보드/행동은 최종 실제 검수 필요 |
| costRules | 용어8·계산식·계층·v080 임계값/사유 필드 | 현재 사업비/확정/계약/지급의 독립 의미·닫힌 회사 유형 보존 | v080 상승 전용/이전 임계값·10분류 세분화는 당시 계약. 현재 통제시점/상하변동·95유형/회사 관리행 정의 우선 |
| reportingRules | 공식서식2·기한·소유 화면5·출력·snapshot·법근거·경계 | 제1/2호 양식·기준값·과거본문·원천/수정/출력 분리 | 고정6+1쪽·일반관리화면만 편집은 현재 가변행/전체셀 편집과 구별. 전자신고·오늘 법령수집 아님 |
| dataDomains | 업무 원장·법령·알림10개 | 같은 프로젝트/기록·공유법인·과거 정의 소유관계 유지 | 삭제된 자금현황/계약집행 화면을 데이터 보존 명목으로 복원하지 않음 |
| acceptanceTests | 원문22개 시나리오 | 반례·원자료·실제 화면/출력의 독립 기대값 사용 | 이후 삭제/대체/추가된193시나리오와 실행 결과는 다름. 배열 보유가 검사 통과 아님 |
| history | 개념구상~v0.9.4의18기록 | 이후 추가된 이력도 해당 버전 근거로 보존 | 다른 시점 검수·현재 구현·새 배포를 서로 승격하지 않음 |
| feedback | 사용자 피드백52개 | 의도/문구/관리 목적의 원문 보존 | 상충하는 예전 UI·단위·img배경·자동추출 방향은 최신 직접 지시 우선 |
| reproduction | 기술·렌더순서12·보존10 | 반복 가능한 빌드·현재 기능/출력 보존 | 옛 CSS/저장키 자동이관·표준계약 탭·demo fallback은 실제 부트의 최신 계약으로 대체 |
| lawMonitoring | prototype/liveApi/source/storage/secret/entities4 | 고정 확인일·출처·기존 검토 이력 | 실시간 API·일일 Cron/수집·새 비밀값은 별도 후속. 수집 없음/변경0·실패를 구별 |
| costIncreaseContract | 방향2·atomicWrite4·폐기 alias | costChange와 같은 보존 목적, 중복 사건 생성 금지 | 상승 전용 이름을 별도 두 번 합산하지 않음. 서버 atomic 구현 완료가 아님 |
| dataContracts | 원문7개 법령/비용/알림 배열 | 최종 구성65개 계약을 소비자별로 아래 대조 | 필드가 있다고 DB 테이블/API/필수 폼이 이미 구현된 것은 아님 |
| prototypeBoundary | 법령/연동/secret/제외2 | 자동 법률판정·클라이언트 비밀 노출 금지 | “배포 제외”는 원문 시제품 경계. 현재 보호 검증 배포1건과 혼용하지 않음 |
| costChangeContract | 임계값/basis·방향2·atomicWrite4 | 비용/사유/이력/알림을 함께 성공·취소하는 목적 | 현재 로컬원복과 DB원자저장은 다른 구현. 시간·통제기준의 최신 정의 대조 필요 |
| backendBlueprint | stack7·테이블6군·역할7·RLS·Storage·법령 API·jobs·보고·감사24필드·동시성·멱등·복구·API·오류 | 앱 전용 데이터·최소권한·검증·실패원복·감사 목적을 계승 | Supabase Auth는 최신 폐기. 과거 테이블명/Edge/RPC/PITR·버킷/일일수집/업로드/업무조직 연결을 임의 구현하지 않음 |
| reportOverlayContract | 모드·예시3·매핑20·manifest28·상태12/4·반복·품질·transaction7·불변 | 실제 원천·안정 셀ID·반복행·표구조·동결·단일 출력대상 보존 | retiredReportOverlay로 보존한 img/좌표안·silent slice/별도 계속표 방향을 현행 흐름표로 복원하지 않음. 서버 제출/승인·Storage 상태는 미구현 |
| productionContracts | 역할7·편집분류3군·동시성·reorder·삭제·멱등·atomic·권한·API·Storage·오류·복구·접근성·규모 | 서버 개인인증/권한·감사 불변·충돌/중복 차단의 목적 승인 | 비밀번호/초대전용/공통 코드·sameParentOnly/교차422·업로드 API는 과거/보류. 역할명·노출·복구 수치는 결정 게이트 필요 |

### 9.3 플랫폼 내8개 명세 세부탭·내려받기 연결

| 명세 화면/행동 | 실제 원천 | 이번 대조 결과 |
|---|---|---|
| 개요 | meta·requirementLedger·최근 보존 수정대장·deploymentStatus·법령/비용 기준 | 버전0.11.0과 과거v33 수정4건 구별 필요. 보호 배포/홈·명세 확인과 CRUD/PDF/Excel 미검증은 별도 |
| 기능정의서 | spec.js의 features 배열·수정대장 acceptance | 시대별 동족 요구가 포함됨. 현재 override/supersession과 과거 조항을 구분해야 함 |
| SDD | featureContracts·productionContracts·migration·reportLayoutContract | 인증·DB·문서·보고·통제·현재/과거/향후를 경로별 대조. 서버 계약이 기존 구현이라는 뜻 아님 |
| TDD·검수 | verification·기본134대장·acceptanceTests·recovery | 정의/집중검사/과거 검수/최종 실제 수행을 분리. 한 고정 통과 숫자로 새 배포 완료를 만들지 않음 |
| 데이터 구조 | dataContracts 전체 | 아래65개 계약 전부를 목록화. 배열 필드 수와 실제 기록 수 구별 |
| 개발이력 | history와 현재auditEvents 최대100행 표시 | 과거 개발 이력과 현재 업무 감사행은 다른 원천. 감사 작성자는 현재 real에서 빈값이며 직원 서버 인증은 별도 구현 |
| 피드백 | feedback 원문52개와 decisions | 최신 정정→현재 명세/대장→과거 피드백 우선. 과거 명칭/단위/기능 복원 금지 |
| 전체 JSON | App.spec 전체 | current뿐 아니라 legacy/retired/원본 설계도 포함. 전체 JSON에 보존된 값 모두를 현행으로 해석하면 안 됨 |
| JSON 복사/명세 내려받기 | spec-copy→JSON.stringify(App.spec), core export-spec→App.spec | 화면과 같은 명세 객체. 명세 복사는 업무 데이터 export와 다름 |
| 전체 데이터 내려받기 | export-data→state와 현재 비용마스터 정의 | 실제 원장/과거 연결·미입력/0 보존 대상. Git 게시 또는 중앙DB 완료와 별개 |

### 9.4 필수 소비자별 현재 연결과 후속 인증/DB 요구

| 영역 | 조회/선택/입력 | 저장·취소·오류 | 합계/분석/출력 | 현행/과거/후속 판단 |
|---|---|---|---|---|
| 공통 메뉴/프로젝트 | core.go/tabContracts·boot·sidebar names | 첫 주메뉴/홈·명시 목적지·프로젝트변경 문맥·leaveDraft | 같은 사업으로 모든 업무·내려받기 연결 | 실제10메뉴가 현행. setup은 신규 등록 진입이고 독립 사이드바 아님. document/report의 옛 세부탭 키는 호환 경로이지 별도 현행 화면 아님 |
| DB·앱 인증 | 회사 이메일·6자리 확인코드/최초가입·재로그인·계정문맥 | 원문 OTP/공통코드·비밀번호 강제 없음, 실패 회원0·만료/시도/1회·재전송·세션/권한 | 사용자·프로젝트별 읽기/쓰기/확정/내려받기 서버권한 | 앱 비밀번호 저장 알림/UI 범위 확인·값 미열람 및 SMTP 연결 확인. 실제발송0·DB/앱 인증 미연동. Supabase Auth/기존계정/SMTP/키 미사용·세션/권한 게이트 미결 |
| 사업비·코드 | CBS95·37/58·본표/선택 제외·동일셀·이동/열폭 | currentByRecordId·historicalByStageId·기존ID/VAT/계약/확정 보호 | recordId 한 번·동일/독립 예산 구별·회사표1시트 | 과거145/146/152·10분류/34/45 초기·자유유형은 보존 정의/대체 정책. 코드를 새 비용행·금액 자동 생성으로 강제하지 않음 |
| 용도 프리셋 | costUsePresets 정의9개·preview·용도 정확매칭·공통37 | apply→costPresetAdapter.commitAtomic, 미리보기/취소 무변이·재적용 중복0·실패 fresh 문맥 | 같은유형 대상과 기존금액·후보 즉시 제외·Excel | 현재 master-v4/presets-v2. spec.v0131의v1 경로는 역사. 사업유형 문자열/인허가 추천과 다른 기능 |
| 계약·문서·VAT | 한 목록·날짜/경로·조건·변경차수·배부·기성/지급·회차 | 계약형식/합계/배부 validation·실제 대상 재확인·form callback의 공통transaction | 계약총액/실제지급/비용반영/VAT 귀속 독립·보고 원천 | 계약/지급 원장은 보존하되 폐지 자금현황/계약집행 UI와 업로드를 되살리지 않음. 원본 경로·복사는 파일 접근성 확인과 다름 |
| 인허가·등록 | 필수5날짜·두 경로·검토의견별조치·수동 등록상태·개인명단 | legal/permit 폼·조건부 숨김값·필수·초안/부모·일괄저장 | 보고flat·법인공유·현재/과거·원문명단 보존 | 결과0계획 저장·대상 자동판정·첨부 준비·연도별면적 패널은 후속 대체. 의견0 사업에 의견 생성 강제는 없음 |
| 보고서·저장본 | report-form의 안정셀/병합/반복행·전체셀 입력·buffer | reviewBufferedSave의 셀/owner/planBases 충돌→saveBufferedChanges의transaction; 보고서만 기본/연결값만 플랫폼 | preview/print/PDF/과거canonical·작성본 type/date/stage격리 | 플랫폼 합계·확정원본 불변과 보고서 표시내용 편집을 구별. 제목/합계/문구/동결 표시를 원장 역산에 연결하지 않음 |
| 저장 atomic/감사 | App.save·A.transaction·commitInline·executeFormCallback·각 원장 audit | localStorage revision/readback·전체상태 rollback·입력/초안 유지 | 비용/통제/보고/알림/내려받기 원천 일치 | 현재 로컬 transactional rollback은 있음. 중앙DB business/audit/notification 원자저장은 미연동이며 서버 실제 대사 필요 |
| 선택 Notion·최초 등록 | blank real·project-add·setup등록·선택 addon | 원본 의미/안정ID·수기유형/금액/명단·dirty/실패 보존 | 같은 실제사업·빈 상세/null·보고/Excel | 최초36/120은 시점 자료 이력. 고정수량/필수자료 빌드 실패는 대체. Runtime API/실시간 자동연동 아님 |
| 법령·협력사·시장 | 고정 공식원문/수기검토·출처버전/기간·내부관계 | 원천정보 갱신과 담당자 자료 분리·실패/0 구분 | 인허가·원가비교·보고 영향·기준일 | 원문에 있는법령 Cron/AI/Storage/provider 연동은 보류·별도 승인. 기존서비스 조사·실자료 자동 이관 없음 |

특히 보고서의 derived/immutable 분류는 **플랫폼 원본** 기준입니다. 보고서 화면의 전체 표시 셀을 편집할 수 있는 최신 계약을 막는 용도로 적용하지 않습니다. 마찬가지로 오래된 `sameParentOnly` 또는 `CROSS_PARENT_REORDER`를 서버에 그대로 복사하여 승인된 확인 후 분류이동을 차단해서는 안 됩니다. 권한/참조손상 차단과 정상 분류이동은 별도로 검사합니다.

### 9.5 최종 구성의 dataContracts65개 전체 목록

아래 “개수”는 배열 요소 또는 직접 객체 필드의 수이며 실행 상태의 업무 기록 개수가 아닙니다. 현재 명세 구성에서 생성된 모든65개 경로를 포함합니다. 필드 추가를 이유로 사용자 폼·업무분류·클라우드 테이블을 자동 추가하지 않습니다.

| dataContracts 경로 | 종류/개수 | 업무군 | 상태·경계 | 소비자 |
|---|---:|---|---|---|
| `lawCatalog` | array/7 | 법령 | 공식 고정원문/검토 이력 보존; 서버 일일수집은 보류 | legal·법령 화면/인허가/보고 |
| `lawUpdateRuns` | array/6 | 법령 | 공식 고정원문/검토 이력 보존; 서버 일일수집은 보류 | legal·법령 화면/인허가/보고 |
| `lawChanges` | array/6 | 법령 | 공식 고정원문/검토 이력 보존; 서버 일일수집은 보류 | legal·법령 화면/인허가/보고 |
| `projectLawImpacts` | array/6 | 법령 | 공식 고정원문/검토 이력 보존; 서버 일일수집은 보류 | legal·법령 화면/인허가/보고 |
| `costIncreaseEvents` | array/13 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `projectAlerts` | array/7 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costChangeEvents` | array/15 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costAreas` | object/5 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costSnapshots` | object/7 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `registrationNotices` | object/4 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `partnerDirectory` | object/5 | 협력사·시장 | 기준정보/내부관계 분리; 공개정보 최신 자동갱신 아님 | partners·협력사/시장/원가 비교 |
| `marketObservations` | object/4 | 협력사·시장 | 기준정보/내부관계 분리; 공개정보 최신 자동갱신 아님 | partners·협력사/시장/원가 비교 |
| `projectRegistration` | object/6 | 최초 등록·추출 검토 | 수기 등록/근거 검토; 실제AI·자동이관 미연동 | setup·최초 등록/후속 입력/문서 |
| `initialization` | array/4 | 최초 등록·추출 검토 | 수기 등록/근거 검토; 실제AI·자동이관 미연동 | setup·최초 등록/후속 입력/문서 |
| `cbs` | array/8 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costStages` | array/18 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `contracts` | array/7 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `areaHistory` | array/6 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `registration` | array/10 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `permits` | array/24 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `loanQuarterlyRecords` | array/7 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `companyRelations` | array/5 | 협력사·시장 | 기준정보/내부관계 분리; 공개정보 최신 자동갱신 아님 | partners·협력사/시장/원가 비교 |
| `marketSeries` | array/8 | 협력사·시장 | 기준정보/내부관계 분리; 공개정보 최신 자동갱신 아님 | partners·협력사/시장/원가 비교 |
| `auditEvents` | array/12 | 공통 | 로컬 원복/초안/문맥 현행; 서버 atomic·역할 미구현 | core·모든 업무 저장/취소/재진입/출력 |
| `reportSnapshots` | array/9 | 보고 | 전체셀/두 저장/과거본 보호 현행; 서버 확정/제출 미구현 | report-form/report·미리보기/저장/인쇄/PDF |
| `reportLayout` | array/17 | 보고 | 전체셀/두 저장/과거본 보호 현행; 서버 확정/제출 미구현 | report-form/report·미리보기/저장/인쇄/PDF |
| `areaVersions` | array/15 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `viewPreferences` | array/23 | 공통 | 로컬 원복/초안/문맥 현행; 서버 atomic·역할 미구현 | core·모든 업무 저장/취소/재진입/출력 |
| `contractPayments` | array/11 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `paymentCoverage` | array/7 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `reportReader` | array/10 | 보고 | 전체셀/두 저장/과거본 보호 현행; 서버 확정/제출 미구현 | report-form/report·미리보기/저장/인쇄/PDF |
| `managementItems` | array/25 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `milestones` | array/10 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `vatRecords` | array/23 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `vatReconciliations` | array/7 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `vatApplications` | array/11 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `vatLegacyAggregate` | array/6 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `fundPayments` | array/9 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `fundItemReviews` | array/6 | 계약·금융·VAT | 원장 보존·현행 관리; 폐지 자금화면 재생성 아님 | 계약/문서·금융·VAT·원가/보고 |
| `projectRegistrationDrafts` | array/6 | 최초 등록·추출 검토 | 수기 등록/근거 검토; 실제AI·자동이관 미연동 | setup·최초 등록/후속 입력/문서 |
| `registrationInput` | array/5 | 최초 등록·추출 검토 | 수기 등록/근거 검토; 실제AI·자동이관 미연동 | setup·최초 등록/후속 입력/문서 |
| `inputDataReviews` | array/10 | 최초 등록·추출 검토 | 수기 등록/근거 검토; 실제AI·자동이관 미연동 | setup·최초 등록/후속 입력/문서 |
| `displayGroups` | array/8 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `storageControl` | array/7 | 공통 | 로컬 원복/초안/문맥 현행; 서버 atomic·역할 미구현 | core·모든 업무 저장/취소/재진입/출력 |
| `reportSourceVersions` | array/8 | 보고 | 전체셀/두 저장/과거본 보호 현행; 서버 확정/제출 미구현 | report-form/report·미리보기/저장/인쇄/PDF |
| `lawCollectionRuns` | array/7 | 법령 | 공식 고정원문/검토 이력 보존; 서버 일일수집은 보류 | legal·법령 화면/인허가/보고 |
| `registrationApplication` | array/18 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `reportDraftOverrides` | array/11 | 보고 | 전체셀/두 저장/과거본 보호 현행; 서버 확정/제출 미구현 | report-form/report·미리보기/저장/인쇄/PDF |
| `lawSource` | array/7 | 법령 | 공식 고정원문/검토 이력 보존; 서버 일일수집은 보류 | legal·법령 화면/인허가/보고 |
| `reportEditBuffer` | array/7 | 보고 | 전체셀/두 저장/과거본 보호 현행; 서버 확정/제출 미구현 | report-form/report·미리보기/저장/인쇄/PDF |
| `registrationProfessionals` | array/7 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `permitResults` | array/4 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `costModelDisplay` | array/4 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `reportPlanRowOverrides` | object/7 | 보고 | 전체셀/두 저장/과거본 보호 현행; 서버 확정/제출 미구현 | report-form/report·미리보기/저장/인쇄/PDF |
| `formDraftContext` | string/1 | 공통 | 로컬 원복/초안/문맥 현행; 서버 atomic·역할 미구현 | core·모든 업무 저장/취소/재진입/출력 |
| `permitReviewLabels` | string/1 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `permitMinimumPlan` | string/1 | 인허가·등록 | 현재 수동 입력·조건/조치·명단; 숨긴 이전필드는 보존 | legal·인허가/일정/등록 팝업/보고 |
| `costResearchCoverage` | object/12 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costExcel` | object/10 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costDisplayOrder` | object/7 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costCompanyProfile` | object/12 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costDisplaySelection` | object/23 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costDirectEntry` | object/5 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `costCoding` | object/4 | 사업비 | 현행 로컬·기존/과거 정의 보존; 중앙저장 미연동 | CBS·본표/선택/편집/프리셋/분석/Excel/보고 |
| `authentication` | object/15 | 앱 인증 | 회사메일6자리 최신정책; 별도 인증 구현 대기 | 현재 명세 투영·후속 계정/서버권한 |

### 9.6 기본 원문145개 배열의 전체 경로·항목 개수

이 목록은 원본 배열의 누락 확인용입니다. backendBlueprint와 productionContracts의 유사 역할/권한 배열도 원문 위치가 다르면 각각 기록했습니다. **업무를 중복 구현하라는 뜻이 아닙니다.** 현재계약으로 대체되는 여부는9.2~9.4의 판단과 최신 직접 지시를 따릅니다.

| 기본 명세 원문 배열 경로 | 원문 항목 수 |
|---|---:|
| `meta.primaryUsers` | 5 |
| `informationArchitecture` | 9 |
| `designSystem.fontSizes` | 3 |
| `designSystem.spacing` | 4 |
| `interactionRules` | 12 |
| `costRules.terms` | 8 |
| `costRules.v080CostIncrease.requiredFields` | 5 |
| `costRules.v080CostIncrease.entities` | 2 |
| `reportingRules.forms` | 2 |
| `reportingRules.sourceTabs` | 5 |
| `reportingRules.prototypeBoundary.excluded` | 2 |
| `dataDomains` | 10 |
| `acceptanceTests` | 22 |
| `history` | 18 |
| `feedback` | 52 |
| `reproduction.renderOrder` | 12 |
| `reproduction.mustPreserve` | 10 |
| `lawMonitoring.entities` | 4 |
| `costIncreaseContract.directions` | 2 |
| `costIncreaseContract.atomicWrite` | 4 |
| `dataContracts.lawCatalog` | 7 |
| `dataContracts.lawUpdateRuns` | 6 |
| `dataContracts.lawChanges` | 6 |
| `dataContracts.projectLawImpacts` | 6 |
| `dataContracts.costIncreaseEvents` | 13 |
| `dataContracts.projectAlerts` | 7 |
| `dataContracts.costChangeEvents` | 15 |
| `prototypeBoundary.excluded` | 2 |
| `costChangeContract.directions` | 2 |
| `costChangeContract.atomicWrite` | 4 |
| `backendBlueprint.stack` | 7 |
| `backendBlueprint.tables.access` | 5 |
| `backendBlueprint.tables.cost` | 3 |
| `backendBlueprint.tables.documents` | 2 |
| `backendBlueprint.tables.law` | 9 |
| `backendBlueprint.tables.reports` | 6 |
| `backendBlueprint.tables.system` | 6 |
| `backendBlueprint.rls.requirements` | 5 |
| `backendBlueprint.storage.buckets` | 3 |
| `backendBlueprint.storage.metadata` | 10 |
| `backendBlueprint.storage.rules` | 7 |
| `backendBlueprint.jobs.terminalErrors` | 4 |
| `backendBlueprint.reportSnapshot.fields` | 6 |
| `backendBlueprint.reportSnapshot.flow` | 4 |
| `backendBlueprint.tests` | 9 |
| `backendBlueprint.auditContract.scope` | 16 |
| `backendBlueprint.auditContract.excluded` | 3 |
| `backendBlueprint.auditContract.fields` | 24 |
| `backendBlueprint.auditContract.verification` | 5 |
| `backendBlueprint.concurrency.columns` | 3 |
| `backendBlueprint.reorder.columns` | 3 |
| `backendBlueprint.idempotency.scope` | 3 |
| `backendBlueprint.idempotency.fields` | 4 |
| `backendBlueprint.softDelete.columns` | 6 |
| `backendBlueprint.backup.targets` | 3 |
| `backendBlueprint.roles.viewer` | 2 |
| `backendBlueprint.roles.costEditor` | 3 |
| `backendBlueprint.roles.costApprover` | 3 |
| `backendBlueprint.roles.reportPreparer` | 3 |
| `backendBlueprint.roles.reportApprover` | 2 |
| `backendBlueprint.roles.projectAdmin` | 4 |
| `backendBlueprint.roles.auditor` | 2 |
| `backendBlueprint.authorizationMatrix.projects.viewer` | 1 |
| `backendBlueprint.authorizationMatrix.projects.costEditor` | 1 |
| `backendBlueprint.authorizationMatrix.projects.costApprover` | 1 |
| `backendBlueprint.authorizationMatrix.projects.reportPreparer` | 1 |
| `backendBlueprint.authorizationMatrix.projects.reportApprover` | 1 |
| `backendBlueprint.authorizationMatrix.projects.projectAdmin` | 3 |
| `backendBlueprint.authorizationMatrix.projects.auditor` | 1 |
| `backendBlueprint.authorizationMatrix.costItems.viewer` | 1 |
| `backendBlueprint.authorizationMatrix.costItems.costEditor` | 2 |
| `backendBlueprint.authorizationMatrix.costItems.costApprover` | 3 |
| `backendBlueprint.authorizationMatrix.costItems.projectAdmin` | 5 |
| `backendBlueprint.authorizationMatrix.costItems.auditor` | 1 |
| `backendBlueprint.authorizationMatrix.reportSnapshots.viewer` | 1 |
| `backendBlueprint.authorizationMatrix.reportSnapshots.reportPreparer` | 3 |
| `backendBlueprint.authorizationMatrix.reportSnapshots.reportApprover` | 2 |
| `backendBlueprint.authorizationMatrix.reportSnapshots.auditor` | 1 |
| `backendBlueprint.authorizationMatrix.auditEvents.auditor` | 1 |
| `backendBlueprint.authorizationMatrix.auditEvents.projectAdmin` | 1 |
| `backendBlueprint.authorizationMatrix.auditEvents.server` | 1 |
| `backendBlueprint.authorizationMatrix.storageObjects.viewer` | 1 |
| `backendBlueprint.authorizationMatrix.storageObjects.costEditor` | 1 |
| `backendBlueprint.authorizationMatrix.storageObjects.reportPreparer` | 1 |
| `backendBlueprint.authorizationMatrix.storageObjects.reportApprover` | 2 |
| `backendBlueprint.authorizationMatrix.storageObjects.server` | 1 |
| `backendBlueprint.apiContracts.commonRequest` | 3 |
| `backendBlueprint.apiContracts.commonResponse` | 3 |
| `backendBlueprint.errorModel` | 9 |
| `reportOverlayContract.sampleWorkbooks` | 3 |
| `reportOverlayContract.mappingFields` | 20 |
| `reportOverlayContract.fieldManifest` | 28 |
| `reportOverlayContract.snapshotStates` | 12 |
| `reportOverlayContract.fieldReviewStates` | 4 |
| `reportOverlayContract.qualityGate.geometry` | 6 |
| `reportOverlayContract.qualityGate.reconciliation` | 4 |
| `reportOverlayContract.snapshotTransaction.states` | 7 |
| `productionContracts.roles.viewer` | 2 |
| `productionContracts.roles.costEditor` | 3 |
| `productionContracts.roles.costApprover` | 3 |
| `productionContracts.roles.reportPreparer` | 3 |
| `productionContracts.roles.reportApprover` | 2 |
| `productionContracts.roles.projectAdmin` | 4 |
| `productionContracts.roles.auditor` | 2 |
| `productionContracts.editableFields.immutable` | 3 |
| `productionContracts.editableFields.derived` | 6 |
| `productionContracts.editableFields.editable` | 6 |
| `productionContracts.concurrency.columns` | 3 |
| `productionContracts.reorder.columns` | 3 |
| `productionContracts.softDelete.columns` | 6 |
| `productionContracts.idempotency.scope` | 3 |
| `productionContracts.idempotency.fields` | 4 |
| `productionContracts.authorizationMatrix.projects.viewer` | 1 |
| `productionContracts.authorizationMatrix.projects.costEditor` | 1 |
| `productionContracts.authorizationMatrix.projects.costApprover` | 1 |
| `productionContracts.authorizationMatrix.projects.reportPreparer` | 1 |
| `productionContracts.authorizationMatrix.projects.reportApprover` | 1 |
| `productionContracts.authorizationMatrix.projects.projectAdmin` | 3 |
| `productionContracts.authorizationMatrix.projects.auditor` | 1 |
| `productionContracts.authorizationMatrix.costItems.viewer` | 1 |
| `productionContracts.authorizationMatrix.costItems.costEditor` | 2 |
| `productionContracts.authorizationMatrix.costItems.costApprover` | 3 |
| `productionContracts.authorizationMatrix.costItems.projectAdmin` | 5 |
| `productionContracts.authorizationMatrix.costItems.auditor` | 1 |
| `productionContracts.authorizationMatrix.reportSnapshots.viewer` | 1 |
| `productionContracts.authorizationMatrix.reportSnapshots.reportPreparer` | 3 |
| `productionContracts.authorizationMatrix.reportSnapshots.reportApprover` | 2 |
| `productionContracts.authorizationMatrix.reportSnapshots.auditor` | 1 |
| `productionContracts.authorizationMatrix.auditEvents.auditor` | 1 |
| `productionContracts.authorizationMatrix.auditEvents.projectAdmin` | 1 |
| `productionContracts.authorizationMatrix.auditEvents.server` | 1 |
| `productionContracts.authorizationMatrix.storageObjects.viewer` | 1 |
| `productionContracts.authorizationMatrix.storageObjects.costEditor` | 1 |
| `productionContracts.authorizationMatrix.storageObjects.reportPreparer` | 1 |
| `productionContracts.authorizationMatrix.storageObjects.reportApprover` | 2 |
| `productionContracts.authorizationMatrix.storageObjects.server` | 1 |
| `productionContracts.apiContracts.commonRequest` | 3 |
| `productionContracts.apiContracts.commonResponse` | 3 |
| `productionContracts.storage.metadata` | 10 |
| `productionContracts.storage.rules` | 7 |
| `productionContracts.errorModel` | 9 |
| `productionContracts.backup.targets` | 3 |
| `productionContracts.accessibility.requirements` | 6 |
| `productionContracts.scale.targets` | 3 |
| `productionContracts.scale.rules` | 4 |

### 9.7 실제 연결 조사본의 소비자 지문

아래는 읽기 전용 구성 진단에 사용한 조사본 지문입니다. 현재 제품 실행·최종 배포 지문을 대신하지 않습니다. 구현자가 이후 수정한 파일은 새 지문·집중검사·실제 검수로 다시 연결해야 합니다.

| 소비자 | 바이트 | SHA-256 |
|---|---:|---|
| `src/core.js` | 70,315 | `5952E53955D94A5F70F42ABF9A950B7B19D68F9BD68929442F292CA01088B935` |
| `src/cbs.js` | 240,678 | `CBA0F2B9F0ED655C41EF5BEBEE3DE8D9C624BCC365C4F5E5505F68200D9B9D6A` |
| `src/contracts.js` | 99,957 | `A6E1A743A7A621F4B9912837D7D2CD39E2E3DA8BCE58FF6BA8F8CA0B24C76038` |
| `src/legal.js` | 155,418 | `01AB26741F584EE6F19227914021D7BED848F8CA272465F2BA7273D93A29F3EC` |
| `src/setup.js` | 23,794 | `6121335A2C83069B2A6F3827FF4ABB261C499ED0DF9252036DBAF13083EEF774` |
| `src/report-form.js` | 68,032 | `0F1F1FEE5549971509C37F4F3EB8734FEECF65C684AD8A87C031BA2446B9F205` |
| `src/report.js` | 106,704 | `7F5A513DA4E41274AAF3309E5BA2E59294569FE7CE11C07DAF837614FCD80FB1` |
| `src/cost-asset-presets.js` | 10,087 | `4B97C3900BC44C4206C2D490E4934FCDEF3BA74AE818EED72347814CBE848F53` |
| `src/spec.js` | 159,144 | `18F0AEA8DF897AC255BA2E2B97C0ED1718C4E6577FA6BDAB2BBB20404FE18EFF` |

### 9.8 검토 결과와 남은 단계

- 원문/배열/필드 읽기·계수·현행/역사/보류 분류는 이번 검토 범위에서 완료했습니다. “기능 구현 완료”, “중앙DB/Auth 완료”, “실제 화면/출력 완료”는 아닙니다.
- 명세 현재 투영의 인증/배포 문구와 IA·호환 경로·기능 버전의 혼재를 프런트엔드 담당에게 전달했습니다. 그 담당자가 작성하는 현재 상태 JSON/명세 투영/집중검사의 최종 지문과 실제 UI는 이후 연결합니다.
- 최신 회사메일6자리 확인과 공통 코드/Supabase Auth 폐기가 최우선입니다. 사용자에게 요청되지 않은 비밀번호·M365·공개 외부가입·기존 Auth/SMTP/키 재사용을 추가하지 않습니다. 회사메일 확인 가입과 비회사/무제한 가입 차단은 구별합니다.
- 기존 원본·base-spec·history/feedback/retired/legacy 배열과 실제 기록을 삭제하지 않았습니다. PM은 이 문서만 수정했고 제품 코드·클라우드·완료 체크·Excel은 변경하지 않았습니다.

## 현재 실행 상태 — 2026-10-16

실제 회사메일 발송·사용자 수신·본인 번호확인·최초가입/로그인세션·관리자·원격 중앙저장을 확인했습니다. 사용자 승인에 따라 기존 HTML의 예시3사업을 A·B·C로 등록했고 `/api/workspace` 재조회와 독립DB에서 revision2/3사업을 확인했습니다. 각 사업의 원금액·코드·확정시점·계약·인허가·보고 본문은 동결 수입본 전체 지문과 일치합니다. 세부 수용기준은 `docs/test-projects-20261016-spec.md`의 TESTABC-01~05입니다.

승인 Preview 검수용 상시 접근만 추가했고 Vercel 전체 보호·앱 인증을 유지했습니다. 실제 사용자 브라우저에 쿠키를 설치한 것이 아니며 현재 자동제어 시작 오류로 이번 원격 화면/출력은 미검증입니다. 직원의 Vercel 없는 진입·다중사용자 권한·앱 영역 백업/복구·전체 업무/출력 수용은 별도로 남습니다. 아래 2026-10-15/16의 미발송·미가입·비게시·승인대기는 각 당시 이력입니다.

## 10. 이전 단계: 계약 구현·DB stage1·격리 합성 검수

기준일: 2026-10-15. 이 절은 원문 전수검토가 아니라 그 뒤의 실제 진척 갱신입니다. **기존 v0.11.0 공유 검증본은 유지하며, 새 v0.11.1 클라우드 후보는 미게시입니다.** 아래 수행 범위를 구별하고 신규 PROD111-01~12는 모두 미완료로 유지합니다. 운영 완료·실제 가입/로그인·실제 중앙저장 통과를 주장하지 않습니다.

### 10.1 수행·차단·미검증 구분

| 구분 | 수행/확인한 범위 | 아직 확인하지 않은 것 |
|---|---|---|
| 전용 DB stage1 | migration `20261015035338` 적용, 앱 전용10테이블·전부RLS, 새 runtime 역할NOLOGIN | 실제 runtime PostgreSQL LOGIN·새 앱 자격정보 연결·역할로 직접 실행한 허용/거부 |
| 기존 서비스 보존 | 보호 대상49relations/40routines·977개 metadata의 전후 지문 `c13ac4be971e1d34199828c161b82f8f` 동일. 기존61개 이력 변경0, 실업무행 조회/변경0, 기존 Auth/SMTP 설정 변경0 | 공유 서버의 모든 잠재 영향을 없앴다는 보장 또는 다른 서비스 업무행 전수검사 아님 |
| DB 소유자 합성 SQL | postgres 역할의7개 smoke: 정수시각·이메일/중복/FK·감사 실패 원복·분리 복구 사본. 합성행 모두 rollback | runtime 역할의 앱 연결/권한·OTP·실제 사용자 저장 검수 아님 |
| 서버/프런트 계약 | 아래 API·단일 이메일 확인·응답 확인 뒤 저장 종료/원복·계정격리 코드 구현 | 실제 메일/DB와 묶인 통합 동작·배포 후 앱 인증 |
| 최종 자동 합성 | QA9군94/94, 생성 HTML 합성HTTP2/2, 최종 실행 중 소스 불변·근거14지문 대사 일치 | 실제 메일·실DB·runtime 계정 연결 또는 전체 요구의 실사용 수용 검수 아님 |
| 기존 기능 보존 검사 | 추가6군206/206·수행 중 제품소스 불변. 순수모델/DOM stub/정적·합성 범위 | 해당 검사군에서 실제 브라우저·클라우드·메일·DB를 실행한 것이 아님 |
| 실제 브라우저·합성HTTP | 루프백 CUA7항목: 이메일/코드 흐름, 사이드바 이메일·로그아웃, 같은셀 합성123456789원 저장, 다음503에서 입력/오류 유지·취소, 재로드홈, 로그아웃 뒤 숨은DOM/이전자료 제거, 3해상도 이메일 gate | 실제 OTP발송/수신·실계정·실DB·배포 E2E·PDF/XLSX 검수 아님. 사업등록은 이전 반복검사로만 보존 |
| 기존 공개 범위 | 기존 보호 검증 배포와 메일전송 없는 SMTP connection verified 유지 | 새 후보 게시·PG LOGIN·실제 OTP와 앱 계정 활성화·운영 승격 |

stage1 근거는 `outputs/deployment/cloud-v0111-20261015/private-schema-preparation.json`(SHA `A31448DDF24049867FCB9D19808242217A1B62B568EF85D4D9F50A93131A37EA`)입니다. 앱 역할의 기존 객체 접근권한0은 카탈로그/스키마 권한 확인입니다. `SET ROLE` 실행 시 postgres가 새 runtime 역할의 멤버가 아니어서42501로 준비 차단됐으므로, 실제 runtime 역할의 모든 관계 접근거부를 실행 확인한 것으로 쓰지 않습니다. 검사 편의로 기존 역할 membership을 확장하지 않았고 적용 SQL/이력을 재작성하지 않습니다.

### 10.2 확정된 현재 QA 근거와 파일 동일성

- QA current proof: `.build/deployment-20261015/qa/cloud-auth-storage-current.json`, SHA `4E47BF72954009F726F389CAB63AD8ED820718B4D9000E9DDCA7CCA6811A18DC`. QA 리더가 동결을 확인했으며 PM이 원문·실제14개 파일 지문(차이0)을 독립 대조했습니다. 이전86/86은 당시 기록으로 보존하며 현재94에 더하지 않습니다.
- QA 자동 합성9군은 auth17/runtime8/schema8/storage22/storage-runtime7/session14/session-independent2/report-notion6/notion-source10입니다. 생성HTML2와 CUA7, DB소유자 SQL7은 다른 종류의 근거이므로 하나의 제품 통과 숫자로 합치지 않습니다.
- 추가 기존 기능 보존 proof는 `.build/deployment-20261015/qa/legacy-preservation-current.json`, SHA `45AC4330CB064CC984D4B5A8470F882B67ECA98148A080AFA59F7901B92A5560`입니다. 6군206/206은 순수모델/DOM stub/정적·합성 범위이며 제품 소스 불변을 기록합니다. 실제 브라우저/클라우드 검수와 별도로 유지하고94/2/7에 임의 합산하지 않습니다. 관리UI의 전용테이블10개 새로고침 확인도 runtime LOGIN/업무저장 완료가 아닙니다.
- cloud 후보 HTML: `87B12C81BDB0B13E14B4121167935CA548EBEB3BD83813E0020C372D7929B285`, 8,144,500바이트. loopback QA HTML: `85C45B0521DAE3D6478964B0BD12BA3802040E2ABE6AB9883E261922BED3CF58`, 8,144,419바이트. 차이는 loopback용 cloudOrigin 제거뿐이며 `VERCEL=1`에서는 local-qa 빌드를 금지합니다. 두 파일을 동일 지문이라고 쓰지 않습니다.
- 루트 실제 브라우저 근거: `outputs/deployment/cloud-v0111-20261015/isolated-browser-verification.json`, SHA `D3291E26AAFD22CA85D18324AE3CDBABCA1FA5B74C5F0F2812B107FC0675E587`. 실제 브라우저이지만 API는 격리 합성HTTP입니다. 사업등록/필수면적 검사는 개인정보 초기화 최종 교정 전 `earlierIterationOnly`이며 최종 후보 사업등록 통과로 다시 세지 않습니다.
- 중간 의미 결함2개(기존 review를 일반 v4 confirmed로 승격하는 우회, 존재하지 않는 부모를 둔 split-inherit)는 실패검사 후 수정·회귀 통과했습니다. 실패 시점 `AACD329E…42F2EEB`와 최종 `server/cloud-storage.mjs`의 `A9749B06728134DDF7F8209CCB091F8B61E196A95DA4AD9A7461148C5A216925`를 구별합니다. 과거 검토코드/상태·원문·확정본을 정상코드로 자동 승격하지 않는 경계를 유지합니다.

### 10.3 현재 구현 API 계약 — 실제 서비스 연결 전 후보

원천은 `server/email-auth.mjs`, `email-auth-runtime.mjs`, `cloud-storage.mjs`, `workspace-runtime.mjs`, `gmail-code-sender.mjs`와 `api/*.js`의 실제 wrapper입니다. Better Auth1.7.8을 앱 전용 schema에 연결한 **별도 앱 인증**이며 Supabase Auth/기존 조직 인증을 사용하는 것이 아닙니다. 라이브러리 보유·소스 구현과 실제 계정 활성화를 구별합니다.

| 경로·메서드 | 요청 계약 | 성공 응답·소비자 | 실패·보존 경계 |
|---|---|---|---|
| POST /api/auth-code | JSON `email`만. 서버에서 정확 @igisam.com 검사 | 202 `{sent:true}`: 제공자의 접수 성공, 수신함 도착 확인은 별도 | 다른 필드/도메인400, Origin403, 크기413/형식415, 제한429, 설정/DB/발송 실패503. 회원·세션 성공 생성0 |
| POST /api/auth-verify | JSON `email,code`; code는 문자열6자리, signup/login 선택 필드 없음 | `authenticated,email,userId,newAccountCreated,expiresAt`. 첫 정상확인이면 계정 생성/true, 이후 같은 계정 로그인/false | 틀림/만료/재전송전/이미사용/제한·동시검증·DB 실패를 거부. 이름/사진/비밀번호 요구 없음. 서버 COMMIT 전 성공 응답 금지 |
| GET /api/session | 현재 앱의 쿠키/세션 | 미인증이면 authenticated:false, 유효하면 확인된 회사 이메일/사용자/만료 | 설정/DB 미연결503와 실제 미인증을 구분. Vercel 보호 계정을 앱 계정으로 자동 사용하지 않음 |
| DELETE /api/session | 현재 앱 세션, 같은 Origin | 서버 종료 후 authenticated:false | 실패하면 로그아웃 성공을 가장하지 않음. 성공/401 만료 시 이전 계정 상태·휘발성 보고버퍼·숨은DOM 제거, 사용자별 지속 초안은 격리 보존 |
| GET /api/workspace | 서버 세션·유효한 멤버십 | workspaceId/revision/state/capabilities/projectRoles/user. 허용 프로젝트/법인/연관자료만 | 미인증401·권한403·DB/설정503. 빈 권한을 전체사업 권한으로 채우지 않음 |
| PUT /api/workspace | workspaceId/baseRevision/requestId/state만 | 서버가 확인한 revision/requestId/필터된 state를 받은 뒤 UI 성공 종료 | 버전충돌409, 같은 요청ID+다른내용409, 형식/과거값/코드400, 크기413, 권한403, 연결503. 업무/감사/요청결과를 함께 저장/원복 |
| GET/PUT/DELETE /api/project-access | GET projectId; 변경은 workspaceId/baseRevision/requestId/projectId/email 및 PUT role | 서버 관리자만 확인된 앱 가입자에게 프로젝트 권한 부여/회수. 변경과 감사/요청결과 일괄 저장 | 미인증/비관리자·다른 프로젝트·미가입 대상·오래된 버전·재시도 검증. 임의 클라이언트 역할 신뢰 금지 |
| GET /api/notion-source | 현재 세션 및 서버 관리자 확인 | 설정된 선택 snapshot만, 없으면 available:false | 회사업무의 필수 배포입력 아님. 실제 Notion Runtime API/자동 동기화 아님. 원문/계정 승격·수기값 덮기 금지 |

현재 구현값은 코드길이6, 유효기간300초, 허용시도5, 재발송간격60초, 세션28,800초 등입니다. 이는 합성검사한 **현재 코드의 구현 기본값**이지 사용자가 질문의 기본 선택지나 운영 정책으로 선택한 값이 아닙니다. 운영 승인과 실제 환경에서의 제한/만료/회수 검수는 별도입니다. OTP는 HMAC-SHA256 검증값으로 저장하고 원문/세션 비밀·일반 Gmail 비밀번호를 문서/로그/클라이언트 지속 저장에 넣지 않습니다.

프로젝트 role의 viewer/editor/approver, admin 전용 생성/권한관리, `DP_INITIAL_ADMIN_EMAIL`에 의한 bootstrap 경로는 현재 구현 계약입니다. 2026-10-16 최초 관리자 대상을 사용자 본인 회사이메일로 승인받았지만 실제 설정·인증·권한부여 완료는 아직 확인되지 않았습니다. 해당 주소는 서버 전용으로만 다루고 문서/소스/public config/Git에 기재하지 않습니다. 첫가입자 자동admin이나 질문 기본값 채택과 구별합니다.

### 10.4 프런트 저장·실패·계정격리 계약

`src/cloud-session.js`의 한 이메일 확인 화면은 발송→6자리 확인→서버 계정 생성/재로그인→작업공간 GET을 잇습니다. `newAccountCreated`와 서버 사용자ID·이메일·capabilities/projectRoles를 확인한 뒤 기존 플랫폼으로 들어갑니다. 등록/로그인 탭이나 이름/사진 입력을 추가하지 않습니다.

`src/core.js`의 cloud mode는 기존 로컬 실제 저장키를 대신 읽거나 업로드하지 않습니다. 같은셀/일반폼/초안의 성공 닫기·토스트·화면 전환은 서버의 requestId/revision/state 확인 이후로 미룹니다. 503/403/409는 값·초안·UI/스크롤을 되돌리고 실제 저장 성공으로 표시하지 않습니다. 로그아웃·401·사용자 전환은 이전 상태·선택프로젝트·권한·휘발성 버퍼·dialog/report-output을 초기화하며 사용자별 저장문맥을 섞지 않습니다.

위 계약의 현재 실제 화면 근거는 **합성HTTP**의 같은셀123456789원, 다음503에서123456790원 입력 유지/취소 원복, 재로드홈·로그아웃 숨은DOM0과 gate3해상도뿐입니다. 실제 회사사업 금액·실제 메일·runtime DB·모든 폼/보고/출력을 확인한 것으로 쓰지 않습니다.

### 10.5 전날 미응답3건의 2026-10-16 답변과 다음 단계

| 이전 확인요청 | 오늘 답변·승인 | 실행/검수 경계 |
|---|---|---|
| 수신할 회사 이메일 | 사용자 본인 회사이메일로 확정 | 실제 발송/수신/6자리 확인 대기. 개인주소는 문서에 기재하지 않음 |
| 최초 관리자 대상 | 같은 사용자 본인 회사이메일로 확정 | 서버 설정·본인확인 후 부여/재로그인 검수 대기. 전직원admin/전체사업 공개 아님 |
| 새 앱 전용 Secret 저장 | 전용DB 접속/별도 앱 로그인 Secret을 Vercel 검증환경에 저장하도록 승인 | 저장·runtime LOGIN·실PG 연결은 실행 확인 전. 기존 서비스 자격/Auth/DB 사용 승인 아님 |

이전 질문은 답변을 받았으며 이제 승인된 범위의 서버 설정·runtime LOGIN/실PG·실제메일/6자리·가입/재로그인·관리자/사업별 권한·중앙저장/충돌/복구·최종출력을 검수합니다. 승인을 실행 완료로 바꾸지 않습니다. 새12개 미체크·총381/체크332/미체크49와 원369본문/체크·과거proof는 보존합니다. 직원 진입장벽 전환은11절을 따릅니다.

## 11. 2026-10-16 직접 승인과 직원 진입장벽 전환 수용기준

오늘 사용자는 실제 수신/최초관리자를 **사용자 본인 회사이메일**로 정하고 새 앱 전용 DB접속·로그인 Secrets의 Vercel 검증환경 저장을 승인했습니다. 개인주소와 비밀값은 명세·소스·공개설정·Git에 쓰지 않고 서버 전용으로만 다룹니다. 이 승인은 아직 설정/메일/가입/DB 검수의 실행 완료가 아닙니다.

추가 목표는 **Vercel 본인계정 장벽 없이 직원 누구나 @igisam.com 메일6자리 확인으로 가입/로그인**하는 것입니다. 별도 초대·공통코드·비밀번호·이름/사진 수집을 강제하지 않습니다. 사업별 서버권한은 그대로이며 전원 사업자료 공개 승인이 아닙니다. 새 번호를 만들지 않고 PROD111-02/04/11의 수용기준으로 연결합니다.

1. 루트가 다음 앱 인증 배포에서 실제메일/확인·가입/재로그인·서버세션·최소권한·미권한 원장/API 차단을 검증합니다. 기존 보호는 이 전환 전 임시 보존조건이지 목표 정책이 아닙니다.
2. 이 앱의 Vercel 보호설정 전환이 과거 배포URL에도 영향을 준다는 범위를 확인하고, 이전 URL/정적자산/API에 원장·snapshot·비밀이 노출되지 않는지 점검합니다. 다른 회사 서비스의 보호·DB/Auth는 변경하지 않습니다.
3. 위 검증 뒤 루트가 정확한 대상 프로젝트·설정·과거URL 영향과 시점을 설명하고 액션 시점 승인을 확인합니다. 현재 문서 변경은 보호해제 실행이 아닙니다.
4. 전환 후 Vercel 계정·쿠키·우회링크가 없는 새 브라우저에서 이메일 확인 화면 진입→직원 회사메일6자리→최초가입/다음로그인→권한 있는 업무만 조회/수정/출력을 확인합니다. 비회사 주소·미인증·미부여사업·다른역할·만료/회수·OTP오류는 서버가 차단해야 합니다.
5. Vercel302가 사라졌다는 사실만 통과로 보지 않습니다. 무인증 업무자료/API·과거URL의 자료/비밀 노출0, 이름/사진 수집0과 기존 기록/금액/확정본 보존을 확인합니다. 위험/실패가 있으면 전환하지 않고 원인/범위를 보고합니다.

오늘 바뀐 것은 승인 상태와 수용기준이며 제품 검수는 아직 미완료입니다. 이전 2026-10-15 stage1/94·2·7/206 근거와 기존369개 원문/체크를 보존하고 오늘 조건의 실행 증거는 별도로 연결합니다.

### 11.1 오늘 승인과 별개의 작업환경 연결 차단

세 가지 업무 승인은 확정됐으나 현재 도구 연결은 별도로 차단됐습니다. Supabase의 SELECT 요청은 -32600 permission 오류이며 프로젝트 목록에는 승인된 회사 대상이 보이지 않습니다. 무관한 프로젝트로 우회하지 않습니다. Vercel의 정확한 대상/팀 조회는403이고 기존 CLI 인증은 없어 자동 로그인 시작을 즉시 중단했습니다. 새 OAuth 승인은 받지 않았습니다. CUA는 getState와 reset1회 후 재시도도 MXC 프로세스 시작 실패였습니다. 이는 실제 DB/Auth/UI 결함 재현이 아니라 현재 연결/검사 준비 차단입니다.

루트가 올바른 회사 플러그인 연결과 앱 재시작을 요청한 상태입니다. 접속 회복 후 승인된 회사 대상과 환경을 다시 확인하고 필요한 액션을 진행합니다. 오늘 추가 실행은 새Secrets 저장·runtime LOGIN·관리자 부여·보호변경·실메일·추가배포 모두0입니다. 승인이 취소/미응답인 것으로 되돌리지 않으며, 이전 stage1/합성/실제브라우저 proof를 오늘 제품 결함으로 바꾸지 않습니다.

재연결 수용기준은 승인 대상 조회 가능→환경/범위 확인→새 전용 설정/연결→앱 인증 검증→과거URL 영향/액션 시점 승인→직원 공개진입 검수입니다. 이전 Vercel302는 외부 보호 장벽의 응답이지 앱401/400·직원메일 인증 성공의 근거가 아닙니다. 다른 서비스 보호·DB/Auth는 변경하지 않습니다.

오늘 연결근거는 `outputs/deployment/cloud-v0111-20261016/connection-status.json`, 전환 전 합성QA는 `.build/deployment-20261016/qa/pre-protection-transition.json`(SHA `0C172FAB97316CE44602815C1217F1459D277FE3F02014DB6DC5EAF23D222B63`)입니다. 연결 복구 응답은 아직 없고 원격 추가변경0입니다. 실제 공유 runtime은0.11.0, 새 후보는0.11.1·미게시로 구분합니다. 오늘 Excel은 `outputs/deployment/cloud-v0111-20261016/개발사업관리플랫폼_요구사항_체크리스트_v0.11.0.xlsx`로 루트가 동기화할 예정이며 이전10/15 파일·proof는 보존합니다.


