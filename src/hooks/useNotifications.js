import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';
import { onMessageListener } from '../utils/firebase';

const deduplicateNotifications = (list) => {
  if (!list) return [];
  const logGroups = {};
  list.forEach(n => {
    if (n.reference_id && (n.type === 'log' || n.reference_id.startsWith('iota_issue_'))) {
      const logId = n.reference_id.split('|')[0];
      if (!logGroups[logId]) {
        logGroups[logId] = [];
      }
      logGroups[logId].push(n);
    }
  });

  const idsToRemove = new Set();
  Object.values(logGroups).forEach(group => {
    if (group.length > 1) {
      const detailed = group.find(n => n.body && n.body.includes('업무명 :'));
      if (detailed) {
        group.forEach(n => {
          if (n !== detailed) {
            idsToRemove.add(n.id || `${n.reference_id}-${n.body}`);
          }
        });
      }
    }
  });

  return list.filter(n => {
    const key = n.id || `${n.reference_id}-${n.body}`;
    return !idsToRemove.has(key);
  });
};

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('iota_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!error && data) {
      const cleanData = deduplicateNotifications(data);
      setNotifications(cleanData);
      setUnreadCount(cleanData.filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const channel = supabase
      .channel(`iota-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'iota_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new;
          
          // Skip showing toast for the duplicate trigger notification (type log, body doesn't contain '업무명 :')
          const isDuplicate = newNotification.type === 'log' && 
            newNotification.body && 
            !newNotification.body.includes('업무명 :');
          
          setNotifications(prev => {
            const updated = [newNotification, ...prev];
            const clean = deduplicateNotifications(updated);
            setUnreadCount(clean.filter(n => !n.is_read).length);
            return clean;
          });
          
          if (!isDuplicate) {
            toast(newNotification.title || "새로운 알림이 도착했습니다.", {
              icon: '🔔',
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            });
          }
        }
      )
      .subscribe();

    // Listen to foreground FCM messages (optional if Realtime covers it, but good for parity)
    const setupFirebaseListener = async () => {
      try {
        const payload = await onMessageListener();
        if (payload && payload.notification) {
          toast.success(payload.notification.title, { icon: '🔔' });
        }
      } catch (err) {
        console.error("FCM foreground error", err);
      }
    };
    setupFirebaseListener();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId) => {
    if (!userId) return;
    const { error } = await supabase
      .from('iota_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('iota_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications
  };
}
