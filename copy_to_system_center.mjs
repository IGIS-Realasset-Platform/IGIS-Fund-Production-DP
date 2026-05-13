import fs from 'fs';

const srcFile = 'src/components/system/IotaTwo816.jsx';
const dstFile = 'src/components/system/SystemCenter.jsx';

const srcContent = fs.readFileSync(srcFile, 'utf8');
const dstContent = fs.readFileSync(dstFile, 'utf8');

const startStr = "{/* Investment Structure Box */}";
const endStr = "{/* Architectural Info Box */}";

const srcStart = srcContent.indexOf(startStr);
const srcEnd = srcContent.indexOf(endStr);

if (srcStart !== -1 && srcEnd !== -1) {
    const block = srcContent.slice(srcStart, srcEnd);
    
    const dstStart = dstContent.indexOf(startStr);
    const dstEnd = dstContent.indexOf(endStr);
    
    if (dstStart !== -1 && dstEnd !== -1) {
        const newDst = dstContent.slice(0, dstStart) + block + dstContent.slice(dstEnd);
        fs.writeFileSync(dstFile, newDst);
        console.log("Copied to SystemCenter.jsx");
    } else {
        console.error("Could not find block in SystemCenter.jsx");
    }
} else {
    console.error("Could not find block in IotaTwo816.jsx");
}
