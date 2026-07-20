import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../utils/supabaseClient';

export default function IotaMyPage() {
    const { user, memberInfo } = useAuth();
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'comments' | 'mentions'
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [logsError, setLogsError] = useState(null);
    const [selectedIotaLog, setSelectedIotaLog] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('error'); // 'error' | 'success'

    const myName = memberInfo?.staff_name || memberInfo?.name || '';
    const myEmail = memberInfo?.email || user?.email || '';

    const formatIotaWeekRange = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const yearStr = String(monday.getFullYear()).slice(-2);
        const mondayMonth = monday.getMonth() + 1;
        const sundayMonth = sunday.getMonth() + 1;
        return `${yearStr}.${mondayMonth}.${monday.getDate()}~${sundayMonth}.${sunday.getDate()}`;
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
            // 사업 PM 1
            '권순일': '사업 PM 1', '윤주형': '사업 PM 1', '김제익': '사업 PM 1', '류홍': '사업 PM 1', '박만진': '사업 PM 1', '박일훈': '사업 PM 1', '이정원': '사업 PM 1', '전무경': '사업 PM 1',
            // 사업 PM 2
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
            if (code === 'WS_PMO') {
                if (log.metadata.workspace_label === '단발성 업무 요청') return '단발성 업무';
                return '통합업무보드';
            }
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
        if (log.metadata?.workspace_label) {
            const lbl = log.metadata.workspace_label;
            if (lbl.includes('사업 PM 1') || lbl.includes('사업PM 1') || lbl.includes('사업PM1')) return '사업 PM 1';
            if (lbl.includes('사업 PM 2') || lbl.includes('사업PM 2') || lbl.includes('사업PM2')) return '사업 PM 2';
            if (lbl.includes('사업 PM') || lbl.includes('사업PM')) {
                return getCellName(log.writer_name) === '사업 PM 2' ? '사업 PM 2' : '사업 PM 1';
            }
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
        if (norm.includes('통합업무보드')) {
            return 'bg-[#5856d6]/10 text-[#af52de] border border-[#5856d6]/20'; // Purple/Indigo
        } else if (norm.includes('단발성업무')) {
            return 'bg-[#ff9500]/10 text-[#ffb347] border border-[#ff9500]/20'; // Orange
        } else if (norm.includes('PM')) {
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

    const handleGoToWorkspace = async (log) => {
        // Notion 연동 로그 중 source_url이 있으면 Notion으로 보냄
        if (log.source_url) {
            window.open(log.source_url, '_blank');
            return;
        }

        // 태스크 보드 변경 이력/진행로그의 경우 통합 업무 보드 상세 페이지로 이동
        if (log.metadata?.is_task_board && log.metadata?.task_id) {
            const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
            window.history.pushState(null, '', `${base}/platform/iotaseoul/workflow?taskId=${log.metadata.task_id}`);
            window.dispatchEvent(new Event('popstate'));
            return;
        }

        // 로컬 DB 로그일 경우
        const wsCode = log.metadata?.workspace_code;
        if (!wsCode) {
            setAlertType('error');
            setAlertMessage('원본 게시물로 이동할 수 없습니다. 원본 위치 정보가 올바르지 않거나 이미 삭제되었을 수 있습니다.');
            return;
        }

        // 실제로 Supabase DB에 이 로그가 실재하는지 검사
        try {
            const { data, error } = await supabase
                .from('iota_seoul_logs')
                .select('log_id')
                .eq('log_id', log.id)
                .maybeSingle();

            if (error || !data) {
                setAlertType('error');
                setAlertMessage('해당 업무 로그는 이미 삭제되어 원본 게시물로 이동할 수 없습니다.');
                // 로컬 상태에서도 해당 로그를 삭제 상태로 표시
                setLogs(prev => prev.map(l => l.id === log.id ? { ...l, isDeleted: true } : l));
                return;
            }
        } catch (err) {
            console.error('Error checking log existence:', err);
        }

        // 존재하면 해당 워크스페이스로 이동
        const pathMap = {
            'WS_PM': 'pm',
            'WS_FINANCING': 'financing',
            'WS_DEVELOPMENT': 'development',
            'WS_MARKETING': 'marketing',
            'WS_DIGITAL': 'digital',
            'WS_FUND': 'fund',
            'WS_IPR': 'ipr'
        };

        const wsPath = pathMap[wsCode];
        if (wsPath) {
            localStorage.setItem('iota_target_log_id', log.id);
            const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
            window.history.pushState(null, '', `${base}/platform/iotaseoul/workspace/${wsPath}?logId=${log.id}`);
            window.dispatchEvent(new Event('popstate'));
        } else {
            setAlertType('error');
            setAlertMessage('원본 게시물로 이동할 수 없습니다. 해당 원본 글이 이미 삭제되었거나 위치를 찾을 수 없습니다.');
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!window.confirm('정말로 이 업무 로그를 삭제하시겠습니까?')) return;
        
        try {
            // 1. 관계 테이블 삭제
            await supabase.from('iota_seoul_log_links').delete().eq('log_id', logId);
            await supabase.from('iota_seoul_log_stakeholders').delete().eq('log_id', logId);
            
            // 2. 메인 테이블 삭제
            const { error } = await supabase.from('iota_seoul_logs').delete().eq('log_id', logId);
            if (error) throw error;
            
            // 3. 로컬 상태 업데이트
            setLogs(prev => prev.filter(l => l.id !== logId));
            if (selectedIotaLog && selectedIotaLog.id === logId) {
                setSelectedIotaLog(null);
            }
            setAlertType('success');
            setAlertMessage('성공적으로 삭제되었습니다.');
        } catch (err) {
            console.error('Error deleting log:', err);
            setAlertType('error');
            setAlertMessage('삭제 처리 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        const fetchIotaLogs = async () => {
            setIsLoading(true);
            setLogsError(null);
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
                    } else {
                        console.warn(`Edge Function response warning: ${response.status}`);
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
                const filteredDbLogs = dbLogs;
                const mappedDbLogs = filteredDbLogs.map(log => {
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
                console.error('Error merging logs:', err);
                setLogsError(err.message || '로그를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchIotaLogs();
    }, []);

    // Filter logic based on tab and search query
    const filteredData = React.useMemo(() => {
        if (!myName && !myEmail) return [];

        let baseFiltered = [];

        if (activeTab === 'posts') {
            baseFiltered = logs.filter(log => {
                const isAuthor = (log.writer_staff_id && log.writer_staff_id.toLowerCase() === myEmail.toLowerCase()) || 
                                 (log.writer_name && log.writer_name === myName);
                return isAuthor;
            });
        } else if (activeTab === 'comments') {
            // Find logs containing my comments
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
                
                // 1. Text mention check
                const isTextMentioned = rawText.includes(mentionPattern) || summary.includes(mentionPattern) || title.includes(mentionPattern);
                if (isTextMentioned) return true;

                // 2. Stakeholders list check (for local DB logs)
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
                (log.writer_name && log.writer_name.toLowerCase().includes(lowerQ)) ||
                (log.line && log.line.toLowerCase().includes(lowerQ)) ||
                (log.metadata?.comments && log.metadata.comments.some(c => c.text && c.text.toLowerCase().includes(lowerQ)))
            );
        }

        return baseFiltered;
    }, [logs, activeTab, searchQuery, myName, myEmail]);

    const handleBackToWorkflow = () => {
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        window.history.pushState(null, '', base + '/platform/iotaseoul/workflow');
        window.dispatchEvent(new Event('popstate'));
    };

    const getStaffTitle = (memberInfo) => {
        if (!memberInfo?.staff_name) return '사용자';
        const name = memberInfo.staff_name;
        const titles = {
            '이철승': '부문대표',
            '윤관식': '부대표',
            '정조민': '부대표',
            '우형석': '그룹장',
            '권술일': '파트장',
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
            '윤용택': 'Sr.Manager'
        };
        return `${name} ${titles[name] || '매니저'}`;
    };

    return (
        <div className="flex h-screen w-full bg-[#1A1A1A] font-sans text-white overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-[280px] bg-[#222] border-r border-[#333] flex flex-col h-full shrink-0 print:hidden">
                <div className="p-6 border-b border-[#333]">
                    <button
                        onClick={handleBackToWorkflow}
                        className="flex items-center gap-2 text-[13px] text-[#A1A1AA] hover:text-white mb-4 bg-transparent border border-[#333] hover:bg-[#333] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                        돌아가기
                    </button>
                    
                    {/* Profile Summary Card */}
                    <div className="flex items-center gap-[12px] p-3 bg-[#1e1e1e] border border-[#333] rounded-[16px] mb-4 text-left">
                        <div className="w-[42px] h-[42px] rounded-full overflow-hidden bg-[#2c2c2e] border border-white/10 shrink-0 flex items-center justify-center">
                            {myName ? (
                                <img 
                                    src={`${import.meta.env.BASE_URL}${myName}.webp`} 
                                    alt={myName} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => { 
                                        e.target.style.display = 'none'; 
                                        e.target.parentNode.innerHTML = myName.substring(0, 2); 
                                        e.target.parentNode.className = 'w-[42px] h-[42px] rounded-full bg-[#c3c2b7] text-[#1F1F1E] flex items-center justify-center text-[15px] font-bold tracking-tighter shrink-0 border border-white/10'; 
                                    }}
                                />
                            ) : (
                                <span className="text-[#1F1F1E] font-bold">U</span>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-white font-bold text-[14px] leading-tight truncate">{getStaffTitle(memberInfo)}</span>
                            <span className="text-[#86868B] text-[11px] mt-[2px] truncate leading-tight">{myEmail}</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex-1 p-6 flex flex-col gap-2">
                    <button
                        onClick={() => { setActiveTab('posts'); setSearchQuery(''); }}
                        className={`w-full text-left px-4 py-[10px] rounded-[10px] transition-all flex justify-between items-center ${activeTab === 'posts' ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span className="text-[13.5px]">내가 작성한 업무</span>
                        </div>
                        {activeTab === 'posts' && <span className="text-[14px] text-[#60a5fa]">✓</span>}
                    </button>

                    <button
                        onClick={() => { setActiveTab('comments'); setSearchQuery(''); }}
                        className={`w-full text-left px-4 py-[10px] rounded-[10px] transition-all flex justify-between items-center ${activeTab === 'comments' ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span className="text-[13.5px]">내가 단 댓글</span>
                        </div>
                        {activeTab === 'comments' && <span className="text-[14px] text-[#60a5fa]">✓</span>}
                    </button>

                    <button
                        onClick={() => { setActiveTab('mentions'); setSearchQuery(''); }}
                        className={`w-full text-left px-4 py-[10px] rounded-[10px] transition-all flex justify-between items-center ${activeTab === 'mentions' ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                            <span className="text-[13.5px]">나를 언급한 업무</span>
                        </div>
                        {activeTab === 'mentions' && <span className="text-[14px] text-[#60a5fa]">✓</span>}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#111] relative pt-[8px]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent h-[200px] pointer-events-none z-0"></div>

                {/* Sub Header (Search Area) */}
                <div className="relative z-10 px-12 py-6 border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
                    <div className="max-w-[1200px] flex items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="키워드로 업무 내용 검색..." 
                                className="w-full bg-[#222] border border-[#333] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#555] transition-colors"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Feed Content */}
                <div className="flex-1 overflow-y-auto px-12 py-8 relative z-10 custom-scrollbar">
                    <div className="max-w-[1200px] text-left">
                        
                        <h2 className="text-[28px] font-bold text-white tracking-tight mb-8">
                            {activeTab === 'posts' && '내가 작성한 업무'}
                            {activeTab === 'comments' && '내가 단 댓글'}
                            {activeTab === 'mentions' && '나를 언급한 업무'}
                            <span className="text-[#86868B] text-[18px] ml-3 font-normal">({filteredData.length}건)</span>
                        </h2>

                        {isLoading ? (
                            <div className="text-[#86868B] text-[15px] animate-pulse py-10">데이터를 불러오는 중입니다...</div>
                        ) : logsError ? (
                            <div className="text-[#ef4444] text-[15px] py-10">{logsError}</div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-[#86868B] text-[15px] py-16 text-center border border-dashed border-[#333] rounded-[24px]">조회된 내역이 없습니다.</div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {filteredData.map(log => {
                                    const myComments = (log.metadata?.comments || []).filter(c => 
                                        (c.author_email && c.author_email.toLowerCase() === myEmail.toLowerCase()) ||
                                        (c.author && c.author === myName)
                                    );

                                    const isMyPost = (log.writer_staff_id && log.writer_staff_id.toLowerCase() === myEmail.toLowerCase()) || 
                                                     (log.writer_name && log.writer_name === myName);
                                    
                                    const workspaceLabel = log.metadata?.workspace_label || '공통';
                                    const cleanLabel = workspaceLabel.split('-')[0].trim();

                                    return (
                                        <div 
                                            key={log.id} 
                                            onClick={() => setSelectedIotaLog(log)}
                                            className={`w-full relative rounded-[24px] px-6 pt-[22px] pb-[22px] border transition-all cursor-pointer group ${log.isDeleted ? 'bg-[#272726]/40 border-[#3a3a3c]/30 opacity-60 hover:bg-[#272726]/40 hover:border-[#3a3a3c]/30' : 'bg-[#272726] border-[#3c3c3c] hover:bg-[#2c2c2b] hover:border-[#555]'}`}
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div className="flex items-center gap-[12px]">
                                                    <div className="w-[42px] h-[42px] rounded-full bg-[#2c2c2e] overflow-hidden border border-[#444] shrink-0">
                                                        <img 
                                                            src={`${import.meta.env.BASE_URL}${log.writer_name}.webp`} 
                                                            alt={log.writer_name} 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-bold text-[15px] leading-tight">{log.writer_name}</span>
                                                            {isMyPost && <span className="text-[10px] font-bold text-[#60a5fa] bg-[#3b82f6]/20 px-1.5 py-0.5 rounded">작성자</span>}
                                                        </div>
                                                        <span className="text-[#86868B] text-[12px] mt-[2px] leading-tight">{log.writer_email}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2.5 shrink-0">
                                                    <span className="text-[11px] font-bold px-[8px] py-[3px] rounded-[6px] bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30">
                                                        {cleanLabel}
                                                    </span>
                                                    {log.line && log.line !== 'Unknown Line' && (
                                                        <span className={`text-[11px] font-bold px-[8px] py-[3px] rounded-[6px] tracking-tight ${getLineBadgeStyle(log.line)}`}>
                                                            {log.line}
                                                        </span>
                                                    )}
                                                    {log.isDeleted && (
                                                        <span className="text-[11px] font-bold px-[8px] py-[3px] rounded-[6px] bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/30">
                                                            삭제됨
                                                        </span>
                                                    )}
                                                    <span className="text-[13px] font-semibold text-[#86868b]">{log.isDeleted ? '삭제된 글' : formatExactDate(log.work_date)}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <h3 className="text-[19px] font-bold text-white tracking-tight leading-snug">
                                                    {log.title || '업무 로그'}
                                                </h3>

                                                <div className="flex flex-col gap-1.5 mt-1">
                                                    <span className="text-[12px] font-bold text-[#86868b]">업무 기록 및 상세 내용</span>
                                                    <div className="p-4 bg-[#1e1e1f] border border-[#2c2c2e] rounded-[16px]">
                                                        <p className="text-[16.5px] text-[#E5E5E5] leading-[1.65] whitespace-pre-wrap break-all line-clamp-6">
                                                            {(() => {
                                                                const text = log.raw_text || log.body_text || '';
                                                                let formatted = text;
                                                                formatted = formatted.replace(/\s+([가-하])\.\s+/g, '\n$1. ');
                                                                formatted = formatted.replace(/\s+(\d+)\)\s+/g, '\n$1) ');
                                                                return formatted.replace(/\n+/g, '\n').trim() || '내용이 없습니다.';
                                                            })()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {activeTab === 'comments' && myComments.length > 0 && (
                                                    <div className="flex flex-col gap-2 mt-2 border-t border-[#3a3a3c]/40 pt-4">
                                                        <span className="text-[12px] font-bold text-[#60a5fa] flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                            내가 단 댓글 ({myComments.length})
                                                        </span>
                                                        <div className="flex flex-col gap-2.5">
                                                            {myComments.map(comment => (
                                                                <div key={comment.id} className="p-3 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-[12px] relative">
                                                                    <p className="text-[13.5px] text-[#E5E5E5] leading-relaxed whitespace-pre-wrap">
                                                                        {comment.text}
                                                                    </p>
                                                                    <div className="flex justify-between items-center mt-2 text-[11px] text-[#86868b]">
                                                                        <span>{comment.author}</span>
                                                                        <span>{new Date(comment.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#3a3a3c]/30">
                                                <div className="flex items-center gap-1 text-[13px] font-bold text-[#60a5fa]">
                                                    <span>자세히 보기</span>
                                                    <svg className="w-3.5 h-3.5 transform translate-x-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isMyPost && !log.isDeleted && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteLog(log.id); }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] text-[11px] font-bold rounded-lg transition-colors cursor-pointer border border-[#ff453a]/20"
                                                        >
                                                            삭제
                                                        </button>
                                                    )}
                                                    {!log.isDeleted && (log.source_url || log.metadata?.workspace_code) && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleGoToWorkspace(log); }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer border border-[#3c3c3c]"
                                                        >
                                                            <span>원문보기</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Detail Overlay */}
            <AnimatePresence>
                {selectedIotaLog && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            className="bg-[#1C1C1E] border border-[#2c2c2e] w-[680px] max-w-full rounded-[28px] overflow-hidden flex flex-col shadow-2xl relative"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <button 
                                onClick={() => setSelectedIotaLog(null)}
                                className="absolute right-6 top-6 w-[32px] h-[32px] rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] flex items-center justify-center transition-colors cursor-pointer z-50 border border-white/5"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>

                            <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[85vh] custom-scrollbar">
                                <div className="flex justify-between items-start gap-4 pr-10 text-left">
                                    <div className="flex items-center gap-[14px]">
                                        <div className="w-[48px] h-[48px] rounded-full bg-[#2c2c2e] overflow-hidden border border-[#444] shrink-0">
                                            <img 
                                                src={`${import.meta.env.BASE_URL}${selectedIotaLog.writer_name}.webp`} 
                                                alt={selectedIotaLog.writer_name} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} 
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-[16px] leading-tight">{selectedIotaLog.writer_name}</span>
                                            <span className="text-[#86868B] text-[13px] mt-[2px] leading-tight">{selectedIotaLog.writer_email}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-[6px] bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30">
                                            {selectedIotaLog.metadata?.workspace_label?.split('-')[0].trim() || '공통'}
                                        </span>
                                        {selectedIotaLog.line && selectedIotaLog.line !== 'Unknown Line' && (
                                            <span className={`text-[11px] font-bold px-[10px] py-[4px] rounded-[6px] tracking-tight ${getLineBadgeStyle(selectedIotaLog.line)}`}>
                                                {selectedIotaLog.line}
                                            </span>
                                        )}
                                        {selectedIotaLog.isDeleted && (
                                            <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-[6px] bg-[#ff453a]/20 text-[#ff453a] border border-[#ff453a]/30">
                                                삭제됨
                                            </span>
                                        )}
                                        <span className="text-[13px] font-semibold text-[#86868b]">{selectedIotaLog.isDeleted ? '삭제된 글' : formatExactDate(selectedIotaLog.work_date)}</span>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-[#2c2c2e]" />

                                <div className="flex flex-col gap-4 text-left">
                                    <h3 className="text-[22px] font-black text-white tracking-tight leading-snug">
                                        {selectedIotaLog.title || '업무 로그'}
                                    </h3>

                                    <div className="flex flex-col gap-2 mt-2">
                                        <span className="text-[13px] font-bold text-[#86868b]">업무 기록 및 상세 내용</span>
                                        <div className="p-5 bg-[#2c2c2e]/40 border border-[#2c2c2e] rounded-[20px] max-h-[300px] overflow-y-auto custom-thin-scrollbar">
                                            <p className="text-[17.5px] text-[#E5E5E5] leading-[1.7] whitespace-pre-wrap break-all">
                                                {(() => {
                                                    const text = selectedIotaLog.raw_text || selectedIotaLog.body_text || '';
                                                    let formatted = text;
                                                    formatted = formatted.replace(/\s+([가-하])\.\s+/g, '\n$1. ');
                                                    formatted = formatted.replace(/\s+(\d+)\)\s+/g, '\n$1) ');
                                                    return formatted.replace(/\n+/g, '\n').trim() || '내용이 없습니다.';
                                                })()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <div>
                                            {((selectedIotaLog.writer_staff_id && selectedIotaLog.writer_staff_id.toLowerCase() === myEmail.toLowerCase()) || 
                                              (selectedIotaLog.writer_name && selectedIotaLog.writer_name === myName)) && !selectedIotaLog.isDeleted && (
                                                <button 
                                                    onClick={() => handleDeleteLog(selectedIotaLog.id)}
                                                    className="flex items-center gap-1.5 px-5 py-2.5 bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#ff453a] text-[12px] font-bold rounded-xl transition-colors cursor-pointer border border-[#ff453a]/20"
                                                >
                                                    삭제하기
                                                </button>
                                            )}
                                        </div>
                                        {!selectedIotaLog.isDeleted && (selectedIotaLog.source_url || selectedIotaLog.metadata?.workspace_code) && (
                                            <button 
                                                onClick={() => handleGoToWorkspace(selectedIotaLog)}
                                                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white text-[12px] font-bold rounded-xl transition-colors cursor-pointer border border-[#3c3c3c]"
                                            >
                                                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                                                    <path d="M4.6 2.05h14.8c1.37 0 2.5 1.13 2.5 2.5v14.8c0 1.37-1.13 2.5-2.5 2.5H4.6c-1.37 0-2.5-1.13-2.5-2.5V4.55c0-1.37 1.13-2.5 2.5-2.5zm.9 3.4c-.61 0-1.1.49-1.1 1.1v10.9c0 .61.49 1.1 1.1 1.1h12.8c.61 0 1.1-.49 1.1-1.1V6.55c0-.61-.49-1.1-1.1-1.1H5.5zm1.5 2h9.8c.28 0 .5.22.5.5v6.8c0 .28-.22.5-.5.5H7c-.28 0-.5-.22-.5-.5V7.95c0-.28.22-.5.5-.5z"/>
                                                </svg>
                                                <span>원문보기</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Modal Comments List */}
                                    <div className="mt-4 border-t border-[#2c2c2e] pt-6 flex flex-col gap-4">
                                        <span className="text-[14px] font-bold text-white">댓글 목록 ({selectedIotaLog.metadata?.comments?.length || 0})</span>
                                        <div className="flex flex-col gap-3">
                                            {(selectedIotaLog.metadata?.comments || []).map(comment => {
                                                const isMyComment = (comment.author_email && comment.author_email.toLowerCase() === myEmail.toLowerCase()) || 
                                                                    (comment.author && comment.author === myName);
                                                return (
                                                    <div 
                                                        key={comment.id} 
                                                        className={`p-4 rounded-[16px] text-left border ${isMyComment ? 'bg-[#3b82f6]/10 border-[#3b82f6]/20' : 'bg-[#2c2c2e]/40 border-[#3a3a3c]/40'}`}
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[13px] font-bold text-white">{comment.author}</span>
                                                                {isMyComment && <span className="text-[9px] font-bold text-[#60a5fa] bg-[#3b82f6]/20 px-1 rounded">나</span>}
                                                            </div>
                                                            <span className="text-[11px] text-[#86868b]">{new Date(comment.created_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-[14px] text-[#E5E5E5] leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                                                    </div>
                                                );
                                            })}
                                            {(!selectedIotaLog.metadata?.comments || selectedIotaLog.metadata.comments.length === 0) && (
                                                <span className="text-[#86868B] text-[13px] py-4 text-center">등록된 댓글이 없습니다.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Alert Layer Modal */}
            <AnimatePresence>
                {alertMessage && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            className="bg-[#1C1C1E] border border-[#2c2c2e] w-[360px] max-w-full rounded-[24px] overflow-hidden flex flex-col p-6 shadow-2xl relative text-center"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-4 ${alertType === 'success' ? 'bg-[#30d158]/10 text-[#30d158]' : 'bg-[#ff453a]/10 text-[#ff453a]'}`}>
                                {alertType === 'success' ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                )}
                            </div>
                            <h4 className="text-[17px] font-bold text-white mb-2">{alertType === 'success' ? '성공' : '알림'}</h4>
                            <p className="text-[#86868B] text-[13.5px] leading-relaxed mb-6">
                                {alertMessage}
                            </p>
                            <button 
                                onClick={() => setAlertMessage('')}
                                className={`w-full py-3 text-white font-bold rounded-xl transition-colors cursor-pointer text-[13.5px] ${alertType === 'success' ? 'bg-[#30d158] hover:bg-[#30d158]/90' : 'bg-[#ff453a] hover:bg-[#ff453a]/90'}`}
                            >
                                확인
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                .custom-thin-scrollbar::-webkit-scrollbar {
                    height: 5px;
                    width: 5px;
                }
                .custom-thin-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-thin-scrollbar::-webkit-scrollbar-thumb {
                    background: #3c3c3c;
                    border-radius: 4px;
                }
                .custom-thin-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
}
