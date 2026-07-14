import os
import re

directory = "src/components/system"

# 1. Update IotaLeftNav.jsx logo
leftnav_path = os.path.join(directory, "IotaLeftNav.jsx")
with open(leftnav_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace text-[20px] with text-[18px] and IOTA Seoul with IOTA Seoul CFT
# We can do this with targeted replaces:
content = content.replace('<span className="font-bold text-[20px] tracking-tight font-inter ml-[5px] text-white">\n                    IOTA Seoul\n                </span>',
                          '<span className="font-bold text-[18px] tracking-tight font-inter ml-[5px] text-white">\n                    IOTA Seoul CFT\n                </span>')

with open(leftnav_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Decrease top margin for all pages
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') and not file.startswith('SystemLeftNav') and not file.startswith('IotaLeftNav'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the first pt-[XXpx] where XX >= 30
            matches = list(re.finditer(r'pt-\[(\d+)px\]', content))
            
            for match in matches:
                size = int(match.group(1))
                if size >= 30:
                    # Decrease by 10
                    new_size = size - 10
                    # Replace only this specific occurrence
                    start, end = match.span()
                    new_content = content[:start] + f"pt-[{new_size}px]" + content[end:]
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated top margin in {file}: {size}px -> {new_size}px")
                    break # Only replace the first matching occurrence
