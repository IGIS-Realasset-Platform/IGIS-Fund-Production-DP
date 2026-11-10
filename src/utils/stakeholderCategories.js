export const FINANCIAL_STAKEHOLDER_CATEGORIES = ['LP', '대주', 'SI(기업)'];

export function normalizeStakeholderCategory(category) {
    const value = String(category || '').trim();
    return ({ '투자자': 'LP', 'SI': 'SI(기업)' })[value] || value;
}

export function groupStakeholderCompanies(rows, category, query = '') {
    const groups = new Map();
    const term = query.trim().toLocaleLowerCase();
    for (const row of rows) {
        if (normalizeStakeholderCategory(row.role_category) !== category || !row.company_name) continue;
        if (!groups.has(row.company_name)) groups.set(row.company_name, []);
        groups.get(row.company_name).push(row);
    }
    return [...groups].filter(([name, contacts]) => !term || name.toLocaleLowerCase().includes(term)
        || contacts.some(row => String(row.contact_name || '').toLocaleLowerCase().includes(term)))
        .sort(([a], [b]) => a.localeCompare(b, 'ko'));
}
