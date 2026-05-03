import json

with open('/Users/jkjeon2025/.gemini/antigravity/brain/d7daf0d1-20f1-4ea9-abc8-f17246cf4956/.system_generated/logs/overview.txt', 'r') as f:
    for line in f:
        if 'insert' in line.lower() and 'iota_capital_stack' in line.lower():
            print(line[:500])
