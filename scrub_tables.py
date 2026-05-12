import re

files_to_scrub = [
    'src/components/system/SystemFund421.jsx',
    'src/components/system/workspace/WorkspaceFund.jsx'
]

dynamic_render_func = """
    const renderDynamicTableBody = () => {
        const activePhase = phase421 === 'new' ? 'new' : '2024.10.ver';
        const data421 = iotaData[421]?.[activePhase] || {};
        if (Object.keys(data421).length === 0) return null;

        const order = {'A종 수익증권':1, 'B종 수익증권':2, 'C종 수익증권':3, 'C-1종 수익증권':4, 'Tr.A':1, 'Tr.B':2, 'Tr.C':3, 'Tr.D':4, 'Equity':5};
        const sortedTranches = Object.keys(data421).sort((a,b) => (order[a]||99) - (order[b]||99));
        
        let grandTotal = 0;
        sortedTranches.forEach(tName => {
            data421[tName].forEach(lp => {
                grandTotal += (lp.rawAmount || 0);
            });
        });

        return (
            <tbody className="text-[13px] text-[#E5E5E5]">
                {sortedTranches.map(tName => {
                    const lps = data421[tName] || [];
                    if (lps.length === 0) return null;
                    
                    const sortedLps = [...lps].sort((a,b) => (b.rawAmount || 0) - (a.rawAmount || 0));
                    const trancheTotal = sortedLps.reduce((sum, lp) => sum + (lp.rawAmount || 0), 0);
                    
                    return (
                        <React.Fragment key={tName}>
                            {sortedLps.map((lp, idx) => {
                                const isIgis = lp.name.includes('이지스자산운용');
                                const isSamsung = lp.name.includes('삼성물산') || lp.name.includes('디에스클러스터') || lp.name.includes('NH투자증권');
                                
                                let nameClass = "py-2 px-4 border-r border-[#444]";
                                let amountClass = "py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]";
                                let pct1Class = "py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444]";
                                let pct2Class = "py-2 px-4 text-right font-[Inter] tracking-tight";
                                
                                if (isIgis) {
                                    nameClass += " bg-[#5da0e7]/20 text-[#5da0e7] font-bold";
                                    amountClass += " font-bold text-[#5da0e7] bg-[#5da0e7]/20";
                                    pct1Class += " bg-[#5da0e7]/20 text-[#5da0e7]";
                                    pct2Class += " font-bold text-[#5da0e7] bg-[#5da0e7]/20";
                                } else if (isSamsung) {
                                    nameClass += " bg-[#cd879c]/20 text-[#cd879c] font-bold";
                                    amountClass += " font-bold text-[#cd879c] bg-[#cd879c]/20";
                                    pct1Class += " bg-[#cd879c]/20 text-[#cd879c]";
                                    pct2Class += " font-bold text-[#cd879c] bg-[#cd879c]/20";
                                }
                                
                                const tranchePct = trancheTotal > 0 ? ((lp.rawAmount / trancheTotal) * 100).toFixed(2) + '%' : '0%';
                                const totalPct = grandTotal > 0 ? ((lp.rawAmount / grandTotal) * 100).toFixed(2) + '%' : '0%';
                                
                                return (
                                    <tr key={`${tName}-${idx}`} className="border-b border-[#444]">
                                        {idx === 0 && (
                                            <td rowSpan={sortedLps.length + 1} className="py-2 px-4 text-center font-bold text-white border-r border-[#444] bg-[#1a1a1c]">
                                                {tName}
                                            </td>
                                        )}
                                        <td className={nameClass}>{lp.name}</td>
                                        <td className={amountClass}>{Number(lp.rawAmount).toLocaleString()}</td>
                                        <td className={pct1Class}>{tranchePct}</td>
                                        <td className={pct2Class}>{totalPct}</td>
                                    </tr>
                                );
                            })}
                            <tr className="border-b border-[#444] bg-[#1c1c1e]/50">
                                <td className="py-2 px-4 font-bold text-center text-[#86868B] border-r border-[#444]">소계</td>
                                <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">{Number(trancheTotal).toLocaleString()}</td>
                                <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]">100.00%</td>
                                <td className="py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight">{grandTotal > 0 ? ((trancheTotal / grandTotal) * 100).toFixed(2) + '%' : '0%'}</td>
                            </tr>
                        </React.Fragment>
                    );
                })}
                <tr className="border-b border-[#444] bg-[#1a1a1c]">
                    <td colSpan={2} className="py-2 px-4 text-center font-bold text-white border-r border-[#444]">합계</td>
                    <td className="py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight border-r border-[#444]">{Number(grandTotal).toLocaleString()}</td>
                    <td className="py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight border-r border-[#444]">100.00%</td>
                    <td className="py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight">100.00%</td>
                </tr>
            </tbody>
        );
    };
"""

for file_path in files_to_scrub:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # 1. Insert renderDynamicTableBody before return (
    if "const renderDynamicTableBody" not in content:
        insert_idx = content.find("return (")
        if insert_idx != -1:
            # find the start of the return statement line to insert above it properly indented
            line_start = content.rfind("\n", 0, insert_idx) + 1
            content = content[:line_start] + dynamic_render_func + "\n" + content[line_start:]

    # 2. Replace the giant phase421 === 'new' ? (...) : (...) block with {renderDynamicTableBody()}
    # We need to find the start of the <thead ...> and replace the whole <tbody> logic
    # Actually, the thead is fine, we just replace the tbody block.
    # In SystemFund421.jsx, it looks like:
    # {phase421 === 'new' ? (
    # <tbody ...> ... </tbody>
    # ) : (
    # <tbody ...> ... </tbody>
    # )}
    
    start_str = "{phase421 === 'new' ? ("
    start_idx = content.find(start_str)
    
    if start_idx != -1:
        # Need to find the end of this block
        # We know it ends with )} right after the second </tbody>
        end_str = "</tbody>\n                            )}"
        end_idx = content.find(end_str, start_idx)
        if end_idx != -1:
            content = content[:start_idx] + "{renderDynamicTableBody()}" + content[end_idx + len(end_str):]
        else:
            # Maybe the indentation or newlines are different
            # Let's use regex to replace from {phase421 === 'new' ? ( ... ) : ( ... )}
            pattern = re.compile(r"\{phase421 === 'new' \? \([\s\S]*?<\/tbody>\n\s*\)\}", re.MULTILINE)
            content = pattern.sub("{renderDynamicTableBody()}", content)

    with open(file_path, 'w') as f:
        f.write(content)

