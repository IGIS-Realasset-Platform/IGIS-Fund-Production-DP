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
    const [selectedFilter, setSelectedFilter] = React.useState('의사결정 필요');
    const [dbError, setDbError] = React.useState(null);
 
    const calculateAndSetCounts = (taskList) => {
        const parseBool = (v) => v === true || String(v).toLowerCase() === 'true' || String(v).toUpperCase() === 'Y';
 
        const pmoTasks = taskList.filter(t => t.task_type !== '팝업');
        const popupTasks = taskList.filter(t => t.task_type === '팝업');
 
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
    };
 
    React.useEffect(() => {
        async function fetchDashboardData() {
            try {
                setDbError(null);
                // Fetch stats and tasks from staging iota_v2 schema with correct fields and join relationships
                const { data: allTasks, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('id, project_code, task_name, sector_detail, lead_dept_code, lead_dept:iota_departments!lead_dept_code(dept_name), coop_dept_codes, assignee, is_blocker, needs_decision, priority_score, due_date, status, category_main, importance_level, meeting_grade, task_type, support_needed');
 
                if (error) throw error;
 
                const finalTasks = allTasks || [];
                setTasks(finalTasks);
                calculateAndSetCounts(finalTasks);
            } catch (err) {
                console.error("Failed to load dashboard data from database:", err);
                setDbError(err.message || String(err));
                setTasks([]);
                calculateAndSetCounts([]);
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
        const pagePath = task.task_type === '팝업' ? 'platform/iotaseoul/popup-requests' : 'platform/iotaseoul/workflow';
        window.history.pushState(null, '', `${base}/${pagePath}?taskId=${task.id}`);
        window.dispatchEvent(new Event('popstate'));
    };

    const getProjectBadgeStyle = (codeOrProj) => {
        const c = String(codeOrProj || '').toUpperCase();
        if (c.includes('816')) return 'bg-[#c7c7cc]/10 text-[#d1d1d6] border border-[#c7c7cc]/25';
        if (c.includes('421')) return 'bg-[#737373]/15 text-[#a1a1aa] border border-[#737373]/25';
        if (c.includes('427')) return 'bg-[#30b0c7]/15 text-[#5ac8fa] border border-[#30b0c7]/25';
        return 'bg-[#bf5af2]/10 text-[#da9ff9] border border-[#bf5af2]/25'; // Purple for others/common
    };

    const getMeetingGradeBadge = (grade) => {
        if (!grade || grade === '-') return <span className="text-[12px] text-[#555] font-semibold">-</span>;
        const g = String(grade).toUpperCase();
        if (g.includes('A')) {
            return <span className="px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#ff375f]/15 text-[#ff375f] border border-[#ff375f]/25">A_즉시상정</span>;
        }
        if (g.includes('B')) {
            return <span className="px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#8e8e93]/15 text-[#a1a1aa] border border-[#8e8e93]/25">B_회의점검</span>;
        }
        if (g.includes('C')) {
            return <span className="px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#8e8e93]/15 text-[#a1a1aa] border border-[#8e8e93]/25">C_주간관리</span>;
        }
        if (g.includes('D')) {
            return <span className="px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#8e8e93]/15 text-[#a1a1aa] border border-[#8e8e93]/25">D_대기</span>;
        }
        return <span className="px-[6px] py-[1.5px] rounded-[4px] text-[10px] font-bold bg-[#8e8e93]/15 text-[#a1a1aa] border border-[#8e8e93]/25">{grade}</span>;
    };

    const normalizeProjectName = (code) => {
        const c = String(code || '').toUpperCase();
        if (c.includes('PFV_427') || c.includes('427')) return '427 PFV';
        if (c.includes('PFV_816') || c.includes('816')) return '816 PFV';
        if (c.includes('FUND_421') || c.includes('421')) return '421 Fund';
        return '공통';
    };

    const resolveDeptName = (code) => {
        const c = String(code || '').toUpperCase();
        if (c === 'DEPT_LFC' || c.includes('LFC')) return 'LFC';
        if (c === 'DEPT_DEV' || c.includes('DEV') || c.includes('DSC')) return '개발솔루션';
        if (c === 'DEPT_DESIGN' || c.includes('DESIGN') || c.includes('SSC')) return '공간솔루션';
        if (c === 'DEPT_MKT' || c.includes('MKT') || c.includes('EMC')) return '기업마케팅';
        if (c === 'DEPT_PM2' || c.includes('PM2')) return '사업2파트';
        if (c === 'DEPT_PM1' || c.includes('PM1')) return '사업1파트';
        return code || '미정';
    };

    const getTaskDeptName = (t) => {
        const raw = t.lead_dept?.dept_name || t.lead_dept || resolveDeptName(t.lead_dept_code) || '';
        const c = String(raw).toUpperCase().trim();
        if (c.includes('PM2') || c.includes('사업관리2파트') || c.includes('사업2파트')) return '사업2파트';
        if (c.includes('PM1') || c.includes('사업관리1파트') || c.includes('사업1파트')) return '사업1파트';
        if (c.includes('DEV') || c.includes('개발관리실') || c.includes('개발솔루션')) return '개발솔루션';
        if (c.includes('DESIGN') || c.includes('공간솔루션실') || c.includes('공간솔루션')) return '공간솔루션';
        if (c.includes('MKT') || c.includes('기업마케팅실') || c.includes('기업마케팅')) return '기업마케팅';
        if (c.includes('LFC') || c.includes('DEPT_LFC')) return 'LFC';
        return '기타';
    };

    const isCoopDept = (t, deptName) => {
        const coopVal = t.coop_dept_codes || t.coop_depts || '';
        if (!coopVal) return false;
        const coopStr = String(coopVal).toUpperCase();
        if (deptName === '사업2파트') {
            return coopStr.includes('PM2') || coopStr.includes('사업관리2파트') || coopStr.includes('사업2파트');
        }
        if (deptName === '사업1파트') {
            return coopStr.includes('PM1') || coopStr.includes('사업관리1파트') || coopStr.includes('사업1파트');
        }
        if (deptName === '개발솔루션') {
            return coopStr.includes('DEV') || coopStr.includes('개발관리실') || coopStr.includes('개발솔루션');
        }
        if (deptName === '공간솔루션') {
            return coopStr.includes('DESIGN') || coopStr.includes('공간솔루션실') || coopStr.includes('공간솔루션');
        }
        if (deptName === '기업마케팅') {
            return coopStr.includes('MKT') || coopStr.includes('기업마케팅실') || coopStr.includes('기업마케팅');
        }
        if (deptName === 'LFC') {
            return coopStr.includes('LFC');
        }
        return false;
    };

    const isSupportNeededTask = (t) => {
        const fallbackItem = FALLBACK_BOARD_TASKS.find(fb => fb.task_name === t.task_name) || {};
        const val = t.support_needed || fallbackItem.support_needed || '';
        const s = val.trim().toLowerCase();
        const invalidKeywords = ['', '없음', 'n/a', 'na', '해당사항 없음', '해당사항없음', '-', 'none'];
        return s && !invalidKeywords.includes(s);
    };

    const isWithin7DaysOrDelayed = (t) => {
        if (t.status === '지연') return true;
        if (!t.due_date) return false;
        try {
            const today = new Date('2026-07-20');
            const dueDate = new Date(t.due_date);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const activeStatus = t.status !== '완료' && t.status !== '중단';
            return activeStatus && (diffDays <= 7);
        } catch (e) {
            return false;
        }
    };

    const departmentsList = ['사업2파트', '사업1파트', '개발솔루션', '공간솔루션', '기업마케팅', 'LFC'];

    const parseBool = (v) => v === true || String(v).toLowerCase() === 'true' || String(v).toUpperCase() === 'Y';

    const deptRowsData = departmentsList.map(dept => {
        const leadTasks = tasks.filter(t => t.task_type !== '팝업' && getTaskDeptName(t) === dept);
        const coopTasks = tasks.filter(t => t.task_type !== '팝업' && isCoopDept(t, dept));
        
        const leadCount = leadTasks.length;
        const coopCount = coopTasks.length;
        const totalCount = leadCount + coopCount;
        
        const pfCount = leadTasks.filter(t => t.importance_level === 'PF필수').length;
        const constCount = leadTasks.filter(t => t.importance_level === '준공필수').length;
        const blockerCount = leadTasks.filter(t => parseBool(t.is_blocker)).length;
        const decisionCount = leadTasks.filter(t => parseBool(t.needs_decision)).length;
        const supportCount = leadTasks.filter(t => isSupportNeededTask(t)).length;
        const delayedOr7DaysCount = leadTasks.filter(t => isWithin7DaysOrDelayed(t)).length;

        return {
            dept,
            leadCount,
            coopCount,
            totalCount,
            pfCount,
            constCount,
            blockerCount,
            decisionCount,
            supportCount,
            delayedOr7DaysCount
        };
    });

    const maxTotalCount = Math.max(...deptRowsData.map(d => d.totalCount), 1);

    return (
        <div className="w-full flex-1 flex flex-col pt-[24px] pb-[60px] max-w-[1200px] mx-auto select-text">
            {/* Header */}
            <div className="w-full flex justify-between items-start mb-[12px]">
                <div>
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none">IOTA Seoul Main Board</h1>
                </div>
            </div>

            {/* DB Error Banner */}
            {dbError && (
                <div className="w-full bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-[16px] p-4 mb-4 flex items-center justify-between text-left">
                    <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff3b30] animate-pulse" />
                        <div>
                            <p className="text-[13px] font-bold text-white">데이터베이스 연결 및 연동 오류</p>
                            <p className="text-[11.5px] text-[#8e8e93] mt-0.5">{dbError}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Navigation Buttons Grouped Containers - Preserved Original UI Styling */}
            <div className="w-[calc(100%+14px)] ml-[-7px] grid grid-cols-7 gap-[4px] mb-[6px] select-none text-center bg-transparent">
                {/* Box 1: 전체업무 + 완료 (col-span-1) */}
                <div className="col-span-1 border border-[#4b4b4b]/70 rounded-[30px] p-[6px] flex flex-col gap-[6px]">
                    {/* 전체업무 */}
                    {(() => {
                        const btn = upperFilters[0];
                        const isActive = selectedFilter === btn.label;
                        return (
                            <div
                                onClick={() => setSelectedFilter(btn.label)}
                                className={`w-full bg-[#b4b6b5] h-[94px] rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'relative z-20' : 'hover:relative hover:z-20'}`}
                            >
                                <div className={`w-full h-full rounded-[24px] transition-all duration-200 flex flex-col items-center justify-center relative ${isActive ? 'bg-[#d4d7d5] ring-[3px] ring-[#2997ff] ring-inset' : 'bg-transparent group-hover:bg-[#d4d7d5] group-hover:ring-[3px] group-hover:ring-[#2997ff] group-hover:ring-inset'}`}>
                                    <span className="text-[13px] font-bold text-[#3C3C3C] group-hover:text-[#000000] transition-colors duration-200 mb-0.5 flex items-center gap-[4px]">
                                        {btn.label}
                                    </span>
                                    <span className={`text-[32px] font-black leading-none transition-colors duration-200 ${btn.highlightClass} ${btn.hoverClass}`}>
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
                                className={`w-full bg-[#2b2b2b] h-[98px] border rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'relative z-20 border-[#2997ff]' : 'border-[#4b4b4b] hover:relative hover:z-20 hover:border-[#2997ff]'}`}
                            >
                                <div className={`w-full h-full rounded-[24px] transition-all duration-200 flex flex-col items-center justify-center relative ${isActive ? 'bg-[#3e3e3e] ring-[3px] ring-[#2997ff] ring-inset' : 'bg-transparent group-hover:bg-[#3e3e3e] group-hover:ring-[3px] group-hover:ring-[#2997ff] group-hover:ring-inset'}`}>
                                    <span className="text-[13px] font-bold text-[#8E8E93] group-hover:text-[#509FEB] transition-colors duration-200 mb-1 flex items-center gap-[4px]">
                                        {btn.label}
                                    </span>
                                    <span className="text-[32px] font-black text-white group-hover:text-[#509FEB] transition-colors duration-200 leading-none">
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
                                className={`w-full bg-[#b4b6b5] h-[94px] rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'relative z-20' : 'hover:relative hover:z-20'}`}
                            >
                                <div className={`w-full h-full rounded-[24px] transition-all duration-200 flex flex-col items-center justify-center relative ${isActive ? 'bg-[#d4d7d5] ring-[3px] ring-[#2997ff] ring-inset' : 'bg-transparent group-hover:bg-[#d4d7d5] group-hover:ring-[3px] group-hover:ring-[#2997ff] group-hover:ring-inset'}`}>
                                    <span className="text-[13px] font-bold text-[#3C3C3C] group-hover:text-[#000000] transition-colors duration-200 mb-0.5 flex items-center gap-[4px]">
                                        {btn.label}
                                    </span>
                                    <span className={`text-[32px] font-black leading-none transition-colors duration-200 ${btn.highlightClass} ${btn.hoverClass}`}>
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
                                className={`w-full bg-[#2b2b2b] h-[98px] border rounded-[24px] flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'relative z-20 border-[#2997ff]' : 'border-[#4b4b4b] hover:relative hover:z-20 hover:border-[#2997ff]'}`}
                            >
                                <div className={`w-full h-full rounded-[24px] transition-all duration-200 flex flex-col items-center justify-center relative ${isActive ? 'bg-[#3e3e3e] ring-[3px] ring-[#2997ff] ring-inset' : 'bg-transparent group-hover:bg-[#3e3e3e] group-hover:ring-[3px] group-hover:ring-[#2997ff] group-hover:ring-inset'}`}>
                                    <span className="text-[13px] font-bold text-[#8E8E93] group-hover:text-[#509FEB] transition-colors duration-200 mb-1 flex items-center gap-[4px]">
                                        {btn.label}
                                    </span>
                                    <span className="text-[32px] font-black text-white group-hover:text-[#509FEB] transition-colors duration-200 leading-none">
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
                    <div className="grid grid-cols-5 bg-[#b4b6b5] h-[94px] rounded-[24px] divide-x divide-[#8b8b8b]/80 relative">
                        {group3Upper.map((btn, idx) => {
                            const isActive = selectedFilter === btn.label;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedFilter(btn.label)}
                                    className={`p-[6px] h-full flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'relative z-20' : 'hover:relative hover:z-20'}`}
                                >
                                    <div className={`w-full h-full rounded-[20px] transition-all duration-200 flex flex-col items-center justify-center relative ${isActive ? 'bg-[#d4d7d5] ring-[3px] ring-[#2997ff] ring-inset' : 'bg-transparent group-hover:bg-[#d4d7d5] group-hover:ring-[3px] group-hover:ring-[#2997ff] group-hover:ring-inset'}`}>
                                        <span className="text-[13px] font-bold text-[#3C3C3C] group-hover:text-[#000000] transition-colors duration-200 mb-0.5 flex items-center gap-[4px]">
                                            {btn.label}
                                        </span>
                                        <span className={`text-[32px] font-black leading-none transition-colors duration-200 ${btn.highlightClass} ${btn.hoverClass}`}>
                                            {btn.count}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Lower Row Box */}
                    <div className="grid grid-cols-5 bg-[#2b2b2b] h-[98px] border border-[#4b4b4b] rounded-[24px] divide-x divide-[#4b4b4b]/70 relative">
                        {group3Lower.map((btn, idx) => {
                            const isActive = selectedFilter === btn.label;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedFilter(btn.label)}
                                    className={`p-[6px] h-full flex items-center justify-center cursor-pointer group transition-all duration-200 ${isActive ? 'relative z-20' : 'hover:relative hover:z-20'}`}
                                >
                                    <div className={`w-full h-full rounded-[20px] transition-all duration-200 flex flex-col items-center justify-center relative ${isActive ? 'bg-[#3e3e3e] ring-[3px] ring-[#2997ff] ring-inset' : 'bg-transparent group-hover:bg-[#3e3e3e] group-hover:ring-[3px] group-hover:ring-[#2997ff] group-hover:ring-inset'}`}>
                                        <span className="text-[13px] font-bold text-[#8E8E93] group-hover:text-[#509FEB] transition-colors duration-200 mb-1 flex items-center gap-[4px]">
                                            {btn.label}
                                        </span>
                                        <span className="text-[32px] font-black text-white group-hover:text-[#509FEB] transition-colors duration-200 leading-none">
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
                <>
                    {/* Bottom Box for Brief Listing - Card based view */}
                    <div className="w-full border border-[#3c3c3c] rounded-[24px] p-[6px] mb-[30px] flex flex-col">
                        {/* Header Row */}
                        <div className="flex justify-between items-center px-[14px] pt-[6px] pb-[8px]">
                            <div className="flex items-center gap-[10px]">
                                <h2 className="text-[18px] font-bold text-white tracking-tight flex items-center gap-[8px]">
                                    <span>{selectedFilter} 현황 목록</span>
                                </h2>
                            </div>
                            <button
                                onClick={handleGoToFullPage}
                                className="flex items-center gap-[6px] text-[12px] text-[#E5E5E5] hover:text-white font-bold transition-all px-[12px] py-[6px] bg-white/5 hover:bg-white/10 rounded-[8px] border border-white/10 hover:border-white/20 cursor-pointer -translate-y-[2px]"
                            >
                                <span>{selectedFilter === '단발업무' ? '단발업무 요건판 전체 보기' : '통합업무보드에서 전체 보기'}</span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </button>
                        </div>
 
                        {/* Card-based grid row container */}
                        <div className="max-h-[340px] overflow-y-auto pr-[4px] scrollbar-thin">
                            {getFilteredTasks().length === 0 ? (
                                <div className="py-[60px] text-center text-[#86868B] text-[14px]">
                                    조건에 일치하는 업무 항목이 없습니다.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[6px]">
                                    {getFilteredTasks().map(task => {
                                        const hasDecision = task.needs_decision === true || String(task.needs_decision).toLowerCase() === 'true' || String(task.needs_decision).toUpperCase() === 'Y';
                                        const hasBlocker = task.is_blocker === true || String(task.is_blocker).toLowerCase() === 'true' || String(task.is_blocker).toUpperCase() === 'Y';
                                        const projName = normalizeProjectName(task.project_code || task.project);
                                        const deptName = task.lead_dept?.dept_name || task.lead_dept || resolveDeptName(task.lead_dept_code) || '미정';
                                        const fallbackItem = FALLBACK_BOARD_TASKS.find(fb => fb.task_name === task.task_name) || {};
 
                                        return (
                                            <div 
                                                key={task.id} 
                                                onClick={() => handleTaskClick(task)}
                                                className="bg-[#252525] hover:bg-[#2c2c2e] border border-white/[0.06] hover:border-[#2997ff]/40 hover:shadow-[0_4px_20px_rgba(41,151,255,0.06)] transition-all rounded-[20px] p-[20px] cursor-pointer flex flex-col justify-between h-full group"
                                            >
                                                <div className="mb-[16px]">
                                                    {/* Task Name */}
                                                    <h3 className="text-[19px] font-bold text-[#cccaba] leading-snug group-hover:text-white transition-colors truncate" title={task.task_name}>
                                                        {task.task_name}
                                                    </h3>
                                                </div>
 
                                                {/* Bottom line: Lead Department & Sector info */}
                                                <div className="flex items-center justify-between pt-[12px] border-t border-white/[0.06]">
                                                    <div className="flex items-center gap-[10px] text-[13px] text-white/50">
                                                        <div className="flex items-center gap-[4px]">
                                                            <span className="text-white/40 font-medium">주관</span>
                                                            <span className="text-white/80 font-semibold">{deptName}</span>
                                                        </div>
                                                        <span className="text-white/20">|</span>
                                                        <div className="flex items-center gap-[4px]">
                                                            <span className="text-white/40 font-medium">섹터</span>
                                                            <span className="text-white/80 font-semibold">{task.sector_detail || fallbackItem.sector_detail || '공통'}</span>
                                                        </div>
                                                    </div>
                                                    {/* If it's a blocker or decision needed, show a tiny elegant badge */}
                                                    {(hasBlocker || hasDecision) && (
                                                        <div className="flex gap-[6px]">
                                                            {hasBlocker && (
                                                                <span className="flex items-center gap-1 text-[10.5px] font-bold bg-[#ff3b30]/10 text-[#ff453a] border border-[#ff3b30]/15 px-2 py-0.5 rounded-[4px]">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff453a]" />
                                                                    병목
                                                                </span>
                                                            )}
                                                            {hasDecision && (
                                                                <span className="flex items-center gap-1 text-[10.5px] font-bold bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/15 px-2 py-0.5 rounded-[4px]">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffcc00]" />
                                                                    결정
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 부서별 실행 현황 섹션 */}
                    <div className="w-full flex flex-col gap-[8px] mb-[30px] mt-[12px] select-text">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[16px]">
                                <h3 className="text-[20px] font-bold text-white tracking-tight mt-[4px]">부서별 실행 현황</h3>
                                <p className="text-[14px] text-[#A1A1AA] font-medium translate-y-[2px]">주관 부서 및 협업 부서의 업무 현황을 확인 합니다.</p>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="w-full bg-[#252525] border border-[#3c3c3c] rounded-[24px] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1c3c6b] text-[12px] font-bold text-white divide-x divide-[#3c3c3c]/40 border-b border-[#3c3c3c]">
                                        <th className="py-[12px] px-[16px] w-[150px] font-bold text-[#E5E5E5] text-center bg-[#1c3c6b]">부서</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">주관업무</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">협업업무</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5] w-[120px]">총관여</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">PF필수</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">준공필수</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">Blocker</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">의사결정</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">지원요청</th>
                                        <th className="py-[12px] px-[16px] text-center font-bold text-[#E5E5E5]">7일내/지연</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#3c3c3c]/50 text-[13px]">
                                    {deptRowsData.map((row, idx) => {
                                        const percentage = (row.totalCount / maxTotalCount) * 100;
                                        return (
                                            <tr key={idx} className="hover:bg-[#2b2b2b]/40 transition-colors divide-x divide-[#3c3c3c]/30">
                                                {/* 부서 */}
                                                <td className="py-[12px] px-[16px] bg-[#1f2937]/30 text-center font-bold text-[#E5E5E5]">
                                                    {row.dept}
                                                </td>
                                                {/* 주관업무 */}
                                                <td className="py-[12px] px-[16px] text-center text-[#E5E5E5] font-semibold">
                                                    {row.leadCount}
                                                </td>
                                                {/* 협업업무 */}
                                                <td className="py-[12px] px-[16px] text-center text-[#E5E5E5] font-semibold">
                                                    {row.coopCount}
                                                </td>
                                                {/* 총관여 with Gradient Bar chart */}
                                                <td className="py-[12px] px-[16px] text-center font-bold text-white relative">
                                                    <div className="absolute inset-y-[6px] left-[6px] right-[6px] z-0">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-[#2997ff]/20 to-[#2997ff]/40 rounded-[4px]"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="relative z-10">{row.totalCount}</span>
                                                </td>
                                                {/* PF필수 */}
                                                <td className="py-[12px] px-[16px] text-center text-[#E5E5E5] font-medium">
                                                    {row.pfCount}
                                                </td>
                                                {/* 준공필수 */}
                                                <td className="py-[12px] px-[16px] text-center text-[#E5E5E5] font-medium">
                                                    {row.constCount}
                                                </td>
                                                {/* Blocker (Peach background) */}
                                                <td className="py-[12px] px-[16px] text-center font-semibold text-[#ff453a] bg-[#ff3b30]/5">
                                                    {row.blockerCount}
                                                </td>
                                                {/* 의사결정 (Yellow background) */}
                                                <td className="py-[12px] px-[16px] text-center font-semibold text-[#ffcc00] bg-[#ffcc00]/5">
                                                    {row.decisionCount}
                                                </td>
                                                {/* 지원요청 */}
                                                <td className="py-[12px] px-[16px] text-center text-[#E5E5E5] font-medium">
                                                    {row.supportCount}
                                                </td>
                                                {/* 7일내/지연 */}
                                                <td className="py-[12px] px-[16px] text-center text-[#E5E5E5] font-medium">
                                                    {row.delayedOr7DaysCount}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
