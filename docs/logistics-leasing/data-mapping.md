# Logistics Leasing Data Mapping

이 문서는 Google Sheets/xlsx 원본과 향후 Supabase `ll_*` 구조의 연결 기준입니다. 현재 구현은 DB write 없이 `public/logistics-leasing/data/dashboard.json` 예비 JSON을 사용하고, Supabase 적재 승인 후 `ll_payload_snapshots`를 주 source로 전환합니다.

| 원본 | 원본 범위 | 보존 방식 | 업무 테이블/스냅샷 | 용도 | 상태 |
| --- | --- | --- | --- | --- | --- |
| xlsx `Meta_데이터 항목 설명` | row 2 이후 | `ll_sheet_rows.row_values_json` | `fieldDictionary` snapshot | 필드 설명/검증 도움말 | 예비 JSON 생성 대상 |
| xlsx `DB_일반` | header row 9, data row 12 이후 | `ll_sheet_rows.row_values_json` | `ll_assets`, `ll_tenants`, `ll_leases`, `ll_lease_spaces` | 자산/임차인/계약/면적 | 예비 JSON 생성 대상 |
| xlsx `DB_히스토리 누적` | header row 10, data row 15 이후 | `ll_sheet_rows.row_values_json` | `ll_rent_history` | 월 임대료/관리비 추이 | 예비 JSON 생성 대상 |
| xlsx `Log` | row 4 이후 | `ll_sheet_rows.row_values_json` | `ll_issues` | 데이터 품질/확인 이슈 | 예비 JSON 생성 대상 |
| xlsx `자산_담당자 연결` | header row 3, data row 4 이후 | `ll_sheet_rows.row_values_json` | `ll_asset_managers` | 자산 담당자/문의 | 예비 JSON 생성 대상 |
| 기존 map snapshot | `docs/data/home.json.mapPoints` | snapshot merge | `ll_payload_snapshots` | 지도/주소/좌표 | 예비 JSON 생성 대상 |
| OpenDART | Edge Function 결과 | snapshot only | `ll_payload_snapshots` 또는 추후 `ll_*` 보강 | 기업 재무/공시 | Edge Function 전환 필요 |
| 건축물대장 | Edge Function 결과 | snapshot only | `ll_payload_snapshots` 또는 추후 `ll_*` 보강 | 건축물/연면적 검증 | Edge Function 전환 필요 |

금지 사항:
- non-`ll_*` 테이블은 수정, 삭제, 정책 변경하지 않습니다.
- 서버 전용 권한 키와 외부 API 키는 프론트 번들에 넣지 않습니다.
- `github_snapshot`은 예비 source로만 유지하고, 최종 source는 `supabase_snapshot`이어야 합니다.
- 공개 예비 JSON과 `ll_payload_snapshots.payload`에는 원본 행 보존용 `sourceRows`, `rowValues`, `sourceRow`, `source_payload`, `source_row_hash`를 넣지 않습니다.
- 임대보증금, 보증금 담보, 보험 관련 특수 계약 조건, 기타 특수 계약 조건, 계약서 기반 문구는 공개 payload에서 제외합니다.
- 담당자 개인명과 이메일은 공개하지 않고, 필요한 경우 팀 단위의 `담당자 비공개` 문구만 사용합니다.
- Log 원문, 검토/감사/수식 확인 문구는 공개하지 않고 `확인 필요`/`확인 완료` 같은 상태 집계 또는 공개용 요약 문구로만 표시합니다.
- 임차인 사업자번호는 공개 payload에서 마스킹합니다.

공개 예비 JSON sanitizer/checklist:
1. `sourceRows`, `deposit`, `sourceRow`, `email`, 원본 `content`가 남아 있으면 실패 처리합니다.
2. 서버 전용 권한, 외부 API 키, 인증 토큰, 관리자 검토 문구가 있으면 실패 처리합니다.
3. `관리자`, `review`, `audit`, `감사`, `검토`, `formula`, `수식`, `보증금`, `특약`, `특수 계약`, `계약서` 문자열이 공개 payload에 있으면 실패 처리합니다.
4. 프론트 화면 유지에 필요한 공개 집계 필드(`summary`, `assets`, `tenants`, `leases`, `rentHistory`, `monthlyTrend`, `managers`, `issues`, `fieldDictionary`)는 유지하되, 내부 원문 값은 마스킹 또는 공개용 요약으로 대체합니다.
