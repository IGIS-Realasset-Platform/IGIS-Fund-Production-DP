import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

in_first_table = False

for i in range(len(lines)):
    line = lines[i]
    if "table-fixed w-[1290px]" in line and "pointer-events-auto" in line and "border-collapse border-b border-[#3c3c3c] bg-[#272726]" not in line:
        in_first_table = True
    elif "R&R Matrix Table" in line:
        in_first_table = False

    if in_first_table:
        # th fixes
        if 'w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726] rounded-tl-[31px]">구분' in line:
            lines[i] = line.replace('w-[110px] min-w-[110px] max-w-[110px]', 'w-[94px] min-w-[94px] max-w-[94px]')
        elif 'w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726]">주관' in line:
            lines[i] = line.replace('w-[110px] min-w-[110px] max-w-[110px]', 'w-[94px] min-w-[94px] max-w-[94px]')
        elif 'w-[110px] min-w-[110px] max-w-[110px] text-center bg-[#272726] border-r border-[#3c3c3c]">협업' in line:
            lines[i] = line.replace('w-[110px] min-w-[110px] max-w-[110px]', 'w-[94px] min-w-[94px] max-w-[94px]')
        
        # td fixes
        elif '{/* 구분 */}' in lines[i-1] and 'w-[110px] min-w-[110px] max-w-[110px]' in line:
            lines[i] = line.replace('w-[110px] min-w-[110px] max-w-[110px]', 'w-[94px] min-w-[94px] max-w-[94px]')
        elif '{/* 주관 */}' in lines[i-1] and 'w-[110px] min-w-[110px] max-w-[110px]' in line:
            lines[i] = line.replace('w-[110px] min-w-[110px] max-w-[110px]', 'w-[94px] min-w-[94px] max-w-[94px]')
        elif '{/* 협업 */}' in lines[i-1] and 'w-[110px] min-w-[110px] max-w-[110px]' in line:
            lines[i] = line.replace('w-[110px] min-w-[110px] max-w-[110px]', 'w-[94px] min-w-[94px] max-w-[94px]')

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)

print("First table widths fixed.")
