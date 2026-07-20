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
        popupCount: 0,
        supportNeeded: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fetch stats and tasks from staging iota_v2 schema
                const { data: allTasks, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('is_blocker, needs_decision, priority_score, task_name, assignee, due_date, status, category_main, importance_level, meeting_grade, task_type, support_needed');

                if (error) throw error;

                const parseBool = (v) => v === true || String(v).toLowerCase() === 'true' || String(v).toUpperCase() === 'Y';

                // Separate integrated (PMO) tasks and popup tasks
                const pmoTasks = (allTasks || []).filter(t => t.task_type !== '팝업');
                const popupTasks = (allTasks || []).filter(t => t.task_type === '팝업');

                const total = pmoTasks.length;
                const delayed = pmoTasks.filter(t => t.status === '지연').length;
                const blockers = pmoTasks.filter(t => parseBool(t.is_blocker)).length;
                const decisions = pmoTasks.filter(t => parseBool(t.needs_decision)).length;
                const meetings = pmoTasks.filter(t => t.meeting_grade === 'A' || t.meeting_grade === 'A_즉시상정').length;
                const inProgress = pmoTasks.filter(t => t.status === '진행중').length;
                const pfRequired = pmoTasks.filter(t => t.importance_level === 'PF필수').length;
                const constRequired = pmoTasks.filter(t => t.importance_level === '준공필수').length;
                const notStarted = pmoTasks.filter(t => t.status === '미착수').length;
                const completed = pmoTasks.filter(t => t.status === '완료').length;
                const onHold = pmoTasks.filter(t => t.status === '보류').length;
                const stopped = pmoTasks.filter(t => t.status === '중단').length;
                const supportNeeded = pmoTasks.filter(t => t.support_needed && t.support_needed.trim() !== '').length;

                // Counting only the '진행중' popup tasks
                const popupCount = popupTasks.filter(t => t.status === '진행중').length;

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
                    popupCount,
                    supportNeeded
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
        { label: '전체업무', path: 'platform/iotaseoul/workflow', count: counts.total, highlightClass: 'text-[#1F1F1E]', hoverClass: 'group-hover:text-[#000000]' },
        { label: '진행중', path: 'platform/iotaseoul/workflow?filterStatus=진행중', count: counts.inProgress, highlightClass: 'text-[#1F1F1E]', hoverClass: 'group-hover:text-[#000000]' },
        { label: '지연', path: 'platform/iotaseoul/workflow?filterStatus=지연', count: counts.delayed, highlightClass: 'text-[#E35D5D]', hoverClass: 'group-hover:text-[#FF3B30]' },
        { label: 'Blocker(병목)', path: 'platform/iotaseoul/workflow?filterIsBlocker=Y (예)', count: counts.blockers, highlightClass: 'text-[#E35D5D]', hoverClass: 'group-hover:text-[#FF3B30]' },
        { label: '의사결정 필요', path: 'platform/iotaseoul/workflow?filterNeedsDecision=Y (예)', count: counts.decisions, highlightClass: 'text-[#E35D5D]', hoverClass: 'group-hover:text-[#FF3B30]' },
        { label: '회의 필요', path: 'platform/iotaseoul/workflow?filterMeetingGrade=A_즉시상정', count: counts.meetings, highlightClass: 'text-[#E35D5D]', hoverClass: 'group-hover:text-[#FF3B30]' },
        { label: '타부서 지원필요', path: 'platform/iotaseoul/workflow?filterSupportNeeded=Y', count: counts.supportNeeded, highlightClass: 'text-[#E67E22]', hoverClass: 'group-hover:text-[#FF9500]' }
    ];

    const lowerFilters = [
        { label: '미착수', path: 'platform/iotaseoul/workflow?filterStatus=미착수', count: counts.notStarted },
        { label: 'PF필수', path: 'platform/iotaseoul/workflow?filterImportance=PF필수', count: counts.pfRequired },
        { label: '준공필수', path: 'platform/iotaseoul/workflow?filterImportance=준공필수', count: counts.constRequired },
        { label: '완료', path: 'platform/iotaseoul/workflow?filterStatus=완료', count: counts.completed },
        { label: '보류', path: 'platform/iotaseoul/workflow?filterStatus=보류', count: counts.onHold },
        { label: '중단', path: 'platform/iotaseoul/workflow?filterStatus=중단', count: counts.stopped },
        { label: '단발업무', path: 'platform/iotaseoul/popup-requests', count: counts.popupCount }
    ];
    const group3Upper = upperFilters.slice(2);
    const group3Lower = [lowerFilters[1], lowerFilters[2], lowerFilters[4], lowerFilters[5], lowerFilters[6]];



    return (
        <div className="w-full flex-1 flex flex-col pt-[24px] pb-[60px] max-w-[1200px] mx-auto select-text">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[12px]">
                <div>
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none">IOTA Seoul Main Board</h1>
                </div>
            </div>

            {/* Filter Navigation Buttons Grouped Containers */}
            <div className="w-[calc(100%+14px)] ml-[-7px] grid grid-cols-7 gap-[4px] mb-[32px] select-none text-center bg-transparent">
                {/* Box 1: 전체업무 + 완료 (col-span-1) */}
                <div className="col-span-1 border border-[#4b4b4b]/70 rounded-[30px] p-[6px] flex flex-col gap-[6px]">
                    {/* 전체업무 */}
                    {(() => {
                        const btn = upperFilters[0];
                        return (
                            <div
                                onClick={() => handleFilterClick(btn)}
                                className="w-full bg-[#b4b6b5] h-[94px] rounded-[24px] flex items-center justify-center cursor-pointer group"
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent group-hover:bg-[#d4d7d5] transition-all duration-200 flex flex-col items-center justify-center">
                                    <span className="text-[13px] font-bold text-[#3C3C3C] group-hover:text-[#000000] transition-colors duration-200 mb-0.5">{btn.label}</span>
                                    <span className={`text-[30px] font-black leading-none transition-colors duration-200 ${btn.highlightClass} ${btn.hoverClass}`}>
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                    {/* 완료 */}
                    {(() => {
                        const btn = lowerFilters[3];
                        return (
                            <div
                                onClick={() => handleFilterClick(btn)}
                                className="w-full bg-[#2b2b2b] h-[98px] border border-[#4b4b4b] rounded-[24px] flex items-center justify-center cursor-pointer group"
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent group-hover:bg-[#3e3e3e] transition-all duration-200 flex flex-col items-center justify-center">
                                    <span className="text-[13px] font-bold text-[#8E8E93] group-hover:text-[#509FEB] transition-colors duration-200 mb-1">{btn.label}</span>
                                    <span className="text-[30px] font-black text-white group-hover:text-[#509FEB] transition-colors duration-200 leading-none">
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Box 2: 진행중 + 미착수 (col-span-1) */}
                <div className="col-span-1 border border-[#4b4b4b]/70 rounded-[30px] p-[6px] flex flex-col gap-[6px]">
                    {/* 진행중 */}
                    {(() => {
                        const btn = upperFilters[1];
                        return (
                            <div
                                onClick={() => handleFilterClick(btn)}
                                className="w-full bg-[#b4b6b5] h-[94px] rounded-[24px] flex items-center justify-center cursor-pointer group"
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent group-hover:bg-[#d4d7d5] transition-all duration-200 flex flex-col items-center justify-center">
                                    <span className="text-[13px] font-bold text-[#3C3C3C] group-hover:text-[#000000] transition-colors duration-200 mb-0.5">{btn.label}</span>
                                    <span className={`text-[30px] font-black leading-none transition-colors duration-200 ${btn.highlightClass} ${btn.hoverClass}`}>
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                    {/* 미착수 */}
                    {(() => {
                        const btn = lowerFilters[0];
                        return (
                            <div
                                onClick={() => handleFilterClick(btn)}
                                className="w-full bg-[#2b2b2b] h-[98px] border border-[#4b4b4b] rounded-[24px] flex items-center justify-center cursor-pointer group"
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent group-hover:bg-[#3e3e3e] transition-all duration-200 flex flex-col items-center justify-center">
                                    <span className="text-[13px] font-bold text-[#8E8E93] group-hover:text-[#509FEB] transition-colors duration-200 mb-1">{btn.label}</span>
                                    <span className="text-[30px] font-black text-white group-hover:text-[#509FEB] transition-colors duration-200 leading-none">
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Box 3: 나머지 상하단 박스 5개씩 (col-span-5) */}
                <div className="col-span-5 border border-[#4b4b4b]/70 rounded-[30px] p-[6px] flex flex-col gap-[6px]">
                    {/* Upper Row Box */}
                    <div className="grid grid-cols-5 bg-[#b4b6b5] h-[94px] rounded-[24px] overflow-hidden divide-x divide-[#8b8b8b]/80">
                        {group3Upper.map((btn, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleFilterClick(btn)}
                                className="p-[6px] h-full flex items-center justify-center cursor-pointer group"
                            >
                                <div className="w-full h-full rounded-[18px] bg-transparent group-hover:bg-[#d4d7d5] transition-all duration-200 flex flex-col items-center justify-center">
                                    <span className="text-[13px] font-bold text-[#3C3C3C] group-hover:text-[#000000] transition-colors duration-200 mb-0.5">{btn.label}</span>
                                    <span className={`text-[30px] font-black leading-none transition-colors duration-200 ${btn.highlightClass} ${btn.hoverClass}`}>
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Lower Row Box */}
                    <div className="grid grid-cols-5 bg-[#2b2b2b] h-[98px] border border-[#4b4b4b] rounded-[24px] overflow-hidden divide-x divide-[#4b4b4b]/70">
                        {group3Lower.map((btn, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleFilterClick(btn)}
                                className="p-[6px] h-full flex items-center justify-center cursor-pointer group"
                            >
                                <div className="w-full h-full rounded-[18px] bg-transparent group-hover:bg-[#3e3e3e] transition-all duration-200 flex flex-col items-center justify-center">
                                    <span className="text-[13px] font-bold text-[#8E8E93] group-hover:text-[#509FEB] transition-colors duration-200 mb-1">{btn.label}</span>
                                    <span className="text-[30px] font-black text-white group-hover:text-[#509FEB] transition-colors duration-200 leading-none">
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
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
