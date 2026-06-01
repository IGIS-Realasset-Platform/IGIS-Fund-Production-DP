import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function MobileNotifications({ memberInfo, onRead }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!memberInfo?.email) {
            setLoading(false);
            return;
        }
        fetchNotifications();
    }, [memberInfo]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('iota_notifications')
                .select('*')
                .eq('user_id', memberInfo.email)
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
        <div className="flex flex-col w-full min-h-full pb-24 px-4 pt-4 relative">
            <div className="flex items-center justify-between mb-4 relative z-20">
                <h2 className="text-[20px] font-bold text-white">알림</h2>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-[#4C82FF] border-t-transparent rounded-full"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-16 text-[#A1A1AA] text-[15px]">새로운 알림이 없습니다.</div>
            ) : (
                <div className="flex flex-col gap-2">
                    {notifications.map(noti => (
                        <div 
                            key={noti.id} 
                            onClick={() => handleRead(noti)}
                            className={`p-4 rounded-xl border flex flex-col gap-1 transition-colors cursor-pointer ${
                                noti.is_read 
                                ? 'bg-[#242423] border-[#3A3A39]/50 opacity-70' 
                                : 'bg-[#2A2A28] border-[#4C82FF]/30 active:bg-[#20201F]'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={`text-[14px] ${noti.is_read ? 'font-medium text-[#F4F4F1]' : 'font-bold text-white'}`}>
                                    {noti.title}
                                </h3>
                                <span className="text-[11px] text-[#A1A1AA] whitespace-nowrap ml-2">
                                    {formatDate(noti.created_at)}
                                </span>
                            </div>
                            {noti.body && (
                                <p className={`text-[13px] line-clamp-2 ${noti.is_read ? 'text-[#9A9A98]' : 'text-[#F4F4F1]'}`}>
                                    {noti.body}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
