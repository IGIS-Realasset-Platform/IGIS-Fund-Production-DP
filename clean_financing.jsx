import React, { useState, useEffect } from 'react';
import WorkspaceActivityLog from './WorkspaceActivityLog';
import { supabase } from '../../utils/supabaseClient';
import { fetchWithRetry } from '../../utils/fetchWithRetry';

export default function WorkspaceFinancing() {
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

    return (
                <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto">
            {/* Header & Team Structure */}
            <div className="w-full flex justify-between items-center mb-[40px] gap-[40px]">
                {/* Header Metadata */}
                <div className="shrink-0 max-w-[350px]">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">파이낸싱</h1>
                    <p className="text-[15px] text-[#86868B] leading-[24px] break-keep">IOTA Seoul Capital Stack 및 대주단 파이프라인 관리</p>
                </div>
                
                {/* Team Structure */}
                <div className="border border-[#333] rounded-[24px] flex flex-col bg-transparent shrink-0">

                    
                    <div className="flex items-center pl-[20px] pr-[10px] py-[10px]">
                        <div className="w-[70px] shrink-0">
                            <span className="text-[13px] font-bold text-[#86868B]">파이낸싱</span>
                        </div>
                        <div className="flex items-center gap-[12px] w-[130px] shrink-0">
                            <div className="relative w-[30px] h-[30px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden ml-[2px]">
                                <img src={`${import.meta.env.BASE_URL}박준호.webp`} alt="박준호" className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                                <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-white font-bold text-[13px] leading-tight">박준호</span>
                                <span className="text-[#A1A1AA] text-[12px] mt-[1px] leading-tight">LFC 센터장</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-x-1.5 gap-y-2 -ml-[6px]">
                            {["강석민","정리훈","손유정","김지우","박현승","이성민A","한승환"].map(name => (
                                <div key={name} className="flex items-center gap-[6px] bg-[#222] border border-[#333] rounded-full pl-[4px] pr-[10px] py-[4px] min-w-[76px]">
                                    <div className="w-[21px] h-[21px] shrink-0 rounded-full bg-[#3c3c3c] overflow-hidden">
                                        <img src={`${import.meta.env.BASE_URL}${name}.webp`} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                                    </div>
                                    <span className="text-[#E5E5E5] text-[12px] font-medium leading-none">{name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <WorkspaceActivityLog workspaceCode="WS_LFC" workspaceLabel="파이낸싱-LFC" />

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
}