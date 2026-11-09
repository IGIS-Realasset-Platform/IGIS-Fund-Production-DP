import { COMMITTEE_READERS } from './workFeedPermissions.js';

// This chooses the landing tab only; server-side post permissions are unchanged.
export function getDefaultWorkFeed(member) {
    return COMMITTEE_READERS.includes(String(member?.staff_name || member?.name || '').trim()) ? 'committee' : 'open';
}

export function resolveWorkFeed(member, requestedFeed) {
    return ['committee', 'open'].includes(requestedFeed) ? requestedFeed : getDefaultWorkFeed(member);
}

export const MOBILE_PRIMARY_TABS = [
    { id: 0, label: '통합업무' },
    { id: 2, label: '기능셀' },
    { id: 5, label: '논의/협업' },
    { id: 3, label: 'MY' },
];
export const isMobileTabActive = (activeTab, tabId) => activeTab === tabId || (tabId === 0 && activeTab === 1);
