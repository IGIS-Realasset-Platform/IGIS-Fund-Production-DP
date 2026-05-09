const fs = require('fs');
const path = require('path');

const file = 'WorkspaceDigital.jsx';
const filePath = path.join(__dirname, 'src', 'components', 'system', 'workspace', file);
let content = fs.readFileSync(filePath, 'utf8');

const startStr = '<motion.div layout className="w-full flex flex-col gap-[16px] mb-[40px]">';
const newStartStr = `<div className="-mx-[7px] p-[6px] border border-[#333] rounded-[30px] mb-[40px]">
                <motion.div layout className="w-full flex flex-col gap-[16px]">`;

if (content.includes(startStr)) {
    content = content.replace(startStr, newStartStr);
    const rx = /(<\/AnimatePresence>\s*<\/div>\s*)\)}\s*<\/motion.div>/;
    if (rx.test(content)) {
        content = content.replace(rx, `$1)}\n                </motion.div>\n            </div>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Failed to find end block in ${file}`);
    }
}
