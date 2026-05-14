import os

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

    # We will just replace the entire handleMoveTaskUp and handleMoveTaskDown functions with the clean string.
    import re
    
    replacement = f"""    const handleMoveTaskUp = async (index) => {{
        if (index === 0) return;
        const current = sortedTasks[index];
        const prev = sortedTasks[index - 1];
        
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

print("Absolute Revert Done")
