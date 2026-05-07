import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Header: 마감일
old_header_date = '<th className="pl-[16px] pr-[22px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%] text-right">마감일</th>'
new_header_date = '<th className="pl-[40px] pr-[0px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%] text-center">마감일</th>'
content = content.replace(old_header_date, new_header_date)

# 2. Data Row: 마감일
old_data_date = '<td className="pl-[16px] pr-[22px] py-[16px] text-[13px] text-[#A1A1AA] font-[\'Inter\'] text-right">{row.due_date}</td>'
new_data_date = '<td className="pl-[40px] pr-[0px] py-[16px] text-[13px] text-[#A1A1AA] font-[\'Inter\'] text-center">{row.due_date}</td>'
content = content.replace(old_data_date, new_data_date)

with open(path, 'w') as f:
    f.write(content)

print("Applied date column adjustment.")
