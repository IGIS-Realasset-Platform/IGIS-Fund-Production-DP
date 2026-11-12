// Inside the frame, use the platform's real shareable URL in the address bar.
export function readWorkFeedLocation(href = (window.parent === window ? window : window.parent).location.href) {
    const url = new URL(href);
    return {feed: 'open', logId: url.searchParams.get('logId'), commentId: url.searchParams.get('commentId')};
}

export function writeWorkFeedLocation(_feed, logId = null, {replace = false, commentId = null} = {}) {
    const embedded = window.parent !== window;
    const target = embedded ? window.parent : window;
    const url = new URL(target.location.href);
    if (embedded) url.searchParams.set('screen', 'feed');
    for (const [key, value] of Object.entries({logId, commentId})) {
        if (value) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
    }
    if (url.href !== target.location.href) target.history[replace ? 'replaceState' : 'pushState'](target.history.state, '', url);
}
