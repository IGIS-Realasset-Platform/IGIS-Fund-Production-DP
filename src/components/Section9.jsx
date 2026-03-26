import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section9({ isActive }) {
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);

    const stagesKR = ["소싱", "투자", "펀드생성", "개발추진", "파이낸싱", "유저솔루션", "기업마케팅", "개발관리", "준공", "운용개시"];
    const stagesEN = ["Source", "Invest", "Fund", "Dev Init", "Finance", "User Sol.", "Corp Mktg", "Dev Mgt", "Complete", "Operate"];
    const stages = lang === 'kr' ? stagesKR : stagesEN;

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }
        
        // Initial state: Fragmented IOTA Seoul Box (step 0, 0-800ms)
        // Step 1: Forceful merge animation triggers
        // Step 2 & 3: Copy text fades in
        const t1 = setTimeout(() => setStep(1), 1000);  // Merge animation
        const t2 = setTimeout(() => setStep(2), 2200); // Dilemma text
        const t3 = setTimeout(() => setStep(3), 3600); // Modified Collaboration text
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-white flex flex-col justify-start relative px-4 md:px-12 lg:px-20 pt-[80px] md:pt-[120px] pb-[80px] overflow-hidden">
            <style>{`
                /* Hide scrollbar for narrow horizontal overflow */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            
            <div className="w-full max-w-[1500px] mx-auto flex flex-col items-center justify-center h-full relative">
                
                {/* 1. Value Chain Re-connect Animation */}
                {/* Positional wrapper to put the box in the visual upper/center */}
                <div className="w-full overflow-x-auto hide-scrollbar pb-6 flex flex-col items-center mt-[-40px] md:mt-0">
                    
                    <div className={`flex flex-col min-w-[1000px] xl:min-w-0 w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)]`}>
                        {/* Project Title */}
                        <div className={`flex text-[#1d1d1f] font-bold text-[14px] md:text-[17px] px-2 mb-2 md:mb-3`}>
                            <span className="text-[#3b82f6] mr-2">{lang === 'kr' ? '프로젝트' : 'Project'} :</span> IOTA Seoul
                        </div>

                        {/* The Box */}
                        {/* Step 0: fragmented (gap-4, red border, transparent background for wrapper) */}
                        {/* Step 1: merged (gap-0, border blue, solid wrapper border, control tower linked) */}
                        <div 
                            className={`flex items-center w-full transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] 
                                ${step >= 1 ? 'gap-0 border-[2.5px] border-[#297cf6] rounded-lg shadow-[0_15px_40px_rgba(41,124,246,0.15)] overflow-hidden bg-white' : 'gap-[10px] md:gap-[15px] lg:gap-[20px] bg-transparent border-transparent'}
                            `}
                        >
                            {stages.map((stage, idx) => (
                                <React.Fragment key={idx}>
                                    {/* Isolated Node -> Mapped Cell */}
                                    <div 
                                        className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] h-[100px] md:h-[130px]
                                            ${step >= 1 ? 'bg-[#f4f4f5] border-transparent rounded-none shadow-none' : 'bg-[#fff] rounded-md border-[2px] border-[#ef4444] shadow-[0_4px_15px_rgba(239,68,68,0.15)]'}
                                        `}
                                    >
                                        {/* Top Title Bar */}
                                        <div 
                                            className={`w-full flex items-center justify-center z-20 transition-all duration-[1000ms]
                                                ${step >= 1 ? 'bg-[#297cf6] h-[30px] md:h-[40px] py-1 border-none' : 'bg-[#ef4444] h-[30px] md:h-[40px] py-1 border-b border-[#ef4444]'}
                                            `}
                                        >
                                            <span className={`transition-all duration-[1000ms] font-bold text-center leading-[1.2] break-keep px-1 text-[10px] md:text-[13px]
                                                ${step >= 1 ? 'text-white' : 'text-white'}
                                            `}>
                                                {stage}
                                            </span>
                                        </div>
                                    </div>

                                    {/* The connecting joint (Control Tower Force Link) */}
                                    {idx < stages.length - 1 && (
                                        <div 
                                            className={`bg-[#297cf6] shrink-0 z-30 transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)]
                                                ${step >= 1 ? 'w-[2px] md:w-[2px] h-[100px] md:h-[130px] opacity-100 scale-y-100' : 'w-0 h-[80px] opacity-0 scale-y-0 mx-0'}
                                            `} 
                                        ></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Text Content (Appears after merge) */}
                <div className="mt-12 md:mt-24 w-full flex flex-col items-center text-center">
                    
                    <h3 className={`text-[18px] md:text-[22px] lg:text-[26px] font-medium text-[#555] tracking-tight leading-[1.6] break-keep transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {lang === 'kr' ? (
                            <>
                                조직간 자율에 맡기자니 파편화되고, 규약으로 강제하자니 유연성이 죽는 딜레마.<br className="hidden md:block"/>
                                이를 깨기 위해 대표님은 <strong className="text-[#1d1d1f] font-bold">가장 현실적인 결정</strong>을 내렸습니다.
                            </>
                        ) : (
                            <>
                                The dilemma of fragmentation through autonomy vs. loss of flexibility through strict rules.<br className="hidden md:block"/>
                                To break this, the CEO made the <strong className="text-[#1d1d1f] font-bold">most pragmatic decision</strong>.
                            </>
                        )}
                    </h3>

                    <div className={`mt-10 md:mt-16 transition-all duration-[1200ms] delay-[200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
                        <h2 className="text-[32px] md:text-[45px] lg:text-[52px] font-bold text-[#297cf6] tracking-tight leading-[1.2] mb-6 md:mb-8">
                            {lang === 'kr' ? "'수정 협업주의 (Modified Collaboration)'" : "'Modified Collaboration'"}
                        </h2>
                        
                        <p className="text-[18px] md:text-[24px] lg:text-[28px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.5] break-keep max-w-[900px]">
                            {lang === 'kr' ? (
                                <>
                                    개인의 성향이나 선의에 기대는 것을 멈추고,<br className="hidden md:block" />
                                    <strong className="text-[#297cf6] bg-[#297cf6]/10 px-[6px] rounded-md pb-[2px] mt-1 md:mt-2 inline-block">핵심 기능만큼은 컨트롤 타워를 통해 강제적으로 연결해 내겠다</strong>는 원칙입니다.
                                </>
                            ) : (
                                <>
                                    Stop relying on individual inclinations or goodwill, and<br className="hidden md:block" />
                                    <strong className="text-[#297cf6] bg-[#297cf6]/10 px-[6px] rounded-md pb-[2px] mt-1 md:mt-2 inline-block">forcefully connect core functions through a control tower</strong>.
                                </>
                            )}
                        </p>
                    </div>

                </div>

            </div>
        </section>
    );
}
