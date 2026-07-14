import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix th widths
content = content.replace(
    '<th className="pl-[10px] pr-1 w-[94px] text-center bg-[#272726] rounded-tl-[31px]">구분</th>',
    '<th className="pl-[10px] pr-1 w-[94px] min-w-[94px] max-w-[94px] text-center bg-[#272726] rounded-tl-[31px]">구분</th>'
)
content = content.replace(
    '<th className="pl-3 w-[256px] bg-[#272726]">세부업무</th>',
    '<th className="pl-3 w-[258px] min-w-[258px] max-w-[258px] bg-[#272726]">세부업무</th>'
)
content = content.replace(
    '<th className="px-1 w-[94px] text-center bg-[#272726]">주관</th>',
    '<th className="px-1 w-[94px] min-w-[94px] max-w-[94px] text-center bg-[#272726]">주관</th>'
)
content = content.replace(
    '<th className="px-1 w-[94px] text-center bg-[#272726] border-r border-[#3c3c3c]">협업</th>',
    '<th className="px-1 w-[94px] min-w-[94px] max-w-[94px] text-center bg-[#272726] border-r border-[#3c3c3c]">협업</th>'
)

# Fix calendar th
content = content.replace(
    "px-1 font-bold w-[78px]",
    "px-1 font-bold w-[75px] min-w-[75px] max-w-[75px]"
)

# Fix td widths
content = content.replace(
    "w-[256px] min-w-[256px] max-w-[256px]",
    "w-[258px] min-w-[258px] max-w-[258px]"
)
content = content.replace(
    "w-[78px] min-w-[78px] max-w-[78px]",
    "w-[75px] min-w-[75px] max-w-[75px]"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed table 1 widths!")
