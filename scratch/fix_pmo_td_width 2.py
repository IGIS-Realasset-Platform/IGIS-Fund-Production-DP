import sys

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the td class width for the Project column. It was still at 80px!
content = content.replace(
    'td className={`text-center font-bold text-[#E5E5E5] w-[80px] min-w-[80px] max-w-[80px]',
    'td className={`text-center font-bold text-[#E5E5E5] w-[58px] min-w-[58px] max-w-[58px]'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed td width for Project column to 58px.")
