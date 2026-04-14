import React from 'react';

export default function SystemRightRAG() {
    return (
        <div className="w-[520px] h-full bg-transparent border-l border-[#2C2C2E] flex flex-col flex-shrink-0 relative font-sans text-[#E5E5E5]">
            
            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto px-[38px] pt-[36px] pb-[180px] hide-scrollbar flex flex-col">
                
                {/* User Bubble - No border, lifted content 10px by modifying mb-12 -> mb-[38px] */}
                <div className="flex justify-end mb-[38px] mt-2">
                    <div className="bg-[#0A0A0A] border-none rounded-[16px] rounded-tr-[4px] px-5 py-4 max-w-[85%] text-[15px] leading-[1.6] text-[#E5E5E5]">
                        <span className="font-normal text-[#c3c2b7]">
                            올해 이지스 리얼에셋 부문에서 가장 큰 실물 사업이 뭐야?<br />
                            <div className="text-right mt-1">연면적 기준으로.</div>
                        </span>
                    </div>
                </div>

                {/* AI Bubble Text Format */}
                <div className="flex flex-col text-[15px] leading-[1.8] text-[#c3c2b7] font-normal break-keep tracking-tight">
                    <p className="mb-6">
                        현재 시스템에 등록된 올해 이지스 리얼에셋 부문(투자 파트) 파이프라인을 분석한 결과입니다.
                    </p>
                    
                    <p className="mb-6">
                        현재 검토 중인 실물 사업 중 가장 규모가 큰 프로젝트는 <strong className="font-semibold text-white">'더케이트윈타워'</strong> (신규 오피스 매입 건)입니다.<br/>
                        요청하신 연면적과 사업비(AUM), 그리고 현재 진행 중인 핵심 전략 현황은 다음과 같습니다.
                    </p>

                    <div className="mb-6 space-y-2">
                        <p>🏢 연면적 기준: 약 25,000평 (현재 검토 풀 내 최대 규모)</p>
                        <p>💰 사업비(AUM) 기준: 약 9,500억 원 (예상 매입 보수 약 40억 원)</p>
                    </div>

                    <p className="mb-2 text-[#A1A1AA] font-semibold">[핵심 전략 및 진행 현황 (Context Graph)]</p>
                    <p className="mb-6">
                        담당 부서 및 인력: 남태훈 PM 총괄 하에, 정영진, 장민호 매니저가 실무를 전담하여 6월 중순 입찰<br/>
                        (주관사: 메리츠증권, CBRE, CW)을 준비하고 있습니다.
                    </p>

                    <p className="mb-2 text-[#A1A1AA] font-semibold">투자 전략 (Value-add):</p>
                    <p className="mb-6">
                        단순 매입이 아닌 대규모 리모델링 및 증축을 통한 밸류애드(Value-add) 전략을 취하고 있습니다.
                    </p>

                    <p className="mb-2 text-[#A1A1AA] font-semibold">시나리오 검토: 현재 수익성 극대화를 위해</p>
                    <p className="mb-6 space-y-1 pl-0.5">
                        <span className="block">① 더케이트윈타워 단독 개발안과 주변 부지를 연계하는</span>
                        <span className="block">② 일본대사관 부지 통합 개발안 두 가지 시나리오의 타당성을 동시에 비교 분석 중입니다.</span>
                    </p>

                    <p className="mb-8 text-[#888888]">
                        자세한 데이터 및 다른 자산과의 비교가 필요하신가요? 아래 링크를 통해 원하시는 업무 화면으로 바로<br/>이동하실 수 있습니다.
                    </p>

                    {/* Action Buttons - Added cursor-pointer */}
                    <div className="flex flex-col gap-3 items-start">
                        <button onClick={() => alert("시나리오의 다음 단계인 '컨텐츠 상세 화면'으로 이어집니다.")} className="px-5 py-3.5 bg-[#2B2B2B] text-[#c3c2b7] hover:bg-[#333] text-[14px] font-medium rounded-2xl transition-colors whitespace-nowrap border-none outline-none cursor-pointer">
                            더케이트윈타워 딜 상세 보기
                        </button>
                        <button onClick={() => alert("준비 중인 데모 화면입니다.")} className="px-5 py-3.5 bg-[#2B2B2B] text-[#c3c2b7] hover:bg-[#333] text-[14px] font-medium rounded-2xl transition-colors whitespace-nowrap border-none outline-none cursor-pointer">
                            진행 중인 신규 자산 파이프라인 모두 보기
                        </button>
                    </div>
                </div>

            </div>

            {/* Bottom Input Area */}
            <div className="absolute bottom-0 w-full px-4 pb-4 bg-transparent border-t-0">
                <div className="w-full h-[140px] bg-[#2C2C2A] rounded-[18px] flex flex-col relative px-4 pt-5 pb-4 border border-[#3A3A3A]">
                    {/* Shifted text 4px right using ml-1 */}
                    <textarea 
                        placeholder="댓글..." 
                        className="w-full bg-transparent text-[15px] text-[#c3c2b7] focus:outline-none placeholder-[#888888] font-normal resize-none h-[64px] ml-1"
                        defaultValue=""
                    ></textarea>
                    
                    <div className="absolute bottom-4 left-4">
                        <button className="text-[#888888] hover:text-[#E5E5E5] p-1 flex items-center justify-center transition-colors cursor-pointer">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>

                    <div className="absolute bottom-4 right-4">
                        <button className="w-[34px] h-[34px] rounded-full bg-[#5E5E5B] hover:bg-[#72726D] flex items-center justify-center transition-colors shadow-sm outline-none cursor-pointer">
                            <svg className="w-4 h-4 text-white ml-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
