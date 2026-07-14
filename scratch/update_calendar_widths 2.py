import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update 세부업무 width: 256px -> 246px
content = content.replace("w-[256px]", "w-[246px]")
content = content.replace("min-w-[256px]", "min-w-[246px]")
content = content.replace("max-w-[256px]", "max-w-[246px]")

# 2. Update calendar column width: 77px -> 78px
# Search for w-[77px] and replace with w-[78px]
content = content.replace("w-[77px]", "w-[78px]")
content = content.replace("min-w-[77px]", "min-w-[78px]")
content = content.replace("max-w-[77px]", "max-w-[78px]")

# 3. Update speech bubbles X coordinates
# PF 1차: 943.5 -> 939
content = content.replace("const x = 943.5;", "const x = 939;")
# PF 2차: 1020.5 -> 1017
content = content.replace("const x = 1020.5;", "const x = 1017;")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated column widths and speech bubble coordinates.")
