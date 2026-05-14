import os
import re

files = [
    'WorkspacePm.jsx',
    'WorkspaceDevelopment.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceIpr.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceDigital.jsx'
]

base_dir = 'src/components/system/workspace'

for f in files:
    path = os.path.join(base_dir, f)
    with open(path, 'r') as file:
        content = file.read()

    match = re.search(r"supabase\.from\('([^']+)'\)\.select", content)
    if not match:
        continue
    table_name = match.group(1)

    replacement = f"""    const handleMoveTaskUp = async (index) => {{
        if (index === 0) return;
        const current = sortedTasks[index];
        const prev = sortedTasks[index - 1];
        
        let tCurrent = new Date(current.created_at || Date.now()).getTime();
        let tPrev = new Date(prev.created_at || Date.now()).getTime();
        
        if (tCurrent === tPrev) {{
            tPrev += 10; // add 10ms to force strict difference without jumping over others
        }}
        
        const newCurrentTime = new Date(tPrev).toISOString(); // swapped
        const newPrevTime = new Date(tCurrent).toISOString(); // swapped
        
        const newTasks = tasks.map(t => {{
            if (t.id === current.id) return {{ ...t, created_at: newCurrentTime }};
            if (t.id === prev.id) return {{ ...t, created_at: newPrevTime }};
            return t;
        }});
        setTasks(newTasks);
        
        try {{
            const {{ data: d1, error: err1 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newCurrentTime }}).eq('id', current.id).select());
            const {{ data: d2, error: err2 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newPrevTime }}).eq('id', prev.id).select());
            if (err1 || err2) {{
                console.error('Reorder update failed:', err1 || err2);
                alert('순서 변경 실패: 권한이 없거나 서버 오류입니다.');
            }}
        }} catch (e) {{
            console.error('Reorder timeout/error:', e);
            localStorage.setItem('{table_name}_fallback', JSON.stringify(newTasks));
        }}
    }};

    const handleMoveTaskDown = async (index) => {{
        if (index === sortedTasks.length - 1) return;
        const current = sortedTasks[index];
        const nextTask = sortedTasks[index + 1];
        
        let tCurrent = new Date(current.created_at || Date.now()).getTime();
        let tNext = new Date(nextTask.created_at || Date.now()).getTime();
        
        if (tCurrent === tNext) {{
            tCurrent += 10;
        }}
        
        const newCurrentTime = new Date(tNext).toISOString();
        const newNextTime = new Date(tCurrent).toISOString();
        
        const newTasks = tasks.map(t => {{
            if (t.id === current.id) return {{ ...t, created_at: newCurrentTime }};
            if (t.id === nextTask.id) return {{ ...t, created_at: newNextTime }};
            return t;
        }});
        setTasks(newTasks);
        
        try {{
            const {{ data: d1, error: err1 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newCurrentTime }}).eq('id', current.id).select());
            const {{ data: d2, error: err2 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newNextTime }}).eq('id', nextTask.id).select());
            if (err1 || err2) {{
                console.error('Reorder update failed:', err1 || err2);
                alert('순서 변경 실패: 권한이 없거나 서버 오류입니다.');
            }}
        }} catch (e) {{
            console.error('Reorder timeout/error:', e);
            localStorage.setItem('{table_name}_fallback', JSON.stringify(newTasks));
        }}
    }};"""

    pattern = re.compile(r"    const handleMoveTaskUp = async \(index\) => \{.+?    const handleMoveTaskDown = async \(index\) => \{.+?    \};\n", re.DOTALL)
    new_content = pattern.sub(replacement + "\n", content)
    
    with open(path, 'w') as file:
        file.write(new_content)

print("Updated Reorder Logic V2")
