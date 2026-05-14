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
        
        // Ensure they differ by at least 1000ms so Postgres timestamp(0) doesn't truncate the difference
        if (Math.abs(tCurrent - tPrev) < 1000) {{
            tPrev += 1000;
        }}
        
        const newCurrentTime = new Date(tPrev).toISOString();
        const newPrevTime = new Date(tCurrent).toISOString();
        
        const newTasks = tasks.map(t => {{
            if (t.id === current.id) return {{ ...t, created_at: newCurrentTime }};
            if (t.id === prev.id) return {{ ...t, created_at: newPrevTime }};
            return t;
        }});
        setTasks(newTasks);
        
        try {{
            await supabase.from('{table_name}').update({{ created_at: newCurrentTime }}).eq('id', current.id);
            await supabase.from('{table_name}').update({{ created_at: newPrevTime }}).eq('id', prev.id);
        }} catch (e) {{
            console.error(e);
        }}
    }};

    const handleMoveTaskDown = async (index) => {{
        if (index === sortedTasks.length - 1) return;
        const current = sortedTasks[index];
        const next = sortedTasks[index + 1];
        
        let tCurrent = new Date(current.created_at || Date.now()).getTime();
        let tNext = new Date(next.created_at || Date.now()).getTime();
        
        if (Math.abs(tCurrent - tNext) < 1000) {{
            tCurrent += 1000;
        }}
        
        const newCurrentTime = new Date(tNext).toISOString();
        const newNextTime = new Date(tCurrent).toISOString();
        
        const newTasks = tasks.map(t => {{
            if (t.id === current.id) return {{ ...t, created_at: newCurrentTime }};
            if (t.id === next.id) return {{ ...t, created_at: newNextTime }};
            return t;
        }});
        setTasks(newTasks);
        
        try {{
            await supabase.from('{table_name}').update({{ created_at: newCurrentTime }}).eq('id', current.id);
            await supabase.from('{table_name}').update({{ created_at: newNextTime }}).eq('id', next.id);
        }} catch (e) {{
            console.error(e);
        }}
    }};"""

    pattern = re.compile(r"    const handleMoveTaskUp = async \(index\) => \{.+?    const handleMoveTaskDown = async \(index\) => \{.+?    \};\n", re.DOTALL)
    new_content = pattern.sub(replacement + "\n", content)
    
    with open(path, 'w') as file:
        file.write(new_content)

print("Fixed V3")
