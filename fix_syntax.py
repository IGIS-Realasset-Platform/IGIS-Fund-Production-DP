import os
import glob
import re

files = glob.glob('src/components/system/workspace/*.jsx')

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # Fix leftover closing parenthesis from executeWithTimeout removal
    content = re.sub(r"\.insert\(\[(.*?)\]\)\);", r".insert([\1]);", content)
    content = re.sub(r"\.update\((.*?)\)\.eq\((.*?)\)\);", r".update(\1).eq(\2);", content)
    content = re.sub(r"\.delete\(\)\.eq\((.*?)\)\);", r".delete().eq(\1);", content)
    
    with open(path, 'w') as f:
        f.write(content)

print("Syntax Fixed")
