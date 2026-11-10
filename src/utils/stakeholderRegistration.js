import { normalizeStakeholderCategory } from './stakeholderCategories.js';
import { executeWithTimeout } from './supabaseHelper.js';

export function normalizeStakeholder(company, contact, category) {
    return {
        company_name: String(company || '').trim(),
        contact_name: String(contact || '').trim() || null,
        role_category: normalizeStakeholderCategory(category) || null,
    };
}

export function findRegisteredStakeholder(rows, input) {
    return rows.find(row => String(row.company_name || '').trim() === input.company_name
        && (!input.contact_name || String(row.contact_name || '').trim() === input.contact_name));
}

export async function registerStakeholder(client, input) {
    if (!input.company_name) throw new Error('회사·기관명을 입력해주세요.');
    if (!input.role_category) throw new Error('이해관계자 분류를 선택해주세요.');
    const findExisting = async () => {
        let query = client.from('iota_stakeholder_master').select('*').eq('company_name', input.company_name);
        if (input.contact_name) query = query.eq('contact_name', input.contact_name);
        const result = await executeWithTimeout(query.limit(1));
        if (result.error) throw result.error;
        return result.data?.[0];
    };
    // Check the DB too: another user or an earlier retry may have registered it.
    const existing = await findExisting();
    if (existing) return existing;
    const result = await executeWithTimeout(client.from('iota_stakeholder_master').insert(input).select('*').single());
    if (result.error?.code === '23505') {
        const concurrentRegistration = await findExisting();
        if (concurrentRegistration) return concurrentRegistration;
    }
    if (result.error) throw result.error;
    return result.data;
}
