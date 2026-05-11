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

    // 1. Change badge mr-[10px] to mr-[8px] (왼쪽 공간 2px 삭제)
    content = content.replace(/mr-\[10px\] font-bold text-\[14px\]"\>\{getCurrentWeekInfo\(\)\.weekLabel\}/g, 'mr-[8px] font-bold text-[14px]">{getCurrentWeekInfo().weekLabel}');
    
    // 2. Change title text mt-[1px] to mt-[2px] (텍스트 1px 밑으로 이동)
    // We need to match <span className="mt-[1px]">TITLE</span>
    // Note: in WorkspaceDigital, it's <span className="mt-[1px]">상품·디지털 주요 테스크 관리</span>
    // So we can replace `<span className="mt-[1px]">` with `<span className="mt-[2px]">` ONLY in the context of the title.
    // Let's replace specifically in the h2 block
    const h2Regex = /(<h2 id="task-management"[\s\S]*?)<span className="mt-\[1px\]">/g;
    content = content.replace(h2Regex, '$1<span className="mt-[2px]">');
    
    // 3. Change link ml-[2px] to ml-[8px] (오른쪽 공간 8px 주기)
    // The link has `ml-[2px] mt-[1px]` or similar.
    content = content.replace(/ml-\[2px\] mt-\[1px\]/g, 'ml-[8px] mt-[2px]');
    content = content.replace(/ml-\[2px\] mt-\[2px\]/g, 'ml-[8px] mt-[2px]');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated spacing in', file);
});
