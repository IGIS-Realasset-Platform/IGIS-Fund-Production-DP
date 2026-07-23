import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../utils/supabaseClient';
import { fetchDirectorWorkflowLogs } from '../../../utils/directorWorkflowLogs';
import {
    buildMobileMyActivities,
    filterMobileMyActivities,
} from '../../../utils/mobileMyActivity';

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

const workspacePathMap = {
    WS_PM1: 'platform/iotaseoul/workspace/pm1',
    WS_PM2: 'platform/iotaseoul/workspace/pm2',
    WS_LFC: 'platform/iotaseoul/workspace/financing',
    WS_FINANCING: 'platform/iotaseoul/workspace/financing',
    WS_DSC: 'platform/iotaseoul/workspace/development',
    WS_DEVELOPMENT: 'platform/iotaseoul/workspace/development',
    WS_EMC: 'platform/iotaseoul/workspace/marketing',
    WS_MARKETING: 'platform/iotaseoul/workspace/marketing',
    WS_SSC: 'platform/iotaseoul/workspace/digital',
    WS_DIGITAL: 'platform/iotaseoul/workspace/digital',
    WS_KAM: 'platform/iotaseoul/workspace/fund',
    WS_FUND: 'platform/iotaseoul/workspace/fund',
    WS_IPR: 'platform/iotaseoul/workspace/ipr',
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

const getStaffTitle = (memberInfo) => {
    const name = memberInfo?.staff_name;
    if (!name) return '사용자';

    const titles = {
        '이철승': '부문대표',
        '윤관식': '부대표',
        '정조민': '부대표',
        '우형석': '그룹장',
        '권순일': '파트장',
        '강순용': '파트장',
        '윤주형': 'Sr.Manager',
        '한찬호': 'Sr.Manager',
        '박준호': '센터장',
        '강석민': 'Sr.Manager',
        '정리훈': 'Sr.Manager',
        '홍장군': '센터장',
        '채원': '담당',
        '김대익': '마스터',
        '장성진': '마스터',
        '김보성': '마스터',
        '박봉서': '전문위원',
        '이정훈': '담당',
        '김민지': 'Sr.Manager',
        '김현수': '센터장',
        '이가현': '리더',
        '이시정': '리더',
        '현철호': '그룹장',
        '홍창의': '파트장',
        '신민호': 'Sr.Manager',
        '김행단': '그룹장',
        '윤용택': 'Sr.Manager',
    };

    return `${name} ${titles[name] || '매니저'}`;
};

export default function IotaMyPage() {
    const { user, memberInfo } = useAuth();
    const [activeTab, setActiveTab] = useState('posts');
    const [searchQuery, setSearchQuery] = useState('');
    const [dbLogs, setDbLogs] = useState([]);
    const [directorLogs, setDirectorLogs] = useState([]);
    const [pmoTasks, setPmoTasks] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadWarning, setLoadWarning] = useState('');

    const identityInfo = useMemo(() => ({
        ...memberInfo,
        email: memberInfo?.email || user?.email || '',
    }), [memberInfo, user?.email]);

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
            console.error('PC 마이 활동 로드 실패:', error);
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
            .channel('desktop-my-logs')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'iota_seoul_logs',
            }, scheduleRefresh)
            .subscribe();

        const tasksChannel = supabase
            .channel('desktop-my-tasks')
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
        memberInfo: identityInfo,
    }), [dbLogs, directorLogs, identityInfo, pmoTasks]);

    const filteredActivities = useMemo(
        () => filterMobileMyActivities(activities[activeTab] || [], searchQuery),
        [activeTab, activities, searchQuery]
    );

    const navigateToPath = (path, params = {}) => {
        const base = import.meta.env.BASE_URL.endsWith('/')
            ? import.meta.env.BASE_URL.slice(0, -1)
            : import.meta.env.BASE_URL;
        const query = new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
        ).toString();
        window.history.pushState(null, '', `${base}/${path}${query ? `?${query}` : ''}`);
        window.dispatchEvent(new Event('popstate'));
    };

    const canOpenOriginal = (activity) => {
        if (activity.sourceUrl) return true;
        if (activity.navigationType === 'task' || activity.navigationType === 'popup') return Boolean(activity.taskId);
        if (activity.navigationType !== 'workspace') return false;
        const workspaceCode = String(activity.workspaceCode || '').toUpperCase();
        return Boolean(workspacePathMap[workspaceCode] || workspaceCode === 'WS_PM');
    };

    const handleOpenOriginal = (activity) => {
        if (activity.sourceUrl) {
            window.open(activity.sourceUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        if (activity.navigationType === 'task' && activity.taskId) {
            navigateToPath('platform/iotaseoul/workflow', { taskId: activity.taskId });
            return;
        }

        if (activity.navigationType === 'popup' && activity.taskId) {
            navigateToPath('platform/iotaseoul/popup-requests', { taskId: activity.taskId });
            return;
        }

        if (activity.navigationType === 'workspace') {
            const workspaceCode = String(activity.workspaceCode || '').toUpperCase();
            const fallbackPmPath = activity.department === '사업 PM 2'
                ? 'platform/iotaseoul/workspace/pm2'
                : 'platform/iotaseoul/workspace/pm1';
            const workspacePath = workspacePathMap[workspaceCode]
                || (workspaceCode === 'WS_PM' ? fallbackPmPath : null);
            if (!workspacePath) return;

            localStorage.setItem('iota_target_log_id', activity.logId);
            navigateToPath(workspacePath, { logId: activity.logId });
        }
    };

    const handleDeletePost = async (activity) => {
        if (activity.kind !== 'post' || activity.recordType !== 'db-log' || !activity.logId) return;
        if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

        try {
            await supabase.from('iota_seoul_log_links').delete().eq('log_id', activity.logId);
            await supabase.from('iota_seoul_log_stakeholders').delete().eq('log_id', activity.logId);
            const { error } = await supabase
                .from('iota_seoul_logs')
                .delete()
                .eq('log_id', activity.logId);
            if (error) throw error;

            setSelectedActivity(null);
            await fetchAllActivities();
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            window.alert('게시글 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#111111] font-sans text-white overflow-hidden">
            <aside className="w-[280px] shrink-0 h-full bg-[#222222] border-r border-[#333333] flex flex-col">
                <div className="p-6 border-b border-[#333333]">
                    <button
                        type="button"
                        onClick={() => navigateToPath('platform/iotaseoul/workflow')}
                        className="flex items-center gap-2 text-[13px] text-[#A1A1AA] hover:text-white mb-4 border border-[#3c3c3c] hover:bg-[#333333] px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        통합업무보드
                    </button>

                    <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border border-[#333333] rounded-[16px]">
                        <div className="w-[42px] h-[42px] rounded-full bg-[#c3c2b7] text-[#1F1F1E] flex items-center justify-center text-[14px] font-bold overflow-hidden shrink-0">
                            {identityInfo.staff_name ? (
                                <img
                                    src={`${import.meta.env.BASE_URL}${identityInfo.staff_name}.webp`}
                                    alt={identityInfo.staff_name}
                                    className="w-full h-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[14px] font-bold text-white truncate">{getStaffTitle(identityInfo)}</p>
                            <p className="text-[11px] text-[#86868B] truncate mt-0.5">{identityInfo.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 flex flex-col gap-2">
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
                                className={`w-full px-4 py-3 rounded-[10px] flex items-center justify-between border transition-colors ${
                                    isActive
                                        ? 'bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/30'
                                        : 'text-[#D1D1D6] border-transparent hover:bg-[#333333]'
                                }`}
                            >
                                <span className="text-[13.5px] font-bold">{tab.label}</span>
                                <span className={`text-[11px] ${isActive ? 'text-[#60a5fa]' : 'text-[#636366]'}`}>
                                    {activities[tab.id]?.length || 0}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-[#333333]">
                    <p className="text-[11px] font-bold text-[#A1A1AA]">통합 조회 범위</p>
                    <p className="text-[11px] leading-relaxed text-[#636366] mt-1">
                        통합업무 상세 글 · 단발성 업무 · 워크스페이스 게시글 · Director 보고 · 모든 상세 댓글
                    </p>
                </div>
            </aside>

            <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
                <header className="shrink-0 px-10 py-6 border-b border-[#333333] bg-[#1A1A1A]/95">
                    <div className="max-w-[1280px] flex items-center justify-between gap-8">
                        <div>
                            <h1 className="text-[28px] font-bold tracking-tight">
                                {tabs.find((tab) => tab.id === activeTab)?.label}
                                <span className="ml-3 text-[16px] font-normal text-[#86868B]">
                                    {filteredActivities.length}건
                                </span>
                            </h1>
                            <p className="text-[12px] text-[#86868B] mt-1">
                                로그인 계정이 조회할 수 있는 모든 업무 활동을 통합합니다.
                            </p>
                        </div>

                        <div className="relative w-[420px]">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="제목, 본문, 작성자, 업무명 검색"
                                className="w-full bg-[#222222] border border-[#3c3c3c] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#60a5fa] transition-colors"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </header>

                <section className="flex-1 min-h-0 overflow-y-auto px-10 py-7 custom-scrollbar">
                    <div className="max-w-[1280px]">
                        {loadWarning && (
                            <div className="mb-5 rounded-[12px] border border-[#ff9f0a]/25 bg-[#ff9f0a]/10 px-4 py-3 flex items-center justify-between gap-4">
                                <p className="text-[12px] text-[#ffb340]">{loadWarning}</p>
                                <button
                                    type="button"
                                    onClick={() => fetchAllActivities({ showLoading: true })}
                                    className="px-3 py-1.5 rounded-full bg-[#ff9f0a] text-black text-[11px] font-bold"
                                >
                                    재조회
                                </button>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="py-20 text-[14px] text-[#86868B] animate-pulse">데이터를 불러오는 중입니다...</div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="py-20 text-center text-[14px] text-[#86868B] border border-dashed border-[#3c3c3c] rounded-[20px]">
                                선택한 조건의 활동이 없습니다.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {filteredActivities.map((activity) => (
                                    <button
                                        key={activity.id}
                                        type="button"
                                        onClick={() => setSelectedActivity(activity)}
                                        className="w-full min-h-[210px] text-left bg-[#222223] border border-[#3c3c3c] hover:border-[#555555] hover:bg-[#292929] rounded-[18px] p-5 transition-colors flex flex-col"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10.5px] font-bold px-2 py-1 rounded-[6px] border ${getSourceStyle(activity.sourceType)}`}>
                                                {activity.sourceLabel}
                                            </span>
                                            {activity.contextLabel && (
                                                <span className="text-[11px] font-semibold text-[#A1A1AA]">{activity.contextLabel}</span>
                                            )}
                                            <span className="ml-auto text-[11px] text-[#636366]">{formatDate(activity.dateValue)}</span>
                                        </div>

                                        {activity.contextTitle && activity.contextTitle !== activity.title && (
                                            <p className="text-[11px] font-bold text-[#60a5fa] mt-4 line-clamp-1">
                                                {activity.contextTitle}
                                            </p>
                                        )}

                                        <h2 className="text-[17px] font-bold text-white leading-snug mt-2 line-clamp-2">
                                            {activity.title}
                                        </h2>

                                        <p className="text-[13.5px] text-[#A1A1AA] leading-[1.6] whitespace-pre-wrap break-words mt-2 line-clamp-4">
                                            {activity.content || '등록된 내용이 없습니다.'}
                                        </p>

                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <span className="text-[12px] font-bold text-[#D1D1D6]">{activity.authorName}</span>
                                            <span className="text-[11px] font-bold text-[#60a5fa]">내용 보기</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <AnimatePresence>
                {selectedActivity && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-8 bg-black/75 backdrop-blur-sm">
                        <motion.div
                            className="w-full max-w-[760px] max-h-[84vh] bg-[#1C1C1E] border border-[#3c3c3c] rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.97 }}
                        >
                            <div className="shrink-0 px-6 py-4 border-b border-[#333333] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10.5px] font-bold px-2 py-1 rounded-[6px] border ${getSourceStyle(selectedActivity.sourceType)}`}>
                                        {selectedActivity.sourceLabel}
                                    </span>
                                    <span className="text-[11px] text-[#86868B]">{formatDate(selectedActivity.dateValue, true)}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedActivity(null)}
                                    className="w-8 h-8 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-y-auto px-7 py-6 custom-scrollbar">
                                {selectedActivity.contextTitle && selectedActivity.contextTitle !== selectedActivity.title && (
                                    <div className="mb-5 rounded-[12px] border border-[#3b82f6]/20 bg-[#3b82f6]/10 px-4 py-3">
                                        <span className="block text-[10.5px] font-bold text-[#60a5fa]">원문 위치</span>
                                        <span className="block text-[13px] font-bold text-[#D1D1D6] mt-1">
                                            {selectedActivity.contextTitle}
                                        </span>
                                    </div>
                                )}

                                <h2 className="text-[24px] font-bold text-white leading-snug">{selectedActivity.title}</h2>
                                <div className="flex items-center gap-3 mt-3 text-[12px]">
                                    <span className="font-bold text-[#D1D1D6]">{selectedActivity.authorName}</span>
                                    <span className="text-[#636366]">{selectedActivity.authorEmail}</span>
                                    {selectedActivity.contextLabel && (
                                        <span className="text-[#86868B]">· {selectedActivity.contextLabel}</span>
                                    )}
                                </div>

                                <div className="mt-5 rounded-[16px] border border-white/[0.08] bg-[#222223] px-5 py-5">
                                    <p className="text-[14.5px] text-[#D1D1D6] leading-[1.7] whitespace-pre-wrap break-words">
                                        {selectedActivity.content || '등록된 내용이 없습니다.'}
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 px-6 py-4 border-t border-[#333333] flex items-center justify-between">
                                <div>
                                    {selectedActivity.kind === 'post' && selectedActivity.recordType === 'db-log' && (
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePost(selectedActivity)}
                                            className="px-4 py-2.5 rounded-[10px] border border-[#ff453a]/25 bg-[#ff453a]/10 text-[#ff6b6b] text-[12px] font-bold"
                                        >
                                            게시글 삭제
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedActivity(null)}
                                        className="px-5 py-2.5 rounded-[10px] bg-[#2c2c2e] text-white text-[12px] font-bold"
                                    >
                                        닫기
                                    </button>
                                    {canOpenOriginal(selectedActivity) && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenOriginal(selectedActivity)}
                                            className="px-5 py-2.5 rounded-[10px] bg-[#3b82f6] text-white text-[12px] font-bold"
                                        >
                                            원문 보기
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
