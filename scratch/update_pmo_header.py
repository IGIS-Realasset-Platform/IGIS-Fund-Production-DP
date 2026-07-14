import sys

file_path = "src/components/system/pmo/PmoScheduleGate.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """            {/* Header */}
            <div className="w-full flex flex-col items-start mb-[16px]">
                <h1 className="text-[32px] font-bold text-white tracking-tight leading-none mb-[8px]">마일스톤</h1>
                <div className="flex items-center gap-[24px]">
                    <p className="text-[16px] text-[#86868B] leading-[26px]">마일스톤의 최종 목표는 준공 및 Take-out/운영 전환입니다.</p>
                    {/* Legend info */}
                    <div className="flex items-center gap-4 text-[12px] font-bold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                            <span className="text-[#E5E5E5]">수행 진행 기간</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#F59E0B] font-mono text-[16px] leading-none">◆</span>
                            <span className="text-[#E5E5E5]">의사결정 / 마일스톤 달성</span>
                        </div>
                    </div>
                </div>
            </div>"""

replacement = """            {/* Header */}
            <div className="w-full flex items-end justify-between mb-[40px]">
                <div className="flex items-baseline gap-[16px]">
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none">마일스톤</h1>
                    <p className="text-[15px] text-[#86868B] leading-none">마일스톤의 최종 목표는 준공 및 Take-out/운영 전환입니다.</p>
                </div>
                {/* Legend info */}
                <div className="flex items-center gap-4 text-[12px] font-bold pb-1">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2997ff] inline-block"></span>
                        <span className="text-[#E5E5E5]">수행 진행 기간</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#F59E0B] font-mono text-[16px] leading-none flex items-center h-[12px] mb-0.5">◆</span>
                        <span className="text-[#E5E5E5]">의사결정 / 마일스톤 달성</span>
                    </div>
                </div>
            </div>"""

if target in content:
    new_content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Success")
else:
    print("Target not found")
