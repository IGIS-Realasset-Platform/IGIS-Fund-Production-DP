import re

with open('src/components/system/VehicleIntegrated.jsx', 'r') as f:
    content = f.read()

# 1. Update useState('current') to useState('new') for phase421
content = content.replace("const [phase421, setPhase421] = useState('current');", "const [phase421, setPhase421] = useState('new');")

# 2. Update toggle421 to match the perfected version
perfect_toggle = """    const toggle421 = (
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

toggle_start = content.find("    const toggle421 = (")
toggle_end = content.find("    const renderTrancheRow = (", toggle_start)

if toggle_start != -1 and toggle_end != -1:
    content = content[:toggle_start] + perfect_toggle + "\n\n" + content[toggle_end:]

# 3. Replace VehicleDetailCard with Fund421DetailCard for 421 section
card_target = """            <VehicleDetailCard 
                id="section-421" 
                vehicleId="421"
                title="3. 421호 펀드" 
                totalAmountStr={formatAmount(total421)} 
                data={iotaData[421]?.[activePhase421] || {}} 
                toggleContent={toggle421}
            />"""

new_card = """            <Fund421DetailCard 
                id="section-421" 
                vehicleId="421"
                title="3. 421호 펀드" 
                totalAmountStr={formatAmount(total421)} 
                data={iotaData[421]?.[activePhase421] || {}} 
                toggleContent={toggle421}
            />"""

content = content.replace(card_target, new_card)

# 4. Add import Fund421DetailCard
if "import Fund421DetailCard" not in content:
    content = content.replace("import VehicleDetailCard from './shared/VehicleDetailCard';", "import VehicleDetailCard from './shared/VehicleDetailCard';\nimport Fund421DetailCard from './shared/Fund421DetailCard';")

with open('src/components/system/VehicleIntegrated.jsx', 'w') as f:
    f.write(content)

