import os
import re

files = [
    'WorkspacePm.jsx',
    'WorkspaceDevelopment.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceIpr.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceDigital.jsx'
]

base_dir = 'src/components/system/workspace'

for f in files:
    path = os.path.join(base_dir, f)
    with open(path, 'r') as file:
        content = file.read()
    
    # 1. Add useRef
    if 'useRef' not in content:
        content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useRef } from 'react';")
    
    # 2. Add states
    if 'const [uploadingFile' not in content:
        content = content.replace("const [tasks, setTasks] = useState([]);", "const [tasks, setTasks] = useState([]);\n    const [uploadingFile, setUploadingFile] = useState(false);\n    const fileInputRef = useRef(null);")
        
    # 3. Add handlers
    if 'const handleFileUpload' not in content:
        handlers = """
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingFile(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('task-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setNewTask({
                ...newTask,
                file_name: file.name,
                file_url: filePath
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleDownloadFile = async (filePath, fileName) => {
        try {
            const { data, error } = await supabase.storage
                .from('task-attachments')
                .createSignedUrl(filePath, 60);

            if (error) throw error;

            const a = document.createElement('a');
            a.href = data.signedUrl;
            a.download = fileName;
            a.target = '_blank';
            a.click();
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('파일 다운로드 중 오류가 발생했습니다.');
        }
    };

"""
        content = content.replace("const fetchTasks = async () => {", handlers + "    const fetchTasks = async () => {")

    # 4. Modify Input Form
    if '<input \n                                type="file"' not in content:
        input_form_addition = """
                        <div className="flex items-center gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                                className="hidden" 
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingFile}
                                className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors flex items-center gap-2"
                            >
                                {uploadingFile ? (
                                    <span className="animate-pulse">업로드 중...</span>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                                        파일 첨부
                                    </>
                                )}
                            </button>
                            {newTask.file_name && (
                                <div className="flex items-center gap-2 bg-[#222] px-3 py-1.5 rounded-lg border border-[#333]">
                                    <span className="text-[13px] text-[#A1A1AA] truncate max-w-[200px]">{newTask.file_name}</span>
                                    <button 
                                        onClick={() => setNewTask({...newTask, file_name: null, file_url: null})}
                                        className="text-[#888] hover:text-[#fff]"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            )}
                        </div>"""
        
        target_textarea = """placeholder="상세 내용 입력" \n                        />"""
        content = content.replace(target_textarea, target_textarea + input_form_addition)

    # 5. Modify View Details
    if 'row.file_name && row.file_url' not in content:
        view_addition = """
                                {row.file_name && row.file_url && (
                                <div className="flex items-start gap-4 mt-4 pt-4 border-t border-[#3c3c3c]/50">
                                    <span className="text-[13px] font-bold text-[#86868B] shrink-0 mt-[2px]">첨부파일</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadFile(row.file_url, row.file_name);
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] text-[#A1A1AA] text-[13px] rounded-lg transition-colors border border-[#444]"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        {row.file_name}
                                    </button>
                                </div>
                                )}"""
        
        # Regex to find the end of row.notes rendering block
        # We look for the closing div and )} of the row.notes condition
        pattern = r"({row\.notes\.startsWith\('http'\) \?.*?</a> : row\.notes}\n\s*</span>\n\s*</div>\n\s*)\)}"
        content = re.sub(pattern, r"\1)}" + view_addition, content)

    with open(path, 'w') as file:
        file.write(content)

print("Done")
