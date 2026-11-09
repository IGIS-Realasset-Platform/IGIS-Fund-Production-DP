import React from 'react';

export default function WorkFeedSearchField({ value, onChange, mobileMode = false, autoFocus = false }) {
    return <div className={mobileMode ? 'relative w-full min-w-0' : 'relative'}>
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#86868B]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        </span>
        <input autoFocus={autoFocus} type="search" aria-label="게시글 검색" placeholder="검색어 입력..." value={value} onChange={event => onChange(event.target.value)}
            className={`min-w-0 rounded-[8px] border border-[#333] bg-[#222] pl-9 pr-3 text-white outline-none transition-colors hover:border-[#444] focus:border-[#2997ff] ${mobileMode ? 'h-11 w-full text-[16px]' : 'w-[180px] py-[6px] text-[12px]'}`} />
    </div>;
}
