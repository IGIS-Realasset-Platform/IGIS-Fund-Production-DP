# Mobile Web Handoff

## 목적

Android 사용자는 Flutter 앱을 배포하고, iPhone 사용자는 앱 배포 대신 모바일 전용 web URL을 배포한다. 모바일 web URL은 Android 앱과 같은 정보 구조와 작성 흐름을 제공해야 한다.

이 문서는 `igis_fund_mobile` Flutter 앱에서 모바일 web route로 이식해야 할 화면 구성, Supabase 작동 로직, UI 우선순위를 정리한 인수인계 자료다. 현재 단계에서는 Flutter/npm 패키지 설치 없이 소스 분석만으로 충분하다. 실제 실행 검증은 web 플랫폼 작업 브랜치에서 진행한다.

## 권장 이식 방식

- main 웹 플랫폼에 모바일 전용 route를 추가한다.
- 권장 route: `/mobile` 또는 `/m`
- 기존 PC 플랫폼 route인 `platform/iotaseoul/*`는 유지한다.
- 현재 `feature/sjlee` 브랜치를 main에 그대로 merge하지 않는다. 이 브랜치는 기존 React/Vite 웹 플랫폼 파일 대부분을 삭제하고 Flutter 앱 중심으로 정리되어 있어, 그대로 병합하면 웹 플랫폼이 손상될 수 있다.
- 모바일 web 구현은 main의 React/Supabase 코드 위에서 새 컴포넌트로 작성하고, 이 문서와 Flutter 앱 소스의 로직만 참고한다.

## 앱 기준 화면 구조

모바일 앱은 로그인 이후 하나의 shell 안에서 4개 하단 탭을 전환한다.

1. 주요업무
2. 협업게시판
3. 내업무
4. 알림

상단 app bar:

- 타이틀: `IOTA Seoul CFT`
- 보조 텍스트: `{member.name} · {member.roleCode || 'member'}`
- 우측 액션: 로그아웃

하단 navigation:

- fixed bottom tab bar
- 각 탭은 icon + label
- iPhone Safari safe-area bottom padding을 고려한다.

## Theme Tokens

Flutter 앱의 색상 기준:

- page background: `#1D1D1B`
- panel/card: `#242423`
- secondary panel/input: `#20201F`
- detail sheet: `#171717`
- text: `#F4F4F1`
- muted text: `#9A9A98` 또는 `#A1A1AA`
- border: `#3A3A39`
- primary blue: `#4C82FF`
- task title accent: `#FFC928`

카드는 모바일에서 스캔하기 쉬운 list card 형태가 좋다. Flutter 앱은 card radius 16을 쓰지만, web 플랫폼 디자인 규칙과 맞춰 8px 안팎으로 낮춰도 된다. 중요한 것은 Android 앱과 iPhone web이 같은 정보 밀도와 색상 위계를 갖는 것이다.

## Auth Flow

Flutter 앱 로직:

- Supabase Auth session이 있으면 Home으로 진입한다.
- session이 없으면 login 화면을 보여준다.
- 로그인은 `signInWithPassword(email, password)`를 사용한다.
- 자동 로그인 설정은 앱에서 `shared_preferences`로 저장하지만, web에서는 Supabase session persistence를 쓰면 된다.

Web 이식:

- 기존 web 플랫폼의 `AuthContext` / Supabase client를 재사용한다.
- 모바일 route 접근 시 미인증이면 기존 `auth-setup` 또는 모바일용 login 화면으로 보낸다.
- PC 전용 mobile blocker가 있으면 `/mobile` route에서는 block하지 않도록 예외 처리한다.

## Member And Workspace Rules

현재 사용자 조회:

- table: `iota_seoul_pilot_members`
- filter: `email = currentUser.email`
- 없으면 `{ email, name: email }` fallback

필요 필드:

- `email`
- `staff_name`
- `org_name`
- `role_code`
- `workspace_code`

관리자 판정:

- `role_code`가 `master` 또는 `director`
- 또는 `workspace_code`가 `WS_MASTER`

워크스페이스 목록:

| code | label | focusLabel | taskTable | orgNames |
| --- | --- | --- | --- | --- |
| WS_PM | 사업 PM | 사업 PM | iota_pm_tasks | 사업PM, 사업 PM |
| WS_LFC | 파이낸싱-LFC | 파이낸싱 | iota_financing_tasks | 파이낸싱 |
| WS_DSC | 개발솔루션-DSC | 개발솔루션 | iota_development_tasks | 개발관리, 개발솔루션 |
| WS_EMC | 기업마케팅-EMC | 기업마케팅 | iota_marketing_tasks | 기업마케팅 |
| WS_SSC | 공간솔루션-SSC | 공간솔루션 | iota_digital_tasks | 상품·디지털, 공간솔루션 |
| WS_KAM | 펀드운용-KAM | 펀드운용 | iota_fund_tasks | 펀드운용 |
| WS_IPR | IPR | IPR | iota_ipr_tasks | IPR |

관리자는 모든 워크스페이스를 볼 수 있다. 일반 사용자는 `workspace_code` 우선, 없으면 `org_name` 매칭으로 소속 워크스페이스를 정한다. 매칭 실패 시 앱은 첫 워크스페이스를 fallback으로 쓴다.

## Tab 1: 주요업무

UI:

- 상단 `Dropdown`으로 주요업무 워크스페이스 선택
- `WS_EMC`, `WS_SSC`에서는 `이오타만 보기` switch 표시
- task card list
- pull-to-refresh 또는 refresh button

Task query:

```js
supabase
  .from(workspace.taskTable)
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50)
```

Task card fields:

- label: `Task {index + 1}`
- due date: `목표 마감일 YYYY.MM.DD`, 없으면 `마감일 없음`
- title: `task_name`, 없으면 `Task 명 없음`
- next action: `next_action`, 없으면 `작성된 내용이 없습니다.`

Task model:

- `id`
- `task_name`
- `company_name`
- `related_asset`
- `status`
- `priority`
- `due_date`
- `next_action`
- `created_at`

`이오타만 보기` 필터:

- `related_asset` lowercase 값에 아래 문자열 중 하나가 포함되면 표시한다.
- `iota`, `이오타`, `427`, `816`, `421`, `공통`

## Tab 2: 협업게시판

UI:

- 상단 `Dropdown`으로 협업게시판 워크스페이스 선택
- 선택 워크스페이스의 log feed 표시
- card tap 시 detail bottom sheet 또는 full-screen modal
- 권한 없는 글은 본문 대신 lock 상태를 표시한다.

Log query:

```js
supabase
  .from('iota_seoul_logs')
  .select('*, iota_seoul_log_stakeholders(sh_name, role_category)')
  .order('work_date', { ascending: false })
  .order('created_at', { ascending: false })
  .limit(2000)
```

앱은 DB에서 넓게 가져온 뒤 client-side로 워크스페이스/권한/필터를 한 번 더 거른다. web은 기존 PC 플랫폼 쿼리와 권한 로직이 있다면 그것을 우선 재사용하고, 모바일 화면에는 최종 결과만 넣는 편이 좋다.

Workspace filter:

- `log.metadata.workspace_code === workspace.code`
- 또는 `log.metadata.workspace_label === workspace.label`
- 또는 workspace org/focus label이 `workspace_label`/`cellName`에 매칭

Log card fields:

- title: `metadata.title` 우선, 없으면 `summary` 첫 줄, 없으면 `raw_text` 첫 줄
- priority: `metadata.priority || '중간'`
- body: `raw_text`, max 3 lines
- chips:
  - workspace label
  - project name
  - triage type
  - visibility label
  - stakeholder role
  - stakeholder name
  - status
  - writer name
  - 댓글 count
- 마지막 댓글 preview가 있으면 카드 하단에 표시

## Tab 3: 내업무

UI:

- 내가 작성한 로그 목록
- 오른쪽 하단 `작성` floating action button
- 작성 버튼은 모바일 web에서도 primary floating button 또는 bottom-fixed action으로 제공한다.

My logs filter:

- `writer_staff_id.toLowerCase() === member.email.toLowerCase()`

작성 modal:

- 앱은 height 90% bottom sheet를 사용한다.
- web도 모바일에서는 bottom sheet UX가 적합하다.
- 상단 title: `작성`
- segmented control:
  - `Task 등록`
  - `협업 글작성`
- 하단 primary submit: `저장`

## Composer Mode A: Task 등록

Default mode는 `Task 등록`이다.

Fields:

- Task 등록 워크스페이스: 읽기 전용 표시
- 업무명: required
- 회사명: optional, 비워두면 내부업무 취급
- 관련자산: default `IOTA 공통`
- 상태: `아이데이션`, `검토중`, `진행중`, `보류`, `완료`
- 우선순위: `높음`, `중간`, `낮음`
- D-Day: optional date
- Next Action: optional multiline

Task workspace:

- 사용자의 `org_name`에 매칭되는 워크스페이스를 우선 사용
- 없으면 현재 선택된 워크스페이스

Insert payload:

```js
const payload = {
  task_name: taskName.trim(),
  related_asset: relatedAsset.trim() || 'IOTA 공통',
  status,
  priority,
  due_date: dueDate ? yyyyMmDd(dueDate) : null,
  next_action: nextAction.trim(),
  created_at: new Date().toISOString()
}

if (workspace.taskTable !== 'iota_digital_tasks') {
  payload.company_name = companyName.trim()
}

await supabase.from(workspace.taskTable).insert(payload)
```

Validation:

- `task_name`이 비어 있으면 저장 불가
- 저장 후 modal close, 주요업무/내업무 list refresh

## Composer Mode B: 협업 글작성

Fields:

- 협업 글작성 워크스페이스: dropdown
- 내용: required multiline
- 프로젝트:
  - `IOTA 공통` / `IOTA_COMMON`
  - `427 PFV` / `P00030`
  - `816 PFV` / `P00037`
  - `421 Fund` / `112614`
- 목적:
  - `공유`
  - `협업`
  - `리스크 판단`
  - `의사결정`
- 상태:
  - `신규`
  - `검토중`
  - `진행중`
  - `보류`
  - `완료`
- 중요도:
  - `높음`
  - `중간`
  - `낮음`
- 조회 범위:
  - 공유 워크스페이스 chips
  - 조회 인원 추가 autocomplete

Visibility:

- 선택된 primary workspace는 항상 포함하고 chip 해제 불가
- 추가 workspace chip을 선택할 수 있다.
- 인원 검색은 `iota_seoul_pilot_members`에서 가져온 목록으로 이름/이메일/조직명 검색
- 선택 인원은 chip으로 표시하고 삭제 가능
- 안내 문구: `관리자 및 부문대표는 항상 조회할 수 있습니다.`

Log insert:

```js
const now = new Date()
const logId = `iota_issue_${now.getTime()}`

await supabase.from('iota_seoul_logs').insert({
  log_id: logId,
  writer_staff_id: member.email,
  writer_name: member.name,
  work_date: yyyyMmDd(now),
  raw_text: content,
  summary: content.length > 160 ? content.slice(0, 160) : content,
  input_status: 'submitted',
  source_system: 'mobile_app',
  metadata: {
    workspace_code: workspace.code,
    workspace_label: workspace.label,
    project_name: projectName,
    triage_type: triageType,
    issue_status: status,
    priority,
    comments: [],
    permissions: {
      groups,
      individuals
    }
  }
})

await supabase.from('iota_seoul_log_links').insert({
  link_id: `link_${logId}`,
  log_id: logId,
  proj_id: projectId,
  relation_type: 'direct_input'
})
```

The Flutter app has optional stakeholder fields in the repository method, but the current composer UI does not expose stakeholder inputs. Web mobile can omit stakeholder input for parity unless the PC platform requires it.

## Log Detail And Comments

Detail UI:

- bottom sheet or full-screen modal
- title
- same metadata chips as card
- full raw text
- comment list
- comment input
- `댓글 등록` button

Comment update logic:

```js
const comments = [...(log.metadata.comments || [])]
comments.push({
  id: `comment_${Date.now()}`,
  author: member.name,
  author_email: member.email,
  text,
  created_at: new Date().toISOString()
})

await supabase
  .from('iota_seoul_logs')
  .update({ metadata: { ...log.metadata, comments } })
  .eq('log_id', log.id)
```

## Tab 4: 알림

Query:

```js
supabase
  .from('iota_notifications')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50)
```

Fields:

- `id`
- `user_id`
- `title`
- `body`
- `type`
- `reference_id`
- `is_read`
- `created_at`

UI:

- unread item은 배경 강조와 bold title
- title/body/time 표시
- empty state: `새로운 알림이 없습니다.`
- error state: `알림을 불러오지 못했습니다.`

Read action:

```js
await supabase
  .from('iota_notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
```

## 권한 표시 로직

Flutter 앱의 `WorkLog.isVisibleTo(member)` 요약:

- explicit visibility가 없으면 visible
- 작성자 email/name이면 visible
- `permissions.individuals`에 현재 사용자 이름이 있으면 visible
- `permissions.groups`에 아래 값이 매칭되면 visible
  - `각 워크스페이스`
  - 현재 사용자 `role_code`
  - 현재 사용자 `org_name`과 group 간 포함 관계
  - legacy override: `PO` + 이철승, `Sub-PO` + 윤관식/정조민/우형석

주의:

- 현재 composer는 `individuals`에 email을 넣고, reader check는 name도 본다. web 플랫폼 쪽 권한 로직과 DB trigger 로직까지 함께 확인해서 email/name 기준을 하나로 맞추는 것이 좋다.
- 관리자/부문대표 항상 조회는 UI 안내와 DB trigger 수신자 로직에 반영되어 있으나, client-side visible check에서도 일관되게 적용할지 확인이 필요하다.

## Main Web Integration Notes

현재 main의 `src/App.jsx`는 path 기반으로 route를 분기한다. 모바일 route를 추가할 때는 다음 사항을 반영한다.

- `getPage()`가 `/mobile` 또는 `/m`을 정상 currentPage로 인식하게 한다.
- `currentPage === 'mobile'` 또는 `currentPage.startsWith('mobile')` 분기를 추가한다.
- 기존 mobile blocker는 `/mobile`에서는 표시하지 않는다.
- 인증 보호 조건에 `/mobile` route를 포함한다.
- 기존 Supabase client/AuthContext를 재사용한다.
- `PlatformCore` 내부 컴포넌트 로직을 재사용할 수 있으면 query/service만 공유하고, 화면은 모바일 전용 컴포넌트로 따로 두는 것이 유지보수에 유리하다.

## Minimal Component Plan For Web Worker

권장 파일 구성 예시:

- `src/components/mobile/MobileIotaApp.jsx`
- `src/components/mobile/MobileShell.jsx`
- `src/components/mobile/MobileLogin.jsx` 또는 기존 Auth 재사용
- `src/components/mobile/MobileTaskList.jsx`
- `src/components/mobile/MobileLogList.jsx`
- `src/components/mobile/MobileLogCard.jsx`
- `src/components/mobile/MobileComposerSheet.jsx`
- `src/components/mobile/MobileNotificationList.jsx`
- `src/components/mobile/mobileIotaData.js`
- `src/components/mobile/mobileIotaTheme.css`

## Verification Checklist

- `/mobile` route가 iPhone width에서 blocker 없이 열린다.
- 미로그인 상태에서 로그인 또는 auth setup으로 이동한다.
- 로그인 후 하단 4탭이 보인다.
- 주요업무에서 워크스페이스별 task가 표시된다.
- `WS_EMC`/`WS_SSC`에서 이오타 필터가 동작한다.
- 협업게시판에서 워크스페이스별 log가 표시된다.
- 권한 없는 log는 lock 상태로 보인다.
- log detail에서 댓글 등록이 가능하다.
- 내업무 탭에서 현재 사용자 작성 로그만 보인다.
- 작성 sheet에서 Task 등록과 협업 글작성이 분리되어 동작한다.
- 알림 목록 조회와 읽음 처리가 동작한다.
- Android Flutter 앱과 iPhone web의 탭명, 카드 정보, 작성 흐름이 서로 어긋나지 않는다.

## Package Decision

현재 단계에서는 패키지 설치가 필요 없다.

- 화면 구성 분석: 소스만으로 충분
- DB 작동 로직 분석: repository/model 코드로 충분
- web 이식 문서 작성: 소스만으로 충분

패키지가 필요한 경우:

- Flutter 앱 실제 실행/화면 캡처: Flutter SDK, Android SDK, JDK 필요
- Flutter 정적 분석: Flutter SDK 필요
- web route 구현 후 테스트: main 웹 플랫폼에서 `npm install` 및 `npm run dev` 필요
- Supabase Edge Function 작업: `npm`/Supabase CLI 필요
