import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IotaTwo816DetailCard = ({ id, vehicleId, title, dbData, historyData, navigateTo }) => {
    const [hoveredBarTranche, setHoveredBarTranche] = useState(null);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [activePhase, setActivePhase] = useState('phase5');

    const bridge816Data = {
        'Equity': [
            { isSubHeader: true, name: '1종 종류주' },
            { name: '에셀유한회사', rawAmount: 16.5, type: 'Equity', originalTranche: '1종 종류주', displayIndex: 1 },
            { name: 'NH투자증권', rawAmount: 7.95, type: 'Equity', originalTranche: '1종 종류주', displayIndex: 2 },
            { name: '삼성물산', rawAmount: 6, type: 'Equity', originalTranche: '1종 종류주', displayIndex: 3 },
            { name: '이지스자산운용(고유)', rawAmount: 1, type: 'Equity', originalTranche: '1종 종류주', displayIndex: 4 },
            { isSubHeader: true, name: '보통주' },
            { name: '이지스421호', rawAmount: 19.55, type: 'Equity', originalTranche: '보통주', displayIndex: 5 },
            { name: '신한투자증권', rawAmount: 12.95, type: 'Equity', originalTranche: '보통주', displayIndex: 6 },
            { isSubHeader: true, name: '주주대여금' },
            { name: '주주대여금', rawAmount: 2400, type: 'Equity', originalTranche: '주주대여금', displayIndex: 7 }
        ],
        'Tr.A': [
            { name: 'KB국민은행', rawAmount: 1500, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 1 },
            { name: '과학기술인공제회', rawAmount: 500, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 2 },
            { name: '대구은행', rawAmount: 500, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 3 },
            { name: '미래에셋캐피탈', rawAmount: 480, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 4 },
            { name: 'KB캐피탈', rawAmount: 450, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 5 },
            { name: '뉴스타케미제일차(전기공사공제회)', rawAmount: 300, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 6 },
            { name: 'IBK캐피탈', rawAmount: 150, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 7 },
            { name: '오케이저축은행', rawAmount: 100, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 8 },
            { name: 'DB저축은행', rawAmount: 100, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 9 },
            { name: 'DGB캐피탈', rawAmount: 100, type: 'Loan', originalTranche: 'Tr.A', displayIndex: 10 }
        ],
        'Tr.B': [
            { name: '한투리얼(한국투자Debt)', rawAmount: 600, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 1 },
            { name: '한투리얼(한국투자메자닌)', rawAmount: 350, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 2 },
            { name: 'BC카드', rawAmount: 150, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 3 },
            { name: '스틱얼터너티브자산운용 펀드', rawAmount: 100, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 4 },
            { name: '대신저축은행', rawAmount: 80, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 5 },
            { name: '816공간제일차(신한증권)', rawAmount: 50, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 6 },
            { name: '실버아이언제일차(한화저축)', rawAmount: 50, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 7 },
            { name: '흥국저축은행', rawAmount: 20, type: 'Loan', originalTranche: 'Tr.B', displayIndex: 8 }
        ],
        'Tr.C': [
            { name: '대신증권(디에스센트럴프라임)', rawAmount: 480, type: 'Loan', originalTranche: 'Tr.C', displayIndex: 1 },
            { name: '코람코국내개발일반1-2', rawAmount: 200, type: 'Loan', originalTranche: 'Tr.C', displayIndex: 2 },
            { name: '816공간제일차(신한증권)', rawAmount: 150, type: 'Loan', originalTranche: 'Tr.C', displayIndex: 3 },
            { name: '키움가치추구형일반사모1호', rawAmount: 90, type: 'Loan', originalTranche: 'Tr.C', displayIndex: 4 },
            { name: '816공간제일차(신한증권)', rawAmount: 50, type: 'Loan', originalTranche: 'Tr.C', displayIndex: 5 }
        ]
    };

    const getActiveData = () => {
        // If DB has data for 816, dbData might be populated.
        // For phase 4 (기존 브릿지), use hardcoded data to fix the wrong 427 data.
        if (activePhase === 'phase4') return bridge816Data;
        
        // For phase 5 (금번 리파이낸싱), use DB if available, else also fallback to same or empty.
        // The user said "마지막거는 우리가 해놓은거니 맞는것 같은데" so dbData might be fine for phase 5, or empty is okay for now.
        if (activePhase === 'phase5') {
            const hasDbData = dbData && Object.keys(dbData).length > 0;
            return hasDbData ? dbData : {};
        }

        return {};
    };

    const data = getActiveData();

    let totalEquity = 0;
    let totalLoan = 0;
    
    Object.values(data).forEach(trancheArray => {
        trancheArray.forEach(item => {
            if (item.isSubHeader) return;
            if (item.type === 'Equity') totalEquity += (item.rawAmount || 0);
            else totalLoan += (item.rawAmount || 0);
        });
    });
    
    const totalSum = totalEquity + totalLoan;
    const tranches = Object.keys(data);
    const sortedTranches = tranches.sort((a, b) => {
        if (a.includes('Tr.') && b.includes('Tr.')) return a.localeCompare(b);
        if (a.includes('Tr.')) return 1;
        if (b.includes('Tr.')) return -1;
        return a.localeCompare(b);
    });

    const amtFmt = (rawAmt) => {
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

    const getTrancheColor = (trancheName) => {
        if (trancheName.includes('Equity') || trancheName.includes('보통주') || (trancheName.includes('종류주') && !trancheName.includes('수익증권')) || trancheName.includes('주주대여금')) return 'text-white';
        if (trancheName.includes('Tr.A') || trancheName.includes('Tr. A') || trancheName.includes('A종')) return 'text-[#5da0e7]';
        if (trancheName.includes('Tr.B') || trancheName.includes('Tr. B') || trancheName.includes('B종')) return 'text-[#3aaab3]';
        if (trancheName.includes('Tr.C') || trancheName.includes('Tr. C') || trancheName.includes('C종')) return 'text-[#b889d9]';
        if (trancheName.includes('Tr.D') || trancheName.includes('Tr. D') || trancheName.includes('D종')) return 'text-[#cd879c]';
        return 'text-white';
    };

    const getTrancheHoverColor = (trancheName) => {
        if (trancheName.includes('Equity') || trancheName.includes('보통주') || (trancheName.includes('종류주') && !trancheName.includes('수익증권')) || trancheName.includes('주주대여금')) return 'group-hover:text-[#eab308]';
        if (trancheName.includes('Tr.A') || trancheName.includes('Tr. A') || trancheName.includes('A종')) return 'group-hover:text-[#5da0e7]';
        if (trancheName.includes('Tr.B') || trancheName.includes('Tr. B') || trancheName.includes('B종')) return 'group-hover:text-[#3aaab3]';
        if (trancheName.includes('Tr.C') || trancheName.includes('Tr. C') || trancheName.includes('C종')) return 'group-hover:text-[#b889d9]';
        if (trancheName.includes('Tr.D') || trancheName.includes('Tr. D') || trancheName.includes('D종')) return 'group-hover:text-[#cd879c]';
        return 'group-hover:text-white';
    };

    const getTrancheBgColor = (trancheName) => {
        if (trancheName.includes('Equity') || trancheName.includes('보통주') || (trancheName.includes('종류주') && !trancheName.includes('수익증권'))) return 'bg-black';
        if (trancheName.includes('주주대여금') || trancheName.includes('주주대여')) return 'bg-[#254266]';
        if (trancheName.includes('Tr.A-2')) return 'bg-[#315780]';
        if (trancheName.includes('Tr.A-1')) return 'bg-[#4572a1]';
        if (trancheName.includes('Tr.A') || trancheName.includes('Tr. A') || trancheName.includes('A종')) return 'bg-[#4572a1]';
        if (trancheName.includes('Tr.B-2')) return 'bg-[#18464a]';
        if (trancheName.includes('Tr.B-1')) return 'bg-[#2c777d]';
        if (trancheName.includes('Tr.B') || trancheName.includes('Tr. B') || trancheName.includes('B종')) return 'bg-[#2c777d]';
        if (trancheName.includes('Tr.C') || trancheName.includes('Tr. C') || trancheName.includes('C종')) return 'bg-[#85609e]';
        if (trancheName.includes('Tr.D') || trancheName.includes('Tr. D') || trancheName.includes('D종')) return 'bg-[#966171]';
        return 'bg-[#444]';
    };

    const phaseMetrics = {
        phase1: { title: '최초UW', subtitle: '2023.01', cost: '1조 5,391억', costPyeong: '4,212 만원/평', revenue: '1조 7,736억', revenuePyeong: '4,854 만원/평', returnEM: '이익률 13.2%', returnProfit: '2,345억원', enoc: '37.5만원', enocSub: '2027년 기준', period: '69M', gfa: '36,537평', completionYear: '2028', officeArea: '-평', retailArea: '-평' },
        phase2: { title: '정비계획 변경', subtitle: '2023.11', cost: '1조 7,888억', costPyeong: '4,896 만원/평', revenue: '1조 9,041억', revenuePyeong: '5,211 만원/평', returnEM: '이익률 6.1%', returnProfit: '1,153억원', enoc: 'TBD', enocSub: '-', period: '69M', gfa: '36,537평', completionYear: '2028', officeArea: '-평', retailArea: '-평' },
        phase3: { title: '자산매입', subtitle: '2024.03', cost: '2조 1,556억', costPyeong: '5,900 만원/평', revenue: '2조 3,060억', revenuePyeong: '6,311 만원/평', returnEM: '이익률 11.3%', returnProfit: '2,614억원', enoc: 'TBD', enocSub: '-', period: '95M', gfa: '36,537평', completionYear: '2030', officeArea: '-평', retailArea: '-평' },
        phase4: { title: '브릿지론 재연장', subtitle: '2025.10', cost: '2조 2,000억', costPyeong: '6,021 만원/평', revenue: '2조 5,102억', revenuePyeong: '6,870 만원/평', returnEM: '수지 재평가', returnProfit: '정량 이익 미산정', enoc: 'TBD', enocSub: '-', period: '101M', gfa: '36,537평', completionYear: '2031', officeArea: '-평', retailArea: '-평' },
        phase5: { title: '리파이낸싱', subtitle: '2026.04', cost: '2조 1,964억', costPyeong: '6,011 만원/평', revenue: '2조 5,823억', revenuePyeong: '7,068 만원/평', returnEM: '이익률 4.8%', returnProfit: '1,240억원', enoc: 'TBD', enocSub: '-', period: '104M', gfa: '36,537평', completionYear: '2031', officeArea: '15,529평', retailArea: '1,022평' }
    };

    let baseMetrics = { ...phaseMetrics['phase1'] };
    let curMetrics = { ...phaseMetrics[activePhase] };

    return (
        <div id={id} className="mb-[28px] -mt-[4px]">
            {title && (
                <div className="flex justify-between items-end mb-[12px] px-[8px]">
                    <div className="flex items-end gap-[16px]">
                        <h2 className="text-[24px] font-bold text-white tracking-tight">{title}</h2>
                    </div>
                </div>
            )}

            <div className="relative w-full">
                {/* Right Wing Toggle - Absolutely positioned 6px to the right of main component */}
                <div className="absolute top-[7px] -right-[116px] bottom-0 w-[110px] pointer-events-none z-50">
                    <div className="sticky top-[20px] pointer-events-auto bg-[#292928] border border-[#333] p-[6px] rounded-[32px] flex flex-col gap-0 shadow-lg">
                        {[
                            { id: 'phase1', label: '최초UW', date: '2023.01' },
                            { id: 'phase2', label: '정비계획\n변경', date: '2023.11' },
                            { id: 'phase3', label: '자산매입', date: '2024.03' },
                            { id: 'phase4', label: '브릿지론\n재연장', date: '2025.10' },
                            { id: 'phase5', label: '리파이낸싱', date: '2026.04' }
                        ].map((p) => (
                            <button 
                                key={p.id}
                                onClick={() => setActivePhase(p.id)}
                                className={`w-full flex flex-col items-center justify-center py-[16px] px-1 rounded-[26px] transition-all duration-300 ${activePhase === p.id ? 'bg-[#3C3C3E] text-[#0A84FF] shadow-sm border border-[#555]' : 'border border-transparent text-[#86868B] hover:text-white hover:bg-[#333]'}`}
                            >
                                <span className={`text-[11px] mb-[6px] font-['Inter'] leading-none ${activePhase === p.id ? 'text-[#0A84FF]/80 font-medium' : 'opacity-60'}`}>{p.date}</span>
                                <span className={`text-[13px] font-bold text-center leading-[1.2] whitespace-pre-wrap tracking-tight ${activePhase === p.id ? 'text-white' : ''}`}>{p.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Left Area */}
                <div className="w-full p-[6px] border border-[#333] rounded-[38px] flex flex-col gap-[6px]">
                    {/* Dashboard Metrics Cards */}
                    <div 
                    className="w-full flex gap-[6px] cursor-pointer hover:opacity-90 transition-opacity relative group"
                    onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                >
                    <div className="absolute inset-0 bg-[#292928]/50 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none flex items-center justify-center">
                        <span className="text-white font-bold tracking-tight text-[16px] bg-[#1a1a1c]/80 px-6 py-3 rounded-full border border-[#444] shadow-lg backdrop-blur-sm">
                            {isAccordionOpen ? '개발 단계별 핵심 지표 닫기 ▲' : '개발 단계별 핵심 지표 보기 ▼'}
                        </span>
                    </div>

                    <div className="w-[390px] h-[274px] flex flex-col gap-[6px]">
                        <div className="w-full flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] pr-6 flex flex-row items-center transition-colors duration-300">
                            <div className="w-[114px] flex flex-col justify-between border-r border-[#444]/50 h-[54px] pl-[24px]">
                                <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] whitespace-nowrap">공급 예정</span>
                                <span className="text-[28px] font-bold text-white tracking-tight leading-none mt-[-2px] whitespace-nowrap">{curMetrics.completionYear}</span>
                            </div>
                            <div className="w-[100px] flex flex-col justify-between border-r border-[#444]/50 h-[54px] pl-[18px]">
                                <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] whitespace-nowrap">Brand</span>
                                <img src={`/iota-logo.png`} alt="IOTA" className="h-[22px] object-contain object-left mt-0 opacity-100 mb-[4px]" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between h-[54px] pl-[20px] overflow-hidden">
                                <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] whitespace-nowrap">연면적</span>
                                <span className="text-[28px] font-bold text-white tracking-tight leading-none mt-[-2px] whitespace-nowrap">{curMetrics.gfa}</span>
                            </div>
                        </div>

                        <div className="w-full flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] px-6 pb-[8px] flex flex-row items-center transition-colors duration-300">
                            <div className="flex-[1.4] flex flex-col justify-center border-r border-[#444]/50 h-[74px] pr-5">
                                <span className="text-[14px] font-bold text-[#86868B] mb-[10px] font-['Inter']">개발기간</span>
                                <div className="flex items-center justify-start gap-[10px] mb-[4px]">
                                    <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{baseMetrics.period}</span>
                                    <span className="text-[20px] text-[#666] leading-none mb-1 font-bold">→</span>
                                    <span className="text-[28px] font-bold text-white tracking-tighter leading-none">{curMetrics.period}</span>
                                </div>
                                <div className="flex justify-start gap-[24px] w-full">
                                    <span className="text-[11px] text-[#666] font-['Inter'] leading-none">{baseMetrics.title} {baseMetrics.subtitle}</span>
                                    <span className="text-[11px] text-[#A1A1AA] font-['Inter'] leading-none">{curMetrics.title} {curMetrics.subtitle}</span>
                                </div>
                            </div>
                            <div className="flex-[1] flex flex-col justify-center pl-6 h-[74px]">
                                <span className="text-[14px] font-bold text-[#86868B] mb-[10px] font-['Inter']">전용면적</span>
                                <div className="flex flex-col gap-[6px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] text-[#86868B] leading-none">업무</span>
                                        <span className="text-[16px] font-bold text-white leading-none">{curMetrics.officeArea}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[14px] text-[#86868B] leading-none">리테일</span>
                                        <span className="text-[16px] font-bold text-white leading-none">{curMetrics.retailArea}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 h-[274px] bg-[#292928] border border-[#3c3c3c] rounded-[32px] overflow-hidden relative flex flex-col transition-colors duration-300">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#3C3C3C] z-0" />
                        <div className="absolute top-[0px] bottom-[0px] left-1/2 w-px bg-[#3C3C3C] z-0" />
                        
                        <div className="grid grid-cols-2 grid-rows-2 w-full h-full relative z-10">
                            <div className="relative flex flex-col justify-end px-[32px] pb-[32px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">원가</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{baseMetrics.title}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px]">{baseMetrics.costPyeong}</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{baseMetrics.cost}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{curMetrics.title}</span>
                                        <span className="text-[13px] text-white mb-[6px] whitespace-nowrap">{curMetrics.costPyeong}</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none whitespace-nowrap">{curMetrics.cost}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative flex flex-col justify-end px-[32px] pb-[32px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">매각 목표</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{baseMetrics.title}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px]">{baseMetrics.revenuePyeong}</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{baseMetrics.revenue}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{curMetrics.title}</span>
                                        <span className="text-[13px] text-white mb-[6px] whitespace-nowrap">{curMetrics.revenuePyeong}</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none whitespace-nowrap">{curMetrics.revenue}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex flex-col justify-end px-[32px] pb-[34px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">사업이익 목표</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{baseMetrics.title}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px] font-['Inter']">{baseMetrics.returnEM}</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none font-['Inter']">{baseMetrics.returnProfit}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{curMetrics.title}</span>
                                        <span className="text-[13px] text-white mb-[6px] font-['Inter'] whitespace-nowrap">{curMetrics.returnEM}</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none font-['Inter'] whitespace-nowrap">{curMetrics.returnProfit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex flex-col justify-end px-[32px] pb-[34px]">
                                <span className="absolute top-[20px] left-[20px] text-[15px] font-bold text-[#86868B] font-['Inter'] tracking-tight">E.NOC 목표</span>
                                <div className="flex items-end justify-end gap-3 w-full">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[11px] text-[#666] mb-0 leading-none font-['Inter']">{baseMetrics.title}</span>
                                        <span className="text-[13px] text-[#86868B] mb-[6px]">{baseMetrics.enocSub}</span>
                                        <span className="text-[28px] font-bold text-[#A1A1AA] tracking-tighter leading-none">{baseMetrics.enoc}</span>
                                    </div>
                                    <span className="text-[20px] text-[#666] mb-[1px] font-bold mr-[-2px]">→</span>
                                    <div className="flex flex-col items-end w-[138px] whitespace-nowrap">
                                        <span className="text-[11px] text-white mb-0 leading-none font-medium font-['Inter'] whitespace-nowrap">{curMetrics.title}</span>
                                        <span className="text-[13px] text-white mb-[6px] whitespace-nowrap">{curMetrics.enocSub}</span>
                                        <span className="text-[28px] font-bold text-[#bbb9af] tracking-tighter leading-none whitespace-nowrap">{curMetrics.enoc}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCORDION */}
                <AnimatePresence>
                    {isAccordionOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-[#1c1c1e] rounded-[32px] border border-[#3c3c3c] mt-[6px]"
                        >
                            <div className="p-[32px]">
                                <div className="flex justify-between items-end mb-[12px]">
                                    <h3 className="text-[20px] font-bold text-white tracking-tight flex items-center">
                                        <span className="w-1.5 h-4 bg-[#A1A1AA] mr-2 rounded-full"></span>
                                        개발 단계별 핵심 지표 비교 요약표
                                    </h3>
                                    <span className="text-[#86868B] text-[12px] mb-[2px] font-medium tracking-tight">**대상 문서에 기반한 초안이며 정확한 숫자는 담당부서 재검증 후 업데이트 예정</span>
                                </div>
                                <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                                <div className="min-w-max border border-[#3C3C3C] rounded-lg overflow-hidden bg-[#242426]">
                                    <div className="flex border-b border-[#3C3C3C] bg-[#2C2C2E]">
                                        <div className="w-[150px] p-3 border-r border-[#3C3C3C] font-bold text-[#86868B] text-[13px] shrink-0 flex items-center">지표 구분</div>
                                        <div className={`w-[220px] p-3 border-r border-[#3C3C3C] font-bold text-[13px] shrink-0 ${activePhase === 'phase1' ? 'text-[#0A84FF]' : 'text-[#E5E5E5]'}`}>Phase 1: 최초UW<br/><span className="text-[#86868B] font-normal">(2023.01 기준)</span></div>
                                        <div className={`w-[220px] p-3 border-r border-[#3C3C3C] font-bold text-[13px] shrink-0 ${activePhase === 'phase2' ? 'text-[#0A84FF]' : 'text-[#E5E5E5]'}`}>Phase 2: 정비계획 변경<br/><span className="text-[#86868B] font-normal">(2023.11 기준)</span></div>
                                        <div className={`w-[220px] p-3 border-r border-[#3C3C3C] font-bold text-[13px] shrink-0 ${activePhase === 'phase3' ? 'text-[#0A84FF]' : 'text-[#E5E5E5]'}`}>Phase 3: 자산매입<br/><span className="text-[#86868B] font-normal">(2024.03 기준)</span></div>
                                        <div className={`w-[220px] p-3 border-r border-[#3C3C3C] font-bold text-[13px] shrink-0 ${activePhase === 'phase4' ? 'text-[#0A84FF]' : 'text-[#E5E5E5]'}`}>Phase 4: 브릿지론 재연장<br/><span className="text-[#86868B] font-normal">(2025.10 기준)</span></div>
                                        <div className={`w-[220px] p-3 font-bold text-[13px] shrink-0 ${activePhase === 'phase5' ? 'text-[#0A84FF]' : 'text-[#E5E5E5]'}`}>Phase 5: 리파이낸싱<br/><span className="text-[#86868B] font-normal">(2026.04 기준)</span></div>
                                    </div>
                                    {historyData && historyData.length > 0 ? historyData.map((row, index) => (
                                        <div key={index} className={`flex border-b border-[#3C3C3C] hover:bg-[#2A2A2C] transition-colors ${index === historyData.length - 1 ? 'border-b-0' : ''}`}>
                                            <div className="w-[150px] p-3 border-r border-[#3C3C3C] font-bold text-[#86868B] text-[13px] shrink-0 flex items-center bg-[#28282A]">{row.category}</div>
                                            <div className={`w-[220px] p-3 border-r border-[#3C3C3C] text-[13px] leading-snug shrink-0 whitespace-pre-wrap ${activePhase === 'phase1' ? 'bg-[#2A2A2A] text-white font-bold' : 'text-[#D1D1D6]'}`}>{row.phase1}</div>
                                            <div className={`w-[220px] p-3 border-r border-[#3C3C3C] text-[13px] leading-snug shrink-0 whitespace-pre-wrap ${activePhase === 'phase2' ? 'bg-[#2A2A2A] text-white font-bold' : 'text-[#D1D1D6]'}`}>{row.phase2}</div>
                                            <div className={`w-[220px] p-3 border-r border-[#3C3C3C] text-[13px] leading-snug shrink-0 whitespace-pre-wrap ${activePhase === 'phase3' ? 'bg-[#2A2A2A] text-white font-bold' : 'text-[#D1D1D6]'}`}>{row.phase3}</div>
                                            <div className={`w-[220px] p-3 border-r border-[#3C3C3C] text-[13px] leading-snug shrink-0 whitespace-pre-wrap ${activePhase === 'phase4' ? 'bg-[#2A2A2A] text-white font-bold' : 'text-[#D1D1D6]'}`}>{row.phase4}</div>
                                            <div className={`w-[220px] p-3 text-[13px] leading-snug shrink-0 whitespace-pre-wrap ${activePhase === 'phase5' ? 'bg-[#2A2A2A] text-white font-bold' : 'text-[#D1D1D6]'}`}>{row.phase5}</div>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center text-[#86868B] text-[14px]">
                                            데이터가 없습니다.
                                        </div>
                                    )}
                                </div>
                            </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Visual Tranche Bar */}
                <div className="w-full mt-[8px] mb-[8px]">
                    {(() => {
                        const allItems = Object.values(data).flat();
                        const barGroups = {};
                        allItems.forEach(item => {
                            if (item.isSubHeader) return;
                            let bT = item.originalTranche || item.type;
                            if (vehicleId !== '421') {
                                if (bT === '보통주' || bT === '1종 종류주' || (bT.includes('종류주') && !bT.includes('수익증권')) || bT === 'Equity') bT = 'Equity';
                                if (bT === '주주대여금' || bT === '주주대여') bT = '주주대여';
                            }
                            if (!barGroups[bT]) barGroups[bT] = 0;
                            barGroups[bT] += (item.rawAmount || 0);
                        });
                        
                        const order = {'Equity':1, '주주대여':2, 'Tr.A':3, 'Tr.A-1':3.1, 'Tr.A-2':3.2, 'Tr.B':4, 'Tr.B-1':4.1, 'Tr.B-2':4.2, 'Tr.C':5, 'Tr.D':6, 'A종 수익증권':3, 'B종 수익증권':4, 'C종 수익증권':5};
                        const sortedBarKeys = Object.keys(barGroups).sort((a,b) => (order[a] || 99) - (order[b] || 99));

                        return (
                            <div className={`w-full relative rounded-[32px] bg-[#292928] select-none ${Object.keys(barGroups).length > 0 ? 'h-[60px]' : 'h-[90px]'}`}>
                                {Object.keys(barGroups).length > 0 ? (
                                <>
                                <div className="absolute inset-0 flex w-full h-full rounded-[32px] overflow-hidden">
                                    {sortedBarKeys.map(tName => {
                                        const tSum = barGroups[tName];
                                        if (tSum === 0) return null;
                                        const exactPct = totalSum > 0 ? ((tSum / totalSum) * 100).toFixed(6) : 0;
                                        return (
                                            <div 
                                                key={`bg-${tName}`} 
                                                className={`h-full transition-opacity duration-300 ${getTrancheBgColor(tName)} ${hoveredBarTranche && hoveredBarTranche !== tName ? 'opacity-40' : ''}`} 
                                                style={{ width: `${exactPct}%` }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="absolute inset-0 flex w-full h-full">
                                    {sortedBarKeys.map(tName => {
                                        const tSum = barGroups[tName];
                                        if (tSum === 0) return null;
                                        const pct = totalSum > 0 ? ((tSum / totalSum) * 100).toFixed(1) : 0;
                                        const exactPct = totalSum > 0 ? ((tSum / totalSum) * 100).toFixed(6) : 0;
                                        return (
                                            <div 
                                                key={`text-${tName}`} 
                                                className="h-full flex flex-col items-center justify-center relative cursor-pointer" 
                                                style={{ width: `${exactPct}%` }}
                                                onMouseEnter={() => setHoveredBarTranche(tName)}
                                                onMouseLeave={() => setHoveredBarTranche(null)}
                                            >
                                                <span className="text-white font-bold text-[13px] leading-none mb-[4px] whitespace-nowrap z-10 drop-shadow-md">{tName}</span>
                                                <span className="text-white font-bold text-[14px] leading-none whitespace-nowrap z-10 drop-shadow-md">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-[#86868B] text-[14px] font-bold tracking-tight">해당 단계의 투자 데이터가 없습니다.</span>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Investment Structure Box */}
                {Object.keys(data).length > 0 && (
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[32px] pt-[20px] flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center w-full pb-[16px] border-b border-[#444]/50 pl-[26px] pr-[32px]">
                        <div className="flex items-center gap-[16px] overflow-x-auto hide-scrollbar">
                            <div className="flex items-center gap-[6px] shrink-0">
                                <span className={`${getTrancheColor('Equity')} font-bold text-[16px]`}>Equity</span>
                                <span className="text-[#eab308] font-bold text-[16px]">{amtFmt(totalEquity)}</span>
                            </div>
                            <div className="flex items-center gap-[6px] shrink-0">
                                <span className="text-white font-bold text-[16px]">Loan</span>
                                <span className="text-[#eab308] font-bold text-[16px]">{amtFmt(totalLoan)}</span>
                            </div>
                            
                            <div className="w-[1px] h-[12px] bg-[#444]/50 mx-[4px] shrink-0"></div>
                            
                            <div className="flex items-baseline gap-[8px] shrink-0">
                                {(() => {
                                    const loanGroups = {};
                                    Object.values(data).flat().forEach(item => {
                                        if (item.isSubHeader) return;
                                        if (item.type === 'Equity') return;
                                        let orig = item.originalTranche || item.type;
                                        if (orig === 'Tr.A-1' || orig === 'Tr.A-2') orig = 'Tr.A';
                                        if (orig === 'Tr.B-1' || orig === 'Tr.B-2') orig = 'Tr.B';
                                        if (!loanGroups[orig]) loanGroups[orig] = 0;
                                        loanGroups[orig] += (item.rawAmount || 0);
                                    });
                                    const order = {'Tr.A':1, 'Tr.B':4, 'Tr.C':5, 'Tr.D':6};
                                    const loanKeys = Object.keys(loanGroups).sort((a,b) => (order[a] || 99) - (order[b] || 99));

                                    return loanKeys.map(origTranche => {
                                        const lSum = loanGroups[origTranche];
                                        const pct = totalLoan > 0 ? ((lSum / totalLoan) * 100).toFixed(1) : 0;
                                        return (
                                            <div key={origTranche} className="flex items-baseline gap-[4px]">
                                                <span className={`${getTrancheColor(origTranche)} font-bold text-[14px] mr-[2px]`}>{origTranche}</span>
                                                <span className="text-white font-bold text-[14px]">{amtFmt(lSum)}</span>
                                                <span className="text-[#86868B] text-[13px] tracking-tight mr-[4px]">({pct}%)</span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                        <div 
                            className="text-[14px] text-[#86868B] shrink-0 cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group ml-4 translate-x-[6px]"
                            onClick={() => {
                                if (navigateTo) {
                                    navigateTo('platform/iotaseoul/stakeholder/lp');
                                    setTimeout(() => {
                                        window.location.hash = `#${vehicleId}`;
                                    }, 100);
                                }
                            }}
                        >
                            <span>자세히보기</span>
                            <svg className="w-[12px] h-[12px] ml-1 text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex w-full divide-x divide-[#444]/50">
                        {sortedTranches.map(trancheName => {
                            const items = data[trancheName];
                            if (!items || items.length === 0) return null;
                            const tSum = items.reduce((a, b) => a + (b.rawAmount || 0), 0);
                            const isHighlighted = 
                                hoveredBarTranche === trancheName || 
                                (hoveredBarTranche === '주주대여' && trancheName === 'Equity') ||
                                (hoveredBarTranche === 'Tr.A-2' && trancheName === 'Tr.A-1') ||
                                (hoveredBarTranche === 'Tr.B-2' && trancheName === 'Tr.B-1');
                                    
                                    let headerSum = tSum;
                                    if (trancheName === 'Tr.A-1') {
                                        headerSum = items.filter(it => it.originalTranche !== 'Tr.A-2').reduce((a, b) => a + (b.rawAmount || 0), 0);
                                    }
                                    if (trancheName === 'Tr.B-1') {
                                        headerSum = items.filter(it => it.originalTranche !== 'Tr.B-2').reduce((a, b) => a + (b.rawAmount || 0), 0);
                                    }
                                    
                                    return (
                                        <div key={trancheName} className={`flex-1 min-w-0 flex flex-col pb-[32px] pl-[26px] pr-0 transition-colors duration-300 ${isHighlighted ? 'bg-[#383838]' : ''}`}>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[380px] pr-[22px]">
                                                <div className={`flex justify-between items-center w-full sticky top-0 z-10 pt-[20px] pb-[16px] transition-colors duration-300 ${isHighlighted ? 'bg-[#383838]' : 'bg-[#2A2A2A]'}`}>
                                                    <span className={`${getTrancheColor(trancheName)} font-bold text-[15px]`}>{trancheName}</span>
                                                    <span className="text-white font-bold text-[16px]">{headerSum.toLocaleString()}<span className="ml-[2px]">억</span></span>
                                                </div>
                                                {items.map((item, i) => {
                                                    if (item.isSubHeader) {
                                                        const isTargetSub = item.name === 'Tr.A-2' || item.name === 'Tr.B-2' || item.name === '보통주' || item.name === '1종 종류주' || (item.name && item.name.includes('종류주'));
                                                        const subSum = isTargetSub ? items.filter(it => it.originalTranche === item.name || (item.name === '1종 종류주' && it.originalTranche && it.originalTranche.includes('종류주'))).reduce((a,b) => a + (b.rawAmount || 0), 0) : 0;
                                                        
                                                        return (
                                                            <div key={i} className={`mt-[16px] mb-[12px] border-b border-[#444]/50 pb-2 ${isTargetSub ? 'flex justify-between items-end' : ''}`}>
                                                                <span className={`${isTargetSub ? getTrancheColor(item.name) : 'text-[#86868B]'} font-bold ${isTargetSub ? 'text-[15px]' : 'text-[13px]'}`}>{item.name}</span>
                                                                {isTargetSub && <span className="text-white font-bold text-[16px]">{subSum.toLocaleString()}<span className="ml-[2px]">억</span></span>}
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <div key={i} className="flex justify-between items-center w-full mb-[12px] group cursor-pointer">
                                                            <span className={`text-[#E5E5E5] text-[14.5px] transition-colors duration-200 ${getTrancheHoverColor(trancheName)} break-keep mr-2 truncate`}>
                                                                {item.displayIndex ? `${item.displayIndex}. ` : ''}{item.name}
                                                            </span>
                                                            <span className={`text-[#E5E5E5] text-[14.5px] transition-colors duration-200 ${getTrancheHoverColor(trancheName)} shrink-0`}>
                                                                {Number(item.rawAmount).toLocaleString()}<span className="ml-[2px]">억</span>
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                        })}
                    </div>
                </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default IotaTwo816DetailCard;
