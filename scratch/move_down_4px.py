import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Move everything down by 4px (pt-[28px] -> pt-[32px])
content = content.replace(
    'className="w-[1290px] mx-auto flex-1 flex flex-col pt-[28px] pb-[200px] box-border select-text text-white bg-transparent text-left"',
    'className="w-[1290px] mx-auto flex-1 flex flex-col pt-[32px] pb-[200px] box-border select-text text-white bg-transparent text-left"'
)

# 2. Keep bubbles in the same absolute position by moving them UP relative to the grid (top-[-64px] -> top-[-68px])
content = content.replace(
    '<div className="absolute top-[-64px] left-0 w-full h-[36px] pointer-events-none z-50 overflow-visible">',
    '<div className="absolute top-[-68px] left-0 w-full h-[36px] pointer-events-none z-50 overflow-visible">'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Moved everything down by 4px except the bubbles.")
