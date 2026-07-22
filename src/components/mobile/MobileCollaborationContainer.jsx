import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { getInitialWorkspace } from './mobileIotaData';
import { motion, AnimatePresence } from 'framer-motion';

const departmentsList = [
    '전체', '사업 PM 1', '사업 PM 2', '파이낸싱-LFC', '개발솔루션-DSC', 
    '기업마케팅-EMC', '공간솔루션-SSC', '펀드운용-KAM', 'IPR-WG', '기획추진', 'CFT 총괄'
];

export default function MobileCollaborationContainer({ memberInfo }) {
    const [selectedDept, setSelectedDept] = useState('전체');
    const [loading, setLoading] = useState(true);
    const [seoulLogs, setSeoulLogs] = useState([]);
    const [pmoTasks, setPmoTasks] = useState([]);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // 1. Fetch iota_seoul_logs (단발성업무 + 워크스페이스 게시글)
                const { data: logsData, error: logsError } = await supabase
                    .from('iota_seoul_logs')
                    .select('*, iota_seoul_log_stakeholders(sh_name, role_category)')
                    .order('work_date', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(200); // 넉넉히 가져옴
                
                if (logsError) throw logsError;

                // 2. Fetch iota_pmo_tasks (통합업무)
                const { data: tasksData, error: tasksError } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('id, project_code, task_name, sector_detail, lead_dept_code, lead_dept:iota_departments!lead_dept_code(dept_name), coop_dept_codes, assignee, is_blocker, needs_decision, priority_score, due_date, status, category_main, importance_level, meeting_grade, task_type, support_needed, created_at')
                    .neq('task_type', '팝업')
                    .order('created_at', { ascending: false })
                    .limit(200);

                if (tasksError) {
                    console.error("Task load error:", tasksError);
                    throw tasksError;
                }

                setSeoulLogs(logsData || []);
                setPmoTasks(tasksData || []);
            } catch (error) {
                console.error("데이터 로드 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const getCellName = (name) => {
        const cells = {
            '전기영': '기획추진', '이시정': '기획추진', '이관용': '기획추진',
            '이철승': 'CFT 총괄', '윤관식': 'CFT 총괄', '정조민': 'CFT 총괄', '우형석': 'CFT 총괄',
            '권순일': '사업 PM 1', '윤주형': '사업 PM 1', '김제익': '사업 PM 1', '류홍': '사업 PM 1', '박만진': '사업 PM 1', '박일훈': '사업 PM 1', '이정원': '사업 PM 1', '전무경': '사업 PM 1',
            '강순용': '사업 PM 2', '한찬호': '사업 PM 2', '박석제': '사업 PM 2', '박채현': '사업 PM 2', '소현준': '사업 PM 2', '이수정': '사업 PM 2', '조영비': '사업 PM 2', '한수정': '사업 PM 2',
            '박준호': '파이낸싱-LFC', '강석민': '파이낸싱-LFC', '정리훈': '파이낸싱-LFC', '손유정': '파이낸싱-LFC', '김지우': '파이낸싱-LFC', '박현승': '파이낸싱-LFC', '이성민A': '파이낸싱-LFC', '한승환': '파이낸싱-LFC',
            '홍장군': '개발솔루션-DSC', '채원': '개발솔루션-DSC', '김보성': '개발솔루션-DSC', '전승희': '개발솔루션-DSC', '김대익': '개발솔루션-DSC', '장성진': '개발솔루션-DSC', '이정훈': '개발솔루션-DSC', '박봉서': '개발솔루션-DSC', '김형주': '개발솔루션-DSC',
            '김민지': '기업마케팅-EMC', '고아라': '기업마케팅-EMC',
            '김현수': '공간솔루션-SSC', '현철호': '공간솔루션-SSC', '신민호': '공간솔루션-SSC', '이가현': '공간솔루션-SSC', '정수명': '공간솔루션-SSC',
            '김행단': '펀드운용-KAM', '윤용택': 'IPR-WG'
        };
        return cells[name] || '공통';
    };

    const getLogCell = (log) => {
        if (log.metadata?.workspace_code) {
            const code = log.metadata.workspace_code.toUpperCase();
            if (code === 'WS_PM1' || code === 'PM1' || code === 'PM_1') return '사업 PM 1';
            if (code === 'WS_PM2' || code === 'PM2' || code === 'PM_2') return '사업 PM 2';
            if (code === 'WS_PM' || code === 'PM') {
                return getCellName(log.writer_name) === '사업 PM 2' ? '사업 PM 2' : '사업 PM 1';
            }
            if (code.includes('FINANCING') || code.includes('LFC')) return '파이낸싱-LFC';
            if (code.includes('DEVELOPMENT') || code.includes('DSC')) return '개발솔루션-DSC';
            if (code.includes('MARKETING') || code.includes('EMC')) return '기업마케팅-EMC';
            if (code.includes('DIGITAL') || code.includes('SSC')) return '공간솔루션-SSC';
            if (code.includes('FUND') || code.includes('KAM')) return '펀드운용-KAM';
            if (code.includes('IPR')) return 'IPR-WG';
        }
        return getCellName(log.writer_name);
    };

    const resolveDeptName = (code) => {
        const c = String(code || '').toUpperCase();
        if (c === 'DEPT_LFC' || c.includes('LFC')) return '파이낸싱-LFC';
        if (c === 'DEPT_DEV' || c.includes('DEV') || c.includes('DSC')) return '개발솔루션-DSC';
        if (c === 'DEPT_DESIGN' || c.includes('DESIGN') || c.includes('SSC')) return '공간솔루션-SSC';
        if (c === 'DEPT_MKT' || c.includes('MKT') || c.includes('EMC')) return '기업마케팅-EMC';
        if (c === 'DEPT_PM2' || c.includes('PM2')) return '사업 PM 2';
        if (c === 'DEPT_PM1' || c.includes('PM1')) return '사업 PM 1';
        return code || '기타';
    };

    const getTaskDeptName = (t) => {
        const raw = t.lead_dept?.dept_name || t.lead_dept || resolveDeptName(t.lead_dept_code) || '';
        const c = String(raw).toUpperCase().trim();
        if (c.includes('PM2') || c.includes('사업관리2파트') || c.includes('사업2파트')) return '사업 PM 2';
        if (c.includes('PM1') || c.includes('사업관리1파트') || c.includes('사업1파트')) return '사업 PM 1';
        if (c.includes('DEV') || c.includes('개발관리실') || c.includes('개발솔루션') || c.includes('DSC')) return '개발솔루션-DSC';
        if (c.includes('DESIGN') || c.includes('공간솔루션실') || c.includes('공간솔루션') || c.includes('SSC')) return '공간솔루션-SSC';
        if (c.includes('MKT') || c.includes('기업마케팅실') || c.includes('기업마케팅') || c.includes('EMC')) return '기업마케팅-EMC';
        if (c.includes('LFC') || c.includes('DEPT_LFC')) return '파이낸싱-LFC';
        return '기타';
    };

    const isCoopDept = (t, deptName) => {
        const coopVal = t.coop_dept_codes || t.coop_depts || '';
        if (!coopVal) return false;
        const coopStr = String(coopVal).toUpperCase();
        if (deptName === '사업 PM 2') return coopStr.includes('PM2') || coopStr.includes('사업관리2파트') || coopStr.includes('사업2파트');
        if (deptName === '사업 PM 1') return coopStr.includes('PM1') || coopStr.includes('사업관리1파트') || coopStr.includes('사업1파트');
        if (deptName === '개발솔루션-DSC') return coopStr.includes('DEV') || coopStr.includes('개발관리실') || coopStr.includes('개발솔루션') || coopStr.includes('DSC');
        if (deptName === '공간솔루션-SSC') return coopStr.includes('DESIGN') || coopStr.includes('공간솔루션실') || coopStr.includes('공간솔루션') || coopStr.includes('SSC');
        if (deptName === '기업마케팅-EMC') return coopStr.includes('MKT') || coopStr.includes('기업마케팅실') || coopStr.includes('기업마케팅') || coopStr.includes('EMC');
        if (deptName === '파이낸싱-LFC') return coopStr.includes('LFC');
        return false;
    };

    const unifiedFeed = useMemo(() => {
        let filteredLogs = seoulLogs;
        let filteredTasks = pmoTasks;

        if (selectedDept !== '전체') {
            filteredLogs = seoulLogs.filter(log => {
                const logCell = getLogCell(log);
                const stakeholders = (log.iota_seoul_log_stakeholders || []).map(s => s.sh_name);
                const isStakeholder = stakeholders.some(sh => getCellName(sh) === selectedDept);
                return logCell === selectedDept || isStakeholder;
            });

            filteredTasks = pmoTasks.filter(t => {
                return getTaskDeptName(t) === selectedDept || isCoopDept(t, selectedDept);
            });
        }

        const formattedLogs = filteredLogs.map(log => ({
            id: `log-${log.log_id}`,
            originalId: log.log_id,
            type: 'log',
            date: new Date(log.work_date || log.created_at),
            title: log.metadata?.issue_status ? `[${log.metadata.issue_status}] ${log.metadata.workspace_label || '공통'}` : '단발성 / 워크스페이스 보고',
            content: log.raw_text,
            author: log.writer_name,
            dept: getLogCell(log),
            metadata: log.metadata || {},
            raw: log
        }));

        const formattedTasks = filteredTasks.map(t => ({
            id: `task-${t.id}`,
            originalId: t.id,
            type: 'task',
            date: new Date(t.updated_at || t.created_at),
            title: `[PMO 통합업무] ${t.task_name}`,
            content: t.support_needed || '통합업무 진행사항이 공유되었습니다.',
            author: t.assignee || 'PMO',
            dept: getTaskDeptName(t),
            metadata: {
                status: t.status,
                importance: t.importance_level,
                blocker: t.is_blocker
            },
            raw: t
        }));

        const merged = [...formattedLogs, ...formattedTasks];
        merged.sort((a, b) => b.date.getTime() - a.date.getTime());
        return merged;
    }, [seoulLogs, pmoTasks, selectedDept]);

    const formatDate = (d) => {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '';
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${mm}.${dd}`;
    };

    return (
        <div className="w-full flex-1 min-h-0 flex flex-col bg-[#141415] overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex-none pt-[16px] pb-[8px] border-b border-[#3c3c3c]">
                <div className="px-[16px] mb-[12px]">
                    <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight">
                        부서별 통합 협업 피드
                    </h1>
                    <p className="text-[13px] text-[#86868B] mt-1">
                        주관 및 지원하는 모든 통합업무와 단발성 보고를 확인합니다.
                    </p>
                </div>
                
                {/* Horizontal Scrollable Tabs */}
                <div className="w-full overflow-x-auto hide-scrollbar px-[16px]">
                    <div className="flex gap-[8px] min-w-max pb-[4px]">
                        {departmentsList.map(dept => {
                            const isActive = selectedDept === dept;
                            return (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDept(dept)}
                                    className={`px-[16px] py-[8px] rounded-full text-[13.5px] font-bold transition-all shrink-0 ${
                                        isActive
                                            ? 'bg-white text-black shadow-sm'
                                            : 'bg-[#1A1A1A]/60 text-[#8E8E93] border border-[#3c3c3c] hover:bg-[#2c2c2e]'
                                    }`}
                                >
                                    {dept}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Feed List */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[16px] pt-[16px] pb-[24px]">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                    </div>
                ) : unifiedFeed.length === 0 ? (
                    <div className="text-center py-20 text-[#86868B] text-[14.5px] font-medium border border-dashed border-[#3c3c3c] rounded-[24px]">
                        해당 조직의 협업 활동 내역이 없습니다.
                    </div>
                ) : (
                    <div className="flex flex-col gap-[12px]">
                        <AnimatePresence>
                            {unifiedFeed.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-[#222223] border border-white/[0.08] rounded-[16px] p-[16px] flex flex-col gap-[10px]"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] ${
                                                    item.type === 'task' ? 'bg-[#bf5af2]/15 text-[#da9ff9]' : 'bg-[#3b82f6]/15 text-[#60a5fa]'
                                                }`}>
                                                    {item.type === 'task' ? 'PMO 통합업무' : '단발성 보고'}
                                                </span>
                                                <span className="text-[12px] text-[#86868B] font-medium">
                                                    {item.author} • {formatDate(item.date)}
                                                </span>
                                            </div>
                                            <h3 className="text-[15px] font-bold text-white mt-1 leading-snug break-keep">
                                                {item.title}
                                            </h3>
                                        </div>
                                    </div>
                                    
                                    <div className="text-[14px] text-[#A1A1AA] leading-relaxed whitespace-pre-wrap break-words bg-[#1a1a1c] p-3 rounded-[12px] border border-white/[0.04]">
                                        {item.content || '내용이 없습니다.'}
                                    </div>

                                    {/* Task specific badges */}
                                    {item.type === 'task' && item.metadata && (
                                        <div className="flex gap-2 mt-1">
                                            {item.metadata.status && (
                                                <span className="text-[11px] font-bold text-[#86868B] bg-[#333] px-2 py-0.5 rounded-full">
                                                    {item.metadata.status}
                                                </span>
                                            )}
                                            {item.metadata.blocker && (
                                                <span className="text-[11px] font-bold text-[#ff453a] bg-[#ff3b30]/15 px-2 py-0.5 rounded-full">
                                                    병목 (Blocker)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
