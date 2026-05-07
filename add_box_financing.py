import sys
import re

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Update imports
new_imports = """import React, { useState, useEffect } from 'react';
import WorkspaceActivityLog from './WorkspaceActivityLog';
import { supabase } from '../../utils/supabaseClient';
import { fetchWithRetry } from '../../utils/fetchWithRetry';"""
content = content.replace("import React from 'react';\nimport WorkspaceActivityLog from './WorkspaceActivityLog';", new_imports)

# 2. Add state and logic inside component
func_start = "export default function WorkspaceFinancing() {"
logic = """
    const [iotaData, setIotaData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const { data, error } = await fetchWithRetry(
                    () => supabase.from('iota_capital_stack').select('*').abortSignal(controller.signal),
                    3, 
                    500, 
                    controller.signal
                );
                if (controller.signal.aborted) return;

                if (error) {
                    console.error("Supabase API Error:", error);
                    setIotaData({ error: error.message });
                    return;
                }
                if (data) {
                    const grouped = {
                        427: { Bridge: {}, Refinancing: {} },
                        421: { Current: {} },
                        816: { Bridge: {}, Refinancing: {} }
                    };

                    data.forEach(item => {
                        const v = parseInt(item.vehicle_name);
                        const p = item.phase;
                        let tranche = item.tranche_name;
                        let type = item.tranche_type;
                        let sortOrder = 0;
                        let originalTranche = tranche;

                        if ((v === 427 || v === 816) && (tranche === '1종 종류주 등' || tranche === '보통주' || tranche === '주주대여금' || tranche.includes('종류주'))) {
                            tranche = 'Equity';
                            type = 'Equity';
                            if (originalTranche === '주주대여금') {
                                sortOrder = 1;
                            }
                        }
                        if ((v === 427 || v === 816) && tranche === 'Tr.A-2') {
                            tranche = 'Tr.A-1';
                            sortOrder = 1;
                        }

                        if (v === 427 && tranche === 'Tr.B-2') {
                            tranche = 'Tr.B-1';
                            sortOrder = 1;
                        }

                        if (grouped[v] && grouped[v][p]) {
                            if (!grouped[v][p][tranche]) {
                                grouped[v][p][tranche] = [];
                            }
                            grouped[v][p][tranche].push({
                                name: item.institution_name,
                                amount: item.amount_krw_100m.toLocaleString(),
                                rawAmount: item.amount_krw_100m,
                                type: type,
                                originalTranche: originalTranche,
                                sortOrder: sortOrder
                            });
                        }
                    });

                    [427, 421, 816].forEach(v => {
                        Object.keys(grouped[v]).forEach(p => {
                            Object.keys(grouped[v][p]).forEach(t => {
                                const arr = grouped[v][p][t];
                                arr.sort((a,b) => {
                                    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
                                    return b.rawAmount - a.rawAmount;
                                });

                                if ((v === 427 || v === 816) && t === 'Equity') {
                                    let hasSubheader = false;
                                    for (let i = 0; i < arr.length; i++) {
                                        if (arr[i].originalTranche === '주주대여금' && !hasSubheader) {
                                            arr.splice(i, 0, { isSubHeader: true, name: '주주대여금' });
                                            hasSubheader = true;
                                            i++; 
                                        }
                                    }
                                }
                                
                                if ((v === 427 || v === 816) && t === 'Tr.A-1') {
                                    let hasSubheader = false;
                                    for (let i = 0; i < arr.length; i++) {
                                        if (arr[i].originalTranche === 'Tr.A-2' && !hasSubheader) {
                                            arr.splice(i, 0, { isSubHeader: true, name: 'Tr.A-2' });
                                            hasSubheader = true;
                                            i++; 
                                        }
                                    }
                                }

                                if (v === 427 && t === 'Tr.B-1') {
                                    let hasSubheader = false;
                                    for (let i = 0; i < arr.length; i++) {
                                        if (arr[i].originalTranche === 'Tr.B-2' && !hasSubheader) {
                                            arr.splice(i, 0, { isSubHeader: true, name: 'Tr.B-2' });
                                            hasSubheader = true;
                                            i++; 
                                        }
                                    }
                                }

                                let idx = 1;
                                arr.forEach(item => {
                                    if (!item.isSubHeader) {
                                        item.displayIndex = idx++;
                                    }
                                });
                            });
                        });
                    });

                    setIotaData(grouped);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error("Unhandled Exception:", error);
                setIotaData({ error: error.message || "오류" });
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        fetchData();

        return () => {
            controller.abort();
        };
    }, []);

    const getTotal = (v, p = 'Current') => {
        let sum = 0;
        if (iotaData && iotaData[v] && iotaData[v][p]) {
            Object.values(iotaData[v][p]).forEach(trancheArray => {
                sum += trancheArray.reduce((a, b) => a + (parseFloat(b.rawAmount) || 0), 0);
            });
        }
        return sum;
    };

    const getTypeTotal = (v, p = 'Current', typeStr) => {
        let sum = 0;
        if (iotaData && iotaData[v] && iotaData[v][p]) {
            Object.values(iotaData[v][p]).forEach(trancheArray => {
                trancheArray.forEach(item => {
                    if (item.type === typeStr && !item.isSubHeader) sum += (parseFloat(item.rawAmount) || 0);
                });
            });
        }
        return sum;
    };

    const displayTotal427 = getTotal(427, 'Refinancing');
    const displayTotal816 = getTotal(816, 'Refinancing');
    const total421 = getTotal(421);
    
    const grandTotal = displayTotal427 + total421 + displayTotal816;

    const formatAmount = (rawAmt) => {
        const amt = Math.round(rawAmt);
        const jo = Math.floor(amt / 10000);
        const uk = amt % 10000;
        let formattedUk = uk.toLocaleString('ko-KR');
        if (jo > 0) {
            if (uk === 0) return `${jo}조원`;
            return `${jo}조 ${formattedUk}억원`;
        }
        return `${formattedUk}억원`;
    };
"""
content = content.replace(func_start, func_start + logic)

# 3. Add UI box to bottom
box_ui = """
            {!loading && iotaData && !iotaData.error && (
                <div className="w-full mt-[40px]">
                    <h2 className="text-[20px] font-bold text-white mb-[20px]">통합 Vehicle 파이낸싱 구조</h2>
                    <div className="p-6 bg-transparent border border-[#3c3c3c] rounded-[24px] flex gap-8 items-start">
                        <div className="w-[280px] shrink-0 flex flex-col">
                            <div className="text-[13px] font-bold text-[#86868B] uppercase mb-[10px]">Total Project Volume</div>
                            <div className="text-[32px] font-bold text-white leading-none tracking-tight pt-[6px]">{formatAmount(grandTotal)}</div>
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            <div className="flex gap-4 w-full">
                                {/* 427 PFV Box */}
                                <div className="flex-1 px-[20px] py-[16px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col justify-between cursor-default transition-all">
                                    <span className="text-[14px] font-bold text-white tracking-tight mb-[12px]">427 PFV</span>
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-[#86868B]">Equity</span>
                                            <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(427, 'Refinancing', 'Equity'))}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-[#86868B]">Loan</span>
                                            <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(427, 'Refinancing', 'Loan'))}</span>
                                        </div>
                                        <div className="border-t border-[#333] pt-[10px] mt-[6px] flex justify-between items-end">
                                            <span className="text-[13px] text-[#86868B] font-medium leading-none mb-[2px]">Total</span>
                                            <span className="text-[20px] font-bold text-white tracking-tight leading-none">{formatAmount(displayTotal427)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 816 PFV Box */}
                                <div className="flex-1 px-[20px] py-[16px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col justify-between cursor-default transition-all">
                                    <span className="text-[14px] font-bold text-white tracking-tight mb-[12px]">816 PFV</span>
                                    <div className="flex flex-col gap-[6px]">
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-[#86868B]">Equity</span>
                                            <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(816, 'Refinancing', 'Equity'))}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px]">
                                            <span className="text-[#86868B]">Loan</span>
                                            <span className="text-[#E5E5E5] font-semibold">{formatAmount(getTypeTotal(816, 'Refinancing', 'Loan'))}</span>
                                        </div>
                                        <div className="border-t border-[#333] pt-[10px] mt-[6px] flex justify-between items-end">
                                            <span className="text-[13px] text-[#86868B] font-medium leading-none mb-[2px]">Total</span>
                                            <span className="text-[20px] font-bold text-white tracking-tight leading-none">{formatAmount(displayTotal816)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 421 Fund Box */}
                                <div className="flex-1 px-[20px] py-[16px] bg-[#151515] border border-transparent rounded-[16px] flex flex-col justify-between cursor-default transition-all">
                                    <span className="text-[14px] font-bold text-white tracking-tight mb-[12px]">421호 펀드</span>
                                    <div className="flex flex-col justify-end h-full">
                                        <div className="border-t border-[#333] pt-[10px] mt-auto flex justify-between items-end">
                                            <span className="text-[13px] text-[#86868B] font-medium leading-none mb-[2px]">Total</span>
                                            <span className="text-[20px] font-bold text-white tracking-tight leading-none">{formatAmount(total421)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}"""

content = content.replace("        </div>\n    );\n}", box_ui)

with open(path, 'w') as f:
    f.write(content)
print("Copied the box into WorkspaceFinancing.")
