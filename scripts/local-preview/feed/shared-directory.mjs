import {readFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {parseEnv} from 'node:util';

const defaultEnvFile = join(homedir(), 'Documents', 'GitHub', 'IGIS Fund Production DP', '.env.local');
const cacheDuration = 60_000;
const pageSize = 500;

export function createSharedDirectoryReader({envFile = process.env.LOCAL_IOTA_ENV_FILE || defaultEnvFile, request = fetch} = {}) {
    let current;
    let pending;
    let nextRefresh = 0;

    async function load() {
        const {VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY} = parseEnv(await readFile(envFile, 'utf8'));
        const url = new URL('/rest/v1/iota_stakeholder_master', VITE_SUPABASE_URL);
        if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')
            || url.username || url.password || !VITE_SUPABASE_ANON_KEY) {
            throw Error('이오타 공용 주소록 설정을 확인해 주세요.');
        }
        const headers = {
            apikey: VITE_SUPABASE_ANON_KEY,
            Authorization: 'Bearer ' + VITE_SUPABASE_ANON_KEY,
            Prefer: 'count=exact',
        };
        url.searchParams.set('select', 'company_name,contact_name,role_category');
        url.searchParams.set('order', 'id.asc');
        url.searchParams.set('limit', String(pageSize));
        const stakeholders = [];
        let total;
        do {
            url.searchParams.set('offset', String(stakeholders.length));
            const response = await request(url, {method: 'GET', headers, redirect: 'error', signal: AbortSignal.timeout(8000)});
            if (!response.ok) throw Error('이오타 공용 주소록 조회에 실패했습니다.');
            const rows = await response.json();
            const range = /^(?:(\d+)-(\d+)|\*)\/(\d+)$/.exec(response.headers.get('content-range') || '');
            const count = Number(range?.[3]);
            if (!Array.isArray(rows) || !Number.isSafeInteger(count) || count < stakeholders.length + rows.length
                || (rows.length > 0 && (Number(range[1]) !== stakeholders.length || Number(range[2]) !== stakeholders.length + rows.length - 1))
                || (total !== undefined && total !== count) || (!rows.length && count !== stakeholders.length)) {
                throw Error('이오타 공용 주소록 응답이 일치하지 않습니다.');
            }
            total = count;
            stakeholders.push(...rows.map(({company_name, contact_name, role_category}) => ({company_name, contact_name, role_category})));
        } while (stakeholders.length < total);
        return {stakeholders, stale: false};
    }

    return async function read() {
        if (current && Date.now() < nextRefresh) return current;
        pending ??= load().then(directory => {
            nextRefresh = Date.now() + cacheDuration;
            current = directory;
            return current;
        }).catch(error => {
            if (!current) throw error;
            nextRefresh = Date.now() + 5_000;
            current = {...current, stale: true};
            return current;
        }).finally(() => { pending = undefined; });
        return pending;
    };
}
