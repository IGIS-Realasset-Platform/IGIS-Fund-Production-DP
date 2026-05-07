import sys

path = 'src/components/system/workspace/WorkspaceDevelopment.jsx'
with open(path, 'r') as f:
    content = f.read()

old_cost = """                        <div className="flex flex-col">
                            {COSTS[activeProject] && (
                                <div className="grid grid-cols-[1fr_120px_100px_1.5fr] px-[24px] py-[20px] border-b border-[#3c3c3c] items-center hover:bg-[#222] transition-colors">
                                    <div className="flex items-center gap-[12px]">
                                        <div className="w-[20px] h-[20px] rounded-[6px] border border-[#555] flex items-center justify-center cursor-pointer hover:bg-[#333]">
                                            <span className="text-[#A1A1AA] text-[16px] leading-none -mt-[2px]">-</span>
                                        </div>
                                        <span className="text-[15px] font-bold text-white">{COSTS[activeProject][0].label}</span>
                                    </div>
                                    <span className="text-[15px] font-medium text-white text-right">{COSTS[activeProject][0].amount?.toLocaleString()}</span>
                                    <span className="text-[15px] text-[#E5E5E5] text-right">100.0%</span>
                                    <span className="text-[14px] text-[#A1A1AA] pl-[40px]">{COSTS[activeProject][0].memo}</span>
                                </div>
                            )}
                            
                            {COSTS[activeProject]?.[0]?.children.map((child, idx) => (
                                <div key={idx} className="grid grid-cols-[1fr_120px_100px_1.5fr] px-[24px] py-[20px] border-b border-[#3c3c3c] last:border-b-0 items-center hover:bg-[#222] transition-colors">
                                    <span className="text-[15px] font-bold text-white pl-[48px]">{child.label}</span>
                                    <span className="text-[15px] font-medium text-white text-right">{child.amount ? child.amount.toLocaleString() : '-'}</span>
                                    <span className="text-[15px] text-[#E5E5E5] text-right">
                                        {child.amount ? ((child.amount / COSTS[activeProject][0].amount) * 100).toFixed(1) + '%' : '-'}
                                    </span>
                                    <span className="text-[14px] text-[#A1A1AA] pl-[40px]">{child.memo}</span>
                                </div>
                            ))}
                        </div>"""

new_cost = """                        <div className="flex flex-col">
                            {COSTS[activeProject] && (
                                <div className="grid grid-cols-[1fr_120px_100px_1.5fr] px-[24px] py-[20px] border-b border-[#3c3c3c] items-center hover:bg-[#222] transition-colors">
                                    <div className="flex items-center gap-[12px]">
                                        <div className="w-[20px] h-[20px] rounded-[6px] border border-[#555] flex items-center justify-center cursor-pointer hover:bg-[#333]">
                                            <span className="text-[#A1A1AA] text-[16px] leading-none -mt-[2px]">-</span>
                                        </div>
                                        <span className="text-[15px] font-bold text-white">{COSTS[activeProject][0].label}</span>
                                    </div>
                                    <span className="text-[15px] font-medium text-white text-right">{COSTS[activeProject][0].amount != null ? COSTS[activeProject][0].amount.toLocaleString('en-US', {minimumFractionDigits:1, maximumFractionDigits:1}) : '-'}</span>
                                    <span className="text-[15px] text-[#E5E5E5] text-right">100.0%</span>
                                    <span className="text-[14px] text-[#A1A1AA] pl-[40px]">{COSTS[activeProject][0].memo}</span>
                                </div>
                            )}
                            
                            {COSTS[activeProject]?.[0]?.children.map((child, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="grid grid-cols-[1fr_120px_100px_1.5fr] px-[24px] py-[20px] border-b border-[#3c3c3c] last:border-b-0 items-center hover:bg-[#222] transition-colors">
                                        <div className="flex items-center gap-[12px] pl-[32px]">
                                            {child.children ? (
                                                <div className="w-[20px] h-[20px] rounded-[6px] border border-[#555] flex items-center justify-center cursor-pointer hover:bg-[#333]">
                                                    <span className="text-[#A1A1AA] text-[16px] leading-none -mt-[2px]">-</span>
                                                </div>
                                            ) : (
                                                <div className="w-[20px] h-[20px]"></div>
                                            )}
                                            <span className="text-[15px] font-bold text-white">{child.label}</span>
                                        </div>
                                        <span className="text-[15px] font-medium text-white text-right">{child.amount != null ? child.amount.toLocaleString('en-US', {minimumFractionDigits:1, maximumFractionDigits:1}) : '-'}</span>
                                        <span className="text-[15px] text-[#E5E5E5] text-right">
                                            {child.amount != null ? ((child.amount / COSTS[activeProject][0].amount) * 100).toFixed(1) + '%' : '-'}
                                        </span>
                                        <span className="text-[14px] text-[#A1A1AA] pl-[40px]">{child.memo}</span>
                                    </div>
                                    
                                    {child.children && child.children.map((grandchild, gIdx) => (
                                        <div key={`g-${idx}-${gIdx}`} className="grid grid-cols-[1fr_120px_100px_1.5fr] px-[24px] py-[20px] border-b border-[#3c3c3c] last:border-b-0 items-center hover:bg-[#222] transition-colors">
                                            <span className="text-[15px] font-bold text-white pl-[84px]">{grandchild.label}</span>
                                            <span className="text-[15px] font-medium text-white text-right">{grandchild.amount != null ? grandchild.amount.toLocaleString('en-US', {minimumFractionDigits:1, maximumFractionDigits:1}) : '-'}</span>
                                            <span className="text-[15px] text-[#E5E5E5] text-right">
                                                {grandchild.amount != null ? ((grandchild.amount / COSTS[activeProject][0].amount) * 100).toFixed(1) + '%' : '-'}
                                            </span>
                                            <span className="text-[14px] text-[#A1A1AA] pl-[40px]">{grandchild.memo}</span>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>"""

if old_cost in content:
    with open(path, 'w') as f:
        f.write(content.replace(old_cost, new_cost))
    print("Replaced successfully")
else:
    print("Old cost section not found. Please check exact whitespace.")
