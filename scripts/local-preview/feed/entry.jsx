import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import WorkFeedPage from 'source-feed-page';
import {WORK_FEEDS} from 'source-feed-definitions';

function Feed() {
    const media = window.matchMedia('(max-width: 767px)');
    const [mobileMode, setMobileMode] = useState(media.matches);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchTarget, setSearchTarget] = useState(null);

    useEffect(() => {
        const resize = event => setMobileMode(event.matches);
        const navigate = () => window.dispatchEvent(new PopStateEvent('popstate'));
        media.addEventListener('change', resize);
        if (window.parent !== window) window.parent.addEventListener('popstate', navigate);
        return () => {
            media.removeEventListener('change', resize);
            if (window.parent !== window) window.parent.removeEventListener('popstate', navigate);
        };
    }, []);

    return <section className="studio-work-feed w-full min-w-0 pb-6">
        <header className="studio-feed-header">
            <div className="studio-feed-heading">
                <h1>논의·협업 Feed</h1>
                {!mobileMode && <p className="min-w-0 text-[15px] leading-[26px] text-[#86868B]">{WORK_FEEDS.open.description}</p>}
            </div>
            {!mobileMode && <div ref={setSearchTarget} className="ml-auto w-[180px] shrink-0" />}
            {mobileMode && <button type="button" aria-label={mobileSearchOpen ? '검색 닫기' : '게시글 검색 열기'} aria-expanded={mobileSearchOpen} onClick={() => setMobileSearchOpen(open => !open)} className="studio-feed-search-toggle grid h-11 w-11 cursor-pointer place-items-center rounded-[10px] border border-[#3c3c3c] bg-[#262626] text-[#A1A1AA] transition-colors hover:bg-[#333]">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{mobileSearchOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>}</svg>
            </button>}
        </header>
        <WorkFeedPage feedKind="open" embedded showDescription={false} mobileMode={mobileMode} mobileSearchOpen={mobileSearchOpen} searchPortalTarget={mobileMode ? null : searchTarget} />
    </section>;
}

createRoot(document.getElementById('feed')).render(<Feed />);
