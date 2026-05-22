# Flutter Puzzle Tab — "IOTA Make Ten"
## 프롬프트 (Claude Code / Cursor에 그대로 붙여넣기)

---

아래 스펙대로 Flutter 위젯 파일 하나(`puzzle_tab.dart`)를 만들어줘.
외부 패키지 추가 없이 Flutter SDK만으로 동작해야 해.
기존 앱의 탭 중 하나로 들어가는 구조라서, `StatefulWidget` 하나로 완결되어야 해.

---

## 게임 이름
**Make Ten** (내부 코드명: puzzle_tab)

---

## 게임 규칙

1. **그리드**: 7×10 (열×행) 타일, 각 타일에 1~9 랜덤 숫자
2. **선택**: 사용자가 타일을 탭/드래그로 연속 선택. 선택 조건:
   - 첫 타일은 아무 타일이나 가능
   - 이후 타일은 직전 선택 타일과 **상하좌우 인접**해야 함 (대각선 불가)
   - 이미 선택된 타일을 다시 탭하면 **그 타일까지 선택 해제** (되감기)
3. **제거 조건**: 선택된 타일들의 합이 정확히 **10**일 때, 손을 떼는 순간 자동 제거
   - 합이 10 미만이면 선택 유지
   - 합이 10 초과면 선택 전체 취소 (짧은 진동 피드백)
4. **중력**: 제거 후 위 타일들이 **아래로 떨어짐** (열 단위 drop). 빈 상단은 새 랜덤 타일로 채워지지 않음 — 그대로 빈칸 유지
5. **종료 조건**: 더 이상 합이 10이 되는 인접 연속 조합이 없을 때
   - 전부 제거됐으면: "Perfect!" 메시지
   - 남은 타일 있으면: "N개 남았어요" 메시지
6. **리셋**: 결과 화면에 "다시 하기" 버튼 → 새 랜덤 그리드로 재시작

---

## UI / 디자인 요구사항

### 색상 (앱 테마 연동)
- 하드코딩된 색상값 대신 `Theme.of(context)` 기반으로 처리
  - 타일 기본 배경: `colorScheme.surfaceVariant`
  - 타일 선택 상태: `colorScheme.primary` (불투명도 0.85)
  - 타일 텍스트: `colorScheme.onSurface`
  - 선택 시 텍스트: `colorScheme.onPrimary`
  - 빈칸: 배경 투명, 테두리 없음

### 레이아웃 밀도 (모바일 세로형 기준, 독립 설정값)
- 그리드 열 수: 7
- 타일 크기: `LayoutBuilder`로 가용 너비를 열 수+간격으로 나눈 값, **최대 44px 상한** 적용
  - 예: 화면 너비 390px → (390 - 16*2 - 6*5) / 7 ≈ 45px → 상한 적용으로 44px
  - 이렇게 하면 어떤 폰에서도 타일이 너무 커지지 않음
- 타일 간격 (gap): 5px
- 타일 모서리: `BorderRadius.circular(8)` — 과하지 않게
- 타일에 미세한 그림자: `BoxShadow(blurRadius: 3, offset: Offset(0,1), color: Colors.black12)` — 깊이감
- 그리드 좌우 패딩: 16px

### 타일 숫자 폰트
- `fontSize`: 타일 크기의 **0.42배** (타일 44px → 약 18~19px)
- `fontWeight`: `FontWeight.w600` — bold보다 한 단계 아래, 세련되게
- `fontFeatures`: `[FontFeature.tabularFigures()]` — 숫자 너비 균일하게

### 인터랙션 피드백
- 선택된 타일: `AnimatedScale(scale: 1.06)` — 너무 크지 않게
- 선택 해제/초과 시: `HapticFeedback.lightImpact()`
- 10 완성 시: `HapticFeedback.mediumImpact()`

### 애니메이션
- 제거: fade out + scale 0.85로 축소 (duration: 180ms)
- 드롭: 위에서 아래로 슬라이드 (duration: 220ms, `Curves.easeIn`)
- 애니메이션은 빠르게 — 답답하지 않도록

### 상단 합계 표시
- 선택 없을 때: 한 줄 높이의 빈 공간 유지 (레이아웃 흔들림 방지)
- 선택 중: `"3 + 4 + 3 = 10"` 형태로 선택 숫자 나열 표시
  - 합 < 10: `colorScheme.onSurface` (기본)
  - 합 = 10: 초록 계열 (`Colors.green.shade600`)
  - 합 > 10: 빨간 계열 (`Colors.red.shade400`)
- 폰트: `fontSize: 15, fontWeight: FontWeight.w500`

### 결과 표시
- 바텀시트 (`showModalBottomSheet`) 사용
- Perfect 클리어: 간단한 이모지 + 한 줄 메시지
- 미완료: "N개 남았어요" + "다시 하기" 버튼

---

## 상태 관리

- `StatefulWidget` + `setState` 만 사용 (Provider/Riverpod/Bloc 없음)
- 주요 상태:
  ```dart
  List<List<int?>> grid; // null = 빈칸
  List<Point<int>> selected; // 현재 선택된 타일 좌표 (열, 행)
  bool isGameOver;
  ```

---

## 파일 구조

단일 파일 `puzzle_tab.dart`로 완결:
- `PuzzleTab extends StatefulWidget`
- `_PuzzleTabState`
- `_TileWidget extends StatelessWidget` (개별 타일)
- 헬퍼 함수들 (인접 체크, 합 계산, 드롭 처리, 종료 체크 등) 모두 같은 파일 내

---

## 주의사항

- `dart:math` 외 추가 import 없이 구현
- 드래그 선택은 `GestureDetector`의 `onPanUpdate`로 구현 (손가락이 타일 위를 지나갈 때 선택)
- 타일 좌표 계산 시 `RenderBox`의 `localToGlobal` 활용
- 종료 체크는 제거 후 매번 실행 (BFS/DFS로 인접 연속 합 탐색, 성능 고려해 최대 탐색 깊이 10으로 제한)
- null safety 완전 준수
- 코드에 한국어 주석 포함
