import os
import re

directory = "src/components/system"

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all divs that look like root containers
            matches = re.finditer(r'<div className="([^"]*?(?:w-full|w-\[1290px\]|w-\[1200px\])[^"]*?(?:mx-auto|flex-1)[^"]*?pt-\[(\d+)px\][^"]*?)"', content)
            
            first_match = next(matches, None)
            if first_match:
                print(f"{file}: pt-[{first_match.group(2)}px]")
            else:
                print(f"{file}: NOT FOUND")
