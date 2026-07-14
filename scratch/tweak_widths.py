import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Increase 대분류 to 115px
content = content.replace("w-[110px] min-w-[110px] max-w-[110px]", "w-[115px] min-w-[115px] max-w-[115px]")
# 2. Decrease 협업 부서 to 230px
content = content.replace("w-[235px] min-w-[235px] max-w-[235px]", "w-[230px] min-w-[230px] max-w-[230px]")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Tweaked widths for extra safety.")
