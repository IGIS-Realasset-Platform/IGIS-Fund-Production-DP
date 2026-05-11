const fs = require('fs');
const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add print:hidden to sidebar
content = content.replace(
    '<div className="w-[280px] bg-[#222] border-r border-[#333] flex flex-col h-full shrink-0">',
    '<div className="w-[280px] bg-[#222] border-r border-[#333] flex flex-col h-full shrink-0 print:hidden">'
);

// 2. Add PDF button
const oldSearchBar = `<div className="w-full">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="테스크 내용 검색..." 
                                            className="w-full bg-[#222] border border-[#333] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#555] transition-colors"
                                        />
                                        <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                </div>`;

const newSearchBar = `<div className="w-full flex gap-3 print:hidden">
                                    <div className="relative flex-1">
                                        <input 
                                            type="text" 
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="테스크 내용 검색..." 
                                            className="w-full bg-[#222] border border-[#333] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#555] transition-colors"
                                        />
                                        <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#86868B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    </div>
                                    <button 
                                        onClick={() => window.print()}
                                        className="shrink-0 px-5 py-2.5 bg-[#444] hover:bg-[#555] text-white text-[13px] font-bold rounded-[12px] transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        PDF 저장
                                    </button>
                                </div>`;
content = content.replace(oldSearchBar, newSearchBar);

// 3. Add print CSS
const oldStyle = `<style jsx>{\`
                .custom-scrollbar::-webkit-scrollbar {`;
const newStyle = `<style jsx>{\`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #111 !important; color: white !important; }
                    .h-screen { height: auto !important; }
                    .overflow-hidden, .overflow-y-auto, .custom-scrollbar { overflow: visible !important; }
                    .mb-4, .mb-16 { page-break-inside: avoid; }
                    .bg-\\[\\#1a1a1a\\]\\/80 { background: #1a1a1a !important; }
                    .border-b { border-bottom: none !important; }
                }
                .custom-scrollbar::-webkit-scrollbar {`;
content = content.replace(oldStyle, newStyle);

// 4. Need to hide header padding when printing so it doesn't take up too much space?
// Not strictly necessary, but `print:py-0` works.
// Also add print:w-full to the main viewer
content = content.replace(
    '<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111]">',
    '<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111] print:w-full print:block">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Archive patched successfully 4');
