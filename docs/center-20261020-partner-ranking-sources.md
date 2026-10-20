# CENTER120-17 공식 업체 순위 수집 계약

## 범위와 보존

공식기관의 공개 표·첨부에서 5분야 각 상위30행을 읽습니다. 원사이트의 계정·DB·비밀정보는 사용하지 않습니다. 기관 확인시각, 공시연도, 실적연도, 자료 정정일을 구별합니다. 실패한 분야는 기존 표를 유지하며, 첨부 다운로드·해시 확인만으로 수집 성공 처리하지 않습니다.

회사 연결은 검증된 같은 기관 등록번호만 사용합니다. 회사명·순위만 같다고 기존 회사·공식 코멘트·직원 댓글을 합치지 않습니다. CM 신청번호는 출처 신청 식별자이며 회사 등록번호라고 표시하지 않습니다. 새로 확인한 CM 신청은 공시연도별 별도 출처키로 저장합니다. 기관 표 갱신은 업무 원장·계약·사업비를 변경하지 않습니다.

## 독립 원문과 열 정의 (2026-10-20 확인)

| 분야 | 공식 원문 | 현행 자료·단위 | 검증할 경계 |
|---|---|---|---|
| CAK 토건 | [협회 정정 공지](https://gyeonggi.cak.or.kr/lay1/bbs/S341T815C955/A/70/view.do?article_seq=159621), [수정 XLSX](https://gyeonggi.cak.or.kr/download.do?uuid=3c71b42f-44eb-4982-bff8-4c3729ded00f.xlsx) | 공지2026-07-30 / 첨부명260803 정정 / 평가2026 / 백만원 | 5시트 중 `토건`, 순위·상호·등록번호·시평액 열을 명시 확인. 다른 업종을 섞지 않음. 등록번호의 앞0 보존. |
| CM | [한국CM협회 발표](https://www.cmak.or.kr/board/news_association/11087), [공식 KISCON 공시](https://www.kiscon.net/pcm/detail_search.asp?GONGSI_YEAR=2026) | 공시2026 / 실적2025 / 백만원·명 | 총45신청의 전체3페이지를 읽음. 이름순 원표를 **2025 연간 용역형 CM 실적**으로 정렬. 누계 실적을 연간으로 오인하지 않음. 모든 페이지에 공시연도 유지. |
| ETIS 전체 | [공식 조회](https://www.etis.or.kr/webs/statistics/siljuk_ranking.jsp?leftParam=911&topParam=3), [2025 PDF](https://www.etis.or.kr/webs/pdfdata/2025siljuk_all.pdf) | 실적2025 / 상위100개 / 건·백만원 | 제목의 전체/연도/단위, 순위·신고번호·회사명·건수·금액을 좌표 열로 판독. 등록번호 중복·누락·금액열 혼동은 전량 실패. |
| ETIS 건설 | [공식 조회](https://www.etis.or.kr/webs/statistics/siljuk_ranking2.jsp?leftParam=912&topParam=3), [2025 PDF](https://www.etis.or.kr/webs/pdfdata/2025siljuk_con.pdf) | 실적2025 / 건·백만원 | 전체 표와 별도 범위. 같은 회사의 두 분야 실적을 합산하거나 서로 대체하지 않음. |
| KACEM | [공식2026년3분기 PDF](https://www.ekacem.or.kr/storehouse/stat-member/20260930-3.pdf) | 원사이트 기준2026년3분기 / 건·억원 | 현재 공개 HTTPS 인증서가 만료되어 원문 수신 차단. 인증서 검증 해제·HTTP 강등 금지. 유효한 원문을 수신·검증하기 전에는 실패+기존 표 보존. |

CAK 실제 원문은 토건2789·토목4942·건축9724·산설434·조경1308행(머리글 포함)을 메모리에서 열어 시트·열을 확인했습니다. 토건 원문 1위 삼성물산34,878,471 / 2위 현대건설18,271,436 / 3위 GS건설11,066,800백만원은 독립 통제값입니다. CM 발표의 연간 1~3위는 삼우씨엠·건원·무영 순이며, 발표의 억원 반올림값과 공시 백만원 정밀값은 구별합니다.

현재 연도 이후의 첨부를 추측 생성하지 않습니다. 공개 조회에서 기대 연도·원문 열·완전한 페이지를 확인하지 못하면 새 자료 없음이라고 단정하지 않고 해당 분야를 실패로 남깁니다. CAK 정정 게시물은 검증된2026 원문이며 향후2027 공시 URL은 새 원문 확인이 필요합니다.

## 서비스 계약

`collectPartnerRankings({previous, fetcher, clock, budgetMs})`는 `sourceResults`를 반환합니다. 항목은 `sourceId/status/complete/checkedAt/dataDate/sourceUrl/fingerprint/coverage/errorCode/patch`를 사용합니다. `complete:true`와 표 `patch`는 30행 전체 의미·단위·ID 검사가 통과한 분야에만 제공합니다. 기존 그룹 키는 `cak-rows/cm-rows/etis-overall_rows/etis-construction_rows/kacem-rows`입니다.

`parsePartnerDocument(bytes, {format, timeoutMs, maxPages, maxRows})`는 공개 Buffer를 별도 Worker에서만 읽습니다. XLSX는 `{sheet,data}` 목록, PDF는 페이지별 좌표 텍스트를 반환합니다. XLSX의 매크로·외부 연결·재계산·재저장은 실행하지 않습니다.

## 실행 상한과 배포 검증

- HTTPS 공식 호스트·GET만 허용, 요청/응답 총량·시간을 제한합니다. 외부 `fetcher`도 내부 제한보다 넓은 권한을 부여하지 않습니다.
- 입력8MiB·최대120 PDF페이지·시트 데이터25000행·셀수60만·문자수800만, Worker 256MiB/10초 상한을 적용합니다. PDF 파서 경고는 Worker의 별도 출력 스트림에서 소비하고 앱 로그에 원문을 쏟지 않습니다.
- root 승인 고정 파서: `pdf2json@4.1.0`(Apache-2.0, Node>=22.23.2), `read-excel-file@9.3.12`(MIT, Node>=18). [PDF 공식 API](https://github.com/modesty/pdf2json), [Excel 공식 API](https://github.com/catamphetamine/read-excel-file)를 기준으로 Buffer 읽기만 사용합니다.
- `new URL('./partner-ranking-parser-worker.mjs', import.meta.url)`의 파일 추적과 두 npm 패키지가 실제 Vercel 함수에 포함되는지는 로컬 검사와 별개입니다. 보호된 검증배포에서 원문 수집을 실행하기 전까지 배포 호환 완료로 표시하지 않습니다.

## 수행·미수행 구분

명세·실패 조건을 먼저 작성한 뒤 `server/partner-rankings.mjs`와 별도 파서 Worker를 구현했습니다. 모듈 부재 당시 검사는 준비 미완료로 기록했으며 제품의 의미 오류 재현으로 세지 않았습니다. 실제 조회에서 ETIS `#view=FitH`가 붙은 embed 주소를 놓친 실패를 확인하고, 같은 공식 주소의 보기용 fragment만 제거하는 최소 교정을 추가했습니다. 외부 호스트·이전연도·중복 주소 차단은 유지합니다.

2026-10-20 18:06:26 한국시간의 실제 공개 조회에서 CAK30·CM30·ETIS전체30·ETIS건설30을 확인했습니다. 요청10개·2,598,424바이트·2.669초였으며 기존 스냅샷은 변경하지 않았습니다. CM은45신청·3페이지 전부 읽었고, ETIS는 각4페이지·100개 전부 검증한 후 상위30만 제공합니다. ETIS 두 원문의1·30위까지 PNG로 직접 대조했으며, 전체8페이지의 시각 전수검수와 혼동하지 않습니다.

`tests/center120-partner-rankings.mjs`는 기본13개, 저장된 공식 ETIS 두 PDF를 포함하면15개, 실제 공개 조회·메모리 병합 보존 검사까지 포함하면16개를 통과했습니다. 실제 조회는 `PARTNER_OFFICIAL_LIVE=1`, 저장 원문은 `PARTNER_OFFICIAL_FIXTURES=1`일 때만 실행합니다. KACEM 실패분야의 표·기존 회사·공식글·이전 온라인글·명시 댓글 키 보존을 함께 검사했습니다. DB 쓰기는 하지 않았습니다.

- KACEM은 공식 협회·국토부·공공데이터에서 같은2026년3분기 재게시본을 집중검색했으나 검증 가능한 대체 원문을 확보하지 못했습니다. 대체본 부재를 전국 검색 완료나 자료 미존재로 단정하지 않습니다. 현재 HTTPS 인증서 만료는 실패로 남기고 사용자 제공3분기 표를 유지합니다. 유효한 원문을 향후 수신해도 별도 열·단위 파서 검토가 아직 필요하므로 `SOURCE_KACEM_FORMAT_REVIEW_REQUIRED` 상태를 반환하며 완료로 승격하지 않습니다.
- CM 새 신청번호와 구 포털의 회사키를 이름으로 결합하지 않습니다. 구 회사 프로필·공식글·직원 댓글은 남지만 새로운 공시 표에 자동 연결되지는 않습니다. 이를 실제 회사 ID 대응 확인 없이 동일 회사 완료로 표시하지 않습니다.
- CAK는 검증된2026 정정 첨부이며, 향후 연도의 새 공시 발견·게시물 선택은 추가 원문 확인이 필요합니다. 단순 예약 실행을 미래 모든 연도의 최신 공시 수집 완료로 확대하지 않습니다.
- Vercel 배포 Worker 번들·실행, 원격 API·권한, 자연 예약, 화면 검수는 root가 별도 확인합니다. 이 모듈의 로컬/공개 조회 성공만으로 원사이트 전체 기능·자동화 이관을 완료 처리하지 않습니다.
