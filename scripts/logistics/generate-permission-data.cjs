const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const sourcePath = process.argv[2];
const outputPath = process.argv[3] || path.join('src', 'components', 'system', 'workspace', 'logisticsPermissionData.json');

if (!sourcePath) {
  console.error('Usage: node scripts/logistics/generate-permission-data.cjs <permission-xlsx> [output-json]');
  process.exit(1);
}

const clean = (value) => String(value ?? '').replace(/^\s+|\s+$/g, '');
const cleanEmail = (value) => String(value ?? '').replace(/\s+/g, '').toLowerCase();
const isYes = (value) => String(value ?? '').trim().toUpperCase() === 'Y';
const assetIdFor = (code) => `asset_${String(code || '').toLowerCase()}`;
const splitAssetCodes = (value) => clean(value).split(',').map((code) => clean(code)).filter(Boolean);

const workbook = XLSX.readFile(sourcePath);
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' });
const assetHeaderIndex = rows.findIndex((row) => clean(row[0]) === '자산코드');

if (assetHeaderIndex < 0) {
  throw new Error('Could not find asset master header row.');
}

const assetRows = rows.slice(assetHeaderIndex + 1).filter((row) => clean(row[0]) && clean(row[1]));
const assetMaster = assetRows.map((row) => ({
  assetCode: clean(row[0]),
  assetId: assetIdFor(clean(row[0])),
  assetName: clean(row[1]),
  fundCode: clean(row[2]),
  fundName: clean(row[3]),
  assetManagerName: clean(row[4]),
}));

const assetByCode = new Map(assetMaster.map((asset) => [asset.assetCode, asset]));
const userRows = rows.slice(2, Math.max(2, assetHeaderIndex - 2)).filter((row) => clean(row[0]) && clean(row[1]));
const users = userRows.map((row) => {
  const managedAssetCodes = splitAssetCodes(row[11]);
  const managedAssets = managedAssetCodes.map((code) => assetByCode.get(code)).filter(Boolean);
  const fundMap = new Map();

  managedAssets.forEach((asset) => {
    if (asset.fundCode && !fundMap.has(asset.fundCode)) {
      fundMap.set(asset.fundCode, { fundCode: asset.fundCode, fundName: asset.fundName });
    }
  });

  return {
    name: clean(row[0]),
    email: cleanEmail(row[1]),
    organization: clean(row[2]),
    managedAssetCodes,
    managedAssets,
    managedFunds: [...fundMap.values()].sort((a, b) => String(a.fundCode).localeCompare(String(b.fundCode))),
    permissions: {
      managedAsset: {
        read: isYes(row[3]),
        create: isYes(row[4]),
        update: isYes(row[5]),
        delete: isYes(row[6]),
      },
      otherAsset: {
        read: isYes(row[7]),
        create: isYes(row[8]),
        update: isYes(row[9]),
        delete: isYes(row[10]),
      },
    },
  };
});

const organizationMap = new Map();
users.forEach((user) => {
  if (!user.organization) return;
  if (!organizationMap.has(user.organization)) organizationMap.set(user.organization, []);
  organizationMap.get(user.organization).push(user.email);
});

const organizations = [...organizationMap.entries()]
  .sort((a, b) => a[0].localeCompare(b[0], 'ko-KR'))
  .map(([name, memberEmails]) => ({ name, memberEmails, memberCount: memberEmails.length }));

const payload = {
  schemaVersion: 'logistics_permission_v1',
  sourceFile: path.basename(sourcePath),
  sourceSheet: sheetName,
  sourceRanges: {
    users: `A3:L${assetHeaderIndex - 1}`,
    assetMaster: `A${assetHeaderIndex + 2}:G${assetHeaderIndex + assetMaster.length + 1}`,
  },
  generatedAt: new Date().toISOString().slice(0, 10),
  userCount: users.length,
  assetCount: assetMaster.length,
  organizations,
  assetMaster,
  users,
};

fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`generated ${outputPath}: users=${users.length}, assets=${assetMaster.length}`);
