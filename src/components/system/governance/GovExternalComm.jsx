import React from 'react';

export default function GovExternalComm() {
    const rulesData = [
        { partner: '시공사', window: '개발솔루션 <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">홍장군</span>', backup: 'Co-PM <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">권순일</span> / <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">강순용</span>', auth: 'UW 범위 내 자율, UW 외는 PM/CFT 운영위 승인' },
        { partner: '설계사', window: '개발솔루션 설계담당(<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김대익</span>·<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">장성진</span>)', backup: 'PM <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">강순용</span>', auth: 'Alt 결정은 PM 단독, 상품 변경은 SSC 협의' },
        { partner: 'CM/감리', window: '개발솔루션 건설담당', backup: 'PM <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">강순용</span>', auth: '월 1회 정기 보고, 사고 즉시 보고' },
        { partner: '증권사 (PF 주관)', window: 'LFC <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">박준호</span>', backup: 'Co-PM <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">권순일</span> / <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">강순용</span>', auth: '리파이낸싱 옵션 상시 검토, 조건 변경은 운영위' },
        { partner: '대주단 (본PF·통합PF)', window: 'LFC <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">박준호</span>', backup: '운용지원 자금팀', auth: 'Covenants 보드 월간, 위반 시 24시간 내 통지' },
        { partner: '잠재 임차인', window: 'EMC <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김민지</span>', backup: 'KAM 1파트 (운영기 이후)', auth: 'UW 범위 외 임대차는 운영위 결재' },
        { partner: 'LM사 (외주)', window: 'EMC <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">고아라</span>', backup: 'KAM 1파트', auth: '성과 약정 KPI 분기 점검' },
        { partner: '규제 당국·지자체', window: '사업1파트 <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">권순일</span>', backup: '개발솔루션 인허가(<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">이정훈</span>)', auth: 'PFV 재구조화·국토부 협의는 권순일 단독' },
        { partner: 'LP (수익자)', window: 'KAM 1파트 <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김행단</span>', backup: 'CFT 총괄', auth: 'Q&A 단일 채널, 운영위 사전검토 필수' },
        { partner: '외부 법무·회계·감정 (IPR)', window: '프리츠 TFT <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">권순일</span>', backup: 'PM <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">강순용</span> (사실관계 한정)', auth: '자료 외부 반출 시 워터마크·로그' },
    ];

    const esData = [
        { trigger: 'UW 범위 외 일정/예산 변경', actor: 'PM <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">강순용</span>', step1: 'CFT 운영위 임시 소집', final: '부문대표 승인 + LP 통지' },
        { trigger: 'Covenants 위반 가능성', actor: 'LFC <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">박준호</span>', step1: 'PM·KAM·법무 자문 라운드', final: '부문대표 승인 후 대주단 통지' },
        { trigger: '핵심 임차인 LOI 철회', actor: 'EMC <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김민지</span>', step1: 'PM·SSC·KAM 임시 LM 회의', final: 'PM 결정, 영향분석 후 운영위 통지' },
        { trigger: '규제·인허가·소송', actor: '<span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">권순일</span> / <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">이정훈</span>', step1: '외부 송무 자문 + CFT 총괄 검토', final: '부문대표·법무 공동 결정, LP 통지' },
        { trigger: '미디어/평판 이슈', actor: 'PM / CFT 총괄', step1: '부문 커뮤니케이션 (외부 PR 자문)', final: '부문대표 단독 (24시간 내)' },
        { trigger: 'LP 임시 출자/분배 요청', actor: 'KAM <span className="text-[#E5E5E5] hover:text-[#fbf167] cursor-pointer transition-colors hover:underline underline-offset-4 decoration-[#fbf167]/50">김행단</span>', step1: 'LFC·운용지원 검토', final: 'CFT 운영위 승인 → 자금집행' },
    ];

    return (
        <div className="w-full flex-1 flex flex-col pt-[77px] pb-[160px] max-w-[1112px] mx-auto">
            <h1 className="text-[37px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">대외 소통 정책</h1>
            <p className="text-[16px] text-[#86868B] mb-[48px]">외부 파트너로부터의 혼선을 원천 차단하기 위한 단일 창구를 지정하고, 일상의 범위를 넘어서는 주요 사안에 대한 에스컬레이션 라인을 통합 규정합니다.</p>
            
            <h2 className="text-[20px] font-bold text-white mb-[16px]">PFV 단일 창구 운영 원칙</h2>
            <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#222]">
                        <tr>
                            <th className="px-[24px] py-[16px] text-[14px] font-bold text-[#86868B] border-b border-[#333] border-r border-[#333] w-[200px]">외부 파트너</th>
                            <th className="px-[24px] py-[16px] text-[14px] font-bold text-[#fbf167] border-b border-[#333] border-r border-[#333] w-[260px]">1차 단일창구</th>
                            <th className="px-[24px] py-[16px] text-[14px] font-bold text-[#86868B] border-b border-[#333] border-r border-[#333] w-[200px]">백업 창구</th>
                            <th className="px-[24px] py-[16px] text-[14px] font-bold text-[#86868B] border-b border-[#333]">승인 한도 / 주의</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                        {rulesData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-[#292928] transition-colors">
                                <td className="px-[24px] py-[16px] text-[15px] font-bold text-[#E5E5E5] border-r border-[#333] whitespace-nowrap">{row.partner}</td>
                                <td className="px-[24px] py-[16px] text-[15px] font-bold text-[#E5E5E5] border-r border-[#333] whitespace-nowrap" dangerouslySetInnerHTML={{ __html: row.window }}></td>
                                <td className="px-[24px] py-[16px] text-[14px] text-[#A1A1AA] border-r border-[#333]" dangerouslySetInnerHTML={{ __html: row.backup }}></td>
                                <td className="px-[24px] py-[16px] text-[14px] text-[#A1A1AA]">{row.auth}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="w-full h-px bg-[#333] my-[56px]"></div>

            <h2 className="text-[20px] font-bold text-white mb-[16px]">주요 사안 에스컬레이션 라인</h2>
            <div className="flex flex-col gap-3">
                {esData.map((row, idx) => (
                    <div key={idx} className="bg-[#292928] border border-[#3c3c3c] rounded-[16px] p-[20px] flex items-center hover:border-[#555] transition-colors">
                        <div className="w-[280px] pr-4">
                            <span className="block text-[13px] text-[#e11d48] font-bold mb-1">Trigger</span>
                            <span className="text-[15px] font-bold text-white">{row.trigger}</span>
                            <div className="text-[13px] text-[#A1A1AA] mt-1" dangerouslySetInnerHTML={{ __html: row.actor }}></div>
                        </div>
                        
                        <div className="flex-1 flex items-center px-4">
                            <div className="w-[40px] flex justify-center text-[#555]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </div>
                            <div className="flex-1 text-center bg-[#1A1A1A] border border-[#333] rounded-[8px] py-3 px-4">
                                <span className="text-[13px] text-[#86868B] block mb-1">1차 에스컬레이션</span>
                                <span className="text-[14px] text-[#E5E5E5] font-medium">{row.step1}</span>
                            </div>
                            <div className="w-[40px] flex justify-center text-[#555]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </div>
                        </div>

                        <div className="w-[280px] pl-4 text-right">
                            <span className="block text-[13px] text-[#fbf167] font-bold mb-1">Final Decision</span>
                            <span className="text-[15px] font-bold text-white">{row.final}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
