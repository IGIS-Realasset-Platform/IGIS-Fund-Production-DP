# REVIEW132 입력·수정 단위 및 인허가 목록 대조

정식 C93의 승인된 저장 단위를 기준으로, 확인된 예외만 교정합니다. 전 셀을 기계적으로 바꾸지 않고 함께 검증·저장하는 기록/구역은 한 폼, 독립 사업비 금액·사유는 한 행, 보고서 작성본은 기존 수정모드를 유지합니다. 기존 입력항목·원금액·미입력/0·취소/실패 초안·과거 원본·다른 사업을 보존합니다.

## 인허가 목록

교통영향평가는 원 검토표와 legal.js의 영향평가 그룹 세 번째 `permit-catalog-3-2`로 존재하며 정식 유형 `company-permit:permit-catalog-3-2`가 같은 행에 연결됩니다. 조건 미확인은 추천대상으로 확정하지 않으므로 추천 필터에서는 숨기고 전체항목에서 선택합니다. 해당 지역과 대상사업·용도·규모가 모두 예이면 기존 행을 추천합니다. 이미 등록된 유형은 후보에서 제외하며 사용자가 저장한 본표명을 재작성하지 않습니다.

검색어가 이미 등록된 유형에만 일치하여 가용 결과가 없으면 기존 빈결과 표현으로 **이미 등록된 인허가입니다.**, 진짜 미일치는 **검색 결과가 없습니다.**를 표시합니다. 기존 등록행을 선택팝업에 다시 노출하거나 중복 생성하지 않습니다. 검색으로 안 보이는 다른 선택항목의 실제 선택수도 유지합니다.

분류는 처음에 모두 접습니다. 검색의 일시 펼침과 검색해제, 사용자가 펼친 상태·조건보기 왕복·선택 입력은 보존합니다. 현재 검사에서 기본접힘2실패 및 구역수정 경로 부재1건을 재현 후 교정했습니다.

## 업무별 입력 진입

| ID | 업무 | 저장 단위 | 진입 | 확인 범위 |
|---|---|---|---|---|
| EDIT132-OVERVIEW | 사업개요 | 24필드 구역폼 | overview-basic-edit | current-record-scope/read only |
| EDIT132-COST | 독립 현재 사업비 | 금액1·사유/이력 | cbsCurrent/cbsBreakdownCurrent/cbsCompanyCurrent/cbsCompanySourceCurrent | preserve independent monetary save; no blanket group editor |
| EDIT132-AREA | 사업비표 면적 | 현재면적2조회행→기존7숫자+날짜/상태/근거 폼1개 | area-edit | implemented single action; calculations/areaForm unchanged; native pending |
| EDIT132-FINANCE | 대출/출자/담보/보증/보증기관 | 기존 기록폼 | loan-edit/financial-other-edit | current record-scope; root owns further changes |
| EDIT132-DOCUMENT | 계약/문서 | 기존 기록폼 | contract-edit/document-edit | current record-scope; source observation |
| EDIT132-LAND | 부지확보 | 기존11필드 구역폼1개 | land-input-open/openLandEditor | implemented + focused model verified; native pending |
| EDIT132-LEGAL-RECORDS | 필지/토지계약/지급회차/인허가/분양 | 기존 기록폼 | legal-edit | current record-scope; keep existing form and detail4tabs |
| EDIT132-CONSTRUCTION | 착공·공사·준공 | 기재33필드 일괄폼 + 독립 공정기록 | construction-input-open/construction-section-edit/progress-record-add/edit | existing report-unit form; no field/type/count change |
| EDIT132-ISSUE | 주요현안 | 5필드 기존기록폼 | issue-edit | current record-scope |
| EDIT132-MILESTONE | 일정 | 일정기록폼 | milestone-add/edit/timeline-add/edit | separate event/plan records; source audit pending |
| EDIT132-BENCHMARK | 유사사업 | 14필드 기록폼 | benchmark-edit | current record-scope |
| EDIT132-COMPANY | 업체/메모/영업라인/참여 | 각 기존기록폼 | partner-company-edit/partner-note-edit/partner-line-edit/participation | source forms exist; counts not all dynamic paths |
| EDIT132-REPORT | 국토부 보고서 | 보고서 작성본/수정모드의 원서식 셀 | report-edit + reportCell | preserve separate draft/reflect/archive boundary; not owned |
| EDIT132-REGISTRATION | 개발업/전문인력 | 기존 등록·기록폼 | registration/professional forms | source audit; no guessed qualification policy |
| EDIT132-SETUP | 신규프로젝트/입력자료 | 기본7개 + 공통자료/별도입력검토 | project-add/setup-add/setup-review-all | read only/root assignment; actualAi false |

부지확보는 기존11필드를 같은 구역폼으로 묶었고 날짜2·숫자1·예/아니오2·텍스트6의 기존 정의를 유지합니다. 미변경 비일자/비표준 원문·null/0은 그대로이며 새 입력만 원정의로 검증합니다. 입력 없는 새 사업·무수정 저장은 빈 원장/감사기록을 만들지 않습니다. 사업/자료/권한이 바뀌면 입력을 남기고 저장 전에 차단합니다.

사업비표 면적은 실제2조회행에서 제목2개+셀2개의 반복 진입을 **면적 수정**1개로 정리했습니다. 기존 areaForm의7숫자+기준일/상태/근거10입력·면적버전·과거시점·원가/평당가 계산은 변경하지 않았습니다. 독립 사업비 금액의 원셀 수정과 변경사유는 그대로입니다.

전체 src40파일에서 A.editable 직접 호출13위치/6파일과 A.form 호출 84위치를 같은 이름 JSON에 기록했습니다. 직접 호출·반복 필드·실제 동적 버튼·고유 업무 수는 다른 분모입니다. 이 인벤토리를 전체 동적 검수 통과로 쓰지 않습니다. 개별 인허가 상세4탭·개요/현안/유사사업·등록의 기존 화면도 재설계하지 않았습니다.

## 신규 프로젝트 이후 입력 지도(읽기 조사만)

- 프로젝트 등록은 코드/유형과 기본7값, 공통 입력자료를 받습니다. 중앙환경에서는 별도의 프로젝트 생성 권한이 필요합니다.
- 검증→프로젝트 생성→초기화/개발업 입력/용도 사업비 프리셋/감사를 한 거래로 처리하고 개요로 이동합니다. 이후 개요24·사업비/계약/대출·인허가·부지/공사·분양·보고서 원장으로 입력합니다.
- 입력자료 추가/미확인 검토는 후보와 판단 이력을 따로 보관합니다. 후보 확인만으로 기존 사업 값을 자동 덮어쓰지 않습니다.
- setup.js는 actualAi:false이며 실제 AI 파일 파싱/업로드 자동입력이 구현됐다는 근거가 없습니다. 이 조사는 등록을 실행하거나 새 AI 기능을 추가한 것이 아닙니다.

## 검증 경계

신규21검사와 인접16묶음이 현재 소스로 통과했고 추적소스 변경0입니다. 기존 저장 자료와0/null·비일자/공백 원문·전체필드·감사1회·무수정/빈값·무효입력·저장실패/원복·다른사업/삭제/중복ID/자료교체·실제 클라우드 역할 계약을 모형으로 검사했습니다. 면적/원가 및 기존 입력흐름 회귀도 포함합니다.

역할 검사는 실제 APP_RUNTIME/cloud 어댑터 계약을 사용했으나 HTTP/운영 DB의 수락을 대신하지 않습니다. 실제 브라우저/저장/재접속과 최종 정확 HTML은 root가 별도 확인해야 합니다. 이 담당자의 브라우저 기동·운영 DB 쓰기·실제 네트워크는0입니다. 기존 C93의 부지 셀11 기대는 이번 승인된 구역폼 결정으로 명시 대체해야 하며, 원값/실패 단언은 유지합니다.

## 2026-10-30 재개 검수

현재 소스의 `review132-permit-editing`21개와 공통 수정버튼18개, 인접 기록수정29개를 다시 실행해 통과했습니다. `review131-permit-intake`의 기존23개 중22개가 통과했고, 남은1개는 부지11셀 각각수정 기대가 승인된 부지11필드 구역폼1개 결정과 충돌한 구형검사입니다. 이 결과를 제품 저장결함이나 전체 회귀통과로 바꾸어 기록하지 않습니다.

정확 HTML `d58bd27d8800e57ed467b51d90bb589b4b078faf9bb3bbdf3e94a303ebf889a2`를 새 sandboxed Edge에 주입했습니다. 1280×800·1440×900·1600×1000·390×844에서 편집자/조회자8흐름을 실행했습니다. 모든 HTTP는 합성응답으로 가로채고 실제 계정·원본쿠키·운영DB를 사용하지 않았습니다. 결과는 `.build/review132-client/ui-permit-add-stable/evidence.json`의1280 두흐름과 `ui-permit-add-other-widths/evidence.json`의나머지6흐름입니다.

- 부지11입력의 이름/자료형·Tab초점·가로/세로 도달, 무변경취소, 같은폼 저장→합성PUT→재접속,503실패의 원장/입력보존을 확인했습니다.
- 새 인허가 선택의 전체분류 접힘·기등록 교통검색 안내·검색해제/사용자펼침 복원·새진입 초기화를 확인했습니다.
- 교통영향평가가 없는 별도 합성사업에서 전체목록 선택→기존5입력→정확1건 추가→합성PUT→재접속→기등록 후보제외를 확인했습니다. 조회자에게 추가/수정 도구가 없는 것도 확인했습니다.
- 준비 실패3건(존재하지 않는 snapshot.error 속성,검색입력과 후보행의 같은 data속성 선택,선택해제 중 변동하는 nth참조)은 실제 UI 결함과 구분해 원결과를 남겼고, 각각 실제 오류표시/접근성 이름/고정된 input name으로 교정했습니다.

이 검수는 위 정확 HTML의 실제 격리 UI 동작에 한정합니다. 후속 통합본이나 실제 서버·정식 저장의 완료로 승계하지 않습니다. 반복실행 소스는 `tests/review132-ui-permit-browser.mjs`입니다.

## 2026-10-30 신규 등록 v2 실제 검수

후속 신규 등록은 기존 입력항목에 펀드 정식명·파이낸스 구조와 `orgdb.employee_profiles`의 담당자 선택을 연결한 `development-overview-v2` 프로필입니다. 앞의 기본7값·등록 지도는 이전 조사 시점의 기록이며 현재 양식의 전체항목 정의가 아닙니다. 현재 사용자 진입은15입력(코드/유형/사업명/소재지/시행법인/직원선택/면적3/펀드명/조달구조/공통자료4)입니다. 별도 AI 파일해석 기능은 이 변경에 포함하지 않았습니다.

실제 검수 중 비동기 직원목록을 선택한 뒤 필수값 검증오류로 폼이 다시 그려지면 직원ID가 빈값으로 사라지는 제품 반례를 발견했습니다. `.build/review132-client/registration-identity-red/evidence.json`은 당시 정확 HTML `43ca436cae65dbfb9c55c6a54a2192c24ad848ecb4c8e7ea92478176198e47fd`의 실패입니다. 루트 담당이 등록/사업개요의 직원선택 재구성을 보완했으며 같은 기대값을 유지했습니다. 이와 별개로 접힌 사업개요를 열지 않은 검사 준비 실패는 제품 실패와 구별했습니다.

현재 HTML `3730c0719d40c938132e80ec0c081856d010a82de175143925195d43c18934d3`의1280×800·1440×900·1600×1000·390×844 네흐름이 통과했습니다. `registration-overview-open/evidence.json`의1280 한흐름과 `registration-other-widths/evidence.json`의나머지3흐름입니다(모두 `.build/review132-client/` 아래). 실제 브라우저·모든HTTP합성응답·원본쿠키/운영DB쓰기0을 유지했습니다.

- 프로젝트0개 상태의 등록 진입·15입력 자료형·초점/스크롤 도달, 직원원천503의 명시안내·재조회, 동명이인의 다른이메일·이메일없는직원 직접선택을 확인했습니다.
- 필수 펀드명/파이낸스 구조 누락 차단과 기존 직원ID 보존, 초안저장→재접속→등록 이어하기, 등록503의 입력/프로젝트0 보존·재시도를 확인했습니다.
- 정상확정→합성PUT→재접속에서 v2프로필·펀드 정식명·파이낸스 구조·직원ID/이름/email:null·연면적0/대지1000.25/취득900을 원JSON과 비교했습니다. 등록후 개요조회·동명이인 다른ID 선택·펀드명수정·감사이력·미저장취소도 확인했습니다.

현재 setup 지문은 `6956259eeb1e5f7c372adaf42827cfa7816b6704da58625d68ab7f3de39fdf77`, recovery-views는 `c83d2adad5db9a75012d0b33e35b92ede2a5246c5872086eaf2be021279d9ad8`입니다. 실제 회사 원천과 정식DB의 연결·최종배포는 루트의 별도 증거가 필요합니다. 담당자 새로고침 버튼이 기존2열의 별도 칸을 차지하는 배치는 별도 좁은 보완 제안으로 남겼으며 기능검사 통과로 미리 수락하지 않았습니다.

## 마지막 실제 검수본 — 입력이름·담당자 칸 보완 후

위3730c071과 그 이전 결과는 각 당시 검수로 보존합니다. 현재 통합 실제검수는 HTML `aca5540b9b8002b49b92d4fc095036494e3241e7d1a653f4312a4884062262da`·6,929,857B입니다. `final-names-registration-four-widths/evidence.json`4흐름과 `final-names-permit-four-widths/evidence.json`8흐름이 모두 통과했고 pageerror는0입니다. 두 파일은 `.build/review132-client/` 아래에 있으며 모두같은HTML입니다. 각 실행기는 주입HTML에 현행 소스가 실제포함됐는지 먼저 검사합니다.

담당자 입력+새로고침 버튼을 한 grid칸으로 보완한 뒤에도 source503·검증오류의 문구가 입력이름에 포함되는 반례가 남았습니다. `registration-label-red-current/evidence.json`은 당시22c4106b HTML의실패와 실제 label DOM입니다. 공통 `A.field`의 input/select/textarea에 원래표시 항목명을 명시했고, 오류는기존aria-describedby/rolealert로 보존했습니다. `tests/review132-ui-field-names.mjs`는7실패→7통과이며 새최종실제등록검수도 source503·검증오류·재조회후 모두정확한‘담당자’이름1개와 오류설명연결을 확인했습니다.

최종core지문은 `2016fac30b19a37dc7fe4639eede5ddcd5c889d52d06ca6c5ef4fdee6700956d`, setup은 `6c24630310672c39e9e5fa89863243420fd5f425c496dfff890bcc9a6b49054a`, setup.css는 `5f940b74aab31f7232af039de1b2d4ac978a81c76f1de5a1d0ad40d31e5689ab`입니다. 부지/인허가21·수정버튼18·보고셀8의 인접회귀도 현재core에서 재실행해 통과했습니다. 실제1280/390 등록이미지를 직접열어 확인했으며 새로고침 버튼의 마지막글자 줄바꿈은 별도좁은CSS교정제안으로 루트에 전달했습니다. 코드·자료형·운영저장 수락과 구별합니다.

## 제품 동결본 최종 재실행

마지막글자 줄바꿈을 같은 버튼의nowrap속성으로 교정한 뒤 **HTML `7c4d131c69038fecc54941c3611d6541282bac0fc7ee535830ab7c8ca79d8b4d`·6,929,824B**에서 등록4/4·인허가/부지8/8을 모두재실행했습니다. pageerror0이며 `.build/review132-client/frozen-registration-four-widths/evidence.json`과 `frozen-permit-four-widths/evidence.json`이 현재최종근거입니다. 앞의aca5540b·3730c071·d58bd27d는 각당시검수로보존합니다.

등록의새로고침버튼은4폭모두실제텍스트Range가버튼박스안에완전히들어갔고 scrollWidth=clientWidth=132였습니다.1280/390최종이미지를직접다시열어끝글자침범이없음을확인했습니다. 최종setup.css지문은 `2b9439c1559f619f450be629b9afb4f2aed9f522757fe4854f3ae0f6df9c3dc7`이며JavaScript지문은위최종core/setup/recovery와같습니다. 이결과는실제격리UI·합성HTTP저장/재접속이며 정식서버/실DB/배포전체수락은별도입니다.

QA가구형부지11셀기대만승인된구역폼1개/11원값/저장취소로명시대체한뒤,`review131-permit-intake`를최종core에서다시실행해23/23통과했습니다. 앞의22통과1실패는당시검사이전결과로보존하며 원값·3토지원장·분양행수정단언을약화하지않았습니다.

## Git 게시용 정확 파일 재검수

로컬 원본 검수 HTML은7c4d131c·6,929,824B로보존합니다. 실제게시용Git파일 `.build/github-release-review132/.build/review132/c94-production.html`은 **SHA256 `b6c0e651f117e917db4219d37aaebc849a7f38b87479e461db2b5579c8b2373d`·6,929,788B**입니다. `prepare-github-release.mjs`의기존변환이비활성 `src/partners.js`예시의로컬임시경로1개와PDF파일명3개를각1회씩익명화하기때문입니다. 루트가원본HTML에그4치환만적용하면게시용HTML과바이트전체가같음을독립확인했고, 기존검사기도실제연결된현재core/setup/setup.css/recovery/permit/workspace/cbs소스가게시용HTML에포함됐는지그대로검사했습니다.

소스나검사기를수정하지않고 **게시용b6c0e651파일자체**를새격리Edge에주입해등록4/4·인허가/부지8/8을재실행했습니다. pageerror0,원본쿠키/실DB/운영쓰기0입니다. 근거는 `.build/review132-client/published-exact-registration-four-widths/evidence.json`·`published-exact-permit-four-widths/evidence.json`입니다. 등록1280/1440/1600/390의filled이미지4개는원본7c4d131c검수이미지와PNG파일지문까지모두같았습니다. 정확한이미지·검사기지문은같은이름JSON의publishedArtifactVerification에기록했습니다.

이는앞의12개업무흐름을게시용정확본에서다시확인한것이며고유기능24개로늘리지않습니다. 이담당자는실제정식URL/서버DB를검수하지않았으며,그확인은루트의배포/실서버근거와별도로연결합니다.
