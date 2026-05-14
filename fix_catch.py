import os
import glob

files = glob.glob('src/components/system/workspace/*.jsx')

for path in files:
    with open(path, 'r') as f:
        content = f.read()
    
    # Remove the unasked-for alert and reload
    content = content.replace("            alert('서버 통신 지연이 감지되어 임시 보관 처리 후 새로고침합니다.');\n", "")
    content = content.replace("            window.location.reload();\n", "")
    
    with open(path, 'w') as f:
        f.write(content)

print("Catch Blocks Restored")
