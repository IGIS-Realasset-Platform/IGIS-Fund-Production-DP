import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function IotaLeftNav({ isCore }) {
    const { isLightMode, toggleTheme } = useTheme();
    const [fakeLight, setFakeLight] = useState(false);

    const activeLight = isCore ? fakeLight : isLightMode;

    const handleToggle = () => {
        if (isCore) {
            setFakeLight(!fakeLight);
        } else {
            toggleTheme();
        }
    };

    return (
        <div className="w-[275px] h-full bg-[#18181A] dark:bg-[#18181A] border-r border-black/10 dark:border-[#2C2C2E] flex flex-col flex-shrink-0 text-[14px] font-sans text-white transition-colors duration-300">
            
            {/* Top Workspace Header */}
            <div className="w-full flex items-center justify-between px-[15px] pt-[18px] pb-4 border-b border-[#2C2C2E] mb-2">
                <div className="flex flex-col">
                    <span className="font-bold text-[20px] tracking-wide font-inter ml-[5px] text-white transition-colors duration-300 cursor-pointer">
                        IOTA Seoul
                    </span>
                    <span className="text-[12px] text-[#A1A1AA] ml-[6px] mt-0.5">통합 업무수행 워크스페이스</span>
                </div>
            </div>

            {/* Main Menu */}
            <div className="flex-1 overflow-y-auto pb-5 hide-scrollbar flex flex-col px-[9px]">
                
                <div 
                    onClick={() => {
                        window.history.pushState(null, '', window.location.pathname + '?page=system-core');
                        window.dispatchEvent(new Event('popstate'));
                    }}
                    className="flex items-center px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer transition-colors duration-300 mt-2"
                >
                    <svg className="w-4.5 h-4.5 mr-3 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <span className="font-light text-[14px] text-[#A1A1AA]">Global IFPDP 복귀</span>
                </div>

                <div className="mt-6 mb-2 px-2.5">
                    <div className="font-semibold mb-2 text-[12px] text-[#A1A1AA]">Core Vehicles (비히클)</div>
                </div>

                <div className="flex flex-col mt-0.5">
                    <div className="flex items-center justify-between px-2.5 py-2 bg-[#2A2A2A] rounded-md cursor-pointer transition-colors duration-300 border border-[#3A3A3C]">
                        <div className="flex items-center">
                            <svg className="w-4.5 h-4.5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            <span className="font-medium text-[14px] text-white">Iota 1호 리츠 (Tr. A)</span>
                        </div>
                        <svg className="w-3.5 h-3.5 transform rotate-90 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </div>
                    
                    <div className="flex flex-col mt-1 px-2.5 font-normal pl-[42px] gap-3 mt-3 pb-1 text-[#E5E5E5]">
                        <div className="hover:text-white cursor-pointer text-[14px] flex justify-between items-center">
                            <span>대시보드 (System Core)</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="hover:text-white cursor-pointer text-[14px] text-[#A1A1AA]">
                            자본 스택 (Capital Stack)
                        </div>
                        <div className="hover:text-white cursor-pointer text-[14px] text-[#A1A1AA]">
                            이해관계자 (Stakeholders)
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-1.5 transition-colors duration-300">
                    <div className="flex items-center">
                        <svg className="w-4.5 h-4.5 mr-3 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="font-light text-[14px] text-[#A1A1AA]">Iota 2호 리츠 (Tr. B)</span>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-0.5 transition-colors duration-300">
                    <div className="flex items-center">
                        <svg className="w-4.5 h-4.5 mr-3 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="font-light text-[14px] text-[#A1A1AA]">프로젝트 리츠 (PFV)</span>
                    </div>
                </div>

                <div className="mt-8 mb-2 px-2.5">
                    <div className="font-semibold mb-2 text-[12px] text-[#A1A1AA]">Governance & Risk</div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-0.5 transition-colors duration-300">
                    <div className="flex items-center">
                        <svg className="w-4.5 h-4.5 mr-3 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="font-light text-[14px] text-[#A1A1AA]">의사결정 회의록</span>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-0.5 transition-colors duration-300">
                    <div className="flex items-center">
                        <svg className="w-4.5 h-4.5 mr-3 text-[#f87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <span className="font-light text-[14px] text-[#A1A1AA]">Top 10 리스크 관리</span>
                    </div>
                    <div className="bg-[#f87171]/20 text-[#f87171] text-[10px] px-2 py-0.5 rounded-full">3 Open</div>
                </div>

                <div className="flex items-center justify-between px-2.5 py-2 hover:bg-[#2C2C2E] rounded-md cursor-pointer mt-0.5 transition-colors duration-300">
                    <div className="flex items-center">
                        <svg className="w-4.5 h-4.5 mr-3 text-[#A1A1AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="font-light text-[14px] text-[#A1A1AA]">마일스톤 일정 (KPI)</span>
                    </div>
                </div>

            </div>

            {/* Bottom Profile */}
            <div className="px-[15px] pt-4 pb-3 border-t border-[#3A3A3C] w-full flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-3 hover:bg-[#2C2C2E] p-1.5 -ml-1.5 rounded-lg cursor-pointer transition-colors duration-300">
                    <div className="w-10 h-10 rounded-full bg-[#c3c2b7] text-[#1F1F1E] flex items-center justify-center text-[16px] font-bold tracking-tighter -ml-[2px] transition-colors duration-300">
                        JK
                    </div>
                    <div className="flex flex-col">
                        <span className="font-normal text-[14px] leading-tight mb-0.5 text-white transition-colors duration-300">Jeon Kiyoung</span>
                        <span className="text-gray-400 text-[12px] leading-none font-normal transition-colors duration-300">CFT 총괄</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
