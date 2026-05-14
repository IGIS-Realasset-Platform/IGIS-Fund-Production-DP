import os
import re

workspaces = {
    'WorkspacePm.jsx': 'iota_pm_tasks',
    'WorkspaceDevelopment.jsx': 'iota_dev_tasks',
    'WorkspaceMarketing.jsx': 'iota_mkt_tasks',
    'WorkspaceFinancing.jsx': 'iota_fin_tasks',
    'WorkspaceIpr.jsx': 'iota_ipr_tasks',
    'WorkspaceFund.jsx': 'iota_fund_tasks',
    'WorkspaceDigital.jsx': 'iota_digital_tasks'
}

base_dir = 'src/components/system/workspace'

for f, table_name in workspaces.items():
    path = os.path.join(base_dir, f)
    with open(path, 'r') as file:
        content = file.read()

    replacement = f"""    const handleMoveTaskUp = async (index) => {{
        if (index === 0) return;
        const current = sortedTasks[index];
        const prev = sortedTasks[index - 1];
        
        let tCurrent = new Date(current.created_at || Date.now()).getTime();
        let tPrev = new Date(prev.created_at || Date.now()).getTime();
        
        if (tCurrent === tPrev) {{
            tPrev += 1;
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
            localStorage.setItem('{table_name}_fallback', JSON.stringify(newTasks));
        }}
    }};

    const handleMoveTaskDown = async (index) => {{
        if (index === sortedTasks.length - 1) return;
        const current = sortedTasks[index];
        const next = sortedTasks[index + 1];
        
        let tCurrent = new Date(current.created_at || Date.now()).getTime();
        let tNext = new Date(next.created_at || Date.now()).getTime();
        
        if (tCurrent === tNext) {{
            tNext += 1;
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
            localStorage.setItem('{table_name}_fallback', JSON.stringify(newTasks));
        }}
    }};"""

    pattern = re.compile(r"    const handleMoveTaskUp = async \(index\) => \{.+?    const handleMoveTaskDown = async \(index\) => \{.+?    \};\n", re.DOTALL)
    new_content = pattern.sub(replacement + "\n", content)
    
    with open(path, 'w') as file:
        file.write(new_content)

print("Immutable Fix Done")
