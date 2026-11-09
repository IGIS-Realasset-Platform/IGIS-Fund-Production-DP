import { supabase } from './supabaseClient';

export const WORK_FEEDS = {
    committee: { title: '운영위 논의', description: '주요 이슈를 논의하고 검토 의견과 진행 상황을 확인합니다.', code: 'FEED_COMMITTEE', path: 'platform/iotaseoul/meeting-logs' },
    open: { title: '실무 업무피드', description: '업무 이슈와 아이디어를 공유하고 자유롭게 의견을 나눕니다.', code: 'FEED_OPEN', path: 'platform/iotaseoul/open-feed' },
};

export async function mutateWorkFeed(feedKind, action, logId, payload = {}) {
    const { data, error } = await supabase.rpc('mutate_iota_work_feed', {
        p_feed: feedKind, p_action: action, p_log_id: logId, p_payload: payload,
    });
    if (error) throw error;
    return data;
}
