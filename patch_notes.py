import os
import re

files = [
    'WorkspacePm.jsx',
    'WorkspaceDevelopment.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceIpr.jsx'
]

base_path = 'src/components/system/workspace'

for filename in files:
    filepath = os.path.join(base_path, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Initial State & Resets: replace `next_action: '' }` with `next_action: '', notes: '' }`
    content = content.replace("next_action: '' }", "next_action: '', notes: '' }")
    # For Marketing which might have missing space or different things:
    content = content.replace("next_action: ''}", "next_action: '', notes: ''}")
    content = content.replace("next_action: ''\n        })", "next_action: '',\n            notes: ''\n        })")
    
    # 2. handleEditRow
    content = content.replace("next_action: row.next_action || ''\n        });", "next_action: row.next_action || '',\n            notes: row.notes || ''\n        });")

    # 3. Add input for notes after next_action input
    # Usually next_action input looks like:
    # <input \n type="text" \n value={newTask.next_action} \n onChange={e => setNewTask({...newTask, next_action: e.target.value})} \n className="w-full bg-[#1A1A1A] border border-[#444] rounded-[12px] px-4 py-3 text-white text-[15px] outline-none focus:border-[#888]" \n placeholder="다음 액션 준비사항 입력" \n />
    # I'll use regex to find the next_action input
    
    next_action_pattern = re.compile(
        r'(<input[^>]*value=\{newTask\.next_action\}[^>]*placeholder="다음 액션 준비사항 입력"[^>]*/>)'
    )
    
    notes_input = """\\1
                        <input 
                            type="text" 
                            value={newTask.notes || ''} 
                            onChange={e => setNewTask({...newTask, notes: e.target.value})} 
                            className="w-full bg-[#1A1A1A] border border-[#444] rounded-[12px] px-4 py-3 text-[#A1A1AA] text-[14px] outline-none focus:border-[#888]" 
                            placeholder="비고 / 링크 입력 (선택사항)" 
                        />"""
    content = next_action_pattern.sub(notes_input, content)

    # 4. Add notes display in expanded view
    # Expanded view usually ends with:
    #                 </div>
    #             </div>
    #         </motion.div>
    # We will look for `<!-- Add notes here if needed -->` or we can find `</div>\n                            </motion.div>`
    # Wait, the expanded view usually has: `<div className="flex justify-start items-center gap-12"> ... </div>` inside the expanded div.
    # We can inject after `<div className="flex items-center gap-3">\n                                        <span className="text-[13px] font-bold text-[#86868B]">마감일</span>\n                                        <span className="text-[16px] text-[#A1A1AA] font-['Inter'] font-medium">{row.due_date}</span>\n                                    </div>\n                                </div>`
    
    display_pattern = re.compile(
        r'(<span className="text-\[16px\] text-\[#A1A1AA\] font-\[\'Inter\'\] font-medium">\{row\.due_date\}</span>\s*</div>\s*</div>)'
    )
    
    notes_display = """\\1
                                {row.notes && (
                                <div className="flex items-start gap-4 mt-4 pt-4 border-t border-[#3c3c3c]/50">
                                    <span className="text-[13px] font-bold text-[#86868B] shrink-0 mt-[2px]">비고/링크</span>
                                    <span className="text-[14px] text-white font-medium break-all">
                                        {row.notes.startsWith('http') ? <a href={row.notes} target="_blank" rel="noreferrer" className="text-[#2997ff] hover:underline">{row.notes}</a> : row.notes}
                                    </span>
                                </div>
                                )}"""
    
    content = display_pattern.sub(notes_display, content)

    with open(filepath, 'w') as f:
        f.write(content)

# And now fix WorkspaceDigital.jsx setCompanyQuery issue!
digital_path = os.path.join(base_path, 'WorkspaceDigital.jsx')
with open(digital_path, 'r') as f:
    digital_content = f.read()

digital_content = digital_content.replace("        setCompanyQuery(row.company_name || '');\n", "")

with open(digital_path, 'w') as f:
    f.write(digital_content)

