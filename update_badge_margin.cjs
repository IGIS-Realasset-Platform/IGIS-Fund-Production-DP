const fs = require('fs');
const path = require('path');

const dir = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace';
const files = [
    'WorkspacePm.jsx',
    'WorkspaceDigital.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceDevelopment.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceIpr.jsx'
];

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const target = 'className="bg-[#333] text-[#b3b0a6] px-[8px] py-[3px] rounded-[6px] ml-[8px] font-bold text-[14px]"';
    
    const replacement = 'className="bg-[#333] text-[#b3b0a6] px-[8px] py-[3px] rounded-[6px] ml-[10px] font-bold text-[14px]"';

    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated badge margin in ${file}`);
    } else {
        console.log(`Target not found in ${file}`);
    }
}
