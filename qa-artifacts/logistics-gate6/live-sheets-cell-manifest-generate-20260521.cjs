const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CSV_PATH = 'C:\\Users\\10524\\Desktop\\codex_realasset\\Project\\03_Logi_Leasing_Dashboard\\qa-artifacts\\source-diff\\live-google-sheets-export\\parsed-20260512\\xlsx-cells.csv';
const OUT_DIR = path.resolve(process.cwd(), 'tmp', 'live-sheets-cell-manifest-sql-20260521');
const IMPORT_ID = 'live_google_sheets_20260512_cell_manifest';
const SOURCE_TYPE = 'live_google_sheets';
const SOURCE_NAME = 'IGIS_Logistics_Leasing_Data';
const SPREADSHEET_ID = '1powCa2TV7Pkqi3Un3mz3clJPwJ9xw7lMr1bZ0eLMqVA';
const CHUNK_SIZE = 2500;

function sql(value) {
  if (value === null || value === undefined || value === '') return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function boolSql(value) {
  return value ? 'true' : 'false';
}

function jsonSql(value) {
  return `${sql(JSON.stringify(value))}::jsonb`;
}

function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = (rows.shift() || []).map((header) => String(header || '').replace(/^\uFEFF/, ''));
  return rows
    .filter((cells) => cells.some((cell) => cell !== ''))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])));
}

function rowHash(row) {
  return crypto.createHash('sha256')
    .update([
      row.sheet_name,
      row.row_number,
      row.column_index,
      row.display_value || '',
      row.raw_value || '',
      row.formula || '',
      row.source_hash || '',
    ].join('\u001f'))
    .digest('hex');
}

function valuesSql(row, workbookHash, sheetHash) {
  const originalCellId = String(row.cell_id || `${row.sheet_name}_${row.row_number}_${row.column_index}`);
  const sourceCellId = `live_20260512_${originalCellId}`;
  const rawValue = row.raw_value ?? row.display_value ?? '';
  const displayValue = row.display_value ?? row.raw_value ?? '';
  const formula = row.formula || '';
  const isBlank = String(row.is_blank).toLowerCase() === 'true';
  const valueType = row.value_type || (isBlank ? 'blank' : 'text');
  const isError = /^#(N\/A|VALUE!|REF!|DIV\/0!|NAME\?|NUM!|NULL!)/iu.test(String(displayValue || '')) || valueType === 'error';
  const payload = {
    original_cell_id: originalCellId,
    header_label: row.header_label || null,
    source_file: CSV_PATH,
  };
  return `(${[
    sql(sourceCellId),
    sql(IMPORT_ID),
    sql(SOURCE_TYPE),
    sql(SOURCE_NAME),
    sql(row.sheet_name),
    Number(row.row_number || 0),
    Number(row.column_index || 0),
    sql(row.column_letter),
    'null',
    sql(row.header_label),
    sql(row.a1_ref),
    sql(rawValue),
    sql(displayValue),
    sql(formula),
    sql(valueType),
    boolSql(isBlank),
    sql(rowHash(row)),
    sql(row.source_hash || rowHash(row)),
    jsonSql(payload),
    sql(valueType),
    boolSql(Boolean(formula)),
    boolSql(isError),
    sql(IMPORT_ID),
    sql(sheetHash),
    sql(workbookHash),
  ].join(', ')})`;
}

function writeSqlChunk(filePath, rows, workbookHash, sheetHashes) {
  const valueRows = rows.map((row) => valuesSql(row, workbookHash, sheetHashes.get(row.sheet_name)));
  const sqlText = `begin;
insert into public.ll_source_cells (
  source_cell_id,
  import_id,
  source_type,
  source_name,
  sheet_name,
  row_number,
  column_number,
  column_letter,
  header_row_number,
  header_label,
  a1_ref,
  raw_value_text,
  display_value_text,
  formula_text,
  value_type,
  is_blank,
  row_hash,
  cell_hash,
  source_payload,
  effective_type,
  is_formula,
  is_error,
  source_run_id,
  sheet_hash,
  workbook_hash
)
values
${valueRows.join(',\n')}
on conflict (import_id, sheet_name, row_number, column_number) do update set
  import_id = excluded.import_id,
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  sheet_name = excluded.sheet_name,
  row_number = excluded.row_number,
  column_number = excluded.column_number,
  column_letter = excluded.column_letter,
  header_label = excluded.header_label,
  a1_ref = excluded.a1_ref,
  raw_value_text = excluded.raw_value_text,
  display_value_text = excluded.display_value_text,
  formula_text = excluded.formula_text,
  value_type = excluded.value_type,
  is_blank = excluded.is_blank,
  row_hash = excluded.row_hash,
  cell_hash = excluded.cell_hash,
  source_payload = excluded.source_payload,
  effective_type = excluded.effective_type,
  is_formula = excluded.is_formula,
  is_error = excluded.is_error,
  source_run_id = excluded.source_run_id,
  sheet_hash = excluded.sheet_hash,
  workbook_hash = excluded.workbook_hash,
  updated_at = now();
commit;
`;
  fs.writeFileSync(filePath, sqlText, 'utf8');
}

function main() {
  if (!fs.existsSync(CSV_PATH)) throw new Error(`Missing source CSV: ${CSV_PATH}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const rows = parseCsvText(fs.readFileSync(CSV_PATH, 'utf8'));
  const workbookHash = sha256File(CSV_PATH);
  const metrics = new Map();
  for (const row of rows) {
    const sheet = row.sheet_name || '';
    if (!metrics.has(sheet)) {
      metrics.set(sheet, {
        sheet_name: sheet,
        expected_cells: 0,
        non_empty_cells: 0,
        formula_cells: 0,
        error_cells: 0,
        hash: crypto.createHash('sha256'),
      });
    }
    const metric = metrics.get(sheet);
    const isBlank = String(row.is_blank).toLowerCase() === 'true';
    const formula = row.formula || '';
    const displayValue = row.display_value ?? row.raw_value ?? '';
    metric.expected_cells += 1;
    if (!isBlank) metric.non_empty_cells += 1;
    if (formula) metric.formula_cells += 1;
    if (/^#(N\/A|VALUE!|REF!|DIV\/0!|NAME\?|NUM!|NULL!)/iu.test(String(displayValue || '')) || row.value_type === 'error') {
      metric.error_cells += 1;
    }
    metric.hash.update(`${row.cell_id}|${row.source_hash || ''}\n`);
  }
  const sheetRows = [...metrics.values()].map((metric) => ({
    sheet_name: metric.sheet_name,
    expected_cells: metric.expected_cells,
    non_empty_cells: metric.non_empty_cells,
    formula_cells: metric.formula_cells,
    error_cells: metric.error_cells,
    sheet_hash: metric.hash.digest('hex'),
  }));
  const sheetHashes = new Map(sheetRows.map((row) => [row.sheet_name, row.sheet_hash]));
  const summary = {
    generated_at: new Date().toISOString(),
    import_id: IMPORT_ID,
    source_type: SOURCE_TYPE,
    source_name: SOURCE_NAME,
    spreadsheet_id: SPREADSHEET_ID,
    source_csv: CSV_PATH,
    output_dir: OUT_DIR,
    workbook_hash: workbookHash,
    sheet_count: sheetRows.length,
    expected_cells: rows.length,
    non_empty_cells: sheetRows.reduce((sum, row) => sum + row.non_empty_cells, 0),
    formula_cells: sheetRows.reduce((sum, row) => sum + row.formula_cells, 0),
    error_cells: sheetRows.reduce((sum, row) => sum + row.error_cells, 0),
    chunk_size: CHUNK_SIZE,
    chunk_count: Math.ceil(rows.length / CHUNK_SIZE),
    sheets: sheetRows,
  };
  const importSql = `begin;
insert into public.ll_import_runs (
  import_id,
  source_type,
  source_name,
  spreadsheet_id,
  file_name,
  started_at,
  finished_at,
  status,
  row_counts,
  memo,
  created_at
)
values (
  ${sql(IMPORT_ID)},
  ${sql(SOURCE_TYPE)},
  ${sql(SOURCE_NAME)},
  ${sql(SPREADSHEET_ID)},
  ${sql(path.basename(CSV_PATH))},
  now(),
  now(),
  'completed',
  ${jsonSql(summary)},
  'Live Google Sheets 17-tab used-range cell manifest append',
  now()
)
on conflict (import_id) do update set
  source_type = excluded.source_type,
  source_name = excluded.source_name,
  spreadsheet_id = excluded.spreadsheet_id,
  file_name = excluded.file_name,
  finished_at = excluded.finished_at,
  status = excluded.status,
  row_counts = excluded.row_counts,
  memo = excluded.memo;
commit;
`;
  fs.writeFileSync(path.join(OUT_DIR, '000_import_run.sql'), importSql, 'utf8');
  for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
    const chunk = rows.slice(index, index + CHUNK_SIZE);
    const fileName = `${String(index / CHUNK_SIZE + 1).padStart(3, '0')}_source_cells.sql`;
    writeSqlChunk(path.join(OUT_DIR, fileName), chunk, workbookHash, sheetHashes);
  }
  fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify({
    output_dir: OUT_DIR,
    expected_cells: summary.expected_cells,
    sheet_count: summary.sheet_count,
    chunk_count: summary.chunk_count,
    workbook_hash: summary.workbook_hash,
  }, null, 2));
}

main();
