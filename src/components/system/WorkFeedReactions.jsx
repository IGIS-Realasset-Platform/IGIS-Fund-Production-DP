import React from 'react';
import { getProfileImageSrc } from '../../utils/profileImage';

// UI ported from the localhost:8083 Songhyeon feed; IOTA uses email arrays.
export function FeedReactionIcon({ type = 'like', size = 13, active = false, strokeWidth = 2 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill={type === 'like' && active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {type === 'like' ? <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> : <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>}
    </svg>;
}

export function collectFeedReactionEmails(log) {
    return [...new Set([
        ...(log.metadata?.reactions?.like || []),
        ...(log.metadata?.reactions?.check || []),
        ...(log.metadata?.comments || []).flatMap(comment => [
            ...(comment.reactions?.like || []), ...(comment.reactions?.check || []),
        ]),
    ].map(email => email.toLowerCase()))];
}

export function FeedReactionAvatarStack({ emails = [], pilotMembers = [], label = '반응', maxVisible = 3 }) {
    if (!emails.length) return null;
    const displayed = emails.slice(0, maxVisible);
    const extraCount = emails.length - displayed.length;
    return <div className="flex items-center ml-[2px]" role="list" aria-label={`${label} 반응자 ${emails.length}명`}>
        {displayed.map((email, index) => {
            const member = pilotMembers.find(member => member.email?.toLowerCase() === email.toLowerCase());
            const name = member?.staff_name || email.split('@')[0];
            const group = member?.org_name || '팀원';
            return <div key={email} role="listitem" tabIndex={0} aria-label={`${name}, ${group}`} className={`relative w-[20px] h-[20px] rounded-full border-[1.5px] border-[#222] bg-[#333] group/reactor overflow-visible focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#86868B] ${index > 0 ? '-ml-[6px]' : ''}`} style={{ zIndex: 10 - index }}>
                <img src={getProfileImageSrc(name)} alt="" className="w-full h-full object-cover rounded-full" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                <div role="tooltip" className="absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-[6px] hidden group-hover/reactor:flex group-focus-within/reactor:flex bg-[#222] border border-[#333] px-[8px] py-[4px] rounded-[6px] whitespace-nowrap text-[11px] text-[#E5E5E5] shadow-xl z-[99] pointer-events-none flex-col items-center leading-tight">
                    <span className="font-bold">{name}</span><span className="text-[#86868B] text-[10px]">{group}</span>
                </div>
            </div>;
        })}
        {extraCount > 0 && <div role="listitem" aria-label={`${extraCount}명 더 있음`} className="w-[20px] h-[20px] rounded-full border-[1.5px] border-[#222] bg-[#333] flex items-center justify-center -ml-[6px] relative z-0"><span aria-hidden="true" className="text-[9px] text-[#A1A1AA] font-bold">+{extraCount}</span></div>}
    </div>;
}

export function MobileFeedEngagementSummary({ log, pilotMembers }) {
    const emails = collectFeedReactionEmails(log);
    const commentCount = log.metadata?.comments?.length || 0;
    return <div className="flex shrink-0 items-center gap-3" aria-label="게시글 반응 및 댓글">
        <div className="flex items-center gap-1" aria-label={`좋아요·체크 반응자 ${emails.length}명`}>
            <span className="inline-flex items-center gap-0.5" aria-hidden="true"><FeedReactionIcon type="like" size={13} /><FeedReactionIcon type="check" size={13} /></span>
            {emails.length ? <FeedReactionAvatarStack emails={emails} pilotMembers={pilotMembers} label="본문과 댓글 좋아요·체크" maxVisible={5} /> : <span>0</span>}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1" aria-label={`댓글 ${commentCount}개`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            {commentCount}
        </span>
    </div>;
}

export default function WorkFeedReactionButton({ type, reactions, actorEmail, pilotMembers, disabled, onToggle, compact = false }) {
    const emails = reactions?.[type] || [];
    const active = emails.some(email => email.toLowerCase() === actorEmail?.toLowerCase());
    const isLike = type === 'like';
    return <div className="flex items-center gap-1">
        <button type="button" disabled={disabled} onClick={event => { event.stopPropagation(); onToggle(); }} aria-label={isLike ? '좋아요' : '확인'} aria-pressed={active}
            className={`${compact ? 'h-7 px-2' : 'h-8 px-2.5'} flex cursor-pointer items-center gap-1 rounded-[7px] border text-[12px] font-semibold transition-colors disabled:cursor-default disabled:opacity-60 ${active ? (isLike ? 'border-[#cc8580]/45 bg-[#cc8580]/10 text-[#cc8580]' : 'border-[#6f9fc7]/45 bg-[#6f9fc7]/10 text-[#82add0]') : 'border-[#3A3A3C] text-[#86868B] hover:border-[#555] hover:text-white'}`}>
            <FeedReactionIcon type={type} active={active} />{emails.length}
        </button>
        <FeedReactionAvatarStack emails={emails} pilotMembers={pilotMembers} label={isLike ? '좋아요' : '확인'} />
    </div>;
}
