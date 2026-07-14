import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Delete the watermarks
# It looks like:
#                         {/* 우측 워터마크 영역 */}
#                         <div className="w-[800px] shrink-0 flex items-center justify-start pl-20 pr-8 select-none pointer-events-none box-border self-center">
#                             <div className="text-white opacity-[0.04] font-bold leading-[0.9] tracking-tighter w-full whitespace-nowrap" style={{ fontSize: 'clamp(45px, 8.5vw, 135px)' }}>
#                                 IOTA Seoul<br />Cross Functional<br />Team
#                             </div>
#                         </div>
watermark_pattern = r'\s*\{\/\*\s*우측 워터마크 영역\s*\*\/\}\s*<div[^>]*w-\[800px\][^>]*>.*?<\/div>\s*<\/div>'
content = re.sub(watermark_pattern, '', content, flags=re.DOTALL)

# 2. Add rounded-tr-[31px] to the last header
header_loop_old = """                                    {COLUMNS.map((col, cIdx) => {
                                        const borderClass = col.highlight
                                            ? 'bg-white/[0.03] text-[#60a5fa] border-r border-[#4c4c4c]/50'
                                            : 'text-[#86868B] border-r border-[#4c4c4c]/50';
                                        return (
                                            <th key={col.key} className={`text-center font-mono text-[11px] leading-tight px-1 font-bold w-[75px] ${borderClass}`}>"""

header_loop_new = """                                    {COLUMNS.map((col, cIdx) => {
                                        const isLast = cIdx === COLUMNS.length - 1;
                                        const borderClass = col.highlight
                                            ? 'bg-white/[0.03] text-[#60a5fa] border-r border-[#4c4c4c]/50'
                                            : 'text-[#86868B] border-r border-[#4c4c4c]/50';
                                        return (
                                            <th key={col.key} className={`text-center font-mono text-[11px] leading-tight px-1 font-bold w-[75px] ${borderClass} ${isLast ? 'rounded-tr-[31px]' : ''}`}>"""
content = content.replace(header_loop_old, header_loop_new)

# 3. Add rounded-br-[31px] to the last cell of the last row
cell_loop_old = """                                            {/* Grid Columns */}
                                            {COLUMNS.map((col, cIdx) => {
                                                const mark = item.schedule[col.key];
                                                const borderClass = 'border-r border-[#4c4c4c]/40';
                                                return (
                                                    <td key={col.key} className={`text-center ${
                                                        col.highlight ? 'bg-white/[0.015] group-hover:bg-white/[0.04]' : ''
                                                    } ${borderClass} w-[75px] min-w-[75px] max-w-[75px]`}>"""

cell_loop_new = """                                            {/* Grid Columns */}
                                            {COLUMNS.map((col, cIdx) => {
                                                const isLastCol = cIdx === COLUMNS.length - 1;
                                                const mark = item.schedule[col.key];
                                                const borderClass = 'border-r border-[#4c4c4c]/40';
                                                return (
                                                    <td key={col.key} className={`text-center ${
                                                        col.highlight ? 'bg-white/[0.015] group-hover:bg-white/[0.04]' : ''
                                                    } ${borderClass} w-[75px] min-w-[75px] max-w-[75px] ${isLastRow && isLastCol ? 'rounded-br-[31px]' : ''}`}>"""
content = content.replace(cell_loop_old, cell_loop_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixes applied successfully!")
