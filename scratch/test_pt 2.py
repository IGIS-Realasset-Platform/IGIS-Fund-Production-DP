import os
import re

directory = "src/components/system"

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            match = re.search(r'className="[^"]*pt-\[(\d+)px\][^"]*"', content)
            if match:
                print(f"{file}: pt-[{match.group(1)}px]")
