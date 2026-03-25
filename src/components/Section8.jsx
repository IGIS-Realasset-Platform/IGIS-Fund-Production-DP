import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const DataFlow = () => {
    // Generate static random values per node to avoid React hydration mismatches 
    // and keep animations consistent across rerenders.
    const [streams] = useState(() => Array.from({ length: 12 }).map(() => ({
        top: 25 + Math.random() * 65,
        delay: Math.random() * 2.5,
        duration: 1.0 + Math.random() * 1.5,
        chars: Math.random() > 0.5 ? "011010" : "100101"
    })));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {streams.map((s, i) => (
                <div 
                    key={i} 
                    className="absolute font-mono leading-none tracking-widest whitespace-nowrap data-stream"
                    style={{
                        top: `${s.top}%`,
                        left: '0',
                        fontSize: 'clamp(9px, 1vw, 12px)',
                        animationDelay: `${s.delay}s`,
                        animationDuration: `${s.duration}s`
                    }}
                >
                    {s.chars}
                </div>
            ))}
        </div>
    );
};

export default function Section8({ isActive }) {
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
        
        const t1 = setTimeout(() => setStep(1), 500);  // Title
        const t2 = setTimeout(() => setStep(2), 1500); // Subtitle
        const t3 = setTimeout(() => setStep(3), 2200); // Nodes Reveal
        const t4 = setTimeout(() => setStep(4), 3200); // Data flow begins (animation mapped)
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, [isActive]);

    return (
        <section className="section w-full h-full bg-black flex flex-col justify-start relative px-4 md:px-12 lg:px-20 pt-[80px] md:pt-[120px] pb-[80px] overflow-x-hidden overflow-y-auto">
            <style>{`
                @keyframes dataFlowRight {
                    0% { transform: translateX(-10%); opacity: 0; color: #3b82f6; }
                    15% { opacity: 0.8; }
                    60% { color: #f97316; }
                    85% { opacity: 1; color: #ef4444; filter: blur(0px); transform: translateX(70%); }
                    95% { opacity: 0; filter: blur(6px) brightness(1.5); transform: translateX(85%) scaleY(1.5); }
                    100% { opacity: 0; transform: translateX(90%); }
                }
                .data-stream {
                    animation-name: dataFlowRight;
                    animation-timing-function: ease-in;
                    animation-iteration-count: infinite;
                    opacity: 0;
                }
                .data-paused .data-stream {
                    animation-play-state: paused;
                    opacity: 0 !important;
                }
                .data-running .data-stream {
                    animation-play-state: running;
                }
                /* Hide scrollbar for narrow horizontal overflow */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="w-full max-w-[1500px] mx-auto flex flex-col justify-center h-full">
                
                {/* 1. Header (Negative/Intense) */}
                <div className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <h2 className="text-[30px] md:text-[45px] lg:text-[52px] font-bold text-white tracking-tight leading-[1.25] break-keep mb-6 md:mb-8">
                        {lang === 'kr' ? (
                            <>
                                그 결과, 이지스의 '<span className="text-white border-b-[3px] md:border-b-[4px] border-[#dc2626] pb-1">10단계 가치 사슬(Value Chain)</span>'은<br className="hidden md:block"/> 단절되었습니다.
                            </>
                        ) : (
                            <>
                                As a result, IGIS' <span className="text-white border-b-[3px] md:border-b-[4px] border-[#dc2626] pb-1">'10-Step Value Chain'</span><br className="hidden md:block"/> has been severed.
                            </>
                        )}
                    </h2>
                </div>

                <div className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <h3 className="text-[18px] md:text-[24px] lg:text-[28px] font-medium text-[#c4c4c6] tracking-tight leading-[1.5] break-keep mb-16 md:mb-24 max-w-[1100px]">
                        {lang === 'kr' ? (
                            <>
                                앞 단계에서 쌓은 경험과 데이터는 다음 단계로 흐르지 못하고 담당자의 PC 안에서 <strong className="text-white font-bold">휘발</strong>됩니다.<br />
                                우리는 매 프로젝트마다 가장 비효율적인 방식으로 <strong className="text-white font-bold">처음부터 다시 시작</strong>하고 있습니다.
                            </>
                        ) : (
                            <>
                                The experience and data accumulated in previous stages fail to flow to the next, <strong className="text-white font-bold">evaporating</strong> inside personal PCs.<br />
                                We are starting over from scratch for every project in the most <strong className="text-white font-bold">inefficient manner</strong>.
                            </>
                        )}
                    </h3>
                </div>

                {/* 2. Value Chain Visualization */}
                {/* Mobile scrollable wrapper, Desktop full squashed flex grid */}
                <div className={`w-full overflow-x-auto hide-scrollbar pb-6 transition-all duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
                    <div className="flex items-center min-w-[1000px] xl:min-w-0 w-full rounded-lg border border-[#333] shadow-[0_0_30px_rgba(220,38,38,0.1)] overflow-hidden">
                        
                        {stages.map((stage, idx) => (
                            <React.Fragment key={idx}>
                                {/* Node Compartment */}
                                <div className={`flex-1 flex flex-col h-[260px] md:h-[320px] lg:h-[350px] relative bg-[#0f0f11] overflow-hidden ${step >= 4 ? 'data-running' : 'data-paused'}`}>
                                    {/* Top Title Bar */}
                                    <div className="w-full bg-[#1a1a1c] border-b border-[#2a2a2c] py-3 lg:py-4 px-1 flex items-center justify-center z-20 h-[60px] md:h-[70px]">
                                        <span className="text-[12px] md:text-[14px] lg:text-[16px] text-[#ededf0] font-bold text-center leading-[1.2] break-keep px-1">
                                            {stage}
                                        </span>
                                    </div>
                                    
                                    {/* Flowing Data Animation */}
                                    <div className="absolute inset-0 top-[60px] md:top-[70px] z-10 p-2 opacity-80">
                                        <DataFlow />
                                    </div>
                                </div>
                                
                                {/* 3. The "Thick Walls" of severing */}
                                {idx < stages.length - 1 && (
                                    <div className="w-[4px] md:w-[6px] h-[260px] md:h-[320px] lg:h-[350px] bg-gradient-to-b from-[#dc2626] to-[#f97316] shrink-0 z-30 shadow-[0_0_15px_rgba(239,68,68,0.9)] transition-all duration-1000" style={{ opacity: step >= 4 ? 1 : 0.3 }}></div>
                                )}
                            </React.Fragment>
                        ))}

                    </div>
                </div>

            </div>
        </section>
    );
}
