import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Update header widths and remove 8th column
old_headers = """                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[24%] text-left">다음 액션 준비사항</th>
                            <th className="pl-[16px] pr-[22px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[10%] text-right whitespace-nowrap">마감일</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[5%]"></th>"""

new_headers = """                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[29%] text-left">다음 액션 준비사항</th>
                            <th className="pl-[16px] pr-[22px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[10%] text-right whitespace-nowrap">마감일</th>"""

content = content.replace(old_headers, new_headers)

# 2. Update isAdding row
old_isadding = """                                <td className="pl-[12px] pr-[18px] py-[12px]">
                                    <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-[#A1A1AA] text-[13px] outline-none focus:border-[#888] [color-scheme:dark]" />
                                </td>
                                <td className="px-[12px] py-[12px] text-center">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={handleSaveRow} className="text-[#34d399] hover:text-[#10b981] text-[12px] font-bold">저장</button>
                                        <button onClick={() => { setIsAdding(false); setCompanyQuery(''); }} className="text-[#86868B] hover:text-white text-[12px]">취소</button>
                                    </div>
                                </td>"""

new_isadding = """                                <td className="pl-[12px] pr-[18px] py-[12px] relative">
                                    <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-[#A1A1AA] text-[13px] outline-none focus:border-[#888] [color-scheme:dark]" />
                                    <div className="absolute right-[-45px] top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center">
                                        <button onClick={handleSaveRow} className="text-[#34d399] hover:text-[#10b981] text-[12px] font-bold">저장</button>
                                        <button onClick={() => { setIsAdding(false); setCompanyQuery(''); }} className="text-[#86868B] hover:text-white text-[12px]">취소</button>
                                    </div>
                                </td>"""
content = content.replace(old_isadding, new_isadding)

# 3. Update normal row
old_normal_row = """                                    <td className="pl-[16px] pr-[22px] py-[16px] text-[13px] text-[#A1A1AA] font-['Inter'] text-right whitespace-nowrap">{row.due_date}</td>
                                    <td className="px-[8px] py-[16px] text-center">
                                        <button onClick={() => handleDeleteRow(row.id)} className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity hover:underline text-[12px] font-bold p-1">삭제</button>
                                    </td>"""

new_normal_row = """                                    <td className="pl-[16px] pr-[22px] py-[16px] text-[13px] text-[#A1A1AA] font-['Inter'] text-right whitespace-nowrap relative">
                                        {row.due_date}
                                        <div className="absolute right-[-45px] top-1/2 -translate-y-1/2">
                                            <button onClick={() => handleDeleteRow(row.id)} className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity hover:underline text-[12px] font-bold px-2 py-1">삭제</button>
                                        </div>
                                    </td>"""

content = content.replace(old_normal_row, new_normal_row)

with open(path, 'w') as f:
    f.write(content)

print("Fixed marketing table structure!")
