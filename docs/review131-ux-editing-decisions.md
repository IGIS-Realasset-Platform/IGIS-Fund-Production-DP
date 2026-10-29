# REVIEW131 수정 진입 채택안과 연결 소비자 분모

2026-10-29 · 동시 구현 중의 읽기 시점 기록입니다. 최신 구현 결정과 `review131-spec.md`를 기준으로 하며, 최초 [UX 연구](review131-ux-editing-research.json)의 제안은 당시 견해로 보존합니다. 이 문서의 소스 확인·모형검사는 실제 화면·서버·정식 배포 수락과 다릅니다.

## 채택된 수정 단위

| 업무 | 실제 채택 | 확인 상태 |
| --- | --- | --- |
| 사업개요 | 24필드 구역폼 1개 진입 — 사업개요 수정 버튼 하나로 연관 필드를 같이 수정합니다. 총연면적·지상/지하 연면적·용적률 산정 연면적·취득대상 토지면적과 지상/지하층수·기간을 빠짐없이 유지합니다. | 구현 소스 확인 / review131-overview-edit 9통과/0실패 및 review131-edit-units 공통계약 |
| 대출·출자·담보/보증·계약·문서 | 기존 기록폼의 행 수정 1개 — 읽기값의 셀별 버튼을 없애되 행이나 상세의 기존 기록 수정 진입을 유지합니다. 금액·기간·VAT·배부·근거처럼 관계있는 필드는 같은 기록폼에서 검증합니다. | editScope record와 기존 행 진입 확인 / review131-edit-units 4통과/0실패의 명시된 합성자료 범위 |
| 사업비 | 금액 1개와 변경사유·이력이라는 독립 업무 단위 — 항목당 명시적인 수정 진입 1개를 유지합니다. 새 표 전체 일괄 저장모드는 이번에 도입하지 않습니다. 복수 원기록의 대상 선택·원 단위·현재/과거·합계/하위 분해는 기존 계약대로 유지합니다. | 현재 A.editable 필드 진입 보존 / 정확 금액 공통계약 일부 확인; 모든 사업비 동적 상태를 재실행하지 않음 |
| 인허가·필지·토지매매계약·지급회차·분양/매각 | 기존 기록폼의 행 수정 1개 — frontend 담당자가 기존 legal-edit 기록폼과 조회행을 정리합니다. 인허가 개별 상세 4탭과 검토의견·조치계획은 보존합니다. | 기존 각 기록폼·행동 존재 확인. 해당 담당자의 최종 구현·지문 확정 대기 / 이 담당자 미실행 |
| 주요 현안 | 한 현안의 기존 5필드폼 1개 진입 — 5셀의 개별 수정 대신 행 수정 1개를 둡니다. 기존 현안 추가는 유지합니다. 수정 대상의 사업·권한·삭제/교체/중복ID를 저장 직전에 검사하고 변경한 필드만 저장합니다. | 구현·소스 동결 / review131-record-editing-adjacent 29통과/0실패 중 현안 범위 |
| 유사사업 비교 | 기존 14필드 기록폼 1개 진입 — 7조회셀의 개별 수정 대신 기존 전체 기록폼을 여는 행 수정 1개를 둡니다. 14필드·출처 원문·비교 선택 해제·기존 비일자·0/null·미편집 속성은 보존합니다. | 구현·소스 동결 / review131-record-editing-adjacent 29통과/0실패 중 유사사업 범위 |
| 착공·공사·준공 / 법정 A4 보고서 | 기존 일괄 입력폼 / 현재 보고서 작성본 — 기존 폼을 유지합니다. 보고서 수정모드 안의 기존 셀 적용 방식까지 이번에 일괄 폐지하는 결정이 아닙니다. 인쇄 본문·과거 저장본·명확한 원장 반영 경계를 유지합니다. | 기존 폼 존재 확인 / 이 담당자 새 전수검사 미실행 |

사업비의 표 전체 수정모드는 최초 연구의 후보였으며 이번에 채택하지 않았습니다. 한 금액·변경사유·이력의 독립 저장을 유지합니다. 대출·계약 등 기록폼을 사용하는 값에서 `A.editable` 호출이 남는 것은 읽기 표시의 재사용이며, 모든 호출을 제거하는 것이 목표가 아닙니다.

## 분모와 전체 호출 위치

- A.editable 직접 호출 위치 수, 그 호출이 반복되는 조회 필드 수, 실제 기록 수, 화면에 보이는 버튼 수, 독립 업무 단위 수는 서로 다른 분모입니다.
- editScope record 호출은 읽기값을 출력하기 위해 남을 수 있으므로 A.editable 문자열이 존재한다는 이유만으로 수정 버튼 중복이라고 판단하지 않습니다.
- 조회에서 같은 기록의 여러 필드가 있어도 기록 수정폼 1개가 맞는지 확인합니다. 기존 기록폼의 필수 필드가 누락되면 버튼 수만 줄였다고 수락하지 않습니다.
- 동적 표의 버튼 수는 실제 사업·권한·필터·접힘·반복행·팝업·보고서모드에 따라 달라집니다. 이번 정적 목록은 전체 플랫폼의 고유 버튼 수나 검수 통과 수가 아닙니다.
- A.editable만 검사하면 직접 A.form으로 구현된 일정·공사·인허가 상세·개발업 등록·출처 자료·보고서 부속기록 등의 진입이 누락됩니다. 아래 업무 묶음과 최종 매트릭스를 함께 사용합니다.

조사 시점 `src/**/*.js` 40개 파일에서 직접 호출은 **13곳 / 6파일**입니다. 같은 줄의 호출 두 곳을 따로 집계했습니다. 이 중 기록의 읽기값을 표시하는 호출 6곳이 포함됩니다. 업무 연결 묶음 19개는 설명용 분류이며 고유 화면·버튼·검수 통과 수가 아닙니다.

| 파일:행:열 | 역할 |
| --- | --- |
| src/cbs.js:297:184 | field-editor-or-mode-dependent |
| src/cbs.js:298:241 | field-editor-or-mode-dependent |
| src/cbs.js:300:757 | field-editor-or-mode-dependent |
| src/cbs.js:435:420 | field-editor-or-mode-dependent |
| src/contracts.js:147:126 | record-read-value |
| src/partners.js:6:53 | record-read-value |
| src/permit-views.js:7:145 | field-editor-or-mode-dependent |
| src/recovery-views.js:4:50 | record-read-value |
| src/recovery-views.js:40:914 | record-read-value |
| src/recovery-views.js:40:1346 | record-read-value |
| src/recovery-views.js:102:327 | record-read-value |
| src/report.js:266:139 | field-editor-or-mode-dependent |
| src/report.js:330:606 | field-editor-or-mode-dependent |

실제 버튼 수와 고유 UI 구성요소 수는 이번 정적 조사로 확정하지 않았습니다. 전체 동적 수는 `미확인(null)`으로 두었습니다. 소스 읽기 도중 변경된 파일: 없음.

## 연결 업무와 기존 폼의 입력 보존

| 업무·자료 | 조회 값 정의 / 폼 입력 정의 | 기록 수정 경로 | 현재 상태 |
| --- | --- | --- | --- |
| 사업개요 / projectBasic | 20 / 24 | overview-basic-edit / openOverviewBasic | model-verified — 기간/층수 표시 2개는 각각 시작·종료/지상·지하로 나뉩니다. 추가 면적4필드 포함. Notion 출처4필드는 별도 읽기값입니다. |
| 주요 현안 / issue | 5 / 5 | issue-edit / 기존 issue-add 유지 | model-verified |
| 사업비 현재금액 / cbsCurrent / cbsBreakdownCurrent / cbsCompanyCurrent / cbsCompanySourceCurrent | None / None | 한 현재 금액당 기존 명시적 셀 수정 유지 | preserved — 원기록 선택·변경사유·계층에 따른 분기입니다. 3개 helper가 3개 화면 또는 3개 금액이라는 뜻이 아닙니다. |
| 사업비 표의 현재 면적 / areaCurrent | None / None | 기존 현재면적 셀/area-edit 폼 | preserved — 금액과 다른 원장 소비자이므로 금액행 1버튼 결정으로 임의 숨기지 않습니다. |
| 유사사업 비교 / benchmark | 7 / 14 | benchmark-edit / benchmarkForm | model-verified — 비교 포함 체크와 계산 증감·근거 조회는 별도입니다. |
| 대출 / loan | 12 / None | loan-edit / editLoan | model-verified-shared-cohort — 금융기관 상세 링크와 12개 읽기 속성, 행 수정1개. 실제 대출 건수와 별개입니다. |
| 출자자 / equities | 4 / 5 | financial-other-edit / editFinancialOther | model-verified-shared-cohort — 지분율은 계산값, 근거자료는 기존 폼에 포함됩니다. |
| 담보·신용보강·보증 / guarantees | 5 / 6 | financial-other-edit / editFinancialOther | model-verified-shared-cohort |
| 보고 보증기관 / guarantors | 4 / 6 | financial-other-edit / editFinancialOther | model-verified-shared-cohort |
| 계약 / contract | None / None | contract-edit / formContract | model-verified-shared-cohort — 목록·상세·지급·기성·VAT·배부는 연결 소비자이며 하나의 버튼 수로 합산하지 않습니다. |
| 문서 / document | None / 10 | document-edit / 기존 문서폼 | model-verified-shared-cohort — 제목과 문서번호/분류/발행일/발신/수신/경로/관련업무, 버전이력은 별도 읽기값입니다. |
| 부지확보 기본정보 / legalRecord land | 11 / None | 현재 11개 개별필드; 구역폼은 제안만 | proposal-only — 기존 legal.js forms에 land 종류가 없습니다. 버튼만 제거하면 수정 진입이 사라집니다. |
| 인허가 기록 / legalRecord permit | 5 / None | legal-edit / permitForm | frontend-final-pending — 추천·선택 2탭은 신규 항목 추가 업무이며 개별 상세4탭과 구별합니다. |
| 토지 필지 / legalRecord parcel | 4 / 5 | legal-edit / parcelForm | frontend-final-pending |
| 토지매매계약 / legalRecord landContract | 5 / 8 | legal-edit / landContractForm | frontend-final-pending — 연결 필지는 여러 체크박스여도 의미상 입력군1개입니다. 계약원장 연결·근거경로를 보존합니다. |
| 토지대금 지급회차 / legalRecord landPayment | 4 / 10 | legal-edit / landPaymentForm | frontend-final-pending — 자금구성·지급여부·실제일·근거경로까지 기존 폼을 사용합니다. |
| 분양·매각 / legalRecord sale | 7 / 8 | legal-edit / saleForm | frontend-final-pending |
| 착공·공사·준공 / construction / projectDates / progressAsOf | None / None | construction-input-open / construction-section-edit | existing-form-preserved — 최초 기재·조건부 날짜와 반복 공정률 이력을 구별합니다. |
| 보고서 작성본 / reportField / reportCell | None / None | report-edit-open / report-editor-toggle 및 기존 작성본 내부 편집 | existing-form-preserved — 모드·양식·반복행·동결본에 따라 필드가 달라 정적 호출2곳을 실제 셀2개로 세지 않습니다. |

위 `None`은 해당 항목을 이번 문서에서 고정 숫자로 집계하지 않았다는 뜻입니다. 실제 입력칸 0개 또는 기능 없음이라는 의미가 아닙니다. 토지계약의 연결 필지처럼 의미상 입력군 하나가 실제 여러 체크박스로 반복될 수 있습니다.

## 부지확보 11필드 구역폼은 제안만

src/permit-views.js land(p) basic 배열 및 cell(p,'land',...) → A.onInline('legalRecord') → p.land. src/legal.js의 forms는 permit/parcel/landContract/landPayment/sale이며 land 기본구역 폼은 없습니다.

| 원본 경로 | 이름 | 타입 |
| --- | --- | --- |
| land.agreementDate | 협약체결일 | date |
| land.agreementParties | 협약당사자 | text |
| land.spvType | 법인 유형 | text |
| land.spvName | 법인명 | text |
| land.spvDate | 법인 설립일 | date |
| land.acquisitionMethod | 토지 확보 방식 | text |
| land.purchaseRate | 매입률 (%) | number |
| land.titleSecured | 권원 확보 | existing yesNo choices |
| land.delay | 권원 지연 | existing yesNo choices |
| land.delayReason | 지연사유 | text |
| land.delayDetail | 지연내용 | text |

권장 진입은 **부지정보 수정** 하나이며, 11개 전체 필드를 같은 구역폼에서 다루는 안입니다. 이 담당자는 이 폼을 구현하지 않았습니다. 법인명·법인유형·법인설립일 또는 권원 지연사유·세부내용을 누락해서는 안 됩니다.

필지·토지계약·지급회차는 각각 독립 기록입니다. land.seller/purchasePrice/contractDate/balanceDate 등 기존 집계·호환자료를 이 11필드폼에 새 수기값으로 다시 만들지 않습니다. 사업개요 법인·개발업 법인 원장과 명칭이 비슷해도 확인 없이 같은 저장경계로 합치지 않습니다.

- src/permit-views.js 기본정보 조회·편집·감사이력
- src/legal.js 보고 발생기준의 협약일·특수목적법인 유형/설립일 참조
- src/legal.js 초기 호환 필지의 권원값 참조는 초기화 로직이며 현재 필지 원장에 일괄 재적용할 근거가 아님
- 보고서 저장본의 canonical 프로젝트는 보존하지만 이 11필드 모두가 출력 본문에 인쇄된다고 주장하지 않음
- 11개 입력 전체·미입력/0·비일자 원문·선택외 기존값 보존
- 기간/날짜/권원 상태 검증은 기존 정책 범위에서 수행
- 폼을 연 뒤 사업·역할·land 원문 변경 시 부분 저장·신규 생성 없이 차단
- 기존 필지·토지계약·지급회차·법인 원장·과거 저장본 불변
- 취소/X/Escape/저장실패 초안·실제 부모·작업 위치 보존

## 주요 현안·유사사업 후속 구현과 검증

수정 범위는 `src/recovery-views.js`의 issue 인접부분, `src/partners.js`의 benchmark 인접부분입니다. root의 사업개요 24필드와 공통 core, 업체 자동수집·댓글·외부자료 기능은 수정하지 않았습니다.

주요 현안은 행 수정 1개에서 기존 5필드를 함께 수정합니다. 유사사업은 행 수정 1개에서 기존 14필드를 모두 엽니다. 수정 대상이 사라지거나 교체·중복되거나 사업·권한이 바뀌면 새 기록으로 바꾸지 않고 저장을 차단합니다. 변경한 항목만 저장하므로 기존 비일자·0/null·비교 선택 해제·출처와 기타 원문을 보존합니다.

실패/취소 검사는 공통 `A.form`과 실제 현재 모듈을 주입한 순수 JS 모형에서 수행했습니다. DOM 입력 읽기만 현재 필드 HTML로 모의했으며, 기대 입력 이름과 원금액은 별도로 정의했습니다. 브라우저·네트워크·운영 DB는 사용하지 않았습니다.

- RED: .build/review131/record-editing-adjacent-red.json — 처음 실행에서 준비 오류인 registrationPanel 의존은 별도로 수정 후 재실행했습니다. 최종 RED는 행 수정 미존재·셀 중복, 유사사업의 선택/원자료/late-target 보존 실패를 확인했습니다. 새 issue-edit 진입이 없어서 이어지는 시나리오가 실행되지 않은 결과를 독립 저장결함 재현으로 세지 않습니다.
- GREEN: .build/review131/record-editing-adjacent-green.json — **29통과 / 0실패**. 취소 확인→계속 입력/변경 버림, 저장 실패→초안 보존→재시도 포함.
- 인접 회귀: 사업개요9·기록단위4·실자료 소비자6·v0105 공통 검사 및 3파일 구문검사 통과.

남은 기존 검사의 실패는 다음과 같이 분리합니다.

| 검사 | 결과 | 의미·후속 |
| --- | --- | --- |
| contracts-recovery | failed | 첫 검사에서 contract/loan/document/benchmark의 data-inline-entity를 모두 강제합니다. 최신 기록폼 채택과 충돌하는 이전 UI 단언. 업무 금액/기록 검사는 보존하며 root가 실제 행 진입 기준으로 갱신할 필요가 있습니다. 이 담당자는 소유범위 밖 파일을 바꾸지 않았습니다. |
| v0123-shared-copy | 7통과/1실패 | legal.js에 과거의 A.btn('경로 복사','path-copy',{path:row.evidencePath} 문자열 존재를 강제합니다. 이 담당자가 변경하지 않은 legal 영역의 정적 문구 검사. 실제 소비자 경로 대조와 root 판정 대기입니다. |


- 실제 검수 대기: 두 목록의 행 버튼·열폭·긴 문구·스크롤·포커스
- 실제 검수 대기: 기존 비일자 원문의 같은 필드 내 표시
- 실제 검수 대기: 취소/X/Escape와 저장실패 후 원래 화면 복귀
- 실제 검수 대기: 실제 서버 저장·재접속·역할 회수·최종 게시본

## 공식 근거 연결

공식 지침을 실제 채택 판단에 사용했으며 해당 제품의 디자인 시스템이나 라이브러리를 설치한 것은 아닙니다. 사업비 일괄 편집 예제 S05는 비교 후보로만 남고 실제 채택안은 기존 독립 저장을 유지합니다.

- **S01 [[Web] GOV.UK Summary list — Adding card actions](https://design-system.service.gov.uk/components/summary-list/)** — 여러 행의 수정이 같은 곳으로 이동하면 카드 헤더의 수정 하나로 줄일 수 있습니다. 사업개요·공사에서 같은 폼을 여는 반복행동 통합. 기록별로 다른 폼이면 그 기록 단위를 유지합니다.

- **S02 [[Web] Carbon Data table](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines)** — 표 전체 행동은 툴바, 특정 행의 행동은 해당 행, 여러 선택행의 행동은 묶음 행동으로 구분합니다. 사업비 수정 진입은 표 상단, 대출·계약 수정은 한 기록에 배치. Carbon의 아이콘 선택 자체를 한국어 명시버튼 요구 대신 적용하지 않습니다.

- **S03 [[Web] Carbon Modal](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines)** — 짧고 드문 업무에 대화창을 쓰며, 반복 업무는 본문을 고려합니다. 오류는 닫기 전에 표시하고 본문만 세로 스크롤하며 헤더·footer를 유지합니다. 조건+항목 선택은 하나의 대화창. 자주 입력하는 사업비는 본표 안에서 처리. 모든 페이지를 팝업으로 통일하지 않습니다.

- **S04 [[Web] AG Grid Full Row Editing](https://www.ag-grid.com/javascript-data-grid/cell-editing-full-row/)** — 한 행 전체가 같은 기록이라는 점을 명확히 하면서 함께 편집하는 실제 예제가 있습니다. 대출·계약의 관계있는 속성에 대한 기록 단위 모델의 근거입니다. AG Grid 설치나 라이선스 도입 제안은 아닙니다.

- **S05 [[Web] AG Grid Batch Editing](https://www.ag-grid.com/javascript-data-grid/cell-editing-batch/)** — 여러 셀·행의 보류값을 표시하고 한 번에 확정하거나 버리는 방식입니다. 사업비의 표 수정 모드를 선택할 때 저장 전 초안과 확정값의 경계를 명세할 근거입니다. 이 제품에 이미 같은 저장방식이 있다는 뜻은 아닙니다.

- **S06 [[Web] GOV.UK Table — Numbers in a table](https://design-system.service.gov.uk/components/table/)** — 열의 숫자를 비교할 때 오른쪽 정렬을 사용합니다. 원 단위 금액·면적·비율의 비교 정렬. 사업명·주소·상세문구까지 오른쪽 정렬하지 않습니다.

- **S07 [[Web] W3C WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)** — tablist/tab/tabpanel·선택상태·키보드 탐색을 정의하고, 지연이 있으면 수동 활성화를 사용할 수 있습니다. 2탭의 좌우/Home/End 초점 이동과 Enter/Space 활성화. 탭 전환은 서버 저장 명령으로 사용하지 않습니다.

- **S08 [[Web] GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/)** — 관련 구역을 나누고 이미 입력한 값을 유지하며, 변경 후 나머지 절차를 다시 반복하지 않고 검토 위치로 돌아옵니다. 조건→목록→조건 왕복, 기록폼 취소/오류/저장 후 원래 위치 복귀. 보고서의 실제 제출 완료를 수정 저장과 혼동하지 않습니다.

- **S09 [[Web] GOV.UK Text input](https://design-system.service.gov.uk/components/text-input/)** — 내용 길이에 맞는 입력폭과 지속적인 이름을 사용합니다. 정수·소수 입력 키패드, number형의 의도치 않은 증감 위험을 안내합니다. 층수는 짧게, 주소는 넓게, 단위는 명확하게. 기존 입력을 바꿀 때 검증과 금액 파서를 함께 검토합니다.

- **S10 [[Web] Carbon Form](https://www.carbondesignsystem.com/building-blocks/core/components/form/guidelines)** — 이름·입력칸의 세로 정렬, 관련 있는 2열의 동반 오류 확장, placeholder를 이름 대신 사용하지 않는 기준을 제시합니다. 현재 디자인의 정렬과 정보밀도를 유지하면서 오류가 있을 때 겹치지 않는 폼을 명세합니다.

## 읽은 소스 지문과 완료 경계

| 파일 | SHA-256 |
| --- | --- |
| README.md | 5825f483052b5d41d22eb8a63679d6a0f06b240caf1fd1d802656e3ff30feed3 |
| docs/UX-review-rules.md | a07ce544a51cf7a5b88dea578599971b0e7079f518948c5639b478efe83a05e7 |
| docs/component-review-matrix.json | 0b431e44fd161b2a8795ff39139b7e7a22702fca90ec270809375bced7e3786d |
| docs/review131-spec.md | 6f55787e0f18b029b94fbf509d4e63c23c74de1fdff6bc2f06a1abc1c668560d |
| src/cbs.js | 03d46577ae6e041e9ee2774fcc4bfa838aa85f2ba132c1666f706e8bc93c9552 |
| src/contracts.js | ceab80bb15df3df0898468f2c2b784150745f213f28a307dcf70e4af726b1658 |
| src/core.js | a704d74f7cf20f48121a8aa1126755b2ef14b9d746450b8b779707003db7346d |
| src/legal.js | 2671e4b5acde1f7c9e6791e173aca40b6c5a98eeb8d7fbf60b0a79de73c2a802 |
| src/partners.js | f2299de9b19dc588c7896c5e0708fe950c194de68cabef11ac9b20d02311ac84 |
| src/permit-map.js | e7726b5d932932fe7d80237ec75e0e7c66bc1cb5d9754b896496a3da84b2884d |
| src/permit-views.js | fc9a8d228905460c3525676f7f0e1605f8d551129ba3bb1550df931d25dbb0ce |
| src/recovery-views.js | d0d4f7acce3738ab228bbda2655da74bf0a0f593ef3b3911bbd61ad7b1cbf448 |
| src/report.js | 5c8c1f1c611af8ebe62b527a03ab987bdedd4b25d0b5ece883459094333f5f07 |
| tests/review131-record-editing-adjacent.mjs | e81ea26191fd24be03d3910f57a32d360668f7f6a21809093b474fe7ecf7fb63 |

이 문서는 채택 판단과 소스 분모를 기록했습니다. 실제 native 화면·서버 저장·재접속·최종 배포와 전체 플랫폼 검수는 아직 이 담당자의 완료 범위가 아닙니다. 구현 담당자의 최종 지문 및 실제 검수 결과를 추가해야 합니다.

현재 상태 마감: frontend 최종 소스와 실제 화면·서버 검수는 통합 담당자 확인 대기입니다.
