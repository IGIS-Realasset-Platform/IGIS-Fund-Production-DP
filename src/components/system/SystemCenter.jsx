import React from 'react';

export default function SystemCenter() {
    return (
        <div className="flex-1 h-full bg-transparent flex flex-col relative font-sans text-[#E5E5E5] px-6">

            {/* Top Header */}
            <div className="w-full flex justify-between items-start pt-[20px]">
                <div className="flex flex-col">
                    <span className="text-[18px] text-[#A1A1AA] font-normal tracking-tight">
                        프로젝트 상세 / 더케이트윈타워
                    </span>
                </div>
                {/* Changed ... to ··· (middle dots) */}
                <div className="text-[#A1A1AA] hover:text-[#E5E5E5] cursor-pointer pt-0 tracking-[3px] font-black text-[16px]">
                    ···
                </div>
            </div>

            {/* Empty Context Indicator centered */}
            <div className="flex-1 flex justify-center items-center pb-20">
                <span className="text-[40px] text-[#A1A1AA] font-medium tracking-tight">
                    Contents
                </span>
            </div>

        </div>
    );
}
