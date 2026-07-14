const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/system/pmo/PmoTaskBoardStaging.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /"due_date":\s*"([^"]+)"/g;

let updatedContent = content;
let match;
let count = 0;

updatedContent = content.replace(/"due_date":\s*"([^"]+)"/g, (match, dateStr) => {
    if (!dateStr || dateStr.trim() === '' || dateStr === '2024-06-25') {
        // If it's a dummy date or empty, skip or keep as is? 
        // Actually, let's delay all dates.
    }
    
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 7);
        const newDateStr = d.toISOString().split('T')[0];
        count++;
        return `"due_date": "${newDateStr}"`;
    }
    return match;
});

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log(`Updated ${count} due dates by 7 days.`);
