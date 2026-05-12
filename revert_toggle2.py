import re

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

files = [
    'src/components/system/SystemFund421.jsx',
    'src/components/system/workspace/WorkspaceFund.jsx',
    'src/components/system/VehicleIntegrated.jsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    start_idx = content.find("    const toggle421 = (")
    
    if start_idx != -1:
        end_idx = content.find("    );\n", start_idx)
        if end_idx != -1:
            end_idx += len("    );")
            content = content[:start_idx] + perfect_toggle + content[end_idx:]
            with open(file_path, 'w') as f:
                f.write(content)

