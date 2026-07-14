import sys

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Project column width: 80px -> 64px
content = content.replace('w-[80px] min-w-[80px] max-w-[80px] sticky left-[50px]', 'w-[64px] min-w-[64px] max-w-[64px] sticky left-[50px]')

# 2. Update subsequent sticky positions (-16px)
content = content.replace('sticky left-[130px]', 'sticky left-[114px]')
content = content.replace('left-[201px]', 'left-[185px]')
content = content.replace('left-[291px]', 'left-[275px]')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Project column width reduced to 64px and sticky positions adjusted in PmoTaskBoardStaging.jsx")
