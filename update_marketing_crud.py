import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { supabase } from '../../utils/supabaseClient';\nimport { useAuth } from '../../context/AuthContext';"
)

# 2. Setup auth and states
old_states = """export default function WorkspaceMarketing() {
    const [projectShowAll, setProjectShowAll] = useState(false);
    const [pipelineShowAll, setPipelineShowAll] = useState(false);"""

new_states = """export default function WorkspaceMarketing() {
    const { memberInfo } = useAuth();
    const isAuthorized = ['김민지', '고아라', '전기영'].includes(memberInfo?.staff_name);
    
    const [tasks, setTasks] = useState([]);
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

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('iota_marketing_tasks')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setTasks(data || []);
        } catch (e) {
            console.error('Failed to fetch tasks:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRow = async () => {
        if (!newTask.task_name) return alert('Task 명을 입력해주세요.');
        try {
            const { error } = await supabase.from('iota_marketing_tasks').insert([newTask]);
            if (error) throw error;
            
            setNewTask({ task_name: '', company_name: '', related_asset: 'IOTA 공통', status: '아이데이션', priority: '중간', due_date: '', next_action: '' });
            setIsAdding(false);
            fetchTasks();
        } catch (e) {
            console.error('Failed to save task:', e);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteRow = async (id) => {
        if (!isAuthorized) return alert('삭제 권한이 없습니다.');
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            const { error } = await supabase.from('iota_marketing_tasks').delete().eq('id', id);
            if (error) throw error;
            fetchTasks();
        } catch (e) {
            console.error('Failed to delete task:', e);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    const handleAddClick = () => {
        if (!isAuthorized) {
            alert('등록 권한이 없습니다.');
            return;
        }
        setIsAdding(true);
    };"""

content = content.replace(old_states, new_states)

# 3. Modify "2. Task 관리" UI
old_task_ui = """            {/* 2. Task 관리 */}
            <div className="w-full mt-[30px] border-t border-[#3c3c3c] pt-[40px]"></div>
            <div className="flex justify-between items-end mb-[14px]">
                <h2 className="text-[18px] font-bold text-white tracking-tight">기업마케팅 주요 테스크 관리</h2>
            </div>
            <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] overflow-hidden mb-[40px]">
                <table className="w-full text-left">
                    <thead className="bg-[#222]">
                        <tr>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">Task 명</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">연결 기업</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">관련 자산</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">상태</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">마감일</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">다음 액션</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {visibleProjects.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#292928] transition-colors">
                                <td className="px-[20px] py-[16px] text-[15px] font-bold text-white">{row.name}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.company}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.asset}</td>
                                <td className="px-[20px] py-[16px]">
                                    <span className={`px-2 py-1 rounded text-[12px] font-bold border ${row.status === '제안 진행' ? 'bg-[#059669]/20 text-[#34d399] border-[#059669]/30' : row.status === '자료 준비' ? 'bg-[#d97706]/20 text-[#fbf167] border-[#d97706]/30' : 'bg-[#4b5563]/20 text-[#9ca3af] border-[#4b5563]/30'}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.dueDate}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#E5E5E5]">{parseNames(row.nextAction)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {projects.length > 5 && (
                    <div className="w-full border-t border-[#333] p-2 flex justify-center bg-[#222]">
                        <button 
                            onClick={() => setProjectShowAll(!projectShowAll)}
                            className="text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-colors px-4 py-2"
                        >
                            {projectShowAll ? '접기' : `더보기 (${projects.length - 5}개)`}
                        </button>
                    </div>
                )}
            </div>"""

# Fallback pattern match
import re
match = re.search(r"\{\/\* 2\. Task 관리 \*\/\}.*?\{\/\* 3\. Pipeline 관리 \*\/\}", content, re.DOTALL)

new_task_ui = """            {/* 2. Task 관리 */}
            <div className="w-full mt-[30px] border-t border-[#3c3c3c] pt-[40px]"></div>
            <div className="flex justify-between items-center mb-[14px]">
                <h2 className="text-[18px] font-bold text-white tracking-tight">기업마케팅 주요 테스크 관리</h2>
                <button 
                    onClick={handleAddClick}
                    className="px-[14px] py-[6px] bg-[#333] hover:bg-[#444] border border-[#444] text-[#E5E5E5] text-[13px] font-bold rounded-[8px] transition-colors"
                >
                    + Task 등록하기
                </button>
            </div>
            <div className="w-full bg-[#262626] border border-[#3c3c3c] rounded-[24px] overflow-hidden mb-[40px]">
                <table className="w-full text-left table-fixed">
                    <thead className="bg-[#1A1A1A]">
                        <tr>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[15%]">Task 명</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[12%]">연결 기업</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[12%]">관련 자산</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[10%]">상태</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[8%]">중요도</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[12%]">마감일</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[26%]">다음 액션 준비사항</th>
                            <th className="px-[16px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#3c3c3c] w-[5%]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3c3c3c]">
                        {isAdding && (
                            <tr className="bg-[#2A2A2A]">
                                <td className="px-[12px] py-[12px]">
                                    <input type="text" value={newTask.task_name} onChange={e => setNewTask({...newTask, task_name: e.target.value})} className="w-full bg-[#151515] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]" placeholder="Task 입력" />
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <input type="text" value={newTask.company_name} onChange={e => setNewTask({...newTask, company_name: e.target.value})} className="w-full bg-[#151515] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]" placeholder="기업명" />
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <select value={newTask.related_asset} onChange={e => setNewTask({...newTask, related_asset: e.target.value})} className="w-full bg-[#151515] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]">
                                        <option>IOTA 공통</option>
                                        <option>IOTA One (427)</option>
                                        <option>IOTA Two (816)</option>
                                        <option>서리풀</option>
                                        <option>타임워크 분당</option>
                                        <option>타임워크 신도림</option>
                                    </select>
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <select value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value})} className="w-full bg-[#151515] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]">
                                        {['아이데이션', '자료준비', '제안진행', '미팅후속', '협상', '보류', '완료'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <select value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})} className="w-full bg-[#151515] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]">
                                        <option>높음</option>
                                        <option>중간</option>
                                        <option>낮음</option>
                                    </select>
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} className="w-full bg-[#151515] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-[#A1A1AA] text-[13px] outline-none focus:border-[#888] [color-scheme:dark]" />
                                </td>
                                <td className="px-[12px] py-[12px]">
                                    <input type="text" value={newTask.next_action} onChange={e => setNewTask({...newTask, next_action: e.target.value})} className="w-full bg-[#151515] border border-[#444] rounded-[6px] px-[8px] py-[6px] text-white text-[13px] outline-none focus:border-[#888]" placeholder="액션 플랜 입력" />
                                </td>
                                <td className="px-[12px] py-[12px] text-center">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={handleSaveRow} className="text-[#34d399] hover:text-[#10b981] text-[12px] font-bold">저장</button>
                                        <button onClick={() => setIsAdding(false)} className="text-[#86868B] hover:text-white text-[12px]">취소</button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {isLoading ? (
                            <tr><td colSpan="8" className="text-center py-[40px] text-[#86868B]">데이터를 불러오는 중입니다...</td></tr>
                        ) : (
                            (projectShowAll ? tasks : tasks.slice(0, 5)).map((row) => (
                                <tr key={row.id} className="hover:bg-[#2A2A2A] transition-colors group">
                                    <td className="px-[16px] py-[16px] text-[14px] font-bold text-white leading-snug">{row.task_name}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA]">{row.company_name}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA]">{row.related_asset}</td>
                                    <td className="px-[16px] py-[16px]">
                                        <span className={`px-2 py-1 rounded text-[12px] font-bold border ${row.status === '제안진행' || row.status === '협상' ? 'bg-[#059669]/20 text-[#34d399] border-[#059669]/30' : row.status === '자료준비' || row.status === '아이데이션' ? 'bg-[#d97706]/20 text-[#fbf167] border-[#d97706]/30' : row.status === '완료' ? 'bg-[#2563eb]/20 text-[#60a5fa] border-[#2563eb]/30' : 'bg-[#4b5563]/20 text-[#9ca3af] border-[#4b5563]/30'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-[16px] py-[16px]">
                                        <span className={`text-[13px] font-bold ${row.priority === '높음' ? 'text-[#ef4444]' : row.priority === '중간' ? 'text-[#fbf167]' : 'text-[#86868B]'}`}>{row.priority}</span>
                                    </td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#A1A1AA] font-['Inter']">{row.due_date}</td>
                                    <td className="px-[16px] py-[16px] text-[13px] text-[#E5E5E5] leading-relaxed break-keep">{parseNames(row.next_action)}</td>
                                    <td className="px-[8px] py-[16px] text-center">
                                        <button onClick={() => handleDeleteRow(row.id)} className="text-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity hover:underline text-[12px] font-bold p-1">삭제</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {tasks.length > 5 && (
                    <div className="w-full border-t border-[#3c3c3c] p-2 flex justify-center bg-[#1A1A1A]">
                        <button 
                            onClick={() => setProjectShowAll(!projectShowAll)}
                            className="text-[13px] font-bold text-[#A1A1AA] hover:text-white transition-colors px-4 py-2"
                        >
                            {projectShowAll ? '접기' : `더보기 (${tasks.length - 5}개)`}
                        </button>
                    </div>
                )}
            </div>
            
            {/* 3. Pipeline 관리 */}"""

if match:
    content = content[:match.start()] + new_task_ui + content[match.end()-23:]

with open(path, 'w') as f:
    f.write(content)
print("Applied marketing CRUD changes.")
