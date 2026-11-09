// Share only in-flight requests. Never reuse completed permission checks or posts.
export function createWorkFeedLoader(client) {
    const pending = new Map();
    return function loadWorkFeed({ feedKind, userId }) {
        if (!userId) return Promise.resolve({ access: false, canCreate: false, accessError: false });
        const key = JSON.stringify([userId, feedKind]);
        if (pending.has(key)) return pending.get(key);

        const listing = Promise.resolve(client.rpc('can_access_iota_work_feed', { p_feed: 'open' }));
        const writing = feedKind === 'open' ? listing : Promise.resolve(client.rpc('can_access_iota_work_feed', { p_feed: feedKind }));
        // Both endpoints enforce readership on the server, including masked committee titles.
        const posts = feedKind === 'committee'
            ? client.rpc('list_iota_committee_feed')
            : client.from('iota_work_feed_logs').select('*').eq('feed_kind', feedKind)
                .order('work_date', { ascending: false }).order('created_at', { ascending: false });

        const request = Promise.allSettled([listing, writing, posts]).then(([read, write, rows]) => {
            const readFailed = read.status === 'rejected' || Boolean(read.value.error);
            const writeFailed = write.status === 'rejected' || Boolean(write.value.error);
            const access = !readFailed && read.value.data === true;
            const base = { access, canCreate: access && !writeFailed && write.value.data === true, accessError: readFailed || writeFailed };
            if (!access) return base;
            const error = rows.status === 'rejected' ? rows.reason : rows.value.error;
            return { ...base, initialFeedResult: { logs: error ? [] : rows.value.data || [], error: Boolean(error) } };
        }).finally(() => pending.delete(key));
        pending.set(key, request);
        return request;
    };
}
