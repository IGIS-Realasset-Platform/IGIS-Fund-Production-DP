import sys

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove overflow-hidden from outer wrapper
target_outer = '<div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden mb-[10px] shadow-sm select-text">'
replacement_outer = '<div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] mb-[10px] shadow-sm select-text">'
content = content.replace(target_outer, replacement_outer)

# 2. Add rounded-tl-[24px] to ID th
target_th = '<th className="pl-[10px] text-center w-[50px] min-w-[50px] max-w-[50px] sticky left-0 bg-[#272726] z-30">ID</th>'
replacement_th = '<th className="pl-[10px] text-center w-[50px] min-w-[50px] max-w-[50px] sticky left-0 bg-[#272726] z-30 rounded-tl-[24px]">ID</th>'
content = content.replace(target_th, replacement_th)

# 3. Add isLastTask variable definition inside the map
target_map = """const notesVal = t.notes || fallbackItem.notes || '';
                                            return ("""
replacement_map = """const notesVal = t.notes || fallbackItem.notes || '';
                                            const isLastTask = idx === paginatedTasks.length - 1;
                                            return ("""
content = content.replace(target_map, replacement_map)

# 4. Add rounded-bl-[24px] to the ID td for the last task
target_td = "<td className={`pl-[10px] text-center text-[#86868B] text-[11px] font-mono select-none w-[50px] min-w-[50px] max-w-[50px] truncate sticky left-0 transition-colors z-10 ${isSelected ? 'bg-[#3c3c3a] group-hover:bg-[#3c3c3a]' : 'bg-[#272726] group-hover:bg-[#2d2d2c]'}`}>"
replacement_td = "<td className={`pl-[10px] text-center text-[#86868B] text-[11px] font-mono select-none w-[50px] min-w-[50px] max-w-[50px] truncate sticky left-0 transition-colors z-10 ${isSelected ? 'bg-[#3c3c3a] group-hover:bg-[#3c3c3a]' : 'bg-[#272726] group-hover:bg-[#2d2d2c]'} ${isLastTask ? 'rounded-bl-[24px]' : ''}`}>"
content = content.replace(target_td, replacement_td)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Removed overflow-hidden and applied rounded corners directly to sticky ID cells.")
