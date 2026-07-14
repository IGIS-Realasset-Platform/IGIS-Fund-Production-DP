import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

import IotaTwo816DetailCard from './shared/IotaTwo816DetailCard';

export default function IotaTwo816() {
        const navigate = (path) => {
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        window.history.pushState(null, '', base + (path.startsWith('/') ? path : '/' + path));
        window.dispatchEvent(new Event('popstate'));
    };
    const [marketingData, setMarketingData] = useState([]);
    const [marketingTasks, setMarketingTasks] = useState([]);
    const [ecoSpecs, setEcoSpecs] = useState([]);
    const [buildingSpecs, setBuildingSpecs] = useState([]);
    const [researchInsights, setResearchInsights] = useState([]);
    const [comparisonData, setComparisonData] = useState([]);
    const [dbData, setDbData] = useState({});
    const [historyData, setHistoryData] = useState([]);
    const [showPfScheduleModal, setShowPfScheduleModal] = useState(false);
    const [showSalesKitModal, setShowSalesKitModal] = useState(false);
    const [isIssuesExpanded, setIsIssuesExpanded] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const [marketingRes, specsRes, researchRes, comparisonRes, capitalRes, historyRes, tasksRes] = await Promise.all([
                    supabase.from('iota_marketing_history').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_building_specs').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_research_insights').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_building_comparison').select('*').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_capital_stack').select('*').eq('vehicle_name', '816').abortSignal(controller.signal),
                    supabase.from('iota_project_history').select('*').eq('vehicle_name', '816').order('created_at', { ascending: true }).abortSignal(controller.signal),
                    supabase.from('iota_marketing_tasks').select('*').or('related_asset.ilike.%iota%,related_asset.ilike.%이오타%,related_asset.ilike.%427%,related_asset.ilike.%816%,related_asset.ilike.%421%').order('created_at', { ascending: false }).limit(3).abortSignal(controller.signal)
                ]);

                if (controller.signal.aborted) return;

                if (marketingRes.data) setMarketingData(marketingRes.data);
                if (tasksRes.data) setMarketingTasks(tasksRes.data);
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
                <div className="w-[1200px] mx-auto flex-1 flex flex-col pt-[30px] shrink-0 pb-[60px]">
                
                {/* Title & Metadata row */}
                <div className="w-full flex justify-between items-start mb-[22px]">
                    <h1 className="text-[32px] font-bold text-white tracking-tight leading-none font-['Inter'] translate-y-[13px] translate-x-[4px]">IOTA Seoul Two 816</h1>
                    
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
                        <span className="text-[#86868B] mr-[18px] text-[15px] font-medium font-['Inter']">현재트랙</span>
                        <span className="text-white font-bold">2026년 4월 24일 리파이낸싱 완료</span>
                        <span className="text-[#666] mx-[14px]">ㅣ</span>
                        <span className="text-white font-bold">2027년 4월 철거 공사 예정</span>
                        <span className="text-[#666] mx-[14px]">ㅣ</span>
                        <span className="text-white font-bold">통합 PF 준비중</span>
                    </div>
                    <button 
                        onClick={() => setShowPfScheduleModal(true)}
                        className="h-[32px] px-[16px] bg-transparent hover:bg-white/5 rounded-[8px] text-[13px] font-medium text-[#A1A1AA] hover:text-[#E5E5E5] transition-colors border border-[#444] flex items-center justify-center cursor-pointer"
                    >
                        통합PF 스케줄 보기
                    </button>
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
                            { date: '2026.11', label: '통합PF', left: 0.72 },
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
                        navigate(`/${path}`);
                    }} 
                />

                {/* Major Issues Box */}
                <div 
                    onClick={() => setIsIssuesExpanded(!isIssuesExpanded)}
                    className={`w-full cursor-pointer bg-[#292928] border border-[#3c3c3c] hover:border-[#666] rounded-[32px] pl-[24px] pr-[32px] flex flex-col mb-[20px] transition-all duration-300 ${isIssuesExpanded ? 'pt-[24px] pb-[32px]' : 'pt-[24px] pb-[34px] min-h-[127px] h-auto'}`}
                >
                    <div className="w-full flex justify-between items-center mb-[1px] mt-[-5px]">
                        <span className="text-[14px] font-bold text-[#86868B] font-['Inter'] relative top-[-1px]">주요 이슈</span>
                        <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center hover:bg-[#444]/60 transition-colors duration-200 group/btn mr-[-4px]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#86868B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`opacity-70 group-hover/btn:opacity-100 transition-transform duration-300 ${isIssuesExpanded ? 'rotate-180' : ''}`}>
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                    
                    {!isIssuesExpanded ? (
                        <div className="flex flex-col gap-[4px] mt-[4px] animate-fadeIn">
                            <span className="text-[15px] font-medium text-[#c3c2b7] leading-[22px] tracking-tight">
                                <span className="font-bold text-white mr-1">EOD Rescue Capital:</span>
                                공매 처분을 막기 위해 이지스자산운용은 부동산펀드 421호에 C-1종 우선수익권을 긴급 개설하여 고유재원 유치. 시행사인 YD816PFV에 총 140억원의 후순위 주주대여를 단행해 밀린 연체이자를 정산 치유.
                            </span>
                            <span className="text-[15px] font-medium text-[#c3c2b7] leading-[22px] tracking-tight mt-[2px]">
                                <span className="font-bold text-white mr-1">리파이낸싱 완료 & 통합 PF 전향:</span>
                                기존 대주를 정리하는 7,970억원 규모의 신규 대환 리파이낸싱 구조 확립. 소노(SONO)그룹의 자금보충 연동 후순위 Tr.D(700억) 신용보강. 평당 공사비 1,281만원(+50.7%)으로 상승. 힐튼 재개발사업과 통합PF로 전반적 사업구조 안정화하는 방안 검토 중.
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-[28px] mt-[14px] animate-fadeIn">
                            
                            {/* Phase 1 */}
                            <div className="flex flex-col gap-[8px]">
                                <div className="text-[15px] font-bold text-[#E5E5E5] tracking-tight">Phase 1. PFV 설립 및 계약금 납입 <span className="text-[#86868B] font-medium ml-1">(2023년 1월 4차 심의)</span></div>
                                <div className="flex flex-col gap-[4px]">
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">특수목적법인 설립 및 매매계약 체결:</span> 
                                        2022년 12월 29일 시행주체인 YD816PFV를 설립하고, 12월 30일 메트로타워, 이듬해 1월 12일 서울로타워의 매매계약을 체결.
                                    </div>
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">계약금 납입 재원:</span> 
                                        총 매매대금 7,238억원의 5%인 계약금 및 초기 운용비 조달을 위해 이지스 421호 펀드 B-1종 수익증권을 개설하여 총 620억원의 재원을 모집, 1월 31일 계약금을 공제 기표. 당시 가설은 총사업비 1.54조원, 공사비 평당 850만원, 착공 25.06, 준공 28.10의 포트폴리오 구도였음.
                                    </div>
                                </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="flex flex-col gap-[8px]">
                                <div className="text-[15px] font-bold text-[#E5E5E5] tracking-tight">Phase 2. 정비계획 변경 및 용적률 상향 <span className="text-[#86868B] font-medium ml-1">(2023년 9월~11월 5차 심의 이전)</span></div>
                                <div className="flex flex-col gap-[4px]">
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">개발 인프라 확장 Upside:</span> 
                                        인허가 과정에서 연접한 두 빌딩의 용적률을 최대 1,199.42%까지 확보하는 정비계획 변경을 추진하며, 개발 연면적을 기존 35,611평에서 39,001평으로 늘려 목표 매출액을 1.90조원(+7.4%)으로 상향 조정.
                                    </div>
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">원가 악화의 시작:</span> 
                                        원자재 가격 상승 트렌드를 미리 반영하여 도급공사비 가정을 평당 900만원(+5.9%)으로 올렸고, 잔액 인수를 조율하는 과정에서 브릿지론 총액이 7,170억원으로 증액 계획되면서 총사업비가 1.79조원(+16.2%)으로 불어났음.
                                    </div>
                                </div>
                            </div>

                            {/* Phase 3 */}
                            <div className="flex flex-col gap-[8px]">
                                <div className="text-[15px] font-bold text-[#E5E5E5] tracking-tight">Phase 3. 자산매입 완료 및 거래종결 연기 <span className="text-[#86868B] font-medium ml-1">(2024년 3월)</span></div>
                                <div className="flex flex-col gap-[4px]">
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">급격한 잔금 순연 리스크 발발:</span> 
                                        원래 2023년 11월 30일이 잔금지급 예정일이었으나 금융기관 연말 한도소진 이슈로 대환 기표가 불발되자, 이지스는 매도인에게 위약금을 수용하는 조건으로 소유권 이전을 2024년 3월로 긴급 연장함.
                                    </div>
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">취득과 동시에 원가 수직상승:</span> 
                                        2024년 3월 15일(메트로), 29일(서울로) 실제 취득을 마쳤을 때는 자산 가격 정산과 금융수수료가 가중되어 브릿지론이 7,170억원 실행 완료되었으며, 평당 도급공사비가 1,100만원/평(+29.4%)으로 확정되며 총사업비가 2조 1,556억원(+40.1%)으로 늘어남.
                                    </div>
                                </div>
                            </div>

                            {/* Phase 4 */}
                            <div className="flex flex-col gap-[8px]">
                                <div className="text-[15px] font-bold text-[#E5E5E5] tracking-tight">Phase 4. 본 PF 지연 및 3차 B/L 연장 <span className="text-[#86868B] font-medium ml-1">(2025년 10월 리스크심의)</span></div>
                                <div className="flex flex-col gap-[4px]">
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">시장경색에 따른 기동불가 상태:</span> 
                                        시공사의 무거운 도급 조건 책임준공 확약 거부와 주요 책임임차인(삼성물산)의 내부 의결 지연으로 본 PF 1.95조원 모집에 실패.
                                    </div>
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">기존 브릿지 3개월 연장:</span> 
                                        본 PF 대환 시간을 추가로 벌기 위해 기존 7,170억원의 대출 만기를 2026년 1월 17일까지 3개월 연장하는 임시조치 기표.
                                    </div>
                                </div>
                            </div>

                            {/* Phase 5 */}
                            <div className="flex flex-col gap-[8px]">
                                <div className="text-[15px] font-bold text-[#E5E5E5] tracking-tight">Phase 5. EOD 발생 및 리파이낸싱 <span className="text-[#86868B] font-medium ml-1">(2026년 01월~05월 현재)</span></div>
                                <div className="flex flex-col gap-[4px]">
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">연체이자 reserve 소진과 EOD 돌발:</span> 
                                        4차 연장 협상 중, 후취이자 유보 재원이 바닥나자 특정 대주가 연장 거부권을 무기로 디폴트를 전격 선언하며 2026년 1월 20일 기한이익상실(EOD) 현실화.
                                    </div>
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">EOD Rescue Capital:</span> 
                                        공매 처분을 막기 위해 이지스자산운용은 부동산펀드 421호에 C-1종 우선수익권을 긴급 개설하여 고유재원 유치. 시행사인 YD816PFV에 총 140억원의 후순위 주주대여를 단행해 밀린 연체이자를 정산 치유.
                                    </div>
                                    <div className="text-[14px] text-[#A1A1AA] leading-[22px] tracking-tight">
                                        <span className="font-semibold text-[#c3c2b7] mr-1">리파이낸싱 완료 & 통합 PF 전향:</span> 
                                        기존 대주를 정리하는 7,970억원 규모의 신규 대환 리파이낸싱 구조 확립. 소노(SONO)그룹의 자금보충 연동 후순위 Tr.D(700억) 신용보강. 평당 공사비 1,281만원(+50.7%)으로 상승. 힐튼 재개발사업과 통합PF로 전반적 사업구조 안정화하는 방안 검토 중.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Architectural Info Box */}
                <div className="w-full flex gap-[20px] mb-[20px]">
                    {/* Left Column (Image) */}
                    <div className="w-[450px] h-[452px] relative rounded-[32px] overflow-hidden group">
                        <img src={`${import.meta.env.BASE_URL}iotaseoul2.webp`} alt="IOTA Seoul" className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.03]" />
                        
                        {/* Premium Inner Overlay Stroke */}
                        <div className="absolute inset-0 rounded-[32px] border border-white/15 pointer-events-none z-10 transition-colors duration-700 group-hover:border-white/25"></div>
                        
                        {/* Bottom Center Pill */}
                        <div 
                            onClick={(e) => e.preventDefault()}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-[14px] py-[6px] rounded-[6px] bg-black/40 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors z-10 shadow-sm whitespace-nowrap group/pill"
                        >
                            <span className="text-[13px] text-white/90 font-medium tracking-tight">CG컷 | 평면도</span>
                            <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/pill:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                콘텐츠 준비중입니다.
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Data Table) */}
                    <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] pt-[24px] pb-[4px] relative flex flex-col h-[452px] overflow-hidden">
                        
                        {/* Architecture Overview Link */}
                        <div 
                            onClick={(e) => e.preventDefault()}
                            className="absolute top-[24px] right-[32px] text-[14px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group/link z-10"
                        >
                            <span>건축개요 전체보기</span>
                            <svg className="w-[12px] h-[12px] ml-1 text-[#666] group-hover/link:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                            <div className="absolute top-[100%] right-0 mt-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                콘텐츠 준비중입니다.
                            </div>
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
                            <div onClick={() => setShowSalesKitModal(true)} className="w-full h-[32px] rounded-[8px] border border-[#444] bg-transparent flex items-center justify-center cursor-pointer hover:bg-[#333] transition-colors">
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
                                <a href="https://iotaseoul.site/#section4" target="_blank" rel="noopener noreferrer" className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">그리스 숫자로 10을 의미하는 단어 'IOTA'는 모든 수를 포함하는 통합의 수 '10'을 뜻합니다.</a>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">자산 포지셔닝</span>
                                <span onClick={() => { navigate(`/platform/iotaseoul/workspace/digital?card=01`); }} className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">City of Well Life, The New Heritage of Seoul, 호텔 Social Sanctuary</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">공간 프로그램</span>
                                <span onClick={() => { navigate(`/platform/iotaseoul/workspace/digital?card=02`); }} className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">라운지, 웰니스, 갤러리, 오피스/호텔/리테일 통합 경험, 주요 POI</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">테크 솔루션</span>
                                <span onClick={() => { navigate(`/platform/iotaseoul/workspace/digital?card=04`); }} className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">Building OS 구성, AI Ready Office, 기술 도입 범위와 기대효과 검토</span>
                            </div>
                            <div className="flex items-start">
                                <span className="w-[160px] shrink-0 text-[14px] font-bold text-[#86868B] mt-[1px]">맴버십 서비스</span>
                                <span onClick={() => { navigate(`/platform/iotaseoul/workspace/digital?card=07`); }} className="text-[15px] font-medium text-[#c3c2b7] tracking-tight leading-[22px] hover:text-[#fbf167] cursor-pointer transition-colors">Tenant Membership, 프리미엄 멤버십, 각종 서비스 프로그램</span>
                            </div>


                        </div>

                        {/* Footer Section restricted strictly to the right side */}
                        <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[32px] gap-[24px] shrink-0">
                            <div className="flex items-center gap-[12px]">
                                <span className="text-[13px] font-bold text-[#86868B]">브랜드 담당</span>
                                <span onClick={() => { navigate(`/platform/iotaseoul/workspace/digital`); }} className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">공간솔루션센터</span>
                            </div>
                            <div className="w-[1px] h-[14px] bg-[#555]"></div>
                            <div className="flex items-center gap-[12px]">
                                <span className="text-[13px] font-bold text-[#86868B]">Partnership</span>
                                <span className="text-[14px] font-bold text-[#E5E5E5]">TBD</span>
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
                            <div 
                                onClick={() => {
                                    const base = import.meta.env.BASE_URL;
                                    const url = base.endsWith('/') ? `${base}platform/iotaseoul/workspace/archive?workspace=marketing` : `${base}/platform/iotaseoul/workspace/archive?workspace=marketing`;
                                    window.open(url, '_blank', 'noopener,noreferrer');
                                }}
                                className="text-[15px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group tracking-tight"
                            >
                                <span>히스토리 전체보기</span>
                                <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Content Rows */}
                        <div className="flex flex-col gap-[8px]">
                            {marketingTasks.map((task, idx) => (
                                <div key={idx} className="text-[15px] leading-[22px]">
                                    <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">[{task.status || '상태없음'}]</span>
                                    <span onClick={() => {
                                        const base = import.meta.env.BASE_URL;
                                        navigate('/platform/iotaseoul/workspace/marketing');
                                    }} className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                        {task.task_name || '제목없음'} 
                                    </span>
                                    <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                    <span onClick={() => {
                                        const base = import.meta.env.BASE_URL;
                                        navigate('/platform/iotaseoul/workspace/marketing');
                                    }} className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                        {task.company_name || '내부업무'}
                                    </span>
                                    <span className="text-[#666] mx-[8px]">ㅣ</span> 
                                    <span onClick={() => {
                                        const base = import.meta.env.BASE_URL;
                                        navigate('/platform/iotaseoul/workspace/marketing');
                                    }} className="text-[#E5E5E5] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                        {task.next_action || '-'}
                                    </span>
                                </div>
                            ))}
                            {marketingTasks.length === 0 && (
                                <div className="text-[15px] leading-[22px] text-[#86868B]">
                                    등록된 마케팅 Task가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[30px] gap-[24px] shrink-0">
                        <div className="flex items-center gap-[12px]">
                            <span className="text-[13px] font-bold text-[#86868B]">기업세일즈 담당</span>
                            <span onClick={() => {
                                const base = import.meta.env.BASE_URL;
                                navigate('/platform/iotaseoul/workspace/marketing');
                            }} className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">기업마케팅센터</span>
                        </div>
                        <div className="w-[1px] h-[14px] bg-[#555]"></div>
                        <div className="flex items-center gap-[12px]">
                            <span className="text-[13px] font-bold text-[#86868B]">Partnership</span>
                            <span className="text-[14px] font-bold text-[#E5E5E5]">PwC, TBD</span>
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
                                <div className="text-[15px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group tracking-tight -mr-[9px] relative">
                                    <span>마케팅 내역 전체보기</span>
                                    <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="absolute top-[100%] right-0 mt-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                        콘텐츠 준비중입니다.
                                    </div>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="flex flex-col gap-[8px]">
                                <div className="text-[15px] leading-[22px]">
                                    <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">[자체생산]</span>
                                    <a href="https://iotaseoul.site/#news" target="_blank" rel="noopener noreferrer" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                        Design Presentation by Luke Fox (Interview 영상)
                                    </a>
                                </div>
                                <div className="text-[15px] leading-[22px]">
                                    <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">[기획기사]</span>
                                    <a href="https://www.asiae.co.kr/article/2025072816532155944" target="_blank" rel="noopener noreferrer" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                        AI시대 '서울의 지식 허브' 떠오르는 6개 핵심 지역은
                                    </a>
                                </div>
                                <div className="text-[15px] leading-[22px]">
                                    <span className="text-[#86868B] font-medium mr-[6px] tracking-tight">[기획기사]</span>
                                    <a href="https://marketin.edaily.co.kr/News/Read?newsId=01505526642170560" target="_blank" rel="noopener noreferrer" className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] cursor-pointer transition-colors">
                                        '이오타 서울' AI 시대 오피스 공간 변화 '선두' 달린다
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="w-full h-[54px] border-t border-[#444]/50 flex items-center pl-[30px] shrink-0">
                            <span className="text-[13px] font-bold text-[#86868B] mr-[12px]">마케팅 담당</span>
                            <span onClick={() => {
                                const base = import.meta.env.BASE_URL;
                                navigate('/platform/iotaseoul/workspace/marketing');
                            }} className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">기업마케팅센터</span>
                        </div>
                    </div>

                    {/* Right Column Strategy: Placemaking */}
                    <div className="flex-1 flex flex-col">
                        {/* Body */}
                        <div className="pl-[30px] pr-[32px] pt-[28px] pb-[27px] flex flex-col flex-1 relative">
                            {/* Title */}
                            <div className="flex items-center justify-between w-full mb-[14px]">
                                <span className="text-[14px] font-bold text-[#86868B] tracking-tight">Placemaking</span>
                                <div className="text-[15px] text-[#86868B] cursor-pointer hover:text-[#E5E5E5] transition-colors font-medium flex items-center group tracking-tight relative">
                                    <span>히스토리 전체보기</span>
                                    <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover:text-[#A1A1AA] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="absolute top-[100%] right-0 mt-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                        콘텐츠 준비중입니다.
                                    </div>
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
                            <span onClick={() => {
                                const base = import.meta.env.BASE_URL;
                                navigate('/platform/iotaseoul/workspace/marketing');
                            }} className="text-[14px] font-bold text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors">공간솔루션센터</span>
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
                                            <div className="relative inline-block group/link cursor-pointer">
                                                <span onClick={(e) => e.preventDefault()} className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] transition-colors">
                                                    {item.highlight ? <span className="font-bold text-[#E5E5E5] group-hover/link:text-[#fbf167] transition-colors">{item.highlight} </span> : null}
                                                    {item.value}
                                                </span>
                                                <div className="absolute bottom-[100%] left-0 mb-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                                    콘텐츠 준비중입니다.
                                                </div>
                                            </div>
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
                                            <div className="relative inline-block group/link cursor-pointer">
                                                <span onClick={(e) => e.preventDefault()} className="text-[#c3c2b7] font-medium tracking-tight hover:text-[#fbf167] transition-colors">
                                                    {item.value}
                                                </span>
                                                <div className="absolute bottom-[100%] left-0 mb-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                                    콘텐츠 준비중입니다.
                                                </div>
                                            </div>
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
                                <span className="text-[14px] font-bold text-[#E5E5E5]">이수정</span>
                                <span className="text-[14px] font-bold text-[#E5E5E5]">김대익</span>
                            </div>
                        </div>
                        <div className="w-[1px] h-[14px] bg-[#555]"></div>
                        <div className="flex items-center gap-[12px]">
                            <span className="text-[13px] font-bold text-[#86868B]">Partnership</span>
                            <div className="flex items-center gap-[8px]">
                                <span className="text-[14px] font-bold text-[#E5E5E5]">dA</span>
                                <span className="text-[14px] font-bold text-[#E5E5E5]">어패스리질리언스</span>
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

                        {/* Text List */}
                        <div className="flex flex-col w-full">
                            {researchInsights.map((item, index) => (
                                <div key={item.id} className={`w-full ${index === 0 ? 'pb-[20px]' : index === researchInsights.length - 1 ? 'pt-[20px] pb-[4px] border-t border-[#444]/50' : 'py-[20px] border-t border-[#444]/50'}`}>
                                    <a 
                                        href={item.url} 
                                        onClick={(e) => e.preventDefault()}
                                        className="text-[20px] font-medium text-[#E5E5E5] hover:text-[#fbf167] transition-colors cursor-pointer flex items-center tracking-tight relative w-fit group/link"
                                    >
                                        <span className={`mr-[14px] text-[22px] grayscale opacity-70 ${item.is_bright ? 'brightness-125' : ''}`}>{item.icon}</span>
                                        {item.title}
                                        <div className="absolute top-[100%] left-0 mt-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/link:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                            콘텐츠 준비중입니다.
                                        </div>
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
                    </div>

                    {/* Data Box */}
                    <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[32px] overflow-hidden px-[32px] pt-[24px] pb-[32px] flex flex-col h-[360px]">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between w-full pb-[24px]">
                            <span className="text-[26px] font-bold text-[#E5E5E5] tracking-tight">{data.title}</span>
                            <div 
                                onClick={(e) => e.preventDefault()}
                                className="flex items-center text-[#86868B] cursor-pointer hover:text-[#fbf167] transition-colors group/link2 relative"
                            >
                                <span className="text-[13px] font-medium tracking-tight">IOTA Soul 2 816과 비교하기</span>
                                <svg className="w-[12px] h-[12px] ml-[4px] text-[#666] group-hover/link2:text-[#fbf167] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                </svg>
                                <div className="absolute top-[100%] right-0 mt-2 px-3 py-1.5 bg-[#333] text-[#E5E5E5] text-[12px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover/link2:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg border border-[#444]">
                                    콘텐츠 준비중입니다.
                                </div>
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

                {/* PF Schedule Modal */}
                {showPfScheduleModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setShowPfScheduleModal(false)}>
                        <div className="relative max-w-[90vw] max-h-[90vh] rounded-[24px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-[20px] right-[20px] w-[40px] h-[40px] rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center cursor-pointer transition-colors z-10" onClick={() => setShowPfScheduleModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </div>
                            <img src={`${import.meta.env.BASE_URL}pf-schedule.webp`} alt="통합PF 스케줄" className="w-auto h-auto max-w-full max-h-[90vh] object-contain block" />
                        </div>
                    </div>
                )}

                {/* Sales Kit Modal */}
                {showSalesKitModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-[#1D1D1F] border border-[#3C3C3C] w-full max-w-[420px] rounded-[24px] p-8 shadow-2xl relative">
                            <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                            <h3 className="text-[20px] font-bold text-white mb-3 tracking-tight text-center">Sales kit 요청</h3>
                            <p className="text-[15px] font-medium text-[#A1A1AA] text-center leading-relaxed mb-8 break-keep">
                                기업마케팅 워크스페이스의 협업게시판을 통해<br/>요청해주시기 바랍니다.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => {
                                        navigate(`/platform/iotaseoul/workspace/marketing`);
                                    }} 
                                    className="w-full py-3.5 rounded-[12px] bg-[#0071E3] text-white font-semibold text-[15px] hover:bg-[#0077ED] transition-colors cursor-pointer tracking-tight"
                                >
                                    기업마케팅 워크스페이스 가기
                                </button>
                                <button 
                                    onClick={() => setShowSalesKitModal(false)} 
                                    className="w-full py-3.5 rounded-[12px] bg-[#2C2C2E] text-white font-semibold text-[15px] hover:bg-[#3A3A3C] transition-colors cursor-pointer tracking-tight"
                                >
                                    닫기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
    );
}
