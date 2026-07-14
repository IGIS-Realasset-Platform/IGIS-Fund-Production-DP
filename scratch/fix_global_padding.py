import os
import re

directory = "src/components"
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".jsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Find and replace the pt-[XXpx] in the main wrapper
            new_content = re.sub(
                r'(className="(?:w-full|w-\[\d+px\])[^"]*flex-1 flex flex-col[^"]*?)pt-\[\d+px\]',
                r'\1pt-[28px]',
                content
            )
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {path}")
