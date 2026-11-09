import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WORK_FEEDS } from '../../utils/workFeeds';
import { resolveWorkFeed } from '../../utils/workFeedNavigation';
import WorkFeedPage from './WorkFeedPage';

export default function WorkFeedDiscussionPage({ initialFeed, mobileMode = false }) {
    const { memberInfo } = useAuth();
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
    return <section className={mobileMode ? 'w-full min-w-0 px-3 pt-4 pb-6' : 'w-full max-w-[1200px] mx-auto px-6 pt-7 pb-16'}>
        <header className={mobileMode ? 'mb-4' : 'mb-5 flex items-baseline gap-5'}>
            <h1 className={mobileMode ? 'text-[22px] font-bold text-white' : 'shrink-0 text-[32px] font-bold text-white'}>논의/협업</h1>
            {!mobileMode && <p className="min-w-0 text-[16px] leading-[26px] text-[#86868B]">{WORK_FEEDS[feedKind].description}</p>}
        </header>
        <div role="tablist" aria-label="논의/협업 게시판" className="mb-4 flex gap-1 rounded-[12px] border border-[#3c3c3c] bg-[#262626] p-1">
            {Object.entries(WORK_FEEDS).map(([kind, feed]) => <button key={kind} type="button" role="tab" id={'feed-tab-' + kind} aria-selected={feedKind === kind} aria-controls="work-feed-panel" onClick={() => selectFeed(kind)} className={`flex-1 cursor-pointer rounded-[9px] px-3 py-2.5 text-[14px] font-semibold transition-colors ${feedKind === kind ? 'bg-[#35434b] text-[#c7e1ee]' : 'text-[#A1A1AA] hover:bg-[#333] hover:text-white'}`}>{feed.title}</button>)}
        </div>
        <div role="tabpanel" id="work-feed-panel" aria-labelledby={'feed-tab-' + feedKind}>
            <WorkFeedPage key={feedKind} feedKind={feedKind} mobileMode={mobileMode} embedded showDescription={mobileMode} />
        </div>
    </section>;
}
