const fs = require('fs');
const path = require('path');

const dir = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace';
const workspaces = [
    { file: 'WorkspacePm.jsx', id: 'pm' },
    { file: 'WorkspaceDigital.jsx', id: 'digital' },
    { file: 'WorkspaceMarketing.jsx', id: 'marketing' },
    { file: 'WorkspaceFund.jsx', id: 'fund' },
    { file: 'WorkspaceDevelopment.jsx', id: 'development' },
    { file: 'WorkspaceFinancing.jsx', id: 'financing' },
    { file: 'WorkspaceIpr.jsx', id: 'ipr' }
];

workspaces.forEach(({ file, id }) => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace the link to include the workspace ID
    // Old: <a href={`${import.meta.env.BASE_URL}workspace/archive`}
    // New: <a href={`${import.meta.env.BASE_URL}workspace/archive?workspace=${id}`}
    
    content = content.replace(/<a href=\{`\$\{import\.meta\.env\.BASE_URL\}workspace\/archive`\}/g, `<a href={\`\${import.meta.env.BASE_URL}workspace/archive?workspace=${id}\`}`);

    fs.writeFileSync(filePath, content, 'utf8');
});
