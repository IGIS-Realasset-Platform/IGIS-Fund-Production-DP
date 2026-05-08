import re

file_path = "src/components/system/workspace/WorkspaceMarketing.jsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add pr-[118px] to header
header_target = """            <div className="flex justify-between items-center mb-[10px]">"""
header_replacement = """            <div className="flex justify-between items-center mb-[10px] pr-[118px]">"""
content = content.replace(header_target, header_replacement)

# 2. Add pr-[118px] to task container
list_target = """            <div className="w-full flex flex-col gap-[16px] mb-[40px]">"""
list_replacement = """            <div className="w-full flex flex-col gap-[16px] mb-[40px] pr-[118px]">"""
content = content.replace(list_target, list_replacement)

with open(file_path, "w") as f:
    f.write(content)
