# 개발·검사·빌드 가이드

## 환경과 첫 확인

Node.js 24와 `package-lock.json`을 기준으로 합니다. 저장소 루트에서 `package.json`, `AGENTS.md`, 현행 명세를 먼저 읽고 `git status`/현재 HEAD를 확인합니다. 작업 중인 다른 수정은 보존합니다.

GitHub 소스만으로 구조 파악과 일부 검사를 실행할 수 있습니다. 모든 비공개 시험자료·브라우저 환경까지 함께 제공하는 저장소는 아닙니다. 아래 세 경계를 구분합니다.

| 검사 범위 | 준비조건 | 판정 |
| --- | --- | --- |
| 추적 소스·합성 입력만 | 아래 두 순수 검사 | 깨끗한 추적파일 추출 환경에서 실제22개·9개 통과. 실제 DB/API 호출 없음 |
| 회사 시험자료 기반 회귀 | 승인된 비공개 fixture/생성 파일·해당 테스트 목록 | 자료 미동봉 시 준비 차단. 빈 fixture로 대체해 성공 처리하지 않음 |
| 실제 화면·출력·운영 | 격리 Edge, 정확 HTML·참조판본, PDF/Excel 도구, 별도 실제 계정 권한 | 단위검사·모의 API 통과와 구분. 실제 저장은 승인된 범위에서만 |

```powershell
# 실제 서비스·키·DB가 필요 없는 공개 재현 검사
node tests/cloud-storage.mjs
node tests/center120-law-api.mjs
```

이 두 검사에 의존패키지 설치는 필요하지 않았습니다. 서버 개발/빌드에 패키지가 필요하면 잠금파일을 유지해 `npm ci --ignore-scripts`를 사용하고, 새 패키지·외부 서비스를 임의로 추가하지 않습니다.

## 전체 회귀의 현재 제한

`node scripts/verify-center120.mjs`는 기존 전체 회귀 선택기입니다. 2026-10-21의 GitHub `441ab2e` 단독 추출 검토에서 다음 준비 문제가 확인됐습니다.

- `makeHarness()` 기본값은 미동봉 `src/data/legacy-seed.json`을 읽습니다. 원가 등 여러 검사가 이 입력에 의존합니다. 명시적인 합성 seed를 주입한 검사와 구별합니다.
- 당시 선택 목록에는 추적되지 않은 `tests/v0132-company-flow.mjs`가 있었습니다. 이는 검사 준비 누락이며 제품 결함 재현이 아닙니다. v0.12.1에서는 이 검사와 누락된 공개 도우미를 함께 게시하지만, 그 사실이 비공개 fixture 의존까지 해소한 것은 아닙니다.
- 일부 실응답 검사는 비공개 `.build` 자료가 없으면 관측자료0건으로 끝날 수 있습니다. 종료코드0을 과거 실응답 검수 재현으로 읽지 않습니다.
- 브라우저 검사 일부는 작성 PC 경로와 승인된 런타임을 사용합니다. 다른 PC의 Playwright·Edge 환경이 자동 준비되는 것은 아닙니다.
- v0.12.1 작업본의 선택기는 `center*`와 `followup121-*` 순수검사를 함께 선택합니다. 브라우저·PDF 수락 검사는 별도로 실행하며, 실제 실행목록과 소스/시험자료 지문을 대조합니다. 과거 `441ab2e`의 선택기로 후속 검사를 실행했다고 보고하지 않습니다.

공개 전용 시험자료/이식 가능한 실행기 개선은 별도 작업입니다. 이 안내를 추가했다고 준비 문제가 해결된 것으로 체크하지 않습니다. 실제 회사 원문을 게시하거나 실패 단언을 완화하는 해결은 금지합니다.

## 빌드와 모듈 연결

공개 배포 진입점은 `npm run build` → `scripts/build-vercel.mjs`입니다. 승인된 Vercel 환경·브랜치·origin·설정·HTML 지문을 검증합니다. 로컬에서 빌드하려고 실제 환경 검사를 우회하지 않습니다.

전체 화면 HTML의 격리 검사 후보를 생성할 때는 승인된 환경에서 아래 실제 빌더를 사용합니다. 출력은 `.build` 안의 비공개 경로입니다.

```powershell
node scripts/build-deployment.mjs --cloud --out .build/qa-candidate.html --icons src/assets/nav-icons.json --cloud-origin https://igis-development-project-platform.vercel.app
```

`--icons`는 기존 빌더의 입력 계약입니다. 메뉴에 그림을 표시해야 한다는 UI 요구가 아닙니다. 빌더 기본 fallback은 미동봉 과거 HTML을 읽을 수 있으므로 추적 JSON 경로를 명시합니다. `scripts/build.mjs`/`prepare-github-release.mjs`는 현재 GitHub 공개 진입점이 아닙니다.

후보 파일에는 실제 업무자료를 내장하지 않습니다. 브라우저에서 실제 정식 주소로 접속해 검수하려면 별도 계정·권한이 필요합니다. 격리 후보는 원격 API를 막고 명시적인 합성 응답을 사용하며 실제 운영 성공으로 보고하지 않습니다.

## 완료 기록

명세 번호별로 구현/자동검사/실화면/출력/중앙 저장/배포를 분리합니다. 파일 지문과 실제 검사 자료를 연결하고 실패·차단·미검증을 남깁니다. 자연 예약 실행, 다른 실제 회원, 분기 도래, 회사 PC 정책은 조건이 충족되기 전 완료로 바꾸지 않습니다.

구조·API 연결은 [아키텍처](ARCHITECTURE.md), 변경 절차는 [CONTRIBUTING](../CONTRIBUTING.md), 현재 남은 작업은 [CURRENT-WORK](CURRENT-WORK.md)를 확인합니다.
