import { feedSeed } from 'local-feed-seed';

const databaseName = 'igis-design-work-feed';
const feedKind = 'open';
const fileBucket = 'iota-work-feed-attachments';
const postStatuses = new Set(['신규', '검토중', '진행중', '보류', '완료']);
const reactionTypes = new Set(['like', 'check']);
const email = 'jk.jeon@igisam.com';
const userId = 'local-feed-user';
const name = '전기영';
const address = value => String(value ?? '').toLowerCase();
const text = value => typeof value === 'string' ? value : '';
const now = () => new Date().toISOString();
const active = member => member.is_active !== false;

const seedMember = (feedSeed.pilotMembers || []).find(member => address(member.email) === email);
export const localFeedIdentity = Object.freeze({
    user: Object.freeze({ id: userId, email }),
    memberInfo: Object.freeze({
        org_name: '기획추진',
        ...seedMember,
        auth_id: userId,
        email,
        staff_name: name,
        is_active: true,
    }),
    loading: false,
});
const pilotMembers = [
    localFeedIdentity.memberInfo,
    ...(feedSeed.pilotMembers || []).filter(member => address(member.email) !== email),
];

export const useAuth = () => localFeedIdentity;

let openingDatabase;
function openDatabase() {
    if (openingDatabase) return openingDatabase;
    openingDatabase = new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.onupgradeneeded = () => {
            const posts = request.result.createObjectStore('posts', { keyPath: 'log_id' });
            const files = request.result.createObjectStore('files', { keyPath: 'path' });
            const directory = request.result.createObjectStore('directory', { autoIncrement: true });
            for (const post of feedSeed.posts || []) {
                posts.put({ ...post, feed_kind: post.feed_kind || feedKind });
            }
            for (const file of feedSeed.files || []) files.put(file);
            for (const stakeholder of feedSeed.stakeholders || []) directory.add(stakeholder);
        };
        request.onsuccess = () => {
            request.result.onversionchange = () => {
                request.result.close();
                openingDatabase = undefined;
            };
            resolve(request.result);
        };
        request.onerror = () => reject(request.error);
    }).catch(error => {
        openingDatabase = undefined;
        throw error;
    });
    return openingDatabase;
}

function resultOf(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function withStores(names, mode, operation) {
    const db = await openDatabase();
    const transaction = db.transaction(names, mode);
    const completed = new Promise((resolve, reject) => {
        transaction.oncomplete = resolve;
        transaction.onabort = () => reject(transaction.error || new Error('로컬 저장을 완료하지 못했습니다.'));
    });
    try {
        const result = await operation(transaction);
        await completed;
        return result;
    } catch (error) {
        try { transaction.abort(); } catch { /* The transaction already ended. */ }
        await completed.catch(() => {});
        throw error;
    }
}

function adapterError(message, code) {
    return Object.assign(new Error(message), { code });
}

async function respond(operation) {
    try {
        return { data: await operation(), error: null };
    } catch (error) {
        return { data: null, error };
    }
}

function organization(member) {
    const org = text(member.org_name).trim();
    for (const label of ['기획추진', '개발솔루션', '기업마케팅', '공간솔루션', '사업1파트', '사업2파트']) {
        if (org.replace(/\s+/g, '').includes(label)) return label;
    }
    return org;
}

function canRead(post) {
    if (post?.feed_kind !== feedKind) return false;
    const { memberInfo } = localFeedIdentity;
    const { groups = [], individuals = [] } = post.metadata?.permissions || {};
    const memberOrganization = organization(memberInfo);
    return address(post.writer_staff_id) === email || memberOrganization === '기획추진'
        || (groups.length === 0 && individuals.length === 0)
        || groups.includes(memberOrganization) || individuals.includes(name);
}

function assertOwner(author, message) {
    if (address(author) !== email) throw adapterError(message, '42501');
}

function validatePermissions(input) {
    if (input == null) return { groups: [], individuals: [] };
    const { groups, individuals } = input;
    if (!Array.isArray(groups) || !Array.isArray(individuals)) {
        throw new Error('열람권한 형식이 올바르지 않습니다.');
    }
    const members = pilotMembers.filter(active);
    if (groups.some(group => !members.some(member => organization(member) === group))) {
        throw new Error('열람권한 그룹을 확인해 주세요.');
    }
    if (individuals.some(person => !members.some(member => member.staff_name === person))) {
        throw new Error('열람 대상 인원을 확인해 주세요.');
    }
    return { groups, individuals };
}

function ownedPath(path) {
    return typeof path === 'string' && path.startsWith(`${feedKind}/${userId}/`)
        && path.split('/').length === 3 && Boolean(path.split('/').at(-1)) && !path.includes('..');
}

function savePost(post, logId, payload, timestamp) {
    if (post) assertOwner(post.writer_staff_id, '작성자만 수정할 수 있습니다.');
    if (!post && payload.editing) throw new Error('게시글을 찾을 수 없습니다.');
    if (post && payload.editing === false) throw adapterError('이미 등록된 게시글입니다.', '23505');
    if (!text(payload.raw_text).trim() || !text(payload.summary).trim()) {
        throw new Error('제목과 내용을 입력해 주세요.');
    }
    const workDate = text(payload.work_date);
    const date = new Date(workDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(workDate) || !Number.isFinite(date.valueOf()) || date.toISOString().slice(0, 10) !== workDate) {
        throw new Error('업무일을 확인해 주세요.');
    }
    const metadata = { ...payload.metadata };
    for (const key of ['linked_pmo_task_ids', 'task_id', 'is_task_board']) delete metadata[key];
    const oldAttachments = post?.metadata?.attachedFiles || [];
    if ((metadata.attachedFiles || []).some(file => !ownedPath(file.path) && !oldAttachments.some(previous => previous.path === file.path))) {
        throw new Error('잘못된 첨부파일 경로입니다.');
    }
    return {
        ...post,
        log_id: logId,
        feed_kind: feedKind,
        work_date: workDate,
        raw_text: payload.raw_text,
        summary: payload.summary,
        writer_staff_id: post?.writer_staff_id || email,
        writer_name: post?.writer_name || name,
        created_at: post?.created_at || timestamp,
        updated_at: timestamp,
        iota_seoul_log_stakeholders: payload.stakeholders || [],
        metadata: {
            ...metadata,
            workspace_code: 'FEED_OPEN',
            workspace_label: '자유 업무피드',
            content_updated_at: timestamp,
            permissions: validatePermissions(metadata.permissions),
            comments: post?.metadata?.comments || [],
            reactions: post?.metadata?.reactions || {},
        },
    };
}

function withReaction(record, reaction) {
    if (!reactionTypes.has(reaction)) throw new Error('잘못된 반응입니다.');
    const selected = record.reactions?.[reaction] || [];
    const next = selected.includes(email) ? selected.filter(actor => actor !== email) : [...selected, email];
    return { ...record, reactions: { ...record.reactions, [reaction]: next } };
}

function updateDiscussion(metadata, action, payload, timestamp) {
    const comments = metadata.comments || [];
    const commentText = text(payload.text);
    if (['comment', 'edit_comment'].includes(action) && !commentText.trim()) {
        throw new Error('댓글 내용을 입력해 주세요.');
    }
    if (action === 'comment') {
        return {
            ...metadata,
            comments: [...comments, {
                id: crypto.randomUUID(), author: name, author_email: email, text: commentText, created_at: timestamp,
            }],
        };
    }
    if (action === 'react' && payload.comment_id == null) return withReaction(metadata, payload.reaction);
    const target = comments.find(comment => comment.id === payload.comment_id);
    if (!target) throw new Error('댓글을 찾을 수 없습니다.');
    if (action === 'delete_comment') {
        assertOwner(target.author_email, '작성자만 댓글을 삭제할 수 있습니다.');
        return { ...metadata, comments: comments.filter(comment => comment.id !== target.id) };
    }
    if (action === 'edit_comment') {
        assertOwner(target.author_email, '작성자만 댓글을 수정할 수 있습니다.');
    }
    const replacement = action === 'edit_comment'
        ? { ...target, text: commentText, updated_at: timestamp }
        : withReaction(target, payload.reaction);
    return { ...metadata, comments: comments.map(comment => comment.id === target.id ? replacement : comment) };
}

const supportedActions = new Set(['save', 'delete', 'comment', 'edit_comment', 'delete_comment', 'react', 'status']);
function mutate(feed, action, logId, payload) {
    if (feed !== feedKind) throw adapterError('접근 권한이 없습니다.', '42501');
    if (!supportedActions.has(action)) throw new Error('지원하지 않는 작업입니다.');
    if (!text(logId).trim()) throw new Error('게시글을 찾을 수 없습니다.');
    return withStores(['posts'], 'readwrite', async transaction => {
        const store = transaction.objectStore('posts');
        const post = await resultOf(store.get(logId));
        const timestamp = now();
        if (post && !canRead(post)) throw adapterError('접근 권한이 없습니다.', '42501');
        if (!post && action !== 'save') throw new Error('게시글을 찾을 수 없습니다.');
        if (action === 'delete') {
            assertOwner(post.writer_staff_id, '작성자만 삭제할 수 있습니다.');
            await resultOf(store.delete(logId));
            return { deleted: true };
        }
        let updated;
        if (action === 'save') {
            updated = savePost(post, logId, payload, timestamp);
        } else if (action === 'status') {
            assertOwner(post.writer_staff_id, '작성자만 진행상태를 변경할 수 있습니다.');
            if (!postStatuses.has(payload.status)) throw new Error('진행상태를 확인해 주세요.');
            updated = { ...post, updated_at: timestamp, metadata: { ...post.metadata, issue_status: payload.status } };
        } else {
            updated = { ...post, updated_at: timestamp, metadata: updateDiscussion(post.metadata || {}, action, payload, timestamp) };
        }
        await resultOf(store.put(updated));
        return updated;
    });
}

function list(storeName) {
    return withStores([storeName], 'readonly', transaction => resultOf(transaction.objectStore(storeName).getAll()));
}

const stakeholderKey = row => JSON.stringify([text(row.company_name).trim(), text(row.contact_name).trim()]);
let lastSharedDirectory;
let pendingDirectory;

function fetchSharedDirectory() {
    pendingDirectory ??= fetch('/api/work-feed/stakeholders').then(async response => {
        if (!response.ok) throw Error('공용 이해관계자를 불러오지 못했습니다.');
        const {stakeholders, stale} = await response.json();
        if (!Array.isArray(stakeholders)) throw Error('공용 이해관계자 응답을 확인해 주세요.');
        lastSharedDirectory = stakeholders.map(normalizedStakeholder);
        return {rows: lastSharedDirectory, status: stale ? 'cached' : 'fresh'};
    }).catch(() => ({
        rows: lastSharedDirectory || [],
        status: lastSharedDirectory ? 'cached' : 'unavailable',
    })).finally(() => { pendingDirectory = undefined; });
    return pendingDirectory;
}

async function stakeholderDirectory() {
    const [shared, local] = await Promise.all([fetchSharedDirectory(), list('directory')]);
    const sharedKeys = new Set(shared.rows.map(stakeholderKey));
    return {
        rows: [...shared.rows, ...local.filter(row => !sharedKeys.has(stakeholderKey(row))).map(normalizedStakeholder)],
        status: shared.status,
    };
}

async function insertStakeholder(input) {
    const shared = await fetchSharedDirectory();
    return withStores(['directory'], 'readwrite', async transaction => {
        const store = transaction.objectStore('directory');
        const rows = await resultOf(store.getAll());
        const company = text(input.company_name).trim();
        const contact = text(input.contact_name).trim() || null;
        const category = text(input.role_category).trim();
        if (!company || !category) throw new Error('이해관계자의 회사·기관명과 분류를 확인해 주세요.');
        const key = stakeholderKey({company_name: company, contact_name: contact});
        if (shared.rows.some(row => stakeholderKey(row) === key) || rows.some(row => stakeholderKey(row) === key)) {
            throw adapterError('이미 등록된 이해관계자입니다.', '23505');
        }
        const entry = {
            ...input,
            company_name: company, contact_name: contact, role_category: category,
            id: crypto.randomUUID(), created_at: now(),
        };
        await resultOf(store.add(entry));
        return entry;
    });
}

function normalizedStakeholder(row) {
    const role = text(row.role_category).trim();
    const aliases = { 투자자: 'LP', SI: 'SI(기업)' };
    return {
        ...row,
        company_name: text(row.company_name).trim(),
        contact_name: text(row.contact_name).trim() || null,
        role_category: aliases[role] || role,
    };
}

export async function fetchWorkspaceDirectoryData() {
    const directory = await stakeholderDirectory();
    return {
        stakeholders: directory.rows,
        sharedDirectoryStatus: directory.status,
        pilotMembers: structuredClone(pilotMembers),
    };
}

class LocalFeedQuery {
    constructor(table) {
        this.table = table;
        this.filters = [];
        this.sorts = [];
    }
    select() { return this; }
    eq(key, value) { this.filters.push([key, value]); return this; }
    order(key, { ascending = true } = {}) { this.sorts.push([key, ascending]); return this; }
    limit(count) { this.count = count; return this; }
    insert(input) { this.input = input; return this; }
    single() { this.one = true; return this; }
    then(resolve, reject) {
        return respond(() => this.execute()).then(resolve, reject);
    }
    async execute() {
        if (this.input !== undefined) {
            if (this.table !== 'iota_stakeholder_master') throw new Error('지원하지 않는 등록입니다.');
            const row = await insertStakeholder(this.input);
            return this.one ? row : [row];
        }
        let rows;
        if (this.table === 'iota_work_feed_logs') rows = (await list('posts')).filter(canRead);
        else if (this.table === 'iota_stakeholder_master') rows = (await stakeholderDirectory()).rows;
        else if (this.table === 'iota_seoul_pilot_members') rows = structuredClone(pilotMembers);
        else throw new Error('지원하지 않는 조회입니다.');
        rows = rows.filter(row => this.filters.every(([key, value]) => row[key] === value));
        if (this.sorts.length) rows.sort((left, right) => {
            for (const [key, ascending] of this.sorts) {
                const difference = text(left[key]).localeCompare(text(right[key]));
                if (difference) return ascending ? difference : -difference;
            }
            return 0;
        });
        if (this.count !== undefined) rows = rows.slice(0, this.count);
        return this.one ? rows[0] || null : rows;
    }
}

async function upload(bucket, path, blob) {
    if (bucket !== fileBucket || !ownedPath(path)) throw adapterError('첨부 권한이 없습니다.', '42501');
    if (!(blob instanceof Blob) || blob.size > 50 * 1024 * 1024) throw new Error('첨부파일 크기를 확인해 주세요.');
    await withStores(['files'], 'readwrite', transaction => resultOf(transaction.objectStore('files').add({ path, blob })));
    return { path };
}

async function signFile(bucket, path, seconds) {
    if (bucket !== fileBucket || !text(path).startsWith(`${feedKind}/`)) throw adapterError('첨부 권한이 없습니다.', '42501');
    const file = await withStores(['files', 'posts'], 'readonly', async transaction => {
        if (!ownedPath(path)) {
            const posts = await resultOf(transaction.objectStore('posts').getAll());
            if (!posts.some(post => canRead(post) && post.metadata?.attachedFiles?.some(attachment => attachment.path === path))) {
                throw adapterError('첨부파일을 볼 수 없습니다.', '42501');
            }
        }
        return resultOf(transaction.objectStore('files').get(path));
    });
    if (!file) throw new Error('로컬 복사본에서 첨부파일을 찾을 수 없습니다.');
    const signedUrl = URL.createObjectURL(file.blob);
    setTimeout(() => URL.revokeObjectURL(signedUrl), seconds * 1000);
    return { signedUrl };
}

export const supabase = {
    from: table => new LocalFeedQuery(table),
    rpc: (procedure, args = {}) => respond(() => {
        switch (procedure) {
            case 'can_access_iota_work_feed': return args.p_feed === feedKind;
            case 'mutate_iota_work_feed': return mutate(args.p_feed, args.p_action, args.p_log_id, args.p_payload || {});
            case 'update_iota_work_feed_status': return mutate(args.p_feed, 'status', args.p_log_id, { status: args.p_status });
            default: throw new Error('지원하지 않는 작업입니다.');
        }
    }),
    storage: {
        from: bucket => ({
            upload: (path, blob) => respond(() => upload(bucket, path, blob)),
            createSignedUrl: (path, seconds = 60) => respond(() => signFile(bucket, path, seconds)),
        }),
    },
};
