import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '<div className="-mx-[60px] h-[1px] bg-[#2C2C2E] mt-[64px] mb-[48px]" />'
replacement = '<div className="w-full h-[1px] bg-[#2C2C2E] mt-[50px] mb-[38px]" />'

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated divider width and margins.")
else:
    print("Target divider not found.")
