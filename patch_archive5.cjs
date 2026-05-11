const fs = require('fs');
const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// The main viewer wrapper (line ~299):
// <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111] print:w-full print:block">
content = content.replace(
    '<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111] print:w-full print:block">',
    '<div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#F9FAFB] print:w-full print:block">'
);

// <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent h-[200px] pointer-events-none z-0"></div>
content = content.replace(
    '<div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent h-[200px] pointer-events-none z-0"></div>',
    '<div className="absolute inset-0 bg-gradient-to-b from-white to-transparent h-[200px] pointer-events-none z-0"></div>'
);

// Header background
// <div className="relative z-10 px-12 py-6 border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
content = content.replace(
    '<div className="relative z-10 px-12 py-6 border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">',
    '<div className="relative z-10 px-12 py-6 border-b border-gray-200 bg-white/90 backdrop-blur-md">'
);

// Header Text: 타임라인 통합 열람 모드
// <h2 className="text-[24px] font-bold text-white tracking-tight flex items-center gap-3">
content = content.replace(
    '<h2 className="text-[24px] font-bold text-white tracking-tight flex items-center gap-3">',
    '<h2 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-3">'
);

// Search Bar
// <input ... className="w-full bg-[#222] border border-[#333] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#555] transition-colors" />
content = content.replace(
    'className="w-full bg-[#222] border border-[#333] text-white text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-[#555] transition-colors"',
    'className="w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 text-[14px] px-4 py-2.5 pl-10 rounded-[12px] outline-none focus:border-gray-500 transition-colors shadow-sm"'
);

// PDF Button
// <button onClick={() => window.print()} className="shrink-0 px-5 py-2.5 bg-[#444] hover:bg-[#555] text-white text-[13px] font-bold rounded-[12px] transition-colors flex items-center gap-2">
content = content.replace(
    'className="shrink-0 px-5 py-2.5 bg-[#444] hover:bg-[#555] text-white text-[13px] font-bold rounded-[12px] transition-colors flex items-center gap-2"',
    'className="shrink-0 px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#333] border border-[#111] text-white text-[13px] font-bold rounded-[12px] transition-colors flex items-center gap-2 shadow-sm"'
);

// Search icon inside input
// <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#86868B]"
content = content.replace(
    '<svg className="w-4 h-4 absolute left-3.5 top-3 text-[#86868B]"',
    '<svg className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400"'
);

// Task rendering header
// <h2 className="text-[32px] font-bold text-white tracking-tight flex items-center gap-3">
//    <span className="text-[#b3b0a6]">{snap.week_label} ... </span>
//    <span className="text-[#A1A1AA] text-[24px]">|</span>
//    <span>{workspaces.find(w => w.id === workspaceFilter)?.name}</span>
// </h2>
content = content.replace(
    '<h2 className="text-[32px] font-bold text-white tracking-tight flex items-center gap-3">',
    '<h2 className="text-[32px] font-bold text-gray-900 tracking-tight flex items-center gap-3">'
);
content = content.replace(
    '<span className="text-[#b3b0a6]">{snap.week_label}',
    '<span className="text-gray-900">{snap.week_label}'
);
content = content.replace(
    '<span className="text-[#A1A1AA] text-[24px]">|</span>',
    '<span className="text-gray-300 text-[24px]">|</span>'
);

// 저장 일시
// <div className="text-[#86868B] text-[13px] mt-1">
content = content.replace(
    '<div className="text-[#86868B] text-[13px] mt-1">',
    '<div className="text-gray-500 text-[13px] mt-1">'
);

// Task Box
// className="w-full relative rounded-[24px] px-6 pt-[22px] pb-[14px] bg-[#272726] border border-[#3c3c3c] mb-4"
content = content.replace(
    'className="w-full relative rounded-[24px] px-6 pt-[22px] pb-[14px] bg-[#272726] border border-[#3c3c3c] mb-4"',
    'className="w-full relative rounded-[24px] px-6 pt-[22px] pb-[14px] bg-white border border-gray-200 shadow-sm mb-4"'
);

// Task Title
// <h3 className="text-[20px] font-bold text-white mt-1 mb-2 tracking-tight leading-tight whitespace-normal">{row.task_name}</h3>
content = content.replace(
    '<h3 className="text-[20px] font-bold text-white mt-1 mb-2 tracking-tight leading-tight whitespace-normal">{row.task_name}</h3>',
    '<h3 className="text-[20px] font-bold text-gray-900 mt-1 mb-2 tracking-tight leading-tight whitespace-normal">{row.task_name}</h3>'
);

// Task related asset badge
// <span className="px-[6px] py-[2px] bg-[#333] text-[#A1A1AA] border border-[#444] rounded-[4px] text-[11px] font-bold whitespace-nowrap">
content = content.replace(
    '<span className="px-[6px] py-[2px] bg-[#333] text-[#A1A1AA] border border-[#444] rounded-[4px] text-[11px] font-bold whitespace-nowrap">',
    '<span className="px-[6px] py-[2px] bg-gray-100 text-gray-600 border border-gray-200 rounded-[4px] text-[11px] font-bold whitespace-nowrap">'
);

// Layout: 650px to 65%
// <div className="w-[650px] shrink-0 flex flex-col gap-[2px] border-r border-[#444]/50 pr-8">
content = content.replace(
    '<div className="w-[650px] shrink-0 flex flex-col gap-[2px] border-r border-[#444]/50 pr-8">',
    '<div className="w-[65%] shrink-0 flex flex-col gap-[2px] border-r border-gray-200 pr-8">'
);

// Layout: Right side to 35%
// <div className="flex-1"> (Wait, there are two of these! One is <div className="flex-1 flex gap-8">, the other is Next Action wrapper)
// Let's replace precisely:
content = content.replace(
    '<div className="flex-1">\n                                        <span className="block text-[13px] font-bold text-[#86868B] mb-[6px]">Next Action</span>',
    '<div className="w-[35%] pl-4">\n                                        <span className="block text-[13px] font-bold text-gray-500 mb-[6px]">Next Action</span>'
);

// Meta Info
// <span className="text-[#86868B]">이해관계자</span>
content = content.replace(
    /<span className="text-\[#86868B\]">/g,
    '<span className="text-gray-500">'
);
// <span className="text-[#E5E5E5] px-2 py-1 bg-[#222] rounded-[6px] border border-[#333]">{row.company_name}</span>
content = content.replace(
    /<span className="text-\[#E5E5E5\] px-2 py-1 bg-\[#222\] rounded-\[6px\] border border-\[#333\]">/g,
    '<span className="text-gray-900 px-2 py-1 bg-gray-50 rounded-[6px] border border-gray-200">'
);

// Next action paragraph
// <p className="text-[16px] text-[#E5E5E5] leading-relaxed break-keep whitespace-pre-wrap">{row.next_action || '-'}</p>
content = content.replace(
    '<p className="text-[16px] text-[#E5E5E5] leading-relaxed break-keep whitespace-pre-wrap">{row.next_action || \'-\'}</p>',
    '<p className="text-[16px] text-gray-900 leading-relaxed break-keep whitespace-pre-wrap">{row.next_action || \'-\'}</p>'
);

// Notes border
// <div className="mt-4 pt-4 border-t border-[#3c3c3c]">
content = content.replace(
    '<div className="mt-4 pt-4 border-t border-[#3c3c3c]">',
    '<div className="mt-4 pt-4 border-t border-gray-200">'
);

// Notes text
// <span className="block text-[13px] font-bold text-[#86868B] mb-[6px]">상세 메모</span>
content = content.replace(
    '<span className="block text-[13px] font-bold text-[#86868B] mb-[6px]">상세 메모</span>',
    '<span className="block text-[13px] font-bold text-gray-500 mb-[6px]">상세 메모</span>'
);

// <p className="text-[14px] text-[#A1A1AA] leading-relaxed break-keep whitespace-pre-wrap">{row.notes}</p>
content = content.replace(
    '<p className="text-[14px] text-[#A1A1AA] leading-relaxed break-keep whitespace-pre-wrap">{row.notes}</p>',
    '<p className="text-[14px] text-gray-600 leading-relaxed break-keep whitespace-pre-wrap">{row.notes}</p>'
);

// No data text
// <div className="text-[#86868B] text-[15px] font-medium">좌측에서 열람할 주차를 선택해주세요.</div>
content = content.replace(
    '<div className="text-[#86868B] text-[15px] font-medium">좌측에서 열람할 주차를 선택해주세요.</div>',
    '<div className="text-gray-400 text-[15px] font-medium">좌측에서 열람할 주차를 선택해주세요.</div>'
);

// Remove specific print overrides that are no longer needed since it's already light mode
const oldPrintCSS = `                @media print {
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
                }`;

const newPrintCSS = `                @media print {
                    body { 
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                        background: #ffffff !important; 
                    }
                    .h-screen { height: auto !important; }
                    .overflow-hidden, .overflow-y-auto, .custom-scrollbar { overflow: visible !important; }
                    .mb-4, .mb-16 { page-break-inside: avoid; margin-bottom: 24px !important; }
                    .border-b { border-bottom: 1px solid #e5e7eb !important; }
                    /* Layout fixes */
                    .gap-8 { gap: 24px !important; }
                    .px-12 { padding-left: 0 !important; padding-right: 0 !important; }
                    .py-8 { padding-top: 16px !important; padding-bottom: 16px !important; }
                }`;

content = content.replace(oldPrintCSS, newPrintCSS);

// Left Menu is still dark mode, which is fine since the user only mentioned the right side layout. 
// "화면에서도 라이트모드로 나왔으면 좋겟어." - The main content. Let's keep the left nav dark for nice contrast like the rest of the system.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Archive patched to Light Mode');
