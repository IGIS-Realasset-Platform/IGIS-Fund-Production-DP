import os
import re

directory = "src/components"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            matches = re.findall(r'(className="[^"]*flex-1 flex flex-col[^"]*?)pt-\[\d+px\]', content)
            if matches:
                # To see the original string, we can do:
                original_matches = re.findall(r'className="[^"]*flex-1 flex flex-col[^"]*?pt-\[\d+px\]', content)
                for orig in original_matches:
                    print(f"{file}: {orig}")
