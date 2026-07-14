import sys
import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix R&R table corners (Change overflow-visible to overflow-hidden on its wrapper)
content = content.replace(
    '<div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-visible relative mb-[40px] shadow-sm min-h-[1110px]">',
    '<div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-hidden relative mb-[40px] shadow-sm min-h-[1110px]">'
)

# 2. Adjust widths and padding
# 대분류
content = content.replace("w-[115px] min-w-[115px] max-w-[115px]", "w-[110px] min-w-[110px] max-w-[110px]")

# 세부섹터 (from 86 to 100, reduce padding px-3 to px-1 to avoid wrap)
content = content.replace(
    '<th className="px-3 w-[86px] min-w-[86px] max-w-[86px]',
    '<th className="px-1 w-[100px] min-w-[100px] max-w-[100px]'
)
content = content.replace(
    '<td className="px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-[#E5E5E5] text-[12px] whitespace-normal break-words w-[86px] min-w-[86px] max-w-[86px]">',
    '<td className="px-1 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-[#E5E5E5] text-[12px] whitespace-nowrap overflow-hidden text-ellipsis w-[100px] min-w-[100px] max-w-[100px]">'
)

# 대표 업무 (from 230 to 220)
content = content.replace("w-[230px] min-w-[230px] max-w-[230px]", "w-[220px] min-w-[220px] max-w-[220px]")

# 협업 부서 (from 230 to 220)
content = content.replace("w-[230px] min-w-[230px] max-w-[230px]", "w-[220px] min-w-[220px] max-w-[220px]")

# 외부 상대방 (from 94 to 110)
content = content.replace("w-[94px] min-w-[94px] max-w-[94px]", "w-[110px] min-w-[110px] max-w-[110px]")
content = content.replace(
    '<td className="px-1 text-[#bdbba7] leading-tight text-center whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors w-[110px] min-w-[110px] max-w-[110px]">',
    '<td className="px-1 text-[#bdbba7] leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis bg-[#272726] group-hover:bg-[#333] transition-colors w-[110px] min-w-[110px] max-w-[110px]">'
)

# 필요산출물 (from 94 to 90)
content = content.replace("w-[94px] min-w-[94px] max-w-[94px]", "w-[90px] min-w-[90px] max-w-[90px]")
content = content.replace(
    '<td className="px-1 font-semibold text-[#F59E0B] leading-tight text-center whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors w-[90px] min-w-[90px] max-w-[90px]">',
    '<td className="px-1 font-semibold text-[#F59E0B] leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis bg-[#272726] group-hover:bg-[#333] transition-colors w-[90px] min-w-[90px] max-w-[90px]">'
)

# 관리 포인트 (from 156 to 175)
content = content.replace("w-[156px] min-w-[156px] max-w-[156px]", "w-[175px] min-w-[175px] max-w-[175px]")
content = content.replace(
    '<td className={`pl-3 font-normal text-[#A1A1AA] text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors text-[12px] w-[175px] min-w-[175px] max-w-[175px] ${isLastItem ? \'rounded-br-[31px]\' : \'\'}`}>',
    '<td className={`pl-1 font-normal text-[#A1A1AA] text-left pr-1 whitespace-nowrap overflow-hidden text-ellipsis bg-[#272726] group-hover:bg-[#333] transition-colors text-[12px] w-[175px] min-w-[175px] max-w-[175px] ${isLastItem ? \'rounded-br-[31px]\' : \'\'}`}>'
)


# Add whitespace-nowrap to th elements to prevent wrapping in headers
content = content.replace('text-center bg-[#272726] z-30">세부섹터</th>', 'text-center bg-[#272726] z-30 whitespace-nowrap">세부섹터</th>')
content = content.replace('text-left bg-[#272726] border-r border-[#3c3c3c] rounded-tr-[31px]">관리 포인트</th>', 'text-left bg-[#272726] border-r border-[#3c3c3c] rounded-tr-[31px] whitespace-nowrap">관리 포인트</th>')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed corners and adjusted widths.")
