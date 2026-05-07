import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

old_isadding_buttons = """                                    <div className="absolute right-[-45px] top-1/2 -translate-y-1/2 flex flex-col gap-1 items-center">
                                        <button onClick={handleSaveRow} className="text-[#34d399] hover:text-[#10b981] text-[12px] font-bold">저장</button>
                                        <button onClick={() => { setIsAdding(false); setCompanyQuery(''); }} className="text-[#86868B] hover:text-white text-[12px]">취소</button>
                                    </div>"""

new_isadding_buttons = """                                    <div className="absolute right-[-66px] top-1/2 -translate-y-1/2 flex flex-col gap-[6px]">
                                        <button onClick={handleSaveRow} className="flex items-center justify-center w-[54px] py-[6px] bg-[#059669]/20 text-[#34d399] border border-[#059669]/30 rounded-[6px] text-[12px] font-bold hover:bg-[#059669]/40 transition-colors">저장</button>
                                        <button onClick={() => { setIsAdding(false); setCompanyQuery(''); }} className="flex items-center justify-center w-[54px] py-[6px] bg-[#3c3c3c]/50 text-[#86868B] border border-[#444] rounded-[6px] text-[12px] font-bold hover:bg-[#3c3c3c] hover:text-white transition-colors">취소</button>
                                    </div>"""
content = content.replace(old_isadding_buttons, new_isadding_buttons)

old_normal_buttons = """                                        <div className="absolute right-[-45px] top-1/2 -translate-y-1/2">
                                            <button onClick={() => handleDeleteRow(row.id)} className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity hover:underline text-[12px] font-bold px-2 py-1">삭제</button>
                                        </div>"""

new_normal_buttons = """                                        <div className="absolute right-[-66px] top-1/2 -translate-y-1/2">
                                            <button onClick={() => handleDeleteRow(row.id)} className="flex items-center justify-center w-[54px] py-[6px] bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 rounded-[6px] text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ef4444]/20">삭제</button>
                                        </div>"""
content = content.replace(old_normal_buttons, new_normal_buttons)

with open(path, 'w') as f:
    f.write(content)

print("Fixed buttons styling!")
