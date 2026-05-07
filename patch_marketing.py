import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. State and logic injection
old_states = """    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({
        task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '아이데이션', priority: '중간', due_date: '', next_action: ''
    });

    const [projectShowAll, setProjectShowAll] = useState(false);
    const [pipelineShowAll, setPipelineShowAll] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {"""

new_states = """    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newTask, setNewTask] = useState({
        task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '아이데이션', priority: '중간', due_date: '', next_action: ''
    });

    const [projectShowAll, setProjectShowAll] = useState(false);
    const [pipelineShowAll, setPipelineShowAll] = useState(false);

    // Stakeholder States
    const [masterStakeholders, setMasterStakeholders] = useState([]);
    const [companyQuery, setCompanyQuery] = useState('');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
    const [showNewStakeholderModal, setShowNewStakeholderModal] = useState(false);

    useEffect(() => {
        fetchTasks();
        fetchMasterStakeholders();
    }, []);

    const fetchMasterStakeholders = async () => {
        try {
            const { data, error } = await supabase.from('iota_stakeholder_master').select('*');
            if (!error && data) {
                setMasterStakeholders(data);
            }
        } catch (e) {
            console.error('Master stakeholder fetch error:', e);
        }
    };
    
    const registerMasterStakeholder = async () => {
        try {
            const { error } = await supabase.from('iota_stakeholder_master').insert({
                company_name: companyQuery
            });
            if (!error) {
                await fetchMasterStakeholders();
                setShowNewStakeholderModal(false);
            } else {
                alert('이해관계자 등록 중 오류가 발생했습니다.');
            }
        } catch (e) {
            alert('연결 오류');
        }
    };

    const uniqueCompanies = [...new Set(masterStakeholders.map(s => s.company_name).filter(Boolean))];
    const filteredCompanies = uniqueCompanies.filter(c => c.toLowerCase().includes(companyQuery.toLowerCase()));

    const fetchTasks = async () => {"""

content = content.replace(old_states, new_states)

# 2. Company Name Input
old_company_input = """<input type="text" value={newTask.company_name} onChange={e => setNewTask({...newTask, company_name: e.target.value})} className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]" placeholder="기업명" />"""
new_company_input = """<div className="relative">
                                        <input 
                                            type="text" 
                                            value={companyQuery} 
                                            onChange={e => {
                                                setCompanyQuery(e.target.value);
                                                setShowCompanyDropdown(true);
                                                setNewTask({...newTask, company_name: e.target.value});
                                            }}
                                            onFocus={() => setShowCompanyDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
                                            className="w-full bg-[#272726] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]" 
                                            placeholder="기업명 검색" 
                                        />
                                        {showCompanyDropdown && companyQuery && (
                                            <div className="absolute top-full left-0 mt-1 w-full max-h-[150px] overflow-y-auto bg-[#2A2A2A] border border-[#444] rounded-[6px] z-50 shadow-xl">
                                                {filteredCompanies.length > 0 ? (
                                                    filteredCompanies.map((c, i) => (
                                                        <div 
                                                            key={i} 
                                                            className="px-3 py-2 text-[13px] text-white hover:bg-[#3b82f6] cursor-pointer"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setCompanyQuery(c);
                                                                setNewTask({...newTask, company_name: c});
                                                                setShowCompanyDropdown(false);
                                                            }}
                                                        >
                                                            {c}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2">
                                                        <span className="text-[#A1A1AA] text-[12px] block mb-2">검색 결과가 없습니다.</span>
                                                        <button 
                                                            type="button"
                                                            onMouseDown={(e) => { e.preventDefault(); setShowNewStakeholderModal(true); setShowCompanyDropdown(false); }}
                                                            className="w-full px-2 py-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[12px] rounded-[4px] transition-colors"
                                                        >
                                                            + 신규 등록
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>"""
content = content.replace(old_company_input, new_company_input)

# 3. Handle save row to clear companyQuery
old_save_row = """            setNewTask({ task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '아이데이션', priority: '중간', due_date: '', next_action: '' });
            setIsAdding(false);"""
new_save_row = """            setNewTask({ task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '아이데이션', priority: '중간', due_date: '', next_action: '' });
            setCompanyQuery('');
            setIsAdding(false);"""
content = content.replace(old_save_row, new_save_row)

# Handle cancel row to clear companyQuery
old_cancel_row = """<button onClick={() => setIsAdding(false)} className="text-[#86868B] hover:text-white text-[12px]">취소</button>"""
new_cancel_row = """<button onClick={() => { setIsAdding(false); setCompanyQuery(''); }} className="text-[#86868B] hover:text-white text-[12px]">취소</button>"""
content = content.replace(old_cancel_row, new_cancel_row)

# 4. Related asset options
old_options = """                                        <option>IOTA 공통</option>
                                        <option>IOTA One (427)</option>
                                        <option>IOTA Two (816)</option>
                                        <option>서리풀</option>
                                        <option>타임워크 분당</option>
                                        <option>타임워크 신도림</option>"""
new_options = """                                        <option>IOTA 공통</option>
                                        <option>IOTA 427</option>
                                        <option>IOTA 816</option>"""
content = content.replace(old_options, new_options)

# 5. Priority colors
old_priority_color = """<span className={`text-[13px] font-bold ${row.priority === '높음' ? 'text-[#ef4444]' : row.priority === '중간' ? 'text-[#fbf167]' : 'text-[#86868B]'}`}>{row.priority}</span>"""
new_priority_color = """<span className={`text-[13px] font-bold ${row.priority === '높음' ? 'text-[#ef4444]' : row.priority === '중간' ? 'text-[#3b82f6]' : 'text-[#10b981]'}`}>{row.priority}</span>"""
content = content.replace(old_priority_color, new_priority_color)

# 6. Add modal at the end
modal_html = """            {/* Pipeline 관리 하단 */}
            {showNewStakeholderModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-[16px] w-[400px] shadow-2xl p-[24px]">
                        <h3 className="text-white font-bold text-[16px] mb-[16px]">신규 이해관계자 등록</h3>
                        <p className="text-[#A1A1AA] text-[13px] mb-[20px]">입력하신 "{companyQuery}" 기업을 DB에 등록하시겠습니까?</p>
                        <div className="flex gap-[10px] justify-end">
                            <button onClick={() => setShowNewStakeholderModal(false)} className="px-[16px] py-[8px] rounded-[8px] bg-[#333] text-white text-[13px] font-bold">취소</button>
                            <button onClick={registerMasterStakeholder} className="px-[16px] py-[8px] rounded-[8px] bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[13px] font-bold">등록하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}"""
content = content.replace("""        </div>
    );
}""", modal_html)

with open(path, 'w') as f:
    f.write(content)
print("Updated marketing file with complex UI logic.")
