import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = '''<div className="w-full flex items-center justify-start gap-4 mb-[18px]">
                <h2 className="text-[32px] font-bold text-white tracking-tight leading-none text-left">R&R 및 필요산출물</h2>
            </div>'''
            
replacement = '''<div className="w-full flex items-baseline justify-start gap-[16px] mb-[18px]">
                <h2 className="text-[32px] font-bold text-white tracking-tight leading-none text-left">R&R 및 필요산출물</h2>
                <p className="text-[15px] text-[#86868B] leading-none">IOTA CFT의 대표 업무 R&R과 그에따른 가이드라인을 공유합니다.</p>
            </div>'''

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added description to R&R title.")
else:
    print("Target R&R div not found.")
