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

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // The current order: badge then title
    // Badge: <span className="bg-[#333] text-[#b3b0a6] px-[8px] py-[3px] rounded-[6px] mr-[8px] font-bold text-[14px]">{getCurrentWeekInfo().weekLabel}</span>
    // Title: <span className="mt-[2px]">...</span>
    // We also need to preserve any {selectedTheme ...} or similar that might follow.
    // Let's just find the exact badge and title, and swap them.

    const badgeRegex = /<span className="bg-\[#333\] text-\[#b3b0a6\] px-\[8px\] py-\[3px\] rounded-\[6px\] mr-\[8px\] font-bold text-\[14px\]">\{getCurrentWeekInfo\(\)\.weekLabel\}<\/span>\s*<span className="mt-\[2px\]">([^<]+)<\/span>/g;
    
    // We swap and change mr-[8px] to ml-[8px] on the badge
    content = content.replace(badgeRegex, '<span className="mt-[2px]">$1</span>\n                        <span className="bg-[#333] text-[#b3b0a6] px-[8px] py-[3px] rounded-[6px] ml-[8px] font-bold text-[14px]">{getCurrentWeekInfo().weekLabel}</span>');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Swapped badge in', file);
});
