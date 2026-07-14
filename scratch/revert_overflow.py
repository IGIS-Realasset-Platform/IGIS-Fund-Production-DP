import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-hidden relative mb-[40px] shadow-sm min-h-[1110px]">',
    '<div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-visible relative mb-[40px] shadow-sm min-h-[1110px]">'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Reverted overflow-hidden to overflow-visible.")
