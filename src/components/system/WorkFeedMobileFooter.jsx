import React from 'react';
import WorkFeedReactionButton from './WorkFeedReactions';
import WorkFeedPostActions from './WorkFeedPostActions';

export default function WorkFeedMobileFooter({ log, permissionText, actorEmail, members, onReact, onEdit, onDelete }) {
    return <div className="mt-3 space-y-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
            <span className="min-w-0 flex-1 break-words text-left text-[12px] font-medium leading-5 text-[#df7f7a]">열람권한: {permissionText || '전체 이용자'}</span>
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] leading-5 text-[#86868B]"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>댓글 {log.metadata?.comments?.length || 0}</span>
        </div>
        <div className="flex min-w-0 items-start gap-2">
            <div className="flex min-w-0 flex-1 items-start">
                <WorkFeedReactionButton mobileMode reactions={log.metadata?.reactions} actorEmail={actorEmail} pilotMembers={members} onToggle={() => onReact('like')} />
            </div>
            <WorkFeedPostActions mobileMode isOwner={actorEmail === log.writer_staff_id} onEdit={onEdit} onDelete={onDelete} />
        </div>
    </div>;
}
