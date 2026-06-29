import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMyTasks({ memberInfo }) {
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'comments' | 'mentions'
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Popups States
    const [selectedLog, setSelectedLog] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('error'); // 'error' | 'success'

    const myName = memberInfo?.staff_name || memberInfo?.name || '';
    const myEmail = memberInfo?.email || '';

    useEffect(() => {
        fetchIotaLogs();
    }, []);

    const fetchIotaLogs = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Edge Function API Logs
            let apiLogs = [];
            try {
                const response = await fetch('https://qvegpozwrcmspdvjokiz.supabase.co/functions/v1/iota-logs');
                if (response.ok) {
                    const apiData = await response.json();
                    if (apiData && apiData.logs) {
                        apiLogs = apiData.logs.map(log => ({
                            ...log,
                            line: getLogCell(log)
                        }));
                    }
                }
            } catch (apiErr) {
                console.error('Error fetching API logs:', apiErr);
            }

            // 2. Fetch Supabase DB logs
            let dbLogs = [];
            try {
                const { data: dbData, error: dbError } = await supabase
                    .from('iota_seoul_logs')
                    .select('*, iota_seoul_log_stakeholders(sh_name, role_category)')
                    .order('work_date', { ascending: false })
                    .order('created_at', { ascending: false });

                if (dbError) throw dbError;
                if (dbData) {
                    dbLogs = dbData;
                }
            } catch (dbErr) {
                console.error('Error fetching DB logs:', dbErr);
            }

            // 3. Map DB Logs to match API schema
            const mappedDbLogs = dbLogs.map(log => {
                const line = getLogCell(log);

                return {
                    id: log.log_id || log.id,
                    work_date: log.work_date,
                    writer_name: log.writer_name || '익명',
                    writer_email: log.writer_staff_id || log.writer_email || '',
                    writer_staff_id: log.writer_staff_id || log.writer_email || '',
                    title: log.summary || log.title || '업무 로그',
                    summary: log.summary || '',
                    raw_text: log.raw_text || log.body_text || '',
                    body_text: log.raw_text || log.body_text || '',
                    line: line,
                    metadata: {
                        workspace_code: log.metadata?.workspace_code || '',
                        workspace_label: log.metadata?.workspace_label || '공통',
                        project_name: log.metadata?.project_name || '',
                        triage_type: log.metadata?.triage_type || '',
                        issue_status: log.metadata?.issue_status || '',
                        priority: log.metadata?.priority || '',
                        comments: log.metadata?.comments || [],
                        stakeholders: log.iota_seoul_log_stakeholders || []
                    },
                    source_url: log.source_url || null,
                    created_at: log.created_at
                };
            });

            // 4. Merge data (deduplicate by id)
            const mergedLogsMap = new Map();
            apiLogs.forEach(l => {
                if (l.id) mergedLogsMap.set(l.id, l);
            });
            mappedDbLogs.forEach(l => {
                if (l.id) mergedLogsMap.set(l.id, l);
            });

            const allLogs = Array.from(mergedLogsMap.values());
            const sortedLogs = allLogs.sort((a, b) => {
                const dateA = a.work_date ? new Date(a.work_date).getTime() : 0;
                const dateB = b.work_date ? new Date(b.work_date).getTime() : 0;
                return dateB - dateA;
            });

            setLogs(sortedLogs);
        } catch (err) {
            console.error('Error merging logs in mobile:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm('정말로 이 업무 로그를 삭제하시겠습니까?')) return;
        
        try {
            await supabase.from('iota_seoul_log_links').delete().eq('log_id', logId);
            await supabase.from('iota_seoul_log_stakeholders').delete().eq('log_id', logId);
            
            const { error } = await supabase.from('iota_seoul_logs').delete().eq('log_id', logId);
            if (error) throw error;
            
            setLogs(prev => prev.filter(l => l.id !== logId));
            if (selectedLog && selectedLog.id === logId) {
                setSelectedLog(null);
            }
            setAlertType('success');
            setAlertMessage('성공적으로 삭제되었습니다.');
        } catch (err) {
            console.error('Error deleting log:', err);
            setAlertType('error');
            setAlertMessage('삭제 처리 중 오류가 발생했습니다.');
        }
    };

    const handleGoToWorkspace = async (log) => {
        if (log.source_url) {
            window.open(log.source_url, '_blank');
            return;
        }

        const wsCode = log.metadata?.workspace_code;
        if (!wsCode) {
            setAlertType('error');
            setAlertMessage('원본 게시물로 이동할 수 없습니다. 원본 위치 정보가 올바르지 않거나 이미 삭제되었을 수 있습니다.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('iota_seoul_logs')
                .select('log_id')
                .eq('log_id', log.id)
                .maybeSingle();

            if (error || !data) {
                setAlertType('error');
                setAlertMessage('해당 업무 로그는 이미 삭제되어 원본 게시물로 이동할 수 없습니다.');
                setLogs(prev => prev.map(l => l.id === log.id ? { ...l, isDeleted: true } : l));
                return;
            }
        } catch (err) {
            console.error('Error verifying log:', err);
        }

        const pathMap = {
            'WS_PM': 'pm',
            'WS_LFC': 'financing',
            'WS_FINANCING': 'financing',
            'WS_DSC': 'development',
            'WS_DEVELOPMENT': 'development',
            'WS_EMC': 'marketing',
            'WS_MARKETING': 'marketing',
            'WS_SSC': 'digital',
            'WS_DIGITAL': 'digital',
            'WS_KAM': 'fund',
            'WS_FUND': 'fund',
            'WS_IPR': 'ipr'
        };

        const wsPath = pathMap[wsCode];
        if (wsPath) {
            localStorage.setItem('iota_target_log_id', log.id);
            localStorage.setItem('force_pc_mode', 'true');
            const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
            window.history.pushState(null, '', `${base}/platform/iotaseoul/workspace/${wsPath}?logId=${log.id}`);
            window.dispatchEvent(new Event('popstate'));
        } else {
            setAlertType('error');
            setAlertMessage('원본 게시물로 이동할 수 없습니다. 해당 원본 글이 이미 삭제되었거나 위치를 찾을 수 없습니다.');
        }
    };

    const formatExactDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const yearStr = String(d.getFullYear()).slice(-2);
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        return `${yearStr}.${monthStr}.${dayStr}`;
    };

    const getCellName = (name) => {
        const cells = {
            '전기영': '기획추진', '이시정': '기획추진', '이관용': '기획추진',
            '이철승': 'CFT 총괄', '윤관식': 'CFT 총괄', '정조민': 'CFT 총괄', '우형석': 'CFT 총괄',
            '권순일': '사업 PM', '강순용': '사업 PM', '윤주형': '사업 PM', '김제익': '사업 PM', '류홍': '사업 PM', '박만진': '사업 PM', '박일훈': '사업 PM', '이정원': '사업 PM', '전무경': '사업 PM', '한찬호': '사업 PM', '박석제': '사업 PM', '박채현': '사업 PM', '소현준': '사업 PM', '이수정': '사업 PM', '조영비': '사업 PM', '한수정': '사업 PM',
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
            if (code.includes('PM')) return '사업 PM';
            if (code.includes('FINANCING') || code.includes('LFC')) return '파이낸싱-LFC';
            if (code.includes('DEVELOPMENT') || code.includes('DSC')) return '개발솔루션-DSC';
            if (code.includes('MARKETING') || code.includes('EMC')) return '기업마케팅-EMC';
            if (code.includes('DIGITAL') || code.includes('SSC')) return '공간솔루션-SSC';
            if (code.includes('FUND') || code.includes('KAM')) return '펀드운용-KAM';
            if (code.includes('IPR')) return 'IPR-WG';
        }
        if (log.metadata?.workspace_label) {
            const lbl = log.metadata.workspace_label;
            if (lbl.includes('사업 PM') || lbl.includes('사업PM')) return '사업 PM';
            if (lbl.includes('파이낸싱')) return '파이낸싱-LFC';
            if (lbl.includes('개발솔루션')) return '개발솔루션-DSC';
            if (lbl.includes('기업마케팅')) return '기업마케팅-EMC';
            if (lbl.includes('공간솔루션') || lbl.includes('상품/디지털') || lbl.includes('상품·디지털')) return '공간솔루션-SSC';
            if (lbl.includes('펀드운용')) return '펀드운용-KAM';
            if (lbl.includes('IPR')) return 'IPR-WG';
        }
        return getCellName(log.writer_name);
    };

    const getLineBadgeStyle = (cell) => {
        const norm = (cell || '').replace(/\s+/g, '').toUpperCase();
        if (norm.includes('PM')) {
            return 'bg-[#30d158]/10 text-[#34d399] border border-[#30d158]/20'; // Green
        } else if (norm.includes('LFC') || norm.includes('파이낸싱')) {
            return 'bg-[#0a84ff]/10 text-[#60a5fa] border border-[#0a84ff]/20'; // Blue
        } else if (norm.includes('DSC') || norm.includes('개발솔루션')) {
            return 'bg-[#ffd60a]/10 text-[#fbbf24] border border-[#ffd60a]/20'; // Yellow
        } else if (norm.includes('EMC') || norm.includes('기업마케팅')) {
            return 'bg-[#ff375f]/10 text-[#ff6b8b] border border-[#ff375f]/20'; // Rose/Pink
        } else if (norm.includes('SSC') || norm.includes('공간솔루션')) {
            return 'bg-[#30b0c7]/10 text-[#5ac8fa] border border-[#30b0c7]/20'; // Cyan/Teal
        } else if (norm.includes('KAM') || norm.includes('펀드운용')) {
            return 'bg-[#34c759]/10 text-[#30d158] border border-[#34c759]/20'; // Emerald/Green
        } else if (norm.includes('IPR')) {
            return 'bg-[#bf5af2]/10 text-[#c084fc] border border-[#bf5af2]/20'; // Purple
        }
        return 'bg-[#8e8e93]/10 text-[#9ca3af] border border-[#8e8e93]/20'; // Gray
    };

    const filteredData = useMemo(() => {
        if (!myName && !myEmail) return [];

        let baseFiltered = [];

        if (activeTab === 'posts') {
            baseFiltered = logs.filter(log => {
                const isAuthor = (log.writer_staff_id && log.writer_staff_id.toLowerCase() === myEmail.toLowerCase()) || 
                                 (log.writer_name && log.writer_name === myName);
                return isAuthor;
            });
        } else if (activeTab === 'comments') {
            baseFiltered = logs.filter(log => {
                const comments = log.metadata?.comments || [];
                return comments.some(c => 
                    (c.author_email && c.author_email.toLowerCase() === myEmail.toLowerCase()) || 
                    (c.author && c.author === myName)
                );
            });
        } else if (activeTab === 'mentions') {
            baseFiltered = logs.filter(log => {
                const rawText = (log.raw_text || log.body_text || '').toLowerCase();
                const summary = (log.summary || '').toLowerCase();
                const title = (log.title || '').toLowerCase();
                const mentionPattern = `@${myName}`.toLowerCase();
                
                const isTextMentioned = rawText.includes(mentionPattern) || summary.includes(mentionPattern) || title.includes(mentionPattern);
                if (isTextMentioned) return true;

                const stakeholders = log.metadata?.stakeholders || [];
                const isStakeholderMe = stakeholders.some(sh => sh.sh_name && sh.sh_name === myName);
                return isStakeholderMe;
            });
        }

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            baseFiltered = baseFiltered.filter(log => 
                (log.title && log.title.toLowerCase().includes(lowerQ)) ||
                (log.summary && log.summary.toLowerCase().includes(lowerQ)) ||
                (log.raw_text && log.raw_text.toLowerCase().includes(lowerQ)) ||
                (log.writer_name && log.writer_name.toLowerCase().includes(lowerQ))
            );
        }

        return baseFiltered;
    }, [logs, activeTab, searchQuery, myName, myEmail]);

    return (
        <div className="flex flex-col w-full bg-[#1F1F1E] min-h-screen pb-28">
            {/* Tab selection menu */}
            <div className="sticky top-0 bg-[#272726] border-b border-[#3c3c3c] px-4 py-3 z-25 flex flex-col gap-2.5 shrink-0 select-none">
                {/* 3 tabs grid */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1A1A1A] rounded-[14px]">
                    {[
                        { id: 'posts', label: '내가 쓴 글' },
                        { id: 'comments', label: '내가 쓴 댓글' },
                        { id: 'mentions', label: '언급된 글' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                            className={`py-2 text-[12.5px] font-bold rounded-[10px] transition-all outline-none ${
                                activeTab === tab.id 
                                ? 'bg-[#3b82f6] text-white' 
                                : 'text-[#86868B] active:bg-[#2c2c2e]/40'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="키워드로 내 업무 검색..." 
                        className="w-full bg-[#1A1A1A] border border-[#3c3c3c] text-white text-[13px] px-3.5 py-1.5 pl-9 rounded-[12px] outline-none focus:border-[#555] transition-colors"
                    />
                    <svg className="w-3.5 h-3.5 absolute left-3.5 top-2.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            {/* List Body */}
            <div className="p-4 flex flex-col gap-4">
                <div className="text-[13px] font-bold text-[#86868B] select-none">
                    조회 결과 ({filteredData.length}건)
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-24 text-[#86868B] text-[14.5px] font-medium border border-dashed border-[#3c3c3c] rounded-[24px]">
                        내역이 존재하지 않습니다.
                    </div>
                ) : (
                    <div className="flex flex-col gap-3.5">
                        {filteredData.map(log => {
                            const isMyPost = (log.writer_staff_id && log.writer_staff_id.toLowerCase() === myEmail.toLowerCase()) || 
                                             (log.writer_name && log.writer_name === myName);
                            const cleanLabel = (log.metadata?.workspace_label || '공통').split('-')[0].trim();
                            const myComments = (log.metadata?.comments || []).filter(c => 
                                (c.author_email && c.author_email.toLowerCase() === myEmail.toLowerCase()) ||
                                (c.author && c.author === myName)
                            );

                            return (
                                <div 
                                    key={log.id} 
                                    onClick={() => setSelectedLog(log)}
                                    className={`bg-[#272726] border border-[#3c3c3c] rounded-[24px] p-5 flex flex-col transition-all active:bg-[#2c2c2b] relative ${log.isDeleted ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-3 text-[11px] text-[#86868B]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold px-[7px] py-[2.5px] rounded-[5px] bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30">
                                                {cleanLabel}
                                            </span>
                                            {log.line && log.line !== 'Unknown Line' && (
                                                <span className={`text-[10px] font-bold px-[7px] py-[2.5px] rounded-[5px] ${getLineBadgeStyle(log.line)}`}>
                                                    {log.line}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-semibold">{log.isDeleted ? '삭제됨' : formatExactDate(log.work_date)}</span>
                                    </div>

                                    <h3 className="text-[16px] font-bold text-white leading-snug mb-2 line-clamp-2">
                                        {log.title}
                                    </h3>

                                    <p className="text-[15.5px] text-[#A1A1AA] leading-relaxed line-clamp-6 mb-3 whitespace-pre-wrap">
                                        {(() => {
                                            const text = log.raw_text || log.body_text || '';
                                            let formatted = text;
                                            formatted = formatted.replace(/\s+([가-하])\.\s+/g, '\n$1. ');
                                            formatted = formatted.replace(/\s+(\d+)\)\s+/g, '\n$1) ');
                                            return formatted.replace(/\n+/g, '\n').trim();
                                        })()}
                                    </p>

                                    {activeTab === 'comments' && myComments.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-2.5 border-t border-[#3c3c3c]/50 pt-3.5">
                                            <span className="text-[11px] font-bold text-[#60a5fa] flex items-center gap-1">
                                                작성한 댓글 ({myComments.length})
                                            </span>
                                            <div className="flex flex-col gap-1.5">
                                                {myComments.map(c => (
                                                    <div key={c.id} className="p-2.5 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-[12px]">
                                                        <p className="text-[12.5px] text-[#E5E5E5] leading-relaxed">{c.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-[12px] text-[#86868B] border-t border-[#3c3c3c]/50 pt-3 mt-1">
                                        <span className="font-bold text-[#E5E5E5]">{log.writer_name}</span>
                                        <span className="text-[#60a5fa] font-bold flex items-center gap-1">
                                            자세히 보기
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Detail Overlay */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <motion.div 
                            className="bg-[#1C1C1E] border border-[#2c2c2e] w-full max-w-[450px] rounded-[28px] overflow-hidden flex flex-col max-h-[82vh] shadow-2xl relative"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="absolute right-5 top-5 w-[28px] h-[28px] rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center transition-colors cursor-pointer z-50 border border-white/5"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>

                            <div className="p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar text-left">
                                <div className="flex items-center gap-3 pr-8">
                                    <div className="w-[42px] h-[42px] rounded-full bg-[#2c2c2e] overflow-hidden border border-[#444] shrink-0">
                                        <img 
                                            src={`${import.meta.env.BASE_URL}${selectedLog.writer_name}.webp`} 
                                            alt={selectedLog.writer_name} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} 
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-white font-bold text-[14.5px] truncate">{selectedLog.writer_name}</span>
                                        <span className="text-[#86868B] text-[11.5px] truncate">{selectedLog.writer_email}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5 items-center">
                                    <span className="text-[10px] font-bold px-[8px] py-[3px] rounded-[5px] bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30">
                                        {selectedLog.metadata?.workspace_label?.split('-')[0].trim() || '공통'}
                                    </span>
                                    {selectedLog.line && selectedLog.line !== 'Unknown Line' && (
                                        <span className={`text-[10px] font-bold px-[8px] py-[3px] rounded-[5px] ${getLineBadgeStyle(selectedLog.line)}`}>
                                            {selectedLog.line}
                                        </span>
                                    )}
                                    <span className="text-[12px] font-semibold text-[#86868b] ml-auto">
                                        {selectedLog.isDeleted ? '삭제됨' : formatExactDate(selectedLog.work_date)}
                                    </span>
                                </div>

                                <div className="w-full h-px bg-[#2c2c2e]" />

                                <div className="flex flex-col gap-3">
                                    <h3 className="text-[18px] font-black text-white leading-snug">
                                        {selectedLog.title}
                                    </h3>

                                    <div className="flex flex-col gap-1.5 mt-1.5">
                                        <span className="text-[11.5px] font-bold text-[#86868b]">업무 기록 상세</span>
                                        <div className="p-4 bg-[#2c2c2e]/30 border border-[#2c2c2e] rounded-[16px] max-h-[220px] overflow-y-auto custom-thin-scrollbar">
                                            <p className="text-[15.5px] text-[#E5E5E5] leading-[1.6] whitespace-pre-wrap break-all">
                                                {(() => {
                                                    const text = selectedLog.raw_text || selectedLog.body_text || '';
                                                    let formatted = text;
                                                    formatted = formatted.replace(/\s+([가-하])\.\s+/g, '\n$1. ');
                                                    formatted = formatted.replace(/\s+(\d+)\)\s+/g, '\n$1) ');
                                                    return formatted.replace(/\n+/g, '\n').trim() || '내용이 없습니다.';
                                                })()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Comments List */}
                                    {selectedLog.metadata?.comments?.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-2 border-t border-[#2c2c2e] pt-3.5">
                                            <span className="text-[11.5px] font-bold text-[#86868b]">댓글 ({selectedLog.metadata.comments.length})</span>
                                            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                                                {selectedLog.metadata.comments.map((comment, index) => (
                                                    <div key={index} className="p-2.5 bg-[#1e1e1f] border border-[#2c2c2e] rounded-[12px]">
                                                        <p className="text-[12.5px] text-[#E5E5E5] leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                                        <div className="flex justify-between mt-1.5 text-[10px] text-[#86868b]">
                                                            <span>{comment.author}</span>
                                                            <span>{new Date(comment.created_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#2c2c2e] shrink-0">
                                    {((selectedLog.writer_staff_id && selectedLog.writer_staff_id.toLowerCase() === myEmail.toLowerCase()) || 
                                      (selectedLog.writer_name && selectedLog.writer_name === myName)) && !selectedLog.isDeleted && (
                                        <button 
                                            onClick={() => handleDeleteLog(selectedLog.id)}
                                            className="px-4 py-3.5 bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] text-[13px] font-bold rounded-xl transition-colors cursor-pointer border border-[#ff453a]/20 shrink-0"
                                        >
                                            삭제
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setSelectedLog(null)}
                                        className="flex-1 py-3.5 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white text-[13px] font-bold rounded-xl transition-colors cursor-pointer"
                                    >
                                        닫기
                                    </button>
                                    {!selectedLog.isDeleted && (selectedLog.source_url || selectedLog.metadata?.workspace_code) && (
                                        <button 
                                            onClick={() => { handleGoToWorkspace(selectedLog); setSelectedLog(null); }}
                                            className="flex-1 py-3.5 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-[13px] font-bold rounded-xl transition-colors cursor-pointer"
                                        >
                                            원문보기
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Alert Modal Popup */}
            <AnimatePresence>
                {alertMessage && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            className="bg-[#1C1C1E] border border-[#2c2c2e] w-[320px] rounded-[24px] p-6 shadow-2xl flex flex-col items-center text-center"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                                alertType === 'success' ? 'bg-[#30d158]/10 text-[#30d158]' : 'bg-[#ff453a]/10 text-[#ff453a]'
                            }`}>
                                {alertType === 'success' ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                            </div>

                            <h4 className="text-white font-bold text-[16px] mb-2">
                                {alertType === 'success' ? '성공' : '오류'}
                            </h4>

                            <p className="text-[#A1A1AA] text-[13px] leading-relaxed mb-5">
                                {alertMessage}
                            </p>

                            <button 
                                onClick={() => setAlertMessage('')}
                                className="w-full py-3 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white text-[13px] font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                확인
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
