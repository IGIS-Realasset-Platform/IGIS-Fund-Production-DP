import sys
import re

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Swap headers (마감일 and 다음 액션 준비사항) & center alignments & text changes
old_headers = """                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[23%]">Task 명</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%]">연결 기업</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%]">관련 자산</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[9%]">상태</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[7%]">중요도</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%]">마감일</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[23%]">다음 액션 준비사항</th>"""

new_headers = """                            <th className="pl-[22px] pr-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[23%] text-left">Task 명</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%] text-center">연결기업</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%] text-center">관련 자산</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[9%] text-center">상태</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[7%] text-center">중요도</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[23%] text-left">다음 액션 준비사항</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[11%] text-center">마감일</th>"""
content = content.replace(old_headers, new_headers)

# 2. Swap inputs in `isAdding` block
# The `isAdding` block has 7 <td> elements for inputs + 1 for buttons.
# We need to swap the 6th (due_date) and 7th (next_action) tds.
old_isadding = """                                <td className="px-[12px] py-[12px]">
                                    <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-[#A1A1AA] text-[13px] outline-none focus:border-[#888] [color-scheme:dark]" />
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <input type="text" value={newTask.next_action} onChange={e => setNewTask({...newTask, next_action: e.target.value})} className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]" placeholder="액션 플랜 입력" />
                                </td>"""

new_isadding = """                                <td className="px-[12px] py-[12px]">
                                    <input type="text" value={newTask.next_action} onChange={e => setNewTask({...newTask, next_action: e.target.value})} className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]" placeholder="액션 플랜 입력" />
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-[#A1A1AA] text-[13px] outline-none focus:border-[#888] [color-scheme:dark]" />
                                </td>"""
content = content.replace(old_isadding, new_isadding)

# Update first td in isAdding to have left padding matching the header
content = content.replace('<td className="px-[12px] py-[12px]">\n                                    <input type="text" value={newTask.task_name}', '<td className="pl-[18px] pr-[12px] py-[12px]">\n                                    <input type="text" value={newTask.task_name}')


# 3. Swap and format rows in tbody
old_tbody_row = """                                    <td className="px-[16px] py-[16px] text-[14px] font-bold text-white leading-snug">{row.task_name}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA]">{row.company_name}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA]">{row.related_asset}</td>
                                    <td className="px-[16px] py-[16px]">
                                        <span className={`px-2 py-1 rounded text-[12px] font-bold border ${row.status === '제안진행' || row.status === '협상' ? 'bg-[#059669]/20 text-[#34d399] border-[#059669]/30' : row.status === '자료준비' || row.status === '아이데이션' ? 'bg-[#d97706]/20 text-[#fbf167] border-[#d97706]/30' : row.status === '완료' ? 'bg-[#2563eb]/20 text-[#60a5fa] border-[#2563eb]/30' : 'bg-[#4b5563]/20 text-[#9ca3af] border-[#4b5563]/30'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-[16px] py-[16px]">
                                        <span className={`text-[13px] font-bold ${row.priority === '높음' ? 'text-[#ef4444]' : row.priority === '중간' ? 'text-[#3b82f6]' : 'text-[#10b981]'}`}>{row.priority}</span>
                                    </td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA] font-['Inter']">{row.due_date}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#E5E5E5] leading-relaxed break-keep">{parseNames(row.next_action)}</td>"""

new_tbody_row = """                                    <td className="pl-[22px] pr-[16px] py-[16px] text-[15px] font-bold text-white leading-snug text-left">{row.task_name}</td>
                                    <td className="px-[16px] py-[16px] text-[14px] text-white text-center">{row.company_name}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA] text-center">{row.related_asset}</td>
                                    <td className="px-[16px] py-[16px] text-center">
                                        <span className={`px-2 py-1 rounded text-[12px] font-bold border ${row.status === '제안진행' || row.status === '협상' ? 'bg-[#059669]/20 text-[#34d399] border-[#059669]/30' : row.status === '자료준비' || row.status === '아이데이션' ? 'bg-[#d97706]/20 text-[#fbf167] border-[#d97706]/30' : row.status === '완료' ? 'bg-[#2563eb]/20 text-[#60a5fa] border-[#2563eb]/30' : 'bg-[#4b5563]/20 text-[#9ca3af] border-[#4b5563]/30'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-[16px] py-[16px] text-center">
                                        <span className={`text-[13px] font-bold ${row.priority === '높음' ? 'text-[#ef4444]' : row.priority === '중간' ? 'text-[#3b82f6]' : 'text-[#10b981]'}`}>{row.priority}</span>
                                    </td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#E5E5E5] leading-relaxed break-keep text-left">{parseNames(row.next_action)}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA] font-['Inter'] text-center">{row.due_date}</td>"""

content = content.replace(old_tbody_row, new_tbody_row)

with open(path, 'w') as f:
    f.write(content)

print("Applied UI updates.")
