import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import {
    getDirectorLogCell,
    getDirectorLogTitle,
    getDirectorStaffCell,
} from '../../utils/directorWorkflowLogs';

const feedFilters = ['전체', '업무 메시지', '단발성 업무'];
const departmentsList = [
    '전체',
    '사업 PM 1',
    '사업 PM 2',
    '파이낸싱-LFC',
    '개발솔루션-DSC',
    '기업마케팅-EMC',
    '공간솔루션-SSC',
    '펀드운용-KAM',
    'IPR-WG',
    '기획추진',
    'CFT 총괄',
];

const getSafeDate = (value) => {
    if (!value) return new Date(0);
    const text = String(value).trim();
    const normalizedValue = /^\d{8}$/.test(text)
        ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T00:00:00+09:00`
        : text;
    const date = new Date(normalizedValue);
    return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

const formatDate = (value) => {
    const date = getSafeDate(value);
    if (date.getTime() === 0) return '';
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
};

const normalizeDepartmentName = (value) => {
    const rawValue = typeof value === 'object' ? value?.dept_name : value;
    const department = String(rawValue || '').trim();
    const normalized = department.toUpperCase();

    if (normalized.includes('PM2') || department.includes('사업관리2파트') || department.includes('사업2파트')) return '사업 PM 2';
    if (normalized.includes('PM1') || department.includes('사업관리1파트') || department.includes('사업1파트')) return '사업 PM 1';
    if (normalized.includes('LFC') || department.includes('파이낸싱')) return '파이낸싱-LFC';
    if (normalized.includes('DEV') || normalized.includes('DSC') || department.includes('개발관리') || department.includes('개발솔루션')) return '개발솔루션-DSC';
    if (normalized.includes('MKT') || normalized.includes('EMC') || department.includes('기업마케팅')) return '기업마케팅-EMC';
    if (normalized.includes('DESIGN') || normalized.includes('SSC') || department.includes('공간솔루션')) return '공간솔루션-SSC';
    if (normalized.includes('FUND') || normalized.includes('KAM') || department.includes('펀드운용')) return '펀드운용-KAM';
    if (normalized.includes('IPR')) return 'IPR-WG';
    if (department.includes('기획추진')) return '기획추진';
    if (normalized.includes('CFT') || department.includes('총괄')) return 'CFT 총괄';
    return department || '공통';
};

const getPopupDepartment = (task) => normalizeDepartmentName(
    task.lead_dept?.dept_name || task.lead_dept || task.lead_dept_code
);

const getCooperationText = (task) => {
    const values = Array.isArray(task.coop_dept_codes)
        ? task.coop_dept_codes
        : String(task.coop_dept_codes || '').split(/[,;/]+/);
    return values.map(normalizeDepartmentName).filter(Boolean);
};

const isWorkspaceMessage = (log) => {
    if (log.metadata?.is_task_board) return false;

    const workspaceCode = String(log.metadata?.workspace_code || '').toUpperCase();
    const workspaceLabel = String(log.metadata?.workspace_label || '');
    if (['WS_PMO', 'WS_POPUP_REQUESTS'].includes(workspaceCode)) return false;
    if (workspaceLabel.includes('단발성 업무 요청')) return false;

    return (
        /^WS_PM[12]?$/.test(workspaceCode)
        || ['WS_LFC', 'WS_DSC', 'WS_EMC', 'WS_SSC', 'WS_KAM', 'WS_IPR'].includes(workspaceCode)
        || /사업\s*PM|파이낸싱|개발솔루션|기업마케팅|공간솔루션|펀드운용|IPR/i.test(workspaceLabel)
    );
};

const getMessageContent = (log) => {
    const rawText = String(log.raw_text || log.body_text || '').trim();
    const title = getDirectorLogTitle(log);
    if (!rawText) return String(log.summary || '').trim();

    const lines = rawText.split('\n');
    if (lines[0]?.trim() === title.trim()) {
        return lines.slice(1).join('\n').trim() || rawText;
    }
    return rawText;
};

export default function MobileCollaborationContainer({ entryRequest, onEntryHandled }) {
    const [selectedFeed, setSelectedFeed] = useState('전체');
    const [selectedDept, setSelectedDept] = useState(entryRequest?.department || '전체');
    const [highlightItemId, setHighlightItemId] = useState(entryRequest?.itemId || null);
    const [loading, setLoading] = useState(true);
    const [workspaceMessages, setWorkspaceMessages] = useState([]);
    const [popupTasks, setPopupTasks] = useState([]);
    const [loadError, setLoadError] = useState('');

    const fetchFeed = useCallback(async ({ showLoading = false } = {}) => {
        if (showLoading) setLoading(true);
        setLoadError('');

        try {
            const [logsResult, popupResult] = await Promise.all([
                supabase
                    .from('iota_seoul_logs')
                    .select('*, iota_seoul_log_stakeholders(sh_name, role_category)')
                    .order('work_date', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(300),
                supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('*, lead_dept:iota_departments!lead_dept_code(dept_name)')
                    .eq('task_type', '팝업')
                    .order('request_date', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(200),
            ]);

            if (logsResult.error) throw logsResult.error;
            if (popupResult.error) throw popupResult.error;

            setWorkspaceMessages((logsResult.data || []).filter(isWorkspaceMessage));
            setPopupTasks(popupResult.data || []);
        } catch (error) {
            console.error('협업 피드 로드 실패:', error);
            setLoadError('협업 내역을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!entryRequest) return;
        setSelectedDept(
            departmentsList.includes(entryRequest.department)
                ? entryRequest.department
                : '전체'
        );
        if (String(entryRequest.itemId || '').startsWith('log-')) {
            setSelectedFeed('업무 메시지');
        }
        setHighlightItemId(entryRequest.itemId || null);
        onEntryHandled?.();
    }, [entryRequest, onEntryHandled]);

    useEffect(() => {
        fetchFeed({ showLoading: true });

        let refreshTimeoutId;
        const scheduleRefresh = () => {
            window.clearTimeout(refreshTimeoutId);
            refreshTimeoutId = window.setTimeout(() => fetchFeed(), 300);
        };

        const messageChannel = supabase
            .channel('mobile-collaboration-messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'iota_seoul_logs',
            }, scheduleRefresh)
            .subscribe();

        const popupChannel = supabase
            .channel('mobile-collaboration-popups')
            .on('postgres_changes', {
                event: '*',
                schema: 'iota_v2',
                table: 'iota_pmo_tasks',
            }, scheduleRefresh)
            .subscribe();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') scheduleRefresh();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.clearTimeout(refreshTimeoutId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            supabase.removeChannel(messageChannel);
            supabase.removeChannel(popupChannel);
        };
    }, [fetchFeed]);

    const unifiedFeed = useMemo(() => {
        const formattedMessages = workspaceMessages.map((log) => {
            const department = getDirectorLogCell(log);
            const stakeholders = (log.iota_seoul_log_stakeholders || [])
                .map((stakeholder) => getDirectorStaffCell(stakeholder.sh_name));
            const dateValue = log.updated_at || log.created_at || log.work_date;

            return {
                id: `log-${log.log_id}`,
                type: '업무 메시지',
                title: getDirectorLogTitle(log),
                content: getMessageContent(log),
                author: log.writer_name || '작성자 미상',
                department,
                relatedDepartments: stakeholders,
                date: getSafeDate(dateValue),
                dateLabel: formatDate(dateValue),
                metadata: log.metadata || {},
            };
        });

        const formattedPopups = popupTasks.map((task) => {
            const department = getPopupDepartment(task);
            const dateValue = task.updated_at || task.request_date || task.created_at;

            return {
                id: `popup-${task.id}`,
                type: '단발성 업무',
                title: task.task_name || '제목 없는 단발성 업무',
                content: task.task_purpose || task.deliverables || task.notes || '등록된 상세 내용이 없습니다.',
                author: task.requester || task.assignee || '요청자 미정',
                department,
                relatedDepartments: getCooperationText(task),
                date: getSafeDate(dateValue),
                dateLabel: formatDate(dateValue),
                metadata: {
                    status: task.status,
                    dueDate: task.due_date,
                    projectCode: task.project_code,
                    deliverables: task.deliverables,
                },
            };
        });

        return [...formattedMessages, ...formattedPopups]
            .filter((item) => selectedFeed === '전체' || item.type === selectedFeed)
            .filter((item) => (
                selectedDept === '전체'
                || item.department === selectedDept
                || item.relatedDepartments.includes(selectedDept)
            ))
            .sort((firstItem, secondItem) => secondItem.date.getTime() - firstItem.date.getTime());
    }, [popupTasks, selectedDept, selectedFeed, workspaceMessages]);

    const feedCounts = useMemo(() => ({
        전체: workspaceMessages.length + popupTasks.length,
        '업무 메시지': workspaceMessages.length,
        '단발성 업무': popupTasks.length,
    }), [popupTasks.length, workspaceMessages.length]);

    useEffect(() => {
        if (!highlightItemId || loading || unifiedFeed.length === 0) return;

        const timerId = window.setTimeout(() => {
            const target = document.getElementById(highlightItemId);
            if (!target) return;
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            window.setTimeout(() => setHighlightItemId(null), 1800);
        }, 120);

        return () => window.clearTimeout(timerId);
    }, [highlightItemId, loading, unifiedFeed]);

    return (
        <div className="w-full flex-1 min-h-0 flex flex-col bg-[#141415] overflow-hidden">
            <div className="flex-none pt-[14px] pb-[10px] border-b border-[#3c3c3c]">
                <div className="px-[16px] mb-[12px]">
                    <h1 className="text-[22px] font-bold text-white tracking-tight leading-tight">협업</h1>
                    <p className="text-[13px] text-[#A1A1AA] mt-1 leading-relaxed">
                        각 조직의 업무 메시지와 단발성 업무 요청을 함께 확인합니다.
                    </p>
                </div>

                <div className="px-[16px] mb-[9px]">
                    <div className="grid grid-cols-3 gap-[6px] p-[4px] rounded-[12px] bg-[#202022] border border-white/[0.07]">
                        {feedFilters.map((filter) => {
                            const isActive = selectedFeed === filter;
                            return (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setSelectedFeed(filter)}
                                    className={`min-w-0 px-[7px] py-[8px] rounded-[9px] text-[12.5px] font-bold transition-colors ${
                                        isActive
                                            ? 'bg-[#3b82f6] text-white'
                                            : 'text-[#A1A1AA] hover:text-white'
                                    }`}
                                >
                                    <span className="block truncate">{filter}</span>
                                    <span className={`block text-[10px] mt-[1px] ${isActive ? 'text-white/80' : 'text-[#636366]'}`}>
                                        {feedCounts[filter]}건
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="w-full overflow-x-auto hide-scrollbar px-[16px]">
                    <div className="flex gap-[7px] min-w-max pb-[2px]">
                        {departmentsList.map((department) => {
                            const isActive = selectedDept === department;
                            return (
                                <button
                                    key={department}
                                    type="button"
                                    onClick={() => setSelectedDept(department)}
                                    className={`px-[14px] py-[7px] rounded-full text-[12.5px] font-bold transition-colors shrink-0 ${
                                        isActive
                                            ? 'bg-white text-black'
                                            : 'bg-[#1A1A1A] text-[#8E8E93] border border-[#3c3c3c]'
                                    }`}
                                >
                                    {department}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-[16px] pt-[14px] pb-[24px]">
                <div className="flex items-center justify-between mb-[10px]">
                    <p className="text-[13px] font-bold text-[#D1D1D6]">
                        {selectedDept === '전체' ? '전체 조직' : selectedDept} · {selectedFeed}
                    </p>
                    <span className="text-[12px] text-[#86868B]">{unifiedFeed.length}건</span>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full" />
                    </div>
                ) : loadError ? (
                    <div className="text-center py-16 text-[#ff6b6b] text-[14px] font-medium border border-dashed border-[#5c3030] rounded-[20px]">
                        <p>{loadError}</p>
                        <button
                            type="button"
                            onClick={() => fetchFeed({ showLoading: true })}
                            className="mt-3 px-4 py-2 rounded-full bg-[#3b82f6] text-white text-[12px] font-bold"
                        >
                            다시 불러오기
                        </button>
                    </div>
                ) : unifiedFeed.length === 0 ? (
                    <div className="text-center py-20 text-[#86868B] text-[14px] font-medium border border-dashed border-[#3c3c3c] rounded-[20px]">
                        선택한 조건의 협업 내역이 없습니다.
                    </div>
                ) : (
                    <div className="flex flex-col gap-[10px]">
                        <AnimatePresence>
                            {unifiedFeed.map((item) => (
                                <motion.article
                                    key={item.id}
                                    id={item.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    className={`bg-[#222223] border rounded-[16px] px-[15px] py-[14px] transition-colors ${
                                        highlightItemId === item.id
                                            ? 'border-[#60a5fa] bg-[#3b82f6]/10'
                                            : 'border-white/[0.08]'
                                    }`}
                                >
                                    <div className="flex items-center gap-[7px] flex-wrap">
                                        <span className={`text-[10.5px] font-bold px-[8px] py-[3px] rounded-[5px] ${
                                            item.type === '단발성 업무'
                                                ? 'bg-[#bf5af2]/15 text-[#da9ff9]'
                                                : 'bg-[#3b82f6]/15 text-[#60a5fa]'
                                        }`}>
                                            {item.type}
                                        </span>
                                        <span className="text-[11.5px] font-bold text-[#C7C7CC]">{item.department}</span>
                                        <span className="text-[11.5px] text-[#6E6E73]">
                                            {item.author} · {item.dateLabel}
                                        </span>
                                    </div>

                                    <h2 className="text-[16px] font-bold text-white mt-[9px] leading-snug break-keep">
                                        {item.title}
                                    </h2>

                                    <p className="text-[13.5px] text-[#A1A1AA] leading-[1.55] whitespace-pre-wrap break-words mt-[7px] line-clamp-4">
                                        {item.content}
                                    </p>

                                    {item.type === '단발성 업무' && (
                                        <div className="flex items-center gap-[6px] flex-wrap mt-[10px] pt-[9px] border-t border-white/[0.06]">
                                            {item.metadata.status && (
                                                <span className="text-[10.5px] font-bold text-[#D1D1D6] bg-white/[0.06] px-[8px] py-[3px] rounded-full">
                                                    {item.metadata.status}
                                                </span>
                                            )}
                                            {item.metadata.dueDate && (
                                                <span className="text-[10.5px] font-bold text-[#ff9f0a] bg-[#ff9f0a]/10 px-[8px] py-[3px] rounded-full">
                                                    기한 {formatDate(item.metadata.dueDate)}
                                                </span>
                                            )}
                                            {item.metadata.projectCode && (
                                                <span className="text-[10.5px] text-[#86868B]">
                                                    {item.metadata.projectCode}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
