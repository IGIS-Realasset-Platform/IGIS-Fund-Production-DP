import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

import IotaTwo816DetailCard from './shared/IotaTwo816DetailCard';

export default function IotaTwo816() {
    const [marketingData, setMarketingData] = useState([]);
    const [ecoSpecs, setEcoSpecs] = useState([]);
    const [buildingSpecs, setBuildingSpecs] = useState([]);
    const [researchInsights, setResearchInsights] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [dbData, setDbData] = useState({});
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const [marketingRes, specsRes, researchRes, comparisonRes, capitalRes, historyRes] = await Promise.all([
                    supabase.from('iota_marketing_history').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_building_specs').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_research_insights').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_building_comparison').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_capital_stack').select('*').eq('vehicle_name', '816').abortSignal(controller.signal),
                    supabase.from('iota_project_history').select('*').eq('vehicle_name', '816').order('created_at', { ascending: true }).abortSignal(controller.signal)
                ]);

                if (controller.signal.aborted) return;

                if (marketingRes.data) setMarketingData(marketingRes.data);
                if (specsRes.data) {
                    setEcoSpecs(specsRes.data.filter(s => s.category === 'eco'));
                    setBuildingSpecs(specsRes.data.filter(s => s.category === 'spec'));
                }
                if (researchRes.data) setResearchInsights(researchRes.data);
                if (comparisonRes.data) setComparisonData(comparisonRes.data);
                if (historyRes.data) setHistoryData(historyRes.data);

                if (capitalRes.data) {
                    const grouped = {};
                    
                    capitalRes.data.forEach(item => {
                        const p = item.phase;
                        let tranche = item.tranche_name;
                        let type = item.tranche_type;
                        let sortOrder = 0;
                        let originalTranche = tranche;

                        if (tranche === '1종 종류주' || tranche === '보통주' || tranche === '주주대여금' || tranche.includes('종류주')) {
                            tranche = 'Equity';
                            type = 'Equity';
                            if (originalTranche === '1종 종류주' || originalTranche.includes('종류주')) sortOrder = 0;
                            else if (originalTranche === '보통주') sortOrder = 1;
                            else if (originalTranche === '주주대여금') sortOrder = 2;
                        }

                        if (tranche === 'Tr.A-2') {
                            tranche = 'Tr.A-1';
                            sortOrder = 1;
                        }

                        if (!grouped[p]) grouped[p] = {};
                        if (!grouped[p][tranche]) grouped[p][tranche] = [];

                        grouped[p][tranche].push({
                            name: item.institution_name,
                            amount: item.amount_krw_100m.toLocaleString(),
                            rawAmount: item.amount_krw_100m,
                            type: type,
                            originalTranche: originalTranche,
                            sortOrder: sortOrder
                        });
                    });

                    Object.keys(grouped).forEach(p => {
                        Object.keys(grouped[p]).forEach(t => {
                            const arr = grouped[p][t];
                            arr.sort((a,b) => {
                                if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
                                return b.rawAmount - a.rawAmount;
                            });

                            if (t === 'Equity') {
                                const subheaders = ['1종 종류주', '보통주', '주주대여금'];
                                subheaders.forEach(sub => {
                                    let hasSub = false;
                                    for (let i = 0; i < arr.length; i++) {
                                        if (!arr[i].isSubHeader && (arr[i].originalTranche === sub || (sub === '1종 종류주' && arr[i].originalTranche && arr[i].originalTranche.includes('종류주'))) && !hasSub) {
                                            arr.splice(i, 0, { isSubHeader: true, name: sub });
                                            hasSub = true;
                                            i++;
                                        }
                                    }
                                });
                            }
                            
                            if (t === 'Tr.A-1') {
                                let hasSubheader = false;
                                for (let i = 0; i < arr.length; i++) {
                                    if (arr[i].originalTranche === 'Tr.A-2' && !hasSubheader) {
                                        arr.splice(i, 0, { isSubHeader: true, name: 'Tr.A-2' });
                                        hasSubheader = true;
                                        i++;
                                    }
                                }
                            }

                            let idx = 1;
                            arr.forEach(item => {
                                if (!item.isSubHeader) item.displayIndex = idx++;
                            });
                        });
                    });

                    setDbData(grouped);
                }
            } catch (err) {
                if (controller.signal.aborted) return;
                console.error("Error fetching IotaTwo816 data:", err);
            }
        };

        fetchData();

        return () => {
            controller.abort();
        };
    }, []);
    return (
                <div className="w-[1200px] mx-auto flex-1 flex flex-col pt-[40px] shrink-0 pb-[60px]">
                
                {/* Title & Metadata row */}
                <div className="w-full flex justify-between items-start mb-[32px]">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] translate-y-[9px] translate-x-[4px]">IOTA Seoul 2 816</h1>
                    
                    <div className="flex items-center h-[48px] translate-y-[4px] -translate-x-[30px]">
                        {/* Item 1 */}
                        <div className="flex flex-col items-center justify-center h-full px-[20px]">
                            <span className="text-[13px] text-[#666] font-normal -mb-[1px] font-['Inter']">Now</span>
                            <span className="text-[18px] font-bold text-[#A1A1AA] tracking-tight">개발중</span>
                        </div>
                        
                        <div className="w-px h-[28px] bg-[#E5E5E5] dark:bg-[#333]"></div>
                        
                        {/* Item 2 */}
                        <div className="flex flex-col items-center justify-center h-full px-[20px] flex-shrink-0">
                            <span className="text-[13px] text-[#666] font-normal -mb-[1px] font-['Inter']">Priority</span>
                            <span className="text-[18px] font-bold text-[#e11d48] tracking-tight font-['Inter']">High</span>
                        </div>
                        
                        <div className="w-px h-[28px] bg-[#E5E5E5] dark:bg-[#333]"></div>
                        
                        {/* Item 3 */}
                        <div className="flex flex-col items-center justify-center h-full px-[20px]">
                            <span className="text-[13px] text-[#666] font-normal -mb-[1px] font-['Inter']">Vehicle</span>
                            <span className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#A1A1AA] tracking-tight font-['Inter']">PFV</span>
                        </div>
                        
                        <div className="w-px h-[28px] bg-[#E5E5E5] dark:bg-[#333]"></div>
                        
                        {/* Item 4 */}
                        <div className="flex flex-col items-center justify-center h-full px-[20px]">
                            <span className="text-[13px] text-[#666] font-normal -mb-[1px] font-['Inter']">Sector</span>
                            <span className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#A1A1AA] tracking-tight font-['Inter']">Commercial</span>
                        </div>
                        
                        <div className="w-px h-[28px] bg-[#E5E5E5] dark:bg-[#333]"></div>
                        
                        {/* Item 5 */}
                        <div className="flex flex-col items-center justify-center h-full px-[20px]">
                            <span className="text-[13px] text-[#666] font-normal -mb-[1px] font-['Inter']">Use</span>
                            <span className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#A1A1AA] tracking-tight font-['Inter']">Office</span>
                        </div>
                        
                        <div className="w-px h-[28px] bg-[#E5E5E5] dark:bg-[#333]"></div>
                        
                        {/* Item 6 */}
                        <div className="flex flex-col items-center justify-center h-full pl-[20px]">
                            <span className="text-[13px] text-[#666] font-normal -mb-[1px] font-['Inter']">Project Type</span>
                            <span className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#A1A1AA] tracking-tight font-['Inter']">Development</span>
                        </div>
                    </div>
                </div>

                {/* Team Info Pill Box (Now Status Track) */}
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[24px] h-[74px] flex items-center justify-between px-8">
                    <div className="flex items-center text-[16px]">
                        <span className="text-[#86868B] mr-[18px] text-[14px] font-medium font-['Inter']">현재트랙</span>
                        <span className="text-white font-bold">2026년 4월 24일 리파이낸싱 완료</span>
                        <span className="text-[#666] mx-[14px]">ㅣ</span>
                        <span className="text-white font-bold">2027년 4월 철거 공사 예정</span>
                        <span className="text-[#666] mx-[14px]">ㅣ</span>
                        <span className="text-white font-bold">통합 PF 준비중</span>
                    </div>
                </div>

                {/* Timeline Setup */}
                <div className="w-[1230px] -ml-[15px] h-[112px] mt-[9px] mb-[13px] relative group cursor-pointer rounded-[24px] hover:bg-[#242424] transition-colors duration-300 px-[40px]">
                    <div className="absolute top-[56px] left-[40px] right-[40px] h-px bg-[#444] group-hover:bg-[#E5E5E5] transition-colors duration-300 z-0">
                        {[
                            { date: '2022.12', label: 'PFV설립', left: 0 },
                            { date: '2024.03', label: '자산매입', left: 0.11 },
                            { date: '2024.12', label: '통합심의 完', left: 0.18 },
                            { date: '2025.4', label: '사업시행인가 完', left: 0.28 },
                            { date: '2025.6', label: '1차연장', left: 0.37 },
                            { date: '2025.09', label: '2차연장', left: 0.43 },
                            { date: '2025.10', label: '3차연장', left: 0.49 },
                            { date: '2026.01', label: 'EOD', left: 0.55 },
                            { date: '2026.04', label: '리파이낸싱', left: 0.61 },
                            { date: 'NOW', label: '', type: 'now', left: 0.66 },
                            { date: '2027.02', label: '통합PF', left: 0.72 },
                            { date: '2027.05', label: 'IOTA1 착공', left: 0.80 },
                            { date: '2028.06', label: 'IOTA2 착공', left: 0.89 },
                            { date: '2032.07', label: '준공', left: 1.0 }
                        ].map((ms, index) => (
                            <div key={index} className={`absolute flex flex-col items-center justify-center top-1/2 -translate-y-1/2 -translate-x-1/2 ${ms.type === 'now' ? 'ml-[4px]' : ''}`} style={{ left: `${ms.left * 100}%` }}>
                                {/* Date (UP) */}
                                <div className="absolute bottom-[20px] w-[120px] text-center pointer-events-none">
                                    <span className={`text-[13px] font-['Inter'] transition-colors duration-300 ${ms.type === 'now' ? 'font-bold text-[#c3c2b7]' : 'text-[#86868B] group-hover:text-[#E5E5E5]'}`}>
                                        {ms.date}
                                    </span>
                                </div>

                                {/* Node (CENTER) */}
                                <div className="relative z-10 flex items-center justify-center w-[14px] h-[14px]">
                                    {ms.type === 'now' ? (
                                        <div className="absolute w-[2px] h-[36px] border-l-[2px] border-dotted border-[#c3c2b7] -top-[14px] left-[6px]" />
                                    ) : (
                                        <div className="w-[14px] h-[14px] rounded-full bg-[#555] group-hover:bg-white transition-colors duration-300 shadow-sm" />
                                    )}
                                </div>

                                {/* Label (DOWN) */}
                                <div className="absolute top-[22px] w-[160px] text-center pointer-events-none">
                                    <span className="text-[15px] font-medium text-[#A1A1AA] group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                                        {ms.label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <IotaTwo816DetailCard 
                    id="card-816" 
                    vehicleId="816" 
                    title="" 
                    dbData={dbData['Refinancing'] || {}} 
                    historyData={historyData} 
                    navigateTo={(path) => {
                        const base = import.meta.env.BASE_URL;
                        const url = base.endsWith('/') ? `${base}${path}` : `${base}/${path}`;
                        window.history.pushState(null, '', url);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }} 
                />

                {/* Major Issues Box */}
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[32px] pl-[24px] pr-[32px] py-[24px] flex flex-col mb-[20px] h-[127px]">
                    <div className="w-full flex justify-between items-center mb-[1px] mt-[-5px]">
                        <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] relative top-[-1px]">주요 이슈</span>
                        <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#444]/60 transition-colors duration-200 group/btn mr-[-4px]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover/btn:opacity-100 transition-opacity">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[4px]">
                        <span className="text-[16px] font-medium text-[#c3c2b7] leading-[22px] tracking-tight">
                            2026년 3월 클로징 목표로 리파이낸싱을 추진했으나 KB증권 안이 부결되어 현재는 선순위 일부는 메리츠증권, 잔여분은 NH증권이 참여하는 구조를 협의 중임
                        </span>
                        <span className="text-[16px] font-medium text-[#c3c2b7] leading-[22px] tracking-tight">
                            PFV는 브릿지론 후순위 대여 700억원 소노인터내셔널 확약을 확보했고, 힐튼 재개발사업과 통합 프로젝트 리츠 설립 후 PF를 조달해 전반적 사업구조 안정화하는 방안 함께 검토 중
                        </span>
                    </div>
                </div>

                {/* Architectural Info Box */}
                <div className="w-full flex gap-[20px] mb-[20px]">
                    {/* Left Column (Image) */}
                    <div className="w-[450px] h-[452px] relative rounded-[32px] overflow-hidden group">
                        <img src={`${import.meta.env.BASE_URL}iotaseoul2.webp`} alt="IOTA Seoul" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]" />
                        
                        {/* Premium Inner Overlay Stroke */}
                        <div className="absolute inset-0 rounded-[32px] border border-white/15 pointer-events-none z-10 transition-colors duration-700 group-hover:border-white/25"></div>
                        
                        {/* Top Right '+' Button */}
                        <div className="absolute top-[17px] right-[17px] w-[46px] h-[46px] rounded-full bg-black/20 border border-white/60 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors z-10 shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="4" x2="12" y2="20"></line>
                                <line x1="4" y1="12" x2="20" y2="12"></line>
                            </svg>
                        </div>
                        
                        {/* Bottom Center Pill */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-[14px] py-[6px] rounded-[6px] bg-black/40 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors z-10 shadow-sm whitespace-nowrap">
                            <span className="text-[13px] text-white/90 font-medium tracking-tight">CG컷 | 평면도</span>
                        </div>
                    </div>

                    {/* Right Column (Data Table) */}
                    <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] pt-[24px] pb-[4px] relative flex flex-col h-[452px] overflow-hidden">
                        
                        {/* Architecture Overview Link */}
                        <div className="absolute top-[24px] right-[32px] text-[14px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group z-10">
                            <span>건축개요 전체보기</span>
                            <svg className="w-[12px] h-[12px] ml-1 text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>

                        {/* Top Header Row */}
                        <div className="flex items-center gap-[24px] mb-[24px] pl-[28px] pr-[140px]">
                            <div className="flex flex-col gap-[3px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">시공사</span>
                                <span className="text-[28px] font-bold text-white tracking-tighter leading-none">삼성물산</span>
                            </div>
                            <div className="w-[1px] h-[36px] bg-[#444]/50"></div>
                            <div className="flex flex-col gap-[3px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">설계사</span>
                                <span className="text-[28px] font-bold text-white tracking-tighter leading-none">SOM, dA</span>
                            </div>
                            <div className="w-[1px] h-[36px] bg-[#444]/50"></div>
                            <div className="flex flex-col gap-[3px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">바닥면적</span>
                                <span className="text-[28px] font-bold text-white tracking-tighter leading-none">575평</span>
                            </div>
                            <div className="w-[1px] h-[36px] bg-[#444]/50"></div>
                            <div className="flex flex-col gap-[3px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">전력</span>
                                <span className="text-[28px] font-bold text-white tracking-tighter leading-none">13MW</span>
                            </div>
                        </div>

                        {/* Full Width Divider */}
                        <div className="w-full border-t border-[#444]/50"></div>

                        {/* 2-Column Data Grid */}
                        <div className="grid grid-cols-2 flex-1">
                            {/* Row 1 */}
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-r border-[#444]/50 pl-[28px] pr-[16px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">시행법인</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium truncate pr-4">와이디816피에프브이(주)</span>
                            </div>
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-[#444]/50 pl-[24px] pr-[32px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">규모</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">B9 / 34F</span>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-r border-[#444]/50 pl-[28px] pr-[16px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">위치</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium truncate pr-4">서울시 중구 남대문로 5가 526, 537...</span>
                            </div>
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-[#444]/50 pl-[24px] pr-[32px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">층고</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">4.3m (업무시설)</span>
                            </div>

                            {/* Row 3 */}
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-r border-[#444]/50 pl-[28px] pr-[16px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">연면적</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium truncate">120,783 m² (36,537평)</span>
                            </div>
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-[#444]/50 pl-[24px] pr-[32px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">천정고</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">2.95m (업무시설)</span>
                            </div>

                            {/* Row 4 */}
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-r border-[#444]/50 pl-[28px] pr-[16px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">사업면적</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium truncate">7,199.90 m² (2,178평)</span>
                            </div>
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-[#444]/50 pl-[24px] pr-[32px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">주차대수</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">519 대</span>
                            </div>

                            {/* Row 5 */}
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-r border-[#444]/50 pl-[28px] pr-[16px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">용도</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium truncate">업무시설, 근린생활시설</span>
                            </div>
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-[#444]/50 pl-[24px] pr-[32px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">높이</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">162.98m</span>
                            </div>

                            {/* Row 6 */}
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-r border-[#444]/50 pl-[28px] pr-[16px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">건폐율</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">42.86%</span>
                            </div>
                            <div className="grid grid-cols-[84px_1fr] items-center border-b border-[#444]/50 pl-[24px] pr-[32px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">개방형녹지</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium truncate">3,424.70m² (1,036평)</span>
                            </div>

                            {/* Row 7 */}
                            <div className="grid grid-cols-[84px_1fr] items-center border-r border-[#444]/50 pl-[28px] pr-[16px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">용적률</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">1,159.94%</span>
                            </div>
                            <div className="grid grid-cols-[84px_1fr] items-center pl-[24px] pr-[32px]">
                                <span className="text-[15px] font-bold text-[#86868B] tracking-tight">전용률</span>
                                <span className="text-[16px] text-[#E5E5E5] tracking-tight font-medium">46.62%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand & Product Box */}
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[32px] flex flex-row mb-[20px] overflow-hidden">
                    <div className="w-[200px] shrink-0 border-r border-[#444]/50 flex flex-col items-center justify-between py-[36px] px-[24px]">
                        <span className="text-[14px] font-bold text-[#86868B] w-full text-center">Brand & Product</span>
                        <img src={`${import.meta.env.BASE_URL}iota-logo.png`} alt="IOTA" className="w-[110px] object-contain opacity-100 my-auto" />
                        <div className="w-full flex flex-col gap-[8px]">
                            <div className="w-full h-[32px] rounded-[8px] border border-[#444] bg-transparent flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors">
                                <span className="text-[12px] font-bold text-[#A1A1AA] tracking-wide">Sales kit</span>
                            </div>
                            <a href="https://iotaseoul.site/" target="_blank" rel="noopener noreferrer" className="w-full h-[32px] rounded-[8px] border border-[#444] bg-transparent flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors">
                                <span className="text-[12px] font-bold text-[#A1A1AA] tracking-wide">Website</span>
                            </a>
                        </div>
                    </div>

                    {/* Right Partition (Data Grid + Footer) */}
                    <div className="flex-1 flex flex-col relative">
                        {/* Data Grid */}
                        <div className="flex-1 flex flex-col gap-[16px] pl-[32px] pr-[90px] py-[28px] relative">
                            {/* Rows */}
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">Brand Guidelines</span>
                                <a href="#" className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">그리스 숫자로 10을 의미하는 단어 'IOTA'는 모든 수를 포함하는 통합의 수 '10'을 뜻합니다.</a>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">프로젝트 리서치</span>
                                <a href="#" className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">당대 글로벌 Trophy 오피스 사례를 비교 조사 했습니다. (아자부다이힐스, 토라노몬힐스, 270 파크에비뉴..)</a>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">프로젝트 브랜드 컨셉</span>
                                <span className="text-[15px] font-medium text-[#666] tracking-tight leading-[22px] cursor-default">TBD (ex. Moden Urban Village Green & Wellness by Azabudai Hills)</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">공간 UX 차별성</span>
                                <a href="#" className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">개방형녹지(게이트웨이파크), 시티뷰 멀티 아레나, 루프탑 스카이가든, 프라이빗 이벤트스페이스, 라운지, 로비, 진입동선 등</a>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">디지털 OS & UX</span>
                                <a href="#" className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">핀포인트+삼성전자 디지털 OS 탑재 기획 진행중</a>
                            </div>

                            {/* Circular Plus Button */}
                            <div className="absolute top-[18px] right-[18px] w-[46px] h-[46px] rounded-full border border-[#555] flex items-center justify-center cursor-pointer hover:bg-[#444] transition-colors group z-10 shadow-sm">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E5E5E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            </div>
                        </div>

                        {/* Footer Section restricted strictly to the right side */}
                        <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[32px] gap-[24px] shrink-0">
                            <div className="flex items-center gap-[12px]">
                                <span className="text-[13px] font-bold text-[#86868B]">브랜드 담당</span>
                                <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">공간솔루션센터</a>
                            </div>
                            <div className="w-[1px] h-[14px] bg-[#555]"></div>
                            <div className="flex items-center gap-[12px]">
                                <span className="text-[13px] font-bold text-[#86868B]">Partnership</span>
                                <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">삼성전자</a>
                            </div>
                        </div>
                    </div>
                </div>

                                {/* Corporate Sales & Partnership Box */}
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[32px] flex flex-col mb-[20px] overflow-hidden">
                    {/* Header & Body */}
                    <div className="pl-[30px] pr-[32px] pt-[28px] pb-[27px] flex flex-col relative w-full">
                        {/* Title Row */}
                        <div className="flex items-center justify-between w-full mb-[14px]">
                            <span className="text-[14px] font-bold text-[#86868B] tracking-tight">기업 세일즈 & 파트너십</span>
                            <div className="text-[15px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group tracking-tight">
                                <span>히스토리 전체보기</span>
                                <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Content Rows */}
                        <div className="flex flex-col gap-[8px]">
                            {/* Row 1 */}
                            <div className="text-[15px] leading-[22px]">
                                <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">[접촉 준비]</span>
                                <a href="#" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                    IOTA 서울 SK 계열사 통합 이전 관련 (약 0000명 0개층 사용) 접촉 준비 
                                </a>
                                <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                <a href="#" className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">SK솔루션</a>
                                <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                <a href="#" className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">OO 사업실 OOO 본부장</a>
                            </div>
                            
                            {/* Row 2 */}
                            <div className="text-[15px] leading-[22px]">
                                <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">[제안 및 검토]</span>
                                <a href="#" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                    LG전자 이오타 임차, 프로젝트 내 설비 + 데이터센터 설비 협업 사업건 제안 및 상호 협의 진행중 
                                </a>
                                <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                <a href="#" className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">LG전자</a>
                                <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                <a href="#" className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">한국 영업본부 데이터사업실 CSO OOO</a>
                            </div>
                            
                            {/* Row 3 */}
                            <div className="text-[15px] leading-[22px]">
                                <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">[제안 및 검토]</span>
                                <a href="#" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                    법무법인 화우 임차 제안(약 1천명 이오타2 7개층 사용) 및 협의 진행중 
                                </a>
                                <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                <a href="#" className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">법무법인화우</a>
                                <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                <a href="#" className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">한영익 팀장</a>
                            </div>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[30px] gap-[24px] shrink-0">
                        <div className="flex items-center gap-[12px]">
                            <span className="text-[13px] font-bold text-[#86868B]">기업세일즈 담당</span>
                            <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">기업마케팅센터</a>
                        </div>
                        <div className="w-[1px] h-[14px] bg-[#555]"></div>
                        <div className="flex items-center gap-[12px]">
                            <span className="text-[13px] font-bold text-[#86868B]">Partnership</span>
                            <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">PwC</a>
                        </div>
                    </div>
                </div>

                {/* Marketing & Placemaking Box */}
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[32px] flex flex-row mb-[20px] overflow-hidden">
                    
                    {/* Left Column Strategy: Marketing */}
                    <div className="flex-1 border-r border-[#444]/50 flex flex-col">
                        {/* Body */}
                        <div className="pl-[30px] pr-[32px] pt-[28px] pb-[27px] flex flex-col flex-1">
                            {/* Title */}
                            <div className="flex items-center justify-between w-full mb-[14px]">
                                <span className="text-[14px] font-bold text-[#86868B] tracking-tight">Marketing</span>
                                <div className="text-[15px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group tracking-tight -mr-[9px]">
                                    <span>마케팅 내역 전체보기</span>
                                    <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex flex-col gap-[8px]">
                                {marketingData.length > 0 ? marketingData.map(item => (
                                    <div key={item.id} className="text-[15px] leading-[22px]">
                                        <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">{item.type}</span>
                                        <a href={item.url} className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">{item.title}</a>
                                    </div>
                                )) : (
                                    <div className="text-[15px] leading-[22px] text-[#86868B]">마케팅 내역을 불러오는 중...</div>
                                )}
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[30px] shrink-0">
                            <span className="text-[13px] font-bold text-[#86868B] mr-[12px]">마케팅 담당</span>
                            <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">기업마케팅센터</a>
                            <span className="text-[#666] mx-[8px]">ㅣ</span>
                            <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">PR팀</a>
                        </div>
                    </div>

                    {/* Right Column Strategy: Placemaking */}
                    <div className="flex-1 flex flex-col">
                        {/* Body */}
                        <div className="pl-[30px] pr-[32px] pt-[28px] pb-[27px] flex flex-col flex-1 relative">
                            {/* Title */}
                            <div className="flex items-center justify-between w-full mb-[14px]">
                                <span className="text-[14px] font-bold text-[#86868B] tracking-tight">Placemaking</span>
                                <div className="text-[15px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group tracking-tight">
                                    <span>히스토리 전체보기</span>
                                    <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                            {/* Content Centered "TBD" */}
                            <div className="flex-1 flex items-center justify-center -mt-[14px]">
                                <span className="text-[#86868B] font-bold text-[24px]">TBD</span>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[30px] shrink-0">
                            <span className="text-[13px] font-bold text-[#86868B] mr-[12px]">플레이스메이킹 담당</span>
                            <span className="text-[14px] font-bold text-[#86868B]">TBD</span>
                        </div>
                    </div>

                </div>

                {/* Retail Box */}
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[32px] flex flex-col mb-[20px] overflow-hidden">
                    {/* Header & Body */}
                    <div className="pl-[30px] pr-[32px] py-[24px] h-[106px] flex flex-col relative w-full items-center justify-center">
                        <div className="absolute top-[28px] left-[30px]">
                            <span className="text-[14px] font-bold text-[#86868B] tracking-tight">Retail</span>
                        </div>
                        <span className="text-[#86868B] font-bold text-[24px]">TBD</span>
                    </div>

                    {/* Footer Section */}
                    <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[30px] gap-[12px] shrink-0">
                        <span className="text-[13px] font-bold text-[#86868B]">리테일 담당</span>
                        <span className="text-[14px] font-bold text-[#86868B]">TBD</span>
                    </div>
                </div>

                {/* Eco & Spec Box */}
                <div className="w-full bg-[#292928] border border-[#3c3c3c] rounded-[32px] flex flex-col mb-0 overflow-hidden">
                    
                    {/* Top Body Row (2 Columns) */}
                    <div className="flex flex-row w-full flex-1">
                        {/* Left Column Strategy: 친환경 인증 */}
                        <div className="w-[380px] flex flex-col shrink-0">
                            {/* Body */}
                            <div className="pl-[30px] pr-[32px] pt-[28px] pb-[27px] flex flex-col flex-1 relative">
                                {/* Title */}
                                <div className="flex items-center justify-between w-full mb-[14px]">
                                    <span className="text-[14px] font-bold text-[#86868B] tracking-tight">친환경 인증</span>
                                </div>
                                {/* Content */}
                                <div className="flex flex-col gap-[8px]">
                                    {ecoSpecs.map(item => (
                                        <div key={item.id} className="text-[15px] leading-[22px]">
                                            <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">{item.label}</span>
                                            <a href="#" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors group/link inline-block">
                                                {item.highlight ? <span className="font-bold text-[#E5E5E5] group-hover/link:text-[#fbf167] transition-colors">{item.highlight} </span> : null}
                                                {item.value}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column Strategy: 빌딩 상세 SPEC */}
                        <div className="flex-1 flex flex-col">
                            {/* Body */}
                            <div className="pr-[32px] pt-[28px] pb-[27px] flex flex-col flex-1 relative">
                                {/* Title */}
                                <div className="pl-[30px] flex items-center justify-between w-full mb-[14px]">
                                    <span className="text-[14px] font-bold text-[#86868B] tracking-tight">빌딩 상세 SPEC</span>
                                    <div className="text-[15px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group tracking-tight -mr-[9px]">
                                        <span>빌딩 SPEC 전체보기</span>
                                        <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="pl-[30px] border-l border-[#444]/50 flex flex-col gap-[8px]">
                                    {buildingSpecs.map(item => (
                                        <div key={item.id} className="text-[15px] leading-[22px]">
                                            <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">{item.label}</span>
                                            <a href="#" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                                {item.value}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Unified Footer Section */}
                    <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[30px] gap-[24px] shrink-0">
                        <div className="flex items-center gap-[12px]">
                            <span className="text-[13px] font-bold text-[#86868B]">담당</span>
                            <div className="flex items-center gap-[8px]">
                                <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">이수정</a>
                                <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">김대익</a>
                            </div>
                        </div>
                        <div className="w-[1px] h-[14px] bg-[#555]"></div>
                        <div className="flex items-center gap-[12px]">
                            <span className="text-[13px] font-bold text-[#86868B]">Partnership</span>
                            <div className="flex items-center gap-[8px]">
                                <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">dA</a>
                                <a href="#" className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">어패스리질리언스</a>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Section Divider */}
                <div className="w-full h-[1px] bg-[#444]/50 my-[60px]"></div>

                {/* Research & Insight Box */}
                <div className="w-full bg-[#232323] border border-[#3c3c3c] rounded-[32px] mb-[80px] overflow-hidden relative">
                    <div className="pl-[30px] pr-[32px] pt-[28px] pb-[32px] flex flex-col w-full">
                        {/* Title Row */}
                        <div className="flex items-center justify-between w-full mb-[24px]">
                            <span className="text-[14px] font-bold text-[#86868B] tracking-tight">Research & Insight</span>
                        </div>

                        {/* Circular Action Button */}
                        <div className="absolute top-[20px] right-[24px] w-[46px] h-[46px] rounded-full border border-[#555] flex items-center justify-center cursor-pointer hover:bg-[#444] transition-colors group z-10 shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E5E5E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </div>

                        {/* Text List */}
                        <div className="flex flex-col w-full">
                            {researchInsights.map((item, index) => (
                                <div key={item.id} className={`w-full ${index === 0 ? 'pb-[20px]' : index === researchInsights.length - 1 ? 'pt-[20px] pb-[4px] border-t border-[#444]/50' : 'py-[20px] border-t border-[#444]/50'}`}>
                                    <a href={item.url} className="text-[20px] font-medium text-[#E5E5E5] hover:text-[#fbf167] transition-colors cursor-pointer flex items-center tracking-tight">
                                        <span className={`mr-[14px] text-[22px] grayscale opacity-70 ${item.is_bright ? 'brightness-125' : ''}`}>{item.icon}</span>
                                        {item.title}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Compare Title */}
                <div className="w-full text-left mb-[16px] pl-[4px]">
                    <span className="text-[20px] font-bold text-[#1D1D1F] dark:text-[#E5E5E5] tracking-tight">서울 3대권역 프라임빌딩 자산 비교하기</span>
                </div>

                {/* Compare Boxes List */}
                {comparisonData.map((data) => (
                    <div key={data.id} className="w-full flex flex-row gap-[16px] mb-[20px]">
                    
                    {/* Image Box */}
                    <div className="w-[430px] h-[360px] rounded-[32px] overflow-hidden relative shrink-0 border border-[#3c3c3c]/50">
                        <img src={`${import.meta.env.BASE_URL}${(data.image || '').replace(/^\//, '')}`} alt={data.title} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                        
                        {/* Top Right '+' Button */}
                        <div className="absolute top-[17px] right-[17px] w-[46px] h-[46px] rounded-full bg-black/20 border border-white/60 flex items-center justify-center cursor-pointer hover:bg-black/30 transition-colors z-10 shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="4" x2="12" y2="20"></line>
                                <line x1="4" y1="12" x2="20" y2="12"></line>
                            </svg>
                        </div>
                    </div>

                    {/* Data Box */}
                    <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] overflow-hidden px-[32px] pt-[24px] pb-[32px] flex flex-col h-[360px]">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between w-full pb-[24px]">
                            <span className="text-[26px] font-bold text-[#E5E5E5] tracking-tight">{data.title}</span>
                            <div className="flex items-center text-[#86868B] cursor-pointer hover:text-[#fbf167] transition-colors group">
                                <span className="text-[13px] font-medium tracking-tight">IOTA Soul 2 816과 비교하기</span>
                                <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#fbf167] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Layout Split */}
                        <div className="flex flex-row w-full flex-1 min-h-0">
                            
                            {/* Cols 1 & 2 */}
                            <div className="flex flex-row flex-[1.7] border-r border-[#444]/50">
                                {/* Col 1 */}
                                <div className="flex flex-col flex-[0.85] border-r border-[#444]/50">
                                    <div className="flex items-center w-full h-[44px] pr-[30px]">
                                        <span className="w-[85px] shrink-0 text-[15px] font-bold text-[#86868B]">권역</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium truncate">{data.region}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pr-[30px] border-t border-[#444]/50">
                                        <span className="w-[85px] shrink-0 text-[15px] font-bold text-[#86868B]">준공년도</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium truncate">{data.year}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pr-[30px] border-t border-[#444]/50">
                                        <span className="w-[85px] shrink-0 text-[15px] font-bold text-[#86868B]">연면적</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium tracking-tight truncate">{data.gfa}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pr-[30px] border-t border-[#444]/50">
                                        <span className="w-[85px] shrink-0 text-[15px] font-bold text-[#86868B]">오피스면적</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium tracking-tight truncate">{data.office_area}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pr-[30px] border-t border-[#444]/50">
                                        <span className="w-[85px] shrink-0 text-[15px] font-bold text-[#86868B]">리테일면적</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium tracking-tight truncate">{data.retail_area}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pr-[30px] border-t border-[#444]/50">
                                        <span className="w-[85px] shrink-0 text-[15px] font-bold text-[#86868B]">기준층면적</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium tracking-tight truncate">{data.floor_area}</span>
                                    </div>
                                </div>
                                
                                {/* Col 2 */}
                                <div className="flex flex-col flex-[1.15]">
                                    <div className="flex items-center w-full h-[44px] pl-[26px] pr-[16px]">
                                        <span className="w-[75px] shrink-0 text-[15px] font-bold text-[#86868B]">규모</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium truncate">{data.scale}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pl-[26px] pr-[16px] border-t border-[#444]/50">
                                        <span className="w-[75px] shrink-0 text-[15px] font-bold text-[#86868B]">천정고</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium truncate">{data.ceiling_height}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pl-[26px] pr-[16px] border-t border-[#444]/50">
                                        <span className="w-[75px] shrink-0 text-[15px] font-bold text-[#86868B]">주차대수</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium truncate">{data.parking}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pl-[26px] pr-[16px] border-t border-[#444]/50">
                                        <span className="w-[75px] shrink-0 text-[15px] font-bold text-[#86868B]">시공사</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium tracking-tight truncate">{data.constructor}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pl-[26px] pr-[16px] border-t border-[#444]/50">
                                        <span className="w-[75px] shrink-0 text-[15px] font-bold text-[#86868B]">설계사</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium truncate">{data.architect}</span>
                                    </div>
                                    <div className="flex items-center w-full h-[44px] pl-[26px] pr-[16px] border-t border-[#444]/50">
                                        <span className="w-[75px] shrink-0 text-[15px] font-bold text-[#86868B]">리스스팬</span>
                                        <span className="text-[16px] text-[#E5E5E5] font-medium truncate">{data.lease_span}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financials Col 3 */}
                            <div className="flex flex-col flex-1 pl-[24px]">
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between items-center w-full h-[44px]">
                                        <span className="text-[14px] font-bold text-[#86868B]">월 GI</span>
                                        <span className="text-[24px] font-bold text-white tracking-tight">{data.monthly_gi}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full h-[44px]">
                                        <span className="text-[14px] font-bold text-[#86868B]">연 GI</span>
                                        <span className="text-[24px] font-bold text-white tracking-tight">{data.yearly_gi}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full h-[44px]">
                                        <span className="text-[14px] font-bold text-[#86868B]">연 NOI <span className="font-normal text-[11px]">(85%)</span></span>
                                        <span className="text-[24px] font-bold text-white tracking-tight">{data.yearly_noi}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col mt-[26px]">
                                    <div className="flex justify-between items-center w-full h-[44px]">
                                        <span className="text-[14px] font-bold text-[#86868B]">E.NOC <span className="font-normal text-[11px] pl-[2px]">(2026)</span></span>
                                        <span className="text-[24px] font-bold text-white tracking-tight">{data.enoc_2026}</span>
                                    </div>
                                    <div className="flex justify-between items-center w-full h-[44px]">
                                        <span className="text-[14px] font-bold text-[#86868B]">E.NOC <span className="font-bold text-white text-[11px] pl-[2px]">(2032 예측)</span></span>
                                        <span className="text-[24px] font-bold text-white tracking-tight">{data.enoc_2032}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                ))}
                
                <div className="h-[200px] shrink-0 w-full"></div>
            </div>
    );
}
