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

old_download = """    const handleDownloadFile = async (filePath, fileName) => {
        try {
            const { data, error } = await supabase.storage
                .from('task-attachments')
                .createSignedUrl(filePath, 60, { download: fileName });

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
    };"""

new_download = """    const handleDownloadFile = async (filePath, fileName) => {
        try {
            const { data, error } = await supabase.storage
                .from('task-attachments')
                .createSignedUrl(filePath, 60);

            if (error) throw error;

            const response = await fetch(data.signedUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('파일 다운로드 중 오류가 발생했습니다.');
        }
    };"""

old_ui = """                                    <span className="text-[13px] text-[#A1A1AA] truncate max-w-[200px]">{newTask.file_name}</span>
                                    <button 
                                        onClick={() => setNewTask({...newTask, file_name: null, file_url: null})}
                                        className="text-[#888] hover:text-[#fff]"
                                    >"""

new_ui = """                                    <span 
                                        className="text-[13px] text-[#A1A1AA] truncate max-w-[200px] hover:text-[#E5E5E5] cursor-pointer hover:underline transition-colors"
                                        onClick={() => newTask.file_url && handleDownloadFile(newTask.file_url, newTask.file_name)}
                                        title="클릭하여 다운로드"
                                    >
                                        {newTask.file_name}
                                    </span>
                                    <button 
                                        onClick={() => setNewTask({...newTask, file_name: null, file_url: null})}
                                        className="text-[#888] hover:text-[#fff] cursor-pointer"
                                        title="첨부파일 삭제"
                                    >"""

for f in files:
    path = os.path.join(base_dir, f)
    with open(path, 'r') as file:
        content = file.read()
    
    # 1. Update handleDownloadFile
    content = content.replace(old_download, new_download)

    # 2. Update UI for the file attachment
    content = content.replace(old_ui, new_ui)

    with open(path, 'w') as file:
        file.write(content)

print("Done updating file download and UI")
