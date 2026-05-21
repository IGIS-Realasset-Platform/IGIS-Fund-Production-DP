const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, 'qa-artifacts/logistics-gate6/supabase-page-source-audit-20260520');
fs.mkdirSync(outDir, { recursive: true });

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readIfExists = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : '';
};
const readJson = (relativePath) => JSON.parse(read(relativePath));

function readEnv() {
  const env = {};
  const source = readIfExists('.env');
  source.split(/\r?\n/u).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const index = trimmed.indexOf('=');
    if (index < 0) return;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1).replace(/^["']|["']$/gu, '');
  });
  return env;
}

async function invokeDashboardApi(action, payload = {}) {
  const env = readEnv();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  const response = await fetch(`${supabaseUrl.replace(/\/$/u, '')}/functions/v1/ll-dashboard-api`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      origin: 'https://kylee94.github.io',
    },
    body: JSON.stringify({ action, payload }),
  });
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  return {
    status: response.status,
    ok: response.ok && body?.ok !== false,
    body,
  };
}

function has(source, pattern) {
  return typeof pattern === 'string' ? source.includes(pattern) : pattern.test(source);
}

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function checklistStatus({ liveRead, staticFallback, readbackEvidence, pageConnected }) {
  if (liveRead && pageConnected && !staticFallback) return 'done';
  if (liveRead || readbackEvidence || pageConnected) return 'partial';
  return 'todo';
}

(async () => {
  const workspace = read('src/components/system/workspace/WorkspaceLogistics.jsx');
  const edge = read('supabase/functions/ll-dashboard-api/index.ts');
  const tracker = readJson('qa-artifacts/logistics-gate6/gate6-progress-tracker-20260515.json');
  const assetOptions = readJson('src/components/system/workspace/logisticsAssetOptionsData.json');
  const weeklyReport = readJson('src/components/system/workspace/logisticsWeeklyReportData.json');
  const homeData = readJson('src/components/system/workspace/logisticsHomeData.json');
  const arenaYangji = readJson('src/components/system/workspace/logisticsAssetData/asset_a112127001.json');
  const cleanupInventory = readIfExists('qa-artifacts/logistics-gate6/supabase-schema-cleanup-inventory-20260519.md');
  const dbHistoryReadback = readIfExists('qa-artifacts/logistics-gate6/source-supabase-target-reconciliation-20260518/db-history-full-linkage-readback-20260519.md');

  const weeklyPreview = await invokeDashboardApi('weekly-assets/latest-preview', { email: '10524@igisam.com' }).catch((error) => ({
    status: 0,
    ok: false,
    error: error.message,
    body: {},
  }));
  const weeklyRows = weeklyPreview.body?.data?.rows || [];

  const imports = {
    weeklyReportData: has(workspace, "import weeklyReportData from './logisticsWeeklyReportData.json'"),
    homeData: has(workspace, "import homeData from './logisticsHomeData.json'"),
    assetPayloads: has(workspace, "import.meta.glob('./logisticsAssetData/*.json'"),
    companyPayloads: has(workspace, "import.meta.glob('./logisticsCompanyData/*.json'"),
    sectorData: has(workspace, "import sectorData from './logisticsSectorData.json'"),
  };

  const sourceMap = [
    {
      area: 'Work Platform 관리 Project 현황',
      status: checklistStatus({
        liveRead: weeklyPreview.ok && weeklyRows.length === 20,
        staticFallback: false,
        pageConnected: has(workspace, "action: 'weekly-assets/latest'") && has(workspace, "action: 'weekly-assets/latest-preview'"),
      }),
      supabaseTables: ['ll_weekly_reports', 'll_weekly_assets'],
      pageEvidence: ['weekly-assets/latest', 'weekly-assets/latest-preview'],
      readback: {
        ok: weeklyPreview.ok,
        status: weeklyPreview.status,
        rows: weeklyRows.length,
        reportId: weeklyPreview.body?.data?.report_id || null,
        hasArenaYangji: weeklyRows.some((row) => String(row.assetName || '').includes('아레나스양지')),
      },
      remainingRisk: weeklyRows.length ? '없음: 화면 표는 Supabase 최신 20행을 읽음' : 'Edge readback 실패 시 빈 표가 될 수 있음',
    },
    {
      area: 'Asset 자산개요·투자개요',
      status: checklistStatus({
        liveRead: has(edge, "action === 'weekly-projects/get-asset-detail'"),
        staticFallback: has(workspace, 'findManagementProjectForAsset(assetName)') && has(workspace, 'weeklyReportData.managementProjects'),
        pageConnected: has(workspace, "action: 'weekly-projects/get-asset-detail'") && has(workspace, "action: 'weekly-projects/save-asset-detail'"),
      }),
      supabaseTables: ['ll_weekly_projects', 'll_weekly_reports'],
      pageEvidence: ['weekly-projects/get-asset-detail', 'weekly-projects/save-asset-detail'],
      readback: {
        managementProjectsInStaticSource: weeklyReport.managementProjects?.length || 0,
        liveEndpointExists: has(edge, 'getWeeklyProjectAssetDetail'),
      },
      remainingRisk: '인증 Edge readback 성공 시 Supabase row 우선, 실패/빈 row일 때 static weeklyReportData fallback이 남아 있음',
    },
    {
      area: 'DB_히스토리 누적 migration/linkage',
      status: dbHistoryReadback.includes('Contract-history rows linked to contract/lease row | 162 | pass') ? 'done' : 'partial',
      supabaseTables: ['ll_sheet_rows', 'll_source_cells', 'll_rent_history'],
      pageEvidence: ['asset_a112127001 normalizedRows', 'current-request-data-task-static-qa'],
      readback: {
        dbHistoryRowsInReadback: dbHistoryReadback.includes('Excel `DB_히스토리 누적` source rows | 164 | read'),
        rentHistoryLinked162: dbHistoryReadback.includes('Contract-history rows linked to contract/lease row | 162 | pass'),
        arenaYangjiPayloadRows: arenaYangji.normalizedRows?.length || 0,
        arenaYangjiRowsWithExpiry: (arenaYangji.normalizedRows || []).filter((row) => row.currentEndDate || row.latestExpiry || row.earliestExpiry).length,
      },
      remainingRisk: 'Data Quality에서 source-only 2행을 원본 보완 대상으로 노출하는 UI는 남아 있음',
    },
    {
      area: 'Home/Asset/Company 핵심 Dashboard 데이터',
      status: 'partial',
      supabaseTables: ['ll_assets', 'll_lease_spaces', 'll_rent_history', 'll_tenants', 'll_dashboard_metric_snapshots', 'll_payload_snapshots'],
      pageEvidence: ['logisticsHomeData.json', 'logisticsAssetData/*.json', 'logisticsCompanyData/*.json'],
      readback: {
        localAssetOptions: assetOptions.length,
        homeKpiCount: homeData.kpis?.length || 0,
        assetPayloadImport: imports.assetPayloads,
        companyPayloadImport: imports.companyPayloads,
        dashboardMetricRefreshEndpoint: has(edge, "action === 'dashboard-metrics/refresh'"),
        dashboardMetricSnapshotRowsFromInventory: cleanupInventory.match(/\| ll_dashboard_metric_snapshots \| ([0-9,]+)/u)?.[1] || null,
      },
      remainingRisk: '화면 계산은 아직 빌드 시점 JSON payload를 주로 사용함. Supabase snapshot/readback을 화면 데이터 소스로 직접 읽는 API/프론트 연결은 추가 작업 필요',
    },
    {
      area: 'PDF Report 데이터 소스',
      status: 'partial',
      supabaseTables: ['ll_assets', 'll_weekly_projects', 'll_weekly_assets', 'll_dashboard_metric_snapshots'],
      pageEvidence: ['assetOptionsData', 'ASSET_PAYLOADS', 'selectedWeeklyAssetRow'],
      readback: {
        usesAssetOptions: has(workspace, 'const readableAssets = useMemo(() => filterAssetsByPermission(assetOptionsData, permission)'),
        usesAssetPayloads: countMatches(workspace, /ASSET_PAYLOADS\[asset\.assetId\]/gu),
        usesWeeklyStaticRows: has(workspace, 'selectedWeeklyAssetRow = normalizeWeeklyAssetRows(weeklyReportData.assetRows || [])'),
      },
      remainingRisk: 'PDF Report는 권한 필터는 적용하지만 지도/자산개요/투자개요 포함 데이터가 정적 payload와 일부 weekly static fallback을 사용함. 지도 렌더링 문제는 Stage 4에서 별도 수정 필요',
    },
    {
      area: 'Supabase schema cleanup/optimization',
      status: cleanupInventory.includes('## 정리 후보') ? 'partial' : 'todo',
      supabaseTables: ['ll_worklogs', 'll_payload_snapshots', 'll_dashboard_metric_snapshots', 'source_payload/review columns'],
      pageEvidence: ['supabase-schema-cleanup-inventory-20260519.md'],
      readback: {
        inventoryExists: Boolean(cleanupInventory),
        rowCountTableFound: cleanupInventory.includes('| ll_assets | 17 |'),
        cleanupCandidatesFound: cleanupInventory.includes('ll_worklogs') && cleanupInventory.includes('source_payload'),
      },
      remainingRisk: '삭제/정리는 아직 preview 단계. 사용처 0건, rollback SQL, readback query를 만든 뒤 별도 승인 배치로 처리해야 함',
    },
  ];

  const result = {
    generatedAt: new Date().toISOString(),
    mutationPerformed: false,
    branch: 'codex/logistics-gate6-post-deploy-updates',
    projectRef: 'qvegpozwrcmspdvjokiz',
    importStaticJsonFlags: imports,
    trackerSummary: {
      totalDone: tracker.stages.reduce((sum, stage) => sum + stage.items.filter((item) => item.status === 'done').length, 0),
      totalItems: tracker.stages.reduce((sum, stage) => sum + stage.items.length, 0),
    },
    sourceMap,
    readApiScope: {
      home: {
        target: ['KPI', '월 임관리비 비중', '용도별 비율', '계약 이력 기준 임대료 추이', '권역별 노출도', '만기 집중도'],
        currentStaticDependency: ['logisticsHomeData.json', 'logisticsAssetOptionsData.json', 'logisticsAssetData/*.json'],
        recommendedApi: 'dashboard/home/read or ll_dashboard_metric_snapshots aggregate read',
        requirements: ['basis_date=2026-04', 'asset permission scope', 'source row/cell evidence'],
      },
      asset: {
        target: ['자산 KPI', '임차인 현황', '면적 구성', '층별 배치', '만기 스냅샷', '자산개요·투자개요'],
        currentStaticDependency: ['ASSET_PAYLOADS', 'weeklyReportData.managementProjects fallback'],
        recommendedApi: 'dashboard/asset/read plus weekly-projects/get-asset-detail',
        requirements: ['assetId 기준', 'DB_일반/DB_히스토리 linkage', 'latest rent history'],
      },
      company: {
        target: ['기업 KPI', '임차 자산 현황', '회사별 임차 자산 지도', '자산별 노출도', 'DART 표시 영역'],
        currentStaticDependency: ['COMPANY_PAYLOADS', 'companyOptionsData', 'Asset payload join'],
        recommendedApi: 'dashboard/company/read',
        requirements: ['tenantId/companyName 기준', 'permission asset join', 'DART cache/read status'],
      },
    },
    existingReadbackEvidenceReused: {
      monthlyCostTotal: 13050719577,
      arenaYangjiMonthlyCostTotal: 2468703091,
      dbHistoryLinkedRows: 162,
      weeklyAssetsRows: 20,
      gyeongsanCorrectedExclusiveAreaRows: 3,
    },
    decision: {
      completedEnoughToCountDone: [
        ...sourceMap.filter((row) => row.status === 'done').map((row) => row.area),
        '월 임관리비 핵심 불일치 정리: 전체 13,050,719,577원, 아레나스양지 2,468,703,091원',
      ],
      partialNeedsWork: sourceMap.filter((row) => row.status === 'partial').map((row) => row.area),
      nextRecommendedImplementation: [
        'Home/Asset/Company/PDF가 ll_dashboard_metric_snapshots 또는 신규 dashboard-data read API를 직접 읽도록 연결',
        'Asset 자산개요·투자개요의 static fallback을 readback 상태 표시 없이도 Supabase row 우선으로 안정화',
        'Data Quality에 DB_히스토리 source-only 2행 노출',
        'PDF Report 지도 렌더링을 정적 이미지/지도 캡처 또는 print-safe map renderer로 교체',
      ],
    },
  };

  fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(result, null, 2));
  fs.writeFileSync(path.join(outDir, 'summary.md'), [
    '# Supabase Page Source Audit - 2026-05-20',
    '',
    '- mutationPerformed: false',
    '- projectRef: qvegpozwrcmspdvjokiz',
    `- generatedAt: ${result.generatedAt}`,
    '',
    '## Source Map',
    '',
    '| Area | Status | Supabase tables | Readback | Remaining risk |',
    '|---|---|---|---|---|',
    ...sourceMap.map((row) => `| ${row.area} | ${row.status} | ${row.supabaseTables.join(', ')} | ${JSON.stringify(row.readback).replace(/\|/gu, '/')} | ${row.remainingRisk} |`),
    '',
    '## Static JSON Imports Still Used',
    '',
    ...Object.entries(imports).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Completed Enough To Count Done',
    '',
    ...result.decision.completedEnoughToCountDone.map((item) => `- ${item}`),
    '',
    '## Partial Needs Work',
    '',
    ...result.decision.partialNeedsWork.map((item) => `- ${item}`),
    '',
    '## Read API Scope',
    '',
    '이번 배치에서는 이미 끝난 readback을 다시 돌리지 않고, 정적 JSON 의존을 Supabase 우선으로 바꿀 범위만 확정했습니다.',
    '',
    '| Page | Supabase-first target | Current static dependency | API/read model needed |',
    '|---|---|---|---|',
    ...Object.entries(result.readApiScope).map(([page, row]) => `| ${page} | ${row.target.join(', ')} | ${row.currentStaticDependency.join(', ')} | ${row.recommendedApi}; ${row.requirements.join(', ')} |`),
    '',
    '## Existing Readback Evidence Reused',
    '',
    `- 월 임관리비 총액: ${result.existingReadbackEvidenceReused.monthlyCostTotal.toLocaleString('en-US')}원`,
    `- 아레나스양지 월 임관리비: ${result.existingReadbackEvidenceReused.arenaYangjiMonthlyCostTotal.toLocaleString('en-US')}원`,
    `- DB_히스토리 누적 linkage: ${result.existingReadbackEvidenceReused.dbHistoryLinkedRows}행`,
    `- ll_weekly_assets latest rows: ${result.existingReadbackEvidenceReused.weeklyAssetsRows}행`,
    `- 경산 전용면적 보정: ${result.existingReadbackEvidenceReused.gyeongsanCorrectedExclusiveAreaRows}건`,
    '',
    '## Next Recommended Implementation',
    '',
    ...result.decision.nextRecommendedImplementation.map((item) => `- ${item}`),
    '',
  ].join('\n'));

  console.log(JSON.stringify({
    qa_status: sourceMap.some((row) => row.status === 'todo') ? 'partial' : 'pass_with_partial_items',
    mutationPerformed: false,
    weeklyAssetsLiveRows: weeklyRows.length,
    completedEnoughToCountDone: result.decision.completedEnoughToCountDone,
    partialNeedsWork: result.decision.partialNeedsWork,
    output: path.relative(root, outDir),
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
