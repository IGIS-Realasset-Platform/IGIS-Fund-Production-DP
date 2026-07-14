import sys
import re

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the wrappers
old_wrapper = """<div className="-mr-[calc(50vw-50%)] border border-r-0 border-[#3c3c3c] bg-[#272726] rounded-l-[24px] overflow-hidden mb-[40px] shadow-sm min-h-[1110px]">
                <div className="w-full overflow-x-auto overflow-y-visible pr-0 timeline-scrollbar" style={{ minHeight: "250px" }}>
                    <div className="flex items-center min-w-[2380px]">
                        <table className="text-left table-fixed w-[1580px] min-w-[1580px] max-w-[1580px] border-collapse border-b border-[#3c3c3c] bg-[#272726]">"""

new_wrapper = """<div className="w-full border border-[#3c3c3c] bg-[#272726] rounded-[32px] overflow-visible relative mb-[40px] shadow-sm min-h-[1110px]">
                <div className="w-full rounded-[32px] select-text">
                    <div className="flex items-center w-full overflow-visible pointer-events-none">
                        <table className="text-left table-fixed w-[1290px] min-w-[1290px] max-w-[1290px] pointer-events-auto border-collapse border-b border-[#3c3c3c] bg-[#272726]">"""

if old_wrapper in content:
    content = content.replace(old_wrapper, new_wrapper)
    print("Replaced wrapper successfully.")
else:
    print("Failed to replace wrapper. Please check string match.")

# 2. Update Column Widths
def replace_width(old_w, new_w):
    global content
    content = content.replace(f"w-[{old_w}px]", f"w-[{new_w}px]")
    content = content.replace(f"min-w-[{old_w}px]", f"min-w-[{new_w}px]")
    content = content.replace(f"max-w-[{old_w}px]", f"max-w-[{new_w}px]")

replace_width(104, 90)
replace_width(130, 110)
replace_width(230, 190)
replace_width(75, 65)
replace_width(116, 90)
replace_width(260, 180)
# '외부 상대방' and '필요산출물' both had 120px. Let's do regex to specifically target them to avoid conflicts if they share class strings.

# They are defined like this:
# <th className="px-3 w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">외부 상대방</th>
# <th className="px-3 w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">필요산출물</th>
content = content.replace('w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726]">외부 상대방', 'w-[100px] min-w-[100px] max-w-[100px] text-center bg-[#272726]">외부 상대방')
content = content.replace('w-[120px] min-w-[120px] max-w-[120px] text-center bg-[#272726] border-l', 'w-[100px] min-w-[100px] max-w-[100px] text-center bg-[#272726] border-l') # Wait, do they have border-l?
# Let's just blindly replace w-[120px] for the body td's since there's no other 120px. 
# But wait, one goes to 100px and the other to 130px.
content = re.sub(r'w-\[120px\] min-w-\[120px\] max-w-\[120px\](.*?)>외부 상대방', r'w-[100px] min-w-[100px] max-w-[100px]\1>외부 상대방', content)
content = re.sub(r'w-\[120px\] min-w-\[120px\] max-w-\[120px\](.*?)>필요산출물', r'w-[130px] min-w-[130px] max-w-[130px]\1>필요산출물', content)

# Also the body TDs for external and output:
# Body cells are tricky. Let's find them by their content in map.
# 외부 상대방 = item.counterpart
# 필요산출물 = item.output
# They are rendered in the tbody loop. Let's just change their specific html strings.
