import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MOBILE_WORKSPACES, getInitialWorkspace } from './mobileIotaData';

export default function MobileTaskList({ memberInfo, initialWorkspaceCode, highlightTaskId, onWorkspaceReset, onHighlightReset, onWorkspaceChange, refreshTrigger }) {
    const [workspace, setWorkspace] = useState(() => {
        if (initialWorkspaceCode) {
            const matched = MOBILE_WORKSPACES.find(w => w.code === initialWorkspaceCode);
            if (matched) return matched;
        }
        return getInitialWorkspace(memberInfo);
    });
    const [tasksMap, setTasksMap] = useState({});
    const [loadingMap, setLoadingMap] = useState({});
    const [iotaOnly, setIotaOnly] = useState(true); // 디폴트 true로 변경

    const tasks = tasksMap[workspace.code] || [];
    const loading = !!loadingMap[workspace.code];

    // Touch Swipe States and Refs for Real-time Sliding & Locking
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragDirection, setDragDirection] = useState(null); // 'horizontal' | 'vertical' | null
    
    const touchStartRef = useRef({ x: 0, y: 0 });
    const dragOffsetRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragDirectionRef = useRef(null);
    const workspaceRef = useRef(workspace);
    
    useEffect(() => {
        workspaceRef.current = workspace;
        if (onWorkspaceChange && workspace) {
            onWorkspaceChange(workspace.code);
        }
    }, [workspace, onWorkspaceChange]);

    const sliderRef = useRef(null);

    // Tab Scrolling Ref
    const tabRefs = useRef({});

    useEffect(() => {
        MOBILE_WORKSPACES.forEach(w => {
            fetchTasksForWorkspace(w);
        });
    }, [iotaOnly, refreshTrigger]);

    useEffect(() => {
        fetchTasksForWorkspace(workspace);
    }, [workspace, refreshTrigger]);

    // Handle incoming initial workspace code redirect from notification click
    useEffect(() => {
        if (initialWorkspaceCode) {
            const matchedWs = MOBILE_WORKSPACES.find(w => w.code === initialWorkspaceCode);
            if (matchedWs && workspace.code !== matchedWs.code) {
                setWorkspace(matchedWs);
                setIotaOnly(true);
            }
            if (onWorkspaceReset) {
                onWorkspaceReset();
            }
        }
    }, [initialWorkspaceCode]);

    // Scroll and highlight task card when tasks render (using robust polling to ensure element is mounted)
    useEffect(() => {
        if (highlightTaskId && tasks.length > 0) {
            const hasTask = tasks.some(t => String(t.id) === String(highlightTaskId));
            if (hasTask) {
                let attempts = 0;
                const maxAttempts = 30; // 3 seconds total (30 * 100ms)
                
                const pollInterval = setInterval(() => {
                    const el = document.getElementById(`task-${highlightTaskId}`);
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
    }, [highlightTaskId, tasks]);

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

    // Slider 터치 이벤트 바인딩 (non-passive)
    useEffect(() => {
        const sliderEl = sliderRef.current;
        if (!sliderEl) return;

        const handleStart = (e) => {
            const touch = e.targetTouches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            isDraggingRef.current = true;
            dragDirectionRef.current = null;
            dragOffsetRef.current = 0;
            setIsDragging(true);
            setDragDirection(null);
            setDragOffset(0);
        };

        const handleMove = (e) => {
            if (!isDraggingRef.current) return;
            const touch = e.targetTouches[0];
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;

            if (dragDirectionRef.current === null) {
                const absX = Math.abs(deltaX);
                const absY = Math.abs(deltaY);
                if (absX > 1.5 || absY > 1.5) {
                    if (absX >= absY) {
                        dragDirectionRef.current = 'horizontal';
                        setDragDirection('horizontal');
                        if (e.cancelable) {
                            e.preventDefault();
                        }
                    } else {
                        dragDirectionRef.current = 'vertical';
                        setDragDirection('vertical');
                        isDraggingRef.current = false;
                        setIsDragging(false);
                        return;
                    }
                } else {
                    return;
                }
            }

            if (dragDirectionRef.current === 'vertical') {
                return;
            }

            if (dragDirectionRef.current === 'horizontal') {
                if (e.cancelable) {
                    e.preventDefault();
                }
                const currentIndex = MOBILE_WORKSPACES.findIndex(w => w.code === workspaceRef.current.code);
                let offset = deltaX;
                if (currentIndex === 0 && deltaX > 0) {
                    offset = deltaX * 0.3;
                } else if (currentIndex === MOBILE_WORKSPACES.length - 1 && deltaX < 0) {
                    offset = deltaX * 0.3;
                }
                dragOffsetRef.current = offset;
                setDragOffset(offset);
            }
        };

        const handleEnd = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            setIsDragging(false);

            if (dragDirectionRef.current === 'horizontal') {
                const windowWidth = window.innerWidth;
                const threshold = windowWidth * 0.2;
                const currentIndex = MOBILE_WORKSPACES.findIndex(w => w.code === workspaceRef.current.code);

                if (dragOffsetRef.current < -threshold && currentIndex < MOBILE_WORKSPACES.length - 1) {
                    setWorkspace(MOBILE_WORKSPACES[currentIndex + 1]);
                    setIotaOnly(true);
                } else if (dragOffsetRef.current > threshold && currentIndex > 0) {
                    setWorkspace(MOBILE_WORKSPACES[currentIndex - 1]);
                    setIotaOnly(true);
                }
            }
            
            dragOffsetRef.current = 0;
            dragDirectionRef.current = null;
            setDragOffset(0);
            setDragDirection(null);
        };

        sliderEl.addEventListener('touchstart', handleStart, { passive: true });
        sliderEl.addEventListener('touchmove', handleMove, { passive: false });
        sliderEl.addEventListener('touchend', handleEnd, { passive: true });

        return () => {
            sliderEl.removeEventListener('touchstart', handleStart);
            sliderEl.removeEventListener('touchmove', handleMove);
            sliderEl.removeEventListener('touchend', handleEnd);
        };
    }, []);

    const fetchTasksForWorkspace = async (w) => {
        setLoadingMap(prev => ({ ...prev, [w.code]: true }));
        try {
            const { data, error } = await supabase
                .from(w.taskTable)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) throw error;

            let result = data || [];
            if (iotaOnly) {
                const keywords = ['iota', '이오타', '427', '816', '421', '공통'];
                result = result.filter(t => {
                    if (!t.related_asset) return false;
                    const asset = t.related_asset.toLowerCase();
                    return keywords.some(k => asset.includes(k));
                });
            }
            
            setTasksMap(prev => ({ ...prev, [w.code]: result }));
        } catch (err) {
            console.error("Failed to fetch mobile tasks:", err);
        } finally {
            setLoadingMap(prev => ({ ...prev, [w.code]: false }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '마감일 없음';
        try {
            const d = new Date(dateString);
            return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case '완료': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case '진행중': return 'text-[#60a5fa] bg-[#60a5fa]/10 border-[#60a5fa]/20';
            case '보류': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-300 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <div className="flex flex-col w-full max-w-full pb-24 bg-[#1F1F1E] relative">
            {/* Horizontal Workspace Tab Bar (Sticky layout to stay at the top natively during scrolling) */}
            <div 
                className="sticky left-0 w-full flex gap-5 border-b border-[#3c3c3c] px-4 py-1 overflow-x-auto hide-scrollbar bg-[#272726] z-20 shrink-0 select-none"
                style={{ 
                    top: 'env(safe-area-inset-top)',
                    height: '38px'
                }}
            >
                {MOBILE_WORKSPACES.map(w => {
                    const isActive = workspace.code === w.code;
                    return (
                        <button
                            key={w.code}
                            ref={el => tabRefs.current[w.code] = el}
                            onClick={() => {
                                setWorkspace(w);
                                setIotaOnly(true);
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

            {/* Main Content Body Container */}
            <div className="w-full flex flex-col">
                {/* Iota Filter Area */}
                {(workspace.code === 'WS_EMC' || workspace.code === 'WS_SSC') && (
                <div className="flex justify-end px-4 py-2.5 bg-[#1F1F1E] border-b border-[#3c3c3c]/50 shrink-0">
                    <label className="flex items-center gap-2 text-[13px] text-[#A1A1AA] font-bold cursor-pointer select-none">
                        <span>이오타만 보기</span>
                        <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${iotaOnly ? 'bg-[#3b82f6]' : 'bg-[#3c3c3c]'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${iotaOnly ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <input type="checkbox" className="hidden" checked={iotaOnly} onChange={(e) => setIotaOnly(e.target.checked)} />
                    </label>
                </div>
            )}

            {/* Sliding Wrapper */}
            <div className="w-full overflow-hidden relative" ref={sliderRef}>
                <div 
                    className={`flex flex-row flex-nowrap ${isDragging && dragDirection === 'horizontal' ? 'transition-none' : 'transition-transform duration-300 ease-out'}`}
                    style={{ 
                        width: '700%',
                        transform: `translateX(calc(-${MOBILE_WORKSPACES.findIndex(w => w.code === workspace.code) * (100 / 7)}% + ${dragOffset}px))` 
                    }}
                >
                    {MOBILE_WORKSPACES.map(w => {
                        const workspaceTasks = tasksMap[w.code] || [];
                        const workspaceLoading = !!loadingMap[w.code];
                        return (
                            <div 
                                key={w.code}
                                className="w-[14.2857%] shrink-0 flex flex-col gap-4 p-4 box-border"
                                style={{ width: '14.2857%' }}
                            >
                                {workspaceLoading && workspaceTasks.length === 0 ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                                    </div>
                                ) : workspaceTasks.length === 0 ? (
                                    <div className="text-center py-20 text-[#86868B] text-[15px] font-medium">등록된 업무가 없습니다.</div>
                                ) : (
                                    <div className="flex flex-col gap-4 w-full">
                                        {workspaceTasks.map((task, idx) => {
                                            const isCritical = idx < 3; // 상위 3개 태스크만 강조 외곽선 표시
                                            return (
                                                <div 
                                                    key={task.id} 
                                                    id={`task-${task.id}`}
                                                    className={
                                                        isCritical 
                                                        ? 'bg-gradient-to-br from-[#f87171] via-[#fb923c] to-[#facc15] p-[2px] rounded-[24px] shadow-lg transition-all duration-300 w-full box-border' 
                                                        : 'bg-[#3c3c3c] p-[1px] rounded-[24px] transition-all duration-300 w-full box-border'
                                                    }
                                                >
                                                    <div className="bg-[#272726] rounded-[22px] p-5 flex flex-col w-full h-full box-border">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[12px] font-bold text-[#fbf167]">Task {idx + 1}</span>
                                                                {isCritical && (
                                                                    <span className="text-[10px] font-bold text-[#f87171] bg-[#f87171]/10 px-2 py-0.5 rounded-full border border-[#f87171]/20">중요</span>
                                                                )}
                                                            </div>
                                                            <span className={`text-[11px] font-bold px-2 py-0.5 border rounded-full ${getStatusColor(task.status)}`}>
                                                                {task.status || '상태 없음'}
                                                            </span>
                                                        </div>
                                                        
                                                        <h3 className="text-[18px] font-bold text-white leading-snug mb-1.5 font-sans">
                                                            {task.task_name || 'Task 명 없음'}
                                                        </h3>
                                                        
                                                        <div className="text-[13px] text-[#9A9A98] mb-3 flex items-center gap-2">
                                                            <span className="text-[#60a5fa] font-bold">{task.related_asset || 'IOTA 공통'}</span>
                                                            {task.company_name && (
                                                                <>
                                                                    <span className="text-[#3c3c3c]">|</span>
                                                                    <span className="text-[#E5E5E5] font-medium">{task.company_name}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        <div className="bg-[#1A1A1A] rounded-[12px] p-3.5 border border-[#3c3c3c]/30">
                                                            <div className="text-[12px] text-[#9A9A98] font-bold mb-1.5 flex items-center gap-1.5">
                                                                <svg className="w-3.5 h-3.5 text-[#86868B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                목표 마감일: <span className="text-white ml-0.5">{formatDate(task.due_date)}</span>
                                                            </div>
                                                            <div className="text-[13px] text-[#E5E5E5] leading-relaxed whitespace-pre-line mt-2 line-clamp-3">
                                                                <span className="font-bold text-[#86868B] mr-2">Next:</span>
                                                                {task.next_action || '작성된 내용이 없습니다.'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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
        </div>
    );
}
