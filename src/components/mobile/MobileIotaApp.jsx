import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import MobileTaskList from './MobileTaskList';
import MobileLogList from './MobileLogList';
import MobileMyTasks from './MobileMyTasks';
import MobileNotifications from './MobileNotifications';
import MobileComposerSheet from './MobileComposerSheet';

export default function MobileIotaApp({ navigateTo }) {
    const { user, memberInfo, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState(0); // 0: 주요업무, 1: 협업게시판, 2: 내업무, 3: 알림
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [unreadNotiCount, setUnreadNotiCount] = useState(0);
    const [isStandalone, setIsStandalone] = useState(false);

    // Detect Chrome PWA "Add to Home Screen" standalone mode
    useEffect(() => {
        const checkStandalone = () => {
            const isStandaloneMode = 
                window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone || 
                document.referrer.includes('android-app://');
            setIsStandalone(!!isStandaloneMode);
        };
        checkStandalone();

        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = (e) => setIsStandalone(e.matches);
        
        try {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } catch (err) {
            try {
                mediaQuery.addListener(handleChange);
                return () => mediaQuery.removeListener(handleChange);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Lock html/body scrolling and reset window offset to fix mobile viewport cutoff bugs
    useEffect(() => {
        const originalHtmlOverflow = document.documentElement.style.overflow;
        const originalHtmlHeight = document.documentElement.style.height;
        const originalBodyOverflow = document.body.style.overflow;
        const originalBodyHeight = document.body.style.height;

        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100dvh';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100dvh';
        
        // Force scroll reset
        window.scrollTo(0, 0);

        return () => {
            document.documentElement.style.overflow = originalHtmlOverflow;
            document.documentElement.style.height = originalHtmlHeight;
            document.body.style.overflow = originalBodyOverflow;
            document.body.style.height = originalBodyHeight;
        };
    }, []);

    // Fetch unread notification count
    useEffect(() => {
        if (!memberInfo?.email) return;
        const fetchUnread = async () => {
            const { count } = await supabase
                .from('iota_notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', memberInfo.email)
                .eq('is_read', false);
            setUnreadNotiCount(count || 0);
        };
        fetchUnread();
    }, [memberInfo?.email, activeTab]);

    const handleLogout = async () => {
        if (window.confirm("로그아웃 하시겠습니까?")) {
            await signOut();
        }
    };

    const sizeStyle = isStandalone 
        ? {
            width: '100%',
            height: '100%',
            transform: 'scale(1)',
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0
          }
        : {
            width: '111.11%',
            height: '111.11%',
            transform: 'scale(0.9)',
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0
          };

    return (
        <div 
            className="flex flex-col bg-[#1F1F1E] text-[#E5E5E5] font-sans relative overflow-hidden"
            style={sizeStyle}
        >
            {/* App Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#272726] border-b border-[#3c3c3c] shrink-0">
                <div className="flex flex-col">
                    <span className="text-[17px] font-bold text-white tracking-tight">IOTA Seoul CFT</span>
                    {memberInfo && (
                        <span className="text-[12px] text-[#A1A1AA] font-medium mt-0.5">
                            {memberInfo.staff_name} · {memberInfo.role_code || 'member'}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                            localStorage.setItem('force_pc_mode', 'true');
                            navigateTo('platform/iotaseoul/workflow');
                        }}
                        className="text-[12px] text-[#E5E5E5] bg-[#3c3c3c]/50 hover:bg-[#3c3c3c] transition-colors px-3 py-1.5 rounded-full border border-[#3c3c3c] font-semibold"
                    >
                        PC버전
                    </button>
                    <button onClick={handleLogout} className="text-[12px] text-[#9A9A98] hover:text-white transition-colors bg-[#272726] px-3 py-1.5 rounded-full border border-[#3c3c3c]">
                        로그아웃
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto relative overscroll-y-contain bg-[#1F1F1E]">
                {activeTab === 0 && <MobileTaskList memberInfo={memberInfo} />}
                {activeTab === 1 && <MobileLogList memberInfo={memberInfo} />}
                {activeTab === 2 && <MobileMyTasks memberInfo={memberInfo} />}
                {activeTab === 3 && <MobileNotifications memberInfo={memberInfo} onRead={() => setUnreadNotiCount(Math.max(0, unreadNotiCount - 1))} />}
            </div>

            {/* Floating Action Button (Tasks and My Tasks) */}
            {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
                <button 
                    onClick={() => setIsComposerOpen(true)}
                    className="absolute right-5 bottom-[105px] w-14 h-14 bg-[#3b82f6] hover:bg-[#2563eb] rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.4)] z-10 active:scale-95 transition-all border border-[#3b82f6]/20"
                >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            )}

            {/* Bottom Navigation */}
            <div className="flex w-full bg-[#272726] border-t border-[#3c3c3c] shrink-0 pb-[calc(6px+env(safe-area-inset-bottom))]">
                {[
                    { id: 0, label: '주요업무', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
                    { id: 1, label: '협업게시판', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
                    { id: 2, label: '내업무', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> },
                    { id: 3, label: '알림', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col items-center justify-center py-3 relative ${activeTab === tab.id ? 'text-[#60a5fa]' : 'text-[#9A9A98]'}`}
                    >
                        <div className="relative">
                            <svg className={`w-[22px] h-[22px] mb-1 ${activeTab === tab.id ? 'stroke-2' : 'stroke-[1.5]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {tab.icon}
                            </svg>
                            {tab.id === 3 && unreadNotiCount > 0 && (
                                <div className="absolute -top-1 -right-1.5 w-[14px] h-[14px] bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-[#272726]">
                                    {unreadNotiCount > 9 ? '9+' : unreadNotiCount}
                                </div>
                            )}
                        </div>
                        <span className={`text-[10px] ${activeTab === tab.id ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Composer Sheet Modal */}
            {isComposerOpen && (
                <MobileComposerSheet 
                    memberInfo={memberInfo}
                    onClose={() => setIsComposerOpen(false)} 
                    onSuccess={() => {
                        setIsComposerOpen(false);
                        // Refresh logic here if needed (could trigger via a refresh context or key)
                    }} 
                    activeTab={activeTab}
                />
            )}
        </div>
    );
}
