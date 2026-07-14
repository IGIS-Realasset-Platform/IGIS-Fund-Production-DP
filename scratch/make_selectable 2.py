import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<div className="w-full rounded-[32px] select-none">'
replacement = '<div className="w-full rounded-[32px] select-text">'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced select-none with select-text.")
else:
    print("Target select-none not found.")
