import fs from 'fs';

const csvPath = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IFPDP_기획및구축_총괄내역서.csv";
const outputPath = "/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/admin/tasksData.js";

// Basic CSV parser that handles double quotes
function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];

    if (inQuotes) {
      if (c === '"') {
        if (next === '"') {
          row[row.length - 1] += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        row[row.length - 1] += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        row.push("");
      } else if (c === '\r' || c === '\n') {
        if (c === '\r' && next === '\n') {
          i++;
        }
        lines.push(row);
        row = [""];
      } else {
        row[row.length - 1] += c;
      }
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

try {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csvContent);
  
  if (rows.length === 0) {
    console.error("Empty CSV file");
    process.exit(1);
  }

  const headers = rows[0].map(h => h.trim());
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < headers.length) continue;
    
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = (row[index] || "").trim();
    });
    // Check if the row is empty
    if (Object.values(obj).some(v => v !== "")) {
      data.push(obj);
    }
  }

  const jsContent = `// Automatically generated from CSV. Do not edit directly.
export const tasksData = ${JSON.stringify(data, null, 2)};
`;

  fs.writeFileSync(outputPath, jsContent, 'utf8');
  console.log(`Successfully generated tasksData.js with ${data.length} records!`);
} catch (e) {
  console.error("Error generating tasksData.js:", e);
}
