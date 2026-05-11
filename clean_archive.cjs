const fs = require('fs');
const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// remove from try block (if any left)
content = content.replace(/\s*\/\/\s*If database is completely empty[\s\S]*?\}\n/g, '\n');

// remove from catch block
content = content.replace(/\s*if \(filteredSnaps\.length === 0\) \{\s*filteredSnaps\.push\(\{\s*id: workspaceFilter \+ '-synth-3-local'[\s\S]*?\}\);\s*\}/g, '');

fs.writeFileSync(filePath, content, 'utf8');
