import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update speech bubble positions
content = content.replace("const x = 952.5;", "const x = 943.5;")
content = content.replace("const x = 1027.5;", "const x = 1020.5;")

# 2. Update 구분 width from 80 to 88
content = content.replace("w-[80px] min-w-[80px] max-w-[80px]", "w-[88px] min-w-[88px] max-w-[88px]")
# There's also <th className="px-1 w-[80px] text-center bg-[#272726] rounded-tl-[31px]">구분</th>
content = re.sub(r'th className="([^"]*)w-\[80px\]([^"]*)"([^>]*)>구분<', r'th className="\1w-[88px]\2"\3>구분<', content)

# 3. Update 세부업무 width from 290 to 262
content = content.replace("w-[290px] min-w-[290px] max-w-[290px]", "w-[262px] min-w-[262px] max-w-[262px]")
content = re.sub(r'th className="([^"]*)w-\[290px\]([^"]*)"([^>]*)>세부업무<', r'th className="\1w-[262px]\2"\3>세부업무<', content)

# 4. Update calendar columns width from 75 to 77
content = content.replace("w-[75px] min-w-[75px] max-w-[75px]", "w-[77px] min-w-[77px] max-w-[77px]")
# In the thead:
content = re.sub(r'w-\[75px\]([^>]*) \$\{borderClass\}', r'w-[77px]\1 ${borderClass}', content)

# 5. Remove far right vertical border
# In thead:
thead_col_old = """                                        const borderClass = col.highlight
                                            ? 'bg-white/[0.03] text-[#60a5fa] border-r border-[#4c4c4c]/50'
                                            : 'text-[#86868B] border-r border-[#4c4c4c]/50';"""
thead_col_new = """                                        const borderClass = col.highlight
                                            ? `bg-white/[0.03] text-[#60a5fa] ${isLast ? '' : 'border-r border-[#4c4c4c]/50'}`
                                            : `text-[#86868B] ${isLast ? '' : 'border-r border-[#4c4c4c]/50'}`;"""
content = content.replace(thead_col_old, thead_col_new)

# In tbody:
tbody_col_old = "const borderClass = 'border-r border-[#4c4c4c]/40';"
tbody_col_new = "const borderClass = isLastCol ? '' : 'border-r border-[#4c4c4c]/40';"
content = content.replace(tbody_col_old, tbody_col_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Adjustments applied successfully!")
