import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MOBILE_WORKSPACES, getInitialWorkspace } from './mobileIotaData';

export default function MobileTaskList({ memberInfo }) {
    const [workspace, setWorkspace] = useState(() => getInitialWorkspace(memberInfo));
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [iotaOnly, setIotaOnly] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [workspace, iotaOnly]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from(workspace.taskTable)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) throw error;

            let result = data || [];
            if (iotaOnly) {
                const keywords = ['iota', '이오타', '427', '816', '421', '공통'];
                result = result.filter(t => {
                    if (!t.related_asset) return false;
                    const asset = t.related_asset.toLowerCase();
                    return keywords.some(k => asset.includes(k));
                });
            }
            
            setTasks(result);
        } catch (err) {
            console.error("Failed to fetch mobile tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '마감일 없음';
        try {
            const d = new Date(dateString);
            return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case '완료': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case '진행중': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case '보류': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-300 bg-gray-500/10 border-gray-500/20'; // 아이데이션, 검토중 등
        }
    };

    return (
        <div className="flex flex-col w-full min-h-full pb-24 px-4 pt-4 relative">
            {/* Header / Workspace Selector */}
            <div className="flex items-center justify-between mb-4 relative z-20">
                <div className="relative">
                    <button 
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 text-[20px] font-bold text-white bg-transparent outline-none"
                    >
                        {workspace.label}
                        <svg className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                            <div className="absolute top-full left-0 mt-2 w-[200px] bg-[#242423] border border-[#3A3A39] rounded-xl shadow-xl z-20 py-2 overflow-hidden">
                                {MOBILE_WORKSPACES.map(w => (
                                    <button 
                                        key={w.code}
                                        onClick={() => { setWorkspace(w); setDropdownOpen(false); setIotaOnly(false); }}
                                        className={`w-full text-left px-4 py-3 text-[15px] font-medium transition-colors ${workspace.code === w.code ? 'text-[#4C82FF] bg-[#4C82FF]/10' : 'text-[#F4F4F1] hover:bg-[#20201F]'}`}
                                    >
                                        {w.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {(workspace.code === 'WS_EMC' || workspace.code === 'WS_SSC') && (
                    <label className="flex items-center gap-2 text-[13px] text-[#A1A1AA] font-medium cursor-pointer">
                        <span>이오타만 보기</span>
                        <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${iotaOnly ? 'bg-[#4C82FF]' : 'bg-[#3A3A39]'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${iotaOnly ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <input type="checkbox" className="hidden" checked={iotaOnly} onChange={(e) => setIotaOnly(e.target.checked)} />
                    </label>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-[#4C82FF] border-t-transparent rounded-full"></div>
                </div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1AA] text-[15px]">등록된 업무가 없습니다.</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tasks.map((task, idx) => (
                        <div key={task.id} className="bg-[#242423] border border-[#3A3A39] rounded-[12px] p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] font-bold text-[#FFC928]">Task {tasks.length - idx}</span>
                                <span className={`text-[11px] font-semibold px-2 py-0.5 border rounded-full ${getStatusColor(task.status)}`}>
                                    {task.status || '상태 없음'}
                                </span>
                            </div>
                            
                            <h3 className="text-[16px] font-bold text-[#F4F4F1] leading-snug mb-1">
                                {task.task_name || 'Task 명 없음'}
                            </h3>
                            
                            <div className="text-[13px] text-[#9A9A98] mb-3 flex items-center gap-2">
                                <span className="text-[#4C82FF] font-medium">{task.related_asset || 'IOTA 공통'}</span>
                                {task.company_name && (
                                    <>
                                        <span>|</span>
                                        <span>{task.company_name}</span>
                                    </>
                                )}
                            </div>

                            <div className="bg-[#20201F] rounded-lg p-3">
                                <div className="text-[12px] text-[#9A9A98] font-medium mb-1 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    목표 마감일: <span className="text-[#F4F4F1]">{formatDate(task.due_date)}</span>
                                </div>
                                <div className="text-[13px] text-[#F4F4F1] leading-relaxed whitespace-pre-line mt-2 line-clamp-3">
                                    <span className="font-semibold text-[#A1A1AA] mr-2">Next:</span>
                                    {task.next_action || '작성된 내용이 없습니다.'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
