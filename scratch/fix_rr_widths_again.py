import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Subtract 10px from 대표 업무
content = content.replace("w-[220px] min-w-[220px] max-w-[220px] bg-[#272726] border-r border-[#3c3c3c] \">대표 업무</th>", "w-[210px] min-w-[210px] max-w-[210px] bg-[#272726] border-r border-[#3c3c3c] \">대표 업무</th>")
content = content.replace("w-[220px] min-w-[220px] max-w-[220px]\">", "w-[210px] min-w-[210px] max-w-[210px]\">")

# Subtract 10px from 협업 부서
content = content.replace("w-[220px] min-w-[220px] max-w-[220px] text-left", "w-[210px] min-w-[210px] max-w-[210px] text-left")
# Note: The td for 협업 부서 has a specific className. I should just replace w-[220px] if there are only 2 occurrences (1 for th, 1 for td).
content = content.replace("w-[220px] min-w-[220px] max-w-[220px]", "w-[210px] min-w-[210px] max-w-[210px]")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Adjusted to exactly 1290px.")
