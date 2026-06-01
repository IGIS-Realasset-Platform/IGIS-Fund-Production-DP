import React from 'react';

export default function MobileLogCard({ log, memberInfo, onClick }) {
    const isVisibleTo = () => {
        if (!memberInfo) return false;
        if (log.writer_staff_id?.toLowerCase() === memberInfo.email?.toLowerCase()) return true;
        if (log.writer_name === memberInfo.staff_name) return true;
        
        const metadata = log.metadata || {};
        const permissions = metadata.permissions || {};
        const individuals = permissions.individuals || [];
        const groups = permissions.groups || [];

        if (individuals.includes(memberInfo.staff_name)) return true;
        
        // Director/Master fallback
        if (['director', 'master'].includes(memberInfo.role_code)) return true;

        if (groups.length === 0) return true; // public if no explicit groups
        if (memberInfo.role_code && groups.includes(memberInfo.role_code)) return true;
        if (memberInfo.org_name && groups.some(g => memberInfo.org_name.includes(g) || g.includes(memberInfo.org_name))) return true;

        // Legacy PO overrides
        if (groups.includes('PO') && memberInfo.staff_name === '이철승') return true;
        if (groups.includes('Sub-PO') && ['윤관식', '정조민', '우형석'].includes(memberInfo.staff_name)) return true;

        return false;
    };

    const isVisible = isVisibleTo();
    const title = log.metadata?.title || (log.summary ? log.summary.split('\n')[0] : log.raw_text?.split('\n')[0] || '제목 없음');
    const priority = log.metadata?.priority || '중간';
    const commentsCount = log.metadata?.comments?.length || 0;
    
    // Formatting Work Date
    let dateStr = log.work_date || '';
    if (dateStr.length === 8) {
        dateStr = `${dateStr.substring(0,4)}.${dateStr.substring(4,6)}.${dateStr.substring(6,8)}`;
    } else if (log.created_at) {
        dateStr = new Date(log.created_at).toLocaleDateString('ko-KR');
    }

    return (
        <div 
            onClick={() => isVisible && onClick && onClick(log)}
            className={`bg-[#242423] border border-[#3A3A39] rounded-[12px] p-4 flex flex-col mb-3 ${isVisible ? 'active:bg-[#20201F] cursor-pointer transition-colors' : 'opacity-80'}`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold text-white bg-[#3A3A39] px-1.5 py-0.5 rounded-sm">
                        {log.metadata?.workspace_label || 'IOTA'}
                    </span>
                    <span className="text-[10px] font-bold text-[#242423] bg-[#F4F4F1] px-1.5 py-0.5 rounded-sm">
                        {log.metadata?.project_name || 'IOTA 공통'}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-sm">
                        {log.metadata?.triage_type || '공유'}
                    </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    priority === '높음' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    priority === '중간' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}>
                    {priority}
                </span>
            </div>

            {isVisible ? (
                <>
                    <h3 className="text-[15px] font-bold text-[#F4F4F1] leading-snug mb-1 line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-[13px] text-[#9A9A98] leading-relaxed line-clamp-3 mb-3">
                        {log.raw_text}
                    </p>
                    
                    {commentsCount > 0 && (
                        <div className="bg-[#20201F] rounded-lg p-2.5 mb-3 flex items-start gap-2 border border-[#3A3A39]">
                            <svg className="w-4 h-4 text-[#4C82FF] mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-[#A1A1AA]">{log.metadata.comments[commentsCount - 1].author}</div>
                                <div className="text-[12px] text-[#F4F4F1] line-clamp-1">{log.metadata.comments[commentsCount - 1].text}</div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{log.writer_name}</span>
                            <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <span>{commentsCount}</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 bg-[#20201F] rounded-lg border border-[#3A3A39]/50">
                    <svg className="w-8 h-8 text-[#A1A1AA] mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-[13px] font-medium text-[#A1A1AA]">접근 권한이 없습니다</span>
                </div>
            )}
        </div>
    );
}
