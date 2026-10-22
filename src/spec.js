(function(A){
 const inheritedAuthentication=A.clone(A.spec.productionContracts?.authentication??null);
 const features=[
 ['CBS-01','공통 CBS·가변 상세','대분류 직접입력, 선택 3단계, 미분해 금액, 분해·병합, 고유 코드','엑셀 C6 / 사용자 선택'],
 ['COST-02','단계별 사업비 확정','최초 UW·브릿지·PF·리파이낸싱·준공, 접이식 열과 정정 이력','요청 3 및 시점 확정답변'],
 ['COST-03','시점별 증감사유','지정시점에서 직전 확정값 대비 min(3%,5억원), 초기·수시·보고 면제','엑셀 C7 수정 확정'],
 ['AREA-01','면적·평당가 이력','시점별 면적 분모 보존, 금액과 면적 변동 구분','요청 9'],
 ['FUND-01','계약·CBS 연결','변경차수, 비용반영액, 다중 CBS배부, 계약·사업비 독립','엑셀 C9·C26'],
 ['FUND-02','지급회차와 자금현황','선급·기성·유보·부분지급, 확정 미지급, 30/90일, 이관 대사','요청 2 및 VAT 답변'],
 ['INIT-01','AI 추출 초기값 검토','출처·후보·충돌·담당자 확인·근거경로, 실제AI API 없음','엑셀 C2 및 확정답변'],
 ['PARTNER-01','시공사·CM·엔지니어링','공개캐시 기준정보와 당사참여·양측 영업담당자 CRUD','요청 4'],
 ['PERMIT-01','사업별 인허가 프리셋','추천선택·직접추가·의제·변경허가·계획/실제','요청 8 / 엑셀 C18'],
 ['PERMIT-02','조치계획·근거','조건별 담당·조치내용·기한·상태·공용폴더/backdata 확정필수','요청 5'],
 ['LAND-01','다중 부지·계약','필지/매도인/매매계약/지급재원금액→비율','엑셀 C14·C16'],
 ['DATES-01','준공·책임준공·PF 만기','계약별·약정별 날짜 독립 보존','엑셀 C20·C22'],
 ['REG-01','개발업 등록·신고','법인공통, 일반/SPC 특례, 대상판정 사실·근거 기록','요청 7'],
 ['LAW-01','최근 30일 법령변경','8분야·법령계층·시행예정/공포·영향근거·이력보존','요청 6'],
 ['MARKET-01','시장 공사비 동향','계열·기준월·잠정/확정·출처버전, 결측보간 없음','요청 10'],
 ['DOC-01','공용폴더·기안 참조','문서번호·개정차수·기안번호·경로, 업로드/사내연동 없음','엑셀 C28·C31 및 B29 답변'],
 ['REPORT-01','보고 기준값·원본 PDF','실제저장값, 시점 선택, 분기 대주, 원본표 행 추가, 출력값 보존','계획4 / 기존 보고기능'],
 ['AUDIT-01','모든 데이터 변동 이력','생성·수정·삭제·복구·확정·분류변경 기록, DB계약 명세','누적 사용자 지시']
 ];
 A.spec.functionalRequirements=features.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'구현 · 화면 검수 대기'}));
 A.spec.informationArchitecture=[['portfolio','프로젝트 현황'],['overview','개요·등록'],['cost','CBS·자금·공사비'],['finance','출자·대주·분기'],['permit','인허가·부지·일정'],['document','계약·문서경로'],['company','협력사·영업라인'],['law','법령변경'],['report','원본보고서'],['setup','초기값 검토']].map(([view,name])=>({view,name}));
 A.spec.dataContracts={...A.spec.dataContracts,initialization:['status','completedAt','reopenedAt','candidates[].id/key/label/type/value/source/location/asOf/path/choices/status/reviewedAt/reviewedBy/note'],cbs:['id','code','parentId','current','initial','sortOrder','deletedAt','sourceIds'],costStages:['id','kind','date','nodes','values','area','source','reasons','supersedesId'],contracts:['id','companyId','revisions','allocations','certifications','obligations','payments'],areaHistory:['siteArea','gfaTotal','date','source','before','after'],registration:['entityId','legalForm','capital','professionals','office','manager','contractPath','registrationNumber','status','evidencePath'],permits:['id','parentPermitId','presetKey','category','plannedDate','approval','actualDate','actions','sourcePath','backDataPath'],loanQuarterlyRecords:['loanId','asOf','commitment','executed','balance','source','supersededAt'],companyRelations:['companyId','contractId','projectId','participations','salesLines'],marketSeries:['seriesId','period','value','unit','publicationVersion','status','source','page'],auditEvents:['id','action','entity','idRef','before','after','actor','at']};
 A.spec.acceptanceTests=['CBS 총액·미분해·분해/병합 대사','초기·최초UW·수시·일반보고 사유면제','조달/리파이낸싱/준공 직전확정 min3%5억원','0원 신규항목과 단순분류분해 구분','면적만 변경하면 금액증가 알림 없음','계약금액+VAT와 사업비반영액 독립','부분지급·선급금·기성·확정미지급 구분','이관기초와 상세거래 중복없음','등록면적경계 및 최초법정이벤트 적용례','프리셋 재적용 덮어쓰기 없음','출처갱신이 내부관계 정보 보존','보고서 사업비/조달 임의 생성없음','각 보고서 페이지 원본이미지 육안 검수','1280/1440/1600 전체 화면 가로넘침0'];
 A.spec.costRules={hierarchy:'공통 대분류+선택3단계, 실제말단값만 합산',reason:A.spec.costChangeContract,amounts:'사업비 예측과 계약·기성·지급 각각 독립 원천',perPyeong:'won / (areaM2 / 3.305785) / 10000'};
 A.spec.designSystem.font='Pretendard 24/16/14px, 400/600';A.spec.designSystem.fontSizes=['24px','16px','14px'];
 A.spec.productionContracts={...A.spec.productionContracts,implementationStatus:'향후 서버개발 계약 · 이번 HTML에 DB연결 없음',sourceOfTruth:'각 업무원장 단일소유·외부 기준정보와 내부 수기정보 분리',audit:'모든 성공 데이터변동과 감사행을 서버 동일 트랜잭션에 저장. 클라이언트 감사로그 수정불가, 거부/롤백은 업무변동0',documents:'공용폴더 경로 참조, 실제파일업로드/사내시스템 연동 제외'};
 A.spec.history.push({version:'v0.10.0',summary:'단일 App 구조로 원가·계약·시점·보고원천 정리. CBS, 시점확정, 초기검토, 계약별 자금, 법인등록, 변경인허가, 협력사, 시장지수 구현'});
 A.spec.requirements.push({id:'EXCLUDED',source:'사용자 최종 답변',decision:'마스터리스·위탁운영 제외. 표준자금판·트랜치 대체입력·업로드·사내연동 제외'});
 A.spec.functionalRequirements.push({id:'REPORT-ROWS',name:'보고서 정렬·반복행',behavior:'원본 표 구조·병합셀·가변 행 높이·같은 표의 페이지 분할',source:'추가 사용자 지시',status:'샘플 구현'});
 features.push(['REPORT-ROWS','보고서 정렬·반복행','원본 표 안에서 행 추가·머리글 반복·행/원자료 연결','추가 사용자 지시']);
 A.spec.dataContracts.reportSnapshots=['id','type','date','stageId','createdAt','payload','entityIdentitySnapshot','templateVersion','coordinateVersion'];
 A.spec.dataContracts.reportLayout=['formVersion','sectionId','tableId','rowId','recordId','fieldId','unit','colspan','rowspan','minHeight','alignment','page','fragment'];
 A.spec.meta.version='0.10.4';
 A.spec.recovery=typeof RECOVERY_LEDGER==='undefined'?{}:RECOVERY_LEDGER;
 A.spec.verification={status:'구현 산출물 정리 · 추가 검수는 사용자 요청으로 생략',date:'2026-09-11',executedEvidence:'.build/recovery-verification.json에 이전 실제 실행기록 보존. 이번 마무리에서는 재실행하지 않음.',visualVerification:'미실시 · 사용자 요청으로 이번 마무리 범위에서 제외',interactionVerification:'미실시 · 사용자 요청으로 제외',printVerification:'미실시 · 사용자 요청으로 제외',noInheritedPassCounts:true};
 A.spec.reportLayoutContract={template:'공식 제1호·제2호 원본 표 구조',repeatRows:'원본 표 안에서 행 증가, 머리글 반복',pagination:'내용 높이에 따른 A4 가변 쪽수',truncation:false,appendix:false,units:'서식 금액단위의 숫자만 출력',versioning:'보고 기준값과 서식 버전·원자료 행 연결 보존',visualGate:'원본 대비 페이지별 육안검수 미실시'};
 A.spec.dataContracts.areaVersions=['id','date','source','gfaTotal','gfaAbove','gfaBelow','farArea','buildingArea','siteArea','acquisitionLandArea','status','scope','snapshotOnly','recordedAt','recordedBy'];
 A.spec.dataContracts.auditEvents=['id','projectId','entity','idRef','action','before','after','actor','at','source','requestId','transactionId'];
 A.spec.productionContracts.auditTransaction={atomic:true,scope:['생성','수정','삭제','복구','순서변경','분류변경','시점확정','정정'],excluded:['클릭','조회','화면전환'],fields:A.spec.dataContracts.auditEvents,authority:'서버가 사용자·시각·권한을 검증하고 이력을 추가. 업무사용자의 감사기록 수정·삭제 금지',conflicts:'버전 검사 후 충돌 시 거부·차이 반환',idempotency:'요청 ID에 유일성 부여, 동일 요청 재시도 중복 저장 금지',failure:'업무 데이터·이력·알림 생성 모두 롤백'};
 A.spec.productionContracts.lawCollection={scope:'향후 서버 구현',secrets:'서버 전용 인증값',schedule:'일일 목록·본문·변경이력 수집',storage:'원문 버전·출처·공포/시행/발견/확인일 구분',failure:'재시도·누락기간 복구·중복방지',prototype:'고정 기준일의 샘플만 표시'};
 A.spec.legacyReferences={retiredReportOverlay:A.spec.reportOverlayContract};delete A.spec.reportOverlayContract;
 A.spec.reproduction={build:'node scripts/build.mjs',automated:'node scripts/verify-recovery.mjs',baseline:'승인된 v0.10.2 화면 구조 · v0.9.4는 아이콘·형태 참고, 구 CSS 로드 없음',noBrowserBuild:true};
 A.spec.migration.fileOriginBoundary='자동이관은 현재 브라우저 저장영역에서 읽을 수 있는 기존키에 한정. 다른 파일경로·브라우저의 저장영역 접근을 보장하지 않음. 원본키와 충돌보관본 유지.';
 if(typeof RUN_VERIFICATION!=='undefined'&&RUN_VERIFICATION)A.spec.verification={...A.spec.verification,automated:RUN_VERIFICATION};
 A.spec.history.push({version:'v0.10.1',summary:'v0.9.4 UI 복원, 셀 직접편집, CBS/면적/저장 교정, 원본표 행 추가. 육안검수 대기'});
 A.spec.history.push({version:'v0.10.2',summary:'구 CSS 전체로드 제거, 개요/일정 전용배치, 업무용 변경이력, 10대분류·자유시점, 계약별 자금과 최소 지급입력, 독립 보고서 iframe, 인허가/공정과 협력사 상세 정리. 실제 화면·인쇄 검수 별도.'});
 const usability=[
 ['UI-102','화면 스타일 분리','공통 토큰/표/입력/모달과 컴포넌트별 전용 CSS, 구버전 head CSS 로드 금지','첨부1·2·3 및 승인계획'],
 ['AUDIT-102','사람이 읽는 변경이력','업무·단위·이전/이후·증감·사유·근거. 업무화면 JSON 금지, 원본 보존','첨부4'],
 ['COST-102','단일 사업비 비교표','면적2+총액+10대분류 기본, 사업비/평당가 전환, UW 조회기준과 통제기준 분리','첨부6 및 사용자 확정'],
 ['FUND-102','계약별 자금현황','8개 기본열, 계약/지급 최소입력, 회차 후속연결, 자료확보상태·다음지급','사용자 계약별 기본 선택'],
 ['REPORT-102','독립 보고서 문서','iframe srcdoc의 본문·썸네일·전용 CSS/폰트, 빈양식/작성본 구별, 양수 실제 페이지 확인','보고서 미표시 결함'],
 ['PERMIT-102','인허가·공정 간소화','관리분야/상태/보고분류 분리,7개핵심열,공정0~1날짜 추이제외·%p','첨부7·8'],
 ['PARTNER-102','공개사이트 내부 기능','5분야150기준행·전년변동·금액·수주·신용·뉴스요약·단가·지수·로컬관계','원사이트 공개 캐시와 승인계획']
 ];
 features.push(...usability);A.spec.functionalRequirements.push(...usability.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'코드 반영 · 실화면 검수 별도'})));
 A.spec.dataContracts.costStages=['id','kind','businessStageType','controlEventType','controlBaselineSnapshotId','label','date','nodes','values','reportedTotal','reconciliation','area','areaVersionId','source','reasons','supersedesId','captureMode','detailLevel'];
 A.spec.dataContracts.viewPreferences=['cbsColumns(project)','cbsCollapsed(project)','cbsWidths(project)','cbsViewMode(amount/unit)','cbsCompareBasis(project)','selectedContract','fundsView','fundsFilter'];
 A.spec.dataContracts.contractPayments=['id','date','amount(gross)','costAmount(nullable)','allocations','obligationId(empty allowed)','sourcePath','note','proposalNumber','linkedAt','deletedAt'];
 A.spec.dataContracts.paymentCoverage=['status(unknown/partial/confirmed)','asOf','sourcePath','reviewedAt','paid','paymentIds','changedAt'];
 A.spec.dataContracts.permits=['id','group','stage','reportCategory','legacyCategory','reportCategorySource','expected','approval','owner','actionItems','sourcePath','backDataPath','amendsId','deemedBy'];
 A.spec.dataContracts.reportReader=['mode(filled/blank)','ready','fontsReady','frame','document','zoom','fitMode','layout.measured','layout.visibility','visualVerification'];
 A.spec.reportLayoutContract.isolation='보고 전용 srcdoc iframe. 본문·썸네일·폰트·인쇄 같은 문서. 앱 CSS 적용 금지.';
 A.spec.reportLayoutContract.visibility='페이지 display/visibility/실제width/height가 유효할 때만 레이아웃 검증. 크기0은 실패, 데이터 오류와 빈양식 별도.';
 A.spec.featureContracts.uiOwnership={legacyStylesImported:false,fontSizes:[24,16,14],weights:[400,600],overview:'항목/값 그리드와 내용기반 높이, 마커행 중심선',numericCells:'금액·날짜 말줄임 금지, 넓은 표는 내부 스크롤',tooltip:'마크·범례·키보드 포커스,현재 dialog계층·화면경계 내 배치',rawAudit:'업무뷰와 원본 저장·명세 분리'};
 A.spec.designSystem.baseColors={navy:'#10243e',blue:'#2a64c7',canvas:'#e8edf3',surface:'#ffffff',line:'#dce3eb',text:'#24364b',muted:'#63758a'};
 A.spec.designSystem.semanticColors={increase:'#cf2e2e',decrease:'#246bc1'};
 A.spec.designSystem.spacing=['6px','12px','18px','24px'];A.spec.designSystem.spacingRule='주요 구획 12px, 압축 간격 6px. 표와 입력의 행 높이는 글꼴과 내용에 맞춰 별도 정의.';
 A.spec.designSystem.tableRule='공통 14px·숫자 정렬·직접 편집 규칙. 업무별 행 펼침과 고정 열은 컴포넌트가 소유하며 전역 높이 강제 맞춤 금지.';
 A.spec.acceptanceTests.push('구 CSS없이 전체 실제 화면·3해상도 검사','사업개요 전체 폭과 날짜10자리·선/점 중심1px','업무 변경이력 JSON/내부키 노출 없음','10대분류13행 기본과 자유사업시점 통제분리','회차없는지급→원ID후속연결→누계중복없음','독립 보고서 iframe 로드·양수 실제페이지·동일문서 인쇄','공정0/1/복수날짜 및 미입력/실제0 구분','공개사이트150행과수록요약/단가출처보존');
 const recovered=[['UI-RESTORE','v0.9.4 기능 복원','검색·필터·일정·현안·차트·문서 버전·제출이력','사용자 복구계획'],['UI-COPY','운영화면 안내문 제거','고정 구현설명 삭제, 실제 사업 데이터·오류·단위 보존','사용자 문구 지시'],['STORE-01','저장 원복·이관 충돌','키별 파싱·보관본 비교·저장 실패 원복·원본키 보존','소스 진단'],['UI-INLINE','셀 내부 편집','Enter 저장, Esc 취소, 모달 단순 편집 대체','v0.9.4 복원']];
 features.push(...recovered);
 A.spec.functionalRequirements.push(...recovered.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'구현 · 화면 검수 대기'})));
 // v0.10.3 supersedes only the explicitly revised requirements; historical records remain in history.
 const superseded=new Set(['CBS-01','FUND-02','COST-102','FUND-102']);
 A.spec.supersededRequirements=A.spec.functionalRequirements.filter(x=>superseded.has(x.id)).map(x=>({...x,status:'v0.10.3 승인 변경으로 대체'}));
 for(let i=features.length-1;i>=0;i--)if(superseded.has(features[i][0]))features.splice(i,1);
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!superseded.has(x.id));
 const revision=[
 ['CBS-103','재무모델 관리항목','10대분류+45기본항목 기본펼침, 선택항목·공종세분류, 원자료 ID대응과 중복합산 방지','승인표·기존124항목·공개개발예산'],
 ['COST-103','금액·증감 비교와 대상 작업','단위억원, 시점별 금액/증감,980px 설계, 항목추가·합치기·나누기·예비비, 빈항목만삭제','사용자 v0.10.3 승인'],
 ['FUND-103','전체 사업비 지급현황','항목별 비용/계약/지급반영/잔여/다음지급,월별12개월,미계약예측·계약대체·부분지급','사업비 항목별 기본 선택'],
 ['VAT-103','부가세 귀속·공제·안분','거래유형/원가귀속/공제 별도, 예산가정과 증빙정산 버전, 실제지급·환급 독립','사용자 부가세 추가 지시·공식조문'],
 ['INIT-103','완료 후 초기자료 숨김','완료 시 상단버튼 제거, 문서에서 출처조회, 명시적 후보 재검토만 재개','사용자 v0.10.3 승인'],
 ['SCHEDULE-103','사업 일정 직접관리','같은화면 편집표, 단계명·내용·계획/예상/실제·중간추가·순서·삭제, 법정기산일 독립','사용자 v0.10.3 승인'],
 ['REG-103','개발업 등록 업무흐름','법인정보/대상검토/등록·신고 3업무행, 제출내역 기록·정정, 조문 링크','사용자 v0.10.3 승인'],
 ['UI-103','근접 배치·문서·협력사 복구','공통표 연결·혼합본문 여백·실작업폭 상세·시장지표 단일소유·대분류 호버','현행 마크업/CSS 조사·독립UI/UX 검토']
 ];
 features.push(...revision);A.spec.functionalRequirements.push(...revision.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'코드 반영 · 실제 화면/인쇄 검수 별도'})));
 A.spec.requirements.push(...revision.map(([id,name,decision,source])=>({id,source,decision})));
 A.spec.requirements.push({id:'DECISIONS-103',source:'현재 사용자 확정',decision:'계약first 대신 항목별 지급현황. 10개총액만 제공하는 안 제외. 빈항목만삭제. 기본비용은 펼치고 공종만 선택세분화.'});
 A.spec.history.push({version:'v0.10.3',summary:'재무모델 기본관리항목·대상별 작업·항목별 지급일정·부가세 독립원장, 일정/초기자료/등록 흐름과 문서·협력사·시장지표 정비. 실제 화면·인쇄 검수는 별도 상태.'});
 A.spec.dataContracts.managementItems=['id','code','parentId','name','managementAccount','templateDefault','templateKey','budgetState','applicability','includedInId','assetAttribution','procurementScope','vatStatus','sourceIds','mappingStatus','mergedIntoId','initial','current','sortOrder','deletedAt'];
 A.spec.dataContracts.milestones=['id','name','detail','planned','expected','actual','status','sortOrder','sourceType','deletedAt'];
 A.spec.dataContracts.vatRecords=['id','kind','sourceId','mode(budget/evidence)','version','asOf','transactionType','attribution','deduction','reviewStatus','net','vat','gross','calculation.deductible/nonDeductible/pending/costAmount','apportionment','sourcePath','reviewer','taxpayer','period','sourceSnapshot','amountBasis','supersedesId','createdAt'];
 A.spec.dataContracts.vatReconciliations=['id','legacyAmount','allocations[].vatRecordId/sourceId/amount','reviewer','sourcePath','note','at'];
 A.spec.dataContracts.vatApplications=['id','vatRecordId','sourceId','previousValue','value','poolOwnerId','previousPoolValue','poolValue','legacyReclassified','legacyMovement','at'];
 A.spec.dataContracts.vatLegacyAggregate=['amount','sourceIds','label','capturedAt','sourcePath','original'];
 A.spec.dataContracts.fundForecasts=['id','cbsId','label','amount','costAmount','precision(date/month/undated)','dueDate','dueMonth','sourcePath','replacedBy','deletedAt'];
 A.spec.dataContracts.fundPayments=['id','cbsId','forecastId','date','amount','costAmount','sourcePath','movedTo','deletedAt'];
 A.spec.dataContracts.fundItemReviews=['id','cbsId','asOf','sourcePath','fingerprint','reviewedAt'];
 A.spec.dataContracts.viewPreferences.push('milestonesEditing(project)','fundsMonths','fundsMonthStart','managementSelected(project)','tableScrollState');
 A.spec.costRules.hierarchy='10대분류+45기본 관리행 및 선택항목. 고정 원자료 대응으로 집계, 관리금액과 원자료 이중합산 금지. 미확보와 템플릿 미편입 별도.';
 A.spec.designSystem.spacingRule='관련 조작 기본12px, 독립블록24px. 표/행별 압축 간격은6px, 폰트24/16/14 및400/600.';
 A.spec.featureContracts.workflow103={initialSetup:'명시적 완료 후 상단진입 숨김, 문서출처조회. 일상편집으로 재개하지 않음',milestones:'편집표의 직접 수정/추가/순서/삭제, 다른 법정/계약 날짜를 자동변경하지 않음',history:'개요는 원가변경이력만, 전체 감사원본 보존',market:'cost/benchmark 단일소유, company/market 저장경로는 해당영역으로 호환이동',costEditing:'억원 표시와 입력 단위 일치, 내부저장 원, 키보드/포커스·스크롤 복원'};
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!x.includes('10대분류13행'));
 A.spec.acceptanceTests.push('45기본항목과 선택상세 기본펼침/접힘 유지','빈항목삭제·사용중차단·합치기 후 총액보존','일정중간추가/이름/날짜/이동/삭제/실패원복','항목별미계약예측·월정밀도·12개월·계약전환대체','VAT100+10:공제100/불공제110/공제6불공제4→104','VAT일괄7005와항목별금액중복없음·부분지급세액복제없음','부가세단가GFA안분자동재사용금지·가정과증빙정산별도','문서선택/협력사복귀/시장단일화·3해상도실화면','수정전후동일조건비교·실제PDF전페이지회귀');
 A.spec.productionContracts.vat={automation:false,estimates:'근거 있는 예산가정만 계산, 세무확정으로 자동승격 금지',audit:'귀속/안분/정정/실제환급/상계 각각 원장과감사동시저장',cash:'공제예상액을 실제출금에서 차감하거나 환급일정으로 자동생성하지 않음',sourceVerification:'2026-09-21 공식 시행령 제80조 제목·본문 직접 열람 및 링크 연결. 페이지 표시 시행일2026-04-01. 개별 거래의 세무판정·전자신고 검증과는 별개.'};
 A.spec.reproduction.baseline='v0.10.2 데이터/원본보존, v0.10.3 승인 UI·업무계약';
 A.spec.delivery={version:'0.10.3',implementation:'구현 산출물 정리 완료',latestUserDecision:'검수하지 말고 나머지 작업을 이어서 마무리',additionalVerification:'실행하지 않음',visualQA:'미실시 · 사용자 요청으로 생략',priorAccessFailure:'인앱 브라우저가 로컬 HTML URL 탐색을 보안정책으로 거부',runtimeConnections:'Supabase·실제 AI·전자신고·일일 법령 수집·배포 없음'};
 for(const requirement of A.spec.functionalRequirements){if(/검수/.test(requirement.status||''))requirement.status='코드 반영 · 화면 검수는 사용자 요청으로 생략';}
 A.spec.requirements.push({id:'DELIVERY-103',source:'최신 사용자 요청',decision:'추가 검수 없이 구현·명세·산출물 정리를 마무리한다. 미실시 검수를 통과로 바꾸지 않고 이전 실행기록을 보존한다.'});
 // v0.10.4 removes the entire funds screen, not just its forecast columns.
 const retiredIds=new Set(['FUND-103']);
 A.spec.supersededRequirements.push(...A.spec.functionalRequirements.filter(x=>retiredIds.has(x.id)).map(x=>({...x,status:'v0.10.4 사용자 지시로 화면 폐지'})));
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!retiredIds.has(x.id));
 for(let i=features.length-1;i>=0;i--)if(retiredIds.has(features[i][0]))features.splice(i,1);
 const removal=['FUND-104','자금현황 탭 폐지','자금현황·월별 계획·전용 입력·바로가기 제거. 대체 집행 탭 없음. 문서 계약원장·실제 기록·보고 원천은 보존','사용자 최종 정정: 계약금액·기성·실제 지급이 나오는 탭 자체 삭제'];
 features.push(removal);A.spec.functionalRequirements.push({id:removal[0],name:removal[1],behavior:removal[2],source:removal[3],status:'코드 반영 · 화면 검수 생략'});
 for(const x of A.spec.requirements)if(['FUND-103','DECISIONS-103','DELIVERY-103'].includes(x.id))x.status='과거 결정 · FUND-104를 우선 적용';
 A.spec.requirements.push({id:removal[0],source:removal[3],decision:removal[2]});
 A.spec.informationArchitecture.find(x=>x.view==='cost').name='원가현황·세부 사업비·공사비 비교';
 A.spec.retiredDataContracts={fundForecasts:{fields:A.spec.dataContracts.fundForecasts,policy:'기존 값·연결·삭제상태 보관 및 전체 데이터 내보내기만. 신규 계획 입력·변경 없음'},viewPreferences:['fundsView','fundsFilter','fundsMonths','fundsMonthStart']};
 delete A.spec.dataContracts.fundForecasts;
 A.spec.dataContracts.viewPreferences=A.spec.dataContracts.viewPreferences.filter(x=>!/^funds/.test(x));
 A.spec.featureContracts.fundsScreen104={removed:true,replacementTab:false,costTabs:['overview','detail','benchmark'],legacyRoute:'cost/cashflow → cost/overview. 원본 알림은 변경하지 않음',preserved:['문서 계약원장','계약·기성·지급 기록','기초누계','부가세 원장','토지계약 법정 기재항목','대주·보고 기준값','과거 지급계획 보관본'],scope:'화면 및 전용 조작 제거. 원가·계약·보고 자료 삭제로 확대하지 않음'};
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!/(항목별미계약예측|12개월|월정밀도|전체 탭 연결)/.test(x));
 A.spec.acceptanceTests.push('자금현황·계약집행 대체탭 및 전용입력 없음','이전 선택 cashflow와 알림 연결은 원가현황으로 복구','계약·기성·지급·예측 보관값 및 문서/보고원천 불변');
 A.spec.history.push({version:'v0.10.4',summary:'사용자 정정에 따라 자금현황 탭 전체와 전용 계획 입력·바로가기 삭제. 계약·집행 대체 탭을 만들지 않음. 문서 계약원장·기존 기록·보고 원천 보존. 개요·사업비표 전면 재설계는 이번 변경에 포함하지 않음.'});
 A.spec.reproduction.baseline='v0.10.3 보존 + v0.10.4 자금현황 탭 삭제';
 A.spec.reproduction.automated='node scripts/verify-v0104.mjs';
 A.spec.verification={status:'탭 삭제·원자료 보존 로직 검사 / 실제 화면 검수 생략',date:'2026-09-11',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'미실시 · 사용자 요청으로 생략',interactionVerification:'실제 브라우저 조작 미실시',printVerification:'미실시',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.4',implementation:'자금현황 탭 삭제',latestUserDecision:removal[3],visualQA:'사용자 요청으로 생략',excludedThisChange:'개요·일정·사업비표 전면 재설계',runtimeConnections:'Supabase·배포·실제 AI·운영 연동 없음'};
 const revision105=[
 ['INIT-105','프로젝트 최초 등록','한 폼의 필수 기본정보·공통 근거, 별도 등록 초안, 완료 후 담당 탭 편집, 추가 자료 검토와 초기완료 분리','전체 대화·최신 초기 설정 지적'],
 ['COST-105','관리단위 비교·선택 내역','34개 활성 표시 묶음과 선택 묶음 입력, 과거 관리ID·원자료 보존, 빈항목 삭제·동일상위 순서·시점별 금액/단가','과도한 세분화·비교 사용성 지적'],
 ['DEMO-105','여러 시점의 독립 예제','최초UW·브릿지·설계변경·PF·리파이낸싱과 현재, 시점별 면적. 실제 프로젝트의 과거값을 생성하지 않음','여러 시점 샘플 요청'],
 ['SCHEDULE-105','선택 일정 편집','일정 클릭 아래 초안 편집·저장·취소, 중간추가·이동·삭제, 최초 계획일과 독립 업무날짜 보존','사업 일정 편집 흐름 지적'],
 ['CHART-105','축·단위 자동 계산','공통 수치/날짜축, 0·결측 구분, 실제 날짜 간격, //는 y축 레이블 전용 영역, 대분류 증감 상세','반복된 축·절단표시 지적'],
 ['UI-105','공통 조작·알림 대비','추가버튼의 같은 색·명칭, 저장/취소·미저장 이동 선택, 사이드바 알림 글자/배경·포커스 대비','버튼 통일·글자 식별 문제'],
 ['DOC-105','문서·협력사 복귀','입력자료·문서 버전·계약 VAT 원장 유지, 협력사 목록상태/스크롤 복귀, 시장지표 단일 위치','문서·협력사 깨짐 및 중복 지적'],
 ['REPORT-105','보고 원천·표시 상태','미사용 원가템플릿 제외, 미연결 토지회차 보존, 글꼴오류·숨김상태 실패, 원본표 반복/단위·정밀도 검사','보고서 누락·표시·정렬 반복 지적']
 ];
 const replaced105=new Set(['CBS-103','COST-103','INIT-103','SCHEDULE-103','UI-103']);
 A.spec.supersededRequirements.push(...A.spec.functionalRequirements.filter(x=>replaced105.has(x.id)).map(x=>({...x,status:'v0.10.5 누적 요청 반영으로 대체'})));
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!replaced105.has(x.id));
 for(let i=features.length-1;i>=0;i--)if(replaced105.has(features[i][0]))features.splice(i,1);
 features.push(...revision105);A.spec.functionalRequirements.push(...revision105.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'코드 반영 · 세부 결과는 요구사항 대장 및 실행 기록 참조'})));
 A.spec.requirements.push(...revision105.map(([id,name,decision,source])=>({id,source,decision})));
 A.spec.requirementLedger=typeof REQUIREMENT_LEDGER==='undefined'?{version:'0.10.5',items:[]}:A.clone(REQUIREMENT_LEDGER);
 A.spec.meta.version='0.10.5';A.spec.meta.updatedAt='2026-09-21';A.spec.sampleAsOf=A.today;
 A.spec.dataContracts.projectRegistrationDrafts=['id','values','evidence','createdAt','updatedAt','deletedAt'];
 A.spec.dataContracts.registrationInput=['status','confirmedAt','confirmedBy','evidence','missingKeys'];
 A.spec.dataContracts.inputDataReviews=['id','key','value','source','location','asOf','path','status','reviewedBy','reviewedAt'];
 A.spec.dataContracts.displayGroups=['id','name','categoryId','managementIds','current','initial','sourceIds','calculated'];
 A.spec.dataContracts.reportExample={id:'SAMPLE02',isExample:true,helper:'populateReportExample',guard:'새 예제 생성 때만 호출. 기존 ID가 저장되어 있으면 재생성·보충하지 않음.',source:'보고 입력 유형의 가상 데이터. 실제 프로젝트와 별도.'};
 A.spec.costRules.hierarchy='10대분류를 유지한 계산용 표시묶음 + 선택 묶음의 실제 관리항목 입력. 기존 관리ID·원자료 보존, 합계와 분모는 단일 원천. 기본 내장사업은34표시묶음.';
 const retiredAcceptance=A.spec.acceptanceTests.filter(x=>/45기본항목과 선택상세 기본펼침|10대분류13행/.test(x));
 A.spec.retiredAcceptanceTests={...(A.spec.retiredAcceptanceTests||{}),v0105:retiredAcceptance};
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!retiredAcceptance.includes(x));
 A.spec.acceptanceTests.push('34표시묶음과선택입력의총액·관리ID보존','초기등록단일폼·초안·추가자료검토가현재값을자동덮어쓰지않음','여러시점독립예제와시점별단가·0/미확보구분','일정선택초안·저장·취소·실패유지','차트//레이블전용·자동수치/날짜축·실제간격','알림과추가버튼배경/문자대비','모든현행메뉴와상세버튼등록·삭제탭비노출');
 A.spec.dataContracts.viewPreferences.push('cbsSelectedGroup(project)','cbsDrafts(ephemeral)','selectedMilestoneDraft(ephemeral)','partnerListState','documentListState');
 A.spec.featureContracts.commonEditing105={creation:'소속 헤더 우측 + 대상 추가, 남색 테두리·흰 배경',draft:'비교표 선택 내역과 일정 편집은 저장/취소. 다른 화면 이동 전 저장·버림·계속편집.',validation:'필드별 짧은 오류, 실패 입력 유지',notifications:'단일 사실 알림·이전/다음·삭제·이동, 흰 글자/짙은 배경',sample:'가상 예제 분리, 포트폴리오 합계에서 제외, 기존 저장 선택을 임의 변경하지 않음'};
 A.spec.history.push({version:'v0.10.5',summary:'누적 사용자 요구 134항목 대사. 최초 등록·선택 일정 편집·CBS 표시묶음과 단가·복수시점 예제·자동축·알림 대비·문서/협력사·보고 원천 교정. 자금현황 삭제 유지. 실제 화면/인쇄 검수는 별도 미실시.'});
 A.spec.reproduction.baseline='v0.10.4 보존 + 누적 대화 요구사항 대사';A.spec.reproduction.automated='node scripts/verify-v0105.mjs';
 A.spec.verification={status:'실행 기록 및 134항목 대장 참조',date:'2026-09-21',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'미실시 · 브라우저 접근 제한 및 기존 사용자 검수 제외',interactionVerification:'실제 브라우저 조작 미실시 · 순수 JS 동작 검사만 구분',printVerification:'실제 인쇄 PDF 검수 미실시',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.5',implementation:'누적 요구사항 대사 및 수정',latestUserDecision:'전체 대화의 문제를 최신 버전 기준으로 정리하고 해결',visualQA:'미실시',sampleDataDate:A.today,runtimeConnections:'Supabase·배포·실제 AI·운영 연동 없음'};
 const revision106=[
 ['RELIABILITY-106','저장·이관 신뢰성','저장버전 충돌 차단, 중복 ID 격리, 정확 원화 입력, 원본 저장키 보존','v0.10.5 종합평가 S01·C08'],
 ['CBS-106','CBS 비교·확정 교정','복수 조정·연속 합치기·동일범위 비교, 미확보/0 구분, 총액 대사 후 통제확정','v0.10.5 종합평가 C01~C07·C09'],
 ['EDIT-106','입력 초안·검증 통일','일반폼·등록·일정·인라인의 저장/버림/계속편집과 실패 복귀, 항목별 자료 검토','v0.10.5 종합평가 U01~U05'],
 ['NAV-106','검색·이동·초점 안정화','지연검색 세대 취소, 알림 이동 승인 후 대상 적용, 문서 상세 초점 복귀','v0.10.5 종합평가 U06~U08'],
 ['REPORT-106','보고 원천·법인·장문 교정','기준일 원천버전, 시점 면적·건축계획 대사, 법인 단일원장, 재구성본과 원본 구분','v0.10.5 종합평가 R01~R05'],
 ['LAW-106','법령 수집·영향 분리','원문 중복방지와 프로젝트 관련성 재계산 분리, 과거 검토 이력과 수집 실패 보존','v0.10.5 종합평가 R06']
 ];
 features.push(...revision106);A.spec.functionalRequirements.push(...revision106.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'논리 구현·자동검사 통과 여부는 v0.10.6 수정대장 참조'})));
 A.spec.requirements.push(...revision106.map(([id,name,decision,source])=>({id,source,decision})));
 A.spec.v0106FixLedger=typeof V0106_FIX_LEDGER==='undefined'?{version:'0.10.6',items:[]}:A.clone(V0106_FIX_LEDGER);
 A.spec.meta.version='0.10.6';A.spec.meta.updatedAt='2026-09-21';
 A.spec.dataContracts.storageControl=['storageRevision','baseRevision','currentRevision','attempted','current','storageQuarantine','integrityIssues'];
 A.spec.dataContracts.reportSourceVersions=['id','projectId','path','asOf','capturedAt','rows','source','status'];
 A.spec.dataContracts.lawCollectionRuns=['id','startedAt','finishedAt','status(success/failed)','sourceCount','changeCount','error'];
 A.spec.featureContracts.reliability106={conflict:'저장 시작버전과 현재버전이 다르면 전체 상태·감사·알림을 덮어쓰지 않음. 시도본/현재본 보관 후 명시적으로 현재본 재로드.',duplicates:'중복 프로젝트·주요 원장 ID는 자동 합산하지 않고 원문 격리 및 검토표시.',money:'십진 입력 문자열을 원 단위 안전정수로 정확 변환하며 소수 원·지원범위 초과 거절.',forms:'인라인·일반폼·일정·후보검토의 초안 보호와 실패 복귀 계약 통일.',report:'보고 기준일 원천버전만 사용하고 없으면 미확보. 재구성본은 원본 제출본과 구분.',law:'수집 실행 결과와 프로젝트 관련성 계산을 분리.'};
 A.spec.productionContracts.authentication={status:'향후 구현 · v0.10.6에는 가짜 로그인 없음',identity:'회사 이메일+비밀번호',enrollment:'관리자 초대 후 본인 비밀번호 설정',m365:false,publicSignup:false,authorization:'프로젝트 멤버십·역할을 서버와 DB에서 검증',pendingDecisions:['허용 회사 도메인','초기 관리자','외부 사용자','확정·내보내기 권한','메일 발송 서비스','보존·복구 정책']};
 A.spec.acceptanceTests.push('오래된두세션저장은앞변경·감사·알림을덮지않음','중복프로젝트·계약ID원문격리와자동합산금지','원화원단위정확왕복·소수원/범위초과거절','합친항목목표금액·동일범위비교·연속이력일치','미확보/명시적0/확인총액과상세대사구분','일반폼·등록·일정저장실패입력유지와이동차단','검색예약후화면이동시필터·초점불변','과거보고에현재참여자·인허가·매각·건축계획혼입없음','법령수집실패와변경0건구분·관련성재계산이력보존');
 A.spec.history.push({version:'v0.10.6',summary:'v0.10.5 평가백로그 24건을 데이터 신뢰성 기준으로 교정. CBS 합치기·대사, 저장 충돌·중복ID, 입력 초안·검증, 보고 원천버전·법령 재분류를 보강. 자금현황 삭제 유지. 실제 화면·인쇄 검수는 미실시.'});
 A.spec.reproduction.baseline='v0.10.5 보존 + 평가백로그 24건 신뢰성 교정';A.spec.reproduction.automated='node scripts/verify-v0106.mjs';
 A.spec.verification={status:'논리검사 통과 · 실제 화면 부분 검수',date:'2026-09-21',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'실시 · 인앱 브라우저 58개 캡처, 1280×800·1440×900·1600×1000. 상세 결과는 outputs/개발사업관리플랫폼_실화면검수_v0.10.6_2026-09-21.md',interactionVerification:'주요 메뉴·하위탭·모달·Tab·Escape·초점복귀·미저장 경고 확인. 드래그·열폭조절·실제 다중탭 충돌은 미검수',printVerification:'브라우저 작성본 1·2·7쪽·7개 썸네일·빈 양식 표시 확인. 실제 저장 PDF 전 페이지 검수 미실시',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.6',implementation:'데이터·편집·보고 신뢰성 교정',latestUserDecision:'체크리스트의 실제 화면검수 항목을 전수 실행',visualQA:'주요 화면 실시 · 수정필요 VQA-01~06은 누적 체크리스트 참조',sampleDataDate:A.today,runtimeConnections:'회사 이메일 로그인·Supabase·Vercel·실제 AI·운영 연동 없음'};
 const revision107=[
 ['VQA-01','일반 텍스트 대비','세부 사업비 보조 텍스트·구성비·드래그 핸들·비활성 탭·공통 메타를 14px 일반 텍스트 4.5:1 이상으로 교정','v0.10.6 실제 화면검수'],
 ['VQA-02','평당가 표시 정밀도','내부 계산 정밀도는 유지하고 표·툴팁의 만원/평 표시를 최대 소수 1자리로 제한','v0.10.6 실제 화면검수'],
 ['VQA-03','면적 미확보 표시','과거 시점 머리글에 상태를 한 번 표시하고 셀은 대시로 단순화하되 접근성 상세에 상태 보존','v0.10.6 실제 화면검수'],
 ['VQA-04','현재 건축계획 원천','빈 관리 탭에 사업개요 자동투영을 읽기전용으로 표시하고 확정시점 동결 원천 계약 유지','v0.10.6 실제 화면검수']
 ];
 features.push(...revision107);A.spec.functionalRequirements.push(...revision107.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'코드·논리검사 반영 · 실제 화면 재검수 별도'})));
 A.spec.requirements.push(...revision107.map(([id,name,decision,source])=>({id,source,decision})));
 A.spec.v0107FixLedger=typeof V0107_FIX_LEDGER==='undefined'?{version:'0.10.7',items:[]}:A.clone(V0107_FIX_LEDGER);
 A.spec.meta.version='0.10.7';A.spec.meta.updatedAt='2026-09-29';
 A.spec.designSystem.baseColors.muted='#536a81';
 A.spec.featureContracts.v0107={contrast:'14px 일반 텍스트의 실제 전경·배경 대비 4.5:1 이상. 남색·증감색·Pretendard 24/16/14px, 400/600 유지.',unitDisplay:'평당가 내부 원정밀도 불변. 표·툴팁은 만원/평 최대 소수 1자리, 0이 아닌 0.1 미만은 별도 표시.',missingArea:'과거 시점 머리글 1회, 셀 대시, aria-label과 data-tip에는 면적 미입력 상태 보존.',buildingSource:'현재 사업개요 자동투영은 읽기전용 표시이며 reportBuildingPlans에 복제 저장하지 않음. 확정시점은 동결 배열만 사용.'};
 A.spec.acceptanceTests.push('14px 보조텍스트 실제 배경대비4.5:1 이상','평당가 내부정밀도 불변·표/툴팁 최대소수1자리','과거면적미확보 머리글1회·셀대시·접근성상태보존','현재건축계획 읽기전용원천표시·무변이·확정시점동결전용');
 A.spec.history.push({version:'v0.10.7',summary:'v0.10.6 실제 화면검수 VQA-01~04 보정. 보조 텍스트 대비, 평당가 표시 자릿수, 면적 미확보 반복, 현재 건축계획 원천 설명을 교정. 원가 계산 정밀도와 확정시점 reportBuildingPlans 동결 계약 유지.'});
 A.spec.reproduction.baseline='v0.10.6 보존 + 실제 화면검수 VQA-01~04 보정';A.spec.reproduction.automated='node scripts/verify-v0107.mjs';
 A.spec.verification={status:'논리검사·실제 화면 재검수 통과',date:'2026-09-29',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'1280×800·1440×900·1600×1000 실제 Edge 재검수 완료 · 최저 대비 4.5088:1 · 가로 넘침 0 · 캡처 .build/visual-qa-v0107',interactionVerification:'원가 표시·과거 면적 접근성 상태·보고 원천 읽기전용 행·사업개요 수정 이동 재검수 완료',printVerification:'실제 PDF 미생성 · 인쇄 검수 미실시',inAppBrowser:'자동화 런타임 setup refresh 오류로 시작 불가 · 동일 127.0.0.1 페이지를 Edge 실제 렌더링으로 대체',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.7',implementation:'실화면 VQA-01~04 보정',latestUserDecision:'표시 정밀도·접근성·보고 원천 설명을 좁게 교정하고 확정시점 동결 계약 유지',visualQA:'3개 해상도 실제 Edge 재검수 통과 · 인앱 자동화 런타임 오류는 별도 기록',sampleDataDate:A.today,runtimeConnections:'회사 이메일 로그인·Supabase·Vercel·실제 AI·운영 연동 없음'};
 const revision108=[
 ['VQA-05','남은 특수 조작 검수','행 드래그·삽입선, 열폭 포인터·키보드 연속 조절, 빈 행 삭제와 취소, 보고 오류·대량행, 두 탭 충돌을 실제 브라우저에서 확인','v0.10.7 후속 검수'],
 ['VQA-06','실제 PDF 원본 대조','국토부 제1·2호 PDF를 실제 생성하고 전 페이지 렌더·공식 원본 고정 기준점·기입란을 검증','v0.10.7 후속 검수']
 ];
 features.push(...revision108);A.spec.functionalRequirements.push(...revision108.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'v0.10.8 논리·실화면·실제 PDF 검수 기록 참조'})));
 A.spec.requirements.push(...revision108.map(([id,name,decision,source])=>({id,source,decision})));
 A.spec.v0108FixLedger=typeof V0108_FIX_LEDGER==='undefined'?{version:'0.10.8',items:[]}:A.clone(V0108_FIX_LEDGER);
 A.spec.meta.version='0.10.8';A.spec.meta.updatedAt='2026-09-29';
 A.spec.featureContracts.v0108={'VQA-05':'열폭 separator의 ArrowLeft/ArrowRight 12px 조절 뒤 동일 대상 초점 복구. 행 드래그·삭제·보고 오류·대량행·두 탭 저장 충돌을 실제 Edge에서 검수.','VQA-06':'제1·2호 실제 PDF의 공식 원본 고정 기준점 ±2pt, 머리글·날짜 기입란·선택표시·쪽번호 보존. 작성본과 대량행의 누락·넘침·전 페이지 렌더를 별도 확인.'};
 A.spec.acceptanceTests.push('열폭 separator 연속 Arrow 조절·초점 유지','VQA-05 행 드래그·삭제·보고 오류·장문·두 탭 충돌 실제 브라우저 검수','VQA-06 제1·2호 실제 PDF 공식 원본 위치 ±2pt·전 페이지 시각 검수');
 A.spec.history.push({version:'v0.10.8',summary:'VQA-05 열폭 키보드 초점 보정과 특수 조작 실화면 검수. VQA-06 국토부 제1·2호 실제 PDF의 빈 서식 행높이·고정 위치·날짜란·머리글·쪽번호를 공식 원본과 대조해 보정.'});
 A.spec.reproduction.baseline='v0.10.7 보존 + VQA-05·06 특수 조작·실제 PDF 보정';A.spec.reproduction.automated='node scripts/verify-v0108.mjs';
 A.spec.verification={status:'VQA-05·06 논리·브라우저·PDF 검수',date:'2026-09-29',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'v0.10.7 VQA-01~04 3개 해상도 Edge 검수 보존',interactionVerification:'VQA-05 원가 드래그·열폭·삭제, 보고 오류·대량행, 두 탭 저장 충돌 실제 Edge 통과',printVerification:'VQA-06 PDF 실제 생성·공식 원본 제1·2호 고정 기준점 ±2pt 통과 · 전 페이지 PNG 검수',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.8',implementation:'VQA-05·06 특수 조작 및 실제 PDF 서식 교정',latestUserDecision:'v0.10.7까지 열린 검수 항목 완료 후 새 원가·인허가·알림·보고서 UX 요구의 수정 계획 수립',visualQA:'VQA-05 실제 Edge 통과 · VQA-06 실제 PDF 공식 원본 대조 통과',sampleDataDate:A.today,runtimeConnections:'회사 이메일 로그인·Supabase·Vercel·실제 AI·운영 연동 없음'};
 const revision109=[
  ['NEXT-01','향후 직원별 로그인','회사 이메일 인증·관리자 초대·전 직원 공통 첫 이용 코드의 서버 검증. 이름·사진은 후속 단계.','사용자 2026-09-29 확정'],
  ['NEXT-02','알림 요약과 세부 팝업','사이드바 알림 건수·최근 사실, 세부 확인·이동·초점복귀','사용자 2026-09-29 요청'],
  ['NEXT-03','화면·동작 이름 정리','메뉴·탭·버튼이 실제 열리는 화면과 결과를 설명하도록 교정','사용자 2026-09-29 요청'],
  ['NEXT-04','세부 사업비 편집과 CBS','기존 분류 ID 보존, 정수 백만원 표시·1원 저장·더블클릭·삭제 진입·열폭 조절','사용자 2026-09-29 요청 및 재무모델 3개'],
  ['NEXT-05','인허가 추천·입력 교정','저장 사업유형의 추천, 부모 팝업 복귀, 2열 폼과 조치 근거 두 경로','사용자 2026-09-29 요청'],
  ['NEXT-06','개발업 등록 한 화면','법인정보·대상 검토·신고내용을 첫 진입에 펼쳐 표시','사용자 2026-09-29 요청'],
  ['NEXT-07','국토부 보고서 한 화면','보고용 초안 수정·공유 원천 이동·계획·동결 이력을 생성 화면에 통합','사용자 2026-09-29 요청']
 ];
 features.push(...revision109);A.spec.functionalRequirements.push(...revision109.map(([id,name,behavior,source])=>({id,name,behavior,source,status:id==='NEXT-01'?'운영 전환 계획 · 미구현':id==='NEXT-03'?'문구 전수 대조 진행 중':'v0.10.9 로컬 화면 구현 · 검증 기록 참조'})));
 A.spec.requirements.push(...revision109.map(([id,name,decision,source])=>({id,source,decision})));
 A.spec.v0109FixLedger=typeof V0109_FIX_LEDGER==='undefined'?{version:'0.10.9',items:[]}:A.clone(V0109_FIX_LEDGER);
 A.spec.meta.version='0.10.9';A.spec.meta.updatedAt='2026-09-29';
 A.spec.informationArchitecture=A.spec.informationArchitecture.map(item=>({...item,name:({cost:'원가 관리',permit:'인허가·사업관리',document:'계약·문서',report:'국토부 보고서'}[item.view]||item.name)}));
 A.spec.productionContracts.authentication={status:'운영 전환 후 서버 구현 · 로컬 HTML에는 로그인 없음',identity:'관리자 초대와 인증된 @igisam.com 직원 이메일',enrollment:'전 직원 공통 첫 이용 코드를 서버 비밀값으로 1회 확인한 뒤 개인 비밀번호 설정',codeStorage:'서버 비밀값만; 정적 HTML·브라우저 저장소·클라이언트 소스 금지',publicSignup:false,profile:'향후 인증된 사용자 이름·사진만 알림 아래 표시. 그룹웨어 조직도 자료 접근 및 사용범위 확인 전 수집 보류',authorization:'프로젝트 멤버십·역할을 서버와 DB에서 검증',pendingDecisions:['공통 코드 만료·교체·배포 방식','초기 관리자와 프로젝트 권한표','그룹웨어 조직도 자료 접근·사용 범위','메일 발송과 보존·복구 정책']};
 A.spec.featureContracts.v0109={notification:'하단 알림 요약 버튼과 별도 세부 팝업. 로그인 전 프로필은 숨김.',cost:'10대분류·관리 ID 보존, 표와 비교금액 정수 백만원 반올림, 입력과 저장은 원 단위 정수. 합계 묶음은 실제 입력행으로 안내.',permit:'사업유형·사업방식 저장값에서 추천, 필수표시와 근거 경로 2개, 자식 폼 취소·저장 후 부모 복귀.',registration:'법인정보·등록대상·등록신고를 한 화면에 표시.',report:'생성 화면에 원천 확인·현재 작성본 수정·토지건축 계획·동결 이력을 통합. 과거 보고 본문은 불변.',legacy:'기존 저장키·원자료·확정본과 구 보고 탭 진입 호환을 보존.'};
 A.spec.acceptanceTests.push('알림 요약→세부 팝업→관련 화면 이동과 초점복귀','원가 표 정수 백만원 표시·1원 입력 저장·더블클릭·행별 삭제 사유','주거·정비 프리셋 추천·저장·부모 팝업 복귀','인허가 조치계획 두 근거경로 독립 필수검증','개발업 등록 첫 화면 세 업무영역 노출','국토부 보고 단일 화면 현재본 수정·저장 이력·기존 본문 불변','향후 첫 이용 코드는 정적 HTML에 없음');
 A.spec.history.push({version:'v0.10.9',summary:'원가·인허가·개발업 등록·알림·국토부 보고 한 화면 UX 교정. 직원별 로그인은 운영 전환 계약만 갱신하고 이름·사진 수집은 보류.'});
 A.spec.reproduction.baseline='v0.10.8 보존 + NEXT-02~07 로컬 화면 수정';A.spec.reproduction.automated='node scripts/verify-v0109.mjs';
 A.spec.verification={status:'v0.10.9 통합 검증 기록 참조',date:'2026-09-29',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'원가·인허가·보고·알림을 실제 Edge 1280×800·1440×900·1600×1000에서 검수. 통합 결과는 별도 검수기록 참조.',interactionVerification:'신규 TDD 및 기존 28개 검사군에 원가 편집·프리셋 저장·팝업 복귀·보고 현재본 수정·알림 세부 이동을 추가.',printVerification:'v0.10.9 실제 PDF 제1·2호 5종 75쪽 및 공식 원본 13개 기준점 대조 결과는 별도 검수기록 참조.',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.9',implementation:'NEXT-02~07 로컬 화면 UX 수정 · NEXT-01 운영 인증은 미구현',latestUserDecision:'첫 이용 코드는 전 직원 공통, 직원 이름·사진과 그룹웨어 조직도 확인은 후속 단계',visualQA:'신규 화면별 실제 Edge 검수와 통합 검수 기록 참조',sampleDataDate:A.today,runtimeConnections:'회사 이메일 로그인·Supabase·Vercel·실제 AI·운영 연동 없음'};
 const revision110=[
  ['REV110-01','원가항목 열 너비 조절','원가항목 열의 포인터·키보드 조절과 저장·재로드','2026-09-29 사용자 추가 요청 1'],
  ['REV110-02','원가행 바로 아래 편집·취소','합계 묶음 편집을 선택 행 아래에 표시, 강제스크롤 제거, 취소 후 완전 닫기·원값 보존','2026-09-29 사용자 추가 요청 1'],
  ['REV110-03','CBS 재무모델 원천 대조','세 모델 시트·행→CBS 매핑과 대분류/세부행 반영 수준, 합산 제외 근거','2026-09-29 사용자 추가 요청 1'],
  ['REV110-04','인허가 필수와 연결 관계','근거법령·담당자·연결대상만 선택. 근거문서 필수, 미발생 날짜 상태, 세 연결관계 방향·순환 검증','2026-09-29 사용자 추가 요청 2'],
  ['REV110-05','개발업 등록 신청정보','공식 별지1호 작성정보 및 시행규칙 제3조 첨부·행정정보 확인을 대응','2026-09-29 사용자 추가 요청 3'],
  ['REV110-06','보고 양식형 현재본 편집','원천/수정 영역 기본 닫힘, 실제 출력 양식 모델을 재사용한 편집·출력 반영','2026-09-29 사용자 추가 요청 4'],
  ['REV110-07','공식 법령 2026-09-29 갱신','법률·시행령·시행규칙174개와 사업지조례8개 원문, 공포/단계별시행일·기존 검토이력 보존','2026-09-29 사용자 추가 요청 5'],
  ['REV110-08','현재 명세·체크리스트 동기화','구현·검사·법령 확인 범위를 현재 버전의 명세·Markdown·Excel에 반영','2026-09-29 사용자 추가 요청 5']
 ];
 features.push(...revision110);A.spec.functionalRequirements.push(...revision110.map(([id,name,behavior,source])=>({id,name,behavior,source,status:'v0.10.10 수정대장과 실행 검증 기록 참조'})));A.spec.requirements.push(...revision110.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.v0110FixLedger=typeof V0110_FIX_LEDGER==='undefined'?{version:'0.10.10',items:[]}:A.clone(V0110_FIX_LEDGER);
 A.spec.meta.version='0.10.10';A.spec.meta.updatedAt='2026-09-29';
 A.spec.featureContracts.v0110={cost:'원가항목 열180~560px, 포인터/키보드 조절 후 저장. 합계 묶음은 행 바로 아래 실제 입력항목 편집. 취소는 선택/초안을 닫고 원장·감사 불변.',cbs:'세 모델의 주요 경제 범위는 현행10대분류로 대응. 모든 엑셀 leaf를 기본항목으로 가져온 것은 아니며 프로젝트 전용행과 소계·배부·재분류를 구분.',permits:'선택항목은 근거법령·담당자·세 연결대상. 나머지 필수 항목은 값 또는 명시적인 미발생/해당없음 상태를 확인. sourcePath/backDataPath 독립 필수.',registration:'최신 공식 별지1호 신청필드와 첨부·공동이용 확인항목을 관리. 법인 공통정보와 사업별 대상검토 분리.',report:'원천/현재 작성본 수정영역 기본 접힘. 출력 모델의 섹션·표·단위를 재사용한 현재본 편집. 동결 보고 본문 불변.',law:'공식 자료 기본, 샘플 선택 보기. 조회 기준일은 2026-09-29, 공포건 유일성 및 단계별 시행일 보존. 원문 버전 확인과 개별 조문 적용검토 구분.'};
 A.spec.dataContracts.permits.push('plannedApplicationState','expectedState','applicationState','supplementState','approvalState','deemedBy','predecessorId','amendsId','completionState','actionItems[].deadlineState');
 A.spec.dataContracts.registrationApplication=['representativeName','phone','applicantNationalityType','countryName','foreignInvestmentAmount','foreignInvestmentRatio','officeTenure','applicationDate','applicantSignState','recipientAgency','applicationFormPath','sensitiveIdentityEvidencePath','feeState','manager','managerOffice','managerPhone','contractPath','registrationDocuments[id].state/path'];
 A.spec.dataContracts.reportDraftOverrides=['id','type','date','stageId','values[section.field]','createdAt','updatedAt'];
 A.spec.dataContracts.viewPreferences.push('reportDraftSettings[projectId].type/date/stageId','report-v0110-source/edit/plans/history');
 A.spec.featureContracts.v0110.report='원천/수정영역 기본 닫힘. 실제 출력 블록·행·병합·반복행 재사용. 보고 전용 값은 선택한 종류·기준일·사업비시점의 draft override로 저장하여 과거 기준일도 작성·보완 가능. 공유 원장·확정 사업비 원천·저장 canonical은 불변이며 다른 작성본에 혼입하지 않음.';
 A.spec.dataContracts.lawSource=['version','checkedAt','dataDate','sources','coverage','catalog[].id/name/currentVersion/announcedAt/effectiveAt/officialUrl/availableVersions','changes[].id/lawId/lawNumber/announcedAt/effectiveDates/versions/officialUrl/amendmentText/amendmentUrl'];
 const lawSnapshot=typeof LAW_SOURCE_V0110==='undefined'?null:LAW_SOURCE_V0110;A.spec.legalSourceSnapshot=lawSnapshot?{version:lawSnapshot.version,checkedAt:lawSnapshot.checkedAt,dataDate:lawSnapshot.dataDate,coverage:lawSnapshot.coverage,catalogCount:lawSnapshot.catalog.length,changeCount:lawSnapshot.changes.length,sources:lawSnapshot.sources}:null;
 A.spec.acceptanceTests.push('원가항목 열폭 포인터·키보드·저장·재로드','원가행 아래 편집·dirty 취소 닫기·실패 입력 유지','인허가 필수누락과 미발생 상태·연결방향/순환/삭제 검증','개발업 신청서 공식 필드·첨부서류 대응','보고 양식형 편집 저장→최종 출력·과거 동결불변','공식 법령 lexical 상수 주입·182원문·오늘기준·다중시행·중복방지·검토메모 보존');
 A.spec.history.push({version:'v0.10.10',summary:'사용자 재현 결함 수정: 원가항목 열폭, 행 옆 편집과 취소, CBS 원천 대조, 인허가 필수·연결, 등록 신청정보 보완, 보고 양식형 편집·기본 접힘, 2026-09-29 공식 법령 갱신.'});
 A.spec.reproduction.automated='node scripts/verify-v0110.mjs';A.spec.reproduction.baseline='v0.10.9 보존 + 사용자 추가 요청 5개 분야 재현·보완';
 A.spec.verification={status:'v0.10.10 실행 기록 참조',date:'2026-09-29',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'1280×800·1440×900·1600×1000 실제 Edge 증거는 .build/v0110-cost, .build/v0110-report, .build/permit-v0110에 기록',interactionVerification:'원가 열폭·행 편집·취소·실패복구, 인허가 필수·연결, 등록 신청정보, 보고 양식형 편집의 실제 행동 검증',printVerification:'보고 편집→현재본 반영과 공식 PDF 위치·저장본 불변을 별도 검증',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.10',implementation:'사용자 5개 분야 수정·공식 법령 확인·현재 명세 반영',latestUserDecision:'원가항목 열폭·같은위치 편집, 인허가 필수확대, 등록 공식서식 대조, 양식형 보고편집, 오늘 기준 법령',visualQA:'수정대장과 v0.10.10 검수기록 참조',sampleDataDate:A.today,lawDataDate:lawSnapshot?.dataDate||null,runtimeConnections:'로컬 HTML · 회사 로그인·DB·배포·그룹웨어는 후속 단계'};
 A.spec.legacyReferences.registrationWorkflow103=A.clone(A.spec.featureContracts.legal.registrationWorkflow);
 A.spec.featureContracts.legal.registrationWorkflow={version:'0.10.10',firstView:['법인정보','등록 대상 여부','신규등록 신청서 작성·검토','첨부서류 준비 현황','등록·신고 이력'],navigation:'첫 화면에서 전부 확인하며 수정 버튼으로 해당 원장을 편집. 별지1호 신청항목·SPC 관리회사 소재지/전화·첨부13종 상태/경로를 제공.',records:'법인 공통 신청정보와 프로젝트 대상검토, 신고/변경이력 독립 보존.',boundaries:'저장은 전자신고 접수가 아니며 민감 개인 식별번호는 원본 증빙 경로와 확인상태로 관리.'};
 A.spec.featureContracts.legal.conditionActions='permit.actionItems[]의 조건·조치계획·상태·기한 또는 기한상태·두 근거 경로는 필수, 담당자는 선택. 기존 보존자료는 보완 필요로 표시하며 수정 시 현재 저장조건을 검증.';
 for(const [id,behavior] of [['PERMIT-02','조건·조치계획·상태·기한/명시상태·요청공문/조치자료 두 경로 필수, 담당자 선택'],['REG-01','공식 신규등록 신청서·SPC 관리회사·첨부서류 준비와 프로젝트별 대상 검토·신고 이력']]){const feature=features.find(row=>row[0]===id);if(feature)feature[2]=behavior;const requirement=A.spec.functionalRequirements.find(row=>row.id===id);if(requirement){requirement.behavior=behavior;requirement.status='v0.10.10 계약으로 갱신';}}
 const revision111=[
 ['REV111-01','첫 세부탭 진입','주 메뉴·새로고침은 첫 탭, 명시적 목적지와 프로젝트 전환은 문맥 유지'],
 ['REV111-02','같은 셀 원가 편집','실제 말단만 같은 셀에서 원 단위 입력·저장·취소, 부모 자동 합계, 중간 입력표 없음'],
 ['REV111-03','CBS 초기항목 재구성','10대분류 실제 관리행·원자료행 노출, 공통/선택 분리, 기존 ID·금액·확정시점 보존'],
 ['REV111-04','확인총액 자료 보존','기존 총액·근거 유지, 상세 초과 차단, 완전 일치 시 명시적 상세합계 적용'],
 ['REV111-05','원가 열폭·삭제·이력','원가항목 열 포함 폭 조절, 회색 경계, 실제 입력행 삭제·이력, 최초UW 불변'],
 ['REV111-06','인허가 날짜 필수입력','5날짜와 조치기한 직접 필수, 날짜상태·그룹 설명 제거, 기존 빈값 자동생성 금지'],
 ['REV111-07','추천 입력과 팝업 복귀','추천 후보는 원장 밖 입력초안, 필수값 충족 항목만 저장, 취소/X/Escape 직전 화면 복귀'],
 ['REV111-08','등록 조회와 단일 입력팝업','등록상태·등록정보만 조회, 수동 상태, 자동대상·하한판정·면적·첨부준비 제거, 숨긴 자료 보존'],
 ['REV111-09','보고 전체 셀 수정','문구·제목·값·합계·빈칸·반복·동결 표시까지 같은 양식에서 수정, 저장 전 버퍼만 변경'],
 ['REV111-10','보고 선택 저장·동기화','변경 후 저장에서 보고서만/플랫폼 반영 선택, 검증된 1:1 연결만 동기화, 충돌·실패 일괄 원복'],
 ['REV111-11','보고 출력과 버전 보존','안정적 셀 ID와 작성본 격리, 기존 자료 읽기 호환, 저장본 불변, 수정값 미리보기·PDF 일치'],
 ['REV111-12','검수와 명세·Excel 동기화','실패검사·전체회귀·3해상도 실제 화면·제1/2호 PDF, 같은 ID/상태로 Markdown·Excel 일치']
 ];
 A.spec.v0111FixLedger=typeof V0111_FIX_LEDGER==='undefined'?{version:'0.10.11',items:[]}:A.clone(V0111_FIX_LEDGER);
 const superseded111={'REV110-02':'REV111-02','REV110-04':'REV111-06','REV110-05':'REV111-08','REV110-06':'REV111-09','NEXT-06':'REV111-08','REG-103':'REV111-08','CBS-103':'REV111-03'};
 for(const [id,replacement]of Object.entries(superseded111)){const prior=A.spec.functionalRequirements.find(x=>x.id===id);if(prior){A.spec.supersededRequirements.push({...prior,status:'v0.10.11 승인 변경으로 대체',replacement});prior.status='대체됨: '+replacement;}}
 features.push(...revision111.map(([id,name,behavior])=>[id,name,behavior,'2026-09-30 사용자 승인 계획']));
 A.spec.functionalRequirements.push(...revision111.map(([id,name,behavior])=>({id,name,behavior,source:'2026-09-30 사용자 승인 계획',status:A.spec.v0111FixLedger.items.find(x=>x.id===id)?.status||'구현·검수 진행 중'})));
 A.spec.requirements.push(...revision111.map(([id,name,decision])=>({id,name,decision,source:'2026-09-30 사용자 승인 계획'})));
 A.spec.meta.version='0.10.11';A.spec.meta.updatedAt='2026-09-30';
 A.spec.featureContracts.v0111={navigation:'메뉴/새로고침 첫 탭, 명시적 목적지/프로젝트 변경 문맥 보존',inline:'toolsPlacement=cell 및 commitLabel. 셀 안 수정·입력·저장/취소. 보고 적용은 버퍼만 갱신.',cost:'실제 입력행 같은 표, 부모 자동 합계, 공통 초기항목 표시·사업별 선택 추가. 정확 원 저장/정수 백만원 표시.',registration:'수동 등록상태+등록정보 조회와 단일 팝업. 자격판정·신청서/첨부/연도별면적 UI 없음.',report:'전체 표시내용 편집. 변경 후 저장에서 보고서 전용/플랫폼 동기화 선택. 비연결·동결 표시값은 보고서에만 저장.'};
 A.spec.featureContracts.legal.registrationWorkflow={version:'0.10.11',firstView:['등록 상태','등록정보'],navigation:'단일 등록정보 입력/수정 팝업. 자동 등록대상 판단과 연도별면적·첨부준비·신청서 검토를 노출하지 않는다.',records:'기존 entity/registrationReview/notices/changes/documents 감사자료 보존. 노출된 값만 병합.',validation:'등록완료 시 등록번호/일/관할기관/증빙 필수. 자본금·인력은 숫자형식만 검사하며 법정 하한판정은 하지 않는다.'};
 A.spec.featureContracts.legal.registration='등록 여부는 담당팀 수동 입력. 자동 등록대상·자본금/인력 하한판정은 활성 화면·저장조건에서 제거. 과거 근거·검토는 보존.';
 A.spec.featureContracts.legal.conditionActions='조건·조치계획·상태·조치기한·두 근거경로는 필수, 담당자는 선택. 입력여부 선택 및 그룹 안내문 없음.';
 A.spec.featureContracts.legal.permits='계획신청/목표완료/실제신청/보완요청/승인 날짜 모두 필수. 법령/담당자/세 연결대상만 선택. 추천은 초안 prefill 후 일반 필수검증. 기존 날짜상태는 보관만.';
 for(const [id,behavior]of [['REG-01','등록 상태·등록정보 조회와 단일 팝업. 등록 여부는 담당팀 수동 입력, 등록완료 필수4항목. 자동 대상/하한판정·면적·신청서·첨부준비 UI 없음. 숨긴 이전 기록 보존.'],['PERMIT-02','조건·조치계획·상태·조치기한·요청공문/조치자료 두 경로 필수, 담당자 선택. 입력 여부·그룹 설명 제거.']]){const feature=features.find(row=>row[0]===id);if(feature)feature[2]=behavior;const requirement=A.spec.functionalRequirements.find(row=>row.id===id);if(requirement){requirement.behavior=behavior;requirement.status='v0.10.11 계약으로 갱신';}}
 A.spec.costRules.hierarchy='10대분류→실제 관리행→원자료/분해/미분해 실제말단. 부모/소계 편집불가, 신규 자동 차이조정·비례배분 없음. 기존 확인총액 증거는 명시 대사까지 보존.';
 A.spec.dataContracts.viewPreferences.push('inline.toolsPlacement(cell/floating)','inline.commitLabel','첫 메뉴 탭 초기화는 업무원장과 분리');
 A.spec.dataContracts.reportDraftOverrides.push('schemaVersion','cellOverrides[stableCellId]','revision','supersedesId');
 A.spec.dataContracts.reportEditBuffer=['projectId','type','date','stageId','cellId','before','after','baseOwnerHash','baseDraftUpdatedAt','baseStorageRevision'];
 A.spec.dataContracts.managementItems.push('cbsCatalogVersion','catalogTier','costReclassification','signedAdjustment','reclassificationKey');
 A.spec.dataContracts.reportEditBuffer=['context(type/date/stageId)','values[logicalCellId]','bases[logicalCellId]','ownerBases[logicalCellId]','baseStorageRevision','createdAt','updatedAt'];
 A.spec.dataContracts.reportLayout.push('cellId','originCellId','DOM instance(page/fragment/segment)','cellOverrides[logicalCellId]');
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!/(원가행 아래|행 편집·dirty|미발생 상태|기한\/명시상태|첨부서류 대응|개발업 등록 첫 화면 세 업무|45기본항목)/.test(x));
 A.spec.acceptanceTests.push(...revision111.map(([id,name,behavior])=>id+' '+behavior));
 A.spec.history.push({version:'v0.10.11',summary:'메뉴 첫 탭·실제 원가행 같은 셀 입력·CBS 공통/선택 재구성·인허가 날짜 필수·등록 조회/단일 팝업·보고 전체 셀 수정/선택 동기화. 과거 원자료·확정본·보고저장본 보존.'});
 A.spec.reproduction.automated='node scripts/verify-v0111.mjs';A.spec.reproduction.baseline='v0.10.10 원자료·계산·동결 보존 + v0.10.11 승인 UX 대체';
 A.spec.verification={status:'v0.10.11 실행 기록 참조',date:'2026-09-30',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'v0.10.11 검수기록에서 실행/미실행 구분',interactionVerification:'실제 같은 셀·추천·등록팝업·보고 저장 선택 검사 결과 참조',printVerification:'제1·2호 공식위치 및 편집값 PDF 검수 결과 참조',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.11',implementation:'사용자 승인 화면·입력 계약 적용',latestUserDecision:'세부항목 편집·자동합계, 공통/선택 분리, 보고 전체셀 편집과 연결값만 플랫폼 동기화',visualQA:'v0.10.11 검수기록 참조',sampleDataDate:A.today,lawDataDate:lawSnapshot?.dataDate||null,runtimeConnections:'로컬 HTML. 로그인·DB·배포·그룹웨어 후속 단계'};
 const revision112=[
 ['REV112-01','전문인력 명단','이름·소속·자격/경력·교육·재직/등록상태·증빙경로 직접 기록, 1인 팝업·퇴사/복구·감사'],
 ['REV112-02','등록정보와 명단수 구분','기관담당자/연락처/최근 변경신고 제출일. 수동 등록인원 보존, 이름 입력/현재명단 별도 표시, 보고snapshot 개인명단 제외'],
 ['REV112-03','모델 수준 사업비표','원본3모델의 비용 항목을 CBS와 대응, 공종·시설·상품·차수 세부를 기본표에서 제외'],
 ['REV112-04','CBS 분류표 확인','내려받기 오른쪽 버튼, 포함/미포함/금액입력/확인필요, 표에서보기·테이블에추가·중복차단'],
 ['REV112-05','기존 금액 관리계약 보존','기존 실제leaf/자동합계·원자료·금액·ID·계약배부·VAT·확정본 유지. 총액 독립예산 전환은 승인전 보류'],
 ['REV112-06','결과별 복수 조치계획','결과 구분/내용/일/공문과 별도 계획 내용/담당/기한/상태/이행자료 1:N, 결과만 먼저 저장 가능'],
 ['REV112-07','인허가·보고 호환','기본폼 전역조치 제거·5날짜 유지, legacy 무변이읽기·결과일 추정금지·보고flat·과거canonical 불변'],
 ['REV112-08','검수·현재 명세·Excel','실패검사→전체회귀→실제3해상도·보고영향·누적대장/체크리스트/Excel 같은 ID·상태·근거'],
 ['REV112-09','보고서 행동 중심 화면','내용수정·미리보기/인쇄·작성본저장 주CTA와 기재자료/토지건물계획/저장보고서 관리팝업, 네접이식제거·기존편집보호']
 ];
 A.spec.v0112FixLedger=typeof V0112_FIX_LEDGER==='undefined'?{version:'0.10.12',items:[]}:A.clone(V0112_FIX_LEDGER);
 features.push(...revision112.map(([id,name,behavior])=>[id,name,behavior,'2026-09-30 현재 사용자 요청 및 추가 첨부 화면']));
 A.spec.functionalRequirements.push(...revision112.map(([id,name,behavior])=>({id,name,behavior,source:'2026-09-30 사용자 요청',status:A.spec.v0112FixLedger.items.find(item=>item.id===id)?.status||'구현·검수 진행 중'})));
 A.spec.requirements.push(...revision112.map(([id,name,decision])=>({id,name,decision,source:'2026-09-30 사용자 요청'})));
 for(const [id,replacement]of Object.entries({'REV111-03':'REV112-03','REV111-06':'REV112-07','REV111-07':'REV112-07','REV111-08':'REV112-01','REV111-09':'REV112-09'})){const previous=A.spec.functionalRequirements.find(item=>item.id===id);if(previous){A.spec.supersededRequirements.push({...previous,status:'v0.10.12 사용자 추가 수정으로 대체',replacement});previous.status='추가 수정: '+replacement;}}
 A.spec.meta.version='0.10.12';A.spec.meta.updatedAt='2026-09-30';
 A.spec.featureContracts.v0112={registration:'전문인력 개별 명단과 수동 등록인원을 구분, 날짜/상태/증빙관리. 자동법요건판정·민감식별값·실제직원조회 없음.',cost:'엑셀 모델 비용 수준으로 표시를 압축하며 기존 금액관리계약은 유지. CBS포함여부 popup과 항목추가.',permit:'기존 actionItems ID 유지 및 plans[] 1:N. 결과만 기록가능, 이전원문/계획은synthetic읽기보존, 복합보고셀report-only.',report:'상단3주버튼과 보조3관리버튼. 네접이식제목 제거. 같은페이지본문편집·기존미저장/동기화/과거보고보호 유지.'};
 A.spec.featureContracts.legal.registrationWorkflow.professionals='professionalRecords 개별명단. 수동 professionals 덮어쓰기없음. 등록인원/이름입력/현재명단수 분리. 재직/휴직 일반수정, 퇴사는 전용 보존처리/이력/복구로 통일. legacy퇴사 조회보존. 직원그룹웨어/법정자격자동인정 없음.';
 A.spec.featureContracts.legal.registrationWorkflow.version='0.10.12';
 for(const [id,behavior]of [['REG-01','등록상태·정보 조회와 단일 입력팝업, 전문인력 명단은 개인별 팝업. 수동 등록인원 유지, 기관담당/변경신고일 관리. 자동대상/하한판정 없음.'],['PERMIT-02','인허가 결과별 구분·내용·결과일·공문과 복수 조치계획을 분리. 조치계획 내용·기한·상태·이행자료 필수, 담당자 선택, 결과만 먼저 저장 가능.']]){const feature=features.find(row=>row[0]===id);if(feature)feature[2]=behavior;const requirement=A.spec.functionalRequirements.find(row=>row.id===id);if(requirement){requirement.behavior=behavior;requirement.status='v0.10.12 계약으로 갱신';}}
 A.spec.featureContracts.legal.conditionActions='결과 항목은 구분/내용/결과일/공문경로, plans는내용/기한/상태/이행자료경로 필수·담당자선택. 결과0계획허용, 결과/계획 개별CRUD.';
 A.spec.dataContracts.registrationProfessionals=['entity.professionalRecords[].id/name/company/qualification/career','preEducationDate/recentTrainingDate','employmentStatus/registrationStatus','employmentStartDate/employmentEndDate/registrationStartDate/registrationEndDate','evidencePath/createdAt/updatedAt/deletedAt','entity.professionals(manual)','agencyContactName/agencyContactPhone/lastChangeReportDate'];
 A.spec.dataContracts.permitResults=['permit.actionItems[].id/resultCategory/title/date/sourcePath/plansVersion','plans[].id/resultItemId/actionPlan/owner/deadline/status/backDataPath/deletedAt','legacy singleton read-only synthetic plan','reportResultPlans flat sourceKey/permitId/resultId/planId'];
 A.spec.featureContracts.report.workspace112='주 작업: 보고서 내용 수정(현재페이지 기본숨김 A4 편집기)/미리보기·인쇄/PDF/작성본저장. 보조: 기재자료확인/토지·건물계획관리/저장한보고서보기 팝업. 원천/소유 같은 내부용어 제거.';
 A.spec.featureContracts.v0112.costBudgetAuthority='모델 총액을 독립 예산으로 전환하는 이관은 사용자의 명시 승인 전 구현하지 않음. 기존 금액/상세합계 원장계약 유지.';
 Object.assign(A.spec.featureContracts.CBS,{version:'v0.10.12',defaultView:'공통항목과 현재 사용/선택된 모델 비용항목을 표시. 공종·시설·상품·차수 원자료는 기본표에서 제외하고 원자료 확인으로 보존.',editing:'기존 단일 실제 leaf는 분류 확인 필요여도 같은 셀에서 수정. 복수행·자식이 있는 모델 표시행은 자동합계 읽기전용. 총액 독립예산 이관·자동 차이조정·비례배분 없음.',modelCostCatalog:A.clone(A.costModelCatalog||[]),catalogPopup:'내려받기 오른쪽 CBS 분류표 확인. 포함·금액 입력/포함·미입력/미포함/확인 필요와 대표 원천·표에서 보기·테이블에 추가. 기존 addCost/template 경로와 중복차단 사용.'});
 A.spec.costRules.hierarchy='저장 원장은 기존 10대분류·실제 관리행·원자료/말단 ID를 유지. 기본표만 모델 비용 수준으로 압축하고 원자료는 조회로 보존. 실제 단일 leaf 편집과 부모 자동합계 유지.';
 A.spec.dataContracts.costModelDisplay=['costModelCatalog: source-backed read-only definitions','costDisplayGroups: existing managementIds projection, no new money owner','costModelCatalogRows: included/status/sourceRefs','catalogSelected: explicit standard template selection'];
 A.spec.legacyReferences.acceptanceBefore112=A.spec.acceptanceTests.filter(item=>/^REV111-(03|08|09)\b/.test(item));
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(item=>!/^REV111-(03|08|09)\b/.test(item));
 A.spec.acceptanceTests.push(...revision112.map(([id,name,behavior])=>id+' '+behavior));
 A.spec.history.push({version:'v0.10.12',summary:'전문인력 명단/등록관리정보, 모델수준 사업비 표시와CBS분류표, 인허가 결과별계획, 보고서 행동중심 작업화면. 기존금액·과거본문·개인정보경계 보존.'});
 A.spec.reproduction.automated='node scripts/verify-v0112.mjs';A.spec.reproduction.baseline='v0.10.11 보존+현재3요청/추가보고화면 교정';
 A.spec.verification={status:'v0.10.12 실행 기록 참조',date:'2026-09-30',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'v0.10.12 신규 화면 실제Edge 증거 참조',interactionVerification:'전문인력·CBS분류표·결과/계획·보고주CTA/팝업 및 같은 셀·보고 저장 보호 실제 동작',printVerification:'제1·2호 공식위치·수정내용 PDF 영향 별도 검사',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.12',implementation:'사용자 현재 요청 및 추가 보고 화면 교정',latestUserDecision:'전문인력 명단, 모델수준 비용과CBS표, 결과별계획, 보고화면 affordance',visualQA:'v0.10.12 검수기록 참조',sampleDataDate:A.today,lawDataDate:lawSnapshot?.dataDate||null,runtimeConnections:'로컬HTML. 운영로그인/DB/배포/실제직원·그룹웨어조회 없음'};
 const revision113=[
 ['REV113-01','보고 양식 안의 계획 입력','별도 토지·건물 계획관리 버튼 제거, 해당 양식 구간의 내용/행을 수정하고 기존 보고서만/플랫폼 선택 저장 유지'],
 ['REV113-02','계약·문서 한 목록','두 세부탭 제거, 같은 목록에서 검색/추가/수정/버전조회, 계약 원본 경로는 목록/상세 상단에 바로 표시'],
 ['REV113-03','인허가 수정 안의 결과·계획','한 수정 팝업에서 결과별 그룹과 여러 조치계획 입력, 초안/필수검증/일괄저장/취소/legacy·ID 보존'],
 ['REV113-04','원가행 태그 제거','자동합계/분류확인/과거항목 상시태그 제거. 내부 계산·분류표 상태와 입력 권한 보존'],
 ['REV113-05','열폭 확대 교정','선언/실제/저장 열폭 일치, 클릭/0px/1px/좁은표·접힘·드래그·키보드·재로드 검증'],
 ['REV113-06','전문인력 우선 배치','긴 등록정보보다 명단·추가버튼 먼저 표시. 수동 등록인원·개별입력·퇴사/복구 보존'],
 ['REV113-07','실제 닫기와 초안 보호','본문 출발은 본문 복귀, 실제 부모만 복귀, dirty 확인 닫기의 편집재개 루프 제거·초안 보존, 비폼 팝업 세션 분리'],
 ['REV113-08','사용자흐름 검수·동기화','현재 요구 실패 재현/전체회귀/3해상도 Edge/PDF/명세/대장/체크리스트/Excel ID·상태 동기화']
 ];
 A.spec.v0113FixLedger=typeof V0113_FIX_LEDGER==='undefined'?{version:'0.10.13',items:[]}:A.clone(V0113_FIX_LEDGER);
 features.push(...revision113.map(([id,name,behavior])=>[id,name,behavior,'2026-09-30 모두 수정 요청']));
 A.spec.requirements.push(...revision113.map(([id,name,decision])=>({id,name,decision,source:'2026-09-30 모두 수정 요청'})));
 A.spec.functionalRequirements.push(...revision113.map(([id,name,behavior])=>({id,name,behavior,source:'2026-09-30 모두 수정 요청',status:A.spec.v0113FixLedger.items.find(item=>item.id===id)?.status||'구현·검수 진행 중'})));
 for(const [id,replacement]of Object.entries({'REV112-01':'REV113-06','REV112-03':'REV113-04','REV112-06':'REV113-03','REV112-09':'REV113-01','REV111-05':'REV113-05'})){const previous=A.spec.functionalRequirements.find(item=>item.id===id);if(previous){A.spec.supersededRequirements.push({...previous,status:'v0.10.13 사용자 화면 교정으로 보완',replacement});previous.status='화면 교정: '+replacement;}}
 A.spec.meta.version='0.10.13';A.spec.meta.updatedAt='2026-09-30';
 A.spec.featureContracts.v0113={report:'토지/건물 별도관리 버튼 없음. 계획은 실제 보고 양식 구간에서 수정하며 기존 선택 저장/원본 보존 유지.',documents:'계약·문서 단일 목록과 구분 검색. 계약 금액/지급과 문서 버전은 내부 보존, 원본 경로 직접 표시·보조 복사.',permit:'한 인허가 수정 문맥의 결과 그룹/계획행. 별도 결과→계획 중첩 폼 제거, 원장 밖 초안과 원자 저장.',cost:'원가행 상태태그 없음. col 합계와 표/사용자저장폭 일치, 자동합계·단일 leaf 권한은 기존대로.',registration:'전문인력 명단을 등록 긴 표보다 먼저 표시.',close:'본문/실제부모를 구분하고 종료·계속입력·저장/버림을 구분. 확인창 닫기는 초안보존 종료. 비폼에 stale 폼세션 남기지 않음.'};
 A.spec.featureContracts.CBS.version='v0.10.13';A.spec.featureContracts.CBS.columns='각 col 선언폭 합계가 표폭, 부모 맞춤 확대로 열폭 재분배 없음. 원가항목 드래그/키보드는 사용자 저장폭 기준. 원 단위 저장/정수 백만원 표시 유지.';
 A.spec.featureContracts.CBS.statusDisplay='원가행 자동합계/분류확인/과거항목 상시태그 제거. 분류표·기존 원장/이력의 상태는 유지.';
 A.spec.featureContracts.contracts.documentsV0113='세부탭 없는 한 목록. 계약/문서 구분·공통검색·원본 경로 표시·보조 복사·문서 선택/버전/초점/스크롤. 계약 상세 6조건과 금액/지급 원장 유지.';
 A.spec.featureContracts.legal.registrationWorkflow.version='0.10.13';A.spec.featureContracts.legal.registrationWorkflow.firstView=['등록 상태','전문인력 명단','등록정보'];
 A.spec.featureContracts.legal.conditionActions='인허가 수정 단일폼에서 결과별 그룹과 복수 계획 초안 작성. 결과 구분/내용/일/공문 및 계획 내용/기한/상태/이행자료 필수, 담당 선택, 기존자료 보존·일괄 검증 저장.';
 A.spec.featureContracts.report.workspace113='내용 수정·미리보기/인쇄/PDF·작성본 저장 및 기재자료/저장보고서 보조버튼. 토지·건물 계획은 양식 해당 구간, 독립 관리버튼/팝업 없음.';
 A.spec.dataContracts.viewPreferences.push('librarySearch/libraryKind/documentDetailOpen','form origin: main page or actual parent modal','item resize: declared column pixels');
 A.spec.dataContracts.reportPlanRowOverrides={version:3,storage:'reportDraftOverrides[].planRowOverrides.{reportLandPlan|reportBuildingPlans}',context:'type/date/stageId별 작성본',session:'planRows/planBases/planOwnerBases',compatibility:'기존 values/cellOverrides 유지',platform:'표시된 base→after ID차이만 전체원장 merge/softdelete, 미래·필터밖·기삭제·unknownmetadata 보존, 충돌/실패 원자원복',frozen:'확정시점 구조변경은 보고서 전용'};
 A.spec.dataContracts.formDraftContext='폼을 열기 전 현재 opener identity와 명시 stable record ID/context로 초안 격리. 부모 opener의 전역 identity를 새 자식폼에 재사용하지 않음. 구 충돌키는 자동삭제/이관/복원하지 않음.';
 A.spec.history.push({version:'v0.10.13',summary:'불필요 관리버튼/세부탭/원가태그 제거, 원본 경로 표시, 인허가 한 수정폼 결과/계획, 열폭 확대와 닫기 반복 교정, 전문인력 우선배치.'});
 A.spec.reproduction.automated='node scripts/verify-v0113.mjs';A.spec.reproduction.baseline='v0.10.12 자료 보존 및 v0.10.13 실제 사용자흐름 교정';
 A.spec.acceptanceTests.push(...revision113.map(([id,name,behavior])=>id+' '+behavior));
 A.spec.verification={status:'v0.10.13 실행 기록 참조',date:'2026-09-30',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'세 해상도 현재 화면 검수 기록 참조',interactionVerification:'동일 문맥 입력·실제 닫기·초안 보호·열폭/클릭·경로 가시성·보고 저장 선택',printVerification:'공식위치·수정값·행 구조 PDF 별도 검사',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.13',implementation:'현재 진단한 사용자 화면 문제 교정',latestUserDecision:'불필요 분리와 상시태그 제거, 한 화면 입력·실제 닫기·열폭 정상화',visualQA:'v0.10.13 검수기록 참조',sampleDataDate:A.today,lawDataDate:lawSnapshot?.dataDate||null,runtimeConnections:'로컬 HTML. 운영 연결/직원 조회/독립 합계예산 전환 추가 없음'};
 const revision114=[['REV114-01','계약·문서 한 줄 표','날짜·수정/삭제·경로/복사 같은 줄, 제목 폭 재분배, 긴 값 원문·조회 보존'],['REV114-02','검토의견 기반 조치계획','연결 인허가 위 조치계획, 검토의견 유형/내용/통보일/문서와 조치내용/기한/진행/자료 구분, 심의·협의 선택 분리 및 기존값 보존'],['REV114-03','사업비 제목·열폭 교정','한 줄 제목·금액, 정적 헤더 설명 제거·실제 짧은 날짜만 표시, 사용자 열폭·계산·미확보 상태 보존'],['REV114-04','전체 설명·중복 태그 제거','탭/팝업/하위 컴포넌트 정적 도움말·중복태그 감사. 데이터·필수오류·충돌·미저장/삭제확인·법정 양식 원문 보존'],['REV114-05','실제 화면·회귀 검수','한 줄 실제 위치·세 해상도·긴값/큰금액·팝업 저장/취소·초안·공식 PDF 검수'],['REV114-06','명세·체크리스트 동기화','현재 계약·리서치·문구감사·대장·Markdown/Excel 같은 ID·완료상태 연결']];
 A.spec.v0114FixLedger=typeof V0114_FIX_LEDGER==='undefined'?{version:'0.10.14',items:[]}:A.clone(V0114_FIX_LEDGER);
 features.push(...revision114.map(([id,name,behavior])=>[id,name,behavior,'2026-10-01 사용자 요청']));
 A.spec.requirements.push(...revision114.map(([id,name,decision])=>({id,name,decision,source:'2026-10-01 사용자 요청'})));
 A.spec.functionalRequirements.push(...revision114.map(([id,name,behavior])=>({id,name,behavior,source:'2026-10-01 사용자 요청',status:A.spec.v0114FixLedger.items.find(x=>x.id===id)?.status||'구현·검수 진행 중'})));
 for(const [id,replacement]of Object.entries({'REV113-02':'REV114-01','REV113-03':'REV114-02','REV113-05':'REV114-03'})){const previous=A.spec.functionalRequirements.find(x=>x.id===id);if(previous){A.spec.supersededRequirements.push({...previous,status:'v0.10.14 한 줄 표·문구 교정',replacement});previous.status='화면 교정: '+replacement;}}
 A.spec.meta.version='0.10.14';A.spec.meta.updatedAt='2026-10-01';
 A.spec.featureContracts.v0114={documents:revision114[0][2],permit:revision114[1][2],cost:revision114[2][2],copy:revision114[3][2],research:'docs/v0114-검토의견_조치계획_대조.md',audit:'docs/v0114-copy-audit.json',preservation:'기존 금액·ID·확정본·원문·보고·개인/기록별 초안·필수검증 유지'};
 A.spec.featureContracts.CBS.version='v0.10.14';A.spec.featureContracts.CBS.header='제목/금액 한 줄. 실제 기준일 YY.MM.DD만 표시, 날짜 미확보·비교기준·현재작업값 설명 없음. 사용자 저장폭/셀 상태 보존.';
 A.spec.featureContracts.contracts.documentsV0114='한 목록·한 줄 표. 제목/상대방/날짜/금액/경로/관리 폭 재분배, 수정·삭제/경로·복사 같은 줄. 긴 값 원문과 상세/키보드 가로조회 유지.';
 A.spec.featureContracts.legal.conditionActions='연결 인허가 위 조치계획. 검토의견 유형/내용/통보일/문서와 대응 조치내용/기한/진행/계획·이행자료 분리. 기존 raw 값·ID·날짜/필수/일괄저장·보고 보존.';
 A.spec.featureContracts.legal.registrationWorkflow.version='0.10.14';
 A.spec.dataContracts.permitReviewLabels='resultCategory/actionItems/resultItemId 저장키 유지. 기존 승인조건/보완요청/기타결과 표시만 교정, 신규 심의의견/협의의견 분리. 구 심의·협의의견 raw는 현재 기록에서 보존.';
 A.spec.history.push({version:'v0.10.14',summary:'계약/사업비 한 줄 표와 열폭, 검토의견 기반 조치계획 위치·항목명, 전체 정적설명·중복태그 교정.'});
 A.spec.reproduction.automated='node scripts/verify-v0114.mjs';A.spec.reproduction.baseline='v0.10.13 보존 + 현재 한 줄/검토의견/문구 계약';A.spec.acceptanceTests.push(...revision114.map(([id,name,behavior])=>id+' '+behavior));
 A.spec.verification={status:'v0.10.14 실행 기록 참조',date:'2026-10-01',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'3해상도 실제 한 줄·팝업·설명검수 기록 참조',interactionVerification:'같은 셀·열폭·조치계획·실제 닫기·초안·보고 저장 보호',printVerification:'공식위치·표시·저장 PDF 별도 검사',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.14',implementation:'한 줄 표·검토의견 기반 조치계획·정적 설명 교정',latestUserDecision:'계약/사업비 열폭 재설정·조치계획 이동/명칭 리서치·전체 도움말/중복태그 제거',visualQA:'v0.10.14 검수기록 참조',sampleDataDate:A.today,lawDataDate:lawSnapshot?.dataDate||null,runtimeConnections:'로컬 HTML. 운영 연결/개별사업 법정판정/원가 권한 변경 없음'};
 const revision115=[['REV115-01','근거문서·조치계획 위치 교환','기본정보/일정/조치계획/근거문서/연결인허가 순서'],['REV115-02','추가 후 새 입력칸·초점·스크롤','동적 추가는 새 textarea focus/center scroll, 삭제 등은 기존위치 보존, 명시 조치계획 진입은 해당구간'],['REV115-03','검토의견별 조치 필수','의견별 작성조치1건 이상·필수값 검증, 신규의견에 빈조치 입력 제공, 의견0은 무강제·기존자료 조회/취소 불변'],['REV115-04','3모델 모든시트 원천 확보·대조','원본175시트 대상이나 삭제후 동일사본 미확보. 저장4TIC시트896행/단위58시트262셀만 확보, 전체내용 재검토 미완료'],['REV115-05','취득·법무·보험 목적별 CBS 재검토','저장발췌/공식RICS 기반분류안, 목적/성격/회계·단계·부담·원천역할 분리. 기존CBS/금액/ID/확정본 자동이동 없음, 전체시트 적용 미완료'],['REV115-06','검수·명세·체크리스트 동기화','실패재현/회귀/3해상도 UX·자료보호, 구현된popup과미확보CBS의 완료상태 분리']];
 A.spec.v0115FixLedger=typeof V0115_FIX_LEDGER==='undefined'?{version:'0.10.15',items:[]}:A.clone(V0115_FIX_LEDGER);
 features.push(...revision115.map(([id,name,behavior])=>[id,name,behavior,'2026-10-01 최신 사용자 요청']));A.spec.requirements.push(...revision115.map(([id,name,decision])=>({id,name,decision,source:'2026-10-01 최신 사용자 요청'})));A.spec.functionalRequirements.push(...revision115.map(([id,name,behavior])=>({id,name,behavior,source:'2026-10-01 최신 사용자 요청',status:A.spec.v0115FixLedger.items.find(x=>x.id===id)?.status||'진행 중'})));
 A.spec.meta.version='0.10.15';A.spec.meta.updatedAt='2026-10-01';A.spec.featureContracts.v0115={permitOrder:revision115[0][2],dynamicForm:revision115[1][2],requiredPlan:revision115[2][2],sourceCoverage:revision115[3][2],costReview:revision115[4][2]};A.spec.featureContracts.legal.conditionActions=revision115[2][2]+'; '+revision115[1][2];
 A.spec.dataContracts.permitMinimumPlan='alive review마다 valid action>=1, unchanged 메타는 legacy 보존하되 최소조치/조치필수 우회없음. 신규 blank plan은draft만, 마지막조치 삭제 차단. 의견0 인허가는 무강제.';
 A.spec.dataContracts.costResearchCoverage={originalSheetCount:175,originalsAvailable:false,retainedTicSheets:4,retainedRows:896,unitTextSheets:58,unitTextCells:262,source:'docs/v0115-CBS_재검토_근거.md',fullSheetReviewComplete:false,classificationImplemented:false};
 A.spec.history.push({version:'v0.10.15',summary:'인허가 근거/조치 위치 교환·추가후 스크롤/초점·의견별 조치필수. CBS는취득목적별 재검토안과 미확보원천 경계를 기록, 코드분류변경 없음.'});A.spec.reproduction.automated='node scripts/verify-v0115.mjs';A.spec.acceptanceTests.push(...revision115.map(([id,name,behavior])=>id+' '+behavior));
 A.spec.verification={status:'v0.10.15 실행기록 참조·CBS 전시트 미완료',date:'2026-10-01',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'3해상도 추가/초점/스크롤/필수오류/저장취소 증거',interactionVerification:'같은 셀·인허가 추가·조치필수·초안/부모/보고 저장 보호',printVerification:'보고 투영 불변·기존 공식위치 회귀 PDF 검사',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.15',implementation:'인허가 UI 수정·CBS 재검토안(분류코드 미변경)',latestUserDecision:'위치교환/추가UX/조치필수, 세 모델 모든시트 기반 신중 CBS 재검토',visualQA:'v0.10.15 검수기록 참조',sampleDataDate:A.today,lawDataDate:lawSnapshot?.dataDate||null,runtimeConnections:'로컬 HTML. 원본175시트 미확보/CBS자동이관/운영연결 없음'};
 const revision116=[['REV116-01','비주택 초기20·묶음관리 기준','초기20 관리묶음·사업별 선택·독립 통제 필요 시 세분화 연구안. 주택분양전용 초기제외, 기존 원가/VAT/계약/확정본 보존. 실제 초기화·분류 적용은 미구현'],['REV116-02','세부 사업비 엑셀 내려받기','현재 표/원단위자료/기준정보를 실제 XLSX로 내려받기. 백만원 표시는 원 단위 숫자를 보존하고 미확보/0·표 합계/원자료 역할·현재 기준을 구분. 네트워크전송 없음']];
 A.spec.v0116FixLedger=typeof V0116_FIX_LEDGER==='undefined'?{version:'0.10.16',items:[]}:A.clone(V0116_FIX_LEDGER);
 features.push(...revision116.map(([id,name,behavior])=>[id,name,behavior,'2026-10-01 추가 사용자 요청']));A.spec.requirements.push(...revision116.map(([id,name,decision])=>({id,name,decision,source:'2026-10-01 추가 사용자 요청'})));A.spec.functionalRequirements.push(...revision116.map(([id,name,behavior])=>({id,name,behavior,source:'2026-10-01 추가 사용자 요청',status:A.spec.v0116FixLedger.items.find(x=>x.id===id)?.status||'검수 진행 중'})));
 A.spec.meta.version='0.10.16';A.spec.meta.updatedAt='2026-10-01';
 A.spec.featureContracts.v0116={initialItemPolicy:revision116[0][2],costExcel:revision116[1][2],researchFile:'docs/CBS_초기항목_묶음관리_비주택_20261001.md',researchOnly:true,classificationApplied:false};
 A.spec.featureContracts.CBS.excelExport=revision116[1][2];
 A.spec.dataContracts.costExcel={sheets:['세부 사업비','원금액','기준 정보'],precision:'원화 정수는 숫자셀 그대로 저장. 표는 표시서식으로 백만원 반올림. 미확보는 원금액0으로 대체하지 않음.',sourceDataMutation:false,filterPolicy:'검색·접힘에 따른 비용 누락 없이 대상 프로젝트 해당 표 전체. 보기/비교/시점 기준 파일에 기록.',costGroupingApplied:false};
 A.spec.history.push({version:'v0.10.16',summary:'비주택 초기항목/묶음 기준 연구 보완과 실제 세부사업비 XLSX 내려받기. 기존 원가 분류·금액·확정본은 변경하지 않음.'});A.spec.reproduction.automated='node scripts/verify-v0116.mjs';A.spec.acceptanceTests.push(...revision116.map(([id,name,behavior])=>id+' '+behavior));
 A.spec.verification={status:'v0.10.16 실행기록 참조·초기20 적용은 보류',date:'2026-10-01',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'세부사업비 엑셀 버튼3해상도 실제 Edge 내려받기 검수 별도',interactionVerification:'기존 같은 셀 편집·보고 저장 보호와 금액/평당가/검색·접힘·현재비교·파일다운로드·원장불변',printVerification:'보고 레이아웃 변경 없음. 이전 PDF와 이 버전 새 XLSX 검수를 구분.',noInheritedPassCounts:true};
 A.spec.delivery={version:'0.10.16',implementation:'세부사업비 XLSX 내려받기·비주택 초기20은 연구안',latestUserDecision:'공통 초기항목/묶음/주택분양 선택 처리·엑셀추출',visualQA:'v0.10.16 검수기록 참조',sampleDataDate:A.today,lawDataDate:lawSnapshot?.dataDate||null,runtimeConnections:'로컬 HTML. Excel파일 생성은 브라우저 내부, 자동CBS이관/운영연결 없음'};
 const revision117=[['REV117-01','목적별 원가 분류','토지·기존자산 취득세/이전등기는 취득비, 신축·보존은 보유준공, 담보는 금융, 법인설립은 법인비. 원금·ID·확정본 보존, 확인총액/미확보 대상/고아는 자동이동 보류.'],['REV117-02','보험·보증·보수 이름과 분류 수정','모호한 신규 선택은 차단하고 구체 명칭으로 제공. 기존 미상 비용은 귀속미확인 예외에 보존하고 근거 경로로 분류 수정.'],['REV117-03','사업비표 한 시트 Excel','세부 사업비1시트. 대분류 실제 이름·원가항목·표 시점금액/기준대비/구성비/면적만. 원금액·기준정보·계층/코드/ID/설명영역 없음.'],['REV117-04','다운로드 반복 계산 제거','1회 내보내기 범위에서 현재·시점·관리묶음 캐시 재사용. 원자료 추가 조회 없이 표만 생성. 기존과 최종 Edge 시간을 분리 측정.'],['REV117-05','문서·검증·체크리스트 동기화','연구 완료·코드 반영·실제 파일 검수를 구분하고 새5개 ID를 누적 체크리스트와 Excel에 연결.']];
 A.spec.v0117FixLedger=typeof V0117_FIX_LEDGER==='undefined'?{version:'0.10.17',items:[]}:A.clone(V0117_FIX_LEDGER);
 features.push(...revision117.map(([id,name,behavior])=>[id,name,behavior,'2026-10-06 사용자 재검수']));A.spec.requirements.push(...revision117.map(([id,name,decision])=>({id,name,decision,source:'2026-10-06 사용자 재검수'})));A.spec.acceptanceTests.push(...revision117.map(([id,name,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.17';A.spec.meta.updatedAt='2026-10-06';A.spec.delivery={...A.spec.delivery,version:'0.10.17',implementation:'목적별 원가분류·근거 분류수정·사업비표 한 시트 XLSX·반복 계산 제거',latestUserDecision:'목적별 CBS 전항목/다수사례·보험명칭·단일표 Excel·다운로드 성능',visualQA:'v0.10.17 검수기록 참조',runtimeConnections:'로컬 HTML·목적분류 이관. 운영 서버/DB 연결 없음'};
 A.spec.featureContracts.v0117={classification:revision117[0][2],labels:revision117[1][2],excel:revision117[2][2],performance:revision117[3][2],initial20GroupingApplied:false};
 A.spec.featureContracts.CBS.excelExport=revision117[2][2];A.spec.featureContracts.CBS.purposeClassification=revision117[0][2];
 A.spec.dataContracts.costExcel={sheets:['세부 사업비'],firstColumns:['대분류','원가항목'],sourceDataMutation:false,costGroupingApplied:false,purposeClassificationApplied:true,precision:'원 단위 numeric 및 백만원 표시서식. 미확보는 빈칸/실제0은0. 16자리 원 금액은 정확성 한계로 명시 차단.',filterPolicy:'검색·접힘 무관한 사업 전체 표. 시점/비교기준/보기 유지. 3시트 계약은 REV117-03으로 대체.'};
 A.spec.dataContracts.costResearchCoverage.classificationImplemented=true;A.spec.dataContracts.costResearchCoverage.fullSheetReviewComplete=false;
 A.spec.history.push({version:'v0.10.17',summary:'목적별 CBS·보험/보수 명칭·근거 분류수정·단일표 XLSX·반복계산 제거. 과거 원금·확정자료 유지.'});A.spec.reproduction.automated='node scripts/verify-v0117.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.17 검수기록 참조',date:'2026-10-06',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'최종 v17 실제 Edge3해상도 및 내려받은 단일시트는 별도 검수기록.',interactionVerification:'같은 셀/보고 저장 기존 경로 유지. 분류 수정·한 시트 내려받기·오류·불변성 실제 검수 별도.',printVerification:'공식위치/PDF 과거 검수 보존. 이번 새 PDF 생성 없음.'};
 const ledger118=typeof V0118_FIX_LEDGER==='undefined'?{version:'0.10.18',items:[]}:A.clone(V0118_FIX_LEDGER);
 A.spec.v0118FixLedger=ledger118;
 const revision118=ledger118.items.map(x=>[x.id,x.title,x.acceptance||x.status,'사용자 승인 v0.10.18 계획']);
 features.push(...revision118);A.spec.requirements.push(...revision118.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger118.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance||x.status,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 승인 v0.10.18 계획'})));
 A.spec.acceptanceTests.push(...revision118.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.18';A.spec.meta.updatedAt='2026-10-06';
 A.spec.featureContracts.v0118={home:'일반파일·새로고침 portfolio, 주메뉴첫탭, 명시연결목적지, 프로젝트전환문맥유지',catalog:'원본4파일139시트 기반8대분류30초기관리항목. 초기금액·선택항목자동생성 없음',editing:'실제입력행 같은표·같은셀, 원단위입력/정수백만원표시, 합계자동계산',ordering:'모든비용행 작은동일손잡이·자식포함. 같은소속순서즉시, 다른소속/분류는확인 후 원자저장',preservation:'원금액·ID·확정본·계약·VAT보존. 확인총액/배부참조손상차단',excel:'정렬된같은표 한시트·실제분류명·순서·숫자정확도유지'};
 A.spec.dataContracts.costResearchCoverage={files:4,sheets:139,hiddenSheetsIncluded:true,allSheetLabelsReviewed:true,fullSheetReviewComplete:true,costTablesReviewed:true,classificationImplemented:true,financialRecalculationPerformed:false,sourceWorkbooksChanged:false,reference:'docs/v0118-cost-source-map.json',legacyDeleted175SheetReviewComplete:false};
 A.spec.dataContracts.costDisplayOrder={version:1,ledgerIdsPreserved:true,displayIdsSeparate:true,atomicMove:true,leafPromotionKeepsId:true,frozenDataMutation:false,ownerScopeReferenceChangesBlocked:true};
 A.spec.dataContracts.costExcel={...A.spec.dataContracts.costExcel,costGroupingApplied:true,orderedDisplayTreeShared:true};
 A.spec.history.push({version:'v0.10.18',summary:'홈진입·4모델139시트 기반8대분류30항목·실제입력행·전체행 이동과확인·동일순서 단일엑셀. 기존 원금액과확정본 보존.'});
 A.spec.reproduction.automated='node scripts/verify-v0118.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.18 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'v0.10.18 실제HTML 3해상도는 별도증거기록',printVerification:'보고양식 변경없음·금액원천 회귀검사. 과거 PDF검수와구별'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.18',implementation:'홈 진입·모델 근거 원가표·모든 행 이동·단일표 엑셀',latestUserDecision:'승인 v0.10.18 계획',visualQA:'v0.10.18 검수기록 참조'};
 // The company layout supersedes only display depth/order, not financial guards.
 const ledger119=typeof V0119_FIX_LEDGER==='undefined'?{version:'0.10.19',items:[]}:A.clone(V0119_FIX_LEDGER);
 A.spec.v0119FixLedger=ledger119;
 const replaced119=new Set(['REV118-02','REV118-04','REV118-10']);
 A.spec.supersededRequirements.push(...A.spec.functionalRequirements.filter(x=>replaced119.has(x.id)).map(x=>({...x,status:'v0.10.19 회사 공통 표시·상세 접힘·관리표 출력으로 대체'})));
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!replaced119.has(x.id));
 for(let i=features.length-1;i>=0;i--)if(replaced119.has(features[i][0]))features.splice(i,1);
 for(const item of A.spec.requirements)if(replaced119.has(item.id))item.status='과거 결정 · REV119 우선';
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!Array.from(replaced119).some(id=>x.startsWith(id+' ')));
 const revision119=ledger119.items.map(x=>[x.id,x.title,x.acceptance||x.status,'서리풀 중심 회사 공통 양식 승인']);
 features.push(...revision119);A.spec.requirements.push(...revision119.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger119.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 승인 v0.10.19'})));
 A.spec.acceptanceTests.push(...revision119.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.19';A.spec.meta.updatedAt='2026-10-07';
 A.spec.featureContracts.v0119={basis:'서리풀 TIC 관리항목·순서',hierarchy:'토지비/공사비(직접공사비·간접공사비)/제세공과금/부대비/금융비용/예비비',detail:'상위·직접간접 펼침, 계약/차수/산출 상세 접힘',editing:'단일 입력 관리셀 직접 수정, 다중 합계는 펼쳐 같은 표 입력',cbs:'회사표시와 분리된 보조 대응·누락·중복·계약 범위',preservation:'표시 전환으로 원장 재분류/부모/원명/원금/확정/계약/VAT 변경 없음',excel:'회사 관리표 한시트·원 숫자/백만원 표시·숨은 상세 합계 포함'};
 A.spec.featureContracts.CBS.companyDisplay=A.spec.featureContracts.v0119;
 A.spec.featureContracts.CBS.excelExport=A.spec.featureContracts.v0119.excel;
 A.spec.costRules.hierarchy=A.spec.featureContracts.v0119.hierarchy;
 A.spec.dataContracts.costCompanyProfile={version:19,basis:'서리풀 TIC',topLevelNames:['토지비','공사비','제세공과금','부대비','금융비용','예비비'],constructionChildren:['직접공사비','간접공사비'],ledgerReparentOnApply:false,sourceNamesPreserved:true,amountsImported:false,defaultExpanded:'category-and-construction-branch',defaultDetail:'collapsed',userOrderSeparate:true,sourceMap:'docs/v0119-cost-company-map.json'};
 A.spec.dataContracts.costExcel={...A.spec.dataContracts.costExcel,defaultDetail:'management',purposeClassificationApplied:false,filterPolicy:'검색·열/행 접힘 무관한 회사 관리표. 숨은 원자료는 합계에 포함, 상세 중복 출력 없음.'};
 A.spec.featureContracts.CBS.version='v0.10.19';A.spec.featureContracts.CBS.catalog='회사 기본표는 서리풀 관리항목·순서. 일반 CBS 카탈로그는 누락·중복 확인 및 명시 선택추가용 보조자료.';
 A.spec.featureContracts.CBS.editing=A.spec.featureContracts.v0119.editing;
 A.spec.dataContracts.costResearchCoverage.currentDisplayReference='docs/v0119-cost-company-map.json';
 A.spec.history.push({version:'v0.10.19',summary:'서리풀 중심 회사 공통표·공사비 상위 묶음·관리행 기본노출/계약상세 접힘·표시와 원장/CBS 분리·관리표 단일엑셀. 금액원천 불변.'});
 A.spec.reproduction.automated='node scripts/verify-v0119.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.19 검수기록 참조',date:'2026-10-07',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'최종 v19 실제 Edge3해상도 원표대조·상호작용 증거 별도',interactionVerification:'같은 셀·관리행 펼침·순서·열폭·홈·Excel은 v19 실제검수 별도. 보고 저장 기존 회귀 유지.',printVerification:'공식위치/PDF 과거 검수 보존. 보고양식 변경 없음·이번 PDF 새생성 없음.'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.19',implementation:'서리풀 중심 회사 공통표·관리 상세 접힘·CBS 분리·관리표 엑셀',latestUserDecision:'회사 공통 하나·서리풀 중심+공사비 상위 묶음 계획 승인',visualQA:'v0.10.19 검수기록 참조'};
 const ledger120=typeof V0120_FIX_LEDGER==='undefined'?{version:'0.10.20',items:[]}:A.clone(V0120_FIX_LEDGER);
 A.spec.v0120FixLedger=ledger120;
 const replaced120=new Set(['REV119-03','REV119-10']);
 A.spec.supersededRequirements.push(...A.spec.functionalRequirements.filter(x=>replaced120.has(x.id)).map(x=>({...x,status:'v0.10.20 기본/선택 표시와 현재표 출력으로 대체 · 금융보존 유지'})));
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!replaced120.has(x.id));
 for(let i=features.length-1;i>=0;i--)if(replaced120.has(features[i][0]))features.splice(i,1);
 for(const item of A.spec.requirements)if(replaced120.has(item.id))item.status='과거 결정 · REV120 우선';
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!Array.from(replaced120).some(id=>x.startsWith(id+' ')));
 const revision120=ledger120.items.map(x=>[x.id,x.title,x.acceptance||x.status,'사용자 하위행 구조·선택항목 요청']);
 features.push(...revision120);A.spec.requirements.push(...revision120.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger120.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.20 요청'})));
 A.spec.acceptanceTests.push(...revision120.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.20';A.spec.meta.updatedAt='2026-10-07';
 A.spec.featureContracts.v0120={hierarchy:'부모 합계 배경·600굵기, 하위행 배경·글자색·단계당20px이상 들여쓰기·연결표기',initial:'서리풀 기본 관리행만, 그밖 기존/선택은 팝업에서 명시 표시',optional:'선택 추가 항목 보기 · 표시/숨김과 실제추가 구분',preservation:'숨김은 삭제/합산제외 아님 · 원금/원명/ID/부모/확정/계약/VAT 유지',excel:'현재 기본/표시선택 관리표 한시트, root/총액 숨김금액 포함'};
 A.spec.featureContracts.CBS.version='v0.10.20';A.spec.featureContracts.CBS.displaySelection=A.spec.featureContracts.v0120;
 A.spec.dataContracts.costDisplaySelection={version:1,sidecar:'companyCostDisplayPrefs(project)',defaultProfile:'seoripul-common',ledgerMutation:false,hiddenAmountsIncluded:true,projectIndependent:true,atomicPreferenceSave:true,reconciliation:'표시관리금액·숨긴관리금액·총사업비 · 미입력/0 구별',sourceBasis:'docs/v0120-cost-display-basis.json'};
 A.spec.dataContracts.costExcel={...A.spec.dataContracts.costExcel,displayScope:'visible-management',filterPolicy:'기본/프로젝트표시선택 관리행을 출력. 검색/상세접힘에 합계누락없음. 숨긴가격은 원장과root전체합계에 보존.'};
 A.spec.dataContracts.viewPreferences.push('companyCostDisplayPrefs(project)');
 A.spec.history.push({version:'v0.10.20',summary:'원표 기본표/선택추가 팝업 분리·하위행 시각구조·숨김원금 보존·현재표 범위단일엑셀. 원장 재분류 없음.'});
 A.spec.reproduction.automated='node scripts/verify-v0120.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.20 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'최종 v20 실제 Edge3해상도 기본/확장/선택팝업 정확한 지문 증거',interactionVerification:'같은 셀·선택표시/숨김·저장실패·빠른닫기재열림·표/Excel 범위 실제검수 별도',printVerification:'공식위치/PDF 과거검수 보존. 보고 양식변경없음·새PDF미생성'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.20',implementation:'부모·하위계층 강조, 기본/선택항목 분리, 숨김금액 보존·표 범위Excel',latestUserDecision:'원표 비용만 최초표시·나머지 선택추가 · 시각구조 구분',visualQA:'v0.10.20 검수기록 참조'};
 A.on('spec-copy',()=>A.copy(JSON.stringify(A.spec,null,2)));
 const ledger121=typeof V0121_FIX_LEDGER==='undefined'?{version:'0.10.21',items:[]}:A.clone(V0121_FIX_LEDGER);
 A.spec.v0121FixLedger=ledger121;
 const replaced121=new Set(['REV120-01','REV120-03']);
 A.spec.supersededRequirements.push(...A.spec.functionalRequirements.filter(x=>replaced121.has(x.id)).map(x=>({...x,status:'v0.10.21 의미 역할·단일 항목 선택/추가로 대체 · 금액/표시권 보존'})));
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!replaced121.has(x.id));
 for(let i=features.length-1;i>=0;i--)if(replaced121.has(features[i][0]))features.splice(i,1);
 for(const item of A.spec.requirements)if(replaced121.has(item.id))item.status='과거 결정 · REV121 우선';
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!Array.from(replaced121).some(id=>x.startsWith(id+' ')));
 const revision121=ledger121.items.map(x=>[x.id,x.title,x.acceptance||x.status,'사용자 의미별 스타일·중복 추가 흐름 재검토']);
 features.push(...revision121);A.spec.requirements.push(...revision121.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger121.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.21 요청'})));
 A.spec.acceptanceTests.push(...revision121.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.21';A.spec.meta.updatedAt='2026-10-07';
 A.spec.featureContracts.v0121={style:{total:{weight:700,background:'#dce7f3'},root:{weight:600,background:'#edf2f7'},branch:{weight:600,background:'#f5f7fa'},management:{weight:400,background:'#fff'},actual:{weight:400,background:'#fff'},decisionBasis:'semantic-role-not-input-count',indentStep:24,chevronSlot:18},entry:'항목 선택·추가',dialog:'사업비 항목 선택·추가',modes:['shown','new','all'],allReadOnly:true,directFields:['parent','name','amount'],parentReturn:['cancel','close','Escape','save'],preservation:'기본34·표시권·원금/확정/계약/VAT·같은셀/이동/열폭·현재표한시트 유지'};
 A.spec.featureContracts.CBS.version='v0.10.21';A.spec.featureContracts.CBS.visualHierarchy=A.spec.featureContracts.v0121.style;
 A.spec.dataContracts.costCompanyProfile={...A.spec.dataContracts.costCompanyProfile,newCatalogPlacement:{field:'companyCatalogParentKey',scope:'new-explicit-catalog-rows-only',rawParentPreserved:true,manualConfirmedOverrideFirst:true,cacheSignatureIncludesPlacement:true}};
 A.spec.dataContracts.costDirectEntry={selectedRootIdPreserved:true,addCustomSignature:'(project,category,name,options?)',optionalParentId:true,legacyThreeArgumentCompatible:true,duplicateCategoryRootsNotFirstMatch:true};
 A.spec.dataContracts.costDisplaySelection={...A.spec.dataContracts.costDisplaySelection,entry:'single-selection-and-add',viewModes:['shown','new','all'],classificationReadOnly:true,reconciliationPlacement:'compact-bottom',moneyDisplayUnit:'million-won',recordMutationOnDisplay:false};
 A.spec.history.push({version:'v0.10.21',summary:'의미 역할별 음영/굵기·24px/18px 정렬·단일항목선택/추가·기존표시/신규생성/분류조회 분리·직접입력 부모복귀. 금융/기본34 유지.'});
 A.spec.reproduction.automated='node scripts/verify-v0121.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.21 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'승인된 신규한파일127.0.0.1 미리보기·3해상도 의미별 스타일·독립판정 별도',interactionVerification:'같은 셀·선택/신규/분류조회·직접입력 부모복귀·초안/실패/금융회귀 별도',printVerification:'공식위치/PDF 과거 검수 보존. 보고양식 변경없음·새PDF미생성'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.21',implementation:'역할별 일관된 원가표·항목 선택/추가 단일 흐름',latestUserDecision:'음영·굵기·indent 재검토·추가 진입중복 해소·독립 합의 반복',visualQA:'v0.10.21 검수기록 참조'};
 const ledger122=typeof V0122_FIX_LEDGER==='undefined'?{version:'0.10.22',items:[]}:A.clone(V0122_FIX_LEDGER);
 A.spec.v0122FixLedger=ledger122;
 const replaced122=new Set(['REV121-04']);
 A.spec.supersededRequirements.push(...A.spec.functionalRequirements.filter(x=>replaced122.has(x.id)).map(x=>({...x,status:'v0.10.22 미표시 항목 단일 추가목록으로 대체 · 금액/원문 보존'})));
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!replaced122.has(x.id));
 for(let i=features.length-1;i>=0;i--)if(replaced122.has(features[i][0]))features.splice(i,1);
 for(const item of A.spec.requirements)if(replaced122.has(item.id))item.status='과거 결정 · REV122 우선';
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!Array.from(replaced122).some(id=>x.startsWith(id+' ')));
 const revision122=ledger122.items.map(x=>[x.id,x.title,x.acceptance,'사용자 근거·상태 제거 및 이미 표시된 항목 제외 요청']);
 features.push(...revision122);A.spec.requirements.push(...revision122.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger122.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.22 요청'})));
 A.spec.acceptanceTests.push(...revision122.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.22';A.spec.meta.updatedAt='2026-10-07';
 A.spec.featureContracts.v0122={entry:'항목 선택·추가',singleList:true,excludeDisplayed:true,removeAfterAdd:true,scopeEvidenceUI:false,statusUI:false,modes:[],footerReconciliationUI:false,searchFields:['categoryName','name'],directFields:['parent','name','amount'],parentReturn:['cancel','close','Escape','save'],preserveDictionaryEvidence:true,unsolicitedRedesign:false,scope:'기존 UI/UX 유지·확인된 오류와 요청 불일치만 교정'};
 A.spec.featureContracts.CBS.version='v0.10.22';A.spec.featureContracts.CBS.displaySelection=A.spec.featureContracts.v0122;
 A.spec.dataContracts.costDisplaySelection={...A.spec.dataContracts.costDisplaySelection,viewModes:[],classificationReadOnly:false,classificationInPicker:false,reconciliationPlacement:'not-in-picker',excludeDisplayed:true,statusColumn:false,scopeDetails:false,moneyDisplayUnit:'million-won'};
 A.spec.history.push({version:'v0.10.22',summary:'항목 추가 팝업의 근거/상태/3탭/요약 제거·미표시 항목만 단일목록·추가즉시제외. 원단위금액·근거원문·기본표 보존.'});
 A.spec.reproduction.automated='node scripts/verify-v0122.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.22 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'미표시 항목 추가팝업 실제 검수 별도',interactionVerification:'표시/신규추가 즉시제외·검색·직접입력·부모복귀 및 금액 보존 별도'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.22',implementation:'표에 없는 항목만 선택하는 단일 추가목록',latestUserDecision:'범위근거·표시상태 제거·이미 표시된 항목 제외',visualQA:'v0.10.22 검수기록 참조'};
 const ledger123=typeof V0123_FIX_LEDGER==='undefined'?{version:'0.10.23',items:[]}:A.clone(V0123_FIX_LEDGER);
 A.spec.v0123FixLedger=ledger123;
 const replaced123=new Set(['REV122-03']);
 A.spec.supersededRequirements.push(...A.spec.functionalRequirements.filter(x=>replaced123.has(x.id)).map(x=>({...x,status:'v0.10.23 추가 버튼·사용자 문구 교정으로 보완 · 단일목록/데이터 보존'})));
 A.spec.functionalRequirements=A.spec.functionalRequirements.filter(x=>!replaced123.has(x.id));
 for(let i=features.length-1;i>=0;i--)if(replaced123.has(features[i][0]))features.splice(i,1);
 for(const item of A.spec.requirements)if(replaced123.has(item.id))item.status='과거 결정 · REV123 우선';
 A.spec.acceptanceTests=A.spec.acceptanceTests.filter(x=>!Array.from(replaced123).some(id=>x.startsWith(id+' ')));
 const revision123=ledger123.items.map(x=>[x.id,x.title,x.acceptance,'사용자 전체 문구·실제 동작 확인 요청']);
 features.push(...revision123);A.spec.requirements.push(...revision123.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger123.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.23 요청'})));
 A.spec.acceptanceTests.push(...revision123.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.23';A.spec.meta.updatedAt='2026-10-07';
 A.spec.featureContracts.v0123={rowAddLabel:'추가',rowAddAppearance:'btn small',internalActionsPreserved:['cbs-catalog-display','cbs-catalog-add'],copyAudit:{sourceJsFiles:23,loadedModules:21,renderConditions:44,browserClaimsSeparate:true,canonicalNamesPreserved:true},editorLabels:'기존 한국어 표제·확인된 특수 role 한국어 표시명',deleteInput:{action:'cbs-input-delete',existingGuard:true,existingSoftDelete:true,atomicRollback:true,parentReturn:true},unsolicitedRedesign:false,newBusinessRule:false,printedReportTextUnchanged:true,cssUnchanged:true};
 A.spec.featureContracts.CBS.version='v0.10.23';A.spec.featureContracts.CBS.rowAddLabel='추가';
 A.spec.history.push({version:'v0.10.23',summary:'추가 버튼 통일·전체 사용자 문구/동작 감사·한국어 편집 이름·확인된 삭제버튼 무동작 교정. 구조/금액/원문/검증/인쇄본문 보존.'});
 A.spec.reproduction.automated='node scripts/verify-v0123.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.23 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'변경 문구·버튼·입력 이름 실제 검수 별도',interactionVerification:'추가/삭제/보호대상/실패/부모복귀·기존 금융 보존 별도',printVerification:'인쇄본문 불변 회귀·공식서식/병합/페이지 변경없음·새PDF미생성'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.23',implementation:'기존 UI/UX 유지·확인된 문구와 동작 오류 교정',latestUserDecision:'추가 버튼뿐 아니라 전체 문구와 실제 동작 대조·임의 재설계 금지',visualQA:'v0.10.23 검수기록 참조'};
 const ledger124=typeof V0124_FIX_LEDGER==='undefined'?{version:'0.10.24',items:[]}:A.clone(V0124_FIX_LEDGER);
 A.spec.v0124FixLedger=ledger124;
 const revision124=ledger124.items.map(x=>[x.id,x.title,x.acceptance,'사용자 사업비 선택 추가·표·미입력 금액 연계 확인 요청']);
 features.push(...revision124);A.spec.requirements.push(...revision124.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger124.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.24 요청'})));
 A.spec.acceptanceTests.push(...revision124.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.24';A.spec.meta.updatedAt='2026-10-08';
 A.spec.featureContracts.v0124={pickerHeaders:['원가항목','추가'],grouping:'main-table-hierarchy-and-order',pickerAmountColumn:false,newAmount:null,zeroIsExplicit:true,preserveExistingAmounts:true,existingSelectionAndCustomEntry:true,unsolicitedRedesign:false,browserClaimsSeparate:true};
 A.spec.featureContracts.CBS.version='v0.10.24';
 A.spec.featureContracts.CBS.displaySelection={...A.spec.featureContracts.CBS.displaySelection,pickerHeaders:['원가항목','추가'],grouping:'main-table-hierarchy-and-order',pickerAmountColumn:false,blankSaveNoop:true};
 A.spec.dataContracts.costDisplaySelection={...A.spec.dataContracts.costDisplaySelection,pickerHeaders:['원가항목','추가'],pickerAmountColumn:false,hierarchyGrouping:true,displayOrderMatchesMainTable:true};
 A.spec.partialSupersessions=[...(A.spec.partialSupersessions||[]),...A.clone(ledger124.supersedes||[])];
 A.spec.history.push({version:'v0.10.24',summary:'선택 추가를 본표 분류·순서로 묶고 원가항목 제목 통일. 신규 미입력·기존 금액 보존과 선택/편집/계산/엑셀 연결 검증.'});
 A.spec.reproduction.automated='node scripts/verify-v0124.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.24 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'사업비 선택 추가 분류·제목 실제 검수는 별도',interactionVerification:'추가/미입력/명시적0/기존금액/취소/실패/엑셀 연계는 검사별 근거 구분'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.24',implementation:'사업비 선택 추가와 본표 분류·입력 연결의 확인된 불일치 교정',latestUserDecision:'같은 분류 묶음·본표와 같은 열 제목·미입력 금액 임의 생성 금지·관련 연계 세부 확인',visualQA:'v0.10.24 검수기록 참조'};
 const ledger125=typeof V0125_FIX_LEDGER==='undefined'?{version:'0.10.25',items:[]}:A.clone(V0125_FIX_LEDGER);
 A.spec.v0125FixLedger=ledger125;
 const revision125=ledger125.items.map(x=>[x.id,x.title,x.acceptance,'사용자 분류별 접기/펼치기·누적 일반지침 지속관리 요청']);
 features.push(...revision125);A.spec.requirements.push(...revision125.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger125.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.25 요청'})));
 A.spec.acceptanceTests.push(...revision125.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.25';A.spec.meta.updatedAt='2026-10-08';
 A.spec.featureContracts.v0125={initialGroups:'collapsed',search:'temporary-auto-open-with-manual-override',stateScope:'project',nativeHidden:true,nativeButtonKeyboard:true,instructionFile:'AGENTS.md',uxPrinciplesFile:'docs/UX-review-rules.md',readBeforeEachTask:true,recurrenceTestsRequired:true,unsolicitedRedesign:false,rawAmountsUnchanged:true,actualBrowserVerificationSeparate:true};
 A.spec.featureContracts.CBS.version='v0.10.25';A.spec.featureContracts.CBS.displaySelection={...A.spec.featureContracts.CBS.displaySelection,classificationFold:true,initialGroups:'collapsed',searchTemporaryExpand:true,stateScope:'project',preserveScrollAndFocus:true};
 A.spec.history.push({version:'v0.10.25',summary:'선택 추가의 분류별 접기/펼치기·검색/추가/복귀 상태 연결, 반복 피드백의 프로젝트 지침·일반원칙·재발검사 관리.'});
 A.spec.reproduction.automated='node scripts/verify-v0125.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.25 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'분류 접기/펼치기와 검색·추가·복귀의 실제 검수는 별도',interactionVerification:'분류/검색/추가/취소/문맥·같은 셀·금액 보존·누적 지침 재발검사'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.25',implementation:'분류 탐색과 같은 흐름의 상태 연결·누적 개선 규칙의 프로젝트 내 지속관리',latestUserDecision:'한 요소만 고치지 않고 연결 흐름 확인·요청하지 않은 전면 재설계 금지·이전 일반 지침 재대조 저장',visualQA:'v0.10.25 검수기록 참조'};
 const ledger126=typeof V0126_FIX_LEDGER==='undefined'?{version:'0.10.26',items:[]}:A.clone(V0126_FIX_LEDGER);
 A.spec.v0126FixLedger=ledger126;
 const revision126=ledger126.items.map(x=>[x.id,x.title,x.acceptance,'사용자 항목유지·본표/팝업 하위순서만 CBS 유사 기준으로 변경 요청']);
 features.push(...revision126);A.spec.requirements.push(...revision126.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger126.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.26 요청'})));
 A.spec.acceptanceTests.push(...revision126.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.26';A.spec.meta.updatedAt='2026-10-08';
 A.spec.featureContracts.v0126={sortOnly:true,itemsRetained:true,parentsRetained:true,basisVersion:'cbs-v26',oldManualOrder:'legacy-tie-break',newManualOrder:'marked-parent-first',oneSharedComparator:true,amountsAndFrozenUnchanged:true,unknownMeaning:'stable-legacy-order',classificationMutation:false,universalMandatoryCbsOrderClaimed:false};
 A.spec.featureContracts.CBS.version='v0.10.26';A.spec.featureContracts.CBS.displaySelection={...A.spec.featureContracts.CBS.displaySelection,detailOrder:'shared-cbs-v26',itemsAndParentsPreserved:true};
 A.spec.history.push({version:'v0.10.26',summary:'항목·상위분류·원자료·금액 유지, 본표/선택추가/엑셀 하위순서만 CBS 유사 공유 기준으로 정렬. legacy순서 보존·이후수동이동 지원.'});
 A.spec.reproduction.automated='node scripts/verify-v0126.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.26 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'하위CBS 유사 순서·접기/검색·본표/팝업 실제 검수 별도',interactionVerification:'분류/검색/추가/취소/문맥·같은 셀·금액 보존·누적 지침 재발검사·CBS 공유순서/legacy/new manual·저장실패·확정/계약VAT/엑셀 보존'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.26',implementation:'항목·분류는 유지하고 하위표시 순서만 공유CBS 기준으로 변경',latestUserDecision:'세부 사업비표/선택추가의 세부 항목을 CBS 순서와 유사하게 재정렬·항목 그대로',visualQA:'v0.10.26 검수기록 참조'};
 const ledger127=typeof V0127_FIX_LEDGER==='undefined'?{version:'0.10.27',items:[]}:A.clone(V0127_FIX_LEDGER);
 A.spec.v0127FixLedger=ledger127;
 const revision127=ledger127.items.map(x=>[x.id,x.title,x.acceptance,'사용자 중복 표시·추가 전 페이지 전수 확인 및 재발방지 요청']);
 features.push(...revision127);A.spec.requirements.push(...revision127.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger127.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.27 요청'})));
 A.spec.acceptanceTests.push(...revision127.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.27';A.spec.meta.updatedAt='2026-10-08';
 A.spec.featureContracts.v0127={identityBasis:'explicit-alias-not-label-or-rank',allPublicPagesRequired:true,publicNestedPanelsIncluded:true,compatRoutesSeparate:true,actualRecordsRetained:true,staleAddRechecked:true,explicitEditCannotCreate:true,saveTimeLiveTargetCheck:true,allocationOptionIdsUnique:true,amountsAndFrozenUnchanged:true,unsolicitedRedesign:false};
 A.spec.featureContracts.CBS.version='v0.10.27';A.spec.featureContracts.CBS.displaySelection={...A.spec.featureContracts.CBS.displaySelection,semanticAliasDeduplication:true,existingRecordPreferred:true,saveTimeRecheck:true};
 A.spec.history.push({version:'v0.10.27',summary:'정확 의미 별명으로 사업비 후보 중복 노출/추가를 방지하고 전체 공개·중첩 화면의 목록/선택·출력을 감사. 실제 복수기록·원금액·분류·CBS순서 보존.'});
 A.spec.reproduction.automated='node scripts/verify-v0127.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.27 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'전체 공개/중첩 화면·대표 팝업의 실제 검수는 별도',interactionVerification:A.spec.verification.interactionVerification+'·정확 의미 별명/이미 포함/추가직전 방어·전체공개목록/선택 감사'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.27',implementation:'확인된 중복노출/추가만 최소수정·전체페이지 감사·재발검사 강화',latestUserDecision:'선택목록에 한정하지 않고 모든페이지의 같은중복을확인·재발방지·실제기록 보존',visualQA:'v0.10.27 검수기록 참조'};
 const ledger128=typeof V0128_FIX_LEDGER==='undefined'?{version:'0.10.28',items:[]}:A.clone(V0128_FIX_LEDGER);
 A.spec.v0128FixLedger=ledger128;
 const revision128=ledger128.items.map(x=>[x.id,x.title,x.acceptance,'사용자 회사공통 MECE 비용코드·정해진 선택목록 필수 연결 요청']);
 features.push(...revision128);A.spec.requirements.push(...revision128.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger128.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.28 요청'})));
 A.spec.acceptanceTests.push(...revision128.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.28';A.spec.meta.updatedAt='2026-10-08';
 A.spec.featureContracts.v0128={closedVocabulary:true,userTypeRegistration:false,newPostingTypeRequired:true,freeTextIsDetailOnly:true,currentBindingSource:'project.costCoding.currentByRecordId',historicalBindingSource:'project.costCoding.historicalByStageId',oldRowAndSnapshotJsonPreserved:true,oldLocalCodesPreserved:true,rollupGrain:'posting-record-id-once',systemReviewNewSelectable:false,masterVersion:'company-cbs-v1',displayGranularityPreserved:true,analysisDashboardAdded:false};
 A.spec.featureContracts.CBS.version='v0.10.28';A.spec.featureContracts.CBS.standardCoding={masterVersion:'company-cbs-v1',source:'src/data/cost-type-master-v1.json',mandatoryNewPosting:true,projectLocalCodeIsNotTypeCode:true,closedSelectableTypes:true,groupAndPostingSeparate:true,legacyReviewSeparate:true,rawSourceAndFrozenUnchanged:true};
 A.spec.dataContracts.costCoding={master:'costTypeMaster {version,entries,legacyMappings}; id/code immutable·single parent·defined purpose/OTHER/reserve/composite/system',current:'project.costCoding.currentByRecordId: recordId → costTypeId/costTypeCode/masterVersion/mappingStatus/reason/method',historical:'historicalByStageId: frozen stage/nodeId binding; old snapshot bytes unchanged; new snapshot typed projection',analysis:'recordId grain once; expense/reserve/adjustment/review/control separated; knownSum/unknownCount/value reconciled; same type same code across projects'};
 A.spec.history.push({version:'v0.10.28',summary:'닫힌 회사공통 CBS 비용유형 마스터·신규 표준코드 필수·현재/과거 별도 연결·코드기반 분석 합산 대사. 회사 관리표·기존 기록/금액/확정본 보존.'});
 A.spec.reproduction.automated='node scripts/verify-v0128.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.28 검수기록 참조',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'표준선택/기존표/분류이동/코드추출 실제 검수는 별도',interactionVerification:A.spec.verification.interactionVerification+'·MECE master/표준코드필수/현재과거binding/typed분석1회/무코드원복'};
 A.spec.delivery={...A.spec.delivery,version:'0.10.28',implementation:'선택목록을 미리 완결한 회사공통 비용코드·표준선택 필수·분석 결합',latestUserDecision:'새 유형등록으로 해결하지 않고 고정MECE항목을 선택·계약/내역만 자유입력·회사화면/금액/확정 보존',visualQA:'v0.10.28 검수기록 참조'};
 const ledger129=typeof V0129_FIX_LEDGER==='undefined'?{version:'0.10.29',items:[]}:A.clone(V0129_FIX_LEDGER);
 A.spec.v0129FixLedger=ledger129;
 const revision129=ledger129.items.map(x=>[x.id,x.title,x.acceptance,'사용자 세부 사업비 단순행·더블클릭·접힘성능·취득세/부담금 분류 재검토 요청']);
 features.push(...revision129);A.spec.requirements.push(...revision129.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger129.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.29 요청'})));
 A.spec.acceptanceTests.push(...revision129.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.29';A.spec.meta.updatedAt='2026-10-12';
 A.spec.featureContracts.v0129={costEditActivation:'double',persistentCostEditButton:false,pickerInitialState:'all-collapsed-new-session',pickerToggleRecalculatesCandidates:false,pickerToggleReplacesModal:false,simpleCostRows:['direct_main','design_main','design_supervision','design_survey'],simpleRowsHavePublicChildren:false,simpleRowsInputCount:1,costCodesVisible:false,serverBackendAdded:false,oldStagesAndReferencesPreserved:true,costClassificationReview:'docs/v0129-cost-review.md'};
 A.spec.featureContracts.CBS.version='v0.10.29';
 A.spec.featureContracts.CBS.standardCoding={...A.spec.featureContracts.CBS.standardCoding,masterVersion:'company-cbs-v2',source:'src/data/cost-type-master-v2.json',archiveSource:'src/data/cost-type-master-v1.json',historicalDefinitionLookup:'binding.masterVersion',displayCodes:false,serverDatabaseImplemented:false};
 A.spec.dataContracts.costCoding={...A.spec.dataContracts.costCoding,master:'닫힌 회사 공통 비용코드의 현재 v2·보존 v1. ID/code 고정, 당시 정의는 binding.masterVersion으로 조회',current:'project.costCoding.currentByRecordId: 기록별 당시 버전 유지, 신규·명시적 변경에만 현재 정의 적용',historical:'historicalByStageId: 과거 확정본과 코드를 현재 정의로 덮어쓰지 않음'};
 A.spec.featureContracts.CBS.displaySelection={...A.spec.featureContracts.CBS.displaySelection,initialGroups:'all-collapsed-new-session',queryRestoredOnNewSession:false,cachedCandidateRead:true,inPlaceToggleAndSearch:true};
 A.spec.featureContracts.CBS.inlineEdit={...A.spec.featureContracts.CBS.inlineEdit,activation:'double',persistentEditButton:false,simpleInputRows:['direct_main','design_main','design_supervision','design_survey'],publicChildren:false};
 A.spec.history.push({version:'v0.10.29',summary:'세부 사업비 선택목록의 첫 접힘·토글/검색 성능, 더블클릭 전용 셀 편집, 도급·설계·감리·조사 단일행, 취득세·부담금·미술비와 초기/선택유형 재검토.'});
 A.spec.reproduction.automated='node scripts/verify-v0129.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.29 검수 완료 · 최종 지문 일치기록 별도',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'실제 Edge 3해상도·20캡처·토글 p95 최대32.9ms·검색31.3ms·한시트 XLSX 대사 통과, 최종소스/HTML 증거는 outputs/v0129/검증_일치기록.json',interactionVerification:A.spec.verification.interactionVerification+'·새 세션 초기접힘·동일 DOM 토글/검색·상시수정/입력버튼0·같은셀 유형/금액·기존ID 재사용·4단일입력·원합계/과거비교/복합코드 보존·현재과거 정의 분리',nativeExcel:false};
 A.spec.delivery={...A.spec.delivery,version:'0.10.29',implementation:'확인된 비용표·선택목록 결함만 교정, 회사 관리수준과 공식 CBS 대응 분리',latestUserDecision:'4비용은 하위항목 없는 한 행·한 금액, 더블클릭 편집, 과도한 세분화·추가 패널·설명 금지',visualQA:'v0.10.29 실제 Edge 3해상도 통과 · 최종 증거 별도'};
 const ledger130=typeof V0130_FIX_LEDGER==='undefined'?{version:'0.10.30',items:[]}:A.clone(V0130_FIX_LEDGER);
 A.spec.v0130FixLedger=ledger130;
 const revision130=ledger130.items.map(x=>[x.id,x.title,x.acceptance||x.title,'사용자 사건단위 묶음·중요 예산 통제·전항목 근거표·독립 교차검토 요청']);
 features.push(...revision130);A.spec.requirements.push(...revision130.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger130.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance||x.title,status:x.status||'검증 진행 중',implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.30 요청'})));
 A.spec.acceptanceTests.push(...revision130.map(([id,,behavior])=>id+' '+behavior));
 A.spec.meta.version='0.10.30';A.spec.meta.updatedAt='2026-10-12';
 A.spec.featureContracts.v0130={reportedMasterVersion:'company-cbs-v3',companyBudgetUsesEventUnits:true,sourceWorkbooksReadOnly:true,previousDefinitionsAndRecordsPreserved:true,costCodesVisible:false,serverBackendAdded:false,budgetUnit:'같은 사건 비용은 묶음, 별도 예산·계약 통제 실익이 있는 중요한 비용만 구분',landAcquisitionEvent:'취득세·이전등기비',buildingCompletionEvent:'신축 취득·보존등기비',permitRelatedEvent:'인허가 관련 용역·평가·인증·심의실비 한 관리범위',existingRowsAndAmountsPreserved:true,previousMasterDefinitionsPreserved:['company-cbs-v1','company-cbs-v2'],reportSource:'docs/v0130-cost-review.json',sourceEvidenceClasses:'본표·산출상세·혼합·검토범위 미확인 구별',cbsEvidenceClasses:'공식예시 대응·상위군 대응·회사보완 구별',unrelatedUiChanged:false};
 A.spec.featureContracts.CBS.version='v0.10.30';
 A.spec.featureContracts.CBS.standardCoding={...A.spec.featureContracts.CBS.standardCoding,masterVersion:'company-cbs-v3',source:'src/data/cost-type-master-v3.json',archiveSources:['src/data/cost-type-master-v1.json','src/data/cost-type-master-v2.json'],displayCodes:false,serverDatabaseImplemented:false};
 A.spec.history.push({version:'v0.10.30',summary:'취득·준공 등 같은 사건 비용의 관리묶음, 회사 원표 수준의 보수·인허가 비용, 기본·선택 전체유형의 원문/CBS/분리실익 근거표.'});
 A.spec.reproduction.automated='node scripts/verify-v0130.mjs';
A.spec.verification={...A.spec.verification,status:'v0.10.30 검수 완료 · 최종 지문 일치기록 별도',date:'2026-10-12',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'실제 Edge 1280×800·1440×900·1600×1000·26PNG 검수. 최종 증거는 outputs/v0130/검증_일치기록.json. 이전 v29 캡처를 현재 통과 근거로 사용하지 않음.',interactionVerification:'분류 접기/펼치기·검색·추가·취소·프로젝트 문맥·같은 셀 편집·금액 보존·누적 지침 재발검사·같은셀 더블클릭·Enter/Escape·복수 실제금액 선택·미선택 오류 유지·대상삭제/교체·실패원복·기본그룹 중복후보0·토글/검색·보수 순서·열폭 클릭 불변·null/0/1원·1시트 XLSX 대사 통과',printVerification:'이번 버전 PDF 생성·인쇄 검수 미실시 · 관련 본문 변경 없음',nativeExcel:false};
 A.spec.delivery={...A.spec.delivery,version:'0.10.30',implementation:'회사 관리표의 사건·예산 단위와 전체 유형 근거표 동기화',latestUserDecision:'같은 사건 비용은 묶고 중요한 항목의 예산을 통제. 세목 차이만으로 화면을 분리하지 않음.',visualQA:'v0.10.30 검수기록 참조'};
 const ledger131=typeof V0131_FIX_LEDGER==='undefined'?{version:'0.10.31',items:[]}:A.clone(V0131_FIX_LEDGER);
 A.spec.v0131FixLedger=ledger131;
 const revision131=ledger131.items.map(x=>[x.id,x.title,x.acceptance||x.title,'사용자 행밀도·명칭·순서·중복·9종 용도 프리셋 확인 요청']);
 features.push(...revision131);A.spec.requirements.push(...revision131.map(([id,name,decision,source])=>({id,name,decision,source})));
 A.spec.functionalRequirements.push(...ledger131.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.31 요청'})));
 A.spec.meta.version='0.10.31';A.spec.meta.updatedAt='2026-10-12';
 A.spec.featureContracts.v0131={sameRestingRowHeightPx:34,editingMayExpand:true,displayNamePolicy:'코드/원문은 보존하고 회사 관리행의 현재 표시명을 통일',costMasterVersion:'company-cbs-v3',costCodesVisible:false,assetCostPresets:{implemented:true,requiredUses:['복합개발사업','오피스','리테일','호텔','물류','데이터센터','시니어리빙','임대주택','분양주택'],notPermitPresets:true,source:'src/data/cost-presets-v1.json',api:'App.costUsePresets',recordField:'costUsePreset',newAmounts:null,existingProjectAutoApply:false,registrationApply:true},unrelatedUiChanged:false};
 A.spec.featureContracts.CBS.version='v0.10.31';
 A.spec.history.push({version:'v0.10.31',summary:'사업비 조회행 밀도·과업 표시명·선택분류 및 중복 교정. 9종 용도별 사업비 프리셋 구현·실제 검수 별도.'});
 A.spec.reproduction.automated='node scripts/verify-v0131.mjs';
 A.spec.verification={...A.spec.verification,status:'v0.10.31 구현·집중·실제 후보 검수 완료 · 최종 일치기록 별도',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'실제 Edge3해상도·조회34px·도구24px·편집/오류 가림0·9종 프리셋과 한시트Excel 대사. 최종파일 지문/전체122 결과는 outputs/v0131/검증_일치기록.json 확인. 이전v30 결과를 현재 근거로 사용하지 않음.',interactionVerification:A.spec.verification.interactionVerification+'·v31 행높이·표시명·후보 분류/가족·9종 프리셋·새등록 저장1회·후보즉시제외·중복node0·재적용원장/이력멱등·저장실패fresh-preview·프로젝트변경 적용차단·파생카운터 저장시 일치',nativeExcel:false};
 A.spec.delivery={...A.spec.delivery,version:'0.10.31',implementation:'지적된 사업비 표시/후보 결함과 사용자 확정9종 용도 프리셋 구현. 실제 검수는 별도 기록.',visualQA:'v0.10.31 검수기록 별도'};
 if(typeof V0132_FIX_LEDGER!=='undefined'){
   const ledger132=A.clone(V0132_FIX_LEDGER);A.spec.v0132FixLedger=ledger132;
   const revision132=ledger132.items.map(x=>[x.id,x.title,x.acceptance||x.title,'승인된 MECE 전체분류의 HTML 반영·재발방지 요청']);
   features.push(...revision132);A.spec.requirements.push(...revision132.map(([id,name,decision,source])=>({id,name,decision,source})));
   A.spec.functionalRequirements.push(...ledger132.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.32 요청'})));
   A.spec.meta.version='0.10.32';A.spec.meta.updatedAt='2026-10-13';
   A.spec.featureContracts.v0132={approvedTaxonomySha256:ledger132.approvedTaxonomySha256,basicManagementItems:37,optionalManagementItems:58,vatTreatmentRoles:6,legacyInputRoles:4,oldTypeMappings:152,singleDefinitionConsumers:['table','picker','edit','save','total','presets','Excel'],canonicalCostMasterVersion:'company-cbs-v4',codeNamespace:'IGIS-COST:',officialCbsCodes:false,costCodesVisible:false,existingTypeBindingsAutomaticallyRewritten:false,existingAmountsChanged:false,sameRestingRowHeightPx:34,globalInstructionsChanged:false,unrelatedUiChanged:false};
   A.spec.featureContracts.CBS.version='v0.10.32';
   A.spec.featureContracts.CBS.standardCoding={...A.spec.featureContracts.CBS.standardCoding,masterVersion:'company-cbs-v4',source:'src/data/cost-type-master-v4.json',archiveSources:['src/data/cost-type-master-v1.json','src/data/cost-type-master-v2.json','src/data/cost-type-master-v3.json'],displayCodes:false,serverDatabaseImplemented:false};
   A.spec.history.push({version:'v0.10.32',summary:'확정 MECE 분류의 본표·선택·같은셀 편집·합계·프리셋·Excel 연결. 기존금액/정의 보존과 동일예산 반례 검수.'});
   A.spec.reproduction.automated='node scripts/verify-v0132.mjs';
   A.spec.verification={...A.spec.verification,status:ledger132.status,date:'2026-10-13',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'이번 최종 HTML·Edge3해상도·실제 조작·한시트 다운로드 근거는 outputs/v0132/검증_일치기록.json에 별도로 기록. 이전v31 결과로 현재 통과를 주장하지 않음.',interactionVerification:'본표/후보/입력/저장/합계/프리셋/Excel 의미 일치·동일예산/독립범위·null0·원금액/과거/계약VAT 보존·최종검수 별도',nativeExcel:false};
   A.spec.delivery={...A.spec.delivery,version:'0.10.32',implementation:'확정 회사 관리대상95의 HTML 연결. 구현·검수 상태는 현재 수정대장 기준.',visualQA:'v0.10.32 검수기록 참조'};
 }
 if(typeof V0133_FIX_LEDGER!=='undefined'){
   const ledger133=A.clone(V0133_FIX_LEDGER);A.spec.v0133FixLedger=ledger133;
   const revision133=ledger133.items.map(x=>[x.id,x.title,x.acceptance||x.title,'전역 지침 적용·전체요구 최종점검·운영전환 준비 요청']);
   features.push(...revision133);A.spec.requirements.push(...revision133.map(([id,name,decision,source])=>({id,name,decision,source})));
   A.spec.functionalRequirements.push(...ledger133.items.map(x=>({id:x.id,name:x.title,behavior:x.acceptance||x.title,status:x.status,implemented:x.implemented,verified:x.verified,source:'사용자 v0.10.33 요청'})));
   A.spec.meta.version='0.10.33';A.spec.meta.updatedAt='2026-10-14';
   A.spec.featureContracts.v0133={registrationManagerFieldsVisibleOnlyForSpc:true,registrationManagerValuesPreservedWhenHidden:true,conditionalVisibilityIsNotFieldDeletion:true,registrationLabelValueVerticalForm:true,modalWrapperPreservesOptions:true,warningModalPreservesFormDraft:true,metadataBaselineMatchesRenderedFields:true,metadataReturnsToActualParent:true,globalInstructionsApplied:true,existingGlobalRules:9,appendedGlobalRules:8,wholeRequirementReview:{priorRecords:343,latestBusinessAreas:25,uncheckedHistoricalRecords:14,operations:5,sourceLimitations:2,supersededOrStaleLinks:7},deployment:A.clone(ledger133.deployment),unrelatedUiChanged:false};
   A.spec.history.push({version:'v0.10.33',summary:'전역8규칙 적용·전체요구 마지막 점검·등록구분 위탁입력 조건 연결·현재문서 링크 정리. 운영배포는 미완료.'});
   A.spec.reproduction.automated='node scripts/verify-v0133.mjs';
   A.spec.verification={...A.spec.verification,status:ledger133.status,date:'2026-10-14',automated:typeof RUN_VERIFICATION==='undefined'?null:RUN_VERIFICATION,visualVerification:'현재 최종HTML의 전체메뉴/대표팝업/등록조건 검수는 outputs/v0133/검증_일치기록.json 참조. 과거v32 비용캡처를 전체업무 검수로 확대하지 않음.',nativeExcel:false};
   A.spec.delivery={...A.spec.delivery,version:'0.10.33',implementation:'최종점검에서 확인한 등록조건/서식·공통 팝업 옵션·항목정보 초기값/부모복귀 교정. 원자료·기존업무 보존.',deployment:A.clone(ledger133.deployment),visualQA:'v0.10.33 최종점검 기록 참조'};
 }
 const deploymentStatus=typeof DEPLOYMENT_STATUS_V0111==='undefined'?null:A.clone(DEPLOYMENT_STATUS_V0111);
 if(deploymentStatus){
  const cloudDeployment=A.runtime?.persistence==='cloud',expectedDeploymentVersion=cloudDeployment?'0.12.3':'0.11.0';
  if(deploymentStatus.schemaVersion!=='deployment-status-v0111'||deploymentStatus.version!==expectedDeploymentVersion)throw Error('현재 배포 상태 정의를 확인해 주세요.');
  const originalFeatureContracts=A.clone(A.spec.featureContracts),originalDataContracts=A.clone(A.spec.dataContracts),originalProductionContracts=A.clone(A.spec.productionContracts),originalInformationArchitecture=A.clone(A.spec.informationArchitecture),originalCostRules=A.clone(A.spec.costRules),priorAuthentication=A.clone(A.spec.productionContracts?.authentication??null),historical=[inheritedAuthentication,priorAuthentication].filter(Boolean),unique=[];for(const item of historical)if(!unique.some(saved=>JSON.stringify(saved)===JSON.stringify(item)))unique.push(item);
  A.spec.legacyReferences=A.spec.legacyReferences||{};A.spec.legacyReferences.authenticationPolicies=[...(A.spec.legacyReferences.authenticationPolicies||[]),...unique];A.spec.legacyReferences.originalFeatureContracts=originalFeatureContracts;A.spec.legacyReferences.originalDataContracts=originalDataContracts;A.spec.legacyReferences.originalProductionContracts=originalProductionContracts;A.spec.legacyReferences.originalInformationArchitecture=originalInformationArchitecture;A.spec.legacyReferences.originalCostRules=originalCostRules;
  const auth=A.clone(deploymentStatus.authentication),currentAuthentication={status:auth.status,identity:cloudDeployment?'서버 지정12개 회사 이메일':'@'+auth.allowedEmailDomain+' 회사 이메일',enrollment:auth.verification,allowedEmailDomain:auth.allowedEmailDomain,verification:auth.verification,codeLength:auth.codeLength,commonInitialCode:auth.commonInitialCode,passwordRequired:auth.passwordRequired,...(cloudDeployment?{passwordPolicy:A.clone(auth.passwordPolicy),rememberLogin:A.clone(auth.rememberLogin)}:{}),allowlistRequired:auth.allowlistRequired===true,allowedEmailCount:auth.allowedEmailCount??null,allowlistSource:auth.allowlistSource||null,supabaseAuth:auth.supabaseAuth,publicSignup:auth.publicSignup,companyDomainEnrollment:auth.companyDomainEnrollment,publicSignupPolicy:auth.publicSignupPolicy,profile:A.clone(auth.profile),emailDeliveryProvider:auth.emailDeliveryProvider,existingAuthConfigurationChanged:auth.existingAuthConfigurationChanged,authorization:cloudDeployment?'서버 세션·프로젝트 권한 검사 구현, 실사용 범위별 검수 별도':'서버 세션·프로젝트 권한 검증은 구현 전',implemented:cloudDeployment};
  A.spec.deploymentStatus=deploymentStatus;
  const nextBehavior=cloudDeployment?'서버 지정12개 회사 이메일만 가입. 최초 가입/비밀번호 설정 때만 이메일6자리 확인, 이후 이메일·비밀번호 로그인. 기존 계정ID·권한·사업자료를 보존하며 이름·사진은 보류.':'플랫폼 전용 @'+auth.allowedEmailDomain+' 이메일로 받은 '+auth.codeLength+'자리 확인코드 로그인. 별도 초기 코드는 사용하지 않고 비밀번호를 강제하지 않으며 이름·사진은 보류.';
  const policySource=cloudDeployment?'사용자 2026-10-16 AUTH112 최신 확정':'사용자 2026-10-15 당시 정책';
  const featureIndex=features.findIndex(item=>item[0]==='NEXT-01');if(featureIndex>=0)features[featureIndex]=['NEXT-01','플랫폼 전용 로그인',nextBehavior,policySource];
  const next=A.spec.functionalRequirements.find(item=>item.id==='NEXT-01');if(next)Object.assign(next,{name:'플랫폼 전용 로그인',behavior:nextBehavior,source:policySource,status:cloudDeployment?'구현 · 실제 검수 별도':'정책 확정 · 구현 대기',implemented:cloudDeployment,verified:false});
  A.spec.requirements.push({id:cloudDeployment?'AUTH-112':'AUTH-111',source:policySource,decision:nextBehavior});
  A.spec.meta.version=deploymentStatus.version;A.spec.meta.updatedAt=deploymentStatus.asOf;
  const browser=deploymentStatus.current.browserVerification,connections=deploymentStatus.current.connections,currentIA=[['portfolio','프로젝트 현황'],['overview','개요'],['cost','원가 관리'],['finance','파이낸싱'],['permit','인허가·사업관리'],['document','계약·문서'],['report','국토부 보고서'],['company','시공사·협력사'],['law','법령 변경'],['spec','플랫폼 명세']].map(([view,name])=>({view,name})),currentFeatureRows=[
   ['CORE-111','프로젝트 현황·수기 등록','Notion 자료 없이도 빈 실제 플랫폼에서 수기 사업을 등록·저장·재로드하고 기존 세부화면을 사용','PROD110-17~22'],
   ['COST-111','회사 사업비 관리','회사 관리대상95개를 기본37·선택58로 운영하고 같은 사건 비용을 묶으며 원자료·코드·과거·계약VAT를 보존','승인된 v0.10.32 분류'],
   ['FINANCE-111','파이낸싱','출자·대출·보증 원장을 계약·사업비와 구분하고 미입력과 0을 보존','현재 파이낸싱 원장'],
   ['PERMIT-111','인허가·사업관리','인허가별 검토의견과 복수 조치계획·날짜·공문·이행자료를 같은 원장에 보존','현재 인허가 계약'],
   ['DOCUMENT-111','계약·문서','계약과 문서를 한 화면에서 조회하고 계약차수·배부·지급·문서버전과 원본경로를 보존','현재 계약·문서 계약'],
   ['REPORT-111','국토부 보고서','현재 작성본의 전체 셀을 편집하고 보고서 전용 저장과 명확한 연결값의 플랫폼 반영을 구분하며 저장본 본문을 보존','현재 보고서 계약'],
   ['REGISTRATION-111','개발업 등록·전문인력','등록상태·등록정보와 전문인력 개인명단을 수동 관리하고 자동 법적 대상판정은 하지 않음','현재 등록 계약'],
   ['COMPANY-111','시공사·협력사','업체·참여·영업기록과 시장·비교자료의 출처를 구분하고 실제 계약값을 자동 변경하지 않음','현재 협력사 계약'],
   ['LAW-111','법령 변경','보존된 공식 snapshot과 사용자 검토이력을 표시하며 일일 자동수집 완료로 주장하지 않음','현재 법령 계약'],
   ['AUDIT-111','변경이력','업무변경과 감사이력을 함께 저장하고 조회·접기 같은 화면조작은 업무변경으로 기록하지 않음','현재 감사 계약'],
   ['NEXT-01','플랫폼 전용 로그인',nextBehavior,policySource],
   ['STORAGE-111','중앙 저장',connections.centralStorage+(cloudDeployment?' · 서버 승인형 원자저장·버전충돌·감사이력 검사':' · 서버 승인형 원자 저장은 구현 전'),'현재 배포 상태'],
   ['NOTION-111','Notion 선택 보충',connections.notion+' · 자료 없음과 오류가 코어 사용을 막지 않음','PROD110-17~22']
  ],currentFeatureContracts={
   navigation:{sidebar:A.clone(currentIA),tabs:A.clone(A.tabContracts),compatibilityRoutes:{document:['documents'],report:['data','plans','history']},note:'호환 주소는 과거 진입을 현재 단일 화면으로 연결하며 별도 현행 화면 수로 세지 않음'},
   CBS:{version:'v0.11.0-current',managementTargets:95,defaultManagementItems:37,optionalManagementItems:58,budgetUnit:'같은 사건 비용은 한 관리예산으로 묶고 독립 예산·계약 통제 실익이 있는 비용만 분리',classification:'회사6대분류와 공사비 직접·간접 구조의 관리대상95개. 원152유형은 당시 코드·원자료·과거 정의로 보존',editing:'본표 같은 셀 더블클릭·Enter 원 단위 편집. 도급·설계·법정감리·조사는 각각 하위행 없는 단일 관리행',selection:'기본37·선택58. 이미 포함된 항목은 후보에서 제외하고 재표시는 원ID·금액을 유지',adjustmentPolicy:'자동 차이조정·비례배분·조정액 자동 생성 금지',preservation:'기존 원금액·recordId·당시 code·과거확정·계약·VAT 불변',excel:'본표와 같은 이름·순서·계층·원단위 금액의 한 시트'},
   report:{workspace:'국토부 보고서 생성 단일 화면',editing:'현재 작성본의 전체 셀 편집. 보고서 전용 저장과 명확한 연결값의 플랫폼 반영 구분',history:'저장한 canonical 본문과 과거 보고원본 불변',output:'같은 모델의 미리보기·인쇄·PDF, 누락·넘침 검증'},
   permit:{records:'인허가 원장과 검토의견·조치계획 1:N',validation:'검토의견 구분·내용·통보일·공문과 조치내용·기한·진행·계획/이행자료 보존',navigation:'자식 입력 취소·저장 후 실제 부모 복귀'},
   registration:{status:'담당팀 수동 입력',records:'등록정보와 전문인력 개인명단. 수동 등록인원과 명단상태 구분',excluded:'자동 대상판정·자본금/인력 하한판정·이름/사진 추정 없음'},
   contracts:{workspace:'계약·문서 한 목록',records:'계약차수·사업비반영액·CBS배부·지급회차·문서버전·원본경로 보존'},
   finance:{records:'출자·대출·보증 원장',boundary:'사업비·계약·원금·VAT 중복합산 금지'},
   company:{records:'업체·참여·영업기록',boundary:'외부 기준정보 갱신으로 내부 기록을 덮지 않음'},
   law:{source:'공식 snapshot과 검토이력',boundary:'일일 자동수집·개별사업 법적판단 완료 아님'},
   audit:{atomicity:cloudDeployment?'중앙 DB에서 업무값·감사·요청 결과 함께 저장/원복':'현재 로컬 저장에서 업무값·감사·알림 함께 원복',server:cloudDeployment?'서버 트랜잭션 구현·실제 범위별 검수 별도':'중앙 저장 원자성은 미구현'},
   authentication:A.clone(currentAuthentication),deployment:A.clone(deploymentStatus.current),notion:{status:connections.notion,requiredForCore:false}
  },currentDataContracts={costManagement:{managementTargets:95,defaultManagementItems:37,optionalManagementItems:58,masterVersion:'company-cbs-v4',source:'src/data/cost-taxonomy-v4.json',displayCodes:false},costRecords:{id:'원기록 ID',typeCode:'당시 비용유형 코드',amount:'원 단위 정수·null과0 구별',history:'과거 정의·확정본 불변',duplicateBoundary:'같은 사건 총액·상세를 중복합산하지 않음'},report:{currentDraft:'현재 작성본 전체 셀',savedCanonical:'본문 불변',platformSync:'명확한 연결값만 명시 반영'},permit:{results:'검토의견',plans:'의견별 복수 조치계획',evidence:'공문·계획/이행자료 경로'},registration:{entity:'등록정보',professionals:'개인명단',manualCount:'수동 등록인원',unknown:'재직·자격·등록 미확인 보존'},authentication:A.clone(currentAuthentication),deployment:A.clone(deploymentStatus.current),notionAddon:{required:false,status:connections.notion}};
  A.spec.informationArchitecture=currentIA;A.spec.currentFunctionalRequirements=currentFeatureRows.map(([id,name,behavior,source])=>({id,name,behavior,source,status:id==='NEXT-01'||id==='STORAGE-111'?(cloudDeployment?'구현 · 실제 검수기록 별도':'구현 대기'):'현재 계약'}));features.splice(0,features.length,...currentFeatureRows);A.spec.currentFeatureContracts=currentFeatureContracts;A.spec.currentDataContracts=currentDataContracts;A.spec.currentNavigation=currentFeatureContracts.navigation;A.spec.featureContracts=currentFeatureContracts;A.spec.dataContracts=currentDataContracts;A.spec.costRules={hierarchy:currentFeatureContracts.CBS.classification,amounts:'원 단위 저장·null과0 구별·같은 비용 1회 합산',reason:'승인된 회사 관리대상과 원자료 근거를 구분',perPyeong:'won / (areaM2 / 3.305785) / 10000'};
  if(originalFeatureContracts.v0133)A.spec.featureContracts.v0133=A.clone(originalFeatureContracts.v0133);
  A.spec.productionContracts={implementationStatus:'보호된 검증 미리보기 · 회사 운영 전환 미완료',authentication:currentAuthentication,centralStorage:{status:connections.centralStorage,implemented:cloudDeployment},authorization:{status:cloudDeployment?'서버 프로젝트 권한 검사 구현·다중사용자 검수 별도':'서버 프로젝트 권한 검증 구현 전'},audit:{status:cloudDeployment?'서버 동일 트랜잭션 구현·실제 범위별 검수 별도':'서버 동일 트랜잭션 구현 전'},documents:'공용폴더 경로 참조. 일반 파일 업로드 미연동',notion:{status:connections.notion,requiredForCore:false}};
  A.spec.delivery={...A.spec.delivery,version:deploymentStatus.version,implementation:deploymentStatus.current.scope,latestUserDecision:nextBehavior,deployment:A.clone(deploymentStatus.current),authenticationImplemented:cloudDeployment,centralStorageImplemented:cloudDeployment,notionConnection:connections.notion,visualQA:'현재 버전 실제 화면·입력·저장·재접속 검수는 별도 기록. PDF·Excel 미검수'};
  A.spec.verification={...A.spec.verification,status:deploymentStatus.current.releaseState,date:deploymentStatus.asOf,visualVerification:'홈·플랫폼 명세 진입 확인',interactionVerification:'CRUD·PDF·Excel 미검수',browser:A.clone(browser),centralStorage:connections.centralStorage,appAuthentication:connections.appAuthentication,notion:connections.notion};
  A.spec.featureContracts.v0111Deployment={scope:deploymentStatus.current.scope,releaseState:deploymentStatus.current.releaseState,authentication:A.clone(currentAuthentication),connections:A.clone(connections),historicalContractsPreserved:true};
  A.spec.history.push({version:'v0.11.0',summary:'기존 핵심 플랫폼 보호 미리보기 배포. 홈·플랫폼 명세 진입 확인, CRUD·PDF·Excel 및 중앙 저장·앱 로그인·Notion 실제 연결은 미완료.'});
 }
 if(A.cloudMode&&deploymentStatus){
  // Current contracts are an explicit projection. Retained prototype prose is
  // historical evidence, never a second competing implementation contract.
  const previous={functionalRequirements:A.spec.functionalRequirements,requirements:A.spec.requirements,acceptanceTests:A.spec.acceptanceTests,interactionRules:A.spec.interactionRules,backendBlueprint:A.spec.backendBlueprint,prototypeBoundary:A.spec.prototypeBoundary,lawMonitoring:A.spec.lawMonitoring,reportingRules:A.spec.reportingRules,dataDomains:A.spec.dataDomains,verification:A.spec.verification,delivery:A.spec.delivery,requirementLedger:A.spec.requirementLedger,costIncreaseContract:A.spec.costIncreaseContract,costChangeContract:A.spec.costChangeContract};
  A.spec.legacyReferences.beforeCenter120={classification:'대체 전 요구·당시 검수·초기 서버 설계',...previous};
  const centerLedger=typeof CENTER120_FIX_LEDGER==='undefined'?{schemaVersion:'center120-fix-ledger-v1',status:'verification-record-not-injected',baselineRelease:'0.11.5',targetRelease:'0.12.0',items:[]}:A.clone(CENTER120_FIX_LEDGER);
  const requestRows=centerLedger.items.map(item=>[item.id,item.title||item.id,item.acceptance||'수용기준 미제공 · 요구별 대장 확인']);
  const requestIds=requestRows.map(row=>row[0]);if(requestIds.some(id=>!/^CENTER120-\d{2}$/.test(id))||new Set(requestIds).size!==requestIds.length)throw Error('현재 승인 요구 ID를 확인해 주세요.');
  const sortedIds=requestIds.slice().sort(),contiguous=sortedIds.length>1&&sortedIds.every((id,i)=>Number(id.slice(-2))===Number(sortedIds[0].slice(-2))+i),requestRange=sortedIds.length?(contiguous?sortedIds[0]+'~'+sortedIds.at(-1).slice(-2):sortedIds.join(', ')):'수정대장 미주입',requestScope={count:requestIds.length,ids:A.clone(requestIds),range:requestRange,source:'CENTER120_FIX_LEDGER.items'};
  deploymentStatus.current.newWork={...deploymentStatus.current.newWork,requestIds:A.clone(requestIds)};
  const artifactContext={version:A.runtime?.version||deploymentStatus.version,origin:A.runtime?.cloudOrigin||null,channel:A.runtime?.cloudOrigin===deploymentStatus.current.officialOrigin?'production-target':A.runtime?.cloudOrigin?'preview-target':'unspecified-target',boundary:'주소 대상은 실제 게시·승격 검증을 뜻하지 않음'};
  const lawStatus=A.clone(deploymentStatus.current.law||{apiImplemented:false,configurationComplete:false,manualCheck:{recordsLiveInLawTab:true,currentCount:null},dailySchedule:{configured:false,naturalRunObserved:false}}),lawDescription=(lawStatus.apiImplemented?'공식 API 서버 경로 구현':'공식 API 구현 상태 미확인')+' · '+(lawStatus.configurationComplete?'연결 설정 완료':'연결 설정 미확인')+' · 수동 정상수집 이력은 법령 탭의 실제 확인기록 기준 · '+(lawStatus.dailySchedule?.configured?'일일 예약 설정':'예약 설정 미확인')+' · '+(lawStatus.dailySchedule?.naturalRunObserved?'자연실행 관찰 이력 별도':'자연실행 미관찰'),lawContract={...lawStatus,source:'공식 API와 보존 원문 버전',schedule:lawDescription,status:'마지막 성공·부분실패·누락구간·설정없음·실패 구별. 빈응답/인증오류는 변경0이 아님',boundary:'수집 기록과 개별 사업의 법적 적용 판단은 별도. 프로젝트 진행일·상태·조치 자동변경 금지'};
  const activeRows=features.map(row=>row.slice());for(const row of requestRows)activeRows.push([...row,'사용자 승인 개발솔루션센터 반영계획']);
  for(const row of activeRows){if(row[0]==='PERMIT-111')row[2]='인허가 목록·맵·상세가 같은 원장을 사용하며 검토의견별 조치계획과 회차·근거·계획일을 보존. 실제 신청/보완/승인일은 해당 단계 발생 시 필수';if(row[0]==='LAW-111')row[2]=lawDescription+' · 프로젝트 판단·일정 자동변경 금지';if(row[0]==='COMPANY-111')row[2]='원사이트 기준정보는 읽기전용·지연조회, 내부 업체·참여·영업기록은 별도 원장으로 보존';}
  features.splice(0,features.length,...activeRows);
  A.spec.currentFunctionalRequirements=activeRows.map(([id,name,behavior,source])=>({id,name,behavior,source,classification:'현행 계약',...(id.startsWith('CENTER120-')?{verification:A.clone(centerLedger.items.find(item=>item.id===id)||{status:'unverified'}),status:'구현·검수 상태는 요구별 대장 참조'}:{status:'현행 계약 · 검증 범위는 버전별 증거 참조'})}));
  A.spec.functionalRequirements=A.spec.currentFunctionalRequirements;
  A.spec.requirements=requestRows.map(([id,name,decision])=>({id,name,decision,classification:'현행 승인 요구',source:'docs/center-20261020-spec.md'}));
  A.spec.requirementLedger={scope:'이번 승인 요구 '+requestScope.count+'개 · '+requestRange+' · 전체 누적대장은 docs/요구사항_누적_체크리스트.md',count:requestScope.count,requestIds:A.clone(requestIds),items:A.clone(centerLedger.items)};
  A.spec.center120FixLedger=centerLedger;
  A.spec.meta.currentPrototypeAssumption='서버가 인증·프로젝트별 권한을 검사한다. 승인 샘플ID3개는 지정메일 인증회원 editor이며 실제 사업은 개별 권한을 유지한다.';
  const auth=A.spec.productionContracts.authentication;
  const apis={
   '/api/session':{methods:['GET','DELETE'],purpose:'현재 세션 확인·로그아웃'},'/api/auth-code':{methods:['POST'],purpose:'최초 가입의 이메일6자리 인증 발송'},'/api/auth-verify':{methods:['POST'],purpose:'인증번호 확인·비밀번호 계정 설정·가입 완료'},'/api/auth-login':{methods:['POST'],purpose:'이메일·비밀번호 로그인'},
   '/api/workspace':{methods:['GET','PUT'],purpose:'접근 가능한 사업 조회·CAS 원자 저장',maxBytes:4000000},'/api/project-access':{methods:['GET','PUT','DELETE'],purpose:'관리자의 프로젝트 권한 조회·설정·회수'},'/api/notion-source':{methods:['GET'],purpose:'관리자 전용 선택 보충자료'},
   '/api/notifications':{methods:['GET','PATCH'],purpose:'개인별 읽음·삭제 상태와 분기 확인과제',patch:{notificationId:'현재 볼 수 있는 알림 식별값',action:['read','delete','restore']},workspaceMutation:false},
   '/api/reference-data':{methods:['GET'],purpose:'업체/법령 기준자료의 인증된 지연조회',kind:['partners','laws'],companyKey:'출처별 상세 식별값·이름만으로 병합하지 않음',workspaceMutation:false},
   '/api/cost-snapshots':{methods:['GET','POST'],purpose:'별도 저장한 시점 목록·상세·현재 서버값 고정',kinds:['quarterly','event','approvedBudget'],versioning:'정정 append·requestId 멱등·expectedRevision 충돌 검사',workspacePayloadGrowth:false},
   '/api/law-search':{methods:['GET'],purpose:'공식 법령·행정규칙·지역 조례·규칙 검색. 사업지 관할·적용은 별도 확인'},'/api/law-detail':{methods:['GET'],purpose:'공식 판본의 조문·부칙·별표 조회'},'/api/law-watch':{methods:['GET','POST'],purpose:'사업별 명시 법령 구독. 공식 본문 대조 후 중복없이 추가하며 적용 판단은 확정하지 않음'},'/api/maintenance':{methods:['GET'],purpose:'서버 비밀값으로 보호한 일일 법령 점검·분기과제 생성',userSessionEntry:false,automaticMoneyCapture:false}
  };
  const compatible={document:['documents'],report:['data','plans','history'],finance:['equity-guarantees','quarters','history'],company:['companies'],cost:['cashflow'],setup:['legacy-only']};
  const currentTabs={...A.clone(A.tabContracts),document:['contracts'],report:['generate'],finance:['loans'],company:['cak-rows','cm-rows','etis-overall_rows','etis-construction_rows','kacem-rows','market','directory'],spec:['overview','functions','sdd','tests','data','history','feedback','json']};
  A.spec.currentNavigation={sidebar:A.clone(A.spec.informationArchitecture),tabs:currentTabs,compatibilityRoutes:compatible,compatibilityRoutesAreCurrentScreens:false,entry:'일반 진입/새로고침 프로젝트 현황, 주 메뉴 첫 세부탭, 명시적 연결 목적지, 프로젝트 변경은 현재 화면 유지'};
  A.spec.currentFeatureContracts={...A.spec.currentFeatureContracts,approvedRequirements:A.clone(requestScope),deployment:{...A.clone(deploymentStatus.current),channels:A.clone(deploymentStatus.channels),artifactContext:A.clone(artifactContext)},navigation:A.spec.currentNavigation,authentication:A.clone(auth),notifications:{location:'사이드바 하단 개인정보 위',layout:'최대720px·80vh, 같은 팝업 목록↔상세',persistence:'개인 상태 전용API. 원문/다른회원/분기과제 완료/전체workspace PUT·감사·전체렌더 불변',failure:'중복클릭 차단·삭제 실패 원복·scroll/focus 유지'},company:{source:'raportal 원사이트 2026-10-20 읽기전용 스냅샷',identity:'출처별 등록번호 또는 출처발표버전·원행ID. 동명이름 임의병합 금지',loading:'기준목록과 상세를 인증 후 해당 화면에서만 조회. 로그인 HTML/Git/전체workspace에 원문 내장 금지',internalBoundary:'업체 기준정보와 내부 메모·영업라인·계약 연결 분리'},permit:{records:'인허가 원장·반복 회차·검토의견별 복수 조치계획',map:'가로 절차·세로 실제 월/분기. 상대월 기본안과 실제 연월 분리',validation:'계획 신청/목표 완료 필수, 실제 신청·보완·승인일은 해당 단계 발생 시 필수. 미발생 공란 허용. 공통 규칙으로 신규/변경/관계 영향범위만 검사',relations:'선행·병렬·통합심의·의제·변경계보를 구별, 의제 상위완료가 하위 실제승인 아님',law:'담당자 실제 적용판단과 조건 추천을 구별. 미확인은 해당없음 아님',navigation:'상세·자식 폼의 X/Escape는 실제 부모로 복귀'},costSnapshots:{comparisonRoles:['최초 언더라이팅','최근 승인예산','현재 준공추정원가'],schedule:'도입 후 첫 도래 달력분기말 확인과제만 자동 생성, 담당자가 분기 기록 저장을 눌러야 별도 고정본 생성',events:'PF·리파이낸싱·도급변경 별도 주요시점, 정기과제 완료와 구별',dates:'분기키·자료기준일·서버 확인시각·정정버전 분리. 현재값을 분기말 당시값으로 소급하지 않음',budget:'editor 정기/주요시점 기록과 approver/admin 승인예산 구별, 정기 기록이 승인예산을 대체하지 않음',storage:'별도 테이블·목록/상세 지연조회. 구형 전체workspace PUT가 고정본을 삭제/덮지 않음'},costPresets:{requiredUses:['복합개발사업','오피스','리테일','호텔','물류','데이터센터','시니어리빙','임대주택','분양주택'],definition:'공식CBS가 정한9개 원가표가 아니라 사업용도별 빈항목 후보 선택',basis:'기존 회사 공통37·비용유형 유지. 임대/분양/운영·독립발주·부담주체·도급포함 여부를 확인해 미리보기 선택',idempotency:'같은 항목 재적용은 저장/감사 없는 무변경',amounts:'추가 금액null, 기존ID·금액·계약·VAT·확정본 보존'},law:lawContract,serverApis:apis};
  for(const key of Object.keys(A.spec.currentFeatureContracts))if(/^v\d/.test(key))delete A.spec.currentFeatureContracts[key];
  A.spec.featureContracts=A.spec.currentFeatureContracts;
  const oldData=A.spec.legacyReferences.originalDataContracts||{},preservedSchemas={};for(const key of ['managementItems','contracts','contractPayments','paymentCoverage','milestones','vatRecords','vatReconciliations','vatApplications','areaVersions','reportDraftOverrides','reportEditBuffer','reportLayout','reportPlanRowOverrides','registrationProfessionals','auditEvents'])if(oldData[key]!==undefined)preservedSchemas[key]=A.clone(oldData[key]);
  A.spec.currentDataContracts={...A.spec.currentDataContracts,approvedRequirements:A.clone(requestScope),deployment:{...A.clone(deploymentStatus.current),channels:A.clone(deploymentStatus.channels),artifactContext:A.clone(artifactContext)},recordSchemas:preservedSchemas,workspace:{revision:'서버 CAS 저장버전',projects:'사용자 권한으로 투영된 원장',limitBytes:4000000,separateServerOwned:['notification_states','reference_snapshots','cost_snapshots','quarterly_tasks','maintenance_runs'],oldWholeWorkspaceCannotOverwriteSeparateData:true},costPresets:{metadata:'costUsePreset · 용도/버전',newAmounts:null,noOpDoesNotAudit:true},permit:{fields:['id','group','stage','plannedApplication','expected','application','supplement','approval','sourcePath','backDataPath','owner','predecessorId','predecessorIds','deemedBy','amendsId','rounds','actionItems'],results:'검토의견',plans:'검토의견별 복수 조치계획',datePolicy:'실제 날짜는 해당 단계 발생 시 필수, 미발생 공란·과거 날짜 원문 보존',validationSource:'shared/permit-domain.mjs',conditions:'확인된 사실/미확인/담당자 적용판단 구분',legacyCompatibility:'기존 단일 날짜·관계·의견 ID와 과거 보고 원본 보존'},notificationState:{key:['user_id','notification_id'],fields:['read_at','deleted_at'],sourceBody:'접근 가능한 프로젝트 원장',legacySharedDismissal:'공용 과거 기록은 보존하고 개인에게 임의 귀속하지 않음'},referenceSnapshot:{summary:['version','checkedAt','source','groups','market'],detail:['companyKey','row','officialComments','fields'],readOnly:true,unknownIsZero:false},costSnapshot:{metadata:['id','projectId','kind','quarterKey','asOfDate','capturedAt','version','reason','correctsId','workspaceRevision','createdBy'],payload:'서버 현재 원단위 사업비·유형코드·계약·비교기준의 당시값',appendOnly:true,quarterlyTaskCompletion:'담당자 해당 분기 기록 저장 때만 완료'},serverApis:apis};
  A.spec.dataContracts=A.spec.currentDataContracts;
  A.spec.backendBlueprint={classification:'현행 서버 계약·구현 범위',runtime:'Vercel Node.js API + Postgres',authentication:'플랫폼 전용 이메일/비밀번호·Better Auth 기반 별도 계정·세션',sharedSupabaseAuthUsed:false,database:{project:'기존 Supabase 프로젝트',schema:'development_project_platform',otherSchemasChanged:false},roles:{project:['viewer','editor','approver'],platform:['platform_admin']},authorization:'서버 세션·12메일 allowlist·프로젝트 멤버십 검사',apis,secrets:'DB·메일·세션·예약 비밀값은 서버 전용, 브라우저/명세 JSON에 값 미포함',verification:'코드 존재와 실제 원격 검수는 별도. 요구별 수정대장의 단계별 상태 확인'};
  A.spec.productionContracts={...A.spec.productionContracts,implementationStatus:deploymentStatus.current.releaseState,authentication:A.clone(auth),centralStorage:{implemented:true,schema:'development_project_platform',sharedAuthUsed:false,otherSchemasChanged:false,write:'서버 CAS·원자저장·권한검사',limitBytes:4000000},authorization:{projectRoles:['viewer','editor','approver'],platformRole:'platform_admin',samplePolicy:'정확한 승인 샘플ID3개에 인증된 지정메일 회원 editor, 기존 approver/admin 보존·일반 로그인 재부여 없음',realProjects:'개별 접근권한 유지'},serverApis:apis,lawCollection:A.spec.currentFeatureContracts.law};
  A.spec.prototypeBoundary={classification:'현행 포함·제외 범위',centralStorageImplemented:true,authenticationImplemented:true,deployment:'정식 앱 주소 공개, 앱 인증·프로젝트 권한 보호 유지',notionRequired:false,profileCollection:'직원 이름·사진 수집은 보류',excluded:['자동 법적 대상판정','실제 AI 파일 자동입력','사내시스템·자금집행 자동연동','회사 운영 전환','기존 서비스·공유 Auth·다른 스키마 변경']};
  A.spec.interactionRules=['편집 가능한 사업비는 본표 같은 셀 더블클릭·Enter 저장·Escape 취소, 상시 수정버튼·별도 중간편집표 없음','사업비 입력·저장은 원 단위 정수, 금액과 증감 표시는 정수 백만원. 미입력과 명시적0 구별','주 메뉴는 첫 세부탭, 일반 진입은 프로젝트 현황. 명시적 연결과 프로젝트 전환의 문맥 보존','팝업 취소·X·Escape는 실제 부모로 복귀하며 닫기 반복을 만들지 않음','개인 알림 읽음·삭제는 원업무/다른회원/분기과제 완료·전체workspace 저장·업무감사를 바꾸지 않음','분기·주요시점 보관은 담당자가 확인 후 저장, 정정은 새버전이고 승인예산과 정기 기록을 구별','추천 인허가 조건의 미확인은 해당없음이 아니며 실제일은 해당 단계 발생 시 필수','조회·후보·입력·저장·합계·이력·분석·Excel·보고서가 같은 이름·역할·단위를 공유해야 함'];
  A.spec.costRules={...A.spec.costRules,displayUnit:'정수 백만원',storedUnit:'원 단위 정수',master:'company-cbs-v4',managementTargets:95,defaultManagementItems:37,optionalManagementItems:58,taxonomyChangedByCenter120:false,comparisonRoles:A.spec.currentFeatureContracts.costSnapshots.comparisonRoles};
  A.spec.costChangeContract={...previous.costChangeContract,classification:'현행 기존 통제확정 규칙·수시 수정과 분기 기록은 별개',periodicSnapshotIsApproval:false,queryComparisonDoesNotResetApproval:true};A.spec.costIncreaseContract=A.spec.costChangeContract;
  A.spec.dataDomains={workspace:['projects','entities','contracts','documents','cbs','costStages','costCoding','permits','auditEvents'],separateServerOwned:['notification_states','reference_snapshots','cost_snapshots','quarterly_tasks','maintenance_runs'],authentication:'전용 계정·세션, 공유 Auth 미사용'};
  A.spec.currentDataContracts.partnerAutomation={source:'서버 전용 reference_snapshots·maintenance_status의 검증된 진행 기록',g2b:{approvedStartDate:'2026-10-20',progressFields:['version','startDate','completedThrough','lastCompletedAt'],windowFields:['version','mode','queriedAt','totals'],modes:['recovery','legacy_observation'],queryTimeZone:'Asia/Seoul',queryPrecision:'minute',futureQueryEndIsCompletion:false,legacyIncompleteRecordsAutoPublished:false,guaranteesAgencyLatePublication:false,scope:'완료 조회구간·실제 처리시각·다음 위치·미처리 구간을 분리. 같은 사건은 멱등 보존, 법인 대응 전 업체 실적으로 확정하지 않음'},providerConnections:{method:'GET /api/maintenance?mode=verify-provider-connections',authentication:'기존 서버 CRON_SECRET',readOnly:true,databaseWrites:0,providerBodyOrCredentialsReturned:false},limits:{sourceResults:624,activeRecords:3000,checkpointBytes:4194304,requests:200,milliseconds:70000,responseBytes:33554432},changedBusinessData:false};
  A.spec.reportingRules={forms:'공식 제1·2호 양식',draft:'모든 셀 편집·보고서만 저장 기본·명확한 연결값만 플랫폼 반영 선택',saved:'과거 canonical 본문·확정 원본 불변',source:'선택 보고일·사업비시점·원천버전 일치, 모르는 금액·날짜·인물 생성 금지',verification:'이전 PDF 위치검수는 당시 증거이며 CENTER120 최종본의 PDF 완료 아님'};
  A.spec.currentFeatureContracts.law.schedule=lawDescription;
  A.spec.lawMonitoring={...A.spec.currentFeatureContracts.law,configuration:lawDescription,configurationComplete:lawStatus.configurationComplete===true,verificationComplete:deploymentStatus.current.newWork.lawDailyCollectionVerified===true&&lawStatus.dailySchedule?.naturalRunObserved===true,lastLegacyReferenceDate:A.spec.legalSourceSnapshot?.dataDate||null,referenceDateIsNotLastDailySuccess:true};
  A.spec.acceptanceTests=requestRows.map(([id,,behavior])=>({id,behavior,status:'요구별 대장의 자동/화면/배포 상태 참조',source:'docs/center-20261020-spec.md'}));
  A.spec.verification={status:'CENTER120 구현·검수 중 · 모든 하위동작 전수 완료 아님',date:deploymentStatus.asOf,baselineRelease:'0.11.5',baselineEvidence:['docs/perf-v0115-verification.json','docs/auth-v0114-verification.json','docs/server-log-verification-20261019.json'],baselineIsNewFeatureAcceptance:false,requirements:A.clone(centerLedger.items),actionInventory:{script:'scripts/center120-action-inventory.mjs',output:'.build/center120-action-inventory.json',discovery:'등록handler/렌더링 action/폼/inline/키보드/드래그/조건 정적 후보 + 실제 화면에서 추가 발견',executionStatus:'소스에서 발견한 동작은 미검증으로 시작. 실제 진입·저장·취소·출력 증거가 있어야 실행 완료',staticHandlerCountIsExecutedCount:false},desktopViewports:['1280×800','1440×900','1600×1000'],mobile:'로그인·알림',noInheritedPassCounts:true,finalFingerprintRequired:true};
  A.spec.delivery={version:deploymentStatus.version,implementation:deploymentStatus.current.scope,runtimeConnections:'플랫폼 전용 인증·Vercel API·development_project_platform 중앙 DB 연결. 기존 서비스/공유 Auth/다른 스키마와 분리',latestUserDecision:'사용자 승인 요구 '+requestRange+' 구현·검증',approvedRequestIds:A.clone(requestIds),artifactContext:A.clone(artifactContext),deployment:A.clone(deploymentStatus.current),authenticationImplemented:true,centralStorageImplemented:true,sampleDataDate:null,sourceSpecificDates:true,lawDataDate:A.spec.legalSourceSnapshot?.dataDate||null,newFeatureDeploymentVerified:false,visualQA:'구현·집중 자동검사·격리 화면검수와 실제 최종 배포·DB 검수를 구분. 수정대장 참조'};
  A.spec.specificationSections={current:{classification:'현행 계약',keys:['meta','informationArchitecture','functionalRequirements','featureContracts','dataContracts','productionContracts','backendBlueprint','interactionRules','costRules','prototypeBoundary','delivery'],requirements:requestRange,requestIds:A.clone(requestIds),count:requestScope.count,version:deploymentStatus.version},superseded:{classification:'대체된 요구',authenticationPolicies:A.clone(deploymentStatus.superseded),requirements:A.clone(A.spec.supersededRequirements||[]),historicalSources:'legacyReferences의 과거 계약은 현재 구현이 아님'},historicalVerification:{classification:'당시 검수',history:A.clone(A.spec.history),priorMetadata:previous.verification,evidence:['docs/auth-v0114-verification.json','docs/perf-v0115-verification.json','docs/server-log-verification-20261019.json'],boundary:'과거 통과·중간 캡처는 CENTER120 최종본의 통과가 아님'},future:{classification:'향후 계획',items:['개발솔루션센터 최종 사업비 공통 틀 확정','실제 사업 확대·부서별 입력 책임 확정','AI 파일 자동입력','자금집행 자동연동','직원 이름·사진·그룹웨어 연동','회사 정식 운영·회사 도메인 연결'],notImplementedByThisPlan:true}};
  for(const [version,summary,evidence]of [['v0.11.1','전용 스키마 중앙 저장·플랫폼 전용 인증 경계 도입','docs/deployment-v0111-spec.md'],['v0.11.2','지정12메일·최초 메일 확인과 비밀번호 가입/재로그인','docs/auth-v0112-spec.md'],['v0.11.3','정식 주소 공개·이전 검증 주소 보호 경계','docs/public-v0113-spec.md'],['v0.11.4','기본8시간·선택7일 고정만료·이메일만 기억','docs/auth-v0114-verification.json'],['v0.11.5','로그인 준비·중복조회/렌더·폰트·원가 계산 성능 교정. 증거 범위는 당시 검수기록','docs/perf-v0115-verification.json']])if(!A.spec.history.some(item=>item.version===version))A.spec.history.push({version,summary,classification:'당시 개발·검수 이력',evidence});
  A.spec.specificationSections.historicalVerification.history=A.clone(A.spec.history);
 }
 if(A.cloudMode&&typeof FOLLOWUP121_FIX_LEDGER!=='undefined'){
  const followup=A.clone(FOLLOWUP121_FIX_LEDGER),ids=followup.items.map(row=>row.id),scope={count:ids.length,ids,range:ids.length?ids[0]+'~'+ids.at(-1).slice(-2):'후속 요구 없음'};
  A.spec.followup121=followup;A.spec.requirementLedger.followup={...scope,source:'docs/followup-20261021-fix-ledger.json',items:A.clone(followup.items)};
  const contract={approvedRequirements:scope,costBreakdown:{optional:true,selection:'기존 표준유형 선택 또는 상위 확인코드의 자유 세부내역명',initialSplitRequiresExactSum:true,parentAndChildDoubleCount:false,unknownIsZero:false,history:'추가·수정·삭제의 전후/사유·근거 보존',serverBoundary:'구조·원금액/최초전환메타 보존·금액합계·확인코드 검사'},lawComparison:{source:'공식 개정문·신구조문/확인된 직전판본',omissionsAreComplete:false,viewCreatesReview:false,projectRelation:'후보/미확인과 담당자의 명시적 판단을 구별'},sidebar:{expanded:'text-only',collapsed:'fully-hidden',reopen:'바깥 글자 버튼',bodyIconsChanged:false},permitRecommendation:{status:'추천 UX 교정·검수 중',selection:'섹터/사업방식 기본값과 추천/전체 선택 유지',input:'필수검증은 유지하고 선택N개 전체상세폼 연속 진입을 정리',conditions:'사업별 확인값·추천이유·미확인·법령/조례 근거 연결'},history:'첫 팝업 한 표의 전후·증감·사유·담당/시각·원 단위 정확도'};
  A.spec.currentFeatureContracts.followup121=contract;A.spec.currentDataContracts.followup121={...A.clone(contract),costBreakdownFields:['costBreakdown.version','costBreakdown.childIds','costBreakdown.activatedFromAmount','costBreakdown.activatedAt','costBreakdown.reason','costBreakdown.sourcePath','breakdownParentId','breakdownInputMode'],sample:'정확한 승인 가상사업·샘플 법인만. 기존 원장·금액/과거확정본·실제 법령/직원 사실 보존'};
  A.spec.delivery.followupRequestIds=A.clone(ids);A.spec.delivery.followupDeploymentVerified=followup.deploymentVerified===true;A.spec.verification.followupRequirements=A.clone(followup);
  if(!A.spec.history.some(row=>row.version==='v0.12.1'))A.spec.history.push({version:'v0.12.1',summary:'FUP121 후속 요구: 선택적 비용분해·공식 조문 비교·샘플/이력·사이드바·인허가 추천 UX. 실제 상태는 후속대장 참조',classification:'후속 구현·검수 중',evidence:'docs/followup-20261021-fix-ledger.json'});
 }
 if(A.cloudMode&&typeof UX122_FIX_LEDGER!=='undefined'){
  A.spec.ux122=A.clone(UX122_FIX_LEDGER);
  A.spec.currentFeatureContracts.ux122={source:'docs/ux-20261022-spec.md',costInfoPopup:false,costActions:'본표 관리 메뉴·같은 셀 금액편집·직접 이력',lawDetail:'법령·공포/시행·실제 변경·정확 공식 비교/원문',lawSort:['법령/조항','공포일','시행일'],unfoundedProjectTable:false,providerWorkStatusExplanations:false,actualReviewRecordsPreserved:true};
  A.spec.verification.ux122=A.clone(UX122_FIX_LEDGER);
  A.spec.history.push({version:'v0.12.2',summary:'비용 설명창 제거·직접 관리, 법령 목록/상세의 실제 변경과 공식 비교 링크·정렬. 전체 컴포넌트 필요성 점검은 별도 상태로 기록',classification:'구현·검수 중',evidence:'docs/ux-20261022-fix-ledger.json'});
 }
 if(A.cloudMode&&typeof AUTO123_FIX_LEDGER!=='undefined'){
  A.spec.auto123=A.clone(AUTO123_FIX_LEDGER);A.spec.verification.auto123=A.clone(AUTO123_FIX_LEDGER);
  A.spec.currentFeatureContracts.auto123={source:'docs/recheck-20261022-spec.md',comparison:{automaticTrigger:'open-selected-law-detail',dailyPrecomputation:false,verifiedAndUnavailableAndRetryableAreDistinct:true,sourceUnavailableIsNotNoChange:true,unknownNetworkFailureIsNotOfficialNonProvision:true,workspaceWritesOnRead:false},market:{selectedEndpointsDriveSummaryChartAxesAndTooltip:true,samePeriodDistinctVersionsRemainDistinct:true,missingExplicitSelectionDoesNotUseLatest:true,originalRecordsUnchanged:true},allRolesAndConditionsVerified:false};
  A.spec.history.push({version:'v0.12.3',summary:'AUTO123-01~03 자동 법령 비교의 미제공/실패·재시도 구분, 선택한 시장판본과 그래프 일치, 전체 요구의 확인/미검증 구분',classification:'이번 빌드의 재검토·검수 상태는 AUTO123 대장 참조',evidence:'docs/recheck-20261022-ledger.json'});
 }
 if(A.realMode){delete A.spec.dataContracts.reportExample;delete A.spec.featureContracts.reportExample;}
 A.register('spec',()=>{
   const tabs=[['overview','개요'],['functions','기능정의서'],['sdd','SDD'],['tests','TDD·검수'],['data','데이터 구조'],['history','개발이력'],['feedback','피드백'],['json','전체 JSON']];
   A.ui.tabs.spec=A.ui.tabs.spec||'overview';const active=A.ui.tabs.spec;let content='';
   const pre=x=>'<pre class="spec-json">'+A.esc(JSON.stringify(x,null,2))+'</pre>';
   if(A.cloudMode&&A.spec.specificationSections){
    const sections=A.spec.specificationSections,current=A.spec.deploymentStatus?.current||{},ledger=A.spec.center120FixLedger||{items:[]};
    if(active==='overview')content=A.table(['항목','내용'],[['기준 버전',A.spec.meta.version],['이번 승인 요구',A.spec.requirementLedger.count+'개 · '+A.spec.specificationSections.current.requirements],['명세 구분','현행 계약 / 대체된 요구 / 당시 검수 / 향후 계획'],['정식 주소',current.officialOrigin||'https://igis-development-project-platform.vercel.app'],['배포 상태',current.releaseState||'최종 검수 중'],['앱 로그인',A.spec.productionContracts.authentication.identity+' · '+A.spec.productionContracts.authentication.verification],['로그인 유지','기본8시간 / 선택7일 고정만료 · 브라우저에는 이메일만 기억'],['중앙 저장',A.spec.delivery.runtimeConnections],['샘플 접근',A.spec.productionContracts.authorization.samplePolicy],['사업비 기준','회사 공통37개·선택58개·기존 CBS 유형 유지'],['사업비 보관','수시 수정 / 분기말 확인과제 / 담당자 저장 고정본 / 승인예산 분리'],['인허가','기본경로+조건별 추천 · 목록/맵 동일원장 · 실제일은 발생단계 필수'],['법령 일일 확인',A.spec.lawMonitoring.configuration],['과거 법령 참고본',A.spec.legalSourceSnapshot?.dataDate||'자료 없음'],['현재 검수 상태',A.spec.verification.status],['전체 동작 검수','정적 동작 인벤토리는 실행 수가 아님. 요구별 자동/화면/배포 상태 분리'],['추가 데이터',current.connections?.notion||'Notion은 관리자 선택 보충자료']].map(([key,value])=>[A.esc(key),A.esc(value)]));
    else if(active==='functions')content=A.table(['ID','기능','현행 동작','검수 상태'],A.spec.currentFunctionalRequirements.map(row=>[A.esc(row.id),A.esc(row.name),'<div class="wrap">'+A.esc(row.behavior)+'</div>',A.esc(row.status)]));
    else if(active==='sdd')content=pre({classification:'현행 계약',features:A.spec.currentFeatureContracts,production:A.spec.productionContracts,server:A.spec.backendBlueprint,preservation:A.spec.prototypeBoundary,future:sections.future});
    else if(active==='data')content=pre({classification:'현행 데이터·API 계약',contracts:A.spec.currentDataContracts});
    else if(active==='tests')content=pre({classification:'현행 검수 상태 · 당시 검수와 구별',current:A.spec.verification,requirements:ledger,scenarios:A.spec.acceptanceTests,historicalVerification:sections.historicalVerification});
    else if(active==='history')content='<h3>당시 개발·검수 기록</h3>'+A.table(['버전','변경·근거'],A.spec.history.map(row=>[A.esc(row.version),'<div class="wrap">'+A.esc(row.summary)+(row.evidence?'<br>'+A.esc(row.evidence):'')+'</div>']))+'<h3>현재 업무 변경이력</h3>'+A.table(['시각','프로젝트','행위','변경내용'],A.state.auditEvents.slice(0,100).map(row=>[A.esc(A.formatTimestamp(row.at)),A.esc(row.projectId),A.esc(row.action),A.btn('변경 전후','audit-detail',{id:row.id})]));
    else if(active==='feedback')content=pre({currentApproved:A.spec.requirements,superseded:sections.superseded,historicalFeedback:{classification:'당시 피드백 · 현재 승인 요구와 충돌하면 현행 우선',records:A.spec.feedback},future:sections.future});
    else content=pre(A.spec);
    if(A.spec.followup121&&['overview','functions','tests','feedback'].includes(active))content+=A.table(['후속 요구','내용','현재 상태'],A.spec.followup121.items.map(row=>[A.esc(row.id),'<div class="wrap">'+A.esc(row.name)+' · '+A.esc(row.requirement)+'</div>',A.esc(row.status==='accepted'?'문서 게시·검수 확인':row.status==='prepared-not-applied'?'준비됨 · 중앙 적용 전':'수정·검수 중 · 최종 반영 별도')]));
    if(A.spec.ux122&&['overview','functions','tests','feedback'].includes(active))content+=A.table(['후속 요구','내용','현재 상태'],A.spec.ux122.items.map(row=>[A.esc(row.id),A.esc(row.name),A.esc(row.status)]));
    if(A.spec.auto123&&['overview','functions','tests','feedback'].includes(active))content+=A.table(['이번 재검토','내용','빌드 시점 상태'],A.spec.auto123.items.map(row=>[A.esc(row.id),A.esc(row.name),A.esc(row.status)]));
    return A.tabs('spec',tabs)+A.panel('플랫폼 명세 v'+A.spec.meta.version,content,A.btn('JSON 복사','spec-copy')+A.btn('명세 내려받기','export-spec')+A.btn('전체 데이터 내려받기','export-data'));
   }
   if(active==='overview'){const deployment=A.spec.deploymentStatus,current=deployment?.current,browser=current?.browserVerification||{},connections=current?.connections||{},rows=[['버전',A.spec.meta.version],['누적 기준 요구사항',A.spec.requirementLedger.items.length+'항목'],['최근 보존 수정대장','v0.10.33 · '+(A.spec.v0133FixLedger?.items.length||0)+'건'],['운영 범위',current?.scope||'로컬 HTML'],['배포 상태',current?.releaseState||'미배포'],['실제 화면 확인',browser.home==='확인'&&browser.spec==='확인'?'홈·명세 진입 확인':'미검수'],['남은 실제 검수','CRUD·PDF·Excel '+([browser.crud,browser.pdf,browser.xlsx].every(value=>value==='확인')?'확인':'미검수')],['중앙 저장','중앙 저장 '+(connections.centralStorage||'미연동')],['앱 로그인','앱 로그인 '+(connections.appAuthentication||'미구현')],['인증 정책',A.spec.productionContracts.authentication?.identity+' · '+A.spec.productionContracts.authentication?.verification],['Notion',connections.notion||'선택 보충자료 · 미연동'],['공식 법령 확인일',A.spec.legalSourceSnapshot?.dataDate||'자료 없음'],['참고모델 검토','이전 전체 검토139시트 · v30의4모델 관련범위 재대조 이력 보존'],['사업비 양식','서리풀 관리수준·같은 사건 비용 묶음·중요 예산 통제'],['용도별 사업비 프리셋','9종 구현 · 검수기록 별도'],['검수기록','v'+A.spec.meta.version]];content=A.table(['항목','내용'],rows);}
   else if(active==='functions')content=A.table(['ID','기능','동작','근거'],features.map(([id,name,behavior,source])=>[A.esc(id),A.esc(name),'<div class="wrap">'+A.esc(behavior)+'</div>',A.esc(source)]));
   else if(active==='sdd')content=pre({features:A.spec.currentFeatureContracts||A.spec.featureContracts,production:A.spec.productionContracts,migration:A.spec.migration,report:A.spec.reportLayoutContract});
   else if(active==='data')content=pre(A.spec.currentDataContracts||A.spec.dataContracts);
   else if(active==='tests')content=pre({verification:A.spec.verification,requirements:A.spec.requirementLedger,scenarios:A.spec.acceptanceTests,restoration:A.spec.recovery});
   else if(active==='history')content=A.table(['버전','변경'],A.spec.history.map(x=>[A.esc(x.version),'<div class="wrap">'+A.esc(x.summary)+'</div>']))+A.table(['시각','프로젝트','행위','변경내용'],A.state.auditEvents.slice(0,100).map(x=>[A.esc(x.at),A.esc(x.projectId),A.esc(x.action),A.btn('변경 전후','audit-detail',{id:x.id})]));
   else if(active==='feedback')content=pre({previous:A.spec.feedback,decisions:A.spec.requirements});
   else content=pre(A.spec);
   return A.tabs('spec',tabs)+A.panel('플랫폼 명세 v'+A.spec.meta.version,content,A.btn('JSON 복사','spec-copy')+A.btn('명세 내려받기','export-spec')+A.btn('전체 데이터 내려받기','export-data'));
 });
})(App);
