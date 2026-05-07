import sys

path = 'src/components/system/workspace/WorkspaceDevelopment.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Physical KPIs
content = content.replace(
    '<span className="text-[13px] font-medium text-[#86868B] mb-[8px]">{item[0]}</span>',
    '<span className="text-[15px] font-medium text-[#86868B] mb-[8px]">{item[0]}</span>'
)
content = content.replace(
    '{item[2] && <span className="text-[13px] text-[#A1A1AA]">{item[2]}</span>}',
    '{item[2] && <span className="text-[15px] text-[#A1A1AA]">{item[2]}</span>}'
)

# 2. Architecture
content = content.replace(
    '<span className="text-[13px] font-medium text-[#86868B] mb-[8px]">{spec[0]}</span>',
    '<span className="text-[14px] font-medium text-[#86868B] mb-[8px]">{spec[0]}</span>'
)

# 3. R&R
content = content.replace(
    '<span className="text-[13px] text-[#A1A1AA] leading-snug">{item.issue}</span>',
    '<span className="text-[14px] text-[#A1A1AA] leading-snug">{item.issue}</span>'
)
content = content.replace(
    '<span className="text-[13px] text-[#A1A1AA] leading-snug">{item.next}</span>',
    '<span className="text-[14px] text-[#A1A1AA] leading-snug">{item.next}</span>'
)

# 4. Counterparty
content = content.replace(
    '<span className="text-[14px] text-[#A1A1AA] leading-snug break-keep">{item.point}</span>',
    '<span className="text-[15px] text-[#A1A1AA] leading-snug break-keep">{item.point}</span>'
)
content = content.replace(
    '<span className="text-[14px] text-[#A1A1AA] leading-snug break-keep">{item.action}</span>',
    '<span className="text-[15px] text-[#A1A1AA] leading-snug break-keep">{item.action}</span>'
)

with open(path, 'w') as f:
    f.write(content)
print("Typography updated")
