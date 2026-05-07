import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Separator and margin for 통합 Vehicle 파이낸싱 구조
old_vehicle = """                <div className="w-full mt-[40px]">
                    <h2 className="text-[20px] font-bold text-white mb-[20px]">통합 Vehicle 파이낸싱 구조</h2>"""
new_vehicle = """                <div className="w-full mt-[30px] border-t border-[#3c3c3c] pt-[30px]">
                    <h2 className="text-[20px] font-bold text-white mb-[12px]">통합 Vehicle 파이낸싱 구조</h2>"""
content = content.replace(old_vehicle, new_vehicle)

# 2. Remove English titles and adjust bottom margin (mb-[20px] -> mb-[12px])
# Interest Timeline
old_interest = """<h2 className="text-[20px] font-bold text-white mb-[20px] uppercase tracking-tight"><span className="text-[#86868B] text-[13px] mr-[10px] uppercase font-bold tracking-widest font-['Inter']">Interest Timeline</span>월별 이자 발생 시계열</h2>"""
new_interest = """<h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">월별 이자 발생 시계열</h2>"""
content = content.replace(old_interest, new_interest)

# PF Conversion
old_pf = """<h2 className="text-[20px] font-bold text-white mb-[20px] uppercase tracking-tight"><span className="text-[#86868B] text-[13px] mr-[10px] uppercase font-bold tracking-widest font-['Inter']">PF Conversion</span>본 PF 계획(통합 PF)</h2>"""
new_pf = """<h2 className="text-[20px] font-bold text-white mb-[12px] uppercase tracking-tight">본 PF 계획(통합 PF)</h2>"""
content = content.replace(old_pf, new_pf)

# Market Watch
old_market = """<div className="flex justify-between items-end mb-[20px]">
                            <h2 className="text-[20px] font-bold text-white uppercase tracking-tight"><span className="text-[#86868B] text-[13px] mr-[10px] uppercase font-bold tracking-widest font-['Inter']">Market Watch</span>시장 이슈 모니터링</h2>"""
new_market = """<div className="flex justify-between items-end mb-[12px]">
                            <h2 className="text-[20px] font-bold text-white uppercase tracking-tight">시장 이슈 모니터링</h2>"""
content = content.replace(old_market, new_market)

# 3. Reduce top margins (-10px)
# Top spacer before Interest Timeline
content = content.replace('<div className="w-full h-[60px]"></div>', '<div className="w-full h-[50px]"></div>')
# Space between lower sections (60px -> 50px)
content = content.replace('<div className="w-full mb-[60px]">', '<div className="w-full mb-[50px]">')
# Space for market watch section (40px -> 30px)
content = content.replace('<div className="w-full mb-[40px]">', '<div className="w-full mb-[30px]">')

with open(path, 'w') as f:
    f.write(content)
print("Updated UI styling.")
