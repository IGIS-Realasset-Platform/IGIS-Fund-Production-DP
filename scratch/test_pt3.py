import os
import re

directory = "src/components/system"

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') and not file.startswith('SystemLeftNav') and not file.startswith('IotaLeftNav'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the first pt-[XXpx] where XX >= 30
            matches = re.finditer(r'pt-\[(\d+)px\]', content)
            
            found = False
            for match in matches:
                size = int(match.group(1))
                if size >= 30:
                    print(f"{file}: pt-[{size}px]")
                    found = True
                    break
            
            if not found:
                print(f"{file}: NOT FOUND (or all < 30)")
