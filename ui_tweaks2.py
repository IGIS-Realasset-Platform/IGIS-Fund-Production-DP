import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. 월별 이자 발생 시계열 위로 6px 이동
# Find the spacer: `<div className="w-full h-[50px]"></div>`
content = content.replace('<div className="w-full h-[50px]"></div>', '<div className="w-full h-[44px]"></div>')

# 2. 통합 Vehicle 파이낸싱 구조 아래로 6px 이동
# Find `<div className="w-full mt-[20px] border-t border-[#3c3c3c] pt-[40px]">`
# I'll change mt-[20px] to mt-[26px] to push the whole block down.
content = content.replace(
    '<div className="w-full mt-[20px] border-t border-[#3c3c3c] pt-[40px]">',
    '<div className="w-full mt-[26px] border-t border-[#3c3c3c] pt-[40px]">'
)

with open(path, 'w') as f:
    f.write(content)
print("Applied 6px tweaks.")
