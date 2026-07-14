import sys
import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

def replace_width(old_w, new_w):
    global content
    content = content.replace(f"w-[{old_w}px]", f"w-[{new_w}px]")
    content = content.replace(f"min-w-[{old_w}px]", f"min-w-[{new_w}px]")
    content = content.replace(f"max-w-[{old_w}px]", f"max-w-[{new_w}px]")

# Widths adjustments
# 대분류: 94px -> 80px
replace_width(94, 80)
# 세부섹터: 110px -> 94px
replace_width(110, 94)
# 대표 업무: 200px -> 230px
replace_width(200, 230)

# Text Color adjustments: change #F59E0B to #bdbba7 for the body td elements
# 대표 업무 td
# old: <td className="pl-3 font-bold text-[#F59E0B] leading-snug text-left pr-2 whitespace-normal break-all bg-[#272726] group-hover:bg-[#333] transition-colors border-r border-[#3c3c3c]  text-[13px] w-[230px] min-w-[230px] max-w-[230px]">
# Wait, width was changed from 200 to 230 above, so it will be w-[230px]... Let's just do regex replacement for the text color specifically within the table td.

content = re.sub(r'(<td[^>]*text-\[)#F59E0B(\][^>]*>[\s\n]*\{item\.task\})', r'\g<1>#bdbba7\2', content)

# 필요산출물 td
# old: <td className="px-3 text-center text-[#F59E0B] font-semibold whitespace-normal break-all w-[120px] min-w-[120px] max-w-[120px]">
content = re.sub(r'(<td[^>]*text-\[)#F59E0B(\][^>]*>[\s\n]*\{item\.output)', r'\g<1>#bdbba7\2', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Adjusted widths and updated text colors to #bdbba7.")
