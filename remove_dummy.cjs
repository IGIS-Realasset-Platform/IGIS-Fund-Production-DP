const fs = require('fs');
const path = require('path');

const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove the synthetic "5월 3주" dummy logic we just added
content = content.replace(/\s*\/\/ If database is completely empty for this workspace, provide a synthetic 5월 3주 snapshot[\s\S]*?\}\n/g, '\n');

fs.writeFileSync(filePath, content, 'utf8');
