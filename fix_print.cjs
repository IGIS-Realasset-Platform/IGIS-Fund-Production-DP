const fs = require('fs');
const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldStyle = `<style jsx>{\`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #111 !important; color: white !important; }
                    .h-screen { height: auto !important; }
                    .overflow-hidden, .overflow-y-auto, .custom-scrollbar { overflow: visible !important; }
                    .mb-4, .mb-16 { page-break-inside: avoid; }
                    .bg-\\[\\#1a1a1a\\]\\/80 { background: #1a1a1a !important; }
                    .border-b { border-bottom: none !important; }
                }
                .custom-scrollbar::-webkit-scrollbar {`;

const newStyle = `<style jsx>{\`
                @media print {
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        background: #ffffff !important; 
                        color: #111827 !important; 
                    }
                    .h-screen { height: auto !important; }
                    .overflow-hidden, .overflow-y-auto, .custom-scrollbar { overflow: visible !important; }
                    .mb-4, .mb-16 { page-break-inside: avoid; margin-bottom: 24px !important; }
                    .bg-\\[\\#1a1a1a\\]\\/80, .bg-\\[\\#111\\] { background: transparent !important; }
                    .border-b { border-bottom: 1px solid #e5e7eb !important; }
                    /* Text colors */
                    .text-white { color: #111827 !important; }
                    .text-\\[\\#86868B\\] { color: #4b5563 !important; }
                    .text-\\[\\#A1A1AA\\] { color: #374151 !important; }
                    .text-\\[\\#b3b0a6\\] { color: #111827 !important; }
                    .text-\\[\\#E5E5E5\\] { color: #111827 !important; }
                    /* Box backgrounds and borders */
                    .bg-\\[\\#272726\\] { background: #ffffff !important; border-color: #d1d5db !important; }
                    .bg-\\[\\#222\\] { background: #f3f4f6 !important; border-color: #e5e7eb !important; }
                    .bg-\\[\\#333\\] { background: #e5e7eb !important; border-color: #d1d5db !important; }
                    .border-\\[\\#3c3c3c\\] { border-color: #d1d5db !important; }
                    .border-\\[\\#333\\] { border-color: #e5e7eb !important; }
                    .border-\\[\\#444\\]\\/50 { border-color: #d1d5db !important; }
                    /* Layout fixes */
                    .w-\\[650px\\] { width: 65% !important; border-right: 1px solid #e5e7eb !important; padding-right: 24px !important; }
                    .gap-8 { gap: 24px !important; }
                    .px-12 { padding-left: 0 !important; padding-right: 0 !important; }
                    .py-8 { padding-top: 16px !important; padding-bottom: 16px !important; }
                }
                .custom-scrollbar::-webkit-scrollbar {`;

content = content.replace(oldStyle, newStyle);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Archive print CSS patched successfully');
