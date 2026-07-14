import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update text content
content = content.replace("Asset/Share/합병", "Asset/Share")

# 2. Update table corners by enforcing overflow-hidden on the wrapper
old_wrapper = 'className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-visible relative mb-[40px] shadow-sm min-h-[1110px]"'
new_wrapper = 'className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-hidden relative mb-[40px] shadow-sm min-h-[1110px]"'
content = content.replace(old_wrapper, new_wrapper)

# 3. Update column widths
def replace_width(old_w, new_w):
    global content
    content = content.replace(f"w-[{old_w}px]", f"w-[{new_w}px]")
    content = content.replace(f"min-w-[{old_w}px]", f"min-w-[{new_w}px]")
    content = content.replace(f"max-w-[{old_w}px]", f"max-w-[{new_w}px]")

# 대분류: 90 -> 94
replace_width(90, 94)

# 대표업무: 190 -> 200
replace_width(190, 200)

# PF전, 착공전, 준공전 were all 65px. We change them individually.
# We'll use string replacement on the header strings to isolate them.
# PF 전 필요
content = content.replace('w-[65px] min-w-[65px] max-w-[65px] text-center bg-[#272726] text-[11px] leading-tight">PF 전',
                          'w-[60px] min-w-[60px] max-w-[60px] text-center bg-[#272726] text-[11px] leading-tight">PF 전')
# 착공 전 필요
content = content.replace('w-[65px] min-w-[65px] max-w-[65px] text-center bg-[#272726] text-[11px] leading-tight">착공 전',
                          'w-[60px] min-w-[60px] max-w-[60px] text-center bg-[#272726] text-[11px] leading-tight">착공 전')
# 준공 전 필요
content = content.replace('w-[65px] min-w-[65px] max-w-[65px] text-center bg-[#272726] text-[11px] leading-tight border-r',
                          'w-[61px] min-w-[61px] max-w-[61px] text-center bg-[#272726] text-[11px] leading-tight border-r')

# For body cells, there are exactly 3 instances of 65px remaining, which are PF전, 착공전, 준공전 respectively in the row.
# We will do sequential replacement for the body cells.
# Actually, replacing all remaining 65px to a list of [60, 60, 61] in a loop.
count_65 = content.count('w-[65px]')
if count_65 > 0:
    # Let's do it safely by targeting their specific class strings
    # PF 전
    content = content.replace('w-[65px] min-w-[65px] max-w-[65px]">\n                                                {item.pf',
                              'w-[60px] min-w-[60px] max-w-[60px]">\n                                                {item.pf')
    # 착공 전
    content = content.replace('w-[65px] min-w-[65px] max-w-[65px]">\n                                                {item.const',
                              'w-[60px] min-w-[60px] max-w-[60px]">\n                                                {item.const')
    # 준공 전
    content = content.replace('w-[65px] min-w-[65px] max-w-[65px]">\n                                                {item.op',
                              'w-[61px] min-w-[61px] max-w-[61px]">\n                                                {item.op')
                              
# 협업 부서: 180 -> 204
replace_width(180, 204)

# 외부 상대방: 100 -> 106
replace_width(100, 106)

# 필요산출물: 130 -> 120
replace_width(130, 120)

# 관리 포인트: 205 -> 185
replace_width(205, 185)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated columns and rounded corners.")
