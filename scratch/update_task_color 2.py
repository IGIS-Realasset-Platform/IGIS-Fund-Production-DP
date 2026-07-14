import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<td className="pl-3 font-medium text-[#E5E5E5] leading-snug text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors text-[13px] tracking-tight w-[256px] min-w-[256px] max-w-[256px]">'
replacement = '<td className="pl-3 font-medium text-[#bdbba7] leading-snug text-left pr-2 whitespace-normal break-words bg-[#272726] group-hover:bg-[#333] transition-colors text-[13px] tracking-tight w-[256px] min-w-[256px] max-w-[256px]">'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Changed color of 세부업무 text to #bdbba7.")
else:
    print("Target class string not found.")
