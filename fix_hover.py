import re

def update_file():
    filepath = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Add getShortPermissionString helper
    helpers = """
    const getShortPermissionString = (log) => {
        const perms = log.metadata?.permissions;
        if (!perms) return '';
        const parts = [];
        if (perms.groups && perms.groups.length > 0) parts.push(...perms.groups);
        if (perms.individuals && perms.individuals.length > 0) parts.push(...perms.individuals);
        
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0];
        return `${parts[0]} 외 ${parts.length - 1}`;
    };

    const formatDateYYMMDD"""
    content = content.replace('    const formatDateYYMMDD', helpers)

    # 2. Fix truncate and add inline text
    old_snippet = """                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-0 flex items-center gap-[8px] translate-x-[2px]">
                                        <div 
                                            className="flex-1 min-w-0 text-[14px] text-[#E5E5E5] truncate hover:text-white transition-colors flex items-center gap-[6px]"
                                        >
                                            {hasRestrictedPermissions(log) && (
                                                <div className="group relative flex items-center shrink-0">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[100%] mb-[8px] hidden group-hover:flex bg-[#222] border border-[#333] px-[8px] py-[4px] rounded-[6px] whitespace-nowrap text-[11px] text-[#E5E5E5] shadow-lg z-[99] pointer-events-none font-medium">
                                                        열람 권한: {getPermissionString(log)}
                                                    </div>
                                                </div>
                                            )}
                                            <span className="truncate">{log.raw_text ? log.raw_text.split('\\n')[0] : ''}</span>"""

    new_snippet = """                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-0 flex items-center gap-[8px] translate-x-[2px]">
                                        <div 
                                            className="flex-1 min-w-0 text-[14px] text-[#E5E5E5] hover:text-white transition-colors flex items-center gap-[6px]"
                                        >
                                            {hasRestrictedPermissions(log) && (
                                                <div className="group relative flex items-center gap-[4px] shrink-0 cursor-default">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                    <span className="text-[#ef4444] text-[12px] font-bold">[{getShortPermissionString(log)}]</span>
                                                    <div className="absolute left-0 bottom-[100%] mb-[8px] hidden group-hover:flex bg-[#222] border border-[#333] px-[10px] py-[6px] rounded-[6px] whitespace-nowrap text-[12px] text-[#E5E5E5] shadow-xl z-[99] pointer-events-none font-medium">
                                                        🔒 열람 권한: {getPermissionString(log)}
                                                    </div>
                                                </div>
                                            )}
                                            <span className="truncate">{log.raw_text ? log.raw_text.split('\\n')[0] : ''}</span>"""

    content = content.replace(old_snippet, new_snippet)

    with open(filepath, 'w') as f:
        f.write(content)

update_file()
