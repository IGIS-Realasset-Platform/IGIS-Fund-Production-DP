import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target1 = '<span className="text-[#E5E5E5]">수행 진행 기간</span>'
replacement1 = '<span className="text-[#c3c2b9]">수행 진행 기간</span>'

target2 = '<span className="text-[#E5E5E5]">마일스톤 달성</span>'
replacement2 = '<span className="text-[#c3c2b9]">마일스톤 달성</span>'

if target1 in content and target2 in content:
    content = content.replace(target1, replacement1)
    content = content.replace(target2, replacement2)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Changed legend text colors to #c3c2b9.")
else:
    print("Target strings not found.")
