import assert from 'node:assert/strict';
import { createWorkFeedLoader } from '../src/utils/workFeedLoader.js';

function fixture() {
    const calls = [];
    const pending = [];
    const defer = (name, args) => {
        calls.push({ name, args });
        return new Promise((resolve, reject) => pending.push({ name, resolve, reject }));
    };
    const client = {
        rpc: (name, args) => defer(name, args),
        from: table => {
            const query = {
                select() { return query; }, eq() { return query; }, order() { return query; },
                then(resolve, reject) { return defer(table).then(resolve, reject); },
            };
            return query;
        },
    };
    return { calls, pending, load: createWorkFeedLoader(client) };
}
const turn = () => new Promise(resolve => setImmediate(resolve));
const success = { data: true, error: null };

const open = fixture();
const first = open.load({ feedKind: 'open', userId: 'a' });
assert.equal(first, open.load({ feedKind: 'open', userId: 'a' }), 'concurrent mounts share the request');
await turn();
assert.deepEqual(open.calls.map(c => c.name), ['can_access_iota_work_feed', 'iota_work_feed_logs'], 'posts start before permission response, open access checked once');
open.pending[1].resolve({ data: [{ log_id: 'visible' }], error: null });
open.pending[0].resolve(success);
assert.deepEqual(await first, { access: true, canCreate: true, accessError: false, initialFeedResult: { logs: [{ log_id: 'visible' }], error: false } });
const revisit = open.load({ feedKind: 'open', userId: 'a' });
await turn();
assert.equal(open.calls.length, 4, 'revisit revalidates permissions and posts');
open.pending[2].resolve({ data: false });
open.pending[3].resolve({ data: [{ log_id: 'must-not-render' }] });
assert.equal((await revisit).initialFeedResult, undefined, 'denied access discards payload');

const committee = fixture();
const restricted = committee.load({ feedKind: 'committee', userId: 'a' });
await turn();
assert.deepEqual(committee.calls.map(c => c.name), ['can_access_iota_work_feed', 'can_access_iota_work_feed', 'list_iota_committee_feed']);
committee.pending[0].resolve(success);
committee.pending[1].resolve({ data: false });
committee.pending[2].resolve({ data: [{ log_id: 'masked', can_read: false }] });
const restrictedResult = await restricted;
assert.equal(restrictedResult.canCreate, false);
assert.equal(restrictedResult.initialFeedResult.logs[0].can_read, false);

const failure = fixture();
const failed = failure.load({ feedKind: 'open', userId: 'a' });
await turn();
failure.pending[0].resolve(success);
failure.pending[1].reject(new Error('network'));
assert.deepEqual((await failed).initialFeedResult, { logs: [], error: true });
const retry = failure.load({ feedKind: 'open', userId: 'b' });
await turn();
failure.pending[2].resolve(success);
failure.pending[3].resolve({ data: [] });
assert.equal((await retry).initialFeedResult.error, false);
assert.equal((await failure.load({ feedKind: 'open' })).access, false);
console.log('PASS: concurrent feed loading, deduplication, fresh permissions, masked committee rows, denial and retry');
