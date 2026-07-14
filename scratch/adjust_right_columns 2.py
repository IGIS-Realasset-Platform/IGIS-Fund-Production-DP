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
# 외부 상대방: 106px -> 90px
replace_width(106, 90)
# 필요산출물: 120px -> 100px
replace_width(120, 100)
# 협업 부서: 204px -> 240px
replace_width(204, 240)

# Fix padding and wrapping for 외부 상대방
# current td class (roughly): className="px-3 text-center text-[#A1A1AA] font-semibold whitespace-normal break-all w-[90px]..."
# Let's use regex to be safe.
# Replace padding and break-all for 외부 상대방 (it will be w-[90px] after width replacement above)
content = re.sub(
    r'className="px-3 text-center text-\[\#A1A1AA\] font-semibold whitespace-normal break-all w-\[90px\]',
    r'className="px-1 tracking-tighter whitespace-nowrap text-center text-[#A1A1AA] font-semibold w-[90px]',
    content
)
content = content.replace('<th className="px-3 w-[90px] min-w-[90px]', '<th className="px-1 tracking-tighter whitespace-nowrap w-[90px] min-w-[90px]')

# Fix padding and wrapping for 필요산출물 (it will be w-[100px] after width replacement)
# current td class (roughly): className="px-3 text-center text-[#bdbba7] font-semibold whitespace-normal break-all w-[100px]..."
content = re.sub(
    r'className="px-3 text-center text-\[\#bdbba7\] font-semibold whitespace-normal break-all w-\[100px\]',
    r'className="px-1 tracking-tighter whitespace-nowrap text-center text-[#bdbba7] font-semibold w-[100px]',
    content
)
content = content.replace('<th className="px-3 w-[100px] min-w-[100px]', '<th className="px-1 tracking-tighter whitespace-nowrap w-[100px] min-w-[100px]')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Adjusted external partner and output widths, applied whitespace-nowrap to prevent dropping lines.")
