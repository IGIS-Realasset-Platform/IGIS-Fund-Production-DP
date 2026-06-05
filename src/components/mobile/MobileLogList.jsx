import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MOBILE_WORKSPACES, getInitialWorkspace } from './mobileIotaData';
import MobileLogCard from './MobileLogCard';

export default function MobileLogList({ memberInfo, highlightLogId, initialWorkspaceCode, onWorkspaceReset, onHighlightReset }) {
    const [workspace, setWorkspace] = useState(() => {
        if (initialWorkspaceCode) {
            const matched = MOBILE_WORKSPACES.find(w => w.code === initialWorkspaceCode);
            if (matched) return matched;
        }
        return getInitialWorkspace(memberInfo);
    });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLogIds, setExpandedLogIds] = useState(new Set());

    // Touch Swipe States
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

    // Tab Scrolling Ref
    const tabRefs = useRef({});

    useEffect(() => {
        fetchLogs();
    }, []);

    // Handle incoming initial workspace code redirect (0ms instant routing)
    useEffect(() => {
        if (initialWorkspaceCode) {
            const matchedWs = MOBILE_WORKSPACES.find(w => w.code === initialWorkspaceCode);
            if (matchedWs && workspace.code !== matchedWs.code) {
                setWorkspace(matchedWs);
            }
            if (onWorkspaceReset) {
                onWorkspaceReset();
            }
        }
    }, [initialWorkspaceCode]);

    // Resolve workspace code and switch tab for legacy highlighted log (fallback)
    useEffect(() => {
        if (!highlightLogId || initialWorkspaceCode) return;

        const resolveAndSwitchWorkspace = async () => {
            try {
                const { data, error } = await supabase
                    .from('iota_seoul_logs')
                    .select('metadata')
                    .eq('log_id', highlightLogId)
                    .single();

                if (!error && data) {
                    const wsCode = data.metadata?.workspace_code;
                    if (wsCode) {
                        const matchedWs = MOBILE_WORKSPACES.find(w => w.code === wsCode);
                        if (matchedWs && workspace.code !== matchedWs.code) {
                            setWorkspace(matchedWs);
                        }
                    }
                }
            } catch (err) {
                console.error("Error switching workspace for highlight:", err);
            }
        };

        resolveAndSwitchWorkspace();
    }, [highlightLogId, initialWorkspaceCode]);

    // Scroll and highlight card when logs render (using robust polling to ensure element is mounted)
    useEffect(() => {
        if (highlightLogId && logs.length > 0) {
            const hasLog = logs.some(l => l.log_id === highlightLogId);
            if (hasLog) {
                let attempts = 0;
                const maxAttempts = 30; // 3 seconds total (30 * 100ms)
                
                const pollInterval = setInterval(() => {
                    const el = document.getElementById(highlightLogId);
                    if (el) {
                        clearInterval(pollInterval);
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('bg-blue-500/10', 'border-[#3b82f6]/50');
                        setTimeout(() => {
                            el.classList.remove('bg-blue-500/10', 'border-[#3b82f6]/50');
                        }, 2500);
                    }
                    
                    attempts++;
                    if (attempts >= maxAttempts) {
                        clearInterval(pollInterval);
                    }
                }, 100);

                if (onHighlightReset) onHighlightReset();
            }
        }
    }, [highlightLogId, logs]);

    useEffect(() => {
        if (highlightLogId) {
            setExpandedLogIds(prev => {
                const next = new Set(prev);
                next.add(highlightLogId);
                return next;
            });
        }
    }, [highlightLogId]);

    // Auto-scroll active tab into view center
    useEffect(() => {
        const activeTabEl = tabRefs.current[workspace.code];
        if (activeTabEl) {
            activeTabEl.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [workspace]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('iota_seoul_logs')
                .select('*')
                .order('work_date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(200);
                
            if (error) throw error;

            const filtered = (data || []).filter(log => {
                const metadata = log.metadata || {};
                return metadata.workspace_code === workspace.code || 
                       metadata.workspace_label === workspace.label ||
                       workspace.orgNames.includes(metadata.workspace_label);
            });
            
            setLogs(filtered);
        } catch (err) {
            console.error("Failed to fetch mobile logs:", err);
        } finally {
            setLoading(false);
        }
    };

    // Touch handlers for swiping
    const handleTouchStart = (e) => {
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const handleTouchMove = (e) => {
        setTouchEnd({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY
        });
    };

    const handleTouchEnd = () => {
        if (!touchStart.x || !touchEnd.x) return;
        const xDiff = touchStart.x - touchEnd.x;
        const yDiff = touchStart.y - touchEnd.y;
        
        // swipe must be horizontal
        if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 60) {
            const currentIndex = MOBILE_WORKSPACES.findIndex(w => w.code === workspace.code);
            if (xDiff > 0) {
                // Swipe Left -> Next Tab
                if (currentIndex < MOBILE_WORKSPACES.length - 1) {
                    setWorkspace(MOBILE_WORKSPACES[currentIndex + 1]);
                }
            } else {
                // Swipe Right -> Prev Tab
                if (currentIndex > 0) {
                    setWorkspace(MOBILE_WORKSPACES[currentIndex - 1]);
                }
            }
        }
        setTouchStart({ x: 0, y: 0 });
        setTouchEnd({ x: 0, y: 0 });
    };

    return (
        <div 
            className="flex flex-col w-full max-w-full pb-24 bg-[#1F1F1E]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Horizontal Workspace Tab Bar */}
            <div className="flex gap-5 border-b border-[#3c3c3c] px-4 py-1 overflow-x-auto hide-scrollbar bg-[#272726] sticky top-0 z-20 shrink-0 select-none">
                {MOBILE_WORKSPACES.map(w => {
                    const isActive = workspace.code === w.code;
                    return (
                        <button
                            key={w.code}
                            ref={el => tabRefs.current[w.code] = el}
                            onClick={() => {
                                setWorkspace(w);
                            }}
                            className={`py-1.5 text-[15px] font-bold whitespace-nowrap transition-all relative outline-none ${
                                isActive ? 'text-[#60a5fa]' : 'text-[#86868B] hover:text-[#E5E5E5]'
                            }`}
                        >
                            {w.label}
                        </button>
                    );
                })}
            </div>

            {/* Sliding Wrapper */}
            <div className="w-full overflow-hidden relative">
                <div 
                    className="flex flex-row flex-nowrap transition-transform duration-300 ease-out"
                    style={{ 
                        width: '700%',
                        transform: `translateX(-${MOBILE_WORKSPACES.findIndex(w => w.code === workspace.code) * (100 / 7)}%)` 
                    }}
                >
                    {MOBILE_WORKSPACES.map(w => {
                        const filteredLogs = logs.filter(log => {
                            const metadata = log.metadata || {};
                            return metadata.workspace_code === w.code || 
                                   metadata.workspace_label === w.label ||
                                   w.orgNames.includes(metadata.workspace_label);
                        });
                        return (
                            <div 
                                key={w.code}
                                className="w-[14.2857%] shrink-0 flex flex-col gap-4 p-4 box-border"
                                style={{ width: '14.2857%' }}
                            >
                                {loading && logs.length === 0 ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                                    </div>
                                ) : filteredLogs.length === 0 ? (
                                    <div className="text-center py-20 text-[#86868B] text-[15px] font-medium">등록된 협업 게시글이 없습니다.</div>
                                ) : (
                                    <div className="flex flex-col">
                                        {filteredLogs.map(log => {
                                            const logId = log.id || log.log_id;
                                            return (
                                                <MobileLogCard 
                                                    key={logId} 
                                                    log={log} 
                                                    memberInfo={memberInfo} 
                                                    isExpanded={expandedLogIds.has(logId)}
                                                    onClick={(clickedLog) => {
                                                        const id = clickedLog.id || clickedLog.log_id;
                                                        setExpandedLogIds(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(id)) {
                                                                next.delete(id);
                                                            } else {
                                                                next.add(id);
                                                            }
                                                            return next;
                                                        });
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
