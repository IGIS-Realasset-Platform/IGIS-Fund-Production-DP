import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<div className="w-full flex items-end justify-between mb-[40px]">'
replacement = '<div className="w-full flex items-end justify-between mb-[20px]">'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated table margin to pull it up by 20px.")
else:
    print("Target margin mb-[40px] not found.")
