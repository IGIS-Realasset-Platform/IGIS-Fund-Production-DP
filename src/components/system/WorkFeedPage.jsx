import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { WORK_FEEDS } from '../../utils/workFeeds';
import WorkspaceActivityLog from './workspace/WorkspaceActivityLog';

export default function WorkFeedPage({ feedKind = 'committee' }) {
    const { user, memberInfo, loading } = useAuth();
    const [access, setAccess] = useState(null);
    const [canCreate, setCanCreate] = useState(false);
    const [accessError, setAccessError] = useState(false);
    const feed = WORK_FEEDS[feedKind];

    useEffect(() => {
        let active = true;
        setAccess(null);
        setCanCreate(false);
        setAccessError(false);
        if (loading) return () => { active = false; };
        if (!user) { setAccess(false); return () => { active = false; }; }
        Promise.all([
            supabase.rpc('can_access_iota_work_feed', { p_feed: 'open' }),
            supabase.rpc('can_access_iota_work_feed', { p_feed: feedKind }),
        ]).then(([listing, writing]) => {
            if (!active) return;
            setAccessError(Boolean(listing.error || writing.error));
            setAccess(!listing.error && listing.data === true);
            setCanCreate(!writing.error && writing.data === true);
        }).catch(() => { if (active) { setAccessError(true); setAccess(false); } });
        return () => { active = false; };
    }, [feedKind, user?.id, memberInfo?.is_active, loading]);

    return (
        <div className="w-full max-w-[1200px] mx-auto px-[24px] pt-[28px] pb-[100px]">
            <h1 className="text-[32px] font-bold text-white tracking-tight leading-none mb-[8px]">{feed.title}</h1>
            <p className="text-[16px] text-[#86868B] leading-[26px] md:pr-[196px]">
                {feedKind === 'committee' ? '주요 이슈를 논의하고 검토 의견과 진행 상황을 확인합니다.' : '업무 이슈와 아이디어를 공유하고 자유롭게 의견을 나눕니다.'}
            </p>
            {access === null || (access && !memberInfo) ? (
                <div className="py-[48px] text-center text-[#A1A1AA]">불러오는 중입니다...</div>
            ) : access ? (
                <WorkspaceActivityLog key={`${user.id}:${feedKind}`} canCreate={canCreate} workspaceCode={feed.code} workspaceLabel={feed.title} feedKind={feedKind} />
            ) : (
                <div role="alert" className="rounded-[16px] border border-[#333] bg-[#252525] p-[40px] text-center text-[#A1A1AA]">
                    {accessError ? '접근 권한을 확인하지 못했습니다. 새로고침 후 다시 시도해 주세요.' : '접근 권한이 없습니다.'}
                </div>
            )}
        </div>
    );
}
