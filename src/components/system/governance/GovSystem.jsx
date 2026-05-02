import React from 'react';

export default function GovSystem() {
    const Diagram = () => (
        <div className="w-full flex justify-center mb-[20px] overflow-visible">
            <div className="relative w-[1020px] h-[720px]">
                {/* Lines Layer */}
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {/* PO to Co-PM */}
                    <line x1="510" y1="110" x2="510" y2="150" stroke="#666" strokeWidth="1.5" />
                    
                    {/* Co-PM to Part1 & Part2 */}
                    <line x1="380" y1="190" x2="420" y2="190" stroke="#666" strokeWidth="1.5" />
                    <line x1="600" y1="190" x2="640" y2="190" stroke="#666" strokeWidth="1.5" />

                    {/* Part1, Co-PM, Part2 down to Missions */}
                    <line x1="300" y1="230" x2="300" y2="305" stroke="#666" strokeWidth="1.5" />
                    <polygon points="295,299 305,299 300,305" fill="#666" />
                    
                    <line x1="510" y1="230" x2="510" y2="305" stroke="#666" strokeWidth="1.5" />
                    <polygon points="505,299 515,299 510,305" fill="#666" />
                    
                    <line x1="720" y1="230" x2="720" y2="305" stroke="#666" strokeWidth="1.5" />
                    <polygon points="715,299 725,299 720,305" fill="#666" />

                    {/* Support to Missions */}
                    {[60, 210, 360, 510, 660, 810, 960].map(x => (
                        <g key={x}>
                            <line x1={x} y1="440" x2={x} y2="385" stroke="#666" strokeWidth="1.5" />
                            <polygon points={`${x-5},391 ${x+5},391 ${x},385`} fill="#666" />
                        </g>
                    ))}

                    {/* Large Thick Arrow */}
                    <path d="M 498 540 L 522 540 L 522 575 L 532 575 L 510 595 L 488 575 L 498 575 Z" fill="#FFF" />
                </svg>

                {/* Top Box */}
                <div className="absolute flex flex-col justify-center items-center bg-[#1B1B1B] border border-[#333] rounded-[20px] shadow-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors" style={{ left: 410, top: 0, width: 200, height: 110 }}>
                    <div className="text-[13px] text-[#A1A1AA] mb-0.5 font-medium">PO</div>
                    <div className="text-[20px] text-white font-bold mb-2">이철승</div>
                    <div className="w-[140px] h-px bg-[#333] mb-2"></div>
                    <div className="text-[12px] text-[#777] mb-0.5">Sub PO</div>
                    <div className="text-[14px] text-[#E5E5E5] font-medium tracking-tight">윤관식 정조민</div>
                </div>

                {/* Second Level */}
                <div className="absolute flex flex-col justify-center items-center bg-[#1B1B1B] border border-[#333] rounded-[20px] shadow-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors" style={{ left: 420, top: 150, width: 180, height: 80 }}>
                    <div className="text-[13px] text-[#A1A1AA] mb-0.5 font-medium">Co-PM</div>
                    <div className="text-[18px] text-white font-bold tracking-tight">권순일 강순용</div>
                </div>
                <div className="absolute flex flex-col justify-center items-center bg-[#1B1B1B] border border-[#333] rounded-[20px] shadow-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors" style={{ left: 220, top: 150, width: 160, height: 80 }}>
                    <div className="text-[18px] text-white font-bold">사업1파트</div>
                </div>
                <div className="absolute flex flex-col justify-center items-center bg-[#1B1B1B] border border-[#333] rounded-[20px] shadow-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors" style={{ left: 640, top: 150, width: 160, height: 80 }}>
                    <div className="text-[18px] text-white font-bold">사업2파트</div>
                </div>

                {/* Missions Container */}
                <div className="absolute bg-[#1C212E] border border-[#272E40] rounded-full" style={{ left: 0, top: 290, width: 1020, height: 110 }}></div>

                {/* Missions Inner Boxes */}
                {[
                    { left: 20, title: 'Mission 1', name: 'CFT 거버넌스 수립' },
                    { left: 220, title: 'Mission 2', name: '421 Fund 운용' },
                    { left: 420, title: 'Mission 3', name: 'IOTA1/2 PFV 운영' },
                    { left: 620, title: 'Mission 4', name: 'IPR 사전준비' },
                    { left: 820, title: 'Mission 5', name: '...' },
                ].map((m, i) => (
                    <div key={i} className="absolute flex flex-col justify-center items-center bg-[#252B3B] border border-[#30384D] rounded-[20px] shadow-lg cursor-pointer hover:bg-[#2c354a] transition-colors" style={{ left: m.left, top: 305, width: 180, height: 80 }}>
                        <div className="text-[12px] text-[#9199AB] mb-0.5 font-medium">{m.title}</div>
                        <div className="text-[18px] text-white font-bold whitespace-nowrap">{m.name}</div>
                    </div>
                ))}

                {/* Support Boxes */}
                {[
                    { left: 0, title: '론파이낸스센터', name: '박준호' },
                    { left: 150, title: '개발솔루션센터', name: '홍장군' },
                    { left: 300, title: '기업마케팅센터', name: '김민지' },
                    { left: 450, title: '공간솔루션센터', name: '김현수' },
                    { left: 600, title: '디지털사업그룹', name: '현철호' },
                    { left: 750, title: 'KAM', name: '김행단' },
                    { left: 900, title: '프리츠TF', name: '권순일 윤용택' },
                ].map((s, i) => (
                    <div key={i} className="absolute flex flex-col justify-center items-center bg-[#1B1B1B] border border-[#333] rounded-[20px] shadow-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors px-[4px]" style={{ left: s.left, top: 440, width: 120, height: 80 }}>
                        <div className="text-[11px] text-[#A1A1AA] mb-0.5 whitespace-nowrap tracking-tighter">{s.title}</div>
                        <div className="text-[15px] text-white font-bold whitespace-nowrap tracking-tight">{s.name}</div>
                    </div>
                ))}

                {/* Bottom Text */}
                <div className="absolute w-full flex flex-col items-center justify-center text-center pointer-events-none" style={{ top: 620, left: 0 }}>
                    <div className="text-[26px] font-bold text-white mb-2 tracking-tight">Single Source of Truth</div>
                    <div className="text-[16px] font-bold text-[#E5E5E5] tracking-tight">보고·승인·리스크 로그 통합</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col pt-[77px] pb-[160px] max-w-[1112px] mx-auto">
            <h1 className="w-full max-w-[1112px] mx-auto text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[36px]">IOTA CFT 통합 수행체계</h1>
            
            <Diagram />

            {/* 4대 축 List */}
            <div className="mt-[30px] w-full max-w-[1112px] mx-auto bg-[#1E1E1E] border border-[#3c3c3c] rounded-[32px] pt-[19px] pb-[32px] px-[32px] flex flex-col relative">
                
                <h2 className="text-[18px] font-bold text-white mb-[16px]">4대 미션의 주관 및 실행자</h2>
                <div className="-mx-[32px] w-[calc(100%+64px)] h-px bg-[#333] mb-[24px]"></div>

                {/* 1. 내부 CFT */}
                <div className="flex items-start">
                    <div className="w-[180px] shrink-0">
                        <span className="text-[15px] font-bold text-white">① 내부 CFT</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-[24px]">
                        <div>
                            <span className="block text-[14px] text-[#666] mb-[4px]">주관 (Accountable)</span>
                            <span className="text-[15px] text-white"><span className="font-bold">부문대표</span> (<span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">이철승</span>, CFT 총괄)</span>
                        </div>
                        <div className="-ml-[30px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">실행 (Responsible)</span>
                            <span className="text-[15px] text-[#c3c2b7]"><span className="font-bold">사업2파트</span> <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">강순용</span>(Co-PM:사업)<br/><span className="font-bold">사업1파트</span> <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">권순일</span>(Co-PM:전략)</span>
                        </div>
                        <div className="-ml-[40px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">핵심 산출물</span>
                            <span className="text-[15px] text-[#c3c2b7]">CFT 운영규정 / RACI / 회의체 캘린더</span>
                        </div>
                    </div>
                </div>

                <div className="-mx-[32px] w-[calc(100%+64px)] h-px bg-[#333] my-[24px]"></div>

                {/* 2. 421호 펀드 */}
                <div className="flex items-start">
                    <div className="w-[180px] shrink-0">
                        <span className="text-[15px] font-bold text-white">② 421호 펀드 운용역</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-[24px]">
                        <div>
                            <span className="block text-[14px] text-[#666] mb-[4px]">주관 (Accountable)</span>
                            <span className="text-[15px] text-white font-bold">사업2파트</span>
                        </div>
                        <div className="-ml-[30px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">실행 (Responsible)</span>
                            <span className="text-[15px] text-[#c3c2b7]"><span className="font-bold">KAM·자산관리</span>(<span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">김행단</span> 1파트)<br/>운용지원·자금·회계 라인</span>
                        </div>
                        <div className="-ml-[40px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">핵심 산출물</span>
                            <span className="text-[15px] text-[#c3c2b7]">LP 보고서 / 자본콜 매뉴얼 / 자금집행 SOP</span>
                        </div>
                    </div>
                </div>

                <div className="-mx-[32px] w-[calc(100%+64px)] h-px bg-[#333] my-[24px]"></div>

                {/* 3. PFV 2개 기구 */}
                <div className="flex items-start">
                    <div className="w-[180px] shrink-0">
                        <span className="text-[15px] font-bold text-white">③ PFV 2개 기구</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-[24px]">
                        <div>
                            <span className="block text-[14px] text-[#666] mb-[4px]">주관 (Accountable)</span>
                            <span className="text-[15px] text-white">Iota1(427), Iota2(816)<br/><span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">강순용</span> <span className="font-bold">&</span> <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">권순일</span></span>
                        </div>
                        <div className="-ml-[30px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">실행 (Responsible)</span>
                            <span className="text-[15px] text-[#c3c2b7]"><span className="font-bold">LFC</span> <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">박준호</span>(파이낸싱)<br/><span className="font-bold">개발솔루션</span> <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">홍장군</span>(설계·시공)<br/><span className="font-bold">상품솔루션</span> <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">김현수</span>(상품/기술)<br/><span className="font-bold">EMC</span> <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">김민지</span>(LM 및 기업마케팅)</span>
                        </div>
                        <div className="-ml-[40px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">핵심 산출물</span>
                            <span className="text-[15px] text-[#c3c2b7]">대외 단일창구 매트릭스 / 변경관리 절차</span>
                        </div>
                    </div>
                </div>

                <div className="-mx-[32px] w-[calc(100%+64px)] h-px bg-[#333] my-[24px]"></div>

                {/* 4. IPR 워킹그룹 */}
                <div className="flex items-start">
                    <div className="w-[180px] shrink-0">
                        <span className="text-[15px] font-bold text-white">④ IPR 워킹그룹</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-[24px]">
                        <div>
                            <span className="block text-[14px] text-[#666] mb-[4px]">주관 (Accountable)</span>
                            <span className="text-[15px] text-white"><span className="font-bold">프로젝트리츠 TFT</span><br/><span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">권순일</span>(투자) / <span className="font-bold hover:text-[#fbf167] cursor-pointer transition-colors">윤용택</span>(관리)</span>
                        </div>
                        <div className="-ml-[30px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">실행 (Responsible)</span>
                            <span className="text-[15px] text-[#c3c2b7]">외부 자문(법무·회계·감정)<br/><span className="font-bold">사업1파트</span> + <span className="font-bold">KAM 1파트</span> 인력 차출</span>
                        </div>
                        <div className="-ml-[40px]">
                            <span className="block text-[14px] text-[#666] mb-[4px]">핵심 산출물</span>
                            <span className="text-[15px] text-[#c3c2b7]">Forward Purchase 구조설계서 / 권순약정 초안</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
