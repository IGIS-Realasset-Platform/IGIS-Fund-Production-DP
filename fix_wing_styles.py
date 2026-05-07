import sys

path = 'src/components/system/workspace/WorkspaceDevelopment.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. PROJECT title (11px -> 12px, remove tracking-widest)
content = content.replace(
    'className="text-[11px] font-bold text-[#86868B] tracking-widest uppercase mb-[4px] pl-[4px]"',
    'className="text-[12px] font-bold text-[#86868B] tracking-normal uppercase mb-[4px] pl-[4px]"'
)

# 2. Button text size (13px -> 14px)
content = content.replace(
    'transition-colors duration-200 text-[13px] font-bold',
    'transition-colors duration-200 text-[14px] font-bold'
)

# 3. Active color (yellow to blue)
content = content.replace(
    'bg-[#E5F059] text-black shadow-sm',
    'bg-[#2997ff] text-white shadow-sm'
)

with open(path, 'w') as f:
    f.write(content)
print("Wing styles updated")
