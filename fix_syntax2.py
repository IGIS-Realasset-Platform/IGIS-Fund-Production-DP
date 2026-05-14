import os
import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # Simple replacement to remove any leftover executeWithTimeout parentheses on supabase lines
    lines = content.split('\n')
    for i in range(len(lines)):
        if "await supabase.from" in lines[i]:
            if lines[i].endswith("));"):
                lines[i] = lines[i][:-3] + ");"
            elif lines[i].endswith("))"):
                lines[i] = lines[i][:-2] + ")"
                
    content = '\n'.join(lines)
    
    with open(path, 'w') as f:
        f.write(content)

print("Syntax Fixed 2")
