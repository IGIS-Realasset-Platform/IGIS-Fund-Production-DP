import sys

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update priority header width and padding
target_header = """<th className="relative w-[50px] min-w-[50px] max-w-[50px] text-center select-none cursor-pointer hover:text-white transition-colors" onClick={() => setPrioritySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                                            <div className="flex items-center justify-center">
                                                <span 
                                                    className="absolute top-[2px] left-1/2 -translate-x-1/2 inline-flex items-center justify-center w-[13px] h-[13px] rounded-full bg-[#272726] border border-[#3c3c3c] hover:bg-white/20 text-[10px] text-[#86868B] hover:text-white font-bold cursor-pointer z-10"
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

replacement_header = """<th className="relative pl-[6px] w-[56px] min-w-[56px] max-w-[56px] text-center select-none cursor-pointer hover:text-white transition-colors" onClick={() => setPrioritySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
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

content = content.replace(target_header, replacement_header)

# 2. Update priority td logic
target_td = "text-center font-mono w-[50px] min-w-[50px] max-w-[50px] font-bold"
replacement_td = "pl-[6px] text-center font-mono w-[56px] min-w-[56px] max-w-[56px] font-bold"
content = content.replace(target_td, replacement_td)

# 3. Update table wrapper min-widths (+6px)
content = content.replace('min-w-[3436px]', 'min-w-[3442px]')
content = content.replace('min-w-[2261px]', 'min-w-[2267px]')
content = content.replace('min-w-[2636px]', 'min-w-[2642px]')
content = content.replace('min-w-[1461px]', 'min-w-[1467px]')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Priority column padding applied.")
