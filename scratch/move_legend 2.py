import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<div className="flex items-center gap-4 text-[12px] font-bold">'
replacement = '<div className="flex items-center gap-4 text-[12px] font-bold pr-[10px]">'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added pr-[10px] to move the legend to the left.")
else:
    print("Target legend class not found.")
