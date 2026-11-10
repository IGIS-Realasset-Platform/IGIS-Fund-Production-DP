export function getWorkFeedPath(feed) {
    return `platform/iotaseoul/discussion/${feed === 'committee' ? 'committee' : 'work'}`;
}

export function isWorkFeedRoute(path) {
    return /(?:^|\/)platform\/iotaseoul\/(?:discussion(?:\/(?:committee|work))?|meeting-logs|open-feed)\/?$/.test(path);
}

export function readWorkFeedLocation(href = window.location.href) {
    const url = new URL(href);
    const requested = url.searchParams.get('feed');
    const feed = /\/discussion\/committee\/?$/.test(url.pathname) ? 'committee'
        : /\/discussion\/work\/?$/.test(url.pathname) ? 'open'
        : ['committee', 'open'].includes(requested) ? requested
        : /\/platform\/iotaseoul\/meeting-logs\/?$/.test(url.pathname) ? 'committee'
        : /\/platform\/iotaseoul\/open-feed\/?$/.test(url.pathname) ? 'open' : null;
    return { feed, logId: url.searchParams.get('logId'), commentId: url.searchParams.get('commentId') };
}

function getBasePath(url) {
    // Preserve deployment prefixes, including GitHub Pages and legacy mobile URLs.
    const route = url.pathname.match(/^(.*\/)(?:platform\/iotaseoul\/|mobile(?:\/|$))/);
    return route ? route[1] : (import.meta.env?.BASE_URL || '/');
}

export function writeWorkFeedLocation(feed, logId = null, { replace = false, commentId = null } = {}) {
    const url = new URL(window.location.href);
    url.pathname = getBasePath(url) + getWorkFeedPath(feed);
    ['feed', 'taskId', 'logId', 'commentId'].forEach(key => url.searchParams.delete(key));
    if (logId) url.searchParams.set('logId', logId);
    if (commentId) url.searchParams.set('commentId', commentId);
    const next = url.pathname + url.search + url.hash;
    if (next !== window.location.pathname + window.location.search + window.location.hash) {
        window.history[replace ? 'replaceState' : 'pushState'](window.history.state, '', next);
        window.dispatchEvent(new Event('iota:feed-navigation'));
    }
}

export function clearMobileWorkFeedLocation() {
    const url = new URL(window.location.href);
    if (!readWorkFeedLocation().feed && !isWorkFeedRoute(url.pathname)) return;
    url.pathname = getBasePath(url) + 'mobile/';
    ['feed', 'logId', 'commentId'].forEach(key => url.searchParams.delete(key));
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    window.dispatchEvent(new Event('iota:feed-navigation'));
}
