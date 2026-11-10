import useWorkFeedLocation from '../../hooks/useWorkFeedLocation';
import { readWorkFeedLocation, writeWorkFeedLocation } from '../../utils/workFeedLocation';
import useMobileTabState from '../../hooks/useMobileTabState';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { WORK_FEEDS } from '../../utils/workFeeds';
import { getDefaultWorkFeed, resolveWorkFeed } from '../../utils/workFeedNavigation';
import WorkFeedPage from './WorkFeedPage';

export default function WorkFeedDiscussionPage({ initialFeed, mobileMode = false }) {
    const { user, memberInfo } = useAuth();
    const location = useWorkFeedLocation();
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [searchTarget, setSearchTarget] = useState(null);
    // Directors return to their default on a fresh menu entry. The URL still restores
    // the selected tab on refresh and preserves explicit post/notification links.
    const rememberPreviousVisit = mobileMode && getDefaultWorkFeed(memberInfo) !== 'committee';
    const [selectedFeed, setSelectedFeed] = useMobileTabState('discussion', rememberPreviousVisit ? user?.id : null, initialFeed || null, ['committee', 'open'], location.feed || initialFeed);
    useEffect(() => {
        if (location.feed) setSelectedFeed(location.feed);
    }, [location.feed]);
    const feedKind = resolveWorkFeed(memberInfo, location.feed || selectedFeed);
    useEffect(() => {
        if (memberInfo) {
            const current = readWorkFeedLocation();
            writeWorkFeedLocation(current.feed || feedKind, current.logId, { replace: true, commentId: current.commentId });
        }
    }, [memberInfo, feedKind, location.feed, location.logId, location.commentId]);
    const selectFeed = (kind) => {
        if (kind === feedKind) return;
        writeWorkFeedLocation(kind);
        setMobileSearchOpen(false);
        setSelectedFeed(kind);
    };
    const tabs = <div role="tablist" aria-label="논의/협업 게시판" className={mobileMode ? 'flex h-11 min-w-0 flex-1 gap-0.5 rounded-[10px] border border-[#3c3c3c] bg-[#262626] p-0.5' : 'flex shrink-0 gap-0.5 rounded-[10px] border border-[#3c3c3c] bg-[#262626] p-0.5'}>
        {Object.entries(WORK_FEEDS).map(([kind, feed]) => <button key={kind} type="button" role="tab" id={'feed-tab-' + kind} aria-selected={feedKind === kind} aria-controls="work-feed-panel" onClick={() => selectFeed(kind)} className={`cursor-pointer font-semibold transition-colors ${mobileMode ? `min-w-0 flex-1 rounded-[7px] px-1 text-[13px] whitespace-nowrap ${feedKind === kind ? 'bg-[#35434b] text-[#c7e1ee]' : 'text-[#A1A1AA] hover:bg-[#333] hover:text-white'}` : `whitespace-nowrap rounded-[7px] px-3 py-1.5 text-[12px] ${feedKind === kind ? 'bg-[#35434b] text-[#c7e1ee]' : 'text-[#A1A1AA] hover:bg-[#333] hover:text-white'}`}`}>{feed.title}</button>)}
    </div>;
    return <section className={mobileMode ? 'w-full min-w-0 px-4 pt-3 pb-6' : 'w-full max-w-[1200px] mx-auto px-6 pt-7 pb-16'}>
        {!mobileMode && <header className="mb-[6px] flex items-center gap-4">
            <h1 className="shrink-0 text-[32px] font-bold text-white">논의/협업 Feed</h1>
            {tabs}
            <p className="min-w-0 flex-1 text-[15px] leading-[26px] text-[#86868B]">{WORK_FEEDS[feedKind].description}</p>
            <div ref={setSearchTarget} className="ml-auto w-[180px] shrink-0" />
        </header>}
        {mobileMode && <div className="mb-3 flex items-center gap-1">
            {tabs}
            <button type="button" aria-label={mobileSearchOpen ? '검색 닫기' : '게시글 검색 열기'} aria-expanded={mobileSearchOpen} onClick={() => setMobileSearchOpen(open => !open)} className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-[#3c3c3c] bg-[#262626] transition-colors hover:bg-[#333] ${mobileSearchOpen ? 'text-[#c7e1ee]' : 'text-[#A1A1AA]'}`}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{mobileSearchOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>}</svg>
            </button>
        </div>}
        <div role="tabpanel" id="work-feed-panel" aria-labelledby={'feed-tab-' + feedKind}>
            <WorkFeedPage key={feedKind} feedKind={feedKind} mobileMode={mobileMode} embedded showDescription={false} mobileSearchOpen={mobileSearchOpen} searchPortalTarget={mobileMode ? null : searchTarget} />
        </div>
    </section>;
}
