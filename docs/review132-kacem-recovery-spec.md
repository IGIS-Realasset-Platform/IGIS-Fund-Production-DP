# REC132-05 KACEM 공식 Q3 PDF 연결

2026-11-02 재개. `server/partner-rankings.mjs`와 `server/partner-collector.mjs`의 KACEM 범위만 변경합니다. UI, 실제 DB/계정/ENV/Git/배포/cron은 구현 담당자가 변경하지 않습니다.

| 번호 | 독립 근거와 성공 기준 | 보존·실패 경계 |
|---|---|---|
| KACEM132-01 | 기존 portal sourceLinks와 legacy meta가 가리키는 정확 공식 HTTP Q3 PDF를 원문으로 사용. URL `http://www.ekacem.or.kr/storehouse/stat-member/20260930-3.pdf`, SHA256 `216cebafe0ca74bfd3bf4f548d1df1da9109ffb1a1b7dfcfb0ff4ae8886b1ed3`, 3,941,482바이트/27쪽 | 인증서 만료 HTTPS와 별도 상태. 정확 한 URL·본문 SHA 검증만 승인하며 다른 HTTP/경로/분기/query/port/userinfo/fragment·인증헤더·redirect·8MB 초과·15초 초과를 거절. 일반 TLS 실패의 HTTP fallback과 TLS 검증 해제 금지 |
| KACEM132-02 | 실제 전체부문 page2~8의 상위100행에서 상위30/12개 수치 열을 정확 투영. 2026-01-01~09-30 누계, 건/억원, 총계·공공 설계등/CM·민간 공동주택/다중이용/CM을 구별 | 토목·건축의 다른100행과 혼합하지 않음. 열/기간/단위/행 누락·중복을 실패로 고정. 0 보존, 원문 총액을 상세합계로 재계산하지 않음 |
| KACEM132-03 | 현재 기본 Worker256MB가 정상27쪽에서 OOM임을 확인. KACEM 전용 명시 profile만512MB/maxPages30/10초로 읽고 다른 PDF 기본256MB는 유지 | 파일8MB·텍스트/페이지/시간/메모리 상한 유지. OOM을 원문 형식 오류나 정상 빈 자료로 바꾸지 않음 |
| KACEM132-04 | 같은 공식 발표·같은 원문행·회사 표기 의미 일치 범위에서 기존 companyKey/sourceRowId/전년순위/원래 원값·필드·댓글을 보존 | PDF에 법적 등록번호가 없으므로 빈 ID/이름/현재순위만으로 다른 발표의 실법인을 합치지 않음. 새로운 발표는 별도 출처행 ID·미확정 전년순위로 만들고 과거 발표·profile 유지 |
| KACEM132-05 | 실제 collector → source result → merge → automation sourceUrl/coverage → group/profile 링크가 같은 검수 URL·기간·SHA 의미를 유지 | HTTP를 일반 publicUrl 정책에 풀지 않음. 검증 출처를 조용히 null로 버리거나 성공으로 숨기지 않음. 이 원천 성공을 전체 외부수집 완료로 확대하지 않음 |

독립 추출은 제품 pdf2json과 별개인 pdfplumber로27쪽을 모두 읽었습니다. 전체부문100행과 기존 제공 상위30의 회사30개·12열×30=360개 숫자를 대조해 차이0입니다. 근거는 `.build/review132-kacem/independent-legacy-comparison.json`, 독립 기대값은 `independent-top100.json`, 공개 원문 영수증은 `http-pdf-receipt-20261102.json`입니다. 페이지1/2를 실제 렌더링해 기간·단위·열 역할도 확인했습니다. 이 결과는 현재 DB 민감 원값 재조회/동등성 검증이 아닙니다.
