const fs = require('fs');
const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change state from selectedSnapshotId to selectedSnapshotIds
content = content.replace(
    "const [selectedSnapshotId, setSelectedSnapshotId] = useState(null);",
    "const [selectedSnapshotIds, setSelectedSnapshotIds] = useState([]);"
);

// 2. Change setSelectedSnapshotId(filteredSnaps[0].id) -> setSelectedSnapshotIds(filteredSnaps.map(s => s.id))
content = content.replace(
    /if \(fetchedData\.length > 0\) setSelectedSnapshotId\(fetchedData\[0\]\.id\);/g,
    "if (fetchedData.length > 0) setSelectedSnapshotIds(fetchedData.map(s => s.id));"
);
content = content.replace(
    /else setSelectedSnapshotId\(null\);/g,
    "else setSelectedSnapshotIds([]);"
);
content = content.replace(
    /if \(filteredSnaps\.length > 0\) setSelectedSnapshotId\(filteredSnaps\[0\]\.id\);/g,
    "if (filteredSnaps.length > 0) setSelectedSnapshotIds(filteredSnaps.map(s => s.id));"
);

// 3. Left Menu: text-[14px], py-[6px], gap-[4px]
content = content.replace(
    /className="flex flex-col gap-\[2px\]"/,
    'className="flex flex-col gap-[4px]"'
);
content = content.replace(
    /className=\{`text-left px-3 py-2\.5 rounded-\[8px\] text-\[13px\] font-bold/g,
    'className={`text-left px-3 py-[6px] rounded-[8px] text-[14px] font-bold'
);

// 4. Week button rendering: reduce height and add date range
// find:
// <button 
//     key={snap.id}
//     onClick={() => setSelectedSnapshotId(snap.id)}
//     className={`w-full text-left px-4 py-3 rounded-[12px] transition-all flex justify-between items-center ${selectedSnapshotId === snap.id ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}`}
// >
//     <span className="text-[14px]">{snap.week_label}</span>
//     {selectedSnapshotId === snap.id && <span className="text-[18px]">→</span>}
// </button>

const oldBtn = `<button 
                                            key={snap.id}
                                            onClick={() => setSelectedSnapshotId(snap.id)}
                                            className={\`w-full text-left px-4 py-3 rounded-[12px] transition-all flex justify-between items-center \${selectedSnapshotId === snap.id ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}\`}
                                        >
                                            <span className="text-[14px]">{snap.week_label}</span>
                                            {selectedSnapshotId === snap.id && <span className="text-[18px]">→</span>}
                                        </button>`;
const newBtn = `<button 
                                            key={snap.id}
                                            onClick={() => setSelectedSnapshotIds(prev => prev.includes(snap.id) ? prev.filter(id => id !== snap.id) : [...prev, snap.id])}
                                            className={\`w-full text-left px-4 py-[8px] rounded-[8px] transition-all flex justify-between items-center \${selectedSnapshotIds.includes(snap.id) ? 'bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-bold' : 'text-[#E5E5E5] hover:bg-[#333] border border-transparent'}\`}
                                        >
                                            <span className="text-[13px]">{snap.week_label} {snap.week_label === '26년 5월 3주' ? '(26.5.11~5.17)' : snap.week_label === '26년 5월 2주' ? '(26.5.4~5.10)' : ''}</span>
                                            {selectedSnapshotIds.includes(snap.id) && <span className="text-[16px] text-[#60a5fa]">✓</span>}
                                        </button>`;
content = content.replace(oldBtn, newBtn);

// Remove `const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId);`
content = content.replace(
    "const selectedSnapshot = snapshots.find(s => s.id === selectedSnapshotId);",
    ""
);

// 5. Main Viewer Area
// The current `renderTasks()` logic is tightly coupled with `selectedSnapshot`. We need to rewrite `renderTasks` completely.
// Let's replace the whole `renderTasks` function and the Main Viewer Area block.

const renderTasksRegex = /const renderTasks = \(\) => \{[\s\S]*?    \};\n\n    return \(/;
const newRenderTasks = `
    const renderTasks = () => {
        if (selectedSnapshotIds.length === 0) return null;
        
        const selectedSnaps = snapshots.filter(s => selectedSnapshotIds.includes(s.id)).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        return selectedSnaps.map(snap => {
            let tasks = snap.snapshot_data || [];
            if (searchQuery) {
                const lowerQ = searchQuery.toLowerCase();
                tasks = tasks.filter(t => 
                    (t.task_name && t.task_name.toLowerCase().includes(lowerQ)) ||
                    (t.company_name && t.company_name.toLowerCase().includes(lowerQ)) ||
                    (t.notes && t.notes.toLowerCase().includes(lowerQ))
                );
            }

            if (tasks.length === 0) return null;

            return (
                <div key={snap.id} className="mb-16">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <span className="inline-block px-3 py-1 bg-[#333] text-[#A1A1AA] rounded-full text-[13px] font-bold mb-3">읽기 전용 스냅샷</span>
                            <h2 className="text-[32px] font-bold text-white tracking-tight flex items-center gap-3">
                                <span className="text-[#b3b0a6]">{snap.week_label} {snap.week_label === '26년 5월 3주' ? '(26.5.11~5.17)' : snap.week_label === '26년 5월 2주' ? '(26.5.4~5.10)' : ''}</span>
                                <span className="text-[#A1A1AA] text-[24px]">|</span>
                                <span>{workspaces.find(w => w.id === workspaceFilter)?.name}</span>
                            </h2>
                            <div className="text-[#86868B] text-[13px] mt-2">
                                저장 일시: {new Date(snap.created_at).toLocaleString('ko-KR')}
                            </div>
                        </div>
                    </div>
                    {tasks.map(row => (
                        <div key={row.id} className="w-full relative rounded-[24px] px-6 pt-[22px] pb-[14px] bg-[#272726] border border-[#3c3c3c] mb-4">
                            <div className="flex justify-between items-start gap-8">
                                <div className="flex-1 flex gap-8">
                                    <div className="w-[650px] shrink-0 flex flex-col gap-[2px] border-r border-[#444]/50 pr-8">
                                        <div className="flex items-center gap-2">
                                            {row.related_asset && (
                                                <span className="px-[6px] py-[2px] bg-[#333] text-[#A1A1AA] border border-[#444] rounded-[4px] text-[11px] font-bold whitespace-nowrap">
                                                    {row.related_asset}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-[20px] font-bold text-white mt-1 mb-2 tracking-tight leading-tight whitespace-normal">{row.task_name}</h3>
                                        <div className="flex items-center gap-4 text-[13px] font-medium mt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#86868B]">이해관계자</span>
                                                <span className="text-[#E5E5E5] px-2 py-1 bg-[#222] rounded-[6px] border border-[#333]">{row.company_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#86868B]">상태</span>
                                                <span className="text-[#E5E5E5] px-2 py-1 bg-[#222] rounded-[6px] border border-[#333]">{row.status}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#86868B]">목표일</span>
                                                <span className="text-[#E5E5E5] px-2 py-1 bg-[#222] rounded-[6px] border border-[#333]">{row.due_date || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-[13px] font-bold text-[#86868B] mb-[6px]">Next Action</span>
                                        <p className="text-[16px] text-[#E5E5E5] leading-relaxed break-keep whitespace-pre-wrap">{row.next_action || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            {row.notes && (
                                <div className="mt-4 pt-4 border-t border-[#3c3c3c]">
                                    <span className="block text-[13px] font-bold text-[#86868B] mb-[6px]">상세 메모</span>
                                    <p className="text-[14px] text-[#A1A1AA] leading-relaxed break-keep whitespace-pre-wrap">{row.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        });
    };

    return (`;
content = content.replace(renderTasksRegex, newRenderTasks);

// Also we need to replace the Main Viewer Area header that was outside renderTasks previously
const oldMainViewer = `            {/* Main Viewer Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent h-[200px] pointer-events-none z-0"></div>
                
                {selectedSnapshot ? (
                    <>
                        <div className="relative z-10 px-12 pt-12 pb-6 border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-[#333] text-[#A1A1AA] rounded-full text-[13px] font-bold mb-3">읽기 전용 스냅샷</span>
                                    <h2 className="text-[32px] font-bold text-white tracking-tight flex items-center gap-3">
                                        <span className="text-[#b3b0a6]">{selectedSnapshot.week_label}</span>
                                        <span className="text-[#A1A1AA] text-[24px]">|</span>
                                        <span>{workspaces.find(w => w.id === workspaceFilter)?.name}</span>
                                    </h2>
                                    <div className="text-[#86868B] text-[13px] mt-2">
                                        저장 일시: {new Date(selectedSnapshot.created_at).toLocaleString('ko-KR')}
                                    </div>
                                </div>
                                <div className="w-[300px]">
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
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-12 py-8 relative z-10 custom-scrollbar">
                            <div className="max-w-[1200px]">
                                {renderTasks()}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center relative z-10">
                        <div className="text-[#86868B] text-[15px] font-medium">좌측에서 열람할 주차를 선택해주세요.</div>
                    </div>
                )}
            </div>`;

const newMainViewer = `            {/* Main Viewer Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#111]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-transparent h-[200px] pointer-events-none z-0"></div>
                
                {selectedSnapshotIds.length > 0 ? (
                    <>
                        <div className="relative z-10 px-12 pt-12 pb-6 border-b border-[#333] bg-[#1a1a1a]/80 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-0">
                                <div>
                                    <h2 className="text-[24px] font-bold text-white tracking-tight flex items-center gap-3">
                                        <span>타임라인 통합 열람 모드</span>
                                    </h2>
                                </div>
                                <div className="w-[300px]">
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
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-12 py-8 relative z-10 custom-scrollbar">
                            <div className="max-w-[1200px]">
                                {renderTasks()}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center relative z-10">
                        <div className="text-[#86868B] text-[15px] font-medium">좌측에서 열람할 주차를 선택해주세요.</div>
                    </div>
                )}
            </div>`;

content = content.replace(oldMainViewer, newMainViewer);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Archive patched successfully');
