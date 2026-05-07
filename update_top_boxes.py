import sys

path = 'src/components/system/VehicleIntegrated.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Add getTypeTotal function
get_total_func = """    // Calculate totals dynamically
    const getTotal = (v, p = 'Current') => {
        let sum = 0;
        if (iotaData[v] && iotaData[v][p]) {
            Object.values(iotaData[v][p]).forEach(trancheArray => {
                sum += trancheArray.reduce((a, b) => a + (parseFloat(b.rawAmount) || 0), 0);
            });
        }
        return sum;
    };"""

new_get_total = """    // Calculate totals dynamically
    const getTotal = (v, p = 'Current') => {
        let sum = 0;
        if (iotaData[v] && iotaData[v][p]) {
            Object.values(iotaData[v][p]).forEach(trancheArray => {
                sum += trancheArray.reduce((a, b) => a + (parseFloat(b.rawAmount) || 0), 0);
            });
        }
        return sum;
    };

    const getTypeTotal = (v, p = 'Current', typeStr) => {
        let sum = 0;
        if (iotaData[v] && iotaData[v][p]) {
            Object.values(iotaData[v][p]).forEach(trancheArray => {
                trancheArray.forEach(item => {
                    if (item.type === typeStr && !item.isSubHeader) sum += (parseFloat(item.rawAmount) || 0);
                });
            });
        }
        return sum;
    };"""

if get_total_func in content:
    content = content.replace(get_total_func, new_get_total)

# 2. Replace the top boxes layout
old_boxes = """                        <div className="flex gap-4 w-full">
                            <div 
                                onClick={() => document.getElementById('section-427')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex-1 px-4 py-[14px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col cursor-pointer hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
                            >
                                <span className="text-[13px] text-[#86868B]">427 PFV</span>
                                <span className="text-[20px] font-bold text-white tracking-tight">{formatAmount(displayTotal427)}</span>
                            </div>
                            <div 
                                onClick={() => document.getElementById('section-816')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex-1 px-4 py-[14px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col cursor-pointer hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
                            >
                                <span className="text-[13px] text-[#86868B]">816 PFV</span>
                                <span className="text-[20px] font-bold text-white tracking-tight">{formatAmount(displayTotal816)}</span>
                            </div>
                            <div 
                                onClick={() => document.getElementById('section-421')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex-1 px-4 py-[14px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col cursor-pointer hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
                            >
                                <span className="text-[13px] text-[#86868B]">421호 펀드</span>
                                <span className="text-[20px] font-bold text-white tracking-tight">{formatAmount(total421)}</span>
                            </div>
                            <div 
                                onClick={() => document.getElementById('section-ipr')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex-1 px-4 py-[14px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col cursor-pointer hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
                            >
                                <span className="text-[13px] text-[#86868B]">Project REITs</span>
                                <span className="text-[20px] font-bold text-white tracking-tight">옵션 설계중</span>
                            </div>
                        </div>"""

new_boxes = """                        <div className="flex gap-4 w-full">
                            {/* 427 PFV Box */}
                            <div 
                                onClick={() => document.getElementById('section-427')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex-1 px-[20px] py-[16px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col justify-between cursor-pointer hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
                            >
                                <span className="text-[14px] font-bold text-white tracking-tight mb-[12px]">427 PFV</span>
                                <div className="flex flex-col gap-[6px]">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-[#86868B]">Equity</span>
                                        <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(427, phase427 === 'bridge' ? 'Bridge' : 'Refinancing', 'Equity'))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-[#86868B]">Loan</span>
                                        <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(427, phase427 === 'bridge' ? 'Bridge' : 'Refinancing', 'Loan'))}</span>
                                    </div>
                                    <div className="border-t border-[#333] pt-[10px] mt-[6px] flex justify-between items-end">
                                        <span className="text-[13px] text-[#86868B] font-medium leading-none mb-[2px]">Total</span>
                                        <span className="text-[20px] font-bold text-white tracking-tight leading-none">{formatAmount(displayTotal427)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 816 PFV Box */}
                            <div 
                                onClick={() => document.getElementById('section-816')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex-1 px-[20px] py-[16px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col justify-between cursor-pointer hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
                            >
                                <span className="text-[14px] font-bold text-white tracking-tight mb-[12px]">816 PFV</span>
                                <div className="flex flex-col gap-[6px]">
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-[#86868B]">Equity</span>
                                        <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(816, phase816 === 'bridge' ? 'Bridge' : 'Refinancing', 'Equity'))}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px]">
                                        <span className="text-[#86868B]">Loan</span>
                                        <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(816, phase816 === 'bridge' ? 'Bridge' : 'Refinancing', 'Loan'))}</span>
                                    </div>
                                    <div className="border-t border-[#333] pt-[10px] mt-[6px] flex justify-between items-end">
                                        <span className="text-[13px] text-[#86868B] font-medium leading-none mb-[2px]">Total</span>
                                        <span className="text-[20px] font-bold text-white tracking-tight leading-none">{formatAmount(displayTotal816)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* 421 Fund Box */}
                            <div 
                                onClick={() => document.getElementById('section-421')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="flex-1 px-[20px] py-[16px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col justify-between cursor-pointer hover:bg-[#1f1f1f] hover:border-[#444] transition-all"
                            >
                                <span className="text-[14px] font-bold text-white tracking-tight mb-[12px]">421호 펀드</span>
                                <div className="flex flex-col justify-end h-full">
                                    <div className="border-t border-[#333] pt-[10px] mt-auto flex justify-between items-end">
                                        <span className="text-[13px] text-[#86868B] font-medium leading-none mb-[2px]">Total</span>
                                        <span className="text-[20px] font-bold text-white tracking-tight leading-none">{formatAmount(total421)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>"""

if old_boxes in content:
    content = content.replace(old_boxes, new_boxes)
else:
    print("Could not find the old boxes.")

with open(path, 'w') as f:
    f.write(content)
print("Updated top boxes.")
