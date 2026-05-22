import re

file_path = './src/components/system/admin/SystemAdmin.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add State for comments
state_code = """    // Comment States
    const [commentInputs, setCommentInputs] = useState({});
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const AUTHORIZED_USERS = ['전기영', '이시정', '이관용'];"""
content = content.replace(
    "    const AUTHORIZED_USERS = ['전기영', '이시정', '이관용'];",
    state_code
)

# 2. Add handleAddComment function
handle_comment_func = """    const handleAddComment = async (logId, currentMetadata) => {
        const text = commentInputs[logId]?.trim();
        if (!text) return;
        
        setIsSubmittingComment(true);
        try {
            const comments = currentMetadata.comments || [];
            const newComment = {
                id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                text: text,
                author: memberInfo?.staff_name || memberInfo?.name || '관리자',
                created_at: new Date().toISOString()
            };
            
            const updatedMetadata = { ...currentMetadata, comments: [...comments, newComment] };
            
            const { error } = await supabase
                .from('iota_seoul_logs')
                .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
                .eq('log_id', logId);
                
            if (error) throw error;
            
            setCommentInputs(prev => ({ ...prev, [logId]: '' }));
            
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
            console.error('Error adding comment:', err);
            alert('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    return ("""
content = content.replace("    return (", handle_comment_func)

# 3. Insert comments section
comments_ui = """                                    {req.metadata?.attachedFiles?.length > 0 && (
                                        <div className="flex gap-2">
                                            {req.metadata.attachedFiles.map((f, i) => (
                                                <a key={i} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-[6px] bg-[#F5F5F7] dark:bg-[#2C2C2E] px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[#E8E8ED] dark:hover:bg-[#3C3C3E] transition-colors text-[#1D1D1F] dark:text-white">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                                    첨부파일 {i+1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Admin Comments Section */}
                                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-3">
                                    {(req.metadata?.comments || []).map(comment => (
                                        <div key={comment.id} className="bg-[#F5F5F7] dark:bg-[#2C2C2E] rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-[18px] h-[18px] rounded-full bg-[#E5E5E5] dark:bg-[#333] overflow-hidden">
                                                        <img 
                                                            src={`${import.meta.env.BASE_URL}${comment.author}.webp`} 
                                                            alt={comment.author} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }}
                                                        />
                                                    </div>
                                                    <span className="text-[13px] font-bold text-[#1D1D1F] dark:text-white">{comment.author}</span>
                                                </div>
                                                <span className="text-[12px] text-[#86868B] font-mono">
                                                    {new Date(comment.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[14px] text-[#666] dark:text-[#A1A1AA] whitespace-pre-wrap pl-[26px] leading-relaxed">
                                                {comment.text}
                                            </p>
                                        </div>
                                    ))}
                                    
                                    <div className="flex items-start gap-2 mt-1">
                                        <input
                                            type="text"
                                            value={commentInputs[req.log_id] || ''}
                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [req.log_id]: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddComment(req.log_id, req.metadata || {});
                                                }
                                            }}
                                            placeholder="답변이나 추가 의견을 남겨주세요..."
                                            className="flex-1 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-[#1D1D1F] dark:text-[#E5E5E5] outline-none focus:border-[#111] dark:focus:border-white transition-colors placeholder:text-[#86868B]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddComment(req.log_id, req.metadata || {})}
                                            disabled={isSubmittingComment || !commentInputs[req.log_id]?.trim()}
                                            className="px-5 py-2.5 bg-[#111] dark:bg-white text-white dark:text-[#111111] rounded-xl text-[14px] font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            등록
                                        </button>
                                    </div>
                                </div>"""

target_block = """                                    {req.metadata?.attachedFiles?.length > 0 && (
                                        <div className="flex gap-2">
                                            {req.metadata.attachedFiles.map((f, i) => (
                                                <a key={i} href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-[6px] bg-[#F5F5F7] dark:bg-[#2C2C2E] px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[#E8E8ED] dark:hover:bg-[#3C3C3E] transition-colors text-[#1D1D1F] dark:text-white">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                                    첨부파일 {i+1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>"""

content = content.replace(target_block, comments_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched SystemAdmin.jsx successfully.")
