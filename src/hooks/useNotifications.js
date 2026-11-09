import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import { deduplicateNotifications } from '../utils/notificationState';

export function useNotifications(userId) {
  const [state, setState] = useState({ userId: null, rows: [], unreadCount: 0 });
  const owner = useRef(userId);
  owner.current = userId;
  const requestVersion = useRef(0);
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const version = ++requestVersion.current;
    const [rows, unread] = await Promise.all([
      supabase.from('iota_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('iota_notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false),
    ]);
    if (owner.current !== userId || version !== requestVersion.current) return;
    if (rows.error || unread.error) { console.error('Notification refresh failed.', rows.error || unread.error); return; }
    setState({ userId, rows: deduplicateNotifications(rows.data || []), unreadCount: unread.count || 0 });
  }, [userId]);

  useEffect(() => {
    if (!userId) { setState({ userId: null, rows: [], unreadCount: 0 }); return; }
    let active = true;
    const refresh = () => { if (active) fetchNotifications().catch(error => console.error('Notification refresh failed.', error)); };
    refresh();
    const seen = new Set();
    const channel = supabase.channel(`iota-notifications-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'iota_notifications', filter: `user_id=eq.${userId}` }, payload => {
        if (!active) return;
        if (payload.eventType === 'INSERT' && !seen.has(payload.new.id)) {
          seen.add(payload.new.id);
          toast(payload.new.title || '새로운 알림이 도착했습니다.', { icon: '🔔', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
        }
        refresh();
      }).subscribe(status => { if (status === 'SUBSCRIBED') refresh(); });
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    // Recover missed events after a disconnected/reconnecting Realtime session.
    const timer = setInterval(onVisible, 30000);
    return () => {
      active = false;
      ++requestVersion.current;
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async notificationId => {
    if (!userId) return;
    const { error } = await supabase.from('iota_notifications').update({ is_read: true }).eq('id', notificationId).eq('user_id', userId);
    if (error) { console.error('Could not mark notification read.', error); return; }
    if (owner.current !== userId) return;
    setState(previous => {
      if (previous.userId !== userId) return previous;
      const wasUnread = previous.rows.some(row => row.id === notificationId && !row.is_read);
      return { ...previous, rows: previous.rows.map(row => row.id === notificationId ? { ...row, is_read: true } : row), unreadCount: Math.max(0, previous.unreadCount - Number(wasUnread)) };
    });
    await fetchNotifications();
  };
  const markAllAsRead = async () => {
    if (!userId) return;
    const { error } = await supabase.from('iota_notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    if (error) { console.error('Could not mark notifications read.', error); return; }
    await fetchNotifications();
  };
  return {
    notifications: state.userId === userId ? state.rows : [],
    unreadCount: state.userId === userId ? state.unreadCount : 0,
    markAsRead, markAllAsRead, refetch: fetchNotifications,
  };
}
