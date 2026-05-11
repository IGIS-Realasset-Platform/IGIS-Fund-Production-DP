const fs = require('fs');
const filePath = '/Users/jkjeon2025/Documents/GitHub/IGIS Fund Production DP/src/components/system/workspace/WorkspaceArchive.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldMap = `                        Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(groupKey => (
                            <div key={groupKey}>
                                <div className="flex justify-between items-center mb-3">
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
                                </div>
                                <div className="flex flex-col gap-1">`;

const newMap = `                        Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(groupKey => {
                            const groupIds = grouped[groupKey].map(s => s.id);
                            const allSelected = groupIds.length > 0 && groupIds.every(id => selectedSnapshotIds.includes(id));
                            return (
                            <div key={groupKey}>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-[#86868B] text-[12px] font-bold uppercase">{groupKey}</h3>
                                    <button 
                                        onClick={() => {
                                            if (allSelected) {
                                                const currentWeekSnap = grouped[groupKey].find(s => s.week_label === '26년 5월 3주') || grouped[groupKey][0];
                                                if (currentWeekSnap) {
                                                    setSelectedSnapshotIds(prev => {
                                                        const filtered = prev.filter(id => !groupIds.includes(id));
                                                        return [...filtered, currentWeekSnap.id];
                                                    });
                                                }
                                            } else {
                                                setSelectedSnapshotIds(prev => [...new Set([...prev, ...groupIds])]);
                                            }
                                        }} 
                                        className="text-[#86868B] text-[11px] font-bold hover:text-[#E5E5E5] bg-[#333] hover:bg-[#444] py-1 rounded-[4px] transition-colors w-[76px] text-center"
                                    >
                                        {allSelected ? '전체선택 해제' : '전체선택'}
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1">`;

content = content.replace(oldMap, newMap);

const oldEnd = `                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>`;

const newEnd = `                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                        })
                    )}
                </div>`;

content = content.replace(oldEnd, newEnd);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Archive patched successfully 3');
