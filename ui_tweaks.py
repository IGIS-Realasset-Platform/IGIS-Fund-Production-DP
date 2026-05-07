import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Divider margins
content = content.replace(
    '<div className="w-full mt-[30px] border-t border-[#3c3c3c] pt-[30px]">',
    '<div className="w-full mt-[20px] border-t border-[#3c3c3c] pt-[40px]">'
)

# 2. Remove "전체 대주" text title
content = content.replace(
    '<div className="text-[13px] font-bold text-[#86868B] mb-[12px]">전체 대주</div>\n',
    ''
)

# 3. Increase meta text size by 2px (11px -> 13px)
content = content.replace(
    '<div className="mt-[20px] text-[#666] text-[11px] font-[\'Inter\'] leading-[18px]">',
    '<div className="mt-[20px] text-[#666] text-[13px] font-[\'Inter\'] leading-[22px]">'
)

# 4. News box background color
content = content.replace(
    'className="w-full bg-[#151515] border border-[#333] rounded-[16px] p-[20px] flex flex-col hover:border-[#555] hover:bg-[#1a1a1a] transition-all group"',
    'className="w-full bg-[#1A1A1A] border border-[#333] rounded-[16px] p-[20px] flex flex-col hover:border-[#555] hover:bg-[#222] transition-all group"'
)

# 5. Month labels in Interest Timeline (1M -> 26-04)
# Current code:
# <span className="text-[12px] text-[#86868B] font-['Inter'] font-medium">{i+1}M</span>
# I will use a regex to replace the map function and the span
import re
chart_block_regex = r"\{\[\.\.\.Array\(12\)]\.map\(\(\_, i\) => \{.*?\n.*?return \("

# Actually, it's easier to just do a string replace for the span
# {i+1}M -> {`${26 + Math.floor((i + 3) / 12)}-${String(((i + 3) % 12) + 1).padStart(2, '0')}`}
old_span = """<span className="text-[12px] text-[#86868B] font-['Inter'] font-medium">{i+1}M</span>"""
new_span = """<span className="text-[12px] text-[#86868B] font-['Inter'] font-medium tracking-tighter">{`${26 + Math.floor((i + 3) / 12)}-${String(((i + 3) % 12) + 1).padStart(2, '0')}`}</span>"""
content = content.replace(old_span, new_span)

# 6. Delete 10px from the bottom area of the Interest Timeline box
# The user said "이 박스 하단 영역 10px 삭제". 
# The box is: <div className="w-full mb-[50px]"> ... </div>
# But wait, there is a `<div className="w-full h-[50px]"></div>` before "본 PF 계획(통합 PF)". No, there isn't. The margin comes from `mb-[50px]` on the Interest Timeline wrapper.
content = content.replace(
    '<div className="w-full mb-[50px]">\n                        <h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">월별 이자 발생 시계열</h2>',
    '<div className="w-full mb-[40px]">\n                        <h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">월별 이자 발생 시계열</h2>'
)

# Wait, if they mean the chart box's internal padding:
# <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[32px] h-[320px] relative overflow-hidden flex items-end justify-between px-[60px]">
# I will reduce its height by 10px (320px -> 310px) and bottom padding by 10px? 
# No, `p-[32px]` implies 32px everywhere. Let's just do `mb-[40px]` first for the wrapper, and see if it's right.
# Actually, I'll change the bottom padding of the chart if `mb-[40px]` doesn't hit it. I'll change both slightly.
content = content.replace(
    '<div className="w-full mb-[50px]">\n                        <h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">본 PF 계획(통합 PF)</h2>',
    '<div className="w-full mb-[40px]">\n                        <h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">본 PF 계획(통합 PF)</h2>'
)

with open(path, 'w') as f:
    f.write(content)
print("Applied UI tweaks.")
