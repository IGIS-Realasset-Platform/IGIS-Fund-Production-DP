import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Header: 마감일
old_header_date = '<th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%] text-center">마감일</th>'
new_header_date = '<th className="pl-[16px] pr-[22px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%] text-right">마감일</th>'
content = content.replace(old_header_date, new_header_date)

# 2. Data Row: 마감일
old_data_date = '<td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA] font-[\'Inter\'] text-center">{row.due_date}</td>'
new_data_date = '<td className="pl-[16px] pr-[22px] py-[16px] text-[13px] text-[#A1A1AA] font-[\'Inter\'] text-right">{row.due_date}</td>'
content = content.replace(old_data_date, new_data_date)

# 3. Data Row: 연결기업
old_data_company = '<td className="px-[16px] py-[16px] text-[14px] text-white text-center">{row.company_name}</td>'
new_data_company = '<td className="px-[16px] py-[16px] text-[15px] font-bold text-white text-center">{row.company_name}</td>'
content = content.replace(old_data_company, new_data_company)

# 4. Data Row: 다음액션준비사항
old_data_action = '<td className="px-[16px] py-[16px] text-[13px] text-[#E5E5E5] leading-relaxed break-keep text-left">{parseNames(row.next_action)}</td>'
new_data_action = '<td className="px-[16px] py-[16px] text-[14px] text-[#bbb9af] leading-relaxed break-keep text-left">{parseNames(row.next_action)}</td>'
content = content.replace(old_data_action, new_data_action)

# 5. Input Row: 마감일
old_input_date = '<td className="px-[12px] py-[12px]">\n                                    <input type="date"'
new_input_date = '<td className="pl-[12px] pr-[18px] py-[12px]">\n                                    <input type="date"'
content = content.replace(old_input_date, new_input_date)


with open(path, 'w') as f:
    f.write(content)

print("Applied minor UI updates.")
