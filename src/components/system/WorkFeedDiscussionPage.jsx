import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WORK_FEEDS } from '../../utils/workFeeds';
import { resolveWorkFeed } from '../../utils/workFeedNavigation';
import WorkFeedPage from './WorkFeedPage';

export default function WorkFeedDiscussionPage({ initialFeed, mobileMode = false }) {
    const { memberInfo } = useAuth();
    const [searchTarget, setSearchTarget] = useState(null);
    const [selectedFeed, setSelectedFeed] = useState(initialFeed || null);
    const feedKind = resolveWorkFeed(memberInfo, selectedFeed);
    const selectFeed = (kind) => {
        if (kind === feedKind) return;
        const url = new URL(window.location.href);
        url.searchParams.delete('logId');
        url.searchParams.delete('commentId');
        window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
        setSelectedFeed(kind);
    };
    const tabs = <div role="tablist" aria-label="논의/협업 게시판" className={`flex border border-[#3c3c3c] bg-[#262626] ${mobileMode ? 'mb-4 gap-1 rounded-[12px] p-1' : 'shrink-0 gap-0.5 rounded-[10px] p-0.5'}`}>
        {Object.entries(WORK_FEEDS).map(([kind, feed]) => <button key={kind} type="button" role="tab" id={'feed-tab-' + kind} aria-selected={feedKind === kind} aria-controls="work-feed-panel" onClick={() => selectFeed(kind)} className={`cursor-pointer font-semibold transition-colors ${mobileMode ? 'flex-1 rounded-[9px] px-3 py-2.5 text-[14px]' : 'whitespace-nowrap rounded-[7px] px-3 py-1.5 text-[12px]'} ${feedKind === kind ? 'bg-[#35434b] text-[#c7e1ee]' : 'text-[#A1A1AA] hover:bg-[#333] hover:text-white'}`}>{feed.title}</button>)}
    </div>;
    return <section className={mobileMode ? 'w-full min-w-0 px-4 pt-3 pb-6' : 'w-full max-w-[1200px] mx-auto px-6 pt-7 pb-16'}>
        <header className={mobileMode ? 'mb-[11px]' : 'mb-[6px] flex items-center gap-4'}>
            <h1 className={mobileMode ? 'text-[19px] font-bold tracking-tight text-white' : 'shrink-0 text-[32px] font-bold text-white'}>논의/협업</h1>
            {!mobileMode && tabs}
            {!mobileMode && <p className="min-w-0 flex-1 text-[15px] leading-[26px] text-[#86868B]">{WORK_FEEDS[feedKind].description}</p>}
            {!mobileMode && <div ref={setSearchTarget} className="ml-auto w-[180px] shrink-0" />}
        </header>
        {mobileMode && tabs}
        <div role="tabpanel" id="work-feed-panel" aria-labelledby={'feed-tab-' + feedKind}>
            <WorkFeedPage key={feedKind} feedKind={feedKind} mobileMode={mobileMode} embedded showDescription={false} searchPortalTarget={mobileMode ? null : searchTarget} />
        </div>
    </section>;
}
