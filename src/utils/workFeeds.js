import { supabase } from './supabaseClient';

export const WORK_FEEDS = {
    committee: { title: '운영위 논의사항', code: 'FEED_COMMITTEE', path: 'platform/iotaseoul/meeting-logs' },
    open: { title: '자유 업무피드', code: 'FEED_OPEN', path: 'platform/iotaseoul/open-feed' },
};

export async function mutateWorkFeed(feedKind, action, logId, payload = {}) {
    const { data, error } = await supabase.rpc('mutate_iota_work_feed', {
        p_feed: feedKind, p_action: action, p_log_id: logId, p_payload: payload,
    });
    if (error) throw error;
    return data;
}
