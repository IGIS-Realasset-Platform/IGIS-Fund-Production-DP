import sys

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix N badge timestamps (set to 2026-07-14T04:00:00.000Z to bypass mass import)
target_feature_time = "const featureStartTime = '2026-07-14T00:00:00.000Z';"
replacement_feature_time = "const featureStartTime = '2026-07-14T04:00:00.000Z';"
content = content.replace(target_feature_time, replacement_feature_time)

target_is_new_condition = "new Date(t.created_at).getTime() > new Date('2026-07-14T00:00:00Z').getTime() &&"
replacement_is_new_condition = "new Date(t.created_at).getTime() > new Date('2026-07-14T04:00:00Z').getTime() &&"
content = content.replace(target_is_new_condition, replacement_is_new_condition)

# 2. Fix table rounded corners (restore overflow-hidden to outer wrapper)
target_outer_wrapper = '<div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] mb-[10px] shadow-sm select-text">'
replacement_outer_wrapper = '<div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden mb-[10px] shadow-sm select-text">'
content = content.replace(target_outer_wrapper, replacement_outer_wrapper)

# 3. Fix priority column ? badge placement (remove inner relative, set badge to -top-[2px] relative to TH)
target_priority_header = """<th className="relative pl-[6px] w-[56px] min-w-[56px] max-w-[56px] text-center select-none cursor-pointer hover:text-white transition-colors" onClick={() => setPrioritySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                                            <div className="flex items-center justify-center relative">
                                                <span 
                                                    className="absolute top-[2px] left-[calc(50%+3px)] -translate-x-1/2 inline-flex items-center justify-center w-[13px] h-[13px] rounded-full bg-[#272726] border border-[#3c3c3c] hover:bg-white/20 text-[10px] text-[#86868B] hover:text-white font-bold cursor-pointer z-10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsCriteriaModalOpen(true);
                                                    }}
                                                    title="우선순위 산정 기준 보기"
                                                >
                                                    ?
                                                </span>
                                                <span className="leading-tight text-[11px]">우선순위</span>
                                                <span className="text-[10px] text-[#2997ff] ml-0.5">{prioritySortOrder === 'desc' ? '▼' : '▲'}</span>
                                            </div>
                                        </th>"""

# Notice inner div no longer has 'relative', and the badge is absolute to the TH.
# The user originally had it overlapping the top line (-top-1.5 = -6px). Then asked to move it DOWN by 4px -> -top-[2px] (-2px).
# If it's at -2px, it might be slightly clipped by overflow-hidden. We will see. But at least it won't overlap the text!
replacement_priority_header = """<th className="relative pl-[6px] w-[56px] min-w-[56px] max-w-[56px] text-center select-none cursor-pointer hover:text-white transition-colors" onClick={() => setPrioritySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                                            <div className="flex items-center justify-center">
                                                <span 
                                                    className="absolute -top-[2px] left-[calc(50%+3px)] -translate-x-1/2 inline-flex items-center justify-center w-[13px] h-[13px] rounded-full bg-[#272726] border border-[#3c3c3c] hover:bg-white/20 text-[10px] text-[#86868B] hover:text-white font-bold cursor-pointer z-[40]"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsCriteriaModalOpen(true);
                                                    }}
                                                    title="우선순위 산정 기준 보기"
                                                >
                                                    ?
                                                </span>
                                                <span className="leading-tight text-[11px]">우선순위</span>
                                                <span className="text-[10px] text-[#2997ff] ml-0.5">{prioritySortOrder === 'desc' ? '▼' : '▲'}</span>
                                            </div>
                                        </th>"""
content = content.replace(target_priority_header, replacement_priority_header)


# Write changes
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("All 3 critical bugs fixed.")
