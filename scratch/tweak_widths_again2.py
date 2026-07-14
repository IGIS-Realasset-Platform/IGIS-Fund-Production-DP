import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Decrease 필요산출물 to 80px
content = content.replace("w-[90px] min-w-[90px] max-w-[90px]", "w-[80px] min-w-[80px] max-w-[80px]")

# 2. Increase 관리 포인트 to 185px
content = content.replace("w-[175px] min-w-[175px] max-w-[175px]", "w-[185px] min-w-[185px] max-w-[185px]")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Tweaked widths: -10px from 필요산출물, +10px to 관리 포인트")
