import re

# 1. Update SupportRequestModal.jsx
modal_file = './src/components/system/SupportRequestModal.jsx'
with open(modal_file, 'r', encoding='utf-8') as f:
    content = f.read()

delete_func_modal = """    const handleDeleteComment = async (logId, commentId, currentMetadata) => {
        if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;
        
        try {
            const comments = (currentMetadata.comments || []).filter(c => c.id !== commentId);
            const updatedMetadata = { ...currentMetadata, comments };
            
            const { error } = await supabase
                .from('iota_seoul_logs')
                .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
                .eq('log_id', logId);
                
            if (error) throw error;
            
            fetchRequests(); // Refresh the list
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert('댓글 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleFileUpload"""
content = content.replace("    const handleFileUpload", delete_func_modal)

target_ui_modal = """                                                        <span className="text-[11px] text-[#86868B] font-mono">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </span>
                                                    </div>"""
replacement_ui_modal = """                                                        <div className="flex items-center gap-[8px]">
                                                            <span className="text-[11px] text-[#86868B] font-mono">
                                                                {new Date(comment.created_at).toLocaleString()}
                                                            </span>
                                                            {(comment.author === memberInfo?.staff_name || comment.author === memberInfo?.name || comment.author === '익명') && (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleDeleteComment(req.log_id, comment.id, req.metadata || {})}
                                                                    className="text-[#86868B] hover:text-[#ff3b30] transition-colors p-[2px]"
                                                                    title="삭제"
                                                                >
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>"""
content = content.replace(target_ui_modal, replacement_ui_modal)

with open(modal_file, 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Update SystemAdmin.jsx
admin_file = './src/components/system/admin/SystemAdmin.jsx'
with open(admin_file, 'r', encoding='utf-8') as f:
    content = f.read()

delete_func_admin = """    const handleDeleteComment = async (logId, commentId, currentMetadata) => {
        if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;
        
        try {
            const comments = (currentMetadata.comments || []).filter(c => c.id !== commentId);
            const updatedMetadata = { ...currentMetadata, comments };
            
            const { error } = await supabase
                .from('iota_seoul_logs')
                .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
                .eq('log_id', logId);
                
            if (error) throw error;
            
            // Refresh Support Requests
            const { data: supportData, error: supportError } = await supabase
                .from('iota_seoul_logs')
                .select('*')
                .eq('metadata->>workspace_code', 'WS_SUPPORT')
                .order('created_at', { ascending: false });
            if (!supportError) {
                setSupportRequests(supportData || []);
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert('댓글 삭제 중 오류가 발생했습니다.');
        }
    };

    return ("""
content = content.replace("    return (", delete_func_admin)

target_ui_admin = """                                                <span className="text-[12px] text-[#86868B] font-mono">
                                                    {new Date(comment.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>"""
replacement_ui_admin = """                                                <div className="flex items-center gap-[8px]">
                                                    <span className="text-[12px] text-[#86868B] font-mono">
                                                        {new Date(comment.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteComment(req.log_id, comment.id, req.metadata || {})}
                                                        className="text-[#86868B] hover:text-[#ff3b30] transition-colors p-[2px]"
                                                        title="삭제"
                                                    >
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    </button>
                                                </div>
                                            </div>"""
content = content.replace(target_ui_admin, replacement_ui_admin)

with open(admin_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added delete comment functionality successfully.")
