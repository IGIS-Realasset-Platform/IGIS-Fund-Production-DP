import re

perfect_toggle = """    const toggle421 = (
        <div className="bg-[#1C1C1E] p-1 rounded-[12px] flex items-center border border-[#3c3c3c]">
            <button 
                onClick={() => setPhase421('current')}
                className={`relative px-4 py-1.5 rounded-[10px] text-[13px] font-bold transition-all duration-300 cursor-pointer ${phase421 === 'current' ? 'bg-[#2C2C2E] text-[#0A84FF] shadow-sm' : 'text-[#86868B] hover:text-white'}`}
            >
                <span className="absolute -top-[20px] left-1/2 -translate-x-1/2 text-[11px] text-[#86868B] tracking-tight whitespace-nowrap font-normal cursor-default">2024.10.ver</span>
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

# Fix WorkspaceFund.jsx
with open('src/components/system/workspace/WorkspaceFund.jsx', 'r') as f:
    ws_content = f.read()

# Replace toggle421 in WorkspaceFund
ws_start = ws_content.find("    const toggle421 = (")
ws_end = ws_content.find("    const activePhase421 =", ws_start)
if ws_start != -1 and ws_end != -1:
    ws_content = ws_content[:ws_start] + perfect_toggle + "\n\n" + ws_content[ws_end:]

with open('src/components/system/workspace/WorkspaceFund.jsx', 'w') as f:
    f.write(ws_content)

# Fix SystemFund421.jsx
with open('src/components/system/SystemFund421.jsx', 'r') as f:
    sys_content = f.read()

# Replace toggle421 in SystemFund
sys_start = sys_content.find("    const toggle421 = (")
sys_end = sys_content.find("    const data421 =", sys_start)
if sys_start != -1 and sys_end != -1:
    sys_content = sys_content[:sys_start] + perfect_toggle + "\n\n" + sys_content[sys_end:]

with open('src/components/system/SystemFund421.jsx', 'w') as f:
    f.write(sys_content)

