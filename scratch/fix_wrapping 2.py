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

# Restore widths so text doesn't wrap
# 대분류: 80px -> 90px
replace_width(80, 90)
# 세부섹터: 94px -> 104px
replace_width(94, 104)
# 대표 업무: 230px -> 210px (to balance 10+10 = 20px)
replace_width(230, 210)

# Fix padding and wrapping for 대분류
content = content.replace('className="px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-white text-[12px] w-[90px]',
                          'className="px-1 tracking-tighter whitespace-nowrap bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-white text-[12px] w-[90px]')
content = content.replace('<th className="px-3 w-[90px] min-w-[90px]', '<th className="px-1 w-[90px] min-w-[90px]')

# Fix padding and wrapping for 세부섹터
content = content.replace('className="px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-[#E5E5E5] text-[12px] whitespace-normal break-all w-[104px]',
                          'className="px-1 tracking-tighter whitespace-nowrap bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-[#E5E5E5] text-[12px] w-[104px]')
content = content.replace('<th className="px-3 w-[104px] min-w-[104px]', '<th className="px-1 w-[104px] min-w-[104px]')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed word wrapping and padding.")
