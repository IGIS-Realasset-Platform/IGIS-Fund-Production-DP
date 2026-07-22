import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { calculatePmoPriorityScore, normalizePmoTaskPriorityState, parseTaskBoolean } from '../../utils/pmoTaskPriority';
import MobilePmoTaskDetail from './MobilePmoTaskDetail';

const STATUS_OPTIONS = ['전체', '진행중', '미착수', '지연', '완료', '보류', '중단'];

const formatDate = (dateString) => {
    if (!dateString) return '마감 미정';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const getDueLabel = (dateString, status) => {
    if (!dateString || status === '완료') return formatDate(dateString);

    const dueDate = new Date(dateString);
    if (Number.isNaN(dueDate.getTime())) return dateString;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    const difference = Math.round((dueDate.getTime() - today.getTime()) / 86400000);

    if (difference === 0) return 'D-Day';
    if (difference < 0) return `D+${Math.abs(difference)}`;
    return `D-${difference}`;
};

const getStatusClassName = (status) => {
    if (status === '완료') return 'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10';
    if (status === '지연') return 'text-[#f87171] border-[#f87171]/30 bg-[#f87171]/10';
    if (status === '보류') return 'text-[#facc15] border-[#facc15]/30 bg-[#facc15]/10';
    return 'text-[#60a5fa] border-[#60a5fa]/30 bg-[#60a5fa]/10';
};

export default function MobilePmoTaskList({ defaultFilter, onResetFilter }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockerOnly, setBlockerOnly] = useState(false);
    const [decisionOnly, setDecisionOnly] = useState(false);
    const [statusFilter, setStatusFilter] = useState('전체');
    const [selectedTask, setSelectedTask] = useState(null);
    const detailHistoryPushedRef = useRef(false);

    useEffect(() => {
        if (!defaultFilter) return;

        setBlockerOnly(defaultFilter === 'Blocker');
        setDecisionOnly(defaultFilter === 'Decision');
        setStatusFilter(defaultFilter === 'Delay' ? '지연' : defaultFilter === 'Pending' ? '보류' : '전체');
    }, [defaultFilter]);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);

            try {
                const { data, error } = await supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select(`
                        *,
                        lead_dept:iota_departments!lead_dept_code(dept_name),
                        external_party:iota_stakeholders!external_party_code(stakeholder_name)
                    `)
                    .neq('task_type', '팝업')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setTasks((data || [])
                    .filter((task) => task.task_type !== '팝업')
                    .map((task) => normalizePmoTaskPriorityState(task)));
            } catch (error) {
                console.error('Failed to fetch PMO tasks:', error);
                setTasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    useEffect(() => {
        if (tasks.length === 0) return;

        const syncTaskFromUrl = () => {
            const taskId = new URLSearchParams(window.location.search).get('taskId');
            if (!taskId) detailHistoryPushedRef.current = false;
            setSelectedTask(taskId ? tasks.find((task) => String(task.id) === String(taskId)) || null : null);
        };

        syncTaskFromUrl();
        window.addEventListener('popstate', syncTaskFromUrl);
        return () => window.removeEventListener('popstate', syncTaskFromUrl);
    }, [tasks]);

    const filteredTasks = useMemo(() => tasks.filter((task) => {
        if (blockerOnly && !parseTaskBoolean(task.is_blocker)) return false;
        if (decisionOnly && !parseTaskBoolean(task.needs_decision)) return false;
        if (statusFilter !== '전체' && (task.status || '진행중') !== statusFilter) return false;
        return true;
    }), [tasks, blockerOnly, decisionOnly, statusFilter]);

    const sortedTasks = useMemo(() => [...filteredTasks].sort((firstTask, secondTask) => (
        calculatePmoPriorityScore(secondTask) - calculatePmoPriorityScore(firstTask)
    )), [filteredTasks]);

    const resetFilters = () => {
        setBlockerOnly(false);
        setDecisionOnly(false);
        setStatusFilter('전체');
        onResetFilter?.();
    };

    const openTaskDetail = (task) => {
        const url = new URL(window.location.href);
        url.searchParams.set('taskId', task.id);
        window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
        detailHistoryPushedRef.current = true;
        setSelectedTask(task);
    };

    const closeTaskDetail = () => {
        if (detailHistoryPushedRef.current) {
            detailHistoryPushedRef.current = false;
            window.history.back();
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('taskId');
        window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
        setSelectedTask(null);
    };

    const priorityIsActive = !blockerOnly && !decisionOnly && statusFilter === '전체';

    return (
        <div className="flex flex-col w-full h-full min-h-0 bg-[#111111]">
            <div className="shrink-0 border-b border-[#3c3c3c]/40 bg-[#111111]">
                <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto hide-scrollbar">
                    <button
                        type="button"
                        onClick={resetFilters}
                        className={`h-8 px-2.5 rounded-[9px] text-[11px] font-bold whitespace-nowrap border transition-colors ${priorityIsActive ? 'text-white bg-[#3c3c3c] border-[#555]' : 'text-[#A1A1AA] bg-[#1A1A1A] border-[#3c3c3c]'}`}
                    >
                        우선순위 ↓
                    </button>
                    <button
                        type="button"
                        onClick={() => setBlockerOnly((active) => !active)}
                        className={`h-8 px-2.5 rounded-[9px] text-[11px] font-bold whitespace-nowrap border transition-colors ${blockerOnly ? 'text-[#f87171] bg-[#f87171]/10 border-[#f87171]/40' : 'text-[#A1A1AA] bg-[#1A1A1A] border-[#3c3c3c]'}`}
                    >
                        Blocker
                    </button>
                    <button
                        type="button"
                        onClick={() => setDecisionOnly((active) => !active)}
                        className={`h-8 px-2.5 rounded-[9px] text-[11px] font-bold whitespace-nowrap border transition-colors ${decisionOnly ? 'text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/40' : 'text-[#A1A1AA] bg-[#1A1A1A] border-[#3c3c3c]'}`}
                    >
                        의사결정필요
                    </button>
                    <label className={`relative h-8 px-2.5 rounded-[9px] text-[11px] font-bold whitespace-nowrap border flex items-center gap-1 ${statusFilter !== '전체' ? 'text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/40' : 'text-[#A1A1AA] bg-[#1A1A1A] border-[#3c3c3c]'}`}>
                        <span>{statusFilter === '전체' ? '상태' : statusFilter}</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0"
                            aria-label="업무 상태 선택"
                        >
                            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </label>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 pb-6 flex flex-col gap-2 hide-scrollbar">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin w-7 h-7 border-[3px] border-[#3b82f6] border-t-transparent rounded-full" />
                    </div>
                ) : sortedTasks.length === 0 ? (
                    <div className="text-center py-20 text-[#86868B] text-[14px] font-medium">
                        조건에 맞는 통합업무가 없습니다.
                    </div>
                ) : sortedTasks.map((task) => {
                    const isBlocker = parseTaskBoolean(task.is_blocker);
                    const needsDecision = parseTaskBoolean(task.needs_decision);
                    const priorityScore = calculatePmoPriorityScore(task);
                    const leadDepartment = task.lead_dept?.dept_name || task.lead_dept || task.lead_dept_code || '주관 미정';

                    return (
                        <button
                            key={task.id}
                            type="button"
                            onClick={() => openTaskDetail(task)}
                            className="shrink-0 w-full text-left bg-[#272726] rounded-[16px] px-4 py-2.5 border border-[#3c3c3c]/60 relative overflow-hidden active:bg-[#30302f] active:scale-[0.995] transition-all"
                        >
                            {(isBlocker || needsDecision) && (
                                <span className={`absolute left-0 top-0 bottom-0 w-1 ${isBlocker ? 'bg-[#f87171]' : 'bg-[#fb923c]'}`} />
                            )}

                            <div className="flex items-center justify-between gap-3 mb-1.5">
                                <div className="flex min-w-0 items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-[#60a5fa] truncate">{task.project_code || '전사'}</span>
                                    {isBlocker && <span className="text-[9px] font-bold text-[#f87171] bg-[#f87171]/10 px-1.5 py-0.5 rounded-[5px] border border-[#f87171]/20">Blocker</span>}
                                    {needsDecision && <span className="text-[9px] font-bold text-[#fb923c] bg-[#fb923c]/10 px-1.5 py-0.5 rounded-[5px] border border-[#fb923c]/20">의사결정</span>}
                                </div>
                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 border rounded-full ${getStatusClassName(task.status)}`}>
                                    {task.status || '진행중'}
                                </span>
                            </div>

                            <h3 className="text-[16px] font-bold text-white leading-[1.35] line-clamp-2 break-keep">
                                {task.task_name || '제목 없음'}
                            </h3>

                            <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3 text-[11px]">
                                <div className="min-w-0 flex items-center gap-2 text-[#A1A1AA]">
                                    <span className={`font-bold ${priorityScore >= 70 ? 'text-[#f87171]' : priorityScore >= 50 ? 'text-[#facc15]' : 'text-[#A1A1AA]'}`}>
                                        우선 {priorityScore}
                                    </span>
                                    <span className="text-white/20">·</span>
                                    <span className="truncate">{leadDepartment}</span>
                                </div>
                                <span className={`shrink-0 font-bold ${task.status === '지연' ? 'text-[#f87171]' : 'text-[#D1D1D6]'}`}>
                                    {getDueLabel(task.due_date, task.status)} <span className="font-normal text-[#86868B]">{formatDate(task.due_date)}</span>
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {selectedTask && <MobilePmoTaskDetail task={selectedTask} onClose={closeTaskDetail} />}
        </div>
    );
}
