const fs = require('fs');

// 1. Update App.jsx routing
let appPath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/App.jsx';
let appContent = fs.readFileSync(appPath, 'utf8');

appContent = appContent.replace(
    "{currentPage.startsWith('platform/iotaseoul') && <PlatformCore isPlatform={true} isIotaWorkspaceOverride={true} currentPath={currentPage} />}",
    "{currentPage.startsWith('platform/iotaseoul') && !currentPage.includes('/archive') && <PlatformCore isPlatform={true} isIotaWorkspaceOverride={true} currentPath={currentPage} />}"
);

appContent = appContent.replace(
    "{(currentPage === 'workspace/archive' || (currentPage.startsWith('workspace/') && currentPage.endsWith('/archive'))) && <WorkspaceArchive />}",
    "{(currentPage.includes('workspace/archive') || currentPage.endsWith('/archive')) && <WorkspaceArchive />}"
);

fs.writeFileSync(appPath, appContent, 'utf8');
console.log('App.jsx updated');

// 2. Update Workspace links
const files = [
    'WorkspacePm.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceDigital.jsx',
    'WorkspaceIpr.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceDevelopment.jsx',
    'WorkspaceFund.jsx'
];

files.forEach(file => {
    let path = `/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/${file}`;
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        content = content.replace(/workspace\/archive\?workspace=/g, 'platform/iotaseoul/workspace/archive?workspace=');
        fs.writeFileSync(path, content, 'utf8');
        console.log(`${file} updated`);
    }
});
