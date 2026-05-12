import re

with open('src/components/system/workspace/WorkspaceFund.jsx', 'r') as f:
    content = f.read()

# 1. Add import
if "import Fund421DetailCard" not in content:
    content = content.replace("import VehicleActivityLog from '../shared/VehicleActivityLog';", "import VehicleActivityLog from '../shared/VehicleActivityLog';\nimport Fund421DetailCard from '../shared/Fund421DetailCard';")

# 2. Replace toggle421
old_toggle = """    const toggle421 = (
        <div className="bg-[#1C1C1E] p-1 rounded-[12px] flex items-center border border-[#3c3c3c]">
            <button 
                onClick={() => setPhase421('current')}
                className={`relative px-4 py-1.5 rounded-[10px] text-[13px] font-bold transition-all duration-300 ${phase421 === 'current' ? 'bg-[#2C2C2E] text-[#0A84FF] shadow-sm' : 'text-[#86868B] hover:text-white'}`}
            >
                <span className="absolute -top-[20px] left-1/2 -translate-x-1/2 text-[11px] text-[#86868B] tracking-tight whitespace-nowrap font-normal cursor-default">2024.10.ver</span>
                기존 펀드
            </button>
            <button 
                onClick={() => setPhase421('new')}
                className={`px-4 py-1.5 rounded-[10px] text-[13px] font-bold transition-all duration-300 ${phase421 === 'new' ? 'bg-[#2C2C2E] text-white shadow-sm' : 'text-[#86868B] hover:text-white'}`}
            >
                신규 업데이트
            </button>
        </div>
    );"""

new_toggle = """    const toggle421 = (
        <div className="bg-[#1C1C1E] p-1 rounded-[12px] flex items-center border border-[#3c3c3c]">
            <button 
                onClick={() => setPhase421('current')}
                className={`relative px-4 py-1.5 rounded-[10px] text-[13px] font-bold transition-all duration-300 cursor-pointer ${phase421 === 'current' ? 'bg-[#2C2C2E] text-[#0A84FF] shadow-sm' : 'text-[#86868B] hover:text-white'}`}
            >
                기존 펀드
            </button>
            <button 
                onClick={() => setPhase421('new')}
                className={`relative px-4 py-1.5 rounded-[10px] text-[13px] font-bold transition-all duration-300 cursor-pointer ${phase421 === 'new' ? 'bg-[#2C2C2E] text-[#0A84FF] shadow-sm' : 'text-[#86868B] hover:text-white'}`}
            >
                <span className="absolute -top-[20px] left-1/2 -translate-x-1/2 text-[11px] text-[#86868B] tracking-tight whitespace-nowrap font-normal cursor-default">2026.05</span>
                현재 현황
            </button>
        </div>
    );"""

content = content.replace(old_toggle, new_toggle)

# 3. Replace VehicleDetailCard with Fund421DetailCard and change title
content = content.replace("""                    <VehicleDetailCard 
                        id="section-421" 
                        vehicleId="421"
                        title="3. 421호 펀드" """, """                    <Fund421DetailCard 
                        id="section-421" 
                        vehicleId="421"
                        title="421호 펀드 투자 구조" """)

with open('src/components/system/workspace/WorkspaceFund.jsx', 'w') as f:
    f.write(content)

