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

    const target = 'className="text-[#A1A1AA] hover:text-white bg-transparent border border-[#3c3c3c] hover:bg-[#333] text-[13px] font-normal tracking-[0.01em] ml-[18px] mt-[2px] px-[10px] py-[3.5px] rounded-[6px] transition-all flex items-center gap-[4px] cursor-pointer"';
    
    const replacement = 'className="text-[#A1A1AA] hover:text-white bg-transparent border border-[#3c3c3c] hover:bg-[#333] text-[13px] font-normal tracking-[0.02em] ml-[18px] mt-[2px] px-[10px] py-[3px] rounded-[6px] transition-all flex items-center gap-[4px] cursor-pointer"';

    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated button style in ${file}`);
    } else {
        console.log(`Target not found in ${file}`);
    }
}
