import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="w-full mt-[16px] border-t border-[#3c3c3c] pt-[26px]"></div>',
    '<div className="w-full mt-[6px] border-t border-[#3c3c3c] pt-[32px]"></div>'
)

with open(path, 'w') as f:
    f.write(content)

print("Fixed divider margins!")
