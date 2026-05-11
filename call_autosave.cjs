const fs = require('fs');
const path = require('path');

const dir = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace';
const files = [
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

    // We can insert the useEffect right after the autoSaveSnapshot definition
    // The definition ends with:
    //             localStorage.setItem('iota_weekly_snapshots', JSON.stringify(localSnapshots));
    //         }
    //     };
    
    const target = "localStorage.setItem('iota_weekly_snapshots', JSON.stringify(localSnapshots));\n        }\n    };\n";
    
    if (content.includes(target) && !content.includes('useEffect(() => { if (tasks && tasks.length > 0) autoSaveSnapshot(tasks); }, [tasks]);')) {
        const replacement = target + "\n    useEffect(() => { if (tasks && tasks.length > 0) autoSaveSnapshot(tasks); }, [tasks]);\n";
        content = content.replace(target, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Added autoSave call to', file);
    }
});
