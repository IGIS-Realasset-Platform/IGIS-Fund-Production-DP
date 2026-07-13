import React, { useRef, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function NotificationDropdown({ isOpen, onClose, notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }) {
    const dropdownRef = useRef(null);

    const handleNotifClick = async (notif) => {
        try {
            if (!notif.is_read) {
                try {
                    onMarkAsRead(notif.id);
                } catch (e) {
                    console.error('[NotificationDropdown] markAsRead error:', e);
                }
            }
            onClose();

            console.log('[NotificationDropdown] 알림 전체 정보:', notif);
            
            // 정밀 판정 로직: type이 log이거나 title에 [협업], [@언급], 새 글, 또는 등록이 들어있는 경우 모두 협업글로 처리
            const isLogNotif = notif.type === 'log' || 
                               notif.type === 'logs' || 
                               String(notif.type).toLowerCase() === 'log' ||
                               notif.type === 'comment' ||
                               notif.type === 'comments' ||
                               (notif.title && (
                                   notif.title.includes('[협업]') || 
                                   notif.title.includes('[@언급]') || 
                                   notif.title.includes('댓글') ||
                                   notif.title.includes('새 글') ||
                                   notif.title.includes('등록됐습니다') ||
                                   notif.title.includes('등록되었습니다')
                                ));

            const isTaskNotif = notif.type === 'task' || 
                                String(notif.type).toLowerCase() === 'task' ||
                                (notif.title && (
                                    notif.title.includes('[Task]') || 
                                    notif.title.includes('신규 Task') ||
                                    notif.title.includes('Task 등록')
                                ));

            if (isTaskNotif) {
                let taskId = null;
                let wsCode = null;

                if (notif.reference_id) {
                    const refStr = String(notif.reference_id);
                    if (refStr.includes('|')) {
                        const parts = refStr.split('|');
                        taskId = parts[0];
                        wsCode = parts[1];
                    } else {
                        taskId = refStr;
                    }
                }

                // Force WS_POPUP_REQUESTS if the text indicates it's about the transient request page
                const title = notif.title || '';
                const body = notif.body || '';
                const combinedText = title + ' ' + body;
                const isPopupRequest = combinedText.includes('단발성') || combinedText.includes('팝업');

                if (isPopupRequest) {
                    wsCode = 'WS_POPUP_REQUESTS';
                }

                console.log('[NotificationDropdown] Task 알림 클릭:', notif);
                console.log('[NotificationDropdown] 파싱된 taskId:', taskId, 'wsCode:', wsCode);

                // Fallback: Deduce workspace_code from title text
                if (!wsCode) {
                    if (title.includes('사업 PM') || title.includes('사업PM')) wsCode = 'WS_PM';
                    else if (title.includes('파이낸싱')) wsCode = 'WS_LFC';
                    else if (title.includes('개발')) wsCode = 'WS_DSC';
                    else if (title.includes('마케팅')) wsCode = 'WS_EMC';
                    else if (title.includes('공간') || title.includes('SSC')) wsCode = 'WS_SSC';
                    else if (title.includes('펀드') || title.includes('KAM')) wsCode = 'WS_KAM';
                    else if (title.includes('IPR')) wsCode = 'WS_IPR';
                    console.log('[NotificationDropdown] wsCode Fallback 추론:', wsCode);
                }

                const workspaceMap = {
                    'WS_PM': 'platform/iotaseoul/workspace/pm',
                    'WS_LFC': 'platform/iotaseoul/workspace/financing',
                    'WS_DSC': 'platform/iotaseoul/workspace/development',
                    'WS_EMC': 'platform/iotaseoul/workspace/marketing',
                    'WS_SSC': 'platform/iotaseoul/workspace/digital',
                    'WS_KAM': 'platform/iotaseoul/workspace/fund',
                    'WS_IPR': 'platform/iotaseoul/workspace/ipr',
                    'WS_POPUP_REQUESTS': 'platform/iotaseoul/popup-requests',
                    'WS_PMO': 'platform/iotaseoul/workflow'
                };

                if (taskId) {
                    localStorage.setItem('iota_target_task_id', taskId);
                    console.log('[NotificationDropdown] localStorage 세팅 iota_target_task_id:', taskId);
                }

                const targetPath = workspaceMap[wsCode];
                if (targetPath) {
                    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
                    const newUrl = taskId ? `${base}/${targetPath}?taskId=${taskId}` : `${base}/${targetPath}`;
                    console.log('[NotificationDropdown] 라우팅 실행 URL:', newUrl);
                    window.history.pushState(null, '', newUrl);
                    window.dispatchEvent(new Event('popstate'));
                } else {
                    console.warn('[NotificationDropdown] 매칭되는 targetPath가 없음 (wsCode):', wsCode);
                    toast.error("연계된 화면(워크스페이스)을 찾을 수 없거나 이미 삭제되었습니다.");
                }
            } else if (isLogNotif) {
                console.log('[NotificationDropdown] 협업글 알림 클릭됨. reference_id:', notif.reference_id);
                let logId = null;
                let wsCode = null;

                if (notif.reference_id) {
                    const refStr = String(notif.reference_id);
                    if (refStr.includes('|')) {
                        const parts = refStr.split('|');
                        logId = parts[0];
                        wsCode = parts[1];
                    } else {
                        logId = refStr;
                    }
                }

                // Force WS_POPUP_REQUESTS if the text indicates it's about the transient request page
                const title = notif.title || '';
                const body = notif.body || '';
                const combinedText = title + ' ' + body;
                const isPopupRequest = combinedText.includes('단발성') || combinedText.includes('팝업');

                if (isPopupRequest) {
                    wsCode = 'WS_POPUP_REQUESTS';
                }

                // Fallback: Deduce workspace_code from title text if not explicitly available
                if (!wsCode) {
                    if (combinedText.includes('사업 PM') || combinedText.includes('사업PM')) wsCode = 'WS_PM';
                    else if (combinedText.includes('파이낸싱') || combinedText.includes('재원조달')) wsCode = 'WS_LFC';
                    else if (combinedText.includes('개발') || combinedText.includes('설계')) wsCode = 'WS_DSC';
                    else if (combinedText.includes('마케팅')) wsCode = 'WS_EMC';
                    else if (combinedText.includes('공간') || combinedText.includes('SSC') || combinedText.includes('디지털')) wsCode = 'WS_SSC';
                    else if (combinedText.includes('펀드') || combinedText.includes('KAM')) wsCode = 'WS_KAM';
                    else if (combinedText.includes('IPR')) wsCode = 'WS_IPR';
                    console.log('[NotificationDropdown] 협업글 wsCode Fallback 추론:', wsCode);
                }

                console.log('[NotificationDropdown] 파싱된 logId:', logId, 'wsCode:', wsCode);

                const workspaceMap = {
                    'WS_PM': 'platform/iotaseoul/workspace/pm',
                    'WS_LFC': 'platform/iotaseoul/workspace/financing',
                    'WS_DSC': 'platform/iotaseoul/workspace/development',
                    'WS_EMC': 'platform/iotaseoul/workspace/marketing',
                    'WS_SSC': 'platform/iotaseoul/workspace/digital',
                    'WS_KAM': 'platform/iotaseoul/workspace/fund',
                    'WS_IPR': 'platform/iotaseoul/workspace/ipr',
                    'WS_POPUP_REQUESTS': 'platform/iotaseoul/popup-requests',
                    'WS_PMO': 'platform/iotaseoul/workflow'
                };

                const targetPath = workspaceMap[wsCode];
                const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;

                if (logId) {
                    localStorage.setItem('iota_target_log_id', logId);
                    console.log('[NotificationDropdown] localStorage 세팅 iota_target_log_id:', logId);
                }

                if (targetPath) {
                    let newUrl = logId ? `${base}/${targetPath}?logId=${logId}` : `${base}/${targetPath}`;
                    
                    if (logId && (wsCode === 'WS_PMO' || wsCode === 'WS_POPUP_REQUESTS')) {
                        try {
                            const { data, error } = await supabase
                                .from('iota_seoul_logs')
                                .select('metadata')
                                .eq('log_id', logId)
                                .single();
                            if (!error && data?.metadata?.task_id) {
                                newUrl = `${base}/${targetPath}?taskId=${data.metadata.task_id}`;
                            }
                        } catch (e) { console.error('Failed to resolve task_id from log:', e); }
                    }

                    console.log('[NotificationDropdown] 협업글 워크스페이스 이동 URL:', newUrl);
                    window.history.pushState(null, '', newUrl);
                    window.dispatchEvent(new Event('popstate'));
                } else {
                    // targetPath가 없으면 통합 workflow 보드로 이동
                    const newUrl = logId ? `${base}/platform/iotaseoul/workflow?logId=${logId}` : `${base}/platform/iotaseoul/workflow`;
                    console.log('[NotificationDropdown] 협업글 통합 Workflow 이동 URL:', newUrl);
                    window.history.pushState(null, '', newUrl);
                    window.dispatchEvent(new Event('popstate'));
                }
            }
        } catch (globalError) {
            console.error('[NotificationDropdown] handleNotifClick GLOBAL CRITICAL ERROR:', globalError);
            
            // 최후의 세이프가드 수단: Runtime Exception 시 단순 브라우저 주소창 변경 Fallback 라우팅 작동
            try {
                const title = notif.title || '';
                const body = notif.body || '';
                const text = title + ' ' + body;
                let wsPath = 'platform/iotaseoul/workflow';
                
                if (text.includes('펀드') || text.includes('KAM')) wsPath = 'platform/iotaseoul/workspace/fund';
                else if (text.includes('사업 PM') || text.includes('사업PM')) wsPath = 'platform/iotaseoul/workspace/pm';
                else if (text.includes('파이낸싱') || text.includes('재원조달')) wsPath = 'platform/iotaseoul/workspace/financing';
                else if (text.includes('개발')) wsPath = 'platform/iotaseoul/workspace/development';
                else if (text.includes('마케팅')) wsPath = 'platform/iotaseoul/workspace/marketing';
                else if (text.includes('공간') || text.includes('SSC') || text.includes('디지털')) wsPath = 'platform/iotaseoul/workspace/digital';
                else if (text.includes('IPR')) wsPath = 'platform/iotaseoul/workspace/ipr';

                let logId = null;
                if (notif.reference_id) {
                    const refStr = String(notif.reference_id);
                    logId = refStr.includes('|') ? refStr.split('|')[0] : refStr;
                }
                
                if (logId) {
                    localStorage.setItem('iota_target_log_id', logId);
                    localStorage.setItem('iota_target_task_id', logId);
                }
                
                const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
                const finalUrl = logId ? `${base}/${wsPath}?logId=${logId}` : `${base}/${wsPath}`;
                
                console.log('[NotificationDropdown] Global Error Fallback Redirecting to:', finalUrl);
                window.history.pushState(null, '', finalUrl);
                window.dispatchEvent(new Event('popstate'));
            } catch (redirError) {
                console.error('[NotificationDropdown] Redirect fallback failed:', redirError);
            }
        }
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            ref={dropdownRef}
            className="absolute top-[80px] right-[32px] w-[340px] max-h-[500px] bg-[#222] border border-[#333] rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
                <div className="flex items-center gap-2">
                    <h3 className="text-[#E5E5E5] font-semibold text-[16px]">알림</h3>
                    {unreadCount > 0 && (
                        <span className="bg-[#0071e3] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={onMarkAllAsRead}
                        className="text-[#86868B] hover:text-[#E5E5E5] text-[12px] font-medium transition-colors"
                    >
                        모두 읽음
                    </button>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-[#86868B]">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-[14px]">새로운 알림이 없습니다.</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {notifications.map((notif) => (
                            <div 
                                key={notif.id}
                                onClick={() => handleNotifClick(notif)}
                                className={`px-5 py-4 border-b border-[#333] cursor-pointer transition-colors hover:bg-[#2A2A2A] ${!notif.is_read ? 'bg-[#2A2A2A]/40' : ''}`}
                            >
                                <div className="flex gap-3">
                                    {!notif.is_read && (
                                        <div className="w-[8px] h-[8px] rounded-full bg-[#0071e3] shrink-0 mt-1.5"></div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className={`text-[14px] ${!notif.is_read ? 'text-[#E5E5E5] font-semibold' : 'text-[#A1A1AA] font-medium'}`}>
                                            {(() => {
                                                let t = notif.title || '새로운 알림';
                                                if (t.startsWith('[협업]')) {
                                                    t = t.substring(4); // Remove '[협업]' (length is 4)
                                                }
                                                return t;
                                            })()}
                                        </h4>
                                        <p className="text-[#86868B] text-[13px] mt-1 line-clamp-2 leading-relaxed">
                                            {notif.body}
                                        </p>
                                        <span className="text-[#555] text-[11px] mt-2 block font-medium">
                                            {new Date(notif.created_at).toLocaleString('ko-KR', { 
                                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #444;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
