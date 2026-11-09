import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

import { deduplicateNotifications } from '../../utils/notificationState';

export default function MobileNotifications({ memberInfo, onRead, onNotificationClick }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!memberInfo?.auth_id) {
            setLoading(false);
            return;
        }
        fetchNotifications();
        const refresh = () => fetchNotifications(false);
        const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
        const channel = supabase.channel(`mobile-notification-list-${memberInfo.auth_id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'iota_notifications', filter: `user_id=eq.${memberInfo.auth_id}` }, refresh)
            .subscribe(status => { if (status === 'SUBSCRIBED') refresh(); });
        window.addEventListener('focus', refresh);
        document.addEventListener('visibilitychange', onVisible);
        const timer = setInterval(onVisible, 30000);
        return () => {
            clearInterval(timer);
            window.removeEventListener('focus', refresh);
            document.removeEventListener('visibilitychange', onVisible);
            supabase.removeChannel(channel);
        };
    }, [memberInfo?.auth_id]);

    const fetchNotifications = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const { data, error } = await supabase
                .from('iota_notifications')
                .select('*')
                .eq('user_id', memberInfo.auth_id)
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (error) throw error;
            setNotifications(deduplicateNotifications(data || []));
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

            const { error } = await supabase
                .from('iota_notifications')
                .update({ is_read: true })
                .eq('id', noti.id).eq('user_id', memberInfo.auth_id);
                
            if (error) throw error;
            if (onRead) onRead();
        } catch (err) {
            console.error("Failed to update notification status:", err);
            fetchNotifications(false);
        }
    };

    const handleNotifClick = async (noti) => {
        await handleRead(noti);
        if (onNotificationClick) {
            onNotificationClick(noti);
        }
    };

    const handleDelete = async (e, notiId) => {
        e.stopPropagation();
        if (!window.confirm("이 알림을 삭제하시겠습니까?")) return;

        setNotifications(prev => prev.filter(n => n.id !== notiId));

        try {
            const { error } = await supabase
                .from('iota_notifications')
                .delete()
                .eq('id', notiId).eq('user_id', memberInfo.auth_id);
                
            if (error) throw error;
            if (onRead) onRead();
        } catch (err) {
            console.error("Failed to delete notification:", err);
            alert("알림 삭제에 실패했습니다.");
            fetchNotifications();
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm("모든 알림을 삭제하시겠습니까?")) return;
        if (!memberInfo?.auth_id) return;

        setNotifications([]);

        try {
            const { error } = await supabase
                .from('iota_notifications')
                .delete()
                .eq('user_id', memberInfo.auth_id);
                
            if (error) throw error;
            if (onRead) onRead();
        } catch (err) {
            console.error("Failed to delete all notifications:", err);
            alert("알림 전체 삭제에 실패했습니다.");
            fetchNotifications();
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
        <div className="flex flex-col w-full px-4 pt-3 pb-24 bg-[#1F1F1E]">
            <div className="flex items-start justify-between mb-[11px] shrink-0 select-none">
                <h1 className="text-[19px] font-bold tracking-tight text-white">알림</h1>
                {notifications.length > 0 && (
                    <button
                        onClick={handleDeleteAll}
                        className="text-[12px] text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 active:scale-95 transition-all font-semibold"
                    >
                        전체 삭제
                    </button>
                )}
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
                                <h3 className={`text-[16px] flex-1 ${noti.is_read ? 'font-medium text-[#E5E5E5]' : 'font-bold text-white'}`}>
                                    {(noti.title || '').replace('[IPR 및 투자기획]', '[IPR]')}
                                </h3>
                                <div className="flex flex-col items-end gap-2 ml-3 shrink-0">
                                    <span className="text-[11px] text-[#86868B] whitespace-nowrap">
                                        {formatDate(noti.created_at)}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(e, noti.id)}
                                        className="text-[11px] text-red-400 hover:text-red-300 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20 active:scale-95 transition-all font-medium"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                            {noti.body && (
                                <p className={`text-[13px] line-clamp-3 whitespace-pre-line ${noti.is_read ? 'text-[#9A9A98]' : 'text-[#E5E5E5]'}`}>
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
