const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const fallbackPath = path.join(distDir, '404.html');

if (!fs.existsSync(indexPath)) {
  throw new Error(`Cannot create GitHub Pages SPA fallback because ${indexPath} does not exist.`);
}

fs.copyFileSync(indexPath, fallbackPath);
console.log(`Created GitHub Pages SPA fallback: ${fallbackPath}`);
