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

    # Find the table name used in the workspace tasks
    match = re.search(r"supabase\.from\('([^']+)'\)\.select", content)
    if not match:
        continue
    table_name = match.group(1)

    # Replacement function text
    replacement = f"""    const handleMoveTaskUp = async (index) => {{
        if (index === 0) return;
        const current = {{ ...sortedTasks[index] }};
        const prev = {{ ...sortedTasks[index - 1] }};
        
        let timeCurrent = new Date(current.created_at || Date.now()).getTime();
        let timePrev = new Date(prev.created_at || Date.now()).getTime();
        
        if (Math.abs(timeCurrent - timePrev) < 1000) {{
            timeCurrent += 2000;
            timePrev -= 2000;
        }} else {{
            const temp = timeCurrent;
            timeCurrent = timePrev;
            timePrev = temp;
        }}
        
        const newCurrentTime = new Date(timeCurrent).toISOString();
        const newPrevTime = new Date(timePrev).toISOString();
        
        const newTasks = tasks.map(t => t.id === current.id ? {{...t, created_at: newCurrentTime}} : t.id === prev.id ? {{...t, created_at: newPrevTime}} : t);
        setTasks(newTasks);
        
        try {{
            const {{ error: err1 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newCurrentTime }}).eq('id', current.id));
            const {{ error: err2 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newPrevTime }}).eq('id', prev.id));
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
        const current = {{ ...sortedTasks[index] }};
        const nextTask = {{ ...sortedTasks[index + 1] }};
        
        let timeCurrent = new Date(current.created_at || Date.now()).getTime();
        let timeNext = new Date(nextTask.created_at || Date.now()).getTime();
        
        if (Math.abs(timeCurrent - timeNext) < 1000) {{
            timeCurrent -= 2000;
            timeNext += 2000;
        }} else {{
            const temp = timeCurrent;
            timeCurrent = timeNext;
            timeNext = temp;
        }}
        
        const newCurrentTime = new Date(timeCurrent).toISOString();
        const newNextTime = new Date(timeNext).toISOString();
        
        const newTasks = tasks.map(t => t.id === current.id ? {{...t, created_at: newCurrentTime}} : t.id === nextTask.id ? {{...t, created_at: newNextTime}} : t);
        setTasks(newTasks);
        
        try {{
            const {{ error: err1 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newCurrentTime }}).eq('id', current.id));
            const {{ error: err2 }} = await executeWithTimeout(supabase.from('{table_name}').update({{ created_at: newNextTime }}).eq('id', nextTask.id));
            if (err1 || err2) {{
                console.error('Reorder update failed:', err1 || err2);
                alert('순서 변경 실패: 권한이 없거나 서버 오류입니다.');
            }}
        }} catch (e) {{
            console.error('Reorder timeout/error:', e);
            localStorage.setItem('{table_name}_fallback', JSON.stringify(newTasks));
        }}
    }};"""

    # We need to replace the old handleMoveTaskUp and handleMoveTaskDown
    # They are usually contiguous.
    pattern = re.compile(r"    const handleMoveTaskUp = async \(index\) => \{.+?    const handleMoveTaskDown = async \(index\) => \{.+?    \};\n", re.DOTALL)
    
    new_content = pattern.sub(replacement + "\n", content)
    
    with open(path, 'w') as file:
        file.write(new_content)

print("Updated Reorder Logic")
