const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const code = fs.readFileSync('src/components/system/VehicleIntegrated.jsx', 'utf8');
try {
    const parser = acorn.Parser.extend(jsx());
    parser.parse(code, { sourceType: 'module' });
    console.log("Syntax is valid!");
} catch (e) {
    console.error("Syntax Error:", e);
}
