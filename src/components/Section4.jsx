import React, { useState, useEffect } from 'react';

// Comparison Item Blueprint
const CardItem = ({ title, desc, isDark }) => (
    <div className={`flex flex-col border-t ${isDark ? 'border-white/20' : 'border-[#1d1d1f]/10'} pt-4 md:pt-6`}>
        <span className={`text-[13px] md:text-[14px] font-bold tracking-widest uppercase mb-1 md:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
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
                
                {/* 1. Header Title Sequence (중앙정렬 및 자간 조정) */}
                <div className="flex flex-col items-center text-center mb-[30px]">
                    <div className="overflow-hidden mb-[10px]">
                        <span 
                            className={`block text-gray-500 text-[13px] md:text-[16px] transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                            style={{ fontFamily: "'Guardian Sans', sans-serif" }}
                        >
                            Case Study : Agile Launching & Data Sovereignty
                        </span>
                    </div>
                    <div className="overflow-hidden">
                        <h2 
                            className={`text-[40px] md:text-[56px] font-bold text-[#1d1d1f] tracking-tight leading-[1.15] transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}`}
                        >
                            전통적 외주 방식 vs <br className="block md:hidden" />
                            <span className="text-[#005f9e]">AI 내재화</span> 구축 사례
                        </h2>
                    </div>
                </div>

                {/* 2. Side-by-Side Comparison Grid (Step 4에서 좌측 푸시 적용) */}
                <div 
                    className={`w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 4 ? '-translate-x-4 md:-translate-x-10 lg:-translate-x-20' : 'translate-x-0'}`}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">

                        {/* Left: Traditional Outsourcing (White theme) */}
                        <div 
                            className={`flex flex-col bg-white border border-gray-200 p-8 md:p-14 shadow-sm transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                        >
                            <div className="flex flex-col mb-10 md:mb-14">
                                <span className="text-gray-400 text-[12px] md:text-[14px] font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
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
                                    <span style={{ fontFamily: "'Guardian Sans', sans-serif" }}>270parkave.com</span>
                                    <span className="ml-1">방문하기</span>
                                    <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>
                            </div>
                            
                            <div className="flex flex-col gap-6 md:gap-8 mt-auto">
                                <CardItem title="의사결정 및 런칭" desc="기획-입찰-계약-제작 (3~6개월 소요)" isDark={false} />
                                <CardItem title="구축 비용" desc="억 단위 용역비 발생" isDark={false} />
                                <CardItem title="콘텐츠 업데이트" desc="대행사 경유 (평균 1~3일 소요)" isDark={false} />
                                <CardItem title="데이터 소유권" desc="대행사 DB 관리 (접근 권한 제한적)" isDark={false} />
                            </div>
                        </div>

                        {/* Right: AI-Driven Internalization (Dark theme highlighting effectiveness / Floating Bubble base) */}
                        <div className="relative">
                            <div 
                                className={`flex flex-col bg-[#1d1d1f] p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.2)] h-full overflow-hidden group transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}
                            >
                                {/* Subtle background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff10] to-transparent pointer-events-none"></div>

                                <div className="flex flex-col mb-10 md:mb-14 relative z-10">
                                    <span className="text-[#4d8fcd] text-[12px] md:text-[14px] font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
                                        AI-Driven Internalization
                                    </span>
                                    <h3 className="text-[32px] md:text-[46px] font-bold text-white tracking-tight leading-none mb-6">
                                        <span style={{ fontFamily: "'Guardian Sans', sans-serif" }}>IOTA SEOUL</span> 구축
                                    </h3>
                                    {/* Target Blank Link - IOTA SEOUL */}
                                    <a 
                                        href="https://iotaseoul.site/" 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="w-fit inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium text-[16px] md:text-[18px] group"
                                    >
                                        <span style={{ fontFamily: "'Guardian Sans', sans-serif" }}>iotaseoul.site</span>
                                        <span className="ml-1">방문하기</span>
                                        <svg className="w-5 h-5 ml-1 transform group-hover:translate-x-1 text-[#4d8fcd] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </a>
                                </div>
                                
                                <div className="flex flex-col gap-6 md:gap-8 mt-auto relative z-10">
                                    <CardItem title="의사결정 및 런칭" desc="내재인력이 AI 활용 단독 수행 (단 5일)" isDark={true} />
                                    <CardItem title="구축 비용" desc="0원 (도메인 비용 외 영구 면제)" isDark={true} />
                                    <CardItem title="콘텐츠 업데이트" desc="실시간 5분 이내 직접 즉각 수정" isDark={true} />
                                    <CardItem title="데이터 소유권" desc="내부 DB 실시간 축적 및 데이터 주권 확보" isDark={true} />
                                </div>
                            </div>
                            
                            {/* Floating Speech Bubble (Appears at Step 4 natively hovering on the right) */}
                            <div 
                                className={`absolute top-[40px] md:top-[80px] -right-[20px] md:-right-[60px] lg:-right-[160px] w-[280px] md:w-[320px] lg:w-[360px] bg-blue-50/95 backdrop-blur-md border border-blue-200/60 p-6 md:p-8 shadow-2xl z-50 transition-all duration-[1200ms] delay-[400ms] ease-[cubic-bezier(0.19,1,0.22,1)] pointer-events-none rounded-xl ${step >= 4 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'} hidden md:block`}
                            >
                                {/* Speech Bubble Arrow (Left pointing tail) */}
                                <div className="absolute top-[30px] -left-[10px] w-6 h-6 bg-blue-50/95 border-l border-b border-blue-200/60 transform rotate-45"></div>
                                
                                <p className="text-[#1d1d1f] text-[15px] md:text-[16px] leading-[1.6] break-keep font-medium mb-3">
                                    외주 제작 시, 전체 맥락을 도급자에게 이해시키고 양사가 커뮤니케이션하는 데에만 <strong>수개월의 불필요한 기간</strong>이 증발합니다.
                                </p>
                                <p className="text-[#1d1d1f] text-[15px] md:text-[16px] leading-[1.6] break-keep font-medium mb-3">
                                    반면 <strong className="text-blue-600">내부 인력</strong>이 <strong>AI</strong>라는 무기를 직접 다루면 외주 교육의 비효율이 존재하지 않으며, 
                                </p>
                                <p className="text-blue-600 text-[15px] md:text-[16px] leading-[1.6] break-keep font-bold">
                                    실무 DB 실시간 축적 기반 상시 업데이트 통제권을 기업이 온전히 독점합니다.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
