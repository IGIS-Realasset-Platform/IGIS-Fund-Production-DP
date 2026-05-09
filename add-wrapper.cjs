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

const startStr = '<div className="w-full flex flex-col gap-[16px] mb-[50px]">';
const newStartStr = `<div className="-mx-[7px] p-[6px] border border-[#333] rounded-[30px] mb-[50px]">
                <div className="w-full flex flex-col gap-[16px]">`;

const endRegex = /<\/AnimatePresence>\s*<\/div>\s*<span className="sr-only">Dummy<\/span>\s*<\/div>\s*\)\}\s*<\/div>/g; // wait, let's just use string replacement

let count = 0;
for (const file of files) {
    const filePath = path.join(__dirname, 'src', 'components', 'system', 'workspace', file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes(startStr)) {
            // Replace the start string
            content = content.replace(startStr, newStartStr);
            
            // Now we need to add a closing div where the block ends.
            // Let's find the end of the block.
            // It looks like:
            //                        </AnimatePresence>
            //                    </div>
            //                )}
            //            </div>
            
            const endStr1 = `</AnimatePresence>\n                    </div>\n                )}\n            </div>`;
            const endStr2 = `</AnimatePresence>\r\n                    </div>\r\n                )}\r\n            </div>`;
            const endStr3 = `</AnimatePresence>\n                    </div>\n                )}\n            </div>`; // without carriage return
            
            // let's do a more robust replacement using regex
            const rx = /(<\/AnimatePresence>\s*<\/div>\s*)\)}\s*<\/div>/;
            if (rx.test(content)) {
                content = content.replace(rx, `$1)}\n                </div>\n            </div>`);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${file}`);
                count++;
            } else {
                console.log(`Failed to find end block in ${file}`);
            }
        } else {
            console.log(`Start string not found in ${file}`);
        }
    }
}
console.log(`Total updated: ${count}`);
