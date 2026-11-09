import React, { useRef, useState } from 'react';

const MAX_VISIBLE_OPTIONS = 20;

// Avoid the native datalist picker in the iPhone webview and keep large directories
// from becoming thousands of interactive DOM nodes when the keyboard opens.
export default function StakeholderAutocomplete({ id, label, placeholder, value, options, onChange, onSelect, onRefresh, describedBy }) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [refreshFailed, setRefreshFailed] = useState(false);
    const pending = useRef(false);
    const visibleOptions = options.slice(0, MAX_VISIBLE_OPTIONS);
    const choose = name => {
        onSelect(name);
        setOpen(false);
        setActive(-1);
    };
    const refresh = async () => {
        if (!onRefresh || pending.current) return;
        pending.current = true;
        setLoading(true);
        setRefreshFailed(false);
        try { await onRefresh(); }
        catch { setRefreshFailed(true); }
        finally { pending.current = false; setLoading(false); }
    };

    return <div className="relative col-span-2 min-w-0" onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
        <input aria-label={label} aria-describedby={describedBy} role="combobox" aria-autocomplete="list"
            aria-expanded={open} aria-controls={`${id}-options`}
            aria-activedescendant={open && visibleOptions[active] ? `${id}-option-${active}` : undefined}
            autoComplete="off" autoCorrect="off" spellCheck={false} value={value} placeholder={placeholder}
            onFocus={() => { setOpen(true); setActive(-1); void refresh(); }}
            onChange={event => { onChange(event.target.value); setOpen(true); setActive(-1); }}
            onKeyDown={event => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === 'Escape') setOpen(false);
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault(); setOpen(true);
                    setActive(current => visibleOptions.length ? (current + (event.key === 'ArrowDown' ? 1 : -1) + visibleOptions.length) % visibleOptions.length : -1);
                }
                if (event.key === 'Enter' && open && visibleOptions[active]) { event.preventDefault(); choose(visibleOptions[active]); }
            }}
            className="h-11 w-full min-w-0 rounded-[9px] border border-[#414141] bg-[#222] px-3 text-[16px] text-white outline-none focus:border-[#4f89b7]" />
        {open && <div id={`${id}-options`} role="listbox" aria-label={`${label} 검색 결과`} className="relative mt-2 max-h-[180px] w-full touch-pan-y overflow-y-auto overscroll-contain rounded-[9px] border border-[#444] bg-[#222] py-1 shadow-xl">
            {visibleOptions.map((name, index) => <button key={name} id={`${id}-option-${index}`} type="button" role="option" tabIndex={-1} aria-selected={value === name}
                onPointerDown={event => event.preventDefault()} onMouseDown={event => event.preventDefault()} onClick={() => choose(name)}
                className={`block min-h-11 w-full px-3 py-2 text-left text-[13px] text-[#ddd] transition-colors hover:bg-[#333] ${active === index ? 'bg-[#333]' : ''}`}>{name}</button>)}
            {options.length > MAX_VISIBLE_OPTIONS && <p className="px-3 py-2 text-[12px] text-[#999]">검색어를 입력하면 더 정확하게 찾을 수 있습니다.</p>}
            {visibleOptions.length === 0 && <p role="status" className="px-3 py-2 text-[12px] text-[#999]">{loading ? '불러오는 중…' : refreshFailed ? '목록을 불러오지 못했습니다. 직접 입력할 수 있습니다.' : '일치하는 항목이 없습니다. 직접 입력할 수 있습니다.'}</p>}
        </div>}
    </div>;
}
