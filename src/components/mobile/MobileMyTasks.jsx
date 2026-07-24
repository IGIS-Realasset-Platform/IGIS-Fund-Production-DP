import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { fetchDirectorWorkflowLogs } from '../../utils/directorWorkflowLogs';
import {
    buildMobileMyActivities,
    filterMobileMyActivities,
} from '../../utils/mobileMyActivity';

const tabs = [
    { id: 'posts', label: '내가 쓴 글' },
    { id: 'comments', label: '내가 쓴 댓글' },
    { id: 'mentions', label: '언급된 글' },
];

const sourceStyles = {
    task: 'bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/25',
    popup: 'bg-[#bf5af2]/15 text-[#d8a4f8] border-[#bf5af2]/25',
    workspace: 'bg-[#30d158]/10 text-[#4ade80] border-[#30d158]/20',
    director: 'bg-[#ff9f0a]/10 text-[#ffb340] border-[#ff9f0a]/20',
    other: 'bg-white/[0.06] text-[#C7C7CC] border-white/[0.1]',
};

const getSafeDate = (value) => {
    if (!value) return null;
    const text = String(value).trim();
    const normalizedValue = /^\d{8}$/.test(text)
        ? `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T00:00:00+09:00`
        : text;
    const date = new Date(normalizedValue);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value, includeTime = false) => {
    const date = getSafeDate(value);
    if (!date) return '';
    const year = String(date.getFullYear()).slice(2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    if (!includeTime) return `${year}.${month}.${day}`;
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hour}:${minute}`;
};

const getSourceStyle = (sourceType) => sourceStyles[sourceType] || sourceStyles.other;

const fetchAllPages = async (queryFactory, pageSize = 1000) => {
    const rows = [];
    let offset = 0;

    while (true) {
        const { data, error } = await queryFactory(offset, offset + pageSize - 1);
        if (error) return { data: rows, error };

        const pageRows = data || [];
        rows.push(...pageRows);
        if (pageRows.length < pageSize) return { data: rows, error: null };
        offset += pageSize;
    }
};

export default function MobileMyTasks({ memberInfo, onNavigateToSource }) {
    const [activeTab, setActiveTab] = useState('posts');
    const [searchQuery, setSearchQuery] = useState('');
    const [dbLogs, setDbLogs] = useState([]);
    const [directorLogs, setDirectorLogs] = useState([]);
    const [pmoTasks, setPmoTasks] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadWarning, setLoadWarning] = useState('');

    const fetchAllActivities = useCallback(async ({ showLoading = false } = {}) => {
        if (showLoading) setIsLoading(true);

        const warnings = [];

        try {
            const [logsResult, tasksResult, fetchedDirectorLogs] = await Promise.all([
                fetchAllPages((from, to) => supabase
                    .from('iota_seoul_logs')
                    .select('*, iota_seoul_log_stakeholders(sh_name, role_category)')
                    .order('work_date', { ascending: false })
                    .order('created_at', { ascending: false })
                    .range(from, to)),
                fetchAllPages((from, to) => supabase
                    .schema('iota_v2')
                    .from('iota_pmo_tasks')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .range(from, to)),
                fetchDirectorWorkflowLogs({ force: true }).catch((error) => {
                    console.error('Director 업무보고 로드 실패:', error);
                    warnings.push('Director 업무보고');
                    return [];
                }),
            ]);

            if (logsResult.error) {
                console.error('게시글 및 댓글 로드 실패:', logsResult.error);
                warnings.push('게시글·댓글');
            } else {
                setDbLogs(logsResult.data || []);
            }

            if (tasksResult.error) {
                console.error('통합·단발성 업무 로드 실패:', tasksResult.error);
                warnings.push('통합·단발성 업무');
            } else {
                setPmoTasks(tasksResult.data || []);
            }

            setDirectorLogs(fetchedDirectorLogs);
            setLoadWarning(
                warnings.length > 0
                    ? `${warnings.join(', ')} 일부를 불러오지 못했습니다.`
                    : ''
            );
        } catch (error) {
            console.error('마이 활동 로드 실패:', error);
            setLoadWarning('마이 활동을 불러오지 못했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllActivities({ showLoading: true });

        let refreshTimeoutId;
        const scheduleRefresh = () => {
            window.clearTimeout(refreshTimeoutId);
            refreshTimeoutId = window.setTimeout(() => fetchAllActivities(), 300);
        };

        const logsChannel = supabase
            .channel('mobile-my-logs')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'iota_seoul_logs',
            }, scheduleRefresh)
            .subscribe();

        const tasksChannel = supabase
            .channel('mobile-my-tasks')
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
            supabase.removeChannel(logsChannel);
            supabase.removeChannel(tasksChannel);
        };
    }, [fetchAllActivities]);

    const activities = useMemo(() => buildMobileMyActivities({
        dbLogs,
        directorLogs,
        pmoTasks,
        memberInfo,
    }), [dbLogs, directorLogs, memberInfo, pmoTasks]);

    const filteredActivities = useMemo(
        () => filterMobileMyActivities(activities[activeTab] || [], searchQuery),
        [activeTab, activities, searchQuery]
    );

    const handleOpenOriginal = (activity) => {
        if (!activity?.navigationType || !onNavigateToSource) return;
        setSelectedActivity(null);
        onNavigateToSource(activity);
    };

    return (
        <div className="flex flex-col w-full min-h-full bg-[#1F1F1E] pb-24">
            <div className="sticky top-0 z-20 shrink-0 bg-[#272726]/95 backdrop-blur-xl border-b border-[#3c3c3c] px-4 pt-3 pb-2.5">
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1A1A1A] rounded-[14px]">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setSearchQuery('');
                                }}
                                className={`py-2 rounded-[10px] transition-colors ${
                                    isActive
                                        ? 'bg-[#3b82f6] text-white'
                                        : 'text-[#86868B]'
                                }`}
                            >
                                <span className="block text-[12.5px] font-bold">{tab.label}</span>
                                <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[#636366]'}`}>
                                    {activities[tab.id]?.length || 0}건
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full mt-2.5">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="제목, 본문, 작성자, 업무명 검색"
                        className="w-full bg-[#1A1A1A] border border-[#3c3c3c] text-white text-[13px] px-3.5 py-2 pl-9 rounded-[12px] outline-none focus:border-[#60a5fa] transition-colors"
                    />
                    <svg className="w-3.5 h-3.5 absolute left-3.5 top-[11px] text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {loadWarning && (
                <div className="px-4 pt-3">
                    <div className="rounded-[12px] border border-[#ff9f0a]/25 bg-[#ff9f0a]/10 px-3 py-2.5 flex items-center justify-between gap-3">
                        <p className="text-[11.5px] text-[#ffb340] leading-relaxed">{loadWarning}</p>
                        <button
                            type="button"
                            onClick={() => fetchAllActivities({ showLoading: true })}
                            className="shrink-0 px-2.5 py-1.5 rounded-full bg-[#ff9f0a] text-black text-[10.5px] font-bold"
                        >
                            재조회
                        </button>
                    </div>
                </div>
            )}

            <div className="px-4 pt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#A1A1AA]">
                        {tabs.find((tab) => tab.id === activeTab)?.label}
                    </span>
                    <span className="text-[12px] text-[#6E6E73]">{filteredActivities.length}건</span>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full" />
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="text-center py-20 text-[#86868B] text-[14px] font-medium border border-dashed border-[#3c3c3c] rounded-[20px]">
                        선택한 조건의 활동이 없습니다.
                    </div>
                ) : (
                    filteredActivities.map((activity) => (
                        <button
                            key={activity.id}
                            type="button"
                            onClick={() => setSelectedActivity(activity)}
                            className="w-full text-left bg-[#272726] border border-[#3c3c3c] rounded-[16px] px-4 py-3.5 active:bg-[#30302f] transition-colors"
                        >
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-[3px] rounded-[5px] border ${getSourceStyle(activity.sourceType)}`}>
                                    {activity.sourceLabel}
                                </span>
                                {activity.contextLabel && (
                                    <span className="text-[10.5px] font-semibold text-[#A1A1AA]">
                                        {activity.contextLabel}
                                    </span>
                                )}
                                <span className="ml-auto text-[10.5px] text-[#6E6E73]">
                                    {formatDate(activity.dateValue)}
                                </span>
                            </div>

                            {activity.contextTitle && activity.contextTitle !== activity.title && (
                                <p className="text-[11px] text-[#60a5fa] font-bold mt-2 line-clamp-1">
                                    {activity.contextTitle}
                                </p>
                            )}

                            <h2 className="text-[15.5px] font-bold text-white leading-snug mt-1.5 line-clamp-2 break-keep">
                                {activity.title}
                            </h2>

                            <p className="text-[13px] text-[#A1A1AA] leading-[1.55] whitespace-pre-wrap break-words mt-1.5 line-clamp-4">
                                {activity.content || '등록된 내용이 없습니다.'}
                            </p>

                            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/[0.06]">
                                <span className="text-[11.5px] font-semibold text-[#C7C7CC]">
                                    {activity.authorName}
                                </span>
                                <span className="text-[11px] font-bold text-[#60a5fa]">내용 보기</span>
                            </div>
                        </button>
                    ))
                )}
            </div>

            <AnimatePresence>
                {selectedActivity && (
                    <motion.div
                        className="fixed inset-0 z-[2147483647] flex h-[100dvh] flex-col bg-[#111111] text-[#E5E5E5]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <header
                            className="shrink-0 border-b border-[#3c3c3c] bg-[#1A1A1A]/95 backdrop-blur-xl"
                            style={{ paddingTop: 'env(safe-area-inset-top)' }}
                        >
                            <div className="h-11 px-3 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setSelectedActivity(null)}
                                    className="h-8 px-2 rounded-[9px] flex items-center gap-0.5 bg-[#2997ff] text-white"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    <span className="text-[12px] font-bold">마이</span>
                                </button>
                                <span className="text-[14px] font-bold">활동 상세</span>
                                <span className="w-[58px]" />
                            </div>
                        </header>

                        <main
                            className="flex-1 min-h-0 overflow-y-auto px-4 pt-4"
                            style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
                        >
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10.5px] font-bold px-2 py-1 rounded-[6px] border ${getSourceStyle(selectedActivity.sourceType)}`}>
                                    {selectedActivity.sourceLabel}
                                </span>
                                {selectedActivity.contextLabel && (
                                    <span className="text-[11px] text-[#A1A1AA]">{selectedActivity.contextLabel}</span>
                                )}
                                <span className="ml-auto text-[11px] text-[#86868B]">
                                    {formatDate(selectedActivity.dateValue, true)}
                                </span>
                            </div>

                            {selectedActivity.contextTitle && selectedActivity.contextTitle !== selectedActivity.title && (
                                <div className="mt-4 rounded-[12px] border border-[#3b82f6]/20 bg-[#3b82f6]/10 px-3 py-2.5">
                                    <span className="block text-[10px] font-bold text-[#60a5fa]">원문 위치</span>
                                    <span className="block text-[13px] font-bold text-[#D1D1D6] mt-1">
                                        {selectedActivity.contextTitle}
                                    </span>
                                </div>
                            )}

                            <h1 className="text-[21px] font-bold text-white leading-snug mt-5 break-keep">
                                {selectedActivity.title}
                            </h1>

                            <div className="flex items-center justify-between mt-3 text-[12px]">
                                <span className="font-bold text-[#D1D1D6]">{selectedActivity.authorName}</span>
                                <span className="text-[#86868B]">{selectedActivity.authorEmail}</span>
                            </div>

                            <div className="mt-4 rounded-[16px] border border-white/[0.08] bg-[#1A1A1A] px-4 py-4">
                                <p className="text-[14px] text-[#D1D1D6] leading-[1.65] whitespace-pre-wrap break-words">
                                    {selectedActivity.content || '등록된 내용이 없습니다.'}
                                </p>
                            </div>

                            {selectedActivity.navigationType && onNavigateToSource && (
                                <button
                                    type="button"
                                    onClick={() => handleOpenOriginal(selectedActivity)}
                                    className="w-full mt-4 py-3.5 rounded-[13px] bg-[#3b82f6] text-white text-[13px] font-bold"
                                >
                                    모바일 원문 보기
                                </button>
                            )}
                        </main>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
