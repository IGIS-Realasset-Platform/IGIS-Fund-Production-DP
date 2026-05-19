const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const repoRoot = path.resolve(__dirname, '..', '..');
const sourceDir = 'C:/Users/10524/Desktop/codex_realasset/Project/03_Logi_Leasing_Dashboard';
const excelName = fs.readdirSync(sourceDir).find((name) => name.includes('260414') && name.endsWith('.xlsx'));
if (!excelName) {
  throw new Error('Source workbook not found');
}

const workbook = XLSX.readFile(path.join(sourceDir, excelName), { cellDates: false });
const generalRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]], { header: 1, raw: false, defval: '' });
const historyRows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[2]], { header: 1, raw: false, defval: '' });

const ASSET_CODE = 'A112127001';
const ASSET_ID = 'asset_a112127001';
const STATIC_JSON_PATH = path.join(repoRoot, 'src/components/system/workspace/logisticsAssetData/asset_a112127001.json');
const MIGRATION_PATH = path.join(repoRoot, 'supabase/migrations/20260519021914_arena_yangji_history_split_latest.sql');

function text(value) {
  return String(value ?? '').trim();
}

function number(value) {
  const cleaned = text(value).replace(/,/g, '').replace(/%/g, '');
  if (!cleaned || cleaned === '-') return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateValue(value) {
  const raw = text(value);
  if (!raw || raw === '-') return null;
  const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!match) return raw;
  const month = match[1].padStart(2, '0');
  const day = match[2].padStart(2, '0');
  let year = Number(match[3]);
  if (year < 100) year += year >= 70 ? 1900 : 2000;
  return `${year}-${month}-${day}`;
}

function tenantIdFromBiz(bizNo) {
  const digits = text(bizNo).replace(/\D/g, '');
  return digits ? `tenant_brn_${digits}` : 'tenant_unknown';
}

function norm(value) {
  const raw = text(value);
  if (!raw) return 'na';
  return raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\p{L}\p{N}~_-]+/gu, '');
}

function tempNorm(value) {
  const raw = text(value);
  if (raw === 'N') return 'n';
  if (raw === 'Y') return 'y';
  if (!raw) return 'na';
  return 'office';
}

function sheetRowId(prefix, visibleRow) {
  return `${prefix}:r${String(visibleRow).padStart(6, '0')}`;
}

function sql(value) {
  if (value === null || value === undefined || value === '') return 'null';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function findGeneralRow(historyRow) {
  const assetCode = text(historyRow[3]);
  const bizNo = text(historyRow[6]);
  const detail = text(historyRow[9]);
  const floor = text(historyRow[8]);
  return generalRows.find((row, index) => {
    if (index < 10) return false;
    if (text(row[3]) !== assetCode) return false;
    if (text(row[6]) !== bizNo) return false;
    const generalFloor = text(row[11]);
    const generalDetail = text(row[12]);
    if (!detail && generalFloor === floor) return true;
    if (generalDetail && generalDetail === detail) return true;
    if (!generalDetail && generalFloor === '1~10' && /^[1-9]$|^10$/.test(floor)) return true;
    return false;
  });
}

function buildLeaseId(row, tenantId) {
  const start = dateValue(row?.[47]) || dateValue(row?.[43]) || 'unknown_start';
  const end = dateValue(row?.[48]) || dateValue(row?.[44]) || 'unknown_end';
  return `${ASSET_ID}|${tenantId}|${start.replace(/-/g, '')}|${end.replace(/-/g, '')}`;
}

function buildHistoryLatestRows() {
  const candidates = historyRows
    .map((row, index) => ({ row, visibleRow: index + 1 }))
    .filter(({ row, visibleRow }) => visibleRow >= 14 && text(row[3]) === ASSET_CODE);

  const latestByKey = new Map();
  for (const item of candidates) {
    const key = [text(item.row[5]), text(item.row[6]), text(item.row[7]), text(item.row[8]), text(item.row[9])].join('|');
    const existing = latestByKey.get(key);
    const date = dateValue(item.row[12]) || '';
    if (!existing || date > existing.effectiveDate || (date === existing.effectiveDate && item.visibleRow > existing.visibleRow)) {
      latestByKey.set(key, { ...item, effectiveDate: date });
    }
  }

  return Array.from(latestByKey.values()).map(({ row, visibleRow, effectiveDate }) => {
    const tenantId = tenantIdFromBiz(row[6]);
    const general = findGeneralRow(row);
    const leaseId = buildLeaseId(general, tenantId);
    const floorLabel = text(row[8]);
    const detailAreaLabel = text(row[9]) || null;
    const temperatureType = text(row[7]);
    const leaseSpaceId = `${leaseId}|${norm(floorLabel)}|${norm(detailAreaLabel)}|${tempNorm(temperatureType)}`;
    const leasedAreaSqm = number(row[10]) || 0;
    const exclusiveAreaSqm = number(row[11]) || 0;
    const monthlyRentTotal = number(row[14]) || 0;
    const monthlyMfTotal = number(row[15]) || 0;
    const monthlyCostTotal = monthlyRentTotal + monthlyMfTotal;
    const eNoc = leasedAreaSqm > 0 ? Math.round((monthlyCostTotal / (leasedAreaSqm * 0.3025)) * 100) / 100 : null;
    return {
      asset_id: ASSET_ID,
      tenant_id: tenantId,
      lease_id: leaseId,
      lease_space_id: leaseSpaceId,
      floor_label: floorLabel,
      detail_area_label: detailAreaLabel,
      temperature_type: temperatureType,
      leased_area_sqm: leasedAreaSqm,
      exclusive_area_sqm: exclusiveAreaSqm,
      monthly_rent_total: monthlyRentTotal,
      monthly_mf_total: monthlyMfTotal,
      rent_per_py: number(row[16]) || null,
      mf_per_py: number(row[17]) || null,
      e_noc: eNoc,
      effective_date: effectiveDate,
      source_sheet_row_id: sheetRowId('sheet_db_history', visibleRow),
      source_excel_visible_row: visibleRow,
      goods_type: text(general?.[10]),
      is_preleased: text(general?.[8]) === 'Y',
      is_3pl: text(general?.[9]) === 'Y',
      is_single_tenant: text(general?.[13]) === 'Y',
      office_use_yn: text(general?.[35]),
      sublease_yn: text(general?.[36]),
      delinquency_yn: text(general?.[80]),
      general_source_row_id: general ? sheetRowId('sheet_db_general', generalRows.indexOf(general) + 1) : null,
      fundCode: text(row[0]),
      fundName: text(row[1]),
      assetName: text(row[2]),
      assetCode: text(row[3]),
      sector: text(row[4]),
      tenantMasterName: text(row[5]),
      businessRegistrationNo: text(row[6]),
      tenantId,
      coldStorageType: temperatureType,
      temperatureType,
      floorLabel,
      detailAreaLabel,
      leasedAreaSqm,
      exclusiveAreaSqm,
      exclusiveRatio: leasedAreaSqm > 0 ? exclusiveAreaSqm / leasedAreaSqm : null,
      currentStartDate: dateValue(general?.[47]),
      currentEndDate: dateValue(general?.[48]),
      currentContractDate: dateValue(general?.[46]),
      effectiveDate,
      changeReason: text(row[13]),
      monthlyRentTotal,
      monthlyMfTotal,
      monthlyCostTotal,
      currentMonthlyRentTotal: monthlyRentTotal,
      currentMonthlyMfTotal: monthlyMfTotal,
      currentMonthlyCostTotal: monthlyCostTotal,
      rentPerPy: number(row[16]) || null,
      mfPerPy: number(row[17]) || null,
      currentRentPerPy: number(row[16]) || null,
      currentMfPerPy: number(row[17]) || null,
      eNoc,
      leaseId,
      leaseSpaceId,
      sourceSheetRowId: sheetRowId('sheet_db_history', visibleRow),
      sourceExcelVisibleRow: visibleRow,
      goodsType: text(general?.[10]),
      isPreleased: text(general?.[8]) === 'Y',
      is3pl: text(general?.[9]) === 'Y',
      isSingleTenant: text(general?.[13]) === 'Y',
      officeUseYn: text(general?.[35]),
      subleaseYn: text(general?.[36]),
      delinquencyYn: text(general?.[80]),
      generalSourceRowId: general ? sheetRowId('sheet_db_general', generalRows.indexOf(general) + 1) : null,
    };
  }).sort((a, b) => {
    const floor = String(a.floorLabel).localeCompare(String(b.floorLabel), 'ko', { numeric: true });
    if (floor) return floor;
    return String(a.detailAreaLabel || '').localeCompare(String(b.detailAreaLabel || ''), 'ko', { numeric: true });
  });
}

function upsertJson(rows) {
  const payload = JSON.parse(fs.readFileSync(STATIC_JSON_PATH, 'utf8'));
  const existingRow = payload.rows?.[0] || {};
  const asset = existingRow.asset || {
    assetId: ASSET_ID,
    assetCode: ASSET_CODE,
    assetName: rows[0]?.assetName,
  };
  const manager = existingRow.manager || {};
  const grossFloorAreaSqm = number(asset.grossFloorAreaSqm) || number(payload.overview?.grossFloorAreaSqm) || number(rows[0]?.grossFloorAreaSqm) || 349722.27;
  const enrichedRows = rows.map((row) => ({
    asset,
    company: {
      tenantId: row.tenantId,
      tenantMasterName: row.tenantMasterName,
      businessRegistrationNo: row.businessRegistrationNo,
    },
    manager,
    leaseId: row.leaseId,
    leaseSpaceId: row.leaseSpaceId,
    assetId: ASSET_ID,
    assetCode: ASSET_CODE,
    assetName: row.assetName,
    fundCode: row.fundCode,
    fundName: row.fundName,
    sector: row.sector,
    tenantId: row.tenantId,
    tenantMasterName: row.tenantMasterName,
    businessRegistrationNo: row.businessRegistrationNo,
    floorLabel: row.floorLabel,
    detailAreaLabel: row.detailAreaLabel,
    coldStorageType: row.coldStorageType,
    temperatureType: row.temperatureType,
    goodsType: row.goodsType,
    leasedAreaSqm: row.leasedAreaSqm,
    currentLeasedAreaSqm: row.leasedAreaSqm,
    exclusiveAreaSqm: row.exclusiveAreaSqm,
    exclusiveRatio: row.exclusiveRatio,
    currentMonthlyRentTotal: row.currentMonthlyRentTotal,
    currentMonthlyMfTotal: row.currentMonthlyMfTotal,
    currentMonthlyCostTotal: row.currentMonthlyCostTotal,
    monthlyRentTotal: row.monthlyRentTotal,
    monthlyMfTotal: row.monthlyMfTotal,
    monthlyCostTotal: row.monthlyCostTotal,
    currentRentPerPy: row.currentRentPerPy,
    currentMfPerPy: row.currentMfPerPy,
    rentPerPy: row.rentPerPy,
    mfPerPy: row.mfPerPy,
    eNoc: row.eNoc,
    currentStartDate: row.currentStartDate,
    currentEndDate: row.currentEndDate,
    currentContractDate: row.currentContractDate,
    effectiveDate: row.effectiveDate,
    changeReason: row.changeReason,
    sourceSheetRowId: row.sourceSheetRowId,
    sourceExcelVisibleRow: row.sourceExcelVisibleRow,
    generalSourceRowId: row.generalSourceRowId,
    reviewStatus: 'excel_db_history_latest_split',
    sourceSystem: 'source_excel_db_history',
    spaceLabel: [row.floorLabel, row.detailAreaLabel].filter(Boolean).join(' '),
  }));

  const totalLeased = rows.reduce((sum, row) => sum + row.leasedAreaSqm, 0);
  const totalRent = rows.reduce((sum, row) => sum + row.monthlyRentTotal, 0);
  const totalMf = rows.reduce((sum, row) => sum + row.monthlyMfTotal, 0);
  const totalCost = totalRent + totalMf;
  const avgENoc = totalLeased > 0 ? Math.round(totalCost / (totalLeased * 0.3025)) : 0;
  const tenants = Array.from(new Map(rows.map((row) => [row.tenantId, row])).values());
  const floors = Object.values(rows.reduce((acc, row) => {
    const key = row.floorLabel || 'unknown';
    if (!acc[key]) acc[key] = { floorLabel: key, leasedAreaSqm: 0, monthlyCostTotal: 0, tenants: [] };
    acc[key].leasedAreaSqm += row.leasedAreaSqm;
    acc[key].monthlyCostTotal += row.monthlyCostTotal;
    if (!acc[key].tenants.includes(row.tenantMasterName)) acc[key].tenants.push(row.tenantMasterName);
    return acc;
  }, {})).map((floor) => ({
    ...floor,
    leasedAreaPy: Math.round(floor.leasedAreaSqm * 0.3025 * 10) / 10,
    share: totalLeased > 0 ? floor.leasedAreaSqm / totalLeased : 0,
  }));

  payload.rows = enrichedRows;
  payload.normalizedRows = enrichedRows;
  payload.kpis = {
    ...(payload.kpis || {}),
    leased_area_total: totalLeased,
    monthly_rent_total: totalRent,
    monthly_mf_total: totalMf,
    monthly_cost_total: totalCost,
    average_e_noc: avgENoc,
    unique_tenant_count: tenants.length,
  };
  payload.meta = {
    ...(payload.meta || {}),
    rowCount: rows.length,
    latestSplitSource: 'DB_히스토리 누적 Excel latest rows',
    latestSplitGeneratedAt: new Date().toISOString(),
  };
  payload.meta.basis = {
    ...(payload.meta.basis || {}),
    rowUnit: 'DB_히스토리 누적 latest floor/detail row',
  };
  payload.overview = {
    ...(payload.overview || {}),
    assetId: ASSET_ID,
    assetCode: ASSET_CODE,
    assetName: rows[0]?.assetName,
    fundCode: rows[0]?.fundCode,
    fundName: rows[0]?.fundName,
    rowCount: rows.length,
    floors,
    tenantCount: tenants.length,
    uniqueTenantCount: tenants.length,
    leasedAreaSqm: totalLeased,
    monthlyRentTotal: totalRent,
    monthlyMfTotal: totalMf,
    monthlyCostTotal: totalCost,
    averageENoc: avgENoc,
    grossFloorAreaSqm,
    vacancyAreaSqm: Math.max(grossFloorAreaSqm - totalLeased, 0),
    vacancyRate: grossFloorAreaSqm > 0 ? Math.max(grossFloorAreaSqm - totalLeased, 0) / grossFloorAreaSqm : 0,
  };
  payload.analytics = {
    ...(payload.analytics || {}),
    uniqueTenants: tenants.map((tenant) => ({ tenantId: tenant.tenantId, tenantName: tenant.tenantMasterName })),
    rentVsMf: [
      { label: '월 임대료', value: totalRent },
      { label: '월 관리비', value: totalMf },
    ],
    monthlyCostByTenant: tenants.map((tenant) => {
      const items = rows.filter((row) => row.tenantId === tenant.tenantId);
      const cost = items.reduce((sum, row) => sum + row.monthlyCostTotal, 0);
      return {
        tenantId: tenant.tenantId,
        tenantName: tenant.tenantMasterName,
        value: cost,
        share: totalCost > 0 ? cost / totalCost : 0,
      };
    }),
    contractExpiry: rows.map((row) => ({
      tenantId: row.tenantId,
      tenantName: row.tenantMasterName,
      floorLabel: row.floorLabel,
      detailAreaLabel: row.detailAreaLabel,
      currentEndDate: row.currentEndDate,
      leasedAreaSqm: row.leasedAreaSqm,
    })),
    expirySnapshot: {
      entries: rows.map((row) => ({
        tenantId: row.tenantId,
        tenantName: row.tenantMasterName,
        floorLabel: row.floorLabel,
        detailAreaLabel: row.detailAreaLabel,
        currentEndDate: row.currentEndDate,
        leasedAreaSqm: row.leasedAreaSqm,
      })),
    },
  };
  payload.topTenants = payload.analytics.monthlyCostByTenant;
  payload.stackingPlan = floors;
  payload.areaBreakdown = rows.map((row) => ({
    label: [row.floorLabel, row.detailAreaLabel].filter(Boolean).join(' '),
    leasedAreaSqm: row.leasedAreaSqm,
    exclusiveAreaSqm: row.exclusiveAreaSqm,
    ratio: totalLeased > 0 ? row.leasedAreaSqm / totalLeased : 0,
  }));
  payload.generatedAt = payload.meta.latestSplitGeneratedAt;
  payload.schemaVersion = 'asset-page-v2-db-history-split';

  fs.writeFileSync(STATIC_JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function valuesFor(rows, columns) {
  return rows.map((row) => `  (${columns.map((key) => sql(row[key])).join(', ')})`).join(',\n');
}

function writeMigration(rows) {
  const fullColumns = [
    'asset_id', 'tenant_id', 'lease_id', 'lease_space_id', 'floor_label', 'detail_area_label',
    'temperature_type', 'leased_area_sqm', 'exclusive_area_sqm', 'monthly_rent_total',
    'monthly_mf_total', 'rent_per_py', 'mf_per_py', 'e_noc', 'effective_date',
    'source_sheet_row_id', 'source_excel_visible_row', 'goods_type', 'is_preleased', 'is_3pl',
    'is_single_tenant', 'office_use_yn', 'sublease_yn', 'delinquency_yn', 'general_source_row_id',
  ];
  const latestCte = `with latest(${fullColumns.join(', ')}) as (\n  values\n${valuesFor(rows, fullColumns)}\n)`;
  const keyColumns = ['asset_id', 'tenant_id', 'lease_space_id', 'floor_label', 'detail_area_label', 'temperature_type', 'effective_date'];
  const keyCte = `with latest(${keyColumns.join(', ')}) as (\n  values\n${valuesFor(rows, keyColumns)}\n)`;

  const sqlText = `-- Gate 6: A112127001 latest lease-space split from source Excel DB history.
-- Mutation scope: public.ll_* only. Source workbook: ${excelName}

${latestCte}
insert into public.ll_lease_spaces (
  lease_space_id, lease_id, asset_id, tenant_id, floor_label, detail_area_label, temperature_type,
  is_single_tenant, is_preleased, is_3pl, goods_type, leased_area_sqm, exclusive_area_sqm,
  exclusive_ratio, current_monthly_rent_total, current_monthly_mf_total, current_monthly_cost_total, e_noc,
  formula_version, office_use_yn, sublease_yn, contract_status, delinquency_yn, source_sheet_row_id,
  source_payload, review_status, review_note, updated_at
)
select
  lease_space_id, lease_id, asset_id, tenant_id, floor_label, detail_area_label, temperature_type,
  is_single_tenant, is_preleased, is_3pl, goods_type, leased_area_sqm, exclusive_area_sqm,
  case when leased_area_sqm > 0 then exclusive_area_sqm / leased_area_sqm else null end,
  monthly_rent_total, monthly_mf_total, monthly_rent_total + monthly_mf_total, e_noc,
  'E.NOC_v2_excel_db_history_latest_split', office_use_yn, sublease_yn, 'active', delinquency_yn, source_sheet_row_id,
  jsonb_build_object(
    'source_excel_visible_row', source_excel_visible_row,
    'general_source_row_id', general_source_row_id,
    'effective_date', effective_date
  ),
  'excel_db_history_latest_split',
  concat('DB history latest split upsert / Excel row ', source_excel_visible_row::text),
  now()
from latest
on conflict (lease_space_id) do update set
  lease_id = excluded.lease_id,
  tenant_id = excluded.tenant_id,
  floor_label = excluded.floor_label,
  detail_area_label = excluded.detail_area_label,
  temperature_type = excluded.temperature_type,
  is_single_tenant = excluded.is_single_tenant,
  is_preleased = excluded.is_preleased,
  is_3pl = excluded.is_3pl,
  goods_type = excluded.goods_type,
  leased_area_sqm = excluded.leased_area_sqm,
  exclusive_area_sqm = excluded.exclusive_area_sqm,
  exclusive_ratio = excluded.exclusive_ratio,
  current_monthly_rent_total = excluded.current_monthly_rent_total,
  current_monthly_mf_total = excluded.current_monthly_mf_total,
  current_monthly_cost_total = excluded.current_monthly_cost_total,
  e_noc = excluded.e_noc,
  formula_version = excluded.formula_version,
  office_use_yn = excluded.office_use_yn,
  sublease_yn = excluded.sublease_yn,
  contract_status = 'active',
  delinquency_yn = excluded.delinquency_yn,
  source_sheet_row_id = excluded.source_sheet_row_id,
  source_payload = excluded.source_payload,
  review_status = excluded.review_status,
  review_note = excluded.review_note,
  updated_at = now();

${keyCte}
update public.ll_lease_spaces ls
set
  contract_status = 'superseded_by_db_history_split',
  review_status = 'superseded_by_db_history_split',
  review_note = concat_ws(' / ', nullif(ls.review_note, ''), 'Superseded by 21-row DB history latest split on 2026-05-19'),
  updated_at = now()
where ls.asset_id = ${sql(ASSET_ID)}
  and not exists (
    select 1
    from latest
    where latest.lease_space_id = ls.lease_space_id
  );

${keyCte}
update public.ll_rent_history rh
set
  lease_space_id = latest.lease_space_id,
  source_contract_lease_space_id = latest.lease_space_id,
  updated_at = now()
from latest
where rh.asset_id = latest.asset_id
  and rh.tenant_id = latest.tenant_id
  and coalesce(rh.floor_label, '') = coalesce(latest.floor_label, '')
  and coalesce(rh.detail_area_label, '') = coalesce(latest.detail_area_label, '')
  and coalesce(rh.temperature_type, '') = coalesce(latest.temperature_type, '');

with ranked as (
  select
    rent_history_id,
    row_number() over (
      partition by asset_id, tenant_id, coalesce(floor_label, ''), coalesce(detail_area_label, ''), coalesce(temperature_type, '')
      order by effective_date desc nulls last, source_excel_visible_row desc nulls last, source_sheet_row_id desc
    ) = 1 as next_is_latest
  from public.ll_rent_history
  where asset_id = ${sql(ASSET_ID)}
)
update public.ll_rent_history rh
set
  is_latest = ranked.next_is_latest,
  updated_at = now()
from ranked
where rh.rent_history_id = ranked.rent_history_id;

insert into public.ll_api_audit_logs (action, status_code, requested_by, request_payload)
values (
  'data/asset_a112127001/db_history_latest_split',
  200,
  null,
  jsonb_build_object(
    'asset_id', ${sql(ASSET_ID)},
    'source_workbook', ${sql(excelName)},
    'latest_split_rows', ${rows.length},
    'mutation_scope', 'public.ll_lease_spaces + public.ll_rent_history',
    'applied_at', now()
  )
);
`;
  fs.writeFileSync(MIGRATION_PATH, sqlText, 'utf8');
}

const latestRows = buildHistoryLatestRows();
if (latestRows.length !== 21) {
  throw new Error(`Expected 21 latest rows, got ${latestRows.length}`);
}
upsertJson(latestRows);
writeMigration(latestRows);
console.log(JSON.stringify({
  source: excelName,
  latestRows: latestRows.length,
  json: path.relative(repoRoot, STATIC_JSON_PATH),
  migration: path.relative(repoRoot, MIGRATION_PATH),
  totalLeasedAreaSqm: Math.round(latestRows.reduce((sum, row) => sum + row.leasedAreaSqm, 0) * 100) / 100,
  totalMonthlyCost: latestRows.reduce((sum, row) => sum + row.monthlyCostTotal, 0),
}, null, 2));
