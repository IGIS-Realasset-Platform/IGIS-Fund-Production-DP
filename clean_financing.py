import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# Find the point where to cut
marker = '            <WorkspaceActivityLog workspaceCode="WS_LFC" workspaceLabel="파이낸싱-LFC" />'
if marker in content:
    idx = content.find(marker) + len(marker)
    new_content = content[:idx] + '\n        </div>\n    );\n}'
    
    with open(path, 'w') as f:
        f.write(new_content)
    print("Cleaned up WorkspaceFinancing.jsx")
else:
    print("Could not find the marker.")
