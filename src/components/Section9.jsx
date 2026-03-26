import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const DataFlowCell = () => {
    // Generate static random values per stream
    const [streams] = useState(() => Array.from({ length: 8 }).map(() => ({
        top: 30 + Math.random() * 60,
        delay: Math.random() * 2.5,
        duration: 1.0 + Math.random() * 1.5, 
        chars: Math.random() > 0.5 ? "010 " : "101 "
    })));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
            {streams.map((s, i) => (
                <div 
                    key={i} 
                    className="absolute font-mono leading-none tracking-widest whitespace-pre data-stream-cell"
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
        
        // Step 0: Initial render (Fragmented box below)
        const t1 = setTimeout(() => setStep(1), 500);  // Dilemma text
        const t2 = setTimeout(() => setStep(2), 1500); // Modified Collaboration text
        const t3 = setTimeout(() => setStep(3), 3000); // Trigger Merge Animation!
        const t4 = setTimeout(() => setStep(4), 4000); // Data flows smoothly across the merged box
        
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
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
                
                @keyframes dataFlowCellRight {
                    0% { transform: translateX(-10%); opacity: 0; color: #60a5fa; }
                    20% { opacity: 0.8; color: #3b82f6; }
                    80% { opacity: 0.8; color: #1e40af; transform: translateX(80%); }
                    95% { opacity: 0; filter: blur(4px) brightness(1.2); transform: translateX(95%) scaleY(1.3); }
                    100% { opacity: 0; transform: translateX(100%); }
                }

                .data-stream-cell {
                    animation-name: dataFlowCellRight;
                    animation-timing-function: ease-in;
                    animation-iteration-count: infinite;
                    opacity: 0;
                }
            `}</style>
            
            <div className="w-full max-w-[1500px] mx-auto flex flex-col items-center justify-center h-full relative space-y-4 md:space-y-6">
                
                {/* 1. Text Content (Appears first at the top) */}
                <div className="w-full flex items-center justify-center">
                    <div className="w-full text-center flex flex-col items-center">
                        
                        {/* 1-1. Dilemma Paragraph */}
                        <div className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <h3 className={`text-[18px] md:text-[22px] lg:text-[26px] font-medium text-[#555] tracking-tight leading-[1.6] break-keep`}>
                                {lang === 'kr' ? (
                                    <>
                                        조직간 자율에 맡기자니 파편화되고, 규약으로 강제하자니 유연성이 죽는 딜레마.<br className="hidden md:block"/>
                                        이를 깨기 위해 대표님은 <span className="text-[#1d1d1f] font-bold">가장 현실적인 결정</span>을 내렸습니다.
                                    </>
                                ) : (
                                    <>
                                        The dilemma of fragmentation through autonomy vs. loss of flexibility through strict rules.<br className="hidden md:block"/>
                                        To break this, the CEO made the <span className="text-[#1d1d1f] font-bold">most pragmatic decision</span>.
                                    </>
                                )}
                            </h3>
                        </div>

                        {/* 1-2. Modified Collaboration Title & Principle */}
                        <div className={`my-[40px] md:my-[60px] transition-all duration-[1200ms] delay-[200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'} flex flex-col items-center`}>
                            {/* Main title reduced by 6px */}
                            <h2 className="text-[26px] md:text-[39px] lg:text-[46px] font-bold bg-gradient-to-r from-[#297cf6] to-[#0448d3] text-transparent bg-clip-text tracking-tight leading-[1.2] mb-6 md:mb-8 inline-block">
                                {lang === 'kr' ? "'수정 협업주의 (Modified Collaboration)'" : "'Modified Collaboration'"}
                            </h2>
                            
                            <p className="text-[18px] md:text-[24px] lg:text-[28px] font-semibold text-[#1d1d1f] tracking-tight leading-[1.5] break-keep max-w-[1100px]">
                                {lang === 'kr' ? (
                                    <>
                                        개인의 성향이나 선의에 기대는 것을 멈추고,<br className="hidden md:block" />
                                        <span className="font-bold bg-gradient-to-r from-[#297cf6] to-[#0448d3] text-transparent bg-clip-text">핵심 기능만큼은 컨트롤 타워를 통해 강제적으로 연결해 내겠다</span>는 원칙입니다.
                                    </>
                                ) : (
                                    <>
                                        Stop relying on individual inclinations or goodwill, and<br className="hidden md:block" />
                                        <span className="font-bold bg-gradient-to-r from-[#297cf6] to-[#0448d3] text-transparent bg-clip-text">forcefully connect core functions through a control tower</span>.
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Value Chain Re-connect Animation */}
                {/* Positioned under the text block */}
                <div className="w-full overflow-x-auto hide-scrollbar pb-6 flex flex-col items-center">
                    
                    <div className={`flex flex-col min-w-[1000px] xl:min-w-0 w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)]`}>
                        {/* Project Title */}
                        <div className={`flex text-[#1d1d1f] font-bold text-[14px] md:text-[17px] px-2 mb-2 md:mb-3`}>
                            <span className="text-[#3b82f6] mr-2">{lang === 'kr' ? '프로젝트' : 'Project'} :</span> IOTA Seoul
                        </div>

                        {/* The Box */}
                        {/* Step 3: merged (gap-0, border blue, solid border, control tower linked) */}
                        <div 
                            className={`flex items-center w-full transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] relative
                                ${step >= 3 ? 'gap-0 border-[2.5px] border-[#1e40af] rounded-lg shadow-[0_15px_40px_rgba(30,64,175,0.15)] overflow-hidden bg-white' : 'gap-[10px] md:gap-[15px] lg:gap-[20px] bg-transparent border-transparent'}
                            `}
                        >
                            {stages.map((stage, idx) => (
                                <React.Fragment key={idx}>
                                    {/* Isolated Node -> Mapped Cell */}
                                    <div 
                                        className={`flex-1 flex flex-col relative overflow-hidden transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)] h-[100px] md:h-[130px]
                                            ${step >= 3 ? 'bg-[#f4f4f5] border-transparent rounded-none shadow-none z-0 border-r border-[#1e40af]/30 last:border-r-0' : 'bg-[#fff] rounded-md border-[2px] border-[#ef4444] shadow-[0_4px_15px_rgba(239,68,68,0.15)] z-20'}
                                        `}
                                    >
                                        {/* Blocked Data Flow restricted INSIDE the cell */}
                                        {step >= 4 && <DataFlowCell />}

                                        {/* Top Title Bar */}
                                        <div 
                                            className={`w-full flex items-center justify-center z-20 transition-all duration-[1000ms]
                                                ${step >= 3 ? 'bg-[#1e40af] h-[30px] md:h-[40px] py-1 border-none' : 'bg-[#ef4444] h-[30px] md:h-[40px] py-1 border-b border-[#ef4444]'}
                                            `}
                                        >
                                            <span className={`transition-all duration-[1000ms] font-bold text-center leading-[1.2] break-keep px-1 text-[10px] md:text-[13px]
                                                ${step >= 3 ? 'text-white' : 'text-white'}
                                            `}>
                                                {stage}
                                            </span>
                                        </div>
                                    </div>

                                    {/* The connecting joint (Control Tower Force Link) */}
                                    {idx < stages.length - 1 && (
                                        <div 
                                            className={`bg-[#1e40af] shrink-0 z-30 transition-all duration-[1000ms] ease-[cubic-bezier(0.19,1,0.22,1)]
                                                ${step >= 3 ? 'w-[2px] md:w-[3px] h-[100px] md:h-[130px] opacity-100 scale-y-100' : 'w-0 h-[80px] opacity-0 scale-y-0 mx-0'}
                                            `} 
                                        ></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
