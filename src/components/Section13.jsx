import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Section13({ isActive }) {
    const { lang } = useLanguage();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setStep(0);
            return;
        }

        let timers = [];
        
        // Background dimming / Image reveal
        timers.push(setTimeout(() => setStep(0.5), 100));

        // Text reveal steps (빠르게 바로 등장)
        timers.push(setTimeout(() => setStep(1), 800));   // Heading
        timers.push(setTimeout(() => setStep(2), 1200));  // Question
        timers.push(setTimeout(() => setStep(3), 1600));  // Quotes
        timers.push(setTimeout(() => setStep(4), 2000));  // Para 1
        timers.push(setTimeout(() => setStep(5), 2400));  // Para 2
        timers.push(setTimeout(() => setStep(6), 2900));  // Conclusion
        
        // Giant 'Moat' + Underline drops in (마지막 효과, 충분히 읽을 시간 확보 후 등장)
        timers.push(setTimeout(() => setStep(7), 4800)); 

        return () => timers.forEach(t => clearTimeout(t));
    }, [isActive]);

    return (
        <section className="relative section w-full h-full flex flex-col justify-center items-center overflow-hidden bg-[#0A0A0C]">
            
            {/* Background Image: Very slow zoom animation like Section 12 */}
            <div 
                className={`absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 transform transition-transform duration-[40000ms] ease-linear`}
                style={{ 
                    backgroundImage: `url('${import.meta.env.BASE_URL}igis_office.webp')`,
                    transform: step >= 0.5 ? 'scale(1.15)' : 'scale(1)'
                }}
            />
            
            {/* Dimming Overlay to ensure readability */}
            <div className={`absolute inset-0 bg-black/75 z-10 transition-opacity duration-[1500ms] ease-out ${step >= 0.5 ? 'opacity-100' : 'opacity-0'}`} />

            {/* Content Container (Section 12와 동일하게 위치 및 내부 Moat 정렬) */}
            <div className={`relative z-20 w-[calc(100%-48px)] md:w-[calc(100%-100px)] max-w-[1200px] mx-auto text-white flex flex-col font-sans break-keep pt-5 -translate-y-10`}>
                <div className="flex flex-col md:ml-[150px] w-full max-w-full text-left">
                    
                    {/* 0. Moat Popping Header (맨 마지막 액션 시 밀어내며 등장 - 12p Context와 완벽히 동일한 구조) */}
                    <div 
                        className={`overflow-hidden transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 7 ? 'max-h-[150px] opacity-100 mb-[44px] md:mb-[60px]' : 'max-h-0 opacity-0 mb-0'}`}
                    >
                        <div 
                            className={`text-[55px] md:text-[75px] lg:text-[95px] font-medium text-white transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${step >= 7 ? 'translate-y-0' : 'translate-y-12'}`}
                            style={{ 
                                fontFamily: "'Sanomat Wp', 'Sanomat Web', 'Sanomat', sans-serif",
                                letterSpacing: "-0.01em",
                                WebkitFontSmoothing: "antialiased",
                                textRendering: "optimizeLegibility",
                            }}
                        >
                            Moat
                        </div>
                    </div>

                    {/* 1. Main Heading */}
                    <h2 
                        className={`text-[26px] md:text-[34px] lg:text-[42px] font-bold tracking-tight mb-14 transition-all duration-1000 ease-out ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        {lang === 'kr' ? (
                            <>데이터에 맥락이 쌓이면 해자(Moat)가 됩니다.</>
                        ) : (
                            <>Accumulated context over data becomes a Moat.</>
                        )}
                    </h2>

                    {/* 2. Question & Quotes Box */}
                    <div className={`flex flex-col mb-12 transition-all duration-1000 ease-out ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <p className={`text-[15px] md:text-[17px] lg:text-[19px] font-medium text-[#a1a1a6] mb-4`}>
                            {lang === 'kr' ? (
                                <>현재 이지스는 어떤 상태입니까?</>
                            ) : (
                                <>What is the current state of IGIS?</>
                            )}
                        </p>
                        <p className={`text-[18px] md:text-[22px] lg:text-[26px] font-bold text-white leading-[1.6] transition-all duration-1000 ease-out ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            {lang === 'kr' ? (
                                <>
                                    "어떤 파트너사가 정치적으로 민감한지"<br className="hidden lg:block"/>
                                    "어떤 딜(Deal) 구조가 과거에 왜 실패했는지"<br className="hidden lg:block"/>
                                    "어떤 프로젝트는 무슨 문제를 어떻게 해결하고 극복해내었는지"
                                </>
                            ) : (
                                <>
                                    "Which partner is politically sensitive?"<br className="hidden lg:block"/>
                                    "Why did a specific deal structure fail in the past?"<br className="hidden lg:block"/>
                                    "How a certain project resolved and overcame its issues"
                                </>
                            )}
                        </p>
                    </div>

                    {/* 3. Paragraph 1 */}
                    <p 
                        className={`text-[16px] md:text-[18px] lg:text-[20px] font-medium text-[#d2d2d7] leading-[1.65] mb-12 transition-all duration-1000 ease-out ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        {lang === 'kr' ? (
                            <>
                                이지스를 100조원 매출 운용사로 만든 진짜 '맥락(Institutional Knowledge)'은 서버에 존재하지 않습니다.<br className="hidden lg:block"/>
                                오직 500명 운용역들의 '머릿속과 개인 PC'에만 흩어져 있습니다.
                            </>
                        ) : (
                            <>
                                The true 'Institutional Knowledge' that built IGIS into a 100-trillion-won firm does not exist on a server.<br className="hidden lg:block"/>
                                It is scattered solely across the minds and personal PCs of its 500 professionals.
                            </>
                        )}
                    </p>

                    {/* 4. Paragraph 2 (Underline emphasis) */}
                    <p 
                        className={`text-[16px] md:text-[18px] lg:text-[20px] font-medium text-[#d2d2d7] leading-[1.7] mb-12 transition-all duration-1000 ease-out ${step >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        {lang === 'kr' ? (
                            <>
                                직원들에게 AI 툴 사용법(Prompt)을 교육하는 것은 해답이 아닙니다.<br className="hidden lg:block"/>
                                툴을 쥐여주기 전에, AI가 안전하고 똑똑하게 뛰어놀 수 있는 <span className="relative inline-block font-bold text-white pb-[1px]">
                                    '이지스만의 거대한 맥락의 판(Context Graph)'
                                    <span className={`absolute bottom-[2px] md:bottom-[4px] left-0 h-[1px] md:h-[2px] bg-white -z-10 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${step >= 7 ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
                                </span>을 먼저 깔아주어야 합니다.
                            </>
                        ) : (
                            <>
                                Training employees on how to use AI tools (Prompt Engineering) is not the answer.<br className="hidden lg:block"/>
                                Before handing them the tools, we must first lay down <span className="relative inline-block font-bold text-white pb-[1px]">
                                    'IGIS's massive Context Graph'
                                    <span className={`absolute bottom-[2px] md:bottom-[4px] left-0 h-[1px] md:h-[2px] bg-white -z-10 transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${step >= 7 ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></span>
                                </span> where AI can operate securely and intelligently.
                            </>
                        )}
                    </p>

                    {/* 5. Conclusion point */}
                    <p 
                        className={`text-[16px] md:text-[18px] lg:text-[20px] font-medium text-[#d2d2d7] leading-[1.65] transition-all duration-1000 ease-out ${step >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        {lang === 'kr' ? (
                            <>바로, 우리가 데이터 플랫폼을 구축해야 하는 이유입니다.</>
                        ) : (
                            <>This is exactly why we must build a data platform.</>
                        )}
                    </p>

                </div>
            </div>
        </section>
    );
}
