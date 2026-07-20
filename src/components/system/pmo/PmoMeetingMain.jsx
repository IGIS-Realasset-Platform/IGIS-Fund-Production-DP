import React from 'react';
import { supabase } from '../../../utils/supabaseClient';

export default function PmoMeetingMain() {
    const [counts, setCounts] = React.useState({
        total: 0,
        delayed: 0,
        blockers: 0,
        decisions: 0,
        meetings: 0,
        inProgress: 0,
        pfRequired: 0,
        constRequired: 0,
        notStarted: 0,
        completed: 0,
        onHold: 0,
        stopped: 0,
        popupCount: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                // 1. Fetch popup requests count
                const { count: popupCount } = await supabase
                    .schema('iota_v2')
                    .from('iota_popup_requests')
                    .select('*', { count: 'exact', head: true });

                // 2. Fetch stats and tasks from staging iota_v2 schema
                const { data: allTasks, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('is_blocker, needs_decision, priority_score, task_name, assignee, due_date, status, category_main, importance_level, meeting_grade');

                if (error) throw error;

                const parseBool = (v) => v === true || String(v).toLowerCase() === 'true' || String(v).toUpperCase() === 'Y';

                const total = allTasks.length;
                const delayed = allTasks.filter(t => t.status === '지연').length;
                const blockers = allTasks.filter(t => parseBool(t.is_blocker)).length;
                const decisions = allTasks.filter(t => parseBool(t.needs_decision)).length;
                const meetings = allTasks.filter(t => t.meeting_grade === 'A' || t.meeting_grade === 'A_즉시상정').length;
                const inProgress = allTasks.filter(t => t.status === '진행중').length;
                const pfRequired = allTasks.filter(t => t.importance_level === 'PF필수').length;
                const constRequired = allTasks.filter(t => t.importance_level === '준공필수').length;
                const notStarted = allTasks.filter(t => t.status === '미착수').length;
                const completed = allTasks.filter(t => t.status === '완료').length;
                const onHold = allTasks.filter(t => t.status === '보류').length;
                const stopped = allTasks.filter(t => t.status === '중단').length;

                setCounts({
                    total,
                    delayed,
                    blockers,
                    decisions,
                    meetings,
                    inProgress,
                    pfRequired,
                    constRequired,
                    notStarted,
                    completed,
                    onHold,
                    stopped,
                    popupCount: popupCount || 0
                });



            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboardData();
    }, []);

    const handleFilterClick = (btn) => {
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        const targetPath = btn.path.startsWith('/') ? btn.path : '/' + btn.path;
        window.history.pushState(null, '', base + targetPath);
        window.dispatchEvent(new Event('popstate'));
    };

    const upperFilters = [
        { label: '전체업무', path: 'platform/iotaseoul/workflow', count: counts.total, highlightClass: 'text-white' },
        { label: '지연', path: 'platform/iotaseoul/workflow?filterStatus=지연', count: counts.delayed, highlightClass: 'text-[#ef4444]' },
        { label: 'Blocker (병목)', path: 'platform/iotaseoul/workflow?filterIsBlocker=Y (예)', count: counts.blockers, highlightClass: 'text-[#ef4444]' },
        { label: '의사결정필요', path: 'platform/iotaseoul/workflow?filterNeedsDecision=Y (예)', count: counts.decisions, highlightClass: 'text-[#F59E0B]' },
        { label: '회의필요', path: 'platform/iotaseoul/workflow?filterMeetingGrade=A_즉시상정', count: counts.meetings, highlightClass: 'text-[#2997ff]' }
    ];

    const lowerFilters = [
        { label: '진행중', path: 'platform/iotaseoul/workflow?filterStatus=진행중', count: counts.inProgress },
        { label: 'PF필수', path: 'platform/iotaseoul/workflow?filterImportance=PF필수', count: counts.pfRequired },
        { label: '준공필수', path: 'platform/iotaseoul/workflow?filterImportance=준공필수', count: counts.constRequired },
        { label: '미착수', path: 'platform/iotaseoul/workflow?filterStatus=미착수', count: counts.notStarted },
        { label: '완료', path: 'platform/iotaseoul/workflow?filterStatus=완료', count: counts.completed },
        { label: '보류', path: 'platform/iotaseoul/workflow?filterStatus=보류', count: counts.onHold },
        { label: '중단', path: 'platform/iotaseoul/workflow?filterStatus=중단', count: counts.stopped },
        { label: '단발', path: 'platform/iotaseoul/popup-requests', count: counts.popupCount }
    ];



    return (
        <div className="w-full flex-1 flex flex-col pt-[28px] pb-[60px] max-w-[1200px] mx-auto select-text">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[20px]">
                <div>
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none">IOTA Seoul Main Board</h1>
                </div>
            </div>

            {/* Filter Navigation Buttons */}
            <div className="w-full flex flex-col gap-3 mb-[32px] select-none text-left">
                {/* Upper Row */}
                <div className="grid grid-cols-5 gap-3">
                    {upperFilters.map((btn, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleFilterClick(btn)}
                            className="bg-[#2c2c2b]/60 border border-[#3c3c3c] hover:border-[#2997ff] rounded-[16px] py-3.5 px-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-md outline-none"
                        >
                            <span className="text-[12px] font-bold text-[#86868b] mb-1.5">{btn.label}</span>
                            <span className={`text-[20px] font-black leading-none ${btn.highlightClass || 'text-white'}`}>{btn.count}</span>
                        </div>
                    ))}
                </div>
                {/* Lower Row */}
                <div className="grid grid-cols-8 gap-3">
                    {lowerFilters.map((btn, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleFilterClick(btn)}
                            className="bg-[#b4b6b5] hover:bg-[#c5c7c6] border border-[#a3a5a4]/40 rounded-[16px] py-3.5 px-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:shadow-md outline-none"
                        >
                            <span className="text-[12px] font-bold text-[#1c1c1e]/70 mb-1.5">{btn.label}</span>
                            <span className="text-[20px] font-black text-[#1c1c1e] leading-none">{btn.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="w-full h-[150px] flex items-center justify-center">
                    <span className="text-[#86868B] text-[13px] animate-pulse">데이터를 집계하고 있습니다...</span>
                </div>
            )}
        </div>
    );
}
