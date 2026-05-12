import re

files_to_update = [
    'src/components/system/VehicleIntegrated.jsx',
    'src/components/system/workspace/WorkspaceFund.jsx',
    'src/components/system/workspace/WorkspaceFinancing.jsx'
]

# We need to do the same updates we did for SystemFund421.jsx:
# 1. Update the VehicleDetailCard:
#   a) sortedTranches
#   b) getTrancheColor
#   c) getTrancheHoverColor
#   d) getTrancheBgColor
#   e) order
#   f) sumC1 in the header
# 2. Update the "총 3,230억" in the "펀드 개요" block
# 3. Update the hardcoded tbody (if they have it! Wait, WorkspaceFund and VehicleIntegrated might not have the hardcoded tbody for the full LP list since that is specific to the SystemFund421 page... Let's check.)

def fix_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        original_content = content

        # a) sortedTranches
        content = re.sub(
            r"(const sortedTranches = tranches\.sort\(\(a, b\) => \{\n\s*)(if \(a\.includes\('Tr\.'\) && b\.includes\('Tr\.'\)\))",
            r"\1const orderObj = {'A종 수익증권': 1, 'B종 수익증권': 2, 'C종 수익증권': 3, 'C-1종 수익증권': 4};\n            if (orderObj[a] && orderObj[b]) return orderObj[a] - orderObj[b];\n            \n            \2",
            content
        )

        # b, c, d) getTrancheColor, getTrancheHoverColor, getTrancheBgColor
        content = re.sub(
            r"if \(trancheName\.includes\('Tr\.C'\) \|\| trancheName\.includes\('Tr\. C'\) \|\| trancheName\.includes\('C종'\)\) return '(text-\[#b889d9\]|group-hover:text-\[#b889d9\]|bg-\[#85609e\])';",
            r"if (trancheName.includes('Tr.C') || trancheName.includes('Tr. C') || (trancheName.includes('C종') && !trancheName.includes('C-1종'))) return '\1';",
            content
        )
        content = re.sub(
            r"if \(trancheName\.includes\('Tr\.D'\) \|\| trancheName\.includes\('Tr\. D'\) \|\| trancheName\.includes\('D종'\)\) return '(text-\[#cd879c\]|group-hover:text-\[#cd879c\]|bg-\[#966171\])';",
            r"if (trancheName.includes('Tr.D') || trancheName.includes('Tr. D') || trancheName.includes('D종') || trancheName.includes('C-1종')) return '\1';",
            content
        )

        # e) order
        content = content.replace(
            "const order = {'Equity':1, '주주대여':2, 'Tr.A':3, 'Tr.A-1':3.1, 'Tr.A-2':3.2, 'Tr.B':4, 'Tr.C':5, 'Tr.D':6, 'A종 수익증권':3, 'B종 수익증권':4, 'C종 수익증권':5};",
            "const order = {'Equity':1, '주주대여':2, 'Tr.A':3, 'Tr.A-1':3.1, 'Tr.A-2':3.2, 'Tr.B':4, 'Tr.C':5, 'Tr.D':6, 'A종 수익증권':3, 'B종 수익증권':4, 'C종 수익증권':5, 'C-1종 수익증권':5.1};"
        )

        # f) sumC1
        summary_find = """                                const sumA = data['A종 수익증권']?.reduce((a,b)=>a+(b.rawAmount||0),0) || 0;
                                const sumB = data['B종 수익증권']?.reduce((a,b)=>a+(b.rawAmount||0),0) || 0;
                                const sumC = data['C종 수익증권']?.reduce((a,b)=>a+(b.rawAmount||0),0) || 0;
                                const total = sumA + sumB + sumC;
                                return (
                                    <>
                                        {sumA > 0 && (
                                        <div className="flex items-baseline gap-[4px] shrink-0">
                                            <span className={`${getTrancheColor('A종')} font-bold text-[14px] mr-[2px]`}>A종 수익증권</span>
                                            <span className="text-white font-bold text-[14px]">{formatAmount(sumA)}</span>
                                            <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({total > 0 ? ((sumA/total)*100).toFixed(1) : 0}%)</span>
                                        </div>
                                        )}
                                        {sumB > 0 && (
                                        <div className="flex items-baseline gap-[4px] shrink-0">
                                            <span className={`${getTrancheColor('B종')} font-bold text-[14px] mr-[2px]`}>B종 수익증권</span>
                                            <span className="text-white font-bold text-[14px]">{formatAmount(sumB)}</span>
                                            <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({total > 0 ? ((sumB/total)*100).toFixed(1) : 0}%)</span>
                                        </div>
                                        )}
                                        {sumC > 0 && (
                                        <div className="flex items-baseline gap-[4px] shrink-0">
                                            <span className={`${getTrancheColor('C종')} font-bold text-[14px] mr-[2px]`}>C종 수익증권</span>
                                            <span className="text-white font-bold text-[14px]">{formatAmount(sumC)}</span>
                                            <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({total > 0 ? ((sumC/total)*100).toFixed(1) : 0}%)</span>
                                        </div>
                                        )}
                                    </>
                                );"""
        summary_replace = """                                const sumA = data['A종 수익증권']?.reduce((a,b)=>a+(b.rawAmount||0),0) || 0;
                                const sumB = data['B종 수익증권']?.reduce((a,b)=>a+(b.rawAmount||0),0) || 0;
                                const sumC = data['C종 수익증권']?.reduce((a,b)=>a+(b.rawAmount||0),0) || 0;
                                const sumC1 = data['C-1종 수익증권']?.reduce((a,b)=>a+(b.rawAmount||0),0) || 0;
                                const total = sumA + sumB + sumC + sumC1;
                                return (
                                    <>
                                        {sumA > 0 && (
                                        <div className="flex items-baseline gap-[4px] shrink-0">
                                            <span className={`${getTrancheColor('A종')} font-bold text-[14px] mr-[2px]`}>A종 수익증권</span>
                                            <span className="text-white font-bold text-[14px]">{formatAmount(sumA)}</span>
                                            <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({total > 0 ? ((sumA/total)*100).toFixed(1) : 0}%)</span>
                                        </div>
                                        )}
                                        {sumB > 0 && (
                                        <div className="flex items-baseline gap-[4px] shrink-0">
                                            <span className={`${getTrancheColor('B종')} font-bold text-[14px] mr-[2px]`}>B종 수익증권</span>
                                            <span className="text-white font-bold text-[14px]">{formatAmount(sumB)}</span>
                                            <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({total > 0 ? ((sumB/total)*100).toFixed(1) : 0}%)</span>
                                        </div>
                                        )}
                                        {sumC > 0 && (
                                        <div className="flex items-baseline gap-[4px] shrink-0">
                                            <span className={`${getTrancheColor('C종')} font-bold text-[14px] mr-[2px]`}>C종 수익증권</span>
                                            <span className="text-white font-bold text-[14px]">{formatAmount(sumC)}</span>
                                            <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({total > 0 ? ((sumC/total)*100).toFixed(1) : 0}%)</span>
                                        </div>
                                        )}
                                        {sumC1 > 0 && (
                                        <div className="flex items-baseline gap-[4px] shrink-0">
                                            <span className={`${getTrancheColor('C-1종')} font-bold text-[14px] mr-[2px]`}>C-1종 수익증권</span>
                                            <span className="text-white font-bold text-[14px]">{formatAmount(sumC1)}</span>
                                            <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({total > 0 ? ((sumC1/total)*100).toFixed(1) : 0}%)</span>
                                        </div>
                                        )}
                                    </>
                                );"""
        content = content.replace(summary_find, summary_replace)

        # 2. Update the "총 3,230억" in the "펀드 개요" block
        content = content.replace(
            '<>총 3,230억 <span className="text-[#86868B] ml-1">(A종 602억 / B종 620억 / C종 1,850억 / <span className="text-[#82A0BC] font-medium">C-1종 140억</span>)</span></>',
            '<><span className="font-bold text-[#0A84FF]">총 3,230억</span> <span className="text-[#86868B] ml-1">(A종 602억 / B종 620억 / C종 1,850억 / <span className="text-[#82A0BC] font-medium">C-1종 140억</span>)</span></>'
        )

        if content != original_content:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Updated {filepath}")
        else:
            print(f"No changes made to {filepath}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

for filepath in files_to_update:
    fix_file(filepath)

