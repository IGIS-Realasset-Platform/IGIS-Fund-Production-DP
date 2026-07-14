import os
import re

directory = "src/components/system"

def restore_h1(filepath):
    if "GovRoadmap.jsx" in filepath: return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    def repl(match):
        full = match.group(0)
        return full.replace("text-[24px]", "text-[32px]").replace("text-[28px]", "text-[32px]")
        
    new_content = re.sub(r'<h1\s+[^>]*?className="[^"]*?text-\[\d+px\][^"]*?"', repl, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Restored title in {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            restore_h1(os.path.join(root, file))
