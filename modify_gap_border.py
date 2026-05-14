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
    
    # 1. Add border to button
    target_btn = """className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors flex items-center gap-2\""""
    replacement_btn = """className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors flex items-center gap-2 border border-[#444]\""""
    
    content = content.replace(target_btn, replacement_btn)
    
    # 2. Reduce gap to 14px
    # Search for: <div className="w-full bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex flex-col gap-4">
    target_gap = """<div className="w-full bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex flex-col gap-4">"""
    replacement_gap = """<div className="w-full bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex flex-col gap-[14px]">"""
    
    content = content.replace(target_gap, replacement_gap)

    with open(path, 'w') as file:
        file.write(content)

print("Done")
