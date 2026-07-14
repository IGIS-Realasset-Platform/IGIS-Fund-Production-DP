import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("{selectedRrLead === '전체보기' ? '주관 부서' : selectedRrLead}' : selectedRrLead}", "{selectedRrLead === '전체보기' ? '주관 부서' : selectedRrLead}")

content = content.replace("{selectedRrCoop === '전체보기' ? '협업 부서' : selectedRrCoop}' : selectedRrCoop}", "{selectedRrCoop === '전체보기' ? '협업 부서' : selectedRrCoop}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed JSX syntax errors.")
