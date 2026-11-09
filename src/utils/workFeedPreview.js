// Visual simulation for existing admins only. This does not grant or revoke access;
// real readers continue to receive the server-filtered list/RLS response.
export function canPreviewWorkFeed(member) {
    return ['전기영', '이시정', '이관용'].includes(member?.staff_name);
}

// Keep this whitelist aligned with list_iota_committee_feed's denied response.
export function maskCommitteePostForPreview(log) {
    const metadata = {
        workspace_code: 'FEED_COMMITTEE',
        workspace_label: '운영위 논의사항',
    };
    for (const key of ['project_name', 'triage_type', 'issue_status', 'priority']) {
        if (log.metadata?.[key] != null) metadata[key] = log.metadata[key];
    }
    return {
        log_id: log.log_id, feed_kind: 'committee', can_read: false,
        work_date: log.work_date, created_at: log.created_at, writer_name: log.writer_name,
        summary: null, raw_text: null, writer_staff_id: null,
        iota_seoul_log_stakeholders: [], metadata,
    };
}
