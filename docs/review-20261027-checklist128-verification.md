# v0.12.8 누적 체크리스트 동기화 검수

## 준비 단계

2026-10-27. root의 최종 요구상태 확정 전에는 계획·원본 검사만 수행합니다. 최종4개 요구는 NAV128-01·LAW128-02·NTF128-03·RPT128-04입니다.

- 원본: `outputs/review-20261026/개발사업관리플랫폼_요구사항_체크리스트_v0.12.7.xlsx`, SHA256 `adcd6d0b614bb441aa1bb9abc3f0ac3897f4ceaf1b838bda912d66b1cc732ffa`.
- 기존 helper `.build/followup-20261021/sync-followup-checklist.mjs`에 `--review128` 분기만 확장했습니다. 새 분기를 역으로 제거한 텍스트가 기존 기록 SHA256 `36e5df260a1e49dbd8a3ad6223476a44309577ce19c8bbe1ef283cfc50a229f5`와 정확히 같아 원래 모드가 보존됨을 확인했습니다. 새 helper 지문은 `bfe36520e239ae76e0808347066ff3e6b2e2b05962944fdba058dff316bde9de`입니다.
- 계획486행·12열·5832필드, 기존482행·5784필드의 순서/값을 이전 expected matrix와 대조했습니다. 이 단계 MD는396체크/90미체크이며 새4개는 아직 완료로 표시하지 않습니다. 최종 확정 시 다시 계획을 고정합니다.
- Spreadsheets 전체 지침, 편집 workflow, API Quick Start, 스타일 지침을 읽고 bundled Node/Artifact Tool을 사용합니다. 원본 import 후 요약/마지막2행의 좌·우 PNG3개를 실제로 열어 기존서식을 확인했습니다.
- 원본 검사 실행은 PNG/결과를 남겼지만 renderer 프로세스가 exit1을 반환했습니다. 원본 내용이나 제품 오류로 바꾸어 보고하지 않고 검사 도구 종료 경계로 구별합니다.
- **준비 단계 당시 marker0회·authoring0회·새 XLSX 출력0개**였습니다. 최종 상태 확정 신호를 받은 뒤 첫 authoring 바로 전에 create/1/xlsx marker를 정확히1회 실행하고 새 v0.12.8 파일1개만 생성했습니다.

후속 검수는 재import 전체5832필드, 기존482행의 값/수식/셀서식/행서식, 표/필터/틀고정/너비/머지/정의이름/인쇄설정, 새4개/요약 수치/날짜와 MD 지문을 대조합니다. 변경 부분 PNG를 실제로 확인하되 설치된 Microsoft Excel 실행과 전체 플랫폼 기능 수락으로 확대하지 않습니다.

## 최종 생성·검수 결과

root가 C66 정식 검수 후 확정한 Markdown을 다시 계획으로 고정했습니다. **486항목·완료400·미완료86**이며 새4개 요구만 완료로 바뀌었습니다. 원본 Markdown SHA256은 **f8a149aa216f1adb3fe56487f1c1d7a803d1c76d1a1f950b3d2461285f7a3f78**입니다.

| 검수 | 결과 |
|---|---|
| 생성 | 첫 authoring 직전 marker1회 성공 → authoring1회 → export1회, 새 XLSX1개 |
| 재import | 전체486×12=5832필드가 최종 Markdown 계획과 정확히 일치 |
| 기존 항목 | 이전482×12=5784필드의 값/수식 차이0, 셀서식 차이0, 행서식 차이0 |
| 원래 Excel 구성 | 25/25조건 통과. 시트/열폭/틀고정/머지/서식/정의이름/인쇄설정 보존, 표의 범위만A6:L488→A6:L492로 확장 |
| 새 요구 | NAV128-01·LAW128-02·NTF128-03·RPT128-04 순서·완료상태·세부내용 일치 |
| 요약/날짜 | v0.12.8·486/400/86·2026-10-27 정확 일치 |
| 원본 | v0.12.7 SHA256 adcd6d0… 그대로, 기존482개 Markdown prefix도 이전 지문57caf3e…과 동일 |
| 오류 검사 | 셀 오류 검색0건, 재import/읽기 전용 OOXML 검사 모두 exit0 |
| 화면 | 요약1개와 새4행의 좌·우4개, 총PNG5개를 실제로 열어 문자·줄바꿈·잘림을 확인 |

최종 파일: `outputs/review-20261027/개발사업관리플랫폼_요구사항_체크리스트_v0.12.8.xlsx` — **139,888bytes**, SHA256 **08f1efdabfd09230024966dc26c6d2883b7608d8bb71b0f08f9f49389656edbd**.

검수 근거는 `.build/review-20261027/checklist128/`의 `plan.json`, `operation-sequence.json`, `verification.json`, `native-verification.json`, `rendered.json`과PNG5개입니다. 생성/재import/OOXML 검사는 정상 종료했습니다. renderer는 PNG5개와 지문 목록을 만든 뒤 exit1을 반환하는 종료 경계를 보였으므로 **renderer 프로세스 exit0로 보고하지 않습니다**. 실제 출력파일 지문은 render 전후 동일하며, PNG5개도 목록의 지문과 대조했습니다.

설치된 Microsoft Excel 실행은 하지 않았습니다. 실제 자연 예약 실행·다른 모든 회원·전체 플랫폼 구성요소의 완료도 이 workbook 검수로 승계하지 않습니다. 해당 한계는 기존/신규 요구의 남은 사항과 root 매트릭스에서 유지합니다.
