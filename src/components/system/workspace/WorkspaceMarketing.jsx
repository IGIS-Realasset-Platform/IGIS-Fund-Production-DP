import React, { useState } from 'react';

export default function WorkspaceMarketing() {
    const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'retention'

    const newPipeline = [
        { no: '001', name: 'Global Tech Co.', industry: 'IT/Platform', status: 'Active', step: 'Contract', space: '20,000평', fi_si: 'FI/SI 혼합', action: '본계약서 조율 (~4/15)' },
        { no: '002', name: '국내 금융지주', industry: 'Finance', status: 'Active', step: 'LOI', space: '10,000평', fi_si: '임차/SI', action: 'LOI 수취, 인테리어 협의' },
        { no: '003', name: '바이오 벤처 연합', industry: 'Bio/Pharma', status: 'Hold', step: 'Targeting', space: '5,000평', fi_si: '단순 임차', action: '초기 탭핑 메일 발송' }
    ];

    const retentionPipeline = [
        { no: 'R01', name: '기존 대기업 A', space: '15,000평', expiry: '2027-12', noc: '135,000원', needs: '분산된 계열사 통합 이전 수요', action: '임원진 미팅 일정 조율' },
        { no: 'R02', name: '외국계 컨설팅', space: '3,000평', expiry: '2026-06', noc: '142,000원', needs: '프리미엄 라운지 및 VIP 동선 확보', action: '업그레이드 제안서 발송' }
    ];

    const actionLog = [
        { date: '2026-04-10', company: 'Global Tech Co.', type: '방문미팅', igis: '<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김민지</span>, <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">고아라</span>', opp: '부사장(CFO)', result: '렌트프리 3개월 합의, 계약서 초안 법무 검토 요청' },
        { date: '2026-04-08', company: '국내 금융지주', type: '화상회의', igis: '<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">고아라</span>', opp: '총무팀장', result: '사옥 이전 TF 구성 완료 확인, LOI 발송 예정' }
    ];

    return (
        <div className="w-full flex-1 flex flex-col pt-[77px] pb-[60px] max-w-[1200px] mx-auto">
            <div className="flex justify-between items-end mb-[36px]">
                <div>
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">기업마케팅 Workspace</h1>
                    <p className="text-[15px] text-[#86868B]">CMC Workflow / 신규 파이프라인 및 기존 임차사 Retention 관리</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-[#292928] border border-[#3c3c3c] text-[#E5E5E5] rounded-[12px] text-[13px] font-bold hover:bg-[#333] transition-colors">필터</button>
                    <button className="px-4 py-2 bg-[#fbf167] text-black rounded-[12px] text-[13px] font-bold hover:bg-[#e6dc50] transition-colors">+ 신규 등록</button>
                </div>
            </div>
            
            {/* 1. 주간 플래닝 칸반 */}
            <h2 className="text-[18px] font-bold text-white mb-[16px]">주간 플래닝 보드 (Weekly Sprints)</h2>
            <div className="grid grid-cols-3 gap-[20px] mb-[40px]">
                {/* 이번 주 버킷 */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[20px] flex flex-col">
                    <div className="flex justify-between items-center mb-[16px] pb-3 border-b border-[#333]">
                        <span className="text-[15px] font-bold text-[#E5E5E5]">이번 주 액션</span>
                        <span className="px-2 py-0.5 bg-[#e11d48]/20 text-[#e11d48] rounded text-[12px] font-bold">3 Tasks</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="bg-[#292928] border border-[#3c3c3c] p-3 rounded-[12px] hover:border-[#555] cursor-pointer">
                            <span className="text-[12px] text-[#86868B] block mb-1">Global Tech Co.</span>
                            <span className="text-[14px] text-white font-medium">본계약서 조율 및 법무 리뷰</span>
                        </div>
                        <div className="bg-[#292928] border border-[#3c3c3c] p-3 rounded-[12px] hover:border-[#555] cursor-pointer">
                            <span className="text-[12px] text-[#86868B] block mb-1">국내 금융지주</span>
                            <span className="text-[14px] text-white font-medium">인테리어 공사비 지원 한도 협의</span>
                        </div>
                        <div className="bg-[#292928] border border-[#3c3c3c] p-3 rounded-[12px] hover:border-[#555] cursor-pointer">
                            <span className="text-[12px] text-[#86868B] block mb-1">기존 대기업 A</span>
                            <span className="text-[14px] text-white font-medium">임원진 현장 투어 준비</span>
                        </div>
                    </div>
                </div>

                {/* 다음 주 버킷 */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[20px] flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-[16px] pb-3 border-b border-[#333]">
                        <span className="text-[15px] font-bold text-[#A1A1AA]">다음 주 예정</span>
                        <span className="px-2 py-0.5 bg-[#222] text-[#86868B] rounded text-[12px] font-bold">2 Tasks</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="bg-[#222] border border-[#333] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">바이오 벤처 연합</span>
                            <span className="text-[14px] text-[#A1A1AA] font-medium">티저 발송 및 피드백 콜</span>
                        </div>
                        <div className="bg-[#222] border border-[#333] p-3 rounded-[12px]">
                            <span className="text-[12px] text-[#666] block mb-1">외국계 컨설팅</span>
                            <span className="text-[14px] text-[#A1A1AA] font-medium">VIP 동선 시뮬레이션 보고</span>
                        </div>
                    </div>
                </div>

                {/* 성과 / Progress */}
                <div className="bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[24px] flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#fbf167" strokeWidth="1"><path d="M12 20V10M18 20V4M6 20v-4"></path></svg>
                    </div>
                    <span className="text-[14px] text-[#86868B] mb-2 relative z-10">목표 임차율 달성도</span>
                    <div className="flex items-end gap-2 mb-4 relative z-10">
                        <h3 className="text-[48px] font-black text-white leading-none">68<span className="text-[24px] text-[#A1A1AA]">%</span></h3>
                    </div>
                    <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden relative z-10">
                        <div className="h-full bg-gradient-to-r from-[#d97706] to-[#fbf167] rounded-full w-[68%]"></div>
                    </div>
                    <span className="text-[13px] text-[#86868B] mt-3 relative z-10">Target: 85% (by Q3)</span>
                </div>
            </div>

            {/* 2. 파이프라인 (Master DB) */}
            <div className="flex items-center gap-6 mb-[20px]">
                <h2 
                    className={`text-[18px] font-bold cursor-pointer transition-colors ${activeTab === 'pipeline' ? 'text-white border-b-2 border-[#fbf167] pb-1' : 'text-[#666] hover:text-[#A1A1AA]'}`}
                    onClick={() => setActiveTab('pipeline')}
                >
                    신규 파이프라인
                </h2>
                <h2 
                    className={`text-[18px] font-bold cursor-pointer transition-colors ${activeTab === 'retention' ? 'text-white border-b-2 border-[#fbf167] pb-1' : 'text-[#666] hover:text-[#A1A1AA]'}`}
                    onClick={() => setActiveTab('retention')}
                >
                    기존 임차사 Retention
                </h2>
            </div>
            
            <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] overflow-hidden mb-[40px]">
                <table className="w-full text-left">
                    <thead className="bg-[#222]">
                        {activeTab === 'pipeline' ? (
                            <tr>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#555] border-b border-[#333]">No.</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">타겟 기업명</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">진행 단계</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">면적</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">FI/SI 구분</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">Next Action</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#555] border-b border-[#333]">No.</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">임차사명</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">계약 만료</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">eNOC</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">Needs / 페인포인트</th>
                                <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">Next Action</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {activeTab === 'pipeline' ? newPipeline.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#292928] transition-colors">
                                <td className="px-[20px] py-[16px] text-[13px] font-bold text-[#555]">{row.no}</td>
                                <td className="px-[20px] py-[16px] text-[15px] font-bold text-white">{row.name}</td>
                                <td className="px-[20px] py-[16px]">
                                    <span className={`px-2 py-1 rounded text-[12px] font-bold border ${row.step === 'Contract' ? 'bg-[#059669]/20 text-[#34d399] border-[#059669]/30' : row.step === 'LOI' ? 'bg-[#d97706]/20 text-[#fbf167] border-[#d97706]/30' : 'bg-[#4b5563]/20 text-[#9ca3af] border-[#4b5563]/30'}`}>
                                        {row.step}
                                    </span>
                                </td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.space}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.fi_si}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#E5E5E5]">{row.action}</td>
                            </tr>
                        )) : retentionPipeline.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#292928] transition-colors">
                                <td className="px-[20px] py-[16px] text-[13px] font-bold text-[#555]">{row.no}</td>
                                <td className="px-[20px] py-[16px] text-[15px] font-bold text-white">{row.name}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.expiry}</td>
                                <td className="px-[20px] py-[16px] text-[14px] font-medium text-[#fbf167]">{row.noc}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.needs}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#E5E5E5]">{row.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 3. Action Log */}
            <h2 className="text-[18px] font-bold text-white mb-[16px]">최근 접촉 이력 (Action Log)</h2>
            <div className="flex flex-col gap-3">
                {actionLog.map((log, idx) => (
                    <div key={idx} className="bg-[#292928] border border-[#3c3c3c] rounded-[16px] p-[20px] flex items-start hover:border-[#555] transition-colors">
                        <div className="w-[120px] pt-1">
                            <span className="text-[13px] text-[#86868B] font-medium">{log.date}</span>
                        </div>
                        <div className="w-[180px]">
                            <span className="text-[15px] font-bold text-white block mb-1">{log.company}</span>
                            <span className="text-[12px] px-2 py-0.5 bg-[#222] border border-[#333] text-[#A1A1AA] rounded">{log.type}</span>
                        </div>
                        <div className="flex-1 px-4 border-l border-[#333]">
                            <div className="flex gap-4 mb-2">
                                <span className="text-[13px] text-[#666]">이지스: <span className="text-[#A1A1AA]" dangerouslySetInnerHTML={{ __html: log.igis }}></span></span>
                                <span className="text-[13px] text-[#666]">상대방: <span className="text-[#A1A1AA]">{log.opp}</span></span>
                            </div>
                            <p className="text-[14px] text-[#E5E5E5] leading-[22px]">{log.result}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
