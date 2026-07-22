const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '../.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');
console.log(envContent.split('\n').map(l => l.split('=')[0]).join(', '));
