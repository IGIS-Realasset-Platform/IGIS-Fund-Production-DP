import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix unintended changes to the bottom table
content = content.replace(
    '<th className="px-2 w-[77px] min-w-[77px] max-w-[77px] text-center bg-[#272726] text-[11px] leading-tight">PF 전<br />필요</th>',
    '<th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight">PF 전<br />필요</th>'
)
content = content.replace(
    '<th className="px-2 w-[77px] min-w-[77px] max-w-[77px] text-center bg-[#272726] text-[11px] leading-tight">착공 전<br />필요</th>',
    '<th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight">착공 전<br />필요</th>'
)
content = content.replace(
    '<th className="px-2 w-[77px] min-w-[77px] max-w-[77px] text-center bg-[#272726] text-[11px] leading-tight border-r border-[#3c3c3c]">준공 전<br />필요</th>',
    '<th className="px-2 w-[75px] min-w-[75px] max-w-[75px] text-center bg-[#272726] text-[11px] leading-tight border-r border-[#3c3c3c]">준공 전<br />필요</th>'
)

content = content.replace(
    '<td className="px-2 text-center w-[77px] min-w-[77px] max-w-[77px]">',
    '<td className="px-2 text-center w-[75px] min-w-[75px] max-w-[75px]">'
)
content = content.replace(
    '<td className="px-2 text-center border-r border-[#3c3c3c] w-[77px] min-w-[77px] max-w-[77px]">',
    '<td className="px-2 text-center border-r border-[#3c3c3c] w-[75px] min-w-[75px] max-w-[75px]">'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Restored bottom table widths!")
