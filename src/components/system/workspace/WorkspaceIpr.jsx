import React, { useState } from 'react';
import WorkspaceActivityLog from './WorkspaceActivityLog';

export default function WorkspaceIpr() {
    const [activeTab, setActiveTab] = useState(0);

    return (
                <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto">
            {/* Header & Team Structure */}
            <div className="w-full flex justify-between items-center mb-[40px] gap-[40px]">
                {/* Header Metadata */}
                <div className="shrink-0 max-w-[450px]">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">IPR Working Group</h1>
                    <p className="text-[15px] text-[#86868B] leading-[24px]">이오타 CFT는 프리츠 TFT와의 인터페이스를 ‘IPR 워킹그룹(IPR-WG)’ 형태로 운영합니다.</p>
                </div>
                
                {/* Team Structure */}
                <div className="border border-[#333] rounded-[24px] flex items-center bg-transparent shrink-0 pl-[20px] pr-[18px] py-[10px]">

                    {/* 투자 */}
                    <div className="w-[40px] shrink-0">
                        <span className="text-[13px] font-bold text-[#86868B]">투자</span>
                    </div>
                    <div className="flex items-center gap-[12px] w-[126px] shrink-0">
                        <div className="relative w-[30px] h-[30px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden ml-[2px]">
                            <img src={`${import.meta.env.BASE_URL}권순일.webp`} alt="권순일" className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-white font-bold text-[13px] leading-tight">권순일</span>
                            <span className="text-[#A1A1AA] text-[12px] mt-[1px] leading-tight">사업1파트장</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-2 -ml-[6px]">
                        <span className="text-[#A1A1AA] text-[13px] font-medium leading-none ml-[6px]">사업1파트 실무진</span>
                    </div>

                    {/* Vertical Separator */}
                    <div className="w-px h-[30px] bg-[#333] mx-[20px]"></div>

                    {/* 관리 */}
                    <div className="w-[40px] shrink-0">
                        <span className="text-[13px] font-bold text-[#86868B]">관리</span>
                    </div>
                    <div className="flex items-center gap-[12px] w-[120px] shrink-0">
                        <div className="relative w-[30px] h-[30px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden ml-[2px]">
                            <img src={`${import.meta.env.BASE_URL}윤용택.webp`} alt="윤용택" className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-white font-bold text-[13px] leading-tight">윤용택</span>
                            <span className="text-[#A1A1AA] text-[12px] mt-[1px] leading-tight">사업3파트</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-2 -ml-[6px]">
                        <span className="text-[#A1A1AA] text-[13px] font-medium leading-none ml-[6px]">신규 영입 예정</span>
                    </div>
                </div>
            </div>

            <WorkspaceActivityLog workspaceCode="WS_IPR" workspaceLabel="IPR" />


        </div>
    );
}
