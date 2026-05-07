import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Divider lines
old_div = '<div className="w-full mt-[24px] border-t border-[#3c3c3c] pt-[50px]">'
new_div = '<div className="w-full mt-[18px] border-t border-[#3c3c3c] pt-[44px]">'
content = content.replace(old_div, new_div)

# 2. Total Project Volume background
old_bg = '<div className="p-6 bg-transparent border border-[#3c3c3c] rounded-[24px] flex gap-8 items-start">'
new_bg = '<div className="p-6 bg-[#262626] border border-[#3c3c3c] rounded-[24px] flex gap-8 items-start">'
content = content.replace(old_bg, new_bg)

with open(path, 'w') as f:
    f.write(content)
print("Applied last UI tweaks.")
