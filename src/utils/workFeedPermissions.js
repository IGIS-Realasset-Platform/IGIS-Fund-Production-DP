export const COMMITTEE_READERS = ['이철승', '강순용', '권순일', '양준모'];

const uniqueNames = values => [...new Set((Array.isArray(values) ? values : []).filter(value => typeof value === 'string'))];

export function getWorkFeedPermissions(feedKind, permissions) {
    if (feedKind === 'committee') return {
        groups: [],
        // Defaults apply only when no audience was stored. An explicit empty list stays private.
        individuals: Array.isArray(permissions?.individuals)
            ? uniqueNames(permissions.individuals) : [...COMMITTEE_READERS],
    };
    return {
        groups: uniqueNames(permissions?.groups),
        individuals: uniqueNames(permissions?.individuals),
    };
}
