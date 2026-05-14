import os
import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # Add min-h-[28px] to the next_action paragraph to prevent collapse when empty
    # original: <p className="text-[18px] text-[#bbb9af] leading-relaxed break-keep font-medium -translate-y-[6px]">
    content = content.replace(
        '<p className="text-[18px] text-[#bbb9af] leading-relaxed break-keep font-medium -translate-y-[6px]">',
        '<p className="min-h-[28px] text-[18px] text-[#bbb9af] leading-relaxed break-keep font-medium -translate-y-[6px]">'
    )
    
    with open(path, 'w') as f:
        f.write(content)

print("Height Fixed")
