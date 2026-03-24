import React, { useState, useEffect } from 'react';

// Comparison Item Blueprint (Scaled for 3-col layout)
const CardItem = ({ title, desc, isDark }) => (
    <div className={`flex flex-col border-t ${isDark ? 'border-white/20' : 'border-[#1d1d1f]/10'} pt-3 md:pt-4`}>
        <span className={`text-[11px] md:text-[13px] font-bold tracking-widest uppercase mb-1 md:mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
            {title}
        </span>
        <span className={`text-[15px] md:text-[18px] font-bold tracking-tight leading-[1.3] break-keep ${isDark ? 'text-white' : 'text-[#1d1d1f]'}`}>
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
        
        // Staggered presentation reveal mapped to Blackstone UI
        const t1 = setTimeout(() => setStep(1), 500);  // Title cascade
        const t2 = setTimeout(() => setStep(2), 1000); // 2-Card Comparisons
        const t3 = setTimeout(() => setStep(3), 1600); // Right Speech Bubble Insight
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-[#fbfbfd] flex flex-col items-center justify-center relative px-6 md:px-12 py-24 overflow-y-auto">
            
            <div className="w-full max-w-[1300px] flex flex-col z-10 pt-16 md:pt-0">
                
                {/* 1. Header Title Sequence (중앙정렬) */}
                <div className="flex flex-col items-center text-center mb-[20px]">
                    {/* 소제목 */}
                    <div className="overflow-hidden mb-[4px]">
                        <span 
                            className={`block text-gray-500 font-bold tracking-widest text-[13px] md:text-[16px] uppercase transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                            style={{ fontFamily: "'Guardian Sans', sans-serif" }}
                        >
                            Case Study : Agile Launching & Data Sovereignty
                        </span>
                    </div>
                    {/* 제목 */}
                    <div className="overflow-hidden">
                        <h2 
                            className={`text-[36px] md:text-[52px] font-bold text-[#1d1d1f] tracking-tight leading-[1.15] transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}`}
                        >
                            전통적 외주 방식 vs <br className="block xl:hidden" />
                            <span className="text-[#005f9e]">AI 내재화</span> 구축 사례
                        </h2>
                    </div>
                </div>

                {/* 2. Side-by-Side Push Left Content Block */}
                <div className="flex flex-col xl:flex-row gap-6 md:gap-8 items-stretch w-full">
                    
                    {/* Left Block (2-Card Grid) - 좌측으로 밀린 주요 박스 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full xl:w-[68%]">

                        {/* Traditional Agency Card */}
                        <div className={`flex flex-col bg-white border border-gray-200 p-8 shadow-sm rounded-2xl transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                            <div className="flex flex-col mb-10 md:mb-12">
                                <span className="text-gray-400 text-[11px] md:text-[13px] font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
                                    Traditional Agency Way
                                </span>
                                <h3 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] tracking-tight leading-none mb-4">
                                    기존 제작 방식
                                </h3>
                                <a href="https://270parkave.com/" target="_blank" rel="noopener noreferrer" className="w-fit inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors font-medium text-[15px] md:text-[17px] group">
                                    <span style={{ fontFamily: "'Guardian Sans', sans-serif" }}>270parkave.com</span>
                                    <span className="ml-1">방문하기</span>
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </a>
                            </div>
                            <div className="flex flex-col gap-5 mt-auto">
                                <CardItem title="의사결정 및 런칭" desc="기획-입찰-계약-제작 (3~6개월)" isDark={false} />
                                <CardItem title="구축 비용" desc="억 단위 막대한 외주 용역비" isDark={false} />
                                <CardItem title="콘텐츠 업데이트" desc="대행사를 통해서만 접근 (1~3일 지연)" isDark={false} />
                                <CardItem title="데이터 소유권" desc="대행사 DB 통제 (지속적 접근 제한)" isDark={false} />
                            </div>
                        </div>

                        {/* IOTA SEOUL (AI) Card */}
                        <div className={`flex flex-col bg-[#1d1d1f] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.2)] rounded-2xl relative overflow-hidden group transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff10] to-transparent pointer-events-none"></div>
                            <div className="flex flex-col mb-10 md:mb-12 relative z-10">
                                <span className="text-[#4d8fcd] text-[11px] md:text-[13px] font-bold tracking-widest uppercase mb-2" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
                                    AI-Driven Internalization
                                </span>
                                <h3 className="text-[28px] md:text-[36px] font-bold text-white tracking-tight leading-none mb-4" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>
                                    IOTA SEOUL
                                </h3>
                                <a href="https://iotaseoul.site/" target="_blank" rel="noopener noreferrer" className="w-fit inline-flex items-center text-gray-400 hover:text-white transition-colors font-medium text-[15px] md:text-[17px] group">
                                    <span style={{ fontFamily: "'Guardian Sans', sans-serif" }}>iotaseoul.site</span>
                                    <span className="ml-1">방문하기</span>
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform text-[#4d8fcd]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </a>
                            </div>
                            <div className="flex flex-col gap-5 mt-auto relative z-10">
                                <CardItem title="의사결정 및 런칭" desc="내재인력과 AI 기술 결합 (단 5일 완수)" isDark={true} />
                                <CardItem title="구축 비용" desc="0원 (도메인 실비용을 제외한 전액 소거)" isDark={true} />
                                <CardItem title="콘텐츠 업데이트" desc="실무 담당자가 5분 이내 즉각 자체 변경" isDark={true} />
                                <CardItem title="데이터 소유권" desc="이지스 내부 DB 실시간 축적 및 주권 확보" isDark={true} />
                            </div>
                        </div>

                    </div>

                    {/* Right Block (Speech Bubble) - 우측 말풍선 팝업 */}
                    <div 
                        className={`w-full xl:w-[32%] flex items-stretch transition-all duration-[1200ms] delay-[300ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 3 ? 'opacity-100 translate-y-0 xl:translate-y-0 xl:translate-x-0' : 'opacity-0 translate-y-12 xl:translate-y-0 xl:translate-x-24'}`}
                    >
                        <div className="relative flex flex-col justify-center bg-blue-50/50 border border-blue-200/60 p-8 md:p-10 rounded-2xl w-full h-full shadow-[0_15px_30px_rgba(0,0,0,0.03)]">
                            {/* Speech Bubble Arrow Tail (Desktop) */}
                            <div className="absolute top-1/2 -left-[12px] -translate-y-1/2 w-6 h-6 bg-blue-50/50 border-l border-b border-blue-200/60 transform rotate-45 hidden xl:block"></div>
                            {/* Speech Bubble Arrow Tail (Mobile/Tablet) */}
                            <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-50/50 border-l border-t border-blue-200/60 transform rotate-45 block xl:hidden"></div>
                            
                            <div className="flex items-center gap-2 mb-8 text-[#005f9e]">
                                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.84 1.85 5.3 4.74 6.74-.29 1.54-1.07 3.32-2.82 4.45.2.06.41.09.63.09 2.5 0 4.67-1.39 6.13-2.61.43.05.88.08 1.32.08 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg>
                                <span className="font-bold text-[15px] uppercase tracking-widest" style={{ fontFamily: "'Guardian Sans', sans-serif" }}>Implementation Insight</span>
                            </div>

                            <p className="text-[#1d1d1f] text-[16px] md:text-[18px] font-medium leading-relaxed break-keep mb-6">
                                일반적인 외주는 전체 맥락을 도급자에게 오롯이 이해시키는 양사 커뮤니케이션에만 최소 <strong>3~6개월</strong>이 무의미하게 증발합니다.
                            </p>
                            <p className="text-[#1d1d1f] text-[16px] md:text-[18px] font-medium leading-relaxed break-keep mb-6">
                                반면, 복잡하고 방대한 자산 데이터를 이미 알고 있는 <strong className="text-[#005f9e]">내재 인력</strong>이 직접 <strong>AI</strong>를 무기로 사이트를 구축하면, 외주 인력을 교육해야 할 시간적 비효율 자체가 아예 소멸됩니다.
                            </p>
                            <p className="text-[#1d1d1f] text-[16px] md:text-[18px] font-medium leading-relaxed break-keep">
                                즉 <strong>DB의 실시간 축적</strong>과 <strong>강력한 AI 결합</strong> 덕분에 한계점 없는 지속적이고 폭발적으로 빠른 웹 업데이트 통제권이 이지스 내부로 완전히 편입됩니다.
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
