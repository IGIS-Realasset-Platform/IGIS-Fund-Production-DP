import React, { useState, useEffect } from 'react';

// Comparison Item Blueprint
const CardItem = ({ title, desc, isDark }) => (
    <div className={`flex flex-col border-t ${isDark ? 'border-white/20' : 'border-[#1d1d1f]/10'} pt-4 md:pt-6`}>
        <span className={`text-[13px] md:text-[14px] font-bold tracking-widest uppercase mb-1 md:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {title}
        </span>
        <span className={`text-[16px] md:text-[20px] font-bold tracking-tight leading-[1.3] break-keep ${isDark ? 'text-white' : 'text-[#1d1d1f]'}`}>
            {desc}
        </span>
    </div>
);

export default function Section4({ isActive }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }
        
        // Staggered presentation reveal
        const t1 = setTimeout(() => setStep(1), 500);  // Title cascade
        const t2 = setTimeout(() => setStep(2), 1100); // Traditional Card
        const t3 = setTimeout(() => setStep(3), 1600); // AI Inner Card
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-[#fbfbfd] flex flex-col items-center justify-center relative px-6 md:px-12 py-24 overflow-y-auto">
            
            <div className="w-full max-w-[1200px] flex flex-col z-10 pt-16 md:pt-0">
                
                {/* 1. Header Title Sequence (Slide up mask wipes) */}
                <div className="flex flex-col items-start mb-10 md:mb-16">
                    <div className="overflow-hidden mb-3 md:mb-4">
                        <span 
                            className={`block text-gray-500 font-bold tracking-widest text-[13px] md:text-[16px] uppercase transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                        >
                            Case Study : Agile Launching & Data Sovereignty
                        </span>
                    </div>
                    <div className="overflow-hidden">
                        <h2 
                            className={`text-[36px] md:text-[56px] font-bold text-[#1d1d1f] tracking-tight leading-[1.15] transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}`}
                        >
                            전통적 외주 방식 vs <br className="block md:hidden" />
                            <span className="text-[#005f9e]">AI 내재화</span> 구축 사례
                        </h2>
                    </div>
                </div>

                {/* 2. Side-by-Side Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">

                    {/* Left: Traditional Outsourcing (White theme) */}
                    <div 
                        className={`flex flex-col bg-white border border-gray-200 p-8 md:p-14 shadow-sm transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                    >
                        <div className="flex flex-col mb-10 md:mb-14">
                            <span className="text-gray-400 text-[12px] md:text-[14px] font-bold tracking-widest uppercase mb-2">
                                Traditional Agency Way
                            </span>
                            <h3 className="text-[32px] md:text-[46px] font-bold text-[#1d1d1f] tracking-tight leading-none mb-6">
                                기존 제작 방식
                            </h3>
                            {/* Target Blank Link - 270parkave.com */}
                            <a 
                                href="https://270parkave.com/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-fit inline-flex items-center text-gray-500 hover:text-black transition-colors font-medium text-[16px] md:text-[18px] group"
                            >
                                270parkave.com 방문하기
                                <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                        
                        <div className="flex flex-col gap-6 md:gap-8">
                            <CardItem title="의사결정 및 런칭" desc="기획-입찰-계약-제작 (3~6개월 소요)" isDark={false} />
                            <CardItem title="구축 비용" desc="억 단위 용역비 발생" isDark={false} />
                            <CardItem title="콘텐츠 업데이트" desc="대행사 경유 (평균 1~3일 소요)" isDark={false} />
                            <CardItem title="데이터 소유권" desc="대행사 DB 관리 (접근 권한 제한적)" isDark={false} />
                        </div>
                    </div>

                    {/* Right: AI-Driven Internalization (Dark theme highlighting effectiveness) */}
                    <div 
                        className={`flex flex-col bg-[#1d1d1f] p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden group transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                    >
                        {/* Subtle background glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff10] to-transparent pointer-events-none"></div>

                        <div className="flex flex-col mb-10 md:mb-14 relative z-10">
                            <span className="text-[#4d8fcd] text-[12px] md:text-[14px] font-bold tracking-widest uppercase mb-2">
                                AI-Driven Internalization
                            </span>
                            <h3 className="text-[32px] md:text-[46px] font-bold text-white tracking-tight leading-none mb-6">
                                IOTA SEOUL 구축
                            </h3>
                            {/* Target Blank Link - IOTA SEOUL */}
                            <a 
                                href="https://iotaseoul.site/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-fit inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium text-[16px] md:text-[18px] group"
                            >
                                iotaseoul.site 방문하기
                                <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 text-[#4d8fcd] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                        
                        <div className="flex flex-col gap-6 md:gap-8 relative z-10">
                            <CardItem title="의사결정 및 런칭" desc="내재인력이 AI 활용 단독 수행 (단 5일)" isDark={true} />
                            <CardItem title="구축 비용" desc="0원 (도메인 비용 외 영구 면제)" isDark={true} />
                            <CardItem title="콘텐츠 업데이트" desc="실시간 5분 이내 직접 즉각 수정" isDark={true} />
                            <CardItem title="데이터 소유권" desc="내부 DB 실시간 축적 및 데이터 주권 확보" isDark={true} />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
