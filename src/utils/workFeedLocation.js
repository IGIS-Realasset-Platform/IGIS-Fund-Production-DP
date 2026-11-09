export function readWorkFeedLocation(href = window.location.href) {
    const url = new URL(href);
    const requested = url.searchParams.get('feed');
    const feed = ['committee', 'open'].includes(requested) ? requested
        : /\/platform\/iotaseoul\/meeting-logs\/?$/.test(url.pathname) ? 'committee'
        : /\/platform\/iotaseoul\/open-feed\/?$/.test(url.pathname) ? 'open' : null;
    return { feed, logId: url.searchParams.get('logId'), commentId: url.searchParams.get('commentId') };
}

export function writeWorkFeedLocation(feed, logId = null, { replace = false } = {}) {
    const url = new URL(window.location.href);
    url.searchParams.set('feed', feed);
    ['taskId', 'logId', 'commentId'].forEach(key => url.searchParams.delete(key));
    if (logId) url.searchParams.set('logId', logId);
    const next = url.pathname + url.search + url.hash;
    if (next !== window.location.pathname + window.location.search + window.location.hash) {
        window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', next);
    }
    window.dispatchEvent(new Event('iota:feed-navigation'));
}
