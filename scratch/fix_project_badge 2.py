import sys
import re

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix the project badge which was missed because it used inline-block instead of inline-flex.
# Old: <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border inline-block max-w-full truncate ${
# New: <span className={`px-1.5 h-[22px] py-0 rounded-[6px] text-[11px] font-bold border inline-flex items-center justify-center max-w-full truncate align-middle ${

content = content.replace(
    'className={`px-1.5 py-0.5 rounded text-[11px] font-bold border inline-block max-w-full truncate ${',
    'className={`px-1.5 h-[22px] py-0 rounded-[6px] text-[11px] font-bold border inline-flex items-center justify-center max-w-full truncate align-middle ${'
)

# 2. Add align-middle to all other badges that have h-[22px] to ensure they are perfectly vertically centered relative to text in other columns.
# We'll just replace 'h-[22px] py-0' with 'h-[22px] py-0 align-middle' where it isn't already there.
content = content.replace('h-[22px] py-0', 'h-[22px] py-0 align-middle')
# Deduplicate just in case
content = content.replace('h-[22px] py-0 align-middle align-middle', 'h-[22px] py-0 align-middle')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed project badge alignment and height, and added align-middle to all badges.")
