import re

with open('src/components/system/LogWriteBox.jsx', 'r') as f:
    content = f.read()

# 1. Add State
state_injection = """
    // File Attachment States
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = React.useRef(null);
"""
content = content.replace(
    "const [isSubmitting, setIsSubmitting] = useState(false);",
    "const [isSubmitting, setIsSubmitting] = useState(false);\n" + state_injection
)

# 2. Add File Load on Edit Mode
edit_load_injection = """
                if (meta.permissions) {
                    if (meta.permissions.groups) setVisibilityGroups(meta.permissions.groups);
                    if (meta.permissions.individuals && masterStakeholders && masterStakeholders.length > 0) {
                        const indivs = meta.permissions.individuals.map(name => masterStakeholders.find(s => s.contact_name === name)).filter(Boolean);
                        setVisibilityIndividuals(indivs);
                    }
                }
                if (meta.attachedFiles) {
                    setAttachedFiles(meta.attachedFiles);
                }
"""
content = content.replace(
    """                if (meta.permissions) {
                    if (meta.permissions.groups) setVisibilityGroups(meta.permissions.groups);
                    if (meta.permissions.individuals && masterStakeholders && masterStakeholders.length > 0) {
                        const indivs = meta.permissions.individuals.map(name => masterStakeholders.find(s => s.contact_name === name)).filter(Boolean);
                        setVisibilityIndividuals(indivs);
                    }
                }""",
    edit_load_injection
)

# 3. Handle File Upload Function
file_handler_injection = """
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

    const registerMasterStakeholder = async () => {
"""
content = content.replace("    const registerMasterStakeholder = async () => {", file_handler_injection)

# 4. Save to metadata
metadata_replace_from = """                    permissions: {
                        groups: visibilityGroups,
                        individuals: visibilityIndividuals.map(i => i.contact_name)
                    }"""
metadata_replace_to = """                    permissions: {
                        groups: visibilityGroups,
                        individuals: visibilityIndividuals.map(i => i.contact_name)
                    },
                    attachedFiles: attachedFiles"""
content = content.replace(metadata_replace_from, metadata_replace_to)

# 5. Reset State
reset_state_from = """            if (!editMode) {
                setTitle('');
                setContent('');
                setCompanyQuery('');
                setContactQuery('');
                setVisibilityGroups([]);
                setVisibilityIndividuals([]);
            }"""
reset_state_to = """            if (!editMode) {
                setTitle('');
                setContent('');
                setCompanyQuery('');
                setContactQuery('');
                setVisibilityGroups([]);
                setVisibilityIndividuals([]);
                setAttachedFiles([]);
            }"""
content = content.replace(reset_state_from, reset_state_to)

# 6. UI: Attached files rendering
ui_files_from = """                    {/* Mention Dropdown */}"""
ui_files_to = """                    {/* Attached Files List */}
                    {attachedFiles.length > 0 && (
                        <div className="mt-[16px] flex flex-wrap gap-[8px]">
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

                    {/* Mention Dropdown */}"""
content = content.replace(ui_files_from, ui_files_to)

# 7. UI: Upload button
ui_btn_from = """                    <button 
                        type="button"
                        onClick={() => setShowVisibilityModal(true)}
                        className="px-[16px] py-[10px] rounded-[10px] border border-red-500/50 text-red-500 font-bold text-[13px] hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer mr-2"
                    >
                        열람권한
                    </button>"""
ui_btn_to = """                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        multiple 
                    />
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingFile}
                        className="px-[16px] py-[10px] rounded-[10px] border border-[#444] text-[#A1A1AA] font-bold text-[13px] hover:bg-[#333] hover:text-[#E5E5E5] transition-colors cursor-pointer mr-2 flex items-center gap-2"
                    >
                        {isUploadingFile ? '업로드 중...' : '파일 첨부'}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setShowVisibilityModal(true)}
                        className="px-[16px] py-[10px] rounded-[10px] border border-red-500/50 text-red-500 font-bold text-[13px] hover:bg-red-500/10 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer mr-2"
                    >
                        열람권한
                    </button>"""
content = content.replace(ui_btn_from, ui_btn_to)

with open('src/components/system/LogWriteBox.jsx', 'w') as f:
    f.write(content)

print("LogWriteBox.jsx patched.")
