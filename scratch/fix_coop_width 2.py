import sys
import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the '협업' td widths which were incorrectly replaced to 94px and should actually be 80px to match their th
target_coop = 'w-[94px] min-w-[94px] max-w-[94px]">\n                                                {item.coop.split'
replacement_coop = 'w-[80px] min-w-[80px] max-w-[80px]">\n                                                {item.coop.split'

if target_coop in content:
    content = content.replace(target_coop, replacement_coop)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed 협업 column width.")
else:
    print("Target coop not found.")
