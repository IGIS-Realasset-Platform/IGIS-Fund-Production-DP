import { getProfileImageSrc } from '../../utils/profileImage';
import React, { useRef, useState } from 'react';
import { buildMentionCandidates } from '../../utils/mentionHelpers';
import WorkFeedReactionButton from './WorkFeedReactions';
import { isRecentFeedPost } from '../../utils/workFeedIndicators';

function CommentInput({ label, value, onChange, members, onRefreshDirectory, placeholder, children, editing = false, mobileMode = false }) {
    const textarea = useRef(null);
    const [mention, setMention] = useState(null);
    const options = mention ? buildMentionCandidates(members).filter(option => `${option.label} ${option.organization}`.toLowerCase().includes(mention.query.toLowerCase())).slice(0, 8) : [];
    return <div className="relative">
        <textarea ref={textarea} aria-label={label} value={value} onFocus={onRefreshDirectory} onChange={event => {
            onChange(event.target.value);
            const cursor = event.target.selectionStart;
            const match = event.target.value.slice(0, cursor).match(/@([^\s@]*)$/u);
            setMention(match ? { query: match[1], start: match.index, end: cursor } : null);
        }} onKeyDown={event => { if (event.key === 'Escape') setMention(null); }} placeholder={placeholder} className={mobileMode ? 'min-h-[88px] w-full min-w-0 resize-y rounded-[16px] border border-[#3A3A3C] bg-[#29292B] p-3 text-[16px] leading-6 text-white outline-none focus:border-[#6f9fc7]' : editing ? 'min-h-[88px] w-full resize-y rounded-[16px] border border-[#4b5965] bg-[#29292B] px-3 py-2 text-[13px] leading-6 text-white outline-none focus:border-[#6f9fc7]' : 'min-h-[76px] w-full resize-y rounded-[16px] border border-[#3A3A3C] bg-[#29292B] p-3 pr-24 text-[13px] leading-6 text-white outline-none focus:border-[#6f9fc7]'} />
        {options.length > 0 && <div className="absolute bottom-full left-0 z-50 mb-2 max-h-[240px] w-[300px] max-w-full overflow-y-auto rounded-[10px] border border-[#444] bg-[#202020] py-1.5 shadow-2xl">
            {options.map(option => <button key={`${option.type}:${option.label}`} type="button" onMouseDown={event => event.preventDefault()} onClick={() => {
                const text = `${value.slice(0, mention.start)}@${option.label} ${value.slice(mention.end)}`;
                const cursor = mention.start + option.label.length + 2;
                onChange(text); setMention(null);
                requestAnimationFrame(() => { textarea.current?.focus(); textarea.current?.setSelectionRange(cursor, cursor); });
            }} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-[#333]"><span className="shrink-0 text-[11px] text-[#7fc5ee]">{option.type === 'department' ? '부서' : '담당자'}</span><span className="truncate text-[13px] font-bold text-[#eee]">@{option.label}</span><span className="ml-auto truncate text-[12px] text-[#777]">{option.organization}</span></button>)}
        </div>}
        {children}
    </div>;
}

export default function WorkFeedComments({ comments = [], actorEmail, members, onRefreshDirectory, onSave, onEdit, onDelete, onReact, renderText, mobileMode = false }) {
    const [draft, setDraft] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const submit = async (editing) => {
        if (pending) return;
        const text = editing ? editDraft : draft;
        if (!text.trim()) return;
        setPending(true); setError('');
        try {
            const saved = await (editing ? onEdit(editingId, text) : onSave(text));
            if (saved === false) return;
            if (editing) { setEditingId(null); setEditDraft(''); } else setDraft(current => current === text ? '' : current);
        } catch (failure) { setError(failure.message || '댓글을 저장하지 못했습니다. 다시 시도해 주세요.'); }
        finally { setPending(false); }
    };
    return <div className="[&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed">
        <div className="mt-4 space-y-2">{comments.map(comment => <div key={comment.id} className="rounded-[16px] border border-[#333] bg-white/[0.02] px-4 pb-3 pt-4">
            <div className="flex items-start gap-3">
                <img src={getProfileImageSrc(comment.author)} alt={comment.author} className="h-7 w-7 shrink-0 rounded-full border border-white/10 bg-[#333] object-cover" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-[12px] text-white">{comment.author}</strong>
                        {isRecentFeedPost({created_at: comment.created_at, metadata:{content_updated_at: comment.updated_at}}) && <b className="rounded-[3px] bg-[#ff3b30] px-1 py-0.5 text-[10px] leading-none text-white">N</b>}
                        <span className="text-[11px] text-[#86868B]">{new Date(comment.created_at).toLocaleString('ko-KR', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})}</span>
                        {comment.updated_at && <span className="text-[10px] text-[#686868]">수정됨</span>}
                        {comment.author_email === actorEmail && <div className="ml-auto flex items-center gap-3">
                            <button type="button" disabled={pending} onClick={() => { setEditingId(comment.id); setEditDraft(comment.text); setError(''); }} className="text-[11px] text-[#8eb8dc] hover:text-[#b7d7f2]">수정</button>
                            <button type="button" disabled={pending} onClick={() => onDelete(comment.id)} className="text-[11px] text-[#bd716d] hover:text-[#dd8b86]">삭제</button>
                        </div>}
                    </div>
                    {editingId === comment.id ? <div className="mt-2">
                        <CommentInput mobileMode={mobileMode} editing label="댓글 수정" value={editDraft} onChange={setEditDraft} members={members} onRefreshDirectory={onRefreshDirectory} />
                        <div className="mt-2 flex justify-end gap-2"><button type="button" disabled={pending} onClick={() => setEditingId(null)} className="h-8 rounded-[7px] border border-[#444] px-3 text-[11px] text-[#A1A1AA] hover:bg-[#333] disabled:opacity-40">취소</button><button type="button" disabled={pending || !editDraft.trim()} onClick={() => submit(true)} className="h-8 rounded-[7px] bg-[#3279b4] px-3 text-[11px] font-bold text-white hover:bg-[#3e89c6] disabled:opacity-40">{pending ? '저장 중...' : '저장'}</button></div>
                    </div> : <p className="mt-2 whitespace-pre-wrap break-words text-[14px] leading-6 text-[#B8B8BD]">{renderText(comment.text)}</p>}
                    <div className={`mt-3 flex gap-3 ${mobileMode ? "min-w-0 flex-wrap" : ""}`}><WorkFeedReactionButton mobileMode={mobileMode} compact reactions={comment.reactions} actorEmail={actorEmail} pilotMembers={members} onToggle={() => onReact('like', comment.id)} /></div>
                </div>
            </div>
        </div>)}</div>
        <div className="mt-4"><CommentInput mobileMode={mobileMode} label="댓글 작성" value={draft} onChange={setDraft} members={members} onRefreshDirectory={onRefreshDirectory} placeholder="댓글을 입력하세요... (@를 입력하여 담당자를 멘션할 수 있습니다)">
            <button type="button" disabled={pending || !draft.trim()} onClick={() => submit(false)} className={`${mobileMode ? "mt-2 h-11 w-full" : "absolute bottom-3 right-3 h-8"} rounded-[7px] bg-[#3279b4] px-4 text-[12px] font-bold text-white hover:bg-[#3e89c6] disabled:opacity-40`}>{pending && !editingId ? '저장 중...' : '댓글 등록'}</button>
        </CommentInput></div>
        {error && <p role="alert" className="mt-2 text-[12px] text-[#df827e]">{error}</p>}
    </div>;
}
