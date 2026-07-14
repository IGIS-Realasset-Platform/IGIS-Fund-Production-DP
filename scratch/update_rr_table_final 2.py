import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update wrappers
old_wrapper = """<div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden mb-[40px] shadow-sm min-h-[1110px]">
                <div className="w-full overflow-x-auto overflow-y-visible pr-0 timeline-scrollbar" style={{ minHeight: "250px" }}>
                    <div className="flex items-center min-w-[2380px]">
                        <table className="text-left table-fixed w-[1580px] min-w-[1580px] max-w-[1580px] border-collapse border-b border-[#3c3c3c] bg-[#272726]">"""

new_wrapper = """<div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-visible relative mb-[40px] shadow-sm min-h-[1110px]">
                <div className="w-full rounded-[32px] select-text">
                    <div className="flex items-center w-full overflow-visible pointer-events-none">
                        <table className="text-left table-fixed w-[1290px] min-w-[1290px] max-w-[1290px] pointer-events-auto border-collapse border-b border-[#3c3c3c] bg-[#272726]">"""

content = content.replace(old_wrapper, new_wrapper)

# 2. Update width classes based on calculations
content = content.replace("w-[104px] min-w-[104px] max-w-[104px]", "w-[90px] min-w-[90px] max-w-[90px]")
content = content.replace("w-[130px] min-w-[130px] max-w-[130px]", "w-[110px] min-w-[110px] max-w-[110px]")
content = content.replace("w-[230px] min-w-[230px] max-w-[230px]", "w-[190px] min-w-[190px] max-w-[190px]")
content = content.replace("w-[75px] min-w-[75px] max-w-[75px]", "w-[65px] min-w-[65px] max-w-[65px]")
content = content.replace("w-[116px] min-w-[116px] max-w-[116px]", "w-[90px] min-w-[90px] max-w-[90px]")
content = content.replace("w-[260px] min-w-[260px] max-w-[260px]", "w-[180px] min-w-[180px] max-w-[180px]")
content = content.replace("w-[195px] min-w-[195px] max-w-[195px]", "w-[205px] min-w-[205px] max-w-[205px]")

# For w-[120px], we have two columns: 외부 상대방 (100px) and 필요산출물 (130px)
# Header
content = content.replace('w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">외부 상대방', 'w-[100px] min-w-[100px] max-w-[100px] text-center bg-[#272726]">외부 상대방')
content = content.replace('w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">필요산출물', 'w-[130px] min-w-[130px] max-w-[130px] text-center bg-[#272726]">필요산출물')
# Body
content = content.replace('w-[120px] min-w-[120px] max-w-[120px]">\n                                                {item.partner', 'w-[100px] min-w-[100px] max-w-[100px]">\n                                                {item.partner')
content = content.replace('w-[120px] min-w-[120px] max-w-[120px]">\n                                                {item.output', 'w-[130px] min-w-[130px] max-w-[130px]">\n                                                {item.output')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated layout.")
