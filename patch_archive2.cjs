const fs = require('fs');
const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Group Header: remove tracking-wider and add '전체선택 해제' button
const oldGroupHeader = '<h3 className="text-[#86868B] text-[12px] font-bold mb-3 uppercase tracking-wider">{groupKey}</h3>';
const newGroupHeader = `<div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[#86868B] text-[12px] font-bold uppercase">{groupKey}</h3>
                                    <button 
                                        onClick={() => {
                                            const currentWeekSnap = grouped[groupKey].find(s => s.week_label === '26년 5월 3주') || grouped[groupKey][0];
                                            if (currentWeekSnap) setSelectedSnapshotIds([currentWeekSnap.id]);
                                        }} 
                                        className="text-[#86868B] text-[11px] font-bold hover:text-[#E5E5E5] bg-[#333] hover:bg-[#444] px-2 py-1 rounded-[4px] transition-colors"
                                    >
                                        전체선택 해제
                                    </button>
                                </div>`;
content = content.replace(oldGroupHeader, newGroupHeader);

// 2. Timeline Integrated View text remove, full width search bar
const oldTimelineText = `<div>
                                    <h2 className="text-[24px] font-bold text-white tracking-tight flex items-center gap-3">
                                        <span>타임라인 통합 열람 모드</span>
                                    </h2>
                                </div>
                                <div className="w-[300px]">`;
const newTimelineText = `<div className="w-full">`;
content = content.replace(oldTimelineText, newTimelineText);

// 3. Remove "읽기 전용 스냅샷" badge
content = content.replace('<span className="inline-block px-3 py-1 bg-[#333] text-[#A1A1AA] rounded-full text-[13px] font-bold mb-3">읽기 전용 스냅샷</span>', '');

// 4. Adjust spacing around "저장 일시"
// Below: <div className="flex justify-between items-end mb-6"> -> mb-5 (-4px)
content = content.replace('<div className="flex justify-between items-end mb-6">', '<div className="flex justify-between items-end mb-5">');
// Above: <div className="text-[#86868B] text-[13px] mt-2"> -> mt-1 (-4px)
content = content.replace('<div className="text-[#86868B] text-[13px] mt-2">', '<div className="text-[#86868B] text-[13px] mt-1">');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Archive patched successfully 2');
