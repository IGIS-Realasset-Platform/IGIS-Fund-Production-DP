import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function MobileNotifications({ memberInfo, onRead, onNotificationClick }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!memberInfo?.auth_id) {
            setLoading(false);
            return;
        }
        fetchNotifications();
    }, [memberInfo?.auth_id]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('iota_notifications')
                .select('*')
                .eq('user_id', memberInfo.auth_id)
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) throw error;
            setNotifications(data || []);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRead = async (noti) => {
        if (noti.is_read) return;

        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, is_read: true } : n));
            if (onRead) onRead();

            const { error } = await supabase
                .from('iota_notifications')
                .update({ is_read: true })
                .eq('id', noti.id);
                
            if (error) throw error;
        } catch (err) {
            console.error("Failed to update notification status:", err);
        }
    };

    const handleNotifClick = (noti) => {
        handleRead(noti);
        if (onNotificationClick) {
            onNotificationClick(noti);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const d = new Date(dateString);
            return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        } catch {
            return '';
        }
    };

    return (
        <div className="flex flex-col w-full min-h-full pb-24 p-4 bg-[#1F1F1E]">
            <div className="flex items-center justify-between mb-4 shrink-0 select-none">
                <h2 className="text-[20px] font-bold text-white">알림</h2>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-20 text-[#86868B] text-[15px] font-medium">새로운 알림이 없습니다.</div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map(noti => (
                        <div 
                            key={noti.id} 
                            onClick={() => handleNotifClick(noti)}
                            className={`p-4 rounded-[24px] border flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                                noti.is_read 
                                ? 'bg-[#272726] border-[#3c3c3c]/50 opacity-70' 
                                : 'bg-[#2f2f2e] border-[#3b82f6]/30 active:bg-[#333]'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={`text-[16px] ${noti.is_read ? 'font-medium text-[#E5E5E5]' : 'font-bold text-white'}`}>
                                    {(noti.title || '').replace('[IPR 및 투자기획]', '[IPR]')}
                                </h3>
                                <span className="text-[11px] text-[#86868B] whitespace-nowrap ml-2">
                                    {formatDate(noti.created_at)}
                                </span>
                            </div>
                            {noti.body && (
                                <p className={`text-[13px] line-clamp-2 ${noti.is_read ? 'text-[#9A9A98]' : 'text-[#E5E5E5]'}`}>
                                    {(noti.body || '').replace('새로운 Task가 등록되었습니다:', '').trim()}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
