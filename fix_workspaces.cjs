const fs = require('fs');
const path = require('path');

const dir = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace';
const files = [
    { file: 'WorkspacePm.jsx', id: 'pm' },
    { file: 'WorkspaceDigital.jsx', id: 'digital' },
    { file: 'WorkspaceMarketing.jsx', id: 'marketing' },
    { file: 'WorkspaceFund.jsx', id: 'fund' },
    { file: 'WorkspaceDevelopment.jsx', id: 'development' },
    { file: 'WorkspaceFinancing.jsx', id: 'financing' },
    { file: 'WorkspaceIpr.jsx', id: 'ipr' }
];

files.forEach(({file, id}) => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const helperStr = `
    const getCurrentWeekInfo = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const date = today.getDate();
        
        const firstDay = new Date(year, month - 1, 1);
        let firstDayWeekday = firstDay.getDay();
        if (firstDayWeekday === 0) firstDayWeekday = 7;
        
        const offsetDate = date + firstDayWeekday - 1;
        const week = Math.ceil(offsetDate / 7);
        
        const weekLabel = \`\${year.toString().slice(2)}년 \${month}월 \${week}주\`;
        const weekId = \`${id}-\${year}-\${month}-\${week}\`;
        
        return { weekLabel, weekId };
    };

    const autoSaveSnapshot = async (currentTasks) => {
        if (!currentTasks || currentTasks.length === 0) return;
        const { weekLabel, weekId } = getCurrentWeekInfo();
        
        try {
            const { data: existing } = await supabase
                .from('iota_weekly_snapshots')
                .select('id')
                .eq('workspace', '${id}')
                .eq('week_label', weekLabel)
                .single();
                
            if (existing) {
                await supabase
                    .from('iota_weekly_snapshots')
                    .update({ snapshot_data: currentTasks, created_at: new Date().toISOString() })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('iota_weekly_snapshots')
                    .insert([{
                        id: weekId,
                        workspace: '${id}',
                        week_label: weekLabel,
                        snapshot_data: currentTasks,
                        created_at: new Date().toISOString()
                    }]);
            }
        } catch (e) {
            const localSnapshots = JSON.parse(localStorage.getItem('iota_weekly_snapshots') || '[]');
            const index = localSnapshots.findIndex(s => s.week_label === weekLabel && s.workspace === '${id}');
            if (index >= 0) {
                localSnapshots[index] = { ...localSnapshots[index], snapshot_data: currentTasks, created_at: new Date().toISOString() };
            } else {
                localSnapshots.push({
                    id: weekId,
                    workspace: '${id}',
                    week_label: weekLabel,
                    snapshot_data: currentTasks,
                    created_at: new Date().toISOString()
                });
            }
            localStorage.setItem('iota_weekly_snapshots', JSON.stringify(localSnapshots));
        }
    };
`;

    // Remove old helpers robustly
    const helperRegex = /const getCurrentWeekInfo = \(\) => \{[\s\S]*?localStorage\.setItem\('iota_weekly_snapshots', JSON\.stringify\(localSnapshots\)\);\n        \}\n    \};\n/;
    content = content.replace(helperRegex, '');

    // Insert after the state definitions
    const hookAnchor = /const \[expandedTaskId, setExpandedTaskId\] = useState\(null\);|const \[projectShowAll, setProjectShowAll\] = useState\(false\);/;
    const hookMatch = content.match(hookAnchor);
    if (hookMatch) {
        const parts = content.split(hookMatch[0]);
        // Re-inserting to ensure we don't duplicate
        content = parts[0] + hookMatch[0] + "\n" + helperStr + parts.slice(1).join(hookMatch[0]);
    } else {
        // Fallback for files without expandedTaskId or projectShowAll (MarketingPipeline?)
        // Marketing uses expandedTaskId too.
        console.log("Could not find hook anchor in", file);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', file);
});
