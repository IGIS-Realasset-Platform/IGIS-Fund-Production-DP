import React, { useState, useEffect } from 'react';
import SystemLeftNav from './SystemLeftNav';
import IotaLeftNav from './IotaLeftNav';
import PlatformCenter from './PlatformCenter';
import { useTheme } from '../../context/ThemeContext';
import SupportRequestModal from './SupportRequestModal';
import { useAuth } from '../../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDropdown from '../NotificationDropdown';
import { requestFirebaseNotificationPermission } from '../../utils/firebase';

export default function PlatformCore({ isPlatform = true, isIotaWorkspaceOverride = false, currentPath = '' }) {
    const { isLightMode, toggleTheme } = useTheme();
    const [isIotaWorkspace, setIsIotaWorkspace] = useState(isIotaWorkspaceOverride);
    const { memberInfo, user } = useAuth();
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id);

    useEffect(() => {
        // 백그라운드 푸시 알림 권한 요청 및 토큰 저장
        if (user?.id) {
            requestFirebaseNotificationPermission(user.id);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isLightMode) toggleTheme();

        const handleLocationChange = () => {
            if (isIotaWorkspaceOverride) {
                setIsIotaWorkspace(true);
            } else {
                const params = new URLSearchParams(window.location.search);
                setIsIotaWorkspace(params.get('workspace') === 'iota');
            }
        };

        handleLocationChange();
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, [isLightMode, toggleTheme, isIotaWorkspaceOverride]);

    return (
        <div className="w-full h-screen bg-[#1F1F1E] flex overflow-hidden font-sans text-[#E5E5E5] relative border-none">
            
            {/* 좌측 사이드바 스위칭 로직 */}
            {isIotaWorkspace ? <IotaLeftNav isCore={true} isPlatform={isPlatform} currentPath={currentPath} /> : <SystemLeftNav isCore={true} isPlatform={isPlatform} />}

            {/* Stage 2 Layout (상세페이지 고정) - No Right AI Panel for Platform */}
            <div className="flex-1 flex overflow-hidden">
                {/* 컨텐츠 박스 (PlatformCenter) */}
                <div className="w-full h-full overflow-hidden shrink-0 flex flex-col items-stretch opacity-100">
                    <div className="w-full h-full flex flex-col items-stretch min-w-[600px] opacity-100">
                        <PlatformCenter currentPath={currentPath} />
                    </div>
                </div>
            </div>
            
            {/* Notification Bell Button */}
            <div id="global-notification-bell" className="fixed top-[16px] right-[60px] z-[90]">
                <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="w-[36px] h-[36px] bg-transparent hover:bg-[#2A2A2A] border border-transparent hover:border-[#444] text-[#86868B] hover:text-[#0071e3] rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer group relative"
                    style={{ cursor: 'pointer' }}
                    title="알림"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute top-[4px] right-[6px] flex h-2.5 w-2.5" style={{ pointerEvents: 'none' }}>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0071e3] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0071e3]"></span>
                        </span>
                    )}
                </button>

                <NotificationDropdown 
                    isOpen={isNotificationOpen} 
                    onClose={() => setIsNotificationOpen(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                />
            </div>

            {/* Floating Action Button for Support Request */}
            <button
                id="global-support-button"
                onClick={() => setIsSupportModalOpen(true)}
                className="fixed top-[16px] right-[16px] z-[90] w-[36px] h-[36px] bg-transparent hover:bg-[#2A2A2A] border border-transparent hover:border-[#444] text-[#86868B] hover:text-[#0071e3] rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer group"
                style={{ cursor: 'pointer' }}
                title="플랫폼 개선 요청사항 남기기"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-[14px] py-[8px] bg-[#222] text-[#E5E5E5] text-[13px] font-medium rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-[#333] pointer-events-none">
                    개선 요청사항 남기기
                    <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-[#222] border-t border-r border-[#333] rotate-45 pointer-events-none"></div>
                </div>
            </button>

            {/* Support Request Modal */}
            <SupportRequestModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                memberInfo={memberInfo}
            />
            
            <Toaster position="bottom-right" />
            
        </div>
    );
}
