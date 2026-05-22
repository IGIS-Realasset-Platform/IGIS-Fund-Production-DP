import re

file_path = './src/components/system/SupportRequestModal.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update SELECT query
content = content.replace(
    ".select('log_id, summary, raw_text, writer_name, created_at')",
    ".select('log_id, summary, raw_text, writer_name, created_at, metadata')"
)

# 2. Add State for comments
state_code = """    // File Attachment States
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = React.useRef(null);
    
    // Comments States
    const [commentInputs, setCommentInputs] = useState({});
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
"""
content = content.replace(
    "    // File Attachment States\n    const [attachedFiles, setAttachedFiles] = useState([]);\n    const [isUploadingFile, setIsUploadingFile] = useState(false);\n    const fileInputRef = React.useRef(null);",
    state_code
)

# 3. Add handleAddComment function
handle_comment_func = """    const handleAddComment = async (logId, currentMetadata) => {
        const text = commentInputs[logId]?.trim();
        if (!text) return;
        
        setIsSubmittingComment(true);
        try {
            const comments = currentMetadata.comments || [];
            const newComment = {
                id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                text: text,
                author: memberInfo?.staff_name || memberInfo?.name || '익명',
                created_at: new Date().toISOString()
            };
            
            const updatedMetadata = { ...currentMetadata, comments: [...comments, newComment] };
            
            const { error } = await supabase
                .from('iota_seoul_logs')
                .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
                .eq('log_id', logId);
                
            if (error) throw error;
            
            setCommentInputs(prev => ({ ...prev, [logId]: '' }));
            fetchRequests(); // Refresh the list
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleFileUpload"""
content = content.replace("    const handleFileUpload", handle_comment_func)

# 4. Insert comments section
comments_ui = """                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        <div className="mt-[16px] pt-[16px] border-t border-[#333] border-dashed flex flex-col gap-[12px]">
                                            {(req.metadata?.comments || []).map(comment => (
                                                <div key={comment.id} className="bg-[#2a2a2c] rounded-[8px] p-[12px]">
                                                    <div className="flex items-center justify-between mb-[6px]">
                                                        <div className="flex items-center gap-[6px]">
                                                            <div className="w-[16px] h-[16px] rounded-full bg-[#333] overflow-hidden">
                                                                <img 
                                                                    src={`${import.meta.env.BASE_URL}${comment.author}.webp`} 
                                                                    alt={comment.author} 
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }}
                                                                />
                                                            </div>
                                                            <span className="text-[12px] font-bold text-[#E5E5E5]">{comment.author}</span>
                                                        </div>
                                                        <span className="text-[11px] text-[#86868B] font-mono">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-[13px] text-[#A1A1AA] whitespace-pre-wrap pl-[22px] leading-relaxed">
                                                        {comment.text}
                                                    </p>
                                                </div>
                                            ))}
                                            
                                            {/* Comment Input */}
                                            <div className="flex items-start gap-[8px] mt-[4px]">
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
                                                    className="flex-1 bg-[#1A1A1C] border border-[#333] rounded-[8px] px-[12px] py-[8px] text-[13px] text-[#E5E5E5] outline-none focus:border-[#0071e3] transition-colors placeholder:text-[#666]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddComment(req.log_id, req.metadata || {})}
                                                    disabled={isSubmittingComment || !commentInputs[req.log_id]?.trim()}
                                                    className="px-[12px] py-[8px] bg-[#333] hover:bg-[#444] text-[#E5E5E5] rounded-[8px] text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    등록
                                                </button>
                                            </div>
                                        </div>"""

content = content.replace("                                            </div>\n                                        </div>\n                                    </div>", comments_ui + "\n                                    </div>")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched SupportRequestModal.jsx successfully.")
