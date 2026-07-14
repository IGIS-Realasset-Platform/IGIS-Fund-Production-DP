import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Decrease 세부섹터 to 80px
content = content.replace("w-[100px] min-w-[100px] max-w-[100px]", "w-[80px] min-w-[80px] max-w-[80px]")

# 2. Increase 협업 부서 to 230px
content = content.replace("w-[210px] min-w-[210px] max-w-[210px]", "w-[230px] min-w-[230px] max-w-[230px]")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Tweaked widths: -20px from 세부섹터, +20px to 협업부서")
