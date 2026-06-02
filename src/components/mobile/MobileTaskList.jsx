import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { MOBILE_WORKSPACES, getInitialWorkspace } from './mobileIotaData';

export default function MobileTaskList({ memberInfo }) {
    const [workspace, setWorkspace] = useState(() => getInitialWorkspace(memberInfo));
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [iotaOnly, setIotaOnly] = useState(true); // 디폴트 true로 변경

    // Touch Swipe States
    const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
    const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

    // Tab Scrolling Ref
    const tabRefs = useRef({});

    useEffect(() => {
        fetchTasks();
    }, [workspace, iotaOnly]);

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

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from(workspace.taskTable)
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
            
            setTasks(result);
        } catch (err) {
            console.error("Failed to fetch mobile tasks:", err);
        } finally {
            setLoading(false);
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
                    setIotaOnly(true);
                }
            } else {
                // Swipe Right -> Prev Tab
                if (currentIndex > 0) {
                    setWorkspace(MOBILE_WORKSPACES[currentIndex - 1]);
                    setIotaOnly(true);
                }
            }
        }
        setTouchStart({ x: 0, y: 0 });
        setTouchEnd({ x: 0, y: 0 });
    };

    return (
        <div 
            className="flex flex-col w-full max-w-full overflow-x-hidden min-h-full pb-24 bg-[#1F1F1E]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Horizontal Workspace Tab Bar */}
            <div className="flex gap-5 border-b border-[#3c3c3c] px-4 py-2 overflow-x-auto hide-scrollbar bg-[#272726] sticky top-0 z-20 shrink-0 select-none">
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
                            className={`pb-2.5 pt-1.5 text-[15px] font-bold whitespace-nowrap transition-all relative outline-none ${
                                isActive ? 'text-[#60a5fa]' : 'text-[#86868B] hover:text-[#E5E5E5]'
                            }`}
                        >
                            {w.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#3b82f6] rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>

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

            {/* List */}
            <div className="flex flex-col gap-4 p-4 w-full box-border">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20 text-[#86868B] text-[15px] font-medium">등록된 업무가 없습니다.</div>
                ) : (
                    <div className="flex flex-col gap-4 w-full">
                        {tasks.map((task, idx) => {
                            const isCritical = idx < 3; // 상위 3개 태스크만 강조 외곽선 표시
                            return (
                                <div 
                                    key={task.id} 
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
                                        
                                        <h3 className="text-[16px] font-bold text-white leading-snug mb-1.5 font-sans">
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
        </div>
    );
}
