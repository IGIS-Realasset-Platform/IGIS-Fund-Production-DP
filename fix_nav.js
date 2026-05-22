const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Import useNavigate if not present
    if (!content.includes('import { useNavigate }')) {
        content = content.replace("import React", "import { useNavigate } from 'react-router-dom';\nimport React");
        // Also add to the function component
        // function IotaOne427
        content = content.replace(/(export default function Iota[a-zA-Z0-9]+\([^)]*\)\s*\{)/, "$1\n    const navigate = useNavigate();");
    }

    // Replace window.location.href patterns
    
    // Pattern 1: window.location.href = url;
    // We leave this one alone if url is absolute, but actually they do window.location.href = url where url is calculated.
    // Let's manually handle them or just replace the string.

    fs.writeFileSync(filePath, content, 'utf-8');
}

fixFile('./src/components/system/IotaOne427.jsx');
fixFile('./src/components/system/IotaTwo816.jsx');
