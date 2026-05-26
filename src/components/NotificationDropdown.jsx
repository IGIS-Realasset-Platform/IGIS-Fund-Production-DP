import React, { useRef, useEffect } from 'react';

export default function NotificationDropdown({ isOpen, onClose, notifications, unreadCount, onMarkAsRead, onMarkAllAsRead }) {
    const dropdownRef = useRef(null);

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
                                onClick={() => {
                                    if (!notif.is_read) onMarkAsRead(notif.id);
                                }}
                                className={`px-5 py-4 border-b border-[#333] cursor-pointer transition-colors hover:bg-[#2A2A2A] ${!notif.is_read ? 'bg-[#2A2A2A]/40' : ''}`}
                            >
                                <div className="flex gap-3">
                                    {!notif.is_read && (
                                        <div className="w-[8px] h-[8px] rounded-full bg-[#0071e3] shrink-0 mt-1.5"></div>
                                    )}
                                    <div className="flex-1">
                                        <h4 className={`text-[14px] ${!notif.is_read ? 'text-[#E5E5E5] font-semibold' : 'text-[#A1A1AA] font-medium'}`}>
                                            {notif.title || '새로운 알림'}
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
