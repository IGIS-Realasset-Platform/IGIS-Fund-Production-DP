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
    
    # 1. Add cursor-pointer to upload button
    target_up = """className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors flex items-center gap-2 border border-[#444]\""""
    replacement_up = """className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors flex items-center gap-2 border border-[#444] cursor-pointer\""""
    content = content.replace(target_up, replacement_up)

    # 2. Add cursor-pointer to download button
    target_down = """className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors border border-[#444]\""""
    replacement_down = """className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors border border-[#444] cursor-pointer\""""
    content = content.replace(target_down, replacement_down)

    with open(path, 'w') as file:
        file.write(content)

print("Done")
