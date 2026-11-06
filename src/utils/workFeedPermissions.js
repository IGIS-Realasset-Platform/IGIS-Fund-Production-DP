export const COMMITTEE_READERS = ['이철승', '강순용', '권순일', '양준모'];

export function getWorkFeedPermissions(feedKind, permissions) {
    if (feedKind === 'committee') return { groups: [], individuals: [...COMMITTEE_READERS] };
    return {
        groups: [...new Set((permissions?.groups || []).filter(value => typeof value === 'string'))],
        individuals: [...new Set((permissions?.individuals || []).filter(value => typeof value === 'string'))],
    };
}
