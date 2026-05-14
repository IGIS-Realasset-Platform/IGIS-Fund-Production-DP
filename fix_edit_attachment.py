import os

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
    
    # 1. Update initial state
    target_init = """task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '신규', priority: '중간', due_date: new Date().toLocaleDateString('en-CA'), next_action: ''"""
    replacement_init = """task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '신규', priority: '중간', due_date: new Date().toLocaleDateString('en-CA'), next_action: '', notes: '', file_name: null, file_url: null"""
    content = content.replace(target_init, replacement_init)

    # 2. Update setNewTask occurrences
    target_reset = """setNewTask({ task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '신규', priority: '중간', due_date: new Date().toLocaleDateString('en-CA'), next_action: '', notes: '' });"""
    replacement_reset = """setNewTask({ task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '신규', priority: '중간', due_date: new Date().toLocaleDateString('en-CA'), next_action: '', notes: '', file_name: null, file_url: null });"""
    content = content.replace(target_reset, replacement_reset)
    
    # 3. Update handleEditRow
    target_edit = """next_action: row.next_action || '',
            notes: row.notes || ''
        });"""
    replacement_edit = """next_action: row.next_action || '',
            notes: row.notes || '',
            file_name: row.file_name || null,
            file_url: row.file_url || null
        });"""
    content = content.replace(target_edit, replacement_edit)

    with open(path, 'w') as file:
        file.write(content)

print("Done")
