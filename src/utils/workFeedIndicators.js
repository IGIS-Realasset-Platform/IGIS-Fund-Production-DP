// Same 48-hour window as the reference feed. Reactions do not renew this marker.
export function isRecentFeedPost(post, now = Date.now()) {
    return [post.created_at, post.metadata?.content_updated_at].some(value => {
        const timestamp = Date.parse(value);
        return Number.isFinite(timestamp) && now >= timestamp && now - timestamp < 48 * 60 * 60 * 1000;
    });
}
