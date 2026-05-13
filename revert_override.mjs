import fs from 'fs';

const file = 'src/components/system/VehicleIntegrated.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetRegex = /\/\/\s*---\s*816 PFV Refinancing Mock Data Override\s*---[\s\S]*?\/\/\s*----------------------------------------------------/g;

content = content.replace(targetRegex, '');
fs.writeFileSync(file, content);
