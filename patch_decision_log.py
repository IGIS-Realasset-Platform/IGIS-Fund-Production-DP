import os
import re

source_file = 'src/components/system/workspace/WorkspaceActivityLog.jsx'
target_file = 'src/components/system/DecisionLog.jsx'

with open(source_file, 'r') as f:
    source = f.read()

with open(target_file, 'r') as f:
    target = f.read()

# 1. Extract functions from source
has_restr = re.search(r'const hasRestrictedPermissions =.*?};', source, re.DOTALL).group(0)
get_perm_str = re.search(r'const getPermissionString =.*?};', source, re.DOTALL).group(0)
get_short_perm_str = re.search(r'const getShortPermissionString =.*?};', source, re.DOTALL).group(0)
check_access = re.search(r'const checkUserAccess =.*?};', source, re.DOTALL).group(0)

# Combine them
funcs_to_inject = f"\n    {has_restr}\n\n    {get_perm_str}\n\n    {get_short_perm_str}\n\n    {check_access}\n\n"

# Inject into target after fetchLogs
target = target.replace(
    "    useEffect(() => {",
    f"{funcs_to_inject}    useEffect(() => {",
    1
)

# 2. Update the Content in Main Row
# Look for:
#                                         <div 
#                                             className="flex-1 min-w-0 text-[14px] text-[#E5E5E5] truncate hover:text-white transition-colors"
#                                         >
#                                             {log.raw_text ? log.raw_text.split('\n')[0] : ''}
#                                             {log.metadata?.comments?.length > 0 && <span className="text-[#3b82f6] ml-[6px] font-bold text-[13px]">({log.metadata.comments.length})</span>}
#                                         </div>

old_main_content = """                                        <div 
                                            className="flex-1 min-w-0 text-[14px] text-[#E5E5E5] truncate hover:text-white transition-colors"
                                        >
                                            {log.raw_text ? log.raw_text.split('\n')[0] : ''}
                                            {log.metadata?.comments?.length > 0 && <span className="text-[#3b82f6] ml-[6px] font-bold text-[13px]">({log.metadata.comments.length})</span>}
                                        </div>"""

new_main_content = """                                        <div 
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
                                            <span className="truncate">{log.summary || (log.raw_text ? log.raw_text.split('\\n')[0] : '')}</span>
                                            {log.metadata?.comments?.length > 0 && <span className="text-[#3b82f6] ml-[6px] font-bold text-[13px] shrink-0">({log.metadata.comments.length})</span>}
                                        </div>"""

target = target.replace(old_main_content, new_main_content)

# 3. Update Expanded Box
# Specifically, we need to add the Right Floating Badges (Permission Badge) inside the float-right container
old_float_right = """                                    {log.iota_seoul_log_stakeholders?.[0]?.sh_name && (
                                        <div className="float-right ml-[16px] mb-[12px] flex flex-col items-end gap-[4px]">
                                            <span className="text-[11px] font-bold text-[#86868B] pr-[14px]">이해관계자</span>
                                            <div className="bg-[#2a2a2c] border border-[#444] rounded-full pl-[8px] pr-[12px] py-[4px] flex items-center gap-[6px]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                <span className="text-[12px] font-medium text-[#E5E5E5]">
                                                    {log.iota_seoul_log_stakeholders[0].sh_name.split(' - ')[0]}
                                                </span>
                                            </div>
                                        </div>
                                    )}"""

new_float_right = """                                    {/* Right Floating Badges */}
                                    <div className="float-right ml-[16px] mb-[12px] flex flex-col items-end gap-[12px]">
                                        {hasRestrictedPermissions(log) && (
                                            <div className="flex flex-col items-end gap-[4px]">
                                                <span className="text-[11px] font-bold text-[#86868B] pr-[14px]">열람 권한</span>
                                                <div className="bg-[#1e293b] border border-[#334155] rounded-full pl-[8px] pr-[12px] py-[4px] flex items-center gap-[6px]">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                    <span className="text-[12px] font-medium text-[#e2e8f0]">
                                                        제한됨: {getPermissionString(log)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {log.iota_seoul_log_stakeholders?.[0]?.sh_name && (
                                            <div className="flex flex-col items-end gap-[4px]">
                                                <span className="text-[11px] font-bold text-[#86868B] pr-[14px]">이해관계자</span>
                                                <div className="bg-[#2a2a2c] border border-[#444] rounded-full pl-[8px] pr-[12px] py-[4px] flex items-center gap-[6px]">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                    <span className="text-[12px] font-medium text-[#E5E5E5]">
                                                        {log.iota_seoul_log_stakeholders[0].sh_name.split(' - ')[0]}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>"""

target = target.replace(old_float_right, new_float_right)


# 4. Wrap the body content in checkUserAccess
old_body = """                                    ) : (
                                        <div className={`whitespace-pre-wrap break-words text-[15px] leading-relaxed ${commentingLogId === log.log_id ? 'text-[#86868B] opacity-70' : 'text-[#E5E5E5]'}`}>
                                            {renderLogTextWithMentions(log.raw_text)}
                                        </div>
                                    )}"""

new_body = """                                    ) : (
                                        checkUserAccess(log) ? (
                                            <div className={`whitespace-pre-wrap break-words text-[15px] leading-relaxed ${commentingLogId === log.log_id ? 'text-[#86868B] opacity-70' : 'text-[#E5E5E5]'}`}>
                                                {renderLogTextWithMentions(log.raw_text)}
                                            </div>
                                        ) : (
                                            <div className="text-[#86868B] text-[14px] italic py-[20px] text-center border border-[#333] rounded-[8px] bg-[#1a1a1a]">
                                                🔒 열람 권한이 없습니다.
                                            </div>
                                        )
                                    )}"""

target = target.replace(old_body, new_body)

# 5. Conditionally render Comments List, Commenting Box, and the footer action buttons
# Comments list:
old_comments = """                                    {log.metadata?.comments && log.metadata.comments.length > 0 && ("""
new_comments = """                                    {checkUserAccess(log) && log.metadata?.comments && log.metadata.comments.length > 0 && ("""
target = target.replace(old_comments, new_comments)

# Commenting box:
old_comment_box = """                                    {commentingLogId === log.log_id && ("""
new_comment_box = """                                    {checkUserAccess(log) && commentingLogId === log.log_id && ("""
target = target.replace(old_comment_box, new_comment_box)

# Footer actions (buttons):
old_footer = """                                        <div className="flex items-center gap-[8px]">
                                            {!editingLogId && ("""
new_footer = """                                        {checkUserAccess(log) && (
                                            <div className="flex items-center gap-[8px]">
                                                {!editingLogId && ("""

old_footer_end = """                                                </button>
                                            )}
                                        </div>
                                    </div>"""
new_footer_end = """                                                </button>
                                            )}
                                            </div>
                                        )}
                                    </div>"""
target = target.replace(old_footer, new_footer)
target = target.replace(old_footer_end, new_footer_end)


with open(target_file, 'w') as f:
    f.write(target)

