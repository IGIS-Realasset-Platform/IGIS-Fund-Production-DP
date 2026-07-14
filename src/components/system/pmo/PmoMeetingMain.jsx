import React from 'react';
import { supabase } from '../../../utils/supabaseClient';

export default function PmoMeetingMain() {
    const [stats, setStats] = React.useState({ total: 0, blockers: 0, decisions: 0 });
    const [topTasks, setTopTasks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fetch stats from staging iota_v2 schema
                const { data: allTasks, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('is_blocker, needs_decision, priority_score, task_name, assignee, due_date, status, category_main');

                if (error) throw error;

                const total = allTasks.length;
                const blockers = allTasks.filter(t => t.is_blocker).length;
                const decisions = allTasks.filter(t => t.needs_decision).length;
                setStats({ total, blockers, decisions });

                // Sort Top 12 critical tasks (prioritize blockers, decisions, and priority score)
                const sorted = [...allTasks].sort((a, b) => {
                    if (a.is_blocker !== b.is_blocker) return b.is_blocker ? 1 : -1;
                    if (a.needs_decision !== b.needs_decision) return b.needs_decision ? 1 : -1;
                    return b.priority_score - a.priority_score;
                }).slice(0, 12);
                
                setTopTasks(sorted);
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    return (
        <div className="w-full flex-1 flex flex-col pt-[20px] pb-[60px] max-w-[1200px] mx-auto select-text">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[32px]">
                <div>
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none mb-[8px]">회의 메인</h1>
                    <p className="text-[16px] text-[#86868B] leading-[26px]">의사결정 집계 및 핵심 리스크 관제 대시보드</p>
                </div>
            </div>

            {loading ? (
                <div className="w-full h-[300px] flex items-center justify-center border border-[#333] rounded-[24px]">
                    <span className="text-[#86868B] text-[15px] animate-pulse">데이터를 집계하고 있습니다...</span>
                </div>
            ) : (
                <div className="w-full flex flex-col gap-8">
                    {/* KPI Widgets */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-[#272726] border border-[#3c3c3c] rounded-[20px] p-6 flex flex-col justify-between hover:border-[#555] transition-all">
                            <span className="text-[12px] font-bold text-[#86868B] uppercase tracking-wider">전체 등록 업무</span>
                            <span className="text-[36px] font-bold text-white mt-2 font-mono">{stats.total} <span className="text-[14px] text-[#86868B] font-normal">건</span></span>
                        </div>
                        <div className="bg-[#272726] border border-[#ef4444]/30 rounded-[20px] p-6 flex flex-col justify-between hover:border-[#ef4444]/50 transition-all shadow-lg shadow-[#ef4444]/2">
                            <span className="text-[12px] font-bold text-[#ef4444] uppercase tracking-wider">지연 리스크 (Blocker)</span>
                            <span className="text-[36px] font-bold text-[#ef4444] mt-2 font-mono">{stats.blockers} <span className="text-[14px] text-[#ef4444]/60 font-normal">건</span></span>
                        </div>
                        <div className="bg-[#272726] border border-[#F59E0B]/30 rounded-[20px] p-6 flex flex-col justify-between hover:border-[#F59E0B]/50 transition-all shadow-lg shadow-[#F59E0B]/2">
                            <span className="text-[12px] font-bold text-[#F59E0B] uppercase tracking-wider">의사결정 필요 현안</span>
                            <span className="text-[36px] font-bold text-[#F59E0B] mt-2 font-mono">{stats.decisions} <span className="text-[14px] text-[#F59E0B]/60 font-normal">건</span></span>
                        </div>
                    </div>

                    {/* Top 12 Critical Items */}
                    <div className="bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6">
                        <h3 className="text-[18px] font-bold text-white mb-4">우선순위 Top 12 핵심 현안 목록</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topTasks.length === 0 ? (
                                <div className="col-span-2 text-center py-10 text-[#86868B]">
                                    현재 등록된 핵심 안건이 없습니다.
                                </div>
                            ) : (
                                topTasks.map((t, idx) => (
                                    <div key={idx} className="bg-[#1f1f1e] border border-[#3c3c3c] rounded-xl p-4 flex items-center justify-between hover:border-[#555] transition-all group">
                                        <div className="flex items-center gap-4 truncate">
                                            <span className="text-[12px] font-bold font-mono text-[#2997ff] bg-[#2997ff]/10 px-2.5 py-1 rounded-lg">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <div className="truncate">
                                                <div className="text-[14px] font-bold text-white truncate group-hover:text-[#2997ff] transition-all text-left">
                                                    {t.task_name}
                                                </div>
                                                <div className="text-[11px] text-[#86868B] mt-1 flex items-center gap-2">
                                                    <span className="bg-[#2d2d2d] px-1.5 py-0.5 rounded text-[10px] font-bold text-white">{t.category_main}</span>
                                                    <span>담당: {t.assignee || '미지정'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {t.is_blocker && (
                                                <span className="text-[10px] bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] px-1.5 py-0.5 rounded font-bold">
                                                    Blocker
                                                </span>
                                            )}
                                            {t.needs_decision && (
                                                <span className="text-[10px] bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-[#F59E0B] px-1.5 py-0.5 rounded font-bold">
                                                    의사결정
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
