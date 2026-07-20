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
    const [recentLogs, setRecentLogs] = React.useState([]);
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

                // 3. Fetch recent logs from Supabase
                const { data: recentLogsData } = await supabase
                    .schema('iota_v2')
                    .from('iota_seoul_logs')
                    .select('log_id, writer_name, work_date, summary, raw_text, created_at, metadata')
                    .order('created_at', { ascending: false })
                    .limit(10);
                
                if (recentLogsData) setRecentLogs(recentLogsData);

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

    const milestones = [
        { title: '심의 접수', date: '2026-08-01' },
        { title: 'PF 실행', date: '2026-08-20' },
        { title: '착공 심사', date: '2026-10-15' },
        { title: '준공 예정', date: '2028-03-31' }
    ];

    const calculateDDay = (targetDateStr) => {
        const target = new Date(targetDateStr);
        const today = new Date();
        target.setHours(0,0,0,0);
        today.setHours(0,0,0,0);
        const diffTime = target.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Calculate Project Health Score (Starting from 100, subtracting score for blockers/delays percentage)
    const delayedPercentage = counts.total ? (counts.delayed / counts.total) * 100 : 0;
    const blockerPercentage = counts.total ? (counts.blockers / counts.total) * 100 : 0;
    const healthScore = Math.max(0, Math.round(100 - (delayedPercentage * 0.5) - (blockerPercentage * 0.8)));

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

            {loading ? (
                <div className="w-full h-[300px] flex items-center justify-center border border-[#333] rounded-[24px]">
                    <span className="text-[#86868B] text-[15px] animate-pulse">데이터를 집계하고 있습니다...</span>
                </div>
            ) : (
                <div className="w-full flex flex-col">
                    {/* Milestone Timeline (D-Day Banner) */}
                    <div className="bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 mb-6 text-left">
                        <h3 className="text-[16px] font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#2997ff] animate-pulse"></span>
                            핵심 개발 사업 마일스톤 타임라인 (D-Day)
                        </h3>
                        <div className="relative flex justify-between items-center w-full px-4 pt-4 pb-2">
                            <div className="absolute left-[30px] right-[30px] top-[30px] h-[3px] bg-[#3c3c3c] z-0"></div>
                            <div className="absolute left-[30px] top-[30px] h-[3px] bg-gradient-to-r from-[#2997ff] to-[#30d158] z-0" style={{ width: '38%' }}></div>
                            
                            {milestones.map((m, idx) => {
                                const dDay = calculateDDay(m.date);
                                const isPast = dDay < 0;
                                const dDayText = dDay === 0 ? 'D-Day' : dDay > 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`;
                                return (
                                    <div key={idx} className="relative z-10 flex flex-col items-center select-none">
                                        <div className={`w-[18px] h-[18px] rounded-full border-4 flex items-center justify-center transition-all ${
                                            isPast 
                                                ? 'bg-[#30d158] border-[#272726]' 
                                                : dDay <= 35 
                                                    ? 'bg-[#ef4444] border-[#272726] animate-pulse' 
                                                    : 'bg-[#272726] border-[#555]'
                                        }`} />
                                        <span className="text-[12px] font-bold text-white mt-2.5">{m.title}</span>
                                        <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded ${
                                            isPast 
                                                ? 'bg-[#30d158]/10 text-[#30d158]' 
                                                : dDay <= 35 
                                                    ? 'bg-[#ef4444]/10 text-[#ef4444]' 
                                                    : 'text-[#86868B]'
                                        }`}>
                                            {dDayText} ({m.date.slice(5)})
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Split Layout: Health Dashboard (7) & Activity Feed (3) */}
                    <div className="w-full grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6 text-left">
                        {/* Left 70%: Health Score & Gate Distribution */}
                        <div className="flex flex-col gap-6">
                            {/* Card 1: Health Index Gauge & Feedback */}
                            <div className="bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex flex-col md:flex-row gap-6 items-center">
                                <div className="flex flex-col items-center justify-center shrink-0">
                                    <span className="text-[12px] font-bold text-[#86868B] uppercase tracking-wider mb-4 text-center">프로젝트 건강도 지수</span>
                                    <div className="relative w-[130px] h-[130px] flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="65"
                                                cy="65"
                                                r="55"
                                                className="stroke-current text-white/5"
                                                strokeWidth="10"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="65"
                                                cy="65"
                                                r="55"
                                                className={`stroke-current ${
                                                    healthScore >= 80 
                                                        ? 'text-[#30d158]' 
                                                        : healthScore >= 50 
                                                            ? 'text-[#F59E0B]' 
                                                            : 'text-[#ef4444]'
                                                }`}
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={345.5}
                                                strokeDashoffset={345.5 - (345.5 * healthScore) / 100}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className="text-[30px] font-black text-white font-mono leading-none">{healthScore}</span>
                                            <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-wider mt-1">Health Index</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full flex flex-col justify-center">
                                    <h4 className="text-[16px] font-bold text-white mb-2">실시간 리스크 진단 피드백</h4>
                                    <p className="text-[13px] text-[#86868B] leading-relaxed mb-4 break-keep">
                                        {healthScore >= 85 
                                            ? '현재 프로젝트 건강도가 우수합니다. Blocker와 지연 안건이 원활히 관리되고 있으며 마일스톤이 정상 범위에서 흐르고 있습니다.' 
                                            : healthScore >= 65 
                                                ? '주의 단계입니다. 의사결정이 필요하거나 지연된 안건이 적체되기 시작하여, 회의체를 통한 의사결정 속도 촉진이 권장됩니다.' 
                                                : '위험 수준입니다. 다수의 Blocker 병목 현상이 누적되어 준공 또는 PF 일정 지연 리스크가 매우 큽니다. 즉각적인 지원이 시급합니다.'
                                        }
                                    </p>
                                    
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[12px] font-bold text-white">
                                            <span>지연 업무 비율</span>
                                            <span className="font-mono text-[#ef4444]">{Math.round(delayedPercentage)}%</span>
                                        </div>
                                        <div className="w-full bg-[#1c1c1e] h-2 rounded-full overflow-hidden">
                                            <div className="bg-[#ef4444] h-full" style={{ width: `${delayedPercentage}%` }}></div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-[12px] font-bold text-white mt-1">
                                            <span>병목 (Blocker) 비율</span>
                                            <span className="font-mono text-[#ef4444]">{Math.round(blockerPercentage)}%</span>
                                        </div>
                                        <div className="w-full bg-[#1c1c1e] h-2 rounded-full overflow-hidden">
                                            <div className="bg-[#ef4444] h-full" style={{ width: `${blockerPercentage}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        {/* Right 30%: Activity Feed */}
                        <div className="bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-6 flex flex-col h-[400px] lg:h-auto min-h-[350px]">
                            <h3 className="text-[16px] font-bold text-white mb-4 flex items-center justify-between">
                                <span>업데이트 이력 피드</span>
                                <span className="text-[10px] bg-[#30d158]/10 text-[#30d158] border border-[#30d158]/20 px-2 py-0.5 rounded font-mono">LIVE</span>
                            </h3>
                            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 max-h-[360px] overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#3c3c3c] [&::-webkit-scrollbar-thumb]:rounded-full">
                                {recentLogs.length === 0 ? (
                                    <div className="text-center py-10 text-[#86868B] text-[13px] my-auto">
                                        최근 변경 이력이 없습니다.
                                    </div>
                                ) : (
                                    recentLogs.map((log, idx) => (
                                        <div key={idx} className="bg-[#1c1c1e]/60 border border-[#3c3c3c]/40 rounded-xl p-3 flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-[#2997ff]">{log.writer_name || '시스템'}</span>
                                                <span className="text-[#86868B] font-mono">{log.work_date}</span>
                                            </div>
                                            <div className="text-[12px] font-bold text-white text-left truncate">
                                                {log.metadata?.workspace_label || '통합업무보드'}
                                            </div>
                                            <p className="text-[11px] text-[#86868B] leading-relaxed whitespace-pre-line text-left line-clamp-3">
                                                {log.raw_text}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
