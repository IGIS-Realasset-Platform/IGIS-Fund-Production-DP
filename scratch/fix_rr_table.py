import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update th widths and add rounded corners for header
# 대분류
content = content.replace(
    '<th className="px-1 w-[90px] min-w-[90px] max-w-[90px] text-center bg-[#272726] z-30">',
    '<th className="px-1 w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726] rounded-tl-[31px] z-30">'
)
# 세부섹터
content = content.replace(
    '<th className="px-3 w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726] z-30">세부섹터</th>',
    '<th className="px-3 w-[86px] min-w-[86px] max-w-[86px] text-center bg-[#272726] z-30">세부섹터</th>'
)
# 대표 업무
content = content.replace(
    '<th className="pl-3 w-[210px] min-w-[210px] max-w-[210px] bg-[#272726] border-r border-[#3c3c3c] ">대표 업무</th>',
    '<th className="pl-3 w-[230px] min-w-[230px] max-w-[230px] bg-[#272726] border-r border-[#3c3c3c] ">대표 업무</th>'
)
# 협업 부서
content = content.replace(
    '<th className="pl-3 w-[180px] min-w-[180px] max-w-[180px] text-left bg-[#272726] border-r border-[#3c3c3c]">',
    '<th className="pl-3 w-[235px] min-w-[235px] max-w-[235px] text-left bg-[#272726] border-r border-[#3c3c3c]">'
)
# 외부 상대방
content = content.replace(
    '<th className="px-1 tracking-tighter whitespace-nowrap w-[106px] min-w-[106px] max-w-[106px] text-center bg-[#272726]">외부 상대방</th>',
    '<th className="px-1 tracking-tighter whitespace-nowrap w-[94px] min-w-[94px] max-w-[94px] text-center bg-[#272726]">외부 상대방</th>'
)
# 필요산출물
content = content.replace(
    '<th className="px-1 tracking-tighter whitespace-nowrap w-[106px] min-w-[106px] max-w-[106px] text-center bg-[#272726]">필요산출물</th>',
    '<th className="px-1 tracking-tighter whitespace-nowrap w-[94px] min-w-[94px] max-w-[94px] text-center bg-[#272726]">필요산출물</th>'
)
# 관리 포인트
content = content.replace(
    '<th className="px-3 w-[205px] min-w-[205px] max-w-[205px] text-left bg-[#272726] border-r border-[#3c3c3c]">관리 포인트</th>',
    '<th className="px-3 w-[156px] min-w-[156px] max-w-[156px] text-left bg-[#272726] border-r border-[#3c3c3c] rounded-tr-[31px]">관리 포인트</th>'
)

# 2. Update td widths and add rounded corners for bottom row
# 대분류
content = content.replace(
    '<td className="px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-white text-[12px] w-[90px] min-w-[90px] max-w-[90px]">',
    '<td className={`px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-white text-[12px] w-[110px] min-w-[110px] max-w-[110px] ${isLastItem ? \'rounded-bl-[31px]\' : \'\'}`}>'
)
# 세부섹터
content = content.replace(
    '<td className="px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-[#E5E5E5] text-[12px] whitespace-normal break-all w-[120px] min-w-[120px] max-w-[120px]">',
    '<td className="px-3 bg-[#272726] group-hover:bg-[#333] transition-colors text-center font-bold text-[#E5E5E5] text-[12px] whitespace-normal break-words w-[86px] min-w-[86px] max-w-[86px]">'
)
# 대표 업무
content = content.replace(
    '<td className="pl-3 font-bold text-[#bdbba7] leading-snug text-left pr-2 whitespace-normal break-all bg-[#272726] group-hover:bg-[#333] transition-colors border-r border-[#3c3c3c]  text-[13px] w-[210px] min-w-[210px] max-w-[210px]">',
    '<td className="pl-3 font-bold text-[#bdbba7] leading-snug text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors border-r border-[#3c3c3c] text-[13px] w-[230px] min-w-[230px] max-w-[230px]">'
)
# 협업 부서
content = content.replace(
    '<td className="pl-3 pr-2 text-[#E5E5E5] leading-tight text-left whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors border-r border-[#3c3c3c] w-[180px] min-w-[180px] max-w-[180px]">',
    '<td className="pl-3 pr-2 text-[#E5E5E5] leading-tight text-left whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors border-r border-[#3c3c3c] w-[235px] min-w-[235px] max-w-[235px]">'
)
# 외부 상대방
content = content.replace(
    '<td className="px-1 text-[#bdbba7] leading-tight text-center whitespace-normal break-all bg-[#272726] group-hover:bg-[#333] transition-colors w-[106px] min-w-[106px] max-w-[106px]">',
    '<td className="px-1 text-[#bdbba7] leading-tight text-center whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors w-[94px] min-w-[94px] max-w-[94px]">'
)
# 필요산출물
content = content.replace(
    '<td className="px-1 font-semibold text-[#F59E0B] leading-tight text-center whitespace-normal break-all bg-[#272726] group-hover:bg-[#333] transition-colors w-[106px] min-w-[106px] max-w-[106px]">',
    '<td className="px-1 font-semibold text-[#F59E0B] leading-tight text-center whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors w-[94px] min-w-[94px] max-w-[94px]">'
)
# 관리 포인트
content = content.replace(
    '<td className="pl-3 font-normal text-[#A1A1AA] text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors text-[12px] w-[205px] min-w-[205px] max-w-[205px]">',
    '<td className={`pl-3 font-normal text-[#A1A1AA] text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors text-[12px] w-[156px] min-w-[156px] max-w-[156px] ${isLastItem ? \'rounded-br-[31px]\' : \'\'}`}>'
)

# 3. We also need to define `isLastItem` in the map loop.
# Let's find the map line: `.map((item) => {`
# Wait, it's: `.map((item) => {`
# But we need index to find if it's the last item.
# Let's check how the map is written.
map_str = "}).map((item) => {"
if map_str in content:
    # We must filter first, then map over the filtered array to know the true last item.
    pass

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced R&R widths!")
