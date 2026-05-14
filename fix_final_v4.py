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
        
        // Prevent identical timestamp lock (which causes DB swap to fail silently on refresh)
        if (current.created_at === prev.created_at) {{
            const time = new Date(prev.created_at || Date.now()).getTime();
            prev.created_at = new Date(time + 1).toISOString(); // Add 1ms to break the tie cleanly
        }}
        
        const temp = current.created_at;
        current.created_at = prev.created_at;
        prev.created_at = temp;
        
        const newTasks = tasks.map(t => t.id === current.id ? {{...t, created_at: current.created_at}} : t.id === prev.id ? {{...t, created_at: prev.created_at}} : t);
        setTasks(newTasks);
        
        try {{
            await supabase.from('{table_name}').update({{ created_at: current.created_at }}).eq('id', current.id);
            await supabase.from('{table_name}').update({{ created_at: prev.created_at }}).eq('id', prev.id);
        }} catch (e) {{
            localStorage.setItem('{table_name}_fallback', JSON.stringify(newTasks));
        }}
    }};

    const handleMoveTaskDown = async (index) => {{
        if (index === sortedTasks.length - 1) return;
        const current = sortedTasks[index];
        const next = sortedTasks[index + 1];
        
        if (current.created_at === next.created_at) {{
            const time = new Date(next.created_at || Date.now()).getTime();
            next.created_at = new Date(time + 1).toISOString();
        }}
        
        const temp = current.created_at;
        current.created_at = next.created_at;
        next.created_at = temp;
        
        const newTasks = tasks.map(t => t.id === current.id ? {{...t, created_at: current.created_at}} : t.id === next.id ? {{...t, created_at: next.created_at}} : t);
        setTasks(newTasks);
        
        try {{
            await supabase.from('{table_name}').update({{ created_at: current.created_at }}).eq('id', current.id);
            await supabase.from('{table_name}').update({{ created_at: next.created_at }}).eq('id', next.id);
        }} catch (e) {{
            localStorage.setItem('{table_name}_fallback', JSON.stringify(newTasks));
        }}
    }};"""

    pattern = re.compile(r"    const handleMoveTaskUp = async \(index\) => \{.+?    const handleMoveTaskDown = async \(index\) => \{.+?    \};\n", re.DOTALL)
    new_content = pattern.sub(replacement + "\n", content)
    
    with open(path, 'w') as file:
        file.write(new_content)

print("Fixed V4: Exact mutation restore + 1ms tie-breaker")
