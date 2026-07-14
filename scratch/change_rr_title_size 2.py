import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<h2 className="text-[36px] font-bold text-white tracking-tight leading-none text-left">R&R 및 필요산출물</h2>'
replacement = '<h2 className="text-[32px] font-bold text-white tracking-tight leading-none text-left">R&R 및 필요산출물</h2>'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Changed R&R title size to 32px.")
else:
    print("Target R&R title not found.")
