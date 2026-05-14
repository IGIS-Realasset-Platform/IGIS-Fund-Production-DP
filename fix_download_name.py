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
    
    target = ".createSignedUrl(filePath, 60);"
    replacement = ".createSignedUrl(filePath, 60, { download: fileName });"
    
    content = content.replace(target, replacement)

    with open(path, 'w') as file:
        file.write(content)

print("Done")
