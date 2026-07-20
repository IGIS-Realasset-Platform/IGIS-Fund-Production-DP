import React from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { FALLBACK_BOARD_TASKS } from './PmoTaskBoardStaging';

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
    const [tasks, setTasks] = React.useState([]);
    const [selectedFilter, setSelectedFilter] = React.useState('전체업무');

    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                // Fetch stats and tasks from staging iota_v2 schema
                const { data: allTasks, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('id, project, task_name, lead_dept, assignee, is_blocker, needs_decision, priority_score, due_date, status, category_main, importance_level, meeting_grade, task_type, support_needed');

                if (error) throw error;

                const finalTasks = (allTasks && allTasks.length > 0) ? allTasks : FALLBACK_BOARD_TASKS;
                setTasks(finalTasks);

                const parseBool = (v) => v === true || String(v).toLowerCase() === 'true' || String(v).toUpperCase() === 'Y';

                // Separate integrated (PMO) tasks and popup tasks
                const pmoTasks = finalTasks.filter(t => t.task_type !== '팝업');
                const popupTasks = finalTasks.filter(t => t.task_type === '팝업');

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
                const supportNeeded = pmoTasks.filter(t => {
                    const fallbackItem = FALLBACK_BOARD_TASKS.find(fb => fb.task_name === t.task_name) || {};
                    const val = t.support_needed || fallbackItem.support_needed || '';
                    const s = val.trim().toLowerCase();
                    const invalidKeywords = ['', '없음', 'n/a', 'na', '해당사항 없음', '해당사항없음', '-', 'none'];
                    return s && !invalidKeywords.includes(s);
                }).length;

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
                setTasks(FALLBACK_BOARD_TASKS);
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
        { label: '지원필요', path: 'platform/iotaseoul/workflow?filterSupportNeeded=Y', count: counts.supportNeeded, highlightClass: 'text-[#E67E22]', hoverClass: 'group-hover:text-[#FF9500]' }
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

    const getFilteredTasks = () => {
        const parseBool = (v) => v === true || String(v).toLowerCase() === 'true' || String(v).toUpperCase() === 'Y';
        
        // Filter out popup tasks from standard listings except when selecting '단발업무'
        const pmoTasks = tasks.filter(t => t.task_type !== '팝업');
        const popupTasks = tasks.filter(t => t.task_type === '팝업');
        
        switch (selectedFilter) {
            case '진행중':
                return pmoTasks.filter(t => t.status === '진행중');
            case '지연':
                return pmoTasks.filter(t => t.status === '지연');
            case 'Blocker(병목)':
                return pmoTasks.filter(t => parseBool(t.is_blocker));
            case '의사결정 필요':
                return pmoTasks.filter(t => parseBool(t.needs_decision));
            case '회의 필요':
                return pmoTasks.filter(t => t.meeting_grade === 'A' || t.meeting_grade === 'A_즉시상정');
            case '지원필요':
                return pmoTasks.filter(t => {
                    const fallbackItem = FALLBACK_BOARD_TASKS.find(fb => fb.task_name === t.task_name) || {};
                    const val = t.support_needed || fallbackItem.support_needed || '';
                    const s = val.trim().toLowerCase();
                    const invalidKeywords = ['', '없음', 'n/a', 'na', '해당사항 없음', '해당사항없음', '-', 'none'];
                    return s && !invalidKeywords.includes(s);
                });
            case '미착수':
                return pmoTasks.filter(t => t.status === '미착수');
            case 'PF필수':
                return pmoTasks.filter(t => t.importance_level === 'PF필수');
            case '준공필수':
                return pmoTasks.filter(t => t.importance_level === '준공필수');
            case '완료':
                return pmoTasks.filter(t => t.status === '완료');
            case '보류':
                return pmoTasks.filter(t => t.status === '보류');
            case '중단':
                return pmoTasks.filter(t => t.status === '중단');
            case '단발업무':
                return popupTasks.filter(t => t.status === '진행중');
            case '전체업무':
            default:
                return pmoTasks;
        }
    };

    const getFilterPath = () => {
        const allFilters = [...upperFilters, ...lowerFilters];
        const matched = allFilters.find(f => f.label === selectedFilter);
        return matched ? matched.path : 'platform/iotaseoul/workflow';
    };

    const handleGoToFullPage = () => {
        const filterPath = getFilterPath();
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        const targetPath = filterPath.startsWith('/') ? filterPath : '/' + filterPath;
        window.history.pushState(null, '', base + targetPath);
        window.dispatchEvent(new Event('popstate'));
    };

    const handleTaskClick = (task) => {
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        window.history.pushState(null, '', `${base}/platform/iotaseoul/workflow?taskId=${task.id}`);
        window.dispatchEvent(new Event('popstate'));
    };

    const getProjectBadgeStyle = (proj) => {
        const p = String(proj || '').toLowerCase();
        if (p.includes('816')) return 'bg-[#c7c7cc]/10 text-[#c7c7cc] border border-[#c7c7cc]/20';
        if (p.includes('421')) return 'bg-[#737373]/10 text-[#a1a1aa] border border-[#737373]/20';
        if (p.includes('427')) return 'bg-[#30b0c7]/10 text-[#5ac8fa] border border-[#30b0c7]/20';
        return 'bg-[#bf5af2]/10 text-[#c084fc] border border-[#bf5af2]/20'; // Purple for others/common
    };

    const getMeetingGradeBadge = (grade) => {
        if (!grade || grade === '-') return <span className="text-[12px] text-[#555]">-</span>;
        if (grade.includes('A')) {
            return <span className="px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20">A_즉시상정</span>;
        }
        return <span className="px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#8e8e93]/10 text-[#9ca3af] border border-[#8e8e93]/20">{grade}</span>;
    };

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
                        const isActive = selectedFilter === btn.label;
                        return (
                            <div
                                onClick={() => setSelectedFilter(btn.label)}
                                className={`w-full h-[94px] rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'bg-white ring-2 ring-[#2997ff] ring-offset-2 ring-offset-[#1F1F1E] shadow-[0_0_15px_rgba(41,151,255,0.4)]' : 'bg-[#b4b6b5]'}`}
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent flex flex-col items-center justify-center">
                                    <span className={`text-[13px] font-bold transition-colors duration-200 mb-0.5 ${isActive ? 'text-[#000]' : 'text-[#3C3C3C] group-hover:text-[#000000]'}`}>{btn.label}</span>
                                    <span className={`text-[32px] font-black leading-none transition-colors duration-200 ${isActive ? 'text-black' : btn.highlightClass} ${btn.hoverClass}`}>
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                    {/* 완료 */}
                    {(() => {
                        const btn = lowerFilters[3];
                        const isActive = selectedFilter === btn.label;
                        return (
                            <div
                                onClick={() => setSelectedFilter(btn.label)}
                                className={`w-full h-[98px] border rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'bg-[#3a3a3a] border-[#2997ff] ring-2 ring-[#2997ff] ring-offset-2 ring-offset-[#1F1F1E] shadow-[0_0_15px_rgba(41,151,255,0.4)]' : 'bg-[#2b2b2b] border-[#4b4b4b]'}`}
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent flex flex-col items-center justify-center">
                                    <span className={`text-[13px] font-bold transition-colors duration-200 mb-1 ${isActive ? 'text-[#2997ff]' : 'text-[#8E8E93] group-hover:text-[#509FEB]'}`}>{btn.label}</span>
                                    <span className={`text-[32px] font-black transition-colors duration-200 leading-none ${isActive ? 'text-[#2997ff]' : 'text-white group-hover:text-[#509FEB]'}`}>
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
                        const isActive = selectedFilter === btn.label;
                        return (
                            <div
                                onClick={() => setSelectedFilter(btn.label)}
                                className={`w-full h-[94px] rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'bg-white ring-2 ring-[#2997ff] ring-offset-2 ring-offset-[#1F1F1E] shadow-[0_0_15px_rgba(41,151,255,0.4)]' : 'bg-[#b4b6b5]'}`}
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent flex flex-col items-center justify-center">
                                    <span className={`text-[13px] font-bold transition-colors duration-200 mb-0.5 ${isActive ? 'text-[#000]' : 'text-[#3C3C3C] group-hover:text-[#000000]'}`}>{btn.label}</span>
                                    <span className={`text-[32px] font-black leading-none transition-colors duration-200 ${isActive ? 'text-black' : btn.highlightClass} ${btn.hoverClass}`}>
                                        {btn.count}
                                    </span>
                                </div>
                            </div>
                        );
                    })()}
                    {/* 미착수 */}
                    {(() => {
                        const btn = lowerFilters[0];
                        const isActive = selectedFilter === btn.label;
                        return (
                            <div
                                onClick={() => setSelectedFilter(btn.label)}
                                className={`w-full h-[98px] border rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'bg-[#3a3a3a] border-[#2997ff] ring-2 ring-[#2997ff] ring-offset-2 ring-offset-[#1F1F1E] shadow-[0_0_15px_rgba(41,151,255,0.4)]' : 'bg-[#2b2b2b] border-[#4b4b4b]'}`}
                            >
                                <div className="w-full h-full rounded-[24px] bg-transparent flex flex-col items-center justify-center">
                                    <span className={`text-[13px] font-bold transition-colors duration-200 mb-1 ${isActive ? 'text-[#2997ff]' : 'text-[#8E8E93] group-hover:text-[#509FEB]'}`}>{btn.label}</span>
                                    <span className={`text-[32px] font-black transition-colors duration-200 leading-none ${isActive ? 'text-[#2997ff]' : 'text-white group-hover:text-[#509FEB]'}`}>
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
                        {group3Upper.map((btn, idx) => {
                            const isActive = selectedFilter === btn.label;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedFilter(btn.label)}
                                    className={`p-[6px] h-full flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'bg-white ring-2 ring-[#2997ff] shadow-[0_0_12px_rgba(41,151,255,0.4)] rounded-[18px]' : ''}`}
                                >
                                    <div className="w-full h-full rounded-[18px] bg-transparent flex flex-col items-center justify-center">
                                        <span className={`text-[13px] font-bold transition-colors duration-200 mb-0.5 ${isActive ? 'text-[#000]' : 'text-[#3C3C3C] group-hover:text-[#000000]'}`}>{btn.label}</span>
                                        <span className={`text-[32px] font-black leading-none transition-colors duration-200 ${isActive ? 'text-black' : btn.highlightClass} ${btn.hoverClass}`}>
                                            {btn.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Lower Row Box */}
                    <div className="grid grid-cols-5 bg-[#2b2b2b] h-[98px] border border-[#4b4b4b] rounded-[24px] overflow-hidden divide-x divide-[#4b4b4b]/70">
                        {group3Lower.map((btn, idx) => {
                            const isActive = selectedFilter === btn.label;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedFilter(btn.label)}
                                    className={`p-[6px] h-full flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'bg-[#3a3a3a] ring-2 ring-[#2997ff] rounded-[18px]' : ''}`}
                                >
                                    <div className="w-full h-full rounded-[18px] bg-transparent flex flex-col items-center justify-center">
                                        <span className={`text-[13px] font-bold transition-colors duration-200 mb-1 ${isActive ? 'text-[#2997ff]' : 'text-[#8E8E93] group-hover:text-[#509FEB]'}`}>{btn.label}</span>
                                        <span className={`text-[32px] font-black transition-colors duration-200 leading-none ${isActive ? 'text-[#2997ff]' : 'text-white group-hover:text-[#509FEB]'}`}>
                                            {btn.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="w-full h-[150px] flex items-center justify-center">
                    <span className="text-[#86868B] text-[13px] animate-pulse">데이터를 집계하고 있습니다...</span>
                </div>
            ) : (
                /* Bottom Box for Brief Listing */
                <div className="w-full bg-[#252525] border border-[#3c3c3c] rounded-[24px] p-[20px] mb-[30px] flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                    {/* Header Row */}
                    <div className="flex justify-between items-center mb-[18px] pb-[12px] border-b border-[#3c3c3c]/80">
                        <div className="flex items-center gap-[10px]">
                            <h2 className="text-[18px] font-bold text-white tracking-tight flex items-center gap-[8px]">
                                <span className="bg-[#2997ff]/10 text-[#2997ff] px-[10px] py-[4px] rounded-[10px] text-[12px] font-bold border border-[#2997ff]/25">PMO 원장</span>
                                <span>{selectedFilter} 현황 목록</span>
                            </h2>
                            <span className="bg-white/5 border border-white/10 px-[8px] py-[2px] rounded-[6px] text-[12px] font-mono text-[#E5E5E5] font-bold">
                                {getFilteredTasks().length}건
                            </span>
                        </div>
                        <button
                            onClick={handleGoToFullPage}
                            className="flex items-center gap-[6px] text-[12px] text-[#2997ff] hover:text-[#5eb0ff] font-bold transition-all px-[12px] py-[6px] bg-[#2997ff]/10 hover:bg-[#2997ff]/20 rounded-[8px] border border-[#2997ff]/20 cursor-pointer"
                        >
                            <span>{selectedFilter === '단발업무' ? '단발업무 요건판 전체 보기' : '통합업무보드에서 전체 보기'}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </button>
                    </div>

                    {/* Table Row */}
                    <div className="max-h-[350px] overflow-y-auto pr-[4px] scrollbar-thin">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#3c3c3c] text-[11.5px] font-bold text-[#86868B] bg-[#1e1e1e]/40 sticky top-0 z-10">
                                    <th className="py-[8px] px-[12px] w-[95px] bg-[#1e1e1e]">프로젝트</th>
                                    <th className="py-[8px] px-[12px] min-w-[200px] bg-[#1e1e1e]">업무명</th>
                                    <th className="py-[8px] px-[12px] w-[130px] bg-[#1e1e1e]">주관부서</th>
                                    <th className="py-[8px] px-[12px] w-[100px] bg-[#1e1e1e]">담당자</th>
                                    <th className="py-[8px] px-[12px] w-[100px] text-center bg-[#1e1e1e]">의사결정필요</th>
                                    <th className="py-[8px] px-[12px] w-[110px] text-center bg-[#1e1e1e]">회의상정등급</th>
                                    <th className="py-[8px] px-[12px] w-[90px] text-center bg-[#1e1e1e]">Blocker</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3c3c3c]/60">
                                {getFilteredTasks().length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-[48px] text-center text-[#86868B] text-[13px]">
                                            조건에 일치하는 업무 항목이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    getFilteredTasks().map(task => {
                                        const hasDecision = task.needs_decision === true || String(task.needs_decision).toLowerCase() === 'true' || String(task.needs_decision).toUpperCase() === 'Y';
                                        const hasBlocker = task.is_blocker === true || String(task.is_blocker).toLowerCase() === 'true' || String(task.is_blocker).toUpperCase() === 'Y';
                                        
                                        return (
                                            <tr 
                                                key={task.id} 
                                                onClick={() => handleTaskClick(task)}
                                                className="hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer group text-[13px] border-b border-[#3c3c3c]/30"
                                            >
                                                <td className="py-[10px] px-[12px] font-semibold text-[#E5E5E5]">
                                                    <span className={`inline-block px-[8px] py-[2px] rounded-[6px] text-[10px] font-bold ${getProjectBadgeStyle(task.project || task.category_main)}`}>
                                                        {task.project || '공통'}
                                                    </span>
                                                </td>
                                                <td className="py-[10px] px-[12px] font-bold text-[#E5E5E5] group-hover:text-white transition-colors truncate max-w-[280px]" title={task.task_name}>
                                                    {task.task_name}
                                                </td>
                                                <td className="py-[10px] px-[12px] text-[#A1A1AA] font-medium truncate max-w-[130px]" title={task.lead_dept}>
                                                    {task.lead_dept || '미정'}
                                                </td>
                                                <td className="py-[10px] px-[12px] text-[#E5E5E5] font-semibold">
                                                    {task.assignee || '미정'}
                                                </td>
                                                <td className="py-[10px] px-[12px] text-center">
                                                    {hasDecision ? (
                                                        <span className="inline-block px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#ff3b30]/10 text-[#ff453a] border border-[#ff3b30]/20">
                                                            필요
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#555]">-</span>
                                                    )}
                                                </td>
                                                <td className="py-[10px] px-[12px] text-center">
                                                    {getMeetingGradeBadge(task.meeting_grade)}
                                                </td>
                                                <td className="py-[10px] px-[12px] text-center">
                                                    {hasBlocker ? (
                                                        <span className="inline-block px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#ff9500]/10 text-[#ff9500] border border-[#ff9500]/20">
                                                            병목
                                                        </span>
                                                    ) : (
                                                        <span className="text-[#555]">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
