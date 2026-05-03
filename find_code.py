import json

with open('/Users/jkjeon2025/.gemini/antigravity/brain/d7daf0d1-20f1-4ea9-abc8-f17246cf4956/.system_generated/logs/overview.txt', 'r') as f:
    for line in f:
        if 'tranche_name': 'Tr.B' in line:
            if 'amount_krw_100m' in line:
                if '427' in line:
                    print(line[:500])
