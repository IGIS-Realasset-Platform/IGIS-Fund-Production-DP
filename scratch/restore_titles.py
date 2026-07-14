import os
import re

files_to_check = [
    "src/components/system/pmo/PmoScheduleGate.jsx",
    "src/components/system/DecisionLog.jsx",
    "src/components/system/pmo/PmoTaskBoardStaging.jsx"
]

def restore_h1(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace text-[24px] with text-[32px] in h1 tags for these specific files
    # Actually let's just find text-[24px] and make it text-[32px] in h1
    def repl(match):
        full = match.group(0)
        return full.replace("text-[24px]", "text-[32px]").replace("text-[28px]", "text-[32px]")
        
    new_content = re.sub(r'<h1\s+[^>]*?className="[^"]*?text-\[\d+px\][^"]*?"', repl, content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Restored title in {filepath}")

for f in files_to_check:
    restore_h1(f)
