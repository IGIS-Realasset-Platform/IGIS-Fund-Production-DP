import React, { useState } from 'react';

export default function WorkspaceMarketing() {
    const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'retention'

    // Real Data from CMC Workflow Test
    const pipelineData = [
        { no: 'P01', name: 'SK계열사 통합 이전 제안', target: 'SK', status: '자료 준비', priority: '상', dueDate: '2026-04-16', action: '안지하 이사님 소개로 CHM 1차 미팅' },
        { no: 'P02', name: 'LG전자 지주 제안 준비', target: 'LG', status: '제안 진행', priority: '상', dueDate: '2026-04-15', action: 'LG전자 지주 제안안 DC 및 오피스 세부안 준비' },
        { no: 'P03', name: 'Semifive 3차 미팅', target: 'Semifive', status: '제안 진행', priority: '상', dueDate: '2026-04-15', action: '인테리어 지원 세부 사항 협의 및 IT팀 미팅' },
        { no: 'P04', name: 'PwC 킥오프 자료 준비', target: 'PwC', status: '자료 준비', priority: '상', dueDate: '2026-04-13', action: '이오타 서울 기업군 및 현대차 새만금 컨택 논의' },
        { no: 'P05', name: '새만금 현대차 프로젝트', target: 'Hyundai Motor', status: '아이데이션', priority: '상', dueDate: '2026-04-17', action: '현대차 프로젝트 관련 스터디' },
        { no: 'P06', name: 'EMC 소개 자료 작성', target: '내부', status: '자료 준비', priority: '중', dueDate: '2026-04-17', action: '1차본 완성, 보완 작업' }
    ];

    const tasksThisWeek = [
        { company: 'PwC삼일회계법인', action: '킥오프 미팅 통한 이오타 서울 임차기업 리스트업 및 현대차 새만금 연계 검토' },
        { company: '삼성증권PB', action: '타임워크 신도림 계약서 검토 단계, 타임워크 분당 양사 연결' }
    ];

    const tasksNextWeek = [
        { company: '사람인', action: '사람인 사이트 하위 메뉴에 임차 정보 확인 및 제안서 신규 업로드 요청' },
        { company: '알스퀘어', action: '알스퀘어 TR DB 구축형 활용 가능 여부 협의' }
    ];

    const actionLog = [
        { date: '2026-04-11', company: 'PwC삼일회계법인', type: '미팅진행', igis: '<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">박성진 부대표</span>', opp: 'PwC 담당자', result: '킥오프 미팅 완료, 이오타 서울 및 새만금 연계 방안 1차 논의' },
        { date: '2026-04-10', company: '삼성증권PB', type: '전화협의', igis: '<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김민지</span>', opp: '노혜란 지점장', result: '타임워크 신도림 계약서 검토, 분당 양사 연결 브리핑 진행' }
    ];

    return (
        <div className="w-full flex-1 flex flex-col pt-[77px] pb-[60px] max-w-[1200px] mx-auto">
            {/* Header Metadata */}
            <div className="w-full flex justify-between items-end mb-[36px]">
                <div>
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">기업마케팅 Workspace</h1>
                    <p className="text-[15px] text-[#86868B]">기업마케팅센터 (CMC) 업무 프로그레스 및 기업마케팅 DB</p>
                </div>
                
                <div className="flex items-center h-[48px] border border-[#333] rounded-[16px] bg-[#1A1A1A] px-2">
                    <div className="flex flex-col items-center justify-center h-full px-[16px]">
                        <span className="text-[12px] text-[#666] font-normal -mb-[2px] font-['Inter']">Lead</span>
                        <span className="text-[15px] font-bold text-[#E5E5E5] tracking-tight"><span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김민지</span></span>
                    </div>
                    <div className="w-px h-[24px] bg-[#333]"></div>
                    <div className="flex flex-col items-center justify-center h-full px-[16px]">
                        <span className="text-[12px] text-[#666] font-normal -mb-[2px] font-['Inter']">Members</span>
                        <span className="text-[15px] font-bold text-[#A1A1AA] tracking-tight">4명</span>
                    </div>
                    <div className="w-px h-[24px] bg-[#333]"></div>
                    <div className="flex flex-col items-center justify-center h-full px-[16px]">
                        <span className="text-[12px] text-[#666] font-normal -mb-[2px] font-['Inter']">Target</span>
                        <span className="text-[15px] font-bold text-[#fbf167] tracking-tight">기업 고객 발굴 및 관리</span>
                    </div>
                </div>
            </div>
            
            {/* 1. 주간 플래닝 칸반 */}
            <h2 className="text-[18px] font-bold text-white mb-[16px]">주간 플래닝 보드 (Weekly Sprints)</h2>
            <div className="grid grid-cols-3 gap-[20px] mb-[40px]">
                {/* 이번 주 버킷 */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[20px] flex flex-col">
                    <div className="flex justify-between items-center mb-[16px] pb-3 border-b border-[#333]">
                        <span className="text-[15px] font-bold text-[#E5E5E5]">이번 주 액션</span>
                        <span className="px-2 py-0.5 bg-[#e11d48]/20 text-[#e11d48] rounded text-[12px] font-bold">{tasksThisWeek.length} Tasks</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {tasksThisWeek.map((task, idx) => (
                            <div key={idx} className="bg-[#292928] border border-[#3c3c3c] p-3 rounded-[12px] hover:border-[#555] cursor-pointer">
                                <span className="text-[12px] text-[#86868B] block mb-1">{task.company}</span>
                                <span className="text-[14px] text-white font-medium line-clamp-2 leading-tight">{task.action}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 다음 주 버킷 */}
                <div className="bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[20px] flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between items-center mb-[16px] pb-3 border-b border-[#333]">
                        <span className="text-[15px] font-bold text-[#A1A1AA]">다음 주 예정</span>
                        <span className="px-2 py-0.5 bg-[#222] text-[#86868B] rounded text-[12px] font-bold">{tasksNextWeek.length} Tasks</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {tasksNextWeek.map((task, idx) => (
                            <div key={idx} className="bg-[#222] border border-[#333] p-3 rounded-[12px]">
                                <span className="text-[12px] text-[#666] block mb-1">{task.company}</span>
                                <span className="text-[14px] text-[#A1A1AA] font-medium line-clamp-2 leading-tight">{task.action}</span>
                            </div>
                        ))}
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
                    진행 중인 프로젝트
                </h2>
                <h2 
                    className={`text-[18px] font-bold cursor-pointer transition-colors ${activeTab === 'retention' ? 'text-white border-b-2 border-[#fbf167] pb-1' : 'text-[#666] hover:text-[#A1A1AA]'}`}
                    onClick={() => setActiveTab('retention')}
                >
                    보류 / 완료
                </h2>
            </div>
            
            <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] overflow-hidden mb-[40px]">
                <table className="w-full text-left">
                    <thead className="bg-[#222]">
                        <tr>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#555] border-b border-[#333]">No.</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">프로젝트명</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">대상 기업</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">상태</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">마감일</th>
                            <th className="px-[20px] py-[16px] text-[13px] font-bold text-[#86868B] border-b border-[#333]">Next Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {pipelineData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#292928] transition-colors">
                                <td className="px-[20px] py-[16px] text-[13px] font-bold text-[#555]">{row.no}</td>
                                <td className="px-[20px] py-[16px] text-[15px] font-bold text-white">{row.name}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.target}</td>
                                <td className="px-[20px] py-[16px]">
                                    <span className={`px-2 py-1 rounded text-[12px] font-bold border ${row.status === '제안 진행' ? 'bg-[#059669]/20 text-[#34d399] border-[#059669]/30' : row.status === '자료 준비' ? 'bg-[#d97706]/20 text-[#fbf167] border-[#d97706]/30' : 'bg-[#4b5563]/20 text-[#9ca3af] border-[#4b5563]/30'}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#A1A1AA]">{row.dueDate}</td>
                                <td className="px-[20px] py-[16px] text-[14px] text-[#E5E5E5] line-clamp-1">{row.action}</td>
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
                                <span className="text-[13px] text-[#666]">담당: <span className="text-[#A1A1AA]" dangerouslySetInnerHTML={{ __html: log.igis }}></span></span>
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
