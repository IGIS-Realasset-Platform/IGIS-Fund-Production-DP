import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function WorkFeedMentionSuggestions({ mobileMode, textareaRef, position, mentions, activeIndex, onSelect, onRefresh }) {
    const [placement, setPlacement] = useState(null);
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);
    useLayoutEffect(() => {
        if (!mobileMode) return;
        const place = () => {
            const input = textareaRef.current;
            if (!input) return;
            const rect = input.getBoundingClientRect();
            const viewport = window.visualViewport;
            const top = (viewport?.offsetTop || 0) + 8;
            const bottom = (viewport?.offsetTop || 0) + (viewport?.height || window.innerHeight) - 8;
            const left = (viewport?.offsetLeft || 0) + 12;
            const width = Math.min(rect.width, (viewport?.width || window.innerWidth) - 24);
            const height = Math.min(180, Math.max(44, bottom - top));
            const caretBottom = rect.top + (position?.top || 24);
            const preferred = caretBottom + height <= bottom ? caretBottom : caretBottom - height - 28;
            setPlacement({ position: 'fixed', top: Math.max(top, Math.min(preferred, bottom - height)), left: Math.max(left, Math.min(rect.left, left + (viewport?.width || window.innerWidth) - 24 - width)), width, maxHeight: height });
        };
        place();
        window.addEventListener('scroll', place, true);
        window.addEventListener('resize', place);
        window.visualViewport?.addEventListener('resize', place);
        window.visualViewport?.addEventListener('scroll', place);
        return () => {
            window.removeEventListener('scroll', place, true);
            window.removeEventListener('resize', place);
            window.visualViewport?.removeEventListener('resize', place);
            window.visualViewport?.removeEventListener('scroll', place);
        };
    }, [mobileMode, textareaRef, position?.top, position?.left]);
    useLayoutEffect(() => {
        const list = listRef.current;
        const option = list?.querySelector('[aria-selected="true"]');
        if (!list || !option) return;
        if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
        else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    }, [activeIndex]);
    const list = <div ref={listRef} role="listbox" aria-label="태그할 사람과 부서" style={mobileMode ? placement : undefined}
        className={`z-[120] max-h-[240px] max-w-full touch-pan-y overflow-y-auto overscroll-contain rounded-[10px] border border-[#444] bg-[#202020] py-1.5 shadow-2xl ${mobileMode ? '' : 'absolute left-0 top-[70px] w-[300px]'}`}>
        {mentions.map((mention, index) => <button key={`${mention.type}:${mention.label}`} type="button" role="option" aria-selected={index === activeIndex} tabIndex={-1}
            onPointerDown={event => event.preventDefault()} onMouseDown={event => event.preventDefault()} onClick={() => onSelect(mention)}
            className={`flex min-h-11 w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-[#333] ${index === activeIndex ? 'bg-[#333]' : ''}`}>
            <span className={`shrink-0 rounded-[5px] px-2 py-1 text-[12px] font-black ${mention.type === 'department' ? 'bg-[#2c7eb6]/15 text-[#7fc5ee]' : 'bg-white/[0.07] text-[#bbb]'}`}>{mention.type === 'department' ? '부서' : '담당자'}</span>
            <span className="truncate text-[13px] font-bold text-[#eee]">@{mention.label}</span><span className="ml-auto truncate text-[12px] text-[#777]">{mention.organization}</span>
        </button>)}
        {!mentions.length && <div className="px-3 py-2 text-[12px] text-[#aaa]" role="status">{loading ? '인원 목록을 불러오는 중…' : '일치하는 이름이 없습니다.'}<button type="button" disabled={loading} onPointerDown={event => event.preventDefault()} onMouseDown={event => event.preventDefault()} className="ml-2 cursor-pointer text-[#9bc3df] underline" onClick={async () => { setLoading(true); try { await onRefresh?.(); } catch { /* Keep the input usable on a failed refresh. */ } finally { setLoading(false); } }}>목록 다시 불러오기</button></div>}
    </div>;
    return mobileMode ? (placement ? createPortal(list, document.body) : null) : list;
}
