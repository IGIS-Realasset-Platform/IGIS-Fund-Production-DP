import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<div className="w-full flex items-baseline justify-between mb-[20px]">'
replacement = '<div className="w-full flex items-baseline justify-between mb-[14px]">'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Changed mb-[20px] to mb-[14px] to pull table up by 6px.")
else:
    print("Target mb-[20px] not found.")
