import os
import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # Replace transition-all on the motion.div with transition-colors to prevent layout conflict
    content = content.replace("cursor-pointer transition-all duration-300 group/row", "cursor-pointer transition-colors duration-300 group/row")
    
    with open(path, 'w') as f:
        f.write(content)

print("CSS Fixed")
