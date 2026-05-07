import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. 저장 button
content = content.replace(
    'hover:bg-[#059669]/40 transition-colors">저장',
    'hover:bg-[#059669]/40 transition-colors cursor-pointer">저장'
)

# 2. 취소 button
content = content.replace(
    'hover:text-white transition-colors">취소',
    'hover:text-white transition-colors cursor-pointer">취소'
)

# 3. 삭제 button
content = content.replace(
    'hover:bg-[#ef4444]/20">삭제',
    'hover:bg-[#ef4444]/20 cursor-pointer">삭제'
)

# 4. Task 등록하기 button
content = content.replace(
    'rounded-[8px] transition-colors">+ Task 등록하기',
    'rounded-[8px] transition-colors cursor-pointer">+ Task 등록하기'
)

# 5. Pipeline 관리 테이블 더보기 버튼 등등 (if exists, let's search and add if needed, but the user is complaining right after my button styling update).
content = content.replace(
    'className="text-[13px] text-[#A1A1AA] hover:text-white transition-colors font-bold px-4 py-2 border border-[#333] hover:bg-[#333] rounded-[8px]">',
    'className="text-[13px] text-[#A1A1AA] hover:text-white transition-colors font-bold px-4 py-2 border border-[#333] hover:bg-[#333] rounded-[8px] cursor-pointer">'
)


with open(path, 'w') as f:
    f.write(content)

print("Added cursor-pointer to buttons.")
