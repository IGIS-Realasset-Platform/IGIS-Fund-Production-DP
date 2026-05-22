import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { executeWithTimeout } from '../../utils/supabaseHelper';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportRequestModal({ isOpen, onClose, memberInfo }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Previous Requests State
    const [requests, setRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);

    // File Attachment States
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = React.useRef(null);
    
    // Comments States
    const [commentInputs, setCommentInputs] = useState({});
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);


    const fetchRequests = async () => {
        setIsLoadingRequests(true);
        try {
            const { data, error } = await supabase
                .from('iota_seoul_logs')
                .select('log_id, summary, raw_text, writer_name, created_at, metadata')
                .eq('metadata->>workspace_code', 'WS_SUPPORT')
                .order('created_at', { ascending: false })
                .limit(20);
            if (!error && data) {
                setRequests(data);
            }
        } catch (e) {
            console.error('Error fetching requests:', e);
        } finally {
            setIsLoadingRequests(false);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            fetchRequests();
            // Load drafts
            const draftTitle = localStorage.getItem('support_draft_title');
            const draftContent = localStorage.getItem('support_draft_content');
            if (draftTitle) setTitle(draftTitle);
            if (draftContent) setContent(draftContent);
        }
    }, [isOpen]);

    // Save drafts on change
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (title || content) {
                localStorage.setItem('support_draft_title', title);
                localStorage.setItem('support_draft_content', content);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [title, content]);

    const handleAddComment = async (logId, currentMetadata) => {
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

    const handleDeleteComment = async (logId, commentId, currentMetadata) => {
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

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;
        
        setIsUploadingFile(true);
        const newAttachments = [];
        
        try {
            for (const file of files) {
                if (file.size > 50 * 1024 * 1024) {
                    alert(`${file.name}의 용량이 50MB를 초과합니다.`);
                    continue;
                }
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('task-attachments')
                    .upload(filePath, file);
                
                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    alert(`${file.name} 업로드 실패`);
                    continue;
                }

                const { data: urlData } = supabase.storage
                    .from('task-attachments')
                    .getPublicUrl(filePath);
                
                newAttachments.push({
                    name: file.name,
                    url: urlData.publicUrl,
                    size: file.size,
                    path: filePath
                });
            }
            if (newAttachments.length > 0) {
                setAttachedFiles(prev => [...prev, ...newAttachments]);
            }
        } catch (err) {
            console.error('File upload error:', err);
            alert('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setIsUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeFile = (indexToRemove) => {
        setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            const logId = `iota_issue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const writerId = memberInfo?.email || 'unknown';
            const writerName = memberInfo?.staff_name || memberInfo?.name || '익명';

            const logData = {
                log_id: logId,
                work_date: new Date().toISOString().slice(0, 10),
                raw_text: content,
                summary: title,
                writer_staff_id: writerId,
                writer_name: writerName,
                input_status: 'submitted',
                source_system: 'support_request_modal',
                updated_at: new Date().toISOString(),
                metadata: {
                    workspace_code: 'WS_SUPPORT',
                    workspace_label: '플랫폼 개선 요청',
                    project_name: 'IOTA 공통',
                    triage_type: '요청',
                    issue_status: '신규',
                    priority: '높음',
                    permissions: {
                        groups: ["PO", "Sub-PO"], // Make it visible to POs
                        individuals: [writerName]
                    },
                    attachedFiles: attachedFiles
                }
            };

            const { error: logError } = await executeWithTimeout(supabase.from('iota_seoul_logs').insert(logData));
            if (logError) throw logError;

            // Link to project
            await executeWithTimeout(supabase.from('iota_seoul_log_links').insert({
                link_id: `link_${logId}`,
                log_id: logId,
                proj_id: 'IOTA_COMMON',
                relation_type: 'direct_input'
            }));

            // Clear drafts on success
            localStorage.removeItem('support_draft_title');
            localStorage.removeItem('support_draft_content');
            
            // Reset and refresh list
            setTitle('');
            setContent('');
            setAttachedFiles([]);
            
            // Use setTimeout to allow React to paint the UI before alert
            setTimeout(() => {
                alert('요청사항이 성공적으로 접수되었습니다. 감사합니다!');
            }, 10);
            
            fetchRequests();
        } catch (error) {
            console.error('Error saving request:', error);
            setTimeout(() => {
                alert('요청사항 전송 중 통신 지연이 발생했습니다. 다시 시도해주세요.\n(작성하신 내용은 안전하게 임시저장되어 있습니다.)');
            }, 10);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-[20px]">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></motion.div>
            
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="relative w-full max-w-[800px] max-h-[85vh] bg-[#1d1d1f] rounded-[24px] overflow-hidden border border-[#333] shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="w-full px-[24px] py-[16px] border-b border-[#333] flex justify-between items-center bg-[#222]">
                    <div className="flex items-center gap-[12px]">
                        <div className="w-[8px] h-[8px] rounded-full bg-[#0071e3]"></div>
                        <h2 className="text-[18px] font-bold text-white tracking-tight">플랫폼 개선 요청</h2>
                    </div>
                    <button onClick={onClose} className="text-[#86868b] hover:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="w-full flex-1 overflow-y-auto p-[24px] flex flex-col">
                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-[20px]">
                        
                        <div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="불편하신 사항을 말씀 주세요."
                                className="w-full bg-transparent text-[#E5E5E5] text-[18px] font-bold outline-none border-b border-[#333] pb-[12px] focus:border-[#0071e3] transition-colors placeholder:text-[#666]"
                                required
                            />
                        </div>

                        <div>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="에러사항 또는 추가하고 싶은 기능 등 자유롭게 말씀 주세요."
                                className="w-full h-[180px] bg-[#262626] border border-[#333] rounded-[16px] p-[16px] text-[#E5E5E5] text-[15px] outline-none resize-none focus:border-[#0071e3] transition-colors placeholder:text-[#666] leading-relaxed"
                                required
                            ></textarea>
                        </div>

                        {/* Attached Files List */}
                        {attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-[8px]">
                                {attachedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-[6px] bg-[#222] border border-[#444] rounded-[8px] px-[10px] py-[6px]">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                        <span className="text-[12px] text-[#E5E5E5] max-w-[200px] truncate" title={file.name}>{file.name}</span>
                                        <button 
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="text-[#86868B] hover:text-[#FF453A] ml-[4px] cursor-pointer"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer Controls */}
                        <div className="flex justify-between items-center pt-[12px] border-t border-[#333]">
                            
                            {/* File Attach Button */}
                            <div className="relative">
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={isUploadingFile || attachedFiles.length >= 5}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingFile || attachedFiles.length >= 5}
                                    className={`flex items-center gap-[6px] px-[12px] py-[8px] rounded-[8px] text-[13px] font-medium transition-colors ${
                                        attachedFiles.length >= 5 
                                            ? 'text-[#666] bg-[#222] cursor-not-allowed'
                                            : 'text-[#E5E5E5] bg-[#222] hover:bg-[#333] hover:text-white cursor-pointer border border-[#333]'
                                    }`}
                                >
                                    {isUploadingFile ? (
                                        <svg className="animate-spin h-4 w-4 text-[#E5E5E5]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    )}
                                    파일 첨부 (스크린샷 등)
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !title.trim() || !content.trim()}
                                className={`px-[24px] py-[10px] rounded-[12px] text-[14px] font-bold transition-all flex items-center gap-[8px] ${
                                    isSubmitting || !title.trim() || !content.trim()
                                        ? 'bg-[#333] text-[#86868b] cursor-not-allowed'
                                        : 'bg-[#E5E5E5] text-black hover:bg-white hover:scale-105'
                                }`}
                            >
                                {isSubmitting ? '전송 중...' : '요청 보내기'}
                                {!isSubmitting && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>}
                            </button>
                        </div>
                    </form>

                    {/* Previous Requests List */}
                    <div className="mt-[40px] pt-[24px] border-t border-[#333]">
                        <h3 className="text-[15px] font-bold text-[#E5E5E5] mb-[16px] flex items-center gap-[8px]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            최근 접수된 요청 내역
                        </h3>
                        {isLoadingRequests ? (
                            <div className="py-8 flex justify-center">
                                <svg className="animate-spin h-6 w-6 text-[#86868B]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-[12px]">
                                {requests.map(req => (
                                    <div key={req.log_id} className="bg-[#222] border border-[#333] hover:border-[#444] rounded-[12px] p-[16px] transition-colors">
                                        <div className="flex items-center justify-between mb-[8px]">
                                            <h4 className="text-[15px] font-bold text-white">{req.summary}</h4>
                                            <span className="text-[12px] text-[#86868B] font-mono">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-[14px] text-[#A1A1AA] whitespace-pre-wrap leading-relaxed line-clamp-2 mb-[12px]">
                                            {req.raw_text}
                                        </p>
                                        <div className="flex items-center justify-between pt-[12px] border-t border-[#333]">
                                            <div className="flex items-center gap-[6px]">
                                                <div className="w-[18px] h-[18px] rounded-full bg-[#333] overflow-hidden">
                                                    <img 
                                                        src={`${import.meta.env.BASE_URL}${req.writer_name}.webp`} 
                                                        alt={req.writer_name} 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }}
                                                    />
                                                </div>
                                                <span className="text-[12px] font-medium text-[#86868B]">
                                                    {req.writer_name}
                                                </span>
                                            </div>
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
                                                        <div className="flex items-center gap-[8px]">
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
                                        </div>
                                    </div>
                                ))}
                                {requests.length === 0 && (
                                    <div className="text-center text-[#86868B] py-8 text-[14px]">
                                        아직 접수된 내역이 없습니다.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
