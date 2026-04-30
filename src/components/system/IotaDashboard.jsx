import React from 'react';

export default function IotaDashboard() {
    return (
        <div className="w-full flex-1 flex flex-col pt-[77px] pb-[60px] max-w-[1200px] mx-auto overflow-y-auto hide-scrollbar">
            {/* Header */}
            <div className="w-full flex justify-between items-end mb-[36px]">
                <div>
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">IOTA Seoul Dashboard</h1>
                    <p className="text-[15px] text-[#86868B]">통합 프로젝트 C-Level 대시보드 및 리스크 모니터링</p>
                </div>
                
                <div className="flex items-center h-[48px] border border-[#333] rounded-[16px] bg-[#1A1A1A] px-2">
                    <div className="flex flex-col items-center justify-center h-full px-[16px]">
                        <span className="text-[12px] text-[#666] font-normal -mb-[2px] font-['Inter']">Date</span>
                        <span className="text-[15px] font-bold text-[#E5E5E5] tracking-tight">2026.04.30</span>
                    </div>
                    <div className="w-px h-[24px] bg-[#333]"></div>
                    <div className="flex flex-col items-center justify-center h-full px-[16px]">
                        <span className="text-[12px] text-[#666] font-normal -mb-[2px] font-['Inter']">Status</span>
                        <span className="text-[15px] font-bold text-[#34d399] tracking-tight">On Track</span>
                    </div>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-3 gap-[24px] mb-[40px]">
                <div className="bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[28px] relative overflow-hidden group hover:border-[#555] transition-colors">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#fbf167]"></div>
                    <h3 className="text-[14px] font-bold text-[#86868B] mb-2">Total Project Cost</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-[40px] font-black text-white leading-none">2.1</span>
                        <span className="text-[18px] text-[#A1A1AA] pb-1 font-bold">조원</span>
                    </div>
                    <p className="text-[13px] text-[#666] mt-3">Iota 1 (1.72조) + Iota 2 (0.38조)</p>
                </div>
                
                <div className="bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[28px] relative overflow-hidden group hover:border-[#555] transition-colors">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#34d399]"></div>
                    <h3 className="text-[14px] font-bold text-[#86868B] mb-2">Overall Progress</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-[40px] font-black text-white leading-none">28.4</span>
                        <span className="text-[18px] text-[#A1A1AA] pb-1 font-bold">%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] h-2 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-[#34d399] w-[28.4%] rounded-full"></div>
                    </div>
                </div>

                <div className="bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[28px] relative overflow-hidden group hover:border-[#555] transition-colors">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#e11d48]"></div>
                    <h3 className="text-[14px] font-bold text-[#86868B] mb-2">Target Leasing (By 2026 Q4)</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-[40px] font-black text-white leading-none">68</span>
                        <span className="text-[18px] text-[#A1A1AA] pb-1 font-bold">%</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] h-2 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-[#e11d48] w-[68%] rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Target Vehicles Overview */}
            <h2 className="text-[20px] font-bold text-white mb-[20px]">Target Vehicles</h2>
            <div className="grid grid-cols-2 gap-[24px] mb-[40px]">
                {/* Iota 1 */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[24px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[18px] font-bold text-white mb-1">Iota 1 (YD427PFV)</h3>
                            <p className="text-[13px] text-[#86868B]">복합상업 및 오피스 개발</p>
                        </div>
                        <span className="px-3 py-1 bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/20 rounded text-[12px] font-bold">건축 공사중</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">PF 규모</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">1조 7,200억</span>
                        </div>
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">공정률</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">32%</span>
                        </div>
                    </div>
                </div>

                {/* Iota 2 */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[24px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[18px] font-bold text-white mb-1">Iota 2 (YD816PFV)</h3>
                            <p className="text-[13px] text-[#86868B]">프리미엄 리테일 및 주거</p>
                        </div>
                        <span className="px-3 py-1 bg-[#fbf167]/10 text-[#fbf167] border border-[#fbf167]/20 rounded text-[12px] font-bold">설계 변경중</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">PF 규모</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">9,633억</span>
                        </div>
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">진행 현황</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">인허가 접수</span>
                        </div>
                    </div>
                </div>

                {/* 421 Fund */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[24px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[18px] font-bold text-white mb-1">421호 모펀드</h3>
                            <p className="text-[13px] text-[#86868B]">Iota 1, 2 에퀴티 통합 운용</p>
                        </div>
                        <span className="px-3 py-1 bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 rounded text-[12px] font-bold">운용중</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">Equity 규모</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">3,090억</span>
                        </div>
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">자본콜</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">85% 완료</span>
                        </div>
                    </div>
                </div>

                {/* IPR */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[24px]">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-[18px] font-bold text-white mb-1">프로젝트 리츠 (IPR)</h3>
                            <p className="text-[13px] text-[#86868B]">운영 수익화 및 자산 유동화</p>
                        </div>
                        <span className="px-3 py-1 bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20 rounded text-[12px] font-bold">사전 준비</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">현 단계</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">Stage 1</span>
                        </div>
                        <div className="bg-[#222] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">목표 인가</span>
                            <span className="text-[15px] font-bold text-[#E5E5E5]">2026.Q4</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Risks */}
            <h2 className="text-[20px] font-bold text-white mb-[20px]">Top Platform Risks</h2>
            <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[24px]">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 bg-[#222] p-4 rounded-[16px] border-l-4 border-[#e11d48]">
                        <span className="text-[12px] font-bold px-2 py-1 bg-[#e11d48]/20 text-[#e11d48] rounded">T1</span>
                        <div className="flex-1">
                            <span className="text-[15px] font-bold text-white block mb-1">Iota 2 (816) 설계 변경에 따른 공기 지연 리스크</span>
                            <span className="text-[13px] text-[#86868B]">관할관청 인허가 접수 완료, 조건부 승인 대비 Alternative Plan 준비 필요</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[13px] text-[#666] block">Owner</span>
                            <span className="text-[14px] text-[#E5E5E5] font-medium">개발관리 (DEV)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-[#222] p-4 rounded-[16px] border-l-4 border-[#fbf167]">
                        <span className="text-[12px] font-bold px-2 py-1 bg-[#d97706]/20 text-[#fbf167] rounded">T2</span>
                        <div className="flex-1">
                            <span className="text-[15px] font-bold text-white block mb-1">주요 대주단 Covenants 모니터링 (Tr.B/C)</span>
                            <span className="text-[13px] text-[#86868B]">11월 금리 롤오버 시점 전, 주요 지표 방어선(LTV) 체크 및 보고서 제출</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[13px] text-[#666] block">Owner</span>
                            <span className="text-[14px] text-[#E5E5E5] font-medium">파이낸싱 (LFC)</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-[#222] p-4 rounded-[16px] border-l-4 border-[#34d399]">
                        <span className="text-[12px] font-bold px-2 py-1 bg-[#059669]/20 text-[#34d399] rounded">T3</span>
                        <div className="flex-1">
                            <span className="text-[15px] font-bold text-white block mb-1">앵커 임차인(LG전자, SK) 협상 장기화</span>
                            <span className="text-[13px] text-[#86868B]">인테리어 공사비 지원 한도 협의 완료, 본계약서 법무 검토 중</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[13px] text-[#666] block">Owner</span>
                            <span className="text-[14px] text-[#E5E5E5] font-medium">기업마케팅 (EMC)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
