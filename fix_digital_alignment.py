import re

file_path = "src/components/system/workspace/WorkspaceDigital.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update the slice logic
slice_target = "(projectShowAll ? sortedTasks : sortedTasks.slice(0, 5)).map((row, index) => ("
slice_replacement = "(projectShowAll ? sortedTasks : sortedTasks.slice(0, selectedTheme ? 5 : 10)).map((row, index) => ("
content = content.replace(slice_target, slice_replacement)

# 2. Add pr-[118px] to header
header_target = """            {/* 2. 주요 테스크 관리 */}
            <div className="flex justify-between items-center mt-[20px] mb-[10px]">"""
header_replacement = """            {/* 2. 주요 테스크 관리 */}
            <div className="flex justify-between items-center mt-[20px] mb-[10px] pr-[118px]">"""
content = content.replace(header_target, header_replacement)

# 3. Add pr-[118px] to task container
list_target = """            <motion.div layout className="w-full flex flex-col gap-[16px] mb-[40px]">"""
list_replacement = """            <motion.div layout className="w-full flex flex-col gap-[16px] mb-[40px] pr-[118px]">"""
content = content.replace(list_target, list_replacement)

with open(file_path, "w") as f:
    f.write(content)
