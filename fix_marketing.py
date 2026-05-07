import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Remove "주간 플래닝 보드"
import re
# From `{/* 1. 주간 플래닝 칸반 */}` up to `{/* 2. Task 관리 */}`
pattern = r"\{/\* 1\. 주간 플래닝 칸반 \*/\}.*?(?=\{/\* 2\. Task 관리 \*/\})"
content = re.sub(pattern, "", content, flags=re.DOTALL)

# 2. Update Task 관리 title, margin, and add divider
old_task = """            {/* 2. Task 관리 */}
            <div className="flex justify-between items-end mb-[24px]">
                <h2 className="text-[18px] font-bold text-white">Task 관리</h2>"""

new_task = """            {/* 2. Task 관리 */}
            <div className="w-full mt-[30px] border-t border-[#3c3c3c] pt-[40px]"></div>
            <div className="flex justify-between items-end mb-[14px]">
                <h2 className="text-[18px] font-bold text-white tracking-tight">기업마케팅 주요 테스크 관리</h2>"""

content = content.replace(old_task, new_task)

with open(path, 'w') as f:
    f.write(content)
print("Updated WorkspaceMarketing.jsx")
