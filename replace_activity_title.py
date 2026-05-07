import sys

path = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
with open(path, 'r') as f:
    content = f.read()

# I need to add getShortLabel function inside the component or just inline it.
# Inline is easy: {workspaceLabel ? workspaceLabel.split('-')[0].trim() : ''}
old_title_code = '<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">최근 등록된 업무</h2>'
new_title_code = '<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">[{workspaceLabel ? workspaceLabel.split(\'-\')[0].trim() : \'\'}] 전체 활동</h2>'

if old_title_code in content:
    content = content.replace(old_title_code, new_title_code)
    with open(path, 'w') as f:
        f.write(content)
    print("Activity log title updated.")
else:
    print("Could not find the original title code.")

