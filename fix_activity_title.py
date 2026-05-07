import sys

path = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
with open(path, 'r') as f:
    content = f.read()

old_title = '<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">[{workspaceLabel ? workspaceLabel.split(\'-\')[0].trim() : \'\'}] 전체 활동</h2>'
new_title = '<h2 className="text-[18px] font-bold text-white tracking-tight translate-y-[2px]">{workspaceLabel ? workspaceLabel.split(\'-\')[0].trim() : \'\'} 업무 이력</h2>'

if old_title in content:
    content = content.replace(old_title, new_title)
    with open(path, 'w') as f:
        f.write(content)
    print("Activity log title text updated.")
else:
    print("Could not find the original title text.")

