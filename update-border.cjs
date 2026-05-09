const fs = require('fs');
const path = require('path');

const files = [
    'WorkspacePm.jsx',
    'WorkspaceIpr.jsx',
    'WorkspaceDigital.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceDevelopment.jsx'
];

const targetStr = "border border-transparent [background:linear-gradient(#272726,#272726)_padding-box,linear-gradient(to_bottom_right,#d6efe9,#82afb9,#4c6e86)_border-box]";
const replaceStr = "border-[2px] border-transparent [background:linear-gradient(#272726,#272726)_padding-box,linear-gradient(to_bottom_right,#d6efe9,#82afb9,#4c6e86)_border-box]";

let count = 0;
for (const file of files) {
    const filePath = path.join(__dirname, 'src', 'components', 'system', 'workspace', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(targetStr)) {
            content = content.split(targetStr).join(replaceStr);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
            count++;
        }
    }
}
console.log(`Total updated: ${count}`);
