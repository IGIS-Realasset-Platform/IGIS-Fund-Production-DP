// Deduplicate delivery of the same event, not distinct comments on the same post.
export function deduplicateNotifications(list = []) {
    const seen = new Set();
    return list.filter(notification => {
        if (!notification.id) return true;
        if (seen.has(notification.id)) return false;
        seen.add(notification.id);
        return true;
    });
}

export function getWorkFeedNotificationTarget(notification, baseUrl = '/') {
    const [logId, code, commentId] = String(notification.reference_id || '').split('|');
    const path = { FEED_COMMITTEE: 'platform/iotaseoul/meeting-logs', FEED_OPEN: 'platform/iotaseoul/open-feed' }[code];
    if (!logId || !path) return null;
    const params = new URLSearchParams({ logId });
    if (commentId) params.set('commentId', commentId);
    return `${baseUrl.replace(/\/$/, '')}/${path}?${params}`;
}
