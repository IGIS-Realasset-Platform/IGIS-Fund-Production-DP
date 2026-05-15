import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { executeWithTimeout } from '../../utils/supabaseHelper';
import { motion, AnimatePresence } from 'framer-motion';

export default function SupportRequestModal({ isOpen, onClose, memberInfo }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // File Attachment States
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = React.useRef(null);

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

            // Reset and close
            setTitle('');
            setContent('');
            setAttachedFiles([]);
            alert('요청사항이 성공적으로 접수되었습니다. 감사합니다!');
            onClose();
        } catch (error) {
            console.error('Error saving request:', error);
            alert('요청사항 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                className="relative w-full max-w-[600px] bg-[#1d1d1f] rounded-[24px] overflow-hidden border border-[#333] shadow-2xl flex flex-col"
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

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-[24px] flex flex-col gap-[20px]">
                    
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
            </motion.div>
        </div>
    );
}
