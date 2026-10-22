# 구조와 데이터 흐름

이 문서는 구현 진입점을 설명합니다. 모든 기능의 검수 완료를 뜻하지 않으며 게시본/미배포 상태는 [현재 작업](CURRENT-WORK.md)을 확인합니다.

## 화면과 빌드

별도 React/Next 앱이 아니라, 업무별 `(function(A){ … })(App)` 모듈을 순서대로 결합해 HTML을 만드는 구조입니다.

| 구간 | 실제 파일·역할 |
| --- | --- |
| 화면 공통 | `src/core.js`: state, 화면/action 등록, 같은 셀 편집, 모달·복귀, 저장 거래 |
| 등록 방식 | `A.register(view, renderer)`, `A.on(action, handler)`. 버튼의 `data-action`과 실제 등록을 대조 |
| 업무 모듈 | `src/cbs.js`, `cost-*.js`, `contracts.js`, `legal.js`, `permit-*.js`, `report*.js`, `partners.js`, `notifications.js` 등 |
| 중앙 초기화 | `src/cloud-session.js`: 서버 권한/자료를 받은 뒤 화면 공개. 비밀번호·업무자료 로컬 캐시로 우회하지 않음 |
| 배포 빌드 | `scripts/build-vercel.mjs` → `scripts/build-deployment.mjs` → 승인 HTML/서버 파일·정적 자원 |
| 공유 인허가 규칙 | `shared/permit-domain.mjs`: 서버 ESM 사용 + `scripts/permit-domain-bundle.mjs`가 화면에 주입 |

모듈의 실제 순서는 빌더의 `modules` 배열이 기준입니다. 새 모듈/CSS 파일, 브라우저용 공유 규칙, VM 검사 연결이 모두 필요합니다. 이름만 같은 옛 검수 파일을 실행해 현재 모듈이 검증됐다고 판단하지 않습니다.

## API와 저장

일반 화면 흐름은 `브라우저 → /api/* → 인증·권한 → 업무 검증 → 전용 스키마 → 응답 확인 → 화면`입니다.

| API 흐름 | 주요 구현 |
| --- | --- |
| 최초 인증·로그인 | `api/auth-code.js`, `auth-verify.js`, `auth-login.js`, `session.js` → `server/email-auth*.mjs` |
| 사업 자료 조회/저장 | `api/workspace.js` → `server/workspace-runtime.mjs` → `server/cloud-storage.mjs` |
| 사업 접근 관리 | `api/project-access.js` → 동일 런타임의 권한 검사 |
| 개인 알림·시점 기록·기준자료 | `api/notifications.js`, `cost-snapshots.js`, `reference-data.js` → `server/center-services.mjs` |
| 법령 검색·상세·확인목록·지역 | 별도 함수 파일을 늘리지 않고 `vercel.json` rewrite → `api/law.js` → `server/law-router.mjs` → 업무 처리 |
| 직원 댓글 | `/api/partner-comments` rewrite → `api/reference-data.js` → `server/reference-router.mjs` / `partner-comments.mjs` |
| 예약 수집 | `api/maintenance.js` → `server/maintenance-runtime.mjs`. 예약 인증·시작점·성공/부분실패·복구 보존 |

실제 API 파일과 rewrite를 확인한 뒤 수정합니다. 별칭마다 서버 함수를 새로 만드는 방식은 배포 구성과 함수 수를 바꿀 수 있습니다.

중앙 저장은 `revision`/요청 식별자를 이용한 충돌검사와 감사기록을 같은 거래로 처리합니다. 실패 때 일부 자료만 저장하거나 오래된 화면으로 다른 사업을 덮어쓰지 않습니다. 일반 직원이 저장한 JSON이 공용 기준정보·다른 사람 알림·과거 보관본을 삭제할 권한을 갖지 않습니다.

## 자료별 소유 경계

| 자료 | 소유·처리 기준 |
| --- | --- |
| 사업별 원장 | 해당 사업 권한. 원금액·계약/VAT·확정본·이력 보존 |
| 공통 법인정보 | 연결 사업에 미치는 영향 확인. 보고서 역반영에서 무조건 쓰지 않음 |
| A/B/C | 가상 샘플. 승인된 고정 ID/배치 표식으로 구별하며 이름만 보고 실제 사업을 공개하지 않음 |
| 노션 | 실제 사업의 보충 원천. 기존 기능/샘플 배포를 다른 제품으로 대체하지 않음 |
| 업체·법령 기준자료 | 인증된 별도 읽기 경로. 탭/상세 진입 시 조회하고 로그인 HTML에 직원글·전문을 내장하지 않음 |
| 개인 알림 | 개인별 읽음·삭제. 원 업무 삭제나 다른 사용자 목록 변경과 구분 |
| 시점 보관본 | 별도 보관·필요시 조회. 현재 JSON에 전체 내용을 계속 중복 누적하지 않음 |
| 법령 검토 | 자동 관련 후보와 담당자의 적용 판단을 구별. 단순 조회는 판단·감사기록을 만들지 않으며 명시 검토 저장만 기록. C36 상세는 무근거 후보표를 나열하지 않고 실제 조문·정확 공식 링크를 제공 |

DB는 기존 Supabase 프로젝트의 **`development_project_platform` 스키마만** 사용합니다. 같은 플랫폼을 쓴다는 이유로 기존 조직정보 서비스·공유 Auth·다른 스키마와 결합하지 않습니다. 스키마 분리가 서버 인증·사업별 권한 검사를 대신하지 않습니다.

## 출력과 동기화

사업비의 본표·선택목록·이력·프리셋·Excel은 같은 항목/분류 의미를 사용하되 원자료·표시 묶음·실제 합산행을 구별합니다. 보고서 셀 변경은 작성본에 먼저 보관하고, 명확히 연결된 값만 별도 선택·검증 후 플랫폼에 반영합니다. 합계·제목·동결값을 역산해 원장에 넣지 않습니다.

기존 버전/이력은 `VERSION_HISTORY.md`, `CHANGELOG.md`, 요구별 명세·수정대장으로 연결합니다. HTML 파일 생성·Git push·Vercel READY는 업무 검수 완료의 대체 증거가 아닙니다.
