import React from 'react';

export default function MobileHome({ memberInfo, onNavigateToTab }) {
    return (
        <div className="w-full h-full flex flex-col p-4 overflow-y-auto hide-scrollbar">
            {/* 2x2 KPI Widgets will go here */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06]">
                    <span className="text-[13px] font-medium text-[#86868b]">블로커</span>
                    <span className="text-[28px] font-bold text-red-500 font-['Inter']">0</span>
                </div>
                <div className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06]">
                    <span className="text-[13px] font-medium text-[#86868b]">의사결정</span>
                    <span className="text-[28px] font-bold text-orange-500 font-['Inter']">0</span>
                </div>
                <div className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06]">
                    <span className="text-[13px] font-medium text-[#86868b]">지연/위험</span>
                    <span className="text-[28px] font-bold text-yellow-500 font-['Inter']">0</span>
                </div>
                <div className="bg-[#252525] rounded-[20px] p-4 flex flex-col justify-between h-[100px] border border-white/[0.06]">
                    <span className="text-[13px] font-medium text-[#86868b]">안건대기</span>
                    <span className="text-[28px] font-bold text-blue-500 font-['Inter']">0</span>
                </div>
            </div>

            {/* Quick Actions (Pill Filters) */}
            <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
                <button className="whitespace-nowrap px-4 py-2 rounded-full bg-white/10 text-white text-[13px] font-bold border border-white/20">전체 현황</button>
                <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#252525] text-[#86868b] text-[13px] font-medium border border-white/[0.06]">단발업무</button>
                <button className="whitespace-nowrap px-4 py-2 rounded-full bg-[#252525] text-[#86868b] text-[13px] font-medium border border-white/[0.06]">내 워크스페이스</button>
            </div>

            {/* Today's Tasks List Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[18px] font-bold text-white tracking-tight">전체 현황 목록</h2>
                <button 
                    onClick={() => onNavigateToTab(1)} // 업무 탭으로 이동
                    className="text-[12px] text-[#2997ff] font-medium"
                >
                    전체보기
                </button>
            </div>

            {/* List Cards Placeholder */}
            <div className="flex flex-col gap-3">
                <div className="bg-[#252525] rounded-[16px] p-4 border border-white/[0.06] flex flex-col gap-2">
                    <span className="text-[13px] text-[#86868b]">데이터 연결 중...</span>
                </div>
            </div>
        </div>
    );
}
