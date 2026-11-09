import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { WORK_FEEDS } from '../../utils/workFeeds';
import WorkspaceActivityLog from './workspace/WorkspaceActivityLog';
import { createWorkFeedLoader } from '../../utils/workFeedLoader';
import { fetchWorkspaceDirectoryData } from '../../utils/workspaceDirectoryCache';
import { canPreviewWorkFeed } from '../../utils/workFeedPreview';

const loadWorkFeed = createWorkFeedLoader(supabase);

export default function WorkFeedPage({ feedKind = 'committee', mobileMode = false, embedded = false, showDescription = true, searchPortalTarget = null, mobileSearchOpen = true }) {
    const { user, memberInfo, loading } = useAuth();
    const [result, setResult] = useState(null);
    const [previewDenied, setPreviewDenied] = useState(false);
    const canPreview = feedKind === 'committee' && canPreviewWorkFeed(memberInfo);
    const isPreview = canPreview && previewDenied;
    const scope = JSON.stringify([user?.id, feedKind, memberInfo?.is_active]);
    const current = !loading && result?.scope === scope ? result : null;
    const feed = WORK_FEEDS[feedKind];

    useEffect(() => {
        let active = true;
        setResult(null);
        if (loading) return () => { active = false; };
        if (!user) { setResult({ scope, access: false }); return () => { active = false; }; }
        // Directory loading must not hold up the feed. The shared directory request
        // is reused when the list mounts.
        fetchWorkspaceDirectoryData().catch(error => console.error('Feed directory preload failed.', error));
        loadWorkFeed({ feedKind, userId: user.id }).then(data => {
            if (active) setResult({ scope, ...data });
        }).catch(() => { if (active) setResult({ scope, access: false, accessError: true }); });
        return () => { active = false; };
    }, [scope, loading]);

    return (
        <div className={embedded ? "w-full min-w-0" : "w-full max-w-[1200px] mx-auto px-[24px] pt-[28px] pb-[100px]"}>
            {!embedded && <h1 className="text-[32px] font-bold text-white tracking-tight leading-none mb-[8px]">{feed.title}</h1>}
            {showDescription && <p className="mb-3 text-[16px] text-[#86868B] leading-[26px]">{feed.description}</p>}
            {!current || (current.access && !memberInfo) ? (
                <div className="py-[48px] text-center text-[#A1A1AA]">불러오는 중입니다...</div>
            ) : current.access ? (
                <>
                    {canPreview && <div className="mb-2 flex flex-wrap items-center justify-end gap-2 text-[12px] text-[#A1A1AA]">
                        {isPreview && <span role="status">미리보기 중 · 열람권한이 없는 사용자의 화면입니다.</span>}
                        <button type="button" aria-pressed={isPreview} onClick={() => setPreviewDenied(value => !value)}
                            className="cursor-pointer rounded-lg border border-[#555] px-3 py-2 text-[#C7C7CC] transition-colors hover:bg-[#333]">
                            {isPreview ? '미리보기 종료' : '권한 없는 화면 보기'}
                        </button>
                    </div>}
                    <WorkspaceActivityLog mobileSearchOpen={mobileSearchOpen} searchPortalTarget={searchPortalTarget} mobileMode={mobileMode} key={`${scope}:${isPreview}`} initialFeedResult={current.initialFeedResult} canCreate={!isPreview && current.canCreate} previewDenied={isPreview} workspaceCode={feed.code} workspaceLabel={feed.title} feedKind={feedKind} />
                </>
            ) : (
                <div role="alert" className="rounded-[16px] border border-[#333] bg-[#252525] p-[40px] text-center text-[#A1A1AA]">
                    {current.accessError ? '접근 권한을 확인하지 못했습니다. 새로고침 후 다시 시도해 주세요.' : '접근 권한이 없습니다.'}
                </div>
            )}
        </div>
    );
}
