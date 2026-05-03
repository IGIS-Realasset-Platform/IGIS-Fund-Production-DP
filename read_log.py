import json

found = []
with open('/Users/jkjeon2025/.gemini/antigravity/brain/d7daf0d1-20f1-4ea9-abc8-f17246cf4956/.system_generated/logs/overview.txt', 'r') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "427" in line and "Tr.B" in line and "2500" in line:
            found.append(line)
        if "수협은행" in line or "한국투자" in line:
            found.append(line)
        
for item in found[-5:]:
    print(item[:500])
