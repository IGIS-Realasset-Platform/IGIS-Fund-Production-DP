import sys
import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I will replace the exact td lines. 
# Let's find the td block for the R&R table.
# It starts after: {/* 대분류 */}
# Let's replace the widths inside the tbody.

# 1. 협업 부서 td
content = re.sub(
    r'<td className="pl-3 text-left w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] border-r border-\[#3c3c3c\]">',
    '<td className="pl-3 text-left w-[245px] min-w-[245px] max-w-[245px] border-r border-[#3c3c3c] whitespace-normal break-words leading-tight pr-2 text-[#E5E5E5] bg-[#272726] group-hover:bg-[#333] transition-colors">',
    content
)

# 2. 외부 상대방 td
content = re.sub(
    r'<td className="px-3 text-center text-\[#A1A1AA\] font-semibold whitespace-normal break-all w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\]">',
    '<td className="px-1 text-center text-[#A1A1AA] font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-[95px] min-w-[95px] max-w-[95px] bg-[#272726] group-hover:bg-[#333] transition-colors">',
    content
)

# 3. 필요산출물 td
content = re.sub(
    r'<td className="px-3 text-center text-\[#F59E0B\] font-semibold whitespace-normal break-all w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\]">',
    '<td className="px-1 text-center text-[#F59E0B] font-semibold whitespace-nowrap overflow-hidden text-ellipsis w-[75px] min-w-[75px] max-w-[75px] bg-[#272726] group-hover:bg-[#333] transition-colors">',
    content
)

# 4. 관리 포인트 td
content = re.sub(
    r'<td className="px-3 text-left text-\[#E5E5E5\] font-normal whitespace-normal break-all w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] border-r border-\[#3c3c3c\]">',
    '<td className={`px-2 text-left text-[#A1A1AA] font-normal whitespace-nowrap overflow-hidden text-ellipsis w-[170px] min-w-[170px] max-w-[170px] border-r border-[#3c3c3c] bg-[#272726] group-hover:bg-[#333] transition-colors ${isLastItem ? \'rounded-br-[31px]\' : \'\'}`}>',
    content
)


# Now fix ALL headers (th)
# We will use simple replacements because th headers are easier.
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] text-center bg-\[#272726\] rounded-tl-\[31px\] z-30', 'w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726] rounded-tl-[31px] z-30', content)
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] text-center bg-\[#272726\] z-30 whitespace-nowrap">세부섹터', 'w-[80px] min-w-[80px] max-w-[80px] text-center bg-[#272726] z-30 whitespace-nowrap">세부섹터', content)
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] bg-\[#272726\] border-r border-\[#3c3c3c\] ">대표 업무', 'w-[230px] min-w-[230px] max-w-[230px] bg-[#272726] border-r border-[#3c3c3c] ">대표 업무', content)
# 주관
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] text-center bg-\[#272726\]">\n\s*<div.*?주관 부서', 'w-[90px] min-w-[90px] max-w-[90px] text-center bg-[#272726]">\n                                        <div className="relative inline-flex items-center justify-center bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b] translate-x-[6px]">\n                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrLead === \'전체보기\' ? \'text-[#86868B]\' : \'text-[#2997ff]\'}`}>\n                                                {selectedRrLead === \'전체보기\' ? \'주관 부서\' : selectedRrLead}', content, flags=re.DOTALL)

# 협업
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] text-left bg-\[#272726\] border-r border-\[#3c3c3c\]">\n\s*<div.*?협업 부서', 'w-[245px] min-w-[245px] max-w-[245px] text-left bg-[#272726] border-r border-[#3c3c3c]">\n                                        <div className="relative inline-flex items-center justify-start bg-[#2c2c2b] border border-[#3c3c3c] rounded-[6px] px-2.5 py-1 transition-colors cursor-pointer hover:bg-[#323231] hover:border-[#4c4c4b]">\n                                            <span className={`font-bold text-[12px] whitespace-nowrap ${selectedRrCoop === \'전체보기\' ? \'text-[#86868B]\' : \'text-[#2997ff]\'}`}>\n                                                {selectedRrCoop === \'전체보기\' ? \'협업 부서\' : selectedRrCoop}', content, flags=re.DOTALL)

# 외부, 산출물
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] text-center bg-\[#272726\]">외부 상대방', 'w-[95px] min-w-[95px] max-w-[95px] text-center bg-[#272726]">외부 상대방', content)
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] text-center bg-\[#272726\]">필요산출물', 'w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726]">필요산출물', content)

# 관리
content = re.sub(r'w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\] text-left bg-\[#272726\] border-r border-\[#3c3c3c\] rounded-tr-\[31px\] whitespace-nowrap">관리 포인트', 'w-[170px] min-w-[170px] max-w-[170px] text-left bg-[#272726] border-r border-[#3c3c3c] rounded-tr-[31px] whitespace-nowrap">관리 포인트', content)


# 5. Fix 주관 부서 td 
content = re.sub(r'<td className="text-center w-\[\d+px\] min-w-\[\d+px\] max-w-\[\d+px\]">', '<td className="text-center w-[90px] min-w-[90px] max-w-[90px] bg-[#272726] group-hover:bg-[#333] transition-colors">', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied strict width fixes using regex.")
