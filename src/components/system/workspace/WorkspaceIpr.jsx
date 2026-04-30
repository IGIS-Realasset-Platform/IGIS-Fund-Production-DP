import React from 'react';

export default function WorkspaceIpr() {
    return (
        <div className="w-full flex-1 flex flex-col pt-[77px] pb-[60px] max-w-[1200px] mx-auto">
            <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">IPR Workspace</h1>
            <p className="text-[15px] text-[#86868B] mb-[36px]">Forward Purchase 권순약정 타임라인 및 밸류에이션</p>
            
            <div className="flex w-full gap-[24px] mb-[40px]">
                <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[32px] hover:border-[#555] transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#fbf167]"></div>
                    <h3 className="text-[16px] font-bold text-[#86868B] mb-[12px]">주요 KPI 달성률</h3>
                    <div className="text-[48px] font-black text-white">0<span className="text-[24px] text-[#A1A1AA]">%</span></div>
                    <div className="w-full bg-[#1A1A1A] h-2 rounded-full mt-4"><div className="h-full bg-[#fbf167] rounded-full w-0 transition-all duration-1000 group-hover:w-[75%]"></div></div>
                </div>
                <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[32px] hover:border-[#555] transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#34d399]"></div>
                    <h3 className="text-[16px] font-bold text-[#86868B] mb-[12px]">현재 Status</h3>
                    <div className="text-[24px] font-bold text-white">정상 진행 중</div>
                    <p className="text-[14px] text-[#A1A1AA] mt-2">지연 이슈 없음</p>
                </div>
                <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[32px] hover:border-[#555] transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#e11d48]"></div>
                    <h3 className="text-[16px] font-bold text-[#86868B] mb-[12px]">Pending Action</h3>
                    <div className="text-[32px] font-black text-white">3<span className="text-[16px] font-normal text-[#A1A1AA] ml-2">건</span></div>
                </div>
            </div>

            <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[32px] flex flex-col items-center justify-center min-h-[300px]">
                <svg className="w-16 h-16 text-[#444] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <h3 className="text-[18px] font-bold text-white mb-2">데이터 연동 대기 중</h3>
                <p className="text-[14px] text-[#86868B] text-center max-w-[400px]">이오타서울 통합 데이터룸에서 IPR 셀의 세부 데이터가 스트리밍되면 이곳에 표시됩니다.</p>
            </div>
        </div>
    );
}
