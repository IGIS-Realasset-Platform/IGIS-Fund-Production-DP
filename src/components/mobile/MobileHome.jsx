import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function MobileHome({ memberInfo, onNavigateToTab }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ blockers: 0, decision: 0, delay: 0, pending: 0 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: allTasks, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('id, project_code, task_name, sector_detail, lead_dept_code, lead_dept:iota_departments!lead_dept_code(dept_name), coop_dept_codes, assignee, is_blocker, needs_decision, priority_score, due_date, status, category_main, importance_level, meeting_grade, task_type, support_needed');

                if (error) throw error;

                const finalTasks = allTasks || [];
                setTasks(finalTasks);
                
                setCounts({
                    blockers: finalTasks.filter(t => t.is_blocker).length,
                    decision: finalTasks.filter(t => t.needs_decision).length,
                    delay: finalTasks.filter(t => t.status === '지연' || t.status === '위험').length,
                    pending: finalTasks.filter(t => t.status === '대기' || t.status === '안건대기' || t.status === '승인대기').length
                });
            } catch (err) {
                console.error("Failed to load dashboard data from database:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="w-full h-full flex flex-col p-4 overflow-y-auto hide-scrollbar">
            {/* 2x2 KPI Widgets will go here */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div onClick={() => onNavigateToTab(1, 'Blocker')} className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06] active:bg-[#2c2c2e] transition-colors cursor-pointer">
                    <span className="text-[13px] font-medium text-[#86868b]">블로커</span>
                    <span className="text-[28px] font-bold text-red-500 font-['Inter']">{counts.blockers}</span>
                </div>
                <div onClick={() => onNavigateToTab(1, 'Decision')} className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06] active:bg-[#2c2c2e] transition-colors cursor-pointer">
                    <span className="text-[13px] font-medium text-[#86868b]">의사결정</span>
                    <span className="text-[28px] font-bold text-orange-500 font-['Inter']">{counts.decision}</span>
                </div>
                <div onClick={() => onNavigateToTab(1, 'Delay')} className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06] active:bg-[#2c2c2e] transition-colors cursor-pointer">
                    <span className="text-[13px] font-medium text-[#86868b]">지연/위험</span>
                    <span className="text-[28px] font-bold text-yellow-500 font-['Inter']">{counts.delay}</span>
                </div>
                <div onClick={() => onNavigateToTab(1, 'Pending')} className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06] active:bg-[#2c2c2e] transition-colors cursor-pointer">
                    <span className="text-[13px] font-medium text-[#86868b]">안건대기</span>
                    <span className="text-[28px] font-bold text-blue-500 font-['Inter']">{counts.pending}</span>
                </div>
            </div>

            {/* Quick Actions (Pill Filters) */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
                <button className="whitespace-nowrap px-4 py-2 rounded-full bg-white/10 text-white text-[13px] font-bold border border-white/20">전체 현황</button>
                <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#252525] text-[#86868b] text-[13px] font-medium border border-white/[0.06]">단발업무</button>
                <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#252525] text-[#86868b] text-[13px] font-medium border border-white/[0.06]">내 워크스페이스</button>
            </div>

            {/* Today's Tasks List Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[18px] font-bold text-white tracking-tight">전체 현황 목록</h2>
                <button 
                    onClick={() => onNavigateToTab(1)} // 업무 탭으로 이동
                    className="text-[12px] text-[#2997ff] font-medium"
                >
                    전체보기
                </button>
            </div>

            {/* List Cards */}
            <div className="flex flex-col gap-3 pb-8">
                {loading ? (
                    <div className="bg-[#252525] rounded-[16px] p-4 border border-white/[0.06] flex flex-col gap-2">
                        <span className="text-[13px] text-[#86868b]">데이터 로딩 중...</span>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="bg-[#252525] rounded-[16px] p-4 border border-white/[0.06] flex flex-col gap-2">
                        <span className="text-[13px] text-[#86868b]">표시할 현황이 없습니다.</span>
                    </div>
                ) : (
                    tasks.slice(0, 10).map((t, idx) => (
                        <div key={t.id || idx} className="bg-[#252525] hover:bg-[#2c2c2e] transition-colors rounded-[16px] p-4 border border-white/[0.06] flex flex-col gap-2 relative">
                            {/* Badges */}
                            <div className="flex gap-2 mb-1">
                                {t.is_blocker && <span className="bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded">블로커</span>}
                                {t.needs_decision && <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded">의사결정</span>}
                            </div>
                            {/* Title */}
                            <h3 className="text-[15px] font-bold text-[#E5E5E5] leading-snug break-keep">{t.task_name}</h3>
                            {/* Metadata */}
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/[0.06]">
                                <span className="text-[12px] text-[#A1A1AA]">{t.assignee || t.sector_detail || '담당 미지정'}</span>
                                <span className={`text-[12px] font-bold ${
                                    t.status === '완료' ? 'text-green-400' :
                                    t.status === '지연' || t.status === '위험' ? 'text-yellow-400' :
                                    'text-[#60a5fa]'
                                }`}>{t.status || '진행중'}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
