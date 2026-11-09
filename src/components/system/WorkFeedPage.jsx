import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { WORK_FEEDS } from '../../utils/workFeeds';
import WorkspaceActivityLog from './workspace/WorkspaceActivityLog';
import { createWorkFeedLoader } from '../../utils/workFeedLoader';
import { fetchWorkspaceDirectoryData } from '../../utils/workspaceDirectoryCache';

const loadWorkFeed = createWorkFeedLoader(supabase);

export default function WorkFeedPage({ feedKind = 'committee' }) {
    const { user, memberInfo, loading } = useAuth();
    const [result, setResult] = useState(null);
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
        <div className="w-full max-w-[1200px] mx-auto px-[24px] pt-[28px] pb-[100px]">
            <h1 className="text-[32px] font-bold text-white tracking-tight leading-none mb-[8px]">{feed.title}</h1>
            <p className="text-[16px] text-[#86868B] leading-[26px] md:pr-[196px]">
                {feedKind === 'committee' ? '주요 이슈를 논의하고 검토 의견과 진행 상황을 확인합니다.' : '업무 이슈와 아이디어를 공유하고 자유롭게 의견을 나눕니다.'}
            </p>
            {!current || (current.access && !memberInfo) ? (
                <div className="py-[48px] text-center text-[#A1A1AA]">불러오는 중입니다...</div>
            ) : current.access ? (
                <WorkspaceActivityLog key={scope} initialFeedResult={current.initialFeedResult} canCreate={current.canCreate} workspaceCode={feed.code} workspaceLabel={feed.title} feedKind={feedKind} />
            ) : (
                <div role="alert" className="rounded-[16px] border border-[#333] bg-[#252525] p-[40px] text-center text-[#A1A1AA]">
                    {current.accessError ? '접근 권한을 확인하지 못했습니다. 새로고침 후 다시 시도해 주세요.' : '접근 권한이 없습니다.'}
                </div>
            )}
        </div>
    );
}
