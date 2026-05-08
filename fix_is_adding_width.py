import re

files = [
    "src/components/system/workspace/WorkspaceDigital.jsx",
    "src/components/system/workspace/WorkspaceMarketing.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # Fix isAdding box
    target = """                {isAdding && (
                    <div className="bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex flex-col gap-4">"""
    replacement = """                {isAdding && (
                    <div className="w-full bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex flex-col gap-4">"""
    
    content = content.replace(target, replacement)

    with open(file_path, "w") as f:
        f.write(content)
