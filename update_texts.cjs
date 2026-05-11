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
    'WorkspaceIpr.jsx',
    'WorkspaceArchive.jsx'
];

for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. 주요 테스크 관리 -> 주요 TASK 관리
    if (content.includes('주요 테스크 관리')) {
        content = content.replace(/주요 테스크 관리/g, '주요 TASK 관리');
        changed = true;
    }

    // 2. 지난 테스크 보기 -> 지난 Task 관리
    if (content.includes('지난 테스크 보기')) {
        content = content.replace(/지난 테스크 보기/g, '지난 Task 관리');
        changed = true;
    }

    // 3. 지난 테스크 타임라인 -> 지난 TASK 타임라인
    if (content.includes('지난 테스크 타임라인')) {
        content = content.replace(/지난 테스크 타임라인/g, '지난 TASK 타임라인');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated texts in ${file}`);
    } else {
        console.log(`No target texts found in ${file}`);
    }
}
