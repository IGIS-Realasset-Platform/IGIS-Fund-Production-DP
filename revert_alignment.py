import re

files = [
    "src/components/system/workspace/WorkspaceDigital.jsx",
    "src/components/system/workspace/WorkspaceMarketing.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # Revert header
    content = content.replace('mb-[10px] pr-[118px]">', 'mb-[10px]">')
    
    # Revert list container
    content = content.replace('mb-[40px] pr-[118px]">', 'mb-[40px]">')

    with open(file_path, "w") as f:
        f.write(content)
