import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IotaLogsArchive() {
    const [logs, setLogs] = useState([]);
    const [selectedWeekLabels, setSelectedWeekLabels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [logsError, setLogsError] = useState(null);

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

    const generateWeekInfo = (dateStr) => {
        if (!dateStr) return { weekLabel: '기타', range: '', monday: new Date() };
        const d = new Date(dateStr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const firstDayOfMonth = new Date(monday.getFullYear(), monday.getMonth(), 1);
        const firstDayWeekday = firstDayOfMonth.getDay() || 7; 
        const offsetDate = monday.getDate() + firstDayWeekday - 1;
        const weekNum = Math.floor(offsetDate / 7) + 1;
        
        const yearStr = String(monday.getFullYear()).slice(-2);
        const month = monday.getMonth() + 1;
        
        const weekLabel = `${yearStr}년 ${month}월 ${weekNum}주`;
        const range = `(${yearStr}.${month}.${monday.getDate()}~${sunday.getMonth()+1}.${sunday.getDate()})`;
        return { weekLabel, range, monday };
    };

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

    useEffect(() => {
        const fetchIotaLogs = async () => {
            setIsLoading(true);
            setLogsError(null);
            try {
                const response = await fetch('https://qvegpozwrcmspdvjokiz.supabase.co/functions/v1/iota-logs');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data && data.logs) {
                    const sortedLogs = [...data.logs]
                        .filter(log => !log.metadata?.is_task_board)
                        .sort((a, b) => {
                        const dateA = a.work_date ? new Date(a.work_date).getTime() : 0;
                        const dateB = b.work_date ? new Date(b.work_date).getTime() : 0;
                        return dateB - dateA;
                    });
                    
                    // Add week_label and range to each log
                    const logsWithWeek = sortedLogs.map(log => {
                        const weekInfo = generateWeekInfo(log.work_date);
                        return {
                            ...log,
                            line: getLogCell(log),
                            week_label: weekInfo.weekLabel,
                            range: weekInfo.range
                        };
                    });

                    setLogs(logsWithWeek);

                    // Default to select the most recent week label
                    if (logsWithWeek.length > 0) {
                        setSelectedWeekLabels([logsWithWeek[0].week_label]);
                    }
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (err) {
                console.error('Error fetching iota-logs:', err);
                setLogsError(err.message || '로그를 불러오는 데 실패했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchIotaLogs();
    }, []);

    // Unique week definitions based on computed logs
    const weeksList = React.useMemo(() => {
        const seen = new Set();
        const list = [];
        logs.forEach(log => {
            if (!seen.has(log.week_label)) {
                seen.add(log.week_label);
                list.push({
                    week_label: log.week_label,
                    range: log.range,
                    date: log.work_date
                });
            }
        });
        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [logs]);

    // Grouping week labels by Year and Month
    const grouped = React.useMemo(() => {
        return weeksList.reduce((acc, week) => {
            const match = week.week_label.match(/(\d+)년\s+(\d+)월/);
            if (match) {
                const groupKey = `20${match[1]}년 ${match[2]}월`;
                if (!acc[groupKey]) acc[groupKey] = [];
                acc[groupKey].push(week);
            } else {
                const groupKey = '기타';
                if (!acc[groupKey]) acc[groupKey] = [];
                acc[groupKey].push(week);
            }
            return acc;
        }, {});
    }, [weeksList]);

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

    const renderLogs = () => {
        if (selectedWeekLabels.length === 0) return null;

        return selectedWeekLabels.map(weekLabel => {
            let weekLogs = logs.filter(l => l.week_label === weekLabel);
            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();
                weekLogs = weekLogs.filter(l => 
                    (l.title && l.title.toLowerCase().includes(lowerQ)) ||
                    (l.writer_name && l.writer_name.toLowerCase().includes(lowerQ)) ||
                    (l.summary && l.summary.toLowerCase().includes(lowerQ)) ||
                    (l.raw_text && l.raw_text.toLowerCase().includes(lowerQ)) ||
                    (l.line && l.line.toLowerCase().includes(lowerQ))
                );
            }

            if (weekLogs.length === 0) return null;

            const weekRange = weeksList.find(w => w.week_label === weekLabel)?.range || '';

            return (
                <div key={weekLabel} className="mb-16">
                    <h2 className="text-[32px] font-bold text-white tracking-tight flex items-center gap-3 mb-6">
                        <span className="text-[#b3b0a6]">{weekLabel} {weekRange}</span>
                        <span className="text-[#A1A1AA] text-[24px]">|</span>
                        <span>통합 업무 로그</span>
                    </h2>

                    <div className="flex flex-col gap-6">
                        {weekLogs.map(log => (
                            <div key={log.id} className="w-full relative rounded-[24px] px-6 pt-[22px] pb-[22px] bg-[#272726] border border-[#3c3c3c]">
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
                                        <div className="flex flex-col text-left">
                                            <span className="text-white font-bold text-[15px] leading-tight">{log.writer_name}</span>
                                            <span className="text-[#86868B] text-[12px] mt-[2px] leading-tight">{log.writer_email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2.5 shrink-0">
                                        <span className={`text-[11px] font-bold px-[8px] py-[3px] rounded-[6px] tracking-tight ${getLineBadgeStyle(log.line)}`}>
                                            {log.line || 'Unknown Line'}
                                        </span>
                                        <span className="text-[13px] font-semibold text-[#86868b]">{formatIotaWeekRange(log.work_date)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 text-left">
                                    <h3 className="text-[19px] font-bold text-white tracking-tight leading-snug">
                                        {log.title || '업무 로그'}
                                    </h3>

                                    {/* Raw text */}
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <span className="text-[12px] font-bold text-[#86868b]">업무 기록 및 상세 내용</span>
                                        <div className="p-4 bg-[#1e1e1f] border border-[#2c2c2e] rounded-[16px]">
                                            <p className="text-[16.5px] text-[#E5E5E5] leading-[1.65] whitespace-pre-wrap break-all">
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
                                </div>

                                {log.source_url && (
                                    <div className="flex justify-end mt-4">
                                        <a 
                                            href={log.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-4 py-2 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer border border-[#3c3c3c]"
                                        >
                                            <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                                                <path d="M4.6 2.05h14.8c1.37 0 2.5 1.13 2.5 2.5v14.8c0 1.37-1.13 2.5-2.5 2.5H4.6c-1.37 0-2.5-1.13-2.5-2.5V4.55c0-1.37 1.13-2.5 2.5-2.5zm.9 3.4c-.61 0-1.1.49-1.1 1.1v10.9c0 .61.49 1.1 1.1 1.1h12.8c.61 0 1.1-.49 1.1-1.1V6.55c0-.61-.49-1.1-1.1-1.1H5.5zm1.5 2h9.8c.28 0 .5.22.5.5v6.8c0 .28-.22.5-.5.5H7c-.28 0-.5-.22-.5-.5V7.95c0-.28.22-.5.5-.5z"/>
                                            </svg>
                                            <span>Notion 원문 보기</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        });
    };

    const handleBackToWorkflow = () => {
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        window.history.pushState(null, '', base + '/platform/iotaseoul/workflow');
        window.dispatchEvent(new Event('popstate'));
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
                    <h1 className="text-[7px] font-bold tracking-tight text-white mb-2">지난 업무 로그</h1>
                    <p className="text-[12px] text-[#86868B]">실시간 수집된 IOTA CFT 통합 로그 목록입니다.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="text-[#86868B] text-[13px] animate-pulse">불러오는 중...</div>
                    ) : logsError ? (
                        <div className="text-[#ef4444] text-[13px]">{logsError}</div>
                    ) : weeksList.length === 0 ? (
                        <div className="text-[#86868B] text-[13px]">저장된 로그가 없습니다.</div>
                    ) : (
                        (() => {
                            const sortedGroupKeys = Object.keys(grouped).sort((a,b) => b.localeCompare(a));
                            const allWeekLabels = weeksList.map(w => w.week_label);
                            const isAllSelected = allWeekLabels.length > 0 && allWeekLabels.every(w => selectedWeekLabels.includes(w));
                            
                            return sortedGroupKeys.map((groupKey, index) => {
                                return (
                                    <div key={groupKey}>
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-[#86868B] text-[12px] font-bold uppercase">{groupKey}</h3>
                                            {index === 0 && (
                                                <button 
                                                    onClick={() => {
                                                        if (isAllSelected) {
                                                            if (allWeekLabels.length > 0) {
                                                                setSelectedWeekLabels([allWeekLabels[0]]);
                                                            }
                                                        } else {
                                                            setSelectedWeekLabels([...allWeekLabels]);
                                                        }
                                                    }} 
                                                    className="text-[#86868B] text-[11px] font-bold hover:text-[#E5E5E5] bg-[#333] hover:bg-[#444] py-1 rounded-[4px] transition-colors w-[76px] text-center shrink-0"
                                                >
                                                    {isAllSelected ? '전체 해제' : '전체 선택'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {grouped[groupKey].map(week => (
                                                <button 
                                                    key={week.week_label}
                                                    onClick={() => setSelectedWeekLabels(prev => prev.includes(week.week_label) ? prev.filter(w => w !== week.week_label) : [...prev, week.week_label])}
                                                    className={`w-full text-left px-4 py-[8px] rounded-[8px] transition-all flex justify-between items-center ${selectedWeekLabels.includes(week.week_label) ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}`}
                                                >
                                                    <span className="text-[13px]">{week.week_label} {week.range}</span>
                                                    {selectedWeekLabels.includes(week.week_label) && <span className="text-[16px] text-[#60a5fa]">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            });
                        })()
                    )}
                </div>
            </div>
 
            {/* Main Viewer Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111] print:w-full print:block">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent h-[200px] pointer-events-none z-0 print:hidden"></div>
                
                {selectedWeekLabels.length > 0 ? (
                    <>
                        <div className="relative z-10 px-12 py-6 border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
                            <div className="max-w-[1200px] print:mx-auto">
                                <div className="w-full flex gap-3 print:hidden">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="업무 로그 내용 검색..." 
                                            className="w-full bg-[#222] border border-[#333] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#555] transition-colors"
                                        />
                                        <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <button 
                                        onClick={() => window.print()}
                                        className="shrink-0 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#333] border border-[#444] text-[#A1A1AA] hover:text-white text-[13px] font-bold rounded-[12px] transition-colors flex items-center gap-2 shadow-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        PDF 저장
                                    </button>
                                </div>
                            </div>
                        </div>
 
                        <div className="flex-1 overflow-y-auto px-12 py-8 relative z-10 custom-scrollbar">
                            <div className="max-w-[1200px] print:mx-auto">
                                {renderLogs()}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center relative z-10">
                        <div className="text-[#86868B] text-[15px] font-medium">좌측에서 열람할 주차를 선택해주세요.</div>
                    </div>
                )}
            </div>
            <style>{`
                @media print {
                    html, body, #root { 
                        display: block !important;
                        height: auto !important;
                        overflow: visible !important;
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        background: #ffffff !important; 
                        color: #111827 !important;
                        zoom: 0.76;
                    }
                    .flex.h-screen { display: block !important; height: auto !important; overflow: visible !important; }
                    .flex-1.flex.flex-col { display: block !important; height: auto !important; overflow: visible !important; }
                    .h-screen { height: auto !important; }
                    .overflow-hidden, .overflow-y-auto, .custom-scrollbar { overflow: visible !important; }
                    .mb-16 { page-break-inside: avoid; margin-bottom: 24px !important; }
                    .bg-\[\#1a1a1a\]\/80, .bg-\[\#111\] { background: transparent !important; }
                    .border-b { border-bottom: 1px solid #e5e7eb !important; }
                    .text-white { color: #111827 !important; }
                    .text-\[\#86868B\] { color: #4b5563 !important; }
                    .text-\[\#A1A1AA\] { color: #374151 !important; }
                    .text-\[\#b3b0a6\] { color: #111827 !important; }
                    .text-\[\#E5E5E5\] { color: #111827 !important; }
                    .bg-\[\#272726\] { background: #ffffff !important; border-color: #d1d5db !important; }
                    .bg-\[\#1e1e1f\] { background: #fafafa !important; border-color: #e5e7eb !important; }
                    .border-\[\#3c3c3c\] { border-color: #d1d5db !important; }
                    .px-12 { padding-left: 0 !important; padding-right: 0 !important; }
                    .py-8 { padding-top: 16px !important; padding-bottom: 16px !important; }
                }
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
            `}</style>
        </div>
    );
}
