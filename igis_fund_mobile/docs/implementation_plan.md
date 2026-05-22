# 작성 모듈 분리: Task 등록 / 협업 글작성

세번째 탭(내업무)의 작성 버튼을 누르면 나오는 시트를 **두 가지 모드**로 분리합니다.

## 변경 요약

현재 `LogComposerSheet`는 업무 로그 작성(= 협업게시판 글) 하나만 지원합니다.
이것을 상단 탭으로 **Task 등록**과 **협업 글작성**을 구분하여, 각각의 작성 폼이 나타나도록 개선합니다.

---

## Proposed Changes

### 1. LogComposerSheet 상단에 모드 탭 추가

#### [MODIFY] [home_screen.dart](file:///c:/grus.py/org/igis_fund_mobile/lib/src/screens/home_screen.dart)

**상단 UI 변경:**
- 기존 `'업무 로그 작성'` 제목을 제거
- 대신 두 개의 탭 버튼: `[ Task 등록 | 협업 글작성 ]`
- 선택된 탭에 따라 아래 폼 내용이 바뀜

---

### 2. Task 등록 모드

**입력 필드:**
| 필드 | 설명 |
|------|------|
| 업무명 (task_name) | 텍스트 입력 |
| 회사명 (company_name) | 텍스트 입력 (빈 값 = 내부업무) |
| 관련자산 (related_asset) | 텍스트 입력 |
| 상태 (status) | ChoiceChip: 아이데이션 / 검토중 / 진행중 / 보류 / 완료 |
| 우선순위 (priority) | ChoiceChip: 높음 / 중간 / 낮음 |
| D-Day (due_date) | 날짜 선택기 |
| Next Action | 텍스트 입력 |

**동작:**
- 로그인한 사용자가 속한 워크스페이스의 `taskTable`에 자동 INSERT
- 워크스페이스 선택 없이, 현재 사용자의 소속 워크스페이스로 자동 결정

#### [MODIFY] [platform_repository.dart](file:///c:/grus.py/org/igis_fund_mobile/lib/src/services/platform_repository.dart)

- `createTask()` 메서드 추가
- 해당 워크스페이스의 `taskTable`에 INSERT

---

### 3. 협업 글작성 모드 (기존 로직 개선)

**변경점:**
- **워크스페이스 선택 드롭다운** 추가 (관리자는 전체, 일반 사용자는 소속 워크스페이스만)
- 나머지는 기존과 동일 (내용, 프로젝트, 목적, 상태, 중요도)

**조회 범위 (visibility) 개선:**
| 옵션 | 동작 |
|------|------|
| 워크스페이스 (기본값) | 선택한 워크스페이스 구성원 전원이 볼 수 있음 |
| 지정 인원 | 아래 인원 선택 UI 표시 |

**지정 인원 선택 UI 개선:**
- 기존의 `FilterChip` 전체 목록 → **텍스트 입력 + 자동완성** 방식으로 변경
- 입력 시 서버에 등록된 인원 목록에서 자동완성 후보 표시
- 선택된 인원은 `Chip` 형태로 표시, 이름 옆 `X` 버튼으로 삭제 가능
- 인원 수 제한 없음

**이철승 부문대표 / 관리자 권한:**
- `이철승` (director)은 모든 글의 조회 권한이 자동으로 부여됨 → UI에 "이시정 · 이철승 (부문대표)는 항상 조회 가능합니다" 안내 텍스트 표시
- 관리자(master/director)는 별도 노출 없이 백엔드에서 자동 권한 처리 (이미 `isVisibleTo`에서 `hasAdminVisibilityAccess` 체크 중)

---

### 4. 파일별 변경 상세

#### [MODIFY] [home_screen.dart](file:///c:/grus.py/org/igis_fund_mobile/lib/src/screens/home_screen.dart)

- `_LogComposerSheetState`에 `_composerMode` enum 추가 (`task` / `collaboration`)
- 상단에 `SegmentedButton` 또는 두 개의 `ToggleButton`으로 모드 전환
- `_buildTaskForm()` 새로 생성 — Task 필드들
- `_buildCollaborationForm()` — 기존 로그 작성 폼을 리팩터링
- 조회 범위의 '지정 인원'을 `Autocomplete` + 선택된 인원 `Chip` 목록으로 교체
- 하단 안내 텍스트: "관리자 및 부문대표는 항상 조회할 수 있습니다."

#### [MODIFY] [platform_repository.dart](file:///c:/grus.py/org/igis_fund_mobile/lib/src/services/platform_repository.dart)

- `createTask()` 메서드 추가:
```dart
Future<void> createTask({
  required MemberProfile member,
  required WorkspaceInfo workspace,
  required String taskName,
  String companyName = '',
  String relatedAsset = 'IOTA 공통',
  String status = '아이데이션',
  String priority = '중간',
  DateTime? dueDate,
  String nextAction = '',
}) async { ... }
```

---

## Open Questions

> [!IMPORTANT]
> Task 테이블(`iota_pm_tasks`, `iota_financing_tasks` 등)의 컬럼 구조가 워크스페이스마다 동일한가요? 현재 `WorkspaceTask.fromMap`을 보면 `task_name`, `company_name`, `related_asset`, `status`, `priority`, `due_date`, `next_action`, `created_at` 컬럼을 사용하는데, 모든 워크스페이스 Task 테이블이 이 구조인 것으로 가정하고 진행해도 될까요?

---

## Verification Plan

### Automated Tests
- `flutter run`으로 기기에 설치 후 동작 확인

### Manual Verification
1. 세번째 탭 → 작성 버튼 → 상단에 `Task 등록 / 협업 글작성` 탭이 표시되는지
2. Task 등록 모드에서 폼 작성 후 저장 → 첫번째 탭(주요업무)에 해당 Task가 나타나는지
3. 협업 글작성 모드에서 워크스페이스 선택 → 조회 범위 '지정 인원' 선택 → 자동완성으로 이름 검색 → X 버튼으로 삭제 → 저장
4. 관리자/부문대표 계정으로 모든 글이 조회되는지
