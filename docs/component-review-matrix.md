# 화면·컴포넌트 업무 검토 매트릭스

기준: C44 v0.12.4 `dea470e1763fe8eb26732b989b2003bb24dfd1a0096ebfc716984187556ebe03`. 초기 목록화/내용 검토이며 전체 화면·모든 기능 수락이 아닙니다. 새 전문인력 등 v125 요청과 정식 배포 상태는 별도로 판단합니다.

## 분모와 증거

| 구분 | 현재 목록 | 완료로 세지 않는 것 |
|---|---:|---|
| 주 메뉴 / 현재 세부 화면 | 10 / 30 | VM 콘텐츠 생성은 실제 브라우저 검수 아님 |
| 현재 렌더 기반 정의 | 2624 | 데이터 행 반복·다른 역할/상태 포함 아님 |
| 실제 의미흐름 / 화면 크기별 실행 | 21 / 42 | 317 등록·3908 후보 전체 완료 아님 |
| 추가 법령 HTTP503 조건 | 2 | 새 고유 시나리오로 중복 합산하지 않음 |
| 소스 팝업 / 필드 후보 | 160 / 436 | 실제 노출·필요성·부모 문맥 미확정 |
| 과거 가족 / 화면 관측 | 116 / 58 | 현재 통과로 자동 승계하지 않음 |

각 행의 구현·자동·실화면·출력은 `pass/fail/block/notrun`으로 분리합니다. `content-reviewed`는 원문/현재 renderer를 읽은 범위이며 실제 저장/취소/실패·관리 내용 충분성 수락이 아닙니다.
| 읽기 callback 누적/템플릿/남은 경로 | 534 / 164 / 637 | 새 복제·동결 원장 VM 관측. 실제 클릭/저장 통과 아님 |

## 우선 질문·보류

| ID | 영역 | 실제 남은 기준 | 담당 |
|---|---|---|---|
| POLICY-PROFESSIONAL-125 | permit/registration | 최신 사용자 요청의 불필요 자격·경력 설명/등록명단/증빙 열 제거와 교육 수료일·만료일의 법적 기준을 확인해야 합니다. | root + law_backend |
| POLICY-FINANCE-SUFFICIENCY | finance | 승인된 대출별 자문수수료 포함/제외 기준과 미입력/명시0 구분을 v125 최종 소스·실제 금융화면에서 수락해야 합니다. 사용자 답변을 다시 미확정 선택으로 되돌리지 않습니다. | root |
| POLICY-HISTORY-COMPLETENESS | all | 현재 사건·전후·증감·사유·담당자 표가 신규/제외/부분미확보·모든 연관 소비자에서 충분한지 독립 검토해야 합니다. | backend_operations |
| POLICY-LEGAL-APPLICABILITY | law/permit | 국가 법령·광역/기초 조례의 조건과 실제 프로젝트 사실이 충분히 확보됐는지 담당자 판단이 필요합니다. | root + 법령 담당 |
| POLICY-EXTERNAL-REFERENCE | company | 신용 후보·외부 수주/단가·면적 근거와 KACEM/KOSIS 등 외부 미확보가 판단에 충분한지 확인해야 합니다. | root + 수집 담당 |
| POLICY-DYNAMIC-DEPTH | common | 각 실제 부모/자식·권한·빈값·장문·삭제/교체·동시 변경에서 어느 경계를 추가 실행할지 행별 분모를 확정해야 합니다. | 전사 QA + 각 업무 담당 |

## 현재 화면별 목적과 콘텐츠

| 화면 ID | 업무 목적 | 현재 표시 정보 | 실제 검수 잔여 |
|---|---|---|---|
| SCREEN-portfolio | 여러 사업 중 확인할 사업과 비용·일정 변화를 고릅니다. | 프로젝트 현황 · 프로젝트별 현황 · 프로젝트별 사업비 현황 · 프로젝트 · 사업유형 · 현재단계 · 소재지 · 다음 일정 · 최초 언더라이팅 · 현재 사업비 · 최초 대비 · 국토부 보고 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-overview | 선택한 사업의 조건·일정·현안과 원가 변화를 함께 판단합니다. | A · 개발업 등록 · 사업 일정 · 인허가 · 원가 · 파이낸싱 · 국토부 보고 · 주요 현안 · 원가 변경이력 · 발생일 · 현안 · 진행내용 · 원가 영향 · 일정 영향 · 삭제 · 항목 · 변경 전 · 변경 후 · 증감 · 사유 · 일시 · 담당자 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-cost-overview | 회사 관리단위의 예산과 현재 준공추정원가를 비교하고 변경을 통제합니다. | A · 사업비 증감 · 계약·집행 요약 · 원가 구성 · 사업비·자금조달 구조 · 발생일 · 원가항목 · 사유 · 시점 · 계약금액 · 기성금액 · 지급금액 · 미지급금 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-cost-detail | 회사 관리단위의 예산과 현재 준공추정원가를 비교하고 변경을 통제합니다. | A ·  · 원가항목 · [동적 업무값 — 원문 비게시] · [동적 업무값 — 원문 비게시] · 구성비 · 항목 관리 · 연면적 · 취득대상 토지면적 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-cost-benchmark | 회사 관리단위의 예산과 현재 준공추정원가를 비교하고 변경을 통제합니다. | A · 평당 공사비 · 시장 공사비 동향 · 비교 · 사업명 · 지역 · 준공연도 · 연면적 · 공사범위 · 도급공사비 · 공사비/평 · 현재 사업 대비 ·  | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-finance-loans | 대출·출자·담보 조건과 실행·잔액·만기 변화를 관리합니다. | A · 조달 구조 · 금융기관 · 순위 · 유형 · 약정액 · 실행액 · 잔액 · All-in 금리 · 만기일 ·  · 회사명 · 사업자등록번호 · 출자금액 · 지분율 · 참여목적 ·  · 구분 · 제공자 · 금액 · 내용 · 기한 ·  · 보증기관 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-permit-land | 필요한 인허가와 계획·실제 진행·검토의견·조치계획을 연결합니다. | A · 부지확보 · 토지 필지 · 토지매매계약 · 토지대금 지급회차 · 항목 · 내용 · 필지 · 면적 (㎡) · 소유자 · 권원 ·  · 계약 · 매도자 · 연결 필지 · 계약일 · 잔금일 · 매매금액 · 계약원장 ·  · 계약 · 회차 · 금액 · 자기자본 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-permit-permits | 필요한 인허가와 계획·실제 진행·검토의견·조치계획을 연결합니다. | A · 인허가·심의 · 인허가명 · 분야 · 상태 · 목표 완료일 · 승인일 · 담당자 · 조치계획 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-permit-construction | 필요한 인허가와 계획·실제 진행·검토의견·조치계획을 연결합니다. | A · 공정률 · 착공·준공 일정 · 공사 진행 현황 · 일정 · 일자 · 항목 · 내용 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-permit-sales | 필요한 인허가와 계획·실제 진행·검토의견·조치계획을 연결합니다. | A · 분양·매각 현황 · 구분 · 단위 · 전체 · 계획 · 완료 · 개시일 · 매각금액 ·  | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-permit-registration | 필요한 인허가와 계획·실제 진행·검토의견·조치계획을 연결합니다. | A · 전문인력 명단 · 등록정보 · 이름·소속 · 자격·경력 · 교육 수료일 · 재직 · 등록명단 · 증빙 ·  · 이름 · 실제 퇴사일 · 등록명단 종료일 ·  · 항목 · 내용 | 수료/만료일 법적 기준과 새 표시 요구의 별도 v125 수락 전입니다. |
| SCREEN-document | 계약·문서 원문과 변경·기성·지급의 근거를 한 목록에서 찾고 관리합니다. | A · 계약·문서 · 문서 상세 · 구분 · 제목 · 상대방·발신/수신 · 일자 · 계약금액 · 원본 경로 ·  | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-report-generate | 공식 서식의 작성·보고서 전용 수정·저장·출력을 돕습니다. | A · 국토부 보고서 작성 · 보고자료 확인 및 관리 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-company-cak-rows | 업체와 공사비 자료의 출처·판본·동일성을 확인해 검토에 활용합니다. | 시공사·협력사 · [동적 업무값 — 원문 비게시] · 순위 · 전기순위 · 변동 · 업체 · 시공능력평가액 · 지역 · 신용등급 · 당사 참여 · 영업라인 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-company-cm-rows | 업체와 공사비 자료의 출처·판본·동일성을 확인해 검토에 활용합니다. | 시공사·협력사 · [동적 업무값 — 원문 비게시] · 순위 · 전기순위 · 변동 · 업체 · 용역형 CM 실적 · 지역 · 신용등급 · 당사 참여 · 영업라인 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-company-etis-overall_rows | 업체와 공사비 자료의 출처·판본·동일성을 확인해 검토에 활용합니다. | 시공사·협력사 · [동적 업무값 — 원문 비게시] · 순위 · 전기순위 · 변동 · 업체 · 수주실적 · 지역 · 신용등급 · 당사 참여 · 영업라인 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-company-etis-construction_rows | 업체와 공사비 자료의 출처·판본·동일성을 확인해 검토에 활용합니다. | 시공사·협력사 · [동적 업무값 — 원문 비게시] · 순위 · 전기순위 · 변동 · 업체 · 수주실적 · 지역 · 신용등급 · 당사 참여 · 영업라인 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-company-kacem-rows | 업체와 공사비 자료의 출처·판본·동일성을 확인해 검토에 활용합니다. | 시공사·협력사 · [동적 업무값 — 원문 비게시] · 순위 · 전기순위 · 변동 · 업체 · 수주실적 · 지역 · 신용등급 · 당사 참여 · 영업라인 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-company-market | 업체와 공사비 자료의 출처·판본·동일성을 확인해 검토에 활용합니다. | 시공사·협력사 · 공사비 세부지수 · 시장 공사비 동향 · 공사비 단가 참고 · 업체별 공사비 단가 · 지표 · 기준월 · 지수 · 전년 동월 대비 · 기준연도 · 출처 · 구분 · 적용일 · 단가 · 면적 기준 · 출처 · 연도 · High 건수 · High · ㎡ · High · 평 · Medium 건수 · Medium · ㎡ · Medium · 평 · 업체 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-company-directory | 업체와 공사비 자료의 출처·판본·동일성을 확인해 검토에 활용합니다. | 시공사·협력사 · 업체 기준정보 · 업체 · 분야·평가기준 · 순위 · 지역 · 신용등급 · 종류 · 당사 참여 · 영업라인 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-law-recent | 개정 전후와 공포·시행일·공식 근거를 확인하고 사업별 검토에 연결합니다. | 법령 변경 · [동적 업무값 — 원문 비게시] · 법령 / 조항 · 변경 내용 · [동적 업무값 — 원문 비게시] · 시행일 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-law-catalog | 개정 전후와 공포·시행일·공식 근거를 확인하고 사업별 검토에 연결합니다. | 법령 변경 · 관리 법령 목록 · 분야 · 법령 · 관리 범위 · 원문 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-overview | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] · 항목 · 내용 · 후속 요구 · 내용 · 현재 상태 · 후속 요구 · 내용 · 현재 상태 · 이번 재검토 · 내용 · 빌드 시점 상태 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-functions | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] · ID · 기능 · 현행 동작 · 검수 상태 · 후속 요구 · 내용 · 현재 상태 · 후속 요구 · 내용 · 현재 상태 · 이번 재검토 · 내용 · 빌드 시점 상태 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-sdd | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-tests | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] · 후속 요구 · 내용 · 현재 상태 · 후속 요구 · 내용 · 현재 상태 · 이번 재검토 · 내용 · 빌드 시점 상태 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-data | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-history | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] · 당시 개발·검수 기록 · 현재 업무 변경이력 · 버전 · 변경·근거 · 시각 · 프로젝트 · 행위 · 변경내용 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-feedback | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] · 후속 요구 · 내용 · 현재 상태 · 후속 요구 · 내용 · 현재 상태 · 이번 재검토 · 내용 · 빌드 시점 상태 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-spec-json | 소유자가 현재 기능·요구·검수 범위와 당시 기록을 구분해 관리합니다. | 플랫폼 명세 · [동적 업무값 — 원문 비게시] | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-notification | 개인에게 발생한 업무 사실을 확인하고 정확한 대상으로 이동합니다. | 제목·일자·대상·실제 상세 · 분기/법령 실제 조치 · 개인 읽음/삭제·실패 원복 · 목록 위치·부모 복귀 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-login | 허용된 사용자가 안전하게 가입·로그인하고 정해진 시간만 접속을 유지합니다. | 지정12이메일·최초 확인 · 비밀번호8~15자 가입·기존 로그인 호환 · 기본8시간/선택7일·명시 로그아웃 · 비밀번호 평문/업무자료 저장 금지 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |
| SCREEN-common | 화면을 이동·편집·취소하거나 실패에서 복구할 때 문맥을 잃지 않게 합니다. | 정확한 프로젝트/대상 · 실제 부모·포커스·스크롤 · 입력·오류·저장/취소 · 키보드·모바일·충돌·세션 만료 | 목록/값의 존재와 업무 내용의 충분성·법적 적용 수락은 다릅니다. |

## C44 실제 수행한 좁은 흐름

| ID | 경로/범위 | 크기/모의 역할 | 자동/실화면 |
|---|---|---|---|
| JOURNEY124-delete503-parent-reload | 알림 목록→상세→삭제503→목록→재시도·재접속 | 1280/390 / viewer | pass — 이 행의 고정 조건만 |
| JOURNEY124-get503-read403-target | 알림 조회503·읽음403→재시도→정확 대상 | 1280/390 / viewer | pass — 이 행의 고정 조건만 |
| JOURNEY124-late-delete503-close | 삭제 대기 중 닫기·늦은503·재열기 | 1280/390 / viewer | pass — 이 행의 고정 조건만 |
| JOURNEY124-certification-deep-row503 | 계약→기성 새4행/0원→503→저장→생성ID 수정·취소 | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-payment-review503 | 계약→지급내역 확인503→재시도 | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-round-review503 | 상세→진행 회차→새 심의→503→부모 | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-combined-result-plan503 | 인허가 수정→의견/조치계획 추가·제거→503→재시도 | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-mixed_use | 9용도별 mixed_use 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-office | 9용도별 office 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-retail | 9용도별 retail 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-hotel | 9용도별 hotel 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-logistics | 9용도별 logistics 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-data_center | 9용도별 data_center 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-senior_living | 9용도별 senior_living 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-rental_housing | 9용도별 rental_housing 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-preset-for_sale_housing | 9용도별 for_sale_housing 미리보기/취소·선택·503원복·적용·재적용 no-op | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-law-long-comparison-geometry | 법령명→장문 신구조문→끝행·공식 링크·키보드 | 1280/390 / viewer | pass — 이 행의 고정 조건만 |
| JOURNEY124-law-name-sort-catalog | 법령명 단일 진입→세 정렬×2→전체 법령·공식 경로 | 1280/390 / viewer | pass — 이 행의 고정 조건만 |
| JOURNEY124-law-old-history-return | 저장된 구 history→현재 화면·503에도 공식 링크 보존 | 1280/390 / viewer | pass — 이 행의 고정 조건만 |
| JOURNEY124-payment-deep-row503 | 지급 추가/수정4행0·펼침·실제 위치→계속입력/503→동일ID 저장 | 1280/390 / editor | pass — 이 행의 고정 조건만 |
| JOURNEY124-regional-stored-draft-directory | 지역 조례 광역/기초 초안 복원·GET1·소실/늦은 응답 | 1280/390 / editor | pass — 이 행의 고정 조건만 |

## 컴포넌트 정의별 검토 기록

아래는 현재 renderer에서 생성한 제목·표·열·입력·버튼 정의입니다. 같은 데이터 행 반복은 인스턴스 수만 남기고 완료 수로 부풀리지 않습니다. 개별 업무 충분성·문구·기하·연결·원자료 검사는 JSON의 해당 ID에서 이어갑니다.

| ID | 부모 | 종류/화면 | 내용 | 목적/충분성 | 구현·자동·실화면·출력 |
|---|---|---|---|---|
| CMP-85b716b00745cc1e | SCREEN-portfolio | section-title · portfolio/ | 프로젝트별 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-db733d5196ef5181 | SCREEN-portfolio | section-title · portfolio/ | 프로젝트별 사업비 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e | SCREEN-portfolio | table · portfolio/ | 표 1 · 프로젝트 / 사업유형 / 현재단계 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-01 | CMP-914c249b1d25342e | table-column · portfolio/ | 프로젝트 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-02 | CMP-914c249b1d25342e | table-column · portfolio/ | 사업유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-03 | CMP-914c249b1d25342e | table-column · portfolio/ | 현재단계 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-04 | CMP-914c249b1d25342e | table-column · portfolio/ | 소재지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-05 | CMP-914c249b1d25342e | table-column · portfolio/ | 다음 일정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-06 | CMP-914c249b1d25342e | table-column · portfolio/ | 최초 언더라이팅 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-07 | CMP-914c249b1d25342e | table-column · portfolio/ | 현재 사업비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-08 | CMP-914c249b1d25342e | table-column · portfolio/ | 최초 대비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-914c249b1d25342e-COL-09 | CMP-914c249b1d25342e | table-column · portfolio/ | 국토부 보고 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f4e4ea9bae6fa8b | SCREEN-portfolio | button · portfolio/ | project-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9dcaf35bee9bac9d | SCREEN-portfolio | input-control · portfolio/ | 프로젝트 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1a13a3ed468e0569 | SCREEN-portfolio | input-control · portfolio/ | 사업유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d107143e2f3e06bc | SCREEN-portfolio | input-control · portfolio/ | 사업단계 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a8e3902c11fc55ea | SCREEN-portfolio | button · portfolio/ | portfolio-reset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-81da1e6ffa568194 | SCREEN-portfolio | button · portfolio/ | A | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bf3ff329384e86e6 | SCREEN-portfolio | button · portfolio/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-394f767fbeae4e35 | SCREEN-portfolio | button · portfolio/ | B | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47c17c0be43ef3e4 | SCREEN-portfolio | button · portfolio/ | C | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eda1c6ae80a50ada | SCREEN-portfolio | button · portfolio/ | A | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-81c0316d2cb55040 | SCREEN-portfolio | button · portfolio/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7fd6168728cd2162 | SCREEN-portfolio | button · portfolio/ | B | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1f873fb8016934c7 | SCREEN-portfolio | button · portfolio/ | C | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8a2708ecb955bc94 | SCREEN-overview | section-title · overview/ | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-48121a47a754cc74 | SCREEN-overview | section-title · overview/ | 사업 일정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-08ed449cd7de2e09 | SCREEN-overview | section-title · overview/ | 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e756845e90b92100 | SCREEN-overview | section-title · overview/ | 원가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ff3c6a0e43250dc | SCREEN-overview | section-title · overview/ | 파이낸싱 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7b9eb49d2e07bda7 | SCREEN-overview | section-title · overview/ | 국토부 보고 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-56e6edb2372212cb | SCREEN-overview | section-title · overview/ | 주요 현안 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-81808023b2cc2fc8 | SCREEN-overview | section-title · overview/ | 원가 변경이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c336b01e398469f2 | SCREEN-overview | table · overview/ | 표 1 · 발생일 / 현안 / 진행내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c336b01e398469f2-COL-01 | CMP-c336b01e398469f2 | table-column · overview/ | 발생일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c336b01e398469f2-COL-02 | CMP-c336b01e398469f2 | table-column · overview/ | 현안 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c336b01e398469f2-COL-03 | CMP-c336b01e398469f2 | table-column · overview/ | 진행내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c336b01e398469f2-COL-04 | CMP-c336b01e398469f2 | table-column · overview/ | 원가 영향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c336b01e398469f2-COL-05 | CMP-c336b01e398469f2 | table-column · overview/ | 일정 영향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c336b01e398469f2-COL-06 | CMP-c336b01e398469f2 | table-column · overview/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432 | SCREEN-overview | table · overview/ | 표 2 · 항목 / 변경 전 / 변경 후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432-COL-01 | CMP-d3d668e6ce0fe432 | table-column · overview/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432-COL-02 | CMP-d3d668e6ce0fe432 | table-column · overview/ | 변경 전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432-COL-03 | CMP-d3d668e6ce0fe432 | table-column · overview/ | 변경 후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432-COL-04 | CMP-d3d668e6ce0fe432 | table-column · overview/ | 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432-COL-05 | CMP-d3d668e6ce0fe432 | table-column · overview/ | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432-COL-06 | CMP-d3d668e6ce0fe432 | table-column · overview/ | 일시 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d668e6ce0fe432-COL-07 | CMP-d3d668e6ce0fe432 | table-column · overview/ | 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c724bdd9bef88e8 | SCREEN-overview | button · overview/ | legal-registration-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0af0738b9ab48325 | SCREEN-overview | button · overview/ | milestone-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a2b10a3a31bb902d | SCREEN-overview | button · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1e8c2ec0d8549686 | SCREEN-overview | button · overview/ | 인허가 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c345977076d845d | SCREEN-overview | button · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bac1aa86832861d8 | SCREEN-overview | button · overview/ | 원가현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7edd25fd8ad022d3 | SCREEN-overview | button · overview/ | 조달 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01761beda73a6152 | SCREEN-overview | button · overview/ | 보고서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d7f08deb03015bc0 | SCREEN-overview | button · overview/ | issue-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1713d0d2589574da | SCREEN-overview | button · overview/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-203952a479f3b49f | SCREEN-overview | button · overview/ | project-history | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-be59e0c70bcc2a6b | SCREEN-cost-overview | section-title · cost/overview | 사업비 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74b8b744bb429b0e | SCREEN-cost-overview | section-title · cost/overview | 계약·집행 요약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fd3bfbcd405dd1ca | SCREEN-cost-overview | section-title · cost/overview | 원가 구성 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-70b6427473e088c2 | SCREEN-cost-overview | section-title · cost/overview | 사업비·자금조달 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d678b8acede8cae7 | SCREEN-cost-overview | table · cost/overview | 표 1 · 발생일 / 원가항목 / 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d678b8acede8cae7-COL-01 | CMP-d678b8acede8cae7 | table-column · cost/overview | 발생일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d678b8acede8cae7-COL-02 | CMP-d678b8acede8cae7 | table-column · cost/overview | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d678b8acede8cae7-COL-03 | CMP-d678b8acede8cae7 | table-column · cost/overview | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d678b8acede8cae7-COL-04 | CMP-d678b8acede8cae7 | table-column · cost/overview | 시점 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c22ecfd0c503779 | SCREEN-cost-overview | table · cost/overview | 표 2 · 계약금액 / 기성금액 / 지급금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c22ecfd0c503779-COL-01 | CMP-9c22ecfd0c503779 | table-column · cost/overview | 계약금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c22ecfd0c503779-COL-02 | CMP-9c22ecfd0c503779 | table-column · cost/overview | 기성금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c22ecfd0c503779-COL-03 | CMP-9c22ecfd0c503779 | table-column · cost/overview | 지급금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c22ecfd0c503779-COL-04 | CMP-9c22ecfd0c503779 | table-column · cost/overview | 미지급금 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-623a49a66a6af787 | SCREEN-cost-overview | button · cost/overview | 원가현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac217821df9db8fc | SCREEN-cost-overview | button · cost/overview | 세부 사업비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0d03f6374c1c6c39 | SCREEN-cost-overview | button · cost/overview | 공사비 비교 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7c5efd6834247f8f | SCREEN-cost-overview | button · cost/overview | cbs-drivers | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-29eecacf3698155f | SCREEN-cost-overview | button · cost/overview | cbs-change-details | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6c69f145ba6b3ebe | SCREEN-cost-overview | button · cost/overview | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e8f07d512933026 | SCREEN-cost-overview | button · cost/overview | 토지비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ae724ae213fe529e | SCREEN-cost-overview | button · cost/overview | 공사비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-85a75ae08cb1aa73 | SCREEN-cost-overview | button · cost/overview | 제세공과금·부담금 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eaf502385b05928a | SCREEN-cost-overview | button · cost/overview | 부대비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d98307fff97b3f2b | SCREEN-cost-overview | button · cost/overview | 금융비용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7932610deba86465 | SCREEN-cost-overview | button · cost/overview | 예비비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c70133c6b6a37769 | SCREEN-cost-overview | button · cost/overview | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7e16c44f8d5ea64a | SCREEN-cost-overview | button · cost/overview | 자기자본 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-54941e99211fa42a | SCREEN-cost-overview | button · cost/overview | 브릿지론 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-98109300838d8ef9 | SCREEN-cost-overview | button · cost/overview | 본PF | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5923538429587c87 | SCREEN-cost-overview | button · cost/overview | 미조달 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3 | SCREEN-cost-detail | table · cost/detail | 표 1 · 원가항목 / [동적 업무값 — 원문 비게시] / [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-01 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-02 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-03 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-04 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-05 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | 구성비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-06 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | 항목 관리 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-07 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | 연면적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01479cf9fdc8e3a3-COL-08 | CMP-01479cf9fdc8e3a3 | table-column · cost/detail | 취득대상 토지면적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2cda68188048d97c | SCREEN-cost-detail | button · cost/detail | 원가현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a525da86e4b42e7a | SCREEN-cost-detail | button · cost/detail | 세부 사업비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e47e000a22f7f1d2 | SCREEN-cost-detail | button · cost/detail | 공사비 비교 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-272c6693f3c13bbf | SCREEN-cost-detail | input-control · cost/detail | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-637f21eb545ee738 | SCREEN-cost-detail | button · cost/detail | 사업비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b79e383b97288cc1 | SCREEN-cost-detail | button · cost/detail | 평당가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ff289c3900647179 | SCREEN-cost-detail | input-control · cost/detail | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02b93011032788e2 | SCREEN-cost-detail | button · cost/detail | cbs-catalog-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-260c062db02d58e8 | SCREEN-cost-detail | button · cost/detail | cbs-use-preset-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c8f467ec7811f4e5 | SCREEN-cost-detail | button · cost/detail | stage-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-29b9daf708a2acce | SCREEN-cost-detail | button · cost/detail | 분기·주요시점 기록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02a028d65d0bcc77 | SCREEN-cost-detail | button · cost/detail | cbs-export | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3ed8157010bea5ca | SCREEN-cost-detail | button · cost/detail | ▾ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-402665565abdde3e | SCREEN-cost-detail | button · cost/detail | 최초 언더라이팅 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ca3db09280535e5 | SCREEN-cost-detail | button · cost/detail | area-edit | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6aaa99e085703faa | SCREEN-cost-detail | button · cost/detail | 이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6dce77d681b2da3f | SCREEN-cost-detail | button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5fe0888a51d7eb9d | SCREEN-cost-detail | button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dc13e3b1d97166c7 | SCREEN-cost-detail | button · cost/detail | 이름 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-69e76e99bd992f49 | SCREEN-cost-detail | button · cost/detail | 분류 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-54adf73d022eeedc | SCREEN-cost-detail | button · cost/detail | 금액·부가세 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-984436b9c9d3156a | SCREEN-cost-detail | button · cost/detail | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-909fcdbc4aaf476e | SCREEN-cost-detail | button · cost/detail | 다른 항목에 합치기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2f514204b4922e5e | SCREEN-cost-benchmark | section-title · cost/benchmark | 평당 공사비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ca9e4798b6dda47 | SCREEN-cost-benchmark | section-title · cost/benchmark | 시장 공사비 동향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3 | SCREEN-cost-benchmark | table · cost/benchmark | 표 1 · 비교 / 사업명 / 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-01 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 비교 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-02 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-03 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-04 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 준공연도 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-05 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 연면적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-06 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 공사범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-07 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 도급공사비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-08 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 공사비/평 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-09 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 현재 사업 대비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4295226cd123a5f3-COL-10 | CMP-4295226cd123a5f3 | table-column · cost/benchmark | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bec9bcfa877a938a | SCREEN-cost-benchmark | button · cost/benchmark | 원가현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ab138ded9a70c73f | SCREEN-cost-benchmark | button · cost/benchmark | 세부 사업비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-469cd00b7b3a721f | SCREEN-cost-benchmark | button · cost/benchmark | 공사비 비교 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c115567baf92bb12 | SCREEN-cost-benchmark | button · cost/benchmark | 전체 데이터 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-272e6c841e515ba1 | SCREEN-cost-benchmark | button · cost/benchmark | + 유사사업 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2de2774fef825afa | SCREEN-cost-benchmark | input-control · cost/benchmark | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-baeae2f7b5ba24af | SCREEN-cost-benchmark | button · cost/benchmark | 근거 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b9c057ce91c5b4a | SCREEN-cost-benchmark | button · cost/benchmark | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ef80de00c861792 | SCREEN-cost-benchmark | input-control · cost/benchmark | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-71782e13890c71df | SCREEN-cost-benchmark | input-control · cost/benchmark | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-17103e68b21b9e03 | SCREEN-cost-benchmark | button · cost/benchmark | market-compare | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-542fde767f00a0e4 | SCREEN-cost-benchmark | button · cost/benchmark | 관측값·출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-382256b3209657f1 | SCREEN-finance-loans | section-title · finance/loans | 조달 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5 | SCREEN-finance-loans | table · finance/loans | 표 1 · 금융기관 / 순위 / 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-01 | CMP-87280f57f92694e5 | table-column · finance/loans | 금융기관 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-02 | CMP-87280f57f92694e5 | table-column · finance/loans | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-03 | CMP-87280f57f92694e5 | table-column · finance/loans | 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-04 | CMP-87280f57f92694e5 | table-column · finance/loans | 약정액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-05 | CMP-87280f57f92694e5 | table-column · finance/loans | 실행액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-06 | CMP-87280f57f92694e5 | table-column · finance/loans | 잔액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-07 | CMP-87280f57f92694e5 | table-column · finance/loans | All-in 금리 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-08 | CMP-87280f57f92694e5 | table-column · finance/loans | 만기일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87280f57f92694e5-COL-09 | CMP-87280f57f92694e5 | table-column · finance/loans | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0813b57d43a2b05 | SCREEN-finance-loans | table · finance/loans | 표 2 · 회사명 / 사업자등록번호 / 출자금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0813b57d43a2b05-COL-01 | CMP-e0813b57d43a2b05 | table-column · finance/loans | 회사명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0813b57d43a2b05-COL-02 | CMP-e0813b57d43a2b05 | table-column · finance/loans | 사업자등록번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0813b57d43a2b05-COL-03 | CMP-e0813b57d43a2b05 | table-column · finance/loans | 출자금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0813b57d43a2b05-COL-04 | CMP-e0813b57d43a2b05 | table-column · finance/loans | 지분율 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0813b57d43a2b05-COL-05 | CMP-e0813b57d43a2b05 | table-column · finance/loans | 참여목적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0813b57d43a2b05-COL-06 | CMP-e0813b57d43a2b05 | table-column · finance/loans | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57987a3cf2fe8d46 | SCREEN-finance-loans | table · finance/loans | 표 3 · 구분 / 제공자 / 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57987a3cf2fe8d46-COL-01 | CMP-57987a3cf2fe8d46 | table-column · finance/loans | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57987a3cf2fe8d46-COL-02 | CMP-57987a3cf2fe8d46 | table-column · finance/loans | 제공자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57987a3cf2fe8d46-COL-03 | CMP-57987a3cf2fe8d46 | table-column · finance/loans | 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57987a3cf2fe8d46-COL-04 | CMP-57987a3cf2fe8d46 | table-column · finance/loans | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57987a3cf2fe8d46-COL-05 | CMP-57987a3cf2fe8d46 | table-column · finance/loans | 기한 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57987a3cf2fe8d46-COL-06 | CMP-57987a3cf2fe8d46 | table-column · finance/loans | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b380d470d5c597d | SCREEN-finance-loans | table · finance/loans | 표 4 · 보증기관 / 유형 / 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b380d470d5c597d-COL-01 | CMP-2b380d470d5c597d | table-column · finance/loans | 보증기관 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b380d470d5c597d-COL-02 | CMP-2b380d470d5c597d | table-column · finance/loans | 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b380d470d5c597d-COL-03 | CMP-2b380d470d5c597d | table-column · finance/loans | 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b380d470d5c597d-COL-04 | CMP-2b380d470d5c597d | table-column · finance/loans | 범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b380d470d5c597d-COL-05 | CMP-2b380d470d5c597d | table-column · finance/loans | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-415163f8168cce6f | SCREEN-finance-loans | button · finance/loans | finance-capital-detail | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-341ea18cdbea8836 | SCREEN-finance-loans | button · finance/loans | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-92eeb24b1cd339ed | SCREEN-finance-loans | button · finance/loans | finance-quarter-list | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-93525bc0cd676452 | SCREEN-finance-loans | button · finance/loans | finance-history-list | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-852e3fff554b5560 | SCREEN-finance-loans | button · finance/loans | loan-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-41fe9ff201996484 | SCREEN-finance-loans | button · finance/loans | 대출 상세 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7b9030f21a7dcb24 | SCREEN-finance-loans | button · finance/loans | + 출자자 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57756b8a350eb690 | SCREEN-finance-loans | button · finance/loans | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1dd557a0494ed1b | SCREEN-finance-loans | button · finance/loans | + 항목 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7fd8befcd3994632 | SCREEN-finance-loans | button · finance/loans | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ee4101ef45f24bc4 | SCREEN-finance-loans | button · finance/loans | + 보증기관 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-484c9729ccc89c14 | SCREEN-finance-loans | button · finance/loans | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e7f377e2953fea3 | SCREEN-permit-land | section-title · permit/land | 부지확보 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-81fdc33c96f37742 | SCREEN-permit-land | section-title · permit/land | 토지 필지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5b4b95f93f88efbb | SCREEN-permit-land | section-title · permit/land | 토지매매계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2077d78a6c160f27 | SCREEN-permit-land | section-title · permit/land | 토지대금 지급회차 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c77b24f8c7c112d | SCREEN-permit-land | table · permit/land | 표 1 · 항목 / 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c77b24f8c7c112d-COL-01 | CMP-9c77b24f8c7c112d | table-column · permit/land | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c77b24f8c7c112d-COL-02 | CMP-9c77b24f8c7c112d | table-column · permit/land | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fdcbc1a24e8f85f0 | SCREEN-permit-land | table · permit/land | 표 2 · 필지 / 면적 (㎡) / 소유자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fdcbc1a24e8f85f0-COL-01 | CMP-fdcbc1a24e8f85f0 | table-column · permit/land | 필지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fdcbc1a24e8f85f0-COL-02 | CMP-fdcbc1a24e8f85f0 | table-column · permit/land | 면적 (㎡) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fdcbc1a24e8f85f0-COL-03 | CMP-fdcbc1a24e8f85f0 | table-column · permit/land | 소유자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fdcbc1a24e8f85f0-COL-04 | CMP-fdcbc1a24e8f85f0 | table-column · permit/land | 권원 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fdcbc1a24e8f85f0-COL-05 | CMP-fdcbc1a24e8f85f0 | table-column · permit/land | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26 | SCREEN-permit-land | table · permit/land | 표 3 · 계약 / 매도자 / 연결 필지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-01 | CMP-5d54e8e944489b26 | table-column · permit/land | 계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-02 | CMP-5d54e8e944489b26 | table-column · permit/land | 매도자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-03 | CMP-5d54e8e944489b26 | table-column · permit/land | 연결 필지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-04 | CMP-5d54e8e944489b26 | table-column · permit/land | 계약일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-05 | CMP-5d54e8e944489b26 | table-column · permit/land | 잔금일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-06 | CMP-5d54e8e944489b26 | table-column · permit/land | 매매금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-07 | CMP-5d54e8e944489b26 | table-column · permit/land | 계약원장 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d54e8e944489b26-COL-08 | CMP-5d54e8e944489b26 | table-column · permit/land | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82 | SCREEN-permit-land | table · permit/land | 표 4 · 계약 / 회차 / 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-01 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-02 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 회차 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-03 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-04 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 자기자본 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-05 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 자기 비율 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-06 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 타인자본 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-07 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 타인 비율 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-08 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 계획일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-09 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 실제일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-10 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 지급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bf3b7df8838cf82-COL-11 | CMP-3bf3b7df8838cf82 | table-column · permit/land | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1f94599ddf559aad | SCREEN-permit-land | button · permit/land | 부지·토지계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-118a10fd30cef9f2 | SCREEN-permit-land | button · permit/land | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4724fd3b0e79639f | SCREEN-permit-land | button · permit/land | 착공·공사·준공 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6976443e5b031c26 | SCREEN-permit-land | button · permit/land | 분양·매각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e7d5028bf5daf49 | SCREEN-permit-land | button · permit/land | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-67c090f57be43c96 | SCREEN-permit-land | button · permit/land | + 필지 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-701feef563c72d0e | SCREEN-permit-land | button · permit/land | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-82daaa7ca6e041d6 | SCREEN-permit-land | button · permit/land | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-30aebe291ab64bf2 | SCREEN-permit-land | button · permit/land | + 토지계약 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1f9d4deee23d6b1 | SCREEN-permit-land | button · permit/land | + 회차 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c847a319149c8faa | SCREEN-permit-permits | section-title · permit/permits | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c | SCREEN-permit-permits | table · permit/permits | 표 1 · 인허가명 / 분야 / 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c-COL-01 | CMP-1c71a824852bf21c | table-column · permit/permits | 인허가명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c-COL-02 | CMP-1c71a824852bf21c | table-column · permit/permits | 분야 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c-COL-03 | CMP-1c71a824852bf21c | table-column · permit/permits | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c-COL-04 | CMP-1c71a824852bf21c | table-column · permit/permits | 목표 완료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c-COL-05 | CMP-1c71a824852bf21c | table-column · permit/permits | 승인일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c-COL-06 | CMP-1c71a824852bf21c | table-column · permit/permits | 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c71a824852bf21c-COL-07 | CMP-1c71a824852bf21c | table-column · permit/permits | 조치계획 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ecbb8614ac69b346 | SCREEN-permit-permits | button · permit/permits | 부지·토지계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5154f8aa568157e2 | SCREEN-permit-permits | button · permit/permits | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d29a5a2599c5b8af | SCREEN-permit-permits | button · permit/permits | 착공·공사·준공 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-de88d0c279a83415 | SCREEN-permit-permits | button · permit/permits | 분양·매각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-49c16f5c60da2326 | SCREEN-permit-permits | button · permit/permits | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f9f9853ea8f27560 | SCREEN-permit-permits | button · permit/permits | 인허가 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-05d1e768e998eeb1 | SCREEN-permit-permits | button · permit/permits | 인허가 일정 맵 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-52d6f09f1ac9ad1f | SCREEN-permit-permits | button · permit/permits | permit-conditions | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d80091d539360e | SCREEN-permit-permits | button · permit/permits | permit-type-select | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f7fde37f69040d | SCREEN-permit-permits | button · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4308c872ade3e75 | SCREEN-permit-permits | button · permit/permits | legal-preset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d427726aaa2028f | SCREEN-permit-permits | button · permit/permits | + 인허가 직접 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c0485174cb4017a8 | SCREEN-permit-permits | button · permit/permits | 지구단위계획 결정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4df24d39f7fcc802 | SCREEN-permit-permits | button · permit/permits | 조치계획 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-943ece56fd36c1fa | SCREEN-permit-permits | button · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f7b94225b7b7ac0f | SCREEN-permit-permits | button · permit/permits | 준공 및 사용승인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-818f755b78d7ef83 | SCREEN-permit-permits | button · permit/permits | 건축허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1dd972055f43a540 | SCREEN-permit-construction | section-title · permit/construction | 공정률 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-323ab8020136a885 | SCREEN-permit-construction | section-title · permit/construction | 착공·준공 일정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bb0c5db7c91d05c0 | SCREEN-permit-construction | section-title · permit/construction | 공사 진행 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6af4c33ab1484d77 | SCREEN-permit-construction | table · permit/construction | 표 1 · 일정 / 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6af4c33ab1484d77-COL-01 | CMP-6af4c33ab1484d77 | table-column · permit/construction | 일정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6af4c33ab1484d77-COL-02 | CMP-6af4c33ab1484d77 | table-column · permit/construction | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a93fbc24d6d039bf | SCREEN-permit-construction | table · permit/construction | 표 2 · 항목 / 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a93fbc24d6d039bf-COL-01 | CMP-a93fbc24d6d039bf | table-column · permit/construction | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a93fbc24d6d039bf-COL-02 | CMP-a93fbc24d6d039bf | table-column · permit/construction | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8ab5319f44c19673 | SCREEN-permit-construction | button · permit/construction | 부지·토지계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8b67b1f012913775 | SCREEN-permit-construction | button · permit/construction | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d21675a9d851936b | SCREEN-permit-construction | button · permit/construction | 착공·공사·준공 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5f9f00a4252f9370 | SCREEN-permit-construction | button · permit/construction | 분양·매각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe0351f83d3f67e1 | SCREEN-permit-construction | button · permit/construction | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-796fd6f52f933658 | SCREEN-permit-construction | button · permit/construction | progress-record-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8219cdcc925ed45f | SCREEN-permit-construction | button · permit/construction | construction-detail | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-12a00f0b9ab6cb7f | SCREEN-permit-construction | button · permit/construction | legal-dates-edit | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dca5497768d500fb | SCREEN-permit-sales | section-title · permit/sales | 분양·매각 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890 | SCREEN-permit-sales | table · permit/sales | 표 1 · 구분 / 단위 / 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-01 | CMP-882473f9ded30890 | table-column · permit/sales | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-02 | CMP-882473f9ded30890 | table-column · permit/sales | 단위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-03 | CMP-882473f9ded30890 | table-column · permit/sales | 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-04 | CMP-882473f9ded30890 | table-column · permit/sales | 계획 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-05 | CMP-882473f9ded30890 | table-column · permit/sales | 완료 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-06 | CMP-882473f9ded30890 | table-column · permit/sales | 개시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-07 | CMP-882473f9ded30890 | table-column · permit/sales | 매각금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-882473f9ded30890-COL-08 | CMP-882473f9ded30890 | table-column · permit/sales | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-18399c7351cb079e | SCREEN-permit-sales | button · permit/sales | 부지·토지계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-43f9d5a779e54880 | SCREEN-permit-sales | button · permit/sales | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-de339c2920cfaadc | SCREEN-permit-sales | button · permit/sales | 착공·공사·준공 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-646012f9921e63cb | SCREEN-permit-sales | button · permit/sales | 분양·매각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a10794974f5a9170 | SCREEN-permit-sales | button · permit/sales | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a2a53d61a7ccaad4 | SCREEN-permit-sales | button · permit/sales | + 분양·매각 항목 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b4a0ab72247caf75 | SCREEN-permit-sales | button · permit/sales | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c5cc33503155a93e | SCREEN-permit-sales | button · permit/sales | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0a8dddb97e4836b0 | SCREEN-permit-registration | section-title · permit/registration | 전문인력 명단 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b8d50a5fdb81cb0b | SCREEN-permit-registration | section-title · permit/registration | 등록정보 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54 | SCREEN-permit-registration | table · permit/registration | 표 1 · 이름·소속 / 자격·경력 / 교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54-COL-01 | CMP-10c1b8a8549cee54 | table-column · permit/registration | 이름·소속 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54-COL-02 | CMP-10c1b8a8549cee54 | table-column · permit/registration | 자격·경력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54-COL-03 | CMP-10c1b8a8549cee54 | table-column · permit/registration | 교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54-COL-04 | CMP-10c1b8a8549cee54 | table-column · permit/registration | 재직 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54-COL-05 | CMP-10c1b8a8549cee54 | table-column · permit/registration | 등록명단 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54-COL-06 | CMP-10c1b8a8549cee54 | table-column · permit/registration | 증빙 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10c1b8a8549cee54-COL-07 | CMP-10c1b8a8549cee54 | table-column · permit/registration | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac7c7181f091a106 | SCREEN-permit-registration | table · permit/registration | 표 2 · 이름 / 실제 퇴사일 / 등록명단 종료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac7c7181f091a106-COL-01 | CMP-ac7c7181f091a106 | table-column · permit/registration | 이름 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac7c7181f091a106-COL-02 | CMP-ac7c7181f091a106 | table-column · permit/registration | 실제 퇴사일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac7c7181f091a106-COL-03 | CMP-ac7c7181f091a106 | table-column · permit/registration | 등록명단 종료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac7c7181f091a106-COL-04 | CMP-ac7c7181f091a106 | table-column · permit/registration | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edfee6e84d310e80 | SCREEN-permit-registration | table · permit/registration | 표 3 · 항목 / 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edfee6e84d310e80-COL-01 | CMP-edfee6e84d310e80 | table-column · permit/registration | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edfee6e84d310e80-COL-02 | CMP-edfee6e84d310e80 | table-column · permit/registration | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0ee067a39d58ad0b | SCREEN-permit-registration | button · permit/registration | 부지·토지계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3a19439497de744 | SCREEN-permit-registration | button · permit/registration | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3e2d2b6646dcb760 | SCREEN-permit-registration | button · permit/registration | 착공·공사·준공 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a498358642a430d9 | SCREEN-permit-registration | button · permit/registration | 분양·매각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-680e7156d0555a6e | SCREEN-permit-registration | button · permit/registration | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-75cab5976dd8b98e | SCREEN-permit-registration | button · permit/registration | legal-professional-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e4cf08bb32fb6b41 | SCREEN-permit-registration | button · permit/registration | 경로 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eb766a0205d4674f | SCREEN-permit-registration | button · permit/registration | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97bb358f00d1884d | SCREEN-permit-registration | button · permit/registration | 퇴사 처리 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-692e087db3dfe5f3 | SCREEN-permit-registration | button · permit/registration | 복구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b9fd89ec777e759 | SCREEN-permit-registration | button · permit/registration | legal-entity-edit | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4efa83ed8d733a9b | SCREEN-document | section-title · document/ | 계약·문서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dbaed000dd8de4df | SCREEN-document | section-title · document/ | 문서 상세 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5 | SCREEN-document | table · document/ | 표 1 · 구분 / 제목 / 상대방·발신/수신 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5-COL-01 | CMP-46392111c06eaff5 | table-column · document/ | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5-COL-02 | CMP-46392111c06eaff5 | table-column · document/ | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5-COL-03 | CMP-46392111c06eaff5 | table-column · document/ | 상대방·발신/수신 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5-COL-04 | CMP-46392111c06eaff5 | table-column · document/ | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5-COL-05 | CMP-46392111c06eaff5 | table-column · document/ | 계약금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5-COL-06 | CMP-46392111c06eaff5 | table-column · document/ | 원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46392111c06eaff5-COL-07 | CMP-46392111c06eaff5 | table-column · document/ | 제목 없는 열(행 동작/선택 여부 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cc044dfc28c79ce5 | SCREEN-document | input-control · document/ | 계약·문서 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3dc24e972d7f460d | SCREEN-document | input-control · document/ | 계약·문서 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-72d98719100e2365 | SCREEN-document | button · document/ | setup-records | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b456b622341996b | SCREEN-document | button · document/ | contract-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20ea79821d035a2b | SCREEN-document | button · document/ | document-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fd69e6c1c917fef4 | SCREEN-document | button · document/ | document-select | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f7181c34e882237b | SCREEN-document | button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f1a228f022a39a8 | SCREEN-document | button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c3a586e9f1c5bc7 | SCREEN-document | button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbe6d8c8ce75442b | SCREEN-document | button · document/ | contract-detail | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-59c36d0c93f7fcf6 | SCREEN-document | button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b5f2a07776129a42 | SCREEN-document | button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-806e6721affc6cb0 | SCREEN-document | button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-696e9228459f06b0 | SCREEN-report-generate | section-title · report/generate | 국토부 보고서 작성 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d5c65781a34a91cb | SCREEN-report-generate | section-title · report/generate | 보고자료 확인 및 관리 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-13e270f3540eb735 | SCREEN-report-generate | input-control · report/generate | 보고 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8aa52c1f5b92b1b8 | SCREEN-report-generate | input-control · report/generate | 보고 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe307b1ce1236477 | SCREEN-report-generate | input-control · report/generate | 사업비 확정시점 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3f8eb275bffdfa66 | SCREEN-report-generate | button · report/generate | report-editor-toggle | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6e972f0b33ccc2d8 | SCREEN-report-generate | button · report/generate | report-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cef7cd11b8b3b6ab | SCREEN-report-generate | button · report/generate | report-save | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6a46f3454480752f | SCREEN-report-generate | button · report/generate | report-source-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f11482e6f3745573 | SCREEN-report-generate | button · report/generate | report-history-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a75c6d701c0bef91 | SCREEN-company-cak-rows | section-title · company/cak-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c | SCREEN-company-cak-rows | table · company/cak-rows | 표 1 · 순위 / 전기순위 / 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-01 | CMP-410d859fa557751c | table-column · company/cak-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-02 | CMP-410d859fa557751c | table-column · company/cak-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-03 | CMP-410d859fa557751c | table-column · company/cak-rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-04 | CMP-410d859fa557751c | table-column · company/cak-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-05 | CMP-410d859fa557751c | table-column · company/cak-rows | 시공능력평가액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-06 | CMP-410d859fa557751c | table-column · company/cak-rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-07 | CMP-410d859fa557751c | table-column · company/cak-rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-08 | CMP-410d859fa557751c | table-column · company/cak-rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-410d859fa557751c-COL-09 | CMP-410d859fa557751c | table-column · company/cak-rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d5ae59c522a12904 | SCREEN-company-cak-rows | button · company/cak-rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec177a17bb98eaf2 | SCREEN-company-cak-rows | button · company/cak-rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c473677593388c9a | SCREEN-company-cak-rows | button · company/cak-rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ea17fc89bc11f6fb | SCREEN-company-cak-rows | button · company/cak-rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-113dedcd92f82119 | SCREEN-company-cak-rows | button · company/cak-rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6ffb0cb7abf7f26b | SCREEN-company-cak-rows | button · company/cak-rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-167eef7b6fe4770e | SCREEN-company-cak-rows | button · company/cak-rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-66a2185ed6e65806 | SCREEN-company-cak-rows | input-control · company/cak-rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cc64e54215061635 | SCREEN-company-cak-rows | input-control · company/cak-rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2322d919814b94ca | SCREEN-company-cak-rows | button · company/cak-rows | partner-filter-reset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8290b4468a4882cf | SCREEN-company-cak-rows | button · company/cak-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f48f034a68b70f7d | SCREEN-company-cak-rows | button · company/cak-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8ad7905ef625450c | SCREEN-company-cak-rows | button · company/cak-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-36b17646e6615a59 | SCREEN-company-cak-rows | button · company/cak-rows | 시공능력평가액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f7018bd2c632d225 | SCREEN-company-cak-rows | button · company/cak-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cbd96798a59a3f24 | SCREEN-company-cm-rows | section-title · company/cm-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a | SCREEN-company-cm-rows | table · company/cm-rows | 표 1 · 순위 / 전기순위 / 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-01 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-02 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-03 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-04 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-05 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 용역형 CM 실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-06 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-07 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-08 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b3a046db156d21a-COL-09 | CMP-1b3a046db156d21a | table-column · company/cm-rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a79358c93cb37773 | SCREEN-company-cm-rows | button · company/cm-rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-75daf1d594c6c1e8 | SCREEN-company-cm-rows | button · company/cm-rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-23c7e290b91bf950 | SCREEN-company-cm-rows | button · company/cm-rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-097f274f5b4a160d | SCREEN-company-cm-rows | button · company/cm-rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3c7fba3fb6ddd58 | SCREEN-company-cm-rows | button · company/cm-rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0bb8e84db9de883d | SCREEN-company-cm-rows | button · company/cm-rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-467da213700583ef | SCREEN-company-cm-rows | button · company/cm-rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eb56ede2fa4e67d1 | SCREEN-company-cm-rows | input-control · company/cm-rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f4dd3e23c2dca00e | SCREEN-company-cm-rows | input-control · company/cm-rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3290736b145c5d71 | SCREEN-company-cm-rows | button · company/cm-rows | partner-filter-reset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fdd415ba4dd423fd | SCREEN-company-cm-rows | button · company/cm-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c5d10925d1c8b77 | SCREEN-company-cm-rows | button · company/cm-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e622461cc449ad57 | SCREEN-company-cm-rows | button · company/cm-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-90c771335b9fe8e4 | SCREEN-company-cm-rows | button · company/cm-rows | 용역형 CM 실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a1df7778cfe5d38e | SCREEN-company-cm-rows | button · company/cm-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a08a6303dfbb110b | SCREEN-company-etis-overall_rows | section-title · company/etis-overall_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3 | SCREEN-company-etis-overall_rows | table · company/etis-overall_rows | 표 1 · 순위 / 전기순위 / 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-01 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-02 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-03 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-04 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-05 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-06 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-07 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-08 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9687f0845e4ebab3-COL-09 | CMP-9687f0845e4ebab3 | table-column · company/etis-overall_rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-938fcf0c0106bdb8 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9e3143b4a11fdf53 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42e92fc93e93ff1f | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0eb82042c3c16d18 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-811f4003619e468b | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4259d9c7fe29cf88 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-41b343003aac3fb9 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2156a903cdc7b01f | SCREEN-company-etis-overall_rows | input-control · company/etis-overall_rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0333c312eec0e536 | SCREEN-company-etis-overall_rows | input-control · company/etis-overall_rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bb09f5437340104e | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | partner-filter-reset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b568d73c210eda53 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8261e641dae4dc90 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-98d9098ba2044545 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4698ca272d30033e | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c58f0fc35585cda7 | SCREEN-company-etis-overall_rows | button · company/etis-overall_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-796eb489960750f4 | SCREEN-company-etis-construction_rows | section-title · company/etis-construction_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38 | SCREEN-company-etis-construction_rows | table · company/etis-construction_rows | 표 1 · 순위 / 전기순위 / 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-01 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-02 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-03 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-04 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-05 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-06 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-07 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-08 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03829278f9642f38-COL-09 | CMP-03829278f9642f38 | table-column · company/etis-construction_rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1435131380dc038c | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-845bcffd46d8a627 | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-018d4f4c689dd16a | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-efdcd86fd4fd5e4f | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8813d70d9751b507 | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-36dfc954ee189b5e | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e48086461b325a05 | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-82430918d20e3be0 | SCREEN-company-etis-construction_rows | input-control · company/etis-construction_rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-be04786d0190fa53 | SCREEN-company-etis-construction_rows | input-control · company/etis-construction_rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d13e79639c784aad | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | partner-filter-reset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dffbb2cdb7e8bb20 | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ceb879464e8deb6e | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8de4eb82f55e2492 | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-529e67d5cd8f1455 | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3ea6b06bd2c5fff4 | SCREEN-company-etis-construction_rows | button · company/etis-construction_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dbfe8b4f67c9b469 | SCREEN-company-kacem-rows | section-title · company/kacem-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435 | SCREEN-company-kacem-rows | table · company/kacem-rows | 표 1 · 순위 / 전기순위 / 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-01 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-02 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-03 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-04 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-05 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-06 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-07 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-08 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe91b19e469d3435-COL-09 | CMP-fe91b19e469d3435 | table-column · company/kacem-rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51748899adc52733 | SCREEN-company-kacem-rows | button · company/kacem-rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6fe3577bc7f0ce10 | SCREEN-company-kacem-rows | button · company/kacem-rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a32c8d976b7fa81b | SCREEN-company-kacem-rows | button · company/kacem-rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0fd7e954fe89aab3 | SCREEN-company-kacem-rows | button · company/kacem-rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-793ea75545c11bb2 | SCREEN-company-kacem-rows | button · company/kacem-rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1e2828845ab4b7a | SCREEN-company-kacem-rows | button · company/kacem-rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1d15558f8daceb5b | SCREEN-company-kacem-rows | button · company/kacem-rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-11c049288bdf41b1 | SCREEN-company-kacem-rows | input-control · company/kacem-rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b10be7c38f5d128 | SCREEN-company-kacem-rows | input-control · company/kacem-rows | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-40a04a155be33386 | SCREEN-company-kacem-rows | button · company/kacem-rows | partner-filter-reset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a1c0a724deafe924 | SCREEN-company-kacem-rows | button · company/kacem-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-155d2310a0c704ee | SCREEN-company-kacem-rows | button · company/kacem-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-92c226dbb74762d6 | SCREEN-company-kacem-rows | button · company/kacem-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a46600d101203d55 | SCREEN-company-kacem-rows | button · company/kacem-rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4c971f785c6f315 | SCREEN-company-kacem-rows | button · company/kacem-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d4739abaae2f29f | SCREEN-company-market | section-title · company/market | 공사비 세부지수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-248f56d26a4b41e2 | SCREEN-company-market | section-title · company/market | 시장 공사비 동향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-767c313c725631c5 | SCREEN-company-market | section-title · company/market | 공사비 단가 참고 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d1394dc08dbda4e4 | SCREEN-company-market | section-title · company/market | 업체별 공사비 단가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c75dfa2c9b693d74 | SCREEN-company-market | table · company/market | 표 1 · 지표 / 기준월 / 지수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c75dfa2c9b693d74-COL-01 | CMP-c75dfa2c9b693d74 | table-column · company/market | 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c75dfa2c9b693d74-COL-02 | CMP-c75dfa2c9b693d74 | table-column · company/market | 기준월 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c75dfa2c9b693d74-COL-03 | CMP-c75dfa2c9b693d74 | table-column · company/market | 지수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c75dfa2c9b693d74-COL-04 | CMP-c75dfa2c9b693d74 | table-column · company/market | 전년 동월 대비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c75dfa2c9b693d74-COL-05 | CMP-c75dfa2c9b693d74 | table-column · company/market | 기준연도 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c75dfa2c9b693d74-COL-06 | CMP-c75dfa2c9b693d74 | table-column · company/market | 출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af581b7f01df42a8 | SCREEN-company-market | table · company/market | 표 2 · 구분 / 적용일 / 단가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af581b7f01df42a8-COL-01 | CMP-af581b7f01df42a8 | table-column · company/market | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af581b7f01df42a8-COL-02 | CMP-af581b7f01df42a8 | table-column · company/market | 적용일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af581b7f01df42a8-COL-03 | CMP-af581b7f01df42a8 | table-column · company/market | 단가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af581b7f01df42a8-COL-04 | CMP-af581b7f01df42a8 | table-column · company/market | 면적 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af581b7f01df42a8-COL-05 | CMP-af581b7f01df42a8 | table-column · company/market | 출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394 | SCREEN-company-market | table · company/market | 표 3 · 연도 / High 건수 / High · ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394-COL-01 | CMP-e6a2850af5608394 | table-column · company/market | 연도 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394-COL-02 | CMP-e6a2850af5608394 | table-column · company/market | High 건수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394-COL-03 | CMP-e6a2850af5608394 | table-column · company/market | High · ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394-COL-04 | CMP-e6a2850af5608394 | table-column · company/market | High · 평 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394-COL-05 | CMP-e6a2850af5608394 | table-column · company/market | Medium 건수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394-COL-06 | CMP-e6a2850af5608394 | table-column · company/market | Medium · ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6a2850af5608394-COL-07 | CMP-e6a2850af5608394 | table-column · company/market | Medium · 평 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125 | SCREEN-company-market | table · company/market | 표 4 · 업체 / 계약일 / 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-01 | CMP-4a5089d7cc8e6125 | table-column · company/market | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-02 | CMP-4a5089d7cc8e6125 | table-column · company/market | 계약일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-03 | CMP-4a5089d7cc8e6125 | table-column · company/market | 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-04 | CMP-4a5089d7cc8e6125 | table-column · company/market | 공사비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-05 | CMP-4a5089d7cc8e6125 | table-column · company/market | 연면적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-06 | CMP-4a5089d7cc8e6125 | table-column · company/market | 산출 단가 · ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-07 | CMP-4a5089d7cc8e6125 | table-column · company/market | 단가 · 평 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-08 | CMP-4a5089d7cc8e6125 | table-column · company/market | 신뢰도 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a5089d7cc8e6125-COL-09 | CMP-4a5089d7cc8e6125 | table-column · company/market | 출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-70e4caec0e6c1075 | SCREEN-company-market | button · company/market | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-828c135950789799 | SCREEN-company-market | button · company/market | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-717e83ea1cb76cf1 | SCREEN-company-market | button · company/market | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cc89b59c573034dd | SCREEN-company-market | button · company/market | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-66bc4e556a178455 | SCREEN-company-market | button · company/market | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f030a66451eee6bd | SCREEN-company-market | button · company/market | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4604c4d3b28670b2 | SCREEN-company-market | button · company/market | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c49673bd9ce83cfa | SCREEN-company-market | input-control · company/market | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-592a73099daad066 | SCREEN-company-market | input-control · company/market | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-786c09fcf899168b | SCREEN-company-market | button · company/market | market-compare | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0ba77adf520fcd4 | SCREEN-company-market | button · company/market | 관측값·출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c931452bf4921f70 | SCREEN-company-directory | section-title · company/directory | 업체 기준정보 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7 | SCREEN-company-directory | table · company/directory | 표 1 · 업체 / 분야·평가기준 / 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7-COL-01 | CMP-19ce02669c9f70c7 | table-column · company/directory | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7-COL-02 | CMP-19ce02669c9f70c7 | table-column · company/directory | 분야·평가기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7-COL-03 | CMP-19ce02669c9f70c7 | table-column · company/directory | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7-COL-04 | CMP-19ce02669c9f70c7 | table-column · company/directory | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7-COL-05 | CMP-19ce02669c9f70c7 | table-column · company/directory | 신용등급 · 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7-COL-06 | CMP-19ce02669c9f70c7 | table-column · company/directory | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-19ce02669c9f70c7-COL-07 | CMP-19ce02669c9f70c7 | table-column · company/directory | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4d4d3546eec0834a | SCREEN-company-directory | button · company/directory | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-caed0fbe277c4e68 | SCREEN-company-directory | button · company/directory | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b3b31ab507d5dd73 | SCREEN-company-directory | button · company/directory | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2008b4d7eddbcf83 | SCREEN-company-directory | button · company/directory | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8fa75a385420fe27 | SCREEN-company-directory | button · company/directory | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f6a59315fd3515c | SCREEN-company-directory | button · company/directory | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d4d4e94ed0639cf9 | SCREEN-company-directory | button · company/directory | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f5cf27d043c19198 | SCREEN-company-directory | button · company/directory | partner-company-add | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42f5251a92201026 | SCREEN-company-directory | input-control · company/directory | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ee5a2efefe07354 | SCREEN-company-directory | input-control · company/directory | 동적/이름 없는 조작(실제 명칭 확인 필요) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2f4892b2ecd45031 | SCREEN-company-directory | button · company/directory | partner-filter-reset | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8623cb2c4ef7d62b | SCREEN-company-directory | button · company/directory | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a8e67738c2ab69be | SCREEN-company-directory | button · company/directory | 다음 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cbbc076066d726ba | SCREEN-law-recent | section-title · law/recent | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4746c4468478c26e | SCREEN-law-recent | table · law/recent | 표 1 · 법령 / 조항 / 변경 내용 / [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4746c4468478c26e-COL-01 | CMP-4746c4468478c26e | table-column · law/recent | 법령 / 조항 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4746c4468478c26e-COL-02 | CMP-4746c4468478c26e | table-column · law/recent | 변경 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4746c4468478c26e-COL-03 | CMP-4746c4468478c26e | table-column · law/recent | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4746c4468478c26e-COL-04 | CMP-4746c4468478c26e | table-column · law/recent | 시행일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8dc6958faf5de2de | SCREEN-law-recent | button · law/recent | law-search-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f93328ab7fa94bd5 | SCREEN-law-recent | button · law/recent | law-watch-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6fa76dca57ac7135 | SCREEN-law-recent | button · law/recent | law-server-refresh | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8251f36e4961fa04 | SCREEN-law-recent | button · law/recent | 법령 변경 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-961d2c9fe96fe16d | SCREEN-law-recent | button · law/recent | 전체 법령 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b41fc218395d5d2c | SCREEN-law-recent | button · law/recent | legal-law-filter | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-99d1ab4a1f3b1bc7 | SCREEN-law-recent | button · law/recent | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-098fb1d1676df28b | SCREEN-law-recent | button · law/recent | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-943801f0f8b5743f | SCREEN-law-catalog | section-title · law/catalog | 관리 법령 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f010f3edac8feecd | SCREEN-law-catalog | table · law/catalog | 표 1 · 분야 / 법령 / 관리 범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f010f3edac8feecd-COL-01 | CMP-f010f3edac8feecd | table-column · law/catalog | 분야 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f010f3edac8feecd-COL-02 | CMP-f010f3edac8feecd | table-column · law/catalog | 법령 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f010f3edac8feecd-COL-03 | CMP-f010f3edac8feecd | table-column · law/catalog | 관리 범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f010f3edac8feecd-COL-04 | CMP-f010f3edac8feecd | table-column · law/catalog | 원문 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6233feaf96f2263a | SCREEN-law-catalog | button · law/catalog | law-search-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1223e60544dac2f9 | SCREEN-law-catalog | button · law/catalog | law-watch-open | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c3b8f5de9f742807 | SCREEN-law-catalog | button · law/catalog | law-server-refresh | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f7deef56fb04d0f | SCREEN-law-catalog | button · law/catalog | 법령 변경 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6900f487e665c278 | SCREEN-law-catalog | button · law/catalog | 전체 법령 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b1006e593ec77eb6 | SCREEN-law-catalog | button · law/catalog | legal-law-filter | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-88b30ceb4ad3014c | SCREEN-spec-overview | section-title · spec/overview | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cabc572f39798c56 | SCREEN-spec-overview | table · spec/overview | 표 1 · 항목 / 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cabc572f39798c56-COL-01 | CMP-cabc572f39798c56 | table-column · spec/overview | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cabc572f39798c56-COL-02 | CMP-cabc572f39798c56 | table-column · spec/overview | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46314f178b3e1f88 | SCREEN-spec-overview | table · spec/overview | 표 2 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46314f178b3e1f88-COL-01 | CMP-46314f178b3e1f88 | table-column · spec/overview | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46314f178b3e1f88-COL-02 | CMP-46314f178b3e1f88 | table-column · spec/overview | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46314f178b3e1f88-COL-03 | CMP-46314f178b3e1f88 | table-column · spec/overview | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c148aebe000a309 | SCREEN-spec-overview | table · spec/overview | 표 3 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c148aebe000a309-COL-01 | CMP-5c148aebe000a309 | table-column · spec/overview | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c148aebe000a309-COL-02 | CMP-5c148aebe000a309 | table-column · spec/overview | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c148aebe000a309-COL-03 | CMP-5c148aebe000a309 | table-column · spec/overview | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-703dfbc171cac946 | SCREEN-spec-overview | table · spec/overview | 표 4 · 이번 재검토 / 내용 / 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-703dfbc171cac946-COL-01 | CMP-703dfbc171cac946 | table-column · spec/overview | 이번 재검토 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-703dfbc171cac946-COL-02 | CMP-703dfbc171cac946 | table-column · spec/overview | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-703dfbc171cac946-COL-03 | CMP-703dfbc171cac946 | table-column · spec/overview | 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b177320bf3518aff | SCREEN-spec-overview | button · spec/overview | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e748bd100e3bf38 | SCREEN-spec-overview | button · spec/overview | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d2c764f39e54b00c | SCREEN-spec-overview | button · spec/overview | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-462236749cadbe38 | SCREEN-spec-overview | button · spec/overview | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8f7e530612874b2c | SCREEN-spec-overview | button · spec/overview | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-16b0f1e8793d5932 | SCREEN-spec-overview | button · spec/overview | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0df9c4579e72aff8 | SCREEN-spec-overview | button · spec/overview | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dfb051ddf9451f47 | SCREEN-spec-overview | button · spec/overview | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c4848f4a8792f693 | SCREEN-spec-overview | button · spec/overview | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c3f610cbbc349d56 | SCREEN-spec-overview | button · spec/overview | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1a617a058bfffd05 | SCREEN-spec-overview | button · spec/overview | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e107dac224368f56 | SCREEN-spec-functions | section-title · spec/functions | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbf6a77d913a9516 | SCREEN-spec-functions | table · spec/functions | 표 1 · ID / 기능 / 현행 동작 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbf6a77d913a9516-COL-01 | CMP-fbf6a77d913a9516 | table-column · spec/functions | ID | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbf6a77d913a9516-COL-02 | CMP-fbf6a77d913a9516 | table-column · spec/functions | 기능 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbf6a77d913a9516-COL-03 | CMP-fbf6a77d913a9516 | table-column · spec/functions | 현행 동작 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbf6a77d913a9516-COL-04 | CMP-fbf6a77d913a9516 | table-column · spec/functions | 검수 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-723854cecba382b2 | SCREEN-spec-functions | table · spec/functions | 표 2 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-723854cecba382b2-COL-01 | CMP-723854cecba382b2 | table-column · spec/functions | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-723854cecba382b2-COL-02 | CMP-723854cecba382b2 | table-column · spec/functions | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-723854cecba382b2-COL-03 | CMP-723854cecba382b2 | table-column · spec/functions | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42d70f37ffc7b75c | SCREEN-spec-functions | table · spec/functions | 표 3 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42d70f37ffc7b75c-COL-01 | CMP-42d70f37ffc7b75c | table-column · spec/functions | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42d70f37ffc7b75c-COL-02 | CMP-42d70f37ffc7b75c | table-column · spec/functions | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42d70f37ffc7b75c-COL-03 | CMP-42d70f37ffc7b75c | table-column · spec/functions | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-31b9f7f3eaa0aed1 | SCREEN-spec-functions | table · spec/functions | 표 4 · 이번 재검토 / 내용 / 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-31b9f7f3eaa0aed1-COL-01 | CMP-31b9f7f3eaa0aed1 | table-column · spec/functions | 이번 재검토 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-31b9f7f3eaa0aed1-COL-02 | CMP-31b9f7f3eaa0aed1 | table-column · spec/functions | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-31b9f7f3eaa0aed1-COL-03 | CMP-31b9f7f3eaa0aed1 | table-column · spec/functions | 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fa1ea852d89a82ea | SCREEN-spec-functions | button · spec/functions | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7d16fd161b4763af | SCREEN-spec-functions | button · spec/functions | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cda745c6b0c86baa | SCREEN-spec-functions | button · spec/functions | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bfdf79e3d2fdfb06 | SCREEN-spec-functions | button · spec/functions | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2794bb26a6bec81f | SCREEN-spec-functions | button · spec/functions | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-579fdb9c31ff68ef | SCREEN-spec-functions | button · spec/functions | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7512f063f6c3b898 | SCREEN-spec-functions | button · spec/functions | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bca81379cd1579db | SCREEN-spec-functions | button · spec/functions | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95e792f999ebed9e | SCREEN-spec-functions | button · spec/functions | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3ec23644d61eec1b | SCREEN-spec-functions | button · spec/functions | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5818be930ff2cbd0 | SCREEN-spec-functions | button · spec/functions | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d84a943a5e7ac56d | SCREEN-spec-sdd | section-title · spec/sdd | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f1278d2fb91fc885 | SCREEN-spec-sdd | button · spec/sdd | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2d079e5b7b9787bc | SCREEN-spec-sdd | button · spec/sdd | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb2231b59f8b5810 | SCREEN-spec-sdd | button · spec/sdd | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fcc5263ff1000d5a | SCREEN-spec-sdd | button · spec/sdd | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-973d0590048c2733 | SCREEN-spec-sdd | button · spec/sdd | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7dc15de0d4b8dc3e | SCREEN-spec-sdd | button · spec/sdd | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a882665799e27638 | SCREEN-spec-sdd | button · spec/sdd | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-df26897ebc05c5ca | SCREEN-spec-sdd | button · spec/sdd | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-554b79833382bdba | SCREEN-spec-sdd | button · spec/sdd | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bf7ef9e17887fe13 | SCREEN-spec-sdd | button · spec/sdd | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-12089415cf1221ee | SCREEN-spec-sdd | button · spec/sdd | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2abdaf8f72c6006a | SCREEN-spec-tests | section-title · spec/tests | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6c37fef3d8820d7f | SCREEN-spec-tests | table · spec/tests | 표 1 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6c37fef3d8820d7f-COL-01 | CMP-6c37fef3d8820d7f | table-column · spec/tests | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6c37fef3d8820d7f-COL-02 | CMP-6c37fef3d8820d7f | table-column · spec/tests | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6c37fef3d8820d7f-COL-03 | CMP-6c37fef3d8820d7f | table-column · spec/tests | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8401428b3ab277f2 | SCREEN-spec-tests | table · spec/tests | 표 2 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8401428b3ab277f2-COL-01 | CMP-8401428b3ab277f2 | table-column · spec/tests | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8401428b3ab277f2-COL-02 | CMP-8401428b3ab277f2 | table-column · spec/tests | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8401428b3ab277f2-COL-03 | CMP-8401428b3ab277f2 | table-column · spec/tests | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0077caf4d737d14d | SCREEN-spec-tests | table · spec/tests | 표 3 · 이번 재검토 / 내용 / 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0077caf4d737d14d-COL-01 | CMP-0077caf4d737d14d | table-column · spec/tests | 이번 재검토 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0077caf4d737d14d-COL-02 | CMP-0077caf4d737d14d | table-column · spec/tests | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0077caf4d737d14d-COL-03 | CMP-0077caf4d737d14d | table-column · spec/tests | 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4cd2baa3334dab3e | SCREEN-spec-tests | button · spec/tests | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c90c9cd7e09d89cc | SCREEN-spec-tests | button · spec/tests | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0341ef953ca2ede8 | SCREEN-spec-tests | button · spec/tests | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f64a8bea11dc3b44 | SCREEN-spec-tests | button · spec/tests | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-735f1d4c75529ab6 | SCREEN-spec-tests | button · spec/tests | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af5dba140e85b444 | SCREEN-spec-tests | button · spec/tests | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f51f9f32d5f3a4a7 | SCREEN-spec-tests | button · spec/tests | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b4d48cec9f134036 | SCREEN-spec-tests | button · spec/tests | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8fc0b130f60e025a | SCREEN-spec-tests | button · spec/tests | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-642e355ba5471a08 | SCREEN-spec-tests | button · spec/tests | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03869952f92b8aa8 | SCREEN-spec-tests | button · spec/tests | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5a198a4f1a5f5701 | SCREEN-spec-data | section-title · spec/data | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1378881c46cdf42b | SCREEN-spec-data | button · spec/data | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3a4ea77f6acdd66 | SCREEN-spec-data | button · spec/data | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-548a3467f1c4d119 | SCREEN-spec-data | button · spec/data | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca859a180cb41baf | SCREEN-spec-data | button · spec/data | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10ed697409409a64 | SCREEN-spec-data | button · spec/data | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2eae18fb555b3255 | SCREEN-spec-data | button · spec/data | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-633ee12d36875f7c | SCREEN-spec-data | button · spec/data | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fd7530acfff2a6d4 | SCREEN-spec-data | button · spec/data | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a24cf84a0b18a6af | SCREEN-spec-data | button · spec/data | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-977f8aec334f091f | SCREEN-spec-data | button · spec/data | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ddd2d249e579231 | SCREEN-spec-data | button · spec/data | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aa7fc30f56715732 | SCREEN-spec-history | section-title · spec/history | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-052e0c0d7eaf2a74 | SCREEN-spec-history | section-title · spec/history | 당시 개발·검수 기록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af653badb578cd70 | SCREEN-spec-history | section-title · spec/history | 현재 업무 변경이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-014a2c15b8fa30c8 | SCREEN-spec-history | table · spec/history | 표 1 · 버전 / 변경·근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-014a2c15b8fa30c8-COL-01 | CMP-014a2c15b8fa30c8 | table-column · spec/history | 버전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-014a2c15b8fa30c8-COL-02 | CMP-014a2c15b8fa30c8 | table-column · spec/history | 변경·근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce66f8622d205e9b | SCREEN-spec-history | table · spec/history | 표 2 · 시각 / 프로젝트 / 행위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce66f8622d205e9b-COL-01 | CMP-ce66f8622d205e9b | table-column · spec/history | 시각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce66f8622d205e9b-COL-02 | CMP-ce66f8622d205e9b | table-column · spec/history | 프로젝트 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce66f8622d205e9b-COL-03 | CMP-ce66f8622d205e9b | table-column · spec/history | 행위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce66f8622d205e9b-COL-04 | CMP-ce66f8622d205e9b | table-column · spec/history | 변경내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dfe704ac9d1b4f7f | SCREEN-spec-history | button · spec/history | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fa07c7851e20eece | SCREEN-spec-history | button · spec/history | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a3d303aae9b97915 | SCREEN-spec-history | button · spec/history | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c3a5674ca44b6e8 | SCREEN-spec-history | button · spec/history | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f8cf4e6221f97548 | SCREEN-spec-history | button · spec/history | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ef9b310b4ecf25a7 | SCREEN-spec-history | button · spec/history | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0970f9920ecbe48b | SCREEN-spec-history | button · spec/history | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b7c1404bba223be5 | SCREEN-spec-history | button · spec/history | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03f995d409baf522 | SCREEN-spec-history | button · spec/history | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b6d2b911ff64f23f | SCREEN-spec-history | button · spec/history | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a439abba66e66582 | SCREEN-spec-history | button · spec/history | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-59eb2747e36d22be | SCREEN-spec-history | button · spec/history | 변경 전후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5980ded37fcc4e2d | SCREEN-spec-feedback | section-title · spec/feedback | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edc379b414506b9e | SCREEN-spec-feedback | table · spec/feedback | 표 1 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edc379b414506b9e-COL-01 | CMP-edc379b414506b9e | table-column · spec/feedback | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edc379b414506b9e-COL-02 | CMP-edc379b414506b9e | table-column · spec/feedback | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edc379b414506b9e-COL-03 | CMP-edc379b414506b9e | table-column · spec/feedback | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-73c4609ed1d01381 | SCREEN-spec-feedback | table · spec/feedback | 표 2 · 후속 요구 / 내용 / 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-73c4609ed1d01381-COL-01 | CMP-73c4609ed1d01381 | table-column · spec/feedback | 후속 요구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-73c4609ed1d01381-COL-02 | CMP-73c4609ed1d01381 | table-column · spec/feedback | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-73c4609ed1d01381-COL-03 | CMP-73c4609ed1d01381 | table-column · spec/feedback | 현재 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97482928c3c9d0b7 | SCREEN-spec-feedback | table · spec/feedback | 표 3 · 이번 재검토 / 내용 / 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97482928c3c9d0b7-COL-01 | CMP-97482928c3c9d0b7 | table-column · spec/feedback | 이번 재검토 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97482928c3c9d0b7-COL-02 | CMP-97482928c3c9d0b7 | table-column · spec/feedback | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97482928c3c9d0b7-COL-03 | CMP-97482928c3c9d0b7 | table-column · spec/feedback | 빌드 시점 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e31a3695c08145a7 | SCREEN-spec-feedback | button · spec/feedback | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1325e84873940256 | SCREEN-spec-feedback | button · spec/feedback | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1a958e279b01acb | SCREEN-spec-feedback | button · spec/feedback | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5611e45420785a5b | SCREEN-spec-feedback | button · spec/feedback | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c1407305d67ae3fb | SCREEN-spec-feedback | button · spec/feedback | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c74fb02daa82d550 | SCREEN-spec-feedback | button · spec/feedback | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe42ad6dfca3e1b6 | SCREEN-spec-feedback | button · spec/feedback | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fc9388b75991892f | SCREEN-spec-feedback | button · spec/feedback | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-45319d3d1f9d2735 | SCREEN-spec-feedback | button · spec/feedback | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4cb0a1c06b62e582 | SCREEN-spec-feedback | button · spec/feedback | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e7f55aaa1dc8ede8 | SCREEN-spec-feedback | button · spec/feedback | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-26e990007ee95506 | SCREEN-spec-json | section-title · spec/json | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-050768324e46ea5c | SCREEN-spec-json | button · spec/json | 개요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-54c9cfeb33562f95 | SCREEN-spec-json | button · spec/json | 기능정의서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c51270573c8aeabe | SCREEN-spec-json | button · spec/json | SDD | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-85a50675a70281db | SCREEN-spec-json | button · spec/json | TDD·검수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b3f6c9ca6102de93 | SCREEN-spec-json | button · spec/json | 데이터 구조 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b6db58b2c225377 | SCREEN-spec-json | button · spec/json | 개발이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-de0525c432b55569 | SCREEN-spec-json | button · spec/json | 피드백 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-67b23e45c842c338 | SCREEN-spec-json | button · spec/json | 전체 JSON | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ecb72da3407f6ade | SCREEN-spec-json | button · spec/json | spec-copy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-575ff2be8dbdc069 | SCREEN-spec-json | button · spec/json | export-spec | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f6a43e3cd5aaadda | SCREEN-spec-json | button · spec/json | export-data | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1aef099a9367709c | SCREEN-portfolio | popup · portfolio/ | 프로젝트 등록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-66ab9c1d20f2591a | CMP-1aef099a9367709c | popup-field · portfolio/ | 프로젝트 코드 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f9e3c809885a8b0d | CMP-1aef099a9367709c | popup-field · portfolio/ | 사업유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac9a7974e798d62b | CMP-1aef099a9367709c | popup-field · portfolio/ | 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8cf1bba920b5efed | CMP-1aef099a9367709c | popup-field · portfolio/ | 소재지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-175d4bee81266d20 | CMP-1aef099a9367709c | popup-field · portfolio/ | 사업시행 법인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7fa3bb6faac662a9 | CMP-1aef099a9367709c | popup-field · portfolio/ | 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-021f7fd3495a5027 | CMP-1aef099a9367709c | popup-field · portfolio/ | 연면적 ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f5cc970504268df2 | CMP-1aef099a9367709c | popup-field · portfolio/ | 대지면적 ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-39a3feb8287bcdf3 | CMP-1aef099a9367709c | popup-field · portfolio/ | 취득대상 토지면적 ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fca76a1df77145d7 | CMP-1aef099a9367709c | popup-field · portfolio/ | 자료명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ecda568997a95f91 | CMP-1aef099a9367709c | popup-field · portfolio/ | 자료 위치 · 시트/페이지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fadc89e4e48f96e1 | CMP-1aef099a9367709c | popup-field · portfolio/ | 자료 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0be5147b96b882c | CMP-1aef099a9367709c | popup-field · portfolio/ | 공통 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-268f9a789ef7c566 | CMP-1aef099a9367709c | popup-button · portfolio/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fac717d8b4bc787c | CMP-1aef099a9367709c | popup-button · portfolio/ | 등록 초안 저장 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9500835fa7c1c8a3 | CMP-1aef099a9367709c | popup-button · portfolio/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cf60b43b4cd0f74b | SCREEN-portfolio | popup · portfolio/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-2a6c22db5fcb31af | CMP-cf60b43b4cd0f74b | popup-table · portfolio/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2a6c22db5fcb31af-COL-1 | CMP-2a6c22db5fcb31af | popup-table-column · portfolio/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2a6c22db5fcb31af-COL-2 | CMP-2a6c22db5fcb31af | popup-table-column · portfolio/ | 최초 언더라이팅 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2a6c22db5fcb31af-COL-3 | CMP-2a6c22db5fcb31af | popup-table-column · portfolio/ | 준공추정원가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2a6c22db5fcb31af-COL-4 | CMP-2a6c22db5fcb31af | popup-table-column · portfolio/ | 평당가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-59d571c1e85d023d | CMP-cf60b43b4cd0f74b | popup-button · portfolio/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f95a5f970554a012 | SCREEN-overview | inline-panel-state · overview/ | 전문인력 명단 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c | CMP-f95a5f970554a012 | popup-table · overview/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c-COL-1 | CMP-812105440da4578c | popup-table-column · overview/ | 이름·소속 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c-COL-2 | CMP-812105440da4578c | popup-table-column · overview/ | 자격·경력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c-COL-3 | CMP-812105440da4578c | popup-table-column · overview/ | 교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c-COL-4 | CMP-812105440da4578c | popup-table-column · overview/ | 재직 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c-COL-5 | CMP-812105440da4578c | popup-table-column · overview/ | 등록명단 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c-COL-6 | CMP-812105440da4578c | popup-table-column · overview/ | 증빙 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-812105440da4578c-COL-7 | CMP-812105440da4578c | popup-table-column · overview/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-309268db4695d825 | CMP-f95a5f970554a012 | popup-table · overview/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-309268db4695d825-COL-1 | CMP-309268db4695d825 | popup-table-column · overview/ | 이름 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-309268db4695d825-COL-2 | CMP-309268db4695d825 | popup-table-column · overview/ | 실제 퇴사일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-309268db4695d825-COL-3 | CMP-309268db4695d825 | popup-table-column · overview/ | 등록명단 종료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-309268db4695d825-COL-4 | CMP-309268db4695d825 | popup-table-column · overview/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4562a0c3c7669a30 | CMP-f95a5f970554a012 | popup-table · overview/ | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4562a0c3c7669a30-COL-1 | CMP-4562a0c3c7669a30 | popup-table-column · overview/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4562a0c3c7669a30-COL-2 | CMP-4562a0c3c7669a30 | popup-table-column · overview/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-82c53a5a6763f0de | CMP-f95a5f970554a012 | popup-button · overview/ | 부지·토지계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6c2c48f5d4763414 | CMP-f95a5f970554a012 | popup-button · overview/ | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-948f27a40f91cc16 | CMP-f95a5f970554a012 | popup-button · overview/ | 착공·공사·준공 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0dd87e1dd6fdda3c | CMP-f95a5f970554a012 | popup-button · overview/ | 분양·매각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-94e55bfceef3c43e | CMP-f95a5f970554a012 | popup-button · overview/ | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57cfc47509ba0eed | CMP-f95a5f970554a012 | popup-button · overview/ | + 전문인력 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a7aa65cbd309033a | CMP-f95a5f970554a012 | popup-button · overview/ | 경로 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e41253bdcf6fd94c | CMP-f95a5f970554a012 | popup-button · overview/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3a04a911f1e10514 | CMP-f95a5f970554a012 | popup-button · overview/ | 퇴사 처리 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f44a978093a6dc1 | CMP-f95a5f970554a012 | popup-button · overview/ | 복구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-151a5f6ab9861482 | CMP-f95a5f970554a012 | popup-button · overview/ | 등록정보 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb4599665acaaeb4 | SCREEN-overview | inline-panel-state · overview/ | 개발업 등록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d4cc6e8d88e5f103 | CMP-fb4599665acaaeb4 | popup-field · overview/ | 단계명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-daeb54a7a7c3ccfb | CMP-fb4599665acaaeb4 | popup-field · overview/ | 예정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d577e3f5e55f5fed | CMP-fb4599665acaaeb4 | popup-field · overview/ | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1684a051ffd77970 | CMP-fb4599665acaaeb4 | popup-field · overview/ | 실제 완료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9533c10128283855 | CMP-fb4599665acaaeb4 | popup-field · overview/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89d2ed888f8973f3 | CMP-fb4599665acaaeb4 | popup-table · overview/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89d2ed888f8973f3-COL-1 | CMP-89d2ed888f8973f3 | popup-table-column · overview/ | 발생일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89d2ed888f8973f3-COL-2 | CMP-89d2ed888f8973f3 | popup-table-column · overview/ | 현안 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89d2ed888f8973f3-COL-3 | CMP-89d2ed888f8973f3 | popup-table-column · overview/ | 진행내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89d2ed888f8973f3-COL-4 | CMP-89d2ed888f8973f3 | popup-table-column · overview/ | 원가 영향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89d2ed888f8973f3-COL-5 | CMP-89d2ed888f8973f3 | popup-table-column · overview/ | 일정 영향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89d2ed888f8973f3-COL-6 | CMP-89d2ed888f8973f3 | popup-table-column · overview/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e | CMP-fb4599665acaaeb4 | popup-table · overview/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e-COL-1 | CMP-47d2f9f3a3328e8e | popup-table-column · overview/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e-COL-2 | CMP-47d2f9f3a3328e8e | popup-table-column · overview/ | 변경 전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e-COL-3 | CMP-47d2f9f3a3328e8e | popup-table-column · overview/ | 변경 후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e-COL-4 | CMP-47d2f9f3a3328e8e | popup-table-column · overview/ | 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e-COL-5 | CMP-47d2f9f3a3328e8e | popup-table-column · overview/ | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e-COL-6 | CMP-47d2f9f3a3328e8e | popup-table-column · overview/ | 일시 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47d2f9f3a3328e8e-COL-7 | CMP-47d2f9f3a3328e8e | popup-table-column · overview/ | 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-11a4aa4fd962466f | CMP-fb4599665acaaeb4 | popup-button · overview/ | 등록정보 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b91a9d0ccdeee2f7 | CMP-fb4599665acaaeb4 | popup-button · overview/ | + 일정 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eb37d2b5d476b838 | CMP-fb4599665acaaeb4 | popup-button · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64892513643c7db0 | CMP-fb4599665acaaeb4 | popup-button · overview/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-abffcc24f58a55d4 | CMP-fb4599665acaaeb4 | popup-button · overview/ | 인허가 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-934d3a5fd17da846 | CMP-fb4599665acaaeb4 | popup-button · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2607f8d4ea512659 | CMP-fb4599665acaaeb4 | popup-button · overview/ | 원가현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a67422454b50a73e | CMP-fb4599665acaaeb4 | popup-button · overview/ | 조달 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8235cbb2c3f7e9ac | CMP-fb4599665acaaeb4 | popup-button · overview/ | 보고서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e12c8b292b13e0c1 | CMP-fb4599665acaaeb4 | popup-button · overview/ | + 현안 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b3b6479fa1c4104e | CMP-fb4599665acaaeb4 | popup-button · overview/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0c84684cce5fd225 | CMP-fb4599665acaaeb4 | popup-button · overview/ | 전체 이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-84dd5d0e4dcee470 | SCREEN-overview | inline-panel-state · overview/ | 개발업 등록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-f63d34fa01dc5c94 | CMP-84dd5d0e4dcee470 | popup-field · overview/ | 단계명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1597ac924e8a9de8 | CMP-84dd5d0e4dcee470 | popup-field · overview/ | 예정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ca5f85b3c3a8016 | CMP-84dd5d0e4dcee470 | popup-field · overview/ | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b5ee26ef76d70b43 | CMP-84dd5d0e4dcee470 | popup-field · overview/ | 실제 완료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0e4633aa12368e24 | CMP-84dd5d0e4dcee470 | popup-field · overview/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3ba56512e1bec0 | CMP-84dd5d0e4dcee470 | popup-table · overview/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3ba56512e1bec0-COL-1 | CMP-8d3ba56512e1bec0 | popup-table-column · overview/ | 발생일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3ba56512e1bec0-COL-2 | CMP-8d3ba56512e1bec0 | popup-table-column · overview/ | 현안 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3ba56512e1bec0-COL-3 | CMP-8d3ba56512e1bec0 | popup-table-column · overview/ | 진행내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3ba56512e1bec0-COL-4 | CMP-8d3ba56512e1bec0 | popup-table-column · overview/ | 원가 영향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3ba56512e1bec0-COL-5 | CMP-8d3ba56512e1bec0 | popup-table-column · overview/ | 일정 영향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3ba56512e1bec0-COL-6 | CMP-8d3ba56512e1bec0 | popup-table-column · overview/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228 | CMP-84dd5d0e4dcee470 | popup-table · overview/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228-COL-1 | CMP-428134d5fb5c8228 | popup-table-column · overview/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228-COL-2 | CMP-428134d5fb5c8228 | popup-table-column · overview/ | 변경 전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228-COL-3 | CMP-428134d5fb5c8228 | popup-table-column · overview/ | 변경 후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228-COL-4 | CMP-428134d5fb5c8228 | popup-table-column · overview/ | 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228-COL-5 | CMP-428134d5fb5c8228 | popup-table-column · overview/ | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228-COL-6 | CMP-428134d5fb5c8228 | popup-table-column · overview/ | 일시 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-428134d5fb5c8228-COL-7 | CMP-428134d5fb5c8228 | popup-table-column · overview/ | 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edd1462eb284b912 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 등록정보 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-15ce57caeeedb313 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | + 일정 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ed29233dc2331c76 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dfaa3c01285e5c79 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 뒤로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0c380f3e501bcde1 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-407845b2f285f00a | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8791f7268cb59835 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1b317850f673f7a | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 인허가 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e5f49b1a921c30c7 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-16e1a4b9d7dc4488 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 원가현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5f77895ad8628961 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 조달 현황 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-49f296c56fbc19d1 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 보고서 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a07890d9d7a980f9 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | + 현안 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4182e283a539ce37 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-536b32aea4cf572e | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 전체 이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-38951f7defeeeeb4 | CMP-84dd5d0e4dcee470 | popup-button · overview/ | 앞으로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6a8df2a430e0f967 | SCREEN-overview | popup · overview/ | 현안 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-ede0bc824bfd28ba | CMP-6a8df2a430e0f967 | popup-field · overview/ | 발생일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6ed190d080d85836 | CMP-6a8df2a430e0f967 | popup-field · overview/ | 현안 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cf9353ee4d1377fd | CMP-6a8df2a430e0f967 | popup-field · overview/ | 진행내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3fba7cf5d28de69b | CMP-6a8df2a430e0f967 | popup-field · overview/ | 원가 영향 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b48f2b168e260082 | CMP-6a8df2a430e0f967 | popup-field · overview/ | 일정 영향 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9e0eb8fb1805aa83 | CMP-6a8df2a430e0f967 | popup-button · overview/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a346887e1804c537 | CMP-6a8df2a430e0f967 | popup-button · overview/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f78c13c7e9436965 | SCREEN-overview | popup · overview/ | 전체 원가 변경이력 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef | CMP-f78c13c7e9436965 | popup-table · overview/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef-COL-1 | CMP-fb398d1887a230ef | popup-table-column · overview/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef-COL-2 | CMP-fb398d1887a230ef | popup-table-column · overview/ | 변경 전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef-COL-3 | CMP-fb398d1887a230ef | popup-table-column · overview/ | 변경 후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef-COL-4 | CMP-fb398d1887a230ef | popup-table-column · overview/ | 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef-COL-5 | CMP-fb398d1887a230ef | popup-table-column · overview/ | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef-COL-6 | CMP-fb398d1887a230ef | popup-table-column · overview/ | 일시 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb398d1887a230ef-COL-7 | CMP-fb398d1887a230ef | popup-table-column · overview/ | 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-212be5fd161939a2 | CMP-f78c13c7e9436965 | popup-button · overview/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-366264f50c3dbb50 | SCREEN-cost-overview | popup · cost/overview | 원가 증감요인 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-6b0f8764de7611de | CMP-366264f50c3dbb50 | popup-table · cost/overview | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b0f8764de7611de-COL-1 | CMP-6b0f8764de7611de | popup-table-column · cost/overview | 발생일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b0f8764de7611de-COL-2 | CMP-6b0f8764de7611de | popup-table-column · cost/overview | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b0f8764de7611de-COL-3 | CMP-6b0f8764de7611de | popup-table-column · cost/overview | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b0f8764de7611de-COL-4 | CMP-6b0f8764de7611de | popup-table-column · cost/overview | 시점 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-419837ad6e55ccfe | CMP-366264f50c3dbb50 | popup-button · cost/overview | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-22200428edd1d472 | SCREEN-cost-overview | popup · cost/overview | 언더라이팅 대비 사업비 증감 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-b412cbbd8cd4c393 | CMP-22200428edd1d472 | popup-table · cost/overview | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b412cbbd8cd4c393-COL-1 | CMP-b412cbbd8cd4c393 | popup-table-column · cost/overview | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b412cbbd8cd4c393-COL-2 | CMP-b412cbbd8cd4c393 | popup-table-column · cost/overview | 최초 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b412cbbd8cd4c393-COL-3 | CMP-b412cbbd8cd4c393 | popup-table-column · cost/overview | 현재 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b412cbbd8cd4c393-COL-4 | CMP-b412cbbd8cd4c393 | popup-table-column · cost/overview | 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b412cbbd8cd4c393-COL-5 | CMP-b412cbbd8cd4c393 | popup-table-column · cost/overview | 비교기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d55ff86aebf27f72 | CMP-22200428edd1d472 | popup-button · cost/overview | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-da4fb5a49da6e6c3 | SCREEN-cost-overview | popup · cost/overview | 토지비 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-0df923329ef02341 | CMP-da4fb5a49da6e6c3 | popup-table · cost/overview | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0df923329ef02341-COL-1 | CMP-0df923329ef02341 | popup-table-column · cost/overview | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0df923329ef02341-COL-2 | CMP-0df923329ef02341 | popup-table-column · cost/overview | 현재 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0df923329ef02341-COL-3 | CMP-0df923329ef02341 | popup-table-column · cost/overview | 평당가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4335b871ae8bcf57 | CMP-da4fb5a49da6e6c3 | popup-button · cost/overview | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3dfb7843177f5873 | SCREEN-cost-overview | popup · cost/overview | 자기자본 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-0edced21f9f0b2c1 | CMP-3dfb7843177f5873 | popup-table · cost/overview | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0edced21f9f0b2c1-COL-1 | CMP-0edced21f9f0b2c1 | popup-table-column · cost/overview | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0edced21f9f0b2c1-COL-2 | CMP-0edced21f9f0b2c1 | popup-table-column · cost/overview | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2fccac523551d5a5 | CMP-3dfb7843177f5873 | popup-button · cost/overview | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-40e8b7b490cfe4db | SCREEN-cost-detail | popup · cost/detail | 사업비 항목 선택·추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-e7c971c836e3f434 | CMP-40e8b7b490cfe4db | popup-field · cost/detail | 사업비 항목 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6cf64471dd7a58a7 | CMP-40e8b7b490cfe4db | popup-table · cost/detail | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6cf64471dd7a58a7-COL-1 | CMP-6cf64471dd7a58a7 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6cf64471dd7a58a7-COL-2 | CMP-6cf64471dd7a58a7 | popup-table-column · cost/detail | 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb1fbea43e3078be | CMP-40e8b7b490cfe4db | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-986a67a3429ac11a | CMP-40e8b7b490cfe4db | popup-button · cost/detail | 직접 입력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c03fb318d3abb7c5 | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eeae8a9ad79907ed | CMP-40e8b7b490cfe4db | popup-button · cost/detail | 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d47d4a18c8d01b5 | CMP-40e8b7b490cfe4db | popup-button · cost/detail | 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-466eefb23e6ffbce | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-44d0d36f1763f656 | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7183041903c49451 | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-06edb888b979806b | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b50b2933ea4af4b0 | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-da3d1c6f68bfe98c | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a344433460d3b3a5 | CMP-40e8b7b490cfe4db | popup-button · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe1c9036ad05ce5b | SCREEN-cost-detail | popup · cost/detail | 용도별 사업비 프리셋 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-1fe113e6419564af | CMP-fe1c9036ad05ce5b | popup-table · cost/detail | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1fe113e6419564af-COL-1 | CMP-1fe113e6419564af | popup-table-column · cost/detail | 사업 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1fe113e6419564af-COL-2 | CMP-1fe113e6419564af | popup-table-column · cost/detail | 미리보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0e4b5f93378500b1 | CMP-fe1c9036ad05ce5b | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2883b86daf7ca4e1 | CMP-fe1c9036ad05ce5b | popup-button · cost/detail | 미리보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-beb9732a665f21c8 | SCREEN-cost-detail | popup · cost/detail | 비교시점 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-b00c0809df5a6ae4 | CMP-beb9732a665f21c8 | popup-field · cost/detail | 시점 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-96b616152c2ff22e | CMP-beb9732a665f21c8 | popup-field · cost/detail | 시점명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b54e489708456365 | CMP-beb9732a665f21c8 | popup-field · cost/detail | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-467b4319f2850319 | CMP-beb9732a665f21c8 | popup-field · cost/detail | 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cf8e1a540c7f904a | CMP-beb9732a665f21c8 | popup-field · cost/detail | 금액 입력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb8fea2e7ccf1034 | CMP-beb9732a665f21c8 | popup-field · cost/detail | 입력항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8c4413341a04dc45 | CMP-beb9732a665f21c8 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f43336373a3eff5b | CMP-beb9732a665f21c8 | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f702acc45e8dd06c | SCREEN-cost-detail | popup · cost/detail | 사업비 시점 기록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-f20f553d76482ce9 | CMP-f702acc45e8dd06c | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-251c0be9c4c28c98 | CMP-f702acc45e8dd06c | popup-button · cost/detail | 다시 불러오기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-db4c14c200429a89 | SCREEN-cost-detail | popup · cost/detail | 최초 언더라이팅 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-dfbda849f4b4b8e3 | CMP-db4c14c200429a89 | popup-table · cost/detail | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dfbda849f4b4b8e3-COL-1 | CMP-dfbda849f4b4b8e3 | popup-table-column · cost/detail | 면적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dfbda849f4b4b8e3-COL-2 | CMP-dfbda849f4b4b8e3 | popup-table-column · cost/detail | 당시 값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ce3d5fb522b1e78 | CMP-db4c14c200429a89 | popup-table · cost/detail | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ce3d5fb522b1e78-COL-1 | CMP-1ce3d5fb522b1e78 | popup-table-column · cost/detail | 당시 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ce3d5fb522b1e78-COL-2 | CMP-1ce3d5fb522b1e78 | popup-table-column · cost/detail | 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ce3d5fb522b1e78-COL-3 | CMP-1ce3d5fb522b1e78 | popup-table-column · cost/detail | 당시 평당가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ce3d5fb522b1e78-COL-4 | CMP-1ce3d5fb522b1e78 | popup-table-column · cost/detail | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c51865f197023906 | CMP-db4c14c200429a89 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d82284f2c13ef44a | CMP-db4c14c200429a89 | popup-button · cost/detail | 정정본 만들기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ea9363b4e1f0e78e | SCREEN-cost-detail | popup · cost/detail | 개발 면적 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d242a799cb492cf1 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cd4c6b8b1d2a05d4 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4fec102e49b94431 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1479205e1e779268 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5804a3fb620e2e7e | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-863a6755d9b3f5e5 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdfac0c5862795cb | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9d8216fc401a40b8 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | 면적 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7b58fa7e98d8a4b7 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | 자료 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4c30ea63ee91df37 | CMP-ea9363b4e1f0e78e | popup-field · cost/detail | 면적 근거 공용폴더 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-27fd42caec824ade | CMP-ea9363b4e1f0e78e | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8ecaded3b2c667f2 | CMP-ea9363b4e1f0e78e | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3303b2abc9277d53 | SCREEN-cost-detail | popup · cost/detail | 전체 사업비 이력 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5 | CMP-3303b2abc9277d53 | popup-table · cost/detail | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5-COL-1 | CMP-f3006d26b12d24a5 | popup-table-column · cost/detail | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5-COL-2 | CMP-f3006d26b12d24a5 | popup-table-column · cost/detail | 변경 전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5-COL-3 | CMP-f3006d26b12d24a5 | popup-table-column · cost/detail | 변경 후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5-COL-4 | CMP-f3006d26b12d24a5 | popup-table-column · cost/detail | 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5-COL-5 | CMP-f3006d26b12d24a5 | popup-table-column · cost/detail | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5-COL-6 | CMP-f3006d26b12d24a5 | popup-table-column · cost/detail | 일시 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3006d26b12d24a5-COL-7 | CMP-f3006d26b12d24a5 | popup-table-column · cost/detail | 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95c07c67357f00ed | CMP-3303b2abc9277d53 | popup-table · cost/detail | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95c07c67357f00ed-COL-1 | CMP-95c07c67357f00ed | popup-table-column · cost/detail | 시점 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95c07c67357f00ed-COL-2 | CMP-95c07c67357f00ed | popup-table-column · cost/detail | 동일 범위 당시 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95c07c67357f00ed-COL-3 | CMP-95c07c67357f00ed | popup-table-column · cost/detail | 당시 평당가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95c07c67357f00ed-COL-4 | CMP-95c07c67357f00ed | popup-table-column · cost/detail | 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21287466015de386 | CMP-3303b2abc9277d53 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20d478c97856caaf | SCREEN-cost-detail | popup · cost/detail | 항목 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d8710c05b082187c | CMP-20d478c97856caaf | popup-field · cost/detail | 비용 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4fe6461804a4407a | CMP-20d478c97856caaf | popup-field · cost/detail | 명칭 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8c573e65a33c0e0b | CMP-20d478c97856caaf | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-48f85a019857b7e1 | CMP-20d478c97856caaf | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4d1c9e8a424850a4 | SCREEN-cost-detail | popup · cost/detail | 사업비 분류 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-c62de5a93f3c234b | CMP-4d1c9e8a424850a4 | popup-field · cost/detail | 분류할 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-35175bbeec2e7236 | CMP-4d1c9e8a424850a4 | popup-field · cost/detail | 대분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a756328a4e20289a | CMP-4d1c9e8a424850a4 | popup-field · cost/detail | 원가항목명 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b496b1b7118d5d98 | CMP-4d1c9e8a424850a4 | popup-field · cost/detail | 분류 근거 경로 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1848c0919435d812 | CMP-4d1c9e8a424850a4 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b8446aac87b340 | CMP-4d1c9e8a424850a4 | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-446465798e4701d7 | SCREEN-cost-detail | popup · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-0fdede70d60a4856 | CMP-446465798e4701d7 | popup-field · cost/detail | 기록 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-561d9320c5a05464 | CMP-446465798e4701d7 | popup-field · cost/detail | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a666af5482ad7f74 | CMP-446465798e4701d7 | popup-field · cost/detail | 공급가액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9a345fc294715e9a | CMP-446465798e4701d7 | popup-field · cost/detail | 부가세 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e51915e21e0a0435 | CMP-446465798e4701d7 | popup-field · cost/detail | 거래총액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5fbd5be226a5b089 | CMP-446465798e4701d7 | popup-field · cost/detail | 기존 원가 금액 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d43d26f4d529b468 | CMP-446465798e4701d7 | popup-field · cost/detail | 거래 부가세 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f8006562f0a42cb5 | CMP-446465798e4701d7 | popup-field · cost/detail | 원가 귀속 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fc6556a23fa21a95 | CMP-446465798e4701d7 | popup-field · cost/detail | 공제 검토 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-de4d8c5d92360cae | CMP-446465798e4701d7 | popup-field · cost/detail | 검토 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3cb36b43017f28ec | CMP-446465798e4701d7 | popup-field · cost/detail | 담당자가 확인한 안분 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9906b573d88671ca | CMP-446465798e4701d7 | popup-field · cost/detail | 면세·불공제 대상 분자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ab479dcec7ecf28 | CMP-446465798e4701d7 | popup-field · cost/detail | 전체 대상 분모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8c9eb73f105df9f6 | CMP-446465798e4701d7 | popup-field · cost/detail | 기준 단위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f7154a08f0e900b6 | CMP-446465798e4701d7 | popup-field · cost/detail | 안분 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8304d188b0d9931e | CMP-446465798e4701d7 | popup-field · cost/detail | 증빙 수취 주체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cb8bd9c28d25ca47 | CMP-446465798e4701d7 | popup-field · cost/detail | 해당 과세기간 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aad529af4b0e1d9f | CMP-446465798e4701d7 | popup-field · cost/detail | 검토 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec72d2c3d7b19d9f | CMP-446465798e4701d7 | popup-field · cost/detail | 계약·증빙 또는 가정 근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-34fe1a408525bc59 | CMP-446465798e4701d7 | popup-field · cost/detail | 불공제·안분 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5b41661eea103ef3 | CMP-446465798e4701d7 | popup-field · cost/detail | 원가표 금액 반영 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9a1144fca370d3e2 | CMP-446465798e4701d7 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a617de5bad8d052d | CMP-446465798e4701d7 | popup-button · cost/detail | 공제 · 건물분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aaf3f0b30c2785d4 | CMP-446465798e4701d7 | popup-button · cost/detail | 공제 · 기타 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b4907988cc6d4ba4 | CMP-446465798e4701d7 | popup-button · cost/detail | 불공제 · 토지분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-357f5f79e31ea02c | CMP-446465798e4701d7 | popup-button · cost/detail | 불공제 · 기타 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d12d9553e1dd214b | CMP-446465798e4701d7 | popup-button · cost/detail | 공통 · 건물+토지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0fb02573d01a9fc | CMP-446465798e4701d7 | popup-button · cost/detail | 세액 없음 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d28dea3493a649b1 | CMP-446465798e4701d7 | popup-button · cost/detail | 미확정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a22c10d072f148ed | CMP-446465798e4701d7 | popup-button · cost/detail | 기존 불공제액 연결 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-44cdeb270fefc35a | CMP-446465798e4701d7 | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-352683ca453cd213 | SCREEN-cost-detail | popup · cost/detail | 다른 관리항목에 합치기 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-ccccc4f97ded7835 | CMP-352683ca453cd213 | popup-field · cost/detail | 합칠 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9908a5eaa6efe768 | CMP-352683ca453cd213 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1cc17310f38bfe97 | CMP-352683ca453cd213 | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3fb799ab52751904 | SCREEN-cost-benchmark | popup · cost/benchmark | 평당 공사비 비교 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7 | CMP-3fb799ab52751904 | popup-table · cost/benchmark | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-1 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-2 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-3 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 준공연도 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-4 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 연면적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-5 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 공사범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-6 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 공사비 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-7 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 입력 평당가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bdd470a9812871d7-COL-8 | CMP-bdd470a9812871d7 | popup-table-column · cost/benchmark | 금액·면적 산출값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d036632ff3e9952 | CMP-3fb799ab52751904 | popup-button · cost/benchmark | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eda7169018203f40 | SCREEN-cost-benchmark | popup · cost/benchmark | 유사사업 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d7a3fe58cf64814f | CMP-eda7169018203f40 | popup-field · cost/benchmark | 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-90e8516ddf534b3a | CMP-eda7169018203f40 | popup-field · cost/benchmark | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aeb1760eace55af0 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 준공연도 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b8e85a4f56422efa | CMP-eda7169018203f40 | popup-field · cost/benchmark | 연면적 · ㎡ | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-70291c093c4f1085 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 공사비 · 원 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b59563b1c7089f91 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 참고 평당가 · 만원/평 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c8d5defe6afb28bf | CMP-eda7169018203f40 | popup-field · cost/benchmark | 공사 포함범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a49fddb05b299774 | CMP-eda7169018203f40 | popup-field · cost/benchmark | VAT 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0d495daaac0fb897 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 출처명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-777761f60713ee58 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 출처 URL | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-271dd2705f76d46e | CMP-eda7169018203f40 | popup-field · cost/benchmark | 원문 공용폴더 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e82f1f11ed2cce37 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 금액 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3bff0e415d290eb9 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 면적 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ba20a971165e606 | CMP-eda7169018203f40 | popup-field · cost/benchmark | 면적 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-32cdb314d9c21d3a | CMP-eda7169018203f40 | popup-button · cost/benchmark | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9e294b54c9b41d0d | CMP-eda7169018203f40 | popup-button · cost/benchmark | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1a03166b5049401e | SCREEN-cost-benchmark | popup · cost/benchmark | 공사비 비교 근거 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-7eb3a85827b8d554 | CMP-1a03166b5049401e | popup-table · cost/benchmark | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7eb3a85827b8d554-COL-1 | CMP-7eb3a85827b8d554 | popup-table-column · cost/benchmark | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7eb3a85827b8d554-COL-2 | CMP-7eb3a85827b8d554 | popup-table-column · cost/benchmark | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cd94f99a498192bf | CMP-1a03166b5049401e | popup-button · cost/benchmark | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3c1e93ec2d9b4ed0 | SCREEN-cost-benchmark | popup · cost/benchmark | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-95dd9aa04341512b | CMP-3c1e93ec2d9b4ed0 | popup-table · cost/benchmark | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95dd9aa04341512b-COL-1 | CMP-95dd9aa04341512b | popup-table-column · cost/benchmark | 기준월 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95dd9aa04341512b-COL-2 | CMP-95dd9aa04341512b | popup-table-column · cost/benchmark | 관측값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95dd9aa04341512b-COL-3 | CMP-95dd9aa04341512b | popup-table-column · cost/benchmark | 근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7a4c0e28bdef082a | CMP-3c1e93ec2d9b4ed0 | popup-button · cost/benchmark | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-467764a602123b7a | SCREEN-finance-loans | popup · finance/loans | 자금구성 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-b3521866772ee6c8 | CMP-467764a602123b7a | popup-table · finance/loans | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b3521866772ee6c8-COL-1 | CMP-b3521866772ee6c8 | popup-table-column · finance/loans | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b3521866772ee6c8-COL-2 | CMP-b3521866772ee6c8 | popup-table-column · finance/loans | 약정·출자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b3521866772ee6c8-COL-3 | CMP-b3521866772ee6c8 | popup-table-column · finance/loans | 실행·납입 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b3521866772ee6c8-COL-4 | CMP-b3521866772ee6c8 | popup-table-column · finance/loans | 잔액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-34d96e7fd7698319 | CMP-467764a602123b7a | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b252d928ba67cc35 | SCREEN-finance-loans | popup · finance/loans | 대주별 분기 기준값 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f | CMP-b252d928ba67cc35 | popup-table · finance/loans | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f-COL-1 | CMP-9b131739697c108f | popup-table-column · finance/loans | 금융기관 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f-COL-2 | CMP-9b131739697c108f | popup-table-column · finance/loans | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f-COL-3 | CMP-9b131739697c108f | popup-table-column · finance/loans | 약정액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f-COL-4 | CMP-9b131739697c108f | popup-table-column · finance/loans | 누적 실행 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f-COL-5 | CMP-9b131739697c108f | popup-table-column · finance/loans | 잔액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f-COL-6 | CMP-9b131739697c108f | popup-table-column · finance/loans | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b131739697c108f-COL-7 | CMP-9b131739697c108f | popup-table-column · finance/loans | 출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97619ebc31205712 | CMP-b252d928ba67cc35 | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d4e4ea031f2d98fd | SCREEN-finance-loans | popup · finance/loans | 금융 변경이력 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-4b5e57d8b4af25dc | CMP-d4e4ea031f2d98fd | popup-table · finance/loans | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b5e57d8b4af25dc-COL-1 | CMP-4b5e57d8b4af25dc | popup-table-column · finance/loans | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b5e57d8b4af25dc-COL-2 | CMP-4b5e57d8b4af25dc | popup-table-column · finance/loans | 금융기관 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b5e57d8b4af25dc-COL-3 | CMP-4b5e57d8b4af25dc | popup-table-column · finance/loans | 변경 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b5e57d8b4af25dc-COL-4 | CMP-4b5e57d8b4af25dc | popup-table-column · finance/loans | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3b567a5330f6dd1 | CMP-d4e4ea031f2d98fd | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-44c16083f8b04131 | SCREEN-finance-loans | popup · finance/loans | 대출 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-781eee63e4f4c457 | CMP-44c16083f8b04131 | popup-field · finance/loans | 금융기관 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46ce7223a59e1ebf | CMP-44c16083f8b04131 | popup-field · finance/loans | 금융 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f5bc022cda8e800e | CMP-44c16083f8b04131 | popup-field · finance/loans | 상환순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-07043773ca66226f | CMP-44c16083f8b04131 | popup-field · finance/loans | 약정액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5a5e30327cca776b | CMP-44c16083f8b04131 | popup-field · finance/loans | 누적 실행액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-528fb58f7bffdb2b | CMP-44c16083f8b04131 | popup-field · finance/loans | 대출잔액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1a57d2b1ea30e485 | CMP-44c16083f8b04131 | popup-field · finance/loans | All-in 금리 (%) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af92ee33f413c74c | CMP-44c16083f8b04131 | popup-field · finance/loans | 약정 시작일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9ba0fd3e025ebf65 | CMP-44c16083f8b04131 | popup-field · finance/loans | 최종 만기일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-931e02c22767f86a | CMP-44c16083f8b04131 | popup-field · finance/loans | 담보·신용보강 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e49ad5a0a04027ef | CMP-44c16083f8b04131 | popup-field · finance/loans | 약정서·근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e33b64ab197d2666 | CMP-44c16083f8b04131 | popup-field · finance/loans | 변경 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ab9bcad631cbac82 | CMP-44c16083f8b04131 | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cb4b759d7e9afccb | CMP-44c16083f8b04131 | popup-button · finance/loans | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2eaf4b049b8cd3b8 | SCREEN-finance-loans | popup · finance/loans | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-5ddad46975a13188 | CMP-2eaf4b049b8cd3b8 | popup-table · finance/loans | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5ddad46975a13188-COL-1 | CMP-5ddad46975a13188 | popup-table-column · finance/loans | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5ddad46975a13188-COL-2 | CMP-5ddad46975a13188 | popup-table-column · finance/loans | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7d921f7486343bc4 | CMP-2eaf4b049b8cd3b8 | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0557f01c4a4eb0a0 | CMP-2eaf4b049b8cd3b8 | popup-button · finance/loans | 분기 기준값 기록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bc7343e865565a4e | CMP-2eaf4b049b8cd3b8 | popup-button · finance/loans | 셀다운 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ad8746c8dec7f5af | CMP-2eaf4b049b8cd3b8 | popup-button · finance/loans | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-425184546bdb383f | SCREEN-finance-loans | popup · finance/loans | 출자자 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-5efa4957a618e32d | CMP-425184546bdb383f | popup-field · finance/loans | 출자자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c7ab75118c5be380 | CMP-425184546bdb383f | popup-field · finance/loans | 사업자·법인 등록번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-24cfe7d47e561a19 | CMP-425184546bdb383f | popup-field · finance/loans | 출자금액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d348ae070ed8c1d6 | CMP-425184546bdb383f | popup-field · finance/loans | 출자 목적·역할 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-099beb292b371a99 | CMP-425184546bdb383f | popup-field · finance/loans | 근거자료 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d2785b29efaaaa53 | CMP-425184546bdb383f | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ed5aa04f07eaab7 | CMP-425184546bdb383f | popup-button · finance/loans | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b7d3d346f2fcbd7 | SCREEN-finance-loans | popup · finance/loans | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-40df0557d9eb9c12 | CMP-4b7d3d346f2fcbd7 | popup-field · finance/loans | 담보·신용보강 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-657168d5cbcf0f1a | CMP-4b7d3d346f2fcbd7 | popup-field · finance/loans | 제공자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e9a3b4571b45d357 | CMP-4b7d3d346f2fcbd7 | popup-field · finance/loans | 담보·보증금액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5b78df67d0ae5d66 | CMP-4b7d3d346f2fcbd7 | popup-field · finance/loans | 조건·범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fc4acd29679b1568 | CMP-4b7d3d346f2fcbd7 | popup-field · finance/loans | 만료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0100009217780c27 | CMP-4b7d3d346f2fcbd7 | popup-field · finance/loans | 근거자료 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3749c303dc840f5e | CMP-4b7d3d346f2fcbd7 | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d7515cff57158362 | CMP-4b7d3d346f2fcbd7 | popup-button · finance/loans | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ca2620f7d981589 | SCREEN-finance-loans | popup · finance/loans | 보증기관 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-bd603c712146b018 | CMP-4ca2620f7d981589 | popup-field · finance/loans | 보고 대상 보증기관 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fcc4eec1fe41238e | CMP-4ca2620f7d981589 | popup-field · finance/loans | 보증 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-36c1efe6c9daea90 | CMP-4ca2620f7d981589 | popup-field · finance/loans | 보증금액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-69eb2d039694998d | CMP-4ca2620f7d981589 | popup-field · finance/loans | 보증 범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a90f04b5dba788dd | CMP-4ca2620f7d981589 | popup-field · finance/loans | 기타 유형 상세 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eb503efb520e1641 | CMP-4ca2620f7d981589 | popup-field · finance/loans | 근거자료 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3cba259a6cb97c14 | CMP-4ca2620f7d981589 | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d7a8c0419271ed4e | CMP-4ca2620f7d981589 | popup-button · finance/loans | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d00ae27343807e57 | SCREEN-permit-land | popup · permit/land | 필지 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-bd7368933bc1d8a7 | CMP-d00ae27343807e57 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5506850742232c23 | CMP-d00ae27343807e57 | popup-field · permit/land | 토지면적(㎡) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d29b8f3a7c10bdfe | CMP-d00ae27343807e57 | popup-field · permit/land | 소유자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0ed885eb6e350042 | CMP-d00ae27343807e57 | popup-field · permit/land | 권원 확보 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42e8cdf5d3e8a9ca | CMP-d00ae27343807e57 | popup-field · permit/land | 토지 근거 공용폴더 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c98b689661c2f76 | CMP-d00ae27343807e57 | popup-button · permit/land | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-845fcac4ca37f7a4 | CMP-d00ae27343807e57 | popup-button · permit/land | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-27a8c461f59b58a9 | SCREEN-permit-land | popup · permit/land | 필지 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-2128ddc8232dec8f | CMP-27a8c461f59b58a9 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51729e3376fd3eee | CMP-27a8c461f59b58a9 | popup-field · permit/land | 토지면적(㎡) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9a0178f252cc2bb2 | CMP-27a8c461f59b58a9 | popup-field · permit/land | 소유자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cebc070676960099 | CMP-27a8c461f59b58a9 | popup-field · permit/land | 권원 확보 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9ac4ea19fc1427e7 | CMP-27a8c461f59b58a9 | popup-field · permit/land | 토지 근거 공용폴더 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-29625ef58784ed71 | CMP-27a8c461f59b58a9 | popup-button · permit/land | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-060f2dadd3ff3370 | CMP-27a8c461f59b58a9 | popup-button · permit/land | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-acff1c4cec79021b | CMP-d00ae27343807e57 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-50dffc2a624a101d | CMP-d00ae27343807e57 | popup-field · permit/land | parcel-parcel-YD427-legacy | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6775c6ead930b055 | CMP-d00ae27343807e57 | popup-field · permit/land | 매매대금(원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d4ee7e53b349344 | CMP-d00ae27343807e57 | popup-field · permit/land | 계약체결일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f2615ce25ab34434 | CMP-d00ae27343807e57 | popup-field · permit/land | 잔금지급 예정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-541a1571899664fc | CMP-d00ae27343807e57 | popup-field · permit/land | 계약원장 연결 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46a182d004fc82eb | SCREEN-overview | popup · overview/ | 전문인력 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-6a4d9f39edba9668 | CMP-46a182d004fc82eb | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a71c7aa0b2886e7c | CMP-46a182d004fc82eb | popup-field · overview/ | 소속회사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6c1167a73d70da69 | CMP-46a182d004fc82eb | popup-field · overview/ | 자격·학위 등 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-26f96c6badb879c8 | CMP-46a182d004fc82eb | popup-field · overview/ | 경력 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b7278b86700d6ba | CMP-46a182d004fc82eb | popup-field · overview/ | 사전교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-057c6590cd50f174 | CMP-46a182d004fc82eb | popup-field · overview/ | 최근 연수교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9325a057b102fce1 | CMP-46a182d004fc82eb | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-354106d97cbad488 | CMP-46a182d004fc82eb | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37e35a7a293bc600 | CMP-46a182d004fc82eb | popup-field · overview/ | 재직 시작일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b7a5675a15602ecb | CMP-46a182d004fc82eb | popup-field · overview/ | 실제 퇴사일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6cf31dda01a95d7b | CMP-46a182d004fc82eb | popup-field · overview/ | 등록명단 반영일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a5360a70eaf65873 | CMP-46a182d004fc82eb | popup-field · overview/ | 등록명단 종료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c942b3fa0eec64c4 | CMP-46a182d004fc82eb | popup-field · overview/ | 증빙 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6596ee2794e23407 | CMP-46a182d004fc82eb | popup-button · overview/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e7c0755f8521650d | CMP-46a182d004fc82eb | popup-button · overview/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-469905581e935fb8 | SCREEN-overview | popup · overview/ | 전문인력 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-54080ae2d4972a30 | CMP-469905581e935fb8 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b5c47f2a379ece72 | CMP-469905581e935fb8 | popup-field · overview/ | 소속회사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-128938c529083847 | CMP-469905581e935fb8 | popup-field · overview/ | 자격·학위 등 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dd8f85c03f6296f5 | CMP-469905581e935fb8 | popup-field · overview/ | 경력 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5eac317b93423287 | CMP-469905581e935fb8 | popup-field · overview/ | 사전교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ae4cc7ef796094b6 | CMP-469905581e935fb8 | popup-field · overview/ | 최근 연수교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c2ff3d141b332377 | CMP-469905581e935fb8 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1253041b0413b764 | CMP-469905581e935fb8 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0d6e40d7154b66f5 | CMP-469905581e935fb8 | popup-field · overview/ | 재직 시작일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-35a8540d1860e753 | CMP-469905581e935fb8 | popup-field · overview/ | 실제 퇴사일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1f16abe6325bdd24 | CMP-469905581e935fb8 | popup-field · overview/ | 등록명단 반영일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a46d0f45e1e82a99 | CMP-469905581e935fb8 | popup-field · overview/ | 등록명단 종료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-644ff510f9e9c613 | CMP-469905581e935fb8 | popup-field · overview/ | 증빙 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b47e922b460476eb | CMP-469905581e935fb8 | popup-button · overview/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-06ccc0e98d34234d | CMP-469905581e935fb8 | popup-button · overview/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2505895699fad6f3 | SCREEN-overview | popup · overview/ | 개발업 등록정보 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-b8f1d0c0620eaf9b | CMP-2505895699fad6f3 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fd31a847078a7415 | CMP-2505895699fad6f3 | popup-field · overview/ | 대표자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f91ff181cbb783f3 | CMP-2505895699fad6f3 | popup-field · overview/ | 법적 형태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-546d4de44b20f3c2 | CMP-2505895699fad6f3 | popup-field · overview/ | 사업자등록번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3d49ccd8ea78e42 | CMP-2505895699fad6f3 | popup-field · overview/ | 법인등록번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1e9f641f4d13a0b3 | CMP-2505895699fad6f3 | popup-field · overview/ | 사무실 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a0926df506b4b5c5 | CMP-2505895699fad6f3 | popup-field · overview/ | 연락처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-384cd9b93e005f35 | CMP-2505895699fad6f3 | popup-field · overview/ | 등록 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-96fff1731cf4005d | CMP-2505895699fad6f3 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-383780d2e2097e01 | CMP-2505895699fad6f3 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c9ca0edc60669b7 | CMP-2505895699fad6f3 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b676f758deac19df | CMP-2505895699fad6f3 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b84a4c3fec5f7df2 | CMP-2505895699fad6f3 | popup-field · overview/ | 기관 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c664fb32edd797f | CMP-2505895699fad6f3 | popup-field · overview/ | 기관 담당자 연락처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aea9cbde30418bf1 | CMP-2505895699fad6f3 | popup-field · overview/ | 최근 변경신고 제출일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7c2694796dd3019d | CMP-2505895699fad6f3 | popup-field · overview/ | 자본금 또는 영업용자산(원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fcea765fb7a02ae7 | CMP-2505895699fad6f3 | popup-field · overview/ | 전문인력 등록 인원(수동) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8a4dbf611ca17e74 | CMP-2505895699fad6f3 | popup-field · overview/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-748c98273d661785 | CMP-2505895699fad6f3 | popup-field · overview/ | 자산관리회사 등 상호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5bba3f69eb78a857 | CMP-2505895699fad6f3 | popup-field · overview/ | 자산관리회사 등 소재지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a77ef92c8725d9ea | CMP-2505895699fad6f3 | popup-field · overview/ | 자산관리회사 등 전화번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-01468e8be8c02db5 | CMP-2505895699fad6f3 | popup-field · overview/ | 업무위탁계약 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02da77d33afe8c9b | CMP-2505895699fad6f3 | popup-button · overview/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21a864da9944a729 | CMP-2505895699fad6f3 | popup-button · overview/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d978a60a8f915a97 | SCREEN-cost-detail | popup · cost/detail | 사업비 직접 입력 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-9e27818cb1458021 | CMP-d978a60a8f915a97 | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-595dea2bcc15e362 | CMP-d978a60a8f915a97 | popup-field · cost/detail | 대분류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bd1791486c8b2db5 | CMP-d978a60a8f915a97 | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-485b4809000789f5 | CMP-d978a60a8f915a97 | popup-field · cost/detail | 현재 금액 · 원, 미입력 가능 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51e9ece99161f2f8 | CMP-d978a60a8f915a97 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6fffd5a1ece1e5dc | CMP-d978a60a8f915a97 | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-73af3f26f7312f9b | SCREEN-cost-detail | popup · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-8e61890cf6aab04f | CMP-73af3f26f7312f9b | popup-field · cost/detail | presetBusinessMode | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4a0fbc0da113fc4 | CMP-73af3f26f7312f9b | popup-field · cost/detail | presetCostPayer | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-edf896b45e1e04ec | CMP-73af3f26f7312f9b | popup-field · cost/detail | presetContractScope | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-667bc040210bd30e | CMP-73af3f26f7312f9b | popup-field · cost/detail | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ea9fe91d4e286ade | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ea9fe91d4e286ade-COL-1 | CMP-ea9fe91d4e286ade | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64c9471d6b716084 | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64c9471d6b716084-COL-1 | CMP-64c9471d6b716084 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-33d201be6b74eec2 | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-33d201be6b74eec2-COL-1 | CMP-33d201be6b74eec2 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-331799381ca10206 | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 4 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-331799381ca10206-COL-1 | CMP-331799381ca10206 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fcd2ae06ec4f7efe | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 5 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fcd2ae06ec4f7efe-COL-1 | CMP-fcd2ae06ec4f7efe | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-012f8f5009e2e770 | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-012f8f5009e2e770-COL-1 | CMP-012f8f5009e2e770 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c1b6bfd9370c8186 | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 7 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c1b6bfd9370c8186-COL-1 | CMP-c1b6bfd9370c8186 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1ec793fde3e3936 | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 8 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1ec793fde3e3936-COL-1 | CMP-e1ec793fde3e3936 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3b8e466851480920 | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 9 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3b8e466851480920-COL-1 | CMP-3b8e466851480920 | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d1a2293ed34b65ba | CMP-73af3f26f7312f9b | popup-table · cost/detail | 상세 표 10 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d1a2293ed34b65ba-COL-1 | CMP-d1a2293ed34b65ba | popup-table-column · cost/detail | 원가항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d1a2293ed34b65ba-COL-2 | CMP-d1a2293ed34b65ba | popup-table-column · cost/detail | 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-25b91e7274f1ab3d | CMP-73af3f26f7312f9b | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2f8d1bc71eaad0f2 | CMP-73af3f26f7312f9b | popup-button · cost/detail | 목록으로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-16bfab816e9dfa36 | CMP-73af3f26f7312f9b | popup-button · cost/detail | 선택한 항목 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a62c13a2981da07 | SCREEN-cost-detail | popup · cost/detail | 정정본 만들기 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-72658ddf738c57cb | CMP-4a62c13a2981da07 | popup-field · cost/detail | 시점명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a24a6bc0e00c72a6 | CMP-4a62c13a2981da07 | popup-field · cost/detail | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-375d1a320cbbfcfd | CMP-4a62c13a2981da07 | popup-field · cost/detail | 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b9a86f5ff1053aa | CMP-4a62c13a2981da07 | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c06fec4ad76ec26 | CMP-4a62c13a2981da07 | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7adf8c409feb931b | SCREEN-cost-detail | popup · cost/detail | 기존 불공제 VAT 연결 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-f01c4e97342d1e93 | CMP-7adf8c409feb931b | popup-field · cost/detail | 대사 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6b0a5df30be278b2 | CMP-7adf8c409feb931b | popup-field · cost/detail | 대사 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-63b97886960be766 | CMP-7adf8c409feb931b | popup-field · cost/detail | 대사 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d9946cb5cfe0658b | CMP-7adf8c409feb931b | popup-button · cost/detail | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-358a7f6d990e1596 | CMP-7adf8c409feb931b | popup-button · cost/detail | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-68cd89fa56e36d3e | SCREEN-finance-loans | popup · finance/loans | 대주별 분기 기준값 기록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-139035681f441776 | CMP-68cd89fa56e36d3e | popup-field · finance/loans | 분기 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7b0574445c575866 | CMP-68cd89fa56e36d3e | popup-field · finance/loans | 약정액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aaeb49572fa2f62 | CMP-68cd89fa56e36d3e | popup-field · finance/loans | 누적 실행액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6834bf2c1ff1e110 | CMP-68cd89fa56e36d3e | popup-field · finance/loans | 잔액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bbfe8f744c04c3ad | CMP-68cd89fa56e36d3e | popup-field · finance/loans | 기준자료 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d5f9d734d2dca265 | CMP-68cd89fa56e36d3e | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a3ebacdee58295e3 | CMP-68cd89fa56e36d3e | popup-button · finance/loans | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e525ec92ffd56171 | SCREEN-finance-loans | popup · finance/loans | 대주 셀다운 기록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-1ab8fb59e2efa7ac | CMP-e525ec92ffd56171 | popup-field · finance/loans | 양수 금융기관 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c9312aef7bdefe51 | CMP-e525ec92ffd56171 | popup-field · finance/loans | 양도 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7cc20c1b39617f8c | CMP-e525ec92ffd56171 | popup-field · finance/loans | 이전 약정액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0e279f9b5e4e3b40 | CMP-e525ec92ffd56171 | popup-field · finance/loans | 이전 누적 실행액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3b7b5bcba167b1ea | CMP-e525ec92ffd56171 | popup-field · finance/loans | 이전 대출잔액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-637eb49261290dc1 | CMP-e525ec92ffd56171 | popup-field · finance/loans | 양도 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2747c246657c0e13 | CMP-e525ec92ffd56171 | popup-field · finance/loans | 비고 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-024a0b51145edfc9 | CMP-e525ec92ffd56171 | popup-button · finance/loans | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b0ad92bade4605d | CMP-e525ec92ffd56171 | popup-button · finance/loans | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3720e33b23d928b2 | SCREEN-permit-permits | popup · permit/permits | 인허가 추천 조건 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-db7317ff95de3b59 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 사업유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6a08e9885dba05b5 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 사업방식 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f23b40a45c71a618 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 건축 인허가 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d56ca89e42a72734 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 사업지 시·군·구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02e76e3be30ec65d | CMP-3720e33b23d928b2 | popup-field · permit/permits | 용도지역·지구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d143e3668a2d34fe | CMP-3720e33b23d928b2 | popup-field · permit/permits | 사업면적(㎡) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e456006010d6d84b | CMP-3720e33b23d928b2 | popup-field · permit/permits | 건물별 최대 연면적(㎡) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3e1ec7e36d7a591e | CMP-3720e33b23d928b2 | popup-field · permit/permits | 최고 높이(m) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f939f9ea58e44d1d | CMP-3720e33b23d928b2 | popup-field · permit/permits | 최고 층수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d401b650b942aa91 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 최대 굴착깊이(m) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-782f1709a780a87f | CMP-3720e33b23d928b2 | popup-field · permit/permits | 전력 사용규모(MW) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-25b288511e3e6329 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 토지 형질변경 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20e5959a5cfb1e30 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 기존 건물 해체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9eb6dd61bbc8d8a0 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 농지 전용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8f2831524e64a983 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 산지 전용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ebb005bfb2dc06c7 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 국가유산 관련 지역·발굴 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-75108324bcd5c9ed | CMP-3720e33b23d928b2 | popup-field · permit/permits | 토양오염 확인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7c9bf3a14ac088d4 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 군사 보호구역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6121d388671d92e1 | CMP-3720e33b23d928b2 | popup-field · permit/permits | 조건 확인자료 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f09b2c8ddc61b812 | CMP-3720e33b23d928b2 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-365c981d781532b6 | CMP-3720e33b23d928b2 | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-05a2a96490b5d5a2 | SCREEN-permit-permits | popup · permit/permits | 추가할 인허가 선택 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-dc5ceb91f6afe823 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 사업유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-944756db69c967a6 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 사업방식 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1859082370d34ddd | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 사업지 시·군·구 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ec074cea62df4a8 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3daea2f89e9b5a31 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | pick-permit-type:seoul-lid | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-70c10a7c376712f2 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 담당기관 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-76fde65f5a3dac69 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 국토부 보고 분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f681a36f6d269f57 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 계획 신청일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-07eb512dc36cbe97 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 목표 완료일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-252488a96e9190b2 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 신청·진행자료 경로 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5590f144de9c94e3 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | pick-permit-catalog-2-0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9ab2e97b6b5a6144 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 담당기관 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b2d6cf7532db19a0 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 국토부 보고 분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cc801503e55285d6 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 계획 신청일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-49c106c854d97be7 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 목표 완료일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c63d33246c4d255 | CMP-05a2a96490b5d5a2 | popup-field · permit/permits | 신청·진행자료 경로 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a5748e78cdd9b9c1 | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-265c18b4b8f43e50 | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 추천 다시 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-49860385ed68d2e8 | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 규모·토지 조건 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cae143511ae346ab | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 지역별 확인할 조례 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-489db45aafb5ad6f | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 지역 조례 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5464727484cd4af9 | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 추천 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2eddbc654c6c0b6a | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 전체 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1a136dd37bbf379f | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 조건 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-046376994ac3c600 | CMP-05a2a96490b5d5a2 | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-18090a1e459de152 | SCREEN-permit-permits | popup · permit/permits | 지역별 확인할 조례 | source-content-reviewed-not-business-sufficiency-acceptance / block | notrun / notrun / notrun / notrun |
| CMP-02eb647851a147f4 | CMP-18090a1e459de152 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1e63f523cfe92e6 | CMP-18090a1e459de152 | popup-button · permit/permits | 다시 불러오기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5d0c67a3932e7fb3 | SCREEN-permit-permits | popup · permit/permits | 법령·조례 검색 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-2b44969c50943139 | CMP-5d0c67a3932e7fb3 | popup-field · permit/permits | 프로젝트 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0dbe47336a907a65 | CMP-5d0c67a3932e7fb3 | popup-field · permit/permits | 조회 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5fb3a9266b098cfe | CMP-5d0c67a3932e7fb3 | popup-field · permit/permits | 법령·조례명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-04dba88509f7f9f1 | CMP-5d0c67a3932e7fb3 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4d02c22ce9f685aa | CMP-5d0c67a3932e7fb3 | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cdff883f55c572b9 | SCREEN-permit-permits | popup · permit/permits | 저영향개발 사전협의 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d06513026b0c94b3 | CMP-cdff883f55c572b9 | popup-table · permit/permits | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d06513026b0c94b3-COL-1 | CMP-d06513026b0c94b3 | popup-table-column · permit/permits | 사업 조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d06513026b0c94b3-COL-2 | CMP-d06513026b0c94b3 | popup-table-column · permit/permits | 입력값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0b9f0057e9b2835 | CMP-cdff883f55c572b9 | popup-table · permit/permits | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0b9f0057e9b2835-COL-1 | CMP-e0b9f0057e9b2835 | popup-table-column · permit/permits | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e0b9f0057e9b2835-COL-2 | CMP-e0b9f0057e9b2835 | popup-table-column · permit/permits | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7827793dbd687441 | CMP-cdff883f55c572b9 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-52dc0100cae64144 | CMP-cdff883f55c572b9 | popup-button · permit/permits | 항목 선택으로 돌아가기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b47de91cb35c0e8b | SCREEN-permit-permits | popup · permit/permits | 지구단위계획 결정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-16f37a67d5d889db | CMP-b47de91cb35c0e8b | popup-table · permit/permits | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-16f37a67d5d889db-COL-1 | CMP-16f37a67d5d889db | popup-table-column · permit/permits | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-16f37a67d5d889db-COL-2 | CMP-16f37a67d5d889db | popup-table-column · permit/permits | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a725f53d6a05978b | CMP-b47de91cb35c0e8b | popup-table · permit/permits | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a725f53d6a05978b-COL-1 | CMP-a725f53d6a05978b | popup-table-column · permit/permits | 관계 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a725f53d6a05978b-COL-2 | CMP-a725f53d6a05978b | popup-table-column · permit/permits | 연결 대상 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57f16f1b8865a892 | CMP-b47de91cb35c0e8b | popup-table · permit/permits | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57f16f1b8865a892-COL-1 | CMP-57f16f1b8865a892 | popup-table-column · permit/permits | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57f16f1b8865a892-COL-2 | CMP-57f16f1b8865a892 | popup-table-column · permit/permits | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46d86923ea2416c7 | CMP-b47de91cb35c0e8b | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-be9e799210f042ee | CMP-b47de91cb35c0e8b | popup-button · permit/permits | 관련 법령 조회 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3a1fce9a5dbf74f | CMP-b47de91cb35c0e8b | popup-button · permit/permits | 신청·보완·심의 기록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c73fc5346e3bf81 | CMP-b47de91cb35c0e8b | popup-button · permit/permits | 조치계획 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8e6d7cc1ba5d9906 | CMP-b47de91cb35c0e8b | popup-button · permit/permits | 인허가 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9ed0476c3e054386 | CMP-b47de91cb35c0e8b | popup-button · permit/permits | 변경 인허가 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-10facf3fb7260e92 | CMP-b47de91cb35c0e8b | popup-button · permit/permits | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4d6a0ae4a090608 | SCREEN-permit-permits | popup · permit/permits | 신청·보완·심의 기록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-6817d01f71a14673 | CMP-a4d6a0ae4a090608 | popup-table · permit/permits | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6817d01f71a14673-COL-1 | CMP-6817d01f71a14673 | popup-table-column · permit/permits | 회차 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6817d01f71a14673-COL-2 | CMP-6817d01f71a14673 | popup-table-column · permit/permits | 진행 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6817d01f71a14673-COL-3 | CMP-6817d01f71a14673 | popup-table-column · permit/permits | 발생일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6817d01f71a14673-COL-4 | CMP-6817d01f71a14673 | popup-table-column · permit/permits | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6817d01f71a14673-COL-5 | CMP-6817d01f71a14673 | popup-table-column · permit/permits | 근거자료 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e79c6cb6bc3238b5 | CMP-a4d6a0ae4a090608 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64790b2a93a9ff4f | CMP-a4d6a0ae4a090608 | popup-button · permit/permits | + 진행 기록 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1488eb27e91b3d67 | CMP-a4d6a0ae4a090608 | popup-button · permit/permits | 인허가 상세로 돌아가기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-752742d9dd2cfebd | SCREEN-permit-permits | popup · permit/permits | 진행 기록 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-021b91cef8b0fafd | CMP-752742d9dd2cfebd | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e4d82534e6ffc433 | CMP-752742d9dd2cfebd | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-49c6da627eb1e627 | CMP-752742d9dd2cfebd | popup-field · permit/permits | 진행 내용 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e5a5a64eacd31bed | CMP-752742d9dd2cfebd | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02bd59d573a9172a | CMP-752742d9dd2cfebd | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ed9d9b6823206a9d | CMP-752742d9dd2cfebd | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec6d4bdde5c8616b | SCREEN-permit-permits | popup · permit/permits | 인허가 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-6d0420358f1f42d6 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec1c947b765a136f | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-139375bf9fc84849 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 국토부 보고 분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-394650f4240e3427 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 담당기관 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f2a8dcf88cc84d2a | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 근거법령·조문 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b49f923d2b790c1c | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bc675008745aebc3 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e796cf448b8714a | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 계획 신청일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02010e1e5260e706 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 목표 완료일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2e624a4ab745938b | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eb18099337979da1 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c2ddd7c6f3e9a772 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8838d5165287a249 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-98c6a85a301ed76e | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b721afc517dc3d8e | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-404a70d87b8b321f | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0de2883391cd7590 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b01136c4a65d8ba2 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-541936801367140f | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-097207c6c66f5353 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4c751d94f1ecad70 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-741eef83496ef941 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-63e5b25e24ea220b | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2e32c815286a3adb | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6da93cf7452ad93d | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b5ebae9156ff13de | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9d2d87af72b6745f | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-68fd25a4cf88c2ea | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-09d0bd956810c99e | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5233f63fc19ce50d | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 이 인허가를 포함해 함께 처리하는 상위 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-62ab27ab106f646a | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8fd0aee4fce135d3 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | 이 인허가가 변경하는 기존 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6620dc359778c32c | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | precede-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-50aa4af5f9c24dc6 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | precede-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b4bf6988b33c854 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | precede-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b7a6c27e55076426 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | precede-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aceaddd5a7a1ae53 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | precede-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c5ea5896d521fcb8 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | integrate-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-397a456a7f940803 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | integrate-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-56f0dd0bb650a021 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | integrate-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b09e9d3121e6530f | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | integrate-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c714927ac89fa561 | CMP-ec6d4bdde5c8616b | popup-field · permit/permits | integrate-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8ac2a712bf558a6f | CMP-ec6d4bdde5c8616b | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b949ef14da4b2db | CMP-ec6d4bdde5c8616b | popup-button · permit/permits | 검토의견 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-44dfe7c8c69deae1 | CMP-ec6d4bdde5c8616b | popup-button · permit/permits | 조치계획 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f4a610f6e8a1b08 | CMP-ec6d4bdde5c8616b | popup-button · permit/permits | + 조치계획 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3467192c4e499ab | CMP-ec6d4bdde5c8616b | popup-button · permit/permits | + 검토의견 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2fa2d565df7ef4ba | CMP-ec6d4bdde5c8616b | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-652f7599319928e2 | SCREEN-permit-permits | popup · permit/permits | 변경허가 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-6966ae76ee09330a | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f0d57fd6e86800f | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9111412cd3890130 | CMP-652f7599319928e2 | popup-field · permit/permits | 국토부 보고 분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00122f88a995b0a2 | CMP-652f7599319928e2 | popup-field · permit/permits | 담당기관 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7797ea048297caed | CMP-652f7599319928e2 | popup-field · permit/permits | 근거법령·조문 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4b656986b57560b7 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1fa54f1ef890372e | CMP-652f7599319928e2 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b215dd9306a5436 | CMP-652f7599319928e2 | popup-field · permit/permits | 계획 신청일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e427e57a49400b88 | CMP-652f7599319928e2 | popup-field · permit/permits | 목표 완료일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f260b3a594c91fa4 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cc299f4f9fa0f111 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0e98a023719e1aa5 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5237519c782c62b2 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0e90e2f5d3f78ad0 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-75d7774289a4c32f | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bf0761bb5b4ef5b7 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3fee1e1c4ef2cc4a | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2e1e147c39d27d2d | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-db1b0801ac6171d2 | CMP-652f7599319928e2 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-75e9994a9085f816 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-94579e085fe06bc1 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d995f647af57326a | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cdd712943844651a | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-36d4c8eb673bcc39 | CMP-652f7599319928e2 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d9d86c1735271a38 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ad2b4c1d606d4c12 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e21f282694077b75 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8358de2017cd6c24 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a8b49e03a7d084c9 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-254d27bff612c804 | CMP-652f7599319928e2 | popup-field · permit/permits | 이 인허가를 포함해 함께 처리하는 상위 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c1b8e00412bf3a76 | CMP-652f7599319928e2 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-84a30bbda062d54b | CMP-652f7599319928e2 | popup-field · permit/permits | 이 인허가가 변경하는 기존 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-50323c062e3ec645 | CMP-652f7599319928e2 | popup-field · permit/permits | precede-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-33d153699139b73b | CMP-652f7599319928e2 | popup-field · permit/permits | precede-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-69aed74d314af0dc | CMP-652f7599319928e2 | popup-field · permit/permits | precede-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c175636747658ea9 | CMP-652f7599319928e2 | popup-field · permit/permits | precede-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8ce62e913d8d78de | CMP-652f7599319928e2 | popup-field · permit/permits | precede-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbd8b01832066e52 | CMP-652f7599319928e2 | popup-field · permit/permits | precede-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-49f39e0fc5a5b71f | CMP-652f7599319928e2 | popup-field · permit/permits | integrate-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8e41f330787a5e96 | CMP-652f7599319928e2 | popup-field · permit/permits | integrate-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dbafe9cbb7478338 | CMP-652f7599319928e2 | popup-field · permit/permits | integrate-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d60f23a5a5197214 | CMP-652f7599319928e2 | popup-field · permit/permits | integrate-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dc2033dfa550b012 | CMP-652f7599319928e2 | popup-field · permit/permits | integrate-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-134350f9a56c5f5d | CMP-652f7599319928e2 | popup-field · permit/permits | integrate-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f51c0a6b453accdb | CMP-652f7599319928e2 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-58ec1867fbef5564 | CMP-652f7599319928e2 | popup-button · permit/permits | 검토의견 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f35b482b3446ffcc | CMP-652f7599319928e2 | popup-button · permit/permits | 조치계획 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-102d0b974616d196 | CMP-652f7599319928e2 | popup-button · permit/permits | + 조치계획 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1cc46e7a9ecc796a | CMP-652f7599319928e2 | popup-button · permit/permits | + 검토의견 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7a04071509978131 | CMP-652f7599319928e2 | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3fac3019953d80c7 | SCREEN-permit-construction | popup · permit/construction | 기준일별 공정률 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-5dc233ab0167e3d6 | CMP-3fac3019953d80c7 | popup-field · permit/construction | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d1f4dd67fe193f5f | CMP-3fac3019953d80c7 | popup-field · permit/construction | 계획 공정률(%) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-425c38f4798964d3 | CMP-3fac3019953d80c7 | popup-field · permit/construction | 실제 공정률(%) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b952165e83e1e09e | CMP-3fac3019953d80c7 | popup-button · permit/construction | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-637fecc4348c0108 | CMP-3fac3019953d80c7 | popup-button · permit/construction | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f5fb45dec75902a5 | SCREEN-permit-construction | popup · permit/construction | 공정 이력 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-ca552981e7017020 | CMP-f5fb45dec75902a5 | popup-table · permit/construction | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca552981e7017020-COL-1 | CMP-ca552981e7017020 | popup-table-column · permit/construction | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca552981e7017020-COL-2 | CMP-ca552981e7017020 | popup-table-column · permit/construction | 계획 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca552981e7017020-COL-3 | CMP-ca552981e7017020 | popup-table-column · permit/construction | 실제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca552981e7017020-COL-4 | CMP-ca552981e7017020 | popup-table-column · permit/construction | 차이 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca552981e7017020-COL-5 | CMP-ca552981e7017020 | popup-table-column · permit/construction | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21904a5ab2499a02 | CMP-f5fb45dec75902a5 | popup-button · permit/construction | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e778a4746ec693d1 | CMP-f5fb45dec75902a5 | popup-button · permit/construction | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-41bc929da7255223 | CMP-f5fb45dec75902a5 | popup-button · permit/construction | + 공정률 기록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3542f2da2bf3b045 | SCREEN-permit-construction | popup · permit/construction | 착공·준공 일정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-fb81f99c322f5a0d | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 착공 예정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5bbf7408a8e38c53 | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 실제 착공일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2a6e3058a092293d | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 착공신고일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-80cc5a39603090a2 | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 계약 준공일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-465b9382db0d26df | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 책임준공 약정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aea2d003144c3242 | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 책임준공 연장 약정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-caea5badab29a57d | CMP-3542f2da2bf3b045 | popup-field · permit/construction | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e1023d930bb1a837 | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 사업 준공 예정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-176cb9d329917190 | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 실제 준공일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d8241ad9e1c6ac96 | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 계획 공정률(%) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03c2e30d647dc5c8 | CMP-3542f2da2bf3b045 | popup-field · permit/construction | 실제 공정률(%) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7b0b585689ef5426 | CMP-3542f2da2bf3b045 | popup-button · permit/construction | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2f9459ab510d1ee1 | CMP-3542f2da2bf3b045 | popup-button · permit/construction | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-990aed38b3a23494 | SCREEN-document | popup · document/ | 입력자료 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873 | CMP-990aed38b3a23494 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-1 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-2 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 자료값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-3 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 원자료 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-4 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 위치 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-5 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-6 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 검토자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-7 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0f58fb528c29873-COL-8 | CMP-d0f58fb528c29873 | popup-table-column · document/ | 근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b4ec48c11bd7eff5 | CMP-990aed38b3a23494 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ad4dc323885edb0b | CMP-990aed38b3a23494 | popup-button · document/ | 미확인 자료 검토 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6088abf4442cc532 | CMP-990aed38b3a23494 | popup-button · document/ | + 입력자료 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-552c898336c52759 | SCREEN-document | popup · document/ | 입력자료 함께 검토 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-fe41a976e2c47a31 | CMP-552c898336c52759 | popup-field · document/ | 검토 결과 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5141dad61f5937d9 | CMP-552c898336c52759 | popup-field · document/ | 확인할 자료 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-507bdb0fc178bc1a | CMP-552c898336c52759 | popup-field · document/ | 확인할 값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-478f252065832a1e | CMP-552c898336c52759 | popup-field · document/ | 자료명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37f74e45ca6ba3c9 | CMP-552c898336c52759 | popup-field · document/ | 자료 위치 · 시트/페이지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-963488c38a27d76a | CMP-552c898336c52759 | popup-field · document/ | 자료 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-18673254b0cecd43 | CMP-552c898336c52759 | popup-field · document/ | 공통 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-790cb499aca727ab | CMP-552c898336c52759 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac28d12c982b4447 | CMP-552c898336c52759 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5bee193a5b676379 | SCREEN-document | popup · document/ | 입력자료 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-2a4001ede0a1b11d | CMP-5bee193a5b676379 | popup-field · document/ | 대상 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-90a839feeb6c7121 | CMP-5bee193a5b676379 | popup-field · document/ | 자료값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5a7e4542fca4fd0a | CMP-5bee193a5b676379 | popup-field · document/ | 자료명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-98ed2fc0783feb83 | CMP-5bee193a5b676379 | popup-field · document/ | 자료 위치 · 시트/페이지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3d8d4fc6a499f53 | CMP-5bee193a5b676379 | popup-field · document/ | 자료 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f6c01d95be71ad9e | CMP-5bee193a5b676379 | popup-field · document/ | 공통 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d6adadc24427195e | CMP-5bee193a5b676379 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a646386e562f5d09 | CMP-5bee193a5b676379 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-538d7f1b16c19205 | SCREEN-document | popup · document/ | 계약 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-6652596077f06f59 | CMP-538d7f1b16c19205 | popup-field · document/ | 계약명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-852a8964928e37fa | CMP-538d7f1b16c19205 | popup-field · document/ | 상대방 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-16388db98758d79e | CMP-538d7f1b16c19205 | popup-field · document/ | 계약일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9d76675edcc04ec6 | CMP-538d7f1b16c19205 | popup-field · document/ | 계약금액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca5a88e63ad8e610 | CMP-538d7f1b16c19205 | popup-field · document/ | 계약 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d9fbb1fb977200f3 | CMP-538d7f1b16c19205 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5462feeffc814cd3 | CMP-538d7f1b16c19205 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a7c250396af6e52b | SCREEN-document | popup · document/ | 문서 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-136b94cb80143d8b | CMP-a7c250396af6e52b | popup-field · document/ | 문서명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-34773d89317afb3b | CMP-a7c250396af6e52b | popup-field · document/ | 분류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-299001c2dd2490f0 | CMP-a7c250396af6e52b | popup-field · document/ | 문서번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d47a540c7c765820 | CMP-a7c250396af6e52b | popup-field · document/ | 개정차수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cc9170115453d02e | CMP-a7c250396af6e52b | popup-field · document/ | 작성일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4387600d113977a6 | CMP-a7c250396af6e52b | popup-field · document/ | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d603e3c574559325 | CMP-a7c250396af6e52b | popup-field · document/ | 공용폴더·원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1e0c6dfe5972a25e | CMP-a7c250396af6e52b | popup-field · document/ | 관련 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47a5cc062c074995 | CMP-a7c250396af6e52b | popup-field · document/ | 발신자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6529135e42dbca6f | CMP-a7c250396af6e52b | popup-field · document/ | 수신자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbb505e764710dce | CMP-a7c250396af6e52b | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b437f6de0da40f36 | CMP-a7c250396af6e52b | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f272762c5e468eb2 | SCREEN-document | inline-panel-state · document/ | 계약·문서 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-5475ceb75f7e13c4 | CMP-f272762c5e468eb2 | popup-field · document/ | 계약·문서 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-654f626be290f235 | CMP-f272762c5e468eb2 | popup-field · document/ | 계약·문서 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3 | CMP-f272762c5e468eb2 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3-COL-1 | CMP-3d0d7e47ab5753e3 | popup-table-column · document/ | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3-COL-2 | CMP-3d0d7e47ab5753e3 | popup-table-column · document/ | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3-COL-3 | CMP-3d0d7e47ab5753e3 | popup-table-column · document/ | 상대방·발신/수신 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3-COL-4 | CMP-3d0d7e47ab5753e3 | popup-table-column · document/ | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3-COL-5 | CMP-3d0d7e47ab5753e3 | popup-table-column · document/ | 계약금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3-COL-6 | CMP-3d0d7e47ab5753e3 | popup-table-column · document/ | 원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d0d7e47ab5753e3-COL-7 | CMP-3d0d7e47ab5753e3 | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1d7befd732d52df5 | CMP-f272762c5e468eb2 | popup-table · document/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1d7befd732d52df5-COL-1 | CMP-1d7befd732d52df5 | popup-table-column · document/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1d7befd732d52df5-COL-2 | CMP-1d7befd732d52df5 | popup-table-column · document/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d377dad14511477 | CMP-f272762c5e468eb2 | popup-button · document/ | 입력자료 확인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-990c1f244baf243c | CMP-f272762c5e468eb2 | popup-button · document/ | + 계약 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-df5fa49d09255182 | CMP-f272762c5e468eb2 | popup-button · document/ | + 문서 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d55fffe374e63b46 | CMP-f272762c5e468eb2 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6dca0680b71ddb0c | CMP-f272762c5e468eb2 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f7353c96e7c50470 | CMP-f272762c5e468eb2 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d2e6261fe405a5b0 | CMP-f272762c5e468eb2 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ee1ea4392e1cfbc1 | CMP-f272762c5e468eb2 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fb5eab55973ee98d | CMP-f272762c5e468eb2 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c7590f0eb5f6eb4b | CMP-f272762c5e468eb2 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-24da596c92074a29 | CMP-f272762c5e468eb2 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-39ee2c7738bcf821 | CMP-f272762c5e468eb2 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a37d9f1b5d576009 | CMP-f272762c5e468eb2 | popup-button · document/ | v0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-59a06f103ab71121 | CMP-f272762c5e468eb2 | popup-button · document/ | 원본 경로 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-26415f9ef67ff296 | CMP-f272762c5e468eb2 | popup-button · document/ | 문서 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51b77a44f0c88a0e | CMP-f272762c5e468eb2 | popup-button · document/ | 새 버전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-28dae6c9e7a8eae1 | SCREEN-document | popup · document/ | 문서 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-4a0808f254a656f3 | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 문서명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6d4f3b9242979357 | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 분류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2cd4d36f3d57598a | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 문서번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-06bc953947e156f2 | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 개정차수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-93e3ac61679ba15f | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 작성일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d9053751152994ba | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ef10e215641a1ef6 | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 공용폴더·원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-08a82dd4803f7df4 | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 관련 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3b24003854fbca90 | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 발신자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a8ee8038d562eb0e | CMP-28dae6c9e7a8eae1 | popup-field · document/ | 수신자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c9d74ec30ddcc5d1 | CMP-28dae6c9e7a8eae1 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5abe152f3c886f71 | CMP-28dae6c9e7a8eae1 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-53b62f4eeca4a823 | SCREEN-document | popup · document/ | 계약조건 요약 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-4d687db758cc79de | CMP-53b62f4eeca4a823 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4d687db758cc79de-COL-1 | CMP-4d687db758cc79de | popup-table-column · document/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4d687db758cc79de-COL-2 | CMP-4d687db758cc79de | popup-table-column · document/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e31bb8963cb9b2a | CMP-53b62f4eeca4a823 | popup-table · document/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e31bb8963cb9b2a-COL-1 | CMP-4e31bb8963cb9b2a | popup-table-column · document/ | CBS 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e31bb8963cb9b2a-COL-2 | CMP-4e31bb8963cb9b2a | popup-table-column · document/ | 사업비 반영액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e31bb8963cb9b2a-COL-3 | CMP-4e31bb8963cb9b2a | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b7be404547351e89 | CMP-53b62f4eeca4a823 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-896f66159aa06789 | CMP-53b62f4eeca4a823 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e2fa3994afb88eeb | CMP-53b62f4eeca4a823 | popup-button · document/ | 핵심조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cb205db85c5f43bd | CMP-53b62f4eeca4a823 | popup-button · document/ | 대금·지급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3f41f99991fcb745 | CMP-53b62f4eeca4a823 | popup-button · document/ | 업무범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1dddad143bd1443c | CMP-53b62f4eeca4a823 | popup-button · document/ | 책임·보증 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-18c57dbd220d625b | CMP-53b62f4eeca4a823 | popup-button · document/ | 변경이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-630d5f7c3b650240 | CMP-53b62f4eeca4a823 | popup-button · document/ | 원문근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97dfdb0157da9768 | CMP-53b62f4eeca4a823 | popup-button · document/ | 금액·부가세 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-52b73911e8cd9b1e | CMP-53b62f4eeca4a823 | popup-button · document/ | + 배부 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-262e9fe9bed4cd90 | CMP-53b62f4eeca4a823 | popup-button · document/ | 배부 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f33db371609cbe46 | SCREEN-document | popup · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-9b7a29fe52c17d92 | CMP-f33db371609cbe46 | popup-field · document/ | 기록 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-098e5630725dfbf2 | CMP-f33db371609cbe46 | popup-field · document/ | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac4855a86f717c40 | CMP-f33db371609cbe46 | popup-field · document/ | 공급가액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c19403ad1ddd64fe | CMP-f33db371609cbe46 | popup-field · document/ | 부가세 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c577468dad611857 | CMP-f33db371609cbe46 | popup-field · document/ | 거래총액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f65ba3b32ab6e112 | CMP-f33db371609cbe46 | popup-field · document/ | 기존 원가 금액 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2904ca9a1392111d | CMP-f33db371609cbe46 | popup-field · document/ | 거래 부가세 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ea6e071f9ce78f5c | CMP-f33db371609cbe46 | popup-field · document/ | 원가 귀속 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a446ec6055817b60 | CMP-f33db371609cbe46 | popup-field · document/ | 공제 검토 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dfe7369f935d981b | CMP-f33db371609cbe46 | popup-field · document/ | 검토 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-570e5b15a94befdc | CMP-f33db371609cbe46 | popup-field · document/ | 담당자가 확인한 안분 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d5aa73acba631a4d | CMP-f33db371609cbe46 | popup-field · document/ | 면세·불공제 대상 분자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c9de68d9a34a4acb | CMP-f33db371609cbe46 | popup-field · document/ | 전체 대상 분모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c284ea562a055203 | CMP-f33db371609cbe46 | popup-field · document/ | 기준 단위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-755da2937cf7be53 | CMP-f33db371609cbe46 | popup-field · document/ | 안분 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b1618f746de90ccf | CMP-f33db371609cbe46 | popup-field · document/ | 증빙 수취 주체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f92ce49c41ae1054 | CMP-f33db371609cbe46 | popup-field · document/ | 해당 과세기간 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c5b6f8efdc39af63 | CMP-f33db371609cbe46 | popup-field · document/ | 검토 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ee96d56fb2322b2b | CMP-f33db371609cbe46 | popup-field · document/ | 계약·증빙 또는 가정 근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d975cf03cb1ca82b | CMP-f33db371609cbe46 | popup-field · document/ | 불공제·안분 사유 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f079b042c9454e57 | CMP-f33db371609cbe46 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8ce896ccb1b023e9 | CMP-f33db371609cbe46 | popup-button · document/ | 공제 · 건물분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3d7f6bd7dee84fa5 | CMP-f33db371609cbe46 | popup-button · document/ | 공제 · 기타 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-da0968f6aa8f7119 | CMP-f33db371609cbe46 | popup-button · document/ | 불공제 · 토지분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-241630c0627e5b0b | CMP-f33db371609cbe46 | popup-button · document/ | 불공제 · 기타 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0049e3c1e5f77994 | CMP-f33db371609cbe46 | popup-button · document/ | 공통 · 건물+토지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-66dbedf87e1197b3 | CMP-f33db371609cbe46 | popup-button · document/ | 세액 없음 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bca30665125a53aa | CMP-f33db371609cbe46 | popup-button · document/ | 미확정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-22c3d35b59e439d9 | CMP-f33db371609cbe46 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-25c78ea962babd7b | SCREEN-document | popup · document/ | 계약 수정·변경계약 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-deac668bb5919664 | CMP-25c78ea962babd7b | popup-field · document/ | 계약명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3c1d79cea4fd0eb6 | CMP-25c78ea962babd7b | popup-field · document/ | 계약 상대방 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74725bcbbf5145e3 | CMP-25c78ea962babd7b | popup-field · document/ | 시공사·협력사 연결 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fa287026d7119fa1 | CMP-25c78ea962babd7b | popup-field · document/ | 계약 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-75583fe6f4bc00c5 | CMP-25c78ea962babd7b | popup-field · document/ | 계약일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a9d798b597f9ead9 | CMP-25c78ea962babd7b | popup-field · document/ | 계약기간 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5bb1dc7770b9d8ba | CMP-25c78ea962babd7b | popup-field · document/ | 계약 원본·공용폴더 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-29a0127ec85e618e | CMP-25c78ea962babd7b | popup-field · document/ | 기안번호 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c0de11d841dd2765 | CMP-25c78ea962babd7b | popup-field · document/ | 계약 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a23e23ee1c110a20 | CMP-25c78ea962babd7b | popup-field · document/ | 계약 총액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9a55a204628c45f8 | CMP-25c78ea962babd7b | popup-field · document/ | 공급가액 (원, 확인 시 입력) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c4cfb658c27e0801 | CMP-25c78ea962babd7b | popup-field · document/ | 부가세 (원, 면세는 0) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bfc94ef66eda0972 | CMP-25c78ea962babd7b | popup-field · document/ | 사업비 반영액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-82d6453e9b499fab | CMP-25c78ea962babd7b | popup-field · document/ | 변경 내용·메모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ee6e1888f36b6fe2 | CMP-25c78ea962babd7b | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0895dd8391dc0bb0 | CMP-25c78ea962babd7b | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c41ec3e6d9e61eef | SCREEN-document | popup · document/ | 문서 새 버전 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-c6496c0eddcef2ba | CMP-c41ec3e6d9e61eef | popup-field · document/ | 버전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7101b8b0a16cb0fa | CMP-c41ec3e6d9e61eef | popup-field · document/ | 발행일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1cb64553377dcd2f | CMP-c41ec3e6d9e61eef | popup-field · document/ | 원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-48ca156c733dc00a | CMP-c41ec3e6d9e61eef | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f816171996e1caf0 | CMP-c41ec3e6d9e61eef | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d1ff9ea4d3fb8f5a | SCREEN-report-generate | popup · report/generate | 기재자료 확인 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-4bda7d43588cba66 | CMP-d1ff9ea4d3fb8f5a | popup-table · report/generate | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4bda7d43588cba66-COL-1 | CMP-4bda7d43588cba66 | popup-table-column · report/generate | 기재자료 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4bda7d43588cba66-COL-2 | CMP-4bda7d43588cba66 | popup-table-column · report/generate | 현재 값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4bda7d43588cba66-COL-3 | CMP-4bda7d43588cba66 | popup-table-column · report/generate | 수정 위치 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6fd2112bac82b260 | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ea1d13561f38ef83 | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 법인정보 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0d2b174494692105 | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 보고서 내용 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-68c3d986a2306ed3 | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 사업개요 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-711530bd02648cc4 | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 파이낸싱 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d0417db32785b2ba | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 토지·대금 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1243fe3c83c5f416 | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 인허가 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fac35032bc7e1323 | CMP-d1ff9ea4d3fb8f5a | popup-button · report/generate | 분양·매각 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e54fe39606a8e8ae | SCREEN-report-generate | popup · report/generate | 저장한 보고서 보기 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-37383a6a22e83170 | CMP-e54fe39606a8e8ae | popup-table · report/generate | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37383a6a22e83170-COL-1 | CMP-37383a6a22e83170 | popup-table-column · report/generate | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37383a6a22e83170-COL-2 | CMP-37383a6a22e83170 | popup-table-column · report/generate | 유형 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37383a6a22e83170-COL-3 | CMP-37383a6a22e83170 | popup-table-column · report/generate | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37383a6a22e83170-COL-4 | CMP-37383a6a22e83170 | popup-table-column · report/generate | 제출일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37383a6a22e83170-COL-5 | CMP-37383a6a22e83170 | popup-table-column · report/generate | 접수번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37383a6a22e83170-COL-6 | CMP-37383a6a22e83170 | popup-table-column · report/generate | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c9fee260cba5a0e7 | CMP-e54fe39606a8e8ae | popup-button · report/generate | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-334864d3175d75dd | CMP-e54fe39606a8e8ae | popup-button · report/generate | 기록 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4996690fa81bfa95 | CMP-e54fe39606a8e8ae | popup-button · report/generate | 상태 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-902a64e4fbacfd4b | SCREEN-report-generate | popup · report/generate | 기존 보고 기록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-b7e2dfcccec99df4 | CMP-902a64e4fbacfd4b | popup-table · report/generate | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b7e2dfcccec99df4-COL-1 | CMP-b7e2dfcccec99df4 | popup-table-column · report/generate | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b7e2dfcccec99df4-COL-2 | CMP-b7e2dfcccec99df4 | popup-table-column · report/generate | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5170673392d13c1b | CMP-902a64e4fbacfd4b | popup-button · report/generate | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e53ef73b2882a3a8 | SCREEN-report-generate | popup · report/generate | 보고 상태 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-e2cf97c3b66fb6f6 | CMP-e53ef73b2882a3a8 | popup-field · report/generate | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-49d3fb45f89a865e | CMP-e53ef73b2882a3a8 | popup-field · report/generate | 제출일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e71ab3b8e5bae13 | CMP-e53ef73b2882a3a8 | popup-field · report/generate | 접수번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c1fe53c0655c3140 | CMP-e53ef73b2882a3a8 | popup-button · report/generate | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6260e905bb37c79e | CMP-e53ef73b2882a3a8 | popup-button · report/generate | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-947125efd1adfec0 | SCREEN-company-cak-rows | inline-panel-state · company/cak-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-e964945c1e85155a | CMP-947125efd1adfec0 | popup-field · company/cak-rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1513366fe5073e96 | CMP-947125efd1adfec0 | popup-field · company/cak-rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296 | CMP-947125efd1adfec0 | popup-table · company/cak-rows | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-1 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-2 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-3 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-4 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-5 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 시공능력평가액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-6 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-7 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-8 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b225fa8228978296-COL-9 | CMP-b225fa8228978296 | popup-table-column · company/cak-rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-415d357ac55d70b4 | CMP-947125efd1adfec0 | popup-table · company/cak-rows | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-415d357ac55d70b4-COL-1 | CMP-415d357ac55d70b4 | popup-table-column · company/cak-rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-415d357ac55d70b4-COL-2 | CMP-415d357ac55d70b4 | popup-table-column · company/cak-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f8ba09d243235dc | CMP-947125efd1adfec0 | popup-table · company/cak-rows | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f8ba09d243235dc-COL-1 | CMP-4f8ba09d243235dc | popup-table-column · company/cak-rows | 등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f8ba09d243235dc-COL-2 | CMP-4f8ba09d243235dc | popup-table-column · company/cak-rows | 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f8ba09d243235dc-COL-3 | CMP-4f8ba09d243235dc | popup-table-column · company/cak-rows | 평가사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f8ba09d243235dc-COL-4 | CMP-4f8ba09d243235dc | popup-table-column · company/cak-rows | 평가일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f8ba09d243235dc-COL-5 | CMP-4f8ba09d243235dc | popup-table-column · company/cak-rows | 수집일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4f8ba09d243235dc-COL-6 | CMP-4f8ba09d243235dc | popup-table-column · company/cak-rows | 원문 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-129e296f7b7c7709 | CMP-947125efd1adfec0 | popup-table · company/cak-rows | 상세 표 4 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-129e296f7b7c7709-COL-1 | CMP-129e296f7b7c7709 | popup-table-column · company/cak-rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-129e296f7b7c7709-COL-2 | CMP-129e296f7b7c7709 | popup-table-column · company/cak-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b074c938f0adc375 | CMP-947125efd1adfec0 | popup-table · company/cak-rows | 상세 표 5 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b074c938f0adc375-COL-1 | CMP-b074c938f0adc375 | popup-table-column · company/cak-rows | 단가 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b074c938f0adc375-COL-2 | CMP-b074c938f0adc375 | popup-table-column · company/cak-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c7540d39f46ef1ee | CMP-947125efd1adfec0 | popup-table · company/cak-rows | 상세 표 6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c7540d39f46ef1ee-COL-1 | CMP-c7540d39f46ef1ee | popup-table-column · company/cak-rows | 게시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c7540d39f46ef1ee-COL-2 | CMP-c7540d39f46ef1ee | popup-table-column · company/cak-rows | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c7540d39f46ef1ee-COL-3 | CMP-c7540d39f46ef1ee | popup-table-column · company/cak-rows | 매체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-43c30cea50fb9936 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-07e302d5db3272b3 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6ebfaf39d3679301 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-132cbb66b5db8bcc | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-12e4584ffed70a0f | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-91388d14b8c038c0 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20fa481be63462b8 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-46fc898b80b7d99a | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 검색 조건 초기화 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-636cff261e18699b | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21c90b722c6c5a2a | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b6fdc80ae0ed9b0 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7b352591babc4ccf | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 시공능력평가액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a181405b5698cd97 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c4ffb3495440918 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-90651f1129629315 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | 단가·근거 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-796f32ad03394fcb | CMP-947125efd1adfec0 | popup-button · company/cak-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-948a165918266791 | CMP-947125efd1adfec0 | popup-button · company/cak-rows | + 댓글 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-681dd4bcf415a22d | SCREEN-company-directory | popup · company/directory | 업체 등록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-4d2af2f37e1af045 | CMP-681dd4bcf415a22d | popup-field · company/directory | 업체명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-96f7a1fff651e796 | CMP-681dd4bcf415a22d | popup-field · company/directory | 검색용 별칭 · 쉼표로 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-32420868857fa63b | CMP-681dd4bcf415a22d | popup-field · company/directory | 분야 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-967e87d86f1b7f87 | CMP-681dd4bcf415a22d | popup-field · company/directory | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0288f008563d5ed2 | CMP-681dd4bcf415a22d | popup-button · company/directory | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e9a2c47214243d7b | CMP-681dd4bcf415a22d | popup-button · company/directory | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eeec99e72a64b61f | SCREEN-law-recent | popup · law/recent | 사업별 법령 확인 목록 | source-content-reviewed-not-business-sufficiency-acceptance / block | notrun / notrun / notrun / notrun |
| CMP-e1ffc8bcb7921ecd | CMP-eeec99e72a64b61f | popup-button · law/recent | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8a17b6d95246d6a6 | CMP-eeec99e72a64b61f | popup-button · law/recent | 다시 불러오기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-67eec637e0970cb4 | SCREEN-law-recent | popup · law/recent | 법령 조회 조건 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-2138b896b3de71bd | CMP-67eec637e0970cb4 | popup-field · law/recent | 변경 조회 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-23f51c47b778c897 | CMP-67eec637e0970cb4 | popup-field · law/recent | 법령 분야 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a1ad67d515913a17 | CMP-67eec637e0970cb4 | popup-field · law/recent | 법령명·내용 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0a4f23a1f0def70c | CMP-67eec637e0970cb4 | popup-button · law/recent | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2387e0228ad2f953 | CMP-67eec637e0970cb4 | popup-button · law/recent | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f0b938c23381cdcc | SCREEN-spec-history | popup · spec/history | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-1702d71cbeeca6ed | CMP-f0b938c23381cdcc | popup-table · spec/history | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1702d71cbeeca6ed-COL-1 | CMP-1702d71cbeeca6ed | popup-table-column · spec/history | 변경 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1702d71cbeeca6ed-COL-2 | CMP-1702d71cbeeca6ed | popup-table-column · spec/history | 변경 전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1702d71cbeeca6ed-COL-3 | CMP-1702d71cbeeca6ed | popup-table-column · spec/history | 변경 후 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1702d71cbeeca6ed-COL-4 | CMP-1702d71cbeeca6ed | popup-table-column · spec/history | 증감 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-512dd1d5f11b82d2 | CMP-f0b938c23381cdcc | popup-button · spec/history | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2951170c34c93479 | SCREEN-document | popup · document/ | 계약조건 요약 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-6f6a68341cfbc586 | CMP-2951170c34c93479 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f6a68341cfbc586-COL-1 | CMP-6f6a68341cfbc586 | popup-table-column · document/ | 조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f6a68341cfbc586-COL-2 | CMP-6f6a68341cfbc586 | popup-table-column · document/ | 확정 지급총액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f6a68341cfbc586-COL-3 | CMP-6f6a68341cfbc586 | popup-table-column · document/ | 실제 지급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f6a68341cfbc586-COL-4 | CMP-6f6a68341cfbc586 | popup-table-column · document/ | 확정 미지급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f6a68341cfbc586-COL-5 | CMP-6f6a68341cfbc586 | popup-table-column · document/ | 상태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f6a68341cfbc586-COL-6 | CMP-6f6a68341cfbc586 | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00c94ec1b38201b9 | CMP-2951170c34c93479 | popup-table · document/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00c94ec1b38201b9-COL-1 | CMP-00c94ec1b38201b9 | popup-table-column · document/ | 지급일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00c94ec1b38201b9-COL-2 | CMP-00c94ec1b38201b9 | popup-table-column · document/ | 회차 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00c94ec1b38201b9-COL-3 | CMP-00c94ec1b38201b9 | popup-table-column · document/ | 지급총액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00c94ec1b38201b9-COL-4 | CMP-00c94ec1b38201b9 | popup-table-column · document/ | 사업비 반영액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00c94ec1b38201b9-COL-5 | CMP-00c94ec1b38201b9 | popup-table-column · document/ | 기안번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00c94ec1b38201b9-COL-6 | CMP-00c94ec1b38201b9 | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e8098f532a4414d6 | CMP-2951170c34c93479 | popup-table · document/ | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e8098f532a4414d6-COL-1 | CMP-e8098f532a4414d6 | popup-table-column · document/ | 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e8098f532a4414d6-COL-2 | CMP-e8098f532a4414d6 | popup-table-column · document/ | 기성금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e8098f532a4414d6-COL-3 | CMP-e8098f532a4414d6 | popup-table-column · document/ | 메모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e8098f532a4414d6-COL-4 | CMP-e8098f532a4414d6 | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e562b7c696b40188 | CMP-2951170c34c93479 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-41e047663ce7f67f | CMP-2951170c34c93479 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-706facbe364e9d1e | CMP-2951170c34c93479 | popup-button · document/ | 핵심조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ff36a1eed9760fba | CMP-2951170c34c93479 | popup-button · document/ | 대금·지급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c9060bfb1b6363d3 | CMP-2951170c34c93479 | popup-button · document/ | 업무범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-be1e09c859d32f64 | CMP-2951170c34c93479 | popup-button · document/ | 책임·보증 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca0642a45a853af2 | CMP-2951170c34c93479 | popup-button · document/ | 변경이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbe0a0961825749a | CMP-2951170c34c93479 | popup-button · document/ | 원문근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ebb1d0532105aa4 | CMP-2951170c34c93479 | popup-button · document/ | + 실제 지급 기록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-43f2a122f64ba9c5 | CMP-2951170c34c93479 | popup-button · document/ | + 지급 기록 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-af42a717569086b6 | CMP-2951170c34c93479 | popup-button · document/ | 지급 누계 확인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-39e80e3b8986d3e0 | CMP-2951170c34c93479 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-05040c6b73afca3c | CMP-2951170c34c93479 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f8c41ea5d109953e | CMP-2951170c34c93479 | popup-button · document/ | + 기성 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-364aa1776d8f5f1e | CMP-2951170c34c93479 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b24559ec631475bb | CMP-2951170c34c93479 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0ec856246f0d5601 | SCREEN-document | popup · document/ | 지급 기록 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-a8699d48434738be | CMP-0ec856246f0d5601 | popup-field · document/ | 지급일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0f4c1249bee90c24 | CMP-0ec856246f0d5601 | popup-field · document/ | 지급액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4e842442fa6326ff | CMP-0ec856246f0d5601 | popup-field · document/ | 지급 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0cbde08b6040490d | CMP-0ec856246f0d5601 | popup-field · document/ | 연결 확정조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-852aa359b3f0ea21 | CMP-0ec856246f0d5601 | popup-field · document/ | 기안번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6e8cf9b927c475c0 | CMP-0ec856246f0d5601 | popup-field · document/ | 사업비 반영액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3ffa2e686ddeb376 | CMP-0ec856246f0d5601 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-35c30835de2cc041 | CMP-0ec856246f0d5601 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a95ef1b5baf0a835 | CMP-0ec856246f0d5601 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-614a4488d8aca99f | CMP-0ec856246f0d5601 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d38cf99ff0a53be6 | CMP-0ec856246f0d5601 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-280f95e22224dd7f | CMP-0ec856246f0d5601 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-421acadab974dd16 | CMP-0ec856246f0d5601 | popup-field · document/ | 메모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d48fbaf54eab68b4 | CMP-0ec856246f0d5601 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-569dd5442fcc9e73 | CMP-0ec856246f0d5601 | popup-button · document/ | + 배부행 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f167c4e40d3997e2 | CMP-0ec856246f0d5601 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ad19714026794d5 | SCREEN-document | popup · document/ | 지급내역 확인 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-a5e800cb1ee64d26 | CMP-1ad19714026794d5 | popup-field · document/ | 확인 기준일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a9dd26266c0c047a | CMP-1ad19714026794d5 | popup-field · document/ | 대사 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b06ee8ec35a396f4 | CMP-1ad19714026794d5 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6326c3893bedc82b | CMP-1ad19714026794d5 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97a8e779e5409beb | SCREEN-document | popup · document/ | 지급 기록 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-e98a1a40707df62d | CMP-97a8e779e5409beb | popup-field · document/ | 지급일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0beaa92639b3bb39 | CMP-97a8e779e5409beb | popup-field · document/ | 지급액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5776c7f628e1ef41 | CMP-97a8e779e5409beb | popup-field · document/ | 지급 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f19771e64b08096f | CMP-97a8e779e5409beb | popup-field · document/ | 연결 확정조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-87fc0558258ce310 | CMP-97a8e779e5409beb | popup-field · document/ | 기안번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e61025cf43ee826a | CMP-97a8e779e5409beb | popup-field · document/ | 사업비 반영액 (원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a32255f77ced7f67 | CMP-97a8e779e5409beb | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-604cd23dd6c7cc58 | CMP-97a8e779e5409beb | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51f4a96b181d3941 | CMP-97a8e779e5409beb | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a5b5441d30be0a3d | CMP-97a8e779e5409beb | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0d22490099d61d29 | CMP-97a8e779e5409beb | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-17e9c8ea1b010b57 | CMP-97a8e779e5409beb | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c198cb766ce2a9b1 | CMP-97a8e779e5409beb | popup-field · document/ | 메모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3a91850805b567f | CMP-97a8e779e5409beb | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3986545d65c42db | CMP-97a8e779e5409beb | popup-button · document/ | + 배부행 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-626bdc8208566d3a | CMP-97a8e779e5409beb | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47020bd9a408392c | SCREEN-document | popup · document/ | 기성 인정금액 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-1f1731ab98f27ca6 | CMP-47020bd9a408392c | popup-field · document/ | 기성 인정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42139ca97d5fc7d2 | CMP-47020bd9a408392c | popup-field · document/ | 기성 인정액 (사업비 기준, 원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-92304073251ab294 | CMP-47020bd9a408392c | popup-field · document/ | 기성 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b2a3b33a7934f217 | CMP-47020bd9a408392c | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-191ddac048f97a2c | CMP-47020bd9a408392c | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-498037a07b5f902a | CMP-47020bd9a408392c | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a0513627ec64b02c | CMP-47020bd9a408392c | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6553eb9ca6aa7926 | CMP-47020bd9a408392c | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3fabb819ab1ff48 | CMP-47020bd9a408392c | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-59b01e14105562b7 | CMP-47020bd9a408392c | popup-field · document/ | 메모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8907fe259cf96816 | CMP-47020bd9a408392c | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7b111f01ea1fbdf6 | CMP-47020bd9a408392c | popup-button · document/ | + 배부행 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fe83e127bc074238 | CMP-47020bd9a408392c | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dc8aacf3acaf8008 | SCREEN-document | popup · document/ | 기성 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-02af8e65ea0bf75b | CMP-dc8aacf3acaf8008 | popup-field · document/ | 기성 인정일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-06515d2b0a6f27fb | CMP-dc8aacf3acaf8008 | popup-field · document/ | 기성 인정액 (사업비 기준, 원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-71f8e94b5cc13f62 | CMP-dc8aacf3acaf8008 | popup-field · document/ | 기성 근거 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c3be400d4a15579d | CMP-dc8aacf3acaf8008 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-816576de0b406230 | CMP-dc8aacf3acaf8008 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-36cee15fca58b9a9 | CMP-dc8aacf3acaf8008 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3c39b9233146365 | CMP-dc8aacf3acaf8008 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e7f867c2276e4bd0 | CMP-dc8aacf3acaf8008 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0ee664afc5316f70 | CMP-dc8aacf3acaf8008 | popup-field · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ae8bd6b3c27419c | CMP-dc8aacf3acaf8008 | popup-field · document/ | 메모 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d0a90362a33497e | CMP-dc8aacf3acaf8008 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac1f914de3089d22 | CMP-dc8aacf3acaf8008 | popup-button · document/ | + 배부행 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bc30bb6e4c3b653e | CMP-dc8aacf3acaf8008 | popup-button · document/ | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ed45b307a4d2a9dc | SCREEN-document | popup · document/ | 계약조건 요약 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-f87db0cc3d08aacd | CMP-ed45b307a4d2a9dc | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c38c15cb7cdd3a15 | CMP-ed45b307a4d2a9dc | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cf55ac97b58336a0 | CMP-ed45b307a4d2a9dc | popup-button · document/ | 핵심조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f370f187ebaeb264 | CMP-ed45b307a4d2a9dc | popup-button · document/ | 대금·지급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ee47821f89e7c50d | CMP-ed45b307a4d2a9dc | popup-button · document/ | 업무범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-25a6aa6eec177680 | CMP-ed45b307a4d2a9dc | popup-button · document/ | 책임·보증 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9511374cf00232b2 | CMP-ed45b307a4d2a9dc | popup-button · document/ | 변경이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bc3c7beaf34bb53f | CMP-ed45b307a4d2a9dc | popup-button · document/ | 원문근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d581f3e8deaaab61 | SCREEN-document | popup · document/ | 계약조건 요약 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a | CMP-d581f3e8deaaab61 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a-COL-1 | CMP-9f7e7da6c63c4a7a | popup-table-column · document/ | 차수 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a-COL-2 | CMP-9f7e7da6c63c4a7a | popup-table-column · document/ | 계약일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a-COL-3 | CMP-9f7e7da6c63c4a7a | popup-table-column · document/ | 총액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a-COL-4 | CMP-9f7e7da6c63c4a7a | popup-table-column · document/ | 공급가액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a-COL-5 | CMP-9f7e7da6c63c4a7a | popup-table-column · document/ | 부가세 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a-COL-6 | CMP-9f7e7da6c63c4a7a | popup-table-column · document/ | 사업비 반영액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9f7e7da6c63c4a7a-COL-7 | CMP-9f7e7da6c63c4a7a | popup-table-column · document/ | 변경 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2aab4c8e4c55f304 | CMP-d581f3e8deaaab61 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8b5a42f476025a0a | CMP-d581f3e8deaaab61 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bfe32c6e7629a1bd | CMP-d581f3e8deaaab61 | popup-button · document/ | 핵심조건 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bd0d3fc5ac308325 | CMP-d581f3e8deaaab61 | popup-button · document/ | 대금·지급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d55822f438cd2bd8 | CMP-d581f3e8deaaab61 | popup-button · document/ | 업무범위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37c65e36dd5eda42 | CMP-d581f3e8deaaab61 | popup-button · document/ | 책임·보증 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c61d2ea13423b43d | CMP-d581f3e8deaaab61 | popup-button · document/ | 변경이력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f264f7977518cfe3 | CMP-d581f3e8deaaab61 | popup-button · document/ | 원문근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-69a0099f1ad7efc3 | CMP-d581f3e8deaaab61 | popup-button · document/ | 변경계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9ecaf5bad158c8a3 | SCREEN-law-catalog | popup · law/catalog | 법령 조회 조건 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-327431c45a55593d | CMP-9ecaf5bad158c8a3 | popup-field · law/catalog | 변경 조회 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-34a2a3914d716419 | CMP-9ecaf5bad158c8a3 | popup-field · law/catalog | 법령 분야 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ae6d8bf0ba62a568 | CMP-9ecaf5bad158c8a3 | popup-field · law/catalog | 법령명·내용 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-149e1d1fbde816ce | CMP-9ecaf5bad158c8a3 | popup-button · law/catalog | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2140ba9f4758ccf1 | CMP-9ecaf5bad158c8a3 | popup-button · law/catalog | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d27121e11113ed36 | SCREEN-law-catalog | popup · law/catalog | 사업별 법령 확인 목록 | source-content-reviewed-not-business-sufficiency-acceptance / block | notrun / notrun / notrun / notrun |
| CMP-baeaacb6ce5774f3 | CMP-d27121e11113ed36 | popup-button · law/catalog | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3e5dae81af1c19e7 | CMP-d27121e11113ed36 | popup-button · law/catalog | 다시 불러오기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6897241e4cbe7e00 | SCREEN-company-cm-rows | inline-panel-state · company/cm-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-ecff37701e7b84a6 | CMP-6897241e4cbe7e00 | popup-field · company/cm-rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1e01fe9414334f4a | CMP-6897241e4cbe7e00 | popup-field · company/cm-rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371 | CMP-6897241e4cbe7e00 | popup-table · company/cm-rows | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-1 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-2 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-3 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-4 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-5 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 용역형 CM 실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-6 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-7 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-8 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a829debb30e4d371-COL-9 | CMP-a829debb30e4d371 | popup-table-column · company/cm-rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fca81ccf9a4cfc6b | CMP-6897241e4cbe7e00 | popup-table · company/cm-rows | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fca81ccf9a4cfc6b-COL-1 | CMP-fca81ccf9a4cfc6b | popup-table-column · company/cm-rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fca81ccf9a4cfc6b-COL-2 | CMP-fca81ccf9a4cfc6b | popup-table-column · company/cm-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-45c3bc128d01e9d9 | CMP-6897241e4cbe7e00 | popup-table · company/cm-rows | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-45c3bc128d01e9d9-COL-1 | CMP-45c3bc128d01e9d9 | popup-table-column · company/cm-rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-45c3bc128d01e9d9-COL-2 | CMP-45c3bc128d01e9d9 | popup-table-column · company/cm-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21d5b8cd4852e8a6 | CMP-6897241e4cbe7e00 | popup-table · company/cm-rows | 상세 표 4 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21d5b8cd4852e8a6-COL-1 | CMP-21d5b8cd4852e8a6 | popup-table-column · company/cm-rows | 단가 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21d5b8cd4852e8a6-COL-2 | CMP-21d5b8cd4852e8a6 | popup-table-column · company/cm-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dd11a3a0811b9de8 | CMP-6897241e4cbe7e00 | popup-table · company/cm-rows | 상세 표 5 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dd11a3a0811b9de8-COL-1 | CMP-dd11a3a0811b9de8 | popup-table-column · company/cm-rows | 게시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dd11a3a0811b9de8-COL-2 | CMP-dd11a3a0811b9de8 | popup-table-column · company/cm-rows | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dd11a3a0811b9de8-COL-3 | CMP-dd11a3a0811b9de8 | popup-table-column · company/cm-rows | 매체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ccd498c94660a94 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7d9724b27ca29170 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fbecb20d66543fb7 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4823ce9c857e45e0 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9acc14e44c6fb818 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0d3a37aca4876f8c | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dac6ebf8fce41bb5 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7313db15b69c7293 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 검색 조건 초기화 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-efc2be1680183645 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-91a17dd8f4cc42b7 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2657826b8e419dc6 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-86e0ea56d77655f0 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 용역형 CM 실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-742892c0e8786019 | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e9a48b4175813a1c | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fce276611632d67f | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | 단가·근거 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1a2960ee5bd6a9cf | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c2da65cbe8ba3f4e | CMP-6897241e4cbe7e00 | popup-button · company/cm-rows | + 댓글 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-18cc9b6a5fc900c9 | SCREEN-company-etis-overall_rows | inline-panel-state · company/etis-overall_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-647a8ab3c17a29b9 | CMP-18cc9b6a5fc900c9 | popup-field · company/etis-overall_rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2627b07dab4c14e2 | CMP-18cc9b6a5fc900c9 | popup-field · company/etis-overall_rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b | CMP-18cc9b6a5fc900c9 | popup-table · company/etis-overall_rows | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-1 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-2 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-3 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-4 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-5 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-6 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-7 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-8 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9517ee8ee5b0555b-COL-9 | CMP-9517ee8ee5b0555b | popup-table-column · company/etis-overall_rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-27a7939a35c67a7b | CMP-18cc9b6a5fc900c9 | popup-table · company/etis-overall_rows | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-27a7939a35c67a7b-COL-1 | CMP-27a7939a35c67a7b | popup-table-column · company/etis-overall_rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-27a7939a35c67a7b-COL-2 | CMP-27a7939a35c67a7b | popup-table-column · company/etis-overall_rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-891028d61b3b624e | CMP-18cc9b6a5fc900c9 | popup-table · company/etis-overall_rows | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-891028d61b3b624e-COL-1 | CMP-891028d61b3b624e | popup-table-column · company/etis-overall_rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-891028d61b3b624e-COL-2 | CMP-891028d61b3b624e | popup-table-column · company/etis-overall_rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3393e9d9c924285e | CMP-18cc9b6a5fc900c9 | popup-table · company/etis-overall_rows | 상세 표 4 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3393e9d9c924285e-COL-1 | CMP-3393e9d9c924285e | popup-table-column · company/etis-overall_rows | 단가 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3393e9d9c924285e-COL-2 | CMP-3393e9d9c924285e | popup-table-column · company/etis-overall_rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b99dcf45d63551e9 | CMP-18cc9b6a5fc900c9 | popup-table · company/etis-overall_rows | 상세 표 5 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b99dcf45d63551e9-COL-1 | CMP-b99dcf45d63551e9 | popup-table-column · company/etis-overall_rows | 게시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b99dcf45d63551e9-COL-2 | CMP-b99dcf45d63551e9 | popup-table-column · company/etis-overall_rows | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b99dcf45d63551e9-COL-3 | CMP-b99dcf45d63551e9 | popup-table-column · company/etis-overall_rows | 매체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d8a8c557b7648f8 | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-379aa680c6c84f0e | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8b6abc77ea318d8e | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-220b2f6464521c6b | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20202112569c44a5 | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a5be3c22a148b542 | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-98edb97d12115139 | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-adcbe2f52109d03c | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 검색 조건 초기화 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-950d67a64d74b735 | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6fa554a6150c89db | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec6344c1422159f3 | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-84262485ab0c65c8 | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7e57a08b212eab9c | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-452bd808f3e4febb | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-023218027c0bc26d | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | 단가·근거 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42d0b6cd42ed803b | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-656e6d70525cc68f | CMP-18cc9b6a5fc900c9 | popup-button · company/etis-overall_rows | + 댓글 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6ac8cce08dc9d46e | SCREEN-company-etis-construction_rows | inline-panel-state · company/etis-construction_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d37fdb7b1a1fc2e4 | CMP-6ac8cce08dc9d46e | popup-field · company/etis-construction_rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-86191118697d1f01 | CMP-6ac8cce08dc9d46e | popup-field · company/etis-construction_rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342 | CMP-6ac8cce08dc9d46e | popup-table · company/etis-construction_rows | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-1 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-2 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-3 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-4 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-5 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-6 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-7 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-8 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-03b9679952286342-COL-9 | CMP-03b9679952286342 | popup-table-column · company/etis-construction_rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20f5c5f3a53616bd | CMP-6ac8cce08dc9d46e | popup-table · company/etis-construction_rows | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20f5c5f3a53616bd-COL-1 | CMP-20f5c5f3a53616bd | popup-table-column · company/etis-construction_rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20f5c5f3a53616bd-COL-2 | CMP-20f5c5f3a53616bd | popup-table-column · company/etis-construction_rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3cc5fe54eddfdc34 | CMP-6ac8cce08dc9d46e | popup-table · company/etis-construction_rows | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3cc5fe54eddfdc34-COL-1 | CMP-3cc5fe54eddfdc34 | popup-table-column · company/etis-construction_rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3cc5fe54eddfdc34-COL-2 | CMP-3cc5fe54eddfdc34 | popup-table-column · company/etis-construction_rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0 | CMP-6ac8cce08dc9d46e | popup-table · company/etis-construction_rows | 상세 표 4 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-1 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-2 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-3 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-4 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 발주자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-5 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-6 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-7 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 계약기간 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e485c345acb39cd0-COL-8 | CMP-e485c345acb39cd0 | popup-table-column · company/etis-construction_rows | 출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3362a6fea3d59e4 | CMP-6ac8cce08dc9d46e | popup-table · company/etis-construction_rows | 상세 표 5 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3362a6fea3d59e4-COL-1 | CMP-d3362a6fea3d59e4 | popup-table-column · company/etis-construction_rows | 단가 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3362a6fea3d59e4-COL-2 | CMP-d3362a6fea3d59e4 | popup-table-column · company/etis-construction_rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2dab75ea3e9f3054 | CMP-6ac8cce08dc9d46e | popup-table · company/etis-construction_rows | 상세 표 6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2dab75ea3e9f3054-COL-1 | CMP-2dab75ea3e9f3054 | popup-table-column · company/etis-construction_rows | 게시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2dab75ea3e9f3054-COL-2 | CMP-2dab75ea3e9f3054 | popup-table-column · company/etis-construction_rows | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2dab75ea3e9f3054-COL-3 | CMP-2dab75ea3e9f3054 | popup-table-column · company/etis-construction_rows | 매체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec47962b310c4da2 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8015d018a6af2358 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7541463347bbbfa5 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-42978446dcb8cff8 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a1f2b21fbe9ee66d | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f816c90451a8999e | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dd01d91b42fc9595 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-350067e0f370b6dc | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 검색 조건 초기화 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b885796dc707dda6 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ac2e578daaf7ce1 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-504b2ac9306361b5 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-53c8f244089ce3e1 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1cde53ebb49147ef | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-15530466faab20f1 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57ed88e70e5c71b3 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | 단가·근거 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f9d850bfa69b37f9 | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-69c782594177adee | CMP-6ac8cce08dc9d46e | popup-button · company/etis-construction_rows | + 댓글 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-deef2ed03b1f9000 | SCREEN-company-kacem-rows | inline-panel-state · company/kacem-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-c1ddc0ec87db8759 | CMP-deef2ed03b1f9000 | popup-field · company/kacem-rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d3e41c607993a1b9 | CMP-deef2ed03b1f9000 | popup-field · company/kacem-rows | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde | CMP-deef2ed03b1f9000 | popup-table · company/kacem-rows | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-1 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-2 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-3 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 변동 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-4 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-5 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-6 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-7 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 신용등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-8 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-78e5cdab8f071cde-COL-9 | CMP-78e5cdab8f071cde | popup-table-column · company/kacem-rows | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c8d9cecc6de6429 | CMP-deef2ed03b1f9000 | popup-table · company/kacem-rows | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c8d9cecc6de6429-COL-1 | CMP-1c8d9cecc6de6429 | popup-table-column · company/kacem-rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1c8d9cecc6de6429-COL-2 | CMP-1c8d9cecc6de6429 | popup-table-column · company/kacem-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a38da25efa801890 | CMP-deef2ed03b1f9000 | popup-table · company/kacem-rows | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a38da25efa801890-COL-1 | CMP-a38da25efa801890 | popup-table-column · company/kacem-rows | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a38da25efa801890-COL-2 | CMP-a38da25efa801890 | popup-table-column · company/kacem-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e | CMP-deef2ed03b1f9000 | popup-table · company/kacem-rows | 상세 표 4 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-1 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-2 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 사업명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-3 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-4 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 발주자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-5 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-6 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-7 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 계약기간 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74ec40698f12ce9e-COL-8 | CMP-74ec40698f12ce9e | popup-table-column · company/kacem-rows | 출처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-68fd3f7badf9ac84 | CMP-deef2ed03b1f9000 | popup-table · company/kacem-rows | 상세 표 5 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-68fd3f7badf9ac84-COL-1 | CMP-68fd3f7badf9ac84 | popup-table-column · company/kacem-rows | 단가 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-68fd3f7badf9ac84-COL-2 | CMP-68fd3f7badf9ac84 | popup-table-column · company/kacem-rows | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e7c9ca9a17d766c6 | CMP-deef2ed03b1f9000 | popup-table · company/kacem-rows | 상세 표 6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e7c9ca9a17d766c6-COL-1 | CMP-e7c9ca9a17d766c6 | popup-table-column · company/kacem-rows | 게시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e7c9ca9a17d766c6-COL-2 | CMP-e7c9ca9a17d766c6 | popup-table-column · company/kacem-rows | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e7c9ca9a17d766c6-COL-3 | CMP-e7c9ca9a17d766c6 | popup-table-column · company/kacem-rows | 매체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8e3fe36d437f5c02 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cbb9a85e870587a4 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7bf3e076075b5f89 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-74d3555a78033bd1 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f314815fab361afb | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4d4dcc537dcd09a4 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-281ccf078df21baf | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f807718de310f837 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 검색 조건 초기화 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8bd0e3ed719a92ac | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cdb158858e441a89 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 전기순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02e86630cbf42aad | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-324d298d250d1ad7 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 수주실적 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e66367347f7fbf88 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-147b5d0a0a8fe73d | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-425f9effb893acd0 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | 단가·근거 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce0dd8333ebd041f | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-255cc2858c2b0c33 | CMP-deef2ed03b1f9000 | popup-button · company/kacem-rows | + 댓글 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d5343c72542c8bc9 | SCREEN-company-directory | inline-panel-state · company/directory | 업체 기준정보 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-15e7a0053f604960 | CMP-d5343c72542c8bc9 | popup-field · company/directory | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-68a7e4940e05b594 | CMP-d5343c72542c8bc9 | popup-field · company/directory | 이름 확인 필요 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0 | CMP-d5343c72542c8bc9 | popup-table · company/directory | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0-COL-1 | CMP-a4201c641f6631e0 | popup-table-column · company/directory | 업체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0-COL-2 | CMP-a4201c641f6631e0 | popup-table-column · company/directory | 분야·평가기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0-COL-3 | CMP-a4201c641f6631e0 | popup-table-column · company/directory | 순위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0-COL-4 | CMP-a4201c641f6631e0 | popup-table-column · company/directory | 지역 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0-COL-5 | CMP-a4201c641f6631e0 | popup-table-column · company/directory | 신용등급 · 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0-COL-6 | CMP-a4201c641f6631e0 | popup-table-column · company/directory | 당사 참여 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4201c641f6631e0-COL-7 | CMP-a4201c641f6631e0 | popup-table-column · company/directory | 영업라인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-793add330a19dd5e | CMP-d5343c72542c8bc9 | popup-table · company/directory | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-793add330a19dd5e-COL-1 | CMP-793add330a19dd5e | popup-table-column · company/directory | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-793add330a19dd5e-COL-2 | CMP-793add330a19dd5e | popup-table-column · company/directory | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79ecaec2b74cd479 | CMP-d5343c72542c8bc9 | popup-table · company/directory | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79ecaec2b74cd479-COL-1 | CMP-79ecaec2b74cd479 | popup-table-column · company/directory | 등급 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79ecaec2b74cd479-COL-2 | CMP-79ecaec2b74cd479 | popup-table-column · company/directory | 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79ecaec2b74cd479-COL-3 | CMP-79ecaec2b74cd479 | popup-table-column · company/directory | 평가사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79ecaec2b74cd479-COL-4 | CMP-79ecaec2b74cd479 | popup-table-column · company/directory | 평가일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79ecaec2b74cd479-COL-5 | CMP-79ecaec2b74cd479 | popup-table-column · company/directory | 수집일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79ecaec2b74cd479-COL-6 | CMP-79ecaec2b74cd479 | popup-table-column · company/directory | 원문 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6af4abb36580811f | CMP-d5343c72542c8bc9 | popup-table · company/directory | 상세 표 4 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6af4abb36580811f-COL-1 | CMP-6af4abb36580811f | popup-table-column · company/directory | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6af4abb36580811f-COL-2 | CMP-6af4abb36580811f | popup-table-column · company/directory | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-406932a64a9f01bf | CMP-d5343c72542c8bc9 | popup-table · company/directory | 상세 표 5 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-406932a64a9f01bf-COL-1 | CMP-406932a64a9f01bf | popup-table-column · company/directory | 단가 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-406932a64a9f01bf-COL-2 | CMP-406932a64a9f01bf | popup-table-column · company/directory | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20a8caa30f673d28 | CMP-d5343c72542c8bc9 | popup-table · company/directory | 상세 표 6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20a8caa30f673d28-COL-1 | CMP-20a8caa30f673d28 | popup-table-column · company/directory | 게시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20a8caa30f673d28-COL-2 | CMP-20a8caa30f673d28 | popup-table-column · company/directory | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-20a8caa30f673d28-COL-3 | CMP-20a8caa30f673d28 | popup-table-column · company/directory | 매체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-91c396fb11a3d68a | CMP-d5343c72542c8bc9 | popup-button · company/directory | 시공사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e45a796de4897df4 | CMP-d5343c72542c8bc9 | popup-button · company/directory | CM | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f571045181e26983 | CMP-d5343c72542c8bc9 | popup-button · company/directory | 엔지니어링 · 전체 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-94b091ce1c19ddfc | CMP-d5343c72542c8bc9 | popup-button · company/directory | 엔지니어링 · 건설 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a4cc441fd2dcdc4b | CMP-d5343c72542c8bc9 | popup-button · company/directory | 건설엔지니어링 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a6cb170aaf26ad5a | CMP-d5343c72542c8bc9 | popup-button · company/directory | 공사비 지표 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cb4591092c7c61f6 | CMP-d5343c72542c8bc9 | popup-button · company/directory | 업체 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-be3b74720886d64d | CMP-d5343c72542c8bc9 | popup-button · company/directory | + 업체 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-45bb30a94d7f4116 | CMP-d5343c72542c8bc9 | popup-button · company/directory | 검색 조건 초기화 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-da22b96ea81b434d | CMP-d5343c72542c8bc9 | popup-button · company/directory | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-740196e281885126 | CMP-d5343c72542c8bc9 | popup-button · company/directory | 다음 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-745996fb01257424 | CMP-d5343c72542c8bc9 | popup-button · company/directory | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5aecbe481d191e62 | CMP-d5343c72542c8bc9 | popup-button · company/directory | 단가·근거 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f3508078bc7ba935 | CMP-d5343c72542c8bc9 | popup-button · company/directory | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-17735c1af569de03 | CMP-d5343c72542c8bc9 | popup-button · company/directory | + 댓글 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-813bccfaea399c7d | SCREEN-law-recent | popup · law/recent | 법령·조례 검색 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-3b4682d7bf497fef | CMP-813bccfaea399c7d | popup-field · law/recent | 프로젝트 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-107b389d9602ca7a | CMP-813bccfaea399c7d | popup-field · law/recent | 조회 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f9c87dfd42c3b330 | CMP-813bccfaea399c7d | popup-field · law/recent | 법령·조례명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-be6e97c582bf6142 | CMP-813bccfaea399c7d | popup-button · law/recent | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7cfe24188a5f4e17 | CMP-813bccfaea399c7d | popup-button · law/recent | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1b6f10a6537c1673 | SCREEN-law-catalog | popup · law/catalog | 법령·조례 검색 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-c6337adc14bd48e2 | CMP-1b6f10a6537c1673 | popup-field · law/catalog | 프로젝트 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-299817198350f7e1 | CMP-1b6f10a6537c1673 | popup-field · law/catalog | 조회 종류 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b9c40eb752c1fdea | CMP-1b6f10a6537c1673 | popup-field · law/catalog | 법령·조례명 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-078dc0ff55cb6ab1 | CMP-1b6f10a6537c1673 | popup-button · law/catalog | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e46a752b10808277 | CMP-1b6f10a6537c1673 | popup-button · law/catalog | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6589fe125e8b6b9 | SCREEN-permit-permits | inline-panel-state · permit/permits | 인허가 일정 맵 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3 | CMP-e6589fe125e8b6b9 | popup-table · permit/permits | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-1 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | 연월 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-2 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-3 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-4 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-5 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-6 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-7 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | 건축허가 신청 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-8 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-9 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-10 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | 2025-10 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-11 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | 2025-11 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-12 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-13 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | 2026-01 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-14 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-15 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-16 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | 2026-04 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-17 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-18 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2c2a42e6468482f3-COL-19 | CMP-2c2a42e6468482f3 | popup-table-column · permit/permits | 2026-07 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5a960d90e77cd8d2 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 부지·토지계약 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-85837ff8bb4486b2 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 인허가·심의 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6d73da24f98353f2 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 착공·공사·준공 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-38e7dd67430cbeb9 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 분양·매각 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4a6b12009710b17d | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 개발업 등록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5bec8871529d2362 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 인허가 목록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca58c4eab5b1c8f3 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 인허가 일정 맵 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-88d240282f266213 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 추천 조건 입력 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-baecdc6f9b2e8baa | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 인허가 항목 선택 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1d97b261120811d5 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 이전 12개월 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3a39735929788f7d | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 다음 12개월 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-053163ce789efa45 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 현재 월 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cd41c8d517da5b34 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 첫 일정 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-26a8b88775a56c9a | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 마지막 일정 보기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fa597bfb694cd181 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 지구단위계획 결정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f4846e7973e35dc6 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bb396dae14240125 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 준공 및 사용승인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b4548694bf0bebec | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 건축허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-35e27251976748e6 | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 계획 기간 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6755ccbfac55ab3c | CMP-e6589fe125e8b6b9 | popup-button · permit/permits | 실제 기간 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ca9ebf96d002540 | SCREEN-permit-registration | popup · permit/registration | 개발업 등록정보 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-0e841b8a0e9092f9 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-06c8d6ac3196c225 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 대표자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-43b6efcc4c44bf57 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 법적 형태 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-080ec1a3def7314c | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 사업자등록번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-268e77b0ffd2de0c | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 법인등록번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0b1e96c2f40a5716 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 사무실 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c185d0135ff2ccf5 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 연락처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fa407a4ffccaa130 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 등록 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec183ee16ac7b10c | CMP-4ca9ebf96d002540 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a31d8070d85872f1 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2b0a239ee43b161a | CMP-4ca9ebf96d002540 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-91bd4be9f2201dfe | CMP-4ca9ebf96d002540 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c5960baca32a7e38 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 기관 담당자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5456881609597eb2 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 기관 담당자 연락처 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8352d17c353bb616 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 최근 변경신고 제출일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51a4efdbb98d460e | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 자본금 또는 영업용자산(원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b67e61f9bc9e0907 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 전문인력 등록 인원(수동) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-786aec1513eda85c | CMP-4ca9ebf96d002540 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-218c111e77461a53 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 자산관리회사 등 상호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-38bc8e413e72cf22 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 자산관리회사 등 소재지 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dbecc33ecc065ef7 | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 자산관리회사 등 전화번호 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-44c1374f6509baea | CMP-4ca9ebf96d002540 | popup-field · permit/registration | 업무위탁계약 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-741831fc9553750d | CMP-4ca9ebf96d002540 | popup-button · permit/registration | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f46e751fcccc0016 | CMP-4ca9ebf96d002540 | popup-button · permit/registration | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-69afeb981b7b822e | SCREEN-permit-registration | popup · permit/registration | 전문인력 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-25997e2d2d68f6b5 | CMP-69afeb981b7b822e | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8e0565b92a306d6b | CMP-69afeb981b7b822e | popup-field · permit/registration | 소속회사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e5d5028533cf49dd | CMP-69afeb981b7b822e | popup-field · permit/registration | 자격·학위 등 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0b133853b6337184 | CMP-69afeb981b7b822e | popup-field · permit/registration | 경력 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9fe4167bd3dafe3d | CMP-69afeb981b7b822e | popup-field · permit/registration | 사전교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ca94613a25b9633e | CMP-69afeb981b7b822e | popup-field · permit/registration | 최근 연수교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9df39a3e4a572592 | CMP-69afeb981b7b822e | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d45746505bde9599 | CMP-69afeb981b7b822e | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ed99f7465cf2459 | CMP-69afeb981b7b822e | popup-field · permit/registration | 재직 시작일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e4d148c16e66af78 | CMP-69afeb981b7b822e | popup-field · permit/registration | 실제 퇴사일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-60fb61a67e8c8dc1 | CMP-69afeb981b7b822e | popup-field · permit/registration | 등록명단 반영일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4798f01b6bf1c8e1 | CMP-69afeb981b7b822e | popup-field · permit/registration | 등록명단 종료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7f531f4640662aba | CMP-69afeb981b7b822e | popup-field · permit/registration | 증빙 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ad45fcc4adc6990d | CMP-69afeb981b7b822e | popup-button · permit/registration | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5ea990420b3b7adb | CMP-69afeb981b7b822e | popup-button · permit/registration | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c62129c4ec89bb85 | SCREEN-permit-registration | popup · permit/registration | 전문인력 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d9e1349539d0f8f8 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-70fbcc13c0421277 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 소속회사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d179df153b46968c | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 자격·학위 등 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f7dc6da041730874 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 경력 확인 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6f64ef6f6c04a604 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 사전교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7412ea49fdb8fac4 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 최근 연수교육 수료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-97a259f72f05563d | CMP-c62129c4ec89bb85 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7a02789b7bf88220 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e841c30c32ce2ffc | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 재직 시작일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51de7c3e998d0787 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 실제 퇴사일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-40c14800a562a43c | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 등록명단 반영일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f83bd400473ce8e7 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 등록명단 종료일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9828298f851558c6 | CMP-c62129c4ec89bb85 | popup-field · permit/registration | 증빙 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e77ffcdde6fb62a6 | CMP-c62129c4ec89bb85 | popup-button · permit/registration | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f133fae1d74c2e54 | CMP-c62129c4ec89bb85 | popup-button · permit/registration | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-655fb47007d09949 | CMP-d00ae27343807e57 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8abf6405da9f8bd6 | CMP-d00ae27343807e57 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3809d35910482b7 | CMP-d00ae27343807e57 | popup-field · permit/land | 자금구성 기준 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-73a57594a33d2ac8 | CMP-d00ae27343807e57 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e47cd98f83e94afd | CMP-d00ae27343807e57 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-caa40f2787048f2f | CMP-d00ae27343807e57 | popup-field · permit/land | 계획 지급일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9ea0e3cb79fec6c8 | CMP-d00ae27343807e57 | popup-field · permit/land | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47422c50cff5a168 | CMP-d00ae27343807e57 | popup-field · permit/land | 지급 여부 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2fabda0710d26c15 | SCREEN-permit-permits | popup · permit/permits | 인허가 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-1098c83b9da4dd9e | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e487d5ed4d420c71 | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b2bd49cfc6fe440 | CMP-2fabda0710d26c15 | popup-field · permit/permits | 국토부 보고 분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bff38d8e21e0d29a | CMP-2fabda0710d26c15 | popup-field · permit/permits | 담당기관 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f42b6ec13d170ec2 | CMP-2fabda0710d26c15 | popup-field · permit/permits | 근거법령·조문 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-43bf33e516bf6e7f | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-092d13457d51dcd1 | CMP-2fabda0710d26c15 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-dd1d9698914da1fa | CMP-2fabda0710d26c15 | popup-field · permit/permits | 계획 신청일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cade260ef2ef69f6 | CMP-2fabda0710d26c15 | popup-field · permit/permits | 목표 완료일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5e88245ef3e01be1 | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-96a864824054a462 | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7999acb80db3ac0b | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-be33911fb8634c3c | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ff484607c28d762 | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-35944b637510bcaa | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-71c2c9cde3ebed58 | CMP-2fabda0710d26c15 | popup-field · permit/permits | 이 인허가를 포함해 함께 처리하는 상위 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-98fe9db168a5efd5 | CMP-2fabda0710d26c15 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-360866d1cbc55b5c | CMP-2fabda0710d26c15 | popup-field · permit/permits | 이 인허가가 변경하는 기존 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a9c3189034c877bf | CMP-2fabda0710d26c15 | popup-field · permit/permits | precede-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-07ff1670bdf4ab08 | CMP-2fabda0710d26c15 | popup-field · permit/permits | precede-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cce28e994f04b6ce | CMP-2fabda0710d26c15 | popup-field · permit/permits | precede-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-581cd48e4f48203d | CMP-2fabda0710d26c15 | popup-field · permit/permits | precede-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c0dc8b01f3a8e4b4 | CMP-2fabda0710d26c15 | popup-field · permit/permits | precede-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8aad48ea8380e3a2 | CMP-2fabda0710d26c15 | popup-field · permit/permits | precede-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4cf9f06a5fd84c1a | CMP-2fabda0710d26c15 | popup-field · permit/permits | integrate-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c5acbc492a0d2a4e | CMP-2fabda0710d26c15 | popup-field · permit/permits | integrate-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ac3d29d2a03f8735 | CMP-2fabda0710d26c15 | popup-field · permit/permits | integrate-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-163f8fb0b2f1db98 | CMP-2fabda0710d26c15 | popup-field · permit/permits | integrate-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8563dd1550c2cbe6 | CMP-2fabda0710d26c15 | popup-field · permit/permits | integrate-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-36ce9ee7f7769ef2 | CMP-2fabda0710d26c15 | popup-field · permit/permits | integrate-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-127cc8f42fba24b0 | CMP-2fabda0710d26c15 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ed1275c905111b1 | CMP-2fabda0710d26c15 | popup-button · permit/permits | + 검토의견 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e636c9ce2082d1fb | CMP-2fabda0710d26c15 | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3f885e5a1ac217e7 | SCREEN-permit-sales | popup · permit/sales | 분양·매각 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-59aaa867b6d56cac | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3044099cd89f4776 | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | 집계 단위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6553fe66794346a8 | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | 전체 수량 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57b77d7af5980eaa | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | 매각 계획 수량 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-962ea03d88ed0055 | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | 매각 완료 수량 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-157838c194908f20 | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | 매각·분양 개시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-aea9a149f2b4757e | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | 누적 매각금액(원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-71baa81285cdaa29 | CMP-3f885e5a1ac217e7 | popup-field · permit/sales | 근거 공용폴더 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2cd4c694b63060e8 | CMP-3f885e5a1ac217e7 | popup-button · permit/sales | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c6319a101cc0253f | CMP-3f885e5a1ac217e7 | popup-button · permit/sales | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3f4eb21d6b2b9de5 | SCREEN-permit-sales | popup · permit/sales | 분양·매각 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-fe15a18ce520cac5 | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-66e204c4ee3ac82d | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | 집계 단위 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b6289299744082e5 | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | 전체 수량 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6213d4492fc995ed | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | 매각 계획 수량 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-13fc702600df0984 | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | 매각 완료 수량 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-370a5175ef4fe9b1 | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | 매각·분양 개시일 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d50dcbb02d73e4a0 | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | 누적 매각금액(원) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5777ceb125ce77c2 | CMP-3f4eb21d6b2b9de5 | popup-field · permit/sales | 근거 공용폴더 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-582682c2cb5fff08 | CMP-3f4eb21d6b2b9de5 | popup-button · permit/sales | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-79862369b80c486a | CMP-3f4eb21d6b2b9de5 | popup-button · permit/sales | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-51926be3e053875d | SCREEN-company-market | popup · company/market | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-a03ebfbf38a2ba25 | CMP-51926be3e053875d | popup-table · company/market | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a03ebfbf38a2ba25-COL-1 | CMP-a03ebfbf38a2ba25 | popup-table-column · company/market | 기준월 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a03ebfbf38a2ba25-COL-2 | CMP-a03ebfbf38a2ba25 | popup-table-column · company/market | 관측값 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a03ebfbf38a2ba25-COL-3 | CMP-a03ebfbf38a2ba25 | popup-table-column · company/market | 근거 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-329dd0b1a435e19a | CMP-51926be3e053875d | popup-button · company/market | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-239b531d6a2674b3 | SCREEN-permit-permits | popup · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-0457112832ecc6e4 | CMP-239b531d6a2674b3 | popup-table · permit/permits | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0457112832ecc6e4-COL-1 | CMP-0457112832ecc6e4 | popup-table-column · permit/permits | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0457112832ecc6e4-COL-2 | CMP-0457112832ecc6e4 | popup-table-column · permit/permits | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95886bcfd51ce810 | CMP-239b531d6a2674b3 | popup-table · permit/permits | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95886bcfd51ce810-COL-1 | CMP-95886bcfd51ce810 | popup-table-column · permit/permits | 관계 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-95886bcfd51ce810-COL-2 | CMP-95886bcfd51ce810 | popup-table-column · permit/permits | 연결 대상 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f8e0b6a2dd57f5bb | CMP-239b531d6a2674b3 | popup-table · permit/permits | 상세 표 3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f8e0b6a2dd57f5bb-COL-1 | CMP-f8e0b6a2dd57f5bb | popup-table-column · permit/permits | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f8e0b6a2dd57f5bb-COL-2 | CMP-f8e0b6a2dd57f5bb | popup-table-column · permit/permits | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64345e99adf1fe19 | CMP-239b531d6a2674b3 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-331c8eb3695aa6d0 | CMP-239b531d6a2674b3 | popup-button · permit/permits | 관련 법령 조회 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-30c54a7d60ea68d4 | CMP-239b531d6a2674b3 | popup-button · permit/permits | 신청·보완·심의 기록 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f223900a7cbfedf6 | CMP-239b531d6a2674b3 | popup-button · permit/permits | 조치계획 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4c14585f3638f94c | CMP-239b531d6a2674b3 | popup-button · permit/permits | 인허가 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eb07b113f6fb9193 | CMP-239b531d6a2674b3 | popup-button · permit/permits | 변경 인허가 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-40776dbf5ae0163e | CMP-239b531d6a2674b3 | popup-button · permit/permits | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0695792cf3c2b6e1 | SCREEN-permit-permits | popup · permit/permits | 인허가 수정 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-7b06f323fb7c915a | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ef80cac211128d7 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-98b1026fadba58a0 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 국토부 보고 분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f4bbd8f80bec13be | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 담당기관 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f446a39d03d0549f | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 근거법령·조문 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-adc957f9bfb8ec48 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b5b2ed570f3b32a5 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-434991ba5999b186 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 계획 신청일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-521724e6d25efdc0 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 목표 완료일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ff7c43a8d1bad675 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4037d2c240462fc5 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-903fe69fd0b7bfc3 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21f76e3fda5f1918 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6772aca31d8dc8c5 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-37fcd2451d5d459c | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8571536294468411 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bff37952530af9f4 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a452981a5cd34011 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a427907b3714808f | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3a79c5de12bd1367 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-91a339786d56a017 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9226f0fe248a4529 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ea71792d78ddeb8 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c1c48b9150caf7e | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c5b59a1a21057b24 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f204c246c98b4b15 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5f75058e803a17bb | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d757d3c4f19237d6 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3e48a258e22b46a7 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3e374d5de2f0433d | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 이 인허가를 포함해 함께 처리하는 상위 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ebd10dfdde9aafd6 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9649689cf643f2f6 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | 이 인허가가 변경하는 기존 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f15f310ab903c230 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | precede-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2af1ccd59bcc1c1b | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | precede-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0068e0865296aaab | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | precede-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-59e85c6a477ad92f | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | precede-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ba1a93a3450c2905 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | precede-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f745507a9e77cb01 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | integrate-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5035516d5f1a3f50 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | integrate-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-911416a2b31c6cef | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | integrate-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-250db79ee419aafc | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | integrate-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f871bbff041c03c8 | CMP-0695792cf3c2b6e1 | popup-field · permit/permits | integrate-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-674b5682a6083fbb | CMP-0695792cf3c2b6e1 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5f2e1b0ecac0d148 | CMP-0695792cf3c2b6e1 | popup-button · permit/permits | 검토의견 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e6f573199c83bfbe | CMP-0695792cf3c2b6e1 | popup-button · permit/permits | 조치계획 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e838a0a934ce04e0 | CMP-0695792cf3c2b6e1 | popup-button · permit/permits | + 조치계획 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-07dbafd7245828ef | CMP-0695792cf3c2b6e1 | popup-button · permit/permits | + 검토의견 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4ca5e3cae6c2a05c | CMP-0695792cf3c2b6e1 | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ec87cc6ee3f8eff7 | SCREEN-permit-permits | popup · permit/permits | 변경허가 추가 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-44de7a3183c8bf9d | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3152aff5642e9ea5 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6ce2b238560d37d0 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 국토부 보고 분류 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3263ed60050735bb | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 담당기관 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9dcdba2e6f427ff6 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 근거법령·조문 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-237efeae211c8da5 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-345879dabbdc8c8e | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d3eb064540819d0 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 계획 신청일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-495d691de1f880e9 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 목표 완료일 * | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f324ea1e63899551 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0087dc71a00d5f48 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e3c2a3903271ce8a | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-332feaedd279c1a6 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-47f992253f9273d3 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-07f718f46de83559 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ccf2ee8b456b82dd | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-99b811d0395286a7 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9784f6669715c7e0 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c11beeb66a2eb599 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-caa3720591fede73 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f0f45b393c7253d2 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9c7ce78fa098a19b | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-21928975be747a68 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-114dfcad670c3194 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 담당자 (선택) | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0b338c841bafc726 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5c4a53a33659da54 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-734e4c5edf84ebbb | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-233ce7e7702896a2 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-32d35948655e7ba6 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c6ad679125c7a981 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 이 인허가를 포함해 함께 처리하는 상위 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fd7809991ed4ff40 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-06a3809163e4252e | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | 이 인허가가 변경하는 기존 인허가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ab1b49ac19f8fd2a | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | precede-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-df61c3b109982308 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | precede-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0202707289b2f26a | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | precede-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-02ee554b7d5ae45a | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | precede-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ee2008b60ff63366 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | precede-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1d76139e7007805b | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | precede-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3b7ce919b2395293 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | integrate-992gwt12 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-eab3b1f8dafd8319 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | integrate-hyzd24al | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f17311d92e3116c4 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | integrate-yqg89e4u | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-635a53f5b7a87281 | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | integrate-qebwmth0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-720c0619aa831fbd | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | integrate-ykdj70z6 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-14a8ed5f285ef8ca | CMP-ec87cc6ee3f8eff7 | popup-field · permit/permits | integrate-SAMPLE-PERMIT-20261021-A-BUILDING | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d6c8953c670feaaf | CMP-ec87cc6ee3f8eff7 | popup-button · permit/permits | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5e8c052312a6da0b | CMP-ec87cc6ee3f8eff7 | popup-button · permit/permits | 검토의견 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0cdefc0a5213dad2 | CMP-ec87cc6ee3f8eff7 | popup-button · permit/permits | 조치계획 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4fc401159f6d40d5 | CMP-ec87cc6ee3f8eff7 | popup-button · permit/permits | + 조치계획 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c143b908558b4674 | CMP-ec87cc6ee3f8eff7 | popup-button · permit/permits | + 검토의견 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-098442f42c158b57 | CMP-ec87cc6ee3f8eff7 | popup-button · permit/permits | 취소 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ae4e19650bc1a467 | SCREEN-document | inline-panel-state · document/ | 계약·문서 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-4fdcf65a7383ed1d | CMP-ae4e19650bc1a467 | popup-field · document/ | 계약·문서 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-58aebcfde239a700 | CMP-ae4e19650bc1a467 | popup-field · document/ | 계약·문서 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21 | CMP-ae4e19650bc1a467 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21-COL-1 | CMP-1ac76efb4e1daf21 | popup-table-column · document/ | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21-COL-2 | CMP-1ac76efb4e1daf21 | popup-table-column · document/ | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21-COL-3 | CMP-1ac76efb4e1daf21 | popup-table-column · document/ | 상대방·발신/수신 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21-COL-4 | CMP-1ac76efb4e1daf21 | popup-table-column · document/ | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21-COL-5 | CMP-1ac76efb4e1daf21 | popup-table-column · document/ | 계약금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21-COL-6 | CMP-1ac76efb4e1daf21 | popup-table-column · document/ | 원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1ac76efb4e1daf21-COL-7 | CMP-1ac76efb4e1daf21 | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64582d1256ef3ed4 | CMP-ae4e19650bc1a467 | popup-table · document/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64582d1256ef3ed4-COL-1 | CMP-64582d1256ef3ed4 | popup-table-column · document/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64582d1256ef3ed4-COL-2 | CMP-64582d1256ef3ed4 | popup-table-column · document/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d205c989ebecda3 | CMP-ae4e19650bc1a467 | popup-button · document/ | 입력자료 확인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-bc113ae04156c9e7 | CMP-ae4e19650bc1a467 | popup-button · document/ | + 계약 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7ec04a5183189b8f | CMP-ae4e19650bc1a467 | popup-button · document/ | + 문서 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d2256924fa75b8ee | CMP-ae4e19650bc1a467 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-62c6e4e087f445f9 | CMP-ae4e19650bc1a467 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d29ef851d4a475a1 | CMP-ae4e19650bc1a467 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7ec11cd0263cbee0 | CMP-ae4e19650bc1a467 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-23b899ba058178cb | CMP-ae4e19650bc1a467 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e99558d7c190b66b | CMP-ae4e19650bc1a467 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0737bfef097d1f70 | CMP-ae4e19650bc1a467 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-060bfccd01f1f968 | CMP-ae4e19650bc1a467 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0b674bdeb0e9d947 | CMP-ae4e19650bc1a467 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a5e045ebd0a52bad | CMP-ae4e19650bc1a467 | popup-button · document/ | v1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c1ae9c234758ede0 | CMP-ae4e19650bc1a467 | popup-button · document/ | 원본 경로 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-54a5eaa22a6fe578 | CMP-ae4e19650bc1a467 | popup-button · document/ | 문서 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c3184129c91d1f72 | CMP-ae4e19650bc1a467 | popup-button · document/ | 새 버전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8ef64a3fccff095c | SCREEN-document | inline-panel-state · document/ | 계약·문서 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-63316c49d0c57ac5 | CMP-8ef64a3fccff095c | popup-field · document/ | 계약·문서 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8108843ab670c53b | CMP-8ef64a3fccff095c | popup-field · document/ | 계약·문서 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992 | CMP-8ef64a3fccff095c | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992-COL-1 | CMP-9af681bf3c5fc992 | popup-table-column · document/ | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992-COL-2 | CMP-9af681bf3c5fc992 | popup-table-column · document/ | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992-COL-3 | CMP-9af681bf3c5fc992 | popup-table-column · document/ | 상대방·발신/수신 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992-COL-4 | CMP-9af681bf3c5fc992 | popup-table-column · document/ | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992-COL-5 | CMP-9af681bf3c5fc992 | popup-table-column · document/ | 계약금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992-COL-6 | CMP-9af681bf3c5fc992 | popup-table-column · document/ | 원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9af681bf3c5fc992-COL-7 | CMP-9af681bf3c5fc992 | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b01f017c6b730edf | CMP-8ef64a3fccff095c | popup-table · document/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b01f017c6b730edf-COL-1 | CMP-b01f017c6b730edf | popup-table-column · document/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b01f017c6b730edf-COL-2 | CMP-b01f017c6b730edf | popup-table-column · document/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-017a53b2c95470d2 | CMP-8ef64a3fccff095c | popup-button · document/ | 입력자료 확인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-908df082ee4f14ee | CMP-8ef64a3fccff095c | popup-button · document/ | + 계약 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e4bf4a04916731dc | CMP-8ef64a3fccff095c | popup-button · document/ | + 문서 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-befa64ae1d0ef474 | CMP-8ef64a3fccff095c | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-5b9a0cc3d2305c5a | CMP-8ef64a3fccff095c | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0ad2c53052269ae7 | CMP-8ef64a3fccff095c | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0fd6113bec670102 | CMP-8ef64a3fccff095c | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-00da9392d2d6ce18 | CMP-8ef64a3fccff095c | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b181dc2947f89bdc | CMP-8ef64a3fccff095c | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-11c81818e43137e3 | CMP-8ef64a3fccff095c | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-364d91f55189d676 | CMP-8ef64a3fccff095c | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-90bce5ec744272c3 | CMP-8ef64a3fccff095c | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8d94c121748a8cbb | CMP-8ef64a3fccff095c | popup-button · document/ | v1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-d333604381461428 | CMP-8ef64a3fccff095c | popup-button · document/ | v0 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-92aa85cb8ba18e34 | CMP-8ef64a3fccff095c | popup-button · document/ | 원본 경로 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6df2ff6a7a27c525 | CMP-8ef64a3fccff095c | popup-button · document/ | 문서 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-490c5c307a366ed7 | CMP-8ef64a3fccff095c | popup-button · document/ | 새 버전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c31ff4a34e511e40 | SCREEN-document | inline-panel-state · document/ | 계약·문서 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-0080aad7ebc714bf | CMP-c31ff4a34e511e40 | popup-field · document/ | 계약·문서 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b758bff0838a3037 | CMP-c31ff4a34e511e40 | popup-field · document/ | 계약·문서 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae | CMP-c31ff4a34e511e40 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae-COL-1 | CMP-3aed003fa05304ae | popup-table-column · document/ | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae-COL-2 | CMP-3aed003fa05304ae | popup-table-column · document/ | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae-COL-3 | CMP-3aed003fa05304ae | popup-table-column · document/ | 상대방·발신/수신 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae-COL-4 | CMP-3aed003fa05304ae | popup-table-column · document/ | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae-COL-5 | CMP-3aed003fa05304ae | popup-table-column · document/ | 계약금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae-COL-6 | CMP-3aed003fa05304ae | popup-table-column · document/ | 원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-3aed003fa05304ae-COL-7 | CMP-3aed003fa05304ae | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce22fd8ebcc3f6dc | CMP-c31ff4a34e511e40 | popup-table · document/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce22fd8ebcc3f6dc-COL-1 | CMP-ce22fd8ebcc3f6dc | popup-table-column · document/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce22fd8ebcc3f6dc-COL-2 | CMP-ce22fd8ebcc3f6dc | popup-table-column · document/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-197d173a8b03f2a8 | CMP-c31ff4a34e511e40 | popup-button · document/ | 입력자료 확인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1d71309c6e418ab3 | CMP-c31ff4a34e511e40 | popup-button · document/ | + 계약 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c16728b28ffdb7d9 | CMP-c31ff4a34e511e40 | popup-button · document/ | + 문서 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-692eeccce2eb887b | CMP-c31ff4a34e511e40 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2df218e6bc840f33 | CMP-c31ff4a34e511e40 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-64650fdf09ea8b73 | CMP-c31ff4a34e511e40 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-9b311d158f299b6a | CMP-c31ff4a34e511e40 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-241bf5903bdaf33b | CMP-c31ff4a34e511e40 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ab6e69716aafb55a | CMP-c31ff4a34e511e40 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2edd7d1c445734c0 | CMP-c31ff4a34e511e40 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c9fcdf6de059b6e5 | CMP-c31ff4a34e511e40 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-1024b049393bf848 | CMP-c31ff4a34e511e40 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2684afc27d301cbc | CMP-c31ff4a34e511e40 | popup-button · document/ | v3 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-663d484b2509b0db | CMP-c31ff4a34e511e40 | popup-button · document/ | v2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b67cc407c8add426 | CMP-c31ff4a34e511e40 | popup-button · document/ | 원본 경로 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-7e8d1e650eca9369 | CMP-c31ff4a34e511e40 | popup-button · document/ | 문서 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-676757886336cef8 | CMP-c31ff4a34e511e40 | popup-button · document/ | 새 버전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6829efb290ac5e74 | SCREEN-document | inline-panel-state · document/ | 계약·문서 | source-content-reviewed-not-business-sufficiency-acceptance / notrun | notrun / notrun / notrun / notrun |
| CMP-d3db910bbbe5271a | CMP-6829efb290ac5e74 | popup-field · document/ | 계약·문서 검색 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ce2569657588a70b | CMP-6829efb290ac5e74 | popup-field · document/ | 계약·문서 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec | CMP-6829efb290ac5e74 | popup-table · document/ | 상세 표 1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec-COL-1 | CMP-4095e439af2654ec | popup-table-column · document/ | 구분 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec-COL-2 | CMP-4095e439af2654ec | popup-table-column · document/ | 제목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec-COL-3 | CMP-4095e439af2654ec | popup-table-column · document/ | 상대방·발신/수신 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec-COL-4 | CMP-4095e439af2654ec | popup-table-column · document/ | 일자 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec-COL-5 | CMP-4095e439af2654ec | popup-table-column · document/ | 계약금액 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec-COL-6 | CMP-4095e439af2654ec | popup-table-column · document/ | 원본 경로 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-4095e439af2654ec-COL-7 | CMP-4095e439af2654ec | popup-table-column · document/ | 제목 없는 동작 열 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0f2d63853cd96e65 | CMP-6829efb290ac5e74 | popup-table · document/ | 상세 표 2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0f2d63853cd96e65-COL-1 | CMP-0f2d63853cd96e65 | popup-table-column · document/ | 항목 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-0f2d63853cd96e65-COL-2 | CMP-0f2d63853cd96e65 | popup-table-column · document/ | 내용 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-89dd11ed363b6d19 | CMP-6829efb290ac5e74 | popup-button · document/ | 입력자료 확인 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-ef3effac7134c0fa | CMP-6829efb290ac5e74 | popup-button · document/ | + 계약 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-a32b0d34eb959c9a | CMP-6829efb290ac5e74 | popup-button · document/ | + 문서 추가 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-c09af55046b4e0f1 | CMP-6829efb290ac5e74 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-fa11fb779dbbbbc2 | CMP-6829efb290ac5e74 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-115c7a4daf4d6f2f | CMP-6829efb290ac5e74 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e741aa16f805eaa3 | CMP-6829efb290ac5e74 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-23e56e14bd941e1e | CMP-6829efb290ac5e74 | popup-button · document/ | [동적 업무값 — 원문 비게시] | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-cbe1f13c547b4115 | CMP-6829efb290ac5e74 | popup-button · document/ | 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-6d0f33d6391f8884 | CMP-6829efb290ac5e74 | popup-button · document/ | 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-637f7e97b00d4f4f | CMP-6829efb290ac5e74 | popup-button · document/ | 삭제 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-8c12799dc3c25873 | CMP-6829efb290ac5e74 | popup-button · document/ | 닫기 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-2ca99a2c2c1aac4f | CMP-6829efb290ac5e74 | popup-button · document/ | v2 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-57f2564b2030dc62 | CMP-6829efb290ac5e74 | popup-button · document/ | v1 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-e4460f1a3128a552 | CMP-6829efb290ac5e74 | popup-button · document/ | 원본 경로 복사 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-b6ddd4988a924b1b | CMP-6829efb290ac5e74 | popup-button · document/ | 문서 수정 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| CMP-f50c46faf331869d | CMP-6829efb290ac5e74 | popup-button · document/ | 새 버전 | source-content-reviewed-within-declared-scope / notrun | notrun / notrun / notrun / notrun |
| FINANCE-ALLIN-SUMMARY | SCREEN-finance-loans | business-value-counterexample · finance/loans | 가중평균 All-in 금리 · 미입력/명시0·포함기준 | source-content-reviewed-within-declared-scope / notrun | fail / fail / notrun / notrun |

## 갱신·검증 규칙

- 화면 → 표/열 → 버튼/필드 → 자식 팝업 → 저장/취소/실패 → 이력/출력의 실제 경로와 정책 근거를 같은 ID에 연결합니다.

- 소스에서 발견한 호출/등록은 `popupCandidates`, `fieldCandidates`, `discovery`로 분리했습니다. 미실행이나 검색 부재를 폐기·불필요·완료로 단정하지 않습니다.

- 원금액/과거 확정/계약/VAT/직원 자료를 바꾸지 않습니다. 불분명한 중요한 기준은 질문 또는 공식 원문 확인 전 새 기능·정책으로 만들지 않습니다.

- 기존 76개 미체크를 이번 42개 검사로 덮지 않습니다. 체크리스트와 컴포넌트/상태 분모는 다른 자료입니다.

- 생성: `.build/continuation-20261023/ui-build-component-matrix.mjs --write`, 검증: 같은 스크립트 `--verify`. 수기 검토는 JSON `manualReviews`에 근거·버전·범위를 기록해 다음 생성에도 보존합니다.

상세 행·현재 소스/HTML 지문·실제 증거와 미확인 후보는 [JSON 매트릭스](component-review-matrix.json)에 있습니다.
