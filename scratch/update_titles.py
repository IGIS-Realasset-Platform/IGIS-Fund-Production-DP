import os
import re

directory = "src/components/system"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Function to decrease text-[XXpx] sizes by 4
    def repl_pixel(match):
        full_match = match.group(0)
        size = int(match.group(1))
        new_size = size - 4
        return full_match.replace(f"text-[{size}px]", f"text-[{new_size}px]")
        
    # Process text-[XXpx] inside <h1 ...>
    new_content = re.sub(r'<h1\s+[^>]*?className="[^"]*?text-\[(\d+)px\][^"]*?"', repl_pixel, content)
    
    # Process tailwind classes like text-3xl, text-2xl inside <h1 ...>
    def repl_tailwind(match):
        full_match = match.group(0)
        tw_class = match.group(1)
        if tw_class == "3xl":
            new_class = "text-[26px]" # 30px - 4px
        elif tw_class == "2xl":
            new_class = "text-[20px]" # 24px - 4px
        else:
            return full_match
        return full_match.replace(f"text-{tw_class}", new_class)
        
    new_content = re.sub(r'<h1\s+[^>]*?className="[^"]*?text-(3xl|2xl)[^"]*?"', repl_tailwind, new_content)
    
    if "SystemLeftNav.jsx" in filepath:
        new_content = new_content.replace(">IOTA Seoul<", ">IOTA Seoul CFT<")
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
