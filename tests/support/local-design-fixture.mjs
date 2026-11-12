// Synthetic test fixture only, never a fallback for the local workspace. No credentials, source files or network services.
const asOf = '2026-11-04';
const masterVersion = 'company-cbs-v4';
const categories = [
  ['land', '1000', '토지·권리비'], ['direct', '2000', '직접공사비'],
  ['indirect', '3000', '간접공사비'], ['design', '4000', '설계·감리·사업관리비'],
  ['permit', '5000', '인허가·평가·인증비'], ['levy', '6000', '부담금·분담금·공공기여'],
  ['tax', '7000', '제세공과금·보험·보증'], ['finance', '8000', '금융비용'],
  ['sales', '9000', '임대·분양·운영준비비'], ['contingency', 'A000', '예비비·위험충당액'],
];

function budget(id, amounts) {
  const cbs = categories.map(([key, code, name], sortOrder) => ({
    id: id + '-group-' + key, parentId: null, dictionaryKey: key, code, name,
    sortOrder, current: null, initial: null, costPurposeEmpty: true, sourceIds: [], deletedAt: null,
  }));
  const currentByRecordId = {};
  for (const [group, key, name, initial, current] of amounts) {
    const root = cbs.find(row => row.dictionaryKey === group);
    const recordId = id + '-' + key;
    const link = {recordId, costTypeId: key, costTypeCode: 'IGIS-COST:' + key,
      masterVersion, costTypeMappingStatus: 'confirmed', reason: '로컬 샘플 예산', method: 'explicit', entryRole: 'posting', kind: 'expense'};
    cbs.push({id: recordId, parentId: root.id, code: root.code + '.M01', name,
      sortOrder: 0, sourceIds: [], managementAccount: true, companyProfileKey: key,
      templateKey: key, modelCatalogKey: 'cost-target:' + key, budgetState: 'active',
      applicability: '적용', currentEvidenceResolved: true, current, initial,
      costTypeId: key, costTypeCode: link.costTypeCode, masterVersion, deletedAt: null});
    currentByRecordId[recordId] = link;
  }
  return {cbs, cbsManagementVersion: 3, cbsCatalogVersion: 4,
    companyCostTaxonomyVersion: 'company-cost-taxonomy-v4',
    costCoding: {version: 1, masterVersion, currentByRecordId, historicalByStageId: {}}};
}

function project(id, built) {
  const key = suffix => id + '-' + suffix;
  const name = built ? '샘플 · 온빛 업무센터' : '샘플 · 잔솔 임대주택';
  const district = built ? '가상시 온빛지구' : '가상시 잔솔지구';
  const type = built ? '오피스' : '임대주택';
  const siteArea = built ? 4200 : 2800;
  const landBudget = built ? 21500000000 : 9200000000;
  const design = built ? 800000000 : 390000000;
  const contractNet = built ? 750000000 : 300000000;
  const vat = contractNet / 10;
  const operator = (built ? '온빛' : '잔솔') + ' 가상사업법인';
  const manager = built ? '샘플 담당자 A' : '샘플 담당자 B';
  const contractParty = '샘플 설계사무소';
  const permitName = built ? '건축허가' : '교통영향평가';
  const catalogId = built ? 'permit-catalog-2-1' : 'permit-catalog-3-2';
  return {
    id, name, entityId: key('entity'), type, location: district, asOf,
    stage: built ? '공사 중' : '인허가', active: true,
    basic: {operator, manager, managerRef: {employeeId: built ? 'LOCAL-EMP-01' : 'LOCAL-EMP-02', name: manager, email: null}, method: '민간개발', fundName: (built ? '온빛' : '잔솔') + ' 샘플 펀드',
      periodStart: '2026-01-01', periodEnd: built ? '2028-06-30' : '2029-03-31'},
    building: {siteArea, acquisitionLandArea: siteArea, gfaTotal: built ? 21500 : 11200,
      buildingArea: built ? 1800 : 1200, floorsAbove: built ? 10 : 8, floorsBelow: 2,
      zone: '가상 계획구역', mainUse: type, representativeLot: district + ' 1블록'},
    ...budget(id, [
      ['land', 'land_purchase', '토지매입비', landBudget, landBudget],
      ['direct', 'direct_main', '도급공사비', built ? 33000000000 : null, built ? 35000000000 : null],
      ['design', 'design_main', '설계비', design, design],
    ]),
    costs: [], costStages: [], areaHistory: [], areaVersions: [],
    contracts: [{id: key('contract'), name: '기본·실시설계 용역', counterparty: contractParty,
      type: '용역', status: '체결', cbsId: key('design_main'),
      revisions: [{id: key('contract-rev1'), revision: 1, date: '2026-03-12',
        total: contractNet + vat, net: contractNet, vat, costAmount: contractNet,
        allocations: [{cbsId: key('design_main'), amount: contractNet}],
        file: '샘플자료/설계계약서(가상).pdf'}], obligations: [], certifications: [], payments: []}],
    documents: [{id: key('doc'), title: built ? '착공회의 검토사항' : '배치계획 검토의견',
      category: '회의록', number: built ? 'ON-001' : 'JAN-001', date: '2026-10-28',
      issuer: contractParty, recipient: operator, revision: 1, versionGroup: key('doc-group'),
      status: '등록', isCurrent: true, related: '설계', location: '샘플자료/검토회의록(가상).pdf'}],
    milestones: [
      {id: key('schedule-1'), name: '설계 계약', planned: '2026-03-12', actual: '2026-03-12', expected: '2026-03-12', status: '완료', sortOrder: 0, detail: '기본·실시설계 범위 확정'},
      {id: key('schedule-2'), name: built ? '골조 중간점검' : '배치계획 보완 제출', planned: '2026-11-20', expected: '2026-11-24', actual: '', status: '예정', sortOrder: 1, detail: '샘플 검토 일정'},
    ],
    loans: [{id: key('loan'), name: built ? '선순위 PF' : '토지 브릿지론',
      institution: '샘플 금융기관', type: built ? '본PF' : '브릿지론', rank: '선순위', classification: '대출',
      commitment: built ? 40000000000 : 8000000000, balance: built ? 24000000000 : 5000000000,
      rate: built ? 4.5 : 5.2, start: '2026-04-01', maturity: built ? '2028-09-30' : '2027-04-01'}],
    equities: [{id: key('equity'), company: operator, amount: built ? 20000000000 : 5000000000}],
    guarantees: [], land: {seller: '샘플 토지보유사', purchasePrice: landBudget, titleSecured: built ? '예' : '아니오'},
    landParcels: [{id: key('parcel'), name: district + ' 1블록', area: siteArea, owner: built ? operator : '샘플 토지보유사', right: built ? '소유권 확보' : '검토 중'}],
    landContracts: [], landPaymentSchedule: [], projectDates: {}, progressAsOf: built ? asOf : '',
    construction: built ? {plannedProgress: 31, actualProgress: 28} : {}, progressHistory: [],
    permits: [{id: key('permit'), name: permitName, detail: permitName, catalogId, typeId: 'company-permit:' + catalogId,
      group: built ? '건축·심의' : '영향평가', stage: built ? '완료' : '신청', active: true,
      agency: '가상시 인허가팀', owner: manager, handling: '별도 진행', requestType: '최초',
      plannedApplication: '2026-03-20', application: '2026-03-24',
      expected: built ? '2026-08-20' : '2026-12-10', approval: built ? '2026-08-20' : '',
      sourcePath: '샘플자료/인허가 검토기록', reportCategory: '공사시행', reportTrigger: '인가·허가',
      actionItems: [], rounds: [], predecessorIds: [], integratedWith: []}],
    sales: [], reports: [], reportSnapshots: [], reportDraftOverrides: [],
    reportParticipants: {contractors: [], trustees: [], guarantors: []},
    reportForm: {}, vatRecords: [], fundForecasts: [], fundPayments: [],
  };
}

export function createSampleState() {
  const projects = [project('LOCAL-OFFICE', true), project('LOCAL-HOUSING', false)];
  return {version: '0.13.0', storageRevision: 0, currentProjectId: projects[0].id,
    selectedProjectId: projects[0].id, projects,
    entities: projects.map(p => ({id: p.entityId, name: p.basic.operator, route: '일반법인', professionalRecords: []})),
    auditEvents: [], notifications: [], companies: [], lawCatalog: [], lawChanges: [],
    lawUpdateRuns: [], projectLawImpacts: [], migrationConflicts: [], integrityIssues: [], storageQuarantine: [],
    sourceLoad: {status: 'unavailable', schemaVersion: 'notion-development-projects-v1',
      expectedCount: null, actualCount: 0, hasMore: null, syncedAt: ''}};
}
