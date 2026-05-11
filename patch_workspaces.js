import fs from 'fs';
import path from 'path';

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

    // 1. Insert helper functions
    const helperRegex = /const getCurrentWeekInfo = \(\) => \{[\s\S]*?localStorage\.setItem\('iota_weekly_snapshots', JSON\.stringify\(localSnapshots\)\);\n        \}\n    \};\n/;
    
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

    // Remove old helpers if present
    content = content.replace(helperRegex, '');
    
    // Insert new helpers after expandedTaskId or projectShowAll
    const hookAnchor = /const \[expandedTaskId, setExpandedTaskId\] = useState\(null\);|const \[projectShowAll, setProjectShowAll\] = useState\(false\);/;
    const hookMatch = content.match(hookAnchor);
    if (hookMatch && !content.includes('getCurrentWeekInfo')) {
        const parts = content.split(hookMatch[0]);
        content = parts[0] + hookMatch[0] + "\n" + helperStr + parts[1];
    } else if (content.includes('getCurrentWeekInfo')) {
        // Already there, just replace it
        const updateRegex = /const getCurrentWeekInfo = \(\) => \{[\s\S]*?localStorage\.setItem\('iota_weekly_snapshots', JSON\.stringify\(localSnapshots\)\);\n        \}\n    \};\n/g;
        content = content.replace(updateRegex, helperStr);
    }

    // 2. Add to useEffect
    const useEffectRegex = /useEffect\(\(\) => \{\n\s*if \(!isLoadingTasks && tasks\.length > 0\) \{([\s\S]*?)\}\n\s*\}, \[isLoadingTasks, tasks\]\);/g;
    
    content = content.replace(useEffectRegex, (match, innerBody) => {
        let newBody = innerBody.replace(/\s*autoSaveSnapshot\(tasks\);\n?/, '');
        return `useEffect(() => {
        if (!isLoadingTasks && tasks.length > 0) {
            autoSaveSnapshot(tasks);${newBody}}
    }, [isLoadingTasks, tasks]);`;
    });

    // 3. Update the Title UI
    const titleRegex = /<h2 id="task-management"[\s\S]*?<\/h2>/;
    const existingTitleMatch = content.match(titleRegex);
    let originalTitleText = '주요 테스크 관리';
    if (existingTitleMatch) {
        const textMatch = existingTitleMatch[0].match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
        if (textMatch) {
            const innerHtml = textMatch[1];
            const plainTextMatch = innerHtml.match(/<\/span>\s*(.*)$/);
            if (plainTextMatch) {
                originalTitleText = plainTextMatch[1].trim();
            } else {
                originalTitleText = innerHtml.replace(/<span.*>.*?<\/span>/, '').replace(/<[^>]+>/g, '').trim();
            }
        }
    }
    
    // Header blocks vary, some have "지난 테스크 보기" already, some don't.
    // Replace the entire flex container
    const headerBlockRegex = /<div className="flex justify-between items-center mb-\[10px\]">[\s\S]*?<div className="flex gap-2 items-center">/;
    
    const newHeaderStr = `<div className="flex justify-between items-center mb-[10px]">
                <div className="flex items-center gap-0">
                    <h2 id="task-management" className="text-[18px] font-bold text-white tracking-tight flex items-center">
                        <span className="bg-[#333] text-[#b3b0a6] px-[8px] py-[3px] rounded-[6px] mr-[10px] font-bold text-[14px]">{getCurrentWeekInfo().weekLabel}</span>
                        <span className="mt-[1px]">${originalTitleText}</span>
                    </h2>
                    <a href={\`\${import.meta.env.BASE_URL}workspace/archive\`} target="_blank" rel="noopener noreferrer" className="text-[#86868B] hover:text-[#3b82f6] text-[13px] font-bold ml-[2px] mt-[1px] transition-colors flex items-center gap-1 cursor-pointer">
                        지난 테스크 보기 ↗
                    </a>
                </div>
                <div className="flex gap-2 items-center">`;

    content = content.replace(headerBlockRegex, newHeaderStr);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched', file);
});
