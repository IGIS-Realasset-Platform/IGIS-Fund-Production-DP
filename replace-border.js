const fs = require('fs');
const path = require('path');

const files = [
    'WorkspacePm.jsx',
    'WorkspaceIPR.jsx',
    'WorkspaceDigital.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceDevelopment.jsx'
];

const targetStr = "`w-full relative bg-[#272726] border border-[#3c3c3c] rounded-[24px] px-6 pt-6 pb-4 cursor-pointer transition-colors duration-300 group/row ${(expandedTaskId === 'ALL' || expandedTaskId === row.id) ? 'hover:bg-[#272726]' : 'hover:bg-[#333]'}`";
const replacementStr = "`w-full relative rounded-[24px] px-6 pt-6 pb-4 cursor-pointer transition-all duration-300 group/row ${(expandedTaskId === 'ALL' || expandedTaskId === row.id) ? 'border border-transparent [background:linear-gradient(#272726,#272726)_padding-box,linear-gradient(to_bottom_right,#d6efe9,#82afb9,#4c6e86)_border-box]' : 'bg-[#272726] border border-[#3c3c3c] hover:bg-[#333]'}`";

let count = 0;
for (const file of files) {
    const filePath = path.join(__dirname, 'src', 'components', 'system', 'workspace', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(targetStr)) {
            content = content.replace(targetStr, replacementStr);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${file}`);
            count++;
        } else {
            console.log(`String not found in ${file}`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
}
console.log(`Total updated: ${count}`);
