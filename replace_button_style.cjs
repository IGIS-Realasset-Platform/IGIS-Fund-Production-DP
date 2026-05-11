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

    // The current class string
    const target1 = 'className="text-[#86868B] hover:text-[#3b82f6] text-[13px] font-bold ml-[18px] mt-[2px]  transition-colors flex items-center gap-[3px] cursor-pointer"';
    const target2 = 'className="text-[#86868B] hover:text-[#3b82f6] text-[13px] font-bold ml-[18px] mt-[2px] transition-colors flex items-center gap-[3px] cursor-pointer"';
    
    const replacement = 'className="text-[#A1A1AA] hover:text-white bg-transparent border border-[#3c3c3c] hover:bg-[#333] text-[13px] font-medium ml-[18px] mt-[2px] px-[10px] py-[4px] rounded-[6px] transition-all flex items-center gap-[4px] cursor-pointer"';

    if (content.includes(target1)) {
        content = content.replace(target1, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated button style in ${file}`);
    } else if (content.includes(target2)) {
        content = content.replace(target2, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated button style in ${file} (target2)`);
    } else {
        console.log(`Target not found in ${file}`);
    }
}
