import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkspacePmArchive() {
    const [snapshots, setSnapshots] = useState([]);
    const [selectedSnapshotIds, setSelectedSnapshotIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [workspaceFilter, setWorkspaceFilter] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('workspace') || 'pm';
    });

    const workspaces = [
        { id: 'pm', name: '사업 PM' },
        { id: 'digital', name: '공간솔루션/디지털' },
        { id: 'marketing', name: '기업마케팅' },
        { id: 'fund', name: '펀드운용' },
        { id: 'development', name: '개발솔루션' },
        { id: 'financing', name: '파이낸싱' },
        { id: 'ipr', name: 'IPR' }
    ];

    useEffect(() => {
        const fetchSnapshots = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('iota_weekly_snapshots')
                    .select('*')
                    .eq('workspace', workspaceFilter)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                let fetchedData = data || [];
                
                // Fallback: If no snapshot exists at all, fetch from the live workspace table
                if (fetchedData.length === 0) {
                    const tableMap = {
                        pm: 'iota_pm_tasks',
                        digital: 'iota_digital_tasks',
                        marketing: 'iota_marketing_tasks',
                        fund: 'iota_fund_tasks',
                        development: 'iota_development_tasks',
                        financing: 'iota_financing_tasks',
                        ipr: 'iota_ipr_tasks'
                    };
                    const tableName = tableMap[workspaceFilter];
                    if (tableName) {
                        try {
                            const { data: liveData } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
                            if (liveData && liveData.length > 0) {
                                fetchedData.push({
                                    id: workspaceFilter + '-live-fallback',
                                    workspace: workspaceFilter,
                                    week_label: '26년 5월 3주',
                                    created_at: new Date().toISOString(),
                                    snapshot_data: liveData
                                });
                            }
                        } catch (e) {
                            console.error('Live data fetch fallback failed', e);
                        }
                    }
                }
                
                // Add dummy 5월 2주 snapshot if we have a current one
                if (fetchedData.length > 0) {
                    const hasWeek2 = fetchedData.some(s => s.week_label === '26년 5월 2주');
                    if (!hasWeek2) {
                        const dummy = {
                            ...fetchedData[0],
                            id: fetchedData[0].id + '-dummy',
                            week_label: '26년 5월 2주',
                            created_at: new Date(new Date(fetchedData[0].created_at).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
                        };
                        fetchedData.push(dummy);
                    }
                }
                
                // Sort to ensure 5월 2주 comes after 5월 3주
                fetchedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setSnapshots(fetchedData);
                if (fetchedData.length > 0) {
                    setSelectedSnapshotId(fetchedData[0].id);
                } else {
                    setSelectedSnapshotId(null);
                }
            } catch (e) {
                console.error(e);
                const localData = JSON.parse(localStorage.getItem('iota_weekly_snapshots') || '[]');
                let filteredSnaps = localData.filter(s => s.workspace === workspaceFilter);
                
                // Fallback: If no snapshot exists at all, fetch from the live workspace table
                if (filteredSnaps.length === 0) {
                    const tableMap = {
                        pm: 'iota_pm_tasks',
                        digital: 'iota_digital_tasks',
                        marketing: 'iota_marketing_tasks',
                        fund: 'iota_fund_tasks',
                        development: 'iota_development_tasks',
                        financing: 'iota_financing_tasks',
                        ipr: 'iota_ipr_tasks'
                    };
                    const tableName = tableMap[workspaceFilter];
                    let liveTasks = [];
                    
                    try {
                        const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
                        if (data && data.length > 0) liveTasks = data;
                    } catch(err) {
                        const localTasks = JSON.parse(localStorage.getItem(tableName) || '[]');
                        if (localTasks && localTasks.length > 0) liveTasks = localTasks;
                    }

                    if (liveTasks.length > 0) {
                        filteredSnaps.push({
                            id: workspaceFilter + '-live-fallback',
                            workspace: workspaceFilter,
                            week_label: '26년 5월 3주',
                            created_at: new Date().toISOString(),
                            snapshot_data: liveTasks
                        });
                    }
                }
                
                if (filteredSnaps.length > 0) {
                    const hasWeek2 = filteredSnaps.some(s => s.week_label === '26년 5월 2주');
                    if (!hasWeek2) {
                        const dummy = {
                            ...filteredSnaps[0],
                            id: filteredSnaps[0].id + '-dummy',
                            week_label: '26년 5월 2주',
                            created_at: new Date(new Date(filteredSnaps[0].created_at).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
                        };
                        filteredSnaps.push(dummy);
                    }
                }
                
                filteredSnaps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                setSnapshots(filteredSnaps);
                if (filteredSnaps.length > 0) setSelectedSnapshotIds(filteredSnaps.map(s => s.id));
                else setSelectedSnapshotIds([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSnapshots();
    }, [workspaceFilter]);

    

    // Grouping by year and month based on week_label (e.g. "26년 5월 2주")
    const grouped = snapshots.reduce((acc, snap) => {
        const match = snap.week_label.match(/(\d+)년\s+(\d+)월/);
        if (match) {
            const groupKey = `20${match[1]}년 ${match[2]}월`;
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(snap);
        } else {
            const groupKey = '기타';
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(snap);
        }
        return acc;
    }, {});

    
    const renderTasks = () => {
        if (selectedSnapshotIds.length === 0) return null;
        
        const selectedSnaps = snapshots.filter(s => selectedSnapshotIds.includes(s.id)).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        return selectedSnaps.map(snap => {
            let tasks = snap.snapshot_data || [];
            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();
                tasks = tasks.filter(t => 
                    (t.task_name && t.task_name.toLowerCase().includes(lowerQ)) ||
                    (t.company_name && t.company_name.toLowerCase().includes(lowerQ)) ||
                    (t.notes && t.notes.toLowerCase().includes(lowerQ)) ||
                    (t.next_action && t.next_action.toLowerCase().includes(lowerQ))
                );
            }

            if (tasks.length === 0) return null;

            return (
                <div key={snap.id} className="mb-16">
                    <div className="flex justify-between items-end mb-5">
                        <div>
                            
                            <h2 className="text-[32px] font-bold text-white tracking-tight flex items-center gap-3">
                                <span className="text-[#b3b0a6]">{snap.week_label} {snap.week_label === '26년 5월 3주' ? '(26.5.11~5.17)' : snap.week_label === '26년 5월 2주' ? '(26.5.4~5.10)' : ''}</span>
                                <span className="text-[#A1A1AA] text-[24px]">|</span>
                                <span>{workspaces.find(w => w.id === workspaceFilter)?.name}</span>
                            </h2>
                            <div className="text-[#86868B] text-[13px] mt-1">
                                저장 일시: {new Date(snap.created_at).toLocaleString('ko-KR')}
                            </div>
                        </div>
                    </div>
                    {tasks.map(row => (
                        <div key={row.id} className="w-full relative rounded-[24px] px-6 pt-[22px] pb-[14px] bg-[#272726] border border-[#3c3c3c] mb-4">
                            <div className="flex justify-between items-start gap-8">
                                <div className="flex-1 flex gap-8">
                                    <div className="w-[65%] shrink-0 flex flex-col gap-[2px] border-r border-[#444]/50 pr-8">
                                        <div className="flex items-center gap-2">
                                            {row.related_asset && (
                                                <span className="px-[6px] py-[2px] bg-[#333] text-[#A1A1AA] border border-[#444] rounded-[4px] text-[11px] font-bold whitespace-nowrap">
                                                    {row.related_asset}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-[20px] font-bold text-white mt-1 mb-2 tracking-tight leading-tight whitespace-normal">{row.task_name}</h3>
                                        <div className="flex items-center gap-4 text-[13px] font-medium mt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#86868B]">이해관계자</span>
                                                <span className="text-[#E5E5E5] px-2 py-1 bg-[#222] rounded-[6px] border border-[#333]">{row.company_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#86868B]">상태</span>
                                                <span className="text-[#E5E5E5] px-2 py-1 bg-[#222] rounded-[6px] border border-[#333]">{row.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#86868B]">목표일</span>
                                                <span className="text-[#E5E5E5] px-2 py-1 bg-[#222] rounded-[6px] border border-[#333]">{row.due_date || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-[35%] pl-4">
                                        <span className="block text-[13px] font-bold text-[#86868B] mb-[6px]">Next Action</span>
                                        <p className="text-[16px] text-[#E5E5E5] leading-relaxed break-keep whitespace-pre-wrap">{row.next_action || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            {row.notes && (
                                <div className="mt-4 pt-4 border-t border-[#3c3c3c]">
                                    <span className="block text-[13px] font-bold text-gray-500 mb-[6px]">상세 메모</span>
                                    <p className="text-[14px] text-[#A1A1AA] leading-relaxed break-keep whitespace-pre-wrap">{row.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        });
    };

    return (
        <div className="flex h-screen w-full bg-[#1A1A1A] font-sans text-white overflow-hidden">
            {/* Left Sidebar */}
            <div className="w-[280px] bg-[#222] border-r border-[#333] flex flex-col h-full shrink-0 print:hidden">
                <div className="p-6 border-b border-[#333]">
                    <h1 className="text-[20px] font-bold tracking-tight text-white mb-4">지난 테스크 타임라인</h1>
                    <div className="flex flex-col gap-[4px]">
                        {workspaces.map(ws => (
                            <button
                                key={ws.id}
                                onClick={() => setWorkspaceFilter(ws.id)}
                                className={`text-left px-3 py-[6px] rounded-[8px] text-[14px] font-bold transition-colors ${workspaceFilter === ws.id ? 'bg-[#3c3c3c] text-white' : 'text-[#86868B] hover:text-[#E5E5E5] hover:bg-[#333]'}`}
                            >
                                {ws.name}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="text-[#86868B] text-[13px]">불러오는 중...</div>
                    ) : snapshots.length === 0 ? (
                        <div className="text-[#86868B] text-[13px]">저장된 스냅샷이 없습니다.</div>
                    ) : (
                        Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(groupKey => {
                            const groupIds = grouped[groupKey].map(s => s.id);
                            const allSelected = groupIds.length > 0 && groupIds.every(id => selectedSnapshotIds.includes(id));
                            return (
                            <div key={groupKey}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[#86868B] text-[12px] font-bold uppercase">{groupKey}</h3>
                                    <button 
                                        onClick={() => {
                                            if (allSelected) {
                                                const currentWeekSnap = grouped[groupKey].find(s => s.week_label === '26년 5월 3주') || grouped[groupKey][0];
                                                if (currentWeekSnap) {
                                                    setSelectedSnapshotIds(prev => {
                                                        const filtered = prev.filter(id => !groupIds.includes(id));
                                                        return [...filtered, currentWeekSnap.id];
                                                    });
                                                }
                                            } else {
                                                setSelectedSnapshotIds(prev => [...new Set([...prev, ...groupIds])]);
                                            }
                                        }} 
                                        className="text-[#86868B] text-[11px] font-bold hover:text-[#E5E5E5] bg-[#333] hover:bg-[#444] py-1 rounded-[4px] transition-colors w-[76px] text-center"
                                    >
                                        {allSelected ? '전체선택 해제' : '전체선택'}
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {grouped[groupKey].map(snap => (
                                        <button 
                                            key={snap.id}
                                            onClick={() => setSelectedSnapshotIds(prev => prev.includes(snap.id) ? prev.filter(id => id !== snap.id) : [...prev, snap.id])}
                                            className={`w-full text-left px-4 py-[8px] rounded-[8px] transition-all flex justify-between items-center ${selectedSnapshotIds.includes(snap.id) ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}`}
                                        >
                                            <span className="text-[13px]">{snap.week_label} {snap.week_label === '26년 5월 3주' ? '(26.5.11~5.17)' : snap.week_label === '26년 5월 2주' ? '(26.5.4~5.10)' : ''}</span>
                                            {selectedSnapshotIds.includes(snap.id) && <span className="text-[16px] text-[#60a5fa]">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                        })
                    )}
                </div>
            </div>

            {/* Main Viewer Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111] print:w-full print:block">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent h-[200px] pointer-events-none z-0"></div>
                
                {selectedSnapshotIds.length > 0 ? (
                    <>
                        <div className="relative z-10 px-12 py-6 border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
                            <div className="max-w-[1200px]">
                                <div className="w-full flex gap-3 print:hidden">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="테스크 내용 검색..." 
                                            className="w-full bg-[#222] border border-[#333] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#555] transition-colors"
                                        />
                                        <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
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
                            <div className="max-w-[1200px]">
                                {renderTasks()}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center relative z-10">
                        <div className="text-[#86868B] text-[15px] font-medium">좌측에서 열람할 주차를 선택해주세요.</div>
                    </div>
                )}
            </div>
            <style jsx>{`
                @media print {
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        background: #ffffff !important; 
                        color: #111827 !important;
                    }
                    .h-screen { height: auto !important; }
                    .overflow-hidden, .overflow-y-auto, .custom-scrollbar { overflow: visible !important; }
                    .mb-4, .mb-16 { page-break-inside: avoid; margin-bottom: 24px !important; }
                    .bg-\[\#1a1a1a\]\/80, .bg-\[\#111\] { background: transparent !important; }
                    .border-b { border-bottom: 1px solid #e5e7eb !important; }
                    /* Text colors */
                    .text-white { color: #111827 !important; }
                    .text-\[\#86868B\] { color: #4b5563 !important; }
                    .text-\[\#A1A1AA\] { color: #374151 !important; }
                    .text-\[\#b3b0a6\] { color: #111827 !important; }
                    .text-\[\#E5E5E5\] { color: #111827 !important; }
                    /* Box backgrounds and borders */
                    .bg-\[\#272726\] { background: #ffffff !important; border-color: #d1d5db !important; }
                    .bg-\[\#222\] { background: #f3f4f6 !important; border-color: #e5e7eb !important; }
                    .bg-\[\#333\] { background: #e5e7eb !important; border-color: #d1d5db !important; }
                    .border-\[\#3c3c3c\] { border-color: #d1d5db !important; }
                    .border-\[\#333\] { border-color: #e5e7eb !important; }
                    .border-\[\#444\]\/50 { border-color: #d1d5db !important; }
                    /* Layout fixes */
                    .w-\[65\%\] { border-right: 1px solid #e5e7eb !important; padding-right: 24px !important; }
                    .gap-8 { gap: 24px !important; }
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
