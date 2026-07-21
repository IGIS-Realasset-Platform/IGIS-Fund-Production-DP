import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

const formatDate = (dateString) => {
    if (!dateString) return '미정';
    try {
        const d = new Date(dateString);
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    } catch (e) {
        return dateString;
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case '완료': return 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10';
        case '진행중': return 'text-[#60a5fa] border-[#60a5fa]/30 bg-[#60a5fa]/10';
        case '지연': return 'text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10';
        case '보류': return 'text-[#facc15] border-[#facc15]/30 bg-[#facc15]/10';
        case '예정': return 'text-[#A1A1AA] border-[#A1A1AA]/30 bg-[#A1A1AA]/10';
        default: return 'text-[#A1A1AA] border-[#A1A1AA]/30 bg-[#A1A1AA]/10';
    }
};

export default function MobilePmoTaskList({ memberInfo, defaultFilter, onResetFilter }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All'); // 'All' | 'Blocker' | 'Decision' | 'Delay' | 'Pending'

    useEffect(() => {
        if (defaultFilter) {
            setActiveFilter(defaultFilter);
        }
    }, [defaultFilter]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .schema('iota_v2')
                .from('iota_pmo_tasks')
                .select('*')
                .order('due_date', { ascending: true, nullsFirst: false });
                
            if (error) throw error;
            setTasks(data || []);
        } catch (err) {
            console.error("Failed to fetch PMO tasks:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (activeFilter === 'Blocker') return task.is_blocker;
        if (activeFilter === 'Decision') return task.needs_decision;
        if (activeFilter === 'Delay') return task.status === '지연';
        if (activeFilter === 'Pending') return task.status === '보류';
        return true; // 'All'
    });

    const handleFilterClick = (filterName) => {
        if (activeFilter === filterName) {
            setActiveFilter('All');
            if (onResetFilter) onResetFilter();
        } else {
            setActiveFilter(filterName);
        }
    };

    const FilterChip = ({ label, value, colorClass }) => {
        const isActive = activeFilter === value;
        return (
            <button
                onClick={() => handleFilterClick(value)}
                className={`px-3 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-all border ${
                    isActive 
                    ? `${colorClass.split(' ')[0]} bg-opacity-20 border-opacity-50` 
                    : 'text-[#8E8E93] border-[#3c3c3c] hover:bg-[#2C2C2E]'
                }`}
                style={isActive ? { backgroundColor: 'var(--tw-bg-opacity)', borderColor: 'var(--tw-border-opacity)' } : {}}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="flex flex-col w-full h-full">
            {/* Filter Chips Bar */}
            <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar shrink-0 border-b border-[#3c3c3c]/30">
                <FilterChip label="전체" value="All" colorClass="text-white bg-[#3c3c3c] border-[#555]" />
                <FilterChip label="Blocker" value="Blocker" colorClass="text-[#f87171] bg-[#f87171] border-[#f87171]" />
                <FilterChip label="의사결정" value="Decision" colorClass="text-[#fb923c] bg-[#fb923c] border-[#fb923c]" />
                <FilterChip label="지연" value="Delay" colorClass="text-[#f87171] bg-[#f87171] border-[#f87171]" />
                <FilterChip label="보류" value="Pending" colorClass="text-[#facc15] bg-[#facc15] border-[#facc15]" />
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-20 text-[#86868B] text-[15px] font-medium">
                        해당하는 업무가 없습니다.
                    </div>
                ) : (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="bg-[#272726] rounded-[20px] p-5 shadow-sm border border-[#3c3c3c]/50 relative overflow-hidden">
                            {/* Accent Line for Critical Items */}
                            {(task.is_blocker || task.needs_decision) && (
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.is_blocker ? 'bg-[#f87171]' : 'bg-[#fb923c]'}`}></div>
                            )}
                            
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-[#60a5fa]">{task.project_code || '전사'}</span>
                                    {task.is_blocker && (
                                        <span className="text-[10px] font-bold text-[#f87171] bg-[#f87171]/10 px-2 py-0.5 rounded-full border border-[#f87171]/20">Blocker</span>
                                    )}
                                    {task.needs_decision && !task.is_blocker && (
                                        <span className="text-[10px] font-bold text-[#fb923c] bg-[#fb923c]/10 px-2 py-0.5 rounded-full border border-[#fb923c]/20">의사결정</span>
                                    )}
                                </div>
                                <span className={`text-[11px] font-bold px-2 py-0.5 border rounded-full ${getStatusColor(task.status)}`}>
                                    {task.status || '상태 없음'}
                                </span>
                            </div>

                            <h3 className="text-[17px] font-bold text-white leading-snug mb-2 font-sans break-all">
                                {task.task_name || '제목 없음 (데이터 누락)'}
                            </h3>

                            <div className="text-[13px] text-[#A1A1AA] flex flex-wrap gap-x-3 gap-y-1 mb-4">
                                <div>주관: <span className="text-[#E5E5E5]">{task.lead_dept_code || '-'}</span></div>
                                <div>협조: <span className="text-[#E5E5E5]">{task.coop_dept_codes || '-'}</span></div>
                            </div>

                            <div className="bg-[#1A1A1A] rounded-[12px] p-3.5 border border-[#3c3c3c]/30">
                                <div className="text-[12px] text-[#86868B] font-bold mb-1.5 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        목표 마감일
                                    </div>
                                    <span className="text-white">{formatDate(task.due_date)}</span>
                                </div>
                                <div className="text-[13px] text-[#E5E5E5] leading-relaxed whitespace-pre-line mt-2 line-clamp-3 break-all">
                                    <span className="font-bold text-[#60a5fa] mr-2">Next:</span>
                                    {task.next_action || '작성된 내용이 없습니다.'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
