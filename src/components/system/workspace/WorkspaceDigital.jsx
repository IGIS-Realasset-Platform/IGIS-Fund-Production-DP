import React from 'react';

export default function WorkspaceDigital() {
    return (
                <div className="w-full flex-1 flex flex-col pt-[50px] pb-[60px] max-w-[1200px] mx-auto">
            {/* Header & Team Structure */}
            <div className="w-full flex justify-between items-center mb-[40px] gap-[40px]">
                {/* Header Metadata */}
                <div className="shrink-0 max-w-[400px]">
                    <h1 className="text-[36px] font-bold text-white tracking-tight leading-none font-['Inter'] mb-[12px]">상품·디지털</h1>
                    <p className="text-[15px] text-[#86868B] leading-[24px] break-keep">상품 차별화 전략·POC, 테넌트 경험 설계, 디지털 인프라(보안·통신·DC)</p>
                </div>
                
                {/* Team Structure */}
                <div className="border border-[#333] rounded-[24px] flex items-center bg-transparent shrink-0 pl-[20px] pr-[10px] py-[10px]">

                    {/* 공간솔루션 */}
                    <div className="w-[80px] shrink-0">
                        <span className="text-[13px] font-bold text-[#86868B]">공간솔루션</span>
                    </div>
                    <div className="flex items-center gap-[12px] w-[106px] shrink-0">
                        <div className="relative w-[30px] h-[30px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden ml-[2px]">
                            <img src={`${import.meta.env.BASE_URL}김현수.webp`} alt="김현수" className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-white font-bold text-[13px] leading-tight">김현수</span>
                            <span className="text-[#A1A1AA] text-[12px] mt-[1px] leading-tight">센터장</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-2 -ml-[6px]">
                        {["이가현","정수명"].map(name => (
                            <div key={name} className="flex items-center gap-[6px] bg-[#222] border border-[#333] rounded-full pl-[4px] pr-[10px] py-[4px] min-w-[76px]">
                                <div className="w-[21px] h-[21px] shrink-0 rounded-full bg-[#3c3c3c] overflow-hidden">
                                    <img src={`${import.meta.env.BASE_URL}${name}.webp`} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                                </div>
                                <span className="text-[#E5E5E5] text-[12px] font-medium leading-none">{name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Vertical Separator */}
                    <div className="w-px h-[30px] bg-[#333] mx-[20px]"></div>

                    {/* 디지털사업 */}
                    <div className="w-[80px] shrink-0">
                        <span className="text-[13px] font-bold text-[#86868B]">디지털사업</span>
                    </div>
                    <div className="flex items-center gap-[12px] w-[106px] shrink-0">
                        <div className="relative w-[30px] h-[30px] shrink-0 rounded-full bg-[#3c3c3c] flex items-center justify-center overflow-hidden ml-[2px]">
                            <img src={`${import.meta.env.BASE_URL}현철호.webp`} alt="현철호" className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                            <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none"></div>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-white font-bold text-[13px] leading-tight">현철호</span>
                            <span className="text-[#A1A1AA] text-[12px] mt-[1px] leading-tight">그룹장</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-2 -ml-[6px]">
                        {["신민호"].map(name => (
                            <div key={name} className="flex items-center gap-[6px] bg-[#222] border border-[#333] rounded-full pl-[4px] pr-[10px] py-[4px] min-w-[76px]">
                                <div className="w-[21px] h-[21px] shrink-0 rounded-full bg-[#3c3c3c] overflow-hidden">
                                    <img src={`${import.meta.env.BASE_URL}${name}.webp`} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />
                                </div>
                                <span className="text-[#E5E5E5] text-[12px] font-medium leading-none">{name}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            
            {/* Top 3 KPI Cards */}
            <div className="flex w-full gap-[24px] mb-[40px]">
                <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[28px] hover:border-[#555] transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#a855f7]"></div>
                    <h3 className="text-[15px] font-bold text-[#86868B] mb-[12px]">디지털 트윈 적용률</h3>
                    <div className="text-[42px] font-black text-white">45<span className="text-[20px] text-[#A1A1AA]">%</span></div>
                    <div className="w-full bg-[#1A1A1A] h-2 rounded-full mt-4"><div className="h-full bg-[#a855f7] rounded-full w-[45%]"></div></div>
                </div>
                <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[28px] hover:border-[#555] transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#fbf167]"></div>
                    <h3 className="text-[15px] font-bold text-[#86868B] mb-[12px]">PoC 진척도</h3>
                    <div className="text-[42px] font-black text-white">3<span className="text-[16px] font-normal text-[#A1A1AA] ml-2">/ 5 건</span></div>
                    <p className="text-[13px] text-[#A1A1AA] mt-2">출입 보안, 주차 관제 연동 완료</p>
                </div>
                <div className="flex-1 bg-[#292928] border border-[#3c3c3c] rounded-[24px] p-[28px] hover:border-[#555] transition-colors relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[4px] bg-[#34d399]"></div>
                    <h3 className="text-[15px] font-bold text-[#86868B] mb-[12px]">인프라 구축 예산율</h3>
                    <div className="text-[42px] font-black text-white">92<span className="text-[20px] text-[#A1A1AA]">%</span></div>
                    <p className="text-[13px] text-[#A1A1AA] mt-2">정상 예산 내 집행 중</p>
                </div>
            </div>

            <div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] p-[32px] flex flex-col items-center justify-center min-h-[300px]">
                <svg className="w-16 h-16 text-[#444] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <h3 className="text-[18px] font-bold text-white mb-2">스마트 인프라 데이터룸 대기 중</h3>
                <p className="text-[14px] text-[#86868B] text-center max-w-[400px]">디지털 트윈 아키텍처 및 테넌트 앱 POC 결과 보고서가 업로드되면 이곳에 연동됩니다.</p>
            </div>
        </div>
    );
}
