import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace items-end with items-baseline
content = content.replace('<div className="w-full flex items-end justify-between mb-[20px]">',
                          '<div className="w-full flex items-baseline justify-between mb-[20px]">')

# Remove pb-1 from legend
content = content.replace('<div className="flex items-center gap-4 text-[12px] font-bold pb-1">',
                          '<div className="flex items-center gap-4 text-[12px] font-bold">')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied items-baseline and removed pb-1.")
