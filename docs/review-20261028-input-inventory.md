# 전체 활성 입력 자료형 인벤토리 — REVIEW129

관련 요구: FORM129-06 / RPT129-04 / UX129-07. 소스40개·선언 UI모듈35개를 확인했습니다. **680개는 호출·스키마·HTML·생성기 후보수**이며 고유 입력/전체 실행 통과수가 아닙니다.

## 분모와 경계

- field-call: 402개
- declarative-field-default-candidate: 38개
- inline-editable-call: 14개
- html-control-candidate: 47개
- inline-wrapper-call: 69개
- declarative-field-candidate: 110개

조건·매개변수 활성 소스 인스턴스 36개, 논리OR 기본값 소비자 135개를 업무 가족과 신규/기존수정/새버전 경계로 대조했습니다. 같은 실제 입력의 여러 소비자가 포함되며 이름만으로 다른 레코드를 합치지 않습니다.

원자료 값·실제 이메일·로컬 비공개 경로를 포함하지 않습니다. 정적 단어 경고는 오류가 아니며 저장 콜백과 위젯을 구별합니다. 선행0·미입력/0·현재/과거본의 뜻을 유지합니다.

## 조건·동적 가족

| 가족 | 의미 | 도구 | 보존·예외 |
|---|---|---|---|
| cost-structured-money | 원금액·변경사유/표준비용유형/기존입력 선택과 금액 | money, money-reason, typed-money, record-money | 선택ID와 금액은 별개. 임의 배분/코드 생성 금지 |
| core-native-and-inline | 공통 필드/같은셀 도구 | text, number, date, month, select, email, tel, textarea, money | 비일자 과거원문 text보존·빈값/0·기존옵션 보존 |
| auth-address-password-otp | 인증주소·비밀번호·인증번호·로그인 상태 | email, password, text, checkbox | 인증번호는 길이와 선행0을 가진 식별문자 |
| finance-contract-document | 금리·금액·계약/문서·원문조건 | number, money, date, select, text, textarea | 금리/ALL-IN·원금액·식별번호·복수 수수료조건을 구별 |
| legal-date-or-retained-text | 유효 ISO일자/공란 또는 기존 비일자 원문 | date, text | 해당없음·잘못된 과거일자를 공란으로 소거하지 않음 |
| legal-defined-controls | 법인·전문인력·토지·공사·매각 정의 | date, number, select, text, textarea, tel, email | 예/아니오·미실행·해당없음을 임의 병합하지 않음 |
| legal-record-inline | 정확한 원장 레코드의 필드 | date, number, money, select, text | 다른 ID/다른 원장의 값으로 바꾸지 않음 |
| permit-conditions-and-recommendation | 규모·지역·조건·예정일 | number, date, select, text | 추천과 실제 판단·미확인과 아니오를 구별 |
| partner-profile-benchmark | 업체·관계·참여·금액/면적·원문기준 | text, number, money, date, select, email, tel, textarea | 측정기준/포함범위는 원문. 기존빈상태를 신규기본값으로 바꾸지 않음 |
| market-period-token | 월별 또는 연도/분기 기간토큰 | month, text | 월간과 연/분기 문자를 같은 일자로 강제하지 않음 |
| project-defined-controls | 사업 개요·기간·면적·복합층수 | text, date, number | 지상/지하 합성층수와 개별 층수수치 구별 |
| issue-defined-controls | 현안의 날짜·원가영향·원문 | date, money, text | 설명과 금액/일자 구별 |
| report-cell-literal-or-scalar | 단일 평문값 또는 법정서식 문구/체크칸 | date, number, email, tel, text, textarea | 합성문구·복수체크·비표준원문은 무조건 전역 분해하지 않음 |
| report-participant-schema | 시공사·신탁사·보증기관 정의 | text, date, number, select | 미변경 legacy의 원타입 보존, 새 입력 검증 |
| report-plan-schema | 명시 계획의 날짜·원문·면적/수량 | text, date, number | 공란/0·현재/확정본 구별 |
| report-field-schema | 보고 기본정보·서명·기준·날짜/수치/선택 | text, date, month, number, select, email, tel, textarea | 보고서전용과 공유 원장 구별, 동일값 허위변경 금지 |
| project-registration-source-review | 기본항목7개의 문자/규모와 원자료 검토 | text, number, date, select | 현재 등록항목의 값은 text/number. 자료기준일과 자료값을 구별 |
| vat-budget-evidence-version | 원금액/세액·분자분모·세무선택과 새 버전 | number, date, select, text, textarea | 기존 계약일 편집과 새 VAT/면적 버전의 기준일은 별개 |
| explicit-module-schema | 해당 모듈 명시 정의 | 해당 정의 | 소스검토와 모든 동적 실행을 구별 |
| inactive | 현재 UI모듈에 포함되지 않은 보존 코드 | 해당 없음 | 현재 UI통과 분모에서 제외 |

## 수동 대조 결과

- 사업비 항목 검색: 금액이 아닌 검색어, text/search 유지
- 금리·이자지급 조건/그밖의 수수료: 복수 계약조건 원문, 단일 금리/금액과 구별
- 면적 변경 검토 내용/면적 기준: 설명·측정 기준이므로 수치 자체가 아님
- 복합층수: 지상/지하 합성문자와 개별 층수수치를 구별
- 연락처 유형: 연락처 값이 아닌 종류 선택
- areaFields7개 두원소 선언: 소비자가 number/㎡ 명시, text-default 오탐 배제
- 전문인력/인허가 날짜 두원소 선언: 날짜/기존 비일자 원문에 따라 date/text
- 법정서식 체크칸/합성날짜/고정문구: 서식문자 편집과 단일 원장값을 구별

## 소스검토와 별도인 실행

보고서 집중30단언, 승인 A/B/C DB의 스칼라672·서식모델774·독립 원가트리/총액39를 별도 증거에서 실행했습니다. 아래 후보 전체의 실제 클릭/API/출력 통과를 뜻하지 않습니다. 동적 조합·실제 회원·과거 보관본·예약은 담당 검수와 구별합니다.

## 행별 자료형·소유 경계

| ID | 위치 | 역할 | 키·레이블 | 선언/조건 | 기대 자료 | 처리 | 실행 |
|---|---|---|---|---|---|---|---|
| INPUT129-00001 | src/cbs-purpose.js:49 | field-call | target / 분류할 항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00002 | src/cbs-purpose.js:49 | field-call | category / 대분류 * | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00003 | src/cbs-purpose.js:49 | field-call | name / 원가항목명 * | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00004 | src/cbs-purpose.js:49 | field-call | evidence / 분류 근거 경로 * | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00005 | src/cbs.js:421 | field-call | key / label+' · ㎡' | number | numeric | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00006 | src/cbs.js:421 | field-call | date / 면적 기준일 | date | date | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00007 | src/cbs.js:421 | field-call | status / 자료 상태 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00008 | src/cbs.js:421 | field-call | source / 면적 근거 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00009 | src/cbs.js:426 | field-call | 'area_'+key / label+' · ㎡' | number | numeric | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00010 | src/cbs.js:426 | field-call | 'area_'+key / label+' · ㎡' | number | numeric | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00011 | src/cbs.js:426 | field-call | areaDate / 면적 기준일 | date | date | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00012 | src/cbs.js:426 | field-call | areaSource / 면적 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00013 | src/cbs.js:427 | field-call | reportedTotal / 원자료에 적힌 총액 · 원, 선택 | number | numeric | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00014 | src/cbs.js:434 | field-call | 'reason_'+i / x.name+' · '+deltaText(x.delta) | textarea | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00015 | src/cbs.js:440 | field-call | kind / 시점 종류 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00016 | src/cbs.js:440 | field-call | label / 시점명 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00017 | src/cbs.js:440 | field-call | date / 기준일 | date | date | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00018 | src/cbs.js:440 | field-call | source / 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00019 | src/cbs.js:440 | field-call | capture / 금액 입력 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00020 | src/cbs.js:440 | field-call | detailLevel / 입력항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00021 | src/cbs.js:522 | field-call | preset / 추가할 항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00022 | src/cbs.js:522 | field-call | parent / 대분류 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00023 | src/cbs.js:522 | field-call | name / 항목명 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00024 | src/cbs.js:522 | field-call | amount / 현재 금액 · 원, 미입력 가능 | number | numeric-money | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00025 | src/cbs.js:522 | field-call | preset / 추가할 항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00026 | src/cbs.js:522 | field-call | parent / 대분류 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00027 | src/cbs.js:522 | field-call | name / 항목명 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00028 | src/cbs.js:522 | field-call | amount / 현재 금액 · 원, 미입력 가능 | number | numeric-money | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00029 | src/cbs.js:524 | field-call | costTypeId / 비용 항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00030 | src/cbs.js:524 | field-call | parent / 대분류 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00031 | src/cbs.js:524 | field-call | name / 계약·세부내역명 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00032 | src/cbs.js:524 | field-call | amount / 현재 금액 · 원, 미입력 가능 | number | numeric-money | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00033 | src/cbs.js:538 | field-call | costTypeId / 비용 항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00034 | src/cbs.js:539 | field-call | name / 명칭 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00035 | src/cbs.js:541 | field-call | name / 새 세분류 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00036 | src/cbs.js:541 | field-call | amount / 분해 금액 · 원 | number | numeric-money | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00037 | src/cbs.js:544 | field-call | to / 합칠 항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00038 | src/cbs.js:549 | field-call | from / 보내는 실제 입력행 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00039 | src/cbs.js:549 | field-call | to / 받는 실제 입력행 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00040 | src/cbs.js:549 | field-call | amount / 금액 · 원 | number | numeric-money | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00041 | src/cbs.js:549 | field-call | date / 발생일 | date | date | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00042 | src/cbs.js:549 | field-call | reason / 사용·환원 사유 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00043 | src/cbs.js:549 | field-call | source / 근거문서 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00044 | src/cbs.js:136 | declarative-field-default-candidate | gfaTotal / 전체 연면적 | number | numeric-quantity | schema-definition-consumer-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00045 | src/cbs.js:136 | declarative-field-default-candidate | acquisitionLandArea / 취득대상 토지면적 | number | numeric-quantity | schema-definition-consumer-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00046 | src/cbs.js:136 | declarative-field-default-candidate | siteArea / 법정 대지면적 | number | numeric-quantity | schema-definition-consumer-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00047 | src/cbs.js:136 | declarative-field-default-candidate | gfaAbove / 지상 연면적 | number | numeric-quantity | schema-definition-consumer-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00048 | src/cbs.js:136 | declarative-field-default-candidate | gfaBelow / 지하 연면적 | number | numeric-quantity | schema-definition-consumer-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00049 | src/cbs.js:136 | declarative-field-default-candidate | farArea / 용적률 산정 연면적 | number | numeric-quantity | schema-definition-consumer-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00050 | src/cbs.js:136 | declarative-field-default-candidate | buildingArea / 건축면적 | number | numeric-quantity | schema-definition-consumer-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00051 | src/cbs.js:268 | inline-editable-call | current / row.name+' 현재 사업비 · 원' | detail?'money-reason':'money' | unresolved | parameterized-or-conditional-family-reviewed / cost-structured-money | 별도 증거 |
| INPUT129-00052 | src/cbs.js:269 | inline-editable-call | current / row.name+' 현재 사업비 · 원' | multiple?'typed-money':'money' | unresolved | parameterized-or-conditional-family-reviewed / cost-structured-money | 별도 증거 |
| INPUT129-00053 | src/cbs.js:271 | inline-editable-call | current / row.name+' 기존 입력 금액 · 원' | record-money | unresolved | reusable-inline-constructor-reviewed / cost-structured-money | 별도 증거 |
| INPUT129-00054 | src/cbs.js:406 | inline-editable-call | key / label | number | numeric | reusable-inline-constructor-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00055 | src/cbs.js:414 | html-control-candidate | costSearch / 동적 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00056 | src/cbs.js:414 | html-control-candidate | cbs-compare-basis / 동적 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00057 | src/cbs.js:425 | html-control-candidate | phaseAmount_ / 동적 | number | numeric-money | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00058 | src/cbs.js:498 | html-control-candidate | costCatalogSearch / 사업비 항목 검색 | text | search-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00059 | src/cbs.js:524 | html-control-candidate | costTypeId / 동적 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00060 | src/cloud-session.js:20 | html-control-candidate | ${A.esc(name)} / 동적 | validated auth field type | unresolved | parameterized-or-conditional-family-reviewed / auth-address-password-otp | 별도 증거 |
| INPUT129-00061 | src/cloud-session.js:21 | html-control-candidate | ${A.esc(name)} / 동적 | password | text | concrete-call-purpose-reviewed / auth-address-password-otp | 별도 증거 |
| INPUT129-00062 | src/cloud-session.js:29 | html-control-candidate | loginRemember / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / auth-address-password-otp | 별도 증거 |
| INPUT129-00063 | src/contracts.js:146 | field-call | name / 계약명 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00064 | src/contracts.js:146 | field-call | counterparty / 상대방 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00065 | src/contracts.js:146 | field-call | date / 계약일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00066 | src/contracts.js:146 | field-call | total / 계약금액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00067 | src/contracts.js:146 | field-call | file / 계약 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00068 | src/contracts.js:147 | field-call | name / 계약명 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00069 | src/contracts.js:147 | field-call | counterparty / 계약 상대방 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00070 | src/contracts.js:147 | field-call | companyId / 시공사·협력사 연결 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00071 | src/contracts.js:147 | field-call | type / 계약 유형 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00072 | src/contracts.js:147 | field-call | date / 계약일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00073 | src/contracts.js:147 | field-call | period / 계약기간 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00074 | src/contracts.js:147 | field-call | file / 계약 원본·공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00075 | src/contracts.js:147 | field-call | proposalNumber / 기안번호 (선택) | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00076 | src/contracts.js:147 | field-call | status / 계약 상태 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00077 | src/contracts.js:147 | field-call | total / 계약 총액 (원) | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00078 | src/contracts.js:147 | field-call | net / 공급가액 (원, 확인 시 입력) | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00079 | src/contracts.js:147 | field-call | vat / 부가세 (원, 면세는 0) | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00080 | src/contracts.js:147 | field-call | costAmount / 사업비 반영액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00081 | src/contracts.js:147 | field-call | note / 변경 내용·메모 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00082 | src/contracts.js:200 | field-call | cbsId / CBS 항목 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00083 | src/contracts.js:200 | field-call | amount / 배부액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00084 | src/contracts.js:211 | field-call | prefix + 'cbs' + i / 'CBS 배부 ' + (i + 1) | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00085 | src/contracts.js:211 | field-call | prefix + 'amount' + i / '배부 ' + (i + 1) + ' 금액 (원)' | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00086 | src/contracts.js:216 | field-call | prefix+'cbs'+i / 'CBS 배부 '+(i+1) | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00087 | src/contracts.js:216 | field-call | prefix+'amount'+i / '배부 '+(i+1)+' 금액 (원)' | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00088 | src/contracts.js:256 | field-call | date / 지급일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00089 | src/contracts.js:256 | field-call | amount / 지급액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00090 | src/contracts.js:256 | field-call | sourcePath / 지급 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00091 | src/contracts.js:256 | field-call | obligationId / 연결 확정조건 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00092 | src/contracts.js:256 | field-call | proposalNumber / 기안번호 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00093 | src/contracts.js:256 | field-call | costAmount / 사업비 반영액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00094 | src/contracts.js:256 | field-call | note / 메모 | textarea | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00095 | src/contracts.js:259 | field-call | obligationId / 확정 지급조건 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00096 | src/contracts.js:260 | field-call | asOf / 확인 기준일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00097 | src/contracts.js:260 | field-call | sourcePath / 대사 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00098 | src/contracts.js:263 | field-call | date / 기성 인정일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00099 | src/contracts.js:263 | field-call | amount / 기성 인정액 (사업비 기준, 원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00100 | src/contracts.js:263 | field-call | sourcePath / 기성 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00101 | src/contracts.js:263 | field-call | note / 메모 | textarea | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00102 | src/contracts.js:363 | field-call | revision / 버전 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00103 | src/contracts.js:363 | field-call | date / 발행일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00104 | src/contracts.js:363 | field-call | location / 원본 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00105 | src/contracts.js:373 | field-call | title / 문서명 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00106 | src/contracts.js:373 | field-call | category / 분류 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00107 | src/contracts.js:373 | field-call | number / 문서번호 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00108 | src/contracts.js:373 | field-call | revision / 개정차수 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00109 | src/contracts.js:373 | field-call | date / 작성일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00110 | src/contracts.js:373 | field-call | status / 상태 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00111 | src/contracts.js:373 | field-call | location / 공용폴더·원본 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00112 | src/contracts.js:373 | field-call | related / 관련 내용 | text | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00113 | src/contracts.js:373 | field-call | issuer / 발신자 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00114 | src/contracts.js:373 | field-call | recipient / 수신자 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00115 | src/contracts.js:385 | field-call | institution / 금융기관 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00116 | src/contracts.js:385 | field-call | type / 금융 유형 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00117 | src/contracts.js:385 | field-call | rank / 상환순위 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00118 | src/contracts.js:385 | field-call | commitment / 약정액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00119 | src/contracts.js:385 | field-call | executed / 누적 실행액 (원) | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00120 | src/contracts.js:385 | field-call | balance / 대출잔액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00121 | src/contracts.js:385 | field-call | interestRate / 금리 (연 %) | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00122 | src/contracts.js:385 | field-call | upfrontFeeRate / 선취·취급 수수료 (%) | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00123 | src/contracts.js:385 | field-call | advisoryFeeRate / 금융자문 수수료 (%) | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00124 | src/contracts.js:385 | field-call | allIn / ALL-IN (연 %) | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00125 | src/contracts.js:385 | field-call | allInAdvisoryBasis / ALL-IN 기준 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00126 | src/contracts.js:385 | field-call | ltv / LTV (%) | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00127 | src/contracts.js:385 | field-call | ltc / LTC (%) | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00128 | src/contracts.js:385 | field-call | interestTerms / 금리·이자지급 조건 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00129 | src/contracts.js:385 | field-call | otherFees / 그 밖의 수수료 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00130 | src/contracts.js:385 | field-call | start / 약정 시작일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00131 | src/contracts.js:385 | field-call | maturity / 최종 만기일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00132 | src/contracts.js:385 | field-call | repaymentTerms / 상환 조건 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00133 | src/contracts.js:385 | field-call | collateral / 담보·신용보강 | textarea | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00134 | src/contracts.js:385 | field-call | note / 변경 사유 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00135 | src/contracts.js:433 | field-call | institution / 양수 금융기관 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00136 | src/contracts.js:433 | field-call | date / 양도 기준일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00137 | src/contracts.js:433 | field-call | commitment / 이전 약정액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00138 | src/contracts.js:433 | field-call | executed / 이전 누적 실행액 (원) | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00139 | src/contracts.js:433 | field-call | balance / 이전 대출잔액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00140 | src/contracts.js:433 | field-call | note / 비고 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00141 | src/contracts.js:446 | field-call | asOf / 분기 기준일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00142 | src/contracts.js:446 | field-call | commitment / 약정액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00143 | src/contracts.js:446 | field-call | executed / 누적 실행액 (원) | number | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00144 | src/contracts.js:446 | field-call | balance / 잔액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00145 | src/contracts.js:542 | field-call | company / 출자자 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00146 | src/contracts.js:542 | field-call | registration / 사업자·법인 등록번호 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00147 | src/contracts.js:542 | field-call | amount / 출자금액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00148 | src/contracts.js:542 | field-call | purpose / 출자 목적·역할 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00149 | src/contracts.js:542 | field-call | sourcePath / 근거자료 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00150 | src/contracts.js:542 | field-call | name / 보고 대상 보증기관 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00151 | src/contracts.js:542 | field-call | type / 보증 유형 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00152 | src/contracts.js:542 | field-call | amount / 보증금액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00153 | src/contracts.js:542 | field-call | scope / 보증 범위 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00154 | src/contracts.js:542 | field-call | otherType / 기타 유형 상세 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00155 | src/contracts.js:542 | field-call | sourcePath / 근거자료 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00156 | src/contracts.js:542 | field-call | category / 담보·신용보강 구분 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00157 | src/contracts.js:542 | field-call | provider / 제공자 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00158 | src/contracts.js:542 | field-call | amount / 담보·보증금액 (원) | number | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00159 | src/contracts.js:542 | field-call | detail / 조건·범위 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00160 | src/contracts.js:542 | field-call | expiry / 만료일 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00161 | src/contracts.js:542 | field-call | sourcePath / 근거자료 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00162 | src/contracts.js:140 | inline-editable-call | field / label | type==='percent'?'number':type | unresolved | parameterized-or-conditional-family-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00163 | src/contracts.js:189 | inline-wrapper-call | period / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00164 | src/contracts.js:189 | inline-wrapper-call | date / 동적 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00165 | src/contracts.js:189 | inline-wrapper-call | net / 동적 | money | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00166 | src/contracts.js:189 | inline-wrapper-call | vat / 동적 | money | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00167 | src/contracts.js:189 | inline-wrapper-call | total / 동적 | money | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00168 | src/contracts.js:189 | inline-wrapper-call | costAmount / 동적 | money | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00169 | src/contracts.js:189 | inline-wrapper-call | proposalNumber / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00170 | src/contracts.js:189 | inline-wrapper-call | companyId / 동적 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00171 | src/contracts.js:195 | inline-wrapper-call | file / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00172 | src/contracts.js:348 | inline-wrapper-call | counterparty / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00173 | src/contracts.js:348 | inline-wrapper-call | date / 동적 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00174 | src/contracts.js:348 | inline-wrapper-call | total / 동적 | money | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00175 | src/contracts.js:351 | inline-wrapper-call | title / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00176 | src/contracts.js:351 | inline-wrapper-call | number / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00177 | src/contracts.js:351 | inline-wrapper-call | category / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00178 | src/contracts.js:351 | inline-wrapper-call | date / 동적 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00179 | src/contracts.js:351 | inline-wrapper-call | issuer / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00180 | src/contracts.js:351 | inline-wrapper-call | recipient / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00181 | src/contracts.js:351 | inline-wrapper-call | location / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00182 | src/contracts.js:351 | inline-wrapper-call | related / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00183 | src/contracts.js:561 | inline-wrapper-call | company / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00184 | src/contracts.js:561 | inline-wrapper-call | registration / 동적 | text | identifier-or-path-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00185 | src/contracts.js:561 | inline-wrapper-call | amount / 동적 | money | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00186 | src/contracts.js:561 | inline-wrapper-call | purpose / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00187 | src/contracts.js:561 | inline-wrapper-call | category / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00188 | src/contracts.js:561 | inline-wrapper-call | provider / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00189 | src/contracts.js:561 | inline-wrapper-call | amount / 동적 | money | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00190 | src/contracts.js:561 | inline-wrapper-call | detail / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00191 | src/contracts.js:561 | inline-wrapper-call | expiry / 동적 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00192 | src/contracts.js:561 | inline-wrapper-call | name / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00193 | src/contracts.js:561 | inline-wrapper-call | type / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00194 | src/contracts.js:561 | inline-wrapper-call | amount / 동적 | money | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00195 | src/contracts.js:561 | inline-wrapper-call | scope / 동적 | text | text | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00196 | src/contracts.js:567 | inline-wrapper-call | rank / 동적 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00197 | src/contracts.js:567 | inline-wrapper-call | type / 동적 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00198 | src/contracts.js:567 | inline-wrapper-call | commitment / 동적 | money | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00199 | src/contracts.js:567 | inline-wrapper-call | executed / 동적 | money | numeric | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00200 | src/contracts.js:567 | inline-wrapper-call | balance / 동적 | money | numeric-money | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00201 | src/contracts.js:567 | inline-wrapper-call | interestRate / 동적 | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00202 | src/contracts.js:567 | inline-wrapper-call | upfrontFeeRate / 동적 | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00203 | src/contracts.js:567 | inline-wrapper-call | advisoryFeeRate / 동적 | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00204 | src/contracts.js:567 | inline-wrapper-call | allIn / 동적 | number | numeric-ratio | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00205 | src/contracts.js:567 | inline-wrapper-call | allInAdvisoryBasis / 동적 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00206 | src/contracts.js:567 | inline-wrapper-call | start / 동적 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00207 | src/contracts.js:567 | inline-wrapper-call | maturity / 동적 | date | date | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00208 | src/contracts.js:347 | html-control-candidate | librarySearch / 계약·문서 검색 | text | search-string | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00209 | src/contracts.js:347 | html-control-candidate | libraryKind / 계약·문서 구분 | select | selection | concrete-call-purpose-reviewed / finance-contract-document | 별도 증거 |
| INPUT129-00210 | src/core.js:265 | html-control-candidate | ${esc(name)} / 동적 | textarea | text | concrete-call-purpose-reviewed / core-native-and-inline | 별도 증거 |
| INPUT129-00211 | src/core.js:265 | html-control-candidate | ${esc(name)} / 동적 | select | selection | concrete-call-purpose-reviewed / core-native-and-inline | 별도 증거 |
| INPUT129-00212 | src/core.js:265 | html-control-candidate | ${esc(name)} / 동적 | nativeFieldType(type,value) | unresolved | parameterized-or-conditional-family-reviewed / core-native-and-inline | 별도 증거 |
| INPUT129-00213 | src/core.js:307 | html-control-candidate | 동적 / 동적 | textarea | text | concrete-call-purpose-reviewed / core-native-and-inline | 별도 증거 |
| INPUT129-00214 | src/core.js:341 | html-control-candidate | project-select / 프로젝트 | select | selection | concrete-call-purpose-reviewed / core-native-and-inline | 별도 증거 |
| INPUT129-00215 | src/cost-asset-presets.js:88 | html-control-candidate | presetCostTarget / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00216 | src/cost-asset-presets.js:88 | html-control-candidate | 동적 / 동적 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00217 | src/cost-breakdown.js:50 | field-call | ...args / 동적 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00218 | src/cost-breakdown.js:66 | field-call | sourcePath / 근거 경로 · 선택 | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00219 | src/cost-breakdown.js:72 | field-call | amount / 현재 금액 · 원, 미입력 가능 | number | numeric-money | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00220 | src/cost-breakdown.js:72 | field-call | reason / 세부 사유 · 선택 | text | narrative-or-basis-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00221 | src/cost-breakdown.js:72 | field-call | sourcePath / 근거 경로 · 선택 | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00222 | src/cost-breakdown.js:80 | field-call | owner / 현재 입력 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00223 | src/cost-breakdown.js:89 | field-call | sourcePath / 근거 경로 · 선택 | text | identifier-or-path-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00224 | src/cost-breakdown.js:66 | html-control-candidate | breakdownItems / 동적 | hidden | text | nonhuman-protocol-control / explicit-module-schema | 별도 증거 |
| INPUT129-00225 | src/cost-breakdown.js:66 | html-control-candidate | confirmed / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00226 | src/cost-breakdown.js:77 | html-control-candidate | cost-breakdown-search / 비용 항목 검색 | text | search-string | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00227 | src/cost-order.js:173 | field-call | costMoveTypeId / 비용 항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00228 | src/cost-order.js:190 | field-call | costMoveOwner / 이동할 관리항목 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00229 | src/cost-snapshots.js:89 | html-control-candidate | snapshot- / 동적 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00230 | src/law-monitor.js:82 | field-call | projectId / 프로젝트 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00231 | src/law-monitor.js:82 | field-call | target / 조회 종류 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00232 | src/law-monitor.js:82 | field-call | query / 법령·조례명 | text | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00233 | src/law-monitor.js:26 | html-control-candidate | lawSiteTarget / 동적 | select | selection | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00234 | src/law-monitor.js:26 | html-control-candidate | lawSiteQuery / 동적 | search | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00235 | src/legal.js:16 | field-call | name / label | type | unresolved | parameterized-or-conditional-family-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00236 | src/legal.js:59 | field-call | key / label | !text(row?.[key])//isDate(row[key])?'date':'text' | unresolved | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00237 | src/legal.js:337 | field-call | kind / 기록 유형 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00238 | src/legal.js:337 | field-call | period / 보고 대상기간 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00239 | src/legal.js:337 | field-call | date / 기록일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00240 | src/legal.js:337 | field-call | due / 신고기한 | date | date | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00241 | src/legal.js:337 | field-call | submitted / 제출일 | date | date | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00242 | src/legal.js:337 | field-call | reviewer / 담당자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00243 | src/legal.js:337 | field-call | detail / 기록 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00244 | src/legal.js:337 | field-call | sourcePath / 제출본·접수 또는 검토 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00245 | src/legal.js:347 | field-call | name / 법인·시행주체 명칭 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00246 | src/legal.js:347 | field-call | legalForm / 실제 법적 형태 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00247 | src/legal.js:347 | field-call | businessRegistration / 사업자등록번호 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00248 | src/legal.js:347 | field-call | corporationRegistration / 법인등록번호 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00249 | src/legal.js:347 | field-call | permitHolder / 이 프로젝트의 인허가 명의자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00250 | src/legal.js:347 | field-call | supplyEntity / 이 프로젝트의 개발·공급 주체 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00251 | src/legal.js:347 | field-call | identityState / 정보 확인 상태 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00252 | src/legal.js:347 | field-call | identityNote / 미확인 사유·확인 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00253 | src/legal.js:347 | field-call | identitySourcePath / 식별정보 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00254 | src/legal.js:349 | field-call | entityId / 시행 법인 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00255 | src/legal.js:349 | field-call | newName / 새 법인으로 연결할 경우 법인명 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00256 | src/legal.js:353 | field-call | company / 소속회사 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00257 | src/legal.js:358 | field-call | manager / 자산관리회사 등 상호 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00258 | src/legal.js:358 | field-call | managerOffice / 자산관리회사 등 소재지 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00259 | src/legal.js:358 | field-call | managerPhone / 자산관리회사 등 전화번호 | text | telephone-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00260 | src/legal.js:358 | field-call | contractPath / 업무위탁계약 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00261 | src/legal.js:362 | field-call | representativeName / 대표자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00262 | src/legal.js:362 | field-call | legalForm / 법적 형태 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00263 | src/legal.js:362 | field-call | businessRegistration / 사업자등록번호 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00264 | src/legal.js:362 | field-call | corporationRegistration / 법인등록번호 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00265 | src/legal.js:362 | field-call | office / 사무실 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00266 | src/legal.js:362 | field-call | phone / 연락처 | text | telephone-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00267 | src/legal.js:362 | field-call | route / 등록 구분 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00268 | src/legal.js:362 | field-call | agencyContactName / 기관 담당자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00269 | src/legal.js:362 | field-call | agencyContactPhone / 기관 담당자 연락처 | text | telephone-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00270 | src/legal.js:362 | field-call | lastChangeReportDate / 최근 변경신고 제출일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00271 | src/legal.js:362 | field-call | capital / 자본금 또는 영업용자산(원) | number | numeric | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00272 | src/legal.js:362 | field-call | professionals / 전문인력 등록 인원(수동) | number | numeric | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00273 | src/legal.js:373 | field-call | supply / 타인에게 판매·임대 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00274 | src/legal.js:374 | field-call | developmentType / 개발 구분 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00275 | src/legal.js:375 | field-call | mixed / 주거·비주거 복합 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00276 | src/legal.js:376 | field-call | nonResidentialArea / 현재 비주거 연면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00277 | src/legal.js:377 | field-call | exemption / 등록 예외 검토 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00278 | src/legal.js:378 | field-call | exemptionBasis / 예외 근거 조문 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00279 | src/legal.js:379 | field-call | status / 검토 상태 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00280 | src/legal.js:380 | field-call | reviewer / 검토 담당자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00281 | src/legal.js:380 | field-call | evidencePath / 검토 근거 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00282 | src/legal.js:380 | field-call | note / 검토 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00283 | src/legal.js:387 | field-call | kind / 변경 유형 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00284 | src/legal.js:387 | field-call | date / 변경 발생일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00285 | src/legal.js:387 | field-call | reportingDue / 순자산·영업용자산: 기준연도 검토 후 2월 말 기한 | date | date | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00286 | src/legal.js:387 | field-call | submitted / 신고 제출일 | date | date | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00287 | src/legal.js:387 | field-call | detail / 변경 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00288 | src/legal.js:387 | field-call | sourcePath / 근거 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00289 | src/legal.js:388 | field-call | scheme / 근거 사업 유형 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00290 | src/legal.js:388 | field-call | buildingUse / 일반 건축사업 용도 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00291 | src/legal.js:388 | field-call | agreementDate / 협약 체결일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00292 | src/legal.js:388 | field-call | landPurchaseDate / 최초 토지 매수일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00293 | src/legal.js:388 | field-call | spcEligible / 법정 대상 특수목적법인 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00294 | src/legal.js:388 | field-call | spcEstablished / 대상 특수목적법인 설립일 | date | date | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00295 | src/legal.js:388 | field-call | approvalDate / 최초 인가·허가일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00296 | src/legal.js:388 | field-call | designationDate / 시행자 지정 고시·통지일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00297 | src/legal.js:388 | field-call | reviewStatus / 적용 검토 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00298 | src/legal.js:388 | field-call | reviewer / 검토 담당자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00299 | src/legal.js:388 | field-call | sourcePath / 검토 근거 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00300 | src/legal.js:429 | field-call | asset / 사업 유형 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00301 | src/legal.js:429 | field-call | method / 사업방식 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00302 | src/legal.js:431 | field-call | area / 토지면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00303 | src/legal.js:431 | field-call | owner / 소유자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00304 | src/legal.js:431 | field-call | right / 권원 확보 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00305 | src/legal.js:431 | field-call | sourcePath / 토지 근거 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00306 | src/legal.js:432 | field-call | amount / 매매대금(원) | number | numeric-money | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00307 | src/legal.js:432 | field-call | contractDate / 계약체결일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00308 | src/legal.js:432 | field-call | balanceDate / 잔금지급 예정일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00309 | src/legal.js:432 | field-call | sourceContractId / 계약원장 연결 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00310 | src/legal.js:432 | field-call | sourcePath / 계약서 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00311 | src/legal.js:433 | field-call | amount / 지급회차 금액(원) | number | numeric-money | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00312 | src/legal.js:433 | field-call | fundingState / 자금구성 기준 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00313 | src/legal.js:433 | field-call | plannedDate / 계획 지급일 | date | date | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00314 | src/legal.js:433 | field-call | paid / 지급 여부 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00315 | src/legal.js:433 | field-call | sourcePath / 근거 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00316 | src/legal.js:435 | field-call | unit / 집계 단위 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00317 | src/legal.js:435 | field-call | total / 전체 수량 | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00318 | src/legal.js:435 | field-call | planned / 매각 계획 수량 | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00319 | src/legal.js:435 | field-call | completed / 매각 완료 수량 | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00320 | src/legal.js:435 | field-call | start / 매각·분양 개시일 | date | date | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00321 | src/legal.js:435 | field-call | amount / 누적 매각금액(원) | number | numeric-money | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00322 | src/legal.js:435 | field-call | sourcePath / 근거 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00323 | src/legal.js:474 | field-call | status / 검토 상태 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00324 | src/legal.js:474 | field-call | reviewer / 검토자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00325 | src/legal.js:474 | field-call | note / 검토 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00326 | src/legal.js:483 | field-call | status / 검토 상태 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00327 | src/legal.js:483 | field-call | reviewer / 검토자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00328 | src/legal.js:483 | field-call | note / 검토 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00329 | src/legal.js:484 | field-call | dateType / 변경 조회 기준 | select | selection | concrete-call-purpose-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00330 | src/legal.js:484 | field-call | category / 법령 분야 | select | selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00331 | src/legal.js:484 | field-call | query / 법령명·내용 검색 | text | search-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00332 | src/legal.js:518 | field-call | year / 직접 확인한 등록대상 사업연도 | number | numeric | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00333 | src/legal.js:518 | field-call | basis / 연도 판단 근거 | textarea | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00334 | src/legal.js:519 | field-call | buildingArea / 플랫폼 외부사업 건축 연면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00335 | src/legal.js:519 | field-call | nonResidentialArea / 플랫폼 외부사업 비주거 연면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00336 | src/legal.js:519 | field-call | landArea / 플랫폼 외부사업 토지개발 면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00337 | src/legal.js:519 | field-call | reviewer / 확인 담당자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00338 | src/legal.js:519 | field-call | sourcePath / 외부사업 확인 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00339 | src/legal.js:520 | field-call | nonResidentialArea / 현재 비주거 연면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00340 | src/legal.js:520 | field-call | reviewer / 검토자 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00341 | src/legal.js:520 | field-call | sourcePath / 면적 확인 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00342 | src/legal.js:520 | field-call | note / 면적 변경·등록대상 재검토 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00343 | src/legal.js:57 | declarative-field-default-candidate | preEducationDate / 사전교육 수료일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00344 | src/legal.js:57 | declarative-field-default-candidate | recentTrainingDate / 최근 연수교육 수료일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00345 | src/legal.js:57 | declarative-field-default-candidate | trainingDueDate / 연수교육 이수기한 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00346 | src/legal.js:57 | declarative-field-default-candidate | employmentStartDate / 재직 시작일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00347 | src/legal.js:57 | declarative-field-default-candidate | employmentEndDate / 실제 퇴사일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00348 | src/legal.js:148 | declarative-field-default-candidate | plannedApplication / 계획 신청일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00349 | src/legal.js:148 | declarative-field-default-candidate | expected / 목표 완료일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00350 | src/legal.js:148 | declarative-field-default-candidate | application / 실제 신청일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00351 | src/legal.js:148 | declarative-field-default-candidate | supplement / 보완 요청일 | date for ISO/blank; text for retained legacy source | unresolved | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00352 | src/legal.js:148 | declarative-field-default-candidate | approval / 승인일 | date for ISO/blank; text for retained legacy source | date | parameterized-or-conditional-family-reviewed / legal-date-or-retained-text | 별도 증거 |
| INPUT129-00353 | src/legal.js:149 | declarative-field-default-candidate | name / 인허가명 | text | text | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00354 | src/legal.js:149 | declarative-field-default-candidate | group / 관리 분야 | text | text | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00355 | src/legal.js:149 | declarative-field-default-candidate | reportCategory / 국토부 보고 분류 | text | text | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00356 | src/legal.js:149 | declarative-field-default-candidate | agency / 담당기관 | text | text | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00357 | src/legal.js:149 | declarative-field-default-candidate | stage / 상태 | text | text | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00358 | src/legal.js:149 | declarative-field-default-candidate | reportTrigger / 국토부 보고 기한 기준 | text | narrative-or-basis-string | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00359 | src/legal.js:149 | declarative-field-default-candidate | handling / 처리 방식 | text | text | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00360 | src/legal.js:149 | declarative-field-default-candidate | requestType / 최초 / 변경 | text | text | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00361 | src/legal.js:149 | declarative-field-default-candidate | sourcePath / 인허가 신청·진행자료 경로 | text | identifier-or-path-string | schema-definition-consumer-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00362 | src/legal.js:198 | html-control-candidate | 동적 / 동적 | text | text | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00363 | src/legal.js:337 | html-control-candidate | legacyChangeId / 동적 | hidden | text | nonhuman-protocol-control / legal-defined-controls | 별도 증거 |
| INPUT129-00364 | src/legal.js:411 | html-control-candidate | precede-${E(t.id)} / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00365 | src/legal.js:411 | html-control-candidate | integrate-${E(t.id)} / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00366 | src/legal.js:428 | html-control-candidate | pick-${E(c.id)} / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00367 | src/legal.js:432 | html-control-candidate | parcel-${E(t.id)} / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / legal-defined-controls | 별도 증거 |
| INPUT129-00368 | src/partners.js:85 | field-call | projectText / 관련 프로젝트 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00369 | src/partners.js:85 | field-call | text / 댓글 | textarea | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00370 | src/partners.js:279 | field-call | text / 메모 | textarea | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00371 | src/partners.js:279 | field-call | author / 작성자 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00372 | src/partners.js:287 | field-call | name / 업체명 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00373 | src/partners.js:287 | field-call | aliases / 검색용 별칭 · 쉼표로 구분 | text | search-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00374 | src/partners.js:287 | field-call | category / 분야 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00375 | src/partners.js:287 | field-call | region / 지역 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00376 | src/partners.js:290 | field-call | contractKey / 연결 계약 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00377 | src/partners.js:290 | field-call | projectName / 과거 프로젝트명 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00378 | src/partners.js:290 | field-call | amount / 계약금액 (원) | number | numeric-money | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00379 | src/partners.js:290 | field-call | path / 근거문서 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00380 | src/partners.js:290 | field-call | role / 참여 역할 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00381 | src/partners.js:290 | field-call | status / 참여 상태 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00382 | src/partners.js:290 | field-call | startDate / 시작일 | date | date | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00383 | src/partners.js:290 | field-call | endDate / 종료일 | date | date | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00384 | src/partners.js:290 | field-call | note / 비고 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00385 | src/partners.js:293 | field-call | ourTeam / 당사 부서 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00386 | src/partners.js:293 | field-call | ourName / 당사 담당자 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00387 | src/partners.js:293 | field-call | ourRole / 당사 직책 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00388 | src/partners.js:293 | field-call | ourPhone / 당사 연락처 | tel | telephone-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00389 | src/partners.js:293 | field-call | ourEmail / 당사 이메일 | email | email | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00390 | src/partners.js:293 | field-call | theirTeam / 상대 부서 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00391 | src/partners.js:293 | field-call | theirName / 상대 담당자 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00392 | src/partners.js:293 | field-call | theirRole / 상대 직책 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00393 | src/partners.js:293 | field-call | theirPhone / 상대 연락처 | tel | telephone-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00394 | src/partners.js:293 | field-call | theirEmail / 상대 이메일 | email | email | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00395 | src/partners.js:293 | field-call | connection / 연결 경로 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00396 | src/partners.js:293 | field-call | status / 상태 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00397 | src/partners.js:293 | field-call | lastContact / 최근 접촉일 | date | date | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00398 | src/partners.js:293 | field-call | sample / 연락처 유형 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00399 | src/partners.js:293 | field-call | path / 관련 문서 위치 | text | identifier-or-path-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00400 | src/partners.js:293 | field-call | note / 주요 논의·관계 메모 | textarea | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00401 | src/partners.js:391 | field-call | name / 사업명 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00402 | src/partners.js:391 | field-call | region / 지역 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00403 | src/partners.js:391 | field-call | completion / 준공연도 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00404 | src/partners.js:391 | field-call | gfa / 연면적 · ㎡ | number | numeric-quantity | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00405 | src/partners.js:391 | field-call | total / 공사비 · 원 | number | numeric | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00406 | src/partners.js:391 | field-call | unit / 참고 평당가 · 만원/평 | number | numeric | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00407 | src/partners.js:391 | field-call | scope / 공사 포함범위 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00408 | src/partners.js:391 | field-call | vat / VAT 기준 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00409 | src/partners.js:391 | field-call | sourceName / 출처명 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00410 | src/partners.js:391 | field-call | sourceUrl / 출처 URL | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00411 | src/partners.js:391 | field-call | documentPath / 원문 공용폴더 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00412 | src/partners.js:391 | field-call | amountDate / 금액 기준일 | date | date | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00413 | src/partners.js:391 | field-call | areaDate / 면적 기준일 | date | date | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00414 | src/partners.js:391 | field-call | areaBasis / 면적 기준 | text | narrative-or-basis-string | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00415 | src/partners.js:6 | inline-editable-call | field / benchmarkLabels[field] | type | unresolved | parameterized-or-conditional-family-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00416 | src/partners.js:383 | inline-wrapper-call | name / 동적 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00417 | src/partners.js:383 | inline-wrapper-call | region / 동적 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00418 | src/partners.js:383 | inline-wrapper-call | completion / 동적 | number | numeric | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00419 | src/partners.js:383 | inline-wrapper-call | gfa / 동적 | number | numeric | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00420 | src/partners.js:383 | inline-wrapper-call | scope / 동적 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00421 | src/partners.js:383 | inline-wrapper-call | total / 동적 | money | numeric | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00422 | src/partners.js:383 | inline-wrapper-call | unit / 동적 | number | numeric | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00423 | src/partners.js:85 | html-control-candidate | cooperative / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00424 | src/partners.js:124 | html-control-candidate | partner-filter-${key} / 동적 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00425 | src/partners.js:124 | html-control-candidate | partner-filter-query / 동적 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00426 | src/partners.js:209 | html-control-candidate | partner-filter-${key} / 동적 | select | selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00427 | src/partners.js:210 | html-control-candidate | partner-filter-query / 동적 | text | text | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00428 | src/partners.js:373 | html-control-candidate | market-${side}-version / 동적 | select | selection | concrete-call-purpose-reviewed / market-period-token | 별도 증거 |
| INPUT129-00429 | src/partners.js:374 | html-control-candidate | market-series-select / 동적 | select | selection | concrete-call-purpose-reviewed / market-period-token | 별도 증거 |
| INPUT129-00430 | src/partners.js:374 | html-control-candidate | market-start / 동적 | frequency==='월' ? month : text | unresolved | parameterized-or-conditional-family-reviewed / market-period-token | 별도 증거 |
| INPUT129-00431 | src/partners.js:374 | html-control-candidate | market-end / 동적 | frequency==='월' ? month : text | unresolved | parameterized-or-conditional-family-reviewed / market-period-token | 별도 증거 |
| INPUT129-00432 | src/partners.js:383 | html-control-candidate | 동적 / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / partner-profile-benchmark | 별도 증거 |
| INPUT129-00433 | src/permit-map.js:4 | field-call | name / label | text | text | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00434 | src/permit-map.js:86 | field-call | asset / 사업유형 | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00435 | src/permit-map.js:86 | field-call | method / 사업방식 | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00436 | src/permit-map.js:86 | field-call | buildingRoute / 건축 인허가 경로 | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00437 | src/permit-map.js:86 | field-call | region / 사업지 시·군·구 | text | text | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00438 | src/permit-map.js:86 | field-call | zoning / 용도지역·지구 | text | text | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00439 | src/permit-map.js:86 | field-call | siteArea / 사업면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00440 | src/permit-map.js:86 | field-call | singleBuildingArea / 건물별 최대 연면적(㎡) | number | numeric-quantity | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00441 | src/permit-map.js:86 | field-call | height / 최고 높이(m) | number | numeric | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00442 | src/permit-map.js:86 | field-call | floors / 최고 층수 | number | numeric-quantity | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00443 | src/permit-map.js:86 | field-call | excavationDepth / 최대 굴착깊이(m) | number | numeric | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00444 | src/permit-map.js:86 | field-call | powerMw / 전력 사용규모(MW) | number | numeric | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00445 | src/permit-map.js:86 | field-call | key / label | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00446 | src/permit-map.js:86 | field-call | evidencePath / 조건 확인자료 경로 | text | narrative-or-basis-string | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00447 | src/permit-map.js:108 | field-call | asset / 사업유형 | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00448 | src/permit-map.js:108 | field-call | method / 사업방식 | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00449 | src/permit-map.js:108 | field-call | region / 사업지 시·군·구 | text | text | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00450 | src/permit-map.js:108 | field-call | choiceName(row.id,key) / labels[key] | key==='reportCategory'?'select':['plannedApplication','expected'].includes(key)?'date':'text' | unresolved | parameterized-or-conditional-family-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00451 | src/permit-map.js:144 | field-call | org / 광역자치단체 * | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00452 | src/permit-map.js:144 | field-call | sborg / 기초자치단체 (선택) | select | selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00453 | src/permit-map.js:172 | field-call | note / 진행 내용 (선택) | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00454 | src/permit-map.js:108 | html-control-candidate | 동적 / 동적 | search | text | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00455 | src/permit-map.js:108 | html-control-candidate | pick-${E(row.id)} / 동적 | checkbox | boolean-selection | concrete-call-purpose-reviewed / permit-conditions-and-recommendation | 별도 증거 |
| INPUT129-00456 | src/permit-views.js:52 | field-call | name / definition[2] | type | unresolved | parameterized-or-conditional-family-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00457 | src/permit-views.js:63 | field-call | date / 기준일 | date | date | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00458 | src/permit-views.js:63 | field-call | planned / 계획 공정률(%) | number | numeric-ratio | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00459 | src/permit-views.js:63 | field-call | actual / 실제 공정률(%) | number | numeric-ratio | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00460 | src/permit-views.js:47 | declarative-field-candidate | projectDates.contractCompletion / 계약상 준공일 | date | date | schema-definition-consumer-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00461 | src/permit-views.js:47 | declarative-field-candidate | projectDates.responsibleCompletion / 책임준공 약정일 | date | date | schema-definition-consumer-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00462 | src/permit-views.js:47 | declarative-field-candidate | projectDates.responsibleExtension / 책임준공 연장 약정일 | date | date | schema-definition-consumer-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00463 | src/permit-views.js:47 | declarative-field-candidate | projectDates.responsibleSourcePath / 책임준공 약정 근거 경로 | text | identifier-or-path-string | schema-definition-consumer-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00464 | src/permit-views.js:48 | declarative-field-candidate | construction.delay / 사업 전체 지연 | select | selection | schema-definition-consumer-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00465 | src/permit-views.js:58 | declarative-field-candidate | project.progressAsOf / 공정률 기준일 | date | date | schema-definition-consumer-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00466 | src/permit-views.js:7 | inline-editable-call | kind+'.'+key / label | type | unresolved | parameterized-or-conditional-family-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00467 | src/permit-views.js:61 | inline-editable-call | 'construction.'+key / label | number | numeric | reusable-inline-constructor-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00468 | src/permit-views.js:25 | inline-wrapper-call | key / label | type | unresolved | parameterized-or-conditional-family-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00469 | src/permit-views.js:45 | inline-wrapper-call | key / label | type | unresolved | parameterized-or-conditional-family-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00470 | src/permit-views.js:45 | inline-wrapper-call | parcel.name / 필지 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00471 | src/permit-views.js:45 | inline-wrapper-call | parcel.area / 면적 | number | numeric-quantity | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00472 | src/permit-views.js:45 | inline-wrapper-call | parcel.owner / 소유자 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00473 | src/permit-views.js:45 | inline-wrapper-call | parcel.right / 권원 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00474 | src/permit-views.js:45 | inline-wrapper-call | landContract.name / 계약 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00475 | src/permit-views.js:45 | inline-wrapper-call | landContract.seller / 매도자 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00476 | src/permit-views.js:45 | inline-wrapper-call | landContract.contractDate / 계약일 | date | date | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00477 | src/permit-views.js:45 | inline-wrapper-call | landContract.balanceDate / 잔금일 | date | date | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00478 | src/permit-views.js:45 | inline-wrapper-call | landContract.amount / 매매금액 | money | numeric-money | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00479 | src/permit-views.js:45 | inline-wrapper-call | landPayment.category / 회차 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00480 | src/permit-views.js:45 | inline-wrapper-call | landPayment.amount / 회차금액 | money | numeric-money | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00481 | src/permit-views.js:45 | inline-wrapper-call | landPayment.plannedDate / 계획일 | date | date | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00482 | src/permit-views.js:45 | inline-wrapper-call | landPayment.actualDate / 실제일 | date | date | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00483 | src/permit-views.js:67 | inline-wrapper-call | k / labels[k] | k==='amount'?'money':k==='start'?'date':['total','planned','completed'].includes(k)?'number':'text' | unresolved | parameterized-or-conditional-family-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00484 | src/permit-views.js:52 | html-control-candidate | 동적 / 동적 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00485 | src/permit-views.js:63 | html-control-candidate | 동적 / 동적 | text | text | concrete-call-purpose-reviewed / legal-record-inline | 별도 증거 |
| INPUT129-00486 | src/recovery-views.js:66 | field-call | name / 단계명 | text | text | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00487 | src/recovery-views.js:66 | field-call | expected / 예정일 | date | date | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00488 | src/recovery-views.js:66 | field-call | status / 상태 | select | selection | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00489 | src/recovery-views.js:66 | field-call | actual / 실제 완료일 | date | date | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00490 | src/recovery-views.js:66 | field-call | detail / 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00491 | src/recovery-views.js:83 | field-call | date / 발생일 | date | date | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00492 | src/recovery-views.js:83 | field-call | title / 현안 | text | text | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00493 | src/recovery-views.js:83 | field-call | current / 진행내용 | text | narrative-or-basis-string | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00494 | src/recovery-views.js:83 | field-call | costImpact / 원가 영향 (원) | number | numeric | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00495 | src/recovery-views.js:83 | field-call | scheduleImpact / 일정 영향 | text | text | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00496 | src/recovery-views.js:4 | inline-editable-call | path / label | type | unresolved | parameterized-or-conditional-family-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00497 | src/recovery-views.js:22 | inline-editable-call | period / 사업기간 | text | text | reusable-inline-constructor-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00498 | src/recovery-views.js:22 | inline-editable-call | floors / 층수 | text | compound-floor-string | reusable-inline-constructor-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00499 | src/recovery-views.js:81 | inline-editable-call | k / labels[k] | k==='date'?'date':k==='costImpact'?'money':'text' | unresolved | parameterized-or-conditional-family-reviewed / issue-defined-controls | 별도 증거 |
| INPUT129-00500 | src/recovery-views.js:22 | inline-wrapper-call | path / label | type | unresolved | parameterized-or-conditional-family-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00501 | src/recovery-views.js:12 | html-control-candidate | portfolioSearch / 프로젝트 검색 | text | search-string | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00502 | src/recovery-views.js:12 | html-control-candidate | portfolioType / 사업유형 | select | selection | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00503 | src/recovery-views.js:12 | html-control-candidate | portfolioStage / 사업단계 | select | selection | concrete-call-purpose-reviewed / project-defined-controls | 별도 증거 |
| INPUT129-00504 | src/report.js:223 | field-call | value / def[2] | def[3] | unresolved | parameterized-or-conditional-family-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00505 | src/report.js:230 | field-call | key / label | type | unresolved | parameterized-or-conditional-family-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00506 | src/report.js:253 | field-call | asOf / 자료 기준일 | date | date | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00507 | src/report.js:253 | field-call | key / label | type | unresolved | parameterized-or-conditional-family-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00508 | src/report.js:258 | field-call | date / 날짜 | date | date | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00509 | src/report.js:258 | field-call | title / 제목 | text | text | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00510 | src/report.js:258 | field-call | content / 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00511 | src/report.js:303 | field-call | reportType / 보고 종류 | select | selection | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00512 | src/report.js:303 | field-call | reportDate / 보고 기준일 | date | date | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00513 | src/report.js:303 | field-call | reportStage / 사업비 확정시점 | select | selection | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00514 | src/report.js:324 | field-call | status / 상태 | select | selection | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00515 | src/report.js:324 | field-call | submitted / 제출일 | date | date | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00516 | src/report.js:324 | field-call | receipt / 접수번호 | text | text | concrete-call-purpose-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00517 | src/report.js:17 | declarative-field-candidate | basic.operator / 사업시행자 명칭 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00518 | src/report.js:17 | declarative-field-candidate | basic.office / 주된 사무소 소재지 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00519 | src/report.js:17 | declarative-field-candidate | basic.established / 설립일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00520 | src/report.js:17 | declarative-field-candidate | basic.asset / 자산총계(억원) | number | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00521 | src/report.js:17 | declarative-field-candidate | basic.liability / 부채총계(억원) | number | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00522 | src/report.js:17 | declarative-field-candidate | basic.equity / 자본총계(억원) | number | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00523 | src/report.js:17 | declarative-field-candidate | basic.reporterName / 보고담당자 이름 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00524 | src/report.js:17 | declarative-field-candidate | basic.reporterTitle / 보고담당자 직위 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00525 | src/report.js:17 | declarative-field-candidate | basic.reporterPhone / 보고담당자 전화번호 | tel | telephone-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00526 | src/report.js:17 | declarative-field-candidate | basic.email / 보고담당자 전자우편 | email | email | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00527 | src/report.js:17 | declarative-field-candidate | basic.legalBasis / 사업 근거법률 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00528 | src/report.js:17 | declarative-field-candidate | basic.periodStart / 총 사업기간 시작 | month | month | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00529 | src/report.js:17 | declarative-field-candidate | basic.periodEnd / 총 사업기간 종료 | month | month | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00530 | src/report.js:18 | declarative-field-candidate | reportForm.operatorType / 사업시행자 유형 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00531 | src/report.js:18 | declarative-field-candidate | reportForm.projectType / 사업종류 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00532 | src/report.js:18 | declarative-field-candidate | reportForm.otherPeriod / 사업기간 기타 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00533 | src/report.js:18 | declarative-field-candidate | reportForm.auxUse / 부속용도 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00534 | src/report.js:18 | declarative-field-candidate | reportForm.gfaAbove / 지상 연면적(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00535 | src/report.js:18 | declarative-field-candidate | reportForm.gfaBelow / 지하 연면적(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00536 | src/report.js:18 | declarative-field-candidate | reportForm.units / 세대수·호수 | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00537 | src/report.js:18 | declarative-field-candidate | reportForm.saleApplicable / 분양 적용 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00538 | src/report.js:18 | declarative-field-candidate | reportForm.attachments / 첨부서류 목록 | textarea | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00539 | src/report.js:18 | declarative-field-candidate | reportForm.reportSigner / 보고인 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00540 | src/report.js:18 | declarative-field-candidate | reportForm.cancelReason / 취소·중단 사유 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00541 | src/report.js:18 | declarative-field-candidate | reportForm.completionReason / 완료 사유 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00542 | src/report.js:18 | declarative-field-candidate | reportForm.eventDate / 사유 발생일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00543 | src/report.js:18 | declarative-field-candidate | reportForm.eventDetail / 세부 사유 | textarea | narrative-or-basis-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00544 | src/report.js:19 | declarative-field-candidate | construction.noticeDate / 착공신고일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00545 | src/report.js:19 | declarative-field-candidate | construction.plannedStart / 착공예정일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00546 | src/report.js:19 | declarative-field-candidate | construction.actualStart / 실제 착공일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00547 | src/report.js:19 | declarative-field-candidate | construction.plannedCompletion / 준공예정일(계획) | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00548 | src/report.js:19 | declarative-field-candidate | construction.actualCompletion / 준공일(실제) | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00549 | src/report.js:19 | declarative-field-candidate | construction.plannedProgress / 계획 공정률(%) | number | numeric-ratio | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00550 | src/report.js:19 | declarative-field-candidate | construction.actualProgress / 실제 공정률(%) | number | numeric-ratio | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00551 | src/report.js:19 | declarative-field-candidate | construction.startDelayed / 착공 지연 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00552 | src/report.js:19 | declarative-field-candidate | construction.startDelayReportDate / 착공연기신고일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00553 | src/report.js:19 | declarative-field-candidate | construction.startDelayReason / 착공 지연사유 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00554 | src/report.js:19 | declarative-field-candidate | construction.startDelayDetail / 착공 지연 세부내용 | textarea | narrative-or-basis-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00555 | src/report.js:19 | declarative-field-candidate | construction.restartDate / 착공 재개예정일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00556 | src/report.js:19 | declarative-field-candidate | construction.mainPf / 본PF 전환(실행) | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00557 | src/report.js:19 | declarative-field-candidate | construction.mainPfDate / 본PF 전환(실행)일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00558 | src/report.js:19 | declarative-field-candidate | construction.mainPfDelayed / 본PF 지연 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00559 | src/report.js:19 | declarative-field-candidate | construction.mainPfDelayReason / 본PF 지연사유 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00560 | src/report.js:19 | declarative-field-candidate | construction.mainPfDelayDetail / 본PF 지연 세부내용 | textarea | narrative-or-basis-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00561 | src/report.js:19 | declarative-field-candidate | construction.suspended / 공사중단 여부 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00562 | src/report.js:19 | declarative-field-candidate | construction.suspensionDate / 공사중단일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00563 | src/report.js:19 | declarative-field-candidate | construction.suspensionReason / 공사중단사유 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00564 | src/report.js:19 | declarative-field-candidate | construction.suspensionDetail / 공사중단 세부내용 | textarea | narrative-or-basis-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00565 | src/report.js:19 | declarative-field-candidate | construction.constructionRestartDate / 공사 재개예정일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00566 | src/report.js:19 | declarative-field-candidate | construction.constructionDelayReason / 공사지연 사유 | textarea | narrative-or-basis-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00567 | src/report.js:19 | declarative-field-candidate | construction.completionDelayed / 준공 지연 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00568 | src/report.js:19 | declarative-field-candidate | construction.completionDelayReason / 준공 지연사유 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00569 | src/report.js:19 | declarative-field-candidate | construction.completionDelayDetail / 준공 지연 세부내용 | textarea | narrative-or-basis-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00570 | src/report.js:19 | declarative-field-candidate | construction.revisedCompletion / 변경 준공예정일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00571 | src/report.js:149 | declarative-field-candidate | name / 시공사명 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00572 | src/report.js:149 | declarative-field-candidate | registration / 사업자등록번호 | text | identifier-or-path-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00573 | src/report.js:149 | declarative-field-candidate | contractDate / 도급계약일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00574 | src/report.js:149 | declarative-field-candidate | amount / 도급금액(원) | money | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00575 | src/report.js:149 | declarative-field-candidate | period / 공사기간 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00576 | src/report.js:149 | declarative-field-candidate | otherCreditEnhancement / 그 밖의 신용보강 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00577 | src/report.js:149 | declarative-field-candidate | name / 신탁사명 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00578 | src/report.js:149 | declarative-field-candidate | code / 금융기관코드 | text | identifier-or-path-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00579 | src/report.js:149 | declarative-field-candidate | otherType / 기타 신탁유형 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00580 | src/report.js:149 | declarative-field-candidate | period / 계약기간 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00581 | src/report.js:149 | declarative-field-candidate | fee / 신탁보수(원) | money | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00582 | src/report.js:149 | declarative-field-candidate | creditEnhancement / 신용보강 내용 | text | narrative-or-basis-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00583 | src/report.js:227 | declarative-field-candidate | contractDate / 도급계약일 | date | date | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00584 | src/report.js:227 | declarative-field-candidate | amount / 도급금액(원) | number | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00585 | src/report.js:227 | declarative-field-candidate | responsibleCompletion / 책임준공 확약 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00586 | src/report.js:227 | declarative-field-candidate | extensionCount / 기한 연장 횟수 | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00587 | src/report.js:227 | declarative-field-candidate | extensionOverdue / 책임준공 기한 도과 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00588 | src/report.js:227 | declarative-field-candidate | restructuring / 구조조정 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00589 | src/report.js:227 | declarative-field-candidate | bankruptcy / 파산 등 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00590 | src/report.js:227 | declarative-field-candidate | type / 신탁유형 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00591 | src/report.js:227 | declarative-field-candidate | fee / 신탁보수(원) | number | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00592 | src/report.js:227 | declarative-field-candidate | creditEnhanced / 신용보강 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00593 | src/report.js:227 | declarative-field-candidate | restructuring / 구조조정 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00594 | src/report.js:227 | declarative-field-candidate | bankruptcy / 파산 등 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00595 | src/report.js:227 | declarative-field-candidate | type / 보증방식 | select | selection | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00596 | src/report.js:227 | declarative-field-candidate | amount / 보증금액(원) | number | numeric-money | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00597 | src/report.js:244 | declarative-field-candidate | category / 용지 구분 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00598 | src/report.js:244 | declarative-field-candidate | area / 면적(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00599 | src/report.js:244 | declarative-field-candidate | lots / 필지수(개) | number | numeric | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00600 | src/report.js:244 | declarative-field-candidate | representativeLot / 대표 지번 | text | identifier-or-path-string | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00601 | src/report.js:244 | declarative-field-candidate | zone / 용도지역 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00602 | src/report.js:244 | declarative-field-candidate | siteArea / 대지면적(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00603 | src/report.js:244 | declarative-field-candidate | buildingArea / 건축면적(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00604 | src/report.js:244 | declarative-field-candidate | mainUse / 주용도 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00605 | src/report.js:244 | declarative-field-candidate | auxUse / 부속용도 | text | text | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00606 | src/report.js:244 | declarative-field-candidate | gfaAbove / 지상 연면적(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00607 | src/report.js:244 | declarative-field-candidate | gfaBelow / 지하 연면적(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00608 | src/report.js:244 | declarative-field-candidate | gfaTotal / 연면적 합계(㎡) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00609 | src/report.js:244 | declarative-field-candidate | floorsAbove / 지상층수 | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00610 | src/report.js:244 | declarative-field-candidate | floorsBelow / 지하층수 | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00611 | src/report.js:244 | declarative-field-candidate | far / 용적률(%) | number | numeric-ratio | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00612 | src/report.js:244 | declarative-field-candidate | bcr / 건폐율(%) | number | numeric-ratio | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00613 | src/report.js:244 | declarative-field-candidate | units / 세대수(호수) | number | numeric-quantity | schema-definition-consumer-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00614 | src/report.js:227 | declarative-field-default-candidate | name / 시공사명 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00615 | src/report.js:227 | declarative-field-default-candidate | registration / 사업자등록번호 | text | identifier-or-path-string | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00616 | src/report.js:227 | declarative-field-default-candidate | period / 공사기간 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00617 | src/report.js:227 | declarative-field-default-candidate | otherCreditEnhancement / 그 밖의 신용보강 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00618 | src/report.js:227 | declarative-field-default-candidate | name / 신탁사명 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00619 | src/report.js:227 | declarative-field-default-candidate | code / 금융기관코드 | text | identifier-or-path-string | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00620 | src/report.js:227 | declarative-field-default-candidate | otherType / 기타 신탁유형 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00621 | src/report.js:227 | declarative-field-default-candidate | period / 계약기간 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00622 | src/report.js:227 | declarative-field-default-candidate | creditEnhancement / 신용보강 내용 | text | narrative-or-basis-string | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00623 | src/report.js:227 | declarative-field-default-candidate | name / 보증기관명 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00624 | src/report.js:227 | declarative-field-default-candidate | otherType / 기타 보증방식 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00625 | src/report.js:227 | declarative-field-default-candidate | scope / 보증범위 | text | text | schema-definition-consumer-reviewed / report-participant-schema | 별도 증거 |
| INPUT129-00626 | src/report.js:220 | inline-editable-call | fieldKey(def) / def[2] | def[3] | unresolved | parameterized-or-conditional-family-reviewed / report-field-schema | 별도 증거 |
| INPUT129-00627 | src/report.js:286 | inline-editable-call | cell.cellId / label | meta.inputSpec?.type//(long?'textarea':'text') | unresolved | parameterized-or-conditional-family-reviewed / report-cell-literal-or-scalar | 별도 증거 |
| INPUT129-00628 | src/setup.js:57 | field-call | evidenceSource / 자료명 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00629 | src/setup.js:57 | field-call | evidenceLocation / 자료 위치 · 시트/페이지 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00630 | src/setup.js:57 | field-call | evidenceAsOf / 자료 기준일 | date | date | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00631 | src/setup.js:57 | field-call | evidencePath / 공통 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00632 | src/setup.js:62 | field-call | id / 프로젝트 코드 | text | identifier-or-path-string | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00633 | src/setup.js:62 | field-call | type / 사업유형 | select | selection | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00634 | src/setup.js:62 | field-call | key / label | type | unresolved | parameterized-or-conditional-family-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00635 | src/setup.js:102 | field-call | 'review_action_'+c.id / 검토 결과 | select | selection | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00636 | src/setup.js:102 | field-call | 'basis_'+c.id / 확인할 자료 | select | selection | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00637 | src/setup.js:102 | field-call | 'candidate_'+c.id / 확인할 값 | c.type==='number'?'number':'text' | unresolved | parameterized-or-conditional-family-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00638 | src/setup.js:106 | field-call | key / 대상 항목 | select | selection | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00639 | src/setup.js:106 | field-call | value / 자료값 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00640 | src/setup.js:117 | field-call | name / 사업명 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00641 | src/setup.js:117 | field-call | type / 사업유형 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00642 | src/setup.js:117 | field-call | location / 소재지 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00643 | src/setup.js:117 | field-call | manager / 담당자 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00644 | src/setup.js:117 | field-call | operator / 시행 법인 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00645 | src/setup.js:117 | field-call | method / 사업방식 | text | text | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00646 | src/setup.js:117 | field-call | above / 지상층수 | number | numeric-quantity | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00647 | src/setup.js:117 | field-call | below / 지하층수 | number | numeric-quantity | concrete-call-purpose-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00648 | src/setup.js:3 | declarative-field-candidate | name / 사업명 | text | text | schema-definition-consumer-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00649 | src/setup.js:3 | declarative-field-candidate | location / 소재지 | text | text | schema-definition-consumer-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00650 | src/setup.js:3 | declarative-field-candidate | operator / 사업시행 법인 | text | text | schema-definition-consumer-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00651 | src/setup.js:3 | declarative-field-candidate | manager / 담당자 | text | text | schema-definition-consumer-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00652 | src/setup.js:3 | declarative-field-candidate | gfaTotal / 연면적 ㎡ | number | numeric-quantity | schema-definition-consumer-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00653 | src/setup.js:3 | declarative-field-candidate | siteArea / 대지면적 ㎡ | number | numeric-quantity | schema-definition-consumer-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00654 | src/setup.js:3 | declarative-field-candidate | acquisitionLandArea / 취득대상 토지면적 ㎡ | number | numeric-quantity | schema-definition-consumer-reviewed / project-registration-source-review | 별도 증거 |
| INPUT129-00655 | src/spec.js:938 | html-control-candidate | 동적 / 플랫폼 명세 전체 JSON | textarea | text | concrete-call-purpose-reviewed / explicit-module-schema | 별도 증거 |
| INPUT129-00656 | src/vat.js:126 | field-call | mode / 기록 구분 | select | selection | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00657 | src/vat.js:126 | field-call | asOf / 기준일 | date | date | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00658 | src/vat.js:127 | field-call | net / 공급가액 (원) | number | numeric | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00659 | src/vat.js:127 | field-call | vat / 부가세 (원) | number | numeric | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00660 | src/vat.js:127 | field-call | gross / 거래총액 (원) | number | numeric | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00661 | src/vat.js:127 | field-call | amountBasis / 기존 원가 금액 기준 | select | selection | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00662 | src/vat.js:128 | field-call | transactionType / 거래 부가세 유형 | select | selection | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00663 | src/vat.js:128 | field-call | attribution / 원가 귀속 | select | selection | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00664 | src/vat.js:128 | field-call | deduction / 공제 검토 | select | selection | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00665 | src/vat.js:128 | field-call | reviewStatus / 검토 상태 | select | selection | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00666 | src/vat.js:129 | field-call | basis / 담당자가 확인한 안분 기준 | text | narrative-or-basis-string | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00667 | src/vat.js:129 | field-call | numerator / 면세·불공제 대상 분자 | number | numeric | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00668 | src/vat.js:129 | field-call | denominator / 전체 대상 분모 | number | numeric | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00669 | src/vat.js:129 | field-call | basisUnit / 기준 단위 | text | narrative-or-basis-string | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00670 | src/vat.js:129 | field-call | basisSourcePath / 안분 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00671 | src/vat.js:130 | field-call | taxpayer / 증빙 수취 주체 | text | text | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00672 | src/vat.js:130 | field-call | period / 해당 과세기간 | text | text | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00673 | src/vat.js:130 | field-call | reviewer / 검토 담당자 | text | text | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00674 | src/vat.js:130 | field-call | sourcePath / 계약·증빙 또는 가정 근거 | text | identifier-or-path-string | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00675 | src/vat.js:130 | field-call | reason / 불공제·안분 사유 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00676 | src/vat.js:131 | field-call | applyToCost / 원가표 금액 반영 | select | selection | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00677 | src/vat.js:141 | field-call | 'allocation'+i / x.name+' · 기존 총액에 포함된 금액 (원)' | number | numeric | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00678 | src/vat.js:141 | field-call | reviewer / 대사 담당자 | text | text | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00679 | src/vat.js:141 | field-call | sourcePath / 대사 근거 경로 | text | identifier-or-path-string | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |
| INPUT129-00680 | src/vat.js:141 | field-call | note / 대사 내용 | textarea | narrative-or-basis-string | concrete-call-purpose-reviewed / vat-budget-evidence-version | 별도 증거 |

## 원문 근거

- [WHATWG number](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number))
- [WHATWG date](https://html.spec.whatwg.org/multipage/input.html#date-state-(type=date))
- [W3C Labels](https://www.w3.org/WAI/tutorials/forms/labels/)
- [AG Grid popup editor](https://www.ag-grid.com/javascript-data-grid/cell-editors/)


## 최종 후보 지문 보완

C70→C71은 툴팁이 편집 중인 자식 요소를 확인하는 71바이트 가드 한 곳만 바뀌었습니다. recovery-views 소스 지문만 갱신했으며 기존 680개 입력 정의·행별 판정은 그대로입니다. 이전 JSON 지문과 변경 전후 소스 지문은 동일 JSON의 pinChangeHistory에 보존했습니다. 이 갱신을 동적 입력 전수 실행 완료로 간주하지 않습니다.

C71→C72는 공통 편집기 왼쪽 가시범위와 편집 종료 후 스크롤 복원6줄만 교정됐습니다. core 소스의 전체 줄수와 입력 선언/680개 정의는 그대로이며 core 지문 한 개만 추가 갱신했습니다. 변경 전후 지문을 pinChangeHistory에 이어 보존합니다. 최종 실제 입력 검수와 C70 출력12개/48쪽의 소스 연결은 보고서 검수 기록에서 각각 판정합니다.

C73은 모바일 장문 팝업의 이중 이동 반례를 고치기 위해 편집 전용 CSS의 transform:none!important 한 선언만 추가했습니다. JavaScript 40개 지문·680개 정의는 그대로이며, 인쇄/원서식/보고서 모델3개와 편집 CSS의 별도 지문을 JSON reportOutputAndEditorPins에 기록합니다. popup 정책검사는 새 실제 반례를 더해7개이며 원 출력12개/48쪽을 재생성하지 않았습니다.
