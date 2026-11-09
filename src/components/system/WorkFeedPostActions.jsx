import React from 'react';

export default function WorkFeedPostActions({ mobileMode = false, isOwner, status, pending, error, onStatusChange, onEdit, onDelete }) {
    return <div className={mobileMode ? 'grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1' : 'flex shrink-0 flex-wrap items-center justify-end gap-2'}>
        <label className={`flex items-center rounded-[7px] border border-[#3e566b] bg-[#24313b] ${mobileMode ? 'h-8 min-w-0 justify-between gap-1 px-1.5' : 'h-8 gap-2 px-2'}`}>
            <span className="shrink-0 text-[11px] font-bold text-[#8eb8dc]">진행상태</span>
            {isOwner ? <select aria-label="게시글 진행상태 변경" value={status} disabled={pending} onChange={event => onStatusChange(event.target.value)} className="min-w-0 cursor-pointer bg-transparent text-[12px] font-bold text-white outline-none disabled:cursor-wait disabled:opacity-50">
                {['신규', '검토중', '진행중', '보류', '완료'].map(value => <option key={value} value={value} className="bg-[#222] text-white">{value}</option>)}
            </select> : <span className="text-[12px] font-bold text-white">{status}</span>}
        </label>
        {isOwner && <div className={mobileMode ? 'contents' : 'flex shrink-0 items-center gap-2'}>
            <button type="button" onClick={onEdit} className={`${mobileMode ? 'h-8 min-w-0 px-2 text-[11px]' : 'h-8 px-3 text-[12px]'} cursor-pointer rounded-[7px] border border-[#444] text-[#A1A1AA] hover:text-white`}>수정하기</button>
            <button type="button" onClick={onDelete} className={`${mobileMode ? 'h-8 min-w-0 px-2 text-[11px]' : 'h-8 px-3 text-[12px]'} cursor-pointer rounded-[7px] border border-[#5a3937] text-[#cc8580] hover:bg-[#333]`}>삭제</button>
        </div>}
        {error && <p role="alert" className={`${mobileMode ? 'col-span-3' : ''} w-full text-right text-[12px] text-[#df827e]`}>{error}</p>}
    </div>;
}
