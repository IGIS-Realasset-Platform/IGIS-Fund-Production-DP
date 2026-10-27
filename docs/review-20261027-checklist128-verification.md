# v0.12.8 누적 체크리스트 동기화 검수

## 준비 단계

2026-10-27. root의 최종 요구상태 확정 전에는 계획·원본 검사만 수행합니다. 최종4개 요구는 NAV128-01·LAW128-02·NTF128-03·RPT128-04입니다.

- 원본: `outputs/review-20261026/개발사업관리플랫폼_요구사항_체크리스트_v0.12.7.xlsx`, SHA256 `adcd6d0b614bb441aa1bb9abc3f0ac3897f4ceaf1b838bda912d66b1cc732ffa`.
- 기존 helper `.build/followup-20261021/sync-followup-checklist.mjs`에 `--review128` 분기만 확장했습니다. 새 분기를 역으로 제거한 텍스트가 기존 기록 SHA256 `36e5df260a1e49dbd8a3ad6223476a44309577ce19c8bbe1ef283cfc50a229f5`와 정확히 같아 원래 모드가 보존됨을 확인했습니다. 새 helper 지문은 `bfe36520e239ae76e0808347066ff3e6b2e2b05962944fdba058dff316bde9de`입니다.
- 계획486행·12열·5832필드, 기존482행·5784필드의 순서/값을 이전 expected matrix와 대조했습니다. 이 단계 MD는396체크/90미체크이며 새4개는 아직 완료로 표시하지 않습니다. 최종 확정 시 다시 계획을 고정합니다.
- Spreadsheets 전체 지침, 편집 workflow, API Quick Start, 스타일 지침을 읽고 bundled Node/Artifact Tool을 사용합니다. 원본 import 후 요약/마지막2행의 좌·우 PNG3개를 실제로 열어 기존서식을 확인했습니다.
- 원본 검사 실행은 PNG/결과를 남겼지만 renderer 프로세스가 exit1을 반환했습니다. 원본 내용이나 제품 오류로 바꾸어 보고하지 않고 검사 도구 종료 경계로 구별합니다.
- **현재 marker0회·authoring0회·새 XLSX 출력0개**입니다. 최종 상태 확정 신호를 받은 뒤 첫 authoring 바로 전에 create/1/xlsx marker를 정확히1회 실행하고 새 v0.12.8 파일1개만 생성합니다.

후속 검수는 재import 전체5832필드, 기존482행의 값/수식/셀서식/행서식, 표/필터/틀고정/너비/머지/정의이름/인쇄설정, 새4개/요약 수치/날짜와 MD 지문을 대조합니다. 변경 부분 PNG를 실제로 확인하되 설치된 Microsoft Excel 실행과 전체 플랫폼 기능 수락으로 확대하지 않습니다.
