import json

found_lines = []
with open('/Users/jkjeon2025/.gemini/antigravity/brain/d7daf0d1-20f1-4ea9-abc8-f17246cf4956/.system_generated/logs/overview.txt', 'r') as f:
    for line in f:
        if "delete" in line.lower() or "insert" in line.lower() or "427" in line:
            if "supabase" in line.lower():
                found_lines.append(line)

for line in found_lines[-20:]:
    print(line[:300])
