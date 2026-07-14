import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = "className={`text-center font-mono text-[11px] leading-tight px-1 font-bold w-[77px] ${borderClass} ${isLast ? 'rounded-tr-[31px]' : ''}`}"
replacement = "className={`text-center font-['Inter'] text-[11px] leading-tight px-1 font-bold w-[77px] ${borderClass} ${isLast ? 'rounded-tr-[31px]' : ''}`}"

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Replaced font-mono with font-['Inter'] for table headers.")
else:
    print("Target string not found in file.")
