import { supabase } from './supabaseClient';

const VIP_AUTH_IDS = [
    '4d855717-1e30-4c50-9c5a-621740e686b6', // 이시정
    '492127cc-eb2a-4522-bf25-68640ebc326b', // 이관용
    '9ba52276-9705-4230-a12d-984f999833f4'  // 전기영
];

export const notifyVIPsOnTaskCreation = async (taskName, workspaceName) => {
    if (!taskName) return;
    
    const notificationPayload = VIP_AUTH_IDS.map(userId => ({
        user_id: userId,
        title: `[${workspaceName}] 신규 Task 등록`,
        body: `새로운 Task가 등록되었습니다: ${taskName}`,
        type: 'task',
        is_read: false,
        created_at: new Date().toISOString()
    }));

    try {
        const { error } = await supabase
            .from('iota_notifications')
            .insert(notificationPayload);
            
        if (error) {
            console.error('Failed to insert VIP notifications:', error);
        } else {
            console.log('VIP notifications sent for task:', taskName);
        }
    } catch (err) {
        console.error('Error in notifyVIPsOnTaskCreation:', err);
    }
};
